"use strict";

/**
 * The default configuration for the pmdsHemera adapter
 */
module.exports = {
    pdms: {
        natsUri: process.env.PDMS_NATS_URI || "nats://demo.nats.io:4222",
        timeout: process.env.PDMS_TIMEOUT || 2000
    }
};