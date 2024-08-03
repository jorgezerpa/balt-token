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

  it("Set the right owner", async() => {
    const { baltToken, owner } = await loadFixture(deployContractFixture);
    expect(await baltToken.owner()).to.equal(owner.address);
  })
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


  describe("Handle Third Party Transactions", ()=> {
    
    it("Reverts transaction if third party is not allowed", async()=>{
      const { baltToken, addr1, addr2, owner } = await loadFixture(deployContractFixture)
      
      await expect(baltToken.connect(owner).transferFrom(addr1, addr2, 10)).to.be.reverted
    })

    it("Remove Permissions", async()=>{
      const { baltToken, addr1, addr2, owner } = await loadFixture(deployContractFixture)
      
      await baltToken.connect(addr1).approveThirdParty(owner)
      const allowedAddresses = await baltToken.connect(addr1).getThirdParty()
      expect(allowedAddresses[0]).to.equal(owner)
      
      await baltToken.connect(addr1).removeThirdParty(owner)
      const allowedAddressesAfterRemove = await baltToken.connect(addr1).getThirdParty()

      await expect(allowedAddressesAfterRemove.length).to.equal(0)
    })

    it("Allow correct third party permission", async()=>{
      const { baltToken, addr1, addr2, owner } = await loadFixture(deployContractFixture)
      
      await baltToken.connect(addr1).approveThirdParty(owner)
      const allowedAddresses = await baltToken.connect(addr1).getThirdParty()
      expect(allowedAddresses[0]).to.equal(owner)
    })

    it("Transact from addr1 to addr2 from a third party account", async()=>{
      const { baltToken, addr1, addr2, owner } = await loadFixture(deployContractFixture)
      
      await baltToken.connect(addr1).approveThirdParty(owner)
      await baltToken.connect(owner).transfer(addr1, 10)
      await baltToken.connect(owner).transferFrom(addr1, addr2, 10)

      const addr1AccountBalance:number = await baltToken.connect(addr1).getAddressBalance()
      const addr2AccountBalance:number = await baltToken.connect(addr2).getAddressBalance()

      expect(addr1AccountBalance).to.equal(0)
      expect(addr2AccountBalance).to.equal(10)
    })


  })

  // describe("Handle Third Party Transactions", ()=> {
  //   it("Owner transacts 10 BLT from addr1 to addr2", async()=>{
  //     const { baltToken, addr1, addr2, owner } = await loadFixture(deployContractFixture)
      
  //     await baltToken.connect(owner).transfer(addr1, 10)
  //     await baltToken.connect(addr1).approveThirdParty(owner)
  //     await baltToken.connect(owner).transferFrom(addr1, addr2, 10)

  //     expect(await baltToken.connect(addr1).getAddressBalance()).to.equal(0)
  //     expect(await baltToken.connect(addr2).getAddressBalance()).to.equal(10)
  //   })
  // })

});

