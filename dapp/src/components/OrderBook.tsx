import { useEffect, useState } from 'react';
import { supabase, Order } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

interface OrderBookProps {
  tokenId: string;
}

interface AggregatedOrder {
  price: number;
  amount: number;
  total: number;
}

export function OrderBook({ tokenId }: OrderBookProps) {
  const [buyOrders, setBuyOrders] = useState<AggregatedOrder[]>([]);
  const [sellOrders, setSellOrders] = useState<AggregatedOrder[]>([]);
  const [spread, setSpread] = useState<number>(0);

  useEffect(() => {
    loadOrders();
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tokenId]);

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('token_id', tokenId)
      .in('status', ['open', 'partial']);

    if (data) {
      const buys = aggregateOrders(
        data.filter((o) => o.side === 'buy'),
        'buy'
      );
      const sells = aggregateOrders(
        data.filter((o) => o.side === 'sell'),
        'sell'
      );

      setBuyOrders(buys);
      setSellOrders(sells);

      if (buys.length > 0 && sells.length > 0) {
        setSpread(Number(sells[0].price) - Number(buys[0].price));
      }
    }
  };

  const aggregateOrders = (orders: Order[], side: 'buy' | 'sell'): AggregatedOrder[] => {
    const priceMap = new Map<number, number>();

    orders.forEach((order) => {
      const price = Number(order.price);
      const amount = Number(order.amount) - Number(order.filled_amount);
      priceMap.set(price, (priceMap.get(price) || 0) + amount);
    });

    const aggregated = Array.from(priceMap.entries())
      .map(([price, amount]) => ({
        price,
        amount,
        total: price * amount,
      }))
      .sort((a, b) => (side === 'buy' ? b.price - a.price : a.price - b.price))
      .slice(0, 15);

    return aggregated;
  };

  const maxTotal = Math.max(
    ...buyOrders.map((o) => o.total),
    ...sellOrders.map((o) => o.total),
    1
  );

  return (
    <Card className="h-full flex flex-col">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-semibold">Order Book</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border">
          <div className="text-left">Price (USD)</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Total</div>
        </div>

        <div className="h-[calc(50%-1rem)] overflow-y-auto">
          {sellOrders.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              No sell orders
            </div>
          ) : (
            sellOrders.map((order, idx) => (
              <div
                key={`sell-${idx}`}
                className="grid grid-cols-3 gap-2 px-4 py-1.5 text-sm relative hover:bg-muted/50 cursor-pointer"
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-red-500/5"
                  style={{ width: `${(order.total / maxTotal) * 100}%` }}
                />
                <div className="text-red-500 font-medium relative z-10">
                  {order.price.toFixed(2)}
                </div>
                <div className="text-right relative z-10">{order.amount.toFixed(4)}</div>
                <div className="text-right text-muted-foreground relative z-10">
                  {order.total.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-3 bg-muted/30 border-y border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Spread</span>
            <span className="text-sm font-medium">
              {spread >= 0 ? `$${spread.toFixed(4)}` : '—'}
            </span>
          </div>
        </div>

        <div className="h-[calc(50%-1rem)] overflow-y-auto">
          {buyOrders.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              No buy orders
            </div>
          ) : (
            buyOrders.map((order, idx) => (
              <div
                key={`buy-${idx}`}
                className="grid grid-cols-3 gap-2 px-4 py-1.5 text-sm relative hover:bg-muted/50 cursor-pointer"
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-emerald-500/5"
                  style={{ width: `${(order.total / maxTotal) * 100}%` }}
                />
                <div className="text-emerald-500 font-medium relative z-10">
                  {order.price.toFixed(2)}
                </div>
                <div className="text-right relative z-10">{order.amount.toFixed(4)}</div>
                <div className="text-right text-muted-foreground relative z-10">
                  {order.total.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
