package http

import (
	"prabogo/internal/adapter/outbound/monitoring_repository"
	"prabogo/utils/activity"

	"github.com/gofiber/fiber/v2"
)

type MonitoringHandler struct {
	monitoringRepo *monitoring_repository.MonitoringRepository
}

func NewMonitoringHandler(monitoringRepo *monitoring_repository.MonitoringRepository) *MonitoringHandler {
	return &MonitoringHandler{
		monitoringRepo: monitoringRepo,
	}
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

	logs, err := h.monitoringRepo.GetLogsByTreeCode(ctx, treeCode)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "failed to fetch history",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    logs,
	})
}
