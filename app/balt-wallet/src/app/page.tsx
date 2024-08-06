'use client'
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers"
import { BaltABI } from "@/abi/Balt";

export interface AccountType {
  address?: string;
  balance?: string;
  chainId?: string;
  network?: string;
}

const CONTRACT_ADDRESS = "0x730114A4Aee3Bf806573eB05eD14f45A0bD44dD5"
const ABI = BaltABI


export default function Home() {

  const [buttonHovered, setButtonHovered] = useState(false)

  // metamask connection
  const [accountData, setAccountData] = useState<AccountType|null>(null)

  // Balto Token
  const [currentBalance, setCurrentBalance] = useState(0)
  const [showTransferForm, setShowTransferForm] = useState(false)
  const [transferData, setTransferData] = useState({ amount:"", address:"" })

  const _connectToMetaMask = useCallback(async () => {
    const ethereum = window.ethereum;
    // Check if MetaMask is installed
    if (typeof ethereum !== "undefined") {
      try {
        // Request access to the user's MetaMask accounts
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        // Get the connected Ethereum address
        const address = accounts[0];
        // Create an ethers.js provider using the injected provider from MetaMask
        const provider = new ethers.BrowserProvider(ethereum);
        // Get the account balance
        const balance = await provider.getBalance(address);
        // Get the network ID from MetaMask
        const network = await provider.getNetwork();
        // Update state with the results
        setAccountData({
          address,
          balance: ethers.formatEther(balance),
          // The chainId property is a bigint, change to a string
          chainId: network.chainId.toString(),
          network: network.name,
        });
      } catch (error: Error | any) {
        alert(`Error connecting to MetaMask: ${error?.message ?? error}`);
      }
    } else {
      alert("MetaMask not installed");
    }
  }, []);

  const checkExistingConnection = async () => {
    try {
      const ethereum = window.ethereum;
      if (typeof ethereum !== "undefined") {
        // Check if user has already authorized MetaMask
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          // Get account details if connected
          const address = accounts[0];
          const provider = new ethers.BrowserProvider(ethereum);
          const balance = await provider.getBalance(address);
          const network = await provider.getNetwork();
          setAccountData({
            address,
            balance: ethers.formatEther(balance),
            chainId: network.chainId.toString(),
            network: network.name,
          });
        }
      }
    } catch (error) {
      console.error("Error checking existing connection:", error);
    }
  };

  useEffect(() => {
    checkExistingConnection();
  }, []);
  
  useEffect(() => {
    accountData
  }, [accountData]);
  


  function truncateText(text:string) {
  if (text.length <= 10) {
    return text;
  } else {
    return `${text.substring(0, 5)}...${text.substring(text.length - 5)}`;
  }
}


async function handleTransfer() {
  // connect to my smart contract 0x730114A4Aee3Bf806573eB05eD14f45A0bD44dD5 and exec a transaction 
  // you have to call the method "transfer" of the contract and pass transferdata as parameters
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const contractWithSigner = contract.connect(await signer)
    await contractWithSigner.transfer(transferData.address, transferData.amount)
  } catch (error) {
    console.error('Error during transfer:', error);
  }
}


const getAccountBalance = async() => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const contractWithSigner = contract.connect(await signer)
    const balance = await contractWithSigner.getAddressBalance()
    setCurrentBalance(Number(balance))
}

useEffect(()=>{
  if(!currentBalance) getAccountBalance()
}, [])


const listenTransfers = async() => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const contractWithSigner = contract.connect(await signer)

    contract.on("Transfer", (to, amount, from) => {
      console.log(to, amount, from);
    });

}

