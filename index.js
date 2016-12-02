#!/usr/bin/env node

process.stdin.resume()
process.stdin.setEncoding('utf8')

var fs = require('fs')
var util = require('util')

var program = require('commander')
var _ = require('lodash')
var chalk = require('chalk')

program
	.version('0.0.1')
	.usage('[options] <search> <replace>')
	.option('-x --regexp', 'search term is a regular expression')
	.parse(process.argv)

var workingDir = process.cwd()
var matchedFiles = []

if (!program.args.length) {
	program.help()
} else {
	var search = program.args[0]
	var replace = program.args.length >= 2 ? program.args[1] : ''

	if (program.regexp) {
		search = new RegExp(search, 'g')
	}

	fs.readdir(workingDir, function(err, files) {
		files.sort()
		
		if(!files.length){
			console.log('No matches found the term: "' + search + '"')
			process.exit()
		}

		_.each(files, function(file) {
			if (file == '.DS_Store') return

			var before = file, after = file

			if(!program.regexp) after = after.split(search).join(replace)
			else after = file.replace(search, replace)
			
			if (before === after) return
			
			matchedFiles.push({ before, after })

			var logBefore = before.replace(search, chalk.red.bold(program.regexp ? search.exec(before) : search))
			var logAfter = after.split(replace).join(chalk.green.bold(replace))

			console.log(' ')
			console.log(logBefore)
			console.log(logAfter)

		})

		if(matchedFiles.length) {
			console.log('Are you sure you want to rename these files? (Y/n)')
		} else {
			console.log('Nothing matched', chalk.red.bold(search))
			process.exit()
		}
	})
}

process.stdin.on('data', function (text) {
	var finished = 0
	var total = matchedFiles.length

	if (text === 'Y\n') {
		_.each(matchedFiles, function(file){
			fs.rename(workingDir + '/' + file.before, workingDir + '/' + file.after, function(){
				finished++
				if(finished == total){
					process.exit()
				}
			})
		})
	} else {
		console.log('Cancelled')
		process.exit()
	}
})

process.on('uncaughtException', function(err) {
	console.log(err)
})