package auth

import (
	"net/http"

	"github.com/TrySquadDF/formify/api-gql/internal/auth"
	"github.com/TrySquadDF/formify/api-gql/internal/entity"
	"github.com/TrySquadDF/formify/api-gql/internal/server"
	"github.com/TrySquadDF/formify/api-gql/internal/services/users"
	"github.com/TrySquadDF/formify/lib/config"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/fx"
)

type AuthOpts struct {
	fx.In

	Server      *server.Server
	UserService *users.Service
	Auth        *auth.Auth
}

type RegisterRequest struct {
    Email       string `json:"email" binding:"required,email,min=5"`
    Password    string `json:"password" binding:"required,min=6"`
    DisplayName string `json:"displayName" binding:"required"`
}

type LoginRequest struct {
    Email       string `json:"email" binding:"required,email,min=5"`
    Password    string `json:"password" binding:"required,min=6"`
}

func New(opts AuthOpts, cfg config.Config) {
	opts.Server.POST("/auth/register", func(ctx *gin.Context) {
		var req RegisterRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		existingUser, _ := opts.UserService.FindUserByEmail(ctx.Request.Context(), req.Email)
		if existingUser != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "User with this email already exists"})
			return
		}

		passwordHash, err := opts.Auth.HashPassword(req.Password)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
			return
		}

		createdUser, err := opts.UserService.CreateUser(ctx.Request.Context(), entity.Users{
			ID:           uuid.New().String(),
			Email:        req.Email,
			DisplayName:  req.DisplayName,
			PasswordHash: passwordHash,
		})

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}

		opts.Auth.Put(ctx.Request.Context(), "dbUser", *createdUser)
		ctx.JSON(http.StatusOK, gin.H{"redirect": true})
	})

	opts.Server.POST("/auth/login", func(ctx *gin.Context) {
		var req LoginRequest
		if err := ctx.ShouldBindJSON(&req); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		user, err := opts.Auth.AuthenticateWithEmailPassword(ctx.Request.Context(), req.Email, req.Password)
		if (err != nil || user == nil) {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		opts.Auth.Put(ctx.Request.Context(), "dbUser", *user)
		ctx.JSON(http.StatusOK, gin.H{"data": entity.UserInfo{
			ID:          user.ID,
			Email:       user.Email,
			DisplayName: user.DisplayName,
			Picture:     user.Picture,
			IsBanned:    user.IsBanned,
			GoogleID:    user.GoogleID,
			Forms:       user.Forms,
		}})
	})

	opts.Server.GET("/auth/session", func(ctx *gin.Context) {
		user, _ := opts.Auth.GetAuthenticatedUser(ctx.Request.Context())
		ctx.JSON(http.StatusOK, gin.H{"data": user})
	})
}
