# Notion Feeder

A lightweight Node.js script that reads RSS feeds and saves articles to a Notion database.
Runs automatically via GitHub Actions — no server required.

## How It Works

1. Reads your RSS feed URLs from a Notion database (`NOTION_FEEDS_DATABASE_ID`)
2. Fetches new articles published within the last 24 hours (configurable via `RUN_FREQUENCY`)
3. Converts HTML content to Notion-compatible blocks
4. Saves each article to your reader database (`NOTION_READER_DATABASE_ID`)
5. Archives unread articles older than 30 days

## Setup

### 1. Create Notion Databases

**Feeds Database** (to store RSS URLs):
| Property | Type |
|----------|------|
| Title | Title |
| Link | URL |
| Enabled | Checkbox |

**Reader Database** (to store articles):
| Property | Type |
|----------|------|
| Title | Title |
| Link | URL |
| Read | Checkbox |
| Created At | Created time |

### 2. Create a Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Create an internal integration and copy the token
3. Share both databases with the integration (click "..." → "Connections" → add your integration)

### 3. Configure GitHub Secrets

In your repo settings → Secrets and variables → Actions, add:

| Secret | Value |
|--------|-------|
| `NOTION_API_TOKEN` | Your Notion integration token |
| `NOTION_READER_DATABASE_ID` | Reader database ID (from the URL) |
| `NOTION_FEEDS_DATABASE_ID` | Feeds database ID (from the URL) |

### 4. Done!

The workflow runs daily at 12:30 UTC. You can also trigger it manually from the Actions tab.

## Local Development

```bash
cp .env.example .env
# Fill in your .env values
npm install
npm run feed
```

## Changes from Original (ravgeetdhillon/notion-feeder)

- Removed Webpack/Babel — uses native ES modules
- Upgraded Node.js from 14 to 20
- Upgraded `@notionhq/client` from beta to v2
- Replaced `curl`-based deployment with proper `actions/checkout@v4`
- Added proper error handling (no more silent failures)
- Simplified helper functions
