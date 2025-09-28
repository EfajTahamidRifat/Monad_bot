const { ethers } = require("ethers");
const Utils = require("../lib/utils");

class SendTxService {
  constructor(wallet) {
    this.wallet = wallet;
  }

  async sendRandomTransaction() {
    try {
      const addresses = Utils.loadWalletAddresses();
      if (addresses.length === 0) return { status: "NoWallets" };
      const to = addresses[Math.floor(Math.random() * addresses.length)];
      const amount = Utils.getRandomAmount();
      const tx = await this.wallet.sendTransaction({
        to,
        value: amount,
        gasLimit: 21000n
      });
      await tx.wait();
      return { status: "Success", txHash: tx.hash };
    } catch (e) {
      return { status: "Error", error: e.message };
    }
  }
}

module.exports = SendTxService;
