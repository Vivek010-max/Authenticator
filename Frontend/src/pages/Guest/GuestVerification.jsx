import React, { useState, useEffect, useRef } from "react";
import axios from "../../axios.js";
import PublicNavbar from "../../components/PublicNavbar";
import UploadBox from "../../components/Guest/UploadBox.jsx";
import VerificationResults from "../../components/Guest/VerificationResults.jsx";
import HistoryList from "../../components/Guest/HistoryList.jsx";
import VerticalStepper from "../../components/Guest/VerticalStepper.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import {
  Upload,
  FileText,
  Image,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const GuestVerification = () => {
  const [guestSessionId, setGuestSessionId] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fallbackInput, setFallbackInput] = useState("");
  const [showFallbackInput, setShowFallbackInput] = useState(false);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [stepStates, setStepStates] = useState(["resting", "resting", "resting"]); // NEW

  const fileInputRef = useRef(null);
  const Base_url = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const startSession = async () => {
      try {
        const res = await axios.post(`${Base_url}/verify/session`);
        setGuestSessionId(res.data.data.guestSessionId);
        localStorage.setItem("guestSessionId", res.data.data.guestSessionId);
      } catch (error) {
        console.error("Error creating guest session:", error);
      }
    };
    const storedSessionId = localStorage.getItem("guestSessionId");
    if (storedSessionId) {
      setGuestSessionId(storedSessionId);
      fetchSessionHistory(storedSessionId);
    } else {
      startSession();
    }
  }, []);

  // NEW: simulate or drive stepper transition
  const runVerificationStepper = async (backendResult) => {
    setStepStates(["checking", "resting", "resting"]);
    await new Promise((r) => setTimeout(r, 900));
    // Level 1 result
    const l1Success = backendResult?.level1?.status === "success";
    setStepStates([l1Success ? "success" : "failure", "checking", "resting"]);
    await new Promise((r) => setTimeout(r, 900));
    // Level 2 result
    const l2Success = backendResult?.level2?.status === "success";
    setStepStates([
      l1Success ? "success" : "failure",
      l2Success ? "success" : "failure",
      "checking",
    ]);
    await new Promise((r) => setTimeout(r, 900));
    // Level 3 result
    const l3Success = backendResult?.level3?.status === "success";
    setStepStates([
      l1Success ? "success" : "failure",
      l2Success ? "success" : "failure",
      l3Success ? "success" : "failure",
    ]);
  };

  // update: simulate stepper on results load
  useEffect(() => {
    if (
      Array.isArray(verificationResults) &&
      verificationResults.length > 0 &&
      verificationResults?.levels
    ) {
      runVerificationStepper(verificationResults.levels);
    } else {
      setStepStates(["resting", "resting", "resting"]);
    }
  }, [verificationResults]);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files).slice(0, 10); // Max 10 files
    setSelectedFiles(fileArray);
    setShowFallbackInput(false);
    setFallbackInput("");
    setVerificationResults([]);
    setStepStates(["resting", "resting", "resting"]);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    } else {
      setShowFallbackInput(true);
      setSelectedFiles([]);
    }
  };

  const handleVerification = async () => {
    if (selectedFiles.length === 0) {
      alert("Please upload at least one file.");
      return;
    }
    let sessionId = guestSessionId;
    if (!sessionId) {
      try {
        const res = await axios.post(`${Base_url}/verify/session`);
        sessionId = res.data.data.guestSessionId;
        setGuestSessionId(sessionId);
        localStorage.setItem("guestSessionId", sessionId);
      } catch (err) {
        console.error("Error creating guest session:", err);
        alert("Unable to start verification session. Try again.");
        return;
      }
    }
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("file", file)); // key matches backend
    formData.append("guestSessionId", sessionId);

    setVerifying(true);
    setStepStates(["checking", "resting", "resting"]); // Stepper active
    try {
      const response = await axios.post(`${Base_url}/verify/`, formData, {
        withCredentials: true,
      });
      setVerificationResults(response.data.data || []);
      fetchSessionHistory(sessionId);
    } catch (error) {
      console.error("Verification failed:", error);
      alert(
        error?.response?.data?.message ||
          "Verification failed. Please check your files and try again."
      );
      setStepStates(["failure", "resting", "resting"]);
    } finally {
      setVerifying(false);
    }
  };

  const fetchSessionHistory = async (sessionId) => {
    if (!sessionId) return;
    try {
      const response = await axios.get(`${Base_url}/verify/history/${sessionId}`);
      setVerificationHistory(response.data.data || []);
    } catch (error) {
      console.error("Error fetching session history:", error);
    }
  };

  const endSession = async () => {
    if (!guestSessionId) return;
    try {
      await axios.delete(`${Base_url}/verify/session/${guestSessionId}`);
      setGuestSessionId(null);
      localStorage.removeItem("guestSessionId");
      setVerificationHistory([]);
      setVerificationResults([]);
      setSelectedFiles([]);
      setStepStates(["resting", "resting", "resting"]);
      alert("Session ended successfully.");
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  const getFileIcon = (filename) => {
    if (!filename)
      return <FileText className="h-6 w-6 text-gray-500" />;
    const extension = filename.split(".").pop().toLowerCase();
    if (["pdf"].includes(extension)) return <FileText className="h-6 w-6 text-red-500" />;
    if (["jpg", "jpeg", "png", "gif", "tiff"].includes(extension))
      return <Image className="h-6 w-6 text-blue-500" />;
    return <FileText className="h-6 w-6 text-gray-500" />;
  };

  const getStatusIcon = (status) => {
    if (!status) status = "unknown";
    status = status.toLowerCase();
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "fraud":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "doubtful":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <RefreshCw className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    if (!status) status = "unknown";
    status = status.toLowerCase();
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200";
      case "fraud":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200";
      case "doubtful":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200";
    }
  };

  const handleClearResults = () => {
    setVerificationResults([]);
    setSelectedFiles([]);
    setFallbackInput("");
    setShowFallbackInput(false);
    setStepStates(["resting", "resting", "resting"]);
  };

  const handleDownloadReport = () => {
    const reportData = verificationResults.map((result) => ({
      filename: result.filename || "Unknown",
      status: result.status || "unknown",
      confidence: result.confidence,
      extractedData: result.extractedData,
      timestamp: new Date().toISOString(),
    }));
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `verification-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload + History */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <UploadBox
              dragActive={dragActive}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              fileInputRef={fileInputRef}
              handleFileSelect={handleFileSelect}
              showFallbackInput={showFallbackInput}
              fallbackInput={fallbackInput}
              setFallbackInput={setFallbackInput}
              selectedFiles={selectedFiles}
              handleVerification={handleVerification}
              verifying={verifying}
              verificationResults={verificationResults}
              handleClearResults={handleClearResults}
              guestSessionId={guestSessionId}
              endSession={endSession}
              getFileIcon={getFileIcon}
            />
            <HistoryList
              verificationHistory={verificationHistory}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
            />
          </div>
          {/* Stepper + Results */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="rounded-xl bg-white dark:bg-black shadow-sm border-1 border-black dark:border-white/60 p-6 mb-4 transition-all min-h-[342px]">
              <VerticalStepper stepStates={stepStates} />
            </div>
            <VerificationResults
              verificationResults={verificationResults}
              getFileIcon={getFileIcon}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              handleDownloadReport={handleDownloadReport}
            />
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default GuestVerification;
