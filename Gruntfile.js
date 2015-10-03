var execSync = require('child_process').execSync;
var fs = require('fs');
var os = require('os');
var path = require("path");
var sys = require('util');
var _ = require('underscore');

module.exports = function(grunt) {

	/* timestamp **************************/

	var dateObj = new Date();
	var timestamp = Math.floor(dateObj.valueOf()/1000);

	/* project package.js *****************/

	var pkg = grunt.file.readJSON('package.json');

	/* paths ******************************/

	var rgxPathReplaceWin = /\\+/g;
	var rgxPathReplaceNix = /\/+/g;
	var paths = {};

	paths.base = path_2_nix(path.dirname(__filename)+'/');
	paths.buildBase = 'dist/';
	paths.build = path_2_nix(path.dirname(__filename)+'/'+paths.buildBase);
	paths.srcBase = 'src/';
	paths.src = path_2_nix(path.dirname(__filename)+'/'+paths.srcBase);
	paths.testBase = 'test/';
	paths.test = path_2_nix(path.dirname(__filename)+'/'+paths.testBase);
	paths.testBuildBase = paths.testBase+'js/builds/';
	paths.testBuild = path_2_nix(path.dirname(__filename)+'/'+paths.testBuildBase);

	/* git info ***************************/

	var revision = execSync('git rev-parse --short HEAD', [], {
		cwd: paths.base
	}).toString('utf8').trim();

	var branch = execSync('git rev-parse --abbrev-ref HEAD', [], {
		cwd: paths.base
	}).toString('utf8').trim();

	var gitUser = execSync('git config --get user.name', [], {
		cwd: paths.base
	}).toString('utf8').trim();

	var repo = execSync('git config --get remote.origin.url', [], {
		cwd: paths.base
	}).toString('utf8').trim();

	/* bare grunt *************************/

	var gruntCfg = {}
	var uglifyDefaults = {
		mangle: true,
		compress: false,
		preserveComments: 'none',
		quoteStyle: 3,
		report: 'min',
		screwIE8: true,
	};
	var uglifyOptsMain;
	var uglifyOptsMinify;
	var uglifyDistExcept = [
		'call_store',
		'call_store_all',
		'count',
		'dispatchEvent',
		'document',
		'Event',
		'event_bind',
		'event_fire',
		'exports',
		'get_transform',
		'get_transform_list',
		'handle_gc_event',
		'hdDefOpts',
		'hdIdBase',
		'hdIsNode',
		'hdMainStore',
		'hds_clear',
		'hds_del',
		'hds_event',
		'hds_expire',
		'hds_expire_at',
		'hds_expy',
		'hds_garbage',
		'hds_get',
		'hds_hoard_id',
		'hds_hoard_name',
		'hds_keys',
		'hds_options',
		'hds_sched_garbage',
		'hds_set',
		'hds_set_option',
		'hds_store_id',
		'hds_stringify',
		'hds_to_key',
		'hdsCacheTimes',
		'hdsCacheVals',
		'hdsGcRunning',
		'hdsGcSched',
		'hdsHoardId',
		'hdsHoardName',
		'hdsNil',
		'hdsOpts',
		'hdsReadOnlyOpts',
		'hdsSelf',
		'hdsStoreId',
		'hdsStoreIdx',
		'hdsTxForm',
		'hdUserStoreNames',
		'hdUserStores',
		'hoard_add_transform',
		'hoard_bind',
		'HOARD_CHAR',
		'hoard_clear_all',
		'hoard_del_all',
		'hoard_expire_all',
		'hoard_expire_all_at',
		'hoard_get_all',
		'hoard_get_transforms',
		'hoard_keys_all',
		'hoard_kill',
		'hoard_kill_all',
		'hoard_life_all',
		'HOARD_MAIN_OPTS',
		'HOARD_NAME',
		'HOARD_PARENT',
		'hoard_set_all',
		'hoard_store',
		'hoardChar',
		'hoardCore',
		'hoardMainOpts',
		'hoardName',
		'hoardParent',
		'HoardStore',
		'is_arr',
		'is_bool',
		'is_func',
		'is_num',
		'is_obj',
		'is_str',
		'is_val',
		'kill_store',
		'merge_opts',
		'module',
		'stamp',
		'valTxforms',
		'window',
	];
	var uglifyMinExcept = [
		'dispatchEvent',
		'document',
		'Event',
		'exports',
		'HOARD_CHAR',
		'HOARD_MAIN_OPTS',
		'HOARD_NAME',
		'HOARD_PARENT',
		'HoardStore',
		'module',
		'window',
	];

	/* internally scoped funcs ************/

	function path_2_nix(fp) {
		if (typeof fp === 'string') {
			return (''+fp).replace(rgxPathReplaceWin, '/');
		}
	}

	function path_2_win(fp) {
		if (typeof fp === 'string') {
			return (''+fp).replace(rgxPathReplaceNix, '\\');
		}
	}

	function tpl_banner(fileName, copyR) {
		var txt;
		var pre = [
			'/*!',
			'* '+pkg.name,
			'* '+(typeof fileName === 'string' ? fileName+' ' : '')+'v'+pkg.version,
		];

		txt = [
			'* '+pkg.description,
			'* © '+dateObj.getFullYear()+' '+pkg.author+' '+pkg.license,
			'* Build: '+gitUser+' on '+os.hostname()+' '+pkg.version+'-'+timestamp+' '+branch+' '+revision+' '+dateObj.toISOString(),
			'*/\n',
		];

		return pre.join('\n')+'\n'+txt.join('\n');
	}

	/* project configuration **************/

	gruntCfg.pkg = pkg;

	/* copy task **************************/

	gruntCfg.copy = {};

	gruntCfg.copy.dev = {};
	gruntCfg.copy.dev.files = [];
	gruntCfg.copy.dev.files.push({
		expand: true,
		cwd: paths.buildBase,
		src: ['**'],
		dest: paths.testBuildBase,
		filter: 'isFile',
	});
	gruntCfg.copy.dev.files.push({
		expand: false,
		src: paths.srcBase+'hoard.js',
		dest: paths.testBuildBase+'hoard.dev.js',
	});
	gruntCfg.copy.dev.files.push({
		expand: false,
		src: 'node_modules/qunitjs/qunit/qunit.js',
		dest: paths.testBase+'js/qunit.js',
	});
	gruntCfg.copy.dev.files.push({
		expand: false,
		src: 'node_modules/qunitjs/qunit/qunit.css',
		dest: paths.testBase+'css/qunit.css',
	});
	gruntCfg.copy.dev.files.push({
		expand: false,
		src: 'node_modules/qunit-assert-compare/qunit-assert-compare.js',
		dest: paths.testBase+'js/qunit-assert-compare.js',
	});
	gruntCfg.copy.dev.files.push({
		expand: false,
		src: 'node_modules/lz-string/libs/lz-string.min.js',
		dest: paths.testBase+'js/lz-string.min.js',
	});
	gruntCfg.copy.dev.files.push({
		expand: false,
		src: 'node_modules/jquery/dist/jquery.min.js',
		dest: paths.testBase+'js/jquery.min.js',
	});
	gruntCfg.copy.dev.files.push({
		expand: false,
		src: 'node_modules/jquery-ui/jquery-ui.js',
		dest: paths.testBase+'js/jquery-ui.js',
	});
	gruntCfg.copy.dev.files.push({
		expand: false,
		src: 'node_modules/jquery-ui/themes/base/jquery-ui.css',
		dest: paths.testBase+'css/jquery-ui.css',
	});
	gruntCfg.copy.dev.files.push({
		expand: false,
		src: 'node_modules/jquery-ui/themes/base/jquery-ui.css',
		dest: paths.testBase+'css/jquery-ui.css',
	});
	gruntCfg.copy.dev.files.push({
		expand: false,
		src: 'node_modules/markdown/lib/markdown.js',
		dest: paths.testBase+'js/markdown.js',
	});
	gruntCfg.copy.dev.files.push({
		expand: false,
		src: 'node_modules/markdown/lib/markdown.js',
		dest: paths.testBase+'js/markdown.js',
	});
	gruntCfg.copy.dev.files.push({
		expand: false,
		src: 'node_modules/underscore/underscore-min.js',
		dest: paths.testBase+'js/underscore-min.js',
	});
	gruntCfg.copy.dev.files.push({
		expand: false,
		src: 'node_modules/bpmv/dist/bpmv.min.js',
		dest: paths.testBase+'js/bpmv.min.js',
	});
	gruntCfg.copy.dev.files.push({
		expand: false,
		src: 'node_modules/js-base64/base64.min.js',
		dest: paths.testBase+'js/base64.min.js',
	});
	gruntCfg.copy.dev.files.push({
		expand: false,
		src: 'package.json',
		dest: paths.testBase+'package.json',
	});

	gruntCfg.copy.readme = {};
	gruntCfg.copy.readme.files = [];
	gruntCfg.copy.readme.files.push({
		expand: false,
		src: 'README.md',
		dest: paths.testBase+'README.md',
	});

	/* replace task ***********************/

	gruntCfg.replace = {};

	gruntCfg.replace.readme = {};
	gruntCfg.replace.readme.src = [paths.base+'README.md'];
	gruntCfg.replace.readme.dest = paths.base+'README.md';
	gruntCfg.replace.readme.replacements = [];
	gruntCfg.replace.readme.replacements.push({
		from: new RegExp('\\s*\\#\\s+'+pkg.name+'(\\s+v[0-9\\.]+)?\n', 'i'),
		to: '# '+pkg.name+' v'+pkg.version+'\n',
	});
	gruntCfg.replace.readme.replacements.push({
		from: new RegExp('(\\t| )*\\* [0-9\\.]+ ?kb minified[^\\n]*\\n', 'i'),
		to: function () {
			return '* '+
				(Math.ceil((fs.statSync(paths.build+'hoard.min.js').size / 1024) * 100) / 100)+
				' kb minified ('+
				fs.statSync(paths.build+'hoard.min.js').size+
				' bytes)\n';
		},
	});
	gruntCfg.replace.readme.replacements.push({
		from: new RegExp('(\\t| )*\\* [0-9\\.]+ ?kb lightly minified[^\\n]*\\n', 'i'),
		to: function () {
			return '* '+
				(Math.ceil((fs.statSync(paths.build+'hoard.js').size / 1024) * 100) / 100)+
				' kb lightly minified ('+
				fs.statSync(paths.build+'hoard.js').size+
				' bytes)\n';
		},
	});
	gruntCfg.replace.readme.replacements.push({
		from: new RegExp('(\\t| )*\\* [0-9\\.]+ ?kb unminified[^\\n]*\\n', 'i'),
		to: function () {
			return '* '+
				(Math.ceil((fs.statSync(paths.srcBase+'hoard.js').size / 1024) * 100) / 100)+
				' kb unminified ('+
				fs.statSync(paths.srcBase+'hoard.js').size+
				' bytes)\n';
		},
	});

	gruntCfg.replace.ugly = {};
	gruntCfg.replace.ugly.src = [paths.build+'hoard.js'];
	gruntCfg.replace.ugly.dest = paths.build+'hoard.js';
	gruntCfg.replace.ugly.replacements = [];
	gruntCfg.replace.ugly.replacements.push({
		from: /    /g,
		to: '\t',
	});

	/* uglify task ************************/

	gruntCfg.uglify = {};

	uglifyOptsMain = _.extend({banner: tpl_banner('hoard.js')}, uglifyDefaults);
	uglifyOptsMain.beautify = {
		'beautify': true,
		'indent_level': 4,
	};
	uglifyOptsMain.mangle = {except: uglifyDistExcept};

	gruntCfg.uglify.main = {};
	gruntCfg.uglify.main.options = uglifyOptsMain;
	gruntCfg.uglify.main.files = {};
	gruntCfg.uglify.main.files[paths.build+'hoard.js'] = [paths.build+'hoard.js'];

	uglifyOptsMinify = _.extend({banner: tpl_banner('hoard.min.js')}, uglifyDefaults);
	uglifyOptsMinify.mangle = {except: uglifyMinExcept};

	gruntCfg.uglify.minify = {};
	gruntCfg.uglify.minify.options = uglifyOptsMinify;
	gruntCfg.uglify.minify.files = {};
	gruntCfg.uglify.minify.files[paths.build+'hoard.min.js'] = [paths.build+'hoard.js'];

	/* watch task *************************/

	gruntCfg.watch = {};

	gruntCfg.watch.dev = {};
	gruntCfg.watch.dev.files = [
		paths.srcBase+'*.js',
	];
	gruntCfg.watch.dev.tasks = [
		'dev',
	];
	gruntCfg.watch.dev.options = {
		atBegin: true,
	};

	gruntCfg.watch.replace = {};
	gruntCfg.watch.replace.files = [
		paths.base+'README.md',
	];
	gruntCfg.watch.replace.tasks = [
		'readme',
	];
	gruntCfg.watch.replace.options = {
		atBegin: true,
	};

	/* run all the things! ****************/

	// set config
	grunt.initConfig(gruntCfg);

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-text-replace');

	// Default task(s).
	grunt.registerTask('default', [
		'uglify',
		'replace:ugly',
		'replace:readme',
	]);

	// det task
	// used with watch
	grunt.registerTask('dev', [
		'uglify',
		'replace:ugly',
		'replace:readme',
		'copy:dev',
	]);

	// det task
	// used with watch
	grunt.registerTask('readme', [
		'copy:readme',
	]);

};