// did.js
// Modulo per generare DIDs (Decentralized Identifiers)
// Un DID è legato a una coppia di chiavi pubblica/privata

import * as jose from "jose";

export async function createDID() {
  // Genera coppia di chiavi (RSA 2048 bit)
  const { publicKey, privateKey } = await jose.generateKeyPair("RS256");

  // Esporta in formato JWK (JSON Web Key)
  const publicJwk = await jose.exportJWK(publicKey);
  const privateJwk = await jose.exportJWK(privateKey);

  // Costruzione DID (qui semplificato: did:example:<hash_pubkey>)
  const did = "did:example:" + publicJwk.n.slice(0, 16);

  return {
    did,
    publicKey: publicJwk,
    privateKey: privateJwk
  };
}

