'use strict'

if (process.env.META_SOCKET) {
  let services = exports.services = {}
  let config = exports.config = {}
  let Meta = require('lsq-meta')
  config.get = Meta.config.bind(Meta)
  services.list = Meta.services.bind(Meta)
  services.get = Meta.random.bind(Meta)
}else if (process.env.CONSUL_HOST) {
 module.exports = require('./consul')
}else throw new Error('Missing Meta socket or Consul host')