import React, { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import UploadBox from "../../components/Guest/UploadBox.jsx";
import VerticalStepper from "../../components/Guest/VerticalStepper.jsx";
import RotatingText from "../../components/ui/RotatingText.jsx";
import RoleBasedNavbar from "../../components/RoleBasedNavbar.jsx";
import { 
    FileText, Image, CheckCircle, XCircle, CloudUpload, Key, FileSignature, 
    Download, ListChecks, FileWarning, Loader2 
} from "lucide-react";




// --- Helper functions ---
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
  return JSON.stringify(normalized, Object.keys(normalized).sort(), ",");
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
// --- End Helper functions ---

// Stepper steps names for reference
const STEP_NAMES = ["OCR Extraction", "Data Hashing", "Sign & Commit to Ledger"];

const Issuer = () => {
  const [issuing, setIssuing] = useState(false);
  const [issuingResults, setIssuingResults] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [stepStates, setStepStates] = useState([]);
  const [rsaKeys, setRsaKeys] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    generateKeys().then(setRsaKeys);
  }, []);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files).slice(0, 10);
    setSelectedFiles(fileArray);
    setIssuingResults([]);
    // Step states map to: OCR -> Hashing -> Signing/Ledger
    setStepStates(fileArray.map(() => ["resting", "resting", "resting"])); 
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (["dragenter", "dragover"].includes(e.type)) setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files);
  };

  const processCertificate = async () => {
    if (!rsaKeys) return alert("Keys are not ready yet.");
    if (selectedFiles.length === 0) return alert("Please upload certificate(s).");

    setIssuing(true);
    const results = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Start OCR step
      setStepStates(prev => {
        const copy = [...prev];
        copy[i] = ["checking", "resting", "resting"];
        return copy;
      });

      try {
        // Step 1: OCR Extraction
        const { data: { text } } = await Tesseract.recognize(file, "eng");
        
        // Simple extraction logic
        const extractedFields = {};
        if (text.toUpperCase().includes("GUJARAT TECHNOLOGICAL UNIVERSITY"))
          extractedFields.University = "Gujarat Technological University";

        const enrollMatch = text.match(/\b\d{11,}\b/);
        if (enrollMatch) extractedFields["Enrollment No"] = enrollMatch[0];

        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        if (enrollMatch) {
          const idx = lines.findIndex(l => l.includes(enrollMatch[0]));
          if (idx > 0) extractedFields["Student Name"] = lines[idx - 1].trim();
        }
        
        const extracted = { file_name: file.name, ...extractedFields };
        
        // Move to Hashing step
        setStepStates(prev => {
            const copy = [...prev];
            copy[i] = ["success", "checking", "resting"];
            return copy;
        });
        
        // Step 2: Data Hashing
        const canonicalJson = canonicalizeCertificate(extracted);
        const hash = await sha256(canonicalJson);
        
        // Move to Signing/Ledger step
        setStepStates(prev => {
            const copy = [...prev];
            copy[i] = ["success", "success", "checking"];
            return copy;
        });
        
        // Step 3: Sign & Commit
        const signature = await signHash(hash, rsaKeys.privateKey);
        addToLedger({ 
            university: extracted.University || "Unknown", 
            hash, 
            signature, 
            timestamp: new Date().toISOString(),
            fileName: file.name,
        });

        results.push({
          extracted_data: extracted,
          canonical_json: canonicalJson,
          hash,
          signature,
          final_verdict: "Issued",
          message: "Certificate issued and added to ledger successfully."
        });

        // Final step success
        setStepStates(prev => {
            const copy = [...prev];
            copy[i] = ["success", "success", "success"];
            return copy;
        });

      } catch (err) {
        console.error("Issuing Error:", err);
        results.push({ 
            file_name: file.name, 
            final_verdict: "Failed", 
            message: "Issuing failed due to OCR/Key error. Check console." 
        });
        
        // Final step failure
        setStepStates(prev => {
          const copy = [...prev];
          copy[i] = ["failure", "failure", "failure"];
          return copy;
        });
      }
    }

    setIssuingResults(results);
    setIssuing(false);
  };

  // Dynamic Layout: determines the container width and grid layout
  let contentClass = "max-w-[1200px] mx-auto";
  let gridClass = "";
  let isSingleOrDual = selectedFiles.length > 0 && selectedFiles.length <= 2;

  if (selectedFiles.length === 1) {
    gridClass = "grid grid-cols-1 max-w-2xl mx-auto";
    contentClass = "max-w-[1000px] mx-auto";
  } else if (selectedFiles.length === 2) {
    gridClass = "grid sm:grid-cols-2 grid-cols-1 gap-8 max-w-4xl mx-auto";
    contentClass = "max-w-[1100px] mx-auto";
  } else if (selectedFiles.length >= 3) {
    gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto";
  }

  // File icon helper
  const getFileIcon = (filename, sizeClass = "h-7 w-7") => {
    const ext = filename?.split(".").pop()?.toLowerCase() || "";
    if (["pdf"].includes(ext)) return <FileText className={`${sizeClass} text-red-500 dark:text-red-400`} />;
    if (["jpg", "jpeg", "png", "gif", "tiff"].includes(ext)) return <Image className={`${sizeClass} text-blue-500 dark:text-blue-400`} />;
    return <FileText className={`${sizeClass} text-gray-400 dark:text-gray-500`} />;
  };

  const handleDownloadReport = () => {
      const summary = issuingResults.reduce((acc, result) => {
          acc[result.final_verdict] = (acc[result.final_verdict] || 0) + 1;
          return acc;
      }, {});

      let reportText = "Certificate Issuing Summary Report\n";
      reportText += `Date: ${new Date().toLocaleDateString()}\n\n`;
      reportText += `Total Certificates Processed: ${issuingResults.length}\n`;
      reportText += `Issued Successfully: ${summary.Issued || 0}\n`;
      reportText += `Failed to Issue: ${summary.Failed || 0}\n\n`;

      reportText += "--- Individual Certificate Details ---\n";
      issuingResults.forEach((result, index) => {
          reportText += `\nCertificate ${index + 1}: ${result.extracted_data.file_name}\n`;
          reportText += `Status: ${result.final_verdict}\n`;
          reportText += `Message: ${result.message}\n`;
          if (result.hash) {
              reportText += `Hash: ${result.hash}\n`;
              reportText += `Signature: ${result.signature}\n`;
          }
          if (result.extracted_data) {
              reportText += `Extracted Data:\n`;
              Object.entries(result.extracted_data).forEach(([key, value]) => {
                  if (key !== "file_name") {
                      reportText += `  ${key.replace(/_/g, " ")}: ${value}\n`;
                  }
              });
          }
      });

      // Create a blob and download the file
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Issuing_Report_${new Date().toISOString().slice(0, 10)}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };


  // --- UI Components ---
  const CertificateCard = ({ file, idx, result, stepState, isSingleOrDual }) => {
    const cardBaseClasses = isSingleOrDual 
        ? "bg-white dark:bg-neutral-950/80 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 relative flex flex-col p-8 border-t-8 border-black dark:border-white backdrop-blur-sm min-h-[450px]"
        : "bg-white dark:bg-neutral-800 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 relative flex flex-col p-6 border-t-4 border-indigo-500 dark:border-emerald-500 backdrop-blur-sm min-h-[400px]";

    return (
        <div key={file.name + idx} className={cardBaseClasses}>
            
            {/* File Header */}
            <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-neutral-700">
                <div className="p-3 bg-indigo-50 dark:bg-neutral-700 rounded-xl flex-shrink-0">
                    {["jpg", "jpeg", "png", "gif"].includes(file.name.split(".").pop()?.toLowerCase()) ? (
                        <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-8 h-8 object-cover rounded-md"
                        />
                    ) : (
                        getFileIcon(file.name, "w-8 h-8")
                    )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate mb-1">
                        {file.name}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        File Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                </div>
            </div>

            <div className={`grid ${isSingleOrDual ? "md:grid-cols-2 gap-8" : "grid-cols-1"} flex-grow`}>
                {/* Stepper / Status Column */}
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-indigo-500 dark:text-emerald-400" />
                        Processing Flow
                    </h3>
                    <VerticalStepper 
                        stepNames={STEP_NAMES}
                        stepStates={stepState || ["resting", "resting", "resting"]} 
                        // isDualColumn={isSingleOrDual} // Removed to keep stepper consistent
                    />
                </div>

                {/* Extracted Data / Hash Info Column */}
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500 dark:text-emerald-400" />
                        Extracted Data 
                    </h3>
                    {result?.extracted_data ? (
                        <div className="bg-gray-400 dark:bg-neutral-700/50 p-1 rounded-xl max-h-40 overflow-y-auto mb-4">
                            <table className="w-full text-sm text-gray-700 dark:text-gray-300 table-fixed border-separate border-spacing-y-1">
                                <tbody>
                                    {Object.entries(result.extracted_data).map(([key, value]) =>
                                        key !== "file_name" ? (
                                            <tr key={key} className="bg-white  dark:bg-neutral-800/80 rounded-lg shadow-sm">
                                                <td className="font-medium capitalize py-1 px-2 align-top text-xs text-indigo-600 dark:text-emerald-400" style={{ width: "40%" }}>
                                                    {key.replace(/_/g, " ")}
                                                </td>
                                                <td className="break-words py-1 px-2 text-xs">{value}</td>
                                            </tr>
                                        ) : null
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-400 italic text-sm p-2">Awaiting extraction results...</p>
                    )}
                    
                    {result?.hash && (
                        <div className="mt-4 space-y-2 text-xs text-gray-600 dark:text-gray-300">
                            <p className="truncate"><span className="font-semibold text-indigo-600 dark:text-emerald-400">Hash:</span> {result.hash.substring(0, 40)}...</p>
                            <p className="truncate"><span className="font-semibold text-indigo-600 dark:text-emerald-400">Signature:</span> {result.signature.substring(0, 40)}...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Final Verdict Badge */}
            {result?.final_verdict && (
                <div className={`mt-auto p-4 rounded-xl text-base font-bold text-center border-2 
                    ${result.final_verdict === "Issued"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700"
                      : "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/70 dark:text-red-300 dark:border-red-700"
                    }`
                }>
                  <div className="flex items-center justify-center gap-2">
                    {result.final_verdict === "Issued" ?
                      <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    <span>{result.final_verdict}</span>
                  </div>
                  <p className="text-sm font-normal mt-1 opacity-90">{result.message}</p>
                </div>
            )}
        </div>
    );
  };

  const SummaryReport = () => {
    if (issuingResults.length === 0) return null;

    const summary = issuingResults.reduce((acc, result) => {
        acc[result.final_verdict] = (acc[result.final_verdict] || 0) + 1;
        return acc;
    }, { Issued: 0, Failed: 0 });

    const total = issuingResults.length;
    const issuedCount = summary.Issued;
    const failedCount = summary.Failed;

    return (
        <section className="mt-12 pt-6 border-t border-gray-200 dark:border-neutral-700">
            <h2 className="text-2xl font-bold text-gray-200 dark:text-white mb-6 flex items-center gap-2">
                <FileSignature className="w-6 h-6 text-black dark:text-white" />
                Issuing Summary Report
            </h2>

            <div className="bg-white dark:bg-black p-6 rounded-2xl shadow-lg border border-gray-50 dark:border-neutral-700">
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="p-4 bg-indigo-50 dark:bg-neutral-700 rounded-xl shadow-inner">
                        <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{total}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Files</p>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/50 rounded-xl shadow-inner">
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{issuedCount}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Issued</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/50 rounded-xl shadow-inner">
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{failedCount}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-gray-500" />
                        Individual File Status:
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {issuingResults.map((result, index) => (
                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50 dark:bg-neutral-700/50">
                                <span className="font-medium text-gray-700 dark:text-gray-200 truncate flex-1 mb-1 sm:mb-0">
                                    {result.extracted_data.file_name}
                                </span>
                                <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                    result.final_verdict === 'Issued' 
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100' 
                                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                }`}>
                                    {result.final_verdict}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleDownloadReport}
                    className="w-full mt-6 py-3 rounded-xl transition font-semibold text-white shadow-lg bg-[#1E90FF] hover:bg-blue-500 dark:bg--600 dark:bg-white dark:text-black dark:hover:bg-gray-200 flex items-center justify-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    Download Full Report (TXT)
                </button>
            </div>
        </section>
    );
  };
  // --- End UI Components ---


  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-[#1E90FF] to-sky-500  dark:bg-gradient-to-r dark:from-black dark:via-slate-950 dark:to-slate-950 transition-colors duration-300 pb-20">
      <div className="sticky top-0 z-50"><RoleBasedNavbar /></div>
      

      <div className={contentClass + " mt-10 space-y-12"}>
        

        {/* --- Upload & Action Section --- */}
        <section className="bg-white dark:bg-neutral-950 rounded-3xl p-6 md:p-10 shadow-2xl shadow-indigo-100/50 dark:shadow-neutral-900/50 transition-all duration-300">
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            <div className="flex-1 w-full">
              <UploadBox
                dragActive={dragActive}
                handleDrag={handleDrag}
                handleDrop={handleDrop}
                fileInputRef={fileInputRef}
                selectedFiles={selectedFiles}
                handleFileSelect={handleFileSelect}
                verifying={issuing}
                getFileIcon={(filename) => getFileIcon(filename, "h-10 w-10")} 
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className="w-full lg:w-auto lg:min-w-[300px] flex flex-col justify-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Files ready for issuing: <span className= "text-sky-500 font-bold"> {selectedFiles.length} </span></p>
                <button
                  onClick={processCertificate}
                  disabled={issuing}
                  className={`
                    w-full py-4 rounded-xl transition font-bold text-lg tracking-wider transform hover:scale-[1.01]
                    ${issuing
                      ? "bg-gray-300 text-gray-700 cursor-not-allowed shadow-md"
                      : "bg-black text-white  dark:bg-white dark:text-black"
                    }
                  `}
                >
                  {issuing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing {selectedFiles.length} Certificate(s)...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CloudUpload className="w-5 h-5" />
                      Start Issuing
                    </span>
                  )}
                </button>
                {rsaKeys ? (
                    <div className="mt-4 p-3 bg-indigo-50 dark:bg-neutral-900/50 rounded-lg text-sm text-sky-700 dark:text-sky-500 flex items-center gap-2 font-medium">
                        <Key className="w-4 h-4" />
                        RSA Keys Loaded & Ready
                    </div>
                ) : (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2 font-medium">
                        <FileWarning className="w-4 h-4" />
                        Generating Keys...
                    </div>
                )}
              </div>
            )}
          </div>
        </section>

     



        {/* --- Results Grid Section --- */}
        {selectedFiles.length > 0 && (
          <section className="pt-4">

             <div className="flex mb-10 items-center justify-center gap-6 w-full">
  {/* Left Line */}
  <div className="flex-grow h-px bg-gray-400 dark:bg-gray-600" />

  {/* Middle Content */}
  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
    <h2 className="text-3xl font-extrabold text-gray-200 dark:text-white">
      Showing
    </h2>

    <RotatingText
      texts={["Result", "Output", "Decision"]}
      mainClassName="px-4 py-2 text-center font-bold text-lg rounded-lg shadow-md bg-white text-sky-600 dark:bg-sky-600 dark:text-white"
      staggerFrom="last"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-120%' }}
      staggerDuration={0.025}
      splitLevelClassName="overflow-hidden pb-0.5"
      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
      rotationInterval={2000}
    />
  </div>

  {/* Right Line */}
  <div className="flex-grow h-px  bg-gray-400 dark:bg-gray-600" />
</div>
            
                       
            <div className={gridClass}>
              {selectedFiles.map((file, idx) => (
                <CertificateCard
                    key={file.name + idx}
                    file={file}
                    idx={idx}
                    result={issuingResults[idx]}
                    stepState={stepStates[idx]}
                    isSingleOrDual={isSingleOrDual}
                />
              ))}
            </div>
          </section>
        )}

        {/* --- Summary Report Section --- */}
        <SummaryReport />
        
      </div>
    </div>
  );
};

export default Issuer;