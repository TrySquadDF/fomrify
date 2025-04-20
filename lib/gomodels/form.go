package model

import (
	"time"
)

// Тип доступа к форме
type FormAccess string

const (
    FormAccessPrivate   FormAccess = "private"
    FormAccessByLink    FormAccess = "by_link"
    FormAccessPublic    FormAccess = "public"
)

// Типы вопросов
type QuestionType string

const (
    QuestionTypeShortText      QuestionType = "short_text"
    QuestionTypeParagraph      QuestionType = "paragraph"
    QuestionTypeBoolean        QuestionType = "boolean"
    QuestionTypeNumber         QuestionType = "number"
    QuestionTypePhone          QuestionType = "phone"
    QuestionTypeDate           QuestionType = "date"
    QuestionTypeEmail          QuestionType = "email"
    QuestionTypeSingleChoice   QuestionType = "single_choice"
    QuestionTypeMultipleChoice QuestionType = "multiple_choice"
)

// Форма
type Form struct {
    ID          string      `gorm:"column:id;primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
    OwnerID     string      `gorm:"column:owner_id;type:uuid;not null;index" json:"ownerId"`
    Title       string      `gorm:"column:title;type:varchar(255)" json:"title"`
    Description string      `gorm:"column:description;type:text" json:"description"`
    Access      FormAccess  `gorm:"column:access;type:varchar(16);default:'private'" json:"access"`
    CreatedAt   time.Time   `gorm:"column:createdAt;type:timestamp;default:current_timestamp" json:"createdAt"`
    UpdatedAt   time.Time   `gorm:"column:updatedAt;type:timestamp;default:current_timestamp" json:"updatedAt"`
    Questions   []Question  `gorm:"foreignKey:FormID" json:"questions"`
}

func (Form) TableName() string {
    return "forms"
}

// Вопрос
type Question struct {
    ID        string       `gorm:"column:id;primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
    FormID    string       `gorm:"column:form_id;type:uuid;not null;index" json:"formId"`
    Text      string       `gorm:"column:text;type:text" json:"text"`
    Type      QuestionType `gorm:"column:type;type:varchar(32)" json:"type"`
    Required  bool         `gorm:"column:required;default:false" json:"required"`
    Order     int          `gorm:"column:order" json:"order"`
    Options   []Option     `gorm:"foreignKey:QuestionID" json:"options,omitempty"` // для single/multiple choice
}

func (Question) TableName() string {
    return "questions"
}

// Варианты ответа (для single/multiple choice)
type Option struct {
    ID         string `gorm:"column:id;primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
    QuestionID string `gorm:"column:question_id;type:uuid;not null;index" json:"questionId"`
    Text       string `gorm:"column:text;type:text" json:"text"`
    Order      int    `gorm:"column:order" json:"order"`
}

func (Option) TableName() string {
    return "options"
}