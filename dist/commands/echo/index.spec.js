'use strict';

var _npac = require('npac');

var _npac2 = _interopRequireDefault(_npac);

var _chai = require('chai');

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

var _index = require('./index');

var echo = _interopRequireWildcard(_index);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
import fs from 'fs'
import rimraf from 'rimraf'
import path from 'path'
import {
    loadJsonFileSync,
    mergeJsonFilesSync,
    listFilesSync,
    findFilesSync
} from 'datafile'
*/

describe('commands/echo', function () {

    /*
    const testDirectory = path.resolve('./tmp')
    const destCleanup = function(cb) {
        const dest = testDirectory
        rimraf(dest, cb)
    }
     beforeEach(function(done) {
        console.log('beforeEach', testDirectory)
        destCleanup(function() {
            fs.mkdirSync(testDirectory)
            done()
        })
    })
     afterEach(function(done) {
        console.log('afterEach')
        destCleanup(done)
    })
    */

    var echoContainer = {
        config: _.merge({}, _config2.default, {/* Add command specific config parameters */})
    };
    var textToEcho = "Hello World!";
    var echoCommand = {
        name: 'echo',
        args: { text: textToEcho }
    };

    it('echo - execute', function (done) {
        var executives = { echo: echo.execute };

        _npac2.default.runJobSync(echoContainer.config, executives, echoCommand, function (err, res) {
            (0, _chai.expect)(err).to.equal(null);
            done();
        });
    });
});