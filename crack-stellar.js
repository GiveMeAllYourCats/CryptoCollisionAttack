const async = require('async')
const fs = require('fs')
const StellarSdk = require('stellar-base')
const notifier = require('node-notifier')

function log(msg) {
    console.log(`[${process.pid}]`, new Date(), msg)
}

if (!StellarSdk.FastSigning) log(`StellarSdk.FastSigning = false - this will be slow`)

const getScore = function (val1, val2) {
    var matches = 0
    for (var i = 0; i <= val1.length; i++) {
        if (val1[i] === val2[i]) {
            matches++
        }
    }

    return matches
}

let last
let highestCorrectCombination = 0
process.on('message', async (addresses) => {
    addresses = JSON.parse(addresses)
    const crack = () => {
        let cracked = 0
        async.forEachOfLimit(
            addresses,
            3,
            function (value, key, callback) {
                const pair = StellarSdk.Keypair.random()
                const pub = pair.publicKey()
                if (pub === value) {
                    const secret = pair.secret()
                    const time = new Date()
                    try {
                        fs.utimesSync('./cracked.txt', time, time)
                    } catch (err) {
                        fs.closeSync(fs.openSync('./cracked.txt', 'w'))
                    }
                    log('COLLISION!!!!!!')
                    log({
                        type: 'STELLAR',
                        timestamp: new Date(),
                        public: pub,
                        secret: secret
                    })
                    fs.writeFileSync(
                        './cracked.txt',
                        `\n------------------------\n${JSON.stringify({
                            type: 'STELLAR',
                            timestamp: new Date(),
                            public: pub,
                            secret: secret
                        })}`,
                        { flag: 'a+' }
                    )
                    notifier.notify({
                        title: 'Crypto Lottery!',
                        message: `COLLISION!!!!!!`
                    })
                    log('COLLISION!!!!!!')
                    process.exit()
                }
                cracked++
                const score = getScore(pub, value)
                last = pub
                if (score > highestCorrectCombination) highestCorrectCombination = score
                callback()
            },
            function (err) {
                if (err) console.error(err.message)
                process.send({ cracked, highestCorrectCombination, last })
                process.nextTick(crack)
            }
        )
    }

    crack()
})
