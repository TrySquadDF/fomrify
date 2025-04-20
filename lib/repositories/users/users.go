package users

import (
	"context"

	"github.com/TrySquadDF/formify/lib/repositories/users/model"
)

type Repository interface {
	FindByGoogleID(ctx context.Context, googleID string) (*model.Users, error)
	CreateUser(ctx context.Context, user model.Users) (*model.Users, error)
}
