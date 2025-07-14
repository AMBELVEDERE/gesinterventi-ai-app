
export interface Customer {
  id: string;
  name: string;
  address: string;
  vatNumber: string;
  email: string;
}

export interface StructuredReport {
  problemDescription: string;
  actionsTaken: string;
  materialsUsed: string[];
  conclusion: string;
}

export type InterventionType = 'Installazione' | 'Aggiornamento' | 'Assistenza' | 'In corso' | 'Analisi';

export interface InterventionReport {
  id: string;
  customerId: string;
  customerName: string;
  interventionDate: string;
  startTime: string;
  endTime: string;
  interventionType: InterventionType;
  rawNotes: string;
  structuredReport: StructuredReport | null;
  status: 'Draft' | 'Generating' | 'Completed' | 'Error';
}

export interface TechnicianProfile {
  fullName: string;
  companyName: string;
  vatNumber: string;
  address: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  customerId?: string; // Optional link to a customer
}

export type ViewType = 'dashboard' | 'reports' | 'new_report' | 'customers' | 'settings' | 'analytics' | 'search_results' | 'calendar';