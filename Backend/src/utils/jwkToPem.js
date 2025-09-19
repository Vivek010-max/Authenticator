import jwkToPem from "jwk-to-pem";

/**
 * Convert JWK object -> PEM (or return PEM unchanged)
 * Accepts either a JWK object or a PEM string.
 */
export const ensurePem = (maybeJwkOrPem) => {
  if (!maybeJwkOrPem) return null;
  // if looks like PEM (-----BEGIN) just return
  if (typeof maybeJwkOrPem === "string" && maybeJwkOrPem.includes("-----BEGIN")) {
    return maybeJwkOrPem;
  }
  // assume JWK object
  try {
    return jwkToPem(maybeJwkOrPem);
  } catch (err) {
    throw new Error("Invalid JWK provided");
  }
};
