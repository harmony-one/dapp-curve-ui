let CONFIG = {
    endpoint: "https://api.s0.b.hmny.io",
    shardID: 0,
    chainID: 2,

    poolToken: "0x3a647d615d6f3fe70826ad68303d953d8633daac",
    swapContract: "0xb0f725c8c7534dba32ae2870145aa3b2c2fde9dc",

    numCoins: 3,
    // TODO: change back to 1e18
    coinPrecision: [1, 1, 1],

    gasPrice: 0x4a817c800,
    gasLimit: 0x6691b7,
}

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



