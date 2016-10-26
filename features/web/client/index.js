import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import App from './components/App';
import Home from './components/Home';
import Login from './components/Login';
import Auth from './components/Auth';
import ApiKey from './components/ApiKey';
import Settings from './components/Settings';
import Characters from './components/Characters';
import Character from './components/Character';
import Sessions from './components/Sessions';

import LoginStore from './stores/LoginStore';
import LoginActions from './actions/LoginActions';

function needsLogin(nextState, replace) {
	if (! LoginStore.isLoggedIn()) {
		replace({ pathname: '/get_login', state: { nextPathname: nextState.location.pathname }});
	}
}

let jwt = localStorage.getItem('jwt');
let theme = localStorage.getItem('theme');
if (jwt) {
	LoginActions.loginUser(jwt);
}
if (theme) {
	document.getElementById('bootstrap_theme').setAttribute('href', theme);
}

var routes = (
	<Route path="/" component={App}>
		<Route onEnter={needsLogin}>
			<IndexRoute component={Home} />
			<Route path="/api_key" component={ApiKey} />
			<Route path="/settings" component={Settings} />
			<Route path="/characters" component={Characters} />
			<Route path="/characters/:name" component={Character} />
			<Route path="/sessions" component={Sessions} />
		</Route>
		<Route path="/get_login" component={Login} />
		<Route path="/auth" component={Auth} />
		<Route path="/logout" onEnter={(nextState, replace) => { LoginActions.logoutUser(); replace({ pathname: '/get_login' }); } } />
	</Route>
);

render(<Router history={browserHistory}>{routes}</Router>, document.getElementById('app'));
