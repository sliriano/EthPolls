import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import './App.css';

class App extends Component {


  state = {
    user: '',
    userMessage:''
  };
  
  // Determine and Initialize the User
  getUser = async (event) => {
    try {
      const accounts = await web3.eth.getAccounts();
      this.setState({user: accounts[0]});

      if (web3.currentProvider['host'] === 'metamask') {
        window.web3.currentProvider.enable();
      }
      
      this.setState({userMessage: 'Current User:'});

    }
    catch (e) {
      alert("Please make sure either metamask is installed and you are logged into it or you are using an Ethereum Browser");
      this.setState({mustHave: 'You Must Have Metamask or an Ethereum browser in order to use this DApp. Recommended:' + <a href="https://metamask.io">"metamask.io"</a>})
    }
  }

  searchPoll = async (event) => {

  }

  componentDidMount() {
    this.getUser();
  }

  render() {
    return (
      <div className="App">

        <div className = "header">
          <h1><a href="https://ethpolls.com" className ="title">EthPolls</a></h1>
          <h3><a href="https://ethpolls.com" className="publicPollLink">Public Polls</a></h3>
          <br/>
          <br/>
          <br/>
        </div>

        <br/>

        <div className="subheader">
          <p className = "user"><span className="pulsate"><span className="userMessage">{this.state.userMessage}</span> {this.state.user}</span></p>
          <span className = "switches">
            <button className="astext">Search Polls</button> <span className = "line">|</span> <button className="astext">Create or View My Polls</button>
          </span>
        </div>

        <br/>
        <br/>
        <br/>
        <br/>

        <div className="searchBox">
          <h1>Enter Poll ID</h1>
          <br/>
          <br/>
          <input type="text" placeholder="Type Poll ID Here ..." />
          <br/>
          <br/>
          <br/>
          <button className="button">Search</button>
          <br/>
          <br/>
          <br/>
        </div>

        <br/>
        <br/>
        <br/>
        <br/>
        <br/>

      </div>
    );
  }
}

export default App;
