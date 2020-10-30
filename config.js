const MAINNET_CONFIG = {
    endpoint: "https://api.s0.t.hmny.io",
    shardID: 1,
    chainID: 1,

    poolToken: "0xf6f796158afad13472158d4aa5448ffe102f78f6",
    swapContract: "0x49c8f07d873b654db2df2fef917d9bcf09625aca",
    tokenSymbol: "1DAI + hUSDC + hUSDT + 1BUSD",

    numCoins: 4,
    coinPrecision: [1e18, 1e18, 1e18, 1e18],

    gasPrice: 0x4a817c800,
    gasLimit: 0x6691b7,
}

const TESTNET_CONFIG = {
    endpoint: "https://api.s0.b.hmny.io",
    shardID: 0,
    chainID: 2,

    poolToken: "0x6e5bd0fa3afaad969f41586078712dc29da17d3c",
    swapContract: "0x52358bba21ee6ff6703f7be29845bdced180d6cb",
    tokenSymbol: "1DAI + hUSDC + hUSDT + 1BUSD",

    numCoins: 4,
    coinPrecision: [1e18, 1e18, 1e18, 1e18],

    gasPrice: 0x4a817c800,
    gasLimit: 0x6691b7,
}

// const CONFIG = MAINNET_CONFIG
const CONFIG = TESTNET_CONFIG

let CALL_OPTION = {
    gasPrice: CONFIG.gasPrice,
    gasLimit: CONFIG.gasLimit,
}

let EXT = null
let ONE_ADDR = null
let ETH_ADDR = null

let COINS = null
let UL_COINS = null
let SWAP = null
let SWAP_TOKEN = null

let BALANCES = new Array(CONFIG.numCoins)
let FEE = 0
let ADMIN_FEE = 0

