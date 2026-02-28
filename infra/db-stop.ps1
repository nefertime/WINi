Write-Host "Stopping Wini dev database..."
az postgres flexible-server stop --resource-group wini-dev-rg --name wini-dev-pg
Write-Host "Done. Database stopped. No charges accumulate while stopped."
