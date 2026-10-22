import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Setup() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="p-4 flex items-center border-b border-gray-200 bg-white">
        <Link to="/" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="ml-4 text-lg font-semibold text-gray-900">Setup Wallet</h1>
      </header>
      
      <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
        <p className="text-gray-500 mb-6">
          Cryptography & Vault logic will go here in Phase 2 & 3.
        </p>
        <Link 
          to="/dashboard" 
          className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
        >
          Simulate Completion
        </Link>
      </div>
    </div>
  );
}