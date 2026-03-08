import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Target,
  Calendar,
  LineChart,
  User,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/posture", label: "Posture", icon: Target },
  { href: "/plans", label: "Plans", icon: Calendar },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/profile", label: "Profile", icon: User },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn("flex gap-1", mobile ? "flex-col" : "items-center")}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => mobile && setMobileOpen(false)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className={cn(mobile ? "text-base" : "text-sm")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-1.5">
              {/* Triangular container for logo */}
              <div className="relative flex items-center justify-center" style={{
                width: '40px',
                height: '40px',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                background: 'linear-gradient(180deg, hsl(187 100% 50% / 0.2) 0%, hsl(187 100% 50% / 0.08) 100%)',
                filter: 'drop-shadow(0 0 8px hsl(187 100% 50% / 0.3))',
              }}>
                <img src="/app-logo.png" alt="PosFitx" className="h-7 w-7 mt-2.5 object-contain" style={{
                  filter: 'drop-shadow(0 0 4px hsl(187 100% 50% / 0.5))',
                }} />
              </div>
              {/* Curved backbone text using SVG path */}
              <svg className="hidden sm:block" width="110" height="40" viewBox="0 0 110 40" style={{
                filter: 'drop-shadow(0 0 6px hsl(187 100% 50% / 0.4))',
              }}>
                <defs>
                  <path id="spineCurve" d="M 2 35 C 15 8, 35 2, 55 6 S 95 18, 108 8" fill="none" />
                  <linearGradient id="spineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(187 100% 70%)" />
                    <stop offset="30%" stopColor="hsl(187 100% 50%)" />
                    <stop offset="70%" stopColor="hsl(187 100% 35%)" />
                    <stop offset="100%" stopColor="hsl(190 60% 25%)" />
                  </linearGradient>
                </defs>
                <text fill="url(#spineGrad)" fontFamily="'Space Grotesk', system-ui, sans-serif" fontWeight="700" fontSize="16" letterSpacing="3" textAnchor="start">
                  <textPath href="#spineCurve" startOffset="0%">
                    P●S᛫Fi᛫t◦x
                  </textPath>
                </text>
                {/* Vertebrae dots along the curve */}
                <circle cx="8" cy="32" r="1" fill="hsl(187 100% 50% / 0.3)" />
                <circle cx="25" cy="14" r="0.8" fill="hsl(187 100% 50% / 0.25)" />
                <circle cx="45" cy="6" r="0.7" fill="hsl(187 100% 50% / 0.2)" />
                <circle cx="70" cy="10" r="0.8" fill="hsl(187 100% 50% / 0.25)" />
                <circle cx="90" cy="14" r="0.7" fill="hsl(187 100% 50% / 0.2)" />
              </svg>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <NavLinks />
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border-2 border-primary/20">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-medium truncate">{profile?.full_name || "User"}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex items-center gap-1.5 mb-8">
                    <div className="relative flex items-center justify-center" style={{
                      width: '36px',
                      height: '36px',
                      clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                      background: 'linear-gradient(180deg, hsl(187 100% 50% / 0.2) 0%, hsl(187 100% 50% / 0.08) 100%)',
                      filter: 'drop-shadow(0 0 8px hsl(187 100% 50% / 0.3))',
                    }}>
                      <img src="/app-logo.png" alt="PosFitx" className="h-6 w-6 mt-2 object-contain" style={{
                        filter: 'drop-shadow(0 0 4px hsl(187 100% 50% / 0.5))',
                      }} />
                    </div>
                    <svg width="100" height="36" viewBox="0 0 110 40" style={{
                      filter: 'drop-shadow(0 0 6px hsl(187 100% 50% / 0.4))',
                    }}>
                      <use href="#spineCurve" />
                      <use href="#spineGrad" />
                      <text fill="url(#spineGrad)" fontFamily="'Space Grotesk', system-ui, sans-serif" fontWeight="700" fontSize="16" letterSpacing="3" textAnchor="start">
                        <textPath href="#spineCurve" startOffset="0%">
                          P●S᛫Fi᛫t◦x
                        </textPath>
                      </text>
                    </svg>
                  </div>
                  <NavLinks mobile />
                  <div className="absolute bottom-8 left-6 right-6">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        handleSignOut();
                        setMobileOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
