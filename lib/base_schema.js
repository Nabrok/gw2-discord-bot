const { GraphQLScalarType, Kind } = require('graphql');
const { gql }  = require('apollo-server');
const config = require('config');
const gw2 = require('./gw2');
const db = require('./database');
const version = require('../package').version;

const features = config.has('features.enabled') ? config.get('features.enabled').slice() : [];
const guild_world = config.has('world.id') ? config.get('world.id') : null;
const guild_id = config.has('guild.id') ? config.get('guild.id') : null;
const guild_key = config.has('guild.key') ? config.get('guild.key') : null;

const typeDefs = gql`
scalar Date

enum GW2Population { Low Medium High VeryHigh Full }
enum GW2GuildEmblemFlag { FlipBackgroundHorizontal FlipBackgroundVertical }
enum GW2ColorCategory { Gray Brown Red Orange Yellow Green Blue Purple Vibrant Leather Metal Starter Common Uncommon Rare Exclusive }

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
	guild(id: ID): GW2Guild
}

type GW2World {
	id: ID!
	name: String
	population: GW2Population
}

type GW2Guild {
	id: ID!
	name: String
	tag: String
	level: Int
	motd: String
	influence: Int
	aetherium: String
	favor: Int
	member_count: Int
	member_capacity: Int
	emblem: GW2GuildEmblem
}

type GW2GuildEmblem {
	background: GW2GuildEmblemPart
	foreground: GW2GuildEmblemPart
	flags: [GW2GuildEmblemFlag]
}

type GW2GuildEmblemPart {
	layers: [String]
	colors: [GW2Color]
}

type GW2Color {
	id: ID!
	name: String
	base_rgb: [Int]
	cloth: GW2ColorMaterial
	leather: GW2ColorMaterial
	metal: GW2ColorMaterial
	fur: GW2ColorMaterial
	categories: [GW2ColorCategory]
}

type GW2ColorMaterial {
	brightness: Int
	contrast: Int
	hue: Int
	saturation: Int
	rgb: [Int]
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
			worlds: (_, { ids }) => ids ? gw2.getWorlds(ids).then(w => Object.values(w)) : gw2.getAllWorlds(),
			guild: async (_, { id = guild_id }, { user }) => {
				if (! id) return null;
				const key = (id === guild_id) ? guild_key : await db.getUserKey(user.id);
				return gw2.request('/v2/guild/'+id, key);
			}
		},
		GW2GuildEmblem: {
			background: async emblem => {
				const [layers, colors] = await Promise.all([
					gw2.getEmblemBackgrounds([emblem.background.id]).then(l => l[emblem.background.id].layers),
					gw2.getColors(emblem.background.colors).then(c => Object.values(c))
				]);
				return { layers, colors };
			},
			foreground: async emblem => {
				const [layers, colors] = await Promise.all([
					gw2.getEmblemForegrounds([emblem.foreground.id]).then(l => l[emblem.foreground.id].layers),
					gw2.getColors(emblem.foreground.colors).then(c => Object.values(c))
				]);
				return { layers, colors };
			}
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
