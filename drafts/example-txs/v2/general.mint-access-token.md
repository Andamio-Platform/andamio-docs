# `/tx/v2/general/mint-access-token`

## 

### Request body:
```json
{
  "walletData": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r",
  "alias": "test_1234"
}
```

### Response Decoded CBOR

```json
{
  "body": {
    "inputs": [
      {
        "transaction_id": "2560406dcdd7da45d310ca25225601dd26ea61383d209738f55a98e9529746cb",
        "index": 1
      },
      {
        "transaction_id": "8c0240ae3992e138c2b266e47a7898d2f575d6e06d3edf9b18e59b0747aa61b3",
        "index": 7
      },
      {
        "transaction_id": "b9c62b055a70469849c39ca6d446a9b525193beb6b77015883646e687bedbb2b",
        "index": 5
      }
    ],
    "outputs": [
      {
        "address": "addr_test1xqum9pmty3vt3nvxn6mxtvj8gr0k3yrgfglxe4llds5tsjewgsna4f55vq42rfstp7wl7r0wxflwdmezp8jpf9w83gnsrr84hd",
        "amount": {
          "coin": "1249900",
          "multiasset": {
            "39b2876b2458b8cd869eb665b24740df6890684a3e6cd7ff6c28b84b": {
              "20": "1"
            }
          }
        },
        "plutus_data": {
          "Data": "{\"constructor\":0,\"fields\":[{\"bytes\":\"746573743132\"},{\"bytes\":\"746573745f31323334\"}]}"
        },
        "script_ref": null
      },
      {
        "address": "addr_test1xqum9pmty3vt3nvxn6mxtvj8gr0k3yrgfglxe4llds5tsjewgsna4f55vq42rfstp7wl7r0wxflwdmezp8jpf9w83gnsrr84hd",
        "amount": {
          "coin": "1245590",
          "multiasset": {
            "39b2876b2458b8cd869eb665b24740df6890684a3e6cd7ff6c28b84b": {
              "20": "1"
            }
          }
        },
        "plutus_data": {
          "Data": "{\"constructor\":0,\"fields\":[{\"bytes\":\"746573745f31323334\"},{\"bytes\":\"7573657231\"}]}"
        },
        "script_ref": null
      },
      {
        "address": "addr_test1qqasyh8kdh742htuzy5rzwgn0hewg2d3m32gle2h4w38kwgqfz280z9xhpx7fv4p7a8y7xpp2nwl9p7k39e28z7jsmfqnvhuml",
        "amount": {
          "coin": "5000000",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1xzklyz29dtcmeed2fer9x4y7z205h5l8ng4n57trw6fgdu3wgsna4f55vq42rfstp7wl7r0wxflwdmezp8jpf9w83gnsm4xa2p",
        "amount": {
          "coin": "1262830",
          "multiasset": {
            "39b2876b2458b8cd869eb665b24740df6890684a3e6cd7ff6c28b84b": {
              "67746573745f31323334": "1"
            }
          }
        },
        "plutus_data": {
          "Data": "{\"constructor\":0,\"fields\":[{\"bytes\":\"746573745f31323334\"},{\"map\":[]}]}"
        },
        "script_ref": null
      },
      {
        "address": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r",
        "amount": {
          "coin": "49066153",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r",
        "amount": {
          "coin": "194036503",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r",
        "amount": {
          "coin": "49925797",
          "multiasset": {
            "39b2876b2458b8cd869eb665b24740df6890684a3e6cd7ff6c28b84b": {
              "75746573745f31323334": "1"
            }
          }
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r",
        "amount": {
          "coin": "50875335",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      }
    ],
    "fee": "357242",
    "ttl": null,
    "certs": null,
    "withdrawals": {
      "stake_test17qqz7k43cxmt0qxuu5x8jnvsy75k5thzpmt2mrvsrtfa8ac9vg5z3": "0"
    },
    "update": null,
    "auxiliary_data_hash": "9815e44c45d1e96c1b8f7a1eb6a8e39e2008d704aee1c68be289e0a3cab392b9",
    "validity_start_interval": null,
    "mint": [
      [
        "39b2876b2458b8cd869eb665b24740df6890684a3e6cd7ff6c28b84b",
        {
          "20": "1",
          "67746573745f31323334": "1",
          "75746573745f31323334": "1"
        }
      ]
    ],
    "script_data_hash": "535878d452140ca66c667c3ebbed30c3bbb0e201242f1f470b5d0885088c7557",
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
        "coin": "149464137",
        "multiasset": null
      },
      "plutus_data": null,
      "script_ref": null
    },
    "total_collateral": "535863",
    "reference_inputs": [
      {
        "transaction_id": "35d93ccfe17ccd6de427c66818f19eb79d729b7abd825be02441a70dfd769aff",
        "index": 0
      },
      {
        "transaction_id": "35d93ccfe17ccd6de427c66818f19eb79d729b7abd825be02441a70dfd769aff",
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
        "data": "{\"constructor\":0,\"fields\":[]}",
        "ex_units": {
          "mem": "87883",
          "steps": "29307972"
        }
      },
      {
        "tag": "Mint",
        "index": "0",
        "data": "{\"bytes\":\"746573745f31323334\"}",
        "ex_units": {
          "mem": "523328",
          "steps": "181451724"
        }
      },
      {
        "tag": "Reward",
        "index": "0",
        "data": "{\"bytes\":\"746573745f31323334\"}",
        "ex_units": {
          "mem": "86251",
          "steps": "34714727"
        }
      }
    ]
  },
  "is_valid": true,
  "auxiliary_data": {
    "metadata": {
      "721": "{\"map\":[{\"k\":{\"string\":\"39b2876b2458b8cd869eb665b24740df6890684a3e6cd7ff6c28b84b\"},\"v\":{\"map\":[{\"k\":{\"string\":\"utest_1234\"},\"v\":{\"map\":[{\"k\":{\"string\":\"name\"},\"v\":{\"string\":\"Andamio Access Token\"}},{\"k\":{\"string\":\"alias\"},\"v\":{\"string\":\"test_1234\"}},{\"k\":{\"string\":\"image\"},\"v\":{\"list\":[{\"string\":\"ipfs://bafybeihjgnthktrxhoqr4mncmsjnn76ok44ffrdx6seidzo7\"},{\"string\":\"efx4h2sgg4\"}]}},{\"k\":{\"string\":\"mediaType\"},\"v\":{\"string\":\"image/*\"}},{\"k\":{\"string\":\"description\"},\"v\":{\"list\":[{\"string\":\"First Edition\"}]}},{\"k\":{\"string\":\"era\"},\"v\":{\"string\":\"Foundation Era\"}},{\"k\":{\"string\":\"app\"},\"v\":{\"string\":\"https://app.andamio.io\"}},{\"k\":{\"string\":\"files\"},\"v\":{\"list\":[{\"map\":[{\"k\":{\"string\":\"mediaType\"},\"v\":{\"string\":\"image/*\"}},{\"k\":{\"string\":\"src\"},\"v\":{\"list\":[{\"string\":\"ipfs://bafybeihjgnthktrxhoqr4mncmsjnn76ok44ffrdx6seidzo7\"},{\"string\":\"efx4h2sgg4\"}]}}]}]}}]}}]}}]}"
    },
    "native_scripts": null,
    "plutus_scripts": null,
    "prefer_alonzo_format": true
  }
}
```