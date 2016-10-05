webpackJsonp([0],{

/***/ 0:
/*!**************************************!*\
  !*** ./features/web/client/index.js ***!
  \**************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _react = __webpack_require__(/*! react */ 1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactDom = __webpack_require__(/*! react-dom */ 34);
	
	var _reactRouter = __webpack_require__(/*! react-router */ 172);
	
	var _App = __webpack_require__(/*! ./components/App */ 235);
	
	var _App2 = _interopRequireDefault(_App);
	
	var _Home = __webpack_require__(/*! ./components/Home */ 552);
	
	var _Home2 = _interopRequireDefault(_Home);
	
	var _Login = __webpack_require__(/*! ./components/Login */ 553);
	
	var _Login2 = _interopRequireDefault(_Login);
	
	var _Auth = __webpack_require__(/*! ./components/Auth */ 554);
	
	var _Auth2 = _interopRequireDefault(_Auth);
	
	var _ApiKey = __webpack_require__(/*! ./components/ApiKey */ 555);
	
	var _ApiKey2 = _interopRequireDefault(_ApiKey);
	
	var _Characters = __webpack_require__(/*! ./components/Characters */ 563);
	
	var _Characters2 = _interopRequireDefault(_Characters);
	
	var _Character = __webpack_require__(/*! ./components/Character */ 566);
	
	var _Character2 = _interopRequireDefault(_Character);
	
	var _LoginStore = __webpack_require__(/*! ./stores/LoginStore */ 490);
	
	var _LoginStore2 = _interopRequireDefault(_LoginStore);
	
	var _LoginActions = __webpack_require__(/*! ./actions/LoginActions */ 551);
	
	var _LoginActions2 = _interopRequireDefault(_LoginActions);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function needsLogin(nextState, replace) {
		if (!_LoginStore2.default.isLoggedIn()) {
			replace({ pathname: '/get_login', state: { nextPathname: nextState.location.pathname } });
		}
	}
	
	var jwt = localStorage.getItem('jwt');
	if (jwt) {
		_LoginActions2.default.loginUser(jwt);
	}
	
	var routes = _react2.default.createElement(
		_reactRouter.Route,
		{ path: '/', component: _App2.default },
		_react2.default.createElement(
			_reactRouter.Route,
			{ onEnter: needsLogin },
			_react2.default.createElement(_reactRouter.IndexRoute, { component: _Home2.default }),
			_react2.default.createElement(_reactRouter.Route, { path: '/api_key', component: _ApiKey2.default }),
			_react2.default.createElement(_reactRouter.Route, { path: '/characters', component: _Characters2.default }),
			_react2.default.createElement(_reactRouter.Route, { path: '/characters/:name', component: _Character2.default })
		),
		_react2.default.createElement(_reactRouter.Route, { path: '/get_login', component: _Login2.default }),
		_react2.default.createElement(_reactRouter.Route, { path: '/auth', component: _Auth2.default }),
		_react2.default.createElement(_reactRouter.Route, { path: '/logout', onEnter: function onEnter(nextState, replace) {
				_LoginActions2.default.logoutUser();replace({ pathname: '/get_login' });
			} })
	);
	
	(0, _reactDom.render)(_react2.default.createElement(
		_reactRouter.Router,
		{ history: _reactRouter.browserHistory },
		routes
	), document.getElementById('app'));

/***/ },

/***/ 235:
/*!***********************************************!*\
  !*** ./features/web/client/components/App.js ***!
  \***********************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(/*! react */ 1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactBootstrap = __webpack_require__(/*! react-bootstrap */ 236);
	
	var _reactRouter = __webpack_require__(/*! react-router */ 172);
	
	var _reactRouterBootstrap = __webpack_require__(/*! react-router-bootstrap */ 487);
	
	var _LoginStore = __webpack_require__(/*! ../stores/LoginStore */ 490);
	
	var _LoginStore2 = _interopRequireDefault(_LoginStore);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var App = function (_React$Component) {
		_inherits(App, _React$Component);
	
		function App() {
			_classCallCheck(this, App);
	
			var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this));
	
			_this.state = _this._getLoginState();
			return _this;
		}
	
		_createClass(App, [{
			key: 'componentDidMount',
			value: function componentDidMount() {
				this.changeListener = this._onChange.bind(this);
				_LoginStore2.default.addChangeListener(this.changeListener);
			}
		}, {
			key: 'componentWillUnmount',
			value: function componentWillUnmount() {
				_LoginStore2.default.removeChangeListener(this.changeListener);
			}
		}, {
			key: '_onChange',
			value: function _onChange() {
				this.setState(this._getLoginState());
			}
		}, {
			key: '_getLoginState',
			value: function _getLoginState() {
				return {
					userLoggedIn: _LoginStore2.default.isLoggedIn(),
					user: _LoginStore2.default.username
				};
			}
		}, {
			key: 'render',
			value: function render() {
				return _react2.default.createElement(
					'div',
					null,
					_react2.default.createElement(
						_reactBootstrap.Navbar,
						null,
						_react2.default.createElement(
							_reactBootstrap.Navbar.Header,
							null,
							_react2.default.createElement(
								_reactBootstrap.Navbar.Brand,
								null,
								_react2.default.createElement(
									_reactRouter.Link,
									{ to: '/' },
									'Discord Guild Wars 2 Bot'
								)
							),
							_react2.default.createElement(_reactBootstrap.Navbar.Toggle, null)
						),
						_react2.default.createElement(
							_reactBootstrap.Navbar.Collapse,
							null,
							this.state.userLoggedIn && _react2.default.createElement(
								_reactBootstrap.Nav,
								null,
								_react2.default.createElement(
									_reactRouterBootstrap.LinkContainer,
									{ to: '/characters' },
									_react2.default.createElement(
										_reactBootstrap.NavItem,
										{ eventKey: 1 },
										'Characters'
									)
								)
							),
							_react2.default.createElement(
								_reactBootstrap.Nav,
								{ pullRight: true },
								this.state.userLoggedIn && _react2.default.createElement(
									_reactBootstrap.NavDropdown,
									{ eventKey: 1, title: this.state.user, id: 'user_dropdown' },
									_react2.default.createElement(
										_reactRouterBootstrap.LinkContainer,
										{ to: '/api_key' },
										_react2.default.createElement(
											_reactBootstrap.NavItem,
											{ eventKey: 1 },
											'API Key'
										)
									),
									_react2.default.createElement(
										_reactRouterBootstrap.LinkContainer,
										{ to: '/logout' },
										_react2.default.createElement(
											_reactBootstrap.NavItem,
											{ eventKey: 2 },
											'Logout'
										)
									)
								)
							)
						)
					),
					_react2.default.createElement(
						'div',
						{ className: 'container' },
						this.props.children
					)
				);
			}
		}]);
	
		return App;
	}(_react2.default.Component);
	
	exports.default = App;

/***/ },

/***/ 490:
/*!**************************************************!*\
  !*** ./features/web/client/stores/LoginStore.js ***!
  \**************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BaseStore2 = __webpack_require__(/*! ./BaseStore */ 491);
	
	var _BaseStore3 = _interopRequireDefault(_BaseStore2);
	
	var _jwtDecode = __webpack_require__(/*! jwt-decode */ 497);
	
	var _jwtDecode2 = _interopRequireDefault(_jwtDecode);
	
	var _WebSocket = __webpack_require__(/*! ../services/WebSocket */ 500);
	
	var _WebSocket2 = _interopRequireDefault(_WebSocket);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var LoginStore = function (_BaseStore) {
		_inherits(LoginStore, _BaseStore);
	
		function LoginStore() {
			_classCallCheck(this, LoginStore);
	
			var _this = _possibleConstructorReturn(this, (LoginStore.__proto__ || Object.getPrototypeOf(LoginStore)).call(this));
	
			_this.subscribe(function () {
				return _this._registerToActions.bind(_this);
			});
			_this._user = null;
			_this._jwt = null;
			_this._token = null;
			return _this;
		}
	
		_createClass(LoginStore, [{
			key: '_registerToActions',
			value: function _registerToActions(action) {
				switch (action.actionType) {
					case 'LOGIN':
						this._jwt = action.jwt;
						this._user = (0, _jwtDecode2.default)(this._jwt);
						this.emitChange();
						break;
					case 'LOGOUT':
						this._user = null;
						this.emitChange();
						break;
				};
			}
		}, {
			key: 'isLoggedIn',
			value: function isLoggedIn() {
				return !!this._user;
			}
		}, {
			key: 'sub',
			get: function get() {
				if (!this._user) return;
				return JSON.parse(this._user.sub);
			}
		}, {
			key: 'jwt',
			get: function get() {
				return this._jwt;
			}
		}, {
			key: 'username',
			get: function get() {
				if (!this._user) return '';
				return this.sub.username;
			}
		}, {
			key: 'discriminator',
			get: function get() {
				if (!this._user) return '';
				return this.sub.discriminator;
			}
		}, {
			key: 'id',
			get: function get() {
				if (!this._user) return '';
				return this.sub.id;
			}
		}]);
	
		return LoginStore;
	}(_BaseStore3.default);
	
	exports.default = new LoginStore();

/***/ },

/***/ 491:
/*!*************************************************!*\
  !*** ./features/web/client/stores/BaseStore.js ***!
  \*************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _events = __webpack_require__(/*! events */ 492);
	
	var _AppDispatcher = __webpack_require__(/*! ../dispatchers/AppDispatcher */ 493);
	
	var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var BaseStore = function (_EventEmitter) {
		_inherits(BaseStore, _EventEmitter);
	
		function BaseStore() {
			_classCallCheck(this, BaseStore);
	
			var _this = _possibleConstructorReturn(this, (BaseStore.__proto__ || Object.getPrototypeOf(BaseStore)).call(this));
	
			_this._listeners = 0;
			return _this;
		}
	
		_createClass(BaseStore, [{
			key: 'waitFor',
			value: function waitFor() {
				_AppDispatcher2.default.waitFor([this._dispatchToken]);
			}
		}, {
			key: 'subscribe',
			value: function subscribe(actionSubscribe) {
				this._dispatchToken = _AppDispatcher2.default.register(actionSubscribe());
			}
		}, {
			key: 'emitChange',
			value: function emitChange() {
				this.emit('CHANGE');
			}
		}, {
			key: 'addChangeListener',
			value: function addChangeListener(cb) {
				this._listeners++;
				this.on('CHANGE', cb);
			}
		}, {
			key: 'removeChangeListener',
			value: function removeChangeListener(cb) {
				this._listeners--;
				this.removeListener('CHANGE', cb);
			}
		}, {
			key: 'dispatchToken',
			get: function get() {
				return this._dispatchToken;
			}
		}]);
	
		return BaseStore;
	}(_events.EventEmitter);
	
	exports.default = BaseStore;

/***/ },

/***/ 492:
/*!****************************!*\
  !*** ./~/events/events.js ***!
  \****************************/
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;
	
	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;
	
	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;
	
	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;
	
	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};
	
	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;
	
	  if (!this._events)
	    this._events = {};
	
	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }
	
	  handler = this._events[type];
	
	  if (isUndefined(handler))
	    return false;
	
	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }
	
	  return true;
	};
	
	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;
	
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  if (!this._events)
	    this._events = {};
	
	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);
	
	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];
	
	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }
	
	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }
	
	  return this;
	};
	
	EventEmitter.prototype.on = EventEmitter.prototype.addListener;
	
	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  var fired = false;
	
	  function g() {
	    this.removeListener(type, g);
	
	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }
	
	  g.listener = listener;
	  this.on(type, g);
	
	  return this;
	};
	
	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;
	
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  if (!this._events || !this._events[type])
	    return this;
	
	  list = this._events[type];
	  length = list.length;
	  position = -1;
	
	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	
	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }
	
	    if (position < 0)
	      return this;
	
	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }
	
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }
	
	  return this;
	};
	
	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;
	
	  if (!this._events)
	    return this;
	
	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }
	
	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }
	
	  listeners = this._events[type];
	
	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];
	
	  return this;
	};
	
	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};
	
	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];
	
	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};
	
	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};
	
	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	
	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	
	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	
	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },

/***/ 493:
/*!**********************************************************!*\
  !*** ./features/web/client/dispatchers/AppDispatcher.js ***!
  \**********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _flux = __webpack_require__(/*! flux */ 494);
	
	exports.default = new _flux.Dispatcher();

/***/ },

