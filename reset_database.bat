@echo off
echo 🛑 Stopping all servers...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM tree-id-server.exe >nul 2>&1

echo 🗑️ Deleting corrupted database...
del sawitdb-server\tree_logbook.sawit
if exist sawitdb-server\tree_logbook.sawit (
    echo ❌ Failed to delete file. Is it still open?
) else (
    echo ✅ Database deleted successfully.
)

echo.
echo 🚀 You can now restart the server:
echo    go run cmd/main.go http
pause
