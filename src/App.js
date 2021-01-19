import React, { Component } from 'react';
import './App.css';
import Web3 from "web3";
import yesNo from './yesNo';
import multiData from './multiData';
import Chart from './components/Chart';
import MultiChart from './components/Multichart';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

class App extends Component {

  state = {
    web3: {},
    // General Poll State Variables
    user: '',
    userMessage:'Not Connected',
    pollhash: '',
    pollType: '',
    pollName: '',
    pollDescription: '',
    ispublic: '',
    allowed: [],
    isallowed: false,
    spinnerdisplay: 'none',
    votecasted: 'none',
    expiration: 0,
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
    colorList: ['#C7CEEA','#B5EAD7','#E2F0CB','#FFDAC1','#FFB7B2'],
    modColorList: [],
    //Display variables for each option
    o1: 'none',
    o2: 'none',
    o3: 'none',
    o4: 'none',
    o5: 'none',
    // Diplay of the website sectioins
    searchdisplay: 'initial',
    createdisplay: 'none',
    mydisplay: 'none',
    // Voting Options 
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    option5: '',
    // Step variables for creating poll
    step: '1',
    hasPassed: false,
    isready: 0,
    buttonText: 'Next Steps',
    createspinner: 'none',
    // Display of Create Poll Sections
    ispublicDisplay: 'none',
    pollTypeDisplay: 'initial',
    enterNameDisplay: 'none',
    expirationDisplay: 'none',
    optionsDisplay: 'none',
    allowedDisplay: 'none',
    createpolldisplay: 'none',
    // Poll Dashboard
    pollHashListYesNo: [],
    pollHashListMulti: [],
    yesNoHTML: [],
    multiHTML: [],
    multiPollHashDisplay: [],
    dashboardSpinner: 'none'
  };
  

  async connectEthereum() {
    
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: "INFURA_ID" // required
        }
      }
    };
    
    const web3Modal = new Web3Modal({
      providerOptions // required
    });
    
    const provider = await web3Modal.connect();
    const web3 = new Web3(provider);
    this.web3 = web3;
    if (web3) {
      const accounts = await web3.eth.getAccounts();
      this.setState({user: accounts[0]});
      this.setState({userMessage: 'Current User:'});
      return web3;
    }
    else {
      alert("Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp");
      return false;
    }
  }

  // Determine and Initialize the User
  getUser = async (event) => {
    try {

    }
    catch (e) {
      this.setState({user: ''});
      this.setState({userMessage: ''});
      this.setState({mustHave: 'You Must Have Metamask or an Ethereum browser in order to use this DApp. Recommended:' + <a href="https://metamask.io">"metamask.io"</a>})
    }
  }
  
