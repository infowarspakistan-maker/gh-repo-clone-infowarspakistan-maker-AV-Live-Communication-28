export type AgentChannel = 'whatsapp' | 'phone_3cx' | 'web_chat' | 'email';
export type AgentLanguage = 'en' | 'ur' | 'roman_ur';
export type LeadStage = 'new' | 'qualified' | 'quoted' | 'follow_up' | 'won' | 'lost';
export type ApprovalType = 'gmail_quote' | 'gmail_followup' | 'gmail_daily_report' | 'whatsapp_followup';
export type ApprovalStatus = 'pending_approval' | 'sent' | 'rejected';
export type TaskCadenceStep = 'day_1' | 'day_3' | 'day_7' | 'custom';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'completed' | 'snoozed';

export interface AgentActionButton {
  type: 'cta_url' | 'reply';
  title: string;
  url?: string;
  payload?: string;
}

export interface AgentMessageEntry {
  id: string;
  role: 'customer' | 'agent' | 'system';
  text: string;
  language?: AgentLanguage;
  buttons?: AgentActionButton[];
  groundingSource?: 'catalog' | 'google_search' | 'catalog+google_search';
  searchSources?: Array<{ title: string; url: string }>;
  timestamp: string;
  whatsappPayloadPreview?: Record<string, unknown>;
}

export interface AILeadRecord {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  city?: string;
  channel: AgentChannel;
  language: AgentLanguage;
  stage: LeadStage;
  intentSummary?: string;
  interestedSkus?: string[];
  estimatedValuePkr?: number;
  escalated?: boolean;
  sheetSyncedAt?: string;
  lastContactAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AIConversationRecord {
  id: string;
  leadId?: string;
  customerName: string;
  customerPhone?: string;
  channel: 'whatsapp' | 'phone_3cx' | 'web_chat';
  language: AgentLanguage;
  status: 'open' | 'escalated' | 'resolved';
  lastMessage?: string;
  messages: AgentMessageEntry[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface QuoteLineItem {
  sku: string;
  productName: string;
  unitPricePkr: number;
  quantity: number;
  productUrl?: string;
}

export interface AIApprovalRecord {
  id: string;
  type: ApprovalType;
  leadId?: string;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  subject: string;
  bodyHtml?: string;
  bodyText: string;
  quoteTotalPkr?: number;
  quoteItems?: QuoteLineItem[];
  buttons?: AgentActionButton[];
  status: ApprovalStatus;
  approvedBy?: string;
  sentAt?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AITaskRecord {
  id: string;
  leadId?: string;
  leadName?: string;
  title: string;
  notes?: string;
  cadenceStep: TaskCadenceStep;
  channel: 'whatsapp' | 'phone_3cx' | 'email' | 'internal';
  priority: TaskPriority;
  status: TaskStatus;
  dueAt: string;
  googleTaskId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AIDailyReportMetrics {
  totalConversations: number;
  whatsappChats: number;
  phoneCalls3cx: number;
  webChats: number;
  newLeads: number;
  quotesDrafted: number;
  quotesSent: number;
  pipelinePkr: number;
  pendingTasks: number;
  overdueTasks: number;
  escalations: number;
}

export interface AIDailyReportRecord {
  id: string;
  reportDate: string;
  summaryText: string;
  summaryHtml?: string;
  metrics: AIDailyReportMetrics;
  status: 'draft' | 'sent';
  sentTo?: string;
  createdAt?: unknown;
}

export interface AgentTurnResponse {
  replyText: string;
  language: AgentLanguage;
  buttons: AgentActionButton[];
  groundingSource: 'catalog' | 'google_search' | 'catalog+google_search';
  searchSources: Array<{ title: string; url: string }>;
  escalated: boolean;
  escalationReason?: string;
  extractedLead: {
    name?: string;
    company?: string;
    phone?: string;
    email?: string;
    city?: string;
    intentSummary?: string;
    interestedSkus: string[];
    estimatedValuePkr: number;
  };
  suggestedTask?: {
    title: string;
    cadenceStep: TaskCadenceStep;
    channel: 'whatsapp' | 'phone_3cx' | 'email' | 'internal';
    priority: TaskPriority;
    dueInDays: number;
    notes: string;
  };
  whatsappPayloadPreview: Record<string, unknown>;
  matchedProducts: Array<{
    sku: string;
    name: string;
    pricePkr: number;
    url: string;
  }>;
}

export const AI_CRM_SHEET_TABS = [
  {
    title: 'Leads',
    headers: [
      'Lead ID',
      'Date',
      'Name',
      'Company',
      'Phone',
      'Email',
      'City',
      'Channel',
      'Language',
      'Stage',
      'Interested SKUs',
      'Est. Value (PKR)',
      'Escalated',
      'Intent Summary',
    ],
  },
  {
    title: 'Quotes',
    headers: [
      'Quote ID',
      'Date',
      'Recipient',
      'Email',
      'Subject',
      'Items',
      'Total (PKR)',
      'Status',
      'Approved By',
      'Sent At',
    ],
  },
  {
    title: 'Follow-Up Tasks',
    headers: [
      'Task ID',
      'Lead Name',
      'Title',
      'Cadence',
      'Channel',
      'Priority',
      'Status',
      'Due Date',
      'Google Task ID',
      'Notes',
    ],
  },
  {
    title: 'Daily Reports',
    headers: [
      'Report Date',
      'WhatsApp Chats',
      '3CX Calls',
      'Web Chats',
      'New Leads',
      'Quotes Drafted',
      'Quotes Sent',
      'Pipeline (PKR)',
      'Overdue Tasks',
      'Escalations',
      'Executive Summary',
    ],
  },
];
