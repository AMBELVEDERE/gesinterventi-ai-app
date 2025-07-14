
import React, { useState, useMemo } from 'react';
import { Customer, InterventionReport, ViewType, Appointment } from '../types';
import Card from './common/Card';
import { CustomerIcon } from './icons/CustomerIcon';
import { ReportIcon } from './icons/ReportIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface DashboardViewProps {
  customers: Customer[];
  reports: InterventionReport[];
  appointments: Appointment[];
  setView: (view: ViewType) => void;
  onSearch: (query: string) => void;
  onViewReport: (reportId: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ customers, reports, appointments, setView, onSearch, onViewReport }) => {
    const completedReports = reports.filter(r => r.status === 'Completed').length;
    const [query, setQuery] = useState('');

    const upcomingAppointments = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Start of today
        return appointments
            .filter(a => new Date(a.date.split('-').join('/')) >= now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5);
    }, [appointments]);

    const handleSearch = () => {
        if (query.trim()) {
            onSearch(query);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch(); 
        }
    };

    const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c.name])), [customers]);

    return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
      
      {/* Search Center Card */}
      <Card className="mb-6 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Centro Ricerche AI</h3>
        <p className="text-sm text-gray-600 mb-3">
          Fai una domanda in linguaggio naturale per trovare qualsiasi informazione nel programma: clienti, rapportini e appuntamenti.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
            <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Es: interventi di assistenza per Mario Rossi questo mese"
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <button
                onClick={handleSearch}
                disabled={!query.trim()}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400"
            >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Chiedi all'AI
            </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stat Cards */}
        <Card>
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <CustomerIcon className="h-6 w-6"/>
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Clienti Totali</p>
                    <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                </div>
            </div>
        </Card>
        <Card>
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <ReportIcon className="h-6 w-6"/>
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Report Completati</p>
                    <p className="text-2xl font-bold text-gray-900">{completedReports}</p>
                </div>
            </div>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Rapportini Recenti</h3>
          <Card className="!p-0">
              {reports.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                      {reports.slice(-5).reverse().map(report => (
                          <li key={report.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onViewReport(report.id)}>
                              <div>
                                  <p className="font-medium text-gray-800">Rapporto per {report.customerName}</p>
                                  <p className="text-sm text-gray-500">Data Intervento: {new Date(report.interventionDate).toLocaleDateString('it-IT')}</p>
                              </div>
                               <p className={`text-sm font-semibold ${report.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>{report.status}</p>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <div className="text-center p-8">
                      <p className="text-gray-500">Nessun rapportino recente.</p>
                  </div>
              )}
          </Card>
        </div>

        <div>
           <h3 className="text-xl font-bold text-gray-800 mb-4">Prossimi Appuntamenti</h3>
           <Card className="!p-0">
              {upcomingAppointments.length > 0 ? (
                 <ul className="divide-y divide-gray-200">
                    {upcomingAppointments.map(appointment => (
                      <li key={appointment.id} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">{appointment.title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(appointment.date.split('-').join('/')).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className="text-sm text-gray-500">{appointment.startTime} - {appointment.endTime}</p>
                          {appointment.customerId && (
                            <p className="text-xs font-semibold text-blue-600 mt-1">{customerMap.get(appointment.customerId)}</p>
                          )}
                        </div>
                        <CalendarIcon className="h-6 w-6 text-gray-400" />
                      </li>
                    ))}
                 </ul>
              ) : (
                <div className="text-center p-8">
                    <p className="text-gray-500">Nessun appuntamento in programma.</p>
                </div>
              )}
               <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
                    <button onClick={() => setView('calendar')} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                        Vedi Calendario Completo
                    </button>
               </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
