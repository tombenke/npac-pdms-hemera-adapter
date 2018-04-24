import sinon from 'sinon'
import npac from 'npac'
//import { expect } from 'chai'
import defaults from './config'
import * as pdms from './index'
import * as _ from 'lodash'

describe('pdms', () => {
    let sandbox

    beforeEach(done => {
        sandbox = sinon.sandbox.create({ useFakeTimers: false })
        done()
    })

    afterEach(done => {
        const signals = ['SIGTERM', 'SIGINT', 'SIGHUP', 'SIGUSR1', 'SIGUSR2']
        for(const signal in signals) {
            process.removeAllListeners(signals[signal])
        }
        sandbox.restore()
        done()
    })

    const config = _.merge({}, defaults, { /* Add command specific config parameters */ })

    it('#startup, #shutdown', (done) => {
        sandbox.stub(process, 'exit').callsFake((signal) => {
            done()
        })

        const adapters = [
            npac.mergeConfig(config),
            npac.addLogger,
            pdms.startup
        ]

        const testPdms = (container, next) => {
            container.logger.info(`Run job to test pdms`)
            // TODO: Implement endpoint testing
            next(null, null)
        }

        const terminators = [
            pdms.shutdown
        ]

        npac.start(adapters, [testPdms], terminators, (err, res) => {
            if (err) {
                throw(err)
            } else {
                process.kill(process.pid, 'SIGTERM')
            }
        })
    })

    it('call pdms service', (done) => {
        sandbox.stub(process, 'exit').callsFake((signal) => {
            done()
        })

        const getMonitoringIsAlive = (req, cb) => {
            cb(null, {
                headers: {
                    "Content-Type": "pplication/json; charset=utf-8"
                },
                body: {
                    status: "OK"
                }
            })
        }

        const monitoringAdapter = (container, next) => {
            // Add built-in monitoring service
            container.pdms.add({ topic: "/monitoring/isAlive", method: "get", uri: "/monitoring/isAlive" }, function (data, cb) {
                container.logger.info(`Monitoring handler called with ${JSON.stringify(data.request, null, '')}, ${data.method}, ${data.uri}, ...`)
                getMonitoringIsAlive(data.request, cb)
            })
            next(null, {})
        }

        const adapters = [
            npac.mergeConfig(config),
            npac.addLogger,
            pdms.startup,
            monitoringAdapter
        ]

        const testPdms = (container, next) => {
            container.logger.info(`Run job to test pdms`)
            container.pdms.act({
                topic: "/monitoring/isAlive",
                method: "get",
                uri: "/monitoring/isAlive",
                request: {
                    parameters: {
                    },
                    body: {}
                }
            }, (err, resp) => {
                container.logger.info(`RES ${JSON.stringify(resp, null, '')}`)
                next(err, resp)
            })
        }

        const terminators = [
            pdms.shutdown
        ]

        npac.start(adapters, [testPdms], terminators, (err, res) => {
            if (err) {
                throw(err)
            } else {
                process.kill(process.pid, 'SIGTERM')
            }
        })
    })
})
