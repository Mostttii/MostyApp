import { Creator } from '../types/Creator';

// Real food content creators - simplified version for testing
export const sampleCreators: Omit<Creator, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Joshua Weissman',
    bio: 'Award-winning chef known for advanced cooking techniques, recipe recreations, and making everything from scratch.',
    avatar: 'https://yt3.googleusercontent.com/ytc/AIf8zZTDkajQxPa4sjDOW-c3er1szXkSAO-H9TiF4-8u=s176-c-k-c0x00ffffff-no-rj',
    platforms: {
      youtube: {
        channelId: 'UChBEbMKI1eCcejTtmI32UEw',
        handle: '@JoshuaWeissman'
      }
    },
    tags: ['cooking', 'chef'],
    socialLinks: {},
    featured: true
  }
]; 