import { RocketIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ComingSoon = () => {
  return (
    <div className="container mx-auto py-16 px-4">
      <Card className="max-w-2xl mx-auto text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-3xl font-bold text-bible-navy">
            <RocketIcon className="h-8 w-8" />
            Em Breve
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-bible-text">
            Esta funcionalidade está em desenvolvimento e estará disponível em breve.
          </p>
          <p className="text-sm text-muted-foreground">
            Estamos trabalhando para trazer a melhor experiência possível para você.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoon;