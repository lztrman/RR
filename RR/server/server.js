const express = require('express')
var path = require('path') 
var rooms = []

// keep a reference of all socket connections
var connectedPeers = new Map()

var io = require('socket.io')
({
  path: '/webrtc'
})

const app = express()
const port = 8080

//https://expressjs.com/en/guide/writing-middleware.html
app.use(express.static(__dirname + '/../build'))
app.get('/', (req, res, next) => { 
  // res.sendfile(__dirname + '/../build/index.html')
  console.log('request is: ' + req)
})

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

io.listen(server)

// https://www.tutorialspoint.com/socket.io/socket.io_namespaces.htm
const peers = io.of('/admin')

peers.on('connection', socket => {

  console.log('server has receive a connection from ' + socket.id)
  socket.emit('connection-success', { success: socket.id })

  

  socket.on('createRoom', (data) => {
    if(rooms.includes(data.payload.room)) { 
    //TODO 
    } else { 
      rooms.push(data.payload.room)
      console.log("room number " + data.payload + " was created by " + data.socketID )
      socket.join(data.payload.room) 
      connectedPeers.set(socket.id, {socket:socket, room:data.payload.room})
      
      console.log(connectedPeers)
    }
    
  })

  socket.on('joinRoom', (data) => { 
    console.log(data.socketID + " has joined room: " + data.payload.room)
    socket.join(data.payload.room) 
    connectedPeers.set(socket.id, {socket:socket, room:data.payload.room})
    console.log(connectedPeers)
  })

  socket.on('disconnect', () => {
    console.log('server has been disconnected by ' + socket.socketID)
    connectedPeers.delete(socket.id)
  })

  socket.on('offerOrAnswer', (data) => {
    // send to the other peer(s) if any
    console.log('receive OOF from ' + data.socketID)
    for (const [socketID, info] of connectedPeers.entries()) {
      
      // send to same room && don't send to self 
      if (connectedPeers.get(data.socketID).room == info.room &&  socketID !== data.socketID) {
        console.log("server emitting OOF to room: "+ info.room)
        info.socket.emit('offerOrAnswer', data.payload)
      }
    }
  })

  socket.on('candidate', (data) => {
    // send candidate to the other peer(s) if any
    console.log('got candidate from ' + data.socketID )
    for (const [socketID, info] of connectedPeers.entries()) {
      // send to same room && don't send to self 
      if (connectedPeers.get(data.socketID).room == info.room &&  socketID !== data.socketID) {
        console.log('Emitting candidate to room: ' + info.room)
        info.socket.emit('candidate', data.payload)
      }
    }
  })

})