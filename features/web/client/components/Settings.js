import React from 'react';
import {Panel, FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import Socket from '../services/WebSocket';

function bootswatchTheme(name) {
	return { name, href: 'https://maxcdn.bootstrapcdn.com/bootswatch/latest/'+name+'/bootstrap.min.css' };
}

const themes = [
	{ name: 'default', href: 'https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css' },
	bootswatchTheme('cerulean'),
	bootswatchTheme('cosmo'),
	bootswatchTheme('cyborg'),
	bootswatchTheme('darkly'),
	bootswatchTheme('flatly'),
	bootswatchTheme('journal'),
	bootswatchTheme('lumen'),
	bootswatchTheme('paper'),
	bootswatchTheme('readable'),
	bootswatchTheme('sandstone'),
	bootswatchTheme('simplex'),
	bootswatchTheme('slate'),
	bootswatchTheme('spacelab'),
	bootswatchTheme('superhero'),
	bootswatchTheme('united'),
	bootswatchTheme('yeti')
];

export default class Settings extends React.Component {
	constructor(props) {
		super(props);

		this._themeSelected = this._themeSelected.bind(this);

		this.state = {
			theme: localStorage.getItem('theme')
		};
	}

	_themeSelected(e) {
		var theme = e.target.value;
		localStorage.setItem('theme', theme);
		document.getElementById('bootstrap_theme').setAttribute('href', theme);
		this.setState({ theme });
	}

	render() {
		return (<form>
			<Panel header="Settings">
				<FormGroup controlId="themeSelect">
					<ControlLabel>Theme</ControlLabel>
					<FormControl componentClass="select" placeholder="Theme" value={this.state.theme} onChange={this._themeSelected}>
						{ themes.map(t => <option key={t.name} value={t.href}>{t.name}</option>) }
					</FormControl>
				</FormGroup>
			</Panel>
		</form>);
	}
}
