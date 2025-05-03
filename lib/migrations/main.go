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

	if err := db.AutoMigrate(&model.Users{}, &model.Tokens{},
		&model.Form{}, &model.Question{}, &model.Option{}, &model.FormResponse{},
		&model.Answer{}, &model.AnswerOption{}); err != nil {
		log.Fatal("failed to migrate:", err)
	}
}
