import {createServer} from 'node:http';
import {ethers} from 'ethers';
import {ens_normalize, ens_tokenize} from '@adraffy/ens-normalize';

// ********************************************************************************
// Configuration:

const HTTP_PORT = 10000;
const PRIVATE_KEY = '0x9cee088d5451010098b5728028d9a6455d3b9639c658d4e388d9f79c53c531ab'; // npm run random
const SIG_PREFIX = 'ethmoji:';

// ********************************************************************************

const SIGNING_KEY = new ethers.utils.SigningKey(PRIVATE_KEY);
console.log(`Signer: ${ethers.utils.computeAddress(SIGNING_KEY.publicKey)}`);

const http = createServer(async (req, reply) => {
	console.log(new Date().toJSON(), req.method, req.url);
	try {
		if (req.method !== 'GET') throw 405;
		let url = new URL(req.url, 'http://a');
		if (url.pathname !== '/sign') throw 404;
		let label = url.searchParams.get('label') ?? '';
		let norm;
		try {
			norm = ens_normalize(label);
		} catch (err) {
			return write_json(reply, {error: err.message});
		}
		if (norm.includes('.')) {
			return write_json(reply, {error: 'multiple labels'});
		}
		if (ens_tokenize(label).some(x => !x.emoji)) {
			return write_json(reply, {error: 'expected emoji'});
		}
		let hash = ethers.utils.solidityKeccak256(
			['string', 'bytes32'],
			[SIG_PREFIX, ethers.utils.id(norm)]
		);
		let sig = SIGNING_KEY.signDigest(hash);
		sig = ethers.utils.hexConcat([sig.r, sig.s, sig.v]);
		return write_json(reply, {norm, sig});
	} catch (err) {
		if (Number.isInteger(err)) {
			reply.statusCode = err;
			reply.end();
		} else {
			reply.statusCode = 400;
			reply.end(err.message);
		}
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