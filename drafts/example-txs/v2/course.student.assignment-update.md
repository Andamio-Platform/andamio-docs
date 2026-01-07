# `/tx/v2/student/course/assignment/update`

## Unchanged SLT Hash

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
  "assignmentInfo": "some updated assignment info"
}
```

### Example Query
```bash
curl -X 'POST' \
  'https://atlas-api-preprod-507341199760.us-central1.run.app/tx/v2/student/course/assignment/update' \
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
  "assignmentInfo": "some updated assignment info"
}'
```

### Response Decoded CBOR

```json
{
  "body": {
    "inputs": [
      {
        "transaction_id": "a3c23eddf37056d361c8cb6680957eac601b4c07dcfb29eae2130b913138af7b",
        "index": 0
      },
      {
        "transaction_id": "a3c23eddf37056d361c8cb6680957eac601b4c07dcfb29eae2130b913138af7b",
        "index": 2
      },
      {
        "transaction_id": "a3c23eddf37056d361c8cb6680957eac601b4c07dcfb29eae2130b913138af7b",
        "index": 5
      }
    ],
    "outputs": [
      {
        "address": "addr_test1qzdgudzgf00ghdd8tw5ylylk4t76hsgm9pvr9ce73etppk0c8aursjfdhu7nr3sxujgczt2ndefwfc80pphdafv7fnrqact99a",
        "amount": {
          "coin": "1172320",
          "multiasset": {
            "4758613867a8a7aa500b5d57a0e877f01a8e63c1365469589b12063c": {
              "756d616e616765725f303031": "1"
            }
          }
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1xzg7rrkaypn8m64pus8q3ydenu433mzddq3a25atanz77xyey3l3jfdh9fjp5r36meser0d70vlrls0agh62ur622jmq88awls",
        "amount": {
          "coin": "1504190",
          "multiasset": {
            "91e18edd20667deaa1e40e0891b99f2b18ec4d6823d553abecc5ef18": {
              "6d616e616765725f303031": "1"
            }
          }
        },
        "plutus_data": {
          "Data": "{\"constructor\":1,\"fields\":[{\"bytes\":\"8dcbe1b925d87e6c547bbd8071c23a712db4c32751454b0948f8c846e9246b5c\"},{\"bytes\":\"736f6d6520757064617465642061737369676e6d656e7420696e666f\"},{\"list\":[]}]}"
        },
        "script_ref": null
      },
      {
        "address": "addr_test1qzdgudzgf00ghdd8tw5ylylk4t76hsgm9pvr9ce73etppk0c8aursjfdhu7nr3sxujgczt2ndefwfc80pphdafv7fnrqact99a",
        "amount": {
          "coin": "24159379",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      },
      {
        "address": "addr_test1qzdgudzgf00ghdd8tw5ylylk4t76hsgm9pvr9ce73etppk0c8aursjfdhu7nr3sxujgczt2ndefwfc80pphdafv7fnrqact99a",
        "amount": {
          "coin": "20765475",
          "multiasset": null
        },
        "plutus_data": null,
        "script_ref": null
      }
    ],
    "fee": "277568",
    "ttl": null,
    "certs": null,
    "withdrawals": null,
    "update": null,
    "auxiliary_data_hash": null,
    "validity_start_interval": null,
    "mint": null,
    "script_data_hash": "ce263232c0ae6913383ce71081be9bedb7ee6e601c662685ed4866884c4cabde",
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
        "coin": "57365025",
        "multiasset": null
      },
      "plutus_data": null,
      "script_ref": null
    },
    "total_collateral": "416352",
    "reference_inputs": [
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
        "index": "1",
        "data": "{\"constructor\":1,\"fields\":[{\"constructor\":0,\"fields\":[{\"bytes\":\"8dcbe1b925d87e6c547bbd8071c23a712db4c32751454b0948f8c846e9246b5c\"},{\"bytes\":\"736f6d6520757064617465642061737369676e6d656e7420696e666f\"}]}]}",
        "ex_units": {
          "mem": "229225",
          "steps": "77126362"
        }
      }
    ]
  },
  "is_valid": true,
  "auxiliary_data": null
}
```