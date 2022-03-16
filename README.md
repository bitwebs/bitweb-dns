[![deprecated](http://badges.github.io/stability-badges/dist/deprecated.svg)](github.com/bitwebs/dns) See [@web4/dns](github.com/bitwebs/dns) for similar functionality. 
---

# bitweb-dns

Issue DNS lookups for BIT archives using HTTPS requests to the target host. Keeps an in-memory cache of recent lookups.

## API

```js
var bitDns = require('@web4/bitweb-dns')()

// or, if you have a custom protocol
var bitDns = require('@web4/bitweb-dns')({
    recordName: /* name of .well-known file */
    protocolRegex: /* RegExp object for custom protocol */,
    hashRegex: /* RegExp object for custom hash i.e. */,
    txtRegex: /* RegExp object for DNS TXT record of custom protocol */,
})

// example: 
var cabalDns = require('@web4/bitweb-dns')({
    recordName: 'cabal',
    hashRegex: /^[0-9a-f]{64}?$/i,
    protocolRegex: /^cabal:\/\/([0-9a-f]{64})/i,
    txtRegex: /^"?cabalkey=([0-9a-f]{64})"?$/i
})

// resolve a name: pass the hostname by itself
bitDns.resolveName('foo.com', function (err, key) { ... })
bitDns.resolveName('foo.com').then(key => ...)

// dont use cached 'misses'
bitDns.resolveName('foo.com', {ignoreCachedMiss: true})

// dont use the cache at all
bitDns.resolveName('foo.com', {ignoreCache: true})

// dont use dns-over-https
bitDns.resolveName('foo.com', {noDnsOverHttps: true})

// dont use .well-known/bit
bitDns.resolveName('foo.com', {noWellknownBit: true})

// list all entries in the cache
bitDns.listCache()

// clear the cache
bitDns.flushCache()

// configure the DNS-over-HTTPS host used
var bitDns = require('@web4/bitweb-dns')({
  dnsHost: 'dns.google.com',
  dnsPath: '/resolve'
})

// use a persistent fallback cache
// (this is handy for persistent dns data when offline)
var bitDns = require('@web4/bitweb-dns')({
  persistentCache: {
    read: async (name, err) => {
      // try lookup
      // if failed, you can throw the original error:
      throw err
    },
    write: async (name, key, ttl) => {
      // write to your cache
    }
  }
})

// emits some events, mainly useful for logging/debugging
bitDns.on('resolved', ({method, name, key}) => {...})
bitDns.on('failed', ({method, name, err}) => {...})
bitDns.on('cache-flushed', () => {...})
```

## Spec
**Option 1 (DNS-over-HTTPS).** Create a DNS TXT record witht he following schema:

```
bitkey={key}
```

**Option 2 (.well-known/bit).** Place a file at `/.well-known/bit` with the following schema:

```
{bit-url}
TTL={time in seconds}
```

TTL is optional and will default to `3600` (one hour). If set to `0`, the entry is not cached.
