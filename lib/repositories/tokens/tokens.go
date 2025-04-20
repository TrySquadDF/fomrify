package tokens

import (
	"context"
	model "github.com/TrySquadDF/formify/lib/gomodels"
)

type Repository interface {
	CreateTokens(ctx context.Context, tokens model.Tokens) (*model.Tokens, error)
}
