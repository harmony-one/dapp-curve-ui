window.addEventListener('load', async() => {
    await init()
    await init_contracts()
    await update_rate_and_fees()

    // $("#from_currency").attr('disabled', false)
})
