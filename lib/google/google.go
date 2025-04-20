package google

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/TrySquadDF/formify/lib/config"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type GoogleUserV3 struct {
    Sub           string `json:"sub"`            // ID пользователя (в v3 используется sub вместо id)
    Name          string `json:"name"`
    GivenName     string `json:"given_name"`    
    Picture       string `json:"picture"`       
    Email         string `json:"email"`
    EmailVerified bool   `json:"email_verified"` // Проверен ли email (вместо verified_email)
}

type GoogleConfig struct {
	*oauth2.Config
}

type GoogleEndpoint struct {
	UserInfoV3 string
	UserInfoEmail string
	UserInfoProfile string
}

var GoogleUserEndpoint = GoogleEndpoint{
	UserInfoV3: "https://www.googleapis.com/oauth2/v3/userinfo",
	UserInfoEmail: "https://www.googleapis.com/auth/userinfo.email",
	UserInfoProfile: "https://www.googleapis.com/auth/userinfo.profile",
}

func UnmarshalUserData(r io.Reader) (GoogleUserV3, error) {
	var data GoogleUserV3

	if err := json.NewDecoder(r).Decode(&data); err != nil {
		return data, err
	}

	return data, nil
}

func NewOAuth2Config(cfg config.Config) GoogleConfig { 
	return GoogleConfig{
		&oauth2.Config{
			ClientID:     cfg.GOOGLE_CLIENT_ID,
			ClientSecret: cfg.GOOGLE_CLIENT_SECRET,
			RedirectURL:  cfg.GetGoogleCallbackUrl(),
			Scopes: []string{
				GoogleUserEndpoint.UserInfoEmail,
				GoogleUserEndpoint.UserInfoProfile,
			},
			Endpoint: google.Endpoint,
		},
	}
}

func (cfg *GoogleConfig) AutharizationHandler(c *gin.Context) {
	state := uuid.New().String()
	// Store state in session/cookie for validation
	url := cfg.AuthCodeURL(state)
	c.Redirect(http.StatusTemporaryRedirect, url)
} 
