const { ethers } = require("ethers");
const config = require("../config/config.json");
const Utils = require("../lib/utils");

class UniswapService {
  constructor(routerAddress, wallet) {
    this.wallet = wallet;
    this.routerAddress = routerAddress;
    this.wethAddress = config.contracts.uniswap.weth;
    this.tokenAddresses = config.contracts.uniswap.tokens;

    this.routerABI = [
      {
        name: "swapExactETHForTokens",
        type: "function",
        stateMutability: "payable",
        inputs: [
          { internalType: "uint256", name: "amountOutMin", type: "uint256" },
          { internalType: "address[]", name: "path", type: "address[]" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "deadline", type: "uint256" }
        ]
      },
      {
        name: "swapExactTokensForETH",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
          { internalType: "uint256", name: "amountIn", type: "uint256" },
          { internalType: "uint256", name: "amountOutMin", type: "uint256" },
          { internalType: "address[]", name: "path", type: "address[]" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "deadline", type: "uint256" }
        ]
      }
    ];
    this.router = new ethers.Contract(this.routerAddress, this.routerABI, wallet);
  }

  async swapEthForTokens(tokenSymbol, amountIn) {
    try {
      const token = this.tokenAddresses[tokenSymbol];
      if (!token) throw new Error(`Token ${tokenSymbol} not found`);
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const tx = await this.router.swapExactETHForTokens(
        0, [this.wethAddress, token], this.wallet.address, deadline,
        { value: amountIn, gasLimit: 500000n }
      );
      await tx.wait();
      return { status: "Success", txHash: tx.hash };
    } catch (e) {
      return { status: "Error", error: e.message };
    }
  }

  async swapTokensForEth(tokenSymbol) {
    try {
      const token = this.tokenAddresses[tokenSymbol];
      if (!token) throw new Error(`Token ${tokenSymbol} not found`);
      const erc20 = new ethers.Contract(token, ["function balanceOf(address) view returns (uint256)"], this.wallet);
      const balance = await erc20.balanceOf(this.wallet.address);
      if (balance === 0n) return { status: "NoBalance" };

      const approveABI = ["function approve(address,uint256)"];
      const approve = new ethers.Contract(token, approveABI, this.wallet);
      const allowance = await new ethers.Contract(token, ["function allowance(address,address) view returns (uint256)"], this.wallet)
        .allowance(this.wallet.address, this.routerAddress);
      if (allowance < balance) {
        const appr = await approve.approve(this.routerAddress, ethers.MaxUint256, { gasLimit: 100000n });
        await appr.wait();
      }

      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const tx = await this.router.swapExactTokensForETH(
        balance, 0, [token, this.wethAddress], this.wallet.address, deadline,
        { gasLimit: 500000n }
      );
      await tx.wait();
      return { status: "Success", txHash: tx.hash };
    } catch (e) {
      return { status: "Error", error: e.message };
    }
  }
}

module.exports = UniswapService;
