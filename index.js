'use strict'
var consul = require('lsq-consul')({ host: process.env.CONSUL_HOST, port: process.env.CONSUL_PORT })
var Promise = require('promise')
var on = require('then-on')

var config = exports.config = {}
config.get = function (cb) { return configData.nodeify(cb) }

var configData = new Promise(function (resolve, reject) {
  consul.kv.get({ key: process.env.SERVICE_NAME }, function (err, result) {
    try {
      if (err) {
        throw err
      } else if (!result) {
        throw new Error('configuration not present')
      } else {
        resolve(JSON.parse(result.Value))
      }
    } catch (e) { reject(e) }
  })
})

config.get(function (err) {
  if (err) console.warn("WARNING: couldn't fetch configuration:", err.stack)
})

var services = exports.services = {}

services.list = function (cb) {
  return new Promise(function (resolve, reject) {
    consul.catalog.service.list(function (err, services) {
      if (err) return reject(err)
      resolve(Object.keys(services).filter(function (x) { return x !== 'consul' }))
    })
  }).nodeify(cb)
}

services.get = function (service, opts, cb) {
  if (typeof service === 'object') {
    cb = opts
    opts = service
    service = null
  }

  if (typeof opts === 'function') {
    cb = opts
    opts = null
  }

  opts = opts || {}
  service = service || opts.service

  if (typeof service !== 'string') {
    throw new TypeError('service name must be a string')
  }

  return getService(service).nodeify(cb)
}

var serviceCache = Object.create(null)
function getService (service) {
  if (service === 'consul') return Promise.resolve(undefined)
  if (serviceCache[service]) return Promise.resolve(serviceCache[service])

  var watcher = consul.watch(consul.catalog.service.nodes, { service: service }, function (err, res) {
    if (err) delete serviceCache[service]
    else serviceCache[service] = normaliseNodes(res)
  })

  return (serviceCache[service] = on(watcher, 'change')).then(normaliseNodes)
}

function normaliseNodes (nodes) {
  var ret = nodes.map(function (node) {
    return {
      hostname: node.ServiceAddress || node.Address,
      port: node.ServicePort,
      toString: function () { return this.hostname + ':' + this.port }
    }
  })

  ret.random = function () {
    return this[Math.random() * this.length | 0]
  }

  // TODO: future awesomeness: return more than one node
  return ret.random()
}
