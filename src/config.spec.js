import { expect } from 'chai'
import config from './config'

before((done) => {
    done()
})
after((done) => {
    done()
})

describe('pmdsHemera.config', () => {
    it('#defaults', (done) => {
        const expected = {
            pdms: {
                natsUri: 'nats://localhost:4222',
                timeout: 2000
            }
        }

        const defaults = config
        expect(defaults).to.eql(expected)
        done()
    })
})
