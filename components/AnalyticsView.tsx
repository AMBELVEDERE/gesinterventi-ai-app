import React, { useState, useMemo } from 'react';
import { Customer, InterventionReport } from '../types';
import Card from './common/Card';
import BarChart from './common/BarChart';
import { EyeIcon } from './icons/EyeIcon';

interface AnalyticsViewProps {
  customers: Customer[];
  reports: InterventionReport[];
  onViewReport: (reportId: string) => void;
}

const calculateHours = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;
  try {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    let diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
    if (isNaN(diffMs)) return 0;
    return diffMs / (1000 * 60 * 60);
  } catch (e) {
    console.error("Error calculating hours:", e);
    return 0;
  }
};
  
const AnalyticsView: React.FC<AnalyticsViewProps> = ({ customers, reports, onViewReport }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  
  const completedReports = useMemo(() => reports.filter(r => r.status === 'Completed'), [reports]);

  const availableYears = useMemo(() => {
    const years = new Set(completedReports.map(r => new Date(r.interventionDate).getFullYear()));
    return Array.from(years).sort((a,b) => b-a);
  }, [completedReports]);
  
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setSelectedYear('all');
    setSelectedMonth('all');
  };

  const filteredReportsForCharts = useMemo(() => {
    return completedReports
      .filter(r => selectedCustomerId === 'all' || r.customerId === selectedCustomerId);
  }, [completedReports, selectedCustomerId]);

  const monthlyData = useMemo(() => {
    const monthLabels = Array.from({ length: 12 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString('it-IT', { month: 'short' }) };
    }).reverse();

    const interventions = monthLabels.map(({ year, month }) => {
      const count = filteredReportsForCharts.filter(r => {
        const reportDate = new Date(r.interventionDate);
        return reportDate.getFullYear() === year && reportDate.getMonth() === month;
      }).length;
      return count;
    });

    const hours = monthLabels.map(({ year, month }) => {
      const totalHours = filteredReportsForCharts
        .filter(r => {
          const reportDate = new Date(r.interventionDate);
          return reportDate.getFullYear() === year && reportDate.getMonth() === month;
        })
        .reduce((sum, r) => sum + calculateHours(r.startTime, r.endTime), 0);
      return Math.round(totalHours * 10) / 10;
    });
    
    return {
        labels: monthLabels.map(m => m.label),
        interventions,
        hours
    };

  }, [filteredReportsForCharts]);
  
  const detailedFilteredReports = useMemo(() => {
    if (selectedCustomerId === 'all') return [];
    return completedReports
      .filter(r => r.customerId === selectedCustomerId)
      .filter(r => {
        if (selectedYear === 'all') return true;
        return new Date(r.interventionDate).getFullYear() === parseInt(selectedYear);
      })
      .filter(r => {
        if (selectedMonth === 'all') return true;
        return new Date(r.interventionDate).getMonth() === parseInt(selectedMonth);
      })
      .sort((a,b) => new Date(b.interventionDate).getTime() - new Date(a.interventionDate).getTime());
  }, [completedReports, selectedCustomerId, selectedYear, selectedMonth]);


  const customerSummary = useMemo(() => {
      const summary = new Map<string, {id: string, name: string, count: number, hours: number}>();
      completedReports.forEach(report => {
          const customer = customers.find(c => c.id === report.customerId);
          if (customer) {
              const current = summary.get(report.customerId) || { id: customer.id, name: customer.name, count: 0, hours: 0 };
              current.count++;
              current.hours += calculateHours(report.startTime, report.endTime);
              summary.set(report.customerId, current);
          }
      });
      return Array.from(summary.values()).sort((a,b) => b.count - a.count);
  }, [completedReports, customers]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Analisi Attività</h2>
        <div>
          <label htmlFor="customer-filter" className="text-sm font-medium text-gray-700 mr-2">Filtra per cliente:</label>
          <select
            id="customer-filter"
            value={selectedCustomerId}
            onChange={(e) => handleCustomerChange(e.target.value)}
            className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">Tutti i Clienti</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart 
            title="Interventi per Mese (ultimi 12 mesi)"
            data={monthlyData.labels.map((label, index) => ({label, value: monthlyData.interventions[index]}))}
        />
        <BarChart 
            title="Ore Lavorate per Mese (ultimi 12 mesi)"
            data={monthlyData.labels.map((label, index) => ({label, value: monthlyData.hours[index]}))}
            barColor="bg-green-500"
        />
      </div>

      <div className="mt-8">
          {selectedCustomerId === 'all' ? (
             <>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Riepilogo Generale per Cliente</h3>
                <Card className="!p-0">
                  {customerSummary.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Interventi Totali</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ore Totali Lavorate</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {customerSummary.map((summary) => (
                                <tr key={summary.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{summary.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{summary.count}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{summary.hours.toFixed(1)} ore</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                  ) : (
                      <div className="text-center p-8">
                          <p className="text-gray-500">Nessun intervento completato da analizzare.</p>
                      </div>
                  )}
                </Card>
             </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Dettaglio Interventi per {customers.find(c => c.id === selectedCustomerId)?.name}</h3>
                   <div className="flex items-center space-x-4">
                        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option value="all">Tutti gli anni</option>
                            {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option value="all">Tutti i mesi</option>
                            {Array.from({length: 12}).map((_, i) => <option key={i} value={i}>{new Date(0, i).toLocaleString('it-IT', {month: 'long'})}</option>)}
                        </select>
                   </div>
              </div>
              <Card className="!p-0">
                  {detailedFilteredReports.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Intervento</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durata</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Azioni</span></th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {detailedFilteredReports.map((report) => (
                                <tr key={report.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(report.interventionDate).toLocaleDateString('it-IT')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.interventionType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{calculateHours(report.startTime, report.endTime).toFixed(1)} ore</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button onClick={() => onViewReport(report.id)} className="inline-flex items-center text-blue-600 hover:text-blue-900">
                                        <EyeIcon className="h-5 w-5 mr-1" />
                                        Visualizza
                                      </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                  ) : (
                      <div className="text-center p-8">
                          <p className="text-gray-500">Nessun intervento trovato per i filtri selezionati.</p>
                      </div>
                  )}
              </Card>
            </>
          )}
      </div>
    </div>
  );
};

export default AnalyticsView;