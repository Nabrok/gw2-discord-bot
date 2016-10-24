import React from 'react';
import {Popover, OverlayTrigger, Badge} from 'react-bootstrap';

export default class Item extends React.Component {
	_formatDescription(description) {
		if (! description) return {__html: ''};
		var fixed = description
		.replace(/\n/g, "<br/>")
		.replace(/<c=@reminder>.+?<\/c>/g, reminder => reminder.replace(/<c=@reminder>/, '<span class="text-warning">').replace(/<\/c>/, '</span>'))
		.replace(/<c=@flavor>.+?<\/c>/g, flavor => flavor.replace(/<c=@flavor>/, '<span class="text-info">').replace(/<\/c>/, '</span>'))
		.replace(/<c=@warning>.+?<\/c>/g, warning => warning.replace(/<c=@warning>/, '<span class="text-danger">').replace(/<\/c>/, '</span>'));
		return {__html: fixed};
	}

	render() {
		var item = this.props.item;
		var stats = this.props.stats || {};
		var skin = this.props.skin || {};
		var upgrades = this.props.upgrades || [];
		var icon = this.props.skin && skin.icon ? skin.icon : item.icon;
		var name = this.props.skin && skin.name ? skin.name : item.name;
		var count = this.props.count;
		if (count > 1) name = count+' '+name;
		var details = (
			<Popover id={'item-details-'+item.id} title={name}>
				{ item.level > 0 && <span>Level {item.level}</span> } {item.rarity} {stats.name} {item.details && item.details.type ? item.details.type : item.type}
				{ item.details && item.details.description && <div>
					<hr />
					<span dangerouslySetInnerHTML={this._formatDescription(item.details.description)} />
				</div> }
				{ upgrades.length > 0 && <div>
					<hr/>
					{ upgrades.map((u,i) => <div key={i}>{u.name}</div>) }
				</div> }
				{ item.description && <div><hr/><span dangerouslySetInnerHTML={this._formatDescription(item.description)} /></div> }
			</Popover>
		);
		var placement = this.props.placement || "top";
		var class_name = this.props.size === "small" ? 'item' : 'largeItem';
		return (
			<OverlayTrigger trigger={['hover', 'focus', 'click']} rootClose placement={placement} overlay={details}>
				<div style={{position: 'relative', display: 'inline-block'}}>
					<img className={item.rarity+' '+class_name} src={icon} />
					{ count && <span style={{position: 'absolute', top: '3px', right: '3px'}}><Badge>{count}</Badge></span> }
				</div>
			</OverlayTrigger>
		);
	}
}
