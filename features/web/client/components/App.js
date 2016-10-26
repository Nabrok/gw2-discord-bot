import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';

import LoginStore from '../stores/LoginStore';
import LoadingStore from '../stores/LoadingStore';

export default class App extends React.Component {
	constructor() {
		super();
		this.state = Object.assign(this._getLoginState(), this._getLoadingState());
	}

	componentDidMount() {
		this.changeListener = this._onChange.bind(this);
		this.loadingListener = this._onLoadingChange.bind(this);
		LoginStore.addChangeListener(this.changeListener);
		LoadingStore.addChangeListener(this.loadingListener);
	}

	componentWillUnmount() {
		LoginStore.removeChangeListener(this.changeListener);
		LoadingStore.removeChangeListener(this.loadingListener);
	}

	_onChange() {
		this.setState(this._getLoginState());
	}

	_onLoadingChange() {
		this.setState(this._getLoadingState());
	}

	_getLoginState() {
		return {
			userLoggedIn: LoginStore.isLoggedIn(),
			user: LoginStore.username
		};
	}

	_getLoadingState() {
		return {
			loading: LoadingStore.loading
		}
	}

	render() {
		return (
			<div>
				<Navbar>
					<Navbar.Header>
						<Navbar.Brand><Link to="/">Discord Guild Wars 2 Bot</Link></Navbar.Brand>
						<Navbar.Toggle />
					</Navbar.Header>
					<Navbar.Collapse>
						{ this.state.userLoggedIn && <Nav>
							<LinkContainer to="/characters"><NavItem eventKey={1}>Characters</NavItem></LinkContainer>
							<LinkContainer to="/sessions"><NavItem eventKey={2}>Sessions</NavItem></LinkContainer>
						</Nav> }
						{ this.state.userLoggedIn && <Nav pullRight>
							<NavDropdown eventKey={1} title={ this.state.user } id="user_dropdown">
								<LinkContainer to="/settings"><NavItem eventKey={1}>Settings</NavItem></LinkContainer>
								<LinkContainer to="/api_key"><NavItem eventKey={2}>API Key</NavItem></LinkContainer>
								<LinkContainer to="/logout"><NavItem eventKey={3}>Logout</NavItem></LinkContainer>
							</NavDropdown>
						</Nav> }
						{ this.state.loading && <Navbar.Text pullRight><i className="fa fa-spinner fa-spin fa-fw" /></Navbar.Text> }
					</Navbar.Collapse>
				</Navbar>
				<div className="container">{this.props.children}</div>
			</div>
		);
	}
}