/***/ 500:
/*!***************************************************!*\
  !*** ./features/web/client/services/WebSocket.js ***!
  \***************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _socket = __webpack_require__(/*! socket.io-client */ 501);
	
	var _socket2 = _interopRequireDefault(_socket);
	
	var _LoginStore = __webpack_require__(/*! ../stores/LoginStore */ 490);
	
	var _LoginStore2 = _interopRequireDefault(_LoginStore);
	
	var _LoginActions = __webpack_require__(/*! ../actions/LoginActions */ 551);
	
	var _LoginActions2 = _interopRequireDefault(_LoginActions);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var instance = null;
	
	var Socket = function () {
		function Socket() {
			_classCallCheck(this, Socket);
	
			if (instance) return instance;
			instance = this;
	
			this.socket = (0, _socket2.default)();
	
			return instance;
		}
	
		_createClass(Socket, [{
			key: 'on',
			value: function on(e, callback) {
				this.socket.on(e, callback);
			}
		}, {
			key: 'login',
			value: function login(data) {
				var _this = this;
	
				return new Promise(function (resolve, reject) {
					_this.socket.emit('Login', data, function (result) {
						if (result.error) return reject(result.error);
						_LoginActions2.default.loginUser(result.jwt);
						resolve(result);
					});
				});
			}
		}, {
			key: 'send',
			value: function send(cmd, data) {
				var _this2 = this;
	
				return new Promise(function (resolve, reject) {
					if (!_LoginStore2.default.isLoggedIn) return reject('Not logged in');
					_this2.socket.emit(cmd, { jwt: _LoginStore2.default.jwt, data: data }, function (result) {
						if (result.error === "Invalid token") return _LoginActions2.default.logoutUser();
						if (result.error) return reject(result.error);
						resolve(result.data);
					});
				});
			}
		}]);
	
		return Socket;
	}();
	
	exports.default = new Socket();

/***/ },

/***/ 551:
/*!*****************************************************!*\
  !*** ./features/web/client/actions/LoginActions.js ***!
  \*****************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _AppDispatcher = __webpack_require__(/*! ../dispatchers/AppDispatcher */ 493);
	
	var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);
	
	var _reactRouter = __webpack_require__(/*! react-router */ 172);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
		loginUser: function loginUser(jwt) {
			_AppDispatcher2.default.dispatch({
				actionType: 'LOGIN',
				jwt: jwt
			});
			localStorage.setItem('jwt', jwt);
		},
		logoutUser: function logoutUser() {
			localStorage.removeItem('jwt');
			_AppDispatcher2.default.dispatch({ actionType: 'LOGOUT' });
			_reactRouter.browserHistory.push('/get_login');
		}
	};

/***/ },

/***/ 552:
/*!************************************************!*\
  !*** ./features/web/client/components/Home.js ***!
  \************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(/*! react */ 1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _LoginStore = __webpack_require__(/*! ../stores/LoginStore */ 490);
	
	var _LoginStore2 = _interopRequireDefault(_LoginStore);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Username = function (_React$Component) {
		_inherits(Username, _React$Component);
	
		function Username() {
			_classCallCheck(this, Username);
	
			var _this = _possibleConstructorReturn(this, (Username.__proto__ || Object.getPrototypeOf(Username)).call(this));
	
			_this.state = _this._getLoginState();
			return _this;
		}
	
		_createClass(Username, [{
			key: '_getLoginState',
			value: function _getLoginState() {
				return {
					username: _LoginStore2.default.username
				};
			}
		}, {
			key: 'render',
			value: function render() {
				return _react2.default.createElement(
					'span',
					null,
					this.state.username
				);
			}
		}]);
	
		return Username;
	}(_react2.default.Component);
	
	var Home = function (_React$Component2) {
		_inherits(Home, _React$Component2);
	
		function Home() {
			_classCallCheck(this, Home);
	
			return _possibleConstructorReturn(this, (Home.__proto__ || Object.getPrototypeOf(Home)).apply(this, arguments));
		}
	
		_createClass(Home, [{
			key: 'render',
			value: function render() {
				return _react2.default.createElement(
					'p',
					null,
					'Hello ',
					_react2.default.createElement(Username, null)
				);
			}
		}]);
	
		return Home;
	}(_react2.default.Component);
	
	exports.default = Home;

/***/ },

/***/ 553:
/*!*************************************************!*\
  !*** ./features/web/client/components/Login.js ***!
  \*************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(/*! react */ 1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactBootstrap = __webpack_require__(/*! react-bootstrap */ 236);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Login = function (_React$Component) {
		_inherits(Login, _React$Component);
	
		function Login() {
			_classCallCheck(this, Login);
	
			return _possibleConstructorReturn(this, (Login.__proto__ || Object.getPrototypeOf(Login)).apply(this, arguments));
		}
	
		_createClass(Login, [{
			key: 'render',
			value: function render() {
				return _react2.default.createElement(
					'div',
					null,
					_react2.default.createElement(
						_reactBootstrap.Well,
						{ bsSize: 'large' },
						'The button below will send you to the discord site to enter your credentials.  You will then be redirected back to this site.'
					),
					_react2.default.createElement(
						_reactBootstrap.Button,
						{ bsStyle: 'primary', bsSize: 'large', block: true, href: '/login' },
						'Login'
					)
				);
			}
		}]);
	
		return Login;
	}(_react2.default.Component);
	
	exports.default = Login;

/***/ },

/***/ 554:
/*!************************************************!*\
  !*** ./features/web/client/components/Auth.js ***!
  \************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(/*! react */ 1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactRouter = __webpack_require__(/*! react-router */ 172);
	
	var _WebSocket = __webpack_require__(/*! ../services/WebSocket */ 500);
	
	var _WebSocket2 = _interopRequireDefault(_WebSocket);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Auth = function (_React$Component) {
		_inherits(Auth, _React$Component);
	
		function Auth() {
			_classCallCheck(this, Auth);
	
			return _possibleConstructorReturn(this, (Auth.__proto__ || Object.getPrototypeOf(Auth)).apply(this, arguments));
		}
	
		_createClass(Auth, [{
			key: 'componentDidMount',
			value: function componentDidMount() {
				var _this2 = this;
	
				_WebSocket2.default.login(window.location.href).then(function () {
					_reactRouter.browserHistory.push('/');
				}).catch(function (err) {
					return _this2.setState({ error: err });
				});
			}
		}, {
			key: 'render',
			value: function render() {
				return _react2.default.createElement(
					'div',
					null,
					'Authorizing ...'
				);
			}
		}]);
	
		return Auth;
	}(_react2.default.Component);
	
	exports.default = Auth;

/***/ },

/***/ 555:
/*!**************************************************!*\
  !*** ./features/web/client/components/ApiKey.js ***!
  \**************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(/*! react */ 1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactBootstrap = __webpack_require__(/*! react-bootstrap */ 236);
	
	var _superagent = __webpack_require__(/*! superagent */ 556);
	
	var _superagent2 = _interopRequireDefault(_superagent);
	
	var _WebSocket = __webpack_require__(/*! ../services/WebSocket */ 500);
	
	var _WebSocket2 = _interopRequireDefault(_WebSocket);
	
	var _TokenStore = __webpack_require__(/*! ../stores/TokenStore */ 561);
	
	var _TokenStore2 = _interopRequireDefault(_TokenStore);
	
	var _TokenActions = __webpack_require__(/*! ../actions/TokenActions */ 562);
	
	var _TokenActions2 = _interopRequireDefault(_TokenActions);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var ShowKey = function (_React$Component) {
		_inherits(ShowKey, _React$Component);
	
		function ShowKey() {
			_classCallCheck(this, ShowKey);
	
			return _possibleConstructorReturn(this, (ShowKey.__proto__ || Object.getPrototypeOf(ShowKey)).apply(this, arguments));
		}
	
		_createClass(ShowKey, [{
			key: 'render',
			value: function render() {
				return _react2.default.createElement(
					'div',
					null,
					_react2.default.createElement(
						'p',
						null,
						_react2.default.createElement(
							'b',
							null,
							this.props.name
						)
					),
					this.props.permissions && this.props.permissions.map(function (p) {
						return _react2.default.createElement(
							'span',
							{ key: p },
							p,
							' '
						);
					})
				);
			}
		}]);
	
		return ShowKey;
	}(_react2.default.Component);
	
	var NewKey = function (_React$Component2) {
		_inherits(NewKey, _React$Component2);
	
		function NewKey(props) {
			_classCallCheck(this, NewKey);
	
			var _this2 = _possibleConstructorReturn(this, (NewKey.__proto__ || Object.getPrototypeOf(NewKey)).call(this, props));
	
			_this2.handleChange = _this2.handleChange.bind(_this2);
			_this2.saveKey = _this2.saveKey.bind(_this2);
	
			_this2.state = { key: '', new_token: {} };
			return _this2;
		}
	
		_createClass(NewKey, [{
			key: 'componentWillMount',
			value: function componentWillMount() {
				var code = Math.random().toString(36).toUpperCase().substr(2, 5);
				this.setState({ code: code });
			}
		}, {
			key: 'getValidationState',
			value: function getValidationState() {
				var k = this.state.key;
				if (!k) return;
				if (!k.match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{20}-\w{4}-\w{4}-\w{4}-\w{12}$/)) {
					return 'warning';
				}
				if (this.state.error) {
					return 'error';
				}
				return 'success';
			}
		}, {
			key: 'handleChange',
			value: function handleChange(e) {
				var _this3 = this;
	
				var k = e.target.value;
				this.setState({ key: k, error: null, new_token: {} });
				if (!k.match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{20}-\w{4}-\w{4}-\w{4}-\w{12}$/)) {
					return;
				}
				_superagent2.default.get('https://api.guildwars2.com/v2/tokeninfo?access_token=' + k).accept('json').end(function (err, res) {
					if (err && !res) {
						_this3.setState({ error: err.message });
						console.log(err);
						return;
					}
					var token = JSON.parse(res.text);
					var newState = { new_token: token };
					newState.new_token = token;
					if (token.text) newState.error = token.text;
					if (token.name && !token.name.match(_this3.state.code)) newState.error = 'code is not in key name';
					_this3.setState(newState);
				});
			}
		}, {
			key: 'saveKey',
			value: function saveKey() {
				var _this4 = this;
	
				_WebSocket2.default.send('set key', this.state.key).then(function (res) {
					_this4.props.onChange();
				}).catch(function (err) {
					alert('Error saving key');
				});
			}
		}, {
			key: 'render',
			value: function render() {
				return _react2.default.createElement(
					'div',
					null,
					_react2.default.createElement(
						_reactBootstrap.Panel,
						{ header: 'New Key' },
						_react2.default.createElement(
							'p',
							null,
							'Please provide a key from ',
							_react2.default.createElement(
								'a',
								{ href: 'https://account.arena.net/applications', target: '_new' },
								'https://account.arena.net/applications'
							),
							' - include the code ',
							_react2.default.createElement(
								'b',
								null,
								this.state.code
							),
							' in the key name field.'
						),
						_react2.default.createElement(
							'form',
							null,
							_react2.default.createElement(
								_reactBootstrap.FormGroup,
								{ controlId: 'formApiKey', validationState: this.getValidationState() },
								_react2.default.createElement(
									_reactBootstrap.ControlLabel,
									null,
									'API Key'
								),
								_react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', value: this.state.key, placeholder: 'API Key', onChange: this.handleChange }),
								_react2.default.createElement(_reactBootstrap.FormControl.Feedback, null),
								_react2.default.createElement(
									_reactBootstrap.HelpBlock,
									null,
									this.state.error
								)
							)
						),
						_react2.default.createElement(ShowKey, { name: this.state.new_token.name, permissions: this.state.new_token.permissions })
					),
					_react2.default.createElement(
						_reactBootstrap.Button,
						{ bsStyle: 'primary', disabled: this.getValidationState() === 'success' ? false : true, onClick: this.saveKey },
						'Save Key'
					)
				);
			}
		}]);
	
		return NewKey;
	}(_react2.default.Component);
	
	var ApiKey = function (_React$Component3) {
		_inherits(ApiKey, _React$Component3);
	
		function ApiKey() {
			_classCallCheck(this, ApiKey);
	
			var _this5 = _possibleConstructorReturn(this, (ApiKey.__proto__ || Object.getPrototypeOf(ApiKey)).call(this));
	
			_this5.keyChanged = _this5.keyChanged.bind(_this5);
			_this5.state = Object.assign(_this5._getTokenState(), {
				addingKey: false
			});
			return _this5;
		}
	
		_createClass(ApiKey, [{
			key: '_getTokenState',
			value: function _getTokenState() {
				return _TokenStore2.default.token || {};
			}
		}, {
			key: 'componentDidMount',
			value: function componentDidMount() {
				this.changeListener = this._onChange.bind(this);
				_TokenStore2.default.addChangeListener(this.changeListener);
			}
		}, {
			key: 'componentWillUnmount',
			value: function componentWillUnmount() {
				_TokenStore2.default.removeChangeListener(this.changeListener);
			}
		}, {
			key: '_onChange',
			value: function _onChange() {
				this.setState(this._getTokenState());
			}
		}, {
			key: 'keyChanged',
			value: function keyChanged() {
				this.setState({ addingKey: false });
			}
		}, {
			key: 'render',
			value: function render() {
				var _this6 = this;
	
				return _react2.default.createElement(
					'div',
					null,
					_react2.default.createElement(
						_reactBootstrap.Panel,
						{ header: 'Current Key' },
						_react2.default.createElement(ShowKey, { name: this.state.name, permissions: this.state.permissions })
					),
					this.state.addingKey ? _react2.default.createElement(NewKey, { onChange: this.keyChanged }) : _react2.default.createElement(
						_reactBootstrap.Button,
						{ bsStyle: 'primary', onClick: function onClick() {
								_this6.setState({ addingKey: true });
							} },
						'Change Key'
					)
				);
			}
		}]);
	
		return ApiKey;
	}(_react2.default.Component);
	
	exports.default = ApiKey;

