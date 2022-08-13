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
	r.SetTrustedProxies(nil)
	r.Use(sessions.Sessions("authsession", store))

	r.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusFound, "https://github.com/rorre/osu-discussion-votes")
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
