import React from 'react';
import { Alert, Row, Col, Form, FormGroup, ControlLabel, FormControl, Radio, Panel, Popover, OverlayTrigger, Tabs, Tab, Nav, NavItem, Button, DropdownButton, MenuItem, Dropdown } from 'react-bootstrap';
import { browserHistory, Link } from 'react-router';
import PostToChannel from './partials/PostToChannel';
import Item from './partials/Item';

import Socket from '../services/WebSocket';
import TokenStore from '../stores/TokenStore';
import PrivacyStore from '../stores/PrivacyStore';
import ItemStore from '../stores/ItemStore';
import StatsStore from '../stores/StatsStore';
import SkinsStore from '../stores/SkinsStore';
import SpecializationStore from '../stores/SpecializationStore';
import TraitStore from '../stores/TraitStore';
import ProfessionStore from '../stores/ProfessionStore';
import SkillStore from '../stores/SkillStore';
import LegendStore from '../stores/LegendStore';


class ShowItem extends React.Component {
	constructor(props) {
		super(props);

		this.doUpdate = this.doUpdate.bind(this);
		this.doStatsUpdate = this.doStatsUpdate.bind(this);
		this.doSkinUpdate = this.doSkinUpdate.bind(this);

		var item = this._getItem(props);
		this.state = {
			item_details: item,
			stat_details: this._getStats(props, item),
			skin_details: this._getSkin(props),
			upgrades: this._getUpgrades(props)
		};
	}

	doUpdate() {
		var item = this._getItem(this.props);
		this.setState({
			item_details: item,
			stat_details: this._getStats(this.props, item),
			upgrades: this._getUpgrades(this.props)
		});
	}

	doStatsUpdate() {
		this.setState({ stat_details: this._getStats(this.props, this.state.item_details) });
	}

	doSkinUpdate() {
		if (this.state.skin_details.id) return;
		this.setState({ skin_details: this._getSkin(this.props) });
	}

	componentWillReceiveProps(newProps) {
		var newState = {};
		var item = this._getItem(newProps);
		if (newProps.data.id !== this.props.data.id) newState.item_details = item;
		if (newProps.data.skin !== this.props.data.skin) newState.skin_details = this._getSkin(newProps);
		newState.stat_details = this._getStats(newProps, item);
		newState.upgrades = this._getUpgrades(newProps);
		this.setState(newState);
	}

	_getItem(props) {
		return ItemStore.getItem(props.data.id) || {};
	}

	_getUpgrades(props) {
		if (! props.data.upgrades) return [];
		return props.data.upgrades.map(u => ItemStore.getItem(u) || {});
	}

	_getStats(props, item) {
		if (props.data.stats) return StatsStore.getStats(props.data.stats.id) || {};
		if (! item.details) return {};
		if (item.details.infix_upgrade) return StatsStore.getStats(item.details.infix_upgrade.id) || {};
		return { name: "not selected" };
	}

	_getSkin(props) {
		if (! props.data.skin) return {};
		return SkinsStore.getSkin(props.data.skin) || {};
	}

	render() {
		var stats = this.state.stat_details;
		return (
			<div>
				<Item item={this.state.item_details} stats={this.state.stat_details} skin={this.state.skin_details} upgrades={this.state.upgrades} size="small" placement="right" />
				{' '}
				{stats.name}
			</div>
		);
	}
}

