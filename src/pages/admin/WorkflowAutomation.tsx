import { useState, useEffect, FormEvent } from 'react';
import { 
  Play, Trash2, Edit2, Plus, Check, X, Copy, 
  RefreshCw, Sliders, AlertCircle, Calendar, 
  ChevronDown, ChevronUp, Webhook, Shield, Activity,
  Loader2, CheckCircle2, AlertTriangle, Eye, Send
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Workflow {
  id: string;
  name: string;
  webhookUrl: string;
  events: string[];
  isActive: boolean;
  secretHeader?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface WorkflowLog {
  id: string;
  workflowId: string;
  workflowName: string;
  webhookUrl: string;
  event: string;
  timestamp: string;
  payload: string;
  responseStatus: number;
  responseBody: string;
  status: 'success' | 'failure';
  durationMs?: number;
}

export function WorkflowAutomation() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [activeTab, setActiveTab] = useState<'workflows' | 'logs'>('workflows');
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formWebhookUrl, setFormWebhookUrl] = useState('');
  const [formEvents, setFormEvents] = useState<string[]>(['all']);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSecretHeader, setFormSecretHeader] = useState('');
  
  // UI states
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Workflows
  const fetchWorkflows = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/workflows', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data);
      }
    } catch (err) {
      console.error('Failed to load workflows', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Logs
  const fetchLogs = async () => {
    if (!user) return;
    setLogsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/workflows/logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    fetchLogs();
  }, []);

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlId(id);
    setTimeout(() => setCopiedUrlId(null), 2000);
  };

  const handleOpenCreateModal = () => {
    setSelectedWorkflow(null);
    setFormName('');
    setFormWebhookUrl('');
    setFormEvents(['all']);
    setFormIsActive(true);
    setFormSecretHeader('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setFormName(workflow.name);
    setFormWebhookUrl(workflow.webhookUrl);
    setFormEvents(workflow.events || ['all']);
    setFormIsActive(workflow.isActive);
    setFormSecretHeader(workflow.secretHeader || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggleEvent = (event: string) => {
    if (event === 'all') {
      setFormEvents(['all']);
      return;
    }
    
    let updated = [...formEvents];
    if (updated.includes('all')) {
      updated = updated.filter(e => e !== 'all');
    }

    if (updated.includes(event)) {
      updated = updated.filter(e => e !== event);
      if (updated.length === 0) {
        updated = ['all'];
      }
    } else {
      updated.push(event);
    }
    setFormEvents(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formWebhookUrl.trim()) {
      setFormError('Name and Webhook URL are required.');
      return;
    }

    // Basic URL validation
    try {
      new URL(formWebhookUrl);
    } catch (_) {
      setFormError('Please enter a valid webhook HTTP/HTTPS URL.');
      return;
    }

    setSubmitting(true);
    try {
      const token = await user?.getIdToken();
      const url = selectedWorkflow 
        ? `/api/admin/workflows/${selectedWorkflow.id}`
        : '/api/admin/workflows';
      
      const method = selectedWorkflow ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formName,
          webhookUrl: formWebhookUrl,
          events: formEvents,
          isActive: formIsActive,
          secretHeader: formSecretHeader
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchWorkflows();
        fetchLogs();
      } else {
        const errData = await res.json();
        setFormError(errData.error || 'Failed to save workflow.');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this n8n automation workflow?')) {
      return;
    }

    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/workflows/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setWorkflows(prev => prev.filter(w => w.id !== id));
        fetchLogs();
      } else {
        alert('Failed to delete workflow');
      }
    } catch (err) {
      console.error(err);
      alert('Network error deleting workflow');
    }
  };

  const handleToggleActive = async (workflow: Workflow) => {
    try {
      // Optimistic update
      setWorkflows(prev => prev.map(w => w.id === workflow.id ? { ...w, isActive: !w.isActive } : w));

      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/workflows/${workflow.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !workflow.isActive })
      });

      if (!res.ok) {
        // Rollback
        setWorkflows(prev => prev.map(w => w.id === workflow.id ? { ...w, isActive: workflow.isActive } : w));
        alert('Failed to toggle workflow status');
      } else {
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
      // Rollback
      setWorkflows(prev => prev.map(w => w.id === workflow.id ? { ...w, isActive: workflow.isActive } : w));
    }
  };

  const handleTestWorkflow = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/admin/workflows/${id}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        status: data.log?.responseStatus,
        response: data.log?.responseBody || 'No response body returned.'
      });
      fetchLogs(); // refresh logs
    } catch (err: any) {
      setTestResult({
        success: false,
        status: 500,
        response: err.message || 'Connection failed'
      });
    } finally {
      setTestingId(null);
    }
  };

  const getEventBadgeLabel = (event: string) => {
    switch (event) {
      case 'all': return 'All Events';
      case 'new_order': return 'New Order';
      case 'new_quote': return 'Event Quote';
      case 'contact_submission': return 'Contact Form';
      default: return event;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.2em] mb-1 block">Integrations Terminal</span>
          <h1 className="text-4xl font-black text-[#1A2B4C] tracking-tight">n8n Workflow Automations</h1>
          <p className="text-gray-500 mt-1 text-sm">Create triggers to dispatch webhook payloads into multiple n8n workflows.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="bg-[#1A2B4C] text-white px-8 py-3.5 rounded-full hover:bg-[#00B4D8] transition-all flex items-center font-black text-sm uppercase tracking-widest shadow-lg shrink-0"
        >
          <Plus size={16} className="mr-2" /> Add Workflow
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('workflows')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm tracking-wide uppercase transition-all ${
            activeTab === 'workflows' 
              ? 'border-[#00B4D8] text-[#00B4D8]' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Webhook size={16} /> Configured Workflows ({workflows.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm tracking-wide uppercase transition-all ${
            activeTab === 'logs' 
              ? 'border-[#00B4D8] text-[#00B4D8]' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Activity size={16} /> Execution Logs
          {logsLoading && <Loader2 className="animate-spin text-[#00B4D8]" size={14} />}
        </button>
      </div>

      {/* Main Tab Area */}
      {activeTab === 'workflows' ? (
        <div className="space-y-6">
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 className="animate-spin w-8 h-8 text-[#00B4D8] mx-auto mb-3" />
              <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">Accessing Automation Terminal...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-[#F0F9FF] text-[#00B4D8] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Webhook size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#1A2B4C] mb-1">No Workflows Configured</h3>
              <p className="text-gray-500 max-w-md mx-auto text-sm mb-6">
                Automate your system with n8n! Connect actions like checkouts, contact requests, and custom quotes directly to your workflows.
              </p>
              <button 
                onClick={handleOpenCreateModal}
                className="bg-[#00B4D8] text-white px-6 py-3 rounded-full hover:bg-[#1A2B4C] transition-all font-bold text-xs uppercase tracking-wider shadow-md"
              >
                Create Your First Workflow
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {workflows.map((workflow) => (
                <div 
                  key={workflow.id} 
                  className={`bg-white border transition-all rounded-3xl p-6 md:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                    workflow.isActive ? 'border-gray-100' : 'border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-bold text-[#1A2B4C] tracking-tight truncate">{workflow.name}</h3>
                      <button
                        onClick={() => handleToggleActive(workflow)}
                        className={`text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                          workflow.isActive 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${workflow.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                        {workflow.isActive ? 'Active' : 'Paused'}
                      </button>
                      
                      {workflow.secretHeader && (
                        <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Shield size={10} /> Secured payload
                        </span>
                      )}
                    </div>

                    {/* Webhook Url copy */}
                    <div className="flex items-center gap-2 max-w-xl bg-[#F8F9FA] rounded-xl px-3 py-2 border border-gray-200/50">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 select-none">Webhook URL:</span>
                      <span className="font-mono text-xs text-gray-600 truncate flex-1">{workflow.webhookUrl}</span>
                      <button 
                        onClick={() => handleCopyUrl(workflow.webhookUrl, workflow.id)}
                        className="text-gray-400 hover:text-[#00B4D8] transition-colors p-1"
                        title="Copy Webhook URL"
                      >
                        {copiedUrlId === workflow.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>

                    {/* Triggering Events */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400 font-bold">Triggers:</span>
                      {workflow.events?.map((evt) => (
                        <span 
                          key={evt} 
                          className="bg-gray-100 text-gray-700 border border-gray-200 text-xs px-2.5 py-0.5 rounded-lg font-medium"
                        >
                          {getEventBadgeLabel(evt)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions / Test tools */}
                  <div className="flex items-center gap-3 lg:self-center shrink-0 flex-wrap">
                    <button
                      onClick={() => handleTestWorkflow(workflow.id)}
                      disabled={testingId === workflow.id}
                      className="bg-[#F1F5F9] hover:bg-slate-200 text-slate-800 border border-slate-300/50 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {testingId === workflow.id ? (
                        <>
                          <Loader2 className="animate-spin text-[#00B4D8]" size={14} /> Testing...
                        </>
                      ) : (
                        <>
                          <Send size={14} /> Send Test Run
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(workflow)}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition-all"
                      title="Edit Configuration"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                      className="p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl transition-all"
                      title="Delete Workflow"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inline Live Test Result visualizer */}
          {testResult && (
            <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${testResult.success ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                  <span className="font-bold text-sm uppercase tracking-wider text-slate-400">Connection test terminal</span>
                </div>
                <button 
                  onClick={() => setTestResult(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400 block font-bold text-xs uppercase tracking-wide">Status Code</span>
                  <span className={`text-lg font-mono font-black ${testResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {testResult.status} {testResult.success ? 'OK' : 'Error'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-xs uppercase tracking-wide">Integration Result</span>
                  <span className={`text-sm font-semibold ${testResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {testResult.success ? 'Payload dispatched & acknowledged' : 'Handshake failed / returned error'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 block font-bold text-xs uppercase tracking-wide">n8n Host Response</span>
                <pre className="bg-black/40 p-4 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto max-h-40 border border-slate-800/40">
                  {testResult.response}
                </pre>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Logs Tab */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Showing last 50 automation requests</span>
            <button
              onClick={fetchLogs}
              disabled={logsLoading}
              className="text-xs bg-[#1A2B4C] hover:bg-[#00B4D8] text-white px-4 py-2 rounded-lg font-bold uppercase tracking-wider flex items-center gap-2 shadow transition-all"
            >
              <RefreshCw size={12} className={logsLoading ? 'animate-spin' : ''} /> Sync logs
            </button>
          </div>

          {logsLoading && logs.length === 0 ? (
            <div className="py-24 text-center">
              <Loader2 className="animate-spin w-8 h-8 text-[#00B4D8] mx-auto mb-3" />
              <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">Querying database logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[#1A2B4C] mb-1">No logs on file</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Triggered payloads will generate debug and integration records here automatically.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm divide-y divide-gray-100">
              {logs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div key={log.id} className="p-4 md:p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Status & Event info */}
                      <div className="flex items-center gap-3 min-w-0">
                        {log.status === 'success' ? (
                          <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                            <CheckCircle2 size={16} />
                          </span>
                        ) : (
                          <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                            <AlertTriangle size={16} />
                          </span>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1A2B4C] truncate">{log.workflowName}</span>
                            <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              {getEventBadgeLabel(log.event)}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-gray-400 block truncate mt-0.5">{log.webhookUrl}</span>
                        </div>
                      </div>

                      {/* Code, response time, calendar */}
                      <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className={`font-mono font-bold text-sm ${log.status === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            HTTP {log.responseStatus}
                          </span>
                          {log.durationMs && (
                            <span className="text-[10px] text-gray-400 block font-bold">{log.durationMs}ms delay</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Calendar size={12} />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>

                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#00B4D8] transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded logs viewer */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-in fade-in duration-150">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* JSON Payload dispatch details */}
                          <div className="space-y-1.5">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dispatched Payload</span>
                            <pre className="bg-[#1A2B4C] text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-64 border border-gray-200">
                              {JSON.stringify(JSON.parse(log.payload), null, 2)}
                            </pre>
                          </div>

                          {/* Response trace */}
                          <div className="space-y-1.5">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Response Details</span>
                            <div className="bg-slate-50 p-4 rounded-2xl font-mono text-xs text-slate-700 overflow-x-auto max-h-64 border border-gray-200 space-y-2">
                              <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-bold">Execution Status</span>
                                <span className={`font-black uppercase tracking-widest ${log.status === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {log.status === 'success' ? 'Success / Acknowledged' : 'Failed'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-bold">HTTP Status</span>
                                <span>{log.responseStatus}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-bold">Response Body</span>
                                <span className="whitespace-pre-wrap">{log.responseBody || '(No response body was returned)'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Creation / Editing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-[#1A2B4C] tracking-tight">
                  {selectedWorkflow ? 'Update Workflow' : 'Add n8n Workflow'}
                </h3>
                <p className="text-gray-500 text-xs mt-0.5">Setup webhook dispatcher with conditional event triggers.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              {formError && (
                <div className="bg-rose-50 text-rose-600 border border-rose-200 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Workflow Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. n8n Order Management / Telegram Alerts"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] font-medium"
                  required
                />
              </div>

              {/* Webhook URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">n8n Webhook URL</label>
                <input 
                  type="url" 
                  value={formWebhookUrl}
                  onChange={(e) => setFormWebhookUrl(e.target.value)}
                  placeholder="https://n8n.yourdomain.com/g/webhook/..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] font-mono text-xs"
                  required
                />
                <p className="text-[10px] text-gray-400">Provide the n8n HTTP Webhook production/test URL configured to receive POST requests.</p>
              </div>

              {/* Custom payload header secret */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Webhook Handshake Secret (Optional)</label>
                <input 
                  type="password" 
                  value={formSecretHeader}
                  onChange={(e) => setFormSecretHeader(e.target.value)}
                  placeholder="e.g. your-custom-secret-key"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/20 focus:border-[#00B4D8] font-mono text-xs"
                />
                <p className="text-[10px] text-gray-400">If supplied, we will attach this secret in the <code>X-Webhook-Secret</code> HTTP request header to secure your n8n workflow.</p>
              </div>

              {/* Conditional Events selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Trigger Events</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'all', label: 'All Event Dispatches' },
                    { id: 'new_order', label: 'New Checkouts (Orders)' },
                    { id: 'new_quote', label: 'B2B/Event Quote Submissions' },
                    { id: 'contact_submission', label: 'Contact Inquiries' }
                  ].map((evt) => {
                    const isSelected = formEvents.includes(evt.id);
                    return (
                      <button
                        type="button"
                        key={evt.id}
                        onClick={() => handleToggleEvent(evt.id)}
                        className={`px-4 py-3 border rounded-xl text-left font-bold text-xs transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'bg-[#1A2B4C] border-[#1A2B4C] text-white' 
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{evt.label}</span>
                        {isSelected && <Check size={14} className="text-[#00B4D8]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggle isActive */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <span className="font-bold text-[#1A2B4C] text-sm block">Active Status</span>
                  <span className="text-gray-400 text-xs">Instantly enable/pause automated dispatches.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formIsActive ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formIsActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Modal footer / submit */}
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-full hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#1A2B4C] text-white px-8 py-3.5 rounded-full hover:bg-[#00B4D8] transition-all flex items-center font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={14} /> Synchronizing...
                    </>
                  ) : (
                    <>
                      {selectedWorkflow ? 'Update Workflow' : 'Add Workflow'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
