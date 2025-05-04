export const Boop = {
  "version": "0.1.0",
  "name": "boop",
  "instructions": [
    {
      "name": "addOperators",
      "accounts": [
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "operators",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    },
    {
      "name": "buyToken",
      "accounts": [
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bonding_curve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "trading_fees_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_sol_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recipient_token_account",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault_authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wsol",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associated_token_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "buy_amount",
          "type": "u64"
        },
        {
          "name": "amount_out_min",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelAuthorityTransfer",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeBondingCurveVault",
      "accounts": [
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault_authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bonding_curve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "recipient_token_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recipient",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associated_token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "collectTradingFees",
      "accounts": [
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "protocol_fee_recipient",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lock_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault_authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "fee_nft_account",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "locked_liquidity",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cpmm_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cp_authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool_state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lp_mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recipient_token_0_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recipient_token_1_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_0_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_1_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault_0_mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault_1_mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "locked_lp_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associated_token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program_2022",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memo_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "completeAuthorityTransfer",
      "accounts": [
        {
          "name": "pending_authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createRaydiumPool",
      "accounts": [
        {
          "name": "cpmm_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "amm_config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool_state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_0_mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_1_mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lp_mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault_authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_wsol_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator_lp_token",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_0_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_1_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "create_pool_fee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "observation_state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associated_token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createRaydiumRandomPool",
      "accounts": [
        {
          "name": "cpmm_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "amm_config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool_state",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "token_0_mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_1_mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lp_mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault_authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_wsol_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator_lp_token",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_0_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_1_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "create_pool_fee",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "observation_state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associated_token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createToken",
      "accounts": [
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_metadata_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "salt",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "createTokenFallback",
      "accounts": [
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_metadata_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "salt",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "deployBondingCurve",
      "accounts": [
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault_authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bonding_curve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_sol_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associated_token_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "creator",
          "type": "pubkey"
        },
        {
          "name": "salt",
          "type": "u64"
        }
      ]
    },
    {
      "name": "deployBondingCurveFallback",
      "accounts": [
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault_authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bonding_curve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_sol_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associated_token_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "creator",
          "type": "pubkey"
        },
        {
          "name": "salt",
          "type": "u64"
        }
      ]
    },
    {
      "name": "depositIntoRaydium",
      "accounts": [
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "amm_config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "operator_wsol_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault_authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool_state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_0_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_1_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_wsol_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program_2022",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associated_token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lp_mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cpmm_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner_lp_token",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_0_mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_1_mint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lp_token_amount",
          "type": "u64"
        },
        {
          "name": "maximum_token_0_amount",
          "type": "u64"
        },
        {
          "name": "maximum_token_1_amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "graduate",
      "accounts": [
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wsol",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "protocol_fee_recipient",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_distributor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_distributor_token_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault_authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bonding_curve_sol_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_wsol_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associated_token_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "protocol_fee_recipient",
          "type": "pubkey"
        },
        {
          "name": "token_distributor",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initiateAuthorityTransfer",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "new_authority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "lockRaydiumLiquidity",
      "accounts": [
        {
          "name": "lock_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault_authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "fee_nft_owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "fee_nft_mint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "fee_nft_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pool_state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "locked_liquidity",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lp_mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liquidity_owner_lp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "locked_lp_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_0_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "token_1_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bonding_curve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "metadata_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associated_token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadata_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "removeOperators",
      "accounts": [
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "operators",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    },
    {
      "name": "sellToken",
      "accounts": [
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bonding_curve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "trading_fees_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_sol_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seller_token_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "seller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "recipient",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associated_token_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "sell_amount",
          "type": "u64"
        },
        {
          "name": "amount_out_min",
          "type": "u64"
        }
      ]
    },
    {
      "name": "splitTradingFees",
      "accounts": [
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "wsol",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault_authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bonding_curve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "trading_fees_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fee_splitter_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associated_token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "fee_splitter_config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "fee_splitter_creator_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fee_splitter_vault_authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fee_splitter_creator_vault_authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fee_splitter_staking_mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "fee_splitter_wsol_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fee_splitter_creator_vault_authority_wsol_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fee_splitter_treasury_wsol_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fee_splitter_team_wsol_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fee_splitter_reward_pool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fee_splitter_reward_pool_staking_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fee_splitter_reward_pool_reward_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fee_splitter_reward_pool_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "swapSolForTokensOnRaydium",
      "accounts": [
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bonding_curve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "amm_config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault_authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool_state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "input_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "output_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_wsol_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "output_token_mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "input_token_mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cp_swap_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "observation_state",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount_in",
          "type": "u64"
        },
        {
          "name": "minimum_amount_out",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapTokensForSolOnRaydium",
      "accounts": [
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bonding_curve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "amm_config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault_authority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "pool_state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "input_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "output_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bonding_curve_wsol_vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "input_token_mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "output_token_mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cp_swap_program",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "observation_state",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount_in",
          "type": "u64"
        },
        {
          "name": "minimum_amount_out",
          "type": "u64"
        }
      ]
    },
    {
      "name": "togglePaused",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateConfig",
      "accounts": [
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "new_protocol_fee_recipient",
          "type": "pubkey"
        },
        {
          "name": "new_virtual_sol_reserves",
          "type": "u64"
        },
        {
          "name": "new_virtual_token_reserves",
          "type": "u64"
        },
        {
          "name": "new_graduation_target",
          "type": "u64"
        },
        {
          "name": "new_graduation_fee",
          "type": "u64"
        },
        {
          "name": "new_damping_term",
          "type": "u8"
        },
        {
          "name": "new_swap_fee_basis_points",
          "type": "u8"
        },
        {
          "name": "new_token_for_stakers_basis_points",
          "type": "u16"
        },
        {
          "name": "new_token_amount_for_raydium_liquidity",
          "type": "u64"
        },
        {
          "name": "new_max_graduation_price_deviation_basis_points",
          "type": "u16"
        },
        {
          "name": "new_max_swap_amount_for_pool_price_correction_basis_points",
          "type": "u16"
        }
      ]
    }
  ],
  "metadata": {
    "address": "boop8hVGQGqehUK2iVEMEnMrL5RbjywRzHKBmBE7ry4"
  }
} as const