// Search Poll, return status if it exists
  searchPoll = async (event) => {
    try {
      const accounts = await this.web3.eth.getAccounts();

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
        let novotes = parseInt(status['no']);
        let yesvotes = parseInt(status['yes']);
        this.setState({noVotes: [novotes]});
        this.setState({yesVotes: yesvotes});
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
        let resultss = status['results'];
        let optionss = status['options'];
        let allowedd = status['allowed'];

        this.setState({results: resultss});
        this.setState({options: optionss});
        this.setState({allowed: allowedd});
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
      const accounts = await this.web3.eth.getAccounts();
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
      const accounts = await this.web3.eth.getAccounts();
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
      const accounts = await this.web3.eth.getAccounts();

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

  // Algorithm for going through the process of creating any type of poll.
  nextstep = async (event) => {
    try {
      let newstep = 1;
      if (parseInt(this.state.step) < 6) {
        if (this.state.step === '1') {
          this.setState({pollTypeDisplay: 'none'});
          this.setState({ispublicDisplay: 'initial'});
        } 
        else if (this.state.step === 2) {
          this.setState({ispublicDisplay: 'none'});
          this.setState({enterNameDisplay: 'initial'});
        }
        else if (this.state.step === 3 ) {
          this.setState({enterNameDisplay: 'none'});
          this.setState({expirationDisplay: 'initial'});
          if (this.state.ispublic === true && this.state.pollType === 'yesNo') {
            newstep+=2;
          }
        }
        else if (this.state.pollType === "multiData" && this.state.hasPassed === false) {
          this.setState({expirationDisplay: 'none'});
          this.setState({optionsDisplay: 'initial'});
          this.setState({hasPassed: true});
          if(this.state.ispublic === true) {
            newstep+=1;
          }
        }
        else if (this.state.ispublic === false) {
          this.setState({optionsDisplay: 'none'});
          this.setState({expirationDisplay: 'none'});
          this.setState({allowedDisplay: 'initial'});
          newstep+=1;
        }
      }
      else if (this.state.ispublic === true && this.state.pollType === 'multiData') {
        if (this.state.isready > 0) {
          this.setState({createspinner: 'initial'});
          const accounts = await this.web3.eth.getAccounts();
          const newPollHash = await multiData.methods.calcPollHash(this.state.pollName,accounts[0]).call();

          await this.setState({pollhash: newPollHash});

          await multiData.methods.createPoll(this.state.pollDescription,this.state.pollName,
            [this.state.option1,this.state.option2,this.state.option3,this.state.option4,this.state.option5],
            [],true,this.state.expiration*3600).send({
            from: accounts[0]
          });

        }
        else {
          this.setState({isready: 1});
          this.setState({createpolldisplay: 'initial'});
          this.setState({optionsDisplay: 'none'});
          this.setState({expirationDisplay: 'none'});
          this.setState({buttonText: 'Create Your Poll'});
        }
      }
      else if (this.state.ispublic === false && this.state.pollType === 'multiData') {
        if (this.state.isready > 0) {
          this.setState({createspinner: 'initial'});
          const accounts = await this.web3.eth.getAccounts();

          let newArr = []

          for (var x = 0; x < this.state.allowed.length; x++) {
            newArr.push(this.state.allowed[x].replace(/^\s+|\s+$/g, ''));
          }

          await this.setState({allowed: newArr});

          const newPollHash = await multiData.methods.calcPollHash(this.state.pollName,accounts[0]).call();

          await this.setState({pollhash: newPollHash});

          await multiData.methods.createPoll(this.state.pollDescription,this.state.pollName,
            [this.state.option1,this.state.option2,this.state.option3,this.state.option4,this.state.option5]
            ,this.state.allowed,false,this.state.expiration*3600).send({
            from: accounts[0]
          });
        }
        else {
          this.setState({isready: 1});
          this.setState({createpolldisplay: 'initial'});
          this.setState({optionsDisplay: 'none'});
          this.setState({expirationDisplay: 'none'});
          this.setState({allowedDisplay: 'none'});
          this.setState({buttonText: 'Create Your Poll'});
        }
      }
      else if (this.state.ispublic === true && this.state.pollType === "yesNo") {
        if (this.state.isready > 0) {
          this.setState({createspinner: 'initial'});
          const accounts = await this.web3.eth.getAccounts();

          const newPollHash = await yesNo.methods.calcPollHash(this.state.pollName,accounts[0]).call();

          await this.setState({pollhash: newPollHash});

          await yesNo.methods.createPoll(this.state.pollDescription,this.state.pollName,true,[],this.state.expiration*3600).send({
            from: accounts[0]
          });

        }
        else {
          this.setState({isready: 1});
          this.setState({createpolldisplay: 'initial'});
          this.setState({optionsDisplay: 'none'});
          this.setState({expirationDisplay: 'none'});
          this.setState({buttonText: 'Create Your Poll'}); 
        }
      }
      else if (this.state.ispublic === false && this.state.pollType === "yesNo") {
        if (this.state.isready > 0) {
          this.setState({createspinner: 'initial'});
          const accounts = await this.web3.eth.getAccounts();
          let newArr = []

          for (var y = 0; y < this.state.allowed.length; y++) {
            newArr.push(this.state.allowed[y].replace(/^\s+|\s+$/g, ''));
          }
          const newPollHash = await yesNo.methods.calcPollHash(this.state.pollName,accounts[0]).call();

          await this.setState({pollhash: newPollHash});

          await this.setState({allowed: newArr});

          await yesNo.methods.createPoll(this.state.pollDescription,this.state.pollName,false,this.state.allowed,this.state.expiration*3600).send({
            from: accounts[0]
          });
        }
        else {
          this.setState({isready: 1});
          this.setState({createpolldisplay: 'initial'});
          this.setState({optionsDisplay: 'none'});
          this.setState({expirationDisplay: 'none'});
          this.setState({allowedDisplay: 'none'});
          this.setState({buttonText: 'Create Your Poll'}); 
        }
      }
      newstep+=parseInt(this.state.step);
      this.setState({step: newstep});
    }
    catch(e) {
      this.setState({createspinner: 'none'});
    }
  }

  // Retrieves all Yes/No Polls for a given user
  getYesNo = async (event) => {
    let hashlist = [];
    let counter = 0;
    const accounts = await this.web3.eth.getAccounts();

    // fetching poll Hashes for yesNo
    while(counter < 256) {
      try {
        const hash = await yesNo.methods.activePolls(this.state.user, counter).call();
        console.log(hash);
        if (hash !== null)
          hashlist.push(hash);
        else
          break;
        counter++;
      }
      catch(e) {
        break;
      }
    }
    await this.setState({pollHashListYesNo: hashlist});
    console.log(this.state.pollHashListYesNo);
    // get YesNo HTML
    let htmlInnerList = []
    let htmlList = [<h2>Yes/No Polls</h2>]
    for (var x = 0; x < this.state.pollHashListYesNo.length;x++){

      const status = await yesNo.methods.pollStatus(this.state.pollHashListYesNo[x]).call({
        from: accounts[0]
      });

      const no = parseInt(status['no']);
      const yes = parseInt(status['yes']);
      const name = await yesNo.methods.getName(this.state.pollHashListYesNo[x]).call();
      const desc = await yesNo.methods.getDesc(this.state.pollHashListYesNo[x]).call();
      const yesNoId = "yesNo"+x.toString();

      let pollhtml = 
      <div className="column" style={{textAlign:'center'}}>
      <h3>{name}</h3>
      <p>{desc}</p><p>Yes Votes: {yes}</p><p>No Votes: {no}</p>
      <button className="pollhashbutton" onClick={event=> this.switchDisplay(yesNoId)}>
        Show Poll ID
      </button>
      <br/>
      <p id ={yesNoId} style={{fontSize: '11px',display: 'none'}}>{this.state.pollHashListYesNo[x]}</p>
      </div>
      
      htmlInnerList.splice(htmlInnerList.length-2,0,pollhtml);

      if(x+1 > 2 && ((x+1) % 3 === 0)) {
        htmlList.push(htmlInnerList);
        htmlList.push([<br/>]);
        htmlList.push([<span style={{marginLeft: '10%', marginRight: '10%'}}><hr/></span>]);
        htmlInnerList = [];
      } else if (x+1 === this.state.pollHashListYesNo.length){
        htmlList.push(htmlInnerList);
        htmlList.push([<br/>]);
        htmlInnerList = [];
      }
    }

    this.setState({yesNoHTML: htmlList});

  }

  // Retrieves all Multi-Data Polls for a given user
  getMulti = async (event) => {
    let counter = 0;
    let hashlist = [];
    const accounts = await this.web3.eth.getAccounts();

    // fetching poll hashes for multiData
    while(counter<256) {
      try{
        let hash = await multiData.methods.activePolls(this.state.user,counter).call();
        console.log(hash);
        if (hash !== null)
          hashlist.push(hash);
        else
          break
        counter++;
      }
      catch(e){
        break;
      }
    }
    await this.setState({pollHashListMulti: hashlist});
    console.log(this.state.pollHashListMulti);
    // get MultiData HTML
    let htmlInnerList = [];
    let htmlList = [<h2>Multi-Data Polls</h2>];
    for (var y = 0; y < this.state.pollHashListMulti.length;y++){

      const status = await multiData.methods.pollStatus(this.state.pollHashListMulti[y]).call({
        from: accounts[0]
      });

      const tempResults = status['results'];
      const tempOptions = status['options'];
      const name = await multiData.methods.getName(this.state.pollHashListMulti[y]).call();
      const desc = await multiData.methods.getDesc(this.state.pollHashListMulti[y]).call();
      // Only use the options being used
      let optionList = []
      for (var i =0; i < tempOptions.length; i++) {
        if (tempOptions[i] !== '')
          optionList.push(<p >{tempOptions[i]+': '+tempResults[i]}</p>);
      }

      const id = 'multi'+y.toString();
      let pollhtml = 
      <div className="column" style={{textAlign: 'center'}}>
      <h3>{name}</h3>
      <p>{desc}</p>
      {optionList}
      <button className="pollhashbutton" onClick={event=> this.switchDisplay(id)}>
        Show Poll ID
      </button>
      <br/>
      <p id ={id} style={{fontSize: '11px',display: 'none'}}>{this.state.pollHashListMulti[y]}</p>
      </div>;
      
      htmlInnerList.splice(htmlInnerList.length-2,0,pollhtml);

      if(y+1 > 2 && ((y+1) % 3 === 0)) {
        htmlList.push(htmlInnerList);
        htmlList.push([<br/>]);
        htmlList.push([<span style={{marginLeft: '10%', marginRight: '10%'}}><hr/></span>]);
        htmlInnerList = [];
      } else if (y+1 === this.state.pollHashListMulti.length){
        htmlList.push(htmlInnerList);
        htmlList.push([<br/>]);
        htmlInnerList = [];
      }
    }

    this.setState({multiHTML: htmlList});
  }

  // pass in an elements id to toggle its display value
  switchDisplay(ID) {
    if(document.getElementById(ID).style.display === "none") {
      document.getElementById(ID).style.display = "inline";
      console.log('success');
    }
    else
      document.getElementById(ID).style.display = "none";
    }

  // Display Voting Dashboard and spinners until Dashboard loads
  displayDashboard = async (event) =>{
    await this.setState({createdisplay: 'none', mydisplay: 'initial', searchdisplay: 'none'});
    await this.setState({dashboardSpinner: 'initial'});
    await this.getMulti();
    await this.getYesNo();
    await this.setState({dashboardSpinner: 'none'});
  }

  // Fetch User Only once, when the user opens the app
  componentDidMount() {
    this.connectEthereum();
    this.getUser();
  }

  render() {
    return (
      <div className="App">

        <div className = "header">
          <h1><a href="https://ethpolls.com" className ="title">EthPolls</a></h1>
          <br/>
          <br/>
          <br/>
        </div>

        <br/>

        <div className="subheader">
          <p className = "user"><span className="pulsate"><span className="userMessage">{this.state.userMessage}</span> {this.state.user}</span></p>
          <span className = "switches">
            <button className="astext" onClick={event=> window.location.reload()}>Search for a Poll</button> <span className = "lines"> | </span> 
            <button className="astext" onClick= {event=> this.setState({createdisplay: 'initial', mydisplay: 'none', searchdisplay: 'none'})}>Create a Poll</button> <span className = "lines"> | </span> 
            <button className="astext" onClick= {event=> this.displayDashboard()}>View My Polls</button>
          </span>
        </div>

        <br/>
        <br/>
        <br/>
        <br/>

        {/*********** Search for Poll *************/}
        <div className="pollSearch" style={{display: this.state.searchdisplay}}>
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
        <div className="createPoll" style={{display: this.state.createdisplay}}>
          <div className="searchbox">
            <h4 style={{marginLeft: '25%'}}>Step {this.state.step}</h4>
          {/** Choose Poll Type (MultiData / YesNo) **/}
          <div style={{display: this.state.pollTypeDisplay}}>
          <h1 style={{textAlign: 'center'}}>Choose Poll Type</h1>
            <p style={{textAlign: 'center'}}>Decide which type of poll you would like to create</p>
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
        </div>

          {/** Choose Public/Private **/}
        <div style={{display: this.state.ispublicDisplay}}>
        <h1 style={{textAlign: 'center'}}>Choose Poll Type</h1>
            <p style={{textAlign: 'center'}}>Decide which type of poll you would like to create</p>
        <div className="radioButtons" >
        <label className="container">Public
            <input name ="radio" type="radio" onClick={event=> this.setState({ispublic: true})}/>
            <span className="checkmark"></span>
          </label>

          <label className="container">Restricted (only users you choose can vote)
            <input  name ="radio" type="radio" onClick={event=> this.setState({ispublic: false})}/>
            <span  className="checkmark"></span>
        </label>
        </div>
        </div>

          {/* Enter Poll Name and Description */}
        <div style={{display: this.state.enterNameDisplay}}>
          <h1 style={{textAlign: 'center'}}>Enter Poll Name and Description</h1>
          <p style={{textAlign: 'center'}}>Type the name of your poll followed by a description</p>
          <div style={{textAlign: 'center'}}>
          <input onChange={event=> this.setState({pollName: event.target.value})} placeholder="Enter Name Here" id="my-text-field" type="text" maxLength="100" style={{width: '12%', color: 'black'}}/>
          <br/>
          <br/>
          <textarea onChange={event=> this.setState({pollDescription: event.target.value})} id="my-textarea"maxLength="500" data-counter-label="" style={{ height: '300px', width: '300px'}}></textarea>
          </div>      
        </div>

          {/* Enter Poll Expiration */}
          <div style={{display: this.state.expirationDisplay}}>
          <h1 style={{textAlign: 'center'}}>Decide if your poll will expire</h1>
          <p style={{textAlign: 'center'}}>Choose whether or not your poll will expire. If your poll will not expire, enter 0. Otherwise select the amount of hours it will last.</p>
          <div style={{textAlign: 'center'}}>
            <input onChange={event=> this.setState({expiration: parseInt(event.target.value)})} placeholder="Hours" id="my-text-field" type="text" maxLength="15" style={{width: '8%', color: 'black'}}/>
            <br/>
          </div>  
          </div>

          {/* Enter options if multi data poll */}
          <div style={{display: this.state.optionsDisplay}}>
          <h1 style={{textAlign: 'center'}}>Enter your Voting Options</h1>
          <p style={{textAlign: 'center'}}>Type in the things that voters will be voting on.</p>
          <div style={{textAlign: 'center'}}>
            <input onChange={event=> this.setState({option1: event.target.value})} placeholder="Option 1" id="my-text-field" type="text"  style={{width: '8%', color: 'black'}}/>
            <br/>
            <input onChange={event=> this.setState({option2: event.target.value})} placeholder="Option 2" id="my-text-field" type="text"  style={{width: '8%', color: 'black'}}/>
            <br/>
            <input onChange={event=> this.setState({option3: event.target.value})} placeholder="Option 3" id="my-text-field" type="text"  style={{width: '8%', color: 'black'}}/>
            <br/>
            <input onChange={event=> this.setState({option4: event.target.value})} placeholder="Option 4" id="my-text-field" type="text"  style={{width: '8%', color: 'black'}}/>
            <br/>
            <input onChange={event=> this.setState({option5: event.target.value})} placeholder="Option 5" id="my-text-field" type="text"  style={{width: '8%', color: 'black'}}/>
            <br/>
          </div>  
          </div>

          {/* Enter Allowed Users */}
          <div style={{display: this.state.allowedDisplay}}>
          <h1 style={{textAlign: 'center'}}>Enter a comma separated list of users</h1>
          <p style={{textAlign: 'center'}}>Example: 0x74ff48fc3762eB4dC5E579A73ECffCBab4b9939E,0x9E01CBf6e04aBc6157Fe538A4EB03D879B670af0,0xCE43a16E7a848F9c51f41Ef1b77022118527d41A</p>
          <div style={{textAlign: 'center'}}>
            <textarea onChange={event=> this.setState({allowed: event.target.value.split(",")})} id="my-textarea" maxLength="100000" data-counter-label="" style={{ height: '300px', width: '300px'}}></textarea>
            <br/>
          </div> 
          </div>

          {/* Create Poll Display */}
          <div style={{display: this.state.createpolldisplay}}>
          <h1 style={{textAlign: 'center'}}>Click the button to create your poll</h1>
          <p style={{textAlign: 'center'}}>Once your poll has been created you will be given the Poll ID. This is used when searching for polls.</p>
          <br/>
          <div style={{display: this.state.createspinner, textAlign: 'center'}}>
          <div className="load-1">
                <p className="pulsate">Creating Poll...(Approximately 1 Minute)</p>
                <div className="line" id ="clearline"></div>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
            </div>
          </div>
          <h2 id="createdPollHash" style={{textAlign: 'center', fontWeight: 300}}>Your Poll ID: {this.state.pollhash}</h2>
          </div>

        <br/>
        <div style={{textAlign: 'center'}} >
        <button onClick={event=> this.nextstep()} className="button">{this.state.buttonText}</button>
        </div>
          </div>
        </div>

        {/***************** Poll Dashboard *****************/}
        <div style={{display: this.state.dashboardSpinner}}>
          <h4 style={{fontWeight: 300, textAlign: 'center'}}>Loading...</h4>
          <div id="rect1" className="wave"></div>
          <br/>
        </div>
        <div style={{display: this.state.mydisplay}}>
        <div>
        {/* Three Column Layout for poll visual */}
        <div id="dashwrapper">
        <div className="row">
          {this.state.yesNoHTML}
        </div>
        </div>

        <div>
          <br/>
          <br/>
          <br/>
        </div>

        <div id="dashwrapper">
        <div className="row">
          {this.state.multiHTML}
        </div>
        </div>
        <br />
        </div>
        </div>

      {/* End */}
      </div>
    );
  }
}

export default App;
