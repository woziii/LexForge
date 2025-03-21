import React, { useState } from 'react';
import { Mail, Download, Copy, Check, X, FileText } from 'lucide-react';

const ShareContractModal = ({ isOpen, onClose, contractId, contractTitle, onDownload, onShare }) => {
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Email fixe pour le partage
  const targetEmail = 'maurici.lucas@proton.me';
  
  const handleShare = async () => {
    try {
      setIsSending(true);
      setError(null);
      
      // Appel à la fonction de partage (envoi par email)
      await onShare(note);
      
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error sharing contract:", error);
      setError("Une erreur est survenue lors du partage. Veuillez réessayer.");
    } finally {
      setIsSending(false);
    }
  };
  
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(targetEmail);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center">
              <Mail className="mr-2" size={20} />
              Partager le contrat
            </h3>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Corps */}
        <div className="p-5">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-green-600 mb-2">Contrat partagé !</h4>
              <p className="text-gray-600 text-center">
                Votre contrat a été envoyé avec succès à {targetEmail}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{contractTitle || "Contrat"}</h4>
                    <p className="text-sm text-gray-500">ID: {contractId}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destinataire
                  </label>
                  <div className="flex">
                    <div className="flex-grow bg-gray-100 px-3 py-2 rounded-l-md text-gray-800 border border-gray-300">
                      {targetEmail}
                    </div>
                    <button 
                      onClick={handleCopyEmail}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-r-md transition-colors border border-gray-300 border-l-0"
                      title="Copier l'adresse email"
                    >
                      {copySuccess ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ce contrat sera partagé exclusivement avec cette adresse email
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note (optionnelle)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Ajoutez une note ou des instructions particulières..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={onDownload}
                  className="flex-1 flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download size={16} className="mr-2" />
                  Télécharger en JSON
                </button>
                
                <button
                  onClick={handleShare}
                  disabled={isSending}
                  className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Mail size={16} className="mr-2" />
                      Envoyer par email
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareContractModal; 