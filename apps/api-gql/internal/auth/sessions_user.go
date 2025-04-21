package auth

import (
	"context"
	"fmt"

	model "github.com/TrySquadDF/formify/lib/gomodels"
)

func (s *Auth) GetUserIDFromContext(ctx context.Context) (string, error) {
    user, err := s.GetAuthenticatedUser(ctx)
    if err != nil {
        return "", err
    }
    
    if user.ID == "" {
        return "", fmt.Errorf("user ID is empty")
    }
    
    return user.ID, nil
}

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
	if err := s.gorm.Where("id = ?", user.ID).First(&freshUser).Error; err != nil {
		return nil, fmt.Errorf("cannot get user from db: %w", err)
	}

	return &freshUser, nil
}

func (s *Auth) SessionLogout(ctx context.Context) error {
	return s.sessionManager.Destroy(ctx)
}
	