const { expect } = require("chai");
const { ethers } = require("hardhat")

describe("Token contract", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [
        owner,
        addr1
    ] = await ethers.getSigners(); // how does ethers know the signer?
    
    const baltToken = await ethers.deployContract("Balt");
    const totalBalance = await baltToken.getTotalSupply()
    const ownerBalance = await baltToken.getAddressBalance();
    expect(totalBalance).to.equal(ownerBalance);
  });
});

describe("Handle not existing wallets", function () {
  it("If the address requested not exits, should return 0 as balance", async function () {
    const [
        ,
        addr1
    ] = await ethers.getSigners(); // how does ethers know the signer?
    
    const baltToken = await ethers.deployContract("Balt");
    
    const accountBalance = await baltToken.connect(addr1).getAddressBalance()
    expect(0).to.equal(accountBalance);
  });
});

describe("Handle transactions", function () {
  it("Transfer 2 BLT from owner to addr1", async function () {
    const [
        owner,
        addr1
    ] = await ethers.getSigners(); // how does ethers know the signer?
    
    const baltToken = await ethers.deployContract("Balt");
    const totalBalance:number = await baltToken.getTotalSupply()
    const quantityToTransact:number = 2
    
    const ownerWallet = baltToken.connect(owner)
    const addr1Wallet = baltToken.connect(addr1)

    await ownerWallet.transfer(addr1, quantityToTransact)

    const ownerAccountBalance:number = await ownerWallet.getAddressBalance()
    const addr1AccountBalance:number = await addr1Wallet.getAddressBalance()

    expect(ownerAccountBalance).to.equal(BigInt(totalBalance)-BigInt(quantityToTransact));
    expect(addr1AccountBalance).to.equal(BigInt(quantityToTransact));
  });
});