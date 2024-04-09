# IPFS Web3 App
This application is a IPFS File sharing NextJS app that includes wallet integration and IPFS file storage. It uses Tailwind, Typescript, Wagmi, Viem, and WalletConnect.

## Features
This application includes the following features:

  - Wallet Integration
    - Support for connecting users wallet is handled with Web3Modal
    - Show Eth Balance
    - Signing of an arbitrary message
  - Authentication & User Module
    - Users can sign a nonce to create an account for the platform.
    - Username and email can be added to account, but only the wallet address is necessary
    - User session is used across the app to validate user when making requests for guarded data
  - Database
    - A postgres database is used with Prisma ORM to handle data storage
    - 2 entities, User and File
    - Files are many to one with users, so users can track their CIDs and file info in the app
  - IPFS
    - Initially I was going to use ipfs-js, but there are many warnings that it has been deprecated for helia
    - Went ahead with helia and got it working - but seeing as this app is farely ephemeral / being updated / restarted a lot, consistent pinning was a challenge
    - Ended up leveraging a starter account with Pinata to handle IPFS transactions. This way the pins are persisted.
    - Offered encryption of files within application. Files are encrypted with a symmetric AES GCM key, but the AES key is derived from a signed nonce created by the user. This way, in order to decrypt the file, the user must sign the same nonce, which can then be used with the iv hash to re-derive the same AES key. The key then be used to decrypt the file.
    - I included a file viewer so users can view a table of the files they have uploaded.
    
## Challenges
- The crypto authentication took a little while to solve, as the NextAuth server side sessions are pretty abstracted and unique to Next. I was able to write a custom provider for authentication and use the metamask nonce signature approach as the session creation strategy.
- Encrypting the file took some time as well, but that was mostly due to the fact that I really wanted to use a signed nonce as the seed for the decryption. I tried using the Lit protocol at first, but I didn't want to deal with using testnets and gas fees. I ended up just home rolling my own solution, that is technically symmetric, but does require the user to sign a nonce with their keys to encrypt / decrypt the file - so let call it semi-asymmetric.