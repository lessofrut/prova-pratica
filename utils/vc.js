// vc.js
// Modulo per emettere e verificare Verifiable Credentials (VC).
// Una VC è un JSON firmato digitalmente.

import * as jose from "jose";

// Emissione VC
export async function issueVC(issuerDid, issuerPrivateKey, subjectDid, claim) {
  // Creazione payload VC
  const payload = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiableCredential"],
    issuer: issuerDid,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: subjectDid,
      claim: claim
    }
  };

  // Firma VC (JWS)
  const privateKey = await jose.importJWK(issuerPrivateKey, "RS256");
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "RS256" })
    .sign(privateKey);

  return { vc: jwt };
}

// Verifica VC
export async function verifyVC(vc, issuerPublicKey) {
  try {
    const publicKey = await jose.importJWK(issuerPublicKey, "RS256");
    const { payload } = await jose.jwtVerify(vc, publicKey);

    return {
      valid: true,
      payload
    };
  } catch (err) {
    return {
      valid: false,
      error: "Firma non valida o VC alterata"
    };
  }
}

