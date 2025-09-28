const { ethers } = require("ethers");
const solc = require("solc");

class DeployService {
  constructor(wallet) {
    this.wallet = wallet;
  }

  compileContract() {
    const source = `
pragma solidity ^0.8.0;
contract Counter {
  uint256 public count;
  function increment() public { count += 1; }
}
`;
    const input = {
      language: "Solidity",
      sources: { "Counter.sol": { content: source } },
      settings: { outputSelection: { "*": { "*": ["*"] } } }
    };
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    const contract = output.contracts["Counter.sol"].Counter;
    return { abi: contract.abi, bytecode: "0x" + contract.evm.bytecode.object };
  }

  async deployContracts() {
    try {
      const { abi, bytecode } = this.compileContract();
      const factory = new ethers.ContractFactory(abi, bytecode, this.wallet);
      const contract = await factory.deploy({ gasLimit: 500000n });
      await contract.waitForDeployment();
      return { status: "Success", address: await contract.getAddress(), txHash: contract.deploymentTransaction().hash };
    } catch (e) {
      return { status: "Error", error: e.message };
    }
  }
}

module.exports = DeployService;
