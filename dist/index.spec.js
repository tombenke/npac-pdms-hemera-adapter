'use strict';

var _chai = require('chai');

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _npac = require('npac');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _index = require('./index');

var pdms = _interopRequireWildcard(_index);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('pdms', function () {
    var sandbox = _sinon2.default;

    beforeEach(function (done) {
        (0, _npac.removeSignalHandlers)();
        done();
    });

    afterEach(function (done) {
        (0, _npac.removeSignalHandlers)();
        sandbox.restore();
        done();
    });

    var config = _.merge({}, _config2.default, {
        /* Add command specific config parameters */
    });

    it('#startup, #shutdown', function (done) {
        (0, _npac.catchExitSignals)(sandbox, done);

        var adapters = [(0, _npac.mergeConfig)(config), _npac.addLogger, pdms.startup];

        var testPdms = function testPdms(container, next) {
            container.logger.info('Run job to test pdms');
            next(null, null);
        };

        var terminators = [pdms.shutdown];

        (0, _npac.npacStart)(adapters, [testPdms], terminators, function (err, res) {
            if (err) {
                throw err;
            } else {
                process.kill(process.pid, 'SIGTERM');
            }
        });
    });

    it('call pdms service', function (done) {
        (0, _npac.catchExitSignals)(sandbox, done);

        var getMonitoringIsAlive = function getMonitoringIsAlive(req, cb) {
            cb(null, {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: {
                    status: 'OK'
                }
            });
        };

        var monitoringAdapter = function monitoringAdapter(container, next) {
            // Add built-in monitoring service
            container.pdms.add({ topic: '/monitoring/isAlive', method: 'get', uri: '/monitoring/isAlive' }, function (data, cb) {
                container.logger.info('Monitoring handler called with ' + JSON.stringify(data.request, null, '') + ', ' + data.method + ', ' + data.uri + ', ...');
                getMonitoringIsAlive(data.request, cb);
            });
            next(null, {});
        };

        var adapters = [(0, _npac.mergeConfig)(_.merge({}, config, {
            pdms: { natsUri: 'nats://localhost:4222' }
        })), _npac.addLogger, pdms.startup, monitoringAdapter];

        var testPdms = function testPdms(container, next) {
            container.logger.info('Run job to test pdms');
            container.pdms.act({
                topic: '/monitoring/isAlive',
                method: 'get',
                uri: '/monitoring/isAlive',
                request: {
                    parameters: {},
                    body: {}
                }
            }, function (err, resp) {
                container.logger.info('RES ' + JSON.stringify(resp, null, ''));
                next(err, resp);
            });
        };

        var terminators = [pdms.shutdown];

        (0, _npac.npacStart)(adapters, [testPdms], terminators);
    });

    it('call pdms service - increased timeout', function (done) {
        (0, _npac.catchExitSignals)(sandbox, done);

        var longRunningTask = function longRunningTask(req, cb) {
            setTimeout(function () {
                cb(null, {
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    body: {
                        status: 'OK'
                    }
                });
            }, 3000);
        };

        var longRunningTaskAdapter = function longRunningTaskAdapter(container, next) {
            // Add built-in monitoring service
            container.pdms.add({ topic: '/long/running/task', method: 'get', uri: '/long/running/task' }, function (data, cb) {
                container.logger.info('Monitoring handler called with ' + JSON.stringify(data.request, null, '') + ', ' + data.method + ', ' + data.uri + ', ...');
                longRunningTask(data.request, cb);
            });
            next(null, {});
        };

        var adapters = [(0, _npac.mergeConfig)(_.merge({}, config, { pdms: { timeout: 4000 } })), _npac.addLogger, pdms.startup, longRunningTaskAdapter];

        var testPdms = function testPdms(container, next) {
            container.logger.info('Run job to test pdms');
            container.pdms.act({
                topic: '/long/running/task',
                method: 'get',
                uri: '/long/running/task',
                request: {
                    parameters: {},
                    body: {}
                }
            }, function (err, resp) {
                container.logger.info('RES ' + JSON.stringify(resp, null, ''));
                next(err, resp);
            });
        };

        var terminators = [pdms.shutdown];

        (0, _npac.npacStart)(adapters, [testPdms], terminators);
    }).timeout(15000);

    it('#publish, #subscribe', function (done) {
        (0, _npac.catchExitSignals)(sandbox, done);

        var adapters = [(0, _npac.mergeConfig)(config), _npac.addLogger, pdms.startup];

        var payload = { note: 'text...', number: 42, floatValue: 42.24 };
        var topic = 'test-topic';

        var testPdms = function testPdms(container, next) {
            container.logger.info('Run job to test pdms');
            container.pdms.subscribe(topic, function (msg) {
                var receivedPayload = JSON.parse(msg);
                container.logger.info('test: received msg: ' + msg);
                (0, _chai.expect)(payload).to.eql(receivedPayload);
                next(null, null);
            });
            container.pdms.publish(topic, JSON.stringify(payload));
        };

        var terminators = [pdms.shutdown];

        (0, _npac.npacStart)(adapters, [testPdms], terminators, function (err, res) {
            if (err) {
                throw err;
            } else {
                process.kill(process.pid, 'SIGTERM');
            }
        });
    });
});