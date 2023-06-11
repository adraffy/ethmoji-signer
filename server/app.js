import {createServer} from 'node:http';
import {ethers} from 'ethers';
import {ens_normalize, ens_tokenize} from '@adraffy/ens-normalize';

// ********************************************************************************
// Configuration:

const HTTP_PORT = 10000;
const PRIVATE_KEY = '0x9cee088d5451010098b5728028d9a6455d3b9639c658d4e388d9f79c53c531ab';
const SIG_PREFIX = 'ethmoji:';

// you can generate a random private key using:
// console.log(new ethers.Wallet.createRandom()._signingKey().privateKey);

// ********************************************************************************

const SIGNING_KEY = new ethers.utils.SigningKey(PRIVATE_KEY);
console.log(`Signer: ${ethers.utils.computeAddress(SIGNING_KEY.publicKey)}`);

const http = createServer(async (req, reply) => {
	console.log(new Date().toJSON(), req.method, req.url);
	try {
		if (req.method !== 'GET') throw 405;
		let url = new URL(req.url, 'http://a');
		if (url.pathname !== '/sign') throw 404;
		let label = url.searchParams.get('label');
		if (typeof label !== 'string') {
			return write_json(reply, {error: 'expected label'});
		}
		let norm;
		try {
			norm = ens_normalize(label);
		} catch (err) {
			console.log(err);
			return write_json(reply, {error: err.message});
		}
		// norm is normalized and not empty
		if (!ens_tokenize(norm).every(t => t.emoji)) {
			return write_json(reply, {error: 'not an ethmoji'});
		}
		// norm is only emoji
		let hash = ethers.utils.solidityKeccak256(
			['string', 'bytes32'],
			[SIG_PREFIX, ethers.utils.id(norm)]
		);
		let sig = SIGNING_KEY.signDigest(hash);
		sig = ethers.utils.hexConcat([sig.r, sig.s, sig.v]);
		return write_json(reply, {norm, sig});
	} catch (err) {
		reply.statusCode = Number.isInteger(err) ? err : 400;
		console.log(err);
		reply.end();
	}
});
await new Promise((ful, rej) => {
	http.once('listening', () => {
		http.removeListener('error', rej);
		ful();
	});
	http.once('error', rej);
	http.listen(HTTP_PORT);
});
console.log(`Listening on ${HTTP_PORT}`);

function write_json(out, json) {
	let buf = Buffer.from(JSON.stringify(json), 'utf8');
	out.setHeader('content-length', buf.length);
	out.setHeader('content-type', 'application/json');
	out.end(buf);
}