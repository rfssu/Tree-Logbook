# Tree-ID REST API Test Suite

## 🎯 Quick Test Commands

### 1. Health Check
```bash
curl http://localhost:8000/health
```

### 2. Get Statistics
```bash
curl http://localhost:8000/api/stats
```

### 3. List All Trees
```bash
curl http://localhost:8000/api/trees
```

### 4. Get Tree by Code
```bash
curl http://localhost:8000/api/trees/C001
```

### 5. Register New Tree
```bash
curl -X POST http://localhost:8000/api/trees \
  -H "Content-Type: application/json" \
  -d '{
    "species_id": "SP001",
    "location_id": "LOC001",
    "planting_date": "2024-01-15",
    "height_meters": 3.5,
    "diameter_cm": 12.0,
    "notes": "New Jati tree planted",
    "registered_by": "USR002"
  }'
```

### 6. Update Tree Status
```bash
curl -X PUT http://localhost:8000/api/trees/C001/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DIPUPUK",
    "health_score": 92,
    "notes": "Applied fertilizer treatment"
  }'
```

### 7. List Trees with Filters
```bash
# Filter by location
curl "http://localhost:8000/api/trees?location_id=LOC001"

# Filter by status
curl "http://localhost:8000/api/trees?status=SEHAT"

# With pagination
curl "http://localhost:8000/api/trees?limit=5&offset=0"
```

### 8. Delete Tree
```bash
curl -X DELETE http://localhost:8000/api/trees/C008
```

---

## 🧪 Test Workflow

**1. Start Server**:
```bash
go run test_api_server.go
```

**2. Test Endpoints** (in new terminal):
```bash
# Check health
curl http://localhost:8000/health

# Get existing trees
curl http://localhost:8000/api/trees | jq

# Get statistics
curl http://localhost:8000/api/stats | jq

# Register new tree
curl -X POST http://localhost:8000/api/trees \
  -H "Content-Type: application/json" \
  -d '{"species_id":"SP002","location_id":"LOC002","planting_date":"2024-06-01","height_meters":4.2,"diameter_cm":14.5,"notes":"Mahoni tree","registered_by":"USR001"}' | jq
```

**3. Verify** in database:
```sql
SELECT code, status, health_score FROM trees ORDER BY code DESC LIMIT 5;
```

---

## 📊 Expected Responses

### GET /health
```json
{
  "status": "healthy",
  "app": "Tree-ID API"
}
```

### GET /api/stats
```json
{
  "success": true,
  "data": {
    "total": 8,
    "healthy": 5,
    "sick": 1,
    "dead": 1,
    "fertilized": 1,
    "monitored": 0
  }
}
```

### POST /api/trees (Success)
```json
{
  "success": true,
  "data": {
    "code": "C009",
    "status": "SEHAT",
    "health_score": 100,
    ...
  }
}
```

### GET /api/trees (List)
```json
{
  "success": true,
  "data": [...],
  "total": 8
}
```

---

**API Ready for Testing!** 🚀
