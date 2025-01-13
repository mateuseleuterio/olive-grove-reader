import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar o perfil.",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-serif text-bible-navy mb-8">Meu Perfil</h1>
      <form onSubmit={updateProfile} className="space-y-6">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium mb-2">
            Nome Completo
          </label>
          <Input
            id="full_name"
            value={profile?.full_name || ""}
            onChange={(e) => setProfile(profile ? { ...profile, full_name: e.target.value } : null)}
          />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2">
            Nome de Usuário
          </label>
          <Input
            id="username"
            value={profile?.username || ""}
            onChange={(e) => setProfile(profile ? { ...profile, username: e.target.value } : null)}
          />
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-2">
            Biografia
          </label>
          <Textarea
            id="bio"
            value={profile?.bio || ""}
            onChange={(e) => setProfile(profile ? { ...profile, bio: e.target.value } : null)}
          />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-2">
            Website
          </label>
          <Input
            id="website"
            type="url"
            value={profile?.website || ""}
            onChange={(e) => setProfile(profile ? { ...profile, website: e.target.value } : null)}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={profile?.email || ""}
            onChange={(e) => setProfile(profile ? { ...profile, email: e.target.value } : null)}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Telefone
          </label>
          <Input
            id="phone"
            type="tel"
            value={profile?.phone || ""}
            onChange={(e) => setProfile(profile ? { ...profile, phone: e.target.value } : null)}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
        </Button>
      </form>
    </div>
  );
};

export default Profile;