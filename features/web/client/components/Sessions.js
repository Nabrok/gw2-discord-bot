import React from 'react';
import {Row, Col, Nav, NavItem, Tabs, Tab, Panel, Table} from 'react-bootstrap';

import Socket from '../services/WebSocket';
import CurrencyStore from '../stores/CurrencyStore';
import ItemStore from '../stores/ItemStore';
import AchievementCategoryStore from '../stores/AchievementCategoryStore';
import AchievementStore from '../stores/AchievementStore';
import PriceStore from '../stores/PriceStore';

import Item from './partials/Item';
import Gold from './partials/Gold';

class CharactersTab extends React.Component {
	_getCharacterStats(props) {
		if (! props.characters) return {};
		var stats = props.characters.reduce((t,c) => {
			if (! t[c.path[1]]) t[c.path[1]] = {};
			if (c.path[2] === "age") t[c.path[1]].played = Math.round((c.rhs - c.lhs) / 60);
			if (c.path[2] === "deaths") t[c.path[1]].deaths = c.rhs - c.lhs;
			if (c.path[2] === "level") t[c.path[1]].levels = c.rhs - c.lhs;
			return t;
		}, {});
		return stats;
	}

	render() {
		var stats = this._getCharacterStats(this.props);
		var wvw_rank_gain = this.props.account.find(d => d.path[1] === "wvw_rank");
		var fractal_level_gain = this.props.account.find(d => d.path[1] === "fractal_level");
		return(<div>
			{ wvw_rank_gain && <p>Gained { wvw_rank_gain.rhs - wvw_rank_gain.lhs } WvW ranks.</p> }
			{ fractal_level_gain && <p>Gained { fractal_level_gain.rhs - fractal_level_gain.lhs } fractal levels.</p> }
			{ Object.keys(stats).map((c,i) => <div key={i}>
				<b><i><u>{c}</u></i></b>
				<ul>
					<li>Played for {stats[c].played} minutes.</li>
					{ stats[c].leavels && <li>Gained {stats[c].levels} levels.</li> }
					{ stats[c].deaths && <li>Died {stats[c].deaths} times.</li> }
				</ul>
			</div>) }
		</div>);
	}
}

class WalletTab extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			currencies: this._retrieveCurrencies(props.wallet)
		};
	}

	componentWillReceiveProps(newProps) {
		this.setState({ currencies: this._retrieveCurrencies(newProps.wallet) });
	}

	componentDidMount() {
		this._currencyListener = this._currencyChanges.bind(this);
		CurrencyStore.addChangeListener(this._currencyListener);
	}

	componentWillUnmount() {
		CurrencyStore.removeChangeListener(this._currencyListener);
	}

	_currencyChanges() {
		this.setState({ currencies: this._retrieveCurrencies(this.props.wallet) });
	}

	_retrieveCurrencies(wallet) {
		if (! wallet) return [];
		var ids = wallet.map(w => w.path[1]);
		CurrencyStore.retrieve(ids);
		return ids.map(c => CurrencyStore.get(c) || {});
	}

	render() {
		return(<Table condensed fill>
			<tbody>
			{ this.props.wallet.map((c,i) => {
				var currency = this.state.currencies.find(cur => cur.id === parseInt(c.path[1])) || {};
				return (<tr key={i}>
					<td><img src={currency.icon} height="25px" /> {currency.name}</td>
					<td style={{ textAlign: 'right' }}>
						{ currency.name === "Coin" ? <Gold coins={c.rhs - c.lhs} /> : (c.rhs - c.lhs).toLocaleString() }
					</td>
				</tr>);
			}) }
			</tbody>
		</Table>);
	}
}

class ItemsTab extends React.Component {
	constructor(props) {
		super(props);

		this._itemData = this._itemData.bind(this);

		var details = this._getItems(props.items);
		var prices = this._getPrices(details);
		this.state = { details, prices };
	}

	componentWillReceiveProps(newProps) {
		var details = this._getItems(newProps.items);
		var prices = this._getPrices(details);
		this.setState({ details, prices });
	}

	componentDidMount() {
		this._itemListener = this._itemChanges.bind(this);
		this._priceListener = this._priceChanges.bind(this);
		ItemStore.addChangeListener(this._itemListener);
		PriceStore.addChangeListener(this._priceListener);
	}

	componentWillUnmount() {
		ItemStore.removeChangeListener(this._itemListener);
		PriceStore.removeChangeListener(this._priceListener);
	}

	_itemChanges() {
		var details = this._getItems(this.props.items);
		var prices = this._getPrices(details);
		this.setState({ details, prices });
	}

	_priceChanges() {
		var prices = this._getPrices(this.state.details);
		this.setState({ prices });
	}

