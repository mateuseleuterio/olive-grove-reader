import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações da Bíblia</CardTitle>
            <CardDescription>
              Gerencie suas configurações de leitura da Bíblia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Suas versões da Bíblia são gerenciadas automaticamente.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;