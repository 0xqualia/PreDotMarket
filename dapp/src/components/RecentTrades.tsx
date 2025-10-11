import { useEffect, useState } from 'react';
import { supabase, Trade } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface RecentTradesProps {
  tokenId: string;
}

export function RecentTrades({ tokenId }: RecentTradesProps) {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    loadTrades();
    const channel = supabase
      .channel('trades-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trades' },
        () => {
          loadTrades();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tokenId]);

  const loadTrades = async () => {
    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('token_id', tokenId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setTrades(data);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-semibold">Recent Trades</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border">
          <div className="text-left">Price (USD)</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Time</div>
        </div>

        <div className="h-[calc(100%-2.5rem)] overflow-y-auto">
          {trades.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              No recent trades
            </div>
          ) : (
            trades.map((trade) => (
              <div
                key={trade.id}
                className="grid grid-cols-3 gap-2 px-4 py-2 text-sm hover:bg-muted/50"
              >
                <div className="font-medium">
                  ${Number(trade.price).toFixed(2)}
                </div>
                <div className="text-right">{Number(trade.amount).toFixed(4)}</div>
                <div className="text-right text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(trade.created_at), { addSuffix: true })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
