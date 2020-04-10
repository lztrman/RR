import React, { Component } from "react";
import io from 'socket.io-client'
import Room from "./Room";
import {Button, Input} from "antd";
import './App.css';

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
  };

  createRoom = () => {
    console.log("create room function called. ");
    this.roomId = document.getElementById("roomTf").value 
    console.log("this app room id is " + this.roomId)
    this.type = "create"
    console.log("this app type is " + this.type)
    this.setState({ inRoom: true });
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
          <div className = "App">
            <h1 >Welcome to Red Rhinoceros! </h1>
            <br/>
            <p > please enter room number </p>
            <Input style = {{width: '30%'}} type="text" ref={this.roomRef} size = "median" value = "Room Number"/>
            <br/>
            <br/>
            <p > please enter your name </p>
            <Input style = {{width: '30%'}} type="text" ref={this.nameRef} size = "median" value = "Your Name"/>
            <br/>
            <br/>
            <Button type = "primary" onClick={this.createRoom} id="ceateBtn" size = "middle">
              CREATE ROOM
            </Button>
            <br/>
            <br/>
            <Button type = "primary" onClick={this.joinRoom} id="joinBtn">
              JOIN ROOM
            </Button>
            
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
