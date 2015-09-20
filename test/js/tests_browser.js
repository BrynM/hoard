(function () {

	/***************************************
	* Hoard Broser Testing
	* https://qunitjs.com/
	***************************************/

	/* Hoard Vars *************************/
	// changed later for testing dist versions

	var HOARD_NAME;
	var HOARD_CHAR;

	/* Vars *******************************/

	var $body = $('body');
	var $readme = $('#readme');
	var pass = 'pass';



	var pkg;

	/* Funcs ******************************/

	function err_pkg (xhr, status, err) {
		console.log('pkg err', arguments);
	}

	function err_readme (xhr, status, err) {
		console.log('readme err', arguments);
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

		init_tests();
		run_tests_page_ü();
	}

	function set_pkg(data, status, xhr) {
		pkg = _.extend({}, data);
		$body.trigger('hdPackage');
	}

	function init_tests(data, status, xhr) {
		if (QUnit.config.started < 1) {
			return QUnit.start();
		}
	}

	function pop_readme (data, status, xhr) {
		$readme.html(markdown.toHTML(data));
	}

	function run_tests_loaded_ü () {
	}

	function run_tests_page_ü () {

		QUnit.test('ü().constructor.name === "HoardStore"', function(assert) {
			assert.ok(ü().constructor.name === "HoardStore", pass);
		});

		QUnit.test('ü().hoard === "main"', function(assert) {
			assert.ok(ü().hoard === "main", pass);
		});

		QUnit.test('ü().set("foo", "bar") === "bar"', function(assert) {
			assert.ok(ü().set("foo", "bar") === "bar", pass);
		});

		QUnit.test('ü().get("foo") === "bar"', function(assert) {
			assert.ok(ü().get("foo") === "bar", pass);
		});

		QUnit.test('ü().keys()[0] === "foo"', function(assert) {
			assert.ok(ü().keys()[0] === "foo", pass);
		});

		QUnit.test('ü("secondary").constructor.name === "HoardStore"', function(assert) {
			assert.ok(ü("secondary").constructor.name === "HoardStore", pass);
		});

		QUnit.test('ü("secondary").hoard === "secondary"', function(assert) {
			assert.ok(ü("secondary").hoard === "secondary", pass);
		});

		QUnit.test('ü("secondary").set("fnord", "baz") === "baz"', function(assert) {
			assert.ok(ü("secondary").set("fnord", "baz") === "baz", pass);
		});

		QUnit.test('ü("secondary").get("fnord") === "baz"', function(assert) {
			assert.ok(ü("secondary").get("fnord") === "baz", pass);
		});

		QUnit.test('ü("secondary").keys()[0] === "fnord"', function(assert) {
			assert.ok(ü("secondary").keys()[0] === "fnord", pass);
		});
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
