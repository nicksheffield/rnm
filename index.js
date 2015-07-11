#!/usr/bin/env node

var fs = require('fs');

var program = require('commander');
var _ = require('lodash');
var chalk = require('chalk');

program
	.version('0.0.1')
	.usage('[options] <search> <replace>')
	.option('-x --regexp', 'search term is a regular expression')
	.parse(process.argv);

var workingDir = process.cwd();

if (!program.args.length) {
	program.help();
} else {
	var search = program.args[0];
	var replace = program.args.length >= 2 ? program.args[1] : '';

	if (program.regexp) {
		search = new Regexp(search);
	}

	fs.readdir(workingDir, function(err, files) {
		files.sort();

		_.each(files, function(file) {
			if (file == '.DS_Store') return;

			var nameBefore = file;
			var nameAfter = file.replace(search, replace);

			fs.rename(workingDir + '/' + nameBefore, workingDir + '/' + nameAfter, function() {
				if (nameBefore !== nameAfter) {
					console.log(nameBefore.replace(search, chalk.red.bold(search)), '->', nameAfter.replace(replace, chalk.green.bold(replace)));
				}
			});

		});
	});
}