const { GraphQLScalarType, Kind } = require('graphql');
const { gql }  = require('apollo-server');
const config = require('config');
const gw2 = require('./gw2');
const version = require('../package').version;

const features = config.has('features.enabled') ? config.get('features.enabled').slice() : [];
const guild_world = config.has('world.id') ? config.get('world.id') : null;

const typeDefs = gql`
scalar Date

enum GW2Population { Low Medium High VeryHigh Full }

extend type Query {
	me: DiscordUser
	bot: DiscordUser
	version: String
	features: [String]
	gw2: GW2
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

type GW2 {
	world(id: ID): GW2World
	worlds(ids: [ID]): [GW2World]
}

type GW2World {
	id: ID!
	name: String
	population: GW2Population
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
		GW2: {
			world: (_, { id = guild_world }) => gw2.getWorlds([id]).then(w => w[id]),
			worlds: (_, { ids }) => ids ? gw2.getWorlds(ids).then(w => Object.values(w)) : gw2.getAllWorlds()
		},
		Query: {
			me: (_, _args, { user }) => user,
			bot: () => bot.user,
			version: () => version,
			features: () => features,
			gw2: () => ({})
		}
	}
});
