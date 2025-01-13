import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BookOpen, Brain, Puzzle } from "lucide-react";

interface SideMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SideMenu = ({ isOpen, onOpenChange }: SideMenuProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] bg-bible-navy p-0">
        <SheetHeader className="p-6 border-b border-bible-accent">
          <SheetTitle className="text-white text-xl">Menu</SheetTitle>
        </SheetHeader>
        <div className="py-4">
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
        </div>
      </SheetContent>
    </Sheet>
  );
};