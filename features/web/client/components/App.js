import React from 'react';

export default class App extends React.Component {
	render() {
		return (
			<div>
				<h1>Discord Guild Wars 2 Bot</h1>
				<div>{this.props.children}</div>
			</div>
		);
	}
}
