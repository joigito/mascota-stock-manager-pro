
import { useState, useMemo } from "react";
import { Sale } from "@/types/sales";
import { calculateSalesSummary, filterSalesForReport } from "@/utils/salesCalculations";
import { useSales } from "./useSales";

export const useSalesData = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  const { sales, loading, syncing, syncSales } = useSales();

  const filteredSales = useMemo(() => {
    const days = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return sales.filter((sale: Sale) => new Date(sale.date) >= cutoffDate);
  }, [sales, selectedPeriod]);

  const salesSummary = useMemo(() => {
    return calculateSalesSummary(filteredSales);
  }, [filteredSales]);

  const getSalesForReport = (startDate: string, endDate: string) => {
    return filterSalesForReport(sales, startDate, endDate);
  };

  return {
    sales,
    filteredSales,
    salesSummary,
    selectedPeriod,
    setSelectedPeriod,
    getSalesForReport,
    loading,
    syncing,
    syncSales
  };
};
