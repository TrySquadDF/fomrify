package server

import (
	"context"
	"fmt"

	"github.com/gin-gonic/gin"
	"go.uber.org/fx"
)

type Opts struct {
	fx.In
	LC fx.Lifecycle
}

type Server struct {
	*gin.Engine
}

func New(opts Opts) *Server {
	inst := gin.New()
	srv := &Server{
		inst,
	}

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
