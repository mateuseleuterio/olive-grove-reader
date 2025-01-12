import { Link } from "react-router-dom";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Menu, Search, Settings, User, Puzzle, BookOpen, X } from "lucide-react";
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

  const MenuItems = () => (
    <>
      <Link to="/" className="block">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-bible-accent">
          Blog
        </Button>
      </Link>
      <Link to="/bible" className="block">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-bible-accent">
          Bíblia
        </Button>
      </Link>
      <Link to="/sermon-builder" className="block">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-bible-accent">
          Sermões
        </Button>
      </Link>
      <Link to="/reading-plans" className="block">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-bible-accent flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Planos de Leitura
        </Button>
      </Link>
      <Link to="/bible-challenge" className="block">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-bible-accent flex items-center gap-2">
          <Puzzle className="h-4 w-4" />
          Desafio Bíblico
        </Button>
      </Link>
      <Link to="/study" className="block">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-bible-accent flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Estudos
        </Button>
      </Link>
    </>
  );

  return (
    <nav className="bg-bible-navy text-white py-4 fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isMobile ? (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-bible-accent">
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] bg-bible-navy p-0">
                <SheetHeader className="p-6 border-b border-bible-accent">
                  <SheetTitle className="text-white">Menu</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <MenuItems />
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Link to="/" className="text-xl font-bold whitespace-nowrap">
              Biblia App
            </Link>
          )}
        </div>

        {!isMobile && (
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList className="flex gap-2">
              <NavigationMenuItem className="flex">
                <MenuItems />
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-bible-accent">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-bible-accent">
            <Settings className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-bible-accent">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {profile?.full_name || 'Minha Conta'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;