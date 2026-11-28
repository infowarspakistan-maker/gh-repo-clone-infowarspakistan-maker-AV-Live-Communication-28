import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebase/client';

// In-memory cache for the Google OAuth access token
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Dedicated provider so Workspace OAuth scopes never pollute standard Firebase Auth Google Sign-In
const workspaceGoogleProvider = new GoogleAuthProvider();
workspaceGoogleProvider.setCustomParameters({ prompt: 'select_account' });

// List of required Google Workspace scopes
export const WORKSPACE_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/chat.spaces',
  'https://www.googleapis.com/auth/chat.spaces.readonly',
  'https://www.googleapis.com/auth/chat.messages',
  'https://www.googleapis.com/auth/chat.messages.create',
  'https://www.googleapis.com/auth/chat.messages.readonly',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/tasks.readonly',
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/spreadsheets',
];

// Configure the dedicated Workspace provider with required scopes
export function configureWorkspaceScopes() {
  WORKSPACE_SCOPES.forEach(scope => {
    workspaceGoogleProvider.addScope(scope);
  });
}

// Connect/sign in to obtain the access token
export async function connectWorkspace(): Promise<string> {
  if (cachedAccessToken) return cachedAccessToken;
  
  configureWorkspaceScopes();
  isSigningIn = true;
  try {
    const result = await signInWithPopup(auth, workspaceGoogleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve OAuth access token from Google.');
    }
    cachedAccessToken = credential.accessToken;
    return cachedAccessToken;
  } catch (error) {
    console.error('Error connecting to Workspace:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

// Check connection status
export function isWorkspaceConnected(): boolean {
  return cachedAccessToken !== null;
}

// Get the token in-memory
export function getWorkspaceAccessToken(): string | null {
  return cachedAccessToken;
}

// Disconnect Workspace (signs out from Firebase as well to clear state)
export async function disconnectWorkspace(): Promise<void> {
  cachedAccessToken = null;
  await firebaseSignOut(auth);
}

// Clear token manually
export function clearWorkspaceToken(): void {
  cachedAccessToken = null;
}

// Generic Google API fetch helper
async function googleApiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getWorkspaceAccessToken();
  if (!token) {
    throw new Error('Workspace is not authenticated. Please sign in with Google first.');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  };

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    // Clear expired token
    clearWorkspaceToken();
    throw new Error('Access token expired. Please reconnect your Workspace account.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Google API error (Status ${response.status})`);
  }

  return response.json() as Promise<T>;
}

// ==========================================
// GMAIL API SERVICES
// ==========================================

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet?: string;
  payload?: {
    headers: Array<{ name: string; value: string }>;
    body?: { size: number; data?: string };
    parts?: Array<{
      mimeType: string;
      body?: { size: number; data?: string };
    }>;
  };
}

export interface GmailListResponse {
  messages?: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export async function listEmails(q = 'label:INBOX', maxResults = 10, pageToken?: string): Promise<GmailListResponse> {
  let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=${maxResults}`;
  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }
  return googleApiFetch<GmailListResponse>(url);
}

export async function getEmailDetails(id: string): Promise<GmailMessage> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`;
  return googleApiFetch<GmailMessage>(url);
}

export async function trashEmail(id: string): Promise<void> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`;
  await googleApiFetch<{ id: string }>(url, { method: 'POST' });
}

// Helper to construct and send a raw RFC 2822 email string in base64url format
export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    body,
  ];
  
  const emailStr = emailLines.join('\r\n');
  const base64UrlSafe = btoa(unescape(encodeURIComponent(emailStr)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
  await googleApiFetch<{ id: string; threadId: string }>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: base64UrlSafe }),
  });
}


// ==========================================
// GOOGLE CHAT API SERVICES
// ==========================================

export interface ChatSpace {
  name: string; // e.g., "spaces/ABC"
  displayName?: string;
  type?: 'SPACE' | 'DIRECT_MESSAGE';
  spaceType?: 'SPACE' | 'DIRECT_MESSAGE';
}

export interface ChatMessage {
  name: string; // e.g., "spaces/ABC/messages/123"
  sender?: {
    name: string;
    displayName: string;
    avatarUrl?: string;
    type?: 'HUMAN' | 'BOT';
  };
  createTime?: string;
  text?: string;
}

export async function listChatSpaces(): Promise<{ spaces: ChatSpace[] }> {
  const url = 'https://chat.googleapis.com/v1/spaces';
  return googleApiFetch<{ spaces: ChatSpace[] }>(url);
}

export async function listChatMessages(spaceName: string, pageSize = 20): Promise<{ messages?: ChatMessage[] }> {
  const url = `https://chat.googleapis.com/v1/${spaceName}/messages?pageSize=${pageSize}`;
  return googleApiFetch<{ messages?: ChatMessage[] }>(url);
}

export async function sendChatMessage(spaceName: string, text: string): Promise<ChatMessage> {
  const url = `https://chat.googleapis.com/v1/${spaceName}/messages`;
  return googleApiFetch<ChatMessage>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
}


// ==========================================
// GOOGLE TASKS API SERVICES
// ==========================================

export interface TaskList {
  id: string;
  title: string;
  updated?: string;
  selfLink?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
}

export async function listTaskLists(): Promise<{ items?: TaskList[] }> {
  const url = 'https://tasks.googleapis.com/tasks/v1/users/@me/lists';
  return googleApiFetch<{ items?: TaskList[] }>(url);
}

export async function listTasks(listId: string): Promise<{ items?: TaskItem[] }> {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks?showCompleted=true&showHidden=true`;
  return googleApiFetch<{ items?: TaskItem[] }>(url);
}

export async function createTask(listId: string, title: string, notes?: string, due?: string): Promise<TaskItem> {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`;
  return googleApiFetch<TaskItem>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, notes, due }),
  });
}

