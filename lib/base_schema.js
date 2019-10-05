const { GraphQLScalarType, Kind } = require('graphql');
const { gql }  = require('apollo-server');
const config = require('config');
const version = require('../package').version;

const features = config.has('features.enabled') ? config.get('features.enabled').slice() : [];

const typeDefs = gql`
scalar Date

extend type Query {
	me: DiscordUser
	bot: DiscordUser
	version: String
	features: [String]
}

type DiscordUser {
	id: ID!
	username: String
	discriminator: String
	locale: String
	mfa_enabled: Boolean
	flags: Int
	avatar: String
}
`;

/**
 * @param {import('discord.js').Client} bot
 */
module.exports = bot => ({
	typeDefs, resolvers: {
		Date: new GraphQLScalarType({
			description: 'Date custom scalar type',
			name: 'Date',
			parseLiteral: ast => ast.kind === Kind.INT ? new Date(parseInt(ast.value)) : null,
			parseValue: value => new Date(value),
			serialize: value => new Date(value).getTime()
		}),
		Query: {
			me: (_, _args, { user }) => user,
			bot: () => bot.user,
			version: () => version,
			features: () => features
		}
	}
});