/***/ },

/***/ 561:
/*!**************************************************!*\
  !*** ./features/web/client/stores/TokenStore.js ***!
  \**************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BaseStore2 = __webpack_require__(/*! ./BaseStore */ 491);
	
	var _BaseStore3 = _interopRequireDefault(_BaseStore2);
	
	var _WebSocket = __webpack_require__(/*! ../services/WebSocket */ 500);
	
	var _WebSocket2 = _interopRequireDefault(_WebSocket);
	
	var _TokenActions = __webpack_require__(/*! ../actions/TokenActions */ 562);
	
	var _TokenActions2 = _interopRequireDefault(_TokenActions);
	
	var _LoginStore = __webpack_require__(/*! ./LoginStore */ 490);
	
	var _LoginStore2 = _interopRequireDefault(_LoginStore);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var TokenStore = function (_BaseStore) {
		_inherits(TokenStore, _BaseStore);
	
		function TokenStore() {
			_classCallCheck(this, TokenStore);
	
			var _this = _possibleConstructorReturn(this, (TokenStore.__proto__ || Object.getPrototypeOf(TokenStore)).call(this));
	
			_this.subscribe(function () {
				return _this._registerToActions.bind(_this);
			});
	
			_WebSocket2.default.on('new token', _TokenActions2.default.receiveToken);
	
			_this._token = null;
			return _this;
		}
	
		_createClass(TokenStore, [{
			key: '_registerToActions',
			value: function _registerToActions(action) {
				switch (action.actionType) {
					case 'TOKEN':
						this._token = action.token;
						this.emitChange();
						break;
					case 'LOGIN':
						_LoginStore2.default.waitFor();
						_WebSocket2.default.send('get token').then(_TokenActions2.default.receiveToken);
						break;
					case 'LOGOUT':
						this._token = null;
						this.emitChange();
						break;
				}
			}
		}, {
			key: 'checkGw2Scope',
			value: function checkGw2Scope(scope) {
				if (!this._token) return false;
				return this._token.permissions.indexOf(scope) > -1;
			}
		}, {
			key: 'token',
			get: function get() {
				return this._token;
			}
		}]);
	
		return TokenStore;
	}(_BaseStore3.default);
	
	exports.default = new TokenStore();

/***/ },

/***/ 562:
/*!*****************************************************!*\
  !*** ./features/web/client/actions/TokenActions.js ***!
  \*****************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _AppDispatcher = __webpack_require__(/*! ../dispatchers/AppDispatcher */ 493);
	
	var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
		receiveToken: function receiveToken(token) {
			return _AppDispatcher2.default.dispatch({ actionType: 'TOKEN', token: token });
		}
	};

/***/ },

/***/ 563:
/*!******************************************************!*\
  !*** ./features/web/client/components/Characters.js ***!
  \******************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(/*! react */ 1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactBootstrap = __webpack_require__(/*! react-bootstrap */ 236);
	
	var _reactRouter = __webpack_require__(/*! react-router */ 172);
	
	var _WebSocket = __webpack_require__(/*! ../services/WebSocket */ 500);
	
	var _WebSocket2 = _interopRequireDefault(_WebSocket);
	
	var _TokenStore = __webpack_require__(/*! ../stores/TokenStore */ 561);
	
	var _TokenStore2 = _interopRequireDefault(_TokenStore);
	
	var _PrivacyStore = __webpack_require__(/*! ../stores/PrivacyStore */ 564);
	
	var _PrivacyStore2 = _interopRequireDefault(_PrivacyStore);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Characters = function (_React$Component) {
		_inherits(Characters, _React$Component);
	
		function Characters(props) {
			_classCallCheck(this, Characters);
	
			var _this = _possibleConstructorReturn(this, (Characters.__proto__ || Object.getPrototypeOf(Characters)).call(this, props));
	
			_this._getCharacters = _this._getCharacters.bind(_this);
	
			_this.state = {
				token: _this._getTokenState(),
				characters: [],
				characterList: [],
				selectedPrivacy: 0
			};
			return _this;
		}
	
		_createClass(Characters, [{
			key: '_getTokenState',
			value: function _getTokenState() {
				return _TokenStore2.default.token || {};
			}
		}, {
			key: 'componentDidMount',
			value: function componentDidMount() {
				this.changeListener = this._onTokenChange.bind(this);
				this.privChangeListener = this._onPrivacyChange.bind(this);
				_TokenStore2.default.addChangeListener(this.changeListener);
				_PrivacyStore2.default.addChangeListener(this.privChangeListener);
				this._getCharacters();
			}
		}, {
			key: 'componentWillUnmount',
			value: function componentWillUnmount() {
				_TokenStore2.default.removeChangeListener(this.changeListener);
				_PrivacyStore2.default.removeChangeListener(this.privChangeListener);
			}
		}, {
			key: '_onTokenChange',
			value: function _onTokenChange() {
				this.setState({ token: this._getTokenState() });
				this._getCharacters();
			}
		}, {
			key: '_onPrivacyChange',
			value: function _onPrivacyChange() {
				this.setState({ characterList: this._characterList(this.state.characters) });
			}
		}, {
			key: '_getCharacters',
			value: function _getCharacters() {
				var _this2 = this;
	
				if (this.state.token.permissions && this.state.token.permissions.indexOf('characters') === -1) return this.setState({ characters: [], characterList: [] });
				_WebSocket2.default.send('get characters').then(function (characters) {
					return _this2.setState({ characters: characters, characterList: _this2._characterList(characters) });
				}).catch(function (err) {
					console.log(err);
				});
			}
		}, {
			key: '_characterList',
			value: function _characterList(characters) {
				if (!characters) return [];
				var privacyDetails = { 1: 'Private', 2: 'Guild Only', 4: 'Public' };
				return characters.map(function (c) {
					return {
						name: c,
						privacy: privacyDetails[_PrivacyStore2.default.getPrivacy(c)]
					};
				});
			}
		}, {
			key: '_setPrivacy',
			value: function _setPrivacy(details) {
				var data = {};
				data[details.name] = details.privacy;
				_WebSocket2.default.send('set privacy', data);
			}
		}, {
			key: 'render',
			value: function render() {
				var _this3 = this;
	
				return _react2.default.createElement(
					'div',
					null,
					this.state.token.permissions && this.state.token.permissions.indexOf('characters') === -1 && _react2.default.createElement(
						_reactBootstrap.Alert,
						{ bsStyle: 'danger' },
						'You do not have the ',
						_react2.default.createElement(
							'b',
							null,
							'characters'
						),
						' permission on your API key.'
					),
					_react2.default.createElement(
						_reactBootstrap.Table,
						{ striped: true, bordered: true, condensed: true, hover: true },
						_react2.default.createElement(
							'thead',
							null,
							_react2.default.createElement(
								'tr',
								null,
								_react2.default.createElement(
									'th',
									null,
									'Name'
								),
								_react2.default.createElement(
									'th',
									null,
									'Privacy'
								)
							)
						),
						_react2.default.createElement(
							'tbody',
							null,
							this.state.characterList.map(function (c, i) {
								return _react2.default.createElement(
									'tr',
									{ key: i },
									_react2.default.createElement(
										'td',
										null,
										_react2.default.createElement(
											_reactRouter.Link,
											{ to: "/characters/" + c.name },
											c.name
										)
									),
									_react2.default.createElement(
										'td',
										null,
										_react2.default.createElement(
											_reactBootstrap.DropdownButton,
											{ bsStyle: 'link', bsSize: 'xsmall', title: c.privacy, id: "dropdown-privacy-" + i, onSelect: _this3._setPrivacy },
											_react2.default.createElement(
												_reactBootstrap.MenuItem,
												{ eventKey: { name: c.name, privacy: 1 } },
												'Private'
											),
											_react2.default.createElement(
												_reactBootstrap.MenuItem,
												{ eventKey: { name: c.name, privacy: 2 } },
												'Guild Only'
											),
											_react2.default.createElement(
												_reactBootstrap.MenuItem,
												{ eventKey: { name: c.name, privacy: 4 } },
												'Public'
											)
										)
									)
								);
							})
						)
					)
				);
			}
		}]);
	
		return Characters;
	}(_react2.default.Component);
	
	exports.default = Characters;

/***/ },

/***/ 564:
/*!****************************************************!*\
  !*** ./features/web/client/stores/PrivacyStore.js ***!
  \****************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BaseStore2 = __webpack_require__(/*! ./BaseStore */ 491);
	
	var _BaseStore3 = _interopRequireDefault(_BaseStore2);
	
	var _WebSocket = __webpack_require__(/*! ../services/WebSocket */ 500);
	
	var _WebSocket2 = _interopRequireDefault(_WebSocket);
	
	var _LoginStore = __webpack_require__(/*! ./LoginStore */ 490);
	
	var _LoginStore2 = _interopRequireDefault(_LoginStore);
	
	var _PrivacyActions = __webpack_require__(/*! ../actions/PrivacyActions */ 565);
	
	var _PrivacyActions2 = _interopRequireDefault(_PrivacyActions);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var PrivacyStore = function (_BaseStore) {
		_inherits(PrivacyStore, _BaseStore);
	
		function PrivacyStore() {
			_classCallCheck(this, PrivacyStore);
	
			var _this = _possibleConstructorReturn(this, (PrivacyStore.__proto__ || Object.getPrototypeOf(PrivacyStore)).call(this));
	
			_this.subscribe(function () {
				return _this._registerToActions.bind(_this);
			});
	
			_WebSocket2.default.on('new privacy', _PrivacyActions2.default.receive);
	
			_this._privacy = {};
			return _this;
		}
	
		_createClass(PrivacyStore, [{
			key: '_registerToActions',
			value: function _registerToActions(action) {
				switch (action.actionType) {
					case 'PRIVACY':
						this._privacy = action.privacy;
						this.emitChange();
						break;
					case 'LOGIN':
						_LoginStore2.default.waitFor();
						_WebSocket2.default.send('get privacy').then(_PrivacyActions2.default.receive).catch(function (err) {
							return console.log(err);
						});
						break;
					case 'LOGOUT':
						this._privacy = {};
						this.emitChange();
						break;
				}
			}
		}, {
			key: 'getPrivacy',
			value: function getPrivacy(character) {
				return this._privacy[character] || 1;
			}
		}]);
	
		return PrivacyStore;
	}(_BaseStore3.default);
	
	exports.default = new PrivacyStore();

/***/ },

/***/ 565:
/*!*******************************************************!*\
  !*** ./features/web/client/actions/PrivacyActions.js ***!
  \*******************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _AppDispatcher = __webpack_require__(/*! ../dispatchers/AppDispatcher */ 493);
	
	var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
		receive: function receive(privacy) {
			return _AppDispatcher2.default.dispatch({ actionType: 'PRIVACY', privacy: privacy });
		}
	};

/***/ },