class Traits extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			specializations: this._getSpecs(props.character, props.type),
			traits: this._getTraits(props.character, props.type)
		}
	}

	componentWillReceiveProps(newProps) {
		if (
			newProps.character.name === this.props.character.name &&
			newProps.type === this.props.type
		) return; // no changes
		this.setState({
			specializations: this._getSpecs(newProps.character, newProps.type),
			traits: this._getTraits(newProps.character, newProps.type)
		});
	}

	componentDidMount() {
		this._specsChangeListener = this._specChanges.bind(this);
		this._traitChangeListener = this._traitChanges.bind(this);
		SpecializationStore.addChangeListener(this._specsChangeListener);
		TraitStore.addChangeListener(this._traitChangeListener);
	}

	componentWillUnmount() {
		SpecializationStore.removeChangeListener(this._specsChangeListener);
		TraitStore.removeChangeListener(this._traitChangeListener);
	}

	_specChanges() {
		this.setState({ specializations: this._getSpecs(this.props.character, this.props.type) });
	}

	_traitChanges() {
		this.setState({ traits: this._getTraits(this.props.character, this.props.type) });
	}

	_getSpecs(character, type) {
		if (! character.specializations) return [];
		var spec_ids = character.specializations[type].filter(s => !!s).map(s => s.id);
		SpecializationStore.retrieve(spec_ids);
		return spec_ids.map(s => SpecializationStore.get(s) || {});
	}

	_getTraits(character, type) {
		if (! character.specializations) return [];
		var trait_ids = character.specializations[type].filter(s => !!s).reduce((t,a) => t.concat(a.traits.filter(i => !!i)), []);
		TraitStore.retrieve(trait_ids);
		return trait_ids.map(t => TraitStore.get(t) || {});
	}

	render() {
		if (! this.props.character.specializations) return (<div></div>);
		var specs = this.props.character.specializations[this.props.type];
		return(
			<div>
				{specs.filter(s => !!s).map((l,i) => {
					var s = this.state.specializations.find(s => l.id === s.id) || {};
					return (<div className="spec_line" key={i}>
						<img className="background" src={s.background} />
						<div className="spec_title">{s.name}</div>
						{ l.traits.map((tr, ti) => {
							var t = this.state.traits.find(t => tr === t.id) || {};
							var left = (150 + (160 * ti))+'px';
							return(<div className="trait" style={{ left }} key={ti}>
								<OverlayTrigger trigger={['hover','focus','click']} rootClose placement="top" overlay={
									<Popover id="trait-detail" title={t.name}>{t.description}</Popover>
								}><img src={t.icon} /></OverlayTrigger>
								<br/>
								{t.name}
							</div>);
						})}
					</div>)})}
				<PostToChannel cmd="build string" data={{ name: this.props.character.name, type: this.props.type }} />
			</div>
		);
	}
}

class Privacy extends React.Component {
	constructor(props) {
		super(props);
		this._privacyChange = this._privacyChange.bind(this);

		this.state = {
			privacy: PrivacyStore.getPrivacy(props.character.name)
		};
	}

	componentWillReceiveProps(newProps) {
		if (newProps.character.name !== this.props.character.name) this.setState({ privacy: PrivacyStore.getPrivacy(newProps.character.name) });
	}

	componentDidMount() {
		this._privacyChangeListener = this._onPrivacyChange.bind(this);
		PrivacyStore.addChangeListener(this._privacyChangeListener);
	}

	componentWillUnmount() {
		PrivacyStore.removeChangeListener(this._privacyChangeListener);
	}

	_onPrivacyChange() {
		this.setState({ privacy: PrivacyStore.getPrivacy(this.props.character.name) });
	}

	_privacyChange(e) {
		var privacy = parseInt(e.target.value);
		var data = { };
		data[this.props.character.name] = privacy;
		Socket.send('set privacy', data);
	}

	render() {
		return(
			<form>
				<label htmlFor="privacy_1">
					<input type="radio" value="1" checked={this.state.privacy === 1} onChange={this._privacyChange} id="privacy_1" />
					{' '}
					Private.  Nobody can request to inspect your build but yourself.
				</label><br/>
				<label htmlFor="privacy_2">
					<input type="radio" value="2" checked={this.state.privacy === 2} onChange={this._privacyChange} id="privacy_2" />
					{' '}
					Guild members only.  You and any member of any of your guilds can inspect your builds.
				</label><br/>
				<label htmlFor="privacy_4">
					<input type="radio" value="4" checked={this.state.privacy === 4} onChange={this._privacyChange} id="privacy_4" />
					{' '}
					Public. Everybody can inspect your builds.
				</label>
			</form>
		);
	}
}

