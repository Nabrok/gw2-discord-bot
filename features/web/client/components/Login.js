import React from 'react';
import { Well, Button } from 'react-bootstrap';

export default class Login extends React.Component {
	render() {
		return (
			<div>
				<Well bsSize="large">The button below will send you to the discord site to enter your credentials.  You will then be redirected back to this site.</Well>
				<Button bsStyle="primary" bsSize="large" block href="/login">Login</Button>
			</div>
		);
	}
}
