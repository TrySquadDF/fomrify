package tokens

import (
	"context"
	"time"

	"github.com/TrySquadDF/formify/crypto"
	"github.com/TrySquadDF/formify/lib/config"
	"github.com/TrySquadDF/formify/lib/repositories/tokens"

	model "github.com/TrySquadDF/formify/lib/gomodels"
	"go.uber.org/fx"
)

type Opts struct {
	fx.In

	TokensRepository tokens.Repository
	Config           config.Config
}
type Service struct {
	tokensRepository tokens.Repository
	config           config.Config
}

func New(opts Opts) *Service {
	return &Service{
		tokensRepository: opts.TokensRepository,
		config:           opts.Config,
	}
}

func (c *Service) Encrypt(data string) (string, error) {
	return crypto.Encrypt(data, c.config.CYPHER_KEY)
}

func (c *Service) Create(ctx context.Context, ID string) (*model.Tokens, error) {
	accessToken, err := c.Encrypt(ID)
	if err != nil {
		return nil, err
	}

	refreshToken, err := c.Encrypt(ID)
	if err != nil {
		return nil, err
	}

	return c.tokensRepository.CreateTokens(ctx, model.Tokens{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ObtainmentTimestamp: time.Now(),
		ExpiresIn:    60 * 60 * 24 * 7,
	})
}
