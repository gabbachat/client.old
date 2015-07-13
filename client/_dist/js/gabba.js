(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"../polymer/polymer.html":12}],2:[function(require,module,exports){
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
},{"../iron-a11y-keys-behavior/iron-a11y-keys-behavior.html":1,"../polymer/polymer.html":12,"./iron-control-state.html":3}],3:[function(require,module,exports){
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
},{"../polymer/polymer.html":12}],4:[function(require,module,exports){
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
},{"../polymer/polymer.html":12}],5:[function(require,module,exports){
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
},{"../iron-behaviors/iron-button-state.html":2,"../polymer/polymer.html":12}],6:[function(require,module,exports){
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
},{"../paper-behaviors/paper-button-behavior.html":5,"../paper-material/paper-material.html":7,"../paper-ripple/paper-ripple.html":8,"../polymer/polymer.html":12}],7:[function(require,module,exports){
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
},{"../paper-styles/shadow.html":9,"../polymer/polymer.html":12}],8:[function(require,module,exports){
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
},{"../iron-a11y-keys-behavior/iron-a11y-keys-behavior.html":1,"../polymer/polymer.html":12}],9:[function(require,module,exports){
require("../polymer/polymer.html");
document.addEventListener("DOMContentLoaded",function() {
var head = document.getElementsByTagName("head")[0];
head.insertAdjacentHTML("beforeend","<style is=\"custom-style\">:root{--shadow-transition:{transition:box-shadow .28s cubic-bezier(0.4,0,.2,1)};--shadow-none:{box-shadow:none};--shadow-elevation-2dp:{box-shadow:0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12),0 3px 1px -2px rgba(0,0,0,.2)};--shadow-elevation-3dp:{box-shadow:0 3px 4px 0 rgba(0,0,0,.14),0 1px 8px 0 rgba(0,0,0,.12),0 3px 3px -2px rgba(0,0,0,.4)};--shadow-elevation-4dp:{box-shadow:0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12),0 2px 4px -1px rgba(0,0,0,.4)};--shadow-elevation-6dp:{box-shadow:0 6px 10px 0 rgba(0,0,0,.14),0 1px 18px 0 rgba(0,0,0,.12),0 3px 5px -1px rgba(0,0,0,.4)};--shadow-elevation-8dp:{box-shadow:0 8px 10px 1px rgba(0,0,0,.14),0 3px 14px 2px rgba(0,0,0,.12),0 5px 5px -3px rgba(0,0,0,.4)};--shadow-elevation-16dp:{box-shadow:0 16px 24px 2px rgba(0,0,0,.14),0 6px 30px 5px rgba(0,0,0,.12),0 8px 10px -5px rgba(0,0,0,.4)}}</style>");

})
},{"../polymer/polymer.html":12}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
},{"./polymer-micro.html":10}],12:[function(require,module,exports){
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
},{"./polymer-mini.html":11}],13:[function(require,module,exports){
document.addEventListener("DOMContentLoaded",function() {
var body = document.getElementsByTagName("body")[0];
var root = body.appendChild(document.createElement("div"));
root.setAttribute("hidden","");
root.innerHTML="<dom-module id=\"login-form\"><template><status></status><iron-collapse id=\"login\"><input id=\"username\" name=\"username\" placeholder=\"Jiminy Cricket\" class=\"name\"><input id=\"email\" name=\"email\" placeholder=\"jiminy@cricket.com\" type=\"email\" class=\"email\"><login-actions><paper-button id=\"login-button\" class=\"primary\">Login</paper-button><paper-button id=\"show-register-button\" class=\"secondary\">Register</paper-button></login-actions></iron-collapse><iron-collapse id=\"register\"><input placeholder=\"Name\"><input placeholder=\"Email\"><input placeholder=\"Password\"><login-actions><paper-button id=\"register-button\" class=\"primary\">Register</paper-button><paper-button id=\"cancel-register-button\" class=\"aside\">Cancel</paper-button></login-actions></iron-collapse></template></dom-module><style>input{display:block;margin-bottom:10px;width:100%}h1{margin-bottom:10px}login-actions{display:block;margin-top:20px}</style>";
;(function() {
Polymer({

  is: "login-form",
  
  listeners: {
    'login-button.tap': 'login',
    'show-register-button.tap': 'showRegister',
    'register-button.tap': 'register',
    'cancel-register-button.tap': 'cancelRegister'
  },
  
  //- LOCKER & LOADED
  ready : function() {
    Gabba.Login.init();
    this.$.login.toggle(); // show login form
  },
  
  //- PROCESS LOGIN
  login : function() {
  
    var u = this.$.username.value,
        e = this.$.email.value;
    
    //- SEND LOGIN TO SOCKET
    window.socket.emit('user:login', { email : e, user_id : u, room_id : 'general' });

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
},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
"use strict";

module.exports = function () {

  var Socket = window.socket;

  return {

    init: function init(server) {

      // WHEN USER CONNECTS
      window.socket.on("user:connected", function (data) {
        console.log("user connected:");
        console.log(data);
      });
    },

    process: function process(email, user, room_id) {
      console.log("Gabba.Login.process");

      // window.socket.emit('user:login', { email : email, user_id : user, room_id : room_id });
    } };
};

},{}],16:[function(require,module,exports){
// POLYMER COMPONENTS
"use strict";

require("../_bower/paper-button/paper-button.html");
require("../_bower/iron-collapse/iron-collapse.html");

var Gabba = window.Gabba = require("./_modules/gabba")();

Gabba.Login = require("./_modules/login")();

// GABBA TEMPLATES
require("../_dist/templates/login-form.html");

},{"../_bower/iron-collapse/iron-collapse.html":4,"../_bower/paper-button/paper-button.html":6,"../_dist/templates/login-form.html":13,"./_modules/gabba":14,"./_modules/login":15}]},{},[16])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fYm93ZXIvaXJvbi1hMTF5LWtleXMtYmVoYXZpb3IvaXJvbi1hMTF5LWtleXMtYmVoYXZpb3IuaHRtbCIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fYm93ZXIvaXJvbi1iZWhhdmlvcnMvaXJvbi1idXR0b24tc3RhdGUuaHRtbCIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fYm93ZXIvaXJvbi1iZWhhdmlvcnMvaXJvbi1jb250cm9sLXN0YXRlLmh0bWwiLCIvVXNlcnMvamVzc2V3ZWVkL1NpdGVzL2dhYmJhL2NsaWVudC9jbGllbnQvX2Jvd2VyL2lyb24tY29sbGFwc2UvaXJvbi1jb2xsYXBzZS5odG1sIiwiL1VzZXJzL2plc3Nld2VlZC9TaXRlcy9nYWJiYS9jbGllbnQvY2xpZW50L19ib3dlci9wYXBlci1iZWhhdmlvcnMvcGFwZXItYnV0dG9uLWJlaGF2aW9yLmh0bWwiLCIvVXNlcnMvamVzc2V3ZWVkL1NpdGVzL2dhYmJhL2NsaWVudC9jbGllbnQvX2Jvd2VyL3BhcGVyLWJ1dHRvbi9wYXBlci1idXR0b24uaHRtbCIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fYm93ZXIvcGFwZXItbWF0ZXJpYWwvcGFwZXItbWF0ZXJpYWwuaHRtbCIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fYm93ZXIvcGFwZXItcmlwcGxlL3BhcGVyLXJpcHBsZS5odG1sIiwiL1VzZXJzL2plc3Nld2VlZC9TaXRlcy9nYWJiYS9jbGllbnQvY2xpZW50L19ib3dlci9wYXBlci1zdHlsZXMvc2hhZG93Lmh0bWwiLCIvVXNlcnMvamVzc2V3ZWVkL1NpdGVzL2dhYmJhL2NsaWVudC9jbGllbnQvX2Jvd2VyL3BvbHltZXIvcG9seW1lci1taWNyby5odG1sIiwiL1VzZXJzL2plc3Nld2VlZC9TaXRlcy9nYWJiYS9jbGllbnQvY2xpZW50L19ib3dlci9wb2x5bWVyL3BvbHltZXItbWluaS5odG1sIiwiL1VzZXJzL2plc3Nld2VlZC9TaXRlcy9nYWJiYS9jbGllbnQvY2xpZW50L19ib3dlci9wb2x5bWVyL3BvbHltZXIuaHRtbCIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fZGlzdC90ZW1wbGF0ZXMvbG9naW4tZm9ybS5odG1sIiwiL1VzZXJzL2plc3Nld2VlZC9TaXRlcy9nYWJiYS9jbGllbnQvY2xpZW50L2pzL19tb2R1bGVzL2dhYmJhLmpzIiwiL1VzZXJzL2plc3Nld2VlZC9TaXRlcy9nYWJiYS9jbGllbnQvY2xpZW50L2pzL19tb2R1bGVzL2xvZ2luLmpzIiwiL1VzZXJzL2plc3Nld2VlZC9TaXRlcy9nYWJiYS9jbGllbnQvY2xpZW50L2pzL2Zha2VfZjMyODRiMzkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5WkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqa0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzU1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBLFlBQVksQ0FBQzs7QUFFYixNQUFNLENBQUMsT0FBTyxHQUFHLFlBQVk7O0FBRTNCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSTtNQUMzQixRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEdBQUcsSUFBSTtNQUMxQyxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7O0FBRXRDLFNBQU87O0FBRUwsUUFBSSxFQUFHLGNBQVcsTUFBTSxFQUFHOztBQUV6QixVQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBRSxNQUFNLENBQUUsQ0FBQzs7QUFFbkQsVUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFVBQVUsSUFBSSxFQUFHO0FBQzNDLGVBQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUNsQyxlQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUM3QixDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQVUsSUFBSSxFQUFHO0FBQ3ZDLGVBQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUM5QixlQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUN6QixDQUFDLENBQUM7S0FFSjs7QUFFRCxVQUFNLEVBQUc7OztBQUdQLFdBQUssRUFBRyxJQUFJOzs7QUFHWixTQUFHLEVBQUc7QUFDRixZQUFJLEVBQUUsUUFBUSxHQUFHLElBQUksSUFBSyxJQUFJLEtBQUssRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBLEdBQUksR0FBRyxFQUNqRTs7S0FFRjs7QUFBQSxHQUVGLENBQUM7Q0FFSCxDQUFDOzs7O0FDeENGLFlBQVksQ0FBQzs7QUFFYixNQUFNLENBQUMsT0FBTyxHQUFHLFlBQVk7O0FBRTNCLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7O0FBRTdCLFNBQU87O0FBRUwsUUFBSSxFQUFHLGNBQVcsTUFBTSxFQUFHOzs7QUFHekIsWUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxJQUFJLEVBQUc7QUFDbEQsZUFBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQy9CLGVBQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7T0FDbEIsQ0FBQyxDQUFDO0tBRUo7O0FBR0QsV0FBTyxFQUFHLGlCQUFXLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFHO0FBQzFDLGFBQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7O0tBSXBDLEVBR0YsQ0FBQztDQUVILENBQUM7Ozs7QUM1QkYsWUFBWSxDQUFDOztBQUViLE9BQU8sQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0FBQ3BELE9BQU8sQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDOztBQUV0RCxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7O0FBRXpELEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQzs7O0FBRzVDLE9BQU8sQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInJlcXVpcmUoXCIuLi9wb2x5bWVyL3BvbHltZXIuaHRtbFwiKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZnVuY3Rpb24oKSB7XG47KGZ1bmN0aW9uKCkge1xuXG4gIChmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvKipcbiAgICAgKiBDaHJvbWUgdXNlcyBhbiBvbGRlciB2ZXJzaW9uIG9mIERPTSBMZXZlbCAzIEtleWJvYXJkIEV2ZW50c1xuICAgICAqXG4gICAgICogTW9zdCBrZXlzIGFyZSBsYWJlbGVkIGFzIHRleHQsIGJ1dCBzb21lIGFyZSBVbmljb2RlIGNvZGVwb2ludHMuXG4gICAgICogVmFsdWVzIHRha2VuIGZyb206IGh0dHA6Ly93d3cudzMub3JnL1RSLzIwMDcvV0QtRE9NLUxldmVsLTMtRXZlbnRzLTIwMDcxMjIxL2tleXNldC5odG1sI0tleVNldC1TZXRcbiAgICAgKi9cbiAgICB2YXIgS0VZX0lERU5USUZJRVIgPSB7XG4gICAgICAnVSswMDA5JzogJ3RhYicsXG4gICAgICAnVSswMDFCJzogJ2VzYycsXG4gICAgICAnVSswMDIwJzogJ3NwYWNlJyxcbiAgICAgICdVKzAwMkEnOiAnKicsXG4gICAgICAnVSswMDMwJzogJzAnLFxuICAgICAgJ1UrMDAzMSc6ICcxJyxcbiAgICAgICdVKzAwMzInOiAnMicsXG4gICAgICAnVSswMDMzJzogJzMnLFxuICAgICAgJ1UrMDAzNCc6ICc0JyxcbiAgICAgICdVKzAwMzUnOiAnNScsXG4gICAgICAnVSswMDM2JzogJzYnLFxuICAgICAgJ1UrMDAzNyc6ICc3JyxcbiAgICAgICdVKzAwMzgnOiAnOCcsXG4gICAgICAnVSswMDM5JzogJzknLFxuICAgICAgJ1UrMDA0MSc6ICdhJyxcbiAgICAgICdVKzAwNDInOiAnYicsXG4gICAgICAnVSswMDQzJzogJ2MnLFxuICAgICAgJ1UrMDA0NCc6ICdkJyxcbiAgICAgICdVKzAwNDUnOiAnZScsXG4gICAgICAnVSswMDQ2JzogJ2YnLFxuICAgICAgJ1UrMDA0Nyc6ICdnJyxcbiAgICAgICdVKzAwNDgnOiAnaCcsXG4gICAgICAnVSswMDQ5JzogJ2knLFxuICAgICAgJ1UrMDA0QSc6ICdqJyxcbiAgICAgICdVKzAwNEInOiAnaycsXG4gICAgICAnVSswMDRDJzogJ2wnLFxuICAgICAgJ1UrMDA0RCc6ICdtJyxcbiAgICAgICdVKzAwNEUnOiAnbicsXG4gICAgICAnVSswMDRGJzogJ28nLFxuICAgICAgJ1UrMDA1MCc6ICdwJyxcbiAgICAgICdVKzAwNTEnOiAncScsXG4gICAgICAnVSswMDUyJzogJ3InLFxuICAgICAgJ1UrMDA1Myc6ICdzJyxcbiAgICAgICdVKzAwNTQnOiAndCcsXG4gICAgICAnVSswMDU1JzogJ3UnLFxuICAgICAgJ1UrMDA1Nic6ICd2JyxcbiAgICAgICdVKzAwNTcnOiAndycsXG4gICAgICAnVSswMDU4JzogJ3gnLFxuICAgICAgJ1UrMDA1OSc6ICd5JyxcbiAgICAgICdVKzAwNUEnOiAneicsXG4gICAgICAnVSswMDdGJzogJ2RlbCdcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU3BlY2lhbCB0YWJsZSBmb3IgS2V5Ym9hcmRFdmVudC5rZXlDb2RlLlxuICAgICAqIEtleWJvYXJkRXZlbnQua2V5SWRlbnRpZmllciBpcyBiZXR0ZXIsIGFuZCBLZXlCb2FyZEV2ZW50LmtleSBpcyBldmVuIGJldHRlclxuICAgICAqIHRoYW4gdGhhdC5cbiAgICAgKlxuICAgICAqIFZhbHVlcyBmcm9tOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvS2V5Ym9hcmRFdmVudC5rZXlDb2RlI1ZhbHVlX29mX2tleUNvZGVcbiAgICAgKi9cbiAgICB2YXIgS0VZX0NPREUgPSB7XG4gICAgICA5OiAndGFiJyxcbiAgICAgIDEzOiAnZW50ZXInLFxuICAgICAgMjc6ICdlc2MnLFxuICAgICAgMzM6ICdwYWdldXAnLFxuICAgICAgMzQ6ICdwYWdlZG93bicsXG4gICAgICAzNTogJ2VuZCcsXG4gICAgICAzNjogJ2hvbWUnLFxuICAgICAgMzI6ICdzcGFjZScsXG4gICAgICAzNzogJ2xlZnQnLFxuICAgICAgMzg6ICd1cCcsXG4gICAgICAzOTogJ3JpZ2h0JyxcbiAgICAgIDQwOiAnZG93bicsXG4gICAgICA0NjogJ2RlbCcsXG4gICAgICAxMDY6ICcqJ1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBNT0RJRklFUl9LRVlTIG1hcHMgdGhlIHNob3J0IG5hbWUgZm9yIG1vZGlmaWVyIGtleXMgdXNlZCBpbiBhIGtleVxuICAgICAqIGNvbWJvIHN0cmluZyB0byB0aGUgcHJvcGVydHkgbmFtZSB0aGF0IHJlZmVyZW5jZXMgdGhvc2Ugc2FtZSBrZXlzXG4gICAgICogaW4gYSBLZXlib2FyZEV2ZW50IGluc3RhbmNlLlxuICAgICAqL1xuICAgIHZhciBNT0RJRklFUl9LRVlTID0ge1xuICAgICAgJ3NoaWZ0JzogJ3NoaWZ0S2V5JyxcbiAgICAgICdjdHJsJzogJ2N0cmxLZXknLFxuICAgICAgJ2FsdCc6ICdhbHRLZXknLFxuICAgICAgJ21ldGEnOiAnbWV0YUtleSdcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogS2V5Ym9hcmRFdmVudC5rZXkgaXMgbW9zdGx5IHJlcHJlc2VudGVkIGJ5IHByaW50YWJsZSBjaGFyYWN0ZXIgbWFkZSBieVxuICAgICAqIHRoZSBrZXlib2FyZCwgd2l0aCB1bnByaW50YWJsZSBrZXlzIGxhYmVsZWQgbmljZWx5LlxuICAgICAqXG4gICAgICogSG93ZXZlciwgb24gT1MgWCwgQWx0K2NoYXIgY2FuIG1ha2UgYSBVbmljb2RlIGNoYXJhY3RlciB0aGF0IGZvbGxvd3MgYW5cbiAgICAgKiBBcHBsZS1zcGVjaWZpYyBtYXBwaW5nLiBJbiB0aGlzIGNhc2UsIHdlXG4gICAgICogZmFsbCBiYWNrIHRvIC5rZXlDb2RlLlxuICAgICAqL1xuICAgIHZhciBLRVlfQ0hBUiA9IC9bYS16MC05Kl0vO1xuXG4gICAgLyoqXG4gICAgICogTWF0Y2hlcyBhIGtleUlkZW50aWZpZXIgc3RyaW5nLlxuICAgICAqL1xuICAgIHZhciBJREVOVF9DSEFSID0gL1VcXCsvO1xuXG4gICAgLyoqXG4gICAgICogTWF0Y2hlcyBhcnJvdyBrZXlzIGluIEdlY2tvIDI3LjArXG4gICAgICovXG4gICAgdmFyIEFSUk9XX0tFWSA9IC9eYXJyb3cvO1xuXG4gICAgLyoqXG4gICAgICogTWF0Y2hlcyBzcGFjZSBrZXlzIGV2ZXJ5d2hlcmUgKG5vdGFibHkgaW5jbHVkaW5nIElFMTAncyBleGNlcHRpb25hbCBuYW1lXG4gICAgICogYHNwYWNlYmFyYCkuXG4gICAgICovXG4gICAgdmFyIFNQQUNFX0tFWSA9IC9ec3BhY2UoYmFyKT8vO1xuXG4gICAgZnVuY3Rpb24gdHJhbnNmb3JtS2V5KGtleSkge1xuICAgICAgdmFyIHZhbGlkS2V5ID0gJyc7XG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIHZhciBsS2V5ID0ga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChsS2V5Lmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgaWYgKEtFWV9DSEFSLnRlc3QobEtleSkpIHtcbiAgICAgICAgICAgIHZhbGlkS2V5ID0gbEtleTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoQVJST1dfS0VZLnRlc3QobEtleSkpIHtcbiAgICAgICAgICB2YWxpZEtleSA9IGxLZXkucmVwbGFjZSgnYXJyb3cnLCAnJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoU1BBQ0VfS0VZLnRlc3QobEtleSkpIHtcbiAgICAgICAgICB2YWxpZEtleSA9ICdzcGFjZSc7XG4gICAgICAgIH0gZWxzZSBpZiAobEtleSA9PSAnbXVsdGlwbHknKSB7XG4gICAgICAgICAgLy8gbnVtcGFkICcqJyBjYW4gbWFwIHRvIE11bHRpcGx5IG9uIElFL1dpbmRvd3NcbiAgICAgICAgICB2YWxpZEtleSA9ICcqJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWxpZEtleSA9IGxLZXk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWxpZEtleTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2Zvcm1LZXlJZGVudGlmaWVyKGtleUlkZW50KSB7XG4gICAgICB2YXIgdmFsaWRLZXkgPSAnJztcbiAgICAgIGlmIChrZXlJZGVudCkge1xuICAgICAgICBpZiAoSURFTlRfQ0hBUi50ZXN0KGtleUlkZW50KSkge1xuICAgICAgICAgIHZhbGlkS2V5ID0gS0VZX0lERU5USUZJRVJba2V5SWRlbnRdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbGlkS2V5ID0ga2V5SWRlbnQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbGlkS2V5O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zZm9ybUtleUNvZGUoa2V5Q29kZSkge1xuICAgICAgdmFyIHZhbGlkS2V5ID0gJyc7XG4gICAgICBpZiAoTnVtYmVyKGtleUNvZGUpKSB7XG4gICAgICAgIGlmIChrZXlDb2RlID49IDY1ICYmIGtleUNvZGUgPD0gOTApIHtcbiAgICAgICAgICAvLyBhc2NpaSBhLXpcbiAgICAgICAgICAvLyBsb3dlcmNhc2UgaXMgMzIgb2Zmc2V0IGZyb20gdXBwZXJjYXNlXG4gICAgICAgICAgdmFsaWRLZXkgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDMyICsga2V5Q29kZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5Q29kZSA+PSAxMTIgJiYga2V5Q29kZSA8PSAxMjMpIHtcbiAgICAgICAgICAvLyBmdW5jdGlvbiBrZXlzIGYxLWYxMlxuICAgICAgICAgIHZhbGlkS2V5ID0gJ2YnICsgKGtleUNvZGUgLSAxMTIpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleUNvZGUgPj0gNDggJiYga2V5Q29kZSA8PSA1Nykge1xuICAgICAgICAgIC8vIHRvcCAwLTkga2V5c1xuICAgICAgICAgIHZhbGlkS2V5ID0gU3RyaW5nKDQ4IC0ga2V5Q29kZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5Q29kZSA+PSA5NiAmJiBrZXlDb2RlIDw9IDEwNSkge1xuICAgICAgICAgIC8vIG51bSBwYWQgMC05XG4gICAgICAgICAgdmFsaWRLZXkgPSBTdHJpbmcoOTYgLSBrZXlDb2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWxpZEtleSA9IEtFWV9DT0RFW2tleUNvZGVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsaWRLZXk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplZEtleUZvckV2ZW50KGtleUV2ZW50KSB7XG4gICAgICAvLyBmYWxsIGJhY2sgZnJvbSAua2V5LCB0byAua2V5SWRlbnRpZmllciwgdG8gLmtleUNvZGUsIGFuZCB0aGVuIHRvXG4gICAgICAvLyAuZGV0YWlsLmtleSB0byBzdXBwb3J0IGFydGlmaWNpYWwga2V5Ym9hcmQgZXZlbnRzXG4gICAgICByZXR1cm4gdHJhbnNmb3JtS2V5KGtleUV2ZW50LmtleSkgfHxcbiAgICAgICAgdHJhbnNmb3JtS2V5SWRlbnRpZmllcihrZXlFdmVudC5rZXlJZGVudGlmaWVyKSB8fFxuICAgICAgICB0cmFuc2Zvcm1LZXlDb2RlKGtleUV2ZW50LmtleUNvZGUpIHx8XG4gICAgICAgIHRyYW5zZm9ybUtleShrZXlFdmVudC5kZXRhaWwua2V5KSB8fCAnJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBrZXlDb21ib01hdGNoZXNFdmVudChrZXlDb21ibywga2V5RXZlbnQpIHtcbiAgICAgIHJldHVybiBub3JtYWxpemVkS2V5Rm9yRXZlbnQoa2V5RXZlbnQpID09PSBrZXlDb21iby5rZXkgJiZcbiAgICAgICAgISFrZXlFdmVudC5zaGlmdEtleSA9PT0gISFrZXlDb21iby5zaGlmdEtleSAmJlxuICAgICAgICAhIWtleUV2ZW50LmN0cmxLZXkgPT09ICEha2V5Q29tYm8uY3RybEtleSAmJlxuICAgICAgICAhIWtleUV2ZW50LmFsdEtleSA9PT0gISFrZXlDb21iby5hbHRLZXkgJiZcbiAgICAgICAgISFrZXlFdmVudC5tZXRhS2V5ID09PSAhIWtleUNvbWJvLm1ldGFLZXk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VLZXlDb21ib1N0cmluZyhrZXlDb21ib1N0cmluZykge1xuICAgICAgcmV0dXJuIGtleUNvbWJvU3RyaW5nLnNwbGl0KCcrJykucmVkdWNlKGZ1bmN0aW9uKHBhcnNlZEtleUNvbWJvLCBrZXlDb21ib1BhcnQpIHtcbiAgICAgICAgdmFyIGV2ZW50UGFydHMgPSBrZXlDb21ib1BhcnQuc3BsaXQoJzonKTtcbiAgICAgICAgdmFyIGtleU5hbWUgPSBldmVudFBhcnRzWzBdO1xuICAgICAgICB2YXIgZXZlbnQgPSBldmVudFBhcnRzWzFdO1xuXG4gICAgICAgIGlmIChrZXlOYW1lIGluIE1PRElGSUVSX0tFWVMpIHtcbiAgICAgICAgICBwYXJzZWRLZXlDb21ib1tNT0RJRklFUl9LRVlTW2tleU5hbWVdXSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFyc2VkS2V5Q29tYm8ua2V5ID0ga2V5TmFtZTtcbiAgICAgICAgICBwYXJzZWRLZXlDb21iby5ldmVudCA9IGV2ZW50IHx8ICdrZXlkb3duJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJzZWRLZXlDb21ibztcbiAgICAgIH0sIHtcbiAgICAgICAgY29tYm86IGtleUNvbWJvU3RyaW5nLnNwbGl0KCc6Jykuc2hpZnQoKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VFdmVudFN0cmluZyhldmVudFN0cmluZykge1xuICAgICAgcmV0dXJuIGV2ZW50U3RyaW5nLnNwbGl0KCcgJykubWFwKGZ1bmN0aW9uKGtleUNvbWJvU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUtleUNvbWJvU3RyaW5nKGtleUNvbWJvU3RyaW5nKTtcbiAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogYFBvbHltZXIuSXJvbkExMXlLZXlzQmVoYXZpb3JgIHByb3ZpZGVzIGEgbm9ybWFsaXplZCBpbnRlcmZhY2UgZm9yIHByb2Nlc3NpbmdcbiAgICAgKiBrZXlib2FyZCBjb21tYW5kcyB0aGF0IHBlcnRhaW4gdG8gW1dBSS1BUklBIGJlc3QgcHJhY3RpY2VzXShodHRwOi8vd3d3LnczLm9yZy9UUi93YWktYXJpYS1wcmFjdGljZXMvI2tiZF9nZW5lcmFsX2JpbmRpbmcpLlxuICAgICAqIFRoZSBlbGVtZW50IHRha2VzIGNhcmUgb2YgYnJvd3NlciBkaWZmZXJlbmNlcyB3aXRoIHJlc3BlY3QgdG8gS2V5Ym9hcmQgZXZlbnRzXG4gICAgICogYW5kIHVzZXMgYW4gZXhwcmVzc2l2ZSBzeW50YXggdG8gZmlsdGVyIGtleSBwcmVzc2VzLlxuICAgICAqXG4gICAgICogVXNlIHRoZSBga2V5QmluZGluZ3NgIHByb3RvdHlwZSBwcm9wZXJ0eSB0byBleHByZXNzIHdoYXQgY29tYmluYXRpb24gb2Yga2V5c1xuICAgICAqIHdpbGwgdHJpZ2dlciB0aGUgZXZlbnQgdG8gZmlyZS5cbiAgICAgKlxuICAgICAqIFVzZSB0aGUgYGtleS1ldmVudC10YXJnZXRgIGF0dHJpYnV0ZSB0byBzZXQgdXAgZXZlbnQgaGFuZGxlcnMgb24gYSBzcGVjaWZpY1xuICAgICAqIG5vZGUuXG4gICAgICogVGhlIGBrZXlzLXByZXNzZWRgIGV2ZW50IHdpbGwgZmlyZSB3aGVuIG9uZSBvZiB0aGUga2V5IGNvbWJpbmF0aW9ucyBzZXQgd2l0aCB0aGVcbiAgICAgKiBga2V5c2AgcHJvcGVydHkgaXMgcHJlc3NlZC5cbiAgICAgKlxuICAgICAqIEBkZW1vIGRlbW8vaW5kZXguaHRtbFxuICAgICAqIEBwb2x5bWVyQmVoYXZpb3IgSXJvbkExMXlLZXlzQmVoYXZpb3JcbiAgICAgKi9cbiAgICBQb2x5bWVyLklyb25BMTF5S2V5c0JlaGF2aW9yID0ge1xuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIEhUTUxFbGVtZW50IHRoYXQgd2lsbCBiZSBmaXJpbmcgcmVsZXZhbnQgS2V5Ym9hcmRFdmVudHMuXG4gICAgICAgICAqL1xuICAgICAgICBrZXlFdmVudFRhcmdldDoge1xuICAgICAgICAgIHR5cGU6IE9iamVjdCxcbiAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2JvdW5kS2V5SGFuZGxlcnM6IHtcbiAgICAgICAgICB0eXBlOiBBcnJheSxcbiAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFdlIHVzZSB0aGlzIGR1ZSB0byBhIGxpbWl0YXRpb24gaW4gSUUxMCB3aGVyZSBpbnN0YW5jZXMgd2lsbCBoYXZlXG4gICAgICAgIC8vIG93biBwcm9wZXJ0aWVzIG9mIGV2ZXJ5dGhpbmcgb24gdGhlIFwicHJvdG90eXBlXCIuXG4gICAgICAgIF9pbXBlcmF0aXZlS2V5QmluZGluZ3M6IHtcbiAgICAgICAgICB0eXBlOiBPYmplY3QsXG4gICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgb2JzZXJ2ZXJzOiBbXG4gICAgICAgICdfcmVzZXRLZXlFdmVudExpc3RlbmVycyhrZXlFdmVudFRhcmdldCwgX2JvdW5kS2V5SGFuZGxlcnMpJ1xuICAgICAgXSxcblxuICAgICAga2V5QmluZGluZ3M6IHt9LFxuXG4gICAgICByZWdpc3RlcmVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fcHJlcEtleUJpbmRpbmdzKCk7XG4gICAgICB9LFxuXG4gICAgICBhdHRhY2hlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2xpc3RlbktleUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICB9LFxuXG4gICAgICBkZXRhY2hlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3VubGlzdGVuS2V5RXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogQ2FuIGJlIHVzZWQgdG8gaW1wZXJhdGl2ZWx5IGFkZCBhIGtleSBiaW5kaW5nIHRvIHRoZSBpbXBsZW1lbnRpbmdcbiAgICAgICAqIGVsZW1lbnQuIFRoaXMgaXMgdGhlIGltcGVyYXRpdmUgZXF1aXZhbGVudCBvZiBkZWNsYXJpbmcgYSBrZXliaW5kaW5nXG4gICAgICAgKiBpbiB0aGUgYGtleUJpbmRpbmdzYCBwcm90b3R5cGUgcHJvcGVydHkuXG4gICAgICAgKi9cbiAgICAgIGFkZE93bktleUJpbmRpbmc6IGZ1bmN0aW9uKGV2ZW50U3RyaW5nLCBoYW5kbGVyTmFtZSkge1xuICAgICAgICB0aGlzLl9pbXBlcmF0aXZlS2V5QmluZGluZ3NbZXZlbnRTdHJpbmddID0gaGFuZGxlck5hbWU7XG4gICAgICAgIHRoaXMuX3ByZXBLZXlCaW5kaW5ncygpO1xuICAgICAgICB0aGlzLl9yZXNldEtleUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIFdoZW4gY2FsbGVkLCB3aWxsIHJlbW92ZSBhbGwgaW1wZXJhdGl2ZWx5LWFkZGVkIGtleSBiaW5kaW5ncy5cbiAgICAgICAqL1xuICAgICAgcmVtb3ZlT3duS2V5QmluZGluZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pbXBlcmF0aXZlS2V5QmluZGluZ3MgPSB7fTtcbiAgICAgICAgdGhpcy5fcHJlcEtleUJpbmRpbmdzKCk7XG4gICAgICAgIHRoaXMuX3Jlc2V0S2V5RXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgIH0sXG5cbiAgICAgIGtleWJvYXJkRXZlbnRNYXRjaGVzS2V5czogZnVuY3Rpb24oZXZlbnQsIGV2ZW50U3RyaW5nKSB7XG4gICAgICAgIHZhciBrZXlDb21ib3MgPSBwYXJzZUV2ZW50U3RyaW5nKGV2ZW50U3RyaW5nKTtcbiAgICAgICAgdmFyIGluZGV4O1xuXG4gICAgICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IGtleUNvbWJvcy5sZW5ndGg7ICsraW5kZXgpIHtcbiAgICAgICAgICBpZiAoa2V5Q29tYm9NYXRjaGVzRXZlbnQoa2V5Q29tYm9zW2luZGV4XSwgZXZlbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuXG4gICAgICBfY29sbGVjdEtleUJpbmRpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGtleUJpbmRpbmdzID0gdGhpcy5iZWhhdmlvcnMubWFwKGZ1bmN0aW9uKGJlaGF2aW9yKSB7XG4gICAgICAgICAgcmV0dXJuIGJlaGF2aW9yLmtleUJpbmRpbmdzO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoa2V5QmluZGluZ3MuaW5kZXhPZih0aGlzLmtleUJpbmRpbmdzKSA9PT0gLTEpIHtcbiAgICAgICAgICBrZXlCaW5kaW5ncy5wdXNoKHRoaXMua2V5QmluZGluZ3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGtleUJpbmRpbmdzO1xuICAgICAgfSxcblxuICAgICAgX3ByZXBLZXlCaW5kaW5nczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2tleUJpbmRpbmdzID0ge307XG5cbiAgICAgICAgdGhpcy5fY29sbGVjdEtleUJpbmRpbmdzKCkuZm9yRWFjaChmdW5jdGlvbihrZXlCaW5kaW5ncykge1xuICAgICAgICAgIGZvciAodmFyIGV2ZW50U3RyaW5nIGluIGtleUJpbmRpbmdzKSB7XG4gICAgICAgICAgICB0aGlzLl9hZGRLZXlCaW5kaW5nKGV2ZW50U3RyaW5nLCBrZXlCaW5kaW5nc1tldmVudFN0cmluZ10pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgZm9yICh2YXIgZXZlbnRTdHJpbmcgaW4gdGhpcy5faW1wZXJhdGl2ZUtleUJpbmRpbmdzKSB7XG4gICAgICAgICAgdGhpcy5fYWRkS2V5QmluZGluZyhldmVudFN0cmluZywgdGhpcy5faW1wZXJhdGl2ZUtleUJpbmRpbmdzW2V2ZW50U3RyaW5nXSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIF9hZGRLZXlCaW5kaW5nOiBmdW5jdGlvbihldmVudFN0cmluZywgaGFuZGxlck5hbWUpIHtcbiAgICAgICAgcGFyc2VFdmVudFN0cmluZyhldmVudFN0cmluZykuZm9yRWFjaChmdW5jdGlvbihrZXlDb21ibykge1xuICAgICAgICAgIHRoaXMuX2tleUJpbmRpbmdzW2tleUNvbWJvLmV2ZW50XSA9XG4gICAgICAgICAgICB0aGlzLl9rZXlCaW5kaW5nc1trZXlDb21iby5ldmVudF0gfHwgW107XG5cbiAgICAgICAgICB0aGlzLl9rZXlCaW5kaW5nc1trZXlDb21iby5ldmVudF0ucHVzaChbXG4gICAgICAgICAgICBrZXlDb21ibyxcbiAgICAgICAgICAgIGhhbmRsZXJOYW1lXG4gICAgICAgICAgXSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfSxcblxuICAgICAgX3Jlc2V0S2V5RXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl91bmxpc3RlbktleUV2ZW50TGlzdGVuZXJzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNBdHRhY2hlZCkge1xuICAgICAgICAgIHRoaXMuX2xpc3RlbktleUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIF9saXN0ZW5LZXlFdmVudExpc3RlbmVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMuX2tleUJpbmRpbmdzKS5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50TmFtZSkge1xuICAgICAgICAgIHZhciBrZXlCaW5kaW5ncyA9IHRoaXMuX2tleUJpbmRpbmdzW2V2ZW50TmFtZV07XG4gICAgICAgICAgdmFyIGJvdW5kS2V5SGFuZGxlciA9IHRoaXMuX29uS2V5QmluZGluZ0V2ZW50LmJpbmQodGhpcywga2V5QmluZGluZ3MpO1xuXG4gICAgICAgICAgdGhpcy5fYm91bmRLZXlIYW5kbGVycy5wdXNoKFt0aGlzLmtleUV2ZW50VGFyZ2V0LCBldmVudE5hbWUsIGJvdW5kS2V5SGFuZGxlcl0pO1xuXG4gICAgICAgICAgdGhpcy5rZXlFdmVudFRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgYm91bmRLZXlIYW5kbGVyKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9LFxuXG4gICAgICBfdW5saXN0ZW5LZXlFdmVudExpc3RlbmVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBrZXlIYW5kbGVyVHVwbGU7XG4gICAgICAgIHZhciBrZXlFdmVudFRhcmdldDtcbiAgICAgICAgdmFyIGV2ZW50TmFtZTtcbiAgICAgICAgdmFyIGJvdW5kS2V5SGFuZGxlcjtcblxuICAgICAgICB3aGlsZSAodGhpcy5fYm91bmRLZXlIYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAvLyBNeSBraW5nZG9tIGZvciBibG9jay1zY29wZSBiaW5kaW5nIGFuZCBkZXN0cnVjdHVyaW5nIGFzc2lnbm1lbnQuLlxuICAgICAgICAgIGtleUhhbmRsZXJUdXBsZSA9IHRoaXMuX2JvdW5kS2V5SGFuZGxlcnMucG9wKCk7XG4gICAgICAgICAga2V5RXZlbnRUYXJnZXQgPSBrZXlIYW5kbGVyVHVwbGVbMF07XG4gICAgICAgICAgZXZlbnROYW1lID0ga2V5SGFuZGxlclR1cGxlWzFdO1xuICAgICAgICAgIGJvdW5kS2V5SGFuZGxlciA9IGtleUhhbmRsZXJUdXBsZVsyXTtcblxuICAgICAgICAgIGtleUV2ZW50VGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBib3VuZEtleUhhbmRsZXIpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBfb25LZXlCaW5kaW5nRXZlbnQ6IGZ1bmN0aW9uKGtleUJpbmRpbmdzLCBldmVudCkge1xuICAgICAgICBrZXlCaW5kaW5ncy5mb3JFYWNoKGZ1bmN0aW9uKGtleUJpbmRpbmcpIHtcbiAgICAgICAgICB2YXIga2V5Q29tYm8gPSBrZXlCaW5kaW5nWzBdO1xuICAgICAgICAgIHZhciBoYW5kbGVyTmFtZSA9IGtleUJpbmRpbmdbMV07XG5cbiAgICAgICAgICBpZiAoIWV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgJiYga2V5Q29tYm9NYXRjaGVzRXZlbnQoa2V5Q29tYm8sIGV2ZW50KSkge1xuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlcktleUhhbmRsZXIoa2V5Q29tYm8sIGhhbmRsZXJOYW1lLCBldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH0sXG5cbiAgICAgIF90cmlnZ2VyS2V5SGFuZGxlcjogZnVuY3Rpb24oa2V5Q29tYm8sIGhhbmRsZXJOYW1lLCBrZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIHZhciBkZXRhaWwgPSBPYmplY3QuY3JlYXRlKGtleUNvbWJvKTtcbiAgICAgICAgZGV0YWlsLmtleWJvYXJkRXZlbnQgPSBrZXlib2FyZEV2ZW50O1xuXG4gICAgICAgIHRoaXNbaGFuZGxlck5hbWVdLmNhbGwodGhpcywgbmV3IEN1c3RvbUV2ZW50KGtleUNvbWJvLmV2ZW50LCB7XG4gICAgICAgICAgZGV0YWlsOiBkZXRhaWxcbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgIH07XG4gIH0pKCk7XG5cbn0pKCk7XG5cbn0pIiwicmVxdWlyZShcIi4uL3BvbHltZXIvcG9seW1lci5odG1sXCIpO1xucmVxdWlyZShcIi4uL2lyb24tYTExeS1rZXlzLWJlaGF2aW9yL2lyb24tYTExeS1rZXlzLWJlaGF2aW9yLmh0bWxcIik7XG5yZXF1aXJlKFwiLi9pcm9uLWNvbnRyb2wtc3RhdGUuaHRtbFwiKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZnVuY3Rpb24oKSB7XG47KGZ1bmN0aW9uKCkge1xuXG5cbiAgLyoqXG4gICAqIEBkZW1vIGRlbW8vaW5kZXguaHRtbFxuICAgKiBAcG9seW1lckJlaGF2aW9yIFBvbHltZXIuSXJvbkJ1dHRvblN0YXRlXG4gICAqL1xuICBQb2x5bWVyLklyb25CdXR0b25TdGF0ZUltcGwgPSB7XG5cbiAgICBwcm9wZXJ0aWVzOiB7XG5cbiAgICAgIC8qKlxuICAgICAgICogSWYgdHJ1ZSwgdGhlIHVzZXIgaXMgY3VycmVudGx5IGhvbGRpbmcgZG93biB0aGUgYnV0dG9uLlxuICAgICAgICovXG4gICAgICBwcmVzc2VkOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgb2JzZXJ2ZXI6ICdfcHJlc3NlZENoYW5nZWQnXG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIElmIHRydWUsIHRoZSBidXR0b24gdG9nZ2xlcyB0aGUgYWN0aXZlIHN0YXRlIHdpdGggZWFjaCB0YXAgb3IgcHJlc3NcbiAgICAgICAqIG9mIHRoZSBzcGFjZWJhci5cbiAgICAgICAqL1xuICAgICAgdG9nZ2xlczoge1xuICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZTogdHJ1ZVxuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBJZiB0cnVlLCB0aGUgYnV0dG9uIGlzIGEgdG9nZ2xlIGFuZCBpcyBjdXJyZW50bHkgaW4gdGhlIGFjdGl2ZSBzdGF0ZS5cbiAgICAgICAqL1xuICAgICAgYWN0aXZlOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgICAgbm90aWZ5OiB0cnVlLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIG9ic2VydmVyOiAnX2FjdGl2ZUNoYW5nZWQnXG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIFRydWUgaWYgdGhlIGVsZW1lbnQgaXMgY3VycmVudGx5IGJlaW5nIHByZXNzZWQgYnkgYSBcInBvaW50ZXIsXCIgd2hpY2hcbiAgICAgICAqIGlzIGxvb3NlbHkgZGVmaW5lZCBhcyBtb3VzZSBvciB0b3VjaCBpbnB1dCAoYnV0IHNwZWNpZmljYWxseSBleGNsdWRpbmdcbiAgICAgICAqIGtleWJvYXJkIGlucHV0KS5cbiAgICAgICAqL1xuICAgICAgcG9pbnRlckRvd246IHtcbiAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmYWxzZVxuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBUcnVlIGlmIHRoZSBpbnB1dCBkZXZpY2UgdGhhdCBjYXVzZWQgdGhlIGVsZW1lbnQgdG8gcmVjZWl2ZSBmb2N1c1xuICAgICAgICogd2FzIGEga2V5Ym9hcmQuXG4gICAgICAgKi9cbiAgICAgIHJlY2VpdmVkRm9jdXNGcm9tS2V5Ym9hcmQ6IHtcbiAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgcmVhZE9ubHk6IHRydWVcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbGlzdGVuZXJzOiB7XG4gICAgICBkb3duOiAnX2Rvd25IYW5kbGVyJyxcbiAgICAgIHVwOiAnX3VwSGFuZGxlcicsXG4gICAgICB0YXA6ICdfdGFwSGFuZGxlcidcbiAgICB9LFxuXG4gICAgb2JzZXJ2ZXJzOiBbXG4gICAgICAnX2RldGVjdEtleWJvYXJkRm9jdXMoZm9jdXNlZCknXG4gICAgXSxcblxuICAgIGtleUJpbmRpbmdzOiB7XG4gICAgICAnZW50ZXI6a2V5ZG93bic6ICdfYXN5bmNDbGljaycsXG4gICAgICAnc3BhY2U6a2V5ZG93bic6ICdfc3BhY2VLZXlEb3duSGFuZGxlcicsXG4gICAgICAnc3BhY2U6a2V5dXAnOiAnX3NwYWNlS2V5VXBIYW5kbGVyJyxcbiAgICB9LFxuXG4gICAgX3RhcEhhbmRsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMudG9nZ2xlcykge1xuICAgICAgIC8vIGEgdGFwIGlzIG5lZWRlZCB0byB0b2dnbGUgdGhlIGFjdGl2ZSBzdGF0ZVxuICAgICAgICB0aGlzLl91c2VyQWN0aXZhdGUoIXRoaXMuYWN0aXZlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSxcblxuICAgIF9kZXRlY3RLZXlib2FyZEZvY3VzOiBmdW5jdGlvbihmb2N1c2VkKSB7XG4gICAgICB0aGlzLl9zZXRSZWNlaXZlZEZvY3VzRnJvbUtleWJvYXJkKCF0aGlzLnBvaW50ZXJEb3duICYmIGZvY3VzZWQpO1xuICAgIH0sXG5cbiAgICAvLyB0byBlbXVsYXRlIG5hdGl2ZSBjaGVja2JveCwgKGRlLSlhY3RpdmF0aW9ucyBmcm9tIGEgdXNlciBpbnRlcmFjdGlvbiBmaXJlXG4gICAgLy8gJ2NoYW5nZScgZXZlbnRzXG4gICAgX3VzZXJBY3RpdmF0ZTogZnVuY3Rpb24oYWN0aXZlKSB7XG4gICAgICB0aGlzLmFjdGl2ZSA9IGFjdGl2ZTtcbiAgICAgIHRoaXMuZmlyZSgnY2hhbmdlJyk7XG4gICAgfSxcblxuICAgIF9kb3duSGFuZGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9zZXRQb2ludGVyRG93bih0cnVlKTtcbiAgICAgIHRoaXMuX3NldFByZXNzZWQodHJ1ZSk7XG4gICAgICB0aGlzLl9zZXRSZWNlaXZlZEZvY3VzRnJvbUtleWJvYXJkKGZhbHNlKTtcbiAgICB9LFxuXG4gICAgX3VwSGFuZGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9zZXRQb2ludGVyRG93bihmYWxzZSk7XG4gICAgICB0aGlzLl9zZXRQcmVzc2VkKGZhbHNlKTtcbiAgICB9LFxuXG4gICAgX3NwYWNlS2V5RG93bkhhbmRsZXI6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIga2V5Ym9hcmRFdmVudCA9IGV2ZW50LmRldGFpbC5rZXlib2FyZEV2ZW50O1xuICAgICAga2V5Ym9hcmRFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAga2V5Ym9hcmRFdmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgIHRoaXMuX3NldFByZXNzZWQodHJ1ZSk7XG4gICAgfSxcblxuICAgIF9zcGFjZUtleVVwSGFuZGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5wcmVzc2VkKSB7XG4gICAgICAgIHRoaXMuX2FzeW5jQ2xpY2soKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3NldFByZXNzZWQoZmFsc2UpO1xuICAgIH0sXG5cbiAgICAvLyB0cmlnZ2VyIGNsaWNrIGFzeW5jaHJvbm91c2x5LCB0aGUgYXN5bmNocm9ueSBpcyB1c2VmdWwgdG8gYWxsb3cgb25lXG4gICAgLy8gZXZlbnQgaGFuZGxlciB0byB1bndpbmQgYmVmb3JlIHRyaWdnZXJpbmcgYW5vdGhlciBldmVudFxuICAgIF9hc3luY0NsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYXN5bmMoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuY2xpY2soKTtcbiAgICAgIH0sIDEpO1xuICAgIH0sXG5cbiAgICAvLyBhbnkgb2YgdGhlc2UgY2hhbmdlcyBhcmUgY29uc2lkZXJlZCBhIGNoYW5nZSB0byBidXR0b24gc3RhdGVcblxuICAgIF9wcmVzc2VkQ2hhbmdlZDogZnVuY3Rpb24ocHJlc3NlZCkge1xuICAgICAgdGhpcy5fY2hhbmdlZEJ1dHRvblN0YXRlKCk7XG4gICAgfSxcblxuICAgIF9hY3RpdmVDaGFuZ2VkOiBmdW5jdGlvbihhY3RpdmUpIHtcbiAgICAgIGlmICh0aGlzLnRvZ2dsZXMpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcsIGFjdGl2ZSA/ICd0cnVlJyA6ICdmYWxzZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtcHJlc3NlZCcpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY2hhbmdlZEJ1dHRvblN0YXRlKCk7XG4gICAgfSxcblxuICAgIF9jb250cm9sU3RhdGVDaGFuZ2VkOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICAgIHRoaXMuX3NldFByZXNzZWQoZmFsc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY2hhbmdlZEJ1dHRvblN0YXRlKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIHByb3ZpZGUgaG9vayBmb3IgZm9sbG93LW9uIGJlaGF2aW9ycyB0byByZWFjdCB0byBidXR0b24tc3RhdGVcblxuICAgIF9jaGFuZ2VkQnV0dG9uU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuX2J1dHRvblN0YXRlQ2hhbmdlZCkge1xuICAgICAgICB0aGlzLl9idXR0b25TdGF0ZUNoYW5nZWQoKTsgLy8gYWJzdHJhY3RcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICAvKiogQHBvbHltZXJCZWhhdmlvciAqL1xuICBQb2x5bWVyLklyb25CdXR0b25TdGF0ZSA9IFtcbiAgICBQb2x5bWVyLklyb25BMTF5S2V5c0JlaGF2aW9yLFxuICAgIFBvbHltZXIuSXJvbkJ1dHRvblN0YXRlSW1wbFxuICBdO1xuXG5cbn0pKCk7XG5cbn0pIiwicmVxdWlyZShcIi4uL3BvbHltZXIvcG9seW1lci5odG1sXCIpO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixmdW5jdGlvbigpIHtcbjsoZnVuY3Rpb24oKSB7XG5cblxuICAvKipcbiAgICogQGRlbW8gZGVtby9pbmRleC5odG1sXG4gICAqIEBwb2x5bWVyQmVoYXZpb3JcbiAgICovXG4gIFBvbHltZXIuSXJvbkNvbnRyb2xTdGF0ZSA9IHtcblxuICAgIHByb3BlcnRpZXM6IHtcblxuICAgICAgLyoqXG4gICAgICAgKiBJZiB0cnVlLCB0aGUgZWxlbWVudCBjdXJyZW50bHkgaGFzIGZvY3VzLlxuICAgICAgICovXG4gICAgICBmb2N1c2VkOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgICAgbm90aWZ5OiB0cnVlLFxuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlOiB0cnVlXG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIElmIHRydWUsIHRoZSB1c2VyIGNhbm5vdCBpbnRlcmFjdCB3aXRoIHRoaXMgZWxlbWVudC5cbiAgICAgICAqL1xuICAgICAgZGlzYWJsZWQ6IHtcbiAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgdmFsdWU6IGZhbHNlLFxuICAgICAgICBub3RpZnk6IHRydWUsXG4gICAgICAgIG9ic2VydmVyOiAnX2Rpc2FibGVkQ2hhbmdlZCcsXG4gICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZTogdHJ1ZVxuICAgICAgfSxcblxuICAgICAgX29sZFRhYkluZGV4OiB7XG4gICAgICAgIHR5cGU6IE51bWJlclxuICAgICAgfSxcblxuICAgICAgX2JvdW5kRm9jdXNCbHVySGFuZGxlcjoge1xuICAgICAgICB0eXBlOiBGdW5jdGlvbixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9mb2N1c0JsdXJIYW5kbGVyLmJpbmQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICBvYnNlcnZlcnM6IFtcbiAgICAgICdfY2hhbmdlZENvbnRyb2xTdGF0ZShmb2N1c2VkLCBkaXNhYmxlZCknXG4gICAgXSxcblxuICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFRPRE8oc2ptaWxlcyk6IGVuc3VyZSByZWFkLW9ubHkgcHJvcGVydHkgaXMgdmFsdWVkIHNvIHRoZSBjb21wb3VuZFxuICAgICAgLy8gb2JzZXJ2ZXIgd2lsbCBmaXJlXG4gICAgICBpZiAodGhpcy5mb2N1c2VkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5fc2V0Rm9jdXNlZChmYWxzZSk7XG4gICAgICB9XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgdGhpcy5fYm91bmRGb2N1c0JsdXJIYW5kbGVyLCB0cnVlKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIHRoaXMuX2JvdW5kRm9jdXNCbHVySGFuZGxlciwgdHJ1ZSk7XG4gICAgfSxcblxuICAgIF9mb2N1c0JsdXJIYW5kbGVyOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnBhdGggPyBldmVudC5wYXRoWzBdIDogZXZlbnQudGFyZ2V0O1xuICAgICAgaWYgKHRhcmdldCA9PT0gdGhpcykge1xuICAgICAgICB2YXIgZm9jdXNlZCA9IGV2ZW50LnR5cGUgPT09ICdmb2N1cyc7XG4gICAgICAgIHRoaXMuX3NldEZvY3VzZWQoZm9jdXNlZCk7XG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLnNoYWRvd1Jvb3QpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMuZmlyZShldmVudC50eXBlLCB7c291cmNlRXZlbnQ6IGV2ZW50fSwge1xuICAgICAgICAgIG5vZGU6IHRoaXMsXG4gICAgICAgICAgYnViYmxlczogZXZlbnQuYnViYmxlcyxcbiAgICAgICAgICBjYW5jZWxhYmxlOiBldmVudC5jYW5jZWxhYmxlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfZGlzYWJsZWRDaGFuZ2VkOiBmdW5jdGlvbihkaXNhYmxlZCwgb2xkKSB7XG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnYXJpYS1kaXNhYmxlZCcsIGRpc2FibGVkID8gJ3RydWUnIDogJ2ZhbHNlJyk7XG4gICAgICB0aGlzLnN0eWxlLnBvaW50ZXJFdmVudHMgPSBkaXNhYmxlZCA/ICdub25lJyA6ICcnO1xuICAgICAgaWYgKGRpc2FibGVkKSB7XG4gICAgICAgIHRoaXMuX29sZFRhYkluZGV4ID0gdGhpcy50YWJJbmRleDtcbiAgICAgICAgdGhpcy5mb2N1c2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMudGFiSW5kZXggPSAtMTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fb2xkVGFiSW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLnRhYkluZGV4ID0gdGhpcy5fb2xkVGFiSW5kZXg7XG4gICAgICB9XG4gICAgfSxcblxuICAgIF9jaGFuZ2VkQ29udHJvbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIF9jb250cm9sU3RhdGVDaGFuZ2VkIGlzIGFic3RyYWN0LCBmb2xsb3ctb24gYmVoYXZpb3JzIG1heSBpbXBsZW1lbnQgaXRcbiAgICAgIGlmICh0aGlzLl9jb250cm9sU3RhdGVDaGFuZ2VkKSB7XG4gICAgICAgIHRoaXMuX2NvbnRyb2xTdGF0ZUNoYW5nZWQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuXG59KSgpO1xuXG59KSIsInJlcXVpcmUoXCIuLi9wb2x5bWVyL3BvbHltZXIuaHRtbFwiKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZnVuY3Rpb24oKSB7XG52YXIgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXTtcbnZhciByb290ID0gYm9keS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpKTtcbnJvb3Quc2V0QXR0cmlidXRlKFwiaGlkZGVuXCIsXCJcIik7XG5yb290LmlubmVySFRNTD1cIjxkb20tbW9kdWxlIGlkPVxcXCJpcm9uLWNvbGxhcHNlXFxcIj48c3R5bGU+Omhvc3R7ZGlzcGxheTpibG9jazt0cmFuc2l0aW9uLWR1cmF0aW9uOjMwMG1zfTpob3N0KC5pcm9uLWNvbGxhcHNlLWNsb3NlZCl7ZGlzcGxheTpub25lfTpob3N0KDpub3QoLmlyb24tY29sbGFwc2Utb3BlbmVkKSl7b3ZlcmZsb3c6aGlkZGVufTwvc3R5bGU+PHRlbXBsYXRlPlxcblxcbiAgICA8Y29udGVudD48L2NvbnRlbnQ+XFxuXFxuICA8L3RlbXBsYXRlPjwvZG9tLW1vZHVsZT5cIjtcbjsoZnVuY3Rpb24oKSB7XG5cblxuICBQb2x5bWVyKHtcblxuICAgIGlzOiAnaXJvbi1jb2xsYXBzZScsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG5cbiAgICAgIC8qKlxuICAgICAgICogSWYgdHJ1ZSwgdGhlIG9yaWVudGF0aW9uIGlzIGhvcml6b250YWw7IG90aGVyd2lzZSBpcyB2ZXJ0aWNhbC5cbiAgICAgICAqXG4gICAgICAgKiBAYXR0cmlidXRlIGhvcml6b250YWxcbiAgICAgICAqL1xuICAgICAgaG9yaXpvbnRhbDoge1xuICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICAgIG9ic2VydmVyOiAnX2hvcml6b250YWxDaGFuZ2VkJ1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBTZXQgb3BlbmVkIHRvIHRydWUgdG8gc2hvdyB0aGUgY29sbGFwc2UgZWxlbWVudCBhbmQgdG8gZmFsc2UgdG8gaGlkZSBpdC5cbiAgICAgICAqXG4gICAgICAgKiBAYXR0cmlidXRlIG9wZW5lZFxuICAgICAgICovXG4gICAgICBvcGVuZWQ6IHtcbiAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgdmFsdWU6IGZhbHNlLFxuICAgICAgICBub3RpZnk6IHRydWUsXG4gICAgICAgIG9ic2VydmVyOiAnX29wZW5lZENoYW5nZWQnXG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgaG9zdEF0dHJpYnV0ZXM6IHtcbiAgICAgIHJvbGU6ICdncm91cCcsXG4gICAgICAnYXJpYS1leHBhbmRlZCc6ICdmYWxzZSdcbiAgICB9LFxuXG4gICAgbGlzdGVuZXJzOiB7XG4gICAgICB0cmFuc2l0aW9uZW5kOiAnX3RyYW5zaXRpb25FbmQnXG4gICAgfSxcblxuICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEF2b2lkIHRyYW5zaXRpb24gYXQgdGhlIGJlZ2lubmluZyBlLmcuIHBhZ2UgbG9hZHMgYW5kIGVuYWJsZVxuICAgICAgLy8gdHJhbnNpdGlvbnMgb25seSBhZnRlciB0aGUgZWxlbWVudCBpcyByZW5kZXJlZCBhbmQgcmVhZHkuXG4gICAgICB0aGlzLl9lbmFibGVUcmFuc2l0aW9uID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlIHRoZSBvcGVuZWQgc3RhdGUuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIHRvZ2dsZVxuICAgICAqL1xuICAgIHRvZ2dsZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm9wZW5lZCA9ICF0aGlzLm9wZW5lZDtcbiAgICB9LFxuXG4gICAgc2hvdzogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnRvZ2dsZUNsYXNzKCdpcm9uLWNvbGxhcHNlLWNsb3NlZCcsIGZhbHNlKTtcbiAgICAgIHRoaXMudXBkYXRlU2l6ZSgnYXV0bycsIGZhbHNlKTtcbiAgICAgIHZhciBzID0gdGhpcy5fY2FsY1NpemUoKTtcbiAgICAgIHRoaXMudXBkYXRlU2l6ZSgnMHB4JywgZmFsc2UpO1xuICAgICAgLy8gZm9yY2UgbGF5b3V0IHRvIGVuc3VyZSB0cmFuc2l0aW9uIHdpbGwgZ29cbiAgICAgIHRoaXMub2Zmc2V0SGVpZ2h0O1xuICAgICAgdGhpcy51cGRhdGVTaXplKHMsIHRydWUpO1xuICAgIH0sXG5cbiAgICBoaWRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMudG9nZ2xlQ2xhc3MoJ2lyb24tY29sbGFwc2Utb3BlbmVkJywgZmFsc2UpO1xuICAgICAgdGhpcy51cGRhdGVTaXplKHRoaXMuX2NhbGNTaXplKCksIGZhbHNlKTtcbiAgICAgIC8vIGZvcmNlIGxheW91dCB0byBlbnN1cmUgdHJhbnNpdGlvbiB3aWxsIGdvXG4gICAgICB0aGlzLm9mZnNldEhlaWdodDtcbiAgICAgIHRoaXMudXBkYXRlU2l6ZSgnMHB4JywgdHJ1ZSk7XG4gICAgfSxcblxuICAgIHVwZGF0ZVNpemU6IGZ1bmN0aW9uKHNpemUsIGFuaW1hdGVkKSB7XG4gICAgICB0aGlzLmVuYWJsZVRyYW5zaXRpb24oYW5pbWF0ZWQpO1xuICAgICAgdmFyIHMgPSB0aGlzLnN0eWxlO1xuICAgICAgdmFyIG5vY2hhbmdlID0gc1t0aGlzLmRpbWVuc2lvbl0gPT09IHNpemU7XG4gICAgICBzW3RoaXMuZGltZW5zaW9uXSA9IHNpemU7XG4gICAgICBpZiAoYW5pbWF0ZWQgJiYgbm9jaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5fdHJhbnNpdGlvbkVuZCgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBlbmFibGVUcmFuc2l0aW9uOiBmdW5jdGlvbihlbmFibGVkKSB7XG4gICAgICB0aGlzLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IChlbmFibGVkICYmIHRoaXMuX2VuYWJsZVRyYW5zaXRpb24pID8gJycgOiAnMHMnO1xuICAgIH0sXG5cbiAgICBfaG9yaXpvbnRhbENoYW5nZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kaW1lbnNpb24gPSB0aGlzLmhvcml6b250YWwgPyAnd2lkdGgnIDogJ2hlaWdodCc7XG4gICAgICB0aGlzLnN0eWxlLnRyYW5zaXRpb25Qcm9wZXJ0eSA9IHRoaXMuZGltZW5zaW9uO1xuICAgIH0sXG5cbiAgICBfb3BlbmVkQ2hhbmdlZDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzW3RoaXMub3BlbmVkID8gJ3Nob3cnIDogJ2hpZGUnXSgpO1xuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCB0aGlzLm9wZW5lZCA/ICd0cnVlJyA6ICdmYWxzZScpO1xuXG4gICAgfSxcblxuICAgIF90cmFuc2l0aW9uRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLm9wZW5lZCkge1xuICAgICAgICB0aGlzLnVwZGF0ZVNpemUoJ2F1dG8nLCBmYWxzZSk7XG4gICAgICB9XG4gICAgICB0aGlzLnRvZ2dsZUNsYXNzKCdpcm9uLWNvbGxhcHNlLWNsb3NlZCcsICF0aGlzLm9wZW5lZCk7XG4gICAgICB0aGlzLnRvZ2dsZUNsYXNzKCdpcm9uLWNvbGxhcHNlLW9wZW5lZCcsIHRoaXMub3BlbmVkKTtcbiAgICAgIHRoaXMuZW5hYmxlVHJhbnNpdGlvbihmYWxzZSk7XG4gICAgfSxcblxuICAgIF9jYWxjU2l6ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVt0aGlzLmRpbWVuc2lvbl0gKyAncHgnO1xuICAgIH0sXG5cblxuICB9KTtcblxuXG59KSgpO1xuXG59KSIsInJlcXVpcmUoXCIuLi9wb2x5bWVyL3BvbHltZXIuaHRtbFwiKTtcbnJlcXVpcmUoXCIuLi9pcm9uLWJlaGF2aW9ycy9pcm9uLWJ1dHRvbi1zdGF0ZS5odG1sXCIpO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixmdW5jdGlvbigpIHtcbjsoZnVuY3Rpb24oKSB7XG5cblxuICAvKiogQHBvbHltZXJCZWhhdmlvciAqL1xuICBQb2x5bWVyLlBhcGVyQnV0dG9uQmVoYXZpb3JJbXBsID0ge1xuXG4gICAgcHJvcGVydGllczoge1xuXG4gICAgICBfZWxldmF0aW9uOiB7XG4gICAgICAgIHR5cGU6IE51bWJlclxuICAgICAgfVxuXG4gICAgfSxcblxuICAgIG9ic2VydmVyczogW1xuICAgICAgJ19jYWxjdWxhdGVFbGV2YXRpb24oZm9jdXNlZCwgZGlzYWJsZWQsIGFjdGl2ZSwgcHJlc3NlZCwgcmVjZWl2ZWRGb2N1c0Zyb21LZXlib2FyZCknXG4gICAgXSxcblxuICAgIGhvc3RBdHRyaWJ1dGVzOiB7XG4gICAgICByb2xlOiAnYnV0dG9uJyxcbiAgICAgIHRhYmluZGV4OiAnMCdcbiAgICB9LFxuXG4gICAgX2NhbGN1bGF0ZUVsZXZhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZSA9IDE7XG4gICAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgICBlID0gMDtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5hY3RpdmUgfHwgdGhpcy5wcmVzc2VkKSB7XG4gICAgICAgIGUgPSA0O1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnJlY2VpdmVkRm9jdXNGcm9tS2V5Ym9hcmQpIHtcbiAgICAgICAgZSA9IDM7XG4gICAgICB9XG4gICAgICB0aGlzLl9lbGV2YXRpb24gPSBlO1xuICAgIH1cbiAgfTtcblxuICAvKiogQHBvbHltZXJCZWhhdmlvciAqL1xuICBQb2x5bWVyLlBhcGVyQnV0dG9uQmVoYXZpb3IgPSBbXG4gICAgUG9seW1lci5Jcm9uQnV0dG9uU3RhdGUsXG4gICAgUG9seW1lci5Jcm9uQ29udHJvbFN0YXRlLFxuICAgIFBvbHltZXIuUGFwZXJCdXR0b25CZWhhdmlvckltcGxcbiAgXTtcblxuXG59KSgpO1xuXG59KSIsInJlcXVpcmUoXCIuLi9wb2x5bWVyL3BvbHltZXIuaHRtbFwiKTtcbnJlcXVpcmUoXCIuLi9wYXBlci1tYXRlcmlhbC9wYXBlci1tYXRlcmlhbC5odG1sXCIpO1xucmVxdWlyZShcIi4uL3BhcGVyLXJpcHBsZS9wYXBlci1yaXBwbGUuaHRtbFwiKTtcbnJlcXVpcmUoXCIuLi9wYXBlci1iZWhhdmlvcnMvcGFwZXItYnV0dG9uLWJlaGF2aW9yLmh0bWxcIik7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGZ1bmN0aW9uKCkge1xudmFyIGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF07XG52YXIgcm9vdCA9IGJvZHkuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSk7XG5yb290LnNldEF0dHJpYnV0ZShcImhpZGRlblwiLFwiXCIpO1xucm9vdC5pbm5lckhUTUw9XCI8ZG9tLW1vZHVsZSBpZD1cXFwicGFwZXItYnV0dG9uXFxcIj48c3R5bGU+Omhvc3R7ZGlzcGxheTppbmxpbmUtYmxvY2s7cG9zaXRpb246cmVsYXRpdmU7Ym94LXNpemluZzpib3JkZXItYm94O21pbi13aWR0aDo1LjE0ZW07bWFyZ2luOjAgLjI5ZW07YmFja2dyb3VuZDowIDA7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udDppbmhlcml0O3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZTtvdXRsaW5lOjA7Ym9yZGVyLXJhZGl1czozcHg7LW1vei11c2VyLXNlbGVjdDpub25lOy1tcy11c2VyLXNlbGVjdDpub25lOy13ZWJraXQtdXNlci1zZWxlY3Q6bm9uZTt1c2VyLXNlbGVjdDpub25lO2N1cnNvcjpwb2ludGVyO3otaW5kZXg6MDtAYXBwbHkoLS1wYXBlci1idXR0b24pfS5rZXlib2FyZC1mb2N1c3tmb250LXdlaWdodDo3MDB9Omhvc3QoW2Rpc2FibGVkXSl7YmFja2dyb3VuZDojZWFlYWVhO2NvbG9yOiNhOGE4YTg7Y3Vyc29yOmF1dG87cG9pbnRlci1ldmVudHM6bm9uZTtAYXBwbHkoLS1wYXBlci1idXR0b24tZGlzYWJsZWQpfTpob3N0KFtub2lua10pIHBhcGVyLXJpcHBsZXtkaXNwbGF5Om5vbmV9cGFwZXItbWF0ZXJpYWx7Ym9yZGVyLXJhZGl1czppbmhlcml0fS5jb250ZW50Pjo6Y29udGVudCAqe3RleHQtdHJhbnNmb3JtOmluaGVyaXR9LmNvbnRlbnR7cGFkZGluZzouN2VtIC41N2VtfTwvc3R5bGU+PHRlbXBsYXRlPlxcblxcbiAgICA8cGFwZXItcmlwcGxlPjwvcGFwZXItcmlwcGxlPlxcblxcbiAgICA8cGFwZXItbWF0ZXJpYWwgY2xhc3MkPVxcXCJbW19jb21wdXRlQ29udGVudENsYXNzKHJlY2VpdmVkRm9jdXNGcm9tS2V5Ym9hcmQpXV1cXFwiIGVsZXZhdGlvbj1cXFwiW1tfZWxldmF0aW9uXV1cXFwiIGFuaW1hdGVkPVxcXCJcXFwiPlxcbiAgICAgIDxjb250ZW50PjwvY29udGVudD5cXG4gICAgPC9wYXBlci1tYXRlcmlhbD5cXG5cXG4gIDwvdGVtcGxhdGU+PC9kb20tbW9kdWxlPlwiO1xuOyhmdW5jdGlvbigpIHtcblxuXG4gIFBvbHltZXIoe1xuXG4gICAgaXM6ICdwYXBlci1idXR0b24nLFxuXG4gICAgYmVoYXZpb3JzOiBbXG4gICAgICBQb2x5bWVyLlBhcGVyQnV0dG9uQmVoYXZpb3JcbiAgICBdLFxuXG4gICAgcHJvcGVydGllczoge1xuXG4gICAgICAvKipcbiAgICAgICAqIElmIHRydWUsIHRoZSBidXR0b24gc2hvdWxkIGJlIHN0eWxlZCB3aXRoIGEgc2hhZG93LlxuICAgICAgICovXG4gICAgICByYWlzZWQ6IHtcbiAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICAgIG9ic2VydmVyOiAnX2NhbGN1bGF0ZUVsZXZhdGlvbidcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2NhbGN1bGF0ZUVsZXZhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMucmFpc2VkKSB7XG4gICAgICAgIHRoaXMuX2VsZXZhdGlvbiA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBQb2x5bWVyLlBhcGVyQnV0dG9uQmVoYXZpb3JJbXBsLl9jYWxjdWxhdGVFbGV2YXRpb24uYXBwbHkodGhpcyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIF9jb21wdXRlQ29udGVudENsYXNzOiBmdW5jdGlvbihyZWNlaXZlZEZvY3VzRnJvbUtleWJvYXJkKSB7XG4gICAgICB2YXIgY2xhc3NOYW1lID0gJ2NvbnRlbnQgJztcbiAgICAgIGlmIChyZWNlaXZlZEZvY3VzRnJvbUtleWJvYXJkKSB7XG4gICAgICAgIGNsYXNzTmFtZSArPSAnIGtleWJvYXJkLWZvY3VzJztcbiAgICAgIH1cbiAgICAgIHJldHVybiBjbGFzc05hbWU7XG4gICAgfVxuICB9KTtcblxuXG59KSgpO1xuXG59KSIsInJlcXVpcmUoXCIuLi9wb2x5bWVyL3BvbHltZXIuaHRtbFwiKTtcbnJlcXVpcmUoXCIuLi9wYXBlci1zdHlsZXMvc2hhZG93Lmh0bWxcIik7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGZ1bmN0aW9uKCkge1xudmFyIGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF07XG52YXIgcm9vdCA9IGJvZHkuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSk7XG5yb290LnNldEF0dHJpYnV0ZShcImhpZGRlblwiLFwiXCIpO1xucm9vdC5pbm5lckhUTUw9XCI8ZG9tLW1vZHVsZSBpZD1cXFwicGFwZXItbWF0ZXJpYWxcXFwiPjxzdHlsZT46aG9zdHtkaXNwbGF5OmJsb2NrO3Bvc2l0aW9uOnJlbGF0aXZlO0BhcHBseSgtLXNoYWRvdy10cmFuc2l0aW9uKX06aG9zdChbZWxldmF0aW9uPVxcXCIxXFxcIl0pe0BhcHBseSgtLXNoYWRvdy1lbGV2YXRpb24tMmRwKX06aG9zdChbZWxldmF0aW9uPVxcXCIyXFxcIl0pe0BhcHBseSgtLXNoYWRvdy1lbGV2YXRpb24tNGRwKX06aG9zdChbZWxldmF0aW9uPVxcXCIzXFxcIl0pe0BhcHBseSgtLXNoYWRvdy1lbGV2YXRpb24tNmRwKX06aG9zdChbZWxldmF0aW9uPVxcXCI0XFxcIl0pe0BhcHBseSgtLXNoYWRvdy1lbGV2YXRpb24tOGRwKX06aG9zdChbZWxldmF0aW9uPVxcXCI1XFxcIl0pe0BhcHBseSgtLXNoYWRvdy1lbGV2YXRpb24tMTZkcCl9PC9zdHlsZT48dGVtcGxhdGU+XFxuICAgIDxjb250ZW50PjwvY29udGVudD5cXG4gIDwvdGVtcGxhdGU+PC9kb20tbW9kdWxlPlwiO1xuOyhmdW5jdGlvbigpIHtcblxuICBQb2x5bWVyKHtcbiAgICBpczogJ3BhcGVyLW1hdGVyaWFsJyxcblxuICAgIHByb3BlcnRpZXM6IHtcblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgei1kZXB0aCBvZiB0aGlzIGVsZW1lbnQsIGZyb20gMC01LiBTZXR0aW5nIHRvIDAgd2lsbCByZW1vdmUgdGhlXG4gICAgICAgKiBzaGFkb3csIGFuZCBlYWNoIGluY3JlYXNpbmcgbnVtYmVyIGdyZWF0ZXIgdGhhbiAwIHdpbGwgYmUgXCJkZWVwZXJcIlxuICAgICAgICogdGhhbiB0aGUgbGFzdC5cbiAgICAgICAqXG4gICAgICAgKiBAYXR0cmlidXRlIGVsZXZhdGlvblxuICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgKiBAZGVmYXVsdCAxXG4gICAgICAgKi9cbiAgICAgIGVsZXZhdGlvbjoge1xuICAgICAgICB0eXBlOiBOdW1iZXIsXG4gICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IDFcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0IHRoaXMgdG8gdHJ1ZSB0byBhbmltYXRlIHRoZSBzaGFkb3cgd2hlbiBzZXR0aW5nIGEgbmV3XG4gICAgICAgKiBgZWxldmF0aW9uYCB2YWx1ZS5cbiAgICAgICAqXG4gICAgICAgKiBAYXR0cmlidXRlIGFuaW1hdGVkXG4gICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICovXG4gICAgICBhbmltYXRlZDoge1xuICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbn0pKCk7XG5cbn0pIiwicmVxdWlyZShcIi4uL3BvbHltZXIvcG9seW1lci5odG1sXCIpO1xucmVxdWlyZShcIi4uL2lyb24tYTExeS1rZXlzLWJlaGF2aW9yL2lyb24tYTExeS1rZXlzLWJlaGF2aW9yLmh0bWxcIik7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGZ1bmN0aW9uKCkge1xudmFyIGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF07XG52YXIgcm9vdCA9IGJvZHkuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSk7XG5yb290LnNldEF0dHJpYnV0ZShcImhpZGRlblwiLFwiXCIpO1xucm9vdC5pbm5lckhUTUw9XCI8ZG9tLW1vZHVsZSBpZD1cXFwicGFwZXItcmlwcGxlXFxcIj48c3R5bGU+Omhvc3R7ZGlzcGxheTpibG9jaztwb3NpdGlvbjphYnNvbHV0ZTtib3JkZXItcmFkaXVzOmluaGVyaXQ7b3ZlcmZsb3c6aGlkZGVuO3RvcDowO2xlZnQ6MDtyaWdodDowO2JvdHRvbTowfTpob3N0KFthbmltYXRpbmddKXstd2Via2l0LXRyYW5zZm9ybTp0cmFuc2xhdGUoMCwwKTt0cmFuc2Zvcm06dHJhbnNsYXRlM2QoMCwwLDApfTpob3N0KFtub2lua10pe3BvaW50ZXItZXZlbnRzOm5vbmV9I2JhY2tncm91bmQsI3dhdmVzLC53YXZlLWNvbnRhaW5lciwud2F2ZXtwb2ludGVyLWV2ZW50czpub25lO3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2xlZnQ6MDt3aWR0aDoxMDAlO2hlaWdodDoxMDAlfSNiYWNrZ3JvdW5kLC53YXZle29wYWNpdHk6MH0jd2F2ZXMsLndhdmV7b3ZlcmZsb3c6aGlkZGVufS53YXZlLWNvbnRhaW5lciwud2F2ZXtib3JkZXItcmFkaXVzOjUwJX06aG9zdCguY2lyY2xlKSAjYmFja2dyb3VuZCw6aG9zdCguY2lyY2xlKSAjd2F2ZXN7Ym9yZGVyLXJhZGl1czo1MCV9Omhvc3QoLmNpcmNsZSkgLndhdmUtY29udGFpbmVye292ZXJmbG93OmhpZGRlbn08L3N0eWxlPjx0ZW1wbGF0ZT5cXG4gICAgPGRpdiBpZD1cXFwiYmFja2dyb3VuZFxcXCI+PC9kaXY+XFxuICAgIDxkaXYgaWQ9XFxcIndhdmVzXFxcIj48L2Rpdj5cXG4gIDwvdGVtcGxhdGU+PC9kb20tbW9kdWxlPlwiO1xuOyhmdW5jdGlvbigpIHtcblxuICAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIFV0aWxpdHkgPSB7XG4gICAgICBjc3NDb2xvcldpdGhBbHBoYTogZnVuY3Rpb24oY3NzQ29sb3IsIGFscGhhKSB7XG4gICAgICAgIHZhciBwYXJ0cyA9IGNzc0NvbG9yLm1hdGNoKC9ecmdiXFwoKFxcZCspLFxccyooXFxkKyksXFxzKihcXGQrKVxcKSQvKTtcblxuICAgICAgICBpZiAodHlwZW9mIGFscGhhID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgYWxwaGEgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFwYXJ0cykge1xuICAgICAgICAgIHJldHVybiAncmdiYSgyNTUsIDI1NSwgMjU1LCAnICsgYWxwaGEgKyAnKSc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJ3JnYmEoJyArIHBhcnRzWzFdICsgJywgJyArIHBhcnRzWzJdICsgJywgJyArIHBhcnRzWzNdICsgJywgJyArIGFscGhhICsgJyknO1xuICAgICAgfSxcblxuICAgICAgZGlzdGFuY2U6IGZ1bmN0aW9uKHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgICAgIHZhciB4RGVsdGEgPSAoeDEgLSB4Mik7XG4gICAgICAgIHZhciB5RGVsdGEgPSAoeTEgLSB5Mik7XG5cbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh4RGVsdGEgKiB4RGVsdGEgKyB5RGVsdGEgKiB5RGVsdGEpO1xuICAgICAgfSxcblxuICAgICAgbm93OiAoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh3aW5kb3cucGVyZm9ybWFuY2UgJiYgd2luZG93LnBlcmZvcm1hbmNlLm5vdykge1xuICAgICAgICAgIHJldHVybiB3aW5kb3cucGVyZm9ybWFuY2Uubm93LmJpbmQod2luZG93LnBlcmZvcm1hbmNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBEYXRlLm5vdztcbiAgICAgIH0pKClcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGZ1bmN0aW9uIEVsZW1lbnRNZXRyaWNzKGVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICB0aGlzLndpZHRoID0gdGhpcy5ib3VuZGluZ1JlY3Qud2lkdGg7XG4gICAgICB0aGlzLmhlaWdodCA9IHRoaXMuYm91bmRpbmdSZWN0LmhlaWdodDtcblxuICAgICAgdGhpcy5zaXplID0gTWF0aC5tYXgodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIH1cblxuICAgIEVsZW1lbnRNZXRyaWNzLnByb3RvdHlwZSA9IHtcbiAgICAgIGdldCBib3VuZGluZ1JlY3QgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgfSxcblxuICAgICAgZnVydGhlc3RDb3JuZXJEaXN0YW5jZUZyb206IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdmFyIHRvcExlZnQgPSBVdGlsaXR5LmRpc3RhbmNlKHgsIHksIDAsIDApO1xuICAgICAgICB2YXIgdG9wUmlnaHQgPSBVdGlsaXR5LmRpc3RhbmNlKHgsIHksIHRoaXMud2lkdGgsIDApO1xuICAgICAgICB2YXIgYm90dG9tTGVmdCA9IFV0aWxpdHkuZGlzdGFuY2UoeCwgeSwgMCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICB2YXIgYm90dG9tUmlnaHQgPSBVdGlsaXR5LmRpc3RhbmNlKHgsIHksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuICAgICAgICByZXR1cm4gTWF0aC5tYXgodG9wTGVmdCwgdG9wUmlnaHQsIGJvdHRvbUxlZnQsIGJvdHRvbVJpZ2h0KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFJpcHBsZShlbGVtZW50KSB7XG4gICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgdGhpcy5jb2xvciA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLmNvbG9yO1xuXG4gICAgICB0aGlzLndhdmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHRoaXMud2F2ZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdGhpcy53YXZlLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IHRoaXMuY29sb3I7XG4gICAgICB0aGlzLndhdmUuY2xhc3NMaXN0LmFkZCgnd2F2ZScpO1xuICAgICAgdGhpcy53YXZlQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ3dhdmUtY29udGFpbmVyJyk7XG4gICAgICBQb2x5bWVyLmRvbSh0aGlzLndhdmVDb250YWluZXIpLmFwcGVuZENoaWxkKHRoaXMud2F2ZSk7XG5cbiAgICAgIHRoaXMucmVzZXRJbnRlcmFjdGlvblN0YXRlKCk7XG4gICAgfVxuXG4gICAgUmlwcGxlLk1BWF9SQURJVVMgPSAzMDA7XG5cbiAgICBSaXBwbGUucHJvdG90eXBlID0ge1xuICAgICAgZ2V0IHJlY2VudGVycygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5yZWNlbnRlcnM7XG4gICAgICB9LFxuXG4gICAgICBnZXQgY2VudGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmNlbnRlcjtcbiAgICAgIH0sXG5cbiAgICAgIGdldCBtb3VzZURvd25FbGFwc2VkKCkge1xuICAgICAgICB2YXIgZWxhcHNlZDtcblxuICAgICAgICBpZiAoIXRoaXMubW91c2VEb3duU3RhcnQpIHtcbiAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsYXBzZWQgPSBVdGlsaXR5Lm5vdygpIC0gdGhpcy5tb3VzZURvd25TdGFydDtcblxuICAgICAgICBpZiAodGhpcy5tb3VzZVVwU3RhcnQpIHtcbiAgICAgICAgICBlbGFwc2VkIC09IHRoaXMubW91c2VVcEVsYXBzZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZWxhcHNlZDtcbiAgICAgIH0sXG5cbiAgICAgIGdldCBtb3VzZVVwRWxhcHNlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2VVcFN0YXJ0ID9cbiAgICAgICAgICBVdGlsaXR5Lm5vdyAoKSAtIHRoaXMubW91c2VVcFN0YXJ0IDogMDtcbiAgICAgIH0sXG5cbiAgICAgIGdldCBtb3VzZURvd25FbGFwc2VkU2Vjb25kcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2VEb3duRWxhcHNlZCAvIDEwMDA7XG4gICAgICB9LFxuXG4gICAgICBnZXQgbW91c2VVcEVsYXBzZWRTZWNvbmRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZVVwRWxhcHNlZCAvIDEwMDA7XG4gICAgICB9LFxuXG4gICAgICBnZXQgbW91c2VJbnRlcmFjdGlvblNlY29uZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vdXNlRG93bkVsYXBzZWRTZWNvbmRzICsgdGhpcy5tb3VzZVVwRWxhcHNlZFNlY29uZHM7XG4gICAgICB9LFxuXG4gICAgICBnZXQgaW5pdGlhbE9wYWNpdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuaW5pdGlhbE9wYWNpdHk7XG4gICAgICB9LFxuXG4gICAgICBnZXQgb3BhY2l0eURlY2F5VmVsb2NpdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQub3BhY2l0eURlY2F5VmVsb2NpdHk7XG4gICAgICB9LFxuXG4gICAgICBnZXQgcmFkaXVzKCkge1xuICAgICAgICB2YXIgd2lkdGgyID0gdGhpcy5jb250YWluZXJNZXRyaWNzLndpZHRoICogdGhpcy5jb250YWluZXJNZXRyaWNzLndpZHRoO1xuICAgICAgICB2YXIgaGVpZ2h0MiA9IHRoaXMuY29udGFpbmVyTWV0cmljcy5oZWlnaHQgKiB0aGlzLmNvbnRhaW5lck1ldHJpY3MuaGVpZ2h0O1xuICAgICAgICB2YXIgd2F2ZVJhZGl1cyA9IE1hdGgubWluKFxuICAgICAgICAgIE1hdGguc3FydCh3aWR0aDIgKyBoZWlnaHQyKSxcbiAgICAgICAgICBSaXBwbGUuTUFYX1JBRElVU1xuICAgICAgICApICogMS4xICsgNTtcblxuICAgICAgICB2YXIgZHVyYXRpb24gPSAxLjEgLSAwLjIgKiAod2F2ZVJhZGl1cyAvIFJpcHBsZS5NQVhfUkFESVVTKTtcbiAgICAgICAgdmFyIHRpbWVOb3cgPSB0aGlzLm1vdXNlSW50ZXJhY3Rpb25TZWNvbmRzIC8gZHVyYXRpb247XG4gICAgICAgIHZhciBzaXplID0gd2F2ZVJhZGl1cyAqICgxIC0gTWF0aC5wb3coODAsIC10aW1lTm93KSk7XG5cbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKHNpemUpO1xuICAgICAgfSxcblxuICAgICAgZ2V0IG9wYWNpdHkoKSB7XG4gICAgICAgIGlmICghdGhpcy5tb3VzZVVwU3RhcnQpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pbml0aWFsT3BhY2l0eTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBNYXRoLm1heChcbiAgICAgICAgICAwLFxuICAgICAgICAgIHRoaXMuaW5pdGlhbE9wYWNpdHkgLSB0aGlzLm1vdXNlVXBFbGFwc2VkU2Vjb25kcyAqIHRoaXMub3BhY2l0eURlY2F5VmVsb2NpdHlcbiAgICAgICAgKTtcbiAgICAgIH0sXG5cbiAgICAgIGdldCBvdXRlck9wYWNpdHkoKSB7XG4gICAgICAgIC8vIExpbmVhciBpbmNyZWFzZSBpbiBiYWNrZ3JvdW5kIG9wYWNpdHksIGNhcHBlZCBhdCB0aGUgb3BhY2l0eVxuICAgICAgICAvLyBvZiB0aGUgd2F2ZWZyb250ICh3YXZlT3BhY2l0eSkuXG4gICAgICAgIHZhciBvdXRlck9wYWNpdHkgPSB0aGlzLm1vdXNlVXBFbGFwc2VkU2Vjb25kcyAqIDAuMztcbiAgICAgICAgdmFyIHdhdmVPcGFjaXR5ID0gdGhpcy5vcGFjaXR5O1xuXG4gICAgICAgIHJldHVybiBNYXRoLm1heChcbiAgICAgICAgICAwLFxuICAgICAgICAgIE1hdGgubWluKG91dGVyT3BhY2l0eSwgd2F2ZU9wYWNpdHkpXG4gICAgICAgICk7XG4gICAgICB9LFxuXG4gICAgICBnZXQgaXNPcGFjaXR5RnVsbHlEZWNheWVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcGFjaXR5IDwgMC4wMSAmJlxuICAgICAgICAgIHRoaXMucmFkaXVzID49IE1hdGgubWluKHRoaXMubWF4UmFkaXVzLCBSaXBwbGUuTUFYX1JBRElVUyk7XG4gICAgICB9LFxuXG4gICAgICBnZXQgaXNSZXN0aW5nQXRNYXhSYWRpdXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wYWNpdHkgPj0gdGhpcy5pbml0aWFsT3BhY2l0eSAmJlxuICAgICAgICAgIHRoaXMucmFkaXVzID49IE1hdGgubWluKHRoaXMubWF4UmFkaXVzLCBSaXBwbGUuTUFYX1JBRElVUyk7XG4gICAgICB9LFxuXG4gICAgICBnZXQgaXNBbmltYXRpb25Db21wbGV0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2VVcFN0YXJ0ID9cbiAgICAgICAgICB0aGlzLmlzT3BhY2l0eUZ1bGx5RGVjYXllZCA6IHRoaXMuaXNSZXN0aW5nQXRNYXhSYWRpdXM7XG4gICAgICB9LFxuXG4gICAgICBnZXQgdHJhbnNsYXRpb25GcmFjdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKFxuICAgICAgICAgIDEsXG4gICAgICAgICAgdGhpcy5yYWRpdXMgLyB0aGlzLmNvbnRhaW5lck1ldHJpY3Muc2l6ZSAqIDIgLyBNYXRoLnNxcnQoMilcbiAgICAgICAgKTtcbiAgICAgIH0sXG5cbiAgICAgIGdldCB4Tm93KCkge1xuICAgICAgICBpZiAodGhpcy54RW5kKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMueFN0YXJ0ICsgdGhpcy50cmFuc2xhdGlvbkZyYWN0aW9uICogKHRoaXMueEVuZCAtIHRoaXMueFN0YXJ0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnhTdGFydDtcbiAgICAgIH0sXG5cbiAgICAgIGdldCB5Tm93KCkge1xuICAgICAgICBpZiAodGhpcy55RW5kKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMueVN0YXJ0ICsgdGhpcy50cmFuc2xhdGlvbkZyYWN0aW9uICogKHRoaXMueUVuZCAtIHRoaXMueVN0YXJ0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnlTdGFydDtcbiAgICAgIH0sXG5cbiAgICAgIGdldCBpc01vdXNlRG93bigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2VEb3duU3RhcnQgJiYgIXRoaXMubW91c2VVcFN0YXJ0O1xuICAgICAgfSxcblxuICAgICAgcmVzZXRJbnRlcmFjdGlvblN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5tYXhSYWRpdXMgPSAwO1xuICAgICAgICB0aGlzLm1vdXNlRG93blN0YXJ0ID0gMDtcbiAgICAgICAgdGhpcy5tb3VzZVVwU3RhcnQgPSAwO1xuXG4gICAgICAgIHRoaXMueFN0YXJ0ID0gMDtcbiAgICAgICAgdGhpcy55U3RhcnQgPSAwO1xuICAgICAgICB0aGlzLnhFbmQgPSAwO1xuICAgICAgICB0aGlzLnlFbmQgPSAwO1xuICAgICAgICB0aGlzLnNsaWRlRGlzdGFuY2UgPSAwO1xuXG4gICAgICAgIHRoaXMuY29udGFpbmVyTWV0cmljcyA9IG5ldyBFbGVtZW50TWV0cmljcyh0aGlzLmVsZW1lbnQpO1xuICAgICAgfSxcblxuICAgICAgZHJhdzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzY2FsZTtcbiAgICAgICAgdmFyIHRyYW5zbGF0ZVN0cmluZztcbiAgICAgICAgdmFyIGR4O1xuICAgICAgICB2YXIgZHk7XG5cbiAgICAgICAgdGhpcy53YXZlLnN0eWxlLm9wYWNpdHkgPSB0aGlzLm9wYWNpdHk7XG5cbiAgICAgICAgc2NhbGUgPSB0aGlzLnJhZGl1cyAvICh0aGlzLmNvbnRhaW5lck1ldHJpY3Muc2l6ZSAvIDIpO1xuICAgICAgICBkeCA9IHRoaXMueE5vdyAtICh0aGlzLmNvbnRhaW5lck1ldHJpY3Mud2lkdGggLyAyKTtcbiAgICAgICAgZHkgPSB0aGlzLnlOb3cgLSAodGhpcy5jb250YWluZXJNZXRyaWNzLmhlaWdodCAvIDIpO1xuXG5cbiAgICAgICAgLy8gMmQgdHJhbnNmb3JtIGZvciBzYWZhcmkgYmVjYXVzZSBvZiBib3JkZXItcmFkaXVzIGFuZCBvdmVyZmxvdzpoaWRkZW4gY2xpcHBpbmcgYnVnLlxuICAgICAgICAvLyBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9OTg1MzhcbiAgICAgICAgdGhpcy53YXZlQ29udGFpbmVyLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIGR4ICsgJ3B4LCAnICsgZHkgKyAncHgpJztcbiAgICAgICAgdGhpcy53YXZlQ29udGFpbmVyLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnICsgZHggKyAncHgsICcgKyBkeSArICdweCwgMCknO1xuICAgICAgICB0aGlzLndhdmUuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gJ3NjYWxlKCcgKyBzY2FsZSArICcsJyArIHNjYWxlICsgJyknO1xuICAgICAgICB0aGlzLndhdmUuc3R5bGUudHJhbnNmb3JtID0gJ3NjYWxlM2QoJyArIHNjYWxlICsgJywnICsgc2NhbGUgKyAnLDEpJztcbiAgICAgIH0sXG5cbiAgICAgIC8qKiBAcGFyYW0ge0V2ZW50PX0gZXZlbnQgKi9cbiAgICAgIGRvd25BY3Rpb246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciB4Q2VudGVyID0gdGhpcy5jb250YWluZXJNZXRyaWNzLndpZHRoIC8gMjtcbiAgICAgICAgdmFyIHlDZW50ZXIgPSB0aGlzLmNvbnRhaW5lck1ldHJpY3MuaGVpZ2h0IC8gMjtcblxuICAgICAgICB0aGlzLnJlc2V0SW50ZXJhY3Rpb25TdGF0ZSgpO1xuICAgICAgICB0aGlzLm1vdXNlRG93blN0YXJ0ID0gVXRpbGl0eS5ub3coKTtcblxuICAgICAgICBpZiAodGhpcy5jZW50ZXIpIHtcbiAgICAgICAgICB0aGlzLnhTdGFydCA9IHhDZW50ZXI7XG4gICAgICAgICAgdGhpcy55U3RhcnQgPSB5Q2VudGVyO1xuICAgICAgICAgIHRoaXMuc2xpZGVEaXN0YW5jZSA9IFV0aWxpdHkuZGlzdGFuY2UoXG4gICAgICAgICAgICB0aGlzLnhTdGFydCwgdGhpcy55U3RhcnQsIHRoaXMueEVuZCwgdGhpcy55RW5kXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnhTdGFydCA9IGV2ZW50ID9cbiAgICAgICAgICAgICAgZXZlbnQuZGV0YWlsLnggLSB0aGlzLmNvbnRhaW5lck1ldHJpY3MuYm91bmRpbmdSZWN0LmxlZnQgOlxuICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lck1ldHJpY3Mud2lkdGggLyAyO1xuICAgICAgICAgIHRoaXMueVN0YXJ0ID0gZXZlbnQgP1xuICAgICAgICAgICAgICBldmVudC5kZXRhaWwueSAtIHRoaXMuY29udGFpbmVyTWV0cmljcy5ib3VuZGluZ1JlY3QudG9wIDpcbiAgICAgICAgICAgICAgdGhpcy5jb250YWluZXJNZXRyaWNzLmhlaWdodCAvIDI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5yZWNlbnRlcnMpIHtcbiAgICAgICAgICB0aGlzLnhFbmQgPSB4Q2VudGVyO1xuICAgICAgICAgIHRoaXMueUVuZCA9IHlDZW50ZXI7XG4gICAgICAgICAgdGhpcy5zbGlkZURpc3RhbmNlID0gVXRpbGl0eS5kaXN0YW5jZShcbiAgICAgICAgICAgIHRoaXMueFN0YXJ0LCB0aGlzLnlTdGFydCwgdGhpcy54RW5kLCB0aGlzLnlFbmRcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tYXhSYWRpdXMgPSB0aGlzLmNvbnRhaW5lck1ldHJpY3MuZnVydGhlc3RDb3JuZXJEaXN0YW5jZUZyb20oXG4gICAgICAgICAgdGhpcy54U3RhcnQsXG4gICAgICAgICAgdGhpcy55U3RhcnRcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLndhdmVDb250YWluZXIuc3R5bGUudG9wID1cbiAgICAgICAgICAodGhpcy5jb250YWluZXJNZXRyaWNzLmhlaWdodCAtIHRoaXMuY29udGFpbmVyTWV0cmljcy5zaXplKSAvIDIgKyAncHgnO1xuICAgICAgICB0aGlzLndhdmVDb250YWluZXIuc3R5bGUubGVmdCA9XG4gICAgICAgICAgKHRoaXMuY29udGFpbmVyTWV0cmljcy53aWR0aCAtIHRoaXMuY29udGFpbmVyTWV0cmljcy5zaXplKSAvIDIgKyAncHgnO1xuXG4gICAgICAgIHRoaXMud2F2ZUNvbnRhaW5lci5zdHlsZS53aWR0aCA9IHRoaXMuY29udGFpbmVyTWV0cmljcy5zaXplICsgJ3B4JztcbiAgICAgICAgdGhpcy53YXZlQ29udGFpbmVyLnN0eWxlLmhlaWdodCA9IHRoaXMuY29udGFpbmVyTWV0cmljcy5zaXplICsgJ3B4JztcbiAgICAgIH0sXG5cbiAgICAgIC8qKiBAcGFyYW0ge0V2ZW50PX0gZXZlbnQgKi9cbiAgICAgIHVwQWN0aW9uOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNNb3VzZURvd24pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1vdXNlVXBTdGFydCA9IFV0aWxpdHkubm93KCk7XG4gICAgICB9LFxuXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBQb2x5bWVyLmRvbSh0aGlzLndhdmVDb250YWluZXIucGFyZW50Tm9kZSkucmVtb3ZlQ2hpbGQoXG4gICAgICAgICAgdGhpcy53YXZlQ29udGFpbmVyXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIFBvbHltZXIoe1xuICAgICAgaXM6ICdwYXBlci1yaXBwbGUnLFxuXG4gICAgICBiZWhhdmlvcnM6IFtcbiAgICAgICAgUG9seW1lci5Jcm9uQTExeUtleXNCZWhhdmlvclxuICAgICAgXSxcblxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGluaXRpYWwgb3BhY2l0eSBzZXQgb24gdGhlIHdhdmUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBhdHRyaWJ1dGUgaW5pdGlhbE9wYWNpdHlcbiAgICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICAqIEBkZWZhdWx0IDAuMjVcbiAgICAgICAgICovXG4gICAgICAgIGluaXRpYWxPcGFjaXR5OiB7XG4gICAgICAgICAgdHlwZTogTnVtYmVyLFxuICAgICAgICAgIHZhbHVlOiAwLjI1XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEhvdyBmYXN0IChvcGFjaXR5IHBlciBzZWNvbmQpIHRoZSB3YXZlIGZhZGVzIG91dC5cbiAgICAgICAgICpcbiAgICAgICAgICogQGF0dHJpYnV0ZSBvcGFjaXR5RGVjYXlWZWxvY2l0eVxuICAgICAgICAgKiBAdHlwZSBudW1iZXJcbiAgICAgICAgICogQGRlZmF1bHQgMC44XG4gICAgICAgICAqL1xuICAgICAgICBvcGFjaXR5RGVjYXlWZWxvY2l0eToge1xuICAgICAgICAgIHR5cGU6IE51bWJlcixcbiAgICAgICAgICB2YWx1ZTogMC44XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIHRydWUsIHJpcHBsZXMgd2lsbCBleGhpYml0IGEgZ3Jhdml0YXRpb25hbCBwdWxsIHRvd2FyZHNcbiAgICAgICAgICogdGhlIGNlbnRlciBvZiB0aGVpciBjb250YWluZXIgYXMgdGhleSBmYWRlIGF3YXkuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBhdHRyaWJ1dGUgcmVjZW50ZXJzXG4gICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgICAgIHJlY2VudGVyczoge1xuICAgICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIHRydWUsIHJpcHBsZXMgd2lsbCBjZW50ZXIgaW5zaWRlIGl0cyBjb250YWluZXJcbiAgICAgICAgICpcbiAgICAgICAgICogQGF0dHJpYnV0ZSByZWNlbnRlcnNcbiAgICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICAgICAgY2VudGVyOiB7XG4gICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQSBsaXN0IG9mIHRoZSB2aXN1YWwgcmlwcGxlcy5cbiAgICAgICAgICpcbiAgICAgICAgICogQGF0dHJpYnV0ZSByaXBwbGVzXG4gICAgICAgICAqIEB0eXBlIEFycmF5XG4gICAgICAgICAqIEBkZWZhdWx0IFtdXG4gICAgICAgICAqL1xuICAgICAgICByaXBwbGVzOiB7XG4gICAgICAgICAgdHlwZTogQXJyYXksXG4gICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJ1ZSB3aGVuIHRoZXJlIGFyZSB2aXNpYmxlIHJpcHBsZXMgYW5pbWF0aW5nIHdpdGhpbiB0aGVcbiAgICAgICAgICogZWxlbWVudC5cbiAgICAgICAgICovXG4gICAgICAgIGFuaW1hdGluZzoge1xuICAgICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICAgIHZhbHVlOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiB0cnVlLCB0aGUgcmlwcGxlIHdpbGwgcmVtYWluIGluIHRoZSBcImRvd25cIiBzdGF0ZSB1bnRpbCBgaG9sZERvd25gXG4gICAgICAgICAqIGlzIHNldCB0byBmYWxzZSBhZ2Fpbi5cbiAgICAgICAgICovXG4gICAgICAgIGhvbGREb3duOiB7XG4gICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICAgICAgb2JzZXJ2ZXI6ICdfaG9sZERvd25DaGFuZ2VkJ1xuICAgICAgICB9LFxuXG4gICAgICAgIF9hbmltYXRpbmc6IHtcbiAgICAgICAgICB0eXBlOiBCb29sZWFuXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2JvdW5kQW5pbWF0ZToge1xuICAgICAgICAgIHR5cGU6IEZ1bmN0aW9uLFxuICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFuaW1hdGUuYmluZCh0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGdldCB0YXJnZXQgKCkge1xuICAgICAgICB2YXIgb3duZXJSb290ID0gUG9seW1lci5kb20odGhpcykuZ2V0T3duZXJSb290KCk7XG4gICAgICAgIHZhciB0YXJnZXQ7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyZW50Tm9kZS5ub2RlVHlwZSA9PSAxMSkgeyAvLyBET0NVTUVOVF9GUkFHTUVOVF9OT0RFXG4gICAgICAgICAgdGFyZ2V0ID0gb3duZXJSb290Lmhvc3Q7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFyZ2V0ID0gdGhpcy5wYXJlbnROb2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgIH0sXG5cbiAgICAgIGtleUJpbmRpbmdzOiB7XG4gICAgICAgICdlbnRlcjprZXlkb3duJzogJ19vbkVudGVyS2V5ZG93bicsXG4gICAgICAgICdzcGFjZTprZXlkb3duJzogJ19vblNwYWNlS2V5ZG93bicsXG4gICAgICAgICdzcGFjZTprZXl1cCc6ICdfb25TcGFjZUtleXVwJ1xuICAgICAgfSxcblxuICAgICAgYXR0YWNoZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLnRhcmdldCwgJ3VwJywgJ3VwQWN0aW9uJyk7XG4gICAgICAgIHRoaXMubGlzdGVuKHRoaXMudGFyZ2V0LCAnZG93bicsICdkb3duQWN0aW9uJyk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnRhcmdldC5oYXNBdHRyaWJ1dGUoJ25vaW5rJykpIHtcbiAgICAgICAgICB0aGlzLmtleUV2ZW50VGFyZ2V0ID0gdGhpcy50YXJnZXQ7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGdldCBzaG91bGRLZWVwQW5pbWF0aW5nICgpIHtcbiAgICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmlwcGxlcy5sZW5ndGg7ICsraW5kZXgpIHtcbiAgICAgICAgICBpZiAoIXRoaXMucmlwcGxlc1tpbmRleF0uaXNBbmltYXRpb25Db21wbGV0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcblxuICAgICAgc2ltdWxhdGVkUmlwcGxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5kb3duQWN0aW9uKG51bGwpO1xuXG4gICAgICAgIC8vIFBsZWFzZSBzZWUgcG9seW1lci9wb2x5bWVyIzEzMDVcbiAgICAgICAgdGhpcy5hc3luYyhmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLnVwQWN0aW9uKCk7XG4gICAgICAgIH0sIDEpO1xuICAgICAgfSxcblxuICAgICAgLyoqIEBwYXJhbSB7RXZlbnQ9fSBldmVudCAqL1xuICAgICAgZG93bkFjdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuaG9sZERvd24gJiYgdGhpcy5yaXBwbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmlwcGxlID0gdGhpcy5hZGRSaXBwbGUoKTtcblxuICAgICAgICByaXBwbGUuZG93bkFjdGlvbihldmVudCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9hbmltYXRpbmcpIHtcbiAgICAgICAgICB0aGlzLmFuaW1hdGUoKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgLyoqIEBwYXJhbSB7RXZlbnQ9fSBldmVudCAqL1xuICAgICAgdXBBY3Rpb246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmhvbGREb3duKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yaXBwbGVzLmZvckVhY2goZnVuY3Rpb24ocmlwcGxlKSB7XG4gICAgICAgICAgcmlwcGxlLnVwQWN0aW9uKGV2ZW50KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hbmltYXRlKCk7XG4gICAgICB9LFxuXG4gICAgICBvbkFuaW1hdGlvbkNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuJC5iYWNrZ3JvdW5kLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IG51bGw7XG4gICAgICAgIHRoaXMuZmlyZSgndHJhbnNpdGlvbmVuZCcpO1xuICAgICAgfSxcblxuICAgICAgYWRkUmlwcGxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJpcHBsZSA9IG5ldyBSaXBwbGUodGhpcyk7XG5cbiAgICAgICAgUG9seW1lci5kb20odGhpcy4kLndhdmVzKS5hcHBlbmRDaGlsZChyaXBwbGUud2F2ZUNvbnRhaW5lcik7XG4gICAgICAgIHRoaXMuJC5iYWNrZ3JvdW5kLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IHJpcHBsZS5jb2xvcjtcbiAgICAgICAgdGhpcy5yaXBwbGVzLnB1c2gocmlwcGxlKTtcblxuICAgICAgICB0aGlzLl9zZXRBbmltYXRpbmcodHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIHJpcHBsZTtcbiAgICAgIH0sXG5cbiAgICAgIHJlbW92ZVJpcHBsZTogZnVuY3Rpb24ocmlwcGxlKSB7XG4gICAgICAgIHZhciByaXBwbGVJbmRleCA9IHRoaXMucmlwcGxlcy5pbmRleE9mKHJpcHBsZSk7XG5cbiAgICAgICAgaWYgKHJpcHBsZUluZGV4IDwgMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmlwcGxlcy5zcGxpY2UocmlwcGxlSW5kZXgsIDEpO1xuXG4gICAgICAgIHJpcHBsZS5yZW1vdmUoKTtcblxuICAgICAgICBpZiAoIXRoaXMucmlwcGxlcy5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLl9zZXRBbmltYXRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBhbmltYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGluZGV4O1xuICAgICAgICB2YXIgcmlwcGxlO1xuXG4gICAgICAgIHRoaXMuX2FuaW1hdGluZyA9IHRydWU7XG5cbiAgICAgICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5yaXBwbGVzLmxlbmd0aDsgKytpbmRleCkge1xuICAgICAgICAgIHJpcHBsZSA9IHRoaXMucmlwcGxlc1tpbmRleF07XG5cbiAgICAgICAgICByaXBwbGUuZHJhdygpO1xuXG4gICAgICAgICAgdGhpcy4kLmJhY2tncm91bmQuc3R5bGUub3BhY2l0eSA9IHJpcHBsZS5vdXRlck9wYWNpdHk7XG5cbiAgICAgICAgICBpZiAocmlwcGxlLmlzT3BhY2l0eUZ1bGx5RGVjYXllZCAmJiAhcmlwcGxlLmlzUmVzdGluZ0F0TWF4UmFkaXVzKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZVJpcHBsZShyaXBwbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5zaG91bGRLZWVwQW5pbWF0aW5nICYmIHRoaXMucmlwcGxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLm9uQW5pbWF0aW9uQ29tcGxldGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX2JvdW5kQW5pbWF0ZSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIF9vbkVudGVyS2V5ZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZG93bkFjdGlvbigpO1xuICAgICAgICB0aGlzLmFzeW5jKHRoaXMudXBBY3Rpb24sIDEpO1xuICAgICAgfSxcblxuICAgICAgX29uU3BhY2VLZXlkb3duOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5kb3duQWN0aW9uKCk7XG4gICAgICB9LFxuXG4gICAgICBfb25TcGFjZUtleXVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy51cEFjdGlvbigpO1xuICAgICAgfSxcblxuICAgICAgX2hvbGREb3duQ2hhbmdlZDogZnVuY3Rpb24oaG9sZERvd24pIHtcbiAgICAgICAgaWYgKGhvbGREb3duKSB7XG4gICAgICAgICAgdGhpcy5kb3duQWN0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy51cEFjdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0pKCk7XG5cbn0pKCk7XG5cbn0pIiwicmVxdWlyZShcIi4uL3BvbHltZXIvcG9seW1lci5odG1sXCIpO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixmdW5jdGlvbigpIHtcbnZhciBoZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdO1xuaGVhZC5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmVlbmRcIixcIjxzdHlsZSBpcz1cXFwiY3VzdG9tLXN0eWxlXFxcIj46cm9vdHstLXNoYWRvdy10cmFuc2l0aW9uOnt0cmFuc2l0aW9uOmJveC1zaGFkb3cgLjI4cyBjdWJpYy1iZXppZXIoMC40LDAsLjIsMSl9Oy0tc2hhZG93LW5vbmU6e2JveC1zaGFkb3c6bm9uZX07LS1zaGFkb3ctZWxldmF0aW9uLTJkcDp7Ym94LXNoYWRvdzowIDJweCAycHggMCByZ2JhKDAsMCwwLC4xNCksMCAxcHggNXB4IDAgcmdiYSgwLDAsMCwuMTIpLDAgM3B4IDFweCAtMnB4IHJnYmEoMCwwLDAsLjIpfTstLXNoYWRvdy1lbGV2YXRpb24tM2RwOntib3gtc2hhZG93OjAgM3B4IDRweCAwIHJnYmEoMCwwLDAsLjE0KSwwIDFweCA4cHggMCByZ2JhKDAsMCwwLC4xMiksMCAzcHggM3B4IC0ycHggcmdiYSgwLDAsMCwuNCl9Oy0tc2hhZG93LWVsZXZhdGlvbi00ZHA6e2JveC1zaGFkb3c6MCA0cHggNXB4IDAgcmdiYSgwLDAsMCwuMTQpLDAgMXB4IDEwcHggMCByZ2JhKDAsMCwwLC4xMiksMCAycHggNHB4IC0xcHggcmdiYSgwLDAsMCwuNCl9Oy0tc2hhZG93LWVsZXZhdGlvbi02ZHA6e2JveC1zaGFkb3c6MCA2cHggMTBweCAwIHJnYmEoMCwwLDAsLjE0KSwwIDFweCAxOHB4IDAgcmdiYSgwLDAsMCwuMTIpLDAgM3B4IDVweCAtMXB4IHJnYmEoMCwwLDAsLjQpfTstLXNoYWRvdy1lbGV2YXRpb24tOGRwOntib3gtc2hhZG93OjAgOHB4IDEwcHggMXB4IHJnYmEoMCwwLDAsLjE0KSwwIDNweCAxNHB4IDJweCByZ2JhKDAsMCwwLC4xMiksMCA1cHggNXB4IC0zcHggcmdiYSgwLDAsMCwuNCl9Oy0tc2hhZG93LWVsZXZhdGlvbi0xNmRwOntib3gtc2hhZG93OjAgMTZweCAyNHB4IDJweCByZ2JhKDAsMCwwLC4xNCksMCA2cHggMzBweCA1cHggcmdiYSgwLDAsMCwuMTIpLDAgOHB4IDEwcHggLTVweCByZ2JhKDAsMCwwLC40KX19PC9zdHlsZT5cIik7XG5cbn0pIiwiZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixmdW5jdGlvbigpIHtcbjsoZnVuY3Rpb24oKSB7XG4oZnVuY3Rpb24gKCkge1xuZnVuY3Rpb24gcmVzb2x2ZSgpIHtcbmRvY3VtZW50LmJvZHkucmVtb3ZlQXR0cmlidXRlKCd1bnJlc29sdmVkJyk7XG59XG5pZiAod2luZG93LldlYkNvbXBvbmVudHMpIHtcbmFkZEV2ZW50TGlzdGVuZXIoJ1dlYkNvbXBvbmVudHNSZWFkeScsIHJlc29sdmUpO1xufSBlbHNlIHtcbmlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnaW50ZXJhY3RpdmUnIHx8IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbnJlc29sdmUoKTtcbn0gZWxzZSB7XG5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgcmVzb2x2ZSk7XG59XG59XG59KCkpO1xuUG9seW1lciA9IHtcblNldHRpbmdzOiBmdW5jdGlvbiAoKSB7XG52YXIgdXNlciA9IHdpbmRvdy5Qb2x5bWVyIHx8IHt9O1xubG9jYXRpb24uc2VhcmNoLnNsaWNlKDEpLnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbiAobykge1xubyA9IG8uc3BsaXQoJz0nKTtcbm9bMF0gJiYgKHVzZXJbb1swXV0gPSBvWzFdIHx8IHRydWUpO1xufSk7XG52YXIgd2FudFNoYWRvdyA9IHVzZXIuZG9tID09PSAnc2hhZG93JztcbnZhciBoYXNTaGFkb3cgPSBCb29sZWFuKEVsZW1lbnQucHJvdG90eXBlLmNyZWF0ZVNoYWRvd1Jvb3QpO1xudmFyIG5hdGl2ZVNoYWRvdyA9IGhhc1NoYWRvdyAmJiAhd2luZG93LlNoYWRvd0RPTVBvbHlmaWxsO1xudmFyIHVzZVNoYWRvdyA9IHdhbnRTaGFkb3cgJiYgaGFzU2hhZG93O1xudmFyIGhhc05hdGl2ZUltcG9ydHMgPSBCb29sZWFuKCdpbXBvcnQnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKSk7XG52YXIgdXNlTmF0aXZlSW1wb3J0cyA9IGhhc05hdGl2ZUltcG9ydHM7XG52YXIgdXNlTmF0aXZlQ3VzdG9tRWxlbWVudHMgPSAhd2luZG93LkN1c3RvbUVsZW1lbnRzIHx8IHdpbmRvdy5DdXN0b21FbGVtZW50cy51c2VOYXRpdmU7XG5yZXR1cm4ge1xud2FudFNoYWRvdzogd2FudFNoYWRvdyxcbmhhc1NoYWRvdzogaGFzU2hhZG93LFxubmF0aXZlU2hhZG93OiBuYXRpdmVTaGFkb3csXG51c2VTaGFkb3c6IHVzZVNoYWRvdyxcbnVzZU5hdGl2ZVNoYWRvdzogdXNlU2hhZG93ICYmIG5hdGl2ZVNoYWRvdyxcbnVzZU5hdGl2ZUltcG9ydHM6IHVzZU5hdGl2ZUltcG9ydHMsXG51c2VOYXRpdmVDdXN0b21FbGVtZW50czogdXNlTmF0aXZlQ3VzdG9tRWxlbWVudHNcbn07XG59KClcbn07XG4oZnVuY3Rpb24gKCkge1xudmFyIHVzZXJQb2x5bWVyID0gd2luZG93LlBvbHltZXI7XG53aW5kb3cuUG9seW1lciA9IGZ1bmN0aW9uIChwcm90b3R5cGUpIHtcbnZhciBjdG9yID0gZGVzdWdhcihwcm90b3R5cGUpO1xucHJvdG90eXBlID0gY3Rvci5wcm90b3R5cGU7XG52YXIgb3B0aW9ucyA9IHsgcHJvdG90eXBlOiBwcm90b3R5cGUgfTtcbmlmIChwcm90b3R5cGUuZXh0ZW5kcykge1xub3B0aW9ucy5leHRlbmRzID0gcHJvdG90eXBlLmV4dGVuZHM7XG59XG5Qb2x5bWVyLnRlbGVtZXRyeS5fcmVnaXN0cmF0ZShwcm90b3R5cGUpO1xuZG9jdW1lbnQucmVnaXN0ZXJFbGVtZW50KHByb3RvdHlwZS5pcywgb3B0aW9ucyk7XG5yZXR1cm4gY3Rvcjtcbn07XG52YXIgZGVzdWdhciA9IGZ1bmN0aW9uIChwcm90b3R5cGUpIHtcbnByb3RvdHlwZSA9IFBvbHltZXIuQmFzZS5jaGFpbk9iamVjdChwcm90b3R5cGUsIFBvbHltZXIuQmFzZSk7XG5wcm90b3R5cGUucmVnaXN0ZXJDYWxsYmFjaygpO1xucmV0dXJuIHByb3RvdHlwZS5jb25zdHJ1Y3Rvcjtcbn07XG53aW5kb3cuUG9seW1lciA9IFBvbHltZXI7XG5pZiAodXNlclBvbHltZXIpIHtcbmZvciAodmFyIGkgaW4gdXNlclBvbHltZXIpIHtcblBvbHltZXJbaV0gPSB1c2VyUG9seW1lcltpXTtcbn1cbn1cblBvbHltZXIuQ2xhc3MgPSBkZXN1Z2FyO1xufSgpKTtcblBvbHltZXIudGVsZW1ldHJ5ID0ge1xucmVnaXN0cmF0aW9uczogW10sXG5fcmVnTG9nOiBmdW5jdGlvbiAocHJvdG90eXBlKSB7XG5jb25zb2xlLmxvZygnWycgKyBwcm90b3R5cGUuaXMgKyAnXTogcmVnaXN0ZXJlZCcpO1xufSxcbl9yZWdpc3RyYXRlOiBmdW5jdGlvbiAocHJvdG90eXBlKSB7XG50aGlzLnJlZ2lzdHJhdGlvbnMucHVzaChwcm90b3R5cGUpO1xuUG9seW1lci5sb2cgJiYgdGhpcy5fcmVnTG9nKHByb3RvdHlwZSk7XG59LFxuZHVtcFJlZ2lzdHJhdGlvbnM6IGZ1bmN0aW9uICgpIHtcbnRoaXMucmVnaXN0cmF0aW9ucy5mb3JFYWNoKHRoaXMuX3JlZ0xvZyk7XG59XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdywgJ2N1cnJlbnRJbXBvcnQnLCB7XG5lbnVtZXJhYmxlOiB0cnVlLFxuY29uZmlndXJhYmxlOiB0cnVlLFxuZ2V0OiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gKGRvY3VtZW50Ll9jdXJyZW50U2NyaXB0IHx8IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQpLm93bmVyRG9jdW1lbnQ7XG59XG59KTtcblBvbHltZXIuQmFzZSA9IHtcbl9hZGRGZWF0dXJlOiBmdW5jdGlvbiAoZmVhdHVyZSkge1xudGhpcy5leHRlbmQodGhpcywgZmVhdHVyZSk7XG59LFxucmVnaXN0ZXJDYWxsYmFjazogZnVuY3Rpb24gKCkge1xudGhpcy5fcmVnaXN0ZXJGZWF0dXJlcygpO1xudGhpcy5fZG9CZWhhdmlvcigncmVnaXN0ZXJlZCcpO1xufSxcbmNyZWF0ZWRDYWxsYmFjazogZnVuY3Rpb24gKCkge1xuUG9seW1lci50ZWxlbWV0cnkuaW5zdGFuY2VDb3VudCsrO1xudGhpcy5yb290ID0gdGhpcztcbnRoaXMuX2RvQmVoYXZpb3IoJ2NyZWF0ZWQnKTtcbnRoaXMuX2luaXRGZWF0dXJlcygpO1xufSxcbmF0dGFjaGVkQ2FsbGJhY2s6IGZ1bmN0aW9uICgpIHtcbnRoaXMuaXNBdHRhY2hlZCA9IHRydWU7XG50aGlzLl9kb0JlaGF2aW9yKCdhdHRhY2hlZCcpO1xufSxcbmRldGFjaGVkQ2FsbGJhY2s6IGZ1bmN0aW9uICgpIHtcbnRoaXMuaXNBdHRhY2hlZCA9IGZhbHNlO1xudGhpcy5fZG9CZWhhdmlvcignZGV0YWNoZWQnKTtcbn0sXG5hdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2s6IGZ1bmN0aW9uIChuYW1lKSB7XG50aGlzLl9zZXRBdHRyaWJ1dGVUb1Byb3BlcnR5KHRoaXMsIG5hbWUpO1xudGhpcy5fZG9CZWhhdmlvcignYXR0cmlidXRlQ2hhbmdlZCcsIGFyZ3VtZW50cyk7XG59LFxuZXh0ZW5kOiBmdW5jdGlvbiAocHJvdG90eXBlLCBhcGkpIHtcbmlmIChwcm90b3R5cGUgJiYgYXBpKSB7XG5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhhcGkpLmZvckVhY2goZnVuY3Rpb24gKG4pIHtcbnRoaXMuY29weU93blByb3BlcnR5KG4sIGFwaSwgcHJvdG90eXBlKTtcbn0sIHRoaXMpO1xufVxucmV0dXJuIHByb3RvdHlwZSB8fCBhcGk7XG59LFxubWl4aW46IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuZm9yICh2YXIgaSBpbiBzb3VyY2UpIHtcbnRhcmdldFtpXSA9IHNvdXJjZVtpXTtcbn1cbnJldHVybiB0YXJnZXQ7XG59LFxuY29weU93blByb3BlcnR5OiBmdW5jdGlvbiAobmFtZSwgc291cmNlLCB0YXJnZXQpIHtcbnZhciBwZCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBuYW1lKTtcbmlmIChwZCkge1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgbmFtZSwgcGQpO1xufVxufSxcbl9sb2c6IGNvbnNvbGUubG9nLmFwcGx5LmJpbmQoY29uc29sZS5sb2csIGNvbnNvbGUpLFxuX3dhcm46IGNvbnNvbGUud2Fybi5hcHBseS5iaW5kKGNvbnNvbGUud2FybiwgY29uc29sZSksXG5fZXJyb3I6IGNvbnNvbGUuZXJyb3IuYXBwbHkuYmluZChjb25zb2xlLmVycm9yLCBjb25zb2xlKSxcbl9sb2dmOiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gdGhpcy5fbG9nUHJlZml4LmNvbmNhdChbdGhpcy5pc10pLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApKTtcbn1cbn07XG5Qb2x5bWVyLkJhc2UuX2xvZ1ByZWZpeCA9IGZ1bmN0aW9uICgpIHtcbnZhciBjb2xvciA9IHdpbmRvdy5jaHJvbWUgfHwgL2ZpcmVmb3gvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xucmV0dXJuIGNvbG9yID8gW1xuJyVjWyVzOjolc106Jyxcbidmb250LXdlaWdodDogYm9sZDsgYmFja2dyb3VuZC1jb2xvcjojRUVFRTAwOydcbl0gOiBbJ1slczo6JXNdOiddO1xufSgpO1xuUG9seW1lci5CYXNlLmNoYWluT2JqZWN0ID0gZnVuY3Rpb24gKG9iamVjdCwgaW5oZXJpdGVkKSB7XG5pZiAob2JqZWN0ICYmIGluaGVyaXRlZCAmJiBvYmplY3QgIT09IGluaGVyaXRlZCkge1xuaWYgKCFPYmplY3QuX19wcm90b19fKSB7XG5vYmplY3QgPSBQb2x5bWVyLkJhc2UuZXh0ZW5kKE9iamVjdC5jcmVhdGUoaW5oZXJpdGVkKSwgb2JqZWN0KTtcbn1cbm9iamVjdC5fX3Byb3RvX18gPSBpbmhlcml0ZWQ7XG59XG5yZXR1cm4gb2JqZWN0O1xufTtcblBvbHltZXIuQmFzZSA9IFBvbHltZXIuQmFzZS5jaGFpbk9iamVjdChQb2x5bWVyLkJhc2UsIEhUTUxFbGVtZW50LnByb3RvdHlwZSk7XG5Qb2x5bWVyLnRlbGVtZXRyeS5pbnN0YW5jZUNvdW50ID0gMDtcbihmdW5jdGlvbiAoKSB7XG52YXIgbW9kdWxlcyA9IHt9O1xudmFyIERvbU1vZHVsZSA9IGZ1bmN0aW9uICgpIHtcbnJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkb20tbW9kdWxlJyk7XG59O1xuRG9tTW9kdWxlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSFRNTEVsZW1lbnQucHJvdG90eXBlKTtcbkRvbU1vZHVsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBEb21Nb2R1bGU7XG5Eb21Nb2R1bGUucHJvdG90eXBlLmNyZWF0ZWRDYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcbnZhciBpZCA9IHRoaXMuaWQgfHwgdGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSB8fCB0aGlzLmdldEF0dHJpYnV0ZSgnaXMnKTtcbmlmIChpZCkge1xudGhpcy5pZCA9IGlkO1xubW9kdWxlc1tpZF0gPSB0aGlzO1xufVxufTtcbkRvbU1vZHVsZS5wcm90b3R5cGUuaW1wb3J0ID0gZnVuY3Rpb24gKGlkLCBzbGN0cikge1xudmFyIG0gPSBtb2R1bGVzW2lkXTtcbmlmICghbSkge1xuZm9yY2VEb2N1bWVudFVwZ3JhZGUoKTtcbm0gPSBtb2R1bGVzW2lkXTtcbn1cbmlmIChtICYmIHNsY3RyKSB7XG5tID0gbS5xdWVyeVNlbGVjdG9yKHNsY3RyKTtcbn1cbnJldHVybiBtO1xufTtcbnZhciBjZVBvbHlmaWxsID0gd2luZG93LkN1c3RvbUVsZW1lbnRzICYmICFDdXN0b21FbGVtZW50cy51c2VOYXRpdmU7XG5pZiAoY2VQb2x5ZmlsbCkge1xudmFyIHJlYWR5ID0gQ3VzdG9tRWxlbWVudHMucmVhZHk7XG5DdXN0b21FbGVtZW50cy5yZWFkeSA9IHRydWU7XG59XG5kb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoJ2RvbS1tb2R1bGUnLCBEb21Nb2R1bGUpO1xuaWYgKGNlUG9seWZpbGwpIHtcbkN1c3RvbUVsZW1lbnRzLnJlYWR5ID0gcmVhZHk7XG59XG5mdW5jdGlvbiBmb3JjZURvY3VtZW50VXBncmFkZSgpIHtcbmlmIChjZVBvbHlmaWxsKSB7XG52YXIgc2NyaXB0ID0gZG9jdW1lbnQuX2N1cnJlbnRTY3JpcHQgfHwgZG9jdW1lbnQuY3VycmVudFNjcmlwdDtcbmlmIChzY3JpcHQpIHtcbkN1c3RvbUVsZW1lbnRzLnVwZ3JhZGVBbGwoc2NyaXB0Lm93bmVyRG9jdW1lbnQpO1xufVxufVxufVxufSgpKTtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5fcHJlcElzOiBmdW5jdGlvbiAoKSB7XG5pZiAoIXRoaXMuaXMpIHtcbnZhciBtb2R1bGUgPSAoZG9jdW1lbnQuX2N1cnJlbnRTY3JpcHQgfHwgZG9jdW1lbnQuY3VycmVudFNjcmlwdCkucGFyZW50Tm9kZTtcbmlmIChtb2R1bGUubG9jYWxOYW1lID09PSAnZG9tLW1vZHVsZScpIHtcbnZhciBpZCA9IG1vZHVsZS5pZCB8fCBtb2R1bGUuZ2V0QXR0cmlidXRlKCduYW1lJykgfHwgbW9kdWxlLmdldEF0dHJpYnV0ZSgnaXMnKTtcbnRoaXMuaXMgPSBpZDtcbn1cbn1cbn1cbn0pO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbmJlaGF2aW9yczogW10sXG5fcHJlcEJlaGF2aW9yczogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuYmVoYXZpb3JzLmxlbmd0aCkge1xudGhpcy5iZWhhdmlvcnMgPSB0aGlzLl9mbGF0dGVuQmVoYXZpb3JzTGlzdCh0aGlzLmJlaGF2aW9ycyk7XG59XG50aGlzLl9wcmVwQWxsQmVoYXZpb3JzKHRoaXMuYmVoYXZpb3JzKTtcbn0sXG5fZmxhdHRlbkJlaGF2aW9yc0xpc3Q6IGZ1bmN0aW9uIChiZWhhdmlvcnMpIHtcbnZhciBmbGF0ID0gW107XG5iZWhhdmlvcnMuZm9yRWFjaChmdW5jdGlvbiAoYikge1xuaWYgKGIgaW5zdGFuY2VvZiBBcnJheSkge1xuZmxhdCA9IGZsYXQuY29uY2F0KHRoaXMuX2ZsYXR0ZW5CZWhhdmlvcnNMaXN0KGIpKTtcbn0gZWxzZSBpZiAoYikge1xuZmxhdC5wdXNoKGIpO1xufSBlbHNlIHtcbnRoaXMuX3dhcm4odGhpcy5fbG9nZignX2ZsYXR0ZW5CZWhhdmlvcnNMaXN0JywgJ2JlaGF2aW9yIGlzIG51bGwsIGNoZWNrIGZvciBtaXNzaW5nIG9yIDQwNCBpbXBvcnQnKSk7XG59XG59LCB0aGlzKTtcbnJldHVybiBmbGF0O1xufSxcbl9wcmVwQWxsQmVoYXZpb3JzOiBmdW5jdGlvbiAoYmVoYXZpb3JzKSB7XG5mb3IgKHZhciBpID0gYmVoYXZpb3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG50aGlzLl9taXhpbkJlaGF2aW9yKGJlaGF2aW9yc1tpXSk7XG59XG5mb3IgKHZhciBpID0gMCwgbCA9IGJlaGF2aW9ycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbnRoaXMuX3ByZXBCZWhhdmlvcihiZWhhdmlvcnNbaV0pO1xufVxudGhpcy5fcHJlcEJlaGF2aW9yKHRoaXMpO1xufSxcbl9taXhpbkJlaGF2aW9yOiBmdW5jdGlvbiAoYikge1xuT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYikuZm9yRWFjaChmdW5jdGlvbiAobikge1xuc3dpdGNoIChuKSB7XG5jYXNlICdob3N0QXR0cmlidXRlcyc6XG5jYXNlICdyZWdpc3RlcmVkJzpcbmNhc2UgJ3Byb3BlcnRpZXMnOlxuY2FzZSAnb2JzZXJ2ZXJzJzpcbmNhc2UgJ2xpc3RlbmVycyc6XG5jYXNlICdjcmVhdGVkJzpcbmNhc2UgJ2F0dGFjaGVkJzpcbmNhc2UgJ2RldGFjaGVkJzpcbmNhc2UgJ2F0dHJpYnV0ZUNoYW5nZWQnOlxuY2FzZSAnY29uZmlndXJlJzpcbmNhc2UgJ3JlYWR5JzpcbmJyZWFrO1xuZGVmYXVsdDpcbmlmICghdGhpcy5oYXNPd25Qcm9wZXJ0eShuKSkge1xudGhpcy5jb3B5T3duUHJvcGVydHkobiwgYiwgdGhpcyk7XG59XG5icmVhaztcbn1cbn0sIHRoaXMpO1xufSxcbl9kb0JlaGF2aW9yOiBmdW5jdGlvbiAobmFtZSwgYXJncykge1xudGhpcy5iZWhhdmlvcnMuZm9yRWFjaChmdW5jdGlvbiAoYikge1xudGhpcy5faW52b2tlQmVoYXZpb3IoYiwgbmFtZSwgYXJncyk7XG59LCB0aGlzKTtcbnRoaXMuX2ludm9rZUJlaGF2aW9yKHRoaXMsIG5hbWUsIGFyZ3MpO1xufSxcbl9pbnZva2VCZWhhdmlvcjogZnVuY3Rpb24gKGIsIG5hbWUsIGFyZ3MpIHtcbnZhciBmbiA9IGJbbmFtZV07XG5pZiAoZm4pIHtcbmZuLmFwcGx5KHRoaXMsIGFyZ3MgfHwgUG9seW1lci5uYXIpO1xufVxufSxcbl9tYXJzaGFsQmVoYXZpb3JzOiBmdW5jdGlvbiAoKSB7XG50aGlzLmJlaGF2aW9ycy5mb3JFYWNoKGZ1bmN0aW9uIChiKSB7XG50aGlzLl9tYXJzaGFsQmVoYXZpb3IoYik7XG59LCB0aGlzKTtcbnRoaXMuX21hcnNoYWxCZWhhdmlvcih0aGlzKTtcbn1cbn0pO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9wcmVwRXh0ZW5kczogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuZXh0ZW5kcykge1xudGhpcy5fX3Byb3RvX18gPSB0aGlzLl9nZXRFeHRlbmRlZFByb3RvdHlwZSh0aGlzLmV4dGVuZHMpO1xufVxufSxcbl9nZXRFeHRlbmRlZFByb3RvdHlwZTogZnVuY3Rpb24gKHRhZykge1xucmV0dXJuIHRoaXMuX2dldEV4dGVuZGVkTmF0aXZlUHJvdG90eXBlKHRhZyk7XG59LFxuX25hdGl2ZVByb3RvdHlwZXM6IHt9LFxuX2dldEV4dGVuZGVkTmF0aXZlUHJvdG90eXBlOiBmdW5jdGlvbiAodGFnKSB7XG52YXIgcCA9IHRoaXMuX25hdGl2ZVByb3RvdHlwZXNbdGFnXTtcbmlmICghcCkge1xudmFyIG5wID0gdGhpcy5nZXROYXRpdmVQcm90b3R5cGUodGFnKTtcbnAgPSB0aGlzLmV4dGVuZChPYmplY3QuY3JlYXRlKG5wKSwgUG9seW1lci5CYXNlKTtcbnRoaXMuX25hdGl2ZVByb3RvdHlwZXNbdGFnXSA9IHA7XG59XG5yZXR1cm4gcDtcbn0sXG5nZXROYXRpdmVQcm90b3R5cGU6IGZ1bmN0aW9uICh0YWcpIHtcbnJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpKTtcbn1cbn0pO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9wcmVwQ29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX2ZhY3RvcnlBcmdzID0gdGhpcy5leHRlbmRzID8gW1xudGhpcy5leHRlbmRzLFxudGhpcy5pc1xuXSA6IFt0aGlzLmlzXTtcbnZhciBjdG9yID0gZnVuY3Rpb24gKCkge1xucmV0dXJuIHRoaXMuX2ZhY3RvcnkoYXJndW1lbnRzKTtcbn07XG5pZiAodGhpcy5oYXNPd25Qcm9wZXJ0eSgnZXh0ZW5kcycpKSB7XG5jdG9yLmV4dGVuZHMgPSB0aGlzLmV4dGVuZHM7XG59XG5PYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NvbnN0cnVjdG9yJywge1xudmFsdWU6IGN0b3IsXG53cml0YWJsZTogdHJ1ZSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5jdG9yLnByb3RvdHlwZSA9IHRoaXM7XG59LFxuX2ZhY3Rvcnk6IGZ1bmN0aW9uIChhcmdzKSB7XG52YXIgZWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudC5hcHBseShkb2N1bWVudCwgdGhpcy5fZmFjdG9yeUFyZ3MpO1xuaWYgKHRoaXMuZmFjdG9yeUltcGwpIHtcbnRoaXMuZmFjdG9yeUltcGwuYXBwbHkoZWx0LCBhcmdzKTtcbn1cbnJldHVybiBlbHQ7XG59XG59KTtcblBvbHltZXIubm9iID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5wcm9wZXJ0aWVzOiB7fSxcbmdldFByb3BlcnR5SW5mbzogZnVuY3Rpb24gKHByb3BlcnR5KSB7XG52YXIgaW5mbyA9IHRoaXMuX2dldFByb3BlcnR5SW5mbyhwcm9wZXJ0eSwgdGhpcy5wcm9wZXJ0aWVzKTtcbmlmICghaW5mbykge1xudGhpcy5iZWhhdmlvcnMuc29tZShmdW5jdGlvbiAoYikge1xucmV0dXJuIGluZm8gPSB0aGlzLl9nZXRQcm9wZXJ0eUluZm8ocHJvcGVydHksIGIucHJvcGVydGllcyk7XG59LCB0aGlzKTtcbn1cbnJldHVybiBpbmZvIHx8IFBvbHltZXIubm9iO1xufSxcbl9nZXRQcm9wZXJ0eUluZm86IGZ1bmN0aW9uIChwcm9wZXJ0eSwgcHJvcGVydGllcykge1xudmFyIHAgPSBwcm9wZXJ0aWVzICYmIHByb3BlcnRpZXNbcHJvcGVydHldO1xuaWYgKHR5cGVvZiBwID09PSAnZnVuY3Rpb24nKSB7XG5wID0gcHJvcGVydGllc1twcm9wZXJ0eV0gPSB7IHR5cGU6IHAgfTtcbn1cbmlmIChwKSB7XG5wLmRlZmluZWQgPSB0cnVlO1xufVxucmV0dXJuIHA7XG59XG59KTtcblBvbHltZXIuQ2FzZU1hcCA9IHtcbl9jYXNlTWFwOiB7fSxcbmRhc2hUb0NhbWVsQ2FzZTogZnVuY3Rpb24gKGRhc2gpIHtcbnZhciBtYXBwZWQgPSBQb2x5bWVyLkNhc2VNYXAuX2Nhc2VNYXBbZGFzaF07XG5pZiAobWFwcGVkKSB7XG5yZXR1cm4gbWFwcGVkO1xufVxuaWYgKGRhc2guaW5kZXhPZignLScpIDwgMCkge1xucmV0dXJuIFBvbHltZXIuQ2FzZU1hcC5fY2FzZU1hcFtkYXNoXSA9IGRhc2g7XG59XG5yZXR1cm4gUG9seW1lci5DYXNlTWFwLl9jYXNlTWFwW2Rhc2hdID0gZGFzaC5yZXBsYWNlKC8tKFthLXpdKS9nLCBmdW5jdGlvbiAobSkge1xucmV0dXJuIG1bMV0udG9VcHBlckNhc2UoKTtcbn0pO1xufSxcbmNhbWVsVG9EYXNoQ2FzZTogZnVuY3Rpb24gKGNhbWVsKSB7XG52YXIgbWFwcGVkID0gUG9seW1lci5DYXNlTWFwLl9jYXNlTWFwW2NhbWVsXTtcbmlmIChtYXBwZWQpIHtcbnJldHVybiBtYXBwZWQ7XG59XG5yZXR1cm4gUG9seW1lci5DYXNlTWFwLl9jYXNlTWFwW2NhbWVsXSA9IGNhbWVsLnJlcGxhY2UoLyhbYS16XVtBLVpdKS9nLCBmdW5jdGlvbiAoZykge1xucmV0dXJuIGdbMF0gKyAnLScgKyBnWzFdLnRvTG93ZXJDYXNlKCk7XG59KTtcbn1cbn07XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX3ByZXBBdHRyaWJ1dGVzOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9hZ2dyZWdhdGVkQXR0cmlidXRlcyA9IHt9O1xufSxcbl9hZGRIb3N0QXR0cmlidXRlczogZnVuY3Rpb24gKGF0dHJpYnV0ZXMpIHtcbmlmIChhdHRyaWJ1dGVzKSB7XG50aGlzLm1peGluKHRoaXMuX2FnZ3JlZ2F0ZWRBdHRyaWJ1dGVzLCBhdHRyaWJ1dGVzKTtcbn1cbn0sXG5fbWFyc2hhbEhvc3RBdHRyaWJ1dGVzOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9hcHBseUF0dHJpYnV0ZXModGhpcywgdGhpcy5fYWdncmVnYXRlZEF0dHJpYnV0ZXMpO1xufSxcbl9hcHBseUF0dHJpYnV0ZXM6IGZ1bmN0aW9uIChub2RlLCBhdHRyJCkge1xuZm9yICh2YXIgbiBpbiBhdHRyJCkge1xuaWYgKCF0aGlzLmhhc0F0dHJpYnV0ZShuKSAmJiBuICE9PSAnY2xhc3MnKSB7XG50aGlzLnNlcmlhbGl6ZVZhbHVlVG9BdHRyaWJ1dGUoYXR0ciRbbl0sIG4sIHRoaXMpO1xufVxufVxufSxcbl9tYXJzaGFsQXR0cmlidXRlczogZnVuY3Rpb24gKCkge1xudGhpcy5fdGFrZUF0dHJpYnV0ZXNUb01vZGVsKHRoaXMpO1xufSxcbl90YWtlQXR0cmlidXRlc1RvTW9kZWw6IGZ1bmN0aW9uIChtb2RlbCkge1xuZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmF0dHJpYnV0ZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG50aGlzLl9zZXRBdHRyaWJ1dGVUb1Byb3BlcnR5KG1vZGVsLCB0aGlzLmF0dHJpYnV0ZXNbaV0ubmFtZSk7XG59XG59LFxuX3NldEF0dHJpYnV0ZVRvUHJvcGVydHk6IGZ1bmN0aW9uIChtb2RlbCwgYXR0ck5hbWUpIHtcbmlmICghdGhpcy5fc2VyaWFsaXppbmcpIHtcbnZhciBwcm9wTmFtZSA9IFBvbHltZXIuQ2FzZU1hcC5kYXNoVG9DYW1lbENhc2UoYXR0ck5hbWUpO1xudmFyIGluZm8gPSB0aGlzLmdldFByb3BlcnR5SW5mbyhwcm9wTmFtZSk7XG5pZiAoaW5mby5kZWZpbmVkIHx8IHRoaXMuX3Byb3BlcnR5RWZmZWN0cyAmJiB0aGlzLl9wcm9wZXJ0eUVmZmVjdHNbcHJvcE5hbWVdKSB7XG52YXIgdmFsID0gdGhpcy5nZXRBdHRyaWJ1dGUoYXR0ck5hbWUpO1xubW9kZWxbcHJvcE5hbWVdID0gdGhpcy5kZXNlcmlhbGl6ZSh2YWwsIGluZm8udHlwZSk7XG59XG59XG59LFxuX3NlcmlhbGl6aW5nOiBmYWxzZSxcbnJlZmxlY3RQcm9wZXJ0eVRvQXR0cmlidXRlOiBmdW5jdGlvbiAobmFtZSkge1xudGhpcy5fc2VyaWFsaXppbmcgPSB0cnVlO1xudGhpcy5zZXJpYWxpemVWYWx1ZVRvQXR0cmlidXRlKHRoaXNbbmFtZV0sIFBvbHltZXIuQ2FzZU1hcC5jYW1lbFRvRGFzaENhc2UobmFtZSkpO1xudGhpcy5fc2VyaWFsaXppbmcgPSBmYWxzZTtcbn0sXG5zZXJpYWxpemVWYWx1ZVRvQXR0cmlidXRlOiBmdW5jdGlvbiAodmFsdWUsIGF0dHJpYnV0ZSwgbm9kZSkge1xudmFyIHN0ciA9IHRoaXMuc2VyaWFsaXplKHZhbHVlKTtcbihub2RlIHx8IHRoaXMpW3N0ciA9PT0gdW5kZWZpbmVkID8gJ3JlbW92ZUF0dHJpYnV0ZScgOiAnc2V0QXR0cmlidXRlJ10oYXR0cmlidXRlLCBzdHIpO1xufSxcbmRlc2VyaWFsaXplOiBmdW5jdGlvbiAodmFsdWUsIHR5cGUpIHtcbnN3aXRjaCAodHlwZSkge1xuY2FzZSBOdW1iZXI6XG52YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG5icmVhaztcbmNhc2UgQm9vbGVhbjpcbnZhbHVlID0gdmFsdWUgIT09IG51bGw7XG5icmVhaztcbmNhc2UgT2JqZWN0OlxudHJ5IHtcbnZhbHVlID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG59IGNhdGNoICh4KSB7XG59XG5icmVhaztcbmNhc2UgQXJyYXk6XG50cnkge1xudmFsdWUgPSBKU09OLnBhcnNlKHZhbHVlKTtcbn0gY2F0Y2ggKHgpIHtcbnZhbHVlID0gbnVsbDtcbmNvbnNvbGUud2FybignUG9seW1lcjo6QXR0cmlidXRlczogY291bGRuYHQgZGVjb2RlIEFycmF5IGFzIEpTT04nKTtcbn1cbmJyZWFrO1xuY2FzZSBEYXRlOlxudmFsdWUgPSBuZXcgRGF0ZSh2YWx1ZSk7XG5icmVhaztcbmNhc2UgU3RyaW5nOlxuZGVmYXVsdDpcbmJyZWFrO1xufVxucmV0dXJuIHZhbHVlO1xufSxcbnNlcmlhbGl6ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG5zd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuY2FzZSAnYm9vbGVhbic6XG5yZXR1cm4gdmFsdWUgPyAnJyA6IHVuZGVmaW5lZDtcbmNhc2UgJ29iamVjdCc6XG5pZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG5yZXR1cm4gdmFsdWU7XG59IGVsc2UgaWYgKHZhbHVlKSB7XG50cnkge1xucmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbn0gY2F0Y2ggKHgpIHtcbnJldHVybiAnJztcbn1cbn1cbmRlZmF1bHQ6XG5yZXR1cm4gdmFsdWUgIT0gbnVsbCA/IHZhbHVlIDogdW5kZWZpbmVkO1xufVxufVxufSk7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX3NldHVwRGVib3VuY2VyczogZnVuY3Rpb24gKCkge1xudGhpcy5fZGVib3VuY2VycyA9IHt9O1xufSxcbmRlYm91bmNlOiBmdW5jdGlvbiAoam9iTmFtZSwgY2FsbGJhY2ssIHdhaXQpIHtcbnRoaXMuX2RlYm91bmNlcnNbam9iTmFtZV0gPSBQb2x5bWVyLkRlYm91bmNlLmNhbGwodGhpcywgdGhpcy5fZGVib3VuY2Vyc1tqb2JOYW1lXSwgY2FsbGJhY2ssIHdhaXQpO1xufSxcbmlzRGVib3VuY2VyQWN0aXZlOiBmdW5jdGlvbiAoam9iTmFtZSkge1xudmFyIGRlYm91bmNlciA9IHRoaXMuX2RlYm91bmNlcnNbam9iTmFtZV07XG5yZXR1cm4gZGVib3VuY2VyICYmIGRlYm91bmNlci5maW5pc2g7XG59LFxuZmx1c2hEZWJvdW5jZXI6IGZ1bmN0aW9uIChqb2JOYW1lKSB7XG52YXIgZGVib3VuY2VyID0gdGhpcy5fZGVib3VuY2Vyc1tqb2JOYW1lXTtcbmlmIChkZWJvdW5jZXIpIHtcbmRlYm91bmNlci5jb21wbGV0ZSgpO1xufVxufSxcbmNhbmNlbERlYm91bmNlcjogZnVuY3Rpb24gKGpvYk5hbWUpIHtcbnZhciBkZWJvdW5jZXIgPSB0aGlzLl9kZWJvdW5jZXJzW2pvYk5hbWVdO1xuaWYgKGRlYm91bmNlcikge1xuZGVib3VuY2VyLnN0b3AoKTtcbn1cbn1cbn0pO1xuUG9seW1lci52ZXJzaW9uID0gJzEuMC42JztcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5fcmVnaXN0ZXJGZWF0dXJlczogZnVuY3Rpb24gKCkge1xudGhpcy5fcHJlcElzKCk7XG50aGlzLl9wcmVwQXR0cmlidXRlcygpO1xudGhpcy5fcHJlcEJlaGF2aW9ycygpO1xudGhpcy5fcHJlcEV4dGVuZHMoKTtcbnRoaXMuX3ByZXBDb25zdHJ1Y3RvcigpO1xufSxcbl9wcmVwQmVoYXZpb3I6IGZ1bmN0aW9uIChiKSB7XG50aGlzLl9hZGRIb3N0QXR0cmlidXRlcyhiLmhvc3RBdHRyaWJ1dGVzKTtcbn0sXG5fbWFyc2hhbEJlaGF2aW9yOiBmdW5jdGlvbiAoYikge1xufSxcbl9pbml0RmVhdHVyZXM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX21hcnNoYWxIb3N0QXR0cmlidXRlcygpO1xudGhpcy5fc2V0dXBEZWJvdW5jZXJzKCk7XG50aGlzLl9tYXJzaGFsQmVoYXZpb3JzKCk7XG59XG59KTtcbn0pKCk7XG5cbn0pIiwicmVxdWlyZShcIi4vcG9seW1lci1taWNyby5odG1sXCIpO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixmdW5jdGlvbigpIHtcbjsoZnVuY3Rpb24oKSB7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX3ByZXBUZW1wbGF0ZTogZnVuY3Rpb24gKCkge1xudGhpcy5fdGVtcGxhdGUgPSB0aGlzLl90ZW1wbGF0ZSB8fCBQb2x5bWVyLkRvbU1vZHVsZS5pbXBvcnQodGhpcy5pcywgJ3RlbXBsYXRlJyk7XG5pZiAodGhpcy5fdGVtcGxhdGUgJiYgdGhpcy5fdGVtcGxhdGUuaGFzQXR0cmlidXRlKCdpcycpKSB7XG50aGlzLl93YXJuKHRoaXMuX2xvZ2YoJ19wcmVwVGVtcGxhdGUnLCAndG9wLWxldmVsIFBvbHltZXIgdGVtcGxhdGUgJyArICdtdXN0IG5vdCBiZSBhIHR5cGUtZXh0ZW5zaW9uLCBmb3VuZCcsIHRoaXMuX3RlbXBsYXRlLCAnTW92ZSBpbnNpZGUgc2ltcGxlIDx0ZW1wbGF0ZT4uJykpO1xufVxufSxcbl9zdGFtcFRlbXBsYXRlOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5fdGVtcGxhdGUpIHtcbnRoaXMucm9vdCA9IHRoaXMuaW5zdGFuY2VUZW1wbGF0ZSh0aGlzLl90ZW1wbGF0ZSk7XG59XG59LFxuaW5zdGFuY2VUZW1wbGF0ZTogZnVuY3Rpb24gKHRlbXBsYXRlKSB7XG52YXIgZG9tID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5fY29udGVudCB8fCB0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbnJldHVybiBkb207XG59XG59KTtcbihmdW5jdGlvbiAoKSB7XG52YXIgYmFzZUF0dGFjaGVkQ2FsbGJhY2sgPSBQb2x5bWVyLkJhc2UuYXR0YWNoZWRDYWxsYmFjaztcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5faG9zdFN0YWNrOiBbXSxcbnJlYWR5OiBmdW5jdGlvbiAoKSB7XG59LFxuX3B1c2hIb3N0OiBmdW5jdGlvbiAoaG9zdCkge1xudGhpcy5kYXRhSG9zdCA9IGhvc3QgPSBob3N0IHx8IFBvbHltZXIuQmFzZS5faG9zdFN0YWNrW1BvbHltZXIuQmFzZS5faG9zdFN0YWNrLmxlbmd0aCAtIDFdO1xuaWYgKGhvc3QgJiYgaG9zdC5fY2xpZW50cykge1xuaG9zdC5fY2xpZW50cy5wdXNoKHRoaXMpO1xufVxudGhpcy5fYmVnaW5Ib3N0KCk7XG59LFxuX2JlZ2luSG9zdDogZnVuY3Rpb24gKCkge1xuUG9seW1lci5CYXNlLl9ob3N0U3RhY2sucHVzaCh0aGlzKTtcbmlmICghdGhpcy5fY2xpZW50cykge1xudGhpcy5fY2xpZW50cyA9IFtdO1xufVxufSxcbl9wb3BIb3N0OiBmdW5jdGlvbiAoKSB7XG5Qb2x5bWVyLkJhc2UuX2hvc3RTdGFjay5wb3AoKTtcbn0sXG5fdHJ5UmVhZHk6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLl9jYW5SZWFkeSgpKSB7XG50aGlzLl9yZWFkeSgpO1xufVxufSxcbl9jYW5SZWFkeTogZnVuY3Rpb24gKCkge1xucmV0dXJuICF0aGlzLmRhdGFIb3N0IHx8IHRoaXMuZGF0YUhvc3QuX2NsaWVudHNSZWFkaWVkO1xufSxcbl9yZWFkeTogZnVuY3Rpb24gKCkge1xudGhpcy5fYmVmb3JlQ2xpZW50c1JlYWR5KCk7XG50aGlzLl9zZXR1cFJvb3QoKTtcbnRoaXMuX3JlYWR5Q2xpZW50cygpO1xudGhpcy5fYWZ0ZXJDbGllbnRzUmVhZHkoKTtcbnRoaXMuX3JlYWR5U2VsZigpO1xufSxcbl9yZWFkeUNsaWVudHM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX2JlZ2luRGlzdHJpYnV0ZSgpO1xudmFyIGMkID0gdGhpcy5fY2xpZW50cztcbmZvciAodmFyIGkgPSAwLCBsID0gYyQubGVuZ3RoLCBjOyBpIDwgbCAmJiAoYyA9IGMkW2ldKTsgaSsrKSB7XG5jLl9yZWFkeSgpO1xufVxudGhpcy5fZmluaXNoRGlzdHJpYnV0ZSgpO1xudGhpcy5fY2xpZW50c1JlYWRpZWQgPSB0cnVlO1xudGhpcy5fY2xpZW50cyA9IG51bGw7XG59LFxuX3JlYWR5U2VsZjogZnVuY3Rpb24gKCkge1xudGhpcy5fZG9CZWhhdmlvcigncmVhZHknKTtcbnRoaXMuX3JlYWRpZWQgPSB0cnVlO1xuaWYgKHRoaXMuX2F0dGFjaGVkUGVuZGluZykge1xudGhpcy5fYXR0YWNoZWRQZW5kaW5nID0gZmFsc2U7XG50aGlzLmF0dGFjaGVkQ2FsbGJhY2soKTtcbn1cbn0sXG5fYmVmb3JlQ2xpZW50c1JlYWR5OiBmdW5jdGlvbiAoKSB7XG59LFxuX2FmdGVyQ2xpZW50c1JlYWR5OiBmdW5jdGlvbiAoKSB7XG59LFxuX2JlZm9yZUF0dGFjaGVkOiBmdW5jdGlvbiAoKSB7XG59LFxuYXR0YWNoZWRDYWxsYmFjazogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuX3JlYWRpZWQpIHtcbnRoaXMuX2JlZm9yZUF0dGFjaGVkKCk7XG5iYXNlQXR0YWNoZWRDYWxsYmFjay5jYWxsKHRoaXMpO1xufSBlbHNlIHtcbnRoaXMuX2F0dGFjaGVkUGVuZGluZyA9IHRydWU7XG59XG59XG59KTtcbn0oKSk7XG5Qb2x5bWVyLkFycmF5U3BsaWNlID0gZnVuY3Rpb24gKCkge1xuZnVuY3Rpb24gbmV3U3BsaWNlKGluZGV4LCByZW1vdmVkLCBhZGRlZENvdW50KSB7XG5yZXR1cm4ge1xuaW5kZXg6IGluZGV4LFxucmVtb3ZlZDogcmVtb3ZlZCxcbmFkZGVkQ291bnQ6IGFkZGVkQ291bnRcbn07XG59XG52YXIgRURJVF9MRUFWRSA9IDA7XG52YXIgRURJVF9VUERBVEUgPSAxO1xudmFyIEVESVRfQUREID0gMjtcbnZhciBFRElUX0RFTEVURSA9IDM7XG5mdW5jdGlvbiBBcnJheVNwbGljZSgpIHtcbn1cbkFycmF5U3BsaWNlLnByb3RvdHlwZSA9IHtcbmNhbGNFZGl0RGlzdGFuY2VzOiBmdW5jdGlvbiAoY3VycmVudCwgY3VycmVudFN0YXJ0LCBjdXJyZW50RW5kLCBvbGQsIG9sZFN0YXJ0LCBvbGRFbmQpIHtcbnZhciByb3dDb3VudCA9IG9sZEVuZCAtIG9sZFN0YXJ0ICsgMTtcbnZhciBjb2x1bW5Db3VudCA9IGN1cnJlbnRFbmQgLSBjdXJyZW50U3RhcnQgKyAxO1xudmFyIGRpc3RhbmNlcyA9IG5ldyBBcnJheShyb3dDb3VudCk7XG5mb3IgKHZhciBpID0gMDsgaSA8IHJvd0NvdW50OyBpKyspIHtcbmRpc3RhbmNlc1tpXSA9IG5ldyBBcnJheShjb2x1bW5Db3VudCk7XG5kaXN0YW5jZXNbaV1bMF0gPSBpO1xufVxuZm9yICh2YXIgaiA9IDA7IGogPCBjb2x1bW5Db3VudDsgaisrKVxuZGlzdGFuY2VzWzBdW2pdID0gajtcbmZvciAodmFyIGkgPSAxOyBpIDwgcm93Q291bnQ7IGkrKykge1xuZm9yICh2YXIgaiA9IDE7IGogPCBjb2x1bW5Db3VudDsgaisrKSB7XG5pZiAodGhpcy5lcXVhbHMoY3VycmVudFtjdXJyZW50U3RhcnQgKyBqIC0gMV0sIG9sZFtvbGRTdGFydCArIGkgLSAxXSkpXG5kaXN0YW5jZXNbaV1bal0gPSBkaXN0YW5jZXNbaSAtIDFdW2ogLSAxXTtcbmVsc2Uge1xudmFyIG5vcnRoID0gZGlzdGFuY2VzW2kgLSAxXVtqXSArIDE7XG52YXIgd2VzdCA9IGRpc3RhbmNlc1tpXVtqIC0gMV0gKyAxO1xuZGlzdGFuY2VzW2ldW2pdID0gbm9ydGggPCB3ZXN0ID8gbm9ydGggOiB3ZXN0O1xufVxufVxufVxucmV0dXJuIGRpc3RhbmNlcztcbn0sXG5zcGxpY2VPcGVyYXRpb25zRnJvbUVkaXREaXN0YW5jZXM6IGZ1bmN0aW9uIChkaXN0YW5jZXMpIHtcbnZhciBpID0gZGlzdGFuY2VzLmxlbmd0aCAtIDE7XG52YXIgaiA9IGRpc3RhbmNlc1swXS5sZW5ndGggLSAxO1xudmFyIGN1cnJlbnQgPSBkaXN0YW5jZXNbaV1bal07XG52YXIgZWRpdHMgPSBbXTtcbndoaWxlIChpID4gMCB8fCBqID4gMCkge1xuaWYgKGkgPT0gMCkge1xuZWRpdHMucHVzaChFRElUX0FERCk7XG5qLS07XG5jb250aW51ZTtcbn1cbmlmIChqID09IDApIHtcbmVkaXRzLnB1c2goRURJVF9ERUxFVEUpO1xuaS0tO1xuY29udGludWU7XG59XG52YXIgbm9ydGhXZXN0ID0gZGlzdGFuY2VzW2kgLSAxXVtqIC0gMV07XG52YXIgd2VzdCA9IGRpc3RhbmNlc1tpIC0gMV1bal07XG52YXIgbm9ydGggPSBkaXN0YW5jZXNbaV1baiAtIDFdO1xudmFyIG1pbjtcbmlmICh3ZXN0IDwgbm9ydGgpXG5taW4gPSB3ZXN0IDwgbm9ydGhXZXN0ID8gd2VzdCA6IG5vcnRoV2VzdDtcbmVsc2Vcbm1pbiA9IG5vcnRoIDwgbm9ydGhXZXN0ID8gbm9ydGggOiBub3J0aFdlc3Q7XG5pZiAobWluID09IG5vcnRoV2VzdCkge1xuaWYgKG5vcnRoV2VzdCA9PSBjdXJyZW50KSB7XG5lZGl0cy5wdXNoKEVESVRfTEVBVkUpO1xufSBlbHNlIHtcbmVkaXRzLnB1c2goRURJVF9VUERBVEUpO1xuY3VycmVudCA9IG5vcnRoV2VzdDtcbn1cbmktLTtcbmotLTtcbn0gZWxzZSBpZiAobWluID09IHdlc3QpIHtcbmVkaXRzLnB1c2goRURJVF9ERUxFVEUpO1xuaS0tO1xuY3VycmVudCA9IHdlc3Q7XG59IGVsc2Uge1xuZWRpdHMucHVzaChFRElUX0FERCk7XG5qLS07XG5jdXJyZW50ID0gbm9ydGg7XG59XG59XG5lZGl0cy5yZXZlcnNlKCk7XG5yZXR1cm4gZWRpdHM7XG59LFxuY2FsY1NwbGljZXM6IGZ1bmN0aW9uIChjdXJyZW50LCBjdXJyZW50U3RhcnQsIGN1cnJlbnRFbmQsIG9sZCwgb2xkU3RhcnQsIG9sZEVuZCkge1xudmFyIHByZWZpeENvdW50ID0gMDtcbnZhciBzdWZmaXhDb3VudCA9IDA7XG52YXIgbWluTGVuZ3RoID0gTWF0aC5taW4oY3VycmVudEVuZCAtIGN1cnJlbnRTdGFydCwgb2xkRW5kIC0gb2xkU3RhcnQpO1xuaWYgKGN1cnJlbnRTdGFydCA9PSAwICYmIG9sZFN0YXJ0ID09IDApXG5wcmVmaXhDb3VudCA9IHRoaXMuc2hhcmVkUHJlZml4KGN1cnJlbnQsIG9sZCwgbWluTGVuZ3RoKTtcbmlmIChjdXJyZW50RW5kID09IGN1cnJlbnQubGVuZ3RoICYmIG9sZEVuZCA9PSBvbGQubGVuZ3RoKVxuc3VmZml4Q291bnQgPSB0aGlzLnNoYXJlZFN1ZmZpeChjdXJyZW50LCBvbGQsIG1pbkxlbmd0aCAtIHByZWZpeENvdW50KTtcbmN1cnJlbnRTdGFydCArPSBwcmVmaXhDb3VudDtcbm9sZFN0YXJ0ICs9IHByZWZpeENvdW50O1xuY3VycmVudEVuZCAtPSBzdWZmaXhDb3VudDtcbm9sZEVuZCAtPSBzdWZmaXhDb3VudDtcbmlmIChjdXJyZW50RW5kIC0gY3VycmVudFN0YXJ0ID09IDAgJiYgb2xkRW5kIC0gb2xkU3RhcnQgPT0gMClcbnJldHVybiBbXTtcbmlmIChjdXJyZW50U3RhcnQgPT0gY3VycmVudEVuZCkge1xudmFyIHNwbGljZSA9IG5ld1NwbGljZShjdXJyZW50U3RhcnQsIFtdLCAwKTtcbndoaWxlIChvbGRTdGFydCA8IG9sZEVuZClcbnNwbGljZS5yZW1vdmVkLnB1c2gob2xkW29sZFN0YXJ0KytdKTtcbnJldHVybiBbc3BsaWNlXTtcbn0gZWxzZSBpZiAob2xkU3RhcnQgPT0gb2xkRW5kKVxucmV0dXJuIFtuZXdTcGxpY2UoY3VycmVudFN0YXJ0LCBbXSwgY3VycmVudEVuZCAtIGN1cnJlbnRTdGFydCldO1xudmFyIG9wcyA9IHRoaXMuc3BsaWNlT3BlcmF0aW9uc0Zyb21FZGl0RGlzdGFuY2VzKHRoaXMuY2FsY0VkaXREaXN0YW5jZXMoY3VycmVudCwgY3VycmVudFN0YXJ0LCBjdXJyZW50RW5kLCBvbGQsIG9sZFN0YXJ0LCBvbGRFbmQpKTtcbnZhciBzcGxpY2UgPSB1bmRlZmluZWQ7XG52YXIgc3BsaWNlcyA9IFtdO1xudmFyIGluZGV4ID0gY3VycmVudFN0YXJ0O1xudmFyIG9sZEluZGV4ID0gb2xkU3RhcnQ7XG5mb3IgKHZhciBpID0gMDsgaSA8IG9wcy5sZW5ndGg7IGkrKykge1xuc3dpdGNoIChvcHNbaV0pIHtcbmNhc2UgRURJVF9MRUFWRTpcbmlmIChzcGxpY2UpIHtcbnNwbGljZXMucHVzaChzcGxpY2UpO1xuc3BsaWNlID0gdW5kZWZpbmVkO1xufVxuaW5kZXgrKztcbm9sZEluZGV4Kys7XG5icmVhaztcbmNhc2UgRURJVF9VUERBVEU6XG5pZiAoIXNwbGljZSlcbnNwbGljZSA9IG5ld1NwbGljZShpbmRleCwgW10sIDApO1xuc3BsaWNlLmFkZGVkQ291bnQrKztcbmluZGV4Kys7XG5zcGxpY2UucmVtb3ZlZC5wdXNoKG9sZFtvbGRJbmRleF0pO1xub2xkSW5kZXgrKztcbmJyZWFrO1xuY2FzZSBFRElUX0FERDpcbmlmICghc3BsaWNlKVxuc3BsaWNlID0gbmV3U3BsaWNlKGluZGV4LCBbXSwgMCk7XG5zcGxpY2UuYWRkZWRDb3VudCsrO1xuaW5kZXgrKztcbmJyZWFrO1xuY2FzZSBFRElUX0RFTEVURTpcbmlmICghc3BsaWNlKVxuc3BsaWNlID0gbmV3U3BsaWNlKGluZGV4LCBbXSwgMCk7XG5zcGxpY2UucmVtb3ZlZC5wdXNoKG9sZFtvbGRJbmRleF0pO1xub2xkSW5kZXgrKztcbmJyZWFrO1xufVxufVxuaWYgKHNwbGljZSkge1xuc3BsaWNlcy5wdXNoKHNwbGljZSk7XG59XG5yZXR1cm4gc3BsaWNlcztcbn0sXG5zaGFyZWRQcmVmaXg6IGZ1bmN0aW9uIChjdXJyZW50LCBvbGQsIHNlYXJjaExlbmd0aCkge1xuZm9yICh2YXIgaSA9IDA7IGkgPCBzZWFyY2hMZW5ndGg7IGkrKylcbmlmICghdGhpcy5lcXVhbHMoY3VycmVudFtpXSwgb2xkW2ldKSlcbnJldHVybiBpO1xucmV0dXJuIHNlYXJjaExlbmd0aDtcbn0sXG5zaGFyZWRTdWZmaXg6IGZ1bmN0aW9uIChjdXJyZW50LCBvbGQsIHNlYXJjaExlbmd0aCkge1xudmFyIGluZGV4MSA9IGN1cnJlbnQubGVuZ3RoO1xudmFyIGluZGV4MiA9IG9sZC5sZW5ndGg7XG52YXIgY291bnQgPSAwO1xud2hpbGUgKGNvdW50IDwgc2VhcmNoTGVuZ3RoICYmIHRoaXMuZXF1YWxzKGN1cnJlbnRbLS1pbmRleDFdLCBvbGRbLS1pbmRleDJdKSlcbmNvdW50Kys7XG5yZXR1cm4gY291bnQ7XG59LFxuY2FsY3VsYXRlU3BsaWNlczogZnVuY3Rpb24gKGN1cnJlbnQsIHByZXZpb3VzKSB7XG5yZXR1cm4gdGhpcy5jYWxjU3BsaWNlcyhjdXJyZW50LCAwLCBjdXJyZW50Lmxlbmd0aCwgcHJldmlvdXMsIDAsIHByZXZpb3VzLmxlbmd0aCk7XG59LFxuZXF1YWxzOiBmdW5jdGlvbiAoY3VycmVudFZhbHVlLCBwcmV2aW91c1ZhbHVlKSB7XG5yZXR1cm4gY3VycmVudFZhbHVlID09PSBwcmV2aW91c1ZhbHVlO1xufVxufTtcbnJldHVybiBuZXcgQXJyYXlTcGxpY2UoKTtcbn0oKTtcblBvbHltZXIuRXZlbnRBcGkgPSBmdW5jdGlvbiAoKSB7XG52YXIgU2V0dGluZ3MgPSBQb2x5bWVyLlNldHRpbmdzO1xudmFyIEV2ZW50QXBpID0gZnVuY3Rpb24gKGV2ZW50KSB7XG50aGlzLmV2ZW50ID0gZXZlbnQ7XG59O1xuaWYgKFNldHRpbmdzLnVzZVNoYWRvdykge1xuRXZlbnRBcGkucHJvdG90eXBlID0ge1xuZ2V0IHJvb3RUYXJnZXQoKSB7XG5yZXR1cm4gdGhpcy5ldmVudC5wYXRoWzBdO1xufSxcbmdldCBsb2NhbFRhcmdldCgpIHtcbnJldHVybiB0aGlzLmV2ZW50LnRhcmdldDtcbn0sXG5nZXQgcGF0aCgpIHtcbnJldHVybiB0aGlzLmV2ZW50LnBhdGg7XG59XG59O1xufSBlbHNlIHtcbkV2ZW50QXBpLnByb3RvdHlwZSA9IHtcbmdldCByb290VGFyZ2V0KCkge1xucmV0dXJuIHRoaXMuZXZlbnQudGFyZ2V0O1xufSxcbmdldCBsb2NhbFRhcmdldCgpIHtcbnZhciBjdXJyZW50ID0gdGhpcy5ldmVudC5jdXJyZW50VGFyZ2V0O1xudmFyIGN1cnJlbnRSb290ID0gY3VycmVudCAmJiBQb2x5bWVyLmRvbShjdXJyZW50KS5nZXRPd25lclJvb3QoKTtcbnZhciBwJCA9IHRoaXMucGF0aDtcbmZvciAodmFyIGkgPSAwOyBpIDwgcCQubGVuZ3RoOyBpKyspIHtcbmlmIChQb2x5bWVyLmRvbShwJFtpXSkuZ2V0T3duZXJSb290KCkgPT09IGN1cnJlbnRSb290KSB7XG5yZXR1cm4gcCRbaV07XG59XG59XG59LFxuZ2V0IHBhdGgoKSB7XG5pZiAoIXRoaXMuZXZlbnQuX3BhdGgpIHtcbnZhciBwYXRoID0gW107XG52YXIgbyA9IHRoaXMucm9vdFRhcmdldDtcbndoaWxlIChvKSB7XG5wYXRoLnB1c2gobyk7XG5vID0gUG9seW1lci5kb20obykucGFyZW50Tm9kZSB8fCBvLmhvc3Q7XG59XG5wYXRoLnB1c2god2luZG93KTtcbnRoaXMuZXZlbnQuX3BhdGggPSBwYXRoO1xufVxucmV0dXJuIHRoaXMuZXZlbnQuX3BhdGg7XG59XG59O1xufVxudmFyIGZhY3RvcnkgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbmlmICghZXZlbnQuX19ldmVudEFwaSkge1xuZXZlbnQuX19ldmVudEFwaSA9IG5ldyBFdmVudEFwaShldmVudCk7XG59XG5yZXR1cm4gZXZlbnQuX19ldmVudEFwaTtcbn07XG5yZXR1cm4geyBmYWN0b3J5OiBmYWN0b3J5IH07XG59KCk7XG5Qb2x5bWVyLmRvbUlubmVySFRNTCA9IGZ1bmN0aW9uICgpIHtcbnZhciBlc2NhcGVBdHRyUmVnRXhwID0gL1smXFx1MDBBMFwiXS9nO1xudmFyIGVzY2FwZURhdGFSZWdFeHAgPSAvWyZcXHUwMEEwPD5dL2c7XG5mdW5jdGlvbiBlc2NhcGVSZXBsYWNlKGMpIHtcbnN3aXRjaCAoYykge1xuY2FzZSAnJic6XG5yZXR1cm4gJyZhbXA7JztcbmNhc2UgJzwnOlxucmV0dXJuICcmbHQ7JztcbmNhc2UgJz4nOlxucmV0dXJuICcmZ3Q7JztcbmNhc2UgJ1wiJzpcbnJldHVybiAnJnF1b3Q7JztcbmNhc2UgJ1xceEEwJzpcbnJldHVybiAnJm5ic3A7Jztcbn1cbn1cbmZ1bmN0aW9uIGVzY2FwZUF0dHIocykge1xucmV0dXJuIHMucmVwbGFjZShlc2NhcGVBdHRyUmVnRXhwLCBlc2NhcGVSZXBsYWNlKTtcbn1cbmZ1bmN0aW9uIGVzY2FwZURhdGEocykge1xucmV0dXJuIHMucmVwbGFjZShlc2NhcGVEYXRhUmVnRXhwLCBlc2NhcGVSZXBsYWNlKTtcbn1cbmZ1bmN0aW9uIG1ha2VTZXQoYXJyKSB7XG52YXIgc2V0ID0ge307XG5mb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuc2V0W2FycltpXV0gPSB0cnVlO1xufVxucmV0dXJuIHNldDtcbn1cbnZhciB2b2lkRWxlbWVudHMgPSBtYWtlU2V0KFtcbidhcmVhJyxcbidiYXNlJyxcbidicicsXG4nY29sJyxcbidjb21tYW5kJyxcbidlbWJlZCcsXG4naHInLFxuJ2ltZycsXG4naW5wdXQnLFxuJ2tleWdlbicsXG4nbGluaycsXG4nbWV0YScsXG4ncGFyYW0nLFxuJ3NvdXJjZScsXG4ndHJhY2snLFxuJ3dicidcbl0pO1xudmFyIHBsYWludGV4dFBhcmVudHMgPSBtYWtlU2V0KFtcbidzdHlsZScsXG4nc2NyaXB0Jyxcbid4bXAnLFxuJ2lmcmFtZScsXG4nbm9lbWJlZCcsXG4nbm9mcmFtZXMnLFxuJ3BsYWludGV4dCcsXG4nbm9zY3JpcHQnXG5dKTtcbmZ1bmN0aW9uIGdldE91dGVySFRNTChub2RlLCBwYXJlbnROb2RlLCBjb21wb3NlZCkge1xuc3dpdGNoIChub2RlLm5vZGVUeXBlKSB7XG5jYXNlIE5vZGUuRUxFTUVOVF9OT0RFOlxudmFyIHRhZ05hbWUgPSBub2RlLmxvY2FsTmFtZTtcbnZhciBzID0gJzwnICsgdGFnTmFtZTtcbnZhciBhdHRycyA9IG5vZGUuYXR0cmlidXRlcztcbmZvciAodmFyIGkgPSAwLCBhdHRyOyBhdHRyID0gYXR0cnNbaV07IGkrKykge1xucyArPSAnICcgKyBhdHRyLm5hbWUgKyAnPVwiJyArIGVzY2FwZUF0dHIoYXR0ci52YWx1ZSkgKyAnXCInO1xufVxucyArPSAnPic7XG5pZiAodm9pZEVsZW1lbnRzW3RhZ05hbWVdKSB7XG5yZXR1cm4gcztcbn1cbnJldHVybiBzICsgZ2V0SW5uZXJIVE1MKG5vZGUsIGNvbXBvc2VkKSArICc8LycgKyB0YWdOYW1lICsgJz4nO1xuY2FzZSBOb2RlLlRFWFRfTk9ERTpcbnZhciBkYXRhID0gbm9kZS5kYXRhO1xuaWYgKHBhcmVudE5vZGUgJiYgcGxhaW50ZXh0UGFyZW50c1twYXJlbnROb2RlLmxvY2FsTmFtZV0pIHtcbnJldHVybiBkYXRhO1xufVxucmV0dXJuIGVzY2FwZURhdGEoZGF0YSk7XG5jYXNlIE5vZGUuQ09NTUVOVF9OT0RFOlxucmV0dXJuICc8IS0tJyArIG5vZGUuZGF0YSArICctLT4nO1xuZGVmYXVsdDpcbmNvbnNvbGUuZXJyb3Iobm9kZSk7XG50aHJvdyBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpO1xufVxufVxuZnVuY3Rpb24gZ2V0SW5uZXJIVE1MKG5vZGUsIGNvbXBvc2VkKSB7XG5pZiAobm9kZSBpbnN0YW5jZW9mIEhUTUxUZW1wbGF0ZUVsZW1lbnQpXG5ub2RlID0gbm9kZS5jb250ZW50O1xudmFyIHMgPSAnJztcbnZhciBjJCA9IFBvbHltZXIuZG9tKG5vZGUpLmNoaWxkTm9kZXM7XG5jJCA9IGNvbXBvc2VkID8gbm9kZS5fY29tcG9zZWRDaGlsZHJlbiA6IGMkO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBjJC5sZW5ndGgsIGNoaWxkOyBpIDwgbCAmJiAoY2hpbGQgPSBjJFtpXSk7IGkrKykge1xucyArPSBnZXRPdXRlckhUTUwoY2hpbGQsIG5vZGUsIGNvbXBvc2VkKTtcbn1cbnJldHVybiBzO1xufVxucmV0dXJuIHsgZ2V0SW5uZXJIVE1MOiBnZXRJbm5lckhUTUwgfTtcbn0oKTtcblBvbHltZXIuRG9tQXBpID0gZnVuY3Rpb24gKCkge1xuJ3VzZSBzdHJpY3QnO1xudmFyIFNldHRpbmdzID0gUG9seW1lci5TZXR0aW5ncztcbnZhciBnZXRJbm5lckhUTUwgPSBQb2x5bWVyLmRvbUlubmVySFRNTC5nZXRJbm5lckhUTUw7XG52YXIgbmF0aXZlSW5zZXJ0QmVmb3JlID0gRWxlbWVudC5wcm90b3R5cGUuaW5zZXJ0QmVmb3JlO1xudmFyIG5hdGl2ZVJlbW92ZUNoaWxkID0gRWxlbWVudC5wcm90b3R5cGUucmVtb3ZlQ2hpbGQ7XG52YXIgbmF0aXZlQXBwZW5kQ2hpbGQgPSBFbGVtZW50LnByb3RvdHlwZS5hcHBlbmRDaGlsZDtcbnZhciBuYXRpdmVDbG9uZU5vZGUgPSBFbGVtZW50LnByb3RvdHlwZS5jbG9uZU5vZGU7XG52YXIgbmF0aXZlSW1wb3J0Tm9kZSA9IERvY3VtZW50LnByb3RvdHlwZS5pbXBvcnROb2RlO1xudmFyIGRpcnR5Um9vdHMgPSBbXTtcbnZhciBEb21BcGkgPSBmdW5jdGlvbiAobm9kZSkge1xudGhpcy5ub2RlID0gbm9kZTtcbmlmICh0aGlzLnBhdGNoKSB7XG50aGlzLnBhdGNoKCk7XG59XG59O1xuRG9tQXBpLnByb3RvdHlwZSA9IHtcbmZsdXNoOiBmdW5jdGlvbiAoKSB7XG5mb3IgKHZhciBpID0gMCwgaG9zdDsgaSA8IGRpcnR5Um9vdHMubGVuZ3RoOyBpKyspIHtcbmhvc3QgPSBkaXJ0eVJvb3RzW2ldO1xuaG9zdC5mbHVzaERlYm91bmNlcignX2Rpc3RyaWJ1dGUnKTtcbn1cbmRpcnR5Um9vdHMgPSBbXTtcbn0sXG5fbGF6eURpc3RyaWJ1dGU6IGZ1bmN0aW9uIChob3N0KSB7XG5pZiAoaG9zdC5zaGFkeVJvb3QgJiYgaG9zdC5zaGFkeVJvb3QuX2Rpc3RyaWJ1dGlvbkNsZWFuKSB7XG5ob3N0LnNoYWR5Um9vdC5fZGlzdHJpYnV0aW9uQ2xlYW4gPSBmYWxzZTtcbmhvc3QuZGVib3VuY2UoJ19kaXN0cmlidXRlJywgaG9zdC5fZGlzdHJpYnV0ZUNvbnRlbnQpO1xuZGlydHlSb290cy5wdXNoKGhvc3QpO1xufVxufSxcbmFwcGVuZENoaWxkOiBmdW5jdGlvbiAobm9kZSkge1xudmFyIGhhbmRsZWQ7XG50aGlzLl9yZW1vdmVOb2RlRnJvbUhvc3Qobm9kZSwgdHJ1ZSk7XG5pZiAodGhpcy5fbm9kZUlzSW5Mb2dpY2FsVHJlZSh0aGlzLm5vZGUpKSB7XG50aGlzLl9hZGRMb2dpY2FsSW5mbyhub2RlLCB0aGlzLm5vZGUpO1xudGhpcy5fYWRkTm9kZVRvSG9zdChub2RlKTtcbmhhbmRsZWQgPSB0aGlzLl9tYXliZURpc3RyaWJ1dGUobm9kZSwgdGhpcy5ub2RlKTtcbn1cbmlmICghaGFuZGxlZCAmJiAhdGhpcy5fdHJ5UmVtb3ZlVW5kaXN0cmlidXRlZE5vZGUobm9kZSkpIHtcbnZhciBjb250YWluZXIgPSB0aGlzLm5vZGUuX2lzU2hhZHlSb290ID8gdGhpcy5ub2RlLmhvc3QgOiB0aGlzLm5vZGU7XG5hZGRUb0NvbXBvc2VkUGFyZW50KGNvbnRhaW5lciwgbm9kZSk7XG5uYXRpdmVBcHBlbmRDaGlsZC5jYWxsKGNvbnRhaW5lciwgbm9kZSk7XG59XG5yZXR1cm4gbm9kZTtcbn0sXG5pbnNlcnRCZWZvcmU6IGZ1bmN0aW9uIChub2RlLCByZWZfbm9kZSkge1xuaWYgKCFyZWZfbm9kZSkge1xucmV0dXJuIHRoaXMuYXBwZW5kQ2hpbGQobm9kZSk7XG59XG52YXIgaGFuZGxlZDtcbnRoaXMuX3JlbW92ZU5vZGVGcm9tSG9zdChub2RlLCB0cnVlKTtcbmlmICh0aGlzLl9ub2RlSXNJbkxvZ2ljYWxUcmVlKHRoaXMubm9kZSkpIHtcbnNhdmVMaWdodENoaWxkcmVuSWZOZWVkZWQodGhpcy5ub2RlKTtcbnZhciBjaGlsZHJlbiA9IHRoaXMuY2hpbGROb2RlcztcbnZhciBpbmRleCA9IGNoaWxkcmVuLmluZGV4T2YocmVmX25vZGUpO1xuaWYgKGluZGV4IDwgMCkge1xudGhyb3cgRXJyb3IoJ1RoZSByZWZfbm9kZSB0byBiZSBpbnNlcnRlZCBiZWZvcmUgaXMgbm90IGEgY2hpbGQgJyArICdvZiB0aGlzIG5vZGUnKTtcbn1cbnRoaXMuX2FkZExvZ2ljYWxJbmZvKG5vZGUsIHRoaXMubm9kZSwgaW5kZXgpO1xudGhpcy5fYWRkTm9kZVRvSG9zdChub2RlKTtcbmhhbmRsZWQgPSB0aGlzLl9tYXliZURpc3RyaWJ1dGUobm9kZSwgdGhpcy5ub2RlKTtcbn1cbmlmICghaGFuZGxlZCAmJiAhdGhpcy5fdHJ5UmVtb3ZlVW5kaXN0cmlidXRlZE5vZGUobm9kZSkpIHtcbnJlZl9ub2RlID0gcmVmX25vZGUubG9jYWxOYW1lID09PSBDT05URU5UID8gdGhpcy5fZmlyc3RDb21wb3NlZE5vZGUocmVmX25vZGUpIDogcmVmX25vZGU7XG52YXIgY29udGFpbmVyID0gdGhpcy5ub2RlLl9pc1NoYWR5Um9vdCA/IHRoaXMubm9kZS5ob3N0IDogdGhpcy5ub2RlO1xuYWRkVG9Db21wb3NlZFBhcmVudChjb250YWluZXIsIG5vZGUsIHJlZl9ub2RlKTtcbm5hdGl2ZUluc2VydEJlZm9yZS5jYWxsKGNvbnRhaW5lciwgbm9kZSwgcmVmX25vZGUpO1xufVxucmV0dXJuIG5vZGU7XG59LFxucmVtb3ZlQ2hpbGQ6IGZ1bmN0aW9uIChub2RlKSB7XG5pZiAoZmFjdG9yeShub2RlKS5wYXJlbnROb2RlICE9PSB0aGlzLm5vZGUpIHtcbmNvbnNvbGUud2FybignVGhlIG5vZGUgdG8gYmUgcmVtb3ZlZCBpcyBub3QgYSBjaGlsZCBvZiB0aGlzIG5vZGUnLCBub2RlKTtcbn1cbnZhciBoYW5kbGVkO1xuaWYgKHRoaXMuX25vZGVJc0luTG9naWNhbFRyZWUodGhpcy5ub2RlKSkge1xudGhpcy5fcmVtb3ZlTm9kZUZyb21Ib3N0KG5vZGUpO1xuaGFuZGxlZCA9IHRoaXMuX21heWJlRGlzdHJpYnV0ZShub2RlLCB0aGlzLm5vZGUpO1xufVxuaWYgKCFoYW5kbGVkKSB7XG52YXIgY29udGFpbmVyID0gdGhpcy5ub2RlLl9pc1NoYWR5Um9vdCA/IHRoaXMubm9kZS5ob3N0IDogdGhpcy5ub2RlO1xuaWYgKGNvbnRhaW5lciA9PT0gbm9kZS5wYXJlbnROb2RlKSB7XG5yZW1vdmVGcm9tQ29tcG9zZWRQYXJlbnQoY29udGFpbmVyLCBub2RlKTtcbm5hdGl2ZVJlbW92ZUNoaWxkLmNhbGwoY29udGFpbmVyLCBub2RlKTtcbn1cbn1cbnJldHVybiBub2RlO1xufSxcbnJlcGxhY2VDaGlsZDogZnVuY3Rpb24gKG5vZGUsIHJlZl9ub2RlKSB7XG50aGlzLmluc2VydEJlZm9yZShub2RlLCByZWZfbm9kZSk7XG50aGlzLnJlbW92ZUNoaWxkKHJlZl9ub2RlKTtcbnJldHVybiBub2RlO1xufSxcbmdldE93bmVyUm9vdDogZnVuY3Rpb24gKCkge1xucmV0dXJuIHRoaXMuX293bmVyU2hhZHlSb290Rm9yTm9kZSh0aGlzLm5vZGUpO1xufSxcbl9vd25lclNoYWR5Um9vdEZvck5vZGU6IGZ1bmN0aW9uIChub2RlKSB7XG5pZiAoIW5vZGUpIHtcbnJldHVybjtcbn1cbmlmIChub2RlLl9vd25lclNoYWR5Um9vdCA9PT0gdW5kZWZpbmVkKSB7XG52YXIgcm9vdDtcbmlmIChub2RlLl9pc1NoYWR5Um9vdCkge1xucm9vdCA9IG5vZGU7XG59IGVsc2Uge1xudmFyIHBhcmVudCA9IFBvbHltZXIuZG9tKG5vZGUpLnBhcmVudE5vZGU7XG5pZiAocGFyZW50KSB7XG5yb290ID0gcGFyZW50Ll9pc1NoYWR5Um9vdCA/IHBhcmVudCA6IHRoaXMuX293bmVyU2hhZHlSb290Rm9yTm9kZShwYXJlbnQpO1xufSBlbHNlIHtcbnJvb3QgPSBudWxsO1xufVxufVxubm9kZS5fb3duZXJTaGFkeVJvb3QgPSByb290O1xufVxucmV0dXJuIG5vZGUuX293bmVyU2hhZHlSb290O1xufSxcbl9tYXliZURpc3RyaWJ1dGU6IGZ1bmN0aW9uIChub2RlLCBwYXJlbnQpIHtcbnZhciBmcmFnQ29udGVudCA9IG5vZGUubm9kZVR5cGUgPT09IE5vZGUuRE9DVU1FTlRfRlJBR01FTlRfTk9ERSAmJiAhbm9kZS5fX25vQ29udGVudCAmJiBQb2x5bWVyLmRvbShub2RlKS5xdWVyeVNlbGVjdG9yKENPTlRFTlQpO1xudmFyIHdyYXBwZWRDb250ZW50ID0gZnJhZ0NvbnRlbnQgJiYgUG9seW1lci5kb20oZnJhZ0NvbnRlbnQpLnBhcmVudE5vZGUubm9kZVR5cGUgIT09IE5vZGUuRE9DVU1FTlRfRlJBR01FTlRfTk9ERTtcbnZhciBoYXNDb250ZW50ID0gZnJhZ0NvbnRlbnQgfHwgbm9kZS5sb2NhbE5hbWUgPT09IENPTlRFTlQ7XG5pZiAoaGFzQ29udGVudCkge1xudmFyIHJvb3QgPSB0aGlzLl9vd25lclNoYWR5Um9vdEZvck5vZGUocGFyZW50KTtcbmlmIChyb290KSB7XG52YXIgaG9zdCA9IHJvb3QuaG9zdDtcbnRoaXMuX3VwZGF0ZUluc2VydGlvblBvaW50cyhob3N0KTtcbnRoaXMuX2xhenlEaXN0cmlidXRlKGhvc3QpO1xufVxufVxudmFyIHBhcmVudE5lZWRzRGlzdCA9IHRoaXMuX3BhcmVudE5lZWRzRGlzdHJpYnV0aW9uKHBhcmVudCk7XG5pZiAocGFyZW50TmVlZHNEaXN0KSB7XG50aGlzLl9sYXp5RGlzdHJpYnV0ZShwYXJlbnQpO1xufVxucmV0dXJuIHBhcmVudE5lZWRzRGlzdCB8fCBoYXNDb250ZW50ICYmICF3cmFwcGVkQ29udGVudDtcbn0sXG5fdHJ5UmVtb3ZlVW5kaXN0cmlidXRlZE5vZGU6IGZ1bmN0aW9uIChub2RlKSB7XG5pZiAodGhpcy5ub2RlLnNoYWR5Um9vdCkge1xuaWYgKG5vZGUuX2NvbXBvc2VkUGFyZW50KSB7XG5uYXRpdmVSZW1vdmVDaGlsZC5jYWxsKG5vZGUuX2NvbXBvc2VkUGFyZW50LCBub2RlKTtcbn1cbnJldHVybiB0cnVlO1xufVxufSxcbl91cGRhdGVJbnNlcnRpb25Qb2ludHM6IGZ1bmN0aW9uIChob3N0KSB7XG5ob3N0LnNoYWR5Um9vdC5faW5zZXJ0aW9uUG9pbnRzID0gZmFjdG9yeShob3N0LnNoYWR5Um9vdCkucXVlcnlTZWxlY3RvckFsbChDT05URU5UKTtcbn0sXG5fbm9kZUlzSW5Mb2dpY2FsVHJlZTogZnVuY3Rpb24gKG5vZGUpIHtcbnJldHVybiBCb29sZWFuKG5vZGUuX2xpZ2h0UGFyZW50ICE9PSB1bmRlZmluZWQgfHwgbm9kZS5faXNTaGFkeVJvb3QgfHwgdGhpcy5fb3duZXJTaGFkeVJvb3RGb3JOb2RlKG5vZGUpIHx8IG5vZGUuc2hhZHlSb290KTtcbn0sXG5fcGFyZW50TmVlZHNEaXN0cmlidXRpb246IGZ1bmN0aW9uIChwYXJlbnQpIHtcbnJldHVybiBwYXJlbnQgJiYgcGFyZW50LnNoYWR5Um9vdCAmJiBoYXNJbnNlcnRpb25Qb2ludChwYXJlbnQuc2hhZHlSb290KTtcbn0sXG5fcmVtb3ZlTm9kZUZyb21Ib3N0OiBmdW5jdGlvbiAobm9kZSwgZW5zdXJlQ29tcG9zZWRSZW1vdmFsKSB7XG52YXIgaG9zdE5lZWRzRGlzdDtcbnZhciByb290O1xudmFyIHBhcmVudCA9IG5vZGUuX2xpZ2h0UGFyZW50O1xuaWYgKHBhcmVudCkge1xucm9vdCA9IHRoaXMuX293bmVyU2hhZHlSb290Rm9yTm9kZShub2RlKTtcbmlmIChyb290KSB7XG5yb290Lmhvc3QuX2VsZW1lbnRSZW1vdmUobm9kZSk7XG5ob3N0TmVlZHNEaXN0ID0gdGhpcy5fcmVtb3ZlRGlzdHJpYnV0ZWRDaGlsZHJlbihyb290LCBub2RlKTtcbn1cbnRoaXMuX3JlbW92ZUxvZ2ljYWxJbmZvKG5vZGUsIG5vZGUuX2xpZ2h0UGFyZW50KTtcbn1cbnRoaXMuX3JlbW92ZU93bmVyU2hhZHlSb290KG5vZGUpO1xuaWYgKHJvb3QgJiYgaG9zdE5lZWRzRGlzdCkge1xudGhpcy5fdXBkYXRlSW5zZXJ0aW9uUG9pbnRzKHJvb3QuaG9zdCk7XG50aGlzLl9sYXp5RGlzdHJpYnV0ZShyb290Lmhvc3QpO1xufSBlbHNlIGlmIChlbnN1cmVDb21wb3NlZFJlbW92YWwpIHtcbnJlbW92ZUZyb21Db21wb3NlZFBhcmVudChwYXJlbnQgfHwgbm9kZS5wYXJlbnROb2RlLCBub2RlKTtcbn1cbn0sXG5fcmVtb3ZlRGlzdHJpYnV0ZWRDaGlsZHJlbjogZnVuY3Rpb24gKHJvb3QsIGNvbnRhaW5lcikge1xudmFyIGhvc3ROZWVkc0Rpc3Q7XG52YXIgaXAkID0gcm9vdC5faW5zZXJ0aW9uUG9pbnRzO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBpcCQubGVuZ3RoOyBpKyspIHtcbnZhciBjb250ZW50ID0gaXAkW2ldO1xuaWYgKHRoaXMuX2NvbnRhaW5zKGNvbnRhaW5lciwgY29udGVudCkpIHtcbnZhciBkYyQgPSBmYWN0b3J5KGNvbnRlbnQpLmdldERpc3RyaWJ1dGVkTm9kZXMoKTtcbmZvciAodmFyIGogPSAwOyBqIDwgZGMkLmxlbmd0aDsgaisrKSB7XG5ob3N0TmVlZHNEaXN0ID0gdHJ1ZTtcbnZhciBub2RlID0gZGMkW2pdO1xudmFyIHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcbmlmIChwYXJlbnQpIHtcbnJlbW92ZUZyb21Db21wb3NlZFBhcmVudChwYXJlbnQsIG5vZGUpO1xubmF0aXZlUmVtb3ZlQ2hpbGQuY2FsbChwYXJlbnQsIG5vZGUpO1xufVxufVxufVxufVxucmV0dXJuIGhvc3ROZWVkc0Rpc3Q7XG59LFxuX2NvbnRhaW5zOiBmdW5jdGlvbiAoY29udGFpbmVyLCBub2RlKSB7XG53aGlsZSAobm9kZSkge1xuaWYgKG5vZGUgPT0gY29udGFpbmVyKSB7XG5yZXR1cm4gdHJ1ZTtcbn1cbm5vZGUgPSBmYWN0b3J5KG5vZGUpLnBhcmVudE5vZGU7XG59XG59LFxuX2FkZE5vZGVUb0hvc3Q6IGZ1bmN0aW9uIChub2RlKSB7XG52YXIgY2hlY2tOb2RlID0gbm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5ET0NVTUVOVF9GUkFHTUVOVF9OT0RFID8gbm9kZS5maXJzdENoaWxkIDogbm9kZTtcbnZhciByb290ID0gdGhpcy5fb3duZXJTaGFkeVJvb3RGb3JOb2RlKGNoZWNrTm9kZSk7XG5pZiAocm9vdCkge1xucm9vdC5ob3N0Ll9lbGVtZW50QWRkKG5vZGUpO1xufVxufSxcbl9hZGRMb2dpY2FsSW5mbzogZnVuY3Rpb24gKG5vZGUsIGNvbnRhaW5lciwgaW5kZXgpIHtcbnNhdmVMaWdodENoaWxkcmVuSWZOZWVkZWQoY29udGFpbmVyKTtcbnZhciBjaGlsZHJlbiA9IGZhY3RvcnkoY29udGFpbmVyKS5jaGlsZE5vZGVzO1xuaW5kZXggPSBpbmRleCA9PT0gdW5kZWZpbmVkID8gY2hpbGRyZW4ubGVuZ3RoIDogaW5kZXg7XG5pZiAobm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5ET0NVTUVOVF9GUkFHTUVOVF9OT0RFKSB7XG52YXIgYyQgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChub2RlLmNoaWxkTm9kZXMpO1xuZm9yICh2YXIgaSA9IDAsIG47IGkgPCBjJC5sZW5ndGggJiYgKG4gPSBjJFtpXSk7IGkrKykge1xuY2hpbGRyZW4uc3BsaWNlKGluZGV4KyssIDAsIG4pO1xubi5fbGlnaHRQYXJlbnQgPSBjb250YWluZXI7XG59XG59IGVsc2Uge1xuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAwLCBub2RlKTtcbm5vZGUuX2xpZ2h0UGFyZW50ID0gY29udGFpbmVyO1xufVxufSxcbl9yZW1vdmVMb2dpY2FsSW5mbzogZnVuY3Rpb24gKG5vZGUsIGNvbnRhaW5lcikge1xudmFyIGNoaWxkcmVuID0gZmFjdG9yeShjb250YWluZXIpLmNoaWxkTm9kZXM7XG52YXIgaW5kZXggPSBjaGlsZHJlbi5pbmRleE9mKG5vZGUpO1xuaWYgKGluZGV4IDwgMCB8fCBjb250YWluZXIgIT09IG5vZGUuX2xpZ2h0UGFyZW50KSB7XG50aHJvdyBFcnJvcignVGhlIG5vZGUgdG8gYmUgcmVtb3ZlZCBpcyBub3QgYSBjaGlsZCBvZiB0aGlzIG5vZGUnKTtcbn1cbmNoaWxkcmVuLnNwbGljZShpbmRleCwgMSk7XG5ub2RlLl9saWdodFBhcmVudCA9IG51bGw7XG59LFxuX3JlbW92ZU93bmVyU2hhZHlSb290OiBmdW5jdGlvbiAobm9kZSkge1xudmFyIGhhc0NhY2hlZFJvb3QgPSBmYWN0b3J5KG5vZGUpLmdldE93bmVyUm9vdCgpICE9PSB1bmRlZmluZWQ7XG5pZiAoaGFzQ2FjaGVkUm9vdCkge1xudmFyIGMkID0gZmFjdG9yeShub2RlKS5jaGlsZE5vZGVzO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBjJC5sZW5ndGgsIG47IGkgPCBsICYmIChuID0gYyRbaV0pOyBpKyspIHtcbnRoaXMuX3JlbW92ZU93bmVyU2hhZHlSb290KG4pO1xufVxufVxubm9kZS5fb3duZXJTaGFkeVJvb3QgPSB1bmRlZmluZWQ7XG59LFxuX2ZpcnN0Q29tcG9zZWROb2RlOiBmdW5jdGlvbiAoY29udGVudCkge1xudmFyIG4kID0gZmFjdG9yeShjb250ZW50KS5nZXREaXN0cmlidXRlZE5vZGVzKCk7XG5mb3IgKHZhciBpID0gMCwgbCA9IG4kLmxlbmd0aCwgbiwgcCQ7IGkgPCBsICYmIChuID0gbiRbaV0pOyBpKyspIHtcbnAkID0gZmFjdG9yeShuKS5nZXREZXN0aW5hdGlvbkluc2VydGlvblBvaW50cygpO1xuaWYgKHAkW3AkLmxlbmd0aCAtIDFdID09PSBjb250ZW50KSB7XG5yZXR1cm4gbjtcbn1cbn1cbn0sXG5xdWVyeVNlbGVjdG9yOiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbnJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpWzBdO1xufSxcbnF1ZXJ5U2VsZWN0b3JBbGw6IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xucmV0dXJuIHRoaXMuX3F1ZXJ5KGZ1bmN0aW9uIChuKSB7XG5yZXR1cm4gbWF0Y2hlc1NlbGVjdG9yLmNhbGwobiwgc2VsZWN0b3IpO1xufSwgdGhpcy5ub2RlKTtcbn0sXG5fcXVlcnk6IGZ1bmN0aW9uIChtYXRjaGVyLCBub2RlKSB7XG5ub2RlID0gbm9kZSB8fCB0aGlzLm5vZGU7XG52YXIgbGlzdCA9IFtdO1xudGhpcy5fcXVlcnlFbGVtZW50cyhmYWN0b3J5KG5vZGUpLmNoaWxkTm9kZXMsIG1hdGNoZXIsIGxpc3QpO1xucmV0dXJuIGxpc3Q7XG59LFxuX3F1ZXJ5RWxlbWVudHM6IGZ1bmN0aW9uIChlbGVtZW50cywgbWF0Y2hlciwgbGlzdCkge1xuZm9yICh2YXIgaSA9IDAsIGwgPSBlbGVtZW50cy5sZW5ndGgsIGM7IGkgPCBsICYmIChjID0gZWxlbWVudHNbaV0pOyBpKyspIHtcbmlmIChjLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSkge1xudGhpcy5fcXVlcnlFbGVtZW50KGMsIG1hdGNoZXIsIGxpc3QpO1xufVxufVxufSxcbl9xdWVyeUVsZW1lbnQ6IGZ1bmN0aW9uIChub2RlLCBtYXRjaGVyLCBsaXN0KSB7XG5pZiAobWF0Y2hlcihub2RlKSkge1xubGlzdC5wdXNoKG5vZGUpO1xufVxudGhpcy5fcXVlcnlFbGVtZW50cyhmYWN0b3J5KG5vZGUpLmNoaWxkTm9kZXMsIG1hdGNoZXIsIGxpc3QpO1xufSxcbmdldERlc3RpbmF0aW9uSW5zZXJ0aW9uUG9pbnRzOiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gdGhpcy5ub2RlLl9kZXN0aW5hdGlvbkluc2VydGlvblBvaW50cyB8fCBbXTtcbn0sXG5nZXREaXN0cmlidXRlZE5vZGVzOiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gdGhpcy5ub2RlLl9kaXN0cmlidXRlZE5vZGVzIHx8IFtdO1xufSxcbnF1ZXJ5RGlzdHJpYnV0ZWRFbGVtZW50czogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG52YXIgYyQgPSB0aGlzLmNoaWxkTm9kZXM7XG52YXIgbGlzdCA9IFtdO1xudGhpcy5fZGlzdHJpYnV0ZWRGaWx0ZXIoc2VsZWN0b3IsIGMkLCBsaXN0KTtcbmZvciAodmFyIGkgPSAwLCBsID0gYyQubGVuZ3RoLCBjOyBpIDwgbCAmJiAoYyA9IGMkW2ldKTsgaSsrKSB7XG5pZiAoYy5sb2NhbE5hbWUgPT09IENPTlRFTlQpIHtcbnRoaXMuX2Rpc3RyaWJ1dGVkRmlsdGVyKHNlbGVjdG9yLCBmYWN0b3J5KGMpLmdldERpc3RyaWJ1dGVkTm9kZXMoKSwgbGlzdCk7XG59XG59XG5yZXR1cm4gbGlzdDtcbn0sXG5fZGlzdHJpYnV0ZWRGaWx0ZXI6IGZ1bmN0aW9uIChzZWxlY3RvciwgbGlzdCwgcmVzdWx0cykge1xucmVzdWx0cyA9IHJlc3VsdHMgfHwgW107XG5mb3IgKHZhciBpID0gMCwgbCA9IGxpc3QubGVuZ3RoLCBkOyBpIDwgbCAmJiAoZCA9IGxpc3RbaV0pOyBpKyspIHtcbmlmIChkLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSAmJiBkLmxvY2FsTmFtZSAhPT0gQ09OVEVOVCAmJiBtYXRjaGVzU2VsZWN0b3IuY2FsbChkLCBzZWxlY3RvcikpIHtcbnJlc3VsdHMucHVzaChkKTtcbn1cbn1cbnJldHVybiByZXN1bHRzO1xufSxcbl9jbGVhcjogZnVuY3Rpb24gKCkge1xud2hpbGUgKHRoaXMuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbnRoaXMucmVtb3ZlQ2hpbGQodGhpcy5jaGlsZE5vZGVzWzBdKTtcbn1cbn0sXG5zZXRBdHRyaWJ1dGU6IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xudGhpcy5ub2RlLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG50aGlzLl9kaXN0cmlidXRlUGFyZW50KCk7XG59LFxucmVtb3ZlQXR0cmlidXRlOiBmdW5jdGlvbiAobmFtZSkge1xudGhpcy5ub2RlLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbnRoaXMuX2Rpc3RyaWJ1dGVQYXJlbnQoKTtcbn0sXG5fZGlzdHJpYnV0ZVBhcmVudDogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuX3BhcmVudE5lZWRzRGlzdHJpYnV0aW9uKHRoaXMucGFyZW50Tm9kZSkpIHtcbnRoaXMuX2xhenlEaXN0cmlidXRlKHRoaXMucGFyZW50Tm9kZSk7XG59XG59LFxuY2xvbmVOb2RlOiBmdW5jdGlvbiAoZGVlcCkge1xudmFyIG4gPSBuYXRpdmVDbG9uZU5vZGUuY2FsbCh0aGlzLm5vZGUsIGZhbHNlKTtcbmlmIChkZWVwKSB7XG52YXIgYyQgPSB0aGlzLmNoaWxkTm9kZXM7XG52YXIgZCA9IGZhY3Rvcnkobik7XG5mb3IgKHZhciBpID0gMCwgbmM7IGkgPCBjJC5sZW5ndGg7IGkrKykge1xubmMgPSBmYWN0b3J5KGMkW2ldKS5jbG9uZU5vZGUodHJ1ZSk7XG5kLmFwcGVuZENoaWxkKG5jKTtcbn1cbn1cbnJldHVybiBuO1xufSxcbmltcG9ydE5vZGU6IGZ1bmN0aW9uIChleHRlcm5hbE5vZGUsIGRlZXApIHtcbnZhciBkb2MgPSB0aGlzLm5vZGUgaW5zdGFuY2VvZiBIVE1MRG9jdW1lbnQgPyB0aGlzLm5vZGUgOiB0aGlzLm5vZGUub3duZXJEb2N1bWVudDtcbnZhciBuID0gbmF0aXZlSW1wb3J0Tm9kZS5jYWxsKGRvYywgZXh0ZXJuYWxOb2RlLCBmYWxzZSk7XG5pZiAoZGVlcCkge1xudmFyIGMkID0gZmFjdG9yeShleHRlcm5hbE5vZGUpLmNoaWxkTm9kZXM7XG52YXIgZCA9IGZhY3Rvcnkobik7XG5mb3IgKHZhciBpID0gMCwgbmM7IGkgPCBjJC5sZW5ndGg7IGkrKykge1xubmMgPSBmYWN0b3J5KGRvYykuaW1wb3J0Tm9kZShjJFtpXSwgdHJ1ZSk7XG5kLmFwcGVuZENoaWxkKG5jKTtcbn1cbn1cbnJldHVybiBuO1xufVxufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShEb21BcGkucHJvdG90eXBlLCAnY2xhc3NMaXN0Jywge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG5pZiAoIXRoaXMuX2NsYXNzTGlzdCkge1xudGhpcy5fY2xhc3NMaXN0ID0gbmV3IERvbUFwaS5DbGFzc0xpc3QodGhpcyk7XG59XG5yZXR1cm4gdGhpcy5fY2xhc3NMaXN0O1xufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5Eb21BcGkuQ2xhc3NMaXN0ID0gZnVuY3Rpb24gKGhvc3QpIHtcbnRoaXMuZG9tQXBpID0gaG9zdDtcbnRoaXMubm9kZSA9IGhvc3Qubm9kZTtcbn07XG5Eb21BcGkuQ2xhc3NMaXN0LnByb3RvdHlwZSA9IHtcbmFkZDogZnVuY3Rpb24gKCkge1xudGhpcy5ub2RlLmNsYXNzTGlzdC5hZGQuYXBwbHkodGhpcy5ub2RlLmNsYXNzTGlzdCwgYXJndW1lbnRzKTtcbnRoaXMuZG9tQXBpLl9kaXN0cmlidXRlUGFyZW50KCk7XG59LFxucmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG50aGlzLm5vZGUuY2xhc3NMaXN0LnJlbW92ZS5hcHBseSh0aGlzLm5vZGUuY2xhc3NMaXN0LCBhcmd1bWVudHMpO1xudGhpcy5kb21BcGkuX2Rpc3RyaWJ1dGVQYXJlbnQoKTtcbn0sXG50b2dnbGU6IGZ1bmN0aW9uICgpIHtcbnRoaXMubm9kZS5jbGFzc0xpc3QudG9nZ2xlLmFwcGx5KHRoaXMubm9kZS5jbGFzc0xpc3QsIGFyZ3VtZW50cyk7XG50aGlzLmRvbUFwaS5fZGlzdHJpYnV0ZVBhcmVudCgpO1xufSxcbmNvbnRhaW5zOiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gdGhpcy5ub2RlLmNsYXNzTGlzdC5jb250YWlucy5hcHBseSh0aGlzLm5vZGUuY2xhc3NMaXN0LCBhcmd1bWVudHMpO1xufVxufTtcbmlmICghU2V0dGluZ3MudXNlU2hhZG93KSB7XG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhEb21BcGkucHJvdG90eXBlLCB7XG5jaGlsZE5vZGVzOiB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnZhciBjJCA9IGdldExpZ2h0Q2hpbGRyZW4odGhpcy5ub2RlKTtcbnJldHVybiBBcnJheS5pc0FycmF5KGMkKSA/IGMkIDogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYyQpO1xufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSxcbmNoaWxkcmVuOiB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnJldHVybiBBcnJheS5wcm90b3R5cGUuZmlsdGVyLmNhbGwodGhpcy5jaGlsZE5vZGVzLCBmdW5jdGlvbiAobikge1xucmV0dXJuIG4ubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFO1xufSk7XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59LFxucGFyZW50Tm9kZToge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gdGhpcy5ub2RlLl9saWdodFBhcmVudCB8fCAodGhpcy5ub2RlLl9fcGF0Y2hlZCA/IHRoaXMubm9kZS5fY29tcG9zZWRQYXJlbnQgOiB0aGlzLm5vZGUucGFyZW50Tm9kZSk7XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59LFxuZmlyc3RDaGlsZDoge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gdGhpcy5jaGlsZE5vZGVzWzBdO1xufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSxcbmxhc3RDaGlsZDoge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG52YXIgYyQgPSB0aGlzLmNoaWxkTm9kZXM7XG5yZXR1cm4gYyRbYyQubGVuZ3RoIC0gMV07XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59LFxubmV4dFNpYmxpbmc6IHtcbmdldDogZnVuY3Rpb24gKCkge1xudmFyIGMkID0gdGhpcy5wYXJlbnROb2RlICYmIGZhY3RvcnkodGhpcy5wYXJlbnROb2RlKS5jaGlsZE5vZGVzO1xuaWYgKGMkKSB7XG5yZXR1cm4gYyRbQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChjJCwgdGhpcy5ub2RlKSArIDFdO1xufVxufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSxcbnByZXZpb3VzU2libGluZzoge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG52YXIgYyQgPSB0aGlzLnBhcmVudE5vZGUgJiYgZmFjdG9yeSh0aGlzLnBhcmVudE5vZGUpLmNoaWxkTm9kZXM7XG5pZiAoYyQpIHtcbnJldHVybiBjJFtBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGMkLCB0aGlzLm5vZGUpIC0gMV07XG59XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59LFxuZmlyc3RFbGVtZW50Q2hpbGQ6IHtcbmdldDogZnVuY3Rpb24gKCkge1xucmV0dXJuIHRoaXMuY2hpbGRyZW5bMF07XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59LFxubGFzdEVsZW1lbnRDaGlsZDoge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG52YXIgYyQgPSB0aGlzLmNoaWxkcmVuO1xucmV0dXJuIGMkW2MkLmxlbmd0aCAtIDFdO1xufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSxcbm5leHRFbGVtZW50U2libGluZzoge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG52YXIgYyQgPSB0aGlzLnBhcmVudE5vZGUgJiYgZmFjdG9yeSh0aGlzLnBhcmVudE5vZGUpLmNoaWxkcmVuO1xuaWYgKGMkKSB7XG5yZXR1cm4gYyRbQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChjJCwgdGhpcy5ub2RlKSArIDFdO1xufVxufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSxcbnByZXZpb3VzRWxlbWVudFNpYmxpbmc6IHtcbmdldDogZnVuY3Rpb24gKCkge1xudmFyIGMkID0gdGhpcy5wYXJlbnROb2RlICYmIGZhY3RvcnkodGhpcy5wYXJlbnROb2RlKS5jaGlsZHJlbjtcbmlmIChjJCkge1xucmV0dXJuIGMkW0FycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYyQsIHRoaXMubm9kZSkgLSAxXTtcbn1cbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn0sXG50ZXh0Q29udGVudDoge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5ub2RlLm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERSkge1xucmV0dXJuIHRoaXMubm9kZS50ZXh0Q29udGVudDtcbn0gZWxzZSB7XG5yZXR1cm4gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKHRoaXMuY2hpbGROb2RlcywgZnVuY3Rpb24gKGMpIHtcbnJldHVybiBjLnRleHRDb250ZW50O1xufSkuam9pbignJyk7XG59XG59LFxuc2V0OiBmdW5jdGlvbiAodGV4dCkge1xudGhpcy5fY2xlYXIoKTtcbmlmICh0ZXh0KSB7XG50aGlzLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpKTtcbn1cbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn0sXG5pbm5lckhUTUw6IHtcbmdldDogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMubm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5URVhUX05PREUpIHtcbnJldHVybiBudWxsO1xufSBlbHNlIHtcbnJldHVybiBnZXRJbm5lckhUTUwodGhpcy5ub2RlKTtcbn1cbn0sXG5zZXQ6IGZ1bmN0aW9uICh0ZXh0KSB7XG5pZiAodGhpcy5ub2RlLm5vZGVUeXBlICE9PSBOb2RlLlRFWFRfTk9ERSkge1xudGhpcy5fY2xlYXIoKTtcbnZhciBkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5kLmlubmVySFRNTCA9IHRleHQ7XG52YXIgYyQgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChkLmNoaWxkTm9kZXMpO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBjJC5sZW5ndGg7IGkrKykge1xudGhpcy5hcHBlbmRDaGlsZChjJFtpXSk7XG59XG59XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59XG59KTtcbkRvbUFwaS5wcm90b3R5cGUuX2dldENvbXBvc2VkSW5uZXJIVE1MID0gZnVuY3Rpb24gKCkge1xucmV0dXJuIGdldElubmVySFRNTCh0aGlzLm5vZGUsIHRydWUpO1xufTtcbn0gZWxzZSB7XG5Eb21BcGkucHJvdG90eXBlLnF1ZXJ5U2VsZWN0b3JBbGwgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbnJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLm5vZGUucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xufTtcbkRvbUFwaS5wcm90b3R5cGUuZ2V0T3duZXJSb290ID0gZnVuY3Rpb24gKCkge1xudmFyIG4gPSB0aGlzLm5vZGU7XG53aGlsZSAobikge1xuaWYgKG4ubm9kZVR5cGUgPT09IE5vZGUuRE9DVU1FTlRfRlJBR01FTlRfTk9ERSAmJiBuLmhvc3QpIHtcbnJldHVybiBuO1xufVxubiA9IG4ucGFyZW50Tm9kZTtcbn1cbn07XG5Eb21BcGkucHJvdG90eXBlLmNsb25lTm9kZSA9IGZ1bmN0aW9uIChkZWVwKSB7XG5yZXR1cm4gdGhpcy5ub2RlLmNsb25lTm9kZShkZWVwKTtcbn07XG5Eb21BcGkucHJvdG90eXBlLmltcG9ydE5vZGUgPSBmdW5jdGlvbiAoZXh0ZXJuYWxOb2RlLCBkZWVwKSB7XG52YXIgZG9jID0gdGhpcy5ub2RlIGluc3RhbmNlb2YgSFRNTERvY3VtZW50ID8gdGhpcy5ub2RlIDogdGhpcy5ub2RlLm93bmVyRG9jdW1lbnQ7XG5yZXR1cm4gZG9jLmltcG9ydE5vZGUoZXh0ZXJuYWxOb2RlLCBkZWVwKTtcbn07XG5Eb21BcGkucHJvdG90eXBlLmdldERlc3RpbmF0aW9uSW5zZXJ0aW9uUG9pbnRzID0gZnVuY3Rpb24gKCkge1xudmFyIG4kID0gdGhpcy5ub2RlLmdldERlc3RpbmF0aW9uSW5zZXJ0aW9uUG9pbnRzKCk7XG5yZXR1cm4gbiQgPyBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChuJCkgOiBbXTtcbn07XG5Eb21BcGkucHJvdG90eXBlLmdldERpc3RyaWJ1dGVkTm9kZXMgPSBmdW5jdGlvbiAoKSB7XG52YXIgbiQgPSB0aGlzLm5vZGUuZ2V0RGlzdHJpYnV0ZWROb2RlcygpO1xucmV0dXJuIG4kID8gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobiQpIDogW107XG59O1xuRG9tQXBpLnByb3RvdHlwZS5fZGlzdHJpYnV0ZVBhcmVudCA9IGZ1bmN0aW9uICgpIHtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhEb21BcGkucHJvdG90eXBlLCB7XG5jaGlsZE5vZGVzOiB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLm5vZGUuY2hpbGROb2Rlcyk7XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59LFxuY2hpbGRyZW46IHtcbmdldDogZnVuY3Rpb24gKCkge1xucmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMubm9kZS5jaGlsZHJlbik7XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59LFxudGV4dENvbnRlbnQ6IHtcbmdldDogZnVuY3Rpb24gKCkge1xucmV0dXJuIHRoaXMubm9kZS50ZXh0Q29udGVudDtcbn0sXG5zZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xucmV0dXJuIHRoaXMubm9kZS50ZXh0Q29udGVudCA9IHZhbHVlO1xufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSxcbmlubmVySFRNTDoge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gdGhpcy5ub2RlLmlubmVySFRNTDtcbn0sXG5zZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xucmV0dXJuIHRoaXMubm9kZS5pbm5lckhUTUwgPSB2YWx1ZTtcbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn1cbn0pO1xudmFyIGZvcndhcmRzID0gW1xuJ3BhcmVudE5vZGUnLFxuJ2ZpcnN0Q2hpbGQnLFxuJ2xhc3RDaGlsZCcsXG4nbmV4dFNpYmxpbmcnLFxuJ3ByZXZpb3VzU2libGluZycsXG4nZmlyc3RFbGVtZW50Q2hpbGQnLFxuJ2xhc3RFbGVtZW50Q2hpbGQnLFxuJ25leHRFbGVtZW50U2libGluZycsXG4ncHJldmlvdXNFbGVtZW50U2libGluZydcbl07XG5mb3J3YXJkcy5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoRG9tQXBpLnByb3RvdHlwZSwgbmFtZSwge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gdGhpcy5ub2RlW25hbWVdO1xufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG59KTtcbn1cbnZhciBDT05URU5UID0gJ2NvbnRlbnQnO1xudmFyIGZhY3RvcnkgPSBmdW5jdGlvbiAobm9kZSwgcGF0Y2gpIHtcbm5vZGUgPSBub2RlIHx8IGRvY3VtZW50O1xuaWYgKCFub2RlLl9fZG9tQXBpKSB7XG5ub2RlLl9fZG9tQXBpID0gbmV3IERvbUFwaShub2RlLCBwYXRjaCk7XG59XG5yZXR1cm4gbm9kZS5fX2RvbUFwaTtcbn07XG5Qb2x5bWVyLmRvbSA9IGZ1bmN0aW9uIChvYmosIHBhdGNoKSB7XG5pZiAob2JqIGluc3RhbmNlb2YgRXZlbnQpIHtcbnJldHVybiBQb2x5bWVyLkV2ZW50QXBpLmZhY3Rvcnkob2JqKTtcbn0gZWxzZSB7XG5yZXR1cm4gZmFjdG9yeShvYmosIHBhdGNoKTtcbn1cbn07XG5Qb2x5bWVyLmRvbS5mbHVzaCA9IERvbUFwaS5wcm90b3R5cGUuZmx1c2g7XG5mdW5jdGlvbiBnZXRMaWdodENoaWxkcmVuKG5vZGUpIHtcbnZhciBjaGlsZHJlbiA9IG5vZGUuX2xpZ2h0Q2hpbGRyZW47XG5yZXR1cm4gY2hpbGRyZW4gPyBjaGlsZHJlbiA6IG5vZGUuY2hpbGROb2Rlcztcbn1cbmZ1bmN0aW9uIGdldENvbXBvc2VkQ2hpbGRyZW4obm9kZSkge1xuaWYgKCFub2RlLl9jb21wb3NlZENoaWxkcmVuKSB7XG5ub2RlLl9jb21wb3NlZENoaWxkcmVuID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobm9kZS5jaGlsZE5vZGVzKTtcbn1cbnJldHVybiBub2RlLl9jb21wb3NlZENoaWxkcmVuO1xufVxuZnVuY3Rpb24gYWRkVG9Db21wb3NlZFBhcmVudChwYXJlbnQsIG5vZGUsIHJlZl9ub2RlKSB7XG52YXIgY2hpbGRyZW4gPSBnZXRDb21wb3NlZENoaWxkcmVuKHBhcmVudCk7XG52YXIgaSA9IHJlZl9ub2RlID8gY2hpbGRyZW4uaW5kZXhPZihyZWZfbm9kZSkgOiAtMTtcbmlmIChub2RlLm5vZGVUeXBlID09PSBOb2RlLkRPQ1VNRU5UX0ZSQUdNRU5UX05PREUpIHtcbnZhciBmcmFnQ2hpbGRyZW4gPSBnZXRDb21wb3NlZENoaWxkcmVuKG5vZGUpO1xuZm9yICh2YXIgaiA9IDA7IGogPCBmcmFnQ2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcbmFkZE5vZGVUb0NvbXBvc2VkQ2hpbGRyZW4oZnJhZ0NoaWxkcmVuW2pdLCBwYXJlbnQsIGNoaWxkcmVuLCBpICsgaik7XG59XG5ub2RlLl9jb21wb3NlZENoaWxkcmVuID0gbnVsbDtcbn0gZWxzZSB7XG5hZGROb2RlVG9Db21wb3NlZENoaWxkcmVuKG5vZGUsIHBhcmVudCwgY2hpbGRyZW4sIGkpO1xufVxufVxuZnVuY3Rpb24gYWRkTm9kZVRvQ29tcG9zZWRDaGlsZHJlbihub2RlLCBwYXJlbnQsIGNoaWxkcmVuLCBpKSB7XG5ub2RlLl9jb21wb3NlZFBhcmVudCA9IHBhcmVudDtcbmNoaWxkcmVuLnNwbGljZShpID49IDAgPyBpIDogY2hpbGRyZW4ubGVuZ3RoLCAwLCBub2RlKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZUZyb21Db21wb3NlZFBhcmVudChwYXJlbnQsIG5vZGUpIHtcbm5vZGUuX2NvbXBvc2VkUGFyZW50ID0gbnVsbDtcbmlmIChwYXJlbnQpIHtcbnZhciBjaGlsZHJlbiA9IGdldENvbXBvc2VkQ2hpbGRyZW4ocGFyZW50KTtcbnZhciBpID0gY2hpbGRyZW4uaW5kZXhPZihub2RlKTtcbmlmIChpID49IDApIHtcbmNoaWxkcmVuLnNwbGljZShpLCAxKTtcbn1cbn1cbn1cbmZ1bmN0aW9uIHNhdmVMaWdodENoaWxkcmVuSWZOZWVkZWQobm9kZSkge1xuaWYgKCFub2RlLl9saWdodENoaWxkcmVuKSB7XG52YXIgYyQgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChub2RlLmNoaWxkTm9kZXMpO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBjJC5sZW5ndGgsIGNoaWxkOyBpIDwgbCAmJiAoY2hpbGQgPSBjJFtpXSk7IGkrKykge1xuY2hpbGQuX2xpZ2h0UGFyZW50ID0gY2hpbGQuX2xpZ2h0UGFyZW50IHx8IG5vZGU7XG59XG5ub2RlLl9saWdodENoaWxkcmVuID0gYyQ7XG59XG59XG5mdW5jdGlvbiBoYXNJbnNlcnRpb25Qb2ludChyb290KSB7XG5yZXR1cm4gQm9vbGVhbihyb290Ll9pbnNlcnRpb25Qb2ludHMubGVuZ3RoKTtcbn1cbnZhciBwID0gRWxlbWVudC5wcm90b3R5cGU7XG52YXIgbWF0Y2hlc1NlbGVjdG9yID0gcC5tYXRjaGVzIHx8IHAubWF0Y2hlc1NlbGVjdG9yIHx8IHAubW96TWF0Y2hlc1NlbGVjdG9yIHx8IHAubXNNYXRjaGVzU2VsZWN0b3IgfHwgcC5vTWF0Y2hlc1NlbGVjdG9yIHx8IHAud2Via2l0TWF0Y2hlc1NlbGVjdG9yO1xucmV0dXJuIHtcbmdldExpZ2h0Q2hpbGRyZW46IGdldExpZ2h0Q2hpbGRyZW4sXG5nZXRDb21wb3NlZENoaWxkcmVuOiBnZXRDb21wb3NlZENoaWxkcmVuLFxucmVtb3ZlRnJvbUNvbXBvc2VkUGFyZW50OiByZW1vdmVGcm9tQ29tcG9zZWRQYXJlbnQsXG5zYXZlTGlnaHRDaGlsZHJlbklmTmVlZGVkOiBzYXZlTGlnaHRDaGlsZHJlbklmTmVlZGVkLFxubWF0Y2hlc1NlbGVjdG9yOiBtYXRjaGVzU2VsZWN0b3IsXG5oYXNJbnNlcnRpb25Qb2ludDogaGFzSW5zZXJ0aW9uUG9pbnQsXG5jdG9yOiBEb21BcGksXG5mYWN0b3J5OiBmYWN0b3J5XG59O1xufSgpO1xuKGZ1bmN0aW9uICgpIHtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5fcHJlcFNoYWR5OiBmdW5jdGlvbiAoKSB7XG50aGlzLl91c2VDb250ZW50ID0gdGhpcy5fdXNlQ29udGVudCB8fCBCb29sZWFuKHRoaXMuX3RlbXBsYXRlKTtcbn0sXG5fcG9vbENvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLl91c2VDb250ZW50KSB7XG5zYXZlTGlnaHRDaGlsZHJlbklmTmVlZGVkKHRoaXMpO1xufVxufSxcbl9zZXR1cFJvb3Q6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLl91c2VDb250ZW50KSB7XG50aGlzLl9jcmVhdGVMb2NhbFJvb3QoKTtcbmlmICghdGhpcy5kYXRhSG9zdCkge1xudXBncmFkZUxpZ2h0Q2hpbGRyZW4odGhpcy5fbGlnaHRDaGlsZHJlbik7XG59XG59XG59LFxuX2NyZWF0ZUxvY2FsUm9vdDogZnVuY3Rpb24gKCkge1xudGhpcy5zaGFkeVJvb3QgPSB0aGlzLnJvb3Q7XG50aGlzLnNoYWR5Um9vdC5fZGlzdHJpYnV0aW9uQ2xlYW4gPSBmYWxzZTtcbnRoaXMuc2hhZHlSb290Ll9pc1NoYWR5Um9vdCA9IHRydWU7XG50aGlzLnNoYWR5Um9vdC5fZGlydHlSb290cyA9IFtdO1xudGhpcy5zaGFkeVJvb3QuX2luc2VydGlvblBvaW50cyA9ICF0aGlzLl9ub3RlcyB8fCB0aGlzLl9ub3Rlcy5faGFzQ29udGVudCA/IHRoaXMuc2hhZHlSb290LnF1ZXJ5U2VsZWN0b3JBbGwoJ2NvbnRlbnQnKSA6IFtdO1xuc2F2ZUxpZ2h0Q2hpbGRyZW5JZk5lZWRlZCh0aGlzLnNoYWR5Um9vdCk7XG50aGlzLnNoYWR5Um9vdC5ob3N0ID0gdGhpcztcbn0sXG5nZXQgZG9tSG9zdCgpIHtcbnZhciByb290ID0gUG9seW1lci5kb20odGhpcykuZ2V0T3duZXJSb290KCk7XG5yZXR1cm4gcm9vdCAmJiByb290Lmhvc3Q7XG59LFxuZGlzdHJpYnV0ZUNvbnRlbnQ6IGZ1bmN0aW9uICh1cGRhdGVJbnNlcnRpb25Qb2ludHMpIHtcbmlmICh0aGlzLnNoYWR5Um9vdCkge1xudmFyIGRvbSA9IFBvbHltZXIuZG9tKHRoaXMpO1xuaWYgKHVwZGF0ZUluc2VydGlvblBvaW50cykge1xuZG9tLl91cGRhdGVJbnNlcnRpb25Qb2ludHModGhpcyk7XG59XG52YXIgaG9zdCA9IGdldFRvcERpc3RyaWJ1dGluZ0hvc3QodGhpcyk7XG5kb20uX2xhenlEaXN0cmlidXRlKGhvc3QpO1xufVxufSxcbl9kaXN0cmlidXRlQ29udGVudDogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuX3VzZUNvbnRlbnQgJiYgIXRoaXMuc2hhZHlSb290Ll9kaXN0cmlidXRpb25DbGVhbikge1xudGhpcy5fYmVnaW5EaXN0cmlidXRlKCk7XG50aGlzLl9kaXN0cmlidXRlRGlydHlSb290cygpO1xudGhpcy5fZmluaXNoRGlzdHJpYnV0ZSgpO1xufVxufSxcbl9iZWdpbkRpc3RyaWJ1dGU6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLl91c2VDb250ZW50ICYmIGhhc0luc2VydGlvblBvaW50KHRoaXMuc2hhZHlSb290KSkge1xudGhpcy5fcmVzZXREaXN0cmlidXRpb24oKTtcbnRoaXMuX2Rpc3RyaWJ1dGVQb29sKHRoaXMuc2hhZHlSb290LCB0aGlzLl9jb2xsZWN0UG9vbCgpKTtcbn1cbn0sXG5fZGlzdHJpYnV0ZURpcnR5Um9vdHM6IGZ1bmN0aW9uICgpIHtcbnZhciBjJCA9IHRoaXMuc2hhZHlSb290Ll9kaXJ0eVJvb3RzO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBjJC5sZW5ndGgsIGM7IGkgPCBsICYmIChjID0gYyRbaV0pOyBpKyspIHtcbmMuX2Rpc3RyaWJ1dGVDb250ZW50KCk7XG59XG50aGlzLnNoYWR5Um9vdC5fZGlydHlSb290cyA9IFtdO1xufSxcbl9maW5pc2hEaXN0cmlidXRlOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5fdXNlQ29udGVudCkge1xuaWYgKGhhc0luc2VydGlvblBvaW50KHRoaXMuc2hhZHlSb290KSkge1xudGhpcy5fY29tcG9zZVRyZWUoKTtcbn0gZWxzZSB7XG5pZiAoIXRoaXMuc2hhZHlSb290Ll9oYXNEaXN0cmlidXRlZCkge1xudGhpcy50ZXh0Q29udGVudCA9ICcnO1xudGhpcy5fY29tcG9zZWRDaGlsZHJlbiA9IG51bGw7XG50aGlzLmFwcGVuZENoaWxkKHRoaXMuc2hhZHlSb290KTtcbn0gZWxzZSB7XG52YXIgY2hpbGRyZW4gPSB0aGlzLl9jb21wb3NlTm9kZSh0aGlzKTtcbnRoaXMuX3VwZGF0ZUNoaWxkTm9kZXModGhpcywgY2hpbGRyZW4pO1xufVxufVxudGhpcy5zaGFkeVJvb3QuX2hhc0Rpc3RyaWJ1dGVkID0gdHJ1ZTtcbnRoaXMuc2hhZHlSb290Ll9kaXN0cmlidXRpb25DbGVhbiA9IHRydWU7XG59XG59LFxuZWxlbWVudE1hdGNoZXM6IGZ1bmN0aW9uIChzZWxlY3Rvciwgbm9kZSkge1xubm9kZSA9IG5vZGUgfHwgdGhpcztcbnJldHVybiBtYXRjaGVzU2VsZWN0b3IuY2FsbChub2RlLCBzZWxlY3Rvcik7XG59LFxuX3Jlc2V0RGlzdHJpYnV0aW9uOiBmdW5jdGlvbiAoKSB7XG52YXIgY2hpbGRyZW4gPSBnZXRMaWdodENoaWxkcmVuKHRoaXMpO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xudmFyIGNoaWxkID0gY2hpbGRyZW5baV07XG5pZiAoY2hpbGQuX2Rlc3RpbmF0aW9uSW5zZXJ0aW9uUG9pbnRzKSB7XG5jaGlsZC5fZGVzdGluYXRpb25JbnNlcnRpb25Qb2ludHMgPSB1bmRlZmluZWQ7XG59XG5pZiAoaXNJbnNlcnRpb25Qb2ludChjaGlsZCkpIHtcbmNsZWFyRGlzdHJpYnV0ZWREZXN0aW5hdGlvbkluc2VydGlvblBvaW50cyhjaGlsZCk7XG59XG59XG52YXIgcm9vdCA9IHRoaXMuc2hhZHlSb290O1xudmFyIHAkID0gcm9vdC5faW5zZXJ0aW9uUG9pbnRzO1xuZm9yICh2YXIgaiA9IDA7IGogPCBwJC5sZW5ndGg7IGorKykge1xucCRbal0uX2Rpc3RyaWJ1dGVkTm9kZXMgPSBbXTtcbn1cbn0sXG5fY29sbGVjdFBvb2w6IGZ1bmN0aW9uICgpIHtcbnZhciBwb29sID0gW107XG52YXIgY2hpbGRyZW4gPSBnZXRMaWdodENoaWxkcmVuKHRoaXMpO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xudmFyIGNoaWxkID0gY2hpbGRyZW5baV07XG5pZiAoaXNJbnNlcnRpb25Qb2ludChjaGlsZCkpIHtcbnBvb2wucHVzaC5hcHBseShwb29sLCBjaGlsZC5fZGlzdHJpYnV0ZWROb2Rlcyk7XG59IGVsc2Uge1xucG9vbC5wdXNoKGNoaWxkKTtcbn1cbn1cbnJldHVybiBwb29sO1xufSxcbl9kaXN0cmlidXRlUG9vbDogZnVuY3Rpb24gKG5vZGUsIHBvb2wpIHtcbnZhciBwJCA9IG5vZGUuX2luc2VydGlvblBvaW50cztcbmZvciAodmFyIGkgPSAwLCBsID0gcCQubGVuZ3RoLCBwOyBpIDwgbCAmJiAocCA9IHAkW2ldKTsgaSsrKSB7XG50aGlzLl9kaXN0cmlidXRlSW5zZXJ0aW9uUG9pbnQocCwgcG9vbCk7XG5tYXliZVJlZGlzdHJpYnV0ZVBhcmVudChwLCB0aGlzKTtcbn1cbn0sXG5fZGlzdHJpYnV0ZUluc2VydGlvblBvaW50OiBmdW5jdGlvbiAoY29udGVudCwgcG9vbCkge1xudmFyIGFueURpc3RyaWJ1dGVkID0gZmFsc2U7XG5mb3IgKHZhciBpID0gMCwgbCA9IHBvb2wubGVuZ3RoLCBub2RlOyBpIDwgbDsgaSsrKSB7XG5ub2RlID0gcG9vbFtpXTtcbmlmICghbm9kZSkge1xuY29udGludWU7XG59XG5pZiAodGhpcy5fbWF0Y2hlc0NvbnRlbnRTZWxlY3Qobm9kZSwgY29udGVudCkpIHtcbmRpc3RyaWJ1dGVOb2RlSW50byhub2RlLCBjb250ZW50KTtcbnBvb2xbaV0gPSB1bmRlZmluZWQ7XG5hbnlEaXN0cmlidXRlZCA9IHRydWU7XG59XG59XG5pZiAoIWFueURpc3RyaWJ1dGVkKSB7XG52YXIgY2hpbGRyZW4gPSBnZXRMaWdodENoaWxkcmVuKGNvbnRlbnQpO1xuZm9yICh2YXIgaiA9IDA7IGogPCBjaGlsZHJlbi5sZW5ndGg7IGorKykge1xuZGlzdHJpYnV0ZU5vZGVJbnRvKGNoaWxkcmVuW2pdLCBjb250ZW50KTtcbn1cbn1cbn0sXG5fY29tcG9zZVRyZWU6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3VwZGF0ZUNoaWxkTm9kZXModGhpcywgdGhpcy5fY29tcG9zZU5vZGUodGhpcykpO1xudmFyIHAkID0gdGhpcy5zaGFkeVJvb3QuX2luc2VydGlvblBvaW50cztcbmZvciAodmFyIGkgPSAwLCBsID0gcCQubGVuZ3RoLCBwLCBwYXJlbnQ7IGkgPCBsICYmIChwID0gcCRbaV0pOyBpKyspIHtcbnBhcmVudCA9IHAuX2xpZ2h0UGFyZW50IHx8IHAucGFyZW50Tm9kZTtcbmlmICghcGFyZW50Ll91c2VDb250ZW50ICYmIHBhcmVudCAhPT0gdGhpcyAmJiBwYXJlbnQgIT09IHRoaXMuc2hhZHlSb290KSB7XG50aGlzLl91cGRhdGVDaGlsZE5vZGVzKHBhcmVudCwgdGhpcy5fY29tcG9zZU5vZGUocGFyZW50KSk7XG59XG59XG59LFxuX2NvbXBvc2VOb2RlOiBmdW5jdGlvbiAobm9kZSkge1xudmFyIGNoaWxkcmVuID0gW107XG52YXIgYyQgPSBnZXRMaWdodENoaWxkcmVuKG5vZGUuc2hhZHlSb290IHx8IG5vZGUpO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBjJC5sZW5ndGg7IGkrKykge1xudmFyIGNoaWxkID0gYyRbaV07XG5pZiAoaXNJbnNlcnRpb25Qb2ludChjaGlsZCkpIHtcbnZhciBkaXN0cmlidXRlZE5vZGVzID0gY2hpbGQuX2Rpc3RyaWJ1dGVkTm9kZXM7XG5mb3IgKHZhciBqID0gMDsgaiA8IGRpc3RyaWJ1dGVkTm9kZXMubGVuZ3RoOyBqKyspIHtcbnZhciBkaXN0cmlidXRlZE5vZGUgPSBkaXN0cmlidXRlZE5vZGVzW2pdO1xuaWYgKGlzRmluYWxEZXN0aW5hdGlvbihjaGlsZCwgZGlzdHJpYnV0ZWROb2RlKSkge1xuY2hpbGRyZW4ucHVzaChkaXN0cmlidXRlZE5vZGUpO1xufVxufVxufSBlbHNlIHtcbmNoaWxkcmVuLnB1c2goY2hpbGQpO1xufVxufVxucmV0dXJuIGNoaWxkcmVuO1xufSxcbl91cGRhdGVDaGlsZE5vZGVzOiBmdW5jdGlvbiAoY29udGFpbmVyLCBjaGlsZHJlbikge1xudmFyIGNvbXBvc2VkID0gZ2V0Q29tcG9zZWRDaGlsZHJlbihjb250YWluZXIpO1xudmFyIHNwbGljZXMgPSBQb2x5bWVyLkFycmF5U3BsaWNlLmNhbGN1bGF0ZVNwbGljZXMoY2hpbGRyZW4sIGNvbXBvc2VkKTtcbmZvciAodmFyIGkgPSAwLCBkID0gMCwgczsgaSA8IHNwbGljZXMubGVuZ3RoICYmIChzID0gc3BsaWNlc1tpXSk7IGkrKykge1xuZm9yICh2YXIgaiA9IDAsIG47IGogPCBzLnJlbW92ZWQubGVuZ3RoICYmIChuID0gcy5yZW1vdmVkW2pdKTsgaisrKSB7XG5yZW1vdmUobik7XG5jb21wb3NlZC5zcGxpY2Uocy5pbmRleCArIGQsIDEpO1xufVxuZCAtPSBzLmFkZGVkQ291bnQ7XG59XG5mb3IgKHZhciBpID0gMCwgcywgbmV4dDsgaSA8IHNwbGljZXMubGVuZ3RoICYmIChzID0gc3BsaWNlc1tpXSk7IGkrKykge1xubmV4dCA9IGNvbXBvc2VkW3MuaW5kZXhdO1xuZm9yICh2YXIgaiA9IHMuaW5kZXgsIG47IGogPCBzLmluZGV4ICsgcy5hZGRlZENvdW50OyBqKyspIHtcbm4gPSBjaGlsZHJlbltqXTtcbmluc2VydEJlZm9yZShjb250YWluZXIsIG4sIG5leHQpO1xuY29tcG9zZWQuc3BsaWNlKGosIDAsIG4pO1xufVxufVxufSxcbl9tYXRjaGVzQ29udGVudFNlbGVjdDogZnVuY3Rpb24gKG5vZGUsIGNvbnRlbnRFbGVtZW50KSB7XG52YXIgc2VsZWN0ID0gY29udGVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzZWxlY3QnKTtcbmlmICghc2VsZWN0KSB7XG5yZXR1cm4gdHJ1ZTtcbn1cbnNlbGVjdCA9IHNlbGVjdC50cmltKCk7XG5pZiAoIXNlbGVjdCkge1xucmV0dXJuIHRydWU7XG59XG5pZiAoIShub2RlIGluc3RhbmNlb2YgRWxlbWVudCkpIHtcbnJldHVybiBmYWxzZTtcbn1cbnZhciB2YWxpZFNlbGVjdG9ycyA9IC9eKDpub3RcXCgpP1sqLiNbYS16QS1aX3xdLztcbmlmICghdmFsaWRTZWxlY3RvcnMudGVzdChzZWxlY3QpKSB7XG5yZXR1cm4gZmFsc2U7XG59XG5yZXR1cm4gdGhpcy5lbGVtZW50TWF0Y2hlcyhzZWxlY3QsIG5vZGUpO1xufSxcbl9lbGVtZW50QWRkOiBmdW5jdGlvbiAoKSB7XG59LFxuX2VsZW1lbnRSZW1vdmU6IGZ1bmN0aW9uICgpIHtcbn1cbn0pO1xudmFyIHNhdmVMaWdodENoaWxkcmVuSWZOZWVkZWQgPSBQb2x5bWVyLkRvbUFwaS5zYXZlTGlnaHRDaGlsZHJlbklmTmVlZGVkO1xudmFyIGdldExpZ2h0Q2hpbGRyZW4gPSBQb2x5bWVyLkRvbUFwaS5nZXRMaWdodENoaWxkcmVuO1xudmFyIG1hdGNoZXNTZWxlY3RvciA9IFBvbHltZXIuRG9tQXBpLm1hdGNoZXNTZWxlY3RvcjtcbnZhciBoYXNJbnNlcnRpb25Qb2ludCA9IFBvbHltZXIuRG9tQXBpLmhhc0luc2VydGlvblBvaW50O1xudmFyIGdldENvbXBvc2VkQ2hpbGRyZW4gPSBQb2x5bWVyLkRvbUFwaS5nZXRDb21wb3NlZENoaWxkcmVuO1xudmFyIHJlbW92ZUZyb21Db21wb3NlZFBhcmVudCA9IFBvbHltZXIuRG9tQXBpLnJlbW92ZUZyb21Db21wb3NlZFBhcmVudDtcbmZ1bmN0aW9uIGRpc3RyaWJ1dGVOb2RlSW50byhjaGlsZCwgaW5zZXJ0aW9uUG9pbnQpIHtcbmluc2VydGlvblBvaW50Ll9kaXN0cmlidXRlZE5vZGVzLnB1c2goY2hpbGQpO1xudmFyIHBvaW50cyA9IGNoaWxkLl9kZXN0aW5hdGlvbkluc2VydGlvblBvaW50cztcbmlmICghcG9pbnRzKSB7XG5jaGlsZC5fZGVzdGluYXRpb25JbnNlcnRpb25Qb2ludHMgPSBbaW5zZXJ0aW9uUG9pbnRdO1xufSBlbHNlIHtcbnBvaW50cy5wdXNoKGluc2VydGlvblBvaW50KTtcbn1cbn1cbmZ1bmN0aW9uIGNsZWFyRGlzdHJpYnV0ZWREZXN0aW5hdGlvbkluc2VydGlvblBvaW50cyhjb250ZW50KSB7XG52YXIgZSQgPSBjb250ZW50Ll9kaXN0cmlidXRlZE5vZGVzO1xuaWYgKGUkKSB7XG5mb3IgKHZhciBpID0gMDsgaSA8IGUkLmxlbmd0aDsgaSsrKSB7XG52YXIgZCA9IGUkW2ldLl9kZXN0aW5hdGlvbkluc2VydGlvblBvaW50cztcbmlmIChkKSB7XG5kLnNwbGljZShkLmluZGV4T2YoY29udGVudCkgKyAxLCBkLmxlbmd0aCk7XG59XG59XG59XG59XG5mdW5jdGlvbiBtYXliZVJlZGlzdHJpYnV0ZVBhcmVudChjb250ZW50LCBob3N0KSB7XG52YXIgcGFyZW50ID0gY29udGVudC5fbGlnaHRQYXJlbnQ7XG5pZiAocGFyZW50ICYmIHBhcmVudC5zaGFkeVJvb3QgJiYgaGFzSW5zZXJ0aW9uUG9pbnQocGFyZW50LnNoYWR5Um9vdCkgJiYgcGFyZW50LnNoYWR5Um9vdC5fZGlzdHJpYnV0aW9uQ2xlYW4pIHtcbnBhcmVudC5zaGFkeVJvb3QuX2Rpc3RyaWJ1dGlvbkNsZWFuID0gZmFsc2U7XG5ob3N0LnNoYWR5Um9vdC5fZGlydHlSb290cy5wdXNoKHBhcmVudCk7XG59XG59XG5mdW5jdGlvbiBpc0ZpbmFsRGVzdGluYXRpb24oaW5zZXJ0aW9uUG9pbnQsIG5vZGUpIHtcbnZhciBwb2ludHMgPSBub2RlLl9kZXN0aW5hdGlvbkluc2VydGlvblBvaW50cztcbnJldHVybiBwb2ludHMgJiYgcG9pbnRzW3BvaW50cy5sZW5ndGggLSAxXSA9PT0gaW5zZXJ0aW9uUG9pbnQ7XG59XG5mdW5jdGlvbiBpc0luc2VydGlvblBvaW50KG5vZGUpIHtcbnJldHVybiBub2RlLmxvY2FsTmFtZSA9PSAnY29udGVudCc7XG59XG52YXIgbmF0aXZlSW5zZXJ0QmVmb3JlID0gRWxlbWVudC5wcm90b3R5cGUuaW5zZXJ0QmVmb3JlO1xudmFyIG5hdGl2ZVJlbW92ZUNoaWxkID0gRWxlbWVudC5wcm90b3R5cGUucmVtb3ZlQ2hpbGQ7XG5mdW5jdGlvbiBpbnNlcnRCZWZvcmUocGFyZW50Tm9kZSwgbmV3Q2hpbGQsIHJlZkNoaWxkKSB7XG52YXIgbmV3Q2hpbGRQYXJlbnQgPSBnZXRDb21wb3NlZFBhcmVudChuZXdDaGlsZCk7XG5pZiAobmV3Q2hpbGRQYXJlbnQgIT09IHBhcmVudE5vZGUpIHtcbnJlbW92ZUZyb21Db21wb3NlZFBhcmVudChuZXdDaGlsZFBhcmVudCwgbmV3Q2hpbGQpO1xufVxucmVtb3ZlKG5ld0NoaWxkKTtcbnNhdmVMaWdodENoaWxkcmVuSWZOZWVkZWQocGFyZW50Tm9kZSk7XG5uYXRpdmVJbnNlcnRCZWZvcmUuY2FsbChwYXJlbnROb2RlLCBuZXdDaGlsZCwgcmVmQ2hpbGQgfHwgbnVsbCk7XG5uZXdDaGlsZC5fY29tcG9zZWRQYXJlbnQgPSBwYXJlbnROb2RlO1xufVxuZnVuY3Rpb24gcmVtb3ZlKG5vZGUpIHtcbnZhciBwYXJlbnROb2RlID0gZ2V0Q29tcG9zZWRQYXJlbnQobm9kZSk7XG5pZiAocGFyZW50Tm9kZSkge1xuc2F2ZUxpZ2h0Q2hpbGRyZW5JZk5lZWRlZChwYXJlbnROb2RlKTtcbm5vZGUuX2NvbXBvc2VkUGFyZW50ID0gbnVsbDtcbm5hdGl2ZVJlbW92ZUNoaWxkLmNhbGwocGFyZW50Tm9kZSwgbm9kZSk7XG59XG59XG5mdW5jdGlvbiBnZXRDb21wb3NlZFBhcmVudChub2RlKSB7XG5yZXR1cm4gbm9kZS5fX3BhdGNoZWQgPyBub2RlLl9jb21wb3NlZFBhcmVudCA6IG5vZGUucGFyZW50Tm9kZTtcbn1cbmZ1bmN0aW9uIGdldFRvcERpc3RyaWJ1dGluZ0hvc3QoaG9zdCkge1xud2hpbGUgKGhvc3QgJiYgaG9zdE5lZWRzUmVkaXN0cmlidXRpb24oaG9zdCkpIHtcbmhvc3QgPSBob3N0LmRvbUhvc3Q7XG59XG5yZXR1cm4gaG9zdDtcbn1cbmZ1bmN0aW9uIGhvc3ROZWVkc1JlZGlzdHJpYnV0aW9uKGhvc3QpIHtcbnZhciBjJCA9IFBvbHltZXIuZG9tKGhvc3QpLmNoaWxkcmVuO1xuZm9yICh2YXIgaSA9IDAsIGM7IGkgPCBjJC5sZW5ndGg7IGkrKykge1xuYyA9IGMkW2ldO1xuaWYgKGMubG9jYWxOYW1lID09PSAnY29udGVudCcpIHtcbnJldHVybiBob3N0LmRvbUhvc3Q7XG59XG59XG59XG52YXIgbmVlZHNVcGdyYWRlID0gd2luZG93LkN1c3RvbUVsZW1lbnRzICYmICFDdXN0b21FbGVtZW50cy51c2VOYXRpdmU7XG5mdW5jdGlvbiB1cGdyYWRlTGlnaHRDaGlsZHJlbihjaGlsZHJlbikge1xuaWYgKG5lZWRzVXBncmFkZSAmJiBjaGlsZHJlbikge1xuZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuQ3VzdG9tRWxlbWVudHMudXBncmFkZShjaGlsZHJlbltpXSk7XG59XG59XG59XG59KCkpO1xuaWYgKFBvbHltZXIuU2V0dGluZ3MudXNlU2hhZG93KSB7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX3Bvb2xDb250ZW50OiBmdW5jdGlvbiAoKSB7XG59LFxuX2JlZ2luRGlzdHJpYnV0ZTogZnVuY3Rpb24gKCkge1xufSxcbmRpc3RyaWJ1dGVDb250ZW50OiBmdW5jdGlvbiAoKSB7XG59LFxuX2Rpc3RyaWJ1dGVDb250ZW50OiBmdW5jdGlvbiAoKSB7XG59LFxuX2ZpbmlzaERpc3RyaWJ1dGU6IGZ1bmN0aW9uICgpIHtcbn0sXG5fY3JlYXRlTG9jYWxSb290OiBmdW5jdGlvbiAoKSB7XG50aGlzLmNyZWF0ZVNoYWRvd1Jvb3QoKTtcbnRoaXMuc2hhZG93Um9vdC5hcHBlbmRDaGlsZCh0aGlzLnJvb3QpO1xudGhpcy5yb290ID0gdGhpcy5zaGFkb3dSb290O1xufVxufSk7XG59XG5Qb2x5bWVyLkRvbU1vZHVsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RvbS1tb2R1bGUnKTtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5fcmVnaXN0ZXJGZWF0dXJlczogZnVuY3Rpb24gKCkge1xudGhpcy5fcHJlcElzKCk7XG50aGlzLl9wcmVwQXR0cmlidXRlcygpO1xudGhpcy5fcHJlcEJlaGF2aW9ycygpO1xudGhpcy5fcHJlcEV4dGVuZHMoKTtcbnRoaXMuX3ByZXBDb25zdHJ1Y3RvcigpO1xudGhpcy5fcHJlcFRlbXBsYXRlKCk7XG50aGlzLl9wcmVwU2hhZHkoKTtcbn0sXG5fcHJlcEJlaGF2aW9yOiBmdW5jdGlvbiAoYikge1xudGhpcy5fYWRkSG9zdEF0dHJpYnV0ZXMoYi5ob3N0QXR0cmlidXRlcyk7XG59LFxuX2luaXRGZWF0dXJlczogZnVuY3Rpb24gKCkge1xudGhpcy5fcG9vbENvbnRlbnQoKTtcbnRoaXMuX3B1c2hIb3N0KCk7XG50aGlzLl9zdGFtcFRlbXBsYXRlKCk7XG50aGlzLl9wb3BIb3N0KCk7XG50aGlzLl9tYXJzaGFsSG9zdEF0dHJpYnV0ZXMoKTtcbnRoaXMuX3NldHVwRGVib3VuY2VycygpO1xudGhpcy5fbWFyc2hhbEJlaGF2aW9ycygpO1xudGhpcy5fdHJ5UmVhZHkoKTtcbn0sXG5fbWFyc2hhbEJlaGF2aW9yOiBmdW5jdGlvbiAoYikge1xufVxufSk7XG59KSgpO1xuXG59KSIsInJlcXVpcmUoXCIuL3BvbHltZXItbWluaS5odG1sXCIpO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixmdW5jdGlvbigpIHtcbjsoZnVuY3Rpb24oKSB7XG5Qb2x5bWVyLm5hciA9IFtdO1xuUG9seW1lci5Bbm5vdGF0aW9ucyA9IHtcbnBhcnNlQW5ub3RhdGlvbnM6IGZ1bmN0aW9uICh0ZW1wbGF0ZSkge1xudmFyIGxpc3QgPSBbXTtcbnZhciBjb250ZW50ID0gdGVtcGxhdGUuX2NvbnRlbnQgfHwgdGVtcGxhdGUuY29udGVudDtcbnRoaXMuX3BhcnNlTm9kZUFubm90YXRpb25zKGNvbnRlbnQsIGxpc3QpO1xucmV0dXJuIGxpc3Q7XG59LFxuX3BhcnNlTm9kZUFubm90YXRpb25zOiBmdW5jdGlvbiAobm9kZSwgbGlzdCkge1xucmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFID8gdGhpcy5fcGFyc2VUZXh0Tm9kZUFubm90YXRpb24obm9kZSwgbGlzdCkgOiB0aGlzLl9wYXJzZUVsZW1lbnRBbm5vdGF0aW9ucyhub2RlLCBsaXN0KTtcbn0sXG5fdGVzdEVzY2FwZTogZnVuY3Rpb24gKHZhbHVlKSB7XG52YXIgZXNjYXBlID0gdmFsdWUuc2xpY2UoMCwgMik7XG5pZiAoZXNjYXBlID09PSAne3snIHx8IGVzY2FwZSA9PT0gJ1tbJykge1xucmV0dXJuIGVzY2FwZTtcbn1cbn0sXG5fcGFyc2VUZXh0Tm9kZUFubm90YXRpb246IGZ1bmN0aW9uIChub2RlLCBsaXN0KSB7XG52YXIgdiA9IG5vZGUudGV4dENvbnRlbnQ7XG52YXIgZXNjYXBlID0gdGhpcy5fdGVzdEVzY2FwZSh2KTtcbmlmIChlc2NhcGUpIHtcbm5vZGUudGV4dENvbnRlbnQgPSAnICc7XG52YXIgYW5ub3RlID0ge1xuYmluZGluZ3M6IFt7XG5raW5kOiAndGV4dCcsXG5tb2RlOiBlc2NhcGVbMF0sXG52YWx1ZTogdi5zbGljZSgyLCAtMikudHJpbSgpXG59XVxufTtcbmxpc3QucHVzaChhbm5vdGUpO1xucmV0dXJuIGFubm90ZTtcbn1cbn0sXG5fcGFyc2VFbGVtZW50QW5ub3RhdGlvbnM6IGZ1bmN0aW9uIChlbGVtZW50LCBsaXN0KSB7XG52YXIgYW5ub3RlID0ge1xuYmluZGluZ3M6IFtdLFxuZXZlbnRzOiBbXVxufTtcbmlmIChlbGVtZW50LmxvY2FsTmFtZSA9PT0gJ2NvbnRlbnQnKSB7XG5saXN0Ll9oYXNDb250ZW50ID0gdHJ1ZTtcbn1cbnRoaXMuX3BhcnNlQ2hpbGROb2Rlc0Fubm90YXRpb25zKGVsZW1lbnQsIGFubm90ZSwgbGlzdCk7XG5pZiAoZWxlbWVudC5hdHRyaWJ1dGVzKSB7XG50aGlzLl9wYXJzZU5vZGVBdHRyaWJ1dGVBbm5vdGF0aW9ucyhlbGVtZW50LCBhbm5vdGUsIGxpc3QpO1xuaWYgKHRoaXMucHJlcEVsZW1lbnQpIHtcbnRoaXMucHJlcEVsZW1lbnQoZWxlbWVudCk7XG59XG59XG5pZiAoYW5ub3RlLmJpbmRpbmdzLmxlbmd0aCB8fCBhbm5vdGUuZXZlbnRzLmxlbmd0aCB8fCBhbm5vdGUuaWQpIHtcbmxpc3QucHVzaChhbm5vdGUpO1xufVxucmV0dXJuIGFubm90ZTtcbn0sXG5fcGFyc2VDaGlsZE5vZGVzQW5ub3RhdGlvbnM6IGZ1bmN0aW9uIChyb290LCBhbm5vdGUsIGxpc3QsIGNhbGxiYWNrKSB7XG5pZiAocm9vdC5maXJzdENoaWxkKSB7XG5mb3IgKHZhciBpID0gMCwgbm9kZSA9IHJvb3QuZmlyc3RDaGlsZDsgbm9kZTsgbm9kZSA9IG5vZGUubmV4dFNpYmxpbmcsIGkrKykge1xuaWYgKG5vZGUubG9jYWxOYW1lID09PSAndGVtcGxhdGUnICYmICFub2RlLmhhc0F0dHJpYnV0ZSgncHJlc2VydmUtY29udGVudCcpKSB7XG50aGlzLl9wYXJzZVRlbXBsYXRlKG5vZGUsIGksIGxpc3QsIGFubm90ZSk7XG59XG52YXIgY2hpbGRBbm5vdGF0aW9uID0gdGhpcy5fcGFyc2VOb2RlQW5ub3RhdGlvbnMobm9kZSwgbGlzdCwgY2FsbGJhY2spO1xuaWYgKGNoaWxkQW5ub3RhdGlvbikge1xuY2hpbGRBbm5vdGF0aW9uLnBhcmVudCA9IGFubm90ZTtcbmNoaWxkQW5ub3RhdGlvbi5pbmRleCA9IGk7XG59XG59XG59XG59LFxuX3BhcnNlVGVtcGxhdGU6IGZ1bmN0aW9uIChub2RlLCBpbmRleCwgbGlzdCwgcGFyZW50KSB7XG52YXIgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbmNvbnRlbnQuX25vdGVzID0gdGhpcy5wYXJzZUFubm90YXRpb25zKG5vZGUpO1xuY29udGVudC5hcHBlbmRDaGlsZChub2RlLmNvbnRlbnQpO1xubGlzdC5wdXNoKHtcbmJpbmRpbmdzOiBQb2x5bWVyLm5hcixcbmV2ZW50czogUG9seW1lci5uYXIsXG50ZW1wbGF0ZUNvbnRlbnQ6IGNvbnRlbnQsXG5wYXJlbnQ6IHBhcmVudCxcbmluZGV4OiBpbmRleFxufSk7XG59LFxuX3BhcnNlTm9kZUF0dHJpYnV0ZUFubm90YXRpb25zOiBmdW5jdGlvbiAobm9kZSwgYW5ub3RhdGlvbikge1xuZm9yICh2YXIgaSA9IG5vZGUuYXR0cmlidXRlcy5sZW5ndGggLSAxLCBhOyBhID0gbm9kZS5hdHRyaWJ1dGVzW2ldOyBpLS0pIHtcbnZhciBuID0gYS5uYW1lLCB2ID0gYS52YWx1ZTtcbmlmIChuID09PSAnaWQnICYmICF0aGlzLl90ZXN0RXNjYXBlKHYpKSB7XG5hbm5vdGF0aW9uLmlkID0gdjtcbn0gZWxzZSBpZiAobi5zbGljZSgwLCAzKSA9PT0gJ29uLScpIHtcbm5vZGUucmVtb3ZlQXR0cmlidXRlKG4pO1xuYW5ub3RhdGlvbi5ldmVudHMucHVzaCh7XG5uYW1lOiBuLnNsaWNlKDMpLFxudmFsdWU6IHZcbn0pO1xufSBlbHNlIHtcbnZhciBiID0gdGhpcy5fcGFyc2VOb2RlQXR0cmlidXRlQW5ub3RhdGlvbihub2RlLCBuLCB2KTtcbmlmIChiKSB7XG5hbm5vdGF0aW9uLmJpbmRpbmdzLnB1c2goYik7XG59XG59XG59XG59LFxuX3BhcnNlTm9kZUF0dHJpYnV0ZUFubm90YXRpb246IGZ1bmN0aW9uIChub2RlLCBuLCB2KSB7XG52YXIgZXNjYXBlID0gdGhpcy5fdGVzdEVzY2FwZSh2KTtcbmlmIChlc2NhcGUpIHtcbnZhciBjdXN0b21FdmVudDtcbnZhciBuYW1lID0gbjtcbnZhciBtb2RlID0gZXNjYXBlWzBdO1xudiA9IHYuc2xpY2UoMiwgLTIpLnRyaW0oKTtcbnZhciBub3QgPSBmYWxzZTtcbmlmICh2WzBdID09ICchJykge1xudiA9IHYuc3Vic3RyaW5nKDEpO1xubm90ID0gdHJ1ZTtcbn1cbnZhciBraW5kID0gJ3Byb3BlcnR5JztcbmlmIChuW24ubGVuZ3RoIC0gMV0gPT0gJyQnKSB7XG5uYW1lID0gbi5zbGljZSgwLCAtMSk7XG5raW5kID0gJ2F0dHJpYnV0ZSc7XG59XG52YXIgbm90aWZ5RXZlbnQsIGNvbG9uO1xuaWYgKG1vZGUgPT0gJ3snICYmIChjb2xvbiA9IHYuaW5kZXhPZignOjonKSkgPiAwKSB7XG5ub3RpZnlFdmVudCA9IHYuc3Vic3RyaW5nKGNvbG9uICsgMik7XG52ID0gdi5zdWJzdHJpbmcoMCwgY29sb24pO1xuY3VzdG9tRXZlbnQgPSB0cnVlO1xufVxuaWYgKG5vZGUubG9jYWxOYW1lID09ICdpbnB1dCcgJiYgbiA9PSAndmFsdWUnKSB7XG5ub2RlLnNldEF0dHJpYnV0ZShuLCAnJyk7XG59XG5ub2RlLnJlbW92ZUF0dHJpYnV0ZShuKTtcbmlmIChraW5kID09PSAncHJvcGVydHknKSB7XG5uYW1lID0gUG9seW1lci5DYXNlTWFwLmRhc2hUb0NhbWVsQ2FzZShuYW1lKTtcbn1cbnJldHVybiB7XG5raW5kOiBraW5kLFxubW9kZTogbW9kZSxcbm5hbWU6IG5hbWUsXG52YWx1ZTogdixcbm5lZ2F0ZTogbm90LFxuZXZlbnQ6IG5vdGlmeUV2ZW50LFxuY3VzdG9tRXZlbnQ6IGN1c3RvbUV2ZW50XG59O1xufVxufSxcbl9sb2NhbFN1YlRyZWU6IGZ1bmN0aW9uIChub2RlLCBob3N0KSB7XG5yZXR1cm4gbm9kZSA9PT0gaG9zdCA/IG5vZGUuY2hpbGROb2RlcyA6IG5vZGUuX2xpZ2h0Q2hpbGRyZW4gfHwgbm9kZS5jaGlsZE5vZGVzO1xufSxcbmZpbmRBbm5vdGF0ZWROb2RlOiBmdW5jdGlvbiAocm9vdCwgYW5ub3RlKSB7XG52YXIgcGFyZW50ID0gYW5ub3RlLnBhcmVudCAmJiBQb2x5bWVyLkFubm90YXRpb25zLmZpbmRBbm5vdGF0ZWROb2RlKHJvb3QsIGFubm90ZS5wYXJlbnQpO1xucmV0dXJuICFwYXJlbnQgPyByb290IDogUG9seW1lci5Bbm5vdGF0aW9ucy5fbG9jYWxTdWJUcmVlKHBhcmVudCwgcm9vdClbYW5ub3RlLmluZGV4XTtcbn1cbn07XG4oZnVuY3Rpb24gKCkge1xuZnVuY3Rpb24gcmVzb2x2ZUNzcyhjc3NUZXh0LCBvd25lckRvY3VtZW50KSB7XG5yZXR1cm4gY3NzVGV4dC5yZXBsYWNlKENTU19VUkxfUlgsIGZ1bmN0aW9uIChtLCBwcmUsIHVybCwgcG9zdCkge1xucmV0dXJuIHByZSArICdcXCcnICsgcmVzb2x2ZSh1cmwucmVwbGFjZSgvW1wiJ10vZywgJycpLCBvd25lckRvY3VtZW50KSArICdcXCcnICsgcG9zdDtcbn0pO1xufVxuZnVuY3Rpb24gcmVzb2x2ZUF0dHJzKGVsZW1lbnQsIG93bmVyRG9jdW1lbnQpIHtcbmZvciAodmFyIG5hbWUgaW4gVVJMX0FUVFJTKSB7XG52YXIgYSQgPSBVUkxfQVRUUlNbbmFtZV07XG5mb3IgKHZhciBpID0gMCwgbCA9IGEkLmxlbmd0aCwgYSwgYXQsIHY7IGkgPCBsICYmIChhID0gYSRbaV0pOyBpKyspIHtcbmlmIChuYW1lID09PSAnKicgfHwgZWxlbWVudC5sb2NhbE5hbWUgPT09IG5hbWUpIHtcbmF0ID0gZWxlbWVudC5hdHRyaWJ1dGVzW2FdO1xudiA9IGF0ICYmIGF0LnZhbHVlO1xuaWYgKHYgJiYgdi5zZWFyY2goQklORElOR19SWCkgPCAwKSB7XG5hdC52YWx1ZSA9IGEgPT09ICdzdHlsZScgPyByZXNvbHZlQ3NzKHYsIG93bmVyRG9jdW1lbnQpIDogcmVzb2x2ZSh2LCBvd25lckRvY3VtZW50KTtcbn1cbn1cbn1cbn1cbn1cbmZ1bmN0aW9uIHJlc29sdmUodXJsLCBvd25lckRvY3VtZW50KSB7XG5pZiAodXJsICYmIHVybFswXSA9PT0gJyMnKSB7XG5yZXR1cm4gdXJsO1xufVxudmFyIHJlc29sdmVyID0gZ2V0VXJsUmVzb2x2ZXIob3duZXJEb2N1bWVudCk7XG5yZXNvbHZlci5ocmVmID0gdXJsO1xucmV0dXJuIHJlc29sdmVyLmhyZWYgfHwgdXJsO1xufVxudmFyIHRlbXBEb2M7XG52YXIgdGVtcERvY0Jhc2U7XG5mdW5jdGlvbiByZXNvbHZlVXJsKHVybCwgYmFzZVVyaSkge1xuaWYgKCF0ZW1wRG9jKSB7XG50ZW1wRG9jID0gZG9jdW1lbnQuaW1wbGVtZW50YXRpb24uY3JlYXRlSFRNTERvY3VtZW50KCd0ZW1wJyk7XG50ZW1wRG9jQmFzZSA9IHRlbXBEb2MuY3JlYXRlRWxlbWVudCgnYmFzZScpO1xudGVtcERvYy5oZWFkLmFwcGVuZENoaWxkKHRlbXBEb2NCYXNlKTtcbn1cbnRlbXBEb2NCYXNlLmhyZWYgPSBiYXNlVXJpO1xucmV0dXJuIHJlc29sdmUodXJsLCB0ZW1wRG9jKTtcbn1cbmZ1bmN0aW9uIGdldFVybFJlc29sdmVyKG93bmVyRG9jdW1lbnQpIHtcbnJldHVybiBvd25lckRvY3VtZW50Ll9fdXJsUmVzb2x2ZXIgfHwgKG93bmVyRG9jdW1lbnQuX191cmxSZXNvbHZlciA9IG93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpKTtcbn1cbnZhciBDU1NfVVJMX1JYID0gLyh1cmxcXCgpKFteKV0qKShcXCkpL2c7XG52YXIgVVJMX0FUVFJTID0ge1xuJyonOiBbXG4naHJlZicsXG4nc3JjJyxcbidzdHlsZScsXG4ndXJsJ1xuXSxcbmZvcm06IFsnYWN0aW9uJ11cbn07XG52YXIgQklORElOR19SWCA9IC9cXHtcXHt8XFxbXFxbLztcblBvbHltZXIuUmVzb2x2ZVVybCA9IHtcbnJlc29sdmVDc3M6IHJlc29sdmVDc3MsXG5yZXNvbHZlQXR0cnM6IHJlc29sdmVBdHRycyxcbnJlc29sdmVVcmw6IHJlc29sdmVVcmxcbn07XG59KCkpO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9wcmVwQW5ub3RhdGlvbnM6IGZ1bmN0aW9uICgpIHtcbmlmICghdGhpcy5fdGVtcGxhdGUpIHtcbnRoaXMuX25vdGVzID0gW107XG59IGVsc2Uge1xuUG9seW1lci5Bbm5vdGF0aW9ucy5wcmVwRWxlbWVudCA9IHRoaXMuX3ByZXBFbGVtZW50LmJpbmQodGhpcyk7XG50aGlzLl9ub3RlcyA9IFBvbHltZXIuQW5ub3RhdGlvbnMucGFyc2VBbm5vdGF0aW9ucyh0aGlzLl90ZW1wbGF0ZSk7XG50aGlzLl9wcm9jZXNzQW5ub3RhdGlvbnModGhpcy5fbm90ZXMpO1xuUG9seW1lci5Bbm5vdGF0aW9ucy5wcmVwRWxlbWVudCA9IG51bGw7XG59XG59LFxuX3Byb2Nlc3NBbm5vdGF0aW9uczogZnVuY3Rpb24gKG5vdGVzKSB7XG5mb3IgKHZhciBpID0gMDsgaSA8IG5vdGVzLmxlbmd0aDsgaSsrKSB7XG52YXIgbm90ZSA9IG5vdGVzW2ldO1xuZm9yICh2YXIgaiA9IDA7IGogPCBub3RlLmJpbmRpbmdzLmxlbmd0aDsgaisrKSB7XG52YXIgYiA9IG5vdGUuYmluZGluZ3Nbal07XG5iLnNpZ25hdHVyZSA9IHRoaXMuX3BhcnNlTWV0aG9kKGIudmFsdWUpO1xuaWYgKCFiLnNpZ25hdHVyZSkge1xuYi5tb2RlbCA9IHRoaXMuX21vZGVsRm9yUGF0aChiLnZhbHVlKTtcbn1cbn1cbmlmIChub3RlLnRlbXBsYXRlQ29udGVudCkge1xudGhpcy5fcHJvY2Vzc0Fubm90YXRpb25zKG5vdGUudGVtcGxhdGVDb250ZW50Ll9ub3Rlcyk7XG52YXIgcHAgPSBub3RlLnRlbXBsYXRlQ29udGVudC5fcGFyZW50UHJvcHMgPSB0aGlzLl9kaXNjb3ZlclRlbXBsYXRlUGFyZW50UHJvcHMobm90ZS50ZW1wbGF0ZUNvbnRlbnQuX25vdGVzKTtcbnZhciBiaW5kaW5ncyA9IFtdO1xuZm9yICh2YXIgcHJvcCBpbiBwcCkge1xuYmluZGluZ3MucHVzaCh7XG5pbmRleDogbm90ZS5pbmRleCxcbmtpbmQ6ICdwcm9wZXJ0eScsXG5tb2RlOiAneycsXG5uYW1lOiAnX3BhcmVudF8nICsgcHJvcCxcbm1vZGVsOiBwcm9wLFxudmFsdWU6IHByb3Bcbn0pO1xufVxubm90ZS5iaW5kaW5ncyA9IG5vdGUuYmluZGluZ3MuY29uY2F0KGJpbmRpbmdzKTtcbn1cbn1cbn0sXG5fZGlzY292ZXJUZW1wbGF0ZVBhcmVudFByb3BzOiBmdW5jdGlvbiAobm90ZXMpIHtcbnZhciBwcCA9IHt9O1xubm90ZXMuZm9yRWFjaChmdW5jdGlvbiAobikge1xubi5iaW5kaW5ncy5mb3JFYWNoKGZ1bmN0aW9uIChiKSB7XG5pZiAoYi5zaWduYXR1cmUpIHtcbnZhciBhcmdzID0gYi5zaWduYXR1cmUuYXJncztcbmZvciAodmFyIGsgPSAwOyBrIDwgYXJncy5sZW5ndGg7IGsrKykge1xucHBbYXJnc1trXS5tb2RlbF0gPSB0cnVlO1xufVxufSBlbHNlIHtcbnBwW2IubW9kZWxdID0gdHJ1ZTtcbn1cbn0pO1xuaWYgKG4udGVtcGxhdGVDb250ZW50KSB7XG52YXIgdHBwID0gbi50ZW1wbGF0ZUNvbnRlbnQuX3BhcmVudFByb3BzO1xuUG9seW1lci5CYXNlLm1peGluKHBwLCB0cHApO1xufVxufSk7XG5yZXR1cm4gcHA7XG59LFxuX3ByZXBFbGVtZW50OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuUG9seW1lci5SZXNvbHZlVXJsLnJlc29sdmVBdHRycyhlbGVtZW50LCB0aGlzLl90ZW1wbGF0ZS5vd25lckRvY3VtZW50KTtcbn0sXG5fZmluZEFubm90YXRlZE5vZGU6IFBvbHltZXIuQW5ub3RhdGlvbnMuZmluZEFubm90YXRlZE5vZGUsXG5fbWFyc2hhbEFubm90YXRpb25SZWZlcmVuY2VzOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5fdGVtcGxhdGUpIHtcbnRoaXMuX21hcnNoYWxJZE5vZGVzKCk7XG50aGlzLl9tYXJzaGFsQW5ub3RhdGVkTm9kZXMoKTtcbnRoaXMuX21hcnNoYWxBbm5vdGF0ZWRMaXN0ZW5lcnMoKTtcbn1cbn0sXG5fY29uZmlndXJlQW5ub3RhdGlvblJlZmVyZW5jZXM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX2NvbmZpZ3VyZVRlbXBsYXRlQ29udGVudCgpO1xufSxcbl9jb25maWd1cmVUZW1wbGF0ZUNvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX25vdGVzLmZvckVhY2goZnVuY3Rpb24gKG5vdGUsIGkpIHtcbmlmIChub3RlLnRlbXBsYXRlQ29udGVudCkge1xudGhpcy5fbm9kZXNbaV0uX2NvbnRlbnQgPSBub3RlLnRlbXBsYXRlQ29udGVudDtcbn1cbn0sIHRoaXMpO1xufSxcbl9tYXJzaGFsSWROb2RlczogZnVuY3Rpb24gKCkge1xudGhpcy4kID0ge307XG50aGlzLl9ub3Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChhKSB7XG5pZiAoYS5pZCkge1xudGhpcy4kW2EuaWRdID0gdGhpcy5fZmluZEFubm90YXRlZE5vZGUodGhpcy5yb290LCBhKTtcbn1cbn0sIHRoaXMpO1xufSxcbl9tYXJzaGFsQW5ub3RhdGVkTm9kZXM6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLl9ub2Rlcykge1xudGhpcy5fbm9kZXMgPSB0aGlzLl9ub2Rlcy5tYXAoZnVuY3Rpb24gKGEpIHtcbnJldHVybiB0aGlzLl9maW5kQW5ub3RhdGVkTm9kZSh0aGlzLnJvb3QsIGEpO1xufSwgdGhpcyk7XG59XG59LFxuX21hcnNoYWxBbm5vdGF0ZWRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX25vdGVzLmZvckVhY2goZnVuY3Rpb24gKGEpIHtcbmlmIChhLmV2ZW50cyAmJiBhLmV2ZW50cy5sZW5ndGgpIHtcbnZhciBub2RlID0gdGhpcy5fZmluZEFubm90YXRlZE5vZGUodGhpcy5yb290LCBhKTtcbmEuZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbnRoaXMubGlzdGVuKG5vZGUsIGUubmFtZSwgZS52YWx1ZSk7XG59LCB0aGlzKTtcbn1cbn0sIHRoaXMpO1xufVxufSk7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xubGlzdGVuZXJzOiB7fSxcbl9saXN0ZW5MaXN0ZW5lcnM6IGZ1bmN0aW9uIChsaXN0ZW5lcnMpIHtcbnZhciBub2RlLCBuYW1lLCBrZXk7XG5mb3IgKGtleSBpbiBsaXN0ZW5lcnMpIHtcbmlmIChrZXkuaW5kZXhPZignLicpIDwgMCkge1xubm9kZSA9IHRoaXM7XG5uYW1lID0ga2V5O1xufSBlbHNlIHtcbm5hbWUgPSBrZXkuc3BsaXQoJy4nKTtcbm5vZGUgPSB0aGlzLiRbbmFtZVswXV07XG5uYW1lID0gbmFtZVsxXTtcbn1cbnRoaXMubGlzdGVuKG5vZGUsIG5hbWUsIGxpc3RlbmVyc1trZXldKTtcbn1cbn0sXG5saXN0ZW46IGZ1bmN0aW9uIChub2RlLCBldmVudE5hbWUsIG1ldGhvZE5hbWUpIHtcbnRoaXMuX2xpc3Rlbihub2RlLCBldmVudE5hbWUsIHRoaXMuX2NyZWF0ZUV2ZW50SGFuZGxlcihub2RlLCBldmVudE5hbWUsIG1ldGhvZE5hbWUpKTtcbn0sXG5fYm91bmRMaXN0ZW5lcktleTogZnVuY3Rpb24gKGV2ZW50TmFtZSwgbWV0aG9kTmFtZSkge1xucmV0dXJuIGV2ZW50TmFtZSArICc6JyArIG1ldGhvZE5hbWU7XG59LFxuX3JlY29yZEV2ZW50SGFuZGxlcjogZnVuY3Rpb24gKGhvc3QsIGV2ZW50TmFtZSwgdGFyZ2V0LCBtZXRob2ROYW1lLCBoYW5kbGVyKSB7XG52YXIgaGJsID0gaG9zdC5fX2JvdW5kTGlzdGVuZXJzO1xuaWYgKCFoYmwpIHtcbmhibCA9IGhvc3QuX19ib3VuZExpc3RlbmVycyA9IG5ldyBXZWFrTWFwKCk7XG59XG52YXIgYmwgPSBoYmwuZ2V0KHRhcmdldCk7XG5pZiAoIWJsKSB7XG5ibCA9IHt9O1xuaGJsLnNldCh0YXJnZXQsIGJsKTtcbn1cbnZhciBrZXkgPSB0aGlzLl9ib3VuZExpc3RlbmVyS2V5KGV2ZW50TmFtZSwgbWV0aG9kTmFtZSk7XG5ibFtrZXldID0gaGFuZGxlcjtcbn0sXG5fcmVjYWxsRXZlbnRIYW5kbGVyOiBmdW5jdGlvbiAoaG9zdCwgZXZlbnROYW1lLCB0YXJnZXQsIG1ldGhvZE5hbWUpIHtcbnZhciBoYmwgPSBob3N0Ll9fYm91bmRMaXN0ZW5lcnM7XG5pZiAoIWhibCkge1xucmV0dXJuO1xufVxudmFyIGJsID0gaGJsLmdldCh0YXJnZXQpO1xuaWYgKCFibCkge1xucmV0dXJuO1xufVxudmFyIGtleSA9IHRoaXMuX2JvdW5kTGlzdGVuZXJLZXkoZXZlbnROYW1lLCBtZXRob2ROYW1lKTtcbnJldHVybiBibFtrZXldO1xufSxcbl9jcmVhdGVFdmVudEhhbmRsZXI6IGZ1bmN0aW9uIChub2RlLCBldmVudE5hbWUsIG1ldGhvZE5hbWUpIHtcbnZhciBob3N0ID0gdGhpcztcbnZhciBoYW5kbGVyID0gZnVuY3Rpb24gKGUpIHtcbmlmIChob3N0W21ldGhvZE5hbWVdKSB7XG5ob3N0W21ldGhvZE5hbWVdKGUsIGUuZGV0YWlsKTtcbn0gZWxzZSB7XG5ob3N0Ll93YXJuKGhvc3QuX2xvZ2YoJ19jcmVhdGVFdmVudEhhbmRsZXInLCAnbGlzdGVuZXIgbWV0aG9kIGAnICsgbWV0aG9kTmFtZSArICdgIG5vdCBkZWZpbmVkJykpO1xufVxufTtcbnRoaXMuX3JlY29yZEV2ZW50SGFuZGxlcihob3N0LCBldmVudE5hbWUsIG5vZGUsIG1ldGhvZE5hbWUsIGhhbmRsZXIpO1xucmV0dXJuIGhhbmRsZXI7XG59LFxudW5saXN0ZW46IGZ1bmN0aW9uIChub2RlLCBldmVudE5hbWUsIG1ldGhvZE5hbWUpIHtcbnZhciBoYW5kbGVyID0gdGhpcy5fcmVjYWxsRXZlbnRIYW5kbGVyKHRoaXMsIGV2ZW50TmFtZSwgbm9kZSwgbWV0aG9kTmFtZSk7XG5pZiAoaGFuZGxlcikge1xudGhpcy5fdW5saXN0ZW4obm9kZSwgZXZlbnROYW1lLCBoYW5kbGVyKTtcbn1cbn0sXG5fbGlzdGVuOiBmdW5jdGlvbiAobm9kZSwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG5ub2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyKTtcbn0sXG5fdW5saXN0ZW46IGZ1bmN0aW9uIChub2RlLCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbm5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIpO1xufVxufSk7XG4oZnVuY3Rpb24gKCkge1xuJ3VzZSBzdHJpY3QnO1xudmFyIEhBU19OQVRJVkVfVEEgPSB0eXBlb2YgZG9jdW1lbnQuaGVhZC5zdHlsZS50b3VjaEFjdGlvbiA9PT0gJ3N0cmluZyc7XG52YXIgR0VTVFVSRV9LRVkgPSAnX19wb2x5bWVyR2VzdHVyZXMnO1xudmFyIEhBTkRMRURfT0JKID0gJ19fcG9seW1lckdlc3R1cmVzSGFuZGxlZCc7XG52YXIgVE9VQ0hfQUNUSU9OID0gJ19fcG9seW1lckdlc3R1cmVzVG91Y2hBY3Rpb24nO1xudmFyIFRBUF9ESVNUQU5DRSA9IDI1O1xudmFyIFRSQUNLX0RJU1RBTkNFID0gNTtcbnZhciBUUkFDS19MRU5HVEggPSAyO1xudmFyIE1PVVNFX1RJTUVPVVQgPSAyNTAwO1xudmFyIE1PVVNFX0VWRU5UUyA9IFtcbidtb3VzZWRvd24nLFxuJ21vdXNlbW92ZScsXG4nbW91c2V1cCcsXG4nY2xpY2snXG5dO1xudmFyIElTX1RPVUNIX09OTFkgPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9pUCg/OltvYV1kfGhvbmUpfEFuZHJvaWQvKTtcbnZhciBtb3VzZUNhbmNlbGxlciA9IGZ1bmN0aW9uIChtb3VzZUV2ZW50KSB7XG5tb3VzZUV2ZW50W0hBTkRMRURfT0JKXSA9IHsgc2tpcDogdHJ1ZSB9O1xuaWYgKG1vdXNlRXZlbnQudHlwZSA9PT0gJ2NsaWNrJykge1xudmFyIHBhdGggPSBQb2x5bWVyLmRvbShtb3VzZUV2ZW50KS5wYXRoO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKSB7XG5pZiAocGF0aFtpXSA9PT0gUE9JTlRFUlNUQVRFLm1vdXNlLnRhcmdldCkge1xucmV0dXJuO1xufVxufVxubW91c2VFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xubW91c2VFdmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbn1cbn07XG5mdW5jdGlvbiBzZXR1cFRlYXJkb3duTW91c2VDYW5jZWxsZXIoc2V0dXApIHtcbmZvciAodmFyIGkgPSAwLCBlbjsgaSA8IE1PVVNFX0VWRU5UUy5sZW5ndGg7IGkrKykge1xuZW4gPSBNT1VTRV9FVkVOVFNbaV07XG5pZiAoc2V0dXApIHtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZW4sIG1vdXNlQ2FuY2VsbGVyLCB0cnVlKTtcbn0gZWxzZSB7XG5kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGVuLCBtb3VzZUNhbmNlbGxlciwgdHJ1ZSk7XG59XG59XG59XG5mdW5jdGlvbiBpZ25vcmVNb3VzZSgpIHtcbmlmIChJU19UT1VDSF9PTkxZKSB7XG5yZXR1cm47XG59XG5pZiAoIVBPSU5URVJTVEFURS5tb3VzZS5tb3VzZUlnbm9yZUpvYikge1xuc2V0dXBUZWFyZG93bk1vdXNlQ2FuY2VsbGVyKHRydWUpO1xufVxudmFyIHVuc2V0ID0gZnVuY3Rpb24gKCkge1xuc2V0dXBUZWFyZG93bk1vdXNlQ2FuY2VsbGVyKCk7XG5QT0lOVEVSU1RBVEUubW91c2UudGFyZ2V0ID0gbnVsbDtcblBPSU5URVJTVEFURS5tb3VzZS5tb3VzZUlnbm9yZUpvYiA9IG51bGw7XG59O1xuUE9JTlRFUlNUQVRFLm1vdXNlLm1vdXNlSWdub3JlSm9iID0gUG9seW1lci5EZWJvdW5jZShQT0lOVEVSU1RBVEUubW91c2UubW91c2VJZ25vcmVKb2IsIHVuc2V0LCBNT1VTRV9USU1FT1VUKTtcbn1cbnZhciBQT0lOVEVSU1RBVEUgPSB7XG5tb3VzZToge1xudGFyZ2V0OiBudWxsLFxubW91c2VJZ25vcmVKb2I6IG51bGxcbn0sXG50b3VjaDoge1xueDogMCxcbnk6IDAsXG5pZDogLTEsXG5zY3JvbGxEZWNpZGVkOiBmYWxzZVxufVxufTtcbmZ1bmN0aW9uIGZpcnN0VG91Y2hBY3Rpb24oZXYpIHtcbnZhciBwYXRoID0gUG9seW1lci5kb20oZXYpLnBhdGg7XG52YXIgdGEgPSAnYXV0byc7XG5mb3IgKHZhciBpID0gMCwgbjsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbm4gPSBwYXRoW2ldO1xuaWYgKG5bVE9VQ0hfQUNUSU9OXSkge1xudGEgPSBuW1RPVUNIX0FDVElPTl07XG5icmVhaztcbn1cbn1cbnJldHVybiB0YTtcbn1cbnZhciBHZXN0dXJlcyA9IHtcbmdlc3R1cmVzOiB7fSxcbnJlY29nbml6ZXJzOiBbXSxcbmRlZXBUYXJnZXRGaW5kOiBmdW5jdGlvbiAoeCwgeSkge1xudmFyIG5vZGUgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xudmFyIG5leHQgPSBub2RlO1xud2hpbGUgKG5leHQgJiYgbmV4dC5zaGFkb3dSb290KSB7XG5uZXh0ID0gbmV4dC5zaGFkb3dSb290LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG5pZiAobmV4dCkge1xubm9kZSA9IG5leHQ7XG59XG59XG5yZXR1cm4gbm9kZTtcbn0sXG5maW5kT3JpZ2luYWxUYXJnZXQ6IGZ1bmN0aW9uIChldikge1xuaWYgKGV2LnBhdGgpIHtcbnJldHVybiBldi5wYXRoWzBdO1xufVxucmV0dXJuIGV2LnRhcmdldDtcbn0sXG5oYW5kbGVOYXRpdmU6IGZ1bmN0aW9uIChldikge1xudmFyIGhhbmRsZWQ7XG52YXIgdHlwZSA9IGV2LnR5cGU7XG52YXIgbm9kZSA9IGV2LmN1cnJlbnRUYXJnZXQ7XG52YXIgZ29iaiA9IG5vZGVbR0VTVFVSRV9LRVldO1xudmFyIGdzID0gZ29ialt0eXBlXTtcbmlmICghZ3MpIHtcbnJldHVybjtcbn1cbmlmICghZXZbSEFORExFRF9PQkpdKSB7XG5ldltIQU5ETEVEX09CSl0gPSB7fTtcbmlmICh0eXBlLnNsaWNlKDAsIDUpID09PSAndG91Y2gnKSB7XG52YXIgdCA9IGV2LmNoYW5nZWRUb3VjaGVzWzBdO1xuaWYgKHR5cGUgPT09ICd0b3VjaHN0YXJ0Jykge1xuaWYgKGV2LnRvdWNoZXMubGVuZ3RoID09PSAxKSB7XG5QT0lOVEVSU1RBVEUudG91Y2guaWQgPSB0LmlkZW50aWZpZXI7XG59XG59XG5pZiAoUE9JTlRFUlNUQVRFLnRvdWNoLmlkICE9PSB0LmlkZW50aWZpZXIpIHtcbnJldHVybjtcbn1cbmlmICghSEFTX05BVElWRV9UQSkge1xuaWYgKHR5cGUgPT09ICd0b3VjaHN0YXJ0JyB8fCB0eXBlID09PSAndG91Y2htb3ZlJykge1xuR2VzdHVyZXMuaGFuZGxlVG91Y2hBY3Rpb24oZXYpO1xufVxufVxuaWYgKHR5cGUgPT09ICd0b3VjaGVuZCcpIHtcblBPSU5URVJTVEFURS5tb3VzZS50YXJnZXQgPSBQb2x5bWVyLmRvbShldikucm9vdFRhcmdldDtcbmlnbm9yZU1vdXNlKHRydWUpO1xufVxufVxufVxuaGFuZGxlZCA9IGV2W0hBTkRMRURfT0JKXTtcbmlmIChoYW5kbGVkLnNraXApIHtcbnJldHVybjtcbn1cbnZhciByZWNvZ25pemVycyA9IEdlc3R1cmVzLnJlY29nbml6ZXJzO1xuZm9yICh2YXIgaSA9IDAsIHI7IGkgPCByZWNvZ25pemVycy5sZW5ndGg7IGkrKykge1xuciA9IHJlY29nbml6ZXJzW2ldO1xuaWYgKGdzW3IubmFtZV0gJiYgIWhhbmRsZWRbci5uYW1lXSkge1xuaGFuZGxlZFtyLm5hbWVdID0gdHJ1ZTtcbnJbdHlwZV0oZXYpO1xufVxufVxufSxcbmhhbmRsZVRvdWNoQWN0aW9uOiBmdW5jdGlvbiAoZXYpIHtcbnZhciB0ID0gZXYuY2hhbmdlZFRvdWNoZXNbMF07XG52YXIgdHlwZSA9IGV2LnR5cGU7XG5pZiAodHlwZSA9PT0gJ3RvdWNoc3RhcnQnKSB7XG5QT0lOVEVSU1RBVEUudG91Y2gueCA9IHQuY2xpZW50WDtcblBPSU5URVJTVEFURS50b3VjaC55ID0gdC5jbGllbnRZO1xuUE9JTlRFUlNUQVRFLnRvdWNoLnNjcm9sbERlY2lkZWQgPSBmYWxzZTtcbn0gZWxzZSBpZiAodHlwZSA9PT0gJ3RvdWNobW92ZScpIHtcbmlmIChQT0lOVEVSU1RBVEUudG91Y2guc2Nyb2xsRGVjaWRlZCkge1xucmV0dXJuO1xufVxuUE9JTlRFUlNUQVRFLnRvdWNoLnNjcm9sbERlY2lkZWQgPSB0cnVlO1xudmFyIHRhID0gZmlyc3RUb3VjaEFjdGlvbihldik7XG52YXIgcHJldmVudCA9IGZhbHNlO1xudmFyIGR4ID0gTWF0aC5hYnMoUE9JTlRFUlNUQVRFLnRvdWNoLnggLSB0LmNsaWVudFgpO1xudmFyIGR5ID0gTWF0aC5hYnMoUE9JTlRFUlNUQVRFLnRvdWNoLnkgLSB0LmNsaWVudFkpO1xuaWYgKCFldi5jYW5jZWxhYmxlKSB7XG59IGVsc2UgaWYgKHRhID09PSAnbm9uZScpIHtcbnByZXZlbnQgPSB0cnVlO1xufSBlbHNlIGlmICh0YSA9PT0gJ3Bhbi14Jykge1xucHJldmVudCA9IGR5ID4gZHg7XG59IGVsc2UgaWYgKHRhID09PSAncGFuLXknKSB7XG5wcmV2ZW50ID0gZHggPiBkeTtcbn1cbmlmIChwcmV2ZW50KSB7XG5ldi5wcmV2ZW50RGVmYXVsdCgpO1xufVxufVxufSxcbmFkZDogZnVuY3Rpb24gKG5vZGUsIGV2VHlwZSwgaGFuZGxlcikge1xudmFyIHJlY29nbml6ZXIgPSB0aGlzLmdlc3R1cmVzW2V2VHlwZV07XG52YXIgZGVwcyA9IHJlY29nbml6ZXIuZGVwcztcbnZhciBuYW1lID0gcmVjb2duaXplci5uYW1lO1xudmFyIGdvYmogPSBub2RlW0dFU1RVUkVfS0VZXTtcbmlmICghZ29iaikge1xubm9kZVtHRVNUVVJFX0tFWV0gPSBnb2JqID0ge307XG59XG5mb3IgKHZhciBpID0gMCwgZGVwLCBnZDsgaSA8IGRlcHMubGVuZ3RoOyBpKyspIHtcbmRlcCA9IGRlcHNbaV07XG5pZiAoSVNfVE9VQ0hfT05MWSAmJiBNT1VTRV9FVkVOVFMuaW5kZXhPZihkZXApID4gLTEpIHtcbmNvbnRpbnVlO1xufVxuZ2QgPSBnb2JqW2RlcF07XG5pZiAoIWdkKSB7XG5nb2JqW2RlcF0gPSBnZCA9IHsgX2NvdW50OiAwIH07XG59XG5pZiAoZ2QuX2NvdW50ID09PSAwKSB7XG5ub2RlLmFkZEV2ZW50TGlzdGVuZXIoZGVwLCB0aGlzLmhhbmRsZU5hdGl2ZSk7XG59XG5nZFtuYW1lXSA9IChnZFtuYW1lXSB8fCAwKSArIDE7XG5nZC5fY291bnQgPSAoZ2QuX2NvdW50IHx8IDApICsgMTtcbn1cbm5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldlR5cGUsIGhhbmRsZXIpO1xuaWYgKHJlY29nbml6ZXIudG91Y2hBY3Rpb24pIHtcbnRoaXMuc2V0VG91Y2hBY3Rpb24obm9kZSwgcmVjb2duaXplci50b3VjaEFjdGlvbik7XG59XG59LFxucmVtb3ZlOiBmdW5jdGlvbiAobm9kZSwgZXZUeXBlLCBoYW5kbGVyKSB7XG52YXIgcmVjb2duaXplciA9IHRoaXMuZ2VzdHVyZXNbZXZUeXBlXTtcbnZhciBkZXBzID0gcmVjb2duaXplci5kZXBzO1xudmFyIG5hbWUgPSByZWNvZ25pemVyLm5hbWU7XG52YXIgZ29iaiA9IG5vZGVbR0VTVFVSRV9LRVldO1xuaWYgKGdvYmopIHtcbmZvciAodmFyIGkgPSAwLCBkZXAsIGdkOyBpIDwgZGVwcy5sZW5ndGg7IGkrKykge1xuZGVwID0gZGVwc1tpXTtcbmdkID0gZ29ialtkZXBdO1xuaWYgKGdkICYmIGdkW25hbWVdKSB7XG5nZFtuYW1lXSA9IChnZFtuYW1lXSB8fCAxKSAtIDE7XG5nZC5fY291bnQgPSAoZ2QuX2NvdW50IHx8IDEpIC0gMTtcbn1cbmlmIChnZC5fY291bnQgPT09IDApIHtcbm5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihkZXAsIHRoaXMuaGFuZGxlTmF0aXZlKTtcbn1cbn1cbn1cbm5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldlR5cGUsIGhhbmRsZXIpO1xufSxcbnJlZ2lzdGVyOiBmdW5jdGlvbiAocmVjb2cpIHtcbnRoaXMucmVjb2duaXplcnMucHVzaChyZWNvZyk7XG5mb3IgKHZhciBpID0gMDsgaSA8IHJlY29nLmVtaXRzLmxlbmd0aDsgaSsrKSB7XG50aGlzLmdlc3R1cmVzW3JlY29nLmVtaXRzW2ldXSA9IHJlY29nO1xufVxufSxcbmZpbmRSZWNvZ25pemVyQnlFdmVudDogZnVuY3Rpb24gKGV2TmFtZSkge1xuZm9yICh2YXIgaSA9IDAsIHI7IGkgPCB0aGlzLnJlY29nbml6ZXJzLmxlbmd0aDsgaSsrKSB7XG5yID0gdGhpcy5yZWNvZ25pemVyc1tpXTtcbmZvciAodmFyIGogPSAwLCBuOyBqIDwgci5lbWl0cy5sZW5ndGg7IGorKykge1xubiA9IHIuZW1pdHNbal07XG5pZiAobiA9PT0gZXZOYW1lKSB7XG5yZXR1cm4gcjtcbn1cbn1cbn1cbnJldHVybiBudWxsO1xufSxcbnNldFRvdWNoQWN0aW9uOiBmdW5jdGlvbiAobm9kZSwgdmFsdWUpIHtcbmlmIChIQVNfTkFUSVZFX1RBKSB7XG5ub2RlLnN0eWxlLnRvdWNoQWN0aW9uID0gdmFsdWU7XG59XG5ub2RlW1RPVUNIX0FDVElPTl0gPSB2YWx1ZTtcbn0sXG5maXJlOiBmdW5jdGlvbiAodGFyZ2V0LCB0eXBlLCBkZXRhaWwpIHtcbnZhciBldiA9IFBvbHltZXIuQmFzZS5maXJlKHR5cGUsIGRldGFpbCwge1xubm9kZTogdGFyZ2V0LFxuYnViYmxlczogdHJ1ZSxcbmNhbmNlbGFibGU6IHRydWVcbn0pO1xuaWYgKGV2LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbnZhciBzZSA9IGRldGFpbC5zb3VyY2VFdmVudDtcbmlmIChzZSAmJiBzZS5wcmV2ZW50RGVmYXVsdCkge1xuc2UucHJldmVudERlZmF1bHQoKTtcbn1cbn1cbn0sXG5wcmV2ZW50OiBmdW5jdGlvbiAoZXZOYW1lKSB7XG52YXIgcmVjb2duaXplciA9IHRoaXMuZmluZFJlY29nbml6ZXJCeUV2ZW50KGV2TmFtZSk7XG5pZiAocmVjb2duaXplci5pbmZvKSB7XG5yZWNvZ25pemVyLmluZm8ucHJldmVudCA9IHRydWU7XG59XG59XG59O1xuR2VzdHVyZXMucmVnaXN0ZXIoe1xubmFtZTogJ2Rvd251cCcsXG5kZXBzOiBbXG4nbW91c2Vkb3duJyxcbid0b3VjaHN0YXJ0Jyxcbid0b3VjaGVuZCdcbl0sXG5lbWl0czogW1xuJ2Rvd24nLFxuJ3VwJ1xuXSxcbm1vdXNlZG93bjogZnVuY3Rpb24gKGUpIHtcbnZhciB0ID0gR2VzdHVyZXMuZmluZE9yaWdpbmFsVGFyZ2V0KGUpO1xudmFyIHNlbGYgPSB0aGlzO1xudmFyIHVwZm4gPSBmdW5jdGlvbiB1cGZuKGUpIHtcbnNlbGYuZmlyZSgndXAnLCB0LCBlKTtcbmRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB1cGZuKTtcbn07XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdXBmbik7XG50aGlzLmZpcmUoJ2Rvd24nLCB0LCBlKTtcbn0sXG50b3VjaHN0YXJ0OiBmdW5jdGlvbiAoZSkge1xudGhpcy5maXJlKCdkb3duJywgR2VzdHVyZXMuZmluZE9yaWdpbmFsVGFyZ2V0KGUpLCBlLmNoYW5nZWRUb3VjaGVzWzBdKTtcbn0sXG50b3VjaGVuZDogZnVuY3Rpb24gKGUpIHtcbnRoaXMuZmlyZSgndXAnLCBHZXN0dXJlcy5maW5kT3JpZ2luYWxUYXJnZXQoZSksIGUuY2hhbmdlZFRvdWNoZXNbMF0pO1xufSxcbmZpcmU6IGZ1bmN0aW9uICh0eXBlLCB0YXJnZXQsIGV2ZW50KSB7XG52YXIgc2VsZiA9IHRoaXM7XG5HZXN0dXJlcy5maXJlKHRhcmdldCwgdHlwZSwge1xueDogZXZlbnQuY2xpZW50WCxcbnk6IGV2ZW50LmNsaWVudFksXG5zb3VyY2VFdmVudDogZXZlbnQsXG5wcmV2ZW50OiBHZXN0dXJlcy5wcmV2ZW50LmJpbmQoR2VzdHVyZXMpXG59KTtcbn1cbn0pO1xuR2VzdHVyZXMucmVnaXN0ZXIoe1xubmFtZTogJ3RyYWNrJyxcbnRvdWNoQWN0aW9uOiAnbm9uZScsXG5kZXBzOiBbXG4nbW91c2Vkb3duJyxcbid0b3VjaHN0YXJ0Jyxcbid0b3VjaG1vdmUnLFxuJ3RvdWNoZW5kJ1xuXSxcbmVtaXRzOiBbJ3RyYWNrJ10sXG5pbmZvOiB7XG54OiAwLFxueTogMCxcbnN0YXRlOiAnc3RhcnQnLFxuc3RhcnRlZDogZmFsc2UsXG5tb3ZlczogW10sXG5hZGRNb3ZlOiBmdW5jdGlvbiAobW92ZSkge1xuaWYgKHRoaXMubW92ZXMubGVuZ3RoID4gVFJBQ0tfTEVOR1RIKSB7XG50aGlzLm1vdmVzLnNoaWZ0KCk7XG59XG50aGlzLm1vdmVzLnB1c2gobW92ZSk7XG59LFxucHJldmVudDogZmFsc2Vcbn0sXG5jbGVhckluZm86IGZ1bmN0aW9uICgpIHtcbnRoaXMuaW5mby5zdGF0ZSA9ICdzdGFydCc7XG50aGlzLmluZm8uc3RhcnRlZCA9IGZhbHNlO1xudGhpcy5pbmZvLm1vdmVzID0gW107XG50aGlzLmluZm8ueCA9IDA7XG50aGlzLmluZm8ueSA9IDA7XG50aGlzLmluZm8ucHJldmVudCA9IGZhbHNlO1xufSxcbmhhc01vdmVkRW5vdWdoOiBmdW5jdGlvbiAoeCwgeSkge1xuaWYgKHRoaXMuaW5mby5wcmV2ZW50KSB7XG5yZXR1cm4gZmFsc2U7XG59XG5pZiAodGhpcy5pbmZvLnN0YXJ0ZWQpIHtcbnJldHVybiB0cnVlO1xufVxudmFyIGR4ID0gTWF0aC5hYnModGhpcy5pbmZvLnggLSB4KTtcbnZhciBkeSA9IE1hdGguYWJzKHRoaXMuaW5mby55IC0geSk7XG5yZXR1cm4gZHggPj0gVFJBQ0tfRElTVEFOQ0UgfHwgZHkgPj0gVFJBQ0tfRElTVEFOQ0U7XG59LFxubW91c2Vkb3duOiBmdW5jdGlvbiAoZSkge1xudmFyIHQgPSBHZXN0dXJlcy5maW5kT3JpZ2luYWxUYXJnZXQoZSk7XG52YXIgc2VsZiA9IHRoaXM7XG52YXIgbW92ZWZuID0gZnVuY3Rpb24gbW92ZWZuKGUpIHtcbnZhciB4ID0gZS5jbGllbnRYLCB5ID0gZS5jbGllbnRZO1xuaWYgKHNlbGYuaGFzTW92ZWRFbm91Z2goeCwgeSkpIHtcbnNlbGYuaW5mby5zdGF0ZSA9IHNlbGYuaW5mby5zdGFydGVkID8gZS50eXBlID09PSAnbW91c2V1cCcgPyAnZW5kJyA6ICd0cmFjaycgOiAnc3RhcnQnO1xuc2VsZi5pbmZvLmFkZE1vdmUoe1xueDogeCxcbnk6IHlcbn0pO1xuc2VsZi5maXJlKHQsIGUpO1xuc2VsZi5pbmZvLnN0YXJ0ZWQgPSB0cnVlO1xufVxufTtcbnZhciB1cGZuID0gZnVuY3Rpb24gdXBmbihlKSB7XG5pZiAoc2VsZi5pbmZvLnN0YXJ0ZWQpIHtcbkdlc3R1cmVzLnByZXZlbnQoJ3RhcCcpO1xubW92ZWZuKGUpO1xufVxuc2VsZi5jbGVhckluZm8oKTtcbmRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdmVmbik7XG5kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdXBmbik7XG59O1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW92ZWZuKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB1cGZuKTtcbnRoaXMuaW5mby54ID0gZS5jbGllbnRYO1xudGhpcy5pbmZvLnkgPSBlLmNsaWVudFk7XG59LFxudG91Y2hzdGFydDogZnVuY3Rpb24gKGUpIHtcbnZhciBjdCA9IGUuY2hhbmdlZFRvdWNoZXNbMF07XG50aGlzLmluZm8ueCA9IGN0LmNsaWVudFg7XG50aGlzLmluZm8ueSA9IGN0LmNsaWVudFk7XG59LFxudG91Y2htb3ZlOiBmdW5jdGlvbiAoZSkge1xudmFyIHQgPSBHZXN0dXJlcy5maW5kT3JpZ2luYWxUYXJnZXQoZSk7XG52YXIgY3QgPSBlLmNoYW5nZWRUb3VjaGVzWzBdO1xudmFyIHggPSBjdC5jbGllbnRYLCB5ID0gY3QuY2xpZW50WTtcbmlmICh0aGlzLmhhc01vdmVkRW5vdWdoKHgsIHkpKSB7XG50aGlzLmluZm8uYWRkTW92ZSh7XG54OiB4LFxueTogeVxufSk7XG50aGlzLmZpcmUodCwgY3QpO1xudGhpcy5pbmZvLnN0YXRlID0gJ3RyYWNrJztcbnRoaXMuaW5mby5zdGFydGVkID0gdHJ1ZTtcbn1cbn0sXG50b3VjaGVuZDogZnVuY3Rpb24gKGUpIHtcbnZhciB0ID0gR2VzdHVyZXMuZmluZE9yaWdpbmFsVGFyZ2V0KGUpO1xudmFyIGN0ID0gZS5jaGFuZ2VkVG91Y2hlc1swXTtcbmlmICh0aGlzLmluZm8uc3RhcnRlZCkge1xuR2VzdHVyZXMucHJldmVudCgndGFwJyk7XG50aGlzLmluZm8uc3RhdGUgPSAnZW5kJztcbnRoaXMuaW5mby5hZGRNb3ZlKHtcbng6IGN0LmNsaWVudFgsXG55OiBjdC5jbGllbnRZXG59KTtcbnRoaXMuZmlyZSh0LCBjdCk7XG59XG50aGlzLmNsZWFySW5mbygpO1xufSxcbmZpcmU6IGZ1bmN0aW9uICh0YXJnZXQsIHRvdWNoKSB7XG52YXIgc2Vjb25kbGFzdCA9IHRoaXMuaW5mby5tb3Zlc1t0aGlzLmluZm8ubW92ZXMubGVuZ3RoIC0gMl07XG52YXIgbGFzdG1vdmUgPSB0aGlzLmluZm8ubW92ZXNbdGhpcy5pbmZvLm1vdmVzLmxlbmd0aCAtIDFdO1xudmFyIGR4ID0gbGFzdG1vdmUueCAtIHRoaXMuaW5mby54O1xudmFyIGR5ID0gbGFzdG1vdmUueSAtIHRoaXMuaW5mby55O1xudmFyIGRkeCwgZGR5ID0gMDtcbmlmIChzZWNvbmRsYXN0KSB7XG5kZHggPSBsYXN0bW92ZS54IC0gc2Vjb25kbGFzdC54O1xuZGR5ID0gbGFzdG1vdmUueSAtIHNlY29uZGxhc3QueTtcbn1cbnJldHVybiBHZXN0dXJlcy5maXJlKHRhcmdldCwgJ3RyYWNrJywge1xuc3RhdGU6IHRoaXMuaW5mby5zdGF0ZSxcbng6IHRvdWNoLmNsaWVudFgsXG55OiB0b3VjaC5jbGllbnRZLFxuZHg6IGR4LFxuZHk6IGR5LFxuZGR4OiBkZHgsXG5kZHk6IGRkeSxcbnNvdXJjZUV2ZW50OiB0b3VjaCxcbmhvdmVyOiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gR2VzdHVyZXMuZGVlcFRhcmdldEZpbmQodG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSk7XG59XG59KTtcbn1cbn0pO1xuR2VzdHVyZXMucmVnaXN0ZXIoe1xubmFtZTogJ3RhcCcsXG5kZXBzOiBbXG4nbW91c2Vkb3duJyxcbidjbGljaycsXG4ndG91Y2hzdGFydCcsXG4ndG91Y2hlbmQnXG5dLFxuZW1pdHM6IFsndGFwJ10sXG5pbmZvOiB7XG54OiBOYU4sXG55OiBOYU4sXG5wcmV2ZW50OiBmYWxzZVxufSxcbnJlc2V0OiBmdW5jdGlvbiAoKSB7XG50aGlzLmluZm8ueCA9IE5hTjtcbnRoaXMuaW5mby55ID0gTmFOO1xudGhpcy5pbmZvLnByZXZlbnQgPSBmYWxzZTtcbn0sXG5zYXZlOiBmdW5jdGlvbiAoZSkge1xudGhpcy5pbmZvLnggPSBlLmNsaWVudFg7XG50aGlzLmluZm8ueSA9IGUuY2xpZW50WTtcbn0sXG5tb3VzZWRvd246IGZ1bmN0aW9uIChlKSB7XG50aGlzLnNhdmUoZSk7XG59LFxuY2xpY2s6IGZ1bmN0aW9uIChlKSB7XG50aGlzLmZvcndhcmQoZSk7XG59LFxudG91Y2hzdGFydDogZnVuY3Rpb24gKGUpIHtcbnRoaXMuc2F2ZShlLmNoYW5nZWRUb3VjaGVzWzBdKTtcbn0sXG50b3VjaGVuZDogZnVuY3Rpb24gKGUpIHtcbnRoaXMuZm9yd2FyZChlLmNoYW5nZWRUb3VjaGVzWzBdKTtcbn0sXG5mb3J3YXJkOiBmdW5jdGlvbiAoZSkge1xudmFyIGR4ID0gTWF0aC5hYnMoZS5jbGllbnRYIC0gdGhpcy5pbmZvLngpO1xudmFyIGR5ID0gTWF0aC5hYnMoZS5jbGllbnRZIC0gdGhpcy5pbmZvLnkpO1xudmFyIHQgPSBHZXN0dXJlcy5maW5kT3JpZ2luYWxUYXJnZXQoZSk7XG5pZiAoaXNOYU4oZHgpIHx8IGlzTmFOKGR5KSB8fCBkeCA8PSBUQVBfRElTVEFOQ0UgJiYgZHkgPD0gVEFQX0RJU1RBTkNFKSB7XG5pZiAoIXRoaXMuaW5mby5wcmV2ZW50KSB7XG5HZXN0dXJlcy5maXJlKHQsICd0YXAnLCB7XG54OiBlLmNsaWVudFgsXG55OiBlLmNsaWVudFksXG5zb3VyY2VFdmVudDogZVxufSk7XG59XG59XG50aGlzLnJlc2V0KCk7XG59XG59KTtcbnZhciBESVJFQ1RJT05fTUFQID0ge1xueDogJ3Bhbi14Jyxcbnk6ICdwYW4teScsXG5ub25lOiAnbm9uZScsXG5hbGw6ICdhdXRvJ1xufTtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5fbGlzdGVuOiBmdW5jdGlvbiAobm9kZSwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG5pZiAoR2VzdHVyZXMuZ2VzdHVyZXNbZXZlbnROYW1lXSkge1xuR2VzdHVyZXMuYWRkKG5vZGUsIGV2ZW50TmFtZSwgaGFuZGxlcik7XG59IGVsc2Uge1xubm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlcik7XG59XG59LFxuX3VubGlzdGVuOiBmdW5jdGlvbiAobm9kZSwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG5pZiAoR2VzdHVyZXMuZ2VzdHVyZXNbZXZlbnROYW1lXSkge1xuR2VzdHVyZXMucmVtb3ZlKG5vZGUsIGV2ZW50TmFtZSwgaGFuZGxlcik7XG59IGVsc2Uge1xubm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlcik7XG59XG59LFxuc2V0U2Nyb2xsRGlyZWN0aW9uOiBmdW5jdGlvbiAoZGlyZWN0aW9uLCBub2RlKSB7XG5ub2RlID0gbm9kZSB8fCB0aGlzO1xuR2VzdHVyZXMuc2V0VG91Y2hBY3Rpb24obm9kZSwgRElSRUNUSU9OX01BUFtkaXJlY3Rpb25dIHx8ICdhdXRvJyk7XG59XG59KTtcblBvbHltZXIuR2VzdHVyZXMgPSBHZXN0dXJlcztcbn0oKSk7XG5Qb2x5bWVyLkFzeW5jID0ge1xuX2N1cnJWYWw6IDAsXG5fbGFzdFZhbDogMCxcbl9jYWxsYmFja3M6IFtdLFxuX3R3aWRkbGVDb250ZW50OiAwLFxuX3R3aWRkbGU6IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKSxcbnJ1bjogZnVuY3Rpb24gKGNhbGxiYWNrLCB3YWl0VGltZSkge1xuaWYgKHdhaXRUaW1lID4gMCkge1xucmV0dXJuIH5zZXRUaW1lb3V0KGNhbGxiYWNrLCB3YWl0VGltZSk7XG59IGVsc2Uge1xudGhpcy5fdHdpZGRsZS50ZXh0Q29udGVudCA9IHRoaXMuX3R3aWRkbGVDb250ZW50Kys7XG50aGlzLl9jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG5yZXR1cm4gdGhpcy5fY3VyclZhbCsrO1xufVxufSxcbmNhbmNlbDogZnVuY3Rpb24gKGhhbmRsZSkge1xuaWYgKGhhbmRsZSA8IDApIHtcbmNsZWFyVGltZW91dCh+aGFuZGxlKTtcbn0gZWxzZSB7XG52YXIgaWR4ID0gaGFuZGxlIC0gdGhpcy5fbGFzdFZhbDtcbmlmIChpZHggPj0gMCkge1xuaWYgKCF0aGlzLl9jYWxsYmFja3NbaWR4XSkge1xudGhyb3cgJ2ludmFsaWQgYXN5bmMgaGFuZGxlOiAnICsgaGFuZGxlO1xufVxudGhpcy5fY2FsbGJhY2tzW2lkeF0gPSBudWxsO1xufVxufVxufSxcbl9hdEVuZE9mTWljcm90YXNrOiBmdW5jdGlvbiAoKSB7XG52YXIgbGVuID0gdGhpcy5fY2FsbGJhY2tzLmxlbmd0aDtcbmZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbnZhciBjYiA9IHRoaXMuX2NhbGxiYWNrc1tpXTtcbmlmIChjYikge1xudHJ5IHtcbmNiKCk7XG59IGNhdGNoIChlKSB7XG5pKys7XG50aGlzLl9jYWxsYmFja3Muc3BsaWNlKDAsIGkpO1xudGhpcy5fbGFzdFZhbCArPSBpO1xudGhpcy5fdHdpZGRsZS50ZXh0Q29udGVudCA9IHRoaXMuX3R3aWRkbGVDb250ZW50Kys7XG50aHJvdyBlO1xufVxufVxufVxudGhpcy5fY2FsbGJhY2tzLnNwbGljZSgwLCBsZW4pO1xudGhpcy5fbGFzdFZhbCArPSBsZW47XG59XG59O1xubmV3ICh3aW5kb3cuTXV0YXRpb25PYnNlcnZlciB8fCBKc011dGF0aW9uT2JzZXJ2ZXIpKFBvbHltZXIuQXN5bmMuX2F0RW5kT2ZNaWNyb3Rhc2suYmluZChQb2x5bWVyLkFzeW5jKSkub2JzZXJ2ZShQb2x5bWVyLkFzeW5jLl90d2lkZGxlLCB7IGNoYXJhY3RlckRhdGE6IHRydWUgfSk7XG5Qb2x5bWVyLkRlYm91bmNlID0gZnVuY3Rpb24gKCkge1xudmFyIEFzeW5jID0gUG9seW1lci5Bc3luYztcbnZhciBEZWJvdW5jZXIgPSBmdW5jdGlvbiAoY29udGV4dCkge1xudGhpcy5jb250ZXh0ID0gY29udGV4dDtcbnRoaXMuYm91bmRDb21wbGV0ZSA9IHRoaXMuY29tcGxldGUuYmluZCh0aGlzKTtcbn07XG5EZWJvdW5jZXIucHJvdG90eXBlID0ge1xuZ286IGZ1bmN0aW9uIChjYWxsYmFjaywgd2FpdCkge1xudmFyIGg7XG50aGlzLmZpbmlzaCA9IGZ1bmN0aW9uICgpIHtcbkFzeW5jLmNhbmNlbChoKTtcbn07XG5oID0gQXN5bmMucnVuKHRoaXMuYm91bmRDb21wbGV0ZSwgd2FpdCk7XG50aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG59LFxuc3RvcDogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuZmluaXNoKSB7XG50aGlzLmZpbmlzaCgpO1xudGhpcy5maW5pc2ggPSBudWxsO1xufVxufSxcbmNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5maW5pc2gpIHtcbnRoaXMuc3RvcCgpO1xudGhpcy5jYWxsYmFjay5jYWxsKHRoaXMuY29udGV4dCk7XG59XG59XG59O1xuZnVuY3Rpb24gZGVib3VuY2UoZGVib3VuY2VyLCBjYWxsYmFjaywgd2FpdCkge1xuaWYgKGRlYm91bmNlcikge1xuZGVib3VuY2VyLnN0b3AoKTtcbn0gZWxzZSB7XG5kZWJvdW5jZXIgPSBuZXcgRGVib3VuY2VyKHRoaXMpO1xufVxuZGVib3VuY2VyLmdvKGNhbGxiYWNrLCB3YWl0KTtcbnJldHVybiBkZWJvdW5jZXI7XG59XG5yZXR1cm4gZGVib3VuY2U7XG59KCk7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuJCQ6IGZ1bmN0aW9uIChzbGN0cikge1xucmV0dXJuIFBvbHltZXIuZG9tKHRoaXMucm9vdCkucXVlcnlTZWxlY3RvcihzbGN0cik7XG59LFxudG9nZ2xlQ2xhc3M6IGZ1bmN0aW9uIChuYW1lLCBib29sLCBub2RlKSB7XG5ub2RlID0gbm9kZSB8fCB0aGlzO1xuaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSkge1xuYm9vbCA9ICFub2RlLmNsYXNzTGlzdC5jb250YWlucyhuYW1lKTtcbn1cbmlmIChib29sKSB7XG5Qb2x5bWVyLmRvbShub2RlKS5jbGFzc0xpc3QuYWRkKG5hbWUpO1xufSBlbHNlIHtcblBvbHltZXIuZG9tKG5vZGUpLmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XG59XG59LFxudG9nZ2xlQXR0cmlidXRlOiBmdW5jdGlvbiAobmFtZSwgYm9vbCwgbm9kZSkge1xubm9kZSA9IG5vZGUgfHwgdGhpcztcbmlmIChhcmd1bWVudHMubGVuZ3RoID09IDEpIHtcbmJvb2wgPSAhbm9kZS5oYXNBdHRyaWJ1dGUobmFtZSk7XG59XG5pZiAoYm9vbCkge1xuUG9seW1lci5kb20obm9kZSkuc2V0QXR0cmlidXRlKG5hbWUsICcnKTtcbn0gZWxzZSB7XG5Qb2x5bWVyLmRvbShub2RlKS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG59XG59LFxuY2xhc3NGb2xsb3dzOiBmdW5jdGlvbiAobmFtZSwgdG9FbGVtZW50LCBmcm9tRWxlbWVudCkge1xuaWYgKGZyb21FbGVtZW50KSB7XG5Qb2x5bWVyLmRvbShmcm9tRWxlbWVudCkuY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbn1cbmlmICh0b0VsZW1lbnQpIHtcblBvbHltZXIuZG9tKHRvRWxlbWVudCkuY2xhc3NMaXN0LmFkZChuYW1lKTtcbn1cbn0sXG5hdHRyaWJ1dGVGb2xsb3dzOiBmdW5jdGlvbiAobmFtZSwgdG9FbGVtZW50LCBmcm9tRWxlbWVudCkge1xuaWYgKGZyb21FbGVtZW50KSB7XG5Qb2x5bWVyLmRvbShmcm9tRWxlbWVudCkucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xufVxuaWYgKHRvRWxlbWVudCkge1xuUG9seW1lci5kb20odG9FbGVtZW50KS5zZXRBdHRyaWJ1dGUobmFtZSwgJycpO1xufVxufSxcbmdldENvbnRlbnRDaGlsZE5vZGVzOiBmdW5jdGlvbiAoc2xjdHIpIHtcbnJldHVybiBQb2x5bWVyLmRvbShQb2x5bWVyLmRvbSh0aGlzLnJvb3QpLnF1ZXJ5U2VsZWN0b3Ioc2xjdHIgfHwgJ2NvbnRlbnQnKSkuZ2V0RGlzdHJpYnV0ZWROb2RlcygpO1xufSxcbmdldENvbnRlbnRDaGlsZHJlbjogZnVuY3Rpb24gKHNsY3RyKSB7XG5yZXR1cm4gdGhpcy5nZXRDb250ZW50Q2hpbGROb2RlcyhzbGN0cikuZmlsdGVyKGZ1bmN0aW9uIChuKSB7XG5yZXR1cm4gbi5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREU7XG59KTtcbn0sXG5maXJlOiBmdW5jdGlvbiAodHlwZSwgZGV0YWlsLCBvcHRpb25zKSB7XG5vcHRpb25zID0gb3B0aW9ucyB8fCBQb2x5bWVyLm5vYjtcbnZhciBub2RlID0gb3B0aW9ucy5ub2RlIHx8IHRoaXM7XG52YXIgZGV0YWlsID0gZGV0YWlsID09PSBudWxsIHx8IGRldGFpbCA9PT0gdW5kZWZpbmVkID8gUG9seW1lci5ub2IgOiBkZXRhaWw7XG52YXIgYnViYmxlcyA9IG9wdGlvbnMuYnViYmxlcyA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IG9wdGlvbnMuYnViYmxlcztcbnZhciBjYW5jZWxhYmxlID0gQm9vbGVhbihvcHRpb25zLmNhbmNlbGFibGUpO1xudmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KHR5cGUsIHtcbmJ1YmJsZXM6IEJvb2xlYW4oYnViYmxlcyksXG5jYW5jZWxhYmxlOiBjYW5jZWxhYmxlLFxuZGV0YWlsOiBkZXRhaWxcbn0pO1xubm9kZS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbnJldHVybiBldmVudDtcbn0sXG5hc3luYzogZnVuY3Rpb24gKGNhbGxiYWNrLCB3YWl0VGltZSkge1xucmV0dXJuIFBvbHltZXIuQXN5bmMucnVuKGNhbGxiYWNrLmJpbmQodGhpcyksIHdhaXRUaW1lKTtcbn0sXG5jYW5jZWxBc3luYzogZnVuY3Rpb24gKGhhbmRsZSkge1xuUG9seW1lci5Bc3luYy5jYW5jZWwoaGFuZGxlKTtcbn0sXG5hcnJheURlbGV0ZTogZnVuY3Rpb24gKHBhdGgsIGl0ZW0pIHtcbnZhciBpbmRleDtcbmlmIChBcnJheS5pc0FycmF5KHBhdGgpKSB7XG5pbmRleCA9IHBhdGguaW5kZXhPZihpdGVtKTtcbmlmIChpbmRleCA+PSAwKSB7XG5yZXR1cm4gcGF0aC5zcGxpY2UoaW5kZXgsIDEpO1xufVxufSBlbHNlIHtcbnZhciBhcnIgPSB0aGlzLmdldChwYXRoKTtcbmluZGV4ID0gYXJyLmluZGV4T2YoaXRlbSk7XG5pZiAoaW5kZXggPj0gMCkge1xucmV0dXJuIHRoaXMuc3BsaWNlKHBhdGgsIGluZGV4LCAxKTtcbn1cbn1cbn0sXG50cmFuc2Zvcm06IGZ1bmN0aW9uICh0cmFuc2Zvcm0sIG5vZGUpIHtcbm5vZGUgPSBub2RlIHx8IHRoaXM7XG5ub2RlLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IHRyYW5zZm9ybTtcbm5vZGUuc3R5bGUudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xufSxcbnRyYW5zbGF0ZTNkOiBmdW5jdGlvbiAoeCwgeSwgeiwgbm9kZSkge1xubm9kZSA9IG5vZGUgfHwgdGhpcztcbnRoaXMudHJhbnNmb3JtKCd0cmFuc2xhdGUzZCgnICsgeCArICcsJyArIHkgKyAnLCcgKyB6ICsgJyknLCBub2RlKTtcbn0sXG5pbXBvcnRIcmVmOiBmdW5jdGlvbiAoaHJlZiwgb25sb2FkLCBvbmVycm9yKSB7XG52YXIgbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbmwucmVsID0gJ2ltcG9ydCc7XG5sLmhyZWYgPSBocmVmO1xuaWYgKG9ubG9hZCkge1xubC5vbmxvYWQgPSBvbmxvYWQuYmluZCh0aGlzKTtcbn1cbmlmIChvbmVycm9yKSB7XG5sLm9uZXJyb3IgPSBvbmVycm9yLmJpbmQodGhpcyk7XG59XG5kb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGwpO1xucmV0dXJuIGw7XG59LFxuY3JlYXRlOiBmdW5jdGlvbiAodGFnLCBwcm9wcykge1xudmFyIGVsdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcbmlmIChwcm9wcykge1xuZm9yICh2YXIgbiBpbiBwcm9wcykge1xuZWx0W25dID0gcHJvcHNbbl07XG59XG59XG5yZXR1cm4gZWx0O1xufVxufSk7XG5Qb2x5bWVyLkJpbmQgPSB7XG5wcmVwYXJlTW9kZWw6IGZ1bmN0aW9uIChtb2RlbCkge1xubW9kZWwuX3Byb3BlcnR5RWZmZWN0cyA9IHt9O1xubW9kZWwuX2JpbmRMaXN0ZW5lcnMgPSBbXTtcblBvbHltZXIuQmFzZS5taXhpbihtb2RlbCwgdGhpcy5fbW9kZWxBcGkpO1xufSxcbl9tb2RlbEFwaToge1xuX25vdGlmeUNoYW5nZTogZnVuY3Rpb24gKHByb3BlcnR5KSB7XG52YXIgZXZlbnROYW1lID0gUG9seW1lci5DYXNlTWFwLmNhbWVsVG9EYXNoQ2FzZShwcm9wZXJ0eSkgKyAnLWNoYW5nZWQnO1xuUG9seW1lci5CYXNlLmZpcmUoZXZlbnROYW1lLCB7IHZhbHVlOiB0aGlzW3Byb3BlcnR5XSB9LCB7XG5idWJibGVzOiBmYWxzZSxcbm5vZGU6IHRoaXNcbn0pO1xufSxcbl9wcm9wZXJ0eVNldHRlcjogZnVuY3Rpb24gKHByb3BlcnR5LCB2YWx1ZSwgZWZmZWN0cywgZnJvbUFib3ZlKSB7XG52YXIgb2xkID0gdGhpcy5fX2RhdGFfX1twcm9wZXJ0eV07XG5pZiAob2xkICE9PSB2YWx1ZSAmJiAob2xkID09PSBvbGQgfHwgdmFsdWUgPT09IHZhbHVlKSkge1xudGhpcy5fX2RhdGFfX1twcm9wZXJ0eV0gPSB2YWx1ZTtcbmlmICh0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcpIHtcbnRoaXMuX2NsZWFyUGF0aChwcm9wZXJ0eSk7XG59XG5pZiAodGhpcy5fcHJvcGVydHlDaGFuZ2VkKSB7XG50aGlzLl9wcm9wZXJ0eUNoYW5nZWQocHJvcGVydHksIHZhbHVlLCBvbGQpO1xufVxuaWYgKGVmZmVjdHMpIHtcbnRoaXMuX2VmZmVjdEVmZmVjdHMocHJvcGVydHksIHZhbHVlLCBlZmZlY3RzLCBvbGQsIGZyb21BYm92ZSk7XG59XG59XG5yZXR1cm4gb2xkO1xufSxcbl9fc2V0UHJvcGVydHk6IGZ1bmN0aW9uIChwcm9wZXJ0eSwgdmFsdWUsIHF1aWV0LCBub2RlKSB7XG5ub2RlID0gbm9kZSB8fCB0aGlzO1xudmFyIGVmZmVjdHMgPSBub2RlLl9wcm9wZXJ0eUVmZmVjdHMgJiYgbm9kZS5fcHJvcGVydHlFZmZlY3RzW3Byb3BlcnR5XTtcbmlmIChlZmZlY3RzKSB7XG5ub2RlLl9wcm9wZXJ0eVNldHRlcihwcm9wZXJ0eSwgdmFsdWUsIGVmZmVjdHMsIHF1aWV0KTtcbn0gZWxzZSB7XG5ub2RlW3Byb3BlcnR5XSA9IHZhbHVlO1xufVxufSxcbl9lZmZlY3RFZmZlY3RzOiBmdW5jdGlvbiAocHJvcGVydHksIHZhbHVlLCBlZmZlY3RzLCBvbGQsIGZyb21BYm92ZSkge1xuZWZmZWN0cy5mb3JFYWNoKGZ1bmN0aW9uIChmeCkge1xudmFyIGZuID0gUG9seW1lci5CaW5kWydfJyArIGZ4LmtpbmQgKyAnRWZmZWN0J107XG5pZiAoZm4pIHtcbmZuLmNhbGwodGhpcywgcHJvcGVydHksIHZhbHVlLCBmeC5lZmZlY3QsIG9sZCwgZnJvbUFib3ZlKTtcbn1cbn0sIHRoaXMpO1xufSxcbl9jbGVhclBhdGg6IGZ1bmN0aW9uIChwYXRoKSB7XG5mb3IgKHZhciBwcm9wIGluIHRoaXMuX19kYXRhX18pIHtcbmlmIChwcm9wLmluZGV4T2YocGF0aCArICcuJykgPT09IDApIHtcbnRoaXMuX19kYXRhX19bcHJvcF0gPSB1bmRlZmluZWQ7XG59XG59XG59XG59LFxuZW5zdXJlUHJvcGVydHlFZmZlY3RzOiBmdW5jdGlvbiAobW9kZWwsIHByb3BlcnR5KSB7XG52YXIgZnggPSBtb2RlbC5fcHJvcGVydHlFZmZlY3RzW3Byb3BlcnR5XTtcbmlmICghZngpIHtcbmZ4ID0gbW9kZWwuX3Byb3BlcnR5RWZmZWN0c1twcm9wZXJ0eV0gPSBbXTtcbn1cbnJldHVybiBmeDtcbn0sXG5hZGRQcm9wZXJ0eUVmZmVjdDogZnVuY3Rpb24gKG1vZGVsLCBwcm9wZXJ0eSwga2luZCwgZWZmZWN0KSB7XG52YXIgZnggPSB0aGlzLmVuc3VyZVByb3BlcnR5RWZmZWN0cyhtb2RlbCwgcHJvcGVydHkpO1xuZngucHVzaCh7XG5raW5kOiBraW5kLFxuZWZmZWN0OiBlZmZlY3Rcbn0pO1xufSxcbmNyZWF0ZUJpbmRpbmdzOiBmdW5jdGlvbiAobW9kZWwpIHtcbnZhciBmeCQgPSBtb2RlbC5fcHJvcGVydHlFZmZlY3RzO1xuaWYgKGZ4JCkge1xuZm9yICh2YXIgbiBpbiBmeCQpIHtcbnZhciBmeCA9IGZ4JFtuXTtcbmZ4LnNvcnQodGhpcy5fc29ydFByb3BlcnR5RWZmZWN0cyk7XG50aGlzLl9jcmVhdGVBY2Nlc3NvcnMobW9kZWwsIG4sIGZ4KTtcbn1cbn1cbn0sXG5fc29ydFByb3BlcnR5RWZmZWN0czogZnVuY3Rpb24gKCkge1xudmFyIEVGRkVDVF9PUkRFUiA9IHtcbidjb21wdXRlJzogMCxcbidhbm5vdGF0aW9uJzogMSxcbidjb21wdXRlZEFubm90YXRpb24nOiAyLFxuJ3JlZmxlY3QnOiAzLFxuJ25vdGlmeSc6IDQsXG4nb2JzZXJ2ZXInOiA1LFxuJ2NvbXBsZXhPYnNlcnZlcic6IDYsXG4nZnVuY3Rpb24nOiA3XG59O1xucmV0dXJuIGZ1bmN0aW9uIChhLCBiKSB7XG5yZXR1cm4gRUZGRUNUX09SREVSW2Eua2luZF0gLSBFRkZFQ1RfT1JERVJbYi5raW5kXTtcbn07XG59KCksXG5fY3JlYXRlQWNjZXNzb3JzOiBmdW5jdGlvbiAobW9kZWwsIHByb3BlcnR5LCBlZmZlY3RzKSB7XG52YXIgZGVmdW4gPSB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnJldHVybiB0aGlzLl9fZGF0YV9fW3Byb3BlcnR5XTtcbn1cbn07XG52YXIgc2V0dGVyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG50aGlzLl9wcm9wZXJ0eVNldHRlcihwcm9wZXJ0eSwgdmFsdWUsIGVmZmVjdHMpO1xufTtcbnZhciBpbmZvID0gbW9kZWwuZ2V0UHJvcGVydHlJbmZvICYmIG1vZGVsLmdldFByb3BlcnR5SW5mbyhwcm9wZXJ0eSk7XG5pZiAoaW5mbyAmJiBpbmZvLnJlYWRPbmx5KSB7XG5pZiAoIWluZm8uY29tcHV0ZWQpIHtcbm1vZGVsWydfc2V0JyArIHRoaXMudXBwZXIocHJvcGVydHkpXSA9IHNldHRlcjtcbn1cbn0gZWxzZSB7XG5kZWZ1bi5zZXQgPSBzZXR0ZXI7XG59XG5PYmplY3QuZGVmaW5lUHJvcGVydHkobW9kZWwsIHByb3BlcnR5LCBkZWZ1bik7XG59LFxudXBwZXI6IGZ1bmN0aW9uIChuYW1lKSB7XG5yZXR1cm4gbmFtZVswXS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zdWJzdHJpbmcoMSk7XG59LFxuX2FkZEFubm90YXRlZExpc3RlbmVyOiBmdW5jdGlvbiAobW9kZWwsIGluZGV4LCBwcm9wZXJ0eSwgcGF0aCwgZXZlbnQpIHtcbnZhciBmbiA9IHRoaXMuX25vdGVkTGlzdGVuZXJGYWN0b3J5KHByb3BlcnR5LCBwYXRoLCB0aGlzLl9pc1N0cnVjdHVyZWQocGF0aCksIHRoaXMuX2lzRXZlbnRCb2d1cyk7XG52YXIgZXZlbnROYW1lID0gZXZlbnQgfHwgUG9seW1lci5DYXNlTWFwLmNhbWVsVG9EYXNoQ2FzZShwcm9wZXJ0eSkgKyAnLWNoYW5nZWQnO1xubW9kZWwuX2JpbmRMaXN0ZW5lcnMucHVzaCh7XG5pbmRleDogaW5kZXgsXG5wcm9wZXJ0eTogcHJvcGVydHksXG5wYXRoOiBwYXRoLFxuY2hhbmdlZEZuOiBmbixcbmV2ZW50OiBldmVudE5hbWVcbn0pO1xufSxcbl9pc1N0cnVjdHVyZWQ6IGZ1bmN0aW9uIChwYXRoKSB7XG5yZXR1cm4gcGF0aC5pbmRleE9mKCcuJykgPiAwO1xufSxcbl9pc0V2ZW50Qm9ndXM6IGZ1bmN0aW9uIChlLCB0YXJnZXQpIHtcbnJldHVybiBlLnBhdGggJiYgZS5wYXRoWzBdICE9PSB0YXJnZXQ7XG59LFxuX25vdGVkTGlzdGVuZXJGYWN0b3J5OiBmdW5jdGlvbiAocHJvcGVydHksIHBhdGgsIGlzU3RydWN0dXJlZCwgYm9ndXNUZXN0KSB7XG5yZXR1cm4gZnVuY3Rpb24gKGUsIHRhcmdldCkge1xuaWYgKCFib2d1c1Rlc3QoZSwgdGFyZ2V0KSkge1xuaWYgKGUuZGV0YWlsICYmIGUuZGV0YWlsLnBhdGgpIHtcbnRoaXMubm90aWZ5UGF0aCh0aGlzLl9maXhQYXRoKHBhdGgsIHByb3BlcnR5LCBlLmRldGFpbC5wYXRoKSwgZS5kZXRhaWwudmFsdWUpO1xufSBlbHNlIHtcbnZhciB2YWx1ZSA9IHRhcmdldFtwcm9wZXJ0eV07XG5pZiAoIWlzU3RydWN0dXJlZCkge1xudGhpc1twYXRoXSA9IHRhcmdldFtwcm9wZXJ0eV07XG59IGVsc2Uge1xuaWYgKHRoaXMuX19kYXRhX19bcGF0aF0gIT0gdmFsdWUpIHtcbnRoaXMuc2V0KHBhdGgsIHZhbHVlKTtcbn1cbn1cbn1cbn1cbn07XG59LFxucHJlcGFyZUluc3RhbmNlOiBmdW5jdGlvbiAoaW5zdCkge1xuaW5zdC5fX2RhdGFfXyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG59LFxuc2V0dXBCaW5kTGlzdGVuZXJzOiBmdW5jdGlvbiAoaW5zdCkge1xuaW5zdC5fYmluZExpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChpbmZvKSB7XG52YXIgbm9kZSA9IGluc3QuX25vZGVzW2luZm8uaW5kZXhdO1xubm9kZS5hZGRFdmVudExpc3RlbmVyKGluZm8uZXZlbnQsIGluc3QuX25vdGlmeUxpc3RlbmVyLmJpbmQoaW5zdCwgaW5mby5jaGFuZ2VkRm4pKTtcbn0pO1xufVxufTtcblBvbHltZXIuQmFzZS5leHRlbmQoUG9seW1lci5CaW5kLCB7XG5fc2hvdWxkQWRkTGlzdGVuZXI6IGZ1bmN0aW9uIChlZmZlY3QpIHtcbnJldHVybiBlZmZlY3QubmFtZSAmJiBlZmZlY3QubW9kZSA9PT0gJ3snICYmICFlZmZlY3QubmVnYXRlICYmIGVmZmVjdC5raW5kICE9ICdhdHRyaWJ1dGUnO1xufSxcbl9hbm5vdGF0aW9uRWZmZWN0OiBmdW5jdGlvbiAoc291cmNlLCB2YWx1ZSwgZWZmZWN0KSB7XG5pZiAoc291cmNlICE9IGVmZmVjdC52YWx1ZSkge1xudmFsdWUgPSB0aGlzLmdldChlZmZlY3QudmFsdWUpO1xudGhpcy5fX2RhdGFfX1tlZmZlY3QudmFsdWVdID0gdmFsdWU7XG59XG52YXIgY2FsYyA9IGVmZmVjdC5uZWdhdGUgPyAhdmFsdWUgOiB2YWx1ZTtcbmlmICghZWZmZWN0LmN1c3RvbUV2ZW50IHx8IHRoaXMuX25vZGVzW2VmZmVjdC5pbmRleF1bZWZmZWN0Lm5hbWVdICE9PSBjYWxjKSB7XG5yZXR1cm4gdGhpcy5fYXBwbHlFZmZlY3RWYWx1ZShjYWxjLCBlZmZlY3QpO1xufVxufSxcbl9yZWZsZWN0RWZmZWN0OiBmdW5jdGlvbiAoc291cmNlKSB7XG50aGlzLnJlZmxlY3RQcm9wZXJ0eVRvQXR0cmlidXRlKHNvdXJjZSk7XG59LFxuX25vdGlmeUVmZmVjdDogZnVuY3Rpb24gKHNvdXJjZSwgdmFsdWUsIGVmZmVjdCwgb2xkLCBmcm9tQWJvdmUpIHtcbmlmICghZnJvbUFib3ZlKSB7XG50aGlzLl9ub3RpZnlDaGFuZ2Uoc291cmNlKTtcbn1cbn0sXG5fZnVuY3Rpb25FZmZlY3Q6IGZ1bmN0aW9uIChzb3VyY2UsIHZhbHVlLCBmbiwgb2xkLCBmcm9tQWJvdmUpIHtcbmZuLmNhbGwodGhpcywgc291cmNlLCB2YWx1ZSwgb2xkLCBmcm9tQWJvdmUpO1xufSxcbl9vYnNlcnZlckVmZmVjdDogZnVuY3Rpb24gKHNvdXJjZSwgdmFsdWUsIGVmZmVjdCwgb2xkKSB7XG52YXIgZm4gPSB0aGlzW2VmZmVjdC5tZXRob2RdO1xuaWYgKGZuKSB7XG5mbi5jYWxsKHRoaXMsIHZhbHVlLCBvbGQpO1xufSBlbHNlIHtcbnRoaXMuX3dhcm4odGhpcy5fbG9nZignX29ic2VydmVyRWZmZWN0JywgJ29ic2VydmVyIG1ldGhvZCBgJyArIGVmZmVjdC5tZXRob2QgKyAnYCBub3QgZGVmaW5lZCcpKTtcbn1cbn0sXG5fY29tcGxleE9ic2VydmVyRWZmZWN0OiBmdW5jdGlvbiAoc291cmNlLCB2YWx1ZSwgZWZmZWN0KSB7XG52YXIgZm4gPSB0aGlzW2VmZmVjdC5tZXRob2RdO1xuaWYgKGZuKSB7XG52YXIgYXJncyA9IFBvbHltZXIuQmluZC5fbWFyc2hhbEFyZ3ModGhpcy5fX2RhdGFfXywgZWZmZWN0LCBzb3VyY2UsIHZhbHVlKTtcbmlmIChhcmdzKSB7XG5mbi5hcHBseSh0aGlzLCBhcmdzKTtcbn1cbn0gZWxzZSB7XG50aGlzLl93YXJuKHRoaXMuX2xvZ2YoJ19jb21wbGV4T2JzZXJ2ZXJFZmZlY3QnLCAnb2JzZXJ2ZXIgbWV0aG9kIGAnICsgZWZmZWN0Lm1ldGhvZCArICdgIG5vdCBkZWZpbmVkJykpO1xufVxufSxcbl9jb21wdXRlRWZmZWN0OiBmdW5jdGlvbiAoc291cmNlLCB2YWx1ZSwgZWZmZWN0KSB7XG52YXIgYXJncyA9IFBvbHltZXIuQmluZC5fbWFyc2hhbEFyZ3ModGhpcy5fX2RhdGFfXywgZWZmZWN0LCBzb3VyY2UsIHZhbHVlKTtcbmlmIChhcmdzKSB7XG52YXIgZm4gPSB0aGlzW2VmZmVjdC5tZXRob2RdO1xuaWYgKGZuKSB7XG50aGlzLl9fc2V0UHJvcGVydHkoZWZmZWN0LnByb3BlcnR5LCBmbi5hcHBseSh0aGlzLCBhcmdzKSk7XG59IGVsc2Uge1xudGhpcy5fd2Fybih0aGlzLl9sb2dmKCdfY29tcHV0ZUVmZmVjdCcsICdjb21wdXRlIG1ldGhvZCBgJyArIGVmZmVjdC5tZXRob2QgKyAnYCBub3QgZGVmaW5lZCcpKTtcbn1cbn1cbn0sXG5fYW5ub3RhdGVkQ29tcHV0YXRpb25FZmZlY3Q6IGZ1bmN0aW9uIChzb3VyY2UsIHZhbHVlLCBlZmZlY3QpIHtcbnZhciBjb21wdXRlZEhvc3QgPSB0aGlzLl9yb290RGF0YUhvc3QgfHwgdGhpcztcbnZhciBmbiA9IGNvbXB1dGVkSG9zdFtlZmZlY3QubWV0aG9kXTtcbmlmIChmbikge1xudmFyIGFyZ3MgPSBQb2x5bWVyLkJpbmQuX21hcnNoYWxBcmdzKHRoaXMuX19kYXRhX18sIGVmZmVjdCwgc291cmNlLCB2YWx1ZSk7XG5pZiAoYXJncykge1xudmFyIGNvbXB1dGVkdmFsdWUgPSBmbi5hcHBseShjb21wdXRlZEhvc3QsIGFyZ3MpO1xuaWYgKGVmZmVjdC5uZWdhdGUpIHtcbmNvbXB1dGVkdmFsdWUgPSAhY29tcHV0ZWR2YWx1ZTtcbn1cbnRoaXMuX2FwcGx5RWZmZWN0VmFsdWUoY29tcHV0ZWR2YWx1ZSwgZWZmZWN0KTtcbn1cbn0gZWxzZSB7XG5jb21wdXRlZEhvc3QuX3dhcm4oY29tcHV0ZWRIb3N0Ll9sb2dmKCdfYW5ub3RhdGVkQ29tcHV0YXRpb25FZmZlY3QnLCAnY29tcHV0ZSBtZXRob2QgYCcgKyBlZmZlY3QubWV0aG9kICsgJ2Agbm90IGRlZmluZWQnKSk7XG59XG59LFxuX21hcnNoYWxBcmdzOiBmdW5jdGlvbiAobW9kZWwsIGVmZmVjdCwgcGF0aCwgdmFsdWUpIHtcbnZhciB2YWx1ZXMgPSBbXTtcbnZhciBhcmdzID0gZWZmZWN0LmFyZ3M7XG5mb3IgKHZhciBpID0gMCwgbCA9IGFyZ3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG52YXIgYXJnID0gYXJnc1tpXTtcbnZhciBuYW1lID0gYXJnLm5hbWU7XG52YXIgdjtcbmlmIChhcmcubGl0ZXJhbCkge1xudiA9IGFyZy52YWx1ZTtcbn0gZWxzZSBpZiAoYXJnLnN0cnVjdHVyZWQpIHtcbnYgPSBQb2x5bWVyLkJhc2UuZ2V0KG5hbWUsIG1vZGVsKTtcbn0gZWxzZSB7XG52ID0gbW9kZWxbbmFtZV07XG59XG5pZiAoYXJncy5sZW5ndGggPiAxICYmIHYgPT09IHVuZGVmaW5lZCkge1xucmV0dXJuO1xufVxuaWYgKGFyZy53aWxkY2FyZCkge1xudmFyIGJhc2VDaGFuZ2VkID0gbmFtZS5pbmRleE9mKHBhdGggKyAnLicpID09PSAwO1xudmFyIG1hdGNoZXMgPSBlZmZlY3QudHJpZ2dlci5uYW1lLmluZGV4T2YobmFtZSkgPT09IDAgJiYgIWJhc2VDaGFuZ2VkO1xudmFsdWVzW2ldID0ge1xucGF0aDogbWF0Y2hlcyA/IHBhdGggOiBuYW1lLFxudmFsdWU6IG1hdGNoZXMgPyB2YWx1ZSA6IHYsXG5iYXNlOiB2XG59O1xufSBlbHNlIHtcbnZhbHVlc1tpXSA9IHY7XG59XG59XG5yZXR1cm4gdmFsdWVzO1xufVxufSk7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX2FkZFByb3BlcnR5RWZmZWN0OiBmdW5jdGlvbiAocHJvcGVydHksIGtpbmQsIGVmZmVjdCkge1xuUG9seW1lci5CaW5kLmFkZFByb3BlcnR5RWZmZWN0KHRoaXMsIHByb3BlcnR5LCBraW5kLCBlZmZlY3QpO1xufSxcbl9wcmVwRWZmZWN0czogZnVuY3Rpb24gKCkge1xuUG9seW1lci5CaW5kLnByZXBhcmVNb2RlbCh0aGlzKTtcbnRoaXMuX2FkZEFubm90YXRpb25FZmZlY3RzKHRoaXMuX25vdGVzKTtcbn0sXG5fcHJlcEJpbmRpbmdzOiBmdW5jdGlvbiAoKSB7XG5Qb2x5bWVyLkJpbmQuY3JlYXRlQmluZGluZ3ModGhpcyk7XG59LFxuX2FkZFByb3BlcnR5RWZmZWN0czogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcbmlmIChwcm9wZXJ0aWVzKSB7XG5mb3IgKHZhciBwIGluIHByb3BlcnRpZXMpIHtcbnZhciBwcm9wID0gcHJvcGVydGllc1twXTtcbmlmIChwcm9wLm9ic2VydmVyKSB7XG50aGlzLl9hZGRPYnNlcnZlckVmZmVjdChwLCBwcm9wLm9ic2VydmVyKTtcbn1cbmlmIChwcm9wLmNvbXB1dGVkKSB7XG5wcm9wLnJlYWRPbmx5ID0gdHJ1ZTtcbnRoaXMuX2FkZENvbXB1dGVkRWZmZWN0KHAsIHByb3AuY29tcHV0ZWQpO1xufVxuaWYgKHByb3Aubm90aWZ5KSB7XG50aGlzLl9hZGRQcm9wZXJ0eUVmZmVjdChwLCAnbm90aWZ5Jyk7XG59XG5pZiAocHJvcC5yZWZsZWN0VG9BdHRyaWJ1dGUpIHtcbnRoaXMuX2FkZFByb3BlcnR5RWZmZWN0KHAsICdyZWZsZWN0Jyk7XG59XG5pZiAocHJvcC5yZWFkT25seSkge1xuUG9seW1lci5CaW5kLmVuc3VyZVByb3BlcnR5RWZmZWN0cyh0aGlzLCBwKTtcbn1cbn1cbn1cbn0sXG5fYWRkQ29tcHV0ZWRFZmZlY3Q6IGZ1bmN0aW9uIChuYW1lLCBleHByZXNzaW9uKSB7XG52YXIgc2lnID0gdGhpcy5fcGFyc2VNZXRob2QoZXhwcmVzc2lvbik7XG5zaWcuYXJncy5mb3JFYWNoKGZ1bmN0aW9uIChhcmcpIHtcbnRoaXMuX2FkZFByb3BlcnR5RWZmZWN0KGFyZy5tb2RlbCwgJ2NvbXB1dGUnLCB7XG5tZXRob2Q6IHNpZy5tZXRob2QsXG5hcmdzOiBzaWcuYXJncyxcbnRyaWdnZXI6IGFyZyxcbnByb3BlcnR5OiBuYW1lXG59KTtcbn0sIHRoaXMpO1xufSxcbl9hZGRPYnNlcnZlckVmZmVjdDogZnVuY3Rpb24gKHByb3BlcnR5LCBvYnNlcnZlcikge1xudGhpcy5fYWRkUHJvcGVydHlFZmZlY3QocHJvcGVydHksICdvYnNlcnZlcicsIHtcbm1ldGhvZDogb2JzZXJ2ZXIsXG5wcm9wZXJ0eTogcHJvcGVydHlcbn0pO1xufSxcbl9hZGRDb21wbGV4T2JzZXJ2ZXJFZmZlY3RzOiBmdW5jdGlvbiAob2JzZXJ2ZXJzKSB7XG5pZiAob2JzZXJ2ZXJzKSB7XG5vYnNlcnZlcnMuZm9yRWFjaChmdW5jdGlvbiAob2JzZXJ2ZXIpIHtcbnRoaXMuX2FkZENvbXBsZXhPYnNlcnZlckVmZmVjdChvYnNlcnZlcik7XG59LCB0aGlzKTtcbn1cbn0sXG5fYWRkQ29tcGxleE9ic2VydmVyRWZmZWN0OiBmdW5jdGlvbiAob2JzZXJ2ZXIpIHtcbnZhciBzaWcgPSB0aGlzLl9wYXJzZU1ldGhvZChvYnNlcnZlcik7XG5zaWcuYXJncy5mb3JFYWNoKGZ1bmN0aW9uIChhcmcpIHtcbnRoaXMuX2FkZFByb3BlcnR5RWZmZWN0KGFyZy5tb2RlbCwgJ2NvbXBsZXhPYnNlcnZlcicsIHtcbm1ldGhvZDogc2lnLm1ldGhvZCxcbmFyZ3M6IHNpZy5hcmdzLFxudHJpZ2dlcjogYXJnXG59KTtcbn0sIHRoaXMpO1xufSxcbl9hZGRBbm5vdGF0aW9uRWZmZWN0czogZnVuY3Rpb24gKG5vdGVzKSB7XG50aGlzLl9ub2RlcyA9IFtdO1xubm90ZXMuZm9yRWFjaChmdW5jdGlvbiAobm90ZSkge1xudmFyIGluZGV4ID0gdGhpcy5fbm9kZXMucHVzaChub3RlKSAtIDE7XG5ub3RlLmJpbmRpbmdzLmZvckVhY2goZnVuY3Rpb24gKGJpbmRpbmcpIHtcbnRoaXMuX2FkZEFubm90YXRpb25FZmZlY3QoYmluZGluZywgaW5kZXgpO1xufSwgdGhpcyk7XG59LCB0aGlzKTtcbn0sXG5fYWRkQW5ub3RhdGlvbkVmZmVjdDogZnVuY3Rpb24gKG5vdGUsIGluZGV4KSB7XG5pZiAoUG9seW1lci5CaW5kLl9zaG91bGRBZGRMaXN0ZW5lcihub3RlKSkge1xuUG9seW1lci5CaW5kLl9hZGRBbm5vdGF0ZWRMaXN0ZW5lcih0aGlzLCBpbmRleCwgbm90ZS5uYW1lLCBub3RlLnZhbHVlLCBub3RlLmV2ZW50KTtcbn1cbmlmIChub3RlLnNpZ25hdHVyZSkge1xudGhpcy5fYWRkQW5ub3RhdGVkQ29tcHV0YXRpb25FZmZlY3Qobm90ZSwgaW5kZXgpO1xufSBlbHNlIHtcbm5vdGUuaW5kZXggPSBpbmRleDtcbnRoaXMuX2FkZFByb3BlcnR5RWZmZWN0KG5vdGUubW9kZWwsICdhbm5vdGF0aW9uJywgbm90ZSk7XG59XG59LFxuX2FkZEFubm90YXRlZENvbXB1dGF0aW9uRWZmZWN0OiBmdW5jdGlvbiAobm90ZSwgaW5kZXgpIHtcbnZhciBzaWcgPSBub3RlLnNpZ25hdHVyZTtcbmlmIChzaWcuc3RhdGljKSB7XG50aGlzLl9fYWRkQW5ub3RhdGVkQ29tcHV0YXRpb25FZmZlY3QoJ19fc3RhdGljX18nLCBpbmRleCwgbm90ZSwgc2lnLCBudWxsKTtcbn0gZWxzZSB7XG5zaWcuYXJncy5mb3JFYWNoKGZ1bmN0aW9uIChhcmcpIHtcbmlmICghYXJnLmxpdGVyYWwpIHtcbnRoaXMuX19hZGRBbm5vdGF0ZWRDb21wdXRhdGlvbkVmZmVjdChhcmcubW9kZWwsIGluZGV4LCBub3RlLCBzaWcsIGFyZyk7XG59XG59LCB0aGlzKTtcbn1cbn0sXG5fX2FkZEFubm90YXRlZENvbXB1dGF0aW9uRWZmZWN0OiBmdW5jdGlvbiAocHJvcGVydHksIGluZGV4LCBub3RlLCBzaWcsIHRyaWdnZXIpIHtcbnRoaXMuX2FkZFByb3BlcnR5RWZmZWN0KHByb3BlcnR5LCAnYW5ub3RhdGVkQ29tcHV0YXRpb24nLCB7XG5pbmRleDogaW5kZXgsXG5raW5kOiBub3RlLmtpbmQsXG5wcm9wZXJ0eTogbm90ZS5uYW1lLFxubmVnYXRlOiBub3RlLm5lZ2F0ZSxcbm1ldGhvZDogc2lnLm1ldGhvZCxcbmFyZ3M6IHNpZy5hcmdzLFxudHJpZ2dlcjogdHJpZ2dlclxufSk7XG59LFxuX3BhcnNlTWV0aG9kOiBmdW5jdGlvbiAoZXhwcmVzc2lvbikge1xudmFyIG0gPSBleHByZXNzaW9uLm1hdGNoKC8oXFx3KilcXCgoLiopXFwpLyk7XG5pZiAobSkge1xudmFyIHNpZyA9IHtcbm1ldGhvZDogbVsxXSxcbnN0YXRpYzogdHJ1ZVxufTtcbmlmIChtWzJdLnRyaW0oKSkge1xudmFyIGFyZ3MgPSBtWzJdLnJlcGxhY2UoL1xcXFwsL2csICcmY29tbWE7Jykuc3BsaXQoJywnKTtcbnJldHVybiB0aGlzLl9wYXJzZUFyZ3MoYXJncywgc2lnKTtcbn0gZWxzZSB7XG5zaWcuYXJncyA9IFBvbHltZXIubmFyO1xucmV0dXJuIHNpZztcbn1cbn1cbn0sXG5fcGFyc2VBcmdzOiBmdW5jdGlvbiAoYXJnTGlzdCwgc2lnKSB7XG5zaWcuYXJncyA9IGFyZ0xpc3QubWFwKGZ1bmN0aW9uIChyYXdBcmcpIHtcbnZhciBhcmcgPSB0aGlzLl9wYXJzZUFyZyhyYXdBcmcpO1xuaWYgKCFhcmcubGl0ZXJhbCkge1xuc2lnLnN0YXRpYyA9IGZhbHNlO1xufVxucmV0dXJuIGFyZztcbn0sIHRoaXMpO1xucmV0dXJuIHNpZztcbn0sXG5fcGFyc2VBcmc6IGZ1bmN0aW9uIChyYXdBcmcpIHtcbnZhciBhcmcgPSByYXdBcmcudHJpbSgpLnJlcGxhY2UoLyZjb21tYTsvZywgJywnKS5yZXBsYWNlKC9cXFxcKC4pL2csICckMScpO1xudmFyIGEgPSB7XG5uYW1lOiBhcmcsXG5tb2RlbDogdGhpcy5fbW9kZWxGb3JQYXRoKGFyZylcbn07XG52YXIgZmMgPSBhcmdbMF07XG5pZiAoZmMgPj0gJzAnICYmIGZjIDw9ICc5Jykge1xuZmMgPSAnIyc7XG59XG5zd2l0Y2ggKGZjKSB7XG5jYXNlICdcXCcnOlxuY2FzZSAnXCInOlxuYS52YWx1ZSA9IGFyZy5zbGljZSgxLCAtMSk7XG5hLmxpdGVyYWwgPSB0cnVlO1xuYnJlYWs7XG5jYXNlICcjJzpcbmEudmFsdWUgPSBOdW1iZXIoYXJnKTtcbmEubGl0ZXJhbCA9IHRydWU7XG5icmVhaztcbn1cbmlmICghYS5saXRlcmFsKSB7XG5hLnN0cnVjdHVyZWQgPSBhcmcuaW5kZXhPZignLicpID4gMDtcbmlmIChhLnN0cnVjdHVyZWQpIHtcbmEud2lsZGNhcmQgPSBhcmcuc2xpY2UoLTIpID09ICcuKic7XG5pZiAoYS53aWxkY2FyZCkge1xuYS5uYW1lID0gYXJnLnNsaWNlKDAsIC0yKTtcbn1cbn1cbn1cbnJldHVybiBhO1xufSxcbl9tYXJzaGFsSW5zdGFuY2VFZmZlY3RzOiBmdW5jdGlvbiAoKSB7XG5Qb2x5bWVyLkJpbmQucHJlcGFyZUluc3RhbmNlKHRoaXMpO1xuUG9seW1lci5CaW5kLnNldHVwQmluZExpc3RlbmVycyh0aGlzKTtcbn0sXG5fYXBwbHlFZmZlY3RWYWx1ZTogZnVuY3Rpb24gKHZhbHVlLCBpbmZvKSB7XG52YXIgbm9kZSA9IHRoaXMuX25vZGVzW2luZm8uaW5kZXhdO1xudmFyIHByb3BlcnR5ID0gaW5mby5wcm9wZXJ0eSB8fCBpbmZvLm5hbWUgfHwgJ3RleHRDb250ZW50JztcbmlmIChpbmZvLmtpbmQgPT0gJ2F0dHJpYnV0ZScpIHtcbnRoaXMuc2VyaWFsaXplVmFsdWVUb0F0dHJpYnV0ZSh2YWx1ZSwgcHJvcGVydHksIG5vZGUpO1xufSBlbHNlIHtcbmlmIChwcm9wZXJ0eSA9PT0gJ2NsYXNzTmFtZScpIHtcbnZhbHVlID0gdGhpcy5fc2NvcGVFbGVtZW50Q2xhc3Mobm9kZSwgdmFsdWUpO1xufVxuaWYgKHByb3BlcnR5ID09PSAndGV4dENvbnRlbnQnIHx8IG5vZGUubG9jYWxOYW1lID09ICdpbnB1dCcgJiYgcHJvcGVydHkgPT0gJ3ZhbHVlJykge1xudmFsdWUgPSB2YWx1ZSA9PSB1bmRlZmluZWQgPyAnJyA6IHZhbHVlO1xufVxucmV0dXJuIG5vZGVbcHJvcGVydHldID0gdmFsdWU7XG59XG59LFxuX2V4ZWN1dGVTdGF0aWNFZmZlY3RzOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5fcHJvcGVydHlFZmZlY3RzLl9fc3RhdGljX18pIHtcbnRoaXMuX2VmZmVjdEVmZmVjdHMoJ19fc3RhdGljX18nLCBudWxsLCB0aGlzLl9wcm9wZXJ0eUVmZmVjdHMuX19zdGF0aWNfXyk7XG59XG59XG59KTtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5fc2V0dXBDb25maWd1cmU6IGZ1bmN0aW9uIChpbml0aWFsQ29uZmlnKSB7XG50aGlzLl9jb25maWcgPSBpbml0aWFsQ29uZmlnIHx8IHt9O1xudGhpcy5faGFuZGxlcnMgPSBbXTtcbn0sXG5fbWFyc2hhbEF0dHJpYnV0ZXM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3Rha2VBdHRyaWJ1dGVzVG9Nb2RlbCh0aGlzLl9jb25maWcpO1xufSxcbl9jb25maWdWYWx1ZTogZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG50aGlzLl9jb25maWdbbmFtZV0gPSB2YWx1ZTtcbn0sXG5fYmVmb3JlQ2xpZW50c1JlYWR5OiBmdW5jdGlvbiAoKSB7XG50aGlzLl9jb25maWd1cmUoKTtcbn0sXG5fY29uZmlndXJlOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9jb25maWd1cmVBbm5vdGF0aW9uUmVmZXJlbmNlcygpO1xudGhpcy5fYWJvdmVDb25maWcgPSB0aGlzLm1peGluKHt9LCB0aGlzLl9jb25maWcpO1xudmFyIGNvbmZpZyA9IHt9O1xudGhpcy5iZWhhdmlvcnMuZm9yRWFjaChmdW5jdGlvbiAoYikge1xudGhpcy5fY29uZmlndXJlUHJvcGVydGllcyhiLnByb3BlcnRpZXMsIGNvbmZpZyk7XG59LCB0aGlzKTtcbnRoaXMuX2NvbmZpZ3VyZVByb3BlcnRpZXModGhpcy5wcm9wZXJ0aWVzLCBjb25maWcpO1xudGhpcy5fbWl4aW5Db25maWd1cmUoY29uZmlnLCB0aGlzLl9hYm92ZUNvbmZpZyk7XG50aGlzLl9jb25maWcgPSBjb25maWc7XG50aGlzLl9kaXN0cmlidXRlQ29uZmlnKHRoaXMuX2NvbmZpZyk7XG59LFxuX2NvbmZpZ3VyZVByb3BlcnRpZXM6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzLCBjb25maWcpIHtcbmZvciAodmFyIGkgaW4gcHJvcGVydGllcykge1xudmFyIGMgPSBwcm9wZXJ0aWVzW2ldO1xuaWYgKGMudmFsdWUgIT09IHVuZGVmaW5lZCkge1xudmFyIHZhbHVlID0gYy52YWx1ZTtcbmlmICh0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJykge1xudmFsdWUgPSB2YWx1ZS5jYWxsKHRoaXMsIHRoaXMuX2NvbmZpZyk7XG59XG5jb25maWdbaV0gPSB2YWx1ZTtcbn1cbn1cbn0sXG5fbWl4aW5Db25maWd1cmU6IGZ1bmN0aW9uIChhLCBiKSB7XG5mb3IgKHZhciBwcm9wIGluIGIpIHtcbmlmICghdGhpcy5nZXRQcm9wZXJ0eUluZm8ocHJvcCkucmVhZE9ubHkpIHtcbmFbcHJvcF0gPSBiW3Byb3BdO1xufVxufVxufSxcbl9kaXN0cmlidXRlQ29uZmlnOiBmdW5jdGlvbiAoY29uZmlnKSB7XG52YXIgZngkID0gdGhpcy5fcHJvcGVydHlFZmZlY3RzO1xuaWYgKGZ4JCkge1xuZm9yICh2YXIgcCBpbiBjb25maWcpIHtcbnZhciBmeCA9IGZ4JFtwXTtcbmlmIChmeCkge1xuZm9yICh2YXIgaSA9IDAsIGwgPSBmeC5sZW5ndGgsIHg7IGkgPCBsICYmICh4ID0gZnhbaV0pOyBpKyspIHtcbmlmICh4LmtpbmQgPT09ICdhbm5vdGF0aW9uJykge1xudmFyIG5vZGUgPSB0aGlzLl9ub2Rlc1t4LmVmZmVjdC5pbmRleF07XG5pZiAobm9kZS5fY29uZmlnVmFsdWUpIHtcbnZhciB2YWx1ZSA9IHAgPT09IHguZWZmZWN0LnZhbHVlID8gY29uZmlnW3BdIDogdGhpcy5nZXQoeC5lZmZlY3QudmFsdWUsIGNvbmZpZyk7XG5ub2RlLl9jb25maWdWYWx1ZSh4LmVmZmVjdC5uYW1lLCB2YWx1ZSk7XG59XG59XG59XG59XG59XG59XG59LFxuX2FmdGVyQ2xpZW50c1JlYWR5OiBmdW5jdGlvbiAoKSB7XG50aGlzLl9leGVjdXRlU3RhdGljRWZmZWN0cygpO1xudGhpcy5fYXBwbHlDb25maWcodGhpcy5fY29uZmlnLCB0aGlzLl9hYm92ZUNvbmZpZyk7XG50aGlzLl9mbHVzaEhhbmRsZXJzKCk7XG59LFxuX2FwcGx5Q29uZmlnOiBmdW5jdGlvbiAoY29uZmlnLCBhYm92ZUNvbmZpZykge1xuZm9yICh2YXIgbiBpbiBjb25maWcpIHtcbmlmICh0aGlzW25dID09PSB1bmRlZmluZWQpIHtcbnRoaXMuX19zZXRQcm9wZXJ0eShuLCBjb25maWdbbl0sIG4gaW4gYWJvdmVDb25maWcpO1xufVxufVxufSxcbl9ub3RpZnlMaXN0ZW5lcjogZnVuY3Rpb24gKGZuLCBlKSB7XG5pZiAoIXRoaXMuX2NsaWVudHNSZWFkaWVkKSB7XG50aGlzLl9xdWV1ZUhhbmRsZXIoW1xuZm4sXG5lLFxuZS50YXJnZXRcbl0pO1xufSBlbHNlIHtcbnJldHVybiBmbi5jYWxsKHRoaXMsIGUsIGUudGFyZ2V0KTtcbn1cbn0sXG5fcXVldWVIYW5kbGVyOiBmdW5jdGlvbiAoYXJncykge1xudGhpcy5faGFuZGxlcnMucHVzaChhcmdzKTtcbn0sXG5fZmx1c2hIYW5kbGVyczogZnVuY3Rpb24gKCkge1xudmFyIGgkID0gdGhpcy5faGFuZGxlcnM7XG5mb3IgKHZhciBpID0gMCwgbCA9IGgkLmxlbmd0aCwgaDsgaSA8IGwgJiYgKGggPSBoJFtpXSk7IGkrKykge1xuaFswXS5jYWxsKHRoaXMsIGhbMV0sIGhbMl0pO1xufVxufVxufSk7XG4oZnVuY3Rpb24gKCkge1xuJ3VzZSBzdHJpY3QnO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbm5vdGlmeVBhdGg6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSwgZnJvbUFib3ZlKSB7XG52YXIgb2xkID0gdGhpcy5fcHJvcGVydHlTZXR0ZXIocGF0aCwgdmFsdWUpO1xuaWYgKG9sZCAhPT0gdmFsdWUgJiYgKG9sZCA9PT0gb2xkIHx8IHZhbHVlID09PSB2YWx1ZSkpIHtcbnRoaXMuX3BhdGhFZmZlY3RvcihwYXRoLCB2YWx1ZSk7XG5pZiAoIWZyb21BYm92ZSkge1xudGhpcy5fbm90aWZ5UGF0aChwYXRoLCB2YWx1ZSk7XG59XG5yZXR1cm4gdHJ1ZTtcbn1cbn0sXG5fZ2V0UGF0aFBhcnRzOiBmdW5jdGlvbiAocGF0aCkge1xuaWYgKEFycmF5LmlzQXJyYXkocGF0aCkpIHtcbnZhciBwYXJ0cyA9IFtdO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKSB7XG52YXIgYXJncyA9IHBhdGhbaV0udG9TdHJpbmcoKS5zcGxpdCgnLicpO1xuZm9yICh2YXIgaiA9IDA7IGogPCBhcmdzLmxlbmd0aDsgaisrKSB7XG5wYXJ0cy5wdXNoKGFyZ3Nbal0pO1xufVxufVxucmV0dXJuIHBhcnRzO1xufSBlbHNlIHtcbnJldHVybiBwYXRoLnRvU3RyaW5nKCkuc3BsaXQoJy4nKTtcbn1cbn0sXG5zZXQ6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSwgcm9vdCkge1xudmFyIHByb3AgPSByb290IHx8IHRoaXM7XG52YXIgcGFydHMgPSB0aGlzLl9nZXRQYXRoUGFydHMocGF0aCk7XG52YXIgYXJyYXk7XG52YXIgbGFzdCA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuaWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcbmZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoIC0gMTsgaSsrKSB7XG5wcm9wID0gcHJvcFtwYXJ0c1tpXV07XG5pZiAoYXJyYXkpIHtcbnBhcnRzW2ldID0gUG9seW1lci5Db2xsZWN0aW9uLmdldChhcnJheSkuZ2V0S2V5KHByb3ApO1xufVxuaWYgKCFwcm9wKSB7XG5yZXR1cm47XG59XG5hcnJheSA9IEFycmF5LmlzQXJyYXkocHJvcCkgPyBwcm9wIDogbnVsbDtcbn1cbmlmIChhcnJheSkge1xudmFyIGNvbGwgPSBQb2x5bWVyLkNvbGxlY3Rpb24uZ2V0KGFycmF5KTtcbnZhciBvbGQgPSBwcm9wW2xhc3RdO1xudmFyIGtleSA9IGNvbGwuZ2V0S2V5KG9sZCk7XG5pZiAoa2V5KSB7XG5wYXJ0c1tpXSA9IGtleTtcbmNvbGwuc2V0SXRlbShrZXksIHZhbHVlKTtcbn1cbn1cbnByb3BbbGFzdF0gPSB2YWx1ZTtcbmlmICghcm9vdCkge1xudGhpcy5ub3RpZnlQYXRoKHBhcnRzLmpvaW4oJy4nKSwgdmFsdWUpO1xufVxufSBlbHNlIHtcbnByb3BbcGF0aF0gPSB2YWx1ZTtcbn1cbn0sXG5nZXQ6IGZ1bmN0aW9uIChwYXRoLCByb290KSB7XG52YXIgcHJvcCA9IHJvb3QgfHwgdGhpcztcbnZhciBwYXJ0cyA9IHRoaXMuX2dldFBhdGhQYXJ0cyhwYXRoKTtcbnZhciBsYXN0ID0gcGFydHMucG9wKCk7XG53aGlsZSAocGFydHMubGVuZ3RoKSB7XG5wcm9wID0gcHJvcFtwYXJ0cy5zaGlmdCgpXTtcbmlmICghcHJvcCkge1xucmV0dXJuO1xufVxufVxucmV0dXJuIHByb3BbbGFzdF07XG59LFxuX3BhdGhFZmZlY3RvcjogZnVuY3Rpb24gKHBhdGgsIHZhbHVlKSB7XG52YXIgbW9kZWwgPSB0aGlzLl9tb2RlbEZvclBhdGgocGF0aCk7XG52YXIgZngkID0gdGhpcy5fcHJvcGVydHlFZmZlY3RzW21vZGVsXTtcbmlmIChmeCQpIHtcbmZ4JC5mb3JFYWNoKGZ1bmN0aW9uIChmeCkge1xudmFyIGZ4Rm4gPSB0aGlzWydfJyArIGZ4LmtpbmQgKyAnUGF0aEVmZmVjdCddO1xuaWYgKGZ4Rm4pIHtcbmZ4Rm4uY2FsbCh0aGlzLCBwYXRoLCB2YWx1ZSwgZnguZWZmZWN0KTtcbn1cbn0sIHRoaXMpO1xufVxuaWYgKHRoaXMuX2JvdW5kUGF0aHMpIHtcbnRoaXMuX25vdGlmeUJvdW5kUGF0aHMocGF0aCwgdmFsdWUpO1xufVxufSxcbl9hbm5vdGF0aW9uUGF0aEVmZmVjdDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlLCBlZmZlY3QpIHtcbmlmIChlZmZlY3QudmFsdWUgPT09IHBhdGggfHwgZWZmZWN0LnZhbHVlLmluZGV4T2YocGF0aCArICcuJykgPT09IDApIHtcblBvbHltZXIuQmluZC5fYW5ub3RhdGlvbkVmZmVjdC5jYWxsKHRoaXMsIHBhdGgsIHZhbHVlLCBlZmZlY3QpO1xufSBlbHNlIGlmIChwYXRoLmluZGV4T2YoZWZmZWN0LnZhbHVlICsgJy4nKSA9PT0gMCAmJiAhZWZmZWN0Lm5lZ2F0ZSkge1xudmFyIG5vZGUgPSB0aGlzLl9ub2Rlc1tlZmZlY3QuaW5kZXhdO1xuaWYgKG5vZGUgJiYgbm9kZS5ub3RpZnlQYXRoKSB7XG52YXIgcCA9IHRoaXMuX2ZpeFBhdGgoZWZmZWN0Lm5hbWUsIGVmZmVjdC52YWx1ZSwgcGF0aCk7XG5ub2RlLm5vdGlmeVBhdGgocCwgdmFsdWUsIHRydWUpO1xufVxufVxufSxcbl9jb21wbGV4T2JzZXJ2ZXJQYXRoRWZmZWN0OiBmdW5jdGlvbiAocGF0aCwgdmFsdWUsIGVmZmVjdCkge1xuaWYgKHRoaXMuX3BhdGhNYXRjaGVzRWZmZWN0KHBhdGgsIGVmZmVjdCkpIHtcblBvbHltZXIuQmluZC5fY29tcGxleE9ic2VydmVyRWZmZWN0LmNhbGwodGhpcywgcGF0aCwgdmFsdWUsIGVmZmVjdCk7XG59XG59LFxuX2NvbXB1dGVQYXRoRWZmZWN0OiBmdW5jdGlvbiAocGF0aCwgdmFsdWUsIGVmZmVjdCkge1xuaWYgKHRoaXMuX3BhdGhNYXRjaGVzRWZmZWN0KHBhdGgsIGVmZmVjdCkpIHtcblBvbHltZXIuQmluZC5fY29tcHV0ZUVmZmVjdC5jYWxsKHRoaXMsIHBhdGgsIHZhbHVlLCBlZmZlY3QpO1xufVxufSxcbl9hbm5vdGF0ZWRDb21wdXRhdGlvblBhdGhFZmZlY3Q6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSwgZWZmZWN0KSB7XG5pZiAodGhpcy5fcGF0aE1hdGNoZXNFZmZlY3QocGF0aCwgZWZmZWN0KSkge1xuUG9seW1lci5CaW5kLl9hbm5vdGF0ZWRDb21wdXRhdGlvbkVmZmVjdC5jYWxsKHRoaXMsIHBhdGgsIHZhbHVlLCBlZmZlY3QpO1xufVxufSxcbl9wYXRoTWF0Y2hlc0VmZmVjdDogZnVuY3Rpb24gKHBhdGgsIGVmZmVjdCkge1xudmFyIGVmZmVjdEFyZyA9IGVmZmVjdC50cmlnZ2VyLm5hbWU7XG5yZXR1cm4gZWZmZWN0QXJnID09IHBhdGggfHwgZWZmZWN0QXJnLmluZGV4T2YocGF0aCArICcuJykgPT09IDAgfHwgZWZmZWN0LnRyaWdnZXIud2lsZGNhcmQgJiYgcGF0aC5pbmRleE9mKGVmZmVjdEFyZykgPT09IDA7XG59LFxubGlua1BhdGhzOiBmdW5jdGlvbiAodG8sIGZyb20pIHtcbnRoaXMuX2JvdW5kUGF0aHMgPSB0aGlzLl9ib3VuZFBhdGhzIHx8IHt9O1xuaWYgKGZyb20pIHtcbnRoaXMuX2JvdW5kUGF0aHNbdG9dID0gZnJvbTtcbn0gZWxzZSB7XG50aGlzLnVuYmluZFBhdGgodG8pO1xufVxufSxcbnVubGlua1BhdGhzOiBmdW5jdGlvbiAocGF0aCkge1xuaWYgKHRoaXMuX2JvdW5kUGF0aHMpIHtcbmRlbGV0ZSB0aGlzLl9ib3VuZFBhdGhzW3BhdGhdO1xufVxufSxcbl9ub3RpZnlCb3VuZFBhdGhzOiBmdW5jdGlvbiAocGF0aCwgdmFsdWUpIHtcbnZhciBmcm9tLCB0bztcbmZvciAodmFyIGEgaW4gdGhpcy5fYm91bmRQYXRocykge1xudmFyIGIgPSB0aGlzLl9ib3VuZFBhdGhzW2FdO1xuaWYgKHBhdGguaW5kZXhPZihhICsgJy4nKSA9PSAwKSB7XG5mcm9tID0gYTtcbnRvID0gYjtcbmJyZWFrO1xufVxuaWYgKHBhdGguaW5kZXhPZihiICsgJy4nKSA9PSAwKSB7XG5mcm9tID0gYjtcbnRvID0gYTtcbmJyZWFrO1xufVxufVxuaWYgKGZyb20gJiYgdG8pIHtcbnZhciBwID0gdGhpcy5fZml4UGF0aCh0bywgZnJvbSwgcGF0aCk7XG50aGlzLm5vdGlmeVBhdGgocCwgdmFsdWUpO1xufVxufSxcbl9maXhQYXRoOiBmdW5jdGlvbiAocHJvcGVydHksIHJvb3QsIHBhdGgpIHtcbnJldHVybiBwcm9wZXJ0eSArIHBhdGguc2xpY2Uocm9vdC5sZW5ndGgpO1xufSxcbl9ub3RpZnlQYXRoOiBmdW5jdGlvbiAocGF0aCwgdmFsdWUpIHtcbnZhciByb290TmFtZSA9IHRoaXMuX21vZGVsRm9yUGF0aChwYXRoKTtcbnZhciBkYXNoQ2FzZU5hbWUgPSBQb2x5bWVyLkNhc2VNYXAuY2FtZWxUb0Rhc2hDYXNlKHJvb3ROYW1lKTtcbnZhciBldmVudE5hbWUgPSBkYXNoQ2FzZU5hbWUgKyB0aGlzLl9FVkVOVF9DSEFOR0VEO1xudGhpcy5maXJlKGV2ZW50TmFtZSwge1xucGF0aDogcGF0aCxcbnZhbHVlOiB2YWx1ZVxufSwgeyBidWJibGVzOiBmYWxzZSB9KTtcbn0sXG5fbW9kZWxGb3JQYXRoOiBmdW5jdGlvbiAocGF0aCkge1xudmFyIGRvdCA9IHBhdGguaW5kZXhPZignLicpO1xucmV0dXJuIGRvdCA8IDAgPyBwYXRoIDogcGF0aC5zbGljZSgwLCBkb3QpO1xufSxcbl9FVkVOVF9DSEFOR0VEOiAnLWNoYW5nZWQnLFxuX25vdGlmeVNwbGljZTogZnVuY3Rpb24gKGFycmF5LCBwYXRoLCBpbmRleCwgYWRkZWQsIHJlbW92ZWQpIHtcbnZhciBzcGxpY2VzID0gW3tcbmluZGV4OiBpbmRleCxcbmFkZGVkQ291bnQ6IGFkZGVkLFxucmVtb3ZlZDogcmVtb3ZlZCxcbm9iamVjdDogYXJyYXksXG50eXBlOiAnc3BsaWNlJ1xufV07XG52YXIgY2hhbmdlID0ge1xua2V5U3BsaWNlczogUG9seW1lci5Db2xsZWN0aW9uLmFwcGx5U3BsaWNlcyhhcnJheSwgc3BsaWNlcyksXG5pbmRleFNwbGljZXM6IHNwbGljZXNcbn07XG50aGlzLnNldChwYXRoICsgJy5zcGxpY2VzJywgY2hhbmdlKTtcbmlmIChhZGRlZCAhPSByZW1vdmVkLmxlbmd0aCkge1xudGhpcy5ub3RpZnlQYXRoKHBhdGggKyAnLmxlbmd0aCcsIGFycmF5Lmxlbmd0aCk7XG59XG5jaGFuZ2Uua2V5U3BsaWNlcyA9IG51bGw7XG5jaGFuZ2UuaW5kZXhTcGxpY2VzID0gbnVsbDtcbn0sXG5wdXNoOiBmdW5jdGlvbiAocGF0aCkge1xudmFyIGFycmF5ID0gdGhpcy5nZXQocGF0aCk7XG52YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG52YXIgbGVuID0gYXJyYXkubGVuZ3RoO1xudmFyIHJldCA9IGFycmF5LnB1c2guYXBwbHkoYXJyYXksIGFyZ3MpO1xudGhpcy5fbm90aWZ5U3BsaWNlKGFycmF5LCBwYXRoLCBsZW4sIGFyZ3MubGVuZ3RoLCBbXSk7XG5yZXR1cm4gcmV0O1xufSxcbnBvcDogZnVuY3Rpb24gKHBhdGgpIHtcbnZhciBhcnJheSA9IHRoaXMuZ2V0KHBhdGgpO1xudmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xudmFyIHJlbSA9IGFycmF5LnNsaWNlKC0xKTtcbnZhciByZXQgPSBhcnJheS5wb3AuYXBwbHkoYXJyYXksIGFyZ3MpO1xudGhpcy5fbm90aWZ5U3BsaWNlKGFycmF5LCBwYXRoLCBhcnJheS5sZW5ndGgsIDAsIHJlbSk7XG5yZXR1cm4gcmV0O1xufSxcbnNwbGljZTogZnVuY3Rpb24gKHBhdGgsIHN0YXJ0LCBkZWxldGVDb3VudCkge1xudmFyIGFycmF5ID0gdGhpcy5nZXQocGF0aCk7XG52YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG52YXIgcmV0ID0gYXJyYXkuc3BsaWNlLmFwcGx5KGFycmF5LCBhcmdzKTtcbnRoaXMuX25vdGlmeVNwbGljZShhcnJheSwgcGF0aCwgc3RhcnQsIGFyZ3MubGVuZ3RoIC0gMiwgcmV0KTtcbnJldHVybiByZXQ7XG59LFxuc2hpZnQ6IGZ1bmN0aW9uIChwYXRoKSB7XG52YXIgYXJyYXkgPSB0aGlzLmdldChwYXRoKTtcbnZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbnZhciByZXQgPSBhcnJheS5zaGlmdC5hcHBseShhcnJheSwgYXJncyk7XG50aGlzLl9ub3RpZnlTcGxpY2UoYXJyYXksIHBhdGgsIDAsIDAsIFtyZXRdKTtcbnJldHVybiByZXQ7XG59LFxudW5zaGlmdDogZnVuY3Rpb24gKHBhdGgpIHtcbnZhciBhcnJheSA9IHRoaXMuZ2V0KHBhdGgpO1xudmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xudmFyIHJldCA9IGFycmF5LnVuc2hpZnQuYXBwbHkoYXJyYXksIGFyZ3MpO1xudGhpcy5fbm90aWZ5U3BsaWNlKGFycmF5LCBwYXRoLCAwLCBhcmdzLmxlbmd0aCwgW10pO1xucmV0dXJuIHJldDtcbn1cbn0pO1xufSgpKTtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5yZXNvbHZlVXJsOiBmdW5jdGlvbiAodXJsKSB7XG52YXIgbW9kdWxlID0gUG9seW1lci5Eb21Nb2R1bGUuaW1wb3J0KHRoaXMuaXMpO1xudmFyIHJvb3QgPSAnJztcbmlmIChtb2R1bGUpIHtcbnZhciBhc3NldFBhdGggPSBtb2R1bGUuZ2V0QXR0cmlidXRlKCdhc3NldHBhdGgnKSB8fCAnJztcbnJvb3QgPSBQb2x5bWVyLlJlc29sdmVVcmwucmVzb2x2ZVVybChhc3NldFBhdGgsIG1vZHVsZS5vd25lckRvY3VtZW50LmJhc2VVUkkpO1xufVxucmV0dXJuIFBvbHltZXIuUmVzb2x2ZVVybC5yZXNvbHZlVXJsKHVybCwgcm9vdCk7XG59XG59KTtcblBvbHltZXIuQ3NzUGFyc2UgPSBmdW5jdGlvbiAoKSB7XG52YXIgYXBpID0ge1xucGFyc2U6IGZ1bmN0aW9uICh0ZXh0KSB7XG50ZXh0ID0gdGhpcy5fY2xlYW4odGV4dCk7XG5yZXR1cm4gdGhpcy5fcGFyc2VDc3ModGhpcy5fbGV4KHRleHQpLCB0ZXh0KTtcbn0sXG5fY2xlYW46IGZ1bmN0aW9uIChjc3NUZXh0KSB7XG5yZXR1cm4gY3NzVGV4dC5yZXBsYWNlKHJ4LmNvbW1lbnRzLCAnJykucmVwbGFjZShyeC5wb3J0LCAnJyk7XG59LFxuX2xleDogZnVuY3Rpb24gKHRleHQpIHtcbnZhciByb290ID0ge1xuc3RhcnQ6IDAsXG5lbmQ6IHRleHQubGVuZ3RoXG59O1xudmFyIG4gPSByb290O1xuZm9yICh2YXIgaSA9IDAsIHMgPSAwLCBsID0gdGV4dC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbnN3aXRjaCAodGV4dFtpXSkge1xuY2FzZSB0aGlzLk9QRU5fQlJBQ0U6XG5pZiAoIW4ucnVsZXMpIHtcbm4ucnVsZXMgPSBbXTtcbn1cbnZhciBwID0gbjtcbnZhciBwcmV2aW91cyA9IHAucnVsZXNbcC5ydWxlcy5sZW5ndGggLSAxXTtcbm4gPSB7XG5zdGFydDogaSArIDEsXG5wYXJlbnQ6IHAsXG5wcmV2aW91czogcHJldmlvdXNcbn07XG5wLnJ1bGVzLnB1c2gobik7XG5icmVhaztcbmNhc2UgdGhpcy5DTE9TRV9CUkFDRTpcbm4uZW5kID0gaSArIDE7XG5uID0gbi5wYXJlbnQgfHwgcm9vdDtcbmJyZWFrO1xufVxufVxucmV0dXJuIHJvb3Q7XG59LFxuX3BhcnNlQ3NzOiBmdW5jdGlvbiAobm9kZSwgdGV4dCkge1xudmFyIHQgPSB0ZXh0LnN1YnN0cmluZyhub2RlLnN0YXJ0LCBub2RlLmVuZCAtIDEpO1xubm9kZS5wYXJzZWRDc3NUZXh0ID0gbm9kZS5jc3NUZXh0ID0gdC50cmltKCk7XG5pZiAobm9kZS5wYXJlbnQpIHtcbnZhciBzcyA9IG5vZGUucHJldmlvdXMgPyBub2RlLnByZXZpb3VzLmVuZCA6IG5vZGUucGFyZW50LnN0YXJ0O1xudCA9IHRleHQuc3Vic3RyaW5nKHNzLCBub2RlLnN0YXJ0IC0gMSk7XG50ID0gdC5zdWJzdHJpbmcodC5sYXN0SW5kZXhPZignOycpICsgMSk7XG52YXIgcyA9IG5vZGUucGFyc2VkU2VsZWN0b3IgPSBub2RlLnNlbGVjdG9yID0gdC50cmltKCk7XG5ub2RlLmF0UnVsZSA9IHMuaW5kZXhPZihBVF9TVEFSVCkgPT09IDA7XG5pZiAobm9kZS5hdFJ1bGUpIHtcbmlmIChzLmluZGV4T2YoTUVESUFfU1RBUlQpID09PSAwKSB7XG5ub2RlLnR5cGUgPSB0aGlzLnR5cGVzLk1FRElBX1JVTEU7XG59IGVsc2UgaWYgKHMubWF0Y2gocngua2V5ZnJhbWVzUnVsZSkpIHtcbm5vZGUudHlwZSA9IHRoaXMudHlwZXMuS0VZRlJBTUVTX1JVTEU7XG59XG59IGVsc2Uge1xuaWYgKHMuaW5kZXhPZihWQVJfU1RBUlQpID09PSAwKSB7XG5ub2RlLnR5cGUgPSB0aGlzLnR5cGVzLk1JWElOX1JVTEU7XG59IGVsc2Uge1xubm9kZS50eXBlID0gdGhpcy50eXBlcy5TVFlMRV9SVUxFO1xufVxufVxufVxudmFyIHIkID0gbm9kZS5ydWxlcztcbmlmIChyJCkge1xuZm9yICh2YXIgaSA9IDAsIGwgPSByJC5sZW5ndGgsIHI7IGkgPCBsICYmIChyID0gciRbaV0pOyBpKyspIHtcbnRoaXMuX3BhcnNlQ3NzKHIsIHRleHQpO1xufVxufVxucmV0dXJuIG5vZGU7XG59LFxuc3RyaW5naWZ5OiBmdW5jdGlvbiAobm9kZSwgcHJlc2VydmVQcm9wZXJ0aWVzLCB0ZXh0KSB7XG50ZXh0ID0gdGV4dCB8fCAnJztcbnZhciBjc3NUZXh0ID0gJyc7XG5pZiAobm9kZS5jc3NUZXh0IHx8IG5vZGUucnVsZXMpIHtcbnZhciByJCA9IG5vZGUucnVsZXM7XG5pZiAociQgJiYgKHByZXNlcnZlUHJvcGVydGllcyB8fCAhaGFzTWl4aW5SdWxlcyhyJCkpKSB7XG5mb3IgKHZhciBpID0gMCwgbCA9IHIkLmxlbmd0aCwgcjsgaSA8IGwgJiYgKHIgPSByJFtpXSk7IGkrKykge1xuY3NzVGV4dCA9IHRoaXMuc3RyaW5naWZ5KHIsIHByZXNlcnZlUHJvcGVydGllcywgY3NzVGV4dCk7XG59XG59IGVsc2Uge1xuY3NzVGV4dCA9IHByZXNlcnZlUHJvcGVydGllcyA/IG5vZGUuY3NzVGV4dCA6IHJlbW92ZUN1c3RvbVByb3BzKG5vZGUuY3NzVGV4dCk7XG5jc3NUZXh0ID0gY3NzVGV4dC50cmltKCk7XG5pZiAoY3NzVGV4dCkge1xuY3NzVGV4dCA9ICcgICcgKyBjc3NUZXh0ICsgJ1xcbic7XG59XG59XG59XG5pZiAoY3NzVGV4dCkge1xuaWYgKG5vZGUuc2VsZWN0b3IpIHtcbnRleHQgKz0gbm9kZS5zZWxlY3RvciArICcgJyArIHRoaXMuT1BFTl9CUkFDRSArICdcXG4nO1xufVxudGV4dCArPSBjc3NUZXh0O1xuaWYgKG5vZGUuc2VsZWN0b3IpIHtcbnRleHQgKz0gdGhpcy5DTE9TRV9CUkFDRSArICdcXG5cXG4nO1xufVxufVxucmV0dXJuIHRleHQ7XG59LFxudHlwZXM6IHtcblNUWUxFX1JVTEU6IDEsXG5LRVlGUkFNRVNfUlVMRTogNyxcbk1FRElBX1JVTEU6IDQsXG5NSVhJTl9SVUxFOiAxMDAwXG59LFxuT1BFTl9CUkFDRTogJ3snLFxuQ0xPU0VfQlJBQ0U6ICd9J1xufTtcbmZ1bmN0aW9uIGhhc01peGluUnVsZXMocnVsZXMpIHtcbnJldHVybiBydWxlc1swXS5zZWxlY3Rvci5pbmRleE9mKFZBUl9TVEFSVCkgPj0gMDtcbn1cbmZ1bmN0aW9uIHJlbW92ZUN1c3RvbVByb3BzKGNzc1RleHQpIHtcbnJldHVybiBjc3NUZXh0LnJlcGxhY2UocnguY3VzdG9tUHJvcCwgJycpLnJlcGxhY2UocngubWl4aW5Qcm9wLCAnJykucmVwbGFjZShyeC5taXhpbkFwcGx5LCAnJykucmVwbGFjZShyeC52YXJBcHBseSwgJycpO1xufVxudmFyIFZBUl9TVEFSVCA9ICctLSc7XG52YXIgTUVESUFfU1RBUlQgPSAnQG1lZGlhJztcbnZhciBBVF9TVEFSVCA9ICdAJztcbnZhciByeCA9IHtcbmNvbW1lbnRzOiAvXFwvXFwqW14qXSpcXCorKFteXFwvKl1bXipdKlxcKispKlxcLy9naW0sXG5wb3J0OiAvQGltcG9ydFteO10qOy9naW0sXG5jdXN0b21Qcm9wOiAvKD86XnxbXFxzO10pLS1bXjt7XSo/Oltee307XSo/KD86WztcXG5dfCQpL2dpbSxcbm1peGluUHJvcDogLyg/Ol58W1xccztdKS0tW147e10qPzpbXns7XSo/e1tefV0qP30oPzpbO1xcbl18JCk/L2dpbSxcbm1peGluQXBwbHk6IC9AYXBwbHlbXFxzXSpcXChbXildKj9cXClbXFxzXSooPzpbO1xcbl18JCk/L2dpbSxcbnZhckFwcGx5OiAvW147Ol0qPzpbXjtdKnZhclteO10qKD86WztcXG5dfCQpPy9naW0sXG5rZXlmcmFtZXNSdWxlOiAvXkBbXlxcc10qa2V5ZnJhbWVzL1xufTtcbnJldHVybiBhcGk7XG59KCk7XG5Qb2x5bWVyLlN0eWxlVXRpbCA9IGZ1bmN0aW9uICgpIHtcbnJldHVybiB7XG5NT0RVTEVfU1RZTEVTX1NFTEVDVE9SOiAnc3R5bGUsIGxpbmtbcmVsPWltcG9ydF1bdHlwZX49Y3NzXScsXG50b0Nzc1RleHQ6IGZ1bmN0aW9uIChydWxlcywgY2FsbGJhY2ssIHByZXNlcnZlUHJvcGVydGllcykge1xuaWYgKHR5cGVvZiBydWxlcyA9PT0gJ3N0cmluZycpIHtcbnJ1bGVzID0gdGhpcy5wYXJzZXIucGFyc2UocnVsZXMpO1xufVxuaWYgKGNhbGxiYWNrKSB7XG50aGlzLmZvckVhY2hTdHlsZVJ1bGUocnVsZXMsIGNhbGxiYWNrKTtcbn1cbnJldHVybiB0aGlzLnBhcnNlci5zdHJpbmdpZnkocnVsZXMsIHByZXNlcnZlUHJvcGVydGllcyk7XG59LFxuZm9yUnVsZXNJblN0eWxlczogZnVuY3Rpb24gKHN0eWxlcywgY2FsbGJhY2spIHtcbmZvciAodmFyIGkgPSAwLCBsID0gc3R5bGVzLmxlbmd0aCwgczsgaSA8IGwgJiYgKHMgPSBzdHlsZXNbaV0pOyBpKyspIHtcbnRoaXMuZm9yRWFjaFN0eWxlUnVsZSh0aGlzLnJ1bGVzRm9yU3R5bGUocyksIGNhbGxiYWNrKTtcbn1cbn0sXG5ydWxlc0ZvclN0eWxlOiBmdW5jdGlvbiAoc3R5bGUpIHtcbmlmICghc3R5bGUuX19jc3NSdWxlcyAmJiBzdHlsZS50ZXh0Q29udGVudCkge1xuc3R5bGUuX19jc3NSdWxlcyA9IHRoaXMucGFyc2VyLnBhcnNlKHN0eWxlLnRleHRDb250ZW50KTtcbn1cbnJldHVybiBzdHlsZS5fX2Nzc1J1bGVzO1xufSxcbmNsZWFyU3R5bGVSdWxlczogZnVuY3Rpb24gKHN0eWxlKSB7XG5zdHlsZS5fX2Nzc1J1bGVzID0gbnVsbDtcbn0sXG5mb3JFYWNoU3R5bGVSdWxlOiBmdW5jdGlvbiAobm9kZSwgY2FsbGJhY2spIHtcbnZhciBzID0gbm9kZS5zZWxlY3RvcjtcbnZhciBza2lwUnVsZXMgPSBmYWxzZTtcbmlmIChub2RlLnR5cGUgPT09IHRoaXMucnVsZVR5cGVzLlNUWUxFX1JVTEUpIHtcbmNhbGxiYWNrKG5vZGUpO1xufSBlbHNlIGlmIChub2RlLnR5cGUgPT09IHRoaXMucnVsZVR5cGVzLktFWUZSQU1FU19SVUxFIHx8IG5vZGUudHlwZSA9PT0gdGhpcy5ydWxlVHlwZXMuTUlYSU5fUlVMRSkge1xuc2tpcFJ1bGVzID0gdHJ1ZTtcbn1cbnZhciByJCA9IG5vZGUucnVsZXM7XG5pZiAociQgJiYgIXNraXBSdWxlcykge1xuZm9yICh2YXIgaSA9IDAsIGwgPSByJC5sZW5ndGgsIHI7IGkgPCBsICYmIChyID0gciRbaV0pOyBpKyspIHtcbnRoaXMuZm9yRWFjaFN0eWxlUnVsZShyLCBjYWxsYmFjayk7XG59XG59XG59LFxuYXBwbHlDc3M6IGZ1bmN0aW9uIChjc3NUZXh0LCBtb25pa2VyLCB0YXJnZXQsIGFmdGVyTm9kZSkge1xudmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbmlmIChtb25pa2VyKSB7XG5zdHlsZS5zZXRBdHRyaWJ1dGUoJ3Njb3BlJywgbW9uaWtlcik7XG59XG5zdHlsZS50ZXh0Q29udGVudCA9IGNzc1RleHQ7XG50YXJnZXQgPSB0YXJnZXQgfHwgZG9jdW1lbnQuaGVhZDtcbmlmICghYWZ0ZXJOb2RlKSB7XG52YXIgbiQgPSB0YXJnZXQucXVlcnlTZWxlY3RvckFsbCgnc3R5bGVbc2NvcGVdJyk7XG5hZnRlck5vZGUgPSBuJFtuJC5sZW5ndGggLSAxXTtcbn1cbnRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGUsIGFmdGVyTm9kZSAmJiBhZnRlck5vZGUubmV4dFNpYmxpbmcgfHwgdGFyZ2V0LmZpcnN0Q2hpbGQpO1xucmV0dXJuIHN0eWxlO1xufSxcbmNzc0Zyb21Nb2R1bGU6IGZ1bmN0aW9uIChtb2R1bGVJZCkge1xudmFyIG0gPSBQb2x5bWVyLkRvbU1vZHVsZS5pbXBvcnQobW9kdWxlSWQpO1xuaWYgKG0gJiYgIW0uX2Nzc1RleHQpIHtcbnZhciBjc3NUZXh0ID0gJyc7XG52YXIgZSQgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChtLnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5NT0RVTEVfU1RZTEVTX1NFTEVDVE9SKSk7XG5mb3IgKHZhciBpID0gMCwgZTsgaSA8IGUkLmxlbmd0aDsgaSsrKSB7XG5lID0gZSRbaV07XG5pZiAoZS5sb2NhbE5hbWUgPT09ICdzdHlsZScpIHtcbmUgPSBlLl9fYXBwbGllZEVsZW1lbnQgfHwgZTtcbmUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlKTtcbn0gZWxzZSB7XG5lID0gZS5pbXBvcnQgJiYgZS5pbXBvcnQuYm9keTtcbn1cbmlmIChlKSB7XG5jc3NUZXh0ICs9IFBvbHltZXIuUmVzb2x2ZVVybC5yZXNvbHZlQ3NzKGUudGV4dENvbnRlbnQsIGUub3duZXJEb2N1bWVudCk7XG59XG59XG5tLl9jc3NUZXh0ID0gY3NzVGV4dDtcbn1cbnJldHVybiBtICYmIG0uX2Nzc1RleHQgfHwgJyc7XG59LFxucGFyc2VyOiBQb2x5bWVyLkNzc1BhcnNlLFxucnVsZVR5cGVzOiBQb2x5bWVyLkNzc1BhcnNlLnR5cGVzXG59O1xufSgpO1xuUG9seW1lci5TdHlsZVRyYW5zZm9ybWVyID0gZnVuY3Rpb24gKCkge1xudmFyIG5hdGl2ZVNoYWRvdyA9IFBvbHltZXIuU2V0dGluZ3MudXNlTmF0aXZlU2hhZG93O1xudmFyIHN0eWxlVXRpbCA9IFBvbHltZXIuU3R5bGVVdGlsO1xudmFyIGFwaSA9IHtcbmRvbTogZnVuY3Rpb24gKG5vZGUsIHNjb3BlLCB1c2VBdHRyLCBzaG91bGRSZW1vdmVTY29wZSkge1xudGhpcy5fdHJhbnNmb3JtRG9tKG5vZGUsIHNjb3BlIHx8ICcnLCB1c2VBdHRyLCBzaG91bGRSZW1vdmVTY29wZSk7XG59LFxuX3RyYW5zZm9ybURvbTogZnVuY3Rpb24gKG5vZGUsIHNlbGVjdG9yLCB1c2VBdHRyLCBzaG91bGRSZW1vdmVTY29wZSkge1xuaWYgKG5vZGUuc2V0QXR0cmlidXRlKSB7XG50aGlzLmVsZW1lbnQobm9kZSwgc2VsZWN0b3IsIHVzZUF0dHIsIHNob3VsZFJlbW92ZVNjb3BlKTtcbn1cbnZhciBjJCA9IFBvbHltZXIuZG9tKG5vZGUpLmNoaWxkTm9kZXM7XG5mb3IgKHZhciBpID0gMDsgaSA8IGMkLmxlbmd0aDsgaSsrKSB7XG50aGlzLl90cmFuc2Zvcm1Eb20oYyRbaV0sIHNlbGVjdG9yLCB1c2VBdHRyLCBzaG91bGRSZW1vdmVTY29wZSk7XG59XG59LFxuZWxlbWVudDogZnVuY3Rpb24gKGVsZW1lbnQsIHNjb3BlLCB1c2VBdHRyLCBzaG91bGRSZW1vdmVTY29wZSkge1xuaWYgKHVzZUF0dHIpIHtcbmlmIChzaG91bGRSZW1vdmVTY29wZSkge1xuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoU0NPUEVfTkFNRSk7XG59IGVsc2Uge1xuZWxlbWVudC5zZXRBdHRyaWJ1dGUoU0NPUEVfTkFNRSwgc2NvcGUpO1xufVxufSBlbHNlIHtcbmlmIChzY29wZSkge1xuaWYgKGVsZW1lbnQuY2xhc3NMaXN0KSB7XG5pZiAoc2hvdWxkUmVtb3ZlU2NvcGUpIHtcbmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShTQ09QRV9OQU1FKTtcbmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShzY29wZSk7XG59IGVsc2Uge1xuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFNDT1BFX05BTUUpO1xuZWxlbWVudC5jbGFzc0xpc3QuYWRkKHNjb3BlKTtcbn1cbn0gZWxzZSBpZiAoZWxlbWVudC5nZXRBdHRyaWJ1dGUpIHtcbnZhciBjID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoQ0xBU1MpO1xuaWYgKHNob3VsZFJlbW92ZVNjb3BlKSB7XG5pZiAoYykge1xuZWxlbWVudC5zZXRBdHRyaWJ1dGUoQ0xBU1MsIGMucmVwbGFjZShTQ09QRV9OQU1FLCAnJykucmVwbGFjZShzY29wZSwgJycpKTtcbn1cbn0gZWxzZSB7XG5lbGVtZW50LnNldEF0dHJpYnV0ZShDTEFTUywgYyArIChjID8gJyAnIDogJycpICsgU0NPUEVfTkFNRSArICcgJyArIHNjb3BlKTtcbn1cbn1cbn1cbn1cbn0sXG5lbGVtZW50U3R5bGVzOiBmdW5jdGlvbiAoZWxlbWVudCwgY2FsbGJhY2spIHtcbnZhciBzdHlsZXMgPSBlbGVtZW50Ll9zdHlsZXM7XG52YXIgY3NzVGV4dCA9ICcnO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBzdHlsZXMubGVuZ3RoLCBzLCB0ZXh0OyBpIDwgbCAmJiAocyA9IHN0eWxlc1tpXSk7IGkrKykge1xudmFyIHJ1bGVzID0gc3R5bGVVdGlsLnJ1bGVzRm9yU3R5bGUocyk7XG5jc3NUZXh0ICs9IG5hdGl2ZVNoYWRvdyA/IHN0eWxlVXRpbC50b0Nzc1RleHQocnVsZXMsIGNhbGxiYWNrKSA6IHRoaXMuY3NzKHJ1bGVzLCBlbGVtZW50LmlzLCBlbGVtZW50LmV4dGVuZHMsIGNhbGxiYWNrLCBlbGVtZW50Ll9zY29wZUNzc1ZpYUF0dHIpICsgJ1xcblxcbic7XG59XG5yZXR1cm4gY3NzVGV4dC50cmltKCk7XG59LFxuY3NzOiBmdW5jdGlvbiAocnVsZXMsIHNjb3BlLCBleHQsIGNhbGxiYWNrLCB1c2VBdHRyKSB7XG52YXIgaG9zdFNjb3BlID0gdGhpcy5fY2FsY0hvc3RTY29wZShzY29wZSwgZXh0KTtcbnNjb3BlID0gdGhpcy5fY2FsY0VsZW1lbnRTY29wZShzY29wZSwgdXNlQXR0cik7XG52YXIgc2VsZiA9IHRoaXM7XG5yZXR1cm4gc3R5bGVVdGlsLnRvQ3NzVGV4dChydWxlcywgZnVuY3Rpb24gKHJ1bGUpIHtcbmlmICghcnVsZS5pc1Njb3BlZCkge1xuc2VsZi5ydWxlKHJ1bGUsIHNjb3BlLCBob3N0U2NvcGUpO1xucnVsZS5pc1Njb3BlZCA9IHRydWU7XG59XG5pZiAoY2FsbGJhY2spIHtcbmNhbGxiYWNrKHJ1bGUsIHNjb3BlLCBob3N0U2NvcGUpO1xufVxufSk7XG59LFxuX2NhbGNFbGVtZW50U2NvcGU6IGZ1bmN0aW9uIChzY29wZSwgdXNlQXR0cikge1xuaWYgKHNjb3BlKSB7XG5yZXR1cm4gdXNlQXR0ciA/IENTU19BVFRSX1BSRUZJWCArIHNjb3BlICsgQ1NTX0FUVFJfU1VGRklYIDogQ1NTX0NMQVNTX1BSRUZJWCArIHNjb3BlO1xufSBlbHNlIHtcbnJldHVybiAnJztcbn1cbn0sXG5fY2FsY0hvc3RTY29wZTogZnVuY3Rpb24gKHNjb3BlLCBleHQpIHtcbnJldHVybiBleHQgPyAnW2lzPScgKyBzY29wZSArICddJyA6IHNjb3BlO1xufSxcbnJ1bGU6IGZ1bmN0aW9uIChydWxlLCBzY29wZSwgaG9zdFNjb3BlKSB7XG50aGlzLl90cmFuc2Zvcm1SdWxlKHJ1bGUsIHRoaXMuX3RyYW5zZm9ybUNvbXBsZXhTZWxlY3Rvciwgc2NvcGUsIGhvc3RTY29wZSk7XG59LFxuX3RyYW5zZm9ybVJ1bGU6IGZ1bmN0aW9uIChydWxlLCB0cmFuc2Zvcm1lciwgc2NvcGUsIGhvc3RTY29wZSkge1xudmFyIHAkID0gcnVsZS5zZWxlY3Rvci5zcGxpdChDT01QTEVYX1NFTEVDVE9SX1NFUCk7XG5mb3IgKHZhciBpID0gMCwgbCA9IHAkLmxlbmd0aCwgcDsgaSA8IGwgJiYgKHAgPSBwJFtpXSk7IGkrKykge1xucCRbaV0gPSB0cmFuc2Zvcm1lci5jYWxsKHRoaXMsIHAsIHNjb3BlLCBob3N0U2NvcGUpO1xufVxucnVsZS5zZWxlY3RvciA9IHAkLmpvaW4oQ09NUExFWF9TRUxFQ1RPUl9TRVApO1xufSxcbl90cmFuc2Zvcm1Db21wbGV4U2VsZWN0b3I6IGZ1bmN0aW9uIChzZWxlY3Rvciwgc2NvcGUsIGhvc3RTY29wZSkge1xudmFyIHN0b3AgPSBmYWxzZTtcbnZhciBob3N0Q29udGV4dCA9IGZhbHNlO1xudmFyIHNlbGYgPSB0aGlzO1xuc2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKFNJTVBMRV9TRUxFQ1RPUl9TRVAsIGZ1bmN0aW9uIChtLCBjLCBzKSB7XG5pZiAoIXN0b3ApIHtcbnZhciBpbmZvID0gc2VsZi5fdHJhbnNmb3JtQ29tcG91bmRTZWxlY3RvcihzLCBjLCBzY29wZSwgaG9zdFNjb3BlKTtcbnN0b3AgPSBzdG9wIHx8IGluZm8uc3RvcDtcbmhvc3RDb250ZXh0ID0gaG9zdENvbnRleHQgfHwgaW5mby5ob3N0Q29udGV4dDtcbmMgPSBpbmZvLmNvbWJpbmF0b3I7XG5zID0gaW5mby52YWx1ZTtcbn0gZWxzZSB7XG5zID0gcy5yZXBsYWNlKFNDT1BFX0pVTVAsICcgJyk7XG59XG5yZXR1cm4gYyArIHM7XG59KTtcbmlmIChob3N0Q29udGV4dCkge1xuc2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKEhPU1RfQ09OVEVYVF9QQVJFTiwgZnVuY3Rpb24gKG0sIHByZSwgcGFyZW4sIHBvc3QpIHtcbnJldHVybiBwcmUgKyBwYXJlbiArICcgJyArIGhvc3RTY29wZSArIHBvc3QgKyBDT01QTEVYX1NFTEVDVE9SX1NFUCArICcgJyArIHByZSArIGhvc3RTY29wZSArIHBhcmVuICsgcG9zdDtcbn0pO1xufVxucmV0dXJuIHNlbGVjdG9yO1xufSxcbl90cmFuc2Zvcm1Db21wb3VuZFNlbGVjdG9yOiBmdW5jdGlvbiAoc2VsZWN0b3IsIGNvbWJpbmF0b3IsIHNjb3BlLCBob3N0U2NvcGUpIHtcbnZhciBqdW1wSW5kZXggPSBzZWxlY3Rvci5zZWFyY2goU0NPUEVfSlVNUCk7XG52YXIgaG9zdENvbnRleHQgPSBmYWxzZTtcbmlmIChzZWxlY3Rvci5pbmRleE9mKEhPU1RfQ09OVEVYVCkgPj0gMCkge1xuaG9zdENvbnRleHQgPSB0cnVlO1xufSBlbHNlIGlmIChzZWxlY3Rvci5pbmRleE9mKEhPU1QpID49IDApIHtcbnNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShIT1NUX1BBUkVOLCBmdW5jdGlvbiAobSwgaG9zdCwgcGFyZW4pIHtcbnJldHVybiBob3N0U2NvcGUgKyBwYXJlbjtcbn0pO1xuc2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKEhPU1QsIGhvc3RTY29wZSk7XG59IGVsc2UgaWYgKGp1bXBJbmRleCAhPT0gMCkge1xuc2VsZWN0b3IgPSBzY29wZSA/IHRoaXMuX3RyYW5zZm9ybVNpbXBsZVNlbGVjdG9yKHNlbGVjdG9yLCBzY29wZSkgOiBzZWxlY3Rvcjtcbn1cbmlmIChzZWxlY3Rvci5pbmRleE9mKENPTlRFTlQpID49IDApIHtcbmNvbWJpbmF0b3IgPSAnJztcbn1cbnZhciBzdG9wO1xuaWYgKGp1bXBJbmRleCA+PSAwKSB7XG5zZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoU0NPUEVfSlVNUCwgJyAnKTtcbnN0b3AgPSB0cnVlO1xufVxucmV0dXJuIHtcbnZhbHVlOiBzZWxlY3RvcixcbmNvbWJpbmF0b3I6IGNvbWJpbmF0b3IsXG5zdG9wOiBzdG9wLFxuaG9zdENvbnRleHQ6IGhvc3RDb250ZXh0XG59O1xufSxcbl90cmFuc2Zvcm1TaW1wbGVTZWxlY3RvcjogZnVuY3Rpb24gKHNlbGVjdG9yLCBzY29wZSkge1xudmFyIHAkID0gc2VsZWN0b3Iuc3BsaXQoUFNFVURPX1BSRUZJWCk7XG5wJFswXSArPSBzY29wZTtcbnJldHVybiBwJC5qb2luKFBTRVVET19QUkVGSVgpO1xufSxcbmRvY3VtZW50UnVsZTogZnVuY3Rpb24gKHJ1bGUpIHtcbnJ1bGUuc2VsZWN0b3IgPSBydWxlLnBhcnNlZFNlbGVjdG9yO1xudGhpcy5ub3JtYWxpemVSb290U2VsZWN0b3IocnVsZSk7XG5pZiAoIW5hdGl2ZVNoYWRvdykge1xudGhpcy5fdHJhbnNmb3JtUnVsZShydWxlLCB0aGlzLl90cmFuc2Zvcm1Eb2N1bWVudFNlbGVjdG9yKTtcbn1cbn0sXG5ub3JtYWxpemVSb290U2VsZWN0b3I6IGZ1bmN0aW9uIChydWxlKSB7XG5pZiAocnVsZS5zZWxlY3RvciA9PT0gUk9PVCkge1xucnVsZS5zZWxlY3RvciA9ICdib2R5Jztcbn1cbn0sXG5fdHJhbnNmb3JtRG9jdW1lbnRTZWxlY3RvcjogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG5yZXR1cm4gc2VsZWN0b3IubWF0Y2goU0NPUEVfSlVNUCkgPyB0aGlzLl90cmFuc2Zvcm1Db21wbGV4U2VsZWN0b3Ioc2VsZWN0b3IsIFNDT1BFX0RPQ19TRUxFQ1RPUikgOiB0aGlzLl90cmFuc2Zvcm1TaW1wbGVTZWxlY3RvcihzZWxlY3Rvci50cmltKCksIFNDT1BFX0RPQ19TRUxFQ1RPUik7XG59LFxuU0NPUEVfTkFNRTogJ3N0eWxlLXNjb3BlJ1xufTtcbnZhciBTQ09QRV9OQU1FID0gYXBpLlNDT1BFX05BTUU7XG52YXIgU0NPUEVfRE9DX1NFTEVDVE9SID0gJzpub3QoWycgKyBTQ09QRV9OQU1FICsgJ10pJyArICc6bm90KC4nICsgU0NPUEVfTkFNRSArICcpJztcbnZhciBDT01QTEVYX1NFTEVDVE9SX1NFUCA9ICcsJztcbnZhciBTSU1QTEVfU0VMRUNUT1JfU0VQID0gLyhefFtcXHM+K35dKykoW15cXHM+K35dKykvZztcbnZhciBIT1NUID0gJzpob3N0JztcbnZhciBST09UID0gJzpyb290JztcbnZhciBIT1NUX1BBUkVOID0gLyhcXDpob3N0KSg/OlxcKCgoPzpcXChbXikoXSpcXCl8W14pKF0qKSs/KVxcKSkvZztcbnZhciBIT1NUX0NPTlRFWFQgPSAnOmhvc3QtY29udGV4dCc7XG52YXIgSE9TVF9DT05URVhUX1BBUkVOID0gLyguKikoPzpcXDpob3N0LWNvbnRleHQpKD86XFwoKCg/OlxcKFteKShdKlxcKXxbXikoXSopKz8pXFwpKSguKikvO1xudmFyIENPTlRFTlQgPSAnOjpjb250ZW50JztcbnZhciBTQ09QRV9KVU1QID0gL1xcOlxcOmNvbnRlbnR8XFw6XFw6c2hhZG93fFxcL2RlZXBcXC8vO1xudmFyIENTU19DTEFTU19QUkVGSVggPSAnLic7XG52YXIgQ1NTX0FUVFJfUFJFRklYID0gJ1snICsgU0NPUEVfTkFNRSArICd+PSc7XG52YXIgQ1NTX0FUVFJfU1VGRklYID0gJ10nO1xudmFyIFBTRVVET19QUkVGSVggPSAnOic7XG52YXIgQ0xBU1MgPSAnY2xhc3MnO1xucmV0dXJuIGFwaTtcbn0oKTtcblBvbHltZXIuU3R5bGVFeHRlbmRzID0gZnVuY3Rpb24gKCkge1xudmFyIHN0eWxlVXRpbCA9IFBvbHltZXIuU3R5bGVVdGlsO1xucmV0dXJuIHtcbmhhc0V4dGVuZHM6IGZ1bmN0aW9uIChjc3NUZXh0KSB7XG5yZXR1cm4gQm9vbGVhbihjc3NUZXh0Lm1hdGNoKHRoaXMucnguRVhURU5EKSk7XG59LFxudHJhbnNmb3JtOiBmdW5jdGlvbiAoc3R5bGUpIHtcbnZhciBydWxlcyA9IHN0eWxlVXRpbC5ydWxlc0ZvclN0eWxlKHN0eWxlKTtcbnZhciBzZWxmID0gdGhpcztcbnN0eWxlVXRpbC5mb3JFYWNoU3R5bGVSdWxlKHJ1bGVzLCBmdW5jdGlvbiAocnVsZSkge1xudmFyIG1hcCA9IHNlbGYuX21hcFJ1bGUocnVsZSk7XG5pZiAocnVsZS5wYXJlbnQpIHtcbnZhciBtO1xud2hpbGUgKG0gPSBzZWxmLnJ4LkVYVEVORC5leGVjKHJ1bGUuY3NzVGV4dCkpIHtcbnZhciBleHRlbmQgPSBtWzFdO1xudmFyIGV4dGVuZG9yID0gc2VsZi5fZmluZEV4dGVuZG9yKGV4dGVuZCwgcnVsZSk7XG5pZiAoZXh0ZW5kb3IpIHtcbnNlbGYuX2V4dGVuZFJ1bGUocnVsZSwgZXh0ZW5kb3IpO1xufVxufVxufVxucnVsZS5jc3NUZXh0ID0gcnVsZS5jc3NUZXh0LnJlcGxhY2Uoc2VsZi5yeC5FWFRFTkQsICcnKTtcbn0pO1xucmV0dXJuIHN0eWxlVXRpbC50b0Nzc1RleHQocnVsZXMsIGZ1bmN0aW9uIChydWxlKSB7XG5pZiAocnVsZS5zZWxlY3Rvci5tYXRjaChzZWxmLnJ4LlNUUklQKSkge1xucnVsZS5jc3NUZXh0ID0gJyc7XG59XG59LCB0cnVlKTtcbn0sXG5fbWFwUnVsZTogZnVuY3Rpb24gKHJ1bGUpIHtcbmlmIChydWxlLnBhcmVudCkge1xudmFyIG1hcCA9IHJ1bGUucGFyZW50Lm1hcCB8fCAocnVsZS5wYXJlbnQubWFwID0ge30pO1xudmFyIHBhcnRzID0gcnVsZS5zZWxlY3Rvci5zcGxpdCgnLCcpO1xuZm9yICh2YXIgaSA9IDAsIHA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xucCA9IHBhcnRzW2ldO1xubWFwW3AudHJpbSgpXSA9IHJ1bGU7XG59XG5yZXR1cm4gbWFwO1xufVxufSxcbl9maW5kRXh0ZW5kb3I6IGZ1bmN0aW9uIChleHRlbmQsIHJ1bGUpIHtcbnJldHVybiBydWxlLnBhcmVudCAmJiBydWxlLnBhcmVudC5tYXAgJiYgcnVsZS5wYXJlbnQubWFwW2V4dGVuZF0gfHwgdGhpcy5fZmluZEV4dGVuZG9yKGV4dGVuZCwgcnVsZS5wYXJlbnQpO1xufSxcbl9leHRlbmRSdWxlOiBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcbmlmICh0YXJnZXQucGFyZW50ICE9PSBzb3VyY2UucGFyZW50KSB7XG50aGlzLl9jbG9uZUFuZEFkZFJ1bGVUb1BhcmVudChzb3VyY2UsIHRhcmdldC5wYXJlbnQpO1xufVxudGFyZ2V0LmV4dGVuZHMgPSB0YXJnZXQuZXh0ZW5kcyB8fCAodGFyZ2V0LmV4dGVuZHMgPSBbXSk7XG50YXJnZXQuZXh0ZW5kcy5wdXNoKHNvdXJjZSk7XG5zb3VyY2Uuc2VsZWN0b3IgPSBzb3VyY2Uuc2VsZWN0b3IucmVwbGFjZSh0aGlzLnJ4LlNUUklQLCAnJyk7XG5zb3VyY2Uuc2VsZWN0b3IgPSAoc291cmNlLnNlbGVjdG9yICYmIHNvdXJjZS5zZWxlY3RvciArICcsXFxuJykgKyB0YXJnZXQuc2VsZWN0b3I7XG5pZiAoc291cmNlLmV4dGVuZHMpIHtcbnNvdXJjZS5leHRlbmRzLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbnRoaXMuX2V4dGVuZFJ1bGUodGFyZ2V0LCBlKTtcbn0sIHRoaXMpO1xufVxufSxcbl9jbG9uZUFuZEFkZFJ1bGVUb1BhcmVudDogZnVuY3Rpb24gKHJ1bGUsIHBhcmVudCkge1xucnVsZSA9IE9iamVjdC5jcmVhdGUocnVsZSk7XG5ydWxlLnBhcmVudCA9IHBhcmVudDtcbmlmIChydWxlLmV4dGVuZHMpIHtcbnJ1bGUuZXh0ZW5kcyA9IHJ1bGUuZXh0ZW5kcy5zbGljZSgpO1xufVxucGFyZW50LnJ1bGVzLnB1c2gocnVsZSk7XG59LFxucng6IHtcbkVYVEVORDogL0BleHRlbmRzXFwoKFteKV0qKVxcKVxccyo/Oy9naW0sXG5TVFJJUDogLyVbXixdKiQvXG59XG59O1xufSgpO1xuKGZ1bmN0aW9uICgpIHtcbnZhciBwcmVwRWxlbWVudCA9IFBvbHltZXIuQmFzZS5fcHJlcEVsZW1lbnQ7XG52YXIgbmF0aXZlU2hhZG93ID0gUG9seW1lci5TZXR0aW5ncy51c2VOYXRpdmVTaGFkb3c7XG52YXIgc3R5bGVVdGlsID0gUG9seW1lci5TdHlsZVV0aWw7XG52YXIgc3R5bGVUcmFuc2Zvcm1lciA9IFBvbHltZXIuU3R5bGVUcmFuc2Zvcm1lcjtcbnZhciBzdHlsZUV4dGVuZHMgPSBQb2x5bWVyLlN0eWxlRXh0ZW5kcztcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5fcHJlcEVsZW1lbnQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5pZiAodGhpcy5fZW5jYXBzdWxhdGVTdHlsZSkge1xuc3R5bGVUcmFuc2Zvcm1lci5lbGVtZW50KGVsZW1lbnQsIHRoaXMuaXMsIHRoaXMuX3Njb3BlQ3NzVmlhQXR0cik7XG59XG5wcmVwRWxlbWVudC5jYWxsKHRoaXMsIGVsZW1lbnQpO1xufSxcbl9wcmVwU3R5bGVzOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5fZW5jYXBzdWxhdGVTdHlsZSA9PT0gdW5kZWZpbmVkKSB7XG50aGlzLl9lbmNhcHN1bGF0ZVN0eWxlID0gIW5hdGl2ZVNoYWRvdyAmJiBCb29sZWFuKHRoaXMuX3RlbXBsYXRlKTtcbn1cbnRoaXMuX3N0eWxlcyA9IHRoaXMuX2NvbGxlY3RTdHlsZXMoKTtcbnZhciBjc3NUZXh0ID0gc3R5bGVUcmFuc2Zvcm1lci5lbGVtZW50U3R5bGVzKHRoaXMpO1xuaWYgKGNzc1RleHQgJiYgdGhpcy5fdGVtcGxhdGUpIHtcbnZhciBzdHlsZSA9IHN0eWxlVXRpbC5hcHBseUNzcyhjc3NUZXh0LCB0aGlzLmlzLCBuYXRpdmVTaGFkb3cgPyB0aGlzLl90ZW1wbGF0ZS5jb250ZW50IDogbnVsbCk7XG5pZiAoIW5hdGl2ZVNoYWRvdykge1xudGhpcy5fc2NvcGVTdHlsZSA9IHN0eWxlO1xufVxufVxufSxcbl9jb2xsZWN0U3R5bGVzOiBmdW5jdGlvbiAoKSB7XG52YXIgc3R5bGVzID0gW107XG52YXIgY3NzVGV4dCA9ICcnLCBtJCA9IHRoaXMuc3R5bGVNb2R1bGVzO1xuaWYgKG0kKSB7XG5mb3IgKHZhciBpID0gMCwgbCA9IG0kLmxlbmd0aCwgbTsgaSA8IGwgJiYgKG0gPSBtJFtpXSk7IGkrKykge1xuY3NzVGV4dCArPSBzdHlsZVV0aWwuY3NzRnJvbU1vZHVsZShtKTtcbn1cbn1cbmNzc1RleHQgKz0gc3R5bGVVdGlsLmNzc0Zyb21Nb2R1bGUodGhpcy5pcyk7XG5pZiAoY3NzVGV4dCkge1xudmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbnN0eWxlLnRleHRDb250ZW50ID0gY3NzVGV4dDtcbmlmIChzdHlsZUV4dGVuZHMuaGFzRXh0ZW5kcyhzdHlsZS50ZXh0Q29udGVudCkpIHtcbmNzc1RleHQgPSBzdHlsZUV4dGVuZHMudHJhbnNmb3JtKHN0eWxlKTtcbn1cbnN0eWxlcy5wdXNoKHN0eWxlKTtcbn1cbnJldHVybiBzdHlsZXM7XG59LFxuX2VsZW1lbnRBZGQ6IGZ1bmN0aW9uIChub2RlKSB7XG5pZiAodGhpcy5fZW5jYXBzdWxhdGVTdHlsZSkge1xuaWYgKG5vZGUuX19zdHlsZVNjb3BlZCkge1xubm9kZS5fX3N0eWxlU2NvcGVkID0gZmFsc2U7XG59IGVsc2Uge1xuc3R5bGVUcmFuc2Zvcm1lci5kb20obm9kZSwgdGhpcy5pcywgdGhpcy5fc2NvcGVDc3NWaWFBdHRyKTtcbn1cbn1cbn0sXG5fZWxlbWVudFJlbW92ZTogZnVuY3Rpb24gKG5vZGUpIHtcbmlmICh0aGlzLl9lbmNhcHN1bGF0ZVN0eWxlKSB7XG5zdHlsZVRyYW5zZm9ybWVyLmRvbShub2RlLCB0aGlzLmlzLCB0aGlzLl9zY29wZUNzc1ZpYUF0dHIsIHRydWUpO1xufVxufSxcbnNjb3BlU3VidHJlZTogZnVuY3Rpb24gKGNvbnRhaW5lciwgc2hvdWxkT2JzZXJ2ZSkge1xuaWYgKG5hdGl2ZVNoYWRvdykge1xucmV0dXJuO1xufVxudmFyIHNlbGYgPSB0aGlzO1xudmFyIHNjb3BpZnkgPSBmdW5jdGlvbiAobm9kZSkge1xuaWYgKG5vZGUubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFKSB7XG5ub2RlLmNsYXNzTmFtZSA9IHNlbGYuX3Njb3BlRWxlbWVudENsYXNzKG5vZGUsIG5vZGUuY2xhc3NOYW1lKTtcbnZhciBuJCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbCgnKicpO1xuQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChuJCwgZnVuY3Rpb24gKG4pIHtcbm4uY2xhc3NOYW1lID0gc2VsZi5fc2NvcGVFbGVtZW50Q2xhc3Mobiwgbi5jbGFzc05hbWUpO1xufSk7XG59XG59O1xuc2NvcGlmeShjb250YWluZXIpO1xuaWYgKHNob3VsZE9ic2VydmUpIHtcbnZhciBtbyA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uIChteG5zKSB7XG5teG5zLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbmlmIChtLmFkZGVkTm9kZXMpIHtcbmZvciAodmFyIGkgPSAwOyBpIDwgbS5hZGRlZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG5zY29waWZ5KG0uYWRkZWROb2Rlc1tpXSk7XG59XG59XG59KTtcbn0pO1xubW8ub2JzZXJ2ZShjb250YWluZXIsIHtcbmNoaWxkTGlzdDogdHJ1ZSxcbnN1YnRyZWU6IHRydWVcbn0pO1xucmV0dXJuIG1vO1xufVxufVxufSk7XG59KCkpO1xuUG9seW1lci5TdHlsZVByb3BlcnRpZXMgPSBmdW5jdGlvbiAoKSB7XG4ndXNlIHN0cmljdCc7XG52YXIgbmF0aXZlU2hhZG93ID0gUG9seW1lci5TZXR0aW5ncy51c2VOYXRpdmVTaGFkb3c7XG52YXIgbWF0Y2hlc1NlbGVjdG9yID0gUG9seW1lci5Eb21BcGkubWF0Y2hlc1NlbGVjdG9yO1xudmFyIHN0eWxlVXRpbCA9IFBvbHltZXIuU3R5bGVVdGlsO1xudmFyIHN0eWxlVHJhbnNmb3JtZXIgPSBQb2x5bWVyLlN0eWxlVHJhbnNmb3JtZXI7XG5yZXR1cm4ge1xuZGVjb3JhdGVTdHlsZXM6IGZ1bmN0aW9uIChzdHlsZXMpIHtcbnZhciBzZWxmID0gdGhpcywgcHJvcHMgPSB7fTtcbnN0eWxlVXRpbC5mb3JSdWxlc0luU3R5bGVzKHN0eWxlcywgZnVuY3Rpb24gKHJ1bGUpIHtcbnNlbGYuZGVjb3JhdGVSdWxlKHJ1bGUpO1xuc2VsZi5jb2xsZWN0UHJvcGVydGllc0luQ3NzVGV4dChydWxlLnByb3BlcnR5SW5mby5jc3NUZXh0LCBwcm9wcyk7XG59KTtcbnZhciBuYW1lcyA9IFtdO1xuZm9yICh2YXIgaSBpbiBwcm9wcykge1xubmFtZXMucHVzaChpKTtcbn1cbnJldHVybiBuYW1lcztcbn0sXG5kZWNvcmF0ZVJ1bGU6IGZ1bmN0aW9uIChydWxlKSB7XG5pZiAocnVsZS5wcm9wZXJ0eUluZm8pIHtcbnJldHVybiBydWxlLnByb3BlcnR5SW5mbztcbn1cbnZhciBpbmZvID0ge30sIHByb3BlcnRpZXMgPSB7fTtcbnZhciBoYXNQcm9wZXJ0aWVzID0gdGhpcy5jb2xsZWN0UHJvcGVydGllcyhydWxlLCBwcm9wZXJ0aWVzKTtcbmlmIChoYXNQcm9wZXJ0aWVzKSB7XG5pbmZvLnByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xucnVsZS5ydWxlcyA9IG51bGw7XG59XG5pbmZvLmNzc1RleHQgPSB0aGlzLmNvbGxlY3RDc3NUZXh0KHJ1bGUpO1xucnVsZS5wcm9wZXJ0eUluZm8gPSBpbmZvO1xucmV0dXJuIGluZm87XG59LFxuY29sbGVjdFByb3BlcnRpZXM6IGZ1bmN0aW9uIChydWxlLCBwcm9wZXJ0aWVzKSB7XG52YXIgaW5mbyA9IHJ1bGUucHJvcGVydHlJbmZvO1xuaWYgKGluZm8pIHtcbmlmIChpbmZvLnByb3BlcnRpZXMpIHtcblBvbHltZXIuQmFzZS5taXhpbihwcm9wZXJ0aWVzLCBpbmZvLnByb3BlcnRpZXMpO1xucmV0dXJuIHRydWU7XG59XG59IGVsc2Uge1xudmFyIG0sIHJ4ID0gdGhpcy5yeC5WQVJfQVNTSUdOO1xudmFyIGNzc1RleHQgPSBydWxlLnBhcnNlZENzc1RleHQ7XG52YXIgYW55O1xud2hpbGUgKG0gPSByeC5leGVjKGNzc1RleHQpKSB7XG5wcm9wZXJ0aWVzW21bMV1dID0gKG1bMl0gfHwgbVszXSkudHJpbSgpO1xuYW55ID0gdHJ1ZTtcbn1cbnJldHVybiBhbnk7XG59XG59LFxuY29sbGVjdENzc1RleHQ6IGZ1bmN0aW9uIChydWxlKSB7XG52YXIgY3VzdG9tQ3NzVGV4dCA9ICcnO1xudmFyIGNzc1RleHQgPSBydWxlLnBhcnNlZENzc1RleHQ7XG5jc3NUZXh0ID0gY3NzVGV4dC5yZXBsYWNlKHRoaXMucnguQlJBQ0tFVEVELCAnJykucmVwbGFjZSh0aGlzLnJ4LlZBUl9BU1NJR04sICcnKTtcbnZhciBwYXJ0cyA9IGNzc1RleHQuc3BsaXQoJzsnKTtcbmZvciAodmFyIGkgPSAwLCBwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbnAgPSBwYXJ0c1tpXTtcbmlmIChwLm1hdGNoKHRoaXMucnguTUlYSU5fTUFUQ0gpIHx8IHAubWF0Y2godGhpcy5yeC5WQVJfTUFUQ0gpKSB7XG5jdXN0b21Dc3NUZXh0ICs9IHAgKyAnO1xcbic7XG59XG59XG5yZXR1cm4gY3VzdG9tQ3NzVGV4dDtcbn0sXG5jb2xsZWN0UHJvcGVydGllc0luQ3NzVGV4dDogZnVuY3Rpb24gKGNzc1RleHQsIHByb3BzKSB7XG52YXIgbTtcbndoaWxlIChtID0gdGhpcy5yeC5WQVJfQ0FQVFVSRS5leGVjKGNzc1RleHQpKSB7XG5wcm9wc1ttWzFdXSA9IHRydWU7XG52YXIgZGVmID0gbVsyXTtcbmlmIChkZWYgJiYgZGVmLm1hdGNoKHRoaXMucnguSVNfVkFSKSkge1xucHJvcHNbZGVmXSA9IHRydWU7XG59XG59XG59LFxucmVpZnk6IGZ1bmN0aW9uIChwcm9wcykge1xudmFyIG5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocHJvcHMpO1xuZm9yICh2YXIgaSA9IDAsIG47IGkgPCBuYW1lcy5sZW5ndGg7IGkrKykge1xubiA9IG5hbWVzW2ldO1xucHJvcHNbbl0gPSB0aGlzLnZhbHVlRm9yUHJvcGVydHkocHJvcHNbbl0sIHByb3BzKTtcbn1cbn0sXG52YWx1ZUZvclByb3BlcnR5OiBmdW5jdGlvbiAocHJvcGVydHksIHByb3BzKSB7XG5pZiAocHJvcGVydHkpIHtcbmlmIChwcm9wZXJ0eS5pbmRleE9mKCc7JykgPj0gMCkge1xucHJvcGVydHkgPSB0aGlzLnZhbHVlRm9yUHJvcGVydGllcyhwcm9wZXJ0eSwgcHJvcHMpO1xufSBlbHNlIHtcbnZhciBzZWxmID0gdGhpcztcbnZhciBmbiA9IGZ1bmN0aW9uIChhbGwsIHByZWZpeCwgdmFsdWUsIGZhbGxiYWNrKSB7XG52YXIgcHJvcGVydHlWYWx1ZSA9IHNlbGYudmFsdWVGb3JQcm9wZXJ0eShwcm9wc1t2YWx1ZV0sIHByb3BzKSB8fCAocHJvcHNbZmFsbGJhY2tdID8gc2VsZi52YWx1ZUZvclByb3BlcnR5KHByb3BzW2ZhbGxiYWNrXSwgcHJvcHMpIDogZmFsbGJhY2spO1xucmV0dXJuIHByZWZpeCArIChwcm9wZXJ0eVZhbHVlIHx8ICcnKTtcbn07XG5wcm9wZXJ0eSA9IHByb3BlcnR5LnJlcGxhY2UodGhpcy5yeC5WQVJfTUFUQ0gsIGZuKTtcbn1cbn1cbnJldHVybiBwcm9wZXJ0eSAmJiBwcm9wZXJ0eS50cmltKCkgfHwgJyc7XG59LFxudmFsdWVGb3JQcm9wZXJ0aWVzOiBmdW5jdGlvbiAocHJvcGVydHksIHByb3BzKSB7XG52YXIgcGFydHMgPSBwcm9wZXJ0eS5zcGxpdCgnOycpO1xuZm9yICh2YXIgaSA9IDAsIHAsIG07IGkgPCBwYXJ0cy5sZW5ndGggJiYgKHAgPSBwYXJ0c1tpXSk7IGkrKykge1xubSA9IHAubWF0Y2godGhpcy5yeC5NSVhJTl9NQVRDSCk7XG5pZiAobSkge1xucCA9IHRoaXMudmFsdWVGb3JQcm9wZXJ0eShwcm9wc1ttWzFdXSwgcHJvcHMpO1xufSBlbHNlIHtcbnZhciBwcCA9IHAuc3BsaXQoJzonKTtcbmlmIChwcFsxXSkge1xucHBbMV0gPSBwcFsxXS50cmltKCk7XG5wcFsxXSA9IHRoaXMudmFsdWVGb3JQcm9wZXJ0eShwcFsxXSwgcHJvcHMpIHx8IHBwWzFdO1xufVxucCA9IHBwLmpvaW4oJzonKTtcbn1cbnBhcnRzW2ldID0gcCAmJiBwLmxhc3RJbmRleE9mKCc7JykgPT09IHAubGVuZ3RoIC0gMSA/IHAuc2xpY2UoMCwgLTEpIDogcCB8fCAnJztcbn1cbnJldHVybiBwYXJ0cy5qb2luKCc7Jyk7XG59LFxuYXBwbHlQcm9wZXJ0aWVzOiBmdW5jdGlvbiAocnVsZSwgcHJvcHMpIHtcbnZhciBvdXRwdXQgPSAnJztcbmlmICghcnVsZS5wcm9wZXJ0eUluZm8pIHtcbnRoaXMuZGVjb3JhdGVSdWxlKHJ1bGUpO1xufVxuaWYgKHJ1bGUucHJvcGVydHlJbmZvLmNzc1RleHQpIHtcbm91dHB1dCA9IHRoaXMudmFsdWVGb3JQcm9wZXJ0aWVzKHJ1bGUucHJvcGVydHlJbmZvLmNzc1RleHQsIHByb3BzKTtcbn1cbnJ1bGUuY3NzVGV4dCA9IG91dHB1dDtcbn0sXG5wcm9wZXJ0eURhdGFGcm9tU3R5bGVzOiBmdW5jdGlvbiAoc3R5bGVzLCBlbGVtZW50KSB7XG52YXIgcHJvcHMgPSB7fSwgc2VsZiA9IHRoaXM7XG52YXIgbyA9IFtdLCBpID0gMDtcbnN0eWxlVXRpbC5mb3JSdWxlc0luU3R5bGVzKHN0eWxlcywgZnVuY3Rpb24gKHJ1bGUpIHtcbmlmICghcnVsZS5wcm9wZXJ0eUluZm8pIHtcbnNlbGYuZGVjb3JhdGVSdWxlKHJ1bGUpO1xufVxuaWYgKGVsZW1lbnQgJiYgcnVsZS5wcm9wZXJ0eUluZm8ucHJvcGVydGllcyAmJiBtYXRjaGVzU2VsZWN0b3IuY2FsbChlbGVtZW50LCBydWxlLnNlbGVjdG9yKSkge1xuc2VsZi5jb2xsZWN0UHJvcGVydGllcyhydWxlLCBwcm9wcyk7XG5hZGRUb0JpdE1hc2soaSwgbyk7XG59XG5pKys7XG59KTtcbnJldHVybiB7XG5wcm9wZXJ0aWVzOiBwcm9wcyxcbmtleTogb1xufTtcbn0sXG5zY29wZVByb3BlcnRpZXNGcm9tU3R5bGVzOiBmdW5jdGlvbiAoc3R5bGVzKSB7XG5pZiAoIXN0eWxlcy5fc2NvcGVTdHlsZVByb3BlcnRpZXMpIHtcbnN0eWxlcy5fc2NvcGVTdHlsZVByb3BlcnRpZXMgPSB0aGlzLnNlbGVjdGVkUHJvcGVydGllc0Zyb21TdHlsZXMoc3R5bGVzLCB0aGlzLlNDT1BFX1NFTEVDVE9SUyk7XG59XG5yZXR1cm4gc3R5bGVzLl9zY29wZVN0eWxlUHJvcGVydGllcztcbn0sXG5ob3N0UHJvcGVydGllc0Zyb21TdHlsZXM6IGZ1bmN0aW9uIChzdHlsZXMpIHtcbmlmICghc3R5bGVzLl9ob3N0U3R5bGVQcm9wZXJ0aWVzKSB7XG5zdHlsZXMuX2hvc3RTdHlsZVByb3BlcnRpZXMgPSB0aGlzLnNlbGVjdGVkUHJvcGVydGllc0Zyb21TdHlsZXMoc3R5bGVzLCB0aGlzLkhPU1RfU0VMRUNUT1JTKTtcbn1cbnJldHVybiBzdHlsZXMuX2hvc3RTdHlsZVByb3BlcnRpZXM7XG59LFxuc2VsZWN0ZWRQcm9wZXJ0aWVzRnJvbVN0eWxlczogZnVuY3Rpb24gKHN0eWxlcywgc2VsZWN0b3JzKSB7XG52YXIgcHJvcHMgPSB7fSwgc2VsZiA9IHRoaXM7XG5zdHlsZVV0aWwuZm9yUnVsZXNJblN0eWxlcyhzdHlsZXMsIGZ1bmN0aW9uIChydWxlKSB7XG5pZiAoIXJ1bGUucHJvcGVydHlJbmZvKSB7XG5zZWxmLmRlY29yYXRlUnVsZShydWxlKTtcbn1cbmZvciAodmFyIGkgPSAwOyBpIDwgc2VsZWN0b3JzLmxlbmd0aDsgaSsrKSB7XG5pZiAocnVsZS5wYXJzZWRTZWxlY3RvciA9PT0gc2VsZWN0b3JzW2ldKSB7XG5zZWxmLmNvbGxlY3RQcm9wZXJ0aWVzKHJ1bGUsIHByb3BzKTtcbnJldHVybjtcbn1cbn1cbn0pO1xucmV0dXJuIHByb3BzO1xufSxcbnRyYW5zZm9ybVN0eWxlczogZnVuY3Rpb24gKGVsZW1lbnQsIHByb3BlcnRpZXMsIHNjb3BlU2VsZWN0b3IpIHtcbnZhciBzZWxmID0gdGhpcztcbnZhciBob3N0U2VsZWN0b3IgPSBzdHlsZVRyYW5zZm9ybWVyLl9jYWxjSG9zdFNjb3BlKGVsZW1lbnQuaXMsIGVsZW1lbnQuZXh0ZW5kcyk7XG52YXIgcnhIb3N0U2VsZWN0b3IgPSBlbGVtZW50LmV4dGVuZHMgPyAnXFxcXCcgKyBob3N0U2VsZWN0b3Iuc2xpY2UoMCwgLTEpICsgJ1xcXFxdJyA6IGhvc3RTZWxlY3RvcjtcbnZhciBob3N0UnggPSBuZXcgUmVnRXhwKHRoaXMucnguSE9TVF9QUkVGSVggKyByeEhvc3RTZWxlY3RvciArIHRoaXMucnguSE9TVF9TVUZGSVgpO1xucmV0dXJuIHN0eWxlVHJhbnNmb3JtZXIuZWxlbWVudFN0eWxlcyhlbGVtZW50LCBmdW5jdGlvbiAocnVsZSkge1xuc2VsZi5hcHBseVByb3BlcnRpZXMocnVsZSwgcHJvcGVydGllcyk7XG5pZiAocnVsZS5jc3NUZXh0ICYmICFuYXRpdmVTaGFkb3cpIHtcbnNlbGYuX3Njb3BlU2VsZWN0b3IocnVsZSwgaG9zdFJ4LCBob3N0U2VsZWN0b3IsIGVsZW1lbnQuX3Njb3BlQ3NzVmlhQXR0ciwgc2NvcGVTZWxlY3Rvcik7XG59XG59KTtcbn0sXG5fc2NvcGVTZWxlY3RvcjogZnVuY3Rpb24gKHJ1bGUsIGhvc3RSeCwgaG9zdFNlbGVjdG9yLCB2aWFBdHRyLCBzY29wZUlkKSB7XG5ydWxlLnRyYW5zZm9ybWVkU2VsZWN0b3IgPSBydWxlLnRyYW5zZm9ybWVkU2VsZWN0b3IgfHwgcnVsZS5zZWxlY3RvcjtcbnZhciBzZWxlY3RvciA9IHJ1bGUudHJhbnNmb3JtZWRTZWxlY3RvcjtcbnZhciBzY29wZSA9IHZpYUF0dHIgPyAnWycgKyBzdHlsZVRyYW5zZm9ybWVyLlNDT1BFX05BTUUgKyAnfj0nICsgc2NvcGVJZCArICddJyA6ICcuJyArIHNjb3BlSWQ7XG52YXIgcGFydHMgPSBzZWxlY3Rvci5zcGxpdCgnLCcpO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBwYXJ0cy5sZW5ndGgsIHA7IGkgPCBsICYmIChwID0gcGFydHNbaV0pOyBpKyspIHtcbnBhcnRzW2ldID0gcC5tYXRjaChob3N0UngpID8gcC5yZXBsYWNlKGhvc3RTZWxlY3RvciwgaG9zdFNlbGVjdG9yICsgc2NvcGUpIDogc2NvcGUgKyAnICcgKyBwO1xufVxucnVsZS5zZWxlY3RvciA9IHBhcnRzLmpvaW4oJywnKTtcbn0sXG5hcHBseUVsZW1lbnRTY29wZVNlbGVjdG9yOiBmdW5jdGlvbiAoZWxlbWVudCwgc2VsZWN0b3IsIG9sZCwgdmlhQXR0cikge1xudmFyIGMgPSB2aWFBdHRyID8gZWxlbWVudC5nZXRBdHRyaWJ1dGUoc3R5bGVUcmFuc2Zvcm1lci5TQ09QRV9OQU1FKSA6IGVsZW1lbnQuY2xhc3NOYW1lO1xudmFyIHYgPSBvbGQgPyBjLnJlcGxhY2Uob2xkLCBzZWxlY3RvcikgOiAoYyA/IGMgKyAnICcgOiAnJykgKyB0aGlzLlhTQ09QRV9OQU1FICsgJyAnICsgc2VsZWN0b3I7XG5pZiAoYyAhPT0gdikge1xuaWYgKHZpYUF0dHIpIHtcbmVsZW1lbnQuc2V0QXR0cmlidXRlKHN0eWxlVHJhbnNmb3JtZXIuU0NPUEVfTkFNRSwgdik7XG59IGVsc2Uge1xuZWxlbWVudC5jbGFzc05hbWUgPSB2O1xufVxufVxufSxcbmFwcGx5RWxlbWVudFN0eWxlOiBmdW5jdGlvbiAoZWxlbWVudCwgcHJvcGVydGllcywgc2VsZWN0b3IsIHN0eWxlKSB7XG52YXIgY3NzVGV4dCA9IHN0eWxlID8gc3R5bGUudGV4dENvbnRlbnQgfHwgJycgOiB0aGlzLnRyYW5zZm9ybVN0eWxlcyhlbGVtZW50LCBwcm9wZXJ0aWVzLCBzZWxlY3Rvcik7XG52YXIgcyA9IGVsZW1lbnQuX2N1c3RvbVN0eWxlO1xuaWYgKHMgJiYgIW5hdGl2ZVNoYWRvdyAmJiBzICE9PSBzdHlsZSkge1xucy5fdXNlQ291bnQtLTtcbmlmIChzLl91c2VDb3VudCA8PSAwICYmIHMucGFyZW50Tm9kZSkge1xucy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHMpO1xufVxufVxuaWYgKG5hdGl2ZVNoYWRvdyB8fCAoIXN0eWxlIHx8ICFzdHlsZS5wYXJlbnROb2RlKSkge1xuaWYgKG5hdGl2ZVNoYWRvdyAmJiBlbGVtZW50Ll9jdXN0b21TdHlsZSkge1xuZWxlbWVudC5fY3VzdG9tU3R5bGUudGV4dENvbnRlbnQgPSBjc3NUZXh0O1xuc3R5bGUgPSBlbGVtZW50Ll9jdXN0b21TdHlsZTtcbn0gZWxzZSBpZiAoY3NzVGV4dCkge1xuc3R5bGUgPSBzdHlsZVV0aWwuYXBwbHlDc3MoY3NzVGV4dCwgc2VsZWN0b3IsIG5hdGl2ZVNoYWRvdyA/IGVsZW1lbnQucm9vdCA6IG51bGwsIGVsZW1lbnQuX3Njb3BlU3R5bGUpO1xufVxufVxuaWYgKHN0eWxlKSB7XG5zdHlsZS5fdXNlQ291bnQgPSBzdHlsZS5fdXNlQ291bnQgfHwgMDtcbmlmIChlbGVtZW50Ll9jdXN0b21TdHlsZSAhPSBzdHlsZSkge1xuc3R5bGUuX3VzZUNvdW50Kys7XG59XG5lbGVtZW50Ll9jdXN0b21TdHlsZSA9IHN0eWxlO1xufVxucmV0dXJuIHN0eWxlO1xufSxcbm1peGluQ3VzdG9tU3R5bGU6IGZ1bmN0aW9uIChwcm9wcywgY3VzdG9tU3R5bGUpIHtcbnZhciB2O1xuZm9yICh2YXIgaSBpbiBjdXN0b21TdHlsZSkge1xudiA9IGN1c3RvbVN0eWxlW2ldO1xuaWYgKHYgfHwgdiA9PT0gMCkge1xucHJvcHNbaV0gPSB2O1xufVxufVxufSxcbnJ4OiB7XG5WQVJfQVNTSUdOOiAvKD86XnxbO1xcbl1cXHMqKSgtLVtcXHctXSo/KTpcXHMqKD86KFteO3tdKil8eyhbXn1dKil9KSg/Oig/PVs7XFxuXSl8JCkvZ2ksXG5NSVhJTl9NQVRDSDogLyg/Ol58XFxXKylAYXBwbHlbXFxzXSpcXCgoW14pXSopXFwpL2ksXG5WQVJfTUFUQ0g6IC8oXnxcXFcrKXZhclxcKFtcXHNdKihbXiwpXSopW1xcc10qLD9bXFxzXSooKD86W14sKV0qKXwoPzpbXjtdKlxcKFteOyldKlxcKSkpW1xcc10qP1xcKS9naSxcblZBUl9DQVBUVVJFOiAvXFwoW1xcc10qKC0tW14sXFxzKV0qKSg/OixbXFxzXSooLS1bXixcXHMpXSopKT8oPzpcXCl8LCkvZ2ksXG5JU19WQVI6IC9eLS0vLFxuQlJBQ0tFVEVEOiAvXFx7W159XSpcXH0vZyxcbkhPU1RfUFJFRklYOiAnKD86XnxbXi4jWzpdKScsXG5IT1NUX1NVRkZJWDogJygkfFsuOltcXFxccz4rfl0pJ1xufSxcbkhPU1RfU0VMRUNUT1JTOiBbJzpob3N0J10sXG5TQ09QRV9TRUxFQ1RPUlM6IFsnOnJvb3QnXSxcblhTQ09QRV9OQU1FOiAneC1zY29wZSdcbn07XG5mdW5jdGlvbiBhZGRUb0JpdE1hc2sobiwgYml0cykge1xudmFyIG8gPSBwYXJzZUludChuIC8gMzIpO1xudmFyIHYgPSAxIDw8IG4gJSAzMjtcbmJpdHNbb10gPSAoYml0c1tvXSB8fCAwKSB8IHY7XG59XG59KCk7XG4oZnVuY3Rpb24gKCkge1xuUG9seW1lci5TdHlsZUNhY2hlID0gZnVuY3Rpb24gKCkge1xudGhpcy5jYWNoZSA9IHt9O1xufTtcblBvbHltZXIuU3R5bGVDYWNoZS5wcm90b3R5cGUgPSB7XG5NQVg6IDEwMCxcbnN0b3JlOiBmdW5jdGlvbiAoaXMsIGRhdGEsIGtleVZhbHVlcywga2V5U3R5bGVzKSB7XG5kYXRhLmtleVZhbHVlcyA9IGtleVZhbHVlcztcbmRhdGEuc3R5bGVzID0ga2V5U3R5bGVzO1xudmFyIHMkID0gdGhpcy5jYWNoZVtpc10gPSB0aGlzLmNhY2hlW2lzXSB8fCBbXTtcbnMkLnB1c2goZGF0YSk7XG5pZiAocyQubGVuZ3RoID4gdGhpcy5NQVgpIHtcbnMkLnNoaWZ0KCk7XG59XG59LFxucmV0cmlldmU6IGZ1bmN0aW9uIChpcywga2V5VmFsdWVzLCBrZXlTdHlsZXMpIHtcbnZhciBjYWNoZSA9IHRoaXMuY2FjaGVbaXNdO1xuaWYgKGNhY2hlKSB7XG5mb3IgKHZhciBpID0gY2FjaGUubGVuZ3RoIC0gMSwgZGF0YTsgaSA+PSAwOyBpLS0pIHtcbmRhdGEgPSBjYWNoZVtpXTtcbmlmIChrZXlTdHlsZXMgPT09IGRhdGEuc3R5bGVzICYmIHRoaXMuX29iamVjdHNFcXVhbChrZXlWYWx1ZXMsIGRhdGEua2V5VmFsdWVzKSkge1xucmV0dXJuIGRhdGE7XG59XG59XG59XG59LFxuY2xlYXI6IGZ1bmN0aW9uICgpIHtcbnRoaXMuY2FjaGUgPSB7fTtcbn0sXG5fb2JqZWN0c0VxdWFsOiBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcbnZhciB0LCBzO1xuZm9yICh2YXIgaSBpbiB0YXJnZXQpIHtcbnQgPSB0YXJnZXRbaV0sIHMgPSBzb3VyY2VbaV07XG5pZiAoISh0eXBlb2YgdCA9PT0gJ29iamVjdCcgJiYgdCA/IHRoaXMuX29iamVjdHNTdHJpY3RseUVxdWFsKHQsIHMpIDogdCA9PT0gcykpIHtcbnJldHVybiBmYWxzZTtcbn1cbn1cbmlmIChBcnJheS5pc0FycmF5KHRhcmdldCkpIHtcbnJldHVybiB0YXJnZXQubGVuZ3RoID09PSBzb3VyY2UubGVuZ3RoO1xufVxucmV0dXJuIHRydWU7XG59LFxuX29iamVjdHNTdHJpY3RseUVxdWFsOiBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcbnJldHVybiB0aGlzLl9vYmplY3RzRXF1YWwodGFyZ2V0LCBzb3VyY2UpICYmIHRoaXMuX29iamVjdHNFcXVhbChzb3VyY2UsIHRhcmdldCk7XG59XG59O1xufSgpKTtcblBvbHltZXIuU3R5bGVEZWZhdWx0cyA9IGZ1bmN0aW9uICgpIHtcbnZhciBzdHlsZVByb3BlcnRpZXMgPSBQb2x5bWVyLlN0eWxlUHJvcGVydGllcztcbnZhciBzdHlsZVV0aWwgPSBQb2x5bWVyLlN0eWxlVXRpbDtcbnZhciBTdHlsZUNhY2hlID0gUG9seW1lci5TdHlsZUNhY2hlO1xudmFyIGFwaSA9IHtcbl9zdHlsZXM6IFtdLFxuX3Byb3BlcnRpZXM6IG51bGwsXG5jdXN0b21TdHlsZToge30sXG5fc3R5bGVDYWNoZTogbmV3IFN0eWxlQ2FjaGUoKSxcbmFkZFN0eWxlOiBmdW5jdGlvbiAoc3R5bGUpIHtcbnRoaXMuX3N0eWxlcy5wdXNoKHN0eWxlKTtcbnRoaXMuX3Byb3BlcnRpZXMgPSBudWxsO1xufSxcbmdldCBfc3R5bGVQcm9wZXJ0aWVzKCkge1xuaWYgKCF0aGlzLl9wcm9wZXJ0aWVzKSB7XG5zdHlsZVByb3BlcnRpZXMuZGVjb3JhdGVTdHlsZXModGhpcy5fc3R5bGVzKTtcbnRoaXMuX3N0eWxlcy5fc2NvcGVTdHlsZVByb3BlcnRpZXMgPSBudWxsO1xudGhpcy5fcHJvcGVydGllcyA9IHN0eWxlUHJvcGVydGllcy5zY29wZVByb3BlcnRpZXNGcm9tU3R5bGVzKHRoaXMuX3N0eWxlcyk7XG5zdHlsZVByb3BlcnRpZXMubWl4aW5DdXN0b21TdHlsZSh0aGlzLl9wcm9wZXJ0aWVzLCB0aGlzLmN1c3RvbVN0eWxlKTtcbnN0eWxlUHJvcGVydGllcy5yZWlmeSh0aGlzLl9wcm9wZXJ0aWVzKTtcbn1cbnJldHVybiB0aGlzLl9wcm9wZXJ0aWVzO1xufSxcbl9uZWVkc1N0eWxlUHJvcGVydGllczogZnVuY3Rpb24gKCkge1xufSxcbl9jb21wdXRlU3R5bGVQcm9wZXJ0aWVzOiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gdGhpcy5fc3R5bGVQcm9wZXJ0aWVzO1xufSxcbnVwZGF0ZVN0eWxlczogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcbnRoaXMuX3Byb3BlcnRpZXMgPSBudWxsO1xuaWYgKHByb3BlcnRpZXMpIHtcblBvbHltZXIuQmFzZS5taXhpbih0aGlzLmN1c3RvbVN0eWxlLCBwcm9wZXJ0aWVzKTtcbn1cbnRoaXMuX3N0eWxlQ2FjaGUuY2xlYXIoKTtcbmZvciAodmFyIGkgPSAwLCBzOyBpIDwgdGhpcy5fc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG5zID0gdGhpcy5fc3R5bGVzW2ldO1xucyA9IHMuX19pbXBvcnRFbGVtZW50IHx8IHM7XG5zLl9hcHBseSgpO1xufVxufVxufTtcbnJldHVybiBhcGk7XG59KCk7XG4oZnVuY3Rpb24gKCkge1xuJ3VzZSBzdHJpY3QnO1xudmFyIHNlcmlhbGl6ZVZhbHVlVG9BdHRyaWJ1dGUgPSBQb2x5bWVyLkJhc2Uuc2VyaWFsaXplVmFsdWVUb0F0dHJpYnV0ZTtcbnZhciBwcm9wZXJ0eVV0aWxzID0gUG9seW1lci5TdHlsZVByb3BlcnRpZXM7XG52YXIgc3R5bGVUcmFuc2Zvcm1lciA9IFBvbHltZXIuU3R5bGVUcmFuc2Zvcm1lcjtcbnZhciBzdHlsZVV0aWwgPSBQb2x5bWVyLlN0eWxlVXRpbDtcbnZhciBzdHlsZURlZmF1bHRzID0gUG9seW1lci5TdHlsZURlZmF1bHRzO1xudmFyIG5hdGl2ZVNoYWRvdyA9IFBvbHltZXIuU2V0dGluZ3MudXNlTmF0aXZlU2hhZG93O1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9wcmVwU3R5bGVQcm9wZXJ0aWVzOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9vd25TdHlsZVByb3BlcnR5TmFtZXMgPSB0aGlzLl9zdHlsZXMgPyBwcm9wZXJ0eVV0aWxzLmRlY29yYXRlU3R5bGVzKHRoaXMuX3N0eWxlcykgOiBbXTtcbn0sXG5fc2V0dXBTdHlsZVByb3BlcnRpZXM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuY3VzdG9tU3R5bGUgPSB7fTtcbn0sXG5fbmVlZHNTdHlsZVByb3BlcnRpZXM6IGZ1bmN0aW9uICgpIHtcbnJldHVybiBCb29sZWFuKHRoaXMuX293blN0eWxlUHJvcGVydHlOYW1lcyAmJiB0aGlzLl9vd25TdHlsZVByb3BlcnR5TmFtZXMubGVuZ3RoKTtcbn0sXG5fYmVmb3JlQXR0YWNoZWQ6IGZ1bmN0aW9uICgpIHtcbmlmICghdGhpcy5fc2NvcGVTZWxlY3RvciAmJiB0aGlzLl9uZWVkc1N0eWxlUHJvcGVydGllcygpKSB7XG50aGlzLl91cGRhdGVTdHlsZVByb3BlcnRpZXMoKTtcbn1cbn0sXG5fdXBkYXRlU3R5bGVQcm9wZXJ0aWVzOiBmdW5jdGlvbiAoKSB7XG52YXIgaW5mbywgc2NvcGUgPSB0aGlzLmRvbUhvc3QgfHwgc3R5bGVEZWZhdWx0cztcbmlmICghc2NvcGUuX3N0eWxlQ2FjaGUpIHtcbnNjb3BlLl9zdHlsZUNhY2hlID0gbmV3IFBvbHltZXIuU3R5bGVDYWNoZSgpO1xufVxudmFyIHNjb3BlRGF0YSA9IHByb3BlcnR5VXRpbHMucHJvcGVydHlEYXRhRnJvbVN0eWxlcyhzY29wZS5fc3R5bGVzLCB0aGlzKTtcbnNjb3BlRGF0YS5rZXkuY3VzdG9tU3R5bGUgPSB0aGlzLmN1c3RvbVN0eWxlO1xuaW5mbyA9IHNjb3BlLl9zdHlsZUNhY2hlLnJldHJpZXZlKHRoaXMuaXMsIHNjb3BlRGF0YS5rZXksIHRoaXMuX3N0eWxlcyk7XG52YXIgc2NvcGVDYWNoZWQgPSBCb29sZWFuKGluZm8pO1xuaWYgKHNjb3BlQ2FjaGVkKSB7XG50aGlzLl9zdHlsZVByb3BlcnRpZXMgPSBpbmZvLl9zdHlsZVByb3BlcnRpZXM7XG59IGVsc2Uge1xudGhpcy5fY29tcHV0ZVN0eWxlUHJvcGVydGllcyhzY29wZURhdGEucHJvcGVydGllcyk7XG59XG50aGlzLl9jb21wdXRlT3duU3R5bGVQcm9wZXJ0aWVzKCk7XG5pZiAoIXNjb3BlQ2FjaGVkKSB7XG5pbmZvID0gc3R5bGVDYWNoZS5yZXRyaWV2ZSh0aGlzLmlzLCB0aGlzLl9vd25TdHlsZVByb3BlcnRpZXMsIHRoaXMuX3N0eWxlcyk7XG59XG52YXIgZ2xvYmFsQ2FjaGVkID0gQm9vbGVhbihpbmZvKSAmJiAhc2NvcGVDYWNoZWQ7XG52YXIgc3R5bGUgPSB0aGlzLl9hcHBseVN0eWxlUHJvcGVydGllcyhpbmZvKTtcbmlmICghc2NvcGVDYWNoZWQpIHtcbnN0eWxlID0gc3R5bGUgJiYgbmF0aXZlU2hhZG93ID8gc3R5bGUuY2xvbmVOb2RlKHRydWUpIDogc3R5bGU7XG5pbmZvID0ge1xuc3R5bGU6IHN0eWxlLFxuX3Njb3BlU2VsZWN0b3I6IHRoaXMuX3Njb3BlU2VsZWN0b3IsXG5fc3R5bGVQcm9wZXJ0aWVzOiB0aGlzLl9zdHlsZVByb3BlcnRpZXNcbn07XG5zY29wZURhdGEua2V5LmN1c3RvbVN0eWxlID0ge307XG50aGlzLm1peGluKHNjb3BlRGF0YS5rZXkuY3VzdG9tU3R5bGUsIHRoaXMuY3VzdG9tU3R5bGUpO1xuc2NvcGUuX3N0eWxlQ2FjaGUuc3RvcmUodGhpcy5pcywgaW5mbywgc2NvcGVEYXRhLmtleSwgdGhpcy5fc3R5bGVzKTtcbmlmICghZ2xvYmFsQ2FjaGVkKSB7XG5zdHlsZUNhY2hlLnN0b3JlKHRoaXMuaXMsIE9iamVjdC5jcmVhdGUoaW5mbyksIHRoaXMuX293blN0eWxlUHJvcGVydGllcywgdGhpcy5fc3R5bGVzKTtcbn1cbn1cbn0sXG5fY29tcHV0ZVN0eWxlUHJvcGVydGllczogZnVuY3Rpb24gKHNjb3BlUHJvcHMpIHtcbnZhciBzY29wZSA9IHRoaXMuZG9tSG9zdCB8fCBzdHlsZURlZmF1bHRzO1xuaWYgKCFzY29wZS5fc3R5bGVQcm9wZXJ0aWVzKSB7XG5zY29wZS5fY29tcHV0ZVN0eWxlUHJvcGVydGllcygpO1xufVxudmFyIHByb3BzID0gT2JqZWN0LmNyZWF0ZShzY29wZS5fc3R5bGVQcm9wZXJ0aWVzKTtcbnRoaXMubWl4aW4ocHJvcHMsIHByb3BlcnR5VXRpbHMuaG9zdFByb3BlcnRpZXNGcm9tU3R5bGVzKHRoaXMuX3N0eWxlcykpO1xuc2NvcGVQcm9wcyA9IHNjb3BlUHJvcHMgfHwgcHJvcGVydHlVdGlscy5wcm9wZXJ0eURhdGFGcm9tU3R5bGVzKHNjb3BlLl9zdHlsZXMsIHRoaXMpLnByb3BlcnRpZXM7XG50aGlzLm1peGluKHByb3BzLCBzY29wZVByb3BzKTtcbnRoaXMubWl4aW4ocHJvcHMsIHByb3BlcnR5VXRpbHMuc2NvcGVQcm9wZXJ0aWVzRnJvbVN0eWxlcyh0aGlzLl9zdHlsZXMpKTtcbnByb3BlcnR5VXRpbHMubWl4aW5DdXN0b21TdHlsZShwcm9wcywgdGhpcy5jdXN0b21TdHlsZSk7XG5wcm9wZXJ0eVV0aWxzLnJlaWZ5KHByb3BzKTtcbnRoaXMuX3N0eWxlUHJvcGVydGllcyA9IHByb3BzO1xufSxcbl9jb21wdXRlT3duU3R5bGVQcm9wZXJ0aWVzOiBmdW5jdGlvbiAoKSB7XG52YXIgcHJvcHMgPSB7fTtcbmZvciAodmFyIGkgPSAwLCBuOyBpIDwgdGhpcy5fb3duU3R5bGVQcm9wZXJ0eU5hbWVzLmxlbmd0aDsgaSsrKSB7XG5uID0gdGhpcy5fb3duU3R5bGVQcm9wZXJ0eU5hbWVzW2ldO1xucHJvcHNbbl0gPSB0aGlzLl9zdHlsZVByb3BlcnRpZXNbbl07XG59XG50aGlzLl9vd25TdHlsZVByb3BlcnRpZXMgPSBwcm9wcztcbn0sXG5fc2NvcGVDb3VudDogMCxcbl9hcHBseVN0eWxlUHJvcGVydGllczogZnVuY3Rpb24gKGluZm8pIHtcbnZhciBvbGRTY29wZVNlbGVjdG9yID0gdGhpcy5fc2NvcGVTZWxlY3RvcjtcbnRoaXMuX3Njb3BlU2VsZWN0b3IgPSBpbmZvID8gaW5mby5fc2NvcGVTZWxlY3RvciA6IHRoaXMuaXMgKyAnLScgKyB0aGlzLl9fcHJvdG9fXy5fc2NvcGVDb3VudCsrO1xudmFyIHN0eWxlID0gcHJvcGVydHlVdGlscy5hcHBseUVsZW1lbnRTdHlsZSh0aGlzLCB0aGlzLl9zdHlsZVByb3BlcnRpZXMsIHRoaXMuX3Njb3BlU2VsZWN0b3IsIGluZm8gJiYgaW5mby5zdHlsZSk7XG5pZiAoIW5hdGl2ZVNoYWRvdykge1xucHJvcGVydHlVdGlscy5hcHBseUVsZW1lbnRTY29wZVNlbGVjdG9yKHRoaXMsIHRoaXMuX3Njb3BlU2VsZWN0b3IsIG9sZFNjb3BlU2VsZWN0b3IsIHRoaXMuX3Njb3BlQ3NzVmlhQXR0cik7XG59XG5yZXR1cm4gc3R5bGU7XG59LFxuc2VyaWFsaXplVmFsdWVUb0F0dHJpYnV0ZTogZnVuY3Rpb24gKHZhbHVlLCBhdHRyaWJ1dGUsIG5vZGUpIHtcbm5vZGUgPSBub2RlIHx8IHRoaXM7XG5pZiAoYXR0cmlidXRlID09PSAnY2xhc3MnKSB7XG52YXIgaG9zdCA9IG5vZGUgPT09IHRoaXMgPyB0aGlzLmRvbUhvc3QgfHwgdGhpcy5kYXRhSG9zdCA6IHRoaXM7XG5pZiAoaG9zdCkge1xudmFsdWUgPSBob3N0Ll9zY29wZUVsZW1lbnRDbGFzcyhub2RlLCB2YWx1ZSk7XG59XG59XG5ub2RlID0gUG9seW1lci5kb20obm9kZSk7XG5zZXJpYWxpemVWYWx1ZVRvQXR0cmlidXRlLmNhbGwodGhpcywgdmFsdWUsIGF0dHJpYnV0ZSwgbm9kZSk7XG59LFxuX3Njb3BlRWxlbWVudENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgc2VsZWN0b3IpIHtcbmlmICghbmF0aXZlU2hhZG93ICYmICF0aGlzLl9zY29wZUNzc1ZpYUF0dHIpIHtcbnNlbGVjdG9yICs9IChzZWxlY3RvciA/ICcgJyA6ICcnKSArIFNDT1BFX05BTUUgKyAnICcgKyB0aGlzLmlzICsgKGVsZW1lbnQuX3Njb3BlU2VsZWN0b3IgPyAnICcgKyBYU0NPUEVfTkFNRSArICcgJyArIGVsZW1lbnQuX3Njb3BlU2VsZWN0b3IgOiAnJyk7XG59XG5yZXR1cm4gc2VsZWN0b3I7XG59LFxudXBkYXRlU3R5bGVzOiBmdW5jdGlvbiAocHJvcGVydGllcykge1xuaWYgKHRoaXMuaXNBdHRhY2hlZCkge1xuaWYgKHByb3BlcnRpZXMpIHtcbnRoaXMubWl4aW4odGhpcy5jdXN0b21TdHlsZSwgcHJvcGVydGllcyk7XG59XG5pZiAodGhpcy5fbmVlZHNTdHlsZVByb3BlcnRpZXMoKSkge1xudGhpcy5fdXBkYXRlU3R5bGVQcm9wZXJ0aWVzKCk7XG59IGVsc2Uge1xudGhpcy5fc3R5bGVQcm9wZXJ0aWVzID0gbnVsbDtcbn1cbmlmICh0aGlzLl9zdHlsZUNhY2hlKSB7XG50aGlzLl9zdHlsZUNhY2hlLmNsZWFyKCk7XG59XG50aGlzLl91cGRhdGVSb290U3R5bGVzKCk7XG59XG59LFxuX3VwZGF0ZVJvb3RTdHlsZXM6IGZ1bmN0aW9uIChyb290KSB7XG5yb290ID0gcm9vdCB8fCB0aGlzLnJvb3Q7XG52YXIgYyQgPSBQb2x5bWVyLmRvbShyb290KS5fcXVlcnkoZnVuY3Rpb24gKGUpIHtcbnJldHVybiBlLnNoYWR5Um9vdCB8fCBlLnNoYWRvd1Jvb3Q7XG59KTtcbmZvciAodmFyIGkgPSAwLCBsID0gYyQubGVuZ3RoLCBjOyBpIDwgbCAmJiAoYyA9IGMkW2ldKTsgaSsrKSB7XG5pZiAoYy51cGRhdGVTdHlsZXMpIHtcbmMudXBkYXRlU3R5bGVzKCk7XG59XG59XG59XG59KTtcblBvbHltZXIudXBkYXRlU3R5bGVzID0gZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcbnN0eWxlRGVmYXVsdHMudXBkYXRlU3R5bGVzKHByb3BlcnRpZXMpO1xuUG9seW1lci5CYXNlLl91cGRhdGVSb290U3R5bGVzKGRvY3VtZW50KTtcbn07XG52YXIgc3R5bGVDYWNoZSA9IG5ldyBQb2x5bWVyLlN0eWxlQ2FjaGUoKTtcblBvbHltZXIuY3VzdG9tU3R5bGVDYWNoZSA9IHN0eWxlQ2FjaGU7XG52YXIgU0NPUEVfTkFNRSA9IHN0eWxlVHJhbnNmb3JtZXIuU0NPUEVfTkFNRTtcbnZhciBYU0NPUEVfTkFNRSA9IHByb3BlcnR5VXRpbHMuWFNDT1BFX05BTUU7XG59KCkpO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9yZWdpc3RlckZlYXR1cmVzOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9wcmVwSXMoKTtcbnRoaXMuX3ByZXBBdHRyaWJ1dGVzKCk7XG50aGlzLl9wcmVwRXh0ZW5kcygpO1xudGhpcy5fcHJlcENvbnN0cnVjdG9yKCk7XG50aGlzLl9wcmVwVGVtcGxhdGUoKTtcbnRoaXMuX3ByZXBTdHlsZXMoKTtcbnRoaXMuX3ByZXBTdHlsZVByb3BlcnRpZXMoKTtcbnRoaXMuX3ByZXBBbm5vdGF0aW9ucygpO1xudGhpcy5fcHJlcEVmZmVjdHMoKTtcbnRoaXMuX3ByZXBCZWhhdmlvcnMoKTtcbnRoaXMuX3ByZXBCaW5kaW5ncygpO1xudGhpcy5fcHJlcFNoYWR5KCk7XG59LFxuX3ByZXBCZWhhdmlvcjogZnVuY3Rpb24gKGIpIHtcbnRoaXMuX2FkZFByb3BlcnR5RWZmZWN0cyhiLnByb3BlcnRpZXMpO1xudGhpcy5fYWRkQ29tcGxleE9ic2VydmVyRWZmZWN0cyhiLm9ic2VydmVycyk7XG50aGlzLl9hZGRIb3N0QXR0cmlidXRlcyhiLmhvc3RBdHRyaWJ1dGVzKTtcbn0sXG5faW5pdEZlYXR1cmVzOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9wb29sQ29udGVudCgpO1xudGhpcy5fc2V0dXBDb25maWd1cmUoKTtcbnRoaXMuX3NldHVwU3R5bGVQcm9wZXJ0aWVzKCk7XG50aGlzLl9wdXNoSG9zdCgpO1xudGhpcy5fc3RhbXBUZW1wbGF0ZSgpO1xudGhpcy5fcG9wSG9zdCgpO1xudGhpcy5fbWFyc2hhbEFubm90YXRpb25SZWZlcmVuY2VzKCk7XG50aGlzLl9tYXJzaGFsSG9zdEF0dHJpYnV0ZXMoKTtcbnRoaXMuX3NldHVwRGVib3VuY2VycygpO1xudGhpcy5fbWFyc2hhbEluc3RhbmNlRWZmZWN0cygpO1xudGhpcy5fbWFyc2hhbEJlaGF2aW9ycygpO1xudGhpcy5fbWFyc2hhbEF0dHJpYnV0ZXMoKTtcbnRoaXMuX3RyeVJlYWR5KCk7XG59LFxuX21hcnNoYWxCZWhhdmlvcjogZnVuY3Rpb24gKGIpIHtcbnRoaXMuX2xpc3Rlbkxpc3RlbmVycyhiLmxpc3RlbmVycyk7XG59XG59KTtcbihmdW5jdGlvbiAoKSB7XG52YXIgbmF0aXZlU2hhZG93ID0gUG9seW1lci5TZXR0aW5ncy51c2VOYXRpdmVTaGFkb3c7XG52YXIgcHJvcGVydHlVdGlscyA9IFBvbHltZXIuU3R5bGVQcm9wZXJ0aWVzO1xudmFyIHN0eWxlVXRpbCA9IFBvbHltZXIuU3R5bGVVdGlsO1xudmFyIHN0eWxlRGVmYXVsdHMgPSBQb2x5bWVyLlN0eWxlRGVmYXVsdHM7XG52YXIgc3R5bGVUcmFuc2Zvcm1lciA9IFBvbHltZXIuU3R5bGVUcmFuc2Zvcm1lcjtcblBvbHltZXIoe1xuaXM6ICdjdXN0b20tc3R5bGUnLFxuZXh0ZW5kczogJ3N0eWxlJyxcbmNyZWF0ZWQ6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3RyeUFwcGx5KCk7XG59LFxuYXR0YWNoZWQ6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3RyeUFwcGx5KCk7XG59LFxuX3RyeUFwcGx5OiBmdW5jdGlvbiAoKSB7XG5pZiAoIXRoaXMuX2FwcGxpZXNUb0RvY3VtZW50KSB7XG5pZiAodGhpcy5wYXJlbnROb2RlICYmIHRoaXMucGFyZW50Tm9kZS5sb2NhbE5hbWUgIT09ICdkb20tbW9kdWxlJykge1xudGhpcy5fYXBwbGllc1RvRG9jdW1lbnQgPSB0cnVlO1xudmFyIGUgPSB0aGlzLl9fYXBwbGllZEVsZW1lbnQgfHwgdGhpcztcbnN0eWxlRGVmYXVsdHMuYWRkU3R5bGUoZSk7XG5pZiAoZS50ZXh0Q29udGVudCkge1xudGhpcy5fYXBwbHkoKTtcbn0gZWxzZSB7XG52YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7XG5vYnNlcnZlci5kaXNjb25uZWN0KCk7XG50aGlzLl9hcHBseSgpO1xufS5iaW5kKHRoaXMpKTtcbm9ic2VydmVyLm9ic2VydmUoZSwgeyBjaGlsZExpc3Q6IHRydWUgfSk7XG59XG59XG59XG59LFxuX2FwcGx5OiBmdW5jdGlvbiAoKSB7XG52YXIgZSA9IHRoaXMuX19hcHBsaWVkRWxlbWVudCB8fCB0aGlzO1xudGhpcy5fY29tcHV0ZVN0eWxlUHJvcGVydGllcygpO1xudmFyIHByb3BzID0gdGhpcy5fc3R5bGVQcm9wZXJ0aWVzO1xudmFyIHNlbGYgPSB0aGlzO1xuZS50ZXh0Q29udGVudCA9IHN0eWxlVXRpbC50b0Nzc1RleHQoc3R5bGVVdGlsLnJ1bGVzRm9yU3R5bGUoZSksIGZ1bmN0aW9uIChydWxlKSB7XG52YXIgY3NzID0gcnVsZS5jc3NUZXh0ID0gcnVsZS5wYXJzZWRDc3NUZXh0O1xuaWYgKHJ1bGUucHJvcGVydHlJbmZvICYmIHJ1bGUucHJvcGVydHlJbmZvLmNzc1RleHQpIHtcbmNzcyA9IGNzcy5yZXBsYWNlKHByb3BlcnR5VXRpbHMucnguVkFSX0FTU0lHTiwgJycpO1xucnVsZS5jc3NUZXh0ID0gcHJvcGVydHlVdGlscy52YWx1ZUZvclByb3BlcnRpZXMoY3NzLCBwcm9wcyk7XG59XG5zdHlsZVRyYW5zZm9ybWVyLmRvY3VtZW50UnVsZShydWxlKTtcbn0pO1xufVxufSk7XG59KCkpO1xuUG9seW1lci5UZW1wbGF0aXplciA9IHtcbnByb3BlcnRpZXM6IHsgX19oaWRlVGVtcGxhdGVDaGlsZHJlbl9fOiB7IG9ic2VydmVyOiAnX3Nob3dIaWRlQ2hpbGRyZW4nIH0gfSxcbl90ZW1wbGF0aXplclN0YXRpYzoge1xuY291bnQ6IDAsXG5jYWxsYmFja3M6IHt9LFxuZGVib3VuY2VyOiBudWxsXG59LFxuX2luc3RhbmNlUHJvcHM6IFBvbHltZXIubm9iLFxuY3JlYXRlZDogZnVuY3Rpb24gKCkge1xudGhpcy5fdGVtcGxhdGl6ZXJJZCA9IHRoaXMuX3RlbXBsYXRpemVyU3RhdGljLmNvdW50Kys7XG59LFxudGVtcGxhdGl6ZTogZnVuY3Rpb24gKHRlbXBsYXRlKSB7XG5pZiAoIXRlbXBsYXRlLl9jb250ZW50KSB7XG50ZW1wbGF0ZS5fY29udGVudCA9IHRlbXBsYXRlLmNvbnRlbnQ7XG59XG5pZiAodGVtcGxhdGUuX2NvbnRlbnQuX2N0b3IpIHtcbnRoaXMuY3RvciA9IHRlbXBsYXRlLl9jb250ZW50Ll9jdG9yO1xudGhpcy5fcHJlcFBhcmVudFByb3BlcnRpZXModGhpcy5jdG9yLnByb3RvdHlwZSwgdGVtcGxhdGUpO1xucmV0dXJuO1xufVxudmFyIGFyY2hldHlwZSA9IE9iamVjdC5jcmVhdGUoUG9seW1lci5CYXNlKTtcbnRoaXMuX2N1c3RvbVByZXBBbm5vdGF0aW9ucyhhcmNoZXR5cGUsIHRlbXBsYXRlKTtcbmFyY2hldHlwZS5fcHJlcEVmZmVjdHMoKTtcbnRoaXMuX2N1c3RvbVByZXBFZmZlY3RzKGFyY2hldHlwZSk7XG5hcmNoZXR5cGUuX3ByZXBCZWhhdmlvcnMoKTtcbmFyY2hldHlwZS5fcHJlcEJpbmRpbmdzKCk7XG50aGlzLl9wcmVwUGFyZW50UHJvcGVydGllcyhhcmNoZXR5cGUsIHRlbXBsYXRlKTtcbmFyY2hldHlwZS5fbm90aWZ5UGF0aCA9IHRoaXMuX25vdGlmeVBhdGhJbXBsO1xuYXJjaGV0eXBlLl9zY29wZUVsZW1lbnRDbGFzcyA9IHRoaXMuX3Njb3BlRWxlbWVudENsYXNzSW1wbDtcbmFyY2hldHlwZS5saXN0ZW4gPSB0aGlzLl9saXN0ZW5JbXBsO1xuYXJjaGV0eXBlLl9zaG93SGlkZUNoaWxkcmVuID0gdGhpcy5fc2hvd0hpZGVDaGlsZHJlbkltcGw7XG52YXIgX2NvbnN0cnVjdG9yID0gdGhpcy5fY29uc3RydWN0b3JJbXBsO1xudmFyIGN0b3IgPSBmdW5jdGlvbiBUZW1wbGF0ZUluc3RhbmNlKG1vZGVsLCBob3N0KSB7XG5fY29uc3RydWN0b3IuY2FsbCh0aGlzLCBtb2RlbCwgaG9zdCk7XG59O1xuY3Rvci5wcm90b3R5cGUgPSBhcmNoZXR5cGU7XG5hcmNoZXR5cGUuY29uc3RydWN0b3IgPSBjdG9yO1xudGVtcGxhdGUuX2NvbnRlbnQuX2N0b3IgPSBjdG9yO1xudGhpcy5jdG9yID0gY3Rvcjtcbn0sXG5fZ2V0Um9vdERhdGFIb3N0OiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gdGhpcy5kYXRhSG9zdCAmJiB0aGlzLmRhdGFIb3N0Ll9yb290RGF0YUhvc3QgfHwgdGhpcy5kYXRhSG9zdDtcbn0sXG5fc2hvd0hpZGVDaGlsZHJlbkltcGw6IGZ1bmN0aW9uIChoaWRlKSB7XG52YXIgYyA9IHRoaXMuX2NoaWxkcmVuO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBjLmxlbmd0aDsgaSsrKSB7XG52YXIgbiA9IGNbaV07XG5pZiAobi5zdHlsZSkge1xubi5zdHlsZS5kaXNwbGF5ID0gaGlkZSA/ICdub25lJyA6ICcnO1xubi5fX2hpZGVUZW1wbGF0ZUNoaWxkcmVuX18gPSBoaWRlO1xufVxufVxufSxcbl9kZWJvdW5jZVRlbXBsYXRlOiBmdW5jdGlvbiAoZm4pIHtcbnRoaXMuX3RlbXBsYXRpemVyU3RhdGljLmNhbGxiYWNrc1t0aGlzLl90ZW1wbGF0aXplcklkXSA9IGZuLmJpbmQodGhpcyk7XG50aGlzLl90ZW1wbGF0aXplclN0YXRpYy5kZWJvdW5jZXIgPSBQb2x5bWVyLkRlYm91bmNlKHRoaXMuX3RlbXBsYXRpemVyU3RhdGljLmRlYm91bmNlciwgdGhpcy5fZmx1c2hUZW1wbGF0ZXMuYmluZCh0aGlzLCB0cnVlKSk7XG59LFxuX2ZsdXNoVGVtcGxhdGVzOiBmdW5jdGlvbiAoZGVib3VuY2VyRXhwaXJlZCkge1xudmFyIGRiID0gdGhpcy5fdGVtcGxhdGl6ZXJTdGF0aWMuZGVib3VuY2VyO1xud2hpbGUgKGRlYm91bmNlckV4cGlyZWQgfHwgZGIgJiYgZGIuZmluaXNoKSB7XG5kYi5zdG9wKCk7XG52YXIgY2JzID0gdGhpcy5fdGVtcGxhdGl6ZXJTdGF0aWMuY2FsbGJhY2tzO1xudGhpcy5fdGVtcGxhdGl6ZXJTdGF0aWMuY2FsbGJhY2tzID0ge307XG5mb3IgKHZhciBpZCBpbiBjYnMpIHtcbmNic1tpZF0oKTtcbn1cbmRlYm91bmNlckV4cGlyZWQgPSBmYWxzZTtcbn1cbn0sXG5fY3VzdG9tUHJlcEVmZmVjdHM6IGZ1bmN0aW9uIChhcmNoZXR5cGUpIHtcbnZhciBwYXJlbnRQcm9wcyA9IGFyY2hldHlwZS5fcGFyZW50UHJvcHM7XG5mb3IgKHZhciBwcm9wIGluIHBhcmVudFByb3BzKSB7XG5hcmNoZXR5cGUuX2FkZFByb3BlcnR5RWZmZWN0KHByb3AsICdmdW5jdGlvbicsIHRoaXMuX2NyZWF0ZUhvc3RQcm9wRWZmZWN0b3IocHJvcCkpO1xufVxuZm9yICh2YXIgcHJvcCBpbiB0aGlzLl9pbnN0YW5jZVByb3BzKSB7XG5hcmNoZXR5cGUuX2FkZFByb3BlcnR5RWZmZWN0KHByb3AsICdmdW5jdGlvbicsIHRoaXMuX2NyZWF0ZUluc3RhbmNlUHJvcEVmZmVjdG9yKHByb3ApKTtcbn1cbn0sXG5fY3VzdG9tUHJlcEFubm90YXRpb25zOiBmdW5jdGlvbiAoYXJjaGV0eXBlLCB0ZW1wbGF0ZSkge1xuYXJjaGV0eXBlLl90ZW1wbGF0ZSA9IHRlbXBsYXRlO1xudmFyIGMgPSB0ZW1wbGF0ZS5fY29udGVudDtcbmlmICghYy5fbm90ZXMpIHtcbnZhciByb290RGF0YUhvc3QgPSBhcmNoZXR5cGUuX3Jvb3REYXRhSG9zdDtcbmlmIChyb290RGF0YUhvc3QpIHtcblBvbHltZXIuQW5ub3RhdGlvbnMucHJlcEVsZW1lbnQgPSByb290RGF0YUhvc3QuX3ByZXBFbGVtZW50LmJpbmQocm9vdERhdGFIb3N0KTtcbn1cbmMuX25vdGVzID0gUG9seW1lci5Bbm5vdGF0aW9ucy5wYXJzZUFubm90YXRpb25zKHRlbXBsYXRlKTtcblBvbHltZXIuQW5ub3RhdGlvbnMucHJlcEVsZW1lbnQgPSBudWxsO1xudGhpcy5fcHJvY2Vzc0Fubm90YXRpb25zKGMuX25vdGVzKTtcbn1cbmFyY2hldHlwZS5fbm90ZXMgPSBjLl9ub3RlcztcbmFyY2hldHlwZS5fcGFyZW50UHJvcHMgPSBjLl9wYXJlbnRQcm9wcztcbn0sXG5fcHJlcFBhcmVudFByb3BlcnRpZXM6IGZ1bmN0aW9uIChhcmNoZXR5cGUsIHRlbXBsYXRlKSB7XG52YXIgcGFyZW50UHJvcHMgPSB0aGlzLl9wYXJlbnRQcm9wcyA9IGFyY2hldHlwZS5fcGFyZW50UHJvcHM7XG5pZiAodGhpcy5fZm9yd2FyZFBhcmVudFByb3AgJiYgcGFyZW50UHJvcHMpIHtcbnZhciBwcm90byA9IGFyY2hldHlwZS5fcGFyZW50UHJvcFByb3RvO1xudmFyIHByb3A7XG5pZiAoIXByb3RvKSB7XG5mb3IgKHByb3AgaW4gdGhpcy5faW5zdGFuY2VQcm9wcykge1xuZGVsZXRlIHBhcmVudFByb3BzW3Byb3BdO1xufVxucHJvdG8gPSBhcmNoZXR5cGUuX3BhcmVudFByb3BQcm90byA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5pZiAodGVtcGxhdGUgIT0gdGhpcykge1xuUG9seW1lci5CaW5kLnByZXBhcmVNb2RlbChwcm90byk7XG59XG5mb3IgKHByb3AgaW4gcGFyZW50UHJvcHMpIHtcbnZhciBwYXJlbnRQcm9wID0gJ19wYXJlbnRfJyArIHByb3A7XG52YXIgZWZmZWN0cyA9IFtcbntcbmtpbmQ6ICdmdW5jdGlvbicsXG5lZmZlY3Q6IHRoaXMuX2NyZWF0ZUZvcndhcmRQcm9wRWZmZWN0b3IocHJvcClcbn0sXG57IGtpbmQ6ICdub3RpZnknIH1cbl07XG5Qb2x5bWVyLkJpbmQuX2NyZWF0ZUFjY2Vzc29ycyhwcm90bywgcGFyZW50UHJvcCwgZWZmZWN0cyk7XG59XG59XG5pZiAodGVtcGxhdGUgIT0gdGhpcykge1xuUG9seW1lci5CaW5kLnByZXBhcmVJbnN0YW5jZSh0ZW1wbGF0ZSk7XG50ZW1wbGF0ZS5fZm9yd2FyZFBhcmVudFByb3AgPSB0aGlzLl9mb3J3YXJkUGFyZW50UHJvcC5iaW5kKHRoaXMpO1xufVxudGhpcy5fZXh0ZW5kVGVtcGxhdGUodGVtcGxhdGUsIHByb3RvKTtcbn1cbn0sXG5fY3JlYXRlRm9yd2FyZFByb3BFZmZlY3RvcjogZnVuY3Rpb24gKHByb3ApIHtcbnJldHVybiBmdW5jdGlvbiAoc291cmNlLCB2YWx1ZSkge1xudGhpcy5fZm9yd2FyZFBhcmVudFByb3AocHJvcCwgdmFsdWUpO1xufTtcbn0sXG5fY3JlYXRlSG9zdFByb3BFZmZlY3RvcjogZnVuY3Rpb24gKHByb3ApIHtcbnJldHVybiBmdW5jdGlvbiAoc291cmNlLCB2YWx1ZSkge1xudGhpcy5kYXRhSG9zdFsnX3BhcmVudF8nICsgcHJvcF0gPSB2YWx1ZTtcbn07XG59LFxuX2NyZWF0ZUluc3RhbmNlUHJvcEVmZmVjdG9yOiBmdW5jdGlvbiAocHJvcCkge1xucmV0dXJuIGZ1bmN0aW9uIChzb3VyY2UsIHZhbHVlLCBvbGQsIGZyb21BYm92ZSkge1xuaWYgKCFmcm9tQWJvdmUpIHtcbnRoaXMuZGF0YUhvc3QuX2ZvcndhcmRJbnN0YW5jZVByb3AodGhpcywgcHJvcCwgdmFsdWUpO1xufVxufTtcbn0sXG5fZXh0ZW5kVGVtcGxhdGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgcHJvdG8pIHtcbk9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHByb3RvKS5mb3JFYWNoKGZ1bmN0aW9uIChuKSB7XG52YXIgdmFsID0gdGVtcGxhdGVbbl07XG52YXIgcGQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHByb3RvLCBuKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0ZW1wbGF0ZSwgbiwgcGQpO1xuaWYgKHZhbCAhPT0gdW5kZWZpbmVkKSB7XG50ZW1wbGF0ZS5fcHJvcGVydHlTZXR0ZXIobiwgdmFsKTtcbn1cbn0pO1xufSxcbl9zaG93SGlkZUNoaWxkcmVuOiBmdW5jdGlvbiAoaGlkZGVuKSB7XG59LFxuX2ZvcndhcmRJbnN0YW5jZVBhdGg6IGZ1bmN0aW9uIChpbnN0LCBwYXRoLCB2YWx1ZSkge1xufSxcbl9mb3J3YXJkSW5zdGFuY2VQcm9wOiBmdW5jdGlvbiAoaW5zdCwgcHJvcCwgdmFsdWUpIHtcbn0sXG5fbm90aWZ5UGF0aEltcGw6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSkge1xudmFyIGRhdGFIb3N0ID0gdGhpcy5kYXRhSG9zdDtcbnZhciBkb3QgPSBwYXRoLmluZGV4T2YoJy4nKTtcbnZhciByb290ID0gZG90IDwgMCA/IHBhdGggOiBwYXRoLnNsaWNlKDAsIGRvdCk7XG5kYXRhSG9zdC5fZm9yd2FyZEluc3RhbmNlUGF0aC5jYWxsKGRhdGFIb3N0LCB0aGlzLCBwYXRoLCB2YWx1ZSk7XG5pZiAocm9vdCBpbiBkYXRhSG9zdC5fcGFyZW50UHJvcHMpIHtcbmRhdGFIb3N0Lm5vdGlmeVBhdGgoJ19wYXJlbnRfJyArIHBhdGgsIHZhbHVlKTtcbn1cbn0sXG5fcGF0aEVmZmVjdG9yOiBmdW5jdGlvbiAocGF0aCwgdmFsdWUsIGZyb21BYm92ZSkge1xuaWYgKHRoaXMuX2ZvcndhcmRQYXJlbnRQYXRoKSB7XG5pZiAocGF0aC5pbmRleE9mKCdfcGFyZW50XycpID09PSAwKSB7XG50aGlzLl9mb3J3YXJkUGFyZW50UGF0aChwYXRoLnN1YnN0cmluZyg4KSwgdmFsdWUpO1xufVxufVxuUG9seW1lci5CYXNlLl9wYXRoRWZmZWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn0sXG5fY29uc3RydWN0b3JJbXBsOiBmdW5jdGlvbiAobW9kZWwsIGhvc3QpIHtcbnRoaXMuX3Jvb3REYXRhSG9zdCA9IGhvc3QuX2dldFJvb3REYXRhSG9zdCgpO1xudGhpcy5fc2V0dXBDb25maWd1cmUobW9kZWwpO1xudGhpcy5fcHVzaEhvc3QoaG9zdCk7XG50aGlzLnJvb3QgPSB0aGlzLmluc3RhbmNlVGVtcGxhdGUodGhpcy5fdGVtcGxhdGUpO1xudGhpcy5yb290Ll9fbm9Db250ZW50ID0gIXRoaXMuX25vdGVzLl9oYXNDb250ZW50O1xudGhpcy5yb290Ll9fc3R5bGVTY29wZWQgPSB0cnVlO1xudGhpcy5fcG9wSG9zdCgpO1xudGhpcy5fbWFyc2hhbEFubm90YXRlZE5vZGVzKCk7XG50aGlzLl9tYXJzaGFsSW5zdGFuY2VFZmZlY3RzKCk7XG50aGlzLl9tYXJzaGFsQW5ub3RhdGVkTGlzdGVuZXJzKCk7XG52YXIgY2hpbGRyZW4gPSBbXTtcbmZvciAodmFyIG4gPSB0aGlzLnJvb3QuZmlyc3RDaGlsZDsgbjsgbiA9IG4ubmV4dFNpYmxpbmcpIHtcbmNoaWxkcmVuLnB1c2gobik7XG5uLl90ZW1wbGF0ZUluc3RhbmNlID0gdGhpcztcbn1cbnRoaXMuX2NoaWxkcmVuID0gY2hpbGRyZW47XG5pZiAoaG9zdC5fX2hpZGVUZW1wbGF0ZUNoaWxkcmVuX18pIHtcbnRoaXMuX3Nob3dIaWRlQ2hpbGRyZW4odHJ1ZSk7XG59XG50aGlzLl90cnlSZWFkeSgpO1xufSxcbl9saXN0ZW5JbXBsOiBmdW5jdGlvbiAobm9kZSwgZXZlbnROYW1lLCBtZXRob2ROYW1lKSB7XG52YXIgbW9kZWwgPSB0aGlzO1xudmFyIGhvc3QgPSB0aGlzLl9yb290RGF0YUhvc3Q7XG52YXIgaGFuZGxlciA9IGhvc3QuX2NyZWF0ZUV2ZW50SGFuZGxlcihub2RlLCBldmVudE5hbWUsIG1ldGhvZE5hbWUpO1xudmFyIGRlY29yYXRlZCA9IGZ1bmN0aW9uIChlKSB7XG5lLm1vZGVsID0gbW9kZWw7XG5oYW5kbGVyKGUpO1xufTtcbmhvc3QuX2xpc3Rlbihub2RlLCBldmVudE5hbWUsIGRlY29yYXRlZCk7XG59LFxuX3Njb3BlRWxlbWVudENsYXNzSW1wbDogZnVuY3Rpb24gKG5vZGUsIHZhbHVlKSB7XG52YXIgaG9zdCA9IHRoaXMuX3Jvb3REYXRhSG9zdDtcbmlmIChob3N0KSB7XG5yZXR1cm4gaG9zdC5fc2NvcGVFbGVtZW50Q2xhc3Mobm9kZSwgdmFsdWUpO1xufVxufSxcbnN0YW1wOiBmdW5jdGlvbiAobW9kZWwpIHtcbm1vZGVsID0gbW9kZWwgfHwge307XG5pZiAodGhpcy5fcGFyZW50UHJvcHMpIHtcbmZvciAodmFyIHByb3AgaW4gdGhpcy5fcGFyZW50UHJvcHMpIHtcbm1vZGVsW3Byb3BdID0gdGhpc1snX3BhcmVudF8nICsgcHJvcF07XG59XG59XG5yZXR1cm4gbmV3IHRoaXMuY3Rvcihtb2RlbCwgdGhpcyk7XG59LFxubW9kZWxGb3JFbGVtZW50OiBmdW5jdGlvbiAoZWwpIHtcbnZhciBtb2RlbDtcbndoaWxlIChlbCkge1xuaWYgKG1vZGVsID0gZWwuX3RlbXBsYXRlSW5zdGFuY2UpIHtcbmlmIChtb2RlbC5kYXRhSG9zdCAhPSB0aGlzKSB7XG5lbCA9IG1vZGVsLmRhdGFIb3N0O1xufSBlbHNlIHtcbnJldHVybiBtb2RlbDtcbn1cbn0gZWxzZSB7XG5lbCA9IGVsLnBhcmVudE5vZGU7XG59XG59XG59XG59O1xuUG9seW1lcih7XG5pczogJ2RvbS10ZW1wbGF0ZScsXG5leHRlbmRzOiAndGVtcGxhdGUnLFxuYmVoYXZpb3JzOiBbUG9seW1lci5UZW1wbGF0aXplcl0sXG5yZWFkeTogZnVuY3Rpb24gKCkge1xudGhpcy50ZW1wbGF0aXplKHRoaXMpO1xufVxufSk7XG5Qb2x5bWVyLl9jb2xsZWN0aW9ucyA9IG5ldyBXZWFrTWFwKCk7XG5Qb2x5bWVyLkNvbGxlY3Rpb24gPSBmdW5jdGlvbiAodXNlckFycmF5KSB7XG5Qb2x5bWVyLl9jb2xsZWN0aW9ucy5zZXQodXNlckFycmF5LCB0aGlzKTtcbnRoaXMudXNlckFycmF5ID0gdXNlckFycmF5O1xudGhpcy5zdG9yZSA9IHVzZXJBcnJheS5zbGljZSgpO1xudGhpcy5pbml0TWFwKCk7XG59O1xuUG9seW1lci5Db2xsZWN0aW9uLnByb3RvdHlwZSA9IHtcbmNvbnN0cnVjdG9yOiBQb2x5bWVyLkNvbGxlY3Rpb24sXG5pbml0TWFwOiBmdW5jdGlvbiAoKSB7XG52YXIgb21hcCA9IHRoaXMub21hcCA9IG5ldyBXZWFrTWFwKCk7XG52YXIgcG1hcCA9IHRoaXMucG1hcCA9IHt9O1xudmFyIHMgPSB0aGlzLnN0b3JlO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSsrKSB7XG52YXIgaXRlbSA9IHNbaV07XG5pZiAoaXRlbSAmJiB0eXBlb2YgaXRlbSA9PSAnb2JqZWN0Jykge1xub21hcC5zZXQoaXRlbSwgaSk7XG59IGVsc2Uge1xucG1hcFtpdGVtXSA9IGk7XG59XG59XG59LFxuYWRkOiBmdW5jdGlvbiAoaXRlbSkge1xudmFyIGtleSA9IHRoaXMuc3RvcmUucHVzaChpdGVtKSAtIDE7XG5pZiAoaXRlbSAmJiB0eXBlb2YgaXRlbSA9PSAnb2JqZWN0Jykge1xudGhpcy5vbWFwLnNldChpdGVtLCBrZXkpO1xufSBlbHNlIHtcbnRoaXMucG1hcFtpdGVtXSA9IGtleTtcbn1cbnJldHVybiBrZXk7XG59LFxucmVtb3ZlS2V5OiBmdW5jdGlvbiAoa2V5KSB7XG50aGlzLl9yZW1vdmVGcm9tTWFwKHRoaXMuc3RvcmVba2V5XSk7XG5kZWxldGUgdGhpcy5zdG9yZVtrZXldO1xufSxcbl9yZW1vdmVGcm9tTWFwOiBmdW5jdGlvbiAoaXRlbSkge1xuaWYgKGl0ZW0gJiYgdHlwZW9mIGl0ZW0gPT0gJ29iamVjdCcpIHtcbnRoaXMub21hcC5kZWxldGUoaXRlbSk7XG59IGVsc2Uge1xuZGVsZXRlIHRoaXMucG1hcFtpdGVtXTtcbn1cbn0sXG5yZW1vdmU6IGZ1bmN0aW9uIChpdGVtKSB7XG52YXIga2V5ID0gdGhpcy5nZXRLZXkoaXRlbSk7XG50aGlzLnJlbW92ZUtleShrZXkpO1xucmV0dXJuIGtleTtcbn0sXG5nZXRLZXk6IGZ1bmN0aW9uIChpdGVtKSB7XG5pZiAoaXRlbSAmJiB0eXBlb2YgaXRlbSA9PSAnb2JqZWN0Jykge1xucmV0dXJuIHRoaXMub21hcC5nZXQoaXRlbSk7XG59IGVsc2Uge1xucmV0dXJuIHRoaXMucG1hcFtpdGVtXTtcbn1cbn0sXG5nZXRLZXlzOiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gT2JqZWN0LmtleXModGhpcy5zdG9yZSk7XG59LFxuc2V0SXRlbTogZnVuY3Rpb24gKGtleSwgaXRlbSkge1xudmFyIG9sZCA9IHRoaXMuc3RvcmVba2V5XTtcbmlmIChvbGQpIHtcbnRoaXMuX3JlbW92ZUZyb21NYXAob2xkKTtcbn1cbmlmIChpdGVtICYmIHR5cGVvZiBpdGVtID09ICdvYmplY3QnKSB7XG50aGlzLm9tYXAuc2V0KGl0ZW0sIGtleSk7XG59IGVsc2Uge1xudGhpcy5wbWFwW2l0ZW1dID0ga2V5O1xufVxudGhpcy5zdG9yZVtrZXldID0gaXRlbTtcbn0sXG5nZXRJdGVtOiBmdW5jdGlvbiAoa2V5KSB7XG5yZXR1cm4gdGhpcy5zdG9yZVtrZXldO1xufSxcbmdldEl0ZW1zOiBmdW5jdGlvbiAoKSB7XG52YXIgaXRlbXMgPSBbXSwgc3RvcmUgPSB0aGlzLnN0b3JlO1xuZm9yICh2YXIga2V5IGluIHN0b3JlKSB7XG5pdGVtcy5wdXNoKHN0b3JlW2tleV0pO1xufVxucmV0dXJuIGl0ZW1zO1xufSxcbl9hcHBseVNwbGljZXM6IGZ1bmN0aW9uIChzcGxpY2VzKSB7XG52YXIga2V5U3BsaWNlcyA9IFtdO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBzcGxpY2VzLmxlbmd0aDsgaSsrKSB7XG52YXIgaiwgbywga2V5LCBzID0gc3BsaWNlc1tpXTtcbnZhciByZW1vdmVkID0gW107XG5mb3IgKGogPSAwOyBqIDwgcy5yZW1vdmVkLmxlbmd0aDsgaisrKSB7XG5vID0gcy5yZW1vdmVkW2pdO1xua2V5ID0gdGhpcy5yZW1vdmUobyk7XG5yZW1vdmVkLnB1c2goa2V5KTtcbn1cbnZhciBhZGRlZCA9IFtdO1xuZm9yIChqID0gMDsgaiA8IHMuYWRkZWRDb3VudDsgaisrKSB7XG5vID0gdGhpcy51c2VyQXJyYXlbcy5pbmRleCArIGpdO1xua2V5ID0gdGhpcy5hZGQobyk7XG5hZGRlZC5wdXNoKGtleSk7XG59XG5rZXlTcGxpY2VzLnB1c2goe1xuaW5kZXg6IHMuaW5kZXgsXG5yZW1vdmVkOiByZW1vdmVkLFxucmVtb3ZlZEl0ZW1zOiBzLnJlbW92ZWQsXG5hZGRlZDogYWRkZWRcbn0pO1xufVxucmV0dXJuIGtleVNwbGljZXM7XG59XG59O1xuUG9seW1lci5Db2xsZWN0aW9uLmdldCA9IGZ1bmN0aW9uICh1c2VyQXJyYXkpIHtcbnJldHVybiBQb2x5bWVyLl9jb2xsZWN0aW9ucy5nZXQodXNlckFycmF5KSB8fCBuZXcgUG9seW1lci5Db2xsZWN0aW9uKHVzZXJBcnJheSk7XG59O1xuUG9seW1lci5Db2xsZWN0aW9uLmFwcGx5U3BsaWNlcyA9IGZ1bmN0aW9uICh1c2VyQXJyYXksIHNwbGljZXMpIHtcbnZhciBjb2xsID0gUG9seW1lci5fY29sbGVjdGlvbnMuZ2V0KHVzZXJBcnJheSk7XG5yZXR1cm4gY29sbCA/IGNvbGwuX2FwcGx5U3BsaWNlcyhzcGxpY2VzKSA6IG51bGw7XG59O1xuUG9seW1lcih7XG5pczogJ2RvbS1yZXBlYXQnLFxuZXh0ZW5kczogJ3RlbXBsYXRlJyxcbnByb3BlcnRpZXM6IHtcbml0ZW1zOiB7IHR5cGU6IEFycmF5IH0sXG5hczoge1xudHlwZTogU3RyaW5nLFxudmFsdWU6ICdpdGVtJ1xufSxcbmluZGV4QXM6IHtcbnR5cGU6IFN0cmluZyxcbnZhbHVlOiAnaW5kZXgnXG59LFxuc29ydDoge1xudHlwZTogRnVuY3Rpb24sXG5vYnNlcnZlcjogJ19zb3J0Q2hhbmdlZCdcbn0sXG5maWx0ZXI6IHtcbnR5cGU6IEZ1bmN0aW9uLFxub2JzZXJ2ZXI6ICdfZmlsdGVyQ2hhbmdlZCdcbn0sXG5vYnNlcnZlOiB7XG50eXBlOiBTdHJpbmcsXG5vYnNlcnZlcjogJ19vYnNlcnZlQ2hhbmdlZCdcbn0sXG5kZWxheTogTnVtYmVyXG59LFxuYmVoYXZpb3JzOiBbUG9seW1lci5UZW1wbGF0aXplcl0sXG5vYnNlcnZlcnM6IFsnX2l0ZW1zQ2hhbmdlZChpdGVtcy4qKSddLFxuZGV0YWNoZWQ6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLnJvd3MpIHtcbmZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5yb3dzLmxlbmd0aDsgaSsrKSB7XG50aGlzLl9kZXRhY2hSb3coaSk7XG59XG59XG59LFxuYXR0YWNoZWQ6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLnJvd3MpIHtcbnZhciBwYXJlbnROb2RlID0gUG9seW1lci5kb20odGhpcykucGFyZW50Tm9kZTtcbmZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5yb3dzLmxlbmd0aDsgaSsrKSB7XG5Qb2x5bWVyLmRvbShwYXJlbnROb2RlKS5pbnNlcnRCZWZvcmUodGhpcy5yb3dzW2ldLnJvb3QsIHRoaXMpO1xufVxufVxufSxcbnJlYWR5OiBmdW5jdGlvbiAoKSB7XG50aGlzLl9pbnN0YW5jZVByb3BzID0geyBfX2tleV9fOiB0cnVlIH07XG50aGlzLl9pbnN0YW5jZVByb3BzW3RoaXMuYXNdID0gdHJ1ZTtcbnRoaXMuX2luc3RhbmNlUHJvcHNbdGhpcy5pbmRleEFzXSA9IHRydWU7XG5pZiAoIXRoaXMuY3Rvcikge1xudGhpcy50ZW1wbGF0aXplKHRoaXMpO1xufVxufSxcbl9zb3J0Q2hhbmdlZDogZnVuY3Rpb24gKCkge1xudmFyIGRhdGFIb3N0ID0gdGhpcy5fZ2V0Um9vdERhdGFIb3N0KCk7XG52YXIgc29ydCA9IHRoaXMuc29ydDtcbnRoaXMuX3NvcnRGbiA9IHNvcnQgJiYgKHR5cGVvZiBzb3J0ID09ICdmdW5jdGlvbicgPyBzb3J0IDogZnVuY3Rpb24gKCkge1xucmV0dXJuIGRhdGFIb3N0W3NvcnRdLmFwcGx5KGRhdGFIb3N0LCBhcmd1bWVudHMpO1xufSk7XG50aGlzLl9mdWxsUmVmcmVzaCA9IHRydWU7XG5pZiAodGhpcy5pdGVtcykge1xudGhpcy5fZGVib3VuY2VUZW1wbGF0ZSh0aGlzLl9yZW5kZXIpO1xufVxufSxcbl9maWx0ZXJDaGFuZ2VkOiBmdW5jdGlvbiAoKSB7XG52YXIgZGF0YUhvc3QgPSB0aGlzLl9nZXRSb290RGF0YUhvc3QoKTtcbnZhciBmaWx0ZXIgPSB0aGlzLmZpbHRlcjtcbnRoaXMuX2ZpbHRlckZuID0gZmlsdGVyICYmICh0eXBlb2YgZmlsdGVyID09ICdmdW5jdGlvbicgPyBmaWx0ZXIgOiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gZGF0YUhvc3RbZmlsdGVyXS5hcHBseShkYXRhSG9zdCwgYXJndW1lbnRzKTtcbn0pO1xudGhpcy5fZnVsbFJlZnJlc2ggPSB0cnVlO1xuaWYgKHRoaXMuaXRlbXMpIHtcbnRoaXMuX2RlYm91bmNlVGVtcGxhdGUodGhpcy5fcmVuZGVyKTtcbn1cbn0sXG5fb2JzZXJ2ZUNoYW5nZWQ6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX29ic2VydmVQYXRocyA9IHRoaXMub2JzZXJ2ZSAmJiB0aGlzLm9ic2VydmUucmVwbGFjZSgnLionLCAnLicpLnNwbGl0KCcgJyk7XG59LFxuX2l0ZW1zQ2hhbmdlZDogZnVuY3Rpb24gKGNoYW5nZSkge1xuaWYgKGNoYW5nZS5wYXRoID09ICdpdGVtcycpIHtcbmlmIChBcnJheS5pc0FycmF5KHRoaXMuaXRlbXMpKSB7XG50aGlzLmNvbGxlY3Rpb24gPSBQb2x5bWVyLkNvbGxlY3Rpb24uZ2V0KHRoaXMuaXRlbXMpO1xufSBlbHNlIGlmICghdGhpcy5pdGVtcykge1xudGhpcy5jb2xsZWN0aW9uID0gbnVsbDtcbn0gZWxzZSB7XG50aGlzLl9lcnJvcih0aGlzLl9sb2dmKCdkb20tcmVwZWF0JywgJ2V4cGVjdGVkIGFycmF5IGZvciBgaXRlbXNgLCcgKyAnIGZvdW5kJywgdGhpcy5pdGVtcykpO1xufVxudGhpcy5fc3BsaWNlcyA9IFtdO1xudGhpcy5fZnVsbFJlZnJlc2ggPSB0cnVlO1xudGhpcy5fZGVib3VuY2VUZW1wbGF0ZSh0aGlzLl9yZW5kZXIpO1xufSBlbHNlIGlmIChjaGFuZ2UucGF0aCA9PSAnaXRlbXMuc3BsaWNlcycpIHtcbnRoaXMuX3NwbGljZXMgPSB0aGlzLl9zcGxpY2VzLmNvbmNhdChjaGFuZ2UudmFsdWUua2V5U3BsaWNlcyk7XG50aGlzLl9kZWJvdW5jZVRlbXBsYXRlKHRoaXMuX3JlbmRlcik7XG59IGVsc2Uge1xudmFyIHN1YnBhdGggPSBjaGFuZ2UucGF0aC5zbGljZSg2KTtcbnRoaXMuX2ZvcndhcmRJdGVtUGF0aChzdWJwYXRoLCBjaGFuZ2UudmFsdWUpO1xudGhpcy5fY2hlY2tPYnNlcnZlZFBhdGhzKHN1YnBhdGgpO1xufVxufSxcbl9jaGVja09ic2VydmVkUGF0aHM6IGZ1bmN0aW9uIChwYXRoKSB7XG5pZiAodGhpcy5fb2JzZXJ2ZVBhdGhzKSB7XG5wYXRoID0gcGF0aC5zdWJzdHJpbmcocGF0aC5pbmRleE9mKCcuJykgKyAxKTtcbnZhciBwYXRocyA9IHRoaXMuX29ic2VydmVQYXRocztcbmZvciAodmFyIGkgPSAwOyBpIDwgcGF0aHMubGVuZ3RoOyBpKyspIHtcbmlmIChwYXRoLmluZGV4T2YocGF0aHNbaV0pID09PSAwKSB7XG50aGlzLl9mdWxsUmVmcmVzaCA9IHRydWU7XG5pZiAodGhpcy5kZWxheSkge1xudGhpcy5kZWJvdW5jZSgncmVuZGVyJywgdGhpcy5fcmVuZGVyLCB0aGlzLmRlbGF5KTtcbn0gZWxzZSB7XG50aGlzLl9kZWJvdW5jZVRlbXBsYXRlKHRoaXMuX3JlbmRlcik7XG59XG5yZXR1cm47XG59XG59XG59XG59LFxucmVuZGVyOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9mdWxsUmVmcmVzaCA9IHRydWU7XG50aGlzLl9kZWJvdW5jZVRlbXBsYXRlKHRoaXMuX3JlbmRlcik7XG50aGlzLl9mbHVzaFRlbXBsYXRlcygpO1xufSxcbl9yZW5kZXI6IGZ1bmN0aW9uICgpIHtcbnZhciBjID0gdGhpcy5jb2xsZWN0aW9uO1xuaWYgKCF0aGlzLl9mdWxsUmVmcmVzaCkge1xuaWYgKHRoaXMuX3NvcnRGbikge1xudGhpcy5fYXBwbHlTcGxpY2VzVmlld1NvcnQodGhpcy5fc3BsaWNlcyk7XG59IGVsc2Uge1xuaWYgKHRoaXMuX2ZpbHRlckZuKSB7XG50aGlzLl9mdWxsUmVmcmVzaCA9IHRydWU7XG59IGVsc2Uge1xudGhpcy5fYXBwbHlTcGxpY2VzQXJyYXlTb3J0KHRoaXMuX3NwbGljZXMpO1xufVxufVxufVxuaWYgKHRoaXMuX2Z1bGxSZWZyZXNoKSB7XG50aGlzLl9zb3J0QW5kRmlsdGVyKCk7XG50aGlzLl9mdWxsUmVmcmVzaCA9IGZhbHNlO1xufVxudGhpcy5fc3BsaWNlcyA9IFtdO1xudmFyIHJvd0ZvcktleSA9IHRoaXMuX3Jvd0ZvcktleSA9IHt9O1xudmFyIGtleXMgPSB0aGlzLl9vcmRlcmVkS2V5cztcbnRoaXMucm93cyA9IHRoaXMucm93cyB8fCBbXTtcbmZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xudmFyIGtleSA9IGtleXNbaV07XG52YXIgaXRlbSA9IGMuZ2V0SXRlbShrZXkpO1xudmFyIHJvdyA9IHRoaXMucm93c1tpXTtcbnJvd0ZvcktleVtrZXldID0gaTtcbmlmICghcm93KSB7XG50aGlzLnJvd3MucHVzaChyb3cgPSB0aGlzLl9pbnNlcnRSb3coaSwgbnVsbCwgaXRlbSkpO1xufVxucm93Ll9fc2V0UHJvcGVydHkodGhpcy5hcywgaXRlbSwgdHJ1ZSk7XG5yb3cuX19zZXRQcm9wZXJ0eSgnX19rZXlfXycsIGtleSwgdHJ1ZSk7XG5yb3cuX19zZXRQcm9wZXJ0eSh0aGlzLmluZGV4QXMsIGksIHRydWUpO1xufVxuZm9yICg7IGkgPCB0aGlzLnJvd3MubGVuZ3RoOyBpKyspIHtcbnRoaXMuX2RldGFjaFJvdyhpKTtcbn1cbnRoaXMucm93cy5zcGxpY2Uoa2V5cy5sZW5ndGgsIHRoaXMucm93cy5sZW5ndGggLSBrZXlzLmxlbmd0aCk7XG50aGlzLmZpcmUoJ2RvbS1jaGFuZ2UnKTtcbn0sXG5fc29ydEFuZEZpbHRlcjogZnVuY3Rpb24gKCkge1xudmFyIGMgPSB0aGlzLmNvbGxlY3Rpb247XG5pZiAoIXRoaXMuX3NvcnRGbikge1xudGhpcy5fb3JkZXJlZEtleXMgPSBbXTtcbnZhciBpdGVtcyA9IHRoaXMuaXRlbXM7XG5pZiAoaXRlbXMpIHtcbmZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbnRoaXMuX29yZGVyZWRLZXlzLnB1c2goYy5nZXRLZXkoaXRlbXNbaV0pKTtcbn1cbn1cbn0gZWxzZSB7XG50aGlzLl9vcmRlcmVkS2V5cyA9IGMgPyBjLmdldEtleXMoKSA6IFtdO1xufVxuaWYgKHRoaXMuX2ZpbHRlckZuKSB7XG50aGlzLl9vcmRlcmVkS2V5cyA9IHRoaXMuX29yZGVyZWRLZXlzLmZpbHRlcihmdW5jdGlvbiAoYSkge1xucmV0dXJuIHRoaXMuX2ZpbHRlckZuKGMuZ2V0SXRlbShhKSk7XG59LCB0aGlzKTtcbn1cbmlmICh0aGlzLl9zb3J0Rm4pIHtcbnRoaXMuX29yZGVyZWRLZXlzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbnJldHVybiB0aGlzLl9zb3J0Rm4oYy5nZXRJdGVtKGEpLCBjLmdldEl0ZW0oYikpO1xufS5iaW5kKHRoaXMpKTtcbn1cbn0sXG5fa2V5U29ydDogZnVuY3Rpb24gKGEsIGIpIHtcbnJldHVybiB0aGlzLmNvbGxlY3Rpb24uZ2V0S2V5KGEpIC0gdGhpcy5jb2xsZWN0aW9uLmdldEtleShiKTtcbn0sXG5fYXBwbHlTcGxpY2VzVmlld1NvcnQ6IGZ1bmN0aW9uIChzcGxpY2VzKSB7XG52YXIgYyA9IHRoaXMuY29sbGVjdGlvbjtcbnZhciBrZXlzID0gdGhpcy5fb3JkZXJlZEtleXM7XG52YXIgcm93cyA9IHRoaXMucm93cztcbnZhciByZW1vdmVkUm93cyA9IFtdO1xudmFyIGFkZGVkS2V5cyA9IFtdO1xudmFyIHBvb2wgPSBbXTtcbnZhciBzb3J0Rm4gPSB0aGlzLl9zb3J0Rm4gfHwgdGhpcy5fa2V5U29ydC5iaW5kKHRoaXMpO1xuc3BsaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChzKSB7XG5mb3IgKHZhciBpID0gMDsgaSA8IHMucmVtb3ZlZC5sZW5ndGg7IGkrKykge1xudmFyIGlkeCA9IHRoaXMuX3Jvd0ZvcktleVtzLnJlbW92ZWRbaV1dO1xuaWYgKGlkeCAhPSBudWxsKSB7XG5yZW1vdmVkUm93cy5wdXNoKGlkeCk7XG59XG59XG5mb3IgKHZhciBpID0gMDsgaSA8IHMuYWRkZWQubGVuZ3RoOyBpKyspIHtcbmFkZGVkS2V5cy5wdXNoKHMuYWRkZWRbaV0pO1xufVxufSwgdGhpcyk7XG5pZiAocmVtb3ZlZFJvd3MubGVuZ3RoKSB7XG5yZW1vdmVkUm93cy5zb3J0KCk7XG5mb3IgKHZhciBpID0gcmVtb3ZlZFJvd3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbnZhciBpZHggPSByZW1vdmVkUm93c1tpXTtcbnBvb2wucHVzaCh0aGlzLl9kZXRhY2hSb3coaWR4KSk7XG5yb3dzLnNwbGljZShpZHgsIDEpO1xua2V5cy5zcGxpY2UoaWR4LCAxKTtcbn1cbn1cbmlmIChhZGRlZEtleXMubGVuZ3RoKSB7XG5pZiAodGhpcy5fZmlsdGVyRm4pIHtcbmFkZGVkS2V5cyA9IGFkZGVkS2V5cy5maWx0ZXIoZnVuY3Rpb24gKGEpIHtcbnJldHVybiB0aGlzLl9maWx0ZXJGbihjLmdldEl0ZW0oYSkpO1xufSwgdGhpcyk7XG59XG5hZGRlZEtleXMuc29ydChmdW5jdGlvbiAoYSwgYikge1xucmV0dXJuIHRoaXMuX3NvcnRGbihjLmdldEl0ZW0oYSksIGMuZ2V0SXRlbShiKSk7XG59LmJpbmQodGhpcykpO1xudmFyIHN0YXJ0ID0gMDtcbmZvciAodmFyIGkgPSAwOyBpIDwgYWRkZWRLZXlzLmxlbmd0aDsgaSsrKSB7XG5zdGFydCA9IHRoaXMuX2luc2VydFJvd0ludG9WaWV3U29ydChzdGFydCwgYWRkZWRLZXlzW2ldLCBwb29sKTtcbn1cbn1cbn0sXG5faW5zZXJ0Um93SW50b1ZpZXdTb3J0OiBmdW5jdGlvbiAoc3RhcnQsIGtleSwgcG9vbCkge1xudmFyIGMgPSB0aGlzLmNvbGxlY3Rpb247XG52YXIgaXRlbSA9IGMuZ2V0SXRlbShrZXkpO1xudmFyIGVuZCA9IHRoaXMucm93cy5sZW5ndGggLSAxO1xudmFyIGlkeCA9IC0xO1xudmFyIHNvcnRGbiA9IHRoaXMuX3NvcnRGbiB8fCB0aGlzLl9rZXlTb3J0LmJpbmQodGhpcyk7XG53aGlsZSAoc3RhcnQgPD0gZW5kKSB7XG52YXIgbWlkID0gc3RhcnQgKyBlbmQgPj4gMTtcbnZhciBtaWRLZXkgPSB0aGlzLl9vcmRlcmVkS2V5c1ttaWRdO1xudmFyIGNtcCA9IHNvcnRGbihjLmdldEl0ZW0obWlkS2V5KSwgaXRlbSk7XG5pZiAoY21wIDwgMCkge1xuc3RhcnQgPSBtaWQgKyAxO1xufSBlbHNlIGlmIChjbXAgPiAwKSB7XG5lbmQgPSBtaWQgLSAxO1xufSBlbHNlIHtcbmlkeCA9IG1pZDtcbmJyZWFrO1xufVxufVxuaWYgKGlkeCA8IDApIHtcbmlkeCA9IGVuZCArIDE7XG59XG50aGlzLl9vcmRlcmVkS2V5cy5zcGxpY2UoaWR4LCAwLCBrZXkpO1xudGhpcy5yb3dzLnNwbGljZShpZHgsIDAsIHRoaXMuX2luc2VydFJvdyhpZHgsIHBvb2wsIGMuZ2V0SXRlbShrZXkpKSk7XG5yZXR1cm4gaWR4O1xufSxcbl9hcHBseVNwbGljZXNBcnJheVNvcnQ6IGZ1bmN0aW9uIChzcGxpY2VzKSB7XG52YXIga2V5cyA9IHRoaXMuX29yZGVyZWRLZXlzO1xudmFyIHBvb2wgPSBbXTtcbnNwbGljZXMuZm9yRWFjaChmdW5jdGlvbiAocykge1xuZm9yICh2YXIgaSA9IDA7IGkgPCBzLnJlbW92ZWQubGVuZ3RoOyBpKyspIHtcbnBvb2wucHVzaCh0aGlzLl9kZXRhY2hSb3cocy5pbmRleCArIGkpKTtcbn1cbnRoaXMucm93cy5zcGxpY2Uocy5pbmRleCwgcy5yZW1vdmVkLmxlbmd0aCk7XG59LCB0aGlzKTtcbnZhciBjID0gdGhpcy5jb2xsZWN0aW9uO1xuc3BsaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChzKSB7XG52YXIgYXJncyA9IFtcbnMuaW5kZXgsXG5zLnJlbW92ZWQubGVuZ3RoXG5dLmNvbmNhdChzLmFkZGVkKTtcbmtleXMuc3BsaWNlLmFwcGx5KGtleXMsIGFyZ3MpO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBzLmFkZGVkLmxlbmd0aDsgaSsrKSB7XG52YXIgaXRlbSA9IGMuZ2V0SXRlbShzLmFkZGVkW2ldKTtcbnZhciByb3cgPSB0aGlzLl9pbnNlcnRSb3cocy5pbmRleCArIGksIHBvb2wsIGl0ZW0pO1xudGhpcy5yb3dzLnNwbGljZShzLmluZGV4ICsgaSwgMCwgcm93KTtcbn1cbn0sIHRoaXMpO1xufSxcbl9kZXRhY2hSb3c6IGZ1bmN0aW9uIChpZHgpIHtcbnZhciByb3cgPSB0aGlzLnJvd3NbaWR4XTtcbnZhciBwYXJlbnROb2RlID0gUG9seW1lci5kb20odGhpcykucGFyZW50Tm9kZTtcbmZvciAodmFyIGkgPSAwOyBpIDwgcm93Ll9jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xudmFyIGVsID0gcm93Ll9jaGlsZHJlbltpXTtcblBvbHltZXIuZG9tKHJvdy5yb290KS5hcHBlbmRDaGlsZChlbCk7XG59XG5yZXR1cm4gcm93O1xufSxcbl9pbnNlcnRSb3c6IGZ1bmN0aW9uIChpZHgsIHBvb2wsIGl0ZW0pIHtcbnZhciByb3cgPSBwb29sICYmIHBvb2wucG9wKCkgfHwgdGhpcy5fZ2VuZXJhdGVSb3coaWR4LCBpdGVtKTtcbnZhciBiZWZvcmVSb3cgPSB0aGlzLnJvd3NbaWR4XTtcbnZhciBiZWZvcmVOb2RlID0gYmVmb3JlUm93ID8gYmVmb3JlUm93Ll9jaGlsZHJlblswXSA6IHRoaXM7XG52YXIgcGFyZW50Tm9kZSA9IFBvbHltZXIuZG9tKHRoaXMpLnBhcmVudE5vZGU7XG5Qb2x5bWVyLmRvbShwYXJlbnROb2RlKS5pbnNlcnRCZWZvcmUocm93LnJvb3QsIGJlZm9yZU5vZGUpO1xucmV0dXJuIHJvdztcbn0sXG5fZ2VuZXJhdGVSb3c6IGZ1bmN0aW9uIChpZHgsIGl0ZW0pIHtcbnZhciBtb2RlbCA9IHsgX19rZXlfXzogdGhpcy5jb2xsZWN0aW9uLmdldEtleShpdGVtKSB9O1xubW9kZWxbdGhpcy5hc10gPSBpdGVtO1xubW9kZWxbdGhpcy5pbmRleEFzXSA9IGlkeDtcbnZhciByb3cgPSB0aGlzLnN0YW1wKG1vZGVsKTtcbnJldHVybiByb3c7XG59LFxuX3Nob3dIaWRlQ2hpbGRyZW46IGZ1bmN0aW9uIChoaWRkZW4pIHtcbmlmICh0aGlzLnJvd3MpIHtcbmZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5yb3dzLmxlbmd0aDsgaSsrKSB7XG50aGlzLnJvd3NbaV0uX3Nob3dIaWRlQ2hpbGRyZW4oaGlkZGVuKTtcbn1cbn1cbn0sXG5fZm9yd2FyZEluc3RhbmNlUHJvcDogZnVuY3Rpb24gKHJvdywgcHJvcCwgdmFsdWUpIHtcbmlmIChwcm9wID09IHRoaXMuYXMpIHtcbnZhciBpZHg7XG5pZiAodGhpcy5fc29ydEZuIHx8IHRoaXMuX2ZpbHRlckZuKSB7XG5pZHggPSB0aGlzLml0ZW1zLmluZGV4T2YodGhpcy5jb2xsZWN0aW9uLmdldEl0ZW0ocm93Ll9fa2V5X18pKTtcbn0gZWxzZSB7XG5pZHggPSByb3dbdGhpcy5pbmRleEFzXTtcbn1cbnRoaXMuc2V0KCdpdGVtcy4nICsgaWR4LCB2YWx1ZSk7XG59XG59LFxuX2ZvcndhcmRJbnN0YW5jZVBhdGg6IGZ1bmN0aW9uIChyb3csIHBhdGgsIHZhbHVlKSB7XG5pZiAocGF0aC5pbmRleE9mKHRoaXMuYXMgKyAnLicpID09PSAwKSB7XG50aGlzLm5vdGlmeVBhdGgoJ2l0ZW1zLicgKyByb3cuX19rZXlfXyArICcuJyArIHBhdGguc2xpY2UodGhpcy5hcy5sZW5ndGggKyAxKSwgdmFsdWUpO1xufVxufSxcbl9mb3J3YXJkUGFyZW50UHJvcDogZnVuY3Rpb24gKHByb3AsIHZhbHVlKSB7XG5pZiAodGhpcy5yb3dzKSB7XG50aGlzLnJvd3MuZm9yRWFjaChmdW5jdGlvbiAocm93KSB7XG5yb3cuX19zZXRQcm9wZXJ0eShwcm9wLCB2YWx1ZSwgdHJ1ZSk7XG59LCB0aGlzKTtcbn1cbn0sXG5fZm9yd2FyZFBhcmVudFBhdGg6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSkge1xuaWYgKHRoaXMucm93cykge1xudGhpcy5yb3dzLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xucm93Lm5vdGlmeVBhdGgocGF0aCwgdmFsdWUsIHRydWUpO1xufSwgdGhpcyk7XG59XG59LFxuX2ZvcndhcmRJdGVtUGF0aDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlKSB7XG5pZiAodGhpcy5fcm93Rm9yS2V5KSB7XG52YXIgZG90ID0gcGF0aC5pbmRleE9mKCcuJyk7XG52YXIga2V5ID0gcGF0aC5zdWJzdHJpbmcoMCwgZG90IDwgMCA/IHBhdGgubGVuZ3RoIDogZG90KTtcbnZhciBpZHggPSB0aGlzLl9yb3dGb3JLZXlba2V5XTtcbnZhciByb3cgPSB0aGlzLnJvd3NbaWR4XTtcbmlmIChyb3cpIHtcbmlmIChkb3QgPj0gMCkge1xucGF0aCA9IHRoaXMuYXMgKyAnLicgKyBwYXRoLnN1YnN0cmluZyhkb3QgKyAxKTtcbnJvdy5ub3RpZnlQYXRoKHBhdGgsIHZhbHVlLCB0cnVlKTtcbn0gZWxzZSB7XG5yb3cuX19zZXRQcm9wZXJ0eSh0aGlzLmFzLCB2YWx1ZSwgdHJ1ZSk7XG59XG59XG59XG59LFxuaXRlbUZvckVsZW1lbnQ6IGZ1bmN0aW9uIChlbCkge1xudmFyIGluc3RhbmNlID0gdGhpcy5tb2RlbEZvckVsZW1lbnQoZWwpO1xucmV0dXJuIGluc3RhbmNlICYmIGluc3RhbmNlW3RoaXMuYXNdO1xufSxcbmtleUZvckVsZW1lbnQ6IGZ1bmN0aW9uIChlbCkge1xudmFyIGluc3RhbmNlID0gdGhpcy5tb2RlbEZvckVsZW1lbnQoZWwpO1xucmV0dXJuIGluc3RhbmNlICYmIGluc3RhbmNlLl9fa2V5X187XG59LFxuaW5kZXhGb3JFbGVtZW50OiBmdW5jdGlvbiAoZWwpIHtcbnZhciBpbnN0YW5jZSA9IHRoaXMubW9kZWxGb3JFbGVtZW50KGVsKTtcbnJldHVybiBpbnN0YW5jZSAmJiBpbnN0YW5jZVt0aGlzLmluZGV4QXNdO1xufVxufSk7XG5Qb2x5bWVyKHtcbmlzOiAnYXJyYXktc2VsZWN0b3InLFxucHJvcGVydGllczoge1xuaXRlbXM6IHtcbnR5cGU6IEFycmF5LFxub2JzZXJ2ZXI6ICdfaXRlbXNDaGFuZ2VkJ1xufSxcbnNlbGVjdGVkOiB7XG50eXBlOiBPYmplY3QsXG5ub3RpZnk6IHRydWVcbn0sXG50b2dnbGU6IEJvb2xlYW4sXG5tdWx0aTogQm9vbGVhblxufSxcbl9pdGVtc0NoYW5nZWQ6IGZ1bmN0aW9uICgpIHtcbmlmIChBcnJheS5pc0FycmF5KHRoaXMuc2VsZWN0ZWQpKSB7XG5mb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2VsZWN0ZWQubGVuZ3RoOyBpKyspIHtcbnRoaXMudW5saW5rUGF0aHMoJ3NlbGVjdGVkLicgKyBpKTtcbn1cbn0gZWxzZSB7XG50aGlzLnVubGlua1BhdGhzKCdzZWxlY3RlZCcpO1xufVxuaWYgKHRoaXMubXVsdGkpIHtcbnRoaXMuc2VsZWN0ZWQgPSBbXTtcbn0gZWxzZSB7XG50aGlzLnNlbGVjdGVkID0gbnVsbDtcbn1cbn0sXG5kZXNlbGVjdDogZnVuY3Rpb24gKGl0ZW0pIHtcbmlmICh0aGlzLm11bHRpKSB7XG52YXIgc2NvbCA9IFBvbHltZXIuQ29sbGVjdGlvbi5nZXQodGhpcy5zZWxlY3RlZCk7XG52YXIgc2lkeCA9IHRoaXMuc2VsZWN0ZWQuaW5kZXhPZihpdGVtKTtcbmlmIChzaWR4ID49IDApIHtcbnZhciBza2V5ID0gc2NvbC5nZXRLZXkoaXRlbSk7XG50aGlzLnNwbGljZSgnc2VsZWN0ZWQnLCBzaWR4LCAxKTtcbnRoaXMudW5saW5rUGF0aHMoJ3NlbGVjdGVkLicgKyBza2V5KTtcbnJldHVybiB0cnVlO1xufVxufSBlbHNlIHtcbnRoaXMuc2VsZWN0ZWQgPSBudWxsO1xudGhpcy51bmxpbmtQYXRocygnc2VsZWN0ZWQnKTtcbn1cbn0sXG5zZWxlY3Q6IGZ1bmN0aW9uIChpdGVtKSB7XG52YXIgaWNvbCA9IFBvbHltZXIuQ29sbGVjdGlvbi5nZXQodGhpcy5pdGVtcyk7XG52YXIga2V5ID0gaWNvbC5nZXRLZXkoaXRlbSk7XG5pZiAodGhpcy5tdWx0aSkge1xudmFyIHNjb2wgPSBQb2x5bWVyLkNvbGxlY3Rpb24uZ2V0KHRoaXMuc2VsZWN0ZWQpO1xudmFyIHNrZXkgPSBzY29sLmdldEtleShpdGVtKTtcbmlmIChza2V5ID49IDApIHtcbmlmICh0aGlzLnRvZ2dsZSkge1xudGhpcy5kZXNlbGVjdChpdGVtKTtcbn1cbn0gZWxzZSB7XG50aGlzLnB1c2goJ3NlbGVjdGVkJywgaXRlbSk7XG50aGlzLmFzeW5jKGZ1bmN0aW9uICgpIHtcbnNrZXkgPSBzY29sLmdldEtleShpdGVtKTtcbnRoaXMubGlua1BhdGhzKCdzZWxlY3RlZC4nICsgc2tleSwgJ2l0ZW1zLicgKyBrZXkpO1xufSk7XG59XG59IGVsc2Uge1xuaWYgKHRoaXMudG9nZ2xlICYmIGl0ZW0gPT0gdGhpcy5zZWxlY3RlZCkge1xudGhpcy5kZXNlbGVjdCgpO1xufSBlbHNlIHtcbnRoaXMubGlua1BhdGhzKCdzZWxlY3RlZCcsICdpdGVtcy4nICsga2V5KTtcbnRoaXMuc2VsZWN0ZWQgPSBpdGVtO1xufVxufVxufVxufSk7XG5Qb2x5bWVyKHtcbmlzOiAnZG9tLWlmJyxcbmV4dGVuZHM6ICd0ZW1wbGF0ZScsXG5wcm9wZXJ0aWVzOiB7XG4naWYnOiB7XG50eXBlOiBCb29sZWFuLFxudmFsdWU6IGZhbHNlLFxub2JzZXJ2ZXI6ICdfcXVldWVSZW5kZXInXG59LFxucmVzdGFtcDoge1xudHlwZTogQm9vbGVhbixcbnZhbHVlOiBmYWxzZSxcbm9ic2VydmVyOiAnX3F1ZXVlUmVuZGVyJ1xufVxufSxcbmJlaGF2aW9yczogW1BvbHltZXIuVGVtcGxhdGl6ZXJdLFxuX3F1ZXVlUmVuZGVyOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9kZWJvdW5jZVRlbXBsYXRlKHRoaXMuX3JlbmRlcik7XG59LFxuZGV0YWNoZWQ6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3RlYXJkb3duSW5zdGFuY2UoKTtcbn0sXG5hdHRhY2hlZDogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuaWYgJiYgdGhpcy5jdG9yKSB7XG50aGlzLmFzeW5jKHRoaXMuX2Vuc3VyZUluc3RhbmNlKTtcbn1cbn0sXG5yZW5kZXI6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX2ZsdXNoVGVtcGxhdGVzKCk7XG59LFxuX3JlbmRlcjogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuaWYpIHtcbmlmICghdGhpcy5jdG9yKSB7XG50aGlzLl93cmFwVGV4dE5vZGVzKHRoaXMuX2NvbnRlbnQgfHwgdGhpcy5jb250ZW50KTtcbnRoaXMudGVtcGxhdGl6ZSh0aGlzKTtcbn1cbnRoaXMuX2Vuc3VyZUluc3RhbmNlKCk7XG50aGlzLl9zaG93SGlkZUNoaWxkcmVuKCk7XG59IGVsc2UgaWYgKHRoaXMucmVzdGFtcCkge1xudGhpcy5fdGVhcmRvd25JbnN0YW5jZSgpO1xufVxuaWYgKCF0aGlzLnJlc3RhbXAgJiYgdGhpcy5faW5zdGFuY2UpIHtcbnRoaXMuX3Nob3dIaWRlQ2hpbGRyZW4oKTtcbn1cbmlmICh0aGlzLmlmICE9IHRoaXMuX2xhc3RJZikge1xudGhpcy5maXJlKCdkb20tY2hhbmdlJyk7XG50aGlzLl9sYXN0SWYgPSB0aGlzLmlmO1xufVxufSxcbl9lbnN1cmVJbnN0YW5jZTogZnVuY3Rpb24gKCkge1xuaWYgKCF0aGlzLl9pbnN0YW5jZSkge1xudGhpcy5faW5zdGFuY2UgPSB0aGlzLnN0YW1wKCk7XG52YXIgcm9vdCA9IHRoaXMuX2luc3RhbmNlLnJvb3Q7XG52YXIgcGFyZW50ID0gUG9seW1lci5kb20oUG9seW1lci5kb20odGhpcykucGFyZW50Tm9kZSk7XG5wYXJlbnQuaW5zZXJ0QmVmb3JlKHJvb3QsIHRoaXMpO1xufVxufSxcbl90ZWFyZG93bkluc3RhbmNlOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5faW5zdGFuY2UpIHtcbnZhciBjID0gdGhpcy5faW5zdGFuY2UuX2NoaWxkcmVuO1xuaWYgKGMpIHtcbnZhciBwYXJlbnQgPSBQb2x5bWVyLmRvbShQb2x5bWVyLmRvbShjWzBdKS5wYXJlbnROb2RlKTtcbmMuZm9yRWFjaChmdW5jdGlvbiAobikge1xucGFyZW50LnJlbW92ZUNoaWxkKG4pO1xufSk7XG59XG50aGlzLl9pbnN0YW5jZSA9IG51bGw7XG59XG59LFxuX3dyYXBUZXh0Tm9kZXM6IGZ1bmN0aW9uIChyb290KSB7XG5mb3IgKHZhciBuID0gcm9vdC5maXJzdENoaWxkOyBuOyBuID0gbi5uZXh0U2libGluZykge1xuaWYgKG4ubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFICYmIG4udGV4dENvbnRlbnQudHJpbSgpKSB7XG52YXIgcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbnJvb3QuaW5zZXJ0QmVmb3JlKHMsIG4pO1xucy5hcHBlbmRDaGlsZChuKTtcbm4gPSBzO1xufVxufVxufSxcbl9zaG93SGlkZUNoaWxkcmVuOiBmdW5jdGlvbiAoKSB7XG52YXIgaGlkZGVuID0gdGhpcy5fX2hpZGVUZW1wbGF0ZUNoaWxkcmVuX18gfHwgIXRoaXMuaWY7XG5pZiAodGhpcy5faW5zdGFuY2UpIHtcbnRoaXMuX2luc3RhbmNlLl9zaG93SGlkZUNoaWxkcmVuKGhpZGRlbik7XG59XG59LFxuX2ZvcndhcmRQYXJlbnRQcm9wOiBmdW5jdGlvbiAocHJvcCwgdmFsdWUpIHtcbmlmICh0aGlzLl9pbnN0YW5jZSkge1xudGhpcy5faW5zdGFuY2VbcHJvcF0gPSB2YWx1ZTtcbn1cbn0sXG5fZm9yd2FyZFBhcmVudFBhdGg6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSkge1xuaWYgKHRoaXMuX2luc3RhbmNlKSB7XG50aGlzLl9pbnN0YW5jZS5ub3RpZnlQYXRoKHBhdGgsIHZhbHVlLCB0cnVlKTtcbn1cbn1cbn0pO1xuUG9seW1lci5JbXBvcnRTdGF0dXMgPSB7XG5fcmVhZHk6IGZhbHNlLFxuX2NhbGxiYWNrczogW10sXG53aGVuTG9hZGVkOiBmdW5jdGlvbiAoY2IpIHtcbmlmICh0aGlzLl9yZWFkeSkge1xuY2IoKTtcbn0gZWxzZSB7XG50aGlzLl9jYWxsYmFja3MucHVzaChjYik7XG59XG59LFxuX2ltcG9ydHNMb2FkZWQ6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3JlYWR5ID0gdHJ1ZTtcbnRoaXMuX2NhbGxiYWNrcy5mb3JFYWNoKGZ1bmN0aW9uIChjYikge1xuY2IoKTtcbn0pO1xudGhpcy5fY2FsbGJhY2tzID0gW107XG59XG59O1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XG5Qb2x5bWVyLkltcG9ydFN0YXR1cy5faW1wb3J0c0xvYWRlZCgpO1xufSk7XG5pZiAod2luZG93LkhUTUxJbXBvcnRzKSB7XG5IVE1MSW1wb3J0cy53aGVuUmVhZHkoZnVuY3Rpb24gKCkge1xuUG9seW1lci5JbXBvcnRTdGF0dXMuX2ltcG9ydHNMb2FkZWQoKTtcbn0pO1xufVxuUG9seW1lcih7XG5pczogJ2RvbS1iaW5kJyxcbmV4dGVuZHM6ICd0ZW1wbGF0ZScsXG5jcmVhdGVkOiBmdW5jdGlvbiAoKSB7XG5Qb2x5bWVyLkltcG9ydFN0YXR1cy53aGVuTG9hZGVkKHRoaXMuX3JlYWR5U2VsZi5iaW5kKHRoaXMpKTtcbn0sXG5fcmVnaXN0ZXJGZWF0dXJlczogZnVuY3Rpb24gKCkge1xudGhpcy5fcHJlcEV4dGVuZHMoKTtcbnRoaXMuX3ByZXBDb25zdHJ1Y3RvcigpO1xufSxcbl9pbnNlcnRDaGlsZHJlbjogZnVuY3Rpb24gKCkge1xudmFyIHBhcmVudERvbSA9IFBvbHltZXIuZG9tKFBvbHltZXIuZG9tKHRoaXMpLnBhcmVudE5vZGUpO1xucGFyZW50RG9tLmluc2VydEJlZm9yZSh0aGlzLnJvb3QsIHRoaXMpO1xufSxcbl9yZW1vdmVDaGlsZHJlbjogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuX2NoaWxkcmVuKSB7XG5mb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2NoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG50aGlzLnJvb3QuYXBwZW5kQ2hpbGQodGhpcy5fY2hpbGRyZW5baV0pO1xufVxufVxufSxcbl9pbml0RmVhdHVyZXM6IGZ1bmN0aW9uICgpIHtcbn0sXG5fc2NvcGVFbGVtZW50Q2xhc3M6IGZ1bmN0aW9uIChlbGVtZW50LCBzZWxlY3Rvcikge1xuaWYgKHRoaXMuZGF0YUhvc3QpIHtcbnJldHVybiB0aGlzLmRhdGFIb3N0Ll9zY29wZUVsZW1lbnRDbGFzcyhlbGVtZW50LCBzZWxlY3Rvcik7XG59IGVsc2Uge1xucmV0dXJuIHNlbGVjdG9yO1xufVxufSxcbl9wcmVwQ29uZmlndXJlOiBmdW5jdGlvbiAoKSB7XG52YXIgY29uZmlnID0ge307XG5mb3IgKHZhciBwcm9wIGluIHRoaXMuX3Byb3BlcnR5RWZmZWN0cykge1xuY29uZmlnW3Byb3BdID0gdGhpc1twcm9wXTtcbn1cbnRoaXMuX3NldHVwQ29uZmlndXJlID0gdGhpcy5fc2V0dXBDb25maWd1cmUuYmluZCh0aGlzLCBjb25maWcpO1xufSxcbmF0dGFjaGVkOiBmdW5jdGlvbiAoKSB7XG5pZiAoIXRoaXMuX2NoaWxkcmVuKSB7XG50aGlzLl90ZW1wbGF0ZSA9IHRoaXM7XG50aGlzLl9wcmVwQW5ub3RhdGlvbnMoKTtcbnRoaXMuX3ByZXBFZmZlY3RzKCk7XG50aGlzLl9wcmVwQmVoYXZpb3JzKCk7XG50aGlzLl9wcmVwQ29uZmlndXJlKCk7XG50aGlzLl9wcmVwQmluZGluZ3MoKTtcblBvbHltZXIuQmFzZS5faW5pdEZlYXR1cmVzLmNhbGwodGhpcyk7XG50aGlzLl9jaGlsZHJlbiA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMucm9vdC5jaGlsZE5vZGVzKTtcbn1cbnRoaXMuX2luc2VydENoaWxkcmVuKCk7XG50aGlzLmZpcmUoJ2RvbS1jaGFuZ2UnKTtcbn0sXG5kZXRhY2hlZDogZnVuY3Rpb24gKCkge1xudGhpcy5fcmVtb3ZlQ2hpbGRyZW4oKTtcbn1cbn0pO1xufSkoKTtcblxufSkiLCJkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGZ1bmN0aW9uKCkge1xudmFyIGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF07XG52YXIgcm9vdCA9IGJvZHkuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSk7XG5yb290LnNldEF0dHJpYnV0ZShcImhpZGRlblwiLFwiXCIpO1xucm9vdC5pbm5lckhUTUw9XCI8ZG9tLW1vZHVsZSBpZD1cXFwibG9naW4tZm9ybVxcXCI+PHRlbXBsYXRlPjxzdGF0dXM+PC9zdGF0dXM+PGlyb24tY29sbGFwc2UgaWQ9XFxcImxvZ2luXFxcIj48aW5wdXQgaWQ9XFxcInVzZXJuYW1lXFxcIiBuYW1lPVxcXCJ1c2VybmFtZVxcXCIgcGxhY2Vob2xkZXI9XFxcIkppbWlueSBDcmlja2V0XFxcIiBjbGFzcz1cXFwibmFtZVxcXCI+PGlucHV0IGlkPVxcXCJlbWFpbFxcXCIgbmFtZT1cXFwiZW1haWxcXFwiIHBsYWNlaG9sZGVyPVxcXCJqaW1pbnlAY3JpY2tldC5jb21cXFwiIHR5cGU9XFxcImVtYWlsXFxcIiBjbGFzcz1cXFwiZW1haWxcXFwiPjxsb2dpbi1hY3Rpb25zPjxwYXBlci1idXR0b24gaWQ9XFxcImxvZ2luLWJ1dHRvblxcXCIgY2xhc3M9XFxcInByaW1hcnlcXFwiPkxvZ2luPC9wYXBlci1idXR0b24+PHBhcGVyLWJ1dHRvbiBpZD1cXFwic2hvdy1yZWdpc3Rlci1idXR0b25cXFwiIGNsYXNzPVxcXCJzZWNvbmRhcnlcXFwiPlJlZ2lzdGVyPC9wYXBlci1idXR0b24+PC9sb2dpbi1hY3Rpb25zPjwvaXJvbi1jb2xsYXBzZT48aXJvbi1jb2xsYXBzZSBpZD1cXFwicmVnaXN0ZXJcXFwiPjxpbnB1dCBwbGFjZWhvbGRlcj1cXFwiTmFtZVxcXCI+PGlucHV0IHBsYWNlaG9sZGVyPVxcXCJFbWFpbFxcXCI+PGlucHV0IHBsYWNlaG9sZGVyPVxcXCJQYXNzd29yZFxcXCI+PGxvZ2luLWFjdGlvbnM+PHBhcGVyLWJ1dHRvbiBpZD1cXFwicmVnaXN0ZXItYnV0dG9uXFxcIiBjbGFzcz1cXFwicHJpbWFyeVxcXCI+UmVnaXN0ZXI8L3BhcGVyLWJ1dHRvbj48cGFwZXItYnV0dG9uIGlkPVxcXCJjYW5jZWwtcmVnaXN0ZXItYnV0dG9uXFxcIiBjbGFzcz1cXFwiYXNpZGVcXFwiPkNhbmNlbDwvcGFwZXItYnV0dG9uPjwvbG9naW4tYWN0aW9ucz48L2lyb24tY29sbGFwc2U+PC90ZW1wbGF0ZT48L2RvbS1tb2R1bGU+PHN0eWxlPmlucHV0e2Rpc3BsYXk6YmxvY2s7bWFyZ2luLWJvdHRvbToxMHB4O3dpZHRoOjEwMCV9aDF7bWFyZ2luLWJvdHRvbToxMHB4fWxvZ2luLWFjdGlvbnN7ZGlzcGxheTpibG9jazttYXJnaW4tdG9wOjIwcHh9PC9zdHlsZT5cIjtcbjsoZnVuY3Rpb24oKSB7XG5Qb2x5bWVyKHtcblxuICBpczogXCJsb2dpbi1mb3JtXCIsXG4gIFxuICBsaXN0ZW5lcnM6IHtcbiAgICAnbG9naW4tYnV0dG9uLnRhcCc6ICdsb2dpbicsXG4gICAgJ3Nob3ctcmVnaXN0ZXItYnV0dG9uLnRhcCc6ICdzaG93UmVnaXN0ZXInLFxuICAgICdyZWdpc3Rlci1idXR0b24udGFwJzogJ3JlZ2lzdGVyJyxcbiAgICAnY2FuY2VsLXJlZ2lzdGVyLWJ1dHRvbi50YXAnOiAnY2FuY2VsUmVnaXN0ZXInXG4gIH0sXG4gIFxuICAvLy0gTE9DS0VSICYgTE9BREVEXG4gIHJlYWR5IDogZnVuY3Rpb24oKSB7XG4gICAgR2FiYmEuTG9naW4uaW5pdCgpO1xuICAgIHRoaXMuJC5sb2dpbi50b2dnbGUoKTsgLy8gc2hvdyBsb2dpbiBmb3JtXG4gIH0sXG4gIFxuICAvLy0gUFJPQ0VTUyBMT0dJTlxuICBsb2dpbiA6IGZ1bmN0aW9uKCkge1xuICBcbiAgICB2YXIgdSA9IHRoaXMuJC51c2VybmFtZS52YWx1ZSxcbiAgICAgICAgZSA9IHRoaXMuJC5lbWFpbC52YWx1ZTtcbiAgICBcbiAgICAvLy0gU0VORCBMT0dJTiBUTyBTT0NLRVRcbiAgICB3aW5kb3cuc29ja2V0LmVtaXQoJ3VzZXI6bG9naW4nLCB7IGVtYWlsIDogZSwgdXNlcl9pZCA6IHUsIHJvb21faWQgOiAnZ2VuZXJhbCcgfSk7XG5cbiAgfSxcbiAgXG4gIC8vLSBQUk9DRVNTIFJFR0lTVFJBVElPTlxuICByZWdpc3RlciA6IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUuaW5mbygncmVnaXN0ZXIgdXNlcicpO1xuICB9LFxuICBcbiAgLy8tIFNIT1cgUkVHSVNURVIgRk9STVxuICBzaG93UmVnaXN0ZXIgOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiQucmVnaXN0ZXIudG9nZ2xlKCk7XG4gICAgdGhpcy4kLmxvZ2luLnRvZ2dsZSgpO1xuICB9LFxuICBcbiAgLy8tIEhJREUgUkVHSVNURVIgRk9STVxuICBjYW5jZWxSZWdpc3RlciA6IGZ1bmN0aW9uKCkgeyAgICAgIFxuICAgIHRoaXMuJC5yZWdpc3Rlci50b2dnbGUoKTtcbiAgICB0aGlzLiQubG9naW4udG9nZ2xlKCk7XG4gIH1cblxufSk7XG59KSgpO1xuXG59KSIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgY29uc3QgcG9ydCA9IHdpbmRvdy5sb2NhdGlvbi5wb3J0LFxuICAgICAgICBwcm90b2NvbCA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCArICcvLycsXG4gICAgICAgIGhvc3QgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWU7XG5cbiAgcmV0dXJuIHtcblxuICAgIGluaXQgOiBmdW5jdGlvbiAoIHNlcnZlciApIHtcblxuICAgICAgdGhpcy5zb2NrZXQgPSB3aW5kb3cuc29ja2V0ID0gaW8uY29ubmVjdCggc2VydmVyICk7XG5cbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0ZWQnLCBmdW5jdGlvbiggZGF0YSApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3NvY2tldCBjb25uZWN0ZWQ6ICcpO1xuICAgICAgICBjb25zb2xlLmxvZyhkYXRhLmNvbm5lY3RlZCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zb2NrZXQub24oJ2Vycm9yJywgZnVuY3Rpb24oIGRhdGEgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzb2NrZXQgZXJyb3I6ICcpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGRhdGEuZXJyKTtcbiAgICAgIH0pO1xuXG4gICAgfSxcblxuICAgIGNvbmZpZyA6IHsgIC8vIEdMT0JBTCBDT05GSUcgU0VUVElOR1NcblxuICAgICAgLy8gU0VUIFRPIEZBTFNFIFRPIERJU0FCTEUgTE9HR0lORyBUTyBDT05TT0xFXG4gICAgICBkZWJ1ZyA6IHRydWUsXG5cbiAgICAgIC8vIEJBU0UgVVJMJ1NcbiAgICAgIHVybCA6IHtcbiAgICAgICAgICBiYXNlOiBwcm90b2NvbCArIGhvc3QgKyAoIHBvcnQgIT09ICcnID8gJzonICsgcG9ydCA6ICcnKSArICcvJywgLy9CQVNFIFVSTFxuICAgICAgfVxuXG4gICAgfSAvLyBFTkQgQ09ORklHXG5cbiAgfTtcblxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgY29uc3QgU29ja2V0ID0gd2luZG93LnNvY2tldDtcblxuICByZXR1cm4ge1xuXG4gICAgaW5pdCA6IGZ1bmN0aW9uICggc2VydmVyICkge1xuXG4gICAgICAvLyBXSEVOIFVTRVIgQ09OTkVDVFNcbiAgICAgIHdpbmRvdy5zb2NrZXQub24oJ3VzZXI6Y29ubmVjdGVkJywgZnVuY3Rpb24oIGRhdGEgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCd1c2VyIGNvbm5lY3RlZDonKTtcbiAgICAgICAgY29uc29sZS5sb2coZGF0YSlcbiAgICAgIH0pO1xuXG4gICAgfSxcblxuXG4gICAgcHJvY2VzcyA6IGZ1bmN0aW9uICggZW1haWwsIHVzZXIsIHJvb21faWQgKSB7XG4gICAgICBjb25zb2xlLmxvZygnR2FiYmEuTG9naW4ucHJvY2VzcycpO1xuXG4gICAgICAvLyB3aW5kb3cuc29ja2V0LmVtaXQoJ3VzZXI6bG9naW4nLCB7IGVtYWlsIDogZW1haWwsIHVzZXJfaWQgOiB1c2VyLCByb29tX2lkIDogcm9vbV9pZCB9KTtcblxuICAgIH0sXG5cblxuICB9O1xuXG59O1xuIiwiLy8gUE9MWU1FUiBDT01QT05FTlRTXG5cInVzZSBzdHJpY3RcIjtcblxucmVxdWlyZShcIi4uL19ib3dlci9wYXBlci1idXR0b24vcGFwZXItYnV0dG9uLmh0bWxcIik7XG5yZXF1aXJlKFwiLi4vX2Jvd2VyL2lyb24tY29sbGFwc2UvaXJvbi1jb2xsYXBzZS5odG1sXCIpO1xuXG52YXIgR2FiYmEgPSB3aW5kb3cuR2FiYmEgPSByZXF1aXJlKFwiLi9fbW9kdWxlcy9nYWJiYVwiKSgpO1xuXG5HYWJiYS5Mb2dpbiA9IHJlcXVpcmUoXCIuL19tb2R1bGVzL2xvZ2luXCIpKCk7XG5cbi8vIEdBQkJBIFRFTVBMQVRFU1xucmVxdWlyZShcIi4uL19kaXN0L3RlbXBsYXRlcy9sb2dpbi1mb3JtLmh0bWxcIik7Il19
