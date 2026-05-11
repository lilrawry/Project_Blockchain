/**
 * utils/ipfs.js
 * ─────────────────────────────────────────────────────────────────
 * Client IPFS pour l'upload et le téléchargement de fichiers médicaux.
 *
 * Mode 1 – IPFS local (Kubo daemon)
 *   Requiert : ipfs daemon  →  http://127.0.0.1:5001
 *
 * Mode 2 – Simulation (fallback automatique)
 *   Si le démon IPFS n'est pas accessible, un CID simulé est généré
 *   et les données sont stockées dans localStorage pour la démo.
 *
 * Usage :
 *   import { uploadToIPFS, downloadFromIPFS } from './utils/ipfs';
 *   const cid = await uploadToIPFS(encryptedPayload);
 *   const raw = await downloadFromIPFS(cid);
 */

// ──────────────────────────────────────────────────────────────────
//  Config
// ──────────────────────────────────────────────────────────────────

const IPFS_API_URL    = "http://127.0.0.1:5001/api/v0";
const IPFS_GATEWAY    = "http://127.0.0.1:8080/ipfs";
const TIMEOUT_MS      = 8000;      // 8 secondes avant fallback
const STORAGE_PREFIX  = "ipfs_sim_";

// ──────────────────────────────────────────────────────────────────
//  Test de connexion IPFS
// ──────────────────────────────────────────────────────────────────

let _ipfsAvailable = null;  // null = non testé

/**
 * Vérifie si le démon IPFS local est accessible.
 * @returns {Promise<boolean>}
 */
export async function checkIPFSAvailability() {
  if (_ipfsAvailable !== null) return _ipfsAvailable;

  try {
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(`${IPFS_API_URL}/version`, {
      method: "POST",
      signal: controller.signal,
    });

    clearTimeout(timer);
    _ipfsAvailable = res.ok;
  } catch {
    _ipfsAvailable = false;
  }

  console.info(
    _ipfsAvailable
      ? "✅ IPFS daemon accessible – mode réel activé"
      : "⚠️  IPFS daemon inaccessible – mode simulation activé (localStorage)"
  );

  return _ipfsAvailable;
}

// ──────────────────────────────────────────────────────────────────
//  Upload
// ──────────────────────────────────────────────────────────────────

/**
 * Upload un payload chiffré sur IPFS (ou simulation).
 * @param   {string} encryptedPayload  Données chiffrées (JSON string)
 * @returns {Promise<string>}          CID IPFS (ou CID simulé)
 */
export async function uploadToIPFS(encryptedPayload) {
  const available = await checkIPFSAvailability();

  if (available) {
    return _uploadReal(encryptedPayload);
  } else {
    return _uploadSimulated(encryptedPayload);
  }
}

/** Upload réel via IPFS HTTP API */
async function _uploadReal(payload) {
  const blob     = new Blob([payload], { type: "application/octet-stream" });
  const formData = new FormData();
  formData.append("file", blob);

  const res = await fetch(`${IPFS_API_URL}/add?pin=true`, {
    method: "POST",
    body:   formData,
  });

  if (!res.ok) {
    throw new Error(`Erreur IPFS upload: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  console.log("📦 IPFS upload réel →", json.Hash);
  return json.Hash;  // CID ex: QmXyz...
}

/** Upload simulé → localStorage */
function _uploadSimulated(payload) {
  // Génère un CID pseudo-aléatoire (format Qm... base58-like)
  const chars  = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let   cid    = "Qm";
  for (let i = 0; i < 44; i++) {
    cid += chars[Math.floor(Math.random() * chars.length)];
  }

  localStorage.setItem(`${STORAGE_PREFIX}${cid}`, payload);
  console.log("🧪 IPFS simulé →", cid);
  return Promise.resolve(cid);
}

// ──────────────────────────────────────────────────────────────────
//  Download
// ──────────────────────────────────────────────────────────────────

/**
 * Télécharge et retourne le contenu brut depuis IPFS (ou simulation).
 * @param   {string} cid  CID IPFS
 * @returns {Promise<string>}  Payload chiffré brut
 */
export async function downloadFromIPFS(cid) {
  // D'abord vérifier si c'est une donnée simulée
  const simData = localStorage.getItem(`${STORAGE_PREFIX}${cid}`);
  if (simData !== null) {
    console.log("🧪 IPFS récupéré depuis simulation →", cid);
    return simData;
  }

  // Sinon tentative réelle
  const available = await checkIPFSAvailability();
  if (!available) {
    throw new Error(`Données IPFS introuvables pour CID: ${cid}`);
  }

  return _downloadReal(cid);
}

/** Téléchargement réel via la gateway IPFS locale */
async function _downloadReal(cid) {
  // Utiliser /api/v0/cat (plus fiable que la gateway pour localhost)
  const res = await fetch(`${IPFS_API_URL}/cat?arg=${cid}`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error(`Erreur IPFS download: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  console.log("📥 IPFS téléchargé →", cid);
  return text;
}

// ──────────────────────────────────────────────────────────────────
//  URL publique d'un CID (pour affichage / partage)
// ──────────────────────────────────────────────────────────────────

/**
 * Retourne l'URL de la gateway IPFS pour un CID donné.
 * @param   {string} cid
 * @returns {string}
 */
export function getIPFSGatewayUrl(cid) {
  return `${IPFS_GATEWAY}/${cid}`;
}

// ──────────────────────────────────────────────────────────────────
//  Info : état IPFS lisible
// ──────────────────────────────────────────────────────────────────

/**
 * Retourne un objet descriptif de l'état IPFS courant.
 * @returns {Promise<{available: boolean, mode: string, apiUrl: string}>}
 */
export async function getIPFSStatus() {
  const available = await checkIPFSAvailability();
  return {
    available,
    mode:   available ? "IPFS local (Kubo)" : "Simulation (localStorage)",
    apiUrl: IPFS_API_URL,
  };
}
