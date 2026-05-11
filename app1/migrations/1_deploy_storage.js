/* global artifacts */
const MedicalRecords = artifacts.require("MedicalRecords");

module.exports = function (deployer, network, accounts) {
  console.log("=================================================");
  console.log("  Déploiement de MedicalRecords.sol");
  console.log("  Réseau  :", network);
  console.log("  Compte  :", accounts[0]);
  console.log("=================================================");

  deployer.deploy(MedicalRecords).then(() => {
    console.log("✅ MedicalRecords déployé à :", MedicalRecords.address);
  });
};