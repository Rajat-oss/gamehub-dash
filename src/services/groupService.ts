import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { GameGroup, GroupMember, GroupChallenge, GroupMessage, CreateGroupData } from '@/types/group';

const GROUPS_COLLECTION = 'gameGroups';
const CHALLENGES_COLLECTION = 'groupChallenges';
const MESSAGES_COLLECTION = 'groupMessages';

export const groupService = {
  async createGroup(userId: string, username: string, groupData: CreateGroupData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, GROUPS_COLLECTION), {
        name: groupData.name,
        description: groupData.description,
        ownerId: userId,
        ownerName: username,
        members: [{
          userId,
          username,
          role: 'owner',
          joinedAt: new Date()
        }],
        memberCount: 1,
        isPrivate: groupData.isPrivate,
        tags: groupData.tags,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },

  async getGroups(limitCount: number = 20): Promise<GameGroup[]> {
    try {
      const q = query(
        collection(db, GROUPS_COLLECTION),
        where('isPrivate', '==', false),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        members: doc.data().members?.map((member: any) => ({
          ...member,
          joinedAt: member.joinedAt?.toDate() || new Date()
        })) || []
      })) as GameGroup[];
    } catch (error) {
      console.error('Error getting groups:', error);
      return [];
    }
  },

  async getUserGroups(userId: string): Promise<GameGroup[]> {
    try {
      const snapshot = await getDocs(collection(db, GROUPS_COLLECTION));
      const userGroups = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.members?.some((member: any) => member.userId === userId);
      });
      
      return userGroups.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        members: doc.data().members?.map((member: any) => ({
          ...member,
          joinedAt: member.joinedAt instanceof Date ? member.joinedAt : new Date()
        })) || []
      })) as GameGroup[];
    } catch (error) {
      console.error('Error getting user groups:', error);
      return [];
    }
  },

  async joinGroup(groupId: string, userId: string, username: string): Promise<void> {
    try {
      const groupRef = doc(db, GROUPS_COLLECTION, groupId);
      const newMember: GroupMember = {
        userId,
        username,
        role: 'member',
        joinedAt: new Date()
      };
      
      await updateDoc(groupRef, {
        members: arrayUnion(newMember),
        memberCount: arrayUnion(userId).length,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  },

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    try {
      const groupRef = doc(db, GROUPS_COLLECTION, groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        const updatedMembers = groupData.members.filter((member: GroupMember) => member.userId !== userId);
        
        await updateDoc(groupRef, {
          members: updatedMembers,
          memberCount: updatedMembers.length,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  },

  async createChallenge(challengeData: Omit<GroupChallenge, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, CHALLENGES_COLLECTION), {
        ...challengeData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  },

  async getGroupChallenges(groupId: string): Promise<GroupChallenge[]> {
    try {
      const q = query(
        collection(db, CHALLENGES_COLLECTION),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate() || new Date(),
        endDate: doc.data().endDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as GroupChallenge[];
    } catch (error) {
      console.error('Error getting group challenges:', error);
      return [];
    }
  },

  async sendMessage(groupId: string, userId: string, username: string, message: string): Promise<void> {
    try {
      await addDoc(collection(db, MESSAGES_COLLECTION), {
        groupId,
        userId,
        username,
        message,
        type: 'text',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async getGroupMessages(groupId: string, limitCount: number = 50): Promise<GroupMessage[]> {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('groupId', '==', groupId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as GroupMessage[];
    } catch (error) {
      console.error('Error getting group messages:', error);
      return [];
    }
  }
};