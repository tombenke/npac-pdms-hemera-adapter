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
})
