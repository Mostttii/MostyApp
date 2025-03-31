import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { VerificationStatus, VerificationRequest, VerificationMetadata } from '../types/Verification';

const VERIFICATION_REQUESTS_COLLECTION = 'verification_requests';
const CREATORS_COLLECTION = 'creators';

export class VerificationService {
  static async submitVerificationRequest(
    creatorId: string,
    platformLinks: VerificationRequest['platformLinks'],
    additionalNotes?: string
  ): Promise<string> {
    try {
      const request: Omit<VerificationRequest, 'creatorId'> = {
        status: 'pending',
        submittedAt: Timestamp.now(),
        platformLinks,
        additionalNotes,
      };

      const docRef = await addDoc(collection(db, VERIFICATION_REQUESTS_COLLECTION), {
        creatorId,
        ...request,
      });

      return docRef.id;
    } catch (error) {
      console.error('Error submitting verification request:', error);
      throw error;
    }
  }

  static async getVerificationStatus(creatorId: string): Promise<VerificationMetadata | null> {
    try {
      const creatorDoc = await getDoc(doc(db, CREATORS_COLLECTION, creatorId));
      if (!creatorDoc.exists()) return null;

      const data = creatorDoc.data();
      return data.verification || null;
    } catch (error) {
      console.error('Error getting verification status:', error);
      throw error;
    }
  }

  static async updateVerificationStatus(
    creatorId: string,
    status: VerificationStatus,
    reviewerId: string,
    reason?: string
  ): Promise<void> {
    try {
      const creatorRef = doc(db, CREATORS_COLLECTION, creatorId);
      const now = Timestamp.now();

      const verificationMetadata: VerificationMetadata = {
        status,
        verifiedAt: now,
        verifiedBy: reviewerId,
        reason,
        lastReviewedAt: now,
        nextReviewAt: Timestamp.fromDate(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)), // 180 days
        platformVerifications: {},
      };

      await updateDoc(creatorRef, {
        verification: verificationMetadata,
      });

      // Update any pending verification requests
      const requestsQuery = query(
        collection(db, VERIFICATION_REQUESTS_COLLECTION),
        where('creatorId', '==', creatorId),
        where('status', '==', 'pending')
      );

      const requestsSnapshot = await getDocs(requestsQuery);
      const batch = requestsSnapshot.docs.map(doc =>
        updateDoc(doc.ref, {
          status,
          reviewedBy: reviewerId,
          reviewedAt: now,
          reviewNotes: reason,
        })
      );

      await Promise.all(batch);
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw error;
    }
  }

  static async getPendingVerificationRequests(): Promise<VerificationRequest[]> {
    try {
      const requestsQuery = query(
        collection(db, VERIFICATION_REQUESTS_COLLECTION),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(requestsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as VerificationRequest & { id: string }));
    } catch (error) {
      console.error('Error getting pending verification requests:', error);
      throw error;
    }
  }

  static async getCreatorVerificationHistory(creatorId: string): Promise<VerificationRequest[]> {
    try {
      const requestsQuery = query(
        collection(db, VERIFICATION_REQUESTS_COLLECTION),
        where('creatorId', '==', creatorId)
      );

      const snapshot = await getDocs(requestsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as VerificationRequest & { id: string }));
    } catch (error) {
      console.error('Error getting creator verification history:', error);
      throw error;
    }
  }
} 