class Skills extends React.Component {
	constructor(props) {
		super(props);

		this._getWeaponSkills(props.character, props.profession);
		this._getSkills(props.character.skills[props.type]);
		this.state = { skills: [] };
	}

	componentWillReceiveProps(newProps) {
		var newCharacter = newProps.character.name !== this.props.character.name;
		var newProfession = newProps.profession.name !== this.props.profession.name;
		var newType = newProps.type !== this.props.type;
		if (! newCharacter && ! newProfession && ! newType) return; // nothing changed
		if (newCharacter || newType) this._getSkills(newProps.character.skills[newProps.type]);
		if (newCharacter || newProfession) this._getWeaponSkills(newProps.character, newProps.profession);
		this.setState({ skills: this._createSkillArray(newProps.character, newProps.profession, newProps.type) });
	}

	componentDidMount() {
		this._itemChangeListener = this._itemChanges.bind(this);
		this._skillChangeListener = this._skillChanges.bind(this);
		this._legendChangeListener = this._legendChanges.bind(this);
		ItemStore.addChangeListener(this._itemChangeListener);
		SkillStore.addChangeListener(this._skillChangeListener);
		LegendStore.addChangeListener(this._legendChangeListener);
	}

	componentWillUnmount() {
		ItemStore.removeChangeListener(this._itemChangeListener);
		SkillStore.removeChangeListener(this._skillChangeListener);
		LegendStore.removeChangeListener(this._legendChangeListener);
	}

	_itemChanges() {
		this._getWeaponSkills(this.props.character, this.props.profession);
		this.setState({ skills: this._createSkillArray(this.props.character, this.props.profession, this.props.type) });
	}

	_skillChanges() {
		this.setState({ skills: this._createSkillArray(this.props.character, this.props.profession, this.props.type) });
	}

	_legendChanges() {
		this.setState({ skills: this._createSkillArray(this.props.character, this.props.profession, this.props.type) });
	}

	_getSkills(skills) {
		if (skills.legends) {
			LegendStore.retrieve(skills.legends);
		} else {
			var skill_ids = [skills.heal, skills.elite].concat(skills.utilities);
			SkillStore.retrieve(skill_ids);
		}
		return;
	}

	_getWeaponSkills(character, profession) {
		if (! profession.name) return [];
		if (! character.name) return [];
		var equipment = character.equipment;
		var weapon_skills = ['WeaponA1', 'WeaponA2', 'WeaponB1', 'WeaponB2'] // Names of the weapon slots
			.filter(w => equipment.find(e => e.slot === w))                  // Filter out any not in equipment
			.map(w => equipment.find(e => e.slot === w).id)                  // Get the id of the weapon equiped
			.map(w => ItemStore.getItem(w) || {})                            // Get the item details from the store
			.filter(w => w.details)                                          // Filter out anything not in the store (yet!)
			.map(w => w.details.type)                                        // Get the weapon type
			.map(w => w[0] + w.slice(1).toLowerCase())                       // Fix case (e.g. LongBow -> Longbow)
			.reduce((t,w) => t.concat(profession.weapons[w].skills.map(s => s.id)), []) // Get the skill ids for the weapon
		;
		SkillStore.retrieve(weapon_skills);
		return;
	}

