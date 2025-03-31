import { ValidationResult } from '../validation/ParserValidator';
import { Timestamp, addDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

export interface ScrapingResult {
  url: string;
  parserName: string;
  timestamp: Date;
  duration: number;
  success: boolean;
  validationResult: ValidationResult;
  error?: string;
}

export interface ParserStats {
  parserName: string;
  totalAttempts: number;
  successRate: number;
  averageDuration: number;
  commonErrors: Array<{
    code: string;
    count: number;
  }>;
  lastRun: Date;
}

export class ScrapingMonitor {
  private static SCRAPING_LOGS_COLLECTION = 'scraping_logs';
  private static PARSER_STATS_COLLECTION = 'parser_stats';

  static async logScrapingResult(result: ScrapingResult): Promise<void> {
    try {
      await addDoc(collection(db, this.SCRAPING_LOGS_COLLECTION), {
        ...result,
        timestamp: Timestamp.fromDate(result.timestamp)
      });

      // Update parser stats
      await this.updateParserStats(result);
    } catch (error) {
      console.error('Error logging scraping result:', error);
    }
  }

  private static async updateParserStats(result: ScrapingResult): Promise<void> {
    const statsRef = collection(db, this.PARSER_STATS_COLLECTION);
    const q = query(
      statsRef,
      where('parserName', '==', result.parserName),
      orderBy('lastRun', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    const currentStats = snapshot.docs[0]?.data() as ParserStats | undefined;

    const newStats: ParserStats = {
      parserName: result.parserName,
      totalAttempts: (currentStats?.totalAttempts || 0) + 1,
      successRate: this.calculateSuccessRate(currentStats, result.success),
      averageDuration: this.calculateAverageDuration(currentStats, result.duration),
      commonErrors: this.updateCommonErrors(currentStats?.commonErrors || [], result),
      lastRun: result.timestamp
    };

    await addDoc(collection(db, this.PARSER_STATS_COLLECTION), newStats);
  }

  private static calculateSuccessRate(currentStats: ParserStats | undefined, success: boolean): number {
    if (!currentStats) return success ? 100 : 0;
    
    const totalSuccesses = (currentStats.successRate * currentStats.totalAttempts / 100) +
      (success ? 1 : 0);
    return (totalSuccesses / (currentStats.totalAttempts + 1)) * 100;
  }

  private static calculateAverageDuration(currentStats: ParserStats | undefined, duration: number): number {
    if (!currentStats) return duration;
    
    return ((currentStats.averageDuration * currentStats.totalAttempts) + duration) /
      (currentStats.totalAttempts + 1);
  }

  private static updateCommonErrors(
    currentErrors: Array<{ code: string; count: number }>,
    result: ScrapingResult
  ): Array<{ code: string; count: number }> {
    const errors = [...currentErrors];

    if (!result.success && result.validationResult.errors.length > 0) {
      result.validationResult.errors.forEach(error => {
        const existingError = errors.find(e => e.code === error.code);
        if (existingError) {
          existingError.count++;
        } else {
          errors.push({ code: error.code, count: 1 });
        }
      });
    }

    // Sort by count and keep top 10
    return errors
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  static async getParserStats(parserName: string): Promise<ParserStats | null> {
    try {
      const statsRef = collection(db, this.PARSER_STATS_COLLECTION);
      const q = query(
        statsRef,
        where('parserName', '==', parserName),
        orderBy('lastRun', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      return (snapshot.docs[0]?.data() as ParserStats) || null;
    } catch (error) {
      console.error('Error fetching parser stats:', error);
      return null;
    }
  }

  static async getRecentScrapingLogs(
    maxResults: number = 100,
    parserName?: string
  ): Promise<ScrapingResult[]> {
    try {
      const logsRef = collection(db, this.SCRAPING_LOGS_COLLECTION);
      let baseQuery = query(logsRef, orderBy('timestamp', 'desc'));

      if (parserName) {
        baseQuery = query(baseQuery, where('parserName', '==', parserName));
      }

      const limitedQuery = query(baseQuery, limit(maxResults));

      const snapshot = await getDocs(limitedQuery);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp).toDate()
      })) as ScrapingResult[];
    } catch (error) {
      console.error('Error fetching scraping logs:', error);
      return [];
    }
  }
} 