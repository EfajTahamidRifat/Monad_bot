const { ethers } = require("ethers");
const config = require("../config/config.json");

class SwapService {
  constructor(wallet) {
    this.wallet = wallet;
    this.wmonContract = new ethers.Contract(
      config.contracts.wmon,
      ["function deposit() public payable", "function withdraw(uint256) public"],
      wallet
    );
  }

  async wrapMON(amount) {
    try {
      const tx = await this.wmonContract.deposit({ value: amount, gasLimit: 500000n });
      await tx.wait();
      return { status: "Success", txHash: tx.hash };
    } catch (e) {
      return { status: "Error", error: e.message };
    }
  }

  async unwrapMON() {
    try {
      const balance = await this.wmonContract.balanceOf(this.wallet.address);
      if (balance === 0n) return { status: "NoBalance" };
      const tx = await this.wmonContract.withdraw(balance, { gasLimit: 500000n });
      await tx.wait();
      return { status: "Success", txHash: tx.hash };
    } catch (e) {
      return { status: "Error", error: e.message };
    }
  }
}

module.exports = SwapService;
