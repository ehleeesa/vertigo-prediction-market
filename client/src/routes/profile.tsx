import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from "react";
import { api, Bet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute('/profile')({
  component: ProfileComponent,
})

function ProfileComponent() {
  const { user: authUser } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  const [activePage, setActivePage] = useState(1);
  const [resolvedPage, setResolvedPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    if (authUser?.apiKey) {
      setApiKey(authUser.apiKey);
    }
  }, [authUser]);

  useEffect(() => {
    const loadData = () => {
      api.getMyBets()
        .then((data) => {
          setBets(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch bets", err);
          setError("Could not load betting history.");
          setLoading(false);
        });
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateKey = async () => {
    try {
      const response = await api.generateApiKey();
      setApiKey(response.apiKey);
    } catch (err) {
      alert("Failed to generate API Key");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  const activeBets = bets.filter(b => b.market?.status === 'active');
  const resolvedBets = bets.filter(b => b.market?.status === 'resolved');

  const renderTable = (
    betsList: Bet[], 
    isResolved: boolean, 
    currentPage: number, 
    setPage: (p: number) => void
  ) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBets = betsList.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(betsList.length / itemsPerPage);

    return (
      <div className="space-y-4 mb-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-5 font-bold text-xs uppercase tracking-wider text-gray-500">Market</th>
                  <th className="p-5 font-bold text-xs uppercase tracking-wider text-gray-500">Outcome</th>
                  <th className="p-5 font-bold text-xs uppercase tracking-wider text-gray-500">Amount</th>
                  <th className="p-5 font-bold text-xs uppercase tracking-wider text-gray-500">{isResolved ? "Result" : "Status"}</th>
                  <th className="p-5 font-bold text-xs uppercase tracking-wider text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedBets.map((bet) => {
                  const isWinner = isResolved && bet.outcomeId === bet.market?.resolvedOutcomeId;
                  return (
                    <tr key={bet.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-5 font-bold text-gray-800">{bet.market?.title}</td>
                      <td className="p-5 text-gray-600">
                        <span className="bg-gray-100 px-3 py-1 rounded-md text-sm font-medium">
                          {bet.outcome?.title}
                        </span>
                      </td>
                      <td className="p-5 font-black text-blue-600">
                        ${bet.amount.toLocaleString()}
                      </td>
                      <td className="p-5">
                        {isResolved ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                            isWinner ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {isWinner ? "WINNER" : "LOSS"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-700">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-sm text-gray-400 font-medium">
                        {new Date(bet.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {betsList.length === 0 && (
              <div className="p-10 text-center text-gray-400 italic">No bets found in this category.</div>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1} 
              onClick={() => setPage(currentPage - 1)}
            >
              ← Previous
            </Button>
            <span className="text-sm font-medium text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === totalPages} 
              onClick={() => setPage(currentPage + 1)}
            >
              Next →
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">User Dashboard</h1>
        <p className="text-gray-500 mt-2">Track your active predictions and resolved history.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Bot Access (API Key)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Use this key to place bets programmatically via the API.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-mono text-sm text-slate-600 min-h-[48px] flex items-center shadow-inner">
              {apiKey ? (
                <span className="break-all">{apiKey}</span>
              ) : (
                <span className="text-slate-400 italic">No API Key generated yet</span>
              )}
            </div>
            
            <Button 
              variant="outline"
              className="border-slate-200 hover:bg-slate-50 font-bold text-slate-700"
              onClick={handleGenerateKey}
            >
              {apiKey ? "Regenerate Key" : "Generate Key"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
          Active Bets ({activeBets.length})
        </h2>
        {renderTable(activeBets, false, activePage, setActivePage)}

        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pt-4">
          <span className="w-2 h-6 bg-green-600 rounded-full"></span>
          Resolved History ({resolvedBets.length})
        </h2>
        {renderTable(resolvedBets, true, resolvedPage, setResolvedPage)}
      </div>
    </div>
  );
}