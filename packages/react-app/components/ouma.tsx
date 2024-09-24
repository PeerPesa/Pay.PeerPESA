import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    details: any;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, message, details }) => {
    if (!isOpen) return null;

    console.log(details); // Log the details object to check its contents

    const isTransactionSuccessful = details && details.status === 'success'; // Check success status

    return (
        <div className="fixed inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out bg-black bg-opacity-50 font-harmony">
            <div className="relative w-full max-w-md p-4 mx-4 bg-white shadow-xl rounded-2xl md:mx-0">
                <button
                    onClick={onClose}
                    className="absolute text-gray-500 transition-colors duration-200 top-2 right-2 hover:text-gray-700"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
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

                {/* If transaction failed, show error message, image, and tips */}
                {!isTransactionSuccessful ? (
                    <>
                        <h2 className="mb-3 text-xl font-bold text-red-600">Transaction Failed</h2>
                        <div className="flex items-center justify-center h-40">
                            <img 
                                src="system-regular-55-error-hover-error-1.gif" 
                                alt="Transaction Failed" 
                                className="object-contain w-24 h-24" 
                            />
                        </div>
                        <div className="mt-3 text-sm text-center text-gray-700">
                            <p className="font-semibold">Possible Reasons:</p>
                            <ul className="text-left list-disc list-inside">
                                <li>Insufficient funds in your account.</li>
                                <li>Network issues or transaction timeout.</li>
                                <li>Incorrect account number or transaction details.</li>
                            </ul>
                            <p className="mt-2 font-semibold">Tips to Resolve:</p>
                            <ul className="text-left list-disc list-inside">
                                <li>Check your account balance and try again.</li>
                                <li>Ensure you have a stable internet connection.</li>
                                <li>Double-check the details you’ve entered.</li>
                            </ul>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="mb-3 text-xl font-bold text-gray-800">{message}</h2>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p><strong>Status:</strong> {details.status}</p>
                            <p><strong>ID:</strong> {details.id || 'N/A'}</p>
                            <p><strong>Currency:</strong> {details.currency || 'N/A'}</p>
                            <p><strong>Account Number:</strong> {details.account_number || 'N/A'}</p>
                            <p><strong>Reference:</strong> {details.reference || 'N/A'}</p>
                            <p><strong>Sender:</strong> {details.sender || 'N/A'}</p>
                            <p><strong>Amount:</strong> {details.amount || 'N/A'}</p>
                            <p><strong>Beneficiary Name:</strong> {details.full_name || 'N/A'}</p> {/* Added line */}
                        </div>
                    </>
                )}

                {/* Smaller Close button */}
                <button
                    onClick={onClose}
                    className="block w-20 px-4 py-1 mx-auto mt-4 font-semibold text-center text-white transition-colors duration-300 rounded-lg bg-[#39a96c] hover:bg-blue-700"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default Modal;
