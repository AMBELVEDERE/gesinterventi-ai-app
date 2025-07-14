
import React, { useState } from 'react';
import { Customer, InterventionReport, InterventionType } from '../types';
import { generateStructuredReport } from '../services/geminiService';
import Spinner from './common/Spinner';
import Card from './common/Card';

interface NewReportViewProps {
  customers: Customer[];
  addReport: (report: InterventionReport) => void;
  setView: (view: 'reports') => void;
}

const NewReportView: React.FC<NewReportViewProps> = ({ customers, addReport, setView }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [interventionDate, setInterventionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [interventionType, setInterventionType] = useState<InterventionType>('Assistenza');
  const [rawNotes, setRawNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !rawNotes.trim()) {
      setError('Seleziona un cliente e inserisci le note sull\'intervento.');
      return;
    }
    setError(null);
    setIsLoading(true);

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) {
        setError("Cliente non valido.");
        setIsLoading(false);
        return;
    }

    const newDraftReport: InterventionReport = {
        id: `rep_${Date.now()}`,
        customerId: customer.id,
        customerName: customer.name,
        interventionDate,
        startTime,
        endTime,
        interventionType,
        rawNotes,
        structuredReport: null,
        status: 'Generating',
    };
    
    addReport(newDraftReport);
    
    try {
      const promptContext = `Genera un report per un intervento tecnico con i seguenti dettagli:
- Cliente: ${customer.name}
- Data Intervento: ${interventionDate}
- Orario: dalle ${startTime} alle ${endTime}
- Tipo di Intervento: ${interventionType}

Note grezze del tecnico (da elaborare in un report formale):
"${rawNotes}"`;

      const structuredData = await generateStructuredReport(promptContext);
      const finalReport: InterventionReport = {
          ...newDraftReport,
          structuredReport: structuredData,
          status: 'Completed'
      };
      addReport(finalReport);
      setView('reports');
    } catch (apiError) {
      console.error(apiError);
      const errorReport: InterventionReport = {
          ...newDraftReport,
          status: 'Error'
      };
      addReport(errorReport);
      setError(apiError instanceof Error ? apiError.message : 'Si è verificato un errore sconosciuto.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Crea Nuovo Rapportino di Intervento</h2>
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <select
                id="customer"
                name="customer"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                disabled={isLoading}
              >
                <option value="">Seleziona un cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                    <label htmlFor="intervention-date" className="block text-sm font-medium text-gray-700 mb-1">Data Intervento</label>
                    <input type="date" id="intervention-date" value={interventionDate} onChange={e => setInterventionDate(e.target.value)} disabled={isLoading} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mb-1">Ora Inizio</label>
                    <input type="time" id="start-time" value={startTime} onChange={e => setStartTime(e.target.value)} disabled={isLoading} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mb-1">Ora Fine</label>
                    <input type="time" id="end-time" value={endTime} onChange={e => setEndTime(e.target.value)} disabled={isLoading} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label htmlFor="intervention-type" className="block text-sm font-medium text-gray-700 mb-1">Tipo Intervento</label>
                    <select id="intervention-type" value={interventionType} onChange={e => setInterventionType(e.target.value as InterventionType)} disabled={isLoading} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        <option>Installazione</option>
                        <option>Aggiornamento</option>
                        <option>Assistenza</option>
                        <option>In corso</option>
                        <option>Analisi</option>
                    </select>
                </div>
            </div>

            <div>
              <label htmlFor="raw-notes" className="block text-sm font-medium text-gray-700 mb-1">
                Note sull'intervento (Appunti grezzi)
              </label>
              <textarea
                id="raw-notes"
                name="raw-notes"
                rows={8}
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="E.g., Il cliente lamenta un rumore metallico dal condizionatore. Aperto lo split, pulito il filtro e controllato il serraggio della ventola. La ventola era leggermente allentata. Serrata vite. Testato, ora OK."
                disabled={isLoading}
              />
              <p className="mt-2 text-sm text-gray-500">
                Sii il più descrittivo possibile. L'AI userà queste note per creare un report professionale.
              </p>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !selectedCustomerId || !rawNotes}
              className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? <Spinner /> : 'Genera Report con AI'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewReportView;