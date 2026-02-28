import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// load environment variables from .env.local
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "cancun", // required for latest OpenZeppelin contracts
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./contracts/test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`, // Alchemy Sepolia RPC
      accounts: [`0x${process.env.PRIVATE_KEY}`], // your MetaMask wallet
    },
  },
};

export default config;
