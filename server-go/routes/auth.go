package routes

import (
	"context"
	"encoding/json"
	"io"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
)

var oauthCfg *oauth2.Config

// Start of SO code
// https://stackoverflow.com/a/31832326
// Only used to generate state
const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const (
	letterIdxBits = 6                    // 6 bits to represent a letter index
	letterIdxMask = 1<<letterIdxBits - 1 // All 1-bits, as many as letterIdxBits
	letterIdxMax  = 63 / letterIdxBits   // # of letter indices fitting in 63 bits
)

var src = rand.NewSource(time.Now().UnixNano())

func RandString(n int) string {
	sb := strings.Builder{}
	sb.Grow(n)
	// A src.Int63() generates 63 random bits, enough for letterIdxMax characters!
	for i, cache, remain := n-1, src.Int63(), letterIdxMax; i >= 0; {
		if remain == 0 {
			cache, remain = src.Int63(), letterIdxMax
		}
		if idx := int(cache & letterIdxMask); idx < len(letterBytes) {
			sb.WriteByte(letterBytes[idx])
			i--
		}
		cache >>= letterIdxBits
		remain--
	}

	return sb.String()
}

// End of SO code

// Really minimal, we only care about the user id
type User struct {
	ID uint `json:"id"`
}

func SetupOAuthConfig() {
	oauthCfg = &oauth2.Config{
		ClientID:     os.Getenv("OSU_CLIENT_ID"),
		ClientSecret: os.Getenv("OSU_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("REDIRECT_URL"),
		Scopes:       []string{"identify"},
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://osu.ppy.sh/oauth/authorize",
			TokenURL: "https://osu.ppy.sh/oauth/token",
		},
	}
}

func RedirectAuth(c *gin.Context) {
	session := sessions.Default(c)
	v := session.Get("user_id")
	if v != nil {
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.String(http.StatusOK, `
		<script>
		function getCookie(cname) {
			let name = cname + "=";
			let decodedCookie = decodeURIComponent(document.cookie);
			let ca = decodedCookie.split(';');
			for(let i = 0; i <ca.length; i++) {
			  let c = ca[i];
			  while (c.charAt(0) == ' ') {
				c = c.substring(1);
			  }
			  if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			  }
			}
			return "";
		}
		setTimeout(() => window.setCookie(getCookie("authsession")), 1000)
		</script>
		You may close this window after the pop up.
		`)
		return
	}

	state := RandString(32)
	redirectUrl := oauthCfg.AuthCodeURL(state)

	session.Set("state", state)
	err := session.Save()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}

	c.Redirect(http.StatusFound, redirectUrl)
}

func Authorize(c *gin.Context) {
	session := sessions.Default(c)
	v := session.Get("user_id")
	if v != nil {
		c.Redirect(http.StatusFound, "/auth")
		return
	}

	v = session.Get("state")
	if v == nil {
		c.JSON(http.StatusBadRequest, gin.H{"data": "missing state in session"})
		return
	}

	expectedState := v.(string)
	state := c.Query("state")
	if state != expectedState {
		c.JSON(http.StatusBadRequest, gin.H{"data": "state mismatch"})
		return
	}

	code := c.Query("code")
	if len(code) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"data": "missing code"})
		return
	}

	ctx := context.Background()
	token, err := oauthCfg.Exchange(ctx, code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"data": "failed to receive token"})
		return
	}

	client := oauthCfg.Client(ctx, token)
	response, err := client.Get("https://osu.ppy.sh/api/v2/me")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"data": "failed to get user info"})
		return
	}

	data, err := io.ReadAll(response.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"data": "failed to read user info"})
		return
	}

	var user User
	err = json.Unmarshal(data, &user)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"data": "failed to read user info"})
		return
	}

	session.Set("user_id", user.ID)
	session.Save()
	c.Redirect(http.StatusFound, "/auth")
}
