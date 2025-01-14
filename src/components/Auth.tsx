import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthError } from "@supabase/supabase-js";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        // Limpa qualquer erro quando o usuário faz login com sucesso
        setError(null);
        onClose();
        navigate('/');
      } else if (event === 'SIGNED_OUT') {
        // Limpa o localStorage quando o usuário faz logout
        localStorage.removeItem('supabase.auth.token');
        setError(null);
      } else if (event === 'TOKEN_REFRESHED') {
        // Limpa erros quando o token é atualizado com sucesso
        setError(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, onClose]);

  const handleError = (error: AuthError) => {
    console.error('Auth error:', error);
    if (error.message.includes('refresh_token_not_found')) {
      setError('Sessão expirada. Por favor, faça login novamente.');
      // Limpa tokens antigos
      localStorage.removeItem('supabase.auth.token');
    } else {
      setError(error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-center">Bem-vindo ao BibleGuide</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#556B2F',
                      brandAccent: '#8B8B2B',
                    },
                  },
                },
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email',
                    password_label: 'Senha',
                    button_label: 'Entrar',
                    loading_button_label: 'Entrando...',
                    social_provider_text: 'Entrar com {{provider}}',
                    link_text: 'Já tem uma conta? Entre',
                  },
                  sign_up: {
                    email_label: 'Email',
                    password_label: 'Senha',
                    button_label: 'Criar conta',
                    loading_button_label: 'Criando conta...',
                    social_provider_text: 'Criar conta com {{provider}}',
                    link_text: 'Não tem uma conta? Cadastre-se',
                  },
                  magic_link: {
                    button_label: 'Enviar link mágico',
                    loading_button_label: 'Enviando link...',
                  },
                },
              }}
              theme="light"
              providers={[]}
            />
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;