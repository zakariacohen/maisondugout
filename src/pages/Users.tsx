import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { UserPlus, Users as UsersIcon, Loader2 } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

const Users = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  const fetchProfiles = async () => {
    setIsLoadingProfiles(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching profiles:", error);
    } else {
      setProfiles(data || []);
    }
    setIsLoadingProfiles(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Vous devez être connecté");
        setIsLoading(false);
        return;
      }

      const response = await supabase.functions.invoke("create-user", {
        body: { username: username.trim(), email: email.trim(), password },
      });

      if (response.error) {
        toast.error(response.error.message || "Erreur lors de la création");
        setIsLoading(false);
        return;
      }

      if (response.data?.error) {
        toast.error(response.data.error);
        setIsLoading(false);
        return;
      }

      toast.success("Utilisateur créé avec succès");
      setUsername("");
      setEmail("");
      setPassword("");
      fetchProfiles();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Erreur lors de la création de l'utilisateur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Créer un utilisateur
          </CardTitle>
          <CardDescription>
            Ajouter un nouvel administrateur au système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-username">Nom d'utilisateur</Label>
                <Input
                  id="new-username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Créer l'utilisateur
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5" />
            Utilisateurs ({profiles.length})
          </CardTitle>
          <CardDescription>
            Liste des utilisateurs du système
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingProfiles ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : profiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun utilisateur trouvé
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom d'utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date de création</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.username}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      {new Date(profile.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
