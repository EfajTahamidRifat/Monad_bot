const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

function getPrivateKeys() {
  const keyPath = path.join(__dirname, "../private.key");
  if (!fs.existsSync(keyPath)) throw new Error("private.key not found");
  return fs.readFileSync(keyPath, "utf8")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith("#"));
}

function loadWalletAddresses() {
  const walletsFile = path.join(__dirname, "../wallets.txt");
  if (!fs.existsSync(walletsFile)) return [];
  return fs.readFileSync(walletsFile, "utf8")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith("0x") && line.length === 42);
}

function getRandomAmount() {
  const config = require("../config/config.json");
  const { min, max } = config.cycles.amounts;
  const amount = Math.random() * (max - min) + min;
  return ethers.parseEther(amount.toFixed(8));
}

function getRandomDelay() {
  const config = require("../config/config.json");
  const { min, max } = config.cycles.delays;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function maskedWallet(address) {
  if (!address || address.length < 10) return address;
  return address.substring(0, 6) + "..." + address.substring(address.length - 4);
}

module.exports = {
  getPrivateKeys,
  loadWalletAddresses,
  getRandomAmount,
  getRandomDelay,
  delay,
  maskedWallet
};
