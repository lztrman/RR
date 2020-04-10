import React, { Component } from "react";
import io from 'socket.io-client'
import Room from "./Room";

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      inRoom: false, 
      
    };
    this.roomId = null; 
    this.type = null; 
    this.roomRef = React.createRef();
    this.nameRef = React.createRef();
  }

  

  componentDidMount = () => {
    this.socket = io(
      '/admin',
      {
        path: '/webrtc',
        query: {}
      }
    )

    this.socket.on('connection-success', success => {
      
      console.log('connection success')
    })

    this.socket.on('createAccept', data => {
      
      console.log(data.message)
      this.roomId = document.getElementById("roomTf").value 
      console.log("this app room id is " + this.roomId)
      this.type = "create"
      console.log("this app type is " + this.type)
      this.setState({ inRoom: true });
      
    })

    this.socket.on('createReject', data => {
      alert(data.message); 
      console.log(data.message)
    })

    

  };
  sendToServer = (messageType, payload) => {
    this.socket.emit(messageType, {
      socketID: this.socket.id,
      payload
    })
  }

  createRoom = () => {
    console.log("create room function called. ");
    var createData = { 
      room: document.getElementById("roomTf").value 
    }
    this.sendToServer("checkCreate", createData)
  };

  joinRoom = () => {
    console.log("join room function called. ");
    this.roomId = document.getElementById("roomTf").value 
    console.log("this app room id is " + this.roomId)
    this.type = "join"
    console.log("this app type is " + this.type)
    this.setState({ inRoom: true });
  };

  render() {
    switch (this.state.inRoom) {
      case true:
        return (
          <div>
            <Room type = {this.type} roomId = {this.roomId}/>
          </div>
        );
      case false:
        return (
          <div>
            <h1>Welcome to Red Rhinoceros! </h1>
            <p> please enter room number </p>
            <input type="text" ref={this.roomRef} id="roomTf" />
            <p> please enter your name </p>
            <input type="text" ref={this.nameRef} id="nameTf" />
            <button onClick={this.createRoom} id="ceateBtn">
              CREATE ROOM
            </button> 
            <button onClick={this.joinRoom} id="joinBtn">
              JOIN ROOM
            </button>
          </div>
        );
      default:
        return (
          <div id="error">
            <h1> this really should not happen </h1>
          </div>
        );
    }
  }
}
export default App;
