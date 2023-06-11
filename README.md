# ethmoji-signer

Verify pure ethmoji labels using trusted signing service.

### Server

1. `cd server`
1. Update `PORT` and `PRIVATE_KEY` in [server/app.js](./server/app.js)
	* `npm run random` — [generate](./server/random-pkey.js) a random key
1. `npm run start`

#### Example Server Responses
1. `http://localhost:PORT/sign?label=a`
```json
{"error":"not an ethmoji"}
```
1. `http://localhost:PORT/sign?label=🐈️`
```json
{"norm":"🐈","sig":"0x71121535a96146ebabf6482f76d178cc006329e1fbf7a385f1f66d1f896bf7153224ca5a2a5ccbb88ac37b24ac863ad1d0d33b117edb51041909902b5c6602e71b"}
```

### Contract

1. Example: [Checker.sol](./contract/Checker.sol)
1. `isEmoji("a", "...")` &rarr; **false**
1. `isEmoji("🐈", "0x7112...e71b")` &rarr; **true**