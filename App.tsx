
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ReportsView from './components/ReportsView';
import NewReportView from './components/NewReportView';
import CustomerView from './components/CustomerView';
import SettingsView from './components/SettingsView';
import AnalyticsView from './components/AnalyticsView';
import SearchResultsView from './components/SearchResultsView';
import CalendarView from './components/CalendarView';
import { Customer, InterventionReport, ViewType, TechnicianProfile, Appointment } from './types';
import { findDataWithAI } from './services/geminiService';
import LoginView from './components/LoginView';

// Dati iniziali usati solo al primo avvio se non ci sono dati salvati
const initialCustomers: Customer[] = [
  { id: 'cust_1', name: 'Mario Rossi SRL', address: 'Via Roma 1, 20100 Milano', vatNumber: 'IT01234567890', email: 'admin@rossisrl.it' },
  { id: 'cust_2', name: 'Bianchi SpA', address: 'Corso Italia 10, 10100 Torino', vatNumber: 'IT09876543210', email: 'acquisti@bianchispa.com' },
];

const getInitialCustomers = (): Customer[] => {
  try {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  } catch (error) {
    console.error("Failed to parse customers from localStorage", error);
    return initialCustomers;
  }
};

const getInitialReports = (): InterventionReport[] => {
  try {
    const saved = localStorage.getItem('reports');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to parse reports from localStorage", error);
    return [];
  }
};

const getInitialProfile = (): TechnicianProfile => {
  try {
    const savedProfile = localStorage.getItem('technicianProfile');
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
  } catch (error) {
    console.error("Failed to parse technician profile from localStorage", error);
  }
  return {
    fullName: '',
    companyName: '',
    vatNumber: '',
    address: '',
  };
};

const getInitialAppointments = (): Appointment[] => {
  try {
    const saved = localStorage.getItem('appointments');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to parse appointments from localStorage", error);
    return [];
  }
};

type SearchResults = {
    customers: Customer[];
    reports: InterventionReport[];
    appointments: Appointment[];
} | null;

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<ViewType>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>(getInitialCustomers);
  const [reports, setReports] = useState<InterventionReport[]>(getInitialReports);
  const [technicianProfile, setTechnicianProfile] = useState<TechnicianProfile>(getInitialProfile);
  const [appointments, setAppointments] = useState<Appointment[]>(getInitialAppointments);
  const [initialReportId, setInitialReportId] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults>(null);
  const [isSearching, setIsSearching] = useState(false);


  useEffect(() => {
    try {
        localStorage.setItem('customers', JSON.stringify(customers));
    } catch(error) {
        console.error("Failed to save customers to localStorage", error);
    }
  }, [customers]);

  useEffect(() => {
    try {
        localStorage.setItem('reports', JSON.stringify(reports));
    } catch(error) {
        console.error("Failed to save reports to localStorage", error);
    }
  }, [reports]);

  useEffect(() => {
    try {
        localStorage.setItem('technicianProfile', JSON.stringify(technicianProfile));
    } catch(error) {
        console.error("Failed to save technician profile to localStorage", error);
    }
  }, [technicianProfile]);

  useEffect(() => {
    try {
        localStorage.setItem('appointments', JSON.stringify(appointments));
    } catch(error) {
        console.error("Failed to save appointments to localStorage", error);
    }
  }, [appointments]);


  const addOrUpdateReport = (report: InterventionReport) => {
    setReports(prevReports => {
      const existingIndex = prevReports.findIndex(r => r.id === report.id);
      if (existingIndex !== -1) {
        const updatedReports = [...prevReports];
        updatedReports[existingIndex] = report;
        return updatedReports;
      }
      return [...prevReports, report];
    });
  };

  const addCustomer = (customerData: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = {
      id: `cust_${Date.now()}`,
      ...customerData
    };
    setCustomers(prev => [...prev, newCustomer]);
  };
  
  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };
  
  const deleteCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
  };

  const handleSaveProfile = (profile: TechnicianProfile) => {
      setTechnicianProfile(profile);
  };
  
  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = { id: `appt_${Date.now()}`, ...appointment };
    setAppointments(prev => [...prev, newAppointment]);
  };

  const updateAppointment = (updatedAppointment: Appointment) => {
      setAppointments(prev => prev.map(a => a.id === updatedAppointment.id ? updatedAppointment : a));
  };

  const deleteAppointment = (appointmentId: string) => {
      setAppointments(prev => prev.filter(a => a.id !== appointmentId));
  };

  const handleViewReport = (reportId: string) => {
    setInitialReportId(reportId);
    setView('reports');
  };
  
  const handleSearch = async (query: string) => {
      setSearchQuery(query);
      setIsSearching(true);
      setSearchResults(null);
      setView('search_results');

      try {
          const resultIds = await findDataWithAI(query, { customers, reports, appointments });
          const foundCustomers = customers.filter(c => resultIds.customerIds.includes(c.id));
          const foundReports = reports.filter(r => resultIds.reportIds.includes(r.id));
          const foundAppointments = appointments.filter(a => resultIds.appointmentIds.includes(a.id));
          
          setSearchResults({ customers: foundCustomers, reports: foundReports, appointments: foundAppointments });
      } catch (error) {
          console.error("AI Search failed:", error);
          setSearchResults({ customers: [], reports: [], appointments: [] }); // Show no results on error
      }
      
      setIsSearching(false);
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardView 
                    customers={customers} 
                    reports={reports} 
                    appointments={appointments} 
                    setView={setView} 
                    onSearch={handleSearch} 
                    onViewReport={handleViewReport}
                />;
      case 'reports':
        return <ReportsView 
                  reports={reports} 
                  setView={setView}
                  customers={customers}
                  technicianProfile={technicianProfile}
                  onUpdateReport={addOrUpdateReport} 
                  initialReportId={initialReportId}
                  onReportViewed={() => setInitialReportId(null)}
                />;
      case 'new_report':
        return <NewReportView customers={customers} addReport={addOrUpdateReport} setView={setView as (view: 'reports') => void} />;
      case 'customers':
        return <CustomerView 
                  customers={customers} 
                  addCustomer={addCustomer} 
                  updateCustomer={updateCustomer}
                  deleteCustomer={deleteCustomer}
                />;
      case 'analytics':
        return <AnalyticsView 
                  customers={customers} 
                  reports={reports} 
                  onViewReport={handleViewReport} 
                />;
      case 'calendar':
        return <CalendarView 
                  appointments={appointments}
                  customers={customers}
                  onAddAppointment={addAppointment}
                  onUpdateAppointment={updateAppointment}
                  onDeleteAppointment={deleteAppointment}
                />;
      case 'search_results':
        return <SearchResultsView
                    query={searchQuery}
                    results={searchResults}
                    isLoading={isSearching}
                    onViewReport={handleViewReport}
                    customers={customers}
                />;
      case 'settings':
        return <SettingsView profile={technicianProfile} onSave={handleSaveProfile} />;
      default:
        return <DashboardView 
                    customers={customers} 
                    reports={reports} 
                    appointments={appointments} 
                    setView={setView} 
                    onSearch={handleSearch} 
                    onViewReport={handleViewReport}
                />;
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Sidebar currentView={view} setView={setView} className="no-print" />
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
