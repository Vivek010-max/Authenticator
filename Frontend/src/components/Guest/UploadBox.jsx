import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Upload,
  FileText,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';

const UploadBox = ({
  dragActive,
  handleDrag,
  handleDrop,
  fileInputRef,
  handleFileSelect,
  showFallbackInput,
  fallbackInput,
  setFallbackInput,
  selectedFiles,
  handleVerification,
  verifying,
  verificationResults,
  handleClearResults,
  guestSessionId,
  endSession,
  getFileIcon,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Certificates</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-red-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-gray-100'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.tiff"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {!showFallbackInput ? (
            <>
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-sm dark:text-gray-400 text-gray-900 font-medium mb-2">
                Drop certificates here
              </p>
              <p className="text-xs text-gray-500 mb-4">or click to browse files</p>
            </>
          ) : (
            <input
              type="text"
              value={fallbackInput}
              onChange={(e) => setFallbackInput(e.target.value)}
              placeholder="Enter certificate number"
              className="w-full px-3 py-2 border rounded text-gray-900 dark:text-white"
              autoFocus
            />
          )}

          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            className="mb-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            Choose Files
          </Button>
          <p className="text-xs text-gray-400">Max 10 files, 10MB each</p>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Selected Files ({selectedFiles.length})</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  {getFileIcon(file.name)}
                  <span className="truncate">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6  space-y-2">
          <Button
            onClick={handleVerification}
            disabled={
              (!showFallbackInput && selectedFiles.length === 0) ||
              verifying ||
              (showFallbackInput && fallbackInput.trim() === '')
            }
            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 border border-white dark:border-black flex items-center justify-center space-x-2"
          >
            {verifying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="h-4  w-4 mr-2" />
                Verify Certificates
              </>
            )}
          </Button>

          {verificationResults.length > 0 && (
            <Button onClick={handleClearResults} variant="outline" className="w-full">
              Clear Results
            </Button>
          )}
        </div>

        {guestSessionId && (
          <Button onClick={endSession} variant="destructive" className="w-full mt-4">
            End Session
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadBox;