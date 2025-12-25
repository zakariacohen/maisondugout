import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import logo from "@/assets/logo.jpg";

type AuthMode = 'login' | 'signup' | 'forgot';

const Auth = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Chercher l'email correspondant au username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', username.trim())
        .single();

      if (profileError || !profileData) {
        setIsLoading(false);
        toast.error("Nom d'utilisateur incorrect");
        return;
      }

      // Se connecter avec l'email trouvé
      const { error } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password,
      });

      if (error) {
        setIsLoading(false);
        toast.error("Mot de passe incorrect");
        return;
      }

      toast.success("Connexion réussie");
      navigate("/admin");
    } catch (error) {
      console.error("Erreur de connexion:", error);
      toast.error("Erreur de connexion");
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Vérifier si le username existe déjà
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.trim())
        .single();

      if (existingProfile) {
        setIsLoading(false);
        toast.error("Ce nom d'utilisateur existe déjà");
        return;
      }

      // Créer le compte
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: username.trim()
          }
        }
      });

      if (error) {
        setIsLoading(false);
        if (error.message.includes("already registered")) {
          toast.error("Cet email est déjà utilisé");
        } else {
          toast.error("Erreur lors de l'inscription");
        }
        return;
      }

      toast.success("Compte créé avec succès!");
      navigate("/admin");
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      toast.error("Erreur lors de l'inscription");
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error("Erreur lors de l'envoi de l'email");
        console.error("Forgot password error:", error);
        return;
      }

      toast.success("Email de réinitialisation envoyé! Vérifiez votre boîte mail.");
      setMode('login');
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={logo} 
              alt="Maison du Goût" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-serif font-bold text-primary">
            Maison du Goût
          </CardTitle>
          <CardDescription>
            {mode === 'signup' && "Créer un nouveau compte admin"}
            {mode === 'login' && "Connectez-vous pour accéder à la gestion des commandes"}
            {mode === 'forgot' && "Entrez votre email pour réinitialiser votre mot de passe"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'forgot' ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@maisondugout.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-sm text-primary hover:underline"
                  disabled={isLoading}
                >
                  Retour à la connexion
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={mode === 'signup' ? handleSignUp : handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="maisondugout"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@maisondugout.ma"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete={mode === 'signup' ? "new-password" : "current-password"}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading 
                    ? (mode === 'signup' ? "Création..." : "Connexion...") 
                    : (mode === 'signup' ? "Créer le compte" : "Se connecter")
                  }
                </Button>
              </form>
              <div className="mt-4 text-center space-y-2">
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm text-muted-foreground hover:underline block w-full"
                    disabled={isLoading}
                  >
                    Mot de passe oublié ?
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                  className="text-sm text-primary hover:underline"
                  disabled={isLoading}
                >
                  {mode === 'signup' ? "Déjà un compte ? Se connecter" : "Créer un nouveau compte"}
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
