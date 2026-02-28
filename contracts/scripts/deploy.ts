// ============================================
// deploy.ts
// Deploys EventTicket.sol to Sepolia testnet
// Run with: npx hardhat run contracts/scripts/deploy.ts --network sepolia
// ============================================

import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying EventTicket to Sepolia...");

  // get the deployer wallet (first account from PRIVATE_KEY in .env.local)
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with wallet:", deployer.address);

  // check deployer balance before deploying
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Wallet balance:", hre.ethers.formatEther(balance), "ETH");

  // get the contract factory — blueprint for deployment
  const EventTicketFactory = await hre.ethers.getContractFactory("EventTicket");

  // deploy with initial event config
  // these are just placeholder values — real values come from the frontend later
  const contract = await EventTicketFactory.deploy(
    "Chainkuns Launch Party", // event name
    "CKNFT", // ticket symbol
    hre.ethers.parseEther("0.05"), // ticket price — 0.05 ETH
    500n, // max supply — 500 tickets
    5n, // royalty — 5% on every resale
    deployer.address, // organizer — deployer wallet
  );

  // wait for deployment transaction to be confirmed
  await contract.waitForDeployment();

  // get the deployed contract address
  const contractAddress = await contract.getAddress();

  console.log("✅ EventTicket deployed to:", contractAddress);
  console.log(
    "📋 Copy this address to your .env.local as NEXT_PUBLIC_CONTRACT_ADDRESS",
  );
}

// run the deploy function and catch any errors
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
