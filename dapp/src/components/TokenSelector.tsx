import { useEffect, useState } from 'react';
import { supabase, Token } from '@/lib/supabase';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TokenSelectorProps {
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
}

export function TokenSelector({ selectedToken, onTokenSelect }: TokenSelectorProps) {
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    const { data } = await supabase
      .from('tokens')
      .select('*')
      .order('volume_24h', { ascending: false });

    if (data) {
      setTokens(data);
      if (!selectedToken && data.length > 0) {
        onTokenSelect(data[0]);
      }
    }
  };

  if (!selectedToken) return null;

  return (
    <div className="border-b border-border bg-card">
      <div className="px-6 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{selectedToken.symbol}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">{selectedToken.name}</span>
                </div>
                <div className="ml-6 text-right">
                  <div className="text-2xl font-bold">
                    ${Number(selectedToken.current_price).toFixed(2)}
                  </div>
                  <div className={`text-sm font-medium ${
                    Number(selectedToken.price_change_24h) >= 0
                      ? 'text-emerald-500'
                      : 'text-red-500'
                  }`}>
                    {Number(selectedToken.price_change_24h) >= 0 ? '+' : ''}
                    {Number(selectedToken.price_change_24h).toFixed(2)}%
                  </div>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {tokens.map((token) => (
              <DropdownMenuItem
                key={token.id}
                onClick={() => onTokenSelect(token)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-semibold">{token.symbol}</div>
                    <div className="text-xs text-muted-foreground">{token.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${Number(token.current_price).toFixed(2)}</div>
                    <div className={`text-xs ${
                      Number(token.price_change_24h) >= 0
                        ? 'text-emerald-500'
                        : 'text-red-500'
                    }`}>
                      {Number(token.price_change_24h) >= 0 ? '+' : ''}
                      {Number(token.price_change_24h).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
