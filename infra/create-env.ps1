Set-Content -Path "C:\Dev\Wini\wini-app\.env" -Value 'DATABASE_URL="postgresql://winiadmin:WdPtVKU4pH6smV@wini-dev-pg.postgres.database.azure.com/postgres?sslmode=require"' -Encoding utf8

Set-Content -Path "C:\Dev\Wini\wini-app\.env.local" -Value @"
DATABASE_URL="postgresql://winiadmin:WdPtVKU4pH6smV@wini-dev-pg.postgres.database.azure.com/postgres?sslmode=require"
NEXTAUTH_SECRET="nextauth-dev-113177588"
NEXTAUTH_URL="http://localhost:3100"
"@ -Encoding utf8

Write-Host ".env and .env.local created"
