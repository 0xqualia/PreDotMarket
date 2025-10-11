import { useState } from 'react';
import { supabase, Token } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface TradingFormProps {
  token: Token;
}

export function TradingForm({ token }: TradingFormProps) {
  const [buyPrice, setBuyPrice] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitOrder = async (side: 'buy' | 'sell') => {
    const price = side === 'buy' ? buyPrice : sellPrice;
    const amount = side === 'buy' ? buyAmount : sellAmount;

    if (!price || !amount) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please enter both price and amount',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const mockUserId = crypto.randomUUID();

      const { error } = await supabase.from('orders').insert({
        token_id: token.id,
        user_id: mockUserId,
        side,
        price: parseFloat(price),
        amount: parseFloat(amount),
        filled_amount: 0,
        status: 'open',
      });

      if (error) throw error;

      toast({
        title: 'Order placed',
        description: `${side.toUpperCase()} order for ${amount} ${token.symbol} at $${price}`,
      });

      if (side === 'buy') {
        setBuyPrice('');
        setBuyAmount('');
      } else {
        setSellPrice('');
        setSellAmount('');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to place order',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = (price: string, amount: string) => {
    const p = parseFloat(price) || 0;
    const a = parseFloat(amount) || 0;
    return (p * a).toFixed(2);
  };

  return (
    <Card className="h-full flex flex-col">
      <Tabs defaultValue="buy" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-border h-12">
          <TabsTrigger value="buy" className="data-[state=active]:text-emerald-500">
            Buy
          </TabsTrigger>
          <TabsTrigger value="sell" className="data-[state=active]:text-red-500">
            Sell
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="flex-1 p-4 mt-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buy-price">Price (USD)</Label>
              <Input
                id="buy-price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buy-amount">Amount ({token.symbol})</Label>
              <Input
                id="buy-amount"
                type="number"
                step="0.0001"
                placeholder="0.00"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-sm py-3 border-t border-border">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">
                ${calculateTotal(buyPrice, buyAmount)} USD
              </span>
            </div>

            <Button
              onClick={() => handleSubmitOrder('buy')}
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'Placing Order...' : `Buy ${token.symbol}`}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="sell" className="flex-1 p-4 mt-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sell-price">Price (USD)</Label>
              <Input
                id="sell-price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sell-amount">Amount ({token.symbol})</Label>
              <Input
                id="sell-amount"
                type="number"
                step="0.0001"
                placeholder="0.00"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-sm py-3 border-t border-border">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">
                ${calculateTotal(sellPrice, sellAmount)} USD
              </span>
            </div>

            <Button
              onClick={() => handleSubmitOrder('sell')}
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Placing Order...' : `Sell ${token.symbol}`}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
