import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BookOpen, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ReadingPlan {
  id: string;
  title: string;
  description: string | null;
  duration_days: number;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
}

const ReadingPlans = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: "",
    description: "",
    duration_days: 30,
    is_public: true,
  });

  const { data: publicPlans, isLoading, error } = useQuery({
    queryKey: ["reading-plans", "public"],
    queryFn: async () => {
      console.log("Fetching public reading plans...");
      const { data, error } = await supabase
        .from("reading_plans")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching public reading plans:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar planos de leitura públicos",
        });
        throw error;
      }

      console.log("Public reading plans fetched:", data);
      return data as ReadingPlan[];
    },
  });

  const { data: myPlans, isLoading: isLoadingMyPlans, error: myPlansError } = useQuery({
    queryKey: ["reading-plans", "my"],
    queryFn: async () => {
      console.log("Fetching user reading plans...");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from("reading_plans")
        .select("*")
        .eq("created_by", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user reading plans:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar seus planos de leitura",
        });
        throw error;
      }

      console.log("User reading plans fetched:", data);
      return data as ReadingPlan[];
    },
  });

  const handleCreatePlan = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Você precisa estar logado para criar um plano de leitura.",
        });
        return;
      }

      console.log("Creating new reading plan...");
      const { error } = await supabase.from("reading_plans").insert({
        ...newPlan,
        created_by: session.user.id,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Plano de leitura criado com sucesso!",
      });

      setIsCreating(false);
      setNewPlan({
        title: "",
        description: "",
        duration_days: 30,
        is_public: true,
      });
    } catch (error) {
      console.error("Error creating reading plan:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar o plano de leitura.",
      });
    }
  };

  const PlanCard = ({ plan }: { plan: ReadingPlan }) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {plan.title}
        </CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{plan.duration_days} dias</span>
        </div>
        <Button className="mt-4">Começar Plano</Button>
      </CardContent>
    </Card>
  );

  if (error || myPlansError) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center text-red-500">
          Ocorreu um erro ao carregar os planos de leitura. Por favor, tente novamente mais tarde.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Planos de Leitura</h1>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Plano
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Plano de Leitura</DialogTitle>
              <DialogDescription>
                Crie seu próprio plano de leitura bíblica
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newPlan.title}
                  onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duração (dias)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newPlan.duration_days}
                  onChange={(e) => setNewPlan({ ...newPlan, duration_days: parseInt(e.target.value) })}
                />
              </div>
              <Button onClick={handleCreatePlan} className="w-full">
                Criar Plano
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="public">
        <TabsList>
          <TabsTrigger value="public">Planos Públicos</TabsTrigger>
          <TabsTrigger value="my">Meus Planos</TabsTrigger>
        </TabsList>
        <TabsContent value="public">
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(null).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : publicPlans && publicPlans.length > 0 ? (
            <div>
              {publicPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Nenhum plano público encontrado.
            </div>
          )}
        </TabsContent>
        <TabsContent value="my">
          {isLoadingMyPlans ? (
            <div className="space-y-4">
              {Array(2).fill(null).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myPlans && myPlans.length > 0 ? (
            <div>
              {myPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Você ainda não criou nenhum plano de leitura.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReadingPlans;