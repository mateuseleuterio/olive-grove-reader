import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/Auth";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-bible-gray flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthModal isOpen={true} onClose={() => navigate("/")} />
      </div>
    </div>
  );
};

export default Auth;