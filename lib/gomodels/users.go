package model

import (
	"time"
)

type Users struct {
	ID           string    `gorm:"column:id;primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Forms        []Form    `gorm:"foreignKey:OwnerID" json:"forms,omitempty"`
	Email        string    `gorm:"column:email;type:varchar(255);unique" json:"email"`
	DisplayName  string    `gorm:"column:displayName;type:varchar(255)" json:"displayName"`
	Picture      string    `gorm:"column:picture;type:text" json:"picture"`
	GoogleID     string    `gorm:"column:googleId;type:varchar(255)" json:"googleId"`
	IsBanned     bool      `gorm:"column:isBanned;default:false" json:"isBanned"`
	TokenID      string    `gorm:"column:tokenId;type:TEXT;"                  json:"tokenId"`
	Token        *Tokens   `gorm:"foreignKey:TokenID"`
	PasswordHash string    `gorm:"column:passwordHash" json:"-"`
	CreatedAt    time.Time `gorm:"column:createdAt;type:timestamp;default:current_timestamp" json:"createdAt"`
	UpdatedAt    time.Time `gorm:"column:updatedAt;type:timestamp;default:current_timestamp" json:"updatedAt"`
}

func (Users) TableName() string {
	return "users"
}

