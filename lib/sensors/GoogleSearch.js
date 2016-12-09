'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.GoogleSearch = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _ChannelManager = require('../middleware/ChannelManager.js');

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _reactSelect = require('react-select');

var _reactSelect2 = _interopRequireDefault(_reactSelect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var helper = require('../middleware/helper.js');

var GoogleSearch = exports.GoogleSearch = function (_Component) {
	_inherits(GoogleSearch, _Component);

	function GoogleSearch(props, context) {
		_classCallCheck(this, GoogleSearch);

		var _this = _possibleConstructorReturn(this, (GoogleSearch.__proto__ || Object.getPrototypeOf(GoogleSearch)).call(this, props));

		_this.state = {
			currentValue: '',
			currentDistance: 0,
			value: 0
		};
		_this.type = 'match';
		_this.locString = '';
		_this.result = {
			options: []
		};
		_this.handleChange = _this.handleChange.bind(_this);
		_this.loadOptions = _this.loadOptions.bind(_this);
		_this.defaultQuery = _this.defaultQuery.bind(_this);
		_this.handleValuesChange = _this.handleValuesChange.bind(_this);
		_this.handleResults = _this.handleResults.bind(_this);
		return _this;
	}

	_createClass(GoogleSearch, [{
		key: 'componentWillMount',
		value: function componentWillMount() {
			this.googleMaps = window.google.maps;
		}

		// Set query information

	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			this.setQueryInfo();
			if (this.props.autoLocation) {
				this.getUserLocation();
			}
		}
	}, {
		key: 'getUserLocation',
		value: function getUserLocation() {
			var _this2 = this;

			navigator.geolocation.getCurrentPosition(function (location) {
				_this2.locString = location.coords.latitude + ', ' + location.coords.longitude;
				_axios2.default.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + _this2.locString + '&key=' + _this2.props.APIkey).then(function (res) {
					var currentValue = res.data.results[0].formatted_address;
					_this2.result.options.push({
						'value': currentValue,
						'label': currentValue
					});
					_this2.setState({
						currentValue: currentValue
					}, _this2.executeQuery.bind(_this2));
				});
			});
		}

		// set the query type and input data

	}, {
		key: 'setQueryInfo',
		value: function setQueryInfo() {
			var obj = {
				key: this.props.sensorId,
				value: {
					queryType: this.type,
					inputData: this.props.inputData,
					defaultQuery: this.defaultQuery
				}
			};
			helper.selectedSensor.setSensorInfo(obj);
		}

		// build query for this sensor only

	}, {
		key: 'defaultQuery',
		value: function defaultQuery(value) {
			if (value && value.currentValue != '' && value.location != '') {
				var _type;

				return _defineProperty({}, this.type, (_type = {}, _defineProperty(_type, this.props.inputData, value.location), _defineProperty(_type, 'distance', value.currentDistance), _type));
			} else {
				return;
			}
		}

		// get coordinates

	}, {
		key: 'getCoordinates',
		value: function getCoordinates(value) {
			var _this3 = this;

			if (value && value != '') {
				_axios2.default.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + value + '&key=' + this.props.APIkey).then(function (res) {
					var location = res.data.results[0].geometry.location;
					_this3.locString = location.lat + ', ' + location.lng;
					_this3.executeQuery();
				});
			} else {
				helper.selectedSensor.set(null, true);
			}
		}

		// execute query after changing location or distanc

	}, {
		key: 'executeQuery',
		value: function executeQuery() {
			if (this.state.currentValue != '' && this.locString) {
				var obj = {
					key: this.props.sensorId,
					value: {
						currentValue: this.state.currentValue,
						location: this.locString
					}
				};
				helper.selectedSensor.set(obj, true);
			}
		}

		// use this only if want to create actuators
		// Create a channel which passes the depends and receive results whenever depends changes

	}, {
		key: 'createChannel',
		value: function createChannel() {
			var depends = this.props.depends ? this.props.depends : {};
			var channelObj = _ChannelManager.manager.create(this.context.appbaseConfig, depends);
		}

		// handle the input change and pass the value inside sensor info

	}, {
		key: 'handleChange',
		value: function handleChange(input) {
			if (input) {
				var inputVal = input.value;
				this.setState({
					'currentValue': inputVal
				});
				this.getCoordinates(inputVal);
			} else {
				this.setState({
					'currentValue': ''
				});
			}
		}

		// Handle function when value slider option is changing

	}, {
		key: 'handleValuesChange',
		value: function handleValuesChange(component, value) {
			this.setState({
				value: value
			});
		}

		// Handle function when slider option change is completed

	}, {
		key: 'handleResults',
		value: function handleResults(component, value) {
			value = value + this.props.unit;
			this.setState({
				currentDistance: value
			}, this.executeQuery.bind(this));
		}
	}, {
		key: 'loadOptions',
		value: function loadOptions(input, callback) {
			var _this4 = this;

			this.callback = callback;
			if (input) {
				var googleMaps = this.googleMaps || window.google.maps;
				this.autocompleteService = new googleMaps.places.AutocompleteService();
				var options = {
					input: input
				};
				this.result = {
					options: []
				};
				this.autocompleteService.getPlacePredictions(options, function (res) {
					res.map(function (place) {
						_this4.result.options.push({
							'value': place.description,
							'label': place.description
						});
					});
					_this4.callback(null, _this4.result);
				});
			} else {
				this.callback(null, this.result);
			}
		}

		// render

	}, {
		key: 'render',
		value: function render() {
			var title = null;
			if (this.props.title) {
				title = _react2.default.createElement(
					'h4',
					{ className: 'ab-componentTitle' },
					this.props.title
				);
			}

			return _react2.default.createElement(
				'div',
				{ className: 'ab-component ab-GoogleSearchComponent clearfix card thumbnail col s12 col-xs-12' },
				title,
				_react2.default.createElement(
					'div',
					{ className: 'row' },
					_react2.default.createElement(_reactSelect2.default.Async, {
						className: 'ab-select-react col s12 col-xs-6 p-0',
						name: 'appbase-search',
						value: this.state.currentValue,
						loadOptions: this.loadOptions,
						placeholder: this.props.placeholder,
						onChange: this.handleChange
					})
				)
			);
		}
	}]);

	return GoogleSearch;
}(_react.Component);

GoogleSearch.propTypes = {
	inputData: _react2.default.PropTypes.string.isRequired,
	placeholder: _react2.default.PropTypes.string
};
// Default props value
GoogleSearch.defaultProps = {
	placeholder: "Search...",
	autoLocation: true
};

// context type
GoogleSearch.contextTypes = {
	appbaseConfig: _react2.default.PropTypes.any.isRequired
};