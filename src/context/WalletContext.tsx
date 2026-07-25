import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { walletService } from "@/lib/wallet-service";
import { blockchainService } from "@/lib/wallet/blockchain";
import { ARBITRUM_ONE } from "@/lib/wallet/network";
import { calculatePortfolioValue } from "@/lib/portfolio";

export type RpcStatus = "connected" | "connecting" | "unavailable";

export interface NetworkInfo {
  id: string;
  name: string;
  chainId: number;
  nativeToken: string;
  icon: string;
  explorerUrl: string;
}

interface WalletContextType {
  walletAddress: string | null;
  walletName: string | null;
  network: NetworkInfo;
  loading: boolean;
  ethBalance: string | null;
  ethBalanceWei: string | null;
  lastSyncedAt: Date | null;
  rpcStatus: RpcStatus;
  rpcErrorMessage: string | null;
  isRefetching: boolean;
  refetchBalance: () => Promise<void>;
  portfolioValue: number;
}


const ARBITRUM_NETWORK: NetworkInfo = {
  id: ARBITRUM_ONE.id,
  name: ARBITRUM_ONE.name,
  chainId: ARBITRUM_ONE.chainId,
  nativeToken: ARBITRUM_ONE.nativeToken,
  icon: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
  explorerUrl: ARBITRUM_ONE.explorerUrl,
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Blockchain Live Data
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [ethBalanceWei, setEthBalanceWei] = useState<string | null>(null);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [rpcStatus, setRpcStatus] = useState<RpcStatus>("connecting");
  const [rpcErrorMessage, setRpcErrorMessage] = useState<string | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);

  const isFetchingRef = useRef(false);

  // Fetch balance function
  const fetchBalance = useCallback(async (address: string) => {
    if (!address || isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsRefetching(true);

    try {
      setRpcStatus((prev) => (prev === "unavailable" ? "connecting" : prev));
      const result = await blockchainService.getBalance(address);
      setEthBalance(result.formatted);
      setEthBalanceWei(result.rawWei);
      setLastSyncedAt(new Date(result.lastUpdated));
      setRpcStatus("connected");
      setRpcErrorMessage(null);

      // Calculate automated portfolio value
      const val = await calculatePortfolioValue(address);
      setPortfolioValue(val);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Network unavailable";
      console.warn("Wallet Context RPC Balance Fetch Error:", errMsg);
      setRpcStatus("unavailable");
      setRpcErrorMessage(errMsg);
    } finally {
      isFetchingRef.current = false;
      setIsRefetching(false);
    }
  }, []);


  // Initial wallet load
  useEffect(() => {
    let isMounted = true;
    async function loadWallet() {
      if (user) {
        setLoading(true);
        const w = await walletService.getWallet(user.id);
        if (isMounted && w) {
          setWalletAddress(w.wallet_address);
          setWalletName(w.wallet_name || "Main Wallet");
          // Fetch initial balance
          fetchBalance(w.wallet_address);
        } else if (isMounted) {
          setLoading(false);
        }
        if (isMounted) {
          setLoading(false);
        }
      } else {
        if (isMounted) {
          setWalletAddress(null);
          setWalletName(null);
          setEthBalance(null);
          setEthBalanceWei(null);
          setLastSyncedAt(null);
          setRpcStatus("connecting");
          setLoading(false);
        }
      }
    }
    loadWallet();
    return () => {
      isMounted = false;
    };
  }, [user, fetchBalance]);

  // 30-second interval auto-refresh & foreground tab refresh
  useEffect(() => {
    if (!walletAddress) return;

    // 30s polling
    const interval = setInterval(() => {
      fetchBalance(walletAddress);
    }, 30000);

    // Foreground visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchBalance(walletAddress);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [walletAddress, fetchBalance]);

  const refetchBalance = useCallback(async () => {
    if (walletAddress) {
      await fetchBalance(walletAddress);
    }
  }, [walletAddress, fetchBalance]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        walletName,
        network: ARBITRUM_NETWORK,
        loading,
        ethBalance,
        ethBalanceWei,
        lastSyncedAt,
        rpcStatus,
        rpcErrorMessage,
        isRefetching,
        refetchBalance,
        portfolioValue,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
