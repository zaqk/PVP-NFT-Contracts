import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {BigNumber, ethers} from 'ethers';
import bobaTuringCreditAbi from '../abis/BobaTuringCredit.json';

// mint entities of FE then call this script to test proximity
// will sucessfully attack if entities are within proxmity.
let tokenId1: BigNumber | null = null // BigNumber.from(1);
let tokenId2: BigNumber | null = null // BigNumber.from(2);

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts, ethers} = hre;
  
  const {get} = deployments;
  const {deployer} = await getNamedAccounts();

  const signer = await ethers.getSigner(deployer);

  const bobaTuringCreditAddress = '0x4200000000000000000000000000000000000020';
  const turingCredit = new ethers.Contract(
    bobaTuringCreditAddress,
    bobaTuringCreditAbi,
    signer
  )

  const turingHelper = await get('TuringHelper');
  const creditAmt = await turingCredit.getCreditAmount(turingHelper.address);

  console.log(`available credit: ${JSON.stringify(creditAmt.toNumber())}`); 

  const entityInfo = await get('Entity');

  const entity = new ethers.Contract(
    entityInfo.address,
    entityInfo.abi,
    signer,
  );

  // tokenIds dont exist mint them
  if ( !tokenId1 || !tokenId2 ) {
    // mint new tokens
    const token1Tx = await entity.mint();
    const token2Tx = await entity.mint();

    // grab new token ids
    const tokenTxRes1 = await token1Tx.wait();
    const tokenTxRes2 = await token2Tx.wait();

    console.log(`tokenTxRes1 === ${JSON.stringify(tokenTxRes1)}`);
    console.log(`tokenTxRes2 === ${JSON.stringify(tokenTxRes2)}`);


    const event1: {args: {tokenId: BigNumber} } = tokenTxRes1.events.find((event: { event: string; }) => event.event === 'NewEntity');
    const tokenId1 = event1.args.tokenId;

    const event2: {args: {tokenId: BigNumber} } = tokenTxRes2.events.find((event: { event: string; }) => event.event === 'NewEntity');
    const tokenId2 = event2.args.tokenId;

    console.log(`minted tokenId1 === ${tokenId1.toString()}, minted tokenId2 === ${tokenId2.toString()}`);
    console.log(`if this next tx fails take the tokenIds that were just minted
    and input them at the top of this script.
    no time to fix. this is just a proof of concept`);
    await attack(entity, tokenId1, tokenId2);
  } else {

    // else token ids exist already so just call attack
    console.log(`using preexisting tokens, tokenId1 === ${tokenId1}, tokenId2 === ${tokenId2}`);

    await attack(entity, tokenId1, tokenId2);
  }

};

async function attack(entity:ethers.Contract, attacker:BigNumber, target:BigNumber) {
  const gasLimit = await entity.estimateGas.attack(attacker, target);
  console.log(`gasLimit === ${gasLimit}`);
  const tx = await entity.attack(attacker, target, {gasLimit});
  const result = await tx.wait();
  console.log(`result === ${JSON.stringify(result)}\n`);
  
  const request = result.events.find((event: { event: string}) => event.event === 'Request');
  console.log(`request === ${JSON.stringify(request)}\n`);

  const payloadReceived = result.events.find((event: { event: string}) => event.event === 'PayloadReceived');
  console.log(`payloadReceived === ${JSON.stringify(payloadReceived)}\n`);

  const proximityResult = result.events.find((event: { event: string}) => event.event === 'ProximityResult');
  console.log(`ProximityResult === ${JSON.stringify(proximityResult)}\n`);
}

func.tags = ['test'];
export default func;