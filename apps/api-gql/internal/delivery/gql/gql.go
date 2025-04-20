package gql

import (
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/TrySquadDF/formify/api-gql/internal/delivery/gql/graph"
	"github.com/TrySquadDF/formify/api-gql/internal/delivery/gql/resolvers"
	"github.com/TrySquadDF/formify/api-gql/internal/server"
	"github.com/gin-gonic/gin"
	"go.uber.org/fx"
)

type Opts struct {
	fx.In

	Resolver *resolvers.Resolver
	Server   *server.Server
}

func New(opts Opts) *handler.Server {
	graphConfig := graph.Config{
		Resolvers: opts.Resolver,
	}
	
	schema := graph.NewExecutableSchema(graphConfig)
	srv := handler.New(schema)

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})
	srv.AddTransport(transport.MultipartForm{})

	playgroundHandler := playground.Handler("GraphQL playground", "/query")

	
	srv.Use(extension.Introspection{})

	opts.Server.Any("/", func(context *gin.Context) {
		playgroundHandler.ServeHTTP(context.Writer, context.Request)
	})

	opts.Server.Any("/query", func(context *gin.Context) {
		srv.ServeHTTP(context.Writer, context.Request)
	})

	return srv
}
