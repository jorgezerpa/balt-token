//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;

contract Balt {
    string public constant NAME = "Balt";
    string public constant SYMBOL = "Blt";
    uint256 public constant TOTAL_SUPPLY = 20000000;
     
    address public owner;

    mapping(address => uint256) balances;

    // TRANSFER? events?

    constructor() {
        balances[msg.sender] = TOTAL_SUPPLY;
        owner = msg.sender; 
    }


    // methods  
    function getTotalSupply() public pure returns(uint256) {
        return TOTAL_SUPPLY;
    }

    function getAddressBalance() public view returns(uint256) {
        return balances[msg.sender];
    }

    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender]>=amount, "Not enough tokens");

        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
    

    function transferFrom() public returns(uint256) {
        // for exchanges, wallets, etc allow 3rd parties to transfer acounts
    }

    function ApproveThirdParty() public returns(uint256) {
        // Sets an allowance for a third party to spend tokens on behalf of an account.
    }



}