import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BetaSignup = Database['public']['Tables']['beta_signups']['Insert'];

export default function BetaSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<BetaSignup>({
    name: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('beta_signups')
        .insert(formData);

      if (error) throw error;

      toast({
        title: "Inscrição realizada com sucesso!",
        description: "Entraremos em contato assim que o acesso beta estiver disponível.",
      });

      setFormData({ name: "", email: "", phone: "" });
    } catch (error) {
      toast({
        title: "Erro ao realizar inscrição",
        description: "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bible-navy to-bible-accent">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif">
            Seja um dos primeiros a explorar o MyBibleMAP
          </h1>
          
          <p className="text-xl text-bible-gray mb-12">
            Uma nova maneira de estudar a Bíblia está chegando. Junte-se aos pioneiros que terão acesso exclusivo à nossa versão beta.
          </p>

          <div className="bg-white rounded-lg shadow-xl p-8 md:p-10">
            <h2 className="text-2xl font-bold text-bible-navy mb-6 font-serif">
              Inscreva-se para o Acesso Beta
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <Input
                  type="tel"
                  placeholder="Seu telefone (WhatsApp)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-bible-accent hover:bg-bible-navy text-white font-bold py-3 px-6 rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Quero participar do beta!"}
              </Button>
            </form>

            <p className="mt-6 text-sm text-gray-600">
              Ao se inscrever, você será um dos primeiros a receber acesso quando o beta estiver disponível.
              Não se preocupe, seus dados estão seguros conosco.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div className="p-6 rounded-lg bg-bible-accent bg-opacity-20 backdrop-blur-lg">
              <h3 className="text-xl font-bold mb-3">Acesso Antecipado</h3>
              <p>Seja um dos primeiros a experimentar recursos inovadores</p>
            </div>
            <div className="p-6 rounded-lg bg-bible-accent bg-opacity-20 backdrop-blur-lg">
              <h3 className="text-xl font-bold mb-3">Feedback Valioso</h3>
              <p>Ajude a moldar o futuro do MyBibleMAP com suas sugestões</p>
            </div>
            <div className="p-6 rounded-lg bg-bible-accent bg-opacity-20 backdrop-blur-lg">
              <h3 className="text-xl font-bold mb-3">Comunidade Exclusiva</h3>
              <p>Faça parte de uma comunidade dedicada ao estudo bíblico</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}