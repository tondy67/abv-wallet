/**
 * abv-wallet
 */
"use strict";

const ts = require('abv-ts')('abv:wallet');
const Wallet = require('./lib/Wallet.js');

if (ts.isBrowser){
	if (!window.ts) window.ts = ts;
	if (window.abv) window.abv.Wallet = Wallet;
	else window.abv = {Wallet: Wallet}
}

module.exports = Wallet;
