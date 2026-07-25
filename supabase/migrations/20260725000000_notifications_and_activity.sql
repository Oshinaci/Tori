-- Migration: Notifications and Wallet Activity tables

-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g., 'transaction', 'alert', 'system'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread', -- 'unread' or 'read'
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster lookups by user and created_at
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);


-- 2. Create Wallet Activity Table
CREATE TABLE IF NOT EXISTS public.wallet_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'deposit', 'withdraw', 'swap', 'bridge', 'buy', 'sell', 'wallet_created', 'wallet_imported', 'backup_completed', 'security'
    token_symbol TEXT,
    amount TEXT,
    tx_hash TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster lookups by user and created_at
CREATE INDEX IF NOT EXISTS idx_wallet_activity_user_id ON public.wallet_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_activity_created_at ON public.wallet_activity(created_at DESC);

-- Enable RLS on wallet_activity
ALTER TABLE public.wallet_activity ENABLE ROW LEVEL SECURITY;

-- Policies for wallet_activity
DROP POLICY IF EXISTS "Users can view their own wallet activity" ON public.wallet_activity;
CREATE POLICY "Users can view their own wallet activity" ON public.wallet_activity
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own wallet activity" ON public.wallet_activity;
CREATE POLICY "Users can insert their own wallet activity" ON public.wallet_activity
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wallet activity" ON public.wallet_activity;
CREATE POLICY "Users can update their own wallet activity" ON public.wallet_activity
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own wallet activity" ON public.wallet_activity;
CREATE POLICY "Users can delete their own wallet activity" ON public.wallet_activity
    FOR DELETE USING (auth.uid() = user_id);
