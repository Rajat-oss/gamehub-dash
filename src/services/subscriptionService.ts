import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserSubscription {
  plan: 'free' | 'pro' | 'elite';
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  paymentId?: string;
}

export const subscriptionService = {
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const docRef = doc(db, 'subscriptions', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
        } as UserSubscription;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  },

  async createSubscription(userId: string, plan: 'pro' | 'elite', paymentId: string): Promise<void> {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

      const subscription: UserSubscription = {
        plan,
        status: 'active',
        startDate,
        endDate,
        paymentId,
      };

      await setDoc(doc(db, 'subscriptions', userId), subscription);
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  async cancelSubscription(userId: string): Promise<void> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (subscription) {
        subscription.status = 'cancelled';
        await setDoc(doc(db, 'subscriptions', userId), subscription);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  },

  hasFeatureAccess(subscription: UserSubscription | null, feature: string): boolean {
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    const proFeatures = [
      'unlimited_games',
      'advanced_analytics',
      'custom_themes',
      'screenshot_uploads',
      'ai_recommendations',
    ];

    const eliteFeatures = [
      ...proFeatures,
      'unlimited_screenshots',
      'advanced_ai',
      'custom_challenges',
      'priority_support',
      'beta_access',
    ];

    if (subscription.plan === 'pro') {
      return proFeatures.includes(feature);
    }

    if (subscription.plan === 'elite') {
      return eliteFeatures.includes(feature);
    }

    return false;
  },
};