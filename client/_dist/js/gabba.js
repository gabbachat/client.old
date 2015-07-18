(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * Cookies.js - 1.2.1
 * https://github.com/ScottHamper/Cookies
 *
 * This is free and unencumbered software released into the public domain.
 */
"use strict";

(function (global, undefined) {
    "use strict";

    var factory = function factory(window) {
        if (typeof window.document !== "object") {
            throw new Error("Cookies.js requires a `window` with a `document` object");
        }

        var Cookies = (function (_Cookies) {
            var _CookiesWrapper = function Cookies(_x, _x2, _x3) {
                return _Cookies.apply(this, arguments);
            };

            _CookiesWrapper.toString = function () {
                return _Cookies.toString();
            };

            return _CookiesWrapper;
        })(function (key, value, options) {
            return arguments.length === 1 ? Cookies.get(key) : Cookies.set(key, value, options);
        });

        // Allows for setter injection in unit tests
        Cookies._document = window.document;

        // Used to ensure cookie keys do not collide with
        // built-in `Object` properties
        Cookies._cacheKeyPrefix = "cookey."; // Hurr hurr, :)

        Cookies._maxExpireDate = new Date("Fri, 31 Dec 9999 23:59:59 UTC");

        Cookies.defaults = {
            path: "/",
            secure: false
        };

        Cookies.get = function (key) {
            if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
                Cookies._renewCache();
            }

            return Cookies._cache[Cookies._cacheKeyPrefix + key];
        };

        Cookies.set = function (key, value, options) {
            options = Cookies._getExtendedOptions(options);
            options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);

            Cookies._document.cookie = Cookies._generateCookieString(key, value, options);

            return Cookies;
        };

        Cookies.expire = function (key, options) {
            return Cookies.set(key, undefined, options);
        };

        Cookies._getExtendedOptions = function (options) {
            return {
                path: options && options.path || Cookies.defaults.path,
                domain: options && options.domain || Cookies.defaults.domain,
                expires: options && options.expires || Cookies.defaults.expires,
                secure: options && options.secure !== undefined ? options.secure : Cookies.defaults.secure
            };
        };

        Cookies._isValidDate = function (date) {
            return Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date.getTime());
        };

        Cookies._getExpiresDate = function (expires, now) {
            now = now || new Date();

            if (typeof expires === "number") {
                expires = expires === Infinity ? Cookies._maxExpireDate : new Date(now.getTime() + expires * 1000);
            } else if (typeof expires === "string") {
                expires = new Date(expires);
            }

            if (expires && !Cookies._isValidDate(expires)) {
                throw new Error("`expires` parameter cannot be converted to a valid Date instance");
            }

            return expires;
        };

        Cookies._generateCookieString = function (key, value, options) {
            key = key.replace(/[^#$&+\^`|]/g, encodeURIComponent);
            key = key.replace(/\(/g, "%28").replace(/\)/g, "%29");
            value = (value + "").replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
            options = options || {};

            var cookieString = key + "=" + value;
            cookieString += options.path ? ";path=" + options.path : "";
            cookieString += options.domain ? ";domain=" + options.domain : "";
            cookieString += options.expires ? ";expires=" + options.expires.toUTCString() : "";
            cookieString += options.secure ? ";secure" : "";

            return cookieString;
        };

        Cookies._getCacheFromString = function (documentCookie) {
            var cookieCache = {};
            var cookiesArray = documentCookie ? documentCookie.split("; ") : [];

            for (var i = 0; i < cookiesArray.length; i++) {
                var cookieKvp = Cookies._getKeyValuePairFromCookieString(cookiesArray[i]);

                if (cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] === undefined) {
                    cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] = cookieKvp.value;
                }
            }

            return cookieCache;
        };

        Cookies._getKeyValuePairFromCookieString = function (cookieString) {
            // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
            var separatorIndex = cookieString.indexOf("=");

            // IE omits the "=" when the cookie value is an empty string
            separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;

            return {
                key: decodeURIComponent(cookieString.substr(0, separatorIndex)),
                value: decodeURIComponent(cookieString.substr(separatorIndex + 1))
            };
        };

        Cookies._renewCache = function () {
            Cookies._cache = Cookies._getCacheFromString(Cookies._document.cookie);
            Cookies._cachedDocumentCookie = Cookies._document.cookie;
        };

        Cookies._areEnabled = function () {
            var testKey = "cookies.js";
            var areEnabled = Cookies.set(testKey, 1).get(testKey) === "1";
            Cookies.expire(testKey);
            return areEnabled;
        };

        Cookies.enabled = Cookies._areEnabled();

        return Cookies;
    };

    var cookiesExport = typeof global.document === "object" ? factory(global) : factory;

    // AMD support
    if (typeof define === "function" && define.amd) {
        define(function () {
            return cookiesExport;
        });
        // CommonJS/Node.js support
    } else if (typeof exports === "object") {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module === "object" && typeof module.exports === "object") {
            exports = module.exports = cookiesExport;
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.Cookies = cookiesExport;
    } else {
        global.Cookies = cookiesExport;
    }
})(typeof window === "undefined" ? undefined : window);

},{}],2:[function(require,module,exports){
require("../polymer/polymer.html");
document.addEventListener("DOMContentLoaded",function() {
;(function() {

  (function() {
    'use strict';

    /**
     * Chrome uses an older version of DOM Level 3 Keyboard Events
     *
     * Most keys are labeled as text, but some are Unicode codepoints.
     * Values taken from: http://www.w3.org/TR/2007/WD-DOM-Level-3-Events-20071221/keyset.html#KeySet-Set
     */
    var KEY_IDENTIFIER = {
      'U+0009': 'tab',
      'U+001B': 'esc',
      'U+0020': 'space',
      'U+002A': '*',
      'U+0030': '0',
      'U+0031': '1',
      'U+0032': '2',
      'U+0033': '3',
      'U+0034': '4',
      'U+0035': '5',
      'U+0036': '6',
      'U+0037': '7',
      'U+0038': '8',
      'U+0039': '9',
      'U+0041': 'a',
      'U+0042': 'b',
      'U+0043': 'c',
      'U+0044': 'd',
      'U+0045': 'e',
      'U+0046': 'f',
      'U+0047': 'g',
      'U+0048': 'h',
      'U+0049': 'i',
      'U+004A': 'j',
      'U+004B': 'k',
      'U+004C': 'l',
      'U+004D': 'm',
      'U+004E': 'n',
      'U+004F': 'o',
      'U+0050': 'p',
      'U+0051': 'q',
      'U+0052': 'r',
      'U+0053': 's',
      'U+0054': 't',
      'U+0055': 'u',
      'U+0056': 'v',
      'U+0057': 'w',
      'U+0058': 'x',
      'U+0059': 'y',
      'U+005A': 'z',
      'U+007F': 'del'
    };

    /**
     * Special table for KeyboardEvent.keyCode.
     * KeyboardEvent.keyIdentifier is better, and KeyBoardEvent.key is even better
     * than that.
     *
     * Values from: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.keyCode#Value_of_keyCode
     */
    var KEY_CODE = {
      9: 'tab',
      13: 'enter',
      27: 'esc',
      33: 'pageup',
      34: 'pagedown',
      35: 'end',
      36: 'home',
      32: 'space',
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down',
      46: 'del',
      106: '*'
    };

    /**
     * MODIFIER_KEYS maps the short name for modifier keys used in a key
     * combo string to the property name that references those same keys
     * in a KeyboardEvent instance.
     */
    var MODIFIER_KEYS = {
      'shift': 'shiftKey',
      'ctrl': 'ctrlKey',
      'alt': 'altKey',
      'meta': 'metaKey'
    };

    /**
     * KeyboardEvent.key is mostly represented by printable character made by
     * the keyboard, with unprintable keys labeled nicely.
     *
     * However, on OS X, Alt+char can make a Unicode character that follows an
     * Apple-specific mapping. In this case, we
     * fall back to .keyCode.
     */
    var KEY_CHAR = /[a-z0-9*]/;

    /**
     * Matches a keyIdentifier string.
     */
    var IDENT_CHAR = /U\+/;

    /**
     * Matches arrow keys in Gecko 27.0+
     */
    var ARROW_KEY = /^arrow/;

    /**
     * Matches space keys everywhere (notably including IE10's exceptional name
     * `spacebar`).
     */
    var SPACE_KEY = /^space(bar)?/;

    function transformKey(key) {
      var validKey = '';
      if (key) {
        var lKey = key.toLowerCase();
        if (lKey.length == 1) {
          if (KEY_CHAR.test(lKey)) {
            validKey = lKey;
          }
        } else if (ARROW_KEY.test(lKey)) {
          validKey = lKey.replace('arrow', '');
        } else if (SPACE_KEY.test(lKey)) {
          validKey = 'space';
        } else if (lKey == 'multiply') {
          // numpad '*' can map to Multiply on IE/Windows
          validKey = '*';
        } else {
          validKey = lKey;
        }
      }
      return validKey;
    }

    function transformKeyIdentifier(keyIdent) {
      var validKey = '';
      if (keyIdent) {
        if (IDENT_CHAR.test(keyIdent)) {
          validKey = KEY_IDENTIFIER[keyIdent];
        } else {
          validKey = keyIdent.toLowerCase();
        }
      }
      return validKey;
    }

    function transformKeyCode(keyCode) {
      var validKey = '';
      if (Number(keyCode)) {
        if (keyCode >= 65 && keyCode <= 90) {
          // ascii a-z
          // lowercase is 32 offset from uppercase
          validKey = String.fromCharCode(32 + keyCode);
        } else if (keyCode >= 112 && keyCode <= 123) {
          // function keys f1-f12
          validKey = 'f' + (keyCode - 112);
        } else if (keyCode >= 48 && keyCode <= 57) {
          // top 0-9 keys
          validKey = String(48 - keyCode);
        } else if (keyCode >= 96 && keyCode <= 105) {
          // num pad 0-9
          validKey = String(96 - keyCode);
        } else {
          validKey = KEY_CODE[keyCode];
        }
      }
      return validKey;
    }

    function normalizedKeyForEvent(keyEvent) {
      // fall back from .key, to .keyIdentifier, to .keyCode, and then to
      // .detail.key to support artificial keyboard events
      return transformKey(keyEvent.key) ||
        transformKeyIdentifier(keyEvent.keyIdentifier) ||
        transformKeyCode(keyEvent.keyCode) ||
        transformKey(keyEvent.detail.key) || '';
    }

    function keyComboMatchesEvent(keyCombo, keyEvent) {
      return normalizedKeyForEvent(keyEvent) === keyCombo.key &&
        !!keyEvent.shiftKey === !!keyCombo.shiftKey &&
        !!keyEvent.ctrlKey === !!keyCombo.ctrlKey &&
        !!keyEvent.altKey === !!keyCombo.altKey &&
        !!keyEvent.metaKey === !!keyCombo.metaKey;
    }

    function parseKeyComboString(keyComboString) {
      return keyComboString.split('+').reduce(function(parsedKeyCombo, keyComboPart) {
        var eventParts = keyComboPart.split(':');
        var keyName = eventParts[0];
        var event = eventParts[1];

        if (keyName in MODIFIER_KEYS) {
          parsedKeyCombo[MODIFIER_KEYS[keyName]] = true;
        } else {
          parsedKeyCombo.key = keyName;
          parsedKeyCombo.event = event || 'keydown';
        }

        return parsedKeyCombo;
      }, {
        combo: keyComboString.split(':').shift()
      });
    }

    function parseEventString(eventString) {
      return eventString.split(' ').map(function(keyComboString) {
        return parseKeyComboString(keyComboString);
      });
    }


    /**
     * `Polymer.IronA11yKeysBehavior` provides a normalized interface for processing
     * keyboard commands that pertain to [WAI-ARIA best practices](http://www.w3.org/TR/wai-aria-practices/#kbd_general_binding).
     * The element takes care of browser differences with respect to Keyboard events
     * and uses an expressive syntax to filter key presses.
     *
     * Use the `keyBindings` prototype property to express what combination of keys
     * will trigger the event to fire.
     *
     * Use the `key-event-target` attribute to set up event handlers on a specific
     * node.
     * The `keys-pressed` event will fire when one of the key combinations set with the
     * `keys` property is pressed.
     *
     * @demo demo/index.html
     * @polymerBehavior IronA11yKeysBehavior
     */
    Polymer.IronA11yKeysBehavior = {
      properties: {
        /**
         * The HTMLElement that will be firing relevant KeyboardEvents.
         */
        keyEventTarget: {
          type: Object,
          value: function() {
            return this;
          }
        },

        _boundKeyHandlers: {
          type: Array,
          value: function() {
            return [];
          }
        },

        // We use this due to a limitation in IE10 where instances will have
        // own properties of everything on the "prototype".
        _imperativeKeyBindings: {
          type: Object,
          value: function() {
            return {};
          }
        }
      },

      observers: [
        '_resetKeyEventListeners(keyEventTarget, _boundKeyHandlers)'
      ],

      keyBindings: {},

      registered: function() {
        this._prepKeyBindings();
      },

      attached: function() {
        this._listenKeyEventListeners();
      },

      detached: function() {
        this._unlistenKeyEventListeners();
      },

      /**
       * Can be used to imperatively add a key binding to the implementing
       * element. This is the imperative equivalent of declaring a keybinding
       * in the `keyBindings` prototype property.
       */
      addOwnKeyBinding: function(eventString, handlerName) {
        this._imperativeKeyBindings[eventString] = handlerName;
        this._prepKeyBindings();
        this._resetKeyEventListeners();
      },

      /**
       * When called, will remove all imperatively-added key bindings.
       */
      removeOwnKeyBindings: function() {
        this._imperativeKeyBindings = {};
        this._prepKeyBindings();
        this._resetKeyEventListeners();
      },

      keyboardEventMatchesKeys: function(event, eventString) {
        var keyCombos = parseEventString(eventString);
        var index;

        for (index = 0; index < keyCombos.length; ++index) {
          if (keyComboMatchesEvent(keyCombos[index], event)) {
            return true;
          }
        }

        return false;
      },

      _collectKeyBindings: function() {
        var keyBindings = this.behaviors.map(function(behavior) {
          return behavior.keyBindings;
        });

        if (keyBindings.indexOf(this.keyBindings) === -1) {
          keyBindings.push(this.keyBindings);
        }

        return keyBindings;
      },

      _prepKeyBindings: function() {
        this._keyBindings = {};

        this._collectKeyBindings().forEach(function(keyBindings) {
          for (var eventString in keyBindings) {
            this._addKeyBinding(eventString, keyBindings[eventString]);
          }
        }, this);

        for (var eventString in this._imperativeKeyBindings) {
          this._addKeyBinding(eventString, this._imperativeKeyBindings[eventString]);
        }
      },

      _addKeyBinding: function(eventString, handlerName) {
        parseEventString(eventString).forEach(function(keyCombo) {
          this._keyBindings[keyCombo.event] =
            this._keyBindings[keyCombo.event] || [];

          this._keyBindings[keyCombo.event].push([
            keyCombo,
            handlerName
          ]);
        }, this);
      },

      _resetKeyEventListeners: function() {
        this._unlistenKeyEventListeners();

        if (this.isAttached) {
          this._listenKeyEventListeners();
        }
      },

      _listenKeyEventListeners: function() {
        Object.keys(this._keyBindings).forEach(function(eventName) {
          var keyBindings = this._keyBindings[eventName];
          var boundKeyHandler = this._onKeyBindingEvent.bind(this, keyBindings);

          this._boundKeyHandlers.push([this.keyEventTarget, eventName, boundKeyHandler]);

          this.keyEventTarget.addEventListener(eventName, boundKeyHandler);
        }, this);
      },

      _unlistenKeyEventListeners: function() {
        var keyHandlerTuple;
        var keyEventTarget;
        var eventName;
        var boundKeyHandler;

        while (this._boundKeyHandlers.length) {
          // My kingdom for block-scope binding and destructuring assignment..
          keyHandlerTuple = this._boundKeyHandlers.pop();
          keyEventTarget = keyHandlerTuple[0];
          eventName = keyHandlerTuple[1];
          boundKeyHandler = keyHandlerTuple[2];

          keyEventTarget.removeEventListener(eventName, boundKeyHandler);
        }
      },

      _onKeyBindingEvent: function(keyBindings, event) {
        keyBindings.forEach(function(keyBinding) {
          var keyCombo = keyBinding[0];
          var handlerName = keyBinding[1];

          if (!event.defaultPrevented && keyComboMatchesEvent(keyCombo, event)) {
            this._triggerKeyHandler(keyCombo, handlerName, event);
          }
        }, this);
      },

      _triggerKeyHandler: function(keyCombo, handlerName, keyboardEvent) {
        var detail = Object.create(keyCombo);
        detail.keyboardEvent = keyboardEvent;

        this[handlerName].call(this, new CustomEvent(keyCombo.event, {
          detail: detail
        }));
      }
    };
  })();

})();

})
},{"../polymer/polymer.html":13}],3:[function(require,module,exports){
require("../polymer/polymer.html");
require("../iron-a11y-keys-behavior/iron-a11y-keys-behavior.html");
require("./iron-control-state.html");
document.addEventListener("DOMContentLoaded",function() {
;(function() {


  /**
   * @demo demo/index.html
   * @polymerBehavior Polymer.IronButtonState
   */
  Polymer.IronButtonStateImpl = {

    properties: {

      /**
       * If true, the user is currently holding down the button.
       */
      pressed: {
        type: Boolean,
        readOnly: true,
        value: false,
        reflectToAttribute: true,
        observer: '_pressedChanged'
      },

      /**
       * If true, the button toggles the active state with each tap or press
       * of the spacebar.
       */
      toggles: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },

      /**
       * If true, the button is a toggle and is currently in the active state.
       */
      active: {
        type: Boolean,
        value: false,
        notify: true,
        reflectToAttribute: true,
        observer: '_activeChanged'
      },

      /**
       * True if the element is currently being pressed by a "pointer," which
       * is loosely defined as mouse or touch input (but specifically excluding
       * keyboard input).
       */
      pointerDown: {
        type: Boolean,
        readOnly: true,
        value: false
      },

      /**
       * True if the input device that caused the element to receive focus
       * was a keyboard.
       */
      receivedFocusFromKeyboard: {
        type: Boolean,
        readOnly: true
      }
    },

    listeners: {
      down: '_downHandler',
      up: '_upHandler',
      tap: '_tapHandler'
    },

    observers: [
      '_detectKeyboardFocus(focused)'
    ],

    keyBindings: {
      'enter:keydown': '_asyncClick',
      'space:keydown': '_spaceKeyDownHandler',
      'space:keyup': '_spaceKeyUpHandler',
    },

    _tapHandler: function() {
      if (this.toggles) {
       // a tap is needed to toggle the active state
        this._userActivate(!this.active);
      } else {
        this.active = false;
      }
    },

    _detectKeyboardFocus: function(focused) {
      this._setReceivedFocusFromKeyboard(!this.pointerDown && focused);
    },

    // to emulate native checkbox, (de-)activations from a user interaction fire
    // 'change' events
    _userActivate: function(active) {
      this.active = active;
      this.fire('change');
    },

    _downHandler: function() {
      this._setPointerDown(true);
      this._setPressed(true);
      this._setReceivedFocusFromKeyboard(false);
    },

    _upHandler: function() {
      this._setPointerDown(false);
      this._setPressed(false);
    },

    _spaceKeyDownHandler: function(event) {
      var keyboardEvent = event.detail.keyboardEvent;
      keyboardEvent.preventDefault();
      keyboardEvent.stopImmediatePropagation();
      this._setPressed(true);
    },

    _spaceKeyUpHandler: function() {
      if (this.pressed) {
        this._asyncClick();
      }
      this._setPressed(false);
    },

    // trigger click asynchronously, the asynchrony is useful to allow one
    // event handler to unwind before triggering another event
    _asyncClick: function() {
      this.async(function() {
        this.click();
      }, 1);
    },

    // any of these changes are considered a change to button state

    _pressedChanged: function(pressed) {
      this._changedButtonState();
    },

    _activeChanged: function(active) {
      if (this.toggles) {
        this.setAttribute('aria-pressed', active ? 'true' : 'false');
      } else {
        this.removeAttribute('aria-pressed');
      }
      this._changedButtonState();
    },

    _controlStateChanged: function() {
      if (this.disabled) {
        this._setPressed(false);
      } else {
        this._changedButtonState();
      }
    },

    // provide hook for follow-on behaviors to react to button-state

    _changedButtonState: function() {
      if (this._buttonStateChanged) {
        this._buttonStateChanged(); // abstract
      }
    }

  };

  /** @polymerBehavior */
  Polymer.IronButtonState = [
    Polymer.IronA11yKeysBehavior,
    Polymer.IronButtonStateImpl
  ];


})();

})
},{"../iron-a11y-keys-behavior/iron-a11y-keys-behavior.html":2,"../polymer/polymer.html":13,"./iron-control-state.html":4}],4:[function(require,module,exports){
require("../polymer/polymer.html");
document.addEventListener("DOMContentLoaded",function() {
;(function() {


  /**
   * @demo demo/index.html
   * @polymerBehavior
   */
  Polymer.IronControlState = {

    properties: {

      /**
       * If true, the element currently has focus.
       */
      focused: {
        type: Boolean,
        value: false,
        notify: true,
        readOnly: true,
        reflectToAttribute: true
      },

      /**
       * If true, the user cannot interact with this element.
       */
      disabled: {
        type: Boolean,
        value: false,
        notify: true,
        observer: '_disabledChanged',
        reflectToAttribute: true
      },

      _oldTabIndex: {
        type: Number
      },

      _boundFocusBlurHandler: {
        type: Function,
        value: function() {
          return this._focusBlurHandler.bind(this);
        }
      }

    },

    observers: [
      '_changedControlState(focused, disabled)'
    ],

    ready: function() {
      // TODO(sjmiles): ensure read-only property is valued so the compound
      // observer will fire
      if (this.focused === undefined) {
        this._setFocused(false);
      }
      this.addEventListener('focus', this._boundFocusBlurHandler, true);
      this.addEventListener('blur', this._boundFocusBlurHandler, true);
    },

    _focusBlurHandler: function(event) {
      var target = event.path ? event.path[0] : event.target;
      if (target === this) {
        var focused = event.type === 'focus';
        this._setFocused(focused);
      } else if (!this.shadowRoot) {
        event.stopPropagation();
        this.fire(event.type, {sourceEvent: event}, {
          node: this,
          bubbles: event.bubbles,
          cancelable: event.cancelable
        });
      }
    },

    _disabledChanged: function(disabled, old) {
      this.setAttribute('aria-disabled', disabled ? 'true' : 'false');
      this.style.pointerEvents = disabled ? 'none' : '';
      if (disabled) {
        this._oldTabIndex = this.tabIndex;
        this.focused = false;
        this.tabIndex = -1;
      } else if (this._oldTabIndex !== undefined) {
        this.tabIndex = this._oldTabIndex;
      }
    },

    _changedControlState: function() {
      // _controlStateChanged is abstract, follow-on behaviors may implement it
      if (this._controlStateChanged) {
        this._controlStateChanged();
      }
    }

  };


})();

})
},{"../polymer/polymer.html":13}],5:[function(require,module,exports){
require("../polymer/polymer.html");
document.addEventListener("DOMContentLoaded",function() {
var body = document.getElementsByTagName("body")[0];
var root = body.appendChild(document.createElement("div"));
root.setAttribute("hidden","");
root.innerHTML="<dom-module id=\"iron-collapse\"><style>:host{display:block;transition-duration:300ms}:host(.iron-collapse-closed){display:none}:host(:not(.iron-collapse-opened)){overflow:hidden}</style><template>\n\n    <content></content>\n\n  </template></dom-module>";
;(function() {


  Polymer({

    is: 'iron-collapse',

    properties: {

      /**
       * If true, the orientation is horizontal; otherwise is vertical.
       *
       * @attribute horizontal
       */
      horizontal: {
        type: Boolean,
        value: false,
        observer: '_horizontalChanged'
      },

      /**
       * Set opened to true to show the collapse element and to false to hide it.
       *
       * @attribute opened
       */
      opened: {
        type: Boolean,
        value: false,
        notify: true,
        observer: '_openedChanged'
      }

    },

    hostAttributes: {
      role: 'group',
      'aria-expanded': 'false'
    },

    listeners: {
      transitionend: '_transitionEnd'
    },

    ready: function() {
      // Avoid transition at the beginning e.g. page loads and enable
      // transitions only after the element is rendered and ready.
      this._enableTransition = true;
    },

    /**
     * Toggle the opened state.
     *
     * @method toggle
     */
    toggle: function() {
      this.opened = !this.opened;
    },

    show: function() {
      this.toggleClass('iron-collapse-closed', false);
      this.updateSize('auto', false);
      var s = this._calcSize();
      this.updateSize('0px', false);
      // force layout to ensure transition will go
      this.offsetHeight;
      this.updateSize(s, true);
    },

    hide: function() {
      this.toggleClass('iron-collapse-opened', false);
      this.updateSize(this._calcSize(), false);
      // force layout to ensure transition will go
      this.offsetHeight;
      this.updateSize('0px', true);
    },

    updateSize: function(size, animated) {
      this.enableTransition(animated);
      var s = this.style;
      var nochange = s[this.dimension] === size;
      s[this.dimension] = size;
      if (animated && nochange) {
        this._transitionEnd();
      }
    },

    enableTransition: function(enabled) {
      this.style.transitionDuration = (enabled && this._enableTransition) ? '' : '0s';
    },

    _horizontalChanged: function() {
      this.dimension = this.horizontal ? 'width' : 'height';
      this.style.transitionProperty = this.dimension;
    },

    _openedChanged: function() {
      this[this.opened ? 'show' : 'hide']();
      this.setAttribute('aria-expanded', this.opened ? 'true' : 'false');

    },

    _transitionEnd: function() {
      if (this.opened) {
        this.updateSize('auto', false);
      }
      this.toggleClass('iron-collapse-closed', !this.opened);
      this.toggleClass('iron-collapse-opened', this.opened);
      this.enableTransition(false);
    },

    _calcSize: function() {
      return this.getBoundingClientRect()[this.dimension] + 'px';
    },


  });


})();

})
},{"../polymer/polymer.html":13}],6:[function(require,module,exports){
require("../polymer/polymer.html");
require("../iron-behaviors/iron-button-state.html");
document.addEventListener("DOMContentLoaded",function() {
;(function() {


  /** @polymerBehavior */
  Polymer.PaperButtonBehaviorImpl = {

    properties: {

      _elevation: {
        type: Number
      }

    },

    observers: [
      '_calculateElevation(focused, disabled, active, pressed, receivedFocusFromKeyboard)'
    ],

    hostAttributes: {
      role: 'button',
      tabindex: '0'
    },

    _calculateElevation: function() {
      var e = 1;
      if (this.disabled) {
        e = 0;
      } else if (this.active || this.pressed) {
        e = 4;
      } else if (this.receivedFocusFromKeyboard) {
        e = 3;
      }
      this._elevation = e;
    }
  };

  /** @polymerBehavior */
  Polymer.PaperButtonBehavior = [
    Polymer.IronButtonState,
    Polymer.IronControlState,
    Polymer.PaperButtonBehaviorImpl
  ];


})();

})
},{"../iron-behaviors/iron-button-state.html":3,"../polymer/polymer.html":13}],7:[function(require,module,exports){
require("../polymer/polymer.html");
require("../paper-material/paper-material.html");
require("../paper-ripple/paper-ripple.html");
require("../paper-behaviors/paper-button-behavior.html");
document.addEventListener("DOMContentLoaded",function() {
var body = document.getElementsByTagName("body")[0];
var root = body.appendChild(document.createElement("div"));
root.setAttribute("hidden","");
root.innerHTML="<dom-module id=\"paper-button\"><style>:host{display:inline-block;position:relative;box-sizing:border-box;min-width:5.14em;margin:0 .29em;background:0 0;text-align:center;font:inherit;text-transform:uppercase;outline:0;border-radius:3px;-moz-user-select:none;-ms-user-select:none;-webkit-user-select:none;user-select:none;cursor:pointer;z-index:0;@apply(--paper-button)}.keyboard-focus{font-weight:700}:host([disabled]){background:#eaeaea;color:#a8a8a8;cursor:auto;pointer-events:none;@apply(--paper-button-disabled)}:host([noink]) paper-ripple{display:none}paper-material{border-radius:inherit}.content>::content *{text-transform:inherit}.content{padding:.7em .57em}</style><template>\n\n    <paper-ripple></paper-ripple>\n\n    <paper-material class$=\"[[_computeContentClass(receivedFocusFromKeyboard)]]\" elevation=\"[[_elevation]]\" animated=\"\">\n      <content></content>\n    </paper-material>\n\n  </template></dom-module>";
;(function() {


  Polymer({

    is: 'paper-button',

    behaviors: [
      Polymer.PaperButtonBehavior
    ],

    properties: {

      /**
       * If true, the button should be styled with a shadow.
       */
      raised: {
        type: Boolean,
        reflectToAttribute: true,
        value: false,
        observer: '_calculateElevation'
      }
    },

    _calculateElevation: function() {
      if (!this.raised) {
        this._elevation = 0;
      } else {
        Polymer.PaperButtonBehaviorImpl._calculateElevation.apply(this);
      }
    },

    _computeContentClass: function(receivedFocusFromKeyboard) {
      var className = 'content ';
      if (receivedFocusFromKeyboard) {
        className += ' keyboard-focus';
      }
      return className;
    }
  });


})();

})
},{"../paper-behaviors/paper-button-behavior.html":6,"../paper-material/paper-material.html":8,"../paper-ripple/paper-ripple.html":9,"../polymer/polymer.html":13}],8:[function(require,module,exports){
require("../polymer/polymer.html");
require("../paper-styles/shadow.html");
document.addEventListener("DOMContentLoaded",function() {
var body = document.getElementsByTagName("body")[0];
var root = body.appendChild(document.createElement("div"));
root.setAttribute("hidden","");
root.innerHTML="<dom-module id=\"paper-material\"><style>:host{display:block;position:relative;@apply(--shadow-transition)}:host([elevation=\"1\"]){@apply(--shadow-elevation-2dp)}:host([elevation=\"2\"]){@apply(--shadow-elevation-4dp)}:host([elevation=\"3\"]){@apply(--shadow-elevation-6dp)}:host([elevation=\"4\"]){@apply(--shadow-elevation-8dp)}:host([elevation=\"5\"]){@apply(--shadow-elevation-16dp)}</style><template>\n    <content></content>\n  </template></dom-module>";
;(function() {

  Polymer({
    is: 'paper-material',

    properties: {

      /**
       * The z-depth of this element, from 0-5. Setting to 0 will remove the
       * shadow, and each increasing number greater than 0 will be "deeper"
       * than the last.
       *
       * @attribute elevation
       * @type number
       * @default 1
       */
      elevation: {
        type: Number,
        reflectToAttribute: true,
        value: 1
      },

      /**
       * Set this to true to animate the shadow when setting a new
       * `elevation` value.
       *
       * @attribute animated
       * @type boolean
       * @default false
       */
      animated: {
        type: Boolean,
        reflectToAttribute: true,
        value: false
      }
    }
  });

})();

})
},{"../paper-styles/shadow.html":10,"../polymer/polymer.html":13}],9:[function(require,module,exports){
require("../polymer/polymer.html");
require("../iron-a11y-keys-behavior/iron-a11y-keys-behavior.html");
document.addEventListener("DOMContentLoaded",function() {
var body = document.getElementsByTagName("body")[0];
var root = body.appendChild(document.createElement("div"));
root.setAttribute("hidden","");
root.innerHTML="<dom-module id=\"paper-ripple\"><style>:host{display:block;position:absolute;border-radius:inherit;overflow:hidden;top:0;left:0;right:0;bottom:0}:host([animating]){-webkit-transform:translate(0,0);transform:translate3d(0,0,0)}:host([noink]){pointer-events:none}#background,#waves,.wave-container,.wave{pointer-events:none;position:absolute;top:0;left:0;width:100%;height:100%}#background,.wave{opacity:0}#waves,.wave{overflow:hidden}.wave-container,.wave{border-radius:50%}:host(.circle) #background,:host(.circle) #waves{border-radius:50%}:host(.circle) .wave-container{overflow:hidden}</style><template>\n    <div id=\"background\"></div>\n    <div id=\"waves\"></div>\n  </template></dom-module>";
;(function() {

  (function() {
    var Utility = {
      cssColorWithAlpha: function(cssColor, alpha) {
        var parts = cssColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

        if (typeof alpha == 'undefined') {
          alpha = 1;
        }

        if (!parts) {
          return 'rgba(255, 255, 255, ' + alpha + ')';
        }

        return 'rgba(' + parts[1] + ', ' + parts[2] + ', ' + parts[3] + ', ' + alpha + ')';
      },

      distance: function(x1, y1, x2, y2) {
        var xDelta = (x1 - x2);
        var yDelta = (y1 - y2);

        return Math.sqrt(xDelta * xDelta + yDelta * yDelta);
      },

      now: (function() {
        if (window.performance && window.performance.now) {
          return window.performance.now.bind(window.performance);
        }

        return Date.now;
      })()
    };

    /**
     * @param {HTMLElement} element
     * @constructor
     */
    function ElementMetrics(element) {
      this.element = element;
      this.width = this.boundingRect.width;
      this.height = this.boundingRect.height;

      this.size = Math.max(this.width, this.height);
    }

    ElementMetrics.prototype = {
      get boundingRect () {
        return this.element.getBoundingClientRect();
      },

      furthestCornerDistanceFrom: function(x, y) {
        var topLeft = Utility.distance(x, y, 0, 0);
        var topRight = Utility.distance(x, y, this.width, 0);
        var bottomLeft = Utility.distance(x, y, 0, this.height);
        var bottomRight = Utility.distance(x, y, this.width, this.height);

        return Math.max(topLeft, topRight, bottomLeft, bottomRight);
      }
    };

    /**
     * @param {HTMLElement} element
     * @constructor
     */
    function Ripple(element) {
      this.element = element;
      this.color = window.getComputedStyle(element).color;

      this.wave = document.createElement('div');
      this.waveContainer = document.createElement('div');
      this.wave.style.backgroundColor = this.color;
      this.wave.classList.add('wave');
      this.waveContainer.classList.add('wave-container');
      Polymer.dom(this.waveContainer).appendChild(this.wave);

      this.resetInteractionState();
    }

    Ripple.MAX_RADIUS = 300;

    Ripple.prototype = {
      get recenters() {
        return this.element.recenters;
      },

      get center() {
        return this.element.center;
      },

      get mouseDownElapsed() {
        var elapsed;

        if (!this.mouseDownStart) {
          return 0;
        }

        elapsed = Utility.now() - this.mouseDownStart;

        if (this.mouseUpStart) {
          elapsed -= this.mouseUpElapsed;
        }

        return elapsed;
      },

      get mouseUpElapsed() {
        return this.mouseUpStart ?
          Utility.now () - this.mouseUpStart : 0;
      },

      get mouseDownElapsedSeconds() {
        return this.mouseDownElapsed / 1000;
      },

      get mouseUpElapsedSeconds() {
        return this.mouseUpElapsed / 1000;
      },

      get mouseInteractionSeconds() {
        return this.mouseDownElapsedSeconds + this.mouseUpElapsedSeconds;
      },

      get initialOpacity() {
        return this.element.initialOpacity;
      },

      get opacityDecayVelocity() {
        return this.element.opacityDecayVelocity;
      },

      get radius() {
        var width2 = this.containerMetrics.width * this.containerMetrics.width;
        var height2 = this.containerMetrics.height * this.containerMetrics.height;
        var waveRadius = Math.min(
          Math.sqrt(width2 + height2),
          Ripple.MAX_RADIUS
        ) * 1.1 + 5;

        var duration = 1.1 - 0.2 * (waveRadius / Ripple.MAX_RADIUS);
        var timeNow = this.mouseInteractionSeconds / duration;
        var size = waveRadius * (1 - Math.pow(80, -timeNow));

        return Math.abs(size);
      },

      get opacity() {
        if (!this.mouseUpStart) {
          return this.initialOpacity;
        }

        return Math.max(
          0,
          this.initialOpacity - this.mouseUpElapsedSeconds * this.opacityDecayVelocity
        );
      },

      get outerOpacity() {
        // Linear increase in background opacity, capped at the opacity
        // of the wavefront (waveOpacity).
        var outerOpacity = this.mouseUpElapsedSeconds * 0.3;
        var waveOpacity = this.opacity;

        return Math.max(
          0,
          Math.min(outerOpacity, waveOpacity)
        );
      },

      get isOpacityFullyDecayed() {
        return this.opacity < 0.01 &&
          this.radius >= Math.min(this.maxRadius, Ripple.MAX_RADIUS);
      },

      get isRestingAtMaxRadius() {
        return this.opacity >= this.initialOpacity &&
          this.radius >= Math.min(this.maxRadius, Ripple.MAX_RADIUS);
      },

      get isAnimationComplete() {
        return this.mouseUpStart ?
          this.isOpacityFullyDecayed : this.isRestingAtMaxRadius;
      },

      get translationFraction() {
        return Math.min(
          1,
          this.radius / this.containerMetrics.size * 2 / Math.sqrt(2)
        );
      },

      get xNow() {
        if (this.xEnd) {
          return this.xStart + this.translationFraction * (this.xEnd - this.xStart);
        }

        return this.xStart;
      },

      get yNow() {
        if (this.yEnd) {
          return this.yStart + this.translationFraction * (this.yEnd - this.yStart);
        }

        return this.yStart;
      },

      get isMouseDown() {
        return this.mouseDownStart && !this.mouseUpStart;
      },

      resetInteractionState: function() {
        this.maxRadius = 0;
        this.mouseDownStart = 0;
        this.mouseUpStart = 0;

        this.xStart = 0;
        this.yStart = 0;
        this.xEnd = 0;
        this.yEnd = 0;
        this.slideDistance = 0;

        this.containerMetrics = new ElementMetrics(this.element);
      },

      draw: function() {
        var scale;
        var translateString;
        var dx;
        var dy;

        this.wave.style.opacity = this.opacity;

        scale = this.radius / (this.containerMetrics.size / 2);
        dx = this.xNow - (this.containerMetrics.width / 2);
        dy = this.yNow - (this.containerMetrics.height / 2);


        // 2d transform for safari because of border-radius and overflow:hidden clipping bug.
        // https://bugs.webkit.org/show_bug.cgi?id=98538
        this.waveContainer.style.webkitTransform = 'translate(' + dx + 'px, ' + dy + 'px)';
        this.waveContainer.style.transform = 'translate3d(' + dx + 'px, ' + dy + 'px, 0)';
        this.wave.style.webkitTransform = 'scale(' + scale + ',' + scale + ')';
        this.wave.style.transform = 'scale3d(' + scale + ',' + scale + ',1)';
      },

      /** @param {Event=} event */
      downAction: function(event) {
        var xCenter = this.containerMetrics.width / 2;
        var yCenter = this.containerMetrics.height / 2;

        this.resetInteractionState();
        this.mouseDownStart = Utility.now();

        if (this.center) {
          this.xStart = xCenter;
          this.yStart = yCenter;
          this.slideDistance = Utility.distance(
            this.xStart, this.yStart, this.xEnd, this.yEnd
          );
        } else {
          this.xStart = event ?
              event.detail.x - this.containerMetrics.boundingRect.left :
              this.containerMetrics.width / 2;
          this.yStart = event ?
              event.detail.y - this.containerMetrics.boundingRect.top :
              this.containerMetrics.height / 2;
        }

        if (this.recenters) {
          this.xEnd = xCenter;
          this.yEnd = yCenter;
          this.slideDistance = Utility.distance(
            this.xStart, this.yStart, this.xEnd, this.yEnd
          );
        }

        this.maxRadius = this.containerMetrics.furthestCornerDistanceFrom(
          this.xStart,
          this.yStart
        );

        this.waveContainer.style.top =
          (this.containerMetrics.height - this.containerMetrics.size) / 2 + 'px';
        this.waveContainer.style.left =
          (this.containerMetrics.width - this.containerMetrics.size) / 2 + 'px';

        this.waveContainer.style.width = this.containerMetrics.size + 'px';
        this.waveContainer.style.height = this.containerMetrics.size + 'px';
      },

      /** @param {Event=} event */
      upAction: function(event) {
        if (!this.isMouseDown) {
          return;
        }

        this.mouseUpStart = Utility.now();
      },

      remove: function() {
        Polymer.dom(this.waveContainer.parentNode).removeChild(
          this.waveContainer
        );
      }
    };

    Polymer({
      is: 'paper-ripple',

      behaviors: [
        Polymer.IronA11yKeysBehavior
      ],

      properties: {
        /**
         * The initial opacity set on the wave.
         *
         * @attribute initialOpacity
         * @type number
         * @default 0.25
         */
        initialOpacity: {
          type: Number,
          value: 0.25
        },

        /**
         * How fast (opacity per second) the wave fades out.
         *
         * @attribute opacityDecayVelocity
         * @type number
         * @default 0.8
         */
        opacityDecayVelocity: {
          type: Number,
          value: 0.8
        },

        /**
         * If true, ripples will exhibit a gravitational pull towards
         * the center of their container as they fade away.
         *
         * @attribute recenters
         * @type boolean
         * @default false
         */
        recenters: {
          type: Boolean,
          value: false
        },

        /**
         * If true, ripples will center inside its container
         *
         * @attribute recenters
         * @type boolean
         * @default false
         */
        center: {
          type: Boolean,
          value: false
        },

        /**
         * A list of the visual ripples.
         *
         * @attribute ripples
         * @type Array
         * @default []
         */
        ripples: {
          type: Array,
          value: function() {
            return [];
          }
        },

        /**
         * True when there are visible ripples animating within the
         * element.
         */
        animating: {
          type: Boolean,
          readOnly: true,
          reflectToAttribute: true,
          value: false
        },

        /**
         * If true, the ripple will remain in the "down" state until `holdDown`
         * is set to false again.
         */
        holdDown: {
          type: Boolean,
          value: false,
          observer: '_holdDownChanged'
        },

        _animating: {
          type: Boolean
        },

        _boundAnimate: {
          type: Function,
          value: function() {
            return this.animate.bind(this);
          }
        }
      },

      get target () {
        var ownerRoot = Polymer.dom(this).getOwnerRoot();
        var target;

        if (this.parentNode.nodeType == 11) { // DOCUMENT_FRAGMENT_NODE
          target = ownerRoot.host;
        } else {
          target = this.parentNode;
        }

        return target;
      },

      keyBindings: {
        'enter:keydown': '_onEnterKeydown',
        'space:keydown': '_onSpaceKeydown',
        'space:keyup': '_onSpaceKeyup'
      },

      attached: function() {
        this.listen(this.target, 'up', 'upAction');
        this.listen(this.target, 'down', 'downAction');

        if (!this.target.hasAttribute('noink')) {
          this.keyEventTarget = this.target;
        }
      },

      get shouldKeepAnimating () {
        for (var index = 0; index < this.ripples.length; ++index) {
          if (!this.ripples[index].isAnimationComplete) {
            return true;
          }
        }

        return false;
      },

      simulatedRipple: function() {
        this.downAction(null);

        // Please see polymer/polymer#1305
        this.async(function() {
          this.upAction();
        }, 1);
      },

      /** @param {Event=} event */
      downAction: function(event) {
        if (this.holdDown && this.ripples.length > 0) {
          return;
        }

        var ripple = this.addRipple();

        ripple.downAction(event);

        if (!this._animating) {
          this.animate();
        }
      },

      /** @param {Event=} event */
      upAction: function(event) {
        if (this.holdDown) {
          return;
        }

        this.ripples.forEach(function(ripple) {
          ripple.upAction(event);
        });

        this.animate();
      },

      onAnimationComplete: function() {
        this._animating = false;
        this.$.background.style.backgroundColor = null;
        this.fire('transitionend');
      },

      addRipple: function() {
        var ripple = new Ripple(this);

        Polymer.dom(this.$.waves).appendChild(ripple.waveContainer);
        this.$.background.style.backgroundColor = ripple.color;
        this.ripples.push(ripple);

        this._setAnimating(true);

        return ripple;
      },

      removeRipple: function(ripple) {
        var rippleIndex = this.ripples.indexOf(ripple);

        if (rippleIndex < 0) {
          return;
        }

        this.ripples.splice(rippleIndex, 1);

        ripple.remove();

        if (!this.ripples.length) {
          this._setAnimating(false);
        }
      },

      animate: function() {
        var index;
        var ripple;

        this._animating = true;

        for (index = 0; index < this.ripples.length; ++index) {
          ripple = this.ripples[index];

          ripple.draw();

          this.$.background.style.opacity = ripple.outerOpacity;

          if (ripple.isOpacityFullyDecayed && !ripple.isRestingAtMaxRadius) {
            this.removeRipple(ripple);
          }
        }

        if (!this.shouldKeepAnimating && this.ripples.length === 0) {
          this.onAnimationComplete();
        } else {
          window.requestAnimationFrame(this._boundAnimate);
        }
      },

      _onEnterKeydown: function() {
        this.downAction();
        this.async(this.upAction, 1);
      },

      _onSpaceKeydown: function() {
        this.downAction();
      },

      _onSpaceKeyup: function() {
        this.upAction();
      },

      _holdDownChanged: function(holdDown) {
        if (holdDown) {
          this.downAction();
        } else {
          this.upAction();
        }
      }
    });
  })();

})();

})
},{"../iron-a11y-keys-behavior/iron-a11y-keys-behavior.html":2,"../polymer/polymer.html":13}],10:[function(require,module,exports){
require("../polymer/polymer.html");
document.addEventListener("DOMContentLoaded",function() {
var head = document.getElementsByTagName("head")[0];
head.insertAdjacentHTML("beforeend","<style is=\"custom-style\">:root{--shadow-transition:{transition:box-shadow .28s cubic-bezier(0.4,0,.2,1)};--shadow-none:{box-shadow:none};--shadow-elevation-2dp:{box-shadow:0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12),0 3px 1px -2px rgba(0,0,0,.2)};--shadow-elevation-3dp:{box-shadow:0 3px 4px 0 rgba(0,0,0,.14),0 1px 8px 0 rgba(0,0,0,.12),0 3px 3px -2px rgba(0,0,0,.4)};--shadow-elevation-4dp:{box-shadow:0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12),0 2px 4px -1px rgba(0,0,0,.4)};--shadow-elevation-6dp:{box-shadow:0 6px 10px 0 rgba(0,0,0,.14),0 1px 18px 0 rgba(0,0,0,.12),0 3px 5px -1px rgba(0,0,0,.4)};--shadow-elevation-8dp:{box-shadow:0 8px 10px 1px rgba(0,0,0,.14),0 3px 14px 2px rgba(0,0,0,.12),0 5px 5px -3px rgba(0,0,0,.4)};--shadow-elevation-16dp:{box-shadow:0 16px 24px 2px rgba(0,0,0,.14),0 6px 30px 5px rgba(0,0,0,.12),0 8px 10px -5px rgba(0,0,0,.4)}}</style>");

})
},{"../polymer/polymer.html":13}],11:[function(require,module,exports){
document.addEventListener("DOMContentLoaded",function() {
;(function() {
(function () {
function resolve() {
document.body.removeAttribute('unresolved');
}
if (window.WebComponents) {
addEventListener('WebComponentsReady', resolve);
} else {
if (document.readyState === 'interactive' || document.readyState === 'complete') {
resolve();
} else {
addEventListener('DOMContentLoaded', resolve);
}
}
}());
Polymer = {
Settings: function () {
var user = window.Polymer || {};
location.search.slice(1).split('&').forEach(function (o) {
o = o.split('=');
o[0] && (user[o[0]] = o[1] || true);
});
var wantShadow = user.dom === 'shadow';
var hasShadow = Boolean(Element.prototype.createShadowRoot);
var nativeShadow = hasShadow && !window.ShadowDOMPolyfill;
var useShadow = wantShadow && hasShadow;
var hasNativeImports = Boolean('import' in document.createElement('link'));
var useNativeImports = hasNativeImports;
var useNativeCustomElements = !window.CustomElements || window.CustomElements.useNative;
return {
wantShadow: wantShadow,
hasShadow: hasShadow,
nativeShadow: nativeShadow,
useShadow: useShadow,
useNativeShadow: useShadow && nativeShadow,
useNativeImports: useNativeImports,
useNativeCustomElements: useNativeCustomElements
};
}()
};
(function () {
var userPolymer = window.Polymer;
window.Polymer = function (prototype) {
var ctor = desugar(prototype);
prototype = ctor.prototype;
var options = { prototype: prototype };
if (prototype.extends) {
options.extends = prototype.extends;
}
Polymer.telemetry._registrate(prototype);
document.registerElement(prototype.is, options);
return ctor;
};
var desugar = function (prototype) {
prototype = Polymer.Base.chainObject(prototype, Polymer.Base);
prototype.registerCallback();
return prototype.constructor;
};
window.Polymer = Polymer;
if (userPolymer) {
for (var i in userPolymer) {
Polymer[i] = userPolymer[i];
}
}
Polymer.Class = desugar;
}());
Polymer.telemetry = {
registrations: [],
_regLog: function (prototype) {
console.log('[' + prototype.is + ']: registered');
},
_registrate: function (prototype) {
this.registrations.push(prototype);
Polymer.log && this._regLog(prototype);
},
dumpRegistrations: function () {
this.registrations.forEach(this._regLog);
}
};
Object.defineProperty(window, 'currentImport', {
enumerable: true,
configurable: true,
get: function () {
return (document._currentScript || document.currentScript).ownerDocument;
}
});
Polymer.Base = {
_addFeature: function (feature) {
this.extend(this, feature);
},
registerCallback: function () {
this._registerFeatures();
this._doBehavior('registered');
},
createdCallback: function () {
Polymer.telemetry.instanceCount++;
this.root = this;
this._doBehavior('created');
this._initFeatures();
},
attachedCallback: function () {
this.isAttached = true;
this._doBehavior('attached');
},
detachedCallback: function () {
this.isAttached = false;
this._doBehavior('detached');
},
attributeChangedCallback: function (name) {
this._setAttributeToProperty(this, name);
this._doBehavior('attributeChanged', arguments);
},
extend: function (prototype, api) {
if (prototype && api) {
Object.getOwnPropertyNames(api).forEach(function (n) {
this.copyOwnProperty(n, api, prototype);
}, this);
}
return prototype || api;
},
mixin: function (target, source) {
for (var i in source) {
target[i] = source[i];
}
return target;
},
copyOwnProperty: function (name, source, target) {
var pd = Object.getOwnPropertyDescriptor(source, name);
if (pd) {
Object.defineProperty(target, name, pd);
}
},
_log: console.log.apply.bind(console.log, console),
_warn: console.warn.apply.bind(console.warn, console),
_error: console.error.apply.bind(console.error, console),
_logf: function () {
return this._logPrefix.concat([this.is]).concat(Array.prototype.slice.call(arguments, 0));
}
};
Polymer.Base._logPrefix = function () {
var color = window.chrome || /firefox/i.test(navigator.userAgent);
return color ? [
'%c[%s::%s]:',
'font-weight: bold; background-color:#EEEE00;'
] : ['[%s::%s]:'];
}();
Polymer.Base.chainObject = function (object, inherited) {
if (object && inherited && object !== inherited) {
if (!Object.__proto__) {
object = Polymer.Base.extend(Object.create(inherited), object);
}
object.__proto__ = inherited;
}
return object;
};
Polymer.Base = Polymer.Base.chainObject(Polymer.Base, HTMLElement.prototype);
Polymer.telemetry.instanceCount = 0;
(function () {
var modules = {};
var DomModule = function () {
return document.createElement('dom-module');
};
DomModule.prototype = Object.create(HTMLElement.prototype);
DomModule.prototype.constructor = DomModule;
DomModule.prototype.createdCallback = function () {
var id = this.id || this.getAttribute('name') || this.getAttribute('is');
if (id) {
this.id = id;
modules[id] = this;
}
};
DomModule.prototype.import = function (id, slctr) {
var m = modules[id];
if (!m) {
forceDocumentUpgrade();
m = modules[id];
}
if (m && slctr) {
m = m.querySelector(slctr);
}
return m;
};
var cePolyfill = window.CustomElements && !CustomElements.useNative;
if (cePolyfill) {
var ready = CustomElements.ready;
CustomElements.ready = true;
}
document.registerElement('dom-module', DomModule);
if (cePolyfill) {
CustomElements.ready = ready;
}
function forceDocumentUpgrade() {
if (cePolyfill) {
var script = document._currentScript || document.currentScript;
if (script) {
CustomElements.upgradeAll(script.ownerDocument);
}
}
}
}());
Polymer.Base._addFeature({
_prepIs: function () {
if (!this.is) {
var module = (document._currentScript || document.currentScript).parentNode;
if (module.localName === 'dom-module') {
var id = module.id || module.getAttribute('name') || module.getAttribute('is');
this.is = id;
}
}
}
});
Polymer.Base._addFeature({
behaviors: [],
_prepBehaviors: function () {
if (this.behaviors.length) {
this.behaviors = this._flattenBehaviorsList(this.behaviors);
}
this._prepAllBehaviors(this.behaviors);
},
_flattenBehaviorsList: function (behaviors) {
var flat = [];
behaviors.forEach(function (b) {
if (b instanceof Array) {
flat = flat.concat(this._flattenBehaviorsList(b));
} else if (b) {
flat.push(b);
} else {
this._warn(this._logf('_flattenBehaviorsList', 'behavior is null, check for missing or 404 import'));
}
}, this);
return flat;
},
_prepAllBehaviors: function (behaviors) {
for (var i = behaviors.length - 1; i >= 0; i--) {
this._mixinBehavior(behaviors[i]);
}
for (var i = 0, l = behaviors.length; i < l; i++) {
this._prepBehavior(behaviors[i]);
}
this._prepBehavior(this);
},
_mixinBehavior: function (b) {
Object.getOwnPropertyNames(b).forEach(function (n) {
switch (n) {
case 'hostAttributes':
case 'registered':
case 'properties':
case 'observers':
case 'listeners':
case 'created':
case 'attached':
case 'detached':
case 'attributeChanged':
case 'configure':
case 'ready':
break;
default:
if (!this.hasOwnProperty(n)) {
this.copyOwnProperty(n, b, this);
}
break;
}
}, this);
},
_doBehavior: function (name, args) {
this.behaviors.forEach(function (b) {
this._invokeBehavior(b, name, args);
}, this);
this._invokeBehavior(this, name, args);
},
_invokeBehavior: function (b, name, args) {
var fn = b[name];
if (fn) {
fn.apply(this, args || Polymer.nar);
}
},
_marshalBehaviors: function () {
this.behaviors.forEach(function (b) {
this._marshalBehavior(b);
}, this);
this._marshalBehavior(this);
}
});
Polymer.Base._addFeature({
_prepExtends: function () {
if (this.extends) {
this.__proto__ = this._getExtendedPrototype(this.extends);
}
},
_getExtendedPrototype: function (tag) {
return this._getExtendedNativePrototype(tag);
},
_nativePrototypes: {},
_getExtendedNativePrototype: function (tag) {
var p = this._nativePrototypes[tag];
if (!p) {
var np = this.getNativePrototype(tag);
p = this.extend(Object.create(np), Polymer.Base);
this._nativePrototypes[tag] = p;
}
return p;
},
getNativePrototype: function (tag) {
return Object.getPrototypeOf(document.createElement(tag));
}
});
Polymer.Base._addFeature({
_prepConstructor: function () {
this._factoryArgs = this.extends ? [
this.extends,
this.is
] : [this.is];
var ctor = function () {
return this._factory(arguments);
};
if (this.hasOwnProperty('extends')) {
ctor.extends = this.extends;
}
Object.defineProperty(this, 'constructor', {
value: ctor,
writable: true,
configurable: true
});
ctor.prototype = this;
},
_factory: function (args) {
var elt = document.createElement.apply(document, this._factoryArgs);
if (this.factoryImpl) {
this.factoryImpl.apply(elt, args);
}
return elt;
}
});
Polymer.nob = Object.create(null);
Polymer.Base._addFeature({
properties: {},
getPropertyInfo: function (property) {
var info = this._getPropertyInfo(property, this.properties);
if (!info) {
this.behaviors.some(function (b) {
return info = this._getPropertyInfo(property, b.properties);
}, this);
}
return info || Polymer.nob;
},
_getPropertyInfo: function (property, properties) {
var p = properties && properties[property];
if (typeof p === 'function') {
p = properties[property] = { type: p };
}
if (p) {
p.defined = true;
}
return p;
}
});
Polymer.CaseMap = {
_caseMap: {},
dashToCamelCase: function (dash) {
var mapped = Polymer.CaseMap._caseMap[dash];
if (mapped) {
return mapped;
}
if (dash.indexOf('-') < 0) {
return Polymer.CaseMap._caseMap[dash] = dash;
}
return Polymer.CaseMap._caseMap[dash] = dash.replace(/-([a-z])/g, function (m) {
return m[1].toUpperCase();
});
},
camelToDashCase: function (camel) {
var mapped = Polymer.CaseMap._caseMap[camel];
if (mapped) {
return mapped;
}
return Polymer.CaseMap._caseMap[camel] = camel.replace(/([a-z][A-Z])/g, function (g) {
return g[0] + '-' + g[1].toLowerCase();
});
}
};
Polymer.Base._addFeature({
_prepAttributes: function () {
this._aggregatedAttributes = {};
},
_addHostAttributes: function (attributes) {
if (attributes) {
this.mixin(this._aggregatedAttributes, attributes);
}
},
_marshalHostAttributes: function () {
this._applyAttributes(this, this._aggregatedAttributes);
},
_applyAttributes: function (node, attr$) {
for (var n in attr$) {
if (!this.hasAttribute(n) && n !== 'class') {
this.serializeValueToAttribute(attr$[n], n, this);
}
}
},
_marshalAttributes: function () {
this._takeAttributesToModel(this);
},
_takeAttributesToModel: function (model) {
for (var i = 0, l = this.attributes.length; i < l; i++) {
this._setAttributeToProperty(model, this.attributes[i].name);
}
},
_setAttributeToProperty: function (model, attrName) {
if (!this._serializing) {
var propName = Polymer.CaseMap.dashToCamelCase(attrName);
var info = this.getPropertyInfo(propName);
if (info.defined || this._propertyEffects && this._propertyEffects[propName]) {
var val = this.getAttribute(attrName);
model[propName] = this.deserialize(val, info.type);
}
}
},
_serializing: false,
reflectPropertyToAttribute: function (name) {
this._serializing = true;
this.serializeValueToAttribute(this[name], Polymer.CaseMap.camelToDashCase(name));
this._serializing = false;
},
serializeValueToAttribute: function (value, attribute, node) {
var str = this.serialize(value);
(node || this)[str === undefined ? 'removeAttribute' : 'setAttribute'](attribute, str);
},
deserialize: function (value, type) {
switch (type) {
case Number:
value = Number(value);
break;
case Boolean:
value = value !== null;
break;
case Object:
try {
value = JSON.parse(value);
} catch (x) {
}
break;
case Array:
try {
value = JSON.parse(value);
} catch (x) {
value = null;
console.warn('Polymer::Attributes: couldn`t decode Array as JSON');
}
break;
case Date:
value = new Date(value);
break;
case String:
default:
break;
}
return value;
},
serialize: function (value) {
switch (typeof value) {
case 'boolean':
return value ? '' : undefined;
case 'object':
if (value instanceof Date) {
return value;
} else if (value) {
try {
return JSON.stringify(value);
} catch (x) {
return '';
}
}
default:
return value != null ? value : undefined;
}
}
});
Polymer.Base._addFeature({
_setupDebouncers: function () {
this._debouncers = {};
},
debounce: function (jobName, callback, wait) {
this._debouncers[jobName] = Polymer.Debounce.call(this, this._debouncers[jobName], callback, wait);
},
isDebouncerActive: function (jobName) {
var debouncer = this._debouncers[jobName];
return debouncer && debouncer.finish;
},
flushDebouncer: function (jobName) {
var debouncer = this._debouncers[jobName];
if (debouncer) {
debouncer.complete();
}
},
cancelDebouncer: function (jobName) {
var debouncer = this._debouncers[jobName];
if (debouncer) {
debouncer.stop();
}
}
});
Polymer.version = '1.0.6';
Polymer.Base._addFeature({
_registerFeatures: function () {
this._prepIs();
this._prepAttributes();
this._prepBehaviors();
this._prepExtends();
this._prepConstructor();
},
_prepBehavior: function (b) {
this._addHostAttributes(b.hostAttributes);
},
_marshalBehavior: function (b) {
},
_initFeatures: function () {
this._marshalHostAttributes();
this._setupDebouncers();
this._marshalBehaviors();
}
});
})();

})
},{}],12:[function(require,module,exports){
require("./polymer-micro.html");
document.addEventListener("DOMContentLoaded",function() {
;(function() {
Polymer.Base._addFeature({
_prepTemplate: function () {
this._template = this._template || Polymer.DomModule.import(this.is, 'template');
if (this._template && this._template.hasAttribute('is')) {
this._warn(this._logf('_prepTemplate', 'top-level Polymer template ' + 'must not be a type-extension, found', this._template, 'Move inside simple <template>.'));
}
},
_stampTemplate: function () {
if (this._template) {
this.root = this.instanceTemplate(this._template);
}
},
instanceTemplate: function (template) {
var dom = document.importNode(template._content || template.content, true);
return dom;
}
});
(function () {
var baseAttachedCallback = Polymer.Base.attachedCallback;
Polymer.Base._addFeature({
_hostStack: [],
ready: function () {
},
_pushHost: function (host) {
this.dataHost = host = host || Polymer.Base._hostStack[Polymer.Base._hostStack.length - 1];
if (host && host._clients) {
host._clients.push(this);
}
this._beginHost();
},
_beginHost: function () {
Polymer.Base._hostStack.push(this);
if (!this._clients) {
this._clients = [];
}
},
_popHost: function () {
Polymer.Base._hostStack.pop();
},
_tryReady: function () {
if (this._canReady()) {
this._ready();
}
},
_canReady: function () {
return !this.dataHost || this.dataHost._clientsReadied;
},
_ready: function () {
this._beforeClientsReady();
this._setupRoot();
this._readyClients();
this._afterClientsReady();
this._readySelf();
},
_readyClients: function () {
this._beginDistribute();
var c$ = this._clients;
for (var i = 0, l = c$.length, c; i < l && (c = c$[i]); i++) {
c._ready();
}
this._finishDistribute();
this._clientsReadied = true;
this._clients = null;
},
_readySelf: function () {
this._doBehavior('ready');
this._readied = true;
if (this._attachedPending) {
this._attachedPending = false;
this.attachedCallback();
}
},
_beforeClientsReady: function () {
},
_afterClientsReady: function () {
},
_beforeAttached: function () {
},
attachedCallback: function () {
if (this._readied) {
this._beforeAttached();
baseAttachedCallback.call(this);
} else {
this._attachedPending = true;
}
}
});
}());
Polymer.ArraySplice = function () {
function newSplice(index, removed, addedCount) {
return {
index: index,
removed: removed,
addedCount: addedCount
};
}
var EDIT_LEAVE = 0;
var EDIT_UPDATE = 1;
var EDIT_ADD = 2;
var EDIT_DELETE = 3;
function ArraySplice() {
}
ArraySplice.prototype = {
calcEditDistances: function (current, currentStart, currentEnd, old, oldStart, oldEnd) {
var rowCount = oldEnd - oldStart + 1;
var columnCount = currentEnd - currentStart + 1;
var distances = new Array(rowCount);
for (var i = 0; i < rowCount; i++) {
distances[i] = new Array(columnCount);
distances[i][0] = i;
}
for (var j = 0; j < columnCount; j++)
distances[0][j] = j;
for (var i = 1; i < rowCount; i++) {
for (var j = 1; j < columnCount; j++) {
if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1]))
distances[i][j] = distances[i - 1][j - 1];
else {
var north = distances[i - 1][j] + 1;
var west = distances[i][j - 1] + 1;
distances[i][j] = north < west ? north : west;
}
}
}
return distances;
},
spliceOperationsFromEditDistances: function (distances) {
var i = distances.length - 1;
var j = distances[0].length - 1;
var current = distances[i][j];
var edits = [];
while (i > 0 || j > 0) {
if (i == 0) {
edits.push(EDIT_ADD);
j--;
continue;
}
if (j == 0) {
edits.push(EDIT_DELETE);
i--;
continue;
}
var northWest = distances[i - 1][j - 1];
var west = distances[i - 1][j];
var north = distances[i][j - 1];
var min;
if (west < north)
min = west < northWest ? west : northWest;
else
min = north < northWest ? north : northWest;
if (min == northWest) {
if (northWest == current) {
edits.push(EDIT_LEAVE);
} else {
edits.push(EDIT_UPDATE);
current = northWest;
}
i--;
j--;
} else if (min == west) {
edits.push(EDIT_DELETE);
i--;
current = west;
} else {
edits.push(EDIT_ADD);
j--;
current = north;
}
}
edits.reverse();
return edits;
},
calcSplices: function (current, currentStart, currentEnd, old, oldStart, oldEnd) {
var prefixCount = 0;
var suffixCount = 0;
var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
if (currentStart == 0 && oldStart == 0)
prefixCount = this.sharedPrefix(current, old, minLength);
if (currentEnd == current.length && oldEnd == old.length)
suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);
currentStart += prefixCount;
oldStart += prefixCount;
currentEnd -= suffixCount;
oldEnd -= suffixCount;
if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0)
return [];
if (currentStart == currentEnd) {
var splice = newSplice(currentStart, [], 0);
while (oldStart < oldEnd)
splice.removed.push(old[oldStart++]);
return [splice];
} else if (oldStart == oldEnd)
return [newSplice(currentStart, [], currentEnd - currentStart)];
var ops = this.spliceOperationsFromEditDistances(this.calcEditDistances(current, currentStart, currentEnd, old, oldStart, oldEnd));
var splice = undefined;
var splices = [];
var index = currentStart;
var oldIndex = oldStart;
for (var i = 0; i < ops.length; i++) {
switch (ops[i]) {
case EDIT_LEAVE:
if (splice) {
splices.push(splice);
splice = undefined;
}
index++;
oldIndex++;
break;
case EDIT_UPDATE:
if (!splice)
splice = newSplice(index, [], 0);
splice.addedCount++;
index++;
splice.removed.push(old[oldIndex]);
oldIndex++;
break;
case EDIT_ADD:
if (!splice)
splice = newSplice(index, [], 0);
splice.addedCount++;
index++;
break;
case EDIT_DELETE:
if (!splice)
splice = newSplice(index, [], 0);
splice.removed.push(old[oldIndex]);
oldIndex++;
break;
}
}
if (splice) {
splices.push(splice);
}
return splices;
},
sharedPrefix: function (current, old, searchLength) {
for (var i = 0; i < searchLength; i++)
if (!this.equals(current[i], old[i]))
return i;
return searchLength;
},
sharedSuffix: function (current, old, searchLength) {
var index1 = current.length;
var index2 = old.length;
var count = 0;
while (count < searchLength && this.equals(current[--index1], old[--index2]))
count++;
return count;
},
calculateSplices: function (current, previous) {
return this.calcSplices(current, 0, current.length, previous, 0, previous.length);
},
equals: function (currentValue, previousValue) {
return currentValue === previousValue;
}
};
return new ArraySplice();
}();
Polymer.EventApi = function () {
var Settings = Polymer.Settings;
var EventApi = function (event) {
this.event = event;
};
if (Settings.useShadow) {
EventApi.prototype = {
get rootTarget() {
return this.event.path[0];
},
get localTarget() {
return this.event.target;
},
get path() {
return this.event.path;
}
};
} else {
EventApi.prototype = {
get rootTarget() {
return this.event.target;
},
get localTarget() {
var current = this.event.currentTarget;
var currentRoot = current && Polymer.dom(current).getOwnerRoot();
var p$ = this.path;
for (var i = 0; i < p$.length; i++) {
if (Polymer.dom(p$[i]).getOwnerRoot() === currentRoot) {
return p$[i];
}
}
},
get path() {
if (!this.event._path) {
var path = [];
var o = this.rootTarget;
while (o) {
path.push(o);
o = Polymer.dom(o).parentNode || o.host;
}
path.push(window);
this.event._path = path;
}
return this.event._path;
}
};
}
var factory = function (event) {
if (!event.__eventApi) {
event.__eventApi = new EventApi(event);
}
return event.__eventApi;
};
return { factory: factory };
}();
Polymer.domInnerHTML = function () {
var escapeAttrRegExp = /[&\u00A0"]/g;
var escapeDataRegExp = /[&\u00A0<>]/g;
function escapeReplace(c) {
switch (c) {
case '&':
return '&amp;';
case '<':
return '&lt;';
case '>':
return '&gt;';
case '"':
return '&quot;';
case '\xA0':
return '&nbsp;';
}
}
function escapeAttr(s) {
return s.replace(escapeAttrRegExp, escapeReplace);
}
function escapeData(s) {
return s.replace(escapeDataRegExp, escapeReplace);
}
function makeSet(arr) {
var set = {};
for (var i = 0; i < arr.length; i++) {
set[arr[i]] = true;
}
return set;
}
var voidElements = makeSet([
'area',
'base',
'br',
'col',
'command',
'embed',
'hr',
'img',
'input',
'keygen',
'link',
'meta',
'param',
'source',
'track',
'wbr'
]);
var plaintextParents = makeSet([
'style',
'script',
'xmp',
'iframe',
'noembed',
'noframes',
'plaintext',
'noscript'
]);
function getOuterHTML(node, parentNode, composed) {
switch (node.nodeType) {
case Node.ELEMENT_NODE:
var tagName = node.localName;
var s = '<' + tagName;
var attrs = node.attributes;
for (var i = 0, attr; attr = attrs[i]; i++) {
s += ' ' + attr.name + '="' + escapeAttr(attr.value) + '"';
}
s += '>';
if (voidElements[tagName]) {
return s;
}
return s + getInnerHTML(node, composed) + '</' + tagName + '>';
case Node.TEXT_NODE:
var data = node.data;
if (parentNode && plaintextParents[parentNode.localName]) {
return data;
}
return escapeData(data);
case Node.COMMENT_NODE:
return '<!--' + node.data + '-->';
default:
console.error(node);
throw new Error('not implemented');
}
}
function getInnerHTML(node, composed) {
if (node instanceof HTMLTemplateElement)
node = node.content;
var s = '';
var c$ = Polymer.dom(node).childNodes;
c$ = composed ? node._composedChildren : c$;
for (var i = 0, l = c$.length, child; i < l && (child = c$[i]); i++) {
s += getOuterHTML(child, node, composed);
}
return s;
}
return { getInnerHTML: getInnerHTML };
}();
Polymer.DomApi = function () {
'use strict';
var Settings = Polymer.Settings;
var getInnerHTML = Polymer.domInnerHTML.getInnerHTML;
var nativeInsertBefore = Element.prototype.insertBefore;
var nativeRemoveChild = Element.prototype.removeChild;
var nativeAppendChild = Element.prototype.appendChild;
var nativeCloneNode = Element.prototype.cloneNode;
var nativeImportNode = Document.prototype.importNode;
var dirtyRoots = [];
var DomApi = function (node) {
this.node = node;
if (this.patch) {
this.patch();
}
};
DomApi.prototype = {
flush: function () {
for (var i = 0, host; i < dirtyRoots.length; i++) {
host = dirtyRoots[i];
host.flushDebouncer('_distribute');
}
dirtyRoots = [];
},
_lazyDistribute: function (host) {
if (host.shadyRoot && host.shadyRoot._distributionClean) {
host.shadyRoot._distributionClean = false;
host.debounce('_distribute', host._distributeContent);
dirtyRoots.push(host);
}
},
appendChild: function (node) {
var handled;
this._removeNodeFromHost(node, true);
if (this._nodeIsInLogicalTree(this.node)) {
this._addLogicalInfo(node, this.node);
this._addNodeToHost(node);
handled = this._maybeDistribute(node, this.node);
}
if (!handled && !this._tryRemoveUndistributedNode(node)) {
var container = this.node._isShadyRoot ? this.node.host : this.node;
addToComposedParent(container, node);
nativeAppendChild.call(container, node);
}
return node;
},
insertBefore: function (node, ref_node) {
if (!ref_node) {
return this.appendChild(node);
}
var handled;
this._removeNodeFromHost(node, true);
if (this._nodeIsInLogicalTree(this.node)) {
saveLightChildrenIfNeeded(this.node);
var children = this.childNodes;
var index = children.indexOf(ref_node);
if (index < 0) {
throw Error('The ref_node to be inserted before is not a child ' + 'of this node');
}
this._addLogicalInfo(node, this.node, index);
this._addNodeToHost(node);
handled = this._maybeDistribute(node, this.node);
}
if (!handled && !this._tryRemoveUndistributedNode(node)) {
ref_node = ref_node.localName === CONTENT ? this._firstComposedNode(ref_node) : ref_node;
var container = this.node._isShadyRoot ? this.node.host : this.node;
addToComposedParent(container, node, ref_node);
nativeInsertBefore.call(container, node, ref_node);
}
return node;
},
removeChild: function (node) {
if (factory(node).parentNode !== this.node) {
console.warn('The node to be removed is not a child of this node', node);
}
var handled;
if (this._nodeIsInLogicalTree(this.node)) {
this._removeNodeFromHost(node);
handled = this._maybeDistribute(node, this.node);
}
if (!handled) {
var container = this.node._isShadyRoot ? this.node.host : this.node;
if (container === node.parentNode) {
removeFromComposedParent(container, node);
nativeRemoveChild.call(container, node);
}
}
return node;
},
replaceChild: function (node, ref_node) {
this.insertBefore(node, ref_node);
this.removeChild(ref_node);
return node;
},
getOwnerRoot: function () {
return this._ownerShadyRootForNode(this.node);
},
_ownerShadyRootForNode: function (node) {
if (!node) {
return;
}
if (node._ownerShadyRoot === undefined) {
var root;
if (node._isShadyRoot) {
root = node;
} else {
var parent = Polymer.dom(node).parentNode;
if (parent) {
root = parent._isShadyRoot ? parent : this._ownerShadyRootForNode(parent);
} else {
root = null;
}
}
node._ownerShadyRoot = root;
}
return node._ownerShadyRoot;
},
_maybeDistribute: function (node, parent) {
var fragContent = node.nodeType === Node.DOCUMENT_FRAGMENT_NODE && !node.__noContent && Polymer.dom(node).querySelector(CONTENT);
var wrappedContent = fragContent && Polymer.dom(fragContent).parentNode.nodeType !== Node.DOCUMENT_FRAGMENT_NODE;
var hasContent = fragContent || node.localName === CONTENT;
if (hasContent) {
var root = this._ownerShadyRootForNode(parent);
if (root) {
var host = root.host;
this._updateInsertionPoints(host);
this._lazyDistribute(host);
}
}
var parentNeedsDist = this._parentNeedsDistribution(parent);
if (parentNeedsDist) {
this._lazyDistribute(parent);
}
return parentNeedsDist || hasContent && !wrappedContent;
},
_tryRemoveUndistributedNode: function (node) {
if (this.node.shadyRoot) {
if (node._composedParent) {
nativeRemoveChild.call(node._composedParent, node);
}
return true;
}
},
_updateInsertionPoints: function (host) {
host.shadyRoot._insertionPoints = factory(host.shadyRoot).querySelectorAll(CONTENT);
},
_nodeIsInLogicalTree: function (node) {
return Boolean(node._lightParent !== undefined || node._isShadyRoot || this._ownerShadyRootForNode(node) || node.shadyRoot);
},
_parentNeedsDistribution: function (parent) {
return parent && parent.shadyRoot && hasInsertionPoint(parent.shadyRoot);
},
_removeNodeFromHost: function (node, ensureComposedRemoval) {
var hostNeedsDist;
var root;
var parent = node._lightParent;
if (parent) {
root = this._ownerShadyRootForNode(node);
if (root) {
root.host._elementRemove(node);
hostNeedsDist = this._removeDistributedChildren(root, node);
}
this._removeLogicalInfo(node, node._lightParent);
}
this._removeOwnerShadyRoot(node);
if (root && hostNeedsDist) {
this._updateInsertionPoints(root.host);
this._lazyDistribute(root.host);
} else if (ensureComposedRemoval) {
removeFromComposedParent(parent || node.parentNode, node);
}
},
_removeDistributedChildren: function (root, container) {
var hostNeedsDist;
var ip$ = root._insertionPoints;
for (var i = 0; i < ip$.length; i++) {
var content = ip$[i];
if (this._contains(container, content)) {
var dc$ = factory(content).getDistributedNodes();
for (var j = 0; j < dc$.length; j++) {
hostNeedsDist = true;
var node = dc$[j];
var parent = node.parentNode;
if (parent) {
removeFromComposedParent(parent, node);
nativeRemoveChild.call(parent, node);
}
}
}
}
return hostNeedsDist;
},
_contains: function (container, node) {
while (node) {
if (node == container) {
return true;
}
node = factory(node).parentNode;
}
},
_addNodeToHost: function (node) {
var checkNode = node.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? node.firstChild : node;
var root = this._ownerShadyRootForNode(checkNode);
if (root) {
root.host._elementAdd(node);
}
},
_addLogicalInfo: function (node, container, index) {
saveLightChildrenIfNeeded(container);
var children = factory(container).childNodes;
index = index === undefined ? children.length : index;
if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
var c$ = Array.prototype.slice.call(node.childNodes);
for (var i = 0, n; i < c$.length && (n = c$[i]); i++) {
children.splice(index++, 0, n);
n._lightParent = container;
}
} else {
children.splice(index, 0, node);
node._lightParent = container;
}
},
_removeLogicalInfo: function (node, container) {
var children = factory(container).childNodes;
var index = children.indexOf(node);
if (index < 0 || container !== node._lightParent) {
throw Error('The node to be removed is not a child of this node');
}
children.splice(index, 1);
node._lightParent = null;
},
_removeOwnerShadyRoot: function (node) {
var hasCachedRoot = factory(node).getOwnerRoot() !== undefined;
if (hasCachedRoot) {
var c$ = factory(node).childNodes;
for (var i = 0, l = c$.length, n; i < l && (n = c$[i]); i++) {
this._removeOwnerShadyRoot(n);
}
}
node._ownerShadyRoot = undefined;
},
_firstComposedNode: function (content) {
var n$ = factory(content).getDistributedNodes();
for (var i = 0, l = n$.length, n, p$; i < l && (n = n$[i]); i++) {
p$ = factory(n).getDestinationInsertionPoints();
if (p$[p$.length - 1] === content) {
return n;
}
}
},
querySelector: function (selector) {
return this.querySelectorAll(selector)[0];
},
querySelectorAll: function (selector) {
return this._query(function (n) {
return matchesSelector.call(n, selector);
}, this.node);
},
_query: function (matcher, node) {
node = node || this.node;
var list = [];
this._queryElements(factory(node).childNodes, matcher, list);
return list;
},
_queryElements: function (elements, matcher, list) {
for (var i = 0, l = elements.length, c; i < l && (c = elements[i]); i++) {
if (c.nodeType === Node.ELEMENT_NODE) {
this._queryElement(c, matcher, list);
}
}
},
_queryElement: function (node, matcher, list) {
if (matcher(node)) {
list.push(node);
}
this._queryElements(factory(node).childNodes, matcher, list);
},
getDestinationInsertionPoints: function () {
return this.node._destinationInsertionPoints || [];
},
getDistributedNodes: function () {
return this.node._distributedNodes || [];
},
queryDistributedElements: function (selector) {
var c$ = this.childNodes;
var list = [];
this._distributedFilter(selector, c$, list);
for (var i = 0, l = c$.length, c; i < l && (c = c$[i]); i++) {
if (c.localName === CONTENT) {
this._distributedFilter(selector, factory(c).getDistributedNodes(), list);
}
}
return list;
},
_distributedFilter: function (selector, list, results) {
results = results || [];
for (var i = 0, l = list.length, d; i < l && (d = list[i]); i++) {
if (d.nodeType === Node.ELEMENT_NODE && d.localName !== CONTENT && matchesSelector.call(d, selector)) {
results.push(d);
}
}
return results;
},
_clear: function () {
while (this.childNodes.length) {
this.removeChild(this.childNodes[0]);
}
},
setAttribute: function (name, value) {
this.node.setAttribute(name, value);
this._distributeParent();
},
removeAttribute: function (name) {
this.node.removeAttribute(name);
this._distributeParent();
},
_distributeParent: function () {
if (this._parentNeedsDistribution(this.parentNode)) {
this._lazyDistribute(this.parentNode);
}
},
cloneNode: function (deep) {
var n = nativeCloneNode.call(this.node, false);
if (deep) {
var c$ = this.childNodes;
var d = factory(n);
for (var i = 0, nc; i < c$.length; i++) {
nc = factory(c$[i]).cloneNode(true);
d.appendChild(nc);
}
}
return n;
},
importNode: function (externalNode, deep) {
var doc = this.node instanceof HTMLDocument ? this.node : this.node.ownerDocument;
var n = nativeImportNode.call(doc, externalNode, false);
if (deep) {
var c$ = factory(externalNode).childNodes;
var d = factory(n);
for (var i = 0, nc; i < c$.length; i++) {
nc = factory(doc).importNode(c$[i], true);
d.appendChild(nc);
}
}
return n;
}
};
Object.defineProperty(DomApi.prototype, 'classList', {
get: function () {
if (!this._classList) {
this._classList = new DomApi.ClassList(this);
}
return this._classList;
},
configurable: true
});
DomApi.ClassList = function (host) {
this.domApi = host;
this.node = host.node;
};
DomApi.ClassList.prototype = {
add: function () {
this.node.classList.add.apply(this.node.classList, arguments);
this.domApi._distributeParent();
},
remove: function () {
this.node.classList.remove.apply(this.node.classList, arguments);
this.domApi._distributeParent();
},
toggle: function () {
this.node.classList.toggle.apply(this.node.classList, arguments);
this.domApi._distributeParent();
},
contains: function () {
return this.node.classList.contains.apply(this.node.classList, arguments);
}
};
if (!Settings.useShadow) {
Object.defineProperties(DomApi.prototype, {
childNodes: {
get: function () {
var c$ = getLightChildren(this.node);
return Array.isArray(c$) ? c$ : Array.prototype.slice.call(c$);
},
configurable: true
},
children: {
get: function () {
return Array.prototype.filter.call(this.childNodes, function (n) {
return n.nodeType === Node.ELEMENT_NODE;
});
},
configurable: true
},
parentNode: {
get: function () {
return this.node._lightParent || (this.node.__patched ? this.node._composedParent : this.node.parentNode);
},
configurable: true
},
firstChild: {
get: function () {
return this.childNodes[0];
},
configurable: true
},
lastChild: {
get: function () {
var c$ = this.childNodes;
return c$[c$.length - 1];
},
configurable: true
},
nextSibling: {
get: function () {
var c$ = this.parentNode && factory(this.parentNode).childNodes;
if (c$) {
return c$[Array.prototype.indexOf.call(c$, this.node) + 1];
}
},
configurable: true
},
previousSibling: {
get: function () {
var c$ = this.parentNode && factory(this.parentNode).childNodes;
if (c$) {
return c$[Array.prototype.indexOf.call(c$, this.node) - 1];
}
},
configurable: true
},
firstElementChild: {
get: function () {
return this.children[0];
},
configurable: true
},
lastElementChild: {
get: function () {
var c$ = this.children;
return c$[c$.length - 1];
},
configurable: true
},
nextElementSibling: {
get: function () {
var c$ = this.parentNode && factory(this.parentNode).children;
if (c$) {
return c$[Array.prototype.indexOf.call(c$, this.node) + 1];
}
},
configurable: true
},
previousElementSibling: {
get: function () {
var c$ = this.parentNode && factory(this.parentNode).children;
if (c$) {
return c$[Array.prototype.indexOf.call(c$, this.node) - 1];
}
},
configurable: true
},
textContent: {
get: function () {
if (this.node.nodeType === Node.TEXT_NODE) {
return this.node.textContent;
} else {
return Array.prototype.map.call(this.childNodes, function (c) {
return c.textContent;
}).join('');
}
},
set: function (text) {
this._clear();
if (text) {
this.appendChild(document.createTextNode(text));
}
},
configurable: true
},
innerHTML: {
get: function () {
if (this.node.nodeType === Node.TEXT_NODE) {
return null;
} else {
return getInnerHTML(this.node);
}
},
set: function (text) {
if (this.node.nodeType !== Node.TEXT_NODE) {
this._clear();
var d = document.createElement('div');
d.innerHTML = text;
var c$ = Array.prototype.slice.call(d.childNodes);
for (var i = 0; i < c$.length; i++) {
this.appendChild(c$[i]);
}
}
},
configurable: true
}
});
DomApi.prototype._getComposedInnerHTML = function () {
return getInnerHTML(this.node, true);
};
} else {
DomApi.prototype.querySelectorAll = function (selector) {
return Array.prototype.slice.call(this.node.querySelectorAll(selector));
};
DomApi.prototype.getOwnerRoot = function () {
var n = this.node;
while (n) {
if (n.nodeType === Node.DOCUMENT_FRAGMENT_NODE && n.host) {
return n;
}
n = n.parentNode;
}
};
DomApi.prototype.cloneNode = function (deep) {
return this.node.cloneNode(deep);
};
DomApi.prototype.importNode = function (externalNode, deep) {
var doc = this.node instanceof HTMLDocument ? this.node : this.node.ownerDocument;
return doc.importNode(externalNode, deep);
};
DomApi.prototype.getDestinationInsertionPoints = function () {
var n$ = this.node.getDestinationInsertionPoints();
return n$ ? Array.prototype.slice.call(n$) : [];
};
DomApi.prototype.getDistributedNodes = function () {
var n$ = this.node.getDistributedNodes();
return n$ ? Array.prototype.slice.call(n$) : [];
};
DomApi.prototype._distributeParent = function () {
};
Object.defineProperties(DomApi.prototype, {
childNodes: {
get: function () {
return Array.prototype.slice.call(this.node.childNodes);
},
configurable: true
},
children: {
get: function () {
return Array.prototype.slice.call(this.node.children);
},
configurable: true
},
textContent: {
get: function () {
return this.node.textContent;
},
set: function (value) {
return this.node.textContent = value;
},
configurable: true
},
innerHTML: {
get: function () {
return this.node.innerHTML;
},
set: function (value) {
return this.node.innerHTML = value;
},
configurable: true
}
});
var forwards = [
'parentNode',
'firstChild',
'lastChild',
'nextSibling',
'previousSibling',
'firstElementChild',
'lastElementChild',
'nextElementSibling',
'previousElementSibling'
];
forwards.forEach(function (name) {
Object.defineProperty(DomApi.prototype, name, {
get: function () {
return this.node[name];
},
configurable: true
});
});
}
var CONTENT = 'content';
var factory = function (node, patch) {
node = node || document;
if (!node.__domApi) {
node.__domApi = new DomApi(node, patch);
}
return node.__domApi;
};
Polymer.dom = function (obj, patch) {
if (obj instanceof Event) {
return Polymer.EventApi.factory(obj);
} else {
return factory(obj, patch);
}
};
Polymer.dom.flush = DomApi.prototype.flush;
function getLightChildren(node) {
var children = node._lightChildren;
return children ? children : node.childNodes;
}
function getComposedChildren(node) {
if (!node._composedChildren) {
node._composedChildren = Array.prototype.slice.call(node.childNodes);
}
return node._composedChildren;
}
function addToComposedParent(parent, node, ref_node) {
var children = getComposedChildren(parent);
var i = ref_node ? children.indexOf(ref_node) : -1;
if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
var fragChildren = getComposedChildren(node);
for (var j = 0; j < fragChildren.length; j++) {
addNodeToComposedChildren(fragChildren[j], parent, children, i + j);
}
node._composedChildren = null;
} else {
addNodeToComposedChildren(node, parent, children, i);
}
}
function addNodeToComposedChildren(node, parent, children, i) {
node._composedParent = parent;
children.splice(i >= 0 ? i : children.length, 0, node);
}
function removeFromComposedParent(parent, node) {
node._composedParent = null;
if (parent) {
var children = getComposedChildren(parent);
var i = children.indexOf(node);
if (i >= 0) {
children.splice(i, 1);
}
}
}
function saveLightChildrenIfNeeded(node) {
if (!node._lightChildren) {
var c$ = Array.prototype.slice.call(node.childNodes);
for (var i = 0, l = c$.length, child; i < l && (child = c$[i]); i++) {
child._lightParent = child._lightParent || node;
}
node._lightChildren = c$;
}
}
function hasInsertionPoint(root) {
return Boolean(root._insertionPoints.length);
}
var p = Element.prototype;
var matchesSelector = p.matches || p.matchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector || p.webkitMatchesSelector;
return {
getLightChildren: getLightChildren,
getComposedChildren: getComposedChildren,
removeFromComposedParent: removeFromComposedParent,
saveLightChildrenIfNeeded: saveLightChildrenIfNeeded,
matchesSelector: matchesSelector,
hasInsertionPoint: hasInsertionPoint,
ctor: DomApi,
factory: factory
};
}();
(function () {
Polymer.Base._addFeature({
_prepShady: function () {
this._useContent = this._useContent || Boolean(this._template);
},
_poolContent: function () {
if (this._useContent) {
saveLightChildrenIfNeeded(this);
}
},
_setupRoot: function () {
if (this._useContent) {
this._createLocalRoot();
if (!this.dataHost) {
upgradeLightChildren(this._lightChildren);
}
}
},
_createLocalRoot: function () {
this.shadyRoot = this.root;
this.shadyRoot._distributionClean = false;
this.shadyRoot._isShadyRoot = true;
this.shadyRoot._dirtyRoots = [];
this.shadyRoot._insertionPoints = !this._notes || this._notes._hasContent ? this.shadyRoot.querySelectorAll('content') : [];
saveLightChildrenIfNeeded(this.shadyRoot);
this.shadyRoot.host = this;
},
get domHost() {
var root = Polymer.dom(this).getOwnerRoot();
return root && root.host;
},
distributeContent: function (updateInsertionPoints) {
if (this.shadyRoot) {
var dom = Polymer.dom(this);
if (updateInsertionPoints) {
dom._updateInsertionPoints(this);
}
var host = getTopDistributingHost(this);
dom._lazyDistribute(host);
}
},
_distributeContent: function () {
if (this._useContent && !this.shadyRoot._distributionClean) {
this._beginDistribute();
this._distributeDirtyRoots();
this._finishDistribute();
}
},
_beginDistribute: function () {
if (this._useContent && hasInsertionPoint(this.shadyRoot)) {
this._resetDistribution();
this._distributePool(this.shadyRoot, this._collectPool());
}
},
_distributeDirtyRoots: function () {
var c$ = this.shadyRoot._dirtyRoots;
for (var i = 0, l = c$.length, c; i < l && (c = c$[i]); i++) {
c._distributeContent();
}
this.shadyRoot._dirtyRoots = [];
},
_finishDistribute: function () {
if (this._useContent) {
if (hasInsertionPoint(this.shadyRoot)) {
this._composeTree();
} else {
if (!this.shadyRoot._hasDistributed) {
this.textContent = '';
this._composedChildren = null;
this.appendChild(this.shadyRoot);
} else {
var children = this._composeNode(this);
this._updateChildNodes(this, children);
}
}
this.shadyRoot._hasDistributed = true;
this.shadyRoot._distributionClean = true;
}
},
elementMatches: function (selector, node) {
node = node || this;
return matchesSelector.call(node, selector);
},
_resetDistribution: function () {
var children = getLightChildren(this);
for (var i = 0; i < children.length; i++) {
var child = children[i];
if (child._destinationInsertionPoints) {
child._destinationInsertionPoints = undefined;
}
if (isInsertionPoint(child)) {
clearDistributedDestinationInsertionPoints(child);
}
}
var root = this.shadyRoot;
var p$ = root._insertionPoints;
for (var j = 0; j < p$.length; j++) {
p$[j]._distributedNodes = [];
}
},
_collectPool: function () {
var pool = [];
var children = getLightChildren(this);
for (var i = 0; i < children.length; i++) {
var child = children[i];
if (isInsertionPoint(child)) {
pool.push.apply(pool, child._distributedNodes);
} else {
pool.push(child);
}
}
return pool;
},
_distributePool: function (node, pool) {
var p$ = node._insertionPoints;
for (var i = 0, l = p$.length, p; i < l && (p = p$[i]); i++) {
this._distributeInsertionPoint(p, pool);
maybeRedistributeParent(p, this);
}
},
_distributeInsertionPoint: function (content, pool) {
var anyDistributed = false;
for (var i = 0, l = pool.length, node; i < l; i++) {
node = pool[i];
if (!node) {
continue;
}
if (this._matchesContentSelect(node, content)) {
distributeNodeInto(node, content);
pool[i] = undefined;
anyDistributed = true;
}
}
if (!anyDistributed) {
var children = getLightChildren(content);
for (var j = 0; j < children.length; j++) {
distributeNodeInto(children[j], content);
}
}
},
_composeTree: function () {
this._updateChildNodes(this, this._composeNode(this));
var p$ = this.shadyRoot._insertionPoints;
for (var i = 0, l = p$.length, p, parent; i < l && (p = p$[i]); i++) {
parent = p._lightParent || p.parentNode;
if (!parent._useContent && parent !== this && parent !== this.shadyRoot) {
this._updateChildNodes(parent, this._composeNode(parent));
}
}
},
_composeNode: function (node) {
var children = [];
var c$ = getLightChildren(node.shadyRoot || node);
for (var i = 0; i < c$.length; i++) {
var child = c$[i];
if (isInsertionPoint(child)) {
var distributedNodes = child._distributedNodes;
for (var j = 0; j < distributedNodes.length; j++) {
var distributedNode = distributedNodes[j];
if (isFinalDestination(child, distributedNode)) {
children.push(distributedNode);
}
}
} else {
children.push(child);
}
}
return children;
},
_updateChildNodes: function (container, children) {
var composed = getComposedChildren(container);
var splices = Polymer.ArraySplice.calculateSplices(children, composed);
for (var i = 0, d = 0, s; i < splices.length && (s = splices[i]); i++) {
for (var j = 0, n; j < s.removed.length && (n = s.removed[j]); j++) {
remove(n);
composed.splice(s.index + d, 1);
}
d -= s.addedCount;
}
for (var i = 0, s, next; i < splices.length && (s = splices[i]); i++) {
next = composed[s.index];
for (var j = s.index, n; j < s.index + s.addedCount; j++) {
n = children[j];
insertBefore(container, n, next);
composed.splice(j, 0, n);
}
}
},
_matchesContentSelect: function (node, contentElement) {
var select = contentElement.getAttribute('select');
if (!select) {
return true;
}
select = select.trim();
if (!select) {
return true;
}
if (!(node instanceof Element)) {
return false;
}
var validSelectors = /^(:not\()?[*.#[a-zA-Z_|]/;
if (!validSelectors.test(select)) {
return false;
}
return this.elementMatches(select, node);
},
_elementAdd: function () {
},
_elementRemove: function () {
}
});
var saveLightChildrenIfNeeded = Polymer.DomApi.saveLightChildrenIfNeeded;
var getLightChildren = Polymer.DomApi.getLightChildren;
var matchesSelector = Polymer.DomApi.matchesSelector;
var hasInsertionPoint = Polymer.DomApi.hasInsertionPoint;
var getComposedChildren = Polymer.DomApi.getComposedChildren;
var removeFromComposedParent = Polymer.DomApi.removeFromComposedParent;
function distributeNodeInto(child, insertionPoint) {
insertionPoint._distributedNodes.push(child);
var points = child._destinationInsertionPoints;
if (!points) {
child._destinationInsertionPoints = [insertionPoint];
} else {
points.push(insertionPoint);
}
}
function clearDistributedDestinationInsertionPoints(content) {
var e$ = content._distributedNodes;
if (e$) {
for (var i = 0; i < e$.length; i++) {
var d = e$[i]._destinationInsertionPoints;
if (d) {
d.splice(d.indexOf(content) + 1, d.length);
}
}
}
}
function maybeRedistributeParent(content, host) {
var parent = content._lightParent;
if (parent && parent.shadyRoot && hasInsertionPoint(parent.shadyRoot) && parent.shadyRoot._distributionClean) {
parent.shadyRoot._distributionClean = false;
host.shadyRoot._dirtyRoots.push(parent);
}
}
function isFinalDestination(insertionPoint, node) {
var points = node._destinationInsertionPoints;
return points && points[points.length - 1] === insertionPoint;
}
function isInsertionPoint(node) {
return node.localName == 'content';
}
var nativeInsertBefore = Element.prototype.insertBefore;
var nativeRemoveChild = Element.prototype.removeChild;
function insertBefore(parentNode, newChild, refChild) {
var newChildParent = getComposedParent(newChild);
if (newChildParent !== parentNode) {
removeFromComposedParent(newChildParent, newChild);
}
remove(newChild);
saveLightChildrenIfNeeded(parentNode);
nativeInsertBefore.call(parentNode, newChild, refChild || null);
newChild._composedParent = parentNode;
}
function remove(node) {
var parentNode = getComposedParent(node);
if (parentNode) {
saveLightChildrenIfNeeded(parentNode);
node._composedParent = null;
nativeRemoveChild.call(parentNode, node);
}
}
function getComposedParent(node) {
return node.__patched ? node._composedParent : node.parentNode;
}
function getTopDistributingHost(host) {
while (host && hostNeedsRedistribution(host)) {
host = host.domHost;
}
return host;
}
function hostNeedsRedistribution(host) {
var c$ = Polymer.dom(host).children;
for (var i = 0, c; i < c$.length; i++) {
c = c$[i];
if (c.localName === 'content') {
return host.domHost;
}
}
}
var needsUpgrade = window.CustomElements && !CustomElements.useNative;
function upgradeLightChildren(children) {
if (needsUpgrade && children) {
for (var i = 0; i < children.length; i++) {
CustomElements.upgrade(children[i]);
}
}
}
}());
if (Polymer.Settings.useShadow) {
Polymer.Base._addFeature({
_poolContent: function () {
},
_beginDistribute: function () {
},
distributeContent: function () {
},
_distributeContent: function () {
},
_finishDistribute: function () {
},
_createLocalRoot: function () {
this.createShadowRoot();
this.shadowRoot.appendChild(this.root);
this.root = this.shadowRoot;
}
});
}
Polymer.DomModule = document.createElement('dom-module');
Polymer.Base._addFeature({
_registerFeatures: function () {
this._prepIs();
this._prepAttributes();
this._prepBehaviors();
this._prepExtends();
this._prepConstructor();
this._prepTemplate();
this._prepShady();
},
_prepBehavior: function (b) {
this._addHostAttributes(b.hostAttributes);
},
_initFeatures: function () {
this._poolContent();
this._pushHost();
this._stampTemplate();
this._popHost();
this._marshalHostAttributes();
this._setupDebouncers();
this._marshalBehaviors();
this._tryReady();
},
_marshalBehavior: function (b) {
}
});
})();

})
},{"./polymer-micro.html":11}],13:[function(require,module,exports){
require("./polymer-mini.html");
document.addEventListener("DOMContentLoaded",function() {
;(function() {
Polymer.nar = [];
Polymer.Annotations = {
parseAnnotations: function (template) {
var list = [];
var content = template._content || template.content;
this._parseNodeAnnotations(content, list);
return list;
},
_parseNodeAnnotations: function (node, list) {
return node.nodeType === Node.TEXT_NODE ? this._parseTextNodeAnnotation(node, list) : this._parseElementAnnotations(node, list);
},
_testEscape: function (value) {
var escape = value.slice(0, 2);
if (escape === '{{' || escape === '[[') {
return escape;
}
},
_parseTextNodeAnnotation: function (node, list) {
var v = node.textContent;
var escape = this._testEscape(v);
if (escape) {
node.textContent = ' ';
var annote = {
bindings: [{
kind: 'text',
mode: escape[0],
value: v.slice(2, -2).trim()
}]
};
list.push(annote);
return annote;
}
},
_parseElementAnnotations: function (element, list) {
var annote = {
bindings: [],
events: []
};
if (element.localName === 'content') {
list._hasContent = true;
}
this._parseChildNodesAnnotations(element, annote, list);
if (element.attributes) {
this._parseNodeAttributeAnnotations(element, annote, list);
if (this.prepElement) {
this.prepElement(element);
}
}
if (annote.bindings.length || annote.events.length || annote.id) {
list.push(annote);
}
return annote;
},
_parseChildNodesAnnotations: function (root, annote, list, callback) {
if (root.firstChild) {
for (var i = 0, node = root.firstChild; node; node = node.nextSibling, i++) {
if (node.localName === 'template' && !node.hasAttribute('preserve-content')) {
this._parseTemplate(node, i, list, annote);
}
var childAnnotation = this._parseNodeAnnotations(node, list, callback);
if (childAnnotation) {
childAnnotation.parent = annote;
childAnnotation.index = i;
}
}
}
},
_parseTemplate: function (node, index, list, parent) {
var content = document.createDocumentFragment();
content._notes = this.parseAnnotations(node);
content.appendChild(node.content);
list.push({
bindings: Polymer.nar,
events: Polymer.nar,
templateContent: content,
parent: parent,
index: index
});
},
_parseNodeAttributeAnnotations: function (node, annotation) {
for (var i = node.attributes.length - 1, a; a = node.attributes[i]; i--) {
var n = a.name, v = a.value;
if (n === 'id' && !this._testEscape(v)) {
annotation.id = v;
} else if (n.slice(0, 3) === 'on-') {
node.removeAttribute(n);
annotation.events.push({
name: n.slice(3),
value: v
});
} else {
var b = this._parseNodeAttributeAnnotation(node, n, v);
if (b) {
annotation.bindings.push(b);
}
}
}
},
_parseNodeAttributeAnnotation: function (node, n, v) {
var escape = this._testEscape(v);
if (escape) {
var customEvent;
var name = n;
var mode = escape[0];
v = v.slice(2, -2).trim();
var not = false;
if (v[0] == '!') {
v = v.substring(1);
not = true;
}
var kind = 'property';
if (n[n.length - 1] == '$') {
name = n.slice(0, -1);
kind = 'attribute';
}
var notifyEvent, colon;
if (mode == '{' && (colon = v.indexOf('::')) > 0) {
notifyEvent = v.substring(colon + 2);
v = v.substring(0, colon);
customEvent = true;
}
if (node.localName == 'input' && n == 'value') {
node.setAttribute(n, '');
}
node.removeAttribute(n);
if (kind === 'property') {
name = Polymer.CaseMap.dashToCamelCase(name);
}
return {
kind: kind,
mode: mode,
name: name,
value: v,
negate: not,
event: notifyEvent,
customEvent: customEvent
};
}
},
_localSubTree: function (node, host) {
return node === host ? node.childNodes : node._lightChildren || node.childNodes;
},
findAnnotatedNode: function (root, annote) {
var parent = annote.parent && Polymer.Annotations.findAnnotatedNode(root, annote.parent);
return !parent ? root : Polymer.Annotations._localSubTree(parent, root)[annote.index];
}
};
(function () {
function resolveCss(cssText, ownerDocument) {
return cssText.replace(CSS_URL_RX, function (m, pre, url, post) {
return pre + '\'' + resolve(url.replace(/["']/g, ''), ownerDocument) + '\'' + post;
});
}
function resolveAttrs(element, ownerDocument) {
for (var name in URL_ATTRS) {
var a$ = URL_ATTRS[name];
for (var i = 0, l = a$.length, a, at, v; i < l && (a = a$[i]); i++) {
if (name === '*' || element.localName === name) {
at = element.attributes[a];
v = at && at.value;
if (v && v.search(BINDING_RX) < 0) {
at.value = a === 'style' ? resolveCss(v, ownerDocument) : resolve(v, ownerDocument);
}
}
}
}
}
function resolve(url, ownerDocument) {
if (url && url[0] === '#') {
return url;
}
var resolver = getUrlResolver(ownerDocument);
resolver.href = url;
return resolver.href || url;
}
var tempDoc;
var tempDocBase;
function resolveUrl(url, baseUri) {
if (!tempDoc) {
tempDoc = document.implementation.createHTMLDocument('temp');
tempDocBase = tempDoc.createElement('base');
tempDoc.head.appendChild(tempDocBase);
}
tempDocBase.href = baseUri;
return resolve(url, tempDoc);
}
function getUrlResolver(ownerDocument) {
return ownerDocument.__urlResolver || (ownerDocument.__urlResolver = ownerDocument.createElement('a'));
}
var CSS_URL_RX = /(url\()([^)]*)(\))/g;
var URL_ATTRS = {
'*': [
'href',
'src',
'style',
'url'
],
form: ['action']
};
var BINDING_RX = /\{\{|\[\[/;
Polymer.ResolveUrl = {
resolveCss: resolveCss,
resolveAttrs: resolveAttrs,
resolveUrl: resolveUrl
};
}());
Polymer.Base._addFeature({
_prepAnnotations: function () {
if (!this._template) {
this._notes = [];
} else {
Polymer.Annotations.prepElement = this._prepElement.bind(this);
this._notes = Polymer.Annotations.parseAnnotations(this._template);
this._processAnnotations(this._notes);
Polymer.Annotations.prepElement = null;
}
},
_processAnnotations: function (notes) {
for (var i = 0; i < notes.length; i++) {
var note = notes[i];
for (var j = 0; j < note.bindings.length; j++) {
var b = note.bindings[j];
b.signature = this._parseMethod(b.value);
if (!b.signature) {
b.model = this._modelForPath(b.value);
}
}
if (note.templateContent) {
this._processAnnotations(note.templateContent._notes);
var pp = note.templateContent._parentProps = this._discoverTemplateParentProps(note.templateContent._notes);
var bindings = [];
for (var prop in pp) {
bindings.push({
index: note.index,
kind: 'property',
mode: '{',
name: '_parent_' + prop,
model: prop,
value: prop
});
}
note.bindings = note.bindings.concat(bindings);
}
}
},
_discoverTemplateParentProps: function (notes) {
var pp = {};
notes.forEach(function (n) {
n.bindings.forEach(function (b) {
if (b.signature) {
var args = b.signature.args;
for (var k = 0; k < args.length; k++) {
pp[args[k].model] = true;
}
} else {
pp[b.model] = true;
}
});
if (n.templateContent) {
var tpp = n.templateContent._parentProps;
Polymer.Base.mixin(pp, tpp);
}
});
return pp;
},
_prepElement: function (element) {
Polymer.ResolveUrl.resolveAttrs(element, this._template.ownerDocument);
},
_findAnnotatedNode: Polymer.Annotations.findAnnotatedNode,
_marshalAnnotationReferences: function () {
if (this._template) {
this._marshalIdNodes();
this._marshalAnnotatedNodes();
this._marshalAnnotatedListeners();
}
},
_configureAnnotationReferences: function () {
this._configureTemplateContent();
},
_configureTemplateContent: function () {
this._notes.forEach(function (note, i) {
if (note.templateContent) {
this._nodes[i]._content = note.templateContent;
}
}, this);
},
_marshalIdNodes: function () {
this.$ = {};
this._notes.forEach(function (a) {
if (a.id) {
this.$[a.id] = this._findAnnotatedNode(this.root, a);
}
}, this);
},
_marshalAnnotatedNodes: function () {
if (this._nodes) {
this._nodes = this._nodes.map(function (a) {
return this._findAnnotatedNode(this.root, a);
}, this);
}
},
_marshalAnnotatedListeners: function () {
this._notes.forEach(function (a) {
if (a.events && a.events.length) {
var node = this._findAnnotatedNode(this.root, a);
a.events.forEach(function (e) {
this.listen(node, e.name, e.value);
}, this);
}
}, this);
}
});
Polymer.Base._addFeature({
listeners: {},
_listenListeners: function (listeners) {
var node, name, key;
for (key in listeners) {
if (key.indexOf('.') < 0) {
node = this;
name = key;
} else {
name = key.split('.');
node = this.$[name[0]];
name = name[1];
}
this.listen(node, name, listeners[key]);
}
},
listen: function (node, eventName, methodName) {
this._listen(node, eventName, this._createEventHandler(node, eventName, methodName));
},
_boundListenerKey: function (eventName, methodName) {
return eventName + ':' + methodName;
},
_recordEventHandler: function (host, eventName, target, methodName, handler) {
var hbl = host.__boundListeners;
if (!hbl) {
hbl = host.__boundListeners = new WeakMap();
}
var bl = hbl.get(target);
if (!bl) {
bl = {};
hbl.set(target, bl);
}
var key = this._boundListenerKey(eventName, methodName);
bl[key] = handler;
},
_recallEventHandler: function (host, eventName, target, methodName) {
var hbl = host.__boundListeners;
if (!hbl) {
return;
}
var bl = hbl.get(target);
if (!bl) {
return;
}
var key = this._boundListenerKey(eventName, methodName);
return bl[key];
},
_createEventHandler: function (node, eventName, methodName) {
var host = this;
var handler = function (e) {
if (host[methodName]) {
host[methodName](e, e.detail);
} else {
host._warn(host._logf('_createEventHandler', 'listener method `' + methodName + '` not defined'));
}
};
this._recordEventHandler(host, eventName, node, methodName, handler);
return handler;
},
unlisten: function (node, eventName, methodName) {
var handler = this._recallEventHandler(this, eventName, node, methodName);
if (handler) {
this._unlisten(node, eventName, handler);
}
},
_listen: function (node, eventName, handler) {
node.addEventListener(eventName, handler);
},
_unlisten: function (node, eventName, handler) {
node.removeEventListener(eventName, handler);
}
});
(function () {
'use strict';
var HAS_NATIVE_TA = typeof document.head.style.touchAction === 'string';
var GESTURE_KEY = '__polymerGestures';
var HANDLED_OBJ = '__polymerGesturesHandled';
var TOUCH_ACTION = '__polymerGesturesTouchAction';
var TAP_DISTANCE = 25;
var TRACK_DISTANCE = 5;
var TRACK_LENGTH = 2;
var MOUSE_TIMEOUT = 2500;
var MOUSE_EVENTS = [
'mousedown',
'mousemove',
'mouseup',
'click'
];
var IS_TOUCH_ONLY = navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/);
var mouseCanceller = function (mouseEvent) {
mouseEvent[HANDLED_OBJ] = { skip: true };
if (mouseEvent.type === 'click') {
var path = Polymer.dom(mouseEvent).path;
for (var i = 0; i < path.length; i++) {
if (path[i] === POINTERSTATE.mouse.target) {
return;
}
}
mouseEvent.preventDefault();
mouseEvent.stopPropagation();
}
};
function setupTeardownMouseCanceller(setup) {
for (var i = 0, en; i < MOUSE_EVENTS.length; i++) {
en = MOUSE_EVENTS[i];
if (setup) {
document.addEventListener(en, mouseCanceller, true);
} else {
document.removeEventListener(en, mouseCanceller, true);
}
}
}
function ignoreMouse() {
if (IS_TOUCH_ONLY) {
return;
}
if (!POINTERSTATE.mouse.mouseIgnoreJob) {
setupTeardownMouseCanceller(true);
}
var unset = function () {
setupTeardownMouseCanceller();
POINTERSTATE.mouse.target = null;
POINTERSTATE.mouse.mouseIgnoreJob = null;
};
POINTERSTATE.mouse.mouseIgnoreJob = Polymer.Debounce(POINTERSTATE.mouse.mouseIgnoreJob, unset, MOUSE_TIMEOUT);
}
var POINTERSTATE = {
mouse: {
target: null,
mouseIgnoreJob: null
},
touch: {
x: 0,
y: 0,
id: -1,
scrollDecided: false
}
};
function firstTouchAction(ev) {
var path = Polymer.dom(ev).path;
var ta = 'auto';
for (var i = 0, n; i < path.length; i++) {
n = path[i];
if (n[TOUCH_ACTION]) {
ta = n[TOUCH_ACTION];
break;
}
}
return ta;
}
var Gestures = {
gestures: {},
recognizers: [],
deepTargetFind: function (x, y) {
var node = document.elementFromPoint(x, y);
var next = node;
while (next && next.shadowRoot) {
next = next.shadowRoot.elementFromPoint(x, y);
if (next) {
node = next;
}
}
return node;
},
findOriginalTarget: function (ev) {
if (ev.path) {
return ev.path[0];
}
return ev.target;
},
handleNative: function (ev) {
var handled;
var type = ev.type;
var node = ev.currentTarget;
var gobj = node[GESTURE_KEY];
var gs = gobj[type];
if (!gs) {
return;
}
if (!ev[HANDLED_OBJ]) {
ev[HANDLED_OBJ] = {};
if (type.slice(0, 5) === 'touch') {
var t = ev.changedTouches[0];
if (type === 'touchstart') {
if (ev.touches.length === 1) {
POINTERSTATE.touch.id = t.identifier;
}
}
if (POINTERSTATE.touch.id !== t.identifier) {
return;
}
if (!HAS_NATIVE_TA) {
if (type === 'touchstart' || type === 'touchmove') {
Gestures.handleTouchAction(ev);
}
}
if (type === 'touchend') {
POINTERSTATE.mouse.target = Polymer.dom(ev).rootTarget;
ignoreMouse(true);
}
}
}
handled = ev[HANDLED_OBJ];
if (handled.skip) {
return;
}
var recognizers = Gestures.recognizers;
for (var i = 0, r; i < recognizers.length; i++) {
r = recognizers[i];
if (gs[r.name] && !handled[r.name]) {
handled[r.name] = true;
r[type](ev);
}
}
},
handleTouchAction: function (ev) {
var t = ev.changedTouches[0];
var type = ev.type;
if (type === 'touchstart') {
POINTERSTATE.touch.x = t.clientX;
POINTERSTATE.touch.y = t.clientY;
POINTERSTATE.touch.scrollDecided = false;
} else if (type === 'touchmove') {
if (POINTERSTATE.touch.scrollDecided) {
return;
}
POINTERSTATE.touch.scrollDecided = true;
var ta = firstTouchAction(ev);
var prevent = false;
var dx = Math.abs(POINTERSTATE.touch.x - t.clientX);
var dy = Math.abs(POINTERSTATE.touch.y - t.clientY);
if (!ev.cancelable) {
} else if (ta === 'none') {
prevent = true;
} else if (ta === 'pan-x') {
prevent = dy > dx;
} else if (ta === 'pan-y') {
prevent = dx > dy;
}
if (prevent) {
ev.preventDefault();
}
}
},
add: function (node, evType, handler) {
var recognizer = this.gestures[evType];
var deps = recognizer.deps;
var name = recognizer.name;
var gobj = node[GESTURE_KEY];
if (!gobj) {
node[GESTURE_KEY] = gobj = {};
}
for (var i = 0, dep, gd; i < deps.length; i++) {
dep = deps[i];
if (IS_TOUCH_ONLY && MOUSE_EVENTS.indexOf(dep) > -1) {
continue;
}
gd = gobj[dep];
if (!gd) {
gobj[dep] = gd = { _count: 0 };
}
if (gd._count === 0) {
node.addEventListener(dep, this.handleNative);
}
gd[name] = (gd[name] || 0) + 1;
gd._count = (gd._count || 0) + 1;
}
node.addEventListener(evType, handler);
if (recognizer.touchAction) {
this.setTouchAction(node, recognizer.touchAction);
}
},
remove: function (node, evType, handler) {
var recognizer = this.gestures[evType];
var deps = recognizer.deps;
var name = recognizer.name;
var gobj = node[GESTURE_KEY];
if (gobj) {
for (var i = 0, dep, gd; i < deps.length; i++) {
dep = deps[i];
gd = gobj[dep];
if (gd && gd[name]) {
gd[name] = (gd[name] || 1) - 1;
gd._count = (gd._count || 1) - 1;
}
if (gd._count === 0) {
node.removeEventListener(dep, this.handleNative);
}
}
}
node.removeEventListener(evType, handler);
},
register: function (recog) {
this.recognizers.push(recog);
for (var i = 0; i < recog.emits.length; i++) {
this.gestures[recog.emits[i]] = recog;
}
},
findRecognizerByEvent: function (evName) {
for (var i = 0, r; i < this.recognizers.length; i++) {
r = this.recognizers[i];
for (var j = 0, n; j < r.emits.length; j++) {
n = r.emits[j];
if (n === evName) {
return r;
}
}
}
return null;
},
setTouchAction: function (node, value) {
if (HAS_NATIVE_TA) {
node.style.touchAction = value;
}
node[TOUCH_ACTION] = value;
},
fire: function (target, type, detail) {
var ev = Polymer.Base.fire(type, detail, {
node: target,
bubbles: true,
cancelable: true
});
if (ev.defaultPrevented) {
var se = detail.sourceEvent;
if (se && se.preventDefault) {
se.preventDefault();
}
}
},
prevent: function (evName) {
var recognizer = this.findRecognizerByEvent(evName);
if (recognizer.info) {
recognizer.info.prevent = true;
}
}
};
Gestures.register({
name: 'downup',
deps: [
'mousedown',
'touchstart',
'touchend'
],
emits: [
'down',
'up'
],
mousedown: function (e) {
var t = Gestures.findOriginalTarget(e);
var self = this;
var upfn = function upfn(e) {
self.fire('up', t, e);
document.removeEventListener('mouseup', upfn);
};
document.addEventListener('mouseup', upfn);
this.fire('down', t, e);
},
touchstart: function (e) {
this.fire('down', Gestures.findOriginalTarget(e), e.changedTouches[0]);
},
touchend: function (e) {
this.fire('up', Gestures.findOriginalTarget(e), e.changedTouches[0]);
},
fire: function (type, target, event) {
var self = this;
Gestures.fire(target, type, {
x: event.clientX,
y: event.clientY,
sourceEvent: event,
prevent: Gestures.prevent.bind(Gestures)
});
}
});
Gestures.register({
name: 'track',
touchAction: 'none',
deps: [
'mousedown',
'touchstart',
'touchmove',
'touchend'
],
emits: ['track'],
info: {
x: 0,
y: 0,
state: 'start',
started: false,
moves: [],
addMove: function (move) {
if (this.moves.length > TRACK_LENGTH) {
this.moves.shift();
}
this.moves.push(move);
},
prevent: false
},
clearInfo: function () {
this.info.state = 'start';
this.info.started = false;
this.info.moves = [];
this.info.x = 0;
this.info.y = 0;
this.info.prevent = false;
},
hasMovedEnough: function (x, y) {
if (this.info.prevent) {
return false;
}
if (this.info.started) {
return true;
}
var dx = Math.abs(this.info.x - x);
var dy = Math.abs(this.info.y - y);
return dx >= TRACK_DISTANCE || dy >= TRACK_DISTANCE;
},
mousedown: function (e) {
var t = Gestures.findOriginalTarget(e);
var self = this;
var movefn = function movefn(e) {
var x = e.clientX, y = e.clientY;
if (self.hasMovedEnough(x, y)) {
self.info.state = self.info.started ? e.type === 'mouseup' ? 'end' : 'track' : 'start';
self.info.addMove({
x: x,
y: y
});
self.fire(t, e);
self.info.started = true;
}
};
var upfn = function upfn(e) {
if (self.info.started) {
Gestures.prevent('tap');
movefn(e);
}
self.clearInfo();
document.removeEventListener('mousemove', movefn);
document.removeEventListener('mouseup', upfn);
};
document.addEventListener('mousemove', movefn);
document.addEventListener('mouseup', upfn);
this.info.x = e.clientX;
this.info.y = e.clientY;
},
touchstart: function (e) {
var ct = e.changedTouches[0];
this.info.x = ct.clientX;
this.info.y = ct.clientY;
},
touchmove: function (e) {
var t = Gestures.findOriginalTarget(e);
var ct = e.changedTouches[0];
var x = ct.clientX, y = ct.clientY;
if (this.hasMovedEnough(x, y)) {
this.info.addMove({
x: x,
y: y
});
this.fire(t, ct);
this.info.state = 'track';
this.info.started = true;
}
},
touchend: function (e) {
var t = Gestures.findOriginalTarget(e);
var ct = e.changedTouches[0];
if (this.info.started) {
Gestures.prevent('tap');
this.info.state = 'end';
this.info.addMove({
x: ct.clientX,
y: ct.clientY
});
this.fire(t, ct);
}
this.clearInfo();
},
fire: function (target, touch) {
var secondlast = this.info.moves[this.info.moves.length - 2];
var lastmove = this.info.moves[this.info.moves.length - 1];
var dx = lastmove.x - this.info.x;
var dy = lastmove.y - this.info.y;
var ddx, ddy = 0;
if (secondlast) {
ddx = lastmove.x - secondlast.x;
ddy = lastmove.y - secondlast.y;
}
return Gestures.fire(target, 'track', {
state: this.info.state,
x: touch.clientX,
y: touch.clientY,
dx: dx,
dy: dy,
ddx: ddx,
ddy: ddy,
sourceEvent: touch,
hover: function () {
return Gestures.deepTargetFind(touch.clientX, touch.clientY);
}
});
}
});
Gestures.register({
name: 'tap',
deps: [
'mousedown',
'click',
'touchstart',
'touchend'
],
emits: ['tap'],
info: {
x: NaN,
y: NaN,
prevent: false
},
reset: function () {
this.info.x = NaN;
this.info.y = NaN;
this.info.prevent = false;
},
save: function (e) {
this.info.x = e.clientX;
this.info.y = e.clientY;
},
mousedown: function (e) {
this.save(e);
},
click: function (e) {
this.forward(e);
},
touchstart: function (e) {
this.save(e.changedTouches[0]);
},
touchend: function (e) {
this.forward(e.changedTouches[0]);
},
forward: function (e) {
var dx = Math.abs(e.clientX - this.info.x);
var dy = Math.abs(e.clientY - this.info.y);
var t = Gestures.findOriginalTarget(e);
if (isNaN(dx) || isNaN(dy) || dx <= TAP_DISTANCE && dy <= TAP_DISTANCE) {
if (!this.info.prevent) {
Gestures.fire(t, 'tap', {
x: e.clientX,
y: e.clientY,
sourceEvent: e
});
}
}
this.reset();
}
});
var DIRECTION_MAP = {
x: 'pan-x',
y: 'pan-y',
none: 'none',
all: 'auto'
};
Polymer.Base._addFeature({
_listen: function (node, eventName, handler) {
if (Gestures.gestures[eventName]) {
Gestures.add(node, eventName, handler);
} else {
node.addEventListener(eventName, handler);
}
},
_unlisten: function (node, eventName, handler) {
if (Gestures.gestures[eventName]) {
Gestures.remove(node, eventName, handler);
} else {
node.removeEventListener(eventName, handler);
}
},
setScrollDirection: function (direction, node) {
node = node || this;
Gestures.setTouchAction(node, DIRECTION_MAP[direction] || 'auto');
}
});
Polymer.Gestures = Gestures;
}());
Polymer.Async = {
_currVal: 0,
_lastVal: 0,
_callbacks: [],
_twiddleContent: 0,
_twiddle: document.createTextNode(''),
run: function (callback, waitTime) {
if (waitTime > 0) {
return ~setTimeout(callback, waitTime);
} else {
this._twiddle.textContent = this._twiddleContent++;
this._callbacks.push(callback);
return this._currVal++;
}
},
cancel: function (handle) {
if (handle < 0) {
clearTimeout(~handle);
} else {
var idx = handle - this._lastVal;
if (idx >= 0) {
if (!this._callbacks[idx]) {
throw 'invalid async handle: ' + handle;
}
this._callbacks[idx] = null;
}
}
},
_atEndOfMicrotask: function () {
var len = this._callbacks.length;
for (var i = 0; i < len; i++) {
var cb = this._callbacks[i];
if (cb) {
try {
cb();
} catch (e) {
i++;
this._callbacks.splice(0, i);
this._lastVal += i;
this._twiddle.textContent = this._twiddleContent++;
throw e;
}
}
}
this._callbacks.splice(0, len);
this._lastVal += len;
}
};
new (window.MutationObserver || JsMutationObserver)(Polymer.Async._atEndOfMicrotask.bind(Polymer.Async)).observe(Polymer.Async._twiddle, { characterData: true });
Polymer.Debounce = function () {
var Async = Polymer.Async;
var Debouncer = function (context) {
this.context = context;
this.boundComplete = this.complete.bind(this);
};
Debouncer.prototype = {
go: function (callback, wait) {
var h;
this.finish = function () {
Async.cancel(h);
};
h = Async.run(this.boundComplete, wait);
this.callback = callback;
},
stop: function () {
if (this.finish) {
this.finish();
this.finish = null;
}
},
complete: function () {
if (this.finish) {
this.stop();
this.callback.call(this.context);
}
}
};
function debounce(debouncer, callback, wait) {
if (debouncer) {
debouncer.stop();
} else {
debouncer = new Debouncer(this);
}
debouncer.go(callback, wait);
return debouncer;
}
return debounce;
}();
Polymer.Base._addFeature({
$$: function (slctr) {
return Polymer.dom(this.root).querySelector(slctr);
},
toggleClass: function (name, bool, node) {
node = node || this;
if (arguments.length == 1) {
bool = !node.classList.contains(name);
}
if (bool) {
Polymer.dom(node).classList.add(name);
} else {
Polymer.dom(node).classList.remove(name);
}
},
toggleAttribute: function (name, bool, node) {
node = node || this;
if (arguments.length == 1) {
bool = !node.hasAttribute(name);
}
if (bool) {
Polymer.dom(node).setAttribute(name, '');
} else {
Polymer.dom(node).removeAttribute(name);
}
},
classFollows: function (name, toElement, fromElement) {
if (fromElement) {
Polymer.dom(fromElement).classList.remove(name);
}
if (toElement) {
Polymer.dom(toElement).classList.add(name);
}
},
attributeFollows: function (name, toElement, fromElement) {
if (fromElement) {
Polymer.dom(fromElement).removeAttribute(name);
}
if (toElement) {
Polymer.dom(toElement).setAttribute(name, '');
}
},
getContentChildNodes: function (slctr) {
return Polymer.dom(Polymer.dom(this.root).querySelector(slctr || 'content')).getDistributedNodes();
},
getContentChildren: function (slctr) {
return this.getContentChildNodes(slctr).filter(function (n) {
return n.nodeType === Node.ELEMENT_NODE;
});
},
fire: function (type, detail, options) {
options = options || Polymer.nob;
var node = options.node || this;
var detail = detail === null || detail === undefined ? Polymer.nob : detail;
var bubbles = options.bubbles === undefined ? true : options.bubbles;
var cancelable = Boolean(options.cancelable);
var event = new CustomEvent(type, {
bubbles: Boolean(bubbles),
cancelable: cancelable,
detail: detail
});
node.dispatchEvent(event);
return event;
},
async: function (callback, waitTime) {
return Polymer.Async.run(callback.bind(this), waitTime);
},
cancelAsync: function (handle) {
Polymer.Async.cancel(handle);
},
arrayDelete: function (path, item) {
var index;
if (Array.isArray(path)) {
index = path.indexOf(item);
if (index >= 0) {
return path.splice(index, 1);
}
} else {
var arr = this.get(path);
index = arr.indexOf(item);
if (index >= 0) {
return this.splice(path, index, 1);
}
}
},
transform: function (transform, node) {
node = node || this;
node.style.webkitTransform = transform;
node.style.transform = transform;
},
translate3d: function (x, y, z, node) {
node = node || this;
this.transform('translate3d(' + x + ',' + y + ',' + z + ')', node);
},
importHref: function (href, onload, onerror) {
var l = document.createElement('link');
l.rel = 'import';
l.href = href;
if (onload) {
l.onload = onload.bind(this);
}
if (onerror) {
l.onerror = onerror.bind(this);
}
document.head.appendChild(l);
return l;
},
create: function (tag, props) {
var elt = document.createElement(tag);
if (props) {
for (var n in props) {
elt[n] = props[n];
}
}
return elt;
}
});
Polymer.Bind = {
prepareModel: function (model) {
model._propertyEffects = {};
model._bindListeners = [];
Polymer.Base.mixin(model, this._modelApi);
},
_modelApi: {
_notifyChange: function (property) {
var eventName = Polymer.CaseMap.camelToDashCase(property) + '-changed';
Polymer.Base.fire(eventName, { value: this[property] }, {
bubbles: false,
node: this
});
},
_propertySetter: function (property, value, effects, fromAbove) {
var old = this.__data__[property];
if (old !== value && (old === old || value === value)) {
this.__data__[property] = value;
if (typeof value == 'object') {
this._clearPath(property);
}
if (this._propertyChanged) {
this._propertyChanged(property, value, old);
}
if (effects) {
this._effectEffects(property, value, effects, old, fromAbove);
}
}
return old;
},
__setProperty: function (property, value, quiet, node) {
node = node || this;
var effects = node._propertyEffects && node._propertyEffects[property];
if (effects) {
node._propertySetter(property, value, effects, quiet);
} else {
node[property] = value;
}
},
_effectEffects: function (property, value, effects, old, fromAbove) {
effects.forEach(function (fx) {
var fn = Polymer.Bind['_' + fx.kind + 'Effect'];
if (fn) {
fn.call(this, property, value, fx.effect, old, fromAbove);
}
}, this);
},
_clearPath: function (path) {
for (var prop in this.__data__) {
if (prop.indexOf(path + '.') === 0) {
this.__data__[prop] = undefined;
}
}
}
},
ensurePropertyEffects: function (model, property) {
var fx = model._propertyEffects[property];
if (!fx) {
fx = model._propertyEffects[property] = [];
}
return fx;
},
addPropertyEffect: function (model, property, kind, effect) {
var fx = this.ensurePropertyEffects(model, property);
fx.push({
kind: kind,
effect: effect
});
},
createBindings: function (model) {
var fx$ = model._propertyEffects;
if (fx$) {
for (var n in fx$) {
var fx = fx$[n];
fx.sort(this._sortPropertyEffects);
this._createAccessors(model, n, fx);
}
}
},
_sortPropertyEffects: function () {
var EFFECT_ORDER = {
'compute': 0,
'annotation': 1,
'computedAnnotation': 2,
'reflect': 3,
'notify': 4,
'observer': 5,
'complexObserver': 6,
'function': 7
};
return function (a, b) {
return EFFECT_ORDER[a.kind] - EFFECT_ORDER[b.kind];
};
}(),
_createAccessors: function (model, property, effects) {
var defun = {
get: function () {
return this.__data__[property];
}
};
var setter = function (value) {
this._propertySetter(property, value, effects);
};
var info = model.getPropertyInfo && model.getPropertyInfo(property);
if (info && info.readOnly) {
if (!info.computed) {
model['_set' + this.upper(property)] = setter;
}
} else {
defun.set = setter;
}
Object.defineProperty(model, property, defun);
},
upper: function (name) {
return name[0].toUpperCase() + name.substring(1);
},
_addAnnotatedListener: function (model, index, property, path, event) {
var fn = this._notedListenerFactory(property, path, this._isStructured(path), this._isEventBogus);
var eventName = event || Polymer.CaseMap.camelToDashCase(property) + '-changed';
model._bindListeners.push({
index: index,
property: property,
path: path,
changedFn: fn,
event: eventName
});
},
_isStructured: function (path) {
return path.indexOf('.') > 0;
},
_isEventBogus: function (e, target) {
return e.path && e.path[0] !== target;
},
_notedListenerFactory: function (property, path, isStructured, bogusTest) {
return function (e, target) {
if (!bogusTest(e, target)) {
if (e.detail && e.detail.path) {
this.notifyPath(this._fixPath(path, property, e.detail.path), e.detail.value);
} else {
var value = target[property];
if (!isStructured) {
this[path] = target[property];
} else {
if (this.__data__[path] != value) {
this.set(path, value);
}
}
}
}
};
},
prepareInstance: function (inst) {
inst.__data__ = Object.create(null);
},
setupBindListeners: function (inst) {
inst._bindListeners.forEach(function (info) {
var node = inst._nodes[info.index];
node.addEventListener(info.event, inst._notifyListener.bind(inst, info.changedFn));
});
}
};
Polymer.Base.extend(Polymer.Bind, {
_shouldAddListener: function (effect) {
return effect.name && effect.mode === '{' && !effect.negate && effect.kind != 'attribute';
},
_annotationEffect: function (source, value, effect) {
if (source != effect.value) {
value = this.get(effect.value);
this.__data__[effect.value] = value;
}
var calc = effect.negate ? !value : value;
if (!effect.customEvent || this._nodes[effect.index][effect.name] !== calc) {
return this._applyEffectValue(calc, effect);
}
},
_reflectEffect: function (source) {
this.reflectPropertyToAttribute(source);
},
_notifyEffect: function (source, value, effect, old, fromAbove) {
if (!fromAbove) {
this._notifyChange(source);
}
},
_functionEffect: function (source, value, fn, old, fromAbove) {
fn.call(this, source, value, old, fromAbove);
},
_observerEffect: function (source, value, effect, old) {
var fn = this[effect.method];
if (fn) {
fn.call(this, value, old);
} else {
this._warn(this._logf('_observerEffect', 'observer method `' + effect.method + '` not defined'));
}
},
_complexObserverEffect: function (source, value, effect) {
var fn = this[effect.method];
if (fn) {
var args = Polymer.Bind._marshalArgs(this.__data__, effect, source, value);
if (args) {
fn.apply(this, args);
}
} else {
this._warn(this._logf('_complexObserverEffect', 'observer method `' + effect.method + '` not defined'));
}
},
_computeEffect: function (source, value, effect) {
var args = Polymer.Bind._marshalArgs(this.__data__, effect, source, value);
if (args) {
var fn = this[effect.method];
if (fn) {
this.__setProperty(effect.property, fn.apply(this, args));
} else {
this._warn(this._logf('_computeEffect', 'compute method `' + effect.method + '` not defined'));
}
}
},
_annotatedComputationEffect: function (source, value, effect) {
var computedHost = this._rootDataHost || this;
var fn = computedHost[effect.method];
if (fn) {
var args = Polymer.Bind._marshalArgs(this.__data__, effect, source, value);
if (args) {
var computedvalue = fn.apply(computedHost, args);
if (effect.negate) {
computedvalue = !computedvalue;
}
this._applyEffectValue(computedvalue, effect);
}
} else {
computedHost._warn(computedHost._logf('_annotatedComputationEffect', 'compute method `' + effect.method + '` not defined'));
}
},
_marshalArgs: function (model, effect, path, value) {
var values = [];
var args = effect.args;
for (var i = 0, l = args.length; i < l; i++) {
var arg = args[i];
var name = arg.name;
var v;
if (arg.literal) {
v = arg.value;
} else if (arg.structured) {
v = Polymer.Base.get(name, model);
} else {
v = model[name];
}
if (args.length > 1 && v === undefined) {
return;
}
if (arg.wildcard) {
var baseChanged = name.indexOf(path + '.') === 0;
var matches = effect.trigger.name.indexOf(name) === 0 && !baseChanged;
values[i] = {
path: matches ? path : name,
value: matches ? value : v,
base: v
};
} else {
values[i] = v;
}
}
return values;
}
});
Polymer.Base._addFeature({
_addPropertyEffect: function (property, kind, effect) {
Polymer.Bind.addPropertyEffect(this, property, kind, effect);
},
_prepEffects: function () {
Polymer.Bind.prepareModel(this);
this._addAnnotationEffects(this._notes);
},
_prepBindings: function () {
Polymer.Bind.createBindings(this);
},
_addPropertyEffects: function (properties) {
if (properties) {
for (var p in properties) {
var prop = properties[p];
if (prop.observer) {
this._addObserverEffect(p, prop.observer);
}
if (prop.computed) {
prop.readOnly = true;
this._addComputedEffect(p, prop.computed);
}
if (prop.notify) {
this._addPropertyEffect(p, 'notify');
}
if (prop.reflectToAttribute) {
this._addPropertyEffect(p, 'reflect');
}
if (prop.readOnly) {
Polymer.Bind.ensurePropertyEffects(this, p);
}
}
}
},
_addComputedEffect: function (name, expression) {
var sig = this._parseMethod(expression);
sig.args.forEach(function (arg) {
this._addPropertyEffect(arg.model, 'compute', {
method: sig.method,
args: sig.args,
trigger: arg,
property: name
});
}, this);
},
_addObserverEffect: function (property, observer) {
this._addPropertyEffect(property, 'observer', {
method: observer,
property: property
});
},
_addComplexObserverEffects: function (observers) {
if (observers) {
observers.forEach(function (observer) {
this._addComplexObserverEffect(observer);
}, this);
}
},
_addComplexObserverEffect: function (observer) {
var sig = this._parseMethod(observer);
sig.args.forEach(function (arg) {
this._addPropertyEffect(arg.model, 'complexObserver', {
method: sig.method,
args: sig.args,
trigger: arg
});
}, this);
},
_addAnnotationEffects: function (notes) {
this._nodes = [];
notes.forEach(function (note) {
var index = this._nodes.push(note) - 1;
note.bindings.forEach(function (binding) {
this._addAnnotationEffect(binding, index);
}, this);
}, this);
},
_addAnnotationEffect: function (note, index) {
if (Polymer.Bind._shouldAddListener(note)) {
Polymer.Bind._addAnnotatedListener(this, index, note.name, note.value, note.event);
}
if (note.signature) {
this._addAnnotatedComputationEffect(note, index);
} else {
note.index = index;
this._addPropertyEffect(note.model, 'annotation', note);
}
},
_addAnnotatedComputationEffect: function (note, index) {
var sig = note.signature;
if (sig.static) {
this.__addAnnotatedComputationEffect('__static__', index, note, sig, null);
} else {
sig.args.forEach(function (arg) {
if (!arg.literal) {
this.__addAnnotatedComputationEffect(arg.model, index, note, sig, arg);
}
}, this);
}
},
__addAnnotatedComputationEffect: function (property, index, note, sig, trigger) {
this._addPropertyEffect(property, 'annotatedComputation', {
index: index,
kind: note.kind,
property: note.name,
negate: note.negate,
method: sig.method,
args: sig.args,
trigger: trigger
});
},
_parseMethod: function (expression) {
var m = expression.match(/(\w*)\((.*)\)/);
if (m) {
var sig = {
method: m[1],
static: true
};
if (m[2].trim()) {
var args = m[2].replace(/\\,/g, '&comma;').split(',');
return this._parseArgs(args, sig);
} else {
sig.args = Polymer.nar;
return sig;
}
}
},
_parseArgs: function (argList, sig) {
sig.args = argList.map(function (rawArg) {
var arg = this._parseArg(rawArg);
if (!arg.literal) {
sig.static = false;
}
return arg;
}, this);
return sig;
},
_parseArg: function (rawArg) {
var arg = rawArg.trim().replace(/&comma;/g, ',').replace(/\\(.)/g, '$1');
var a = {
name: arg,
model: this._modelForPath(arg)
};
var fc = arg[0];
if (fc >= '0' && fc <= '9') {
fc = '#';
}
switch (fc) {
case '\'':
case '"':
a.value = arg.slice(1, -1);
a.literal = true;
break;
case '#':
a.value = Number(arg);
a.literal = true;
break;
}
if (!a.literal) {
a.structured = arg.indexOf('.') > 0;
if (a.structured) {
a.wildcard = arg.slice(-2) == '.*';
if (a.wildcard) {
a.name = arg.slice(0, -2);
}
}
}
return a;
},
_marshalInstanceEffects: function () {
Polymer.Bind.prepareInstance(this);
Polymer.Bind.setupBindListeners(this);
},
_applyEffectValue: function (value, info) {
var node = this._nodes[info.index];
var property = info.property || info.name || 'textContent';
if (info.kind == 'attribute') {
this.serializeValueToAttribute(value, property, node);
} else {
if (property === 'className') {
value = this._scopeElementClass(node, value);
}
if (property === 'textContent' || node.localName == 'input' && property == 'value') {
value = value == undefined ? '' : value;
}
return node[property] = value;
}
},
_executeStaticEffects: function () {
if (this._propertyEffects.__static__) {
this._effectEffects('__static__', null, this._propertyEffects.__static__);
}
}
});
Polymer.Base._addFeature({
_setupConfigure: function (initialConfig) {
this._config = initialConfig || {};
this._handlers = [];
},
_marshalAttributes: function () {
this._takeAttributesToModel(this._config);
},
_configValue: function (name, value) {
this._config[name] = value;
},
_beforeClientsReady: function () {
this._configure();
},
_configure: function () {
this._configureAnnotationReferences();
this._aboveConfig = this.mixin({}, this._config);
var config = {};
this.behaviors.forEach(function (b) {
this._configureProperties(b.properties, config);
}, this);
this._configureProperties(this.properties, config);
this._mixinConfigure(config, this._aboveConfig);
this._config = config;
this._distributeConfig(this._config);
},
_configureProperties: function (properties, config) {
for (var i in properties) {
var c = properties[i];
if (c.value !== undefined) {
var value = c.value;
if (typeof value == 'function') {
value = value.call(this, this._config);
}
config[i] = value;
}
}
},
_mixinConfigure: function (a, b) {
for (var prop in b) {
if (!this.getPropertyInfo(prop).readOnly) {
a[prop] = b[prop];
}
}
},
_distributeConfig: function (config) {
var fx$ = this._propertyEffects;
if (fx$) {
for (var p in config) {
var fx = fx$[p];
if (fx) {
for (var i = 0, l = fx.length, x; i < l && (x = fx[i]); i++) {
if (x.kind === 'annotation') {
var node = this._nodes[x.effect.index];
if (node._configValue) {
var value = p === x.effect.value ? config[p] : this.get(x.effect.value, config);
node._configValue(x.effect.name, value);
}
}
}
}
}
}
},
_afterClientsReady: function () {
this._executeStaticEffects();
this._applyConfig(this._config, this._aboveConfig);
this._flushHandlers();
},
_applyConfig: function (config, aboveConfig) {
for (var n in config) {
if (this[n] === undefined) {
this.__setProperty(n, config[n], n in aboveConfig);
}
}
},
_notifyListener: function (fn, e) {
if (!this._clientsReadied) {
this._queueHandler([
fn,
e,
e.target
]);
} else {
return fn.call(this, e, e.target);
}
},
_queueHandler: function (args) {
this._handlers.push(args);
},
_flushHandlers: function () {
var h$ = this._handlers;
for (var i = 0, l = h$.length, h; i < l && (h = h$[i]); i++) {
h[0].call(this, h[1], h[2]);
}
}
});
(function () {
'use strict';
Polymer.Base._addFeature({
notifyPath: function (path, value, fromAbove) {
var old = this._propertySetter(path, value);
if (old !== value && (old === old || value === value)) {
this._pathEffector(path, value);
if (!fromAbove) {
this._notifyPath(path, value);
}
return true;
}
},
_getPathParts: function (path) {
if (Array.isArray(path)) {
var parts = [];
for (var i = 0; i < path.length; i++) {
var args = path[i].toString().split('.');
for (var j = 0; j < args.length; j++) {
parts.push(args[j]);
}
}
return parts;
} else {
return path.toString().split('.');
}
},
set: function (path, value, root) {
var prop = root || this;
var parts = this._getPathParts(path);
var array;
var last = parts[parts.length - 1];
if (parts.length > 1) {
for (var i = 0; i < parts.length - 1; i++) {
prop = prop[parts[i]];
if (array) {
parts[i] = Polymer.Collection.get(array).getKey(prop);
}
if (!prop) {
return;
}
array = Array.isArray(prop) ? prop : null;
}
if (array) {
var coll = Polymer.Collection.get(array);
var old = prop[last];
var key = coll.getKey(old);
if (key) {
parts[i] = key;
coll.setItem(key, value);
}
}
prop[last] = value;
if (!root) {
this.notifyPath(parts.join('.'), value);
}
} else {
prop[path] = value;
}
},
get: function (path, root) {
var prop = root || this;
var parts = this._getPathParts(path);
var last = parts.pop();
while (parts.length) {
prop = prop[parts.shift()];
if (!prop) {
return;
}
}
return prop[last];
},
_pathEffector: function (path, value) {
var model = this._modelForPath(path);
var fx$ = this._propertyEffects[model];
if (fx$) {
fx$.forEach(function (fx) {
var fxFn = this['_' + fx.kind + 'PathEffect'];
if (fxFn) {
fxFn.call(this, path, value, fx.effect);
}
}, this);
}
if (this._boundPaths) {
this._notifyBoundPaths(path, value);
}
},
_annotationPathEffect: function (path, value, effect) {
if (effect.value === path || effect.value.indexOf(path + '.') === 0) {
Polymer.Bind._annotationEffect.call(this, path, value, effect);
} else if (path.indexOf(effect.value + '.') === 0 && !effect.negate) {
var node = this._nodes[effect.index];
if (node && node.notifyPath) {
var p = this._fixPath(effect.name, effect.value, path);
node.notifyPath(p, value, true);
}
}
},
_complexObserverPathEffect: function (path, value, effect) {
if (this._pathMatchesEffect(path, effect)) {
Polymer.Bind._complexObserverEffect.call(this, path, value, effect);
}
},
_computePathEffect: function (path, value, effect) {
if (this._pathMatchesEffect(path, effect)) {
Polymer.Bind._computeEffect.call(this, path, value, effect);
}
},
_annotatedComputationPathEffect: function (path, value, effect) {
if (this._pathMatchesEffect(path, effect)) {
Polymer.Bind._annotatedComputationEffect.call(this, path, value, effect);
}
},
_pathMatchesEffect: function (path, effect) {
var effectArg = effect.trigger.name;
return effectArg == path || effectArg.indexOf(path + '.') === 0 || effect.trigger.wildcard && path.indexOf(effectArg) === 0;
},
linkPaths: function (to, from) {
this._boundPaths = this._boundPaths || {};
if (from) {
this._boundPaths[to] = from;
} else {
this.unbindPath(to);
}
},
unlinkPaths: function (path) {
if (this._boundPaths) {
delete this._boundPaths[path];
}
},
_notifyBoundPaths: function (path, value) {
var from, to;
for (var a in this._boundPaths) {
var b = this._boundPaths[a];
if (path.indexOf(a + '.') == 0) {
from = a;
to = b;
break;
}
if (path.indexOf(b + '.') == 0) {
from = b;
to = a;
break;
}
}
if (from && to) {
var p = this._fixPath(to, from, path);
this.notifyPath(p, value);
}
},
_fixPath: function (property, root, path) {
return property + path.slice(root.length);
},
_notifyPath: function (path, value) {
var rootName = this._modelForPath(path);
var dashCaseName = Polymer.CaseMap.camelToDashCase(rootName);
var eventName = dashCaseName + this._EVENT_CHANGED;
this.fire(eventName, {
path: path,
value: value
}, { bubbles: false });
},
_modelForPath: function (path) {
var dot = path.indexOf('.');
return dot < 0 ? path : path.slice(0, dot);
},
_EVENT_CHANGED: '-changed',
_notifySplice: function (array, path, index, added, removed) {
var splices = [{
index: index,
addedCount: added,
removed: removed,
object: array,
type: 'splice'
}];
var change = {
keySplices: Polymer.Collection.applySplices(array, splices),
indexSplices: splices
};
this.set(path + '.splices', change);
if (added != removed.length) {
this.notifyPath(path + '.length', array.length);
}
change.keySplices = null;
change.indexSplices = null;
},
push: function (path) {
var array = this.get(path);
var args = Array.prototype.slice.call(arguments, 1);
var len = array.length;
var ret = array.push.apply(array, args);
this._notifySplice(array, path, len, args.length, []);
return ret;
},
pop: function (path) {
var array = this.get(path);
var args = Array.prototype.slice.call(arguments, 1);
var rem = array.slice(-1);
var ret = array.pop.apply(array, args);
this._notifySplice(array, path, array.length, 0, rem);
return ret;
},
splice: function (path, start, deleteCount) {
var array = this.get(path);
var args = Array.prototype.slice.call(arguments, 1);
var ret = array.splice.apply(array, args);
this._notifySplice(array, path, start, args.length - 2, ret);
return ret;
},
shift: function (path) {
var array = this.get(path);
var args = Array.prototype.slice.call(arguments, 1);
var ret = array.shift.apply(array, args);
this._notifySplice(array, path, 0, 0, [ret]);
return ret;
},
unshift: function (path) {
var array = this.get(path);
var args = Array.prototype.slice.call(arguments, 1);
var ret = array.unshift.apply(array, args);
this._notifySplice(array, path, 0, args.length, []);
return ret;
}
});
}());
Polymer.Base._addFeature({
resolveUrl: function (url) {
var module = Polymer.DomModule.import(this.is);
var root = '';
if (module) {
var assetPath = module.getAttribute('assetpath') || '';
root = Polymer.ResolveUrl.resolveUrl(assetPath, module.ownerDocument.baseURI);
}
return Polymer.ResolveUrl.resolveUrl(url, root);
}
});
Polymer.CssParse = function () {
var api = {
parse: function (text) {
text = this._clean(text);
return this._parseCss(this._lex(text), text);
},
_clean: function (cssText) {
return cssText.replace(rx.comments, '').replace(rx.port, '');
},
_lex: function (text) {
var root = {
start: 0,
end: text.length
};
var n = root;
for (var i = 0, s = 0, l = text.length; i < l; i++) {
switch (text[i]) {
case this.OPEN_BRACE:
if (!n.rules) {
n.rules = [];
}
var p = n;
var previous = p.rules[p.rules.length - 1];
n = {
start: i + 1,
parent: p,
previous: previous
};
p.rules.push(n);
break;
case this.CLOSE_BRACE:
n.end = i + 1;
n = n.parent || root;
break;
}
}
return root;
},
_parseCss: function (node, text) {
var t = text.substring(node.start, node.end - 1);
node.parsedCssText = node.cssText = t.trim();
if (node.parent) {
var ss = node.previous ? node.previous.end : node.parent.start;
t = text.substring(ss, node.start - 1);
t = t.substring(t.lastIndexOf(';') + 1);
var s = node.parsedSelector = node.selector = t.trim();
node.atRule = s.indexOf(AT_START) === 0;
if (node.atRule) {
if (s.indexOf(MEDIA_START) === 0) {
node.type = this.types.MEDIA_RULE;
} else if (s.match(rx.keyframesRule)) {
node.type = this.types.KEYFRAMES_RULE;
}
} else {
if (s.indexOf(VAR_START) === 0) {
node.type = this.types.MIXIN_RULE;
} else {
node.type = this.types.STYLE_RULE;
}
}
}
var r$ = node.rules;
if (r$) {
for (var i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
this._parseCss(r, text);
}
}
return node;
},
stringify: function (node, preserveProperties, text) {
text = text || '';
var cssText = '';
if (node.cssText || node.rules) {
var r$ = node.rules;
if (r$ && (preserveProperties || !hasMixinRules(r$))) {
for (var i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
cssText = this.stringify(r, preserveProperties, cssText);
}
} else {
cssText = preserveProperties ? node.cssText : removeCustomProps(node.cssText);
cssText = cssText.trim();
if (cssText) {
cssText = '  ' + cssText + '\n';
}
}
}
if (cssText) {
if (node.selector) {
text += node.selector + ' ' + this.OPEN_BRACE + '\n';
}
text += cssText;
if (node.selector) {
text += this.CLOSE_BRACE + '\n\n';
}
}
return text;
},
types: {
STYLE_RULE: 1,
KEYFRAMES_RULE: 7,
MEDIA_RULE: 4,
MIXIN_RULE: 1000
},
OPEN_BRACE: '{',
CLOSE_BRACE: '}'
};
function hasMixinRules(rules) {
return rules[0].selector.indexOf(VAR_START) >= 0;
}
function removeCustomProps(cssText) {
return cssText.replace(rx.customProp, '').replace(rx.mixinProp, '').replace(rx.mixinApply, '').replace(rx.varApply, '');
}
var VAR_START = '--';
var MEDIA_START = '@media';
var AT_START = '@';
var rx = {
comments: /\/\*[^*]*\*+([^\/*][^*]*\*+)*\//gim,
port: /@import[^;]*;/gim,
customProp: /(?:^|[\s;])--[^;{]*?:[^{};]*?(?:[;\n]|$)/gim,
mixinProp: /(?:^|[\s;])--[^;{]*?:[^{;]*?{[^}]*?}(?:[;\n]|$)?/gim,
mixinApply: /@apply[\s]*\([^)]*?\)[\s]*(?:[;\n]|$)?/gim,
varApply: /[^;:]*?:[^;]*var[^;]*(?:[;\n]|$)?/gim,
keyframesRule: /^@[^\s]*keyframes/
};
return api;
}();
Polymer.StyleUtil = function () {
return {
MODULE_STYLES_SELECTOR: 'style, link[rel=import][type~=css]',
toCssText: function (rules, callback, preserveProperties) {
if (typeof rules === 'string') {
rules = this.parser.parse(rules);
}
if (callback) {
this.forEachStyleRule(rules, callback);
}
return this.parser.stringify(rules, preserveProperties);
},
forRulesInStyles: function (styles, callback) {
for (var i = 0, l = styles.length, s; i < l && (s = styles[i]); i++) {
this.forEachStyleRule(this.rulesForStyle(s), callback);
}
},
rulesForStyle: function (style) {
if (!style.__cssRules && style.textContent) {
style.__cssRules = this.parser.parse(style.textContent);
}
return style.__cssRules;
},
clearStyleRules: function (style) {
style.__cssRules = null;
},
forEachStyleRule: function (node, callback) {
var s = node.selector;
var skipRules = false;
if (node.type === this.ruleTypes.STYLE_RULE) {
callback(node);
} else if (node.type === this.ruleTypes.KEYFRAMES_RULE || node.type === this.ruleTypes.MIXIN_RULE) {
skipRules = true;
}
var r$ = node.rules;
if (r$ && !skipRules) {
for (var i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
this.forEachStyleRule(r, callback);
}
}
},
applyCss: function (cssText, moniker, target, afterNode) {
var style = document.createElement('style');
if (moniker) {
style.setAttribute('scope', moniker);
}
style.textContent = cssText;
target = target || document.head;
if (!afterNode) {
var n$ = target.querySelectorAll('style[scope]');
afterNode = n$[n$.length - 1];
}
target.insertBefore(style, afterNode && afterNode.nextSibling || target.firstChild);
return style;
},
cssFromModule: function (moduleId) {
var m = Polymer.DomModule.import(moduleId);
if (m && !m._cssText) {
var cssText = '';
var e$ = Array.prototype.slice.call(m.querySelectorAll(this.MODULE_STYLES_SELECTOR));
for (var i = 0, e; i < e$.length; i++) {
e = e$[i];
if (e.localName === 'style') {
e = e.__appliedElement || e;
e.parentNode.removeChild(e);
} else {
e = e.import && e.import.body;
}
if (e) {
cssText += Polymer.ResolveUrl.resolveCss(e.textContent, e.ownerDocument);
}
}
m._cssText = cssText;
}
return m && m._cssText || '';
},
parser: Polymer.CssParse,
ruleTypes: Polymer.CssParse.types
};
}();
Polymer.StyleTransformer = function () {
var nativeShadow = Polymer.Settings.useNativeShadow;
var styleUtil = Polymer.StyleUtil;
var api = {
dom: function (node, scope, useAttr, shouldRemoveScope) {
this._transformDom(node, scope || '', useAttr, shouldRemoveScope);
},
_transformDom: function (node, selector, useAttr, shouldRemoveScope) {
if (node.setAttribute) {
this.element(node, selector, useAttr, shouldRemoveScope);
}
var c$ = Polymer.dom(node).childNodes;
for (var i = 0; i < c$.length; i++) {
this._transformDom(c$[i], selector, useAttr, shouldRemoveScope);
}
},
element: function (element, scope, useAttr, shouldRemoveScope) {
if (useAttr) {
if (shouldRemoveScope) {
element.removeAttribute(SCOPE_NAME);
} else {
element.setAttribute(SCOPE_NAME, scope);
}
} else {
if (scope) {
if (element.classList) {
if (shouldRemoveScope) {
element.classList.remove(SCOPE_NAME);
element.classList.remove(scope);
} else {
element.classList.add(SCOPE_NAME);
element.classList.add(scope);
}
} else if (element.getAttribute) {
var c = element.getAttribute(CLASS);
if (shouldRemoveScope) {
if (c) {
element.setAttribute(CLASS, c.replace(SCOPE_NAME, '').replace(scope, ''));
}
} else {
element.setAttribute(CLASS, c + (c ? ' ' : '') + SCOPE_NAME + ' ' + scope);
}
}
}
}
},
elementStyles: function (element, callback) {
var styles = element._styles;
var cssText = '';
for (var i = 0, l = styles.length, s, text; i < l && (s = styles[i]); i++) {
var rules = styleUtil.rulesForStyle(s);
cssText += nativeShadow ? styleUtil.toCssText(rules, callback) : this.css(rules, element.is, element.extends, callback, element._scopeCssViaAttr) + '\n\n';
}
return cssText.trim();
},
css: function (rules, scope, ext, callback, useAttr) {
var hostScope = this._calcHostScope(scope, ext);
scope = this._calcElementScope(scope, useAttr);
var self = this;
return styleUtil.toCssText(rules, function (rule) {
if (!rule.isScoped) {
self.rule(rule, scope, hostScope);
rule.isScoped = true;
}
if (callback) {
callback(rule, scope, hostScope);
}
});
},
_calcElementScope: function (scope, useAttr) {
if (scope) {
return useAttr ? CSS_ATTR_PREFIX + scope + CSS_ATTR_SUFFIX : CSS_CLASS_PREFIX + scope;
} else {
return '';
}
},
_calcHostScope: function (scope, ext) {
return ext ? '[is=' + scope + ']' : scope;
},
rule: function (rule, scope, hostScope) {
this._transformRule(rule, this._transformComplexSelector, scope, hostScope);
},
_transformRule: function (rule, transformer, scope, hostScope) {
var p$ = rule.selector.split(COMPLEX_SELECTOR_SEP);
for (var i = 0, l = p$.length, p; i < l && (p = p$[i]); i++) {
p$[i] = transformer.call(this, p, scope, hostScope);
}
rule.selector = p$.join(COMPLEX_SELECTOR_SEP);
},
_transformComplexSelector: function (selector, scope, hostScope) {
var stop = false;
var hostContext = false;
var self = this;
selector = selector.replace(SIMPLE_SELECTOR_SEP, function (m, c, s) {
if (!stop) {
var info = self._transformCompoundSelector(s, c, scope, hostScope);
stop = stop || info.stop;
hostContext = hostContext || info.hostContext;
c = info.combinator;
s = info.value;
} else {
s = s.replace(SCOPE_JUMP, ' ');
}
return c + s;
});
if (hostContext) {
selector = selector.replace(HOST_CONTEXT_PAREN, function (m, pre, paren, post) {
return pre + paren + ' ' + hostScope + post + COMPLEX_SELECTOR_SEP + ' ' + pre + hostScope + paren + post;
});
}
return selector;
},
_transformCompoundSelector: function (selector, combinator, scope, hostScope) {
var jumpIndex = selector.search(SCOPE_JUMP);
var hostContext = false;
if (selector.indexOf(HOST_CONTEXT) >= 0) {
hostContext = true;
} else if (selector.indexOf(HOST) >= 0) {
selector = selector.replace(HOST_PAREN, function (m, host, paren) {
return hostScope + paren;
});
selector = selector.replace(HOST, hostScope);
} else if (jumpIndex !== 0) {
selector = scope ? this._transformSimpleSelector(selector, scope) : selector;
}
if (selector.indexOf(CONTENT) >= 0) {
combinator = '';
}
var stop;
if (jumpIndex >= 0) {
selector = selector.replace(SCOPE_JUMP, ' ');
stop = true;
}
return {
value: selector,
combinator: combinator,
stop: stop,
hostContext: hostContext
};
},
_transformSimpleSelector: function (selector, scope) {
var p$ = selector.split(PSEUDO_PREFIX);
p$[0] += scope;
return p$.join(PSEUDO_PREFIX);
},
documentRule: function (rule) {
rule.selector = rule.parsedSelector;
this.normalizeRootSelector(rule);
if (!nativeShadow) {
this._transformRule(rule, this._transformDocumentSelector);
}
},
normalizeRootSelector: function (rule) {
if (rule.selector === ROOT) {
rule.selector = 'body';
}
},
_transformDocumentSelector: function (selector) {
return selector.match(SCOPE_JUMP) ? this._transformComplexSelector(selector, SCOPE_DOC_SELECTOR) : this._transformSimpleSelector(selector.trim(), SCOPE_DOC_SELECTOR);
},
SCOPE_NAME: 'style-scope'
};
var SCOPE_NAME = api.SCOPE_NAME;
var SCOPE_DOC_SELECTOR = ':not([' + SCOPE_NAME + '])' + ':not(.' + SCOPE_NAME + ')';
var COMPLEX_SELECTOR_SEP = ',';
var SIMPLE_SELECTOR_SEP = /(^|[\s>+~]+)([^\s>+~]+)/g;
var HOST = ':host';
var ROOT = ':root';
var HOST_PAREN = /(\:host)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/g;
var HOST_CONTEXT = ':host-context';
var HOST_CONTEXT_PAREN = /(.*)(?:\:host-context)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))(.*)/;
var CONTENT = '::content';
var SCOPE_JUMP = /\:\:content|\:\:shadow|\/deep\//;
var CSS_CLASS_PREFIX = '.';
var CSS_ATTR_PREFIX = '[' + SCOPE_NAME + '~=';
var CSS_ATTR_SUFFIX = ']';
var PSEUDO_PREFIX = ':';
var CLASS = 'class';
return api;
}();
Polymer.StyleExtends = function () {
var styleUtil = Polymer.StyleUtil;
return {
hasExtends: function (cssText) {
return Boolean(cssText.match(this.rx.EXTEND));
},
transform: function (style) {
var rules = styleUtil.rulesForStyle(style);
var self = this;
styleUtil.forEachStyleRule(rules, function (rule) {
var map = self._mapRule(rule);
if (rule.parent) {
var m;
while (m = self.rx.EXTEND.exec(rule.cssText)) {
var extend = m[1];
var extendor = self._findExtendor(extend, rule);
if (extendor) {
self._extendRule(rule, extendor);
}
}
}
rule.cssText = rule.cssText.replace(self.rx.EXTEND, '');
});
return styleUtil.toCssText(rules, function (rule) {
if (rule.selector.match(self.rx.STRIP)) {
rule.cssText = '';
}
}, true);
},
_mapRule: function (rule) {
if (rule.parent) {
var map = rule.parent.map || (rule.parent.map = {});
var parts = rule.selector.split(',');
for (var i = 0, p; i < parts.length; i++) {
p = parts[i];
map[p.trim()] = rule;
}
return map;
}
},
_findExtendor: function (extend, rule) {
return rule.parent && rule.parent.map && rule.parent.map[extend] || this._findExtendor(extend, rule.parent);
},
_extendRule: function (target, source) {
if (target.parent !== source.parent) {
this._cloneAndAddRuleToParent(source, target.parent);
}
target.extends = target.extends || (target.extends = []);
target.extends.push(source);
source.selector = source.selector.replace(this.rx.STRIP, '');
source.selector = (source.selector && source.selector + ',\n') + target.selector;
if (source.extends) {
source.extends.forEach(function (e) {
this._extendRule(target, e);
}, this);
}
},
_cloneAndAddRuleToParent: function (rule, parent) {
rule = Object.create(rule);
rule.parent = parent;
if (rule.extends) {
rule.extends = rule.extends.slice();
}
parent.rules.push(rule);
},
rx: {
EXTEND: /@extends\(([^)]*)\)\s*?;/gim,
STRIP: /%[^,]*$/
}
};
}();
(function () {
var prepElement = Polymer.Base._prepElement;
var nativeShadow = Polymer.Settings.useNativeShadow;
var styleUtil = Polymer.StyleUtil;
var styleTransformer = Polymer.StyleTransformer;
var styleExtends = Polymer.StyleExtends;
Polymer.Base._addFeature({
_prepElement: function (element) {
if (this._encapsulateStyle) {
styleTransformer.element(element, this.is, this._scopeCssViaAttr);
}
prepElement.call(this, element);
},
_prepStyles: function () {
if (this._encapsulateStyle === undefined) {
this._encapsulateStyle = !nativeShadow && Boolean(this._template);
}
this._styles = this._collectStyles();
var cssText = styleTransformer.elementStyles(this);
if (cssText && this._template) {
var style = styleUtil.applyCss(cssText, this.is, nativeShadow ? this._template.content : null);
if (!nativeShadow) {
this._scopeStyle = style;
}
}
},
_collectStyles: function () {
var styles = [];
var cssText = '', m$ = this.styleModules;
if (m$) {
for (var i = 0, l = m$.length, m; i < l && (m = m$[i]); i++) {
cssText += styleUtil.cssFromModule(m);
}
}
cssText += styleUtil.cssFromModule(this.is);
if (cssText) {
var style = document.createElement('style');
style.textContent = cssText;
if (styleExtends.hasExtends(style.textContent)) {
cssText = styleExtends.transform(style);
}
styles.push(style);
}
return styles;
},
_elementAdd: function (node) {
if (this._encapsulateStyle) {
if (node.__styleScoped) {
node.__styleScoped = false;
} else {
styleTransformer.dom(node, this.is, this._scopeCssViaAttr);
}
}
},
_elementRemove: function (node) {
if (this._encapsulateStyle) {
styleTransformer.dom(node, this.is, this._scopeCssViaAttr, true);
}
},
scopeSubtree: function (container, shouldObserve) {
if (nativeShadow) {
return;
}
var self = this;
var scopify = function (node) {
if (node.nodeType === Node.ELEMENT_NODE) {
node.className = self._scopeElementClass(node, node.className);
var n$ = node.querySelectorAll('*');
Array.prototype.forEach.call(n$, function (n) {
n.className = self._scopeElementClass(n, n.className);
});
}
};
scopify(container);
if (shouldObserve) {
var mo = new MutationObserver(function (mxns) {
mxns.forEach(function (m) {
if (m.addedNodes) {
for (var i = 0; i < m.addedNodes.length; i++) {
scopify(m.addedNodes[i]);
}
}
});
});
mo.observe(container, {
childList: true,
subtree: true
});
return mo;
}
}
});
}());
Polymer.StyleProperties = function () {
'use strict';
var nativeShadow = Polymer.Settings.useNativeShadow;
var matchesSelector = Polymer.DomApi.matchesSelector;
var styleUtil = Polymer.StyleUtil;
var styleTransformer = Polymer.StyleTransformer;
return {
decorateStyles: function (styles) {
var self = this, props = {};
styleUtil.forRulesInStyles(styles, function (rule) {
self.decorateRule(rule);
self.collectPropertiesInCssText(rule.propertyInfo.cssText, props);
});
var names = [];
for (var i in props) {
names.push(i);
}
return names;
},
decorateRule: function (rule) {
if (rule.propertyInfo) {
return rule.propertyInfo;
}
var info = {}, properties = {};
var hasProperties = this.collectProperties(rule, properties);
if (hasProperties) {
info.properties = properties;
rule.rules = null;
}
info.cssText = this.collectCssText(rule);
rule.propertyInfo = info;
return info;
},
collectProperties: function (rule, properties) {
var info = rule.propertyInfo;
if (info) {
if (info.properties) {
Polymer.Base.mixin(properties, info.properties);
return true;
}
} else {
var m, rx = this.rx.VAR_ASSIGN;
var cssText = rule.parsedCssText;
var any;
while (m = rx.exec(cssText)) {
properties[m[1]] = (m[2] || m[3]).trim();
any = true;
}
return any;
}
},
collectCssText: function (rule) {
var customCssText = '';
var cssText = rule.parsedCssText;
cssText = cssText.replace(this.rx.BRACKETED, '').replace(this.rx.VAR_ASSIGN, '');
var parts = cssText.split(';');
for (var i = 0, p; i < parts.length; i++) {
p = parts[i];
if (p.match(this.rx.MIXIN_MATCH) || p.match(this.rx.VAR_MATCH)) {
customCssText += p + ';\n';
}
}
return customCssText;
},
collectPropertiesInCssText: function (cssText, props) {
var m;
while (m = this.rx.VAR_CAPTURE.exec(cssText)) {
props[m[1]] = true;
var def = m[2];
if (def && def.match(this.rx.IS_VAR)) {
props[def] = true;
}
}
},
reify: function (props) {
var names = Object.getOwnPropertyNames(props);
for (var i = 0, n; i < names.length; i++) {
n = names[i];
props[n] = this.valueForProperty(props[n], props);
}
},
valueForProperty: function (property, props) {
if (property) {
if (property.indexOf(';') >= 0) {
property = this.valueForProperties(property, props);
} else {
var self = this;
var fn = function (all, prefix, value, fallback) {
var propertyValue = self.valueForProperty(props[value], props) || (props[fallback] ? self.valueForProperty(props[fallback], props) : fallback);
return prefix + (propertyValue || '');
};
property = property.replace(this.rx.VAR_MATCH, fn);
}
}
return property && property.trim() || '';
},
valueForProperties: function (property, props) {
var parts = property.split(';');
for (var i = 0, p, m; i < parts.length && (p = parts[i]); i++) {
m = p.match(this.rx.MIXIN_MATCH);
if (m) {
p = this.valueForProperty(props[m[1]], props);
} else {
var pp = p.split(':');
if (pp[1]) {
pp[1] = pp[1].trim();
pp[1] = this.valueForProperty(pp[1], props) || pp[1];
}
p = pp.join(':');
}
parts[i] = p && p.lastIndexOf(';') === p.length - 1 ? p.slice(0, -1) : p || '';
}
return parts.join(';');
},
applyProperties: function (rule, props) {
var output = '';
if (!rule.propertyInfo) {
this.decorateRule(rule);
}
if (rule.propertyInfo.cssText) {
output = this.valueForProperties(rule.propertyInfo.cssText, props);
}
rule.cssText = output;
},
propertyDataFromStyles: function (styles, element) {
var props = {}, self = this;
var o = [], i = 0;
styleUtil.forRulesInStyles(styles, function (rule) {
if (!rule.propertyInfo) {
self.decorateRule(rule);
}
if (element && rule.propertyInfo.properties && matchesSelector.call(element, rule.selector)) {
self.collectProperties(rule, props);
addToBitMask(i, o);
}
i++;
});
return {
properties: props,
key: o
};
},
scopePropertiesFromStyles: function (styles) {
if (!styles._scopeStyleProperties) {
styles._scopeStyleProperties = this.selectedPropertiesFromStyles(styles, this.SCOPE_SELECTORS);
}
return styles._scopeStyleProperties;
},
hostPropertiesFromStyles: function (styles) {
if (!styles._hostStyleProperties) {
styles._hostStyleProperties = this.selectedPropertiesFromStyles(styles, this.HOST_SELECTORS);
}
return styles._hostStyleProperties;
},
selectedPropertiesFromStyles: function (styles, selectors) {
var props = {}, self = this;
styleUtil.forRulesInStyles(styles, function (rule) {
if (!rule.propertyInfo) {
self.decorateRule(rule);
}
for (var i = 0; i < selectors.length; i++) {
if (rule.parsedSelector === selectors[i]) {
self.collectProperties(rule, props);
return;
}
}
});
return props;
},
transformStyles: function (element, properties, scopeSelector) {
var self = this;
var hostSelector = styleTransformer._calcHostScope(element.is, element.extends);
var rxHostSelector = element.extends ? '\\' + hostSelector.slice(0, -1) + '\\]' : hostSelector;
var hostRx = new RegExp(this.rx.HOST_PREFIX + rxHostSelector + this.rx.HOST_SUFFIX);
return styleTransformer.elementStyles(element, function (rule) {
self.applyProperties(rule, properties);
if (rule.cssText && !nativeShadow) {
self._scopeSelector(rule, hostRx, hostSelector, element._scopeCssViaAttr, scopeSelector);
}
});
},
_scopeSelector: function (rule, hostRx, hostSelector, viaAttr, scopeId) {
rule.transformedSelector = rule.transformedSelector || rule.selector;
var selector = rule.transformedSelector;
var scope = viaAttr ? '[' + styleTransformer.SCOPE_NAME + '~=' + scopeId + ']' : '.' + scopeId;
var parts = selector.split(',');
for (var i = 0, l = parts.length, p; i < l && (p = parts[i]); i++) {
parts[i] = p.match(hostRx) ? p.replace(hostSelector, hostSelector + scope) : scope + ' ' + p;
}
rule.selector = parts.join(',');
},
applyElementScopeSelector: function (element, selector, old, viaAttr) {
var c = viaAttr ? element.getAttribute(styleTransformer.SCOPE_NAME) : element.className;
var v = old ? c.replace(old, selector) : (c ? c + ' ' : '') + this.XSCOPE_NAME + ' ' + selector;
if (c !== v) {
if (viaAttr) {
element.setAttribute(styleTransformer.SCOPE_NAME, v);
} else {
element.className = v;
}
}
},
applyElementStyle: function (element, properties, selector, style) {
var cssText = style ? style.textContent || '' : this.transformStyles(element, properties, selector);
var s = element._customStyle;
if (s && !nativeShadow && s !== style) {
s._useCount--;
if (s._useCount <= 0 && s.parentNode) {
s.parentNode.removeChild(s);
}
}
if (nativeShadow || (!style || !style.parentNode)) {
if (nativeShadow && element._customStyle) {
element._customStyle.textContent = cssText;
style = element._customStyle;
} else if (cssText) {
style = styleUtil.applyCss(cssText, selector, nativeShadow ? element.root : null, element._scopeStyle);
}
}
if (style) {
style._useCount = style._useCount || 0;
if (element._customStyle != style) {
style._useCount++;
}
element._customStyle = style;
}
return style;
},
mixinCustomStyle: function (props, customStyle) {
var v;
for (var i in customStyle) {
v = customStyle[i];
if (v || v === 0) {
props[i] = v;
}
}
},
rx: {
VAR_ASSIGN: /(?:^|[;\n]\s*)(--[\w-]*?):\s*(?:([^;{]*)|{([^}]*)})(?:(?=[;\n])|$)/gi,
MIXIN_MATCH: /(?:^|\W+)@apply[\s]*\(([^)]*)\)/i,
VAR_MATCH: /(^|\W+)var\([\s]*([^,)]*)[\s]*,?[\s]*((?:[^,)]*)|(?:[^;]*\([^;)]*\)))[\s]*?\)/gi,
VAR_CAPTURE: /\([\s]*(--[^,\s)]*)(?:,[\s]*(--[^,\s)]*))?(?:\)|,)/gi,
IS_VAR: /^--/,
BRACKETED: /\{[^}]*\}/g,
HOST_PREFIX: '(?:^|[^.#[:])',
HOST_SUFFIX: '($|[.:[\\s>+~])'
},
HOST_SELECTORS: [':host'],
SCOPE_SELECTORS: [':root'],
XSCOPE_NAME: 'x-scope'
};
function addToBitMask(n, bits) {
var o = parseInt(n / 32);
var v = 1 << n % 32;
bits[o] = (bits[o] || 0) | v;
}
}();
(function () {
Polymer.StyleCache = function () {
this.cache = {};
};
Polymer.StyleCache.prototype = {
MAX: 100,
store: function (is, data, keyValues, keyStyles) {
data.keyValues = keyValues;
data.styles = keyStyles;
var s$ = this.cache[is] = this.cache[is] || [];
s$.push(data);
if (s$.length > this.MAX) {
s$.shift();
}
},
retrieve: function (is, keyValues, keyStyles) {
var cache = this.cache[is];
if (cache) {
for (var i = cache.length - 1, data; i >= 0; i--) {
data = cache[i];
if (keyStyles === data.styles && this._objectsEqual(keyValues, data.keyValues)) {
return data;
}
}
}
},
clear: function () {
this.cache = {};
},
_objectsEqual: function (target, source) {
var t, s;
for (var i in target) {
t = target[i], s = source[i];
if (!(typeof t === 'object' && t ? this._objectsStrictlyEqual(t, s) : t === s)) {
return false;
}
}
if (Array.isArray(target)) {
return target.length === source.length;
}
return true;
},
_objectsStrictlyEqual: function (target, source) {
return this._objectsEqual(target, source) && this._objectsEqual(source, target);
}
};
}());
Polymer.StyleDefaults = function () {
var styleProperties = Polymer.StyleProperties;
var styleUtil = Polymer.StyleUtil;
var StyleCache = Polymer.StyleCache;
var api = {
_styles: [],
_properties: null,
customStyle: {},
_styleCache: new StyleCache(),
addStyle: function (style) {
this._styles.push(style);
this._properties = null;
},
get _styleProperties() {
if (!this._properties) {
styleProperties.decorateStyles(this._styles);
this._styles._scopeStyleProperties = null;
this._properties = styleProperties.scopePropertiesFromStyles(this._styles);
styleProperties.mixinCustomStyle(this._properties, this.customStyle);
styleProperties.reify(this._properties);
}
return this._properties;
},
_needsStyleProperties: function () {
},
_computeStyleProperties: function () {
return this._styleProperties;
},
updateStyles: function (properties) {
this._properties = null;
if (properties) {
Polymer.Base.mixin(this.customStyle, properties);
}
this._styleCache.clear();
for (var i = 0, s; i < this._styles.length; i++) {
s = this._styles[i];
s = s.__importElement || s;
s._apply();
}
}
};
return api;
}();
(function () {
'use strict';
var serializeValueToAttribute = Polymer.Base.serializeValueToAttribute;
var propertyUtils = Polymer.StyleProperties;
var styleTransformer = Polymer.StyleTransformer;
var styleUtil = Polymer.StyleUtil;
var styleDefaults = Polymer.StyleDefaults;
var nativeShadow = Polymer.Settings.useNativeShadow;
Polymer.Base._addFeature({
_prepStyleProperties: function () {
this._ownStylePropertyNames = this._styles ? propertyUtils.decorateStyles(this._styles) : [];
},
_setupStyleProperties: function () {
this.customStyle = {};
},
_needsStyleProperties: function () {
return Boolean(this._ownStylePropertyNames && this._ownStylePropertyNames.length);
},
_beforeAttached: function () {
if (!this._scopeSelector && this._needsStyleProperties()) {
this._updateStyleProperties();
}
},
_updateStyleProperties: function () {
var info, scope = this.domHost || styleDefaults;
if (!scope._styleCache) {
scope._styleCache = new Polymer.StyleCache();
}
var scopeData = propertyUtils.propertyDataFromStyles(scope._styles, this);
scopeData.key.customStyle = this.customStyle;
info = scope._styleCache.retrieve(this.is, scopeData.key, this._styles);
var scopeCached = Boolean(info);
if (scopeCached) {
this._styleProperties = info._styleProperties;
} else {
this._computeStyleProperties(scopeData.properties);
}
this._computeOwnStyleProperties();
if (!scopeCached) {
info = styleCache.retrieve(this.is, this._ownStyleProperties, this._styles);
}
var globalCached = Boolean(info) && !scopeCached;
var style = this._applyStyleProperties(info);
if (!scopeCached) {
style = style && nativeShadow ? style.cloneNode(true) : style;
info = {
style: style,
_scopeSelector: this._scopeSelector,
_styleProperties: this._styleProperties
};
scopeData.key.customStyle = {};
this.mixin(scopeData.key.customStyle, this.customStyle);
scope._styleCache.store(this.is, info, scopeData.key, this._styles);
if (!globalCached) {
styleCache.store(this.is, Object.create(info), this._ownStyleProperties, this._styles);
}
}
},
_computeStyleProperties: function (scopeProps) {
var scope = this.domHost || styleDefaults;
if (!scope._styleProperties) {
scope._computeStyleProperties();
}
var props = Object.create(scope._styleProperties);
this.mixin(props, propertyUtils.hostPropertiesFromStyles(this._styles));
scopeProps = scopeProps || propertyUtils.propertyDataFromStyles(scope._styles, this).properties;
this.mixin(props, scopeProps);
this.mixin(props, propertyUtils.scopePropertiesFromStyles(this._styles));
propertyUtils.mixinCustomStyle(props, this.customStyle);
propertyUtils.reify(props);
this._styleProperties = props;
},
_computeOwnStyleProperties: function () {
var props = {};
for (var i = 0, n; i < this._ownStylePropertyNames.length; i++) {
n = this._ownStylePropertyNames[i];
props[n] = this._styleProperties[n];
}
this._ownStyleProperties = props;
},
_scopeCount: 0,
_applyStyleProperties: function (info) {
var oldScopeSelector = this._scopeSelector;
this._scopeSelector = info ? info._scopeSelector : this.is + '-' + this.__proto__._scopeCount++;
var style = propertyUtils.applyElementStyle(this, this._styleProperties, this._scopeSelector, info && info.style);
if (!nativeShadow) {
propertyUtils.applyElementScopeSelector(this, this._scopeSelector, oldScopeSelector, this._scopeCssViaAttr);
}
return style;
},
serializeValueToAttribute: function (value, attribute, node) {
node = node || this;
if (attribute === 'class') {
var host = node === this ? this.domHost || this.dataHost : this;
if (host) {
value = host._scopeElementClass(node, value);
}
}
node = Polymer.dom(node);
serializeValueToAttribute.call(this, value, attribute, node);
},
_scopeElementClass: function (element, selector) {
if (!nativeShadow && !this._scopeCssViaAttr) {
selector += (selector ? ' ' : '') + SCOPE_NAME + ' ' + this.is + (element._scopeSelector ? ' ' + XSCOPE_NAME + ' ' + element._scopeSelector : '');
}
return selector;
},
updateStyles: function (properties) {
if (this.isAttached) {
if (properties) {
this.mixin(this.customStyle, properties);
}
if (this._needsStyleProperties()) {
this._updateStyleProperties();
} else {
this._styleProperties = null;
}
if (this._styleCache) {
this._styleCache.clear();
}
this._updateRootStyles();
}
},
_updateRootStyles: function (root) {
root = root || this.root;
var c$ = Polymer.dom(root)._query(function (e) {
return e.shadyRoot || e.shadowRoot;
});
for (var i = 0, l = c$.length, c; i < l && (c = c$[i]); i++) {
if (c.updateStyles) {
c.updateStyles();
}
}
}
});
Polymer.updateStyles = function (properties) {
styleDefaults.updateStyles(properties);
Polymer.Base._updateRootStyles(document);
};
var styleCache = new Polymer.StyleCache();
Polymer.customStyleCache = styleCache;
var SCOPE_NAME = styleTransformer.SCOPE_NAME;
var XSCOPE_NAME = propertyUtils.XSCOPE_NAME;
}());
Polymer.Base._addFeature({
_registerFeatures: function () {
this._prepIs();
this._prepAttributes();
this._prepExtends();
this._prepConstructor();
this._prepTemplate();
this._prepStyles();
this._prepStyleProperties();
this._prepAnnotations();
this._prepEffects();
this._prepBehaviors();
this._prepBindings();
this._prepShady();
},
_prepBehavior: function (b) {
this._addPropertyEffects(b.properties);
this._addComplexObserverEffects(b.observers);
this._addHostAttributes(b.hostAttributes);
},
_initFeatures: function () {
this._poolContent();
this._setupConfigure();
this._setupStyleProperties();
this._pushHost();
this._stampTemplate();
this._popHost();
this._marshalAnnotationReferences();
this._marshalHostAttributes();
this._setupDebouncers();
this._marshalInstanceEffects();
this._marshalBehaviors();
this._marshalAttributes();
this._tryReady();
},
_marshalBehavior: function (b) {
this._listenListeners(b.listeners);
}
});
(function () {
var nativeShadow = Polymer.Settings.useNativeShadow;
var propertyUtils = Polymer.StyleProperties;
var styleUtil = Polymer.StyleUtil;
var styleDefaults = Polymer.StyleDefaults;
var styleTransformer = Polymer.StyleTransformer;
Polymer({
is: 'custom-style',
extends: 'style',
created: function () {
this._tryApply();
},
attached: function () {
this._tryApply();
},
_tryApply: function () {
if (!this._appliesToDocument) {
if (this.parentNode && this.parentNode.localName !== 'dom-module') {
this._appliesToDocument = true;
var e = this.__appliedElement || this;
styleDefaults.addStyle(e);
if (e.textContent) {
this._apply();
} else {
var observer = new MutationObserver(function () {
observer.disconnect();
this._apply();
}.bind(this));
observer.observe(e, { childList: true });
}
}
}
},
_apply: function () {
var e = this.__appliedElement || this;
this._computeStyleProperties();
var props = this._styleProperties;
var self = this;
e.textContent = styleUtil.toCssText(styleUtil.rulesForStyle(e), function (rule) {
var css = rule.cssText = rule.parsedCssText;
if (rule.propertyInfo && rule.propertyInfo.cssText) {
css = css.replace(propertyUtils.rx.VAR_ASSIGN, '');
rule.cssText = propertyUtils.valueForProperties(css, props);
}
styleTransformer.documentRule(rule);
});
}
});
}());
Polymer.Templatizer = {
properties: { __hideTemplateChildren__: { observer: '_showHideChildren' } },
_templatizerStatic: {
count: 0,
callbacks: {},
debouncer: null
},
_instanceProps: Polymer.nob,
created: function () {
this._templatizerId = this._templatizerStatic.count++;
},
templatize: function (template) {
if (!template._content) {
template._content = template.content;
}
if (template._content._ctor) {
this.ctor = template._content._ctor;
this._prepParentProperties(this.ctor.prototype, template);
return;
}
var archetype = Object.create(Polymer.Base);
this._customPrepAnnotations(archetype, template);
archetype._prepEffects();
this._customPrepEffects(archetype);
archetype._prepBehaviors();
archetype._prepBindings();
this._prepParentProperties(archetype, template);
archetype._notifyPath = this._notifyPathImpl;
archetype._scopeElementClass = this._scopeElementClassImpl;
archetype.listen = this._listenImpl;
archetype._showHideChildren = this._showHideChildrenImpl;
var _constructor = this._constructorImpl;
var ctor = function TemplateInstance(model, host) {
_constructor.call(this, model, host);
};
ctor.prototype = archetype;
archetype.constructor = ctor;
template._content._ctor = ctor;
this.ctor = ctor;
},
_getRootDataHost: function () {
return this.dataHost && this.dataHost._rootDataHost || this.dataHost;
},
_showHideChildrenImpl: function (hide) {
var c = this._children;
for (var i = 0; i < c.length; i++) {
var n = c[i];
if (n.style) {
n.style.display = hide ? 'none' : '';
n.__hideTemplateChildren__ = hide;
}
}
},
_debounceTemplate: function (fn) {
this._templatizerStatic.callbacks[this._templatizerId] = fn.bind(this);
this._templatizerStatic.debouncer = Polymer.Debounce(this._templatizerStatic.debouncer, this._flushTemplates.bind(this, true));
},
_flushTemplates: function (debouncerExpired) {
var db = this._templatizerStatic.debouncer;
while (debouncerExpired || db && db.finish) {
db.stop();
var cbs = this._templatizerStatic.callbacks;
this._templatizerStatic.callbacks = {};
for (var id in cbs) {
cbs[id]();
}
debouncerExpired = false;
}
},
_customPrepEffects: function (archetype) {
var parentProps = archetype._parentProps;
for (var prop in parentProps) {
archetype._addPropertyEffect(prop, 'function', this._createHostPropEffector(prop));
}
for (var prop in this._instanceProps) {
archetype._addPropertyEffect(prop, 'function', this._createInstancePropEffector(prop));
}
},
_customPrepAnnotations: function (archetype, template) {
archetype._template = template;
var c = template._content;
if (!c._notes) {
var rootDataHost = archetype._rootDataHost;
if (rootDataHost) {
Polymer.Annotations.prepElement = rootDataHost._prepElement.bind(rootDataHost);
}
c._notes = Polymer.Annotations.parseAnnotations(template);
Polymer.Annotations.prepElement = null;
this._processAnnotations(c._notes);
}
archetype._notes = c._notes;
archetype._parentProps = c._parentProps;
},
_prepParentProperties: function (archetype, template) {
var parentProps = this._parentProps = archetype._parentProps;
if (this._forwardParentProp && parentProps) {
var proto = archetype._parentPropProto;
var prop;
if (!proto) {
for (prop in this._instanceProps) {
delete parentProps[prop];
}
proto = archetype._parentPropProto = Object.create(null);
if (template != this) {
Polymer.Bind.prepareModel(proto);
}
for (prop in parentProps) {
var parentProp = '_parent_' + prop;
var effects = [
{
kind: 'function',
effect: this._createForwardPropEffector(prop)
},
{ kind: 'notify' }
];
Polymer.Bind._createAccessors(proto, parentProp, effects);
}
}
if (template != this) {
Polymer.Bind.prepareInstance(template);
template._forwardParentProp = this._forwardParentProp.bind(this);
}
this._extendTemplate(template, proto);
}
},
_createForwardPropEffector: function (prop) {
return function (source, value) {
this._forwardParentProp(prop, value);
};
},
_createHostPropEffector: function (prop) {
return function (source, value) {
this.dataHost['_parent_' + prop] = value;
};
},
_createInstancePropEffector: function (prop) {
return function (source, value, old, fromAbove) {
if (!fromAbove) {
this.dataHost._forwardInstanceProp(this, prop, value);
}
};
},
_extendTemplate: function (template, proto) {
Object.getOwnPropertyNames(proto).forEach(function (n) {
var val = template[n];
var pd = Object.getOwnPropertyDescriptor(proto, n);
Object.defineProperty(template, n, pd);
if (val !== undefined) {
template._propertySetter(n, val);
}
});
},
_showHideChildren: function (hidden) {
},
_forwardInstancePath: function (inst, path, value) {
},
_forwardInstanceProp: function (inst, prop, value) {
},
_notifyPathImpl: function (path, value) {
var dataHost = this.dataHost;
var dot = path.indexOf('.');
var root = dot < 0 ? path : path.slice(0, dot);
dataHost._forwardInstancePath.call(dataHost, this, path, value);
if (root in dataHost._parentProps) {
dataHost.notifyPath('_parent_' + path, value);
}
},
_pathEffector: function (path, value, fromAbove) {
if (this._forwardParentPath) {
if (path.indexOf('_parent_') === 0) {
this._forwardParentPath(path.substring(8), value);
}
}
Polymer.Base._pathEffector.apply(this, arguments);
},
_constructorImpl: function (model, host) {
this._rootDataHost = host._getRootDataHost();
this._setupConfigure(model);
this._pushHost(host);
this.root = this.instanceTemplate(this._template);
this.root.__noContent = !this._notes._hasContent;
this.root.__styleScoped = true;
this._popHost();
this._marshalAnnotatedNodes();
this._marshalInstanceEffects();
this._marshalAnnotatedListeners();
var children = [];
for (var n = this.root.firstChild; n; n = n.nextSibling) {
children.push(n);
n._templateInstance = this;
}
this._children = children;
if (host.__hideTemplateChildren__) {
this._showHideChildren(true);
}
this._tryReady();
},
_listenImpl: function (node, eventName, methodName) {
var model = this;
var host = this._rootDataHost;
var handler = host._createEventHandler(node, eventName, methodName);
var decorated = function (e) {
e.model = model;
handler(e);
};
host._listen(node, eventName, decorated);
},
_scopeElementClassImpl: function (node, value) {
var host = this._rootDataHost;
if (host) {
return host._scopeElementClass(node, value);
}
},
stamp: function (model) {
model = model || {};
if (this._parentProps) {
for (var prop in this._parentProps) {
model[prop] = this['_parent_' + prop];
}
}
return new this.ctor(model, this);
},
modelForElement: function (el) {
var model;
while (el) {
if (model = el._templateInstance) {
if (model.dataHost != this) {
el = model.dataHost;
} else {
return model;
}
} else {
el = el.parentNode;
}
}
}
};
Polymer({
is: 'dom-template',
extends: 'template',
behaviors: [Polymer.Templatizer],
ready: function () {
this.templatize(this);
}
});
Polymer._collections = new WeakMap();
Polymer.Collection = function (userArray) {
Polymer._collections.set(userArray, this);
this.userArray = userArray;
this.store = userArray.slice();
this.initMap();
};
Polymer.Collection.prototype = {
constructor: Polymer.Collection,
initMap: function () {
var omap = this.omap = new WeakMap();
var pmap = this.pmap = {};
var s = this.store;
for (var i = 0; i < s.length; i++) {
var item = s[i];
if (item && typeof item == 'object') {
omap.set(item, i);
} else {
pmap[item] = i;
}
}
},
add: function (item) {
var key = this.store.push(item) - 1;
if (item && typeof item == 'object') {
this.omap.set(item, key);
} else {
this.pmap[item] = key;
}
return key;
},
removeKey: function (key) {
this._removeFromMap(this.store[key]);
delete this.store[key];
},
_removeFromMap: function (item) {
if (item && typeof item == 'object') {
this.omap.delete(item);
} else {
delete this.pmap[item];
}
},
remove: function (item) {
var key = this.getKey(item);
this.removeKey(key);
return key;
},
getKey: function (item) {
if (item && typeof item == 'object') {
return this.omap.get(item);
} else {
return this.pmap[item];
}
},
getKeys: function () {
return Object.keys(this.store);
},
setItem: function (key, item) {
var old = this.store[key];
if (old) {
this._removeFromMap(old);
}
if (item && typeof item == 'object') {
this.omap.set(item, key);
} else {
this.pmap[item] = key;
}
this.store[key] = item;
},
getItem: function (key) {
return this.store[key];
},
getItems: function () {
var items = [], store = this.store;
for (var key in store) {
items.push(store[key]);
}
return items;
},
_applySplices: function (splices) {
var keySplices = [];
for (var i = 0; i < splices.length; i++) {
var j, o, key, s = splices[i];
var removed = [];
for (j = 0; j < s.removed.length; j++) {
o = s.removed[j];
key = this.remove(o);
removed.push(key);
}
var added = [];
for (j = 0; j < s.addedCount; j++) {
o = this.userArray[s.index + j];
key = this.add(o);
added.push(key);
}
keySplices.push({
index: s.index,
removed: removed,
removedItems: s.removed,
added: added
});
}
return keySplices;
}
};
Polymer.Collection.get = function (userArray) {
return Polymer._collections.get(userArray) || new Polymer.Collection(userArray);
};
Polymer.Collection.applySplices = function (userArray, splices) {
var coll = Polymer._collections.get(userArray);
return coll ? coll._applySplices(splices) : null;
};
Polymer({
is: 'dom-repeat',
extends: 'template',
properties: {
items: { type: Array },
as: {
type: String,
value: 'item'
},
indexAs: {
type: String,
value: 'index'
},
sort: {
type: Function,
observer: '_sortChanged'
},
filter: {
type: Function,
observer: '_filterChanged'
},
observe: {
type: String,
observer: '_observeChanged'
},
delay: Number
},
behaviors: [Polymer.Templatizer],
observers: ['_itemsChanged(items.*)'],
detached: function () {
if (this.rows) {
for (var i = 0; i < this.rows.length; i++) {
this._detachRow(i);
}
}
},
attached: function () {
if (this.rows) {
var parentNode = Polymer.dom(this).parentNode;
for (var i = 0; i < this.rows.length; i++) {
Polymer.dom(parentNode).insertBefore(this.rows[i].root, this);
}
}
},
ready: function () {
this._instanceProps = { __key__: true };
this._instanceProps[this.as] = true;
this._instanceProps[this.indexAs] = true;
if (!this.ctor) {
this.templatize(this);
}
},
_sortChanged: function () {
var dataHost = this._getRootDataHost();
var sort = this.sort;
this._sortFn = sort && (typeof sort == 'function' ? sort : function () {
return dataHost[sort].apply(dataHost, arguments);
});
this._fullRefresh = true;
if (this.items) {
this._debounceTemplate(this._render);
}
},
_filterChanged: function () {
var dataHost = this._getRootDataHost();
var filter = this.filter;
this._filterFn = filter && (typeof filter == 'function' ? filter : function () {
return dataHost[filter].apply(dataHost, arguments);
});
this._fullRefresh = true;
if (this.items) {
this._debounceTemplate(this._render);
}
},
_observeChanged: function () {
this._observePaths = this.observe && this.observe.replace('.*', '.').split(' ');
},
_itemsChanged: function (change) {
if (change.path == 'items') {
if (Array.isArray(this.items)) {
this.collection = Polymer.Collection.get(this.items);
} else if (!this.items) {
this.collection = null;
} else {
this._error(this._logf('dom-repeat', 'expected array for `items`,' + ' found', this.items));
}
this._splices = [];
this._fullRefresh = true;
this._debounceTemplate(this._render);
} else if (change.path == 'items.splices') {
this._splices = this._splices.concat(change.value.keySplices);
this._debounceTemplate(this._render);
} else {
var subpath = change.path.slice(6);
this._forwardItemPath(subpath, change.value);
this._checkObservedPaths(subpath);
}
},
_checkObservedPaths: function (path) {
if (this._observePaths) {
path = path.substring(path.indexOf('.') + 1);
var paths = this._observePaths;
for (var i = 0; i < paths.length; i++) {
if (path.indexOf(paths[i]) === 0) {
this._fullRefresh = true;
if (this.delay) {
this.debounce('render', this._render, this.delay);
} else {
this._debounceTemplate(this._render);
}
return;
}
}
}
},
render: function () {
this._fullRefresh = true;
this._debounceTemplate(this._render);
this._flushTemplates();
},
_render: function () {
var c = this.collection;
if (!this._fullRefresh) {
if (this._sortFn) {
this._applySplicesViewSort(this._splices);
} else {
if (this._filterFn) {
this._fullRefresh = true;
} else {
this._applySplicesArraySort(this._splices);
}
}
}
if (this._fullRefresh) {
this._sortAndFilter();
this._fullRefresh = false;
}
this._splices = [];
var rowForKey = this._rowForKey = {};
var keys = this._orderedKeys;
this.rows = this.rows || [];
for (var i = 0; i < keys.length; i++) {
var key = keys[i];
var item = c.getItem(key);
var row = this.rows[i];
rowForKey[key] = i;
if (!row) {
this.rows.push(row = this._insertRow(i, null, item));
}
row.__setProperty(this.as, item, true);
row.__setProperty('__key__', key, true);
row.__setProperty(this.indexAs, i, true);
}
for (; i < this.rows.length; i++) {
this._detachRow(i);
}
this.rows.splice(keys.length, this.rows.length - keys.length);
this.fire('dom-change');
},
_sortAndFilter: function () {
var c = this.collection;
if (!this._sortFn) {
this._orderedKeys = [];
var items = this.items;
if (items) {
for (var i = 0; i < items.length; i++) {
this._orderedKeys.push(c.getKey(items[i]));
}
}
} else {
this._orderedKeys = c ? c.getKeys() : [];
}
if (this._filterFn) {
this._orderedKeys = this._orderedKeys.filter(function (a) {
return this._filterFn(c.getItem(a));
}, this);
}
if (this._sortFn) {
this._orderedKeys.sort(function (a, b) {
return this._sortFn(c.getItem(a), c.getItem(b));
}.bind(this));
}
},
_keySort: function (a, b) {
return this.collection.getKey(a) - this.collection.getKey(b);
},
_applySplicesViewSort: function (splices) {
var c = this.collection;
var keys = this._orderedKeys;
var rows = this.rows;
var removedRows = [];
var addedKeys = [];
var pool = [];
var sortFn = this._sortFn || this._keySort.bind(this);
splices.forEach(function (s) {
for (var i = 0; i < s.removed.length; i++) {
var idx = this._rowForKey[s.removed[i]];
if (idx != null) {
removedRows.push(idx);
}
}
for (var i = 0; i < s.added.length; i++) {
addedKeys.push(s.added[i]);
}
}, this);
if (removedRows.length) {
removedRows.sort();
for (var i = removedRows.length - 1; i >= 0; i--) {
var idx = removedRows[i];
pool.push(this._detachRow(idx));
rows.splice(idx, 1);
keys.splice(idx, 1);
}
}
if (addedKeys.length) {
if (this._filterFn) {
addedKeys = addedKeys.filter(function (a) {
return this._filterFn(c.getItem(a));
}, this);
}
addedKeys.sort(function (a, b) {
return this._sortFn(c.getItem(a), c.getItem(b));
}.bind(this));
var start = 0;
for (var i = 0; i < addedKeys.length; i++) {
start = this._insertRowIntoViewSort(start, addedKeys[i], pool);
}
}
},
_insertRowIntoViewSort: function (start, key, pool) {
var c = this.collection;
var item = c.getItem(key);
var end = this.rows.length - 1;
var idx = -1;
var sortFn = this._sortFn || this._keySort.bind(this);
while (start <= end) {
var mid = start + end >> 1;
var midKey = this._orderedKeys[mid];
var cmp = sortFn(c.getItem(midKey), item);
if (cmp < 0) {
start = mid + 1;
} else if (cmp > 0) {
end = mid - 1;
} else {
idx = mid;
break;
}
}
if (idx < 0) {
idx = end + 1;
}
this._orderedKeys.splice(idx, 0, key);
this.rows.splice(idx, 0, this._insertRow(idx, pool, c.getItem(key)));
return idx;
},
_applySplicesArraySort: function (splices) {
var keys = this._orderedKeys;
var pool = [];
splices.forEach(function (s) {
for (var i = 0; i < s.removed.length; i++) {
pool.push(this._detachRow(s.index + i));
}
this.rows.splice(s.index, s.removed.length);
}, this);
var c = this.collection;
splices.forEach(function (s) {
var args = [
s.index,
s.removed.length
].concat(s.added);
keys.splice.apply(keys, args);
for (var i = 0; i < s.added.length; i++) {
var item = c.getItem(s.added[i]);
var row = this._insertRow(s.index + i, pool, item);
this.rows.splice(s.index + i, 0, row);
}
}, this);
},
_detachRow: function (idx) {
var row = this.rows[idx];
var parentNode = Polymer.dom(this).parentNode;
for (var i = 0; i < row._children.length; i++) {
var el = row._children[i];
Polymer.dom(row.root).appendChild(el);
}
return row;
},
_insertRow: function (idx, pool, item) {
var row = pool && pool.pop() || this._generateRow(idx, item);
var beforeRow = this.rows[idx];
var beforeNode = beforeRow ? beforeRow._children[0] : this;
var parentNode = Polymer.dom(this).parentNode;
Polymer.dom(parentNode).insertBefore(row.root, beforeNode);
return row;
},
_generateRow: function (idx, item) {
var model = { __key__: this.collection.getKey(item) };
model[this.as] = item;
model[this.indexAs] = idx;
var row = this.stamp(model);
return row;
},
_showHideChildren: function (hidden) {
if (this.rows) {
for (var i = 0; i < this.rows.length; i++) {
this.rows[i]._showHideChildren(hidden);
}
}
},
_forwardInstanceProp: function (row, prop, value) {
if (prop == this.as) {
var idx;
if (this._sortFn || this._filterFn) {
idx = this.items.indexOf(this.collection.getItem(row.__key__));
} else {
idx = row[this.indexAs];
}
this.set('items.' + idx, value);
}
},
_forwardInstancePath: function (row, path, value) {
if (path.indexOf(this.as + '.') === 0) {
this.notifyPath('items.' + row.__key__ + '.' + path.slice(this.as.length + 1), value);
}
},
_forwardParentProp: function (prop, value) {
if (this.rows) {
this.rows.forEach(function (row) {
row.__setProperty(prop, value, true);
}, this);
}
},
_forwardParentPath: function (path, value) {
if (this.rows) {
this.rows.forEach(function (row) {
row.notifyPath(path, value, true);
}, this);
}
},
_forwardItemPath: function (path, value) {
if (this._rowForKey) {
var dot = path.indexOf('.');
var key = path.substring(0, dot < 0 ? path.length : dot);
var idx = this._rowForKey[key];
var row = this.rows[idx];
if (row) {
if (dot >= 0) {
path = this.as + '.' + path.substring(dot + 1);
row.notifyPath(path, value, true);
} else {
row.__setProperty(this.as, value, true);
}
}
}
},
itemForElement: function (el) {
var instance = this.modelForElement(el);
return instance && instance[this.as];
},
keyForElement: function (el) {
var instance = this.modelForElement(el);
return instance && instance.__key__;
},
indexForElement: function (el) {
var instance = this.modelForElement(el);
return instance && instance[this.indexAs];
}
});
Polymer({
is: 'array-selector',
properties: {
items: {
type: Array,
observer: '_itemsChanged'
},
selected: {
type: Object,
notify: true
},
toggle: Boolean,
multi: Boolean
},
_itemsChanged: function () {
if (Array.isArray(this.selected)) {
for (var i = 0; i < this.selected.length; i++) {
this.unlinkPaths('selected.' + i);
}
} else {
this.unlinkPaths('selected');
}
if (this.multi) {
this.selected = [];
} else {
this.selected = null;
}
},
deselect: function (item) {
if (this.multi) {
var scol = Polymer.Collection.get(this.selected);
var sidx = this.selected.indexOf(item);
if (sidx >= 0) {
var skey = scol.getKey(item);
this.splice('selected', sidx, 1);
this.unlinkPaths('selected.' + skey);
return true;
}
} else {
this.selected = null;
this.unlinkPaths('selected');
}
},
select: function (item) {
var icol = Polymer.Collection.get(this.items);
var key = icol.getKey(item);
if (this.multi) {
var scol = Polymer.Collection.get(this.selected);
var skey = scol.getKey(item);
if (skey >= 0) {
if (this.toggle) {
this.deselect(item);
}
} else {
this.push('selected', item);
this.async(function () {
skey = scol.getKey(item);
this.linkPaths('selected.' + skey, 'items.' + key);
});
}
} else {
if (this.toggle && item == this.selected) {
this.deselect();
} else {
this.linkPaths('selected', 'items.' + key);
this.selected = item;
}
}
}
});
Polymer({
is: 'dom-if',
extends: 'template',
properties: {
'if': {
type: Boolean,
value: false,
observer: '_queueRender'
},
restamp: {
type: Boolean,
value: false,
observer: '_queueRender'
}
},
behaviors: [Polymer.Templatizer],
_queueRender: function () {
this._debounceTemplate(this._render);
},
detached: function () {
this._teardownInstance();
},
attached: function () {
if (this.if && this.ctor) {
this.async(this._ensureInstance);
}
},
render: function () {
this._flushTemplates();
},
_render: function () {
if (this.if) {
if (!this.ctor) {
this._wrapTextNodes(this._content || this.content);
this.templatize(this);
}
this._ensureInstance();
this._showHideChildren();
} else if (this.restamp) {
this._teardownInstance();
}
if (!this.restamp && this._instance) {
this._showHideChildren();
}
if (this.if != this._lastIf) {
this.fire('dom-change');
this._lastIf = this.if;
}
},
_ensureInstance: function () {
if (!this._instance) {
this._instance = this.stamp();
var root = this._instance.root;
var parent = Polymer.dom(Polymer.dom(this).parentNode);
parent.insertBefore(root, this);
}
},
_teardownInstance: function () {
if (this._instance) {
var c = this._instance._children;
if (c) {
var parent = Polymer.dom(Polymer.dom(c[0]).parentNode);
c.forEach(function (n) {
parent.removeChild(n);
});
}
this._instance = null;
}
},
_wrapTextNodes: function (root) {
for (var n = root.firstChild; n; n = n.nextSibling) {
if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) {
var s = document.createElement('span');
root.insertBefore(s, n);
s.appendChild(n);
n = s;
}
}
},
_showHideChildren: function () {
var hidden = this.__hideTemplateChildren__ || !this.if;
if (this._instance) {
this._instance._showHideChildren(hidden);
}
},
_forwardParentProp: function (prop, value) {
if (this._instance) {
this._instance[prop] = value;
}
},
_forwardParentPath: function (path, value) {
if (this._instance) {
this._instance.notifyPath(path, value, true);
}
}
});
Polymer.ImportStatus = {
_ready: false,
_callbacks: [],
whenLoaded: function (cb) {
if (this._ready) {
cb();
} else {
this._callbacks.push(cb);
}
},
_importsLoaded: function () {
this._ready = true;
this._callbacks.forEach(function (cb) {
cb();
});
this._callbacks = [];
}
};
window.addEventListener('load', function () {
Polymer.ImportStatus._importsLoaded();
});
if (window.HTMLImports) {
HTMLImports.whenReady(function () {
Polymer.ImportStatus._importsLoaded();
});
}
Polymer({
is: 'dom-bind',
extends: 'template',
created: function () {
Polymer.ImportStatus.whenLoaded(this._readySelf.bind(this));
},
_registerFeatures: function () {
this._prepExtends();
this._prepConstructor();
},
_insertChildren: function () {
var parentDom = Polymer.dom(Polymer.dom(this).parentNode);
parentDom.insertBefore(this.root, this);
},
_removeChildren: function () {
if (this._children) {
for (var i = 0; i < this._children.length; i++) {
this.root.appendChild(this._children[i]);
}
}
},
_initFeatures: function () {
},
_scopeElementClass: function (element, selector) {
if (this.dataHost) {
return this.dataHost._scopeElementClass(element, selector);
} else {
return selector;
}
},
_prepConfigure: function () {
var config = {};
for (var prop in this._propertyEffects) {
config[prop] = this[prop];
}
this._setupConfigure = this._setupConfigure.bind(this, config);
},
attached: function () {
if (!this._children) {
this._template = this;
this._prepAnnotations();
this._prepEffects();
this._prepBehaviors();
this._prepConfigure();
this._prepBindings();
Polymer.Base._initFeatures.call(this);
this._children = Array.prototype.slice.call(this.root.childNodes);
}
this._insertChildren();
this.fire('dom-change');
},
detached: function () {
this._removeChildren();
}
});
})();

})
},{"./polymer-mini.html":12}],14:[function(require,module,exports){
document.addEventListener("DOMContentLoaded",function() {
var body = document.getElementsByTagName("body")[0];
var root = body.appendChild(document.createElement("div"));
root.setAttribute("hidden","");
root.innerHTML="<dom-module id=\"login-form\"><template><status></status><iron-collapse id=\"login\"><login-actions><a href=\"/auth/twitter\"><paper-button id=\"login-button\" class=\"primary\">Login with Twitter</paper-button></a><a href=\"/auth/github\"><paper-button id=\"login-button\" class=\"primary\">Login with Github</paper-button></a></login-actions></iron-collapse><iron-collapse id=\"register\"><input placeholder=\"Name\"><input placeholder=\"Email\"><input placeholder=\"Password\"><login-actions><paper-button id=\"register-button\" class=\"primary\">Register</paper-button><paper-button id=\"cancel-register-button\" class=\"aside\">Cancel</paper-button></login-actions></iron-collapse></template></dom-module><style>input{display:block;margin-bottom:10px;width:100%}h1{margin-bottom:10px}login-actions{display:block;margin-top:20px}</style>";
;(function() {
Polymer({

  is: "login-form",
  
  listeners: {
    'login-button.tap': 'login',
    //- 'show-register-button.tap': 'showRegister',
    'register-button.tap': 'register',
    'cancel-register-button.tap': 'cancelRegister'
  },
  
  //- LOCKER & LOADED
  ready : function() {
  
    var Socket  = window.socket;
    //- Gabba.Login.init();
    this.$.login.toggle(); // show login form
    
    Socket.on('user:connected', function( data ) {
      console.log('user connected:');
      console.log(data);
    });
    
  },
  
  //- PROCESS LOGIN
  login : function() {
  
    //- var u = this.$.username.value,
        //- e = this.$.email.value,
    var Socket  = window.socket;
        
        console.log('user.login()');
    
    //- this.socket = window.socket = io.connect( server );
    
    //- SEND LOGIN TO SOCKET
    Socket.emit('user:login', {});

  },
  
  //- PROCESS REGISTRATION
  register : function() {
    console.info('register user');
  },
  
  //- SHOW REGISTER FORM
  showRegister : function() {
    this.$.register.toggle();
    this.$.login.toggle();
  },
  
  //- HIDE REGISTER FORM
  cancelRegister : function() {      
    this.$.register.toggle();
    this.$.login.toggle();
  }

});
})();

})
},{}],15:[function(require,module,exports){
document.addEventListener("DOMContentLoaded",function() {
var body = document.getElementsByTagName("body")[0];
var root = body.appendChild(document.createElement("div"));
root.setAttribute("hidden","");
root.innerHTML="<dom-module id=\"register-form\"><template><img src=\"undefined\" class=\"avatar\"><h1>Hi </h1><h3>We've pulled in you information from , just select a username and you're good to go!</h3><section class=\"required\"><label>username</label><input id=\"username\" placeholder=\"mr.ramone\" value=\"undefined\" class=\"ok\"></section><section class=\"optional\"><h2>Edit Your Info</h2><input placeholder=\"Name\" value=\"undefined\"><input placeholder=\"Email\"><label>Create a password (optional)</label><input placeholder=\"Password\"></section></template></dom-module><style>input{display:block;margin-bottom:10px;width:100%}h1{margin-bottom:10px}register-actions{display:block;margin-top:20px}</style>";
;(function() {
Polymer({

  is: "register-form",
  
  listeners: {
    //- 'register-button.tap': 'register',
    //- 'show-register-button.tap': 'showRegister',
    //- 'register-button.tap': 'register',
    //- 'cancel-register-button.tap': 'cancelRegister'
  },
  
  //- LOCKER & LOADED
  ready : function() {
  
    console.log('COOKIES:');
    console.log(document.cookie);
  
    var Socket  = window.socket;
    //- Gabba.Login.init();
    //- this.$.register.toggle(); // show register form
    
    //- Socket.on('user:connected', function( data ) {
    //-   console.log('user connected:');
    //-   console.log(data);
    //- });
    
  },
  
  //- PROCESS LOGIN
  register : function() {
  
    //- var u = this.$.username.value,
        //- e = this.$.email.value,
    var Socket  = window.socket;
        
        console.log('user.register()');
    
    //- this.socket = window.socket = io.connect( server );
    
    //- SEND LOGIN TO SOCKET
    Socket.emit('user:register', {});

  },
  
  //- PROCESS REGISTRATION
  register : function() {
    console.info('register user');
  },


});
})();

})
},{}],16:[function(require,module,exports){
"use strict";

module.exports = function () {

  var port = window.location.port,
      protocol = window.location.protocol + "//",
      host = window.location.hostname;

  return {

    init: function init(server) {

      this.socket = window.socket = io.connect(server);

      this.socket.on("connected", function (data) {
        console.log("socket connected: ");
        console.log(data.connected);
      });

      this.socket.on("error", function (data) {
        console.log("socket error: ");
        console.error(data.err);
      });
    },

    config: { // GLOBAL CONFIG SETTINGS

      // SET TO FALSE TO DISABLE LOGGING TO CONSOLE
      debug: true,

      // BASE URL'S
      url: {
        base: protocol + host + (port !== "" ? ":" + port : "") + "/" }

    } // END CONFIG

  };
};
//BASE URL

},{}],17:[function(require,module,exports){
// POLYMER COMPONENTS
"use strict";

require("../_bower/paper-button/paper-button.html");
require("../_bower/iron-collapse/iron-collapse.html");

var Cookies = require("../_bower/cookies-js/dist/cookies")(window),
    Gabba = window.Gabba = require("./_modules/gabba")();

console.log(Cookies);

// GABBA TEMPLATES
require("../_dist/templates/login-form.html");
require("../_dist/templates/register-form.html");

},{"../_bower/cookies-js/dist/cookies":1,"../_bower/iron-collapse/iron-collapse.html":5,"../_bower/paper-button/paper-button.html":7,"../_dist/templates/login-form.html":14,"../_dist/templates/register-form.html":15,"./_modules/gabba":16}]},{},[17])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fYm93ZXIvY29va2llcy1qcy9kaXN0L2Nvb2tpZXMuanMiLCIvVXNlcnMvamVzc2V3ZWVkL1NpdGVzL2dhYmJhL2NsaWVudC9jbGllbnQvX2Jvd2VyL2lyb24tYTExeS1rZXlzLWJlaGF2aW9yL2lyb24tYTExeS1rZXlzLWJlaGF2aW9yLmh0bWwiLCIvVXNlcnMvamVzc2V3ZWVkL1NpdGVzL2dhYmJhL2NsaWVudC9jbGllbnQvX2Jvd2VyL2lyb24tYmVoYXZpb3JzL2lyb24tYnV0dG9uLXN0YXRlLmh0bWwiLCIvVXNlcnMvamVzc2V3ZWVkL1NpdGVzL2dhYmJhL2NsaWVudC9jbGllbnQvX2Jvd2VyL2lyb24tYmVoYXZpb3JzL2lyb24tY29udHJvbC1zdGF0ZS5odG1sIiwiL1VzZXJzL2plc3Nld2VlZC9TaXRlcy9nYWJiYS9jbGllbnQvY2xpZW50L19ib3dlci9pcm9uLWNvbGxhcHNlL2lyb24tY29sbGFwc2UuaHRtbCIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fYm93ZXIvcGFwZXItYmVoYXZpb3JzL3BhcGVyLWJ1dHRvbi1iZWhhdmlvci5odG1sIiwiL1VzZXJzL2plc3Nld2VlZC9TaXRlcy9nYWJiYS9jbGllbnQvY2xpZW50L19ib3dlci9wYXBlci1idXR0b24vcGFwZXItYnV0dG9uLmh0bWwiLCIvVXNlcnMvamVzc2V3ZWVkL1NpdGVzL2dhYmJhL2NsaWVudC9jbGllbnQvX2Jvd2VyL3BhcGVyLW1hdGVyaWFsL3BhcGVyLW1hdGVyaWFsLmh0bWwiLCIvVXNlcnMvamVzc2V3ZWVkL1NpdGVzL2dhYmJhL2NsaWVudC9jbGllbnQvX2Jvd2VyL3BhcGVyLXJpcHBsZS9wYXBlci1yaXBwbGUuaHRtbCIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fYm93ZXIvcGFwZXItc3R5bGVzL3NoYWRvdy5odG1sIiwiL1VzZXJzL2plc3Nld2VlZC9TaXRlcy9nYWJiYS9jbGllbnQvY2xpZW50L19ib3dlci9wb2x5bWVyL3BvbHltZXItbWljcm8uaHRtbCIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fYm93ZXIvcG9seW1lci9wb2x5bWVyLW1pbmkuaHRtbCIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fYm93ZXIvcG9seW1lci9wb2x5bWVyLmh0bWwiLCIvVXNlcnMvamVzc2V3ZWVkL1NpdGVzL2dhYmJhL2NsaWVudC9jbGllbnQvX2Rpc3QvdGVtcGxhdGVzL2xvZ2luLWZvcm0uaHRtbCIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fZGlzdC90ZW1wbGF0ZXMvcmVnaXN0ZXItZm9ybS5odG1sIiwiL1VzZXJzL2plc3Nld2VlZC9TaXRlcy9nYWJiYS9jbGllbnQvY2xpZW50L2FwcC9fbW9kdWxlcy9nYWJiYS5qcyIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9hcHAvZmFrZV8zZWQ2NWQ3Mi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FDTUEsQ0FBQyxVQUFVLE1BQU0sRUFBRSxTQUFTLEVBQUU7QUFDMUIsZ0JBQVksQ0FBQzs7QUFFYixRQUFJLE9BQU8sR0FBRyxpQkFBVSxNQUFNLEVBQUU7QUFDNUIsWUFBSSxPQUFPLE1BQU0sQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFO0FBQ3JDLGtCQUFNLElBQUksS0FBSyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7U0FDOUU7O0FBRUQsWUFBSSxPQUFPOzs7Ozs7Ozs7O1dBQUcsVUFBVSxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRTtBQUN6QyxtQkFBTyxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsR0FDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDM0QsQ0FBQSxDQUFDOzs7QUFHRixlQUFPLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7Ozs7QUFJcEMsZUFBTyxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7O0FBRXBDLGVBQU8sQ0FBQyxjQUFjLEdBQUcsSUFBSSxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQzs7QUFFbkUsZUFBTyxDQUFDLFFBQVEsR0FBRztBQUNmLGdCQUFJLEVBQUUsR0FBRztBQUNULGtCQUFNLEVBQUUsS0FBSztTQUNoQixDQUFDOztBQUVGLGVBQU8sQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUU7QUFDekIsZ0JBQUksT0FBTyxDQUFDLHFCQUFxQixLQUFLLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO0FBQzVELHVCQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDekI7O0FBRUQsbUJBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1NBQ3hELENBQUM7O0FBRUYsZUFBTyxDQUFDLEdBQUcsR0FBRyxVQUFVLEdBQUcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFO0FBQ3pDLG1CQUFPLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9DLG1CQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsS0FBSyxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRXRGLG1CQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFOUUsbUJBQU8sT0FBTyxDQUFDO1NBQ2xCLENBQUM7O0FBRUYsZUFBTyxDQUFDLE1BQU0sR0FBRyxVQUFVLEdBQUcsRUFBRSxPQUFPLEVBQUU7QUFDckMsbUJBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQy9DLENBQUM7O0FBRUYsZUFBTyxDQUFDLG1CQUFtQixHQUFHLFVBQVUsT0FBTyxFQUFFO0FBQzdDLG1CQUFPO0FBQ0gsb0JBQUksRUFBRSxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUk7QUFDdEQsc0JBQU0sRUFBRSxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU07QUFDNUQsdUJBQU8sRUFBRSxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU87QUFDL0Qsc0JBQU0sRUFBRSxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxTQUFTLEdBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU07YUFDOUYsQ0FBQztTQUNMLENBQUM7O0FBRUYsZUFBTyxDQUFDLFlBQVksR0FBRyxVQUFVLElBQUksRUFBRTtBQUNuQyxtQkFBTyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssZUFBZSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1NBQzdGLENBQUM7O0FBRUYsZUFBTyxDQUFDLGVBQWUsR0FBRyxVQUFVLE9BQU8sRUFBRSxHQUFHLEVBQUU7QUFDOUMsZUFBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDOztBQUV4QixnQkFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7QUFDN0IsdUJBQU8sR0FBRyxPQUFPLEtBQUssUUFBUSxHQUMxQixPQUFPLENBQUMsY0FBYyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUM7YUFDekUsTUFBTSxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtBQUNwQyx1QkFBTyxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQy9COztBQUVELGdCQUFJLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDM0Msc0JBQU0sSUFBSSxLQUFLLENBQUMsa0VBQWtFLENBQUMsQ0FBQzthQUN2Rjs7QUFFRCxtQkFBTyxPQUFPLENBQUM7U0FDbEIsQ0FBQzs7QUFFRixlQUFPLENBQUMscUJBQXFCLEdBQUcsVUFBVSxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRTtBQUMzRCxlQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztBQUN0RCxlQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN0RCxpQkFBSyxHQUFHLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQSxDQUFFLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0FBQzNFLG1CQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQzs7QUFFeEIsZ0JBQUksWUFBWSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDO0FBQ3JDLHdCQUFZLElBQUksT0FBTyxDQUFDLElBQUksR0FBRyxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDNUQsd0JBQVksSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNsRSx3QkFBWSxJQUFJLE9BQU8sQ0FBQyxPQUFPLEdBQUcsV0FBVyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ25GLHdCQUFZLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxTQUFTLEdBQUcsRUFBRSxDQUFDOztBQUVoRCxtQkFBTyxZQUFZLENBQUM7U0FDdkIsQ0FBQzs7QUFFRixlQUFPLENBQUMsbUJBQW1CLEdBQUcsVUFBVSxjQUFjLEVBQUU7QUFDcEQsZ0JBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUNyQixnQkFBSSxZQUFZLEdBQUcsY0FBYyxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDOztBQUVwRSxpQkFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDMUMsb0JBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFMUUsb0JBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLFNBQVMsRUFBRTtBQUNwRSwrQkFBVyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7aUJBQzFFO2FBQ0o7O0FBRUQsbUJBQU8sV0FBVyxDQUFDO1NBQ3RCLENBQUM7O0FBRUYsZUFBTyxDQUFDLGdDQUFnQyxHQUFHLFVBQVUsWUFBWSxFQUFFOztBQUUvRCxnQkFBSSxjQUFjLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7O0FBRy9DLDBCQUFjLEdBQUcsY0FBYyxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQzs7QUFFM0UsbUJBQU87QUFDSCxtQkFBRyxFQUFFLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQy9ELHFCQUFLLEVBQUUsa0JBQWtCLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDckUsQ0FBQztTQUNMLENBQUM7O0FBRUYsZUFBTyxDQUFDLFdBQVcsR0FBRyxZQUFZO0FBQzlCLG1CQUFPLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZFLG1CQUFPLENBQUMscUJBQXFCLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7U0FDNUQsQ0FBQzs7QUFFRixlQUFPLENBQUMsV0FBVyxHQUFHLFlBQVk7QUFDOUIsZ0JBQUksT0FBTyxHQUFHLFlBQVksQ0FBQztBQUMzQixnQkFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQztBQUM5RCxtQkFBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN4QixtQkFBTyxVQUFVLENBQUM7U0FDckIsQ0FBQzs7QUFFRixlQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7QUFFeEMsZUFBTyxPQUFPLENBQUM7S0FDbEIsQ0FBQzs7QUFFRixRQUFJLGFBQWEsR0FBRyxPQUFPLE1BQU0sQ0FBQyxRQUFRLEtBQUssUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUM7OztBQUdwRixRQUFJLE9BQU8sTUFBTSxLQUFLLFVBQVUsSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFO0FBQzVDLGNBQU0sQ0FBQyxZQUFZO0FBQUUsbUJBQU8sYUFBYSxDQUFDO1NBQUUsQ0FBQyxDQUFDOztLQUVqRCxNQUFNLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFOztBQUVwQyxZQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxPQUFPLE1BQU0sQ0FBQyxPQUFPLEtBQUssUUFBUSxFQUFFO0FBQ2xFLG1CQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUM7U0FDNUM7O0FBRUQsZUFBTyxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUM7S0FDbkMsTUFBTTtBQUNILGNBQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDO0tBQ2xDO0NBQ0osQ0FBQSxDQUFFLE9BQU8sTUFBTSxLQUFLLFdBQVcsZUFBVSxNQUFNLENBQUMsQ0FBQzs7O0FDaEtsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5WkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqa0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzU1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQSxZQUFZLENBQUM7O0FBRWIsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZOztBQUUzQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUk7TUFDM0IsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLElBQUk7TUFDMUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDOztBQUV0QyxTQUFPOztBQUVMLFFBQUksRUFBRyxjQUFXLE1BQU0sRUFBRzs7QUFFekIsVUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUUsTUFBTSxDQUFFLENBQUM7O0FBRW5ELFVBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFVLElBQUksRUFBRztBQUMzQyxlQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDbEMsZUFBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDN0IsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFVLElBQUksRUFBRztBQUN2QyxlQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDOUIsZUFBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDekIsQ0FBQyxDQUFDO0tBRUo7O0FBRUQsVUFBTSxFQUFHOzs7QUFHUCxXQUFLLEVBQUcsSUFBSTs7O0FBR1osU0FBRyxFQUFHO0FBQ0YsWUFBSSxFQUFFLFFBQVEsR0FBRyxJQUFJLElBQUssSUFBSSxLQUFLLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQSxHQUFJLEdBQUcsRUFDakU7O0tBRUY7O0FBQUEsR0FFRixDQUFDO0NBRUgsQ0FBQzs7Ozs7QUN2Q0YsWUFBWSxDQUFDOztBQUViLE9BQU8sQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0FBQ3BELE9BQU8sQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDOztBQUV0RCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDOUQsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQzs7QUFFekQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7O0FBR3JCLE9BQU8sQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0FBQzlDLE9BQU8sQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gKiBDb29raWVzLmpzIC0gMS4yLjFcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9TY290dEhhbXBlci9Db29raWVzXG4gKlxuICogVGhpcyBpcyBmcmVlIGFuZCB1bmVuY3VtYmVyZWQgc29mdHdhcmUgcmVsZWFzZWQgaW50byB0aGUgcHVibGljIGRvbWFpbi5cbiAqL1xuKGZ1bmN0aW9uIChnbG9iYWwsIHVuZGVmaW5lZCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBmYWN0b3J5ID0gZnVuY3Rpb24gKHdpbmRvdykge1xuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5kb2N1bWVudCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29va2llcy5qcyByZXF1aXJlcyBhIGB3aW5kb3dgIHdpdGggYSBgZG9jdW1lbnRgIG9iamVjdCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIENvb2tpZXMgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgP1xuICAgICAgICAgICAgICAgIENvb2tpZXMuZ2V0KGtleSkgOiBDb29raWVzLnNldChrZXksIHZhbHVlLCBvcHRpb25zKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBbGxvd3MgZm9yIHNldHRlciBpbmplY3Rpb24gaW4gdW5pdCB0ZXN0c1xuICAgICAgICBDb29raWVzLl9kb2N1bWVudCA9IHdpbmRvdy5kb2N1bWVudDtcblxuICAgICAgICAvLyBVc2VkIHRvIGVuc3VyZSBjb29raWUga2V5cyBkbyBub3QgY29sbGlkZSB3aXRoXG4gICAgICAgIC8vIGJ1aWx0LWluIGBPYmplY3RgIHByb3BlcnRpZXNcbiAgICAgICAgQ29va2llcy5fY2FjaGVLZXlQcmVmaXggPSAnY29va2V5Lic7IC8vIEh1cnIgaHVyciwgOilcbiAgICAgICAgXG4gICAgICAgIENvb2tpZXMuX21heEV4cGlyZURhdGUgPSBuZXcgRGF0ZSgnRnJpLCAzMSBEZWMgOTk5OSAyMzo1OTo1OSBVVEMnKTtcblxuICAgICAgICBDb29raWVzLmRlZmF1bHRzID0ge1xuICAgICAgICAgICAgcGF0aDogJy8nLFxuICAgICAgICAgICAgc2VjdXJlOiBmYWxzZVxuICAgICAgICB9O1xuXG4gICAgICAgIENvb2tpZXMuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaWYgKENvb2tpZXMuX2NhY2hlZERvY3VtZW50Q29va2llICE9PSBDb29raWVzLl9kb2N1bWVudC5jb29raWUpIHtcbiAgICAgICAgICAgICAgICBDb29raWVzLl9yZW5ld0NhY2hlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBDb29raWVzLl9jYWNoZVtDb29raWVzLl9jYWNoZUtleVByZWZpeCArIGtleV07XG4gICAgICAgIH07XG5cbiAgICAgICAgQ29va2llcy5zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgb3B0aW9ucyA9IENvb2tpZXMuX2dldEV4dGVuZGVkT3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgICAgIG9wdGlvbnMuZXhwaXJlcyA9IENvb2tpZXMuX2dldEV4cGlyZXNEYXRlKHZhbHVlID09PSB1bmRlZmluZWQgPyAtMSA6IG9wdGlvbnMuZXhwaXJlcyk7XG5cbiAgICAgICAgICAgIENvb2tpZXMuX2RvY3VtZW50LmNvb2tpZSA9IENvb2tpZXMuX2dlbmVyYXRlQ29va2llU3RyaW5nKGtleSwgdmFsdWUsIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICByZXR1cm4gQ29va2llcztcbiAgICAgICAgfTtcblxuICAgICAgICBDb29raWVzLmV4cGlyZSA9IGZ1bmN0aW9uIChrZXksIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBDb29raWVzLnNldChrZXksIHVuZGVmaW5lZCwgb3B0aW9ucyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgQ29va2llcy5fZ2V0RXh0ZW5kZWRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcGF0aDogb3B0aW9ucyAmJiBvcHRpb25zLnBhdGggfHwgQ29va2llcy5kZWZhdWx0cy5wYXRoLFxuICAgICAgICAgICAgICAgIGRvbWFpbjogb3B0aW9ucyAmJiBvcHRpb25zLmRvbWFpbiB8fCBDb29raWVzLmRlZmF1bHRzLmRvbWFpbixcbiAgICAgICAgICAgICAgICBleHBpcmVzOiBvcHRpb25zICYmIG9wdGlvbnMuZXhwaXJlcyB8fCBDb29raWVzLmRlZmF1bHRzLmV4cGlyZXMsXG4gICAgICAgICAgICAgICAgc2VjdXJlOiBvcHRpb25zICYmIG9wdGlvbnMuc2VjdXJlICE9PSB1bmRlZmluZWQgPyAgb3B0aW9ucy5zZWN1cmUgOiBDb29raWVzLmRlZmF1bHRzLnNlY3VyZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgICAgICBDb29raWVzLl9pc1ZhbGlkRGF0ZSA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGUpID09PSAnW29iamVjdCBEYXRlXScgJiYgIWlzTmFOKGRhdGUuZ2V0VGltZSgpKTtcbiAgICAgICAgfTtcblxuICAgICAgICBDb29raWVzLl9nZXRFeHBpcmVzRGF0ZSA9IGZ1bmN0aW9uIChleHBpcmVzLCBub3cpIHtcbiAgICAgICAgICAgIG5vdyA9IG5vdyB8fCBuZXcgRGF0ZSgpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGV4cGlyZXMgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgZXhwaXJlcyA9IGV4cGlyZXMgPT09IEluZmluaXR5ID9cbiAgICAgICAgICAgICAgICAgICAgQ29va2llcy5fbWF4RXhwaXJlRGF0ZSA6IG5ldyBEYXRlKG5vdy5nZXRUaW1lKCkgKyBleHBpcmVzICogMTAwMCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBpcmVzID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGV4cGlyZXMgPSBuZXcgRGF0ZShleHBpcmVzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGV4cGlyZXMgJiYgIUNvb2tpZXMuX2lzVmFsaWREYXRlKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgZXhwaXJlc2AgcGFyYW1ldGVyIGNhbm5vdCBiZSBjb252ZXJ0ZWQgdG8gYSB2YWxpZCBEYXRlIGluc3RhbmNlJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBleHBpcmVzO1xuICAgICAgICB9O1xuXG4gICAgICAgIENvb2tpZXMuX2dlbmVyYXRlQ29va2llU3RyaW5nID0gZnVuY3Rpb24gKGtleSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGtleSA9IGtleS5yZXBsYWNlKC9bXiMkJitcXF5gfF0vZywgZW5jb2RlVVJJQ29tcG9uZW50KTtcbiAgICAgICAgICAgIGtleSA9IGtleS5yZXBsYWNlKC9cXCgvZywgJyUyOCcpLnJlcGxhY2UoL1xcKS9nLCAnJTI5Jyk7XG4gICAgICAgICAgICB2YWx1ZSA9ICh2YWx1ZSArICcnKS5yZXBsYWNlKC9bXiEjJCYtK1xcLS06PC1cXFtcXF0tfl0vZywgZW5jb2RlVVJJQ29tcG9uZW50KTtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICAgICAgICB2YXIgY29va2llU3RyaW5nID0ga2V5ICsgJz0nICsgdmFsdWU7XG4gICAgICAgICAgICBjb29raWVTdHJpbmcgKz0gb3B0aW9ucy5wYXRoID8gJztwYXRoPScgKyBvcHRpb25zLnBhdGggOiAnJztcbiAgICAgICAgICAgIGNvb2tpZVN0cmluZyArPSBvcHRpb25zLmRvbWFpbiA/ICc7ZG9tYWluPScgKyBvcHRpb25zLmRvbWFpbiA6ICcnO1xuICAgICAgICAgICAgY29va2llU3RyaW5nICs9IG9wdGlvbnMuZXhwaXJlcyA/ICc7ZXhwaXJlcz0nICsgb3B0aW9ucy5leHBpcmVzLnRvVVRDU3RyaW5nKCkgOiAnJztcbiAgICAgICAgICAgIGNvb2tpZVN0cmluZyArPSBvcHRpb25zLnNlY3VyZSA/ICc7c2VjdXJlJyA6ICcnO1xuXG4gICAgICAgICAgICByZXR1cm4gY29va2llU3RyaW5nO1xuICAgICAgICB9O1xuXG4gICAgICAgIENvb2tpZXMuX2dldENhY2hlRnJvbVN0cmluZyA9IGZ1bmN0aW9uIChkb2N1bWVudENvb2tpZSkge1xuICAgICAgICAgICAgdmFyIGNvb2tpZUNhY2hlID0ge307XG4gICAgICAgICAgICB2YXIgY29va2llc0FycmF5ID0gZG9jdW1lbnRDb29raWUgPyBkb2N1bWVudENvb2tpZS5zcGxpdCgnOyAnKSA6IFtdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb2tpZXNBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBjb29raWVLdnAgPSBDb29raWVzLl9nZXRLZXlWYWx1ZVBhaXJGcm9tQ29va2llU3RyaW5nKGNvb2tpZXNBcnJheVtpXSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoY29va2llQ2FjaGVbQ29va2llcy5fY2FjaGVLZXlQcmVmaXggKyBjb29raWVLdnAua2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvb2tpZUNhY2hlW0Nvb2tpZXMuX2NhY2hlS2V5UHJlZml4ICsgY29va2llS3ZwLmtleV0gPSBjb29raWVLdnAudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY29va2llQ2FjaGU7XG4gICAgICAgIH07XG5cbiAgICAgICAgQ29va2llcy5fZ2V0S2V5VmFsdWVQYWlyRnJvbUNvb2tpZVN0cmluZyA9IGZ1bmN0aW9uIChjb29raWVTdHJpbmcpIHtcbiAgICAgICAgICAgIC8vIFwiPVwiIGlzIGEgdmFsaWQgY2hhcmFjdGVyIGluIGEgY29va2llIHZhbHVlIGFjY29yZGluZyB0byBSRkM2MjY1LCBzbyBjYW5ub3QgYHNwbGl0KCc9JylgXG4gICAgICAgICAgICB2YXIgc2VwYXJhdG9ySW5kZXggPSBjb29raWVTdHJpbmcuaW5kZXhPZignPScpO1xuXG4gICAgICAgICAgICAvLyBJRSBvbWl0cyB0aGUgXCI9XCIgd2hlbiB0aGUgY29va2llIHZhbHVlIGlzIGFuIGVtcHR5IHN0cmluZ1xuICAgICAgICAgICAgc2VwYXJhdG9ySW5kZXggPSBzZXBhcmF0b3JJbmRleCA8IDAgPyBjb29raWVTdHJpbmcubGVuZ3RoIDogc2VwYXJhdG9ySW5kZXg7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAga2V5OiBkZWNvZGVVUklDb21wb25lbnQoY29va2llU3RyaW5nLnN1YnN0cigwLCBzZXBhcmF0b3JJbmRleCkpLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBkZWNvZGVVUklDb21wb25lbnQoY29va2llU3RyaW5nLnN1YnN0cihzZXBhcmF0b3JJbmRleCArIDEpKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgICAgICBDb29raWVzLl9yZW5ld0NhY2hlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgQ29va2llcy5fY2FjaGUgPSBDb29raWVzLl9nZXRDYWNoZUZyb21TdHJpbmcoQ29va2llcy5fZG9jdW1lbnQuY29va2llKTtcbiAgICAgICAgICAgIENvb2tpZXMuX2NhY2hlZERvY3VtZW50Q29va2llID0gQ29va2llcy5fZG9jdW1lbnQuY29va2llO1xuICAgICAgICB9O1xuXG4gICAgICAgIENvb2tpZXMuX2FyZUVuYWJsZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGVzdEtleSA9ICdjb29raWVzLmpzJztcbiAgICAgICAgICAgIHZhciBhcmVFbmFibGVkID0gQ29va2llcy5zZXQodGVzdEtleSwgMSkuZ2V0KHRlc3RLZXkpID09PSAnMSc7XG4gICAgICAgICAgICBDb29raWVzLmV4cGlyZSh0ZXN0S2V5KTtcbiAgICAgICAgICAgIHJldHVybiBhcmVFbmFibGVkO1xuICAgICAgICB9O1xuXG4gICAgICAgIENvb2tpZXMuZW5hYmxlZCA9IENvb2tpZXMuX2FyZUVuYWJsZWQoKTtcblxuICAgICAgICByZXR1cm4gQ29va2llcztcbiAgICB9O1xuXG4gICAgdmFyIGNvb2tpZXNFeHBvcnQgPSB0eXBlb2YgZ2xvYmFsLmRvY3VtZW50ID09PSAnb2JqZWN0JyA/IGZhY3RvcnkoZ2xvYmFsKSA6IGZhY3Rvcnk7XG5cbiAgICAvLyBBTUQgc3VwcG9ydFxuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNvb2tpZXNFeHBvcnQ7IH0pO1xuICAgIC8vIENvbW1vbkpTL05vZGUuanMgc3VwcG9ydFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIC8vIFN1cHBvcnQgTm9kZS5qcyBzcGVjaWZpYyBgbW9kdWxlLmV4cG9ydHNgICh3aGljaCBjYW4gYmUgYSBmdW5jdGlvbilcbiAgICAgICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGNvb2tpZXNFeHBvcnQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQnV0IGFsd2F5cyBzdXBwb3J0IENvbW1vbkpTIG1vZHVsZSAxLjEuMSBzcGVjIChgZXhwb3J0c2AgY2Fubm90IGJlIGEgZnVuY3Rpb24pXG4gICAgICAgIGV4cG9ydHMuQ29va2llcyA9IGNvb2tpZXNFeHBvcnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZ2xvYmFsLkNvb2tpZXMgPSBjb29raWVzRXhwb3J0O1xuICAgIH1cbn0pKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gdGhpcyA6IHdpbmRvdyk7IiwicmVxdWlyZShcIi4uL3BvbHltZXIvcG9seW1lci5odG1sXCIpO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixmdW5jdGlvbigpIHtcbjsoZnVuY3Rpb24oKSB7XG5cbiAgKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKlxuICAgICAqIENocm9tZSB1c2VzIGFuIG9sZGVyIHZlcnNpb24gb2YgRE9NIExldmVsIDMgS2V5Ym9hcmQgRXZlbnRzXG4gICAgICpcbiAgICAgKiBNb3N0IGtleXMgYXJlIGxhYmVsZWQgYXMgdGV4dCwgYnV0IHNvbWUgYXJlIFVuaWNvZGUgY29kZXBvaW50cy5cbiAgICAgKiBWYWx1ZXMgdGFrZW4gZnJvbTogaHR0cDovL3d3dy53My5vcmcvVFIvMjAwNy9XRC1ET00tTGV2ZWwtMy1FdmVudHMtMjAwNzEyMjEva2V5c2V0Lmh0bWwjS2V5U2V0LVNldFxuICAgICAqL1xuICAgIHZhciBLRVlfSURFTlRJRklFUiA9IHtcbiAgICAgICdVKzAwMDknOiAndGFiJyxcbiAgICAgICdVKzAwMUInOiAnZXNjJyxcbiAgICAgICdVKzAwMjAnOiAnc3BhY2UnLFxuICAgICAgJ1UrMDAyQSc6ICcqJyxcbiAgICAgICdVKzAwMzAnOiAnMCcsXG4gICAgICAnVSswMDMxJzogJzEnLFxuICAgICAgJ1UrMDAzMic6ICcyJyxcbiAgICAgICdVKzAwMzMnOiAnMycsXG4gICAgICAnVSswMDM0JzogJzQnLFxuICAgICAgJ1UrMDAzNSc6ICc1JyxcbiAgICAgICdVKzAwMzYnOiAnNicsXG4gICAgICAnVSswMDM3JzogJzcnLFxuICAgICAgJ1UrMDAzOCc6ICc4JyxcbiAgICAgICdVKzAwMzknOiAnOScsXG4gICAgICAnVSswMDQxJzogJ2EnLFxuICAgICAgJ1UrMDA0Mic6ICdiJyxcbiAgICAgICdVKzAwNDMnOiAnYycsXG4gICAgICAnVSswMDQ0JzogJ2QnLFxuICAgICAgJ1UrMDA0NSc6ICdlJyxcbiAgICAgICdVKzAwNDYnOiAnZicsXG4gICAgICAnVSswMDQ3JzogJ2cnLFxuICAgICAgJ1UrMDA0OCc6ICdoJyxcbiAgICAgICdVKzAwNDknOiAnaScsXG4gICAgICAnVSswMDRBJzogJ2onLFxuICAgICAgJ1UrMDA0Qic6ICdrJyxcbiAgICAgICdVKzAwNEMnOiAnbCcsXG4gICAgICAnVSswMDREJzogJ20nLFxuICAgICAgJ1UrMDA0RSc6ICduJyxcbiAgICAgICdVKzAwNEYnOiAnbycsXG4gICAgICAnVSswMDUwJzogJ3AnLFxuICAgICAgJ1UrMDA1MSc6ICdxJyxcbiAgICAgICdVKzAwNTInOiAncicsXG4gICAgICAnVSswMDUzJzogJ3MnLFxuICAgICAgJ1UrMDA1NCc6ICd0JyxcbiAgICAgICdVKzAwNTUnOiAndScsXG4gICAgICAnVSswMDU2JzogJ3YnLFxuICAgICAgJ1UrMDA1Nyc6ICd3JyxcbiAgICAgICdVKzAwNTgnOiAneCcsXG4gICAgICAnVSswMDU5JzogJ3knLFxuICAgICAgJ1UrMDA1QSc6ICd6JyxcbiAgICAgICdVKzAwN0YnOiAnZGVsJ1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTcGVjaWFsIHRhYmxlIGZvciBLZXlib2FyZEV2ZW50LmtleUNvZGUuXG4gICAgICogS2V5Ym9hcmRFdmVudC5rZXlJZGVudGlmaWVyIGlzIGJldHRlciwgYW5kIEtleUJvYXJkRXZlbnQua2V5IGlzIGV2ZW4gYmV0dGVyXG4gICAgICogdGhhbiB0aGF0LlxuICAgICAqXG4gICAgICogVmFsdWVzIGZyb206IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9LZXlib2FyZEV2ZW50LmtleUNvZGUjVmFsdWVfb2Zfa2V5Q29kZVxuICAgICAqL1xuICAgIHZhciBLRVlfQ09ERSA9IHtcbiAgICAgIDk6ICd0YWInLFxuICAgICAgMTM6ICdlbnRlcicsXG4gICAgICAyNzogJ2VzYycsXG4gICAgICAzMzogJ3BhZ2V1cCcsXG4gICAgICAzNDogJ3BhZ2Vkb3duJyxcbiAgICAgIDM1OiAnZW5kJyxcbiAgICAgIDM2OiAnaG9tZScsXG4gICAgICAzMjogJ3NwYWNlJyxcbiAgICAgIDM3OiAnbGVmdCcsXG4gICAgICAzODogJ3VwJyxcbiAgICAgIDM5OiAncmlnaHQnLFxuICAgICAgNDA6ICdkb3duJyxcbiAgICAgIDQ2OiAnZGVsJyxcbiAgICAgIDEwNjogJyonXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE1PRElGSUVSX0tFWVMgbWFwcyB0aGUgc2hvcnQgbmFtZSBmb3IgbW9kaWZpZXIga2V5cyB1c2VkIGluIGEga2V5XG4gICAgICogY29tYm8gc3RyaW5nIHRvIHRoZSBwcm9wZXJ0eSBuYW1lIHRoYXQgcmVmZXJlbmNlcyB0aG9zZSBzYW1lIGtleXNcbiAgICAgKiBpbiBhIEtleWJvYXJkRXZlbnQgaW5zdGFuY2UuXG4gICAgICovXG4gICAgdmFyIE1PRElGSUVSX0tFWVMgPSB7XG4gICAgICAnc2hpZnQnOiAnc2hpZnRLZXknLFxuICAgICAgJ2N0cmwnOiAnY3RybEtleScsXG4gICAgICAnYWx0JzogJ2FsdEtleScsXG4gICAgICAnbWV0YSc6ICdtZXRhS2V5J1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBLZXlib2FyZEV2ZW50LmtleSBpcyBtb3N0bHkgcmVwcmVzZW50ZWQgYnkgcHJpbnRhYmxlIGNoYXJhY3RlciBtYWRlIGJ5XG4gICAgICogdGhlIGtleWJvYXJkLCB3aXRoIHVucHJpbnRhYmxlIGtleXMgbGFiZWxlZCBuaWNlbHkuXG4gICAgICpcbiAgICAgKiBIb3dldmVyLCBvbiBPUyBYLCBBbHQrY2hhciBjYW4gbWFrZSBhIFVuaWNvZGUgY2hhcmFjdGVyIHRoYXQgZm9sbG93cyBhblxuICAgICAqIEFwcGxlLXNwZWNpZmljIG1hcHBpbmcuIEluIHRoaXMgY2FzZSwgd2VcbiAgICAgKiBmYWxsIGJhY2sgdG8gLmtleUNvZGUuXG4gICAgICovXG4gICAgdmFyIEtFWV9DSEFSID0gL1thLXowLTkqXS87XG5cbiAgICAvKipcbiAgICAgKiBNYXRjaGVzIGEga2V5SWRlbnRpZmllciBzdHJpbmcuXG4gICAgICovXG4gICAgdmFyIElERU5UX0NIQVIgPSAvVVxcKy87XG5cbiAgICAvKipcbiAgICAgKiBNYXRjaGVzIGFycm93IGtleXMgaW4gR2Vja28gMjcuMCtcbiAgICAgKi9cbiAgICB2YXIgQVJST1dfS0VZID0gL15hcnJvdy87XG5cbiAgICAvKipcbiAgICAgKiBNYXRjaGVzIHNwYWNlIGtleXMgZXZlcnl3aGVyZSAobm90YWJseSBpbmNsdWRpbmcgSUUxMCdzIGV4Y2VwdGlvbmFsIG5hbWVcbiAgICAgKiBgc3BhY2ViYXJgKS5cbiAgICAgKi9cbiAgICB2YXIgU1BBQ0VfS0VZID0gL15zcGFjZShiYXIpPy87XG5cbiAgICBmdW5jdGlvbiB0cmFuc2Zvcm1LZXkoa2V5KSB7XG4gICAgICB2YXIgdmFsaWRLZXkgPSAnJztcbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgdmFyIGxLZXkgPSBrZXkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKGxLZXkubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICBpZiAoS0VZX0NIQVIudGVzdChsS2V5KSkge1xuICAgICAgICAgICAgdmFsaWRLZXkgPSBsS2V5O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChBUlJPV19LRVkudGVzdChsS2V5KSkge1xuICAgICAgICAgIHZhbGlkS2V5ID0gbEtleS5yZXBsYWNlKCdhcnJvdycsICcnKTtcbiAgICAgICAgfSBlbHNlIGlmIChTUEFDRV9LRVkudGVzdChsS2V5KSkge1xuICAgICAgICAgIHZhbGlkS2V5ID0gJ3NwYWNlJztcbiAgICAgICAgfSBlbHNlIGlmIChsS2V5ID09ICdtdWx0aXBseScpIHtcbiAgICAgICAgICAvLyBudW1wYWQgJyonIGNhbiBtYXAgdG8gTXVsdGlwbHkgb24gSUUvV2luZG93c1xuICAgICAgICAgIHZhbGlkS2V5ID0gJyonO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbGlkS2V5ID0gbEtleTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbGlkS2V5O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zZm9ybUtleUlkZW50aWZpZXIoa2V5SWRlbnQpIHtcbiAgICAgIHZhciB2YWxpZEtleSA9ICcnO1xuICAgICAgaWYgKGtleUlkZW50KSB7XG4gICAgICAgIGlmIChJREVOVF9DSEFSLnRlc3Qoa2V5SWRlbnQpKSB7XG4gICAgICAgICAgdmFsaWRLZXkgPSBLRVlfSURFTlRJRklFUltrZXlJZGVudF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsaWRLZXkgPSBrZXlJZGVudC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsaWRLZXk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHJhbnNmb3JtS2V5Q29kZShrZXlDb2RlKSB7XG4gICAgICB2YXIgdmFsaWRLZXkgPSAnJztcbiAgICAgIGlmIChOdW1iZXIoa2V5Q29kZSkpIHtcbiAgICAgICAgaWYgKGtleUNvZGUgPj0gNjUgJiYga2V5Q29kZSA8PSA5MCkge1xuICAgICAgICAgIC8vIGFzY2lpIGEtelxuICAgICAgICAgIC8vIGxvd2VyY2FzZSBpcyAzMiBvZmZzZXQgZnJvbSB1cHBlcmNhc2VcbiAgICAgICAgICB2YWxpZEtleSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoMzIgKyBrZXlDb2RlKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXlDb2RlID49IDExMiAmJiBrZXlDb2RlIDw9IDEyMykge1xuICAgICAgICAgIC8vIGZ1bmN0aW9uIGtleXMgZjEtZjEyXG4gICAgICAgICAgdmFsaWRLZXkgPSAnZicgKyAoa2V5Q29kZSAtIDExMik7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5Q29kZSA+PSA0OCAmJiBrZXlDb2RlIDw9IDU3KSB7XG4gICAgICAgICAgLy8gdG9wIDAtOSBrZXlzXG4gICAgICAgICAgdmFsaWRLZXkgPSBTdHJpbmcoNDggLSBrZXlDb2RlKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXlDb2RlID49IDk2ICYmIGtleUNvZGUgPD0gMTA1KSB7XG4gICAgICAgICAgLy8gbnVtIHBhZCAwLTlcbiAgICAgICAgICB2YWxpZEtleSA9IFN0cmluZyg5NiAtIGtleUNvZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbGlkS2V5ID0gS0VZX0NPREVba2V5Q29kZV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWxpZEtleTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBub3JtYWxpemVkS2V5Rm9yRXZlbnQoa2V5RXZlbnQpIHtcbiAgICAgIC8vIGZhbGwgYmFjayBmcm9tIC5rZXksIHRvIC5rZXlJZGVudGlmaWVyLCB0byAua2V5Q29kZSwgYW5kIHRoZW4gdG9cbiAgICAgIC8vIC5kZXRhaWwua2V5IHRvIHN1cHBvcnQgYXJ0aWZpY2lhbCBrZXlib2FyZCBldmVudHNcbiAgICAgIHJldHVybiB0cmFuc2Zvcm1LZXkoa2V5RXZlbnQua2V5KSB8fFxuICAgICAgICB0cmFuc2Zvcm1LZXlJZGVudGlmaWVyKGtleUV2ZW50LmtleUlkZW50aWZpZXIpIHx8XG4gICAgICAgIHRyYW5zZm9ybUtleUNvZGUoa2V5RXZlbnQua2V5Q29kZSkgfHxcbiAgICAgICAgdHJhbnNmb3JtS2V5KGtleUV2ZW50LmRldGFpbC5rZXkpIHx8ICcnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGtleUNvbWJvTWF0Y2hlc0V2ZW50KGtleUNvbWJvLCBrZXlFdmVudCkge1xuICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRLZXlGb3JFdmVudChrZXlFdmVudCkgPT09IGtleUNvbWJvLmtleSAmJlxuICAgICAgICAhIWtleUV2ZW50LnNoaWZ0S2V5ID09PSAhIWtleUNvbWJvLnNoaWZ0S2V5ICYmXG4gICAgICAgICEha2V5RXZlbnQuY3RybEtleSA9PT0gISFrZXlDb21iby5jdHJsS2V5ICYmXG4gICAgICAgICEha2V5RXZlbnQuYWx0S2V5ID09PSAhIWtleUNvbWJvLmFsdEtleSAmJlxuICAgICAgICAhIWtleUV2ZW50Lm1ldGFLZXkgPT09ICEha2V5Q29tYm8ubWV0YUtleTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZUtleUNvbWJvU3RyaW5nKGtleUNvbWJvU3RyaW5nKSB7XG4gICAgICByZXR1cm4ga2V5Q29tYm9TdHJpbmcuc3BsaXQoJysnKS5yZWR1Y2UoZnVuY3Rpb24ocGFyc2VkS2V5Q29tYm8sIGtleUNvbWJvUGFydCkge1xuICAgICAgICB2YXIgZXZlbnRQYXJ0cyA9IGtleUNvbWJvUGFydC5zcGxpdCgnOicpO1xuICAgICAgICB2YXIga2V5TmFtZSA9IGV2ZW50UGFydHNbMF07XG4gICAgICAgIHZhciBldmVudCA9IGV2ZW50UGFydHNbMV07XG5cbiAgICAgICAgaWYgKGtleU5hbWUgaW4gTU9ESUZJRVJfS0VZUykge1xuICAgICAgICAgIHBhcnNlZEtleUNvbWJvW01PRElGSUVSX0tFWVNba2V5TmFtZV1dID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXJzZWRLZXlDb21iby5rZXkgPSBrZXlOYW1lO1xuICAgICAgICAgIHBhcnNlZEtleUNvbWJvLmV2ZW50ID0gZXZlbnQgfHwgJ2tleWRvd24nO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcnNlZEtleUNvbWJvO1xuICAgICAgfSwge1xuICAgICAgICBjb21ibzoga2V5Q29tYm9TdHJpbmcuc3BsaXQoJzonKS5zaGlmdCgpXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZUV2ZW50U3RyaW5nKGV2ZW50U3RyaW5nKSB7XG4gICAgICByZXR1cm4gZXZlbnRTdHJpbmcuc3BsaXQoJyAnKS5tYXAoZnVuY3Rpb24oa2V5Q29tYm9TdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlS2V5Q29tYm9TdHJpbmcoa2V5Q29tYm9TdHJpbmcpO1xuICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBgUG9seW1lci5Jcm9uQTExeUtleXNCZWhhdmlvcmAgcHJvdmlkZXMgYSBub3JtYWxpemVkIGludGVyZmFjZSBmb3IgcHJvY2Vzc2luZ1xuICAgICAqIGtleWJvYXJkIGNvbW1hbmRzIHRoYXQgcGVydGFpbiB0byBbV0FJLUFSSUEgYmVzdCBwcmFjdGljZXNdKGh0dHA6Ly93d3cudzMub3JnL1RSL3dhaS1hcmlhLXByYWN0aWNlcy8ja2JkX2dlbmVyYWxfYmluZGluZykuXG4gICAgICogVGhlIGVsZW1lbnQgdGFrZXMgY2FyZSBvZiBicm93c2VyIGRpZmZlcmVuY2VzIHdpdGggcmVzcGVjdCB0byBLZXlib2FyZCBldmVudHNcbiAgICAgKiBhbmQgdXNlcyBhbiBleHByZXNzaXZlIHN5bnRheCB0byBmaWx0ZXIga2V5IHByZXNzZXMuXG4gICAgICpcbiAgICAgKiBVc2UgdGhlIGBrZXlCaW5kaW5nc2AgcHJvdG90eXBlIHByb3BlcnR5IHRvIGV4cHJlc3Mgd2hhdCBjb21iaW5hdGlvbiBvZiBrZXlzXG4gICAgICogd2lsbCB0cmlnZ2VyIHRoZSBldmVudCB0byBmaXJlLlxuICAgICAqXG4gICAgICogVXNlIHRoZSBga2V5LWV2ZW50LXRhcmdldGAgYXR0cmlidXRlIHRvIHNldCB1cCBldmVudCBoYW5kbGVycyBvbiBhIHNwZWNpZmljXG4gICAgICogbm9kZS5cbiAgICAgKiBUaGUgYGtleXMtcHJlc3NlZGAgZXZlbnQgd2lsbCBmaXJlIHdoZW4gb25lIG9mIHRoZSBrZXkgY29tYmluYXRpb25zIHNldCB3aXRoIHRoZVxuICAgICAqIGBrZXlzYCBwcm9wZXJ0eSBpcyBwcmVzc2VkLlxuICAgICAqXG4gICAgICogQGRlbW8gZGVtby9pbmRleC5odG1sXG4gICAgICogQHBvbHltZXJCZWhhdmlvciBJcm9uQTExeUtleXNCZWhhdmlvclxuICAgICAqL1xuICAgIFBvbHltZXIuSXJvbkExMXlLZXlzQmVoYXZpb3IgPSB7XG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgSFRNTEVsZW1lbnQgdGhhdCB3aWxsIGJlIGZpcmluZyByZWxldmFudCBLZXlib2FyZEV2ZW50cy5cbiAgICAgICAgICovXG4gICAgICAgIGtleUV2ZW50VGFyZ2V0OiB7XG4gICAgICAgICAgdHlwZTogT2JqZWN0LFxuICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfYm91bmRLZXlIYW5kbGVyczoge1xuICAgICAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gV2UgdXNlIHRoaXMgZHVlIHRvIGEgbGltaXRhdGlvbiBpbiBJRTEwIHdoZXJlIGluc3RhbmNlcyB3aWxsIGhhdmVcbiAgICAgICAgLy8gb3duIHByb3BlcnRpZXMgb2YgZXZlcnl0aGluZyBvbiB0aGUgXCJwcm90b3R5cGVcIi5cbiAgICAgICAgX2ltcGVyYXRpdmVLZXlCaW5kaW5nczoge1xuICAgICAgICAgIHR5cGU6IE9iamVjdCxcbiAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBvYnNlcnZlcnM6IFtcbiAgICAgICAgJ19yZXNldEtleUV2ZW50TGlzdGVuZXJzKGtleUV2ZW50VGFyZ2V0LCBfYm91bmRLZXlIYW5kbGVycyknXG4gICAgICBdLFxuXG4gICAgICBrZXlCaW5kaW5nczoge30sXG5cbiAgICAgIHJlZ2lzdGVyZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9wcmVwS2V5QmluZGluZ3MoKTtcbiAgICAgIH0sXG5cbiAgICAgIGF0dGFjaGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fbGlzdGVuS2V5RXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgIH0sXG5cbiAgICAgIGRldGFjaGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fdW5saXN0ZW5LZXlFdmVudExpc3RlbmVycygpO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBDYW4gYmUgdXNlZCB0byBpbXBlcmF0aXZlbHkgYWRkIGEga2V5IGJpbmRpbmcgdG8gdGhlIGltcGxlbWVudGluZ1xuICAgICAgICogZWxlbWVudC4gVGhpcyBpcyB0aGUgaW1wZXJhdGl2ZSBlcXVpdmFsZW50IG9mIGRlY2xhcmluZyBhIGtleWJpbmRpbmdcbiAgICAgICAqIGluIHRoZSBga2V5QmluZGluZ3NgIHByb3RvdHlwZSBwcm9wZXJ0eS5cbiAgICAgICAqL1xuICAgICAgYWRkT3duS2V5QmluZGluZzogZnVuY3Rpb24oZXZlbnRTdHJpbmcsIGhhbmRsZXJOYW1lKSB7XG4gICAgICAgIHRoaXMuX2ltcGVyYXRpdmVLZXlCaW5kaW5nc1tldmVudFN0cmluZ10gPSBoYW5kbGVyTmFtZTtcbiAgICAgICAgdGhpcy5fcHJlcEtleUJpbmRpbmdzKCk7XG4gICAgICAgIHRoaXMuX3Jlc2V0S2V5RXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogV2hlbiBjYWxsZWQsIHdpbGwgcmVtb3ZlIGFsbCBpbXBlcmF0aXZlbHktYWRkZWQga2V5IGJpbmRpbmdzLlxuICAgICAgICovXG4gICAgICByZW1vdmVPd25LZXlCaW5kaW5nczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2ltcGVyYXRpdmVLZXlCaW5kaW5ncyA9IHt9O1xuICAgICAgICB0aGlzLl9wcmVwS2V5QmluZGluZ3MoKTtcbiAgICAgICAgdGhpcy5fcmVzZXRLZXlFdmVudExpc3RlbmVycygpO1xuICAgICAgfSxcblxuICAgICAga2V5Ym9hcmRFdmVudE1hdGNoZXNLZXlzOiBmdW5jdGlvbihldmVudCwgZXZlbnRTdHJpbmcpIHtcbiAgICAgICAgdmFyIGtleUNvbWJvcyA9IHBhcnNlRXZlbnRTdHJpbmcoZXZlbnRTdHJpbmcpO1xuICAgICAgICB2YXIgaW5kZXg7XG5cbiAgICAgICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwga2V5Q29tYm9zLmxlbmd0aDsgKytpbmRleCkge1xuICAgICAgICAgIGlmIChrZXlDb21ib01hdGNoZXNFdmVudChrZXlDb21ib3NbaW5kZXhdLCBldmVudCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sXG5cbiAgICAgIF9jb2xsZWN0S2V5QmluZGluZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIga2V5QmluZGluZ3MgPSB0aGlzLmJlaGF2aW9ycy5tYXAoZnVuY3Rpb24oYmVoYXZpb3IpIHtcbiAgICAgICAgICByZXR1cm4gYmVoYXZpb3Iua2V5QmluZGluZ3M7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChrZXlCaW5kaW5ncy5pbmRleE9mKHRoaXMua2V5QmluZGluZ3MpID09PSAtMSkge1xuICAgICAgICAgIGtleUJpbmRpbmdzLnB1c2godGhpcy5rZXlCaW5kaW5ncyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ga2V5QmluZGluZ3M7XG4gICAgICB9LFxuXG4gICAgICBfcHJlcEtleUJpbmRpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fa2V5QmluZGluZ3MgPSB7fTtcblxuICAgICAgICB0aGlzLl9jb2xsZWN0S2V5QmluZGluZ3MoKS5mb3JFYWNoKGZ1bmN0aW9uKGtleUJpbmRpbmdzKSB7XG4gICAgICAgICAgZm9yICh2YXIgZXZlbnRTdHJpbmcgaW4ga2V5QmluZGluZ3MpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZEtleUJpbmRpbmcoZXZlbnRTdHJpbmcsIGtleUJpbmRpbmdzW2V2ZW50U3RyaW5nXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBmb3IgKHZhciBldmVudFN0cmluZyBpbiB0aGlzLl9pbXBlcmF0aXZlS2V5QmluZGluZ3MpIHtcbiAgICAgICAgICB0aGlzLl9hZGRLZXlCaW5kaW5nKGV2ZW50U3RyaW5nLCB0aGlzLl9pbXBlcmF0aXZlS2V5QmluZGluZ3NbZXZlbnRTdHJpbmddKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgX2FkZEtleUJpbmRpbmc6IGZ1bmN0aW9uKGV2ZW50U3RyaW5nLCBoYW5kbGVyTmFtZSkge1xuICAgICAgICBwYXJzZUV2ZW50U3RyaW5nKGV2ZW50U3RyaW5nKS5mb3JFYWNoKGZ1bmN0aW9uKGtleUNvbWJvKSB7XG4gICAgICAgICAgdGhpcy5fa2V5QmluZGluZ3Nba2V5Q29tYm8uZXZlbnRdID1cbiAgICAgICAgICAgIHRoaXMuX2tleUJpbmRpbmdzW2tleUNvbWJvLmV2ZW50XSB8fCBbXTtcblxuICAgICAgICAgIHRoaXMuX2tleUJpbmRpbmdzW2tleUNvbWJvLmV2ZW50XS5wdXNoKFtcbiAgICAgICAgICAgIGtleUNvbWJvLFxuICAgICAgICAgICAgaGFuZGxlck5hbWVcbiAgICAgICAgICBdKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9LFxuXG4gICAgICBfcmVzZXRLZXlFdmVudExpc3RlbmVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3VubGlzdGVuS2V5RXZlbnRMaXN0ZW5lcnMoKTtcblxuICAgICAgICBpZiAodGhpcy5pc0F0dGFjaGVkKSB7XG4gICAgICAgICAgdGhpcy5fbGlzdGVuS2V5RXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgX2xpc3RlbktleUV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5fa2V5QmluZGluZ3MpLmZvckVhY2goZnVuY3Rpb24oZXZlbnROYW1lKSB7XG4gICAgICAgICAgdmFyIGtleUJpbmRpbmdzID0gdGhpcy5fa2V5QmluZGluZ3NbZXZlbnROYW1lXTtcbiAgICAgICAgICB2YXIgYm91bmRLZXlIYW5kbGVyID0gdGhpcy5fb25LZXlCaW5kaW5nRXZlbnQuYmluZCh0aGlzLCBrZXlCaW5kaW5ncyk7XG5cbiAgICAgICAgICB0aGlzLl9ib3VuZEtleUhhbmRsZXJzLnB1c2goW3RoaXMua2V5RXZlbnRUYXJnZXQsIGV2ZW50TmFtZSwgYm91bmRLZXlIYW5kbGVyXSk7XG5cbiAgICAgICAgICB0aGlzLmtleUV2ZW50VGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBib3VuZEtleUhhbmRsZXIpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH0sXG5cbiAgICAgIF91bmxpc3RlbktleUV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGtleUhhbmRsZXJUdXBsZTtcbiAgICAgICAgdmFyIGtleUV2ZW50VGFyZ2V0O1xuICAgICAgICB2YXIgZXZlbnROYW1lO1xuICAgICAgICB2YXIgYm91bmRLZXlIYW5kbGVyO1xuXG4gICAgICAgIHdoaWxlICh0aGlzLl9ib3VuZEtleUhhbmRsZXJzLmxlbmd0aCkge1xuICAgICAgICAgIC8vIE15IGtpbmdkb20gZm9yIGJsb2NrLXNjb3BlIGJpbmRpbmcgYW5kIGRlc3RydWN0dXJpbmcgYXNzaWdubWVudC4uXG4gICAgICAgICAga2V5SGFuZGxlclR1cGxlID0gdGhpcy5fYm91bmRLZXlIYW5kbGVycy5wb3AoKTtcbiAgICAgICAgICBrZXlFdmVudFRhcmdldCA9IGtleUhhbmRsZXJUdXBsZVswXTtcbiAgICAgICAgICBldmVudE5hbWUgPSBrZXlIYW5kbGVyVHVwbGVbMV07XG4gICAgICAgICAgYm91bmRLZXlIYW5kbGVyID0ga2V5SGFuZGxlclR1cGxlWzJdO1xuXG4gICAgICAgICAga2V5RXZlbnRUYXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGJvdW5kS2V5SGFuZGxlcik7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIF9vbktleUJpbmRpbmdFdmVudDogZnVuY3Rpb24oa2V5QmluZGluZ3MsIGV2ZW50KSB7XG4gICAgICAgIGtleUJpbmRpbmdzLmZvckVhY2goZnVuY3Rpb24oa2V5QmluZGluZykge1xuICAgICAgICAgIHZhciBrZXlDb21ibyA9IGtleUJpbmRpbmdbMF07XG4gICAgICAgICAgdmFyIGhhbmRsZXJOYW1lID0ga2V5QmluZGluZ1sxXTtcblxuICAgICAgICAgIGlmICghZXZlbnQuZGVmYXVsdFByZXZlbnRlZCAmJiBrZXlDb21ib01hdGNoZXNFdmVudChrZXlDb21ibywgZXZlbnQpKSB7XG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyS2V5SGFuZGxlcihrZXlDb21ibywgaGFuZGxlck5hbWUsIGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfSxcblxuICAgICAgX3RyaWdnZXJLZXlIYW5kbGVyOiBmdW5jdGlvbihrZXlDb21ibywgaGFuZGxlck5hbWUsIGtleWJvYXJkRXZlbnQpIHtcbiAgICAgICAgdmFyIGRldGFpbCA9IE9iamVjdC5jcmVhdGUoa2V5Q29tYm8pO1xuICAgICAgICBkZXRhaWwua2V5Ym9hcmRFdmVudCA9IGtleWJvYXJkRXZlbnQ7XG5cbiAgICAgICAgdGhpc1toYW5kbGVyTmFtZV0uY2FsbCh0aGlzLCBuZXcgQ3VzdG9tRXZlbnQoa2V5Q29tYm8uZXZlbnQsIHtcbiAgICAgICAgICBkZXRhaWw6IGRldGFpbFxuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSkoKTtcblxufSkoKTtcblxufSkiLCJyZXF1aXJlKFwiLi4vcG9seW1lci9wb2x5bWVyLmh0bWxcIik7XG5yZXF1aXJlKFwiLi4vaXJvbi1hMTF5LWtleXMtYmVoYXZpb3IvaXJvbi1hMTF5LWtleXMtYmVoYXZpb3IuaHRtbFwiKTtcbnJlcXVpcmUoXCIuL2lyb24tY29udHJvbC1zdGF0ZS5odG1sXCIpO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixmdW5jdGlvbigpIHtcbjsoZnVuY3Rpb24oKSB7XG5cblxuICAvKipcbiAgICogQGRlbW8gZGVtby9pbmRleC5odG1sXG4gICAqIEBwb2x5bWVyQmVoYXZpb3IgUG9seW1lci5Jcm9uQnV0dG9uU3RhdGVcbiAgICovXG4gIFBvbHltZXIuSXJvbkJ1dHRvblN0YXRlSW1wbCA9IHtcblxuICAgIHByb3BlcnRpZXM6IHtcblxuICAgICAgLyoqXG4gICAgICAgKiBJZiB0cnVlLCB0aGUgdXNlciBpcyBjdXJyZW50bHkgaG9sZGluZyBkb3duIHRoZSBidXR0b24uXG4gICAgICAgKi9cbiAgICAgIHByZXNzZWQ6IHtcbiAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICBvYnNlcnZlcjogJ19wcmVzc2VkQ2hhbmdlZCdcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogSWYgdHJ1ZSwgdGhlIGJ1dHRvbiB0b2dnbGVzIHRoZSBhY3RpdmUgc3RhdGUgd2l0aCBlYWNoIHRhcCBvciBwcmVzc1xuICAgICAgICogb2YgdGhlIHNwYWNlYmFyLlxuICAgICAgICovXG4gICAgICB0b2dnbGVzOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlOiB0cnVlXG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIElmIHRydWUsIHRoZSBidXR0b24gaXMgYSB0b2dnbGUgYW5kIGlzIGN1cnJlbnRseSBpbiB0aGUgYWN0aXZlIHN0YXRlLlxuICAgICAgICovXG4gICAgICBhY3RpdmU6IHtcbiAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgdmFsdWU6IGZhbHNlLFxuICAgICAgICBub3RpZnk6IHRydWUsXG4gICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgb2JzZXJ2ZXI6ICdfYWN0aXZlQ2hhbmdlZCdcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogVHJ1ZSBpZiB0aGUgZWxlbWVudCBpcyBjdXJyZW50bHkgYmVpbmcgcHJlc3NlZCBieSBhIFwicG9pbnRlcixcIiB3aGljaFxuICAgICAgICogaXMgbG9vc2VseSBkZWZpbmVkIGFzIG1vdXNlIG9yIHRvdWNoIGlucHV0IChidXQgc3BlY2lmaWNhbGx5IGV4Y2x1ZGluZ1xuICAgICAgICoga2V5Ym9hcmQgaW5wdXQpLlxuICAgICAgICovXG4gICAgICBwb2ludGVyRG93bjoge1xuICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIFRydWUgaWYgdGhlIGlucHV0IGRldmljZSB0aGF0IGNhdXNlZCB0aGUgZWxlbWVudCB0byByZWNlaXZlIGZvY3VzXG4gICAgICAgKiB3YXMgYSBrZXlib2FyZC5cbiAgICAgICAqL1xuICAgICAgcmVjZWl2ZWRGb2N1c0Zyb21LZXlib2FyZDoge1xuICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICByZWFkT25seTogdHJ1ZVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBsaXN0ZW5lcnM6IHtcbiAgICAgIGRvd246ICdfZG93bkhhbmRsZXInLFxuICAgICAgdXA6ICdfdXBIYW5kbGVyJyxcbiAgICAgIHRhcDogJ190YXBIYW5kbGVyJ1xuICAgIH0sXG5cbiAgICBvYnNlcnZlcnM6IFtcbiAgICAgICdfZGV0ZWN0S2V5Ym9hcmRGb2N1cyhmb2N1c2VkKSdcbiAgICBdLFxuXG4gICAga2V5QmluZGluZ3M6IHtcbiAgICAgICdlbnRlcjprZXlkb3duJzogJ19hc3luY0NsaWNrJyxcbiAgICAgICdzcGFjZTprZXlkb3duJzogJ19zcGFjZUtleURvd25IYW5kbGVyJyxcbiAgICAgICdzcGFjZTprZXl1cCc6ICdfc3BhY2VLZXlVcEhhbmRsZXInLFxuICAgIH0sXG5cbiAgICBfdGFwSGFuZGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy50b2dnbGVzKSB7XG4gICAgICAgLy8gYSB0YXAgaXMgbmVlZGVkIHRvIHRvZ2dsZSB0aGUgYWN0aXZlIHN0YXRlXG4gICAgICAgIHRoaXMuX3VzZXJBY3RpdmF0ZSghdGhpcy5hY3RpdmUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2RldGVjdEtleWJvYXJkRm9jdXM6IGZ1bmN0aW9uKGZvY3VzZWQpIHtcbiAgICAgIHRoaXMuX3NldFJlY2VpdmVkRm9jdXNGcm9tS2V5Ym9hcmQoIXRoaXMucG9pbnRlckRvd24gJiYgZm9jdXNlZCk7XG4gICAgfSxcblxuICAgIC8vIHRvIGVtdWxhdGUgbmF0aXZlIGNoZWNrYm94LCAoZGUtKWFjdGl2YXRpb25zIGZyb20gYSB1c2VyIGludGVyYWN0aW9uIGZpcmVcbiAgICAvLyAnY2hhbmdlJyBldmVudHNcbiAgICBfdXNlckFjdGl2YXRlOiBmdW5jdGlvbihhY3RpdmUpIHtcbiAgICAgIHRoaXMuYWN0aXZlID0gYWN0aXZlO1xuICAgICAgdGhpcy5maXJlKCdjaGFuZ2UnKTtcbiAgICB9LFxuXG4gICAgX2Rvd25IYW5kbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3NldFBvaW50ZXJEb3duKHRydWUpO1xuICAgICAgdGhpcy5fc2V0UHJlc3NlZCh0cnVlKTtcbiAgICAgIHRoaXMuX3NldFJlY2VpdmVkRm9jdXNGcm9tS2V5Ym9hcmQoZmFsc2UpO1xuICAgIH0sXG5cbiAgICBfdXBIYW5kbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3NldFBvaW50ZXJEb3duKGZhbHNlKTtcbiAgICAgIHRoaXMuX3NldFByZXNzZWQoZmFsc2UpO1xuICAgIH0sXG5cbiAgICBfc3BhY2VLZXlEb3duSGFuZGxlcjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBrZXlib2FyZEV2ZW50ID0gZXZlbnQuZGV0YWlsLmtleWJvYXJkRXZlbnQ7XG4gICAgICBrZXlib2FyZEV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBrZXlib2FyZEV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgdGhpcy5fc2V0UHJlc3NlZCh0cnVlKTtcbiAgICB9LFxuXG4gICAgX3NwYWNlS2V5VXBIYW5kbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnByZXNzZWQpIHtcbiAgICAgICAgdGhpcy5fYXN5bmNDbGljaygpO1xuICAgICAgfVxuICAgICAgdGhpcy5fc2V0UHJlc3NlZChmYWxzZSk7XG4gICAgfSxcblxuICAgIC8vIHRyaWdnZXIgY2xpY2sgYXN5bmNocm9ub3VzbHksIHRoZSBhc3luY2hyb255IGlzIHVzZWZ1bCB0byBhbGxvdyBvbmVcbiAgICAvLyBldmVudCBoYW5kbGVyIHRvIHVud2luZCBiZWZvcmUgdHJpZ2dlcmluZyBhbm90aGVyIGV2ZW50XG4gICAgX2FzeW5jQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hc3luYyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5jbGljaygpO1xuICAgICAgfSwgMSk7XG4gICAgfSxcblxuICAgIC8vIGFueSBvZiB0aGVzZSBjaGFuZ2VzIGFyZSBjb25zaWRlcmVkIGEgY2hhbmdlIHRvIGJ1dHRvbiBzdGF0ZVxuXG4gICAgX3ByZXNzZWRDaGFuZ2VkOiBmdW5jdGlvbihwcmVzc2VkKSB7XG4gICAgICB0aGlzLl9jaGFuZ2VkQnV0dG9uU3RhdGUoKTtcbiAgICB9LFxuXG4gICAgX2FjdGl2ZUNoYW5nZWQ6IGZ1bmN0aW9uKGFjdGl2ZSkge1xuICAgICAgaWYgKHRoaXMudG9nZ2xlcykge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJywgYWN0aXZlID8gJ3RydWUnIDogJ2ZhbHNlJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1wcmVzc2VkJyk7XG4gICAgICB9XG4gICAgICB0aGlzLl9jaGFuZ2VkQnV0dG9uU3RhdGUoKTtcbiAgICB9LFxuXG4gICAgX2NvbnRyb2xTdGF0ZUNoYW5nZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgICAgdGhpcy5fc2V0UHJlc3NlZChmYWxzZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9jaGFuZ2VkQnV0dG9uU3RhdGUoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gcHJvdmlkZSBob29rIGZvciBmb2xsb3ctb24gYmVoYXZpb3JzIHRvIHJlYWN0IHRvIGJ1dHRvbi1zdGF0ZVxuXG4gICAgX2NoYW5nZWRCdXR0b25TdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fYnV0dG9uU3RhdGVDaGFuZ2VkKSB7XG4gICAgICAgIHRoaXMuX2J1dHRvblN0YXRlQ2hhbmdlZCgpOyAvLyBhYnN0cmFjdFxuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIC8qKiBAcG9seW1lckJlaGF2aW9yICovXG4gIFBvbHltZXIuSXJvbkJ1dHRvblN0YXRlID0gW1xuICAgIFBvbHltZXIuSXJvbkExMXlLZXlzQmVoYXZpb3IsXG4gICAgUG9seW1lci5Jcm9uQnV0dG9uU3RhdGVJbXBsXG4gIF07XG5cblxufSkoKTtcblxufSkiLCJyZXF1aXJlKFwiLi4vcG9seW1lci9wb2x5bWVyLmh0bWxcIik7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGZ1bmN0aW9uKCkge1xuOyhmdW5jdGlvbigpIHtcblxuXG4gIC8qKlxuICAgKiBAZGVtbyBkZW1vL2luZGV4Lmh0bWxcbiAgICogQHBvbHltZXJCZWhhdmlvclxuICAgKi9cbiAgUG9seW1lci5Jcm9uQ29udHJvbFN0YXRlID0ge1xuXG4gICAgcHJvcGVydGllczoge1xuXG4gICAgICAvKipcbiAgICAgICAqIElmIHRydWUsIHRoZSBlbGVtZW50IGN1cnJlbnRseSBoYXMgZm9jdXMuXG4gICAgICAgKi9cbiAgICAgIGZvY3VzZWQ6IHtcbiAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgdmFsdWU6IGZhbHNlLFxuICAgICAgICBub3RpZnk6IHRydWUsXG4gICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWVcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogSWYgdHJ1ZSwgdGhlIHVzZXIgY2Fubm90IGludGVyYWN0IHdpdGggdGhpcyBlbGVtZW50LlxuICAgICAgICovXG4gICAgICBkaXNhYmxlZDoge1xuICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICAgIG5vdGlmeTogdHJ1ZSxcbiAgICAgICAgb2JzZXJ2ZXI6ICdfZGlzYWJsZWRDaGFuZ2VkJyxcbiAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlOiB0cnVlXG4gICAgICB9LFxuXG4gICAgICBfb2xkVGFiSW5kZXg6IHtcbiAgICAgICAgdHlwZTogTnVtYmVyXG4gICAgICB9LFxuXG4gICAgICBfYm91bmRGb2N1c0JsdXJIYW5kbGVyOiB7XG4gICAgICAgIHR5cGU6IEZ1bmN0aW9uLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2ZvY3VzQmx1ckhhbmRsZXIuYmluZCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfSxcblxuICAgIG9ic2VydmVyczogW1xuICAgICAgJ19jaGFuZ2VkQ29udHJvbFN0YXRlKGZvY3VzZWQsIGRpc2FibGVkKSdcbiAgICBdLFxuXG4gICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gVE9ETyhzam1pbGVzKTogZW5zdXJlIHJlYWQtb25seSBwcm9wZXJ0eSBpcyB2YWx1ZWQgc28gdGhlIGNvbXBvdW5kXG4gICAgICAvLyBvYnNlcnZlciB3aWxsIGZpcmVcbiAgICAgIGlmICh0aGlzLmZvY3VzZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLl9zZXRGb2N1c2VkKGZhbHNlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9ib3VuZEZvY3VzQmx1ckhhbmRsZXIsIHRydWUpO1xuICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5fYm91bmRGb2N1c0JsdXJIYW5kbGVyLCB0cnVlKTtcbiAgICB9LFxuXG4gICAgX2ZvY3VzQmx1ckhhbmRsZXI6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gZXZlbnQucGF0aCA/IGV2ZW50LnBhdGhbMF0gOiBldmVudC50YXJnZXQ7XG4gICAgICBpZiAodGFyZ2V0ID09PSB0aGlzKSB7XG4gICAgICAgIHZhciBmb2N1c2VkID0gZXZlbnQudHlwZSA9PT0gJ2ZvY3VzJztcbiAgICAgICAgdGhpcy5fc2V0Rm9jdXNlZChmb2N1c2VkKTtcbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc2hhZG93Um9vdCkge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5maXJlKGV2ZW50LnR5cGUsIHtzb3VyY2VFdmVudDogZXZlbnR9LCB7XG4gICAgICAgICAgbm9kZTogdGhpcyxcbiAgICAgICAgICBidWJibGVzOiBldmVudC5idWJibGVzLFxuICAgICAgICAgIGNhbmNlbGFibGU6IGV2ZW50LmNhbmNlbGFibGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIF9kaXNhYmxlZENoYW5nZWQ6IGZ1bmN0aW9uKGRpc2FibGVkLCBvbGQpIHtcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWRpc2FibGVkJywgZGlzYWJsZWQgPyAndHJ1ZScgOiAnZmFsc2UnKTtcbiAgICAgIHRoaXMuc3R5bGUucG9pbnRlckV2ZW50cyA9IGRpc2FibGVkID8gJ25vbmUnIDogJyc7XG4gICAgICBpZiAoZGlzYWJsZWQpIHtcbiAgICAgICAgdGhpcy5fb2xkVGFiSW5kZXggPSB0aGlzLnRhYkluZGV4O1xuICAgICAgICB0aGlzLmZvY3VzZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50YWJJbmRleCA9IC0xO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9vbGRUYWJJbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMudGFiSW5kZXggPSB0aGlzLl9vbGRUYWJJbmRleDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2NoYW5nZWRDb250cm9sU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gX2NvbnRyb2xTdGF0ZUNoYW5nZWQgaXMgYWJzdHJhY3QsIGZvbGxvdy1vbiBiZWhhdmlvcnMgbWF5IGltcGxlbWVudCBpdFxuICAgICAgaWYgKHRoaXMuX2NvbnRyb2xTdGF0ZUNoYW5nZWQpIHtcbiAgICAgICAgdGhpcy5fY29udHJvbFN0YXRlQ2hhbmdlZCgpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG5cbn0pKCk7XG5cbn0pIiwicmVxdWlyZShcIi4uL3BvbHltZXIvcG9seW1lci5odG1sXCIpO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixmdW5jdGlvbigpIHtcbnZhciBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdO1xudmFyIHJvb3QgPSBib2R5LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikpO1xucm9vdC5zZXRBdHRyaWJ1dGUoXCJoaWRkZW5cIixcIlwiKTtcbnJvb3QuaW5uZXJIVE1MPVwiPGRvbS1tb2R1bGUgaWQ9XFxcImlyb24tY29sbGFwc2VcXFwiPjxzdHlsZT46aG9zdHtkaXNwbGF5OmJsb2NrO3RyYW5zaXRpb24tZHVyYXRpb246MzAwbXN9Omhvc3QoLmlyb24tY29sbGFwc2UtY2xvc2VkKXtkaXNwbGF5Om5vbmV9Omhvc3QoOm5vdCguaXJvbi1jb2xsYXBzZS1vcGVuZWQpKXtvdmVyZmxvdzpoaWRkZW59PC9zdHlsZT48dGVtcGxhdGU+XFxuXFxuICAgIDxjb250ZW50PjwvY29udGVudD5cXG5cXG4gIDwvdGVtcGxhdGU+PC9kb20tbW9kdWxlPlwiO1xuOyhmdW5jdGlvbigpIHtcblxuXG4gIFBvbHltZXIoe1xuXG4gICAgaXM6ICdpcm9uLWNvbGxhcHNlJyxcblxuICAgIHByb3BlcnRpZXM6IHtcblxuICAgICAgLyoqXG4gICAgICAgKiBJZiB0cnVlLCB0aGUgb3JpZW50YXRpb24gaXMgaG9yaXpvbnRhbDsgb3RoZXJ3aXNlIGlzIHZlcnRpY2FsLlxuICAgICAgICpcbiAgICAgICAqIEBhdHRyaWJ1dGUgaG9yaXpvbnRhbFxuICAgICAgICovXG4gICAgICBob3Jpem9udGFsOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgICAgb2JzZXJ2ZXI6ICdfaG9yaXpvbnRhbENoYW5nZWQnXG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIFNldCBvcGVuZWQgdG8gdHJ1ZSB0byBzaG93IHRoZSBjb2xsYXBzZSBlbGVtZW50IGFuZCB0byBmYWxzZSB0byBoaWRlIGl0LlxuICAgICAgICpcbiAgICAgICAqIEBhdHRyaWJ1dGUgb3BlbmVkXG4gICAgICAgKi9cbiAgICAgIG9wZW5lZDoge1xuICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICAgIG5vdGlmeTogdHJ1ZSxcbiAgICAgICAgb2JzZXJ2ZXI6ICdfb3BlbmVkQ2hhbmdlZCdcbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICBob3N0QXR0cmlidXRlczoge1xuICAgICAgcm9sZTogJ2dyb3VwJyxcbiAgICAgICdhcmlhLWV4cGFuZGVkJzogJ2ZhbHNlJ1xuICAgIH0sXG5cbiAgICBsaXN0ZW5lcnM6IHtcbiAgICAgIHRyYW5zaXRpb25lbmQ6ICdfdHJhbnNpdGlvbkVuZCdcbiAgICB9LFxuXG4gICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQXZvaWQgdHJhbnNpdGlvbiBhdCB0aGUgYmVnaW5uaW5nIGUuZy4gcGFnZSBsb2FkcyBhbmQgZW5hYmxlXG4gICAgICAvLyB0cmFuc2l0aW9ucyBvbmx5IGFmdGVyIHRoZSBlbGVtZW50IGlzIHJlbmRlcmVkIGFuZCByZWFkeS5cbiAgICAgIHRoaXMuX2VuYWJsZVRyYW5zaXRpb24gPSB0cnVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgdGhlIG9wZW5lZCBzdGF0ZS5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgdG9nZ2xlXG4gICAgICovXG4gICAgdG9nZ2xlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMub3BlbmVkID0gIXRoaXMub3BlbmVkO1xuICAgIH0sXG5cbiAgICBzaG93OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMudG9nZ2xlQ2xhc3MoJ2lyb24tY29sbGFwc2UtY2xvc2VkJywgZmFsc2UpO1xuICAgICAgdGhpcy51cGRhdGVTaXplKCdhdXRvJywgZmFsc2UpO1xuICAgICAgdmFyIHMgPSB0aGlzLl9jYWxjU2l6ZSgpO1xuICAgICAgdGhpcy51cGRhdGVTaXplKCcwcHgnLCBmYWxzZSk7XG4gICAgICAvLyBmb3JjZSBsYXlvdXQgdG8gZW5zdXJlIHRyYW5zaXRpb24gd2lsbCBnb1xuICAgICAgdGhpcy5vZmZzZXRIZWlnaHQ7XG4gICAgICB0aGlzLnVwZGF0ZVNpemUocywgdHJ1ZSk7XG4gICAgfSxcblxuICAgIGhpZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy50b2dnbGVDbGFzcygnaXJvbi1jb2xsYXBzZS1vcGVuZWQnLCBmYWxzZSk7XG4gICAgICB0aGlzLnVwZGF0ZVNpemUodGhpcy5fY2FsY1NpemUoKSwgZmFsc2UpO1xuICAgICAgLy8gZm9yY2UgbGF5b3V0IHRvIGVuc3VyZSB0cmFuc2l0aW9uIHdpbGwgZ29cbiAgICAgIHRoaXMub2Zmc2V0SGVpZ2h0O1xuICAgICAgdGhpcy51cGRhdGVTaXplKCcwcHgnLCB0cnVlKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlU2l6ZTogZnVuY3Rpb24oc2l6ZSwgYW5pbWF0ZWQpIHtcbiAgICAgIHRoaXMuZW5hYmxlVHJhbnNpdGlvbihhbmltYXRlZCk7XG4gICAgICB2YXIgcyA9IHRoaXMuc3R5bGU7XG4gICAgICB2YXIgbm9jaGFuZ2UgPSBzW3RoaXMuZGltZW5zaW9uXSA9PT0gc2l6ZTtcbiAgICAgIHNbdGhpcy5kaW1lbnNpb25dID0gc2l6ZTtcbiAgICAgIGlmIChhbmltYXRlZCAmJiBub2NoYW5nZSkge1xuICAgICAgICB0aGlzLl90cmFuc2l0aW9uRW5kKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGVuYWJsZVRyYW5zaXRpb246IGZ1bmN0aW9uKGVuYWJsZWQpIHtcbiAgICAgIHRoaXMuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gKGVuYWJsZWQgJiYgdGhpcy5fZW5hYmxlVHJhbnNpdGlvbikgPyAnJyA6ICcwcyc7XG4gICAgfSxcblxuICAgIF9ob3Jpem9udGFsQ2hhbmdlZDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRpbWVuc2lvbiA9IHRoaXMuaG9yaXpvbnRhbCA/ICd3aWR0aCcgOiAnaGVpZ2h0JztcbiAgICAgIHRoaXMuc3R5bGUudHJhbnNpdGlvblByb3BlcnR5ID0gdGhpcy5kaW1lbnNpb247XG4gICAgfSxcblxuICAgIF9vcGVuZWRDaGFuZ2VkOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXNbdGhpcy5vcGVuZWQgPyAnc2hvdycgOiAnaGlkZSddKCk7XG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIHRoaXMub3BlbmVkID8gJ3RydWUnIDogJ2ZhbHNlJyk7XG5cbiAgICB9LFxuXG4gICAgX3RyYW5zaXRpb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMub3BlbmVkKSB7XG4gICAgICAgIHRoaXMudXBkYXRlU2l6ZSgnYXV0bycsIGZhbHNlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudG9nZ2xlQ2xhc3MoJ2lyb24tY29sbGFwc2UtY2xvc2VkJywgIXRoaXMub3BlbmVkKTtcbiAgICAgIHRoaXMudG9nZ2xlQ2xhc3MoJ2lyb24tY29sbGFwc2Utb3BlbmVkJywgdGhpcy5vcGVuZWQpO1xuICAgICAgdGhpcy5lbmFibGVUcmFuc2l0aW9uKGZhbHNlKTtcbiAgICB9LFxuXG4gICAgX2NhbGNTaXplOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpW3RoaXMuZGltZW5zaW9uXSArICdweCc7XG4gICAgfSxcblxuXG4gIH0pO1xuXG5cbn0pKCk7XG5cbn0pIiwicmVxdWlyZShcIi4uL3BvbHltZXIvcG9seW1lci5odG1sXCIpO1xucmVxdWlyZShcIi4uL2lyb24tYmVoYXZpb3JzL2lyb24tYnV0dG9uLXN0YXRlLmh0bWxcIik7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGZ1bmN0aW9uKCkge1xuOyhmdW5jdGlvbigpIHtcblxuXG4gIC8qKiBAcG9seW1lckJlaGF2aW9yICovXG4gIFBvbHltZXIuUGFwZXJCdXR0b25CZWhhdmlvckltcGwgPSB7XG5cbiAgICBwcm9wZXJ0aWVzOiB7XG5cbiAgICAgIF9lbGV2YXRpb246IHtcbiAgICAgICAgdHlwZTogTnVtYmVyXG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgb2JzZXJ2ZXJzOiBbXG4gICAgICAnX2NhbGN1bGF0ZUVsZXZhdGlvbihmb2N1c2VkLCBkaXNhYmxlZCwgYWN0aXZlLCBwcmVzc2VkLCByZWNlaXZlZEZvY3VzRnJvbUtleWJvYXJkKSdcbiAgICBdLFxuXG4gICAgaG9zdEF0dHJpYnV0ZXM6IHtcbiAgICAgIHJvbGU6ICdidXR0b24nLFxuICAgICAgdGFiaW5kZXg6ICcwJ1xuICAgIH0sXG5cbiAgICBfY2FsY3VsYXRlRWxldmF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlID0gMTtcbiAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICAgIGUgPSAwO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmFjdGl2ZSB8fCB0aGlzLnByZXNzZWQpIHtcbiAgICAgICAgZSA9IDQ7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMucmVjZWl2ZWRGb2N1c0Zyb21LZXlib2FyZCkge1xuICAgICAgICBlID0gMztcbiAgICAgIH1cbiAgICAgIHRoaXMuX2VsZXZhdGlvbiA9IGU7XG4gICAgfVxuICB9O1xuXG4gIC8qKiBAcG9seW1lckJlaGF2aW9yICovXG4gIFBvbHltZXIuUGFwZXJCdXR0b25CZWhhdmlvciA9IFtcbiAgICBQb2x5bWVyLklyb25CdXR0b25TdGF0ZSxcbiAgICBQb2x5bWVyLklyb25Db250cm9sU3RhdGUsXG4gICAgUG9seW1lci5QYXBlckJ1dHRvbkJlaGF2aW9ySW1wbFxuICBdO1xuXG5cbn0pKCk7XG5cbn0pIiwicmVxdWlyZShcIi4uL3BvbHltZXIvcG9seW1lci5odG1sXCIpO1xucmVxdWlyZShcIi4uL3BhcGVyLW1hdGVyaWFsL3BhcGVyLW1hdGVyaWFsLmh0bWxcIik7XG5yZXF1aXJlKFwiLi4vcGFwZXItcmlwcGxlL3BhcGVyLXJpcHBsZS5odG1sXCIpO1xucmVxdWlyZShcIi4uL3BhcGVyLWJlaGF2aW9ycy9wYXBlci1idXR0b24tYmVoYXZpb3IuaHRtbFwiKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZnVuY3Rpb24oKSB7XG52YXIgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXTtcbnZhciByb290ID0gYm9keS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpKTtcbnJvb3Quc2V0QXR0cmlidXRlKFwiaGlkZGVuXCIsXCJcIik7XG5yb290LmlubmVySFRNTD1cIjxkb20tbW9kdWxlIGlkPVxcXCJwYXBlci1idXR0b25cXFwiPjxzdHlsZT46aG9zdHtkaXNwbGF5OmlubGluZS1ibG9jaztwb3NpdGlvbjpyZWxhdGl2ZTtib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLXdpZHRoOjUuMTRlbTttYXJnaW46MCAuMjllbTtiYWNrZ3JvdW5kOjAgMDt0ZXh0LWFsaWduOmNlbnRlcjtmb250OmluaGVyaXQ7dGV4dC10cmFuc2Zvcm06dXBwZXJjYXNlO291dGxpbmU6MDtib3JkZXItcmFkaXVzOjNweDstbW96LXVzZXItc2VsZWN0Om5vbmU7LW1zLXVzZXItc2VsZWN0Om5vbmU7LXdlYmtpdC11c2VyLXNlbGVjdDpub25lO3VzZXItc2VsZWN0Om5vbmU7Y3Vyc29yOnBvaW50ZXI7ei1pbmRleDowO0BhcHBseSgtLXBhcGVyLWJ1dHRvbil9LmtleWJvYXJkLWZvY3Vze2ZvbnQtd2VpZ2h0OjcwMH06aG9zdChbZGlzYWJsZWRdKXtiYWNrZ3JvdW5kOiNlYWVhZWE7Y29sb3I6I2E4YThhODtjdXJzb3I6YXV0bztwb2ludGVyLWV2ZW50czpub25lO0BhcHBseSgtLXBhcGVyLWJ1dHRvbi1kaXNhYmxlZCl9Omhvc3QoW25vaW5rXSkgcGFwZXItcmlwcGxle2Rpc3BsYXk6bm9uZX1wYXBlci1tYXRlcmlhbHtib3JkZXItcmFkaXVzOmluaGVyaXR9LmNvbnRlbnQ+Ojpjb250ZW50ICp7dGV4dC10cmFuc2Zvcm06aW5oZXJpdH0uY29udGVudHtwYWRkaW5nOi43ZW0gLjU3ZW19PC9zdHlsZT48dGVtcGxhdGU+XFxuXFxuICAgIDxwYXBlci1yaXBwbGU+PC9wYXBlci1yaXBwbGU+XFxuXFxuICAgIDxwYXBlci1tYXRlcmlhbCBjbGFzcyQ9XFxcIltbX2NvbXB1dGVDb250ZW50Q2xhc3MocmVjZWl2ZWRGb2N1c0Zyb21LZXlib2FyZCldXVxcXCIgZWxldmF0aW9uPVxcXCJbW19lbGV2YXRpb25dXVxcXCIgYW5pbWF0ZWQ9XFxcIlxcXCI+XFxuICAgICAgPGNvbnRlbnQ+PC9jb250ZW50PlxcbiAgICA8L3BhcGVyLW1hdGVyaWFsPlxcblxcbiAgPC90ZW1wbGF0ZT48L2RvbS1tb2R1bGU+XCI7XG47KGZ1bmN0aW9uKCkge1xuXG5cbiAgUG9seW1lcih7XG5cbiAgICBpczogJ3BhcGVyLWJ1dHRvbicsXG5cbiAgICBiZWhhdmlvcnM6IFtcbiAgICAgIFBvbHltZXIuUGFwZXJCdXR0b25CZWhhdmlvclxuICAgIF0sXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG5cbiAgICAgIC8qKlxuICAgICAgICogSWYgdHJ1ZSwgdGhlIGJ1dHRvbiBzaG91bGQgYmUgc3R5bGVkIHdpdGggYSBzaGFkb3cuXG4gICAgICAgKi9cbiAgICAgIHJhaXNlZDoge1xuICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgICAgb2JzZXJ2ZXI6ICdfY2FsY3VsYXRlRWxldmF0aW9uJ1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfY2FsY3VsYXRlRWxldmF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5yYWlzZWQpIHtcbiAgICAgICAgdGhpcy5fZWxldmF0aW9uID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFBvbHltZXIuUGFwZXJCdXR0b25CZWhhdmlvckltcGwuX2NhbGN1bGF0ZUVsZXZhdGlvbi5hcHBseSh0aGlzKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2NvbXB1dGVDb250ZW50Q2xhc3M6IGZ1bmN0aW9uKHJlY2VpdmVkRm9jdXNGcm9tS2V5Ym9hcmQpIHtcbiAgICAgIHZhciBjbGFzc05hbWUgPSAnY29udGVudCAnO1xuICAgICAgaWYgKHJlY2VpdmVkRm9jdXNGcm9tS2V5Ym9hcmQpIHtcbiAgICAgICAgY2xhc3NOYW1lICs9ICcga2V5Ym9hcmQtZm9jdXMnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNsYXNzTmFtZTtcbiAgICB9XG4gIH0pO1xuXG5cbn0pKCk7XG5cbn0pIiwicmVxdWlyZShcIi4uL3BvbHltZXIvcG9seW1lci5odG1sXCIpO1xucmVxdWlyZShcIi4uL3BhcGVyLXN0eWxlcy9zaGFkb3cuaHRtbFwiKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZnVuY3Rpb24oKSB7XG52YXIgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXTtcbnZhciByb290ID0gYm9keS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpKTtcbnJvb3Quc2V0QXR0cmlidXRlKFwiaGlkZGVuXCIsXCJcIik7XG5yb290LmlubmVySFRNTD1cIjxkb20tbW9kdWxlIGlkPVxcXCJwYXBlci1tYXRlcmlhbFxcXCI+PHN0eWxlPjpob3N0e2Rpc3BsYXk6YmxvY2s7cG9zaXRpb246cmVsYXRpdmU7QGFwcGx5KC0tc2hhZG93LXRyYW5zaXRpb24pfTpob3N0KFtlbGV2YXRpb249XFxcIjFcXFwiXSl7QGFwcGx5KC0tc2hhZG93LWVsZXZhdGlvbi0yZHApfTpob3N0KFtlbGV2YXRpb249XFxcIjJcXFwiXSl7QGFwcGx5KC0tc2hhZG93LWVsZXZhdGlvbi00ZHApfTpob3N0KFtlbGV2YXRpb249XFxcIjNcXFwiXSl7QGFwcGx5KC0tc2hhZG93LWVsZXZhdGlvbi02ZHApfTpob3N0KFtlbGV2YXRpb249XFxcIjRcXFwiXSl7QGFwcGx5KC0tc2hhZG93LWVsZXZhdGlvbi04ZHApfTpob3N0KFtlbGV2YXRpb249XFxcIjVcXFwiXSl7QGFwcGx5KC0tc2hhZG93LWVsZXZhdGlvbi0xNmRwKX08L3N0eWxlPjx0ZW1wbGF0ZT5cXG4gICAgPGNvbnRlbnQ+PC9jb250ZW50PlxcbiAgPC90ZW1wbGF0ZT48L2RvbS1tb2R1bGU+XCI7XG47KGZ1bmN0aW9uKCkge1xuXG4gIFBvbHltZXIoe1xuICAgIGlzOiAncGFwZXItbWF0ZXJpYWwnLFxuXG4gICAgcHJvcGVydGllczoge1xuXG4gICAgICAvKipcbiAgICAgICAqIFRoZSB6LWRlcHRoIG9mIHRoaXMgZWxlbWVudCwgZnJvbSAwLTUuIFNldHRpbmcgdG8gMCB3aWxsIHJlbW92ZSB0aGVcbiAgICAgICAqIHNoYWRvdywgYW5kIGVhY2ggaW5jcmVhc2luZyBudW1iZXIgZ3JlYXRlciB0aGFuIDAgd2lsbCBiZSBcImRlZXBlclwiXG4gICAgICAgKiB0aGFuIHRoZSBsYXN0LlxuICAgICAgICpcbiAgICAgICAqIEBhdHRyaWJ1dGUgZWxldmF0aW9uXG4gICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAqIEBkZWZhdWx0IDFcbiAgICAgICAqL1xuICAgICAgZWxldmF0aW9uOiB7XG4gICAgICAgIHR5cGU6IE51bWJlcixcbiAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogMVxuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBTZXQgdGhpcyB0byB0cnVlIHRvIGFuaW1hdGUgdGhlIHNoYWRvdyB3aGVuIHNldHRpbmcgYSBuZXdcbiAgICAgICAqIGBlbGV2YXRpb25gIHZhbHVlLlxuICAgICAgICpcbiAgICAgICAqIEBhdHRyaWJ1dGUgYW5pbWF0ZWRcbiAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgKi9cbiAgICAgIGFuaW1hdGVkOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICB9KTtcblxufSkoKTtcblxufSkiLCJyZXF1aXJlKFwiLi4vcG9seW1lci9wb2x5bWVyLmh0bWxcIik7XG5yZXF1aXJlKFwiLi4vaXJvbi1hMTF5LWtleXMtYmVoYXZpb3IvaXJvbi1hMTF5LWtleXMtYmVoYXZpb3IuaHRtbFwiKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZnVuY3Rpb24oKSB7XG52YXIgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXTtcbnZhciByb290ID0gYm9keS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpKTtcbnJvb3Quc2V0QXR0cmlidXRlKFwiaGlkZGVuXCIsXCJcIik7XG5yb290LmlubmVySFRNTD1cIjxkb20tbW9kdWxlIGlkPVxcXCJwYXBlci1yaXBwbGVcXFwiPjxzdHlsZT46aG9zdHtkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOmFic29sdXRlO2JvcmRlci1yYWRpdXM6aW5oZXJpdDtvdmVyZmxvdzpoaWRkZW47dG9wOjA7bGVmdDowO3JpZ2h0OjA7Ym90dG9tOjB9Omhvc3QoW2FuaW1hdGluZ10pey13ZWJraXQtdHJhbnNmb3JtOnRyYW5zbGF0ZSgwLDApO3RyYW5zZm9ybTp0cmFuc2xhdGUzZCgwLDAsMCl9Omhvc3QoW25vaW5rXSl7cG9pbnRlci1ldmVudHM6bm9uZX0jYmFja2dyb3VuZCwjd2F2ZXMsLndhdmUtY29udGFpbmVyLC53YXZle3BvaW50ZXItZXZlbnRzOm5vbmU7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7bGVmdDowO3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCV9I2JhY2tncm91bmQsLndhdmV7b3BhY2l0eTowfSN3YXZlcywud2F2ZXtvdmVyZmxvdzpoaWRkZW59LndhdmUtY29udGFpbmVyLC53YXZle2JvcmRlci1yYWRpdXM6NTAlfTpob3N0KC5jaXJjbGUpICNiYWNrZ3JvdW5kLDpob3N0KC5jaXJjbGUpICN3YXZlc3tib3JkZXItcmFkaXVzOjUwJX06aG9zdCguY2lyY2xlKSAud2F2ZS1jb250YWluZXJ7b3ZlcmZsb3c6aGlkZGVufTwvc3R5bGU+PHRlbXBsYXRlPlxcbiAgICA8ZGl2IGlkPVxcXCJiYWNrZ3JvdW5kXFxcIj48L2Rpdj5cXG4gICAgPGRpdiBpZD1cXFwid2F2ZXNcXFwiPjwvZGl2PlxcbiAgPC90ZW1wbGF0ZT48L2RvbS1tb2R1bGU+XCI7XG47KGZ1bmN0aW9uKCkge1xuXG4gIChmdW5jdGlvbigpIHtcbiAgICB2YXIgVXRpbGl0eSA9IHtcbiAgICAgIGNzc0NvbG9yV2l0aEFscGhhOiBmdW5jdGlvbihjc3NDb2xvciwgYWxwaGEpIHtcbiAgICAgICAgdmFyIHBhcnRzID0gY3NzQ29sb3IubWF0Y2goL15yZ2JcXCgoXFxkKyksXFxzKihcXGQrKSxcXHMqKFxcZCspXFwpJC8pO1xuXG4gICAgICAgIGlmICh0eXBlb2YgYWxwaGEgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBhbHBoYSA9IDE7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXBhcnRzKSB7XG4gICAgICAgICAgcmV0dXJuICdyZ2JhKDI1NSwgMjU1LCAyNTUsICcgKyBhbHBoYSArICcpJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAncmdiYSgnICsgcGFydHNbMV0gKyAnLCAnICsgcGFydHNbMl0gKyAnLCAnICsgcGFydHNbM10gKyAnLCAnICsgYWxwaGEgKyAnKSc7XG4gICAgICB9LFxuXG4gICAgICBkaXN0YW5jZTogZnVuY3Rpb24oeDEsIHkxLCB4MiwgeTIpIHtcbiAgICAgICAgdmFyIHhEZWx0YSA9ICh4MSAtIHgyKTtcbiAgICAgICAgdmFyIHlEZWx0YSA9ICh5MSAtIHkyKTtcblxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHhEZWx0YSAqIHhEZWx0YSArIHlEZWx0YSAqIHlEZWx0YSk7XG4gICAgICB9LFxuXG4gICAgICBub3c6IChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5wZXJmb3JtYW5jZSAmJiB3aW5kb3cucGVyZm9ybWFuY2Uubm93KSB7XG4gICAgICAgICAgcmV0dXJuIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3cuYmluZCh3aW5kb3cucGVyZm9ybWFuY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIERhdGUubm93O1xuICAgICAgfSkoKVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgZnVuY3Rpb24gRWxlbWVudE1ldHJpY3MoZWxlbWVudCkge1xuICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgIHRoaXMud2lkdGggPSB0aGlzLmJvdW5kaW5nUmVjdC53aWR0aDtcbiAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5ib3VuZGluZ1JlY3QuaGVpZ2h0O1xuXG4gICAgICB0aGlzLnNpemUgPSBNYXRoLm1heCh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgfVxuXG4gICAgRWxlbWVudE1ldHJpY3MucHJvdG90eXBlID0ge1xuICAgICAgZ2V0IGJvdW5kaW5nUmVjdCAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB9LFxuXG4gICAgICBmdXJ0aGVzdENvcm5lckRpc3RhbmNlRnJvbTogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB2YXIgdG9wTGVmdCA9IFV0aWxpdHkuZGlzdGFuY2UoeCwgeSwgMCwgMCk7XG4gICAgICAgIHZhciB0b3BSaWdodCA9IFV0aWxpdHkuZGlzdGFuY2UoeCwgeSwgdGhpcy53aWR0aCwgMCk7XG4gICAgICAgIHZhciBib3R0b21MZWZ0ID0gVXRpbGl0eS5kaXN0YW5jZSh4LCB5LCAwLCB0aGlzLmhlaWdodCk7XG4gICAgICAgIHZhciBib3R0b21SaWdodCA9IFV0aWxpdHkuZGlzdGFuY2UoeCwgeSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG4gICAgICAgIHJldHVybiBNYXRoLm1heCh0b3BMZWZ0LCB0b3BSaWdodCwgYm90dG9tTGVmdCwgYm90dG9tUmlnaHQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgZnVuY3Rpb24gUmlwcGxlKGVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICB0aGlzLmNvbG9yID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkuY29sb3I7XG5cbiAgICAgIHRoaXMud2F2ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdGhpcy53YXZlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB0aGlzLndhdmUuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gdGhpcy5jb2xvcjtcbiAgICAgIHRoaXMud2F2ZS5jbGFzc0xpc3QuYWRkKCd3YXZlJyk7XG4gICAgICB0aGlzLndhdmVDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnd2F2ZS1jb250YWluZXInKTtcbiAgICAgIFBvbHltZXIuZG9tKHRoaXMud2F2ZUNvbnRhaW5lcikuYXBwZW5kQ2hpbGQodGhpcy53YXZlKTtcblxuICAgICAgdGhpcy5yZXNldEludGVyYWN0aW9uU3RhdGUoKTtcbiAgICB9XG5cbiAgICBSaXBwbGUuTUFYX1JBRElVUyA9IDMwMDtcblxuICAgIFJpcHBsZS5wcm90b3R5cGUgPSB7XG4gICAgICBnZXQgcmVjZW50ZXJzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LnJlY2VudGVycztcbiAgICAgIH0sXG5cbiAgICAgIGdldCBjZW50ZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY2VudGVyO1xuICAgICAgfSxcblxuICAgICAgZ2V0IG1vdXNlRG93bkVsYXBzZWQoKSB7XG4gICAgICAgIHZhciBlbGFwc2VkO1xuXG4gICAgICAgIGlmICghdGhpcy5tb3VzZURvd25TdGFydCkge1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxhcHNlZCA9IFV0aWxpdHkubm93KCkgLSB0aGlzLm1vdXNlRG93blN0YXJ0O1xuXG4gICAgICAgIGlmICh0aGlzLm1vdXNlVXBTdGFydCkge1xuICAgICAgICAgIGVsYXBzZWQgLT0gdGhpcy5tb3VzZVVwRWxhcHNlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbGFwc2VkO1xuICAgICAgfSxcblxuICAgICAgZ2V0IG1vdXNlVXBFbGFwc2VkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZVVwU3RhcnQgP1xuICAgICAgICAgIFV0aWxpdHkubm93ICgpIC0gdGhpcy5tb3VzZVVwU3RhcnQgOiAwO1xuICAgICAgfSxcblxuICAgICAgZ2V0IG1vdXNlRG93bkVsYXBzZWRTZWNvbmRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZURvd25FbGFwc2VkIC8gMTAwMDtcbiAgICAgIH0sXG5cbiAgICAgIGdldCBtb3VzZVVwRWxhcHNlZFNlY29uZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vdXNlVXBFbGFwc2VkIC8gMTAwMDtcbiAgICAgIH0sXG5cbiAgICAgIGdldCBtb3VzZUludGVyYWN0aW9uU2Vjb25kcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2VEb3duRWxhcHNlZFNlY29uZHMgKyB0aGlzLm1vdXNlVXBFbGFwc2VkU2Vjb25kcztcbiAgICAgIH0sXG5cbiAgICAgIGdldCBpbml0aWFsT3BhY2l0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5pbml0aWFsT3BhY2l0eTtcbiAgICAgIH0sXG5cbiAgICAgIGdldCBvcGFjaXR5RGVjYXlWZWxvY2l0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5vcGFjaXR5RGVjYXlWZWxvY2l0eTtcbiAgICAgIH0sXG5cbiAgICAgIGdldCByYWRpdXMoKSB7XG4gICAgICAgIHZhciB3aWR0aDIgPSB0aGlzLmNvbnRhaW5lck1ldHJpY3Mud2lkdGggKiB0aGlzLmNvbnRhaW5lck1ldHJpY3Mud2lkdGg7XG4gICAgICAgIHZhciBoZWlnaHQyID0gdGhpcy5jb250YWluZXJNZXRyaWNzLmhlaWdodCAqIHRoaXMuY29udGFpbmVyTWV0cmljcy5oZWlnaHQ7XG4gICAgICAgIHZhciB3YXZlUmFkaXVzID0gTWF0aC5taW4oXG4gICAgICAgICAgTWF0aC5zcXJ0KHdpZHRoMiArIGhlaWdodDIpLFxuICAgICAgICAgIFJpcHBsZS5NQVhfUkFESVVTXG4gICAgICAgICkgKiAxLjEgKyA1O1xuXG4gICAgICAgIHZhciBkdXJhdGlvbiA9IDEuMSAtIDAuMiAqICh3YXZlUmFkaXVzIC8gUmlwcGxlLk1BWF9SQURJVVMpO1xuICAgICAgICB2YXIgdGltZU5vdyA9IHRoaXMubW91c2VJbnRlcmFjdGlvblNlY29uZHMgLyBkdXJhdGlvbjtcbiAgICAgICAgdmFyIHNpemUgPSB3YXZlUmFkaXVzICogKDEgLSBNYXRoLnBvdyg4MCwgLXRpbWVOb3cpKTtcblxuICAgICAgICByZXR1cm4gTWF0aC5hYnMoc2l6ZSk7XG4gICAgICB9LFxuXG4gICAgICBnZXQgb3BhY2l0eSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1vdXNlVXBTdGFydCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmluaXRpYWxPcGFjaXR5O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGhpcy5pbml0aWFsT3BhY2l0eSAtIHRoaXMubW91c2VVcEVsYXBzZWRTZWNvbmRzICogdGhpcy5vcGFjaXR5RGVjYXlWZWxvY2l0eVxuICAgICAgICApO1xuICAgICAgfSxcblxuICAgICAgZ2V0IG91dGVyT3BhY2l0eSgpIHtcbiAgICAgICAgLy8gTGluZWFyIGluY3JlYXNlIGluIGJhY2tncm91bmQgb3BhY2l0eSwgY2FwcGVkIGF0IHRoZSBvcGFjaXR5XG4gICAgICAgIC8vIG9mIHRoZSB3YXZlZnJvbnQgKHdhdmVPcGFjaXR5KS5cbiAgICAgICAgdmFyIG91dGVyT3BhY2l0eSA9IHRoaXMubW91c2VVcEVsYXBzZWRTZWNvbmRzICogMC4zO1xuICAgICAgICB2YXIgd2F2ZU9wYWNpdHkgPSB0aGlzLm9wYWNpdHk7XG5cbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KFxuICAgICAgICAgIDAsXG4gICAgICAgICAgTWF0aC5taW4ob3V0ZXJPcGFjaXR5LCB3YXZlT3BhY2l0eSlcbiAgICAgICAgKTtcbiAgICAgIH0sXG5cbiAgICAgIGdldCBpc09wYWNpdHlGdWxseURlY2F5ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wYWNpdHkgPCAwLjAxICYmXG4gICAgICAgICAgdGhpcy5yYWRpdXMgPj0gTWF0aC5taW4odGhpcy5tYXhSYWRpdXMsIFJpcHBsZS5NQVhfUkFESVVTKTtcbiAgICAgIH0sXG5cbiAgICAgIGdldCBpc1Jlc3RpbmdBdE1heFJhZGl1cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3BhY2l0eSA+PSB0aGlzLmluaXRpYWxPcGFjaXR5ICYmXG4gICAgICAgICAgdGhpcy5yYWRpdXMgPj0gTWF0aC5taW4odGhpcy5tYXhSYWRpdXMsIFJpcHBsZS5NQVhfUkFESVVTKTtcbiAgICAgIH0sXG5cbiAgICAgIGdldCBpc0FuaW1hdGlvbkNvbXBsZXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZVVwU3RhcnQgP1xuICAgICAgICAgIHRoaXMuaXNPcGFjaXR5RnVsbHlEZWNheWVkIDogdGhpcy5pc1Jlc3RpbmdBdE1heFJhZGl1cztcbiAgICAgIH0sXG5cbiAgICAgIGdldCB0cmFuc2xhdGlvbkZyYWN0aW9uKCkge1xuICAgICAgICByZXR1cm4gTWF0aC5taW4oXG4gICAgICAgICAgMSxcbiAgICAgICAgICB0aGlzLnJhZGl1cyAvIHRoaXMuY29udGFpbmVyTWV0cmljcy5zaXplICogMiAvIE1hdGguc3FydCgyKVxuICAgICAgICApO1xuICAgICAgfSxcblxuICAgICAgZ2V0IHhOb3coKSB7XG4gICAgICAgIGlmICh0aGlzLnhFbmQpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy54U3RhcnQgKyB0aGlzLnRyYW5zbGF0aW9uRnJhY3Rpb24gKiAodGhpcy54RW5kIC0gdGhpcy54U3RhcnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMueFN0YXJ0O1xuICAgICAgfSxcblxuICAgICAgZ2V0IHlOb3coKSB7XG4gICAgICAgIGlmICh0aGlzLnlFbmQpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy55U3RhcnQgKyB0aGlzLnRyYW5zbGF0aW9uRnJhY3Rpb24gKiAodGhpcy55RW5kIC0gdGhpcy55U3RhcnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMueVN0YXJ0O1xuICAgICAgfSxcblxuICAgICAgZ2V0IGlzTW91c2VEb3duKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZURvd25TdGFydCAmJiAhdGhpcy5tb3VzZVVwU3RhcnQ7XG4gICAgICB9LFxuXG4gICAgICByZXNldEludGVyYWN0aW9uU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLm1heFJhZGl1cyA9IDA7XG4gICAgICAgIHRoaXMubW91c2VEb3duU3RhcnQgPSAwO1xuICAgICAgICB0aGlzLm1vdXNlVXBTdGFydCA9IDA7XG5cbiAgICAgICAgdGhpcy54U3RhcnQgPSAwO1xuICAgICAgICB0aGlzLnlTdGFydCA9IDA7XG4gICAgICAgIHRoaXMueEVuZCA9IDA7XG4gICAgICAgIHRoaXMueUVuZCA9IDA7XG4gICAgICAgIHRoaXMuc2xpZGVEaXN0YW5jZSA9IDA7XG5cbiAgICAgICAgdGhpcy5jb250YWluZXJNZXRyaWNzID0gbmV3IEVsZW1lbnRNZXRyaWNzKHRoaXMuZWxlbWVudCk7XG4gICAgICB9LFxuXG4gICAgICBkcmF3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNjYWxlO1xuICAgICAgICB2YXIgdHJhbnNsYXRlU3RyaW5nO1xuICAgICAgICB2YXIgZHg7XG4gICAgICAgIHZhciBkeTtcblxuICAgICAgICB0aGlzLndhdmUuc3R5bGUub3BhY2l0eSA9IHRoaXMub3BhY2l0eTtcblxuICAgICAgICBzY2FsZSA9IHRoaXMucmFkaXVzIC8gKHRoaXMuY29udGFpbmVyTWV0cmljcy5zaXplIC8gMik7XG4gICAgICAgIGR4ID0gdGhpcy54Tm93IC0gKHRoaXMuY29udGFpbmVyTWV0cmljcy53aWR0aCAvIDIpO1xuICAgICAgICBkeSA9IHRoaXMueU5vdyAtICh0aGlzLmNvbnRhaW5lck1ldHJpY3MuaGVpZ2h0IC8gMik7XG5cblxuICAgICAgICAvLyAyZCB0cmFuc2Zvcm0gZm9yIHNhZmFyaSBiZWNhdXNlIG9mIGJvcmRlci1yYWRpdXMgYW5kIG92ZXJmbG93OmhpZGRlbiBjbGlwcGluZyBidWcuXG4gICAgICAgIC8vIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD05ODUzOFxuICAgICAgICB0aGlzLndhdmVDb250YWluZXIuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgZHggKyAncHgsICcgKyBkeSArICdweCknO1xuICAgICAgICB0aGlzLndhdmVDb250YWluZXIuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZTNkKCcgKyBkeCArICdweCwgJyArIGR5ICsgJ3B4LCAwKSc7XG4gICAgICAgIHRoaXMud2F2ZS5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAnc2NhbGUoJyArIHNjYWxlICsgJywnICsgc2NhbGUgKyAnKSc7XG4gICAgICAgIHRoaXMud2F2ZS5zdHlsZS50cmFuc2Zvcm0gPSAnc2NhbGUzZCgnICsgc2NhbGUgKyAnLCcgKyBzY2FsZSArICcsMSknO1xuICAgICAgfSxcblxuICAgICAgLyoqIEBwYXJhbSB7RXZlbnQ9fSBldmVudCAqL1xuICAgICAgZG93bkFjdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIHhDZW50ZXIgPSB0aGlzLmNvbnRhaW5lck1ldHJpY3Mud2lkdGggLyAyO1xuICAgICAgICB2YXIgeUNlbnRlciA9IHRoaXMuY29udGFpbmVyTWV0cmljcy5oZWlnaHQgLyAyO1xuXG4gICAgICAgIHRoaXMucmVzZXRJbnRlcmFjdGlvblN0YXRlKCk7XG4gICAgICAgIHRoaXMubW91c2VEb3duU3RhcnQgPSBVdGlsaXR5Lm5vdygpO1xuXG4gICAgICAgIGlmICh0aGlzLmNlbnRlcikge1xuICAgICAgICAgIHRoaXMueFN0YXJ0ID0geENlbnRlcjtcbiAgICAgICAgICB0aGlzLnlTdGFydCA9IHlDZW50ZXI7XG4gICAgICAgICAgdGhpcy5zbGlkZURpc3RhbmNlID0gVXRpbGl0eS5kaXN0YW5jZShcbiAgICAgICAgICAgIHRoaXMueFN0YXJ0LCB0aGlzLnlTdGFydCwgdGhpcy54RW5kLCB0aGlzLnlFbmRcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMueFN0YXJ0ID0gZXZlbnQgP1xuICAgICAgICAgICAgICBldmVudC5kZXRhaWwueCAtIHRoaXMuY29udGFpbmVyTWV0cmljcy5ib3VuZGluZ1JlY3QubGVmdCA6XG4gICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyTWV0cmljcy53aWR0aCAvIDI7XG4gICAgICAgICAgdGhpcy55U3RhcnQgPSBldmVudCA/XG4gICAgICAgICAgICAgIGV2ZW50LmRldGFpbC55IC0gdGhpcy5jb250YWluZXJNZXRyaWNzLmJvdW5kaW5nUmVjdC50b3AgOlxuICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lck1ldHJpY3MuaGVpZ2h0IC8gMjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnJlY2VudGVycykge1xuICAgICAgICAgIHRoaXMueEVuZCA9IHhDZW50ZXI7XG4gICAgICAgICAgdGhpcy55RW5kID0geUNlbnRlcjtcbiAgICAgICAgICB0aGlzLnNsaWRlRGlzdGFuY2UgPSBVdGlsaXR5LmRpc3RhbmNlKFxuICAgICAgICAgICAgdGhpcy54U3RhcnQsIHRoaXMueVN0YXJ0LCB0aGlzLnhFbmQsIHRoaXMueUVuZFxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1heFJhZGl1cyA9IHRoaXMuY29udGFpbmVyTWV0cmljcy5mdXJ0aGVzdENvcm5lckRpc3RhbmNlRnJvbShcbiAgICAgICAgICB0aGlzLnhTdGFydCxcbiAgICAgICAgICB0aGlzLnlTdGFydFxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMud2F2ZUNvbnRhaW5lci5zdHlsZS50b3AgPVxuICAgICAgICAgICh0aGlzLmNvbnRhaW5lck1ldHJpY3MuaGVpZ2h0IC0gdGhpcy5jb250YWluZXJNZXRyaWNzLnNpemUpIC8gMiArICdweCc7XG4gICAgICAgIHRoaXMud2F2ZUNvbnRhaW5lci5zdHlsZS5sZWZ0ID1cbiAgICAgICAgICAodGhpcy5jb250YWluZXJNZXRyaWNzLndpZHRoIC0gdGhpcy5jb250YWluZXJNZXRyaWNzLnNpemUpIC8gMiArICdweCc7XG5cbiAgICAgICAgdGhpcy53YXZlQ29udGFpbmVyLnN0eWxlLndpZHRoID0gdGhpcy5jb250YWluZXJNZXRyaWNzLnNpemUgKyAncHgnO1xuICAgICAgICB0aGlzLndhdmVDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gdGhpcy5jb250YWluZXJNZXRyaWNzLnNpemUgKyAncHgnO1xuICAgICAgfSxcblxuICAgICAgLyoqIEBwYXJhbSB7RXZlbnQ9fSBldmVudCAqL1xuICAgICAgdXBBY3Rpb246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5pc01vdXNlRG93bikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubW91c2VVcFN0YXJ0ID0gVXRpbGl0eS5ub3coKTtcbiAgICAgIH0sXG5cbiAgICAgIHJlbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIFBvbHltZXIuZG9tKHRoaXMud2F2ZUNvbnRhaW5lci5wYXJlbnROb2RlKS5yZW1vdmVDaGlsZChcbiAgICAgICAgICB0aGlzLndhdmVDb250YWluZXJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgUG9seW1lcih7XG4gICAgICBpczogJ3BhcGVyLXJpcHBsZScsXG5cbiAgICAgIGJlaGF2aW9yczogW1xuICAgICAgICBQb2x5bWVyLklyb25BMTF5S2V5c0JlaGF2aW9yXG4gICAgICBdLFxuXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgaW5pdGlhbCBvcGFjaXR5IHNldCBvbiB0aGUgd2F2ZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQGF0dHJpYnV0ZSBpbml0aWFsT3BhY2l0eVxuICAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgICogQGRlZmF1bHQgMC4yNVxuICAgICAgICAgKi9cbiAgICAgICAgaW5pdGlhbE9wYWNpdHk6IHtcbiAgICAgICAgICB0eXBlOiBOdW1iZXIsXG4gICAgICAgICAgdmFsdWU6IDAuMjVcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogSG93IGZhc3QgKG9wYWNpdHkgcGVyIHNlY29uZCkgdGhlIHdhdmUgZmFkZXMgb3V0LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAYXR0cmlidXRlIG9wYWNpdHlEZWNheVZlbG9jaXR5XG4gICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAgKiBAZGVmYXVsdCAwLjhcbiAgICAgICAgICovXG4gICAgICAgIG9wYWNpdHlEZWNheVZlbG9jaXR5OiB7XG4gICAgICAgICAgdHlwZTogTnVtYmVyLFxuICAgICAgICAgIHZhbHVlOiAwLjhcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogSWYgdHJ1ZSwgcmlwcGxlcyB3aWxsIGV4aGliaXQgYSBncmF2aXRhdGlvbmFsIHB1bGwgdG93YXJkc1xuICAgICAgICAgKiB0aGUgY2VudGVyIG9mIHRoZWlyIGNvbnRhaW5lciBhcyB0aGV5IGZhZGUgYXdheS5cbiAgICAgICAgICpcbiAgICAgICAgICogQGF0dHJpYnV0ZSByZWNlbnRlcnNcbiAgICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICAgICAgcmVjZW50ZXJzOiB7XG4gICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogSWYgdHJ1ZSwgcmlwcGxlcyB3aWxsIGNlbnRlciBpbnNpZGUgaXRzIGNvbnRhaW5lclxuICAgICAgICAgKlxuICAgICAgICAgKiBAYXR0cmlidXRlIHJlY2VudGVyc1xuICAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgICAgICBjZW50ZXI6IHtcbiAgICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICAgIHZhbHVlOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBIGxpc3Qgb2YgdGhlIHZpc3VhbCByaXBwbGVzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAYXR0cmlidXRlIHJpcHBsZXNcbiAgICAgICAgICogQHR5cGUgQXJyYXlcbiAgICAgICAgICogQGRlZmF1bHQgW11cbiAgICAgICAgICovXG4gICAgICAgIHJpcHBsZXM6IHtcbiAgICAgICAgICB0eXBlOiBBcnJheSxcbiAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUcnVlIHdoZW4gdGhlcmUgYXJlIHZpc2libGUgcmlwcGxlcyBhbmltYXRpbmcgd2l0aGluIHRoZVxuICAgICAgICAgKiBlbGVtZW50LlxuICAgICAgICAgKi9cbiAgICAgICAgYW5pbWF0aW5nOiB7XG4gICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIHRydWUsIHRoZSByaXBwbGUgd2lsbCByZW1haW4gaW4gdGhlIFwiZG93blwiIHN0YXRlIHVudGlsIGBob2xkRG93bmBcbiAgICAgICAgICogaXMgc2V0IHRvIGZhbHNlIGFnYWluLlxuICAgICAgICAgKi9cbiAgICAgICAgaG9sZERvd246IHtcbiAgICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgICAgICBvYnNlcnZlcjogJ19ob2xkRG93bkNoYW5nZWQnXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2FuaW1hdGluZzoge1xuICAgICAgICAgIHR5cGU6IEJvb2xlYW5cbiAgICAgICAgfSxcblxuICAgICAgICBfYm91bmRBbmltYXRlOiB7XG4gICAgICAgICAgdHlwZTogRnVuY3Rpb24sXG4gICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYW5pbWF0ZS5iaW5kKHRoaXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgZ2V0IHRhcmdldCAoKSB7XG4gICAgICAgIHZhciBvd25lclJvb3QgPSBQb2x5bWVyLmRvbSh0aGlzKS5nZXRPd25lclJvb3QoKTtcbiAgICAgICAgdmFyIHRhcmdldDtcblxuICAgICAgICBpZiAodGhpcy5wYXJlbnROb2RlLm5vZGVUeXBlID09IDExKSB7IC8vIERPQ1VNRU5UX0ZSQUdNRU5UX05PREVcbiAgICAgICAgICB0YXJnZXQgPSBvd25lclJvb3QuaG9zdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXQgPSB0aGlzLnBhcmVudE5vZGU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgfSxcblxuICAgICAga2V5QmluZGluZ3M6IHtcbiAgICAgICAgJ2VudGVyOmtleWRvd24nOiAnX29uRW50ZXJLZXlkb3duJyxcbiAgICAgICAgJ3NwYWNlOmtleWRvd24nOiAnX29uU3BhY2VLZXlkb3duJyxcbiAgICAgICAgJ3NwYWNlOmtleXVwJzogJ19vblNwYWNlS2V5dXAnXG4gICAgICB9LFxuXG4gICAgICBhdHRhY2hlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMudGFyZ2V0LCAndXAnLCAndXBBY3Rpb24nKTtcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy50YXJnZXQsICdkb3duJywgJ2Rvd25BY3Rpb24nKTtcblxuICAgICAgICBpZiAoIXRoaXMudGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnbm9pbmsnKSkge1xuICAgICAgICAgIHRoaXMua2V5RXZlbnRUYXJnZXQgPSB0aGlzLnRhcmdldDtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgZ2V0IHNob3VsZEtlZXBBbmltYXRpbmcgKCkge1xuICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yaXBwbGVzLmxlbmd0aDsgKytpbmRleCkge1xuICAgICAgICAgIGlmICghdGhpcy5yaXBwbGVzW2luZGV4XS5pc0FuaW1hdGlvbkNvbXBsZXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuXG4gICAgICBzaW11bGF0ZWRSaXBwbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmRvd25BY3Rpb24obnVsbCk7XG5cbiAgICAgICAgLy8gUGxlYXNlIHNlZSBwb2x5bWVyL3BvbHltZXIjMTMwNVxuICAgICAgICB0aGlzLmFzeW5jKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRoaXMudXBBY3Rpb24oKTtcbiAgICAgICAgfSwgMSk7XG4gICAgICB9LFxuXG4gICAgICAvKiogQHBhcmFtIHtFdmVudD19IGV2ZW50ICovXG4gICAgICBkb3duQWN0aW9uOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAodGhpcy5ob2xkRG93biAmJiB0aGlzLnJpcHBsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByaXBwbGUgPSB0aGlzLmFkZFJpcHBsZSgpO1xuXG4gICAgICAgIHJpcHBsZS5kb3duQWN0aW9uKGV2ZW50KTtcblxuICAgICAgICBpZiAoIXRoaXMuX2FuaW1hdGluZykge1xuICAgICAgICAgIHRoaXMuYW5pbWF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvKiogQHBhcmFtIHtFdmVudD19IGV2ZW50ICovXG4gICAgICB1cEFjdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuaG9sZERvd24pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJpcHBsZXMuZm9yRWFjaChmdW5jdGlvbihyaXBwbGUpIHtcbiAgICAgICAgICByaXBwbGUudXBBY3Rpb24oZXZlbnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFuaW1hdGUoKTtcbiAgICAgIH0sXG5cbiAgICAgIG9uQW5pbWF0aW9uQ29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9hbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy4kLmJhY2tncm91bmQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gbnVsbDtcbiAgICAgICAgdGhpcy5maXJlKCd0cmFuc2l0aW9uZW5kJyk7XG4gICAgICB9LFxuXG4gICAgICBhZGRSaXBwbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmlwcGxlID0gbmV3IFJpcHBsZSh0aGlzKTtcblxuICAgICAgICBQb2x5bWVyLmRvbSh0aGlzLiQud2F2ZXMpLmFwcGVuZENoaWxkKHJpcHBsZS53YXZlQ29udGFpbmVyKTtcbiAgICAgICAgdGhpcy4kLmJhY2tncm91bmQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gcmlwcGxlLmNvbG9yO1xuICAgICAgICB0aGlzLnJpcHBsZXMucHVzaChyaXBwbGUpO1xuXG4gICAgICAgIHRoaXMuX3NldEFuaW1hdGluZyh0cnVlKTtcblxuICAgICAgICByZXR1cm4gcmlwcGxlO1xuICAgICAgfSxcblxuICAgICAgcmVtb3ZlUmlwcGxlOiBmdW5jdGlvbihyaXBwbGUpIHtcbiAgICAgICAgdmFyIHJpcHBsZUluZGV4ID0gdGhpcy5yaXBwbGVzLmluZGV4T2YocmlwcGxlKTtcblxuICAgICAgICBpZiAocmlwcGxlSW5kZXggPCAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yaXBwbGVzLnNwbGljZShyaXBwbGVJbmRleCwgMSk7XG5cbiAgICAgICAgcmlwcGxlLnJlbW92ZSgpO1xuXG4gICAgICAgIGlmICghdGhpcy5yaXBwbGVzLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuX3NldEFuaW1hdGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGFuaW1hdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaW5kZXg7XG4gICAgICAgIHZhciByaXBwbGU7XG5cbiAgICAgICAgdGhpcy5fYW5pbWF0aW5nID0gdHJ1ZTtcblxuICAgICAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJpcHBsZXMubGVuZ3RoOyArK2luZGV4KSB7XG4gICAgICAgICAgcmlwcGxlID0gdGhpcy5yaXBwbGVzW2luZGV4XTtcblxuICAgICAgICAgIHJpcHBsZS5kcmF3KCk7XG5cbiAgICAgICAgICB0aGlzLiQuYmFja2dyb3VuZC5zdHlsZS5vcGFjaXR5ID0gcmlwcGxlLm91dGVyT3BhY2l0eTtcblxuICAgICAgICAgIGlmIChyaXBwbGUuaXNPcGFjaXR5RnVsbHlEZWNheWVkICYmICFyaXBwbGUuaXNSZXN0aW5nQXRNYXhSYWRpdXMpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlUmlwcGxlKHJpcHBsZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLnNob3VsZEtlZXBBbmltYXRpbmcgJiYgdGhpcy5yaXBwbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMub25BbmltYXRpb25Db21wbGV0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fYm91bmRBbmltYXRlKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgX29uRW50ZXJLZXlkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5kb3duQWN0aW9uKCk7XG4gICAgICAgIHRoaXMuYXN5bmModGhpcy51cEFjdGlvbiwgMSk7XG4gICAgICB9LFxuXG4gICAgICBfb25TcGFjZUtleWRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmRvd25BY3Rpb24oKTtcbiAgICAgIH0sXG5cbiAgICAgIF9vblNwYWNlS2V5dXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnVwQWN0aW9uKCk7XG4gICAgICB9LFxuXG4gICAgICBfaG9sZERvd25DaGFuZ2VkOiBmdW5jdGlvbihob2xkRG93bikge1xuICAgICAgICBpZiAoaG9sZERvd24pIHtcbiAgICAgICAgICB0aGlzLmRvd25BY3Rpb24oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnVwQWN0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSkoKTtcblxufSkoKTtcblxufSkiLCJyZXF1aXJlKFwiLi4vcG9seW1lci9wb2x5bWVyLmh0bWxcIik7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGZ1bmN0aW9uKCkge1xudmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF07XG5oZWFkLmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLFwiPHN0eWxlIGlzPVxcXCJjdXN0b20tc3R5bGVcXFwiPjpyb290ey0tc2hhZG93LXRyYW5zaXRpb246e3RyYW5zaXRpb246Ym94LXNoYWRvdyAuMjhzIGN1YmljLWJlemllcigwLjQsMCwuMiwxKX07LS1zaGFkb3ctbm9uZTp7Ym94LXNoYWRvdzpub25lfTstLXNoYWRvdy1lbGV2YXRpb24tMmRwOntib3gtc2hhZG93OjAgMnB4IDJweCAwIHJnYmEoMCwwLDAsLjE0KSwwIDFweCA1cHggMCByZ2JhKDAsMCwwLC4xMiksMCAzcHggMXB4IC0ycHggcmdiYSgwLDAsMCwuMil9Oy0tc2hhZG93LWVsZXZhdGlvbi0zZHA6e2JveC1zaGFkb3c6MCAzcHggNHB4IDAgcmdiYSgwLDAsMCwuMTQpLDAgMXB4IDhweCAwIHJnYmEoMCwwLDAsLjEyKSwwIDNweCAzcHggLTJweCByZ2JhKDAsMCwwLC40KX07LS1zaGFkb3ctZWxldmF0aW9uLTRkcDp7Ym94LXNoYWRvdzowIDRweCA1cHggMCByZ2JhKDAsMCwwLC4xNCksMCAxcHggMTBweCAwIHJnYmEoMCwwLDAsLjEyKSwwIDJweCA0cHggLTFweCByZ2JhKDAsMCwwLC40KX07LS1zaGFkb3ctZWxldmF0aW9uLTZkcDp7Ym94LXNoYWRvdzowIDZweCAxMHB4IDAgcmdiYSgwLDAsMCwuMTQpLDAgMXB4IDE4cHggMCByZ2JhKDAsMCwwLC4xMiksMCAzcHggNXB4IC0xcHggcmdiYSgwLDAsMCwuNCl9Oy0tc2hhZG93LWVsZXZhdGlvbi04ZHA6e2JveC1zaGFkb3c6MCA4cHggMTBweCAxcHggcmdiYSgwLDAsMCwuMTQpLDAgM3B4IDE0cHggMnB4IHJnYmEoMCwwLDAsLjEyKSwwIDVweCA1cHggLTNweCByZ2JhKDAsMCwwLC40KX07LS1zaGFkb3ctZWxldmF0aW9uLTE2ZHA6e2JveC1zaGFkb3c6MCAxNnB4IDI0cHggMnB4IHJnYmEoMCwwLDAsLjE0KSwwIDZweCAzMHB4IDVweCByZ2JhKDAsMCwwLC4xMiksMCA4cHggMTBweCAtNXB4IHJnYmEoMCwwLDAsLjQpfX08L3N0eWxlPlwiKTtcblxufSkiLCJkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGZ1bmN0aW9uKCkge1xuOyhmdW5jdGlvbigpIHtcbihmdW5jdGlvbiAoKSB7XG5mdW5jdGlvbiByZXNvbHZlKCkge1xuZG9jdW1lbnQuYm9keS5yZW1vdmVBdHRyaWJ1dGUoJ3VucmVzb2x2ZWQnKTtcbn1cbmlmICh3aW5kb3cuV2ViQ29tcG9uZW50cykge1xuYWRkRXZlbnRMaXN0ZW5lcignV2ViQ29tcG9uZW50c1JlYWR5JywgcmVzb2x2ZSk7XG59IGVsc2Uge1xuaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdpbnRlcmFjdGl2ZScgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xucmVzb2x2ZSgpO1xufSBlbHNlIHtcbmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCByZXNvbHZlKTtcbn1cbn1cbn0oKSk7XG5Qb2x5bWVyID0ge1xuU2V0dGluZ3M6IGZ1bmN0aW9uICgpIHtcbnZhciB1c2VyID0gd2luZG93LlBvbHltZXIgfHwge307XG5sb2NhdGlvbi5zZWFyY2guc2xpY2UoMSkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uIChvKSB7XG5vID0gby5zcGxpdCgnPScpO1xub1swXSAmJiAodXNlcltvWzBdXSA9IG9bMV0gfHwgdHJ1ZSk7XG59KTtcbnZhciB3YW50U2hhZG93ID0gdXNlci5kb20gPT09ICdzaGFkb3cnO1xudmFyIGhhc1NoYWRvdyA9IEJvb2xlYW4oRWxlbWVudC5wcm90b3R5cGUuY3JlYXRlU2hhZG93Um9vdCk7XG52YXIgbmF0aXZlU2hhZG93ID0gaGFzU2hhZG93ICYmICF3aW5kb3cuU2hhZG93RE9NUG9seWZpbGw7XG52YXIgdXNlU2hhZG93ID0gd2FudFNoYWRvdyAmJiBoYXNTaGFkb3c7XG52YXIgaGFzTmF0aXZlSW1wb3J0cyA9IEJvb2xlYW4oJ2ltcG9ydCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpKTtcbnZhciB1c2VOYXRpdmVJbXBvcnRzID0gaGFzTmF0aXZlSW1wb3J0cztcbnZhciB1c2VOYXRpdmVDdXN0b21FbGVtZW50cyA9ICF3aW5kb3cuQ3VzdG9tRWxlbWVudHMgfHwgd2luZG93LkN1c3RvbUVsZW1lbnRzLnVzZU5hdGl2ZTtcbnJldHVybiB7XG53YW50U2hhZG93OiB3YW50U2hhZG93LFxuaGFzU2hhZG93OiBoYXNTaGFkb3csXG5uYXRpdmVTaGFkb3c6IG5hdGl2ZVNoYWRvdyxcbnVzZVNoYWRvdzogdXNlU2hhZG93LFxudXNlTmF0aXZlU2hhZG93OiB1c2VTaGFkb3cgJiYgbmF0aXZlU2hhZG93LFxudXNlTmF0aXZlSW1wb3J0czogdXNlTmF0aXZlSW1wb3J0cyxcbnVzZU5hdGl2ZUN1c3RvbUVsZW1lbnRzOiB1c2VOYXRpdmVDdXN0b21FbGVtZW50c1xufTtcbn0oKVxufTtcbihmdW5jdGlvbiAoKSB7XG52YXIgdXNlclBvbHltZXIgPSB3aW5kb3cuUG9seW1lcjtcbndpbmRvdy5Qb2x5bWVyID0gZnVuY3Rpb24gKHByb3RvdHlwZSkge1xudmFyIGN0b3IgPSBkZXN1Z2FyKHByb3RvdHlwZSk7XG5wcm90b3R5cGUgPSBjdG9yLnByb3RvdHlwZTtcbnZhciBvcHRpb25zID0geyBwcm90b3R5cGU6IHByb3RvdHlwZSB9O1xuaWYgKHByb3RvdHlwZS5leHRlbmRzKSB7XG5vcHRpb25zLmV4dGVuZHMgPSBwcm90b3R5cGUuZXh0ZW5kcztcbn1cblBvbHltZXIudGVsZW1ldHJ5Ll9yZWdpc3RyYXRlKHByb3RvdHlwZSk7XG5kb2N1bWVudC5yZWdpc3RlckVsZW1lbnQocHJvdG90eXBlLmlzLCBvcHRpb25zKTtcbnJldHVybiBjdG9yO1xufTtcbnZhciBkZXN1Z2FyID0gZnVuY3Rpb24gKHByb3RvdHlwZSkge1xucHJvdG90eXBlID0gUG9seW1lci5CYXNlLmNoYWluT2JqZWN0KHByb3RvdHlwZSwgUG9seW1lci5CYXNlKTtcbnByb3RvdHlwZS5yZWdpc3RlckNhbGxiYWNrKCk7XG5yZXR1cm4gcHJvdG90eXBlLmNvbnN0cnVjdG9yO1xufTtcbndpbmRvdy5Qb2x5bWVyID0gUG9seW1lcjtcbmlmICh1c2VyUG9seW1lcikge1xuZm9yICh2YXIgaSBpbiB1c2VyUG9seW1lcikge1xuUG9seW1lcltpXSA9IHVzZXJQb2x5bWVyW2ldO1xufVxufVxuUG9seW1lci5DbGFzcyA9IGRlc3VnYXI7XG59KCkpO1xuUG9seW1lci50ZWxlbWV0cnkgPSB7XG5yZWdpc3RyYXRpb25zOiBbXSxcbl9yZWdMb2c6IGZ1bmN0aW9uIChwcm90b3R5cGUpIHtcbmNvbnNvbGUubG9nKCdbJyArIHByb3RvdHlwZS5pcyArICddOiByZWdpc3RlcmVkJyk7XG59LFxuX3JlZ2lzdHJhdGU6IGZ1bmN0aW9uIChwcm90b3R5cGUpIHtcbnRoaXMucmVnaXN0cmF0aW9ucy5wdXNoKHByb3RvdHlwZSk7XG5Qb2x5bWVyLmxvZyAmJiB0aGlzLl9yZWdMb2cocHJvdG90eXBlKTtcbn0sXG5kdW1wUmVnaXN0cmF0aW9uczogZnVuY3Rpb24gKCkge1xudGhpcy5yZWdpc3RyYXRpb25zLmZvckVhY2godGhpcy5fcmVnTG9nKTtcbn1cbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LCAnY3VycmVudEltcG9ydCcsIHtcbmVudW1lcmFibGU6IHRydWUsXG5jb25maWd1cmFibGU6IHRydWUsXG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnJldHVybiAoZG9jdW1lbnQuX2N1cnJlbnRTY3JpcHQgfHwgZG9jdW1lbnQuY3VycmVudFNjcmlwdCkub3duZXJEb2N1bWVudDtcbn1cbn0pO1xuUG9seW1lci5CYXNlID0ge1xuX2FkZEZlYXR1cmU6IGZ1bmN0aW9uIChmZWF0dXJlKSB7XG50aGlzLmV4dGVuZCh0aGlzLCBmZWF0dXJlKTtcbn0sXG5yZWdpc3RlckNhbGxiYWNrOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9yZWdpc3RlckZlYXR1cmVzKCk7XG50aGlzLl9kb0JlaGF2aW9yKCdyZWdpc3RlcmVkJyk7XG59LFxuY3JlYXRlZENhbGxiYWNrOiBmdW5jdGlvbiAoKSB7XG5Qb2x5bWVyLnRlbGVtZXRyeS5pbnN0YW5jZUNvdW50Kys7XG50aGlzLnJvb3QgPSB0aGlzO1xudGhpcy5fZG9CZWhhdmlvcignY3JlYXRlZCcpO1xudGhpcy5faW5pdEZlYXR1cmVzKCk7XG59LFxuYXR0YWNoZWRDYWxsYmFjazogZnVuY3Rpb24gKCkge1xudGhpcy5pc0F0dGFjaGVkID0gdHJ1ZTtcbnRoaXMuX2RvQmVoYXZpb3IoJ2F0dGFjaGVkJyk7XG59LFxuZGV0YWNoZWRDYWxsYmFjazogZnVuY3Rpb24gKCkge1xudGhpcy5pc0F0dGFjaGVkID0gZmFsc2U7XG50aGlzLl9kb0JlaGF2aW9yKCdkZXRhY2hlZCcpO1xufSxcbmF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjazogZnVuY3Rpb24gKG5hbWUpIHtcbnRoaXMuX3NldEF0dHJpYnV0ZVRvUHJvcGVydHkodGhpcywgbmFtZSk7XG50aGlzLl9kb0JlaGF2aW9yKCdhdHRyaWJ1dGVDaGFuZ2VkJywgYXJndW1lbnRzKTtcbn0sXG5leHRlbmQ6IGZ1bmN0aW9uIChwcm90b3R5cGUsIGFwaSkge1xuaWYgKHByb3RvdHlwZSAmJiBhcGkpIHtcbk9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFwaSkuZm9yRWFjaChmdW5jdGlvbiAobikge1xudGhpcy5jb3B5T3duUHJvcGVydHkobiwgYXBpLCBwcm90b3R5cGUpO1xufSwgdGhpcyk7XG59XG5yZXR1cm4gcHJvdG90eXBlIHx8IGFwaTtcbn0sXG5taXhpbjogZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG5mb3IgKHZhciBpIGluIHNvdXJjZSkge1xudGFyZ2V0W2ldID0gc291cmNlW2ldO1xufVxucmV0dXJuIHRhcmdldDtcbn0sXG5jb3B5T3duUHJvcGVydHk6IGZ1bmN0aW9uIChuYW1lLCBzb3VyY2UsIHRhcmdldCkge1xudmFyIHBkID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIG5hbWUpO1xuaWYgKHBkKSB7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBuYW1lLCBwZCk7XG59XG59LFxuX2xvZzogY29uc29sZS5sb2cuYXBwbHkuYmluZChjb25zb2xlLmxvZywgY29uc29sZSksXG5fd2FybjogY29uc29sZS53YXJuLmFwcGx5LmJpbmQoY29uc29sZS53YXJuLCBjb25zb2xlKSxcbl9lcnJvcjogY29uc29sZS5lcnJvci5hcHBseS5iaW5kKGNvbnNvbGUuZXJyb3IsIGNvbnNvbGUpLFxuX2xvZ2Y6IGZ1bmN0aW9uICgpIHtcbnJldHVybiB0aGlzLl9sb2dQcmVmaXguY29uY2F0KFt0aGlzLmlzXSkuY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCkpO1xufVxufTtcblBvbHltZXIuQmFzZS5fbG9nUHJlZml4ID0gZnVuY3Rpb24gKCkge1xudmFyIGNvbG9yID0gd2luZG93LmNocm9tZSB8fCAvZmlyZWZveC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5yZXR1cm4gY29sb3IgPyBbXG4nJWNbJXM6OiVzXTonLFxuJ2ZvbnQtd2VpZ2h0OiBib2xkOyBiYWNrZ3JvdW5kLWNvbG9yOiNFRUVFMDA7J1xuXSA6IFsnWyVzOjolc106J107XG59KCk7XG5Qb2x5bWVyLkJhc2UuY2hhaW5PYmplY3QgPSBmdW5jdGlvbiAob2JqZWN0LCBpbmhlcml0ZWQpIHtcbmlmIChvYmplY3QgJiYgaW5oZXJpdGVkICYmIG9iamVjdCAhPT0gaW5oZXJpdGVkKSB7XG5pZiAoIU9iamVjdC5fX3Byb3RvX18pIHtcbm9iamVjdCA9IFBvbHltZXIuQmFzZS5leHRlbmQoT2JqZWN0LmNyZWF0ZShpbmhlcml0ZWQpLCBvYmplY3QpO1xufVxub2JqZWN0Ll9fcHJvdG9fXyA9IGluaGVyaXRlZDtcbn1cbnJldHVybiBvYmplY3Q7XG59O1xuUG9seW1lci5CYXNlID0gUG9seW1lci5CYXNlLmNoYWluT2JqZWN0KFBvbHltZXIuQmFzZSwgSFRNTEVsZW1lbnQucHJvdG90eXBlKTtcblBvbHltZXIudGVsZW1ldHJ5Lmluc3RhbmNlQ291bnQgPSAwO1xuKGZ1bmN0aW9uICgpIHtcbnZhciBtb2R1bGVzID0ge307XG52YXIgRG9tTW9kdWxlID0gZnVuY3Rpb24gKCkge1xucmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RvbS1tb2R1bGUnKTtcbn07XG5Eb21Nb2R1bGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShIVE1MRWxlbWVudC5wcm90b3R5cGUpO1xuRG9tTW9kdWxlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IERvbU1vZHVsZTtcbkRvbU1vZHVsZS5wcm90b3R5cGUuY3JlYXRlZENhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xudmFyIGlkID0gdGhpcy5pZCB8fCB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpIHx8IHRoaXMuZ2V0QXR0cmlidXRlKCdpcycpO1xuaWYgKGlkKSB7XG50aGlzLmlkID0gaWQ7XG5tb2R1bGVzW2lkXSA9IHRoaXM7XG59XG59O1xuRG9tTW9kdWxlLnByb3RvdHlwZS5pbXBvcnQgPSBmdW5jdGlvbiAoaWQsIHNsY3RyKSB7XG52YXIgbSA9IG1vZHVsZXNbaWRdO1xuaWYgKCFtKSB7XG5mb3JjZURvY3VtZW50VXBncmFkZSgpO1xubSA9IG1vZHVsZXNbaWRdO1xufVxuaWYgKG0gJiYgc2xjdHIpIHtcbm0gPSBtLnF1ZXJ5U2VsZWN0b3Ioc2xjdHIpO1xufVxucmV0dXJuIG07XG59O1xudmFyIGNlUG9seWZpbGwgPSB3aW5kb3cuQ3VzdG9tRWxlbWVudHMgJiYgIUN1c3RvbUVsZW1lbnRzLnVzZU5hdGl2ZTtcbmlmIChjZVBvbHlmaWxsKSB7XG52YXIgcmVhZHkgPSBDdXN0b21FbGVtZW50cy5yZWFkeTtcbkN1c3RvbUVsZW1lbnRzLnJlYWR5ID0gdHJ1ZTtcbn1cbmRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudCgnZG9tLW1vZHVsZScsIERvbU1vZHVsZSk7XG5pZiAoY2VQb2x5ZmlsbCkge1xuQ3VzdG9tRWxlbWVudHMucmVhZHkgPSByZWFkeTtcbn1cbmZ1bmN0aW9uIGZvcmNlRG9jdW1lbnRVcGdyYWRlKCkge1xuaWYgKGNlUG9seWZpbGwpIHtcbnZhciBzY3JpcHQgPSBkb2N1bWVudC5fY3VycmVudFNjcmlwdCB8fCBkb2N1bWVudC5jdXJyZW50U2NyaXB0O1xuaWYgKHNjcmlwdCkge1xuQ3VzdG9tRWxlbWVudHMudXBncmFkZUFsbChzY3JpcHQub3duZXJEb2N1bWVudCk7XG59XG59XG59XG59KCkpO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9wcmVwSXM6IGZ1bmN0aW9uICgpIHtcbmlmICghdGhpcy5pcykge1xudmFyIG1vZHVsZSA9IChkb2N1bWVudC5fY3VycmVudFNjcmlwdCB8fCBkb2N1bWVudC5jdXJyZW50U2NyaXB0KS5wYXJlbnROb2RlO1xuaWYgKG1vZHVsZS5sb2NhbE5hbWUgPT09ICdkb20tbW9kdWxlJykge1xudmFyIGlkID0gbW9kdWxlLmlkIHx8IG1vZHVsZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSB8fCBtb2R1bGUuZ2V0QXR0cmlidXRlKCdpcycpO1xudGhpcy5pcyA9IGlkO1xufVxufVxufVxufSk7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuYmVoYXZpb3JzOiBbXSxcbl9wcmVwQmVoYXZpb3JzOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5iZWhhdmlvcnMubGVuZ3RoKSB7XG50aGlzLmJlaGF2aW9ycyA9IHRoaXMuX2ZsYXR0ZW5CZWhhdmlvcnNMaXN0KHRoaXMuYmVoYXZpb3JzKTtcbn1cbnRoaXMuX3ByZXBBbGxCZWhhdmlvcnModGhpcy5iZWhhdmlvcnMpO1xufSxcbl9mbGF0dGVuQmVoYXZpb3JzTGlzdDogZnVuY3Rpb24gKGJlaGF2aW9ycykge1xudmFyIGZsYXQgPSBbXTtcbmJlaGF2aW9ycy5mb3JFYWNoKGZ1bmN0aW9uIChiKSB7XG5pZiAoYiBpbnN0YW5jZW9mIEFycmF5KSB7XG5mbGF0ID0gZmxhdC5jb25jYXQodGhpcy5fZmxhdHRlbkJlaGF2aW9yc0xpc3QoYikpO1xufSBlbHNlIGlmIChiKSB7XG5mbGF0LnB1c2goYik7XG59IGVsc2Uge1xudGhpcy5fd2Fybih0aGlzLl9sb2dmKCdfZmxhdHRlbkJlaGF2aW9yc0xpc3QnLCAnYmVoYXZpb3IgaXMgbnVsbCwgY2hlY2sgZm9yIG1pc3Npbmcgb3IgNDA0IGltcG9ydCcpKTtcbn1cbn0sIHRoaXMpO1xucmV0dXJuIGZsYXQ7XG59LFxuX3ByZXBBbGxCZWhhdmlvcnM6IGZ1bmN0aW9uIChiZWhhdmlvcnMpIHtcbmZvciAodmFyIGkgPSBiZWhhdmlvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbnRoaXMuX21peGluQmVoYXZpb3IoYmVoYXZpb3JzW2ldKTtcbn1cbmZvciAodmFyIGkgPSAwLCBsID0gYmVoYXZpb3JzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xudGhpcy5fcHJlcEJlaGF2aW9yKGJlaGF2aW9yc1tpXSk7XG59XG50aGlzLl9wcmVwQmVoYXZpb3IodGhpcyk7XG59LFxuX21peGluQmVoYXZpb3I6IGZ1bmN0aW9uIChiKSB7XG5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhiKS5mb3JFYWNoKGZ1bmN0aW9uIChuKSB7XG5zd2l0Y2ggKG4pIHtcbmNhc2UgJ2hvc3RBdHRyaWJ1dGVzJzpcbmNhc2UgJ3JlZ2lzdGVyZWQnOlxuY2FzZSAncHJvcGVydGllcyc6XG5jYXNlICdvYnNlcnZlcnMnOlxuY2FzZSAnbGlzdGVuZXJzJzpcbmNhc2UgJ2NyZWF0ZWQnOlxuY2FzZSAnYXR0YWNoZWQnOlxuY2FzZSAnZGV0YWNoZWQnOlxuY2FzZSAnYXR0cmlidXRlQ2hhbmdlZCc6XG5jYXNlICdjb25maWd1cmUnOlxuY2FzZSAncmVhZHknOlxuYnJlYWs7XG5kZWZhdWx0OlxuaWYgKCF0aGlzLmhhc093blByb3BlcnR5KG4pKSB7XG50aGlzLmNvcHlPd25Qcm9wZXJ0eShuLCBiLCB0aGlzKTtcbn1cbmJyZWFrO1xufVxufSwgdGhpcyk7XG59LFxuX2RvQmVoYXZpb3I6IGZ1bmN0aW9uIChuYW1lLCBhcmdzKSB7XG50aGlzLmJlaGF2aW9ycy5mb3JFYWNoKGZ1bmN0aW9uIChiKSB7XG50aGlzLl9pbnZva2VCZWhhdmlvcihiLCBuYW1lLCBhcmdzKTtcbn0sIHRoaXMpO1xudGhpcy5faW52b2tlQmVoYXZpb3IodGhpcywgbmFtZSwgYXJncyk7XG59LFxuX2ludm9rZUJlaGF2aW9yOiBmdW5jdGlvbiAoYiwgbmFtZSwgYXJncykge1xudmFyIGZuID0gYltuYW1lXTtcbmlmIChmbikge1xuZm4uYXBwbHkodGhpcywgYXJncyB8fCBQb2x5bWVyLm5hcik7XG59XG59LFxuX21hcnNoYWxCZWhhdmlvcnM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuYmVoYXZpb3JzLmZvckVhY2goZnVuY3Rpb24gKGIpIHtcbnRoaXMuX21hcnNoYWxCZWhhdmlvcihiKTtcbn0sIHRoaXMpO1xudGhpcy5fbWFyc2hhbEJlaGF2aW9yKHRoaXMpO1xufVxufSk7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX3ByZXBFeHRlbmRzOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5leHRlbmRzKSB7XG50aGlzLl9fcHJvdG9fXyA9IHRoaXMuX2dldEV4dGVuZGVkUHJvdG90eXBlKHRoaXMuZXh0ZW5kcyk7XG59XG59LFxuX2dldEV4dGVuZGVkUHJvdG90eXBlOiBmdW5jdGlvbiAodGFnKSB7XG5yZXR1cm4gdGhpcy5fZ2V0RXh0ZW5kZWROYXRpdmVQcm90b3R5cGUodGFnKTtcbn0sXG5fbmF0aXZlUHJvdG90eXBlczoge30sXG5fZ2V0RXh0ZW5kZWROYXRpdmVQcm90b3R5cGU6IGZ1bmN0aW9uICh0YWcpIHtcbnZhciBwID0gdGhpcy5fbmF0aXZlUHJvdG90eXBlc1t0YWddO1xuaWYgKCFwKSB7XG52YXIgbnAgPSB0aGlzLmdldE5hdGl2ZVByb3RvdHlwZSh0YWcpO1xucCA9IHRoaXMuZXh0ZW5kKE9iamVjdC5jcmVhdGUobnApLCBQb2x5bWVyLkJhc2UpO1xudGhpcy5fbmF0aXZlUHJvdG90eXBlc1t0YWddID0gcDtcbn1cbnJldHVybiBwO1xufSxcbmdldE5hdGl2ZVByb3RvdHlwZTogZnVuY3Rpb24gKHRhZykge1xucmV0dXJuIE9iamVjdC5nZXRQcm90b3R5cGVPZihkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZykpO1xufVxufSk7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX3ByZXBDb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xudGhpcy5fZmFjdG9yeUFyZ3MgPSB0aGlzLmV4dGVuZHMgPyBbXG50aGlzLmV4dGVuZHMsXG50aGlzLmlzXG5dIDogW3RoaXMuaXNdO1xudmFyIGN0b3IgPSBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gdGhpcy5fZmFjdG9yeShhcmd1bWVudHMpO1xufTtcbmlmICh0aGlzLmhhc093blByb3BlcnR5KCdleHRlbmRzJykpIHtcbmN0b3IuZXh0ZW5kcyA9IHRoaXMuZXh0ZW5kcztcbn1cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnY29uc3RydWN0b3InLCB7XG52YWx1ZTogY3RvcixcbndyaXRhYmxlOiB0cnVlLFxuY29uZmlndXJhYmxlOiB0cnVlXG59KTtcbmN0b3IucHJvdG90eXBlID0gdGhpcztcbn0sXG5fZmFjdG9yeTogZnVuY3Rpb24gKGFyZ3MpIHtcbnZhciBlbHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50LmFwcGx5KGRvY3VtZW50LCB0aGlzLl9mYWN0b3J5QXJncyk7XG5pZiAodGhpcy5mYWN0b3J5SW1wbCkge1xudGhpcy5mYWN0b3J5SW1wbC5hcHBseShlbHQsIGFyZ3MpO1xufVxucmV0dXJuIGVsdDtcbn1cbn0pO1xuUG9seW1lci5ub2IgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbnByb3BlcnRpZXM6IHt9LFxuZ2V0UHJvcGVydHlJbmZvOiBmdW5jdGlvbiAocHJvcGVydHkpIHtcbnZhciBpbmZvID0gdGhpcy5fZ2V0UHJvcGVydHlJbmZvKHByb3BlcnR5LCB0aGlzLnByb3BlcnRpZXMpO1xuaWYgKCFpbmZvKSB7XG50aGlzLmJlaGF2aW9ycy5zb21lKGZ1bmN0aW9uIChiKSB7XG5yZXR1cm4gaW5mbyA9IHRoaXMuX2dldFByb3BlcnR5SW5mbyhwcm9wZXJ0eSwgYi5wcm9wZXJ0aWVzKTtcbn0sIHRoaXMpO1xufVxucmV0dXJuIGluZm8gfHwgUG9seW1lci5ub2I7XG59LFxuX2dldFByb3BlcnR5SW5mbzogZnVuY3Rpb24gKHByb3BlcnR5LCBwcm9wZXJ0aWVzKSB7XG52YXIgcCA9IHByb3BlcnRpZXMgJiYgcHJvcGVydGllc1twcm9wZXJ0eV07XG5pZiAodHlwZW9mIHAgPT09ICdmdW5jdGlvbicpIHtcbnAgPSBwcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHsgdHlwZTogcCB9O1xufVxuaWYgKHApIHtcbnAuZGVmaW5lZCA9IHRydWU7XG59XG5yZXR1cm4gcDtcbn1cbn0pO1xuUG9seW1lci5DYXNlTWFwID0ge1xuX2Nhc2VNYXA6IHt9LFxuZGFzaFRvQ2FtZWxDYXNlOiBmdW5jdGlvbiAoZGFzaCkge1xudmFyIG1hcHBlZCA9IFBvbHltZXIuQ2FzZU1hcC5fY2FzZU1hcFtkYXNoXTtcbmlmIChtYXBwZWQpIHtcbnJldHVybiBtYXBwZWQ7XG59XG5pZiAoZGFzaC5pbmRleE9mKCctJykgPCAwKSB7XG5yZXR1cm4gUG9seW1lci5DYXNlTWFwLl9jYXNlTWFwW2Rhc2hdID0gZGFzaDtcbn1cbnJldHVybiBQb2x5bWVyLkNhc2VNYXAuX2Nhc2VNYXBbZGFzaF0gPSBkYXNoLnJlcGxhY2UoLy0oW2Etel0pL2csIGZ1bmN0aW9uIChtKSB7XG5yZXR1cm4gbVsxXS50b1VwcGVyQ2FzZSgpO1xufSk7XG59LFxuY2FtZWxUb0Rhc2hDYXNlOiBmdW5jdGlvbiAoY2FtZWwpIHtcbnZhciBtYXBwZWQgPSBQb2x5bWVyLkNhc2VNYXAuX2Nhc2VNYXBbY2FtZWxdO1xuaWYgKG1hcHBlZCkge1xucmV0dXJuIG1hcHBlZDtcbn1cbnJldHVybiBQb2x5bWVyLkNhc2VNYXAuX2Nhc2VNYXBbY2FtZWxdID0gY2FtZWwucmVwbGFjZSgvKFthLXpdW0EtWl0pL2csIGZ1bmN0aW9uIChnKSB7XG5yZXR1cm4gZ1swXSArICctJyArIGdbMV0udG9Mb3dlckNhc2UoKTtcbn0pO1xufVxufTtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5fcHJlcEF0dHJpYnV0ZXM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX2FnZ3JlZ2F0ZWRBdHRyaWJ1dGVzID0ge307XG59LFxuX2FkZEhvc3RBdHRyaWJ1dGVzOiBmdW5jdGlvbiAoYXR0cmlidXRlcykge1xuaWYgKGF0dHJpYnV0ZXMpIHtcbnRoaXMubWl4aW4odGhpcy5fYWdncmVnYXRlZEF0dHJpYnV0ZXMsIGF0dHJpYnV0ZXMpO1xufVxufSxcbl9tYXJzaGFsSG9zdEF0dHJpYnV0ZXM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX2FwcGx5QXR0cmlidXRlcyh0aGlzLCB0aGlzLl9hZ2dyZWdhdGVkQXR0cmlidXRlcyk7XG59LFxuX2FwcGx5QXR0cmlidXRlczogZnVuY3Rpb24gKG5vZGUsIGF0dHIkKSB7XG5mb3IgKHZhciBuIGluIGF0dHIkKSB7XG5pZiAoIXRoaXMuaGFzQXR0cmlidXRlKG4pICYmIG4gIT09ICdjbGFzcycpIHtcbnRoaXMuc2VyaWFsaXplVmFsdWVUb0F0dHJpYnV0ZShhdHRyJFtuXSwgbiwgdGhpcyk7XG59XG59XG59LFxuX21hcnNoYWxBdHRyaWJ1dGVzOiBmdW5jdGlvbiAoKSB7XG50aGlzLl90YWtlQXR0cmlidXRlc1RvTW9kZWwodGhpcyk7XG59LFxuX3Rha2VBdHRyaWJ1dGVzVG9Nb2RlbDogZnVuY3Rpb24gKG1vZGVsKSB7XG5mb3IgKHZhciBpID0gMCwgbCA9IHRoaXMuYXR0cmlidXRlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbnRoaXMuX3NldEF0dHJpYnV0ZVRvUHJvcGVydHkobW9kZWwsIHRoaXMuYXR0cmlidXRlc1tpXS5uYW1lKTtcbn1cbn0sXG5fc2V0QXR0cmlidXRlVG9Qcm9wZXJ0eTogZnVuY3Rpb24gKG1vZGVsLCBhdHRyTmFtZSkge1xuaWYgKCF0aGlzLl9zZXJpYWxpemluZykge1xudmFyIHByb3BOYW1lID0gUG9seW1lci5DYXNlTWFwLmRhc2hUb0NhbWVsQ2FzZShhdHRyTmFtZSk7XG52YXIgaW5mbyA9IHRoaXMuZ2V0UHJvcGVydHlJbmZvKHByb3BOYW1lKTtcbmlmIChpbmZvLmRlZmluZWQgfHwgdGhpcy5fcHJvcGVydHlFZmZlY3RzICYmIHRoaXMuX3Byb3BlcnR5RWZmZWN0c1twcm9wTmFtZV0pIHtcbnZhciB2YWwgPSB0aGlzLmdldEF0dHJpYnV0ZShhdHRyTmFtZSk7XG5tb2RlbFtwcm9wTmFtZV0gPSB0aGlzLmRlc2VyaWFsaXplKHZhbCwgaW5mby50eXBlKTtcbn1cbn1cbn0sXG5fc2VyaWFsaXppbmc6IGZhbHNlLFxucmVmbGVjdFByb3BlcnR5VG9BdHRyaWJ1dGU6IGZ1bmN0aW9uIChuYW1lKSB7XG50aGlzLl9zZXJpYWxpemluZyA9IHRydWU7XG50aGlzLnNlcmlhbGl6ZVZhbHVlVG9BdHRyaWJ1dGUodGhpc1tuYW1lXSwgUG9seW1lci5DYXNlTWFwLmNhbWVsVG9EYXNoQ2FzZShuYW1lKSk7XG50aGlzLl9zZXJpYWxpemluZyA9IGZhbHNlO1xufSxcbnNlcmlhbGl6ZVZhbHVlVG9BdHRyaWJ1dGU6IGZ1bmN0aW9uICh2YWx1ZSwgYXR0cmlidXRlLCBub2RlKSB7XG52YXIgc3RyID0gdGhpcy5zZXJpYWxpemUodmFsdWUpO1xuKG5vZGUgfHwgdGhpcylbc3RyID09PSB1bmRlZmluZWQgPyAncmVtb3ZlQXR0cmlidXRlJyA6ICdzZXRBdHRyaWJ1dGUnXShhdHRyaWJ1dGUsIHN0cik7XG59LFxuZGVzZXJpYWxpemU6IGZ1bmN0aW9uICh2YWx1ZSwgdHlwZSkge1xuc3dpdGNoICh0eXBlKSB7XG5jYXNlIE51bWJlcjpcbnZhbHVlID0gTnVtYmVyKHZhbHVlKTtcbmJyZWFrO1xuY2FzZSBCb29sZWFuOlxudmFsdWUgPSB2YWx1ZSAhPT0gbnVsbDtcbmJyZWFrO1xuY2FzZSBPYmplY3Q6XG50cnkge1xudmFsdWUgPSBKU09OLnBhcnNlKHZhbHVlKTtcbn0gY2F0Y2ggKHgpIHtcbn1cbmJyZWFrO1xuY2FzZSBBcnJheTpcbnRyeSB7XG52YWx1ZSA9IEpTT04ucGFyc2UodmFsdWUpO1xufSBjYXRjaCAoeCkge1xudmFsdWUgPSBudWxsO1xuY29uc29sZS53YXJuKCdQb2x5bWVyOjpBdHRyaWJ1dGVzOiBjb3VsZG5gdCBkZWNvZGUgQXJyYXkgYXMgSlNPTicpO1xufVxuYnJlYWs7XG5jYXNlIERhdGU6XG52YWx1ZSA9IG5ldyBEYXRlKHZhbHVlKTtcbmJyZWFrO1xuY2FzZSBTdHJpbmc6XG5kZWZhdWx0OlxuYnJlYWs7XG59XG5yZXR1cm4gdmFsdWU7XG59LFxuc2VyaWFsaXplOiBmdW5jdGlvbiAodmFsdWUpIHtcbnN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG5jYXNlICdib29sZWFuJzpcbnJldHVybiB2YWx1ZSA/ICcnIDogdW5kZWZpbmVkO1xuY2FzZSAnb2JqZWN0JzpcbmlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbnJldHVybiB2YWx1ZTtcbn0gZWxzZSBpZiAodmFsdWUpIHtcbnRyeSB7XG5yZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xufSBjYXRjaCAoeCkge1xucmV0dXJuICcnO1xufVxufVxuZGVmYXVsdDpcbnJldHVybiB2YWx1ZSAhPSBudWxsID8gdmFsdWUgOiB1bmRlZmluZWQ7XG59XG59XG59KTtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5fc2V0dXBEZWJvdW5jZXJzOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9kZWJvdW5jZXJzID0ge307XG59LFxuZGVib3VuY2U6IGZ1bmN0aW9uIChqb2JOYW1lLCBjYWxsYmFjaywgd2FpdCkge1xudGhpcy5fZGVib3VuY2Vyc1tqb2JOYW1lXSA9IFBvbHltZXIuRGVib3VuY2UuY2FsbCh0aGlzLCB0aGlzLl9kZWJvdW5jZXJzW2pvYk5hbWVdLCBjYWxsYmFjaywgd2FpdCk7XG59LFxuaXNEZWJvdW5jZXJBY3RpdmU6IGZ1bmN0aW9uIChqb2JOYW1lKSB7XG52YXIgZGVib3VuY2VyID0gdGhpcy5fZGVib3VuY2Vyc1tqb2JOYW1lXTtcbnJldHVybiBkZWJvdW5jZXIgJiYgZGVib3VuY2VyLmZpbmlzaDtcbn0sXG5mbHVzaERlYm91bmNlcjogZnVuY3Rpb24gKGpvYk5hbWUpIHtcbnZhciBkZWJvdW5jZXIgPSB0aGlzLl9kZWJvdW5jZXJzW2pvYk5hbWVdO1xuaWYgKGRlYm91bmNlcikge1xuZGVib3VuY2VyLmNvbXBsZXRlKCk7XG59XG59LFxuY2FuY2VsRGVib3VuY2VyOiBmdW5jdGlvbiAoam9iTmFtZSkge1xudmFyIGRlYm91bmNlciA9IHRoaXMuX2RlYm91bmNlcnNbam9iTmFtZV07XG5pZiAoZGVib3VuY2VyKSB7XG5kZWJvdW5jZXIuc3RvcCgpO1xufVxufVxufSk7XG5Qb2x5bWVyLnZlcnNpb24gPSAnMS4wLjYnO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9yZWdpc3RlckZlYXR1cmVzOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9wcmVwSXMoKTtcbnRoaXMuX3ByZXBBdHRyaWJ1dGVzKCk7XG50aGlzLl9wcmVwQmVoYXZpb3JzKCk7XG50aGlzLl9wcmVwRXh0ZW5kcygpO1xudGhpcy5fcHJlcENvbnN0cnVjdG9yKCk7XG59LFxuX3ByZXBCZWhhdmlvcjogZnVuY3Rpb24gKGIpIHtcbnRoaXMuX2FkZEhvc3RBdHRyaWJ1dGVzKGIuaG9zdEF0dHJpYnV0ZXMpO1xufSxcbl9tYXJzaGFsQmVoYXZpb3I6IGZ1bmN0aW9uIChiKSB7XG59LFxuX2luaXRGZWF0dXJlczogZnVuY3Rpb24gKCkge1xudGhpcy5fbWFyc2hhbEhvc3RBdHRyaWJ1dGVzKCk7XG50aGlzLl9zZXR1cERlYm91bmNlcnMoKTtcbnRoaXMuX21hcnNoYWxCZWhhdmlvcnMoKTtcbn1cbn0pO1xufSkoKTtcblxufSkiLCJyZXF1aXJlKFwiLi9wb2x5bWVyLW1pY3JvLmh0bWxcIik7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGZ1bmN0aW9uKCkge1xuOyhmdW5jdGlvbigpIHtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5fcHJlcFRlbXBsYXRlOiBmdW5jdGlvbiAoKSB7XG50aGlzLl90ZW1wbGF0ZSA9IHRoaXMuX3RlbXBsYXRlIHx8IFBvbHltZXIuRG9tTW9kdWxlLmltcG9ydCh0aGlzLmlzLCAndGVtcGxhdGUnKTtcbmlmICh0aGlzLl90ZW1wbGF0ZSAmJiB0aGlzLl90ZW1wbGF0ZS5oYXNBdHRyaWJ1dGUoJ2lzJykpIHtcbnRoaXMuX3dhcm4odGhpcy5fbG9nZignX3ByZXBUZW1wbGF0ZScsICd0b3AtbGV2ZWwgUG9seW1lciB0ZW1wbGF0ZSAnICsgJ211c3Qgbm90IGJlIGEgdHlwZS1leHRlbnNpb24sIGZvdW5kJywgdGhpcy5fdGVtcGxhdGUsICdNb3ZlIGluc2lkZSBzaW1wbGUgPHRlbXBsYXRlPi4nKSk7XG59XG59LFxuX3N0YW1wVGVtcGxhdGU6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLl90ZW1wbGF0ZSkge1xudGhpcy5yb290ID0gdGhpcy5pbnN0YW5jZVRlbXBsYXRlKHRoaXMuX3RlbXBsYXRlKTtcbn1cbn0sXG5pbnN0YW5jZVRlbXBsYXRlOiBmdW5jdGlvbiAodGVtcGxhdGUpIHtcbnZhciBkb20gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLl9jb250ZW50IHx8IHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xucmV0dXJuIGRvbTtcbn1cbn0pO1xuKGZ1bmN0aW9uICgpIHtcbnZhciBiYXNlQXR0YWNoZWRDYWxsYmFjayA9IFBvbHltZXIuQmFzZS5hdHRhY2hlZENhbGxiYWNrO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9ob3N0U3RhY2s6IFtdLFxucmVhZHk6IGZ1bmN0aW9uICgpIHtcbn0sXG5fcHVzaEhvc3Q6IGZ1bmN0aW9uIChob3N0KSB7XG50aGlzLmRhdGFIb3N0ID0gaG9zdCA9IGhvc3QgfHwgUG9seW1lci5CYXNlLl9ob3N0U3RhY2tbUG9seW1lci5CYXNlLl9ob3N0U3RhY2subGVuZ3RoIC0gMV07XG5pZiAoaG9zdCAmJiBob3N0Ll9jbGllbnRzKSB7XG5ob3N0Ll9jbGllbnRzLnB1c2godGhpcyk7XG59XG50aGlzLl9iZWdpbkhvc3QoKTtcbn0sXG5fYmVnaW5Ib3N0OiBmdW5jdGlvbiAoKSB7XG5Qb2x5bWVyLkJhc2UuX2hvc3RTdGFjay5wdXNoKHRoaXMpO1xuaWYgKCF0aGlzLl9jbGllbnRzKSB7XG50aGlzLl9jbGllbnRzID0gW107XG59XG59LFxuX3BvcEhvc3Q6IGZ1bmN0aW9uICgpIHtcblBvbHltZXIuQmFzZS5faG9zdFN0YWNrLnBvcCgpO1xufSxcbl90cnlSZWFkeTogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuX2NhblJlYWR5KCkpIHtcbnRoaXMuX3JlYWR5KCk7XG59XG59LFxuX2NhblJlYWR5OiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gIXRoaXMuZGF0YUhvc3QgfHwgdGhpcy5kYXRhSG9zdC5fY2xpZW50c1JlYWRpZWQ7XG59LFxuX3JlYWR5OiBmdW5jdGlvbiAoKSB7XG50aGlzLl9iZWZvcmVDbGllbnRzUmVhZHkoKTtcbnRoaXMuX3NldHVwUm9vdCgpO1xudGhpcy5fcmVhZHlDbGllbnRzKCk7XG50aGlzLl9hZnRlckNsaWVudHNSZWFkeSgpO1xudGhpcy5fcmVhZHlTZWxmKCk7XG59LFxuX3JlYWR5Q2xpZW50czogZnVuY3Rpb24gKCkge1xudGhpcy5fYmVnaW5EaXN0cmlidXRlKCk7XG52YXIgYyQgPSB0aGlzLl9jbGllbnRzO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBjJC5sZW5ndGgsIGM7IGkgPCBsICYmIChjID0gYyRbaV0pOyBpKyspIHtcbmMuX3JlYWR5KCk7XG59XG50aGlzLl9maW5pc2hEaXN0cmlidXRlKCk7XG50aGlzLl9jbGllbnRzUmVhZGllZCA9IHRydWU7XG50aGlzLl9jbGllbnRzID0gbnVsbDtcbn0sXG5fcmVhZHlTZWxmOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9kb0JlaGF2aW9yKCdyZWFkeScpO1xudGhpcy5fcmVhZGllZCA9IHRydWU7XG5pZiAodGhpcy5fYXR0YWNoZWRQZW5kaW5nKSB7XG50aGlzLl9hdHRhY2hlZFBlbmRpbmcgPSBmYWxzZTtcbnRoaXMuYXR0YWNoZWRDYWxsYmFjaygpO1xufVxufSxcbl9iZWZvcmVDbGllbnRzUmVhZHk6IGZ1bmN0aW9uICgpIHtcbn0sXG5fYWZ0ZXJDbGllbnRzUmVhZHk6IGZ1bmN0aW9uICgpIHtcbn0sXG5fYmVmb3JlQXR0YWNoZWQ6IGZ1bmN0aW9uICgpIHtcbn0sXG5hdHRhY2hlZENhbGxiYWNrOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5fcmVhZGllZCkge1xudGhpcy5fYmVmb3JlQXR0YWNoZWQoKTtcbmJhc2VBdHRhY2hlZENhbGxiYWNrLmNhbGwodGhpcyk7XG59IGVsc2Uge1xudGhpcy5fYXR0YWNoZWRQZW5kaW5nID0gdHJ1ZTtcbn1cbn1cbn0pO1xufSgpKTtcblBvbHltZXIuQXJyYXlTcGxpY2UgPSBmdW5jdGlvbiAoKSB7XG5mdW5jdGlvbiBuZXdTcGxpY2UoaW5kZXgsIHJlbW92ZWQsIGFkZGVkQ291bnQpIHtcbnJldHVybiB7XG5pbmRleDogaW5kZXgsXG5yZW1vdmVkOiByZW1vdmVkLFxuYWRkZWRDb3VudDogYWRkZWRDb3VudFxufTtcbn1cbnZhciBFRElUX0xFQVZFID0gMDtcbnZhciBFRElUX1VQREFURSA9IDE7XG52YXIgRURJVF9BREQgPSAyO1xudmFyIEVESVRfREVMRVRFID0gMztcbmZ1bmN0aW9uIEFycmF5U3BsaWNlKCkge1xufVxuQXJyYXlTcGxpY2UucHJvdG90eXBlID0ge1xuY2FsY0VkaXREaXN0YW5jZXM6IGZ1bmN0aW9uIChjdXJyZW50LCBjdXJyZW50U3RhcnQsIGN1cnJlbnRFbmQsIG9sZCwgb2xkU3RhcnQsIG9sZEVuZCkge1xudmFyIHJvd0NvdW50ID0gb2xkRW5kIC0gb2xkU3RhcnQgKyAxO1xudmFyIGNvbHVtbkNvdW50ID0gY3VycmVudEVuZCAtIGN1cnJlbnRTdGFydCArIDE7XG52YXIgZGlzdGFuY2VzID0gbmV3IEFycmF5KHJvd0NvdW50KTtcbmZvciAodmFyIGkgPSAwOyBpIDwgcm93Q291bnQ7IGkrKykge1xuZGlzdGFuY2VzW2ldID0gbmV3IEFycmF5KGNvbHVtbkNvdW50KTtcbmRpc3RhbmNlc1tpXVswXSA9IGk7XG59XG5mb3IgKHZhciBqID0gMDsgaiA8IGNvbHVtbkNvdW50OyBqKyspXG5kaXN0YW5jZXNbMF1bal0gPSBqO1xuZm9yICh2YXIgaSA9IDE7IGkgPCByb3dDb3VudDsgaSsrKSB7XG5mb3IgKHZhciBqID0gMTsgaiA8IGNvbHVtbkNvdW50OyBqKyspIHtcbmlmICh0aGlzLmVxdWFscyhjdXJyZW50W2N1cnJlbnRTdGFydCArIGogLSAxXSwgb2xkW29sZFN0YXJ0ICsgaSAtIDFdKSlcbmRpc3RhbmNlc1tpXVtqXSA9IGRpc3RhbmNlc1tpIC0gMV1baiAtIDFdO1xuZWxzZSB7XG52YXIgbm9ydGggPSBkaXN0YW5jZXNbaSAtIDFdW2pdICsgMTtcbnZhciB3ZXN0ID0gZGlzdGFuY2VzW2ldW2ogLSAxXSArIDE7XG5kaXN0YW5jZXNbaV1bal0gPSBub3J0aCA8IHdlc3QgPyBub3J0aCA6IHdlc3Q7XG59XG59XG59XG5yZXR1cm4gZGlzdGFuY2VzO1xufSxcbnNwbGljZU9wZXJhdGlvbnNGcm9tRWRpdERpc3RhbmNlczogZnVuY3Rpb24gKGRpc3RhbmNlcykge1xudmFyIGkgPSBkaXN0YW5jZXMubGVuZ3RoIC0gMTtcbnZhciBqID0gZGlzdGFuY2VzWzBdLmxlbmd0aCAtIDE7XG52YXIgY3VycmVudCA9IGRpc3RhbmNlc1tpXVtqXTtcbnZhciBlZGl0cyA9IFtdO1xud2hpbGUgKGkgPiAwIHx8IGogPiAwKSB7XG5pZiAoaSA9PSAwKSB7XG5lZGl0cy5wdXNoKEVESVRfQUREKTtcbmotLTtcbmNvbnRpbnVlO1xufVxuaWYgKGogPT0gMCkge1xuZWRpdHMucHVzaChFRElUX0RFTEVURSk7XG5pLS07XG5jb250aW51ZTtcbn1cbnZhciBub3J0aFdlc3QgPSBkaXN0YW5jZXNbaSAtIDFdW2ogLSAxXTtcbnZhciB3ZXN0ID0gZGlzdGFuY2VzW2kgLSAxXVtqXTtcbnZhciBub3J0aCA9IGRpc3RhbmNlc1tpXVtqIC0gMV07XG52YXIgbWluO1xuaWYgKHdlc3QgPCBub3J0aClcbm1pbiA9IHdlc3QgPCBub3J0aFdlc3QgPyB3ZXN0IDogbm9ydGhXZXN0O1xuZWxzZVxubWluID0gbm9ydGggPCBub3J0aFdlc3QgPyBub3J0aCA6IG5vcnRoV2VzdDtcbmlmIChtaW4gPT0gbm9ydGhXZXN0KSB7XG5pZiAobm9ydGhXZXN0ID09IGN1cnJlbnQpIHtcbmVkaXRzLnB1c2goRURJVF9MRUFWRSk7XG59IGVsc2Uge1xuZWRpdHMucHVzaChFRElUX1VQREFURSk7XG5jdXJyZW50ID0gbm9ydGhXZXN0O1xufVxuaS0tO1xuai0tO1xufSBlbHNlIGlmIChtaW4gPT0gd2VzdCkge1xuZWRpdHMucHVzaChFRElUX0RFTEVURSk7XG5pLS07XG5jdXJyZW50ID0gd2VzdDtcbn0gZWxzZSB7XG5lZGl0cy5wdXNoKEVESVRfQUREKTtcbmotLTtcbmN1cnJlbnQgPSBub3J0aDtcbn1cbn1cbmVkaXRzLnJldmVyc2UoKTtcbnJldHVybiBlZGl0cztcbn0sXG5jYWxjU3BsaWNlczogZnVuY3Rpb24gKGN1cnJlbnQsIGN1cnJlbnRTdGFydCwgY3VycmVudEVuZCwgb2xkLCBvbGRTdGFydCwgb2xkRW5kKSB7XG52YXIgcHJlZml4Q291bnQgPSAwO1xudmFyIHN1ZmZpeENvdW50ID0gMDtcbnZhciBtaW5MZW5ndGggPSBNYXRoLm1pbihjdXJyZW50RW5kIC0gY3VycmVudFN0YXJ0LCBvbGRFbmQgLSBvbGRTdGFydCk7XG5pZiAoY3VycmVudFN0YXJ0ID09IDAgJiYgb2xkU3RhcnQgPT0gMClcbnByZWZpeENvdW50ID0gdGhpcy5zaGFyZWRQcmVmaXgoY3VycmVudCwgb2xkLCBtaW5MZW5ndGgpO1xuaWYgKGN1cnJlbnRFbmQgPT0gY3VycmVudC5sZW5ndGggJiYgb2xkRW5kID09IG9sZC5sZW5ndGgpXG5zdWZmaXhDb3VudCA9IHRoaXMuc2hhcmVkU3VmZml4KGN1cnJlbnQsIG9sZCwgbWluTGVuZ3RoIC0gcHJlZml4Q291bnQpO1xuY3VycmVudFN0YXJ0ICs9IHByZWZpeENvdW50O1xub2xkU3RhcnQgKz0gcHJlZml4Q291bnQ7XG5jdXJyZW50RW5kIC09IHN1ZmZpeENvdW50O1xub2xkRW5kIC09IHN1ZmZpeENvdW50O1xuaWYgKGN1cnJlbnRFbmQgLSBjdXJyZW50U3RhcnQgPT0gMCAmJiBvbGRFbmQgLSBvbGRTdGFydCA9PSAwKVxucmV0dXJuIFtdO1xuaWYgKGN1cnJlbnRTdGFydCA9PSBjdXJyZW50RW5kKSB7XG52YXIgc3BsaWNlID0gbmV3U3BsaWNlKGN1cnJlbnRTdGFydCwgW10sIDApO1xud2hpbGUgKG9sZFN0YXJ0IDwgb2xkRW5kKVxuc3BsaWNlLnJlbW92ZWQucHVzaChvbGRbb2xkU3RhcnQrK10pO1xucmV0dXJuIFtzcGxpY2VdO1xufSBlbHNlIGlmIChvbGRTdGFydCA9PSBvbGRFbmQpXG5yZXR1cm4gW25ld1NwbGljZShjdXJyZW50U3RhcnQsIFtdLCBjdXJyZW50RW5kIC0gY3VycmVudFN0YXJ0KV07XG52YXIgb3BzID0gdGhpcy5zcGxpY2VPcGVyYXRpb25zRnJvbUVkaXREaXN0YW5jZXModGhpcy5jYWxjRWRpdERpc3RhbmNlcyhjdXJyZW50LCBjdXJyZW50U3RhcnQsIGN1cnJlbnRFbmQsIG9sZCwgb2xkU3RhcnQsIG9sZEVuZCkpO1xudmFyIHNwbGljZSA9IHVuZGVmaW5lZDtcbnZhciBzcGxpY2VzID0gW107XG52YXIgaW5kZXggPSBjdXJyZW50U3RhcnQ7XG52YXIgb2xkSW5kZXggPSBvbGRTdGFydDtcbmZvciAodmFyIGkgPSAwOyBpIDwgb3BzLmxlbmd0aDsgaSsrKSB7XG5zd2l0Y2ggKG9wc1tpXSkge1xuY2FzZSBFRElUX0xFQVZFOlxuaWYgKHNwbGljZSkge1xuc3BsaWNlcy5wdXNoKHNwbGljZSk7XG5zcGxpY2UgPSB1bmRlZmluZWQ7XG59XG5pbmRleCsrO1xub2xkSW5kZXgrKztcbmJyZWFrO1xuY2FzZSBFRElUX1VQREFURTpcbmlmICghc3BsaWNlKVxuc3BsaWNlID0gbmV3U3BsaWNlKGluZGV4LCBbXSwgMCk7XG5zcGxpY2UuYWRkZWRDb3VudCsrO1xuaW5kZXgrKztcbnNwbGljZS5yZW1vdmVkLnB1c2gob2xkW29sZEluZGV4XSk7XG5vbGRJbmRleCsrO1xuYnJlYWs7XG5jYXNlIEVESVRfQUREOlxuaWYgKCFzcGxpY2UpXG5zcGxpY2UgPSBuZXdTcGxpY2UoaW5kZXgsIFtdLCAwKTtcbnNwbGljZS5hZGRlZENvdW50Kys7XG5pbmRleCsrO1xuYnJlYWs7XG5jYXNlIEVESVRfREVMRVRFOlxuaWYgKCFzcGxpY2UpXG5zcGxpY2UgPSBuZXdTcGxpY2UoaW5kZXgsIFtdLCAwKTtcbnNwbGljZS5yZW1vdmVkLnB1c2gob2xkW29sZEluZGV4XSk7XG5vbGRJbmRleCsrO1xuYnJlYWs7XG59XG59XG5pZiAoc3BsaWNlKSB7XG5zcGxpY2VzLnB1c2goc3BsaWNlKTtcbn1cbnJldHVybiBzcGxpY2VzO1xufSxcbnNoYXJlZFByZWZpeDogZnVuY3Rpb24gKGN1cnJlbnQsIG9sZCwgc2VhcmNoTGVuZ3RoKSB7XG5mb3IgKHZhciBpID0gMDsgaSA8IHNlYXJjaExlbmd0aDsgaSsrKVxuaWYgKCF0aGlzLmVxdWFscyhjdXJyZW50W2ldLCBvbGRbaV0pKVxucmV0dXJuIGk7XG5yZXR1cm4gc2VhcmNoTGVuZ3RoO1xufSxcbnNoYXJlZFN1ZmZpeDogZnVuY3Rpb24gKGN1cnJlbnQsIG9sZCwgc2VhcmNoTGVuZ3RoKSB7XG52YXIgaW5kZXgxID0gY3VycmVudC5sZW5ndGg7XG52YXIgaW5kZXgyID0gb2xkLmxlbmd0aDtcbnZhciBjb3VudCA9IDA7XG53aGlsZSAoY291bnQgPCBzZWFyY2hMZW5ndGggJiYgdGhpcy5lcXVhbHMoY3VycmVudFstLWluZGV4MV0sIG9sZFstLWluZGV4Ml0pKVxuY291bnQrKztcbnJldHVybiBjb3VudDtcbn0sXG5jYWxjdWxhdGVTcGxpY2VzOiBmdW5jdGlvbiAoY3VycmVudCwgcHJldmlvdXMpIHtcbnJldHVybiB0aGlzLmNhbGNTcGxpY2VzKGN1cnJlbnQsIDAsIGN1cnJlbnQubGVuZ3RoLCBwcmV2aW91cywgMCwgcHJldmlvdXMubGVuZ3RoKTtcbn0sXG5lcXVhbHM6IGZ1bmN0aW9uIChjdXJyZW50VmFsdWUsIHByZXZpb3VzVmFsdWUpIHtcbnJldHVybiBjdXJyZW50VmFsdWUgPT09IHByZXZpb3VzVmFsdWU7XG59XG59O1xucmV0dXJuIG5ldyBBcnJheVNwbGljZSgpO1xufSgpO1xuUG9seW1lci5FdmVudEFwaSA9IGZ1bmN0aW9uICgpIHtcbnZhciBTZXR0aW5ncyA9IFBvbHltZXIuU2V0dGluZ3M7XG52YXIgRXZlbnRBcGkgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbnRoaXMuZXZlbnQgPSBldmVudDtcbn07XG5pZiAoU2V0dGluZ3MudXNlU2hhZG93KSB7XG5FdmVudEFwaS5wcm90b3R5cGUgPSB7XG5nZXQgcm9vdFRhcmdldCgpIHtcbnJldHVybiB0aGlzLmV2ZW50LnBhdGhbMF07XG59LFxuZ2V0IGxvY2FsVGFyZ2V0KCkge1xucmV0dXJuIHRoaXMuZXZlbnQudGFyZ2V0O1xufSxcbmdldCBwYXRoKCkge1xucmV0dXJuIHRoaXMuZXZlbnQucGF0aDtcbn1cbn07XG59IGVsc2Uge1xuRXZlbnRBcGkucHJvdG90eXBlID0ge1xuZ2V0IHJvb3RUYXJnZXQoKSB7XG5yZXR1cm4gdGhpcy5ldmVudC50YXJnZXQ7XG59LFxuZ2V0IGxvY2FsVGFyZ2V0KCkge1xudmFyIGN1cnJlbnQgPSB0aGlzLmV2ZW50LmN1cnJlbnRUYXJnZXQ7XG52YXIgY3VycmVudFJvb3QgPSBjdXJyZW50ICYmIFBvbHltZXIuZG9tKGN1cnJlbnQpLmdldE93bmVyUm9vdCgpO1xudmFyIHAkID0gdGhpcy5wYXRoO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBwJC5sZW5ndGg7IGkrKykge1xuaWYgKFBvbHltZXIuZG9tKHAkW2ldKS5nZXRPd25lclJvb3QoKSA9PT0gY3VycmVudFJvb3QpIHtcbnJldHVybiBwJFtpXTtcbn1cbn1cbn0sXG5nZXQgcGF0aCgpIHtcbmlmICghdGhpcy5ldmVudC5fcGF0aCkge1xudmFyIHBhdGggPSBbXTtcbnZhciBvID0gdGhpcy5yb290VGFyZ2V0O1xud2hpbGUgKG8pIHtcbnBhdGgucHVzaChvKTtcbm8gPSBQb2x5bWVyLmRvbShvKS5wYXJlbnROb2RlIHx8IG8uaG9zdDtcbn1cbnBhdGgucHVzaCh3aW5kb3cpO1xudGhpcy5ldmVudC5fcGF0aCA9IHBhdGg7XG59XG5yZXR1cm4gdGhpcy5ldmVudC5fcGF0aDtcbn1cbn07XG59XG52YXIgZmFjdG9yeSA9IGZ1bmN0aW9uIChldmVudCkge1xuaWYgKCFldmVudC5fX2V2ZW50QXBpKSB7XG5ldmVudC5fX2V2ZW50QXBpID0gbmV3IEV2ZW50QXBpKGV2ZW50KTtcbn1cbnJldHVybiBldmVudC5fX2V2ZW50QXBpO1xufTtcbnJldHVybiB7IGZhY3Rvcnk6IGZhY3RvcnkgfTtcbn0oKTtcblBvbHltZXIuZG9tSW5uZXJIVE1MID0gZnVuY3Rpb24gKCkge1xudmFyIGVzY2FwZUF0dHJSZWdFeHAgPSAvWyZcXHUwMEEwXCJdL2c7XG52YXIgZXNjYXBlRGF0YVJlZ0V4cCA9IC9bJlxcdTAwQTA8Pl0vZztcbmZ1bmN0aW9uIGVzY2FwZVJlcGxhY2UoYykge1xuc3dpdGNoIChjKSB7XG5jYXNlICcmJzpcbnJldHVybiAnJmFtcDsnO1xuY2FzZSAnPCc6XG5yZXR1cm4gJyZsdDsnO1xuY2FzZSAnPic6XG5yZXR1cm4gJyZndDsnO1xuY2FzZSAnXCInOlxucmV0dXJuICcmcXVvdDsnO1xuY2FzZSAnXFx4QTAnOlxucmV0dXJuICcmbmJzcDsnO1xufVxufVxuZnVuY3Rpb24gZXNjYXBlQXR0cihzKSB7XG5yZXR1cm4gcy5yZXBsYWNlKGVzY2FwZUF0dHJSZWdFeHAsIGVzY2FwZVJlcGxhY2UpO1xufVxuZnVuY3Rpb24gZXNjYXBlRGF0YShzKSB7XG5yZXR1cm4gcy5yZXBsYWNlKGVzY2FwZURhdGFSZWdFeHAsIGVzY2FwZVJlcGxhY2UpO1xufVxuZnVuY3Rpb24gbWFrZVNldChhcnIpIHtcbnZhciBzZXQgPSB7fTtcbmZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG5zZXRbYXJyW2ldXSA9IHRydWU7XG59XG5yZXR1cm4gc2V0O1xufVxudmFyIHZvaWRFbGVtZW50cyA9IG1ha2VTZXQoW1xuJ2FyZWEnLFxuJ2Jhc2UnLFxuJ2JyJyxcbidjb2wnLFxuJ2NvbW1hbmQnLFxuJ2VtYmVkJyxcbidocicsXG4naW1nJyxcbidpbnB1dCcsXG4na2V5Z2VuJyxcbidsaW5rJyxcbidtZXRhJyxcbidwYXJhbScsXG4nc291cmNlJyxcbid0cmFjaycsXG4nd2JyJ1xuXSk7XG52YXIgcGxhaW50ZXh0UGFyZW50cyA9IG1ha2VTZXQoW1xuJ3N0eWxlJyxcbidzY3JpcHQnLFxuJ3htcCcsXG4naWZyYW1lJyxcbidub2VtYmVkJyxcbidub2ZyYW1lcycsXG4ncGxhaW50ZXh0Jyxcbidub3NjcmlwdCdcbl0pO1xuZnVuY3Rpb24gZ2V0T3V0ZXJIVE1MKG5vZGUsIHBhcmVudE5vZGUsIGNvbXBvc2VkKSB7XG5zd2l0Y2ggKG5vZGUubm9kZVR5cGUpIHtcbmNhc2UgTm9kZS5FTEVNRU5UX05PREU6XG52YXIgdGFnTmFtZSA9IG5vZGUubG9jYWxOYW1lO1xudmFyIHMgPSAnPCcgKyB0YWdOYW1lO1xudmFyIGF0dHJzID0gbm9kZS5hdHRyaWJ1dGVzO1xuZm9yICh2YXIgaSA9IDAsIGF0dHI7IGF0dHIgPSBhdHRyc1tpXTsgaSsrKSB7XG5zICs9ICcgJyArIGF0dHIubmFtZSArICc9XCInICsgZXNjYXBlQXR0cihhdHRyLnZhbHVlKSArICdcIic7XG59XG5zICs9ICc+JztcbmlmICh2b2lkRWxlbWVudHNbdGFnTmFtZV0pIHtcbnJldHVybiBzO1xufVxucmV0dXJuIHMgKyBnZXRJbm5lckhUTUwobm9kZSwgY29tcG9zZWQpICsgJzwvJyArIHRhZ05hbWUgKyAnPic7XG5jYXNlIE5vZGUuVEVYVF9OT0RFOlxudmFyIGRhdGEgPSBub2RlLmRhdGE7XG5pZiAocGFyZW50Tm9kZSAmJiBwbGFpbnRleHRQYXJlbnRzW3BhcmVudE5vZGUubG9jYWxOYW1lXSkge1xucmV0dXJuIGRhdGE7XG59XG5yZXR1cm4gZXNjYXBlRGF0YShkYXRhKTtcbmNhc2UgTm9kZS5DT01NRU5UX05PREU6XG5yZXR1cm4gJzwhLS0nICsgbm9kZS5kYXRhICsgJy0tPic7XG5kZWZhdWx0OlxuY29uc29sZS5lcnJvcihub2RlKTtcbnRocm93IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJyk7XG59XG59XG5mdW5jdGlvbiBnZXRJbm5lckhUTUwobm9kZSwgY29tcG9zZWQpIHtcbmlmIChub2RlIGluc3RhbmNlb2YgSFRNTFRlbXBsYXRlRWxlbWVudClcbm5vZGUgPSBub2RlLmNvbnRlbnQ7XG52YXIgcyA9ICcnO1xudmFyIGMkID0gUG9seW1lci5kb20obm9kZSkuY2hpbGROb2RlcztcbmMkID0gY29tcG9zZWQgPyBub2RlLl9jb21wb3NlZENoaWxkcmVuIDogYyQ7XG5mb3IgKHZhciBpID0gMCwgbCA9IGMkLmxlbmd0aCwgY2hpbGQ7IGkgPCBsICYmIChjaGlsZCA9IGMkW2ldKTsgaSsrKSB7XG5zICs9IGdldE91dGVySFRNTChjaGlsZCwgbm9kZSwgY29tcG9zZWQpO1xufVxucmV0dXJuIHM7XG59XG5yZXR1cm4geyBnZXRJbm5lckhUTUw6IGdldElubmVySFRNTCB9O1xufSgpO1xuUG9seW1lci5Eb21BcGkgPSBmdW5jdGlvbiAoKSB7XG4ndXNlIHN0cmljdCc7XG52YXIgU2V0dGluZ3MgPSBQb2x5bWVyLlNldHRpbmdzO1xudmFyIGdldElubmVySFRNTCA9IFBvbHltZXIuZG9tSW5uZXJIVE1MLmdldElubmVySFRNTDtcbnZhciBuYXRpdmVJbnNlcnRCZWZvcmUgPSBFbGVtZW50LnByb3RvdHlwZS5pbnNlcnRCZWZvcmU7XG52YXIgbmF0aXZlUmVtb3ZlQ2hpbGQgPSBFbGVtZW50LnByb3RvdHlwZS5yZW1vdmVDaGlsZDtcbnZhciBuYXRpdmVBcHBlbmRDaGlsZCA9IEVsZW1lbnQucHJvdG90eXBlLmFwcGVuZENoaWxkO1xudmFyIG5hdGl2ZUNsb25lTm9kZSA9IEVsZW1lbnQucHJvdG90eXBlLmNsb25lTm9kZTtcbnZhciBuYXRpdmVJbXBvcnROb2RlID0gRG9jdW1lbnQucHJvdG90eXBlLmltcG9ydE5vZGU7XG52YXIgZGlydHlSb290cyA9IFtdO1xudmFyIERvbUFwaSA9IGZ1bmN0aW9uIChub2RlKSB7XG50aGlzLm5vZGUgPSBub2RlO1xuaWYgKHRoaXMucGF0Y2gpIHtcbnRoaXMucGF0Y2goKTtcbn1cbn07XG5Eb21BcGkucHJvdG90eXBlID0ge1xuZmx1c2g6IGZ1bmN0aW9uICgpIHtcbmZvciAodmFyIGkgPSAwLCBob3N0OyBpIDwgZGlydHlSb290cy5sZW5ndGg7IGkrKykge1xuaG9zdCA9IGRpcnR5Um9vdHNbaV07XG5ob3N0LmZsdXNoRGVib3VuY2VyKCdfZGlzdHJpYnV0ZScpO1xufVxuZGlydHlSb290cyA9IFtdO1xufSxcbl9sYXp5RGlzdHJpYnV0ZTogZnVuY3Rpb24gKGhvc3QpIHtcbmlmIChob3N0LnNoYWR5Um9vdCAmJiBob3N0LnNoYWR5Um9vdC5fZGlzdHJpYnV0aW9uQ2xlYW4pIHtcbmhvc3Quc2hhZHlSb290Ll9kaXN0cmlidXRpb25DbGVhbiA9IGZhbHNlO1xuaG9zdC5kZWJvdW5jZSgnX2Rpc3RyaWJ1dGUnLCBob3N0Ll9kaXN0cmlidXRlQ29udGVudCk7XG5kaXJ0eVJvb3RzLnB1c2goaG9zdCk7XG59XG59LFxuYXBwZW5kQ2hpbGQ6IGZ1bmN0aW9uIChub2RlKSB7XG52YXIgaGFuZGxlZDtcbnRoaXMuX3JlbW92ZU5vZGVGcm9tSG9zdChub2RlLCB0cnVlKTtcbmlmICh0aGlzLl9ub2RlSXNJbkxvZ2ljYWxUcmVlKHRoaXMubm9kZSkpIHtcbnRoaXMuX2FkZExvZ2ljYWxJbmZvKG5vZGUsIHRoaXMubm9kZSk7XG50aGlzLl9hZGROb2RlVG9Ib3N0KG5vZGUpO1xuaGFuZGxlZCA9IHRoaXMuX21heWJlRGlzdHJpYnV0ZShub2RlLCB0aGlzLm5vZGUpO1xufVxuaWYgKCFoYW5kbGVkICYmICF0aGlzLl90cnlSZW1vdmVVbmRpc3RyaWJ1dGVkTm9kZShub2RlKSkge1xudmFyIGNvbnRhaW5lciA9IHRoaXMubm9kZS5faXNTaGFkeVJvb3QgPyB0aGlzLm5vZGUuaG9zdCA6IHRoaXMubm9kZTtcbmFkZFRvQ29tcG9zZWRQYXJlbnQoY29udGFpbmVyLCBub2RlKTtcbm5hdGl2ZUFwcGVuZENoaWxkLmNhbGwoY29udGFpbmVyLCBub2RlKTtcbn1cbnJldHVybiBub2RlO1xufSxcbmluc2VydEJlZm9yZTogZnVuY3Rpb24gKG5vZGUsIHJlZl9ub2RlKSB7XG5pZiAoIXJlZl9ub2RlKSB7XG5yZXR1cm4gdGhpcy5hcHBlbmRDaGlsZChub2RlKTtcbn1cbnZhciBoYW5kbGVkO1xudGhpcy5fcmVtb3ZlTm9kZUZyb21Ib3N0KG5vZGUsIHRydWUpO1xuaWYgKHRoaXMuX25vZGVJc0luTG9naWNhbFRyZWUodGhpcy5ub2RlKSkge1xuc2F2ZUxpZ2h0Q2hpbGRyZW5JZk5lZWRlZCh0aGlzLm5vZGUpO1xudmFyIGNoaWxkcmVuID0gdGhpcy5jaGlsZE5vZGVzO1xudmFyIGluZGV4ID0gY2hpbGRyZW4uaW5kZXhPZihyZWZfbm9kZSk7XG5pZiAoaW5kZXggPCAwKSB7XG50aHJvdyBFcnJvcignVGhlIHJlZl9ub2RlIHRvIGJlIGluc2VydGVkIGJlZm9yZSBpcyBub3QgYSBjaGlsZCAnICsgJ29mIHRoaXMgbm9kZScpO1xufVxudGhpcy5fYWRkTG9naWNhbEluZm8obm9kZSwgdGhpcy5ub2RlLCBpbmRleCk7XG50aGlzLl9hZGROb2RlVG9Ib3N0KG5vZGUpO1xuaGFuZGxlZCA9IHRoaXMuX21heWJlRGlzdHJpYnV0ZShub2RlLCB0aGlzLm5vZGUpO1xufVxuaWYgKCFoYW5kbGVkICYmICF0aGlzLl90cnlSZW1vdmVVbmRpc3RyaWJ1dGVkTm9kZShub2RlKSkge1xucmVmX25vZGUgPSByZWZfbm9kZS5sb2NhbE5hbWUgPT09IENPTlRFTlQgPyB0aGlzLl9maXJzdENvbXBvc2VkTm9kZShyZWZfbm9kZSkgOiByZWZfbm9kZTtcbnZhciBjb250YWluZXIgPSB0aGlzLm5vZGUuX2lzU2hhZHlSb290ID8gdGhpcy5ub2RlLmhvc3QgOiB0aGlzLm5vZGU7XG5hZGRUb0NvbXBvc2VkUGFyZW50KGNvbnRhaW5lciwgbm9kZSwgcmVmX25vZGUpO1xubmF0aXZlSW5zZXJ0QmVmb3JlLmNhbGwoY29udGFpbmVyLCBub2RlLCByZWZfbm9kZSk7XG59XG5yZXR1cm4gbm9kZTtcbn0sXG5yZW1vdmVDaGlsZDogZnVuY3Rpb24gKG5vZGUpIHtcbmlmIChmYWN0b3J5KG5vZGUpLnBhcmVudE5vZGUgIT09IHRoaXMubm9kZSkge1xuY29uc29sZS53YXJuKCdUaGUgbm9kZSB0byBiZSByZW1vdmVkIGlzIG5vdCBhIGNoaWxkIG9mIHRoaXMgbm9kZScsIG5vZGUpO1xufVxudmFyIGhhbmRsZWQ7XG5pZiAodGhpcy5fbm9kZUlzSW5Mb2dpY2FsVHJlZSh0aGlzLm5vZGUpKSB7XG50aGlzLl9yZW1vdmVOb2RlRnJvbUhvc3Qobm9kZSk7XG5oYW5kbGVkID0gdGhpcy5fbWF5YmVEaXN0cmlidXRlKG5vZGUsIHRoaXMubm9kZSk7XG59XG5pZiAoIWhhbmRsZWQpIHtcbnZhciBjb250YWluZXIgPSB0aGlzLm5vZGUuX2lzU2hhZHlSb290ID8gdGhpcy5ub2RlLmhvc3QgOiB0aGlzLm5vZGU7XG5pZiAoY29udGFpbmVyID09PSBub2RlLnBhcmVudE5vZGUpIHtcbnJlbW92ZUZyb21Db21wb3NlZFBhcmVudChjb250YWluZXIsIG5vZGUpO1xubmF0aXZlUmVtb3ZlQ2hpbGQuY2FsbChjb250YWluZXIsIG5vZGUpO1xufVxufVxucmV0dXJuIG5vZGU7XG59LFxucmVwbGFjZUNoaWxkOiBmdW5jdGlvbiAobm9kZSwgcmVmX25vZGUpIHtcbnRoaXMuaW5zZXJ0QmVmb3JlKG5vZGUsIHJlZl9ub2RlKTtcbnRoaXMucmVtb3ZlQ2hpbGQocmVmX25vZGUpO1xucmV0dXJuIG5vZGU7XG59LFxuZ2V0T3duZXJSb290OiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gdGhpcy5fb3duZXJTaGFkeVJvb3RGb3JOb2RlKHRoaXMubm9kZSk7XG59LFxuX293bmVyU2hhZHlSb290Rm9yTm9kZTogZnVuY3Rpb24gKG5vZGUpIHtcbmlmICghbm9kZSkge1xucmV0dXJuO1xufVxuaWYgKG5vZGUuX293bmVyU2hhZHlSb290ID09PSB1bmRlZmluZWQpIHtcbnZhciByb290O1xuaWYgKG5vZGUuX2lzU2hhZHlSb290KSB7XG5yb290ID0gbm9kZTtcbn0gZWxzZSB7XG52YXIgcGFyZW50ID0gUG9seW1lci5kb20obm9kZSkucGFyZW50Tm9kZTtcbmlmIChwYXJlbnQpIHtcbnJvb3QgPSBwYXJlbnQuX2lzU2hhZHlSb290ID8gcGFyZW50IDogdGhpcy5fb3duZXJTaGFkeVJvb3RGb3JOb2RlKHBhcmVudCk7XG59IGVsc2Uge1xucm9vdCA9IG51bGw7XG59XG59XG5ub2RlLl9vd25lclNoYWR5Um9vdCA9IHJvb3Q7XG59XG5yZXR1cm4gbm9kZS5fb3duZXJTaGFkeVJvb3Q7XG59LFxuX21heWJlRGlzdHJpYnV0ZTogZnVuY3Rpb24gKG5vZGUsIHBhcmVudCkge1xudmFyIGZyYWdDb250ZW50ID0gbm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5ET0NVTUVOVF9GUkFHTUVOVF9OT0RFICYmICFub2RlLl9fbm9Db250ZW50ICYmIFBvbHltZXIuZG9tKG5vZGUpLnF1ZXJ5U2VsZWN0b3IoQ09OVEVOVCk7XG52YXIgd3JhcHBlZENvbnRlbnQgPSBmcmFnQ29udGVudCAmJiBQb2x5bWVyLmRvbShmcmFnQ29udGVudCkucGFyZW50Tm9kZS5ub2RlVHlwZSAhPT0gTm9kZS5ET0NVTUVOVF9GUkFHTUVOVF9OT0RFO1xudmFyIGhhc0NvbnRlbnQgPSBmcmFnQ29udGVudCB8fCBub2RlLmxvY2FsTmFtZSA9PT0gQ09OVEVOVDtcbmlmIChoYXNDb250ZW50KSB7XG52YXIgcm9vdCA9IHRoaXMuX293bmVyU2hhZHlSb290Rm9yTm9kZShwYXJlbnQpO1xuaWYgKHJvb3QpIHtcbnZhciBob3N0ID0gcm9vdC5ob3N0O1xudGhpcy5fdXBkYXRlSW5zZXJ0aW9uUG9pbnRzKGhvc3QpO1xudGhpcy5fbGF6eURpc3RyaWJ1dGUoaG9zdCk7XG59XG59XG52YXIgcGFyZW50TmVlZHNEaXN0ID0gdGhpcy5fcGFyZW50TmVlZHNEaXN0cmlidXRpb24ocGFyZW50KTtcbmlmIChwYXJlbnROZWVkc0Rpc3QpIHtcbnRoaXMuX2xhenlEaXN0cmlidXRlKHBhcmVudCk7XG59XG5yZXR1cm4gcGFyZW50TmVlZHNEaXN0IHx8IGhhc0NvbnRlbnQgJiYgIXdyYXBwZWRDb250ZW50O1xufSxcbl90cnlSZW1vdmVVbmRpc3RyaWJ1dGVkTm9kZTogZnVuY3Rpb24gKG5vZGUpIHtcbmlmICh0aGlzLm5vZGUuc2hhZHlSb290KSB7XG5pZiAobm9kZS5fY29tcG9zZWRQYXJlbnQpIHtcbm5hdGl2ZVJlbW92ZUNoaWxkLmNhbGwobm9kZS5fY29tcG9zZWRQYXJlbnQsIG5vZGUpO1xufVxucmV0dXJuIHRydWU7XG59XG59LFxuX3VwZGF0ZUluc2VydGlvblBvaW50czogZnVuY3Rpb24gKGhvc3QpIHtcbmhvc3Quc2hhZHlSb290Ll9pbnNlcnRpb25Qb2ludHMgPSBmYWN0b3J5KGhvc3Quc2hhZHlSb290KS5xdWVyeVNlbGVjdG9yQWxsKENPTlRFTlQpO1xufSxcbl9ub2RlSXNJbkxvZ2ljYWxUcmVlOiBmdW5jdGlvbiAobm9kZSkge1xucmV0dXJuIEJvb2xlYW4obm9kZS5fbGlnaHRQYXJlbnQgIT09IHVuZGVmaW5lZCB8fCBub2RlLl9pc1NoYWR5Um9vdCB8fCB0aGlzLl9vd25lclNoYWR5Um9vdEZvck5vZGUobm9kZSkgfHwgbm9kZS5zaGFkeVJvb3QpO1xufSxcbl9wYXJlbnROZWVkc0Rpc3RyaWJ1dGlvbjogZnVuY3Rpb24gKHBhcmVudCkge1xucmV0dXJuIHBhcmVudCAmJiBwYXJlbnQuc2hhZHlSb290ICYmIGhhc0luc2VydGlvblBvaW50KHBhcmVudC5zaGFkeVJvb3QpO1xufSxcbl9yZW1vdmVOb2RlRnJvbUhvc3Q6IGZ1bmN0aW9uIChub2RlLCBlbnN1cmVDb21wb3NlZFJlbW92YWwpIHtcbnZhciBob3N0TmVlZHNEaXN0O1xudmFyIHJvb3Q7XG52YXIgcGFyZW50ID0gbm9kZS5fbGlnaHRQYXJlbnQ7XG5pZiAocGFyZW50KSB7XG5yb290ID0gdGhpcy5fb3duZXJTaGFkeVJvb3RGb3JOb2RlKG5vZGUpO1xuaWYgKHJvb3QpIHtcbnJvb3QuaG9zdC5fZWxlbWVudFJlbW92ZShub2RlKTtcbmhvc3ROZWVkc0Rpc3QgPSB0aGlzLl9yZW1vdmVEaXN0cmlidXRlZENoaWxkcmVuKHJvb3QsIG5vZGUpO1xufVxudGhpcy5fcmVtb3ZlTG9naWNhbEluZm8obm9kZSwgbm9kZS5fbGlnaHRQYXJlbnQpO1xufVxudGhpcy5fcmVtb3ZlT3duZXJTaGFkeVJvb3Qobm9kZSk7XG5pZiAocm9vdCAmJiBob3N0TmVlZHNEaXN0KSB7XG50aGlzLl91cGRhdGVJbnNlcnRpb25Qb2ludHMocm9vdC5ob3N0KTtcbnRoaXMuX2xhenlEaXN0cmlidXRlKHJvb3QuaG9zdCk7XG59IGVsc2UgaWYgKGVuc3VyZUNvbXBvc2VkUmVtb3ZhbCkge1xucmVtb3ZlRnJvbUNvbXBvc2VkUGFyZW50KHBhcmVudCB8fCBub2RlLnBhcmVudE5vZGUsIG5vZGUpO1xufVxufSxcbl9yZW1vdmVEaXN0cmlidXRlZENoaWxkcmVuOiBmdW5jdGlvbiAocm9vdCwgY29udGFpbmVyKSB7XG52YXIgaG9zdE5lZWRzRGlzdDtcbnZhciBpcCQgPSByb290Ll9pbnNlcnRpb25Qb2ludHM7XG5mb3IgKHZhciBpID0gMDsgaSA8IGlwJC5sZW5ndGg7IGkrKykge1xudmFyIGNvbnRlbnQgPSBpcCRbaV07XG5pZiAodGhpcy5fY29udGFpbnMoY29udGFpbmVyLCBjb250ZW50KSkge1xudmFyIGRjJCA9IGZhY3RvcnkoY29udGVudCkuZ2V0RGlzdHJpYnV0ZWROb2RlcygpO1xuZm9yICh2YXIgaiA9IDA7IGogPCBkYyQubGVuZ3RoOyBqKyspIHtcbmhvc3ROZWVkc0Rpc3QgPSB0cnVlO1xudmFyIG5vZGUgPSBkYyRbal07XG52YXIgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuaWYgKHBhcmVudCkge1xucmVtb3ZlRnJvbUNvbXBvc2VkUGFyZW50KHBhcmVudCwgbm9kZSk7XG5uYXRpdmVSZW1vdmVDaGlsZC5jYWxsKHBhcmVudCwgbm9kZSk7XG59XG59XG59XG59XG5yZXR1cm4gaG9zdE5lZWRzRGlzdDtcbn0sXG5fY29udGFpbnM6IGZ1bmN0aW9uIChjb250YWluZXIsIG5vZGUpIHtcbndoaWxlIChub2RlKSB7XG5pZiAobm9kZSA9PSBjb250YWluZXIpIHtcbnJldHVybiB0cnVlO1xufVxubm9kZSA9IGZhY3Rvcnkobm9kZSkucGFyZW50Tm9kZTtcbn1cbn0sXG5fYWRkTm9kZVRvSG9zdDogZnVuY3Rpb24gKG5vZGUpIHtcbnZhciBjaGVja05vZGUgPSBub2RlLm5vZGVUeXBlID09PSBOb2RlLkRPQ1VNRU5UX0ZSQUdNRU5UX05PREUgPyBub2RlLmZpcnN0Q2hpbGQgOiBub2RlO1xudmFyIHJvb3QgPSB0aGlzLl9vd25lclNoYWR5Um9vdEZvck5vZGUoY2hlY2tOb2RlKTtcbmlmIChyb290KSB7XG5yb290Lmhvc3QuX2VsZW1lbnRBZGQobm9kZSk7XG59XG59LFxuX2FkZExvZ2ljYWxJbmZvOiBmdW5jdGlvbiAobm9kZSwgY29udGFpbmVyLCBpbmRleCkge1xuc2F2ZUxpZ2h0Q2hpbGRyZW5JZk5lZWRlZChjb250YWluZXIpO1xudmFyIGNoaWxkcmVuID0gZmFjdG9yeShjb250YWluZXIpLmNoaWxkTm9kZXM7XG5pbmRleCA9IGluZGV4ID09PSB1bmRlZmluZWQgPyBjaGlsZHJlbi5sZW5ndGggOiBpbmRleDtcbmlmIChub2RlLm5vZGVUeXBlID09PSBOb2RlLkRPQ1VNRU5UX0ZSQUdNRU5UX05PREUpIHtcbnZhciBjJCA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG5vZGUuY2hpbGROb2Rlcyk7XG5mb3IgKHZhciBpID0gMCwgbjsgaSA8IGMkLmxlbmd0aCAmJiAobiA9IGMkW2ldKTsgaSsrKSB7XG5jaGlsZHJlbi5zcGxpY2UoaW5kZXgrKywgMCwgbik7XG5uLl9saWdodFBhcmVudCA9IGNvbnRhaW5lcjtcbn1cbn0gZWxzZSB7XG5jaGlsZHJlbi5zcGxpY2UoaW5kZXgsIDAsIG5vZGUpO1xubm9kZS5fbGlnaHRQYXJlbnQgPSBjb250YWluZXI7XG59XG59LFxuX3JlbW92ZUxvZ2ljYWxJbmZvOiBmdW5jdGlvbiAobm9kZSwgY29udGFpbmVyKSB7XG52YXIgY2hpbGRyZW4gPSBmYWN0b3J5KGNvbnRhaW5lcikuY2hpbGROb2RlcztcbnZhciBpbmRleCA9IGNoaWxkcmVuLmluZGV4T2Yobm9kZSk7XG5pZiAoaW5kZXggPCAwIHx8IGNvbnRhaW5lciAhPT0gbm9kZS5fbGlnaHRQYXJlbnQpIHtcbnRocm93IEVycm9yKCdUaGUgbm9kZSB0byBiZSByZW1vdmVkIGlzIG5vdCBhIGNoaWxkIG9mIHRoaXMgbm9kZScpO1xufVxuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAxKTtcbm5vZGUuX2xpZ2h0UGFyZW50ID0gbnVsbDtcbn0sXG5fcmVtb3ZlT3duZXJTaGFkeVJvb3Q6IGZ1bmN0aW9uIChub2RlKSB7XG52YXIgaGFzQ2FjaGVkUm9vdCA9IGZhY3Rvcnkobm9kZSkuZ2V0T3duZXJSb290KCkgIT09IHVuZGVmaW5lZDtcbmlmIChoYXNDYWNoZWRSb290KSB7XG52YXIgYyQgPSBmYWN0b3J5KG5vZGUpLmNoaWxkTm9kZXM7XG5mb3IgKHZhciBpID0gMCwgbCA9IGMkLmxlbmd0aCwgbjsgaSA8IGwgJiYgKG4gPSBjJFtpXSk7IGkrKykge1xudGhpcy5fcmVtb3ZlT3duZXJTaGFkeVJvb3Qobik7XG59XG59XG5ub2RlLl9vd25lclNoYWR5Um9vdCA9IHVuZGVmaW5lZDtcbn0sXG5fZmlyc3RDb21wb3NlZE5vZGU6IGZ1bmN0aW9uIChjb250ZW50KSB7XG52YXIgbiQgPSBmYWN0b3J5KGNvbnRlbnQpLmdldERpc3RyaWJ1dGVkTm9kZXMoKTtcbmZvciAodmFyIGkgPSAwLCBsID0gbiQubGVuZ3RoLCBuLCBwJDsgaSA8IGwgJiYgKG4gPSBuJFtpXSk7IGkrKykge1xucCQgPSBmYWN0b3J5KG4pLmdldERlc3RpbmF0aW9uSW5zZXJ0aW9uUG9pbnRzKCk7XG5pZiAocCRbcCQubGVuZ3RoIC0gMV0gPT09IGNvbnRlbnQpIHtcbnJldHVybiBuO1xufVxufVxufSxcbnF1ZXJ5U2VsZWN0b3I6IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xucmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilbMF07XG59LFxucXVlcnlTZWxlY3RvckFsbDogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG5yZXR1cm4gdGhpcy5fcXVlcnkoZnVuY3Rpb24gKG4pIHtcbnJldHVybiBtYXRjaGVzU2VsZWN0b3IuY2FsbChuLCBzZWxlY3Rvcik7XG59LCB0aGlzLm5vZGUpO1xufSxcbl9xdWVyeTogZnVuY3Rpb24gKG1hdGNoZXIsIG5vZGUpIHtcbm5vZGUgPSBub2RlIHx8IHRoaXMubm9kZTtcbnZhciBsaXN0ID0gW107XG50aGlzLl9xdWVyeUVsZW1lbnRzKGZhY3Rvcnkobm9kZSkuY2hpbGROb2RlcywgbWF0Y2hlciwgbGlzdCk7XG5yZXR1cm4gbGlzdDtcbn0sXG5fcXVlcnlFbGVtZW50czogZnVuY3Rpb24gKGVsZW1lbnRzLCBtYXRjaGVyLCBsaXN0KSB7XG5mb3IgKHZhciBpID0gMCwgbCA9IGVsZW1lbnRzLmxlbmd0aCwgYzsgaSA8IGwgJiYgKGMgPSBlbGVtZW50c1tpXSk7IGkrKykge1xuaWYgKGMubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFKSB7XG50aGlzLl9xdWVyeUVsZW1lbnQoYywgbWF0Y2hlciwgbGlzdCk7XG59XG59XG59LFxuX3F1ZXJ5RWxlbWVudDogZnVuY3Rpb24gKG5vZGUsIG1hdGNoZXIsIGxpc3QpIHtcbmlmIChtYXRjaGVyKG5vZGUpKSB7XG5saXN0LnB1c2gobm9kZSk7XG59XG50aGlzLl9xdWVyeUVsZW1lbnRzKGZhY3Rvcnkobm9kZSkuY2hpbGROb2RlcywgbWF0Y2hlciwgbGlzdCk7XG59LFxuZ2V0RGVzdGluYXRpb25JbnNlcnRpb25Qb2ludHM6IGZ1bmN0aW9uICgpIHtcbnJldHVybiB0aGlzLm5vZGUuX2Rlc3RpbmF0aW9uSW5zZXJ0aW9uUG9pbnRzIHx8IFtdO1xufSxcbmdldERpc3RyaWJ1dGVkTm9kZXM6IGZ1bmN0aW9uICgpIHtcbnJldHVybiB0aGlzLm5vZGUuX2Rpc3RyaWJ1dGVkTm9kZXMgfHwgW107XG59LFxucXVlcnlEaXN0cmlidXRlZEVsZW1lbnRzOiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbnZhciBjJCA9IHRoaXMuY2hpbGROb2RlcztcbnZhciBsaXN0ID0gW107XG50aGlzLl9kaXN0cmlidXRlZEZpbHRlcihzZWxlY3RvciwgYyQsIGxpc3QpO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBjJC5sZW5ndGgsIGM7IGkgPCBsICYmIChjID0gYyRbaV0pOyBpKyspIHtcbmlmIChjLmxvY2FsTmFtZSA9PT0gQ09OVEVOVCkge1xudGhpcy5fZGlzdHJpYnV0ZWRGaWx0ZXIoc2VsZWN0b3IsIGZhY3RvcnkoYykuZ2V0RGlzdHJpYnV0ZWROb2RlcygpLCBsaXN0KTtcbn1cbn1cbnJldHVybiBsaXN0O1xufSxcbl9kaXN0cmlidXRlZEZpbHRlcjogZnVuY3Rpb24gKHNlbGVjdG9yLCBsaXN0LCByZXN1bHRzKSB7XG5yZXN1bHRzID0gcmVzdWx0cyB8fCBbXTtcbmZvciAodmFyIGkgPSAwLCBsID0gbGlzdC5sZW5ndGgsIGQ7IGkgPCBsICYmIChkID0gbGlzdFtpXSk7IGkrKykge1xuaWYgKGQubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFICYmIGQubG9jYWxOYW1lICE9PSBDT05URU5UICYmIG1hdGNoZXNTZWxlY3Rvci5jYWxsKGQsIHNlbGVjdG9yKSkge1xucmVzdWx0cy5wdXNoKGQpO1xufVxufVxucmV0dXJuIHJlc3VsdHM7XG59LFxuX2NsZWFyOiBmdW5jdGlvbiAoKSB7XG53aGlsZSAodGhpcy5jaGlsZE5vZGVzLmxlbmd0aCkge1xudGhpcy5yZW1vdmVDaGlsZCh0aGlzLmNoaWxkTm9kZXNbMF0pO1xufVxufSxcbnNldEF0dHJpYnV0ZTogZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG50aGlzLm5vZGUuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbnRoaXMuX2Rpc3RyaWJ1dGVQYXJlbnQoKTtcbn0sXG5yZW1vdmVBdHRyaWJ1dGU6IGZ1bmN0aW9uIChuYW1lKSB7XG50aGlzLm5vZGUucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xudGhpcy5fZGlzdHJpYnV0ZVBhcmVudCgpO1xufSxcbl9kaXN0cmlidXRlUGFyZW50OiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5fcGFyZW50TmVlZHNEaXN0cmlidXRpb24odGhpcy5wYXJlbnROb2RlKSkge1xudGhpcy5fbGF6eURpc3RyaWJ1dGUodGhpcy5wYXJlbnROb2RlKTtcbn1cbn0sXG5jbG9uZU5vZGU6IGZ1bmN0aW9uIChkZWVwKSB7XG52YXIgbiA9IG5hdGl2ZUNsb25lTm9kZS5jYWxsKHRoaXMubm9kZSwgZmFsc2UpO1xuaWYgKGRlZXApIHtcbnZhciBjJCA9IHRoaXMuY2hpbGROb2RlcztcbnZhciBkID0gZmFjdG9yeShuKTtcbmZvciAodmFyIGkgPSAwLCBuYzsgaSA8IGMkLmxlbmd0aDsgaSsrKSB7XG5uYyA9IGZhY3RvcnkoYyRbaV0pLmNsb25lTm9kZSh0cnVlKTtcbmQuYXBwZW5kQ2hpbGQobmMpO1xufVxufVxucmV0dXJuIG47XG59LFxuaW1wb3J0Tm9kZTogZnVuY3Rpb24gKGV4dGVybmFsTm9kZSwgZGVlcCkge1xudmFyIGRvYyA9IHRoaXMubm9kZSBpbnN0YW5jZW9mIEhUTUxEb2N1bWVudCA/IHRoaXMubm9kZSA6IHRoaXMubm9kZS5vd25lckRvY3VtZW50O1xudmFyIG4gPSBuYXRpdmVJbXBvcnROb2RlLmNhbGwoZG9jLCBleHRlcm5hbE5vZGUsIGZhbHNlKTtcbmlmIChkZWVwKSB7XG52YXIgYyQgPSBmYWN0b3J5KGV4dGVybmFsTm9kZSkuY2hpbGROb2RlcztcbnZhciBkID0gZmFjdG9yeShuKTtcbmZvciAodmFyIGkgPSAwLCBuYzsgaSA8IGMkLmxlbmd0aDsgaSsrKSB7XG5uYyA9IGZhY3RvcnkoZG9jKS5pbXBvcnROb2RlKGMkW2ldLCB0cnVlKTtcbmQuYXBwZW5kQ2hpbGQobmMpO1xufVxufVxucmV0dXJuIG47XG59XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KERvbUFwaS5wcm90b3R5cGUsICdjbGFzc0xpc3QnLCB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbmlmICghdGhpcy5fY2xhc3NMaXN0KSB7XG50aGlzLl9jbGFzc0xpc3QgPSBuZXcgRG9tQXBpLkNsYXNzTGlzdCh0aGlzKTtcbn1cbnJldHVybiB0aGlzLl9jbGFzc0xpc3Q7XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59KTtcbkRvbUFwaS5DbGFzc0xpc3QgPSBmdW5jdGlvbiAoaG9zdCkge1xudGhpcy5kb21BcGkgPSBob3N0O1xudGhpcy5ub2RlID0gaG9zdC5ub2RlO1xufTtcbkRvbUFwaS5DbGFzc0xpc3QucHJvdG90eXBlID0ge1xuYWRkOiBmdW5jdGlvbiAoKSB7XG50aGlzLm5vZGUuY2xhc3NMaXN0LmFkZC5hcHBseSh0aGlzLm5vZGUuY2xhc3NMaXN0LCBhcmd1bWVudHMpO1xudGhpcy5kb21BcGkuX2Rpc3RyaWJ1dGVQYXJlbnQoKTtcbn0sXG5yZW1vdmU6IGZ1bmN0aW9uICgpIHtcbnRoaXMubm9kZS5jbGFzc0xpc3QucmVtb3ZlLmFwcGx5KHRoaXMubm9kZS5jbGFzc0xpc3QsIGFyZ3VtZW50cyk7XG50aGlzLmRvbUFwaS5fZGlzdHJpYnV0ZVBhcmVudCgpO1xufSxcbnRvZ2dsZTogZnVuY3Rpb24gKCkge1xudGhpcy5ub2RlLmNsYXNzTGlzdC50b2dnbGUuYXBwbHkodGhpcy5ub2RlLmNsYXNzTGlzdCwgYXJndW1lbnRzKTtcbnRoaXMuZG9tQXBpLl9kaXN0cmlidXRlUGFyZW50KCk7XG59LFxuY29udGFpbnM6IGZ1bmN0aW9uICgpIHtcbnJldHVybiB0aGlzLm5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zLmFwcGx5KHRoaXMubm9kZS5jbGFzc0xpc3QsIGFyZ3VtZW50cyk7XG59XG59O1xuaWYgKCFTZXR0aW5ncy51c2VTaGFkb3cpIHtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKERvbUFwaS5wcm90b3R5cGUsIHtcbmNoaWxkTm9kZXM6IHtcbmdldDogZnVuY3Rpb24gKCkge1xudmFyIGMkID0gZ2V0TGlnaHRDaGlsZHJlbih0aGlzLm5vZGUpO1xucmV0dXJuIEFycmF5LmlzQXJyYXkoYyQpID8gYyQgOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjJCk7XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59LFxuY2hpbGRyZW46IHtcbmdldDogZnVuY3Rpb24gKCkge1xucmV0dXJuIEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbCh0aGlzLmNoaWxkTm9kZXMsIGZ1bmN0aW9uIChuKSB7XG5yZXR1cm4gbi5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREU7XG59KTtcbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn0sXG5wYXJlbnROb2RlOiB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnJldHVybiB0aGlzLm5vZGUuX2xpZ2h0UGFyZW50IHx8ICh0aGlzLm5vZGUuX19wYXRjaGVkID8gdGhpcy5ub2RlLl9jb21wb3NlZFBhcmVudCA6IHRoaXMubm9kZS5wYXJlbnROb2RlKTtcbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn0sXG5maXJzdENoaWxkOiB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnJldHVybiB0aGlzLmNoaWxkTm9kZXNbMF07XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59LFxubGFzdENoaWxkOiB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnZhciBjJCA9IHRoaXMuY2hpbGROb2RlcztcbnJldHVybiBjJFtjJC5sZW5ndGggLSAxXTtcbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn0sXG5uZXh0U2libGluZzoge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG52YXIgYyQgPSB0aGlzLnBhcmVudE5vZGUgJiYgZmFjdG9yeSh0aGlzLnBhcmVudE5vZGUpLmNoaWxkTm9kZXM7XG5pZiAoYyQpIHtcbnJldHVybiBjJFtBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGMkLCB0aGlzLm5vZGUpICsgMV07XG59XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59LFxucHJldmlvdXNTaWJsaW5nOiB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnZhciBjJCA9IHRoaXMucGFyZW50Tm9kZSAmJiBmYWN0b3J5KHRoaXMucGFyZW50Tm9kZSkuY2hpbGROb2RlcztcbmlmIChjJCkge1xucmV0dXJuIGMkW0FycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYyQsIHRoaXMubm9kZSkgLSAxXTtcbn1cbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn0sXG5maXJzdEVsZW1lbnRDaGlsZDoge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gdGhpcy5jaGlsZHJlblswXTtcbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn0sXG5sYXN0RWxlbWVudENoaWxkOiB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnZhciBjJCA9IHRoaXMuY2hpbGRyZW47XG5yZXR1cm4gYyRbYyQubGVuZ3RoIC0gMV07XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59LFxubmV4dEVsZW1lbnRTaWJsaW5nOiB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnZhciBjJCA9IHRoaXMucGFyZW50Tm9kZSAmJiBmYWN0b3J5KHRoaXMucGFyZW50Tm9kZSkuY2hpbGRyZW47XG5pZiAoYyQpIHtcbnJldHVybiBjJFtBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGMkLCB0aGlzLm5vZGUpICsgMV07XG59XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59LFxucHJldmlvdXNFbGVtZW50U2libGluZzoge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG52YXIgYyQgPSB0aGlzLnBhcmVudE5vZGUgJiYgZmFjdG9yeSh0aGlzLnBhcmVudE5vZGUpLmNoaWxkcmVuO1xuaWYgKGMkKSB7XG5yZXR1cm4gYyRbQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChjJCwgdGhpcy5ub2RlKSAtIDFdO1xufVxufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSxcbnRleHRDb250ZW50OiB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLm5vZGUubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFKSB7XG5yZXR1cm4gdGhpcy5ub2RlLnRleHRDb250ZW50O1xufSBlbHNlIHtcbnJldHVybiBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwodGhpcy5jaGlsZE5vZGVzLCBmdW5jdGlvbiAoYykge1xucmV0dXJuIGMudGV4dENvbnRlbnQ7XG59KS5qb2luKCcnKTtcbn1cbn0sXG5zZXQ6IGZ1bmN0aW9uICh0ZXh0KSB7XG50aGlzLl9jbGVhcigpO1xuaWYgKHRleHQpIHtcbnRoaXMuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCkpO1xufVxufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSxcbmlubmVySFRNTDoge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5ub2RlLm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERSkge1xucmV0dXJuIG51bGw7XG59IGVsc2Uge1xucmV0dXJuIGdldElubmVySFRNTCh0aGlzLm5vZGUpO1xufVxufSxcbnNldDogZnVuY3Rpb24gKHRleHQpIHtcbmlmICh0aGlzLm5vZGUubm9kZVR5cGUgIT09IE5vZGUuVEVYVF9OT0RFKSB7XG50aGlzLl9jbGVhcigpO1xudmFyIGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbmQuaW5uZXJIVE1MID0gdGV4dDtcbnZhciBjJCA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGQuY2hpbGROb2Rlcyk7XG5mb3IgKHZhciBpID0gMDsgaSA8IGMkLmxlbmd0aDsgaSsrKSB7XG50aGlzLmFwcGVuZENoaWxkKGMkW2ldKTtcbn1cbn1cbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn1cbn0pO1xuRG9tQXBpLnByb3RvdHlwZS5fZ2V0Q29tcG9zZWRJbm5lckhUTUwgPSBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gZ2V0SW5uZXJIVE1MKHRoaXMubm9kZSwgdHJ1ZSk7XG59O1xufSBlbHNlIHtcbkRvbUFwaS5wcm90b3R5cGUucXVlcnlTZWxlY3RvckFsbCA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xucmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMubm9kZS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSk7XG59O1xuRG9tQXBpLnByb3RvdHlwZS5nZXRPd25lclJvb3QgPSBmdW5jdGlvbiAoKSB7XG52YXIgbiA9IHRoaXMubm9kZTtcbndoaWxlIChuKSB7XG5pZiAobi5ub2RlVHlwZSA9PT0gTm9kZS5ET0NVTUVOVF9GUkFHTUVOVF9OT0RFICYmIG4uaG9zdCkge1xucmV0dXJuIG47XG59XG5uID0gbi5wYXJlbnROb2RlO1xufVxufTtcbkRvbUFwaS5wcm90b3R5cGUuY2xvbmVOb2RlID0gZnVuY3Rpb24gKGRlZXApIHtcbnJldHVybiB0aGlzLm5vZGUuY2xvbmVOb2RlKGRlZXApO1xufTtcbkRvbUFwaS5wcm90b3R5cGUuaW1wb3J0Tm9kZSA9IGZ1bmN0aW9uIChleHRlcm5hbE5vZGUsIGRlZXApIHtcbnZhciBkb2MgPSB0aGlzLm5vZGUgaW5zdGFuY2VvZiBIVE1MRG9jdW1lbnQgPyB0aGlzLm5vZGUgOiB0aGlzLm5vZGUub3duZXJEb2N1bWVudDtcbnJldHVybiBkb2MuaW1wb3J0Tm9kZShleHRlcm5hbE5vZGUsIGRlZXApO1xufTtcbkRvbUFwaS5wcm90b3R5cGUuZ2V0RGVzdGluYXRpb25JbnNlcnRpb25Qb2ludHMgPSBmdW5jdGlvbiAoKSB7XG52YXIgbiQgPSB0aGlzLm5vZGUuZ2V0RGVzdGluYXRpb25JbnNlcnRpb25Qb2ludHMoKTtcbnJldHVybiBuJCA/IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG4kKSA6IFtdO1xufTtcbkRvbUFwaS5wcm90b3R5cGUuZ2V0RGlzdHJpYnV0ZWROb2RlcyA9IGZ1bmN0aW9uICgpIHtcbnZhciBuJCA9IHRoaXMubm9kZS5nZXREaXN0cmlidXRlZE5vZGVzKCk7XG5yZXR1cm4gbiQgPyBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChuJCkgOiBbXTtcbn07XG5Eb21BcGkucHJvdG90eXBlLl9kaXN0cmlidXRlUGFyZW50ID0gZnVuY3Rpb24gKCkge1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKERvbUFwaS5wcm90b3R5cGUsIHtcbmNoaWxkTm9kZXM6IHtcbmdldDogZnVuY3Rpb24gKCkge1xucmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMubm9kZS5jaGlsZE5vZGVzKTtcbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn0sXG5jaGlsZHJlbjoge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5ub2RlLmNoaWxkcmVuKTtcbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn0sXG50ZXh0Q29udGVudDoge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gdGhpcy5ub2RlLnRleHRDb250ZW50O1xufSxcbnNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG5yZXR1cm4gdGhpcy5ub2RlLnRleHRDb250ZW50ID0gdmFsdWU7XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59LFxuaW5uZXJIVE1MOiB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnJldHVybiB0aGlzLm5vZGUuaW5uZXJIVE1MO1xufSxcbnNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG5yZXR1cm4gdGhpcy5ub2RlLmlubmVySFRNTCA9IHZhbHVlO1xufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufVxufSk7XG52YXIgZm9yd2FyZHMgPSBbXG4ncGFyZW50Tm9kZScsXG4nZmlyc3RDaGlsZCcsXG4nbGFzdENoaWxkJyxcbiduZXh0U2libGluZycsXG4ncHJldmlvdXNTaWJsaW5nJyxcbidmaXJzdEVsZW1lbnRDaGlsZCcsXG4nbGFzdEVsZW1lbnRDaGlsZCcsXG4nbmV4dEVsZW1lbnRTaWJsaW5nJyxcbidwcmV2aW91c0VsZW1lbnRTaWJsaW5nJ1xuXTtcbmZvcndhcmRzLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShEb21BcGkucHJvdG90eXBlLCBuYW1lLCB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnJldHVybiB0aGlzLm5vZGVbbmFtZV07XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59KTtcbn0pO1xufVxudmFyIENPTlRFTlQgPSAnY29udGVudCc7XG52YXIgZmFjdG9yeSA9IGZ1bmN0aW9uIChub2RlLCBwYXRjaCkge1xubm9kZSA9IG5vZGUgfHwgZG9jdW1lbnQ7XG5pZiAoIW5vZGUuX19kb21BcGkpIHtcbm5vZGUuX19kb21BcGkgPSBuZXcgRG9tQXBpKG5vZGUsIHBhdGNoKTtcbn1cbnJldHVybiBub2RlLl9fZG9tQXBpO1xufTtcblBvbHltZXIuZG9tID0gZnVuY3Rpb24gKG9iaiwgcGF0Y2gpIHtcbmlmIChvYmogaW5zdGFuY2VvZiBFdmVudCkge1xucmV0dXJuIFBvbHltZXIuRXZlbnRBcGkuZmFjdG9yeShvYmopO1xufSBlbHNlIHtcbnJldHVybiBmYWN0b3J5KG9iaiwgcGF0Y2gpO1xufVxufTtcblBvbHltZXIuZG9tLmZsdXNoID0gRG9tQXBpLnByb3RvdHlwZS5mbHVzaDtcbmZ1bmN0aW9uIGdldExpZ2h0Q2hpbGRyZW4obm9kZSkge1xudmFyIGNoaWxkcmVuID0gbm9kZS5fbGlnaHRDaGlsZHJlbjtcbnJldHVybiBjaGlsZHJlbiA/IGNoaWxkcmVuIDogbm9kZS5jaGlsZE5vZGVzO1xufVxuZnVuY3Rpb24gZ2V0Q29tcG9zZWRDaGlsZHJlbihub2RlKSB7XG5pZiAoIW5vZGUuX2NvbXBvc2VkQ2hpbGRyZW4pIHtcbm5vZGUuX2NvbXBvc2VkQ2hpbGRyZW4gPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChub2RlLmNoaWxkTm9kZXMpO1xufVxucmV0dXJuIG5vZGUuX2NvbXBvc2VkQ2hpbGRyZW47XG59XG5mdW5jdGlvbiBhZGRUb0NvbXBvc2VkUGFyZW50KHBhcmVudCwgbm9kZSwgcmVmX25vZGUpIHtcbnZhciBjaGlsZHJlbiA9IGdldENvbXBvc2VkQ2hpbGRyZW4ocGFyZW50KTtcbnZhciBpID0gcmVmX25vZGUgPyBjaGlsZHJlbi5pbmRleE9mKHJlZl9ub2RlKSA6IC0xO1xuaWYgKG5vZGUubm9kZVR5cGUgPT09IE5vZGUuRE9DVU1FTlRfRlJBR01FTlRfTk9ERSkge1xudmFyIGZyYWdDaGlsZHJlbiA9IGdldENvbXBvc2VkQ2hpbGRyZW4obm9kZSk7XG5mb3IgKHZhciBqID0gMDsgaiA8IGZyYWdDaGlsZHJlbi5sZW5ndGg7IGorKykge1xuYWRkTm9kZVRvQ29tcG9zZWRDaGlsZHJlbihmcmFnQ2hpbGRyZW5bal0sIHBhcmVudCwgY2hpbGRyZW4sIGkgKyBqKTtcbn1cbm5vZGUuX2NvbXBvc2VkQ2hpbGRyZW4gPSBudWxsO1xufSBlbHNlIHtcbmFkZE5vZGVUb0NvbXBvc2VkQ2hpbGRyZW4obm9kZSwgcGFyZW50LCBjaGlsZHJlbiwgaSk7XG59XG59XG5mdW5jdGlvbiBhZGROb2RlVG9Db21wb3NlZENoaWxkcmVuKG5vZGUsIHBhcmVudCwgY2hpbGRyZW4sIGkpIHtcbm5vZGUuX2NvbXBvc2VkUGFyZW50ID0gcGFyZW50O1xuY2hpbGRyZW4uc3BsaWNlKGkgPj0gMCA/IGkgOiBjaGlsZHJlbi5sZW5ndGgsIDAsIG5vZGUpO1xufVxuZnVuY3Rpb24gcmVtb3ZlRnJvbUNvbXBvc2VkUGFyZW50KHBhcmVudCwgbm9kZSkge1xubm9kZS5fY29tcG9zZWRQYXJlbnQgPSBudWxsO1xuaWYgKHBhcmVudCkge1xudmFyIGNoaWxkcmVuID0gZ2V0Q29tcG9zZWRDaGlsZHJlbihwYXJlbnQpO1xudmFyIGkgPSBjaGlsZHJlbi5pbmRleE9mKG5vZGUpO1xuaWYgKGkgPj0gMCkge1xuY2hpbGRyZW4uc3BsaWNlKGksIDEpO1xufVxufVxufVxuZnVuY3Rpb24gc2F2ZUxpZ2h0Q2hpbGRyZW5JZk5lZWRlZChub2RlKSB7XG5pZiAoIW5vZGUuX2xpZ2h0Q2hpbGRyZW4pIHtcbnZhciBjJCA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG5vZGUuY2hpbGROb2Rlcyk7XG5mb3IgKHZhciBpID0gMCwgbCA9IGMkLmxlbmd0aCwgY2hpbGQ7IGkgPCBsICYmIChjaGlsZCA9IGMkW2ldKTsgaSsrKSB7XG5jaGlsZC5fbGlnaHRQYXJlbnQgPSBjaGlsZC5fbGlnaHRQYXJlbnQgfHwgbm9kZTtcbn1cbm5vZGUuX2xpZ2h0Q2hpbGRyZW4gPSBjJDtcbn1cbn1cbmZ1bmN0aW9uIGhhc0luc2VydGlvblBvaW50KHJvb3QpIHtcbnJldHVybiBCb29sZWFuKHJvb3QuX2luc2VydGlvblBvaW50cy5sZW5ndGgpO1xufVxudmFyIHAgPSBFbGVtZW50LnByb3RvdHlwZTtcbnZhciBtYXRjaGVzU2VsZWN0b3IgPSBwLm1hdGNoZXMgfHwgcC5tYXRjaGVzU2VsZWN0b3IgfHwgcC5tb3pNYXRjaGVzU2VsZWN0b3IgfHwgcC5tc01hdGNoZXNTZWxlY3RvciB8fCBwLm9NYXRjaGVzU2VsZWN0b3IgfHwgcC53ZWJraXRNYXRjaGVzU2VsZWN0b3I7XG5yZXR1cm4ge1xuZ2V0TGlnaHRDaGlsZHJlbjogZ2V0TGlnaHRDaGlsZHJlbixcbmdldENvbXBvc2VkQ2hpbGRyZW46IGdldENvbXBvc2VkQ2hpbGRyZW4sXG5yZW1vdmVGcm9tQ29tcG9zZWRQYXJlbnQ6IHJlbW92ZUZyb21Db21wb3NlZFBhcmVudCxcbnNhdmVMaWdodENoaWxkcmVuSWZOZWVkZWQ6IHNhdmVMaWdodENoaWxkcmVuSWZOZWVkZWQsXG5tYXRjaGVzU2VsZWN0b3I6IG1hdGNoZXNTZWxlY3Rvcixcbmhhc0luc2VydGlvblBvaW50OiBoYXNJbnNlcnRpb25Qb2ludCxcbmN0b3I6IERvbUFwaSxcbmZhY3Rvcnk6IGZhY3Rvcnlcbn07XG59KCk7XG4oZnVuY3Rpb24gKCkge1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9wcmVwU2hhZHk6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3VzZUNvbnRlbnQgPSB0aGlzLl91c2VDb250ZW50IHx8IEJvb2xlYW4odGhpcy5fdGVtcGxhdGUpO1xufSxcbl9wb29sQ29udGVudDogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuX3VzZUNvbnRlbnQpIHtcbnNhdmVMaWdodENoaWxkcmVuSWZOZWVkZWQodGhpcyk7XG59XG59LFxuX3NldHVwUm9vdDogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuX3VzZUNvbnRlbnQpIHtcbnRoaXMuX2NyZWF0ZUxvY2FsUm9vdCgpO1xuaWYgKCF0aGlzLmRhdGFIb3N0KSB7XG51cGdyYWRlTGlnaHRDaGlsZHJlbih0aGlzLl9saWdodENoaWxkcmVuKTtcbn1cbn1cbn0sXG5fY3JlYXRlTG9jYWxSb290OiBmdW5jdGlvbiAoKSB7XG50aGlzLnNoYWR5Um9vdCA9IHRoaXMucm9vdDtcbnRoaXMuc2hhZHlSb290Ll9kaXN0cmlidXRpb25DbGVhbiA9IGZhbHNlO1xudGhpcy5zaGFkeVJvb3QuX2lzU2hhZHlSb290ID0gdHJ1ZTtcbnRoaXMuc2hhZHlSb290Ll9kaXJ0eVJvb3RzID0gW107XG50aGlzLnNoYWR5Um9vdC5faW5zZXJ0aW9uUG9pbnRzID0gIXRoaXMuX25vdGVzIHx8IHRoaXMuX25vdGVzLl9oYXNDb250ZW50ID8gdGhpcy5zaGFkeVJvb3QucXVlcnlTZWxlY3RvckFsbCgnY29udGVudCcpIDogW107XG5zYXZlTGlnaHRDaGlsZHJlbklmTmVlZGVkKHRoaXMuc2hhZHlSb290KTtcbnRoaXMuc2hhZHlSb290Lmhvc3QgPSB0aGlzO1xufSxcbmdldCBkb21Ib3N0KCkge1xudmFyIHJvb3QgPSBQb2x5bWVyLmRvbSh0aGlzKS5nZXRPd25lclJvb3QoKTtcbnJldHVybiByb290ICYmIHJvb3QuaG9zdDtcbn0sXG5kaXN0cmlidXRlQ29udGVudDogZnVuY3Rpb24gKHVwZGF0ZUluc2VydGlvblBvaW50cykge1xuaWYgKHRoaXMuc2hhZHlSb290KSB7XG52YXIgZG9tID0gUG9seW1lci5kb20odGhpcyk7XG5pZiAodXBkYXRlSW5zZXJ0aW9uUG9pbnRzKSB7XG5kb20uX3VwZGF0ZUluc2VydGlvblBvaW50cyh0aGlzKTtcbn1cbnZhciBob3N0ID0gZ2V0VG9wRGlzdHJpYnV0aW5nSG9zdCh0aGlzKTtcbmRvbS5fbGF6eURpc3RyaWJ1dGUoaG9zdCk7XG59XG59LFxuX2Rpc3RyaWJ1dGVDb250ZW50OiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5fdXNlQ29udGVudCAmJiAhdGhpcy5zaGFkeVJvb3QuX2Rpc3RyaWJ1dGlvbkNsZWFuKSB7XG50aGlzLl9iZWdpbkRpc3RyaWJ1dGUoKTtcbnRoaXMuX2Rpc3RyaWJ1dGVEaXJ0eVJvb3RzKCk7XG50aGlzLl9maW5pc2hEaXN0cmlidXRlKCk7XG59XG59LFxuX2JlZ2luRGlzdHJpYnV0ZTogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuX3VzZUNvbnRlbnQgJiYgaGFzSW5zZXJ0aW9uUG9pbnQodGhpcy5zaGFkeVJvb3QpKSB7XG50aGlzLl9yZXNldERpc3RyaWJ1dGlvbigpO1xudGhpcy5fZGlzdHJpYnV0ZVBvb2wodGhpcy5zaGFkeVJvb3QsIHRoaXMuX2NvbGxlY3RQb29sKCkpO1xufVxufSxcbl9kaXN0cmlidXRlRGlydHlSb290czogZnVuY3Rpb24gKCkge1xudmFyIGMkID0gdGhpcy5zaGFkeVJvb3QuX2RpcnR5Um9vdHM7XG5mb3IgKHZhciBpID0gMCwgbCA9IGMkLmxlbmd0aCwgYzsgaSA8IGwgJiYgKGMgPSBjJFtpXSk7IGkrKykge1xuYy5fZGlzdHJpYnV0ZUNvbnRlbnQoKTtcbn1cbnRoaXMuc2hhZHlSb290Ll9kaXJ0eVJvb3RzID0gW107XG59LFxuX2ZpbmlzaERpc3RyaWJ1dGU6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLl91c2VDb250ZW50KSB7XG5pZiAoaGFzSW5zZXJ0aW9uUG9pbnQodGhpcy5zaGFkeVJvb3QpKSB7XG50aGlzLl9jb21wb3NlVHJlZSgpO1xufSBlbHNlIHtcbmlmICghdGhpcy5zaGFkeVJvb3QuX2hhc0Rpc3RyaWJ1dGVkKSB7XG50aGlzLnRleHRDb250ZW50ID0gJyc7XG50aGlzLl9jb21wb3NlZENoaWxkcmVuID0gbnVsbDtcbnRoaXMuYXBwZW5kQ2hpbGQodGhpcy5zaGFkeVJvb3QpO1xufSBlbHNlIHtcbnZhciBjaGlsZHJlbiA9IHRoaXMuX2NvbXBvc2VOb2RlKHRoaXMpO1xudGhpcy5fdXBkYXRlQ2hpbGROb2Rlcyh0aGlzLCBjaGlsZHJlbik7XG59XG59XG50aGlzLnNoYWR5Um9vdC5faGFzRGlzdHJpYnV0ZWQgPSB0cnVlO1xudGhpcy5zaGFkeVJvb3QuX2Rpc3RyaWJ1dGlvbkNsZWFuID0gdHJ1ZTtcbn1cbn0sXG5lbGVtZW50TWF0Y2hlczogZnVuY3Rpb24gKHNlbGVjdG9yLCBub2RlKSB7XG5ub2RlID0gbm9kZSB8fCB0aGlzO1xucmV0dXJuIG1hdGNoZXNTZWxlY3Rvci5jYWxsKG5vZGUsIHNlbGVjdG9yKTtcbn0sXG5fcmVzZXREaXN0cmlidXRpb246IGZ1bmN0aW9uICgpIHtcbnZhciBjaGlsZHJlbiA9IGdldExpZ2h0Q2hpbGRyZW4odGhpcyk7XG5mb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG52YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcbmlmIChjaGlsZC5fZGVzdGluYXRpb25JbnNlcnRpb25Qb2ludHMpIHtcbmNoaWxkLl9kZXN0aW5hdGlvbkluc2VydGlvblBvaW50cyA9IHVuZGVmaW5lZDtcbn1cbmlmIChpc0luc2VydGlvblBvaW50KGNoaWxkKSkge1xuY2xlYXJEaXN0cmlidXRlZERlc3RpbmF0aW9uSW5zZXJ0aW9uUG9pbnRzKGNoaWxkKTtcbn1cbn1cbnZhciByb290ID0gdGhpcy5zaGFkeVJvb3Q7XG52YXIgcCQgPSByb290Ll9pbnNlcnRpb25Qb2ludHM7XG5mb3IgKHZhciBqID0gMDsgaiA8IHAkLmxlbmd0aDsgaisrKSB7XG5wJFtqXS5fZGlzdHJpYnV0ZWROb2RlcyA9IFtdO1xufVxufSxcbl9jb2xsZWN0UG9vbDogZnVuY3Rpb24gKCkge1xudmFyIHBvb2wgPSBbXTtcbnZhciBjaGlsZHJlbiA9IGdldExpZ2h0Q2hpbGRyZW4odGhpcyk7XG5mb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG52YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcbmlmIChpc0luc2VydGlvblBvaW50KGNoaWxkKSkge1xucG9vbC5wdXNoLmFwcGx5KHBvb2wsIGNoaWxkLl9kaXN0cmlidXRlZE5vZGVzKTtcbn0gZWxzZSB7XG5wb29sLnB1c2goY2hpbGQpO1xufVxufVxucmV0dXJuIHBvb2w7XG59LFxuX2Rpc3RyaWJ1dGVQb29sOiBmdW5jdGlvbiAobm9kZSwgcG9vbCkge1xudmFyIHAkID0gbm9kZS5faW5zZXJ0aW9uUG9pbnRzO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBwJC5sZW5ndGgsIHA7IGkgPCBsICYmIChwID0gcCRbaV0pOyBpKyspIHtcbnRoaXMuX2Rpc3RyaWJ1dGVJbnNlcnRpb25Qb2ludChwLCBwb29sKTtcbm1heWJlUmVkaXN0cmlidXRlUGFyZW50KHAsIHRoaXMpO1xufVxufSxcbl9kaXN0cmlidXRlSW5zZXJ0aW9uUG9pbnQ6IGZ1bmN0aW9uIChjb250ZW50LCBwb29sKSB7XG52YXIgYW55RGlzdHJpYnV0ZWQgPSBmYWxzZTtcbmZvciAodmFyIGkgPSAwLCBsID0gcG9vbC5sZW5ndGgsIG5vZGU7IGkgPCBsOyBpKyspIHtcbm5vZGUgPSBwb29sW2ldO1xuaWYgKCFub2RlKSB7XG5jb250aW51ZTtcbn1cbmlmICh0aGlzLl9tYXRjaGVzQ29udGVudFNlbGVjdChub2RlLCBjb250ZW50KSkge1xuZGlzdHJpYnV0ZU5vZGVJbnRvKG5vZGUsIGNvbnRlbnQpO1xucG9vbFtpXSA9IHVuZGVmaW5lZDtcbmFueURpc3RyaWJ1dGVkID0gdHJ1ZTtcbn1cbn1cbmlmICghYW55RGlzdHJpYnV0ZWQpIHtcbnZhciBjaGlsZHJlbiA9IGdldExpZ2h0Q2hpbGRyZW4oY29udGVudCk7XG5mb3IgKHZhciBqID0gMDsgaiA8IGNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XG5kaXN0cmlidXRlTm9kZUludG8oY2hpbGRyZW5bal0sIGNvbnRlbnQpO1xufVxufVxufSxcbl9jb21wb3NlVHJlZTogZnVuY3Rpb24gKCkge1xudGhpcy5fdXBkYXRlQ2hpbGROb2Rlcyh0aGlzLCB0aGlzLl9jb21wb3NlTm9kZSh0aGlzKSk7XG52YXIgcCQgPSB0aGlzLnNoYWR5Um9vdC5faW5zZXJ0aW9uUG9pbnRzO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBwJC5sZW5ndGgsIHAsIHBhcmVudDsgaSA8IGwgJiYgKHAgPSBwJFtpXSk7IGkrKykge1xucGFyZW50ID0gcC5fbGlnaHRQYXJlbnQgfHwgcC5wYXJlbnROb2RlO1xuaWYgKCFwYXJlbnQuX3VzZUNvbnRlbnQgJiYgcGFyZW50ICE9PSB0aGlzICYmIHBhcmVudCAhPT0gdGhpcy5zaGFkeVJvb3QpIHtcbnRoaXMuX3VwZGF0ZUNoaWxkTm9kZXMocGFyZW50LCB0aGlzLl9jb21wb3NlTm9kZShwYXJlbnQpKTtcbn1cbn1cbn0sXG5fY29tcG9zZU5vZGU6IGZ1bmN0aW9uIChub2RlKSB7XG52YXIgY2hpbGRyZW4gPSBbXTtcbnZhciBjJCA9IGdldExpZ2h0Q2hpbGRyZW4obm9kZS5zaGFkeVJvb3QgfHwgbm9kZSk7XG5mb3IgKHZhciBpID0gMDsgaSA8IGMkLmxlbmd0aDsgaSsrKSB7XG52YXIgY2hpbGQgPSBjJFtpXTtcbmlmIChpc0luc2VydGlvblBvaW50KGNoaWxkKSkge1xudmFyIGRpc3RyaWJ1dGVkTm9kZXMgPSBjaGlsZC5fZGlzdHJpYnV0ZWROb2RlcztcbmZvciAodmFyIGogPSAwOyBqIDwgZGlzdHJpYnV0ZWROb2Rlcy5sZW5ndGg7IGorKykge1xudmFyIGRpc3RyaWJ1dGVkTm9kZSA9IGRpc3RyaWJ1dGVkTm9kZXNbal07XG5pZiAoaXNGaW5hbERlc3RpbmF0aW9uKGNoaWxkLCBkaXN0cmlidXRlZE5vZGUpKSB7XG5jaGlsZHJlbi5wdXNoKGRpc3RyaWJ1dGVkTm9kZSk7XG59XG59XG59IGVsc2Uge1xuY2hpbGRyZW4ucHVzaChjaGlsZCk7XG59XG59XG5yZXR1cm4gY2hpbGRyZW47XG59LFxuX3VwZGF0ZUNoaWxkTm9kZXM6IGZ1bmN0aW9uIChjb250YWluZXIsIGNoaWxkcmVuKSB7XG52YXIgY29tcG9zZWQgPSBnZXRDb21wb3NlZENoaWxkcmVuKGNvbnRhaW5lcik7XG52YXIgc3BsaWNlcyA9IFBvbHltZXIuQXJyYXlTcGxpY2UuY2FsY3VsYXRlU3BsaWNlcyhjaGlsZHJlbiwgY29tcG9zZWQpO1xuZm9yICh2YXIgaSA9IDAsIGQgPSAwLCBzOyBpIDwgc3BsaWNlcy5sZW5ndGggJiYgKHMgPSBzcGxpY2VzW2ldKTsgaSsrKSB7XG5mb3IgKHZhciBqID0gMCwgbjsgaiA8IHMucmVtb3ZlZC5sZW5ndGggJiYgKG4gPSBzLnJlbW92ZWRbal0pOyBqKyspIHtcbnJlbW92ZShuKTtcbmNvbXBvc2VkLnNwbGljZShzLmluZGV4ICsgZCwgMSk7XG59XG5kIC09IHMuYWRkZWRDb3VudDtcbn1cbmZvciAodmFyIGkgPSAwLCBzLCBuZXh0OyBpIDwgc3BsaWNlcy5sZW5ndGggJiYgKHMgPSBzcGxpY2VzW2ldKTsgaSsrKSB7XG5uZXh0ID0gY29tcG9zZWRbcy5pbmRleF07XG5mb3IgKHZhciBqID0gcy5pbmRleCwgbjsgaiA8IHMuaW5kZXggKyBzLmFkZGVkQ291bnQ7IGorKykge1xubiA9IGNoaWxkcmVuW2pdO1xuaW5zZXJ0QmVmb3JlKGNvbnRhaW5lciwgbiwgbmV4dCk7XG5jb21wb3NlZC5zcGxpY2UoaiwgMCwgbik7XG59XG59XG59LFxuX21hdGNoZXNDb250ZW50U2VsZWN0OiBmdW5jdGlvbiAobm9kZSwgY29udGVudEVsZW1lbnQpIHtcbnZhciBzZWxlY3QgPSBjb250ZW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3NlbGVjdCcpO1xuaWYgKCFzZWxlY3QpIHtcbnJldHVybiB0cnVlO1xufVxuc2VsZWN0ID0gc2VsZWN0LnRyaW0oKTtcbmlmICghc2VsZWN0KSB7XG5yZXR1cm4gdHJ1ZTtcbn1cbmlmICghKG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50KSkge1xucmV0dXJuIGZhbHNlO1xufVxudmFyIHZhbGlkU2VsZWN0b3JzID0gL14oOm5vdFxcKCk/WyouI1thLXpBLVpffF0vO1xuaWYgKCF2YWxpZFNlbGVjdG9ycy50ZXN0KHNlbGVjdCkpIHtcbnJldHVybiBmYWxzZTtcbn1cbnJldHVybiB0aGlzLmVsZW1lbnRNYXRjaGVzKHNlbGVjdCwgbm9kZSk7XG59LFxuX2VsZW1lbnRBZGQ6IGZ1bmN0aW9uICgpIHtcbn0sXG5fZWxlbWVudFJlbW92ZTogZnVuY3Rpb24gKCkge1xufVxufSk7XG52YXIgc2F2ZUxpZ2h0Q2hpbGRyZW5JZk5lZWRlZCA9IFBvbHltZXIuRG9tQXBpLnNhdmVMaWdodENoaWxkcmVuSWZOZWVkZWQ7XG52YXIgZ2V0TGlnaHRDaGlsZHJlbiA9IFBvbHltZXIuRG9tQXBpLmdldExpZ2h0Q2hpbGRyZW47XG52YXIgbWF0Y2hlc1NlbGVjdG9yID0gUG9seW1lci5Eb21BcGkubWF0Y2hlc1NlbGVjdG9yO1xudmFyIGhhc0luc2VydGlvblBvaW50ID0gUG9seW1lci5Eb21BcGkuaGFzSW5zZXJ0aW9uUG9pbnQ7XG52YXIgZ2V0Q29tcG9zZWRDaGlsZHJlbiA9IFBvbHltZXIuRG9tQXBpLmdldENvbXBvc2VkQ2hpbGRyZW47XG52YXIgcmVtb3ZlRnJvbUNvbXBvc2VkUGFyZW50ID0gUG9seW1lci5Eb21BcGkucmVtb3ZlRnJvbUNvbXBvc2VkUGFyZW50O1xuZnVuY3Rpb24gZGlzdHJpYnV0ZU5vZGVJbnRvKGNoaWxkLCBpbnNlcnRpb25Qb2ludCkge1xuaW5zZXJ0aW9uUG9pbnQuX2Rpc3RyaWJ1dGVkTm9kZXMucHVzaChjaGlsZCk7XG52YXIgcG9pbnRzID0gY2hpbGQuX2Rlc3RpbmF0aW9uSW5zZXJ0aW9uUG9pbnRzO1xuaWYgKCFwb2ludHMpIHtcbmNoaWxkLl9kZXN0aW5hdGlvbkluc2VydGlvblBvaW50cyA9IFtpbnNlcnRpb25Qb2ludF07XG59IGVsc2Uge1xucG9pbnRzLnB1c2goaW5zZXJ0aW9uUG9pbnQpO1xufVxufVxuZnVuY3Rpb24gY2xlYXJEaXN0cmlidXRlZERlc3RpbmF0aW9uSW5zZXJ0aW9uUG9pbnRzKGNvbnRlbnQpIHtcbnZhciBlJCA9IGNvbnRlbnQuX2Rpc3RyaWJ1dGVkTm9kZXM7XG5pZiAoZSQpIHtcbmZvciAodmFyIGkgPSAwOyBpIDwgZSQubGVuZ3RoOyBpKyspIHtcbnZhciBkID0gZSRbaV0uX2Rlc3RpbmF0aW9uSW5zZXJ0aW9uUG9pbnRzO1xuaWYgKGQpIHtcbmQuc3BsaWNlKGQuaW5kZXhPZihjb250ZW50KSArIDEsIGQubGVuZ3RoKTtcbn1cbn1cbn1cbn1cbmZ1bmN0aW9uIG1heWJlUmVkaXN0cmlidXRlUGFyZW50KGNvbnRlbnQsIGhvc3QpIHtcbnZhciBwYXJlbnQgPSBjb250ZW50Ll9saWdodFBhcmVudDtcbmlmIChwYXJlbnQgJiYgcGFyZW50LnNoYWR5Um9vdCAmJiBoYXNJbnNlcnRpb25Qb2ludChwYXJlbnQuc2hhZHlSb290KSAmJiBwYXJlbnQuc2hhZHlSb290Ll9kaXN0cmlidXRpb25DbGVhbikge1xucGFyZW50LnNoYWR5Um9vdC5fZGlzdHJpYnV0aW9uQ2xlYW4gPSBmYWxzZTtcbmhvc3Quc2hhZHlSb290Ll9kaXJ0eVJvb3RzLnB1c2gocGFyZW50KTtcbn1cbn1cbmZ1bmN0aW9uIGlzRmluYWxEZXN0aW5hdGlvbihpbnNlcnRpb25Qb2ludCwgbm9kZSkge1xudmFyIHBvaW50cyA9IG5vZGUuX2Rlc3RpbmF0aW9uSW5zZXJ0aW9uUG9pbnRzO1xucmV0dXJuIHBvaW50cyAmJiBwb2ludHNbcG9pbnRzLmxlbmd0aCAtIDFdID09PSBpbnNlcnRpb25Qb2ludDtcbn1cbmZ1bmN0aW9uIGlzSW5zZXJ0aW9uUG9pbnQobm9kZSkge1xucmV0dXJuIG5vZGUubG9jYWxOYW1lID09ICdjb250ZW50Jztcbn1cbnZhciBuYXRpdmVJbnNlcnRCZWZvcmUgPSBFbGVtZW50LnByb3RvdHlwZS5pbnNlcnRCZWZvcmU7XG52YXIgbmF0aXZlUmVtb3ZlQ2hpbGQgPSBFbGVtZW50LnByb3RvdHlwZS5yZW1vdmVDaGlsZDtcbmZ1bmN0aW9uIGluc2VydEJlZm9yZShwYXJlbnROb2RlLCBuZXdDaGlsZCwgcmVmQ2hpbGQpIHtcbnZhciBuZXdDaGlsZFBhcmVudCA9IGdldENvbXBvc2VkUGFyZW50KG5ld0NoaWxkKTtcbmlmIChuZXdDaGlsZFBhcmVudCAhPT0gcGFyZW50Tm9kZSkge1xucmVtb3ZlRnJvbUNvbXBvc2VkUGFyZW50KG5ld0NoaWxkUGFyZW50LCBuZXdDaGlsZCk7XG59XG5yZW1vdmUobmV3Q2hpbGQpO1xuc2F2ZUxpZ2h0Q2hpbGRyZW5JZk5lZWRlZChwYXJlbnROb2RlKTtcbm5hdGl2ZUluc2VydEJlZm9yZS5jYWxsKHBhcmVudE5vZGUsIG5ld0NoaWxkLCByZWZDaGlsZCB8fCBudWxsKTtcbm5ld0NoaWxkLl9jb21wb3NlZFBhcmVudCA9IHBhcmVudE5vZGU7XG59XG5mdW5jdGlvbiByZW1vdmUobm9kZSkge1xudmFyIHBhcmVudE5vZGUgPSBnZXRDb21wb3NlZFBhcmVudChub2RlKTtcbmlmIChwYXJlbnROb2RlKSB7XG5zYXZlTGlnaHRDaGlsZHJlbklmTmVlZGVkKHBhcmVudE5vZGUpO1xubm9kZS5fY29tcG9zZWRQYXJlbnQgPSBudWxsO1xubmF0aXZlUmVtb3ZlQ2hpbGQuY2FsbChwYXJlbnROb2RlLCBub2RlKTtcbn1cbn1cbmZ1bmN0aW9uIGdldENvbXBvc2VkUGFyZW50KG5vZGUpIHtcbnJldHVybiBub2RlLl9fcGF0Y2hlZCA/IG5vZGUuX2NvbXBvc2VkUGFyZW50IDogbm9kZS5wYXJlbnROb2RlO1xufVxuZnVuY3Rpb24gZ2V0VG9wRGlzdHJpYnV0aW5nSG9zdChob3N0KSB7XG53aGlsZSAoaG9zdCAmJiBob3N0TmVlZHNSZWRpc3RyaWJ1dGlvbihob3N0KSkge1xuaG9zdCA9IGhvc3QuZG9tSG9zdDtcbn1cbnJldHVybiBob3N0O1xufVxuZnVuY3Rpb24gaG9zdE5lZWRzUmVkaXN0cmlidXRpb24oaG9zdCkge1xudmFyIGMkID0gUG9seW1lci5kb20oaG9zdCkuY2hpbGRyZW47XG5mb3IgKHZhciBpID0gMCwgYzsgaSA8IGMkLmxlbmd0aDsgaSsrKSB7XG5jID0gYyRbaV07XG5pZiAoYy5sb2NhbE5hbWUgPT09ICdjb250ZW50Jykge1xucmV0dXJuIGhvc3QuZG9tSG9zdDtcbn1cbn1cbn1cbnZhciBuZWVkc1VwZ3JhZGUgPSB3aW5kb3cuQ3VzdG9tRWxlbWVudHMgJiYgIUN1c3RvbUVsZW1lbnRzLnVzZU5hdGl2ZTtcbmZ1bmN0aW9uIHVwZ3JhZGVMaWdodENoaWxkcmVuKGNoaWxkcmVuKSB7XG5pZiAobmVlZHNVcGdyYWRlICYmIGNoaWxkcmVuKSB7XG5mb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG5DdXN0b21FbGVtZW50cy51cGdyYWRlKGNoaWxkcmVuW2ldKTtcbn1cbn1cbn1cbn0oKSk7XG5pZiAoUG9seW1lci5TZXR0aW5ncy51c2VTaGFkb3cpIHtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5fcG9vbENvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcbn0sXG5fYmVnaW5EaXN0cmlidXRlOiBmdW5jdGlvbiAoKSB7XG59LFxuZGlzdHJpYnV0ZUNvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcbn0sXG5fZGlzdHJpYnV0ZUNvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcbn0sXG5fZmluaXNoRGlzdHJpYnV0ZTogZnVuY3Rpb24gKCkge1xufSxcbl9jcmVhdGVMb2NhbFJvb3Q6IGZ1bmN0aW9uICgpIHtcbnRoaXMuY3JlYXRlU2hhZG93Um9vdCgpO1xudGhpcy5zaGFkb3dSb290LmFwcGVuZENoaWxkKHRoaXMucm9vdCk7XG50aGlzLnJvb3QgPSB0aGlzLnNoYWRvd1Jvb3Q7XG59XG59KTtcbn1cblBvbHltZXIuRG9tTW9kdWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZG9tLW1vZHVsZScpO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9yZWdpc3RlckZlYXR1cmVzOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9wcmVwSXMoKTtcbnRoaXMuX3ByZXBBdHRyaWJ1dGVzKCk7XG50aGlzLl9wcmVwQmVoYXZpb3JzKCk7XG50aGlzLl9wcmVwRXh0ZW5kcygpO1xudGhpcy5fcHJlcENvbnN0cnVjdG9yKCk7XG50aGlzLl9wcmVwVGVtcGxhdGUoKTtcbnRoaXMuX3ByZXBTaGFkeSgpO1xufSxcbl9wcmVwQmVoYXZpb3I6IGZ1bmN0aW9uIChiKSB7XG50aGlzLl9hZGRIb3N0QXR0cmlidXRlcyhiLmhvc3RBdHRyaWJ1dGVzKTtcbn0sXG5faW5pdEZlYXR1cmVzOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9wb29sQ29udGVudCgpO1xudGhpcy5fcHVzaEhvc3QoKTtcbnRoaXMuX3N0YW1wVGVtcGxhdGUoKTtcbnRoaXMuX3BvcEhvc3QoKTtcbnRoaXMuX21hcnNoYWxIb3N0QXR0cmlidXRlcygpO1xudGhpcy5fc2V0dXBEZWJvdW5jZXJzKCk7XG50aGlzLl9tYXJzaGFsQmVoYXZpb3JzKCk7XG50aGlzLl90cnlSZWFkeSgpO1xufSxcbl9tYXJzaGFsQmVoYXZpb3I6IGZ1bmN0aW9uIChiKSB7XG59XG59KTtcbn0pKCk7XG5cbn0pIiwicmVxdWlyZShcIi4vcG9seW1lci1taW5pLmh0bWxcIik7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGZ1bmN0aW9uKCkge1xuOyhmdW5jdGlvbigpIHtcblBvbHltZXIubmFyID0gW107XG5Qb2x5bWVyLkFubm90YXRpb25zID0ge1xucGFyc2VBbm5vdGF0aW9uczogZnVuY3Rpb24gKHRlbXBsYXRlKSB7XG52YXIgbGlzdCA9IFtdO1xudmFyIGNvbnRlbnQgPSB0ZW1wbGF0ZS5fY29udGVudCB8fCB0ZW1wbGF0ZS5jb250ZW50O1xudGhpcy5fcGFyc2VOb2RlQW5ub3RhdGlvbnMoY29udGVudCwgbGlzdCk7XG5yZXR1cm4gbGlzdDtcbn0sXG5fcGFyc2VOb2RlQW5ub3RhdGlvbnM6IGZ1bmN0aW9uIChub2RlLCBsaXN0KSB7XG5yZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5URVhUX05PREUgPyB0aGlzLl9wYXJzZVRleHROb2RlQW5ub3RhdGlvbihub2RlLCBsaXN0KSA6IHRoaXMuX3BhcnNlRWxlbWVudEFubm90YXRpb25zKG5vZGUsIGxpc3QpO1xufSxcbl90ZXN0RXNjYXBlOiBmdW5jdGlvbiAodmFsdWUpIHtcbnZhciBlc2NhcGUgPSB2YWx1ZS5zbGljZSgwLCAyKTtcbmlmIChlc2NhcGUgPT09ICd7eycgfHwgZXNjYXBlID09PSAnW1snKSB7XG5yZXR1cm4gZXNjYXBlO1xufVxufSxcbl9wYXJzZVRleHROb2RlQW5ub3RhdGlvbjogZnVuY3Rpb24gKG5vZGUsIGxpc3QpIHtcbnZhciB2ID0gbm9kZS50ZXh0Q29udGVudDtcbnZhciBlc2NhcGUgPSB0aGlzLl90ZXN0RXNjYXBlKHYpO1xuaWYgKGVzY2FwZSkge1xubm9kZS50ZXh0Q29udGVudCA9ICcgJztcbnZhciBhbm5vdGUgPSB7XG5iaW5kaW5nczogW3tcbmtpbmQ6ICd0ZXh0Jyxcbm1vZGU6IGVzY2FwZVswXSxcbnZhbHVlOiB2LnNsaWNlKDIsIC0yKS50cmltKClcbn1dXG59O1xubGlzdC5wdXNoKGFubm90ZSk7XG5yZXR1cm4gYW5ub3RlO1xufVxufSxcbl9wYXJzZUVsZW1lbnRBbm5vdGF0aW9uczogZnVuY3Rpb24gKGVsZW1lbnQsIGxpc3QpIHtcbnZhciBhbm5vdGUgPSB7XG5iaW5kaW5nczogW10sXG5ldmVudHM6IFtdXG59O1xuaWYgKGVsZW1lbnQubG9jYWxOYW1lID09PSAnY29udGVudCcpIHtcbmxpc3QuX2hhc0NvbnRlbnQgPSB0cnVlO1xufVxudGhpcy5fcGFyc2VDaGlsZE5vZGVzQW5ub3RhdGlvbnMoZWxlbWVudCwgYW5ub3RlLCBsaXN0KTtcbmlmIChlbGVtZW50LmF0dHJpYnV0ZXMpIHtcbnRoaXMuX3BhcnNlTm9kZUF0dHJpYnV0ZUFubm90YXRpb25zKGVsZW1lbnQsIGFubm90ZSwgbGlzdCk7XG5pZiAodGhpcy5wcmVwRWxlbWVudCkge1xudGhpcy5wcmVwRWxlbWVudChlbGVtZW50KTtcbn1cbn1cbmlmIChhbm5vdGUuYmluZGluZ3MubGVuZ3RoIHx8IGFubm90ZS5ldmVudHMubGVuZ3RoIHx8IGFubm90ZS5pZCkge1xubGlzdC5wdXNoKGFubm90ZSk7XG59XG5yZXR1cm4gYW5ub3RlO1xufSxcbl9wYXJzZUNoaWxkTm9kZXNBbm5vdGF0aW9uczogZnVuY3Rpb24gKHJvb3QsIGFubm90ZSwgbGlzdCwgY2FsbGJhY2spIHtcbmlmIChyb290LmZpcnN0Q2hpbGQpIHtcbmZvciAodmFyIGkgPSAwLCBub2RlID0gcm9vdC5maXJzdENoaWxkOyBub2RlOyBub2RlID0gbm9kZS5uZXh0U2libGluZywgaSsrKSB7XG5pZiAobm9kZS5sb2NhbE5hbWUgPT09ICd0ZW1wbGF0ZScgJiYgIW5vZGUuaGFzQXR0cmlidXRlKCdwcmVzZXJ2ZS1jb250ZW50JykpIHtcbnRoaXMuX3BhcnNlVGVtcGxhdGUobm9kZSwgaSwgbGlzdCwgYW5ub3RlKTtcbn1cbnZhciBjaGlsZEFubm90YXRpb24gPSB0aGlzLl9wYXJzZU5vZGVBbm5vdGF0aW9ucyhub2RlLCBsaXN0LCBjYWxsYmFjayk7XG5pZiAoY2hpbGRBbm5vdGF0aW9uKSB7XG5jaGlsZEFubm90YXRpb24ucGFyZW50ID0gYW5ub3RlO1xuY2hpbGRBbm5vdGF0aW9uLmluZGV4ID0gaTtcbn1cbn1cbn1cbn0sXG5fcGFyc2VUZW1wbGF0ZTogZnVuY3Rpb24gKG5vZGUsIGluZGV4LCBsaXN0LCBwYXJlbnQpIHtcbnZhciBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuY29udGVudC5fbm90ZXMgPSB0aGlzLnBhcnNlQW5ub3RhdGlvbnMobm9kZSk7XG5jb250ZW50LmFwcGVuZENoaWxkKG5vZGUuY29udGVudCk7XG5saXN0LnB1c2goe1xuYmluZGluZ3M6IFBvbHltZXIubmFyLFxuZXZlbnRzOiBQb2x5bWVyLm5hcixcbnRlbXBsYXRlQ29udGVudDogY29udGVudCxcbnBhcmVudDogcGFyZW50LFxuaW5kZXg6IGluZGV4XG59KTtcbn0sXG5fcGFyc2VOb2RlQXR0cmlidXRlQW5ub3RhdGlvbnM6IGZ1bmN0aW9uIChub2RlLCBhbm5vdGF0aW9uKSB7XG5mb3IgKHZhciBpID0gbm9kZS5hdHRyaWJ1dGVzLmxlbmd0aCAtIDEsIGE7IGEgPSBub2RlLmF0dHJpYnV0ZXNbaV07IGktLSkge1xudmFyIG4gPSBhLm5hbWUsIHYgPSBhLnZhbHVlO1xuaWYgKG4gPT09ICdpZCcgJiYgIXRoaXMuX3Rlc3RFc2NhcGUodikpIHtcbmFubm90YXRpb24uaWQgPSB2O1xufSBlbHNlIGlmIChuLnNsaWNlKDAsIDMpID09PSAnb24tJykge1xubm9kZS5yZW1vdmVBdHRyaWJ1dGUobik7XG5hbm5vdGF0aW9uLmV2ZW50cy5wdXNoKHtcbm5hbWU6IG4uc2xpY2UoMyksXG52YWx1ZTogdlxufSk7XG59IGVsc2Uge1xudmFyIGIgPSB0aGlzLl9wYXJzZU5vZGVBdHRyaWJ1dGVBbm5vdGF0aW9uKG5vZGUsIG4sIHYpO1xuaWYgKGIpIHtcbmFubm90YXRpb24uYmluZGluZ3MucHVzaChiKTtcbn1cbn1cbn1cbn0sXG5fcGFyc2VOb2RlQXR0cmlidXRlQW5ub3RhdGlvbjogZnVuY3Rpb24gKG5vZGUsIG4sIHYpIHtcbnZhciBlc2NhcGUgPSB0aGlzLl90ZXN0RXNjYXBlKHYpO1xuaWYgKGVzY2FwZSkge1xudmFyIGN1c3RvbUV2ZW50O1xudmFyIG5hbWUgPSBuO1xudmFyIG1vZGUgPSBlc2NhcGVbMF07XG52ID0gdi5zbGljZSgyLCAtMikudHJpbSgpO1xudmFyIG5vdCA9IGZhbHNlO1xuaWYgKHZbMF0gPT0gJyEnKSB7XG52ID0gdi5zdWJzdHJpbmcoMSk7XG5ub3QgPSB0cnVlO1xufVxudmFyIGtpbmQgPSAncHJvcGVydHknO1xuaWYgKG5bbi5sZW5ndGggLSAxXSA9PSAnJCcpIHtcbm5hbWUgPSBuLnNsaWNlKDAsIC0xKTtcbmtpbmQgPSAnYXR0cmlidXRlJztcbn1cbnZhciBub3RpZnlFdmVudCwgY29sb247XG5pZiAobW9kZSA9PSAneycgJiYgKGNvbG9uID0gdi5pbmRleE9mKCc6OicpKSA+IDApIHtcbm5vdGlmeUV2ZW50ID0gdi5zdWJzdHJpbmcoY29sb24gKyAyKTtcbnYgPSB2LnN1YnN0cmluZygwLCBjb2xvbik7XG5jdXN0b21FdmVudCA9IHRydWU7XG59XG5pZiAobm9kZS5sb2NhbE5hbWUgPT0gJ2lucHV0JyAmJiBuID09ICd2YWx1ZScpIHtcbm5vZGUuc2V0QXR0cmlidXRlKG4sICcnKTtcbn1cbm5vZGUucmVtb3ZlQXR0cmlidXRlKG4pO1xuaWYgKGtpbmQgPT09ICdwcm9wZXJ0eScpIHtcbm5hbWUgPSBQb2x5bWVyLkNhc2VNYXAuZGFzaFRvQ2FtZWxDYXNlKG5hbWUpO1xufVxucmV0dXJuIHtcbmtpbmQ6IGtpbmQsXG5tb2RlOiBtb2RlLFxubmFtZTogbmFtZSxcbnZhbHVlOiB2LFxubmVnYXRlOiBub3QsXG5ldmVudDogbm90aWZ5RXZlbnQsXG5jdXN0b21FdmVudDogY3VzdG9tRXZlbnRcbn07XG59XG59LFxuX2xvY2FsU3ViVHJlZTogZnVuY3Rpb24gKG5vZGUsIGhvc3QpIHtcbnJldHVybiBub2RlID09PSBob3N0ID8gbm9kZS5jaGlsZE5vZGVzIDogbm9kZS5fbGlnaHRDaGlsZHJlbiB8fCBub2RlLmNoaWxkTm9kZXM7XG59LFxuZmluZEFubm90YXRlZE5vZGU6IGZ1bmN0aW9uIChyb290LCBhbm5vdGUpIHtcbnZhciBwYXJlbnQgPSBhbm5vdGUucGFyZW50ICYmIFBvbHltZXIuQW5ub3RhdGlvbnMuZmluZEFubm90YXRlZE5vZGUocm9vdCwgYW5ub3RlLnBhcmVudCk7XG5yZXR1cm4gIXBhcmVudCA/IHJvb3QgOiBQb2x5bWVyLkFubm90YXRpb25zLl9sb2NhbFN1YlRyZWUocGFyZW50LCByb290KVthbm5vdGUuaW5kZXhdO1xufVxufTtcbihmdW5jdGlvbiAoKSB7XG5mdW5jdGlvbiByZXNvbHZlQ3NzKGNzc1RleHQsIG93bmVyRG9jdW1lbnQpIHtcbnJldHVybiBjc3NUZXh0LnJlcGxhY2UoQ1NTX1VSTF9SWCwgZnVuY3Rpb24gKG0sIHByZSwgdXJsLCBwb3N0KSB7XG5yZXR1cm4gcHJlICsgJ1xcJycgKyByZXNvbHZlKHVybC5yZXBsYWNlKC9bXCInXS9nLCAnJyksIG93bmVyRG9jdW1lbnQpICsgJ1xcJycgKyBwb3N0O1xufSk7XG59XG5mdW5jdGlvbiByZXNvbHZlQXR0cnMoZWxlbWVudCwgb3duZXJEb2N1bWVudCkge1xuZm9yICh2YXIgbmFtZSBpbiBVUkxfQVRUUlMpIHtcbnZhciBhJCA9IFVSTF9BVFRSU1tuYW1lXTtcbmZvciAodmFyIGkgPSAwLCBsID0gYSQubGVuZ3RoLCBhLCBhdCwgdjsgaSA8IGwgJiYgKGEgPSBhJFtpXSk7IGkrKykge1xuaWYgKG5hbWUgPT09ICcqJyB8fCBlbGVtZW50LmxvY2FsTmFtZSA9PT0gbmFtZSkge1xuYXQgPSBlbGVtZW50LmF0dHJpYnV0ZXNbYV07XG52ID0gYXQgJiYgYXQudmFsdWU7XG5pZiAodiAmJiB2LnNlYXJjaChCSU5ESU5HX1JYKSA8IDApIHtcbmF0LnZhbHVlID0gYSA9PT0gJ3N0eWxlJyA/IHJlc29sdmVDc3Modiwgb3duZXJEb2N1bWVudCkgOiByZXNvbHZlKHYsIG93bmVyRG9jdW1lbnQpO1xufVxufVxufVxufVxufVxuZnVuY3Rpb24gcmVzb2x2ZSh1cmwsIG93bmVyRG9jdW1lbnQpIHtcbmlmICh1cmwgJiYgdXJsWzBdID09PSAnIycpIHtcbnJldHVybiB1cmw7XG59XG52YXIgcmVzb2x2ZXIgPSBnZXRVcmxSZXNvbHZlcihvd25lckRvY3VtZW50KTtcbnJlc29sdmVyLmhyZWYgPSB1cmw7XG5yZXR1cm4gcmVzb2x2ZXIuaHJlZiB8fCB1cmw7XG59XG52YXIgdGVtcERvYztcbnZhciB0ZW1wRG9jQmFzZTtcbmZ1bmN0aW9uIHJlc29sdmVVcmwodXJsLCBiYXNlVXJpKSB7XG5pZiAoIXRlbXBEb2MpIHtcbnRlbXBEb2MgPSBkb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQoJ3RlbXAnKTtcbnRlbXBEb2NCYXNlID0gdGVtcERvYy5jcmVhdGVFbGVtZW50KCdiYXNlJyk7XG50ZW1wRG9jLmhlYWQuYXBwZW5kQ2hpbGQodGVtcERvY0Jhc2UpO1xufVxudGVtcERvY0Jhc2UuaHJlZiA9IGJhc2VVcmk7XG5yZXR1cm4gcmVzb2x2ZSh1cmwsIHRlbXBEb2MpO1xufVxuZnVuY3Rpb24gZ2V0VXJsUmVzb2x2ZXIob3duZXJEb2N1bWVudCkge1xucmV0dXJuIG93bmVyRG9jdW1lbnQuX191cmxSZXNvbHZlciB8fCAob3duZXJEb2N1bWVudC5fX3VybFJlc29sdmVyID0gb3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJykpO1xufVxudmFyIENTU19VUkxfUlggPSAvKHVybFxcKCkoW14pXSopKFxcKSkvZztcbnZhciBVUkxfQVRUUlMgPSB7XG4nKic6IFtcbidocmVmJyxcbidzcmMnLFxuJ3N0eWxlJyxcbid1cmwnXG5dLFxuZm9ybTogWydhY3Rpb24nXVxufTtcbnZhciBCSU5ESU5HX1JYID0gL1xce1xce3xcXFtcXFsvO1xuUG9seW1lci5SZXNvbHZlVXJsID0ge1xucmVzb2x2ZUNzczogcmVzb2x2ZUNzcyxcbnJlc29sdmVBdHRyczogcmVzb2x2ZUF0dHJzLFxucmVzb2x2ZVVybDogcmVzb2x2ZVVybFxufTtcbn0oKSk7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX3ByZXBBbm5vdGF0aW9uczogZnVuY3Rpb24gKCkge1xuaWYgKCF0aGlzLl90ZW1wbGF0ZSkge1xudGhpcy5fbm90ZXMgPSBbXTtcbn0gZWxzZSB7XG5Qb2x5bWVyLkFubm90YXRpb25zLnByZXBFbGVtZW50ID0gdGhpcy5fcHJlcEVsZW1lbnQuYmluZCh0aGlzKTtcbnRoaXMuX25vdGVzID0gUG9seW1lci5Bbm5vdGF0aW9ucy5wYXJzZUFubm90YXRpb25zKHRoaXMuX3RlbXBsYXRlKTtcbnRoaXMuX3Byb2Nlc3NBbm5vdGF0aW9ucyh0aGlzLl9ub3Rlcyk7XG5Qb2x5bWVyLkFubm90YXRpb25zLnByZXBFbGVtZW50ID0gbnVsbDtcbn1cbn0sXG5fcHJvY2Vzc0Fubm90YXRpb25zOiBmdW5jdGlvbiAobm90ZXMpIHtcbmZvciAodmFyIGkgPSAwOyBpIDwgbm90ZXMubGVuZ3RoOyBpKyspIHtcbnZhciBub3RlID0gbm90ZXNbaV07XG5mb3IgKHZhciBqID0gMDsgaiA8IG5vdGUuYmluZGluZ3MubGVuZ3RoOyBqKyspIHtcbnZhciBiID0gbm90ZS5iaW5kaW5nc1tqXTtcbmIuc2lnbmF0dXJlID0gdGhpcy5fcGFyc2VNZXRob2QoYi52YWx1ZSk7XG5pZiAoIWIuc2lnbmF0dXJlKSB7XG5iLm1vZGVsID0gdGhpcy5fbW9kZWxGb3JQYXRoKGIudmFsdWUpO1xufVxufVxuaWYgKG5vdGUudGVtcGxhdGVDb250ZW50KSB7XG50aGlzLl9wcm9jZXNzQW5ub3RhdGlvbnMobm90ZS50ZW1wbGF0ZUNvbnRlbnQuX25vdGVzKTtcbnZhciBwcCA9IG5vdGUudGVtcGxhdGVDb250ZW50Ll9wYXJlbnRQcm9wcyA9IHRoaXMuX2Rpc2NvdmVyVGVtcGxhdGVQYXJlbnRQcm9wcyhub3RlLnRlbXBsYXRlQ29udGVudC5fbm90ZXMpO1xudmFyIGJpbmRpbmdzID0gW107XG5mb3IgKHZhciBwcm9wIGluIHBwKSB7XG5iaW5kaW5ncy5wdXNoKHtcbmluZGV4OiBub3RlLmluZGV4LFxua2luZDogJ3Byb3BlcnR5Jyxcbm1vZGU6ICd7Jyxcbm5hbWU6ICdfcGFyZW50XycgKyBwcm9wLFxubW9kZWw6IHByb3AsXG52YWx1ZTogcHJvcFxufSk7XG59XG5ub3RlLmJpbmRpbmdzID0gbm90ZS5iaW5kaW5ncy5jb25jYXQoYmluZGluZ3MpO1xufVxufVxufSxcbl9kaXNjb3ZlclRlbXBsYXRlUGFyZW50UHJvcHM6IGZ1bmN0aW9uIChub3Rlcykge1xudmFyIHBwID0ge307XG5ub3Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChuKSB7XG5uLmJpbmRpbmdzLmZvckVhY2goZnVuY3Rpb24gKGIpIHtcbmlmIChiLnNpZ25hdHVyZSkge1xudmFyIGFyZ3MgPSBiLnNpZ25hdHVyZS5hcmdzO1xuZm9yICh2YXIgayA9IDA7IGsgPCBhcmdzLmxlbmd0aDsgaysrKSB7XG5wcFthcmdzW2tdLm1vZGVsXSA9IHRydWU7XG59XG59IGVsc2Uge1xucHBbYi5tb2RlbF0gPSB0cnVlO1xufVxufSk7XG5pZiAobi50ZW1wbGF0ZUNvbnRlbnQpIHtcbnZhciB0cHAgPSBuLnRlbXBsYXRlQ29udGVudC5fcGFyZW50UHJvcHM7XG5Qb2x5bWVyLkJhc2UubWl4aW4ocHAsIHRwcCk7XG59XG59KTtcbnJldHVybiBwcDtcbn0sXG5fcHJlcEVsZW1lbnQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5Qb2x5bWVyLlJlc29sdmVVcmwucmVzb2x2ZUF0dHJzKGVsZW1lbnQsIHRoaXMuX3RlbXBsYXRlLm93bmVyRG9jdW1lbnQpO1xufSxcbl9maW5kQW5ub3RhdGVkTm9kZTogUG9seW1lci5Bbm5vdGF0aW9ucy5maW5kQW5ub3RhdGVkTm9kZSxcbl9tYXJzaGFsQW5ub3RhdGlvblJlZmVyZW5jZXM6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLl90ZW1wbGF0ZSkge1xudGhpcy5fbWFyc2hhbElkTm9kZXMoKTtcbnRoaXMuX21hcnNoYWxBbm5vdGF0ZWROb2RlcygpO1xudGhpcy5fbWFyc2hhbEFubm90YXRlZExpc3RlbmVycygpO1xufVxufSxcbl9jb25maWd1cmVBbm5vdGF0aW9uUmVmZXJlbmNlczogZnVuY3Rpb24gKCkge1xudGhpcy5fY29uZmlndXJlVGVtcGxhdGVDb250ZW50KCk7XG59LFxuX2NvbmZpZ3VyZVRlbXBsYXRlQ29udGVudDogZnVuY3Rpb24gKCkge1xudGhpcy5fbm90ZXMuZm9yRWFjaChmdW5jdGlvbiAobm90ZSwgaSkge1xuaWYgKG5vdGUudGVtcGxhdGVDb250ZW50KSB7XG50aGlzLl9ub2Rlc1tpXS5fY29udGVudCA9IG5vdGUudGVtcGxhdGVDb250ZW50O1xufVxufSwgdGhpcyk7XG59LFxuX21hcnNoYWxJZE5vZGVzOiBmdW5jdGlvbiAoKSB7XG50aGlzLiQgPSB7fTtcbnRoaXMuX25vdGVzLmZvckVhY2goZnVuY3Rpb24gKGEpIHtcbmlmIChhLmlkKSB7XG50aGlzLiRbYS5pZF0gPSB0aGlzLl9maW5kQW5ub3RhdGVkTm9kZSh0aGlzLnJvb3QsIGEpO1xufVxufSwgdGhpcyk7XG59LFxuX21hcnNoYWxBbm5vdGF0ZWROb2RlczogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuX25vZGVzKSB7XG50aGlzLl9ub2RlcyA9IHRoaXMuX25vZGVzLm1hcChmdW5jdGlvbiAoYSkge1xucmV0dXJuIHRoaXMuX2ZpbmRBbm5vdGF0ZWROb2RlKHRoaXMucm9vdCwgYSk7XG59LCB0aGlzKTtcbn1cbn0sXG5fbWFyc2hhbEFubm90YXRlZExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xudGhpcy5fbm90ZXMuZm9yRWFjaChmdW5jdGlvbiAoYSkge1xuaWYgKGEuZXZlbnRzICYmIGEuZXZlbnRzLmxlbmd0aCkge1xudmFyIG5vZGUgPSB0aGlzLl9maW5kQW5ub3RhdGVkTm9kZSh0aGlzLnJvb3QsIGEpO1xuYS5ldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xudGhpcy5saXN0ZW4obm9kZSwgZS5uYW1lLCBlLnZhbHVlKTtcbn0sIHRoaXMpO1xufVxufSwgdGhpcyk7XG59XG59KTtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5saXN0ZW5lcnM6IHt9LFxuX2xpc3Rlbkxpc3RlbmVyczogZnVuY3Rpb24gKGxpc3RlbmVycykge1xudmFyIG5vZGUsIG5hbWUsIGtleTtcbmZvciAoa2V5IGluIGxpc3RlbmVycykge1xuaWYgKGtleS5pbmRleE9mKCcuJykgPCAwKSB7XG5ub2RlID0gdGhpcztcbm5hbWUgPSBrZXk7XG59IGVsc2Uge1xubmFtZSA9IGtleS5zcGxpdCgnLicpO1xubm9kZSA9IHRoaXMuJFtuYW1lWzBdXTtcbm5hbWUgPSBuYW1lWzFdO1xufVxudGhpcy5saXN0ZW4obm9kZSwgbmFtZSwgbGlzdGVuZXJzW2tleV0pO1xufVxufSxcbmxpc3RlbjogZnVuY3Rpb24gKG5vZGUsIGV2ZW50TmFtZSwgbWV0aG9kTmFtZSkge1xudGhpcy5fbGlzdGVuKG5vZGUsIGV2ZW50TmFtZSwgdGhpcy5fY3JlYXRlRXZlbnRIYW5kbGVyKG5vZGUsIGV2ZW50TmFtZSwgbWV0aG9kTmFtZSkpO1xufSxcbl9ib3VuZExpc3RlbmVyS2V5OiBmdW5jdGlvbiAoZXZlbnROYW1lLCBtZXRob2ROYW1lKSB7XG5yZXR1cm4gZXZlbnROYW1lICsgJzonICsgbWV0aG9kTmFtZTtcbn0sXG5fcmVjb3JkRXZlbnRIYW5kbGVyOiBmdW5jdGlvbiAoaG9zdCwgZXZlbnROYW1lLCB0YXJnZXQsIG1ldGhvZE5hbWUsIGhhbmRsZXIpIHtcbnZhciBoYmwgPSBob3N0Ll9fYm91bmRMaXN0ZW5lcnM7XG5pZiAoIWhibCkge1xuaGJsID0gaG9zdC5fX2JvdW5kTGlzdGVuZXJzID0gbmV3IFdlYWtNYXAoKTtcbn1cbnZhciBibCA9IGhibC5nZXQodGFyZ2V0KTtcbmlmICghYmwpIHtcbmJsID0ge307XG5oYmwuc2V0KHRhcmdldCwgYmwpO1xufVxudmFyIGtleSA9IHRoaXMuX2JvdW5kTGlzdGVuZXJLZXkoZXZlbnROYW1lLCBtZXRob2ROYW1lKTtcbmJsW2tleV0gPSBoYW5kbGVyO1xufSxcbl9yZWNhbGxFdmVudEhhbmRsZXI6IGZ1bmN0aW9uIChob3N0LCBldmVudE5hbWUsIHRhcmdldCwgbWV0aG9kTmFtZSkge1xudmFyIGhibCA9IGhvc3QuX19ib3VuZExpc3RlbmVycztcbmlmICghaGJsKSB7XG5yZXR1cm47XG59XG52YXIgYmwgPSBoYmwuZ2V0KHRhcmdldCk7XG5pZiAoIWJsKSB7XG5yZXR1cm47XG59XG52YXIga2V5ID0gdGhpcy5fYm91bmRMaXN0ZW5lcktleShldmVudE5hbWUsIG1ldGhvZE5hbWUpO1xucmV0dXJuIGJsW2tleV07XG59LFxuX2NyZWF0ZUV2ZW50SGFuZGxlcjogZnVuY3Rpb24gKG5vZGUsIGV2ZW50TmFtZSwgbWV0aG9kTmFtZSkge1xudmFyIGhvc3QgPSB0aGlzO1xudmFyIGhhbmRsZXIgPSBmdW5jdGlvbiAoZSkge1xuaWYgKGhvc3RbbWV0aG9kTmFtZV0pIHtcbmhvc3RbbWV0aG9kTmFtZV0oZSwgZS5kZXRhaWwpO1xufSBlbHNlIHtcbmhvc3QuX3dhcm4oaG9zdC5fbG9nZignX2NyZWF0ZUV2ZW50SGFuZGxlcicsICdsaXN0ZW5lciBtZXRob2QgYCcgKyBtZXRob2ROYW1lICsgJ2Agbm90IGRlZmluZWQnKSk7XG59XG59O1xudGhpcy5fcmVjb3JkRXZlbnRIYW5kbGVyKGhvc3QsIGV2ZW50TmFtZSwgbm9kZSwgbWV0aG9kTmFtZSwgaGFuZGxlcik7XG5yZXR1cm4gaGFuZGxlcjtcbn0sXG51bmxpc3RlbjogZnVuY3Rpb24gKG5vZGUsIGV2ZW50TmFtZSwgbWV0aG9kTmFtZSkge1xudmFyIGhhbmRsZXIgPSB0aGlzLl9yZWNhbGxFdmVudEhhbmRsZXIodGhpcywgZXZlbnROYW1lLCBub2RlLCBtZXRob2ROYW1lKTtcbmlmIChoYW5kbGVyKSB7XG50aGlzLl91bmxpc3Rlbihub2RlLCBldmVudE5hbWUsIGhhbmRsZXIpO1xufVxufSxcbl9saXN0ZW46IGZ1bmN0aW9uIChub2RlLCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbm5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIpO1xufSxcbl91bmxpc3RlbjogZnVuY3Rpb24gKG5vZGUsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xubm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlcik7XG59XG59KTtcbihmdW5jdGlvbiAoKSB7XG4ndXNlIHN0cmljdCc7XG52YXIgSEFTX05BVElWRV9UQSA9IHR5cGVvZiBkb2N1bWVudC5oZWFkLnN0eWxlLnRvdWNoQWN0aW9uID09PSAnc3RyaW5nJztcbnZhciBHRVNUVVJFX0tFWSA9ICdfX3BvbHltZXJHZXN0dXJlcyc7XG52YXIgSEFORExFRF9PQkogPSAnX19wb2x5bWVyR2VzdHVyZXNIYW5kbGVkJztcbnZhciBUT1VDSF9BQ1RJT04gPSAnX19wb2x5bWVyR2VzdHVyZXNUb3VjaEFjdGlvbic7XG52YXIgVEFQX0RJU1RBTkNFID0gMjU7XG52YXIgVFJBQ0tfRElTVEFOQ0UgPSA1O1xudmFyIFRSQUNLX0xFTkdUSCA9IDI7XG52YXIgTU9VU0VfVElNRU9VVCA9IDI1MDA7XG52YXIgTU9VU0VfRVZFTlRTID0gW1xuJ21vdXNlZG93bicsXG4nbW91c2Vtb3ZlJyxcbidtb3VzZXVwJyxcbidjbGljaydcbl07XG52YXIgSVNfVE9VQ0hfT05MWSA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL2lQKD86W29hXWR8aG9uZSl8QW5kcm9pZC8pO1xudmFyIG1vdXNlQ2FuY2VsbGVyID0gZnVuY3Rpb24gKG1vdXNlRXZlbnQpIHtcbm1vdXNlRXZlbnRbSEFORExFRF9PQkpdID0geyBza2lwOiB0cnVlIH07XG5pZiAobW91c2VFdmVudC50eXBlID09PSAnY2xpY2snKSB7XG52YXIgcGF0aCA9IFBvbHltZXIuZG9tKG1vdXNlRXZlbnQpLnBhdGg7XG5mb3IgKHZhciBpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbmlmIChwYXRoW2ldID09PSBQT0lOVEVSU1RBVEUubW91c2UudGFyZ2V0KSB7XG5yZXR1cm47XG59XG59XG5tb3VzZUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5tb3VzZUV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xufVxufTtcbmZ1bmN0aW9uIHNldHVwVGVhcmRvd25Nb3VzZUNhbmNlbGxlcihzZXR1cCkge1xuZm9yICh2YXIgaSA9IDAsIGVuOyBpIDwgTU9VU0VfRVZFTlRTLmxlbmd0aDsgaSsrKSB7XG5lbiA9IE1PVVNFX0VWRU5UU1tpXTtcbmlmIChzZXR1cCkge1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihlbiwgbW91c2VDYW5jZWxsZXIsIHRydWUpO1xufSBlbHNlIHtcbmRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZW4sIG1vdXNlQ2FuY2VsbGVyLCB0cnVlKTtcbn1cbn1cbn1cbmZ1bmN0aW9uIGlnbm9yZU1vdXNlKCkge1xuaWYgKElTX1RPVUNIX09OTFkpIHtcbnJldHVybjtcbn1cbmlmICghUE9JTlRFUlNUQVRFLm1vdXNlLm1vdXNlSWdub3JlSm9iKSB7XG5zZXR1cFRlYXJkb3duTW91c2VDYW5jZWxsZXIodHJ1ZSk7XG59XG52YXIgdW5zZXQgPSBmdW5jdGlvbiAoKSB7XG5zZXR1cFRlYXJkb3duTW91c2VDYW5jZWxsZXIoKTtcblBPSU5URVJTVEFURS5tb3VzZS50YXJnZXQgPSBudWxsO1xuUE9JTlRFUlNUQVRFLm1vdXNlLm1vdXNlSWdub3JlSm9iID0gbnVsbDtcbn07XG5QT0lOVEVSU1RBVEUubW91c2UubW91c2VJZ25vcmVKb2IgPSBQb2x5bWVyLkRlYm91bmNlKFBPSU5URVJTVEFURS5tb3VzZS5tb3VzZUlnbm9yZUpvYiwgdW5zZXQsIE1PVVNFX1RJTUVPVVQpO1xufVxudmFyIFBPSU5URVJTVEFURSA9IHtcbm1vdXNlOiB7XG50YXJnZXQ6IG51bGwsXG5tb3VzZUlnbm9yZUpvYjogbnVsbFxufSxcbnRvdWNoOiB7XG54OiAwLFxueTogMCxcbmlkOiAtMSxcbnNjcm9sbERlY2lkZWQ6IGZhbHNlXG59XG59O1xuZnVuY3Rpb24gZmlyc3RUb3VjaEFjdGlvbihldikge1xudmFyIHBhdGggPSBQb2x5bWVyLmRvbShldikucGF0aDtcbnZhciB0YSA9ICdhdXRvJztcbmZvciAodmFyIGkgPSAwLCBuOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xubiA9IHBhdGhbaV07XG5pZiAobltUT1VDSF9BQ1RJT05dKSB7XG50YSA9IG5bVE9VQ0hfQUNUSU9OXTtcbmJyZWFrO1xufVxufVxucmV0dXJuIHRhO1xufVxudmFyIEdlc3R1cmVzID0ge1xuZ2VzdHVyZXM6IHt9LFxucmVjb2duaXplcnM6IFtdLFxuZGVlcFRhcmdldEZpbmQ6IGZ1bmN0aW9uICh4LCB5KSB7XG52YXIgbm9kZSA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG52YXIgbmV4dCA9IG5vZGU7XG53aGlsZSAobmV4dCAmJiBuZXh0LnNoYWRvd1Jvb3QpIHtcbm5leHQgPSBuZXh0LnNoYWRvd1Jvb3QuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbmlmIChuZXh0KSB7XG5ub2RlID0gbmV4dDtcbn1cbn1cbnJldHVybiBub2RlO1xufSxcbmZpbmRPcmlnaW5hbFRhcmdldDogZnVuY3Rpb24gKGV2KSB7XG5pZiAoZXYucGF0aCkge1xucmV0dXJuIGV2LnBhdGhbMF07XG59XG5yZXR1cm4gZXYudGFyZ2V0O1xufSxcbmhhbmRsZU5hdGl2ZTogZnVuY3Rpb24gKGV2KSB7XG52YXIgaGFuZGxlZDtcbnZhciB0eXBlID0gZXYudHlwZTtcbnZhciBub2RlID0gZXYuY3VycmVudFRhcmdldDtcbnZhciBnb2JqID0gbm9kZVtHRVNUVVJFX0tFWV07XG52YXIgZ3MgPSBnb2JqW3R5cGVdO1xuaWYgKCFncykge1xucmV0dXJuO1xufVxuaWYgKCFldltIQU5ETEVEX09CSl0pIHtcbmV2W0hBTkRMRURfT0JKXSA9IHt9O1xuaWYgKHR5cGUuc2xpY2UoMCwgNSkgPT09ICd0b3VjaCcpIHtcbnZhciB0ID0gZXYuY2hhbmdlZFRvdWNoZXNbMF07XG5pZiAodHlwZSA9PT0gJ3RvdWNoc3RhcnQnKSB7XG5pZiAoZXYudG91Y2hlcy5sZW5ndGggPT09IDEpIHtcblBPSU5URVJTVEFURS50b3VjaC5pZCA9IHQuaWRlbnRpZmllcjtcbn1cbn1cbmlmIChQT0lOVEVSU1RBVEUudG91Y2guaWQgIT09IHQuaWRlbnRpZmllcikge1xucmV0dXJuO1xufVxuaWYgKCFIQVNfTkFUSVZFX1RBKSB7XG5pZiAodHlwZSA9PT0gJ3RvdWNoc3RhcnQnIHx8IHR5cGUgPT09ICd0b3VjaG1vdmUnKSB7XG5HZXN0dXJlcy5oYW5kbGVUb3VjaEFjdGlvbihldik7XG59XG59XG5pZiAodHlwZSA9PT0gJ3RvdWNoZW5kJykge1xuUE9JTlRFUlNUQVRFLm1vdXNlLnRhcmdldCA9IFBvbHltZXIuZG9tKGV2KS5yb290VGFyZ2V0O1xuaWdub3JlTW91c2UodHJ1ZSk7XG59XG59XG59XG5oYW5kbGVkID0gZXZbSEFORExFRF9PQkpdO1xuaWYgKGhhbmRsZWQuc2tpcCkge1xucmV0dXJuO1xufVxudmFyIHJlY29nbml6ZXJzID0gR2VzdHVyZXMucmVjb2duaXplcnM7XG5mb3IgKHZhciBpID0gMCwgcjsgaSA8IHJlY29nbml6ZXJzLmxlbmd0aDsgaSsrKSB7XG5yID0gcmVjb2duaXplcnNbaV07XG5pZiAoZ3Nbci5uYW1lXSAmJiAhaGFuZGxlZFtyLm5hbWVdKSB7XG5oYW5kbGVkW3IubmFtZV0gPSB0cnVlO1xuclt0eXBlXShldik7XG59XG59XG59LFxuaGFuZGxlVG91Y2hBY3Rpb246IGZ1bmN0aW9uIChldikge1xudmFyIHQgPSBldi5jaGFuZ2VkVG91Y2hlc1swXTtcbnZhciB0eXBlID0gZXYudHlwZTtcbmlmICh0eXBlID09PSAndG91Y2hzdGFydCcpIHtcblBPSU5URVJTVEFURS50b3VjaC54ID0gdC5jbGllbnRYO1xuUE9JTlRFUlNUQVRFLnRvdWNoLnkgPSB0LmNsaWVudFk7XG5QT0lOVEVSU1RBVEUudG91Y2guc2Nyb2xsRGVjaWRlZCA9IGZhbHNlO1xufSBlbHNlIGlmICh0eXBlID09PSAndG91Y2htb3ZlJykge1xuaWYgKFBPSU5URVJTVEFURS50b3VjaC5zY3JvbGxEZWNpZGVkKSB7XG5yZXR1cm47XG59XG5QT0lOVEVSU1RBVEUudG91Y2guc2Nyb2xsRGVjaWRlZCA9IHRydWU7XG52YXIgdGEgPSBmaXJzdFRvdWNoQWN0aW9uKGV2KTtcbnZhciBwcmV2ZW50ID0gZmFsc2U7XG52YXIgZHggPSBNYXRoLmFicyhQT0lOVEVSU1RBVEUudG91Y2gueCAtIHQuY2xpZW50WCk7XG52YXIgZHkgPSBNYXRoLmFicyhQT0lOVEVSU1RBVEUudG91Y2gueSAtIHQuY2xpZW50WSk7XG5pZiAoIWV2LmNhbmNlbGFibGUpIHtcbn0gZWxzZSBpZiAodGEgPT09ICdub25lJykge1xucHJldmVudCA9IHRydWU7XG59IGVsc2UgaWYgKHRhID09PSAncGFuLXgnKSB7XG5wcmV2ZW50ID0gZHkgPiBkeDtcbn0gZWxzZSBpZiAodGEgPT09ICdwYW4teScpIHtcbnByZXZlbnQgPSBkeCA+IGR5O1xufVxuaWYgKHByZXZlbnQpIHtcbmV2LnByZXZlbnREZWZhdWx0KCk7XG59XG59XG59LFxuYWRkOiBmdW5jdGlvbiAobm9kZSwgZXZUeXBlLCBoYW5kbGVyKSB7XG52YXIgcmVjb2duaXplciA9IHRoaXMuZ2VzdHVyZXNbZXZUeXBlXTtcbnZhciBkZXBzID0gcmVjb2duaXplci5kZXBzO1xudmFyIG5hbWUgPSByZWNvZ25pemVyLm5hbWU7XG52YXIgZ29iaiA9IG5vZGVbR0VTVFVSRV9LRVldO1xuaWYgKCFnb2JqKSB7XG5ub2RlW0dFU1RVUkVfS0VZXSA9IGdvYmogPSB7fTtcbn1cbmZvciAodmFyIGkgPSAwLCBkZXAsIGdkOyBpIDwgZGVwcy5sZW5ndGg7IGkrKykge1xuZGVwID0gZGVwc1tpXTtcbmlmIChJU19UT1VDSF9PTkxZICYmIE1PVVNFX0VWRU5UUy5pbmRleE9mKGRlcCkgPiAtMSkge1xuY29udGludWU7XG59XG5nZCA9IGdvYmpbZGVwXTtcbmlmICghZ2QpIHtcbmdvYmpbZGVwXSA9IGdkID0geyBfY291bnQ6IDAgfTtcbn1cbmlmIChnZC5fY291bnQgPT09IDApIHtcbm5vZGUuYWRkRXZlbnRMaXN0ZW5lcihkZXAsIHRoaXMuaGFuZGxlTmF0aXZlKTtcbn1cbmdkW25hbWVdID0gKGdkW25hbWVdIHx8IDApICsgMTtcbmdkLl9jb3VudCA9IChnZC5fY291bnQgfHwgMCkgKyAxO1xufVxubm9kZS5hZGRFdmVudExpc3RlbmVyKGV2VHlwZSwgaGFuZGxlcik7XG5pZiAocmVjb2duaXplci50b3VjaEFjdGlvbikge1xudGhpcy5zZXRUb3VjaEFjdGlvbihub2RlLCByZWNvZ25pemVyLnRvdWNoQWN0aW9uKTtcbn1cbn0sXG5yZW1vdmU6IGZ1bmN0aW9uIChub2RlLCBldlR5cGUsIGhhbmRsZXIpIHtcbnZhciByZWNvZ25pemVyID0gdGhpcy5nZXN0dXJlc1tldlR5cGVdO1xudmFyIGRlcHMgPSByZWNvZ25pemVyLmRlcHM7XG52YXIgbmFtZSA9IHJlY29nbml6ZXIubmFtZTtcbnZhciBnb2JqID0gbm9kZVtHRVNUVVJFX0tFWV07XG5pZiAoZ29iaikge1xuZm9yICh2YXIgaSA9IDAsIGRlcCwgZ2Q7IGkgPCBkZXBzLmxlbmd0aDsgaSsrKSB7XG5kZXAgPSBkZXBzW2ldO1xuZ2QgPSBnb2JqW2RlcF07XG5pZiAoZ2QgJiYgZ2RbbmFtZV0pIHtcbmdkW25hbWVdID0gKGdkW25hbWVdIHx8IDEpIC0gMTtcbmdkLl9jb3VudCA9IChnZC5fY291bnQgfHwgMSkgLSAxO1xufVxuaWYgKGdkLl9jb3VudCA9PT0gMCkge1xubm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGRlcCwgdGhpcy5oYW5kbGVOYXRpdmUpO1xufVxufVxufVxubm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2VHlwZSwgaGFuZGxlcik7XG59LFxucmVnaXN0ZXI6IGZ1bmN0aW9uIChyZWNvZykge1xudGhpcy5yZWNvZ25pemVycy5wdXNoKHJlY29nKTtcbmZvciAodmFyIGkgPSAwOyBpIDwgcmVjb2cuZW1pdHMubGVuZ3RoOyBpKyspIHtcbnRoaXMuZ2VzdHVyZXNbcmVjb2cuZW1pdHNbaV1dID0gcmVjb2c7XG59XG59LFxuZmluZFJlY29nbml6ZXJCeUV2ZW50OiBmdW5jdGlvbiAoZXZOYW1lKSB7XG5mb3IgKHZhciBpID0gMCwgcjsgaSA8IHRoaXMucmVjb2duaXplcnMubGVuZ3RoOyBpKyspIHtcbnIgPSB0aGlzLnJlY29nbml6ZXJzW2ldO1xuZm9yICh2YXIgaiA9IDAsIG47IGogPCByLmVtaXRzLmxlbmd0aDsgaisrKSB7XG5uID0gci5lbWl0c1tqXTtcbmlmIChuID09PSBldk5hbWUpIHtcbnJldHVybiByO1xufVxufVxufVxucmV0dXJuIG51bGw7XG59LFxuc2V0VG91Y2hBY3Rpb246IGZ1bmN0aW9uIChub2RlLCB2YWx1ZSkge1xuaWYgKEhBU19OQVRJVkVfVEEpIHtcbm5vZGUuc3R5bGUudG91Y2hBY3Rpb24gPSB2YWx1ZTtcbn1cbm5vZGVbVE9VQ0hfQUNUSU9OXSA9IHZhbHVlO1xufSxcbmZpcmU6IGZ1bmN0aW9uICh0YXJnZXQsIHR5cGUsIGRldGFpbCkge1xudmFyIGV2ID0gUG9seW1lci5CYXNlLmZpcmUodHlwZSwgZGV0YWlsLCB7XG5ub2RlOiB0YXJnZXQsXG5idWJibGVzOiB0cnVlLFxuY2FuY2VsYWJsZTogdHJ1ZVxufSk7XG5pZiAoZXYuZGVmYXVsdFByZXZlbnRlZCkge1xudmFyIHNlID0gZGV0YWlsLnNvdXJjZUV2ZW50O1xuaWYgKHNlICYmIHNlLnByZXZlbnREZWZhdWx0KSB7XG5zZS5wcmV2ZW50RGVmYXVsdCgpO1xufVxufVxufSxcbnByZXZlbnQ6IGZ1bmN0aW9uIChldk5hbWUpIHtcbnZhciByZWNvZ25pemVyID0gdGhpcy5maW5kUmVjb2duaXplckJ5RXZlbnQoZXZOYW1lKTtcbmlmIChyZWNvZ25pemVyLmluZm8pIHtcbnJlY29nbml6ZXIuaW5mby5wcmV2ZW50ID0gdHJ1ZTtcbn1cbn1cbn07XG5HZXN0dXJlcy5yZWdpc3Rlcih7XG5uYW1lOiAnZG93bnVwJyxcbmRlcHM6IFtcbidtb3VzZWRvd24nLFxuJ3RvdWNoc3RhcnQnLFxuJ3RvdWNoZW5kJ1xuXSxcbmVtaXRzOiBbXG4nZG93bicsXG4ndXAnXG5dLFxubW91c2Vkb3duOiBmdW5jdGlvbiAoZSkge1xudmFyIHQgPSBHZXN0dXJlcy5maW5kT3JpZ2luYWxUYXJnZXQoZSk7XG52YXIgc2VsZiA9IHRoaXM7XG52YXIgdXBmbiA9IGZ1bmN0aW9uIHVwZm4oZSkge1xuc2VsZi5maXJlKCd1cCcsIHQsIGUpO1xuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHVwZm4pO1xufTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB1cGZuKTtcbnRoaXMuZmlyZSgnZG93bicsIHQsIGUpO1xufSxcbnRvdWNoc3RhcnQ6IGZ1bmN0aW9uIChlKSB7XG50aGlzLmZpcmUoJ2Rvd24nLCBHZXN0dXJlcy5maW5kT3JpZ2luYWxUYXJnZXQoZSksIGUuY2hhbmdlZFRvdWNoZXNbMF0pO1xufSxcbnRvdWNoZW5kOiBmdW5jdGlvbiAoZSkge1xudGhpcy5maXJlKCd1cCcsIEdlc3R1cmVzLmZpbmRPcmlnaW5hbFRhcmdldChlKSwgZS5jaGFuZ2VkVG91Y2hlc1swXSk7XG59LFxuZmlyZTogZnVuY3Rpb24gKHR5cGUsIHRhcmdldCwgZXZlbnQpIHtcbnZhciBzZWxmID0gdGhpcztcbkdlc3R1cmVzLmZpcmUodGFyZ2V0LCB0eXBlLCB7XG54OiBldmVudC5jbGllbnRYLFxueTogZXZlbnQuY2xpZW50WSxcbnNvdXJjZUV2ZW50OiBldmVudCxcbnByZXZlbnQ6IEdlc3R1cmVzLnByZXZlbnQuYmluZChHZXN0dXJlcylcbn0pO1xufVxufSk7XG5HZXN0dXJlcy5yZWdpc3Rlcih7XG5uYW1lOiAndHJhY2snLFxudG91Y2hBY3Rpb246ICdub25lJyxcbmRlcHM6IFtcbidtb3VzZWRvd24nLFxuJ3RvdWNoc3RhcnQnLFxuJ3RvdWNobW92ZScsXG4ndG91Y2hlbmQnXG5dLFxuZW1pdHM6IFsndHJhY2snXSxcbmluZm86IHtcbng6IDAsXG55OiAwLFxuc3RhdGU6ICdzdGFydCcsXG5zdGFydGVkOiBmYWxzZSxcbm1vdmVzOiBbXSxcbmFkZE1vdmU6IGZ1bmN0aW9uIChtb3ZlKSB7XG5pZiAodGhpcy5tb3Zlcy5sZW5ndGggPiBUUkFDS19MRU5HVEgpIHtcbnRoaXMubW92ZXMuc2hpZnQoKTtcbn1cbnRoaXMubW92ZXMucHVzaChtb3ZlKTtcbn0sXG5wcmV2ZW50OiBmYWxzZVxufSxcbmNsZWFySW5mbzogZnVuY3Rpb24gKCkge1xudGhpcy5pbmZvLnN0YXRlID0gJ3N0YXJ0JztcbnRoaXMuaW5mby5zdGFydGVkID0gZmFsc2U7XG50aGlzLmluZm8ubW92ZXMgPSBbXTtcbnRoaXMuaW5mby54ID0gMDtcbnRoaXMuaW5mby55ID0gMDtcbnRoaXMuaW5mby5wcmV2ZW50ID0gZmFsc2U7XG59LFxuaGFzTW92ZWRFbm91Z2g6IGZ1bmN0aW9uICh4LCB5KSB7XG5pZiAodGhpcy5pbmZvLnByZXZlbnQpIHtcbnJldHVybiBmYWxzZTtcbn1cbmlmICh0aGlzLmluZm8uc3RhcnRlZCkge1xucmV0dXJuIHRydWU7XG59XG52YXIgZHggPSBNYXRoLmFicyh0aGlzLmluZm8ueCAtIHgpO1xudmFyIGR5ID0gTWF0aC5hYnModGhpcy5pbmZvLnkgLSB5KTtcbnJldHVybiBkeCA+PSBUUkFDS19ESVNUQU5DRSB8fCBkeSA+PSBUUkFDS19ESVNUQU5DRTtcbn0sXG5tb3VzZWRvd246IGZ1bmN0aW9uIChlKSB7XG52YXIgdCA9IEdlc3R1cmVzLmZpbmRPcmlnaW5hbFRhcmdldChlKTtcbnZhciBzZWxmID0gdGhpcztcbnZhciBtb3ZlZm4gPSBmdW5jdGlvbiBtb3ZlZm4oZSkge1xudmFyIHggPSBlLmNsaWVudFgsIHkgPSBlLmNsaWVudFk7XG5pZiAoc2VsZi5oYXNNb3ZlZEVub3VnaCh4LCB5KSkge1xuc2VsZi5pbmZvLnN0YXRlID0gc2VsZi5pbmZvLnN0YXJ0ZWQgPyBlLnR5cGUgPT09ICdtb3VzZXVwJyA/ICdlbmQnIDogJ3RyYWNrJyA6ICdzdGFydCc7XG5zZWxmLmluZm8uYWRkTW92ZSh7XG54OiB4LFxueTogeVxufSk7XG5zZWxmLmZpcmUodCwgZSk7XG5zZWxmLmluZm8uc3RhcnRlZCA9IHRydWU7XG59XG59O1xudmFyIHVwZm4gPSBmdW5jdGlvbiB1cGZuKGUpIHtcbmlmIChzZWxmLmluZm8uc3RhcnRlZCkge1xuR2VzdHVyZXMucHJldmVudCgndGFwJyk7XG5tb3ZlZm4oZSk7XG59XG5zZWxmLmNsZWFySW5mbygpO1xuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW92ZWZuKTtcbmRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB1cGZuKTtcbn07XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3ZlZm4pO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHVwZm4pO1xudGhpcy5pbmZvLnggPSBlLmNsaWVudFg7XG50aGlzLmluZm8ueSA9IGUuY2xpZW50WTtcbn0sXG50b3VjaHN0YXJ0OiBmdW5jdGlvbiAoZSkge1xudmFyIGN0ID0gZS5jaGFuZ2VkVG91Y2hlc1swXTtcbnRoaXMuaW5mby54ID0gY3QuY2xpZW50WDtcbnRoaXMuaW5mby55ID0gY3QuY2xpZW50WTtcbn0sXG50b3VjaG1vdmU6IGZ1bmN0aW9uIChlKSB7XG52YXIgdCA9IEdlc3R1cmVzLmZpbmRPcmlnaW5hbFRhcmdldChlKTtcbnZhciBjdCA9IGUuY2hhbmdlZFRvdWNoZXNbMF07XG52YXIgeCA9IGN0LmNsaWVudFgsIHkgPSBjdC5jbGllbnRZO1xuaWYgKHRoaXMuaGFzTW92ZWRFbm91Z2goeCwgeSkpIHtcbnRoaXMuaW5mby5hZGRNb3ZlKHtcbng6IHgsXG55OiB5XG59KTtcbnRoaXMuZmlyZSh0LCBjdCk7XG50aGlzLmluZm8uc3RhdGUgPSAndHJhY2snO1xudGhpcy5pbmZvLnN0YXJ0ZWQgPSB0cnVlO1xufVxufSxcbnRvdWNoZW5kOiBmdW5jdGlvbiAoZSkge1xudmFyIHQgPSBHZXN0dXJlcy5maW5kT3JpZ2luYWxUYXJnZXQoZSk7XG52YXIgY3QgPSBlLmNoYW5nZWRUb3VjaGVzWzBdO1xuaWYgKHRoaXMuaW5mby5zdGFydGVkKSB7XG5HZXN0dXJlcy5wcmV2ZW50KCd0YXAnKTtcbnRoaXMuaW5mby5zdGF0ZSA9ICdlbmQnO1xudGhpcy5pbmZvLmFkZE1vdmUoe1xueDogY3QuY2xpZW50WCxcbnk6IGN0LmNsaWVudFlcbn0pO1xudGhpcy5maXJlKHQsIGN0KTtcbn1cbnRoaXMuY2xlYXJJbmZvKCk7XG59LFxuZmlyZTogZnVuY3Rpb24gKHRhcmdldCwgdG91Y2gpIHtcbnZhciBzZWNvbmRsYXN0ID0gdGhpcy5pbmZvLm1vdmVzW3RoaXMuaW5mby5tb3Zlcy5sZW5ndGggLSAyXTtcbnZhciBsYXN0bW92ZSA9IHRoaXMuaW5mby5tb3Zlc1t0aGlzLmluZm8ubW92ZXMubGVuZ3RoIC0gMV07XG52YXIgZHggPSBsYXN0bW92ZS54IC0gdGhpcy5pbmZvLng7XG52YXIgZHkgPSBsYXN0bW92ZS55IC0gdGhpcy5pbmZvLnk7XG52YXIgZGR4LCBkZHkgPSAwO1xuaWYgKHNlY29uZGxhc3QpIHtcbmRkeCA9IGxhc3Rtb3ZlLnggLSBzZWNvbmRsYXN0Lng7XG5kZHkgPSBsYXN0bW92ZS55IC0gc2Vjb25kbGFzdC55O1xufVxucmV0dXJuIEdlc3R1cmVzLmZpcmUodGFyZ2V0LCAndHJhY2snLCB7XG5zdGF0ZTogdGhpcy5pbmZvLnN0YXRlLFxueDogdG91Y2guY2xpZW50WCxcbnk6IHRvdWNoLmNsaWVudFksXG5keDogZHgsXG5keTogZHksXG5kZHg6IGRkeCxcbmRkeTogZGR5LFxuc291cmNlRXZlbnQ6IHRvdWNoLFxuaG92ZXI6IGZ1bmN0aW9uICgpIHtcbnJldHVybiBHZXN0dXJlcy5kZWVwVGFyZ2V0RmluZCh0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKTtcbn1cbn0pO1xufVxufSk7XG5HZXN0dXJlcy5yZWdpc3Rlcih7XG5uYW1lOiAndGFwJyxcbmRlcHM6IFtcbidtb3VzZWRvd24nLFxuJ2NsaWNrJyxcbid0b3VjaHN0YXJ0Jyxcbid0b3VjaGVuZCdcbl0sXG5lbWl0czogWyd0YXAnXSxcbmluZm86IHtcbng6IE5hTixcbnk6IE5hTixcbnByZXZlbnQ6IGZhbHNlXG59LFxucmVzZXQ6IGZ1bmN0aW9uICgpIHtcbnRoaXMuaW5mby54ID0gTmFOO1xudGhpcy5pbmZvLnkgPSBOYU47XG50aGlzLmluZm8ucHJldmVudCA9IGZhbHNlO1xufSxcbnNhdmU6IGZ1bmN0aW9uIChlKSB7XG50aGlzLmluZm8ueCA9IGUuY2xpZW50WDtcbnRoaXMuaW5mby55ID0gZS5jbGllbnRZO1xufSxcbm1vdXNlZG93bjogZnVuY3Rpb24gKGUpIHtcbnRoaXMuc2F2ZShlKTtcbn0sXG5jbGljazogZnVuY3Rpb24gKGUpIHtcbnRoaXMuZm9yd2FyZChlKTtcbn0sXG50b3VjaHN0YXJ0OiBmdW5jdGlvbiAoZSkge1xudGhpcy5zYXZlKGUuY2hhbmdlZFRvdWNoZXNbMF0pO1xufSxcbnRvdWNoZW5kOiBmdW5jdGlvbiAoZSkge1xudGhpcy5mb3J3YXJkKGUuY2hhbmdlZFRvdWNoZXNbMF0pO1xufSxcbmZvcndhcmQ6IGZ1bmN0aW9uIChlKSB7XG52YXIgZHggPSBNYXRoLmFicyhlLmNsaWVudFggLSB0aGlzLmluZm8ueCk7XG52YXIgZHkgPSBNYXRoLmFicyhlLmNsaWVudFkgLSB0aGlzLmluZm8ueSk7XG52YXIgdCA9IEdlc3R1cmVzLmZpbmRPcmlnaW5hbFRhcmdldChlKTtcbmlmIChpc05hTihkeCkgfHwgaXNOYU4oZHkpIHx8IGR4IDw9IFRBUF9ESVNUQU5DRSAmJiBkeSA8PSBUQVBfRElTVEFOQ0UpIHtcbmlmICghdGhpcy5pbmZvLnByZXZlbnQpIHtcbkdlc3R1cmVzLmZpcmUodCwgJ3RhcCcsIHtcbng6IGUuY2xpZW50WCxcbnk6IGUuY2xpZW50WSxcbnNvdXJjZUV2ZW50OiBlXG59KTtcbn1cbn1cbnRoaXMucmVzZXQoKTtcbn1cbn0pO1xudmFyIERJUkVDVElPTl9NQVAgPSB7XG54OiAncGFuLXgnLFxueTogJ3Bhbi15Jyxcbm5vbmU6ICdub25lJyxcbmFsbDogJ2F1dG8nXG59O1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9saXN0ZW46IGZ1bmN0aW9uIChub2RlLCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbmlmIChHZXN0dXJlcy5nZXN0dXJlc1tldmVudE5hbWVdKSB7XG5HZXN0dXJlcy5hZGQobm9kZSwgZXZlbnROYW1lLCBoYW5kbGVyKTtcbn0gZWxzZSB7XG5ub2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyKTtcbn1cbn0sXG5fdW5saXN0ZW46IGZ1bmN0aW9uIChub2RlLCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbmlmIChHZXN0dXJlcy5nZXN0dXJlc1tldmVudE5hbWVdKSB7XG5HZXN0dXJlcy5yZW1vdmUobm9kZSwgZXZlbnROYW1lLCBoYW5kbGVyKTtcbn0gZWxzZSB7XG5ub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyKTtcbn1cbn0sXG5zZXRTY3JvbGxEaXJlY3Rpb246IGZ1bmN0aW9uIChkaXJlY3Rpb24sIG5vZGUpIHtcbm5vZGUgPSBub2RlIHx8IHRoaXM7XG5HZXN0dXJlcy5zZXRUb3VjaEFjdGlvbihub2RlLCBESVJFQ1RJT05fTUFQW2RpcmVjdGlvbl0gfHwgJ2F1dG8nKTtcbn1cbn0pO1xuUG9seW1lci5HZXN0dXJlcyA9IEdlc3R1cmVzO1xufSgpKTtcblBvbHltZXIuQXN5bmMgPSB7XG5fY3VyclZhbDogMCxcbl9sYXN0VmFsOiAwLFxuX2NhbGxiYWNrczogW10sXG5fdHdpZGRsZUNvbnRlbnQ6IDAsXG5fdHdpZGRsZTogZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpLFxucnVuOiBmdW5jdGlvbiAoY2FsbGJhY2ssIHdhaXRUaW1lKSB7XG5pZiAod2FpdFRpbWUgPiAwKSB7XG5yZXR1cm4gfnNldFRpbWVvdXQoY2FsbGJhY2ssIHdhaXRUaW1lKTtcbn0gZWxzZSB7XG50aGlzLl90d2lkZGxlLnRleHRDb250ZW50ID0gdGhpcy5fdHdpZGRsZUNvbnRlbnQrKztcbnRoaXMuX2NhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbnJldHVybiB0aGlzLl9jdXJyVmFsKys7XG59XG59LFxuY2FuY2VsOiBmdW5jdGlvbiAoaGFuZGxlKSB7XG5pZiAoaGFuZGxlIDwgMCkge1xuY2xlYXJUaW1lb3V0KH5oYW5kbGUpO1xufSBlbHNlIHtcbnZhciBpZHggPSBoYW5kbGUgLSB0aGlzLl9sYXN0VmFsO1xuaWYgKGlkeCA+PSAwKSB7XG5pZiAoIXRoaXMuX2NhbGxiYWNrc1tpZHhdKSB7XG50aHJvdyAnaW52YWxpZCBhc3luYyBoYW5kbGU6ICcgKyBoYW5kbGU7XG59XG50aGlzLl9jYWxsYmFja3NbaWR4XSA9IG51bGw7XG59XG59XG59LFxuX2F0RW5kT2ZNaWNyb3Rhc2s6IGZ1bmN0aW9uICgpIHtcbnZhciBsZW4gPSB0aGlzLl9jYWxsYmFja3MubGVuZ3RoO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xudmFyIGNiID0gdGhpcy5fY2FsbGJhY2tzW2ldO1xuaWYgKGNiKSB7XG50cnkge1xuY2IoKTtcbn0gY2F0Y2ggKGUpIHtcbmkrKztcbnRoaXMuX2NhbGxiYWNrcy5zcGxpY2UoMCwgaSk7XG50aGlzLl9sYXN0VmFsICs9IGk7XG50aGlzLl90d2lkZGxlLnRleHRDb250ZW50ID0gdGhpcy5fdHdpZGRsZUNvbnRlbnQrKztcbnRocm93IGU7XG59XG59XG59XG50aGlzLl9jYWxsYmFja3Muc3BsaWNlKDAsIGxlbik7XG50aGlzLl9sYXN0VmFsICs9IGxlbjtcbn1cbn07XG5uZXcgKHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyIHx8IEpzTXV0YXRpb25PYnNlcnZlcikoUG9seW1lci5Bc3luYy5fYXRFbmRPZk1pY3JvdGFzay5iaW5kKFBvbHltZXIuQXN5bmMpKS5vYnNlcnZlKFBvbHltZXIuQXN5bmMuX3R3aWRkbGUsIHsgY2hhcmFjdGVyRGF0YTogdHJ1ZSB9KTtcblBvbHltZXIuRGVib3VuY2UgPSBmdW5jdGlvbiAoKSB7XG52YXIgQXN5bmMgPSBQb2x5bWVyLkFzeW5jO1xudmFyIERlYm91bmNlciA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XG50aGlzLmNvbnRleHQgPSBjb250ZXh0O1xudGhpcy5ib3VuZENvbXBsZXRlID0gdGhpcy5jb21wbGV0ZS5iaW5kKHRoaXMpO1xufTtcbkRlYm91bmNlci5wcm90b3R5cGUgPSB7XG5nbzogZnVuY3Rpb24gKGNhbGxiYWNrLCB3YWl0KSB7XG52YXIgaDtcbnRoaXMuZmluaXNoID0gZnVuY3Rpb24gKCkge1xuQXN5bmMuY2FuY2VsKGgpO1xufTtcbmggPSBBc3luYy5ydW4odGhpcy5ib3VuZENvbXBsZXRlLCB3YWl0KTtcbnRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbn0sXG5zdG9wOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5maW5pc2gpIHtcbnRoaXMuZmluaXNoKCk7XG50aGlzLmZpbmlzaCA9IG51bGw7XG59XG59LFxuY29tcGxldGU6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLmZpbmlzaCkge1xudGhpcy5zdG9wKCk7XG50aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5jb250ZXh0KTtcbn1cbn1cbn07XG5mdW5jdGlvbiBkZWJvdW5jZShkZWJvdW5jZXIsIGNhbGxiYWNrLCB3YWl0KSB7XG5pZiAoZGVib3VuY2VyKSB7XG5kZWJvdW5jZXIuc3RvcCgpO1xufSBlbHNlIHtcbmRlYm91bmNlciA9IG5ldyBEZWJvdW5jZXIodGhpcyk7XG59XG5kZWJvdW5jZXIuZ28oY2FsbGJhY2ssIHdhaXQpO1xucmV0dXJuIGRlYm91bmNlcjtcbn1cbnJldHVybiBkZWJvdW5jZTtcbn0oKTtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG4kJDogZnVuY3Rpb24gKHNsY3RyKSB7XG5yZXR1cm4gUG9seW1lci5kb20odGhpcy5yb290KS5xdWVyeVNlbGVjdG9yKHNsY3RyKTtcbn0sXG50b2dnbGVDbGFzczogZnVuY3Rpb24gKG5hbWUsIGJvb2wsIG5vZGUpIHtcbm5vZGUgPSBub2RlIHx8IHRoaXM7XG5pZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxKSB7XG5ib29sID0gIW5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKG5hbWUpO1xufVxuaWYgKGJvb2wpIHtcblBvbHltZXIuZG9tKG5vZGUpLmNsYXNzTGlzdC5hZGQobmFtZSk7XG59IGVsc2Uge1xuUG9seW1lci5kb20obm9kZSkuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbn1cbn0sXG50b2dnbGVBdHRyaWJ1dGU6IGZ1bmN0aW9uIChuYW1lLCBib29sLCBub2RlKSB7XG5ub2RlID0gbm9kZSB8fCB0aGlzO1xuaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSkge1xuYm9vbCA9ICFub2RlLmhhc0F0dHJpYnV0ZShuYW1lKTtcbn1cbmlmIChib29sKSB7XG5Qb2x5bWVyLmRvbShub2RlKS5zZXRBdHRyaWJ1dGUobmFtZSwgJycpO1xufSBlbHNlIHtcblBvbHltZXIuZG9tKG5vZGUpLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbn1cbn0sXG5jbGFzc0ZvbGxvd3M6IGZ1bmN0aW9uIChuYW1lLCB0b0VsZW1lbnQsIGZyb21FbGVtZW50KSB7XG5pZiAoZnJvbUVsZW1lbnQpIHtcblBvbHltZXIuZG9tKGZyb21FbGVtZW50KS5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xufVxuaWYgKHRvRWxlbWVudCkge1xuUG9seW1lci5kb20odG9FbGVtZW50KS5jbGFzc0xpc3QuYWRkKG5hbWUpO1xufVxufSxcbmF0dHJpYnV0ZUZvbGxvd3M6IGZ1bmN0aW9uIChuYW1lLCB0b0VsZW1lbnQsIGZyb21FbGVtZW50KSB7XG5pZiAoZnJvbUVsZW1lbnQpIHtcblBvbHltZXIuZG9tKGZyb21FbGVtZW50KS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG59XG5pZiAodG9FbGVtZW50KSB7XG5Qb2x5bWVyLmRvbSh0b0VsZW1lbnQpLnNldEF0dHJpYnV0ZShuYW1lLCAnJyk7XG59XG59LFxuZ2V0Q29udGVudENoaWxkTm9kZXM6IGZ1bmN0aW9uIChzbGN0cikge1xucmV0dXJuIFBvbHltZXIuZG9tKFBvbHltZXIuZG9tKHRoaXMucm9vdCkucXVlcnlTZWxlY3RvcihzbGN0ciB8fCAnY29udGVudCcpKS5nZXREaXN0cmlidXRlZE5vZGVzKCk7XG59LFxuZ2V0Q29udGVudENoaWxkcmVuOiBmdW5jdGlvbiAoc2xjdHIpIHtcbnJldHVybiB0aGlzLmdldENvbnRlbnRDaGlsZE5vZGVzKHNsY3RyKS5maWx0ZXIoZnVuY3Rpb24gKG4pIHtcbnJldHVybiBuLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERTtcbn0pO1xufSxcbmZpcmU6IGZ1bmN0aW9uICh0eXBlLCBkZXRhaWwsIG9wdGlvbnMpIHtcbm9wdGlvbnMgPSBvcHRpb25zIHx8IFBvbHltZXIubm9iO1xudmFyIG5vZGUgPSBvcHRpb25zLm5vZGUgfHwgdGhpcztcbnZhciBkZXRhaWwgPSBkZXRhaWwgPT09IG51bGwgfHwgZGV0YWlsID09PSB1bmRlZmluZWQgPyBQb2x5bWVyLm5vYiA6IGRldGFpbDtcbnZhciBidWJibGVzID0gb3B0aW9ucy5idWJibGVzID09PSB1bmRlZmluZWQgPyB0cnVlIDogb3B0aW9ucy5idWJibGVzO1xudmFyIGNhbmNlbGFibGUgPSBCb29sZWFuKG9wdGlvbnMuY2FuY2VsYWJsZSk7XG52YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQodHlwZSwge1xuYnViYmxlczogQm9vbGVhbihidWJibGVzKSxcbmNhbmNlbGFibGU6IGNhbmNlbGFibGUsXG5kZXRhaWw6IGRldGFpbFxufSk7XG5ub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xucmV0dXJuIGV2ZW50O1xufSxcbmFzeW5jOiBmdW5jdGlvbiAoY2FsbGJhY2ssIHdhaXRUaW1lKSB7XG5yZXR1cm4gUG9seW1lci5Bc3luYy5ydW4oY2FsbGJhY2suYmluZCh0aGlzKSwgd2FpdFRpbWUpO1xufSxcbmNhbmNlbEFzeW5jOiBmdW5jdGlvbiAoaGFuZGxlKSB7XG5Qb2x5bWVyLkFzeW5jLmNhbmNlbChoYW5kbGUpO1xufSxcbmFycmF5RGVsZXRlOiBmdW5jdGlvbiAocGF0aCwgaXRlbSkge1xudmFyIGluZGV4O1xuaWYgKEFycmF5LmlzQXJyYXkocGF0aCkpIHtcbmluZGV4ID0gcGF0aC5pbmRleE9mKGl0ZW0pO1xuaWYgKGluZGV4ID49IDApIHtcbnJldHVybiBwYXRoLnNwbGljZShpbmRleCwgMSk7XG59XG59IGVsc2Uge1xudmFyIGFyciA9IHRoaXMuZ2V0KHBhdGgpO1xuaW5kZXggPSBhcnIuaW5kZXhPZihpdGVtKTtcbmlmIChpbmRleCA+PSAwKSB7XG5yZXR1cm4gdGhpcy5zcGxpY2UocGF0aCwgaW5kZXgsIDEpO1xufVxufVxufSxcbnRyYW5zZm9ybTogZnVuY3Rpb24gKHRyYW5zZm9ybSwgbm9kZSkge1xubm9kZSA9IG5vZGUgfHwgdGhpcztcbm5vZGUuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gdHJhbnNmb3JtO1xubm9kZS5zdHlsZS50cmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG59LFxudHJhbnNsYXRlM2Q6IGZ1bmN0aW9uICh4LCB5LCB6LCBub2RlKSB7XG5ub2RlID0gbm9kZSB8fCB0aGlzO1xudGhpcy50cmFuc2Zvcm0oJ3RyYW5zbGF0ZTNkKCcgKyB4ICsgJywnICsgeSArICcsJyArIHogKyAnKScsIG5vZGUpO1xufSxcbmltcG9ydEhyZWY6IGZ1bmN0aW9uIChocmVmLCBvbmxvYWQsIG9uZXJyb3IpIHtcbnZhciBsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xubC5yZWwgPSAnaW1wb3J0JztcbmwuaHJlZiA9IGhyZWY7XG5pZiAob25sb2FkKSB7XG5sLm9ubG9hZCA9IG9ubG9hZC5iaW5kKHRoaXMpO1xufVxuaWYgKG9uZXJyb3IpIHtcbmwub25lcnJvciA9IG9uZXJyb3IuYmluZCh0aGlzKTtcbn1cbmRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobCk7XG5yZXR1cm4gbDtcbn0sXG5jcmVhdGU6IGZ1bmN0aW9uICh0YWcsIHByb3BzKSB7XG52YXIgZWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuaWYgKHByb3BzKSB7XG5mb3IgKHZhciBuIGluIHByb3BzKSB7XG5lbHRbbl0gPSBwcm9wc1tuXTtcbn1cbn1cbnJldHVybiBlbHQ7XG59XG59KTtcblBvbHltZXIuQmluZCA9IHtcbnByZXBhcmVNb2RlbDogZnVuY3Rpb24gKG1vZGVsKSB7XG5tb2RlbC5fcHJvcGVydHlFZmZlY3RzID0ge307XG5tb2RlbC5fYmluZExpc3RlbmVycyA9IFtdO1xuUG9seW1lci5CYXNlLm1peGluKG1vZGVsLCB0aGlzLl9tb2RlbEFwaSk7XG59LFxuX21vZGVsQXBpOiB7XG5fbm90aWZ5Q2hhbmdlOiBmdW5jdGlvbiAocHJvcGVydHkpIHtcbnZhciBldmVudE5hbWUgPSBQb2x5bWVyLkNhc2VNYXAuY2FtZWxUb0Rhc2hDYXNlKHByb3BlcnR5KSArICctY2hhbmdlZCc7XG5Qb2x5bWVyLkJhc2UuZmlyZShldmVudE5hbWUsIHsgdmFsdWU6IHRoaXNbcHJvcGVydHldIH0sIHtcbmJ1YmJsZXM6IGZhbHNlLFxubm9kZTogdGhpc1xufSk7XG59LFxuX3Byb3BlcnR5U2V0dGVyOiBmdW5jdGlvbiAocHJvcGVydHksIHZhbHVlLCBlZmZlY3RzLCBmcm9tQWJvdmUpIHtcbnZhciBvbGQgPSB0aGlzLl9fZGF0YV9fW3Byb3BlcnR5XTtcbmlmIChvbGQgIT09IHZhbHVlICYmIChvbGQgPT09IG9sZCB8fCB2YWx1ZSA9PT0gdmFsdWUpKSB7XG50aGlzLl9fZGF0YV9fW3Byb3BlcnR5XSA9IHZhbHVlO1xuaWYgKHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jykge1xudGhpcy5fY2xlYXJQYXRoKHByb3BlcnR5KTtcbn1cbmlmICh0aGlzLl9wcm9wZXJ0eUNoYW5nZWQpIHtcbnRoaXMuX3Byb3BlcnR5Q2hhbmdlZChwcm9wZXJ0eSwgdmFsdWUsIG9sZCk7XG59XG5pZiAoZWZmZWN0cykge1xudGhpcy5fZWZmZWN0RWZmZWN0cyhwcm9wZXJ0eSwgdmFsdWUsIGVmZmVjdHMsIG9sZCwgZnJvbUFib3ZlKTtcbn1cbn1cbnJldHVybiBvbGQ7XG59LFxuX19zZXRQcm9wZXJ0eTogZnVuY3Rpb24gKHByb3BlcnR5LCB2YWx1ZSwgcXVpZXQsIG5vZGUpIHtcbm5vZGUgPSBub2RlIHx8IHRoaXM7XG52YXIgZWZmZWN0cyA9IG5vZGUuX3Byb3BlcnR5RWZmZWN0cyAmJiBub2RlLl9wcm9wZXJ0eUVmZmVjdHNbcHJvcGVydHldO1xuaWYgKGVmZmVjdHMpIHtcbm5vZGUuX3Byb3BlcnR5U2V0dGVyKHByb3BlcnR5LCB2YWx1ZSwgZWZmZWN0cywgcXVpZXQpO1xufSBlbHNlIHtcbm5vZGVbcHJvcGVydHldID0gdmFsdWU7XG59XG59LFxuX2VmZmVjdEVmZmVjdHM6IGZ1bmN0aW9uIChwcm9wZXJ0eSwgdmFsdWUsIGVmZmVjdHMsIG9sZCwgZnJvbUFib3ZlKSB7XG5lZmZlY3RzLmZvckVhY2goZnVuY3Rpb24gKGZ4KSB7XG52YXIgZm4gPSBQb2x5bWVyLkJpbmRbJ18nICsgZngua2luZCArICdFZmZlY3QnXTtcbmlmIChmbikge1xuZm4uY2FsbCh0aGlzLCBwcm9wZXJ0eSwgdmFsdWUsIGZ4LmVmZmVjdCwgb2xkLCBmcm9tQWJvdmUpO1xufVxufSwgdGhpcyk7XG59LFxuX2NsZWFyUGF0aDogZnVuY3Rpb24gKHBhdGgpIHtcbmZvciAodmFyIHByb3AgaW4gdGhpcy5fX2RhdGFfXykge1xuaWYgKHByb3AuaW5kZXhPZihwYXRoICsgJy4nKSA9PT0gMCkge1xudGhpcy5fX2RhdGFfX1twcm9wXSA9IHVuZGVmaW5lZDtcbn1cbn1cbn1cbn0sXG5lbnN1cmVQcm9wZXJ0eUVmZmVjdHM6IGZ1bmN0aW9uIChtb2RlbCwgcHJvcGVydHkpIHtcbnZhciBmeCA9IG1vZGVsLl9wcm9wZXJ0eUVmZmVjdHNbcHJvcGVydHldO1xuaWYgKCFmeCkge1xuZnggPSBtb2RlbC5fcHJvcGVydHlFZmZlY3RzW3Byb3BlcnR5XSA9IFtdO1xufVxucmV0dXJuIGZ4O1xufSxcbmFkZFByb3BlcnR5RWZmZWN0OiBmdW5jdGlvbiAobW9kZWwsIHByb3BlcnR5LCBraW5kLCBlZmZlY3QpIHtcbnZhciBmeCA9IHRoaXMuZW5zdXJlUHJvcGVydHlFZmZlY3RzKG1vZGVsLCBwcm9wZXJ0eSk7XG5meC5wdXNoKHtcbmtpbmQ6IGtpbmQsXG5lZmZlY3Q6IGVmZmVjdFxufSk7XG59LFxuY3JlYXRlQmluZGluZ3M6IGZ1bmN0aW9uIChtb2RlbCkge1xudmFyIGZ4JCA9IG1vZGVsLl9wcm9wZXJ0eUVmZmVjdHM7XG5pZiAoZngkKSB7XG5mb3IgKHZhciBuIGluIGZ4JCkge1xudmFyIGZ4ID0gZngkW25dO1xuZnguc29ydCh0aGlzLl9zb3J0UHJvcGVydHlFZmZlY3RzKTtcbnRoaXMuX2NyZWF0ZUFjY2Vzc29ycyhtb2RlbCwgbiwgZngpO1xufVxufVxufSxcbl9zb3J0UHJvcGVydHlFZmZlY3RzOiBmdW5jdGlvbiAoKSB7XG52YXIgRUZGRUNUX09SREVSID0ge1xuJ2NvbXB1dGUnOiAwLFxuJ2Fubm90YXRpb24nOiAxLFxuJ2NvbXB1dGVkQW5ub3RhdGlvbic6IDIsXG4ncmVmbGVjdCc6IDMsXG4nbm90aWZ5JzogNCxcbidvYnNlcnZlcic6IDUsXG4nY29tcGxleE9ic2VydmVyJzogNixcbidmdW5jdGlvbic6IDdcbn07XG5yZXR1cm4gZnVuY3Rpb24gKGEsIGIpIHtcbnJldHVybiBFRkZFQ1RfT1JERVJbYS5raW5kXSAtIEVGRkVDVF9PUkRFUltiLmtpbmRdO1xufTtcbn0oKSxcbl9jcmVhdGVBY2Nlc3NvcnM6IGZ1bmN0aW9uIChtb2RlbCwgcHJvcGVydHksIGVmZmVjdHMpIHtcbnZhciBkZWZ1biA9IHtcbmdldDogZnVuY3Rpb24gKCkge1xucmV0dXJuIHRoaXMuX19kYXRhX19bcHJvcGVydHldO1xufVxufTtcbnZhciBzZXR0ZXIgPSBmdW5jdGlvbiAodmFsdWUpIHtcbnRoaXMuX3Byb3BlcnR5U2V0dGVyKHByb3BlcnR5LCB2YWx1ZSwgZWZmZWN0cyk7XG59O1xudmFyIGluZm8gPSBtb2RlbC5nZXRQcm9wZXJ0eUluZm8gJiYgbW9kZWwuZ2V0UHJvcGVydHlJbmZvKHByb3BlcnR5KTtcbmlmIChpbmZvICYmIGluZm8ucmVhZE9ubHkpIHtcbmlmICghaW5mby5jb21wdXRlZCkge1xubW9kZWxbJ19zZXQnICsgdGhpcy51cHBlcihwcm9wZXJ0eSldID0gc2V0dGVyO1xufVxufSBlbHNlIHtcbmRlZnVuLnNldCA9IHNldHRlcjtcbn1cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2RlbCwgcHJvcGVydHksIGRlZnVuKTtcbn0sXG51cHBlcjogZnVuY3Rpb24gKG5hbWUpIHtcbnJldHVybiBuYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnN1YnN0cmluZygxKTtcbn0sXG5fYWRkQW5ub3RhdGVkTGlzdGVuZXI6IGZ1bmN0aW9uIChtb2RlbCwgaW5kZXgsIHByb3BlcnR5LCBwYXRoLCBldmVudCkge1xudmFyIGZuID0gdGhpcy5fbm90ZWRMaXN0ZW5lckZhY3RvcnkocHJvcGVydHksIHBhdGgsIHRoaXMuX2lzU3RydWN0dXJlZChwYXRoKSwgdGhpcy5faXNFdmVudEJvZ3VzKTtcbnZhciBldmVudE5hbWUgPSBldmVudCB8fCBQb2x5bWVyLkNhc2VNYXAuY2FtZWxUb0Rhc2hDYXNlKHByb3BlcnR5KSArICctY2hhbmdlZCc7XG5tb2RlbC5fYmluZExpc3RlbmVycy5wdXNoKHtcbmluZGV4OiBpbmRleCxcbnByb3BlcnR5OiBwcm9wZXJ0eSxcbnBhdGg6IHBhdGgsXG5jaGFuZ2VkRm46IGZuLFxuZXZlbnQ6IGV2ZW50TmFtZVxufSk7XG59LFxuX2lzU3RydWN0dXJlZDogZnVuY3Rpb24gKHBhdGgpIHtcbnJldHVybiBwYXRoLmluZGV4T2YoJy4nKSA+IDA7XG59LFxuX2lzRXZlbnRCb2d1czogZnVuY3Rpb24gKGUsIHRhcmdldCkge1xucmV0dXJuIGUucGF0aCAmJiBlLnBhdGhbMF0gIT09IHRhcmdldDtcbn0sXG5fbm90ZWRMaXN0ZW5lckZhY3Rvcnk6IGZ1bmN0aW9uIChwcm9wZXJ0eSwgcGF0aCwgaXNTdHJ1Y3R1cmVkLCBib2d1c1Rlc3QpIHtcbnJldHVybiBmdW5jdGlvbiAoZSwgdGFyZ2V0KSB7XG5pZiAoIWJvZ3VzVGVzdChlLCB0YXJnZXQpKSB7XG5pZiAoZS5kZXRhaWwgJiYgZS5kZXRhaWwucGF0aCkge1xudGhpcy5ub3RpZnlQYXRoKHRoaXMuX2ZpeFBhdGgocGF0aCwgcHJvcGVydHksIGUuZGV0YWlsLnBhdGgpLCBlLmRldGFpbC52YWx1ZSk7XG59IGVsc2Uge1xudmFyIHZhbHVlID0gdGFyZ2V0W3Byb3BlcnR5XTtcbmlmICghaXNTdHJ1Y3R1cmVkKSB7XG50aGlzW3BhdGhdID0gdGFyZ2V0W3Byb3BlcnR5XTtcbn0gZWxzZSB7XG5pZiAodGhpcy5fX2RhdGFfX1twYXRoXSAhPSB2YWx1ZSkge1xudGhpcy5zZXQocGF0aCwgdmFsdWUpO1xufVxufVxufVxufVxufTtcbn0sXG5wcmVwYXJlSW5zdGFuY2U6IGZ1bmN0aW9uIChpbnN0KSB7XG5pbnN0Ll9fZGF0YV9fID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbn0sXG5zZXR1cEJpbmRMaXN0ZW5lcnM6IGZ1bmN0aW9uIChpbnN0KSB7XG5pbnN0Ll9iaW5kTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGluZm8pIHtcbnZhciBub2RlID0gaW5zdC5fbm9kZXNbaW5mby5pbmRleF07XG5ub2RlLmFkZEV2ZW50TGlzdGVuZXIoaW5mby5ldmVudCwgaW5zdC5fbm90aWZ5TGlzdGVuZXIuYmluZChpbnN0LCBpbmZvLmNoYW5nZWRGbikpO1xufSk7XG59XG59O1xuUG9seW1lci5CYXNlLmV4dGVuZChQb2x5bWVyLkJpbmQsIHtcbl9zaG91bGRBZGRMaXN0ZW5lcjogZnVuY3Rpb24gKGVmZmVjdCkge1xucmV0dXJuIGVmZmVjdC5uYW1lICYmIGVmZmVjdC5tb2RlID09PSAneycgJiYgIWVmZmVjdC5uZWdhdGUgJiYgZWZmZWN0LmtpbmQgIT0gJ2F0dHJpYnV0ZSc7XG59LFxuX2Fubm90YXRpb25FZmZlY3Q6IGZ1bmN0aW9uIChzb3VyY2UsIHZhbHVlLCBlZmZlY3QpIHtcbmlmIChzb3VyY2UgIT0gZWZmZWN0LnZhbHVlKSB7XG52YWx1ZSA9IHRoaXMuZ2V0KGVmZmVjdC52YWx1ZSk7XG50aGlzLl9fZGF0YV9fW2VmZmVjdC52YWx1ZV0gPSB2YWx1ZTtcbn1cbnZhciBjYWxjID0gZWZmZWN0Lm5lZ2F0ZSA/ICF2YWx1ZSA6IHZhbHVlO1xuaWYgKCFlZmZlY3QuY3VzdG9tRXZlbnQgfHwgdGhpcy5fbm9kZXNbZWZmZWN0LmluZGV4XVtlZmZlY3QubmFtZV0gIT09IGNhbGMpIHtcbnJldHVybiB0aGlzLl9hcHBseUVmZmVjdFZhbHVlKGNhbGMsIGVmZmVjdCk7XG59XG59LFxuX3JlZmxlY3RFZmZlY3Q6IGZ1bmN0aW9uIChzb3VyY2UpIHtcbnRoaXMucmVmbGVjdFByb3BlcnR5VG9BdHRyaWJ1dGUoc291cmNlKTtcbn0sXG5fbm90aWZ5RWZmZWN0OiBmdW5jdGlvbiAoc291cmNlLCB2YWx1ZSwgZWZmZWN0LCBvbGQsIGZyb21BYm92ZSkge1xuaWYgKCFmcm9tQWJvdmUpIHtcbnRoaXMuX25vdGlmeUNoYW5nZShzb3VyY2UpO1xufVxufSxcbl9mdW5jdGlvbkVmZmVjdDogZnVuY3Rpb24gKHNvdXJjZSwgdmFsdWUsIGZuLCBvbGQsIGZyb21BYm92ZSkge1xuZm4uY2FsbCh0aGlzLCBzb3VyY2UsIHZhbHVlLCBvbGQsIGZyb21BYm92ZSk7XG59LFxuX29ic2VydmVyRWZmZWN0OiBmdW5jdGlvbiAoc291cmNlLCB2YWx1ZSwgZWZmZWN0LCBvbGQpIHtcbnZhciBmbiA9IHRoaXNbZWZmZWN0Lm1ldGhvZF07XG5pZiAoZm4pIHtcbmZuLmNhbGwodGhpcywgdmFsdWUsIG9sZCk7XG59IGVsc2Uge1xudGhpcy5fd2Fybih0aGlzLl9sb2dmKCdfb2JzZXJ2ZXJFZmZlY3QnLCAnb2JzZXJ2ZXIgbWV0aG9kIGAnICsgZWZmZWN0Lm1ldGhvZCArICdgIG5vdCBkZWZpbmVkJykpO1xufVxufSxcbl9jb21wbGV4T2JzZXJ2ZXJFZmZlY3Q6IGZ1bmN0aW9uIChzb3VyY2UsIHZhbHVlLCBlZmZlY3QpIHtcbnZhciBmbiA9IHRoaXNbZWZmZWN0Lm1ldGhvZF07XG5pZiAoZm4pIHtcbnZhciBhcmdzID0gUG9seW1lci5CaW5kLl9tYXJzaGFsQXJncyh0aGlzLl9fZGF0YV9fLCBlZmZlY3QsIHNvdXJjZSwgdmFsdWUpO1xuaWYgKGFyZ3MpIHtcbmZuLmFwcGx5KHRoaXMsIGFyZ3MpO1xufVxufSBlbHNlIHtcbnRoaXMuX3dhcm4odGhpcy5fbG9nZignX2NvbXBsZXhPYnNlcnZlckVmZmVjdCcsICdvYnNlcnZlciBtZXRob2QgYCcgKyBlZmZlY3QubWV0aG9kICsgJ2Agbm90IGRlZmluZWQnKSk7XG59XG59LFxuX2NvbXB1dGVFZmZlY3Q6IGZ1bmN0aW9uIChzb3VyY2UsIHZhbHVlLCBlZmZlY3QpIHtcbnZhciBhcmdzID0gUG9seW1lci5CaW5kLl9tYXJzaGFsQXJncyh0aGlzLl9fZGF0YV9fLCBlZmZlY3QsIHNvdXJjZSwgdmFsdWUpO1xuaWYgKGFyZ3MpIHtcbnZhciBmbiA9IHRoaXNbZWZmZWN0Lm1ldGhvZF07XG5pZiAoZm4pIHtcbnRoaXMuX19zZXRQcm9wZXJ0eShlZmZlY3QucHJvcGVydHksIGZuLmFwcGx5KHRoaXMsIGFyZ3MpKTtcbn0gZWxzZSB7XG50aGlzLl93YXJuKHRoaXMuX2xvZ2YoJ19jb21wdXRlRWZmZWN0JywgJ2NvbXB1dGUgbWV0aG9kIGAnICsgZWZmZWN0Lm1ldGhvZCArICdgIG5vdCBkZWZpbmVkJykpO1xufVxufVxufSxcbl9hbm5vdGF0ZWRDb21wdXRhdGlvbkVmZmVjdDogZnVuY3Rpb24gKHNvdXJjZSwgdmFsdWUsIGVmZmVjdCkge1xudmFyIGNvbXB1dGVkSG9zdCA9IHRoaXMuX3Jvb3REYXRhSG9zdCB8fCB0aGlzO1xudmFyIGZuID0gY29tcHV0ZWRIb3N0W2VmZmVjdC5tZXRob2RdO1xuaWYgKGZuKSB7XG52YXIgYXJncyA9IFBvbHltZXIuQmluZC5fbWFyc2hhbEFyZ3ModGhpcy5fX2RhdGFfXywgZWZmZWN0LCBzb3VyY2UsIHZhbHVlKTtcbmlmIChhcmdzKSB7XG52YXIgY29tcHV0ZWR2YWx1ZSA9IGZuLmFwcGx5KGNvbXB1dGVkSG9zdCwgYXJncyk7XG5pZiAoZWZmZWN0Lm5lZ2F0ZSkge1xuY29tcHV0ZWR2YWx1ZSA9ICFjb21wdXRlZHZhbHVlO1xufVxudGhpcy5fYXBwbHlFZmZlY3RWYWx1ZShjb21wdXRlZHZhbHVlLCBlZmZlY3QpO1xufVxufSBlbHNlIHtcbmNvbXB1dGVkSG9zdC5fd2Fybihjb21wdXRlZEhvc3QuX2xvZ2YoJ19hbm5vdGF0ZWRDb21wdXRhdGlvbkVmZmVjdCcsICdjb21wdXRlIG1ldGhvZCBgJyArIGVmZmVjdC5tZXRob2QgKyAnYCBub3QgZGVmaW5lZCcpKTtcbn1cbn0sXG5fbWFyc2hhbEFyZ3M6IGZ1bmN0aW9uIChtb2RlbCwgZWZmZWN0LCBwYXRoLCB2YWx1ZSkge1xudmFyIHZhbHVlcyA9IFtdO1xudmFyIGFyZ3MgPSBlZmZlY3QuYXJncztcbmZvciAodmFyIGkgPSAwLCBsID0gYXJncy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbnZhciBhcmcgPSBhcmdzW2ldO1xudmFyIG5hbWUgPSBhcmcubmFtZTtcbnZhciB2O1xuaWYgKGFyZy5saXRlcmFsKSB7XG52ID0gYXJnLnZhbHVlO1xufSBlbHNlIGlmIChhcmcuc3RydWN0dXJlZCkge1xudiA9IFBvbHltZXIuQmFzZS5nZXQobmFtZSwgbW9kZWwpO1xufSBlbHNlIHtcbnYgPSBtb2RlbFtuYW1lXTtcbn1cbmlmIChhcmdzLmxlbmd0aCA+IDEgJiYgdiA9PT0gdW5kZWZpbmVkKSB7XG5yZXR1cm47XG59XG5pZiAoYXJnLndpbGRjYXJkKSB7XG52YXIgYmFzZUNoYW5nZWQgPSBuYW1lLmluZGV4T2YocGF0aCArICcuJykgPT09IDA7XG52YXIgbWF0Y2hlcyA9IGVmZmVjdC50cmlnZ2VyLm5hbWUuaW5kZXhPZihuYW1lKSA9PT0gMCAmJiAhYmFzZUNoYW5nZWQ7XG52YWx1ZXNbaV0gPSB7XG5wYXRoOiBtYXRjaGVzID8gcGF0aCA6IG5hbWUsXG52YWx1ZTogbWF0Y2hlcyA/IHZhbHVlIDogdixcbmJhc2U6IHZcbn07XG59IGVsc2Uge1xudmFsdWVzW2ldID0gdjtcbn1cbn1cbnJldHVybiB2YWx1ZXM7XG59XG59KTtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5fYWRkUHJvcGVydHlFZmZlY3Q6IGZ1bmN0aW9uIChwcm9wZXJ0eSwga2luZCwgZWZmZWN0KSB7XG5Qb2x5bWVyLkJpbmQuYWRkUHJvcGVydHlFZmZlY3QodGhpcywgcHJvcGVydHksIGtpbmQsIGVmZmVjdCk7XG59LFxuX3ByZXBFZmZlY3RzOiBmdW5jdGlvbiAoKSB7XG5Qb2x5bWVyLkJpbmQucHJlcGFyZU1vZGVsKHRoaXMpO1xudGhpcy5fYWRkQW5ub3RhdGlvbkVmZmVjdHModGhpcy5fbm90ZXMpO1xufSxcbl9wcmVwQmluZGluZ3M6IGZ1bmN0aW9uICgpIHtcblBvbHltZXIuQmluZC5jcmVhdGVCaW5kaW5ncyh0aGlzKTtcbn0sXG5fYWRkUHJvcGVydHlFZmZlY3RzOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xuaWYgKHByb3BlcnRpZXMpIHtcbmZvciAodmFyIHAgaW4gcHJvcGVydGllcykge1xudmFyIHByb3AgPSBwcm9wZXJ0aWVzW3BdO1xuaWYgKHByb3Aub2JzZXJ2ZXIpIHtcbnRoaXMuX2FkZE9ic2VydmVyRWZmZWN0KHAsIHByb3Aub2JzZXJ2ZXIpO1xufVxuaWYgKHByb3AuY29tcHV0ZWQpIHtcbnByb3AucmVhZE9ubHkgPSB0cnVlO1xudGhpcy5fYWRkQ29tcHV0ZWRFZmZlY3QocCwgcHJvcC5jb21wdXRlZCk7XG59XG5pZiAocHJvcC5ub3RpZnkpIHtcbnRoaXMuX2FkZFByb3BlcnR5RWZmZWN0KHAsICdub3RpZnknKTtcbn1cbmlmIChwcm9wLnJlZmxlY3RUb0F0dHJpYnV0ZSkge1xudGhpcy5fYWRkUHJvcGVydHlFZmZlY3QocCwgJ3JlZmxlY3QnKTtcbn1cbmlmIChwcm9wLnJlYWRPbmx5KSB7XG5Qb2x5bWVyLkJpbmQuZW5zdXJlUHJvcGVydHlFZmZlY3RzKHRoaXMsIHApO1xufVxufVxufVxufSxcbl9hZGRDb21wdXRlZEVmZmVjdDogZnVuY3Rpb24gKG5hbWUsIGV4cHJlc3Npb24pIHtcbnZhciBzaWcgPSB0aGlzLl9wYXJzZU1ldGhvZChleHByZXNzaW9uKTtcbnNpZy5hcmdzLmZvckVhY2goZnVuY3Rpb24gKGFyZykge1xudGhpcy5fYWRkUHJvcGVydHlFZmZlY3QoYXJnLm1vZGVsLCAnY29tcHV0ZScsIHtcbm1ldGhvZDogc2lnLm1ldGhvZCxcbmFyZ3M6IHNpZy5hcmdzLFxudHJpZ2dlcjogYXJnLFxucHJvcGVydHk6IG5hbWVcbn0pO1xufSwgdGhpcyk7XG59LFxuX2FkZE9ic2VydmVyRWZmZWN0OiBmdW5jdGlvbiAocHJvcGVydHksIG9ic2VydmVyKSB7XG50aGlzLl9hZGRQcm9wZXJ0eUVmZmVjdChwcm9wZXJ0eSwgJ29ic2VydmVyJywge1xubWV0aG9kOiBvYnNlcnZlcixcbnByb3BlcnR5OiBwcm9wZXJ0eVxufSk7XG59LFxuX2FkZENvbXBsZXhPYnNlcnZlckVmZmVjdHM6IGZ1bmN0aW9uIChvYnNlcnZlcnMpIHtcbmlmIChvYnNlcnZlcnMpIHtcbm9ic2VydmVycy5mb3JFYWNoKGZ1bmN0aW9uIChvYnNlcnZlcikge1xudGhpcy5fYWRkQ29tcGxleE9ic2VydmVyRWZmZWN0KG9ic2VydmVyKTtcbn0sIHRoaXMpO1xufVxufSxcbl9hZGRDb21wbGV4T2JzZXJ2ZXJFZmZlY3Q6IGZ1bmN0aW9uIChvYnNlcnZlcikge1xudmFyIHNpZyA9IHRoaXMuX3BhcnNlTWV0aG9kKG9ic2VydmVyKTtcbnNpZy5hcmdzLmZvckVhY2goZnVuY3Rpb24gKGFyZykge1xudGhpcy5fYWRkUHJvcGVydHlFZmZlY3QoYXJnLm1vZGVsLCAnY29tcGxleE9ic2VydmVyJywge1xubWV0aG9kOiBzaWcubWV0aG9kLFxuYXJnczogc2lnLmFyZ3MsXG50cmlnZ2VyOiBhcmdcbn0pO1xufSwgdGhpcyk7XG59LFxuX2FkZEFubm90YXRpb25FZmZlY3RzOiBmdW5jdGlvbiAobm90ZXMpIHtcbnRoaXMuX25vZGVzID0gW107XG5ub3Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub3RlKSB7XG52YXIgaW5kZXggPSB0aGlzLl9ub2Rlcy5wdXNoKG5vdGUpIC0gMTtcbm5vdGUuYmluZGluZ3MuZm9yRWFjaChmdW5jdGlvbiAoYmluZGluZykge1xudGhpcy5fYWRkQW5ub3RhdGlvbkVmZmVjdChiaW5kaW5nLCBpbmRleCk7XG59LCB0aGlzKTtcbn0sIHRoaXMpO1xufSxcbl9hZGRBbm5vdGF0aW9uRWZmZWN0OiBmdW5jdGlvbiAobm90ZSwgaW5kZXgpIHtcbmlmIChQb2x5bWVyLkJpbmQuX3Nob3VsZEFkZExpc3RlbmVyKG5vdGUpKSB7XG5Qb2x5bWVyLkJpbmQuX2FkZEFubm90YXRlZExpc3RlbmVyKHRoaXMsIGluZGV4LCBub3RlLm5hbWUsIG5vdGUudmFsdWUsIG5vdGUuZXZlbnQpO1xufVxuaWYgKG5vdGUuc2lnbmF0dXJlKSB7XG50aGlzLl9hZGRBbm5vdGF0ZWRDb21wdXRhdGlvbkVmZmVjdChub3RlLCBpbmRleCk7XG59IGVsc2Uge1xubm90ZS5pbmRleCA9IGluZGV4O1xudGhpcy5fYWRkUHJvcGVydHlFZmZlY3Qobm90ZS5tb2RlbCwgJ2Fubm90YXRpb24nLCBub3RlKTtcbn1cbn0sXG5fYWRkQW5ub3RhdGVkQ29tcHV0YXRpb25FZmZlY3Q6IGZ1bmN0aW9uIChub3RlLCBpbmRleCkge1xudmFyIHNpZyA9IG5vdGUuc2lnbmF0dXJlO1xuaWYgKHNpZy5zdGF0aWMpIHtcbnRoaXMuX19hZGRBbm5vdGF0ZWRDb21wdXRhdGlvbkVmZmVjdCgnX19zdGF0aWNfXycsIGluZGV4LCBub3RlLCBzaWcsIG51bGwpO1xufSBlbHNlIHtcbnNpZy5hcmdzLmZvckVhY2goZnVuY3Rpb24gKGFyZykge1xuaWYgKCFhcmcubGl0ZXJhbCkge1xudGhpcy5fX2FkZEFubm90YXRlZENvbXB1dGF0aW9uRWZmZWN0KGFyZy5tb2RlbCwgaW5kZXgsIG5vdGUsIHNpZywgYXJnKTtcbn1cbn0sIHRoaXMpO1xufVxufSxcbl9fYWRkQW5ub3RhdGVkQ29tcHV0YXRpb25FZmZlY3Q6IGZ1bmN0aW9uIChwcm9wZXJ0eSwgaW5kZXgsIG5vdGUsIHNpZywgdHJpZ2dlcikge1xudGhpcy5fYWRkUHJvcGVydHlFZmZlY3QocHJvcGVydHksICdhbm5vdGF0ZWRDb21wdXRhdGlvbicsIHtcbmluZGV4OiBpbmRleCxcbmtpbmQ6IG5vdGUua2luZCxcbnByb3BlcnR5OiBub3RlLm5hbWUsXG5uZWdhdGU6IG5vdGUubmVnYXRlLFxubWV0aG9kOiBzaWcubWV0aG9kLFxuYXJnczogc2lnLmFyZ3MsXG50cmlnZ2VyOiB0cmlnZ2VyXG59KTtcbn0sXG5fcGFyc2VNZXRob2Q6IGZ1bmN0aW9uIChleHByZXNzaW9uKSB7XG52YXIgbSA9IGV4cHJlc3Npb24ubWF0Y2goLyhcXHcqKVxcKCguKilcXCkvKTtcbmlmIChtKSB7XG52YXIgc2lnID0ge1xubWV0aG9kOiBtWzFdLFxuc3RhdGljOiB0cnVlXG59O1xuaWYgKG1bMl0udHJpbSgpKSB7XG52YXIgYXJncyA9IG1bMl0ucmVwbGFjZSgvXFxcXCwvZywgJyZjb21tYTsnKS5zcGxpdCgnLCcpO1xucmV0dXJuIHRoaXMuX3BhcnNlQXJncyhhcmdzLCBzaWcpO1xufSBlbHNlIHtcbnNpZy5hcmdzID0gUG9seW1lci5uYXI7XG5yZXR1cm4gc2lnO1xufVxufVxufSxcbl9wYXJzZUFyZ3M6IGZ1bmN0aW9uIChhcmdMaXN0LCBzaWcpIHtcbnNpZy5hcmdzID0gYXJnTGlzdC5tYXAoZnVuY3Rpb24gKHJhd0FyZykge1xudmFyIGFyZyA9IHRoaXMuX3BhcnNlQXJnKHJhd0FyZyk7XG5pZiAoIWFyZy5saXRlcmFsKSB7XG5zaWcuc3RhdGljID0gZmFsc2U7XG59XG5yZXR1cm4gYXJnO1xufSwgdGhpcyk7XG5yZXR1cm4gc2lnO1xufSxcbl9wYXJzZUFyZzogZnVuY3Rpb24gKHJhd0FyZykge1xudmFyIGFyZyA9IHJhd0FyZy50cmltKCkucmVwbGFjZSgvJmNvbW1hOy9nLCAnLCcpLnJlcGxhY2UoL1xcXFwoLikvZywgJyQxJyk7XG52YXIgYSA9IHtcbm5hbWU6IGFyZyxcbm1vZGVsOiB0aGlzLl9tb2RlbEZvclBhdGgoYXJnKVxufTtcbnZhciBmYyA9IGFyZ1swXTtcbmlmIChmYyA+PSAnMCcgJiYgZmMgPD0gJzknKSB7XG5mYyA9ICcjJztcbn1cbnN3aXRjaCAoZmMpIHtcbmNhc2UgJ1xcJyc6XG5jYXNlICdcIic6XG5hLnZhbHVlID0gYXJnLnNsaWNlKDEsIC0xKTtcbmEubGl0ZXJhbCA9IHRydWU7XG5icmVhaztcbmNhc2UgJyMnOlxuYS52YWx1ZSA9IE51bWJlcihhcmcpO1xuYS5saXRlcmFsID0gdHJ1ZTtcbmJyZWFrO1xufVxuaWYgKCFhLmxpdGVyYWwpIHtcbmEuc3RydWN0dXJlZCA9IGFyZy5pbmRleE9mKCcuJykgPiAwO1xuaWYgKGEuc3RydWN0dXJlZCkge1xuYS53aWxkY2FyZCA9IGFyZy5zbGljZSgtMikgPT0gJy4qJztcbmlmIChhLndpbGRjYXJkKSB7XG5hLm5hbWUgPSBhcmcuc2xpY2UoMCwgLTIpO1xufVxufVxufVxucmV0dXJuIGE7XG59LFxuX21hcnNoYWxJbnN0YW5jZUVmZmVjdHM6IGZ1bmN0aW9uICgpIHtcblBvbHltZXIuQmluZC5wcmVwYXJlSW5zdGFuY2UodGhpcyk7XG5Qb2x5bWVyLkJpbmQuc2V0dXBCaW5kTGlzdGVuZXJzKHRoaXMpO1xufSxcbl9hcHBseUVmZmVjdFZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIGluZm8pIHtcbnZhciBub2RlID0gdGhpcy5fbm9kZXNbaW5mby5pbmRleF07XG52YXIgcHJvcGVydHkgPSBpbmZvLnByb3BlcnR5IHx8IGluZm8ubmFtZSB8fCAndGV4dENvbnRlbnQnO1xuaWYgKGluZm8ua2luZCA9PSAnYXR0cmlidXRlJykge1xudGhpcy5zZXJpYWxpemVWYWx1ZVRvQXR0cmlidXRlKHZhbHVlLCBwcm9wZXJ0eSwgbm9kZSk7XG59IGVsc2Uge1xuaWYgKHByb3BlcnR5ID09PSAnY2xhc3NOYW1lJykge1xudmFsdWUgPSB0aGlzLl9zY29wZUVsZW1lbnRDbGFzcyhub2RlLCB2YWx1ZSk7XG59XG5pZiAocHJvcGVydHkgPT09ICd0ZXh0Q29udGVudCcgfHwgbm9kZS5sb2NhbE5hbWUgPT0gJ2lucHV0JyAmJiBwcm9wZXJ0eSA9PSAndmFsdWUnKSB7XG52YWx1ZSA9IHZhbHVlID09IHVuZGVmaW5lZCA/ICcnIDogdmFsdWU7XG59XG5yZXR1cm4gbm9kZVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbn1cbn0sXG5fZXhlY3V0ZVN0YXRpY0VmZmVjdHM6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLl9wcm9wZXJ0eUVmZmVjdHMuX19zdGF0aWNfXykge1xudGhpcy5fZWZmZWN0RWZmZWN0cygnX19zdGF0aWNfXycsIG51bGwsIHRoaXMuX3Byb3BlcnR5RWZmZWN0cy5fX3N0YXRpY19fKTtcbn1cbn1cbn0pO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9zZXR1cENvbmZpZ3VyZTogZnVuY3Rpb24gKGluaXRpYWxDb25maWcpIHtcbnRoaXMuX2NvbmZpZyA9IGluaXRpYWxDb25maWcgfHwge307XG50aGlzLl9oYW5kbGVycyA9IFtdO1xufSxcbl9tYXJzaGFsQXR0cmlidXRlczogZnVuY3Rpb24gKCkge1xudGhpcy5fdGFrZUF0dHJpYnV0ZXNUb01vZGVsKHRoaXMuX2NvbmZpZyk7XG59LFxuX2NvbmZpZ1ZhbHVlOiBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbnRoaXMuX2NvbmZpZ1tuYW1lXSA9IHZhbHVlO1xufSxcbl9iZWZvcmVDbGllbnRzUmVhZHk6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX2NvbmZpZ3VyZSgpO1xufSxcbl9jb25maWd1cmU6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX2NvbmZpZ3VyZUFubm90YXRpb25SZWZlcmVuY2VzKCk7XG50aGlzLl9hYm92ZUNvbmZpZyA9IHRoaXMubWl4aW4oe30sIHRoaXMuX2NvbmZpZyk7XG52YXIgY29uZmlnID0ge307XG50aGlzLmJlaGF2aW9ycy5mb3JFYWNoKGZ1bmN0aW9uIChiKSB7XG50aGlzLl9jb25maWd1cmVQcm9wZXJ0aWVzKGIucHJvcGVydGllcywgY29uZmlnKTtcbn0sIHRoaXMpO1xudGhpcy5fY29uZmlndXJlUHJvcGVydGllcyh0aGlzLnByb3BlcnRpZXMsIGNvbmZpZyk7XG50aGlzLl9taXhpbkNvbmZpZ3VyZShjb25maWcsIHRoaXMuX2Fib3ZlQ29uZmlnKTtcbnRoaXMuX2NvbmZpZyA9IGNvbmZpZztcbnRoaXMuX2Rpc3RyaWJ1dGVDb25maWcodGhpcy5fY29uZmlnKTtcbn0sXG5fY29uZmlndXJlUHJvcGVydGllczogZnVuY3Rpb24gKHByb3BlcnRpZXMsIGNvbmZpZykge1xuZm9yICh2YXIgaSBpbiBwcm9wZXJ0aWVzKSB7XG52YXIgYyA9IHByb3BlcnRpZXNbaV07XG5pZiAoYy52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG52YXIgdmFsdWUgPSBjLnZhbHVlO1xuaWYgKHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nKSB7XG52YWx1ZSA9IHZhbHVlLmNhbGwodGhpcywgdGhpcy5fY29uZmlnKTtcbn1cbmNvbmZpZ1tpXSA9IHZhbHVlO1xufVxufVxufSxcbl9taXhpbkNvbmZpZ3VyZTogZnVuY3Rpb24gKGEsIGIpIHtcbmZvciAodmFyIHByb3AgaW4gYikge1xuaWYgKCF0aGlzLmdldFByb3BlcnR5SW5mbyhwcm9wKS5yZWFkT25seSkge1xuYVtwcm9wXSA9IGJbcHJvcF07XG59XG59XG59LFxuX2Rpc3RyaWJ1dGVDb25maWc6IGZ1bmN0aW9uIChjb25maWcpIHtcbnZhciBmeCQgPSB0aGlzLl9wcm9wZXJ0eUVmZmVjdHM7XG5pZiAoZngkKSB7XG5mb3IgKHZhciBwIGluIGNvbmZpZykge1xudmFyIGZ4ID0gZngkW3BdO1xuaWYgKGZ4KSB7XG5mb3IgKHZhciBpID0gMCwgbCA9IGZ4Lmxlbmd0aCwgeDsgaSA8IGwgJiYgKHggPSBmeFtpXSk7IGkrKykge1xuaWYgKHgua2luZCA9PT0gJ2Fubm90YXRpb24nKSB7XG52YXIgbm9kZSA9IHRoaXMuX25vZGVzW3guZWZmZWN0LmluZGV4XTtcbmlmIChub2RlLl9jb25maWdWYWx1ZSkge1xudmFyIHZhbHVlID0gcCA9PT0geC5lZmZlY3QudmFsdWUgPyBjb25maWdbcF0gOiB0aGlzLmdldCh4LmVmZmVjdC52YWx1ZSwgY29uZmlnKTtcbm5vZGUuX2NvbmZpZ1ZhbHVlKHguZWZmZWN0Lm5hbWUsIHZhbHVlKTtcbn1cbn1cbn1cbn1cbn1cbn1cbn0sXG5fYWZ0ZXJDbGllbnRzUmVhZHk6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX2V4ZWN1dGVTdGF0aWNFZmZlY3RzKCk7XG50aGlzLl9hcHBseUNvbmZpZyh0aGlzLl9jb25maWcsIHRoaXMuX2Fib3ZlQ29uZmlnKTtcbnRoaXMuX2ZsdXNoSGFuZGxlcnMoKTtcbn0sXG5fYXBwbHlDb25maWc6IGZ1bmN0aW9uIChjb25maWcsIGFib3ZlQ29uZmlnKSB7XG5mb3IgKHZhciBuIGluIGNvbmZpZykge1xuaWYgKHRoaXNbbl0gPT09IHVuZGVmaW5lZCkge1xudGhpcy5fX3NldFByb3BlcnR5KG4sIGNvbmZpZ1tuXSwgbiBpbiBhYm92ZUNvbmZpZyk7XG59XG59XG59LFxuX25vdGlmeUxpc3RlbmVyOiBmdW5jdGlvbiAoZm4sIGUpIHtcbmlmICghdGhpcy5fY2xpZW50c1JlYWRpZWQpIHtcbnRoaXMuX3F1ZXVlSGFuZGxlcihbXG5mbixcbmUsXG5lLnRhcmdldFxuXSk7XG59IGVsc2Uge1xucmV0dXJuIGZuLmNhbGwodGhpcywgZSwgZS50YXJnZXQpO1xufVxufSxcbl9xdWV1ZUhhbmRsZXI6IGZ1bmN0aW9uIChhcmdzKSB7XG50aGlzLl9oYW5kbGVycy5wdXNoKGFyZ3MpO1xufSxcbl9mbHVzaEhhbmRsZXJzOiBmdW5jdGlvbiAoKSB7XG52YXIgaCQgPSB0aGlzLl9oYW5kbGVycztcbmZvciAodmFyIGkgPSAwLCBsID0gaCQubGVuZ3RoLCBoOyBpIDwgbCAmJiAoaCA9IGgkW2ldKTsgaSsrKSB7XG5oWzBdLmNhbGwodGhpcywgaFsxXSwgaFsyXSk7XG59XG59XG59KTtcbihmdW5jdGlvbiAoKSB7XG4ndXNlIHN0cmljdCc7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xubm90aWZ5UGF0aDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlLCBmcm9tQWJvdmUpIHtcbnZhciBvbGQgPSB0aGlzLl9wcm9wZXJ0eVNldHRlcihwYXRoLCB2YWx1ZSk7XG5pZiAob2xkICE9PSB2YWx1ZSAmJiAob2xkID09PSBvbGQgfHwgdmFsdWUgPT09IHZhbHVlKSkge1xudGhpcy5fcGF0aEVmZmVjdG9yKHBhdGgsIHZhbHVlKTtcbmlmICghZnJvbUFib3ZlKSB7XG50aGlzLl9ub3RpZnlQYXRoKHBhdGgsIHZhbHVlKTtcbn1cbnJldHVybiB0cnVlO1xufVxufSxcbl9nZXRQYXRoUGFydHM6IGZ1bmN0aW9uIChwYXRoKSB7XG5pZiAoQXJyYXkuaXNBcnJheShwYXRoKSkge1xudmFyIHBhcnRzID0gW107XG5mb3IgKHZhciBpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbnZhciBhcmdzID0gcGF0aFtpXS50b1N0cmluZygpLnNwbGl0KCcuJyk7XG5mb3IgKHZhciBqID0gMDsgaiA8IGFyZ3MubGVuZ3RoOyBqKyspIHtcbnBhcnRzLnB1c2goYXJnc1tqXSk7XG59XG59XG5yZXR1cm4gcGFydHM7XG59IGVsc2Uge1xucmV0dXJuIHBhdGgudG9TdHJpbmcoKS5zcGxpdCgnLicpO1xufVxufSxcbnNldDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlLCByb290KSB7XG52YXIgcHJvcCA9IHJvb3QgfHwgdGhpcztcbnZhciBwYXJ0cyA9IHRoaXMuX2dldFBhdGhQYXJ0cyhwYXRoKTtcbnZhciBhcnJheTtcbnZhciBsYXN0ID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV07XG5pZiAocGFydHMubGVuZ3RoID4gMSkge1xuZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGggLSAxOyBpKyspIHtcbnByb3AgPSBwcm9wW3BhcnRzW2ldXTtcbmlmIChhcnJheSkge1xucGFydHNbaV0gPSBQb2x5bWVyLkNvbGxlY3Rpb24uZ2V0KGFycmF5KS5nZXRLZXkocHJvcCk7XG59XG5pZiAoIXByb3ApIHtcbnJldHVybjtcbn1cbmFycmF5ID0gQXJyYXkuaXNBcnJheShwcm9wKSA/IHByb3AgOiBudWxsO1xufVxuaWYgKGFycmF5KSB7XG52YXIgY29sbCA9IFBvbHltZXIuQ29sbGVjdGlvbi5nZXQoYXJyYXkpO1xudmFyIG9sZCA9IHByb3BbbGFzdF07XG52YXIga2V5ID0gY29sbC5nZXRLZXkob2xkKTtcbmlmIChrZXkpIHtcbnBhcnRzW2ldID0ga2V5O1xuY29sbC5zZXRJdGVtKGtleSwgdmFsdWUpO1xufVxufVxucHJvcFtsYXN0XSA9IHZhbHVlO1xuaWYgKCFyb290KSB7XG50aGlzLm5vdGlmeVBhdGgocGFydHMuam9pbignLicpLCB2YWx1ZSk7XG59XG59IGVsc2Uge1xucHJvcFtwYXRoXSA9IHZhbHVlO1xufVxufSxcbmdldDogZnVuY3Rpb24gKHBhdGgsIHJvb3QpIHtcbnZhciBwcm9wID0gcm9vdCB8fCB0aGlzO1xudmFyIHBhcnRzID0gdGhpcy5fZ2V0UGF0aFBhcnRzKHBhdGgpO1xudmFyIGxhc3QgPSBwYXJ0cy5wb3AoKTtcbndoaWxlIChwYXJ0cy5sZW5ndGgpIHtcbnByb3AgPSBwcm9wW3BhcnRzLnNoaWZ0KCldO1xuaWYgKCFwcm9wKSB7XG5yZXR1cm47XG59XG59XG5yZXR1cm4gcHJvcFtsYXN0XTtcbn0sXG5fcGF0aEVmZmVjdG9yOiBmdW5jdGlvbiAocGF0aCwgdmFsdWUpIHtcbnZhciBtb2RlbCA9IHRoaXMuX21vZGVsRm9yUGF0aChwYXRoKTtcbnZhciBmeCQgPSB0aGlzLl9wcm9wZXJ0eUVmZmVjdHNbbW9kZWxdO1xuaWYgKGZ4JCkge1xuZngkLmZvckVhY2goZnVuY3Rpb24gKGZ4KSB7XG52YXIgZnhGbiA9IHRoaXNbJ18nICsgZngua2luZCArICdQYXRoRWZmZWN0J107XG5pZiAoZnhGbikge1xuZnhGbi5jYWxsKHRoaXMsIHBhdGgsIHZhbHVlLCBmeC5lZmZlY3QpO1xufVxufSwgdGhpcyk7XG59XG5pZiAodGhpcy5fYm91bmRQYXRocykge1xudGhpcy5fbm90aWZ5Qm91bmRQYXRocyhwYXRoLCB2YWx1ZSk7XG59XG59LFxuX2Fubm90YXRpb25QYXRoRWZmZWN0OiBmdW5jdGlvbiAocGF0aCwgdmFsdWUsIGVmZmVjdCkge1xuaWYgKGVmZmVjdC52YWx1ZSA9PT0gcGF0aCB8fCBlZmZlY3QudmFsdWUuaW5kZXhPZihwYXRoICsgJy4nKSA9PT0gMCkge1xuUG9seW1lci5CaW5kLl9hbm5vdGF0aW9uRWZmZWN0LmNhbGwodGhpcywgcGF0aCwgdmFsdWUsIGVmZmVjdCk7XG59IGVsc2UgaWYgKHBhdGguaW5kZXhPZihlZmZlY3QudmFsdWUgKyAnLicpID09PSAwICYmICFlZmZlY3QubmVnYXRlKSB7XG52YXIgbm9kZSA9IHRoaXMuX25vZGVzW2VmZmVjdC5pbmRleF07XG5pZiAobm9kZSAmJiBub2RlLm5vdGlmeVBhdGgpIHtcbnZhciBwID0gdGhpcy5fZml4UGF0aChlZmZlY3QubmFtZSwgZWZmZWN0LnZhbHVlLCBwYXRoKTtcbm5vZGUubm90aWZ5UGF0aChwLCB2YWx1ZSwgdHJ1ZSk7XG59XG59XG59LFxuX2NvbXBsZXhPYnNlcnZlclBhdGhFZmZlY3Q6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSwgZWZmZWN0KSB7XG5pZiAodGhpcy5fcGF0aE1hdGNoZXNFZmZlY3QocGF0aCwgZWZmZWN0KSkge1xuUG9seW1lci5CaW5kLl9jb21wbGV4T2JzZXJ2ZXJFZmZlY3QuY2FsbCh0aGlzLCBwYXRoLCB2YWx1ZSwgZWZmZWN0KTtcbn1cbn0sXG5fY29tcHV0ZVBhdGhFZmZlY3Q6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSwgZWZmZWN0KSB7XG5pZiAodGhpcy5fcGF0aE1hdGNoZXNFZmZlY3QocGF0aCwgZWZmZWN0KSkge1xuUG9seW1lci5CaW5kLl9jb21wdXRlRWZmZWN0LmNhbGwodGhpcywgcGF0aCwgdmFsdWUsIGVmZmVjdCk7XG59XG59LFxuX2Fubm90YXRlZENvbXB1dGF0aW9uUGF0aEVmZmVjdDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlLCBlZmZlY3QpIHtcbmlmICh0aGlzLl9wYXRoTWF0Y2hlc0VmZmVjdChwYXRoLCBlZmZlY3QpKSB7XG5Qb2x5bWVyLkJpbmQuX2Fubm90YXRlZENvbXB1dGF0aW9uRWZmZWN0LmNhbGwodGhpcywgcGF0aCwgdmFsdWUsIGVmZmVjdCk7XG59XG59LFxuX3BhdGhNYXRjaGVzRWZmZWN0OiBmdW5jdGlvbiAocGF0aCwgZWZmZWN0KSB7XG52YXIgZWZmZWN0QXJnID0gZWZmZWN0LnRyaWdnZXIubmFtZTtcbnJldHVybiBlZmZlY3RBcmcgPT0gcGF0aCB8fCBlZmZlY3RBcmcuaW5kZXhPZihwYXRoICsgJy4nKSA9PT0gMCB8fCBlZmZlY3QudHJpZ2dlci53aWxkY2FyZCAmJiBwYXRoLmluZGV4T2YoZWZmZWN0QXJnKSA9PT0gMDtcbn0sXG5saW5rUGF0aHM6IGZ1bmN0aW9uICh0bywgZnJvbSkge1xudGhpcy5fYm91bmRQYXRocyA9IHRoaXMuX2JvdW5kUGF0aHMgfHwge307XG5pZiAoZnJvbSkge1xudGhpcy5fYm91bmRQYXRoc1t0b10gPSBmcm9tO1xufSBlbHNlIHtcbnRoaXMudW5iaW5kUGF0aCh0byk7XG59XG59LFxudW5saW5rUGF0aHM6IGZ1bmN0aW9uIChwYXRoKSB7XG5pZiAodGhpcy5fYm91bmRQYXRocykge1xuZGVsZXRlIHRoaXMuX2JvdW5kUGF0aHNbcGF0aF07XG59XG59LFxuX25vdGlmeUJvdW5kUGF0aHM6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSkge1xudmFyIGZyb20sIHRvO1xuZm9yICh2YXIgYSBpbiB0aGlzLl9ib3VuZFBhdGhzKSB7XG52YXIgYiA9IHRoaXMuX2JvdW5kUGF0aHNbYV07XG5pZiAocGF0aC5pbmRleE9mKGEgKyAnLicpID09IDApIHtcbmZyb20gPSBhO1xudG8gPSBiO1xuYnJlYWs7XG59XG5pZiAocGF0aC5pbmRleE9mKGIgKyAnLicpID09IDApIHtcbmZyb20gPSBiO1xudG8gPSBhO1xuYnJlYWs7XG59XG59XG5pZiAoZnJvbSAmJiB0bykge1xudmFyIHAgPSB0aGlzLl9maXhQYXRoKHRvLCBmcm9tLCBwYXRoKTtcbnRoaXMubm90aWZ5UGF0aChwLCB2YWx1ZSk7XG59XG59LFxuX2ZpeFBhdGg6IGZ1bmN0aW9uIChwcm9wZXJ0eSwgcm9vdCwgcGF0aCkge1xucmV0dXJuIHByb3BlcnR5ICsgcGF0aC5zbGljZShyb290Lmxlbmd0aCk7XG59LFxuX25vdGlmeVBhdGg6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSkge1xudmFyIHJvb3ROYW1lID0gdGhpcy5fbW9kZWxGb3JQYXRoKHBhdGgpO1xudmFyIGRhc2hDYXNlTmFtZSA9IFBvbHltZXIuQ2FzZU1hcC5jYW1lbFRvRGFzaENhc2Uocm9vdE5hbWUpO1xudmFyIGV2ZW50TmFtZSA9IGRhc2hDYXNlTmFtZSArIHRoaXMuX0VWRU5UX0NIQU5HRUQ7XG50aGlzLmZpcmUoZXZlbnROYW1lLCB7XG5wYXRoOiBwYXRoLFxudmFsdWU6IHZhbHVlXG59LCB7IGJ1YmJsZXM6IGZhbHNlIH0pO1xufSxcbl9tb2RlbEZvclBhdGg6IGZ1bmN0aW9uIChwYXRoKSB7XG52YXIgZG90ID0gcGF0aC5pbmRleE9mKCcuJyk7XG5yZXR1cm4gZG90IDwgMCA/IHBhdGggOiBwYXRoLnNsaWNlKDAsIGRvdCk7XG59LFxuX0VWRU5UX0NIQU5HRUQ6ICctY2hhbmdlZCcsXG5fbm90aWZ5U3BsaWNlOiBmdW5jdGlvbiAoYXJyYXksIHBhdGgsIGluZGV4LCBhZGRlZCwgcmVtb3ZlZCkge1xudmFyIHNwbGljZXMgPSBbe1xuaW5kZXg6IGluZGV4LFxuYWRkZWRDb3VudDogYWRkZWQsXG5yZW1vdmVkOiByZW1vdmVkLFxub2JqZWN0OiBhcnJheSxcbnR5cGU6ICdzcGxpY2UnXG59XTtcbnZhciBjaGFuZ2UgPSB7XG5rZXlTcGxpY2VzOiBQb2x5bWVyLkNvbGxlY3Rpb24uYXBwbHlTcGxpY2VzKGFycmF5LCBzcGxpY2VzKSxcbmluZGV4U3BsaWNlczogc3BsaWNlc1xufTtcbnRoaXMuc2V0KHBhdGggKyAnLnNwbGljZXMnLCBjaGFuZ2UpO1xuaWYgKGFkZGVkICE9IHJlbW92ZWQubGVuZ3RoKSB7XG50aGlzLm5vdGlmeVBhdGgocGF0aCArICcubGVuZ3RoJywgYXJyYXkubGVuZ3RoKTtcbn1cbmNoYW5nZS5rZXlTcGxpY2VzID0gbnVsbDtcbmNoYW5nZS5pbmRleFNwbGljZXMgPSBudWxsO1xufSxcbnB1c2g6IGZ1bmN0aW9uIChwYXRoKSB7XG52YXIgYXJyYXkgPSB0aGlzLmdldChwYXRoKTtcbnZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbnZhciBsZW4gPSBhcnJheS5sZW5ndGg7XG52YXIgcmV0ID0gYXJyYXkucHVzaC5hcHBseShhcnJheSwgYXJncyk7XG50aGlzLl9ub3RpZnlTcGxpY2UoYXJyYXksIHBhdGgsIGxlbiwgYXJncy5sZW5ndGgsIFtdKTtcbnJldHVybiByZXQ7XG59LFxucG9wOiBmdW5jdGlvbiAocGF0aCkge1xudmFyIGFycmF5ID0gdGhpcy5nZXQocGF0aCk7XG52YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG52YXIgcmVtID0gYXJyYXkuc2xpY2UoLTEpO1xudmFyIHJldCA9IGFycmF5LnBvcC5hcHBseShhcnJheSwgYXJncyk7XG50aGlzLl9ub3RpZnlTcGxpY2UoYXJyYXksIHBhdGgsIGFycmF5Lmxlbmd0aCwgMCwgcmVtKTtcbnJldHVybiByZXQ7XG59LFxuc3BsaWNlOiBmdW5jdGlvbiAocGF0aCwgc3RhcnQsIGRlbGV0ZUNvdW50KSB7XG52YXIgYXJyYXkgPSB0aGlzLmdldChwYXRoKTtcbnZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbnZhciByZXQgPSBhcnJheS5zcGxpY2UuYXBwbHkoYXJyYXksIGFyZ3MpO1xudGhpcy5fbm90aWZ5U3BsaWNlKGFycmF5LCBwYXRoLCBzdGFydCwgYXJncy5sZW5ndGggLSAyLCByZXQpO1xucmV0dXJuIHJldDtcbn0sXG5zaGlmdDogZnVuY3Rpb24gKHBhdGgpIHtcbnZhciBhcnJheSA9IHRoaXMuZ2V0KHBhdGgpO1xudmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xudmFyIHJldCA9IGFycmF5LnNoaWZ0LmFwcGx5KGFycmF5LCBhcmdzKTtcbnRoaXMuX25vdGlmeVNwbGljZShhcnJheSwgcGF0aCwgMCwgMCwgW3JldF0pO1xucmV0dXJuIHJldDtcbn0sXG51bnNoaWZ0OiBmdW5jdGlvbiAocGF0aCkge1xudmFyIGFycmF5ID0gdGhpcy5nZXQocGF0aCk7XG52YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG52YXIgcmV0ID0gYXJyYXkudW5zaGlmdC5hcHBseShhcnJheSwgYXJncyk7XG50aGlzLl9ub3RpZnlTcGxpY2UoYXJyYXksIHBhdGgsIDAsIGFyZ3MubGVuZ3RoLCBbXSk7XG5yZXR1cm4gcmV0O1xufVxufSk7XG59KCkpO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbnJlc29sdmVVcmw6IGZ1bmN0aW9uICh1cmwpIHtcbnZhciBtb2R1bGUgPSBQb2x5bWVyLkRvbU1vZHVsZS5pbXBvcnQodGhpcy5pcyk7XG52YXIgcm9vdCA9ICcnO1xuaWYgKG1vZHVsZSkge1xudmFyIGFzc2V0UGF0aCA9IG1vZHVsZS5nZXRBdHRyaWJ1dGUoJ2Fzc2V0cGF0aCcpIHx8ICcnO1xucm9vdCA9IFBvbHltZXIuUmVzb2x2ZVVybC5yZXNvbHZlVXJsKGFzc2V0UGF0aCwgbW9kdWxlLm93bmVyRG9jdW1lbnQuYmFzZVVSSSk7XG59XG5yZXR1cm4gUG9seW1lci5SZXNvbHZlVXJsLnJlc29sdmVVcmwodXJsLCByb290KTtcbn1cbn0pO1xuUG9seW1lci5Dc3NQYXJzZSA9IGZ1bmN0aW9uICgpIHtcbnZhciBhcGkgPSB7XG5wYXJzZTogZnVuY3Rpb24gKHRleHQpIHtcbnRleHQgPSB0aGlzLl9jbGVhbih0ZXh0KTtcbnJldHVybiB0aGlzLl9wYXJzZUNzcyh0aGlzLl9sZXgodGV4dCksIHRleHQpO1xufSxcbl9jbGVhbjogZnVuY3Rpb24gKGNzc1RleHQpIHtcbnJldHVybiBjc3NUZXh0LnJlcGxhY2UocnguY29tbWVudHMsICcnKS5yZXBsYWNlKHJ4LnBvcnQsICcnKTtcbn0sXG5fbGV4OiBmdW5jdGlvbiAodGV4dCkge1xudmFyIHJvb3QgPSB7XG5zdGFydDogMCxcbmVuZDogdGV4dC5sZW5ndGhcbn07XG52YXIgbiA9IHJvb3Q7XG5mb3IgKHZhciBpID0gMCwgcyA9IDAsIGwgPSB0ZXh0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuc3dpdGNoICh0ZXh0W2ldKSB7XG5jYXNlIHRoaXMuT1BFTl9CUkFDRTpcbmlmICghbi5ydWxlcykge1xubi5ydWxlcyA9IFtdO1xufVxudmFyIHAgPSBuO1xudmFyIHByZXZpb3VzID0gcC5ydWxlc1twLnJ1bGVzLmxlbmd0aCAtIDFdO1xubiA9IHtcbnN0YXJ0OiBpICsgMSxcbnBhcmVudDogcCxcbnByZXZpb3VzOiBwcmV2aW91c1xufTtcbnAucnVsZXMucHVzaChuKTtcbmJyZWFrO1xuY2FzZSB0aGlzLkNMT1NFX0JSQUNFOlxubi5lbmQgPSBpICsgMTtcbm4gPSBuLnBhcmVudCB8fCByb290O1xuYnJlYWs7XG59XG59XG5yZXR1cm4gcm9vdDtcbn0sXG5fcGFyc2VDc3M6IGZ1bmN0aW9uIChub2RlLCB0ZXh0KSB7XG52YXIgdCA9IHRleHQuc3Vic3RyaW5nKG5vZGUuc3RhcnQsIG5vZGUuZW5kIC0gMSk7XG5ub2RlLnBhcnNlZENzc1RleHQgPSBub2RlLmNzc1RleHQgPSB0LnRyaW0oKTtcbmlmIChub2RlLnBhcmVudCkge1xudmFyIHNzID0gbm9kZS5wcmV2aW91cyA/IG5vZGUucHJldmlvdXMuZW5kIDogbm9kZS5wYXJlbnQuc3RhcnQ7XG50ID0gdGV4dC5zdWJzdHJpbmcoc3MsIG5vZGUuc3RhcnQgLSAxKTtcbnQgPSB0LnN1YnN0cmluZyh0Lmxhc3RJbmRleE9mKCc7JykgKyAxKTtcbnZhciBzID0gbm9kZS5wYXJzZWRTZWxlY3RvciA9IG5vZGUuc2VsZWN0b3IgPSB0LnRyaW0oKTtcbm5vZGUuYXRSdWxlID0gcy5pbmRleE9mKEFUX1NUQVJUKSA9PT0gMDtcbmlmIChub2RlLmF0UnVsZSkge1xuaWYgKHMuaW5kZXhPZihNRURJQV9TVEFSVCkgPT09IDApIHtcbm5vZGUudHlwZSA9IHRoaXMudHlwZXMuTUVESUFfUlVMRTtcbn0gZWxzZSBpZiAocy5tYXRjaChyeC5rZXlmcmFtZXNSdWxlKSkge1xubm9kZS50eXBlID0gdGhpcy50eXBlcy5LRVlGUkFNRVNfUlVMRTtcbn1cbn0gZWxzZSB7XG5pZiAocy5pbmRleE9mKFZBUl9TVEFSVCkgPT09IDApIHtcbm5vZGUudHlwZSA9IHRoaXMudHlwZXMuTUlYSU5fUlVMRTtcbn0gZWxzZSB7XG5ub2RlLnR5cGUgPSB0aGlzLnR5cGVzLlNUWUxFX1JVTEU7XG59XG59XG59XG52YXIgciQgPSBub2RlLnJ1bGVzO1xuaWYgKHIkKSB7XG5mb3IgKHZhciBpID0gMCwgbCA9IHIkLmxlbmd0aCwgcjsgaSA8IGwgJiYgKHIgPSByJFtpXSk7IGkrKykge1xudGhpcy5fcGFyc2VDc3MociwgdGV4dCk7XG59XG59XG5yZXR1cm4gbm9kZTtcbn0sXG5zdHJpbmdpZnk6IGZ1bmN0aW9uIChub2RlLCBwcmVzZXJ2ZVByb3BlcnRpZXMsIHRleHQpIHtcbnRleHQgPSB0ZXh0IHx8ICcnO1xudmFyIGNzc1RleHQgPSAnJztcbmlmIChub2RlLmNzc1RleHQgfHwgbm9kZS5ydWxlcykge1xudmFyIHIkID0gbm9kZS5ydWxlcztcbmlmIChyJCAmJiAocHJlc2VydmVQcm9wZXJ0aWVzIHx8ICFoYXNNaXhpblJ1bGVzKHIkKSkpIHtcbmZvciAodmFyIGkgPSAwLCBsID0gciQubGVuZ3RoLCByOyBpIDwgbCAmJiAociA9IHIkW2ldKTsgaSsrKSB7XG5jc3NUZXh0ID0gdGhpcy5zdHJpbmdpZnkociwgcHJlc2VydmVQcm9wZXJ0aWVzLCBjc3NUZXh0KTtcbn1cbn0gZWxzZSB7XG5jc3NUZXh0ID0gcHJlc2VydmVQcm9wZXJ0aWVzID8gbm9kZS5jc3NUZXh0IDogcmVtb3ZlQ3VzdG9tUHJvcHMobm9kZS5jc3NUZXh0KTtcbmNzc1RleHQgPSBjc3NUZXh0LnRyaW0oKTtcbmlmIChjc3NUZXh0KSB7XG5jc3NUZXh0ID0gJyAgJyArIGNzc1RleHQgKyAnXFxuJztcbn1cbn1cbn1cbmlmIChjc3NUZXh0KSB7XG5pZiAobm9kZS5zZWxlY3Rvcikge1xudGV4dCArPSBub2RlLnNlbGVjdG9yICsgJyAnICsgdGhpcy5PUEVOX0JSQUNFICsgJ1xcbic7XG59XG50ZXh0ICs9IGNzc1RleHQ7XG5pZiAobm9kZS5zZWxlY3Rvcikge1xudGV4dCArPSB0aGlzLkNMT1NFX0JSQUNFICsgJ1xcblxcbic7XG59XG59XG5yZXR1cm4gdGV4dDtcbn0sXG50eXBlczoge1xuU1RZTEVfUlVMRTogMSxcbktFWUZSQU1FU19SVUxFOiA3LFxuTUVESUFfUlVMRTogNCxcbk1JWElOX1JVTEU6IDEwMDBcbn0sXG5PUEVOX0JSQUNFOiAneycsXG5DTE9TRV9CUkFDRTogJ30nXG59O1xuZnVuY3Rpb24gaGFzTWl4aW5SdWxlcyhydWxlcykge1xucmV0dXJuIHJ1bGVzWzBdLnNlbGVjdG9yLmluZGV4T2YoVkFSX1NUQVJUKSA+PSAwO1xufVxuZnVuY3Rpb24gcmVtb3ZlQ3VzdG9tUHJvcHMoY3NzVGV4dCkge1xucmV0dXJuIGNzc1RleHQucmVwbGFjZShyeC5jdXN0b21Qcm9wLCAnJykucmVwbGFjZShyeC5taXhpblByb3AsICcnKS5yZXBsYWNlKHJ4Lm1peGluQXBwbHksICcnKS5yZXBsYWNlKHJ4LnZhckFwcGx5LCAnJyk7XG59XG52YXIgVkFSX1NUQVJUID0gJy0tJztcbnZhciBNRURJQV9TVEFSVCA9ICdAbWVkaWEnO1xudmFyIEFUX1NUQVJUID0gJ0AnO1xudmFyIHJ4ID0ge1xuY29tbWVudHM6IC9cXC9cXCpbXipdKlxcKisoW15cXC8qXVteKl0qXFwqKykqXFwvL2dpbSxcbnBvcnQ6IC9AaW1wb3J0W147XSo7L2dpbSxcbmN1c3RvbVByb3A6IC8oPzpefFtcXHM7XSktLVteO3tdKj86W157fTtdKj8oPzpbO1xcbl18JCkvZ2ltLFxubWl4aW5Qcm9wOiAvKD86XnxbXFxzO10pLS1bXjt7XSo/OlteeztdKj97W159XSo/fSg/Ols7XFxuXXwkKT8vZ2ltLFxubWl4aW5BcHBseTogL0BhcHBseVtcXHNdKlxcKFteKV0qP1xcKVtcXHNdKig/Ols7XFxuXXwkKT8vZ2ltLFxudmFyQXBwbHk6IC9bXjs6XSo/OlteO10qdmFyW147XSooPzpbO1xcbl18JCk/L2dpbSxcbmtleWZyYW1lc1J1bGU6IC9eQFteXFxzXSprZXlmcmFtZXMvXG59O1xucmV0dXJuIGFwaTtcbn0oKTtcblBvbHltZXIuU3R5bGVVdGlsID0gZnVuY3Rpb24gKCkge1xucmV0dXJuIHtcbk1PRFVMRV9TVFlMRVNfU0VMRUNUT1I6ICdzdHlsZSwgbGlua1tyZWw9aW1wb3J0XVt0eXBlfj1jc3NdJyxcbnRvQ3NzVGV4dDogZnVuY3Rpb24gKHJ1bGVzLCBjYWxsYmFjaywgcHJlc2VydmVQcm9wZXJ0aWVzKSB7XG5pZiAodHlwZW9mIHJ1bGVzID09PSAnc3RyaW5nJykge1xucnVsZXMgPSB0aGlzLnBhcnNlci5wYXJzZShydWxlcyk7XG59XG5pZiAoY2FsbGJhY2spIHtcbnRoaXMuZm9yRWFjaFN0eWxlUnVsZShydWxlcywgY2FsbGJhY2spO1xufVxucmV0dXJuIHRoaXMucGFyc2VyLnN0cmluZ2lmeShydWxlcywgcHJlc2VydmVQcm9wZXJ0aWVzKTtcbn0sXG5mb3JSdWxlc0luU3R5bGVzOiBmdW5jdGlvbiAoc3R5bGVzLCBjYWxsYmFjaykge1xuZm9yICh2YXIgaSA9IDAsIGwgPSBzdHlsZXMubGVuZ3RoLCBzOyBpIDwgbCAmJiAocyA9IHN0eWxlc1tpXSk7IGkrKykge1xudGhpcy5mb3JFYWNoU3R5bGVSdWxlKHRoaXMucnVsZXNGb3JTdHlsZShzKSwgY2FsbGJhY2spO1xufVxufSxcbnJ1bGVzRm9yU3R5bGU6IGZ1bmN0aW9uIChzdHlsZSkge1xuaWYgKCFzdHlsZS5fX2Nzc1J1bGVzICYmIHN0eWxlLnRleHRDb250ZW50KSB7XG5zdHlsZS5fX2Nzc1J1bGVzID0gdGhpcy5wYXJzZXIucGFyc2Uoc3R5bGUudGV4dENvbnRlbnQpO1xufVxucmV0dXJuIHN0eWxlLl9fY3NzUnVsZXM7XG59LFxuY2xlYXJTdHlsZVJ1bGVzOiBmdW5jdGlvbiAoc3R5bGUpIHtcbnN0eWxlLl9fY3NzUnVsZXMgPSBudWxsO1xufSxcbmZvckVhY2hTdHlsZVJ1bGU6IGZ1bmN0aW9uIChub2RlLCBjYWxsYmFjaykge1xudmFyIHMgPSBub2RlLnNlbGVjdG9yO1xudmFyIHNraXBSdWxlcyA9IGZhbHNlO1xuaWYgKG5vZGUudHlwZSA9PT0gdGhpcy5ydWxlVHlwZXMuU1RZTEVfUlVMRSkge1xuY2FsbGJhY2sobm9kZSk7XG59IGVsc2UgaWYgKG5vZGUudHlwZSA9PT0gdGhpcy5ydWxlVHlwZXMuS0VZRlJBTUVTX1JVTEUgfHwgbm9kZS50eXBlID09PSB0aGlzLnJ1bGVUeXBlcy5NSVhJTl9SVUxFKSB7XG5za2lwUnVsZXMgPSB0cnVlO1xufVxudmFyIHIkID0gbm9kZS5ydWxlcztcbmlmIChyJCAmJiAhc2tpcFJ1bGVzKSB7XG5mb3IgKHZhciBpID0gMCwgbCA9IHIkLmxlbmd0aCwgcjsgaSA8IGwgJiYgKHIgPSByJFtpXSk7IGkrKykge1xudGhpcy5mb3JFYWNoU3R5bGVSdWxlKHIsIGNhbGxiYWNrKTtcbn1cbn1cbn0sXG5hcHBseUNzczogZnVuY3Rpb24gKGNzc1RleHQsIG1vbmlrZXIsIHRhcmdldCwgYWZ0ZXJOb2RlKSB7XG52YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuaWYgKG1vbmlrZXIpIHtcbnN0eWxlLnNldEF0dHJpYnV0ZSgnc2NvcGUnLCBtb25pa2VyKTtcbn1cbnN0eWxlLnRleHRDb250ZW50ID0gY3NzVGV4dDtcbnRhcmdldCA9IHRhcmdldCB8fCBkb2N1bWVudC5oZWFkO1xuaWYgKCFhZnRlck5vZGUpIHtcbnZhciBuJCA9IHRhcmdldC5xdWVyeVNlbGVjdG9yQWxsKCdzdHlsZVtzY29wZV0nKTtcbmFmdGVyTm9kZSA9IG4kW24kLmxlbmd0aCAtIDFdO1xufVxudGFyZ2V0Lmluc2VydEJlZm9yZShzdHlsZSwgYWZ0ZXJOb2RlICYmIGFmdGVyTm9kZS5uZXh0U2libGluZyB8fCB0YXJnZXQuZmlyc3RDaGlsZCk7XG5yZXR1cm4gc3R5bGU7XG59LFxuY3NzRnJvbU1vZHVsZTogZnVuY3Rpb24gKG1vZHVsZUlkKSB7XG52YXIgbSA9IFBvbHltZXIuRG9tTW9kdWxlLmltcG9ydChtb2R1bGVJZCk7XG5pZiAobSAmJiAhbS5fY3NzVGV4dCkge1xudmFyIGNzc1RleHQgPSAnJztcbnZhciBlJCA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG0ucXVlcnlTZWxlY3RvckFsbCh0aGlzLk1PRFVMRV9TVFlMRVNfU0VMRUNUT1IpKTtcbmZvciAodmFyIGkgPSAwLCBlOyBpIDwgZSQubGVuZ3RoOyBpKyspIHtcbmUgPSBlJFtpXTtcbmlmIChlLmxvY2FsTmFtZSA9PT0gJ3N0eWxlJykge1xuZSA9IGUuX19hcHBsaWVkRWxlbWVudCB8fCBlO1xuZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGUpO1xufSBlbHNlIHtcbmUgPSBlLmltcG9ydCAmJiBlLmltcG9ydC5ib2R5O1xufVxuaWYgKGUpIHtcbmNzc1RleHQgKz0gUG9seW1lci5SZXNvbHZlVXJsLnJlc29sdmVDc3MoZS50ZXh0Q29udGVudCwgZS5vd25lckRvY3VtZW50KTtcbn1cbn1cbm0uX2Nzc1RleHQgPSBjc3NUZXh0O1xufVxucmV0dXJuIG0gJiYgbS5fY3NzVGV4dCB8fCAnJztcbn0sXG5wYXJzZXI6IFBvbHltZXIuQ3NzUGFyc2UsXG5ydWxlVHlwZXM6IFBvbHltZXIuQ3NzUGFyc2UudHlwZXNcbn07XG59KCk7XG5Qb2x5bWVyLlN0eWxlVHJhbnNmb3JtZXIgPSBmdW5jdGlvbiAoKSB7XG52YXIgbmF0aXZlU2hhZG93ID0gUG9seW1lci5TZXR0aW5ncy51c2VOYXRpdmVTaGFkb3c7XG52YXIgc3R5bGVVdGlsID0gUG9seW1lci5TdHlsZVV0aWw7XG52YXIgYXBpID0ge1xuZG9tOiBmdW5jdGlvbiAobm9kZSwgc2NvcGUsIHVzZUF0dHIsIHNob3VsZFJlbW92ZVNjb3BlKSB7XG50aGlzLl90cmFuc2Zvcm1Eb20obm9kZSwgc2NvcGUgfHwgJycsIHVzZUF0dHIsIHNob3VsZFJlbW92ZVNjb3BlKTtcbn0sXG5fdHJhbnNmb3JtRG9tOiBmdW5jdGlvbiAobm9kZSwgc2VsZWN0b3IsIHVzZUF0dHIsIHNob3VsZFJlbW92ZVNjb3BlKSB7XG5pZiAobm9kZS5zZXRBdHRyaWJ1dGUpIHtcbnRoaXMuZWxlbWVudChub2RlLCBzZWxlY3RvciwgdXNlQXR0ciwgc2hvdWxkUmVtb3ZlU2NvcGUpO1xufVxudmFyIGMkID0gUG9seW1lci5kb20obm9kZSkuY2hpbGROb2RlcztcbmZvciAodmFyIGkgPSAwOyBpIDwgYyQubGVuZ3RoOyBpKyspIHtcbnRoaXMuX3RyYW5zZm9ybURvbShjJFtpXSwgc2VsZWN0b3IsIHVzZUF0dHIsIHNob3VsZFJlbW92ZVNjb3BlKTtcbn1cbn0sXG5lbGVtZW50OiBmdW5jdGlvbiAoZWxlbWVudCwgc2NvcGUsIHVzZUF0dHIsIHNob3VsZFJlbW92ZVNjb3BlKSB7XG5pZiAodXNlQXR0cikge1xuaWYgKHNob3VsZFJlbW92ZVNjb3BlKSB7XG5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShTQ09QRV9OQU1FKTtcbn0gZWxzZSB7XG5lbGVtZW50LnNldEF0dHJpYnV0ZShTQ09QRV9OQU1FLCBzY29wZSk7XG59XG59IGVsc2Uge1xuaWYgKHNjb3BlKSB7XG5pZiAoZWxlbWVudC5jbGFzc0xpc3QpIHtcbmlmIChzaG91bGRSZW1vdmVTY29wZSkge1xuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFNDT1BFX05BTUUpO1xuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHNjb3BlKTtcbn0gZWxzZSB7XG5lbGVtZW50LmNsYXNzTGlzdC5hZGQoU0NPUEVfTkFNRSk7XG5lbGVtZW50LmNsYXNzTGlzdC5hZGQoc2NvcGUpO1xufVxufSBlbHNlIGlmIChlbGVtZW50LmdldEF0dHJpYnV0ZSkge1xudmFyIGMgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShDTEFTUyk7XG5pZiAoc2hvdWxkUmVtb3ZlU2NvcGUpIHtcbmlmIChjKSB7XG5lbGVtZW50LnNldEF0dHJpYnV0ZShDTEFTUywgYy5yZXBsYWNlKFNDT1BFX05BTUUsICcnKS5yZXBsYWNlKHNjb3BlLCAnJykpO1xufVxufSBlbHNlIHtcbmVsZW1lbnQuc2V0QXR0cmlidXRlKENMQVNTLCBjICsgKGMgPyAnICcgOiAnJykgKyBTQ09QRV9OQU1FICsgJyAnICsgc2NvcGUpO1xufVxufVxufVxufVxufSxcbmVsZW1lbnRTdHlsZXM6IGZ1bmN0aW9uIChlbGVtZW50LCBjYWxsYmFjaykge1xudmFyIHN0eWxlcyA9IGVsZW1lbnQuX3N0eWxlcztcbnZhciBjc3NUZXh0ID0gJyc7XG5mb3IgKHZhciBpID0gMCwgbCA9IHN0eWxlcy5sZW5ndGgsIHMsIHRleHQ7IGkgPCBsICYmIChzID0gc3R5bGVzW2ldKTsgaSsrKSB7XG52YXIgcnVsZXMgPSBzdHlsZVV0aWwucnVsZXNGb3JTdHlsZShzKTtcbmNzc1RleHQgKz0gbmF0aXZlU2hhZG93ID8gc3R5bGVVdGlsLnRvQ3NzVGV4dChydWxlcywgY2FsbGJhY2spIDogdGhpcy5jc3MocnVsZXMsIGVsZW1lbnQuaXMsIGVsZW1lbnQuZXh0ZW5kcywgY2FsbGJhY2ssIGVsZW1lbnQuX3Njb3BlQ3NzVmlhQXR0cikgKyAnXFxuXFxuJztcbn1cbnJldHVybiBjc3NUZXh0LnRyaW0oKTtcbn0sXG5jc3M6IGZ1bmN0aW9uIChydWxlcywgc2NvcGUsIGV4dCwgY2FsbGJhY2ssIHVzZUF0dHIpIHtcbnZhciBob3N0U2NvcGUgPSB0aGlzLl9jYWxjSG9zdFNjb3BlKHNjb3BlLCBleHQpO1xuc2NvcGUgPSB0aGlzLl9jYWxjRWxlbWVudFNjb3BlKHNjb3BlLCB1c2VBdHRyKTtcbnZhciBzZWxmID0gdGhpcztcbnJldHVybiBzdHlsZVV0aWwudG9Dc3NUZXh0KHJ1bGVzLCBmdW5jdGlvbiAocnVsZSkge1xuaWYgKCFydWxlLmlzU2NvcGVkKSB7XG5zZWxmLnJ1bGUocnVsZSwgc2NvcGUsIGhvc3RTY29wZSk7XG5ydWxlLmlzU2NvcGVkID0gdHJ1ZTtcbn1cbmlmIChjYWxsYmFjaykge1xuY2FsbGJhY2socnVsZSwgc2NvcGUsIGhvc3RTY29wZSk7XG59XG59KTtcbn0sXG5fY2FsY0VsZW1lbnRTY29wZTogZnVuY3Rpb24gKHNjb3BlLCB1c2VBdHRyKSB7XG5pZiAoc2NvcGUpIHtcbnJldHVybiB1c2VBdHRyID8gQ1NTX0FUVFJfUFJFRklYICsgc2NvcGUgKyBDU1NfQVRUUl9TVUZGSVggOiBDU1NfQ0xBU1NfUFJFRklYICsgc2NvcGU7XG59IGVsc2Uge1xucmV0dXJuICcnO1xufVxufSxcbl9jYWxjSG9zdFNjb3BlOiBmdW5jdGlvbiAoc2NvcGUsIGV4dCkge1xucmV0dXJuIGV4dCA/ICdbaXM9JyArIHNjb3BlICsgJ10nIDogc2NvcGU7XG59LFxucnVsZTogZnVuY3Rpb24gKHJ1bGUsIHNjb3BlLCBob3N0U2NvcGUpIHtcbnRoaXMuX3RyYW5zZm9ybVJ1bGUocnVsZSwgdGhpcy5fdHJhbnNmb3JtQ29tcGxleFNlbGVjdG9yLCBzY29wZSwgaG9zdFNjb3BlKTtcbn0sXG5fdHJhbnNmb3JtUnVsZTogZnVuY3Rpb24gKHJ1bGUsIHRyYW5zZm9ybWVyLCBzY29wZSwgaG9zdFNjb3BlKSB7XG52YXIgcCQgPSBydWxlLnNlbGVjdG9yLnNwbGl0KENPTVBMRVhfU0VMRUNUT1JfU0VQKTtcbmZvciAodmFyIGkgPSAwLCBsID0gcCQubGVuZ3RoLCBwOyBpIDwgbCAmJiAocCA9IHAkW2ldKTsgaSsrKSB7XG5wJFtpXSA9IHRyYW5zZm9ybWVyLmNhbGwodGhpcywgcCwgc2NvcGUsIGhvc3RTY29wZSk7XG59XG5ydWxlLnNlbGVjdG9yID0gcCQuam9pbihDT01QTEVYX1NFTEVDVE9SX1NFUCk7XG59LFxuX3RyYW5zZm9ybUNvbXBsZXhTZWxlY3RvcjogZnVuY3Rpb24gKHNlbGVjdG9yLCBzY29wZSwgaG9zdFNjb3BlKSB7XG52YXIgc3RvcCA9IGZhbHNlO1xudmFyIGhvc3RDb250ZXh0ID0gZmFsc2U7XG52YXIgc2VsZiA9IHRoaXM7XG5zZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoU0lNUExFX1NFTEVDVE9SX1NFUCwgZnVuY3Rpb24gKG0sIGMsIHMpIHtcbmlmICghc3RvcCkge1xudmFyIGluZm8gPSBzZWxmLl90cmFuc2Zvcm1Db21wb3VuZFNlbGVjdG9yKHMsIGMsIHNjb3BlLCBob3N0U2NvcGUpO1xuc3RvcCA9IHN0b3AgfHwgaW5mby5zdG9wO1xuaG9zdENvbnRleHQgPSBob3N0Q29udGV4dCB8fCBpbmZvLmhvc3RDb250ZXh0O1xuYyA9IGluZm8uY29tYmluYXRvcjtcbnMgPSBpbmZvLnZhbHVlO1xufSBlbHNlIHtcbnMgPSBzLnJlcGxhY2UoU0NPUEVfSlVNUCwgJyAnKTtcbn1cbnJldHVybiBjICsgcztcbn0pO1xuaWYgKGhvc3RDb250ZXh0KSB7XG5zZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoSE9TVF9DT05URVhUX1BBUkVOLCBmdW5jdGlvbiAobSwgcHJlLCBwYXJlbiwgcG9zdCkge1xucmV0dXJuIHByZSArIHBhcmVuICsgJyAnICsgaG9zdFNjb3BlICsgcG9zdCArIENPTVBMRVhfU0VMRUNUT1JfU0VQICsgJyAnICsgcHJlICsgaG9zdFNjb3BlICsgcGFyZW4gKyBwb3N0O1xufSk7XG59XG5yZXR1cm4gc2VsZWN0b3I7XG59LFxuX3RyYW5zZm9ybUNvbXBvdW5kU2VsZWN0b3I6IGZ1bmN0aW9uIChzZWxlY3RvciwgY29tYmluYXRvciwgc2NvcGUsIGhvc3RTY29wZSkge1xudmFyIGp1bXBJbmRleCA9IHNlbGVjdG9yLnNlYXJjaChTQ09QRV9KVU1QKTtcbnZhciBob3N0Q29udGV4dCA9IGZhbHNlO1xuaWYgKHNlbGVjdG9yLmluZGV4T2YoSE9TVF9DT05URVhUKSA+PSAwKSB7XG5ob3N0Q29udGV4dCA9IHRydWU7XG59IGVsc2UgaWYgKHNlbGVjdG9yLmluZGV4T2YoSE9TVCkgPj0gMCkge1xuc2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKEhPU1RfUEFSRU4sIGZ1bmN0aW9uIChtLCBob3N0LCBwYXJlbikge1xucmV0dXJuIGhvc3RTY29wZSArIHBhcmVuO1xufSk7XG5zZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoSE9TVCwgaG9zdFNjb3BlKTtcbn0gZWxzZSBpZiAoanVtcEluZGV4ICE9PSAwKSB7XG5zZWxlY3RvciA9IHNjb3BlID8gdGhpcy5fdHJhbnNmb3JtU2ltcGxlU2VsZWN0b3Ioc2VsZWN0b3IsIHNjb3BlKSA6IHNlbGVjdG9yO1xufVxuaWYgKHNlbGVjdG9yLmluZGV4T2YoQ09OVEVOVCkgPj0gMCkge1xuY29tYmluYXRvciA9ICcnO1xufVxudmFyIHN0b3A7XG5pZiAoanVtcEluZGV4ID49IDApIHtcbnNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShTQ09QRV9KVU1QLCAnICcpO1xuc3RvcCA9IHRydWU7XG59XG5yZXR1cm4ge1xudmFsdWU6IHNlbGVjdG9yLFxuY29tYmluYXRvcjogY29tYmluYXRvcixcbnN0b3A6IHN0b3AsXG5ob3N0Q29udGV4dDogaG9zdENvbnRleHRcbn07XG59LFxuX3RyYW5zZm9ybVNpbXBsZVNlbGVjdG9yOiBmdW5jdGlvbiAoc2VsZWN0b3IsIHNjb3BlKSB7XG52YXIgcCQgPSBzZWxlY3Rvci5zcGxpdChQU0VVRE9fUFJFRklYKTtcbnAkWzBdICs9IHNjb3BlO1xucmV0dXJuIHAkLmpvaW4oUFNFVURPX1BSRUZJWCk7XG59LFxuZG9jdW1lbnRSdWxlOiBmdW5jdGlvbiAocnVsZSkge1xucnVsZS5zZWxlY3RvciA9IHJ1bGUucGFyc2VkU2VsZWN0b3I7XG50aGlzLm5vcm1hbGl6ZVJvb3RTZWxlY3RvcihydWxlKTtcbmlmICghbmF0aXZlU2hhZG93KSB7XG50aGlzLl90cmFuc2Zvcm1SdWxlKHJ1bGUsIHRoaXMuX3RyYW5zZm9ybURvY3VtZW50U2VsZWN0b3IpO1xufVxufSxcbm5vcm1hbGl6ZVJvb3RTZWxlY3RvcjogZnVuY3Rpb24gKHJ1bGUpIHtcbmlmIChydWxlLnNlbGVjdG9yID09PSBST09UKSB7XG5ydWxlLnNlbGVjdG9yID0gJ2JvZHknO1xufVxufSxcbl90cmFuc2Zvcm1Eb2N1bWVudFNlbGVjdG9yOiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbnJldHVybiBzZWxlY3Rvci5tYXRjaChTQ09QRV9KVU1QKSA/IHRoaXMuX3RyYW5zZm9ybUNvbXBsZXhTZWxlY3RvcihzZWxlY3RvciwgU0NPUEVfRE9DX1NFTEVDVE9SKSA6IHRoaXMuX3RyYW5zZm9ybVNpbXBsZVNlbGVjdG9yKHNlbGVjdG9yLnRyaW0oKSwgU0NPUEVfRE9DX1NFTEVDVE9SKTtcbn0sXG5TQ09QRV9OQU1FOiAnc3R5bGUtc2NvcGUnXG59O1xudmFyIFNDT1BFX05BTUUgPSBhcGkuU0NPUEVfTkFNRTtcbnZhciBTQ09QRV9ET0NfU0VMRUNUT1IgPSAnOm5vdChbJyArIFNDT1BFX05BTUUgKyAnXSknICsgJzpub3QoLicgKyBTQ09QRV9OQU1FICsgJyknO1xudmFyIENPTVBMRVhfU0VMRUNUT1JfU0VQID0gJywnO1xudmFyIFNJTVBMRV9TRUxFQ1RPUl9TRVAgPSAvKF58W1xccz4rfl0rKShbXlxccz4rfl0rKS9nO1xudmFyIEhPU1QgPSAnOmhvc3QnO1xudmFyIFJPT1QgPSAnOnJvb3QnO1xudmFyIEhPU1RfUEFSRU4gPSAvKFxcOmhvc3QpKD86XFwoKCg/OlxcKFteKShdKlxcKXxbXikoXSopKz8pXFwpKS9nO1xudmFyIEhPU1RfQ09OVEVYVCA9ICc6aG9zdC1jb250ZXh0JztcbnZhciBIT1NUX0NPTlRFWFRfUEFSRU4gPSAvKC4qKSg/OlxcOmhvc3QtY29udGV4dCkoPzpcXCgoKD86XFwoW14pKF0qXFwpfFteKShdKikrPylcXCkpKC4qKS87XG52YXIgQ09OVEVOVCA9ICc6OmNvbnRlbnQnO1xudmFyIFNDT1BFX0pVTVAgPSAvXFw6XFw6Y29udGVudHxcXDpcXDpzaGFkb3d8XFwvZGVlcFxcLy87XG52YXIgQ1NTX0NMQVNTX1BSRUZJWCA9ICcuJztcbnZhciBDU1NfQVRUUl9QUkVGSVggPSAnWycgKyBTQ09QRV9OQU1FICsgJ349JztcbnZhciBDU1NfQVRUUl9TVUZGSVggPSAnXSc7XG52YXIgUFNFVURPX1BSRUZJWCA9ICc6JztcbnZhciBDTEFTUyA9ICdjbGFzcyc7XG5yZXR1cm4gYXBpO1xufSgpO1xuUG9seW1lci5TdHlsZUV4dGVuZHMgPSBmdW5jdGlvbiAoKSB7XG52YXIgc3R5bGVVdGlsID0gUG9seW1lci5TdHlsZVV0aWw7XG5yZXR1cm4ge1xuaGFzRXh0ZW5kczogZnVuY3Rpb24gKGNzc1RleHQpIHtcbnJldHVybiBCb29sZWFuKGNzc1RleHQubWF0Y2godGhpcy5yeC5FWFRFTkQpKTtcbn0sXG50cmFuc2Zvcm06IGZ1bmN0aW9uIChzdHlsZSkge1xudmFyIHJ1bGVzID0gc3R5bGVVdGlsLnJ1bGVzRm9yU3R5bGUoc3R5bGUpO1xudmFyIHNlbGYgPSB0aGlzO1xuc3R5bGVVdGlsLmZvckVhY2hTdHlsZVJ1bGUocnVsZXMsIGZ1bmN0aW9uIChydWxlKSB7XG52YXIgbWFwID0gc2VsZi5fbWFwUnVsZShydWxlKTtcbmlmIChydWxlLnBhcmVudCkge1xudmFyIG07XG53aGlsZSAobSA9IHNlbGYucnguRVhURU5ELmV4ZWMocnVsZS5jc3NUZXh0KSkge1xudmFyIGV4dGVuZCA9IG1bMV07XG52YXIgZXh0ZW5kb3IgPSBzZWxmLl9maW5kRXh0ZW5kb3IoZXh0ZW5kLCBydWxlKTtcbmlmIChleHRlbmRvcikge1xuc2VsZi5fZXh0ZW5kUnVsZShydWxlLCBleHRlbmRvcik7XG59XG59XG59XG5ydWxlLmNzc1RleHQgPSBydWxlLmNzc1RleHQucmVwbGFjZShzZWxmLnJ4LkVYVEVORCwgJycpO1xufSk7XG5yZXR1cm4gc3R5bGVVdGlsLnRvQ3NzVGV4dChydWxlcywgZnVuY3Rpb24gKHJ1bGUpIHtcbmlmIChydWxlLnNlbGVjdG9yLm1hdGNoKHNlbGYucnguU1RSSVApKSB7XG5ydWxlLmNzc1RleHQgPSAnJztcbn1cbn0sIHRydWUpO1xufSxcbl9tYXBSdWxlOiBmdW5jdGlvbiAocnVsZSkge1xuaWYgKHJ1bGUucGFyZW50KSB7XG52YXIgbWFwID0gcnVsZS5wYXJlbnQubWFwIHx8IChydWxlLnBhcmVudC5tYXAgPSB7fSk7XG52YXIgcGFydHMgPSBydWxlLnNlbGVjdG9yLnNwbGl0KCcsJyk7XG5mb3IgKHZhciBpID0gMCwgcDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG5wID0gcGFydHNbaV07XG5tYXBbcC50cmltKCldID0gcnVsZTtcbn1cbnJldHVybiBtYXA7XG59XG59LFxuX2ZpbmRFeHRlbmRvcjogZnVuY3Rpb24gKGV4dGVuZCwgcnVsZSkge1xucmV0dXJuIHJ1bGUucGFyZW50ICYmIHJ1bGUucGFyZW50Lm1hcCAmJiBydWxlLnBhcmVudC5tYXBbZXh0ZW5kXSB8fCB0aGlzLl9maW5kRXh0ZW5kb3IoZXh0ZW5kLCBydWxlLnBhcmVudCk7XG59LFxuX2V4dGVuZFJ1bGU6IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuaWYgKHRhcmdldC5wYXJlbnQgIT09IHNvdXJjZS5wYXJlbnQpIHtcbnRoaXMuX2Nsb25lQW5kQWRkUnVsZVRvUGFyZW50KHNvdXJjZSwgdGFyZ2V0LnBhcmVudCk7XG59XG50YXJnZXQuZXh0ZW5kcyA9IHRhcmdldC5leHRlbmRzIHx8ICh0YXJnZXQuZXh0ZW5kcyA9IFtdKTtcbnRhcmdldC5leHRlbmRzLnB1c2goc291cmNlKTtcbnNvdXJjZS5zZWxlY3RvciA9IHNvdXJjZS5zZWxlY3Rvci5yZXBsYWNlKHRoaXMucnguU1RSSVAsICcnKTtcbnNvdXJjZS5zZWxlY3RvciA9IChzb3VyY2Uuc2VsZWN0b3IgJiYgc291cmNlLnNlbGVjdG9yICsgJyxcXG4nKSArIHRhcmdldC5zZWxlY3RvcjtcbmlmIChzb3VyY2UuZXh0ZW5kcykge1xuc291cmNlLmV4dGVuZHMuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xudGhpcy5fZXh0ZW5kUnVsZSh0YXJnZXQsIGUpO1xufSwgdGhpcyk7XG59XG59LFxuX2Nsb25lQW5kQWRkUnVsZVRvUGFyZW50OiBmdW5jdGlvbiAocnVsZSwgcGFyZW50KSB7XG5ydWxlID0gT2JqZWN0LmNyZWF0ZShydWxlKTtcbnJ1bGUucGFyZW50ID0gcGFyZW50O1xuaWYgKHJ1bGUuZXh0ZW5kcykge1xucnVsZS5leHRlbmRzID0gcnVsZS5leHRlbmRzLnNsaWNlKCk7XG59XG5wYXJlbnQucnVsZXMucHVzaChydWxlKTtcbn0sXG5yeDoge1xuRVhURU5EOiAvQGV4dGVuZHNcXCgoW14pXSopXFwpXFxzKj87L2dpbSxcblNUUklQOiAvJVteLF0qJC9cbn1cbn07XG59KCk7XG4oZnVuY3Rpb24gKCkge1xudmFyIHByZXBFbGVtZW50ID0gUG9seW1lci5CYXNlLl9wcmVwRWxlbWVudDtcbnZhciBuYXRpdmVTaGFkb3cgPSBQb2x5bWVyLlNldHRpbmdzLnVzZU5hdGl2ZVNoYWRvdztcbnZhciBzdHlsZVV0aWwgPSBQb2x5bWVyLlN0eWxlVXRpbDtcbnZhciBzdHlsZVRyYW5zZm9ybWVyID0gUG9seW1lci5TdHlsZVRyYW5zZm9ybWVyO1xudmFyIHN0eWxlRXh0ZW5kcyA9IFBvbHltZXIuU3R5bGVFeHRlbmRzO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9wcmVwRWxlbWVudDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbmlmICh0aGlzLl9lbmNhcHN1bGF0ZVN0eWxlKSB7XG5zdHlsZVRyYW5zZm9ybWVyLmVsZW1lbnQoZWxlbWVudCwgdGhpcy5pcywgdGhpcy5fc2NvcGVDc3NWaWFBdHRyKTtcbn1cbnByZXBFbGVtZW50LmNhbGwodGhpcywgZWxlbWVudCk7XG59LFxuX3ByZXBTdHlsZXM6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLl9lbmNhcHN1bGF0ZVN0eWxlID09PSB1bmRlZmluZWQpIHtcbnRoaXMuX2VuY2Fwc3VsYXRlU3R5bGUgPSAhbmF0aXZlU2hhZG93ICYmIEJvb2xlYW4odGhpcy5fdGVtcGxhdGUpO1xufVxudGhpcy5fc3R5bGVzID0gdGhpcy5fY29sbGVjdFN0eWxlcygpO1xudmFyIGNzc1RleHQgPSBzdHlsZVRyYW5zZm9ybWVyLmVsZW1lbnRTdHlsZXModGhpcyk7XG5pZiAoY3NzVGV4dCAmJiB0aGlzLl90ZW1wbGF0ZSkge1xudmFyIHN0eWxlID0gc3R5bGVVdGlsLmFwcGx5Q3NzKGNzc1RleHQsIHRoaXMuaXMsIG5hdGl2ZVNoYWRvdyA/IHRoaXMuX3RlbXBsYXRlLmNvbnRlbnQgOiBudWxsKTtcbmlmICghbmF0aXZlU2hhZG93KSB7XG50aGlzLl9zY29wZVN0eWxlID0gc3R5bGU7XG59XG59XG59LFxuX2NvbGxlY3RTdHlsZXM6IGZ1bmN0aW9uICgpIHtcbnZhciBzdHlsZXMgPSBbXTtcbnZhciBjc3NUZXh0ID0gJycsIG0kID0gdGhpcy5zdHlsZU1vZHVsZXM7XG5pZiAobSQpIHtcbmZvciAodmFyIGkgPSAwLCBsID0gbSQubGVuZ3RoLCBtOyBpIDwgbCAmJiAobSA9IG0kW2ldKTsgaSsrKSB7XG5jc3NUZXh0ICs9IHN0eWxlVXRpbC5jc3NGcm9tTW9kdWxlKG0pO1xufVxufVxuY3NzVGV4dCArPSBzdHlsZVV0aWwuY3NzRnJvbU1vZHVsZSh0aGlzLmlzKTtcbmlmIChjc3NUZXh0KSB7XG52YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuc3R5bGUudGV4dENvbnRlbnQgPSBjc3NUZXh0O1xuaWYgKHN0eWxlRXh0ZW5kcy5oYXNFeHRlbmRzKHN0eWxlLnRleHRDb250ZW50KSkge1xuY3NzVGV4dCA9IHN0eWxlRXh0ZW5kcy50cmFuc2Zvcm0oc3R5bGUpO1xufVxuc3R5bGVzLnB1c2goc3R5bGUpO1xufVxucmV0dXJuIHN0eWxlcztcbn0sXG5fZWxlbWVudEFkZDogZnVuY3Rpb24gKG5vZGUpIHtcbmlmICh0aGlzLl9lbmNhcHN1bGF0ZVN0eWxlKSB7XG5pZiAobm9kZS5fX3N0eWxlU2NvcGVkKSB7XG5ub2RlLl9fc3R5bGVTY29wZWQgPSBmYWxzZTtcbn0gZWxzZSB7XG5zdHlsZVRyYW5zZm9ybWVyLmRvbShub2RlLCB0aGlzLmlzLCB0aGlzLl9zY29wZUNzc1ZpYUF0dHIpO1xufVxufVxufSxcbl9lbGVtZW50UmVtb3ZlOiBmdW5jdGlvbiAobm9kZSkge1xuaWYgKHRoaXMuX2VuY2Fwc3VsYXRlU3R5bGUpIHtcbnN0eWxlVHJhbnNmb3JtZXIuZG9tKG5vZGUsIHRoaXMuaXMsIHRoaXMuX3Njb3BlQ3NzVmlhQXR0ciwgdHJ1ZSk7XG59XG59LFxuc2NvcGVTdWJ0cmVlOiBmdW5jdGlvbiAoY29udGFpbmVyLCBzaG91bGRPYnNlcnZlKSB7XG5pZiAobmF0aXZlU2hhZG93KSB7XG5yZXR1cm47XG59XG52YXIgc2VsZiA9IHRoaXM7XG52YXIgc2NvcGlmeSA9IGZ1bmN0aW9uIChub2RlKSB7XG5pZiAobm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUpIHtcbm5vZGUuY2xhc3NOYW1lID0gc2VsZi5fc2NvcGVFbGVtZW50Q2xhc3Mobm9kZSwgbm9kZS5jbGFzc05hbWUpO1xudmFyIG4kID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKCcqJyk7XG5BcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKG4kLCBmdW5jdGlvbiAobikge1xubi5jbGFzc05hbWUgPSBzZWxmLl9zY29wZUVsZW1lbnRDbGFzcyhuLCBuLmNsYXNzTmFtZSk7XG59KTtcbn1cbn07XG5zY29waWZ5KGNvbnRhaW5lcik7XG5pZiAoc2hvdWxkT2JzZXJ2ZSkge1xudmFyIG1vID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKG14bnMpIHtcbm14bnMuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuaWYgKG0uYWRkZWROb2Rlcykge1xuZm9yICh2YXIgaSA9IDA7IGkgPCBtLmFkZGVkTm9kZXMubGVuZ3RoOyBpKyspIHtcbnNjb3BpZnkobS5hZGRlZE5vZGVzW2ldKTtcbn1cbn1cbn0pO1xufSk7XG5tby5vYnNlcnZlKGNvbnRhaW5lciwge1xuY2hpbGRMaXN0OiB0cnVlLFxuc3VidHJlZTogdHJ1ZVxufSk7XG5yZXR1cm4gbW87XG59XG59XG59KTtcbn0oKSk7XG5Qb2x5bWVyLlN0eWxlUHJvcGVydGllcyA9IGZ1bmN0aW9uICgpIHtcbid1c2Ugc3RyaWN0JztcbnZhciBuYXRpdmVTaGFkb3cgPSBQb2x5bWVyLlNldHRpbmdzLnVzZU5hdGl2ZVNoYWRvdztcbnZhciBtYXRjaGVzU2VsZWN0b3IgPSBQb2x5bWVyLkRvbUFwaS5tYXRjaGVzU2VsZWN0b3I7XG52YXIgc3R5bGVVdGlsID0gUG9seW1lci5TdHlsZVV0aWw7XG52YXIgc3R5bGVUcmFuc2Zvcm1lciA9IFBvbHltZXIuU3R5bGVUcmFuc2Zvcm1lcjtcbnJldHVybiB7XG5kZWNvcmF0ZVN0eWxlczogZnVuY3Rpb24gKHN0eWxlcykge1xudmFyIHNlbGYgPSB0aGlzLCBwcm9wcyA9IHt9O1xuc3R5bGVVdGlsLmZvclJ1bGVzSW5TdHlsZXMoc3R5bGVzLCBmdW5jdGlvbiAocnVsZSkge1xuc2VsZi5kZWNvcmF0ZVJ1bGUocnVsZSk7XG5zZWxmLmNvbGxlY3RQcm9wZXJ0aWVzSW5Dc3NUZXh0KHJ1bGUucHJvcGVydHlJbmZvLmNzc1RleHQsIHByb3BzKTtcbn0pO1xudmFyIG5hbWVzID0gW107XG5mb3IgKHZhciBpIGluIHByb3BzKSB7XG5uYW1lcy5wdXNoKGkpO1xufVxucmV0dXJuIG5hbWVzO1xufSxcbmRlY29yYXRlUnVsZTogZnVuY3Rpb24gKHJ1bGUpIHtcbmlmIChydWxlLnByb3BlcnR5SW5mbykge1xucmV0dXJuIHJ1bGUucHJvcGVydHlJbmZvO1xufVxudmFyIGluZm8gPSB7fSwgcHJvcGVydGllcyA9IHt9O1xudmFyIGhhc1Byb3BlcnRpZXMgPSB0aGlzLmNvbGxlY3RQcm9wZXJ0aWVzKHJ1bGUsIHByb3BlcnRpZXMpO1xuaWYgKGhhc1Byb3BlcnRpZXMpIHtcbmluZm8ucHJvcGVydGllcyA9IHByb3BlcnRpZXM7XG5ydWxlLnJ1bGVzID0gbnVsbDtcbn1cbmluZm8uY3NzVGV4dCA9IHRoaXMuY29sbGVjdENzc1RleHQocnVsZSk7XG5ydWxlLnByb3BlcnR5SW5mbyA9IGluZm87XG5yZXR1cm4gaW5mbztcbn0sXG5jb2xsZWN0UHJvcGVydGllczogZnVuY3Rpb24gKHJ1bGUsIHByb3BlcnRpZXMpIHtcbnZhciBpbmZvID0gcnVsZS5wcm9wZXJ0eUluZm87XG5pZiAoaW5mbykge1xuaWYgKGluZm8ucHJvcGVydGllcykge1xuUG9seW1lci5CYXNlLm1peGluKHByb3BlcnRpZXMsIGluZm8ucHJvcGVydGllcyk7XG5yZXR1cm4gdHJ1ZTtcbn1cbn0gZWxzZSB7XG52YXIgbSwgcnggPSB0aGlzLnJ4LlZBUl9BU1NJR047XG52YXIgY3NzVGV4dCA9IHJ1bGUucGFyc2VkQ3NzVGV4dDtcbnZhciBhbnk7XG53aGlsZSAobSA9IHJ4LmV4ZWMoY3NzVGV4dCkpIHtcbnByb3BlcnRpZXNbbVsxXV0gPSAobVsyXSB8fCBtWzNdKS50cmltKCk7XG5hbnkgPSB0cnVlO1xufVxucmV0dXJuIGFueTtcbn1cbn0sXG5jb2xsZWN0Q3NzVGV4dDogZnVuY3Rpb24gKHJ1bGUpIHtcbnZhciBjdXN0b21Dc3NUZXh0ID0gJyc7XG52YXIgY3NzVGV4dCA9IHJ1bGUucGFyc2VkQ3NzVGV4dDtcbmNzc1RleHQgPSBjc3NUZXh0LnJlcGxhY2UodGhpcy5yeC5CUkFDS0VURUQsICcnKS5yZXBsYWNlKHRoaXMucnguVkFSX0FTU0lHTiwgJycpO1xudmFyIHBhcnRzID0gY3NzVGV4dC5zcGxpdCgnOycpO1xuZm9yICh2YXIgaSA9IDAsIHA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xucCA9IHBhcnRzW2ldO1xuaWYgKHAubWF0Y2godGhpcy5yeC5NSVhJTl9NQVRDSCkgfHwgcC5tYXRjaCh0aGlzLnJ4LlZBUl9NQVRDSCkpIHtcbmN1c3RvbUNzc1RleHQgKz0gcCArICc7XFxuJztcbn1cbn1cbnJldHVybiBjdXN0b21Dc3NUZXh0O1xufSxcbmNvbGxlY3RQcm9wZXJ0aWVzSW5Dc3NUZXh0OiBmdW5jdGlvbiAoY3NzVGV4dCwgcHJvcHMpIHtcbnZhciBtO1xud2hpbGUgKG0gPSB0aGlzLnJ4LlZBUl9DQVBUVVJFLmV4ZWMoY3NzVGV4dCkpIHtcbnByb3BzW21bMV1dID0gdHJ1ZTtcbnZhciBkZWYgPSBtWzJdO1xuaWYgKGRlZiAmJiBkZWYubWF0Y2godGhpcy5yeC5JU19WQVIpKSB7XG5wcm9wc1tkZWZdID0gdHJ1ZTtcbn1cbn1cbn0sXG5yZWlmeTogZnVuY3Rpb24gKHByb3BzKSB7XG52YXIgbmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhwcm9wcyk7XG5mb3IgKHZhciBpID0gMCwgbjsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG5uID0gbmFtZXNbaV07XG5wcm9wc1tuXSA9IHRoaXMudmFsdWVGb3JQcm9wZXJ0eShwcm9wc1tuXSwgcHJvcHMpO1xufVxufSxcbnZhbHVlRm9yUHJvcGVydHk6IGZ1bmN0aW9uIChwcm9wZXJ0eSwgcHJvcHMpIHtcbmlmIChwcm9wZXJ0eSkge1xuaWYgKHByb3BlcnR5LmluZGV4T2YoJzsnKSA+PSAwKSB7XG5wcm9wZXJ0eSA9IHRoaXMudmFsdWVGb3JQcm9wZXJ0aWVzKHByb3BlcnR5LCBwcm9wcyk7XG59IGVsc2Uge1xudmFyIHNlbGYgPSB0aGlzO1xudmFyIGZuID0gZnVuY3Rpb24gKGFsbCwgcHJlZml4LCB2YWx1ZSwgZmFsbGJhY2spIHtcbnZhciBwcm9wZXJ0eVZhbHVlID0gc2VsZi52YWx1ZUZvclByb3BlcnR5KHByb3BzW3ZhbHVlXSwgcHJvcHMpIHx8IChwcm9wc1tmYWxsYmFja10gPyBzZWxmLnZhbHVlRm9yUHJvcGVydHkocHJvcHNbZmFsbGJhY2tdLCBwcm9wcykgOiBmYWxsYmFjayk7XG5yZXR1cm4gcHJlZml4ICsgKHByb3BlcnR5VmFsdWUgfHwgJycpO1xufTtcbnByb3BlcnR5ID0gcHJvcGVydHkucmVwbGFjZSh0aGlzLnJ4LlZBUl9NQVRDSCwgZm4pO1xufVxufVxucmV0dXJuIHByb3BlcnR5ICYmIHByb3BlcnR5LnRyaW0oKSB8fCAnJztcbn0sXG52YWx1ZUZvclByb3BlcnRpZXM6IGZ1bmN0aW9uIChwcm9wZXJ0eSwgcHJvcHMpIHtcbnZhciBwYXJ0cyA9IHByb3BlcnR5LnNwbGl0KCc7Jyk7XG5mb3IgKHZhciBpID0gMCwgcCwgbTsgaSA8IHBhcnRzLmxlbmd0aCAmJiAocCA9IHBhcnRzW2ldKTsgaSsrKSB7XG5tID0gcC5tYXRjaCh0aGlzLnJ4Lk1JWElOX01BVENIKTtcbmlmIChtKSB7XG5wID0gdGhpcy52YWx1ZUZvclByb3BlcnR5KHByb3BzW21bMV1dLCBwcm9wcyk7XG59IGVsc2Uge1xudmFyIHBwID0gcC5zcGxpdCgnOicpO1xuaWYgKHBwWzFdKSB7XG5wcFsxXSA9IHBwWzFdLnRyaW0oKTtcbnBwWzFdID0gdGhpcy52YWx1ZUZvclByb3BlcnR5KHBwWzFdLCBwcm9wcykgfHwgcHBbMV07XG59XG5wID0gcHAuam9pbignOicpO1xufVxucGFydHNbaV0gPSBwICYmIHAubGFzdEluZGV4T2YoJzsnKSA9PT0gcC5sZW5ndGggLSAxID8gcC5zbGljZSgwLCAtMSkgOiBwIHx8ICcnO1xufVxucmV0dXJuIHBhcnRzLmpvaW4oJzsnKTtcbn0sXG5hcHBseVByb3BlcnRpZXM6IGZ1bmN0aW9uIChydWxlLCBwcm9wcykge1xudmFyIG91dHB1dCA9ICcnO1xuaWYgKCFydWxlLnByb3BlcnR5SW5mbykge1xudGhpcy5kZWNvcmF0ZVJ1bGUocnVsZSk7XG59XG5pZiAocnVsZS5wcm9wZXJ0eUluZm8uY3NzVGV4dCkge1xub3V0cHV0ID0gdGhpcy52YWx1ZUZvclByb3BlcnRpZXMocnVsZS5wcm9wZXJ0eUluZm8uY3NzVGV4dCwgcHJvcHMpO1xufVxucnVsZS5jc3NUZXh0ID0gb3V0cHV0O1xufSxcbnByb3BlcnR5RGF0YUZyb21TdHlsZXM6IGZ1bmN0aW9uIChzdHlsZXMsIGVsZW1lbnQpIHtcbnZhciBwcm9wcyA9IHt9LCBzZWxmID0gdGhpcztcbnZhciBvID0gW10sIGkgPSAwO1xuc3R5bGVVdGlsLmZvclJ1bGVzSW5TdHlsZXMoc3R5bGVzLCBmdW5jdGlvbiAocnVsZSkge1xuaWYgKCFydWxlLnByb3BlcnR5SW5mbykge1xuc2VsZi5kZWNvcmF0ZVJ1bGUocnVsZSk7XG59XG5pZiAoZWxlbWVudCAmJiBydWxlLnByb3BlcnR5SW5mby5wcm9wZXJ0aWVzICYmIG1hdGNoZXNTZWxlY3Rvci5jYWxsKGVsZW1lbnQsIHJ1bGUuc2VsZWN0b3IpKSB7XG5zZWxmLmNvbGxlY3RQcm9wZXJ0aWVzKHJ1bGUsIHByb3BzKTtcbmFkZFRvQml0TWFzayhpLCBvKTtcbn1cbmkrKztcbn0pO1xucmV0dXJuIHtcbnByb3BlcnRpZXM6IHByb3BzLFxua2V5OiBvXG59O1xufSxcbnNjb3BlUHJvcGVydGllc0Zyb21TdHlsZXM6IGZ1bmN0aW9uIChzdHlsZXMpIHtcbmlmICghc3R5bGVzLl9zY29wZVN0eWxlUHJvcGVydGllcykge1xuc3R5bGVzLl9zY29wZVN0eWxlUHJvcGVydGllcyA9IHRoaXMuc2VsZWN0ZWRQcm9wZXJ0aWVzRnJvbVN0eWxlcyhzdHlsZXMsIHRoaXMuU0NPUEVfU0VMRUNUT1JTKTtcbn1cbnJldHVybiBzdHlsZXMuX3Njb3BlU3R5bGVQcm9wZXJ0aWVzO1xufSxcbmhvc3RQcm9wZXJ0aWVzRnJvbVN0eWxlczogZnVuY3Rpb24gKHN0eWxlcykge1xuaWYgKCFzdHlsZXMuX2hvc3RTdHlsZVByb3BlcnRpZXMpIHtcbnN0eWxlcy5faG9zdFN0eWxlUHJvcGVydGllcyA9IHRoaXMuc2VsZWN0ZWRQcm9wZXJ0aWVzRnJvbVN0eWxlcyhzdHlsZXMsIHRoaXMuSE9TVF9TRUxFQ1RPUlMpO1xufVxucmV0dXJuIHN0eWxlcy5faG9zdFN0eWxlUHJvcGVydGllcztcbn0sXG5zZWxlY3RlZFByb3BlcnRpZXNGcm9tU3R5bGVzOiBmdW5jdGlvbiAoc3R5bGVzLCBzZWxlY3RvcnMpIHtcbnZhciBwcm9wcyA9IHt9LCBzZWxmID0gdGhpcztcbnN0eWxlVXRpbC5mb3JSdWxlc0luU3R5bGVzKHN0eWxlcywgZnVuY3Rpb24gKHJ1bGUpIHtcbmlmICghcnVsZS5wcm9wZXJ0eUluZm8pIHtcbnNlbGYuZGVjb3JhdGVSdWxlKHJ1bGUpO1xufVxuZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxlY3RvcnMubGVuZ3RoOyBpKyspIHtcbmlmIChydWxlLnBhcnNlZFNlbGVjdG9yID09PSBzZWxlY3RvcnNbaV0pIHtcbnNlbGYuY29sbGVjdFByb3BlcnRpZXMocnVsZSwgcHJvcHMpO1xucmV0dXJuO1xufVxufVxufSk7XG5yZXR1cm4gcHJvcHM7XG59LFxudHJhbnNmb3JtU3R5bGVzOiBmdW5jdGlvbiAoZWxlbWVudCwgcHJvcGVydGllcywgc2NvcGVTZWxlY3Rvcikge1xudmFyIHNlbGYgPSB0aGlzO1xudmFyIGhvc3RTZWxlY3RvciA9IHN0eWxlVHJhbnNmb3JtZXIuX2NhbGNIb3N0U2NvcGUoZWxlbWVudC5pcywgZWxlbWVudC5leHRlbmRzKTtcbnZhciByeEhvc3RTZWxlY3RvciA9IGVsZW1lbnQuZXh0ZW5kcyA/ICdcXFxcJyArIGhvc3RTZWxlY3Rvci5zbGljZSgwLCAtMSkgKyAnXFxcXF0nIDogaG9zdFNlbGVjdG9yO1xudmFyIGhvc3RSeCA9IG5ldyBSZWdFeHAodGhpcy5yeC5IT1NUX1BSRUZJWCArIHJ4SG9zdFNlbGVjdG9yICsgdGhpcy5yeC5IT1NUX1NVRkZJWCk7XG5yZXR1cm4gc3R5bGVUcmFuc2Zvcm1lci5lbGVtZW50U3R5bGVzKGVsZW1lbnQsIGZ1bmN0aW9uIChydWxlKSB7XG5zZWxmLmFwcGx5UHJvcGVydGllcyhydWxlLCBwcm9wZXJ0aWVzKTtcbmlmIChydWxlLmNzc1RleHQgJiYgIW5hdGl2ZVNoYWRvdykge1xuc2VsZi5fc2NvcGVTZWxlY3RvcihydWxlLCBob3N0UngsIGhvc3RTZWxlY3RvciwgZWxlbWVudC5fc2NvcGVDc3NWaWFBdHRyLCBzY29wZVNlbGVjdG9yKTtcbn1cbn0pO1xufSxcbl9zY29wZVNlbGVjdG9yOiBmdW5jdGlvbiAocnVsZSwgaG9zdFJ4LCBob3N0U2VsZWN0b3IsIHZpYUF0dHIsIHNjb3BlSWQpIHtcbnJ1bGUudHJhbnNmb3JtZWRTZWxlY3RvciA9IHJ1bGUudHJhbnNmb3JtZWRTZWxlY3RvciB8fCBydWxlLnNlbGVjdG9yO1xudmFyIHNlbGVjdG9yID0gcnVsZS50cmFuc2Zvcm1lZFNlbGVjdG9yO1xudmFyIHNjb3BlID0gdmlhQXR0ciA/ICdbJyArIHN0eWxlVHJhbnNmb3JtZXIuU0NPUEVfTkFNRSArICd+PScgKyBzY29wZUlkICsgJ10nIDogJy4nICsgc2NvcGVJZDtcbnZhciBwYXJ0cyA9IHNlbGVjdG9yLnNwbGl0KCcsJyk7XG5mb3IgKHZhciBpID0gMCwgbCA9IHBhcnRzLmxlbmd0aCwgcDsgaSA8IGwgJiYgKHAgPSBwYXJ0c1tpXSk7IGkrKykge1xucGFydHNbaV0gPSBwLm1hdGNoKGhvc3RSeCkgPyBwLnJlcGxhY2UoaG9zdFNlbGVjdG9yLCBob3N0U2VsZWN0b3IgKyBzY29wZSkgOiBzY29wZSArICcgJyArIHA7XG59XG5ydWxlLnNlbGVjdG9yID0gcGFydHMuam9pbignLCcpO1xufSxcbmFwcGx5RWxlbWVudFNjb3BlU2VsZWN0b3I6IGZ1bmN0aW9uIChlbGVtZW50LCBzZWxlY3Rvciwgb2xkLCB2aWFBdHRyKSB7XG52YXIgYyA9IHZpYUF0dHIgPyBlbGVtZW50LmdldEF0dHJpYnV0ZShzdHlsZVRyYW5zZm9ybWVyLlNDT1BFX05BTUUpIDogZWxlbWVudC5jbGFzc05hbWU7XG52YXIgdiA9IG9sZCA/IGMucmVwbGFjZShvbGQsIHNlbGVjdG9yKSA6IChjID8gYyArICcgJyA6ICcnKSArIHRoaXMuWFNDT1BFX05BTUUgKyAnICcgKyBzZWxlY3RvcjtcbmlmIChjICE9PSB2KSB7XG5pZiAodmlhQXR0cikge1xuZWxlbWVudC5zZXRBdHRyaWJ1dGUoc3R5bGVUcmFuc2Zvcm1lci5TQ09QRV9OQU1FLCB2KTtcbn0gZWxzZSB7XG5lbGVtZW50LmNsYXNzTmFtZSA9IHY7XG59XG59XG59LFxuYXBwbHlFbGVtZW50U3R5bGU6IGZ1bmN0aW9uIChlbGVtZW50LCBwcm9wZXJ0aWVzLCBzZWxlY3Rvciwgc3R5bGUpIHtcbnZhciBjc3NUZXh0ID0gc3R5bGUgPyBzdHlsZS50ZXh0Q29udGVudCB8fCAnJyA6IHRoaXMudHJhbnNmb3JtU3R5bGVzKGVsZW1lbnQsIHByb3BlcnRpZXMsIHNlbGVjdG9yKTtcbnZhciBzID0gZWxlbWVudC5fY3VzdG9tU3R5bGU7XG5pZiAocyAmJiAhbmF0aXZlU2hhZG93ICYmIHMgIT09IHN0eWxlKSB7XG5zLl91c2VDb3VudC0tO1xuaWYgKHMuX3VzZUNvdW50IDw9IDAgJiYgcy5wYXJlbnROb2RlKSB7XG5zLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocyk7XG59XG59XG5pZiAobmF0aXZlU2hhZG93IHx8ICghc3R5bGUgfHwgIXN0eWxlLnBhcmVudE5vZGUpKSB7XG5pZiAobmF0aXZlU2hhZG93ICYmIGVsZW1lbnQuX2N1c3RvbVN0eWxlKSB7XG5lbGVtZW50Ll9jdXN0b21TdHlsZS50ZXh0Q29udGVudCA9IGNzc1RleHQ7XG5zdHlsZSA9IGVsZW1lbnQuX2N1c3RvbVN0eWxlO1xufSBlbHNlIGlmIChjc3NUZXh0KSB7XG5zdHlsZSA9IHN0eWxlVXRpbC5hcHBseUNzcyhjc3NUZXh0LCBzZWxlY3RvciwgbmF0aXZlU2hhZG93ID8gZWxlbWVudC5yb290IDogbnVsbCwgZWxlbWVudC5fc2NvcGVTdHlsZSk7XG59XG59XG5pZiAoc3R5bGUpIHtcbnN0eWxlLl91c2VDb3VudCA9IHN0eWxlLl91c2VDb3VudCB8fCAwO1xuaWYgKGVsZW1lbnQuX2N1c3RvbVN0eWxlICE9IHN0eWxlKSB7XG5zdHlsZS5fdXNlQ291bnQrKztcbn1cbmVsZW1lbnQuX2N1c3RvbVN0eWxlID0gc3R5bGU7XG59XG5yZXR1cm4gc3R5bGU7XG59LFxubWl4aW5DdXN0b21TdHlsZTogZnVuY3Rpb24gKHByb3BzLCBjdXN0b21TdHlsZSkge1xudmFyIHY7XG5mb3IgKHZhciBpIGluIGN1c3RvbVN0eWxlKSB7XG52ID0gY3VzdG9tU3R5bGVbaV07XG5pZiAodiB8fCB2ID09PSAwKSB7XG5wcm9wc1tpXSA9IHY7XG59XG59XG59LFxucng6IHtcblZBUl9BU1NJR046IC8oPzpefFs7XFxuXVxccyopKC0tW1xcdy1dKj8pOlxccyooPzooW147e10qKXx7KFtefV0qKX0pKD86KD89WztcXG5dKXwkKS9naSxcbk1JWElOX01BVENIOiAvKD86XnxcXFcrKUBhcHBseVtcXHNdKlxcKChbXildKilcXCkvaSxcblZBUl9NQVRDSDogLyhefFxcVyspdmFyXFwoW1xcc10qKFteLCldKilbXFxzXSosP1tcXHNdKigoPzpbXiwpXSopfCg/OlteO10qXFwoW147KV0qXFwpKSlbXFxzXSo/XFwpL2dpLFxuVkFSX0NBUFRVUkU6IC9cXChbXFxzXSooLS1bXixcXHMpXSopKD86LFtcXHNdKigtLVteLFxccyldKikpPyg/OlxcKXwsKS9naSxcbklTX1ZBUjogL14tLS8sXG5CUkFDS0VURUQ6IC9cXHtbXn1dKlxcfS9nLFxuSE9TVF9QUkVGSVg6ICcoPzpefFteLiNbOl0pJyxcbkhPU1RfU1VGRklYOiAnKCR8Wy46W1xcXFxzPit+XSknXG59LFxuSE9TVF9TRUxFQ1RPUlM6IFsnOmhvc3QnXSxcblNDT1BFX1NFTEVDVE9SUzogWyc6cm9vdCddLFxuWFNDT1BFX05BTUU6ICd4LXNjb3BlJ1xufTtcbmZ1bmN0aW9uIGFkZFRvQml0TWFzayhuLCBiaXRzKSB7XG52YXIgbyA9IHBhcnNlSW50KG4gLyAzMik7XG52YXIgdiA9IDEgPDwgbiAlIDMyO1xuYml0c1tvXSA9IChiaXRzW29dIHx8IDApIHwgdjtcbn1cbn0oKTtcbihmdW5jdGlvbiAoKSB7XG5Qb2x5bWVyLlN0eWxlQ2FjaGUgPSBmdW5jdGlvbiAoKSB7XG50aGlzLmNhY2hlID0ge307XG59O1xuUG9seW1lci5TdHlsZUNhY2hlLnByb3RvdHlwZSA9IHtcbk1BWDogMTAwLFxuc3RvcmU6IGZ1bmN0aW9uIChpcywgZGF0YSwga2V5VmFsdWVzLCBrZXlTdHlsZXMpIHtcbmRhdGEua2V5VmFsdWVzID0ga2V5VmFsdWVzO1xuZGF0YS5zdHlsZXMgPSBrZXlTdHlsZXM7XG52YXIgcyQgPSB0aGlzLmNhY2hlW2lzXSA9IHRoaXMuY2FjaGVbaXNdIHx8IFtdO1xucyQucHVzaChkYXRhKTtcbmlmIChzJC5sZW5ndGggPiB0aGlzLk1BWCkge1xucyQuc2hpZnQoKTtcbn1cbn0sXG5yZXRyaWV2ZTogZnVuY3Rpb24gKGlzLCBrZXlWYWx1ZXMsIGtleVN0eWxlcykge1xudmFyIGNhY2hlID0gdGhpcy5jYWNoZVtpc107XG5pZiAoY2FjaGUpIHtcbmZvciAodmFyIGkgPSBjYWNoZS5sZW5ndGggLSAxLCBkYXRhOyBpID49IDA7IGktLSkge1xuZGF0YSA9IGNhY2hlW2ldO1xuaWYgKGtleVN0eWxlcyA9PT0gZGF0YS5zdHlsZXMgJiYgdGhpcy5fb2JqZWN0c0VxdWFsKGtleVZhbHVlcywgZGF0YS5rZXlWYWx1ZXMpKSB7XG5yZXR1cm4gZGF0YTtcbn1cbn1cbn1cbn0sXG5jbGVhcjogZnVuY3Rpb24gKCkge1xudGhpcy5jYWNoZSA9IHt9O1xufSxcbl9vYmplY3RzRXF1YWw6IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xudmFyIHQsIHM7XG5mb3IgKHZhciBpIGluIHRhcmdldCkge1xudCA9IHRhcmdldFtpXSwgcyA9IHNvdXJjZVtpXTtcbmlmICghKHR5cGVvZiB0ID09PSAnb2JqZWN0JyAmJiB0ID8gdGhpcy5fb2JqZWN0c1N0cmljdGx5RXF1YWwodCwgcykgOiB0ID09PSBzKSkge1xucmV0dXJuIGZhbHNlO1xufVxufVxuaWYgKEFycmF5LmlzQXJyYXkodGFyZ2V0KSkge1xucmV0dXJuIHRhcmdldC5sZW5ndGggPT09IHNvdXJjZS5sZW5ndGg7XG59XG5yZXR1cm4gdHJ1ZTtcbn0sXG5fb2JqZWN0c1N0cmljdGx5RXF1YWw6IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xucmV0dXJuIHRoaXMuX29iamVjdHNFcXVhbCh0YXJnZXQsIHNvdXJjZSkgJiYgdGhpcy5fb2JqZWN0c0VxdWFsKHNvdXJjZSwgdGFyZ2V0KTtcbn1cbn07XG59KCkpO1xuUG9seW1lci5TdHlsZURlZmF1bHRzID0gZnVuY3Rpb24gKCkge1xudmFyIHN0eWxlUHJvcGVydGllcyA9IFBvbHltZXIuU3R5bGVQcm9wZXJ0aWVzO1xudmFyIHN0eWxlVXRpbCA9IFBvbHltZXIuU3R5bGVVdGlsO1xudmFyIFN0eWxlQ2FjaGUgPSBQb2x5bWVyLlN0eWxlQ2FjaGU7XG52YXIgYXBpID0ge1xuX3N0eWxlczogW10sXG5fcHJvcGVydGllczogbnVsbCxcbmN1c3RvbVN0eWxlOiB7fSxcbl9zdHlsZUNhY2hlOiBuZXcgU3R5bGVDYWNoZSgpLFxuYWRkU3R5bGU6IGZ1bmN0aW9uIChzdHlsZSkge1xudGhpcy5fc3R5bGVzLnB1c2goc3R5bGUpO1xudGhpcy5fcHJvcGVydGllcyA9IG51bGw7XG59LFxuZ2V0IF9zdHlsZVByb3BlcnRpZXMoKSB7XG5pZiAoIXRoaXMuX3Byb3BlcnRpZXMpIHtcbnN0eWxlUHJvcGVydGllcy5kZWNvcmF0ZVN0eWxlcyh0aGlzLl9zdHlsZXMpO1xudGhpcy5fc3R5bGVzLl9zY29wZVN0eWxlUHJvcGVydGllcyA9IG51bGw7XG50aGlzLl9wcm9wZXJ0aWVzID0gc3R5bGVQcm9wZXJ0aWVzLnNjb3BlUHJvcGVydGllc0Zyb21TdHlsZXModGhpcy5fc3R5bGVzKTtcbnN0eWxlUHJvcGVydGllcy5taXhpbkN1c3RvbVN0eWxlKHRoaXMuX3Byb3BlcnRpZXMsIHRoaXMuY3VzdG9tU3R5bGUpO1xuc3R5bGVQcm9wZXJ0aWVzLnJlaWZ5KHRoaXMuX3Byb3BlcnRpZXMpO1xufVxucmV0dXJuIHRoaXMuX3Byb3BlcnRpZXM7XG59LFxuX25lZWRzU3R5bGVQcm9wZXJ0aWVzOiBmdW5jdGlvbiAoKSB7XG59LFxuX2NvbXB1dGVTdHlsZVByb3BlcnRpZXM6IGZ1bmN0aW9uICgpIHtcbnJldHVybiB0aGlzLl9zdHlsZVByb3BlcnRpZXM7XG59LFxudXBkYXRlU3R5bGVzOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xudGhpcy5fcHJvcGVydGllcyA9IG51bGw7XG5pZiAocHJvcGVydGllcykge1xuUG9seW1lci5CYXNlLm1peGluKHRoaXMuY3VzdG9tU3R5bGUsIHByb3BlcnRpZXMpO1xufVxudGhpcy5fc3R5bGVDYWNoZS5jbGVhcigpO1xuZm9yICh2YXIgaSA9IDAsIHM7IGkgPCB0aGlzLl9zdHlsZXMubGVuZ3RoOyBpKyspIHtcbnMgPSB0aGlzLl9zdHlsZXNbaV07XG5zID0gcy5fX2ltcG9ydEVsZW1lbnQgfHwgcztcbnMuX2FwcGx5KCk7XG59XG59XG59O1xucmV0dXJuIGFwaTtcbn0oKTtcbihmdW5jdGlvbiAoKSB7XG4ndXNlIHN0cmljdCc7XG52YXIgc2VyaWFsaXplVmFsdWVUb0F0dHJpYnV0ZSA9IFBvbHltZXIuQmFzZS5zZXJpYWxpemVWYWx1ZVRvQXR0cmlidXRlO1xudmFyIHByb3BlcnR5VXRpbHMgPSBQb2x5bWVyLlN0eWxlUHJvcGVydGllcztcbnZhciBzdHlsZVRyYW5zZm9ybWVyID0gUG9seW1lci5TdHlsZVRyYW5zZm9ybWVyO1xudmFyIHN0eWxlVXRpbCA9IFBvbHltZXIuU3R5bGVVdGlsO1xudmFyIHN0eWxlRGVmYXVsdHMgPSBQb2x5bWVyLlN0eWxlRGVmYXVsdHM7XG52YXIgbmF0aXZlU2hhZG93ID0gUG9seW1lci5TZXR0aW5ncy51c2VOYXRpdmVTaGFkb3c7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX3ByZXBTdHlsZVByb3BlcnRpZXM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX293blN0eWxlUHJvcGVydHlOYW1lcyA9IHRoaXMuX3N0eWxlcyA/IHByb3BlcnR5VXRpbHMuZGVjb3JhdGVTdHlsZXModGhpcy5fc3R5bGVzKSA6IFtdO1xufSxcbl9zZXR1cFN0eWxlUHJvcGVydGllczogZnVuY3Rpb24gKCkge1xudGhpcy5jdXN0b21TdHlsZSA9IHt9O1xufSxcbl9uZWVkc1N0eWxlUHJvcGVydGllczogZnVuY3Rpb24gKCkge1xucmV0dXJuIEJvb2xlYW4odGhpcy5fb3duU3R5bGVQcm9wZXJ0eU5hbWVzICYmIHRoaXMuX293blN0eWxlUHJvcGVydHlOYW1lcy5sZW5ndGgpO1xufSxcbl9iZWZvcmVBdHRhY2hlZDogZnVuY3Rpb24gKCkge1xuaWYgKCF0aGlzLl9zY29wZVNlbGVjdG9yICYmIHRoaXMuX25lZWRzU3R5bGVQcm9wZXJ0aWVzKCkpIHtcbnRoaXMuX3VwZGF0ZVN0eWxlUHJvcGVydGllcygpO1xufVxufSxcbl91cGRhdGVTdHlsZVByb3BlcnRpZXM6IGZ1bmN0aW9uICgpIHtcbnZhciBpbmZvLCBzY29wZSA9IHRoaXMuZG9tSG9zdCB8fCBzdHlsZURlZmF1bHRzO1xuaWYgKCFzY29wZS5fc3R5bGVDYWNoZSkge1xuc2NvcGUuX3N0eWxlQ2FjaGUgPSBuZXcgUG9seW1lci5TdHlsZUNhY2hlKCk7XG59XG52YXIgc2NvcGVEYXRhID0gcHJvcGVydHlVdGlscy5wcm9wZXJ0eURhdGFGcm9tU3R5bGVzKHNjb3BlLl9zdHlsZXMsIHRoaXMpO1xuc2NvcGVEYXRhLmtleS5jdXN0b21TdHlsZSA9IHRoaXMuY3VzdG9tU3R5bGU7XG5pbmZvID0gc2NvcGUuX3N0eWxlQ2FjaGUucmV0cmlldmUodGhpcy5pcywgc2NvcGVEYXRhLmtleSwgdGhpcy5fc3R5bGVzKTtcbnZhciBzY29wZUNhY2hlZCA9IEJvb2xlYW4oaW5mbyk7XG5pZiAoc2NvcGVDYWNoZWQpIHtcbnRoaXMuX3N0eWxlUHJvcGVydGllcyA9IGluZm8uX3N0eWxlUHJvcGVydGllcztcbn0gZWxzZSB7XG50aGlzLl9jb21wdXRlU3R5bGVQcm9wZXJ0aWVzKHNjb3BlRGF0YS5wcm9wZXJ0aWVzKTtcbn1cbnRoaXMuX2NvbXB1dGVPd25TdHlsZVByb3BlcnRpZXMoKTtcbmlmICghc2NvcGVDYWNoZWQpIHtcbmluZm8gPSBzdHlsZUNhY2hlLnJldHJpZXZlKHRoaXMuaXMsIHRoaXMuX293blN0eWxlUHJvcGVydGllcywgdGhpcy5fc3R5bGVzKTtcbn1cbnZhciBnbG9iYWxDYWNoZWQgPSBCb29sZWFuKGluZm8pICYmICFzY29wZUNhY2hlZDtcbnZhciBzdHlsZSA9IHRoaXMuX2FwcGx5U3R5bGVQcm9wZXJ0aWVzKGluZm8pO1xuaWYgKCFzY29wZUNhY2hlZCkge1xuc3R5bGUgPSBzdHlsZSAmJiBuYXRpdmVTaGFkb3cgPyBzdHlsZS5jbG9uZU5vZGUodHJ1ZSkgOiBzdHlsZTtcbmluZm8gPSB7XG5zdHlsZTogc3R5bGUsXG5fc2NvcGVTZWxlY3RvcjogdGhpcy5fc2NvcGVTZWxlY3Rvcixcbl9zdHlsZVByb3BlcnRpZXM6IHRoaXMuX3N0eWxlUHJvcGVydGllc1xufTtcbnNjb3BlRGF0YS5rZXkuY3VzdG9tU3R5bGUgPSB7fTtcbnRoaXMubWl4aW4oc2NvcGVEYXRhLmtleS5jdXN0b21TdHlsZSwgdGhpcy5jdXN0b21TdHlsZSk7XG5zY29wZS5fc3R5bGVDYWNoZS5zdG9yZSh0aGlzLmlzLCBpbmZvLCBzY29wZURhdGEua2V5LCB0aGlzLl9zdHlsZXMpO1xuaWYgKCFnbG9iYWxDYWNoZWQpIHtcbnN0eWxlQ2FjaGUuc3RvcmUodGhpcy5pcywgT2JqZWN0LmNyZWF0ZShpbmZvKSwgdGhpcy5fb3duU3R5bGVQcm9wZXJ0aWVzLCB0aGlzLl9zdHlsZXMpO1xufVxufVxufSxcbl9jb21wdXRlU3R5bGVQcm9wZXJ0aWVzOiBmdW5jdGlvbiAoc2NvcGVQcm9wcykge1xudmFyIHNjb3BlID0gdGhpcy5kb21Ib3N0IHx8IHN0eWxlRGVmYXVsdHM7XG5pZiAoIXNjb3BlLl9zdHlsZVByb3BlcnRpZXMpIHtcbnNjb3BlLl9jb21wdXRlU3R5bGVQcm9wZXJ0aWVzKCk7XG59XG52YXIgcHJvcHMgPSBPYmplY3QuY3JlYXRlKHNjb3BlLl9zdHlsZVByb3BlcnRpZXMpO1xudGhpcy5taXhpbihwcm9wcywgcHJvcGVydHlVdGlscy5ob3N0UHJvcGVydGllc0Zyb21TdHlsZXModGhpcy5fc3R5bGVzKSk7XG5zY29wZVByb3BzID0gc2NvcGVQcm9wcyB8fCBwcm9wZXJ0eVV0aWxzLnByb3BlcnR5RGF0YUZyb21TdHlsZXMoc2NvcGUuX3N0eWxlcywgdGhpcykucHJvcGVydGllcztcbnRoaXMubWl4aW4ocHJvcHMsIHNjb3BlUHJvcHMpO1xudGhpcy5taXhpbihwcm9wcywgcHJvcGVydHlVdGlscy5zY29wZVByb3BlcnRpZXNGcm9tU3R5bGVzKHRoaXMuX3N0eWxlcykpO1xucHJvcGVydHlVdGlscy5taXhpbkN1c3RvbVN0eWxlKHByb3BzLCB0aGlzLmN1c3RvbVN0eWxlKTtcbnByb3BlcnR5VXRpbHMucmVpZnkocHJvcHMpO1xudGhpcy5fc3R5bGVQcm9wZXJ0aWVzID0gcHJvcHM7XG59LFxuX2NvbXB1dGVPd25TdHlsZVByb3BlcnRpZXM6IGZ1bmN0aW9uICgpIHtcbnZhciBwcm9wcyA9IHt9O1xuZm9yICh2YXIgaSA9IDAsIG47IGkgPCB0aGlzLl9vd25TdHlsZVByb3BlcnR5TmFtZXMubGVuZ3RoOyBpKyspIHtcbm4gPSB0aGlzLl9vd25TdHlsZVByb3BlcnR5TmFtZXNbaV07XG5wcm9wc1tuXSA9IHRoaXMuX3N0eWxlUHJvcGVydGllc1tuXTtcbn1cbnRoaXMuX293blN0eWxlUHJvcGVydGllcyA9IHByb3BzO1xufSxcbl9zY29wZUNvdW50OiAwLFxuX2FwcGx5U3R5bGVQcm9wZXJ0aWVzOiBmdW5jdGlvbiAoaW5mbykge1xudmFyIG9sZFNjb3BlU2VsZWN0b3IgPSB0aGlzLl9zY29wZVNlbGVjdG9yO1xudGhpcy5fc2NvcGVTZWxlY3RvciA9IGluZm8gPyBpbmZvLl9zY29wZVNlbGVjdG9yIDogdGhpcy5pcyArICctJyArIHRoaXMuX19wcm90b19fLl9zY29wZUNvdW50Kys7XG52YXIgc3R5bGUgPSBwcm9wZXJ0eVV0aWxzLmFwcGx5RWxlbWVudFN0eWxlKHRoaXMsIHRoaXMuX3N0eWxlUHJvcGVydGllcywgdGhpcy5fc2NvcGVTZWxlY3RvciwgaW5mbyAmJiBpbmZvLnN0eWxlKTtcbmlmICghbmF0aXZlU2hhZG93KSB7XG5wcm9wZXJ0eVV0aWxzLmFwcGx5RWxlbWVudFNjb3BlU2VsZWN0b3IodGhpcywgdGhpcy5fc2NvcGVTZWxlY3Rvciwgb2xkU2NvcGVTZWxlY3RvciwgdGhpcy5fc2NvcGVDc3NWaWFBdHRyKTtcbn1cbnJldHVybiBzdHlsZTtcbn0sXG5zZXJpYWxpemVWYWx1ZVRvQXR0cmlidXRlOiBmdW5jdGlvbiAodmFsdWUsIGF0dHJpYnV0ZSwgbm9kZSkge1xubm9kZSA9IG5vZGUgfHwgdGhpcztcbmlmIChhdHRyaWJ1dGUgPT09ICdjbGFzcycpIHtcbnZhciBob3N0ID0gbm9kZSA9PT0gdGhpcyA/IHRoaXMuZG9tSG9zdCB8fCB0aGlzLmRhdGFIb3N0IDogdGhpcztcbmlmIChob3N0KSB7XG52YWx1ZSA9IGhvc3QuX3Njb3BlRWxlbWVudENsYXNzKG5vZGUsIHZhbHVlKTtcbn1cbn1cbm5vZGUgPSBQb2x5bWVyLmRvbShub2RlKTtcbnNlcmlhbGl6ZVZhbHVlVG9BdHRyaWJ1dGUuY2FsbCh0aGlzLCB2YWx1ZSwgYXR0cmlidXRlLCBub2RlKTtcbn0sXG5fc2NvcGVFbGVtZW50Q2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBzZWxlY3Rvcikge1xuaWYgKCFuYXRpdmVTaGFkb3cgJiYgIXRoaXMuX3Njb3BlQ3NzVmlhQXR0cikge1xuc2VsZWN0b3IgKz0gKHNlbGVjdG9yID8gJyAnIDogJycpICsgU0NPUEVfTkFNRSArICcgJyArIHRoaXMuaXMgKyAoZWxlbWVudC5fc2NvcGVTZWxlY3RvciA/ICcgJyArIFhTQ09QRV9OQU1FICsgJyAnICsgZWxlbWVudC5fc2NvcGVTZWxlY3RvciA6ICcnKTtcbn1cbnJldHVybiBzZWxlY3Rvcjtcbn0sXG51cGRhdGVTdHlsZXM6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG5pZiAodGhpcy5pc0F0dGFjaGVkKSB7XG5pZiAocHJvcGVydGllcykge1xudGhpcy5taXhpbih0aGlzLmN1c3RvbVN0eWxlLCBwcm9wZXJ0aWVzKTtcbn1cbmlmICh0aGlzLl9uZWVkc1N0eWxlUHJvcGVydGllcygpKSB7XG50aGlzLl91cGRhdGVTdHlsZVByb3BlcnRpZXMoKTtcbn0gZWxzZSB7XG50aGlzLl9zdHlsZVByb3BlcnRpZXMgPSBudWxsO1xufVxuaWYgKHRoaXMuX3N0eWxlQ2FjaGUpIHtcbnRoaXMuX3N0eWxlQ2FjaGUuY2xlYXIoKTtcbn1cbnRoaXMuX3VwZGF0ZVJvb3RTdHlsZXMoKTtcbn1cbn0sXG5fdXBkYXRlUm9vdFN0eWxlczogZnVuY3Rpb24gKHJvb3QpIHtcbnJvb3QgPSByb290IHx8IHRoaXMucm9vdDtcbnZhciBjJCA9IFBvbHltZXIuZG9tKHJvb3QpLl9xdWVyeShmdW5jdGlvbiAoZSkge1xucmV0dXJuIGUuc2hhZHlSb290IHx8IGUuc2hhZG93Um9vdDtcbn0pO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBjJC5sZW5ndGgsIGM7IGkgPCBsICYmIChjID0gYyRbaV0pOyBpKyspIHtcbmlmIChjLnVwZGF0ZVN0eWxlcykge1xuYy51cGRhdGVTdHlsZXMoKTtcbn1cbn1cbn1cbn0pO1xuUG9seW1lci51cGRhdGVTdHlsZXMgPSBmdW5jdGlvbiAocHJvcGVydGllcykge1xuc3R5bGVEZWZhdWx0cy51cGRhdGVTdHlsZXMocHJvcGVydGllcyk7XG5Qb2x5bWVyLkJhc2UuX3VwZGF0ZVJvb3RTdHlsZXMoZG9jdW1lbnQpO1xufTtcbnZhciBzdHlsZUNhY2hlID0gbmV3IFBvbHltZXIuU3R5bGVDYWNoZSgpO1xuUG9seW1lci5jdXN0b21TdHlsZUNhY2hlID0gc3R5bGVDYWNoZTtcbnZhciBTQ09QRV9OQU1FID0gc3R5bGVUcmFuc2Zvcm1lci5TQ09QRV9OQU1FO1xudmFyIFhTQ09QRV9OQU1FID0gcHJvcGVydHlVdGlscy5YU0NPUEVfTkFNRTtcbn0oKSk7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX3JlZ2lzdGVyRmVhdHVyZXM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3ByZXBJcygpO1xudGhpcy5fcHJlcEF0dHJpYnV0ZXMoKTtcbnRoaXMuX3ByZXBFeHRlbmRzKCk7XG50aGlzLl9wcmVwQ29uc3RydWN0b3IoKTtcbnRoaXMuX3ByZXBUZW1wbGF0ZSgpO1xudGhpcy5fcHJlcFN0eWxlcygpO1xudGhpcy5fcHJlcFN0eWxlUHJvcGVydGllcygpO1xudGhpcy5fcHJlcEFubm90YXRpb25zKCk7XG50aGlzLl9wcmVwRWZmZWN0cygpO1xudGhpcy5fcHJlcEJlaGF2aW9ycygpO1xudGhpcy5fcHJlcEJpbmRpbmdzKCk7XG50aGlzLl9wcmVwU2hhZHkoKTtcbn0sXG5fcHJlcEJlaGF2aW9yOiBmdW5jdGlvbiAoYikge1xudGhpcy5fYWRkUHJvcGVydHlFZmZlY3RzKGIucHJvcGVydGllcyk7XG50aGlzLl9hZGRDb21wbGV4T2JzZXJ2ZXJFZmZlY3RzKGIub2JzZXJ2ZXJzKTtcbnRoaXMuX2FkZEhvc3RBdHRyaWJ1dGVzKGIuaG9zdEF0dHJpYnV0ZXMpO1xufSxcbl9pbml0RmVhdHVyZXM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3Bvb2xDb250ZW50KCk7XG50aGlzLl9zZXR1cENvbmZpZ3VyZSgpO1xudGhpcy5fc2V0dXBTdHlsZVByb3BlcnRpZXMoKTtcbnRoaXMuX3B1c2hIb3N0KCk7XG50aGlzLl9zdGFtcFRlbXBsYXRlKCk7XG50aGlzLl9wb3BIb3N0KCk7XG50aGlzLl9tYXJzaGFsQW5ub3RhdGlvblJlZmVyZW5jZXMoKTtcbnRoaXMuX21hcnNoYWxIb3N0QXR0cmlidXRlcygpO1xudGhpcy5fc2V0dXBEZWJvdW5jZXJzKCk7XG50aGlzLl9tYXJzaGFsSW5zdGFuY2VFZmZlY3RzKCk7XG50aGlzLl9tYXJzaGFsQmVoYXZpb3JzKCk7XG50aGlzLl9tYXJzaGFsQXR0cmlidXRlcygpO1xudGhpcy5fdHJ5UmVhZHkoKTtcbn0sXG5fbWFyc2hhbEJlaGF2aW9yOiBmdW5jdGlvbiAoYikge1xudGhpcy5fbGlzdGVuTGlzdGVuZXJzKGIubGlzdGVuZXJzKTtcbn1cbn0pO1xuKGZ1bmN0aW9uICgpIHtcbnZhciBuYXRpdmVTaGFkb3cgPSBQb2x5bWVyLlNldHRpbmdzLnVzZU5hdGl2ZVNoYWRvdztcbnZhciBwcm9wZXJ0eVV0aWxzID0gUG9seW1lci5TdHlsZVByb3BlcnRpZXM7XG52YXIgc3R5bGVVdGlsID0gUG9seW1lci5TdHlsZVV0aWw7XG52YXIgc3R5bGVEZWZhdWx0cyA9IFBvbHltZXIuU3R5bGVEZWZhdWx0cztcbnZhciBzdHlsZVRyYW5zZm9ybWVyID0gUG9seW1lci5TdHlsZVRyYW5zZm9ybWVyO1xuUG9seW1lcih7XG5pczogJ2N1c3RvbS1zdHlsZScsXG5leHRlbmRzOiAnc3R5bGUnLFxuY3JlYXRlZDogZnVuY3Rpb24gKCkge1xudGhpcy5fdHJ5QXBwbHkoKTtcbn0sXG5hdHRhY2hlZDogZnVuY3Rpb24gKCkge1xudGhpcy5fdHJ5QXBwbHkoKTtcbn0sXG5fdHJ5QXBwbHk6IGZ1bmN0aW9uICgpIHtcbmlmICghdGhpcy5fYXBwbGllc1RvRG9jdW1lbnQpIHtcbmlmICh0aGlzLnBhcmVudE5vZGUgJiYgdGhpcy5wYXJlbnROb2RlLmxvY2FsTmFtZSAhPT0gJ2RvbS1tb2R1bGUnKSB7XG50aGlzLl9hcHBsaWVzVG9Eb2N1bWVudCA9IHRydWU7XG52YXIgZSA9IHRoaXMuX19hcHBsaWVkRWxlbWVudCB8fCB0aGlzO1xuc3R5bGVEZWZhdWx0cy5hZGRTdHlsZShlKTtcbmlmIChlLnRleHRDb250ZW50KSB7XG50aGlzLl9hcHBseSgpO1xufSBlbHNlIHtcbnZhciBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uICgpIHtcbm9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbnRoaXMuX2FwcGx5KCk7XG59LmJpbmQodGhpcykpO1xub2JzZXJ2ZXIub2JzZXJ2ZShlLCB7IGNoaWxkTGlzdDogdHJ1ZSB9KTtcbn1cbn1cbn1cbn0sXG5fYXBwbHk6IGZ1bmN0aW9uICgpIHtcbnZhciBlID0gdGhpcy5fX2FwcGxpZWRFbGVtZW50IHx8IHRoaXM7XG50aGlzLl9jb21wdXRlU3R5bGVQcm9wZXJ0aWVzKCk7XG52YXIgcHJvcHMgPSB0aGlzLl9zdHlsZVByb3BlcnRpZXM7XG52YXIgc2VsZiA9IHRoaXM7XG5lLnRleHRDb250ZW50ID0gc3R5bGVVdGlsLnRvQ3NzVGV4dChzdHlsZVV0aWwucnVsZXNGb3JTdHlsZShlKSwgZnVuY3Rpb24gKHJ1bGUpIHtcbnZhciBjc3MgPSBydWxlLmNzc1RleHQgPSBydWxlLnBhcnNlZENzc1RleHQ7XG5pZiAocnVsZS5wcm9wZXJ0eUluZm8gJiYgcnVsZS5wcm9wZXJ0eUluZm8uY3NzVGV4dCkge1xuY3NzID0gY3NzLnJlcGxhY2UocHJvcGVydHlVdGlscy5yeC5WQVJfQVNTSUdOLCAnJyk7XG5ydWxlLmNzc1RleHQgPSBwcm9wZXJ0eVV0aWxzLnZhbHVlRm9yUHJvcGVydGllcyhjc3MsIHByb3BzKTtcbn1cbnN0eWxlVHJhbnNmb3JtZXIuZG9jdW1lbnRSdWxlKHJ1bGUpO1xufSk7XG59XG59KTtcbn0oKSk7XG5Qb2x5bWVyLlRlbXBsYXRpemVyID0ge1xucHJvcGVydGllczogeyBfX2hpZGVUZW1wbGF0ZUNoaWxkcmVuX186IHsgb2JzZXJ2ZXI6ICdfc2hvd0hpZGVDaGlsZHJlbicgfSB9LFxuX3RlbXBsYXRpemVyU3RhdGljOiB7XG5jb3VudDogMCxcbmNhbGxiYWNrczoge30sXG5kZWJvdW5jZXI6IG51bGxcbn0sXG5faW5zdGFuY2VQcm9wczogUG9seW1lci5ub2IsXG5jcmVhdGVkOiBmdW5jdGlvbiAoKSB7XG50aGlzLl90ZW1wbGF0aXplcklkID0gdGhpcy5fdGVtcGxhdGl6ZXJTdGF0aWMuY291bnQrKztcbn0sXG50ZW1wbGF0aXplOiBmdW5jdGlvbiAodGVtcGxhdGUpIHtcbmlmICghdGVtcGxhdGUuX2NvbnRlbnQpIHtcbnRlbXBsYXRlLl9jb250ZW50ID0gdGVtcGxhdGUuY29udGVudDtcbn1cbmlmICh0ZW1wbGF0ZS5fY29udGVudC5fY3Rvcikge1xudGhpcy5jdG9yID0gdGVtcGxhdGUuX2NvbnRlbnQuX2N0b3I7XG50aGlzLl9wcmVwUGFyZW50UHJvcGVydGllcyh0aGlzLmN0b3IucHJvdG90eXBlLCB0ZW1wbGF0ZSk7XG5yZXR1cm47XG59XG52YXIgYXJjaGV0eXBlID0gT2JqZWN0LmNyZWF0ZShQb2x5bWVyLkJhc2UpO1xudGhpcy5fY3VzdG9tUHJlcEFubm90YXRpb25zKGFyY2hldHlwZSwgdGVtcGxhdGUpO1xuYXJjaGV0eXBlLl9wcmVwRWZmZWN0cygpO1xudGhpcy5fY3VzdG9tUHJlcEVmZmVjdHMoYXJjaGV0eXBlKTtcbmFyY2hldHlwZS5fcHJlcEJlaGF2aW9ycygpO1xuYXJjaGV0eXBlLl9wcmVwQmluZGluZ3MoKTtcbnRoaXMuX3ByZXBQYXJlbnRQcm9wZXJ0aWVzKGFyY2hldHlwZSwgdGVtcGxhdGUpO1xuYXJjaGV0eXBlLl9ub3RpZnlQYXRoID0gdGhpcy5fbm90aWZ5UGF0aEltcGw7XG5hcmNoZXR5cGUuX3Njb3BlRWxlbWVudENsYXNzID0gdGhpcy5fc2NvcGVFbGVtZW50Q2xhc3NJbXBsO1xuYXJjaGV0eXBlLmxpc3RlbiA9IHRoaXMuX2xpc3RlbkltcGw7XG5hcmNoZXR5cGUuX3Nob3dIaWRlQ2hpbGRyZW4gPSB0aGlzLl9zaG93SGlkZUNoaWxkcmVuSW1wbDtcbnZhciBfY29uc3RydWN0b3IgPSB0aGlzLl9jb25zdHJ1Y3RvckltcGw7XG52YXIgY3RvciA9IGZ1bmN0aW9uIFRlbXBsYXRlSW5zdGFuY2UobW9kZWwsIGhvc3QpIHtcbl9jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG1vZGVsLCBob3N0KTtcbn07XG5jdG9yLnByb3RvdHlwZSA9IGFyY2hldHlwZTtcbmFyY2hldHlwZS5jb25zdHJ1Y3RvciA9IGN0b3I7XG50ZW1wbGF0ZS5fY29udGVudC5fY3RvciA9IGN0b3I7XG50aGlzLmN0b3IgPSBjdG9yO1xufSxcbl9nZXRSb290RGF0YUhvc3Q6IGZ1bmN0aW9uICgpIHtcbnJldHVybiB0aGlzLmRhdGFIb3N0ICYmIHRoaXMuZGF0YUhvc3QuX3Jvb3REYXRhSG9zdCB8fCB0aGlzLmRhdGFIb3N0O1xufSxcbl9zaG93SGlkZUNoaWxkcmVuSW1wbDogZnVuY3Rpb24gKGhpZGUpIHtcbnZhciBjID0gdGhpcy5fY2hpbGRyZW47XG5mb3IgKHZhciBpID0gMDsgaSA8IGMubGVuZ3RoOyBpKyspIHtcbnZhciBuID0gY1tpXTtcbmlmIChuLnN0eWxlKSB7XG5uLnN0eWxlLmRpc3BsYXkgPSBoaWRlID8gJ25vbmUnIDogJyc7XG5uLl9faGlkZVRlbXBsYXRlQ2hpbGRyZW5fXyA9IGhpZGU7XG59XG59XG59LFxuX2RlYm91bmNlVGVtcGxhdGU6IGZ1bmN0aW9uIChmbikge1xudGhpcy5fdGVtcGxhdGl6ZXJTdGF0aWMuY2FsbGJhY2tzW3RoaXMuX3RlbXBsYXRpemVySWRdID0gZm4uYmluZCh0aGlzKTtcbnRoaXMuX3RlbXBsYXRpemVyU3RhdGljLmRlYm91bmNlciA9IFBvbHltZXIuRGVib3VuY2UodGhpcy5fdGVtcGxhdGl6ZXJTdGF0aWMuZGVib3VuY2VyLCB0aGlzLl9mbHVzaFRlbXBsYXRlcy5iaW5kKHRoaXMsIHRydWUpKTtcbn0sXG5fZmx1c2hUZW1wbGF0ZXM6IGZ1bmN0aW9uIChkZWJvdW5jZXJFeHBpcmVkKSB7XG52YXIgZGIgPSB0aGlzLl90ZW1wbGF0aXplclN0YXRpYy5kZWJvdW5jZXI7XG53aGlsZSAoZGVib3VuY2VyRXhwaXJlZCB8fCBkYiAmJiBkYi5maW5pc2gpIHtcbmRiLnN0b3AoKTtcbnZhciBjYnMgPSB0aGlzLl90ZW1wbGF0aXplclN0YXRpYy5jYWxsYmFja3M7XG50aGlzLl90ZW1wbGF0aXplclN0YXRpYy5jYWxsYmFja3MgPSB7fTtcbmZvciAodmFyIGlkIGluIGNicykge1xuY2JzW2lkXSgpO1xufVxuZGVib3VuY2VyRXhwaXJlZCA9IGZhbHNlO1xufVxufSxcbl9jdXN0b21QcmVwRWZmZWN0czogZnVuY3Rpb24gKGFyY2hldHlwZSkge1xudmFyIHBhcmVudFByb3BzID0gYXJjaGV0eXBlLl9wYXJlbnRQcm9wcztcbmZvciAodmFyIHByb3AgaW4gcGFyZW50UHJvcHMpIHtcbmFyY2hldHlwZS5fYWRkUHJvcGVydHlFZmZlY3QocHJvcCwgJ2Z1bmN0aW9uJywgdGhpcy5fY3JlYXRlSG9zdFByb3BFZmZlY3Rvcihwcm9wKSk7XG59XG5mb3IgKHZhciBwcm9wIGluIHRoaXMuX2luc3RhbmNlUHJvcHMpIHtcbmFyY2hldHlwZS5fYWRkUHJvcGVydHlFZmZlY3QocHJvcCwgJ2Z1bmN0aW9uJywgdGhpcy5fY3JlYXRlSW5zdGFuY2VQcm9wRWZmZWN0b3IocHJvcCkpO1xufVxufSxcbl9jdXN0b21QcmVwQW5ub3RhdGlvbnM6IGZ1bmN0aW9uIChhcmNoZXR5cGUsIHRlbXBsYXRlKSB7XG5hcmNoZXR5cGUuX3RlbXBsYXRlID0gdGVtcGxhdGU7XG52YXIgYyA9IHRlbXBsYXRlLl9jb250ZW50O1xuaWYgKCFjLl9ub3Rlcykge1xudmFyIHJvb3REYXRhSG9zdCA9IGFyY2hldHlwZS5fcm9vdERhdGFIb3N0O1xuaWYgKHJvb3REYXRhSG9zdCkge1xuUG9seW1lci5Bbm5vdGF0aW9ucy5wcmVwRWxlbWVudCA9IHJvb3REYXRhSG9zdC5fcHJlcEVsZW1lbnQuYmluZChyb290RGF0YUhvc3QpO1xufVxuYy5fbm90ZXMgPSBQb2x5bWVyLkFubm90YXRpb25zLnBhcnNlQW5ub3RhdGlvbnModGVtcGxhdGUpO1xuUG9seW1lci5Bbm5vdGF0aW9ucy5wcmVwRWxlbWVudCA9IG51bGw7XG50aGlzLl9wcm9jZXNzQW5ub3RhdGlvbnMoYy5fbm90ZXMpO1xufVxuYXJjaGV0eXBlLl9ub3RlcyA9IGMuX25vdGVzO1xuYXJjaGV0eXBlLl9wYXJlbnRQcm9wcyA9IGMuX3BhcmVudFByb3BzO1xufSxcbl9wcmVwUGFyZW50UHJvcGVydGllczogZnVuY3Rpb24gKGFyY2hldHlwZSwgdGVtcGxhdGUpIHtcbnZhciBwYXJlbnRQcm9wcyA9IHRoaXMuX3BhcmVudFByb3BzID0gYXJjaGV0eXBlLl9wYXJlbnRQcm9wcztcbmlmICh0aGlzLl9mb3J3YXJkUGFyZW50UHJvcCAmJiBwYXJlbnRQcm9wcykge1xudmFyIHByb3RvID0gYXJjaGV0eXBlLl9wYXJlbnRQcm9wUHJvdG87XG52YXIgcHJvcDtcbmlmICghcHJvdG8pIHtcbmZvciAocHJvcCBpbiB0aGlzLl9pbnN0YW5jZVByb3BzKSB7XG5kZWxldGUgcGFyZW50UHJvcHNbcHJvcF07XG59XG5wcm90byA9IGFyY2hldHlwZS5fcGFyZW50UHJvcFByb3RvID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbmlmICh0ZW1wbGF0ZSAhPSB0aGlzKSB7XG5Qb2x5bWVyLkJpbmQucHJlcGFyZU1vZGVsKHByb3RvKTtcbn1cbmZvciAocHJvcCBpbiBwYXJlbnRQcm9wcykge1xudmFyIHBhcmVudFByb3AgPSAnX3BhcmVudF8nICsgcHJvcDtcbnZhciBlZmZlY3RzID0gW1xue1xua2luZDogJ2Z1bmN0aW9uJyxcbmVmZmVjdDogdGhpcy5fY3JlYXRlRm9yd2FyZFByb3BFZmZlY3Rvcihwcm9wKVxufSxcbnsga2luZDogJ25vdGlmeScgfVxuXTtcblBvbHltZXIuQmluZC5fY3JlYXRlQWNjZXNzb3JzKHByb3RvLCBwYXJlbnRQcm9wLCBlZmZlY3RzKTtcbn1cbn1cbmlmICh0ZW1wbGF0ZSAhPSB0aGlzKSB7XG5Qb2x5bWVyLkJpbmQucHJlcGFyZUluc3RhbmNlKHRlbXBsYXRlKTtcbnRlbXBsYXRlLl9mb3J3YXJkUGFyZW50UHJvcCA9IHRoaXMuX2ZvcndhcmRQYXJlbnRQcm9wLmJpbmQodGhpcyk7XG59XG50aGlzLl9leHRlbmRUZW1wbGF0ZSh0ZW1wbGF0ZSwgcHJvdG8pO1xufVxufSxcbl9jcmVhdGVGb3J3YXJkUHJvcEVmZmVjdG9yOiBmdW5jdGlvbiAocHJvcCkge1xucmV0dXJuIGZ1bmN0aW9uIChzb3VyY2UsIHZhbHVlKSB7XG50aGlzLl9mb3J3YXJkUGFyZW50UHJvcChwcm9wLCB2YWx1ZSk7XG59O1xufSxcbl9jcmVhdGVIb3N0UHJvcEVmZmVjdG9yOiBmdW5jdGlvbiAocHJvcCkge1xucmV0dXJuIGZ1bmN0aW9uIChzb3VyY2UsIHZhbHVlKSB7XG50aGlzLmRhdGFIb3N0WydfcGFyZW50XycgKyBwcm9wXSA9IHZhbHVlO1xufTtcbn0sXG5fY3JlYXRlSW5zdGFuY2VQcm9wRWZmZWN0b3I6IGZ1bmN0aW9uIChwcm9wKSB7XG5yZXR1cm4gZnVuY3Rpb24gKHNvdXJjZSwgdmFsdWUsIG9sZCwgZnJvbUFib3ZlKSB7XG5pZiAoIWZyb21BYm92ZSkge1xudGhpcy5kYXRhSG9zdC5fZm9yd2FyZEluc3RhbmNlUHJvcCh0aGlzLCBwcm9wLCB2YWx1ZSk7XG59XG59O1xufSxcbl9leHRlbmRUZW1wbGF0ZTogZnVuY3Rpb24gKHRlbXBsYXRlLCBwcm90bykge1xuT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocHJvdG8pLmZvckVhY2goZnVuY3Rpb24gKG4pIHtcbnZhciB2YWwgPSB0ZW1wbGF0ZVtuXTtcbnZhciBwZCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocHJvdG8sIG4pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHRlbXBsYXRlLCBuLCBwZCk7XG5pZiAodmFsICE9PSB1bmRlZmluZWQpIHtcbnRlbXBsYXRlLl9wcm9wZXJ0eVNldHRlcihuLCB2YWwpO1xufVxufSk7XG59LFxuX3Nob3dIaWRlQ2hpbGRyZW46IGZ1bmN0aW9uIChoaWRkZW4pIHtcbn0sXG5fZm9yd2FyZEluc3RhbmNlUGF0aDogZnVuY3Rpb24gKGluc3QsIHBhdGgsIHZhbHVlKSB7XG59LFxuX2ZvcndhcmRJbnN0YW5jZVByb3A6IGZ1bmN0aW9uIChpbnN0LCBwcm9wLCB2YWx1ZSkge1xufSxcbl9ub3RpZnlQYXRoSW1wbDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlKSB7XG52YXIgZGF0YUhvc3QgPSB0aGlzLmRhdGFIb3N0O1xudmFyIGRvdCA9IHBhdGguaW5kZXhPZignLicpO1xudmFyIHJvb3QgPSBkb3QgPCAwID8gcGF0aCA6IHBhdGguc2xpY2UoMCwgZG90KTtcbmRhdGFIb3N0Ll9mb3J3YXJkSW5zdGFuY2VQYXRoLmNhbGwoZGF0YUhvc3QsIHRoaXMsIHBhdGgsIHZhbHVlKTtcbmlmIChyb290IGluIGRhdGFIb3N0Ll9wYXJlbnRQcm9wcykge1xuZGF0YUhvc3Qubm90aWZ5UGF0aCgnX3BhcmVudF8nICsgcGF0aCwgdmFsdWUpO1xufVxufSxcbl9wYXRoRWZmZWN0b3I6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSwgZnJvbUFib3ZlKSB7XG5pZiAodGhpcy5fZm9yd2FyZFBhcmVudFBhdGgpIHtcbmlmIChwYXRoLmluZGV4T2YoJ19wYXJlbnRfJykgPT09IDApIHtcbnRoaXMuX2ZvcndhcmRQYXJlbnRQYXRoKHBhdGguc3Vic3RyaW5nKDgpLCB2YWx1ZSk7XG59XG59XG5Qb2x5bWVyLkJhc2UuX3BhdGhFZmZlY3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufSxcbl9jb25zdHJ1Y3RvckltcGw6IGZ1bmN0aW9uIChtb2RlbCwgaG9zdCkge1xudGhpcy5fcm9vdERhdGFIb3N0ID0gaG9zdC5fZ2V0Um9vdERhdGFIb3N0KCk7XG50aGlzLl9zZXR1cENvbmZpZ3VyZShtb2RlbCk7XG50aGlzLl9wdXNoSG9zdChob3N0KTtcbnRoaXMucm9vdCA9IHRoaXMuaW5zdGFuY2VUZW1wbGF0ZSh0aGlzLl90ZW1wbGF0ZSk7XG50aGlzLnJvb3QuX19ub0NvbnRlbnQgPSAhdGhpcy5fbm90ZXMuX2hhc0NvbnRlbnQ7XG50aGlzLnJvb3QuX19zdHlsZVNjb3BlZCA9IHRydWU7XG50aGlzLl9wb3BIb3N0KCk7XG50aGlzLl9tYXJzaGFsQW5ub3RhdGVkTm9kZXMoKTtcbnRoaXMuX21hcnNoYWxJbnN0YW5jZUVmZmVjdHMoKTtcbnRoaXMuX21hcnNoYWxBbm5vdGF0ZWRMaXN0ZW5lcnMoKTtcbnZhciBjaGlsZHJlbiA9IFtdO1xuZm9yICh2YXIgbiA9IHRoaXMucm9vdC5maXJzdENoaWxkOyBuOyBuID0gbi5uZXh0U2libGluZykge1xuY2hpbGRyZW4ucHVzaChuKTtcbm4uX3RlbXBsYXRlSW5zdGFuY2UgPSB0aGlzO1xufVxudGhpcy5fY2hpbGRyZW4gPSBjaGlsZHJlbjtcbmlmIChob3N0Ll9faGlkZVRlbXBsYXRlQ2hpbGRyZW5fXykge1xudGhpcy5fc2hvd0hpZGVDaGlsZHJlbih0cnVlKTtcbn1cbnRoaXMuX3RyeVJlYWR5KCk7XG59LFxuX2xpc3RlbkltcGw6IGZ1bmN0aW9uIChub2RlLCBldmVudE5hbWUsIG1ldGhvZE5hbWUpIHtcbnZhciBtb2RlbCA9IHRoaXM7XG52YXIgaG9zdCA9IHRoaXMuX3Jvb3REYXRhSG9zdDtcbnZhciBoYW5kbGVyID0gaG9zdC5fY3JlYXRlRXZlbnRIYW5kbGVyKG5vZGUsIGV2ZW50TmFtZSwgbWV0aG9kTmFtZSk7XG52YXIgZGVjb3JhdGVkID0gZnVuY3Rpb24gKGUpIHtcbmUubW9kZWwgPSBtb2RlbDtcbmhhbmRsZXIoZSk7XG59O1xuaG9zdC5fbGlzdGVuKG5vZGUsIGV2ZW50TmFtZSwgZGVjb3JhdGVkKTtcbn0sXG5fc2NvcGVFbGVtZW50Q2xhc3NJbXBsOiBmdW5jdGlvbiAobm9kZSwgdmFsdWUpIHtcbnZhciBob3N0ID0gdGhpcy5fcm9vdERhdGFIb3N0O1xuaWYgKGhvc3QpIHtcbnJldHVybiBob3N0Ll9zY29wZUVsZW1lbnRDbGFzcyhub2RlLCB2YWx1ZSk7XG59XG59LFxuc3RhbXA6IGZ1bmN0aW9uIChtb2RlbCkge1xubW9kZWwgPSBtb2RlbCB8fCB7fTtcbmlmICh0aGlzLl9wYXJlbnRQcm9wcykge1xuZm9yICh2YXIgcHJvcCBpbiB0aGlzLl9wYXJlbnRQcm9wcykge1xubW9kZWxbcHJvcF0gPSB0aGlzWydfcGFyZW50XycgKyBwcm9wXTtcbn1cbn1cbnJldHVybiBuZXcgdGhpcy5jdG9yKG1vZGVsLCB0aGlzKTtcbn0sXG5tb2RlbEZvckVsZW1lbnQ6IGZ1bmN0aW9uIChlbCkge1xudmFyIG1vZGVsO1xud2hpbGUgKGVsKSB7XG5pZiAobW9kZWwgPSBlbC5fdGVtcGxhdGVJbnN0YW5jZSkge1xuaWYgKG1vZGVsLmRhdGFIb3N0ICE9IHRoaXMpIHtcbmVsID0gbW9kZWwuZGF0YUhvc3Q7XG59IGVsc2Uge1xucmV0dXJuIG1vZGVsO1xufVxufSBlbHNlIHtcbmVsID0gZWwucGFyZW50Tm9kZTtcbn1cbn1cbn1cbn07XG5Qb2x5bWVyKHtcbmlzOiAnZG9tLXRlbXBsYXRlJyxcbmV4dGVuZHM6ICd0ZW1wbGF0ZScsXG5iZWhhdmlvcnM6IFtQb2x5bWVyLlRlbXBsYXRpemVyXSxcbnJlYWR5OiBmdW5jdGlvbiAoKSB7XG50aGlzLnRlbXBsYXRpemUodGhpcyk7XG59XG59KTtcblBvbHltZXIuX2NvbGxlY3Rpb25zID0gbmV3IFdlYWtNYXAoKTtcblBvbHltZXIuQ29sbGVjdGlvbiA9IGZ1bmN0aW9uICh1c2VyQXJyYXkpIHtcblBvbHltZXIuX2NvbGxlY3Rpb25zLnNldCh1c2VyQXJyYXksIHRoaXMpO1xudGhpcy51c2VyQXJyYXkgPSB1c2VyQXJyYXk7XG50aGlzLnN0b3JlID0gdXNlckFycmF5LnNsaWNlKCk7XG50aGlzLmluaXRNYXAoKTtcbn07XG5Qb2x5bWVyLkNvbGxlY3Rpb24ucHJvdG90eXBlID0ge1xuY29uc3RydWN0b3I6IFBvbHltZXIuQ29sbGVjdGlvbixcbmluaXRNYXA6IGZ1bmN0aW9uICgpIHtcbnZhciBvbWFwID0gdGhpcy5vbWFwID0gbmV3IFdlYWtNYXAoKTtcbnZhciBwbWFwID0gdGhpcy5wbWFwID0ge307XG52YXIgcyA9IHRoaXMuc3RvcmU7XG5mb3IgKHZhciBpID0gMDsgaSA8IHMubGVuZ3RoOyBpKyspIHtcbnZhciBpdGVtID0gc1tpXTtcbmlmIChpdGVtICYmIHR5cGVvZiBpdGVtID09ICdvYmplY3QnKSB7XG5vbWFwLnNldChpdGVtLCBpKTtcbn0gZWxzZSB7XG5wbWFwW2l0ZW1dID0gaTtcbn1cbn1cbn0sXG5hZGQ6IGZ1bmN0aW9uIChpdGVtKSB7XG52YXIga2V5ID0gdGhpcy5zdG9yZS5wdXNoKGl0ZW0pIC0gMTtcbmlmIChpdGVtICYmIHR5cGVvZiBpdGVtID09ICdvYmplY3QnKSB7XG50aGlzLm9tYXAuc2V0KGl0ZW0sIGtleSk7XG59IGVsc2Uge1xudGhpcy5wbWFwW2l0ZW1dID0ga2V5O1xufVxucmV0dXJuIGtleTtcbn0sXG5yZW1vdmVLZXk6IGZ1bmN0aW9uIChrZXkpIHtcbnRoaXMuX3JlbW92ZUZyb21NYXAodGhpcy5zdG9yZVtrZXldKTtcbmRlbGV0ZSB0aGlzLnN0b3JlW2tleV07XG59LFxuX3JlbW92ZUZyb21NYXA6IGZ1bmN0aW9uIChpdGVtKSB7XG5pZiAoaXRlbSAmJiB0eXBlb2YgaXRlbSA9PSAnb2JqZWN0Jykge1xudGhpcy5vbWFwLmRlbGV0ZShpdGVtKTtcbn0gZWxzZSB7XG5kZWxldGUgdGhpcy5wbWFwW2l0ZW1dO1xufVxufSxcbnJlbW92ZTogZnVuY3Rpb24gKGl0ZW0pIHtcbnZhciBrZXkgPSB0aGlzLmdldEtleShpdGVtKTtcbnRoaXMucmVtb3ZlS2V5KGtleSk7XG5yZXR1cm4ga2V5O1xufSxcbmdldEtleTogZnVuY3Rpb24gKGl0ZW0pIHtcbmlmIChpdGVtICYmIHR5cGVvZiBpdGVtID09ICdvYmplY3QnKSB7XG5yZXR1cm4gdGhpcy5vbWFwLmdldChpdGVtKTtcbn0gZWxzZSB7XG5yZXR1cm4gdGhpcy5wbWFwW2l0ZW1dO1xufVxufSxcbmdldEtleXM6IGZ1bmN0aW9uICgpIHtcbnJldHVybiBPYmplY3Qua2V5cyh0aGlzLnN0b3JlKTtcbn0sXG5zZXRJdGVtOiBmdW5jdGlvbiAoa2V5LCBpdGVtKSB7XG52YXIgb2xkID0gdGhpcy5zdG9yZVtrZXldO1xuaWYgKG9sZCkge1xudGhpcy5fcmVtb3ZlRnJvbU1hcChvbGQpO1xufVxuaWYgKGl0ZW0gJiYgdHlwZW9mIGl0ZW0gPT0gJ29iamVjdCcpIHtcbnRoaXMub21hcC5zZXQoaXRlbSwga2V5KTtcbn0gZWxzZSB7XG50aGlzLnBtYXBbaXRlbV0gPSBrZXk7XG59XG50aGlzLnN0b3JlW2tleV0gPSBpdGVtO1xufSxcbmdldEl0ZW06IGZ1bmN0aW9uIChrZXkpIHtcbnJldHVybiB0aGlzLnN0b3JlW2tleV07XG59LFxuZ2V0SXRlbXM6IGZ1bmN0aW9uICgpIHtcbnZhciBpdGVtcyA9IFtdLCBzdG9yZSA9IHRoaXMuc3RvcmU7XG5mb3IgKHZhciBrZXkgaW4gc3RvcmUpIHtcbml0ZW1zLnB1c2goc3RvcmVba2V5XSk7XG59XG5yZXR1cm4gaXRlbXM7XG59LFxuX2FwcGx5U3BsaWNlczogZnVuY3Rpb24gKHNwbGljZXMpIHtcbnZhciBrZXlTcGxpY2VzID0gW107XG5mb3IgKHZhciBpID0gMDsgaSA8IHNwbGljZXMubGVuZ3RoOyBpKyspIHtcbnZhciBqLCBvLCBrZXksIHMgPSBzcGxpY2VzW2ldO1xudmFyIHJlbW92ZWQgPSBbXTtcbmZvciAoaiA9IDA7IGogPCBzLnJlbW92ZWQubGVuZ3RoOyBqKyspIHtcbm8gPSBzLnJlbW92ZWRbal07XG5rZXkgPSB0aGlzLnJlbW92ZShvKTtcbnJlbW92ZWQucHVzaChrZXkpO1xufVxudmFyIGFkZGVkID0gW107XG5mb3IgKGogPSAwOyBqIDwgcy5hZGRlZENvdW50OyBqKyspIHtcbm8gPSB0aGlzLnVzZXJBcnJheVtzLmluZGV4ICsgal07XG5rZXkgPSB0aGlzLmFkZChvKTtcbmFkZGVkLnB1c2goa2V5KTtcbn1cbmtleVNwbGljZXMucHVzaCh7XG5pbmRleDogcy5pbmRleCxcbnJlbW92ZWQ6IHJlbW92ZWQsXG5yZW1vdmVkSXRlbXM6IHMucmVtb3ZlZCxcbmFkZGVkOiBhZGRlZFxufSk7XG59XG5yZXR1cm4ga2V5U3BsaWNlcztcbn1cbn07XG5Qb2x5bWVyLkNvbGxlY3Rpb24uZ2V0ID0gZnVuY3Rpb24gKHVzZXJBcnJheSkge1xucmV0dXJuIFBvbHltZXIuX2NvbGxlY3Rpb25zLmdldCh1c2VyQXJyYXkpIHx8IG5ldyBQb2x5bWVyLkNvbGxlY3Rpb24odXNlckFycmF5KTtcbn07XG5Qb2x5bWVyLkNvbGxlY3Rpb24uYXBwbHlTcGxpY2VzID0gZnVuY3Rpb24gKHVzZXJBcnJheSwgc3BsaWNlcykge1xudmFyIGNvbGwgPSBQb2x5bWVyLl9jb2xsZWN0aW9ucy5nZXQodXNlckFycmF5KTtcbnJldHVybiBjb2xsID8gY29sbC5fYXBwbHlTcGxpY2VzKHNwbGljZXMpIDogbnVsbDtcbn07XG5Qb2x5bWVyKHtcbmlzOiAnZG9tLXJlcGVhdCcsXG5leHRlbmRzOiAndGVtcGxhdGUnLFxucHJvcGVydGllczoge1xuaXRlbXM6IHsgdHlwZTogQXJyYXkgfSxcbmFzOiB7XG50eXBlOiBTdHJpbmcsXG52YWx1ZTogJ2l0ZW0nXG59LFxuaW5kZXhBczoge1xudHlwZTogU3RyaW5nLFxudmFsdWU6ICdpbmRleCdcbn0sXG5zb3J0OiB7XG50eXBlOiBGdW5jdGlvbixcbm9ic2VydmVyOiAnX3NvcnRDaGFuZ2VkJ1xufSxcbmZpbHRlcjoge1xudHlwZTogRnVuY3Rpb24sXG5vYnNlcnZlcjogJ19maWx0ZXJDaGFuZ2VkJ1xufSxcbm9ic2VydmU6IHtcbnR5cGU6IFN0cmluZyxcbm9ic2VydmVyOiAnX29ic2VydmVDaGFuZ2VkJ1xufSxcbmRlbGF5OiBOdW1iZXJcbn0sXG5iZWhhdmlvcnM6IFtQb2x5bWVyLlRlbXBsYXRpemVyXSxcbm9ic2VydmVyczogWydfaXRlbXNDaGFuZ2VkKGl0ZW1zLiopJ10sXG5kZXRhY2hlZDogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMucm93cykge1xuZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnJvd3MubGVuZ3RoOyBpKyspIHtcbnRoaXMuX2RldGFjaFJvdyhpKTtcbn1cbn1cbn0sXG5hdHRhY2hlZDogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMucm93cykge1xudmFyIHBhcmVudE5vZGUgPSBQb2x5bWVyLmRvbSh0aGlzKS5wYXJlbnROb2RlO1xuZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnJvd3MubGVuZ3RoOyBpKyspIHtcblBvbHltZXIuZG9tKHBhcmVudE5vZGUpLmluc2VydEJlZm9yZSh0aGlzLnJvd3NbaV0ucm9vdCwgdGhpcyk7XG59XG59XG59LFxucmVhZHk6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX2luc3RhbmNlUHJvcHMgPSB7IF9fa2V5X186IHRydWUgfTtcbnRoaXMuX2luc3RhbmNlUHJvcHNbdGhpcy5hc10gPSB0cnVlO1xudGhpcy5faW5zdGFuY2VQcm9wc1t0aGlzLmluZGV4QXNdID0gdHJ1ZTtcbmlmICghdGhpcy5jdG9yKSB7XG50aGlzLnRlbXBsYXRpemUodGhpcyk7XG59XG59LFxuX3NvcnRDaGFuZ2VkOiBmdW5jdGlvbiAoKSB7XG52YXIgZGF0YUhvc3QgPSB0aGlzLl9nZXRSb290RGF0YUhvc3QoKTtcbnZhciBzb3J0ID0gdGhpcy5zb3J0O1xudGhpcy5fc29ydEZuID0gc29ydCAmJiAodHlwZW9mIHNvcnQgPT0gJ2Z1bmN0aW9uJyA/IHNvcnQgOiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gZGF0YUhvc3Rbc29ydF0uYXBwbHkoZGF0YUhvc3QsIGFyZ3VtZW50cyk7XG59KTtcbnRoaXMuX2Z1bGxSZWZyZXNoID0gdHJ1ZTtcbmlmICh0aGlzLml0ZW1zKSB7XG50aGlzLl9kZWJvdW5jZVRlbXBsYXRlKHRoaXMuX3JlbmRlcik7XG59XG59LFxuX2ZpbHRlckNoYW5nZWQ6IGZ1bmN0aW9uICgpIHtcbnZhciBkYXRhSG9zdCA9IHRoaXMuX2dldFJvb3REYXRhSG9zdCgpO1xudmFyIGZpbHRlciA9IHRoaXMuZmlsdGVyO1xudGhpcy5fZmlsdGVyRm4gPSBmaWx0ZXIgJiYgKHR5cGVvZiBmaWx0ZXIgPT0gJ2Z1bmN0aW9uJyA/IGZpbHRlciA6IGZ1bmN0aW9uICgpIHtcbnJldHVybiBkYXRhSG9zdFtmaWx0ZXJdLmFwcGx5KGRhdGFIb3N0LCBhcmd1bWVudHMpO1xufSk7XG50aGlzLl9mdWxsUmVmcmVzaCA9IHRydWU7XG5pZiAodGhpcy5pdGVtcykge1xudGhpcy5fZGVib3VuY2VUZW1wbGF0ZSh0aGlzLl9yZW5kZXIpO1xufVxufSxcbl9vYnNlcnZlQ2hhbmdlZDogZnVuY3Rpb24gKCkge1xudGhpcy5fb2JzZXJ2ZVBhdGhzID0gdGhpcy5vYnNlcnZlICYmIHRoaXMub2JzZXJ2ZS5yZXBsYWNlKCcuKicsICcuJykuc3BsaXQoJyAnKTtcbn0sXG5faXRlbXNDaGFuZ2VkOiBmdW5jdGlvbiAoY2hhbmdlKSB7XG5pZiAoY2hhbmdlLnBhdGggPT0gJ2l0ZW1zJykge1xuaWYgKEFycmF5LmlzQXJyYXkodGhpcy5pdGVtcykpIHtcbnRoaXMuY29sbGVjdGlvbiA9IFBvbHltZXIuQ29sbGVjdGlvbi5nZXQodGhpcy5pdGVtcyk7XG59IGVsc2UgaWYgKCF0aGlzLml0ZW1zKSB7XG50aGlzLmNvbGxlY3Rpb24gPSBudWxsO1xufSBlbHNlIHtcbnRoaXMuX2Vycm9yKHRoaXMuX2xvZ2YoJ2RvbS1yZXBlYXQnLCAnZXhwZWN0ZWQgYXJyYXkgZm9yIGBpdGVtc2AsJyArICcgZm91bmQnLCB0aGlzLml0ZW1zKSk7XG59XG50aGlzLl9zcGxpY2VzID0gW107XG50aGlzLl9mdWxsUmVmcmVzaCA9IHRydWU7XG50aGlzLl9kZWJvdW5jZVRlbXBsYXRlKHRoaXMuX3JlbmRlcik7XG59IGVsc2UgaWYgKGNoYW5nZS5wYXRoID09ICdpdGVtcy5zcGxpY2VzJykge1xudGhpcy5fc3BsaWNlcyA9IHRoaXMuX3NwbGljZXMuY29uY2F0KGNoYW5nZS52YWx1ZS5rZXlTcGxpY2VzKTtcbnRoaXMuX2RlYm91bmNlVGVtcGxhdGUodGhpcy5fcmVuZGVyKTtcbn0gZWxzZSB7XG52YXIgc3VicGF0aCA9IGNoYW5nZS5wYXRoLnNsaWNlKDYpO1xudGhpcy5fZm9yd2FyZEl0ZW1QYXRoKHN1YnBhdGgsIGNoYW5nZS52YWx1ZSk7XG50aGlzLl9jaGVja09ic2VydmVkUGF0aHMoc3VicGF0aCk7XG59XG59LFxuX2NoZWNrT2JzZXJ2ZWRQYXRoczogZnVuY3Rpb24gKHBhdGgpIHtcbmlmICh0aGlzLl9vYnNlcnZlUGF0aHMpIHtcbnBhdGggPSBwYXRoLnN1YnN0cmluZyhwYXRoLmluZGV4T2YoJy4nKSArIDEpO1xudmFyIHBhdGhzID0gdGhpcy5fb2JzZXJ2ZVBhdGhzO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRocy5sZW5ndGg7IGkrKykge1xuaWYgKHBhdGguaW5kZXhPZihwYXRoc1tpXSkgPT09IDApIHtcbnRoaXMuX2Z1bGxSZWZyZXNoID0gdHJ1ZTtcbmlmICh0aGlzLmRlbGF5KSB7XG50aGlzLmRlYm91bmNlKCdyZW5kZXInLCB0aGlzLl9yZW5kZXIsIHRoaXMuZGVsYXkpO1xufSBlbHNlIHtcbnRoaXMuX2RlYm91bmNlVGVtcGxhdGUodGhpcy5fcmVuZGVyKTtcbn1cbnJldHVybjtcbn1cbn1cbn1cbn0sXG5yZW5kZXI6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX2Z1bGxSZWZyZXNoID0gdHJ1ZTtcbnRoaXMuX2RlYm91bmNlVGVtcGxhdGUodGhpcy5fcmVuZGVyKTtcbnRoaXMuX2ZsdXNoVGVtcGxhdGVzKCk7XG59LFxuX3JlbmRlcjogZnVuY3Rpb24gKCkge1xudmFyIGMgPSB0aGlzLmNvbGxlY3Rpb247XG5pZiAoIXRoaXMuX2Z1bGxSZWZyZXNoKSB7XG5pZiAodGhpcy5fc29ydEZuKSB7XG50aGlzLl9hcHBseVNwbGljZXNWaWV3U29ydCh0aGlzLl9zcGxpY2VzKTtcbn0gZWxzZSB7XG5pZiAodGhpcy5fZmlsdGVyRm4pIHtcbnRoaXMuX2Z1bGxSZWZyZXNoID0gdHJ1ZTtcbn0gZWxzZSB7XG50aGlzLl9hcHBseVNwbGljZXNBcnJheVNvcnQodGhpcy5fc3BsaWNlcyk7XG59XG59XG59XG5pZiAodGhpcy5fZnVsbFJlZnJlc2gpIHtcbnRoaXMuX3NvcnRBbmRGaWx0ZXIoKTtcbnRoaXMuX2Z1bGxSZWZyZXNoID0gZmFsc2U7XG59XG50aGlzLl9zcGxpY2VzID0gW107XG52YXIgcm93Rm9yS2V5ID0gdGhpcy5fcm93Rm9yS2V5ID0ge307XG52YXIga2V5cyA9IHRoaXMuX29yZGVyZWRLZXlzO1xudGhpcy5yb3dzID0gdGhpcy5yb3dzIHx8IFtdO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG52YXIga2V5ID0ga2V5c1tpXTtcbnZhciBpdGVtID0gYy5nZXRJdGVtKGtleSk7XG52YXIgcm93ID0gdGhpcy5yb3dzW2ldO1xucm93Rm9yS2V5W2tleV0gPSBpO1xuaWYgKCFyb3cpIHtcbnRoaXMucm93cy5wdXNoKHJvdyA9IHRoaXMuX2luc2VydFJvdyhpLCBudWxsLCBpdGVtKSk7XG59XG5yb3cuX19zZXRQcm9wZXJ0eSh0aGlzLmFzLCBpdGVtLCB0cnVlKTtcbnJvdy5fX3NldFByb3BlcnR5KCdfX2tleV9fJywga2V5LCB0cnVlKTtcbnJvdy5fX3NldFByb3BlcnR5KHRoaXMuaW5kZXhBcywgaSwgdHJ1ZSk7XG59XG5mb3IgKDsgaSA8IHRoaXMucm93cy5sZW5ndGg7IGkrKykge1xudGhpcy5fZGV0YWNoUm93KGkpO1xufVxudGhpcy5yb3dzLnNwbGljZShrZXlzLmxlbmd0aCwgdGhpcy5yb3dzLmxlbmd0aCAtIGtleXMubGVuZ3RoKTtcbnRoaXMuZmlyZSgnZG9tLWNoYW5nZScpO1xufSxcbl9zb3J0QW5kRmlsdGVyOiBmdW5jdGlvbiAoKSB7XG52YXIgYyA9IHRoaXMuY29sbGVjdGlvbjtcbmlmICghdGhpcy5fc29ydEZuKSB7XG50aGlzLl9vcmRlcmVkS2V5cyA9IFtdO1xudmFyIGl0ZW1zID0gdGhpcy5pdGVtcztcbmlmIChpdGVtcykge1xuZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xudGhpcy5fb3JkZXJlZEtleXMucHVzaChjLmdldEtleShpdGVtc1tpXSkpO1xufVxufVxufSBlbHNlIHtcbnRoaXMuX29yZGVyZWRLZXlzID0gYyA/IGMuZ2V0S2V5cygpIDogW107XG59XG5pZiAodGhpcy5fZmlsdGVyRm4pIHtcbnRoaXMuX29yZGVyZWRLZXlzID0gdGhpcy5fb3JkZXJlZEtleXMuZmlsdGVyKGZ1bmN0aW9uIChhKSB7XG5yZXR1cm4gdGhpcy5fZmlsdGVyRm4oYy5nZXRJdGVtKGEpKTtcbn0sIHRoaXMpO1xufVxuaWYgKHRoaXMuX3NvcnRGbikge1xudGhpcy5fb3JkZXJlZEtleXMuc29ydChmdW5jdGlvbiAoYSwgYikge1xucmV0dXJuIHRoaXMuX3NvcnRGbihjLmdldEl0ZW0oYSksIGMuZ2V0SXRlbShiKSk7XG59LmJpbmQodGhpcykpO1xufVxufSxcbl9rZXlTb3J0OiBmdW5jdGlvbiAoYSwgYikge1xucmV0dXJuIHRoaXMuY29sbGVjdGlvbi5nZXRLZXkoYSkgLSB0aGlzLmNvbGxlY3Rpb24uZ2V0S2V5KGIpO1xufSxcbl9hcHBseVNwbGljZXNWaWV3U29ydDogZnVuY3Rpb24gKHNwbGljZXMpIHtcbnZhciBjID0gdGhpcy5jb2xsZWN0aW9uO1xudmFyIGtleXMgPSB0aGlzLl9vcmRlcmVkS2V5cztcbnZhciByb3dzID0gdGhpcy5yb3dzO1xudmFyIHJlbW92ZWRSb3dzID0gW107XG52YXIgYWRkZWRLZXlzID0gW107XG52YXIgcG9vbCA9IFtdO1xudmFyIHNvcnRGbiA9IHRoaXMuX3NvcnRGbiB8fCB0aGlzLl9rZXlTb3J0LmJpbmQodGhpcyk7XG5zcGxpY2VzLmZvckVhY2goZnVuY3Rpb24gKHMpIHtcbmZvciAodmFyIGkgPSAwOyBpIDwgcy5yZW1vdmVkLmxlbmd0aDsgaSsrKSB7XG52YXIgaWR4ID0gdGhpcy5fcm93Rm9yS2V5W3MucmVtb3ZlZFtpXV07XG5pZiAoaWR4ICE9IG51bGwpIHtcbnJlbW92ZWRSb3dzLnB1c2goaWR4KTtcbn1cbn1cbmZvciAodmFyIGkgPSAwOyBpIDwgcy5hZGRlZC5sZW5ndGg7IGkrKykge1xuYWRkZWRLZXlzLnB1c2gocy5hZGRlZFtpXSk7XG59XG59LCB0aGlzKTtcbmlmIChyZW1vdmVkUm93cy5sZW5ndGgpIHtcbnJlbW92ZWRSb3dzLnNvcnQoKTtcbmZvciAodmFyIGkgPSByZW1vdmVkUm93cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xudmFyIGlkeCA9IHJlbW92ZWRSb3dzW2ldO1xucG9vbC5wdXNoKHRoaXMuX2RldGFjaFJvdyhpZHgpKTtcbnJvd3Muc3BsaWNlKGlkeCwgMSk7XG5rZXlzLnNwbGljZShpZHgsIDEpO1xufVxufVxuaWYgKGFkZGVkS2V5cy5sZW5ndGgpIHtcbmlmICh0aGlzLl9maWx0ZXJGbikge1xuYWRkZWRLZXlzID0gYWRkZWRLZXlzLmZpbHRlcihmdW5jdGlvbiAoYSkge1xucmV0dXJuIHRoaXMuX2ZpbHRlckZuKGMuZ2V0SXRlbShhKSk7XG59LCB0aGlzKTtcbn1cbmFkZGVkS2V5cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG5yZXR1cm4gdGhpcy5fc29ydEZuKGMuZ2V0SXRlbShhKSwgYy5nZXRJdGVtKGIpKTtcbn0uYmluZCh0aGlzKSk7XG52YXIgc3RhcnQgPSAwO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBhZGRlZEtleXMubGVuZ3RoOyBpKyspIHtcbnN0YXJ0ID0gdGhpcy5faW5zZXJ0Um93SW50b1ZpZXdTb3J0KHN0YXJ0LCBhZGRlZEtleXNbaV0sIHBvb2wpO1xufVxufVxufSxcbl9pbnNlcnRSb3dJbnRvVmlld1NvcnQ6IGZ1bmN0aW9uIChzdGFydCwga2V5LCBwb29sKSB7XG52YXIgYyA9IHRoaXMuY29sbGVjdGlvbjtcbnZhciBpdGVtID0gYy5nZXRJdGVtKGtleSk7XG52YXIgZW5kID0gdGhpcy5yb3dzLmxlbmd0aCAtIDE7XG52YXIgaWR4ID0gLTE7XG52YXIgc29ydEZuID0gdGhpcy5fc29ydEZuIHx8IHRoaXMuX2tleVNvcnQuYmluZCh0aGlzKTtcbndoaWxlIChzdGFydCA8PSBlbmQpIHtcbnZhciBtaWQgPSBzdGFydCArIGVuZCA+PiAxO1xudmFyIG1pZEtleSA9IHRoaXMuX29yZGVyZWRLZXlzW21pZF07XG52YXIgY21wID0gc29ydEZuKGMuZ2V0SXRlbShtaWRLZXkpLCBpdGVtKTtcbmlmIChjbXAgPCAwKSB7XG5zdGFydCA9IG1pZCArIDE7XG59IGVsc2UgaWYgKGNtcCA+IDApIHtcbmVuZCA9IG1pZCAtIDE7XG59IGVsc2Uge1xuaWR4ID0gbWlkO1xuYnJlYWs7XG59XG59XG5pZiAoaWR4IDwgMCkge1xuaWR4ID0gZW5kICsgMTtcbn1cbnRoaXMuX29yZGVyZWRLZXlzLnNwbGljZShpZHgsIDAsIGtleSk7XG50aGlzLnJvd3Muc3BsaWNlKGlkeCwgMCwgdGhpcy5faW5zZXJ0Um93KGlkeCwgcG9vbCwgYy5nZXRJdGVtKGtleSkpKTtcbnJldHVybiBpZHg7XG59LFxuX2FwcGx5U3BsaWNlc0FycmF5U29ydDogZnVuY3Rpb24gKHNwbGljZXMpIHtcbnZhciBrZXlzID0gdGhpcy5fb3JkZXJlZEtleXM7XG52YXIgcG9vbCA9IFtdO1xuc3BsaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChzKSB7XG5mb3IgKHZhciBpID0gMDsgaSA8IHMucmVtb3ZlZC5sZW5ndGg7IGkrKykge1xucG9vbC5wdXNoKHRoaXMuX2RldGFjaFJvdyhzLmluZGV4ICsgaSkpO1xufVxudGhpcy5yb3dzLnNwbGljZShzLmluZGV4LCBzLnJlbW92ZWQubGVuZ3RoKTtcbn0sIHRoaXMpO1xudmFyIGMgPSB0aGlzLmNvbGxlY3Rpb247XG5zcGxpY2VzLmZvckVhY2goZnVuY3Rpb24gKHMpIHtcbnZhciBhcmdzID0gW1xucy5pbmRleCxcbnMucmVtb3ZlZC5sZW5ndGhcbl0uY29uY2F0KHMuYWRkZWQpO1xua2V5cy5zcGxpY2UuYXBwbHkoa2V5cywgYXJncyk7XG5mb3IgKHZhciBpID0gMDsgaSA8IHMuYWRkZWQubGVuZ3RoOyBpKyspIHtcbnZhciBpdGVtID0gYy5nZXRJdGVtKHMuYWRkZWRbaV0pO1xudmFyIHJvdyA9IHRoaXMuX2luc2VydFJvdyhzLmluZGV4ICsgaSwgcG9vbCwgaXRlbSk7XG50aGlzLnJvd3Muc3BsaWNlKHMuaW5kZXggKyBpLCAwLCByb3cpO1xufVxufSwgdGhpcyk7XG59LFxuX2RldGFjaFJvdzogZnVuY3Rpb24gKGlkeCkge1xudmFyIHJvdyA9IHRoaXMucm93c1tpZHhdO1xudmFyIHBhcmVudE5vZGUgPSBQb2x5bWVyLmRvbSh0aGlzKS5wYXJlbnROb2RlO1xuZm9yICh2YXIgaSA9IDA7IGkgPCByb3cuX2NoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG52YXIgZWwgPSByb3cuX2NoaWxkcmVuW2ldO1xuUG9seW1lci5kb20ocm93LnJvb3QpLmFwcGVuZENoaWxkKGVsKTtcbn1cbnJldHVybiByb3c7XG59LFxuX2luc2VydFJvdzogZnVuY3Rpb24gKGlkeCwgcG9vbCwgaXRlbSkge1xudmFyIHJvdyA9IHBvb2wgJiYgcG9vbC5wb3AoKSB8fCB0aGlzLl9nZW5lcmF0ZVJvdyhpZHgsIGl0ZW0pO1xudmFyIGJlZm9yZVJvdyA9IHRoaXMucm93c1tpZHhdO1xudmFyIGJlZm9yZU5vZGUgPSBiZWZvcmVSb3cgPyBiZWZvcmVSb3cuX2NoaWxkcmVuWzBdIDogdGhpcztcbnZhciBwYXJlbnROb2RlID0gUG9seW1lci5kb20odGhpcykucGFyZW50Tm9kZTtcblBvbHltZXIuZG9tKHBhcmVudE5vZGUpLmluc2VydEJlZm9yZShyb3cucm9vdCwgYmVmb3JlTm9kZSk7XG5yZXR1cm4gcm93O1xufSxcbl9nZW5lcmF0ZVJvdzogZnVuY3Rpb24gKGlkeCwgaXRlbSkge1xudmFyIG1vZGVsID0geyBfX2tleV9fOiB0aGlzLmNvbGxlY3Rpb24uZ2V0S2V5KGl0ZW0pIH07XG5tb2RlbFt0aGlzLmFzXSA9IGl0ZW07XG5tb2RlbFt0aGlzLmluZGV4QXNdID0gaWR4O1xudmFyIHJvdyA9IHRoaXMuc3RhbXAobW9kZWwpO1xucmV0dXJuIHJvdztcbn0sXG5fc2hvd0hpZGVDaGlsZHJlbjogZnVuY3Rpb24gKGhpZGRlbikge1xuaWYgKHRoaXMucm93cykge1xuZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnJvd3MubGVuZ3RoOyBpKyspIHtcbnRoaXMucm93c1tpXS5fc2hvd0hpZGVDaGlsZHJlbihoaWRkZW4pO1xufVxufVxufSxcbl9mb3J3YXJkSW5zdGFuY2VQcm9wOiBmdW5jdGlvbiAocm93LCBwcm9wLCB2YWx1ZSkge1xuaWYgKHByb3AgPT0gdGhpcy5hcykge1xudmFyIGlkeDtcbmlmICh0aGlzLl9zb3J0Rm4gfHwgdGhpcy5fZmlsdGVyRm4pIHtcbmlkeCA9IHRoaXMuaXRlbXMuaW5kZXhPZih0aGlzLmNvbGxlY3Rpb24uZ2V0SXRlbShyb3cuX19rZXlfXykpO1xufSBlbHNlIHtcbmlkeCA9IHJvd1t0aGlzLmluZGV4QXNdO1xufVxudGhpcy5zZXQoJ2l0ZW1zLicgKyBpZHgsIHZhbHVlKTtcbn1cbn0sXG5fZm9yd2FyZEluc3RhbmNlUGF0aDogZnVuY3Rpb24gKHJvdywgcGF0aCwgdmFsdWUpIHtcbmlmIChwYXRoLmluZGV4T2YodGhpcy5hcyArICcuJykgPT09IDApIHtcbnRoaXMubm90aWZ5UGF0aCgnaXRlbXMuJyArIHJvdy5fX2tleV9fICsgJy4nICsgcGF0aC5zbGljZSh0aGlzLmFzLmxlbmd0aCArIDEpLCB2YWx1ZSk7XG59XG59LFxuX2ZvcndhcmRQYXJlbnRQcm9wOiBmdW5jdGlvbiAocHJvcCwgdmFsdWUpIHtcbmlmICh0aGlzLnJvd3MpIHtcbnRoaXMucm93cy5mb3JFYWNoKGZ1bmN0aW9uIChyb3cpIHtcbnJvdy5fX3NldFByb3BlcnR5KHByb3AsIHZhbHVlLCB0cnVlKTtcbn0sIHRoaXMpO1xufVxufSxcbl9mb3J3YXJkUGFyZW50UGF0aDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlKSB7XG5pZiAodGhpcy5yb3dzKSB7XG50aGlzLnJvd3MuZm9yRWFjaChmdW5jdGlvbiAocm93KSB7XG5yb3cubm90aWZ5UGF0aChwYXRoLCB2YWx1ZSwgdHJ1ZSk7XG59LCB0aGlzKTtcbn1cbn0sXG5fZm9yd2FyZEl0ZW1QYXRoOiBmdW5jdGlvbiAocGF0aCwgdmFsdWUpIHtcbmlmICh0aGlzLl9yb3dGb3JLZXkpIHtcbnZhciBkb3QgPSBwYXRoLmluZGV4T2YoJy4nKTtcbnZhciBrZXkgPSBwYXRoLnN1YnN0cmluZygwLCBkb3QgPCAwID8gcGF0aC5sZW5ndGggOiBkb3QpO1xudmFyIGlkeCA9IHRoaXMuX3Jvd0ZvcktleVtrZXldO1xudmFyIHJvdyA9IHRoaXMucm93c1tpZHhdO1xuaWYgKHJvdykge1xuaWYgKGRvdCA+PSAwKSB7XG5wYXRoID0gdGhpcy5hcyArICcuJyArIHBhdGguc3Vic3RyaW5nKGRvdCArIDEpO1xucm93Lm5vdGlmeVBhdGgocGF0aCwgdmFsdWUsIHRydWUpO1xufSBlbHNlIHtcbnJvdy5fX3NldFByb3BlcnR5KHRoaXMuYXMsIHZhbHVlLCB0cnVlKTtcbn1cbn1cbn1cbn0sXG5pdGVtRm9yRWxlbWVudDogZnVuY3Rpb24gKGVsKSB7XG52YXIgaW5zdGFuY2UgPSB0aGlzLm1vZGVsRm9yRWxlbWVudChlbCk7XG5yZXR1cm4gaW5zdGFuY2UgJiYgaW5zdGFuY2VbdGhpcy5hc107XG59LFxua2V5Rm9yRWxlbWVudDogZnVuY3Rpb24gKGVsKSB7XG52YXIgaW5zdGFuY2UgPSB0aGlzLm1vZGVsRm9yRWxlbWVudChlbCk7XG5yZXR1cm4gaW5zdGFuY2UgJiYgaW5zdGFuY2UuX19rZXlfXztcbn0sXG5pbmRleEZvckVsZW1lbnQ6IGZ1bmN0aW9uIChlbCkge1xudmFyIGluc3RhbmNlID0gdGhpcy5tb2RlbEZvckVsZW1lbnQoZWwpO1xucmV0dXJuIGluc3RhbmNlICYmIGluc3RhbmNlW3RoaXMuaW5kZXhBc107XG59XG59KTtcblBvbHltZXIoe1xuaXM6ICdhcnJheS1zZWxlY3RvcicsXG5wcm9wZXJ0aWVzOiB7XG5pdGVtczoge1xudHlwZTogQXJyYXksXG5vYnNlcnZlcjogJ19pdGVtc0NoYW5nZWQnXG59LFxuc2VsZWN0ZWQ6IHtcbnR5cGU6IE9iamVjdCxcbm5vdGlmeTogdHJ1ZVxufSxcbnRvZ2dsZTogQm9vbGVhbixcbm11bHRpOiBCb29sZWFuXG59LFxuX2l0ZW1zQ2hhbmdlZDogZnVuY3Rpb24gKCkge1xuaWYgKEFycmF5LmlzQXJyYXkodGhpcy5zZWxlY3RlZCkpIHtcbmZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zZWxlY3RlZC5sZW5ndGg7IGkrKykge1xudGhpcy51bmxpbmtQYXRocygnc2VsZWN0ZWQuJyArIGkpO1xufVxufSBlbHNlIHtcbnRoaXMudW5saW5rUGF0aHMoJ3NlbGVjdGVkJyk7XG59XG5pZiAodGhpcy5tdWx0aSkge1xudGhpcy5zZWxlY3RlZCA9IFtdO1xufSBlbHNlIHtcbnRoaXMuc2VsZWN0ZWQgPSBudWxsO1xufVxufSxcbmRlc2VsZWN0OiBmdW5jdGlvbiAoaXRlbSkge1xuaWYgKHRoaXMubXVsdGkpIHtcbnZhciBzY29sID0gUG9seW1lci5Db2xsZWN0aW9uLmdldCh0aGlzLnNlbGVjdGVkKTtcbnZhciBzaWR4ID0gdGhpcy5zZWxlY3RlZC5pbmRleE9mKGl0ZW0pO1xuaWYgKHNpZHggPj0gMCkge1xudmFyIHNrZXkgPSBzY29sLmdldEtleShpdGVtKTtcbnRoaXMuc3BsaWNlKCdzZWxlY3RlZCcsIHNpZHgsIDEpO1xudGhpcy51bmxpbmtQYXRocygnc2VsZWN0ZWQuJyArIHNrZXkpO1xucmV0dXJuIHRydWU7XG59XG59IGVsc2Uge1xudGhpcy5zZWxlY3RlZCA9IG51bGw7XG50aGlzLnVubGlua1BhdGhzKCdzZWxlY3RlZCcpO1xufVxufSxcbnNlbGVjdDogZnVuY3Rpb24gKGl0ZW0pIHtcbnZhciBpY29sID0gUG9seW1lci5Db2xsZWN0aW9uLmdldCh0aGlzLml0ZW1zKTtcbnZhciBrZXkgPSBpY29sLmdldEtleShpdGVtKTtcbmlmICh0aGlzLm11bHRpKSB7XG52YXIgc2NvbCA9IFBvbHltZXIuQ29sbGVjdGlvbi5nZXQodGhpcy5zZWxlY3RlZCk7XG52YXIgc2tleSA9IHNjb2wuZ2V0S2V5KGl0ZW0pO1xuaWYgKHNrZXkgPj0gMCkge1xuaWYgKHRoaXMudG9nZ2xlKSB7XG50aGlzLmRlc2VsZWN0KGl0ZW0pO1xufVxufSBlbHNlIHtcbnRoaXMucHVzaCgnc2VsZWN0ZWQnLCBpdGVtKTtcbnRoaXMuYXN5bmMoZnVuY3Rpb24gKCkge1xuc2tleSA9IHNjb2wuZ2V0S2V5KGl0ZW0pO1xudGhpcy5saW5rUGF0aHMoJ3NlbGVjdGVkLicgKyBza2V5LCAnaXRlbXMuJyArIGtleSk7XG59KTtcbn1cbn0gZWxzZSB7XG5pZiAodGhpcy50b2dnbGUgJiYgaXRlbSA9PSB0aGlzLnNlbGVjdGVkKSB7XG50aGlzLmRlc2VsZWN0KCk7XG59IGVsc2Uge1xudGhpcy5saW5rUGF0aHMoJ3NlbGVjdGVkJywgJ2l0ZW1zLicgKyBrZXkpO1xudGhpcy5zZWxlY3RlZCA9IGl0ZW07XG59XG59XG59XG59KTtcblBvbHltZXIoe1xuaXM6ICdkb20taWYnLFxuZXh0ZW5kczogJ3RlbXBsYXRlJyxcbnByb3BlcnRpZXM6IHtcbidpZic6IHtcbnR5cGU6IEJvb2xlYW4sXG52YWx1ZTogZmFsc2UsXG5vYnNlcnZlcjogJ19xdWV1ZVJlbmRlcidcbn0sXG5yZXN0YW1wOiB7XG50eXBlOiBCb29sZWFuLFxudmFsdWU6IGZhbHNlLFxub2JzZXJ2ZXI6ICdfcXVldWVSZW5kZXInXG59XG59LFxuYmVoYXZpb3JzOiBbUG9seW1lci5UZW1wbGF0aXplcl0sXG5fcXVldWVSZW5kZXI6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX2RlYm91bmNlVGVtcGxhdGUodGhpcy5fcmVuZGVyKTtcbn0sXG5kZXRhY2hlZDogZnVuY3Rpb24gKCkge1xudGhpcy5fdGVhcmRvd25JbnN0YW5jZSgpO1xufSxcbmF0dGFjaGVkOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5pZiAmJiB0aGlzLmN0b3IpIHtcbnRoaXMuYXN5bmModGhpcy5fZW5zdXJlSW5zdGFuY2UpO1xufVxufSxcbnJlbmRlcjogZnVuY3Rpb24gKCkge1xudGhpcy5fZmx1c2hUZW1wbGF0ZXMoKTtcbn0sXG5fcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5pZikge1xuaWYgKCF0aGlzLmN0b3IpIHtcbnRoaXMuX3dyYXBUZXh0Tm9kZXModGhpcy5fY29udGVudCB8fCB0aGlzLmNvbnRlbnQpO1xudGhpcy50ZW1wbGF0aXplKHRoaXMpO1xufVxudGhpcy5fZW5zdXJlSW5zdGFuY2UoKTtcbnRoaXMuX3Nob3dIaWRlQ2hpbGRyZW4oKTtcbn0gZWxzZSBpZiAodGhpcy5yZXN0YW1wKSB7XG50aGlzLl90ZWFyZG93bkluc3RhbmNlKCk7XG59XG5pZiAoIXRoaXMucmVzdGFtcCAmJiB0aGlzLl9pbnN0YW5jZSkge1xudGhpcy5fc2hvd0hpZGVDaGlsZHJlbigpO1xufVxuaWYgKHRoaXMuaWYgIT0gdGhpcy5fbGFzdElmKSB7XG50aGlzLmZpcmUoJ2RvbS1jaGFuZ2UnKTtcbnRoaXMuX2xhc3RJZiA9IHRoaXMuaWY7XG59XG59LFxuX2Vuc3VyZUluc3RhbmNlOiBmdW5jdGlvbiAoKSB7XG5pZiAoIXRoaXMuX2luc3RhbmNlKSB7XG50aGlzLl9pbnN0YW5jZSA9IHRoaXMuc3RhbXAoKTtcbnZhciByb290ID0gdGhpcy5faW5zdGFuY2Uucm9vdDtcbnZhciBwYXJlbnQgPSBQb2x5bWVyLmRvbShQb2x5bWVyLmRvbSh0aGlzKS5wYXJlbnROb2RlKTtcbnBhcmVudC5pbnNlcnRCZWZvcmUocm9vdCwgdGhpcyk7XG59XG59LFxuX3RlYXJkb3duSW5zdGFuY2U6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLl9pbnN0YW5jZSkge1xudmFyIGMgPSB0aGlzLl9pbnN0YW5jZS5fY2hpbGRyZW47XG5pZiAoYykge1xudmFyIHBhcmVudCA9IFBvbHltZXIuZG9tKFBvbHltZXIuZG9tKGNbMF0pLnBhcmVudE5vZGUpO1xuYy5mb3JFYWNoKGZ1bmN0aW9uIChuKSB7XG5wYXJlbnQucmVtb3ZlQ2hpbGQobik7XG59KTtcbn1cbnRoaXMuX2luc3RhbmNlID0gbnVsbDtcbn1cbn0sXG5fd3JhcFRleHROb2RlczogZnVuY3Rpb24gKHJvb3QpIHtcbmZvciAodmFyIG4gPSByb290LmZpcnN0Q2hpbGQ7IG47IG4gPSBuLm5leHRTaWJsaW5nKSB7XG5pZiAobi5ub2RlVHlwZSA9PT0gTm9kZS5URVhUX05PREUgJiYgbi50ZXh0Q29udGVudC50cmltKCkpIHtcbnZhciBzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xucm9vdC5pbnNlcnRCZWZvcmUocywgbik7XG5zLmFwcGVuZENoaWxkKG4pO1xubiA9IHM7XG59XG59XG59LFxuX3Nob3dIaWRlQ2hpbGRyZW46IGZ1bmN0aW9uICgpIHtcbnZhciBoaWRkZW4gPSB0aGlzLl9faGlkZVRlbXBsYXRlQ2hpbGRyZW5fXyB8fCAhdGhpcy5pZjtcbmlmICh0aGlzLl9pbnN0YW5jZSkge1xudGhpcy5faW5zdGFuY2UuX3Nob3dIaWRlQ2hpbGRyZW4oaGlkZGVuKTtcbn1cbn0sXG5fZm9yd2FyZFBhcmVudFByb3A6IGZ1bmN0aW9uIChwcm9wLCB2YWx1ZSkge1xuaWYgKHRoaXMuX2luc3RhbmNlKSB7XG50aGlzLl9pbnN0YW5jZVtwcm9wXSA9IHZhbHVlO1xufVxufSxcbl9mb3J3YXJkUGFyZW50UGF0aDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlKSB7XG5pZiAodGhpcy5faW5zdGFuY2UpIHtcbnRoaXMuX2luc3RhbmNlLm5vdGlmeVBhdGgocGF0aCwgdmFsdWUsIHRydWUpO1xufVxufVxufSk7XG5Qb2x5bWVyLkltcG9ydFN0YXR1cyA9IHtcbl9yZWFkeTogZmFsc2UsXG5fY2FsbGJhY2tzOiBbXSxcbndoZW5Mb2FkZWQ6IGZ1bmN0aW9uIChjYikge1xuaWYgKHRoaXMuX3JlYWR5KSB7XG5jYigpO1xufSBlbHNlIHtcbnRoaXMuX2NhbGxiYWNrcy5wdXNoKGNiKTtcbn1cbn0sXG5faW1wb3J0c0xvYWRlZDogZnVuY3Rpb24gKCkge1xudGhpcy5fcmVhZHkgPSB0cnVlO1xudGhpcy5fY2FsbGJhY2tzLmZvckVhY2goZnVuY3Rpb24gKGNiKSB7XG5jYigpO1xufSk7XG50aGlzLl9jYWxsYmFja3MgPSBbXTtcbn1cbn07XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uICgpIHtcblBvbHltZXIuSW1wb3J0U3RhdHVzLl9pbXBvcnRzTG9hZGVkKCk7XG59KTtcbmlmICh3aW5kb3cuSFRNTEltcG9ydHMpIHtcbkhUTUxJbXBvcnRzLndoZW5SZWFkeShmdW5jdGlvbiAoKSB7XG5Qb2x5bWVyLkltcG9ydFN0YXR1cy5faW1wb3J0c0xvYWRlZCgpO1xufSk7XG59XG5Qb2x5bWVyKHtcbmlzOiAnZG9tLWJpbmQnLFxuZXh0ZW5kczogJ3RlbXBsYXRlJyxcbmNyZWF0ZWQ6IGZ1bmN0aW9uICgpIHtcblBvbHltZXIuSW1wb3J0U3RhdHVzLndoZW5Mb2FkZWQodGhpcy5fcmVhZHlTZWxmLmJpbmQodGhpcykpO1xufSxcbl9yZWdpc3RlckZlYXR1cmVzOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9wcmVwRXh0ZW5kcygpO1xudGhpcy5fcHJlcENvbnN0cnVjdG9yKCk7XG59LFxuX2luc2VydENoaWxkcmVuOiBmdW5jdGlvbiAoKSB7XG52YXIgcGFyZW50RG9tID0gUG9seW1lci5kb20oUG9seW1lci5kb20odGhpcykucGFyZW50Tm9kZSk7XG5wYXJlbnREb20uaW5zZXJ0QmVmb3JlKHRoaXMucm9vdCwgdGhpcyk7XG59LFxuX3JlbW92ZUNoaWxkcmVuOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5fY2hpbGRyZW4pIHtcbmZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbnRoaXMucm9vdC5hcHBlbmRDaGlsZCh0aGlzLl9jaGlsZHJlbltpXSk7XG59XG59XG59LFxuX2luaXRGZWF0dXJlczogZnVuY3Rpb24gKCkge1xufSxcbl9zY29wZUVsZW1lbnRDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG5pZiAodGhpcy5kYXRhSG9zdCkge1xucmV0dXJuIHRoaXMuZGF0YUhvc3QuX3Njb3BlRWxlbWVudENsYXNzKGVsZW1lbnQsIHNlbGVjdG9yKTtcbn0gZWxzZSB7XG5yZXR1cm4gc2VsZWN0b3I7XG59XG59LFxuX3ByZXBDb25maWd1cmU6IGZ1bmN0aW9uICgpIHtcbnZhciBjb25maWcgPSB7fTtcbmZvciAodmFyIHByb3AgaW4gdGhpcy5fcHJvcGVydHlFZmZlY3RzKSB7XG5jb25maWdbcHJvcF0gPSB0aGlzW3Byb3BdO1xufVxudGhpcy5fc2V0dXBDb25maWd1cmUgPSB0aGlzLl9zZXR1cENvbmZpZ3VyZS5iaW5kKHRoaXMsIGNvbmZpZyk7XG59LFxuYXR0YWNoZWQ6IGZ1bmN0aW9uICgpIHtcbmlmICghdGhpcy5fY2hpbGRyZW4pIHtcbnRoaXMuX3RlbXBsYXRlID0gdGhpcztcbnRoaXMuX3ByZXBBbm5vdGF0aW9ucygpO1xudGhpcy5fcHJlcEVmZmVjdHMoKTtcbnRoaXMuX3ByZXBCZWhhdmlvcnMoKTtcbnRoaXMuX3ByZXBDb25maWd1cmUoKTtcbnRoaXMuX3ByZXBCaW5kaW5ncygpO1xuUG9seW1lci5CYXNlLl9pbml0RmVhdHVyZXMuY2FsbCh0aGlzKTtcbnRoaXMuX2NoaWxkcmVuID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5yb290LmNoaWxkTm9kZXMpO1xufVxudGhpcy5faW5zZXJ0Q2hpbGRyZW4oKTtcbnRoaXMuZmlyZSgnZG9tLWNoYW5nZScpO1xufSxcbmRldGFjaGVkOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9yZW1vdmVDaGlsZHJlbigpO1xufVxufSk7XG59KSgpO1xuXG59KSIsImRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZnVuY3Rpb24oKSB7XG52YXIgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXTtcbnZhciByb290ID0gYm9keS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpKTtcbnJvb3Quc2V0QXR0cmlidXRlKFwiaGlkZGVuXCIsXCJcIik7XG5yb290LmlubmVySFRNTD1cIjxkb20tbW9kdWxlIGlkPVxcXCJsb2dpbi1mb3JtXFxcIj48dGVtcGxhdGU+PHN0YXR1cz48L3N0YXR1cz48aXJvbi1jb2xsYXBzZSBpZD1cXFwibG9naW5cXFwiPjxsb2dpbi1hY3Rpb25zPjxhIGhyZWY9XFxcIi9hdXRoL3R3aXR0ZXJcXFwiPjxwYXBlci1idXR0b24gaWQ9XFxcImxvZ2luLWJ1dHRvblxcXCIgY2xhc3M9XFxcInByaW1hcnlcXFwiPkxvZ2luIHdpdGggVHdpdHRlcjwvcGFwZXItYnV0dG9uPjwvYT48YSBocmVmPVxcXCIvYXV0aC9naXRodWJcXFwiPjxwYXBlci1idXR0b24gaWQ9XFxcImxvZ2luLWJ1dHRvblxcXCIgY2xhc3M9XFxcInByaW1hcnlcXFwiPkxvZ2luIHdpdGggR2l0aHViPC9wYXBlci1idXR0b24+PC9hPjwvbG9naW4tYWN0aW9ucz48L2lyb24tY29sbGFwc2U+PGlyb24tY29sbGFwc2UgaWQ9XFxcInJlZ2lzdGVyXFxcIj48aW5wdXQgcGxhY2Vob2xkZXI9XFxcIk5hbWVcXFwiPjxpbnB1dCBwbGFjZWhvbGRlcj1cXFwiRW1haWxcXFwiPjxpbnB1dCBwbGFjZWhvbGRlcj1cXFwiUGFzc3dvcmRcXFwiPjxsb2dpbi1hY3Rpb25zPjxwYXBlci1idXR0b24gaWQ9XFxcInJlZ2lzdGVyLWJ1dHRvblxcXCIgY2xhc3M9XFxcInByaW1hcnlcXFwiPlJlZ2lzdGVyPC9wYXBlci1idXR0b24+PHBhcGVyLWJ1dHRvbiBpZD1cXFwiY2FuY2VsLXJlZ2lzdGVyLWJ1dHRvblxcXCIgY2xhc3M9XFxcImFzaWRlXFxcIj5DYW5jZWw8L3BhcGVyLWJ1dHRvbj48L2xvZ2luLWFjdGlvbnM+PC9pcm9uLWNvbGxhcHNlPjwvdGVtcGxhdGU+PC9kb20tbW9kdWxlPjxzdHlsZT5pbnB1dHtkaXNwbGF5OmJsb2NrO21hcmdpbi1ib3R0b206MTBweDt3aWR0aDoxMDAlfWgxe21hcmdpbi1ib3R0b206MTBweH1sb2dpbi1hY3Rpb25ze2Rpc3BsYXk6YmxvY2s7bWFyZ2luLXRvcDoyMHB4fTwvc3R5bGU+XCI7XG47KGZ1bmN0aW9uKCkge1xuUG9seW1lcih7XG5cbiAgaXM6IFwibG9naW4tZm9ybVwiLFxuICBcbiAgbGlzdGVuZXJzOiB7XG4gICAgJ2xvZ2luLWJ1dHRvbi50YXAnOiAnbG9naW4nLFxuICAgIC8vLSAnc2hvdy1yZWdpc3Rlci1idXR0b24udGFwJzogJ3Nob3dSZWdpc3RlcicsXG4gICAgJ3JlZ2lzdGVyLWJ1dHRvbi50YXAnOiAncmVnaXN0ZXInLFxuICAgICdjYW5jZWwtcmVnaXN0ZXItYnV0dG9uLnRhcCc6ICdjYW5jZWxSZWdpc3RlcidcbiAgfSxcbiAgXG4gIC8vLSBMT0NLRVIgJiBMT0FERURcbiAgcmVhZHkgOiBmdW5jdGlvbigpIHtcbiAgXG4gICAgdmFyIFNvY2tldCAgPSB3aW5kb3cuc29ja2V0O1xuICAgIC8vLSBHYWJiYS5Mb2dpbi5pbml0KCk7XG4gICAgdGhpcy4kLmxvZ2luLnRvZ2dsZSgpOyAvLyBzaG93IGxvZ2luIGZvcm1cbiAgICBcbiAgICBTb2NrZXQub24oJ3VzZXI6Y29ubmVjdGVkJywgZnVuY3Rpb24oIGRhdGEgKSB7XG4gICAgICBjb25zb2xlLmxvZygndXNlciBjb25uZWN0ZWQ6Jyk7XG4gICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICB9KTtcbiAgICBcbiAgfSxcbiAgXG4gIC8vLSBQUk9DRVNTIExPR0lOXG4gIGxvZ2luIDogZnVuY3Rpb24oKSB7XG4gIFxuICAgIC8vLSB2YXIgdSA9IHRoaXMuJC51c2VybmFtZS52YWx1ZSxcbiAgICAgICAgLy8tIGUgPSB0aGlzLiQuZW1haWwudmFsdWUsXG4gICAgdmFyIFNvY2tldCAgPSB3aW5kb3cuc29ja2V0O1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coJ3VzZXIubG9naW4oKScpO1xuICAgIFxuICAgIC8vLSB0aGlzLnNvY2tldCA9IHdpbmRvdy5zb2NrZXQgPSBpby5jb25uZWN0KCBzZXJ2ZXIgKTtcbiAgICBcbiAgICAvLy0gU0VORCBMT0dJTiBUTyBTT0NLRVRcbiAgICBTb2NrZXQuZW1pdCgndXNlcjpsb2dpbicsIHt9KTtcblxuICB9LFxuICBcbiAgLy8tIFBST0NFU1MgUkVHSVNUUkFUSU9OXG4gIHJlZ2lzdGVyIDogZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5pbmZvKCdyZWdpc3RlciB1c2VyJyk7XG4gIH0sXG4gIFxuICAvLy0gU0hPVyBSRUdJU1RFUiBGT1JNXG4gIHNob3dSZWdpc3RlciA6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJC5yZWdpc3Rlci50b2dnbGUoKTtcbiAgICB0aGlzLiQubG9naW4udG9nZ2xlKCk7XG4gIH0sXG4gIFxuICAvLy0gSElERSBSRUdJU1RFUiBGT1JNXG4gIGNhbmNlbFJlZ2lzdGVyIDogZnVuY3Rpb24oKSB7ICAgICAgXG4gICAgdGhpcy4kLnJlZ2lzdGVyLnRvZ2dsZSgpO1xuICAgIHRoaXMuJC5sb2dpbi50b2dnbGUoKTtcbiAgfVxuXG59KTtcbn0pKCk7XG5cbn0pIiwiZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixmdW5jdGlvbigpIHtcbnZhciBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdO1xudmFyIHJvb3QgPSBib2R5LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikpO1xucm9vdC5zZXRBdHRyaWJ1dGUoXCJoaWRkZW5cIixcIlwiKTtcbnJvb3QuaW5uZXJIVE1MPVwiPGRvbS1tb2R1bGUgaWQ9XFxcInJlZ2lzdGVyLWZvcm1cXFwiPjx0ZW1wbGF0ZT48aW1nIHNyYz1cXFwidW5kZWZpbmVkXFxcIiBjbGFzcz1cXFwiYXZhdGFyXFxcIj48aDE+SGkgPC9oMT48aDM+V2UndmUgcHVsbGVkIGluIHlvdSBpbmZvcm1hdGlvbiBmcm9tICwganVzdCBzZWxlY3QgYSB1c2VybmFtZSBhbmQgeW91J3JlIGdvb2QgdG8gZ28hPC9oMz48c2VjdGlvbiBjbGFzcz1cXFwicmVxdWlyZWRcXFwiPjxsYWJlbD51c2VybmFtZTwvbGFiZWw+PGlucHV0IGlkPVxcXCJ1c2VybmFtZVxcXCIgcGxhY2Vob2xkZXI9XFxcIm1yLnJhbW9uZVxcXCIgdmFsdWU9XFxcInVuZGVmaW5lZFxcXCIgY2xhc3M9XFxcIm9rXFxcIj48L3NlY3Rpb24+PHNlY3Rpb24gY2xhc3M9XFxcIm9wdGlvbmFsXFxcIj48aDI+RWRpdCBZb3VyIEluZm88L2gyPjxpbnB1dCBwbGFjZWhvbGRlcj1cXFwiTmFtZVxcXCIgdmFsdWU9XFxcInVuZGVmaW5lZFxcXCI+PGlucHV0IHBsYWNlaG9sZGVyPVxcXCJFbWFpbFxcXCI+PGxhYmVsPkNyZWF0ZSBhIHBhc3N3b3JkIChvcHRpb25hbCk8L2xhYmVsPjxpbnB1dCBwbGFjZWhvbGRlcj1cXFwiUGFzc3dvcmRcXFwiPjwvc2VjdGlvbj48L3RlbXBsYXRlPjwvZG9tLW1vZHVsZT48c3R5bGU+aW5wdXR7ZGlzcGxheTpibG9jazttYXJnaW4tYm90dG9tOjEwcHg7d2lkdGg6MTAwJX1oMXttYXJnaW4tYm90dG9tOjEwcHh9cmVnaXN0ZXItYWN0aW9uc3tkaXNwbGF5OmJsb2NrO21hcmdpbi10b3A6MjBweH08L3N0eWxlPlwiO1xuOyhmdW5jdGlvbigpIHtcblBvbHltZXIoe1xuXG4gIGlzOiBcInJlZ2lzdGVyLWZvcm1cIixcbiAgXG4gIGxpc3RlbmVyczoge1xuICAgIC8vLSAncmVnaXN0ZXItYnV0dG9uLnRhcCc6ICdyZWdpc3RlcicsXG4gICAgLy8tICdzaG93LXJlZ2lzdGVyLWJ1dHRvbi50YXAnOiAnc2hvd1JlZ2lzdGVyJyxcbiAgICAvLy0gJ3JlZ2lzdGVyLWJ1dHRvbi50YXAnOiAncmVnaXN0ZXInLFxuICAgIC8vLSAnY2FuY2VsLXJlZ2lzdGVyLWJ1dHRvbi50YXAnOiAnY2FuY2VsUmVnaXN0ZXInXG4gIH0sXG4gIFxuICAvLy0gTE9DS0VSICYgTE9BREVEXG4gIHJlYWR5IDogZnVuY3Rpb24oKSB7XG4gIFxuICAgIGNvbnNvbGUubG9nKCdDT09LSUVTOicpO1xuICAgIGNvbnNvbGUubG9nKGRvY3VtZW50LmNvb2tpZSk7XG4gIFxuICAgIHZhciBTb2NrZXQgID0gd2luZG93LnNvY2tldDtcbiAgICAvLy0gR2FiYmEuTG9naW4uaW5pdCgpO1xuICAgIC8vLSB0aGlzLiQucmVnaXN0ZXIudG9nZ2xlKCk7IC8vIHNob3cgcmVnaXN0ZXIgZm9ybVxuICAgIFxuICAgIC8vLSBTb2NrZXQub24oJ3VzZXI6Y29ubmVjdGVkJywgZnVuY3Rpb24oIGRhdGEgKSB7XG4gICAgLy8tICAgY29uc29sZS5sb2coJ3VzZXIgY29ubmVjdGVkOicpO1xuICAgIC8vLSAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgIC8vLSB9KTtcbiAgICBcbiAgfSxcbiAgXG4gIC8vLSBQUk9DRVNTIExPR0lOXG4gIHJlZ2lzdGVyIDogZnVuY3Rpb24oKSB7XG4gIFxuICAgIC8vLSB2YXIgdSA9IHRoaXMuJC51c2VybmFtZS52YWx1ZSxcbiAgICAgICAgLy8tIGUgPSB0aGlzLiQuZW1haWwudmFsdWUsXG4gICAgdmFyIFNvY2tldCAgPSB3aW5kb3cuc29ja2V0O1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coJ3VzZXIucmVnaXN0ZXIoKScpO1xuICAgIFxuICAgIC8vLSB0aGlzLnNvY2tldCA9IHdpbmRvdy5zb2NrZXQgPSBpby5jb25uZWN0KCBzZXJ2ZXIgKTtcbiAgICBcbiAgICAvLy0gU0VORCBMT0dJTiBUTyBTT0NLRVRcbiAgICBTb2NrZXQuZW1pdCgndXNlcjpyZWdpc3RlcicsIHt9KTtcblxuICB9LFxuICBcbiAgLy8tIFBST0NFU1MgUkVHSVNUUkFUSU9OXG4gIHJlZ2lzdGVyIDogZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5pbmZvKCdyZWdpc3RlciB1c2VyJyk7XG4gIH0sXG5cblxufSk7XG59KSgpO1xuXG59KSIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgY29uc3QgcG9ydCA9IHdpbmRvdy5sb2NhdGlvbi5wb3J0LFxuICAgICAgICBwcm90b2NvbCA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCArICcvLycsXG4gICAgICAgIGhvc3QgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWU7XG5cbiAgcmV0dXJuIHtcblxuICAgIGluaXQgOiBmdW5jdGlvbiAoIHNlcnZlciApIHtcblxuICAgICAgdGhpcy5zb2NrZXQgPSB3aW5kb3cuc29ja2V0ID0gaW8uY29ubmVjdCggc2VydmVyICk7XG5cbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0ZWQnLCBmdW5jdGlvbiggZGF0YSApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3NvY2tldCBjb25uZWN0ZWQ6ICcpO1xuICAgICAgICBjb25zb2xlLmxvZyhkYXRhLmNvbm5lY3RlZCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zb2NrZXQub24oJ2Vycm9yJywgZnVuY3Rpb24oIGRhdGEgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzb2NrZXQgZXJyb3I6ICcpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGRhdGEuZXJyKTtcbiAgICAgIH0pO1xuXG4gICAgfSxcblxuICAgIGNvbmZpZyA6IHsgIC8vIEdMT0JBTCBDT05GSUcgU0VUVElOR1NcblxuICAgICAgLy8gU0VUIFRPIEZBTFNFIFRPIERJU0FCTEUgTE9HR0lORyBUTyBDT05TT0xFXG4gICAgICBkZWJ1ZyA6IHRydWUsXG5cbiAgICAgIC8vIEJBU0UgVVJMJ1NcbiAgICAgIHVybCA6IHtcbiAgICAgICAgICBiYXNlOiBwcm90b2NvbCArIGhvc3QgKyAoIHBvcnQgIT09ICcnID8gJzonICsgcG9ydCA6ICcnKSArICcvJywgLy9CQVNFIFVSTFxuICAgICAgfVxuXG4gICAgfSAvLyBFTkQgQ09ORklHXG5cbiAgfTtcblxufTtcbiIsIi8vIFBPTFlNRVIgQ09NUE9ORU5UU1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnJlcXVpcmUoXCIuLi9fYm93ZXIvcGFwZXItYnV0dG9uL3BhcGVyLWJ1dHRvbi5odG1sXCIpO1xucmVxdWlyZShcIi4uL19ib3dlci9pcm9uLWNvbGxhcHNlL2lyb24tY29sbGFwc2UuaHRtbFwiKTtcblxudmFyIENvb2tpZXMgPSByZXF1aXJlKFwiLi4vX2Jvd2VyL2Nvb2tpZXMtanMvZGlzdC9jb29raWVzXCIpKHdpbmRvdyksXG4gICAgR2FiYmEgPSB3aW5kb3cuR2FiYmEgPSByZXF1aXJlKFwiLi9fbW9kdWxlcy9nYWJiYVwiKSgpO1xuXG5jb25zb2xlLmxvZyhDb29raWVzKTtcblxuLy8gR0FCQkEgVEVNUExBVEVTXG5yZXF1aXJlKFwiLi4vX2Rpc3QvdGVtcGxhdGVzL2xvZ2luLWZvcm0uaHRtbFwiKTtcbnJlcXVpcmUoXCIuLi9fZGlzdC90ZW1wbGF0ZXMvcmVnaXN0ZXItZm9ybS5odG1sXCIpOyJdfQ==
