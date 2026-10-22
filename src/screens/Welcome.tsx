import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

export default function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="bg-blue-100 p-4 rounded-full mb-6">
        <Wallet className="w-12 h-12 text-blue-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Secure Wallet</h1>
      <p className="text-gray-500 mb-8">Your gateway to the Sepolia Testnet.</p>
      
      <div className="w-full space-y-4 mt-auto">
        <Link 
          to="/create" 
          className="block w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Create New Wallet
        </Link>
        <Link 
          to="/import" 
          className="block w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Import Existing Wallet
        </Link>
      </div>
    </div>
  );
}