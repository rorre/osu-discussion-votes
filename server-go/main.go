package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
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
	routes.SetupOAuthConfig()

	store := gormsessions.NewStore(models.DB, true, []byte("secret"))
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"https://osu.ppy.sh"}
	config.AllowCredentials = true

	r := gin.Default()
	r.SetTrustedProxies(nil)
	r.Use(sessions.Sessions("authsession", store))
	r.Use(cors.New(config))

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

	// Set up graceful shutdown + start
	// https://github.com/gin-gonic/examples/blob/master/graceful-shutdown/graceful-shutdown/notify-without-context/server.go
	srv := &http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	// Initializing the server in a goroutine so that
	// it won't block the graceful shutdown handling below
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server with
	// a timeout of 5 seconds.
	quit := make(chan os.Signal, 1)
	// kill (no param) default send syscall.SIGTERM
	// kill -2 is syscall.SIGINT
	// kill -9 is syscall.SIGKILL but can't be catch, so don't need add it
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// The context is used to inform the server it has 5 seconds to finish
	// the request it is currently handling
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown: ", err)
	}

	log.Println("Server exiting")
}
