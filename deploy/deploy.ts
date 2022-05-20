import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  
  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();
  const chainId = await hre.getChainId();

  const signer = await ethers.getSigner(deployer);

  console.log(`chainId === ${chainId}`)

  let api = chainId === '31337' ? 
  'http://localhost:8080/api/turing-proximity' : // local
  'https://contract-playground.herokuapp.com/api/turing-proximity'; // testnet

  console.log(`got here`)

  const turingHelperInfo = await deploy('TuringHelper', {
    from: deployer,
    log: true,
  })

  console.log(`got here 123`)

  const turingHelper = new ethers.Contract(
    turingHelperInfo.address,
    turingHelperInfo.abi,
    signer,
  )

  console.log(`got here 456`)

  const entityInfo = await deploy('Entity', {
    from: deployer,
    log: true,
    args: [turingHelperInfo.address, api],
  })

  console.log(`got here 789`)


  await turingHelper.addPermittedCaller(entityInfo.address)

  console.log(`got here final`)

};
func.tags = ['main', 'local', 'seed'];
export default func;