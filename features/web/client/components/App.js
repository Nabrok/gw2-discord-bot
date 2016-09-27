import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';

import LoginStore from '../stores/LoginStore';

export default class App extends React.Component {
	constructor() {
		super();
		this.state = this._getLoginState();
	}

	componentDidMount() {
		this.changeListener = this._onChange.bind(this);
		LoginStore.addChangeListener(this.changeListener);
	}

	componentWillUnmount() {
		LoginStore.removeChangeListener(this.changeListener);
	}

	_onChange() {
		this.setState(this._getLoginState());
	}

	_getLoginState() {
		return {
			userLoggedIn: LoginStore.isLoggedIn(),
			user: LoginStore.username
		};
	}

	render() {
		return (
			<div>
				<Navbar>
					<Navbar.Header><Navbar.Brand><Link to="/">Discord Guild Wars 2 Bot</Link></Navbar.Brand></Navbar.Header>
					<Nav pullRight>
						{ this.state.userLoggedIn && <NavDropdown eventKey={1} title={ this.state.user } id="user_dropdown">
							<LinkContainer to="/logout"><NavItem eventKey={1}>Logout</NavItem></LinkContainer>
						</NavDropdown> }
					</Nav>
				</Navbar>
				<div className="container">{this.props.children}</div>
			</div>
		);
	}
}
