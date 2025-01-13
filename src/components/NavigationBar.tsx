import { Link, useNavigate } from "react-router-dom";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Menu, Search, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import AuthModal from "@/components/Auth";
import { UserMenu } from "./navigation/UserMenu";
import { SideMenu } from "./navigation/SideMenu";
import { Profile } from "./navigation/types";

const NavigationBar = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log("Fetching profile for user:", session.user.id);
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) {
            console.error('Error fetching profile:', error);
            toast({
              variant: "destructive",
              title: "Erro",
              description: "Não foi possível carregar seu perfil.",
            });
            return;
          }

          if (data) {
            console.log("Profile loaded successfully");
            setProfile(data);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Ocorreu um erro ao carregar seu perfil.",
        });
      }
    };

    getProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in, fetching profile");
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (!error && data) {
          console.log("Profile loaded after sign in");
          setProfile(data);
        }
      }
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing profile");
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  return (
    <nav className="bg-bible-navy text-white py-6 fixed top-0 w-full z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-bible-accent"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/" className="text-2xl font-bold whitespace-nowrap hover:text-white/90 transition-colors">
            Biblia App
          </Link>
        </div>

        <NavigationMenu className="hidden md:block">
          <NavigationMenuList className="flex gap-4">
            <NavigationMenuItem>
              <Link to="/bible">
                <Button variant="ghost" className="text-white hover:bg-bible-accent">
                  Bíblia
                </Button>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/sermon-builder">
                <Button variant="ghost" className="text-white hover:bg-bible-accent">
                  Sermões
                </Button>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/study">
                <Button variant="ghost" className="text-white hover:bg-bible-accent">
                  Estudo
                </Button>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-bible-accent w-10 h-10">
            <Search className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-bible-accent w-10 h-10" 
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-5 w-5" />
          </Button>
          <UserMenu profile={profile} onAuthModalOpen={() => setIsAuthModalOpen(true)} />
        </div>
      </div>
      <SideMenu isOpen={isMenuOpen} onOpenChange={setIsMenuOpen} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
};

export default NavigationBar;