var tape = require('tape')
var createBitDNS = require('./index')
var bitDns = createBitDNS()
var socialDns = createBitDNS({
    hashRegex: /^[0-9a-f]{64}?$/i,
    recordName: 'cabal',
    protocolRegex: /^cabal:\/\/([0-9a-f]{64})/i,
    txtRegex: /^"?cabalkey=([0-9a-f]{64})"?$/i
})

var FAKE_BIT = 'f'.repeat(64)

tape('Successful test against cblgh.org', function (t) {
  socialDns.resolveName('cblgh.org', function (err, name) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    socialDns.resolveName('cblgh.org').then(function (name2) {
      t.equal(name, name2)
      t.end()
    })
  })
})

tape('Works for keys', function (t) {
  socialDns.resolveName('14bc77d788fdaf07b89b28e9d276e47f2e44011f4adb981921056e1b3b40e99e', function (err, name) {
    t.error(err)
    t.equal(name, '14bc77d788fdaf07b89b28e9d276e47f2e44011f4adb981921056e1b3b40e99e')
    t.end()
  })
})

tape('Successful test against bitwebs.org', function (t) {
  bitDns.resolveName('bitwebs.org', function (err, name) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    bitDns.resolveName('bitwebs.org').then(function (name2) {
      t.equal(name, name2)
      t.end()
    })
  })
})

tape('Works for keys', function (t) {
  bitDns.resolveName('40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9', function (err, name) {
    t.error(err)
    t.equal(name, '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9')
    t.end()
  })
})

tape('Works for versioned keys and URLs', function (t) {
    bitDns.resolveName('40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9+5', function (err, name) {
      t.error(err)
      t.equal(name, '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9')

      bitDns.resolveName('bitwebs.org+5', function (err, name) {
        t.error(err)
        t.ok(/[0-9a-f]{64}/.test(name))
        t.end()
      })
    })
})

tape('Works for non-numeric versioned keys and URLs', function (t) {
    bitDns.resolveName('40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9+foo', function (err, name) {
      t.error(err)
      t.equal(name, '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9')

      bitDns.resolveName('bitwebs.org+foo', function (err, name) {
        t.error(err)
        t.ok(/[0-9a-f]{64}/.test(name))
        t.end()
      })
    })
})

tape('Works for full URLs', function (t) {
  bitDns.resolveName('bit://40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9', function (err, name) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    bitDns.resolveName('bit://bitwebs.org/foo.txt?bar=baz', function (err, name) {
      t.error(err)
      t.ok(/[0-9a-f]{64}/.test(name))
      t.end()
    })
  })
})

tape('A bad hostname fails gracefully', function (t) {
  bitDns.resolveName('example.com', {ignoreCache: true}, function (err, name) {
    t.ok(err)
    t.notOk(name)

    bitDns.resolveName(1234, function (err, name) {
      t.ok(err)
      t.notOk(name)

      bitDns.resolveName('foo bar', {ignoreCache: true}, function (err, name) {
        t.ok(err)
        t.notOk(name)

        t.end()
      })
    })
  })
})

tape('A bad DNS record fails gracefully', function (t) {
  bitDns.resolveName('bad-bit-record1.beakerbrowser.com', {ignoreCache: true}, function (err, name) {
    t.ok(err)
    t.notOk(name)
    t.end()
  })
})

tape('Unqualified domain fails gracefully', function (t) {
  bitDns.resolveName('bad-bit-domain-name', {ignoreCache: true}, function (err, name) {
    t.ok(err)
    t.notOk(name)
    t.end()
  })
})

tape('Successful test against dns-test-setup.bitwebs.org', function (t) {
  bitDns.resolveName('dns-test-setup.bitwebs.org', {ignoreCache: true}, function (err, name) {
    t.error(err)
    t.equals(name, '444231b5589a5099aa3610a8ee550dcd454c3e33f4cac93b7d41b6b850cde444')

    bitDns.resolveName('dns-test-setup.bitwebs.org').then(function (name2) {
      t.equal(name, name2)
      t.end()
    }).catch(function (err) {
      t.error(err)
      t.end()
    })
  })
})

tape('Successful test against dns-test-setup.bitwebs.org (no dns-over-https)', function (t) {
  bitDns.resolveName('dns-test-setup.bitwebs.org', {noDnsOverHttps: true, ignoreCache: true})
    .then(function (name) {
      t.equals(name, '111231b5589a5099aa3610a8ee550dcd454c3e33f4cac93b7d41b6b850cde111')
      return bitDns.resolveName('dns-test-setup.bitwebs.org')
        .then(function (name2) {
          t.equal(name, name2)
        })
    })
    .then(
      function () { t.end() },
      function (err) {
        t.error(err)
        t.end()
      }
    )
})

createBitDNS.DEFAULT_DNS_PROVIDERS.forEach(function (provider) {
  const dns = createBitDNS({
    dnsHost: provider[0],
    dnsPort: provider[1],
    dnsPath: provider[2]
  })
  tape('Successful test against dns-test-setup.bitwebs.org (no well-known/bit) (' + provider[0] + ':' + provider[1] + provider[2] + ')', function (t) {
    dns.resolveName('dns-test-setup.bitwebs.org', {noWellknownBit: true, ignoreCache: true})
      .then(function (name) {
        t.equal(name, '444231b5589a5099aa3610a8ee550dcd454c3e33f4cac93b7d41b6b850cde444' /* the second txt entry */)
        return dns.resolveName('dns-test-setup.bitwebs.org')
          .then(function (name2) {
            t.equal(name, name2, 'cache test')
          })
      })
      .then(
        function () { t.end() },
        function (err) {
          t.error(err)
          t.end()
        }
      )
  })
})

tape('Successful test against dns-test-setup.bitwebs.org (no well-known/bit)', function (t) {
  bitDns.resolveName('dns-test-setup.bitwebs.org', {noWellknownBit: true, ignoreCache: true}, function (err, name) {
    t.error(err)
    t.equal(name, '444231b5589a5099aa3610a8ee550dcd454c3e33f4cac93b7d41b6b850cde444' /* the second txt entry */)

    bitDns.resolveName('dns-test-setup.bitwebs.org').then(function (name2) {
      t.equal(name, name2)
      t.end()
    }).catch(function (err) {
      t.error(err)
      t.end()
    })
  })
})

tape('List cache', function (t) {
  t.is(Object.keys(bitDns.listCache()).length, 6)
  t.end()
})

tape('Persistent fallback cache', function (t) {
  t.plan(8)

  var persistentCache = {
    read: function (name, err) {
      if (name === 'foo') return '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9'
      throw err
    },
    write: function (name, key, ttl) {
      t.deepEqual(name, 'bitwebs.org')
      t.ok(/[0-9a-f]{64}/.test(key))
    }
  }

  var bitDns = createBitDNS({persistentCache})

  bitDns.resolveName('bitwebs.org', function (err, key) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(key))

    bitDns.resolveName('foo', function (err, key) {
      t.error(err)
      t.deepEqual(key, '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9')

      bitDns.resolveName('bar', function (err, key) {
        t.ok(err)
        t.notOk(key)

        t.end()
      })
    })
  })
})

tape('Persistent fallback cache doesnt override live results', function (t) {
  var persistentCache = {
    read: function (name, err) {
      if (name === 'bitwebs.org') return 'from-cache'
      throw err
    },
    write: function (name, key, ttl) {}
  }

  var bitDns = createBitDNS({persistentCache})

  bitDns.resolveName('bitwebs.org', function (err, key) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(key))
    t.end()
  })
})
