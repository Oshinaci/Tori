-- Assets reference table for supported networks
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    network_id TEXT NOT NULL, -- e.g., 'ethereum', 'arbitrum'
    contract_address TEXT, -- null for native token
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    decimals INTEGER NOT NULL DEFAULT 18,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(network_id, contract_address)
);

CREATE INDEX IF NOT EXISTS idx_assets_network_id ON public.assets(network_id);

-- User portfolio tracking (watched assets or cached balances)
CREATE TABLE IF NOT EXISTS public.user_portfolio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, asset_id)
);

CREATE INDEX IF NOT EXISTS idx_user_portfolio_user_id ON public.user_portfolio(user_id);

-- Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portfolio ENABLE ROW LEVEL SECURITY;

-- Assets are readable by everyone
CREATE POLICY "Assets are viewable by everyone" ON public.assets
    FOR SELECT USING (true);

-- User portfolio is readable and writable by the owner
CREATE POLICY "Users can view their own portfolio" ON public.user_portfolio
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio" ON public.user_portfolio
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio" ON public.user_portfolio
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio" ON public.user_portfolio
    FOR DELETE USING (auth.uid() = user_id);
