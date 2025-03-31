import { SupportedPlatform, SupportedLanguage, RecipeParser } from './types';
import { InstagramParser } from './InstagramParser';
import { GenericParser } from './GenericParser';

export class ParserFactory {
  private static parsers = new Map<SupportedPlatform, new (language: SupportedLanguage) => RecipeParser>([
    ['instagram', InstagramParser],
    ['generic', GenericParser],
    // Add other parsers as they are implemented
    // ['youtube', YouTubeParser],
    // ['facebook', FacebookParser],
    // ['tiktok', TikTokParser],
  ]);

  static getParser(url: string, language: SupportedLanguage = 'en'): RecipeParser {
    const platform = this.detectPlatform(url);
    const ParserClass = this.parsers.get(platform) || this.parsers.get('generic');

    if (!ParserClass) {
      throw new Error(`No parser available for platform: ${platform}`);
    }

    return new ParserClass(language);
  }

  private static detectPlatform(url: string): SupportedPlatform {
    const platformPatterns: Record<SupportedPlatform, RegExp> = {
      instagram: /instagram\.com/,
      facebook: /facebook\.com/,
      youtube: /youtube\.com|youtu\.be/,
      tiktok: /tiktok\.com/,
      generic: /.*/,
    };

    for (const [platform, pattern] of Object.entries(platformPatterns)) {
      if (pattern.test(url)) {
        return platform as SupportedPlatform;
      }
    }

    return 'generic';
  }
} 