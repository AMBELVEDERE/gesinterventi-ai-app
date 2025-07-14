
import React, { useState } from 'react';
import { Customer } from '../types';
import Card from './common/Card';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface CustomerViewProps {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
}

const CustomerView: React.FC<CustomerViewProps> = ({ customers, addCustomer, updateCustomer, deleteCustomer }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', address: '', vatNumber: '', email: '' });
  
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editedCustomer, setEditedCustomer] = useState<Customer | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomer.name && newCustomer.email) {
      addCustomer(newCustomer);
      setNewCustomer({ name: '', address: '', vatNumber: '', email: '' });
      setIsAdding(false);
    }
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomerId(customer.id);
    setEditedCustomer({ ...customer });
  };
  
  const handleCancelEdit = () => {
    setEditingCustomerId(null);
    setEditedCustomer(null);
  };
  
  const handleSaveEdit = () => {
    if (editedCustomer) {
      updateCustomer(editedCustomer);
      setEditingCustomerId(null);
      setEditedCustomer(null);
    }
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedCustomer) {
      const { name, value } = e.target;
      setEditedCustomer(prev => prev ? { ...prev, [name]: value } : null);
    }
  };
  
  const handleDeleteClick = (customerId: string) => {
    if(window.confirm('Sei sicuro di voler eliminare questo cliente? L\'azione è irreversibile.')) {
      deleteCustomer(customerId);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6 no-print">
        <h2 className="text-2xl font-bold text-gray-800">Clienti</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Aggiungi Cliente
          </button>
        )}
      </div>

      {isAdding && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Nuovo Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="name" value={newCustomer.name} onChange={handleInputChange} placeholder="Nome Azienda" required className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              <input type="email" name="email" value={newCustomer.email} onChange={handleInputChange} placeholder="Email" required className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              <input type="text" name="address" value={newCustomer.address} onChange={handleInputChange} placeholder="Indirizzo" className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              <input type="text" name="vatNumber" value={newCustomer.vatNumber} onChange={handleInputChange} placeholder="Partita IVA / CF" className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Annulla</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Salva Cliente</button>
            </div>
          </form>
        </Card>
      )}

      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indirizzo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P. IVA</th>
                <th className="relative px-6 py-3 no-print"><span className="sr-only">Azioni</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                editingCustomerId === customer.id ? (
                    // Riga in modalità modifica
                    <tr key={customer.id}>
                        <td className="px-6 py-4"><input type="text" name="name" value={editedCustomer?.name} onChange={handleEditInputChange} className="p-2 border border-blue-300 rounded-md w-full" /></td>
                        <td className="px-6 py-4"><input type="email" name="email" value={editedCustomer?.email} onChange={handleEditInputChange} className="p-2 border border-blue-300 rounded-md w-full" /></td>
                        <td className="px-6 py-4"><input type="text" name="address" value={editedCustomer?.address} onChange={handleEditInputChange} className="p-2 border border-blue-300 rounded-md w-full" /></td>
                        <td className="px-6 py-4"><input type="text" name="vatNumber" value={editedCustomer?.vatNumber} onChange={handleEditInputChange} className="p-2 border border-blue-300 rounded-md w-full" /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium no-print">
                            <button onClick={handleSaveEdit} className="text-blue-600 hover:text-blue-900 font-semibold mr-4">Salva</button>
                            <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-900">Annulla</button>
                        </td>
                    </tr>
                ) : (
                    // Riga in modalità visualizzazione
                    <tr key={customer.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.vatNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium no-print">
                        <button onClick={() => handleEditClick(customer)} className="text-gray-400 hover:text-blue-600 p-2 rounded-full transition-colors">
                            <EditIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDeleteClick(customer.id)} className="text-gray-400 hover:text-red-600 p-2 rounded-full transition-colors ml-2">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CustomerView;
