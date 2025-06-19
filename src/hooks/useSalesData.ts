
import { useState, useMemo } from "react";
import { Sale } from "@/types/sales";
import { calculateSalesSummary, filterSalesForReport } from "@/utils/salesCalculations";

export const useSalesData = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7");

  const sales = useMemo(() => {
    const saved = localStorage.getItem('sales');
    console.log('Loaded sales from localStorage:', saved);
    const parsedSales = saved ? JSON.parse(saved) : [];
    console.log('Parsed sales:', parsedSales);
    
    // Log each sale's date format
    parsedSales.forEach((sale: Sale, index: number) => {
      console.log(`Sale ${index} - ID: ${sale.id}, Date: ${sale.date}, Date type: ${typeof sale.date}`);
      console.log(`Sale ${index} - Parsed date: ${new Date(sale.date).toISOString()}`);
    });
    
    return parsedSales;
  }, []);

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
    getSalesForReport
  };
};
