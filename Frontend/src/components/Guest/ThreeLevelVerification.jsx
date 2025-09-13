import React from "react";
import { CheckCircle, Clock, Loader2, Lock, Database, Hash } from "lucide-react";

// --- Utility Components for Visual Polish ---

// 1. Step Indicator (Circle + Icon)
const StepIndicator = ({ state, level }) => {
  let icon, colorClass, animationClass = "";

  switch (state) {
    case "success":
      icon = <CheckCircle className="h-5 w-5" />;
      colorClass = "bg-green-500 text-white";
      break;
    case "failure":
      icon = <Lock className="h-5 w-5" />; // Using Lock as a generic security failure icon
      colorClass = "bg-red-500 text-white";
      break;
    case "checking":
      icon = <Loader2 className="h-5 w-5 animate-spin" />;
      colorClass = "bg-blue-500 text-white";
      animationClass = "animate-pulse";
      break;
    case "resting":
    default:
      icon = <Clock className="h-5 w-5" />;
      colorClass = "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400";
  }

  // Choose icon based on level for resting/checking
  if (state === "resting" || state === "checking") {
    switch (level) {
      case 1:
        icon = <Database className="h-5 w-5" />;
        break;
      case 2:
        icon = <Hash className="h-5 w-5" />;
        break;
      case 3:
        icon = <Lock className="h-5 w-5" />;
        break;
      default:
        icon = <Clock className="h-5 w-5" />;
    }
  }

  return (
    <div className={`flex items-center justify-center h-10 w-10 rounded-full ${colorClass} ${animationClass}`}>
      {icon}
    </div>
  );
};

// 2. Connector Line
const Connector = ({ state }) => {
  let colorClass;
  switch (state) {
    case "success":
      colorClass = "bg-green-500";
      break;
    case "failure":
      colorClass = "bg-red-500";
      break;
    case "checking":
      colorClass = "bg-blue-500 opacity-50";
      break;
    case "resting":
    default:
      colorClass = "bg-gray-300 dark:bg-gray-600";
  }
  return <div className={`w-1 h-12 ${colorClass} transition-all duration-500`}></div>;
};

// --- Main Component ---

/**
 * @param {object} props
 * @param {'resting' | 'checking' | 'success' | 'failure'} props.level1State
 * @param {'resting' | 'checking' | 'success' | 'failure'} props.level2State
 * @param {'resting' | 'checking' | 'success' | 'failure'} props.level3State
 */
const ThreeLevelVerification = ({ level1State, level2State, level3State }) => {
  const steps = [
    {
      level: 1,
      title: "Level 1: Extraction & Validation",
      description: "OCR Data Extraction + Database Check",
      state: level1State,
    },
    {
      level: 2,
      title: "Level 2: Integrity Check",
      description: "Document Hashing Check",
      state: level2State,
    },
    {
      level: 3,
      title: "Level 3: Authenticity Check",
      description: "Cryptographic Signature Check",
      state: level3State,
    },
  ];

  const getTextColor = (state) => {
    switch (state) {
      case "success": return "text-green-600 dark:text-green-400";
      case "failure": return "text-red-600 dark:text-red-400";
      case "checking": return "text-blue-600 dark:text-blue-400 font-semibold";
      case "resting":
      default: return "text-gray-500 dark:text-gray-400";
    }
  };

  return (
    <div className="flex flex-col space-y-0.5">
      {steps.map((step, index) => (
        <React.Fragment key={step.level}>
          <div className="flex items-start space-x-4">
            <StepIndicator state={step.state} level={step.level} />
            <div className="flex-1 pt-1">
              <h3 className={`text-base font-medium ${getTextColor(step.state)} transition-colors duration-300`}>
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {step.description}
              </p>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className="flex justify-center -translate-x-8">
              <Connector state={steps[index + 1].state === 'resting' ? steps[index].state : steps[index + 1].state} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ThreeLevelVerification;