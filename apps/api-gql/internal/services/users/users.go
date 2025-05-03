package users

import (
	"context"
	"fmt"

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

// findUserByField - приватный метод для поиска пользователя по заданному полю
func (c *Service) findUserByField(ctx context.Context, fieldName string, value interface{}) (*gomodel.Users, error) {
    var user gomodel.Users
    // Используем fmt.Sprintf для безопасного формирования имени поля в запросе
    // Важно: fieldName должен быть доверенным значением (не из пользовательского ввода напрямую)
    // чтобы избежать SQL-инъекций. В данном случае "googleId" и "email" безопасны.
    query := fmt.Sprintf("\"%s\" = ?", fieldName)
    result := c.database.WithContext(ctx).Preload("Token").Where(query, value).First(&user)

    if result.Error != nil {
        if result.Error == gorm.ErrRecordNotFound {
            return nil, nil // Пользователь не найден, это не ошибка в данном контексте
        }
        // Возвращаем ошибку базы данных
        return nil, result.Error
    }

    return &user, nil
}

func (c *Service) FindByGoogleID(ctx context.Context, googleID string) (*gomodel.Users, error) {
    return c.findUserByField(ctx, "googleId", googleID)
}

func (c *Service) FindUserByEmail(ctx context.Context, email string) (*gomodel.Users, error) {
    return c.findUserByField(ctx, "email", email)
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
        PasswordHash: user.PasswordHash,
    }
    
    result := c.database.Create(userModel)
    if result.Error != nil {
        return nil, result.Error
    }
    
    return userModel, nil
}
