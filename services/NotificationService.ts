import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  deleteDoc,
  updateDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserFollowing } from '../types/Creator';

interface Notification {
  id: string;
  userId: string;
  creatorId: string;
  contentId: string;
  type: 'new_content' | 'creator_update';
  title: string;
  body: string;
  read: boolean;
  createdAt: Timestamp;
}

export class NotificationService {
  private static NOTIFICATIONS_COLLECTION = 'notifications';

  static async createNotification(
    notification: Omit<Notification, 'id' | 'read' | 'createdAt'>
  ): Promise<string> {
    const docRef = await addDoc(collection(db, this.NOTIFICATIONS_COLLECTION), {
      ...notification,
      read: false,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  static async getUserNotifications(
    userId: string,
    pageSize = 20
  ): Promise<Notification[]> {
    const q = query(
      collection(db, this.NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Notification));
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const docRef = doc(db, this.NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(docRef, { read: true });
  }

  static async markAllNotificationsAsRead(userId: string): Promise<void> {
    const q = query(
      collection(db, this.NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    const docRef = doc(db, this.NOTIFICATIONS_COLLECTION, notificationId);
    await deleteDoc(docRef);
  }

  static async notifyFollowersOfNewContent(
    creatorId: string,
    contentId: string,
    contentTitle: string
  ): Promise<void> {
    // Get all users following this creator
    const followersQuery = query(
      collection(db, 'user_following'),
      where('creatorId', '==', creatorId)
    );

    const followersSnapshot = await getDocs(followersQuery);
    const followers = followersSnapshot.docs.map(doc => doc.data() as UserFollowing);

    // Create notifications for each follower based on their notification settings
    const notifications = followers
      .filter(follower => follower.notificationSettings.enabled)
      .map(follower => ({
        userId: follower.userId,
        creatorId,
        contentId,
        type: 'new_content' as const,
        title: 'New Recipe Available',
        body: `Check out the new recipe: ${contentTitle}`,
      }));

    // Batch create notifications
    const batch = writeBatch(db);
    notifications.forEach(notification => {
      const notificationRef = doc(collection(db, this.NOTIFICATIONS_COLLECTION));
      batch.set(notificationRef, {
        ...notification,
        read: false,
        createdAt: Timestamp.now(),
      });
    });

    await batch.commit();
  }

  // This would be implemented with a push notification service like Firebase Cloud Messaging
  static async sendPushNotification(
    userId: string,
    title: string,
    body: string
  ): Promise<void> {
    // Implement push notification sending logic here
    throw new Error('Not implemented');
  }
} 