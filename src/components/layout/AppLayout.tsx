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
            <Link to="/dashboard" className="flex items-center gap-2">
              {/* Solid background logo container */}
              <div className="relative flex items-center justify-center rounded-lg overflow-hidden" style={{
                width: '44px',
                height: '44px',
                background: 'hsl(220 22% 7%)',
                border: '1.5px solid hsl(187 100% 50% / 0.25)',
                boxShadow: '0 0 12px hsl(187 100% 50% / 0.15)',
              }}>
                <img src="/app-logo.png" alt="PosFitx" className="w-full h-full object-cover" style={{
                  filter: 'drop-shadow(0 0 4px hsl(187 100% 50% / 0.5))',
                }} />
              </div>
              {/* Backbone text - small wavy xray bone curve */}
              <svg className="hidden sm:block" width="90" height="28" viewBox="0 0 90 28" style={{
                filter: 'drop-shadow(0 0 5px hsl(187 100% 50% / 0.3))',
              }}>
                <defs>
                  <path id="spineCurve" d="M 2 20 C 12 10, 22 10, 32 16 S 52 22, 62 14 S 78 8, 88 12" fill="none" />
                  <linearGradient id="spineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(187 100% 65%)" />
                    <stop offset="40%" stopColor="hsl(187 100% 50%)" />
                    <stop offset="100%" stopColor="hsl(190 80% 40%)" />
                  </linearGradient>
                </defs>
                {/* Xray bone silhouette - two subtle parallel wavy lines */}
                <path d="M 2 21 C 12 11, 22 11, 32 17 S 52 23, 62 15 S 78 9, 88 13" fill="none" stroke="hsl(215 15% 28%)" strokeWidth="8" strokeLinecap="round" opacity="0.2" />
                <path d="M 2 19 C 12 9, 22 9, 32 15 S 52 21, 62 13 S 78 7, 88 11" fill="none" stroke="hsl(215 15% 22%)" strokeWidth="3" strokeLinecap="round" opacity="0.15" />
                {/* Text along bone curve */}
                <text fill="url(#spineGrad)" fontFamily="'Work Sans', system-ui, sans-serif" fontWeight="700" fontSize="13" letterSpacing="2" textAnchor="start">
                  <textPath href="#spineCurve" startOffset="0%">
                    PosFitx
                  </textPath>
                </text>
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
                  <div className="flex items-center gap-1 mb-8">
                    <div className="relative flex items-center justify-center rounded-lg overflow-hidden" style={{
                      width: '40px',
                      height: '40px',
                      background: 'hsl(220 22% 7%)',
                      border: '1.5px solid hsl(187 100% 50% / 0.25)',
                      boxShadow: '0 0 12px hsl(187 100% 50% / 0.15)',
                    }}>
                      <img src="/app-logo.png" alt="PosFitx" className="w-full h-full object-cover" style={{
                        filter: 'drop-shadow(0 0 4px hsl(187 100% 50% / 0.5))',
                      }} />
                    </div>
                    <svg width="80" height="26" viewBox="0 0 90 28" style={{
                      filter: 'drop-shadow(0 0 5px hsl(187 100% 50% / 0.3))',
                    }}>
                      <path d="M 2 21 C 12 11, 22 11, 32 17 S 52 23, 62 15 S 78 9, 88 13" fill="none" stroke="hsl(215 15% 28%)" strokeWidth="8" strokeLinecap="round" opacity="0.2" />
                      <path d="M 2 19 C 12 9, 22 9, 32 15 S 52 21, 62 13 S 78 7, 88 11" fill="none" stroke="hsl(215 15% 22%)" strokeWidth="3" strokeLinecap="round" opacity="0.15" />
                      <text fill="url(#spineGrad)" fontFamily="'Work Sans', system-ui, sans-serif" fontWeight="700" fontSize="13" letterSpacing="2" textAnchor="start">
                        <textPath href="#spineCurve" startOffset="0%">
                          PosFitx
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
