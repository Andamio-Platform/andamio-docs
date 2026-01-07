# `/tx/v2/admin/course/teachers/update`

## 

### Request body:
```json
{
  "walletData": {
    "usedAddresses": [
      "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r"
    ],
    "changeAddress": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r"
  },
  "alias": "james",
  "courseId": "23a6bbce3a8deca8985764e847594f6956c9dc643e3f6c8efdba04e4",
  "teachersToAdd": [
    "test12"
  ],
  "teachersToRemove": []
}
```

### Response Decoded CBOR

```json
{
  "body": {
    "inputs": [
      {
        "transaction_id": "741548bbef43b3fe67bb244627ba2b4e288efd1e128e901391dc1468102868ac",
        "index": 0
      },
      {
        "transaction_id": "741548bbef43b3fe67bb244627ba2b4e288efd1e128e901391dc1468102868ac",
        "index": 2
      },
      {
        "transaction_id": "d444817dee91de3f0836d304b2ba576b751fa8400244258be82efc1c1633f733",
        "index": 1
      },
      {
        "transaction_id": "d444817dee91de3f0836d304b2ba576b751fa8400244258be82efc1c1633f733",
        "index": 3
      },
      {
        "transaction_id": "f71aaf134accb84d216a190a450d5ccc5caf6317ed01e1442e2db65300e625ba",
        "index": 0
      }
    ],
    "outputs": [
      {
        "address": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r",
        "amount": {
          "coin": "1146460",
          "multiasset": {
            "4758613867a8a7aa500b5d57a0e877f01a8e63c1365469589b12063c": {
              "756a616d6573": "1"
            }
          }
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1xzlrs55we4u7speyteuqdnw7tl7u4npzm9p2j5l9lgfu32uey3l3jfdh9fjp5r36meser0d70vlrls0agh62ur622jmqtucd7n",
        "amount": {
          "coin": "1236970",
          "multiasset": {
            "23a6bbce3a8deca8985764e847594f6956c9dc643e3f6c8efdba04e4": {
              "4c6f63616c53746174654e4654": "1"
            }
          }
        },
        "plutus_data": {
          "Data": "{\"bytes\":\"6a616d6573\"}"
        },
        "script_ref": null
      },
      {
        "address": "addr_test1xpswwtj7upt9gh7txled87dc20dwmc6k294ttjq03p4x225ey3l3jfdh9fjp5r36meser0d70vlrls0agh62ur622jmqtt05jv",
        "amount": {
          "coin": "1344720",
          "multiasset": {
            "60e72e5ee056545fcb37f2d3f9b853daede356516ab5c80f886a652a": {
              "23a6bbce3a8deca8985764e847594f6956c9dc643e3f6c8efdba04e4": "1"
            }
          }
        },
        "plutus_data": {
          "Data": "{\"list\":[{\"bytes\":\"6a616d6573\"},{\"bytes\":\"746573743132\"}]}"
        },
        "script_ref": null
      },
      {
        "address": "addr_test1qpuptlg3kgtcq0rq8rq0z7w8pp0j7p98whvsg4wp6c0mngu7nalltfu076ak2qfw0p2ghn5svge4pm78gpfr6rl8rtrszh0nq3",
        "amount": {
          "coin": "5000000",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r",
        "amount": {
          "coin": "983830",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r",
        "amount": {
          "coin": "985056",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r",
        "amount": {
          "coin": "1026662",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r",
        "amount": {
          "coin": "2679079",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      }
    ],
    "fee": "303720",
    "ttl": null,
    "certs": null,
    "withdrawals": null,
    "update": null,
    "auxiliary_data_hash": null,
    "validity_start_interval": null,
    "mint": null,
    "script_data_hash": "59526fbc5a7b36f4879830dbffe1c85a4bb06521a32939d1103357a3fbb2bbb2",
    "collateral": [
      {
        "transaction_id": "06770f631599f82119f599f492f68ad68c067c13442e07883e6c3d5bab4defaf",
        "index": 0
      }
    ],
    "required_signers": null,
    "network_id": null,
    "collateral_return": {
      "address": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r",
      "amount": {
        "coin": "149544420",
        "multiasset": null
      },
      "plutus_data": null,
      "script_ref": null
    },
    "total_collateral": "455580",
    "reference_inputs": [
      {
        "transaction_id": "35d93ccfe17ccd6de427c66818f19eb79d729b7abd825be02441a70dfd769aff",
        "index": 3
      },
      {
        "transaction_id": "fc92ebcf115d39914192a816020cd47ce89253209a05f0f30e6bd9f926d11aee",
        "index": 3
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
        "index": "2",
        "data": "{\"bytes\":\"23a6bbce3a8deca8985764e847594f6956c9dc643e3f6c8efdba04e4\"}",
        "ex_units": {
          "mem": "320174",
          "steps": "106547053"
        }
      },
      {
        "tag": "Spend",
        "index": "3",
        "data": "{\"bytes\":\"23a6bbce3a8deca8985764e847594f6956c9dc643e3f6c8efdba04e4\"}",
        "ex_units": {
          "mem": "280091",
          "steps": "95872261"
        }
      }
    ]
  },
  "is_valid": true,
  "auxiliary_data": null
}
```