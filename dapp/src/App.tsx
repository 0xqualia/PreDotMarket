import { useState } from 'react';
import { Token } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { TokenSelector } from '@/components/TokenSelector';
import { OrderBook } from '@/components/OrderBook';
import { TradingForm } from '@/components/TradingForm';
import { PriceChart } from '@/components/PriceChart';
import { RecentTrades } from '@/components/RecentTrades';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <TokenSelector selectedToken={selectedToken} onTokenSelect={setSelectedToken} />

      {selectedToken && (
        <div className="p-4 gap-4 grid grid-cols-12 h-[calc(100vh-10rem)]">
          <div className="col-span-3">
            <OrderBook tokenId={selectedToken.id} />
          </div>
          <div className="col-span-6 flex flex-col gap-4">
            <div className="flex-1">
              <PriceChart token={selectedToken} />
            </div>
            <div className="h-64">
              <RecentTrades tokenId={selectedToken.id} />
            </div>
          </div>
          <div className="col-span-3">
            <TradingForm token={selectedToken} />
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}

export default App;
