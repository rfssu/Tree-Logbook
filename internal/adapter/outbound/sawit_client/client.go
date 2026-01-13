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
	conn      net.Conn
	reader    *bufio.Reader
	addr      string
	mu        sync.Mutex
	reconnect sync.Mutex // Separate mutex for reconnection
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

	return c.connectUnsafe()
}

// connectUnsafe dials without locking (helper)
func (c *SawitClient) connectUnsafe() error {
	if c.conn != nil {
		c.conn.Close()
	}

	conn, err := net.DialTimeout("tcp", c.addr, 5*time.Second)
	if err != nil {
		return fmt.Errorf("failed to connect to SawitDB at %s: %w", c.addr, err)
	}
	c.conn = conn
	c.reader = bufio.NewReader(conn)
	// Set keepalive
	if tcpConn, ok := conn.(*net.TCPConn); ok {
		tcpConn.SetKeepAlive(true)
		tcpConn.SetKeepAlivePeriod(30 * time.Second)
	}

	fmt.Printf("🔌 [SawitClient] Connected to %s\n", c.addr)
	return nil
}

// Reconnect attempts to re-establish connection
func (c *SawitClient) Reconnect() error {
	c.reconnect.Lock()
	defer c.reconnect.Unlock()

	c.mu.Lock()
	defer c.mu.Unlock()

	fmt.Println("🔄 [SawitClient] Reconnecting...")
	return c.connectUnsafe()
}

// Query executes AQL query on SawitDB with Auto-Retry
func (c *SawitClient) Query(ctx context.Context, aql string) (interface{}, error) {
	const maxRetries = 3
	var lastErr error

	for i := 0; i < maxRetries; i++ {
		res, err := c.queryOnce(ctx, aql)
		if err == nil {
			return res, nil
		}

		lastErr = err
		fmt.Printf("⚠️ [SawitClient] Query attempt %d failed: %v. Retrying...\n", i+1, err)

		// Try to reconnect before next attempt
		if recErr := c.Reconnect(); recErr != nil {
			fmt.Printf("❌ [SawitClient] Reconnect failed: %v\n", recErr)
			// Wait a bit before next retry loop
			time.Sleep(1 * time.Second)
		}
	}

	return nil, fmt.Errorf("query failed after %d retries: %w", maxRetries, lastErr)
}

// queryOnce performs a single query attempt
func (c *SawitClient) queryOnce(ctx context.Context, aql string) (interface{}, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.conn == nil {
		return nil, fmt.Errorf("not connected to SawitDB")
	}

	// Set deadline
	c.conn.SetDeadline(time.Now().Add(10 * time.Second))

	// Send
	fmt.Printf("🔌 [SawitClient] Sending: %s\n", aql)
	if _, err := c.conn.Write([]byte(aql + "\n")); err != nil {
		return nil, fmt.Errorf("write error: %w", err)
	}

	// Read
	responseLine, err := c.reader.ReadString('\n')
	if err != nil {
		return nil, fmt.Errorf("read error: %w", err)
	}

	// Parse
	var response SawitResponse
	if err := json.Unmarshal([]byte(responseLine), &response); err != nil {
		return nil, fmt.Errorf("parse error: %w", err)
	}

	if !response.Success {
		return nil, fmt.Errorf("query error: %s", response.Error)
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
