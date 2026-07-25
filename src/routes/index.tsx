import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
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

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/app" });
    }
  }, [user, loading, navigate]);

  if (loading || user) {
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
