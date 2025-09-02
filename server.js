import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { addEntry } from "./ledger.js";
import fs from "fs";

const app = express();
app.use(bodyParser.json());

const KEYS_DIR = "./keys";
const PRIVATE_KEY_PATH = `${KEYS_DIR}/issuer-private.pem`;
const PUBLIC_KEY_PATH = `${KEYS_DIR}/issuer-public.pem`;

let issuerPrivateKey, issuerPublicKey;

// Funzione per generare chiavi se non esistono
function initKeys() {
  if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR);
  }

  if (!fs.existsSync(PRIVATE_KEY_PATH) || !fs.existsSync(PUBLIC_KEY_PATH)) {
    console.log("Creating new key pair...");

    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    fs.writeFileSync(PRIVATE_KEY_PATH, privateKey);
    fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);

    issuerPrivateKey = privateKey;
    issuerPublicKey = publicKey;
  } else {
    console.log("Using existing keys.");
    issuerPrivateKey = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");
    issuerPublicKey = fs.readFileSync(PUBLIC_KEY_PATH, "utf8");
  }
}

// Inizializza le chiavi all’avvio
initKeys();

// Creazione DID
app.post("/create-did", (req, res) => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

  const did = "did:example:" + crypto.randomBytes(8).toString("hex");

  const pub = publicKey.export({ type: "pkcs1", format: "pem" });
  const priv = privateKey.export({ type: "pkcs1", format: "pem" });

  const record = { action: "CREATE_DID", did, publicKey: pub };
  const block = addEntry(record);

  res.json({ did, publicKey: pub, privateKey: priv, block });
});

// Emissione VC
app.post("/issue-vc", (req, res) => {
  const { issuerDid, subjectDid, claims } = req.body;

  const vcPayload = {
    iss: issuerDid,
    sub: subjectDid,
    claims,
    iat: Math.floor(Date.now() / 1000),
  };
try {
    // Firma della VC con la chiave privata dell’Issuer
    const token = jwt.sign(vcPayload, issuerPrivateKey, { algorithm: "RS256" });

    // Registra l’emissione nel ledger
    const record = { action: "ISSUE_VC", issuerDid, subjectDid, claims };
    const block = addEntry(record);

    res.json({
      vc: token,
      publicKey: issuerPublicKey, // la pubkey serve ai Verifier
      block,
    });
  } catch (err) {
    res.status(500).json({ error: "Errore nell'emissione della VC", details: err.message });
  }
});

// Verifica VC
app.post("/verify-vc", (req, res) => {
  const { vc, publicKey } = req.body;

  try {
    const decoded = jwt.verify(vc, publicKey, { algorithms: ["RS256"] });

    const record = { action: "VERIFY_VC", sub: decoded.sub, status: "VALID" };
    addEntry(record);

    res.json({ valid: true, decoded });
  } catch (err) {
    const record = { action: "VERIFY_VC", status: "INVALID" };
    addEntry(record);

    res.status(400).json({ valid: false, error: err.message });
  }
});

// Endpoint per leggere il ledger
app.get("/ledger", (req, res) => {
  import("./ledger.js").then(({ readLedger }) => {
    res.json(readLedger());
  });
});

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);

