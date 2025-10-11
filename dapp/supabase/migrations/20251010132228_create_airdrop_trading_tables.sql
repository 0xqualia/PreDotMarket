/*
  # Airdrop Pre-Market Trading Platform Schema

  ## Overview
  Creates the database schema for a crypto airdrop pre-market trading desk with orderbook functionality.

  ## New Tables
  
  ### `tokens`
  Stores airdrop token information
  - `id` (uuid, primary key) - Unique token identifier
  - `symbol` (text) - Token symbol (e.g., "STRK", "ZK")
  - `name` (text) - Full token name
  - `total_supply` (bigint) - Total token supply
  - `airdrop_date` (timestamptz) - Expected airdrop date
  - `current_price` (decimal) - Current pre-market price
  - `price_change_24h` (decimal) - 24-hour price change percentage
  - `volume_24h` (decimal) - 24-hour trading volume
  - `created_at` (timestamptz) - Record creation timestamp

  ### `orders`
  Stores buy/sell orders in the orderbook
  - `id` (uuid, primary key) - Unique order identifier
  - `token_id` (uuid, foreign key) - References tokens table
  - `user_id` (uuid) - User placing the order
  - `side` (text) - Order side: 'buy' or 'sell'
  - `price` (decimal) - Order price
  - `amount` (decimal) - Order amount
  - `filled_amount` (decimal) - Amount already filled
  - `status` (text) - Order status: 'open', 'partial', 'filled', 'cancelled'
  - `created_at` (timestamptz) - Order creation timestamp
  - `updated_at` (timestamptz) - Order update timestamp

  ### `trades`
  Stores executed trades
  - `id` (uuid, primary key) - Unique trade identifier
  - `token_id` (uuid, foreign key) - References tokens table
  - `buy_order_id` (uuid, foreign key) - References orders table
  - `sell_order_id` (uuid, foreign key) - References orders table
  - `price` (decimal) - Execution price
  - `amount` (decimal) - Trade amount
  - `created_at` (timestamptz) - Trade execution timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to:
    - View all tokens (public data)
    - View all orders (orderbook visibility)
    - View all trades (trade history visibility)
    - Create their own orders
    - Update their own orders
    - Cancel their own orders

  ## Notes
  - Prices stored as decimal for precision
  - Orderbook is fully visible to all users (standard exchange behavior)
  - Trade matching logic would be implemented in application layer or edge functions
*/

CREATE TABLE IF NOT EXISTS tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text UNIQUE NOT NULL,
  name text NOT NULL,
  total_supply bigint DEFAULT 0,
  airdrop_date timestamptz,
  current_price decimal(20, 8) DEFAULT 0,
  price_change_24h decimal(10, 2) DEFAULT 0,
  volume_24h decimal(20, 8) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid REFERENCES tokens(id) NOT NULL,
  user_id uuid NOT NULL,
  side text NOT NULL CHECK (side IN ('buy', 'sell')),
  price decimal(20, 8) NOT NULL CHECK (price > 0),
  amount decimal(20, 8) NOT NULL CHECK (amount > 0),
  filled_amount decimal(20, 8) DEFAULT 0 CHECK (filled_amount >= 0),
  status text DEFAULT 'open' CHECK (status IN ('open', 'partial', 'filled', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid REFERENCES tokens(id) NOT NULL,
  buy_order_id uuid REFERENCES orders(id),
  sell_order_id uuid REFERENCES orders(id),
  price decimal(20, 8) NOT NULL,
  amount decimal(20, 8) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_token_id ON orders(token_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_trades_token_id ON trades(token_id);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at DESC);

ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tokens"
  ON tokens FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders"
  ON orders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view trades"
  ON trades FOR SELECT
  TO authenticated, anon
  USING (true);

INSERT INTO tokens (symbol, name, total_supply, airdrop_date, current_price, price_change_24h, volume_24h)
VALUES 
  ('STRK', 'Starknet', 10000000000, '2025-11-15 00:00:00+00', 1.85, 12.5, 2500000),
  ('ZK', 'zkSync', 21000000000, '2025-12-01 00:00:00+00', 0.45, -5.2, 1800000),
  ('SCROLL', 'Scroll', 1000000000, '2025-11-30 00:00:00+00', 2.20, 8.3, 950000),
  ('LAYER', 'LayerZero', 1000000000, '2025-12-20 00:00:00+00', 3.15, 15.7, 3200000)
ON CONFLICT (symbol) DO NOTHING;
