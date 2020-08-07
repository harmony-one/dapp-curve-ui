let sync_balances;

async function handle_sync_balances() {
    sync_balances = $('#sync-balances').prop('checked');
    var max_balances = $('#max-balances').prop('checked');
    var default_account = ETH_ADDR;

    for (let i = 0; i < CONFIG.numCoins; i++) {
        BALANCES[i] = parseInt(await COINS[i].methods.balanceOf(default_account).call(CALL_OPTION));
        if(!default_account) BALANCES[i] = 0
    }

    if (max_balances) {

        console.log("MAX BALANCES flag set")

        $(".currencies input").prop('disabled', true);
        for (let i = 0; i < CONFIG.numCoins; i++) {
            var val = BALANCES[i]
            val = val.toFixed(2)
            $('#currency_' + i).val(val);
        }
    } else{
        $(".currencies input").prop('disabled', false);
        console.log("max balance disabled")
    }


    for (let i = 0; i < CONFIG.numCoins; i++)
        BALANCES[i] = parseInt(await SWAP.methods.balances(i).call(CALL_OPTION));
}

async function handle_add_liquidity() {
    var default_account = ETH_ADDR;
    var max_balances = $("#max-balances").is(':checked')
    var amounts = $("[id^=currency_]").toArray().map(x => $(x).val());
    for (let i = 0; i < CONFIG.numCoins; i++) {
        let amount = BN(Math.floor(amounts[i]).toString())
        let balance = await COINS[i].methods.balanceOf(default_account).call(CALL_OPTION);
        if(Math.abs(balance/amount-1) < 0.005) {
            amounts[i] = balance;
        }
        else {
            amounts[i] = cBN(Math.floor(amounts[i] / c_rates[i]).toString()).toFixed(0,1); // -> c-tokens
        }
    }
    if ($('#inf-approval').prop('checked'))
        await ensure_allowance(false)
    else
        await ensure_allowance(amounts);
    var token_amount = 0;
    if(parseInt(await swap_token.methods.totalSupply().call()) > 0) {    
        token_amount = await swap.methods.calc_token_amount(amounts, true).call();
        token_amount = cBN(Math.floor(token_amount * 0.99).toString()).toFixed(0,1);
    }
    await swap.methods.add_liquidity(amounts, token_amount).send({
        from: default_account,
        gas: 1300000});
    await handle_sync_balances();
    update_fee_info();
}

async function init_ui() {
    let infapproval = true;
    for (let i = 0; i < N_COINS; i++) {
        var default_account = (await web3provider.eth.getAccounts())[0];
        if (cBN(await coins[i].methods.allowance(default_account, swap_address).call()).lte(max_allowance.div(cBN(2))))
            infapproval = false;

        $('#currency_' + i).on('input', debounced(100, async function() {
            await calc_slippage(true)

            var el = $('#currency_' + i);
            if (el.val() > wallet_balances[i] * c_rates[i])
                el.css('background-color', 'red')
            else
                el.css('background-color', 'blue');

            if (sync_balances) {
                for (let j = 0; j < N_COINS; j++)
                    if (j != i) {
                        var el_j = $('#currency_' + j);

                        if (balances[i] * c_rates[i] > 1) {
                            // proportional
                            var newval = $('#currency_' + i).val() / c_rates[i] * balances[j] / balances[i];
                            newval = Math.floor(newval * c_rates[j] * 100) / 100;
                            el_j.val(newval);

                        } else {
                            // same value as we type
                            var newval = $('#currency_' + i).val();
                            el_j.val(newval);
                        }

                        // Balance not enough highlight
                        if (newval > wallet_balances[j] * c_rates[j])
                            el_j.css('background-color', 'red')
                        else
                            el_j.css('background-color', 'blue');
                    }
            }
        }));
    }

    if (infapproval)
        $('#inf-approval').prop('checked', true)
    else
        $('#inf-approval').prop('checked', false);



    $('#sync-balances').change(handle_sync_balances);
    $('#max-balances').change(handle_sync_balances);
    $("#add-liquidity").click(handle_add_liquidity);
    $("#migrate-new").click(() => {
        handle_migrate_new('new');
        
    });
}

window.addEventListener('load', async () => {
    try {
        $("#max-balances").prop('disabled', true)
        $("#add-liquidity").prop('disabled', true)

        await init();
        update_fee_info();
        await handle_sync_balances();
        await calc_slippage(true);
        
        await init_ui();
        $("#max-balances").prop('disabled', false)
        $("#add-liquidity").prop('disabled', false)

    }
    catch(err) {
        console.error(err)

        if(err.reason == 'cancelDialog') {
            const web3 = new newWeb3(infura_url);
            window.web3provider = web3
            window.web3 = web3

            await init_contracts();
            update_fee_info();
            await handle_sync_balances();
            await calc_slippage(true);

            await init_ui();
        }
    }
});
