import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import bobaTuringCreditAbi from '../abis/BobaTuringCredit.json';
import ERC20Abi from '../abis/ERC20.json';

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

  const turingHelperInfo = await deploy('TuringHelper', {
    from: deployer,
    log: true,
  })

  const turingHelper = new ethers.Contract(
    turingHelperInfo.address,
    turingHelperInfo.abi,
    signer,
  )
  const entityInfo = await deploy('Entity', {
    from: deployer,
    log: true,
    args: [turingHelperInfo.address, api],
  })
  //await turingHelper.addPermittedCaller(entityInfo.address)

  // fund turing credit account
  const bobaTuringCreditAddress = '0x4200000000000000000000000000000000000020';
  const turingCredit = new ethers.Contract(
    bobaTuringCreditAddress,
    bobaTuringCreditAbi,
    signer
  )

  const bobaGasTokenAddress = await turingCredit.turingToken();
  console.log(`turingToken === ${bobaGasTokenAddress}`);

  const bobaGasToken = await new ethers.Contract(
    bobaGasTokenAddress,
    ERC20Abi,
    signer
  );

  console.log(`balanceOf ===${await bobaGasToken.balanceOf(signer.address)}`);
  
  const gasToSend = ethers.utils.parseEther('100')
  bobaGasToken.approve(turingCredit.address, gasToSend);

  const tx = await turingCredit.addBalanceTo(gasToSend, turingHelper.address, {gasLimit:5_000_000})
  const result = await tx.wait();
  const balanceAmountAdded = result.events.find((event: { event: string}) => event.event === 'AddBalanceTo');
  console.log(`balanceAmountAdded === ${JSON.stringify(balanceAmountAdded)}`);

  console.log(`turingToken === ${await turingCredit.turingToken()}`);
  console.log(`turingPrice === ${await turingCredit.turingPrice()}`);
  console.log(`tuirngCredit.prepaidBalance(turingHelper) === ${await turingCredit.prepaidBalance(turingHelper.address)}`);
  console.log(`turingCredit.getCreditAmount() === ${(await turingCredit.getCreditAmount(turingHelper.address)).toNumber()}`);
};
func.tags = ['main']
export default func;