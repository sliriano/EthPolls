import web3 from './web3';

const address = '0xd17C31De7eb280016001f87F5E0Efd0146fC3cc1';

const abi = 
[
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "activePolls",
		"outputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "pollHash",
				"type": "bytes32"
			}
		],
		"name": "pollStatus",
		"outputs": [
			{
				"name": "isOpen",
				"type": "bool"
			},
			{
				"name": "isPublic",
				"type": "bool"
			},
			{
				"name": "options",
				"type": "string[]"
			},
			{
				"name": "results",
				"type": "uint256[]"
			},
			{
				"name": "allowed",
				"type": "address[]"
			},
			{
				"name": "total",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "pollHash",
				"type": "bytes32"
			}
		],
		"name": "cancelPoll",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "pollHash",
				"type": "bytes32"
			}
		],
		"name": "getName",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "polls",
		"outputs": [
			{
				"name": "isClosed",
				"type": "bool"
			},
			{
				"name": "isPublic",
				"type": "bool"
			},
			{
				"name": "creator",
				"type": "address"
			},
			{
				"name": "name",
				"type": "string"
			},
			{
				"name": "description",
				"type": "string"
			},
			{
				"name": "totalVotes",
				"type": "uint256"
			},
			{
				"name": "start",
				"type": "uint256"
			},
			{
				"name": "expiration",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "pollHash",
				"type": "bytes32"
			}
		],
		"name": "getDesc",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "pollHash",
				"type": "bytes32"
			}
		],
		"name": "isExpired",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "name",
				"type": "string"
			},
			{
				"name": "creator",
				"type": "address"
			}
		],
		"name": "calcPollHash",
		"outputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "pollHash",
				"type": "bytes32"
			},
			{
				"name": "voteChoice",
				"type": "uint256"
			}
		],
		"name": "vote",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "ownedPolls",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "pollHash",
				"type": "bytes32"
			},
			{
				"name": "allowed",
				"type": "address[]"
			}
		],
		"name": "addAllowedUsers",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "description",
				"type": "string"
			},
			{
				"name": "name",
				"type": "string"
			},
			{
				"name": "options",
				"type": "string[]"
			},
			{
				"name": "allowed",
				"type": "address[]"
			},
			{
				"name": "isPublic",
				"type": "bool"
			},
			{
				"name": "expiration",
				"type": "uint256"
			}
		],
		"name": "createPoll",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "archive",
		"outputs": [
			{
				"name": "isClosed",
				"type": "bool"
			},
			{
				"name": "isPublic",
				"type": "bool"
			},
			{
				"name": "creator",
				"type": "address"
			},
			{
				"name": "name",
				"type": "string"
			},
			{
				"name": "description",
				"type": "string"
			},
			{
				"name": "totalVotes",
				"type": "uint256"
			},
			{
				"name": "start",
				"type": "uint256"
			},
			{
				"name": "expiration",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
];

export default new web3.eth.Contract(abi, address);