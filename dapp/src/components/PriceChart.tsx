import { Card } from '@/components/ui/card';
import { Token } from '@/lib/supabase';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface PriceChartProps {
  token: Token;
}

const generateMockData = (basePrice: number) => {
  const data = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const variance = (Math.random() - 0.5) * (basePrice * 0.1);
    const price = basePrice + variance;

    data.push({
      time: time.getHours().toString().padStart(2, '0') + ':00',
      price: parseFloat(price.toFixed(2)),
    });
  }

  return data;
};

export function PriceChart({ token }: PriceChartProps) {
  const data = generateMockData(Number(token.current_price));
  const isPositive = Number(token.price_change_24h) >= 0;

  return (
    <Card className="h-full flex flex-col">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Price Chart</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">24h</span>
            <span className={isPositive ? 'text-emerald-500' : 'text-red-500'}>
              {isPositive ? '+' : ''}{Number(token.price_change_24h).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? '#10b981' : '#ef4444'}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? '#10b981' : '#ef4444'}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