export async function updateTaskStatus(listId: string, taskId: string, taskTitle: string, isCompleted: boolean): Promise<TaskItem> {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks/${taskId}`;
  return googleApiFetch<TaskItem>(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: taskId,
      title: taskTitle,
      status: isCompleted ? 'completed' : 'needsAction',
    }),
  });
}

export async function deleteTask(listId: string, taskId: string): Promise<void> {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks/${taskId}`;
  await googleApiFetch<void>(url, { method: 'DELETE' });
}


// ==========================================
// GOOGLE CONTACTS (PEOPLE API) SERVICES
// ==========================================

export interface ContactPerson {
  resourceName: string; // e.g. "people/c123456"
  etag: string;
  names?: Array<{ displayName: string; givenName?: string; familyName?: string }>;
  emailAddresses?: Array<{ value: string; type?: string; formattedType?: string }>;
  phoneNumbers?: Array<{ value: string; type?: string; formattedType?: string }>;
  photos?: Array<{ url: string; default?: boolean }>;
}

export async function listContacts(pageSize = 100): Promise<{ connections?: ContactPerson[] }> {
  const url = `https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos&pageSize=${pageSize}`;
  return googleApiFetch<{ connections?: ContactPerson[] }>(url);
}

export async function searchContacts(query: string): Promise<{ results?: Array<{ person: ContactPerson }> }> {
  const url = `https://people.googleapis.com/v1/people:searchContacts?query=${encodeURIComponent(query)}&readMask=names,emailAddresses,phoneNumbers,photos`;
  return googleApiFetch<{ results?: Array<{ person: ContactPerson }> }>(url);
}

// ==========================================
// GOOGLE SHEETS API v4 SERVICES
// ==========================================

export interface SpreadsheetMetadata {
  spreadsheetId: string;
  spreadsheetUrl?: string;
  properties: {
    title: string;
  };
  sheets: Array<{
    properties: {
      sheetId: number;
      title: string;
      index: number;
    };
  }>;
}

export interface SheetValuesResponse {
  range?: string;
  majorDimension?: string;
  values?: string[][];
}

function escapeSheetTitle(sheetTitle: string): string {
  const safe = sheetTitle.replace(/'/g, "''");
  return `'${safe}'`;
}

export async function getSpreadsheetMetadata(spreadsheetId: string): Promise<SpreadsheetMetadata> {
  const cleanId = encodeURIComponent(spreadsheetId.trim());
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=spreadsheetId,spreadsheetUrl,properties.title,sheets.properties(sheetId,title,index)`;
  return googleApiFetch<SpreadsheetMetadata>(url);
}

export async function createSpreadsheet(
  title: string,
  tabDefinitions: Array<{ title: string; headers: string[] }>
): Promise<SpreadsheetMetadata> {
  const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  const created = await googleApiFetch<SpreadsheetMetadata>(createUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      properties: { title },
      sheets: tabDefinitions.map((tab, idx) => ({
        properties: { title: tab.title, index: idx },
      })),
    }),
  });

  // Populate header rows for all newly created tabs
  if (tabDefinitions.length > 0 && created.spreadsheetId) {
    const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(created.spreadsheetId)}/values:batchUpdate`;
    await googleApiFetch<unknown>(batchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: tabDefinitions.map((tab) => ({
          range: `${escapeSheetTitle(tab.title)}!A1`,
          values: [tab.headers],
        })),
      }),
    });
  }

  return created;
}

export async function readSheetRange(spreadsheetId: string, range: string): Promise<SheetValuesResponse> {
  const cleanId = encodeURIComponent(spreadsheetId.trim());
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(range)}`;
  return googleApiFetch<SheetValuesResponse>(url);
}

export async function ensureSheetTabs(
  spreadsheetId: string,
  tabDefinitions: Array<{ title: string; headers: string[] }>
): Promise<{ spreadsheetTitle: string; createdTabs: string[]; existingTabs: string[] }> {
  const meta = await getSpreadsheetMetadata(spreadsheetId);
  const existingTitles = meta.sheets.map((s) => s.properties.title);
  const existingSet = new Set(existingTitles);
  const missingTabs = tabDefinitions.filter((t) => !existingSet.has(t.title));

  if (missingTabs.length > 0) {
    const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId.trim())}:batchUpdate`;
    await googleApiFetch<unknown>(batchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: missingTabs.map((t) => ({
          addSheet: { properties: { title: t.title } },
        })),
      }),
    });

    const headerBatchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId.trim())}/values:batchUpdate`;
    await googleApiFetch<unknown>(headerBatchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: missingTabs.map((t) => ({
          range: `${escapeSheetTitle(t.title)}!A1`,
          values: [t.headers],
        })),
      }),
    });
  }

  return {
    spreadsheetTitle: meta.properties.title,
    createdTabs: missingTabs.map((t) => t.title),
    existingTabs: existingTitles,
  };
}

export async function appendSheetRows(
  spreadsheetId: string,
  sheetTitle: string,
  rows: Array<Array<string | number>>
): Promise<{ updatedRows: number; updatedRange: string }> {
  if (!rows.length) {
    return { updatedRows: 0, updatedRange: '' };
  }
  const cleanId = encodeURIComponent(spreadsheetId.trim());
  const range = encodeURIComponent(`${escapeSheetTitle(sheetTitle)}!A1`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const result = await googleApiFetch<{
    updates?: { updatedRows?: number; updatedRange?: string };
  }>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: rows }),
  });

  return {
    updatedRows: result.updates?.updatedRows || rows.length,
    updatedRange: result.updates?.updatedRange || '',
  };
}

