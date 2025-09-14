import React, { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import PublicNavbar from "../../components/PublicNavbar";
import UploadBox from "../../components/Guest/UploadBox.jsx";
import VerificationResults from "../../components/Guest/VerificationResults.jsx";
import VerticalStepper from "../../components/Guest/VerticalStepper.jsx";
import { FileText, Image, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

// ==========================
// Helpers for OCR + Crypto
// ==========================
const normalizeDate = (dateStr) => {
  if (!dateStr) return "";
  const formats = [
    /\b(\d{2})\/(\d{2})\/(\d{4})\b/, // 31/12/2023
    /\b(\d{4})-(\d{2})-(\d{2})\b/,   // 2023-12-31
    /\b(\d{2})-(\d{2})-(\d{4})\b/,   // 31-12-2023
    /\b(\d{2}) (\w{3}) (\d{4})\b/    // 31 Dec 2023
  ];
  for (let fmt of formats) {
    const match = dateStr.match(fmt);
    if (match) return `${match[3] || match[1]}-${match[2]}-${match[1]}`; // Simple normalization
  }
  return dateStr;
};

const canonicalizeCertificate = (rawData) => {
  const normalized = {};
  Object.entries(rawData).forEach(([k, v]) => {
    if (!v) return;
    let key = k.trim().toLowerCase().replace(" ", "_");
    if (key === "dob" || key === "date_of_birth") {
      normalized["dob"] = normalizeDate(v);
    } else if (key === "enrollment_no" || key === "enrollment_number") {
      normalized["enrollment_no"] = v.trim();
    } else if (key === "student_name" || key === "name") {
      normalized["name"] = v.trim();
    } else if (key === "course" || key === "program") {
      normalized["course"] = v.trim();
    } else if (key === "branch" || key === "specialization") {
      normalized["branch"] = v.trim();
    } else if (key === "date") {
      normalized["date"] = normalizeDate(v);
    } else if (key === "semester" || key === "sem") {
      normalized["semester"] = v.trim();
    } else if (key === "university") {
      normalized["university"] = v.trim();
    }
  });
  const canonicalJson = JSON.stringify(normalized, Object.keys(normalized).sort(), ",");
  return canonicalJson;
};

// SHA-256 hash
const sha256 = async (text) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

// Generate or load RSA key pair
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

// Sign hash
const signHash = async (hash, privateKey) => {
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, new TextEncoder().encode(hash));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

// Verify signature
const verifySignature = async (hash, signatureHex, publicKey) => {
  const sigBytes = new Uint8Array(signatureHex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
  return crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKey, sigBytes, new TextEncoder().encode(hash));
};

// Ledger functions
const addToLedger = (entry) => {
  const ledger = JSON.parse(localStorage.getItem("ledger") || "[]");
  ledger.push(entry);
  localStorage.setItem("ledger", JSON.stringify(ledger));
};

const findInLedger = (hash) => {
  const ledger = JSON.parse(localStorage.getItem("ledger") || "[]");
  return ledger.find((e) => e.hash === hash);
};

// ==========================
// Main Component
// ==========================
const GuestVerification = () => {
  const [verifying, setVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [stepStates, setStepStates] = useState(["resting", "resting", "resting"]);
  const [rsaKeys, setRsaKeys] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    generateKeys().then(setRsaKeys);
  }, []);

  // Stepper animation
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

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files).slice(0, 1);
    setSelectedFiles(fileArray);
    setVerificationResults(null);
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

  // ===== OCR + Issue / Verify =====
  const processCertificate = async (issue = false) => {
    if (!rsaKeys) return alert("Keys are not ready yet.");
    if (selectedFiles.length === 0) return alert("Please upload a certificate.");

    setVerifying(true);
    const file = selectedFiles[0];

    try {
      const { data: { text } } = await new Promise((resolve, reject) => {
        Tesseract.recognize(file, "eng", { logger: (m) => {} })
          .then((res) => resolve({ data: { text: res.data.text } }))
          .catch(reject);
      });

      // Extract some demo fields
      const extracted = {};
      if (text.toUpperCase().includes("GUJARAT TECHNOLOGICAL UNIVERSITY")) extracted.University = "Gujarat Technological University";
      const enrollMatch = text.match(/\b\d{11,}\b/);
      if (enrollMatch) extracted["Enrollment No"] = enrollMatch[0];
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      if (enrollMatch) {
        const idx = lines.findIndex((l) => l.includes(enrollMatch[0]));
        if (idx > 0) extracted["Student Name"] = lines[idx - 1].trim();
      }

      const canonicalJson = canonicalizeCertificate(extracted);
      const hash = await sha256(canonicalJson);

      const result = { extracted_data: extracted, canonical_json: canonicalJson, hash, steps: {} };

      if (issue) {
        const signature = await signHash(hash, rsaKeys.privateKey);
        const entry = { university: extracted.University || "Unknown", hash, signature, timestamp: new Date().toISOString() };
        addToLedger(entry);
        result.steps.issue = "done";
        result.final_verdict = "Issued";
        result.message = "Certificate issued and added to ledger.";
      } else {
        const ledgerEntry = findInLedger(hash);
        if (!ledgerEntry) {
          result.steps.hash_check = "failed";
          result.final_verdict = "Tampered";
          result.message = "Certificate hash not found in ledger.";
        } else {
          const valid = await verifySignature(hash, ledgerEntry.signature, rsaKeys.publicKey);
          result.steps.hash_check = "done";
          result.steps.signature_verification = valid ? "done" : "failed";
          result.final_verdict = valid ? "Verified" : "Tampered";
          result.message = valid ? "Certificate authentic. Signature verified." : "Signature invalid. Certificate may be tampered.";
        }
      }

      setVerificationResults(result);
      await runVerificationStepper(result);
    } catch (err) {
      console.error(err);
      alert("Processing failed.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <UploadBox
              dragActive={dragActive}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              fileInputRef={fileInputRef}
              selectedFiles={selectedFiles}
              handleVerification={() => processCertificate(false)}
              verifying={verifying}
              getFileIcon={(filename) => {
                if (!filename) return <FileText className="h-6 w-6 text-gray-500" />;
                const ext = filename.split(".").pop().toLowerCase();
                if (["pdf"].includes(ext)) return <FileText className="h-6 w-6 text-red-500" />;
                if (["jpg", "jpeg", "png", "gif", "tiff"].includes(ext)) return <Image className="h-6 w-6 text-blue-500" />;
                return <FileText className="h-6 w-6 text-gray-500" />;
              }}
              handleFileSelect={handleFileSelect}
            />
            {selectedFiles.length > 0 && (
              <button
                onClick={() => processCertificate(true)}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
              >
                Issue Certificate
              </button>
            )}
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="rounded-xl bg-white dark:bg-black shadow-sm border p-6 mb-4 min-h-[342px]">
              <VerticalStepper stepStates={stepStates} />
            </div>
            {verificationResults && (
              <VerificationResults
                verificationResults={[verificationResults]}
                getFileIcon={(filename) => {
                  if (!filename) return <FileText className="h-6 w-6 text-gray-500" />;
                  const ext = filename.split(".").pop().toLowerCase();
                  if (["pdf"].includes(ext)) return <FileText className="h-6 w-6 text-red-500" />;
                  if (["jpg", "jpeg", "png", "gif", "tiff"].includes(ext)) return <Image className="h-6 w-6 text-blue-500" />;
                  return <FileText className="h-6 w-6 text-gray-500" />;
                }}
                getStatusIcon={(status) => {
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
                }}
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
