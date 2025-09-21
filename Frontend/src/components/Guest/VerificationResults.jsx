import React from "react";
import { FileText, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const VerificationResults = ({ verificationResults, getFileIcon, getStatusIcon, getStatusColor }) => {
  return (
    <div className="space-y-6">
      {verificationResults.map((result, idx) => (
        <div
          key={idx}
          className={`p-4 border rounded-lg ${getStatusColor(result.final_verdict)}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getFileIcon(result.extracted_data?.file_name)}
              <span className="font-semibold">{result.extracted_data?.name || "UNKNOWN"}</span>
            </div>
            <div>{getStatusIcon(result.final_verdict)}</div>
          </div>

          {/* OCR Extracted Data */}
          <div className="mb-2">
            <h4 className="font-medium">Extracted Data:</h4>
            {Object.keys(result.extracted_data || {}).length === 0 ? (
              <p className="text-sm text-gray-500">No data extracted</p>
            ) : (
              <ul className="text-sm">
                {Object.entries(result.extracted_data).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key.replace("_", " ")}:</strong> {value}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Hash */}
          <div className="mb-2">
            <h4 className="font-medium">Hash:</h4>
            <p className="text-sm break-all">{result.hash || "N/A"}</p>
          </div>

          {/* Signature */}
          {result.steps?.signature_verification && (
            <div className="mb-2">
              <h4 className="font-medium">Signature Verification:</h4>
              <p className="text-sm">
                {result.steps.signature_verification === "done" ? "Valid" : "Invalid"}
              </p>
            </div>
          )}

          {/* Final Verdict */}
          <div>
            <h4 className="font-medium">Final Verdict:</h4>
            <p className="text-sm">{result.final_verdict || "UNKNOWN"}</p>
          </div>

          {/* Optional message */}
          {result.message && (
            <div className="mt-2 text-sm text-gray-600">{result.message}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VerificationResults;