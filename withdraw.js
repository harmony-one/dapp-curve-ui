var token_balance;
var token_supply;

async function update_balances() {
    var default_account = ETH_ADDR;
    if (default_account) {
        for (let i = 0; i < CONFIG.numCoins; i++) {
            let rawBalance =  await COINS[i].methods.balanceOf(default_account).call(CALL_OPTION)
            wallet_balance[i] = convertBN(rawBalance) / CONFIG.coinPrecision[i]
        }

        token_balance = convertBN(await SWAP_TOKEN.methods.balanceOf(default_account).call(CALL_OPTION));
    }
    else {
        token_balance = 0;
    }
    // console.log("update balances", 1)
    for (let i = 0; i < CONFIG.numCoins; i++) {
        BALANCES[i] = convertBN(await SWAP.methods.balances(i).call(CALL_OPTION)) / CONFIG.coinPrecision;
        if(!default_account) BALANCES[i] = 0
    }
    token_supply = convertBN(await SWAP_TOKEN.methods.totalSupply().call(CALL_OPTION));
    FEE = parseInt(await SWAP.methods.fee().call(CALL_OPTION)) / 1e10;
}

function handle_change_amounts() {
    return async function() {
        var real_values = [...$("[id^=currency_]")].map((x,i) => +($(x).val()));
        var values = [...$("[id^=currency_]")].map((x,i) => $(x).val() * cBN(CONFIG.coinPrecision[i]))
        let show_nobalance = false;
        let show_nobalance_i = 0;
        for(let i = 0; i < CONFIG.numCoins; i++) {
            let coin_balance = convertBN(await SWAP.methods.balances(i).call(CALL_OPTION)) ;
            // console.log("coin balance", coin_balance.toString())
            // console.log("real value", real_values[i].toString())
            if(coin_balance.lt(cBN(values[i]))) {
                show_nobalance |= true;
                show_nobalance_i = i;
            }
            else
                show_nobalance |= false;
        }
        if(show_nobalance) {
            $("#nobalance-warning").show();
            $("#nobalance-warning span").text($("label[for='currency_"+show_nobalance_i+"']").text());
            return;
        }
        else {
            $("#nobalance-warning").hide();
        }

        let withdraw = new Array(CONFIG.numCoins)
        for (let i = 0; i < CONFIG.numCoins; i++) {
            withdraw[i] = valToBN(real_values[i], CONFIG.coinPrecision[i])
        }

        try {
            var availableAmount = convertBN(await SWAP.methods.calc_token_amount(withdraw, false).call(CALL_OPTION))
            availableAmount = availableAmount / (1 - FEE * CONFIG.numCoins / (4 * (CONFIG.numCoins - 1)))
            var default_account = ETH_ADDR
            var maxAvailableAmount = convertBN(await SWAP_TOKEN.methods.balanceOf(default_account).call(CALL_OPTION));

            if(availableAmount > maxAvailableAmount) {
                $('[id^=currency_]').css('background-color', 'red');
            }
            else {
                $('[id^=currency_]').css('background-color', '#036574');
            }
            await calc_slippage(false);

            var share = $('#liquidity-share');
            share.val('---');
            share.css('background-color', '#707070');
            share.css('color', '#d0d0d0');
        }
        catch(err) {
            console.error(err)
            $('[id^=currency_]').css('background-color', 'red');
        }
    }
}

function handle_change_share() {
    var share = $('#liquidity-share');
    var val = share.val();

    // console.log("handle change share")
    share.css('background-color', '#036574');
    share.css('color', 'aqua');
    if (val == '---') {
        share.val('0.0');
        val = 0;
    }
    else if ((val > 100) | (val < 0)) {
        share.css('background-color', 'red');
        return
    }

    for (let i = 0; i < CONFIG.numCoins; i++) {
        var cur = $('#currency_' + i);
        if ((val >=0) && (val <= 100)) {
            let share = token_balance / token_supply
            // console.log("token balance", token_balance.toString())
            // console.log("token supply", token_supply.toString())
            let portion = cBN(val) / cBN(100)
            // console.log("portion", portion.toString())
            let liquidity = share * portion * BALANCES[i]
            // console.log("balances", BALANCES[i])
            // console.log("calculated portion", liquidity)
            cur.val(liquidity.toFixed(2))
        }
        else
            cur.val('0.00');
        cur.css('background-color', '#707070');
        cur.css('color', '#d0d0d0');
    }
}

async function handle_remove_liquidity() {
    var share = $('#liquidity-share');
    var share_val = share.val();
    var amounts = userInputToBNWithdraw()
    var min_amounts = []

    // var default_account = (await web3provider.eth.getAccounts())[0];
    if (share_val == '---') {
        let token_amount = await SWAP.methods.calc_token_amount(amounts, false).call(CALL_OPTION);

        token_amount = token_amount.mul(BN(101)).div(BN(1000))
        // console.log("wallet balance", token_balance.toString())
        // console.log("token amount", token_amount.toString())
        await SWAP.methods.remove_liquidity_imbalance(amounts, token_amount).send(CALL_OPTION);
    }
    else {
        for (let i = 0; i < CONFIG.numCoins; i++) {
            min_amounts[i] = amounts[i].mul(BN(97)).div(BN(100))
        }
        var amount = cBN(Math.floor(share_val / 100 * token_balance).toString()).toFixed(0,1);
        if (share_val == 100)
            amount = await SWAP_TOKEN.methods.balanceOf(default_account).call(CALL_OPTION);

        await SWAP.methods.remove_liquidity(amount, min_amounts).send(CALL_OPTION);
    }
    // console.log("liquidity removed")
    if(share_val != '---') {
        handle_change_amounts();
    }
    await update_balances();
    await update_rate_and_fees();
}

async function init_ui() {
    for (let i = 0; i < CONFIG.numCoins; i++) {
        $('#currency_' + i).prop('disabled', true)
        // $('#currency_' + i).focus(handle_change_amounts(i));
        // $('#currency_' + i).on('input', debounced(100, handle_change_amounts(i)));
    }
    $('#liquidity-share').focus(handle_change_share);
    $('#liquidity-share').on('input', handle_change_share);

    // console.log("handle change share")
    await update_rate_and_fees()
    await handle_change_share();

    $("#remove-liquidity").click(handle_remove_liquidity);
}

window.addEventListener('load', async () => {

    await initWallet();
    await init_contracts()
    await update_rate_and_fees();
    // console.log("update balances")
    await update_balances();
    // console.log("init ui")
    await init_ui();
});

function getBNCoinPrecision(i) {
    return BN(cBN(CONFIG.coinPrecision(i)).toString())
}

function userInputToBNWithdraw() {
    let real_values = [...$("[id^=currency_]")].map((x,i) => +($(x).val()));
    let withdraw = new Array(CONFIG.numCoins)
    for (let i = 0; i < CONFIG.numCoins; i++) {
        withdraw[i] = valToBN(real_values[i], CONFIG.coinPrecision[i])
    }
    return withdraw
}
