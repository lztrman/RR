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
const peers = io.of('/room')
const peersAdmin = io.of('/admin')

peersAdmin.on('connection', socket => {
  console.log('server has receive a connection from ' + socket.id)
  socket.emit('connection-success', { success: socket.id })

  socket.on('checkCreate',(data) => { 
    if(rooms.includes(data.payload.room)) { 
        socket.emit('createReject', {
          room: data.payload.room,
          message: "room " + data.payload.room + " exists, please use join"
        })
        console.log('room ' +data.payload.room+' exist, can not create')
      } else { 
        socket.emit('createAccept', {
          room: data.payload.room,
          message: "room " + data.payload.room + " can be created, please preceed"
        })
        console.log('able to create room '+data.payload.room)
      }
  })
})

peers.on('connection', socket => {

  console.log('server has receive a connection from ' + socket.id)
  socket.emit('connection-success', { success: socket.id })

  socket.on('createRoom', (data) => {
    
    rooms.push(data.payload.room)
    console.log("room number " + data.payload.room + " was created by " + data.socketID)
    
    socket.join(data.payload.room) 
    connectedPeers.set(socket.id, {socket:socket, room:data.payload.room})
    
    // console.log(connectedPeers)
    
    console.log("current operating rooms are "+rooms)
  })

  socket.on('joinRoom', (data) => { 
    console.log(data.socketID + " has joined room: " + data.payload.room)
    socket.join(data.payload.room) 
    connectedPeers.set(socket.id, {socket:socket, room:data.payload.room})
    // console.log(connectedPeers)
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