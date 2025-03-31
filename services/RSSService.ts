import * as cheerio from 'cheerio';
import { ContentItem } from './ContentService';
import { Timestamp } from 'firebase/firestore';

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  creator?: string;
  'content:encoded'?: string;
  'media:content'?: {
    $: {
      url: string;
    };
  };
}

export class RSSService {
  static async parseRSSFeed(feedUrl: string, creatorId: string, creatorName: string): Promise<ContentItem[]> {
    try {
      const response = await fetch(feedUrl);
      const xmlText = await response.text();
      const items = await this.parseXML(xmlText);

      return items.map(item => ({
        id: Buffer.from(item.link).toString('base64'),
        creatorId,
        creatorName,
        creatorAvatar: '', // Will be set from creator profile
        title: item.title,
        description: this.stripHtml(item.description),
        thumbnail: this.extractThumbnail(item),
        sourceUrl: item.link,
        type: 'post',
        publishedAt: Timestamp.fromDate(new Date(item.pubDate)),
        metadata: {
          platform: 'blog',
          estimatedTime: this.estimateReadingTime(item.description),
        },
      }));
    } catch (error) {
      console.error('Error parsing RSS feed:', error);
      return [];
    }
  }

  private static async parseXML(xmlText: string): Promise<RSSItem[]> {
    const $ = cheerio.load(xmlText, { xmlMode: true });
    const items: RSSItem[] = [];

    $('item').each((_, element) => {
      const item: RSSItem = {
        title: $(element).find('title').text(),
        description: $(element).find('description').text(),
        link: $(element).find('link').text(),
        pubDate: $(element).find('pubDate').text(),
        creator: $(element).find('dc\\:creator').text(),
        'content:encoded': $(element).find('content\\:encoded').text(),
      };

      const mediaContent = $(element).find('media\\:content').first();
      if (mediaContent.length) {
        item['media:content'] = {
          $: {
            url: mediaContent.attr('url') || '',
          },
        };
      }

      items.push(item);
    });

    return items;
  }

  private static stripHtml(html: string): string {
    const $ = cheerio.load(html);
    return $.text().trim();
  }

  private static extractThumbnail(item: RSSItem): string {
    // Try to find the first image in the content
    if (item['media:content']?.$.url) {
      return item['media:content'].$.url;
    }

    if (item['content:encoded']) {
      const $ = cheerio.load(item['content:encoded']);
      const firstImage = $('img').first();
      if (firstImage.length) {
        return firstImage.attr('src') || '';
      }
    }

    // Extract first image from description if available
    const $ = cheerio.load(item.description);
    const firstImage = $('img').first();
    return firstImage.length ? firstImage.attr('src') || '' : '';
  }

  private static estimateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = this.stripHtml(content).split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }
} 