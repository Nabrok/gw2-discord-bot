var
	async = require('async'),
	config = require('config'),
	redis = require('redis'),
	redisScan = require('redisscan')
;

var db = {};

var prefix = 'gw2_discord:';

var options = { };
['host', 'port', 'path', 'password', 'db'].forEach(function(item) {
	var value = config.get('redis.'+item);
	if (value) options[item] = value;
});
if (options.path) {
	delete options.host;
	delete options.port;
}

var client = redis.createClient(options);
var sub_client;

db.subscribe = function(key) {
	if (! sub_client) {
		sub_client = client.duplicate();
		sub_client.config("SET", "notify-keyspace-events", "AKE");
	}
	sub_client.psubscribe("__key*__:"+prefix+key);
	return sub_client;
}

db.clearCache = function(cache_name, callback) {
	client.del(prefix+'cache:'+cache_name, callback);
};

db.saveCachedResponse = function(path, key, response, ttl, callback) {
	client.psetex(prefix+'response_cache:'+path+':'+key, ttl, JSON.stringify(response), callback);
};

db.getCachedResponse = function(path, key, callback) {
	client.get(prefix+'response_cache:'+path+':'+key, function(err, response) {
		if (err) return callback(err);
		if (! response) return callback();
		callback(null, JSON.parse(response));
	});
};

db.setUserKey = function(user_id, key, token, callback) {
	async.parallel([
		function(next) {
			client.hset(prefix+'user_keys', user_id, key, next);
		},
		function(next) {
			client.set(prefix+'user_tokens:'+user_id, JSON.stringify(token), next);
		}
	], callback);
};

db.setUserAccount = function(user_id, account, callback) {
	if (! callback) callback = function() { };
	async.parallel([
		function(next) {
			client.hset(prefix+'user_accounts', account.name, user_id, next);
		},
		function(next) {
			client.hset(prefix+'user_ids', user_id, JSON.stringify(account), next);
		}
	], callback);
};

db.removeUser = function(user_id, callback) {
	db.getAccountByUser(user_id, function(err, account) {
		async.parallel([
			function(next) {
				if (! account) return next();
				client.hdel(prefix+'user_accounts', account.name, next);
			},
			function(next) {
				client.hdel(prefix+'user_ids', user_id, next);
			},
			function(next) {
				client.hdel(prefix+'user_tokens', user_id, next);
			},
			function(next) {
				client.del(prefix+'user_tokens:'+user_id, next);
			},
			function(next) {
				client.hdel(prefix+'user_keys', user_id, next);
			}
		], callback);
	});
};

db.getUserToken = function(user_id, callback) {
	client.get(prefix+'user_tokens:'+user_id, function(err, token) {
		if (err) return callback(err);
		if (token) return callback(null, token);
		client.hget(prefix+'user_tokens', user_id, callback);
	});
};

db.checkKeyPermission = function(user_id, permission, callback) {
	if (! Array.isArray(permission)) permission = [ permission ];
	if (permission.length == 0) return callback(null, true);
	db.getUserToken(user_id, function(err, token_string) {
		if (err) return callback(err);
		token = JSON.parse(token_string);
		if (! token || ! token.permissions) return callback(null, false);
		var hasPerm = permission.every(p => (token.permissions.indexOf(p) > -1));
		callback(null, hasPerm);
	});
};

db.getUserKey = function(user_id, callback) {
	client.hget(prefix+'user_keys', user_id, callback);
};

db.getUserByAccount = function(account, callback) {
	client.hget(prefix+'user_accounts', account, callback);
};

db.getAccountByUser = function(user_id, callback) {
	client.hget(prefix+'user_ids', user_id, function(err, result) {
		if (err) return callback(err);
		callback(null, JSON.parse(result));
	});
}

db.setObject = function(name, object, callback) {
	client.set(prefix+name, JSON.stringify(object), callback);
}

db.getObject = function(name, callback) {
	client.get(prefix+name, function(err, object) {
		if (err) return callback(err);
		callback(null, JSON.parse(object));
	});
}

db.expireObject = function(name, seconds, callback) {
	client.expire(prefix+name, seconds, callback);
}

db.findObjects = function(pattern_part, callback) {
	var pattern = prefix+pattern_part;
	var result = [];
	redisScan({
		redis: client,
		pattern: pattern,
		each_callback: (type, key, subkey, length, value, cb) => {
			result.push(JSON.parse(value));
			cb();
		},
		done_callback: err => {
			if (err) return callback(err);
			callback(null, result);
		}
	});
}

db.getCacheKeys = function(name, callback) {
	client.hkeys(prefix+'cache:'+name, callback);
}

db.getCache = function(cache_name, keys, callback) {
	client.hmget(prefix+'cache:'+cache_name, keys, callback);
}

db.setCache = function(cache_name, id, object, callback) {
	client.hset(prefix+'cache:'+cache_name, id, JSON.stringify(object), callback);
}

db.expireCache = function(cache_name, seconds, callback) {
	client.ttl(prefix+'cache:'+cache_name, (err, ttl) => {
		if (ttl >= 0) return callback(); // Already going to expire, don't refresh it
		client.expire(prefix+'cache:'+cache_name, seconds, callback);
	});
}

module.exports = db;