/***/ 566:
/*!*****************************************************!*\
  !*** ./features/web/client/components/Character.js ***!
  \*****************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(/*! react */ 1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactBootstrap = __webpack_require__(/*! react-bootstrap */ 236);
	
	var _reactRouter = __webpack_require__(/*! react-router */ 172);
	
	var _PostToChannel = __webpack_require__(/*! ./partials/PostToChannel */ 567);
	
	var _PostToChannel2 = _interopRequireDefault(_PostToChannel);
	
	var _WebSocket = __webpack_require__(/*! ../services/WebSocket */ 500);
	
	var _WebSocket2 = _interopRequireDefault(_WebSocket);
	
	var _TokenStore = __webpack_require__(/*! ../stores/TokenStore */ 561);
	
	var _TokenStore2 = _interopRequireDefault(_TokenStore);
	
	var _PrivacyStore = __webpack_require__(/*! ../stores/PrivacyStore */ 564);
	
	var _PrivacyStore2 = _interopRequireDefault(_PrivacyStore);
	
	var _ItemStore = __webpack_require__(/*! ../stores/ItemStore */ 572);
	
	var _ItemStore2 = _interopRequireDefault(_ItemStore);
	
	var _StatsStore = __webpack_require__(/*! ../stores/StatsStore */ 575);
	
	var _StatsStore2 = _interopRequireDefault(_StatsStore);
	
	var _SkinsStore = __webpack_require__(/*! ../stores/SkinsStore */ 577);
	
	var _SkinsStore2 = _interopRequireDefault(_SkinsStore);
	
	var _SpecializationStore = __webpack_require__(/*! ../stores/SpecializationStore */ 579);
	
	var _SpecializationStore2 = _interopRequireDefault(_SpecializationStore);
	
	var _TraitStore = __webpack_require__(/*! ../stores/TraitStore */ 581);
	
	var _TraitStore2 = _interopRequireDefault(_TraitStore);
	
	var _ProfessionStore = __webpack_require__(/*! ../stores/ProfessionStore */ 583);
	
	var _ProfessionStore2 = _interopRequireDefault(_ProfessionStore);
	
	var _SkillStore = __webpack_require__(/*! ../stores/SkillStore */ 585);
	
	var _SkillStore2 = _interopRequireDefault(_SkillStore);
	
	var _LegendStore = __webpack_require__(/*! ../stores/LegendStore */ 587);
	
	var _LegendStore2 = _interopRequireDefault(_LegendStore);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Item = function (_React$Component) {
		_inherits(Item, _React$Component);
	
		function Item(props) {
			_classCallCheck(this, Item);
	
			var _this = _possibleConstructorReturn(this, (Item.__proto__ || Object.getPrototypeOf(Item)).call(this, props));
	
			_this.doUpdate = _this.doUpdate.bind(_this);
			_this.doStatsUpdate = _this.doStatsUpdate.bind(_this);
			_this.doSkinUpdate = _this.doSkinUpdate.bind(_this);
	
			var item = _this._getItem(props);
			_this.state = {
				item_details: item,
				stat_details: _this._getStats(props, item),
				skin_details: _this._getSkin(props),
				upgrades: _this._getUpgrades(props)
			};
			return _this;
		}
	
		_createClass(Item, [{
			key: 'doUpdate',
			value: function doUpdate() {
				var item = this._getItem(this.props);
				this.setState({
					item_details: item,
					stat_details: this._getStats(this.props, item),
					upgrades: this._getUpgrades(this.props)
				});
			}
		}, {
			key: 'doStatsUpdate',
			value: function doStatsUpdate() {
				this.setState({ stat_details: this._getStats(this.props, this.state.item_details) });
			}
		}, {
			key: 'doSkinUpdate',
			value: function doSkinUpdate() {
				if (this.state.skin_details.id) return;
				this.setState({ skin_details: this._getSkin(this.props) });
			}
		}, {
			key: 'componentWillReceiveProps',
			value: function componentWillReceiveProps(newProps) {
				var newState = {};
				var item = this._getItem(newProps);
				if (newProps.data.id !== this.props.data.id) newState.item_details = item;
				if (newProps.data.skin !== this.props.data.skin) newState.skin_details = this._getSkin(newProps);
				newState.stat_details = this._getStats(newProps, item);
				newState.upgrades = this._getUpgrades(newProps);
				this.setState(newState);
			}
		}, {
			key: '_getItem',
			value: function _getItem(props) {
				return _ItemStore2.default.getItem(props.data.id) || {};
			}
		}, {
			key: '_getUpgrades',
			value: function _getUpgrades(props) {
				if (!props.data.upgrades) return [];
				return props.data.upgrades.map(function (u) {
					return _ItemStore2.default.getItem(u) || {};
				});
			}
		}, {
			key: '_getStats',
			value: function _getStats(props, item) {
				if (props.data.stats) return _StatsStore2.default.getStats(props.data.stats.id) || {};
				if (!item.details) return {};
				if (item.details.infix_upgrade) return _StatsStore2.default.getStats(item.details.infix_upgrade.id) || {};
				return { name: "not selected" };
			}
		}, {
			key: '_getSkin',
			value: function _getSkin(props) {
				if (!props.data.skin) return {};
				return _SkinsStore2.default.getSkin(props.data.skin) || {};
			}
		}, {
			key: 'render',
			value: function render() {
				var item = this.state.item_details;
				var stats = this.state.stat_details;
				var skin = this.state.skin_details;
				var icon = this.props.data.skin ? skin.icon : item.icon;
				var name = this.props.data.skin ? skin.name : item.name;
				var details = _react2.default.createElement(
					_reactBootstrap.Popover,
					{ id: 'item-details', title: name },
					'Level ',
					item.level,
					' ',
					item.rarity,
					' ',
					stats.name,
					' ',
					item.details && item.details.type ? item.details.type : item.type,
					this.state.upgrades.length > 0 && _react2.default.createElement(
						'div',
						null,
						_react2.default.createElement('hr', null),
						this.state.upgrades.map(function (u, i) {
							return _react2.default.createElement(
								'div',
								{ key: i },
								u.name
							);
						})
					)
				);
				return _react2.default.createElement(
					'div',
					null,
					_react2.default.createElement(
						_reactBootstrap.OverlayTrigger,
						{ trigger: ['hover', 'focus', 'click'], rootClose: true, placement: 'right', overlay: details },
						_react2.default.createElement('img', { className: item.rarity + ' item', src: icon })
					),
					' ',
					stats.name
				);
			}
		}]);
	
		return Item;
	}(_react2.default.Component);
	
	var Traits = function (_React$Component2) {
		_inherits(Traits, _React$Component2);
	
		function Traits(props) {
			_classCallCheck(this, Traits);
	
			var _this2 = _possibleConstructorReturn(this, (Traits.__proto__ || Object.getPrototypeOf(Traits)).call(this, props));
	
			_this2.state = {
				specializations: _this2._getSpecs(props.character, props.type),
				traits: _this2._getTraits(props.character, props.type)
			};
			return _this2;
		}
	
		_createClass(Traits, [{
			key: 'componentWillReceiveProps',
			value: function componentWillReceiveProps(newProps) {
				if (newProps.character.name === this.props.character.name && newProps.type === this.props.type) return; // no changes
				this.setState({
					specializations: this._getSpecs(newProps.character, newProps.type),
					traits: this._getTraits(newProps.character, newProps.type)
				});
			}
		}, {
			key: 'componentDidMount',
			value: function componentDidMount() {
				this._specsChangeListener = this._specChanges.bind(this);
				this._traitChangeListener = this._traitChanges.bind(this);
				_SpecializationStore2.default.addChangeListener(this._specsChangeListener);
				_TraitStore2.default.addChangeListener(this._traitChangeListener);
			}
		}, {
			key: 'componentWillUnmount',
			value: function componentWillUnmount() {
				_SpecializationStore2.default.removeChangeListener(this._specsChangeListener);
				_TraitStore2.default.removeChangeListener(this._traitChangeListener);
			}
		}, {
			key: '_specChanges',
			value: function _specChanges() {
				this.setState({ specializations: this._getSpecs(this.props.character, this.props.type) });
			}
		}, {
			key: '_traitChanges',
			value: function _traitChanges() {
				this.setState({ traits: this._getTraits(this.props.character, this.props.type) });
			}
		}, {
			key: '_getSpecs',
			value: function _getSpecs(character, type) {
				if (!character.specializations) return [];
				var spec_ids = character.specializations[type].filter(function (s) {
					return !!s;
				}).map(function (s) {
					return s.id;
				});
				_SpecializationStore2.default.retrieve(spec_ids);
				return spec_ids.map(function (s) {
					return _SpecializationStore2.default.get(s) || {};
				});
			}
		}, {
			key: '_getTraits',
			value: function _getTraits(character, type) {
				if (!character.specializations) return [];
				var trait_ids = character.specializations[type].filter(function (s) {
					return !!s;
				}).reduce(function (t, a) {
					return t.concat(a.traits.filter(function (i) {
						return !!i;
					}));
				}, []);
				_TraitStore2.default.retrieve(trait_ids);
				return trait_ids.map(function (t) {
					return _TraitStore2.default.get(t) || {};
				});
			}
		}, {
			key: 'render',
			value: function render() {
				var _this3 = this;
	
				if (!this.props.character.specializations) return _react2.default.createElement('div', null);
				var specs = this.props.character.specializations[this.props.type];
				return _react2.default.createElement(
					'div',
					null,
					specs.filter(function (s) {
						return !!s;
					}).map(function (l, i) {
						var s = _this3.state.specializations.find(function (s) {
							return l.id === s.id;
						}) || {};
						return _react2.default.createElement(
							'div',
							{ className: 'spec_line', key: i },
							_react2.default.createElement('img', { className: 'background', src: s.background }),
							_react2.default.createElement(
								'div',
								{ className: 'spec_title' },
								s.name
							),
							l.traits.map(function (tr, ti) {
								var t = _this3.state.traits.find(function (t) {
									return tr === t.id;
								}) || {};
								var left = 150 + 160 * ti + 'px';
								return _react2.default.createElement(
									'div',
									{ className: 'trait', style: { left: left }, key: ti },
									_react2.default.createElement(
										_reactBootstrap.OverlayTrigger,
										{ trigger: ['hover', 'focus', 'click'], rootClose: true, placement: 'top', overlay: _react2.default.createElement(
												_reactBootstrap.Popover,
												{ id: 'trait-detail', title: t.name },
												t.description
											) },
										_react2.default.createElement('img', { src: t.icon })
									),
									_react2.default.createElement('br', null),
									t.name
								);
							})
						);
					}),
					_react2.default.createElement(_PostToChannel2.default, null)
				);
			}
		}]);
	
		return Traits;
	}(_react2.default.Component);
	
	var Privacy = function (_React$Component3) {
		_inherits(Privacy, _React$Component3);
	
		function Privacy(props) {
			_classCallCheck(this, Privacy);
	
			var _this4 = _possibleConstructorReturn(this, (Privacy.__proto__ || Object.getPrototypeOf(Privacy)).call(this, props));
	
			_this4._privacyChange = _this4._privacyChange.bind(_this4);
	
			_this4.state = {
				privacy: _PrivacyStore2.default.getPrivacy(props.character.name)
			};
			return _this4;
		}
	
		_createClass(Privacy, [{
			key: 'componentWillReceiveProps',
			value: function componentWillReceiveProps(newProps) {
				if (newProps.character.name !== this.props.character.name) this.setState({ privacy: _PrivacyStore2.default.getPrivacy(newProps.character.name) });
			}
		}, {
			key: 'componentDidMount',
			value: function componentDidMount() {
				this._privacyChangeListener = this._onPrivacyChange.bind(this);
				_PrivacyStore2.default.addChangeListener(this._privacyChangeListener);
			}
		}, {
			key: 'componentWillUnmount',
			value: function componentWillUnmount() {
				_PrivacyStore2.default.removeChangeListener(this._privacyChangeListener);
			}
		}, {
			key: '_onPrivacyChange',
			value: function _onPrivacyChange() {
				this.setState({ privacy: _PrivacyStore2.default.getPrivacy(this.props.character.name) });
			}
		}, {
			key: '_privacyChange',
			value: function _privacyChange(e) {
				var privacy = parseInt(e.target.value);
				var data = {};
				data[this.props.character.name] = privacy;
				_WebSocket2.default.send('set privacy', data);
			}
		}, {
			key: 'render',
			value: function render() {
				return _react2.default.createElement(
					'form',
					null,
					_react2.default.createElement(
						'label',
						{ htmlFor: 'privacy_1' },
						_react2.default.createElement('input', { type: 'radio', value: '1', checked: this.state.privacy === 1, onChange: this._privacyChange, id: 'privacy_1' }),
						' ',
						'Private.  Nobody can request to inspect your build but yourself.'
					),
					_react2.default.createElement('br', null),
					_react2.default.createElement(
						'label',
						{ htmlFor: 'privacy_2' },
						_react2.default.createElement('input', { type: 'radio', value: '2', checked: this.state.privacy === 2, onChange: this._privacyChange, id: 'privacy_2' }),
						' ',
						'Guild members only.  You and any member of any of your guilds can inspect your builds.'
					),
					_react2.default.createElement('br', null),
					_react2.default.createElement(
						'label',
						{ htmlFor: 'privacy_4' },
						_react2.default.createElement('input', { type: 'radio', value: '4', checked: this.state.privacy === 4, onChange: this._privacyChange, id: 'privacy_4' }),
						' ',
						'Public. Everybody can inspect your builds.'
					)
				);
			}
		}]);
	
		return Privacy;
	}(_react2.default.Component);
	
	var Skills = function (_React$Component4) {
		_inherits(Skills, _React$Component4);
	
		function Skills(props) {
			_classCallCheck(this, Skills);
	
			var _this5 = _possibleConstructorReturn(this, (Skills.__proto__ || Object.getPrototypeOf(Skills)).call(this, props));
	
			_this5._getWeaponSkills(props.character, props.profession);
			_this5._getSkills(props.character.skills[props.type]);
			_this5.state = { skills: [] };
			return _this5;
		}
	
		_createClass(Skills, [{
			key: 'componentWillReceiveProps',
			value: function componentWillReceiveProps(newProps) {
				var newCharacter = newProps.character.name !== this.props.character.name;
				var newProfession = newProps.profession.name !== this.props.profession.name;
				var newType = newProps.type !== this.props.type;
				if (!newCharacter && !newProfession && !newType) return; // nothing changed
				if (newCharacter || newType) this._getSkills(newProps.character.skills[newProps.type]);
				if (newCharacter || newProfession) this._getWeaponSkills(newProps.character, newProps.profession);
				this.setState({ skills: this._createSkillArray(newProps.character, newProps.profession, newProps.type) });
			}
		}, {
			key: 'componentDidMount',
			value: function componentDidMount() {
				this._itemChangeListener = this._itemChanges.bind(this);
				this._skillChangeListener = this._skillChanges.bind(this);
				this._legendChangeListener = this._legendChanges.bind(this);
				_ItemStore2.default.addChangeListener(this._itemChangeListener);
				_SkillStore2.default.addChangeListener(this._skillChangeListener);
				_LegendStore2.default.addChangeListener(this._legendChangeListener);
			}
		}, {
			key: 'componentWillUnmount',
			value: function componentWillUnmount() {
				_ItemStore2.default.removeChangeListener(this._itemChangeListener);
				_SkillStore2.default.removeChangeListener(this._skillChangeListener);
				_LegendStore2.default.removeChangeListener(this._legendChangeListener);
			}
		}, {
			key: '_itemChanges',
			value: function _itemChanges() {
				this._getWeaponSkills(this.props.character, this.props.profession);
				this.setState({ skills: this._createSkillArray(this.props.character, this.props.profession, this.props.type) });
			}
		}, {
			key: '_skillChanges',
			value: function _skillChanges() {
				this.setState({ skills: this._createSkillArray(this.props.character, this.props.profession, this.props.type) });
			}
		}, {
			key: '_legendChanges',
			value: function _legendChanges() {
				this.setState({ skills: this._createSkillArray(this.props.character, this.props.profession, this.props.type) });
			}
		}, {
			key: '_getSkills',
			value: function _getSkills(skills) {
				if (skills.legends) {
					_LegendStore2.default.retrieve(skills.legends);
				} else {
					var skill_ids = [skills.heal, skills.elite].concat(skills.utilities);
					_SkillStore2.default.retrieve(skill_ids);
				}
				return;
			}
		}, {
			key: '_getWeaponSkills',
			value: function _getWeaponSkills(character, profession) {
				if (!profession.name) return [];
				if (!character.name) return [];
				var equipment = character.equipment;
				var weapon_skills = ['WeaponA1', 'WeaponA2', 'WeaponB1', 'WeaponB2'] // Names of the weapon slots
				.filter(function (w) {
					return equipment.find(function (e) {
						return e.slot === w;
					});
				}) // Filter out any not in equipment
				.map(function (w) {
					return equipment.find(function (e) {
						return e.slot === w;
					}).id;
				}) // Get the id of the weapon equiped
				.map(function (w) {
					return _ItemStore2.default.getItem(w) || {};
				}) // Get the item details from the store
				.filter(function (w) {
					return w.details;
				}) // Filter out anything not in the store (yet!)
				.map(function (w) {
					return w.details.type;
				}) // Get the weapon type
				.map(function (w) {
					return w[0] + w.slice(1).toLowerCase();
				}) // Fix case (e.g. LongBow -> Longbow)
				.reduce(function (t, w) {
					return t.concat(profession.weapons[w].skills.map(function (s) {
						return s.id;
					}));
				}, []) // Get the skill ids for the weapon
				;
				_SkillStore2.default.retrieve(weapon_skills);
				return;
			}
		}, {
			key: '_createSkillArray',
			value: function _createSkillArray(character, profession, type) {
				if (!profession.name || !character.name) return [];
				var twoHanders = ['Greatsword', 'Staff', 'Hammer', 'Longbow', 'Shortbow', 'Rifle'];
				var weapons = ['WeaponA1', 'WeaponA2', 'WeaponB1', 'WeaponB2'].reduce(function (t, w) {
					var slot = character.equipment.find(function (e) {
						return e.slot === w;
					});if (!slot) return t;
					var item = _ItemStore2.default.getItem(slot.id);if (!item) return t;
					var type = item.details.type;
					t[w] = type[0] + type.slice(1).toLowerCase();
					return t;
				}, {});
				var profweps = profession.weapons;
				var skills = [];
				if (profession.name === "Elementalist") {
					var weapon1 = weapons['WeaponA1'];
					var weapon2 = weapons['WeaponA2'];
					if (!weapon1 && !weapon2) return;
					['Fire', 'Earth', 'Air', 'Water'].forEach(function (att) {
						var row = [];
						if (weapon1) {
							row.push(profweps[weapon1].skills.find(function (w) {
								return w.slot === 'Weapon_1' && w.attunement === att;
							}).id);
							row.push(profweps[weapon1].skills.find(function (w) {
								return w.slot === 'Weapon_2' && w.attunement === att;
							}).id);
							row.push(profweps[weapon1].skills.find(function (w) {
								return w.slot === 'Weapon_3' && w.attunement === att;
							}).id);
							if (twoHanders.indexOf(weapon1) > -1) {
								row.push(profweps[weapon1].skills.find(function (w) {
									return w.slot === 'Weapon_4' && w.attunement === att;
								}).id);
								row.push(profweps[weapon1].skills.find(function (w) {
									return w.slot === 'Weapon_5' && w.attunement === att;
								}).id);
							}
						} else {
							row = row.concat([null, null, null]);
						}
						if (weapon2) {
							row.push(profweps[weapon2].skills.find(function (w) {
								return w.slot === 'Weapon_4' && w.attunement === att;
							}).id);
							row.push(profweps[weapon2].skills.find(function (w) {
								return w.slot === 'Weapon_5' && w.attunement === att;
							}).id);
						} else if (twoHanders.indexOf(weapon1) == -1) {
							row = row.concat([null, null]);
						}
						skills.push(row.map(function (s) {
							return _SkillStore2.default.get(s) || {};
						}));
					});
				} else {
					['WeaponA', 'WeaponB'].forEach(function (w) {
						var weapon1 = weapons[w + '1'];
						var weapon2 = weapons[w + '2'];
						if (!weapon1 && !weapon2) return;
						var row = [];
						if (weapon1) {
							row.push(profweps[weapon1].skills.find(function (w) {
								return w.slot === 'Weapon_1';
							}).id);
							row.push(profweps[weapon1].skills.find(function (w) {
								return w.slot === 'Weapon_2';
							}).id);
							if (profession.name === "Thief") {
								row.push(profweps[weapon1].skills.find(function (w) {
									return w.slot === 'Weapon_3' && w.offhand === weapon2;
								}).id);
							} else {
								row.push(profweps[weapon1].skills.find(function (w) {
									return w.slot === 'Weapon_3';
								}).id);
							}
							if (twoHanders.indexOf(weapon1) > -1) {
								row.push(profweps[weapon1].skills.find(function (w) {
									return w.slot === 'Weapon_4';
								}).id);
								row.push(profweps[weapon1].skills.find(function (w) {
									return w.slot === 'Weapon_5';
								}).id);
							}
						} else {
							row = row.concat([null, null, null]);
						}
						if (weapon2) {
							row.push(profweps[weapon2].skills.find(function (w) {
								return w.slot === 'Weapon_4';
							}).id);
							row.push(profweps[weapon2].skills.find(function (w) {
								return w.slot === 'Weapon_5';
							}).id);
						} else if (twoHanders.indexOf(weapon1) == -1) {
							row = row.concat([null, null]);
						}
						skills.push(row.map(function (s) {
							return _SkillStore2.default.get(s) || {};
						}));
					});
				}
				if (skills.length === 0) skills.push([{}, {}, {}, {}, {}]);
				var cskills = character.skills[type];
				if (profession.name === "Revenant") {
					if (skills.length === 1) skills.push([{}, {}, {}, {}, {}]);
					var all_skills = [];
					cskills.legends.forEach(function (l, i) {
						var l = _LegendStore2.default.get(l);if (!l) return;
						var skill_ids = [l.heal].concat(l.utilities).concat([l.elite]);
						all_skills = all_skills.concat(skill_ids);
						skills[i] = skills[i].concat(skill_ids.map(function (s) {
							return _SkillStore2.default.get(s) || {};
						}));
					});
					_SkillStore2.default.retrieve(all_skills);
				} else {
					var skill_ids = [cskills.heal].concat(cskills.utilities).concat([cskills.elite]);
					skills[0] = skills[0].concat(skill_ids.map(function (s) {
						return _SkillStore2.default.get(s) || {};
					}));
				}
				return skills;
			}
		}, {
			key: 'render',
			value: function render() {
				if (!this.props.profession.name || !this.props.character.name) return _react2.default.createElement('div', null);
				return _react2.default.createElement(
					'div',
					null,
					this.state.skills && this.state.skills.map(function (row, ri) {
						return _react2.default.createElement(
							'div',
							{ key: ri },
							row.map(function (skill, si) {
								return _react2.default.createElement(
									_reactBootstrap.OverlayTrigger,
									{ key: si, trigger: ['hover', 'focus', 'click'], rootClose: true, placement: 'top', overlay: _react2.default.createElement(
											_reactBootstrap.Popover,
											{ id: 'skill-details', title: skill.name },
											skill.description
										) },
									_react2.default.createElement('img', { src: skill.icon, style: { width: '64px', height: '64px' } })
								);
							})
						);
					})
				);
			}
		}]);
	
		return Skills;
	}(_react2.default.Component);
	
	var Equipment = function (_React$Component5) {
		_inherits(Equipment, _React$Component5);
	
		function Equipment(props) {
			_classCallCheck(this, Equipment);
	
			return _possibleConstructorReturn(this, (Equipment.__proto__ || Object.getPrototypeOf(Equipment)).call(this, props));
		}
	
		_createClass(Equipment, [{
			key: 'componentDidMount',
			value: function componentDidMount() {
				this.itemChangeListener = this._itemChanges.bind(this);
				this.statChangeListener = this._statChanges.bind(this);
				this.skinChangeListener = this._skinChanges.bind(this);
				_ItemStore2.default.addChangeListener(this.itemChangeListener);
				_StatsStore2.default.addChangeListener(this.statChangeListener);
				_SkinsStore2.default.addChangeListener(this.skinChangeListener);
			}
		}, {
			key: 'componentWillUnmount',
			value: function componentWillUnmount() {
				_ItemStore2.default.removeChangeListener(this.itemChangeListener);
				_StatsStore2.default.removeChangeListener(this.statChangeListener);
				_SkinsStore2.default.removeChangeListener(this.skinChangeListener);
			}
		}, {
			key: '_itemChanges',
			value: function _itemChanges() {
				this._myItems.filter(function (i) {
					return !!i;
				}).forEach(function (item) {
					return item.doUpdate();
				});
			}
		}, {
			key: '_statChanges',
			value: function _statChanges() {
				this._myItems.filter(function (i) {
					return !!i;
				}).forEach(function (item) {
					return item.doStatsUpdate();
				});
			}
		}, {
			key: '_skinChanges',
			value: function _skinChanges() {
				this._myItems.filter(function (i) {
					return !!i;
				}).forEach(function (item) {
					return item.doSkinUpdate();
				});
			}
		}, {
			key: '_profChanges',
			value: function _profChanges() {
				this.setState({ profession: this._getProfession(this.state.character.profession) });
			}
		}, {
			key: 'render',
			value: function render() {
				var _this7 = this;
	
				if (!this.props.character.name) return _react2.default.createElement('div', null);
				var gear_hash = this.props.character.equipment ? this.props.character.equipment.reduce(function (t, e) {
					t[e.slot] = e;
					return t;
				}, {}) : {};
				this._myItems = [];
				return _react2.default.createElement(
					_reactBootstrap.Row,
					null,
					_react2.default.createElement(
						_reactBootstrap.Col,
						{ sm: 4 },
						_react2.default.createElement(
							_reactBootstrap.Panel,
							{ header: 'Armor' },
							['Helm', 'Shoulders', 'Coat', 'Gloves', 'Leggings', 'Boots'].filter(function (slot) {
								return !!gear_hash[slot];
							}).map(function (slot) {
								return _react2.default.createElement(Item, { key: slot, data: gear_hash[slot], ref: function ref(i) {
										_this7._myItems.push(i);
									} });
							})
						)
					),
					_react2.default.createElement(
						_reactBootstrap.Col,
						{ sm: 4 },
						_react2.default.createElement(
							_reactBootstrap.Panel,
							{ header: 'Trinkets' },
							['Backpack', 'Accessory1', 'Accessory2', 'Amulet', 'Ring1', 'Ring2'].filter(function (slot) {
								return !!gear_hash[slot];
							}).map(function (slot) {
								return _react2.default.createElement(Item, { key: slot, data: gear_hash[slot], ref: function ref(i) {
										_this7._myItems.push(i);
									} });
							})
						)
					),
					_react2.default.createElement(
						_reactBootstrap.Col,
						{ sm: 4 },
						_react2.default.createElement(
							_reactBootstrap.Panel,
							{ header: 'Weapons' },
							['WeaponA1', 'WeaponA2'].filter(function (slot) {
								return !!gear_hash[slot];
							}).map(function (slot) {
								return _react2.default.createElement(Item, { key: slot, data: gear_hash[slot], ref: function ref(i) {
										_this7._myItems.push(i);
									} });
							}),
							_react2.default.createElement('br', null),
							['WeaponB1', 'WeaponB2'].filter(function (slot) {
								return !!gear_hash[slot];
							}).map(function (slot) {
								return _react2.default.createElement(Item, { key: slot, data: gear_hash[slot], ref: function ref(i) {
										_this7._myItems.push(i);
									} });
							})
						)
					)
				);
			}
		}]);
	
		return Equipment;
	}(_react2.default.Component);
	
	var Character = function (_React$Component6) {
		_inherits(Character, _React$Component6);
	
		function Character(props) {
			_classCallCheck(this, Character);
	
			var _this8 = _possibleConstructorReturn(this, (Character.__proto__ || Object.getPrototypeOf(Character)).call(this, props));
	
			_this8._getCharacter = _this8._getCharacter.bind(_this8);
			_this8._getCharacters = _this8._getCharacters.bind(_this8);
	
			_this8._getCharacters();
			_this8._getCharacter(props.params.name), _this8.state = {
				tab: 1,
				type: 'pve',
				characters: [],
				character: null,
				profession: {}
			};
			return _this8;
		}
	
		_createClass(Character, [{
			key: 'componentWillReceiveProps',
			value: function componentWillReceiveProps(newProps) {
				if (newProps.params.name !== this.props.params.name) this._getCharacter(newProps.params.name);
			}
		}, {
			key: 'componentDidMount',
			value: function componentDidMount() {
				this.profChangeListener = this._profChanges.bind(this);
				_ProfessionStore2.default.addChangeListener(this.profChangeListener);
			}
		}, {
			key: 'componentWillUnmount',
			value: function componentWillUnmount() {
				_ProfessionStore2.default.removeChangeListener(this.profChangeListener);
			}
		}, {
			key: '_profChanges',
			value: function _profChanges() {
				this.setState({ profession: this._getProfession(this.state.character.profession) });
			}
		}, {
			key: '_getCharacters',
			value: function _getCharacters() {
				var _this9 = this;
	
				_WebSocket2.default.send('get characters').then(function (characters) {
					return _this9.setState({ characters: characters });
				}).catch(function (err) {
					console.log(err);
				});
			}
		}, {
			key: '_getCharacter',
			value: function _getCharacter(name) {
				var _this10 = this;
	
				_WebSocket2.default.send('get character', name).then(function (character) {
					_this10.setState({ profession: _this10._getProfession(character.profession), character: character });
					if (character.profession) _ProfessionStore2.default.retrieve(character.profession);
					// Gather various ids we need for further information
					if (character.equipment) {
						var item_ids = character.equipment.map(function (e) {
							return e.id;
						});
						var upgrade_ids = character.equipment.filter(function (e) {
							return e.upgrades;
						}).reduce(function (t, u) {
							return t.concat(u.upgrades);
						}, []);
						var stat_ids = character.equipment.filter(function (e) {
							return e.stats;
						}).map(function (e) {
							return e.stats.id;
						});
						var skin_ids = character.equipment.filter(function (s) {
							return s.skin;
						}).map(function (s) {
							return s.skin;
						});
						_ItemStore2.default.retrieveItems(item_ids.concat(upgrade_ids));
						_StatsStore2.default.retrieveStats(stat_ids);
						_SkinsStore2.default.retrieveSkins(skin_ids);
					}
				}).catch(function (err) {
					if (err === "no such id") return _reactRouter.browserHistory.push('/characters');
					console.log(err);
				});
			}
		}, {
			key: '_getProfession',
			value: function _getProfession(profession) {
				if (!profession) return {};
				return _ProfessionStore2.default.get(profession) || {};
			}
		}, {
			key: 'selectTab',
			value: function selectTab(tab) {
				this.setState({ tab: tab });
			}
		}, {
			key: 'selectType',
			value: function selectType(type) {
				this.setState({ type: type });
			}
		}, {
			key: '_onSelect',
			value: function _onSelect(selectedCharacter) {
				this.setState({ character: null });
				_reactRouter.browserHistory.push('/characters/' + selectedCharacter);
			}
		}, {
			key: 'render',
			value: function render() {
				return _react2.default.createElement(
					'div',
					null,
					_react2.default.createElement(
						_reactBootstrap.Row,
						null,
						_react2.default.createElement(
							_reactBootstrap.Col,
							{ xs: 1 },
							_react2.default.createElement('img', { src: this.state.profession.icon_big })
						),
						_react2.default.createElement(
							_reactBootstrap.Col,
							{ xs: 11 },
							_react2.default.createElement(
								_reactBootstrap.Dropdown,
								{ id: 'dropdown-characters', onSelect: this._onSelect.bind(this) },
								_react2.default.createElement(
									_reactBootstrap.Dropdown.Toggle,
									{ bsStyle: 'link' },
									_react2.default.createElement(
										'span',
										{ style: { fontSize: 'xx-large' } },
										this.props.params.name
									)
								),
								_react2.default.createElement(
									_reactBootstrap.Dropdown.Menu,
									null,
									this.state.characters.map(function (c, i) {
										return _react2.default.createElement(
											_reactBootstrap.MenuItem,
											{ key: i, eventKey: c },
											c
										);
									})
								)
							)
						)
					),
					this.state.character && _react2.default.createElement(
						_reactBootstrap.Row,
						null,
						_react2.default.createElement(
							'div',
							{ style: { margin: '10px' } },
							'Level ',
							this.state.character.level,
							' ',
							this.state.character.profession
						)
					),
					this.state.character && _react2.default.createElement(
						_reactBootstrap.Row,
						null,
						_react2.default.createElement(
							_reactBootstrap.Nav,
							{ bsStyle: 'pills', activeKey: this.state.type, onSelect: this.selectType.bind(this) },
							_react2.default.createElement(
								_reactBootstrap.NavItem,
								{ eventKey: 'pve' },
								'PvE'
							),
							_react2.default.createElement(
								_reactBootstrap.NavItem,
								{ eventKey: 'wvw' },
								'WvW'
							),
							_react2.default.createElement(
								_reactBootstrap.NavItem,
								{ eventKey: 'pvp' },
								'PvP'
							)
						),
						_react2.default.createElement('br', null)
					),
					this.state.character && _react2.default.createElement(
						_reactBootstrap.Row,
						null,
						_react2.default.createElement(
							_reactBootstrap.Tabs,
							{ activeKey: this.state.tab, onSelect: this.selectTab.bind(this), id: 'character-tabs' },
							_react2.default.createElement('br', null),
							_react2.default.createElement(
								_reactBootstrap.Tab,
								{ title: 'Equipment', eventKey: 1 },
								_react2.default.createElement(Equipment, { character: this.state.character })
							),
							_react2.default.createElement(
								_reactBootstrap.Tab,
								{ title: 'Traits', eventKey: 2 },
								_react2.default.createElement(Traits, { character: this.state.character, type: this.state.type })
							),
							_react2.default.createElement(
								_reactBootstrap.Tab,
								{ title: 'Skills', eventKey: 3 },
								_react2.default.createElement(Skills, { character: this.state.character, profession: this.state.profession, type: this.state.type })
							),
							_react2.default.createElement(
								_reactBootstrap.Tab,
								{ title: 'Privacy', eventKey: 4 },
								_react2.default.createElement(Privacy, { character: this.state.character })
							)
						)
					)
				);
			}
		}]);
	
		return Character;
	}(_react2.default.Component);
	
	exports.default = Character;

