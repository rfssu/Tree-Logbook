# 🚀 Tree-ID Quick Start Guide

## 🎯 Start Server (IMPORTANT: Use the correct file!)

```powershell
cd c:\tree-id-project\tree-id-projects
go run cmd/main.go
```

**⚠️ DON'T USE:** `go run cmd/main.go` (Wrong server!)

## 🌐 Access Application

1. Open browser: **http://localhost:7000**
2. Login:
   - Username: `johndoe`
   - Password: `password123`

## 🛑 Stop Server

```powershell
# Quick kill
taskkill /F /IM go.exe

# Or find specific process
netstat -ano | findstr :7000
taskkill /F /PID <PID_NUMBER>
```

## ✅ What's Fixed

- ✅ Timestamp issue resolved (DATE → TIMESTAMP)
- ✅ Auto-refresh every 30 seconds
- ✅ "Just now" updates to "X mins ago"
- ✅ Frontend served correctly

## 📖 Full Documentation

See: `C:\Users\Lenovo\.gemini\antigravity\brain\ab18d33d-6fcf-468c-9699-d6e0fe811b5f\session_summary.md`

## 🧪 Test Checklist

1. Start server with `go run cmd/main.go`
2. Open `http://localhost:7000`
3. Login
4. Update any tree status
5. Check "Update History" shows "Just now"
6. Wait 1-2 minutes
7. Verify it changes to "X mins ago"

---
**Last Updated:** 2026-01-10 01:16 WIB  
**Status:** Ready to use ✅
