#!/usr/bin/env node

process.stdin.resume();
process.stdin.setEncoding('utf8');

var fs = require('fs');
var util = require('util');

var program = require('commander');
var _ = require('lodash');
var chalk = require('chalk');

program
	.version('0.0.1')
	.usage('[options] <search> <replace>')
	.option('-x --regexp', 'search term is a regular expression')
	.parse(process.argv);

var workingDir = process.cwd();
var matchedFiles = [];

if (!program.args.length) {
	program.help();
} else {
	var search = program.args[0];
	var replace = program.args.length >= 2 ? program.args[1] : '';

	if (program.regexp) {
		search = new RegExp(search);
	}

	fs.readdir(workingDir, function(err, files) {
		files.sort();
		
		if(!files.length){
			console.log('No matches found the term: "' + search + '"');
			process.exit();
		}

		_.each(files, function(file) {
			if (file == '.DS_Store') return;
			
			var newFile = {
				before: file,
				after: file.replace(search, replace)
			};
			
			if (newFile.before === newFile.after) {
				return;
			}
			
			matchedFiles.push(newFile);
			
			var logBefore;
			
			if(program.regexp) {
				logBefore = newFile.before.replace(newFile.before.match(search)[0], chalk.red.bold(newFile.before.match(search)[0]));
			} else {
				logBefore = newFile.before.replace(search, chalk.red.bold(search));
			}
			
			console.log(
				newFile.before.replace(search, chalk.red.bold(search)),
				'->',
				newFile.after.replace(replace, chalk.green.bold(replace))
			);

		});
		
		console.log('Are you sure you want to rename these files? (Y/n)');
	});
}

process.stdin.on('data', function (text) {
	// console.log('text is', util.inspect(text));
	var finished = 0;
	var total = matchedFiles.length;

	if (text === 'Y\n') {
		_.each(matchedFiles, function(file){
			fs.rename(workingDir + '/' + file.before, workingDir + '/' + file.after, function(){
				finished++;
				if(finished == total){
					process.exit();
				}
			});
		});
	} else {
		console.log('Cancelled');
		process.exit();
	}
});


process.on('uncaughtException', function(err) {
	console.log(err);
});