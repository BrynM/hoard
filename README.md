# Hoard v0.0.1

Hoard is a simple memory based cache meant to be unsed interally by JavaScript code.

## Features

* normal caching conventions such as get, set, del, expire
* timed garbage collection of stale values
* multiple discreet cache stores
* handy alias for getting a specific cache store to act upon
* functionality to act upon all stores at once
* 5.01kb minified (5125 bytes)
* 11.59kb unminified (11863 bytes)

# Hoard Cache Stores

Hoard keeps the cached data in an object called a store (properly, a `HoardStore` object).

## Store Members

|Member|Use|
|-----:|:-----|
|*`HoardStore.clear()`*|Clear a store of all kept values. Use with caution.|
|*`HoardStore.del(key)`*|Delete a value by key name.|
|*`HoardStore.expire_at(key, epoch)`*|Set the time when a specific key expires. The time is expected to be an epoch (seconds), so if you are using the value from a `Date` object, divide by 1000 (e.g. `var expy = new Date().valueOf() / 1000;`).|
|*`HoardStore.garbage()`*|Trigger garbage collection on the store if not already running. Garbage collection is normally run on a timeout basis, so the need for this to be used should be rare.|
|*`HoardStore.get(key)`*| |
|*`HoardStore.get_hoard_id()`*|Internal ID of the hoard store.|
|*`HoardStore.get_name()`*|Get the name of the store. This is the same as used with `ü()`. The store names "main" is created automatically.|
|*`HoardStore.get_store_id()`*|Index of the store. This is the order it was created in.|
|*`HoardStore.hoard`*|The initial value of the hoard store name. This should not be trusted and `HoardStore.get_name()` should be used instead. It's merely for console/visual ease.|
|*`HoardStore.hoardId`*|Internal ID of the hoard store. This should not be trusted and `HoardStore.get_hoard_id()` should be used instead. It's merely for console/visual ease.|
|*`HoardStore.keys()`*| |
|*`HoardStore.expire(key, life)`*| |
|*`HoardStore.options()`*| |
|*`HoardStore.set_option(opt, val)`*| |
|*`HoardStore.set(key, val, life)`*| |
|*`HoardStore.storeId`*|Initial index of the store. This should not be trusted and `HoardStore.get_store_id()` should be used instead. It's merely for console/visual ease.|
|*`HoardStore.stringify()`*| |

## The `ü()` Function

The `ü()` function is a handy way to retrieve a store.
It is an alias to `hoard.store()`.

# The `hoard` Object

The `hoard` object is the way to control cache stores.

|Function|Use|
|-----:|:-----|
|*`hoard.all_clear()`*|Clear all stores of all kept values. Use with extreme caution.|
|*`hoard.all_del(key)`*| |
|*`hoard.all_expire(key, life)`*| |
|*`hoard.all_expire_at(key, epoch)`*| |
|*`hoard.all_get(key)`*| |
|*`hoard.all_keys()`*| |
|*`hoard.all_set(key, val, life)`*| |
|*`hoard.store(name, options)`*|Retrieve a Horde cache store. If name is ommitted, "main" is assumed. The store "main" is created automatically.|

