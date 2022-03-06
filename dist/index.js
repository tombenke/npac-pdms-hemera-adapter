#!/usr/bin/env node

/*jshint node: true */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _natsHemera = require('nats-hemera');

var _natsHemera2 = _interopRequireDefault(_natsHemera);

var _nats = require('nats');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//let hemera = null

var mkHemeraLogger = function mkHemeraLogger(container) {
    return new (function () {
        function Logger() {
            _classCallCheck(this, Logger);
        }

        _createClass(Logger, [{
            key: 'info',
            value: function info() {
                for (var _len = arguments.length, msg = Array(_len), _key = 0; _key < _len; _key++) {
                    msg[_key] = arguments[_key];
                }

                container.logger.info('hemera: ' + JSON.stringify(msg, null, ''));
            }
        }, {
            key: 'warn',
            value: function warn(msg) {
                container.logger.warn('hemera: ' + JSON.stringify(msg, null, ''));
            }
        }, {
            key: 'debug',
            value: function debug(msg) {
                //container.logger.debug(`hemera: ${JSON.stringify(msg, null, '')}`)
            }
        }, {
            key: 'trace',
            value: function trace(msg) {
                container.logger.verbose('hemera: ' + JSON.stringify(msg, null, ''));
            }
        }, {
            key: 'error',
            value: function error(msg) {
                container.logger.error('hemera: ' + JSON.stringify(msg, null, ''));
            }
        }, {
            key: 'fatal',
            value: function fatal(msg) {
                container.logger.error('hemera: ' + JSON.stringify(msg, null, ''));
            }
        }]);

        return Logger;
    }())();
};

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
var startup = function startup(container, next) {
    // Merges the defaults with the config coming from the outer world
    var pdmsConfig = _lodash2.default.merge({}, _config2.default, { pdms: container.config.pdms || {} });
    container.logger.info('pdms: Start up');

    var natsConnection = (0, _nats.connect)({ url: pdmsConfig.pdms.natsUri });
    var hemera = new _natsHemera2.default(natsConnection, {
        logLevel: container.logger.level,
        logger: mkHemeraLogger(container),
        bloomrun: {
            indexing: 'depth'
        },
        timeout: pdmsConfig.pdms.timeout
    });

    hemera.ready(function () {
        container.logger.info('pdms: Connected to NATS');

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
                request: function request(topic, payload, responseCallback) {
                    container.logger.debug('pdms: request(' + topic + ', ' + payload + ')');
                    natsConnection.request(topic, payload, {}, responseCallback);
                },
                response: function response(topic, makeResponse) {
                    return natsConnection.subscribe(topic, function (requestPayload, replyTo) {
                        container.logger.debug('pdms: response(' + topic + ', ' + requestPayload + ')');
                        var responsePayload = makeResponse(requestPayload);
                        container.logger.debug('pdms: makeResponse() => ' + responsePayload);
                        natsConnection.publish(replyTo, responsePayload);
                    });
                }
            }
        });
    });
};

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
var shutdown = function shutdown(container, next) {
    container.pdms.flush();
    container.pdms.hemera.close();
    container.logger.info('pdms: Shutting down');
    next(null, null);
};

module.exports = {
    defaults: _config2.default,
    startup: startup,
    shutdown: shutdown
};