import React, { useState, useRef } from "react";
import axios from "axios";
import PublicNavbar from "../../components/PublicNavbar";
import UploadBox from "../../components/Guest/UploadBox.jsx";
import VerificationResults from "../../components/Guest/VerificationResults.jsx";
import VerticalStepper from "../../components/Guest/VerticalStepper.jsx";
import {
  FileText,
  Image,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

const GuestVerification = () => {
  const [verifying, setVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [stepStates, setStepStates] = useState(["resting", "resting", "resting"]);

  const fileInputRef = useRef(null);
  const Base_url = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

  // Stepper animation based on backend verdict
  const runVerificationStepper = async (result) => {
    const verdict = result?.final_verdict?.toLowerCase();
    const success = verdict === "verified" || verdict === "issued";

    setStepStates(["checking", "resting", "resting"]);
    await new Promise((r) => setTimeout(r, 900));
    setStepStates([success ? "success" : "failure", "checking", "resting"]);
    await new Promise((r) => setTimeout(r, 900));
    setStepStates([success ? "success" : "failure", success ? "success" : "failure", "checking"]);
    await new Promise((r) => setTimeout(r, 900));
    setStepStates([success ? "success" : "failure", success ? "success" : "failure", success ? "success" : "failure"]);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      fileInputRef.current.files = e.dataTransfer.files;
      setVerificationResults(null);
      setStepStates(["resting", "resting", "resting"]);
    }
  };

  // Handle verification
  const handleVerification = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) return alert("Please upload a certificate image.");

    const formData = new FormData();
    formData.append("image", file);

    setVerifying(true);
    setStepStates(["checking", "resting", "resting"]);
    try {
      const { data } = await axios.post(`${Base_url}/verify_certificate/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setVerificationResults(data);
      await runVerificationStepper(data);
    } catch (err) {
      console.error("Verification failed:", err);
      alert(err?.response?.data?.error || "Verification failed.");
      setStepStates(["failure", "resting", "resting"]);
    } finally {
      setVerifying(false);
    }
  };

  // Handle issuing
  const handleIssue = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) return alert("Please upload a certificate image.");

    const formData = new FormData();
    formData.append("image", file);

    setVerifying(true);
    try {
      const { data } = await axios.post(`${Base_url}/issue_certificate/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setVerificationResults(data);
      await runVerificationStepper(data);
    } catch (err) {
      console.error("Issuing failed:", err);
      alert(err?.response?.data?.error || "Issuing failed.");
    } finally {
      setVerifying(false);
    }
  };

  // File icons
  const getFileIcon = (filename) => {
    if (!filename) return <FileText className="h-6 w-6 text-gray-500" />;
    const ext = filename.split(".").pop().toLowerCase();
    if (["pdf"].includes(ext)) return <FileText className="h-6 w-6 text-red-500" />;
    if (["jpg", "jpeg", "png", "gif", "tiff"].includes(ext)) return <Image className="h-6 w-6 text-blue-500" />;
    return <FileText className="h-6 w-6 text-gray-500" />;
  };

  // Status icons
  const getStatusIcon = (status) => {
    if (!status) status = "unknown";
    status = status.toLowerCase();
    switch (status) {
      case "verified":
      case "issued":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "tampered":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Box */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <UploadBox
              dragActive={dragActive}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              fileInputRef={fileInputRef}
              selectedFiles={fileInputRef.current?.files ? Array.from(fileInputRef.current.files) : []}
              handleVerification={handleVerification}
              verifying={verifying}
              getFileIcon={getFileIcon}
            />
            {fileInputRef.current?.files?.length > 0 && (
              <button
                onClick={handleIssue}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
              >
                Issue Certificate
              </button>
            )}
          </div>

          {/* Stepper + Results */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="rounded-xl bg-white dark:bg-black shadow-sm border p-6 mb-4 min-h-[342px]">
              <VerticalStepper stepStates={stepStates} />
            </div>
            {verificationResults && (
              <VerificationResults
                verificationResults={[verificationResults]}
                getFileIcon={getFileIcon}
                getStatusIcon={getStatusIcon}
                getStatusColor={(status) =>
                  status === "Verified" || status === "Issued"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestVerification;
