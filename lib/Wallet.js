/** 
 * Wallet
 */
"use strict";

const ts = require('abv-ts')('abv:Wallet');

const $instances = new Map();
const $max = 134217728; // 128 MB

class Wallet
{
	constructor(name, max=32, timeout=60000) // 32 MB, 60 sec.
	{
		if (!name) throw new Error('no name');
		max *= 1048576;
		if ((max < 0)||(max > $max)) throw new Error('Limit: 0-' + $max);
		this.max = max;
		this.timeout = timeout;
		this.cache = new Map();
		this.total = 0;
		this.log = [];
		this.ls = 0;
		$instances.set(name,this);
	}	
	
	err(v) {};
	
	_purge(k,v)
	{
		if (!v) return null;
		let r = v.obj;
		if ((v.out > 0) && (Date.now() > v.out)){
			this.delete(k);
			r = null;
		}
		return r;
	}
	
	purge()
	{
		for(let [k,v] of this.cache.entries()) this._purge(k,v);
	}
	
	get(key)
	{ 
		if (!this.cache.has(key)) return null;
		const v = this.cache.get(key);
		return this._purge(key, v);
	}
	
	set(key, obj, timeout=0)
	{
		if (!key || !obj) return;

		if (!ts.is(obj.size,ts.INT)) throw new TypeError('obj.size?');
		else if (obj.size < 0)  throw new Error('obj.size < 0 ?');

		const size = obj.size;
		if ((size < 0)||(size > this.max)) return ts.error(61,'size: ',size);

		this.purge();

		if ((this.ls + this.total + size) > this.max) 
			return this.err({size:this.total,log:this.ls,claim:size});
		
		this.total += obj.size;
		const out = timeout === 0 ? 0 : Date.now() + timeout;
		this.cache.set(key, {out: out, obj: obj});
		
		key = String(key);
		this.ls += key.length;
		this.log.push({key: key, time: Date.now()});
	}

	get size()
	{
		return this.cache.size;
	}

	clear()
	{
		this.total = 0;
		this.cache.clear();
		this.ls = 0;
		this.log.length = [];
	}

	delete(key)
	{
		const c = this.cache.get(key);
		if (c) this.total -= c.obj.size;
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

	static i(name='')
	{
		if (name === '') return $instances; 
		return $instances.get(name);
	}
	
}

module.exports = Wallet;
