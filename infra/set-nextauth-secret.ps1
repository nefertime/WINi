$secret = "nextauth-dev-" + (Get-Random -Maximum 999999999)
az keyvault secret set --vault-name wini-dev-kv --name "NEXTAUTH-SECRET" --value $secret
Write-Host "Secret value: $secret"