/***/ },

/***/ 567:
/*!******************************************************************!*\
  !*** ./features/web/client/components/partials/PostToChannel.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _react = __webpack_require__(/*! react */ 1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactBootstrap = __webpack_require__(/*! react-bootstrap */ 236);
	
	var _DiscordServerStore = __webpack_require__(/*! ../../stores/DiscordServerStore */ 568);
	
	var _DiscordServerStore2 = _interopRequireDefault(_DiscordServerStore);
	
	var _DiscordChannelStore = __webpack_require__(/*! ../../stores/DiscordChannelStore */ 570);
	
	var _DiscordChannelStore2 = _interopRequireDefault(_DiscordChannelStore);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var PostToChannel = function (_React$Component) {
		_inherits(PostToChannel, _React$Component);
	
		function PostToChannel(props) {
			_classCallCheck(this, PostToChannel);
	
			var _this = _possibleConstructorReturn(this, (PostToChannel.__proto__ || Object.getPrototypeOf(PostToChannel)).call(this, props));
	
			_this._open = _this._open.bind(_this);
			_this._close = _this._close.bind(_this);
	
			var servers = _this._getServers();
			_this.state = {
				showModal: false,
				servers: _this._getServers(),
				channels: [],
				selectedServer: ''
			};
			if (servers.length === 1) {
				_this.state.selectedServer = servers[0].id;
				_this.state.channels = _this._getChannels(servers[0].id);
			}
			return _this;
		}
	
		_createClass(PostToChannel, [{
			key: '_open',
			value: function _open() {
				this.setState({ showModal: true });
			}
		}, {
			key: '_close',
			value: function _close() {
				this.setState({ showModal: false });
			}
		}, {
			key: '_getServers',
			value: function _getServers() {
				return _DiscordServerStore2.default.servers;
			}
		}, {
			key: '_getChannels',
			value: function _getChannels(server) {
				return _DiscordChannelStore2.default.serverChannels(server);
			}
		}, {
			key: '_serverChange',
			value: function _serverChange(e) {
				var selectedServer = e.target.value;
				var channels = this._getChannels(selectedServer);
				this.setState({ selectedServer: selectedServer, channels: channels });
			}
		}, {
			key: 'render',
			value: function render() {
				return _react2.default.createElement(
					'div',
					null,
					_react2.default.createElement(
						_reactBootstrap.Button,
						{ bsStyle: 'primary', onClick: this._open },
						'Post To Channel'
					),
					_react2.default.createElement(
						_reactBootstrap.Modal,
						{ show: this.state.showModal, onHide: this._close },
						_react2.default.createElement(
							_reactBootstrap.Modal.Header,
							{ closeButton: true },
							_react2.default.createElement(
								_reactBootstrap.Modal.Title,
								null,
								'Post To Channel'
							)
						),
						_react2.default.createElement(
							_reactBootstrap.Modal.Body,
							null,
							_react2.default.createElement(
								'form',
								null,
								this.state.servers.length > 1 && _react2.default.createElement(
									_reactBootstrap.FormGroup,
									{ controlId: 'serverSelect' },
									_react2.default.createElement(
										_reactBootstrap.ControlLabel,
										null,
										'Server'
									),
									_react2.default.createElement(
										_reactBootstrap.FormControl,
										{ componentClass: 'select', placeholder: 'Server', value: this.state.selectedServer, onChange: this._serverChange.bind(this) },
										_react2.default.createElement('option', { value: '' }),
										this.state.servers.map(function (s) {
											return _react2.default.createElement(
												'option',
												{ key: s.id, value: s.id },
												s.name
											);
										})
									)
								),
								this.state.selectedServer && _react2.default.createElement(
									_reactBootstrap.FormGroup,
									{ controlId: 'channelSelect' },
									_react2.default.createElement(
										_reactBootstrap.ControlLabel,
										null,
										'Channel'
									),
									_react2.default.createElement(
										_reactBootstrap.FormControl,
										{ componentClass: 'select', placeholder: 'Channel' },
										_react2.default.createElement('option', { value: '' }),
										this.state.channels.map(function (c) {
											return _react2.default.createElement(
												'option',
												{ key: c.id, value: c.id },
												c.name
											);
										})
									)
								)
							)
						)
					)
				);
			}
		}]);
	
		return PostToChannel;
	}(_react2.default.Component);
	
	exports.default = PostToChannel;

