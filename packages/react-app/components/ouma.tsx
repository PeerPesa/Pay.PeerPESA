import React from 'react';

export function Modal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Darker background overlay */}
      <div className="fixed inset-0 bg-black opacity-75" onClick={onClose}></div>

      {/* Modal content */}
      <div className="relative z-10 w-full max-w-lg p-6 mx-4 bg-white rounded-lg shadow-lg md:mx-0">
        <p>{message}</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 mt-4 text-white bg-blue-500 rounded-lg md:w-auto"
        >
          Close
        </button>
      </div>
    </div>
  );
}
