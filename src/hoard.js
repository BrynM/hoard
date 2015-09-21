/*
* hoard.js
*
* A simple, expiring memory cache implementation for JavaScript
*
* Copyright 2015 Bryn Mosher (https://github.com/BrynM)
* License: GPLv3
*/
(function () {

	/* Vars *******************************/

	// what's the name of the object bound to the "global"
	var hoardName = typeof HOARD_NAME === 'string' && HOARD_NAME.length > 0 ? HOARD_NAME : 'hoard';
	// ue "eooh" "lure"
	// alt+0252
	var hoardChar = typeof HOARD_CHAR === 'string' && HOARD_CHAR.length > 0 ? HOARD_CHAR : 'ü';
	// are we specifying a global object?
	var hoardParent = typeof HOARD_PARENT === 'object' ? HOARD_PARENT : undefined;
	// are we specifying specific options for the main store?
	var hoardMainOpts = typeof HOARD_MAIN_OPTS === 'object' ? HOARD_MAIN_OPTS : undefined;

	var hoardCore = {};
	var hdDefOpts = {};
	var hdIsNode = false;
	var hdMainStore;
	var hdUserStores = [];
	var hdUserStoreNames = {};
	var hdIdBase = ((new Date().valueOf()/1000) * Math.random()) * 100 * Math.random();

	/* Objects ****************************/

	function HoardStore (hoardName, opts) {
		var hdsCacheVals = {};
		var hdsCacheTimes = {};
		var hdsGcRunning = false;
		var hdsGcSched;
		var hdsOpts = merge_opts(opts);
		var hdsSelf = this;
		var hdsStoreIdx;

		function hds_event (evName, data) {
			var evOpts = {
				cancelable: true,
				currentTarget: this,
				target: this,
			};

			return event_fire(evName, data, evOpts);
		}

		function hds_expy (life) {
			return parseInt(stamp() + life, 10);
		}

		function hds_sched_garbage () {
			if (hdsGcSched) {
				return;
			}

			hdsGcSched = setTimeout(function() {
				hdsSelf.garbage();
				hdsGcSched = null;

				hds_sched_garbage();
			}, hdsOpts.gcInterval * 1000);
		}

		function hds_to_key (key) {
			return is_str(key) || is_num(key) ? hdsOpts.prefix+''+key : false;
		}

		this.del = function hds_del (key) {
			var kKey = hds_to_key(key);
			var nil;

			if (typeof hdsCacheVals[kKey] !== 'undefined') {
				hdsCacheVals[kKey] = nil;
				hdsCacheTimes[kKey] = nil;
			}

			return typeof hdsCacheTimes[kKey] === 'undefined';
		};

		this.life = function hds_expire (key, seconds) {
		}

		this.garbage = function hds_garbage () {
			var now = stamp;
			var iter;

			if (hdsGcRunning) {
				return;
			}

			hdsGcRunning = true;
			hds_event('hoardGcBegin', this);

			for (iter in hdsCacheTimes) {
				if (hdsCacheTimes[iter] < stamp) {
					this.del(iter);
				}
			}

			hdsGcRunning = false;
			hds_event('hoardGcEnd', this);
		};

		this.get = function hds_get (key) {
			var kKey = hds_to_key(key);

			if (!kKey) {
				return;
			}

			if (typeof hdsCacheVals[kKey] !== 'undefined') {
				if (stamp() >= hdsCacheTimes[kKey]) {
					this.del(key);

					return;
				}

				if (hdsOpts.useJSON) {
					return JSON.parse(hdsCacheVals[kKey]);
				}

				return hdsCacheVals[kKey];
			}
		};

		this.keys = function hds_keys () {
			var iter;
			var ret = [];

			for (iter in hdsCacheVals) {
				if (hdsCacheVals.hasOwnProperty(iter)) {
					if (typeof hdsCacheVals[iter] !== 'undefined') {
						ret.push(''+iter);
					}
				}
			}

			return ret;
		};

		this.life = function hds_life (key, seconds) {
			var kLife = is_num(seconds) ? parseInt(seconds, 10) : null;
			var kKey = hds_to_key(key);

			if (!kKey) {
				return;
			}

			if (kLife ===  null || kLife < 1) {
				return this.del(key);
			}

			if (typeof hdsCacheTimes[kKey] !== 'undefined') {
				hdsCacheTimes[kKey] = hds_expy(kLife);

				return hdsCacheTimes[kKey];
			}
		};

		this.options = function hds_options () {
			var iter;
			var ret = {};

			for (iter in hdsOpts) {
				if (hdsOpts.hasOwnProperty(iter)) {
					switch (typeof hdsOpts[iter]) {
						case 'object':
							if (hdsOpts[iter] === null) {
								ret[iter] = null;
							}
							break;

						case 'number':
						case 'string':
							ret[iter] = ''+hdsOpts[iter];
							break;
					}
				}
			}

			return ret;
		};

		this.set_option = function hds_set_option (opt, val) {
			if (!is_str(opt) || !hdsOpts.hasOwnProperty(opt) || is_empty(val)) {
				return;
			}

			if (is_obj(hdDefOpts[opt]) && is_func(hdDefOpts[opt].check)) {
				hdsOpts[opt] = hdDefOpts[opt].check(val, hdsOpts[iter].val);

				return this.options()[opt];
			}
		};

		this.set = function hds_set (key, val, life) {
			var kLife = is_num(life) ? parseInt(life, 10) : hdsOpts.lifeDefault;
			var kKey = hds_to_key(key);

			if (!kKey) {
				return;
			}

			if (typeof val === 'undefined') {
				this.del(key);
			}

			if (kLife > hdsOpts.lifeMax) {
				kLife = hdsOpts.lifeMax;
			}

			hdsCacheVals[kKey] = hdsOpts.useJSON ? JSON.stringify(val) : val;
			hdsCacheTimes[kKey] = hds_expy(kLife);

			return this.get(key);
		};

		this.stringify = function hds_stringify (replacer, space) {
			var vals = {};
			var iter;

			for (iter in hdsCacheVals) {
				if (iter in hdsCacheTimes) {
					vals[iter] = [
						JSON.parse(hdsCacheVals[iter]),
						hdsCacheTimes[iter]
					];

				}
			}

			return JSON.stringify(vals, replacer, space);
		};

		hdsStoreIdx = hdUserStores.push(this) - 1;

		this.hoard = is_str(hoardName) ? ''+hoardName : '';
		this.storeId = parseInt(hdsStoreIdx, 10);
		this.hoardId = hdIdBase+'_'+hdsStoreIdx;

		hdUserStoreNames[this.hoard] = hdsStoreIdx;

		hds_sched_garbage();
	}

	/* Funcs ******************************/

	function call_store (sName, fName) {
		var st = hoardCore.store(sName);
		var args = Array.prototype.slice.call(arguments).slice(2);

		if (st && is_func(st[fName])) {
			return st[fName].apply(st, args);
		}
	}

	function call_store_all (fName) {
		var iter;
		var ret = {};
		var args;

		for (iter in hdUserStoreNames) {
			args = Array.prototype.slice.call(arguments);

			args.shift();
			args.unshift(fName);
			args.unshift(iter);

			ret[iter] = call_store.apply(call_store, args);
		}

		return ret;
	};

	function merge_opts (opts) {
		var iter;
		var ret = {};

		for (iter in hdDefOpts) {
			if (hdDefOpts.hasOwnProperty(iter) && is_obj(hdDefOpts[iter]) && is_func(hdDefOpts[iter].check)) {
				ret[iter] = hdDefOpts[iter].check(hdDefOpts[iter].val);
			}
		}

		if (is_obj(opts)) {
			for (iter in ret) {
				if (hdDefOpts.hasOwnProperty(iter)) {
					ret[iter] = hdDefOpts[iter].check(opts[iter], hdDefOpts[iter].val);
				}
			}
		}

		return ret;
	}

	function event_bind (evName, cB) {
		return document.addEventListener(evName, cB);
	}

	function event_fire (evName, data, opts) {
		var ev = new Event(evName, opts);

		ev.hoardData = data;

		return document.dispatchEvent(ev, data);
	}

	function handle_gc_event (ev) {
	}

	function hoard_bind(vName, thing) {
		if (hoardParent) {
			hoardParent[vName] = thing;

			return hoardParent[vName];
		}

		if (hdIsNode) {
			module.exports[vName] = thing;

			return module.exports[vName];
		}

		if (is_obj(window)) {
			window[vName] = thing;

			return window[vName];
		}
	}

	function is_bool (bool) {
		return (typeof bool === 'boolean');
	}

	function is_func (func) {
		return (typeof func === 'function');
	}

	function is_num (num, gtZero) {
		gtZero = typeof gtZero === 'undefined' ? true : false;

		return (typeof num === 'number' && !isNaN(num) && (!gtZero || num > 0));
	}

	function is_obj (obj) {
		return (typeof obj === 'object' && obj !== null);
	}

	function is_str (str, gtZero) {
		gtZero = typeof gtZero === 'undefined' ? true : false;

		return (typeof str === 'string' && (!gtZero || str.length > 0));
	}

	function stamp () {
		return parseInt(new Date().valueOf() / 1000, 10);
	}

	/* Public Util Funcs ******************/

	hoardCore.all_del = function hoard_all_del (key) {
		return call_store_all('del', key);
	};

	hoardCore.all_get = function hoard_all_get (key) {
		return call_store_all('get', key);
	};

	hoardCore.all_keys = function hoard_all_keys () {
		return call_store_all('keys');
	};

	hoardCore.all_life = function hoard_all_life (key, life) {
		return call_store_all('life', key, life);
	};

	hoardCore.all_set = function hoard_all_set (key, val, life) {
		return call_store_all('set', key, val, life);
	};

	hoardCore.store = function hoard_store (key, opts) {
		if (!is_str(key)) {
			return hdMainStore;
		}

		if (key in hdUserStoreNames && is_obj(hdUserStores[hdUserStoreNames[key]])) {
			return hdUserStores[hdUserStoreNames[key]];
		}

		return new HoardStore(key, opts);
	};

	/* Options ****************************/

	hdDefOpts.prefix = {
		val: '',
		check: function (v, d) {
			return is_str(v) ? ''+v : (is_str(d) ? d : '');
		},
	};

	hdDefOpts.lifeMax = {
		val: 31536000, // 1 year = 31536000 secs
		check: function (v, d) {
			return is_num(v) ? parseInt(v, 10) : (is_num(d) ? d : 0);
		},
	};

	hdDefOpts.lifeDefault = {
		val: 300, // sec
		check: function (v, d) {
			return is_num(v) ? parseInt(v, 10) : (is_num(d) ? d : 0);
		},
	};

	hdDefOpts.gcInterval = {
		val: 30, // sec
		check: function (v, d) {
			return is_num(v, true) ? parseInt(v, 10) : (is_num(d) ? d : 0);
		},
	};

	hdDefOpts.useJSON = {
		val: true,
		check: function (v, d) {
			return v ? true : ( is_bool(d) ? d : true);
		},
	};

	/* Run ********************************/

	try {
		hdIsNode = ( this.obj(process) && this.str(process.version) && this.obj(exports) );
		hdIsNode = hdIsNode ? process.version : false; // two lines for readibility - convert true to version string
	} catch (e) {
		hdIsNode = false;
	}

	hdMainStore = new HoardStore('main', hoardMainOpts);

	hoard_bind(hoardName, hoardCore);
	hoard_bind(hoardChar, hoardCore.store);
})();

