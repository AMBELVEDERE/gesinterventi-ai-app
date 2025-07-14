
import React, { useState, useEffect } from 'react';
import { TechnicianProfile } from '../types';
import Card from './common/Card';

interface SettingsViewProps {
  profile: TechnicianProfile;
  onSave: (profile: TechnicianProfile) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<TechnicianProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); // Hide message after 2 seconds
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Impostazioni Anagrafica Compilatore</h2>
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Questi dati verranno utilizzati per compilare le anagrafiche dei documenti.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome e Cognome Compilatore
                </label>
                <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mario Rossi"
                />
                </div>
                <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Azienda
                </label>
                <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Rossi Impianti S.r.l."
                />
                </div>
                <div>
                <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Partita IVA / C.F.
                </label>
                <input
                    type="text"
                    id="vatNumber"
                    name="vatNumber"
                    value={formData.vatNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="IT01234567890"
                />
                </div>
                <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Indirizzo Sede Legale
                </label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Via Garibaldi 10, 00100 Roma"
                />
                </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end items-center">
             {isSaved && <span className="text-sm text-green-600 mr-4 transition-opacity duration-300">Dati salvati!</span>}
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Salva Modifiche
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SettingsView;
