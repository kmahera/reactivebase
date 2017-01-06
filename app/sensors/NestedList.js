import { default as React, Component } from 'react';
import { ItemCheckboxList } from './component/ItemCheckboxList.js';
import { NestedItem } from './component/NestedItem.js';
import classNames from 'classnames';
import { manager } from '../middleware/ChannelManager.js';
import { StaticSearch } from './component/StaticSearch.js';
var helper = require('../middleware/helper.js');

export class NestedList extends Component {
	constructor(props, context) {
		super(props);
		this.state = {
			items: [],
			storedItems: [],
			rawData: {
				hits: {
					hits: []
				}
			},
			subItems: [],
			selectedValues: []
		};
		this.channelId = null;
		this.channelListener = null;
		this.defaultSelected = this.props.defaultSelected;
		this.filterBySearch = this.filterBySearch.bind(this);
		this.onItemSelect = this.onItemSelect.bind(this);
		this.defaultQuery = this.defaultQuery.bind(this);
		this.handleSelect = this.handleSelect.bind(this);
		this.type = this.props.multipleSelect ? 'Terms' : 'Term';
	}

	// Get the items from Appbase when component is mounted
	componentWillMount() {
		this.setQueryInfo();
		this.createChannel();
		this.createSubChannel();
	}

	componentDidMount() {
		if(this.props.defaultSelected) {
			this.setValue('', false);
			setTimeout(() => {
				this.handleSelect();
			}, 2000);
		}
	}

	handleSelect() {
		if(this.props.defaultSelected) {
			this.props.defaultSelected.forEach((value, index) => {
				this.onItemSelect(value, index);
			})
		}
	}

	componentWillUpdate() {
		setTimeout(() => {
			if (this.defaultSelected != this.props.defaultSelected) {
				this.defaultSelected = this.props.defaultSelected;
				let items = this.state.items;
				items = items.map((item) => {
					item.key = item.key.toString();
					item.status = this.defaultSelected && this.defaultSelected.indexOf(item.key) > -1 ? true : false;
					return item;
				});
				this.setState({
					items: items,
					storedItems: items
				});
				this.handleSelect(this.defaultSelected);
			}
		}, 300);
	}

	// stop streaming request and remove listener when component will unmount
	componentWillUnmount() {
		if(this.channelId) {
			manager.stopStream(this.channelId);
		}
		if(this.subChannelId) {
			manager.stopStream(this.subChannelId);
		}
		if(this.channelListener) {
			this.channelListener.remove();
		}
		if(this.subChannelListener) {
			this.subChannelListener.remove();
		}
	}

	// build query for this sensor only
	defaultQuery(record) {
		if(record) {
			let query = {
				bool: {
					must: generateRangeQuery(this.props.appbaseField)
				}
			};
			console.log(query);
			return query;
		}
		function generateRangeQuery(appbaseField) {
			return record.map((singleRecord, index) => {
				return {
					term: {
						[appbaseField[index]]: singleRecord
					}
				};
			});
		}
	}

	// set the query type and input data
	setQueryInfo() {
		var obj = {
				key: this.props.sensorId,
				value: {
					queryType: this.type,
					inputData: this.props.appbaseField[0],
					defaultQuery: this.defaultQuery
				}
		};
		helper.selectedSensor.setSensorInfo(obj);
	}

	// Create a channel which passes the depends and receive results whenever depends changes
	createChannel() {
		// Set the depends - add self aggs query as well with depends
		let depends = this.props.depends ? this.props.depends : {};
		depends['aggs'] = {
			key: this.props.appbaseField[0],
			sort: this.props.sortBy,
			size: this.props.size
		};
		// create a channel and listen the changes
		var channelObj = manager.create(this.context.appbaseRef, this.context.type, depends);
		this.channelId = channelObj.channelId;
		this.channelListener = channelObj.emitter.addListener(this.channelId, function(res) {
			let data = res.data;
			let rawData;
			if(res.mode === 'streaming') {
				rawData = this.state.rawData;
				rawData.hits.hits.push(res.data);
			} else if(res.mode === 'historic') {
				rawData = data;
			}
			this.setState({
				rawData: rawData
			});
			this.setData(rawData, 0);
		}.bind(this));
	}

	// Create a channel for sub category
	createSubChannel() {
		this.setSubCategory();
		let depends = {
			'aggs': {
				key: this.props.appbaseField[1],
				sort: this.props.sortBy,
				size: this.props.size
			},
			'subCategory': { operation: "must" }
		};
		// create a channel and listen the changes
		var subChannelObj = manager.create(this.context.appbaseRef, this.context.type, depends);
		this.subChannelId = subChannelObj.channelId;
		this.subChannelListener = subChannelObj.emitter.addListener(this.subChannelId, function(res) {
			let data = res.data;
			let rawData;
			if(res.mode === 'streaming') {
				rawData = this.state.subRawData;
				rawData.hits.hits.push(res.data);
			} else if(res.mode === 'historic') {
				rawData = data;
			}
			if(this.state.selectedValues.length) {
				this.setState({
					subRawData: rawData
				});
				this.setData(rawData, 1);
			}
		}.bind(this));
		var obj = {
			key: 'subCategory',
			value: ''
		};
		helper.selectedSensor.set(obj, true);
	}

