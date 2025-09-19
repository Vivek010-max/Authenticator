import React, { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";

import UploadBox from "../../components/Guest/UploadBox.jsx";
import VerificationResults from "../../components/Guest/VerificationResults.jsx";
import VerticalStepper from "../../components/Guest/VerticalStepper.jsx";
import { FileText, Image, CheckCircle } from "lucide-react";
import RoleBasedNavbar from "../../components/RoleBasedNavbar.jsx";

// ==========================
// Helpers for OCR + Crypto
// ==========================
const normalizeDate = (dateStr) => {
  if (!dateStr) return "";
  const formats = [
    /\b(\d{2})\/(\d{2})\/(\d{4})\b/,
    /\b(\d{4})-(\d{2})-(\d{2})\b/,
    /\b(\d{2})-(\d{2})-(\d{4})\b/,
    /\b(\d{2}) (\w{3}) (\d{4})\b/
  ];
  for (let fmt of formats) {
    const match = dateStr.match(fmt);
    if (match) return `${match[3] || match[1]}-${match[2]}-${match[1]}`;
  }
  return dateStr;
};

const canonicalizeCertificate = (rawData) => {
  const normalized = {};
  Object.entries(rawData).forEach(([k, v]) => {
    if (!v) return;
    let key = k.trim().toLowerCase().replace(" ", "_");
    if (key === "dob" || key === "date_of_birth") normalized["dob"] = normalizeDate(v);
    else if (key === "enrollment_no" || key === "enrollment_number") normalized["enrollment_no"] = v.trim();
    else if (key === "student_name" || key === "name") normalized["name"] = v.trim();
    else if (key === "course" || key === "program") normalized["course"] = v.trim();
    else if (key === "branch" || key === "specialization") normalized["branch"] = v.trim();
    else if (key === "date") normalized["date"] = normalizeDate(v);
    else if (key === "semester" || key === "sem") normalized["semester"] = v.trim();
    else if (key === "university") normalized["university"] = v.trim();
  });
  const canonicalJson = JSON.stringify(normalized, Object.keys(normalized).sort(), ",");
  return canonicalJson;
};

const sha256 = async (text) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const generateKeys = async () => {
  const stored = localStorage.getItem("rsaKeys");
  if (stored) {
    const parsed = JSON.parse(stored);
    const privateKey = await crypto.subtle.importKey(
      "jwk",
      parsed.privateKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      true,
      ["sign"]
    );
    const publicKey = await crypto.subtle.importKey(
      "jwk",
      parsed.publicKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      true,
      ["verify"]
    );
    return { privateKey, publicKey };
  }

  const keyPair = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"]
  );

  const privateJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  localStorage.setItem("rsaKeys", JSON.stringify({ privateKey: privateJwk, publicKey: publicJwk }));

  return keyPair;
};

const signHash = async (hash, privateKey) => {
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, new TextEncoder().encode(hash));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const addToLedger = (entry) => {
  const ledger = JSON.parse(localStorage.getItem("ledger") || "[]");
  ledger.push(entry);
  localStorage.setItem("ledger", JSON.stringify(ledger));
};

