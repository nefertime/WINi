# Stores secrets in Azure Key Vault — run after grant-keyvault.ps1
# Reads password from prompt, never hardcoded
$PG_PASSWORD = Read-Host "Enter PostgreSQL password" -AsSecureString
$PG_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($PG_PASSWORD))

Start-Sleep -Seconds 15

az keyvault secret set --vault-name wini-dev-kv --name "DATABASE-URL" `
  --value "postgresql://winiadmin:$PG_PASSWORD_PLAIN@wini-dev-pg.postgres.database.azure.com/postgres?sslmode=require"
