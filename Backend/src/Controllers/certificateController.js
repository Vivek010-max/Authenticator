import Certificate from "../models/Certificate.js";
import { ensurePem } from "../utils/jwkToPem.js";
import crypto from "crypto";

/**
 * Issue (store) certificate
 * Request body expected:
 * {
 *   university,
 *   canonicalJson,
 *   hash,
 *   signatureHex,        // signature produced by signing the hash (hex string)
 *   publicKeyPem?,       // preferred: issuer public key in PEM format
 *   publicKeyJwk?        // alternatively: issuer public JWK object
 *   metadata?            // optional extra info
 * }
 */
export const issueCertificate = async (req, res, next) => {
  try {
    const { university, canonicalJson, hash, signatureHex, publicKeyPem, publicKeyJwk, metadata } = req.body;
    if (!canonicalJson || !hash || !signatureHex) {
      return res.status(400).json({ success: false, message: "Missing required fields: canonicalJson, hash, signatureHex" });
    }

    // convert JWK to PEM if needed
    let pem = null;
    try {
      pem = publicKeyPem || (publicKeyJwk ? ensurePem(publicKeyJwk) : null);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid public key format", error: err.message });
    }

    const cert = new Certificate({
      university: university || (metadata && metadata.university) || "Unknown",
      canonicalJson,
      hash,
      signatureHex,
      publicKeyPem: pem,
      publicKeyJwk: publicKeyJwk || null,
      metadata: metadata || {}
    });

    await cert.save();
    return res.json({ success: true, message: "Certificate stored", certificateId: cert._id });
  } catch (err) {
    // possible duplicate hash error
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Certificate with this hash already exists" });
    }
    next(err);
  }
};

/**
 * Verify certificate by hash
 * Request body:
 * {
 *   hash
 * }
 *
 * Response:
 * - if not found: verdict = "Tampered" or "NotFound"
 * - if found: verify signature and return Verified or Tampered
 */
export const verifyCertificate = async (req, res, next) => {
  try {
    const { hash } = req.body;
    if (!hash) return res.status(400).json({ success: false, message: "Missing hash in request body" });

    const cert = await Certificate.findOne({ hash });
    if (!cert) {
      return res.json({ success: false, verdict: "Tampered", message: "Hash not found in DB" });
    }

    if (!cert.publicKeyPem) {
      return res.json({ success: false, verdict: "Unknown", message: "No public key stored for this certificate" });
    }

    // verify signature
    const verify = crypto.createVerify("SHA256");
    verify.update(hash);
    verify.end();

    const signatureBuffer = Buffer.from(cert.signatureHex, "hex");
    let verified = false;
    try {
      verified = verify.verify(cert.publicKeyPem, signatureBuffer);
    } catch (err) {
      // verification error fallback
      console.warn("Signature verification failed with error:", err.message);
      verified = false;
    }

    const verdict = verified ? "Verified" : "Tampered";
    return res.json({
      success: true,
      verdict,
      message: verified ? "Signature verified" : "Signature invalid",
      certificate: {
        id: cert._id,
        university: cert.university,
        canonicalJson: cert.canonicalJson,
        hash: cert.hash,
        issuedAt: cert.issuedAt,
        metadata: cert.metadata
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findById(req.params.id).lean();
    if (!cert) return res.status(404).json({ success: false, message: "Certificate not found" });
    res.json({ success: true, certificate: cert });
  } catch (err) {
    next(err);
  }
};

export const listCertificates = async (req, res, next) => {
  try {
    const docs = await Certificate.find().sort({ issuedAt: -1 }).limit(200).lean();
    res.json({ success: true, certificates: docs });
  } catch (err) {
    next(err);
  }
};

export const deleteCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findByIdAndDelete(req.params.id);
    if (!cert) return res.status(404).json({ success: false, message: "Certificate not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