	_createSkillArray(character, profession, type) {
		if (! profession.name || ! character.name) return [];
		const twoHanders = ['Greatsword', 'Staff', 'Hammer', 'Longbow', 'Shortbow', 'Rifle'];
		var weapons = ['WeaponA1', 'WeaponA2', 'WeaponB1', 'WeaponB2'].reduce((t,w) => {
			var slot = character.equipment.find(e => e.slot === w); if (! slot) return t;
			var item = ItemStore.getItem(slot.id); if (! item) return t;
			var type = item.details.type;
			t[w] = type[0] + type.slice(1).toLowerCase();
			return t;
		}, {});
		var profweps = profession.weapons;
		var skills = [];
		if (profession.name === "Elementalist") {
			var weapon1 = weapons['WeaponA1'];
			var weapon2 = weapons['WeaponA2'];
			if (! weapon1 && ! weapon2) return;
			['Fire', 'Earth', 'Air', 'Water'].forEach(att => {
				var row = [];
				if (weapon1) {
					row.push(profweps[weapon1].skills.find(w => w.slot === 'Weapon_1' && w.attunement === att).id);
					row.push(profweps[weapon1].skills.find(w => w.slot === 'Weapon_2' && w.attunement === att).id);
					row.push(profweps[weapon1].skills.find(w => w.slot === 'Weapon_3' && w.attunement === att).id);
					if (twoHanders.indexOf(weapon1) > -1) {
						row.push(profweps[weapon1].skills.find(w => w.slot === 'Weapon_4' && w.attunement === att).id);
						row.push(profweps[weapon1].skills.find(w => w.slot === 'Weapon_5' && w.attunement === att).id);
					}
				} else {
					row = row.concat([null, null, null]);
				}
				if (weapon2) {
					row.push(profweps[weapon2].skills.find(w => w.slot === 'Weapon_4' && w.attunement === att).id);
					row.push(profweps[weapon2].skills.find(w => w.slot === 'Weapon_5' && w.attunement === att).id);
				} else if (twoHanders.indexOf(weapon1) == -1) {
					row = row.concat([null, null]);
				}
				skills.push(row.map(s => SkillStore.get(s) || {}));
			});
		} else {
			['WeaponA', 'WeaponB'].forEach(w => {
				var weapon1 = weapons[w+'1'];
				var weapon2 = weapons[w+'2'];
				if (! weapon1 && ! weapon2) return;
				var row = [];
				if (weapon1) {
					row.push(profweps[weapon1].skills.find(w => w.slot === 'Weapon_1').id);
					row.push(profweps[weapon1].skills.find(w => w.slot === 'Weapon_2').id);
					if (profession.name === "Thief") {
						row.push(profweps[weapon1].skills.find(w => w.slot === 'Weapon_3' && w.offhand === weapon2).id);
					} else {
						row.push(profweps[weapon1].skills.find(w => w.slot === 'Weapon_3').id);
					}
					if (twoHanders.indexOf(weapon1) > -1) {
						row.push(profweps[weapon1].skills.find(w => w.slot === 'Weapon_4').id);
						row.push(profweps[weapon1].skills.find(w => w.slot === 'Weapon_5').id);
					}
				} else {
					row = row.concat([null, null, null]);
				}
				if (weapon2) {
					row.push(profweps[weapon2].skills.find(w => w.slot === 'Weapon_4').id);
					row.push(profweps[weapon2].skills.find(w => w.slot === 'Weapon_5').id);
				} else if (twoHanders.indexOf(weapon1) == -1) {
					row = row.concat([null, null]);
				}
				skills.push(row.map(s => SkillStore.get(s) || {}));
			});
		}
		if (skills.length === 0) skills.push([{},{},{},{},{}]);
		var cskills = character.skills[type];
		if (profession.name === "Revenant") {
			if (skills.length === 1) skills.push([{},{},{},{},{}]);
			var all_skills = [];
			cskills.legends.forEach((l, i) => {
				var l = LegendStore.get(l); if (! l) return;
				var skill_ids = [l.heal].concat(l.utilities).concat([l.elite]);
				all_skills = all_skills.concat(skill_ids);
				skills[i] = skills[i].concat(skill_ids.map(s => SkillStore.get(s) || {}));
			});
			SkillStore.retrieve(all_skills);
		} else {
			var skill_ids = [cskills.heal].concat(cskills.utilities).concat([cskills.elite]);
			skills[0] = skills[0].concat(skill_ids.map(s => SkillStore.get(s) || {}));
		}
		return skills;
	}

