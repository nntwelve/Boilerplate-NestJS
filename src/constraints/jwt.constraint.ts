import * as crypto from 'node:crypto';

export const { privateKey: at_private_key, publicKey: at_public_key } =
	crypto.generateKeyPairSync('rsa', {
		modulusLength: 2048,
	});

export const { privateKey: rt_private_key, publicKey: rt_public_key } =
	crypto.generateKeyPairSync('rsa', {
		modulusLength: 2048,
	});
