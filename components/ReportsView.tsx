
import React, { useState, useMemo, useEffect } from 'react';
import { InterventionReport, ViewType, TechnicianProfile, Customer, StructuredReport } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { MailIcon } from './icons/MailIcon';
import { CopyIcon } from './icons/CopyIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ReportsViewProps {
  reports: InterventionReport[];
  setView: (view: ViewType) => void;
  customers: Customer[];
  technicianProfile: TechnicianProfile;
  onUpdateReport: (report: InterventionReport) => void;
  initialReportId?: string | null;
  onReportViewed?: () => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({ reports, setView, customers, technicianProfile, onUpdateReport, initialReportId, onReportViewed }) => {
  const [selectedReport, setSelectedReport] = useState<InterventionReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReportData, setEditedReportData] = useState<StructuredReport | null>(null);
  const [newMaterial, setNewMaterial] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c])), [customers]);
  
  useEffect(() => {
    if (initialReportId) {
      const reportToView = reports.find(r => r.id === initialReportId);
      if (reportToView) {
        setSelectedReport(reportToView);
      }
      onReportViewed?.();
    }
  }, [initialReportId, reports, onReportViewed]);


  const handleSelectReport = (report: InterventionReport) => {
    setSelectedReport(report);
    setIsEditing(false); 
    setEditedReportData(null); 
  };
  
  const handleBackToList = () => {
    setSelectedReport(null);
  };
  
  const handleEdit = () => {
    if (selectedReport?.structuredReport) {
      setEditedReportData(JSON.parse(JSON.stringify(selectedReport.structuredReport)));
      setIsEditing(true);
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditedReportData(null);
  };
  
  const handleSave = () => {
    if (selectedReport && editedReportData) {
      const updatedReport = { ...selectedReport, structuredReport: editedReportData };
      onUpdateReport(updatedReport);
      setSelectedReport(updatedReport);
      setIsEditing(false);
    }
  };
  
  const handleFieldChange = (field: keyof StructuredReport, value: string) => {
    if (editedReportData) {
      setEditedReportData({ ...editedReportData, [field]: value });
    }
  };
  
  const handleMaterialChange = (index: number, value: string) => {
    if (editedReportData) {
        const materials = [...editedReportData.materialsUsed];
        materials[index] = value;
        setEditedReportData({ ...editedReportData, materialsUsed: materials });
    }
  };
  
  const handleAddMaterial = () => {
    if (newMaterial.trim() && editedReportData) {
      const materials = [...editedReportData.materialsUsed, newMaterial.trim()];
      setEditedReportData({ ...editedReportData, materialsUsed: materials });
      setNewMaterial('');
    }
  };
  
  const handleRemoveMaterial = (index: number) => {
    if (editedReportData) {
        const materials = editedReportData.materialsUsed.filter((_, i) => i !== index);
        setEditedReportData({ ...editedReportData, materialsUsed: materials });
    }
  };

  const calculateTotalHours = (startTime: string, endTime: string): string => {
    if (!startTime || !endTime) return 'N/A';
  
    try {
      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);
      
      let diffMs = end.getTime() - start.getTime();
  
      if (diffMs < 0) {
        diffMs += 24 * 60 * 60 * 1000;
      }
  
      if (isNaN(diffMs)) return 'N/A';
  
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
  
      const parts = [];
      if (hours > 0) {
        parts.push(`${hours} ${hours === 1 ? 'ora' : 'ore'}`);
      }
      if (minutes > 0) {
        parts.push(`${minutes} ${minutes === 1 ? 'minuto' : 'minuti'}`);
      }
      
      return parts.length > 0 ? parts.join(' e ') : '0 minuti';
    } catch (e) {
      console.error("Errore nel calcolo della differenza di orario:", e);
      return 'N/A';
    }
  };

  const generateReportText = (): string | null => {
    const reportData = isEditing ? editedReportData : selectedReport?.structuredReport;
    const customer = customerMap.get(selectedReport?.customerId || '');

    if (!selectedReport || !reportData || !customer) {
        return null;
    }
    
    const totalHoursText = calculateTotalHours(selectedReport.startTime, selectedReport.endTime);

    const textParts = [
      `RAPPORTO DI INTERVENTO TECNICO`,
      `=================================`,
      `RIF. RAPPORTO: #${selectedReport.id.slice(-5)}`,
      `DATA: ${new Date(selectedReport.interventionDate).toLocaleDateString('it-IT')}`,
      `ORARIO: Dalle ${selectedReport.startTime} alle ${selectedReport.endTime}`,
      `DURATA TOTALE: ${totalHoursText}`,
      `TIPO: ${selectedReport.interventionType}`,
      ``,
      `---------------------------------`,
      `DATI CLIENTE`,
      `---------------------------------`,
      `Nome: ${customer.name}`,
      `Indirizzo: ${customer.address}`,
      `P.IVA/CF: ${customer.vatNumber}`,
      `Email: ${customer.email}`,
      ``,
      `---------------------------------`,
      `DATI COMPILATORE`,
      `---------------------------------`,
      `Azienda: ${technicianProfile.companyName}`,
      `Tecnico: ${technicianProfile.fullName}`,
      `Indirizzo: ${technicianProfile.address}`,
      `P.IVA: ${technicianProfile.vatNumber}`,
      ``,
      `---------------------------------`,
      `DETTAGLIO INTERVENTO`,
      `---------------------------------`,
      ``,
      `DESCRIZIONE DEL PROBLEMA:`,
      `${reportData.problemDescription}`,
      ``,
      `AZIONI INTRAPRESE:`,
      `${reportData.actionsTaken}`,
      ``,
      `MATERIALI UTILIZZATI:`,
      `${reportData.materialsUsed.length > 0 ? reportData.materialsUsed.map(item => `- ${item}`).join('\n') : 'Nessuno'}`,
      ``,
      `CONCLUSIONE:`,
      `${reportData.conclusion}`,
    ];
    return textParts.join('\n');
  };

  const handleCopyReport = () => {
    const reportText = generateReportText();
    if (!reportText) {
      console.error("Dati del report mancanti per la copia.");
      return;
    }
    navigator.clipboard.writeText(reportText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(err => {
      console.error('Errore durante la copia del rapportino:', err);
      alert('Impossibile copiare il testo.');
    });
  };

  const handleSendEmail = () => {
    const customer = customerMap.get(selectedReport?.customerId || '');

    if (!customer?.email) {
        alert("Impossibile inviare l'email: l'indirizzo del cliente non è stato impostato.");
        return;
    }

    const reportTextForEmail = generateReportText();
    if (!reportTextForEmail || !selectedReport) {
        console.error("Dati del report o del cliente mancanti per l'invio dell'email.");
        return;
    }

    const subject = `Rapportino di Intervento #${selectedReport.id.slice(-5)}`;
    const body = encodeURIComponent(reportTextForEmail);
    const mailtoLink = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${body}`;
    
    window.open(mailtoLink, '_self');
  };

  const getStatusBadge = (status: InterventionReport['status']) => {
    switch (status) {
      case 'Completed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completato</span>;
      case 'Generating':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">In generazione...</span>;
      case 'Error':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Errore</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Bozza</span>;
    }
  };

  if (selectedReport) {
      const customer = customerMap.get(selectedReport.customerId);
      const reportData = isEditing ? editedReportData : selectedReport.structuredReport;
      const totalHoursText = calculateTotalHours(selectedReport.startTime, selectedReport.endTime);

      return (
        <div className="p-8">
             <div className="flex justify-between items-center mb-6 no-print">
                <div>
                    <button onClick={handleBackToList} className="text-sm font-medium text-blue-600 hover:text-blue-800 mb-2">
                        &larr; Torna alla lista
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">Dettaglio Rapportino #{selectedReport.id.slice(-5)}</h2>
                </div>
                {isEditing ? (
                    <div className="flex items-center space-x-2">
                        <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Annulla</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Salva Modifiche</button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        {copySuccess && <span className="text-sm text-green-600 mr-2 transition-opacity duration-300 animate-pulse">Copiato!</span>}
                        <button onClick={handleCopyReport} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors" title="Copia Rapportino">
                            <CopyIcon className="h-6 w-6" />
                        </button>
                        <button onClick={handleSendEmail} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors" title="Invia Email">
                            <MailIcon className="h-6 w-6" />
                        </button>
                         <button onClick={handleEdit} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors" title="Modifica Rapportino">
                            <EditIcon className="h-6 w-6" />
                        </button>
                    </div>
                )}
             </div>
             <Card className="printable-area">
                {/* Header */}
                <div className="grid grid-cols-2 gap-8 border-b border-gray-900/10 pb-8 mb-8">
                    <div>
                        <h3 className="text-base font-semibold leading-7 text-gray-900">Da:</h3>
                        <p className="font-bold">{technicianProfile.companyName || 'Non impostato'}</p>
                        <p>{technicianProfile.fullName}</p>
                        <p>{technicianProfile.address}</p>
                        <p>P.IVA: {technicianProfile.vatNumber}</p>
                    </div>
                    <div>
                        <h3 className="text-base font-semibold leading-7 text-gray-900">A:</h3>
                        <p className="font-bold">{customer?.name || 'Cliente non trovato'}</p>
                        <p>{customer?.address}</p>
                        <p>Email: {customer?.email}</p>
                        <p>P.IVA: {customer?.vatNumber}</p>
                    </div>
                </div>
                {/* Details */}
                <div className="mb-6 border-b border-gray-200 pb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Dettagli Intervento</h3>
                     <div className="mt-2 text-gray-600 space-y-1">
                        <p><strong>Data:</strong> {new Date(selectedReport.interventionDate).toLocaleDateString('it-IT')}</p>
                        <p><strong>Orario:</strong> Dalle {selectedReport.startTime} alle {selectedReport.endTime}</p>
                        <p><strong>Durata Totale:</strong> {totalHoursText}</p>
                        <p><strong>Tipo Intervento:</strong> {selectedReport.interventionType}</p>
                   </div>
                </div>

                {reportData && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Descrizione del Problema</h3>
                            {isEditing ? (
                                <textarea value={reportData.problemDescription} onChange={e => handleFieldChange('problemDescription', e.target.value)} rows={4} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                            ) : (
                                <p className="text-gray-600 whitespace-pre-wrap">{reportData.problemDescription}</p>
                            )}
                        </div>
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Azioni Intraprese</h3>
                             {isEditing ? (
                                <textarea value={reportData.actionsTaken} onChange={e => handleFieldChange('actionsTaken', e.target.value)} rows={6} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                            ) : (
                                <p className="text-gray-600 whitespace-pre-wrap">{reportData.actionsTaken}</p>
                            )}
                        </div>
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Materiali Utilizzati</h3>
                            {isEditing ? (
                                <div className='space-y-2'>
                                    {reportData.materialsUsed.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <input type="text" value={item} onChange={e => handleMaterialChange(index, e.target.value)} className="flex-grow block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
                                            <button onClick={() => handleRemoveMaterial(index)} className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex items-center space-x-2 pt-2">
                                        <input type="text" value={newMaterial} onChange={e => setNewMaterial(e.target.value)} placeholder="Aggiungi nuovo materiale..." className="flex-grow block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
                                        <button onClick={handleAddMaterial} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Aggiungi</button>
                                    </div>
                                </div>
                            ) : (
                                reportData.materialsUsed.length > 0 ? (
                                    <ul className="list-disc list-inside text-gray-600">
                                        {reportData.materialsUsed.map((item, index) => <li key={index}>{item}</li>)}
                                    </ul>
                                ) : <p className="text-gray-500 italic">Nessun materiale utilizzato.</p>
                            )}
                        </div>
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Conclusione</h3>
                             {isEditing ? (
                                <textarea value={reportData.conclusion} onChange={e => handleFieldChange('conclusion', e.target.value)} rows={3} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                            ) : (
                                <p className="text-gray-600 whitespace-pre-wrap">{reportData.conclusion}</p>
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </div>
      )
  }

  return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-6 no-print">
            <h2 className="text-2xl font-bold text-gray-800">Elenco Rapportini</h2>
            <button
                onClick={() => setView('new_report')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                <PlusIcon className="h-5 w-5 mr-2" />
                Nuovo Rapportino
            </button>
        </div>

      {reports.length === 0 ? (
        <Card className="text-center">
            <p className="text-gray-500">Nessun rapportino ancora creato.</p>
            <p className="text-sm text-gray-400 mt-2">Premi su "Nuovo Rapportino" per iniziare.</p>
        </Card>
      ) : (
      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Intervento</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                <th scope="col" className="relative px-6 py-3 no-print">
                  <span className="sr-only">Visualizza</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.slice().reverse().map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{report.id.slice(-5)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.interventionDate).toLocaleDateString('it-IT')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.interventionType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getStatusBadge(report.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium no-print">
                    {report.status === 'Generating' && <Spinner/>}
                    {(report.status === 'Completed' || report.status === 'Error') && (
                        <button onClick={() => handleSelectReport(report)} className="text-blue-600 hover:text-blue-900">
                            {report.status === 'Error' ? 'Vedi Dettagli' : 'Visualizza'}
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      )}
    </div>
  );
};

export default ReportsView;
