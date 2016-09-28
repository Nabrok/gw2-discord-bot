import React from 'react';

import Socket from '../services/WebSocket';

export default class Characters extends React.Component {
	constructor() {
		super();
	}

	componentWillMount() {
		Socket.send('get characters').then(characters => { this.setState({ characters, }) });
	}

	render() {
		return(<div>Characters</div>);
	}
}
