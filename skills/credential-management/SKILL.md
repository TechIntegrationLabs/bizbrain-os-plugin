---
name: credential-management
description: |
  Use when managing API keys, tokens, project IDs, or service credentials.
  Handles cataloging discovered credentials, securely storing new ones,
  and retrieving them for use in integrations and MCP configurations.
  Triggers on: credential setup, API key management, integration configuration,
  .env file operations, secret management.
version: 1.0.0
---

# Credential Management

You manage the user's API keys, tokens, and service credentials within their BizBrain OS brain.

## Storage Location

All credentials are stored in the brain folder at:
`<BRAIN_PATH>/Operations/credentials/`

### File Structure

```
Operations/credentials/
├── registry.json          # Catalog of all known credentials
└── vault/                 # Individual service credential files
    ├── github.json
    ├── stripe.json
    └── ...
```

### registry.json Format

```json
{
  "version": "1.0.0",
  "services": {
    "github": {
      "status": "configured",
      "envVars": ["GITHUB_PERSONAL_ACCESS_TOKEN"],
      "configuredAt": "2026-02-23T...",
      "source": "scan"
    },
    "stripe": {
      "status": "detected",
      "envVars": ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY"],
      "detectedAt": "2026-02-23T...",
      "detectedIn": "/path/to/.env",
      "source": "scan"
    }
  }
}
```

### Vault File Format

```json
{
  "service": "github",
  "credentials": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
  },
  "configuredAt": "2026-02-23T...",
  "notes": "Personal access token with repo + workflow scopes"
}
```

## Operations

### Catalog (during scan)
When the scanner finds .env files or service configs:
1. Read the file, identify known service keys (match against integrations-registry)
2. Add to registry.json with status "detected" and source location
3. Do NOT copy the actual credential values automatically
4. Inform user: "Found GitHub token in ~/Repos/my-app/.env. Store in brain vault?"

### Store (user-initiated)
When user provides a credential:
1. Write to `vault/<service>.json`
2. Update registry.json status to "configured"
3. If the service has an MCP server definition, offer to configure it

### Retrieve (by other skills/commands)
When another skill needs a credential:
1. Check `vault/<service>.json`
2. If not found, check registry.json for "detected" entries and offer to import
3. If completely unknown, walk user through setup using the integrations-registry

### Security Rules
- NEVER display full credential values in output (mask: `ghp_...abc`)
- NEVER commit credentials to git
- NEVER copy credentials to the plugin directory
- Vault files should only be readable by the current user
- When listing credentials, show service name + status, not values
