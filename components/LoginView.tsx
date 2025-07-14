
import React, { useState } from 'react';
import Card from './common/Card';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === 'andrea' && password === 'Blvrcn@2025!') {
      setError('');
      onLoginSuccess();
    } else {
      setError('ID utente o password non validi.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">GesInterventi AI</h1>
            <p className="text-gray-600 mt-2">Accedi alla tua dashboard professionale</p>
        </div>
        <Card className="shadow-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                ID Utente
              </label>
              <div className="mt-1">
                <input
                  id="id"
                  name="id"
                  type="text"
                  autoComplete="username"
                  required
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            {error && (
              <div className="text-center text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Accedi
              </button>
            </div>
          </form>
        </Card>
        <p className="mt-8 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} GesInterventi AI. Tutti i diritti riservati.
        </p>
      </div>
    </div>
  );
};

export default LoginView;
