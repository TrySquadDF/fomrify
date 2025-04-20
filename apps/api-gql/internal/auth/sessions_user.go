package auth

import (
	"context"
	"fmt"

	model "github.com/TrySquadDF/formify/lib/gomodels"
)

func (s *Auth) GetAuthenticatedUser(ctx context.Context) (*model.Users, error) {
	userByApyKey, err := s.GetAuthenticatedUserByApiKey(ctx)
	if err == nil {
		return userByApyKey, nil
	}

	user, ok := s.sessionManager.Get(ctx, "dbUser").(model.Users)
	if !ok {
		return nil, fmt.Errorf("not authenticated")
	}

	freshUser := model.Users{}
	if err := s.gorm.First(&freshUser, user.ID).Error; err != nil {
		return nil, fmt.Errorf("cannot get user from db: %w", err)
	}

	return &freshUser, nil
}
