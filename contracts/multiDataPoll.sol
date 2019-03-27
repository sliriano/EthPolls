pragma solidity >=0.4.22 <0.6.0;
pragma experimental ABIEncoderV2;

contract mulitDataPoll {
/*-------------------<STRUCTS>-------------------*/
  struct Poll {
    bool isClosed;
    bool isPublic;
    address creator;
    string name;
    string description;
    string[] options;
    uint[] voteResults;
    mapping(address => bool) hasVoted;
    mapping(address => bool) isAllowed;
    uint totalVotes;
    uint start;
    uint expiration;
  }


/*-------------------<GLOBALs>-------------------*/
  uint constant maxPolls = 256;
  mapping(bytes32 => Poll) public polls;
  mapping(address => uint) public ownedPolls;
  mapping(address=> Poll[]) public archive;
  mapping(address=>bytes32[]) public activePolls;


/*-------------------<MODIFIERS>-------------------*/
  modifier canCreatePoll {
    require(ownedPolls[msg.sender] < maxPolls, "User has reached maximum number of open polls.");
    _;
  }

  modifier onlyCreator(bytes32 pollHash) {
    require(polls[pollHash].creator == msg.sender, "Only the poll creator can do that.");
    _;
  }

  modifier pollExists(bytes32 pollHash) {
    require(
      polls[pollHash].creator != address(0) &&
      !polls[pollHash].isClosed,
      "Poll does not exist.");
    _;
  }

  modifier hasNotVoted(bytes32 pollHash) {
    require(!polls[pollHash].hasVoted[msg.sender], "User has already voted.");
    _;
  }

  modifier pollNotPublic(bytes32 pollHash) {
    require(polls[pollHash].isPublic == false, "Poll is public");
    _;
  }
  
  modifier canVote(bytes32 pollHash, address user) {
    if (polls[pollHash].isPublic == false) {
        require(polls[pollHash].isAllowed[user] == true);
    }
    _;
  }
  
  modifier notExpired(bytes32 pollHash) {
    if (polls[pollHash].expiration != 0) {
        require(now < polls[pollHash].start+ polls[pollHash].expiration * 1 seconds, "This poll has expired.");
    }
    _;
  }


/*-------------------<UTILITY FUNCTIONS>-------------------*/
  function calcPollHash(string memory name, address creator) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(name, creator));
  }

  function pollStatus(bytes32 pollHash) 
  public view returns (bool isOpen, bool isPublic,string[] memory options, uint[] memory results, uint total) {
    Poll memory poll = polls[pollHash];
    return (!poll.isClosed, poll.isPublic, poll.options, poll.voteResults, poll.totalVotes);
  }
  
  
  function shiftArray(address creator, bytes32 pollHash) private {
    for(uint i = 0; i < activePolls[creator].length;i++) {
        if (activePolls[creator][i] != pollHash)
            activePolls[0x0000000000000000000000000000000000000000].push(activePolls[creator][i]);
    }
    activePolls[creator] = activePolls[0x0000000000000000000000000000000000000000];
    delete activePolls[0x0000000000000000000000000000000000000000];
  }


/*-------------------<POLL FUNCTIONS>-------------------*/
  function createPoll(string memory description, string memory name, string[] memory options, address[] memory allowed,  bool isPublic, uint expiration) 
  public canCreatePoll {
    bytes32 pollHash = calcPollHash(name, msg.sender);
    require(options.length > 1, "Invalid poll creation. Must include voting data.");
    require(polls[pollHash].creator == address(0), "Poll already exists");
    polls[pollHash].creator = msg.sender;
    polls[pollHash].name = name;
    polls[pollHash].description = description;
    polls[pollHash].options = options;
    polls[pollHash].voteResults = [0,0,0,0,0];
    polls[pollHash].expiration = expiration;
    polls[pollHash].start = now;
    activePolls[msg.sender].push(pollHash);
    if (isPublic) polls[pollHash].isPublic = true;
    if (polls[pollHash].isPublic == false){
        for (uint i = 0; i < allowed.length; i++) {
            polls[pollHash].isAllowed[allowed[i]] = true;
        }
    }
  }


  function cancelPoll(bytes32 pollHash) 
  public pollExists(pollHash) onlyCreator(pollHash) {
    archive[msg.sender].push(polls[pollHash]);
    shiftArray(msg.sender,pollHash);
    delete polls[pollHash];
    polls[pollHash].isClosed = true;
    ownedPolls[msg.sender]--;
  }
  
  function addAllowedUsers(bytes32 pollHash, address[] memory allowed) 
  public onlyCreator(pollHash) pollNotPublic(pollHash) notExpired(pollHash){
    for (uint i = 0; i < allowed.length; i++) {
        polls[pollHash].isAllowed[allowed[i]] = true;
    }
  }
  
  function vote(bytes32 pollHash, uint voteChoice)
  public pollExists(pollHash) hasNotVoted(pollHash) canVote(pollHash,msg.sender) notExpired(pollHash){
    require(voteChoice < polls[pollHash].options.length+1 && voteChoice > 0, "This option does not exist");
    polls[pollHash].voteResults[voteChoice-1]++;
    polls[pollHash].totalVotes++;
    polls[pollHash].hasVoted[msg.sender] = true;
  }
}