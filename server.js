'use strict'

const pino = require('pino')()
const http = require('http')
const https = require('https')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')

const port = process.env.PORT || 3000

http
  .createServer((req, res) => {
    pino.info(req)

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

        get.on('end', () => {
          pino.info('Done fetching!')
        })

        return
      }

      if (err) throw err

      const readStream = fs.createReadStream(undefined, {fd: fd})

      readStream.pipe(res, {end: true})
    })
  })
  .listen(port, err => {
    if (err) throw new Error(err)
    pino.info(`Ready at ${port}`)
  })
