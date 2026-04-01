import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { api, Market } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { MarketCard } from "@/components/market-card";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";

function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"active" | "resolved">("active");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");

  const loadMarkets = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);
      const data = await api.listMarkets(status, page, sortBy);
      setMarkets(data);
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : "Failed to load markets");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarkets();
    const interval = setInterval(() => {
      loadMarkets(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [status, page, sortBy]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Prediction Markets</h1>
          <p className="text-gray-600 mb-8 text-lg">Create and participate in prediction markets</p>
          <div className="space-x-4">
            <Button onClick={() => navigate({ to: "/auth/login" })}>Login</Button>
            <Button variant="outline" onClick={() => navigate({ to: "/auth/register" })}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Markets</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.username}!</p>
            <div className="flex items-center gap-2 mt-3">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold border border-green-200">
                Balance: ${Number(user?.balance ?? 0).toFixed(2)}
              </div>
              {user?.role === "admin" && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold uppercase border border-purple-200">
                  Admin
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/profile" })}>
              My Profile
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/leaderboard" })}>
              Leaderboard
            </Button>
            {user?.role === "admin" && (
              <Button onClick={() => navigate({ to: "/markets/new" })}>
                Create Market
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate({ to: "/auth/logout" })}>
              Logout
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border border-slate-200">
              <Button
                variant={status === "active" ? "default" : "ghost"}
                size="sm"
                onClick={() => { setStatus("active"); setPage(1); }}
              >
                Active
              </Button>
              <Button
                variant={status === "resolved" ? "default" : "ghost"}
                size="sm"
                onClick={() => { setStatus("resolved"); setPage(1); }}
              >
                Resolved
              </Button>
            </div>

            <select 
              value={sortBy} 
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="createdAt">Newest First</option>
              <option value="totalBet">Total Stakes (Pool Size)</option>
              <option value="participants">Most Participants</option>
            </select>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-1.5 rounded-lg shadow-sm border border-slate-200">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              ← Previous
            </Button>
            <span className="font-bold text-sm text-slate-600 px-2 border-x border-slate-100">Page {page}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setPage(p => p + 1)}
              disabled={markets.length < 20 || isLoading}
            >
              Next →
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading markets...</p>
            </CardContent>
          </Card>
        ) : markets.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-muted-foreground text-lg">
                  No {status} markets found on page {page}.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center pb-12">
           <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-xl shadow-md border border-slate-200">
              <Button 
                onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0,0); }}
                disabled={page === 1 || isLoading}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-slate-500 font-medium">Page <span className="text-indigo-600 font-bold">{page}</span></span>
              <Button 
                onClick={() => { setPage(p => p + 1); window.scrollTo(0,0); }}
                disabled={markets.length < 20 || isLoading}
                variant="outline"
              >
                Next
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: DashboardPage,
});