import 'hardhat-deploy'
import { HardhatUserConfig } from 'hardhat/types'
import * as dotenv from "dotenv";
import "@nomiclabs/hardhat-ethers";

dotenv.config()

const config: HardhatUserConfig =  {
  solidity: { compilers: [{ version: '0.8.13' }] },
  namedAccounts: { deployer: 0 },
  networks: {
    hardhat: {
      chainId: 31337,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
      saveDeployments: true,
    },
    bobabase: {
      chainId: 1297,
      url: "https://bobabase.boba.network/",
      accounts: {
        mnemonic: process.env.MNEMONIC
      },
      saveDeployments: true,
    }
  },
};

export default config;
