# `/tx/v2/student/course/credential/claim`

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
  "courseId": "23a6bbce3a8deca8985764e847594f6956c9dc643e3f6c8efdba04e4"
}
```

### Example Query

```bash
curl -X 'POST' \
  'https://atlas-api-preprod-507341199760.us-central1.run.app/tx/v2/student/course/credential/claim' \
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
  "courseId": "23a6bbce3a8deca8985764e847594f6956c9dc643e3f6c8efdba04e4"
}'
```

### Response Decoded CBOR

```json
{
  "body": {
    "inputs": [
      {
        "transaction_id": "7d83dd64c30f25398fdae617bd2840c450054dc204d6c0c4bd62a39e67e47407",
        "index": 1
      },
      {
        "transaction_id": "a3c23eddf37056d361c8cb6680957eac601b4c07dcfb29eae2130b913138af7b",
        "index": 0
      },
      {
        "transaction_id": "a3c23eddf37056d361c8cb6680957eac601b4c07dcfb29eae2130b913138af7b",
        "index": 1
      },
      {
        "transaction_id": "a3c23eddf37056d361c8cb6680957eac601b4c07dcfb29eae2130b913138af7b",
        "index": 3
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
          "Data": "{\"constructor\":0,\"fields\":[{\"bytes\":\"6d616e616765725f303031\"},{\"map\":[{\"k\":{\"bytes\":\"23a6bbce3a8deca8985764e847594f6956c9dc643e3f6c8efdba04e4\"},\"v\":{\"bytes\":\"eb6074566e52a89ec35d0136e1d7020ac84f8a84c26b2c0626f8d86a5ae77767\"}}]}]}"
        },
        "script_ref": null
      },
      {
        "address": "addr_test1qzdgudzgf00ghdd8tw5ylylk4t76hsgm9pvr9ce73etppk0c8aursjfdhu7nr3sxujgczt2ndefwfc80pphdafv7fnrqact99a",
        "amount": {
          "coin": "32499766",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1qzdgudzgf00ghdd8tw5ylylk4t76hsgm9pvr9ce73etppk0c8aursjfdhu7nr3sxujgczt2ndefwfc80pphdafv7fnrqact99a",
        "amount": {
          "coin": "26313915",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      }
    ],
    "fee": "346896",
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
          "6d616e616765725f303031": "-1"
        }
      ]
    ],
    "script_data_hash": "d20601cb15b60435c6b6994104a5fe5b7c5b8f596b4cc0f917358a3b990db39a",
    "collateral": [
      {
        "transaction_id": "a3c23eddf37056d361c8cb6680957eac601b4c07dcfb29eae2130b913138af7b",
        "index": 3
      }
    ],
    "required_signers": null,
    "network_id": null,
    "collateral_return": {
      "address": "addr_test1qzdgudzgf00ghdd8tw5ylylk4t76hsgm9pvr9ce73etppk0c8aursjfdhu7nr3sxujgczt2ndefwfc80pphdafv7fnrqact99a",
      "amount": {
        "coin": "57261033",
        "multiasset": null
      },
      "plutus_data": null,
      "script_ref": null
    },
    "total_collateral": "520344",
    "reference_inputs": [
      {
        "transaction_id": "1937336fdedcd62c377c898494e98bec611b5673c7621aad6e8a79e536b9609a",
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
        "data": "{\"constructor\":3,\"fields\":[]}",
        "ex_units": {
          "mem": "87865",
          "steps": "32781508"
        }
      },
      {
        "tag": "Spend",
        "index": "2",
        "data": "{\"constructor\":1,\"fields\":[{\"bytes\":\"23a6bbce3a8deca8985764e847594f6956c9dc643e3f6c8efdba04e4\"},{\"int\":0},{\"bytes\":\"\"},{\"bytes\":\"91e18edd20667deaa1e40e0891b99f2b18ec4d6823d553abecc5ef18\"},{\"bytes\":\"493dcbcf1f5e3bbf5d0ae283f8da5f8e1d3c0c4845ad45ca3edc6885a7f85ca1\"}]}",
        "ex_units": {
          "mem": "254538",
          "steps": "88592761"
        }
      },
      {
        "tag": "Mint",
        "index": "0",
        "data": "{\"constructor\":4,\"fields\":[{\"bytes\":\"6d616e616765725f303031\"},{\"list\":[{\"bytes\":\"8dcbe1b925d87e6c547bbd8071c23a712db4c32751454b0948f8c846e9246b5c\"}]}]}",
        "ex_units": {
          "mem": "167013",
          "steps": "56516649"
        }
      }
    ]
  },
  "is_valid": true,
  "auxiliary_data": null
}
```