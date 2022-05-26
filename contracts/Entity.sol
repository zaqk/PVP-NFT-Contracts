// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@rari-capital/solmate/src/tokens/ERC721.sol";
import "./TuringHelper.sol";

contract Entity is ERC721 {

  uint256 public tokenId;
  TuringHelper public turing;
  string public api;

  uint256 public constant MAX_HEALTH = 5;

  // tokenId => health
  mapping(uint256 => uint256) public health;

  event NewEntity(address indexed owner, uint256 tokenId);
  event Attack(uint256 indexed attacker, uint256 indexed target);
  event Dead(uint256 indexed tokenId);
  event PayloadReceived(bytes payload);
  event Request(bytes request);
  event ProximityResult(uint256 attacker, uint256 target, bool isInProximity);
  event OffchainRandom(uint256 randomNumber);

  constructor(address _turing, string memory _api) ERC721("Entity", "ENTITY") {
    turing = TuringHelper(_turing);
    api = _api;
    tokenId = 1;
  }

  function tokenURI(uint256 _tokenId) public pure override returns (string memory) {
    return "";
  }

  function mint() external returns (uint256) {
    uint256 newTokenId = tokenId++;
    _mint(msg.sender, newTokenId);
    health[newTokenId] = MAX_HEALTH;
    emit NewEntity(msg.sender, newTokenId);
  }

  function getRandomNumber() external returns (uint256) {
    uint256 random = turing.TuringRandom();
    emit OffchainRandom(random);
    return random;
  }

  function attack(uint256 _attacker, uint256 _target) external {
    require(msg.sender == ownerOf[_attacker], "Unauthorized");
    require(health[_attacker] > 0, "Attacker is dead");
    require(health[_target] > 0, "Target is dead");

    // turing proximity check
    bytes memory payload = abi.encode(_attacker, _target);
    emit Request(payload);

    bytes memory resp = turing.TuringTx(api, payload);
    emit PayloadReceived(resp);

    bool isInProximity = abi.decode(payload, (bool));
    emit ProximityResult(_attacker, _target, isInProximity);

    //require(isInProximity, "Attacker is out of range");

    health[_target]--;
    emit Attack(_attacker, _target);

    if (health[_target] == 0) emit Dead(_target);
  }

  event SimpleAttack(bytes payload, bytes resp);
  function simpleAttack() external returns (bytes memory) {
    bytes memory payload = abi.encode(1, 2);
    bytes memory resp = turing.TuringTx(api, payload);
    emit SimpleAttack(payload, resp);
    return resp;
  }

}