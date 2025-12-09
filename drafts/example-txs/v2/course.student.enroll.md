# `/tx/v2/student/course/enroll`

## 

### Request body:
```json
{
  "walletData": {
    "usedAddresses": [
      "addr_test1qzdgudzgf00ghdd8tw5ylylk4t76hsgm9pvr9ce73etppk0c8aursjfdhu7nr3sxujgczt2ndefwfc80pphdafv7fnrqact99a"
    ],
    "changeAddress": "addr_test1qzdgudzgf00ghdd8tw5ylylk4t76hsgm9pvr9ce73etppk0c8aursjfdhu7nr3sxujgczt2ndefwfc80pphdafv7fnrqact99a"
  },
  "alias": "manager_001",
  "courseId": "23a6bbce3a8deca8985764e847594f6956c9dc643e3f6c8efdba04e4",
  "commitData": {
    "sltHash": "8dcbe1b925d87e6c547bbd8071c23a712db4c32751454b0948f8c846e9246b5c",
    "assignmentInfo": "clear string info"
  }
}
```

### Example Query:
```bash
curl -X 'POST' \
  'https://atlas-api-preprod-507341199760.us-central1.run.app/tx/v2/student/course/enroll' \
  -H 'accept: application/json;charset=utf-8' \
  -H 'Content-Type: application/json;charset=utf-8' \
  -d '{
  "walletData": {
    "usedAddresses": [
      "addr_test1qzdgudzgf00ghdd8tw5ylylk4t76hsgm9pvr9ce73etppk0c8aursjfdhu7nr3sxujgczt2ndefwfc80pphdafv7fnrqact99a"
    ],
    "changeAddress": "addr_test1qzdgudzgf00ghdd8tw5ylylk4t76hsgm9pvr9ce73etppk0c8aursjfdhu7nr3sxujgczt2ndefwfc80pphdafv7fnrqact99a"
  },
  "alias": "manager_001",
  "courseId": "23a6bbce3a8deca8985764e847594f6956c9dc643e3f6c8efdba04e4",
  "commitData": {
    "sltHash": "8dcbe1b925d87e6c547bbd8071c23a712db4c32751454b0948f8c846e9246b5c",
    "assignmentInfo": "clear string info"
  }
}'
```

### Response Decoded CBOR

