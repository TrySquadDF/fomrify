package server

import (
	"context"
	"fmt"

	"github.com/TrySquadDF/formify/api-gql/internal/auth"
	"github.com/TrySquadDF/formify/api-gql/internal/server/gincontext"
	"github.com/TrySquadDF/formify/api-gql/internal/server/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.uber.org/fx"
)

type Opts struct {
	fx.In
	LC fx.Lifecycle

	Sessions           *auth.Auth
	Middlewares        *middleware.Middleware
}

type Server struct {
	*gin.Engine
}

func New(opts Opts) *Server {
	s := gin.New()
	srv := &Server{
		s,
	}

	s.Use(gin.Logger())

	s.Use(
		cors.New(
			cors.Config{
				AllowOrigins:     []string{"http://localhost:3000", "https://localhost:3000"}, 
				AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
				AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
				ExposeHeaders:    []string{"Content-Length"},
				AllowCredentials: true,
			},
		),
	)

	s.Use(opts.Sessions.Middleware())
	s.Use(gincontext.Middleware())

	opts.LC.Append(
		fx.Hook{
			OnStart: func(ctx context.Context) error {
				go func() {
					fmt.Println("Starting server on :8080")
					if err := srv.RunTLS(":8080", "example.com+5.pem", "example.com+5-key.pem"); err != nil {
						return
					}
				}()
				return nil
			},
		},
	)

	return srv
}
