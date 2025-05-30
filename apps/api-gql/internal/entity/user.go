package entity

import model "github.com/TrySquadDF/formify/lib/gomodels"

type Users struct {
	ID           string `gorm:"column:id;primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Forms        string `gorm:"column:forms;type:text" json:"forms"`
	Email        string `gorm:"column:email;type:varchar(255);unique" json:"email"`
	DisplayName  string `gorm:"column:displayName;type:varchar(255)" json:"displayName"`
	Picture      string `gorm:"column:picture;type:text" json:"picture"`
	GoogleID     string `gorm:"column:googleId;type:varchar(255);unique" json:"googleId"`
	IsBanned     bool   `gorm:"column:isBanned;default:false" json:"isBanned"`
	PasswordHash string `gorm:"column:passwordHash" json:"-"`
}

type UserInfo struct {
	ID          string `gorm:"column:id;primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Forms       []model.Form `gorm:"column:forms;type:text" json:"forms"`
	Email       string `gorm:"column:email;type:varchar(255);unique" json:"email"`
	DisplayName string `gorm:"column:displayName;type:varchar(255)" json:"displayName"`
	Picture     string `gorm:"column:picture;type:text" json:"picture"`
	GoogleID    string `gorm:"column:googleId;type:varchar(255);unique" json:"googleId"`
	IsBanned    bool   `gorm:"column:isBanned;default:false" json:"isBanned"`
}

// export type User = {
// 	__typename?: 'User';
// 	displayName: Scalars['String']['output'];
// 	email: Scalars['String']['output'];
// 	forms: Array<Form>;
// 	googleId: Scalars['String']['output'];
// 	id: Scalars['ID']['output'];
// 	isBanned: Scalars['Boolean']['output'];
// 	picture: Scalars['String']['output'];
//   };