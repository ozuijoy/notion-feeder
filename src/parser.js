import { markdownToBlocks } from '@tryfabric/martian';
import TurndownService from 'turndown';

const turndownService = new TurndownService();

export default function htmlToNotionBlocks(htmlContent) {
  if (!htmlContent) return [];
  try {
    const markdown = turndownService.turndown(htmlContent);
    return markdownToBlocks(markdown);
  } catch (error) {
    console.error('Failed to convert HTML to Notion blocks:', error.message);
    return [];
  }
}
