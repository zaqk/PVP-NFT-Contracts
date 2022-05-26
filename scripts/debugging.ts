import bobaTuringCreditAbi from '../abis/BobaTuringCredit.json';
import ERC20Abi from '../abis/ERC20.json';
import hre from 'hardhat';
import { HeritageClause } from 'typescript';
import { ethers } from 'ethers';

// only for read only debugging via console. never writes on chain.

const debug = async () => {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {get} = deployments;
  const {deployer} = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  console.log(`signer === ${signer.address}`);
  const bobaTuringCreditAddress = '0x4200000000000000000000000000000000000020';
  const turingCredit = new ethers.Contract(
    bobaTuringCreditAddress,
    bobaTuringCreditAbi,
    signer,
  )
  const bobaGasTokenAddress = await turingCredit.turingToken();

  const bobaGasToken = await new ethers.Contract(
    bobaGasTokenAddress,
    ERC20Abi,
    signer,
  );

  const turingHelperInfo = await get('TuringHelper');
  const turingHelper = new ethers.Contract(
    turingHelperInfo.address,
    turingHelperInfo.abi,
    signer,
  );
  const entity = await get('Entity');


  console.log(`bobaGasToken === ${bobaGasTokenAddress}`);
  console.log(`turingCredit === ${turingCredit.address}`);
  console.log(`turingHelper.address === ${turingHelper.address}`);
  console.log(`entity address === ${entity.address}`);

  console.log(`boba balanceOf ===${await bobaGasToken.balanceOf(deployer)}`);

  console.log(`tuirngCredit.prepaidBalance(turingHelper) === ${await turingCredit.prepaidBalance(turingHelper.address)}`);
  console.log(`turingCredit.getCreditAmount() === ${(await turingCredit.getCreditAmount(turingHelper.address)).toNumber()}`);
  
  console.log(`turingHelper.permittedCaller(entity) === ${await turingHelper.permittedCaller(entity.address)}`);
}

debug();
