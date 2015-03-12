# lsq

  The programmatic interface to the lsq.io runtime environment.

## API
```js
var lsq = require('lsq')
```

  All methods are asynchronous, and take a node-style error-first callback as last argument.
  If no callback is supplied, a promise is returned instead.

### lsq.config.get() -> JSON

  Fetches the JSON configuration for the current service.

### lsq.services.list() -> Array<String>

  Returns all the currently known service names.

### lsq.services.get(service: String) -> Service

  Retrieves a particular service.

### Service

  * `hostname`: String // the hostname or IP address of the service
  * `port`: Integer // the port of the service
  * `toString() { return this.hostname + ':' + this.port }`
