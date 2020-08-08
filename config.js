const MAINNET_CONFIG = {
    endpoint: "https://api.s0.t.hmny.io",
    shardID: 1,
    chainID: 1,

    poolToken: "0x3f8d8f755bbb73e0e8f85a4009501fc5f213fc1e",
    swapContract: "0xc08e2d250bd031409c9d87888356434c5384f188",

    numCoins: 3,
    coinPrecision: [1e18, 1e18, 1e18],

    gasPrice: 0x4a817c800,
    gasLimit: 0x6691b7,
}

const TESTNET_CONFIG = {
    endpoint: "https://api.s0.b.hmny.io",
    shardID: 0,
    chainID: 2,

    poolToken: "0xed2d6c263a0207a5b7512c20a464745d800ccf23",
    swapContract: "0x486ffe573dea3c47fe9f14be4bd2542616f872e1",

    numCoins: 3,
    coinPrecision: [1e18, 1e18, 1e18],

    gasPrice: 0x4a817c800,
    gasLimit: 0x6691b7,
}

const CONFIG = MAINNET_CONFIG

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

