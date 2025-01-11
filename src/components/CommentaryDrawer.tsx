import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CommentaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPassage: {
    book: string;
    chapter: string;
  };
}

const CommentaryDrawer = ({ isOpen, onClose, currentPassage }: CommentaryDrawerProps) => {
  // This is sample commentary data - in a real app, this would come from an API
  const getCommentary = () => {
    if (currentPassage.book === "genesis" && currentPassage.chapter === "1") {
      return {
        title: "Comentário sobre Gênesis 1",
        content: `O primeiro capítulo de Gênesis apresenta o majestoso relato da criação do universo. 
        Este texto fundamental estabelece várias verdades teológicas importantes:

        1. Deus como Criador Supremo: O texto afirma claramente a existência de um único Deus que criou tudo do nada.
        
        2. Ordem e Propósito: A criação não foi aleatória, mas seguiu uma ordem específica e proposital.
        
        3. A Bondade da Criação: Repetidamente, o texto afirma que Deus viu que sua criação era boa.
        
        4. O Papel Especial da Humanidade: O ápice da criação é a humanidade, feita à imagem e semelhança de Deus.

        Este capítulo serve como fundamento para toda a narrativa bíblica subsequente, estabelecendo a soberania de Deus sobre toda a criação.`
      };
    }
    return {
      title: "Comentário não disponível",
      content: "Desculpe, ainda não temos comentário disponível para esta passagem."
    };
  };

  const commentary = getCommentary();

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="border-b border-bible-accent/20">
          <DrawerTitle className="text-bible-navy font-serif">
            {commentary.title}
          </DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="p-6">
          <div className="prose prose-olive max-w-none">
            <div className="whitespace-pre-line text-bible-text">
              {commentary.content}
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default CommentaryDrawer;