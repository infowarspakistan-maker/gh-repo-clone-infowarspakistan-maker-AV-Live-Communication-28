import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase/client';
import { FileText, Eye, CheckCircle, XCircle, Search, Clock, Mail, Phone, MapPin } from 'lucide-react';

export function EventQuotesManager() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const q = query(collection(db, 'event_quotes'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedQuotes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuotes(fetchedQuotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'event_quotes', id), { status: newStatus });
      setQuotes(quotes.map(q => q.id === id ? { ...q, status: newStatus } : q));
      if (selectedQuote && selectedQuote.id === id) {
        setSelectedQuote({ ...selectedQuote, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const fullName = quote.clientInfo?.fullName || quote.fullName || '';
    const companyName = quote.clientInfo?.companyName || quote.companyName || '';
    const email = quote.clientInfo?.email || quote.email || '';
    const quoteId = quote.quoteId || '';

    const matchesSearch = 
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quoteId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider">New</span>;
      case 'contacted': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wider">Contacted</span>;
      case 'quoted': return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold uppercase tracking-wider">Quoted</span>;
      case 'converted': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wider">Converted</span>;
      case 'lost': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase tracking-wider">Lost</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1A2B4C] mb-2">Event Quotes</h1>
          <p className="text-gray-500">Manage incoming event consultation and quote requests.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Total Requests</h3>
          <div className="text-3xl font-black text-[#1A2B4C]">{quotes.length}</div>
        </div>
        <div className="bg-blue-50 rounded-2xl p-6 shadow-sm border border-blue-100">
          <h3 className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-2">New</h3>
          <div className="text-3xl font-black text-blue-900">{quotes.filter(q => q.status === 'new').length}</div>
        </div>
        <div className="bg-green-50 rounded-2xl p-6 shadow-sm border border-green-100">
          <h3 className="text-green-600 text-sm font-bold uppercase tracking-widest mb-2">Converted</h3>
          <div className="text-3xl font-black text-green-900">{quotes.filter(q => q.status === 'converted').length}</div>
        </div>
        <div className="bg-purple-50 rounded-2xl p-6 shadow-sm border border-purple-100">
          <h3 className="text-purple-600 text-sm font-bold uppercase tracking-widest mb-2">Quoted</h3>
          <div className="text-3xl font-black text-purple-900">{quotes.filter(q => q.status === 'quoted').length}</div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* List View */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[700px]">
          <div className="p-6 border-b border-gray-100 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by name, company, or quote ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] transition-all"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#00B4D8] font-medium text-gray-700"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B4D8]"></div>
              </div>
            ) : filteredQuotes.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                No quotes found matching your filters.
              </div>
            ) : (
              filteredQuotes.map((quote) => (
                <div 
                  key={quote.id} 
                  onClick={() => setSelectedQuote(quote)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedQuote?.id === quote.id ? 'border-[#00B4D8] bg-[#00B4D8]/5' : 'border-gray-100 hover:border-[#00B4D8]/30 hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-[#1A2B4C]">{quote.clientInfo?.fullName || quote.fullName}</h4>
                      <div className="text-sm text-gray-500">{quote.clientInfo?.companyName || quote.companyName || 'Individual'}</div>
                    </div>
                    {getStatusBadge(quote.status)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-4">
                    <span className="font-mono">{quote.quoteId}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {formatDate(quote.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Details View */}
        {selectedQuote ? (
          <div className="lg:w-[600px] bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[700px] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-[#1A2B4C] text-white">
              <div>
                <h2 className="text-2xl font-black">{selectedQuote.clientInfo?.fullName || selectedQuote.fullName}</h2>
                <p className="text-blue-200">{selectedQuote.clientInfo?.companyName || selectedQuote.companyName || 'Individual'} • {selectedQuote.quoteId}</p>
              </div>
              <div>{getStatusBadge(selectedQuote.status)}</div>
            </div>
            
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex gap-2 overflow-x-auto">
               <button onClick={() => handleUpdateStatus(selectedQuote.id, 'new')} className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer">Mark New</button>
               <button onClick={() => handleUpdateStatus(selectedQuote.id, 'contacted')} className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer">Mark Contacted</button>
               <button onClick={() => handleUpdateStatus(selectedQuote.id, 'quoted')} className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer">Mark Quoted</button>
               <button onClick={() => handleUpdateStatus(selectedQuote.id, 'converted')} className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer">Mark Converted</button>
               <button onClick={() => handleUpdateStatus(selectedQuote.id, 'lost')} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer">Mark Lost</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Contact Info */}
              <section>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Client Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0"><Mail size={18}/></div>
                    <div className="overflow-hidden">
                      <div className="text-xs text-gray-500 font-bold uppercase">Email</div>
                      <a href={`mailto:${selectedQuote.clientInfo?.email || selectedQuote.email}`} className="text-sm font-medium text-[#1A2B4C] hover:text-[#00B4D8] truncate block">{selectedQuote.clientInfo?.email || selectedQuote.email}</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0"><Phone size={18}/></div>
                    <div className="overflow-hidden">
                      <div className="text-xs text-gray-500 font-bold uppercase">Phone</div>
                      <a href={`tel:${selectedQuote.clientInfo?.phone || selectedQuote.phone}`} className="text-sm font-medium text-[#1A2B4C] hover:text-[#00B4D8] truncate block">{selectedQuote.clientInfo?.phone || selectedQuote.phone}</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 shrink-0"><MapPin size={18}/></div>
                    <div className="overflow-hidden">
                      <div className="text-xs text-gray-500 font-bold uppercase">City</div>
                      <div className="text-sm font-medium text-[#1A2B4C] truncate">{selectedQuote.clientInfo?.city || selectedQuote.city || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0"><FileText size={18}/></div>
                    <div className="overflow-hidden">
                      <div className="text-xs text-gray-500 font-bold uppercase">Preferred</div>
                      <div className="text-sm font-medium text-[#1A2B4C] truncate capitalize">{selectedQuote.clientInfo?.preferredContact || selectedQuote.preferredContact || 'Email'}</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Event Info */}
              <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Event Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    <div>
                      <div className="text-xs text-gray-500 font-bold uppercase mb-1">Event Type</div>
                      <div className="font-medium text-[#1A2B4C] capitalize">{(selectedQuote.eventInfo?.eventType || selectedQuote.eventType)?.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-bold uppercase mb-1">Sub-Type</div>
                      <div className="font-medium text-[#1A2B4C]">{selectedQuote.eventInfo?.eventSubTypeLabel || selectedQuote.eventSubTypeLabel || selectedQuote.eventInfo?.eventSubType || selectedQuote.eventSubType}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-bold uppercase mb-1">Participants</div>
                      <div className="font-medium text-[#1A2B4C]">{selectedQuote.eventInfo?.expectedParticipants || selectedQuote.expectedParticipants}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-bold uppercase mb-1">Duration</div>
                      <div className="font-medium text-[#1A2B4C]">{selectedQuote.eventInfo?.duration || selectedQuote.duration}</div>
                    </div>
                  </div>

                  {((selectedQuote.eventInfo?.gameTitles && selectedQuote.eventInfo.gameTitles.length > 0) || (selectedQuote.gameTitles && selectedQuote.gameTitles.length > 0)) && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500 font-bold uppercase mb-2">Game Titles</div>
                      <div className="flex flex-wrap gap-2">
                        {(selectedQuote.eventInfo?.gameTitles || selectedQuote.gameTitles || []).map((game: string) => (
                          <span key={game} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium">{game}</span>
                        ))}
                        {(selectedQuote.eventInfo?.otherGameTitle || selectedQuote.otherGameTitle) && (
                          <span className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium">{selectedQuote.eventInfo?.otherGameTitle || selectedQuote.otherGameTitle}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Logistics */}
              <section>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Logistics Requirements</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">Venue</div>
                    <div className="font-medium">{(selectedQuote.logistics?.venueRequirement || selectedQuote.venueRequirement || '')?.replace('_', ' ')} <br/> <span className="text-gray-500">in {selectedQuote.logistics?.venueCity || selectedQuote.venueCity}</span></div>
                  </div>
                  <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">Internet</div>
                    <div className="font-medium capitalize">{(selectedQuote.logistics?.internetRequirement || selectedQuote.internetRequirement || '')?.replace('_', ' ')}</div>
                  </div>
                  <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">Power</div>
                    <div className="font-medium capitalize">{(selectedQuote.logistics?.powerRequirement || selectedQuote.powerRequirement || '')?.replace('_', ' ')}</div>
                  </div>
                  <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">Equipment</div>
                    <div className="font-medium capitalize">{(selectedQuote.logistics?.equipmentRequirement || selectedQuote.equipmentRequirement || '')?.replace('_', ' ')}</div>
                  </div>
                </div>
              </section>

              {/* Financials */}
              <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">Budget & Estimates</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-blue-200 pb-3">
                    <div className="text-blue-900 font-medium">Client Budget Range</div>
                    <div className="font-bold text-[#1A2B4C]">{(selectedQuote.budget?.budgetRange || selectedQuote.budgetRange || '')?.replace(/_/g, ' ').toUpperCase()}</div>
                  </div>
                  <div className="flex justify-between items-center border-b border-blue-200 pb-3">
                    <div className="text-blue-900 font-medium">Prize Pool (if any)</div>
                    <div className="font-bold text-[#1A2B4C]">PKR {parseInt(selectedQuote.budget?.prizePool || selectedQuote.prizePool || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-blue-900 font-medium mb-2">System Estimated Range</div>
                    <div className="text-3xl font-black text-[#00B4D8]">PKR {selectedQuote.budget?.estimatedRange || selectedQuote.estimatedRange}</div>
                  </div>
                  
                  {(selectedQuote.budget?.breakdown || selectedQuote.breakdown) && (
                    <div className="pt-2 text-xs text-blue-800 space-y-1">
                      <div className="font-bold uppercase tracking-wider mb-2">Estimate Breakdown</div>
                      <div className="flex justify-between"><span>Venue:</span> <span>{(selectedQuote.budget?.breakdown || selectedQuote.breakdown).venue}</span></div>
                      <div className="flex justify-between"><span>Equipment:</span> <span>{(selectedQuote.budget?.breakdown || selectedQuote.breakdown).equipment}</span></div>
                      <div className="flex justify-between"><span>Broadcast:</span> <span>{(selectedQuote.budget?.breakdown || selectedQuote.breakdown).broadcast}</span></div>
                      <div className="flex justify-between"><span>Staff:</span> <span>{(selectedQuote.budget?.breakdown || selectedQuote.breakdown).staff}</span></div>
                    </div>
                  )}
                </div>
              </section>

              {/* Additional Notes */}
              {selectedQuote.additionalInfo && (
                <section>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Additional Notes from Client</h3>
                  <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-yellow-900 text-sm italic">
                    "{selectedQuote.additionalInfo}"
                  </div>
                </section>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:w-[600px] bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-[700px] text-gray-400 p-12 text-center">
             <FileText size={48} className="mb-4 opacity-20" />
             <h3 className="text-xl font-bold text-[#1A2B4C] mb-2">No Quote Selected</h3>
             <p>Select a quote request from the list to view its full details and manage its status.</p>
          </div>
        )}
      </div>
    </div>
  );
}
