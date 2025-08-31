import fs from "fs";
import crypto from "crypto";

const LEDGER_FILE = "ledger.json";

// inizializza ledger se non esiste
if (!fs.existsSync(LEDGER_FILE)) {
  fs.writeFileSync(LEDGER_FILE, JSON.stringify([]));
}

// funzione per leggere il ledger
export function readLedger() {
  const data = fs.readFileSync(LEDGER_FILE);
  return JSON.parse(data);
}

// funzione per aggiungere un blocco
export function addEntry(entry) {
  const ledger = readLedger();
  const previousHash =
    ledger.length > 0 ? ledger[ledger.length - 1].hash : "GENESIS";

  const block = {
    index: ledger.length,
    timestamp: new Date().toISOString(),
    entry,
    previousHash,
    hash: crypto
      .createHash("sha256")
      .update(JSON.stringify(entry) + previousHash)
      .digest("hex"),
  };

  ledger.push(block);
  fs.writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2));
  return block;
}

