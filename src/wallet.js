const {HarmonyExtension} = require('@harmony-js/core')
const {ChainType} = require('@harmony-js/utils')
const { fromBech32 } = require('@harmony-js/crypto')
const {Messenger, Provider} = require('@harmony-js/network')

/**
 * Get the harmony extension and set correct messenger for the given chain info
 *
 * @param endpoint - endpoint of the chain you are talking to
 * @param shard - the shard of the chain you are talking to
 * @param chaindID - the chainID of the chain you are talking to
 * @returns {HarmonyExtension}
 */

async function getExtension(config) {
    let ext
    if (window.onewallet) {
        ext = await new HarmonyExtension(window.onewallet)
        // Hack because mathwallet instantiation is not good.
        // WARNING: order matters
        console.log("creating a new provider")
        let p = new Provider(config.endpoint)
        console.log(p.provider.url)

        console.log("after")
        ext.provider = new Provider(config.endpoint).provider
        console.log(ext.provider.url)
        ext.messenger = new Messenger(ext.provider, ChainType.Harmony, config.chainID)
        ext.setShardID(config.shard)
        ext.wallet.messenger = ext.messenger
        ext.blockchain.messenger = ext.messenger
        ext.transactions.messenger = ext.messenger
        ext.contracts.wallet = ext.wallet
    } else {
        console.error("Could not load harmony extension")
    }
    return ext
}

module.exports = {
    getExtension: getExtension,
    oneToEthAddr: fromBech32,
}
