
import React, { useMemo } from 'react';
import { Customer, InterventionReport, Appointment } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { CalendarIcon } from './icons/CalendarIcon';

interface SearchResultsViewProps {
  query: string;
  results: {
    customers: Customer[];
    reports: InterventionReport[];
    appointments: Appointment[];
  } | null;
  isLoading: boolean;
  onViewReport: (reportId: string) => void;
  customers: Customer[];
}

const SearchResultsView: React.FC<SearchResultsViewProps> = ({ query, results, isLoading, onViewReport, customers }) => {
  const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c.name])), [customers]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Risultati della Ricerca</h2>
      <p className="text-gray-600 mb-6">
        Risultati per: <span className="font-semibold">"{query}"</span>
      </p>

      {isLoading && (
        <Card>
          <div className="flex flex-col items-center justify-center p-8">
            <Spinner />
            <p className="mt-4 text-gray-600">Ricerca in corso...</p>
          </div>
        </Card>
      )}

      {!isLoading && results && (
        <div className="space-y-8">
          {/* Customers Results */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Clienti Trovati ({results.customers.length})</h3>
            {results.customers.length > 0 ? (
              <Card className="!p-0">
                <ul className="divide-y divide-gray-200">
                  {results.customers.map(customer => (
                    <li key={customer.id} className="p-4">
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.email} - {customer.address}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : (
              <Card>
                <p className="text-gray-500">Nessun cliente trovato.</p>
              </Card>
            )}
          </div>

          {/* Reports Results */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Rapportini Trovati ({results.reports.length})</h3>
            {results.reports.length > 0 ? (
              <Card className="!p-0">
                <ul className="divide-y divide-gray-200">
                  {results.reports.map(report => (
                    <li key={report.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">Rapporto per {report.customerName} (#{report.id.slice(-5)})</p>
                        <p className="text-sm text-gray-500">
                          Data: {new Date(report.interventionDate).toLocaleDateString('it-IT')} - Tipo: {report.interventionType}
                        </p>
                        {report.structuredReport && <p className="text-sm text-gray-600 mt-1 italic">"{report.structuredReport.problemDescription.substring(0, 100)}..."</p>}
                      </div>
                      <button
                        onClick={() => onViewReport(report.id)}
                        className="text-blue-600 hover:text-blue-900 font-semibold"
                      >
                        Visualizza
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : (
              <Card>
                <p className="text-gray-500">Nessun rapportino trovato.</p>
              </Card>
            )}
          </div>

          {/* Appointments Results */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Appuntamenti Trovati ({results.appointments.length})</h3>
            {results.appointments.length > 0 ? (
              <Card className="!p-0">
                <ul className="divide-y divide-gray-200">
                  {results.appointments.map(appointment => (
                    <li key={appointment.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.title}</p>
                        <p className="text-sm text-gray-500">
                          Data: {new Date(appointment.date.split('-').join('/')).toLocaleDateString('it-IT')} | Orario: {appointment.startTime} - {appointment.endTime}
                        </p>
                        {appointment.customerId && (
                            <p className="text-xs font-semibold text-blue-600 mt-1">{customerMap.get(appointment.customerId)}</p>
                          )}
                      </div>
                       <CalendarIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
                    </li>
                  ))}
                </ul>
              </Card>
            ) : (
              <Card>
                <p className="text-gray-500">Nessun appuntamento trovato.</p>
              </Card>
            )}
          </div>
        </div>
      )}
      
      {!isLoading && !results && (
         <Card>
            <p className="text-gray-500">Nessun risultato da mostrare. Esegui una ricerca dalla dashboard.</p>
         </Card>
      )}
    </div>
  );
};

export default SearchResultsView;
