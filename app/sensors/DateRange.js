import React, { Component } from "react";
import { DateRangePicker } from "react-dates";
import classNames from "classnames";
import * as TYPES from "../middleware/constants";

const moment = require("moment");
const momentPropTypes = require("react-moment-proptypes");
const helper = require("../middleware/helper");

export default class DateRange extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentValue: {
				startDate: this.props.defaultSelected.start,
				endDate: this.props.defaultSelected.end
			},
			focusedInput: null
		};
		this.type = "range";
		this.handleChange = this.handleChange.bind(this);
		this.customQuery = this.customQuery.bind(this);
		this.onFocusChange = this.onFocusChange.bind(this);
	}

	// Set query information
	componentDidMount() {
		this.setQueryInfo();
		this.checkDefault();
	}

	componentWillUpdate() {
		this.checkDefault();
	}

	// handle focus
	onFocusChange(focusedInput) {
		this.setState({ focusedInput });
	}

	// set the query type and input data
	setQueryInfo() {
		const obj = {
			key: this.props.componentId,
			value: {
				queryType: this.type,
				inputData: this.props.appbaseField,
				customQuery: this.props.customQuery ? this.props.customQuery : this.customQuery
			}
		};
		helper.selectedSensor.setSensorInfo(obj);
	}

	isDateChange() {
		let flag = false;

		function checkDefault() {
			let flag1 = false;
			if (this.props.defaultSelected.start && this.props.defaultSelected.end) {
				this.startDate = this.props.defaultSelected.start;
				this.endDate = this.props.defaultSelected.end;
				flag1 = true;
			}
			return flag1;
		}

		try {
			if (this.startDate && this.endDate) {
				if (moment(this.startDate).format("YYYY-MM-DD") !== moment(this.props.defaultSelected.start).format("YYYY-MM-DD") && moment(this.endDate).format("YYYY-MM-DD") !== moment(this.props.defaultSelected.end).format("YYYY-MM-DD")) {
					this.startDate = this.props.defaultSelected.start;
					this.endDate = this.props.defaultSelected.end;
					flag = true;
				}
			} else {
				flag = checkDefault.call(this);
			}
		} catch (e) {
			flag = checkDefault.call(this);
		}
		return flag;
	}

	checkDefault() {
		if (this.isDateChange()) {
			const dateSelectionObj = {
				startDate: this.startDate,
				endDate: this.endDate
			};
			setTimeout(this.handleChange.bind(this, dateSelectionObj), 1000);
		}
	}

	// build query for this sensor only
	customQuery(value) {
		let query = null;
		if (value) {
			query = {
				range: {
					[this.props.appbaseField]: {
						gte: value.startDate,
						lte: value.endDate
					}
				}
			};
		}
		return query;
	}

	// handle the input change and pass the value inside sensor info
	handleChange(inputVal) {
		this.setState({
			currentValue: inputVal
		});
		const obj = {
			key: this.props.componentId,
			value: inputVal
		};
		// pass the selected sensor value with componentId as key,
		const isExecuteQuery = true;
		helper.selectedSensor.set(obj, isExecuteQuery);
	}

	// allow all dates
	allowAllDates() {
		let outsideObj;
		if (this.props.allowAllDates) {
			outsideObj = {
				isOutsideRange: () => false
			};
		}

		return outsideObj;
	}

	// render
	render() {
		let title = null;
		if (this.props.title) {
			title = (<h4 className="rbc-title col s12 col-xs-12">{this.props.title}</h4>);
		}

		const cx = classNames({
			"rbc-title-active": this.props.title,
			"rbc-title-inactive": !this.props.title
		});
		return (
			<div className={`rbc rbc-daterange col s12 col-xs-12 card thumbnail ${cx}`}>
				{title}
				<div className="rbc-daterange-component col s12 col-xs-12">
					<DateRangePicker
						id={this.props.componentId}
						startDate={this.state.currentValue.startDate}
						endDate={this.state.currentValue.endDate}
						focusedInput={this.state.focusedInput}
						numberOfMonths={this.props.numberOfMonths}
						{...this.props.extra}
						{...this.allowAllDates()}
						onDatesChange={(date) => { this.handleChange(date); }}
						onFocusChange={this.onFocusChange}
					/>
				</div>
			</div>
		);
	}
}

DateRange.propTypes = {
	componentId: React.PropTypes.string.isRequired,
	appbaseField: React.PropTypes.string,
	title: React.PropTypes.string,
	defaultSelected: React.PropTypes.shape({
		start: momentPropTypes.momentObj,
		end: momentPropTypes.momentObj
	}),
	numberOfMonths: React.PropTypes.number,
	allowAllDates: React.PropTypes.bool,
	extra: React.PropTypes.any,
	customQuery: React.PropTypes.func
};

// Default props value
DateRange.defaultProps = {
	numberOfMonths: 2,
	allowAllDates: true,
	defaultSelected: {
		start: null,
		end: null
	}
};

// context type
DateRange.contextTypes = {
	appbaseRef: React.PropTypes.any.isRequired,
	type: React.PropTypes.any.isRequired
};

DateRange.types = {
	componentId: TYPES.STRING,
	appbaseField: TYPES.STRING,
	title: TYPES.STRING,
	defaultSelected: TYPES.OBJECT,
	numberOfMonths: TYPES.NUMBER,
	allowAllDates: TYPES.BOOLEAN,
	extra: TYPES.OBJECT,
	customQuery: TYPES.FUNCTION
};