// ==========================
// Main Component
// ==========================
const Issuer = () => {
  const [issuing, setIssuing] = useState(false);
  const [issuingResults, setIssuingResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [stepStates, setStepStates] = useState(["resting", "resting", "resting"]);
  const [rsaKeys, setRsaKeys] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    generateKeys().then(setRsaKeys);
  }, []);

  const runIssuingStepper = async (result) => {
    const success = result?.final_verdict?.toLowerCase() === "issued";

    setStepStates(["checking", "resting", "resting"]);
    await new Promise((r) => setTimeout(r, 900));
    setStepStates([success ? "success" : "failure", "checking", "resting"]);
    await new Promise((r) => setTimeout(r, 900));
    setStepStates([success ? "success" : "failure", success ? "success" : "failure", "checking"]);
    await new Promise((r) => setTimeout(r, 900));
    setStepStates([success ? "success" : "failure", success ? "success" : "failure", success ? "success" : "failure"]);
  };

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files).slice(0, 1);
    setSelectedFiles(fileArray);
    setIssuingResults(null);
    setStepStates(["resting", "resting", "resting"]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files);
  };

  const processCertificate = async () => {
    if (!rsaKeys) return alert("Keys are not ready yet.");
    if (selectedFiles.length === 0) return alert("Please upload a certificate.");

    setIssuing(true);
    const file = selectedFiles[0];

    try {
      const { data: { text } } = await Tesseract.recognize(file, "eng");

      const extractedFields = {};
      if (text.toUpperCase().includes("GUJARAT TECHNOLOGICAL UNIVERSITY"))
        extractedFields.University = "Gujarat Technological University";

      const enrollMatch = text.match(/\b\d{11,}\b/);
      if (enrollMatch) extractedFields["Enrollment No"] = enrollMatch[0];

      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      if (enrollMatch) {
        const idx = lines.findIndex((l) => l.includes(enrollMatch[0]));
        if (idx > 0) extractedFields["Student Name"] = lines[idx - 1].trim();
      }

      // Attach file name to extracted data
      const extracted = { file_name: file.name, ...extractedFields };

      const canonicalJson = canonicalizeCertificate(extracted);
      const hash = await sha256(canonicalJson);
      const signature = await signHash(hash, rsaKeys.privateKey);
      const entry = { university: extracted.University || "Unknown", hash, signature, timestamp: new Date().toISOString() };
      addToLedger(entry);

      const result = {
        extracted_data: extracted,
        canonical_json: canonicalJson,
        hash,
        steps: { ocr: "done", hashing: "done", signing: "done" },
        final_verdict: "Issued",
        message: "Certificate issued and added to ledger."
      };

      setIssuingResults(result);
      await runIssuingStepper(result);
    } catch (err) {
      console.error(err);
      alert("Issuing failed.");
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none
            bg-gradient-to-b from-sky-400 via-blue-300 to-sky-500
            dark:bg-gradient-to-b dark:from-gray-900 dark:via-purple-900 dark:to-violet-600" />

      <div className="sticky top-0 z-50">
        <RoleBasedNavbar />
      </div>

      <div className="relative z-40 min-h-screen flex flex-col p-0">
        <div className="flex-grow p-4 pt-4 sm:pt-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="w-full h-full rounded-2xl bg-white/80 dark:bg-transparent backdrop-blur-sm shadow-xl border border-gray-100 dark:border-gray-700 p-5 flex items-center justify-center mb-8">
              <h1 className="text-black dark:text-white">
                || This is for the Institutes to upload their data directly to our database. We accept raw data and CSV files also ||
              </h1>
            </div>

            <h1 className="text-3xl font-bold text-gray-600 dark:text-white mb-6">
              Issue New Certificate
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 flex flex-col gap-6">
                <UploadBox
                  dragActive={dragActive}
                  handleDrag={handleDrag}
                  handleDrop={handleDrop}
                  fileInputRef={fileInputRef}
                  selectedFiles={selectedFiles}
                  handleFileSelect={handleFileSelect}
                  verifying={issuing}
                  getFileIcon={(filename) => {
                    if (!filename) return <FileText className="h-6 w-6 text-gray-500" />;
                    const ext = filename?.split(".").pop()?.toLowerCase() || "";
                    if (["pdf"].includes(ext)) return <FileText className="h-6 w-6 text-red-500" />;
                    if (["jpg", "jpeg", "png", "gif", "tiff"].includes(ext)) return <Image className="h-6 w-6 text-blue-500" />;
                    return <FileText className="h-6 w-6 text-gray-500" />;
                  }}
                />
                {selectedFiles.length > 0 && (
                  <button
                    onClick={processCertificate}
                    disabled={issuing}
                    className={`mt-1 w-full py-2 rounded-lg font-semibold transition-colors ${
                      issuing
                        ? "bg-white text-sky-500 cursor-not-allowed"
                        : "bg-green-500 border-white/30 border-2 hover:bg-green-700 text-white"
                    }`}
                  >
                    {issuing ? "Issuing..." : "Issue Certificate"}
                  </button>
                )}
              </div>

              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="rounded-xl bg-white/80 dark:bg-transparent backdrop-blur-sm shadow-xl border border-gray-100 dark:border-gray-700 p-6 min-h-[342px]">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Issuing Steps
                  </h2>
                  <VerticalStepper
                    stepStates={stepStates}
                    steps={["Extract Data (OCR)", "Generate Hash & Sign", "Add to Ledger"]}
                  />
                </div>

                {issuingResults && (
                  <VerificationResults
                    verificationResults={[issuingResults]}
                    getFileIcon={(filename) => {
                      const ext = filename?.split(".").pop()?.toLowerCase() || "";
                      if (["pdf"].includes(ext)) return <FileText className="h-6 w-6 text-red-500" />;
                      return <Image className="h-6 w-6 text-blue-500" />;
                    }}
                    getStatusIcon={() => <CheckCircle className="h-5 w-5 text-green-500" />}
                    getStatusColor={() => "bg-green-100 text-green-800"}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Issuer;
