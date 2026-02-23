# Creates local .env files for Wini dev — fill in your password before running
$PG_PASSWORD = Read-Host "Enter PostgreSQL password" -AsSecureString
$PG_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($PG_PASSWORD))

Set-Content -Path "C:\Dev\Wini\wini-app\.env" -Value "DATABASE_URL=`"postgresql://winiadmin:$PG_PASSWORD_PLAIN@wini-dev-pg.postgres.database.azure.com/postgres?sslmode=require`"" -Encoding utf8

Set-Content -Path "C:\Dev\Wini\wini-app\.env.local" -Value @"
DATABASE_URL="postgresql://winiadmin:$PG_PASSWORD_PLAIN@wini-dev-pg.postgres.database.azure.com/postgres?sslmode=require"
NEXTAUTH_SECRET="nextauth-dev-113177588"
NEXTAUTH_URL="http://localhost:3100"
"@ -Encoding utf8

Write-Host ".env and .env.local created"
