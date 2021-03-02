const ProgressBar = require('progress')
const fs = require('fs')
const accurateInterval = require('accurate-interval')
const { fork } = require('child_process')
const cpus = require('os').cpus().length
const notifier = require('node-notifier')
const bar = new ProgressBar(
    ':last #:items @ :persec per/sec (max: :max) highest correct combination: :score out of 56 characters (:lastHighest)',
    {
        total: Infinity
    }
)

class Bruteforce {
    constructor() {
        console.log('Welcome to the lottery, good luck :)')
        this.total = 0
        this.perSec = 0
        this.countSec = 0
        this.max = 0
        this.lastHighest = ''
        this.last = ''
        this.highestCorrectCombination = 0
    }

    asset(type) {
        this.type = type.toLowerCase()
    }

    add(addresses) {
        if (!this.addresses) this.addresses = []
        this.addresses = [...this.addresses, ...addresses]
    }

    loadFile(file) {
        const addresses = JSON.parse(fs.readFileSync(file)).tokens
        this.add(addresses)
    }

    crack() {
        notifier.notify({
            title: 'Crypto Lottery!',
            message: `Creating wallets and checking if created public key is either one of the ${this.addresses.length} public addresses in ${cpus} parallel processes`
        })
        console.log(
            `Creating wallets and checking if created public key is either one of the ${this.addresses.length} public addresses in ${cpus} parallel processes`
        )
        accurateInterval(
            () => {
                this.perSec = Math.round(this.countSec * 4)
                this.countSec = 0
            },
            250,
            { aligned: false, immediate: true }
        )
        for (var i = 0; i <= cpus; i++) {
            setTimeout(() => {
                const child = fork(`./crack-${this.type}.js`)
                child.send(JSON.stringify(this.addresses))
                child.on('message', (data) => {
                    this.total += data.cracked
                    this.countSec += data.cracked
                    this.last = data.last
                    if (data.highestCorrectCombination > this.highestCorrectCombination) {
                        this.highestCorrectCombination = data.highestCorrectCombination
                        this.lastHighest = data.last
                    }
                    if (this.max <= this.perSec) this.max = this.perSec
                    bar.tick({
                        items: this.total,
                        persec: this.perSec,
                        max: this.max,
                        last: this.last,
                        lastHighest: this.lastHighest,
                        score: this.highestCorrectCombination
                    })
                })
            }, 10 * i)
        }
    }
}

const bf = new Bruteforce()
bf.asset('STELLAR')
bf.loadFile('./tokens-stellar.json')
bf.crack()
