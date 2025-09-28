# 🚀 Monad Testnet Automation Bot

A **fully featured, web-based automation bot** for **[Monad Testnet](https://monad.xyz)** that executes common on-chain actions — including token swaps, native transfers, contract deployments, and staking — all from a sleek, real-time dashboard running in your browser.

Built for developers, testers, and validators who want to stress-test, interact with, or automate activity on **Monad**, the high-performance EVM-compatible Layer-1 blockchain.

---

## 🔥 Features

- ✅ **Web Dashboard** – Runs on `http://localhost:3000` with live logs and status
- ✅ **Full Monad Testnet Support** – Optimized for **0 GWei fees** and **EVM compatibility**
- ✅ **6 Integrated Services**:
  - **WMON Swap** – Wrap/unwrap native MON ↔ WMON
  - **Uniswap** – Swap MON ↔ any supported token (DAC, USDT, WETH, MUK, USDC, CHOG)
  - **BeanSwap** – MON ↔ USDC via BeanSwap router
  - **SendTx** – Random native MON transfers
  - **Deploy** – Auto-deploy Solidity contracts (e.g., `Counter.sol`)
  - **Kitsu** – Stake MON via Kitsu protocol
- ✅ **Multi-cycle automation** – Configurable number of cycles with random delays
- ✅ **Real-time updates** – Server-Sent Events (SSE) for live logging
- ✅ **Termux & CLI Friendly** – Works on Android (Termux), Linux, macOS, Windows (WSL)
- ✅ **No external APIs** – All interactions are on-chain via `ethers.js`

---

## 🌐 Monad Testnet Info

- **RPC**: `https://testnet-rpc.monad.xyz`
- **Explorer**: [https://testnet.monadexplorer.com](https://testnet.monadexplorer.com)
- **Gas**: **0 GWei** (transactions are effectively free)
- **Native Token**: **MON** (like ETH on Ethereum)
- **Wrapped MON**: **WMON** (`0x760...5701`) – ERC-20 equivalent

> ⚠️ Note: The explorer returns **“Page Not Found”** for direct transaction URLs (e.g., `/tx/0x...`), but **transactions still succeed on-chain**.

---

## 🛠️ Installation

### 1. Clone the repo
```bash
git clone https://github.com/EfajTahamidRifat/Monad_bot.git
cd Monad_bot
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add your private key
Create `private.key` in the root folder:
```txt
YOUR_PRIVATE_KEY_HERE
```
> 🔐 **Never commit this file!** It’s already in `.gitignore`.

### 4. (Optional) Add target wallets
Edit `wallets.txt` for random transfers:
```txt
0x1234...abcd
0x5678...efgh
```

---

## ▶️ Usage

Start the bot server:
```bash
node server.js
```

Open your browser:
```
http://localhost:3000
```

Click **"🚀 Start Automation"** to begin.

The bot will:
1. Initialize all services
2. Run configured cycles (default: 3)
3. Perform swaps, transfers, deploys, and stakes
4. Log everything in real time

---

## ⚙️ Configuration

Edit `config/config.json` to customize:

- Number of cycles
- Random amount range (in MON)
- Delay between actions
- Gas limits
- Contract addresses

```json
{
  "cycles": {
    "default": 3,
    "amounts": { "min": 0.00001, "max": 0.00009 },
    "delays": { "min": 5000, "max": 10000 }
  }
}
```

---

## 📦 Project Structure

```
├── config/             # Network & contract configs
├── lib/                # Core utilities (wallet, delay, etc.)
├── services/           # All automation services
├── public/             # Web UI (HTML/CSS/JS)
├── private.key         # Your private key (KEEP SECRET)
├── wallets.txt         # Target addresses for SendTx
├── server.js           # Main bot + web server
└── README.md
```

---

## 📞 Support & Community

- **Telegram**: [https://t.me/cryptoHunters_247](https://t.me/cryptoHunters_247)
- **GitHub**: [https://github.com/EfajTahamidRifat](https://github.com/EfajTahamidRifat)

> Made with ❤️ for the **Monad ecosystem**.

---

## 📜 License

MIT License – feel free to use, modify, and distribute.

---

> **Note**: This tool is for **testnet use only**. Always test with small amounts. Not financial advice.
