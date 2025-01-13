import { Link } from "react-router-dom";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Menu, Search, Settings, User, Puzzle, BookOpen, Brain, X, LogIn } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import AuthModal from "@/components/Auth";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  updated_at: string;
}

const NavigationBar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
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

          setProfile(data);
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
  }, [toast]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      navigate("/");
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível realizar o logout.",
      });
    }
  };

  const MainMenuItems = () => (
    <>
      <Link to="/bible">
        <Button variant="ghost" className="text-white hover:bg-bible-accent">
          Bíblia
        </Button>
      </Link>
      <Link to="/sermon-builder">
        <Button variant="ghost" className="text-white hover:bg-bible-accent">
          Sermões
        </Button>
      </Link>
      <Link to="/study">
        <Button variant="ghost" className="text-white hover:bg-bible-accent">
          Estudo
        </Button>
      </Link>
    </>
  );

  const SideMenuItems = () => (
    <>
      <Link to="/" className="block">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-bible-accent px-6">
          Blog
        </Button>
      </Link>
      <Link to="/reading-plans" className="block">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-bible-accent px-6 flex items-center gap-3">
          <BookOpen className="h-5 w-5" />
          Planos de Leitura
        </Button>
      </Link>
      <Link to="/bible-challenge" className="block">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-bible-accent px-6 flex items-center gap-3">
          <Puzzle className="h-5 w-5" />
          Desafio Bíblico
        </Button>
      </Link>
      <Link to="/mental-maps" className="block">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-bible-accent px-6 flex items-center gap-3">
          <Brain className="h-5 w-5" />
          Mapas Mentais
        </Button>
      </Link>
    </>
  );

  return (
    <nav className="bg-bible-navy text-white py-6 fixed top-0 w-full z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-bible-accent">
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-bible-navy p-0">
              <SheetHeader className="p-6 border-b border-bible-accent">
                <SheetTitle className="text-white text-xl">Menu</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <SideMenuItems />
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/" className="text-2xl font-bold whitespace-nowrap hover:text-white/90 transition-colors">
            Biblia App
          </Link>
        </div>

        <NavigationMenu>
          <NavigationMenuList className="flex gap-4">
            <NavigationMenuItem className="flex">
              <MainMenuItems />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-bible-accent w-10 h-10">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-bible-accent w-10 h-10">
            <Settings className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-bible-accent w-10 h-10">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {profile ? (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.full_name || 'Minha Conta'}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">Perfil</DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">Configurações</DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>Sair</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Minha Conta</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => setIsAuthModalOpen(true)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </nav>
  );
};

export default NavigationBar;