import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealEstateStore } from '../../store/realEstateStore';
import type { BuyerProfile, LeadScore } from '../../types/realEstate';
import {
  Users,
  Search,
  Download,
  Upload,
  TrendingUp,
  Clock,
  Phone,
  Mail,
  Eye,
  MessageSquare,
  Flame,
  ThermometerSun,
  Snowflake,
  Inbox,
  Kanban,
  BarChart3,
  LogOut,
  Target,
  Send,
  Zap,
  X,
  Check,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

import { YuvnaLogoAgent } from './YuvnaLogo';

const initialBuyers: BuyerProfile[] = [
  { id: '1', firstName: 'Ahmed', lastName: 'Al-Rashid', email: 'ahmed@email.com', phone: '+971501234567', country: 'UAE', language: 'en', currency: 'AED', timezone: 'Asia/Dubai', persona: 'yield-investor', personaConfidence: 85, goal: 'investment', budgetBand: '1m-2m', urgencyScore: 85, leadScore: 'ready-to-call', engagementScore: 78, riskTolerance: 'moderate', investmentHorizon: '3-5-years', source: 'onboarding-widget', consentMarketing: true, consentWhatsApp: true, consentEmail: true, optOutChannels: [], createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), updatedAt: new Date(), lastActiveAt: new Date() },
  { id: '2', firstName: 'Sarah', lastName: 'Thompson', email: 'sarah.t@email.com', phone: '+447891234567', country: 'UK', language: 'en', currency: 'GBP', timezone: 'Europe/London', persona: 'visa-driven', personaConfidence: 90, goal: 'visa', budgetBand: '2m-5m', urgencyScore: 72, leadScore: 'hot', engagementScore: 65, riskTolerance: 'conservative', investmentHorizon: '5-10-years', source: 'partner-referral', consentMarketing: true, consentWhatsApp: false, consentEmail: true, optOutChannels: [], createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), updatedAt: new Date(), lastActiveAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: '3', firstName: 'Raj', lastName: 'Patel', email: 'raj.patel@email.com', country: 'India', language: 'en', currency: 'INR', timezone: 'Asia/Kolkata', persona: 'capital-investor', personaConfidence: 75, goal: 'investment', budgetBand: '500k-1m', urgencyScore: 45, leadScore: 'warm', engagementScore: 42, riskTolerance: 'aggressive', investmentHorizon: '3-5-years', source: 'csv-upload', consentMarketing: true, consentWhatsApp: true, consentEmail: true, optOutChannels: [], createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), updatedAt: new Date(), lastActiveAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: '4', firstName: 'Maria', lastName: 'Garcia', email: 'maria.g@email.com', country: 'EU', language: 'en', currency: 'EUR', timezone: 'Europe/Madrid', persona: 'lifestyle', personaConfidence: 80, goal: 'lifestyle', budgetBand: '2m-5m', urgencyScore: 30, leadScore: 'cold', engagementScore: 25, riskTolerance: 'conservative', investmentHorizon: '5-10-years', source: 'linkedin', consentMarketing: true, consentWhatsApp: false, consentEmail: true, optOutChannels: [], createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), updatedAt: new Date(), lastActiveAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  { id: '5', firstName: 'James', lastName: 'Wilson', email: 'james.w@email.com', phone: '+14155551234', country: 'US', language: 'en', currency: 'USD', timezone: 'America/New_York', persona: 'yield-investor', personaConfidence: 88, goal: 'investment', budgetBand: '1m-2m', urgencyScore: 92, leadScore: 'ready-to-call', engagementScore: 88, riskTolerance: 'moderate', investmentHorizon: '5-10-years', source: 'onboarding-widget', consentMarketing: true, consentWhatsApp: true, consentEmail: true, optOutChannels: [], createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), updatedAt: new Date(), lastActiveAt: new Date() },
];

const LeadScoreBadge = ({ score }: { score: LeadScore }) => {
  const config: Record<LeadScore, { icon: any; label: string; class: string }> = {
    'ready-to-call': { icon: Flame, label: 'Ready', class: 'bg-red-100 text-red-700 border-red-200' },
    'hot': { icon: ThermometerSun, label: 'Hot', class: 'bg-orange-100 text-orange-700 border-orange-200' },
    'warm': { icon: TrendingUp, label: 'Warm', class: 'bg-[#E07F26]/10 text-[#E07F26] border-[#E07F26]/20' },
    'cold': { icon: Snowflake, label: 'Cold', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  };
  const { icon: Icon, label, class: className } = config[score];
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}><Icon className="w-3.5 h-3.5" />{label}</span>;
};

