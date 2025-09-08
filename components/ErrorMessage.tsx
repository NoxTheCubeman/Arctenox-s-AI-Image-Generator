import React from 'react';
import type { StatusMessage as StatusMessageProps } from '../types';

const StatusMessage: React.FC<{ message: StatusMessageProps | null }> = ({ message }) => {
  if (!message) return null;

  const typeClasses = {
    error: 'bg-danger-bg border-danger text-danger',
    info: 'bg-info-bg border-info text-info',
    success: 'bg-success-bg border-success text-success',
    warning: 'bg-warning-bg border-warning text-warning',
  };
  
  const typeLabels = {
    error: 'Error',
    info: 'Info',
    success: 'Success',
    warning: 'Warning',
  };

  return (
    <div className={`${typeClasses[message.type]} px-4 py-3 rounded-lg relative animate-fade-in`} role="alert">
      <strong className="font-bold">{typeLabels[message.type]}: </strong>
      <span className="block sm:inline">{message.text}</span>
    </div>
  );
};

export default StatusMessage;