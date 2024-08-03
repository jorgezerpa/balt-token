//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;
import "hardhat/console.sol";


contract Balt {
    string public constant NAME = "Balt";
    string public constant SYMBOL = "Blt";
    uint256 public constant TOTAL_SUPPLY = 20000000;
     
    address public owner;

    mapping(address => uint256) balances;
    mapping(address => address[]) permissions;


    constructor() {
        balances[msg.sender] = TOTAL_SUPPLY;
        owner = msg.sender; 
    }

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event TransferFromThirdParty(address indexed transactioner,address indexed from, address indexed to, uint256 amount);


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

        emit Transfer(msg.sender, to, amount);
    }
    

    function transferFrom(address from, address to, uint256 amount ) public {
        
        bool senderIsAllowed;
        
        for (uint i = 0; i < permissions[from].length; i++) {
            if (permissions[from][i] == msg.sender) {
                senderIsAllowed = true;                
            }
        }

        require(senderIsAllowed, "Sender is not allowed to make this transaction");
        require(balances[from]>=amount, "Not enough money in from account");
        
        balances[from] -= amount;
        balances[to] += amount;

        emit TransferFromThirdParty(msg.sender, from, to, amount);
    }

    function approveThirdParty(address allowedAddress) public {
        permissions[msg.sender].push(allowedAddress);
    }

    function removeThirdParty(address allowedAddressToRemove) public {
        require(permissions[msg.sender].length>0, "Don't have allowed addresses to remove");

        for (uint i = 0; i < permissions[msg.sender].length; i++) {
            if (permissions[msg.sender][i] == allowedAddressToRemove) {
                permissions[msg.sender][i] = permissions[msg.sender][permissions[msg.sender].length - 1];
                permissions[msg.sender].pop();
                return;
            }
        }
    }

    function getThirdParty() public view returns (address[] memory) {
        return permissions[msg.sender];
    }

    


}