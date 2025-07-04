export const MerkleDistributor = {
  "version": "0.1.0",
  "name": "merkle_distributor",
  "instructions": [
    {
      "name": "newDistributor",
      "accounts": [
        {
          "name": "distributor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "base",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clawbackReceiver",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "version",
          "type": "u64"
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "maxTotalClaim",
          "type": "u64"
        },
        {
          "name": "maxNumNodes",
          "type": "u64"
        },
        {
          "name": "startVestingTs",
          "type": "i64"
        },
        {
          "name": "endVestingTs",
          "type": "i64"
        },
        {
          "name": "clawbackStartTs",
          "type": "i64"
        },
        {
          "name": "activationPoint",
          "type": "u64"
        },
        {
          "name": "activationType",
          "type": "u8"
        },
        {
          "name": "closable",
          "type": "bool"
        }
      ]
    },
    {
      "name": "newDistributor2",
      "accounts": [
        {
          "name": "distributor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "base",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clawbackReceiver",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "version",
          "type": "u64"
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "totalClaim",
          "type": "u64"
        },
        {
          "name": "maxNumNodes",
          "type": "u64"
        },
        {
          "name": "startVestingTs",
          "type": "i64"
        },
        {
          "name": "endVestingTs",
          "type": "i64"
        },
        {
          "name": "clawbackStartTs",
          "type": "i64"
        },
        {
          "name": "activationPoint",
          "type": "u64"
        },
        {
          "name": "activationType",
          "type": "u8"
        },
        {
          "name": "closable",
          "type": "bool"
        },
        {
          "name": "totalBonus",
          "type": "u64"
        },
        {
          "name": "bonusVestingDuration",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closeDistributor",
      "accounts": [
        {
          "name": "distributor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "destinationTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closeClaimStatus",
      "accounts": [
        {
          "name": "claimStatus",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimant",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setActivationPoint",
      "accounts": [
        {
          "name": "distributor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "activationPoint",
          "type": "u64"
        }
      ]
    },
    {
      "name": "newClaim",
      "accounts": [
        {
          "name": "distributor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimStatus",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "from",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimant",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountUnlocked",
          "type": "u64"
        },
        {
          "name": "amountLocked",
          "type": "u64"
        },
        {
          "name": "proof",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        }
      ]
    },
    {
      "name": "claimLocked",
      "accounts": [
        {
          "name": "distributor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimStatus",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "from",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimant",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "clawback",
      "accounts": [
        {
          "name": "distributor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "from",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "to",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "claimant",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setClawbackReceiver",
      "accounts": [
        {
          "name": "distributor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newClawbackAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setAdmin",
      "accounts": [
        {
          "name": "distributor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "newAdmin",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "metadata": {}
} as const