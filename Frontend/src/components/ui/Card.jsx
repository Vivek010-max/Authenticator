import React from 'react';

const Card = ({ className = '', children, ...props }) => {
  return (
    <div
      className={`bg-white dark:bg-black/50 rounded-lg border border-black dark:border-white/60 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ className = '', children, ...props }) => {
  return (
    <div className={`px-6 py-4 border-b border-black  dark:border-white  ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ className = '', children, ...props }) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`} {...props}>
      {children}
    </h3>
  );
};

const CardContent = ({ className = '', children, ...props }) => {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardContent };
