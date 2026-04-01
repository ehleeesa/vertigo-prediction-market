import { useEffect, useState } from "react";
import { useParams, useNavigate, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { api, Market } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

function MarketDetailPage() {
  const { id } = useParams({ from: "/markets/$id" });
  const navigate = useNavigate();
  const { isAuthenticated, user, updateUser } = useAuth(); 
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const [isBetting, setIsBetting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const marketId = parseInt(id, 10);

  const outcomeColors = [
    { bg: "bg-blue-500", hex: "#3b82f6", border: "border-blue-600", light: "bg-blue-50/50" },
    { bg: "bg-emerald-500", hex: "#10b981", border: "border-emerald-600", light: "bg-emerald-50/50" },
    { bg: "bg-amber-500", hex: "#f59e0b", border: "border-amber-600", light: "bg-amber-50/50" },
    { bg: "bg-purple-500", hex: "#8b5cf6", border: "border-purple-600", light: "bg-purple-50/50" },
    { bg: "bg-pink-500", hex: "#ec4899", border: "border-pink-600", light: "bg-pink-50/50" },
  ];

  const loadMarket = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const data = await api.getMarket(marketId);
      setMarket(data);
      if (!selectedOutcomeId && data.outcomes.length > 0) {
        setSelectedOutcomeId(data.outcomes[0].id);
      }
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : "Failed to load market details");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarket();
    const interval = setInterval(() => {
      loadMarket(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [marketId]);

  const handlePlaceBet = async () => {
    const amount = parseFloat(betAmount);
    if (!selectedOutcomeId) { setError("Please select an outcome first"); return; }
    if (!betAmount || isNaN(amount) || amount <= 0) { setError("Please enter a valid amount greater than 0"); return; }
    if (user && amount > user.balance) { setError(`Insufficient balance ($${user.balance.toFixed(2)})`); return; }

    try {
      setIsBetting(true);
      setError(null);
      await api.placeBet(marketId, selectedOutcomeId, amount);
      if (user) {
        updateUser({ ...user, balance: user.balance - amount });
      }
      setBetAmount("");
      await loadMarket(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bet");
    } finally {
      setIsBetting(false);
    }
  };

  const handleResolveMarket = async (outcomeId: number) => {
    if (!confirm("Are you sure you want to resolve this market?")) return;
    try {
      setIsResolving(true);
      setError(null);
      await api.resolveMarket(marketId, outcomeId);
      await loadMarket(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve market");
    } finally {
      setIsResolving(false);
    }
  };

  const getConicGradient = () => {
    if (!market || market.outcomes.length === 0) return "";
    let currentPercentage = 0;
    const gradientParts = market.outcomes.map((outcome, idx) => {
      const start = currentPercentage;
      currentPercentage += outcome.odds;
      const end = idx === market.outcomes.length - 1 ? 100 : currentPercentage;
      const color = outcomeColors[idx % outcomeColors.length].hex;
      return `${color} ${start}% ${end}%`;
    });
    return `conic-gradient(${gradientParts.join(", ")})`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card><CardContent className="py-12 text-center"><Button onClick={() => navigate({ to: "/auth/login" })}>Login</Button></CardContent></Card>
      </div>
    );
  }

  if (isLoading) return <div className="p-20 text-center">Loading market...</div>;
  if (!market) return <div className="p-20 text-center text-red-500">Market not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate({ to: "/" })}>
          ← Back to Markets
        </Button>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-white border-b">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold">{market.title}</CardTitle>
                <CardDescription className="text-base mt-2">{market.description}</CardDescription>
              </div>
              <Badge variant={market.status === "active" ? "default" : "secondary"} className="font-bold uppercase tracking-wider">
                {market.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            
            <div className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Market Distribution</h3>
              
              <div 
                className="relative w-56 h-56 rounded-full shadow-md border-[10px] border-slate-50 transition-all duration-1000"
                style={{ background: getConicGradient() }}
              >
                <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Pool</span>
                  <span className="text-xl font-black text-slate-800">${market.totalMarketBets.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8 w-full">
                {market.outcomes.map((outcome, idx) => {
                  const colorClass = outcomeColors[idx % outcomeColors.length].bg;
                  return (
                    <div key={outcome.id} className="flex flex-col items-center p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${colorClass}`}></div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase truncate max-w-[80px]">{outcome.title}</span>
                      </div>
                      <span className="text-sm font-black text-slate-800">{outcome.odds}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vote / Place Bet</h3>
              {market.outcomes.map((outcome, idx) => {
                const color = outcomeColors[idx % outcomeColors.length];
                const isSelected = selectedOutcomeId === outcome.id;
                return (
                  <div
                    key={outcome.id}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected ? `${color.border} ${color.light}` : "border-slate-100 bg-white hover:border-slate-200"
                    } ${market.resolvedOutcomeId === outcome.id ? "ring-2 ring-green-500 border-green-500 bg-green-50" : ""}`}
                    onClick={() => market.status === "active" && setSelectedOutcomeId(outcome.id)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{outcome.title}</span>
                        {market.resolvedOutcomeId === outcome.id && <Badge className="bg-green-600">Winner</Badge>}
                      </div>
                      <span className={`text-2xl font-black ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                        {outcome.odds}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`${color.bg} h-full transition-all duration-700 ease-out`} 
                        style={{ width: `${outcome.odds}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {user?.role === "admin" && market.status === "active" && (
              <Card className="border-2 border-dashed border-purple-200 bg-purple-50/20">
                <CardHeader><CardTitle className="text-purple-800 text-sm font-bold uppercase">Admin Controls</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {market.outcomes.map(o => (
                    <Button key={o.id} variant="outline" size="sm" className="border-purple-300" onClick={() => handleResolveMarket(o.id)} disabled={isResolving}>
                      Resolve as "{o.title}"
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}

            {market.status === "active" ? (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="amount" className="font-bold text-slate-700 uppercase text-xs tracking-widest">Your Bet</Label>
                    <span className="text-xs font-bold text-slate-400">Balance: ${user?.balance.toFixed(2)}</span>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Enter amount (min $1.00)"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    disabled={isBetting}
                    className="h-12 text-lg border-slate-200"
                  />
                </div>
                {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl">{error}</div>}
                <Button className="w-full h-14 text-lg font-bold bg-slate-900 hover:bg-blue-600 transition-colors" onClick={handlePlaceBet} disabled={isBetting || !selectedOutcomeId}>
                  {isBetting ? "Confirming..." : "Place Bet"}
                </Button>
              </div>
            ) : (
              <div className="p-6 bg-green-50 border border-green-100 text-green-700 rounded-xl text-center font-bold">
                ✓ Market Finalized
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/markets/$id")({
  component: MarketDetailPage,
});