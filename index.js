'use strict'

if (process.env.META_SOCKET) {
  let services = exports.services = {}
  let config = exports.config = {}
  let Meta = require('./meta')
  config.get = Meta.config.bind(Meta)
  services.list = Meta.services.bind(Meta)
  services.get = Meta.service.bind(Meta)
}else if (process.env.CONSUL_HOST) {
 module.exports = require('./consul')
}else throw new Error('Missing Meta socket or Consul host')