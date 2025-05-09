package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/TrySquadDF/formify/api-gql/internal/server/middleware"
	"github.com/TrySquadDF/formify/api-gql/internal/services/tokens"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/TrySquadDF/formify/api-gql/internal/services/users"
	"github.com/TrySquadDF/formify/lib/config"
	"github.com/TrySquadDF/formify/lib/google"

	"github.com/TrySquadDF/formify/api-gql/internal/auth"
	"github.com/TrySquadDF/formify/api-gql/internal/delivery/gql"
	"github.com/TrySquadDF/formify/api-gql/internal/delivery/gql/directives"
	"github.com/TrySquadDF/formify/api-gql/internal/delivery/gql/resolvers"
	oauth "github.com/TrySquadDF/formify/api-gql/internal/delivery/http/auth"
	"github.com/TrySquadDF/formify/api-gql/internal/delivery/http/oauth2"
	"github.com/TrySquadDF/formify/api-gql/internal/server"

	"github.com/redis/go-redis/extra/redisotel/v9"
	"github.com/redis/go-redis/v9"
	"github.com/uptrace/opentelemetry-go-extra/otelgorm"
	"go.uber.org/fx"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

func newGorm(
	cfg config.Config,
	lc fx.Lifecycle,
) (*gorm.DB, error) {
	newLogger := gormlogger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		gormlogger.Config{
			SlowThreshold:             100 * time.Millisecond,
			LogLevel:                  gormlogger.Error,
			IgnoreRecordNotFoundError: true,
			ParameterizedQueries:      true,
			Colorful:                  true,
		},
	)

	db, err := gorm.Open(
		postgres.Open(cfg.DatabaseUrl),
		&gorm.Config{
			Logger:                 newLogger,
			SkipDefaultTransaction: true,
		},
	)
	if err != nil {
		return nil, err
	}
	d, _ := db.DB()
	d.SetMaxIdleConns(1)
	d.SetMaxOpenConns(10)
	d.SetConnMaxLifetime(time.Hour)

	if err := db.Use(otelgorm.NewPlugin()); err != nil {
		return nil, err
	}

	lc.Append(
		fx.Hook{
			OnStop: func(_ context.Context) error {
				return d.Close()
			},
		},
	)

	return db, nil
}

func newRedis(cfg config.Config) (*redis.Client, error) {
	redisOpts, err := redis.ParseURL(cfg.RedisUrl)
	if err != nil {
		return nil, err
	}
	redisClient := redis.NewClient(redisOpts)

	if err := redisotel.InstrumentTracing(redisClient); err != nil {
		return nil, err
	}

	if err := redisotel.InstrumentMetrics(redisClient); err != nil {
		return nil, err
	}

	return redisClient, nil
}

func newPgxPool(cfg config.Config) (*pgxpool.Pool, error) {
	pool, err := pgxpool.New(context.Background(), cfg.DatabaseUrl)
	if err != nil {
		return nil, err
	}
	return pool, nil
}

func main() {
	app := fx.New(
		fx.Provide(
			users.New,
			tokens.New,
		),
		fx.Provide(
			config.NewFx,
			newGorm,
			newRedis,
			newPgxPool,
			google.NewOAuth2Config,
			directives.New,
			middleware.New,
			auth.NewSessions,
			resolvers.New,
			server.New,
		),
		fx.Invoke(
			gql.New,
			oauth2.New,
			oauth.New,
		),
	)

	app.Run()
}
