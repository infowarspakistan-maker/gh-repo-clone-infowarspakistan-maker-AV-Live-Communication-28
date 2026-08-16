import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  MessageSquare, 
  CheckSquare, 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Send, 
  Check, 
  X, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Shield,
  Loader2,
  Calendar,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  connectWorkspace, 
  isWorkspaceConnected, 
  disconnectWorkspace,
  listEmails,
  getEmailDetails,
  trashEmail,
  sendEmail,
  listChatSpaces,
  listChatMessages,
  sendChatMessage,
  listTaskLists,
  listTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  listContacts,
  searchContacts,
  GmailMessage,
  ChatSpace,
  ChatMessage,
  TaskList,
  TaskItem,
  ContactPerson
} from '../../lib/workspaceService';

export function WorkspaceHub() {
  const [connected, setConnected] = useState(isWorkspaceConnected());
  const [activeTab, setActiveTab] = useState<'gmail' | 'chat' | 'tasks' | 'contacts'>('gmail');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  // General custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  // Gmail states
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<GmailMessage | null>(null);
  const [emailDetailsLoading, setEmailDetailsLoading] = useState(false);
  const [searchEmailQuery, setSearchEmailQuery] = useState('label:INBOX');
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });

  // Chat states
  const [spaces, setSpaces] = useState<ChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<ChatSpace | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');

  // Tasks states
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [selectedTaskList, setSelectedTaskList] = useState<TaskList | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);

  // Contacts states
  const [contacts, setContacts] = useState<ContactPerson[]>([]);
  const [searchContactQuery, setSearchContactQuery] = useState('');
  const [contactsLoading, setContactsLoading] = useState(false);

  // Connect to Google Workspace
  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      await connectWorkspace();
      setConnected(true);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google Workspace.');
    } finally {
      setLoading(false);
    }
  };

  // Disconnect Workspace
  const handleDisconnect = async () => {
    setConfirmModal({
      show: true,
      title: 'Disconnect Google Workspace',
      message: 'Are you sure you want to disconnect your Google Workspace account? This will clear your access token from memory.',
      onConfirm: async () => {
        await disconnectWorkspace();
        setConnected(false);
        setEmails([]);
        setSelectedEmail(null);
        setSpaces([]);
        setSelectedSpace(null);
        setChatMessages([]);
        setTaskLists([]);
        setSelectedTaskList(null);
        setTasks([]);
        setContacts([]);
        setConfirmModal(null);
      }
    });
  };

  // Safe wrapper for workspace API operations
  const runSafeApi = async (fn: () => Promise<void>, isChatApi = false) => {
    try {
      if (!isChatApi) {
        setError(null);
      }
      setChatError(null);
      await fn();
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('authenticated') || err.message?.includes('expired')) {
        setConnected(false);
      }
      
      if (isChatApi && (err.message?.includes('Google Chat') || err.message?.includes('Chat API'))) {
        setChatError(err.message);
        return; // Don't set the global error
      }
      
      setError(err.message || 'An error occurred during the Workspace API call.');
    }
  };

  // Load appropriate data based on active tab
  useEffect(() => {
    if (!connected) return;

    if (activeTab === 'gmail') {
      fetchEmails();
    } else if (activeTab === 'chat') {
      fetchChatSpaces();
    } else if (activeTab === 'tasks') {
      fetchTaskLists();
    } else if (activeTab === 'contacts') {
      fetchContacts();
    }
  }, [connected, activeTab]);

  // ==========================================
  // GMAIL LOGIC
  // ==========================================
  const fetchEmails = () => runSafeApi(async () => {
    setLoading(true);
    const res = await listEmails(searchEmailQuery, 15);
    const emailList = res.messages || [];
    
    // Resolve basic headers for listing
    const resolvedEmails = await Promise.all(
      emailList.map(async (msg) => {
        try {
          const detail = await getEmailDetails(msg.id);
          const headers = detail.payload?.headers || [];
          const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
          const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
          const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';
          return {
            id: msg.id,
            threadId: msg.threadId,
            snippet: detail.snippet || '',
            subject,
            from,
            date,
            fullPayload: detail
          };
        } catch (e) {
          return {
            id: msg.id,
            threadId: msg.threadId,
            snippet: '(Failed to fetch snippet)',
            subject: 'Email Message',
            from: 'Google Workspace',
            date: '',
            fullPayload: null
          };
        }
      })
    );
    setEmails(resolvedEmails);
    setLoading(false);
  });

  const handleSelectEmail = (msgId: string) => runSafeApi(async () => {
    setEmailDetailsLoading(true);
    const detail = await getEmailDetails(msgId);
    setSelectedEmail(detail);
    setEmailDetailsLoading(false);
  });

  const getEmailBodyHtml = (payload: any): string => {
    if (!payload) return '';
    // Simple parser for multi-part body
    if (payload.body?.data) {
      return decodeBase64Url(payload.body.data);
    }
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          return decodeBase64Url(part.body.data);
        }
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return `<pre style="font-family: inherit; white-space: pre-wrap;">${escapeHtml(decodeBase64Url(part.body.data))}</pre>`;
        }
        // Nested parts
        if (part.parts) {
          const subResult = getEmailBodyHtml(part);
          if (subResult) return subResult;
        }
      }
    }
    return 'No viewable content.';
  };

  const decodeBase64Url = (base64UrlStr: string) => {
    let base64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    try {
      return decodeURIComponent(escape(atob(base64)));
    } catch (e) {
      return atob(base64);
    }
  };

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const handleSendEmail = () => {
    if (!composeData.to || !composeData.subject || !composeData.body) return;
    
    setConfirmModal({
      show: true,
      title: 'Confirm Send Email',
      message: `Are you sure you want to send this email to "${composeData.to}" on your behalf?`,
      onConfirm: async () => {
        await runSafeApi(async () => {
          setLoading(true);
          await sendEmail(composeData.to, composeData.subject, composeData.body);
          setShowCompose(false);
          setComposeData({ to: '', subject: '', body: '' });
          setConfirmModal(null);
          fetchEmails();
        });
      }
    });
  };

  const handleTrashEmail = (id: string, subject: string) => {
    setConfirmModal({
      show: true,
      title: 'Trash Email',
      message: `Are you sure you want to move the email "${subject}" to the Trash? This action changes your mailbox state.`,
      onConfirm: async () => {
        await runSafeApi(async () => {
          setLoading(true);
          await trashEmail(id);
          setSelectedEmail(null);
          setConfirmModal(null);
          fetchEmails();
        });
      }
    });
  };

  // ==========================================
  // CHAT LOGIC
  // ==========================================
  const fetchChatSpaces = () => runSafeApi(async () => {
    setLoading(true);
    const res = await listChatSpaces();
    setSpaces(res.spaces || []);
    if (res.spaces?.length > 0 && !selectedSpace) {
      handleSelectSpace(res.spaces[0]);
    }
    setLoading(false);
  }, true);

  const handleSelectSpace = (space: ChatSpace) => runSafeApi(async () => {
    setSelectedSpace(space);
    setChatLoading(true);
    const res = await listChatMessages(space.name, 30);
    // Google Chat list messages might be in reverse or order
    setChatMessages(res.messages || []);
    setChatLoading(false);
  }, true);

  const handleSendChatMessage = () => {
    if (!selectedSpace || !newMessageText.trim()) return;

    setConfirmModal({
      show: true,
      title: 'Send Chat Message',
      message: `Send message to the space "${selectedSpace.displayName || selectedSpace.name}"?`,
      onConfirm: async () => {
        await runSafeApi(async () => {
          await sendChatMessage(selectedSpace!.name, newMessageText);
          setNewMessageText('');
          setConfirmModal(null);
          // Refresh messages
          const res = await listChatMessages(selectedSpace!.name, 30);
          setChatMessages(res.messages || []);
        }, true);
      }
    });
  };

  // ==========================================
  // GOOGLE TASKS LOGIC
  // ==========================================
  const fetchTaskLists = () => runSafeApi(async () => {
    setLoading(true);
    const res = await listTaskLists();
    const lists = res.items || [];
    setTaskLists(lists);
    if (lists.length > 0) {
      setSelectedTaskList(lists[0]);
      fetchTasksForList(lists[0].id);
    } else {
      setLoading(false);
    }
  });

  const fetchTasksForList = (listId: string) => runSafeApi(async () => {
    setTasksLoading(true);
    const res = await listTasks(listId);
    setTasks(res.items || []);
    setTasksLoading(false);
    setLoading(false);
  });

  const handleTaskListChange = (list: TaskList) => {
    setSelectedTaskList(list);
    fetchTasksForList(list.id);
  };

  const handleCreateTask = () => {
    if (!selectedTaskList || !newTaskTitle.trim()) return;

    setConfirmModal({
      show: true,
      title: 'Create To-Do Task',
      message: `Create task "${newTaskTitle}" in the list "${selectedTaskList.title}"?`,
      onConfirm: async () => {
        await runSafeApi(async () => {
          setTasksLoading(true);
          await createTask(selectedTaskList.id, newTaskTitle, newTaskNotes, newTaskDue || undefined);
          setNewTaskTitle('');
          setNewTaskNotes('');
          setNewTaskDue('');
          setShowAddTaskForm(false);
          setConfirmModal(null);
          fetchTasksForList(selectedTaskList.id);
        });
      }
    });
  };

  const handleToggleTaskStatus = (task: TaskItem) => {
    if (!selectedTaskList) return;
    const isNowCompleted = task.status === 'needsAction';

    setConfirmModal({
      show: true,
      title: isNowCompleted ? 'Complete Task' : 'Reopen Task',
      message: `Mark task "${task.title}" as ${isNowCompleted ? 'COMPLETED' : 'INCOMPLETE'}?`,
      onConfirm: async () => {
        await runSafeApi(async () => {
          setTasksLoading(true);
          await updateTaskStatus(selectedTaskList.id, task.id, task.title, isNowCompleted);
          setConfirmModal(null);
          fetchTasksForList(selectedTaskList.id);
        });
      }
    });
  };

  const handleDeleteTask = (taskId: string, title: string) => {
    if (!selectedTaskList) return;

    setConfirmModal({
      show: true,
      title: 'Delete Task',
      message: `Are you sure you want to permanently delete task "${title}"? This cannot be undone.`,
      onConfirm: async () => {
        await runSafeApi(async () => {
          setTasksLoading(true);
          await deleteTask(selectedTaskList.id, taskId);
          setConfirmModal(null);
          fetchTasksForList(selectedTaskList.id);
        });
      }
    });
  };

  // ==========================================
  // GOOGLE CONTACTS LOGIC
  // ==========================================
  const fetchContacts = () => runSafeApi(async () => {
    setContactsLoading(true);
    if (searchContactQuery.trim()) {
      const res = await searchContacts(searchContactQuery);
      const searchResults = (res.results || []).map(r => r.person);
      setContacts(searchResults);
    } else {
      const res = await listContacts(100);
      setContacts(res.connections || []);
    }
    setContactsLoading(false);
  });

  const handleSearchContacts = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContacts();
  };


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="flex justify-between items-start border-b border-gray-100 pb-6">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.2em] mb-1.5 block flex items-center gap-1">
            <Sparkles size={12} /> Unified Control Center
          </span>
          <h1 className="text-3xl font-black text-[#1A2B4C] tracking-tight">Google Workspace Hub</h1>
          <p className="text-xs text-gray-400 mt-1">Manage corporate Gmail correspondence, Google Chat lines, Task checklists, and Customer directory contacts.</p>
        </div>
        {connected && (
          <button 
            onClick={handleDisconnect}
            className="flex items-center gap-2 border border-red-100 hover:bg-red-50 text-red-500 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Disconnect Account
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-3xl text-sm flex justify-between items-center shadow-sm">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X size={18} />
          </button>
        </div>
      )}

      {!connected ? (
        /* Connection Screen */
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-12 text-center max-w-2xl mx-auto my-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#EA4335] via-[#4285F4] to-[#34A853]"></div>
          <div className="w-20 h-20 bg-gradient-to-tr from-[#1A2B4C] to-[#00B4D8] rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-md">
            <Shield size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-[#1A2B4C] tracking-tight mb-3">Authorize Google Workspace Services</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-10 leading-relaxed">
            AV Live Admin requires explicit permission to integrate with Gmail, Google Chat, Tasks, and Contacts. All authorization tokens are safely cached strictly in the browser's volatile memory.
          </p>

          <button 
            onClick={handleConnect}
            disabled={loading}
            className="gsi-material-button mx-auto flex items-center justify-center border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 shadow-md active:scale-95 transition-all py-3 px-6 rounded-2xl font-black text-sm text-[#1A2B4C] tracking-tight"
          >
            {loading ? (
              <Loader2 className="animate-spin text-[#00B4D8] mr-3" size={18} />
            ) : (
              <div className="gsi-material-button-icon mr-3">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '20px', height: '20px' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              </div>
            )}
            <span className="gsi-material-button-contents font-bold">Connect via Google Workspace Account</span>
          </button>
        </div>
      ) : (
        /* Workspace App Interface */
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
          {/* Inner Left Sidebar Tabs */}
          <div className="w-full md:w-64 border-r border-gray-50 bg-gray-50/20 p-6 space-y-2 shrink-0">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] block mb-4 px-3">ACTIVE MODULES</span>
            
            <button
              onClick={() => setActiveTab('gmail')}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold tracking-tight transition-all ${activeTab === 'gmail' ? 'bg-[#1A2B4C] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100/50 hover:text-[#1A2B4C]'}`}
            >
              <div className="flex items-center gap-3">
                <Mail size={18} />
                <span>Gmail Inbox</span>
              </div>
              <ChevronRight size={14} className={activeTab === 'gmail' ? 'text-[#00B4D8]' : 'text-gray-300'} />
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold tracking-tight transition-all ${activeTab === 'chat' ? 'bg-[#1A2B4C] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100/50 hover:text-[#1A2B4C]'}`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={18} />
                <span>Google Chat</span>
              </div>
              <ChevronRight size={14} className={activeTab === 'chat' ? 'text-[#00B4D8]' : 'text-gray-300'} />
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold tracking-tight transition-all ${activeTab === 'tasks' ? 'bg-[#1A2B4C] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100/50 hover:text-[#1A2B4C]'}`}
            >
              <div className="flex items-center gap-3">
                <CheckSquare size={18} />
                <span>Google Tasks</span>
              </div>
              <ChevronRight size={14} className={activeTab === 'tasks' ? 'text-[#00B4D8]' : 'text-gray-300'} />
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold tracking-tight transition-all ${activeTab === 'contacts' ? 'bg-[#1A2B4C] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100/50 hover:text-[#1A2B4C]'}`}
            >
              <div className="flex items-center gap-3">
                <Users size={18} />
                <span>Contacts</span>
              </div>
              <ChevronRight size={14} className={activeTab === 'contacts' ? 'text-[#00B4D8]' : 'text-gray-300'} />
            </button>
          </div>

          {/* Tab Content Window */}
          <div className="flex-1 p-8 flex flex-col min-w-0">
            {/* GMAIL TAB PANELS */}
            {activeTab === 'gmail' && (
              <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[500px]">
                {/* Email Index List */}
                <div className="w-full lg:w-96 flex flex-col space-y-4 shrink-0 border-r border-gray-50 pr-4">
                  <div className="flex justify-between items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        value={searchEmailQuery}
                        onChange={e => setSearchEmailQuery(e.target.value)}
                        placeholder="Search emails (e.g. from:cisco)"
                        className="w-full border border-gray-100 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#00B4D8] bg-gray-50/50 font-medium"
                      />
                    </div>
                    <button 
                      onClick={fetchEmails} 
                      className="p-2.5 bg-[#1A2B4C]/5 hover:bg-[#1A2B4C]/10 rounded-xl text-gray-600 transition-all shrink-0"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button 
                      onClick={() => setShowCompose(true)}
                      className="p-2.5 bg-[#00B4D8] hover:bg-[#1A2B4C] text-white rounded-xl transition-all shadow-md shrink-0"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16">
                      <Loader2 className="animate-spin text-[#00B4D8] mb-2" size={24} />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Syncing Inbox...</span>
                    </div>
                  ) : emails.length === 0 ? (
                    <div className="flex-1 py-16 text-center text-gray-400 text-xs">
                      No matching emails found in your mailbox.
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-2 max-h-[480px] pr-2">
                      {emails.map(email => (
                        <div 
                          key={email.id}
                          onClick={() => handleSelectEmail(email.id)}
                          className={`p-4 rounded-2xl cursor-pointer transition-all border text-left ${selectedEmail?.id === email.id ? 'bg-[#00B4D8]/5 border-[#00B4D8]/20 shadow-sm' : 'bg-gray-50/30 hover:bg-gray-50 border-transparent'}`}
                        >
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <span className="text-xs font-black text-[#1A2B4C] truncate max-w-[150px]">{email.from}</span>
                            <span className="text-[9px] text-gray-400 font-bold shrink-0">{email.date ? new Date(email.date).toLocaleDateString() : ''}</span>
                          </div>
                          <div className="text-xs font-bold text-gray-700 truncate mb-1">{email.subject}</div>
                          <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{email.snippet}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Email Viewer Panel */}
                <div className="flex-1 flex flex-col border border-gray-50 rounded-3xl bg-gray-50/10 overflow-hidden p-6 min-h-[400px]">
                  {emailDetailsLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <Loader2 className="animate-spin text-[#00B4D8] mb-2" size={28} />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rendering mail thread...</span>
                    </div>
                  ) : selectedEmail ? (
                    <div className="flex-1 flex flex-col space-y-4">
                      {/* Top Controls */}
                      <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                        <div className="text-left">
                          <h3 className="text-base font-black text-[#1A2B4C]">
                            {selectedEmail.payload?.headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(No Subject)'}
                          </h3>
                          <div className="flex flex-col text-xs text-gray-400 font-bold mt-1">
                            <span>From: {selectedEmail.payload?.headers.find(h => h.name.toLowerCase() === 'from')?.value}</span>
                            <span>Date: {selectedEmail.payload?.headers.find(h => h.name.toLowerCase() === 'date')?.value}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleTrashEmail(
                            selectedEmail.id, 
                            selectedEmail.payload?.headers.find(h => h.name.toLowerCase() === 'subject')?.value || 'this email'
                          )}
                          className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      {/* Message HTML Body inside iframe for style isolation */}
                      <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 overflow-auto max-h-[360px]">
                        <iframe 
                          srcDoc={`
                            <html>
                              <head>
                                <style>
                                  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1a2b4c; }
                                </style>
                              </head>
                              <body>${getEmailBodyHtml(selectedEmail.payload)}</body>
                            </html>
                          `}
                          className="w-full h-full border-none"
                          title="Email Body"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
                      <Mail size={36} className="text-gray-300" />
                      <span className="text-xs">Select an email correspondence thread to read details.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GOOGLE CHAT PANEL */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[500px]">
                {/* Chat Spaces index */}
                <div className="w-full lg:w-64 border-r border-gray-50 pr-4 flex flex-col space-y-4 shrink-0">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-left">CHANNELS & SPACES</span>
                  {loading ? (
                    <div className="flex-1 flex items-center justify-center py-16">
                      <Loader2 className="animate-spin text-[#00B4D8]" size={18} />
                    </div>
                  ) : chatError ? (
                    <div className="py-12 text-left text-red-500 text-xs px-2 font-medium">
                      <AlertCircle className="mb-2 opacity-75" size={20} />
                      {chatError}
                    </div>
                  ) : spaces.length === 0 ? (
                    <p className="text-xs text-gray-400 text-left">No active Chat rooms or spaces found.</p>
                  ) : (
                    <div className="space-y-1.5 overflow-y-auto max-h-[450px]">
                      {spaces.map(space => (
                        <button
                          key={space.name}
                          onClick={() => handleSelectSpace(space)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${selectedSpace?.name === space.name ? 'bg-[#00B4D8]/10 text-[#00B4D8]' : 'text-gray-600 hover:bg-gray-100/50'}`}
                        >
                          <MessageSquare size={14} className="shrink-0" />
                          <span className="truncate">{space.displayName || space.name.replace('spaces/', 'Room ')}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chat Message Box */}
                <div className="flex-1 flex flex-col border border-gray-50 rounded-3xl bg-gray-50/10 overflow-hidden min-h-[400px]">
                  {selectedSpace ? (
                    <div className="flex-1 flex flex-col h-full">
                      {/* Space Banner */}
                      <div className="p-5 border-b border-gray-50 bg-white flex justify-between items-center">
                        <span className="font-bold text-[#1A2B4C] text-sm text-left">
                          Room: {selectedSpace.displayName || selectedSpace.name}
                        </span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">REALTIME API STATE</span>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[340px] flex flex-col">
                        {chatLoading ? (
                          <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="animate-spin text-[#00B4D8]" size={20} />
                          </div>
                        ) : chatMessages.length === 0 ? (
                          <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                            No chat transcripts in this space.
                          </div>
                        ) : (
                          chatMessages.map((msg) => (
                            <div 
                              key={msg.name} 
                              className={`flex gap-3 max-w-[80%] text-left ${msg.sender?.displayName === 'Me' ? 'self-end flex-row-reverse' : 'self-start'}`}
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1A2B4C] to-[#00B4D8] flex items-center justify-center text-[10px] text-white font-black shrink-0">
                                {msg.sender?.displayName?.substring(0, 2) || 'US'}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400">
                                  <span>{msg.sender?.displayName}</span>
                                  <span>•</span>
                                  <span>{msg.createTime ? new Date(msg.createTime).toLocaleTimeString() : ''}</span>
                                </div>
                                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.sender?.displayName === 'Me' ? 'bg-[#00B4D8] text-white' : 'bg-white border border-gray-100 text-gray-700'}`}>
                                  {msg.text}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Compose input panel */}
                      <div className="p-4 border-t border-gray-50 bg-white flex items-center gap-3">
                        <input 
                          type="text"
                          value={newMessageText}
                          onChange={e => setNewMessageText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSendChatMessage(); }}
                          placeholder="Compose chat message..."
                          className="flex-1 border border-gray-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#00B4D8]"
                        />
                        <button 
                          onClick={handleSendChatMessage}
                          className="p-3 bg-[#1A2B4C] text-white rounded-xl hover:bg-[#00B4D8] transition-all"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
                      <MessageSquare size={36} className="text-gray-300" />
                      <span className="text-xs">Choose or connect a Google Chat room.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GOOGLE TASKS PANEL */}
            {activeTab === 'tasks' && (
              <div className="flex-1 flex flex-col space-y-6">
                {/* List Selector Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Task List:</span>
                    <select
                      value={selectedTaskList?.id || ''}
                      onChange={e => {
                        const targetList = taskLists.find(l => l.id === e.target.value);
                        if (targetList) handleTaskListChange(targetList);
                      }}
                      className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A2B4C] focus:outline-none focus:border-[#00B4D8]"
                    >
                      {taskLists.map(list => (
                        <option key={list.id} value={list.id}>{list.title}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                    className="flex items-center gap-2 bg-[#1A2B4C] hover:bg-[#00B4D8] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md self-end"
                  >
                    <Plus size={14} /> Create Task
                  </button>
                </div>

                {/* Add task form dropdown */}
                {showAddTaskForm && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="bg-gray-50 border border-gray-100 rounded-3xl p-6 text-left space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Task Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Schedule corporate AV system audit"
                          value={newTaskTitle}
                          onChange={e => setNewTaskTitle(e.target.value)}
                          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#00B4D8]"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Due Date (Optional)</label>
                        <input 
                          type="date" 
                          value={newTaskDue}
                          onChange={e => setNewTaskDue(e.target.value)}
                          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#00B4D8]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Task Description / Notes</label>
                      <textarea 
                        rows={2}
                        placeholder="Provide details about the AV setup requirements..."
                        value={newTaskNotes}
                        onChange={e => setNewTaskNotes(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#00B4D8]"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setShowAddTaskForm(false)}
                        className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleCreateTask}
                        className="bg-[#1A2B4C] hover:bg-[#00B4D8] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                      >
                        Save Task
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Checklist render */}
                {tasksLoading ? (
                  <div className="py-16 text-center">
                    <Loader2 className="animate-spin text-[#00B4D8] mx-auto mb-2" size={24} />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Syncing To-Dos...</span>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-xs">
                    No task records in this list. Reclaim your focus by adding one.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 text-left">
                    {tasks.map(task => (
                      <div key={task.id} className="py-4 flex justify-between items-start gap-4 hover:bg-gray-50/30 px-3 rounded-2xl transition-all">
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleToggleTaskStatus(task)}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 hover:border-[#00B4D8]'}`}
                          >
                            {task.status === 'completed' && <Check size={14} />}
                          </button>
                          <div>
                            <span className={`text-xs font-bold block ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {task.title}
                            </span>
                            {task.notes && (
                              <p className="text-[11px] text-gray-400 mt-1">{task.notes}</p>
                            )}
                            {task.due && (
                              <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-[#00B4D8] uppercase tracking-wider mt-2 bg-[#00B4D8]/5 px-2 py-0.5 rounded-md">
                                <Calendar size={10} /> Due {new Date(task.due).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteTask(task.id, task.title)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* GOOGLE CONTACTS PANEL */}
            {activeTab === 'contacts' && (
              <div className="flex-1 flex flex-col space-y-6">
                {/* Search Contacts bar */}
                <form onSubmit={handleSearchContacts} className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      value={searchContactQuery}
                      onChange={e => setSearchContactQuery(e.target.value)}
                      placeholder="Search contacts list by name or email..."
                      className="w-full border border-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#00B4D8] bg-gray-50/50 font-medium"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-[#1A2B4C] hover:bg-[#00B4D8] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    Search Connections
                  </button>
                </form>

                {/* Contacts roster */}
                {contactsLoading ? (
                  <div className="py-16 text-center">
                    <Loader2 className="animate-spin text-[#00B4D8] mx-auto mb-2" size={24} />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Querying Directory...</span>
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-xs">
                    No contacts found in your Google Account directory.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                    {contacts.map(contact => (
                      <div key={contact.resourceName} className="p-5 border border-gray-100 rounded-3xl bg-gray-50/30 flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gradient-to-tr from-[#1A2B4C] to-[#00B4D8] flex items-center justify-center text-white font-black">
                          {contact.photos?.[0]?.url && !contact.photos[0].default ? (
                            <img loading="lazy" src={contact.photos[0].url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            contact.names?.[0]?.displayName?.substring(0, 2).toUpperCase() || 'UN'
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-black text-[#1A2B4C] truncate block">
                            {contact.names?.[0]?.displayName || 'Anonymous Contact'}
                          </span>
                          {contact.emailAddresses?.[0]?.value && (
                            <span className="text-[10px] font-bold text-gray-400 block truncate mt-0.5 select-all">
                              {contact.emailAddresses[0].value}
                            </span>
                          )}
                          {contact.phoneNumbers?.[0]?.value && (
                            <span className="text-[10px] font-bold text-gray-400 block mt-0.5 select-all">
                              {contact.phoneNumbers[0].value}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gmail Compose Draft Drawer/Modal */}
      <AnimatePresence>
        {showCompose && (
          <div className="fixed inset-0 bg-[#1A2B4C]/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div className="text-left">
                  <h2 className="text-xl font-black text-[#1A2B4C] tracking-tight">New Message</h2>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Google Workspace Delivery Agent</p>
                </div>
                <button 
                  onClick={() => setShowCompose(false)}
                  className="w-10 h-10 rounded-xl bg-white text-gray-400 hover:text-red-500 hover:shadow-md transition-all flex items-center justify-center border border-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-8 space-y-4 text-left">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Recipient Address</label>
                  <input 
                    type="email"
                    required
                    placeholder="recipient@example.com"
                    value={composeData.to}
                    onChange={e => setComposeData({ ...composeData, to: e.target.value })}
                    className="w-full border border-gray-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#00B4D8]"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Subject Header</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Quotation AV Live Systems"
                    value={composeData.subject}
                    onChange={e => setComposeData({ ...composeData, subject: e.target.value })}
                    className="w-full border border-gray-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#00B4D8]"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Message Body (HTML Allowed)</label>
                  <textarea 
                    rows={6}
                    required
                    placeholder="Type email body..."
                    value={composeData.body}
                    onChange={e => setComposeData({ ...composeData, body: e.target.value })}
                    className="w-full border border-gray-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#00B4D8]"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCompose(false)}
                    className="flex-1 bg-gray-100 text-gray-500 font-bold py-3.5 rounded-xl text-xs uppercase"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSendEmail}
                    className="flex-1 bg-[#1A2B4C] hover:bg-[#00B4D8] text-white font-bold py-3.5 rounded-xl text-xs uppercase flex items-center justify-center gap-2"
                  >
                    <Send size={12} /> Send Email
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal - Mandatory for Workspace updates/deletes/sends */}
      <AnimatePresence>
        {confirmModal?.show && (
          <div className="fixed inset-0 bg-[#1A2B4C]/90 backdrop-blur-md flex items-center justify-center z-[200] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl p-8"
            >
              <h3 className="text-lg font-black text-[#1A2B4C] mb-2 text-left">{confirmModal.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-6 text-left">{confirmModal.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 bg-gray-100 text-gray-500 font-bold py-3.5 rounded-xl text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await confirmModal.onConfirm();
                  }}
                  className="flex-1 bg-[#00B4D8] hover:bg-[#1A2B4C] text-white font-bold py-3.5 rounded-xl text-xs uppercase"
                >
                  Confirm Operation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
