package main

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	gormsessions "github.com/gin-contrib/sessions/gorm"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/rorre/osu-discussion-votes/server/models"
	"github.com/rorre/osu-discussion-votes/server/routes"
)

func main() {
	godotenv.Load()
	models.ConnectDatabase()
	routes.SetupConfig()
	store := gormsessions.NewStore(models.DB, true, []byte("secret"))

	r := gin.Default()
	r.Use(sessions.Sessions("authsession", store))

	r.GET("/", func(c *gin.Context) {
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
	})

	auth := r.Group("/auth")
	{
		auth.GET("/", routes.RedirectAuth)
		auth.GET("/callback", routes.Authorize)
	}

	vote := r.Group("/vote")
	{
		vote.GET("/mapset/:mapset_id", routes.FindMapset)
		vote.POST("/:discussion_id", routes.VoteDiscussion)
	}

	r.Run()
}
