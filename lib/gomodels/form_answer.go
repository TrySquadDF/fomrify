package model

import (
	"time"
)

type FormResponse struct {
    ID        string    `gorm:"column:id;primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
    FormID    string    `gorm:"column:form_id;type:uuid;not null;index" json:"formId"`
    CreatedAt time.Time `gorm:"column:created_at;type:timestamp;default:current_timestamp" json:"createdAt"`
    Answers   []Answer  `gorm:"foreignKey:ResponseID" json:"answers"`
}

func (FormResponse) TableName() string {
    return "form_responses"
}

type Answer struct {
    ID          string `gorm:"column:id;primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
    ResponseID  string `gorm:"column:response_id;type:uuid;not null;index" json:"responseId"`
    QuestionID  string `gorm:"column:question_id;type:uuid;not null;index" json:"questionId"`
    TextValue   string `gorm:"column:text_value;type:text" json:"textValue"`
    BoolValue   *bool  `gorm:"column:bool_value" json:"boolValue,omitempty"`
    NumberValue *float64 `gorm:"column:number_value" json:"numberValue,omitempty"`
    DateValue   *time.Time `gorm:"column:date_value" json:"dateValue,omitempty"`
    OptionIDs   []string `gorm:"-" json:"optionIds,omitempty"`
}

func (Answer) TableName() string {
    return "answers"
}

type AnswerOption struct {
    ID        string `gorm:"column:id;primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
    AnswerID  string `gorm:"column:answer_id;type:uuid;not null;index" json:"answerId"`
    OptionID  string `gorm:"column:option_id;type:uuid;not null;index" json:"optionId"`
}

func (AnswerOption) TableName() string {
    return "answer_options"
}