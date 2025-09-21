import React, { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import PublicNavbar from "../../components/PublicNavbar";
import UploadBox from "../../components/Guest/UploadBox.jsx";
import VerticalStepper from "../../components/Guest/VerticalStepper.jsx"; // Ensure this uses the corrected version
import RotatingText from "../../components/ui/RotatingText.jsx"; 
import { 
    FileText, Image, CheckCircle, XCircle, AlertTriangle, Key, Loader2, ListChecks, FileCheck, FileX 
} from "lucide-react";


const VerificationSummary = ({ results, totalFiles }) => {
    if (results.length === 0 || totalFiles === 0) return null;

    const verifiedCount = results.filter(r => r.final_verdict === "Verified").length;
    const tamperedCount = results.filter(r => r.final_verdict === "Tampered").length;
    const errorCount = results.filter(r => r.final_verdict === "Error").length;

    const allVerified = verifiedCount === totalFiles;
    const allFailed = verifiedCount === 0 && (tamperedCount > 0 || errorCount > 0);
    
    let summaryIcon = <AlertTriangle className="w-8 h-8 text-yellow-500" />;
    let summaryText = `Verification Complete: ${verifiedCount} Verified, ${tamperedCount} Tampered, ${errorCount} Error.`;
    let summaryClass = "bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950/70 dark:text-yellow-300 dark:border-yellow-700";

    if (allVerified) {
        summaryIcon = <CheckCircle className="w-8 h-8 text-emerald-500" />;
        summaryText = `Batch Verified! All ${totalFiles} documents are authentic.`;
        summaryClass = "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700";
    } else if (allFailed) {
        summaryIcon = <FileX className="w-8 h-8 text-red-500" />;
        summaryText = `Verification Failed! ${tamperedCount + errorCount} documents failed authenticity checks.`;
        summaryClass = "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/70 dark:text-red-300 dark:border-red-700";
    }

    const StatCard = ({ icon, label, count, color }) => (
        <div className={`p-4 rounded-xl shadow-lg border-t-4 border-${color}-500 dark:bg-neutral-800/70`}>
            <div className={`text-3xl font-bold text-${color}-600 dark:text-${color}-400 mb-1`}>{count}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-neutral-950 rounded-3xl p-6 md:p-10 shadow-2xl shadow-indigo-100/50 dark:shadow-neutral-900/50 mt-12 space-y-6">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                <ListChecks className="w-6 h-6 text-sky-500 dark:text-emerald-400" />
                Batch Verification Summary
            </h2>
            
            <div className={`p-4 rounded-xl text-lg font-bold text-center border-2 flex items-center justify-center gap-4 ${summaryClass}`}>
                {summaryIcon}
                <span>{summaryText}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <StatCard icon={null} label="Total Files" count={totalFiles} color="sky" />
                <StatCard icon={null} label="Verified" count={verifiedCount} color="emerald" />
                <StatCard icon={null} label="Tampered" count={tamperedCount} color="red" />
                <StatCard icon={null} label="Processing Errors" count={errorCount} color="yellow" />
            </div>
        </div>
    );
};


// ==========================
// Helpers for OCR + Crypto (UNCHANGED)
// ==========================
const normalizeDate = (dateStr) => {
    if (!dateStr) return "";
    const formats = [
        /\b(\d{2})\/(\d{2})\/(\d{4})\b/,
        /\b(\d{4})-(\d{2})-(\d{2})\b/,
        /\b(\d{2})-(\d{2})-(\d{4})\b/,
        /\b(\d{2}) (\w{3}) (\d{4})\b/,
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
        const privateKey = await crypto.subtle.importKey("jwk", parsed.privateKey, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, true, ["sign"]);
        const publicKey = await crypto.subtle.importKey("jwk", parsed.publicKey, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, true, ["verify"]);
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

const verifySignature = async (hash, signatureHex, publicKey) => {
    const sigBytes = new Uint8Array(signatureHex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
    return crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKey, sigBytes, new TextEncoder().encode(hash));
};

const findInLedger = (hash) => {
    const ledger = JSON.parse(localStorage.getItem("ledger") || "[]");
    return ledger.find((e) => e.hash === hash); 
};
// ==========================
// Stepper names
// ==========================
const STEP_NAMES = ["OCR Extraction", "Hash Lookup", "Signature Verification"];

// ==========================
// Main Component
// ==========================
const GuestVerification = () => {
    const [verifying, setVerifying] = useState(false);
    const [verificationResults, setVerificationResults] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [stepStatesList, setStepStatesList] = useState([]);
    const [rsaKeys, setRsaKeys] = useState(null);

    const fileInputRef = useRef(null);

    // Dynamic layout calculation based on selected files
    let gridClass = "";
    if (selectedFiles.length === 1) gridClass = "grid grid-cols-1 max-w-2xl mx-auto";
    else if (selectedFiles.length === 2) gridClass = "grid sm:grid-cols-2 grid-cols-1 gap-8 max-w-4xl mx-auto";
    else if (selectedFiles.length >= 3) gridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto";

    const contentClass = "max-w-[1200px] mx-auto";
    const isSingleOrDual = selectedFiles.length > 0 && selectedFiles.length <= 2;

    useEffect(() => {
        generateKeys().then(setRsaKeys);
    }, []);

    const handleFileSelect = (files) => {
        const arr = Array.from(files).slice(0, 10);
        setSelectedFiles(arr);
        setVerificationResults([]);
        setStepStatesList(arr.map(() => ["resting", "resting", "resting"]));
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
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files);
    };

    // Helper to get file icon with similar styling
    const getFileIcon = (filename, sizeClass = "h-7 w-7") => {
        const ext = filename?.split(".").pop()?.toLowerCase() || "";
        if (["pdf"].includes(ext)) return <FileText className={`${sizeClass} text-red-500 dark:text-red-400`} />;
        if (["jpg", "jpeg", "png", "gif", "tiff"].includes(ext)) return <Image className={`${sizeClass} text-blue-500 dark:text-blue-400`} />;
        return <FileText className={`${sizeClass} text-gray-400 dark:text-gray-500`} />;
    };

    const runVerificationStepper = async (index, success) => {
        const newStates = (i) => {
            const states = [...stepStatesList];
            states[index] = i;
            setStepStatesList(states);
        };
        
        // Step 1: OCR Extraction
        newStates(["checking", "resting", "resting"]);
        await new Promise((r) => setTimeout(r, 700));

        // Step 2: Hash Lookup
        newStates([success ? "success" : "failure", "checking", "resting"]);
        await new Promise((r) => setTimeout(r, 700));

        // Step 3: Signature Verification
        newStates([success ? "success" : "failure", success ? "success" : "failure", "checking"]);
        await new Promise((r) => setTimeout(r, 700));

        // Final State
        newStates([success ? "success" : "failure", success ? "success" : "failure", success ? "success" : "failure"]);
    };

    const processCertificates = async () => {
        if (!rsaKeys) return alert("Keys not ready yet.");
        if (selectedFiles.length === 0) return alert("Please upload certificates.");

        setVerifying(true);
        const results = [];
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            let result = { 
                extracted_data: { file_name: file.name },
                final_verdict: "Error", 
                message: "Processing failed." 
            };
            let success = false;
            
            try {
                // Manually start OCR step for immediate UI update
                setStepStatesList(prev => {
                    const copy = [...prev];
                    copy[i] = ["checking", "resting", "resting"];
                    return copy;
                });

                // Step 1: OCR Extraction
                const { data: { text } } = await Tesseract.recognize(file, "eng", { logger: (m) => {} });

                // Simple Extraction Logic
                const extracted = { file_name: file.name };
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
                
                result = { ...result, extracted_data: extracted, canonical_json: canonicalJson, hash, steps: {} };
                
                // Step 2: Hash Lookup
                const ledgerEntry = findInLedger(hash);
                
                // Update step state for Hash Lookup before verification
                setStepStatesList(prev => {
                    const copy = [...prev];
                    copy[i] = ["success", "checking", "resting"];
                    return copy;
                });

                if (!ledgerEntry) {
                    result.steps.hash_check = "failed";
                    result.final_verdict = "Tampered";
                    result.message = "Certificate data not found in ledger (hash mismatch or not issued).";
                    success = false;
                } else {
                    // Step 3: Signature Verification
                    setStepStatesList(prev => {
                        const copy = [...prev];
                        copy[i] = ["success", "success", "checking"];
                        return copy;
                    });
                    
                    const valid = await verifySignature(hash, ledgerEntry.signature, rsaKeys.publicKey);
                    
                    result.steps.hash_check = "done";
                    result.steps.signature_verification = valid ? "done" : "failed";
                    result.final_verdict = valid ? "Verified" : "Tampered";
                    result.message = valid ? "Certificate authentic. Signature verified." : "Signature invalid. Certificate may be tampered.";
                    result.signature = ledgerEntry.signature;
                    success = valid;
                }
                
            } catch (err) {
                console.error("Verification Error:", err);
                // Mark OCR/Processing step as failure
                setStepStatesList(prev => {
                    const copy = [...prev];
                    copy[i] = ["failure", "failure", "failure"];
                    return copy;
                });
                result.message = "OCR/Processing failed. Ensure file is readable.";
                success = false;
            }
            
            // Set final step states (if not already done by catch block)
            if (result.final_verdict !== "Error") {
                await runVerificationStepper(i, success);
            }

            results.push(result);
        }
        setVerificationResults(results);
        setVerifying(false);
    };

    // --- UI Components --- (Certificate Card remains the same as previous fix)
    const CertificateCard = ({ file, idx, result, stepState, isSingleOrDual }) => {
        const cardBaseClasses = isSingleOrDual 
            ? "bg-white dark:bg-neutral-950/80 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 relative flex flex-col p-8 border-t-8 border-sky-500 dark:border-emerald-500 backdrop-blur-sm min-h-[450px]"
            : "bg-white dark:bg-neutral-800 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 relative flex flex-col p-6 border-t-4 border-sky-500 dark:border-emerald-500 backdrop-blur-sm min-h-[400px]";

        const statusText = result?.final_verdict || "Pending...";
        const isVerified = result?.final_verdict === "Verified";
        const statusColor = isVerified ? "emerald" : (result?.final_verdict === "Tampered" ? "red" : "yellow");
        const statusIcon = isVerified ? <CheckCircle className="h-5 w-5" /> : (result?.final_verdict === "Tampered" ? <XCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />);


        return (
            <div key={file.name + idx} className={cardBaseClasses}>
                
                {/* File Header */}
                <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-neutral-700">
                    <div className="p-3 bg-sky-50 dark:bg-neutral-700 rounded-xl flex-shrink-0">
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
                            <ListChecks className="w-5 h-5 text-sky-500 dark:text-emerald-400" />
                            Verification Flow
                        </h3>
                        <VerticalStepper 
                            stepNames={STEP_NAMES}
                            stepStates={stepState || ["resting", "resting", "resting"]} 
                        />
                    </div>

                    {/* Extracted Data / Hash Info Column */}
                    <div className="mb-4">
                        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-sky-500 dark:text-emerald-400" />
                            Extracted Data 
                        </h3>
                        {result?.extracted_data ? (
                            <div className="bg-gray-400 dark:bg-neutral-700/50 p-1 rounded-xl max-h-40 overflow-y-auto mb-4">
                                <table className="w-full text-sm text-gray-700 dark:text-gray-300 table-fixed border-separate border-spacing-y-1">
                                    <tbody>
                                        {Object.entries(result.extracted_data).map(([key, value]) =>
                                            key !== "file_name" ? (
                                                <tr key={key} className="bg-white dark:bg-neutral-800/80 rounded-lg shadow-sm">
                                                    <td className="font-medium capitalize py-1 px-2 align-top text-xs text-sky-600 dark:text-emerald-400" style={{ width: "40%" }}>
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
                                <p className="truncate"><span className="font-semibold text-sky-600 dark:text-emerald-400">Hash:</span> {result.hash.substring(0, 40)}...</p>
                                {result.signature && <p className="truncate"><span className="font-semibold text-sky-600 dark:text-emerald-400">Signature:</span> {result.signature.substring(0, 40)}...</p>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Final Verdict Badge */}
                {statusText !== "Pending..." && (
                    <div className={`mt-auto p-4 rounded-xl text-base font-bold text-center border-2 
                        ${statusColor === "emerald"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700"
                            : statusColor === "red"
                            ? "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/70 dark:text-red-300 dark:border-red-700"
                            : "bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950/70 dark:text-yellow-300 dark:border-yellow-700"
                        }`
                    }>
                        <div className="flex items-center justify-center gap-2">
                            {statusIcon}
                            <span>{statusText}</span>
                        </div>
                        <p className="text-sm font-normal mt-1 opacity-90">{result.message}</p>
                    </div>
                )}
            </div>
        );
    };

    // --- End UI Components ---

    return (
      <div className="min-h-screen w-full bg-white dark:bg-gradient-to-r dark:from-black dark:via-slate-950 dark:to-slate-950 transition-colors duration-300 pb-20">
            <div className="sticky top-0 z-50"><PublicNavbar /></div>

            <div className={contentClass + " mt-10 space-y-12"}>
                
                {/* --- Upload & Action Section (Similar to Issuer) --- */}
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
                                verifying={verifying}
                                getFileIcon={(filename) => getFileIcon(filename, "h-10 w-10")} 
                            />
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="w-full lg:w-auto lg:min-w-[300px] flex flex-col justify-center">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Files ready for verification: <span className= "text-sky-500 font-bold"> {selectedFiles.length} </span></p>
                                <button
                                    onClick={processCertificates}
                                    disabled={verifying}
                                    className={`
                                        w-full py-4 rounded-xl transition font-bold text-lg tracking-wider transform hover:scale-[1.01]
                                        ${verifying
                                            ? "bg-gray-300 text-gray-700 cursor-not-allowed shadow-md"
                                            : "bg-black text-white dark:bg-white dark:text-black"
                                        }
                                    `}
                                >
                                    {verifying ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Verifying {selectedFiles.length} Certificate(s)...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            Start Verification
                                        </span>
                                    )}
                                </button>
                                {rsaKeys ? (
                                    <div className="mt-4 p-3 bg-indigo-50 dark:bg-neutral-900/50 rounded-lg text-sm text-sky-700 dark:text-sky-500 flex items-center gap-2 font-medium">
                                        <Key className="w-4 h-4" />
                                        Public Key Loaded & Ready
                                    </div>
                                ) : (
                                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2 font-medium">
                                        <AlertTriangle className="w-4 h-4" />
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

                            {/* Middle Content (Using Rotating Text) */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <h2 className="text-3xl font-extrabold text-gray-200 dark:text-white">
                                    Verification
                                </h2>

                                <RotatingText
                                    texts={["Status", "Report", "Decision"]}
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
                            <div className="flex-grow h-px bg-gray-400 dark:bg-gray-600" />
                        </div>
                        
                        <div className={gridClass}>
                            {selectedFiles.map((file, idx) => (
                                <CertificateCard
                                    key={file.name + idx}
                                    file={file}
                                    idx={idx}
                                    result={verificationResults[idx]}
                                    stepState={stepStatesList[idx]}
                                    isSingleOrDual={isSingleOrDual}
                                />
                            ))}
                        </div>
                    </section>
                )}
                
                {/* --- Verification Summary Section (NEW) --- */}
                {verificationResults.length > 0 && (
                    <section className="pb-10">
                        <VerificationSummary 
                            results={verificationResults} 
                            totalFiles={selectedFiles.length} 
                        />
                    </section>
                )}

            </div>
        </div>
    );
};

export default GuestVerification;