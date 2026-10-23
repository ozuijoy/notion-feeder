import { Client } from '@notionhq/client';

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const NOTION_API_TOKEN = getRequiredEnv('NOTION_API_TOKEN');
const NOTION_READER_DATABASE_ID = getRequiredEnv('NOTION_READER_DATABASE_ID');
const NOTION_FEEDS_DATABASE_ID = getRequiredEnv('NOTION_FEEDS_DATABASE_ID');

const notion = new Client({ auth: NOTION_API_TOKEN });

/**
 * Query a database using the v5 low-level request() method.
 * This preserves backward compatibility with the /databases/{id}/query endpoint.
 */
async function queryDatabase(databaseId, params = {}) {
  return notion.request({
    path: `databases/${databaseId}/query`,
    method: 'POST',
    body: params,
  });
}

export async function getFeedUrlsFromNotion() {
  try {
    const response = await queryDatabase(NOTION_FEEDS_DATABASE_ID, {
      filter: {
        property: 'Enabled',
        checkbox: { equals: true },
      },
    });

    return response.results.map((item) => ({
      title: item.properties.Title?.title?.[0]?.plain_text || 'Untitled',
      feedUrl: item.properties.Link?.url,
    })).filter((item) => item.feedUrl);
  } catch (err) {
    console.error('Failed to fetch feed URLs from Notion:', err.message);
    throw err;
  }
}

export async function addFeedItemToNotion(notionItem) {
  const { title, link, content } = notionItem;

  try {
    await notion.pages.create({
      parent: { database_id: NOTION_READER_DATABASE_ID },
      properties: {
        Title: {
          title: [{ text: { content: title || 'Untitled' } }],
        },
        Link: {
          url: link,
        },
      },
      children: content,
    });
  } catch (err) {
    console.error(`Failed to add feed item "${title}" to Notion:`, err.message);
    throw err;
  }
}

export async function deleteOldUnreadFeedItemsFromNotion() {
  const fetchBeforeDate = new Date();
  fetchBeforeDate.setDate(fetchBeforeDate.getDate() - 30);

  try {
    const response = await queryDatabase(NOTION_READER_DATABASE_ID, {
      filter: {
        and: [
          {
            property: 'Created At',
            date: { on_or_before: fetchBeforeDate.toJSON() },
          },
          {
            property: 'Read',
            checkbox: { equals: false },
          },
        ],
      },
    });

    for (const item of response.results) {
      try {
        await notion.pages.update({ page_id: item.id, archived: true });
      } catch (err) {
        console.error(`Failed to archive page ${item.id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Failed to query old unread items:', err.message);
    throw err;
  }
}
