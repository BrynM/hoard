(function () {

	/***************************************
	* Hoard Broser Testing
	* https://qunitjs.com/
	***************************************/

	/* Vars *******************************/

	var $body = $('body');
	var $readme = $('#readme');
	var $run = $('#runtests');
	var $quFixture = $('#qunit-fixture');
	var $qunit = $('#qunit');
	var $tplPerfTable = $('template#perfTable');
	var $tplPerfTableRow = $('template#perfTableRow');
	var pass = 'pass';
	var nameGen = '000000';
	var perfGen = '0000000000000000000000000000000000000000';
	var genSets = [[48, 57], [65, 90], [97, 122]]; // in ascending order
	var getGotten = {};
	var keptPerf = 100;
	var selIdPerfTotals = 'perfTotals';
	var tokeDelims = {l: '{{', r: '}}'};
	var rgxReplaceTpl = /\{\{[^}]+\}\}/g;
	var pkg;
	var allowPerfTargetPct = 10;
	var qStarted = false;
	var tStarted = false;

	/* Funcs ******************************/

	function err_pkg (xhr, status, err) {
		console.log('pkg err', arguments);
	}

	function err_readme (xhr, status, err) {
		console.log('readme err', arguments);
	}

	function get_get () {
		var gt = (''+document.location.search).replace(/^\?/, '').split('&');
		var st = {};
		var iter;
		var cut;

		if (gt < 2) {
			return;
		}

		for (iter = 0; iter < gt.length; iter++) {
			if (gt[iter].indexOf('=') < 0) {
				st[gt[iter]] = '';

				continue;
			}

			cut = gt[iter].split('=');
			st[cut[0]] = cut[1];
		}

		getGotten = st;

		return getGotten;
	}

	function get_perf_target_ü_sequential(key, gainz, kickLast) {
		var hist = JSON.parse(localStorage['perf']);
		var gain = parseFloat(gainz);
		var cKs = 0;
		var iter;
		var bumpIdx = kickLast ? 0 : 1;
		var minusIdx = kickLast ? 1 : 0;

		if (key in hist) {
			gain = isNaN(gain) ? 0.0 : gain;

			for (iter = bumpIdx; iter < hist[key].length - minusIdx; iter++) {
				cKs = parseInt(cKs + hist[key][iter].ks, 10);
			}

			return cKs > 0 ? Math.floor(((cKs / hist[key].length) * ((100 - gain) / 100)) * 1000) / 1000 : 0;
		}

		return 0;
	}

	function init_tests(unit, data, status, xhr) {
		if (!qStarted) {
			qStarted = true;

			return unit.start();
		}
	}

	function name_inc (str, sPos) {
		var wrap = false;
		var mix = _.isString(str) ? str.split('') : nameGen.split('');
		var pos = _.isNumber(sPos) ? parseInt(sPos, 10) : 0;
		var cc;

		if (!mix) {
			return ''+(new Date().valueOf());
		}

		cc = mix[mix.length - pos - 1].charCodeAt(0) + 1;

		if (cc < genSets[0][0]) {
			cc = genSets[0][0];
		}

		if (cc > genSets[0][1]) {
			if (cc < genSets[1][0]) {
				cc = genSets[1][0];
			}
			if (cc > genSets[1][1]) {
				if (cc < genSets[2][0]) {
					cc = genSets[2][0];
				}
				if (cc > genSets[2][1]) {
					wrap = true;
					cc = genSets[0][0];
				}
			}
		}

		mix[mix.length - pos - 1] = String.fromCharCode(cc);
		str = wrap ? name_inc(mix.join(''), pos + 1) : mix.join('');

		return str;
	}

	function next_store_name() {
		nameGen = name_inc(nameGen);

		return nameGen;
	}

	function next_perf_name() {
		perfGen = name_inc(perfGen);

		return perfGen;
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
	}

	function pop_readme (data, status, xhr) {
		$readme.html(markdown.toHTML(data, 'Maruku'));
	}

	function queue_test_sets(hoardLabel, hoardThing, üLabel, üThing) {
		if (!('skipStd' in getGotten)) {
			run_tests_hoard(QUnit, hoardLabel, hoardThing)
			run_tests_ü(QUnit, üLabel, üThing);
			run_tests_ü(QUnit, üLabel, üThing, next_store_name());
		}

		if ('runPerf' in getGotten) {
			run_tests_perf_ü(QUnit, üLabel, üThing, hoardThing);
		}
	}

	function report_perf_averages_ü_sequential (hist) {
		var hist = JSON.parse(localStorage['perf']);
		var lastRun;
		var selPerf = '#'+selIdPerfTotals;
		var $perf = $(selPerf);
		var iter;
		var rec, len;
		var cDur;
		var cKs;
		var cTot;
		var tplData;
		var html;
		var rows;
		var lastIdx;
		var $inner;
		var idx;
		var avg;

		if($perf.length < 1) {
			$quFixture.after('<div id="'+selIdPerfTotals+'" style="clear: both"><h1>Performance Averages</h1></div>');
			$perf = $(selPerf);
		}

		var ordered = bpmv.keys(hist).sort();

		for (idx = 0; idx < ordered.length; idx++) {
			iter = ordered[idx];

			if (!_.isArray(hist[iter])) {
				continue;
			}

			if (!_.isObject(hist[iter][0]) || !_.isNumber(hist[iter][0].tot)) {
				continue;
			}

			len = hist[iter].length;
			cDur = 0;
			cKs = 0;
			cTot = 0;
			html = [];
			rows = [];
			lastIdx = hist[iter].length -1;
			lastRun = JSON.parse(localStorage['_last_'+iter]);

			if (lastIdx < 0) {
				continue;
			}

			for (rec = 0; rec < len; rec++) {
				cDur = parseInt(cDur + hist[iter][rec].dur, 10);
				cKs = parseInt(cKs + hist[iter][rec].ks, 10);
				cTot = parseInt(cTot + hist[iter][rec].tot, 10);
			}

			avg = cKs / len;

			tplData = {
				'key': iter,
				'keySafe': iter.replace(/[^a-zü]/gi, '_'),
				'count': len,
				'countPlur': len > 1 ? 's' : '',
				'perfBase': str_num(lastRun.base, 3),
				'perfTarg': str_num(lastRun.exp, 3),
				'perfTargPct': allowPerfTargetPct,
				'pOrF': lastRun.ks >= lastRun.exp ? 'pass' : 'fail',
				'perfMsg': '',
				'perfDelta': str_num(lastRun.ks - lastRun.base, 3),
				'perfLast': str_num(lastRun.ks, 3),
				'perfPct': (1 - (lastRun.exp / lastRun.ks)) * 100,
				'perfPctAvg': (1 - (lastRun.base / lastRun.ks)) * 100
			};

			tplData.perfPct = tplData.perfPct > 0 ? '+'+str_num(tplData.perfPct, 3) : str_num(tplData.perfPct, 3);
			tplData.perfPctAvg = tplData.perfPctAvg > 0 ? '+'+str_num(tplData.perfPctAvg, 3) : str_num(tplData.perfPctAvg, 3);

			html.push(bpmv.toke($tplPerfTable.html(), tplData, false, tokeDelims).replace(rgxReplaceTpl, ''));

			tplData.desc = 'last run';
			tplData.dur = str_num(lastRun.dur / 1000, 3);
			tplData.ks = str_num(lastRun.ks, 3);
			tplData.tot = str_num(lastRun.tot);
			tplData.pOrF = lastRun.ks >= lastRun.exp ? 'perf-pass' : 'perf-fail';

			rows.push(bpmv.toke($tplPerfTableRow.html(), tplData, false, tokeDelims).replace(rgxReplaceTpl, ''));

			tplData.desc = 'average';
			tplData.dur = str_num((cDur / len) / 1000, 3);
			tplData.ks = str_num(avg, 3);
			tplData.tot = str_num(Math.ceil(cTot / len));
			tplData.pOrF = '';
			tplData.perfMsg = '';

			rows.push(bpmv.toke($tplPerfTableRow.html(), tplData, false, tokeDelims).replace(rgxReplaceTpl, ''));

			tplData.desc = 'total';
			tplData.dur = str_num(cDur / 1000, 3);
			tplData.ks = str_num(cKs, 3);
			tplData.tot = str_num(cTot);

			rows.push(bpmv.toke($tplPerfTableRow.html(), tplData, false, tokeDelims).replace(rgxReplaceTpl, ''));

			$inner = $perf.find('#perfTable-'+tplData.keySafe);

			if ($inner && $inner.length > 0) {
				$inner.replaceWith(html.join('\n'));
			} else {
				$perf.append(html.join('\n'));
			}

			$perf.find('#perfTable-'+tplData.keySafe+'-rows').html(rows.join('\n'))
		}
	}

	function run_tests_hoard (unit, prefix, hoardThing) {
		var sName = next_store_name();
		var sNameGetAll = next_store_name();
		var sNameSetAll = next_store_name();
		var getAllKey = next_store_name();
		var getAllVal = next_store_name();
		var setAllKey = next_store_name();
		var setAllVal = next_store_name();

		unit.module('HOARD_NAME '+prefix);

		unit.test('get main store and get store "'+sName+'", then kill "'+sName+'"', function(assert) {
			assert.expect(3);

			assert.strictEqual(
				hoardThing.store().constructor.name,
				'HoardStore',
				prefix+'.store() is HoardStore'
			);
			assert.strictEqual(
				hoardThing.store(sName).constructor.name,
				'HoardStore',
				prefix+'.store("'+sName+'") is HoardStore'
			);
			assert.strictEqual(
				typeof hoardThing.kill(sName),
				'number',
				prefix+'.store("'+sName+'") was killed'
			);
		});

		unit.test('set all "'+setAllKey+'" to "'+setAllVal+'"', function(assert) {
			assert.expect(6);

			assert.strictEqual(
				hoardThing.store().constructor.name,
				'HoardStore',
				prefix+'.store() is HoardStore'
			);
			assert.strictEqual(
				hoardThing.store(sNameSetAll).constructor.name,
				'HoardStore',
				prefix+'.store("'+sNameSetAll+'") is HoardStore'
			);

			assert.strictEqual(
				typeof hoardThing.all_set(setAllKey, setAllVal),
				'object',
				prefix+'.all_set("'+setAllKey+'", "'+setAllVal+'")'
			);
			assert.strictEqual(
				hoardThing.store().get(setAllKey),
				setAllVal,
				prefix+'.store().get("'+setAllKey+'") === "'+setAllVal+'"'
			);
			assert.strictEqual(
				hoardThing.store(sNameSetAll).get(setAllKey),
				setAllVal,
				prefix+'.store("'+sNameSetAll+'").get("'+setAllKey+'") === "'+setAllVal+'"'
			);
			assert.strictEqual(
				typeof hoardThing.kill(sNameSetAll),
				'number',
				prefix+'.store("'+sNameSetAll+'") was killed'
			);
		});

		unit.test('get all "'+getAllKey+'"', function(assert) {
			var getRes;

			assert.expect(7);

			assert.strictEqual(
				hoardThing.store().constructor.name,
				'HoardStore',
				prefix+'.store() is HoardStore'
			);
			assert.strictEqual(
				hoardThing.store(sNameGetAll).constructor.name,
				'HoardStore',
				prefix+'.store("'+sNameGetAll+'") is HoardStore'
			);

			assert.strictEqual(
				typeof hoardThing.all_set(getAllKey, getAllVal),
				'object',
				prefix+'.all_set("'+getAllKey+'", "'+getAllVal+'")'
			);

			getRes = hoardThing.all_get(getAllKey);

			assert.strictEqual(
				typeof getRes,
				'object',
				prefix+'.all_get("'+getAllKey+'") is Object'
			);
			assert.strictEqual(
				getRes['main'],
				getAllVal,
				prefix+'.all_get("'+getAllKey+'")["main"] === "'+getAllVal+'"'
			);
			assert.strictEqual(
				getRes[sNameGetAll],
				getAllVal,
				prefix+'.all_get("'+getAllKey+'")["'+sNameGetAll+'"] === "'+getAllVal+'"'
			);
			assert.strictEqual(
				typeof hoardThing.kill(sNameGetAll),
				'number',
				prefix+'.store("'+sNameGetAll+'") was killed'
			);
		});
	}

	function run_tests_perf_ü (unit, prefix, üThing, hoardThing) {
		var txForms = hoardThing.get_transforms();
		var iter;

		for (iter = 0; iter < txForms.length; iter++) {
			if (txForms[iter] === 'plain') {
				continue;
			}

			run_tests_perf_ü_sequential(
				unit,
				txForms[iter]+' '+prefix,
				üThing,
				next_store_name(),
				{storage: txForms[iter]}
			);
		}

		QUnit.done(report_perf_averages_ü_sequential);
	}

	function run_tests_perf_ü_sequential (unit, prefix, üThing, storeName, opts) {
		var sName = typeof storeName === 'string' ? '"'+storeName+'"' : '';
		var expectedStoreName = typeof storeName === 'string' ? storeName : 'main';
		var dur = 2000;
		var charSec;
		var keySec;
		var perfBase;

		unit.module('HOARD_CHAR '+prefix+'('+sName+') performance');
	
		unit.test('sequential set and get of '+perfGen.length+' char strings for '+(dur/1000)+' secs', function(assert) {
			var stamp = new Date().valueOf();
			var key, val;
			var tot = 0;
			var lsHist;
			var perfTarg;

			if (!_.isString(localStorage['perf'])) {
				localStorage['perf'] = JSON.stringify({});
			}

			lsHist = JSON.parse(localStorage['perf']);

			if (!_.isArray(lsHist[prefix])) {
				lsHist[prefix] = [];
			}

			assert.expect(5);

			assert.strictEqual(
				üThing(storeName, opts).constructor.name,
				'HoardStore',
				prefix+'('+sName+') is HoardStore'
			);
			assert.strictEqual(
				üThing(storeName).get_name(),
				expectedStoreName,
				prefix+'('+sName+').get_name() === "'+expectedStoreName+'"'
			);

			perfTarg = get_perf_target_ü_sequential(prefix, allowPerfTargetPct);
			perfBase = get_perf_target_ü_sequential(prefix, 0.0);

			assert.gte((
				function() {
					var timer = new Date().valueOf();
					var beg, ed;

					while (timer < (stamp + dur)) {
						key = next_perf_name();
						val = next_perf_name();

						beg = new Date().valueOf();

						üThing(storeName).set(key, val);

						if (üThing(storeName).get(key) !== val) {
							throw 'Broken performance test!!! "'+key+'" is not "'+val+'"!!!';
						}

						ed = new Date().valueOf();

						timer = timer + (ed - beg);

						tot++;
					}

					keySec = Math.round((tot / dur) * 100000) / 100;

					lsHist[prefix].push({'ks': keySec, 'tot': tot, 'dur': dur});
					lsHist[prefix] = lsHist[prefix].slice(0, keptPerf);

					localStorage['perf'] = JSON.stringify(lsHist);
					localStorage['_last_'+prefix] = JSON.stringify({
						'ks': keySec,
						'tot': tot,
						'dur': dur,
						'exp': perfTarg,
						'base': perfBase
					});

					return keySec;
				})(),
				perfTarg,
				prefix+'('+sName+') - KEYS: '+str_num(tot)+' - PERF: '+str_num(keySec, 3)+' keys/sec - EXPECT: '+str_num(perfTarg, 3)+' ('+str_num(perfBase, 3)+' avg minus '+allowPerfTargetPct+'%) - DELTA: '+str_num(keySec - perfTarg, 3)+' - LAST: '+key
			);

			assert.strictEqual(
				typeof üThing(storeName).clear(),
				'undefined',
				prefix+'('+sName+').clear()'
			);

			assert.strictEqual(
				üThing(storeName).keys().length,
				0,
				prefix+'('+sName+').keys() is empty'
			);
		});
	}

	function run_tests_ü (unit, prefix, üThing, storeName, opts) {
		var sName = typeof storeName === 'string' ? '"'+storeName+'"' : '';
		var expectedStoreName = typeof storeName === 'string' ? storeName : 'main';
		var waitFor = 1;
		var nameDel = next_store_name();
		var nameExp = next_store_name();
		var nameExpAt = next_store_name();
		var valDel = next_store_name();
		var valExp = next_store_name();
		var valExpAt = next_store_name();

		unit.module('HOARD_CHAR '+prefix+'('+sName+')');

		unit.test('set and delete "'+nameDel+'"', function(assert) {
			assert.expect(7);

			assert.strictEqual(
				üThing(storeName, opts).constructor.name,
				'HoardStore',
				prefix+'('+sName+') is HoardStore'
			);

			assert.strictEqual(
				üThing(storeName).get_name(),
				expectedStoreName,
				prefix+'('+sName+').get_name() === "'+expectedStoreName+'"'
			);

			assert.strictEqual(
				üThing(storeName).set(nameDel, valDel),
				valDel,
				prefix+'('+sName+').set("'+nameDel+'", "'+valDel+'")'
			);
			assert.strictEqual(
				üThing(storeName).get(nameDel),
				valDel,
				prefix+'('+sName+').get("'+nameDel+'")'
			);
			assert.gt(
				üThing(storeName).keys().indexOf(nameDel),
				-1,
				prefix+'('+sName+').keys().indexOf("'+nameDel+'")'
			);

			assert.strictEqual(
				üThing(storeName).del(nameDel),
				true,
				prefix+'('+sName+').del("'+nameDel+'")'
			);
			assert.strictEqual(
				typeof üThing(storeName).get(nameDel),
				'undefined',
				'deleted '+prefix+'('+sName+').get("'+nameDel+'")'
			);
		});

		unit.test('set and expire "'+nameExp+'"', function(assert) {
			var expired = assert.async();
			var newTime = parseInt((new Date().valueOf() / 1000) + waitFor, 10);

			assert.expect(4);

			assert.strictEqual(
				üThing(storeName).set(nameExp, valExp, waitFor * 10),
				valExp,
				prefix+'('+sName+').set("'+nameExp+'", "'+valExp+'", '+(waitFor * 10)+')'
			);
			assert.ok(
				üThing(storeName).expire(nameExp, waitFor) >= newTime,
				prefix+'('+sName+').expire("'+nameExp+'", '+waitFor+') >= '+newTime
			);
			assert.strictEqual(
				üThing(storeName).get(nameExp),
				valExp,
				'not expired '+prefix+'('+sName+').get("'+nameExp+'")'
			);
			setTimeout(function() {
				assert.strictEqual(
					typeof üThing(storeName).get(nameExp),
					'undefined',
					'expired '+prefix+'('+sName+').get("'+nameExp+'")'
				);
				expired();
			}, (waitFor * 1000) + 5 );
		});

		unit.test('set and expire_at "'+nameExpAt+'"', function(assert) {
			var expiredAt = assert.async();
			var newTimeAt = parseInt((new Date().valueOf() / 1000) + waitFor, 10);

			assert.expect(4);

			assert.strictEqual(
				üThing(storeName).set(nameExpAt, valExpAt, waitFor * 10),
				valExpAt,
				prefix+'('+sName+').set("'+nameExpAt+'", "'+valExpAt+'", '+(waitFor * 10)+')'
			);
			assert.strictEqual(
				üThing(storeName).expire_at(nameExpAt, newTimeAt),
				newTimeAt,
				prefix+'('+sName+').expire_at("'+nameExpAt+'", '+newTimeAt+')'
			);
			assert.strictEqual(
				üThing(storeName).get(nameExpAt),
				valExpAt,
				'not expired at '+prefix+'('+sName+').get("'+nameExpAt+'")'
			);
			setTimeout(function() {
				assert.strictEqual(
					typeof üThing(storeName).get(nameExpAt),
					'undefined',
					'expired at '+prefix+'('+sName+').get("'+nameExpAt+'")'
				);
				expiredAt();
			}, (waitFor * 1000) + 5 );
		});

		unit.test('clear', function(assert) {
			assert.expect(2);

			assert.strictEqual(
				typeof üThing(storeName).clear(),
				'undefined',
				prefix+'('+sName+').clear()'
			);

			assert.strictEqual(
				üThing(storeName).keys().length,
				0,
				prefix+'('+sName+').keys() is empty'
			);
		});
	}

	function set_pkg (data, status, xhr) {
		pkg = _.extend({}, data);
		$body.trigger('hdPackage');
	}

	function scroll_to_tests (ev) {
		if ($run && $run.length > 0) {
			$run.remove();
		}

		if(typeof ev === 'object' && typeof ev.preventDefault === 'function') {
			ev.preventDefault();
		}

		$('html,body').stop().animate({
				'scrollTop' : ($qunit.offset().top - 20)
		}, 1000, 'easeOutBounce', function (ev) {
			setTimeout(start_tests, 500);
		});
	}

	function start_tests () {
		if (tStarted) {
			return;
		}

		if (typeof QUnit.config.started === 'number' && QUnit.config.started > 0) {
			return;
		}

		tStarted = true;

		init_tests(QUnit);

		if (!('noDev' in getGotten)) {
			queue_test_sets('hoard', hoard, 'ü', ü);
		}

		if (!('skipBuilt' in getGotten)) {
			if (typeof hoardDist !== 'object') {
				throw 'Failed to load minified version to test!';
			}

			queue_test_sets('hoardDist', hoardDist, 'üDist', üDist);

			if (typeof hoardMin !== 'object') {
				throw 'Failed to load minified version to test!';
			}

			queue_test_sets('hoardMin', hoardMin, 'üMin', üMin);
		}
	}

	function str_num (num, prec) {
		var neg = '';
		var uNum = '';
		var n = null;
		var nI = null;
		var nD = '';
		var nRx = /(\d+)(\d{3})/;
		var pr = bpmv.num(prec) ? parseInt(prec, 10) : 0;

		if (bpmv.num(num, true)) {

		}

		uNum = ''+num;
		n = uNum.split('.');
		nI = n[0];

		if (pr > 0) {
			nD = n.length > 1 ? '.'+bpmv.pad((''+n[1]).substr(0, pr), pr) : '.'+bpmv.pad('0', pr);
		}

		if (nI.length > 3) {
			while (nRx.test(nI)) {
				nI = nI.replace(nRx, '$1'+','+'$2');
			}
		}

		return nI+nD;
	};

	/* Run ********************************/

	QUnit.config.autostart = false;
	QUnit.config.scrolltop = false;
	//QUnit.config.hidepassed = true;
	QUnit.config.urlConfig.unshift({
		id: 'runPerf',
		value: '1',
		label: 'Performance',
		tooltip: 'Run performance tests for all test sets.'
	});
	QUnit.config.urlConfig.unshift({
		id: 'skipStd',
		value: '1',
		label: 'Skip Standard',
		tooltip: 'skip the standard tests.'
	});
	QUnit.config.urlConfig.unshift({
		id: 'skipBuilt',
		value: '1',
		label: 'Skip built',
		tooltip: 'Skip tests for dist and minified versions copied by running `grunt dev`.'
	});
	QUnit.config.urlConfig.unshift({
		id: 'noDev',
		value: '1',
		label: 'Skip dev',
		tooltip: 'Skip tests for dev version copied by running `grunt dev`.'
	});
	QUnit.config.urlConfig.unshift({
		id: 'rerun',
		value: '1',
		label: 'Auto-rerun',
		tooltip: 'Reload the page when testing is finished to rerun the tests.'
	});
	QUnit.config.urlConfig.unshift({
		id: 'run',
		value: '1',
		label: 'Auto-run',
		tooltip: 'Auto-run on refresh.'
	});

	$.ajax({
		url: '../../package.json',
		dataType: 'json',
		cache: true,
		error: err_pkg,
		success: set_pkg
	});

	$body.on('hdPackage', pop_ui);

	$(function () {
		get_get('run');

		$run.on('click', 'button', scroll_to_tests);

		if ('run' in getGotten) {
			setTimeout(scroll_to_tests, 500);
		}

		if ('rerun' in getGotten) {
			QUnit.done(function () {
				setTimeout(function () {
					document.location.reload();
				}, 3000);
			})
		}
	});

})();

//https://github.com/evilstreak/markdown-js/

//console.log('hoard', hoard);
//console.log('hdMainStore', hdMainStore);
//var opts = {prefix: 'main', lifeMax: 60 * 60 * 2};
//console.log('hoard.make_store("foo", '+JSON.stringify(opts)+')', hoard.make_store("foo", opts));
//console.log('hoard.set(\'foo\', \'bar\')', hoard.set('foo', 'bar'));
//console.log('hoard.get(\'foo\')', hoard.get('foo'));
