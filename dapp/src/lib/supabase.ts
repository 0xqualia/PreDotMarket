import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Token = {
  id: string;
  symbol: string;
  name: string;
  total_supply: number;
  airdrop_date: string;
  current_price: number;
  price_change_24h: number;
  volume_24h: number;
  created_at: string;
};

export type Order = {
  id: string;
  token_id: string;
  user_id: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  filled_amount: number;
  status: 'open' | 'partial' | 'filled' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export type Trade = {
  id: string;
  token_id: string;
  buy_order_id: string;
  sell_order_id: string;
  price: number;
  amount: number;
  created_at: string;
};
