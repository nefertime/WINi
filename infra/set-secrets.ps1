# Wait a moment for role assignment to propagate
Start-Sleep -Seconds 15

az keyvault secret set --vault-name wini-dev-kv --name "DATABASE-URL" `
  --value "postgresql://winiadmin:WdPtVKU4pH6smV@wini-dev-pg.postgres.database.azure.com/postgres?sslmode=require"

az keyvault secret set --vault-name wini-dev-kv --name "NEXTAUTH-SECRET" `
  --value "$(az account get-access-token --query accessToken -o tsv | sha256sum | head -c 32)"
