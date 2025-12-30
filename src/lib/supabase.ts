import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DBBuyer {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  country: string;
  language: string;
  currency: string;
  persona: string | null;
  goal: string | null;
  budget_band: string | null;
  urgency_score: number;
  lead_score: number;
  lead_category: string;
  onboarding_completed_at: string | null;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBConversation {
  id: string;
  buyer_id: string;
  channel: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DBMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  intent_signals: string[];
  created_at: string;
}

export interface DBROISimulation {
  id: string;
  buyer_id: string;
  budget: number;
  currency: string;
  property_type: string;
  area_cluster: string;
  time_horizon: number;
  results: Record<string, any>;
  created_at: string;
}

export interface DBDeal {
  id: string;
  buyer_id: string;
  agent_id: string | null;
  stage: string;
  value: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Helper functions for database operations
export const db = {
  // Buyers
  async createBuyer(buyer: Partial<DBBuyer>) {
    const { data, error } = await supabase
      .from('buyers')
      .insert(buyer)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getBuyer(id: string) {
    const { data, error } = await supabase
      .from('buyers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getBuyerByEmail(email: string) {
    const { data, error } = await supabase
      .from('buyers')
      .select('*')
      .eq('email', email)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateBuyer(id: string, updates: Partial<DBBuyer>) {
    const { data, error } = await supabase
      .from('buyers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getAllBuyers() {
    const { data, error } = await supabase
      .from('buyers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Conversations
  async createConversation(buyerId: string, channel = 'chat') {
    const { data, error } = await supabase
      .from('conversations')
      .insert({ buyer_id: buyerId, channel })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getConversations(buyerId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, messages(*)')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Messages
  async addMessage(conversationId: string, role: string, content: string, intentSignals: string[] = []) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        intent_signals: intentSignals,
      })
      .select()
      .single();
    if (error) throw error;
    
    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    return data;
  },

  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  // ROI Simulations
  async saveSimulation(simulation: Partial<DBROISimulation>) {
    const { data, error } = await supabase
      .from('roi_simulations')
      .insert(simulation)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getSimulations(buyerId: string) {
    const { data, error } = await supabase
      .from('roi_simulations')
      .select('*')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Deals
  async createDeal(deal: Partial<DBDeal>) {
    const { data, error } = await supabase
      .from('deals')
      .insert(deal)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateDeal(id: string, updates: Partial<DBDeal>) {
    const { data, error } = await supabase
      .from('deals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getAllDeals() {
    const { data, error } = await supabase
      .from('deals')
      .select('*, buyers(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
};

export default supabase;