	_getPrices(details) {
		if (! details) return [];
		var price_ids = details
			.filter(d => !!d.id)
			.filter(d => d.flags.indexOf('AccountBound') === -1)
			.filter(d => d.flags.indexOf('SoulbindOnAcquire') === -1)
			.map(d => d.id)
		;
		PriceStore.retrieve(price_ids);
		return price_ids.map(p => PriceStore.get(p)).filter(p => !!p);
	}

	_getItems(items) {
		if (! items) return [];
		var ids = items.map(i => parseInt(i.path[1]));
		ItemStore.retrieveItems(ids);
		return ids.map(i => ItemStore.getItem(parseInt(i)) || {});
	}

	_itemData(d) {
		var item = this.state.details.find(item => item.id === parseInt(d.path[1])) || { flags: [] };
		var count = (d.rhs || 0) - (d.lhs || 0);
		if (count < 0) count *= -1;
		var tp_price = this.state.prices.find(price => price.id === parseInt(d.path[1]));
		var vendor_price = (item.flags.indexOf('NoSell') === -1) ? item.vendor_value : 0;
		var price = (tp_price) ? tp_price.buys.unit_price : vendor_price;
		if (price < vendor_price) price = vendor_price;
		price *= count;
		return { item, count, price };
	}

	render() {
		var items_gained = this.props.items.filter(d =>
			(d.kind === "E" && d.rhs > d.lhs) ||
			(d.kind === "N")
		).map(this._itemData).sort((a,b) => b.price - a.price);
		var items_lost = this.props.items.filter(d =>
			(d.kind === "E" && d.rhs < d.lhs) ||
			(d.kind === "D")
		).map(this._itemData).sort((a,b) => b.price - a.price);
		var total_gained = items_gained.reduce((t,i) => t += i.price, 0);
		var total_lost = items_lost.reduce((t,i) => t += i.price, 0);
		return(<div>
			{ items_gained.length > 0 && <Panel header="Items Gained" footer={<Gold coins={total_gained} />} >
				{ items_gained.map((d,i) => <div key={i} style={{display: 'inline-block', textAlign: 'center'}}>
					<Item item={d.item} count={d.count} />
					<br/>
					<span style={{fontSize: 'x-small'}}><Gold coins={d.price} compact={true} /></span>
				</div>) }
			</Panel> }
			{ items_lost.length > 0 && <Panel header="Items Lost" footer={<Gold coins={total_lost} />} >
				{ items_lost.map((d,i) => <div key={i} style={{display: 'inline-block', textAlign: 'center'}}>
					<Item item={d.item} count={d.count} />
					<br/>
					<span style={{fontSize: 'x-small'}}><Gold coins={d.price} compact={true} /></span>
				</div>) }
			</Panel> }
		</div>);
	}
}

class AchievementsTab extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			categories: this._getCategories(),
			achievement_details: this._getAchievements(props.achievements)
		};
	}

	componentDidMount() {
		this._achievementsListener = this._achievementChange.bind(this);
		AchievementStore.addChangeListener(this._achievementsListener);
	}

	componentWillUnmount() {
		AchievementStore.removeChangeListener(this._achievementsListener);
	}

	componentWillReceiveProps(newProps) {
		this.setState({ achievement_details: this._getAchievements(newProps.achievements) });
	}

	_achievementChange() {
		this.setState({ achievement_details: this._getAchievements(this.props.achievements) });
	}

	_getCategories() {
		return AchievementCategoryStore.categories.sort((a,b) => a.order - b.order);
	}

	_getAchievements(achievements) {
		if (! achievements) return [];
		var ids = achievements.map(i => parseInt(i.path[1]));
		AchievementStore.retrieve(ids);
		return ids.map(i => AchievementStore.get(parseInt(i)) || {});
	}

	render() {
		var ach = this.props.achievements;
		return(<div>
			{this.state.categories.filter(c => ach.some(a => c.achievements.indexOf(parseInt(a.path[1])) > - 1)).map(c => <div key={c.id}>
				{c.achievements.filter(id => ach.find(a => parseInt(a.path[1]) === id)).map(id => {
					var details = this.state.achievement_details.find(d => d.id === id) || {};
					var diff = ach.filter(a => parseInt(a.path[1]) === id);
					return (<div key={id} className="achievement">
						<div title={c.name} className="ach_icon"><img src={c.icon} /></div>
						<p className="lead">{details.name}</p>
						<p className="text-muted">{details.requirement}</p>
					</div>);
				})}
			</div>)}
		</div>);
	}
}

