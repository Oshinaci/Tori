export type Asset = {
  symbol: string;
  name: string;
  price: number;
  change24h: number; // %
  balance: number;
  color: string;
  chain: string;
};

export const ASSETS: Asset[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3820.44,
    change24h: 2.31,
    balance: 1.284,
    color: "#627EEA",
    chain: "Ethereum",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 96214.7,
    change24h: 1.12,
    balance: 0.0421,
    color: "#F7931A",
    chain: "Bitcoin",
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 214.86,
    change24h: -1.84,
    balance: 32.4,
    color: "#14F195",
    chain: "Solana",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    price: 1.0,
    change24h: 0.01,
    balance: 1240.55,
    color: "#2775CA",
    chain: "Base",
  },
  {
    symbol: "ARB",
    name: "Arbitrum",
    price: 0.82,
    change24h: 4.5,
    balance: 512.1,
    color: "#28A0F0",
    chain: "Arbitrum",
  },
  {
    symbol: "OP",
    name: "Optimism",
    price: 1.94,
    change24h: -0.62,
    balance: 96.7,
    color: "#FF0420",
    chain: "Optimism",
  },
];

export type Tx = {
  id: string;
  type: "send" | "receive" | "swap" | "buy";
  asset: string;
  counter?: string;
  amount: number;
  usd: number;
  time: string;
  address?: string;
};

export const TXS: Tx[] = [
  {
    id: "1",
    type: "receive",
    asset: "ETH",
    amount: 0.42,
    usd: 1604.58,
    time: "2m ago",
    address: "0x8f…3aC1",
  },
  { id: "2", type: "swap", asset: "USDC", counter: "ETH", amount: 500, usd: 500, time: "1h ago" },
  {
    id: "3",
    type: "send",
    asset: "SOL",
    amount: 4.2,
    usd: 902.4,
    time: "5h ago",
    address: "0x2b…9De4",
  },
  { id: "4", type: "buy", asset: "BTC", amount: 0.005, usd: 481.07, time: "Yesterday" },
  { id: "5", type: "swap", asset: "ARB", counter: "USDC", amount: 250, usd: 205, time: "2d ago" },
  {
    id: "6",
    type: "receive",
    asset: "USDC",
    amount: 320.4,
    usd: 320.4,
    time: "3d ago",
    address: "0xA1…44Bf",
  },
];

export type WatchlistItem = {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: string;
  marketCap: string;
  color: string;
  sparkline: number[];
  isPinned?: boolean;
};

export const INITIAL_WATCHLIST: WatchlistItem[] = [
  {
    symbol: "TORI",
    name: "Tori Protocol",
    price: 4.85,
    change24h: 12.45,
    volume24h: "$14.2M",
    marketCap: "$485M",
    color: "#00E5FF",
    sparkline: [4.1, 4.25, 4.18, 4.4, 4.6, 4.85],
    isPinned: true,
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 96214.7,
    change24h: 1.12,
    volume24h: "$38.4B",
    marketCap: "$1.89T",
    color: "#F7931A",
    sparkline: [94500, 95100, 95800, 95200, 96000, 96214],
    isPinned: true,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3820.44,
    change24h: 2.31,
    volume24h: "$18.6B",
    marketCap: "$459B",
    color: "#627EEA",
    sparkline: [3710, 3740, 3790, 3760, 3800, 3820],
    isPinned: true,
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 214.86,
    change24h: -1.84,
    volume24h: "$5.8B",
    marketCap: "$101B",
    color: "#14F195",
    sparkline: [222, 220, 218, 216, 212, 214.86],
    isPinned: true,
  },
  {
    symbol: "SUI",
    name: "Sui Network",
    price: 3.42,
    change24h: 8.75,
    volume24h: "$1.2B",
    marketCap: "$9.8B",
    color: "#4CA2FF",
    sparkline: [3.1, 3.15, 3.25, 3.3, 3.38, 3.42],
    isPinned: false,
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    price: 32.1,
    change24h: -0.45,
    volume24h: "$450M",
    marketCap: "$12.8B",
    color: "#E84142",
    sparkline: [33.2, 33.0, 32.8, 32.5, 32.0, 32.1],
    isPinned: false,
  },
];

