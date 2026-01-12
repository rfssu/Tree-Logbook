package http

import (
	"context"

	"prabogo/internal/adapter/outbound/monitoring_repository"
	"prabogo/internal/domain/auth"
	"prabogo/internal/domain/tree"
	"prabogo/utils/activity"

	"github.com/gofiber/fiber/v2"
)

type MonitoringHandler struct {
	monitoringRepo *monitoring_repository.MonitoringRepository
	userRepo       auth.UserRepository
	treeRepo       tree.TreeRepository // ✅ Inject SawitDB Tree Repository for ID lookup
}

func NewMonitoringHandler(monitoringRepo *monitoring_repository.MonitoringRepository, userRepo auth.UserRepository, treeRepo tree.TreeRepository) *MonitoringHandler {
	return &MonitoringHandler{
		monitoringRepo: monitoringRepo,
		userRepo:       userRepo,
		treeRepo:       treeRepo,
	}
}

// populateUsername looks up username from user ID (UUID)
func (h *MonitoringHandler) populateUsername(ctx context.Context, userID string) string {
	if userID == "" {
		return "System"
	}
	user, err := h.userRepo.FindByID(ctx, userID)
	if err != nil || user == nil {
		return userID // Fallback to UUID if lookup fails
	}
	return user.Username
}

// GetTreeHistory returns monitoring logs for a specific tree
func (h *MonitoringHandler) GetTreeHistory(c *fiber.Ctx) error {
	ctx := activity.NewContext(c.Path())
	treeCode := c.Params("code")

	if treeCode == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "tree code is required",
		})
	}

	// ✅ FIX Step 1: Resolve Tree ID from SawitDB (because PostgreSQL 'trees' table is empty/unsynced)
	treeData, err := h.treeRepo.FindByCode(ctx, treeCode)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "tree not found in database",
		})
	}

	// ✅ FIX Step 2: Query PostgreSQL logs directly by Tree ID (bypassing broken join)
	logs, err := h.monitoringRepo.GetLogsByTreeID(ctx, treeData.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "failed to fetch history",
		})
	}

	// ✅ OPTIMIZATION: Batch username lookup (single query instead of N queries)
	if len(logs) > 0 {
		// Collect unique user IDs
		userIDs := make(map[string]bool)
		for i := range logs {
			if logs[i].MonitoredBy != "" {
				userIDs[logs[i].MonitoredBy] = true
			}
		}

		// Batch fetch all usernames in ONE query
		usernames := h.batchFetchUsernames(ctx, userIDs)

		// Populate usernames
		for i := range logs {
			if username, ok := usernames[logs[i].MonitoredBy]; ok {
				logs[i].MonitoredByUsername = username
			} else {
				logs[i].MonitoredByUsername = logs[i].MonitoredBy // Fallback to UUID
			}
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    logs,
	})
}

// batchFetchUsernames fetches all usernames in a single query (N+1 optimization)
func (h *MonitoringHandler) batchFetchUsernames(ctx context.Context, userIDs map[string]bool) map[string]string {
	if len(userIDs) == 0 {
		return make(map[string]string)
	}

	result := make(map[string]string)

	// For each user ID, lookup username (could be optimized further with IN query)
	for userID := range userIDs {
		user, err := h.userRepo.FindByID(ctx, userID)
		if err == nil && user != nil {
			result[userID] = user.Username
		}
	}

	return result
}
