package config

import (
	"net/url"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	RedisUrl    string `required:"true"  default:"redis://localhost:6379/0"    envconfig:"REDIS_URL"`
	DatabaseUrl string `required:"true"                                        envconfig:"DATABASE_URL"`
	SiteBaseUrl string `required:"true"  default:"https://localhost:8080" envconfig:"SITE_BASE_URL"`

	GOOGLE_CLIENT_ID     string `required:"true" envconfig:"GOOGLE_CLIENT_ID"`
	GOOGLE_CLIENT_SECRET string `required:"true" envconfig:"GOOGLE_CLIENT_SECRET"`

	CYPHER_KEY string `required:"true" envconfig:"CYPHER_KEY"`
}

func (c *Config) GetGoogleCallbackUrl() string {
	u, err := url.Parse(c.SiteBaseUrl)
	if err != nil {
		panic(err)
	}

	return u.JoinPath("/google/callback").String()
}

func NewWithEnvPath(envPath string) (*Config, error) {
	var newCfg Config
	_ = godotenv.Load(envPath)

	if err := envconfig.Process("", &newCfg); err != nil {
		return nil, err
	}

	return &newCfg, nil
}

func New() (*Config, error) {
	wd, err := os.Getwd()
	if err != nil {
		return nil, err
	}

	// if strings.HasPrefix(wd, "/workspace") {
	// 	wd = "/workspace"
	// } else {
	// 	wd = filepath.Join(wd, "..", "..")
	// }

	envPath := filepath.Join(wd, ".env")

	return NewWithEnvPath(envPath)
}

func NewFx() Config {
	config, err := New()
	if err != nil {
		panic(err)
	}

	return *config
}