package resolvers

import (
	"github.com/TrySquadDF/formify/api-gql/internal/auth"
	"go.uber.org/fx"
	"gorm.io/gorm"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Deps struct {
	fx.In

	Sessions             *auth.Auth
	Gorm                 *gorm.DB
}

type Resolver struct {
	deps Deps
}

func New(deps Deps) (*Resolver, error) {
	return &Resolver{
		deps: deps,
	}, nil
}
