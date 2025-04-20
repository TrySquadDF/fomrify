package main

import (
	"log"

	"github.com/TrySquadDF/formify/lib/config"
	model "github.com/TrySquadDF/formify/lib/gomodels"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	cfg, err := config.New()
	if err != nil {
		panic(err)
	}

	db, err := gorm.Open(postgres.Open(cfg.DatabaseUrl), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database:", err)
	}

	if err := db.AutoMigrate(&model.Users{}, &model.Tokens{}, &model.Form{}, &model.Question{}, &model.Option{}); err != nil {
		log.Fatal("failed to migrate:", err)
	}

	// // Создание тестовой формы с вопросами и вариантами
	// testForm := model.Form{ // UUID сгенерируется автоматически
	// 	OwnerID:     "e7e1c1a2-1234-4bcd-9f8a-abcdef123456", // подставьте существующий id пользователя
	// 	Title:       "Тестовая форма",
	// 	Description: "Описание тестовой формы",
	// 	Access:      model.FormAccessPrivate,
	// 	Questions: []model.Question{
	// 		{
	// 			Text:     "Ваш email?",
	// 			Type:     model.QuestionTypeEmail,
	// 			Required: true,
	// 			Order:    1,
	// 		},
	// 		{
	// 			Text:     "Выберите любимый цвет",
	// 			Type:     model.QuestionTypeSingleChoice,
	// 			Required: false,
	// 			Order:    2,
	// 			Options: []model.Option{
	// 				{Text: "Красный", Order: 1},
	// 				{Text: "Синий", Order: 2},
	// 				{Text: "Зеленый", Order: 3},
	// 			},
	// 		},
	// 	},
	// }

	// if err := db.Create(&testForm).Error; err != nil {
	// 	log.Fatal("failed to create test form:", err)
	// }

	// var forms []model.Form
	// ownerID := "e7e1c1a2-1234-4bcd-9f8a-abcdef123456"
	// err = db.Preload("Questions.Options").Where("owner_id = ?", ownerID).Find(&forms).Error
	// if err != nil {
	// 	log.Fatal("failed to fetch forms:", err)
	// }

	// enc := json.NewEncoder(os.Stdout)
	// enc.SetIndent("", "  ")
	// if err := enc.Encode(forms); err != nil {
	// 	log.Fatal("failed to encode forms to JSON:", err)
	// }

}
