import { Market } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "@tanstack/react-router";

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const navigate = useNavigate();

  const outcomeColors = [
    "bg-blue-600",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  const textColors = [
    "text-blue-600",
    "text-emerald-600",
    "text-amber-600",
    "text-purple-600",
    "text-pink-600",
  ];

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-slate-200 overflow-hidden group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold leading-tight group-hover:text-blue-600 transition-colors">
              {market.title}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1">
              By: <span className="font-medium text-slate-900">{market.creator || "Anonymous"}</span>
            </CardDescription>
          </div>
          <Badge 
            className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] tracking-widest ${
              market.status === "active" 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            {market.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        <div className="space-y-3">
          {market.outcomes.map((outcome, idx) => (
            <div
              key={outcome.id}
              className="relative p-3 rounded-xl border border-slate-100 bg-slate-50/50"
            >
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${outcomeColors[idx % outcomeColors.length]}`}></div>
                    <p className="text-sm font-bold text-slate-800">{outcome.title}</p>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight ml-4">
                    ${outcome.totalBets.toLocaleString()} total
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black ${textColors[idx % textColors.length]}`}>
                    {outcome.odds}%
                  </p>
                </div>
              </div>
              <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`${outcomeColors[idx % outcomeColors.length]} h-full rounded-full transition-all duration-700 ease-out`} 
                  style={{ width: `${outcome.odds}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30">
          <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.1em]">Total Market Value</p>
          <p className="text-2xl font-black text-slate-900 leading-none mt-1">
            ${market.totalMarketBets.toLocaleString()}
          </p>
        </div>

        <Button 
          className={`w-full font-black py-6 text-base uppercase tracking-wider transition-all ${
            market.status === "active"
              ? "bg-slate-900 hover:bg-blue-600 text-white shadow-md active:scale-[0.98]"
              : "bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
          onClick={() => navigate({ to: `/markets/${market.id}` })}
        >
          {market.status === "active" ? "Place Bet" : "View Results"}
        </Button>
      </CardContent>
    </Card>
  );
}