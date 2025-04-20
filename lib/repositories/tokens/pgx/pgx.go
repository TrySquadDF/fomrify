package pgx

import (
	"context"

	model "github.com/TrySquadDF/formify/lib/gomodels"
	"github.com/TrySquadDF/formify/lib/repositories/tokens"
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

var _ tokens.Repository = (*Pgx)(nil)

type Pgx struct {
	pool *pgxpool.Pool
}

func (r *Pgx) CreateTokens(ctx context.Context, tokens model.Tokens) (*model.Tokens, error) {
	query := `
		INSERT INTO tokens ("accessToken", "refreshToken", "expiresIn", "obtainmentTimestamp", scopes)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, "accessToken", "refreshToken", "expiresIn", "obtainmentTimestamp", scopes
	`

	rows, err := r.pool.Query(ctx, query,
		tokens.AccessToken,
		tokens.RefreshToken,
		tokens.ExpiresIn,
		tokens.ObtainmentTimestamp,
		tokens.Scopes)
		
	if err != nil {
		return nil, err
	}

	createdTokens, err := pgx.CollectExactlyOneRow(rows, pgx.RowToStructByName[model.Tokens])
	if err != nil {
		return nil, err
	}

	return &createdTokens, nil
}
