// import { TrendingUp } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {/* <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
          </div> */}
          <div>
            <h1 className="text-xl font-bold tracking-tight">Pre.Market</h1>
            {/* <p className="text-xs text-muted-foreground">Pre-Market Trading Desk</p> */}
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground text-xs">24h Volume</span>
            <span className="font-semibold">$8.45M</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground text-xs">
              Active Traders
            </span>
            <span className="font-semibold">2,847</span>
          </div>
        </div>
      </div>
    </header>
  );
}
