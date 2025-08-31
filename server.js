import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { addEntry } from "./ledger.js";

const app = express();
app.use(bodyParser.json());

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
  const { issuerDid, subjectDid, privateKey, claims } = req.body;

  const vcPayload = {
    iss: issuerDid,
    sub: subjectDid,
    claims,
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(vcPayload, privateKey, { algorithm: "RS256" });

  const record = { action: "ISSUE_VC", issuerDid, subjectDid, claims };
  const block = addEntry(record);

  res.json({ vc: token, block });
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
