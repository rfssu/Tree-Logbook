package cache

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/arielfikru/gibrun"
)

var (
	// Global cache client
	Client *gibrun.Client
)

// InitGibRun initializes Gib.Run Redis cache
func InitGibRun() error {
	addr := os.Getenv("REDIS_ADDR")
	if addr == "" {
		addr = "localhost:6379"
	}

	password := os.Getenv("REDIS_PASSWORD")

	// Create Gib.Run client
	Client = gibrun.New(gibrun.Config{
		Addr:     addr,
		Password: password,
		DB:       0, // Use DB 0
	})

	// Test connection
	ctx := context.Background()
	err := Client.Gib(ctx, "test:ping").
		Value("pong").
		TTL(1 * time.Second).
		Exec()

	if err != nil {
		return fmt.Errorf("failed to connect to Redis: %w", err)
	}

	// Cleanup test key
	Client.Del(ctx, "test:ping")

	fmt.Println("✅ Gib.Run cache initialized")
	return nil
}

// CacheTree stores tree data in cache
func CacheTree(ctx context.Context, treeCode string, data interface{}, ttl time.Duration) error {
	if Client == nil {
		return nil // Gracefully skip if Redis unavailable
	}
	key := fmt.Sprintf("tree:%s", treeCode)
	return Client.Gib(ctx, key).
		Value(data).
		TTL(ttl).
		Exec()
}

// GetCachedTree retrieves tree from cache
func GetCachedTree(ctx context.Context, treeCode string, dest interface{}) (bool, error) {
	if Client == nil {
		return false, nil // Cache miss if Redis unavailable
	}
	key := fmt.Sprintf("tree:%s", treeCode)
	found, err := Client.Run(ctx, key).Bind(dest)
	return found, err
}

// InvalidateTree removes tree from cache
func InvalidateTree(ctx context.Context, treeCode string) error {
	if Client == nil {
		return nil // Gracefully skip if Redis unavailable
	}
	key := fmt.Sprintf("tree:%s", treeCode)
	return Client.Del(ctx, key)
}

// IncrementScanCount tracks tree scan statistics
func IncrementScanCount(ctx context.Context, treeCode string) (int64, error) {
	if Client == nil {
		return 0, nil // Return 0 if Redis unavailable
	}
	key := fmt.Sprintf("scans:%s", treeCode)
	return Client.Sprint(ctx, key).Incr()
}

// GetScanCount gets total scans for a tree
func GetScanCount(ctx context.Context, treeCode string) (int64, error) {
	if Client == nil {
		return 0, nil // Return 0 if Redis unavailable
	}
	key := fmt.Sprintf("scans:%s", treeCode)
	return Client.Sprint(ctx, key).Get()
}
