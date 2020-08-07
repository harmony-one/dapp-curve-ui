async function init_contracts() {
    if (EXT == null){
        console.error("call init_contracts before init extension")
    }

    let contractFactory = EXT.contracts
    console.log("before create contract")
    let swap = contractFactory.createContract(swap_abi, CONFIG.swapContract);
    let swapToken = contractFactory.createContract(ERC20_abi, CONFIG.poolToken);

    let coins = new Array(CONFIG.numCoins)
    let ul_coins = new Array(CONFIG.numCoins)

    let promises = []
    for (let i = 0; i < CONFIG.numCoins; i++) {
        promises.push(
            swap.methods.coins(i).call(CALL_OPTION).then((addr) => {
                coins[i] = contractFactory.createContract(ERC20_abi, addr)
            })
        )
        promises.push(
            swap.methods.underlying_coins(i).call(CALL_OPTION).then((addr) => {
                ul_coins[i] = contractFactory.createContract(ERC20_abi, addr)
            })
        )
    }
    Promise.all(promises).then(console.log)

    SWAP = swap
    SWAP_TOKEN = swapToken
    COINS = coins
    UL_COINS = ul_coins
}

function init_menu() {
    $("div.top-menu-bar a").toArray().forEach(function(el) {
        if (el.href == window.location.href)
            el.classList.add('selected')
    })
}

async function update_rate_and_fees() {
    console.log("update fee", SWAP)
    let swap = SWAP
    let swapToken = SWAP_TOKEN
    let numCoins = CONFIG.numCoins

    let bal_info = $('#balances-info li span');
    let bal_info_fees = bal_info.add('#fee-info, #admin-fee-info')
    bal_info_fees.map((i, el)=>$(el).addClass('loading line'))

    // update swap contract balances
    let total = 0;
    let promises = [];
    for (let i = 0; i < numCoins; i++) {
        promises.push(swap.methods.balances(i).call(CALL_OPTION))
    }
    let resolves = await Promise.all(promises)
    bal_info_fees.map((i, el)=>$(el).removeClass('loading line'))
    resolves.forEach((balance, i) => {
        BALANCES[i] = balance.toNumber()
        console.log("i, balance:", balance)
        $(bal_info[i]).text(BALANCES[i].toFixed(2));
        total += BALANCES[i];
    })
    $(bal_info[numCoins]).text(total.toFixed(2));

    // Display fee and admin fees
    FEE = parseInt(await swap.methods.fee().call(CALL_OPTION)) / 1e10;
    ADMIN_FEE = parseInt(await swap.methods.admin_fee().call(CALL_OPTION)) / 1e10;
    $('#fee-info').text((FEE * 100).toFixed(3));
    $('#admin-fee-info').text((ADMIN_FEE * 100).toFixed(3));

    if (!ETH_ADDR) {
        console.log("no wallet loaded")
        return
    }

    let addr = ETH_ADDR
    let token_balance = parseInt(await swapToken.methods.balanceOf(addr).call(CALL_OPTION));
    if (token_balance > 0) {
        let token_supply = parseInt(await swapToken.methods.totalSupply().call(CALL_OPTION));
        let l_info = $('#lp-info li span');
        total = 0;
        for (let i=0; i < numCoins; i++) {
            let val = BALANCES[i] * token_balance / token_supply;
            total += val;
            $(l_info[i]).text(val.toFixed(2));
        }
        $(l_info[numCoins]).text(total.toFixed(2));
        $('#lp-info-container').show();
    }
}

