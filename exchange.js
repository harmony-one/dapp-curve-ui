let fromCurrency;
let toCurrency;
let totalTxFee = 0;

async function set_from_amount(i) {
    var default_account = ETH_ADDR;
    var el = $('#from_currency');
    let rawBalance = await UL_COINS[i].methods.balanceOf(default_account).call(CALL_OPTION)
    let balance = convertBN(rawBalance)
    let amount = Math.floor(
        100 * parseFloat(balance) / CONFIG.coinPrecision[i]
    ) / 100
    if (el.val() === '' || el.val() === 0) {
        if(!default_account) amount = 0
        $('#from_currency').val(amount.toFixed(2));
    }
    // console.log("max amount", amount.toFixed(2))
    $('fieldset:first .maxbalance span').text(amount.toFixed(2))
}

async function set_max_balance() {
    var default_account = ETH_ADDR;
    let rawBalance = await UL_COINS[fromCurrency].methods.balanceOf(default_account).call(CALL_OPTION);
    let balance = convertBN(rawBalance)
    let amount = Math.floor(
        100 * parseFloat(balance) / CONFIG.coinPrecision[fromCurrency]
    ) / 100
    $('#from_currency').val(amount.toFixed(2));
    await set_to_amount();
}

async function highlight_input() {
    let default_account = ETH_ADDR;
    let el = $('#from_currency');
    let rawBalance = await UL_COINS[fromCurrency].methods.balanceOf(default_account).call(CALL_OPTION)
    let balance = parseFloat(convertBN(rawBalance)) / CONFIG.coinPrecision[fromCurrency];
    if (el.val() > balance)
        el.css('background-color', 'red')
    else
        el.css('background-color', '#036574');
}

function promiseTimeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let promise = makeCancelable(Promise.resolve());
async function set_to_amount() {
    promise.cancel();
    promise = setAmountPromise()
        .then(async ([dy, dy_, dx_]) => {
            $('#to_currency').val(dy);
            let exchange_rate = (dy_ / dx_).toFixed(4);
            if(exchange_rate <= 0.98) $("#to_currency").css('background-color', 'red')
            else $("#to_currency").css('background-color', '#036574')
            if(isNaN(exchange_rate)) exchange_rate = "Not available"
            var default_account = ETH_ADDR;
            let rawBalance = await UL_COINS[toCurrency].methods.balanceOf(default_account).call(CALL_OPTION);
            let balance = convertBN(rawBalance)
            let amount = Math.floor(
                100 * parseFloat(balance) / CONFIG.coinPrecision[toCurrency]
            ) / 100
            $('fieldset:nth-child(2) .maxbalance span').text(amount.toFixed(2))
            $('#exchange-rate').text(exchange_rate);
            $('#from_currency').prop('disabled', false);
        })
        .catch(err => {
            // console.error(err);
            $('fieldset:nth-child(2) .maxbalance span').text(0)
            $('#exchange-rate').text("0");
            $('#from_currency').prop('disabled', true);

        })
        .finally(() => {
            highlight_input();
        })
    promise = makeCancelable(promise)
}

function setAmountPromise() {
    let promise = new Promise(async (resolve, reject) => {
        var i = fromCurrency;
        var j = toCurrency;
        var b = parseInt(await SWAP.methods.balances(i).call(CALL_OPTION));
        console.log(b)
        
        if (b >= 0.001) {
            // In c-units
            var dx_ = $('#from_currency').val();
            console.log(dx_)
            var dx = cBN(Math.round(dx_ * CONFIG.coinPrecision[i])).toFixed(0,1);
            var dy_ = parseInt(await SWAP.methods.get_dy_underlying(i, j, dx).call(CALL_OPTION)) / CONFIG.coinPrecision[j];
            var dy = dy_.toFixed(2);
            console.log(dy,dy_,dx_)
            resolve([dy, dy_, dx_])
        }
        else {
            reject("bValue")
        }
    })
    return makeCancelable(promise);
}

async function update_tx_fee(fee){
    $("#tx_fee").html('Transaction fee spent: ' + fee + " ONE");
}

async function from_cur_handler() {
    // console.log("from_cur_handler")
    fromCurrency = $('input[type=radio][name=from_cur]:checked').val();
    toCurrency = $('input[type=radio][name=to_cur]:checked').val();
    var default_account = ETH_ADDR;

    // console.log("from_cur_handler 1")
    if ((await UL_COINS[fromCurrency].methods.allowance(default_account, CONFIG.swapContract).call(CALL_OPTION)).gt(max_allowance.div(BN(2))))
        $('#inf-approval').prop('checked', true)
    else
        $('#inf-approval').prop('checked', false);

    // console.log("from_cur_handler", 2)
    await set_from_amount(fromCurrency);
    if (toCurrency == fromCurrency) {
        if (fromCurrency == 0) {
            toCurrency = 1;
        } else {
            toCurrency = 0;
        }
        $("#to_cur_" + toCurrency).prop('checked', true);
    }
    // console.log("from_cur_handler", 3)
    await set_to_amount();
}

