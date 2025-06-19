
import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onGenerateReport: () => void;
}

const DateRangeSelector = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onGenerateReport
}: DateRangeSelectorProps) => {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="h-5 w-5" />
        <h3 className="font-semibold">Seleccionar Rango de Fechas</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <Label htmlFor="start-date">Fecha Inicio</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="end-date">Fecha Fin</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
        
        <Button onClick={onGenerateReport} className="w-full">
          Generar Reporte
        </Button>
      </div>
    </div>
  );
};

export default DateRangeSelector;
