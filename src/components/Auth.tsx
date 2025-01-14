import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        onClose();
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-center">Bem-vindo ao BibleGuide</CardTitle>
          </CardHeader>
          <CardContent>
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