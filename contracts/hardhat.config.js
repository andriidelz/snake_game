require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_SEPOLIA,
      accounts: [process.env.PRIVATE_KEY]
    },
    polygon: {
      url: process.env.ALCHEMY_POLYGON,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};