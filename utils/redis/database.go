package redis

import (
	"context"
	"os"
	"time"

	"github.com/arielfikru/gibrun"
)

var gibClient *gibrun.Client

func InitDatabase() {
	addr := os.Getenv("CACHE_HOST")
	port := os.Getenv("CACHE_PORT")
	pass := os.Getenv("CACHE_PASSWORD")
	if port == "" {
		port = "6379"
	}

	// Initialize Gib.Run client with Config
	// Optimized for read-heavy tree logbook operations
	gibClient = gibrun.New(gibrun.Config{
		Addr:     addr + ":" + port,
		Password: pass,
	})
}

// Set - Stores data using Gib (automatic JSON marshalling)
func Set(ctx context.Context, key string, value interface{}) error {
	return gibClient.Gib(ctx, key).
		Value(value).
		TTL(24 * time.Hour).
		Exec()
}

// Get - Retrieves string data using Run (automatic unmarshalling)
func Get(ctx context.Context, key string) (string, error) {
	result, found, err := gibClient.Run(ctx, key).Raw()
	if err != nil {
		return "", err
	}
	if !found {
		return "", nil // Key not found
	}
	return result, nil
}

// Del - Delete key from cache
func Del(ctx context.Context, key string) error {
	return gibClient.Del(ctx, key)
}
