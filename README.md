# ethmoji-signer

Verify pure ethmoji labels using trusted signing service.

## Server

1. `cd server`
1. `npm i`
1. Edit `PORT` and `PRIVATE_KEY` in [server/app.js](./server/app.js)
	* `npm run random` — generate a random key
1. `npm run start`

#### `GET /sign?label=[string]`

* `4XX` — using API incorrectly
* `200` — `application/json`
```ts
// invalid
{
	error: string,
}
```
* `/sign` → `{"error":"empty label"}`
* `/sign?label=a` → `{"error":"expected emoji"}`
* `/sign?label=😿️_` → `{"error":"underscore allowed only at start"}`
* `/sign?label=😿️.😿️` → `{"error":"multiple labels"}`
* `/sign?label=😿️a` → `{"error":"expected emoji"}`
```ts
// valid
{
	norm: string, // may be different than "label"
	sig: string,  // 0x-prefixed hex string, 65 bytes
}
```
* `/sign?label=🐱️`  → `{"norm": "🐱", sig: "0x..."}`


## Example Usage

`http://localhost:PORT/sign?label=🐈️`
```json
{"norm":"🐈","sig":"0x71121535a96146ebabf6482f76d178cc006329e1fbf7a385f1f66d1f896bf7153224ca5a2a5ccbb88ac37b24ac863ad1d0d33b117edb51041909902b5c6602e71b"}
```
[Checker.sol](./contract/Checker.sol) → `isEmoji(norm, sig)` → **true**