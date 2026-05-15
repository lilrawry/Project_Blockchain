/**
 * utils/crypto.js
 * ─────────────────────────────────────────────────────────────────
 * Chiffrement / déchiffrement AES-256 des fichiers médicaux
 * avant upload sur IPFS et après téléchargement.
 *
 * Librairie : crypto-js  (npm install crypto-js)
 *
 * Stratégie de clé :
 *   - La clé est dérivée de l'adresse MetaMask du patient
 *     (adresse en minuscules → SHA-256 → 256 bits)
 *   - Côté contrat, encryptedKey stocke la clé dérivée en clair
 *     UNIQUEMENT pour la démo. En production, utiliser
 *     une PKI ou chiffrement asymétrique (RSA / ECIES).
 */

import CryptoJS from "crypto-js";

// ──────────────────────────────────────────────────────────────────
//  Dérivation de la clé à partir de l'adresse wallet
// ──────────────────────────────────────────────────────────────────

/**
 * Dérive une clé AES-256 déterministe depuis l'adresse Ethereum.
 * @param   {string} walletAddress  Adresse MetaMask (0x...)
 * @returns {string}                Clé hexadécimale 64 chars (256 bits)
 */
export function deriveKey(walletAddress) {
  if (!walletAddress) throw new Error("Adresse wallet requise pour dériver la clé");
  const normalized = walletAddress.toLowerCase();
  // Double SHA-256 pour renforcer la dérivation
  const hash1 = CryptoJS.SHA256(normalized).toString();
  const hash2 = CryptoJS.SHA256(hash1 + normalized).toString();
  return hash2; // 64 hex chars = 256 bits
}

// ──────────────────────────────────────────────────────────────────
//  Chiffrement AES-256-CBC
// ──────────────────────────────────────────────────────────────────

/**
 * Chiffre un contenu (string ou ArrayBuffer) avec AES-256-CBC.
 * @param   {string|ArrayBuffer} content  Contenu du fichier médical
 * @param   {string}             key      Clé hex 256 bits
 * @returns {string}                      Données chiffrées (base64 + IV préfixé)
 */
export function encryptData(content, key) {
  // Convertir ArrayBuffer → WordArray si nécessaire
  let wordArray;
  if (content instanceof ArrayBuffer) {
    wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(content));
  } else {
    wordArray = CryptoJS.enc.Utf8.parse(content);
  }

  // IV aléatoire 128 bits
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(wordArray, CryptoJS.enc.Hex.parse(key), {
    iv,
    mode:    CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // Préfixer l'IV pour pouvoir déchiffrer plus tard :  iv::ciphertext
  const ivHex        = iv.toString(CryptoJS.enc.Hex);
  const cipherBase64 = encrypted.toString();               // Base64 natif CryptoJS

  return `${ivHex}::${cipherBase64}`;
}

// ──────────────────────────────────────────────────────────────────
//  Déchiffrement AES-256-CBC
// ──────────────────────────────────────────────────────────────────

/**
 * Déchiffre des données chiffrées par encryptData().
 * @param   {string} encryptedPayload  Chaîne "ivHex::cipherBase64"
 * @param   {string} key               Clé hex 256 bits
 * @returns {string}                   Contenu original (UTF-8)
 */
export function decryptData(encryptedPayload, key) {
  const [ivHex, cipherBase64] = encryptedPayload.split("::");
  if (!ivHex || !cipherBase64) throw new Error("Payload chiffré invalide");

  const iv        = CryptoJS.enc.Hex.parse(ivHex);
  const decrypted = CryptoJS.AES.decrypt(cipherBase64, CryptoJS.enc.Hex.parse(key), {
    iv,
    mode:    CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

// ──────────────────────────────────────────────────────────────────
//  Helpers fichiers (File → ArrayBuffer → chiffré)
// ──────────────────────────────────────────────────────────────────

/**
 * Lit un fichier Browser File et retourne son ArrayBuffer.
 * @param   {File}   file  Objet File du DOM
 * @returns {Promise<ArrayBuffer>}
 */
export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e.target.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Chiffre un File complet et retourne une chaîne prête pour IPFS.
 * @param   {File}   file          Fichier médical
 * @param   {string} walletAddress Adresse du patient (dérivation clé)
 * @returns {Promise<{encryptedPayload: string, derivedKey: string, mimeType: string}>}
 */
export async function encryptFile(file, walletAddress) {
  const buffer     = await readFileAsArrayBuffer(file);
  const key        = deriveKey(walletAddress);
  // On ajoute le mimeType dans le payload pour reconstruction
  const meta       = JSON.stringify({ mimeType: file.type, name: file.name });
  const metaEnc    = encryptData(meta, key);
  const fileEnc    = encryptData(buffer, key);

  const payload = JSON.stringify({ meta: metaEnc, data: fileEnc });
  return {
    encryptedPayload: payload,
    derivedKey:       key,       // stocké sur chaîne (démo)
    mimeType:         file.type,
  };
}

/**
 * Déchiffre un payload récupéré depuis IPFS.
 * @param   {string} rawPayload    Chaîne JSON téléchargée depuis IPFS
 * @param   {string} walletAddress Adresse du patient propriétaire
 * @returns {{ name: string, mimeType: string, dataUrl: string }}
 */
export function decryptFile(rawPayload, walletAddress) {
  const key     = deriveKey(walletAddress);
  const parsed  = JSON.parse(rawPayload);

  const metaStr = decryptData(parsed.meta, key);
  const { mimeType, name } = JSON.parse(metaStr);

  // Decrypt binary data using CryptoJS base64 (handles non-UTF8 binary content)
  const [ivHex, cipherBase64] = parsed.data.split("::");
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const decrypted = CryptoJS.AES.decrypt(cipherBase64, CryptoJS.enc.Hex.parse(key), {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const dataUrl = `data:${mimeType};base64,${decrypted.toString(CryptoJS.enc.Base64)}`;

  return { name, mimeType, dataUrl };
}
