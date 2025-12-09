# Example Queries

## `/tx/v2/teacher/course/modules/manage`

### Create 1 Course Module
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

### Advanced Management (great for live coding)
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
        "string"
      ],
      "allowedStudents_V2": [
        "ff80aaaf03a273b8f5c558168dc0e2377eea810badbae6eceefc14ef"
      ],
      "prerequisiteAssignments_V2": [
        "c8bc55db03d6ead9311272b7c73637e6999f8306574321f009d7053eaa98cf7b"
      ]
    }
  ],
  "modulesToUpdate": [
    {
      "sltHash": "c8bc55db03d6ead9311272b7c73637e6999f8306574321f009d7053eaa98cf7b",
      "allowedStudents_V2": [
        "ff80aaaf03a273b8f5c558168dc0e2377eea810badbae6eceefc14ef"
      ],
      "prerequisiteAssignments_V2": [
        "c8bc55db03d6ead9311272b7c73637e6999f8306574321f009d7053eaa98cf7b"
      ]
    }
  ],
  "modulesToBurn": [
    "c8bc55db03d6ead9311272b7c73637e6999f8306574321f009d7053eaa98cf7b"
  ]
}
```