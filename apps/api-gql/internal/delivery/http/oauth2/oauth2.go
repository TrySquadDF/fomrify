package oauth2

import (
	"net/http"

	"github.com/TrySquadDF/formify/api-gql/internal/auth"
	"github.com/TrySquadDF/formify/api-gql/internal/delivery/gql/resolvers"
	"github.com/TrySquadDF/formify/api-gql/internal/entity"
	"github.com/TrySquadDF/formify/api-gql/internal/server"
	"github.com/TrySquadDF/formify/api-gql/internal/services/users"
	"github.com/TrySquadDF/formify/lib/config"
	"github.com/TrySquadDF/formify/lib/google"
	"github.com/gin-gonic/gin"
	"go.uber.org/fx"
)

type GoogleOpts struct {
	fx.In

	UserService *users.Service
	Resolver    *resolvers.Resolver
	Server      *server.Server
	Auth        *auth.Auth 
}

func New(opts GoogleOpts, cfg config.Config, gcfg google.GoogleConfig) {
	opts.Server.GET("/google/login", gcfg.AutharizationHandler)

	opts.Server.GET("/google/callback", func(ctx *gin.Context) {
		code := ctx.Query("code")

		token, err := gcfg.Exchange(ctx.Request.Context(), code)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed to exchange token"})
			return
		}

		client := gcfg.Client(ctx.Request.Context(), token)
		resp, err := client.Get(google.GoogleUserEndpoint.UserInfoV3)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get user info"})
			return
		}

		defer resp.Body.Close()

		ud, err := google.UnmarshalUserData(resp.Body)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unmarshal user data"})
			return
		}

		user, err := opts.UserService.FindByGoogleID(ctx.Request.Context(), ud.Sub)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find user"})
			return
		}

		if user == nil {
			newUser, err := opts.UserService.CreateUser(ctx.Request.Context(), entity.Users{
				Email:       ud.Email,
				DisplayName: ud.Name,
				Picture:     ud.Picture,
				GoogleID:    ud.Sub,
			})
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
				return
			}

			user = newUser
		}
		

		opts.Auth.Put(ctx.Request.Context(), "dbUser", *user)
		ctx.Redirect(http.StatusTemporaryRedirect, "https://localhost:3000")
	})

	opts.Server.GET("/logout", func(ctx *gin.Context) {
		opts.Auth.SessionLogout(ctx.Request.Context())
		ctx.Redirect(http.StatusTemporaryRedirect, cfg.SiteBaseUrl)
	})
}
