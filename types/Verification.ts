import { Timestamp } from 'firebase/firestore';

export type VerificationStatus = 'pending' | 'verified' | 'unverified' | 'rejected';

export interface VerificationMetadata {
  status: VerificationStatus;
  verifiedAt?: Timestamp;
  verifiedBy?: string;
  reason?: string;
  badge?: string;
  lastReviewedAt: Timestamp;
  nextReviewAt?: Timestamp;
  platformVerifications: {
    youtube?: boolean;
    instagram?: boolean;
    tiktok?: boolean;
    blog?: boolean;
  };
}

export interface VerificationRequest {
  creatorId: string;
  status: VerificationStatus;
  submittedAt: Timestamp;
  platformLinks: {
    youtube?: string;
    instagram?: string;
    tiktok?: string;
    blog?: string;
  };
  additionalNotes?: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
} 