const app = require('express')()

app.get('*', (req, res) => {
  console.log(req.url)
  res.write(JSON.stringify(req.url))
  res.end()
})

const port = process.env.PORT || 3000
app.listen(port, err => {
  if (err) throw new Error(err)
  console.log(`Ready at ${port}`)
})
