
import React from 'react';
import { ViewType } from '../types';
import { DashboardIcon } from './icons/DashboardIcon';
import { ReportIcon } from './icons/ReportIcon';
import { CustomerIcon } from './icons/CustomerIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, className }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'reports', label: 'Rapportini', icon: ReportIcon },
    { id: 'customers', label: 'Clienti', icon: CustomerIcon },
    { id: 'analytics', label: 'Analisi', icon: AnalyticsIcon },
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
    { id: 'settings', label: 'Impostazioni', icon: SettingsIcon },
  ];

  return (
    <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col ${className}`}>
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">GesInterventi AI</h1>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setView(item.id as ViewType)}
                className={`w-full flex items-center px-4 py-2.5 my-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  currentView === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
         <button 
            onClick={() => setView('new_report')}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center"
         >
             Nuovo Rapportino
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;