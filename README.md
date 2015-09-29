# Hoard v0.0.1

Hoard is a simple memory based cache meant to be unsed interally by JavaScript code.

## Features

* normal caching conventions such as get, set, del, expire
* timed garbage collection of stale values
* multiple discreet cache stores
* handy alias for getting a specific cache store to act upon
* functionality to act upon all stores at once
* per store data can be javascript objects (referenced), JSON envoded, or LZW compressed JSON
* 6.25 kb minified (6392 bytes)
* 13.92 kb unminified (14245 bytes)

# Hoard Cache Stores

Hoard keeps the cached data in an object called a store - properly, a `HoardStore` object.


## The `ü(name, options)` Function

The `ü()` function is a handy way to retrieve a store to interact with.
It is an alias to `hoard.store()`, so anything you can do with `ü()` can be done with `hoard.store()` (documented later).

When called with empty or non-string arguments, `ü()` will return the "main", default `HoardStore` object.
Stores can be created by passing a string name and optional arguments.

    // get the default store's name
    var mainName = ü().get_name(); // "main"
    
    // create a store named "foo" and get its name
    var fooName = ü("foo").get_name(); // "foo"

    // create a store named "bar" and set a 60 second default key life, then get its name
    var fooName = ü("bar", {lifeDefault: 60}).get_name(); // "bar"

## Store Members

|Member|Returns|Use|
|-----:|:-----:|:-----|
|`HoardStore.clear()`|`undefined`|Clear a store of all kept values. **Use with caution.**|
|`HoardStore.del(key)`|`Boolean`|Delete a value by key name.|
|`HoardStore.expire(key, life)`|`Number`| |
|`HoardStore.expire_at(key, epoch)`|`int epoch`|Set the time when a specific key expires. The time is expected to be an epoch (seconds), so if you are using the value from a `Date` object, divide by 1000 (e.g. `var expy = new Date().valueOf() / 1000;`).|
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
|`HoardStore.stringify()`|`String`|Return a JSON representation of all stored keys. **This may take a while for large stores.**|

# The `hoard` Object

The `hoard` object is the way to control cache stores.

|Function|Returns|Use|
|-----:|:-----:|:-----|
|*`hoard.all_clear()`*|`Object`|Clear all stores of all kept values. **Use with extreme caution.**|
|*`hoard.all_del(key)`*|`Object`||
|*`hoard.all_expire(key, life)`*|`Object`| |
|*`hoard.all_expire_at(key, epoch)`*|`Object`| |
|*`hoard.all_get(key)`*|`Object`| |
|*`hoard.all_keys()`*|`Object`| |
|*`hoard.all_set(key, val, life)`*|`Object`| |
|*`hoard.store(name, options)`*|`HoardStore`|Retrieve a Horde cache store. If name is ommitted, "main" is assumed. The store "main" is created automatically.|

