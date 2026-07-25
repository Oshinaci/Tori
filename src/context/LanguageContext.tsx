import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type LanguageCode = "en" | "id" | "es" | "ja" | "zh";

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English (US)", flag: "🇺🇸" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "Mandarin", nativeName: "中文 (简体)", flag: "🇨🇳" },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    welcomeTitle: "Crypto as Easy as GoPay",
    welcomeSubtitle:
      "Everyday self-custody crypto wallet. Fast, ultra-secure, and beautifully simple.",
    login: "Log In",
    createAccount: "Create Account",
    settings: "Settings",
    security: "Security & Keys",
    preferences: "Preferences",
    language: "Language",
    signOut: "Sign out",
    portfolio: "Portfolio",
    watchlist: "Watchlist",
    market: "Market",
    wallet: "Wallet",
    activityAlerts: "Activity & Alerts",
    tradeSoon: "Trade (Soon)",
    send: "Send",
    receive: "Receive",
    swap: "Swap",
    buyCrypto: "Buy",
    selectLanguage: "Select Language",
    close: "Close",
    quickActions: "Quick Actions",
    recentActivity: "Recent Activity",
    seeAll: "See All",
    totalBalance: "Total Balance",
    assets: "Assets",
    marketOverview: "Market Overview",
    searchAssets: "Search assets...",
    price: "Price",
    change24h: "24h Change",
    marketCap: "Market Cap",
    noTransactions: "No transactions yet",
    comingSoon: "Coming Soon",
    mainWallet: "Main Wallet",
    home: "Home",
    securityPin: "Security PIN",
    changePin: "Change PIN",
    changePassword: "Change Password",
    revealRecoveryPhrase: "Reveal Recovery Phrase",
    exportPrivateKey: "Export Private Key",
    deleteWallet: "Delete Wallet",
    networks: "Networks",
    copied: "Copied",
    copy: "Copy",
    shareAddress: "Share Address",
    recentReceives: "Recent Receives",
    noIncomingTransactions: "No incoming transactions.",
    warningArbitrumOnly:
      "Only send assets on the Arbitrum One network. Sending assets from unsupported networks may permanently lose your funds.",
    activity: "Activity",
    todaysChange: "Today's Change",
    totalPortfolio: "Total Portfolio",
    notifications: "Notifications",
    all: "All",
    sent: "Sent",
    received: "Received",
    swapped: "Swapped",
    bought: "Bought",
  },
  id: {
    welcomeTitle: "Kripto Se-mudah GoPay",
    welcomeSubtitle: "Dompet kripto self-custody harian. Cepat, sangat aman, dan elegan.",
    login: "Masuk",
    createAccount: "Buat Akun",
    settings: "Pengaturan",
    security: "Keamanan & Kunci",
    preferences: "Preferensi",
    language: "Bahasa",
    signOut: "Keluar",
    portfolio: "Portofolio",
    watchlist: "Daftar Pantau",
    market: "Pasar",
    wallet: "Dompet",
    activityAlerts: "Aktivitas & Notifikasi",
    tradeSoon: "Perdagangan (Segera)",
    send: "Kirim",
    receive: "Terima",
    swap: "Tukar",
    buyCrypto: "Beli",
    selectLanguage: "Pilih Bahasa",
    close: "Tutup",
    quickActions: "Aksi Cepat",
    recentActivity: "Aktivitas Terbaru",
    seeAll: "Lihat Semua",
    totalBalance: "Saldo Total",
    assets: "Aset",
    marketOverview: "Ringkasan Pasar",
    searchAssets: "Cari aset...",
    price: "Harga",
    change24h: "Perubahan 24j",
    marketCap: "Kap Pasar",
    noTransactions: "Belum ada transaksi",
    comingSoon: "Segera Hadir",
    mainWallet: "Dompet Utama",
    home: "Beranda",
    securityPin: "PIN Keamanan",
    changePin: "Ubah PIN",
    changePassword: "Ubah Kata Sandi",
    revealRecoveryPhrase: "Tampilkan Frasa Pemulihan",
    exportPrivateKey: "Ekspor Kunci Privat",
    deleteWallet: "Hapus Dompet",
    networks: "Jaringan",
    copied: "Disalin",
    copy: "Salin",
    shareAddress: "Bagikan Alamat",
    recentReceives: "Penerimaan Terbaru",
    noIncomingTransactions: "Belum ada transaksi masuk.",
    warningArbitrumOnly:
      "Hanya kirim aset pada jaringan Arbitrum One. Mengirim aset dari jaringan yang tidak didukung dapat menyebabkan kehilangan dana secara permanen.",
    activity: "Aktivitas",
    todaysChange: "Perubahan Hari Ini",
    totalPortfolio: "Total Portofolio",
    notifications: "Notifikasi",
    all: "Semua",
    sent: "Terkirim",
    received: "Diterima",
    swapped: "Ditukar",
    bought: "Dibeli",
  },
  es: {
    welcomeTitle: "Cripto tan Fácil como GoPay",
    welcomeSubtitle: "La billetera cripto cotidiana. Rápida, ultra segura y hermosamente simple.",
    login: "Iniciar Sesión",
    createAccount: "Crear Cuenta",
    settings: "Ajustes",
    security: "Seguridad y Claves",
    preferences: "Preferences",
    language: "Idioma",
    signOut: "Cerrar Sesión",
    portfolio: "Portafolio",
    watchlist: "Lista de Seguimiento",
    market: "Mercado",
    wallet: "Billetera",
    activityAlerts: "Actividad y Alertas",
    tradeSoon: "Comercio (Próximamente)",
    send: "Enviar",
    receive: "Recibir",
    swap: "Intercambiar",
    buyCrypto: "Comprar",
    selectLanguage: "Seleccionar Idioma",
    close: "Cerrar",
    quickActions: "Acciones Rápida",
    recentActivity: "Actividad Reciente",
    seeAll: "Ver Todo",
    totalBalance: "Balance Total",
    assets: "Activos",
    marketOverview: "Resumen del Mercado",
    searchAssets: "Buscar activos...",
    price: "Precio",
    change24h: "Cambio 24h",
    marketCap: "Cap. de Mercado",
    noTransactions: "No hay transacciones",
    comingSoon: "Próximamente",
    mainWallet: "Billetera Principal",
    home: "Inicio",
    securityPin: "PIN de Seguridad",
    changePin: "Cambiar PIN",
    changePassword: "Cambiar Contraseña",
    revealRecoveryPhrase: "Revelar Frase de Recuperación",
    exportPrivateKey: "Exportar Clave Privada",
    deleteWallet: "Eliminar Billetera",
    networks: "Redes",
    copied: "Copiado",
    copy: "Copiar",
    shareAddress: "Compartir Dirección",
    recentReceives: "Recepciones Recientes",
    noIncomingTransactions: "No hay transacciones entrantes.",
    warningArbitrumOnly:
      "Solo envíe activos en la red Arbitrum One. Enviar activos desde redes no compatibles puede resultar en la pérdida permanente de sus fondos.",
    activity: "Actividad",
    todaysChange: "Cambio de Hoy",
    totalPortfolio: "Portafolio Total",
    notifications: "Notificaciones",
    all: "Todo",
    sent: "Enviado",
    received: "Recibido",
    swapped: "Intercambiado",
    bought: "Comprado",
  },
  ja: {
    welcomeTitle: "GoPayのように簡単な暗号資産",
    welcomeSubtitle: "毎日のセルフカストディ暗号ウォレット。高速、超安全、非常にシンプル。",
    login: "ログイン",
    createAccount: "アカウント作成",
    settings: "設定",
    security: "セキュリティとキー",
    preferences: "環境設定",
    language: "言語",
    signOut: "サインアウト",
    portfolio: "ポートフォリオ",
    watchlist: "ウォッチリスト",
    market: "マーケット",
    wallet: "ウォレット",
    activityAlerts: "アクティビティとアラート",
    tradeSoon: "トレード (近日公開)",
    send: "送信",
    receive: "受取る",
    swap: "スワップ",
    buyCrypto: "購入",
    selectLanguage: "言語を選択",
    close: "閉じる",
    quickActions: "クイックアクション",
    recentActivity: "最近のアクティビティ",
    seeAll: "すべて見る",
    totalBalance: "総残高",
    assets: "資産",
    marketOverview: "マーケット概要",
    searchAssets: "資産を検索...",
    price: "価格",
    change24h: "24時間変動",
    marketCap: "時価総額",
    noTransactions: "トランザクションはありません",
    comingSoon: "近日公開",
    mainWallet: "メインウォレット",
    home: "ホーム",
    securityPin: "セキュリティPIN",
    changePin: "PINを変更",
    changePassword: "パスワードを変更",
    revealRecoveryPhrase: "リカバリーフレーズを表示",
    exportPrivateKey: "秘密鍵をエクスポート",
    deleteWallet: "ウォレットを削除",
    networks: "ネットワーク",
    copied: "コピーされました",
    copy: "コピー",
    shareAddress: "アドレスを共有",
    recentReceives: "最近の受信",
    noIncomingTransactions: "入金履歴はありません。",
    warningArbitrumOnly:
      "Arbitrum Oneネットワーク上の資産のみを送信してください。サポートされていないネットワークから資産を送信すると、資金が永久に失われる可能性があります。",
    activity: "アクティビティ",
    todaysChange: "今日の変動",
    totalPortfolio: "総ポートフォリオ",
    notifications: "通知",
    all: "すべて",
    sent: "送信済み",
    received: "受信済み",
    swapped: "スワップ済み",
    bought: "購入済み",
  },
  zh: {
    welcomeTitle: "像GoPay一样简单的加密货币",
    welcomeSubtitle: "日常自托管加密钱包。快速、超级安全且极其简单。",
    login: "登录",
    createAccount: "创建账户",
    settings: "设置",
    security: "安全与密钥",
    preferences: "偏好设置",
    language: "语言",
    signOut: "登出",
    portfolio: "投资组合",
    watchlist: "自选列表",
    market: "市场",
    wallet: "钱包",
    activityAlerts: "活动与警报",
    tradeSoon: "交易 (即将推出)",
    send: "发送",
    receive: "接收",
    swap: "兑换",
    buyCrypto: "购买",
    selectLanguage: "选择语言",
    close: "关闭",
    quickActions: "快捷操作",
    recentActivity: "最近活动",
    seeAll: "查看全部",
    totalBalance: "总余额",
    assets: "资产",
    marketOverview: "市场概览",
    searchAssets: "搜索资产...",
    price: "价格",
    change24h: "24小时涨跌",
    marketCap: "市值",
    noTransactions: "暂无交易",
    comingSoon: "即将推出",
    mainWallet: "主钱包",
    home: "主页",
    securityPin: "安全密码",
    changePin: "修改密码",
    changePassword: "修改登录密码",
    revealRecoveryPhrase: "显示助记词",
    exportPrivateKey: "导出私钥",
    deleteWallet: "删除钱包",
    networks: "网络列表",
    copied: "已复制",
    copy: "复制",
    shareAddress: "分享地址",
    recentReceives: "最近接收",
    noIncomingTransactions: "暂无充值记录。",
    warningArbitrumOnly:
      "仅发送 Arbitrum One 网络上的资产。从不支持的网络发送资产可能会永久丢失您的资金。",
    activity: "交易动态",
    todaysChange: "今日涨跌",
    totalPortfolio: "总资产估值",
    notifications: "消息通知",
    all: "全部",
    sent: "已发送",
    received: "已接收",
    swapped: "已兑换",
    bought: "已购买",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguageCode: (code: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_STORAGE_KEY = "tori_app_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [langCode, setLangCode] = useState<LanguageCode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LANG_STORAGE_KEY) as LanguageCode;
      if (saved && LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    }
    return "en";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LANG_STORAGE_KEY, langCode);
    }
  }, [langCode]);

  const currentLang = LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[0];

  const t = (key: string, fallback?: string) => {
    return TRANSLATIONS[langCode]?.[key] || fallback || TRANSLATIONS.en?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language: currentLang, setLanguageCode: setLangCode, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
