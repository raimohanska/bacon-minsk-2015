var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var Bacon = require('baconjs')
var port = process.env.PORT || 3001
var b = Bacon.fromEvent

app.use(express.compress())
app.use(express.json())
app.use('/', express.static(__dirname))
app.use('/baconjs', express.static(__dirname + "/node_modules/baconjs"))

io.on('connection', function(socket){
  console.log('User connected')
  b(socket, "get-mail")
    .flatMap(function() { return Bacon.repeatedly(500, emails) })
    .takeUntil(b(socket, "disconnect"))
    .onValue(socket, "emit", "mail")
})

http.listen(port, function() {
  console.log("presentation running on http://localhost:"+port+"/")
})

emails = [
  "Hello raimo",
  "FREE DIAMONDS!!!",
  "You Won In The Lottery!!!",
  "Virus Alert!",
  "Regarding Bacon.js Enterprise Edition",
  "Why not Angular?",
  "I love you",
  "Virus detected on your hard disk",
  "Free virus scanner",
  "Viagra 50% Discount NOW",
  "ENLARGE your *****",
  "SEX!",
].map(function(subject) { return { subject: subject } })
