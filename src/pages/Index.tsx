import BibleReader from "@/components/BibleReader";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { useState } from "react";
import AuthModal from "@/components/Auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { useEffect } from "react";
import { UserCircle } from "lucide-react";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-bible-gray">
      <nav className="bg-bible-navy text-white py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Bible App</h1>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/" className={`${navigationMenuTriggerStyle()} bg-transparent hover:bg-bible-accent`}>
                  Home
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/sermon-builder" className={`${navigationMenuTriggerStyle()} bg-transparent hover:bg-bible-accent`}>
                  Construtor de sermão
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/store" className={`${navigationMenuTriggerStyle()} bg-transparent hover:bg-bible-accent`}>
                  Loja
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/learn" className={`${navigationMenuTriggerStyle()} bg-transparent hover:bg-bible-accent`}>
                  Aprenda
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <UserCircle className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user ? (
                      <>
                        <DropdownMenuItem className="font-medium">
                          {user.email}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                          Sair
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={() => setIsAuthModalOpen(true)}>
                        Entrar / Cadastrar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>
      <main>
        <BibleReader />
      </main>
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default Index;