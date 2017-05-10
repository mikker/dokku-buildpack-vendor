'use strict'

const pino = require('pino')()
const log = require('pino-http')({logger: pino})
const http = require('http')
const https = require('https')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')

const port = process.env.PORT || 3000

const server = http.createServer(handle)

server.listen(port, err => {
  if (err) return pino.error(err)
  pino.info(`Ready at :${port}`)
})

function handle (req, res) {
  log(req, res)

  if (req.url === '/') {
    res.write('ok')
    res.end()
    return
  }

  const localPath = `/tmp${req.url}`

  fs.open(localPath, 'r', (err, fd) => {
    if (err && err.code === 'ENOENT') {
      pino.info('No local version present, fetching...')

      const url = `https://s3.amazonaws.com${req.url}`
      mkdirp.sync(path.dirname(localPath))
      const localFile = fs.createWriteStream(localPath)

      const get = https.get(url, proxyRes => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers)
        proxyRes.pipe(res, {end: true})
        proxyRes.pipe(localFile)
      })

      get.on('error', err => {
        pino.error(err)
      })

      return
    }

    if (err) throw err

    pino.info('Cached file found, sending ...')

    const readStream = fs.createReadStream(undefined, {fd: fd})
    const stat = fs.statSync(localPath)

    res.writeHead(200, {
      'Content-Type': 'application/x-gzip',
      'Content-Length': stat.size
    })

    readStream.pipe(res, {end: true})
  })
}
