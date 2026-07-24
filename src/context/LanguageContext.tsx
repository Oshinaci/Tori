import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type LanguageCode = "en" | "id" | "es";

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
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    welcomeTitle: "Crypto as Easy as GoPay",
    welcomeSubtitle:
      "Everyday self-custody crypto wallet. Fast, ultra-secure, and beautifully simple.",
    login: "Log In",
    createAccount: "Create Account",
    settings: "Settings",
    security: "Security",
    preferences: "Preferences",
    language: "Language",
    signOut: "Sign out",
    portfolio: "Portfolio",
    watchlist: "Watchlist",
    market: "Market",
    wallet: "Wallet",
    activityAlerts: "Activity & Alerts",
    tradeSoon: "Trade (Soon)",
  },
  id: {
    welcomeTitle: "Kripto Se-mudah GoPay",
    welcomeSubtitle: "Dompet kripto self-custody harian. Cepat, sangat aman, dan elegan.",
    login: "Masuk",
    createAccount: "Buat Akun",
    settings: "Pengaturan",
    security: "Keamanan",
    preferences: "Preferensi",
    language: "Bahasa",
    signOut: "Keluar",
    portfolio: "Portofolio",
    watchlist: "Daftar Pantau",
    market: "Pasar",
    wallet: "Dompet",
    activityAlerts: "Aktivitas & Notifikasi",
    tradeSoon: "Perdagangan (Segera)",
  },
  es: {
    welcomeTitle: "Cripto tan Fácil como GoPay",
    welcomeSubtitle: "La billetera cripto cotidiana. Rápida, ultra segura y hermosamente simple.",
    login: "Iniciar Sesión",
    createAccount: "Crear Cuenta",
    settings: "Ajustes",
    security: "Seguridad",
    preferences: "Preferencias",
    language: "Idioma",
    signOut: "Cerrar Sesión",
    portfolio: "Portafolio",
    watchlist: "Lista de Seguimiento",
    market: "Mercado",
    wallet: "Billetera",
    activityAlerts: "Actividad y Alertas",
    tradeSoon: "Comercio (Próximamente)",
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