async function to_cur_handler() {
    fromCurrency = $('input[type=radio][name=from_cur]:checked').val();
    toCurrency = $('input[type=radio][name=to_cur]:checked').val();
    if (toCurrency == fromCurrency) {
        if (toCurrency == 0) {
            fromCurrency = 1;
        } else {
            fromCurrency = 0;
        }
        $("#from_cur_" + fromCurrency).prop('checked', true);
        await set_from_amount(fromCurrency);
    }
    await set_to_amount();
}

async function handle_trade() {
    var default_account = ETH_ADDR;
    var i = fromCurrency;
    var j = toCurrency;
    var raw = await SWAP.methods.balances(i).call(CALL_OPTION)
    let b = convertBN(raw)
    var max_slippage = $("#max_slippage > input[type='radio']:checked").val();
    if(max_slippage == '-') {
        max_slippage = $("#custom_slippage_input").val() / 100;
    }
    await update_tx_fee(totalTxFee);
    // console.log("handle_trader", 1)
    if (b >= 0.001) {
        var dx = Math.floor($('#from_currency').val() * CONFIG.coinPrecision[i]);
        var min_dy = Math.floor($('#to_currency').val() * (1-max_slippage) * CONFIG.coinPrecision[j]);
        var deadline = Math.floor((new Date()).getTime() / 1000) + trade_timeout;
        dx = BN(dx.toString())
        // console.log("handle_trader", 2)
        var response
        $("#tx_status").html('Status: Approving token exchange...');
        if ($('#inf-approval').prop('checked'))
            response = await ensure_underlying_allowance(i, max_allowance)
        else
            response = await ensure_underlying_allowance(i, dx);
        if (response.transaction == null) {
            $("#tx_status").html('');
            return
        }
        totalTxFee += CONFIG.gasPrice * response.transaction.receipt.gasUsed * 1e-18
        await update_tx_fee(totalTxFee)
        $("#tx_status").html('Status: Exchanging tokens...');
        // console.log("handle_trader", 3)
        min_dy = BN(min_dy.toString());
        // console.log("trade dx", dx.toString())
        // console.log("trade dy", min_dy.toString())
        let allowance = await COINS[i].methods.allowance(ETH_ADDR, CONFIG.swapContract).call(CALL_OPTION)
        // console.log("before exchange", allowance.toString())
        response = await SWAP.methods.exchange(i, j, BN(dx.toString()), BN(0)).send({
            gasPrice: CONFIG.gasPrice,
            gasLimit: CONFIG.gasLimit,
        });
        if (response.transaction == null) {
            $("#tx_status").html('');
            return
        }
        // console.log("handle_trader", 4)
        totalTxFee += CONFIG.gasPrice * response.transaction.receipt.gasUsed * 1e-18

        await update_rate_and_fees();
        await from_cur_handler();
        await update_tx_fee(totalTxFee);
        $("#tx_status").html('Status: Successfully exchanged tokens!');
        $("#trade").html('Sell More')
    }
}

function change_max_slippage() {
    if(this.id == 'custom_slippage')
        $('#custom_slippage_input').prop('disabled', false)
    else
        $('#custom_slippage_input').prop('disabled', true)
}

async function init_ui() {
    $('input[type=radio][name=from_cur]').change(from_cur_handler);
    $('input[type=radio][name=to_cur]').change(to_cur_handler);

    $("#from_cur_0").attr('checked', true);
    $("#to_cur_1").attr('checked', true);

    $('#from_currency').on('input', debounced(100, set_to_amount));
    $('#from_currency').click(function() {this.select()});
    $('fieldset:first .maxbalance').click(set_max_balance)
    $("#max_slippage input[type='radio']").click(change_max_slippage)

    $("#trade").click(async function() {
        uiStartTrade()
        handle_trade().finally(uiResolveTrade)
    });

    await update_rate_and_fees()
    await from_cur_handler();
    await update_tx_fee(0);
    $("#from_currency").on("input", highlight_input);
}

window.addEventListener('load', async() => {
    await initWallet()
    await init_contracts()
    await init_ui()

    $("#from_currency").attr('disabled', false)
})


