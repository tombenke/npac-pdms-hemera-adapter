'use strict';

var _chai = require('chai');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _cli = require('./cli');

var _cli2 = _interopRequireDefault(_cli);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

before(function (done) {
    done();
});

after(function (done) {
    done();
});

describe('cli', function () {

    it('echo', function (done) {
        var textToEcho = "Hello World!";
        var processArgv = ['node', 'src/index.js', 'echo', '-t', textToEcho];
        var expected = {
            command: {
                name: 'echo',
                args: { text: textToEcho }
            },
            cliConfig: {
                configFileName: "config.yml"
            }
        };

        (0, _chai.expect)(_cli2.default.parse(_config2.default, processArgv)).to.eql(expected);
        done();
    });
});