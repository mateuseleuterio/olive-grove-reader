import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  updated_at: string;
}

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar perfil",
        description: "Não foi possível carregar suas informações."
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !profile) return;

      const updates = {
        id: session.user.id,
        full_name: profile.full_name,
        bio: profile.bio,
        website: profile.website,
        location: profile.location,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso!"
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: "Não foi possível salvar suas alterações."
      });
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você precisa selecionar uma imagem para fazer upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: profile?.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      setProfile(profile => profile ? { ...profile, avatar_url: publicUrl } : null);
      
      toast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso!"
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Não foi possível fazer upload da imagem."
      });
    } finally {
      setUploading(false);
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
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Seu Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateProfile} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback>{profile?.full_name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  disabled={uploading}
                  className="hidden"
                  id="avatar"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('avatar')?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Enviando...' : 'Alterar foto'}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="text-sm font-medium">
                  Nome completo
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile(profile => profile ? { ...profile, full_name: e.target.value } : null)}
                />
              </div>

              <div>
                <label htmlFor="bio" className="text-sm font-medium">
                  Biografia
                </label>
                <Textarea
                  id="bio"
                  value={profile?.bio || ''}
                  onChange={(e) => setProfile(profile => profile ? { ...profile, bio: e.target.value } : null)}
                  rows={4}
                />
              </div>

              <div>
                <label htmlFor="website" className="text-sm font-medium">
                  Website
                </label>
                <Input
                  id="website"
                  type="url"
                  value={profile?.website || ''}
                  onChange={(e) => setProfile(profile => profile ? { ...profile, website: e.target.value } : null)}
                />
              </div>

              <div>
                <label htmlFor="location" className="text-sm font-medium">
                  Localização
                </label>
                <Input
                  id="location"
                  type="text"
                  value={profile?.location || ''}
                  onChange={(e) => setProfile(profile => profile ? { ...profile, location: e.target.value } : null)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Salvar alterações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;