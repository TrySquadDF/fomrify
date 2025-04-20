package users

import (
	"context"
	"log"

	"github.com/TrySquadDF/formify/api-gql/internal/entity"
	"gorm.io/gorm"

	"github.com/TrySquadDF/formify/api-gql/internal/services/tokens"

	gomodel "github.com/TrySquadDF/formify/lib/gomodels"

	"github.com/TrySquadDF/formify/lib/repositories/users/model"
	"go.uber.org/fx"
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
        // Check if it's just a "record not found" error
        if result.Error == gorm.ErrRecordNotFound {
            // Return nil, nil to indicate user not found (or another custom error if preferred)
            return nil, nil
        }
        // For other DB errors, return the error
        return nil, result.Error
    }
    
    // User found, log token ID and return user
    log.Println(user.Token.ID)
    return &user, nil
}

func (c *Service) CreateUser(ctx context.Context, user entity.Users) (*model.Users, error) {
    tokens, err := c.tokensService.Create(ctx, user.ID)
    if err != nil {
        return nil, err
    }
    
    userModel := &model.Users{
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
