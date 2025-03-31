import { Timestamp, addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { YouTubeService } from './YouTubeService';
import { RSSService } from './RSSService';
import { creators } from '../data/creators';
import { ContentItem } from './ContentService';

interface RefreshJob {
  id: string;
  creatorId: string;
  platform: 'youtube' | 'blog';
  lastRefresh: Timestamp;
  nextRefresh: Timestamp;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
}

export class ContentRefreshService {
  private static readonly REFRESH_INTERVAL = 3600 * 1000; // 1 hour in milliseconds
  private static isRunning = false;

  static async startRefreshScheduler() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      // Initial refresh for all creators
      await this.refreshAllContent();

      // Set up periodic refresh
      setInterval(async () => {
        await this.refreshAllContent();
      }, this.REFRESH_INTERVAL);
    } catch (error) {
      console.error('Error in refresh scheduler:', error);
      this.isRunning = false;
    }
  }

  static async refreshAllContent() {
    console.log('Starting content refresh...');
    const startTime = Date.now();

    try {
      // Get all creators that need refresh
      const jobs = await this.getRefreshJobs();
      
      // Process jobs in batches to avoid rate limits
      const batchSize = 5;
      const batches = this.chunkArray(jobs, batchSize);

      for (const batch of batches) {
        await Promise.all(batch.map(job => this.processRefreshJob(job)));
      }

      console.log(`Content refresh completed in ${(Date.now() - startTime) / 1000}s`);
    } catch (error) {
      console.error('Error refreshing content:', error);
    }
  }

  private static async getRefreshJobs(): Promise<RefreshJob[]> {
    const jobs: RefreshJob[] = [];
    const now = Timestamp.now();

    // Create refresh jobs for each creator and platform
    for (const creator of creators) {
      if (creator.platforms.youtube?.channelId) {
        jobs.push({
          id: `${creator.id}_youtube`,
          creatorId: creator.id,
          platform: 'youtube',
          lastRefresh: Timestamp.fromDate(new Date(0)), // Never refreshed
          nextRefresh: now,
          status: 'pending'
        });
      }

      if (creator.platforms.blog?.feedUrl) {
        jobs.push({
          id: `${creator.id}_blog`,
          creatorId: creator.id,
          platform: 'blog',
          lastRefresh: Timestamp.fromDate(new Date(0)), // Never refreshed
          nextRefresh: now,
          status: 'pending'
        });
      }
    }

    return jobs;
  }

  private static async processRefreshJob(job: RefreshJob) {
    try {
      // Update job status
      job.status = 'in_progress';
      await this.updateJobStatus(job);

      // Get creator details
      const creator = creators.find(c => c.id === job.creatorId);
      if (!creator) throw new Error(`Creator not found: ${job.creatorId}`);

      // Fetch content based on platform
      let newContent: ContentItem[] = [];
      if (job.platform === 'youtube' && creator.platforms.youtube?.channelId) {
        newContent = await YouTubeService.getChannelVideos(
          creator.platforms.youtube.channelId,
          10 // Fetch last 10 videos
        );
      } else if (job.platform === 'blog' && creator.platforms.blog?.feedUrl) {
        newContent = await RSSService.parseRSSFeed(
          creator.platforms.blog.feedUrl,
          creator.id,
          creator.name
        );
      }

      // Store new content
      await this.storeNewContent(newContent);

      // Update job status
      job.status = 'completed';
      job.lastRefresh = Timestamp.now();
      job.nextRefresh = Timestamp.fromDate(new Date(Date.now() + this.REFRESH_INTERVAL));
      await this.updateJobStatus(job);
    } catch (error) {
      console.error(`Error processing refresh job ${job.id}:`, error);
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      await this.updateJobStatus(job);
    }
  }

  private static async storeNewContent(items: ContentItem[]) {
    const contentRef = collection(db, 'content');
    
    for (const item of items) {
      try {
        // Check if content already exists
        const existingQuery = query(
          contentRef,
          where('sourceUrl', '==', item.sourceUrl)
        );
        const existingDocs = await getDocs(existingQuery);

        if (existingDocs.empty) {
          // Add new content
          await addDoc(contentRef, {
            ...item,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
        }
      } catch (error) {
        console.error('Error storing content item:', error);
      }
    }
  }

  private static async updateJobStatus(job: RefreshJob) {
    try {
      const jobsRef = collection(db, 'refresh_jobs');
      await addDoc(jobsRef, {
        ...job,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  }

  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
} 