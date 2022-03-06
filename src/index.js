#!/usr/bin/env node
/*jshint node: true */
'use strict'

import Hemera from 'nats-hemera'
import { connect } from 'nats'
import defaults from './config'
import _ from 'lodash'

//let hemera = null

const mkHemeraLogger = (container) => {
    return new (class Logger {
        info(...msg) {
            container.logger.info(`hemera: ${JSON.stringify(msg, null, '')}`)
        }
        warn(msg) {
            container.logger.warn(`hemera: ${JSON.stringify(msg, null, '')}`)
        }
        debug(msg) {
            //container.logger.debug(`hemera: ${JSON.stringify(msg, null, '')}`)
        }
        trace(msg) {
            container.logger.verbose(`hemera: ${JSON.stringify(msg, null, '')}`)
        }
        error(msg) {
            container.logger.error(`hemera: ${JSON.stringify(msg, null, '')}`)
        }
        fatal(msg) {
            container.logger.error(`hemera: ${JSON.stringify(msg, null, '')}`)
        }
    })()
}

/**
 * The startup function of the pdmsHemera adapter
 *
 * This function should be registered with the startup phase, then npac will call when the project is starting.
 *
 * @arg {Object} container  - The actual state of the container this adapter will be added
 * @arg {Function} next     - Error-first callback function to pass the result partial container extended with the pdmsHemera adapter.
 *
 * see also: the `npac.startup` process description.
 *
 * @function
 */
const startup = (container, next) => {
    // Merges the defaults with the config coming from the outer world
    const pdmsConfig = _.merge({}, defaults, { pdms: container.config.pdms || {} })
    container.logger.info(`pdms: Start up`)

    const natsConnection = connect({ url: pdmsConfig.pdms.natsUri })
    const hemera = new Hemera(natsConnection, {
        logLevel: container.logger.level,
        logger: mkHemeraLogger(container),
        bloomrun: {
            indexing: 'depth'
        },
        timeout: pdmsConfig.pdms.timeout
    })

    hemera.ready(() => {
        container.logger.info('pdms: Connected to NATS')

        // Call next setup function with the context extension
        next(null, {
            config: pdmsConfig,
            pdms: {
                hemera: hemera,
                add: hemera.add.bind(hemera),
                act: hemera.act.bind(hemera),
                flush: natsConnection.flush.bind(natsConnection),
                publish: natsConnection.publish.bind(natsConnection),
                subscribe: natsConnection.subscribe.bind(natsConnection),
                request: (topic, payload, responseCallback) => {
                    container.logger.debug(`pdms: request(${topic}, ${payload})`)
                    natsConnection.request(topic, payload, {}, responseCallback)
                },
                response: (topic, makeResponse) =>
                    natsConnection.subscribe(topic, (requestPayload, replyTo) => {
                        container.logger.debug(`pdms: response(${topic}, ${requestPayload})`)
                        const responsePayload = makeResponse(requestPayload)
                        container.logger.debug(`pdms: makeResponse() => ${responsePayload}`)
                        natsConnection.publish(replyTo, responsePayload)
                    })
            }
        })
    })
}

/**
 * The shutdown function of the pdmsHemera adapter
 *
 * This function should be registered with the shutdown phase, then npac will call when graceful shutdown happens.
 *
 * @arg {Object} container  - The actual state of the container this adapter is running
 * @arg {Function} next     - Error-first callback function to pass the result partial container extended with the pdmsHemera adapter.
 *
 * see also: the `npac.startup` process description.
 *
 * @function
 */
const shutdown = (container, next) => {
    container.pdms.flush()
    container.pdms.hemera.close()
    container.logger.info('pdms: Shutting down')
    next(null, null)
}

module.exports = {
    defaults: defaults,
    startup: startup,
    shutdown: shutdown
}
