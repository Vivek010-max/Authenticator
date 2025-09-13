import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContex';
import axios from '../../axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Upload, 
  FileText, 
  Image, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';

const CertificateUpload = () => {
  const { currentUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const file = files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

  const response = await axios.post('/institute/certificates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      setUploadResult(response.data.data);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        upload: { success: false, error: error.response?.data?.message || 'Upload failed' },
        processing: { success: false, error: 'Processing failed' }
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRetry = () => {
    setUploadResult(null);
    setUploadProgress(0);
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'tiff'].includes(extension)) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'doubtable':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <RefreshCw className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Certificate Upload
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Upload and process certificates using AI-powered OCR
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Certificate</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
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
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                
                {uploading ? (
                  <div className="space-y-4">
                    <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
                    <div>
                      <p className="text-lg font-medium">Uploading...</p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{uploadProgress}%</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium">Drop your certificate here</p>
                      <p className="text-sm text-gray-500">
                        or click to browse files
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Supports PDF, JPG, PNG, TIFF (max 10MB)
                      </p>
                    </div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4"
                    >
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Results</CardTitle>
            </CardHeader>
            <CardContent>
              {uploadResult ? (
                <div className="space-y-4">
                  {/* Upload Status */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Upload Status</span>
                      {uploadResult.upload.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    {uploadResult.upload.success ? (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>File uploaded successfully</p>
                        <p className="truncate">URL: {uploadResult.upload.url}</p>
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        <p>Upload failed: {uploadResult.upload.error}</p>
                      </div>
                    )}
                  </div>

                  {/* Processing Status */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">AI Processing</span>
                      {uploadResult.processing.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    {uploadResult.processing.success ? (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>Certificate processed successfully</p>
                        <p>Extracted {Object.keys(uploadResult.processing.data).length} fields</p>
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        <p>Processing failed: {uploadResult.processing.error}</p>
                      </div>
                    )}
                  </div>

                  {/* Extracted Data */}
                  {uploadResult.processing.success && uploadResult.processing.data && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-medium text-green-800 dark:text-green-200 mb-3">
                        Extracted Information
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(uploadResult.processing.data).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {key}:
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {Array.isArray(value) ? value.join(', ') : value || 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-4">
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      className="flex-1"
                    >
                      Upload Another
                    </Button>
                    {uploadResult.upload.success && (
                      <Button
                        onClick={() => window.open(uploadResult.upload.url, '_blank')}
                        variant="outline"
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View File
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Upload a certificate to see processing results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Upload Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Supported Formats</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• PDF documents (digital and scanned)</li>
                  <li>• Image files (JPG, PNG, TIFF)</li>
                  <li>• Maximum file size: 10MB</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Processing Features</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• AI-powered OCR text extraction</li>
                  <li>• Automatic field recognition</li>
                  <li>• Real-time processing status</li>
                  <li>• Cloud storage integration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificateUpload;
