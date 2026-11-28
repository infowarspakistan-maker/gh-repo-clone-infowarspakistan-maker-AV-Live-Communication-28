import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  MessageSquare,
  Phone,
  Globe,
  Send,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  Table2,
  Mail,
  Sparkles,
  ExternalLink,
  Search,
  RefreshCw,
  ShieldCheck,
  X,
  Code2,
  Calendar,
  Workflow,
} from 'lucide-react';
import { auth } from '../../lib/firebase/client';
import {
  connectWorkspace,
  isWorkspaceConnected,
  sendEmail,
  createSpreadsheet,
  ensureSheetTabs,
  appendSheetRows,
  listTaskLists,
  createTask as createGoogleTask,
} from '../../lib/workspaceService';
import {
  PRODUCT_GMC_METADATA,
  PRODUCT_ID_TO_SEO_SLUG,
  buildFallbackProductFromGmcMeta,
  getCanonicalProductSlug,
  resolveProductPricing,
} from '../../lib/gmc-feed';
import {
  subscribeAILeads,
  subscribeAIConversations,
  subscribeAIApprovals,
  subscribeAITasks,
  subscribeAIDailyReports,
  createAILead,
  updateAILead,
  deleteAILead,
  createAIConversation,
  updateAIConversation,
  createAIApprovalItem,
  updateAIApprovalItem,
  createAITask,
  updateAITask,
  createAIDailyReport,
  updateAIDailyReport,
} from '../../lib/ai-agent-firestore';
import {
  AI_CRM_SHEET_TABS,
  type AILeadRecord,
  type AIConversationRecord,
  type AIApprovalRecord,
  type AITaskRecord,
  type AIDailyReportRecord,
  type AgentChannel,
  type AgentLanguage,
  type AgentTurnResponse,
  type LeadStage,
  type QuoteLineItem,
  type TaskCadenceStep,
} from '../../lib/ai-agent-types';
import {
  buildN8nLeadSyncBlueprint,
  buildN8nFollowUpCadenceBlueprint,
  buildN8nDailyReportBlueprint,
  build3cxGeminiLiveBridgeScript,
} from '../../lib/ai-agent-blueprints';

type ActiveTab = 'inbox' | 'leads' | 'approvals' | 'tasks' | 'setup';

interface ConfirmDialogState {
  title: string;
  description: string;
  details: Array<{ label: string; value: string }>;
  confirmLabel: string;
  tone?: 'primary' | 'danger';
  onConfirm: () => Promise<void>;
}

interface ServerStatusInfo {
  geminiConfigured: boolean;
  whatsappConfigured: boolean;
  whatsappVerifyTokenConfigured: boolean;
  whatsappAppSecretConfigured: boolean;
  threecxBridgeConfigured: boolean;
  appUrl: string;
  webhooks: {
    whatsapp: string;
    threecxCallEvent: string;
    publicChat: string;
  };
}

interface CatalogPickerItem {
  sku: string;
  name: string;
  pricePkr: number;
  url: string;
}

const CATALOG_PRODUCTS: CatalogPickerItem[] = (() => {
  const seen = new Set<string>();
  const items: CatalogPickerItem[] = [];
  for (const slug of Object.keys(PRODUCT_GMC_METADATA)) {
    if (PRODUCT_ID_TO_SEO_SLUG[slug]) continue;
    const p = buildFallbackProductFromGmcMeta(slug);
    if (!p) continue;
    const canonical = getCanonicalProductSlug(p, p.id);
    if (seen.has(canonical)) continue;
    seen.add(canonical);
    const pricing = resolveProductPricing(p);
    items.push({
      sku: String(p.sku || canonical).toUpperCase(),
      name: String(p.productName || p.name || canonical),
      pricePkr: pricing.effectivePrice,
      url: `https://avlive.com.pk/product/${canonical}`,
    });
  }
  return items.sort((a, b) => a.name.localeCompare(b.name));
})();

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  phone_3cx: '3CX Phone',
  web_chat: 'Web Chat',
  email: 'Email',
  internal: 'Internal',
};

const LANG_LABELS: Record<AgentLanguage, string> = {
  en: 'English',
  ur: 'اردو',
  roman_ur: 'Roman Urdu',
};

const STAGE_OPTIONS: LeadStage[] = ['new', 'qualified', 'quoted', 'follow_up', 'won', 'lost'];

const QUICK_SIMULATOR_PROMPTS = [
  {
    label: 'Roman Urdu · Poly X50',
    channel: 'whatsapp' as const,
    text: 'Salam bhai, 10 person boardroom ke liye Poly Studio X50 ki price aur warranty kya hai? Mera naam Bilal, company TechGrid Lahore, phone 0300-4455667.',
  },
  {
    label: 'Urdu · 3CX VoIP',
    channel: 'whatsapp' as const,
    text: 'السلام علیکم، ہمیں اسلام آباد آفس کے لیے 3CX فون سسٹم اور آئی پی فونز کا کوٹیشن چاہیے۔',
  },
  {
    label: 'English · Cisco vs Logitech (Web Search)',
    channel: 'web_chat' as const,
    text: 'Hi, how does Cisco Room Bar compare with Logitech Rally Bar for Microsoft Teams Rooms? Please share pricing in PKR.',
  },
  {
    label: '3CX Phone · Corporate Event Escalation',
    channel: 'phone_3cx' as const,
    text: 'Caller requesting an urgent 500-person summit in Karachi with 3D hologram stage and P2.5 LED wall, budget around PKR 3,500,000, wants a manager callback.',
  },
];

function formatPkr(amount: number | undefined): string {
  return `PKR ${Math.round(Number(amount || 0)).toLocaleString('en-PK')}`;
}

function downloadTextFile(filename: string, content: string, mime = 'application/json') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatDateIso(daysFromNow = 0): string {
  return new Date(Date.now() + daysFromNow * 86_400_000).toISOString().slice(0, 10);
}

export function AIAgentConsole() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('inbox');
  const [workspaceReady, setWorkspaceReady] = useState<boolean>(isWorkspaceConnected());
  const [connectingWorkspace, setConnectingWorkspace] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmDialogState | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  // Real-time Firestore state
  const [leads, setLeads] = useState<AILeadRecord[]>([]);
  const [conversations, setConversations] = useState<AIConversationRecord[]>([]);
  const [approvals, setApprovals] = useState<AIApprovalRecord[]>([]);
  const [tasks, setTasks] = useState<AITaskRecord[]>([]);
  const [reports, setReports] = useState<AIDailyReportRecord[]>([]);

  // Server readiness status
  const [serverStatus, setServerStatus] = useState<ServerStatusInfo | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tab 1: Inbox & Interactive Simulator state
  const [inboxChannelFilter, setInboxChannelFilter] = useState<'all' | 'whatsapp' | 'phone_3cx' | 'web_chat'>('all');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [simChannel, setSimChannel] = useState<'whatsapp' | 'phone_3cx' | 'web_chat'>('whatsapp');
  const [simCustomerName, setSimCustomerName] = useState('Bilal Ahmed');
  const [simCustomerPhone, setSimCustomerPhone] = useState('+923004455667');
  const [simCustomerEmail, setSimCustomerEmail] = useState('bilal@techgrid.pk');
  const [simInput, setSimInput] = useState('');
  const [simAllowSearch, setSimAllowSearch] = useState(true);
  const [simLoading, setSimLoading] = useState(false);
  const [lastTurnResult, setLastTurnResult] = useState<AgentTurnResponse | null>(null);
  const [showJsonInspector, setShowJsonInspector] = useState(false);

  // Tab 2: Leads CRM, Google Sheets & Instant PKR Quote Builder
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStageFilter, setLeadStageFilter] = useState<string>('all');
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    try {
      return window.localStorage.getItem('avlive_ai_crm_sheet_id') || '';
    } catch {
      return '';
    }
  });
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [newLeadDraft, setNewLeadDraft] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    city: 'Lahore',
    channel: 'whatsapp' as AgentChannel,
    language: 'en' as AgentLanguage,
    intentSummary: '',
    estimatedValuePkr: 399000,
  });

  // Quote Builder drawer state
  const [quoteLead, setQuoteLead] = useState<AILeadRecord | null>(null);
  const [quoteRecipientName, setQuoteRecipientName] = useState('');
  const [quoteCompany, setQuoteCompany] = useState('');
  const [quoteRecipientEmail, setQuoteRecipientEmail] = useState('');
  const [quoteItems, setQuoteItems] = useState<QuoteLineItem[]>([]);
  const [quoteSelectedSku, setQuoteSelectedSku] = useState(CATALOG_PRODUCTS[0]?.sku || '');
  const [quoteIncludeGst, setQuoteIncludeGst] = useState(true);
  const [quoteNotes, setQuoteNotes] = useState('Includes standard 1-year official warranty & remote commissioning.');
  const [quoteGenerating, setQuoteGenerating] = useState(false);

  // Tab 3: Approval Queue editing state
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [editRecipientEmail, setEditRecipientEmail] = useState('');
  const [editRecipientPhone, setEditRecipientPhone] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editBodyText, setEditBodyText] = useState('');

  // Tab 4: Tasks & Daily Briefing
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'overdue' | 'completed'>('pending');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskLeadName, setNewTaskLeadName] = useState('');
  const [newTaskCadence, setNewTaskCadence] = useState<TaskCadenceStep>('day_1');
  const [newTaskChannel, setNewTaskChannel] = useState<'whatsapp' | 'phone_3cx' | 'email' | 'internal'>('whatsapp');
  const [newTaskDue, setNewTaskDue] = useState(formatDateIso(1));
  const [generatingReport, setGeneratingReport] = useState(false);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  // Helper to get Firebase Auth Bearer token for protected /api/admin/* endpoints
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const token = await auth.currentUser?.getIdToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Subscribe to all 5 Firestore collections
  useEffect(() => {
    const unsubs = [
      subscribeAILeads(setLeads, (e) => showToast('error', `Leads sync: ${e.message}`)),
      subscribeAIConversations(setConversations),
      subscribeAIApprovals(setApprovals),
      subscribeAITasks(setTasks),
      subscribeAIDailyReports(setReports),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  // Fetch safe server readiness flags
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/admin/ai-agent/status', { headers });
        if (res.ok && active) {
          setServerStatus(await res.json());
        }
      } catch {
        // Non-blocking
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Sync approval editor fields when selected item changes
  const selectedApproval = useMemo(
    () => approvals.find((a) => a.id === selectedApprovalId) || approvals[0] || null,
    [approvals, selectedApprovalId]
  );

  useEffect(() => {
    if (!selectedApproval) return;
    setEditRecipientEmail(selectedApproval.recipientEmail || '');
    setEditRecipientPhone(selectedApproval.recipientPhone || '');
    setEditSubject(selectedApproval.subject || '');
    setEditBodyText(selectedApproval.bodyText || '');
  }, [selectedApproval?.id]);

  // Derived Metrics
  const todayIso = formatDateIso(0);
  const metrics = useMemo(() => {
    const whatsappChats = conversations.filter((c) => c.channel === 'whatsapp').length;
    const phoneCalls3cx = conversations.filter((c) => c.channel === 'phone_3cx').length;
    const webChats = conversations.filter((c) => c.channel === 'web_chat').length;
    const pendingApprovals = approvals.filter((a) => a.status === 'pending_approval').length;
    const quotesDrafted = approvals.filter((a) => a.type === 'gmail_quote').length;
    const quotesSent = approvals.filter((a) => a.type === 'gmail_quote' && a.status === 'sent').length;
    const pipelinePkr = leads
      .filter((l) => l.stage !== 'lost')
      .reduce((sum, l) => sum + Number(l.estimatedValuePkr || 0), 0);
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
    const overdueTasks = tasks.filter((t) => t.status === 'pending' && t.dueAt < todayIso).length;
    const escalations = leads.filter((l) => l.escalated).length;

    return {
      totalConversations: conversations.length,
      whatsappChats,
      phoneCalls3cx,
      webChats,
      newLeads: leads.length,
      pendingApprovals,
      quotesDrafted,
      quotesSent,
      pipelinePkr,
      pendingTasks,
      overdueTasks,
      escalations,
    };
  }, [conversations, approvals, leads, tasks, todayIso]);

  const handleConnectWorkspace = async () => {
    setConnectingWorkspace(true);
    try {
      await connectWorkspace();
      setWorkspaceReady(true);
      showToast('success', 'Connected Google Workspace (Gmail, Sheets, Tasks, Chat).');
    } catch (err: any) {
      showToast('error', err?.message || 'Google Workspace sign-in cancelled or failed.');
    } finally {
      setConnectingWorkspace(false);
    }
  };

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const persistSpreadsheetId = (id: string) => {
    setSpreadsheetId(id);
    try {
      window.localStorage.setItem('avlive_ai_crm_sheet_id', id);
    } catch {
      // Ignore storage failures
    }
  };

  const executeConfirmAction = async () => {
    if (!confirmModal) return;
    setConfirmBusy(true);
    try {
      await confirmModal.onConfirm();
      setConfirmModal(null);
    } catch (err: any) {
      showToast('error', err?.message || 'Action failed.');
    } finally {
      setConfirmBusy(false);
    }
  };

  // =========================================================================
  // TAB 1: INTERACTIVE OMNICHANNEL SIMULATOR & INBOX
  // =========================================================================

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConvId) || null,
    [conversations, selectedConvId]
  );

  const filteredConversations = useMemo(() => {
    if (inboxChannelFilter === 'all') return conversations;
    return conversations.filter((c) => c.channel === inboxChannelFilter);
  }, [conversations, inboxChannelFilter]);

  const runSimulatorTurn = async (overrideText?: string, overrideChannel?: 'whatsapp' | 'phone_3cx' | 'web_chat') => {
    const text = (overrideText ?? simInput).trim();
    const channel = overrideChannel ?? simChannel;
    if (!text || simLoading) return;

    setSimLoading(true);
    setSimInput('');
    try {
      const priorMessages = (activeConversation?.messages || []).slice(-6).map((m) => ({
        role: m.role === 'customer' ? 'customer' : 'agent',
        text: m.text,
      }));

      const res = await fetch('/api/ai-agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: priorMessages,
          channel,
          customerName: activeConversation?.customerName || simCustomerName,
          customerPhone: activeConversation?.customerPhone || simCustomerPhone,
          customerEmail: simCustomerEmail,
          allowWebSearch: simAllowSearch,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `API error (${res.status})`);
      }

      const data = (await res.json()) as AgentTurnResponse;
      setLastTurnResult(data);

      const nowIso = new Date().toISOString();
      const newEntries = [
        {
          id: `msg_${Date.now()}_in`,
          role: 'customer' as const,
          text,
          timestamp: nowIso,
        },
        {
          id: `msg_${Date.now()}_out`,
          role: 'agent' as const,
          text: data.replyText,
          language: data.language,
          buttons: data.buttons,
          groundingSource: data.groundingSource,
          searchSources: data.searchSources,
          timestamp: nowIso,
          whatsappPayloadPreview: data.whatsappPayloadPreview,
        },
      ];

      if (activeConversation) {
        await updateAIConversation(activeConversation.id, {
          language: data.language,
          status: data.escalated ? 'escalated' : 'open',
          lastMessage: data.replyText,
          messages: [...(activeConversation.messages || []), ...newEntries].slice(-60),
        });
      } else {
        const createdId = await createAIConversation({
          customerName: data.extractedLead.name || simCustomerName || 'Prospect',
          customerPhone: data.extractedLead.phone || simCustomerPhone || '',
          channel,
          language: data.language,
          status: data.escalated ? 'escalated' : 'open',
          lastMessage: data.replyText,
          messages: newEntries,
        });
        setSelectedConvId(createdId);
      }

      showToast(
        'success',
        `AI replied in ${LANG_LABELS[data.language]} (${data.buttons.length} button${data.buttons.length === 1 ? '' : 's'}, ${data.groundingSource}).`
      );
    } catch (err: any) {
      showToast('error', err?.message || 'Simulator turn failed.');
    } finally {
      setSimLoading(false);
    }
  };

  const handleSaveExtractedLeadAndTask = async () => {
    if (!lastTurnResult) return;
    try {
      const leadId = await createAILead({
        name: lastTurnResult.extractedLead.name || simCustomerName || 'AV Live Lead',
        company: lastTurnResult.extractedLead.company || '',
        phone: lastTurnResult.extractedLead.phone || simCustomerPhone || '',
        email: lastTurnResult.extractedLead.email || simCustomerEmail || '',
        city: lastTurnResult.extractedLead.city || '',
        channel: simChannel,
        language: lastTurnResult.language,
        stage: lastTurnResult.escalated ? 'qualified' : 'new',
        intentSummary: lastTurnResult.extractedLead.intentSummary || '',
        interestedSkus: lastTurnResult.extractedLead.interestedSkus || [],
        estimatedValuePkr: lastTurnResult.extractedLead.estimatedValuePkr || 0,
        escalated: lastTurnResult.escalated,
      });

      if (lastTurnResult.suggestedTask) {
        await createAITask({
          leadId,
          leadName: lastTurnResult.extractedLead.name || simCustomerName || 'AV Live Lead',
          title: lastTurnResult.suggestedTask.title,
          notes: lastTurnResult.suggestedTask.notes,
          cadenceStep: lastTurnResult.suggestedTask.cadenceStep,
          channel: lastTurnResult.suggestedTask.channel,
          priority: lastTurnResult.suggestedTask.priority,
          status: 'pending',
          dueAt: formatDateIso(lastTurnResult.suggestedTask.dueInDays),
        });
      }

      if (activeConversation) {
        await updateAIConversation(activeConversation.id, { leadId });
      }

      showToast('success', 'Lead saved to CRM and Day +1 follow-up task scheduled.');
    } catch (err: any) {
      showToast('error', err?.message || 'Could not save lead.');
    }
  };

  // =========================================================================
  // TAB 2: LEADS CRM, QUOTE BUILDER & GOOGLE SHEETS SYNC
  // =========================================================================

  const filteredLeads = useMemo(() => {
    const q = leadSearch.trim().toLowerCase();
    return leads.filter((l) => {
      if (leadStageFilter !== 'all' && l.stage !== leadStageFilter) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        (l.company || '').toLowerCase().includes(q) ||
        (l.phone || '').toLowerCase().includes(q) ||
        (l.email || '').toLowerCase().includes(q) ||
        (l.intentSummary || '').toLowerCase().includes(q)
      );
    });
  }, [leads, leadSearch, leadStageFilter]);

  const openQuoteBuilderForLead = (lead?: AILeadRecord) => {
    setQuoteLead(lead || null);
    setQuoteRecipientName(lead?.name || simCustomerName || '');
    setQuoteCompany(lead?.company || '');
    setQuoteRecipientEmail(lead?.email || simCustomerEmail || '');

    const prefilledItems: QuoteLineItem[] = [];
    if (lead?.interestedSkus?.length) {
      for (const sku of lead.interestedSkus) {
        const match = CATALOG_PRODUCTS.find(
          (p) => p.sku.toLowerCase() === sku.toLowerCase() || p.name.toLowerCase().includes(sku.toLowerCase())
        );
        if (match) {
          prefilledItems.push({
            sku: match.sku,
            productName: match.name,
            unitPricePkr: match.pricePkr,
            quantity: 1,
            productUrl: match.url,
          });
        }
      }
    }
    if (prefilledItems.length === 0 && CATALOG_PRODUCTS[0]) {
      prefilledItems.push({
        sku: CATALOG_PRODUCTS[0].sku,
        productName: CATALOG_PRODUCTS[0].name,
        unitPricePkr: CATALOG_PRODUCTS[0].pricePkr,
        quantity: 1,
        productUrl: CATALOG_PRODUCTS[0].url,
      });
    }
    setQuoteItems(prefilledItems);
    setActiveTab('leads');
  };

  const handleAddQuoteSku = () => {
    const found = CATALOG_PRODUCTS.find((p) => p.sku === quoteSelectedSku);
    if (!found) return;
    setQuoteItems((prev) => {
      const existing = prev.find((i) => i.sku === found.sku);
      if (existing) {
        return prev.map((i) => (i.sku === found.sku ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          sku: found.sku,
          productName: found.name,
          unitPricePkr: found.pricePkr,
          quantity: 1,
          productUrl: found.url,
        },
      ];
    });
  };

  const handleGenerateQuoteToApprovalQueue = async () => {
    if (!quoteRecipientName.trim() || quoteItems.length === 0) {
      showToast('error', 'Enter a recipient name and at least one product.');
      return;
    }
    setQuoteGenerating(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/ai-agent/draft-quote', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          recipientName: quoteRecipientName,
          company: quoteCompany,
          recipientEmail: quoteRecipientEmail,
          items: quoteItems,
          includeGst: quoteIncludeGst,
          notes: quoteNotes,
        }),
      });
      if (!res.ok) throw new Error(`Quote draft error (${res.status})`);
      const draft = await res.json();

      const approvalId = await createAIApprovalItem({
        type: 'gmail_quote',
        leadId: quoteLead?.id || '',
        recipientName: quoteRecipientName,
        recipientEmail: quoteRecipientEmail,
        recipientPhone: quoteLead?.phone || '',
        subject: draft.subject,
        bodyHtml: draft.bodyHtml,
        bodyText: draft.bodyText,
        quoteTotalPkr: draft.totalPkr,
        quoteItems,
        status: 'pending_approval',
      });

      // Automatically schedule Day +3 follow-up task if linked to a lead
      if (quoteLead) {
        await createAITask({
          leadId: quoteLead.id,
          leadName: quoteLead.name,
          title: `Day +3 Quote Follow-Up — ${quoteLead.name} (${formatPkr(draft.totalPkr)})`,
          notes: `Confirm receipt of ${draft.subject} and answer technical questions.`,
          cadenceStep: 'day_3',
          channel: quoteLead.channel === 'phone_3cx' ? 'phone_3cx' : 'whatsapp',
          priority: 'medium',
          status: 'pending',
          dueAt: formatDateIso(3),
        });
      }

      setQuoteLead(null);
      setQuoteItems([]);
      setSelectedApprovalId(approvalId);
      setActiveTab('approvals');
      showToast('success', 'Formal PKR quote drafted and queued for your confirmation before sending.');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to draft PKR quote.');
    } finally {
      setQuoteGenerating(false);
    }
  };

  const handleCreateManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadDraft.name.trim()) return;
    try {
      await createAILead({
        ...newLeadDraft,
        stage: 'new',
        interestedSkus: [],
        escalated: false,
      });
      setNewLeadDraft({
        name: '',
        company: '',
        phone: '',
        email: '',
        city: 'Lahore',
        channel: 'whatsapp',
        language: 'en',
        intentSummary: '',
        estimatedValuePkr: 399000,
      });
      setShowNewLeadForm(false);
      showToast('success', 'Lead added to CRM.');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to add lead.');
    }
  };

  const requestCreate4TabGoogleSheet = () => {
    if (!workspaceReady) {
      showToast('info', 'Connect Google Workspace first to create your 4-tab CRM Sheet.');
      return;
    }
    setConfirmModal({
      title: 'Create 4-Tab AV Live AI CRM Spreadsheet',
      description:
        'This will create a new Google Sheet in your connected Google account with formatted headers for Leads, Quotes, Follow-Up Tasks, and Daily Reports.',
      details: [
        { label: 'Spreadsheet Title', value: 'AV Live — AI Sales & Voice CRM' },
        { label: 'Tabs Created', value: 'Leads · Quotes · Follow-Up Tasks · Daily Reports' },
      ],
      confirmLabel: 'Create Google Sheet',
      onConfirm: async () => {
        const created = await createSpreadsheet('AV Live — AI Sales & Voice CRM', AI_CRM_SHEET_TABS);
        persistSpreadsheetId(created.spreadsheetId);
        showToast('success', `Created Google Sheet "${created.properties.title}" (${created.spreadsheetId}).`);
      },
    });
  };

  const requestSyncAllToGoogleSheets = () => {
    if (!workspaceReady) {
      showToast('info', 'Connect Google Workspace first to sync rows to Google Sheets.');
      return;
    }
    if (!spreadsheetId.trim()) {
      showToast('error', 'Enter a Spreadsheet ID or click "Create 4-Tab Sheet" first.');
      return;
    }

    const unsyncedLeads = leads.filter((l) => !l.sheetSyncedAt);
    const leadsToPush = unsyncedLeads.length > 0 ? unsyncedLeads : leads.slice(0, 25);
    const quotesToPush = approvals.filter((a) => a.type === 'gmail_quote').slice(0, 25);
    const tasksToPush = tasks.slice(0, 25);

    setConfirmModal({
      title: 'Confirm Google Sheets CRM Sync',
      description:
        'Review the exact rows that will be appended to your connected Google Sheet. Missing tabs will be created automatically.',
      details: [
        { label: 'Target Spreadsheet ID', value: spreadsheetId.trim() },
        { label: 'Leads Tab', value: `${leadsToPush.length} row(s)` },
        { label: 'Quotes Tab', value: `${quotesToPush.length} row(s)` },
        { label: 'Follow-Up Tasks Tab', value: `${tasksToPush.length} row(s)` },
      ],
      confirmLabel: 'Confirm & Append to Sheets',
      onConfirm: async () => {
        const cleanId = spreadsheetId.trim();
        await ensureSheetTabs(cleanId, AI_CRM_SHEET_TABS);
        const nowIso = new Date().toISOString();

        if (leadsToPush.length > 0) {
          await appendSheetRows(
            cleanId,
            'Leads',
            leadsToPush.map((l) => [
              l.id,
              nowIso.slice(0, 10),
              l.name,
              l.company || '',
              l.phone,
              l.email || '',
              l.city || '',
              l.channel,
              l.language,
              l.stage,
              (l.interestedSkus || []).join(', '),
              Number(l.estimatedValuePkr || 0),
              l.escalated ? 'YES' : 'NO',
              l.intentSummary || '',
            ])
          );
          await Promise.allSettled(
            leadsToPush.map((l) => updateAILead(l.id, { sheetSyncedAt: nowIso }))
          );
        }

        if (quotesToPush.length > 0) {
          await appendSheetRows(
            cleanId,
            'Quotes',
            quotesToPush.map((q) => [
              q.id,
              nowIso.slice(0, 10),
              q.recipientName,
              q.recipientEmail || '',
              q.subject,
              (q.quoteItems || []).map((i) => `${i.productName} x${i.quantity}`).join('; '),
              Number(q.quoteTotalPkr || 0),
              q.status,
              q.approvedBy || '',
              q.sentAt || '',
            ])
          );
        }

        if (tasksToPush.length > 0) {
          await appendSheetRows(
            cleanId,
            'Follow-Up Tasks',
            tasksToPush.map((t) => [
              t.id,
              t.leadName || '',
              t.title,
              t.cadenceStep,
              t.channel,
              t.priority,
              t.status,
              t.dueAt,
              t.googleTaskId || '',
              t.notes || '',
            ])
          );
        }

        showToast(
          'success',
          `Synced ${leadsToPush.length} leads, ${quotesToPush.length} quotes, and ${tasksToPush.length} tasks to Google Sheets.`
        );
      },
    });
  };

  const handleExportLeadsCsv = () => {
    const header = AI_CRM_SHEET_TABS[0].headers.join(',');
    const rows = leads.map((l) =>
      [
        l.id,
        todayIso,
        l.name,
        l.company || '',
        l.phone,
        l.email || '',
        l.city || '',
        l.channel,
        l.language,
        l.stage,
        (l.interestedSkus || []).join('; '),
        l.estimatedValuePkr || 0,
        l.escalated ? 'YES' : 'NO',
        (l.intentSummary || '').replace(/[\r\n,]+/g, ' '),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    downloadTextFile(`avlive-ai-leads-${todayIso}.csv`, [header, ...rows].join('\n'), 'text/csv');
    showToast('success', 'Exported leads CSV.');
  };

  // =========================================================================
  // TAB 3: APPROVAL QUEUE (CONFIRM BEFORE SENDING)
  // =========================================================================

  const requestApproveAndSendItem = (item: AIApprovalRecord) => {
    const isWhatsApp = item.type === 'whatsapp_followup';

    if (!isWhatsApp && !workspaceReady) {
      showToast('info', 'Connect Google Workspace first to send confirmed emails via Gmail.');
      return;
    }
    if (!isWhatsApp && !editRecipientEmail.trim()) {
      showToast('error', 'Enter a valid recipient email address before approving.');
      return;
    }
    if (isWhatsApp && !editRecipientPhone.trim()) {
      showToast('error', 'Enter a recipient WhatsApp phone number before approving.');
      return;
    }

    setConfirmModal({
      title: isWhatsApp ? 'Confirm WhatsApp Button Dispatch' : 'Confirm Outbound Gmail Dispatch',
      description: isWhatsApp
        ? 'You are approving this interactive WhatsApp message to be sent via the Meta WhatsApp Cloud API.'
        : 'You are approving this email to be sent directly from your connected Gmail account.',
      details: [
        { label: 'Channel', value: isWhatsApp ? 'WhatsApp Cloud API' : 'Gmail (Connected Account)' },
        {
          label: 'Recipient',
          value: isWhatsApp
            ? `${item.recipientName} (${editRecipientPhone.trim()})`
            : `${item.recipientName} <${editRecipientEmail.trim()}>`,
        },
        { label: 'Subject', value: editSubject.trim() },
        ...(item.quoteTotalPkr ? [{ label: 'Quote Total', value: formatPkr(item.quoteTotalPkr) }] : []),
      ],
      confirmLabel: isWhatsApp ? 'Approve & Send WhatsApp' : 'Approve & Send Gmail',
      onConfirm: async () => {
        const approver = auth.currentUser?.email || 'Admin';
        const nowIso = new Date().toISOString();

        if (isWhatsApp) {
          const headers = await getAuthHeaders();
          const res = await fetch('/api/admin/ai-agent/send-whatsapp', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              recipientPhone: editRecipientPhone.trim(),
              replyText: editBodyText.trim(),
              buttons: item.buttons || [],
            }),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || 'WhatsApp dispatch failed');

          await updateAIApprovalItem(item.id, {
            recipientPhone: editRecipientPhone.trim(),
            subject: editSubject.trim(),
            bodyText: editBodyText.trim(),
            status: 'sent',
            approvedBy: approver,
            sentAt: nowIso,
          });
          showToast(
            result.dispatched ? 'success' : 'info',
            result.dispatched
              ? 'WhatsApp interactive message sent.'
              : `Logged in dry-run mode: ${result.error || 'Add WHATSAPP_ACCESS_TOKEN in Secrets for live delivery.'}`
          );
        } else {
          const htmlToSend =
            item.bodyHtml && editBodyText === item.bodyText
              ? item.bodyHtml
              : `<div style="font-family:Inter,Arial,sans-serif;font-size:14px;line-height:1.6;color:#0f172a;white-space:pre-wrap;">${editBodyText
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')}</div>`;

          await sendEmail(editRecipientEmail.trim(), editSubject.trim(), htmlToSend);
          await updateAIApprovalItem(item.id, {
            recipientEmail: editRecipientEmail.trim(),
            subject: editSubject.trim(),
            bodyText: editBodyText.trim(),
            bodyHtml: htmlToSend,
            status: 'sent',
            approvedBy: approver,
            sentAt: nowIso,
          });

          if (item.leadId && item.type === 'gmail_quote') {
            await updateAILead(item.leadId, { stage: 'quoted' }).catch(() => {});
          }

          // Notify n8n webhook asynchronously
          const headers = await getAuthHeaders();
          fetch('/api/admin/ai-agent/trigger-n8n', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              event: item.type === 'gmail_quote' ? 'ai_quote_sent' : 'ai_email_sent',
              payload: {
                id: item.id,
                recipientName: item.recipientName,
                recipientEmail: editRecipientEmail.trim(),
                subject: editSubject.trim(),
                quoteTotalPkr: item.quoteTotalPkr || 0,
              },
            }),
          }).catch(() => {});

          showToast('success', `Email sent via Gmail to ${editRecipientEmail.trim()}.`);
        }
      },
    });
  };

  // =========================================================================
  // TAB 4: FOLLOW-UP TASKS & DAILY EXECUTIVE BRIEFING
  // =========================================================================

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (taskFilter === 'pending') return t.status === 'pending';
      if (taskFilter === 'overdue') return t.status === 'pending' && t.dueAt < todayIso;
      if (taskFilter === 'completed') return t.status === 'completed';
      return true;
    });
  }, [tasks, taskFilter, todayIso]);

  const handleCreateManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await createAITask({
        leadName: newTaskLeadName.trim() || 'General Sales',
        title: newTaskTitle.trim(),
        notes: `Scheduled via AI Console (${newTaskCadence})`,
        cadenceStep: newTaskCadence,
        channel: newTaskChannel,
        priority: 'medium',
        status: 'pending',
        dueAt: newTaskDue,
      });
      setNewTaskTitle('');
      setNewTaskLeadName('');
      showToast('success', 'Follow-up task added.');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to add task.');
    }
  };

  const requestPushTaskToGoogleTasks = (task: AITaskRecord) => {
    if (!workspaceReady) {
      showToast('info', 'Connect Google Workspace first to push tasks to Google Tasks.');
      return;
    }
    setConfirmModal({
      title: 'Sync Follow-Up Task to Google Tasks',
      description: 'This will create a task inside your primary Google Tasks list with the due date and follow-up notes.',
      details: [
        { label: 'Task Title', value: task.title },
        { label: 'Lead', value: task.leadName || 'General' },
        { label: 'Due Date', value: task.dueAt },
      ],
      confirmLabel: 'Create Google Task',
      onConfirm: async () => {
        const lists = await listTaskLists();
        const primaryList = lists.items?.[0];
        if (!primaryList) throw new Error('No Google Tasks list found in your account.');
        const dueIso = `${task.dueAt}T09:00:00.000Z`;
        const created = await createGoogleTask(
          primaryList.id,
          `[AV Live AI] ${task.title}`,
          `${task.notes || ''}\nChannel: ${task.channel} | Cadence: ${task.cadenceStep}`,
          dueIso
        );
        await updateAITask(task.id, { googleTaskId: created.id });
        showToast('success', `Synced "${task.title}" to Google Tasks (${primaryList.title}).`);
      },
    });
  };

  const handleGenerateDailyReport = async () => {
    setGeneratingReport(true);
    try {
      const headers = await getAuthHeaders();
      const overdueTitles = tasks
        .filter((t) => t.status === 'pending' && t.dueAt < todayIso)
        .map((t) => `${t.leadName || 'Lead'}: ${t.title}`);

      const res = await fetch('/api/admin/ai-agent/daily-report', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          reportDate: todayIso,
          metrics,
          topLeads: leads.slice(0, 6).map((l) => ({
            name: l.name,
            company: l.company,
            stage: l.stage,
            estimatedValuePkr: l.estimatedValuePkr,
            channel: l.channel,
          })),
          overdueTaskTitles: overdueTitles,
        }),
      });
      if (!res.ok) throw new Error(`Report generation error (${res.status})`);
      const data = await res.json();

      await createAIDailyReport({
        reportDate: todayIso,
        summaryText: data.summaryText,
        summaryHtml: data.summaryHtml,
        metrics,
        status: 'draft',
        sentTo: 'infowarspakistan@gmail.com',
      });

      showToast('success', 'Daily executive briefing compiled. Review below to email or sync to Google Sheets.');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to generate daily report.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const requestSendDailyReportEmail = (report: AIDailyReportRecord) => {
    if (!workspaceReady) {
      showToast('info', 'Connect Google Workspace first to email the daily briefing.');
      return;
    }
    const targetEmail = report.sentTo || 'infowarspakistan@gmail.com';
    setConfirmModal({
      title: 'Send Daily Executive Briefing via Gmail',
      description: 'Confirm sending this AI-generated daily operations briefing from your connected Gmail account.',
      details: [
        { label: 'Recipient', value: targetEmail },
        { label: 'Report Date', value: report.reportDate },
        { label: 'Pipeline Highlighted', value: formatPkr(report.metrics.pipelinePkr) },
      ],
      confirmLabel: 'Confirm & Send Briefing',
      onConfirm: async () => {
        const subject = `AV Live Daily AI Operations Briefing — ${report.reportDate}`;
        await sendEmail(targetEmail, subject, report.summaryHtml || report.summaryText);
        await updateAIDailyReport(report.id, { status: 'sent', sentTo: targetEmail });

        if (spreadsheetId.trim()) {
          try {
            await ensureSheetTabs(spreadsheetId.trim(), AI_CRM_SHEET_TABS);
            await appendSheetRows(spreadsheetId.trim(), 'Daily Reports', [
              [
                report.reportDate,
                report.metrics.whatsappChats,
                report.metrics.phoneCalls3cx,
                report.metrics.webChats,
                report.metrics.newLeads,
                report.metrics.quotesDrafted,
                report.metrics.quotesSent,
                report.metrics.pipelinePkr,
                report.metrics.overdueTasks,
                report.metrics.escalations,
                report.summaryText.slice(0, 500),
              ],
            ]);
          } catch {
            // Optional sheet append
          }
        }
        showToast('success', `Daily briefing sent to ${targetEmail}.`);
      },
    });
  };

  const baseAppUrl = serverStatus?.appUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://avlive.com.pk');

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 text-slate-900">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>AV Live Operations</span>
            <span>·</span>
            <span>WhatsApp Cloud API · 3CX SIP Bridge · Gemini Live</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A2B4C] mt-1">
            AI Sales, Voice &amp; Follow-Up Agent
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleConnectWorkspace}
            disabled={connectingWorkspace}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              workspaceReady
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white text-[#1A2B4C] border-slate-200 hover:border-[#00B4D8]'
            }`}
          >
            <ShieldCheck size={15} />
            {connectingWorkspace
              ? 'Connecting Google...'
              : workspaceReady
                ? 'Google Workspace Connected (Gmail · Sheets · Tasks)'
                : 'Connect Google Workspace'}
          </button>

          <button
            type="button"
            onClick={() => openQuoteBuilderForLead()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1A2B4C] text-white hover:bg-[#00B4D8] transition-colors cursor-pointer"
          >
            <FileText size={14} />
            New PKR Quote Draft
          </button>
        </div>
      </div>

      {/* Inline Toast Feedback */}
      {toast && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-sm ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-sky-50 border-sky-200 text-sky-900'
          }`}
        >
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss message" className="opacity-70 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Compact 5-KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3.5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Conversations</div>
          <div className="text-2xl font-bold text-[#1A2B4C] tabular-nums mt-1">{metrics.totalConversations}</div>
          <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
            WA {metrics.whatsappChats} · 3CX {metrics.phoneCalls3cx} · Web {metrics.webChats}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3.5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Captured Leads</div>
          <div className="text-2xl font-bold text-[#1A2B4C] tabular-nums mt-1">{metrics.newLeads}</div>
          <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
            {metrics.escalations} escalation{metrics.escalations === 1 ? '' : 's'}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3.5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Awaiting Approval</div>
          <div className="text-2xl font-bold text-[#1A2B4C] tabular-nums mt-1">{metrics.pendingApprovals}</div>
          <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
            {metrics.quotesSent} quote{metrics.quotesSent === 1 ? '' : 's'} sent
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3.5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Open Pipeline</div>
          <div className="text-xl font-bold text-[#0082a3] tabular-nums mt-1">{formatPkr(metrics.pipelinePkr)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active qualified + quoted</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3.5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Follow-Up Tasks</div>
          <div className="text-2xl font-bold text-[#1A2B4C] tabular-nums mt-1">{metrics.pendingTasks}</div>
          <div className={`text-[11px] mt-1 tabular-nums ${metrics.overdueTasks > 0 ? 'text-amber-700 font-semibold' : 'text-slate-500'}`}>
            {metrics.overdueTasks} overdue
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto">
        {(
          [
            { id: 'inbox', label: 'Live Inbox & Simulator', icon: MessageSquare },
            { id: 'leads', label: `Leads CRM & Quotes (${leads.length})`, icon: Table2 },
            { id: 'approvals', label: `Approval Queue (${metrics.pendingApprovals})`, icon: Mail },
            { id: 'tasks', label: `Tasks & Daily Report (${metrics.pendingTasks})`, icon: Calendar },
            { id: 'setup', label: 'Channels, 3CX & n8n', icon: Workflow },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#00B4D8] text-[#1A2B4C]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* TAB 1: LIVE INBOX & INTERACTIVE MULTILINGUAL SIMULATOR            */}
      {/* ================================================================= */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Rail: Conversations */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg flex flex-col max-h-[680px]">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-xs">
                {(['all', 'whatsapp', 'phone_3cx', 'web_chat'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setInboxChannelFilter(ch)}
                    className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                      inboxChannelFilter === ch
                        ? 'bg-[#1A2B4C] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {ch === 'all' ? 'All' : CHANNEL_LABELS[ch]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedConvId(null);
                  setLastTurnResult(null);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0082a3] hover:text-[#1A2B4C] cursor-pointer"
              >
                <Plus size={14} /> New
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No conversations logged yet. Send a test prompt in the simulator on the right to see live EN / Urdu / Roman Urdu responses with WhatsApp CTA buttons.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = conv.id === selectedConvId;
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => setSelectedConvId(conv.id)}
                      className={`w-full text-left px-4 py-3 transition-colors cursor-pointer ${
                        isSelected ? 'bg-sky-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">{conv.customerName}</span>
                        <span className="text-[11px] font-medium text-slate-500 shrink-0">
                          {CHANNEL_LABELS[conv.channel]} · {LANG_LABELS[conv.language]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate mt-1">{conv.lastMessage || 'No messages'}</p>
                      {conv.status === 'escalated' && (
                        <div className="text-[11px] font-semibold text-amber-700 mt-1">Escalated for human review</div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane: Interactive Simulator & Thread Viewer */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg flex flex-col">
            {/* Simulator Config Strip */}
            <div className="p-4 border-b border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Bot size={17} className="text-[#00B4D8]" />
                  <h2 className="text-sm font-bold text-[#1A2B4C]">
                    {activeConversation ? `Thread: ${activeConversation.customerName}` : 'Omnichannel AI Consultant Simulator'}
                  </h2>
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simAllowSearch}
                    onChange={(e) => setSimAllowSearch(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span>Auto Google Search fallback</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <select
                  value={simChannel}
                  onChange={(e) => setSimChannel(e.target.value as 'whatsapp' | 'phone_3cx' | 'web_chat')}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md font-medium"
                >
                  <option value="whatsapp">WhatsApp Cloud API</option>
                  <option value="phone_3cx">3CX Phone Call</option>
                  <option value="web_chat">Website AV Assist</option>
                </select>
                <input
                  type="text"
                  value={simCustomerName}
                  onChange={(e) => setSimCustomerName(e.target.value)}
                  placeholder="Customer name"
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md"
                />
                <input
                  type="text"
                  value={simCustomerPhone}
                  onChange={(e) => setSimCustomerPhone(e.target.value)}
                  placeholder="+92300..."
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md font-mono"
                />
                <input
                  type="email"
                  value={simCustomerEmail}
                  onChange={(e) => setSimCustomerEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md"
                />
              </div>

              {/* 1-Click Multilingual Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium mr-1">Test prompts:</span>
                {QUICK_SIMULATOR_PROMPTS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    disabled={simLoading}
                    onClick={() => {
                      setSimChannel(preset.channel);
                      runSimulatorTurn(preset.text, preset.channel);
                    }}
                    className="px-2.5 py-1 rounded-md border border-slate-200 text-[11px] font-medium text-slate-700 hover:border-[#00B4D8] hover:text-[#1A2B4C] transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Thread Messages */}
            <div className="flex-1 p-4 bg-slate-50/70 overflow-y-auto min-h-[300px] max-h-[420px] space-y-3">
              {(!activeConversation || activeConversation.messages.length === 0) && (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 text-slate-500 text-xs max-w-md mx-auto">
                  <Sparkles size={20} className="text-[#00B4D8] mb-2" />
                  <p className="font-semibold text-slate-700">Live Grounded Replies · Button-Only Links</p>
                  <p className="mt-1">
                    Type in English, Urdu, or Roman Urdu below. The AI replies in 2–3 short sentences grounded in live PKR catalog pricing, converts links into WhatsApp CTA buttons, and extracts lead + follow-up task data.
                  </p>
                </div>
              )}

              {activeConversation?.messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.role === 'customer' ? 'items-end' : 'items-start'}`}>
                  <div
                    dir="auto"
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                      m.role === 'customer'
                        ? 'bg-[#1A2B4C] text-white'
                        : 'bg-white border border-slate-200 text-slate-800'
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.role === 'agent' && (
                    <div className="mt-1.5 space-y-1.5 max-w-[88%]">
                      {m.buttons && m.buttons.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {m.buttons.map((b, idx) =>
                            b.type === 'cta_url' && b.url ? (
                              <a
                                key={`${m.id}_b_${idx}`}
                                href={b.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#00B4D8] text-white text-xs font-semibold hover:bg-[#0096B4]"
                              >
                                <span>{b.title}</span>
                                <ExternalLink size={11} />
                              </a>
                            ) : (
                              <button
                                key={`${m.id}_b_${idx}`}
                                type="button"
                                onClick={() => runSimulatorTurn(b.payload || b.title)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-300 text-xs font-semibold text-[#1A2B4C] hover:border-[#00B4D8] cursor-pointer"
                              >
                                {b.title}
                              </button>
                            )
                          )}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500">
                        {m.language ? LANG_LABELS[m.language] : 'Auto'} · {m.groundingSource || 'catalog'}
                        {m.searchSources && m.searchSources.length > 0 && (
                          <span> · {m.searchSources.length} web source(s)</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Extracted Lead + Action Bar from Latest Turn */}
            {lastTurnResult && (
              <div className="px-4 py-3 border-t border-slate-200 bg-white space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2 text-slate-700">
                    <span className="font-semibold text-[#1A2B4C]">Extracted:</span>
                    <span>{lastTurnResult.extractedLead.name || simCustomerName}</span>
                    <span>·</span>
                    <span className="font-mono">{formatPkr(lastTurnResult.extractedLead.estimatedValuePkr)}</span>
                    {lastTurnResult.escalated && (
                      <>
                        <span>·</span>
                        <span className="text-amber-700 font-semibold">
                          Escalated ({lastTurnResult.escalationReason || 'Human handoff'})
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowJsonInspector((v) => !v)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <Code2 size={13} />
                      {showJsonInspector ? 'Hide WA JSON' : 'Inspect WA JSON'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveExtractedLeadAndTask}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                    >
                      <CheckCircle2 size={13} />
                      Save Lead &amp; Task
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openQuoteBuilderForLead({
                          id: '',
                          name: lastTurnResult.extractedLead.name || simCustomerName,
                          company: lastTurnResult.extractedLead.company || '',
                          phone: lastTurnResult.extractedLead.phone || simCustomerPhone,
                          email: lastTurnResult.extractedLead.email || simCustomerEmail,
                          channel: simChannel,
                          language: lastTurnResult.language,
                          stage: 'qualified',
                          interestedSkus: lastTurnResult.extractedLead.interestedSkus,
                          estimatedValuePkr: lastTurnResult.extractedLead.estimatedValuePkr,
                        })
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1A2B4C] text-white text-xs font-semibold hover:bg-[#00B4D8] cursor-pointer"
                    >
                      <FileText size={13} />
                      Draft Quote
                    </button>
                  </div>
                </div>

                {showJsonInspector && (
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-md text-[11px] font-mono overflow-x-auto max-h-48">
                    {JSON.stringify(lastTurnResult.whatsappPayloadPreview, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runSimulatorTurn();
              }}
              className="p-3.5 border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                dir="auto"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                placeholder="Simulate customer message in English, Urdu, or Roman Urdu..."
                className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
              />
              <button
                type="submit"
                disabled={simLoading || !simInput.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1A2B4C] text-white text-sm font-semibold hover:bg-[#00B4D8] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send size={14} />
                {simLoading ? 'Thinking...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: LEADS CRM, GOOGLE SHEETS SYNC & INSTANT PKR QUOTE BUILDER  */}
      {/* ================================================================= */}
      {activeTab === 'leads' && (
        <div className="space-y-5">
          {/* Google Sheets 4-Tab Sync Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <Table2 size={17} className="text-emerald-700 shrink-0" />
              <span className="text-xs font-bold text-[#1A2B4C]">Google Sheets 4-Tab CRM</span>
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => persistSpreadsheetId(e.target.value)}
                placeholder="Paste Google Spreadsheet ID (or create a new 4-tab sheet)"
                className="flex-1 min-w-[220px] max-w-md px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-md"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={requestCreate4TabGoogleSheet}
                className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-700 hover:border-[#00B4D8] cursor-pointer"
              >
                Create 4-Tab Sheet
              </button>
              <button
                type="button"
                onClick={requestSyncAllToGoogleSheets}
                className="px-3 py-1.5 rounded-md bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 cursor-pointer"
              >
                Sync CRM to Google Sheets
              </button>
              <button
                type="button"
                onClick={handleExportLeadsCsv}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Download size={13} /> CSV
              </button>
            </div>
          </div>

          {/* Instant PKR Quote Builder Panel (shown when opened) */}
          {quoteItems.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-[#1A2B4C]">Instant Formal PKR Quote Builder (Business English)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Drafts an itemized HTML quotation from live catalog PKR pricing and queues it in Approval Queue — never auto-sends without confirmation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQuoteLead(null);
                    setQuoteItems([]);
                  }}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={quoteRecipientName}
                  onChange={(e) => setQuoteRecipientName(e.target.value)}
                  placeholder="Recipient Full Name *"
                  className="px-3 py-2 text-xs border border-slate-200 rounded-md"
                />
                <input
                  type="text"
                  value={quoteCompany}
                  onChange={(e) => setQuoteCompany(e.target.value)}
                  placeholder="Company / Organization"
                  className="px-3 py-2 text-xs border border-slate-200 rounded-md"
                />
                <input
                  type="email"
                  value={quoteRecipientEmail}
                  onChange={(e) => setQuoteRecipientEmail(e.target.value)}
                  placeholder="Recipient Email for Gmail"
                  className="px-3 py-2 text-xs border border-slate-200 rounded-md"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={quoteSelectedSku}
                  onChange={(e) => setQuoteSelectedSku(e.target.value)}
                  className="flex-1 min-w-[260px] px-3 py-2 text-xs border border-slate-200 rounded-md bg-slate-50"
                >
                  {CATALOG_PRODUCTS.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} — {formatPkr(p.pricePkr)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddQuoteSku}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 cursor-pointer"
                >
                  <Plus size={14} /> Add Product
                </button>
              </div>

              <div className="border border-slate-200 rounded-md overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-500">
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2 w-24">Qty</th>
                      <th className="px-3 py-2 text-right">Unit (PKR)</th>
                      <th className="px-3 py-2 text-right">Line Total</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {quoteItems.map((item) => (
                      <tr key={item.sku} className="h-10">
                        <td className="px-3 py-2 font-medium text-slate-800">
                          {item.productName}{' '}
                          <span className="text-[11px] font-mono text-slate-400">[{item.sku}]</span>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = Math.max(1, Number(e.target.value || 1));
                              setQuoteItems((prev) =>
                                prev.map((i) => (i.sku === item.sku ? { ...i, quantity: qty } : i))
                              );
                            }}
                            className="w-16 px-2 py-1 border border-slate-200 rounded text-xs tabular-nums"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-600">
                          {formatPkr(item.unitPricePkr)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {formatPkr(item.unitPricePkr * item.quantity)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => setQuoteItems((prev) => prev.filter((i) => i.sku !== item.sku))}
                            className="text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quoteIncludeGst}
                      onChange={(e) => setQuoteIncludeGst(e.target.checked)}
                    />
                    <span>Include 18% FBR GST (Corporate / Government Quote)</span>
                  </label>
                  <input
                    type="text"
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    placeholder="Delivery / installation notes..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md"
                  />
                </div>
                <div className="text-right space-y-1">
                  {(() => {
                    const sub = quoteItems.reduce((s, i) => s + i.unitPricePkr * i.quantity, 0);
                    const gst = quoteIncludeGst ? Math.round(sub * 0.18) : 0;
                    return (
                      <>
                        <div className="text-xs text-slate-500 font-mono tabular-nums">
                          Subtotal: {formatPkr(sub)} {quoteIncludeGst ? `· GST: ${formatPkr(gst)}` : ''}
                        </div>
                        <div className="text-lg font-bold text-[#1A2B4C] font-mono tabular-nums">
                          Total: {formatPkr(sub + gst)}
                        </div>
                        <button
                          type="button"
                          disabled={quoteGenerating}
                          onClick={handleGenerateQuoteToApprovalQueue}
                          className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00B4D8] text-white text-xs font-bold hover:bg-[#0096B4] disabled:opacity-50 cursor-pointer"
                        >
                          <FileText size={14} />
                          {quoteGenerating ? 'Drafting...' : 'Queue Draft for Approval'}
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Leads Filter & Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                <div className="relative flex-1 max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    placeholder="Search leads, phone, company..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md"
                  />
                </div>
                <select
                  value={leadStageFilter}
                  onChange={(e) => setLeadStageFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md"
                >
                  <option value="all">All stages</option>
                  {STAGE_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setShowNewLeadForm((v) => !v)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#1A2B4C] text-white text-xs font-semibold hover:bg-[#00B4D8] cursor-pointer"
              >
                <Plus size={14} /> Add Lead
              </button>
            </div>

            {showNewLeadForm && (
              <form onSubmit={handleCreateManualLead} className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-2.5">
                <input
                  required
                  type="text"
                  value={newLeadDraft.name}
                  onChange={(e) => setNewLeadDraft({ ...newLeadDraft, name: e.target.value })}
                  placeholder="Lead Name *"
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                />
                <input
                  type="text"
                  value={newLeadDraft.company}
                  onChange={(e) => setNewLeadDraft({ ...newLeadDraft, company: e.target.value })}
                  placeholder="Company"
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                />
                <input
                  type="text"
                  value={newLeadDraft.phone}
                  onChange={(e) => setNewLeadDraft({ ...newLeadDraft, phone: e.target.value })}
                  placeholder="Phone (+92...)"
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono"
                />
                <input
                  type="email"
                  value={newLeadDraft.email}
                  onChange={(e) => setNewLeadDraft({ ...newLeadDraft, email: e.target.value })}
                  placeholder="Email"
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                />
                <input
                  type="text"
                  value={newLeadDraft.intentSummary}
                  onChange={(e) => setNewLeadDraft({ ...newLeadDraft, intentSummary: e.target.value })}
                  placeholder="Requirement summary (e.g., 12-person boardroom Poly X50)"
                  className="md:col-span-2 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                />
                <input
                  type="number"
                  value={newLeadDraft.estimatedValuePkr}
                  onChange={(e) => setNewLeadDraft({ ...newLeadDraft, estimatedValuePkr: Number(e.target.value || 0) })}
                  placeholder="Est. Value (PKR)"
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-md bg-[#00B4D8] text-white text-xs font-semibold hover:bg-[#0096B4] cursor-pointer"
                >
                  Save Lead
                </button>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-2.5">Lead</th>
                    <th className="px-4 py-2.5">Channel · Lang</th>
                    <th className="px-4 py-2.5">Stage</th>
                    <th className="px-4 py-2.5 text-right">Est. Value</th>
                    <th className="px-4 py-2.5">Sheet Sync</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        No leads captured yet. Run a test in the Live Inbox Simulator or click "+ Add Lead".
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-2.5">
                          <div className="font-semibold text-slate-900">
                            {lead.name}
                            {lead.company ? <span className="text-slate-500 font-normal"> · {lead.company}</span> : null}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {lead.phone || '—'} {lead.email ? `· ${lead.email}` : ''}
                          </div>
                          {lead.intentSummary && (
                            <div className="text-[11px] text-slate-600 truncate max-w-md mt-0.5">{lead.intentSummary}</div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                          {CHANNEL_LABELS[lead.channel]} · {LANG_LABELS[lead.language]}
                          {lead.escalated && (
                            <div className="text-[11px] font-semibold text-amber-700">Escalated</div>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <select
                            value={lead.stage}
                            onChange={(e) => updateAILead(lead.id, { stage: e.target.value as LeadStage })}
                            className="px-2 py-1 text-xs border border-slate-200 rounded bg-white capitalize"
                          >
                            {STAGE_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st.replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums font-semibold text-slate-800 whitespace-nowrap">
                          {formatPkr(lead.estimatedValuePkr)}
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-slate-500 whitespace-nowrap">
                          {lead.sheetSyncedAt ? `Synced ${lead.sheetSyncedAt.slice(0, 10)}` : 'Pending sync'}
                        </td>
                        <td className="px-4 py-2.5 text-right whitespace-nowrap space-x-2">
                          <button
                            type="button"
                            onClick={() => openQuoteBuilderForLead(lead)}
                            className="text-[#0082a3] hover:text-[#1A2B4C] font-semibold cursor-pointer"
                          >
                            Quote
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({
                                title: 'Delete Lead Record',
                                description: `Remove ${lead.name} permanently from the AI Leads CRM?`,
                                details: [{ label: 'Lead', value: `${lead.name} (${lead.phone || 'no phone'})` }],
                                confirmLabel: 'Delete Lead',
                                tone: 'danger',
                                onConfirm: async () => {
                                  await deleteAILead(lead.id);
                                  showToast('info', `Deleted ${lead.name}.`);
                                },
                              })
                            }
                            className="text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: OUTBOUND APPROVAL QUEUE (CONFIRM BEFORE SENDING)           */}
      {/* ================================================================= */}
      {activeTab === 'approvals' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Queue List */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-[#1A2B4C]">
              Pending &amp; Sent Outbound Drafts ({approvals.length})
            </div>
            {approvals.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No queued emails or quotes yet. Build a quote from the Leads CRM tab to review and confirm it here before Gmail dispatch.
              </div>
            ) : (
              approvals.map((item) => {
                const isSelected = selectedApproval?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedApprovalId(item.id)}
                    className={`w-full text-left px-4 py-3 transition-colors cursor-pointer ${
                      isSelected ? 'bg-sky-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{item.recipientName}</span>
                      <span
                        className={`text-[11px] font-semibold ${
                          item.status === 'sent'
                            ? 'text-emerald-700'
                            : item.status === 'rejected'
                              ? 'text-slate-400'
                              : 'text-amber-700'
                        }`}
                      >
                        {item.status === 'pending_approval' ? 'Pending' : item.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 truncate mt-0.5">{item.subject}</div>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
                      {item.type.replace('_', ' ')} {item.quoteTotalPkr ? `· ${formatPkr(item.quoteTotalPkr)}` : ''}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Editable Draft Preview & Confirmation Actions */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-5">
            {!selectedApproval ? (
              <div className="py-16 text-center text-xs text-slate-500">
                Select a queued draft to inspect, edit, and confirm dispatch.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {selectedApproval.type.replace(/_/g, ' ')} · Status: {selectedApproval.status}
                    </div>
                    <h2 className="text-base font-bold text-[#1A2B4C] mt-0.5">{selectedApproval.recipientName}</h2>
                  </div>
                  {selectedApproval.status === 'pending_approval' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateAIApprovalItem(selectedApproval.id, { status: 'rejected' })}
                        className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:text-red-700 cursor-pointer"
                      >
                        Reject Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => requestApproveAndSendItem(selectedApproval)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#00B4D8] text-white text-xs font-bold hover:bg-[#0096B4] cursor-pointer"
                      >
                        <Send size={13} />
                        Confirm &amp; Send
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Recipient Email</label>
                    <input
                      type="email"
                      value={editRecipientEmail}
                      onChange={(e) => setEditRecipientEmail(e.target.value)}
                      disabled={selectedApproval.status === 'sent'}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md disabled:bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Recipient Phone (WhatsApp)</label>
                    <input
                      type="text"
                      value={editRecipientPhone}
                      onChange={(e) => setEditRecipientPhone(e.target.value)}
                      disabled={selectedApproval.status === 'sent'}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-md disabled:bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Subject</label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    disabled={selectedApproval.status === 'sent'}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Message Body (Editable before send)</label>
                  <textarea
                    rows={12}
                    value={editBodyText}
                    onChange={(e) => setEditBodyText(e.target.value)}
                    disabled={selectedApproval.status === 'sent'}
                    className="w-full px-3 py-2.5 text-xs font-mono leading-relaxed border border-slate-200 rounded-md disabled:bg-slate-50"
                  />
                </div>

                {selectedApproval.sentAt && (
                  <div className="text-xs text-emerald-700 font-medium">
                    Sent on {selectedApproval.sentAt} by {selectedApproval.approvedBy || 'Admin'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 4: FOLLOW-UP TASKS & DAILY EXECUTIVE BRIEFING                 */}
      {/* ================================================================= */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Follow-Up Cadence Tasks */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[#1A2B4C]">Follow-Up Tasks (Day +1 / +3 / +7)</h2>
              <div className="flex items-center gap-1 text-xs">
                {(['pending', 'overdue', 'completed', 'all'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTaskFilter(f)}
                    className={`px-2.5 py-1 rounded font-semibold capitalize cursor-pointer ${
                      taskFilter === f ? 'bg-[#1A2B4C] text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateManualTask} className="p-3.5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="New follow-up task title..."
                className="sm:col-span-5 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
              />
              <input
                type="text"
                value={newTaskLeadName}
                onChange={(e) => setNewTaskLeadName(e.target.value)}
                placeholder="Lead name"
                className="sm:col-span-2 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
              />
              <select
                value={newTaskCadence}
                onChange={(e) => setNewTaskCadence(e.target.value as TaskCadenceStep)}
                className="sm:col-span-2 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
              >
                <option value="day_1">Day +1</option>
                <option value="day_3">Day +3</option>
                <option value="day_7">Day +7</option>
                <option value="custom">Custom</option>
              </select>
              <input
                type="date"
                value={newTaskDue}
                onChange={(e) => setNewTaskDue(e.target.value)}
                className="sm:col-span-2 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-mono"
              />
              <button
                type="submit"
                className="sm:col-span-1 px-2 py-1.5 rounded-md bg-[#1A2B4C] text-white text-xs font-semibold hover:bg-[#00B4D8] cursor-pointer"
              >
                Add
              </button>
            </form>

            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No tasks in this view.</div>
              ) : (
                filteredTasks.map((task) => {
                  const isOverdue = task.status === 'pending' && task.dueAt < todayIso;
                  return (
                    <div key={task.id} className="px-4 py-3 flex items-start justify-between gap-3 hover:bg-slate-50/70">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={task.status === 'completed'}
                          onChange={() =>
                            updateAITask(task.id, {
                              status: task.status === 'completed' ? 'pending' : 'completed',
                            })
                          }
                          className="mt-1 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div
                            className={`text-xs font-semibold ${
                              task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {task.leadName || 'General'} · {task.cadenceStep.replace('_', ' ')} ·{' '}
                            {CHANNEL_LABELS[task.channel]} ·{' '}
                            <span className={`font-mono ${isOverdue ? 'text-amber-700 font-semibold' : ''}`}>
                              Due {task.dueAt}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {task.googleTaskId ? (
                          <span className="text-[11px] text-emerald-700 font-semibold">In Google Tasks</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => requestPushTaskToGoogleTasks(task)}
                            className="text-[11px] font-semibold text-[#0082a3] hover:text-[#1A2B4C] cursor-pointer"
                          >
                            Sync to Google Tasks
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Daily Executive Briefing Panel */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#1A2B4C]">Daily Executive Briefing</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI-synthesized summary of calls, WhatsApp chats, quotes, PKR pipeline &amp; overdue tasks.
                </p>
              </div>
              <button
                type="button"
                disabled={generatingReport}
                onClick={handleGenerateDailyReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1A2B4C] text-white text-xs font-semibold hover:bg-[#00B4D8] disabled:opacity-50 cursor-pointer shrink-0"
              >
                <RefreshCw size={13} className={generatingReport ? 'animate-spin' : ''} />
                {generatingReport ? 'Compiling...' : 'Generate Today'}
              </button>
            </div>

            {reports.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                Click "Generate Today" to compile your daily briefing from live CRM data.
              </div>
            ) : (
              <div className="space-y-4">
                {reports.slice(0, 4).map((rep) => (
                  <div key={rep.id} className="border border-slate-200 rounded-lg p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1A2B4C] font-mono">{rep.reportDate}</span>
                      <span className={rep.status === 'sent' ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                        {rep.status === 'sent' ? `Emailed to ${rep.sentTo}` : 'Draft ready'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{rep.summaryText}</p>
                    <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                      Leads {rep.metrics.newLeads} · Pipeline {formatPkr(rep.metrics.pipelinePkr)} · Overdue {rep.metrics.overdueTasks}
                    </div>
                    <div className="pt-1 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => requestSendDailyReportEmail(rep)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#00B4D8] text-white text-xs font-semibold hover:bg-[#0096B4] cursor-pointer"
                      >
                        <Mail size={13} />
                        {rep.status === 'sent' ? 'Re-Send via Gmail' : 'Confirm & Email Report'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 5: CHANNELS, 3CX BRIDGE & N8N WORKFLOW BLUEPRINTS             */}
      {/* ================================================================= */}
      {activeTab === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Webhook Endpoints & Secrets Checklist */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 space-y-5">
            <div>
              <h2 className="text-sm font-bold text-[#1A2B4C]">Live Webhook Endpoints</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register these endpoints in Meta WhatsApp Developer Portal and your 3CX SIP Voice Bridge.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: 'wa',
                  label: 'Meta WhatsApp Cloud API Webhook (GET verify + POST messages)',
                  url: serverStatus?.webhooks.whatsapp || `${baseAppUrl}/api/webhooks/whatsapp`,
                },
                {
                  key: '3cx',
                  label: '3CX SIP PBX + Gemini Live Call-Completion Webhook (POST signed)',
                  url: serverStatus?.webhooks.threecxCallEvent || `${baseAppUrl}/api/webhooks/3cx-call-event`,
                },
                {
                  key: 'web',
                  label: 'Omnichannel Chat Engine API (Storefront Widget & External Plugins)',
                  url: serverStatus?.webhooks.publicChat || `${baseAppUrl}/api/ai-agent/chat`,
                },
              ].map((ep) => (
                <div key={ep.key} className="border border-slate-200 rounded-md p-3">
                  <div className="text-[11px] font-semibold text-slate-600">{ep.label}</div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <code className="text-xs font-mono text-[#1A2B4C] break-all">{ep.url}</code>
                    <button
                      type="button"
                      onClick={() => handleCopy(ep.key, ep.url)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 shrink-0 cursor-pointer"
                    >
                      {copiedKey === ep.key ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      {copiedKey === ep.key ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                Server Environment Secrets Status (Configure in AI Studio Secrets)
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-md text-xs">
                {[
                  { name: 'GEMINI_API_KEY', ok: serverStatus?.geminiConfigured, note: 'Multilingual chat, voice transcription & briefings' },
                  { name: 'WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID', ok: serverStatus?.whatsappConfigured, note: 'Outbound WhatsApp CTA URL & reply buttons' },
                  { name: 'WHATSAPP_VERIFY_TOKEN', ok: serverStatus?.whatsappVerifyTokenConfigured, note: 'Meta webhook GET challenge verification' },
                  { name: 'WHATSAPP_APP_SECRET', ok: serverStatus?.whatsappAppSecretConfigured, note: 'X-Hub-Signature-256 HMAC verification' },
                  { name: 'THREECX_BRIDGE_SECRET', ok: serverStatus?.threecxBridgeConfigured, note: 'X-3CX-Bridge-Signature HMAC verification' },
                ].map((item) => (
                  <div key={item.name} className="px-3.5 py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-mono font-semibold text-slate-800">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.note}</div>
                    </div>
                    <span className={`text-[11px] font-semibold shrink-0 ${item.ok ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {item.ok ? 'Configured' : 'Pending Secret'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Downloadable 3CX Bridge & n8n Blueprints */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-[#00B4D8]" />
                <h2 className="text-sm font-bold text-[#1A2B4C]">3CX SIP PBX → Gemini Live Voice Bridge</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deploy this lightweight Node.js bridge alongside your 3CX PBX on a dedicated AI reception extension (e.g., Ext 800). It streams audio to <code className="font-mono text-[#1A2B4C]">gemini-3.8-live</code> for low-latency English/Urdu/Roman Urdu voice conversations and posts signed call summaries here for instant WhatsApp CTA button follow-ups.
              </p>
              <button
                type="button"
                onClick={() =>
                  downloadTextFile(
                    'avlive-3cx-gemini-bridge.mjs',
                    build3cxGeminiLiveBridgeScript(
                      serverStatus?.webhooks.threecxCallEvent || `${baseAppUrl}/api/webhooks/3cx-call-event`
                    ),
                    'text/javascript'
                  )
                }
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1A2B4C] text-white text-xs font-semibold hover:bg-[#00B4D8] cursor-pointer"
              >
                <Download size={14} /> Download 3CX Bridge Starter (.mjs)
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Workflow size={16} className="text-[#00B4D8]" />
                  <h2 className="text-sm font-bold text-[#1A2B4C]">Downloadable n8n Workflows</h2>
                </div>
                <Link to="/admin/automation" className="text-xs font-semibold text-[#0082a3] hover:underline">
                  Manage Webhooks →
                </Link>
              </div>
              <p className="text-xs text-slate-600">
                Import these ready-made JSON blueprints directly into your n8n instance and pair them with outbound events (<code className="font-mono">ai_lead_captured</code>, <code className="font-mono">ai_quote_sent</code>, <code className="font-mono">ai_escalation</code>).
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      'avlive-n8n-lead-sheet-sync.json',
                      JSON.stringify(buildN8nLeadSyncBlueprint(baseAppUrl), null, 2)
                    )
                  }
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-800 hover:border-[#00B4D8] cursor-pointer"
                >
                  <span>1. Lead Capture → Google Sheets + Escalation Alert</span>
                  <Download size={14} className="text-slate-500" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      'avlive-n8n-followup-cadence.json',
                      JSON.stringify(buildN8nFollowUpCadenceBlueprint(baseAppUrl), null, 2)
                    )
                  }
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-800 hover:border-[#00B4D8] cursor-pointer"
                >
                  <span>2. Day +1 / +3 / +7 Follow-Up Reminder Engine</span>
                  <Download size={14} className="text-slate-500" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      'avlive-n8n-daily-briefing.json',
                      JSON.stringify(buildN8nDailyReportBlueprint(baseAppUrl), null, 2)
                    )
                  }
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-800 hover:border-[#00B4D8] cursor-pointer"
                >
                  <span>3. 8:00 PM PKT Daily Executive Briefing Trigger</span>
                  <Download size={14} className="text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MANDATORY CUSTOM CONFIRMATION MODAL (GMAIL / SHEETS / TASKS / WA) */}
      {/* ================================================================= */}
      {confirmModal && (
        <div className="fixed inset-0 z-[200] bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {confirmModal.tone === 'danger' ? (
                  <AlertTriangle size={18} className="text-red-600 shrink-0" />
                ) : (
                  <ShieldCheck size={18} className="text-[#00B4D8] shrink-0" />
                )}
                <h3 className="text-sm font-bold text-[#1A2B4C]">{confirmModal.title}</h3>
              </div>
              <button
                type="button"
                disabled={confirmBusy}
                onClick={() => setConfirmModal(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{confirmModal.description}</p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg divide-y divide-slate-200/70 text-xs">
              {confirmModal.details.map((row) => (
                <div key={row.label} className="px-3 py-2 flex items-center justify-between gap-3">
                  <span className="text-slate-500 font-medium">{row.label}</span>
                  <span className="font-semibold text-slate-900 text-right break-all">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={confirmBusy}
                onClick={() => setConfirmModal(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmBusy}
                onClick={executeConfirmAction}
                className={`px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50 cursor-pointer ${
                  confirmModal.tone === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#1A2B4C] hover:bg-[#00B4D8]'
                }`}
              >
                {confirmBusy ? 'Processing...' : confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIAgentConsole;
