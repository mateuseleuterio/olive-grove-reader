import BibleReader from "@/components/BibleReader";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";

const Index = () => {
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
                <Link to="/profile" className={`${navigationMenuTriggerStyle()} bg-transparent hover:bg-bible-accent`}>
                  Meu perfil
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>
      <main>
        <BibleReader />
      </main>
    </div>
  );
};

export default Index;