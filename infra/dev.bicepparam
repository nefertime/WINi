using '../../.claude/templates/azure/main.bicep'

// ============================================================================
// Wini — DEV Environment Parameters
// Deploy: az deployment sub create --location northeurope \
//           --template-file ../../.claude/templates/azure/main.bicep \
//           --parameters dev.bicepparam \
//           --parameters pgAdminPassword=YOUR_PASSWORD
// ============================================================================

// Core
param project = 'wini'
param env = 'dev'
param location = 'northeurope'

// Feature flags — Next.js app: SWA handles frontend, no separate container needed
param deployStaticWebApp = true
param deployContainerApp = false      // Next.js runs on SWA, not Container Apps
param deployContainerRegistry = false // No separate API container
param deployPostgres = true
param deployKeyVault = true
param deployDnsZone = false

// Static Web App (free tier for dev)
param swaSku = 'Free'

// Container App (disabled — not needed for Next.js)
param containerImage = ''
param containerPort = 8000

// PostgreSQL (Burstable = cheapest, ~€12/mo)
param pgAdminLogin = 'winiadmin'
param pgAdminPassword = 'REPLACE_VIA_CLI'  // Pass via --parameters pgAdminPassword=...

// Key Vault
param tenantId = '3b3e06ba-3637-45b7-a55b-969bb8823ed7'

// DNS (disabled for dev — use *.azurestaticapps.net)
param dnsZoneName = ''