/***/ },

/***/ 568:
/*!**********************************************************!*\
  !*** ./features/web/client/stores/DiscordServerStore.js ***!
  \**********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BaseStore2 = __webpack_require__(/*! ./BaseStore */ 491);
	
	var _BaseStore3 = _interopRequireDefault(_BaseStore2);
	
	var _WebSocket = __webpack_require__(/*! ../services/WebSocket */ 500);
	
	var _WebSocket2 = _interopRequireDefault(_WebSocket);
	
	var _LoginStore = __webpack_require__(/*! ./LoginStore */ 490);
	
	var _LoginStore2 = _interopRequireDefault(_LoginStore);
	
	var _DiscordServerActions = __webpack_require__(/*! ../actions/DiscordServerActions */ 569);
	
	var _DiscordServerActions2 = _interopRequireDefault(_DiscordServerActions);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var DiscordServerStore = function (_BaseStore) {
		_inherits(DiscordServerStore, _BaseStore);
	
		function DiscordServerStore() {
			_classCallCheck(this, DiscordServerStore);
	
			var _this = _possibleConstructorReturn(this, (DiscordServerStore.__proto__ || Object.getPrototypeOf(DiscordServerStore)).call(this));
	
			_this.subscribe(function () {
				return _this._registerToActions.bind(_this);
			});
	
			_WebSocket2.default.on('new discord channel', _DiscordServerActions2.default.receive);
	
			_this._servers = [];
			return _this;
		}
	
		_createClass(DiscordServerStore, [{
			key: '_registerToActions',
			value: function _registerToActions(action) {
				switch (action.actionType) {
					case 'DISCORD SERVER':
						this._servers = action.servers;
						this.emitChange();
						break;
					case 'LOGIN':
						_LoginStore2.default.waitFor();
						_WebSocket2.default.send('get discord servers').then(_DiscordServerActions2.default.receive).catch(function (err) {
							return console.log(err);
						});
						break;
					case 'LOGOUT':
						this._servers = [];
						this.emitChange();
						break;
				}
			}
		}, {
			key: 'servers',
			get: function get() {
				return this._servers;
			}
		}]);
	
		return DiscordServerStore;
	}(_BaseStore3.default);
	
	exports.default = new DiscordServerStore();