useEffect(()=>{
  listenTransfers()
}, [])
  

  return (
    <div>
      {
        !accountData && (
          <div className="h-screen flex justify-center items-center bg-gradient-to-br from-gray-950  via-gray-700 to-gray-950">
            <div className="relative w-[250px] h-[250px] cursor-pointer" 
            onClick={()=>{
              _connectToMetaMask()
            }} 
            onMouseOver={()=>setButtonHovered(true)} onMouseLeave={()=>setButtonHovered(false)}>
              <div className={`transition-all border-[5px] border-[#3C6F64] rounded-full absolute top-0 left-0 right-0 bottom-0 ${buttonHovered?"blur-0":"blur-[2px]"}`} />
              <div className={`transition-all border-[5px] border-[#3C6F64] rounded-full absolute top-3 left-3 right-3 bottom-3 ${buttonHovered?"blur-0":"blur-[2px]"}`} />
              <div className={`transition-all border-[5px] border-[#3C6F64] rounded-full absolute top-0 left-0 right-0 bottom-0 ${buttonHovered?"bg-white bg-opacity-10":"bg-transparent"} `} />
              <div className={`font-grotesk transition-all text-center text-4xl absolute w-[250px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${buttonHovered?"text-[#fff]":"text-[#34a58d]"} ${buttonHovered?"scale-95":"scale-100"}`} >Connect to Metamask</div>
            </div>
          </div>
        )
      }
      {
        accountData && (
          <div className="pb-10 min-h-screen bg-gradient-to-br from-gray-950  via-gray-700 to-gray-950">
           
            <div className="py-5 pt-24 flex justify-center items-center flex-col">
              <div className="text-white bg-purple-600 py-2 px-4 rounded-full border border-gray-300">
                { accountData.network } { truncateText(accountData.address || "") }
              </div>
              {/* <div className="text-white text-xs">{ accountData.balance }</div> */}
            </div>

            <div className="text-gray-200 text-center sm:text-4xl text-3xl">
              { currentBalance }
              <div className="text-gray-400 text-center sm:text-2xl text-xl">BLT</div>
              <div className="mb-10" />
            </div>

            <div className="flex justify-center items-center gap-2 flex-wrap">
              <div className="w-[200px] h-[50px] bg-gray-300 bg-opacity-30 hover:border hover:border-gray-300 rounded-md text-white hover:scale-95 transition-all flex justify-center items-center cursor-pointer">Transfer</div>
              <div className="w-[200px] h-[50px] bg-gray-300 bg-opacity-30 hover:border hover:border-gray-300 rounded-md text-white hover:scale-95 transition-all flex justify-center items-center cursor-pointer">Allow Third Party</div>
            </div>

            <div className="mt-10 px-10 max-w-[800px] mx-auto">
              <div className="mb-4">
                <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-white">To</label>
                <input value={transferData.address} onChange={(e)=>setTransferData({ ...transferData, address:e.target.value })} type="text" id="first_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="0x00000000000000000000" required />
              </div>
              <div>
                <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-white">Amount</label>
                <input value={transferData.amount} onChange={(e)=>setTransferData({ ...transferData, amount:e.target.value })} type="text" id="first_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="BLT" required />
              </div>
              <div>
                <div onClick={handleTransfer} className="w-full text-center mt-5 text-white bg-gradient-to-b from-green-600 to-green-900 py-3 rounded-md shadow-lg hover:shadow-none shadow-gray-800 hover:scale-[0.99] hover:outline hover:outline-gray-400 transition-all">Send</div>
              </div>
            </div>

            <div className="mt-10 px-10 max-w-[800px] mx-auto">
              <div className="text-white text-4xl mb-10">Historial</div>
              <div>
                {
                  [1,2,3,4,5].map((item, index) => {
                    return (
                      <div className="flex items-start gap-3 mt-4 ">
                        <div className="rounded-full w-[50px] h-[50px] bg-gray-300" />
                        <div>
                          <div className="text-gray-300 text-lg">Receive</div>
                          <div className="text-sm text-green-400">Success</div>
                        </div>
                        <div className="flex-1 flex flex-col items-end">
                          <div className="text-gray-300 text-lg font-bold">0.000000567 BLT</div>
                          <div className="text-gray-400 text-xs">07-08-2024 | 3:53pm</div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>


          </div>
        )
      }
    </div>
  );
}
