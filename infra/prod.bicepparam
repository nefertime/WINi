using '../../.claude/templates/azure/main.bicep'

// ============================================================================
// Wini — PROD Environment Parameters
// Deploy: az deployment sub create --location northeurope \
//           --template-file ../../.claude/templates/azure/main.bicep \
//           --parameters prod.bicepparam \
//           --parameters pgAdminPassword=YOUR_SECURE_PASSWORD
// ============================================================================

// Core
param project = 'wini'
param env = 'prod'
param location = 'northeurope'

// Feature flags
param deployStaticWebApp = true
param deployContainerApp = false
param deployContainerRegistry = false
param deployPostgres = true
param deployKeyVault = true
param deployDnsZone = false           // Set true when wini.alfredleppanen.com is ready

// Static Web App (Standard for custom domain + SLA)
param swaSku = 'Standard'

// Container App (disabled)
param containerImage = ''
param containerPort = 8000

// PostgreSQL (GeneralPurpose + HA for prod)
param pgAdminLogin = 'winiadmin'
param pgAdminPassword = 'REPLACE_VIA_CLI'  // Pass via --parameters pgAdminPassword=...

// Key Vault
param tenantId = '3b3e06ba-3637-45b7-a55b-969bb8823ed7'

// DNS (enable when adding wini.alfredleppanen.com)
param dnsZoneName = ''                // e.g. 'alfredleppanen.com' when ready
