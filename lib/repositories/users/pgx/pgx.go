package pgx

import (
	"context"
	"errors"

	"github.com/TrySquadDF/formify/lib/repositories/users"
	"github.com/TrySquadDF/formify/lib/repositories/users/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Opts struct {
	PgxPool *pgxpool.Pool
}

func New(opts Opts) *Pgx {
	return &Pgx{
		pool: opts.PgxPool,
	}
}

func NewFx(pool *pgxpool.Pool) *Pgx {
	return New(Opts{PgxPool: pool})
}

var _ users.Repository = (*Pgx)(nil)

type Pgx struct {
	pool *pgxpool.Pool
}

func (r *Pgx) FindByGoogleID(ctx context.Context, googleID string) (*model.Users, error) {
	query := `
        SELECT id, email, "displayName", picture, "googleId", "isBanned", "tokenId", "createdAt", "updatedAt"
        FROM users 
        WHERE "googleId" = $1
    `

	rows, err := r.pool.Query(ctx, query, googleID)
	if err != nil {
		return nil, err
	}

	user, err := pgx.CollectExactlyOneRow(rows, pgx.RowToStructByName[model.Users])
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *Pgx) CreateUser(ctx context.Context, user model.Users) (*model.Users, error) {
	query := `
		INSERT INTO users (email, "displayName", picture, "googleId", "tokenId", "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, now(), now())
		RETURNING id, email, "displayName", picture, "googleId", "isBanned", "tokenId", "createdAt", "updatedAt"
	`

	rows, err := r.pool.Query(ctx, query,
		user.Email,
		user.DisplayName,
		user.Picture,
		user.GoogleID,
		user.TokenID,
	)
	if err != nil {
		return nil, err
	}

	createdUser, err := pgx.CollectExactlyOneRow(rows, pgx.RowToStructByName[model.Users])
	if err != nil {
		return nil, err
	}

	return &createdUser, nil
}
