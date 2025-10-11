import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user has admin role
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .single();
        
        if (roles) {
          navigate("/admin/dashboard");
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`
        }
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Account created! Please contact admin to get admin privileges.");
        setIsSignUp(false);
        setPassword("");
      }
    } catch (error: any) {
      toast.error(error.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        // Check if user has admin role
        const { data: roles, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .eq("role", "admin")
          .single();

        if (roleError || !roles) {
          await supabase.auth.signOut();
          toast.error("Access denied. Admin privileges required.");
          return;
        }

        toast.success("Login successful!");
        navigate("/admin/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card border-border">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
            <ShieldCheck className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isSignUp ? "Admin Sign Up" : "Admin Login"}
          </h1>
          <p className="text-muted-foreground">Product Management Dashboard</p>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-muted border-border text-foreground"
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-muted border-border text-foreground"
              placeholder="Enter password"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan transition-smooth font-semibold"
          >
            {loading ? (isSignUp ? "Creating Account..." : "Logging in...") : (isSignUp ? "Sign Up" : "Login")}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:text-primary/80"
          >
            {isSignUp ? "Already have an account? Login" : "Need an account? Sign Up"}
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Shop
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
