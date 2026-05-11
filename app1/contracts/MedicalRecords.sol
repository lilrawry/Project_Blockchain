// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title  MedicalRecords - Système décentralisé de gestion de dossiers médicaux
/// @author Blockchain Medical Project
/// @notice Stocke les références IPFS de fichiers médicaux chiffrés et gère
///         les droits d'accès entre patients et médecins.

contract MedicalRecords {

    // ═══════════════════════════════════════════════════════════════
    //  ENUMS
    // ═══════════════════════════════════════════════════════════════

    enum RecordType {
        Consultation,   // 0
        Ordonnance,     // 1
        Analyse,        // 2
        Radiologie,     // 3
        Autre           // 4
    }

    enum Role {
        None,    // 0 – non enregistré
        Patient, // 1
        Doctor   // 2
    }

    // ═══════════════════════════════════════════════════════════════
    //  STRUCTS
    // ═══════════════════════════════════════════════════════════════

    struct Record {
        uint256    id;
        string     ipfsCID;           // CID IPFS du fichier chiffré (AES)
        string     encryptedKey;      // Clé AES chiffrée (dérivée du wallet)
        address    patientAddress;
        address    doctorAddress;     // address(0) si ajouté par le patient
        uint256    timestamp;
        RecordType recordType;
        string     description;
        bool       exists;
    }

    struct DoctorInfo {
        address doctorAddress;
        string  name;
        uint256 grantedAt;
        bool    active;
    }

    // ═══════════════════════════════════════════════════════════════
    //  STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════

    address public owner;
    uint256 private recordCounter;

    // patient  → ses dossiers
    mapping(address => Record[])   private patientRecords;

    // patient  → médecin → autorisé ?
    mapping(address => mapping(address => bool)) private authorizedDoctors;

    // patient  → liste médecins (avec infos)
    mapping(address => DoctorInfo[]) private doctorList;

    // adresse  → rôle enregistré
    mapping(address => Role) public userRole;

    // ═══════════════════════════════════════════════════════════════
    //  EVENTS  (journal d'audit on-chain)
    // ═══════════════════════════════════════════════════════════════

    event RecordAdded(
        uint256    indexed recordId,
        address    indexed patient,
        address    indexed doctor,
        string             ipfsCID,
        RecordType         recordType,
        uint256            timestamp
    );

    event AccessGranted(
        address indexed patient,
        address indexed doctor,
        string          doctorName,
        uint256         timestamp
    );

    event AccessRevoked(
        address indexed patient,
        address indexed doctor,
        uint256         timestamp
    );

    event RoleRegistered(
        address indexed user,
        Role            role,
        uint256         timestamp
    );

    // ═══════════════════════════════════════════════════════════════
    //  MODIFIERS
    // ═══════════════════════════════════════════════════════════════

    modifier onlyAuthorized(address patient) {
        require(
            msg.sender == patient ||
            authorizedDoctors[patient][msg.sender],
            "MedicalRecords: acces refuse"
        );
        _;
    }

    modifier onlyPatientSelf() {
        require(
            userRole[msg.sender] == Role.Patient || userRole[msg.sender] == Role.None,
            "MedicalRecords: patient uniquement"
        );
        _;
    }

    // ═══════════════════════════════════════════════════════════════
    //  CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════

    constructor() {
        owner = msg.sender;
    }

    // ═══════════════════════════════════════════════════════════════
    //  ROLE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /// @notice Enregistre le rôle de l'utilisateur (Patient = 1, Doctor = 2)
    /// @param  role  Le rôle choisi
    function registerRole(Role role) external {
        require(role == Role.Patient || role == Role.Doctor, "Role invalide");
        userRole[msg.sender] = role;
        emit RoleRegistered(msg.sender, role, block.timestamp);
    }

    /// @notice Retourne le rôle d'une adresse
    function getRole(address user) external view returns (Role) {
        return userRole[user];
    }

    // ═══════════════════════════════════════════════════════════════
    //  RECORD MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /// @notice Ajoute un dossier médical (appelant = patient OU médecin autorisé)
    /// @param  patient      Adresse du patient concerné
    /// @param  ipfsCID      CID IPFS du fichier chiffré
    /// @param  encryptedKey Clé AES chiffrée côté client
    /// @param  rType        Type de dossier (enum RecordType)
    /// @param  description  Description textuelle du dossier
    function addRecord(
        address         patient,
        string calldata ipfsCID,
        string calldata encryptedKey,
        RecordType      rType,
        string calldata description
    ) external onlyAuthorized(patient) {
        require(bytes(ipfsCID).length > 0, "CID IPFS requis");
        require(bytes(description).length > 0, "Description requise");

        recordCounter++;

        Record memory rec = Record({
            id:             recordCounter,
            ipfsCID:        ipfsCID,
            encryptedKey:   encryptedKey,
            patientAddress: patient,
            doctorAddress:  (msg.sender == patient) ? address(0) : msg.sender,
            timestamp:      block.timestamp,
            recordType:     rType,
            description:    description,
            exists:         true
        });

        patientRecords[patient].push(rec);

        emit RecordAdded(
            recordCounter,
            patient,
            rec.doctorAddress,
            ipfsCID,
            rType,
            block.timestamp
        );
    }

    // ═══════════════════════════════════════════════════════════════
    //  ACCESS CONTROL
    // ═══════════════════════════════════════════════════════════════

    /// @notice Le patient accorde l'accès à un médecin
    /// @param  doctor      Adresse wallet du médecin
    /// @param  doctorName  Nom du médecin (stocké on-chain pour affichage)
    function grantAccess(address doctor, string calldata doctorName)
        external
    {
        require(msg.sender != doctor,                          "Impossible de s'auto-autoriser");
        require(doctor != address(0),                          "Adresse invalide");
        require(!authorizedDoctors[msg.sender][doctor],        "Medecin deja autorise");
        require(bytes(doctorName).length > 0,                  "Nom requis");

        authorizedDoctors[msg.sender][doctor] = true;

        doctorList[msg.sender].push(DoctorInfo({
            doctorAddress: doctor,
            name:          doctorName,
            grantedAt:     block.timestamp,
            active:        true
        }));

        emit AccessGranted(msg.sender, doctor, doctorName, block.timestamp);
    }

    /// @notice Le patient révoque l'accès d'un médecin
    /// @param  doctor  Adresse wallet du médecin à révoquer
    function revokeAccess(address doctor) external {
        require(authorizedDoctors[msg.sender][doctor], "Medecin non autorise");

        authorizedDoctors[msg.sender][doctor] = false;

        // Marquer comme inactif dans la liste
        DoctorInfo[] storage list = doctorList[msg.sender];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i].doctorAddress == doctor) {
                list[i].active = false;
                break;
            }
        }

        emit AccessRevoked(msg.sender, doctor, block.timestamp);
    }

    // ═══════════════════════════════════════════════════════════════
    //  GETTERS
    // ═══════════════════════════════════════════════════════════════

    /// @notice Récupère tous les dossiers du patient appelant
    function getMyRecords() external view returns (Record[] memory) {
        return patientRecords[msg.sender];
    }

    /// @notice Un médecin récupère les dossiers d'un patient (si autorisé)
    /// @param  patient  Adresse du patient
    function getPatientRecords(address patient)
        external
        view
        onlyAuthorized(patient)
        returns (Record[] memory)
    {
        return patientRecords[patient];
    }

    /// @notice Vérifie si un médecin est autorisé pour un patient
    function isAuthorized(address patient, address doctor)
        external
        view
        returns (bool)
    {
        return authorizedDoctors[patient][doctor];
    }

    /// @notice Liste des médecins autorisés (actifs) d'un patient
    function getAuthorizedDoctors()
        external
        view
        returns (DoctorInfo[] memory)
    {
        DoctorInfo[] storage all = doctorList[msg.sender];
        uint256 activeCount = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (all[i].active) activeCount++;
        }
        DoctorInfo[] memory active = new DoctorInfo[](activeCount);
        uint256 j = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (all[i].active) {
                active[j++] = all[i];
            }
        }
        return active;
    }

    /// @notice Nombre total de dossiers créés (tous patients confondus)
    function getTotalRecords() external view returns (uint256) {
        return recordCounter;
    }

    /// @notice Nombre de dossiers d'un patient
    function getPatientRecordCount(address patient)
        external
        view
        returns (uint256)
    {
        return patientRecords[patient].length;
    }
}
