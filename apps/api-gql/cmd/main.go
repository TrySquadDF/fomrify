package main

import (
	"github.com/TrySquadDF/formify/api-gql/internal/delivery/gql"
	"github.com/TrySquadDF/formify/api-gql/internal/server"
	"go.uber.org/fx"
)

func main() {
	app := fx.New(
		fx.Provide(
			server.New,
		),
		fx.Invoke(
			gql.New,
		),
	)

	app.Run()
}
