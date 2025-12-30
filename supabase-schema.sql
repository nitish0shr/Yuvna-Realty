-- Yuvna Realty Database Schema for Supabase
-- Run this in the Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== BUYERS TABLE ====================
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  country VARCHAR(100) NOT NULL DEFAULT 'Unknown',
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  persona VARCHAR(50), -- yield-investor, capital-investor, lifestyle, visa-driven, explorer
  goal VARCHAR(50), -- investment, lifestyle, visa, second-home
  budget_band VARCHAR(50), -- under-500k, 500k-1m, 1m-2m, 2m-5m, 5m-plus
  urgency_score INTEGER DEFAULT 0,
  lead_score INTEGER DEFAULT 0,
  lead_category VARCHAR(20) DEFAULT 'cold', -- cold, warm, hot, ready-to-call
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  last_active_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== CONVERSATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL DEFAULT 'chat', -- chat, whatsapp, email
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, closed, escalated
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== MESSAGES TABLE ====================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- buyer, advisor, agent
  content TEXT NOT NULL,
  intent_signals TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== ROI SIMULATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS roi_simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  budget DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  property_type VARCHAR(20) NOT NULL,
  area_cluster VARCHAR(30) NOT NULL,
  time_horizon INTEGER NOT NULL DEFAULT 5,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== DEALS TABLE ====================
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  agent_id UUID,
  stage VARCHAR(30) NOT NULL DEFAULT 'new', -- new, contacted, qualified, viewing, negotiation, closed-won, closed-lost
  value DECIMAL(15, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== AGENTS TABLE ====================
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'agent', -- agent, admin
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_buyers_email ON buyers(email);
CREATE INDEX IF NOT EXISTS idx_buyers_lead_category ON buyers(lead_category);
CREATE INDEX IF NOT EXISTS idx_buyers_created_at ON buyers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_roi_simulations_buyer_id ON roi_simulations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_deals_buyer_id ON deals(buyer_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);

-- ==================== ROW LEVEL SECURITY ====================
-- Enable RLS on all tables
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Buyers can read/update their own data
CREATE POLICY "Buyers can view own profile" ON buyers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Buyers can update own profile" ON buyers
  FOR UPDATE USING (auth.uid() = id);

-- Buyers can read their own conversations
CREATE POLICY "Buyers can view own conversations" ON conversations
  FOR SELECT USING (buyer_id = auth.uid());

CREATE POLICY "Buyers can create conversations" ON conversations
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Buyers can read/create messages in their conversations
CREATE POLICY "Buyers can view own messages" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE buyer_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can create messages" ON messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE buyer_id = auth.uid()
    )
  );

-- Buyers can read/create their own simulations
CREATE POLICY "Buyers can view own simulations" ON roi_simulations
  FOR SELECT USING (buyer_id = auth.uid());

CREATE POLICY "Buyers can create simulations" ON roi_simulations
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Service role can do everything (for backend operations)
-- These policies allow the service role key to bypass RLS
CREATE POLICY "Service role full access buyers" ON buyers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access conversations" ON conversations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access messages" ON messages
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access simulations" ON roi_simulations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access deals" ON deals
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access agents" ON agents
  FOR ALL USING (auth.role() = 'service_role');

-- ==================== FUNCTIONS ====================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_buyers_updated_at
  BEFORE UPDATE ON buyers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== SAMPLE DATA (Optional) ====================
-- Uncomment to add sample data for testing

/*
INSERT INTO agents (name, email, role) VALUES
  ('John Smith', 'john@yuvnarealty.com', 'admin'),
  ('Sarah Johnson', 'sarah@yuvnarealty.com', 'agent');

INSERT INTO buyers (first_name, last_name, email, country, persona, goal, budget_band, lead_category) VALUES
  ('Demo', 'User', 'demo@example.com', 'United States', 'yield-investor', 'investment', '500k-1m', 'warm');
*/