const getTimeAgo = (date: Date): string => {
  const hours = Math.floor((new Date().getTime() - date.getTime()) / 3600000);
  const days = Math.floor(hours / 24);
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export function JuvnaLeads() {
  const { setView } = useRealEstateStore();
  const [buyers, setBuyers] = useState<BuyerProfile[]>(initialBuyers);
  const [filterScore, setFilterScore] = useState<LeadScore | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'recent' | 'budget'>('score');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<BuyerProfile | null>(null);
  const [importedLeads, setImportedLeads] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredBuyers = buyers.filter(buyer => {
    if (filterScore !== 'all' && buyer.leadScore !== filterScore) return false;
    if (searchQuery && !`${buyer.firstName} ${buyer.lastName} ${buyer.email}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sortedBuyers = [...filteredBuyers].sort((a, b) => {
    if (sortBy === 'score') {
      const priority: Record<LeadScore, number> = { 'ready-to-call': 0, 'hot': 1, 'warm': 2, 'cold': 3 };
      return priority[a.leadScore] - priority[b.leadScore];
    }
    if (sortBy === 'recent') return b.lastActiveAt.getTime() - a.lastActiveAt.getTime();
    const budgetOrder: Record<string, number> = { '5m-plus': 0, '2m-5m': 1, '1m-2m': 2, '500k-1m': 3, 'under-500k': 4 };
    return (budgetOrder[a.budgetBand] || 5) - (budgetOrder[b.budgetBand] || 5);
  });

  const stats = [
    { label: 'Total Leads', value: buyers.length, icon: Users, color: 'text-blue-600' },
    { label: 'Ready to Call', value: buyers.filter(b => b.leadScore === 'ready-to-call').length, icon: Flame, color: 'text-red-600' },
    { label: 'Hot Leads', value: buyers.filter(b => b.leadScore === 'hot').length, icon: ThermometerSun, color: 'text-orange-600' },
    { label: 'Conversion Rate', value: '18%', icon: TrendingUp, color: 'text-green-600' },
  ];

  // Export CSV - Actually downloads a file!
  const handleExport = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Country', 'Persona', 'Budget', 'Lead Score', 'Source', 'Created At'];
    const rows = buyers.map(b => [
      b.firstName,
      b.lastName,
      b.email,
      b.phone || '',
      b.country,
      b.persona || '',
      b.budgetBand,
      b.leadScore,
      b.source,
      b.createdAt.toISOString().split('T')[0]
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `yuvna-leads-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('success', `Exported ${buyers.length} leads to CSV`);
  };

  // Import CSV - Actually parses and adds leads!
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
      
      const parsed = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        const row: any = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        return {
          id: `import-${Date.now()}-${index}`,
          firstName: row['first name'] || row['firstname'] || row['name']?.split(' ')[0] || 'Unknown',
          lastName: row['last name'] || row['lastname'] || row['name']?.split(' ').slice(1).join(' ') || '',
          email: row['email'] || '',
          phone: row['phone'] || row['mobile'] || '',
          country: row['country'] || 'Unknown',
          valid: Boolean(row['email'] && row['email'].includes('@'))
        };
      }).filter(r => r.email);

      setImportedLeads(parsed);
      setShowImportModal(true);
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Confirm import - adds leads to the list
  const confirmImport = () => {
    const validLeads = importedLeads.filter(l => l.valid);
    const newBuyers: BuyerProfile[] = validLeads.map(lead => ({
      id: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone || undefined,
      country: lead.country,
      language: 'en',
      currency: 'USD',
      timezone: 'UTC',
      persona: null,
      personaConfidence: 0,
      goal: 'exploring',
      budgetBand: 'under-500k',
      urgencyScore: 0,
      leadScore: 'cold' as LeadScore,
      engagementScore: 0,
      riskTolerance: 'moderate' as const,
      investmentHorizon: '3-5-years' as const,
      source: 'csv-upload' as const,
      consentMarketing: true,
      consentWhatsApp: false,
      consentEmail: true,
      optOutChannels: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActiveAt: new Date(),
    }));

    setBuyers(prev => [...newBuyers, ...prev]);
    setShowImportModal(false);
    setImportedLeads([]);
    showNotification('success', `Imported ${validLeads.length} leads successfully`);
  };

  // Action handlers
  const handleCall = (phone?: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    } else {
      showNotification('error', 'No phone number available');
    }
  };

  const handleEmail = (email: string, name: string) => {
    const subject = encodeURIComponent(`Follow up - Yuvna Realty`);
    const body = encodeURIComponent(`Hi ${name},\n\nThank you for your interest in Dubai real estate.\n\nBest regards,\nYuvna Realty`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleWhatsApp = (phone?: string, name?: string) => {
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const message = encodeURIComponent(`Hi ${name}, this is Yuvna Realty. Thank you for your interest in Dubai property investment!`);
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    } else {
      showNotification('error', 'No phone number available');
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const navItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, badge: 3 },
    { id: 'outreach', label: 'Outreach Engine', icon: Send, highlight: true },
    { id: 'pipeline', label: 'Pipeline', icon: Kanban },
    { id: 'leads', label: 'All Leads', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#F9F7F5] flex">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
              notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {notification.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E8E4E0] flex flex-col">
        <div className="p-6 border-b border-[#E8E4E0]"><YuvnaLogoAgent /></div>
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => {
                if (item.id === 'inbox') setView('agent-inbox');
                if (item.id === 'outreach') setView('agent-outreach');
                if (item.id === 'pipeline') setView('agent-pipeline');
              }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                item.id === 'leads' 
                  ? 'bg-[#E07F26]/10 text-[#E07F26]' 
                  : (item as any).highlight
                    ? 'bg-[#E07F26] text-white hover:bg-[#c96e1f]'
                    : 'text-[#5a4a3f] hover:bg-[#F5F3F1]'
              }`}>
                <item.icon className="w-5 h-5" />{item.label}
                {item.badge && <span className="ml-auto px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">{item.badge}</span>}
                {(item as any).highlight && !item.badge && <Zap className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </div>
        </nav>
        <div className="p-4 border-t border-[#E8E4E0]">
          <button onClick={() => setView('landing')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#5a4a3f] hover:bg-[#F5F3F1] transition-all">
            <LogOut className="w-5 h-5" /> Exit to Main Site
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-[#E8E4E0] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-serif font-semibold text-[#3D2D22] flex items-center gap-3">
                <Users className="w-6 h-6 text-[#E07F26]" /> All Leads
              </h1>
              <p className="text-[#7a6a5f] text-sm mt-1">Manage and track all your leads</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExport}
                className="px-4 py-2.5 rounded-lg border border-[#E8E4E0] text-[#3D2D22] font-medium text-sm flex items-center gap-2 hover:border-[#E07F26] hover:bg-[#E07F26]/5 transition-all"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-lg bg-[#E07F26] text-white font-semibold text-sm flex items-center gap-2 hover:bg-[#c96e1f] transition-all"
              >
                <Upload className="w-4 h-4" /> Import CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-[#F9F7F5] border border-[#E8E4E0]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-serif font-bold text-[#3D2D22]">{stat.value}</div>
                    <div className="text-xs text-[#7a6a5f]">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </header>

        <div className="p-6 border-b border-[#E8E4E0] bg-white">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a6a5f]" />
              <input type="text" placeholder="Search leads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22] placeholder:text-[#9a8a7f] focus:outline-none focus:border-[#E07F26] text-sm" />
            </div>
            <div className="flex gap-2">
              {(['all', 'ready-to-call', 'hot', 'warm', 'cold'] as const).map((score) => (
                <button key={score} onClick={() => setFilterScore(score)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${filterScore === score ? 'bg-[#E07F26] text-white' : 'bg-[#F5F3F1] text-[#5a4a3f] hover:bg-[#E8E4E0]'}`}>
                  {score === 'all' ? 'All' : score.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 rounded-lg bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22] text-sm focus:outline-none">
              <option value="score">Sort by Score</option>
              <option value="recent">Sort by Recent</option>
              <option value="budget">Sort by Budget</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-xl border border-[#E8E4E0] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9F7F5]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider">Lead</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider">Score</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider">Persona</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider">Budget</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider">Last Active</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4E0]">
                {sortedBuyers.map((buyer) => (
                  <motion.tr key={buyer.id} className="hover:bg-[#F9F7F5] transition-colors" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E07F26]/10 flex items-center justify-center text-[#E07F26] font-semibold">{buyer.firstName.charAt(0)}</div>
                        <div>
                          <div className="font-medium text-[#3D2D22]">{buyer.firstName} {buyer.lastName}</div>
                          <div className="text-xs text-[#7a6a5f]">{buyer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><LeadScoreBadge score={buyer.leadScore} /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#7a6a5f]" />
                        <span className="text-[#3D2D22] text-sm">{buyer.persona?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4"><span className="text-[#3D2D22] text-sm font-medium">{buyer.budgetBand.replace('-', ' - ').toUpperCase()}</span></td>
                    <td className="px-4 py-4"><span className="text-[#7a6a5f] text-sm">{buyer.source}</span></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#7a6a5f]" /><span className="text-[#7a6a5f] text-sm">{getTimeAgo(buyer.lastActiveAt)}</span></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setShowDetailModal(buyer)}
                          className="p-2 rounded-lg bg-[#F5F3F1] hover:bg-[#E07F26]/10 hover:text-[#E07F26] transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleCall(buyer.phone)}
                          className="p-2 rounded-lg bg-[#F5F3F1] hover:bg-green-100 hover:text-green-600 transition-colors"
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEmail(buyer.email, buyer.firstName)}
                          className="p-2 rounded-lg bg-[#F5F3F1] hover:bg-blue-100 hover:text-blue-600 transition-colors"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleWhatsApp(buyer.phone, buyer.firstName)}
                          className="p-2 rounded-lg bg-[#F5F3F1] hover:bg-green-100 hover:text-green-600 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#E8E4E0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-6 h-6 text-[#E07F26]" />
                  <h2 className="text-xl font-serif font-bold text-[#3D2D22]">Import Leads</h2>
                </div>
                <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-[#F5F3F1] rounded-lg">
                  <X className="w-5 h-5 text-[#7a6a5f]" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4 p-4 bg-[#F9F7F5] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#3D2D22]">Found {importedLeads.length} rows</span>
                    <span className="text-sm text-green-600">{importedLeads.filter(l => l.valid).length} valid</span>
                  </div>
                  <div className="text-xs text-[#7a6a5f]">
                    Leads with invalid emails will be skipped
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto border border-[#E8E4E0] rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F9F7F5] sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-[#7a6a5f]">Name</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-[#7a6a5f]">Email</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-[#7a6a5f]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E4E0]">
                      {importedLeads.slice(0, 10).map((lead, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2">{lead.firstName} {lead.lastName}</td>
                          <td className="px-3 py-2 text-[#7a6a5f]">{lead.email}</td>
                          <td className="px-3 py-2">
                            {lead.valid ? (
                              <span className="text-green-600 flex items-center gap-1"><Check className="w-4 h-4" /> Valid</span>
                            ) : (
                              <span className="text-red-600 flex items-center gap-1"><X className="w-4 h-4" /> Invalid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importedLeads.length > 10 && (
                    <div className="p-2 text-center text-xs text-[#7a6a5f] bg-[#F9F7F5]">
                      And {importedLeads.length - 10} more...
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-[#E8E4E0] flex justify-end gap-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#E8E4E0] text-[#3D2D22] font-medium hover:bg-[#F5F3F1]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmImport}
                  className="px-6 py-2.5 rounded-lg bg-[#E07F26] text-white font-semibold hover:bg-[#c96e1f]"
                >
                  Import {importedLeads.filter(l => l.valid).length} Leads
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-end bg-black/50"
            onClick={() => setShowDetailModal(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-[500px] h-full bg-white overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-[#E8E4E0] p-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#E07F26]/10 flex items-center justify-center text-[#E07F26] text-xl font-semibold">
                    {showDetailModal.firstName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-semibold text-[#3D2D22]">
                      {showDetailModal.firstName} {showDetailModal.lastName}
                    </h2>
                    <div className="text-sm text-[#7a6a5f]">{showDetailModal.email}</div>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(null)} className="p-2 hover:bg-[#F5F3F1] rounded-lg">
                  <X className="w-5 h-5 text-[#7a6a5f]" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleCall(showDetailModal.phone)}
                    className="p-4 rounded-xl border border-[#E8E4E0] hover:border-[#E07F26] hover:bg-[#E07F26]/5 transition-all text-center"
                  >
                    <Phone className="w-6 h-6 text-[#E07F26] mx-auto mb-2" />
                    <div className="text-sm font-medium text-[#3D2D22]">Call</div>
                  </button>
                  <button 
                    onClick={() => handleEmail(showDetailModal.email, showDetailModal.firstName)}
                    className="p-4 rounded-xl border border-[#E8E4E0] hover:border-[#E07F26] hover:bg-[#E07F26]/5 transition-all text-center"
                  >
                    <Mail className="w-6 h-6 text-[#E07F26] mx-auto mb-2" />
                    <div className="text-sm font-medium text-[#3D2D22]">Email</div>
                  </button>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider">Profile Details</h3>
                  {[
                    ['Phone', showDetailModal.phone || 'Not provided'],
                    ['Country', showDetailModal.country],
                    ['Lead Score', showDetailModal.leadScore],
                    ['Persona', showDetailModal.persona || 'Unknown'],
                    ['Budget', showDetailModal.budgetBand],
                    ['Goal', showDetailModal.goal],
                    ['Source', showDetailModal.source],
                    ['Created', showDetailModal.createdAt.toLocaleDateString()],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-[#F5F3F1]">
                      <span className="text-[#7a6a5f] text-sm">{label}</span>
                      <span className="text-[#3D2D22] font-medium text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