class AchCounts extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			achievement_details: this._getAchievements(props.achievements)
		};
	}

	componentDidMount() {
		this._achievementsListener = this._achievementChange.bind(this);
		AchievementStore.addChangeListener(this._achievementsListener);
	}

	componentWillUnmount() {
		AchievementStore.removeChangeListener(this._achievementsListener);
	}

	componentWillReceiveProps(newProps) {
		this.setState({ achievement_details: this._getAchievements(newProps.achievements) });
	}

	_achievementChange() {
		this.setState({ achievement_details: this._getAchievements(this.props.achievements) });
	}

	_getAchievements(achievements) {
		if (! achievements) return [];
		var ids = achievements.map(i => parseInt(i.path[1]));
		AchievementStore.retrieve(ids);
		return ids.map(i => AchievementStore.get(parseInt(i)) || {});
	}

	render() {
		return (<Table condensed fill><tbody>
			{this.props.achievements.map(a => {
				var details = this.state.achievement_details.find(d => d.id === parseInt(a.path[1])) || {};
				return(<tr key={a.path[1]}><td>{details.requirement}</td><td style={{ textAlign: 'right' }}>{a.rhs - a.lhs}</td></tr>);
			})}
		</tbody></Table>);
	}
}

class Session extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			key: 'characters',
			wvw_achievement_ids: AchievementCategoryStore.get(13).achievements,
			pvp_achievement_ids: AchievementCategoryStore.get(3).achievements
		};
	}

	_changeTab(key) {
		this.setState({ key });
	}

	render() {
		var session = this.props.session;
		var account = session.diff.filter(d => d.path[0] === "account");
		var characters = session.diff.filter(d => d.path[0] === "characters");
		var wallet = session.diff.filter(d => d.path[0] === "wallet");
		var items = session.diff.filter(d => d.path[0] === "all_items");
		var achievements = session.diff.filter(d => d.path[0] === "achievements" && ((d.kind === "N" && d.rhs.done) || (d.kind === "E" && d.path[2] === "done")));
		var wvw_achievements = session.diff.filter(d => d.path[0] === "achievements" && this.state.wvw_achievement_ids.indexOf(parseInt(d.path[1])) > -1 && d.path[2] === "current");
		var pvp_achievements = session.diff.filter(d => d.path[0] === "achievements" && this.state.pvp_achievement_ids.indexOf(parseInt(d.path[1])) > -1 && d.path[2] === "current");
		var ach_counts = [];
		if (wvw_achievements.length > 0)
			ach_counts.push(<Panel header="World vs World" collapsible={true} defaultExpanded={true}><AchCounts achievements={wvw_achievements} /></Panel>);
		if (pvp_achievements.length > 0)
			ach_counts.push(<Panel header="Player vs Player" collapsible={true} defaultExpanded={true}><AchCounts achievements={pvp_achievements} /></Panel>);
		return(<div>
			{session.start_time.toLocaleString()} - {session.stop_time.toLocaleTimeString()}<br/>
			<br/>
			<Row>
				<Col sm={6}><Panel header={<div>Characters</div>} collapsible={true} defaultExpanded={true}><CharactersTab characters={characters} account={account} /></Panel></Col>
				<Col sm={6}><Panel header="Wallet" collapsible={true} defaultExpanded={true}><WalletTab wallet={wallet} /></Panel></Col>
			</Row>
			<Row>
				<Col xs={12}><Panel header="Items" collapsible={true} defaultExpanded={true}><ItemsTab items={items} /></Panel></Col>
			</Row>
			{ achievements.length > 0 && <Row>
				<Col xs={12}><Panel header="Achievements" collapsible={true} defaultExpanded={true}><AchievementsTab achievements={achievements} /></Panel></Col>
			</Row> }
			{ ach_counts.length > 0 && <Row>
				{ ach_counts.map((a,i) => <Col key={i} xs={12 / ach_counts.length }>{a}</Col>) }
			</Row> }
		</div>);
	}
}

export default class Sessions extends React.Component {
	constructor(props) {
		super(props);

		this._getSessions = this._getSessions.bind(this);

		this.state = {
			selectedSession: 0,
			sessions: []
		};
	}

	componentDidMount() {
		this._getSessions();
	}

	_getSessions() {
		Socket.send('get sessions')
		.then(sessions => sessions.map(s => { s.start_time = new Date(s.start_time); s.stop_time = new Date(s.stop_time); return s }))
		.then(sessions => sessions.sort((a,b) => b.start_time - a.start_time))
		.then(sessions => this.setState({ sessions }))
		.catch(console.log);
	}

	_selectSession(selectedSession) {
		this.setState({ selectedSession });
	}

	render() {
		var selected = (this.state.sessions.length > 0) ? this.state.sessions[this.state.selectedSession] : null;
		return (<div>
			<Nav bsStyle="pills" activeKey={this.state.selectedSession} onSelect={this._selectSession.bind(this)}>
			{ this.state.sessions.map((s,i) => 
				<NavItem eventKey={i} key={i}>{s.start_time.toLocaleString()}</NavItem>
			) }
			</Nav>
			<br/>
			{ selected && <Session session={selected} /> }
		</div>);
	}
}
