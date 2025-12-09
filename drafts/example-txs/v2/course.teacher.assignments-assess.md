# `/tx/v2/teacher/course/assignments/assess`

## Single Decision

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
  "assignmentDecisions": [
    {
      "alias": "manager_001",
      "outcome": "accept"
    }
  ]
}
```

### Example Query: 
```bash
curl -X 'POST' \
  'https://atlas-api-preprod-507341199760.us-central1.run.app/tx/v2/teacher/course/assignments/assess' \
  -H 'accept: application/json;charset=utf-8' \
  -H 'Content-Type: application/json;charset=utf-8' \
  -d '{
  "walletData": {
    "usedAddresses": [
      "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r"
    ],
    "changeAddress": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r"
  },
  "alias": "james",
  "courseId": "23a6bbce3a8deca8985764e847594f6956c9dc643e3f6c8efdba04e4",
  "assignmentDecisions": [
    {
      "alias": "manager_001",
      "outcome": "accept"
    }
  ]
}'
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
        "transaction_id": "93002a3f7de9fbe836e29ee48c25e076c0dc7b8877d389bbb539e52adda4c48a",
        "index": 5
      },
      {
        "transaction_id": "a3c23eddf37056d361c8cb6680957eac601b4c07dcfb29eae2130b913138af7b",
        "index": 2
      },
      {
        "transaction_id": "f14d825dd1311ba907c5f65a5a92f3c19894e01e362e85b49e51e0ad7fa0ff4f",
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
        "address": "addr_test1xzg7rrkaypn8m64pus8q3ydenu433mzddq3a25atanz77xyey3l3jfdh9fjp5r36meser0d70vlrls0agh62ur622jmq88awls",
        "amount": {
          "coin": "1379200",
          "multiasset": {
            "91e18edd20667deaa1e40e0891b99f2b18ec4d6823d553abecc5ef18": {
              "6d616e616765725f303031": "1"
            }
          }
        },
        "plutus_data": {
          "Data": "{\"constructor\":0,\"fields\":[{\"list\":[{\"bytes\":\"8dcbe1b925d87e6c547bbd8071c23a712db4c32751454b0948f8c846e9246b5c\"}]}]}"
        },
        "script_ref": null
      },
      {
        "address": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r",
        "amount": {
          "coin": "137147675",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1qz2h42hnke3hf8n05m2hzdaamup6edfqvvs2snqhmufv0eryqhtfq6cfwktmrdw79n2smpdd8n244z8x9f3267g8cz6s59993r",
        "amount": {
          "coin": "115886293",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      }
    ],
    "fee": "281358",
    "ttl": null,
    "certs": null,
    "withdrawals": null,
    "update": null,
    "auxiliary_data_hash": null,
    "validity_start_interval": null,
    "mint": null,
    "script_data_hash": "4d2d09567ed13d180a47451cf8d113b8c7b26235c961810b09a6265bc804118f",
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
        "coin": "149577963",
        "multiasset": null
      },
      "plutus_data": null,
      "script_ref": null
    },
    "total_collateral": "422037",
    "reference_inputs": [
      {
        "transaction_id": "d444817dee91de3f0836d304b2ba576b751fa8400244258be82efc1c1633f733",
        "index": 2
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
        "tag": "Spend",
        "index": "2",
        "data": "{\"constructor\":2,\"fields\":[{\"bytes\":\"6a616d6573\"}]}",
        "ex_units": {
          "mem": "288107",
          "steps": "97828364"
        }
      }
    ]
  },
  "is_valid": true,
  "auxiliary_data": null
}
```