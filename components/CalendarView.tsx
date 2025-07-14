
import React, { useState, useMemo, useEffect } from 'react';
import { Appointment, Customer } from '../types';
import Card from './common/Card';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface CalendarViewProps {
  appointments: Appointment[];
  customers: Customer[];
  onAddAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  onUpdateAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointmentId: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ appointments, customers, onAddAppointment, onUpdateAppointment, onDeleteAppointment }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Partial<Appointment> | null>(null);

  const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c])), [customers]);

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // 0 = Lun, 6 = Dom

    const grid: ({ day: number; month: 'prev' | 'curr' | 'next'; date: string; appointments: Appointment[] })[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex; i > 0; i--) {
      const day = prevMonthLastDay - i + 1;
      const date = new Date(year, month - 1, day);
      grid.push({ day, month: 'prev', date: date.toISOString().split('T')[0], appointments: [] });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const dailyAppointments = appointments.filter(a => a.date === dateString).sort((a,b) => a.startTime.localeCompare(b.startTime));
      grid.push({ day, month: 'curr', date: dateString, appointments: dailyAppointments });
    }

    const remainingCells = 42 - grid.length; // 6 weeks grid
    for (let i = 1; i <= remainingCells; i++) {
       const date = new Date(year, month + 1, i);
       grid.push({ day: i, month: 'next', date: date.toISOString().split('T')[0], appointments: [] });
    }
    
    return grid;
  }, [currentDate, appointments]);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const openModal = (appointment: Partial<Appointment> | null, date?: string) => {
    if (appointment) {
        setSelectedAppointment(appointment);
    } else {
        setSelectedAppointment({ 
            date: date || new Date().toISOString().split('T')[0],
            title: '',
            startTime: '09:00',
            endTime: '10:00',
            customerId: ''
        });
    }
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
      setIsModalOpen(false);
      setSelectedAppointment(null);
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !selectedAppointment.title || !selectedAppointment.date || !selectedAppointment.startTime || !selectedAppointment.endTime) return;

    if (selectedAppointment.id) {
        onUpdateAppointment(selectedAppointment as Appointment);
    } else {
        const { id, ...newAppointmentData } = selectedAppointment;
        onAddAppointment(newAppointmentData as Omit<Appointment, 'id'>);
    }
    closeModal();
  };
  
  const handleDeleteAppointment = () => {
    if (selectedAppointment?.id && window.confirm("Sei sicuro di voler eliminare questo appuntamento?")) {
        onDeleteAppointment(selectedAppointment.id);
        closeModal();
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectedAppointment(prev => prev ? {...prev, [name]: value} : null);
  };

  const isToday = (dateString: string) => {
    return new Date(dateString).toDateString() === new Date().toDateString();
  };

  return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Calendario Appuntamenti</h2>
            <button onClick={() => openModal(null)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <PlusIcon className="h-5 w-5 mr-2" />
                Nuovo Appuntamento
            </button>
        </div>
        <Card>
            <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100">&lt;</button>
                <h3 className="text-xl font-semibold capitalize">{currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200">
                {daysOfWeek.map(day => (
                    <div key={day} className="bg-gray-50 text-center py-2 text-sm font-semibold text-gray-600">{day}</div>
                ))}
                {calendarGrid.map((day, index) => (
                    <div key={index} 
                        className={`bg-white p-2 min-h-[120px] ${day.month !== 'curr' ? 'bg-gray-50' : ''}`}
                        onClick={() => day.month === 'curr' && openModal(null, day.date)}
                    >
                        <div className={`text-sm font-semibold ${day.month !== 'curr' ? 'text-gray-400' : 'text-gray-900'} ${isToday(day.date) ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                            {day.day}
                        </div>
                        <div className="mt-1 space-y-1">
                            {day.appointments.map(app => (
                                <div key={app.id} onClick={(e) => { e.stopPropagation(); openModal(app); }}
                                     className={`p-1.5 rounded-md text-xs cursor-pointer ${app.customerId ? 'bg-blue-100 hover:bg-blue-200' : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                    <p className="font-semibold truncate">{app.title}</p>
                                    <p className="text-gray-600">{app.startTime}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Card>

        {isModalOpen && selectedAppointment && (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
                    <form onSubmit={handleSaveAppointment}>
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">{selectedAppointment.id ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titolo</label>
                                    <input type="text" name="title" id="title" value={selectedAppointment.title || ''} onChange={handleInputChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"/>
                                </div>
                                <div>
                                    <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">Cliente (Opzionale)</label>
                                    <select name="customerId" id="customerId" value={selectedAppointment.customerId || ''} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                        <option value="">Nessun cliente</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data</label>
                                    <input type="date" name="date" id="date" value={selectedAppointment.date || ''} onChange={handleInputChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Ora Inizio</label>
                                        <input type="time" name="startTime" id="startTime" value={selectedAppointment.startTime || ''} onChange={handleInputChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"/>
                                    </div>
                                    <div>
                                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Ora Fine</label>
                                        <input type="time" name="endTime" id="endTime" value={selectedAppointment.endTime || ''} onChange={handleInputChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                            <div>
                                {selectedAppointment.id && (
                                    <button type="button" onClick={handleDeleteAppointment} className="p-2 text-gray-400 hover:text-red-600 rounded-full">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Annulla</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Salva</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  )
}

export default CalendarView;
