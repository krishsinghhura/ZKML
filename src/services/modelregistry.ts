export const abi={
    "address": "0xcEcba2F1DC234f70Dd89F2041029807F8D03A990",
    "abi": [
        {
            "type": "function",
            "name": "initialize",
            "inputs": [
                {
                    "name": "owner_addr",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "verifier_addr",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "assertOwner",
            "inputs": [],
            "outputs": [],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "setVerifier",
            "inputs": [
                {
                    "name": "verifier",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "outputs": [],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "verifyGroth16",
            "inputs": [
                {
                    "name": "a",
                    "type": "uint256[2]",
                    "internalType": "uint256[2]"
                },
                {
                    "name": "b_flat",
                    "type": "uint256[4]",
                    "internalType": "uint256[4]"
                },
                {
                    "name": "c",
                    "type": "uint256[2]",
                    "internalType": "uint256[2]"
                },
                {
                    "name": "input",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "registerModelGroth16",
            "inputs": [
                {
                    "name": "model_name",
                    "type": "string",
                    "internalType": "string"
                },
                {
                    "name": "version",
                    "type": "string",
                    "internalType": "string"
                },
                {
                    "name": "model_type",
                    "type": "string",
                    "internalType": "string"
                },
                {
                    "name": "pricing_per_inference",
                    "type": "uint128",
                    "internalType": "uint128"
                },
                {
                    "name": "example_input_hash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "example_output_hash",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "a",
                    "type": "uint256[2]",
                    "internalType": "uint256[2]"
                },
                {
                    "name": "b_flat",
                    "type": "uint256[4]",
                    "internalType": "uint256[4]"
                },
                {
                    "name": "c",
                    "type": "uint256[2]",
                    "internalType": "uint256[2]"
                },
                {
                    "name": "public_inputs",
                    "type": "uint256[]",
                    "internalType": "uint256[]"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "nonpayable"
        },
        {
            "type": "function",
            "name": "getModel",
            "inputs": [
                {
                    "name": "id",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                },
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                },
                {
                    "name": "",
                    "type": "string",
                    "internalType": "string"
                },
                {
                    "name": "",
                    "type": "uint128",
                    "internalType": "uint128"
                },
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "",
                    "type": "bytes32",
                    "internalType": "bytes32"
                },
                {
                    "name": "",
                    "type": "bool",
                    "internalType": "bool"
                },
                {
                    "name": "",
                    "type": "uint64",
                    "internalType": "uint64"
                }
            ],
            "stateMutability": "view"
        },
        {
            "type": "function",
            "name": "totalModels",
            "inputs": [],
            "outputs": [
                {
                    "name": "",
                    "type": "uint256",
                    "internalType": "uint256"
                }
            ],
            "stateMutability": "view"
        }
    ]
}