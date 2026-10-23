import Parser from 'rss-parser';
import { isWithinTimeWindow } from './helpers.js';
import { getFeedUrlsFromNotion } from './notion.js';

const RUN_FREQUENCY = parseInt(process.env.RUN_FREQUENCY || '86400', 10);

async function getNewFeedItemsFrom(feedUrl) {
  const parser = new Parser({
    timeout: 15000,
    headers: { 'User-Agent': 'notion-feeder/2.0' },
  });

  let rss;
  try {
    rss = await parser.parseURL(feedUrl);
  } catch (error) {
    console.error(`Failed to parse feed: ${feedUrl}`, error.message);
    return [];
  }

  return rss.items.filter((item) => {
    if (!item.pubDate) return false;
    const publishedTimestamp = Math.floor(new Date(item.pubDate).getTime() / 1000);
    if (Number.isNaN(publishedTimestamp)) return false;
    return isWithinTimeWindow(publishedTimestamp, RUN_FREQUENCY);
  });
}

export default async function getNewFeedItems() {
  const feeds = await getFeedUrlsFromNotion();
  const allNewFeedItems = [];

  for (const { feedUrl } of feeds) {
    const items = await getNewFeedItemsFrom(feedUrl);
    allNewFeedItems.push(...items);
  }

  allNewFeedItems.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));
  return allNewFeedItems;
}
