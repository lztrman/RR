import React, { Component } from 'react';

import io from 'socket.io-client'

class Room extends Component {
  constructor(props) {
    super(props)

    // https://reactjs.org/docs/refs-and-the-dom.html
    this.localVideoref = React.createRef()
    this.remoteVideoref = React.createRef()
    this.roomId = this.props.roomId
    this.type = this.props.type

    this.socket = null
    this.candidates = []
  }

  componentDidMount = () => {

    console.log("this room room id is " + this.roomId)
    console.log("this room type is " + this.type)

    this.socket = io(
      '/admin',
      {
        path: '/webrtc',
        query: {}
      }
    )
    
    this.socket.on('connection-success', success => {
      
      if (this.type === "create") { 
        var createData = { 
          room: this.roomId
        }
        this.sendToServer("createRoom", createData)
      } else if(this.type === "join") { 
        var joinData = { 
          room: this.roomId 
        }
        this.sendToServer("joinRoom", joinData)
      }
      console.log('connection success')
    })

    this.socket.on('offerOrAnswer', (sdp) => {
    // set sdp as remote description 
    console.log('Setting remote description by ' + this.socket.id)
      this.pc.setRemoteDescription(new RTCSessionDescription(sdp))
    })

    this.socket.on('candidate', (candidate) => {
      // console.log('From Peer... ', JSON.stringify(candidate))
      console.log('Adding ice candidate by ' + this.socket.id + 'and the candidate is ' + candidate)
      this.pc.addIceCandidate(new RTCIceCandidate(candidate))
    })

    const pc_config = {
      "iceServers": [
        // {
        //   urls: 'stun:[STUN_IP]:[PORT]',
        //   'credentials': '[YOR CREDENTIALS]',
        //   'username': '[USERNAME]'
        // },
        {
          urls : 'stun:stun.l.google.com:19302'
        }
      ]
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection
    // create an instance of RTCPeerConnection
    this.pc = new RTCPeerConnection(pc_config)

    // triggered when a new candidate is returned
    this.pc.onicecandidate = (e) => {
      // send the candidates to the remote peer
      // see addCandidate below to be triggered on the remote peer
      if (e.candidate) {
        // console.log(JSON.stringify(e.candidate))
        console.log('Sending candidate from '+ this.socket.id + ' to server ')
        this.sendToServer('candidate', e.candidate)
      }
    }

    // triggered when there is a change in connection state
    this.pc.oniceconnectionstatechange = (e) => {
      console.log(e)
    }

    // triggered when a stream is added to pc, see below - this.pc.addStream(stream)
    this.pc.onaddstream = (e) => {
      this.remoteVideoref.current.srcObject = e.stream
    }

    // called when getUserMedia() successfully returns - see below
    // getUserMedia() returns a MediaStream object (https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
    const success = (stream) => {
        console.log('Get user media success by ' + this.socket.id)
      window.localStream = stream
      this.localVideoref.current.srcObject = stream
      this.pc.addStream(stream)
    }

    // called when getUserMedia() fails - see below
    const failure = (e) => {
      console.log('getUserMedia Error: ', e)
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    // see the above link for more constraint options
    const constraints = {
      audio: false,
      video: true,
      // video: {
      //   width: 1280,
      //   height: 720
      // },
      // video: {
      //   width: { min: 1280 },
      // }
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    navigator.mediaDevices.getUserMedia(constraints)
      .then(success)
      .catch(failure)
  }

  sendToServer = (messageType, payload) => {
    this.socket.emit(messageType, {
      socketID: this.socket.id,
      payload
    })
  }

  /* ACTION METHODS FROM THE BUTTONS ON SCREEN */
  createOffer = () => {
    console.log('Offer')
    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer
    // initiates the creation of SDP
    this.pc.createOffer({ offerToReceiveVideo: 1 })
      .then(sdp => {
        // set offer sdp as local description
        this.pc.setLocalDescription(sdp)

        this.sendToServer('offerOrAnswer', sdp)
        console.log('Sending offer to server by ' + this.socket.id)
    })
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
  // creates an SDP answer to an offer received from remote peer
  createAnswer = () => {
    this.pc.createAnswer({ offerToReceiveVideo: 1 })
      .then(sdp => {
        // set answer sdp as local description
        this.pc.setLocalDescription(sdp)
        this.sendToServer('offerOrAnswer', sdp)
        console.log('Sending answer to server by ' + this.socket.id)
    })
  }

  render() {

    return (
      <div>
        <video
          style={{
            width: 240,
            height: 240,
            margin: 5,
            backgroundColor: 'black'
          }}
          ref={ this.localVideoref }
          autoPlay>
        </video>
       
        <video
          style={{
            width: 240,
            height: 240,
            margin: 5,
            backgroundColor: 'black'
          }}
          ref={ this.remoteVideoref }
          autoPlay>
        </video>
        <br />
        
        <button onClick={this.createOffer}>Offer</button>
        <button onClick={this.createAnswer}>Answer</button>
        
      </div>
    )
  }
}

export default Room;