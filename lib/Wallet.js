/** 
 * Wallet
 */
"use strict";

const ts = require('abv-ts')('abv:Wallet');

const $names = new Map();
const $max = 134217728; // 128 MB

class Wallet
{
	constructor(name, max=32, timeout=60) 
	{
		if (!name) throw new Error('no name');
		max *= 1048576;
		if ((max < 0)||(max > $max)) throw new Error('Limit: 0-' + $max);
		this.max = max;
		timeout *= 1000;
		this.timeout = timeout;
		this.cache = new Map();
		this.total = 0;
		$names.set(name,this);
	}	
	
	purge()
	{
		for(let [k,v] of this.cache.entries()){
			if ((v.out > 0) && (Date.now() > v.out)) this.delete(k);
		}
	}
	
	get(key)
	{ 
		if (!this.cache.has(key)) return null;
		const c = this.cache.get(key);
		return c.obj; 
	}
	
	set(key, obj, timeout=0)
	{
		if (!key || !obj) return;

		if (!obj.sizeof) return new TypeError('obj.sizeof?');

		if ((obj.sizeof < 0)||(obj.sizeof > this.max)) return;

		this.purge();

		if ((this.total + obj.sizeof) > this.max) return;
		
		this.total += obj.sizeof;
		const out = timeout === 0 ? 0 : Date.now() + timeout;
		this.cache.set(key, {out: out, obj: obj});
	}

	get size()
	{
		return this.cache.size;
	}

	clear()
	{
		this.total = 0;
		this.cache.clear();
	}

	delete(key)
	{
		const c = this.cache.get(key);
		if (c) this.total -= c.obj.sizeof;
		return this.cache.delete(key);
	}

	has(key)
	{
		return this.cache.has(key);
	}

	keys()
	{
		return this.cache.keys();
	}

	entries()
	{
		return this.cache.entries();
	}

	static get limit()
	{
		return $max;
	}

	static set limit(v)
	{
		if (ts.is(v,ts.INT) && (v > 0)) $max = v;
	}

	static name(n='')
	{
		if (n === '') return $names; 
		return $names.get(n);
	}
	
}

module.exports = Wallet;
