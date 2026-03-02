-- Supabase SQL Migrations for Dairy Automation System
-- Run these SQL statements in the Supabase SQL Editor to create all required tables

-- ============================================
-- Create Customers Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.customers (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255),
  phone_number VARCHAR(20),
  building_name VARCHAR(255),
  wing VARCHAR(50),
  room_no VARCHAR(50),
  default_milk_quantity_liters NUMERIC(10, 2) DEFAULT 1.0,
  default_extra_product VARCHAR(255) DEFAULT 'None',
  default_extra_product_quantity NUMERIC(10, 2) DEFAULT 0,
  billing_cycle VARCHAR(50) DEFAULT 'Monthly',
  date_joined TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_building ON public.customers(building_name);

-- ============================================
-- Create Agents Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.agents (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  agent_name VARCHAR(255),
  phone_number VARCHAR(20),
  building VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_email ON public.agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_building ON public.agents(building);

-- ============================================
-- Enable Row Level Security (Optional but Recommended)
-- ============================================
-- ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Grant Permissions (If using service role)
-- ============================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.agents TO authenticated;

-- ============================================
-- Sample Insert (For Testing)
-- ============================================
-- Note: In production, use bcrypt hashed passwords
-- INSERT INTO public.customers (email, password, customer_name, phone_number, building_name, wing, room_no, billing_cycle)
-- VALUES 
--   ('customer1@example.com', '$2a$10$...', 'John Doe', '1234567890', 'Building A', 'Wing A', '101', 'Monthly'),
--   ('customer2@example.com', '$2a$10$...', 'Jane Smith', '0987654321', 'Building B', 'Wing B', '202', 'Monthly');

-- INSERT INTO public.agents (email, password, agent_name, phone_number, building)
-- VALUES 
--   ('agent1@example.com', '$2a$10$...', 'Agent One', '1111111111', 'Building A'),
--   ('agent2@example.com', '$2a$10$...', 'Agent Two', '2222222222', 'Building B');
-- ============================================
-- Create Deliveries Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.deliveries (
  id BIGSERIAL PRIMARY KEY,
  agent_id BIGINT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  customer_id BIGINT REFERENCES public.customers(id) ON DELETE SET NULL,
  dairy_farm_id VARCHAR(255),
  dairy_farm_name VARCHAR(255),
  customer_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  address TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'IN_TRANSIT')),
  delivery_date DATE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_reason VARCHAR(50) CHECK (failed_reason IN ('CUSTOMER_UNAVAILABLE', 'PAYMENT_ISSUE', 'WRONG_ADDRESS', 'OTHER')),
  failed_reason_details TEXT,
  proof_type VARCHAR(50) CHECK (proof_type IN ('PHOTO', 'OTP', 'NONE')),
  proof_photo_url TEXT,
  proof_otp VARCHAR(10),
  otp_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deliveries_agent_id ON public.deliveries(agent_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_customer_id ON public.deliveries(customer_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_date ON public.deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);

-- ============================================
-- Create Delivery Proofs Table (Optional - for tracking proof submissions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.delivery_proofs (
  id BIGSERIAL PRIMARY KEY,
  delivery_id BIGINT NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  proof_type VARCHAR(50) NOT NULL CHECK (proof_type IN ('PHOTO', 'OTP')),
  photo_url TEXT,
  otp_code VARCHAR(10),
  otp_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_proofs_delivery_id ON public.delivery_proofs(delivery_id);

-- ============================================
-- Create Agent Performance Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.agent_performance (
  id BIGSERIAL PRIMARY KEY,
  agent_id BIGINT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  performance_date DATE NOT NULL,
  total_assigned BIGINT DEFAULT 0,
  completed BIGINT DEFAULT 0,
  failed BIGINT DEFAULT 0,
  pending BIGINT DEFAULT 0,
  completion_rate NUMERIC(5, 2) DEFAULT 0,
  efficiency_percentage NUMERIC(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(agent_id, performance_date)
);

CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_id ON public.agent_performance(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_date ON public.agent_performance(performance_date);

-- ============================================
-- Create Agent Earnings Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.agent_earnings (
  id BIGSERIAL PRIMARY KEY,
  agent_id BIGINT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  earning_date DATE NOT NULL,
  deliveries_completed BIGINT DEFAULT 0,
  earning_per_delivery NUMERIC(10, 2) DEFAULT 50.00,
  total_earnings NUMERIC(10, 2) DEFAULT 0,
  bonus_amount NUMERIC(10, 2) DEFAULT 0,
  deductions NUMERIC(10, 2) DEFAULT 0,
  net_earnings NUMERIC(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(agent_id, earning_date)
);

CREATE INDEX IF NOT EXISTS idx_agent_earnings_agent_id ON public.agent_earnings(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_earnings_date ON public.agent_earnings(earning_date);