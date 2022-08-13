package routes

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/rorre/osu-discussion-votes/server/models"
)

type DiscussionResponse struct {
	ID        uint `json:"id"`
	Upvotes   uint `json:"upvotes"`
	Downvotes uint `json:"downvotes"`
	Vote      int  `json:"vote"`
}

type MapsetResponse struct {
	ID          uint               `json:"id"`
	Discussions DiscussionResponse `json:"discussions"`
}

type VoteRequest struct {
	DiscussionId uint `json:"discussion_id" binding:"required"`
	BeatmapsetId uint `json:"beatmapset_id" binding:"required"`
	Vote         *int `json:"vote" binding:"required"`
}

func VoteDiscussion(c *gin.Context) {
	var data VoteRequest
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	session := sessions.Default(c)
	v := session.Get("user_id")
	if v == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userId := v.(uint)

	var vote models.Vote
	models.DB.Where(&models.Vote{UserID: userId, DiscussionId: data.DiscussionId, MapsetId: data.BeatmapsetId}).FirstOrInit(&vote)

	vote.Vote = *data.Vote
	models.DB.Save(&vote)
	c.JSON(http.StatusOK, vote)
}

func FindMapset(c *gin.Context) {
	session := sessions.Default(c)
	userId := session.Get("user_id")
	mapsetId := c.Param("mapset_id")

	var votes []models.Vote
	models.DB.Where("mapset_id = ?", mapsetId).Find(&votes)

	var discussions = make(map[uint]*DiscussionResponse)
	for _, vote := range votes {
		if _, ok := discussions[vote.DiscussionId]; !ok {
			discussions[vote.DiscussionId] = &DiscussionResponse{
				ID:        vote.DiscussionId,
				Upvotes:   0,
				Downvotes: 0,
				Vote:      0,
			}
		}

		var currentDiscussion = discussions[vote.DiscussionId]
		switch vote.Vote {
		case 1:
			currentDiscussion.Upvotes++
		case -1:
			currentDiscussion.Downvotes++
		}

		if userId != nil && vote.UserID == userId.(uint) {
			currentDiscussion.Vote = vote.Vote
		}
	}

	var discussionArray = make([]*DiscussionResponse, 0, len(discussions))
	for _, elem := range discussions {
		discussionArray = append(discussionArray, elem)
	}
	c.JSON(http.StatusOK, gin.H{"id": mapsetId, "discussions": discussionArray})
}
