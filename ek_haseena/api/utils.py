import re
import json
import shutil
import os
from PIL import Image
import pytesseract
from datetime import datetime
import hashlib
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.exceptions import InvalidSignature

# ======================================================
# 1. OCR Extraction & Canonicalization
# ======================================================
def normalize_date(date_str: str) -> str:
    """Normalize date formats into YYYY-MM-DD."""
    if not date_str:
        return ""
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d %b %Y"):
        try:
            return datetime.strptime(date_str.strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return date_str.strip()

def canonicalize_certificate(raw_data: dict) -> bytes:
    """Convert OCR JSON to canonical form."""
    normalized = {}
    for k, v in raw_data.items():
        if not v:
            continue
        if isinstance(v, str):
            v = v.strip()
            if v == "":
                continue
        key = k.strip().lower().replace(" ", "_")

        if key in ["dob", "date_of_birth"]:
            v = normalize_date(v)
            key = "dob"
        elif key in ["enrollment_no", "enrollment_number"]:
            key = "enrollment_no"
        elif key in ["student_name", "name"]:
            key = "name"
        elif key in ["course", "program"]:
            key = "course"
        elif key in ["branch", "specialization"]:
            key = "branch"
        elif key in ["date"]:
            v = normalize_date(v)
            key = "date"
        elif key in ["statement_no", "statement_number"]:
            key = "statement_no"
        elif key in ["semester", "sem"]:
            key = "semester"
        elif key in ["university"]:
            key = "university"

        normalized[key] = v

    canonical_json = json.dumps(normalized, sort_keys=True, separators=(',', ':'))
    return canonical_json.encode("utf-8")

# ======================================================
# 2. Cryptography (Key Generation, Sign, Verify)
# ======================================================
def generate_keys():
    """Generate RSA keys if not already exist."""
    if not os.path.exists("private_key.pem") or not os.path.exists("public_key.pem"):
        private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

        with open("private_key.pem", "wb") as f:
            f.write(
                private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.TraditionalOpenSSL,
                    encryption_algorithm=serialization.NoEncryption()
                )
            )

        public_key = private_key.public_key()
        with open("public_key.pem", "wb") as f:
            f.write(
                public_key.public_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo
                )
            )
        print("Keys generated: private_key.pem & public_key.pem")

def sign_hash(hash_value: str) -> bytes:
    """Sign hash using private key."""
    with open("private_key.pem", "rb") as f:
        private_key = serialization.load_pem_private_key(f.read(), password=None)

    signature = private_key.sign(
        hash_value.encode(),
        padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
        hashes.SHA256()
    )
    return signature

def verify_signature(hash_value: str, signature: bytes) -> bool:
    """Verify signature using public key."""
    with open("public_key.pem", "rb") as f:
        public_key = serialization.load_pem_public_key(f.read())

    try:
        public_key.verify(
            signature,
            hash_value.encode(),
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
            hashes.SHA256()
        )
        return True
    except InvalidSignature:
        return False

# ======================================================
# 3. Blockchain Simulation (JSON Ledger)
# ======================================================
ledger_file = "ledger.json"

def add_to_blockchain(entry):
    ledger = []
    if os.path.exists(ledger_file):
        with open(ledger_file, "r") as f:
            ledger = json.load(f)
    ledger.append(entry)
    with open(ledger_file, "w") as f:
        json.dump(ledger, f, indent=4)

def check_blockchain(hash_value: str):
    if not os.path.exists(ledger_file):
        return None
    with open(ledger_file, "r") as f:
        ledger = json.load(f)
    for block in ledger:
        if block["hash"] == hash_value:
            return block
    return None

# ======================================================
# 4. Main Flow
# ======================================================
def process_certificate(img_path: str, issue=False):
    # OCR Setup
    if shutil.which("tesseract") is None:
        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    img = Image.open(img_path)
    text = pytesseract.image_to_string(img, lang="eng")

    data = {}

    # Extract some fields (basic demo, you can expand regex)
    if "GUJARAT TECHNOLOGICAL UNIVERSITY" in text.upper():
        data["University"] = "Gujarat Technological University"

    enroll_match = re.search(r"\b\d{11,}\b", text)
    if enroll_match:
        data["Enrollment No"] = enroll_match.group(0)

    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if enroll_match:
        for i, line in enumerate(lines):
            if enroll_match.group(0) in line and i > 0:
                data["Student Name"] = lines[i-1].strip().title()

    # Canonicalize + Hash
    canon_bytes = canonicalize_certificate(data)
    hash_value = hashlib.sha256(canon_bytes).hexdigest()

    result = {
        "extracted_data": data,
        "canonical_json": canon_bytes.decode(),
        "hash": hash_value,
        "steps": {}
    }

    if issue:
        signature = sign_hash(hash_value)
        entry = {
            "university": data.get("University", "Unknown"),
            "hash": hash_value,
            "signature": signature.hex(),
            "timestamp": datetime.now().isoformat()
        }
        add_to_blockchain(entry)
        result["steps"]["issue"] = "done"
        result["final_verdict"] = "Issued"
        result["message"] = "Certificate issued and added to blockchain."
        return result

    # Verification flow
    exists = check_blockchain(hash_value)
    if not exists:
        result["steps"]["hash_check"] = "failed"
        result["final_verdict"] = "Tampered"
        result["message"] = "Certificate hash not found in blockchain."
        return result

    with open(ledger_file, "r") as f:
        ledger = json.load(f)
    for block in ledger:
        if block["hash"] == hash_value:
            sig_bytes = bytes.fromhex(block["signature"])
            valid = verify_signature(hash_value, sig_bytes)
            if valid:
                result["steps"]["hash_check"] = "done"
                result["steps"]["signature_verification"] = "done"
                result["final_verdict"] = "Verified"
                result["message"] = "Certificate authentic. Signature verified."
            else:
                result["steps"]["hash_check"] = "done"
                result["steps"]["signature_verification"] = "failed"
                result["final_verdict"] = "Tampered"
                result["message"] = "Signature invalid. Certificate may be tampered."
            break

    return result
