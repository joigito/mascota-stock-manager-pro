
import { BarChart3, Calendar } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportsHeaderProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const ReportsHeader = ({ selectedPeriod, onPeriodChange }: ReportsHeaderProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Reportes y Analytics</span>
            </CardTitle>
            <CardDescription>
              Análisis de ventas, rentabilidad e inventario del negocio
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={selectedPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Último día</SelectItem>
                <SelectItem value="7">Últimos 7 días</SelectItem>
                <SelectItem value="30">Últimos 30 días</SelectItem>
                <SelectItem value="90">Últimos 90 días</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default ReportsHeader;
