npac-pdms-hemera-adapter
========================

[![Quality Check Actions Status](https://github.com/tombenke/npac-pdms-hemera-adapter/workflows/Quality%20Check/badge.svg)](https://github.com/tombenke/npac-pdms-hemera-adapter)
[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)
[![npm version][npm-badge]][npm-url]

## About

npac adapter with pdms api, using Hemera.js

## Installation

Run the install command:

    npm install --save npac-pdms-hemera-adapter

## Configuration

This module uses the `config.pdms` property to gain its configuration parameters.

The default parameters can be found in [`src/config.js`](src/config.js):

```JavaScript
{
    pdms: {
        natsUri: process.env.PDMS_NATS_URI || "nats://demo.nats.io:4222"
    }
}
```

## Get Help

To learn more about the tool visit the [homepage](http://tombenke.github.io/npac-pdms-hemera-adapter/api/).

## References

- [npac](http://tombenke.github.io/npac).

---

This project was generated from the [ncli-archetype](https://github.com/tombenke/ncli-archetype)
project archetype, using the [kickoff](https://github.com/tombenke/kickoff) utility.

[npm-badge]: https://badge.fury.io/js/npac-pdms-hemera-adapter.svg
[npm-url]: https://badge.fury.io/js/npac-pdms-hemera-adapter
[travis-badge]: https://api.travis-ci.org/tombenke/npac-pdms-hemera-adapter.svg
[travis-url]: https://travis-ci.org/tombenke/npac-pdms-hemera-adapter
[Coveralls]: https://coveralls.io/github/tombenke/npac-pdms-hemera-adapter?branch=master
[BadgeCoveralls]: https://coveralls.io/repos/github/tombenke/npac-pdms-hemera-adapter/badge.svg?branch=master
