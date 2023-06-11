/// @author raffy.eth
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts@4.8.2/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts@4.8.2/utils/cryptography/ECDSA.sol";

contract Checker is Ownable {

	address public normSigner = 0xd6E63E18e85F911755019e73A6f93d04B080B3aD; // address of PRIVATE_KEY

	function setSigner(address signer) onlyOwner external {
		normSigner = signer;
	}

	function isEthmoji(string calldata label, bytes calldata sig) external view returns (bool) {
		bytes32 labelhash = keccak256(abi.encodePacked(label));
		bytes32 hash = keccak256(abi.encodePacked("ethmoji:", labelhash)); // SIG_PREFIX
		address signer = ECDSA.recover(hash, sig);
		return signer == normSigner;
	}

}