	// set the query type and input data
	setSubCategory() {
		var obj = {
				key: 'subCategory',
				value: {
					queryType: 'term',
					inputData: this.props.appbaseField[0]
				}
		};

		helper.selectedSensor.setSensorInfo(obj);
	}

	setData(data, level) {
		if(data.aggregations && data.aggregations[this.props.appbaseField[level]] && data.aggregations[this.props.appbaseField[level]].buckets) {
			this.addItemsToList(data.aggregations[this.props.appbaseField[level]].buckets, level);
		}
	}

	addItemsToList(newItems, level) {
		newItems = newItems.map((item) => {
			item.key = item.key.toString();
			item.status = this.defaultSelected && this.defaultSelected.indexOf(item.key) > -1 ? true : false;
			return item
		});
		let itemVar = level === 0 ? 'items' : 'subItems';
		this.setState({
			[itemVar]: newItems,
			storedItems: newItems
		});
	}

	// set value
	setValue(value, isExecuteQuery=false) {
		var obj = {
			key: this.props.sensorId,
			value: value
		};
		helper.selectedSensor.set(obj, isExecuteQuery);
	}

	// filter
	filterBySearch(value) {
		if(value) {
			let items = this.state.storedItems.filter(function(item) {
				return item.key && item.key.toLowerCase().indexOf(value.toLowerCase()) > -1;
			});
			this.setState({
				items: items
			});
		} else {
			this.setState({
				items: this.state.storedItems
			});
		}
	}

	onItemSelect(key, level) {
		let selectedValues = this.state.selectedValues;
		selectedValues[level] = key;
		let stateItems = {
			selectedValues: selectedValues
		};
		if(level === 0) {
			selectedValues.splice(1, 1);
			if(key !== selectedValues[0]) {
				stateItems.subItems = [];
			}
			var obj = {
				key: 'subCategory',
				value: key
			};
			helper.selectedSensor.set(obj, true);
		}
		this.setValue(selectedValues, true);
		this.setState(stateItems);
	}

	renderChevron(level) {
		return level === 0 ? (<i className="fa fa-chevron-right"></i>) : '' ;
	}

	renderItems(items, level) {
		return items.map((item, index) => {
			let cx = classNames({
				'rbc-item-active': (item.key === this.state.selectedValues[level]),
				'rbc-item-inactive': !(item.key === this.state.selectedValues[level])
			});
			return (
				<li
					key={index}
					className="rbc-item col s12 col-xs-12">
					<a href="javascript:void(0);" className={`rbc-item-link col s12 col-xs-12 ${cx}`} onClick={() => this.onItemSelect(item.key, level)}>
						<span> {item.key} </span>
						<span className="rbc-badge"> {item.doc_count}</span>
						{this.renderChevron(level)}
					</a>
					{this.renderList(item.key, level)}
				</li>
			);
		});
	}

	renderList(key, level) {
		let list;
		if(key === this.state.selectedValues[level] && level === 0) {
			list = (
				<ul className="rbc-sub-nestedlist rbc-indent col s12 col-xs-12">
					{this.renderItems(this.state.subItems, 1)}
				</ul>
			)
		}
		return list;
	}

	render() {
		let listComponent,
			searchComponent = null,
			title = null;

		listComponent = (
			<ul className="row">
				{this.renderItems(this.state.items, 0)}
			</ul>
		);

		// set static search
		if(this.props.showSearch) {
			searchComponent = <StaticSearch
				placeholder={this.props.searchPlaceholder}
				changeCallback={this.filterBySearch}
			/>
		}

		if(this.props.title) {
			title = (<h4 className="rbc-title col s12 col-xs-12">{this.props.title}</h4>);
		}

		let cx = classNames({
			'rbc-search-active': this.props.showSearch,
			'rbc-search-inactive': !this.props.showSearch,
			'rbc-title-active': this.props.title,
			'rbc-title-inactive': !this.props.title
		});

		return (
			<div className={`rbc rbc-nestedlist col s12 col-xs-12 card thumbnail ${cx}`} style={this.props.defaultStyle}>
				{title}
				{searchComponent}
				{listComponent}
			</div>
		);
	}
}

NestedList.propTypes = {
	appbaseField: React.PropTypes.array.isRequired,
	defaultQuery: React.PropTypes.func,
	size: React.PropTypes.number,
	showCount: React.PropTypes.bool,
	multipleSelect: React.PropTypes.bool,
	sortBy: React.PropTypes.string,
	includeSelectAll: React.PropTypes.bool
};

// Default props value
NestedList.defaultProps = {
	showCount: true,
	multipleSelect: false,
	sortBy: 'count',
	size: 100,
	showSearch: false,
	title: null,
	searchPlaceholder: 'Search',
	includeSelectAll: false,
	defaultStyle: {
		height: '500px',
		overflow: 'auto'
	}
};

// context type
NestedList.contextTypes = {
	appbaseRef: React.PropTypes.any.isRequired,
	type: React.PropTypes.any.isRequired
};