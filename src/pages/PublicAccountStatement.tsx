import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Printer } from "lucide-react";

interface Org {
  id: string;
  name: string;
  slug: string;
}
interface Customer {
  id: string;
  name: string;
  cuit_dni?: string | null;
  email?: string | null;
  phone?: string | null;
  fiscal_address?: string | null;
}
interface Account {
  id: string;
  balance: number;
  credit_limit?: number | null;
}
interface Tx {
  id: string;
  transaction_type: "sale" | "payment" | "adjustment";
  amount: number;
  balance_after: number;
  notes?: string | null;
  created_at: string;
}
interface StatementData {
  organization: Org;
  customer: Customer;
  account: Account;
  transactions: Tx[];
}

const typeLabel = (t: string) =>
  t === "sale" ? "Venta" : t === "payment" ? "Pago" : t === "adjustment" ? "Ajuste" : t;

const PublicAccountStatement = () => {
  const { slug, token } = useParams<{ slug: string; token: string }>();
  const [data, setData] = useState<StatementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: new Date(new Date().setHours(23, 59, 59, 999)),
  });

  useEffect(() => {
    const load = async () => {
      if (!slug || !token) return;
      setLoading(true);
      setError(null);
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_public_account_statement",
        { _slug: slug, _token: token }
      );
      if (rpcError) {
        setError("Error al cargar el estado de cuenta.");
      } else if (!rpcData) {
        setError("Link inválido o expirado.");
      } else {
        setData(rpcData as unknown as StatementData);
      }
      setLoading(false);
    };
    load();
  }, [slug, token]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!dateFilter.from && !dateFilter.to) return data.transactions;
    return data.transactions.filter((tx) => {
      const d = new Date(tx.created_at);
      if (dateFilter.from && d < dateFilter.from) return false;
      if (dateFilter.to && d > dateFilter.to) return false;
      return true;
    });
  }, [data, dateFilter]);

  const previousBalance = useMemo(() => {
    if (!data || !dateFilter.from) return 0;
    const fromTime = dateFilter.from.getTime();
    const prior = data.transactions
      .filter((t) => new Date(t.created_at).getTime() < fromTime)
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
    return prior ? Number(prior.balance_after) : 0;
  }, [data, dateFilter]);

  const handlePrint = () => {
    const el = document.getElementById("public-statement-content");
    if (!el || !data) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Estado de Cuenta - ${data.customer.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #000; background: #fff; }
        .statement-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .statement-header h1 { margin: 0 0 10px 0; font-size: 24px; }
        .statement-header h2 { margin: 0; font-size: 18px; font-weight: normal; color: #666; }
        .customer-info { margin-bottom: 30px; padding: 15px; background: #f5f5f5; border-radius: 5px; }
        .customer-info h3 { margin-top: 0; margin-bottom: 10px; }
        .customer-info p { margin: 5px 0; }
        .date-range { text-align: center; font-weight: bold; margin-bottom: 20px; padding: 10px; background: #e8e8e8; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #333; color: #fff; font-weight: bold; }
        tbody tr:nth-child(even) { background-color: #f9f9f9; }
        .text-right { text-align: right; }
        .summary { margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 5px; }
        .summary h3 { margin-top: 0; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .summary-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0; }
        .summary-row.total { font-weight: bold; font-size: 28px; border-top: 2px solid #333; padding-top: 10px; margin-top: 15px; }
        @media print { .no-print { display: none; } body { margin: 0; } }
      </style></head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    w.print();
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-muted-foreground">Cargando estado de cuenta...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Estado de cuenta no disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error || "Link inválido."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Consultar estado de cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[180px]">
                <Label htmlFor="from">Fecha Desde</Label>
                <Input
                  id="from"
                  type="date"
                  value={dateFilter.from ? format(dateFilter.from, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setDateFilter((p) => ({ ...p, from: null }));
                      return;
                    }
                    const [y, m, d] = e.target.value.split("-").map(Number);
                    setDateFilter((p) => ({ ...p, from: new Date(y, m - 1, d, 0, 0, 0, 0) }));
                  }}
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <Label htmlFor="to">Fecha Hasta</Label>
                <Input
                  id="to"
                  type="date"
                  value={dateFilter.to ? format(dateFilter.to, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setDateFilter((p) => ({ ...p, to: null }));
                      return;
                    }
                    const [y, m, d] = e.target.value.split("-").map(Number);
                    setDateFilter((p) => ({
                      ...p,
                      to: new Date(y, m - 1, d, 23, 59, 59, 999),
                    }));
                  }}
                />
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  setDateFilter({
                    from: null,
                    to: new Date(new Date().setHours(23, 59, 59, 999)),
                  })
                }
                disabled={!dateFilter.from}
              >
                Limpiar
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir / PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <div id="public-statement-content" className="space-y-6">
          <div className="statement-header text-center border-b pb-6">
            <h1 className="text-2xl font-bold">{data.organization.name}</h1>
            <h2 className="text-lg text-muted-foreground mt-2">Estado de Cuenta Corriente</h2>
          </div>

          <div className="customer-info bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Información del Cliente:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p><strong>Nombre:</strong> {data.customer.name}</p>
              {data.customer.cuit_dni && (
                <p><strong>CUIT/DNI:</strong> {data.customer.cuit_dni}</p>
              )}
              {data.customer.email && (
                <p><strong>Email:</strong> {data.customer.email}</p>
              )}
              {data.customer.phone && (
                <p><strong>Teléfono:</strong> {data.customer.phone}</p>
              )}
              {data.customer.fiscal_address && (
                <p className="col-span-2"><strong>Dirección Fiscal:</strong> {data.customer.fiscal_address}</p>
              )}
            </div>
          </div>

          {(dateFilter.from || dateFilter.to) && (
            <div className="date-range bg-muted p-3 rounded text-center">
              <strong>Período: </strong>
              {dateFilter.from && format(dateFilter.from, "dd/MM/yyyy")}
              {dateFilter.from && dateFilter.to && " - "}
              {dateFilter.to && !dateFilter.from && `Hasta ${format(dateFilter.to, "dd/MM/yyyy")}`}
              {dateFilter.to && dateFilter.from && format(dateFilter.to, "dd/MM/yyyy")}
              {dateFilter.from && !dateFilter.to && ` - Desde ${format(dateFilter.from, "dd/MM/yyyy")}`}
            </div>
          )}

          <div>
            <h3 className="font-semibold text-lg mb-4">Detalle de Movimientos:</h3>
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">Fecha</th>
                  <th className="border p-2 text-left">Tipo</th>
                  <th className="border p-2 text-left">Descripción</th>
                  <th className="border p-2 text-right">Debe</th>
                  <th className="border p-2 text-right">Haber</th>
                  <th className="border p-2 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-semibold bg-muted/30">
                  <td className="border p-2">-</td>
                  <td className="border p-2">Saldo anterior</td>
                  <td className="border p-2">Saldo al inicio del período</td>
                  <td className="border p-2 text-right">-</td>
                  <td className="border p-2 text-right">-</td>
                  <td className="border p-2 text-right font-semibold">
                    ${Number(previousBalance).toLocaleString()}
                  </td>
                </tr>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="border p-4 text-center text-muted-foreground">
                      No hay movimientos en este período
                    </td>
                  </tr>
                ) : (
                  [...filtered].reverse().map((tx) => {
                    const isDebe =
                      tx.transaction_type === "sale" ||
                      (tx.transaction_type === "adjustment" && Number(tx.amount) > 0);
                    const isHaber =
                      tx.transaction_type === "payment" ||
                      (tx.transaction_type === "adjustment" && Number(tx.amount) < 0);
                    return (
                      <tr key={tx.id}>
                        <td className="border p-2">
                          {format(new Date(tx.created_at), "dd/MM/yyyy HH:mm")}
                        </td>
                        <td className="border p-2">{typeLabel(tx.transaction_type)}</td>
                        <td className="border p-2">{tx.notes || "-"}</td>
                        <td className="border p-2 text-right">
                          {isDebe ? `$${Math.abs(Number(tx.amount)).toLocaleString()}` : "-"}
                        </td>
                        <td className="border p-2 text-right">
                          {isHaber ? `$${Math.abs(Number(tx.amount)).toLocaleString()}` : "-"}
                        </td>
                        <td className="border p-2 text-right font-semibold">
                          ${Number(tx.balance_after).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="summary bg-muted/50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-4 border-b pb-2">Resumen:</h3>
            <div className="space-y-2">
              <div className="summary-row flex justify-between">
                <span>Saldo anterior:</span>
                <span className="font-semibold">${Number(previousBalance).toLocaleString()}</span>
              </div>
              <div className="summary-row total flex justify-between font-bold text-3xl border-t pt-3 mt-3">
                <span>Saldo actual:</span>
                <span className={Number(data.account.balance) > 0 ? "text-destructive" : ""}>
                  ${Number(data.account.balance).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicAccountStatement;
