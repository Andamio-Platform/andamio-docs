# Next Steps:
1. Move minting inside of Tx Rect
2. Change how Minting Redeemer is displayed
3. Implement observers inside of Tx Rect
4. Add address placeholder to every YAML
5. Add address to UTxO Rects
7. In diagram, change redeemer params to "redeemer"

# New observers field
```
observers:
  - id: init_global_state_observer
    title: "Init Global State Observer"
    address: "string"
    redeemer:
      id: init_global_state_zero_withdrawal_redeemer
      title: "(string, user_info)"
      params:
        - "alias"
        - "userInfo"
```

# Validator
1. Follow Miro diagrams that already exist
2. Try to use Blueprints only to generate the YAML code!
3. Set up validator-registry-v1.yaml
4. Use the validator-registry-v1.yaml to populate address fields in transactions
5. Allow Address to be a pointer
6. Play with color coding addresses and token names

# Clean Up
1. Show refScript in ref utxos
2. 

# Then back to tokenomics work - by 4pm