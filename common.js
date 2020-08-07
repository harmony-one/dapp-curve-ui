var cBN = (val) => new BigNumber(val);
var BN = (val) => new bn(val)
const trade_timeout = 1800;
const max_allowance = BN(2).pow(BN(256)).sub(BN(1));

function convertBN(val) {
    return cBN(val.toString())
}


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
                console.log("coin addr", addr)
                coins[i] = contractFactory.createContract(ERC20_abi, addr)
            })
        )
        promises.push(
            swap.methods.underlying_coins(i).call(CALL_OPTION).then((addr) => {
                console.log("underlying addr", addr)
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
    console.log('=================')
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
        BALANCES[i] = cBN(balance.toString()) / CONFIG.coinPrecision[i]
        console.log(i, "balance:", BALANCES[i])
        $(bal_info[i]).text(BALANCES[i].toFixed(2));
        total += BALANCES[i];
    })
    $(bal_info[numCoins]).text(total.toFixed(2));

    // Display fee and admin fees
    let rawFee = await swap.methods.fee().call(CALL_OPTION)
    console.log("raw fee", rawFee.toString())
    FEE = cBN(rawFee.toString()) / 1e10

    let rawAdminFee = await swap.methods.admin_fee().call(CALL_OPTION)
    console.log("raw admin fee", rawAdminFee.toString())
    ADMIN_FEE = cBN(rawFee.toString()) / 1e10;
    $('#fee-info').text((FEE * 100).toFixed(3));
    $('#admin-fee-info').text((ADMIN_FEE * 100).toFixed(3));

    if (!ETH_ADDR) {
        console.log("no wallet loaded")
        return
    }

    let addr = ETH_ADDR
    let raw_token_balance = await swapToken.methods.balanceOf(addr).call(CALL_OPTION)
    let token_balance = cBN(raw_token_balance.toString());
    if (token_balance > 0) {
        let raw_token_supply = await swapToken.methods.totalSupply().call(CALL_OPTION)
        let token_supply = cBN(raw_token_supply.toString());
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

function debounced(delay, fn) {
    let timerId;
    return function (...args) {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            fn(...args);
            timerId = null;
        }, delay);
    }
}

function makeCancelable(promise) {
    let rejectFn;

    const wrappedPromise = new Promise((resolve, reject) => {
        rejectFn = reject;

        Promise.resolve(promise)
            .then(resolve)
            .catch(reject);
    });

    wrappedPromise.cancel = (reason) => {
        rejectFn({ canceled: true, reason: reason });
    };

    return wrappedPromise;
};

async function ensure_underlying_allowance(i, _amount) {
    var default_account = ETH_ADDR;
    var amount = BN(_amount);
    var rawAllowance = await UL_COINS[i].methods.allowance(default_account, CONFIG.swapContract).call(CALL_OPTION)
    let current_allowance = BN(rawAllowance)

    console.log("cur allowance", current_allowance.toString())

    if (current_allowance.eq(amount))
        return false;
    console.log("ensure_underlying_allowance 2")
    if ((BN(_amount).eq(max_allowance)) & (current_allowance.gt(max_allowance.div(BN(2)))))
        return false;  // It does get spent slowly, but that's ok
    console.log("ensure_underlying_allowance 3")

    if ((current_allowance.gt(BN(0))) & (current_allowance.lt(amount)))
        return
    amount = BN(amount.toString())
    console.log("approve", amount.toString())
    return approve(UL_COINS[i], amount, default_account);
}

function approve(contract, amount, account) {
    return new Promise(resolve => {
        contract.methods.approve(CONFIG.swapContract, amount)
            .send({
                gasPrice: CONFIG.gasPrice,
                gasLimit: CONFIG.gasLimit,
            })
            .once('transactionHash', function(hash) {
                console.log("transactionHash")
                resolve(true);
            });
    });
}


