import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Configurações</h1>
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Bíblia</CardTitle>
            <CardDescription>
              Configurações relacionadas à Bíblia e suas versões
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Bible settings content will go here */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;