import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    details: any;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, message, details }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out bg-black bg-opacity-50">
            <div className="relative w-full max-w-lg p-6 mx-4 bg-white shadow-xl rounded-2xl md:mx-0">
                <button
                    onClick={onClose}
                    className="absolute text-gray-500 transition-colors duration-200 top-3 right-3 hover:text-gray-700"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                <h2 className="mb-6 text-2xl font-bold text-gray-800">{message}</h2>
                {details ? (
                    <div className="space-y-3 text-gray-700">
                        <p><strong>Status:</strong> {details.status}</p>
                        <p><strong>ID:</strong> {details.id || 'N/A'}</p>
                        <p><strong>Currency:</strong> {details.currency || 'N/A'}</p>
                        <p><strong>Account Number:</strong> {details.account_number || 'N/A'}</p>
                        <p><strong>Reference:</strong> {details.reference || 'N/A'}</p>
                        <p><strong>Sender:</strong> {details.sender || 'N/A'}</p>
                        <p><strong>Amount:</strong> {details.amount || 'N/A'}</p>
                    </div>
                ) : (
                    <p className="text-gray-600">No details available.</p>
                )}
                <button
                    onClick={onClose}
                    className="block w-full px-4 py-2 mt-6 font-semibold text-center text-white transition-colors duration-300 bg-green-500 rounded-lg hover:bg-blue-700"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default Modal;