export type MarketItem = {
  rank: number;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: string;
  category: "All" | "DeFi" | "Layer 1" | "Meme" | "AI";
  color: string;
};

export const MARKET_ITEMS: MarketItem[] = [
  {
    rank: 1,
    symbol: "BTC",
    name: "Bitcoin",
    price: 96214.7,
    change24h: 1.12,
    volume24h: "$38.4B",
    category: "Layer 1",
    color: "#F7931A",
  },
  {
    rank: 2,
    symbol: "ETH",
    name: "Ethereum",
    price: 3820.44,
    change24h: 2.31,
    volume24h: "$18.6B",
    category: "Layer 1",
    color: "#627EEA",
  },
  {
    rank: 3,
    symbol: "SOL",
    name: "Solana",
    price: 214.86,
    change24h: -1.84,
    volume24h: "$5.8B",
    category: "Layer 1",
    color: "#14F195",
  },
  {
    rank: 4,
    symbol: "TORI",
    name: "Tori Protocol",
    price: 4.85,
    change24h: 12.45,
    volume24h: "$14.2M",
    category: "DeFi",
    color: "#00E5FF",
  },
  {
    rank: 5,
    symbol: "LINK",
    name: "Chainlink",
    price: 18.9,
    change24h: 5.6,
    volume24h: "$840M",
    category: "DeFi",
    color: "#375BD2",
  },
  {
    rank: 6,
    symbol: "NEAR",
    name: "NEAR Protocol",
    price: 6.75,
    change24h: 7.2,
    volume24h: "$620M",
    category: "AI",
    color: "#60A5FA",
  },
  {
    rank: 7,
    symbol: "PEPE",
    name: "Pepe Coin",
    price: 0.0000114,
    change24h: -3.4,
    volume24h: "$1.1B",
    category: "Meme",
    color: "#52AE5F",
  },
  {
    rank: 8,
    symbol: "UNI",
    name: "Uniswap",
    price: 11.2,
    change24h: 3.1,
    volume24h: "$410M",
    category: "DeFi",
    color: "#FF007A",
  },
  {
    rank: 9,
    symbol: "FET",
    name: "Artificial Superintelligence",
    price: 1.45,
    change24h: 14.8,
    volume24h: "$510M",
    category: "AI",
    color: "#8B5CF6",
  },
];

export type NotificationItem = {
  id: string;
  type: "transaction" | "alert" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  amount?: string;
  status?: "success" | "pending" | "info";
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    type: "transaction",
    title: "Received ETH",
    message: "0.42 ETH received from 0x8f…3aC1",
    amount: "+$1,604.58",
    time: "2m ago",
    read: false,
    status: "success",
  },
  {
    id: "n2",
    type: "alert",
    title: "Price Alert: ETH",
    message: "Ethereum increased by +2.31% in the last 24h",
    time: "1h ago",
    read: false,
    status: "info",
  },
  {
    id: "n3",
    type: "transaction",
    title: "Swapped USDC to ETH",
    message: "Swapped 500 USDC for 0.13 ETH",
    amount: "$500.00",
    time: "1h ago",
    read: false,
    status: "success",
  },
  {
    id: "n4",
    type: "system",
    title: "Security Audit Complete",
    message: "Wallet session & multi-sig keys verified securely",
    time: "5h ago",
    read: true,
    status: "info",
  },
  {
    id: "n5",
    type: "transaction",
    title: "Sent SOL",
    message: "4.2 SOL sent to 0x2b…9De4",
    amount: "-$902.40",
    time: "1 day ago",
    read: true,
    status: "success",
  },
];

export const NETWORKS = [{ id: "arb", name: "Arbitrum One", color: "#28A0F0" }];

export const totalBalance = ASSETS.reduce((s, a) => s + a.price * a.balance, 0);
export const pnl24h = ASSETS.reduce((s, a) => s + a.price * a.balance * (a.change24h / 100), 0);

export const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export const fmtUsd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
