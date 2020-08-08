async function initWallet(type) {
    if(!type) init_menu();

    if (EXT == null || WALLET == null ) {
        return wallet.getExtension(CONFIG)
            .then( (ext) => {
                EXT = ext
                return ext.login()
            }).then( (acc) => {
                console.log("login with acc", acc)
                console.log(Object.getOwnPropertyNames(acc))
                ONE_ADDR = acc.address
                ETH_ADDR = wallet.oneToEthAddr(ONE_ADDR)
                console.log("eth address", ETH_ADDR)
            })
    }
}

