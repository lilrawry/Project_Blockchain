/**
 * utils/web3.js
 * ─────────────────────────────────────────────────────────────────
 * Initialisation centralisée de Web3 + instance du smart contract
 * MedicalRecords.
 *
 * Exporte :
 *   initWeb3()            → { web3, account, contract }
 *   getContractInstance() → instance du contrat déployé
 *   listenToEvents()      → subscribe aux events on-chain
 */

import Web3 from "web3";
import MedicalRecordsABI from "../contracts/MedicalRecords.json";

// ──────────────────────────────────────────────────────────────────
//  Initialisation de Web3 + MetaMask
// ──────────────────────────────────────────────────────────────────

/**
 * Initialise la connexion Web3 via MetaMask.
 * @returns {Promise<{ web3: Web3, account: string, contract: object, networkId: number }>}
 */
export async function initWeb3() {
  if (!window.ethereum) {
    throw new Error("MetaMask non détecté. Veuillez installer l'extension MetaMask.");
  }

  // Demande de connexion MetaMask
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const web3      = new Web3(window.ethereum);
  const accounts  = await web3.eth.getAccounts();
  const account   = accounts[0];
  const networkId = Number(await web3.eth.net.getId());

  const deployedNetwork = MedicalRecordsABI.networks[networkId];

  if (!deployedNetwork) {
    throw new Error(
      `Contrat non déployé sur ce réseau (ID: ${networkId}).\n` +
      `Vérifiez que Ganache est lancé sur le port 7545 et exécutez :\n` +
      `  truffle migrate --reset --network development`
    );
  }

  const contract = new web3.eth.Contract(
    MedicalRecordsABI.abi,
    deployedNetwork.address
  );

  console.log("✅ Web3 initialisé");
  console.log("   Compte   :", account);
  console.log("   Réseau   :", networkId);
  console.log("   Contrat  :", deployedNetwork.address);

  return { web3, account, contract, networkId };
}

// ──────────────────────────────────────────────────────────────────
//  Récupération de l'instance sans ré-initialiser (singleton)
// ──────────────────────────────────────────────────────────────────

let _instance = null;

/**
 * Retourne l'instance mémorisée ou en crée une nouvelle.
 * @returns {Promise<{ web3, account, contract, networkId }>}
 */
export async function getInstance() {
  if (_instance) return _instance;
  _instance = await initWeb3();
  return _instance;
}

/**
 * Réinitialise le singleton (utile lors d'un changement de compte).
 */
export function resetInstance() {
  _instance = null;
}

// ──────────────────────────────────────────────────────────────────
//  Helpers MetaMask events
// ──────────────────────────────────────────────────────────────────

/**
 * Installe les listeners MetaMask pour réagir aux changements de compte/réseau.
 * @param {Function} onAccountChange  (newAccount: string) => void
 * @param {Function} onNetworkChange  (newChainId: string) => void
 */
export function listenMetaMaskEvents(onAccountChange, onNetworkChange) {
  if (!window.ethereum) return;

  window.ethereum.on("accountsChanged", (accounts) => {
    resetInstance();
    onAccountChange(accounts[0] || null);
  });

  window.ethereum.on("chainChanged", (chainId) => {
    resetInstance();
    onNetworkChange(chainId);
    // MetaMask recommande un reload complet sur changement de réseau
    window.location.reload();
  });
}

// ──────────────────────────────────────────────────────────────────
//  Abonnement aux événements du contrat (pour AuditLog)
// ──────────────────────────────────────────────────────────────────

/**
 * Écoute tous les events passés et futurs du contrat.
 * @param {object}   contract   Instance Web3 du contrat
 * @param {Function} onEvent    (eventName: string, event: object) => void
 * @returns {object} subscription (appellez .unsubscribe() pour arrêter)
 */
export function listenToEvents(contract, onEvent) {
  // Events passés (depuis le bloc 0)
  contract.getPastEvents("allEvents", { fromBlock: 0, toBlock: "latest" })
    .then((events) => {
      events.forEach((ev) => onEvent(ev.event, ev));
    })
    .catch((err) => console.error("getPastEvents error:", err));

  // Events futurs
  const sub = contract.events.allEvents({ fromBlock: "latest" })
    .on("data",  (ev)  => onEvent(ev.event, ev))
    .on("error", (err) => console.error("Event error:", err));

  return sub;
}

// ──────────────────────────────────────────────────────────────────
//  Utilitaires adresse
// ──────────────────────────────────────────────────────────────────

/**
 * Tronque une adresse Ethereum pour l'affichage.
 * @param   {string} address  Adresse complète (0x...)
 * @param   {number} chars    Nombre de chars de chaque côté (défaut 6)
 * @returns {string}          ex: "0x1234...abcd"
 */
export function truncateAddress(address, chars = 6) {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Convertit un timestamp Unix en date lisible.
 * @param   {number|string} ts  Timestamp Unix (secondes)
 * @returns {string}            Date formatée en français
 */
export function formatTimestamp(ts) {
  return new Date(Number(ts) * 1000).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Mappe le uint RecordType vers un label français.
 */
export const RECORD_TYPE_LABELS = {
  0: "Consultation",
  1: "Ordonnance",
  2: "Analyse",
  3: "Radiologie",
  4: "Autre",
};

export const ROLE_LABELS = {
  0: "Non enregistré",
  1: "Patient",
  2: "Médecin",
};
