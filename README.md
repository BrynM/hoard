# Hoard v0.0.3

Hoard is a simple memory based cache meant to be unsed interally by JavaScript code.

## Features

* normal caching conventions such as get, set, del, expire
* timed garbage collection of stale values
* multiple discreet cache stores
* handy alias for getting a specific cache store to act upon
* functionality to act upon all stores at once
* per store data is transformed modularly so one can add compression if they wish
* 6.56 kb minified (6715 bytes)
* 11.69 kb lightly minified (11961 bytes)
* 13.47 kb unminified (13790 bytes)

# Hoard Cache Stores

Hoard keeps the cached data in objects called a stores - properly, `HoardStore` objects.
Each store is a discreet cache space with its own keys, values, garbage collection, etc..

Hoard itself consists of two parts.
The first is the `ü()` function, which is used to interact with individual stores.
The second is the `hoard` object used for controlling stores individually or wholesale.

# Stores and the `ü()` Function

The `ü()` function is a handy way to retrieve a store to interact with.
It is an alias to `hoard.store()`, so anything you can do with `ü()` can be done with `hoard.store()` (documented later).

Like `hoard.store()`, `ü()` takes two arguments: `ü(name, options)`.

When called with empty or non-string arguments, `ü()` will return the "main", default `HoardStore` object.
The default store is created using the default options (more on how to change those is toward the end of this document).

Stores can be created by passing a string name and optional arguments.

    // get the default store's name
    var mainName = ü().get_name(); // "main"
    
    // create a store named "foo" and get its name
    var fooName = ü("foo").get_name(); // "foo"

    // create a store named "bar" and set a 60 second default key life, then get its name
    var barName = ü("bar", {lifeDefault: 60}).get_name(); // "bar"

## `HoardStore` Members

|Member|Returns|Use|
|-----:|:-----:|:-----|
|`HoardStore.clear()`|`undefined`|Clear a store of all kept values. **Use with caution.**|
|`HoardStore.del(key)`|`Boolean`|Delete a value by key name.|
|`HoardStore.expire(key, life)`|`Number`|Set a new life for a given key. The key will expire `life` seconds from being called.|
|`HoardStore.expire_at(key, epoch)`|`int epoch`|Set the time when a specific key expires. The time is expected to be an epoch (seconds), so if you are using the value from a `Date` object divide by 1000 (e.g. `var expy = new Date().valueOf() / 1000;`).|
|`HoardStore.garbage()`|`Boolean`|Trigger garbage collection on the store if not already running. Garbage collection is normally run on a timeout basis, so the need for this to be used should be rare. Will return `false` if already running|
|`HoardStore.get(key)`|`mixed`|Get the value of a given stored key. If missing, `undefined` will be returned.|
|`HoardStore.get_hoard_id()`|`String`|Internal ID of the hoard store.|
|`HoardStore.get_name()`|`String`|Get the name of the store. This is the same as used with `ü()`. The store names "main" is created automatically.|
|`HoardStore.get_store_id()`|`Number`|Index of the store. This is the order it was created in.|
|`HoardStore.hoard`|-|The initial value of the hoard store name. This should not be trusted and `HoardStore.get_name()` should be used instead. It's merely for console/visual ease.|
|`HoardStore.hoardId`|-|Internal ID of the hoard store. This should not be trusted and `HoardStore.get_hoard_id()` should be used instead. It's merely for console/visual ease.|
|`HoardStore.keys()`|`Array`|Get an `Array` containing a list of keys currently set in the store.|
|`HoardStore.options()`|`Object`|Get the current options for the store.|
|`HoardStore.set(key, val, life)`|`mixed`|Set the value of a stored cache key with optional lifetime in seconds.|
|`HoardStore.set_option(opt, val)`|`mixed`|Set one of the options for the store. The options are described further below.|
|`HoardStore.storeId`|-|Initial index of the store. This should not be trusted and `HoardStore.get_store_id()` should be used instead. It's merely for console/visual ease.|
|`HoardStore.stringify()`|`String`|Return a JSON representation of all stored keys. Each key will include both value and expiration. **This may take a while for large stores.**|

## `HoardStore` Options

Options are per-store and are primarily set when the store is created. 

|Option|Type|Default|Use|
|-----:|:-----:|:-----:|:-----|
|`gcInterval`|`Number`|180|Integer time in seconds between garbage collection attempts.|
|`lifeDefault`|`Number`|300|Default integer life in seconds for cached items within the store.|
|`lifeMax`|`Number`|63072000|Integer maximum life in seconds. The default is 2 years. I haven't really tested a lot of long-term attempts at storage with Hoard, but I wanted to put a configurable upper limit somewhere.|
|`prefix`|`String`|""|If this is a non-empty string, it will be prefixed to all key names in the store. It does not need to be added when calling `HoardStore.get()` or `HoardStore.set()`, but needs to be accounted for with methods that retrieve key names such as `HoardStore.keys()`.|
|`storage`|`String`|"json"|**Read only.** The name of the storage transform used. This option needs to be set at store creation. More information about storage transforms can be found further in this document.|

