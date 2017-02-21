import { default as React, Component } from 'react';
import { NativeList } from './NativeList';
import * as TYPES from '../middleware/constants.js';

export class SingleList extends Component {
	constructor(props, context) {
		super(props);
	}

	render() {
		return (
			<NativeList
				{...this.props}
				multipleSelect={false}
			/>
		);
	}
}

SingleList.propTypes = {
	componentId: React.PropTypes.string.isRequired,
	appbaseField : React.PropTypes.string.isRequired,
	title : React.PropTypes.string,
	defaultSelected: React.PropTypes.string,
	size: React.PropTypes.number,
	showCount: React.PropTypes.bool,
	sortBy: React.PropTypes.string,
	showSearch: React.PropTypes.bool,
	placeholder: React.PropTypes.string,
	customQuery: React.PropTypes.func,
	initialLoader: React.PropTypes.shape({
		show: React.PropTypes.bool,
		text: React.PropTypes.string
	})
};

// Default props value
SingleList.defaultProps = {
	showCount: true,
	sort: 'count',
	size: 100,
	showSearch: false,
	title: null,
	placeholder: 'Search',
	initialLoader: {
		show: true
	}
};

// context type
SingleList.contextTypes = {
	appbaseRef: React.PropTypes.any.isRequired,
	type: React.PropTypes.any.isRequired
};

SingleList.types = {
	componentId: TYPES.STRING,
	appbaseField: TYPES.STRING,
	title: TYPES.STRING,
	defaultSelected: TYPES.STRING,
	size: TYPES.NUMBER,
	sortBy: TYPES.STRING,
	showCount: TYPES.BOOLEAN,
	showSearch: TYPES.BOOLEAN,
	placeholder: TYPES.STRING,
	customQuery: TYPES.FUNCTION,
	initialLoader: TYPES.OBJECT
};
