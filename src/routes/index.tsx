import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { Features } from "@/components/landing/Features";
import { WalletPreview } from "@/components/landing/WalletPreview";
import { Security } from "@/components/landing/Security";
import { Ecosystem } from "@/components/landing/Ecosystem";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { useAuth } from "@/context/AuthContext";
import { AuthLoading } from "@/components/auth/AuthLoading";
import { handleSilentTokenVerification } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [processingAuth, setProcessingAuth] = useState(false);

  useEffect(() => {
    async function checkCallbackAndAuth() {
      if (typeof window === "undefined") return;

      const hash = window.location.hash;
      const search = window.location.search;

      const hasAuthParams =
        hash.includes("access_token") ||
        hash.includes("error") ||
        search.includes("code=") ||
        search.includes("token_hash=");

      if (hasAuthParams) {
        setProcessingAuth(true);
        const result = await handleSilentTokenVerification();
        setTimeout(() => {
          if (result.session || user) {
            navigate({ to: "/app" });
          } else {
            navigate({ to: "/auth/login" });
          }
        }, 1000);
        return;
      }

      if (!loading && user) {
        navigate({ to: "/app" });
      }
    }

    checkCallbackAndAuth();
  }, [user, loading, navigate]);

  const hasAuthParams =
    typeof window !== "undefined" &&
    (window.location.hash.includes("access_token") ||
      window.location.hash.includes("error") ||
      window.location.search.includes("code=") ||
      window.location.search.includes("token_hash="));

  if (loading || user || processingAuth || hasAuthParams) {
    return <AuthLoading message="Authenticating session..." />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <WalletPreview />
        <Security />
        <Ecosystem />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
