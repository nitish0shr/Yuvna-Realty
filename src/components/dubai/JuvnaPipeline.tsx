import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealEstateStore } from '../../store/realEstateStore';
import type { DealStage } from '../../types/realEstate';
import {
  Kanban,
  Plus,
  MoreVertical,
  Clock,
  AlertTriangle,
  TrendingUp,
  Phone,
  Calendar,
  CheckCircle,
  X,
  Building2,
  Inbox,
  Users,
  BarChart3,
  LogOut,
  Send,
  Zap,
  Mail,
  GripVertical,
  Check,
  ArrowRight
} from 'lucide-react';

import { YuvnaLogoAgent } from './YuvnaLogo';

interface MockDeal {
  id: string;
  buyerName: string;
  buyerInitial: string;
  buyerEmail: string;
  buyerPhone?: string;
  country: string;
  budget: number;
  stage: DealStage;
  daysInStage: number;
  dropOffRisk: 'low' | 'medium' | 'high';
  persona: string;
  suggestedAction: string;
}

const initialDeals: MockDeal[] = [
  { id: '1', buyerName: 'Ahmed Al-Rashid', buyerInitial: 'A', buyerEmail: 'ahmed@email.com', buyerPhone: '+971501234567', country: 'UAE', budget: 1500000, stage: 'qualified', daysInStage: 3, dropOffRisk: 'low', persona: 'yield-investor', suggestedAction: 'Schedule property viewing' },
  { id: '2', buyerName: 'Sarah Thompson', buyerInitial: 'S', buyerEmail: 'sarah.t@email.com', buyerPhone: '+447891234567', country: 'UK', budget: 2500000, stage: 'advisory', daysInStage: 5, dropOffRisk: 'medium', persona: 'visa-driven', suggestedAction: 'Follow up on Golden Visa requirements' },
  { id: '3', buyerName: 'Raj Patel', buyerInitial: 'R', buyerEmail: 'raj.patel@email.com', country: 'India', budget: 800000, stage: 'site-visit', daysInStage: 2, dropOffRisk: 'low', persona: 'capital-investor', suggestedAction: 'Prepare offer package' },
  { id: '4', buyerName: 'Maria Garcia', buyerInitial: 'M', buyerEmail: 'maria.g@email.com', country: 'Spain', budget: 3000000, stage: 'new', daysInStage: 1, dropOffRisk: 'high', persona: 'lifestyle', suggestedAction: 'Initial outreach call' },
  { id: '5', buyerName: 'James Wilson', buyerInitial: 'J', buyerEmail: 'james.w@email.com', buyerPhone: '+14155551234', country: 'US', budget: 1800000, stage: 'booking', daysInStage: 1, dropOffRisk: 'low', persona: 'yield-investor', suggestedAction: 'Confirm deposit transfer' },
];

const stages: { id: DealStage; label: string; color: string }[] = [
  { id: 'new', label: 'New', color: 'bg-slate-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-blue-500' },
  { id: 'advisory', label: 'Advisory', color: 'bg-purple-500' },
  { id: 'site-visit', label: 'Site Visit', color: 'bg-[#E07F26]' },
  { id: 'booking', label: 'Booking', color: 'bg-green-500' },
  { id: 'closed-won', label: 'Closed Won', color: 'bg-green-600' },
];

