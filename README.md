# CryptoCollisionAttack

The point of this code is to give you a sense of how secure a 256 bit security is in cryptocurrency by doing the following:

#### Recon

1. `node gather-stellar.js` Scanning blockchain (XLM, stellar) for recent transactions
2. Checking public addresses of transactions and save the once that have a positive balance
3. Start over

#### Attack

1. `node index.js` to start the 'Collision Attack'
2. Notice how dumb your plan was to think it was possible to get a collision in 256 bit key size
3. Randomly get upset with how the world is
4. Existential crisis
