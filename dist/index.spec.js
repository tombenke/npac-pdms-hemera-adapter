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
    /*
    it('#startup, #shutdown', (done) => {
        catchExitSignals(sandbox, done)
         const adapters = [mergeConfig(config), addLogger, pdms.startup]
         const testPdms = (container, next) => {
            container.logger.info(`Run job to test pdms`)
            next(null, null)
        }
         const terminators = [pdms.shutdown]
         npacStart(adapters, [testPdms], terminators, (err, res) => {
            if (err) {
                throw err
            } else {
                process.kill(process.pid, 'SIGTERM')
            }
        })
    })
     it('call pdms service', (done) => {
        catchExitSignals(sandbox, done)
         const getMonitoringIsAlive = (req, cb) => {
            cb(null, {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: {
                    status: 'OK'
                }
            })
        }
         const monitoringAdapter = (container, next) => {
            // Add built-in monitoring service
            container.pdms.add(
                { topic: '/monitoring/isAlive', method: 'get', uri: '/monitoring/isAlive' },
                function (data, cb) {
                    container.logger.info(
                        `Monitoring handler called with ${JSON.stringify(data.request, null, '')}, ${data.method}, ${
                            data.uri
                        }, ...`
                    )
                    getMonitoringIsAlive(data.request, cb)
                }
            )
            next(null, {})
        }
         const adapters = [
            mergeConfig(
                _.merge({}, config, {
                    pdms: { natsUri: 'nats://localhost:4222' }
                })
            ),
            addLogger,
            pdms.startup,
            monitoringAdapter
        ]
         const testPdms = (container, next) => {
            container.logger.info(`Run job to test pdms`)
            container.pdms.act(
                {
                    topic: '/monitoring/isAlive',
                    method: 'get',
                    uri: '/monitoring/isAlive',
                    request: {
                        parameters: {},
                        body: {}
                    }
                },
                (err, resp) => {
                    container.logger.info(`RES ${JSON.stringify(resp, null, '')}`)
                    next(err, resp)
                }
            )
        }
         const terminators = [pdms.shutdown]
         npacStart(adapters, [testPdms], terminators)
    })
     it('call pdms service - increased timeout', (done) => {
        catchExitSignals(sandbox, done)
         const longRunningTask = (req, cb) => {
            setTimeout(function () {
                cb(null, {
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    body: {
                        status: 'OK'
                    }
                })
            }, 3000)
        }
         const longRunningTaskAdapter = (container, next) => {
            // Add built-in monitoring service
            container.pdms.add(
                { topic: '/long/running/task', method: 'get', uri: '/long/running/task' },
                function (data, cb) {
                    container.logger.info(
                        `Monitoring handler called with ${JSON.stringify(data.request, null, '')}, ${data.method}, ${
                            data.uri
                        }, ...`
                    )
                    longRunningTask(data.request, cb)
                }
            )
            next(null, {})
        }
         const adapters = [
            mergeConfig(_.merge({}, config, { pdms: { timeout: 4000 } })),
            addLogger,
            pdms.startup,
            longRunningTaskAdapter
        ]
         const testPdms = (container, next) => {
            container.logger.info(`Run job to test pdms`)
            container.pdms.act(
                {
                    topic: '/long/running/task',
                    method: 'get',
                    uri: '/long/running/task',
                    request: {
                        parameters: {},
                        body: {}
                    }
                },
                (err, resp) => {
                    container.logger.info(`RES ${JSON.stringify(resp, null, '')}`)
                    next(err, resp)
                }
            )
        }
         const terminators = [pdms.shutdown]
         npacStart(adapters, [testPdms], terminators)
    }).timeout(15000)
     it('#publish, #subscribe', (done) => {
        catchExitSignals(sandbox, done)
         const adapters = [mergeConfig(config), addLogger, pdms.startup]
         const payload = { note: 'text...', number: 42, floatValue: 42.24 }
        const topic = 'test-topic'
         const testPdms = (container, next) => {
            container.logger.info(`Run job to test pdms`)
            container.pdms.subscribe(topic, (msg) => {
                const receivedPayload = JSON.parse(msg)
                container.logger.info(`test: received msg: ${msg}`)
                expect(payload).to.eql(receivedPayload)
                next(null, null)
            })
            container.pdms.publish(topic, JSON.stringify(payload))
        }
         const terminators = [pdms.shutdown]
         npacStart(adapters, [testPdms], terminators, (err, res) => {
            if (err) {
                throw err
            } else {
                process.kill(process.pid, 'SIGTERM')
            }
        })
    })
    */
    it('#request, #response', function (done) {
        (0, _npac.catchExitSignals)(sandbox, done);

        var adapters = [(0, _npac.mergeConfig)(config), _npac.addLogger, pdms.startup];

        var payload = { note: 'text...', number: 42, floatValue: 42.24 };
        var topic = 'test-topic';

        var testPdms = function testPdms(container, next) {
            container.logger.info('test: Run job to test pdms');
            container.pdms.response(topic, function (requestPayload) {
                container.logger.info('test: received request: ' + requestPayload);
                return requestPayload;
            });

            container.logger.info('test: send request(' + topic + ', ' + JSON.stringify(payload) + ')');
            container.pdms.request(topic, JSON.stringify(payload), function (response) {
                var receivedPayload = JSON.parse(response);
                container.logger.info('test: received response: ' + response);
                (0, _chai.expect)(payload).to.eql(receivedPayload);
                next(null, null);
            });
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