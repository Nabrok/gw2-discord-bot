const { ApolloServer } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');
const fetch = require('node-fetch');

const token_cache = {};

function getDiscordUser(token) {
	if (! token_cache[token]) token_cache[token] = fetch('https://discordapp.com/api/users/@me', {
		headers: { Authorization: `Bearer ${token}` }
	}).then(res => res.json()).then(user => {
		setTimeout(() => delete token_cache[token], 60 * 60 * 1000); // Only cache for 1 hour
		return user;
	}).catch(err => {
		delete token_cache[token];
		throw err;
	});
	return token_cache[token];
}

async function context({ req }) {
	if (req.body.operationName === 'IntrospectionQuery') return { };
	if (! req.headers.authorization) throw new Error("No token");
	const token = req.headers.authorization.replace(/^Bearer\s+/i, '');
	const user = await getDiscordUser(token);
	if (user.message) throw new Error(user.message);
	return { token, user };
}

module.exports = async (schemas, bot) => {
	const base_schema = require('./base_schema')(bot);
	const schema = buildFederatedSchema(schemas.concat([ base_schema ]));

	const apollo = new ApolloServer({ schema, context });

	const { url } = await apollo.listen();
	console.log(`GraphQL server listening at ${url}`);
};
