package sawit_client

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"net"
	"sync"
	"time"
)

// SawitClient is a TCP client for SawitDB server
type SawitClient struct {
	conn   net.Conn
	reader *bufio.Reader // 🔄 Persistent reader to preserve buffer
	addr   string
	mu     sync.Mutex // 🔒 Mutex for thread safety
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
	c.mu.Lock()
	defer c.mu.Unlock()

	conn, err := net.DialTimeout("tcp", c.addr, 5*time.Second)
	if err != nil {
		return fmt.Errorf("failed to connect to SawitDB at %s: %w", c.addr, err)
	}
	c.conn = conn
	c.reader = bufio.NewReader(conn) // ✅ Init reader once
	return nil
}

// Query executes AQL query on SawitDB
func (c *SawitClient) Query(ctx context.Context, aql string) (interface{}, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.conn == nil {
		return nil, fmt.Errorf("not connected to SawitDB")
	}

	// Set deadline to prevent hanging forever
	c.conn.SetDeadline(time.Now().Add(10 * time.Second))

	// Send query
	fmt.Printf("🔌 [SawitClient] Sending: %s\n", aql)
	_, err := c.conn.Write([]byte(aql + "\n"))
	if err != nil {
		return nil, fmt.Errorf("failed to send query: %w", err)
	}

	// Read response using persistent reader
	responseLine, err := c.reader.ReadString('\n')
	if err != nil {
		fmt.Printf("❌ [SawitClient] Read Error: %v\n", err)
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	fmt.Printf("📥 [SawitClient] Received: %s\n", responseLine)

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
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.conn != nil {
		return c.conn.Close()
	}
	return nil
}
