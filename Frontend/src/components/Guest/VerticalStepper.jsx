import React from "react";
import {
    CheckCircle,
    XCircle,
    Loader2,
    Search,
    Shield,
    Hash,
    Circle,
} from "lucide-react";

// --- Status Mapping Utility ---
const STEP_STATUS = {
    resting: 'resting',
    checking: 'checking',
    success: 'success',
    failure: 'failure',
};

const getStepRenderProps = (state) => {
    switch (state) {
        case STEP_STATUS.checking:
            return {
                // Line color changes for current or completed step
                lineClass: 'bg-sky-500 dark:bg-sky-600',
                // Icon styling for active state
                iconClass: 'bg-sky-500 ring-4 ring-sky-200 dark:ring-sky-700/50',
                // Content styling for active state
                contentClass: 'border-sky-400 dark:border-sky-600 shadow-xl shadow-sky-500/20 dark:shadow-sky-800/20',
                statusText: 'Verifying...',
                icon: <Loader2 className="h-5 w-5 text-white animate-spin" />,
            };
        case STEP_STATUS.success:
            return {
                lineClass: 'bg-emerald-500',
                iconClass: 'bg-emerald-500',
                contentClass: 'border-transparent bg-emerald-50 dark:bg-emerald-900/10 shadow-sm',
                statusText: 'Complete',
                icon: <CheckCircle className="h-5 w-5 text-white" />,
            };
        case STEP_STATUS.failure:
            return {
                lineClass: 'bg-red-500',
                iconClass: 'bg-red-500',
                contentClass: 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/10 shadow-xl shadow-red-500/20 dark:shadow-red-800/20',
                statusText: 'Failed',
                icon: <XCircle className="h-5 w-5 text-white" />,
            };
        case STEP_STATUS.resting:
        default:
            return {
                lineClass: 'bg-gray-300 dark:bg-gray-700',
                iconClass: 'bg-white border border-gray-300 dark:bg-gray-900 dark:border-gray-700',
                contentClass: 'border-transparent bg-white dark:bg-gray-900/60 shadow-sm',
                statusText: 'Pending',
                icon: <Circle className="h-5 w-5 text-gray-400 dark:text-gray-500" />,
            };
    }
};

const stepMeta = [
    {
        title: "OCR Data Extraction",
        description: "Scanning the document image/PDF to extract required data fields.",
        initialIcon: <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />,
    },
    {
        title: "Hash Lookup & Integrity",
        description: "Generating a canonical hash and checking its existence in the ledger.",
        initialIcon: <Hash className="h-5 w-5 text-gray-500 dark:text-gray-400" />,
    },
    {
        title: "Cryptographic Signature",
        description: "Verifying the digital signature using the Issuer's public key.",
        initialIcon: <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400" />,
    },
];

const VerticalStepper = ({ stepStates = [] }) => {
    // h-10 w-10 icon means 40px square. Center is at 20px.
    const iconDiameter = 40; 
    // This is the padding-left + width of the icon, used for line positioning
    const leftOffset = 20; // Tailwind p-6 on parent div gives 24px padding. Icon is at 24+16 (40px) from left of the card. Let's use Tailwind classes for padding.

    return (
        // The container should not be p-6, but the content inside should be. The parent component
        // passes a rounded-xl bg-white card, so we'll focus the styling here.
        <div className="relative p-0 max-w-full">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 border-b pb-2 border-gray-200 dark:border-gray-800">
                Validation Process Steps
            </h2>

            <ol className="relative flex flex-col items-start px-2"> {/* Added some internal padding */}
                
                {stepMeta.map((step, idx) => {
                    // Normalize stepStates to match stepMeta length
                    const state = stepStates[idx] || STEP_STATUS.resting; 
                    const { iconClass, contentClass, statusText, icon: statusIcon } = getStepRenderProps(state);
                    const isLastStep = idx === stepMeta.length - 1;
                    const isStepSuccessful = state === STEP_STATUS.success;
                    
                    // The line for the previous step is now complete if the previous state was success.
                    // The line for the current step is 'checking' if the previous was success AND current is success/failure/checking.
                    const isLineComplete = isStepSuccessful || stepStates[idx - 1] === STEP_STATUS.success;
                    
                    // Determine the line color and height
                    const lineColorClass = isLineComplete 
                        ? 'bg-emerald-500' // Use emerald for completed lines
                        : (state === STEP_STATUS.checking ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-700');
                    
                    const lineCompletionHeight = isStepSuccessful || state === STEP_STATUS.failure ? '100%' : '0%';

                    return (
                        <li 
                            key={idx} 
                            className="flex w-full items-start mb-6 last:mb-0"
                        >
                            
                            {/* Vertical Line Connector (ONLY for non-last steps) */}
                            {!isLastStep && (
                                <div 
                                    className={`absolute left-5 w-0.5 ml-0.5 bg-gray-300 dark:bg-gray-700`}
                                    // Start the line below the icon center and extend it to the bottom of the list item
                                    style={{ top: `${iconDiameter / 2}px`, height: `calc(100% - ${iconDiameter / 2}px)` }}
                                >
                                    {/* The colored line that indicates progress, growing from top to bottom */}
                                    <div 
                                        className={`w-full ${lineColorClass} transition-all duration-700 ease-in-out`} 
                                        style={{ height: lineCompletionHeight, transitionDelay: '300ms' }}
                                    />
                                </div>
                            )}
                            
                            {/* Step Icon Container (mr-4 is 16px, h-10 w-10 is 40px) */}
                            <div 
                                className={`relative flex-shrink-0 z-10 h-10 w-10 flex items-center justify-center rounded-full transition-all duration-500 ease-in-out ${iconClass} mr-4`}
                            >
                                {/* Use status icon for active/completed, or initial icon for resting */}
                                {state !== STEP_STATUS.resting 
                                    ? statusIcon 
                                    : step.initialIcon}
                            </div>

                            {/* Content Block */}
                            <div className={`flex-1 p-4 ml-2 border rounded-xl transition-all duration-500 
                                ${contentClass} 
                                ${state === STEP_STATUS.resting ? 'border-gray-200 dark:border-gray-700' : 'border-2'}
                            `}>
                                
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`text-lg font-bold transition-colors ${
                                        isStepSuccessful ? 'text-emerald-700 dark:text-emerald-300' : 
                                        state === STEP_STATUS.failure ? 'text-red-700 dark:text-red-300' : 
                                        'text-gray-900 dark:text-white'
                                    }`}>
                                        {step.title}
                                    </h3>
                                    <span className={`text-xs font-semibold py-1 px-3 rounded-full flex-shrink-0 transition-colors ${
                                        isStepSuccessful ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100' :
                                        state === STEP_STATUS.failure ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-100' :
                                        state === STEP_STATUS.checking ? 'bg-sky-200 text-sky-800 dark:bg-sky-800 dark:text-sky-100' :
                                        'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                        {statusText}
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