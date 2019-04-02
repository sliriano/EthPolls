import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import './App.css';
import Chart from './components/Chart';
import MultiChart from './components/Multichart';
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
    colorList: ['#C7CEEA','#B5EAD7','#E2F0CB','#FFDAC1','#FFB7B2'],
    modColorList: [],
    allowed: [],
    isallowed: false,
    spinnerdisplay: 'none',
    votecasted: 'none',
    // Yes/No State Variables
    yesVotes: '',
    noVotes: '',
    chart: '',
    yesNoDisplay: 'none',
    // Multi-Data State Variables
    options: [],
    results: [],
    multiChart: '',
    multiDataDisplay: 'none',
    multiDataHTML: [],
    voteOptionsHTML: [],
    voteChoice: 0,
    votebtndisplay: 'none',
    //Display variables for each option
    o1: 'none',
    o2: 'none',
    o3: 'none',
    o4: 'none',
    o5: 'none',
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
        // Hide MultiData Poll
        this.setState({multiDataDisplay: 'none'});

        //Fetch Data from Ethereum
        const status = await yesNo.methods.pollStatus(this.state.pollhash).call({
          from: accounts[0]
        });

        //Set Poll Properties
        this.setState({noVotes: status['no']});
        this.setState({yesVotes: status['yes']});
        this.setState({ispublic: status['isPublic']});
        this.setState({allowed: status['allowed']});
        this.setState({pollDescription: await yesNo.methods.getDesc(this.state.pollhash).call()});
        this.setState({pollName: await yesNo.methods.getName(this.state.pollhash).call()}); 
        this.setState({yesNoDisplay: 'initial'});

        for (var i = 0; i < this.state.allowed.length; i++) {
          if (this.state.allowed[i] === accounts[0]) {
            this.setState({isallowed: true});
            this.setState({votebtndisplay: 'initial'});
          }
        }
        if (this.state.allowed.length === 0) {
          this.setState({votebtndisplay: 'initial'});
          this.setState({isallowed: true});
        }
        else if (this.state.isallowed === false) {
          this.setState({allowedmessage: "You are not allowed to vote on this poll."});
        }

        // Checks if poll is expired
        const isexpired = await yesNo.methods.isExpired(this.state.pollhash).call();
        if (isexpired === true) {
          this.setState({allowedmessage: "This poll has expired"});
          this.setState({votebtndisplay: 'none'});
        }
        
        //Create Chart
        this.setState({chart: <Chart yesData={parseInt(this.state.yesVotes)} noData={parseInt(this.state.noVotes)} redraw/>});
      }
      else if (this.state.pollType === 'multiData') {
        // Hide YesNo Poll
        this.setState({yesNoDisplay: 'none'});    

        //Fetch Poll Data from Ethereum
        const status = await multiData.methods.pollStatus(this.state.pollhash).call({
          from: accounts[0]
        });

        // Set Poll Property Values
        this.setState({results: status['results']});
        this.setState({options: status['options']});
        this.setState({allowed: status['allowed']});
        this.setState({ispublic: status['isPublic']});
        this.setState({pollDescription: await multiData.methods.getDesc(this.state.pollhash).call()});
        this.setState({pollName: await multiData.methods.getName(this.state.pollhash).call()});
        

        // Check if user is allowed and display appropriately

        for (var y = 0; y < this.state.allowed.length; y++) {
          if (this.state.allowed[y] === accounts[0]) {
            this.setState({isallowed: true});
            this.setState({votebtndisplay: 'initial'});
          } 
        }
        if (this.state.allowed.length === 0) {
          this.setState({votebtndisplay: 'initial'});
          this.setState({isallowed: true});
        }
        else if (this.state.isallowed === false) {
          this.setState({allowedmessage: "You are not allowed to vote on this poll."});
        }
        // Checks if poll is expired
        const isexpired = await multiData.methods.isExpired(this.state.pollhash).call();
        if (isexpired === true) {
          this.setState({allowedmessage: "This poll has expired"});
          this.setState({votebtndisplay: 'none'});
        }

        // Create Proper Color List & Pass in Values to MultiChart
        this.setState({modColorList: this.state.colorList.slice(0,this.state.colorList.length-1)});
        this.setState({multiChart: <MultiChart labels={this.state.options} results={this.state.results} bcgColors={this.state.modColorList} redraw/>})

        // Create Options & Votes List, to be rendered
        const newList = [];
        for (var x= 0; x < this.state.options.length; x++) {
          newList.push(<h4>{this.state.options[x]}: {this.state.results[x]}</h4>);
        }
        this.setState({multiDataHTML: newList});

        // Manually set display values for option list *MUST IMPROVE
        if(this.state.options.length === 5) {
          this.setState({o1: "initial"});
          this.setState({o2: "initial"});
          this.setState({o3: "initial"});
          this.setState({o4: "initial"});
          this.setState({o5: "initial"});
        } else if(this.state.options.length === 4) {
          this.setState({o1: "initial"});
          this.setState({o2: "initial"});
          this.setState({o3: "initial"});
          this.setState({o4: "initial"});
        } else if(this.state.options.length === 3) {
          this.setState({o1: "initial"});
          this.setState({o2: "initial"});
          this.setState({o3: "initial"});
        } else if(this.state.options.length === 2) {
          this.setState({o1: "initial"});
          this.setState({o2: "initial"});
        }
        // Display Multi Data Poll
        this.setState({multiDataDisplay: 'initial'});
      }
    } 
    catch(e) {
      console.log(e);
      alert("Please make sure the pollhash is valid. Otherwise ensure that either metamask is installed and you are logged into it or you are using an Ethereum Browser");
    }
  }

  // Vote Yes on a Yes/No Poll
  voteYes = async (event) => {
    var bool = false;
    try {
      const accounts = await web3.eth.getAccounts();
      bool = true;
      this.setState({spinnerdisplay: "initial"});

      await yesNo.methods.vote(this.state.pollhash,true).send({
        from: accounts[0]
      });
      this.setState({spinnerdisplay: 'none'});
      this.setState({votecasted: 'initial'});
    }
    catch (e) {
      if (bool === false) {
        console.log(e);
        alert("Please make sure either metamask is installed and you are logged into it or you are using an Ethereum Browser");
      } else{
      this.setState({spinnerdisplay: "none"});
      this.setState({votecasted: 'initial'});
      }
    }
  }

  // Vote NO on a Yes/No Poll
  voteNo = async (event) => {
    var bool = false
    try {
      const accounts = await web3.eth.getAccounts();
      bool = true;
      this.setState({spinnerdisplay: "initial"});
      await yesNo.methods.vote(this.state.pollhash,false).send({
        from: accounts[0]
      });
      this.setState({spinnerdisplay: "none"});
      this.setState({votecasted: 'initial'});
    }
    catch (e) {
      if (bool === false) {
        console.log(e);
        alert("Please make sure either metamask is installed and you are logged into it or you are using an Ethereum Browser");
      } else{
      this.setState({spinnerdisplay: "none"});
      this.setState({votecasted: 'initial'});
      }
    }
  }

  // Cast vote on MultiData POll
  multiVote = async (event) => {
    var bool = false;
    try {
      const accounts = await web3.eth.getAccounts();

      bool = true;
      this.setState({spinnerdisplay: "initial"});

      await multiData.methods.vote(this.state.pollhash,this.state.voteChoice+1).send({
        from: accounts[0]
      });
      this.setState({spinnerdisplay: "none"});
      this.setState({votecasted: 'initial'});
    }
    catch (e) {
      if (bool === false) {
        console.log(e);
        alert("Please make sure either metamask is installed and you are logged into it or you are using an Ethereum Browser");
      } else{
      this.setState({spinnerdisplay: "none"});
      this.setState({votecasted: 'initial'});
      }
    }
  }

  // Fetch User Only once, when the user opens the app
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
            <button className="astext">Search for a Poll</button> <span className = "lines">|</span> 
            <button className="astext">Create a Poll</button> <span className = "lines">|</span> 
            <button className="astext">View My Polls</button>
          </span>
        </div>

        <br/>
        <br/>
        <br/>
        <br/>

        {/*********** Search for Poll *************/}
        <div className="pollSearch">
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
        {/******************************* YES NO POLL  ************************************/}
        <div className = "poll" id="yesNo" style={{display: this.state.yesNoDisplay}}>
          <p>Poll Name:</p>
          <h1>{this.state.pollName}</h1>
          <p>Description:</p>
          <h4>{this.state.pollDescription}</h4>
          <h4><span style={{textAlign: "left"}}>No Votes: {this.state.noVotes}</span>&nbsp;&nbsp;&nbsp;&nbsp;
          <span style={{textAlign: "right"}}>Yes Votes: {this.state.yesVotes}</span></h4>
          <div className="chart">
          {this.state.chart}
          <p>{this.state.allowedmessage}</p>
          <span><button style={{display: this.state.votebtndisplay}} onClick={this.voteNo}id="noBtn">Vote No</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button style={{display: this.state.votebtndisplay}} onClick={this.voteYes} id="yesBtn">Vote Yes</button></span>
          </div>
          <br/>
          <div className="loading-spinner" style={{display: this.state.spinnerdisplay, textAlign: 'center'}}>
          <div className="load-1">
                <p className="pulsate">Voting...(Approximately 1 Minute)</p>
                <div className="line" id ="clearline"></div>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
            </div>
          </div>
          <div className = "center">
          <h4 style={{display: this.state.votecasted, textAlign: 'center', color: '#383838'	}}>Your vote has been casted! Refresh the page and re-enter the poll hash to see the updated results!</h4>
          </div>
          <br/>
          <br/>
        </div>

        {/******************************* MULTI DATA POLL  ************************************/}
        <div className = "poll" id="multiData" style={{display: this.state.multiDataDisplay}}>
          <p>Poll Name:</p>
          <h1>{this.state.pollName}</h1>
          <p>Description:</p>
          <h4>{this.state.pollDescription}</h4>
          {this.state.multiDataHTML}
          <div className = "multiChart">
            {this.state.multiChart}
          </div>
          <div className="radioButtons">
            <label style={{display:this.state.o1}} className="container"> {this.state.options[0]}
              <input name ="radio" type="radio" onClick={event=> this.setState({voteChoice: 0})}/>
              <span className="checkmark"></span>
            </label>
          </div>
          <div className="radioButtons">
            <label style={{display:this.state.o2}} className="container">{this.state.options[1]}
                <input name ="radio" type="radio" onClick={event=> this.setState({voteChoice: 1})}/>
                <span className="checkmark"></span>
            </label>
          </div>
          <div className="radioButtons">
            <label style={{display:this.state.o3}} className="container">{this.state.options[2]}
                <input name ="radio" type="radio" onClick={event=> this.setState({voteChoice: 2})}/>
                <span className="checkmark"></span>
            </label>
          </div>
          <div className="radioButtons">
            <label style={{display:this.state.o4}} className="container">{this.state.options[3]}
                <input name ="radio" type="radio" onClick={event=> this.setState({voteChoice: 3})}/>
                <span className="checkmark"></span>
            </label>
          </div>
          <div className="radioButtons">
            <label style={{display:this.state.o5}} className="container">{this.state.options[4]}
                <input name ="radio" type="radio" onClick={event=> this.setState({voteChoice: 4})}/>
                <span className="checkmark"></span>
            </label>
        </div>
        <p>{this.state.allowedmessage}</p>
          <div className ="multiBtn" >
            <button style={{display: this.state.votebtndisplay}} onClick = {this.multiVote} id="multiVote">Vote</button>
          </div>
          <br/>
          <div className="loading-spinner" style={{display: this.state.spinnerdisplay, textAlign: 'center'}}>
          <div className="load-1">
                <p className="pulsate">Voting...(Approximately 1 Minute)</p>
                <div className="line" id ="clearline"></div>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
            </div>
          </div>
          <div className="center">
          <h4 style={{display: this.state.votecasted, textAlign: 'center', color: '#383838'	}}>Your vote has been casted! Refresh the page and re-enter the poll hash to see the updated results!</h4>
          </div>
        </div>
        <br/>
        </div>

        {/******************** Create a Poll ******************* */}
        <div className="createPoll">
          
        </div>

      </div>
    );
  }
}

export default App;
