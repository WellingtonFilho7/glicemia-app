import { BarChart2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = { title: "Histórico — Glicemia App" };

export default function HistoricoPage() {
  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Histórico</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Gráficos e registros anteriores
        </p>
      </div>

      <Tabs defaultValue="glicemia">
        <TabsList className="w-full">
          <TabsTrigger value="glicemia" className="flex-1">Glicemia</TabsTrigger>
          <TabsTrigger value="refeicoes" className="flex-1">Refeições</TabsTrigger>
          <TabsTrigger value="sintomas" className="flex-1">Sintomas</TabsTrigger>
        </TabsList>

        <TabsContent value="glicemia">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart2 className="h-5 w-5 text-[var(--primary)]" />
                Tendência de glicemia
              </CardTitle>
              <CardDescription>Últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <PlaceholderChart label="GlucoseTrendChart" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refeicoes">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Refeições recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <PlaceholderChart label="Listagem de refeições" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sintomas">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rigidez e dor</CardTitle>
              <CardDescription>Correlação com alimentação</CardDescription>
            </CardHeader>
            <CardContent>
              <PlaceholderChart label="SymptomTrendChart + CorrelationChart" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PlaceholderChart({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <BarChart2 className="h-10 w-10 text-[var(--muted-foreground)]/40" />
      <p className="text-sm text-[var(--muted-foreground)] italic">
        Em construção — {label}
      </p>
    </div>
  );
}
