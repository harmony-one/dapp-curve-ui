var cBN = (val) => new BigNumber(val);
var BN = (val) => new bn(val)
const trade_timeout = 1800;
const max_allowance = BN(2).pow(BN(256)).sub(BN(1));
let wallet_balance = new Array(CONFIG.numCoins)

function convertBN(val) {
    return cBN(val.toString())
}

async function init_contracts() {
    if (EXT == null){
        console.error("call init_contracts before init extension")
    }

    let contractFactory = EXT.contracts
    // console.log("before create contract")
    let swap = contractFactory.createContract(swap_abi, CONFIG.swapContract);
    let swapToken = contractFactory.createContract(ERC20_abi, CONFIG.poolToken);

    let coins = new Array(CONFIG.numCoins)
    let ul_coins = new Array(CONFIG.numCoins)

    let promises = []
    for (let i = 0; i < CONFIG.numCoins; i++) {
        promises.push(
            swap.methods.coins(i).call(CALL_OPTION).then((addr) => {
                // console.log("coin addr", addr)
                coins[i] = contractFactory.createContract(ERC20_abi, addr)
            })
        )
        promises.push(
            swap.methods.underlying_coins(i).call(CALL_OPTION).then((addr) => {
                // console.log("underlying addr", addr)
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
    // console.log('=================')
    // console.log("update fee", SWAP)
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
        // console.log(i, "balance:", BALANCES[i])
        $(bal_info[i]).text(BALANCES[i].toFixed(2));
        total += BALANCES[i];
    })
    $(bal_info[numCoins]).text(total.toFixed(2));

    // Display fee and admin fees
    let rawFee = await swap.methods.fee().call(CALL_OPTION)
    // console.log("raw fee", rawFee.toString())
    FEE = cBN(rawFee.toString()) / 1e10

    let rawAdminFee = await swap.methods.admin_fee().call(CALL_OPTION)
    // console.log("raw admin fee", rawAdminFee.toString())
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

    // console.log("cur allowance", current_allowance.toString())

    if (current_allowance.eq(amount)){
        // console.log("allowance exactly the same. return")
        return false;
    }

    if ((BN(_amount).eq(max_allowance)) & (current_allowance.gt(max_allowance.div(BN(2))))) {
        // console.log("infinite trust already given")
        return false;  // It does get spent slowly, but that's ok
    }
    // console.log("before reset allowance")
    // if ((current_allowance.gt(BN(0))) & (current_allowance.lt(amount)))
    //     console.log("resetting allowance")
    //     await approve(UL_COINS[i], '0', default_account);

    // console.log("approve", amount.toString())
    return await approve(UL_COINS[i], amount.toString(), default_account);
}

async function ensure_allowance(amounts) {
    var default_account = ETH_ADDR;
    var total_fees_spent = 0
    var allowances = new Array(CONFIG.numCoins);
    for (let i=0; i < CONFIG.numCoins; i++)
        allowances[i] = await COINS[i].methods.allowance(default_account, CONFIG.swapContract).call(CALL_OPTION);

    if (amounts) {
        // Non-infinite
        for (let i=0; i < CONFIG.numCoins; i++) {
            if (allowances[i].lt(amounts[i])) {
                // console.log("ensure allowance", i, amounts[i].toString())
                // if (allowances[i] > 0)
                //     await approve(COINS[i], BN(0), default_account);
                let response = await approve(COINS[i], amounts[i], default_account);
                if (response.transaction != null){
                    total_fees_spent += CONFIG.gasPrice * response.transaction.receipt.gasUsed * 1e-18
                }
            }
        }
    }
    else {
        // Infinite
        for (let i=0; i < CONFIG.numCoins; i++) {
            if (allowances[i].lt(max_allowance.div(BN(2)))) {
                // if (allowances[i] > 0)
                //     await approve(COINS[i], BN(0), default_account);
                let response = await approve(COINS[i], BN(max_allowance.toString()), default_account);
                if (response.transaction != null){
                    total_fees_spent += CONFIG.gasPrice * response.transaction.receipt.gasUsed * 1e-18
                }
            }
        }
    }
    return total_fees_spent
}

async function approve(contract, amount, account) {
    return contract.methods.approve(CONFIG.swapContract, amount)
        .send({
            gasPrice: CONFIG.gasPrice,
            gasLimit: CONFIG.gasLimit,
        })
        // .then( () => {
        //     console.log("proof sent")
        // }
}

async function calc_slippage(deposit) {
    // console.log("calc_slippage")
    var real_values = [...$("[id^=currency_]")].map((x,i) => +($(x).val()));
    var Sr = real_values.reduce((a,b) => a+b, 0);

    let values = new Array(CONFIG.numCoins)
    for (let i = 0; i < CONFIG.numCoins; i++) {
        values[i] = valToBN(real_values[i], CONFIG.coinPrecision[i])
        // console.log("values[i]", values[i].toString())
    }
    var token_amount = await SWAP.methods.calc_token_amount(values, deposit).call(CALL_OPTION);
    var virtual_price = await SWAP.methods.get_virtual_price().call(CALL_OPTION);

    // console.log("virtual_price", virtual_price, virtual_price.toString())
    // console.log("token_amount", token_amount, token_amount.toString())
    var Sv = virtual_price.mul(token_amount).div(BN(10).pow(BN(36)));
    // console.log("bn Sv", Sv.toString())
    Sv = convertBN(Sv)

    for(let i = 0; i < CONFIG.numCoins; i++) {
        let coin_balance = convertBN(await SWAP.methods.balances(i).call(CALL_OPTION));
        if(!deposit) {
            if(coin_balance < real_values[i]) {
                $("#nobalance-warning").show();
                $("#nobalance-warning span").text($("label[for='currency_"+i+"']").text());
            }
            else
                $("#nobalance-warning").hide();
        }
    }
    if (deposit)
        slippage = Sv / Sr
    else
        slippage = Sr / Sv;
    slippage = slippage - 1;
    slippage = slippage || 0
    // console.log("end calculating slip page", slippage)
    if(slippage < -0.005) {
        $("#bonus-window").hide();
        $("#highslippage-warning").removeClass('info-message').addClass('simple-error');
        $("#highslippage-warning .text").text("Warning! High slippage");
        $("#highslippage-warning .percent").text((-slippage * 100).toFixed(3));
        $("#highslippage-warning").show();
    }
    else if(slippage > 0) {
        $("#highslippage-warning").hide();
        $("#bonus-window").show();
        $("#bonus-window span").text((slippage * 100).toFixed(3));
    }
    else if(slippage <= 0) {
        $("#bonus-window").hide();
        $("#highslippage-warning").removeClass('simple-error').addClass('info-message');
        $("#highslippage-warning .text").text("Slippage");
        $("#highslippage-warning .percent").text((-slippage * 100).toFixed(3));
        $("#highslippage-warning").show();
    }
    else {
        $("#bonus-window").hide();
        $("#highslippage-warning").hide();
    }
}

function valToBN(val, precision) {
    let rounded = Math.floor(parseFloat(val) * 100)
    return BN(rounded).mul(BN(cBN(precision).toString())).div(BN(100))
}