## Why "ü"?

So why a diacritic letter u? Why the umlaut?
It makes for nice shorthand and isn't much used in English, my native language.
The cool dollar sign was already taken, so I went for a symbol that was easy to remember in any OS.
On OSX, it's pressing [OPTION]+[U], then pressing [U].
On Windows, it's typing [0]-[2]-[5]-[2] on the number pad while holding [ALT].
On *nix, it's typing [U]-[F]-[C] while holding [CTRL]+[SHIFT].

If you don't like it, there's functionality to assign it to anything you [wish](http://i.imgur.com/GVUAHnZ.gifv).

# The `hoard` Object

The `hoard` object is the way to control cache stores.
As you may have assumed, functions with the suffix "_all" affect all stores.
Those that do will return an object containing `store-name:result` key value pairs.

|Function|Returns|Use|
|-----:|:-----:|:-----|
|*`hoard.add_transform(name, encFunc, decFunc)`*|`Array`|Add a storage transform `name` with given encoding and decoding functions. This is used to add compression libraries or other modular functionality.|
|*`hoard.clear_all()`*|`Object`|Clear all stores of all kept values. **Use with extreme caution.**|
|*`hoard.del_all(key)`*|`Object`|Delete a key from all stores.|
|*`hoard.expire_all(key, life)`*|`Object`|Set a new life for given key in all stores.|
|*`hoard.expire_all_at(key, epoch)`*|`Object`|Set the expiration time of a given key in all stores. The time is expected to be an epoch (seconds), so if you are using the value from a `Date` object divide by 1000 (e.g. `var expy = new Date().valueOf() / 1000;`).|
|*`hoard.get_all(key)`*|`Object`|Get a key for all stores.|
|*`hoard.get_transforms()`*|`Array`|Returns a list of available storage transforms.|
|*`hoard.keys_all()`*|`Object`|Get the list of keys from all stores.|
|*`hoard.kill(name)`*|`Number`|Deletes a given store by name. Note that the main store cannot be deleted. **Use with extreme caution.**|
|*`hoard.kill_all()`*|`Object`|Deletes all stores but the main store. **Use with extreme caution.**|
|*`hoard.set_all(key, val, life)`*|`Object`|Set a key to a given value and optional life in all stores.|
|*`hoard.store(name, options)`*|`HoardStore`|Retrieve a store. If name is ommitted, "main" is assumed. The store "main" is created automatically.|

# Storage Transforms

## "json"

By default, Hoard stores each value as a JSON string.
JSON is the most efficient storage mechanism because it's very fast in most modern JS environments.

## lz-string Support


## "plain" (and why you probably shouldn't use it)

## Adding your own Storage Transforms

https://github.com/dankogai/js-base64

    function hoard_base64_encode (inp) {
        return Base64.encode(JSON.stringify(inp));
    }

    function hoard_base64_decode (inp) {
        return JSON.parse(Base64.decode(inp));
    }

    hoard.add_transform('base64', hoard_base64_encode, hoard_base64_decode);
    // returns something like ['base64', 'json', 'plain']

# Customizing the names of `hoard`, `ü()` and other fun...

The names of both the `hoard` object and the `ü()` function can be customized along with a couple of other items.
To customize them, set any of the variables below before loading the Hoard JavaScript source.

The customization functionality is used on the development testing page to load multiple copies of Hoard at once.
Should you open a console on that page you may notice that `hoardDist`, `üDist()`, `hoardMin`, and `üMin()` may exist along side `hoard` and `ü()`.

|Variable|Type|Default|Use|
|-----:|:-----:|:-----:|:-----|
|`HOARD_CHAR`|`String`|`"ü"`|Set the character(s) used for the `ü()` function. For example setting `HOARD_CHAR` to "P" would instead bind the `ü()` function to `P()`.|
|`HOARD_MAIN_OPTS`|`Object`|`Object`|If this object exists, it will be used for the default `HoardStore` options.|
|`HOARD_NAME`|`String`|`"hoard"`|Set the name of the `hoard` object. For example, setting `HOARD_NAME` to "penelope" would instead bind the `hoard` object to `penelope` and thus `hoard.store()` would be `penelope.store()`.|
|`HOARD_PARENT`|`Object`|`Object`|Sepcify a different global object for both `hoard` and the `ü()` function to be members of. In a browser, this is normally `window` and in node.js it it usually `module.exports`.|


# Limitations

I prefer to think of these as constraints, but many could argue they are limitations.
Each of these so far has been a design decision.

* **Hoard can only store values acceptable to `JSON.stringify()`.** If anyone has an object-safe alternative that will still allow for compression, I'd love to see a POC.
* **Hoard does not and won't have a networking layer.** It's meant to me an in-application cache, not a service. If you'd like a service, there are much faster and more robust ones such as Memcache or Redis. You're better off with one of those instead.
* **Hoard is not made to be asynchronous.** Being that it deals with memory, Hoard was written with direct operations in mind. Adding layers of callbacks may make it seem faster, but having direct results is more important ATM. If you beg to differ, I'd love to see POC code.

