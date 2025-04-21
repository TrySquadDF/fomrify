package middleware

import (
	"github.com/TrySquadDF/formify/api-gql/internal/auth"
	"go.uber.org/fx"
)

type Opts struct {
	fx.In

	Sessions *auth.Auth
}

func New(opts Opts) *Middleware {
	return &Middleware{
		sessions: opts.Sessions,
	}
}

type Middleware struct {
	sessions *auth.Auth
}