# Hoard v0.0.3

Hoard is a simple memory based cache meant to be unsed interally by JavaScript code.

## Features

* normal caching conventions such as get, set, del, expire
* timed garbage collection of stale values
* multiple discreet cache stores
* handy alias for getting a specific cache store to act upon
* functionality to act upon all stores at once
* per store data can be javascript objects (referenced), JSON envoded, or LZW compressed JSON
* 6.56 kb minified (6715 bytes)
* 15.05 kb unminified (15411 bytes)

# Hoard Cache Stores

Hoard keeps the cached data in an object called a store - properly, a `HoardStore` object.
Each store is a discreet cache space with its own keys, values, garbage collection, etc..

Hoard itself consists of two parts.
The first is the `ü()` function, which is used to interact with individual stores.
The second is the `hoard` object used for controlling stores individually or wholesale.

# Stores and the `ü(name, options)` Function

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
|`HoardStore.stringify()`|`String`|Return a JSON representation of all stored keys. **This may take a while for large stores.**|

## `HoardStore` Options

|Option|Use|
|-----:|:-----|
|`gcInterval`| |
|`lifeDefault`| |
|`lifeMax`| |
|`prefix`| |
|`storage`| |

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

Normally, Hoard stores each value as a JSON string.

# Customizing the names of `hoard`, `ü()` and other fun...

The names of both the `hoard` object and the `ü()` function, along with a couple of other options, can be customized before loading the Hoard JavaScript source.

|Variable|Use|
|-----:|:-----|
|`HOARD_CHAR`| |
|`HOARD_MAIN_OPTS`| |
|`HOARD_NAME`| |
|`HOARD_PARENT`| |


# Limitations

I prefer to think of these as constraints, but many could argue they are limitations.
Each of these so far has been a design decision.

* **Hoard can only store values acceptable to `JSON.stringify()`.** If anyone has an object-safe alternative that will still allow for compression, I'd love to see a POC.
* **Hoard does not and won't have a networking layer.** It's meant to me an in-application cache, not a service. If you'd like a service, there are much faster and more robust ones such as Memcache or Redis. You're better off with one of those instead.
* **Hoard is not made to be asynchronous.** Being that it deals with memory, Hoard was written with direct operations in mind. Adding layers of callbacks may make it seem faster, but having direct results is more important ATM. If you beg to differ, I'd love to see POC code.

