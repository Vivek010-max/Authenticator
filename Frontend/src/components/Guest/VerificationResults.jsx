import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Download, FileText, CheckCircle, XCircle, Loader2, Search, Hash, Shield } from 'lucide-react';

const stepsMeta = [
  {
    key: 'level1',
    label: 'OCR & Database',
    icon: <Search className="h-4 w-4" />,
    desc: 'Text extraction and record check',
  },
  {
    key: 'level2',
    label: 'Hashing Check',
    icon: <Hash className="h-4 w-4" />,
    desc: 'Compare to stored hash',
  },
  {
    key: 'level3',
    label: 'Signature',
    icon: <Shield className="h-4 w-4" />,
    desc: 'Digital signature verification',
  },
];

function statusUI(state) {
  if (state === 'success')
    return (
      <span className="flex items-center space-x-1 text-green-600 dark:text-green-300 font-medium">
        <CheckCircle className="h-4 w-4" /> <span>Passed</span>
      </span>
    );
  if (state === 'failure')
    return (
      <span className="flex items-center space-x-1 text-red-600 dark:text-red-400 font-medium">
        <XCircle className="h-4 w-4" /> <span>Failed</span>
      </span>
    );
  if (state === 'checking')
    return (
      <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-300 animate-pulse font-medium">
        <Loader2 className="h-4 w-4 animate-spin" /> <span>Checking…</span>
      </span>
    );
  return (
    <span className="flex items-center space-x-1 text-gray-400 font-medium">
      <Loader2 className="h-4 w-4" /> <span>Waiting…</span>
    </span>
  );
}

const VerificationResults = ({
  verificationResults,
  getFileIcon,
  getStatusIcon,
  getStatusColor,
  handleDownloadReport,
}) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle>Verification Results</CardTitle>
        {verificationResults.length > 0 && (
          <Button onClick={handleDownloadReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        )}
      </div>
    </CardHeader>
    <CardContent>
      {verificationResults.length > 0 ? (
        <div className="space-y-4">
          {verificationResults.map((result, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getFileIcon(result.filename)}
                  <div>
                    <p className="font-medium">{result.filename}</p>
                    <p className="text-sm text-gray-500">
                      {result.confidence ? `Confidence: ${result.confidence}%` : 'Processing completed'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(result.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                    {result.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
              </div>
              {/* --- Stepper for per-level verification --- */}
              <div className="flex flex-col md:flex-row gap-6 mb-3">
                <ol className="flex-1 border-l border-gray-200 dark:border-gray-700">
                  {stepsMeta.map((step, idx) => {
                    const stepState = (
                      result.levels &&
                      result.levels[step.key] &&
                      result.levels[step.key].status
                    ) || "resting";
                    return (
                      <li key={step.key} className={`ml-6 mb-4 last:mb-0`}>
                        <div className="absolute -left-6 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-black border border-gray-200 dark:border-gray-700 ring-2 ring-gray-100 dark:ring-gray-600">
                          {step.icon}
                        </div>
                        <div className="pl-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium dark:text-white">{step.label}</span>
                            {/* Status UI for this level */}
                            {statusUI(stepState)}
                          </div>
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{step.desc}</p>
                          {stepState === 'failure' && result.levels[step.key]?.error && (
                            <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                              {result.levels[step.key].error}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
                {/* Optional: document-level extracted data if present */}
                {result.extractedData && (
                  <div className="flex-1 min-w-[200px] p-2 bg-gray-50 dark:bg-gray-800 rounded h-fit">
                    <h5 className="text-xs font-semibold mb-2 text-gray-800 dark:text-gray-200">Extracted Information:</h5>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {Object.entries(result.extractedData).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                          <span className="font-medium">{value || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Top-level error */}
              {result.error && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <p className="text-sm text-red-600 dark:text-red-400">Error: {result.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Upload certificates to see verification results</p>
        </div>
      )}
    </CardContent>
  </Card>
);

export default VerificationResults;
