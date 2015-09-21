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

	var revision = execSync('git rev-parse HEAD', [], {
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
		mangle: {
			except: [
				'HoardStore',
				'HOARD_NAME',
				'HOARD_CHAR',
				'HOARD_PARENT',
				'HOARD_MAIN_OPTS',
				'hds_del',
				'hds_garbage',
				'hds_get',
				'hds_keys',
				'hds_life',
				'hds_options',
				'hds_set_option',
				'hds_set',
				'hds_stringify',
				'hoard_store',
				'hoard_all_del',
				'hoard_all_get',
				'hoard_all_keys',
				'hoard_all_life',
				'hoard_all_set',
			],
		},
		compress: false,
		preserveComments: 'none',
		quoteStyle: 3,
		report: 'min',
	};
	var uglifyOptsMain;
	var uglifyOptsMinify;

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

	function tpl_banner(fileName) {
		var txt;
		var pre = [
			'/*!',
		];

		if (typeof fileName === 'string') {
			pre.push('* '+fileName);
			pre.push('*');
		} else if (typeof fileName === 'object') {
			for (var i in fileName) {
				if (fileName.hasOwnProperty(i) && typeof fileName[i] === 'string') {
					pre.push('* path '+i+': '+fileName[i]);
				}
			}
			pre.push('*');
		}

		txt = [
			'* '+pkg.name+' '+pkg.version,
			'*',
			'* '+pkg.description,
			'*',
			'* Copyright '+dateObj.getFullYear()+' '+pkg.author,
			'* License: '+pkg.license,
			'*',
			'* Build:',
			'*   '+gitUser+' on '+os.hostname(),
			'*   '+repo,
			'*   '+pkg.version+'-'+timestamp,
			'*   '+branch+' '+revision,
			'*   '+dateObj.toUTCString(),
			'*   '+dateObj.toLocaleString(),
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

	/* replace task ***********************/

	gruntCfg.replace = {};
	gruntCfg.replace.banner = {};
	gruntCfg.replace.banner.src = [paths.base+'src/hoard.js'];
	gruntCfg.replace.banner.dest = paths.build+'hoard.js';
	gruntCfg.replace.banner.replacements = [];
	//gruntCfg.replace.banner.replacements.push({
	//	from: /\/\*\s*build heading replaced here\s*\*\//i,
	//	to: tpl_banner('hoard.js').trim(),
	//});

	/* uglify task ************************/

	gruntCfg.uglify = {};

	uglifyOptsMain = _.extend({banner: tpl_banner('hoard.js')}, uglifyDefaults);
	uglifyOptsMain.beautify = true;

	gruntCfg.uglify.main = {};
	gruntCfg.uglify.main.options = uglifyOptsMain;
	gruntCfg.uglify.main.files = {};
	gruntCfg.uglify.main.files[paths.build+'hoard.js'] = [paths.build+'hoard.js'];

	uglifyOptsMinify = _.extend({banner: tpl_banner('hoard.min.js')}, uglifyDefaults);

	gruntCfg.uglify.minify = {};
	gruntCfg.uglify.minify.options = uglifyOptsMinify;
	gruntCfg.uglify.minify.files = {};
	gruntCfg.uglify.minify.files[paths.build+'hoard.min.js'] = [paths.build+'hoard.js'];

	/* watch task *************************/

	gruntCfg.watch = {};
	gruntCfg.watch.dev = {};
	gruntCfg.watch.dev.files = [paths.srcBase+'*.js'];
	gruntCfg.watch.dev.tasks = [
		'dev',
	];
	gruntCfg.watch.dev.options = {};

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
		'replace',
		'uglify',
	]);

	// det task
	// used with watch
	grunt.registerTask('dev', [
		'replace',
		'uglify',
		'copy:dev',
	]);

};