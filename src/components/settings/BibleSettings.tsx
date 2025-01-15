import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportBibleVersions } from "@/components/bible/ImportBibleVersions";

const BibleSettings = () => {
  return (
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
  );
};

export default BibleSettings;