import AppDispatcher from '../dispatchers/AppDispatcher';
import { browserHistory } from 'react-router';

export default {
	loginUser: (jwt) => {
		AppDispatcher.dispatch({
			actionType: 'LOGIN',
			jwt: jwt
		});
		localStorage.setItem('jwt', jwt);
	},
	logoutUser: () => {
		localStorage.removeItem('jwt');
		AppDispatcher.dispatch({ actionType: 'LOGOUT' });
		browserHistory.push('/get_login');
	},
	refresh: jwt => setTimeout(() => {
		AppDispatcher.dispatch({
			actionType: 'REFRESH LOGIN',
			jwt: jwt
		});
		localStorage.setItem('jwt', jwt);
	}, 1)
}
