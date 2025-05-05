package auth

import (
	"context"
	"encoding/gob"
	"fmt"
	"time"

	"github.com/TrySquadDF/formify/api-gql/internal/services/users"
	"github.com/TrySquadDF/formify/lib/config"
	model "github.com/TrySquadDF/formify/lib/gomodels"
	"github.com/alexedwards/scs/goredisstore"
	"github.com/alexedwards/scs/v2"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"go.uber.org/fx"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const SESSION_KEY = "__session__"

type Opts struct {
	fx.In

	Redis *redis.Client
	Gorm  *gorm.DB

	UserService *users.Service
	Config config.Config
}

type Auth struct {

	userService    *users.Service
	sessionManager *scs.SessionManager
	gorm           *gorm.DB
	config 		   config.Config
}

func NewSessions(opts Opts) *Auth {
	sessionManager := scs.New()
	sessionManager.Lifetime = 24 * time.Hour * 31
	sessionManager.Store = goredisstore.New(opts.Redis)

	gob.Register(model.Users{})

	return &Auth{
		userService:    opts.UserService,
		sessionManager: sessionManager,
		gorm:           opts.Gorm,
		config: 		opts.Config,
	}
}

func (s *Auth) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				fmt.Println(r)
				c.String(500, "Internal Server Error")
			}
		}()

		cookie, err := c.Cookie(s.sessionManager.Cookie.Name)
		if err != nil {
			cookie = ""
		}

		session, err := s.sessionManager.Load(c.Request.Context(), cookie)
		if err != nil {
			s.sessionManager.ErrorFunc(c.Writer, c.Request, err)
			return
		}

		c.Set(SESSION_KEY, session)

		c.Request = c.Request.WithContext(session)

		sessionToken, expiryTime, err := s.sessionManager.Commit(session)
		if err != nil {
			panic(err)
		}

		s.sessionManager.WriteSessionCookie(session, c.Writer, sessionToken, expiryTime)
		c.Next()
	}
}

func (s *Auth) Get(ctx context.Context, key string) interface{} {
    return s.sessionManager.Get(ctx, key)
}

func (s *Auth) Put(ctx context.Context, key string, val interface{}) {
	s.sessionManager.Put(ctx, key, val)
	s.sessionManager.Commit(ctx)
}

func (s *Auth) AuthenticateWithEmailPassword(ctx context.Context, email, password string) (*model.Users, error) {
    user, err := s.userService.FindUserByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
    
    if !s.verifyPassword(password, user.PasswordHash) {
        return nil, fmt.Errorf("invalid credentials")
    }
    
    return user, nil
}

func (s *Auth) HashPassword(password string) (string, error) {
    hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        return "", err
    }
    return string(hash), nil
}

func (s *Auth) verifyPassword(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}

