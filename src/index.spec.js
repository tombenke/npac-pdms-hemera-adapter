import { expect } from 'chai'
import sinon from 'sinon'
import { addLogger, mergeConfig, removeSignalHandlers, catchExitSignals, npacStart } from 'npac'
import defaults from './config'
import * as pdms from './index'
import * as _ from 'lodash'

describe('pdms', () => {
    let sandbox = sinon

    beforeEach((done) => {
        removeSignalHandlers()
        done()
    })

    afterEach((done) => {
        removeSignalHandlers()
        sandbox.restore()
        done()
    })

    const config = _.merge({}, defaults, {
        /* Add command specific config parameters */
    })

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
})
