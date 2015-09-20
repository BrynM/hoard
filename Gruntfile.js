var execSync = require('child_process').execSync;
var fs = require('fs');
var os = require('os');
var path = require("path");
var sys = require('util');
var _ = require('underscore');

module.exports = function(grunt) {

	//
	// timestamp
	//

	var dateObj = new Date();
	var timestamp = Math.floor(dateObj.valueOf()/1000);

	//
	// project package.js
	//

	var pkg = grunt.file.readJSON('package.json');

	//
	// paths
	//

	var rgxPathReplaceWin = /\\+/g;
	var rgxPathReplaceNix = /\/+/g;
	var paths = {};

	paths.base = path_2_nix(path.dirname(__filename)+'/');
	paths.build = path_2_nix(path.dirname(__filename)+'/dist/');

	//
	// git info
	//

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

	//
	// bare grunt
	//

	var gruntCfg = {}
	var uglifyDefaults = {
		mangle: {
			except: ['HoardStore'],
		},
		compress: false,
		preserveComments: 'none',
		quoteStyle: 3,
		report: 'min',
	};

	//
	// internally scoped funcs
	//

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

	//
	// project configuration
	//

	gruntCfg.pkg = pkg;

	gruntCfg.replace = {
		background: {
			src: [paths.base+'src/hoard.js'],
			dest: paths.build+'hoard.js',
			replacements: [
				{
					// this doesn't work right yet :/
					from: /\/\*\s*build heading replaced here\s*\*\//i,
					to: tpl_banner('hoard.js').trim(),
				},
			],
		},
	};

	gruntCfg.uglify = {};
	gruntCfg.uglify.min = {};
	gruntCfg.uglify.min.options = _.extend({banner: tpl_banner('hoard.min.js')}, uglifyDefaults, '');
	gruntCfg.uglify.min.files = {};
	gruntCfg.uglify.min.files[paths.build+'hoard.min.js'] = [paths.build+'hoard.js'];

	//
	// run all the things!
	//

	// set config
	grunt.initConfig(gruntCfg);

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-text-replace');

	// Default task(s).
	grunt.registerTask('default', ['replace', 'uglify']);
};