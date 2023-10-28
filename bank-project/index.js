import { ethers } from "./ethers-5.1.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const supplyButton = document.getElementById("supplyButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
const mySuppliedButton = document.getElementById("mySuppliedButton");
connectButton.onclick = connect;
supplyButton.onclick = depositFunds;
withdrawButton.onclick = withdrawFunds;
balanceButton.onclick = getBalance;
mySuppliedButton.onclick = getMySupplied;

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
            console.log(error);
        }
        connectButton.innerHTML = "Connected";
        const accounts = await ethereum.request({ method: "eth_accounts" });
        console.log(accounts);
    } else {
        connectButton.innerHTML = "Please install Metamask";
    }
}

async function depositFunds() {
    var ethAmount = document.getElementById("ethAmount").value;
    console.log(`Depositing ${ethAmount}`);

    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.depositFunds({
                value: ethers.utils.parseEther(ethAmount),
            });
            await listenForTransactionMine(transactionResponse, provider);
        } catch (error) {
            console.log(error);
        }
    } else {
        supplyButton.innerHTML = "Please install Metamask";
    }
}

async function withdrawFunds() {
    var ethAmount = document.getElementById("ethAmount").value;
    console.log(`Withdrawing Funds: ${ethAmount}`);

    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.withdrawFunds(
                ethers.utils.parseEther(ethAmount)
            );
            await listenForTransactionMine(transactionResponse, provider);
        } catch (error) {
            console.log(error);
        }
    } else {
        supplyButton.innerHTML = "Please install Metamask";
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
            const balance = await provider.getBalance(contractAddress);
            document.getElementById("bank-balance").innerHTML =
                ethers.utils.formatEther(balance);
            console.log(ethers.utils.formatEther(balance));
        } catch (error) {
            console.log(error);
        }
    } else {
        balanceButton.innerHTML = "Please install MetaMask";
    }
}

async function getMySupplied() {
    console.log(`Checking my supplied Amount`);

    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            var myBalance = await contract.balanceCheck();
            document.getElementById("my-balance").innerHTML =
                ethers.utils.formatEther(myBalance);
            console.log(ethers.utils.formatEther(myBalance));
        } catch (error) {
            console.log(error);
        }
    } else {
        supplyButton.innerHTML = "Please install Metamask";
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`);
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(
                    `Completed with ${transactionReceipt.confirmations} confirmations. `
                );
                resolve();
            });
        } catch (error) {
            reject(error);
        }
    });
}
