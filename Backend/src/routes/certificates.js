import express from "express";
import {
  issueCertificate,
  verifyCertificate,
  getCertificate,
  listCertificates,
  deleteCertificate
} from "../Controllers/certificateController.js";

const router = express.Router();

router.post("/issue", issueCertificate);
router.post("/verify", verifyCertificate);
router.get("/", listCertificates);
router.get("/:id", getCertificate);
router.delete("/:id", deleteCertificate);

export default router;