/***/ },

/***/ 569:
/*!*************************************************************!*\
  !*** ./features/web/client/actions/DiscordServerActions.js ***!
  \*************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _AppDispatcher = __webpack_require__(/*! ../dispatchers/AppDispatcher */ 493);
	
	var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
		receive: function receive(servers) {
			return _AppDispatcher2.default.dispatch({ actionType: 'DISCORD SERVER', servers: servers });
		}
	};

/***/ },

/***/ 570:
/*!***********************************************************!*\
  !*** ./features/web/client/stores/DiscordChannelStore.js ***!
  \***********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BaseStore2 = __webpack_require__(/*! ./BaseStore */ 491);
	
	var _BaseStore3 = _interopRequireDefault(_BaseStore2);
	
	var _WebSocket = __webpack_require__(/*! ../services/WebSocket */ 500);
	
	var _WebSocket2 = _interopRequireDefault(_WebSocket);
	
	var _LoginStore = __webpack_require__(/*! ./LoginStore */ 490);
	
	var _LoginStore2 = _interopRequireDefault(_LoginStore);
	
	var _DiscordChannelActions = __webpack_require__(/*! ../actions/DiscordChannelActions */ 571);
	
	var _DiscordChannelActions2 = _interopRequireDefault(_DiscordChannelActions);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var DiscordChannelStore = function (_BaseStore) {
		_inherits(DiscordChannelStore, _BaseStore);
	
		function DiscordChannelStore() {
			_classCallCheck(this, DiscordChannelStore);
	
			var _this = _possibleConstructorReturn(this, (DiscordChannelStore.__proto__ || Object.getPrototypeOf(DiscordChannelStore)).call(this));
	
			_this.subscribe(function () {
				return _this._registerToActions.bind(_this);
			});
	
			_WebSocket2.default.on('new discord channel', _DiscordChannelActions2.default.receive);
	
			_this._channels = [];
			return _this;
		}
	
		_createClass(DiscordChannelStore, [{
			key: '_registerToActions',
			value: function _registerToActions(action) {
				switch (action.actionType) {
					case 'DISCORD CHANNEL':
						this._channels = action.channels;
						this.emitChange();
						break;
					case 'LOGIN':
						_LoginStore2.default.waitFor();
						_WebSocket2.default.send('get discord channels').then(_DiscordChannelActions2.default.receive).catch(function (err) {
							return console.log(err);
						});
						break;
					case 'LOGOUT':
						this._channels = [];
						this.emitChange();
						break;
				}
			}
		}, {
			key: 'serverChannels',
			value: function serverChannels(server) {
				return this._channels.filter(function (c) {
					return c.server === server;
				});
			}
		}, {
			key: 'channels',
			get: function get() {
				return this._channels;
			}
		}]);
	
		return DiscordChannelStore;
	}(_BaseStore3.default);
	
	exports.default = new DiscordChannelStore();

/***/ },

/***/ 571:
/*!**************************************************************!*\
  !*** ./features/web/client/actions/DiscordChannelActions.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _AppDispatcher = __webpack_require__(/*! ../dispatchers/AppDispatcher */ 493);
	
	var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
		receive: function receive(channels) {
			return _AppDispatcher2.default.dispatch({ actionType: 'DISCORD CHANNEL', channels: channels });
		}
	};

/***/ },

/***/ 572:
/*!*************************************************!*\
  !*** ./features/web/client/stores/ItemStore.js ***!
  \*************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BaseStore2 = __webpack_require__(/*! ./BaseStore */ 491);
	
	var _BaseStore3 = _interopRequireDefault(_BaseStore2);
	
	var _Gw2Api = __webpack_require__(/*! ../services/Gw2Api */ 573);
	
	var _Gw2Api2 = _interopRequireDefault(_Gw2Api);
	
	var _ItemActions = __webpack_require__(/*! ../actions/ItemActions */ 574);
	
	var _ItemActions2 = _interopRequireDefault(_ItemActions);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var ItemStore = function (_BaseStore) {
		_inherits(ItemStore, _BaseStore);
	
		function ItemStore() {
			_classCallCheck(this, ItemStore);
	
			var _this = _possibleConstructorReturn(this, (ItemStore.__proto__ || Object.getPrototypeOf(ItemStore)).call(this));
	
			_this.subscribe(function () {
				return _this._registerToActions.bind(_this);
			});
	
			_this._items = [];
			return _this;
		}
	
		_createClass(ItemStore, [{
			key: '_registerToActions',
			value: function _registerToActions(action) {
				switch (action.actionType) {
					case 'ITEMS':
						this._items = this._items.concat(action.items);
						this.emitChange();
						break;
				}
			}
		}, {
			key: 'retrieveItems',
			value: function retrieveItems(ids) {
				var existing = this._items.map(function (i) {
					return i.id;
				});
				ids = ids.filter(function (id) {
					return existing.indexOf(id) === -1;
				});
				if (ids.length === 0) return;
				_Gw2Api2.default.request('/v2/items', ids).then(_ItemActions2.default.receiveItems);
			}
		}, {
			key: 'getItem',
			value: function getItem(id) {
				return this._items.find(function (i) {
					return id === i.id;
				});
			}
		}]);
	
		return ItemStore;
	}(_BaseStore3.default);
	
	exports.default = new ItemStore();

/***/ },

/***/ 573:
/*!************************************************!*\
  !*** ./features/web/client/services/Gw2Api.js ***!
  \************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _superagent = __webpack_require__(/*! superagent */ 556);
	
	var _superagent2 = _interopRequireDefault(_superagent);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var api_url = 'https://api.guildwars2.com';
	
	var Gw2Api = function () {
		function Gw2Api() {
			_classCallCheck(this, Gw2Api);
		}
	
		_createClass(Gw2Api, [{
			key: 'request',
			value: function request(path, ids) {
				if (ids) {
					ids = ids.filter(function (i) {
						return !!i;
					}).sort().filter(function (item, pos, ary) {
						return !pos || item != ary[pos - 1];
					}); // dedupe
					var promises = [];
					while (ids.length > 0) {
						var this_bit = ids.splice(0, 200);
						var this_path = path + '?ids=' + this_bit.join(',');
						promises.push(new Promise(function (resolve, reject) {
							_superagent2.default.get(api_url + this_path).accept('json').end(function (err, res) {
								if (err) return reject(err.message);
								resolve(JSON.parse(res.text));
							});
						}));
					}
					return Promise.all(promises).then(function (results) {
						return results.reduce(function (t, a) {
							return t.concat(a);
						}, []);
					});
				} else {
					return new Promise(function (resolve, reject) {
						_superagent2.default.get(api_url + path).accept('json').end(function (err, res) {
							if (err) return reject(err.message);
							resolve(JSON.parse(res.text));
						});
					});
				}
			}
		}]);
	
		return Gw2Api;
	}();
	
	exports.default = new Gw2Api();

/***/ },

/***/ 574:
/*!****************************************************!*\
  !*** ./features/web/client/actions/ItemActions.js ***!
  \****************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _AppDispatcher = __webpack_require__(/*! ../dispatchers/AppDispatcher */ 493);
	
	var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
		receiveItems: function receiveItems(items) {
			return _AppDispatcher2.default.dispatch({ actionType: 'ITEMS', items: items });
		}
	};

/***/ },

/***/ 575:
/*!**************************************************!*\
  !*** ./features/web/client/stores/StatsStore.js ***!
  \**************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BaseStore2 = __webpack_require__(/*! ./BaseStore */ 491);
	
	var _BaseStore3 = _interopRequireDefault(_BaseStore2);
	
	var _Gw2Api = __webpack_require__(/*! ../services/Gw2Api */ 573);
	
	var _Gw2Api2 = _interopRequireDefault(_Gw2Api);
	
	var _StatsActions = __webpack_require__(/*! ../actions/StatsActions */ 576);
	
	var _StatsActions2 = _interopRequireDefault(_StatsActions);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var StatsStore = function (_BaseStore) {
		_inherits(StatsStore, _BaseStore);
	
		function StatsStore() {
			_classCallCheck(this, StatsStore);
	
			var _this = _possibleConstructorReturn(this, (StatsStore.__proto__ || Object.getPrototypeOf(StatsStore)).call(this));
	
			_this.subscribe(function () {
				return _this._registerToActions.bind(_this);
			});
	
			_this._stats = [];
			return _this;
		}
	
		_createClass(StatsStore, [{
			key: '_registerToActions',
			value: function _registerToActions(action) {
				switch (action.actionType) {
					case 'ITEMS':
						var infix_ids = action.items.filter(function (i) {
							return i.details && i.details.infix_upgrade;
						}).map(function (i) {
							return i.details.infix_upgrade.id;
						});
						if (infix_ids.length > 0) this.retrieveStats(infix_ids);
						break;
					case 'STATS':
						this._stats = this._stats.concat(action.stats);
						this.emitChange();
						break;
				}
			}
		}, {
			key: 'retrieveStats',
			value: function retrieveStats(ids) {
				var existing = this._stats.map(function (i) {
					return i.id;
				});
				ids = ids.filter(function (id) {
					return existing.indexOf(id) === -1;
				});
				if (ids.length === 0) return;
				_Gw2Api2.default.request('/v2/itemstats', ids).then(_StatsActions2.default.receiveStats);
			}
		}, {
			key: 'getStats',
			value: function getStats(id) {
				return this._stats.find(function (s) {
					return id === s.id;
				});
			}
		}]);
	
		return StatsStore;
	}(_BaseStore3.default);
	
	exports.default = new StatsStore();

/***/ },

/***/ 576:
/*!*****************************************************!*\
  !*** ./features/web/client/actions/StatsActions.js ***!
  \*****************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _AppDispatcher = __webpack_require__(/*! ../dispatchers/AppDispatcher */ 493);
	
	var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
		receiveStats: function receiveStats(stats) {
			return _AppDispatcher2.default.dispatch({ actionType: 'STATS', stats: stats });
		}
	};

/***/ },

/***/ 577:
/*!**************************************************!*\
  !*** ./features/web/client/stores/SkinsStore.js ***!
  \**************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BaseStore2 = __webpack_require__(/*! ./BaseStore */ 491);
	
	var _BaseStore3 = _interopRequireDefault(_BaseStore2);
	
	var _Gw2Api = __webpack_require__(/*! ../services/Gw2Api */ 573);
	
	var _Gw2Api2 = _interopRequireDefault(_Gw2Api);
	
	var _SkinsActions = __webpack_require__(/*! ../actions/SkinsActions */ 578);
	
	var _SkinsActions2 = _interopRequireDefault(_SkinsActions);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var SkinsStore = function (_BaseStore) {
		_inherits(SkinsStore, _BaseStore);
	
		function SkinsStore() {
			_classCallCheck(this, SkinsStore);
	
			var _this = _possibleConstructorReturn(this, (SkinsStore.__proto__ || Object.getPrototypeOf(SkinsStore)).call(this));
	
			_this.subscribe(function () {
				return _this._registerToActions.bind(_this);
			});
	
			_this._skins = [];
			return _this;
		}
	
		_createClass(SkinsStore, [{
			key: '_registerToActions',
			value: function _registerToActions(action) {
				switch (action.actionType) {
					case 'SKINS':
						this._skins = this._skins.concat(action.skins);
						this.emitChange();
						break;
				}
			}
		}, {
			key: 'retrieveSkins',
			value: function retrieveSkins(ids) {
				var existing = this._skins.map(function (i) {
					return i.id;
				});
				ids = ids.filter(function (id) {
					return existing.indexOf(id) === -1;
				});
				if (ids.length === 0) return;
				_Gw2Api2.default.request('/v2/skins', ids).then(_SkinsActions2.default.receiveSkins);
			}
		}, {
			key: 'getSkin',
			value: function getSkin(id) {
				return this._skins.find(function (i) {
					return id === i.id;
				});
			}
		}]);
	
		return SkinsStore;
	}(_BaseStore3.default);
	
	exports.default = new SkinsStore();

