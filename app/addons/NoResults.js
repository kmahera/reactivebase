import React, { Component } from 'react';

export default class NoResults extends Component {
	constructor(props, context) {
		super(props);
	}

	// render
	render() {
		return (
			<div className={`rbc rbc-noresults`}>
				{this.props.defaultText}
			</div>
		);
	}
}

NoResults.propTypes = {
	defaultText: React.PropTypes.string,
};

// Default props value
NoResults.defaultProps = {
	defaultText: "No results found..."
};
