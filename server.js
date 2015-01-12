var express = require('express')
var port = process.env.PORT || 3001
var app = express()

app.use(express.compress())
app.use(express.json())
app.use('/', express.static(__dirname))
app.listen(port)
