/*!
* hoard.js
*
* hoard 0.0.1
*
* A simple, expiring memory cache implementation for JavaScript
*
* Copyright 2015 Bryn Mosher (https://github.com/BrynM)
* License: GPLv3
*
* Build:
*   Bryn Mosher on myakka
*   https://github.com/BrynM/hoard.git
*   0.0.1-1442807934
*   master e6d0d4b7992692217703a756e336f9f5608aa891
*   Mon, 21 Sep 2015 03:58:54 GMT
*   Sun Sep 20 2015 20:58:54 GMT-0700 (Pacific Daylight Time)
*/
(function() {
    var a = typeof HOARD_NAME === 'string' && HOARD_NAME.length > 0 ? HOARD_NAME : 'hoard';
    var b = typeof HOARD_CHAR === 'string' && HOARD_CHAR.length > 0 ? HOARD_CHAR : 'ü';
    var c = typeof HOARD_PARENT === 'object' ? HOARD_PARENT : undefined;
    var d = typeof HOARD_MAIN_OPTS === 'object' ? HOARD_MAIN_OPTS : undefined;
    var e = {};
    var f = {};
    var g = false;
    var h;
    var i = [];
    var j = {};
    var k = new Date().valueOf() / 1e3 * Math.random() * 100 * Math.random();
    function HoardStore(a, b) {
        var c = {};
        var d = {};
        var e = false;
        var g;
        var h = n(b);
        var l = this;
        var m;
        function o(a, b) {
            var c = {
                cancelable: true,
                currentTarget: this,
                target: this
            };
            return p(a, b, c);
        }
        function q(a) {
            return parseInt(x() + a, 10);
        }
        function r() {
            if (g) {
                return;
            }
            g = setTimeout(function() {
                l.garbage();
                g = null;
                r();
            }, h.gcInterval * 1e3);
        }
        function s(a) {
            return w(a) || u(a) ? h.prefix + '' + a : false;
        }
        this.del = function hds_del(a) {
            var b = s(a);
            var e;
            if (typeof c[b] !== 'undefined') {
                c[b] = e;
                d[b] = e;
            }
            return typeof d[b] === 'undefined';
        };
        this.life = function y(a, b) {};
        this.garbage = function hds_garbage() {
            var a = x;
            var b;
            if (e) {
                return;
            }
            e = true;
            o('hoardGcBegin', this);
            for (b in d) {
                if (d[b] < x) {
                    this.del(b);
                }
            }
            e = false;
            o('hoardGcEnd', this);
        };
        this.get = function hds_get(a) {
            var b = s(a);
            if (!b) {
                return;
            }
            if (typeof c[b] !== 'undefined') {
                if (x() >= d[b]) {
                    this.del(a);
                    return;
                }
                if (h.useJSON) {
                    return JSON.parse(c[b]);
                }
                return c[b];
            }
        };
        this.keys = function hds_keys() {
            var a;
            var b = [];
            for (a in c) {
                if (c.hasOwnProperty(a)) {
                    if (typeof c[a] !== 'undefined') {
                        b.push('' + a);
                    }
                }
            }
            return b;
        };
        this.life = function hds_life(a, b) {
            var c = u(b) ? parseInt(b, 10) : null;
            var e = s(a);
            if (!e) {
                return;
            }
            if (c === null || c < 1) {
                return this.del(a);
            }
            if (typeof d[e] !== 'undefined') {
                d[e] = q(c);
                return d[e];
            }
        };
        this.options = function hds_options() {
            var a;
            var b = {};
            for (a in h) {
                if (h.hasOwnProperty(a)) {
                    switch (typeof h[a]) {
                      case 'object':
                        if (h[a] === null) {
                            b[a] = null;
                        }
                        break;

                      case 'number':
                      case 'string':
                        b[a] = '' + h[a];
                        break;
                    }
                }
            }
            return b;
        };
        this.set_option = function hds_set_option(a, b) {
            if (!w(a) || !h.hasOwnProperty(a) || is_empty(b)) {
                return;
            }
            if (v(f[a]) && t(f[a].check)) {
                h[a] = f[a].check(b, h[iter].val);
                return this.options()[a];
            }
        };
        this.set = function hds_set(a, b, e) {
            var f = u(e) ? parseInt(e, 10) : h.lifeDefault;
            var g = s(a);
            if (!g) {
                return;
            }
            if (typeof b === 'undefined') {
                this.del(a);
            }
            if (f > h.lifeMax) {
                f = h.lifeMax;
            }
            c[g] = h.useJSON ? JSON.stringify(b) : b;
            d[g] = q(f);
            return this.get(a);
        };
        this.stringify = function hds_stringify(a, b) {
            var e = {};
            var f;
            for (f in c) {
                if (f in d) {
                    e[f] = [ JSON.parse(c[f]), d[f] ];
                }
            }
            return JSON.stringify(e, a, b);
        };
        m = i.push(this) - 1;
        this.hoard = w(a) ? '' + a : '';
        this.storeId = parseInt(m, 10);
        this.hoardId = k + '_' + m;
        j[this.hoard] = m;
        r();
    }
    function l(a, b) {
        var c = e.store(a);
        var d = Array.prototype.slice.call(arguments).slice(2);
        if (c && t(c[b])) {
            return c[b].apply(c, d);
        }
    }
    function m(a) {
        var b;
        var c = {};
        var d;
        for (b in j) {
            d = Array.prototype.slice.call(arguments);
            d.shift();
            d.unshift(a);
            d.unshift(b);
            c[b] = l.apply(l, d);
        }
        return c;
    }
    function n(a) {
        var b;
        var c = {};
        for (b in f) {
            if (f.hasOwnProperty(b) && v(f[b]) && t(f[b].check)) {
                c[b] = f[b].check(f[b].val);
            }
        }
        if (v(a)) {
            for (b in c) {
                if (f.hasOwnProperty(b)) {
                    c[b] = f[b].check(a[b], f[b].val);
                }
            }
        }
        return c;
    }
    function o(a, b) {
        return document.addEventListener(a, b);
    }
    function p(a, b, c) {
        var d = new Event(a, c);
        d.hoardData = b;
        return document.dispatchEvent(d, b);
    }
    function q(a) {}
    function r(a, b) {
        if (c) {
            c[a] = b;
            return c[a];
        }
        if (g) {
            module.exports[a] = b;
            return module.exports[a];
        }
        if (v(window)) {
            window[a] = b;
            return window[a];
        }
    }
    function s(a) {
        return typeof a === 'boolean';
    }
    function t(a) {
        return typeof a === 'function';
    }
    function u(a, b) {
        b = typeof b === 'undefined' ? true : false;
        return typeof a === 'number' && !isNaN(a) && (!b || a > 0);
    }
    function v(a) {
        return typeof a === 'object' && a !== null;
    }
    function w(a, b) {
        b = typeof b === 'undefined' ? true : false;
        return typeof a === 'string' && (!b || a.length > 0);
    }
    function x() {
        return parseInt(new Date().valueOf() / 1e3, 10);
    }
    e.all_del = function hoard_all_del(a) {
        return m('del', a);
    };
    e.all_get = function hoard_all_get(a) {
        return m('get', a);
    };
    e.all_keys = function hoard_all_keys() {
        return m('keys');
    };
    e.all_life = function hoard_all_life(a, b) {
        return m('life', a, b);
    };
    e.all_set = function hoard_all_set(a, b, c) {
        return m('set', a, b, c);
    };
    e.store = function hoard_store(a, b) {
        if (!w(a)) {
            return h;
        }
        if (a in j && v(i[j[a]])) {
            return i[j[a]];
        }
        return new HoardStore(a, b);
    };
    f.prefix = {
        val: '',
        check: function(a, b) {
            return w(a) ? '' + a : w(b) ? b : '';
        }
    };
    f.lifeMax = {
        val: 31536e3,
        check: function(a, b) {
            return u(a) ? parseInt(a, 10) : u(b) ? b : 0;
        }
    };
    f.lifeDefault = {
        val: 300,
        check: function(a, b) {
            return u(a) ? parseInt(a, 10) : u(b) ? b : 0;
        }
    };
    f.gcInterval = {
        val: 30,
        check: function(a, b) {
            return u(a, true) ? parseInt(a, 10) : u(b) ? b : 0;
        }
    };
    f.useJSON = {
        val: true,
        check: function(a, b) {
            return a ? true : s(b) ? b : true;
        }
    };
    try {
        g = this.obj(process) && this.str(process.version) && this.obj(exports);
        g = g ? process.version : false;
    } catch (y) {
        g = false;
    }
    h = new HoardStore('main', d);
    r(a, e);
    r(b, e.store);
})();