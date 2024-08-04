import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
 

const BaltModule = buildModule("BaltModule", (m) => {
  const Balt = m.contract("Balt");
  return { Balt };
});

module.exports = BaltModule;