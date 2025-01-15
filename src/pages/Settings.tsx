import { ImportBibleVersions } from "@/components/bible/ImportBibleVersions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdminPromptPanel from "@/components/settings/AdminPromptPanel";

const Settings = () => {
  return (
    <div className="container mx-auto max-w-4xl py-8">
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
            <ImportBibleVersions />
          </CardContent>
        </Card>

        <AdminPromptPanel />
      </div>
    </div>
  );
};

export default Settings;