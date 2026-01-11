package sawit_client

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"net"
	"time"
)

// SawitClient is a TCP client for SawitDB server
type SawitClient struct {
	conn net.Conn
	addr string
}

// SawitResponse represents server response
type SawitResponse struct {
	Success   bool        `json:"success"`
	Data      interface{} `json:"data,omitempty"`
	Error     string      `json:"error,omitempty"`
	Timestamp string      `json:"timestamp"`
}

// NewSawitClient creates a new client instance
func NewSawitClient(addr string) *SawitClient {
	return &SawitClient{addr: addr}
}

// Connect establishes TCP connection to SawitDB server
func (c *SawitClient) Connect() error {
	conn, err := net.DialTimeout("tcp", c.addr, 5*time.Second)
	if err != nil {
		return fmt.Errorf("failed to connect to SawitDB at %s: %w", c.addr, err)
	}
	c.conn = conn
	return nil
}

// Query executes AQL query on SawitDB
func (c *SawitClient) Query(ctx context.Context, aql string) (interface{}, error) {
	if c.conn == nil {
		return nil, fmt.Errorf("not connected to SawitDB")
	}

	// Send query
	_, err := c.conn.Write([]byte(aql + "\n"))
	if err != nil {
		return nil, fmt.Errorf("failed to send query: %w", err)
	}

	// Read response
	reader := bufio.NewReader(c.conn)
	responseLine, err := reader.ReadString('\n')
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Parse JSON response
	var response SawitResponse
	err = json.Unmarshal([]byte(responseLine), &response)
	if err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	if !response.Success {
		return nil, fmt.Errorf("query failed: %s", response.Error)
	}

	return response.Data, nil
}

// Close closes the connection
func (c *SawitClient) Close() error {
	if c.conn != nil {
		return c.conn.Close()
	}
	return nil
}