export function JuvnaPipeline() {
  const { setView } = useRealEstateStore();
  const [deals, setDeals] = useState(initialDeals);
  const [selectedDeal, setSelectedDeal] = useState<MockDeal | null>(null);
  const [draggedDeal, setDraggedDeal] = useState<MockDeal | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const formatMoney = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const getTotalValue = (stage: DealStage): number => {
    return deals.filter(d => d.stage === stage).reduce((sum, d) => sum + d.budget, 0);
  };

  // Drag and Drop handlers
  const handleDragStart = (deal: MockDeal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetStage: DealStage) => {
    if (draggedDeal && draggedDeal.stage !== targetStage) {
      setDeals(prev => prev.map(d => 
        d.id === draggedDeal.id 
          ? { ...d, stage: targetStage, daysInStage: 0 }
          : d
      ));
      showNotificationMessage(`Moved ${draggedDeal.buyerName} to ${stages.find(s => s.id === targetStage)?.label}`);
    }
    setDraggedDeal(null);
  };

  // Action handlers
  const handleCall = (phone?: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
      showNotificationMessage(`Calling ${phone}...`);
    } else {
      showNotificationMessage('No phone number available');
    }
  };

  const handleEmail = (email: string, name: string) => {
    const subject = encodeURIComponent(`Follow up - Yuvna Realty`);
    const body = encodeURIComponent(`Hi ${name},\n\nI wanted to follow up on your Dubai property investment journey.\n\nBest regards,\nYuvna Realty`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    showNotificationMessage(`Opening email to ${name}`);
  };

  const handleSchedule = (name: string, email: string) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(10, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(11, 0, 0, 0);
    
    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Call with ${name} - Yuvna Realty`)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(`Property consultation with ${name}\nEmail: ${email}`)}&sf=true`;
    
    window.open(calendarUrl, '_blank');
    showNotificationMessage(`Opening calendar for ${name}`);
  };

  const handleTakeAction = (deal: MockDeal) => {
    // Determine best action based on stage
    switch (deal.stage) {
      case 'new':
        handleCall(deal.buyerPhone);
        break;
      case 'qualified':
      case 'advisory':
        handleSchedule(deal.buyerName, deal.buyerEmail);
        break;
      case 'site-visit':
      case 'booking':
        handleEmail(deal.buyerEmail, deal.buyerName);
        break;
      default:
        handleEmail(deal.buyerEmail, deal.buyerName);
    }
  };

  const moveDealToNextStage = (deal: MockDeal) => {
    const currentIndex = stages.findIndex(s => s.id === deal.stage);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1].id;
      setDeals(prev => prev.map(d => 
        d.id === deal.id 
          ? { ...d, stage: nextStage, daysInStage: 0 }
          : d
      ));
      showNotificationMessage(`Moved ${deal.buyerName} to ${stages[currentIndex + 1].label}`);
      setSelectedDeal(null);
    }
  };

  const showNotificationMessage = (message: string) => {
    setNotification(message);
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
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <Check className="w-5 h-5" />
              {notification}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E8E4E0] flex flex-col">
        <div className="p-6 border-b border-[#E8E4E0]">
          <YuvnaLogoAgent />
        </div>
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'inbox') setView('agent-inbox');
                  if (item.id === 'leads') setView('agent-leads');
                  if (item.id === 'outreach') setView('agent-outreach');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  item.id === 'pipeline' 
                    ? 'bg-[#E07F26]/10 text-[#E07F26]' 
                    : (item as any).highlight
                      ? 'bg-[#E07F26] text-white hover:bg-[#c96e1f]'
                      : 'text-[#5a4a3f] hover:bg-[#F5F3F1]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold text-[#3D2D22] flex items-center gap-3">
                <Kanban className="w-6 h-6 text-[#E07F26]" />
                Deal Pipeline
              </h1>
              <p className="text-[#7a6a5f] text-sm mt-1">
                {deals.length} active deals · {formatMoney(deals.reduce((sum, d) => sum + d.budget, 0))} total value
                <span className="ml-2 text-[#E07F26]">• Drag cards to move between stages</span>
              </p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-lg bg-[#E07F26] text-white font-semibold text-sm flex items-center gap-2 hover:bg-[#c96e1f] transition-all"
            >
              <Plus className="w-5 h-5" /> New Deal
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 h-full min-w-max">
            {stages.map((stage) => {
              const stageDeals = deals.filter(d => d.stage === stage.id);
              const stageValue = getTotalValue(stage.id);
              
              return (
                <div 
                  key={stage.id} 
                  className={`w-80 flex flex-col bg-white rounded-xl border border-[#E8E4E0] ${
                    draggedDeal ? 'border-dashed border-2 border-[#E07F26]/50' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(stage.id)}
                >
                  <div className="p-4 border-b border-[#E8E4E0]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                        <span className="font-semibold text-[#3D2D22]">{stage.label}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#F5F3F1] text-[#7a6a5f] text-xs">{stageDeals.length}</span>
                      </div>
                      <button className="p-1 hover:bg-[#F5F3F1] rounded-lg"><MoreVertical className="w-4 h-4 text-[#7a6a5f]" /></button>
                    </div>
                    <div className="text-sm text-[#7a6a5f]">{formatMoney(stageValue)} total</div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {stageDeals.map((deal) => (
                      <motion.div
                        key={deal.id}
                        draggable
                        onDragStart={() => handleDragStart(deal)}
                        onClick={() => setSelectedDeal(deal)}
                        className={`p-4 rounded-xl bg-[#F9F7F5] border border-[#E8E4E0] cursor-grab hover:border-[#E07F26]/50 hover:shadow-md transition-all ${
                          draggedDeal?.id === deal.id ? 'opacity-50' : ''
                        }`}
                        whileHover={{ scale: 1.02 }}
                        layout
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <GripVertical className="w-4 h-4 text-[#9a8a7f]" />
                          <div className="w-8 h-8 rounded-full bg-[#E07F26]/10 flex items-center justify-center text-[#E07F26] font-semibold text-sm">
                            {deal.buyerInitial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[#3D2D22] text-sm truncate">{deal.buyerName}</div>
                            <div className="text-xs text-[#7a6a5f]">{deal.country}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-serif font-semibold text-[#3D2D22]">{formatMoney(deal.budget)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            deal.dropOffRisk === 'high' ? 'bg-red-100 text-red-700' :
                            deal.dropOffRisk === 'medium' ? 'bg-[#E07F26]/10 text-[#E07F26]' : 'bg-green-100 text-green-700'
                          }`}>
                            {deal.dropOffRisk === 'high' ? 'At Risk' : deal.dropOffRisk === 'medium' ? 'Monitor' : 'On Track'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#7a6a5f]">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{deal.daysInStage}d in stage</span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-[#E8E4E0]">
                          <div className="flex items-center gap-2 text-xs text-[#E07F26]">
                            <Building2 className="w-3.5 h-3.5" />
                            {deal.suggestedAction}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {stageDeals.length === 0 && (
                      <div className={`flex flex-col items-center justify-center py-8 text-center ${
                        draggedDeal ? 'bg-[#E07F26]/5 border-2 border-dashed border-[#E07F26]/30 rounded-xl' : ''
                      }`}>
                        <div className="w-12 h-12 rounded-xl bg-[#F5F3F1] flex items-center justify-center mb-3">
                          <Building2 className="w-6 h-6 text-[#E8E4E0]" />
                        </div>
                        <p className="text-[#9a8a7f] text-sm">
                          {draggedDeal ? 'Drop here' : 'No deals in this stage'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deal Detail Modal */}
      <AnimatePresence>
        {selectedDeal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-end bg-black/50" onClick={() => setSelectedDeal(null)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-[500px] h-full bg-white overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-[#E8E4E0] p-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#E07F26]/10 flex items-center justify-center text-[#E07F26] text-xl font-semibold">
                    {selectedDeal.buyerInitial}
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-semibold text-[#3D2D22]">{selectedDeal.buyerName}</h2>
                    <div className="text-sm text-[#7a6a5f]">{selectedDeal.buyerEmail}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedDeal(null)} className="p-2 hover:bg-[#F5F3F1] rounded-lg"><X className="w-5 h-5 text-[#7a6a5f]" /></button>
              </div>

              <div className="p-6 space-y-6">
                <div className="p-4 rounded-xl bg-[#E07F26]/5 border border-[#E07F26]/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-[#7a6a5f] mb-1">Deal Value</div>
                      <div className="text-3xl font-serif font-bold text-[#3D2D22]">{formatMoney(selectedDeal.budget)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#7a6a5f] mb-1">Stage</div>
                      <div className="text-lg font-semibold text-[#E07F26]">{stages.find(s => s.id === selectedDeal.stage)?.label}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => handleCall(selectedDeal.buyerPhone)}
                    className="p-4 rounded-xl border border-[#E8E4E0] hover:border-[#E07F26] hover:bg-[#E07F26]/5 transition-all text-center"
                  >
                    <Phone className="w-5 h-5 text-[#E07F26] mx-auto mb-2" />
                    <div className="text-sm font-medium text-[#3D2D22]">Call</div>
                  </button>
                  <button 
                    onClick={() => handleEmail(selectedDeal.buyerEmail, selectedDeal.buyerName)}
                    className="p-4 rounded-xl border border-[#E8E4E0] hover:border-[#E07F26] hover:bg-[#E07F26]/5 transition-all text-center"
                  >
                    <Mail className="w-5 h-5 text-[#E07F26] mx-auto mb-2" />
                    <div className="text-sm font-medium text-[#3D2D22]">Email</div>
                  </button>
                  <button 
                    onClick={() => handleSchedule(selectedDeal.buyerName, selectedDeal.buyerEmail)}
                    className="p-4 rounded-xl border border-[#E8E4E0] hover:border-[#E07F26] hover:bg-[#E07F26]/5 transition-all text-center"
                  >
                    <Calendar className="w-5 h-5 text-[#E07F26] mx-auto mb-2" />
                    <div className="text-sm font-medium text-[#3D2D22]">Schedule</div>
                  </button>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider mb-3">AI Suggestion</h3>
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">{selectedDeal.suggestedAction}</span>
                    </div>
                    <button 
                      onClick={() => handleTakeAction(selectedDeal)}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors mt-2"
                    >
                      Take Action
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider mb-3">Move to Next Stage</h3>
                  <button
                    onClick={() => moveDealToNextStage(selectedDeal)}
                    disabled={selectedDeal.stage === 'closed-won'}
                    className="w-full py-3 rounded-xl border-2 border-[#E07F26] text-[#E07F26] font-semibold flex items-center justify-center gap-2 hover:bg-[#E07F26] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Move to {stages[stages.findIndex(s => s.id === selectedDeal.stage) + 1]?.label || 'Next Stage'}
                  </button>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider mb-3">Risk Assessment</h3>
                  <div className={`p-4 rounded-xl ${
                    selectedDeal.dropOffRisk === 'high' ? 'bg-red-50 border border-red-200' :
                    selectedDeal.dropOffRisk === 'medium' ? 'bg-[#E07F26]/5 border border-[#E07F26]/20' : 'bg-green-50 border border-green-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {selectedDeal.dropOffRisk === 'high' ? <AlertTriangle className="w-5 h-5 text-red-600" /> : 
                       selectedDeal.dropOffRisk === 'medium' ? <AlertTriangle className="w-5 h-5 text-[#E07F26]" /> :
                       <TrendingUp className="w-5 h-5 text-green-600" />}
                      <span className={`font-semibold ${
                        selectedDeal.dropOffRisk === 'high' ? 'text-red-700' :
                        selectedDeal.dropOffRisk === 'medium' ? 'text-[#E07F26]' : 'text-green-700'
                      }`}>
                        {selectedDeal.dropOffRisk === 'high' ? 'High Risk' : selectedDeal.dropOffRisk === 'medium' ? 'Medium Risk' : 'Low Risk'}
                      </span>
                    </div>
                    <p className="text-sm text-[#5a4a3f]">
                      {selectedDeal.dropOffRisk === 'high' ? 'This deal needs immediate attention.' :
                       selectedDeal.dropOffRisk === 'medium' ? 'Monitor closely for engagement.' : 'Deal is progressing well.'}
                    </p>
                  </div>
                </div>

                {/* Deal Details */}
                <div>
                  <h3 className="text-xs font-semibold text-[#7a6a5f] uppercase tracking-wider mb-3">Details</h3>
                  <div className="space-y-2">
                    {[
                      ['Country', selectedDeal.country],
                      ['Persona', selectedDeal.persona.replace('-', ' ')],
                      ['Days in Stage', `${selectedDeal.daysInStage} days`],
                      ['Phone', selectedDeal.buyerPhone || 'Not provided'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between py-2 border-b border-[#F5F3F1]">
                        <span className="text-[#7a6a5f] text-sm">{label}</span>
                        <span className="text-[#3D2D22] font-medium text-sm">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Deal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-serif font-bold text-[#3D2D22] mb-6">Add New Deal</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const newDeal: MockDeal = {
                  id: `new-${Date.now()}`,
                  buyerName: formData.get('name') as string,
                  buyerInitial: (formData.get('name') as string).charAt(0),
                  buyerEmail: formData.get('email') as string,
                  buyerPhone: formData.get('phone') as string || undefined,
                  country: formData.get('country') as string,
                  budget: Number(formData.get('budget')),
                  stage: 'new',
                  daysInStage: 0,
                  dropOffRisk: 'medium',
                  persona: 'explorer',
                  suggestedAction: 'Initial outreach call',
                };
                setDeals(prev => [newDeal, ...prev]);
                setShowAddModal(false);
                showNotificationMessage(`Added ${newDeal.buyerName} to pipeline`);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#7a6a5f] mb-1">Full Name *</label>
                    <input name="name" required className="w-full px-4 py-2.5 rounded-lg bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22]" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#7a6a5f] mb-1">Email *</label>
                    <input name="email" type="email" required className="w-full px-4 py-2.5 rounded-lg bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22]" />
                  </div>
                  <div>
                    <label className="block text-sm text-[#7a6a5f] mb-1">Phone</label>
                    <input name="phone" className="w-full px-4 py-2.5 rounded-lg bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#7a6a5f] mb-1">Country *</label>
                      <input name="country" required className="w-full px-4 py-2.5 rounded-lg bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22]" />
                    </div>
                    <div>
                      <label className="block text-sm text-[#7a6a5f] mb-1">Budget (USD) *</label>
                      <input name="budget" type="number" required className="w-full px-4 py-2.5 rounded-lg bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22]" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-lg border border-[#E8E4E0] text-[#3D2D22] font-medium">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-lg bg-[#E07F26] text-white font-semibold">
                    Add Deal
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
