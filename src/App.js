import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import './App.css';
import Chart from './components/Chart';
import yesNo from './yesNo';
import multiData from './multiData';

class App extends Component {

  state = {
    user: '',
    userMessage:'',
    pollhash: '',
    pollType: '',
    pollName: '',
    pollDescription: '',
    ispublic: '',
    chart: '',
    // Yes/No State Variables
    yesVotes: '',
    noVotes: '',
    yesNoDisplay: 'none',
    // Multi-Data State Variables
    options: [],
    results: [],
    multiDataDisplay: 'none'
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
// Search Poll, return status if it exists
  searchPoll = async (event) => {
    try {
      const accounts = await web3.eth.getAccounts();

      if (this.state.pollhash === '') {
        alert("This Poll Hash does not exist or is not valid");
      }
      else if (this.state.pollType === '') {
        alert('Please select the poll type.');
      }
      else if (this.state.pollType === 'yesNo') {
        this.setState({multiDataDisplay: 'none'});
        const status = await yesNo.methods.pollStatus(this.state.pollhash).call({
          from: accounts[0]
        });

        this.setState({noVotes: status['no']});
        this.setState({yesVotes: status['yes']});
        this.setState({ispublic: status['isPublic']});
        this.setState({pollDescription: await yesNo.methods.getDesc(this.state.pollhash).call()});
        this.setState({pollName: await yesNo.methods.getName(this.state.pollhash).call()}); 
        this.setState({yesNoDisplay: 'initial'});
        this.forceUpdate();
        this.setState({chart: <Chart yesData={parseInt(this.state.yesVotes)} noData={parseInt(this.state.noVotes)} redraw/>});
      }
      else if (this.state.pollType === 'multiData') {
        this.setState({yesNoDisplay: 'none'});    

        const status = await multiData.methods.pollStatus(this.state.pollhash).call({
          from: accounts[0]
        });

        this.setState({results: status['results']});
        this.setState({options: status['options']});
        this.setState({ispublic: status['isPublic']});
        this.setState({pollDescription: await multiData.methods.getDesc(this.state.pollhash).call()});
        this.setState({pollName: await multiData.methods.getName(this.state.pollhash).call()});
        this.setState({multiDataDisplay: 'initial'});    
      }
    } 
    catch(e) {
      alert("Please make sure either metamask is installed and you are logged into it or you are using an Ethereum Browser");
    }
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
          <p>Enter the Poll ID of the poll you wish to search then select its poll type</p>
          <br/>
          <br/>
          <input type="text" placeholder="Type Poll ID Here ..." pollhash = {this.state.value} onChange={event=> this.setState({pollhash: event.target.value})}/>
          <br/>
          <br/>
          <br/>
        </div>

        <div className="radioButtons">
        <label className="container">Yes/No Poll
            <input name ="radio" type="radio" onClick={event=> this.setState({pollType: 'yesNo'})}/>
            <span className="checkmark"></span>
          </label>

          <label className="container">Multi-Data Poll
            <input name ="radio" type="radio" onClick={event=> this.setState({pollType: 'multiData'})}/>
            <span className="checkmark"></span>
        </label>
        </div>
        <br/>
        <br/>

        <div className ="centerbtn">
          <button onClick={this.searchPoll} className="button">Search</button>
        </div>
        <br/>
        <br/>
        <br/>
        <br/>

        <div className = "poll" id="yesNo" style={{display: this.state.yesNoDisplay}}>
          <p>Poll Name:</p>
          <h1>{this.state.pollName}</h1>
          <p>Description:</p>
          <h4>{this.state.pollDescription}</h4>
          <h4><span style={{textAlign: "left"}}>No Votes: {this.state.noVotes}</span>&nbsp;&nbsp;&nbsp;&nbsp;
          <span style={{textAlign: "right"}}>Yes Votes: {this.state.yesVotes}</span></h4>
          <div className="chart">
          {this.state.chart}
          <span><button id="noBtn">Vote No</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button id="yesBtn">Vote Yes</button></span>
          </div>
          <br/>
          <br/>
        </div>

        <div className = "poll" id="multiData" style={{display: this.state.multiDataDisplay}}>
          <p>Poll Name:</p>
          <h1>{this.state.pollName}</h1>
          <p>Description:</p>
          <h4>{this.state.pollDescription}</h4>
        </div>

      </div>
    );
  }
}

export default App;
