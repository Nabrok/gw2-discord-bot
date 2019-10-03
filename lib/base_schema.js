const { gql }  = require('apollo-server');

module.exports.typeDefs = gql`
extend type Query {
	me: DiscordUser
}

type DiscordUser {
	id: ID
	username: String
	discriminator: String
	locale: String
	mfa_enabled: Boolean
	flags: Int
	avatar: String
}
`;

module.exports.resolvers= {
	Query: {
		me: (_, _args, { user }) => user
	}
};
