export interface Video {
  id: string;
  title: string;
  thumbnail?: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  metadata: {
    estimatedTime?: number;
  };
} 