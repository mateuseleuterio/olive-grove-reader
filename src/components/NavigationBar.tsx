import { Link, useNavigate } from "react-router-dom";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Menu, Search, Settings, X, BookOpen, Brain, Puzzle, LogIn, UserCircle, LogOut, Map } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";
import AuthModal from "./Auth";

const NavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const MainMenuItems = () => (
    <>
      <Link to="/bible" className="w-full">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-bible-accent">
          Bíblia
        </Button>
      </Link>
      <Link to="/sermon-builder" className="w-full">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-bible-accent">
          Sermões
        </Button>
      </Link>
      <Link to="/study" className="w-full">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-bible-accent">
          Estudo
        </Button>
      </Link>
    </>
  );

  const SideMenuItems = () => (
    <>
      <Link to="/blog" className="w-full">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-bible-accent px-6 flex items-center gap-3">
          Blog
        </Button>
      </Link>
      <Link to="/reading-plans" className="w-full">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-bible-accent px-6 flex items-center gap-3">
          <BookOpen className="h-5 w-5" />
          Planos de Leitura
        </Button>
      </Link>
      <Link to="/bible-challenge" className="w-full">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-bible-accent px-6 flex items-center gap-3">
          <Puzzle className="h-5 w-5" />
          Desafio Bíblico
        </Button>
      </Link>
      <Link to="/mental-maps" className="w-full">
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-bible-accent px-6 flex items-center gap-3">
          <Brain className="h-5 w-5" />
          Mapas Mentais
        </Button>
      </Link>
    </>
  );

  const UserMenu = () => {
    if (!user) {
      return (
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-bible-accent w-10 h-10"
          onClick={() => setIsAuthModalOpen(true)}
        >
          <LogIn className="h-5 w-5" />
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white hover:bg-bible-accent w-10 h-10">
            <UserCircle className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            <UserCircle className="mr-2 h-4 w-4" />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <nav className="bg-bible-navy text-white py-6 fixed top-0 w-full z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
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
              <div className="py-4 flex flex-col gap-2">
                <MainMenuItems />
                <div className="border-t border-bible-accent my-4" />
                <SideMenuItems />
                <div className="border-t border-bible-accent my-4" />
                <div className="px-6 flex flex-col gap-2">
                  <Button variant="ghost" size="icon" className="w-full justify-start text-white hover:bg-bible-accent flex items-center gap-3">
                    <Search className="h-5 w-5" />
                    Pesquisar
                  </Button>
                  <Button variant="ghost" size="icon" className="w-full justify-start text-white hover:bg-bible-accent flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    Configurações
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/" className="text-2xl font-bold whitespace-nowrap hover:text-white/90 transition-colors flex items-center gap-2">
            <Map className="h-6 w-6" />
            MyBibleMap
          </Link>
        </div>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="flex gap-4">
            <NavigationMenuItem className="flex">
              <MainMenuItems />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <div className="flex">
            <Button variant="ghost" size="icon" className="text-white hover:bg-bible-accent w-10 h-10">
              <Search className="h-5 w-5" />
            </Button>
            <UserMenu />
          </div>
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
