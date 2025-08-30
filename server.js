// Punto di ingresso del progetto.
// Espone API REST per gestire DIDs e VC (creazione, emissione, verifica).

import express from "express";
import { createDID } from "./utils/did.js";
import { issueVC, verifyVC } from "./utils/vc.js";

const app = express();
app.use(express.json());

// API 1: Creazione DID
app.post("/create-did", async (req, res) => {
  try {
    const didData = await createDID();
    res.json(didData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 2: Emissione VC
// Input: { issuerDid, issuerPrivateKey, subjectDid, claim }
// Output: Verifiable Credential firmata
app.post("/issue-vc", async (req, res) => {
  try {
    const { issuerDid, issuerPrivateKey, subjectDid, claim } = req.body;
    const vc = await issueVC(issuerDid, issuerPrivateKey, subjectDid, claim);
    res.json(vc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 3: Verifica VC
// Input: { vc, issuerPublicKey }
// Output: esito validazione (true/false + dettagli)
app.post("/verify-vc", async (req, res) => {
  try {
    const { vc, issuerPublicKey } = req.body;
    const result = await verifyVC(vc, issuerPublicKey);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: "VC non valida o firma errata." });
  }
});

// Avvio server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server DID/VC attivo su http://localhost:${PORT}`);
});

