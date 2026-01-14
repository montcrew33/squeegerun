const http = require('http')

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(`
    <html>
      <body>
        <h1>Test Server Working</h1>
        <p>This confirms basic server connectivity works</p>
        <p>Time: ${new Date().toISOString()}</p>
        <p>URL: ${req.url}</p>
      </body>
    </html>
  `)
})

const port = 3005
server.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`)
})

// Keep server alive for 30 seconds
setTimeout(() => {
  console.log('Shutting down test server')
  server.close()
}, 30000)