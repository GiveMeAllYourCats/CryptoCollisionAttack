const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const async = require('async')
const _ = require('lodash')
const fs = require('fs')

const loop = async () => {
    let browser = await puppeteer.launch({ headless: true })

    const time = new Date()
    try {
        fs.utimesSync('./tokens-stellar.json', time, time)
    } catch (err) {
        fs.closeSync(fs.openSync('./tokens-stellar.json', 'w'))
        fs.writeFileSync('./tokens-stellar.json', JSON.stringify({ tokens: [] }))
    }
    const readTokens = JSON.parse(fs.readFileSync('./tokens-stellar.json')).tokens

    // Get public address that did recent transactions
    let pubs = []
    const populateTxs = async () => {
        while (pubs.length <= 200) {
            const newTxs = await new Promise(async (resolve) => {
                const getLastLedger = async () => {
                    const page = await browser.newPage()
                    await page.goto('https://stellarchain.io', {
                        waitUntil: 'networkidle2'
                    })
                    try {
                        await page.evaluate(() => document.querySelector('#ledgers a').outerHTML)
                    } catch (e) {
                        return await getLastLedger()
                    }
                    const data = await page.evaluate(() => document.querySelector('#ledgers a').outerHTML)
                    const $ = cheerio.load(data)
                    await page.goto(`https://stellarchain.io/ledger/${$('a').html()}`, {
                        waitUntil: 'networkidle2'
                    })
                    const data2 = await page.evaluate(() => document.querySelector('*').outerHTML)
                    await page.close()
                    return data2
                }
                const getAllAddresses = async (html) => {
                    const adresses = html.match(/[A-Z0-9]{56}/g)
                    return _.uniq(adresses)
                }

                const ledgerPage = await getLastLedger()
                return resolve(await getAllAddresses(ledgerPage))
            })
            pubs.push(...newTxs)
            pubs = _.uniq(pubs)
            pubs = pubs.filter((i) => {
                if (readTokens.includes(i)) {
                    return false
                }
                return true
            })
            console.log(`Looking for new public addresses, found ${pubs.length} so far`)
        }
    }
    await populateTxs()

    await browser.close()

    console.log(`Found ${pubs.length} unique public addresses`)
    const savepubs = []
    promises = []
    browser = await puppeteer.launch({ headless: true })

    async.forEachOfLimit(
        pubs,
        20,
        async function (pub, key) {
            return await new Promise(async (resolve) => {
                const txPage = await browser.newPage()
                await txPage.goto(`https://stellarchain.io/address/${pub}`, {
                    waitUntil: 'networkidle2'
                })
                const walletData = await txPage.evaluate(() => document.querySelector('#balance').outerHTML)
                const $ = cheerio.load(walletData)
                const tokens = parseInt($('span').text().replace(/,/g, '').split('.')[0])
                if (tokens > 0) {
                    console.log(`Found ${tokens} XLM in ${pub}`)
                    savepubs.push(pub)
                }
                await txPage.close()
                return resolve()
            })
        },
        async function (err) {
            if (err) console.error(err.message)
            await browser.close()

            const newTokens = _.uniq([...savepubs, ...readTokens])
            fs.writeFileSync('./tokens-stellar.json', JSON.stringify({ tokens: newTokens }))
            console.log(`Added ${Math.abs(readTokens.length - newTokens.length)} tokens, total = ${newTokens.length}`)
            loop()
        }
    )
}

loop()
