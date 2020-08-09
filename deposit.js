let totalTxFee = 0;

async function update_tx_fee(fee){
    $("#tx_fee").html('Transaction fee spent: ' + fee + " ONE");
}

async function handle_sync_balances() {
    var max_balances = $('#max-balances').prop('checked');
    var default_account = ETH_ADDR;

    for (let i = 0; i < CONFIG.numCoins; i++) {
        let raw = await COINS[i].methods.balanceOf(default_account).call(CALL_OPTION)
        // console.log(raw.toString())
        wallet_balance[i] = convertBN(raw) / CONFIG.coinPrecision[i]
        if(!default_account) wallet_balance[i] = 0
    }

    // console.log(wallet_balance)

    if (max_balances) {

        // console.log("MAX BALANCES flag set")

        $(".currencies input").prop('disabled', true);
        for (let i = 0; i < CONFIG.numCoins; i++) {
            var val = wallet_balance[i]
            val = val.toFixed(2)
            $('#currency_' + i).val(val);
        }
    } else{
        $(".currencies input").prop('disabled', false);
        // console.log("max balance disabled")
    }

    for (let i = 0; i < CONFIG.numCoins; i++)
        BALANCES[i] = convertBN(await SWAP.methods.balances(i).call(CALL_OPTION)) / CONFIG.coinPrecision;
}

async function handle_add_liquidity() {
    var amounts = $("[id^=currency_]").toArray().map(x => $(x).val());

    for (let i = 0; i < CONFIG.numCoins; i++) {
        // console.log("raw amounts", amounts[i])
        amounts[i] = BN(amounts[i]).mul(BN(cBN(CONFIG.coinPrecision[i]).toString()))
        // console.log("add liquidity amount", amounts[i])
    }

    // console.log("before allowance ensure")
    $("#tx_status").html('Status: Approving token deposits...');
    var feesSpent
    if ($('#inf-approval').prop('checked'))
        feesSpent = await ensure_allowance(false)
    else
        feesSpent = await ensure_allowance(amounts);
    totalTxFee += feesSpent
    await update_tx_fee(totalTxFee)
    $("#tx_status").html('Status: Depositing tokens...');
    // console.log("after allowance ensured")
    var token_amount = 0;
    if(convertBN(await SWAP_TOKEN.methods.totalSupply().call(CALL_OPTION)) > 0) {
        token_amount = convertBN(await SWAP.methods.calc_token_amount(amounts, true).call(CALL_OPTION));
        token_amount = cBN(Math.floor(token_amount * 0.99).toString()).toFixed(0,1);
    }
    for (let i = 0; i < CONFIG.numCoins; i++) {
        // console.log("add liquidity", amounts[i].toString())
        amounts[i] = BN(amounts[i].toString())
        // console.log("add liquidity", amounts[i].toString())
    }

    let response = await SWAP.methods.add_liquidity(amounts, BN(token_amount.toString())).send(CALL_OPTION);
    if (response.transaction == null) {
        $("#tx_status").html('');
        return
    }
    totalTxFee += CONFIG.gasPrice * response.transaction.receipt.gasUsed * 1e-18
    await handle_sync_balances();
    await update_rate_and_fees();
    await update_tx_fee(totalTxFee);
    $("#tx_status").html('Status: Successfully deposited tokens!');
    $("#add-liquidity").html('Deposit More')
}

async function init_ui() {
    let infapproval = true;
    for (let i = 0; i < CONFIG.numCoins; i++) {
        var default_account = ETH_ADDR;
        if ((await COINS[i].methods.allowance(default_account, CONFIG.swapContract).call(CALL_OPTION)).lte(max_allowance.div(BN(2))))
            infapproval = false;

        $('#currency_' + i).on('input', debounced(100, async function() {
            await calc_slippage(true)

            var el = $('#currency_' + i);
            if (el.val() > BALANCES[i])
                el.css('background-color', 'red')
            else
                el.css('background-color', '#036574');
        }));
    }

    if (infapproval)
        $('#inf-approval').prop('checked', true)
    else
        $('#inf-approval').prop('checked', false);

    $('#sync-balances').change(handle_sync_balances);
    $('#max-balances').change(handle_sync_balances);
    $("#add-liquidity").click(handle_add_liquidity);
    await update_tx_fee(0);
}

window.addEventListener('load', async () => {
        $("#max-balances").prop('disabled', true)
        $("#add-liquidity").prop('disabled', true)

        await initWallet()
        await init_contracts();
        await update_rate_and_fees();
        await handle_sync_balances();
        await calc_slippage(true);
        
        await init_ui();
        $("#max-balances").prop('disabled', false)
        $("#add-liquidity").prop('disabled', false)
});
