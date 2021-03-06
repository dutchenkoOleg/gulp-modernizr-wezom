'use strict';

/**
 * Build modernizr file
 * @module
 * @author Oleg Dutchenko <dutchenko.o.dev@gmail.com>
 * @version 1.1.4
 */

// ----------------------------------------
// Imports
// ----------------------------------------

// modules
const path = require('path');
const chalk = require('chalk');
const lodash = require('lodash');
const modernizr = require('modernizr');

// ----------------------------------------
// Private
// ----------------------------------------

/**
 * Get relative path from modernizr folder to cwd;
 * @return {string}
 * @private
 */
function getRelativePath () {
	let pkg = require.resolve('modernizr/package.json');
	let relative = path.relative(pkg, process.cwd());
	return relative.replace(/\\/g, '/') + '/';
}

/**
 * @param data
 * @private
 */
function defaultCb (fn) {
	if (typeof fn !== 'function') {
		fn = function (data) {
			console.log(data);
		};
	}
	return fn;
}

/**
 * @const {string}
 * @private
 */
const relativePath = getRelativePath();

function getTest (featureDetects, filteredTest, data, isCustomTest) {
	let index = filteredTest.indexOf(data.property);
	if (~index) {
		let amdPath = data.amdPath;
		if (isCustomTest) {
			amdPath = path.join(relativePath, amdPath).replace(/\\/g, '/');
		}
		if (!~featureDetects.indexOf(amdPath)) {
			featureDetects.push(amdPath);
		}
		filteredTest.splice(index, 1);
	}
}

// ----------------------------------------
// Public
// ----------------------------------------

/**
 * @param {Object} [config={}] - build options
 * @param {Array.<string>} [config.tests=[]] - List of required tests
 * @param {Array.<string>} [config.excludeTests=[]] - A list of test cases that need to be excluded if they are found
 * @param {string} [config.classPrefix=''] - A string that is added before each CSS class
 * @param {Array.<string>} [config.options=[]] - Modernizr build options
 * @param {boolean} [config.minify=false] - Minimise resulting file
 * @param {Array.<Object>} [config.metadata=[]] - Metadata of own Modernizr tests
 * @param {Array.<Object>} [config.customMetadata=[]] - Metadata of user custom Modernizr tests
 * @param {Function} [done] - Success callback
 * @param {Function} [fail] - Error callback
 * @sourceCode
 */
function build (config = {}, done, fail) {
	let {
		tests = [],
		excludeTests = [],
		classPrefix = '',
		options = [],
		minify = false,
		metadata = [],
		customMetadata = []
	} = lodash.merge({}, config);

	done = defaultCb(done);
	fail = defaultCb(fail);

	let featureDetects = [];
	let filteredTest = tests.filter(test => !~excludeTests.indexOf(test));
	customMetadata.forEach(data => getTest(featureDetects, filteredTest, data, true));

	let classPrefixStr = classPrefix ? chalk.green(`"${classPrefix}"`) : chalk.blue('undefined');
	let optionsStr = options.length ? chalk.green(`["${options.sort().join('", "')}"]`) : chalk.blue('undefined');

	if (filteredTest.length) {
		for (let i = 0; i < metadata.length; i++) {
			getTest(featureDetects, filteredTest, metadata[i]);
			if (!filteredTest.length) {
				break;
			}
		}
	}

	let start = chalk.gray.bold('>>');
	let msg = [
		'',
		`${start} User build options:`,
		chalk.cyan([
			`- options: ${optionsStr}`,
			`- classPrefix: ${classPrefixStr}`,
			`- minify: ${chalk.blue(minify)}`,
			`- feature-detects: [`,
			chalk.green('  "' + featureDetects.join('"\n  "') + '"'),
			']'
		].join('\n')),
		'', `${start} Building your modernizr.js`
	];
	console.log(msg.join('\n'));

	try {
		modernizr.build({
			classPrefix,
			options,
			minify,
			'feature-detects': featureDetects
		}, done);
	} catch (err) {
		fail(err);
	}
}

// ----------------------------------------
// Exports
// ----------------------------------------

module.exports = build;
