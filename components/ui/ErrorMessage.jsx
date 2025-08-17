import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

const ErrorMessage = ({ message, variant = 'error', className = '' }) => {
  const variants = {
    error: 'bg-red-50 text-red-600 border-red-200',
    warning: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    success: 'bg-green-50 text-green-600 border-green-200',
    info: 'bg-blue-50 text-blue-600 border-blue-200'
  };

  return (
    <div className={`${className} ${variants[variant]} flex items-start p-4 mb-4 rounded-lg border ${variants[variant]} text-sm`}>
      <FiAlertCircle className="flex-shrink-0 mt-0.5 mr-3 text-lg" />
      <div>
        {typeof message === 'string' ? (
          <p>{message}</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {message.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;