//adding Sentry as soon as possible
// Sentry.init({ 
//   dsn: 'https://5494f535e0244513a301f2912f5d899f@sentry.io/4169463',
//   integrations: [
//     new Sentry.Integrations.CaptureConsole({
//       levels: ['warn', 'error', 'debug', 'assert']
//     })
//   ],
// });

var swap_abi = [
    {
      "name": "TokenExchange",
      "inputs": [
        {
          "type": "address",
          "name": "buyer",
          "indexed": true
        },
        {
          "type": "int128",
          "name": "sold_id",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "tokens_sold",
          "indexed": false
        },
        {
          "type": "int128",
          "name": "bought_id",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "tokens_bought",
          "indexed": false
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "TokenExchangeUnderlying",
      "inputs": [
        {
          "type": "address",
          "name": "buyer",
          "indexed": true
        },
        {
          "type": "int128",
          "name": "sold_id",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "tpokens_sold",
          "indexed": false
        },
        {
          "type": "int128",
          "name": "bought_id",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "tokens_bought",
          "indexed": false
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "AddLiquidity",
      "inputs": [
        {
          "type": "address",
          "name": "provider",
          "indexed": true
        },
        {
          "type": "uint256[4]",
          "name": "token_amounts",
          "indexed": false
        },
        {
          "type": "uint256[4]",
          "name": "fees",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "invariant",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "token_supply",
          "indexed": false
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "RemoveLiquidity",
      "inputs": [
        {
          "type": "address",
          "name": "provider",
          "indexed": true
        },
        {
          "type": "uint256[4]",
          "name": "token_amounts",
          "indexed": false
        },
        {
          "type": "uint256[4]",
          "name": "fees",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "token_supply",
          "indexed": false
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "RemoveLiquidityImbalance",
      "inputs": [
        {
          "type": "address",
          "name": "provider",
          "indexed": true
        },
        {
          "type": "uint256[4]",
          "name": "token_amounts",
          "indexed": false
        },
        {
          "type": "uint256[4]",
          "name": "fees",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "invariant",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "token_supply",
          "indexed": false
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "CommitNewAdmin",
      "inputs": [
        {
          "type": "uint256",
          "name": "deadline",
          "indexed": true,
          "unit": "sec"
        },
        {
          "type": "address",
          "name": "admin",
          "indexed": true
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "NewAdmin",
      "inputs": [
        {
          "type": "address",
          "name": "admin",
          "indexed": true
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "CommitNewParameters",
      "inputs": [
        {
          "type": "uint256",
          "name": "deadline",
          "indexed": true,
          "unit": "sec"
        },
        {
          "type": "uint256",
          "name": "A",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "fee",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "admin_fee",
          "indexed": false
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "name": "NewParameters",
      "inputs": [
        {
          "type": "uint256",
          "name": "A",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "fee",
          "indexed": false
        },
        {
          "type": "uint256",
          "name": "admin_fee",
          "indexed": false
        }
      ],
      "anonymous": false,
      "type": "event"
    },
    {
      "outputs": [],
      "inputs": [
        {
          "type": "address[4]",
          "name": "_coins"
        },
        {
          "type": "address[4]",
          "name": "_underlying_coins"
        },
        {
          "type": "address",
          "name": "_pool_token"
        },
        {
          "type": "uint256",
          "name": "_A"
        },
        {
          "type": "uint256",
          "name": "_fee"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "constructor"
    },
    {
      "name": "get_virtual_price",
      "outputs": [
        {
          "type": "uint256",
          "name": ""
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1544135
    },
    {
      "name": "calc_token_amount",
      "outputs": [
        {
          "type": "uint256",
          "name": ""
        }
      ],
      "inputs": [
        {
          "type": "uint256[4]",
          "name": "amounts"
        },
        {
          "type": "bool",
          "name": "deposit"
        }
      ],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 6075271
    },
    {
      "name": "add_liquidity",
      "outputs": [],
      "inputs": [
        {
          "type": "uint256[4]",
          "name": "amounts"
        },
        {
          "type": "uint256",
          "name": "min_mint_amount"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 9304201
    },
    {
      "name": "get_dy",
      "outputs": [
        {
          "type": "uint256",
          "name": ""
        }
      ],
      "inputs": [
        {
          "type": "int128",
          "name": "i"
        },
        {
          "type": "int128",
          "name": "j"
        },
        {
          "type": "uint256",
          "name": "dx"
        }
      ],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 3463237
    },
    {
      "name": "get_dx",
      "outputs": [
        {
          "type": "uint256",
          "name": ""
        }
      ],
      "inputs": [
        {
          "type": "int128",
          "name": "i"
        },
        {
          "type": "int128",
          "name": "j"
        },
        {
          "type": "uint256",
          "name": "dy"
        }
      ],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 3463242
    },
    {
      "name": "get_dy_underlying",
      "outputs": [
        {
          "type": "uint256",
          "name": ""
        }
      ],
      "inputs": [
        {
          "type": "int128",
          "name": "i"
        },
        {
          "type": "int128",
          "name": "j"
        },
        {
          "type": "uint256",
          "name": "dx"
        }
      ],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 3463097
    },
    {
      "name": "get_dx_underlying",
      "outputs": [
        {
          "type": "uint256",
          "name": ""
        }
      ],
      "inputs": [
        {
          "type": "int128",
          "name": "i"
        },
        {
          "type": "int128",
          "name": "j"
        },
        {
          "type": "uint256",
          "name": "dy"
        }
      ],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 3463103
    },
    {
      "name": "exchange",
      "outputs": [],
      "inputs": [
        {
          "type": "int128",
          "name": "i"
        },
        {
          "type": "int128",
          "name": "j"
        },
        {
          "type": "uint256",
          "name": "dx"
        },
        {
          "type": "uint256",
          "name": "min_dy"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 7011969
    },
    {
      "name": "exchange_underlying",
      "outputs": [],
      "inputs": [
        {
          "type": "int128",
          "name": "i"
        },
        {
          "type": "int128",
          "name": "j"
        },
        {
          "type": "uint256",
          "name": "dx"
        },
        {
          "type": "uint256",
          "name": "min_dy"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 56419
    },
    {
      "name": "remove_liquidity",
      "outputs": [],
      "inputs": [
        {
          "type": "uint256",
          "name": "_amount"
        },
        {
          "type": "uint256[4]",
          "name": "min_amounts"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 223731
    },
    {
      "name": "remove_liquidity_imbalance",
      "outputs": [],
      "inputs": [
        {
          "type": "uint256[4]",
          "name": "amounts"
        },
        {
          "type": "uint256",
          "name": "max_burn_amount"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 56299
    },
    {
      "name": "commit_new_parameters",
      "outputs": [],
      "inputs": [
        {
          "type": "uint256",
          "name": "amplification"
        },
        {
          "type": "uint256",
          "name": "new_fee"
        },
        {
          "type": "uint256",
          "name": "new_admin_fee"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 109397
    },
    {
      "name": "apply_new_parameters",
      "outputs": [],
      "inputs": [],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 109394
    },
    {
      "name": "commit_transfer_ownership",
      "outputs": [],
      "inputs": [
        {
          "type": "address",
          "name": "_owner"
        }
      ],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 38273
    },
    {
      "name": "apply_transfer_ownership",
      "outputs": [],
      "inputs": [],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 37620
    },
    {
      "name": "revert_transfer_ownership",
      "outputs": [],
      "inputs": [],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 21295
    },
    {
      "name": "withdraw_admin_fees",
      "outputs": [],
      "inputs": [],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 16983
    },
    {
      "name": "kill_me",
      "outputs": [],
      "inputs": [],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 36648
    },
    {
      "name": "unkill_me",
      "outputs": [],
      "inputs": [],
      "constant": false,
      "payable": false,
      "type": "function",
      "gas": 21385
    },
    {
      "name": "coins",
      "outputs": [
        {
          "type": "address",
          "name": ""
        }
      ],
      "inputs": [
        {
          "type": "int128",
          "name": "arg0"
        }
      ],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1560
    },
    {
      "name": "underlying_coins",
      "outputs": [
        {
          "type": "address",
          "name": ""
        }
      ],
      "inputs": [
        {
          "type": "int128",
          "name": "arg0"
        }
      ],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1590
    },
    {
      "name": "balances",
      "outputs": [
        {
          "type": "uint256",
          "name": ""
        }
      ],
      "inputs": [
        {
          "type": "int128",
          "name": "arg0"
        }
      ],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1620
    },
    {
      "name": "A",
      "outputs": [
        {
          "type": "uint256",
          "name": ""
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1451
    },
    {
      "name": "fee",
      "outputs": [
        {
          "type": "uint256",
          "name": ""
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1481
    },
    {
      "name": "admin_fee",
      "outputs": [
        {
          "type": "uint256",
          "name": ""
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1511
    },
    {
      "name": "owner",
      "outputs": [
        {
          "type": "address",
          "name": ""
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1541
    },
    {
      "name": "tokenAddress",
      "outputs": [
        {
          "type": "address",
          "name": ""
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1571
    },
    {
      "name": "admin_actions_deadline",
      "outputs": [
        {
          "type": "uint256",
          "unit": "sec",
          "name": ""
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1601
    },
    {
      "name": "transfer_ownership_deadline",
      "outputs": [
        {
          "type": "uint256",
          "unit": "sec",
          "name": ""
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1631
    },
    {
      "name": "future_A",
      "outputs": [
        {
          "type": "uint256",
          "name": ""
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1661
    },
    {
      "name": "future_fee",
      "outputs": [
        {
          "type": "uint256",
          "name": ""
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1691
    },
    {
      "name": "future_admin_fee",
      "outputs": [
        {
          "type": "uint256",
          "name": ""
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1721
    },
    {
      "name": "future_owner",
      "outputs": [
        {
          "type": "address",
          "name": ""
        }
      ],
      "inputs": [],
      "constant": true,
      "payable": false,
      "type": "function",
      "gas": 1751
    }
  ]
