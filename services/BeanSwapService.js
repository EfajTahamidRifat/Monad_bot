const { ethers } = require("ethers");
const config = require("../config/config.json");

class BeanSwapService {
  constructor(routerAddress, wallet) {
    this.wallet = wallet;
    this.routerAddress = routerAddress;
    this.wmon = config.contracts.wmon;
    this.usdc = config.contracts.beanswap.usdc;

    this.router = new ethers.Contract(routerAddress, [
      "function swapExactETHForTokens(uint256,address[],address,uint256) payable",
      "function swapExactTokensForETH(uint256,uint256,address[],address,uint256)"
    ], wallet);
  }

  async wrapMON(amount) {
    try {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const tx = await this.router.swapExactETHForTokens(
        0, [this.wmon, this.usdc], this.wallet.address, deadline,
        { value: amount, gasLimit: 500000n }
      );
      await tx.wait();
      return { status: "Success", txHash: tx.hash };
    } catch (e) {
      return { status: "Error", error: e.message };
    }
  }

  async unwrapMON() {
    try {
      const usdcContract = new ethers.Contract(this.usdc, ["function balanceOf(address) view returns (uint256)"], this.wallet);
      const balance = await usdcContract.balanceOf(this.wallet.address);
      if (balance === 0n) return { status: "NoBalance" };

      const approve = new ethers.Contract(this.usdc, ["function approve(address,uint256)"], this.wallet);
      await approve.approve(this.routerAddress, ethers.MaxUint256, { gasLimit: 100000n });

      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const tx = await this.router.swapExactTokensForETH(
        balance, 0, [this.usdc, this.wmon], this.wallet.address, deadline,
        { gasLimit: 500000n }
      );
      await tx.wait();
      return { status: "Success", txHash: tx.hash };
    } catch (e) {
      return { status: "Error", error: e.message };
    }
  }
}

module.exports = BeanSwapService;
