Write-Host "Starting Wini dev database..."
az postgres flexible-server start --resource-group wini-dev-rg --name wini-dev-pg
Write-Host "Done. Database is starting (takes ~1 min to be ready)."
