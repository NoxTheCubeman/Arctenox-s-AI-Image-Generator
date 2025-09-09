
import React from 'react';
import type { StatusMessage as StatusMessageProps } from '../types';

// New component to parse markdown links and render them as anchor tags
const LinkRenderer: React.FC<{ text: string }> = ({ text }) => {
    // Regex to find markdown links like [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = text.split(linkRegex);

    return (
        <>
            {parts.map((part, index) => {
                // The regex split results in: [normal, linkText, url, normal, ...]
                // linkText is at index 1, 4, 7, ...
                if (index % 3 === 1) {
                    const url = parts[index + 1];
                    return (
                        <a 
                            key={index} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-bold underline hover:text-inherit"
                        >
                            {part}
                        </a>
                    );
                }
                // The URL part at index 2, 5, 8... should not be rendered on its own
                if (index % 3 === 2) {
                    return null;
                }
                // Render normal text parts
                return part;
            })}
        </>
    );
};


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
      <span className="block sm:inline">
        <LinkRenderer text={message.text} />
      </span>
    </div>
  );
};

export default StatusMessage;
