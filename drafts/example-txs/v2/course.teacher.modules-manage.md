# `/tx/v2/teacher/course/modules/manage`

## Create 1 Course Module

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
  "modulesToMint": [
    {
      "slts": [
        "I can mint an access token.",
        "I can complete an assignment to earn a credential."
      ],
      "allowedStudents_V2": [],
      "prerequisiteAssignments_V2": []
    }
  ],
  "modulesToUpdate": [],
  "modulesToBurn": []
}
```

### Response Decoded CBOR

```json
{
  "body": {
    "inputs": [
      {
        "transaction_id": "74c29ad3334176c59800d938ce2215f92cc8b8f2118397b240a20eb02650ad21",
        "index": 4
      },
      {
        "transaction_id": "d444817dee91de3f0836d304b2ba576b751fa8400244258be82efc1c1633f733",
        "index": 0
      }
    ],
    "outputs": [
      {
        "address": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r",
        "amount": {
          "coin": "1146460",
          "multiasset": {
            "39b2876b2458b8cd869eb665b24740df6890684a3e6cd7ff6c28b84b": {
              "756a616d6573": "1"
            }
          }
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1xqygr5q96scpwjxlt24s377nq2kk9ur2rd4323nye94ehfuey3l3jfdh9fjp5r36meser0d70vlrls0agh62ur622jmq5egxwn",
        "amount": {
          "coin": "1590390",
          "multiasset": {
            "0881d005d4301748df5aab08fbd302ad62f06a1b6b154664c96b9ba7": {
              "8dcbe1b925d87e6c547bbd8071c23a712db4c32751454b0948f8c846e9246b5c": "1"
            }
          }
        },
        "plutus_data": {
          "Data": "{\"constructor\":0,\"fields\":[{\"bytes\":\"23a6bbce3a8deca8985764e847594f6956c9dc643e3f6c8efdba04e4\"},{\"list\":[{\"bytes\":\"91e18edd20667deaa1e40e0891b99f2b18ec4d6823d553abecc5ef18\"}]},{\"list\":[]}]}"
        },
        "script_ref": null
      },
      {
        "address": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r",
        "amount": {
          "coin": "1008517",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r",
        "amount": {
          "coin": "2725975",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      }
    ],
    "fee": "271720",
    "ttl": null,
    "certs": null,
    "withdrawals": null,
    "update": null,
    "auxiliary_data_hash": null,
    "validity_start_interval": null,
    "mint": [
      [
        "0881d005d4301748df5aab08fbd302ad62f06a1b6b154664c96b9ba7",
        {
          "8dcbe1b925d87e6c547bbd8071c23a712db4c32751454b0948f8c846e9246b5c": "1"
        }
      ]
    ],
    "script_data_hash": "a7fd795ddc4a23f59c4f312e20a01719ac5ce1c1599a8df66e19b2d70f67879e",
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
        "coin": "149592420",
        "multiasset": null
      },
      "plutus_data": null,
      "script_ref": null
    },
    "total_collateral": "407580",
    "reference_inputs": [
      {
        "transaction_id": "1937336fdedcd62c377c898494e98bec611b5673c7621aad6e8a79e536b9609a",
        "index": 4
      },
      {
        "transaction_id": "d444817dee91de3f0836d304b2ba576b751fa8400244258be82efc1c1633f733",
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
        "tag": "Mint",
        "index": "0",
        "data": "{\"constructor\":0,\"fields\":[{\"bytes\":\"6a616d6573\"},{\"bytes\":\"23a6bbce3a8deca8985764e847594f6956c9dc643e3f6c8efdba04e4\"},{\"list\":[{\"list\":[{\"bytes\":\"492063616e206d696e7420616e2061636365737320746f6b656e2e\"},{\"bytes\":\"492063616e20636f6d706c65746520616e2061737369676e6d656e7420746f206561726e20612063726564656e7469616c2e\"}]}]}]}",
        "ex_units": {
          "mem": "330098",
          "steps": "109408204"
        }
      }
    ]
  },
  "is_valid": true,
  "auxiliary_data": null
}
```