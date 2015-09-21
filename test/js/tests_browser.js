(function () {

	/***************************************
	* Hoard Broser Testing
	* https://qunitjs.com/
	***************************************/

	/* Vars *******************************/

	var $body = $('body');
	var $readme = $('#readme');
	var pass = 'pass';
	var nameGen = [0, 0, 0, 0];
	var nameKey = nameGen.length - 1;

	var pkg;

	/* Funcs ******************************/

	function err_pkg (xhr, status, err) {
		console.log('pkg err', arguments);
	}

	function err_readme (xhr, status, err) {
		console.log('readme err', arguments);
	}

	function init_tests(unit, data, status, xhr) {
		if (unit && unit.config && unit.config.started < 1) {
			return unit.start();
		}
	}

	function next_store_name() {
		var iter;
		var len = nameGen.length;
		var ret = '';
		var wrap = false;

		for (iter = 0; iter < len; iter++) {
			nameGen[iter] = parseInt(nameGen[iter], 10);

			if (nameGen[iter] > 90) {
				nameGen[iter] = 97;
			}

			if (nameGen[iter] < 65) {
				nameGen[iter] = 65;
			}

			if (nameGen[iter] > 122) {
				wrap = true;
			}

			ret += String.fromCharCode(nameGen[iter]);
		}

		if (nameKey < 0) {
			nameKey = nameGen.length - 1;
		}

		nameGen[nameKey]++;

		if (wrap) {
			nameKey--;
		}

		return ret;
	}

	function pop_ui () {
		$.ajax({
			url: '../../README.md',
			//async: true,
			dataType: 'text',
			headers: {
				Accept : "text/markdown; charset=UTF-8",
				"Content-Type": "text/markdown; charset=UTF-8"
			},
			error: err_readme,
			success: pop_readme
		});

		init_tests(QUnit);

		run_tests_hoard(QUnit, 'hoard', hoard)
		run_tests_hoard(QUnit, 'hoardDist', hoardDist)
		run_tests_hoard(QUnit, 'hoardMin', hoardMin)

		run_tests_ü(QUnit, 'ü', ü);
		run_tests_ü(QUnit, 'ü', ü, next_store_name());

		run_tests_ü(QUnit, 'üDist', üDist);
		run_tests_ü(QUnit, 'üDist', üDist, next_store_name());

		run_tests_ü(QUnit, 'üMin', üMin);
		run_tests_ü(QUnit, 'üMin', üMin, next_store_name());
	}

	function pop_readme (data, status, xhr) {
		$readme.html(markdown.toHTML(data));
	}

	function run_tests_hoard (unit, prefix, hoardThing) {
		var sName = next_store_name();

		unit.module('HOARD_NAME');

		unit.test(prefix+'.store()', function(assert) {
			assert.expect(8);

			assert.ok(
				hoardThing.store().constructor.name === 'HoardStore',
				prefix+'.store() is HoardStore'
			);
			assert.ok(
				hoardThing.store(sName).constructor.name === 'HoardStore',
				prefix+'.store("'+sName+'") is HoardStore'
			);

			assert.ok(
				typeof hoardThing.all_set('banner', 'hulk') === 'object',
				prefix+'.all_set("banner", "hulk")'
			);
			assert.ok(
				hoardThing.store().get('banner') === 'hulk',
				prefix+'.store().get("banner") === "hulk"'
			);
			assert.ok(
				hoardThing.store(sName).get('banner') === 'hulk',
				prefix+'.store("'+sName+'").get("banner") === "hulk"'
			);

			var getRes = hoardThing.all_get('banner');

			assert.ok(
				typeof getRes === 'object',
				prefix+'.all_get("banner") is Object'
			);
			assert.ok(
				getRes['main'] === 'hulk',
				prefix+'.all_get("banner")["main"] === "hulk"'
			);
			assert.ok(
				getRes[sName] === 'hulk',
				prefix+'.all_get("banner")["'+sName+'"] === "hulk"'
			);
		});
	}

	function run_tests_ü (unit, prefix, üThing, storeName) {
		var sName = typeof storeName === 'string' ? '"'+storeName+'"' : '';
		var expectedStoreName = typeof storeName === 'string' ? storeName : 'main';
		var expiredNot;
		var expired;
		var waitFor = 1;
		var newTime;

		unit.module('HOARD_CHAR');

		unit.test(prefix+'('+sName+')', function(assert) {
			assert.expect(11);

			assert.strictEqual(
				'HoardStore',
				üThing(storeName).constructor.name,
				prefix+'('+sName+') is HoardStore'
			);
			assert.strictEqual(
				expectedStoreName,
				üThing(storeName).hoard,
				prefix+'('+sName+').hoard === "'+expectedStoreName+'"'
			);
			assert.strictEqual(
				'bar',
				üThing(storeName).set('foo', 'bar'),
				prefix+'('+sName+').set("foo", "bar")'
			);
			assert.strictEqual(
				'bar',
				üThing(storeName).get('foo'),
				prefix+'('+sName+').get("foo")'
			);
			assert.notEqual(
				-1,
				üThing(storeName).keys().indexOf("foo"),
				prefix+'('+sName+').keys().indexOf("foo")'
			);
			assert.strictEqual(
				true,
				üThing(storeName).del('foo'),
				prefix+'('+sName+').del("foo")'
			);
			assert.strictEqual(
				'undefined',
				typeof üThing(storeName).get('foo'),
				'deleted '+prefix+'('+sName+').get("foo")'
			);

			expired = assert.async();
			newTime = parseInt((new Date().valueOf() / 1000) + waitFor, 10);

			assert.strictEqual(
				'bootsy',
				üThing(storeName).set('funk', 'bootsy', waitFor * 10),
				prefix+'('+sName+').set("funk", "bootsy", '+(waitFor * 10)+')'
			);
			assert.ok(
				üThing(storeName).life('funk', waitFor) >= newTime,
				prefix+'('+sName+').life("funk", '+waitFor+') >= '+newTime
			);
			assert.strictEqual(
				'bootsy',
				üThing(storeName).get('funk'),
				'not expired '+prefix+'('+sName+').get("funk")'
			);
			setTimeout(function() {
				assert.strictEqual(
					'undefined',
					typeof üThing(storeName).get('funk'),
					'expired '+prefix+'('+sName+').get("funk")'
				);
				expired();
			}, (waitFor * 1000) + 5 );
		});
	}

	function set_pkg(data, status, xhr) {
		pkg = _.extend({}, data);
		$body.trigger('hdPackage');
	}

	/* Run ********************************/

	$.ajax({
		url: '../../package.json',
		//async: true,
		dataType: 'json',
		error: err_pkg,
		success: set_pkg
	});

	$body.on('hdPackage', pop_ui);

	QUnit.config.autostart = false;

})();

//https://github.com/evilstreak/markdown-js/

//console.log('hoard', hoard);
//console.log('hdMainStore', hdMainStore);
//var opts = {prefix: 'main', lifeMax: 60 * 60 * 2};
//console.log('hoard.make_store("foo", '+JSON.stringify(opts)+')', hoard.make_store("foo", opts));
//console.log('hoard.set(\'foo\', \'bar\')', hoard.set('foo', 'bar'));
//console.log('hoard.get(\'foo\')', hoard.get('foo'));
