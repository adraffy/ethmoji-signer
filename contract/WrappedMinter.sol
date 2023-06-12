/// @author raffy.eth
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ECDSA} from "@openzeppelin/contracts@4.8.2/utils/cryptography/ECDSA.sol";
//import {INameWrapper} from "https://github.com/ensdomains/ens-contracts/blob/master/contracts/wrapper/INameWrapper.sol";

uint32 constant CANNOT_UNWRAP = 1;
uint32 constant CANNOT_CREATE_SUBDOMAIN = 32;
uint32 constant PARENT_CANNOT_CONTROL = 1 << 16;
uint32 constant CAN_EXTEND_EXPIRY = 1 << 18;
interface INameWrapper {
	function isWrapped(bytes32 parent, bytes32 child) external view returns (bool);
	function setSubnodeRecord(
		bytes32 node,
		string calldata label,
		address owner,
		address resolver,
		uint64 ttl,
		uint32 fuses,
		uint64 expiry
	) external returns (bytes32);
	function getData(
		uint256 id
	) external view returns (address, uint32, uint64); 
}

contract WrappedMinter  {

	// https://github.com/adraffy/ethmoji-signer
	string constant SIG_PREFIX = "ethmoji:"; 
	address constant SIGNER = 0xd6E63E18e85F911755019e73A6f93d04B080B3aD; // address of PRIVATE_KEY

	address constant RESOLVER = 0xd7a4F6473f32aC2Af804B3686AE8F1932bC35750; // goerli
	//address constant RESOLVER = 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63; // mainnet
	
	// namehash of "chonk.eth"
	// https://adraffy.github.io/ens-normalize.js/test/resolver.html#chonk.eth
	bytes32 constant PARENT_NODE = 0x0a9bae3bf58bdc0fe60e8d0667c84c70dd60acd05b02643d2a4fe526032faa76;

	INameWrapper constant WRAPPER = INameWrapper(0x114D4603199df73e7D157787f8778E21fCd13066); // goerli
	//INameWrapper constant WRAPPER = INameWrapper(0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401); // maininet

	uint32 constant FUSES = PARENT_CANNOT_CONTROL | CANNOT_CREATE_SUBDOMAIN | CANNOT_UNWRAP | CAN_EXTEND_EXPIRY;

	function mint(string calldata label, bytes calldata sig) external {
		bytes32 labelhash = keccak256(abi.encodePacked(label));
		bytes32 hash = keccak256(abi.encodePacked(SIG_PREFIX, labelhash));
		address signer = ECDSA.recover(hash, sig); 
		require(signer == SIGNER, "invalid");
		require(!WRAPPER.isWrapped(PARENT_NODE, labelhash), "exists");
		WRAPPER.setSubnodeRecord(PARENT_NODE, label, msg.sender, RESOLVER, 0, FUSES, type(uint64).max);
	}

}
