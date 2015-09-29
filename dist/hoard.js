/*!
* Hoard
* hoard.js v0.0.3
* A simple, expiring memory cache implementation for JavaScript
* © 2015 Bryn Mosher (https://github.com/BrynM) GPL-3.0
* Build: BrynM on myakka 0.0.3-1443509587 0.0.3-docs 4464724 2015-09-29T06:53:07.777Z
*/
(function() {
    var hoardName = typeof HOARD_NAME === 'string' && HOARD_NAME.length > 0 ? HOARD_NAME : 'hoard';
    var hoardChar = typeof HOARD_CHAR === 'string' && HOARD_CHAR.length > 0 ? HOARD_CHAR : 'ü';
    var hoardParent = typeof HOARD_PARENT === 'object' ? HOARD_PARENT : undefined;
    var hoardMainOpts = typeof HOARD_MAIN_OPTS === 'object' ? HOARD_MAIN_OPTS : undefined;
    var hoardCore = {};
    var hdDefOpts = {};
    var hdIsNode = false;
    var hdMainStore;
    var hdUserStores = [];
    var hdUserStoreNames = {};
    var hdIdBase = new Date().valueOf() / 1e3 * Math.random() * 100 * Math.random();
    var a = {};
    function HoardStore(hoardName, a) {
        var hdsCacheTimes = {};
        var hdsCacheVals = {};
        var hdsGcRunning = false;
        var hdsGcSched;
        var hdsHoardId;
        var hdsHoardName;
        var b = undefined;
        var hdsOpts = merge_opts(a);
        var hdsSelf = this;
        var hdsStoreId;
        var hdsStoreIdx;
        var d = c(hdsOpts.storage);
        var e = [ 'storage' ];
        function hds_event(a, b) {
            var c = {
                cancelable: true,
                currentTarget: this,
                target: this
            };
            return event_fire(a, b, c);
        }
        function hds_expy(a) {
            return parseInt(stamp() + a, 10);
        }
        function hds_sched_garbage() {
            if (hdsGcSched) {
                return;
            }
            hdsGcSched = setTimeout(function() {
                hdsSelf.garbage();
                hdsGcSched = null;
                hds_sched_garbage();
            }, hdsOpts.gcInterval * 1e3);
        }
        function hds_to_key(a) {
            return is_str(a) || is_num(a) ? hdsOpts.prefix + '' + a : false;
        }
        this.clear = function hds_clear() {
            hdsCacheVals = {};
            hdsCacheTimes = {};
        };
        this.del = function hds_del(a) {
            var c = hds_to_key(a);
            if (f(hdsCacheVals[c])) {
                hdsCacheVals[c] = b;
            }
            if (f(hdsCacheTimes[c])) {
                hdsCacheTimes[c] = b;
            }
            return !f(hdsCacheTimes[c]);
        };
        this.expire = function hds_expire(a, b) {
            var c = is_num(b) ? parseInt(b, 10) : null;
            var d = hds_to_key(a);
            if (!d) {
                return;
            }
            if (c === null || c < 1) {
                return this.del(a);
            }
            if (typeof hdsCacheTimes[d] !== 'undefined') {
                hdsCacheTimes[d] = hds_expy(c);
                return hdsCacheTimes[d];
            }
        };
        this.expire_at = function hds_expire_at(a, b) {
            var c = is_num(b) ? parseInt(b, 10) : null;
            var d = hds_to_key(a);
            var e = stamp();
            if (!d) {
                return;
            }
            if (c === null || c <= e) {
                return this.del(a);
            }
            if (typeof hdsCacheTimes[d] !== 'undefined') {
                hdsCacheTimes[d] = c;
                return hdsCacheTimes[d];
            }
        };
        this.garbage = function hds_garbage() {
            var a = stamp;
            var b;
            if (hdsGcRunning) {
                return false;
            }
            hdsGcRunning = true;
            hds_event('hoardGcBegin', this);
            for (b in hdsCacheTimes) {
                if (hdsCacheTimes[b] < stamp) {
                    this.del(b);
                }
            }
            hdsGcRunning = false;
            hds_event('hoardGcEnd', this);
            return true;
        };
        this.get = function hds_get(a) {
            var c = hds_to_key(a);
            if (!c) {
                return;
            }
            if (f(hdsCacheVals[c])) {
                if (!f(hdsCacheTimes[c])) {
                    hdsCacheVals[c] = b;
                    return;
                }
                if (stamp() >= hdsCacheTimes[c]) {
                    this.del(a);
                    return;
                }
                return d.dec(hdsCacheVals[c]);
            }
        };
        this.keys = function hds_keys() {
            var a;
            var b = [];
            for (a in hdsCacheVals) {
                if (hdsCacheVals.hasOwnProperty(a)) {
                    if (typeof hdsCacheVals[a] !== 'undefined') {
                        b.push('' + a);
                    }
                }
            }
            return b;
        };
        this.get_name = function hds_hoard_name() {
            return '' + hdsHoardName;
        };
        this.get_store_id = function hds_store_id() {
            return parseInt(hdsStoreId, 10);
        };
        this.options = function hds_options() {
            var a;
            var b = {};
            for (a in hdsOpts) {
                if (hdsOpts.hasOwnProperty(a)) {
                    switch (typeof hdsOpts[a]) {
                      case 'object':
                        if (hdsOpts[a] === null) {
                            b[a] = null;
                        }
                        break;

                      case 'number':
                      case 'string':
                        b[a] = '' + hdsOpts[a];
                        break;
                    }
                }
            }
            return b;
        };
        this.set_option = function hds_set_option(a, b) {
            if (!is_str(a) || !hdsOpts.hasOwnProperty(a)) {
                return;
            }
            if (e.indexOf(a) > -1) {
                throw 'Cannot set read-only option "' + a + '"!!!';
            }
            if (is_obj(hdDefOpts[a]) && is_func(hdDefOpts[a].check)) {
                hdsOpts[a] = hdDefOpts[a].check(b, hdsOpts[iter].val);
                return this.options()[a];
            }
        };
        this.set = function hds_set(a, b, c) {
            var e = is_num(c) ? parseInt(c, 10) : hdsOpts.lifeDefault;
            var f = hds_to_key(a);
            if (!f) {
                return;
            }
            if (typeof b === 'undefined') {
                this.del(a);
            }
            if (e > hdsOpts.lifeMax) {
                e = hdsOpts.lifeMax;
            }
            hdsCacheVals[f] = d.enc(b);
            hdsCacheTimes[f] = hds_expy(e);
            return this.get(a);
        };
        this.get_hoard_id = function hds_hoard_id() {
            return '' + hdsHoardId;
        };
        this.stringify = function hds_stringify(a, b) {
            var c = {};
            var d;
            for (d in hdsCacheVals) {
                if (f(hdsCacheVals[d]) && f(hdsCacheTimes[d])) {
                    c[d] = [ JSON.parse(hdsCacheVals[d]), '' + hdsCacheTimes[d] ];
                }
            }
            return JSON.stringify(c, a, b);
        };
        hdsStoreIdx = hdUserStores.push(this) - 1;
        hdsHoardName = is_str(hoardName) ? '' + hoardName : '';
        hdsStoreId = parseInt(hdsStoreIdx, 10);
        hdsHoardId = hdIdBase + '_' + hdsStoreIdx;
        this.hoard = '' + hdsHoardName;
        this.storeId = parseInt(hdsStoreId, 10);
        this.hoardId = '' + hdsHoardId;
        hdUserStoreNames[hdsHoardName] = hdsStoreIdx;
        hds_sched_garbage();
    }
    HoardStore.prototype.toString = function() {
        return '[Object HoardStore]';
    };
    HoardStore.prototype.valueOf = function() {
        return this.stringify();
    };
    HoardStore.prototype.keys = function() {
        return this.keys();
    };
    function call_store(a, b) {
        var c = hoardCore.store(a);
        var d = Array.prototype.slice.call(arguments).slice(2);
        if (c && is_func(c[b])) {
            return c[b].apply(c, d);
        }
    }
    function call_store_all(a) {
        var b;
        var c = {};
        var d;
        for (b in hdUserStoreNames) {
            d = Array.prototype.slice.call(arguments);
            d.shift();
            d.unshift(a);
            d.unshift(b);
            c[b] = call_store.apply(call_store, d);
        }
        return c;
    }
    function b(a) {
        if (is_obj(a)) {
            return Object.keys(a).length;
        }
        return 0;
    }
    function merge_opts(a) {
        var b;
        var c = {};
        for (b in hdDefOpts) {
            if (hdDefOpts.hasOwnProperty(b) && is_obj(hdDefOpts[b]) && is_func(hdDefOpts[b].check)) {
                c[b] = hdDefOpts[b].check(hdDefOpts[b].val);
            }
        }
        if (is_obj(a)) {
            for (b in c) {
                if (hdDefOpts.hasOwnProperty(b)) {
                    c[b] = hdDefOpts[b].check(a[b], hdDefOpts[b].val);
                }
            }
        }
        return c;
    }
    function event_bind(a, b) {
        return document.addEventListener(a, b);
    }
    function event_fire(a, b, c) {
        var d = new Event(a, c);
        d.hoardData = b;
        return document.dispatchEvent(d, b);
    }
    function c(b) {
        if (is_str(b) && b in a) {
            return a[b];
        }
    }
    function d() {
        var b = [];
        var c;
        for (c in a) {
            if (is_str(c) && is_func(a[c].dec) && is_func(a[c].enc)) {
                b.push('' + c);
            }
        }
        b.sort();
        return b;
    }
    function handle_gc_event(a) {}
    function hoard_bind(a, b) {
        if (hoardParent) {
            hoardParent[a] = b;
            return hoardParent[a];
        }
        if (hdIsNode) {
            module.exports[a] = b;
            return module.exports[a];
        }
        if (is_obj(window)) {
            window[a] = b;
            return window[a];
        }
    }
    function is_bool(a) {
        return typeof a === 'boolean';
    }
    function e(a, b) {
        return Object.prototype.toString.call(a) === '[object Array]' && (is_num(b) ? a.length >= b : true);
    }
    function is_func(a) {
        return typeof a === 'function';
    }
    function f(a) {
        return typeof a !== 'undefined' && a !== null;
    }
    function is_num(a, b) {
        b = typeof b === 'undefined' ? true : false;
        return typeof a === 'number' && !isNaN(a) && (!b || a > 0);
    }
    function is_obj(a) {
        return typeof a === 'object' && a !== null;
    }
    function is_str(a, b) {
        b = typeof b === 'undefined' ? true : false;
        return typeof a === 'string' && (!b || a.length > 0);
    }
    function stamp() {
        return parseInt(new Date().valueOf() / 1e3, 10);
    }
    hoardCore.add_transform = function b(c, d, e) {
        if (is_str(c) && is_func(d) && is_func(e)) {
            a[c] = {
                dec: e,
                enc: d
            };
            return hoardCore.get_transforms();
        }
    };
    hoardCore.all_clear = function hoard_all_clear() {
        return call_store_all('clear');
    };
    hoardCore.all_del = function hoard_all_del(a) {
        return call_store_all('del', a);
    };
    hoardCore.all_expire = function hoard_all_expire(a, b) {
        return call_store_all('expire', a, b);
    };
    hoardCore.all_expire_at = function hoard_all_expire_at(a, b) {
        return call_store_all('expire_at', a, b);
    };
    hoardCore.all_get = function hoard_all_get(a) {
        return call_store_all('get', a);
    };
    hoardCore.all_keys = function hoard_all_keys() {
        return call_store_all('keys');
    };
    hoardCore.all_set = function hoard_all_set(a, b, c) {
        return call_store_all('set', a, b, c);
    };
    hoardCore.get_transforms = function a() {
        return d();
    };
    hoardCore.store = function hoard_store(a, b) {
        if (!is_str(a)) {
            return hdMainStore;
        }
        if (a in hdUserStoreNames && is_obj(hdUserStores[hdUserStoreNames[a]])) {
            return hdUserStores[hdUserStoreNames[a]];
        }
        return new HoardStore(a, b);
    };
    a.json = {
        dec: function(a) {
            return JSON.parse(a);
        },
        enc: function(a) {
            return JSON.stringify(a);
        }
    };
    a.plain = {
        dec: function(a) {
            return a;
        },
        enc: function(a) {
            return a;
        }
    };
    hdDefOpts.prefix = {
        val: '',
        check: function(a, b) {
            return is_str(a) ? '' + a : is_str(b) ? b : '';
        }
    };
    hdDefOpts.lifeMax = {
        val: 31536e3 * 2,
        check: function(a, b) {
            return is_num(a) ? parseInt(a, 10) : is_num(b) ? b : 0;
        }
    };
    hdDefOpts.lifeDefault = {
        val: 300,
        check: function(a, b) {
            return is_num(a) ? parseInt(a, 10) : is_num(b) ? b : 0;
        }
    };
    hdDefOpts.gcInterval = {
        val: 180,
        check: function(a, b) {
            return is_num(a, true) ? parseInt(a, 10) : is_num(b) ? b : 0;
        }
    };
    hdDefOpts.storage = {
        val: 'json',
        check: function(b, c) {
            var d = ('' + b).trim();
            var e = is_str(c) ? ('' + c).trim() : 'json';
            if (d in a) {
                return d;
            }
            if (e in a) {
                return e;
            }
            throw 'Storage format "' + b + '" does not exist!!!';
        }
    };
    try {
        hdIsNode = this.obj(process) && this.str(process.version) && this.obj(exports);
        hdIsNode = hdIsNode ? process.version : false;
    } catch (a) {
        hdIsNode = false;
    }
    if (typeof LZString !== 'undefined' && is_obj(LZString) && is_func(LZString.compress) && is_func(LZString.decompress)) {
        hoardCore.add_transform('lzw', function a(b) {
            return LZString.compress(JSON.stringify(b));
        }, function a(b) {
            return JSON.parse(LZString.decompress(b));
        });
    }
    hdMainStore = new HoardStore('main', hoardMainOpts);
    hoard_bind(hoardName, hoardCore);
    hoard_bind(hoardChar, hoardCore.store);
})();