/***/ },

/***/ 578:
/*!*****************************************************!*\
  !*** ./features/web/client/actions/SkinsActions.js ***!
  \*****************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _AppDispatcher = __webpack_require__(/*! ../dispatchers/AppDispatcher */ 493);
	
	var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
		receiveSkins: function receiveSkins(skins) {
			return _AppDispatcher2.default.dispatch({ actionType: 'SKINS', skins: skins });
		}
	};

/***/ },

/***/ 579:
/*!***********************************************************!*\
  !*** ./features/web/client/stores/SpecializationStore.js ***!
  \***********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BaseStore2 = __webpack_require__(/*! ./BaseStore */ 491);
	
	var _BaseStore3 = _interopRequireDefault(_BaseStore2);
	
	var _Gw2Api = __webpack_require__(/*! ../services/Gw2Api */ 573);
	
	var _Gw2Api2 = _interopRequireDefault(_Gw2Api);
	
	var _SpecializationActions = __webpack_require__(/*! ../actions/SpecializationActions */ 580);
	
	var _SpecializationActions2 = _interopRequireDefault(_SpecializationActions);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var SpecializationStore = function (_BaseStore) {
		_inherits(SpecializationStore, _BaseStore);
	
		function SpecializationStore() {
			_classCallCheck(this, SpecializationStore);
	
			var _this = _possibleConstructorReturn(this, (SpecializationStore.__proto__ || Object.getPrototypeOf(SpecializationStore)).call(this));
	
			_this.subscribe(function () {
				return _this._registerToActions.bind(_this);
			});
	
			_this._items = [];
			return _this;
		}
	
		_createClass(SpecializationStore, [{
			key: '_registerToActions',
			value: function _registerToActions(action) {
				switch (action.actionType) {
					case 'SPECIALIZATIONS':
						this._items = this._items.concat(action.specializations);
						this.emitChange();
						break;
				}
			}
		}, {
			key: 'retrieve',
			value: function retrieve(ids) {
				var existing = this._items.map(function (i) {
					return i.id;
				});
				ids = ids.filter(function (id) {
					return existing.indexOf(id) === -1;
				});
				if (ids.length === 0) return;
				_Gw2Api2.default.request('/v2/specializations', ids).then(_SpecializationActions2.default.receive);
			}
		}, {
			key: 'get',
			value: function get(id) {
				return this._items.find(function (i) {
					return id === i.id;
				});
			}
		}]);
	
		return SpecializationStore;
	}(_BaseStore3.default);
	
	exports.default = new SpecializationStore();

/***/ },

/***/ 580:
/*!**************************************************************!*\
  !*** ./features/web/client/actions/SpecializationActions.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _AppDispatcher = __webpack_require__(/*! ../dispatchers/AppDispatcher */ 493);
	
	var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
		receive: function receive(specializations) {
			return _AppDispatcher2.default.dispatch({ actionType: 'SPECIALIZATIONS', specializations: specializations });
		}
	};

/***/ },

/***/ 581:
/*!**************************************************!*\
  !*** ./features/web/client/stores/TraitStore.js ***!
  \**************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BaseStore2 = __webpack_require__(/*! ./BaseStore */ 491);
	
	var _BaseStore3 = _interopRequireDefault(_BaseStore2);
	
	var _Gw2Api = __webpack_require__(/*! ../services/Gw2Api */ 573);
	
	var _Gw2Api2 = _interopRequireDefault(_Gw2Api);
	
	var _TraitActions = __webpack_require__(/*! ../actions/TraitActions */ 582);
	
	var _TraitActions2 = _interopRequireDefault(_TraitActions);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var TraitStore = function (_BaseStore) {
		_inherits(TraitStore, _BaseStore);
	
		function TraitStore() {
			_classCallCheck(this, TraitStore);
	
			var _this = _possibleConstructorReturn(this, (TraitStore.__proto__ || Object.getPrototypeOf(TraitStore)).call(this));
	
			_this.subscribe(function () {
				return _this._registerToActions.bind(_this);
			});
	
			_this._items = [];
			return _this;
		}
	
		_createClass(TraitStore, [{
			key: '_registerToActions',
			value: function _registerToActions(action) {
				switch (action.actionType) {
					case 'TRAITS':
						this._items = this._items.concat(action.traits);
						this.emitChange();
						break;
				}
			}
		}, {
			key: 'retrieve',
			value: function retrieve(ids) {
				var existing = this._items.map(function (i) {
					return i.id;
				});
				ids = ids.filter(function (id) {
					return existing.indexOf(id) === -1;
				});
				if (ids.length === 0) return;
				_Gw2Api2.default.request('/v2/traits', ids).then(_TraitActions2.default.receive);
			}
		}, {
			key: 'get',
			value: function get(id) {
				return this._items.find(function (i) {
					return id === i.id;
				});
			}
		}]);
	
		return TraitStore;
	}(_BaseStore3.default);
	
	exports.default = new TraitStore();

/***/ },

/***/ 582:
/*!*****************************************************!*\
  !*** ./features/web/client/actions/TraitActions.js ***!
  \*****************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _AppDispatcher = __webpack_require__(/*! ../dispatchers/AppDispatcher */ 493);
	
	var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
		receive: function receive(traits) {
			return _AppDispatcher2.default.dispatch({ actionType: 'TRAITS', traits: traits });
		}
	};

/***/ },

/***/ 583:
/*!*******************************************************!*\
  !*** ./features/web/client/stores/ProfessionStore.js ***!
  \*******************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BaseStore2 = __webpack_require__(/*! ./BaseStore */ 491);
	
	var _BaseStore3 = _interopRequireDefault(_BaseStore2);
	
	var _Gw2Api = __webpack_require__(/*! ../services/Gw2Api */ 573);
	
	var _Gw2Api2 = _interopRequireDefault(_Gw2Api);
	
	var _ProfessionActions = __webpack_require__(/*! ../actions/ProfessionActions */ 584);
	
	var _ProfessionActions2 = _interopRequireDefault(_ProfessionActions);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var ProfessionStore = function (_BaseStore) {
		_inherits(ProfessionStore, _BaseStore);
	
		function ProfessionStore() {
			_classCallCheck(this, ProfessionStore);
	
			var _this = _possibleConstructorReturn(this, (ProfessionStore.__proto__ || Object.getPrototypeOf(ProfessionStore)).call(this));
	
			_this.subscribe(function () {
				return _this._registerToActions.bind(_this);
			});
	
			_this._items = [];
			return _this;
		}
	
		_createClass(ProfessionStore, [{
			key: '_registerToActions',
			value: function _registerToActions(action) {
				switch (action.actionType) {
					case 'PROFESSIONS':
						this._items = this._items.concat(action.professions);
						this.emitChange();
						break;
				}
			}
		}, {
			key: 'retrieve',
			value: function retrieve(ids) {
				if (!Array.isArray(ids)) ids = [ids];
				var existing = this._items.map(function (i) {
					return i.id;
				});
				ids = ids.filter(function (id) {
					return existing.indexOf(id) === -1;
				});
				if (ids.length === 0) return;
				_Gw2Api2.default.request('/v2/professions', ids).then(_ProfessionActions2.default.receive);
			}
		}, {
			key: 'get',
			value: function get(id) {
				return this._items.find(function (i) {
					return id === i.id;
				});
			}
		}]);
	
		return ProfessionStore;
	}(_BaseStore3.default);
	
	exports.default = new ProfessionStore();

/***/ },

/***/ 584:
/*!**********************************************************!*\
  !*** ./features/web/client/actions/ProfessionActions.js ***!
  \**********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _AppDispatcher = __webpack_require__(/*! ../dispatchers/AppDispatcher */ 493);
	
	var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
		receive: function receive(professions) {
			return _AppDispatcher2.default.dispatch({ actionType: 'PROFESSIONS', professions: professions });
		}
	};

/***/ },

/***/ 585:
/*!**************************************************!*\
  !*** ./features/web/client/stores/SkillStore.js ***!
  \**************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BaseStore2 = __webpack_require__(/*! ./BaseStore */ 491);
	
	var _BaseStore3 = _interopRequireDefault(_BaseStore2);
	
	var _Gw2Api = __webpack_require__(/*! ../services/Gw2Api */ 573);
	
	var _Gw2Api2 = _interopRequireDefault(_Gw2Api);
	
	var _SkillActions = __webpack_require__(/*! ../actions/SkillActions */ 586);
	
	var _SkillActions2 = _interopRequireDefault(_SkillActions);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var SkillStore = function (_BaseStore) {
		_inherits(SkillStore, _BaseStore);
	
		function SkillStore() {
			_classCallCheck(this, SkillStore);
	
			var _this = _possibleConstructorReturn(this, (SkillStore.__proto__ || Object.getPrototypeOf(SkillStore)).call(this));
	
			_this.subscribe(function () {
				return _this._registerToActions.bind(_this);
			});
	
			_this._items = [];
			return _this;
		}
	
		_createClass(SkillStore, [{
			key: '_registerToActions',
			value: function _registerToActions(action) {
				switch (action.actionType) {
					case 'SKILLS':
						this._items = this._items.concat(action.skills);
						this.emitChange();
						break;
				}
			}
		}, {
			key: 'retrieve',
			value: function retrieve(ids) {
				if (!Array.isArray(ids)) ids = [ids];
				var existing = this._items.map(function (i) {
					return i.id;
				});
				ids = ids.filter(function (id) {
					return existing.indexOf(id) === -1;
				});
				if (ids.length === 0) return;
				_Gw2Api2.default.request('/v2/skills', ids).then(_SkillActions2.default.receive);
			}
		}, {
			key: 'get',
			value: function get(id) {
				return this._items.find(function (i) {
					return id === i.id;
				});
			}
		}]);
	
		return SkillStore;
	}(_BaseStore3.default);
	
	exports.default = new SkillStore();

/***/ },

/***/ 586:
/*!*****************************************************!*\
  !*** ./features/web/client/actions/SkillActions.js ***!
  \*****************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _AppDispatcher = __webpack_require__(/*! ../dispatchers/AppDispatcher */ 493);
	
	var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
		receive: function receive(skills) {
			return _AppDispatcher2.default.dispatch({ actionType: 'SKILLS', skills: skills });
		}
	};

/***/ },

/***/ 587:
/*!***************************************************!*\
  !*** ./features/web/client/stores/LegendStore.js ***!
  \***************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _BaseStore2 = __webpack_require__(/*! ./BaseStore */ 491);
	
	var _BaseStore3 = _interopRequireDefault(_BaseStore2);
	
	var _Gw2Api = __webpack_require__(/*! ../services/Gw2Api */ 573);
	
	var _Gw2Api2 = _interopRequireDefault(_Gw2Api);
	
	var _LegendActions = __webpack_require__(/*! ../actions/LegendActions */ 588);
	
	var _LegendActions2 = _interopRequireDefault(_LegendActions);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var LegendStore = function (_BaseStore) {
		_inherits(LegendStore, _BaseStore);
	
		function LegendStore() {
			_classCallCheck(this, LegendStore);
	
			var _this = _possibleConstructorReturn(this, (LegendStore.__proto__ || Object.getPrototypeOf(LegendStore)).call(this));
	
			_this.subscribe(function () {
				return _this._registerToActions.bind(_this);
			});
	
			_this._items = [];
			return _this;
		}
	
		_createClass(LegendStore, [{
			key: '_registerToActions',
			value: function _registerToActions(action) {
				switch (action.actionType) {
					case 'LEGENDS':
						this._items = this._items.concat(action.legends);
						this.emitChange();
						break;
				}
			}
		}, {
			key: 'retrieve',
			value: function retrieve(ids) {
				if (!Array.isArray(ids)) ids = [ids];
				var existing = this._items.map(function (i) {
					return i.id;
				});
				ids = ids.filter(function (id) {
					return existing.indexOf(id) === -1;
				});
				if (ids.length === 0) return;
				_Gw2Api2.default.request('/v2/legends', ids).then(_LegendActions2.default.receive);
			}
		}, {
			key: 'get',
			value: function get(id) {
				return this._items.find(function (i) {
					return id === i.id;
				});
			}
		}]);
	
		return LegendStore;
	}(_BaseStore3.default);
	
	exports.default = new LegendStore();

/***/ },

/***/ 588:
/*!******************************************************!*\
  !*** ./features/web/client/actions/LegendActions.js ***!
  \******************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _AppDispatcher = __webpack_require__(/*! ../dispatchers/AppDispatcher */ 493);
	
	var _AppDispatcher2 = _interopRequireDefault(_AppDispatcher);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
		receive: function receive(legends) {
			return _AppDispatcher2.default.dispatch({ actionType: 'LEGENDS', legends: legends });
		}
	};

/***/ }

});
//# sourceMappingURL=bundle.js.map