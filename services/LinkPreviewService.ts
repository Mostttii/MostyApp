import * as cheerio from 'cheerio';

interface LinkPreview {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName: string;
  favicon: string;
}

export class LinkPreviewService {
  static async generatePreview(url: string): Promise<LinkPreview | null> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);

      const preview: LinkPreview = {
        title: this.getMetaContent($, 'og:title') || $('title').text() || '',
        description: this.getMetaContent($, 'og:description') || this.getMetaContent($, 'description') || '',
        image: this.getMetaContent($, 'og:image') || '',
        url: this.getMetaContent($, 'og:url') || url,
        siteName: this.getMetaContent($, 'og:site_name') || this.extractDomain(url),
        favicon: this.getFavicon($, url),
      };

      // Clean and validate the preview data
      return this.validatePreview(preview) ? preview : null;
    } catch (error) {
      console.error('Error generating link preview:', error);
      return null;
    }
  }

  private static getMetaContent($: cheerio.CheerioAPI, property: string): string {
    return (
      $(`meta[property="${property}"]`).attr('content') ||
      $(`meta[name="${property}"]`).attr('content') ||
      ''
    );
  }

  private static getFavicon($: cheerio.CheerioAPI, baseUrl: string): string {
    const domain = this.extractDomain(baseUrl);
    const protocol = baseUrl.startsWith('https') ? 'https:' : 'http:';

    // Check for favicon in various locations
    const faviconLinks = [
      $('link[rel="icon"]').attr('href'),
      $('link[rel="shortcut icon"]').attr('href'),
      $('link[rel="apple-touch-icon"]').attr('href'),
      `/favicon.ico`, // Default favicon location
    ].filter(Boolean);

    for (const link of faviconLinks) {
      if (!link) continue;

      if (link.startsWith('http')) {
        return link;
      } else if (link.startsWith('//')) {
        return protocol + link;
      } else if (link.startsWith('/')) {
        return `${protocol}//${domain}${link}`;
      } else {
        return `${protocol}//${domain}/${link}`;
      }
    }

    // Return a default favicon from Google's favicon service as fallback
    return `https://www.google.com/s2/favicons?domain=${domain}`;
  }

  private static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return '';
    }
  }

  private static validatePreview(preview: LinkPreview): boolean {
    // Ensure required fields are present and not empty
    return !!(
      preview.title &&
      preview.url &&
      preview.siteName
    );
  }

  static async generatePreviewBatch(urls: string[]): Promise<Map<string, LinkPreview | null>> {
    const results = new Map<string, LinkPreview | null>();
    
    // Process URLs in parallel with a concurrency limit
    const concurrencyLimit = 5;
    const chunks = this.chunkArray(urls, concurrencyLimit);

    for (const chunk of chunks) {
      const promises = chunk.map(url => this.generatePreview(url));
      const previews = await Promise.all(promises);
      
      chunk.forEach((url, index) => {
        results.set(url, previews[index]);
      });
    }

    return results;
  }

  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
} 