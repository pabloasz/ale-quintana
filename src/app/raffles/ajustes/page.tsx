import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ChangeCodeForm } from "./change-code-form";

export default function AjustesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Ajustes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Cambiar código de acceso</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangeCodeForm />
        </CardContent>
      </Card>
    </div>
  );
}