	render() {
		if (! this.props.profession.name || ! this.props.character.name) return (<div />);
		return(<div>
			{this.state.skills && this.state.skills.map((row,ri) => <div key={ri}>
				{row.map((skill,si) => <OverlayTrigger key={si} trigger={['hover','focus','click']} rootClose placement="top" overlay={
					<Popover id="skill-details" title={skill.name}>{skill.description}</Popover>
				}>
					<img src={skill.icon} style={{ width: '64px', height: '64px' }} />
				</OverlayTrigger>)}
			</div>)}
			<br/>
			<PostToChannel cmd="build string" data={{ name: this.props.character.name, type: this.props.type }} />
		</div>);
	}
}

class Equipment extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.itemChangeListener = this._itemChanges.bind(this);
		this.statChangeListener = this._statChanges.bind(this);
		this.skinChangeListener = this._skinChanges.bind(this);
		ItemStore.addChangeListener(this.itemChangeListener);
		StatsStore.addChangeListener(this.statChangeListener);
		SkinsStore.addChangeListener(this.skinChangeListener);
	}

	componentWillUnmount() {
		ItemStore.removeChangeListener(this.itemChangeListener);
		StatsStore.removeChangeListener(this.statChangeListener);
		SkinsStore.removeChangeListener(this.skinChangeListener);
	}

	_itemChanges() {
		this._myItems.filter(i => !!i).forEach(item => item.doUpdate());
	}

	_statChanges() {
		this._myItems.filter(i => !!i).forEach(item => item.doStatsUpdate());
	}

	_skinChanges() {
		this._myItems.filter(i => !!i).forEach(item => item.doSkinUpdate());
	}

	_profChanges() {
		this.setState({ profession: this._getProfession(this.state.character.profession) });
	}

	render() {
		if (! this.props.character.name) return (<div />);
		var gear_hash = (this.props.character.equipment) ? this.props.character.equipment.reduce((t,e) => {
			t[e.slot] = e;
			return t;
		}, {}) : {};
		this._myItems = [];
		return (<div><Row>
			<Col sm={4}>
				<Panel header="Armor">
					{ ['Helm', 'Shoulders', 'Coat', 'Gloves', 'Leggings', 'Boots'].filter(slot => !!gear_hash[slot]).map(slot => <ShowItem key={slot} data={gear_hash[slot]} ref={ i => { this._myItems.push(i) } } />) }
				</Panel>
			</Col>
			<Col sm={4}>
				<Panel header="Trinkets">
					{ ['Backpack', 'Accessory1', 'Accessory2', 'Amulet', 'Ring1', 'Ring2'].filter(slot => !!gear_hash[slot]).map(slot => <ShowItem key={slot} data={gear_hash[slot]} ref={ i => { this._myItems.push(i) } } />) }
				</Panel>
			</Col>
			<Col sm={4}>
				<Panel header="Weapons">
					{ ['WeaponA1', 'WeaponA2'].filter(slot => !!gear_hash[slot]).map(slot => <ShowItem key={slot} data={gear_hash[slot]} ref={ i => { this._myItems.push(i) } } />) }
					<br/>
					{ ['WeaponB1', 'WeaponB2'].filter(slot => !!gear_hash[slot]).map(slot => <ShowItem key={slot} data={gear_hash[slot]} ref={ i => { this._myItems.push(i) } } />) }
				</Panel>
			</Col>
		</Row>
		<Row>
			<PostToChannel cmd="equip string" data={{ name: this.props.character.name }} />
		</Row></div>)
	}
}

export default class Character extends React.Component {
	constructor(props) {
		super(props);

		this._getCharacter = this._getCharacter.bind(this);
		this._getCharacters = this._getCharacters.bind(this);

		this._getCharacters();
		this._getCharacter(props.params.name),

		this.state = {
			tab: 1,
			type: 'pve',
			characters: [],
			character: null,
			profession: {}
		};
	}

