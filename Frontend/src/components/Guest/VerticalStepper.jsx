import React from "react";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Shield,
  Hash,
} from "lucide-react";

const stepMeta = [
  {
    
    title: "OCR & Database Validation",
    description: "Extracting document data and validating against a database.",
    icon: <Search className="h-5 w-5" />,
  },
  {
    title: "Hashing Check",
    description: "Verifying the document's integrity with its stored hash.",
    icon: <Hash className="h-5 w-5" />,
  },
  {
    title: "Cryptographic Signature",
    description: "Authenticating the document using a digital signature.",
    icon: <Shield className="h-5 w-5" />,
  },
];

const VerticalStepper = ({ stepStates = [] }) => {
  const getStatusClasses = (state) => {
    switch (state) {
      case 'resting':
        return 'bg-gray-300 dark:bg-gray-700';
      case 'checking':
        return 'bg-blue-500 dark:bg-blue-600';
      case 'success':
        return 'bg-green-500';
      case 'failure':
        return 'bg-red-500';
      default:
        return '';
    }
  };

  const getIcon = (state) => {
    switch (state) {
      case 'checking':
        return <Loader2 className="h-6 w-6 text-white animate-spin" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-white" />;
      case 'failure':
        return <XCircle className="h-6 w-6 text-white" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-500 dark:bg-gray-400"></div>;
    }
  };

  return (
    <div className="relative p-6">
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4 font-semibold tracking-wider ">
        <span className="text-lg text-blue-500 mr-2">Process of Validation </span>
        <span></span>
      </div>

      {/* The main vertical line */}
      <div className="absolute top-[5.25rem] left-[3.7rem] h-[calc(100%-8rem)] w-0.5 bg-gray-800 dark:bg-blue-100"></div>
      
      <ol className="relative flex flex-col items-start px-4">
        {stepMeta.map((step, idx) => {
          const state = stepStates[idx] || "resting";
          const isCurrentStep = stepStates.findIndex(s => s === 'checking') === idx;
          const isCompleted = state === 'success' || state === 'failure';
          const isPreviousStepCompleted = idx > 0 && (stepStates[idx - 1] === 'success' || stepStates[idx-1] === 'failure');

          return (
            <li key={idx} className="flex w-full  mb-8 last:mb-0">
              {/* Progress Line Connector */}
              <div className="absolute top-2 left-[2.2rem] h-full w-0.5">
                <div className={`h-1/2 w-full transition-all duration-500 ease-in-out ${isPreviousStepCompleted ? getStatusClasses(stepStates[idx-1]) : 'bg-transparent'}`}></div>
                <div className={`h-1/2 w-full transition-all duration-500 ease-in-out ${isCompleted ? getStatusClasses(state) : 'bg-transparent'}`}></div>
              </div>

              {/* Step Icon */}
              <div className="flex-shrink-0 z-10 mr-6">
                <div className={`relative flex items-center justify-center h-10 w-10 rounded-full transition-all duration-500 ease-in-out ${getStatusClasses(state)} ${isCurrentStep ? 'glow' : ''}`}>
                  {getIcon(state)}
                </div>
              </div>

              {/* Content Block */}
              <div className={`flex-1 p-4 -ml-2 rounded-xl shadow-lg  transition-all duration-500 ${
                isCurrentStep ? 'bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-700' : 
                'bg-white dark:bg-neutral-900/60 border-transparent'
              }`}>
                
                <div className="flex justify-between items-center mb-1">
                    
                  <h3 className={`text-lg font-bold transition-colors ${
                    isCompleted ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
                  }`}>
                    {step.title}
                  </h3>
                  <span className={`text-sm font-semibold py-1 px-3 rounded-full transition-colors ${
                    state === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    state === 'failure' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                    'text-gray-500 dark:text-gray-400'
                  }`}>
                    {state === 'checking' ? 'Verifying...' : state === 'success' ? 'Complete' : state === 'failure' ? 'Failed' : 'Pending'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default VerticalStepper;