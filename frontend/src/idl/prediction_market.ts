export const IDL = {
  "version": "0.1.0",
  "name": "prediction_market",
  "instructions": [
    {
      "name": "createMarket",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
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
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "question",
          "type": "string"
        },
        {
          "name": "endTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "tradeShares",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "trader",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "traderTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "yesToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "noToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "traderShareAccount",
          "isMut": true,
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
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "isYes",
          "type": "bool"
        }
      ]
    },
    {
      "name": "resolveMarket",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "outcome",
          "type": "bool"
        }
      ]
    },
    {
      "name": "addLiquidity",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liquidityPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "provider",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "removeLiquidity",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liquidityPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "provider",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "question",
            "type": "string"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "resolved",
            "type": "bool"
          },
          {
            "name": "outcome",
            "type": "bool"
          },
          {
            "name": "totalLiquidity",
            "type": "u64"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "yesToken",
            "type": "publicKey"
          },
          {
            "name": "noToken",
            "type": "publicKey"
          },
          {
            "name": "liquidityPool",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "liquidityPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "publicKey"
          },
          {
            "name": "totalShares",
            "type": "u64"
          },
          {
            "name": "totalLiquidity",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "shareAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "market",
            "type": "publicKey"
          },
          {
            "name": "yesShares",
            "type": "u64"
          },
          {
            "name": "noShares",
            "type": "u64"
          },
          {
            "name": "lastUpdateTime",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "MarketNotFound",
      "msg": "Market not found"
    },
    {
      "code": 6001,
      "name": "MarketAlreadyResolved",
      "msg": "Market already resolved"
    },
    {
      "code": 6002,
      "name": "MarketNotResolved",
      "msg": "Market not resolved"
    },
    {
      "code": 6003,
      "name": "InvalidEndTime",
      "msg": "Invalid end time"
    },
    {
      "code": 6004,
      "name": "InsufficientLiquidity",
      "msg": "Insufficient liquidity"
    },
    {
      "code": 6005,
      "name": "InsufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6006,
      "name": "Unauthorized",
      "msg": "Unauthorized"
    },
    {
      "code": 6007,
      "name": "InvalidAmount",
      "msg": "Invalid amount"
    }
  ]
}; 