package models

import (
	"gorm.io/gorm"
)

type Vote struct {
	gorm.Model
	Vote int

	MapsetId     uint `gorm:"uniqueIndex:mapset_discussion_user_idx;index:mapset_idx"`
	DiscussionId uint `gorm:"uniqueIndex:mapset_discussion_user_idx"`
	UserID       uint `gorm:"uniqueIndex:mapset_discussion_user_idx"`
}
