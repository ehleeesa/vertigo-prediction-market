import { createFileRoute } from "@tanstack/react-router";
import { api, LeaderboardEntry } from "../lib/api";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard()
      .then((data) => {
        setTopUsers(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Leaderboard error:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="text-center p-10">Loading rankings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-slate-900">
      <h1 className="text-3xl font-bold mb-8 text-center uppercase tracking-tight">Leaderboard</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 font-sans">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 font-semibold text-slate-600">Rank</th>
              <th className="px-6 py-4 font-semibold text-slate-600">User</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">Total Winnings</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">Current Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {topUsers?.map((user: any, index: number) => (
              <tr key={user.username} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-400">
                  #{index + 1}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {user.username}
                </td>
                <td className="px-6 py-4 text-emerald-600 font-bold text-right">
                  ${user.totalWinnings.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-slate-500 font-mono text-right">
                  ${user.balance.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}