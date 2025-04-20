package auth

import (
	"context"
	"fmt"

	"github.com/TrySquadDF/formify/api-gql/internal/server/gincontext"

	model "github.com/TrySquadDF/formify/lib/gomodels"
)

func (s *Auth) GetAuthenticatedUserByApiKey(ctx context.Context) (*model.Users, error) {
	var apiKey string

	wsApiKey, _ := s.getWsAuthenticatedApiKey(ctx)
	if wsApiKey != "" {
		apiKey = wsApiKey
	} else {
		ginCtx, err := gincontext.GetGinContext(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to get gin context: %w", err)
		}

		apiKey = ginCtx.GetHeader("api-key")
	}

	if apiKey == "" {
		return nil, fmt.Errorf("api key is required")
	}

	user := model.Users{}
	if err := s.gorm.Where(`"apiKey" = ?`, apiKey).First(&user).Error; err != nil {
		return nil, fmt.Errorf("cannot get user from db: %w", err)
	}

	return &user, nil
}
