import request from 'superagent';

import LoadingActions from '../actions/LoadingActions';

const api_url = 'https://api.guildwars2.com';

class Gw2Api {
	request(path, ids) {
		if (ids) {
			ids = ids.filter(i => !!i).sort().filter((item, pos, ary) => !pos || item != ary[pos - 1]); // dedupe
			var promises = [];
			while (ids.length > 0) {
				var this_bit = ids.splice(0, 200);
				var this_path = path + '?ids=' + this_bit.join(',');
				promises.push(new Promise((resolve, reject) => {
					LoadingActions.add();
					request.get(api_url+this_path).accept('json').end((err, res) => {
						LoadingActions.remove();
						if (err) return reject(err.message);
						resolve(JSON.parse(res.text));
					});
				}));
			}
			return Promise.all(promises).then(results => results.reduce((t,a) => t.concat(a), []));
		} else {
			return new Promise((resolve, reject) => {
				LoadingActions.add();
				request.get(api_url+path).accept('json').end((err, res) => {
					LoadingActions.remove();
					if (err) return reject(err.message);
					resolve(JSON.parse(res.text));
				});
			});
		}
	}
}

export default new Gw2Api();
