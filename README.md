# CryptoCollisionAttack

The point of this code is to give you a sense of how secure a 256 bit security is in cryptocurrency by doing the following:

#### Recon

1. `node gather-stellar.js` Scanning blockchain (XLM, stellar) for recent transactions
2. Checking public addresses of transactions and save the ones that have a positive balance in `tokens-stellar.json`
3. Start over

#### Attack

1. `node index.js` to start the 'Collision Attack'
2. Notice how dumb your plan was to think it was possible to get a collision in 256 bit key size
3. Randomly get upset with how the world is
4. Existential crisis


```bash
master ❯ node index.js
Welcome to the lottery, good luck :)
Creating wallets and checking if created public key is either one of the 946 public addresses in 8 parallel processes
GDOODAXOCH4DEKEXVXI7VZ5DGXIC7ELQWBXEYEK54RJ46DJWL7WY7SHZ #328262 @ 90816 per/sec (max: 105952) highest correct combination: 13 out of 56 characters (GA53ILOMNHKVLL3JTWKGNO7WAFBPVDEZAO7D4HZQINXBJP5KBM7STCZY)
```
