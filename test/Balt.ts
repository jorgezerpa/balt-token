const { expect } = require("chai");
const { ethers } = require("hardhat")
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Balt Token Contract", function () {

  const deployContractFixture = async() => {
      const [ owner, addr1, addr2 ] = await ethers.getSigners();
      const baltToken = await ethers.deployContract("Balt");
      return { baltToken, owner, addr1, addr2 }
  }

  it("Deployment should assign the total supply of tokens to the owner", async function () {    
    const { baltToken } = await loadFixture(deployContractFixture)
    const totalBalance = await baltToken.getTotalSupply()
    const ownerBalance = await baltToken.getAddressBalance();
    expect(totalBalance).to.equal(ownerBalance);
  });

  describe("Handle not existing wallets", function () {
    it("If the address requested not exits, should return 0 as balance", async function () {
      const { baltToken, addr1 } = await loadFixture(deployContractFixture)
      const accountBalance = await baltToken.connect(addr1).getAddressBalance()
      expect(0).to.equal(accountBalance);
    });
  });

  describe("Handle transactions", function () {
    it("Transfer 2 BLT from owner to addr1", async function () {
      const { baltToken, addr1, addr2, owner } = await loadFixture(deployContractFixture)
      
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

    it("Transfer 2 BLT from owner to addr1, then 1 BLT from addr1 to addr2", async function () {
      const quantityToTransact:number = 2
      const { baltToken, addr1, addr2, owner } = await loadFixture(deployContractFixture)

      await baltToken.connect(owner).transfer(addr1, quantityToTransact)
      await baltToken.connect(addr1).transfer(addr2, 1)
      
      const addr1AccountBalance:number = await baltToken.connect(addr1).getAddressBalance()
      const addr2AccountBalance:number = await baltToken.connect(addr2).getAddressBalance()

      expect(addr1AccountBalance).to.equal(1)
      expect(addr2AccountBalance).to.equal(1)
    })

    it("Success passing 2 BLT from own to addr1, then fails passsing 3 BLT from addr1 to addr2", async function () {
      const quantityToTransact:number = 2
      const { baltToken, addr1, addr2, owner } = await loadFixture(deployContractFixture)

      await baltToken.connect(owner).transfer(addr1, quantityToTransact)
      expect(await baltToken.connect(addr1).getAddressBalance()).to.equal(2)
      await expect(baltToken.connect(addr1).transfer(addr2, 3)).to.be.reverted // await out cause asserting the promise, not the value
      

    })

  });

});

