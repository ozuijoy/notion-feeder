import getNewFeedItems from './feed.js';
import { addFeedItemToNotion, deleteOldUnreadFeedItemsFromNotion } from './notion.js';
import htmlToNotionBlocks from './parser.js';

async function main() {
  console.log('Fetching new feed items...');
  const feedItems = await getNewFeedItems();
  console.log(`Found ${feedItems.length} new feed items.`);

  let successCount = 0;
  let failCount = 0;

  for (const item of feedItems) {
    const notionItem = {
      title: item.title,
      link: item.link,
      content: htmlToNotionBlocks(item.content || item.contentSnippet || ''),
    };

    try {
      await addFeedItemToNotion(notionItem);
      successCount++;
    } catch {
      failCount++;
    }
  }

  console.log(`Added ${successCount} items, failed ${failCount} items.`);

  console.log('Cleaning up old unread items...');
  await deleteOldUnreadFeedItemsFromNotion();

  if (failCount > 0) {
    console.error(`${failCount} items failed to save.`);
    process.exit(1);
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
