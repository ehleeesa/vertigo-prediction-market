const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4005";

export interface Market {
  id: number;
  title: string;
  description?: string;
  status: "active" | "resolved";
  creator?: string;
  outcomes: MarketOutcome[];
  totalMarketBets: number;
  resolvedOutcomeId?: number;
}

export interface MarketOutcome {
  id: number;
  title: string;
  odds: number;
  totalBets: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  token: string;
  balance: number;
  role: "user" | "admin";
  totalWinnings: number;
  apiKey?: string;
}

export interface Bet {
  id: number;
  userId: number;
  marketId: number;
  outcomeId: number;
  amount: number;
  createdAt: string;
  market: {
    title: string;
    status: string;
  };
  outcome: {
    title: string;
  };
}

export interface LeaderboardEntry {
  username: string;
  totalWinnings: number;
  balance: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeader() {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("auth_token");
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeader(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessage = data.errors.map((e: any) => `${e.field}: ${e.message}`).join(", ");
        throw new Error(errorMessage);
      }
      throw new Error(data.error || data.message || `API Error: ${response.status}`);
    }

    return data ?? {};
  }

  async register(username: string, email: string, password: string): Promise<User> {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  }

  async login(email: string, password: string): Promise<User> {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async listMarkets(status: "active" | "resolved" = "active", page: number = 1, sort: string = "createdAt"): Promise<Market[]> {
    return this.request(`/api/markets?status=${status}&page=${page}&sort=${sort}`);
  }

  async getMarket(id: number): Promise<Market> {
    return this.request(`/api/markets/${id}`);
  }

  async createMarket(title: string, description: string, outcomes: string[]): Promise<Market> {
    return this.request("/api/markets", {
      method: "POST",
      body: JSON.stringify({ title, description, outcomes }),
    });
  }

  async placeBet(marketId: number, outcomeId: number, amount: number): Promise<Bet> {
    return this.request(`/api/markets/${marketId}/bets`, {
      method: "POST",
      body: JSON.stringify({ outcomeId, amount }),
    });
  }

  async resolveMarket(marketId: number, outcomeId: number): Promise<Market> {
    return this.request(`/api/markets/${marketId}/resolve`, {
      method: "POST",
      body: JSON.stringify({ outcomeId }),
    });
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.request("/api/markets/leaderboard");
  }

  async getMyBets(page: number = 1): Promise<Bet[]> {
    return this.request(`/api/markets/me/bets?page=${page}`);
  }

  async generateApiKey(): Promise<{ apiKey: string }> {
    return this.request("/api/auth/generate-api-key", {
      method: "POST",
    });
  }
}

export const api = new ApiClient(API_BASE_URL);