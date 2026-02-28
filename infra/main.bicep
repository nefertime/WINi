// ============================================================================
// WINi — Azure Container Apps Infrastructure
// Deploy: az deployment group create \
//           --resource-group wini-prod-rg \
//           --template-file infra/main.bicep
//
// NOTE: Container App was created via CLI with ACR admin credentials.
//       This Bicep manages ACR, Log Analytics, and Container Apps Environment.
//       The Container App itself is managed via CLI / GitHub Actions.
// ============================================================================

param location string = 'northeurope'
param project string = 'wini'
param env string = 'prod'

// ---- Naming ----
var acrName = '${project}${env}acr'
var envName = '${project}-${env}-env'
var logAnalyticsName = '${project}-${env}-logs'

// ---- Log Analytics Workspace (required by Container Apps) ----
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
  tags: {
    project: project
    environment: env
  }
}

// ---- Container Registry (Basic ~$5/mo) ----
resource acr 'Microsoft.ContainerRegistry/registries@2023-11-01-preview' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
  }
  tags: {
    project: project
    environment: env
  }
}

// ---- Container Apps Environment ----
resource containerAppEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: envName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
    zoneRedundant: false
  }
  tags: {
    project: project
    environment: env
  }
}

// ---- Outputs ----
output acrLoginServer string = acr.properties.loginServer
output environmentId string = containerAppEnv.id