```json
{
  "body": {
    "inputs": [
      {
        "transaction_id": "ae6a4f6d53bc5ab02a0fff68dc476209db60877585a1c95b0231e384c24a46d0",
        "index": 3
      },
      {
        "transaction_id": "ae6a4f6d53bc5ab02a0fff68dc476209db60877585a1c95b0231e384c24a46d0",
        "index": 6
      }
    ],
    "outputs": [
      {
        "address": "addr_test1qzdgudzgf00ghdd8tw5ylylk4t76hsgm9pvr9ce73etppk0c8aursjfdhu7nr3sxujgczt2ndefwfc80pphdafv7fnrqact99a",
        "amount": {
          "coin": "1172320",
          "multiasset": {
            "39b2876b2458b8cd869eb665b24740df6890684a3e6cd7ff6c28b84b": {
              "756d616e616765725f303031": "1"
            }
          }
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1xzklyz29dtcmeed2fer9x4y7z205h5l8ng4n57trw6fgdu3wgsna4f55vq42rfstp7wl7r0wxflwdmezp8jpf9w83gnsm4xa2p",
        "amount": {
          "coin": "1560220",
          "multiasset": {
            "39b2876b2458b8cd869eb665b24740df6890684a3e6cd7ff6c28b84b": {
              "676d616e616765725f303031": "1"
            }
          }
        },
        "plutus_data": {
          "Data": "{\"constructor\":0,\"fields\":[{\"bytes\":\"6d616e616765725f303031\"},{\"map\":[{\"k\":{\"bytes\":\"23a6bbce3a8deca8985764e847594f6956c9dc643e3f6c8efdba04e4\"},\"v\":{\"bytes\":\"570ffab159848ed3c59d30531ec773c232aedbc0d7db0ff4ba2e3822d74300c0\"}}]}]}"
        },
        "script_ref": null
      },
      {
        "address": "addr_test1xzg7rrkaypn8m64pus8q3ydenu433mzddq3a25atanz77xyey3l3jfdh9fjp5r36meser0d70vlrls0agh62ur622jmq88awls",
        "amount": {
          "coin": "1452470",
          "multiasset": {
            "91e18edd20667deaa1e40e0891b99f2b18ec4d6823d553abecc5ef18": {
              "6d616e616765725f303031": "1"
            }
          }
        },
        "plutus_data": {
          "Data": "{\"constructor\":1,\"fields\":[{\"bytes\":\"8dcbe1b925d87e6c547bbd8071c23a712db4c32751454b0948f8c846e9246b5c\"},{\"bytes\":\"636c65617220737472696e6720696e666f\"},{\"list\":[]}]}"
        },
        "script_ref": null
      },
      {
        "address": "addr_test1qzdgudzgf00ghdd8tw5ylylk4t76hsgm9pvr9ce73etppk0c8aursjfdhu7nr3sxujgczt2ndefwfc80pphdafv7fnrqact99a",
        "amount": {
          "coin": "57781377",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1qzdgudzgf00ghdd8tw5ylylk4t76hsgm9pvr9ce73etppk0c8aursjfdhu7nr3sxujgczt2ndefwfc80pphdafv7fnrqact99a",
        "amount": {
          "coin": "57736922",
          "multiasset": {
            "13d5395a07f3167c1a51c7f3a4d612c1c85cdedf4a655024f87bc3aa": {
              "3232324361726f6c4d656e746f7250726570726f64": "1"
            },
            "1f66718cc26fa904d6acc5603c894ec5d24e56d27622d338b014d459": {
              "32323263726561746f722d61": "1"
            },
            "38372cd442b210d543caa316be32c7ee7a5253bbf6ad1305f39f8f92": {
              "745a454e": "30"
            },
            "4846a6e8ba7a3d17199d491a541c6b8a8bc0f0f6ea0eaef0a0305fa7": {
              "3232326d616e616765722d61": "1"
            },
            "5e74a87d8109db21fe3d407950c161cd2df7975f0868e10682a3dbfe": {
              "7070626c323032342d73636166666f6c642d746f6b656e": "1000000"
            },
            "5f986bc1631db167bf4b1223b15df8c95414dfd3feb5e9c28a867657": {
              "776f72636573746572": "1"
            },
            "738ec2c17e3319fa3e3721dbd99f0b31fce1b8006bb57fbd635e3784": {
              "3232326770746550726570726f6444656d6574657252756e6e6572": "1",
              "3232326770746550726570726f6454657374436f6e747269623031": "1"
            },
            "7b25f909c1d206fafb111c32816e89aeafd92cf830eb8d3423eee8ed": {
              "4368696c6c69": "100"
            },
            "7b7913ffad80dbae10ca0e6b1f88c0c596f5d508c1393fa454718cb1": {
              "3232326466614c35": "1"
            },
            "7c1687824a1fc9550960b1a6f7494cc37fef8e3e8a14dd8d1de55560": {
              "3232326c6561726e6572303031": "1"
            },
            "903c419ee7ebb6bf4687c61fb133d233ef9db2f80e4d734db3fbaf0b": {
              "3232327070626c323032342d636f6e7472696275746f7235": "1"
            },
            "96fbd9676a145e368b224484a312a1bdf594b6a08eb0f0d358151f04": {
              "3232326c6561726e6572356335": "1"
            },
            "992c4907edfe759646360fcc85bcb6d55cee7b79feb7c0a9cdfc8d56": {
              "32323273686f774d65": "1"
            },
            "c76c35088ac826c8a0e6947c8ff78d8d4495789bc729419b3a334305": {
              "3232326d616e616765722d303031": "1"
            },
            "d8822958d5e0b8d1ad3b8c7e3840a03c3f0f201abdee7a6db4967153": {
              "323232436f6e7472696254657374416c696365": "1"
            },
            "f3e6f19d47103fc04f794ca1eaa786171f00446cb8c9a5a6939fe8a1": {
              "3232322d416e64616d696f2d436f6e747269622d636f6e7472696275746f7235": "1"
            },
            "fb45417ab92a155da3b31a8928c873eb9fd36c62184c736f189d334c": {
              "7447696d62616c": "3460"
            },
            "fe8efd6bb0dfafd5c7ed9764c9ee11d0580bfab2553f94743d8ef48e": {
              "7457696e64736f72": "1502"
            }
          }
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1qzdgudzgf00ghdd8tw5ylylk4t76hsgm9pvr9ce73etppk0c8aursjfdhu7nr3sxujgczt2ndefwfc80pphdafv7fnrqact99a",
        "amount": {
          "coin": "45254142",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      }
    ],
    "fee": "402798",
    "ttl": null,
    "certs": null,
    "withdrawals": null,
    "update": null,
    "auxiliary_data_hash": null,
    "validity_start_interval": null,
    "mint": [
      [
        "91e18edd20667deaa1e40e0891b99f2b18ec4d6823d553abecc5ef18",
        {
          "6d616e616765725f303031": "1"
        }
      ]
    ],
    "script_data_hash": "10caffa549e2891f8bacc852582e9bb1ae4bae1fe1094ff625c41b8b97c8739c",
    "collateral": [
      {
        "transaction_id": "ae6a4f6d53bc5ab02a0fff68dc476209db60877585a1c95b0231e384c24a46d0",
        "index": 4
      }
    ],
    "required_signers": null,
    "network_id": null,
    "collateral_return": {
      "address": "addr_test1qzdgudzgf00ghdd8tw5ylylk4t76hsgm9pvr9ce73etppk0c8aursjfdhu7nr3sxujgczt2ndefwfc80pphdafv7fnrqact99a",
      "amount": {
        "coin": "158867553",
        "multiasset": null
      },
      "plutus_data": null,
      "script_ref": null
    },
    "total_collateral": "604197",
    "reference_inputs": [
      {
        "transaction_id": "1937336fdedcd62c377c898494e98bec611b5673c7621aad6e8a79e536b9609a",
        "index": 1
      },
      {
        "transaction_id": "741548bbef43b3fe67bb244627ba2b4e288efd1e128e901391dc1468102868ac",
        "index": 1
      },
      {
        "transaction_id": "d444817dee91de3f0836d304b2ba576b751fa8400244258be82efc1c1633f733",
        "index": 2
      }
    ],
    "voting_procedures": null,
    "voting_proposals": null,
    "donation": null,
    "current_treasury_value": null
  },
  "witness_set": {
    "vkeys": null,
    "native_scripts": null,
    "bootstraps": null,
    "plutus_scripts": null,
    "plutus_data": null,
    "redeemers": [
      {
        "tag": "Spend",
        "index": "0",
        "data": "{\"constructor\":0,\"fields\":[{\"bytes\":\"23a6bbce3a8deca8985764e847594f6956c9dc643e3f6c8efdba04e4\"},{\"int\":-1},{\"bytes\":\"\"},{\"bytes\":\"91e18edd20667deaa1e40e0891b99f2b18ec4d6823d553abecc5ef18\"}]}",
        "ex_units": {
          "mem": "318138",
          "steps": "107938805"
        }
      },
      {
        "tag": "Mint",
        "index": "0",
        "data": "{\"constructor\":0,\"fields\":[{\"bytes\":\"6d616e616765725f303031\"},{\"list\":[]},{\"constructor\":0,\"fields\":[{\"constructor\":0,\"fields\":[{\"bytes\":\"8dcbe1b925d87e6c547bbd8071c23a712db4c32751454b0948f8c846e9246b5c\"},{\"bytes\":\"636c65617220737472696e6720696e666f\"}]}]}]}",
        "ex_units": {
          "mem": "304415",
          "steps": "96277458"
        }
      }
    ]
  },
  "is_valid": true,
  "auxiliary_data": null
}
```