#!/usr/bin/env node

/*jshint node: true */
'use strict';

var yargs = require('yargs');

var parse = function parse(defaults) {
    var processArgv = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : process.argv;


    var results = {};

    yargs(processArgv.slice(2))
    //        .exitProcess(false)
    .command('echo', 'Echo arguments', function (yargs) {
        return yargs.option("config", {
            alias: "c",
            desc: "The name of the configuration file",
            default: defaults.configFileName
        }).option("text", {
            alias: "t",
            desc: "A text parameter",
            type: 'string',
            default: defaults.docsTemplates
        }).demandOption([]);
    }, function (argv) {
        results = {
            command: {
                name: 'echo',
                args: {
                    text: argv.text
                }
            },
            cliConfig: {
                configFileName: argv.config
            }
        };
    }).demandCommand(1, "Must use a command!").showHelpOnFail(false, 'Specify --help for available options').help().parse();

    return results;
};

module.exports = {
    parse: parse
};