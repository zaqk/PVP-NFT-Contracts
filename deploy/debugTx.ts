import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import Web3 from 'web3';
import {TransactionConfig, BlockNumber} from 'web3-core';

const txHash = '0xe9ea4168a1d38c3829458e87deeb29ecfe1f5495a1db9434296d6dbaf125af44'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  
  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();
  const chainId = await hre.getChainId();

  const signer = await ethers.getSigner(deployer);

  const web3 = new Web3("https://bobabase.boba.network/");


  const tx = await web3.eth.getTransaction(txHash)
  const result = await web3.eth.call(tx as TransactionConfig, tx.blockNumber as BlockNumber)
  console.log(JSON.stringify(result))

};

func.tags = ['debug']
export default func;