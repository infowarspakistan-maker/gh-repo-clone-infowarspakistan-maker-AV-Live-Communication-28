import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './firebase/client';
import type {
  AILeadRecord,
  AIConversationRecord,
  AIApprovalRecord,
  AITaskRecord,
  AIDailyReportRecord,
} from './ai-agent-types';

export enum AIOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
}

export function handleAIFirestoreError(
  error: unknown,
  operationType: AIOperationType,
  path: string
): Error {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || false,
    },
  };
  console.error('AI Agent Firestore Error:', JSON.stringify(errInfo));
  return new Error(errInfo.error || `Firestore ${operationType} failed on ${path}`);
}

function makeSafeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`;
}

export function subscribeAILeads(
  onData: (rows: AILeadRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'ai_leads'), orderBy('updatedAt', 'desc'), limit(200));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AILeadRecord, 'id'>) })));
    },
    (err) => {
      const wrapped = handleAIFirestoreError(err, AIOperationType.LIST, 'ai_leads');
      onError?.(wrapped);
    }
  );
}

export function subscribeAIConversations(
  onData: (rows: AIConversationRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'ai_conversations'), orderBy('updatedAt', 'desc'), limit(100));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AIConversationRecord, 'id'>) }))
      );
    },
    (err) => {
      const wrapped = handleAIFirestoreError(err, AIOperationType.LIST, 'ai_conversations');
      onError?.(wrapped);
    }
  );
}

export function subscribeAIApprovals(
  onData: (rows: AIApprovalRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'ai_approval_queue'), orderBy('updatedAt', 'desc'), limit(100));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AIApprovalRecord, 'id'>) })));
    },
    (err) => {
      const wrapped = handleAIFirestoreError(err, AIOperationType.LIST, 'ai_approval_queue');
      onError?.(wrapped);
    }
  );
}

export function subscribeAITasks(
  onData: (rows: AITaskRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'ai_tasks'), orderBy('dueAt', 'asc'), limit(150));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AITaskRecord, 'id'>) })));
    },
    (err) => {
      const wrapped = handleAIFirestoreError(err, AIOperationType.LIST, 'ai_tasks');
      onError?.(wrapped);
    }
  );
}

export function subscribeAIDailyReports(
  onData: (rows: AIDailyReportRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'ai_daily_reports'), orderBy('createdAt', 'desc'), limit(30));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AIDailyReportRecord, 'id'>) }))
      );
    },
    (err) => {
      const wrapped = handleAIFirestoreError(err, AIOperationType.LIST, 'ai_daily_reports');
      onError?.(wrapped);
    }
  );
}

export async function createAILead(
  payload: Omit<AILeadRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = makeSafeId('lead');
  try {
    await setDoc(doc(db, 'ai_leads', id), {
      name: String(payload.name || 'Unnamed Lead').slice(0, 200),
      company: String(payload.company || '').slice(0, 200),
      phone: String(payload.phone || '').slice(0, 50),
      email: String(payload.email || '').slice(0, 200),
      city: String(payload.city || '').slice(0, 100),
      channel: payload.channel,
      language: payload.language,
      stage: payload.stage,
      intentSummary: String(payload.intentSummary || '').slice(0, 1000),
      interestedSkus: (payload.interestedSkus || []).slice(0, 20),
      estimatedValuePkr: Math.max(0, Math.round(Number(payload.estimatedValuePkr || 0))),
      escalated: Boolean(payload.escalated),
      sheetSyncedAt: payload.sheetSyncedAt || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (err) {
    throw handleAIFirestoreError(err, AIOperationType.CREATE, `ai_leads/${id}`);
  }
}

export async function updateAILead(
  id: string,
  updates: Partial<Omit<AILeadRecord, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'ai_leads', id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    throw handleAIFirestoreError(err, AIOperationType.UPDATE, `ai_leads/${id}`);
  }
}

export async function deleteAILead(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'ai_leads', id));
  } catch (err) {
    throw handleAIFirestoreError(err, AIOperationType.DELETE, `ai_leads/${id}`);
  }
}

export async function createAIConversation(
  payload: Omit<AIConversationRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = makeSafeId('conv');
  try {
    await setDoc(doc(db, 'ai_conversations', id), {
      leadId: String(payload.leadId || '').slice(0, 128),
      customerName: String(payload.customerName || 'Guest').slice(0, 200),
      customerPhone: String(payload.customerPhone || '').slice(0, 50),
      channel: payload.channel,
      language: payload.language,
      status: payload.status,
      lastMessage: String(payload.lastMessage || '').slice(0, 1000),
      messages: (payload.messages || []).slice(-60),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (err) {
    throw handleAIFirestoreError(err, AIOperationType.CREATE, `ai_conversations/${id}`);
  }
}

export async function updateAIConversation(
  id: string,
  updates: Partial<Omit<AIConversationRecord, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'ai_conversations', id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    throw handleAIFirestoreError(err, AIOperationType.UPDATE, `ai_conversations/${id}`);
  }
}

export async function createAIApprovalItem(
  payload: Omit<AIApprovalRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = makeSafeId('appr');
  try {
    await setDoc(doc(db, 'ai_approval_queue', id), {
      type: payload.type,
      leadId: String(payload.leadId || '').slice(0, 128),
      recipientName: String(payload.recipientName || 'Customer').slice(0, 200),
      recipientEmail: String(payload.recipientEmail || '').slice(0, 200),
      recipientPhone: String(payload.recipientPhone || '').slice(0, 50),
      subject: String(payload.subject || 'AV Live Follow-Up').slice(0, 300),
      bodyHtml: String(payload.bodyHtml || '').slice(0, 15000),
      bodyText: String(payload.bodyText || '').slice(0, 5000),
      quoteTotalPkr: Math.max(0, Math.round(Number(payload.quoteTotalPkr || 0))),
      quoteItems: (payload.quoteItems || []).slice(0, 50),
      buttons: (payload.buttons || []).slice(0, 5),
      status: payload.status,
      approvedBy: String(payload.approvedBy || '').slice(0, 200),
      sentAt: String(payload.sentAt || '').slice(0, 64),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (err) {
    throw handleAIFirestoreError(err, AIOperationType.CREATE, `ai_approval_queue/${id}`);
  }
}

export async function updateAIApprovalItem(
  id: string,
  updates: Partial<Omit<AIApprovalRecord, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'ai_approval_queue', id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    throw handleAIFirestoreError(err, AIOperationType.UPDATE, `ai_approval_queue/${id}`);
  }
}

export async function createAITask(
  payload: Omit<AITaskRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = makeSafeId('task');
  try {
    await setDoc(doc(db, 'ai_tasks', id), {
      leadId: String(payload.leadId || '').slice(0, 128),
      leadName: String(payload.leadName || '').slice(0, 200),
      title: String(payload.title || 'Follow up with lead').slice(0, 300),
      notes: String(payload.notes || '').slice(0, 2000),
      cadenceStep: payload.cadenceStep,
      channel: payload.channel,
      priority: payload.priority,
      status: payload.status,
      dueAt: String(payload.dueAt).slice(0, 64),
      googleTaskId: String(payload.googleTaskId || '').slice(0, 200),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (err) {
    throw handleAIFirestoreError(err, AIOperationType.CREATE, `ai_tasks/${id}`);
  }
}

export async function updateAITask(
  id: string,
  updates: Partial<Omit<AITaskRecord, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'ai_tasks', id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    throw handleAIFirestoreError(err, AIOperationType.UPDATE, `ai_tasks/${id}`);
  }
}

export async function createAIDailyReport(
  payload: Omit<AIDailyReportRecord, 'id' | 'createdAt'>
): Promise<string> {
  const id = makeSafeId('rep');
  try {
    await setDoc(doc(db, 'ai_daily_reports', id), {
      reportDate: String(payload.reportDate).slice(0, 32),
      summaryText: String(payload.summaryText).slice(0, 6000),
      summaryHtml: String(payload.summaryHtml || '').slice(0, 15000),
      metrics: payload.metrics,
      status: payload.status,
      sentTo: String(payload.sentTo || '').slice(0, 200),
      createdAt: serverTimestamp(),
    });
    return id;
  } catch (err) {
    throw handleAIFirestoreError(err, AIOperationType.CREATE, `ai_daily_reports/${id}`);
  }
}

export async function updateAIDailyReport(
  id: string,
  updates: Partial<Omit<AIDailyReportRecord, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'ai_daily_reports', id), updates);
  } catch (err) {
    throw handleAIFirestoreError(err, AIOperationType.UPDATE, `ai_daily_reports/${id}`);
  }
}
