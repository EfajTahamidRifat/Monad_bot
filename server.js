const express = require('express');
const path = require('path');
const { ethers } = require('ethers');
const config = require('./config/config.json');
const Utils = require('./lib/utils');

// Services
const SwapService = require('./services/SwapService');
const UniswapService = require('./services/UniswapService');
const BeanSwapService = require('./services/BeanSwapService');
const SendTxService = require('./services/SendTxService');
const DeployService = require('./services/DeployService');
const KitsuService = require('./services/KitsuService');

const app = express();
const PORT = process.env.PORT || 3000;

let globalState = {
  logs: [],
  status: 'Idle',
  wallet: '',
  balance: '0.0000',
  services: [],
  cycles: { current: 0, total: config.cycles.default },
  startTime: null
};

function log(msg) {
  const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
  globalState.logs.push(line);
  if (globalState.logs.length > 100) globalState.logs.shift();
  console.log(line);
}

app.use(express.static('public'));
app.use(express.json());

app.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  const send = () => res.write(`data: ${JSON.stringify(globalState)}\n\n`);
  send();
  const iv = setInterval(send, 2000);
  req.on('close', () => clearInterval(iv));
});

app.post('/start', async (req, res) => {
  if (globalState.status === 'Running') return res.json({ error: 'Already running' });
  
  globalState = {
    logs: [],
    status: 'Starting...',
    wallet: '',
    balance: '0.0000',
    services: [],
    cycles: { current: 0, total: config.cycles.default },
    startTime: Date.now()
  };
  log("🚀 Starting Monad Bot...");

  try {
    const keys = Utils.getPrivateKeys();
    if (keys.length === 0) throw new Error("No private keys in private.key");
    
    const provider = new ethers.JsonRpcProvider(config.network.rpc.trim());
    const wallet = new ethers.Wallet(keys[0], provider);
    globalState.wallet = Utils.maskedWallet(wallet.address);
    log(`Wallet: ${globalState.wallet}`);

    const bal = await provider.getBalance(wallet.address);
    globalState.balance = parseFloat(ethers.formatEther(bal)).toFixed(6);
    log(`Balance: ${globalState.balance} MON`);

    // Initialize services
    const services = {
      swap: new SwapService(wallet),
      uniswap: new UniswapService(config.contracts.uniswap.router, wallet),
      beanSwap: new BeanSwapService(config.contracts.beanswap.router, wallet),
      sendTx: new SendTxService(wallet),
      deploy: new DeployService(wallet),
      kitsu: new KitsuService(config.contracts.kitsu.router, wallet)
    };

    globalState.services = Object.keys(services).map(name => ({ name, status: 'Ready' }));
    globalState.status = 'Running';

    // Run cycles
    for (let i = 1; i <= config.cycles.default; i++) {
      globalState.cycles.current = i;
      log(`🔄 Starting cycle ${i}/${config.cycles.default}`);

      const amount = Utils.getRandomAmount();
      const amtStr = parseFloat(ethers.formatEther(amount)).toFixed(8);

      // Swap
      log(`🔁 Swap: Wrapping ${amtStr} MON`);
      let result = await services.swap.wrapMON(amount);
      log(`✅ Swap wrap: ${result.status}`);

      await Utils.delay(Utils.getRandomDelay());

      log("🔁 Swap: Unwrapping WMON");
      result = await services.swap.unwrapMON();
      log(`✅ Swap unwrap: ${result.status}`);

      // Uniswap
      const tokens = Object.keys(config.contracts.uniswap.tokens);
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      log(`🔁 Uniswap: MON → ${token}`);
      result = await services.uniswap.swapEthForTokens(token, amount);
      log(`✅ Uniswap buy: ${result.status}`);

      await Utils.delay(Utils.getRandomDelay());

      log(`🔁 Uniswap: ${token} → MON`);
      result = await services.uniswap.swapTokensForEth(token);
      log(`✅ Uniswap sell: ${result.status}`);

      // BeanSwap
      log("🔁 BeanSwap: MON → USDC");
      result = await services.beanSwap.wrapMON(amount);
      log(`✅ BeanSwap buy: ${result.status}`);

      await Utils.delay(Utils.getRandomDelay());

      log("🔁 BeanSwap: USDC → MON");
      result = await services.beanSwap.unwrapMON();
      log(`✅ BeanSwap sell: ${result.status}`);

      // SendTx
      log("📤 SendTx: Random transfer");
      result = await services.sendTx.sendRandomTransaction();
      log(`✅ SendTx: ${result.status}`);

      // Deploy
      log("📦 Deploy: Counter contract");
      result = await services.deploy.deployContracts();
      log(`✅ Deploy: ${result.status}`);

      // Kitsu
      log("🔥 Kitsu: Stake MON");
      result = await services.kitsu.stakeMON();
      log(`✅ Kitsu: ${result.status}`);

      if (i < config.cycles.default) {
        const delayMs = Utils.getRandomDelay();
        log(`⏳ Waiting ${delayMs / 1000}s before next cycle...`);
        await Utils.delay(delayMs);
      }
    }

    globalState.status = 'Completed';
    log("🎉 Bot finished all cycles!");
  } catch (err) {
    globalState.status = 'Error';
    log(`❌ Fatal error: ${err.message}`);
  }

  res.json({ ok: true });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅ Monad Bot Dashboard running at http://localhost:${PORT}\n`);
  console.log(`🔗 GitHub: https://github.com/EfajTahamidRifat`);
  console.log(`💬 Telegram: https://t.me/cryptoHunters_247\n`);
});
