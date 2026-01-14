-- SqueegeeRun Initial Database Schema
-- Multi-tenant CRM for window cleaning businesses

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to automatically update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================================
-- TABLES
-- =============================================================================

-- 1. Organizations (multi-tenant support)
CREATE TABLE organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE,
    owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    settings jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    full_name text,
    role text NOT NULL DEFAULT 'owner',
    phone text,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Customers
CREATE TABLE customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    tags text[],
    notes text,
    status text DEFAULT 'active',
    source text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. Service Addresses (customers can have multiple properties)
CREATE TABLE service_addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    label text,
    street_address text NOT NULL,
    unit text,
    city text NOT NULL,
    state text NOT NULL,
    postal_code text NOT NULL,
    country text DEFAULT 'US',
    latitude decimal(10,8),
    longitude decimal(11,8),
    access_notes text,
    property_type text DEFAULT 'residential',
    window_count integer,
    is_primary boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. Recurring Schedules (the engine - powers repeat business)
CREATE TABLE recurring_schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    service_address_id uuid REFERENCES service_addresses(id) ON DELETE CASCADE NOT NULL,
    frequency text NOT NULL,
    preferred_day integer,
    preferred_time_start time,
    preferred_time_end time,
    service_types text[],
    estimated_duration_minutes integer,
    price_cents integer NOT NULL,
    notes text,
    is_active boolean DEFAULT true,
    next_service_date date,
    last_service_date date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 6. Jobs (individual service appointments)
CREATE TABLE jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    service_address_id uuid REFERENCES service_addresses(id) ON DELETE CASCADE NOT NULL,
    recurring_schedule_id uuid REFERENCES recurring_schedules(id) ON DELETE SET NULL,
    assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
    status text DEFAULT 'scheduled',
    scheduled_date date NOT NULL,
    scheduled_time_start time,
    scheduled_time_end time,
    actual_start_time timestamptz,
    actual_end_time timestamptz,
    price_cents integer,
    notes text,
    completion_notes text,
    weather_conditions text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 7. Job Line Items (itemized services per job)
CREATE TABLE job_line_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
    description text NOT NULL,
    quantity decimal(10,2) DEFAULT 1,
    unit_price_cents integer NOT NULL,
    total_cents integer NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 8. Job Status History (audit trail)
CREATE TABLE job_status_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
    previous_status text,
    new_status text NOT NULL,
    changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 9. Invoices
CREATE TABLE invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    invoice_number text NOT NULL UNIQUE,
    status text DEFAULT 'draft',
    subtotal_cents integer NOT NULL DEFAULT 0,
    tax_rate decimal(5,4) DEFAULT 0,
    tax_cents integer NOT NULL DEFAULT 0,
    total_cents integer NOT NULL DEFAULT 0,
    amount_paid_cents integer DEFAULT 0,
    issued_date date,
    due_date date,
    paid_date date,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 10. Invoice Line Items
CREATE TABLE invoice_line_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
    description text NOT NULL,
    quantity decimal(10,2) DEFAULT 1,
    unit_price_cents integer NOT NULL,
    total_cents integer NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 11. Payments
CREATE TABLE payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    amount_cents integer NOT NULL,
    payment_method text,
    payment_reference text,
    payment_date date NOT NULL,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 12. Communication Log (track all customer interactions)
CREATE TABLE communication_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    customer_id uuid REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
    type text NOT NULL,
    direction text,
    subject text,
    content text,
    logged_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Customer indexes
CREATE INDEX idx_customers_organization_status ON customers(organization_id, status);

-- Service address indexes
CREATE INDEX idx_service_addresses_organization ON service_addresses(organization_id);
CREATE INDEX idx_service_addresses_customer ON service_addresses(customer_id);

-- Recurring schedule indexes
CREATE INDEX idx_recurring_schedules_organization_active ON recurring_schedules(organization_id, is_active);
CREATE INDEX idx_recurring_schedules_next_service ON recurring_schedules(next_service_date);

-- Job indexes
CREATE INDEX idx_jobs_organization_scheduled_date ON jobs(organization_id, scheduled_date);
CREATE INDEX idx_jobs_organization_status ON jobs(organization_id, status);
CREATE INDEX idx_jobs_customer ON jobs(customer_id);
CREATE INDEX idx_jobs_assigned_to ON jobs(assigned_to);

-- Invoice indexes
CREATE INDEX idx_invoices_organization_status ON invoices(organization_id, status);
CREATE INDEX idx_invoices_organization_due_date ON invoices(organization_id, due_date);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);

-- =============================================================================
-- TRIGGERS FOR updated_at COLUMNS
-- =============================================================================

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_addresses_updated_at
    BEFORE UPDATE ON service_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_schedules_updated_at
    BEFORE UPDATE ON recurring_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- HANDLE NEW USER SIGNUP
-- =============================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id uuid;
BEGIN
    -- Create a new organization for the user
    INSERT INTO organizations (name, owner_id)
    VALUES ('My Business', NEW.id)
    RETURNING id INTO new_org_id;

    -- Create a profile for the user linked to the organization
    INSERT INTO profiles (id, organization_id, role, full_name)
    VALUES (NEW.id, new_org_id, 'owner', COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to handle new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all public tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_log ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's organization_id
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS uuid AS $$
BEGIN
    RETURN (SELECT organization_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations policies
CREATE POLICY "Users can view own organization" ON organizations
    FOR SELECT USING (owner_id = auth.uid() OR id = get_user_organization_id());

CREATE POLICY "Users can update own organization" ON organizations
    FOR UPDATE USING (owner_id = auth.uid() OR id = get_user_organization_id());

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can view profiles in their organization" ON profiles
    FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Organization-scoped table policies template
-- Customers
CREATE POLICY "Organization access" ON customers
    FOR ALL USING (organization_id = get_user_organization_id());

-- Service addresses
CREATE POLICY "Organization access" ON service_addresses
    FOR ALL USING (organization_id = get_user_organization_id());

-- Recurring schedules
CREATE POLICY "Organization access" ON recurring_schedules
    FOR ALL USING (organization_id = get_user_organization_id());

-- Jobs
CREATE POLICY "Organization access" ON jobs
    FOR ALL USING (organization_id = get_user_organization_id());

-- Job line items (access through job)
CREATE POLICY "Organization access through job" ON job_line_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM jobs 
            WHERE jobs.id = job_line_items.job_id 
            AND jobs.organization_id = get_user_organization_id()
        )
    );

-- Job status history (access through job)
CREATE POLICY "Organization access through job" ON job_status_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM jobs 
            WHERE jobs.id = job_status_history.job_id 
            AND jobs.organization_id = get_user_organization_id()
        )
    );

-- Invoices
CREATE POLICY "Organization access" ON invoices
    FOR ALL USING (organization_id = get_user_organization_id());

-- Invoice line items (access through invoice)
CREATE POLICY "Organization access through invoice" ON invoice_line_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = invoice_line_items.invoice_id 
            AND invoices.organization_id = get_user_organization_id()
        )
    );

-- Payments
CREATE POLICY "Organization access" ON payments
    FOR ALL USING (organization_id = get_user_organization_id());

-- Communication log
CREATE POLICY "Organization access" ON communication_log
    FOR ALL USING (organization_id = get_user_organization_id());