import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Sparkles } from "lucide-react";
import appLogo from "@/assets/app-logo.png";

/**
 * @page Index
 * @description Smart entry point for the application. 
 * Handles authentication routing and provides a premium loading experience.
 */
const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/landing", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {/* Premium Loading State */}
      <div className="relative group stagger-children">
        {/* Animated Background Glow */}
        <div className="absolute -inset-8 bg-primary/20 rounded-full blur-3xl animate-pulse group-hover:bg-primary/30 transition-all duration-1000" />
        
        <div className="relative flex flex-col items-center">
          <div className="mb-8 relative">
            <img 
              src={appLogo} 
              alt="PosFitx Logo" 
              className="h-24 w-24 relative z-10 drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" 
            />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-ping opacity-40" />
          </div>
          
          <h1 className="text-4xl font-display font-black tracking-tighter mb-2 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            POSFITX
          </h1>
          
          <div className="flex items-center gap-3 text-muted-foreground font-medium">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="animate-pulse">Initializing AI Health Engine...</span>
          </div>
        </div>
      </div>
      
      {/* Minimal Footer */}
      <div className="absolute bottom-12 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold">
        Secure Biotech Architecture v1.0
      </div>
    </div>
  );
};

export default Index;
