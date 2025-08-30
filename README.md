# Progetto DID & Verifiable Credentials

## Descrizione
Questo progetto dimostra un sistema di **identità digitale decentralizzata** basato su:
- **Decentralized Identifiers (DIDs)** per identificare utenti/entità senza una PKI centralizzata.
- **Verifiable Credentials (VCs)** per rilasciare e verificare attestazioni firmate digitalmente.

Le VC sono firmate con la chiave privata dell'issuer e verificate con la chiave pubblica corrispondente.

## Funzionalità principali
- Creazione di un DID (chiave pubblica/privata + identificatore).
- Emissione di una Verifiable Credential da parte di un issuer.
- Verifica della validità e integrità di una VC.

## API disponibili
1. `POST /create-did`  
   → genera un nuovo DID e la coppia di chiavi (pubblica/privata).

2. `POST /issue-vc`  
   Body JSON: `{ issuerDid, issuerPrivateKey, subjectDid, claim }`  
   → rilascia una VC firmata.

3. `POST /verify-vc`  
   Body JSON: `{ vc, issuerPublicKey }`  
   → verifica firma e integrità di una VC.

## Avvio
```bash
npm install
npm start