	componentWillReceiveProps(newProps) {
		if (newProps.params.name !== this.props.params.name) this._getCharacter(newProps.params.name);
	}

	componentDidMount() {
		this.profChangeListener = this._profChanges.bind(this);
		ProfessionStore.addChangeListener(this.profChangeListener);
	}

	componentWillUnmount() {
		ProfessionStore.removeChangeListener(this.profChangeListener);
	}

	_profChanges() {
		this.setState({ profession: this._getProfession(this.state.character.profession) });
	}

	_getCharacters() {
		Socket.send('get characters')
			.then(characters => this.setState({ characters }))
			.catch(err => {
				console.log(err);
			})
		;
	}

	_getCharacter(name) {
		Socket.send('get character', name)
			.then(character => {
				this.setState({ profession: this._getProfession(character.profession), character });
				if (character.profession)
					ProfessionStore.retrieve(character.profession);
				// Gather various ids we need for further information
				if (character.equipment) {
					var item_ids = character.equipment.map(e => e.id);
					var upgrade_ids = character.equipment.filter(e => e.upgrades).reduce((t, u) => t.concat(u.upgrades), []);
					var stat_ids = character.equipment.filter(e => e.stats).map(e => e.stats.id);
					var skin_ids = character.equipment.filter(s => s.skin).map(s => s.skin);
					ItemStore.retrieveItems(item_ids.concat(upgrade_ids));
					StatsStore.retrieveStats(stat_ids);
					SkinsStore.retrieveSkins(skin_ids);
				}
			})
			.catch(err => {
				if (err === "no such id") return browserHistory.push('/characters');
				console.log(err);
			})
		;
	}

	_getProfession(profession) {
		if (! profession) return {};
		return ProfessionStore.get(profession) || {};
	}

	selectTab(tab) {
		this.setState({tab});
	}

	selectType(type) {
		this.setState({type});
	}

	_onSelect(selectedCharacter) {
		this.setState({ character: null });
		browserHistory.push('/characters/'+selectedCharacter);
	}

	render() {
		return (
			<div>
			<Row>
				<Col xs={1}>
					<img src={this.state.profession.icon_big} />
				</Col>
				<Col xs={11}>
					<Dropdown id="dropdown-characters" onSelect={this._onSelect.bind(this)}>
						<Dropdown.Toggle bsStyle="link">
							<span style={{fontSize: 'xx-large'}}>{this.props.params.name}</span>
						</Dropdown.Toggle>
						<Dropdown.Menu>
							{this.state.characters.map((c,i) => <MenuItem key={i} eventKey={c}>{c}</MenuItem>)}
						</Dropdown.Menu>
					</Dropdown>
				</Col>
			</Row>
			{ this.state.character && <Row>
				<div style={{margin: '10px' }}>Level { this.state.character.level } { this.state.character.profession }</div>
			</Row> }
			{ this.state.character && <Row>
				<Nav bsStyle="pills" activeKey={this.state.type} onSelect={this.selectType.bind(this)}>
					<NavItem eventKey="pve">PvE</NavItem>
					<NavItem eventKey="wvw">WvW</NavItem>
					<NavItem eventKey="pvp">PvP</NavItem>
				</Nav>
				<br />
			</Row> }
			{ this.state.character && <Row>
				<Tabs activeKey={this.state.tab} onSelect={this.selectTab.bind(this)} id="character-tabs">
					<br/>
					<Tab title="Equipment" eventKey={1}><Equipment character={this.state.character} /></Tab>
					<Tab title="Traits" eventKey={2}><Traits character={this.state.character} type={this.state.type} /></Tab>
					<Tab title="Skills" eventKey={3}><Skills character={this.state.character} profession={this.state.profession} type={this.state.type} /></Tab>
					<Tab title="Privacy" eventKey={4}><Privacy character={this.state.character} /></Tab>
				</Tabs>
			</Row> }
			</div>
		);
	}
}
