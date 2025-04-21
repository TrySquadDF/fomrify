package tokens

import (
	"context"
	"time"

	"github.com/TrySquadDF/formify/crypto"
	"github.com/TrySquadDF/formify/lib/config"

	model "github.com/TrySquadDF/formify/lib/gomodels"
	"go.uber.org/fx"
	"gorm.io/gorm"
)

type Opts struct {
    fx.In

    Database *gorm.DB
    Config   config.Config
}

type Service struct {
    database *gorm.DB
    config   config.Config
}

func New(opts Opts) *Service {
    return &Service{
        database: opts.Database,
        config:   opts.Config,
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

    // Создаем запись токена через GORM
    token := &model.Tokens{
        AccessToken:         accessToken,
        RefreshToken:        refreshToken,
        ObtainmentTimestamp: time.Now(),
        ExpiresIn:           60 * 60 * 24 * 7, // 7 дней в секундах
    }
    
    result := c.database.Create(token)
    if result.Error != nil {
        return nil, result.Error
    }
    
    return token, nil
}