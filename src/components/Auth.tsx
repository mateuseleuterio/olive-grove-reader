import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError } from "@supabase/supabase-js";
import { BookOpen } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("Session found, checking profile");
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setErrorMessage("Erro ao carregar perfil. Por favor, tente novamente.");
            return;
          }

          if (profile) {
            console.log("Profile found, closing modal");
            setErrorMessage("");
            onClose();
            navigate("/");
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setErrorMessage("Erro ao verificar sessão. Por favor, tente novamente.");
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === "SIGNED_IN" && session) {
        try {
          console.log("User signed in, checking profile");
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setErrorMessage("Erro ao carregar perfil. Por favor, tente novamente.");
            return;
          }

          if (profile) {
            console.log("Profile found, redirecting");
            setErrorMessage("");
            onClose();
            navigate("/");
          }
        } catch (error) {
          console.error('Error handling sign in:', error);
          setErrorMessage("Erro ao processar login. Por favor, tente novamente.");
        }
      }
      if (event === "SIGNED_OUT") {
        console.log("User signed out");
        setErrorMessage("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, onClose]);

  const getErrorMessage = (error: AuthError) => {
    switch (error.message) {
      case "Invalid login credentials":
        return "Credenciais inválidas. Por favor, verifique seu email e senha.";
      case "Email not confirmed":
        return "Por favor, confirme seu email antes de fazer login.";
      default:
        return error.message;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-bible-gray">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-bible-navy/10">
            <BookOpen className="h-8 w-8 text-bible-navy" />
          </div>
          <DialogTitle className="text-2xl font-serif text-bible-navy">Bem-vindo</DialogTitle>
          <DialogDescription className="text-bible-text">
            Faça login ou crie uma conta para acessar todos os recursos.
          </DialogDescription>
        </DialogHeader>
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#556B2F",
                  brandAccent: "#8B8B2B",
                  brandButtonText: "white",
                  defaultButtonBackground: "#FFFDF0",
                  defaultButtonBackgroundHover: "#F5F3E6",
                  inputBackground: "white",
                  inputBorder: "#E2E8F0",
                  inputBorderHover: "#556B2F",
                  inputBorderFocus: "#556B2F",
                },
              },
            },
            className: {
              container: "font-sans",
              label: "text-bible-text",
              button: "font-medium",
              input: "font-sans",
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: "Email",
                password_label: "Senha",
                button_label: "Entrar",
                loading_button_label: "Entrando...",
                social_provider_text: "Entrar com {{provider}}",
                link_text: "Já tem uma conta? Entre",
              },
              sign_up: {
                email_label: "Email",
                password_label: "Senha",
                button_label: "Cadastrar",
                loading_button_label: "Cadastrando...",
                social_provider_text: "Cadastrar com {{provider}}",
                link_text: "Não tem uma conta? Cadastre-se",
              },
              forgotten_password: {
                button_label: "Recuperar senha",
                loading_button_label: "Enviando instruções...",
                link_text: "Esqueceu sua senha?",
              },
            },
          }}
          providers={[]}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;