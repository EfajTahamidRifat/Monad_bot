const { ethers } = require("ethers");
const config = require("../config/config.json");

class KitsuService {
  constructor(routerAddress, wallet) {
    this.wallet = wallet;
    this.contractAddress = routerAddress;
  }

  async stakeMON() {
    try {
      const amount = require("../lib/utils").getRandomAmount();
      const tx = await this.wallet.sendTransaction({
        to: this.contractAddress,
        data: "0xd5575982",
        value: amount,
        gasLimit: 500000n
      });
      await tx.wait();
      return { status: "Success", txHash: tx.hash };
    } catch (e) {
      return { status: "Error", error: e.message };
    }
  }
}

module.exports = KitsuService;
