package users

import (
	"context"

	"github.com/TrySquadDF/formify/api-gql/internal/entity"
	"github.com/TrySquadDF/formify/api-gql/internal/services/tokens"
	gomodel "github.com/TrySquadDF/formify/lib/gomodels"
	"go.uber.org/fx"
	"gorm.io/gorm"
)

type Opts struct {
	fx.In

	Database        *gorm.DB
	TokensService   *tokens.Service
}
type Service struct {
	database        *gorm.DB
	tokensService   *tokens.Service
}

func New(opts Opts) *Service {
	return &Service{
		database:        opts.Database,
		tokensService:   opts.TokensService,
	}
}

func (c *Service) FindByGoogleID(ctx context.Context, googleID string) (*gomodel.Users, error) {
    var user gomodel.Users
    result := c.database.Preload("Token").Where("\"googleId\" = ?", googleID).First(&user)
    
    if result.Error != nil {
        if result.Error == gorm.ErrRecordNotFound {
            return nil, nil
        }
        return nil, result.Error
    }
    
    return &user, nil
}

func (c *Service) CreateUser(ctx context.Context, user entity.Users) (*gomodel.Users, error) {
    tokens, err := c.tokensService.Create(ctx, user.ID)
    if err != nil {
        return nil, err
    }
    
    userModel := &gomodel.Users{
        ID:        user.ID,
        Email:     user.Email,
        DisplayName: user.DisplayName,
        GoogleID:  user.GoogleID,
        Picture:   user.Picture,
        TokenID:   tokens.ID,
    }
    
    result := c.database.Create(userModel)
    if result.Error != nil {
        return nil, result.Error
    }
    
    return userModel, nil
}
