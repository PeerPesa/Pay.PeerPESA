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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="p-6 bg-white rounded-lg w-96">
                <h2 className="mb-4 text-xl font-semibold">{message}</h2>
                {details ? (
                    <div className="space-y-2">
                        <p><strong>Status:</strong> {details.status}</p>
                        <p><strong>ID:</strong> {details.id || 'N/A'}</p>
                        <p><strong>Currency:</strong> {details.currency || 'N/A'}</p>
                        <p><strong>Account Number:</strong> {details.account_number || 'N/A'}</p>
                        <p><strong>Reference:</strong> {details.reference || 'N/A'}</p>
                        <p><strong>Sender:</strong> {details.sender || 'N/A'}</p>
                        <p><strong>Amount:</strong> {details.amount || 'N/A'}</p> {/* Display the amount */}
                    </div>
                ) : (
                    <p>No details available.</p>
                )}
                <button
                    onClick={onClose}
                    className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default Modal;
