import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Dumbbell, Target, Zap, Apple } from "lucide-react";
import appLogo from "@/assets/app-logo.png";

export default function Landing() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(signupEmail, signupPassword);
      
      if (error) {
        if (error.message.includes("rate limit") || error.message.includes("too many")) {
          toast.error("Too many signup attempts. Please wait a few minutes and try again.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Please check your email to verify your account!");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    }
    
    setIsLoading(false);
  };

  const features = [
    {
      icon: Target,
      title: "Posture Detection",
      description: "AI-powered posture analysis to help you stand tall",
      color: "text-neon-blue",
      bgColor: "bg-neon-blue/10",
      glowColor: "shadow-[0_8px_30px_-4px_hsl(var(--neon-blue)/0.5)]",
    },
    {
      icon: Dumbbell,
      title: "Custom Workouts",
      description: "Personalized exercise plans tailored to your goals",
      color: "text-neon-purple",
      bgColor: "bg-neon-purple/10",
      glowColor: "shadow-[0_8px_30px_-4px_hsl(var(--neon-purple)/0.5)]",
    },
    {
      icon: Apple,
      title: "Diet Planning",
      description: "Nutrition guidance based on your preferences",
      color: "text-neon-green",
      bgColor: "bg-neon-green/10",
      glowColor: "shadow-[0_8px_30px_-4px_hsl(var(--neon-green)/0.5)]",
    },
    {
      icon: Zap,
      title: "Daily Tasks",
      description: "Smart to-do lists to keep you on track",
      color: "text-neon-orange",
      bgColor: "bg-neon-orange/10",
      glowColor: "shadow-[0_8px_30px_-4px_hsl(var(--neon-orange)/0.5)]",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
                <img src={appLogo} alt="PosFitx Logo" className="h-5 w-5" />
                <span className="text-sm text-muted-foreground">Your AI-Powered Fitness Partner</span>
              </div>

              <div>
                <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
                  Restart your{" "}
                  <span className="gradient-text">Lifestyle</span>
                </h1>
                <p className="text-xl md:text-2xl font-display font-medium text-muted-foreground mt-2">
                  with Smart AI specialized on Health
                </p>
              </div>

              <p className="text-lg text-muted-foreground max-w-lg">
                PosFitx combines AI-powered posture detection, personalized workout plans, 
                and smart nutrition guidance to help you achieve your fitness goals.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className={`relative flex items-start gap-3 p-4 rounded-lg glass hover:scale-[1.02] transition-all duration-300 ${feature.glowColor}`}
                  >
                    <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Auth Form */}
            <div className="lg:pl-12">
              <Card className="glass border-border/50">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-fit">
                    <img src={appLogo} alt="Sci-Fit-X Logo" className="h-14 w-14" />
                  </div>
                  <CardTitle className="text-2xl font-display">Sci-Fit-X</CardTitle>
                  <CardDescription>Start your fitness journey today</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password">Password</Label>
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup">
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-confirm">Confirm Password</Label>
                          <Input
                            id="signup-confirm"
                            type="password"
                            placeholder="••••••••"
                            value={signupConfirmPassword}
                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="text-center text-xs text-muted-foreground">
                  <p className="w-full">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
