import SyncFortnoxButton from "@/components/fortnox/sync";
import DisconnectFortnoxButton from "@/components/fortnox/disconnect";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { connectToFortnox } from "@/lib/fortnox/fortnox";

export default async function FortnoxIntegrationPage() {
  const { connected, error } = await connectToFortnox();

  if (error)
    return (
      <div className="p-6 flex flex-col space-y-6">
        <Card className="max-w-[500px]">
          <CardHeader>
            <CardTitle className="flex flex-col space-y-2">
              <div className="text-xl flex items-center space-x-6 gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Kunde inte kontrollera anslutningen
              </div>
              <div className="text-muted-foreground">{error}</div>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  return (
    <div className="p-6 flex flex-col space-y-6">
      <div className="flex items-center space-x-4">
        <Link />
        <h1 className="text-2xl font-semibold">Fortnox Integration</h1>
      </div>
      <Card className="max-w-[750px]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-4">
            <div className="text-xl flex items-center space-x-6 gap-3">
              {connected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
              Anslutningsstatus
            </div>
            <div>
              <Badge
                variant={connected ? "outline" : "destructive"}
                className="px-3 py-1 "
              >
                {connected ? "Ansluten" : "Inte ansluten"}
              </Badge>
            </div>
            <div className="ml-auto">
              {connected ? <DisconnectFortnoxButton /> : <SyncFortnoxButton />}
            </div>
          </CardTitle>
          <CardDescription className="text-base flex flex-col gap-2">
            {connected
              ? "Du är ansluten till Fortnox och kan hämta data"
              : "Anslut ditt Fortnox-konto för att börja hämta redovisningsdata"}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
