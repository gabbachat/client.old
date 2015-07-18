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
// POLYMER COMPONENTS
"use strict";

require("../_bower/paper-button/paper-button.html");
require("../_bower/iron-collapse/iron-collapse.html");

var Gabba = window.Gabba = require("./_modules/gabba")();

// GABBA TEMPLATES
require("../_dist/templates/login-form.html");

},{"../_bower/iron-collapse/iron-collapse.html":4,"../_bower/paper-button/paper-button.html":6,"../_dist/templates/login-form.html":13,"./_modules/gabba":14}]},{},[15])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fYm93ZXIvaXJvbi1hMTF5LWtleXMtYmVoYXZpb3IvaXJvbi1hMTF5LWtleXMtYmVoYXZpb3IuaHRtbCIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fYm93ZXIvaXJvbi1iZWhhdmlvcnMvaXJvbi1idXR0b24tc3RhdGUuaHRtbCIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fYm93ZXIvaXJvbi1iZWhhdmlvcnMvaXJvbi1jb250cm9sLXN0YXRlLmh0bWwiLCIvVXNlcnMvamVzc2V3ZWVkL1NpdGVzL2dhYmJhL2NsaWVudC9jbGllbnQvX2Jvd2VyL2lyb24tY29sbGFwc2UvaXJvbi1jb2xsYXBzZS5odG1sIiwiL1VzZXJzL2plc3Nld2VlZC9TaXRlcy9nYWJiYS9jbGllbnQvY2xpZW50L19ib3dlci9wYXBlci1iZWhhdmlvcnMvcGFwZXItYnV0dG9uLWJlaGF2aW9yLmh0bWwiLCIvVXNlcnMvamVzc2V3ZWVkL1NpdGVzL2dhYmJhL2NsaWVudC9jbGllbnQvX2Jvd2VyL3BhcGVyLWJ1dHRvbi9wYXBlci1idXR0b24uaHRtbCIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fYm93ZXIvcGFwZXItbWF0ZXJpYWwvcGFwZXItbWF0ZXJpYWwuaHRtbCIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fYm93ZXIvcGFwZXItcmlwcGxlL3BhcGVyLXJpcHBsZS5odG1sIiwiL1VzZXJzL2plc3Nld2VlZC9TaXRlcy9nYWJiYS9jbGllbnQvY2xpZW50L19ib3dlci9wYXBlci1zdHlsZXMvc2hhZG93Lmh0bWwiLCIvVXNlcnMvamVzc2V3ZWVkL1NpdGVzL2dhYmJhL2NsaWVudC9jbGllbnQvX2Jvd2VyL3BvbHltZXIvcG9seW1lci1taWNyby5odG1sIiwiL1VzZXJzL2plc3Nld2VlZC9TaXRlcy9nYWJiYS9jbGllbnQvY2xpZW50L19ib3dlci9wb2x5bWVyL3BvbHltZXItbWluaS5odG1sIiwiL1VzZXJzL2plc3Nld2VlZC9TaXRlcy9nYWJiYS9jbGllbnQvY2xpZW50L19ib3dlci9wb2x5bWVyL3BvbHltZXIuaHRtbCIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9fZGlzdC90ZW1wbGF0ZXMvbG9naW4tZm9ybS5odG1sIiwiL1VzZXJzL2plc3Nld2VlZC9TaXRlcy9nYWJiYS9jbGllbnQvY2xpZW50L2FwcC9fbW9kdWxlcy9nYWJiYS5qcyIsIi9Vc2Vycy9qZXNzZXdlZWQvU2l0ZXMvZ2FiYmEvY2xpZW50L2NsaWVudC9hcHAvZmFrZV8xY2VlMWJhZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2prQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Z0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2o1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNTVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQSxZQUFZLENBQUM7O0FBRWIsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZOztBQUUzQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUk7TUFDM0IsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLElBQUk7TUFDMUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDOztBQUV0QyxTQUFPOztBQUVMLFFBQUksRUFBRyxjQUFXLE1BQU0sRUFBRzs7QUFFekIsVUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUUsTUFBTSxDQUFFLENBQUM7O0FBRW5ELFVBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxVQUFVLElBQUksRUFBRztBQUMzQyxlQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDbEMsZUFBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDN0IsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFVLElBQUksRUFBRztBQUN2QyxlQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDOUIsZUFBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDekIsQ0FBQyxDQUFDO0tBRUo7O0FBRUQsVUFBTSxFQUFHOzs7QUFHUCxXQUFLLEVBQUcsSUFBSTs7O0FBR1osU0FBRyxFQUFHO0FBQ0YsWUFBSSxFQUFFLFFBQVEsR0FBRyxJQUFJLElBQUssSUFBSSxLQUFLLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQSxHQUFJLEdBQUcsRUFDakU7O0tBRUY7O0FBQUEsR0FFRixDQUFDO0NBRUgsQ0FBQzs7Ozs7QUN2Q0YsWUFBWSxDQUFDOztBQUViLE9BQU8sQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0FBQ3BELE9BQU8sQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDOztBQUV0RCxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7OztBQUd6RCxPQUFPLENBQUMsb0NBQW9DLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJyZXF1aXJlKFwiLi4vcG9seW1lci9wb2x5bWVyLmh0bWxcIik7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGZ1bmN0aW9uKCkge1xuOyhmdW5jdGlvbigpIHtcblxuICAoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqXG4gICAgICogQ2hyb21lIHVzZXMgYW4gb2xkZXIgdmVyc2lvbiBvZiBET00gTGV2ZWwgMyBLZXlib2FyZCBFdmVudHNcbiAgICAgKlxuICAgICAqIE1vc3Qga2V5cyBhcmUgbGFiZWxlZCBhcyB0ZXh0LCBidXQgc29tZSBhcmUgVW5pY29kZSBjb2RlcG9pbnRzLlxuICAgICAqIFZhbHVlcyB0YWtlbiBmcm9tOiBodHRwOi8vd3d3LnczLm9yZy9UUi8yMDA3L1dELURPTS1MZXZlbC0zLUV2ZW50cy0yMDA3MTIyMS9rZXlzZXQuaHRtbCNLZXlTZXQtU2V0XG4gICAgICovXG4gICAgdmFyIEtFWV9JREVOVElGSUVSID0ge1xuICAgICAgJ1UrMDAwOSc6ICd0YWInLFxuICAgICAgJ1UrMDAxQic6ICdlc2MnLFxuICAgICAgJ1UrMDAyMCc6ICdzcGFjZScsXG4gICAgICAnVSswMDJBJzogJyonLFxuICAgICAgJ1UrMDAzMCc6ICcwJyxcbiAgICAgICdVKzAwMzEnOiAnMScsXG4gICAgICAnVSswMDMyJzogJzInLFxuICAgICAgJ1UrMDAzMyc6ICczJyxcbiAgICAgICdVKzAwMzQnOiAnNCcsXG4gICAgICAnVSswMDM1JzogJzUnLFxuICAgICAgJ1UrMDAzNic6ICc2JyxcbiAgICAgICdVKzAwMzcnOiAnNycsXG4gICAgICAnVSswMDM4JzogJzgnLFxuICAgICAgJ1UrMDAzOSc6ICc5JyxcbiAgICAgICdVKzAwNDEnOiAnYScsXG4gICAgICAnVSswMDQyJzogJ2InLFxuICAgICAgJ1UrMDA0Myc6ICdjJyxcbiAgICAgICdVKzAwNDQnOiAnZCcsXG4gICAgICAnVSswMDQ1JzogJ2UnLFxuICAgICAgJ1UrMDA0Nic6ICdmJyxcbiAgICAgICdVKzAwNDcnOiAnZycsXG4gICAgICAnVSswMDQ4JzogJ2gnLFxuICAgICAgJ1UrMDA0OSc6ICdpJyxcbiAgICAgICdVKzAwNEEnOiAnaicsXG4gICAgICAnVSswMDRCJzogJ2snLFxuICAgICAgJ1UrMDA0Qyc6ICdsJyxcbiAgICAgICdVKzAwNEQnOiAnbScsXG4gICAgICAnVSswMDRFJzogJ24nLFxuICAgICAgJ1UrMDA0Ric6ICdvJyxcbiAgICAgICdVKzAwNTAnOiAncCcsXG4gICAgICAnVSswMDUxJzogJ3EnLFxuICAgICAgJ1UrMDA1Mic6ICdyJyxcbiAgICAgICdVKzAwNTMnOiAncycsXG4gICAgICAnVSswMDU0JzogJ3QnLFxuICAgICAgJ1UrMDA1NSc6ICd1JyxcbiAgICAgICdVKzAwNTYnOiAndicsXG4gICAgICAnVSswMDU3JzogJ3cnLFxuICAgICAgJ1UrMDA1OCc6ICd4JyxcbiAgICAgICdVKzAwNTknOiAneScsXG4gICAgICAnVSswMDVBJzogJ3onLFxuICAgICAgJ1UrMDA3Ric6ICdkZWwnXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNwZWNpYWwgdGFibGUgZm9yIEtleWJvYXJkRXZlbnQua2V5Q29kZS5cbiAgICAgKiBLZXlib2FyZEV2ZW50LmtleUlkZW50aWZpZXIgaXMgYmV0dGVyLCBhbmQgS2V5Qm9hcmRFdmVudC5rZXkgaXMgZXZlbiBiZXR0ZXJcbiAgICAgKiB0aGFuIHRoYXQuXG4gICAgICpcbiAgICAgKiBWYWx1ZXMgZnJvbTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0tleWJvYXJkRXZlbnQua2V5Q29kZSNWYWx1ZV9vZl9rZXlDb2RlXG4gICAgICovXG4gICAgdmFyIEtFWV9DT0RFID0ge1xuICAgICAgOTogJ3RhYicsXG4gICAgICAxMzogJ2VudGVyJyxcbiAgICAgIDI3OiAnZXNjJyxcbiAgICAgIDMzOiAncGFnZXVwJyxcbiAgICAgIDM0OiAncGFnZWRvd24nLFxuICAgICAgMzU6ICdlbmQnLFxuICAgICAgMzY6ICdob21lJyxcbiAgICAgIDMyOiAnc3BhY2UnLFxuICAgICAgMzc6ICdsZWZ0JyxcbiAgICAgIDM4OiAndXAnLFxuICAgICAgMzk6ICdyaWdodCcsXG4gICAgICA0MDogJ2Rvd24nLFxuICAgICAgNDY6ICdkZWwnLFxuICAgICAgMTA2OiAnKidcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTU9ESUZJRVJfS0VZUyBtYXBzIHRoZSBzaG9ydCBuYW1lIGZvciBtb2RpZmllciBrZXlzIHVzZWQgaW4gYSBrZXlcbiAgICAgKiBjb21ibyBzdHJpbmcgdG8gdGhlIHByb3BlcnR5IG5hbWUgdGhhdCByZWZlcmVuY2VzIHRob3NlIHNhbWUga2V5c1xuICAgICAqIGluIGEgS2V5Ym9hcmRFdmVudCBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICB2YXIgTU9ESUZJRVJfS0VZUyA9IHtcbiAgICAgICdzaGlmdCc6ICdzaGlmdEtleScsXG4gICAgICAnY3RybCc6ICdjdHJsS2V5JyxcbiAgICAgICdhbHQnOiAnYWx0S2V5JyxcbiAgICAgICdtZXRhJzogJ21ldGFLZXknXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEtleWJvYXJkRXZlbnQua2V5IGlzIG1vc3RseSByZXByZXNlbnRlZCBieSBwcmludGFibGUgY2hhcmFjdGVyIG1hZGUgYnlcbiAgICAgKiB0aGUga2V5Ym9hcmQsIHdpdGggdW5wcmludGFibGUga2V5cyBsYWJlbGVkIG5pY2VseS5cbiAgICAgKlxuICAgICAqIEhvd2V2ZXIsIG9uIE9TIFgsIEFsdCtjaGFyIGNhbiBtYWtlIGEgVW5pY29kZSBjaGFyYWN0ZXIgdGhhdCBmb2xsb3dzIGFuXG4gICAgICogQXBwbGUtc3BlY2lmaWMgbWFwcGluZy4gSW4gdGhpcyBjYXNlLCB3ZVxuICAgICAqIGZhbGwgYmFjayB0byAua2V5Q29kZS5cbiAgICAgKi9cbiAgICB2YXIgS0VZX0NIQVIgPSAvW2EtejAtOSpdLztcblxuICAgIC8qKlxuICAgICAqIE1hdGNoZXMgYSBrZXlJZGVudGlmaWVyIHN0cmluZy5cbiAgICAgKi9cbiAgICB2YXIgSURFTlRfQ0hBUiA9IC9VXFwrLztcblxuICAgIC8qKlxuICAgICAqIE1hdGNoZXMgYXJyb3cga2V5cyBpbiBHZWNrbyAyNy4wK1xuICAgICAqL1xuICAgIHZhciBBUlJPV19LRVkgPSAvXmFycm93LztcblxuICAgIC8qKlxuICAgICAqIE1hdGNoZXMgc3BhY2Uga2V5cyBldmVyeXdoZXJlIChub3RhYmx5IGluY2x1ZGluZyBJRTEwJ3MgZXhjZXB0aW9uYWwgbmFtZVxuICAgICAqIGBzcGFjZWJhcmApLlxuICAgICAqL1xuICAgIHZhciBTUEFDRV9LRVkgPSAvXnNwYWNlKGJhcik/LztcblxuICAgIGZ1bmN0aW9uIHRyYW5zZm9ybUtleShrZXkpIHtcbiAgICAgIHZhciB2YWxpZEtleSA9ICcnO1xuICAgICAgaWYgKGtleSkge1xuICAgICAgICB2YXIgbEtleSA9IGtleS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAobEtleS5sZW5ndGggPT0gMSkge1xuICAgICAgICAgIGlmIChLRVlfQ0hBUi50ZXN0KGxLZXkpKSB7XG4gICAgICAgICAgICB2YWxpZEtleSA9IGxLZXk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKEFSUk9XX0tFWS50ZXN0KGxLZXkpKSB7XG4gICAgICAgICAgdmFsaWRLZXkgPSBsS2V5LnJlcGxhY2UoJ2Fycm93JywgJycpO1xuICAgICAgICB9IGVsc2UgaWYgKFNQQUNFX0tFWS50ZXN0KGxLZXkpKSB7XG4gICAgICAgICAgdmFsaWRLZXkgPSAnc3BhY2UnO1xuICAgICAgICB9IGVsc2UgaWYgKGxLZXkgPT0gJ211bHRpcGx5Jykge1xuICAgICAgICAgIC8vIG51bXBhZCAnKicgY2FuIG1hcCB0byBNdWx0aXBseSBvbiBJRS9XaW5kb3dzXG4gICAgICAgICAgdmFsaWRLZXkgPSAnKic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsaWRLZXkgPSBsS2V5O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsaWRLZXk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHJhbnNmb3JtS2V5SWRlbnRpZmllcihrZXlJZGVudCkge1xuICAgICAgdmFyIHZhbGlkS2V5ID0gJyc7XG4gICAgICBpZiAoa2V5SWRlbnQpIHtcbiAgICAgICAgaWYgKElERU5UX0NIQVIudGVzdChrZXlJZGVudCkpIHtcbiAgICAgICAgICB2YWxpZEtleSA9IEtFWV9JREVOVElGSUVSW2tleUlkZW50XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWxpZEtleSA9IGtleUlkZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWxpZEtleTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2Zvcm1LZXlDb2RlKGtleUNvZGUpIHtcbiAgICAgIHZhciB2YWxpZEtleSA9ICcnO1xuICAgICAgaWYgKE51bWJlcihrZXlDb2RlKSkge1xuICAgICAgICBpZiAoa2V5Q29kZSA+PSA2NSAmJiBrZXlDb2RlIDw9IDkwKSB7XG4gICAgICAgICAgLy8gYXNjaWkgYS16XG4gICAgICAgICAgLy8gbG93ZXJjYXNlIGlzIDMyIG9mZnNldCBmcm9tIHVwcGVyY2FzZVxuICAgICAgICAgIHZhbGlkS2V5ID0gU3RyaW5nLmZyb21DaGFyQ29kZSgzMiArIGtleUNvZGUpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleUNvZGUgPj0gMTEyICYmIGtleUNvZGUgPD0gMTIzKSB7XG4gICAgICAgICAgLy8gZnVuY3Rpb24ga2V5cyBmMS1mMTJcbiAgICAgICAgICB2YWxpZEtleSA9ICdmJyArIChrZXlDb2RlIC0gMTEyKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXlDb2RlID49IDQ4ICYmIGtleUNvZGUgPD0gNTcpIHtcbiAgICAgICAgICAvLyB0b3AgMC05IGtleXNcbiAgICAgICAgICB2YWxpZEtleSA9IFN0cmluZyg0OCAtIGtleUNvZGUpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleUNvZGUgPj0gOTYgJiYga2V5Q29kZSA8PSAxMDUpIHtcbiAgICAgICAgICAvLyBudW0gcGFkIDAtOVxuICAgICAgICAgIHZhbGlkS2V5ID0gU3RyaW5nKDk2IC0ga2V5Q29kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsaWRLZXkgPSBLRVlfQ09ERVtrZXlDb2RlXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbGlkS2V5O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZWRLZXlGb3JFdmVudChrZXlFdmVudCkge1xuICAgICAgLy8gZmFsbCBiYWNrIGZyb20gLmtleSwgdG8gLmtleUlkZW50aWZpZXIsIHRvIC5rZXlDb2RlLCBhbmQgdGhlbiB0b1xuICAgICAgLy8gLmRldGFpbC5rZXkgdG8gc3VwcG9ydCBhcnRpZmljaWFsIGtleWJvYXJkIGV2ZW50c1xuICAgICAgcmV0dXJuIHRyYW5zZm9ybUtleShrZXlFdmVudC5rZXkpIHx8XG4gICAgICAgIHRyYW5zZm9ybUtleUlkZW50aWZpZXIoa2V5RXZlbnQua2V5SWRlbnRpZmllcikgfHxcbiAgICAgICAgdHJhbnNmb3JtS2V5Q29kZShrZXlFdmVudC5rZXlDb2RlKSB8fFxuICAgICAgICB0cmFuc2Zvcm1LZXkoa2V5RXZlbnQuZGV0YWlsLmtleSkgfHwgJyc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24ga2V5Q29tYm9NYXRjaGVzRXZlbnQoa2V5Q29tYm8sIGtleUV2ZW50KSB7XG4gICAgICByZXR1cm4gbm9ybWFsaXplZEtleUZvckV2ZW50KGtleUV2ZW50KSA9PT0ga2V5Q29tYm8ua2V5ICYmXG4gICAgICAgICEha2V5RXZlbnQuc2hpZnRLZXkgPT09ICEha2V5Q29tYm8uc2hpZnRLZXkgJiZcbiAgICAgICAgISFrZXlFdmVudC5jdHJsS2V5ID09PSAhIWtleUNvbWJvLmN0cmxLZXkgJiZcbiAgICAgICAgISFrZXlFdmVudC5hbHRLZXkgPT09ICEha2V5Q29tYm8uYWx0S2V5ICYmXG4gICAgICAgICEha2V5RXZlbnQubWV0YUtleSA9PT0gISFrZXlDb21iby5tZXRhS2V5O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlS2V5Q29tYm9TdHJpbmcoa2V5Q29tYm9TdHJpbmcpIHtcbiAgICAgIHJldHVybiBrZXlDb21ib1N0cmluZy5zcGxpdCgnKycpLnJlZHVjZShmdW5jdGlvbihwYXJzZWRLZXlDb21ibywga2V5Q29tYm9QYXJ0KSB7XG4gICAgICAgIHZhciBldmVudFBhcnRzID0ga2V5Q29tYm9QYXJ0LnNwbGl0KCc6Jyk7XG4gICAgICAgIHZhciBrZXlOYW1lID0gZXZlbnRQYXJ0c1swXTtcbiAgICAgICAgdmFyIGV2ZW50ID0gZXZlbnRQYXJ0c1sxXTtcblxuICAgICAgICBpZiAoa2V5TmFtZSBpbiBNT0RJRklFUl9LRVlTKSB7XG4gICAgICAgICAgcGFyc2VkS2V5Q29tYm9bTU9ESUZJRVJfS0VZU1trZXlOYW1lXV0gPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhcnNlZEtleUNvbWJvLmtleSA9IGtleU5hbWU7XG4gICAgICAgICAgcGFyc2VkS2V5Q29tYm8uZXZlbnQgPSBldmVudCB8fCAna2V5ZG93bic7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyc2VkS2V5Q29tYm87XG4gICAgICB9LCB7XG4gICAgICAgIGNvbWJvOiBrZXlDb21ib1N0cmluZy5zcGxpdCgnOicpLnNoaWZ0KClcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlRXZlbnRTdHJpbmcoZXZlbnRTdHJpbmcpIHtcbiAgICAgIHJldHVybiBldmVudFN0cmluZy5zcGxpdCgnICcpLm1hcChmdW5jdGlvbihrZXlDb21ib1N0cmluZykge1xuICAgICAgICByZXR1cm4gcGFyc2VLZXlDb21ib1N0cmluZyhrZXlDb21ib1N0cmluZyk7XG4gICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIGBQb2x5bWVyLklyb25BMTF5S2V5c0JlaGF2aW9yYCBwcm92aWRlcyBhIG5vcm1hbGl6ZWQgaW50ZXJmYWNlIGZvciBwcm9jZXNzaW5nXG4gICAgICoga2V5Ym9hcmQgY29tbWFuZHMgdGhhdCBwZXJ0YWluIHRvIFtXQUktQVJJQSBiZXN0IHByYWN0aWNlc10oaHR0cDovL3d3dy53My5vcmcvVFIvd2FpLWFyaWEtcHJhY3RpY2VzLyNrYmRfZ2VuZXJhbF9iaW5kaW5nKS5cbiAgICAgKiBUaGUgZWxlbWVudCB0YWtlcyBjYXJlIG9mIGJyb3dzZXIgZGlmZmVyZW5jZXMgd2l0aCByZXNwZWN0IHRvIEtleWJvYXJkIGV2ZW50c1xuICAgICAqIGFuZCB1c2VzIGFuIGV4cHJlc3NpdmUgc3ludGF4IHRvIGZpbHRlciBrZXkgcHJlc3Nlcy5cbiAgICAgKlxuICAgICAqIFVzZSB0aGUgYGtleUJpbmRpbmdzYCBwcm90b3R5cGUgcHJvcGVydHkgdG8gZXhwcmVzcyB3aGF0IGNvbWJpbmF0aW9uIG9mIGtleXNcbiAgICAgKiB3aWxsIHRyaWdnZXIgdGhlIGV2ZW50IHRvIGZpcmUuXG4gICAgICpcbiAgICAgKiBVc2UgdGhlIGBrZXktZXZlbnQtdGFyZ2V0YCBhdHRyaWJ1dGUgdG8gc2V0IHVwIGV2ZW50IGhhbmRsZXJzIG9uIGEgc3BlY2lmaWNcbiAgICAgKiBub2RlLlxuICAgICAqIFRoZSBga2V5cy1wcmVzc2VkYCBldmVudCB3aWxsIGZpcmUgd2hlbiBvbmUgb2YgdGhlIGtleSBjb21iaW5hdGlvbnMgc2V0IHdpdGggdGhlXG4gICAgICogYGtleXNgIHByb3BlcnR5IGlzIHByZXNzZWQuXG4gICAgICpcbiAgICAgKiBAZGVtbyBkZW1vL2luZGV4Lmh0bWxcbiAgICAgKiBAcG9seW1lckJlaGF2aW9yIElyb25BMTF5S2V5c0JlaGF2aW9yXG4gICAgICovXG4gICAgUG9seW1lci5Jcm9uQTExeUtleXNCZWhhdmlvciA9IHtcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBIVE1MRWxlbWVudCB0aGF0IHdpbGwgYmUgZmlyaW5nIHJlbGV2YW50IEtleWJvYXJkRXZlbnRzLlxuICAgICAgICAgKi9cbiAgICAgICAga2V5RXZlbnRUYXJnZXQ6IHtcbiAgICAgICAgICB0eXBlOiBPYmplY3QsXG4gICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9ib3VuZEtleUhhbmRsZXJzOiB7XG4gICAgICAgICAgdHlwZTogQXJyYXksXG4gICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBXZSB1c2UgdGhpcyBkdWUgdG8gYSBsaW1pdGF0aW9uIGluIElFMTAgd2hlcmUgaW5zdGFuY2VzIHdpbGwgaGF2ZVxuICAgICAgICAvLyBvd24gcHJvcGVydGllcyBvZiBldmVyeXRoaW5nIG9uIHRoZSBcInByb3RvdHlwZVwiLlxuICAgICAgICBfaW1wZXJhdGl2ZUtleUJpbmRpbmdzOiB7XG4gICAgICAgICAgdHlwZTogT2JqZWN0LFxuICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIG9ic2VydmVyczogW1xuICAgICAgICAnX3Jlc2V0S2V5RXZlbnRMaXN0ZW5lcnMoa2V5RXZlbnRUYXJnZXQsIF9ib3VuZEtleUhhbmRsZXJzKSdcbiAgICAgIF0sXG5cbiAgICAgIGtleUJpbmRpbmdzOiB7fSxcblxuICAgICAgcmVnaXN0ZXJlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3ByZXBLZXlCaW5kaW5ncygpO1xuICAgICAgfSxcblxuICAgICAgYXR0YWNoZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9saXN0ZW5LZXlFdmVudExpc3RlbmVycygpO1xuICAgICAgfSxcblxuICAgICAgZGV0YWNoZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl91bmxpc3RlbktleUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIENhbiBiZSB1c2VkIHRvIGltcGVyYXRpdmVseSBhZGQgYSBrZXkgYmluZGluZyB0byB0aGUgaW1wbGVtZW50aW5nXG4gICAgICAgKiBlbGVtZW50LiBUaGlzIGlzIHRoZSBpbXBlcmF0aXZlIGVxdWl2YWxlbnQgb2YgZGVjbGFyaW5nIGEga2V5YmluZGluZ1xuICAgICAgICogaW4gdGhlIGBrZXlCaW5kaW5nc2AgcHJvdG90eXBlIHByb3BlcnR5LlxuICAgICAgICovXG4gICAgICBhZGRPd25LZXlCaW5kaW5nOiBmdW5jdGlvbihldmVudFN0cmluZywgaGFuZGxlck5hbWUpIHtcbiAgICAgICAgdGhpcy5faW1wZXJhdGl2ZUtleUJpbmRpbmdzW2V2ZW50U3RyaW5nXSA9IGhhbmRsZXJOYW1lO1xuICAgICAgICB0aGlzLl9wcmVwS2V5QmluZGluZ3MoKTtcbiAgICAgICAgdGhpcy5fcmVzZXRLZXlFdmVudExpc3RlbmVycygpO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBXaGVuIGNhbGxlZCwgd2lsbCByZW1vdmUgYWxsIGltcGVyYXRpdmVseS1hZGRlZCBrZXkgYmluZGluZ3MuXG4gICAgICAgKi9cbiAgICAgIHJlbW92ZU93bktleUJpbmRpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5faW1wZXJhdGl2ZUtleUJpbmRpbmdzID0ge307XG4gICAgICAgIHRoaXMuX3ByZXBLZXlCaW5kaW5ncygpO1xuICAgICAgICB0aGlzLl9yZXNldEtleUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICB9LFxuXG4gICAgICBrZXlib2FyZEV2ZW50TWF0Y2hlc0tleXM6IGZ1bmN0aW9uKGV2ZW50LCBldmVudFN0cmluZykge1xuICAgICAgICB2YXIga2V5Q29tYm9zID0gcGFyc2VFdmVudFN0cmluZyhldmVudFN0cmluZyk7XG4gICAgICAgIHZhciBpbmRleDtcblxuICAgICAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBrZXlDb21ib3MubGVuZ3RoOyArK2luZGV4KSB7XG4gICAgICAgICAgaWYgKGtleUNvbWJvTWF0Y2hlc0V2ZW50KGtleUNvbWJvc1tpbmRleF0sIGV2ZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcblxuICAgICAgX2NvbGxlY3RLZXlCaW5kaW5nczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBrZXlCaW5kaW5ncyA9IHRoaXMuYmVoYXZpb3JzLm1hcChmdW5jdGlvbihiZWhhdmlvcikge1xuICAgICAgICAgIHJldHVybiBiZWhhdmlvci5rZXlCaW5kaW5ncztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGtleUJpbmRpbmdzLmluZGV4T2YodGhpcy5rZXlCaW5kaW5ncykgPT09IC0xKSB7XG4gICAgICAgICAga2V5QmluZGluZ3MucHVzaCh0aGlzLmtleUJpbmRpbmdzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBrZXlCaW5kaW5ncztcbiAgICAgIH0sXG5cbiAgICAgIF9wcmVwS2V5QmluZGluZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9rZXlCaW5kaW5ncyA9IHt9O1xuXG4gICAgICAgIHRoaXMuX2NvbGxlY3RLZXlCaW5kaW5ncygpLmZvckVhY2goZnVuY3Rpb24oa2V5QmluZGluZ3MpIHtcbiAgICAgICAgICBmb3IgKHZhciBldmVudFN0cmluZyBpbiBrZXlCaW5kaW5ncykge1xuICAgICAgICAgICAgdGhpcy5fYWRkS2V5QmluZGluZyhldmVudFN0cmluZywga2V5QmluZGluZ3NbZXZlbnRTdHJpbmddKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGZvciAodmFyIGV2ZW50U3RyaW5nIGluIHRoaXMuX2ltcGVyYXRpdmVLZXlCaW5kaW5ncykge1xuICAgICAgICAgIHRoaXMuX2FkZEtleUJpbmRpbmcoZXZlbnRTdHJpbmcsIHRoaXMuX2ltcGVyYXRpdmVLZXlCaW5kaW5nc1tldmVudFN0cmluZ10pO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBfYWRkS2V5QmluZGluZzogZnVuY3Rpb24oZXZlbnRTdHJpbmcsIGhhbmRsZXJOYW1lKSB7XG4gICAgICAgIHBhcnNlRXZlbnRTdHJpbmcoZXZlbnRTdHJpbmcpLmZvckVhY2goZnVuY3Rpb24oa2V5Q29tYm8pIHtcbiAgICAgICAgICB0aGlzLl9rZXlCaW5kaW5nc1trZXlDb21iby5ldmVudF0gPVxuICAgICAgICAgICAgdGhpcy5fa2V5QmluZGluZ3Nba2V5Q29tYm8uZXZlbnRdIHx8IFtdO1xuXG4gICAgICAgICAgdGhpcy5fa2V5QmluZGluZ3Nba2V5Q29tYm8uZXZlbnRdLnB1c2goW1xuICAgICAgICAgICAga2V5Q29tYm8sXG4gICAgICAgICAgICBoYW5kbGVyTmFtZVxuICAgICAgICAgIF0pO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH0sXG5cbiAgICAgIF9yZXNldEtleUV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fdW5saXN0ZW5LZXlFdmVudExpc3RlbmVycygpO1xuXG4gICAgICAgIGlmICh0aGlzLmlzQXR0YWNoZWQpIHtcbiAgICAgICAgICB0aGlzLl9saXN0ZW5LZXlFdmVudExpc3RlbmVycygpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBfbGlzdGVuS2V5RXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLl9rZXlCaW5kaW5ncykuZm9yRWFjaChmdW5jdGlvbihldmVudE5hbWUpIHtcbiAgICAgICAgICB2YXIga2V5QmluZGluZ3MgPSB0aGlzLl9rZXlCaW5kaW5nc1tldmVudE5hbWVdO1xuICAgICAgICAgIHZhciBib3VuZEtleUhhbmRsZXIgPSB0aGlzLl9vbktleUJpbmRpbmdFdmVudC5iaW5kKHRoaXMsIGtleUJpbmRpbmdzKTtcblxuICAgICAgICAgIHRoaXMuX2JvdW5kS2V5SGFuZGxlcnMucHVzaChbdGhpcy5rZXlFdmVudFRhcmdldCwgZXZlbnROYW1lLCBib3VuZEtleUhhbmRsZXJdKTtcblxuICAgICAgICAgIHRoaXMua2V5RXZlbnRUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGJvdW5kS2V5SGFuZGxlcik7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfSxcblxuICAgICAgX3VubGlzdGVuS2V5RXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIga2V5SGFuZGxlclR1cGxlO1xuICAgICAgICB2YXIga2V5RXZlbnRUYXJnZXQ7XG4gICAgICAgIHZhciBldmVudE5hbWU7XG4gICAgICAgIHZhciBib3VuZEtleUhhbmRsZXI7XG5cbiAgICAgICAgd2hpbGUgKHRoaXMuX2JvdW5kS2V5SGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gTXkga2luZ2RvbSBmb3IgYmxvY2stc2NvcGUgYmluZGluZyBhbmQgZGVzdHJ1Y3R1cmluZyBhc3NpZ25tZW50Li5cbiAgICAgICAgICBrZXlIYW5kbGVyVHVwbGUgPSB0aGlzLl9ib3VuZEtleUhhbmRsZXJzLnBvcCgpO1xuICAgICAgICAgIGtleUV2ZW50VGFyZ2V0ID0ga2V5SGFuZGxlclR1cGxlWzBdO1xuICAgICAgICAgIGV2ZW50TmFtZSA9IGtleUhhbmRsZXJUdXBsZVsxXTtcbiAgICAgICAgICBib3VuZEtleUhhbmRsZXIgPSBrZXlIYW5kbGVyVHVwbGVbMl07XG5cbiAgICAgICAgICBrZXlFdmVudFRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgYm91bmRLZXlIYW5kbGVyKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgX29uS2V5QmluZGluZ0V2ZW50OiBmdW5jdGlvbihrZXlCaW5kaW5ncywgZXZlbnQpIHtcbiAgICAgICAga2V5QmluZGluZ3MuZm9yRWFjaChmdW5jdGlvbihrZXlCaW5kaW5nKSB7XG4gICAgICAgICAgdmFyIGtleUNvbWJvID0ga2V5QmluZGluZ1swXTtcbiAgICAgICAgICB2YXIgaGFuZGxlck5hbWUgPSBrZXlCaW5kaW5nWzFdO1xuXG4gICAgICAgICAgaWYgKCFldmVudC5kZWZhdWx0UHJldmVudGVkICYmIGtleUNvbWJvTWF0Y2hlc0V2ZW50KGtleUNvbWJvLCBldmVudCkpIHtcbiAgICAgICAgICAgIHRoaXMuX3RyaWdnZXJLZXlIYW5kbGVyKGtleUNvbWJvLCBoYW5kbGVyTmFtZSwgZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9LFxuXG4gICAgICBfdHJpZ2dlcktleUhhbmRsZXI6IGZ1bmN0aW9uKGtleUNvbWJvLCBoYW5kbGVyTmFtZSwga2V5Ym9hcmRFdmVudCkge1xuICAgICAgICB2YXIgZGV0YWlsID0gT2JqZWN0LmNyZWF0ZShrZXlDb21ibyk7XG4gICAgICAgIGRldGFpbC5rZXlib2FyZEV2ZW50ID0ga2V5Ym9hcmRFdmVudDtcblxuICAgICAgICB0aGlzW2hhbmRsZXJOYW1lXS5jYWxsKHRoaXMsIG5ldyBDdXN0b21FdmVudChrZXlDb21iby5ldmVudCwge1xuICAgICAgICAgIGRldGFpbDogZGV0YWlsXG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KSgpO1xuXG59KSgpO1xuXG59KSIsInJlcXVpcmUoXCIuLi9wb2x5bWVyL3BvbHltZXIuaHRtbFwiKTtcbnJlcXVpcmUoXCIuLi9pcm9uLWExMXkta2V5cy1iZWhhdmlvci9pcm9uLWExMXkta2V5cy1iZWhhdmlvci5odG1sXCIpO1xucmVxdWlyZShcIi4vaXJvbi1jb250cm9sLXN0YXRlLmh0bWxcIik7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGZ1bmN0aW9uKCkge1xuOyhmdW5jdGlvbigpIHtcblxuXG4gIC8qKlxuICAgKiBAZGVtbyBkZW1vL2luZGV4Lmh0bWxcbiAgICogQHBvbHltZXJCZWhhdmlvciBQb2x5bWVyLklyb25CdXR0b25TdGF0ZVxuICAgKi9cbiAgUG9seW1lci5Jcm9uQnV0dG9uU3RhdGVJbXBsID0ge1xuXG4gICAgcHJvcGVydGllczoge1xuXG4gICAgICAvKipcbiAgICAgICAqIElmIHRydWUsIHRoZSB1c2VyIGlzIGN1cnJlbnRseSBob2xkaW5nIGRvd24gdGhlIGJ1dHRvbi5cbiAgICAgICAqL1xuICAgICAgcHJlc3NlZDoge1xuICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICByZWFkT25seTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZhbHNlLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIG9ic2VydmVyOiAnX3ByZXNzZWRDaGFuZ2VkJ1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBJZiB0cnVlLCB0aGUgYnV0dG9uIHRvZ2dsZXMgdGhlIGFjdGl2ZSBzdGF0ZSB3aXRoIGVhY2ggdGFwIG9yIHByZXNzXG4gICAgICAgKiBvZiB0aGUgc3BhY2ViYXIuXG4gICAgICAgKi9cbiAgICAgIHRvZ2dsZXM6IHtcbiAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgdmFsdWU6IGZhbHNlLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWVcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogSWYgdHJ1ZSwgdGhlIGJ1dHRvbiBpcyBhIHRvZ2dsZSBhbmQgaXMgY3VycmVudGx5IGluIHRoZSBhY3RpdmUgc3RhdGUuXG4gICAgICAgKi9cbiAgICAgIGFjdGl2ZToge1xuICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICAgIG5vdGlmeTogdHJ1ZSxcbiAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICBvYnNlcnZlcjogJ19hY3RpdmVDaGFuZ2VkJ1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBUcnVlIGlmIHRoZSBlbGVtZW50IGlzIGN1cnJlbnRseSBiZWluZyBwcmVzc2VkIGJ5IGEgXCJwb2ludGVyLFwiIHdoaWNoXG4gICAgICAgKiBpcyBsb29zZWx5IGRlZmluZWQgYXMgbW91c2Ugb3IgdG91Y2ggaW5wdXQgKGJ1dCBzcGVjaWZpY2FsbHkgZXhjbHVkaW5nXG4gICAgICAgKiBrZXlib2FyZCBpbnB1dCkuXG4gICAgICAgKi9cbiAgICAgIHBvaW50ZXJEb3duOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogVHJ1ZSBpZiB0aGUgaW5wdXQgZGV2aWNlIHRoYXQgY2F1c2VkIHRoZSBlbGVtZW50IHRvIHJlY2VpdmUgZm9jdXNcbiAgICAgICAqIHdhcyBhIGtleWJvYXJkLlxuICAgICAgICovXG4gICAgICByZWNlaXZlZEZvY3VzRnJvbUtleWJvYXJkOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIHJlYWRPbmx5OiB0cnVlXG4gICAgICB9XG4gICAgfSxcblxuICAgIGxpc3RlbmVyczoge1xuICAgICAgZG93bjogJ19kb3duSGFuZGxlcicsXG4gICAgICB1cDogJ191cEhhbmRsZXInLFxuICAgICAgdGFwOiAnX3RhcEhhbmRsZXInXG4gICAgfSxcblxuICAgIG9ic2VydmVyczogW1xuICAgICAgJ19kZXRlY3RLZXlib2FyZEZvY3VzKGZvY3VzZWQpJ1xuICAgIF0sXG5cbiAgICBrZXlCaW5kaW5nczoge1xuICAgICAgJ2VudGVyOmtleWRvd24nOiAnX2FzeW5jQ2xpY2snLFxuICAgICAgJ3NwYWNlOmtleWRvd24nOiAnX3NwYWNlS2V5RG93bkhhbmRsZXInLFxuICAgICAgJ3NwYWNlOmtleXVwJzogJ19zcGFjZUtleVVwSGFuZGxlcicsXG4gICAgfSxcblxuICAgIF90YXBIYW5kbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnRvZ2dsZXMpIHtcbiAgICAgICAvLyBhIHRhcCBpcyBuZWVkZWQgdG8gdG9nZ2xlIHRoZSBhY3RpdmUgc3RhdGVcbiAgICAgICAgdGhpcy5fdXNlckFjdGl2YXRlKCF0aGlzLmFjdGl2ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfZGV0ZWN0S2V5Ym9hcmRGb2N1czogZnVuY3Rpb24oZm9jdXNlZCkge1xuICAgICAgdGhpcy5fc2V0UmVjZWl2ZWRGb2N1c0Zyb21LZXlib2FyZCghdGhpcy5wb2ludGVyRG93biAmJiBmb2N1c2VkKTtcbiAgICB9LFxuXG4gICAgLy8gdG8gZW11bGF0ZSBuYXRpdmUgY2hlY2tib3gsIChkZS0pYWN0aXZhdGlvbnMgZnJvbSBhIHVzZXIgaW50ZXJhY3Rpb24gZmlyZVxuICAgIC8vICdjaGFuZ2UnIGV2ZW50c1xuICAgIF91c2VyQWN0aXZhdGU6IGZ1bmN0aW9uKGFjdGl2ZSkge1xuICAgICAgdGhpcy5hY3RpdmUgPSBhY3RpdmU7XG4gICAgICB0aGlzLmZpcmUoJ2NoYW5nZScpO1xuICAgIH0sXG5cbiAgICBfZG93bkhhbmRsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fc2V0UG9pbnRlckRvd24odHJ1ZSk7XG4gICAgICB0aGlzLl9zZXRQcmVzc2VkKHRydWUpO1xuICAgICAgdGhpcy5fc2V0UmVjZWl2ZWRGb2N1c0Zyb21LZXlib2FyZChmYWxzZSk7XG4gICAgfSxcblxuICAgIF91cEhhbmRsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fc2V0UG9pbnRlckRvd24oZmFsc2UpO1xuICAgICAgdGhpcy5fc2V0UHJlc3NlZChmYWxzZSk7XG4gICAgfSxcblxuICAgIF9zcGFjZUtleURvd25IYW5kbGVyOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIGtleWJvYXJkRXZlbnQgPSBldmVudC5kZXRhaWwua2V5Ym9hcmRFdmVudDtcbiAgICAgIGtleWJvYXJkRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGtleWJvYXJkRXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICB0aGlzLl9zZXRQcmVzc2VkKHRydWUpO1xuICAgIH0sXG5cbiAgICBfc3BhY2VLZXlVcEhhbmRsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMucHJlc3NlZCkge1xuICAgICAgICB0aGlzLl9hc3luY0NsaWNrKCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9zZXRQcmVzc2VkKGZhbHNlKTtcbiAgICB9LFxuXG4gICAgLy8gdHJpZ2dlciBjbGljayBhc3luY2hyb25vdXNseSwgdGhlIGFzeW5jaHJvbnkgaXMgdXNlZnVsIHRvIGFsbG93IG9uZVxuICAgIC8vIGV2ZW50IGhhbmRsZXIgdG8gdW53aW5kIGJlZm9yZSB0cmlnZ2VyaW5nIGFub3RoZXIgZXZlbnRcbiAgICBfYXN5bmNDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmFzeW5jKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmNsaWNrKCk7XG4gICAgICB9LCAxKTtcbiAgICB9LFxuXG4gICAgLy8gYW55IG9mIHRoZXNlIGNoYW5nZXMgYXJlIGNvbnNpZGVyZWQgYSBjaGFuZ2UgdG8gYnV0dG9uIHN0YXRlXG5cbiAgICBfcHJlc3NlZENoYW5nZWQ6IGZ1bmN0aW9uKHByZXNzZWQpIHtcbiAgICAgIHRoaXMuX2NoYW5nZWRCdXR0b25TdGF0ZSgpO1xuICAgIH0sXG5cbiAgICBfYWN0aXZlQ2hhbmdlZDogZnVuY3Rpb24oYWN0aXZlKSB7XG4gICAgICBpZiAodGhpcy50b2dnbGVzKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCBhY3RpdmUgPyAndHJ1ZScgOiAnZmFsc2UnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdhcmlhLXByZXNzZWQnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NoYW5nZWRCdXR0b25TdGF0ZSgpO1xuICAgIH0sXG5cbiAgICBfY29udHJvbFN0YXRlQ2hhbmdlZDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgICB0aGlzLl9zZXRQcmVzc2VkKGZhbHNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2NoYW5nZWRCdXR0b25TdGF0ZSgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBwcm92aWRlIGhvb2sgZm9yIGZvbGxvdy1vbiBiZWhhdmlvcnMgdG8gcmVhY3QgdG8gYnV0dG9uLXN0YXRlXG5cbiAgICBfY2hhbmdlZEJ1dHRvblN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLl9idXR0b25TdGF0ZUNoYW5nZWQpIHtcbiAgICAgICAgdGhpcy5fYnV0dG9uU3RhdGVDaGFuZ2VkKCk7IC8vIGFic3RyYWN0XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgLyoqIEBwb2x5bWVyQmVoYXZpb3IgKi9cbiAgUG9seW1lci5Jcm9uQnV0dG9uU3RhdGUgPSBbXG4gICAgUG9seW1lci5Jcm9uQTExeUtleXNCZWhhdmlvcixcbiAgICBQb2x5bWVyLklyb25CdXR0b25TdGF0ZUltcGxcbiAgXTtcblxuXG59KSgpO1xuXG59KSIsInJlcXVpcmUoXCIuLi9wb2x5bWVyL3BvbHltZXIuaHRtbFwiKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZnVuY3Rpb24oKSB7XG47KGZ1bmN0aW9uKCkge1xuXG5cbiAgLyoqXG4gICAqIEBkZW1vIGRlbW8vaW5kZXguaHRtbFxuICAgKiBAcG9seW1lckJlaGF2aW9yXG4gICAqL1xuICBQb2x5bWVyLklyb25Db250cm9sU3RhdGUgPSB7XG5cbiAgICBwcm9wZXJ0aWVzOiB7XG5cbiAgICAgIC8qKlxuICAgICAgICogSWYgdHJ1ZSwgdGhlIGVsZW1lbnQgY3VycmVudGx5IGhhcyBmb2N1cy5cbiAgICAgICAqL1xuICAgICAgZm9jdXNlZDoge1xuICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICAgIG5vdGlmeTogdHJ1ZSxcbiAgICAgICAgcmVhZE9ubHk6IHRydWUsXG4gICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZTogdHJ1ZVxuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBJZiB0cnVlLCB0aGUgdXNlciBjYW5ub3QgaW50ZXJhY3Qgd2l0aCB0aGlzIGVsZW1lbnQuXG4gICAgICAgKi9cbiAgICAgIGRpc2FibGVkOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgICAgbm90aWZ5OiB0cnVlLFxuICAgICAgICBvYnNlcnZlcjogJ19kaXNhYmxlZENoYW5nZWQnLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWVcbiAgICAgIH0sXG5cbiAgICAgIF9vbGRUYWJJbmRleDoge1xuICAgICAgICB0eXBlOiBOdW1iZXJcbiAgICAgIH0sXG5cbiAgICAgIF9ib3VuZEZvY3VzQmx1ckhhbmRsZXI6IHtcbiAgICAgICAgdHlwZTogRnVuY3Rpb24sXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fZm9jdXNCbHVySGFuZGxlci5iaW5kKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgb2JzZXJ2ZXJzOiBbXG4gICAgICAnX2NoYW5nZWRDb250cm9sU3RhdGUoZm9jdXNlZCwgZGlzYWJsZWQpJ1xuICAgIF0sXG5cbiAgICByZWFkeTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBUT0RPKHNqbWlsZXMpOiBlbnN1cmUgcmVhZC1vbmx5IHByb3BlcnR5IGlzIHZhbHVlZCBzbyB0aGUgY29tcG91bmRcbiAgICAgIC8vIG9ic2VydmVyIHdpbGwgZmlyZVxuICAgICAgaWYgKHRoaXMuZm9jdXNlZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuX3NldEZvY3VzZWQoZmFsc2UpO1xuICAgICAgfVxuICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX2JvdW5kRm9jdXNCbHVySGFuZGxlciwgdHJ1ZSk7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCB0aGlzLl9ib3VuZEZvY3VzQmx1ckhhbmRsZXIsIHRydWUpO1xuICAgIH0sXG5cbiAgICBfZm9jdXNCbHVySGFuZGxlcjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciB0YXJnZXQgPSBldmVudC5wYXRoID8gZXZlbnQucGF0aFswXSA6IGV2ZW50LnRhcmdldDtcbiAgICAgIGlmICh0YXJnZXQgPT09IHRoaXMpIHtcbiAgICAgICAgdmFyIGZvY3VzZWQgPSBldmVudC50eXBlID09PSAnZm9jdXMnO1xuICAgICAgICB0aGlzLl9zZXRGb2N1c2VkKGZvY3VzZWQpO1xuICAgICAgfSBlbHNlIGlmICghdGhpcy5zaGFkb3dSb290KSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB0aGlzLmZpcmUoZXZlbnQudHlwZSwge3NvdXJjZUV2ZW50OiBldmVudH0sIHtcbiAgICAgICAgICBub2RlOiB0aGlzLFxuICAgICAgICAgIGJ1YmJsZXM6IGV2ZW50LmJ1YmJsZXMsXG4gICAgICAgICAgY2FuY2VsYWJsZTogZXZlbnQuY2FuY2VsYWJsZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2Rpc2FibGVkQ2hhbmdlZDogZnVuY3Rpb24oZGlzYWJsZWQsIG9sZCkge1xuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGlzYWJsZWQnLCBkaXNhYmxlZCA/ICd0cnVlJyA6ICdmYWxzZScpO1xuICAgICAgdGhpcy5zdHlsZS5wb2ludGVyRXZlbnRzID0gZGlzYWJsZWQgPyAnbm9uZScgOiAnJztcbiAgICAgIGlmIChkaXNhYmxlZCkge1xuICAgICAgICB0aGlzLl9vbGRUYWJJbmRleCA9IHRoaXMudGFiSW5kZXg7XG4gICAgICAgIHRoaXMuZm9jdXNlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnRhYkluZGV4ID0gLTE7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX29sZFRhYkluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy50YWJJbmRleCA9IHRoaXMuX29sZFRhYkluZGV4O1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfY2hhbmdlZENvbnRyb2xTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBfY29udHJvbFN0YXRlQ2hhbmdlZCBpcyBhYnN0cmFjdCwgZm9sbG93LW9uIGJlaGF2aW9ycyBtYXkgaW1wbGVtZW50IGl0XG4gICAgICBpZiAodGhpcy5fY29udHJvbFN0YXRlQ2hhbmdlZCkge1xuICAgICAgICB0aGlzLl9jb250cm9sU3RhdGVDaGFuZ2VkKCk7XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cblxufSkoKTtcblxufSkiLCJyZXF1aXJlKFwiLi4vcG9seW1lci9wb2x5bWVyLmh0bWxcIik7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGZ1bmN0aW9uKCkge1xudmFyIGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF07XG52YXIgcm9vdCA9IGJvZHkuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSk7XG5yb290LnNldEF0dHJpYnV0ZShcImhpZGRlblwiLFwiXCIpO1xucm9vdC5pbm5lckhUTUw9XCI8ZG9tLW1vZHVsZSBpZD1cXFwiaXJvbi1jb2xsYXBzZVxcXCI+PHN0eWxlPjpob3N0e2Rpc3BsYXk6YmxvY2s7dHJhbnNpdGlvbi1kdXJhdGlvbjozMDBtc306aG9zdCguaXJvbi1jb2xsYXBzZS1jbG9zZWQpe2Rpc3BsYXk6bm9uZX06aG9zdCg6bm90KC5pcm9uLWNvbGxhcHNlLW9wZW5lZCkpe292ZXJmbG93OmhpZGRlbn08L3N0eWxlPjx0ZW1wbGF0ZT5cXG5cXG4gICAgPGNvbnRlbnQ+PC9jb250ZW50PlxcblxcbiAgPC90ZW1wbGF0ZT48L2RvbS1tb2R1bGU+XCI7XG47KGZ1bmN0aW9uKCkge1xuXG5cbiAgUG9seW1lcih7XG5cbiAgICBpczogJ2lyb24tY29sbGFwc2UnLFxuXG4gICAgcHJvcGVydGllczoge1xuXG4gICAgICAvKipcbiAgICAgICAqIElmIHRydWUsIHRoZSBvcmllbnRhdGlvbiBpcyBob3Jpem9udGFsOyBvdGhlcndpc2UgaXMgdmVydGljYWwuXG4gICAgICAgKlxuICAgICAgICogQGF0dHJpYnV0ZSBob3Jpem9udGFsXG4gICAgICAgKi9cbiAgICAgIGhvcml6b250YWw6IHtcbiAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgdmFsdWU6IGZhbHNlLFxuICAgICAgICBvYnNlcnZlcjogJ19ob3Jpem9udGFsQ2hhbmdlZCdcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0IG9wZW5lZCB0byB0cnVlIHRvIHNob3cgdGhlIGNvbGxhcHNlIGVsZW1lbnQgYW5kIHRvIGZhbHNlIHRvIGhpZGUgaXQuXG4gICAgICAgKlxuICAgICAgICogQGF0dHJpYnV0ZSBvcGVuZWRcbiAgICAgICAqL1xuICAgICAgb3BlbmVkOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgICAgbm90aWZ5OiB0cnVlLFxuICAgICAgICBvYnNlcnZlcjogJ19vcGVuZWRDaGFuZ2VkJ1xuICAgICAgfVxuXG4gICAgfSxcblxuICAgIGhvc3RBdHRyaWJ1dGVzOiB7XG4gICAgICByb2xlOiAnZ3JvdXAnLFxuICAgICAgJ2FyaWEtZXhwYW5kZWQnOiAnZmFsc2UnXG4gICAgfSxcblxuICAgIGxpc3RlbmVyczoge1xuICAgICAgdHJhbnNpdGlvbmVuZDogJ190cmFuc2l0aW9uRW5kJ1xuICAgIH0sXG5cbiAgICByZWFkeTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBBdm9pZCB0cmFuc2l0aW9uIGF0IHRoZSBiZWdpbm5pbmcgZS5nLiBwYWdlIGxvYWRzIGFuZCBlbmFibGVcbiAgICAgIC8vIHRyYW5zaXRpb25zIG9ubHkgYWZ0ZXIgdGhlIGVsZW1lbnQgaXMgcmVuZGVyZWQgYW5kIHJlYWR5LlxuICAgICAgdGhpcy5fZW5hYmxlVHJhbnNpdGlvbiA9IHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSB0aGUgb3BlbmVkIHN0YXRlLlxuICAgICAqXG4gICAgICogQG1ldGhvZCB0b2dnbGVcbiAgICAgKi9cbiAgICB0b2dnbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5vcGVuZWQgPSAhdGhpcy5vcGVuZWQ7XG4gICAgfSxcblxuICAgIHNob3c6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy50b2dnbGVDbGFzcygnaXJvbi1jb2xsYXBzZS1jbG9zZWQnLCBmYWxzZSk7XG4gICAgICB0aGlzLnVwZGF0ZVNpemUoJ2F1dG8nLCBmYWxzZSk7XG4gICAgICB2YXIgcyA9IHRoaXMuX2NhbGNTaXplKCk7XG4gICAgICB0aGlzLnVwZGF0ZVNpemUoJzBweCcsIGZhbHNlKTtcbiAgICAgIC8vIGZvcmNlIGxheW91dCB0byBlbnN1cmUgdHJhbnNpdGlvbiB3aWxsIGdvXG4gICAgICB0aGlzLm9mZnNldEhlaWdodDtcbiAgICAgIHRoaXMudXBkYXRlU2l6ZShzLCB0cnVlKTtcbiAgICB9LFxuXG4gICAgaGlkZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnRvZ2dsZUNsYXNzKCdpcm9uLWNvbGxhcHNlLW9wZW5lZCcsIGZhbHNlKTtcbiAgICAgIHRoaXMudXBkYXRlU2l6ZSh0aGlzLl9jYWxjU2l6ZSgpLCBmYWxzZSk7XG4gICAgICAvLyBmb3JjZSBsYXlvdXQgdG8gZW5zdXJlIHRyYW5zaXRpb24gd2lsbCBnb1xuICAgICAgdGhpcy5vZmZzZXRIZWlnaHQ7XG4gICAgICB0aGlzLnVwZGF0ZVNpemUoJzBweCcsIHRydWUpO1xuICAgIH0sXG5cbiAgICB1cGRhdGVTaXplOiBmdW5jdGlvbihzaXplLCBhbmltYXRlZCkge1xuICAgICAgdGhpcy5lbmFibGVUcmFuc2l0aW9uKGFuaW1hdGVkKTtcbiAgICAgIHZhciBzID0gdGhpcy5zdHlsZTtcbiAgICAgIHZhciBub2NoYW5nZSA9IHNbdGhpcy5kaW1lbnNpb25dID09PSBzaXplO1xuICAgICAgc1t0aGlzLmRpbWVuc2lvbl0gPSBzaXplO1xuICAgICAgaWYgKGFuaW1hdGVkICYmIG5vY2hhbmdlKSB7XG4gICAgICAgIHRoaXMuX3RyYW5zaXRpb25FbmQoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZW5hYmxlVHJhbnNpdGlvbjogZnVuY3Rpb24oZW5hYmxlZCkge1xuICAgICAgdGhpcy5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAoZW5hYmxlZCAmJiB0aGlzLl9lbmFibGVUcmFuc2l0aW9uKSA/ICcnIDogJzBzJztcbiAgICB9LFxuXG4gICAgX2hvcml6b250YWxDaGFuZ2VkOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZGltZW5zaW9uID0gdGhpcy5ob3Jpem9udGFsID8gJ3dpZHRoJyA6ICdoZWlnaHQnO1xuICAgICAgdGhpcy5zdHlsZS50cmFuc2l0aW9uUHJvcGVydHkgPSB0aGlzLmRpbWVuc2lvbjtcbiAgICB9LFxuXG4gICAgX29wZW5lZENoYW5nZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpc1t0aGlzLm9wZW5lZCA/ICdzaG93JyA6ICdoaWRlJ10oKTtcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgdGhpcy5vcGVuZWQgPyAndHJ1ZScgOiAnZmFsc2UnKTtcblxuICAgIH0sXG5cbiAgICBfdHJhbnNpdGlvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5vcGVuZWQpIHtcbiAgICAgICAgdGhpcy51cGRhdGVTaXplKCdhdXRvJywgZmFsc2UpO1xuICAgICAgfVxuICAgICAgdGhpcy50b2dnbGVDbGFzcygnaXJvbi1jb2xsYXBzZS1jbG9zZWQnLCAhdGhpcy5vcGVuZWQpO1xuICAgICAgdGhpcy50b2dnbGVDbGFzcygnaXJvbi1jb2xsYXBzZS1vcGVuZWQnLCB0aGlzLm9wZW5lZCk7XG4gICAgICB0aGlzLmVuYWJsZVRyYW5zaXRpb24oZmFsc2UpO1xuICAgIH0sXG5cbiAgICBfY2FsY1NpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClbdGhpcy5kaW1lbnNpb25dICsgJ3B4JztcbiAgICB9LFxuXG5cbiAgfSk7XG5cblxufSkoKTtcblxufSkiLCJyZXF1aXJlKFwiLi4vcG9seW1lci9wb2x5bWVyLmh0bWxcIik7XG5yZXF1aXJlKFwiLi4vaXJvbi1iZWhhdmlvcnMvaXJvbi1idXR0b24tc3RhdGUuaHRtbFwiKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZnVuY3Rpb24oKSB7XG47KGZ1bmN0aW9uKCkge1xuXG5cbiAgLyoqIEBwb2x5bWVyQmVoYXZpb3IgKi9cbiAgUG9seW1lci5QYXBlckJ1dHRvbkJlaGF2aW9ySW1wbCA9IHtcblxuICAgIHByb3BlcnRpZXM6IHtcblxuICAgICAgX2VsZXZhdGlvbjoge1xuICAgICAgICB0eXBlOiBOdW1iZXJcbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICBvYnNlcnZlcnM6IFtcbiAgICAgICdfY2FsY3VsYXRlRWxldmF0aW9uKGZvY3VzZWQsIGRpc2FibGVkLCBhY3RpdmUsIHByZXNzZWQsIHJlY2VpdmVkRm9jdXNGcm9tS2V5Ym9hcmQpJ1xuICAgIF0sXG5cbiAgICBob3N0QXR0cmlidXRlczoge1xuICAgICAgcm9sZTogJ2J1dHRvbicsXG4gICAgICB0YWJpbmRleDogJzAnXG4gICAgfSxcblxuICAgIF9jYWxjdWxhdGVFbGV2YXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGUgPSAxO1xuICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgICAgZSA9IDA7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuYWN0aXZlIHx8IHRoaXMucHJlc3NlZCkge1xuICAgICAgICBlID0gNDtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5yZWNlaXZlZEZvY3VzRnJvbUtleWJvYXJkKSB7XG4gICAgICAgIGUgPSAzO1xuICAgICAgfVxuICAgICAgdGhpcy5fZWxldmF0aW9uID0gZTtcbiAgICB9XG4gIH07XG5cbiAgLyoqIEBwb2x5bWVyQmVoYXZpb3IgKi9cbiAgUG9seW1lci5QYXBlckJ1dHRvbkJlaGF2aW9yID0gW1xuICAgIFBvbHltZXIuSXJvbkJ1dHRvblN0YXRlLFxuICAgIFBvbHltZXIuSXJvbkNvbnRyb2xTdGF0ZSxcbiAgICBQb2x5bWVyLlBhcGVyQnV0dG9uQmVoYXZpb3JJbXBsXG4gIF07XG5cblxufSkoKTtcblxufSkiLCJyZXF1aXJlKFwiLi4vcG9seW1lci9wb2x5bWVyLmh0bWxcIik7XG5yZXF1aXJlKFwiLi4vcGFwZXItbWF0ZXJpYWwvcGFwZXItbWF0ZXJpYWwuaHRtbFwiKTtcbnJlcXVpcmUoXCIuLi9wYXBlci1yaXBwbGUvcGFwZXItcmlwcGxlLmh0bWxcIik7XG5yZXF1aXJlKFwiLi4vcGFwZXItYmVoYXZpb3JzL3BhcGVyLWJ1dHRvbi1iZWhhdmlvci5odG1sXCIpO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixmdW5jdGlvbigpIHtcbnZhciBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdO1xudmFyIHJvb3QgPSBib2R5LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikpO1xucm9vdC5zZXRBdHRyaWJ1dGUoXCJoaWRkZW5cIixcIlwiKTtcbnJvb3QuaW5uZXJIVE1MPVwiPGRvbS1tb2R1bGUgaWQ9XFxcInBhcGVyLWJ1dHRvblxcXCI+PHN0eWxlPjpob3N0e2Rpc3BsYXk6aW5saW5lLWJsb2NrO3Bvc2l0aW9uOnJlbGF0aXZlO2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4td2lkdGg6NS4xNGVtO21hcmdpbjowIC4yOWVtO2JhY2tncm91bmQ6MCAwO3RleHQtYWxpZ246Y2VudGVyO2ZvbnQ6aW5oZXJpdDt0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2U7b3V0bGluZTowO2JvcmRlci1yYWRpdXM6M3B4Oy1tb3otdXNlci1zZWxlY3Q6bm9uZTstbXMtdXNlci1zZWxlY3Q6bm9uZTstd2Via2l0LXVzZXItc2VsZWN0Om5vbmU7dXNlci1zZWxlY3Q6bm9uZTtjdXJzb3I6cG9pbnRlcjt6LWluZGV4OjA7QGFwcGx5KC0tcGFwZXItYnV0dG9uKX0ua2V5Ym9hcmQtZm9jdXN7Zm9udC13ZWlnaHQ6NzAwfTpob3N0KFtkaXNhYmxlZF0pe2JhY2tncm91bmQ6I2VhZWFlYTtjb2xvcjojYThhOGE4O2N1cnNvcjphdXRvO3BvaW50ZXItZXZlbnRzOm5vbmU7QGFwcGx5KC0tcGFwZXItYnV0dG9uLWRpc2FibGVkKX06aG9zdChbbm9pbmtdKSBwYXBlci1yaXBwbGV7ZGlzcGxheTpub25lfXBhcGVyLW1hdGVyaWFse2JvcmRlci1yYWRpdXM6aW5oZXJpdH0uY29udGVudD46OmNvbnRlbnQgKnt0ZXh0LXRyYW5zZm9ybTppbmhlcml0fS5jb250ZW50e3BhZGRpbmc6LjdlbSAuNTdlbX08L3N0eWxlPjx0ZW1wbGF0ZT5cXG5cXG4gICAgPHBhcGVyLXJpcHBsZT48L3BhcGVyLXJpcHBsZT5cXG5cXG4gICAgPHBhcGVyLW1hdGVyaWFsIGNsYXNzJD1cXFwiW1tfY29tcHV0ZUNvbnRlbnRDbGFzcyhyZWNlaXZlZEZvY3VzRnJvbUtleWJvYXJkKV1dXFxcIiBlbGV2YXRpb249XFxcIltbX2VsZXZhdGlvbl1dXFxcIiBhbmltYXRlZD1cXFwiXFxcIj5cXG4gICAgICA8Y29udGVudD48L2NvbnRlbnQ+XFxuICAgIDwvcGFwZXItbWF0ZXJpYWw+XFxuXFxuICA8L3RlbXBsYXRlPjwvZG9tLW1vZHVsZT5cIjtcbjsoZnVuY3Rpb24oKSB7XG5cblxuICBQb2x5bWVyKHtcblxuICAgIGlzOiAncGFwZXItYnV0dG9uJyxcblxuICAgIGJlaGF2aW9yczogW1xuICAgICAgUG9seW1lci5QYXBlckJ1dHRvbkJlaGF2aW9yXG4gICAgXSxcblxuICAgIHByb3BlcnRpZXM6IHtcblxuICAgICAgLyoqXG4gICAgICAgKiBJZiB0cnVlLCB0aGUgYnV0dG9uIHNob3VsZCBiZSBzdHlsZWQgd2l0aCBhIHNoYWRvdy5cbiAgICAgICAqL1xuICAgICAgcmFpc2VkOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IGZhbHNlLFxuICAgICAgICBvYnNlcnZlcjogJ19jYWxjdWxhdGVFbGV2YXRpb24nXG4gICAgICB9XG4gICAgfSxcblxuICAgIF9jYWxjdWxhdGVFbGV2YXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLnJhaXNlZCkge1xuICAgICAgICB0aGlzLl9lbGV2YXRpb24gPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgUG9seW1lci5QYXBlckJ1dHRvbkJlaGF2aW9ySW1wbC5fY2FsY3VsYXRlRWxldmF0aW9uLmFwcGx5KHRoaXMpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfY29tcHV0ZUNvbnRlbnRDbGFzczogZnVuY3Rpb24ocmVjZWl2ZWRGb2N1c0Zyb21LZXlib2FyZCkge1xuICAgICAgdmFyIGNsYXNzTmFtZSA9ICdjb250ZW50ICc7XG4gICAgICBpZiAocmVjZWl2ZWRGb2N1c0Zyb21LZXlib2FyZCkge1xuICAgICAgICBjbGFzc05hbWUgKz0gJyBrZXlib2FyZC1mb2N1cyc7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2xhc3NOYW1lO1xuICAgIH1cbiAgfSk7XG5cblxufSkoKTtcblxufSkiLCJyZXF1aXJlKFwiLi4vcG9seW1lci9wb2x5bWVyLmh0bWxcIik7XG5yZXF1aXJlKFwiLi4vcGFwZXItc3R5bGVzL3NoYWRvdy5odG1sXCIpO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixmdW5jdGlvbigpIHtcbnZhciBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdO1xudmFyIHJvb3QgPSBib2R5LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikpO1xucm9vdC5zZXRBdHRyaWJ1dGUoXCJoaWRkZW5cIixcIlwiKTtcbnJvb3QuaW5uZXJIVE1MPVwiPGRvbS1tb2R1bGUgaWQ9XFxcInBhcGVyLW1hdGVyaWFsXFxcIj48c3R5bGU+Omhvc3R7ZGlzcGxheTpibG9jaztwb3NpdGlvbjpyZWxhdGl2ZTtAYXBwbHkoLS1zaGFkb3ctdHJhbnNpdGlvbil9Omhvc3QoW2VsZXZhdGlvbj1cXFwiMVxcXCJdKXtAYXBwbHkoLS1zaGFkb3ctZWxldmF0aW9uLTJkcCl9Omhvc3QoW2VsZXZhdGlvbj1cXFwiMlxcXCJdKXtAYXBwbHkoLS1zaGFkb3ctZWxldmF0aW9uLTRkcCl9Omhvc3QoW2VsZXZhdGlvbj1cXFwiM1xcXCJdKXtAYXBwbHkoLS1zaGFkb3ctZWxldmF0aW9uLTZkcCl9Omhvc3QoW2VsZXZhdGlvbj1cXFwiNFxcXCJdKXtAYXBwbHkoLS1zaGFkb3ctZWxldmF0aW9uLThkcCl9Omhvc3QoW2VsZXZhdGlvbj1cXFwiNVxcXCJdKXtAYXBwbHkoLS1zaGFkb3ctZWxldmF0aW9uLTE2ZHApfTwvc3R5bGU+PHRlbXBsYXRlPlxcbiAgICA8Y29udGVudD48L2NvbnRlbnQ+XFxuICA8L3RlbXBsYXRlPjwvZG9tLW1vZHVsZT5cIjtcbjsoZnVuY3Rpb24oKSB7XG5cbiAgUG9seW1lcih7XG4gICAgaXM6ICdwYXBlci1tYXRlcmlhbCcsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIHotZGVwdGggb2YgdGhpcyBlbGVtZW50LCBmcm9tIDAtNS4gU2V0dGluZyB0byAwIHdpbGwgcmVtb3ZlIHRoZVxuICAgICAgICogc2hhZG93LCBhbmQgZWFjaCBpbmNyZWFzaW5nIG51bWJlciBncmVhdGVyIHRoYW4gMCB3aWxsIGJlIFwiZGVlcGVyXCJcbiAgICAgICAqIHRoYW4gdGhlIGxhc3QuXG4gICAgICAgKlxuICAgICAgICogQGF0dHJpYnV0ZSBlbGV2YXRpb25cbiAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICogQGRlZmF1bHQgMVxuICAgICAgICovXG4gICAgICBlbGV2YXRpb246IHtcbiAgICAgICAgdHlwZTogTnVtYmVyLFxuICAgICAgICByZWZsZWN0VG9BdHRyaWJ1dGU6IHRydWUsXG4gICAgICAgIHZhbHVlOiAxXG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIFNldCB0aGlzIHRvIHRydWUgdG8gYW5pbWF0ZSB0aGUgc2hhZG93IHdoZW4gc2V0dGluZyBhIG5ld1xuICAgICAgICogYGVsZXZhdGlvbmAgdmFsdWUuXG4gICAgICAgKlxuICAgICAgICogQGF0dHJpYnV0ZSBhbmltYXRlZFxuICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAqL1xuICAgICAgYW5pbWF0ZWQ6IHtcbiAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgcmVmbGVjdFRvQXR0cmlidXRlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG59KSgpO1xuXG59KSIsInJlcXVpcmUoXCIuLi9wb2x5bWVyL3BvbHltZXIuaHRtbFwiKTtcbnJlcXVpcmUoXCIuLi9pcm9uLWExMXkta2V5cy1iZWhhdmlvci9pcm9uLWExMXkta2V5cy1iZWhhdmlvci5odG1sXCIpO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixmdW5jdGlvbigpIHtcbnZhciBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdO1xudmFyIHJvb3QgPSBib2R5LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikpO1xucm9vdC5zZXRBdHRyaWJ1dGUoXCJoaWRkZW5cIixcIlwiKTtcbnJvb3QuaW5uZXJIVE1MPVwiPGRvbS1tb2R1bGUgaWQ9XFxcInBhcGVyLXJpcHBsZVxcXCI+PHN0eWxlPjpob3N0e2Rpc3BsYXk6YmxvY2s7cG9zaXRpb246YWJzb2x1dGU7Ym9yZGVyLXJhZGl1czppbmhlcml0O292ZXJmbG93OmhpZGRlbjt0b3A6MDtsZWZ0OjA7cmlnaHQ6MDtib3R0b206MH06aG9zdChbYW5pbWF0aW5nXSl7LXdlYmtpdC10cmFuc2Zvcm06dHJhbnNsYXRlKDAsMCk7dHJhbnNmb3JtOnRyYW5zbGF0ZTNkKDAsMCwwKX06aG9zdChbbm9pbmtdKXtwb2ludGVyLWV2ZW50czpub25lfSNiYWNrZ3JvdW5kLCN3YXZlcywud2F2ZS1jb250YWluZXIsLndhdmV7cG9pbnRlci1ldmVudHM6bm9uZTtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtsZWZ0OjA7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJX0jYmFja2dyb3VuZCwud2F2ZXtvcGFjaXR5OjB9I3dhdmVzLC53YXZle292ZXJmbG93OmhpZGRlbn0ud2F2ZS1jb250YWluZXIsLndhdmV7Ym9yZGVyLXJhZGl1czo1MCV9Omhvc3QoLmNpcmNsZSkgI2JhY2tncm91bmQsOmhvc3QoLmNpcmNsZSkgI3dhdmVze2JvcmRlci1yYWRpdXM6NTAlfTpob3N0KC5jaXJjbGUpIC53YXZlLWNvbnRhaW5lcntvdmVyZmxvdzpoaWRkZW59PC9zdHlsZT48dGVtcGxhdGU+XFxuICAgIDxkaXYgaWQ9XFxcImJhY2tncm91bmRcXFwiPjwvZGl2PlxcbiAgICA8ZGl2IGlkPVxcXCJ3YXZlc1xcXCI+PC9kaXY+XFxuICA8L3RlbXBsYXRlPjwvZG9tLW1vZHVsZT5cIjtcbjsoZnVuY3Rpb24oKSB7XG5cbiAgKGZ1bmN0aW9uKCkge1xuICAgIHZhciBVdGlsaXR5ID0ge1xuICAgICAgY3NzQ29sb3JXaXRoQWxwaGE6IGZ1bmN0aW9uKGNzc0NvbG9yLCBhbHBoYSkge1xuICAgICAgICB2YXIgcGFydHMgPSBjc3NDb2xvci5tYXRjaCgvXnJnYlxcKChcXGQrKSxcXHMqKFxcZCspLFxccyooXFxkKylcXCkkLyk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBhbHBoYSA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGFscGhhID0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFydHMpIHtcbiAgICAgICAgICByZXR1cm4gJ3JnYmEoMjU1LCAyNTUsIDI1NSwgJyArIGFscGhhICsgJyknO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICdyZ2JhKCcgKyBwYXJ0c1sxXSArICcsICcgKyBwYXJ0c1syXSArICcsICcgKyBwYXJ0c1szXSArICcsICcgKyBhbHBoYSArICcpJztcbiAgICAgIH0sXG5cbiAgICAgIGRpc3RhbmNlOiBmdW5jdGlvbih4MSwgeTEsIHgyLCB5Mikge1xuICAgICAgICB2YXIgeERlbHRhID0gKHgxIC0geDIpO1xuICAgICAgICB2YXIgeURlbHRhID0gKHkxIC0geTIpO1xuXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoeERlbHRhICogeERlbHRhICsgeURlbHRhICogeURlbHRhKTtcbiAgICAgIH0sXG5cbiAgICAgIG5vdzogKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAod2luZG93LnBlcmZvcm1hbmNlICYmIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3cpIHtcbiAgICAgICAgICByZXR1cm4gd2luZG93LnBlcmZvcm1hbmNlLm5vdy5iaW5kKHdpbmRvdy5wZXJmb3JtYW5jZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gRGF0ZS5ub3c7XG4gICAgICB9KSgpXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBFbGVtZW50TWV0cmljcyhlbGVtZW50KSB7XG4gICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgdGhpcy53aWR0aCA9IHRoaXMuYm91bmRpbmdSZWN0LndpZHRoO1xuICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmJvdW5kaW5nUmVjdC5oZWlnaHQ7XG5cbiAgICAgIHRoaXMuc2l6ZSA9IE1hdGgubWF4KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICB9XG5cbiAgICBFbGVtZW50TWV0cmljcy5wcm90b3R5cGUgPSB7XG4gICAgICBnZXQgYm91bmRpbmdSZWN0ICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIH0sXG5cbiAgICAgIGZ1cnRoZXN0Q29ybmVyRGlzdGFuY2VGcm9tOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHZhciB0b3BMZWZ0ID0gVXRpbGl0eS5kaXN0YW5jZSh4LCB5LCAwLCAwKTtcbiAgICAgICAgdmFyIHRvcFJpZ2h0ID0gVXRpbGl0eS5kaXN0YW5jZSh4LCB5LCB0aGlzLndpZHRoLCAwKTtcbiAgICAgICAgdmFyIGJvdHRvbUxlZnQgPSBVdGlsaXR5LmRpc3RhbmNlKHgsIHksIDAsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgdmFyIGJvdHRvbVJpZ2h0ID0gVXRpbGl0eS5kaXN0YW5jZSh4LCB5LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KHRvcExlZnQsIHRvcFJpZ2h0LCBib3R0b21MZWZ0LCBib3R0b21SaWdodCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBSaXBwbGUoZWxlbWVudCkge1xuICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAgIHRoaXMuY29sb3IgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KS5jb2xvcjtcblxuICAgICAgdGhpcy53YXZlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB0aGlzLndhdmVDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHRoaXMud2F2ZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLmNvbG9yO1xuICAgICAgdGhpcy53YXZlLmNsYXNzTGlzdC5hZGQoJ3dhdmUnKTtcbiAgICAgIHRoaXMud2F2ZUNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCd3YXZlLWNvbnRhaW5lcicpO1xuICAgICAgUG9seW1lci5kb20odGhpcy53YXZlQ29udGFpbmVyKS5hcHBlbmRDaGlsZCh0aGlzLndhdmUpO1xuXG4gICAgICB0aGlzLnJlc2V0SW50ZXJhY3Rpb25TdGF0ZSgpO1xuICAgIH1cblxuICAgIFJpcHBsZS5NQVhfUkFESVVTID0gMzAwO1xuXG4gICAgUmlwcGxlLnByb3RvdHlwZSA9IHtcbiAgICAgIGdldCByZWNlbnRlcnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQucmVjZW50ZXJzO1xuICAgICAgfSxcblxuICAgICAgZ2V0IGNlbnRlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5jZW50ZXI7XG4gICAgICB9LFxuXG4gICAgICBnZXQgbW91c2VEb3duRWxhcHNlZCgpIHtcbiAgICAgICAgdmFyIGVsYXBzZWQ7XG5cbiAgICAgICAgaWYgKCF0aGlzLm1vdXNlRG93blN0YXJ0KSB7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cblxuICAgICAgICBlbGFwc2VkID0gVXRpbGl0eS5ub3coKSAtIHRoaXMubW91c2VEb3duU3RhcnQ7XG5cbiAgICAgICAgaWYgKHRoaXMubW91c2VVcFN0YXJ0KSB7XG4gICAgICAgICAgZWxhcHNlZCAtPSB0aGlzLm1vdXNlVXBFbGFwc2VkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVsYXBzZWQ7XG4gICAgICB9LFxuXG4gICAgICBnZXQgbW91c2VVcEVsYXBzZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vdXNlVXBTdGFydCA/XG4gICAgICAgICAgVXRpbGl0eS5ub3cgKCkgLSB0aGlzLm1vdXNlVXBTdGFydCA6IDA7XG4gICAgICB9LFxuXG4gICAgICBnZXQgbW91c2VEb3duRWxhcHNlZFNlY29uZHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vdXNlRG93bkVsYXBzZWQgLyAxMDAwO1xuICAgICAgfSxcblxuICAgICAgZ2V0IG1vdXNlVXBFbGFwc2VkU2Vjb25kcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2VVcEVsYXBzZWQgLyAxMDAwO1xuICAgICAgfSxcblxuICAgICAgZ2V0IG1vdXNlSW50ZXJhY3Rpb25TZWNvbmRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZURvd25FbGFwc2VkU2Vjb25kcyArIHRoaXMubW91c2VVcEVsYXBzZWRTZWNvbmRzO1xuICAgICAgfSxcblxuICAgICAgZ2V0IGluaXRpYWxPcGFjaXR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmluaXRpYWxPcGFjaXR5O1xuICAgICAgfSxcblxuICAgICAgZ2V0IG9wYWNpdHlEZWNheVZlbG9jaXR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50Lm9wYWNpdHlEZWNheVZlbG9jaXR5O1xuICAgICAgfSxcblxuICAgICAgZ2V0IHJhZGl1cygpIHtcbiAgICAgICAgdmFyIHdpZHRoMiA9IHRoaXMuY29udGFpbmVyTWV0cmljcy53aWR0aCAqIHRoaXMuY29udGFpbmVyTWV0cmljcy53aWR0aDtcbiAgICAgICAgdmFyIGhlaWdodDIgPSB0aGlzLmNvbnRhaW5lck1ldHJpY3MuaGVpZ2h0ICogdGhpcy5jb250YWluZXJNZXRyaWNzLmhlaWdodDtcbiAgICAgICAgdmFyIHdhdmVSYWRpdXMgPSBNYXRoLm1pbihcbiAgICAgICAgICBNYXRoLnNxcnQod2lkdGgyICsgaGVpZ2h0MiksXG4gICAgICAgICAgUmlwcGxlLk1BWF9SQURJVVNcbiAgICAgICAgKSAqIDEuMSArIDU7XG5cbiAgICAgICAgdmFyIGR1cmF0aW9uID0gMS4xIC0gMC4yICogKHdhdmVSYWRpdXMgLyBSaXBwbGUuTUFYX1JBRElVUyk7XG4gICAgICAgIHZhciB0aW1lTm93ID0gdGhpcy5tb3VzZUludGVyYWN0aW9uU2Vjb25kcyAvIGR1cmF0aW9uO1xuICAgICAgICB2YXIgc2l6ZSA9IHdhdmVSYWRpdXMgKiAoMSAtIE1hdGgucG93KDgwLCAtdGltZU5vdykpO1xuXG4gICAgICAgIHJldHVybiBNYXRoLmFicyhzaXplKTtcbiAgICAgIH0sXG5cbiAgICAgIGdldCBvcGFjaXR5KCkge1xuICAgICAgICBpZiAoIXRoaXMubW91c2VVcFN0YXJ0KSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaW5pdGlhbE9wYWNpdHk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoXG4gICAgICAgICAgMCxcbiAgICAgICAgICB0aGlzLmluaXRpYWxPcGFjaXR5IC0gdGhpcy5tb3VzZVVwRWxhcHNlZFNlY29uZHMgKiB0aGlzLm9wYWNpdHlEZWNheVZlbG9jaXR5XG4gICAgICAgICk7XG4gICAgICB9LFxuXG4gICAgICBnZXQgb3V0ZXJPcGFjaXR5KCkge1xuICAgICAgICAvLyBMaW5lYXIgaW5jcmVhc2UgaW4gYmFja2dyb3VuZCBvcGFjaXR5LCBjYXBwZWQgYXQgdGhlIG9wYWNpdHlcbiAgICAgICAgLy8gb2YgdGhlIHdhdmVmcm9udCAod2F2ZU9wYWNpdHkpLlxuICAgICAgICB2YXIgb3V0ZXJPcGFjaXR5ID0gdGhpcy5tb3VzZVVwRWxhcHNlZFNlY29uZHMgKiAwLjM7XG4gICAgICAgIHZhciB3YXZlT3BhY2l0eSA9IHRoaXMub3BhY2l0eTtcblxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoXG4gICAgICAgICAgMCxcbiAgICAgICAgICBNYXRoLm1pbihvdXRlck9wYWNpdHksIHdhdmVPcGFjaXR5KVxuICAgICAgICApO1xuICAgICAgfSxcblxuICAgICAgZ2V0IGlzT3BhY2l0eUZ1bGx5RGVjYXllZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3BhY2l0eSA8IDAuMDEgJiZcbiAgICAgICAgICB0aGlzLnJhZGl1cyA+PSBNYXRoLm1pbih0aGlzLm1heFJhZGl1cywgUmlwcGxlLk1BWF9SQURJVVMpO1xuICAgICAgfSxcblxuICAgICAgZ2V0IGlzUmVzdGluZ0F0TWF4UmFkaXVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcGFjaXR5ID49IHRoaXMuaW5pdGlhbE9wYWNpdHkgJiZcbiAgICAgICAgICB0aGlzLnJhZGl1cyA+PSBNYXRoLm1pbih0aGlzLm1heFJhZGl1cywgUmlwcGxlLk1BWF9SQURJVVMpO1xuICAgICAgfSxcblxuICAgICAgZ2V0IGlzQW5pbWF0aW9uQ29tcGxldGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vdXNlVXBTdGFydCA/XG4gICAgICAgICAgdGhpcy5pc09wYWNpdHlGdWxseURlY2F5ZWQgOiB0aGlzLmlzUmVzdGluZ0F0TWF4UmFkaXVzO1xuICAgICAgfSxcblxuICAgICAgZ2V0IHRyYW5zbGF0aW9uRnJhY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1pbihcbiAgICAgICAgICAxLFxuICAgICAgICAgIHRoaXMucmFkaXVzIC8gdGhpcy5jb250YWluZXJNZXRyaWNzLnNpemUgKiAyIC8gTWF0aC5zcXJ0KDIpXG4gICAgICAgICk7XG4gICAgICB9LFxuXG4gICAgICBnZXQgeE5vdygpIHtcbiAgICAgICAgaWYgKHRoaXMueEVuZCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnhTdGFydCArIHRoaXMudHJhbnNsYXRpb25GcmFjdGlvbiAqICh0aGlzLnhFbmQgLSB0aGlzLnhTdGFydCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy54U3RhcnQ7XG4gICAgICB9LFxuXG4gICAgICBnZXQgeU5vdygpIHtcbiAgICAgICAgaWYgKHRoaXMueUVuZCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnlTdGFydCArIHRoaXMudHJhbnNsYXRpb25GcmFjdGlvbiAqICh0aGlzLnlFbmQgLSB0aGlzLnlTdGFydCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy55U3RhcnQ7XG4gICAgICB9LFxuXG4gICAgICBnZXQgaXNNb3VzZURvd24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vdXNlRG93blN0YXJ0ICYmICF0aGlzLm1vdXNlVXBTdGFydDtcbiAgICAgIH0sXG5cbiAgICAgIHJlc2V0SW50ZXJhY3Rpb25TdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMubWF4UmFkaXVzID0gMDtcbiAgICAgICAgdGhpcy5tb3VzZURvd25TdGFydCA9IDA7XG4gICAgICAgIHRoaXMubW91c2VVcFN0YXJ0ID0gMDtcblxuICAgICAgICB0aGlzLnhTdGFydCA9IDA7XG4gICAgICAgIHRoaXMueVN0YXJ0ID0gMDtcbiAgICAgICAgdGhpcy54RW5kID0gMDtcbiAgICAgICAgdGhpcy55RW5kID0gMDtcbiAgICAgICAgdGhpcy5zbGlkZURpc3RhbmNlID0gMDtcblxuICAgICAgICB0aGlzLmNvbnRhaW5lck1ldHJpY3MgPSBuZXcgRWxlbWVudE1ldHJpY3ModGhpcy5lbGVtZW50KTtcbiAgICAgIH0sXG5cbiAgICAgIGRyYXc6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2NhbGU7XG4gICAgICAgIHZhciB0cmFuc2xhdGVTdHJpbmc7XG4gICAgICAgIHZhciBkeDtcbiAgICAgICAgdmFyIGR5O1xuXG4gICAgICAgIHRoaXMud2F2ZS5zdHlsZS5vcGFjaXR5ID0gdGhpcy5vcGFjaXR5O1xuXG4gICAgICAgIHNjYWxlID0gdGhpcy5yYWRpdXMgLyAodGhpcy5jb250YWluZXJNZXRyaWNzLnNpemUgLyAyKTtcbiAgICAgICAgZHggPSB0aGlzLnhOb3cgLSAodGhpcy5jb250YWluZXJNZXRyaWNzLndpZHRoIC8gMik7XG4gICAgICAgIGR5ID0gdGhpcy55Tm93IC0gKHRoaXMuY29udGFpbmVyTWV0cmljcy5oZWlnaHQgLyAyKTtcblxuXG4gICAgICAgIC8vIDJkIHRyYW5zZm9ybSBmb3Igc2FmYXJpIGJlY2F1c2Ugb2YgYm9yZGVyLXJhZGl1cyBhbmQgb3ZlcmZsb3c6aGlkZGVuIGNsaXBwaW5nIGJ1Zy5cbiAgICAgICAgLy8gaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTk4NTM4XG4gICAgICAgIHRoaXMud2F2ZUNvbnRhaW5lci5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyBkeCArICdweCwgJyArIGR5ICsgJ3B4KSc7XG4gICAgICAgIHRoaXMud2F2ZUNvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoJyArIGR4ICsgJ3B4LCAnICsgZHkgKyAncHgsIDApJztcbiAgICAgICAgdGhpcy53YXZlLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICdzY2FsZSgnICsgc2NhbGUgKyAnLCcgKyBzY2FsZSArICcpJztcbiAgICAgICAgdGhpcy53YXZlLnN0eWxlLnRyYW5zZm9ybSA9ICdzY2FsZTNkKCcgKyBzY2FsZSArICcsJyArIHNjYWxlICsgJywxKSc7XG4gICAgICB9LFxuXG4gICAgICAvKiogQHBhcmFtIHtFdmVudD19IGV2ZW50ICovXG4gICAgICBkb3duQWN0aW9uOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgeENlbnRlciA9IHRoaXMuY29udGFpbmVyTWV0cmljcy53aWR0aCAvIDI7XG4gICAgICAgIHZhciB5Q2VudGVyID0gdGhpcy5jb250YWluZXJNZXRyaWNzLmhlaWdodCAvIDI7XG5cbiAgICAgICAgdGhpcy5yZXNldEludGVyYWN0aW9uU3RhdGUoKTtcbiAgICAgICAgdGhpcy5tb3VzZURvd25TdGFydCA9IFV0aWxpdHkubm93KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuY2VudGVyKSB7XG4gICAgICAgICAgdGhpcy54U3RhcnQgPSB4Q2VudGVyO1xuICAgICAgICAgIHRoaXMueVN0YXJ0ID0geUNlbnRlcjtcbiAgICAgICAgICB0aGlzLnNsaWRlRGlzdGFuY2UgPSBVdGlsaXR5LmRpc3RhbmNlKFxuICAgICAgICAgICAgdGhpcy54U3RhcnQsIHRoaXMueVN0YXJ0LCB0aGlzLnhFbmQsIHRoaXMueUVuZFxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy54U3RhcnQgPSBldmVudCA/XG4gICAgICAgICAgICAgIGV2ZW50LmRldGFpbC54IC0gdGhpcy5jb250YWluZXJNZXRyaWNzLmJvdW5kaW5nUmVjdC5sZWZ0IDpcbiAgICAgICAgICAgICAgdGhpcy5jb250YWluZXJNZXRyaWNzLndpZHRoIC8gMjtcbiAgICAgICAgICB0aGlzLnlTdGFydCA9IGV2ZW50ID9cbiAgICAgICAgICAgICAgZXZlbnQuZGV0YWlsLnkgLSB0aGlzLmNvbnRhaW5lck1ldHJpY3MuYm91bmRpbmdSZWN0LnRvcCA6XG4gICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyTWV0cmljcy5oZWlnaHQgLyAyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucmVjZW50ZXJzKSB7XG4gICAgICAgICAgdGhpcy54RW5kID0geENlbnRlcjtcbiAgICAgICAgICB0aGlzLnlFbmQgPSB5Q2VudGVyO1xuICAgICAgICAgIHRoaXMuc2xpZGVEaXN0YW5jZSA9IFV0aWxpdHkuZGlzdGFuY2UoXG4gICAgICAgICAgICB0aGlzLnhTdGFydCwgdGhpcy55U3RhcnQsIHRoaXMueEVuZCwgdGhpcy55RW5kXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubWF4UmFkaXVzID0gdGhpcy5jb250YWluZXJNZXRyaWNzLmZ1cnRoZXN0Q29ybmVyRGlzdGFuY2VGcm9tKFxuICAgICAgICAgIHRoaXMueFN0YXJ0LFxuICAgICAgICAgIHRoaXMueVN0YXJ0XG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy53YXZlQ29udGFpbmVyLnN0eWxlLnRvcCA9XG4gICAgICAgICAgKHRoaXMuY29udGFpbmVyTWV0cmljcy5oZWlnaHQgLSB0aGlzLmNvbnRhaW5lck1ldHJpY3Muc2l6ZSkgLyAyICsgJ3B4JztcbiAgICAgICAgdGhpcy53YXZlQ29udGFpbmVyLnN0eWxlLmxlZnQgPVxuICAgICAgICAgICh0aGlzLmNvbnRhaW5lck1ldHJpY3Mud2lkdGggLSB0aGlzLmNvbnRhaW5lck1ldHJpY3Muc2l6ZSkgLyAyICsgJ3B4JztcblxuICAgICAgICB0aGlzLndhdmVDb250YWluZXIuc3R5bGUud2lkdGggPSB0aGlzLmNvbnRhaW5lck1ldHJpY3Muc2l6ZSArICdweCc7XG4gICAgICAgIHRoaXMud2F2ZUNvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSB0aGlzLmNvbnRhaW5lck1ldHJpY3Muc2l6ZSArICdweCc7XG4gICAgICB9LFxuXG4gICAgICAvKiogQHBhcmFtIHtFdmVudD19IGV2ZW50ICovXG4gICAgICB1cEFjdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzTW91c2VEb3duKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tb3VzZVVwU3RhcnQgPSBVdGlsaXR5Lm5vdygpO1xuICAgICAgfSxcblxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgUG9seW1lci5kb20odGhpcy53YXZlQ29udGFpbmVyLnBhcmVudE5vZGUpLnJlbW92ZUNoaWxkKFxuICAgICAgICAgIHRoaXMud2F2ZUNvbnRhaW5lclxuICAgICAgICApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBQb2x5bWVyKHtcbiAgICAgIGlzOiAncGFwZXItcmlwcGxlJyxcblxuICAgICAgYmVoYXZpb3JzOiBbXG4gICAgICAgIFBvbHltZXIuSXJvbkExMXlLZXlzQmVoYXZpb3JcbiAgICAgIF0sXG5cbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBpbml0aWFsIG9wYWNpdHkgc2V0IG9uIHRoZSB3YXZlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAYXR0cmlidXRlIGluaXRpYWxPcGFjaXR5XG4gICAgICAgICAqIEB0eXBlIG51bWJlclxuICAgICAgICAgKiBAZGVmYXVsdCAwLjI1XG4gICAgICAgICAqL1xuICAgICAgICBpbml0aWFsT3BhY2l0eToge1xuICAgICAgICAgIHR5cGU6IE51bWJlcixcbiAgICAgICAgICB2YWx1ZTogMC4yNVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBIb3cgZmFzdCAob3BhY2l0eSBwZXIgc2Vjb25kKSB0aGUgd2F2ZSBmYWRlcyBvdXQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBhdHRyaWJ1dGUgb3BhY2l0eURlY2F5VmVsb2NpdHlcbiAgICAgICAgICogQHR5cGUgbnVtYmVyXG4gICAgICAgICAqIEBkZWZhdWx0IDAuOFxuICAgICAgICAgKi9cbiAgICAgICAgb3BhY2l0eURlY2F5VmVsb2NpdHk6IHtcbiAgICAgICAgICB0eXBlOiBOdW1iZXIsXG4gICAgICAgICAgdmFsdWU6IDAuOFxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiB0cnVlLCByaXBwbGVzIHdpbGwgZXhoaWJpdCBhIGdyYXZpdGF0aW9uYWwgcHVsbCB0b3dhcmRzXG4gICAgICAgICAqIHRoZSBjZW50ZXIgb2YgdGhlaXIgY29udGFpbmVyIGFzIHRoZXkgZmFkZSBhd2F5LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAYXR0cmlidXRlIHJlY2VudGVyc1xuICAgICAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgICAgICByZWNlbnRlcnM6IHtcbiAgICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICAgIHZhbHVlOiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiB0cnVlLCByaXBwbGVzIHdpbGwgY2VudGVyIGluc2lkZSBpdHMgY29udGFpbmVyXG4gICAgICAgICAqXG4gICAgICAgICAqIEBhdHRyaWJ1dGUgcmVjZW50ZXJzXG4gICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgICAgIGNlbnRlcjoge1xuICAgICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgICAgdmFsdWU6IGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEEgbGlzdCBvZiB0aGUgdmlzdWFsIHJpcHBsZXMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBhdHRyaWJ1dGUgcmlwcGxlc1xuICAgICAgICAgKiBAdHlwZSBBcnJheVxuICAgICAgICAgKiBAZGVmYXVsdCBbXVxuICAgICAgICAgKi9cbiAgICAgICAgcmlwcGxlczoge1xuICAgICAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRydWUgd2hlbiB0aGVyZSBhcmUgdmlzaWJsZSByaXBwbGVzIGFuaW1hdGluZyB3aXRoaW4gdGhlXG4gICAgICAgICAqIGVsZW1lbnQuXG4gICAgICAgICAqL1xuICAgICAgICBhbmltYXRpbmc6IHtcbiAgICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICAgIHJlYWRPbmx5OiB0cnVlLFxuICAgICAgICAgIHJlZmxlY3RUb0F0dHJpYnV0ZTogdHJ1ZSxcbiAgICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogSWYgdHJ1ZSwgdGhlIHJpcHBsZSB3aWxsIHJlbWFpbiBpbiB0aGUgXCJkb3duXCIgc3RhdGUgdW50aWwgYGhvbGREb3duYFxuICAgICAgICAgKiBpcyBzZXQgdG8gZmFsc2UgYWdhaW4uXG4gICAgICAgICAqL1xuICAgICAgICBob2xkRG93bjoge1xuICAgICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgICAgdmFsdWU6IGZhbHNlLFxuICAgICAgICAgIG9ic2VydmVyOiAnX2hvbGREb3duQ2hhbmdlZCdcbiAgICAgICAgfSxcblxuICAgICAgICBfYW5pbWF0aW5nOiB7XG4gICAgICAgICAgdHlwZTogQm9vbGVhblxuICAgICAgICB9LFxuXG4gICAgICAgIF9ib3VuZEFuaW1hdGU6IHtcbiAgICAgICAgICB0eXBlOiBGdW5jdGlvbixcbiAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hbmltYXRlLmJpbmQodGhpcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBnZXQgdGFyZ2V0ICgpIHtcbiAgICAgICAgdmFyIG93bmVyUm9vdCA9IFBvbHltZXIuZG9tKHRoaXMpLmdldE93bmVyUm9vdCgpO1xuICAgICAgICB2YXIgdGFyZ2V0O1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmVudE5vZGUubm9kZVR5cGUgPT0gMTEpIHsgLy8gRE9DVU1FTlRfRlJBR01FTlRfTk9ERVxuICAgICAgICAgIHRhcmdldCA9IG93bmVyUm9vdC5ob3N0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRhcmdldCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICB9LFxuXG4gICAgICBrZXlCaW5kaW5nczoge1xuICAgICAgICAnZW50ZXI6a2V5ZG93bic6ICdfb25FbnRlcktleWRvd24nLFxuICAgICAgICAnc3BhY2U6a2V5ZG93bic6ICdfb25TcGFjZUtleWRvd24nLFxuICAgICAgICAnc3BhY2U6a2V5dXAnOiAnX29uU3BhY2VLZXl1cCdcbiAgICAgIH0sXG5cbiAgICAgIGF0dGFjaGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5saXN0ZW4odGhpcy50YXJnZXQsICd1cCcsICd1cEFjdGlvbicpO1xuICAgICAgICB0aGlzLmxpc3Rlbih0aGlzLnRhcmdldCwgJ2Rvd24nLCAnZG93bkFjdGlvbicpO1xuXG4gICAgICAgIGlmICghdGhpcy50YXJnZXQuaGFzQXR0cmlidXRlKCdub2luaycpKSB7XG4gICAgICAgICAgdGhpcy5rZXlFdmVudFRhcmdldCA9IHRoaXMudGFyZ2V0O1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBnZXQgc2hvdWxkS2VlcEFuaW1hdGluZyAoKSB7XG4gICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLnJpcHBsZXMubGVuZ3RoOyArK2luZGV4KSB7XG4gICAgICAgICAgaWYgKCF0aGlzLnJpcHBsZXNbaW5kZXhdLmlzQW5pbWF0aW9uQ29tcGxldGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sXG5cbiAgICAgIHNpbXVsYXRlZFJpcHBsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZG93bkFjdGlvbihudWxsKTtcblxuICAgICAgICAvLyBQbGVhc2Ugc2VlIHBvbHltZXIvcG9seW1lciMxMzA1XG4gICAgICAgIHRoaXMuYXN5bmMoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGhpcy51cEFjdGlvbigpO1xuICAgICAgICB9LCAxKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qKiBAcGFyYW0ge0V2ZW50PX0gZXZlbnQgKi9cbiAgICAgIGRvd25BY3Rpb246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmhvbGREb3duICYmIHRoaXMucmlwcGxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJpcHBsZSA9IHRoaXMuYWRkUmlwcGxlKCk7XG5cbiAgICAgICAgcmlwcGxlLmRvd25BY3Rpb24oZXZlbnQpO1xuXG4gICAgICAgIGlmICghdGhpcy5fYW5pbWF0aW5nKSB7XG4gICAgICAgICAgdGhpcy5hbmltYXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8qKiBAcGFyYW0ge0V2ZW50PX0gZXZlbnQgKi9cbiAgICAgIHVwQWN0aW9uOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAodGhpcy5ob2xkRG93bikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmlwcGxlcy5mb3JFYWNoKGZ1bmN0aW9uKHJpcHBsZSkge1xuICAgICAgICAgIHJpcHBsZS51cEFjdGlvbihldmVudCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYW5pbWF0ZSgpO1xuICAgICAgfSxcblxuICAgICAgb25BbmltYXRpb25Db21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLiQuYmFja2dyb3VuZC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBudWxsO1xuICAgICAgICB0aGlzLmZpcmUoJ3RyYW5zaXRpb25lbmQnKTtcbiAgICAgIH0sXG5cbiAgICAgIGFkZFJpcHBsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByaXBwbGUgPSBuZXcgUmlwcGxlKHRoaXMpO1xuXG4gICAgICAgIFBvbHltZXIuZG9tKHRoaXMuJC53YXZlcykuYXBwZW5kQ2hpbGQocmlwcGxlLndhdmVDb250YWluZXIpO1xuICAgICAgICB0aGlzLiQuYmFja2dyb3VuZC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSByaXBwbGUuY29sb3I7XG4gICAgICAgIHRoaXMucmlwcGxlcy5wdXNoKHJpcHBsZSk7XG5cbiAgICAgICAgdGhpcy5fc2V0QW5pbWF0aW5nKHRydWUpO1xuXG4gICAgICAgIHJldHVybiByaXBwbGU7XG4gICAgICB9LFxuXG4gICAgICByZW1vdmVSaXBwbGU6IGZ1bmN0aW9uKHJpcHBsZSkge1xuICAgICAgICB2YXIgcmlwcGxlSW5kZXggPSB0aGlzLnJpcHBsZXMuaW5kZXhPZihyaXBwbGUpO1xuXG4gICAgICAgIGlmIChyaXBwbGVJbmRleCA8IDApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJpcHBsZXMuc3BsaWNlKHJpcHBsZUluZGV4LCAxKTtcblxuICAgICAgICByaXBwbGUucmVtb3ZlKCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnJpcHBsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5fc2V0QW5pbWF0aW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgYW5pbWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpbmRleDtcbiAgICAgICAgdmFyIHJpcHBsZTtcblxuICAgICAgICB0aGlzLl9hbmltYXRpbmcgPSB0cnVlO1xuXG4gICAgICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHRoaXMucmlwcGxlcy5sZW5ndGg7ICsraW5kZXgpIHtcbiAgICAgICAgICByaXBwbGUgPSB0aGlzLnJpcHBsZXNbaW5kZXhdO1xuXG4gICAgICAgICAgcmlwcGxlLmRyYXcoKTtcblxuICAgICAgICAgIHRoaXMuJC5iYWNrZ3JvdW5kLnN0eWxlLm9wYWNpdHkgPSByaXBwbGUub3V0ZXJPcGFjaXR5O1xuXG4gICAgICAgICAgaWYgKHJpcHBsZS5pc09wYWNpdHlGdWxseURlY2F5ZWQgJiYgIXJpcHBsZS5pc1Jlc3RpbmdBdE1heFJhZGl1cykge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVSaXBwbGUocmlwcGxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuc2hvdWxkS2VlcEFuaW1hdGluZyAmJiB0aGlzLnJpcHBsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5vbkFuaW1hdGlvbkNvbXBsZXRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9ib3VuZEFuaW1hdGUpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBfb25FbnRlcktleWRvd246IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmRvd25BY3Rpb24oKTtcbiAgICAgICAgdGhpcy5hc3luYyh0aGlzLnVwQWN0aW9uLCAxKTtcbiAgICAgIH0sXG5cbiAgICAgIF9vblNwYWNlS2V5ZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZG93bkFjdGlvbigpO1xuICAgICAgfSxcblxuICAgICAgX29uU3BhY2VLZXl1cDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMudXBBY3Rpb24oKTtcbiAgICAgIH0sXG5cbiAgICAgIF9ob2xkRG93bkNoYW5nZWQ6IGZ1bmN0aW9uKGhvbGREb3duKSB7XG4gICAgICAgIGlmIChob2xkRG93bikge1xuICAgICAgICAgIHRoaXMuZG93bkFjdGlvbigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMudXBBY3Rpb24oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9KSgpO1xuXG59KSgpO1xuXG59KSIsInJlcXVpcmUoXCIuLi9wb2x5bWVyL3BvbHltZXIuaHRtbFwiKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZnVuY3Rpb24oKSB7XG52YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXTtcbmhlYWQuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlZW5kXCIsXCI8c3R5bGUgaXM9XFxcImN1c3RvbS1zdHlsZVxcXCI+OnJvb3R7LS1zaGFkb3ctdHJhbnNpdGlvbjp7dHJhbnNpdGlvbjpib3gtc2hhZG93IC4yOHMgY3ViaWMtYmV6aWVyKDAuNCwwLC4yLDEpfTstLXNoYWRvdy1ub25lOntib3gtc2hhZG93Om5vbmV9Oy0tc2hhZG93LWVsZXZhdGlvbi0yZHA6e2JveC1zaGFkb3c6MCAycHggMnB4IDAgcmdiYSgwLDAsMCwuMTQpLDAgMXB4IDVweCAwIHJnYmEoMCwwLDAsLjEyKSwwIDNweCAxcHggLTJweCByZ2JhKDAsMCwwLC4yKX07LS1zaGFkb3ctZWxldmF0aW9uLTNkcDp7Ym94LXNoYWRvdzowIDNweCA0cHggMCByZ2JhKDAsMCwwLC4xNCksMCAxcHggOHB4IDAgcmdiYSgwLDAsMCwuMTIpLDAgM3B4IDNweCAtMnB4IHJnYmEoMCwwLDAsLjQpfTstLXNoYWRvdy1lbGV2YXRpb24tNGRwOntib3gtc2hhZG93OjAgNHB4IDVweCAwIHJnYmEoMCwwLDAsLjE0KSwwIDFweCAxMHB4IDAgcmdiYSgwLDAsMCwuMTIpLDAgMnB4IDRweCAtMXB4IHJnYmEoMCwwLDAsLjQpfTstLXNoYWRvdy1lbGV2YXRpb24tNmRwOntib3gtc2hhZG93OjAgNnB4IDEwcHggMCByZ2JhKDAsMCwwLC4xNCksMCAxcHggMThweCAwIHJnYmEoMCwwLDAsLjEyKSwwIDNweCA1cHggLTFweCByZ2JhKDAsMCwwLC40KX07LS1zaGFkb3ctZWxldmF0aW9uLThkcDp7Ym94LXNoYWRvdzowIDhweCAxMHB4IDFweCByZ2JhKDAsMCwwLC4xNCksMCAzcHggMTRweCAycHggcmdiYSgwLDAsMCwuMTIpLDAgNXB4IDVweCAtM3B4IHJnYmEoMCwwLDAsLjQpfTstLXNoYWRvdy1lbGV2YXRpb24tMTZkcDp7Ym94LXNoYWRvdzowIDE2cHggMjRweCAycHggcmdiYSgwLDAsMCwuMTQpLDAgNnB4IDMwcHggNXB4IHJnYmEoMCwwLDAsLjEyKSwwIDhweCAxMHB4IC01cHggcmdiYSgwLDAsMCwuNCl9fTwvc3R5bGU+XCIpO1xuXG59KSIsImRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZnVuY3Rpb24oKSB7XG47KGZ1bmN0aW9uKCkge1xuKGZ1bmN0aW9uICgpIHtcbmZ1bmN0aW9uIHJlc29sdmUoKSB7XG5kb2N1bWVudC5ib2R5LnJlbW92ZUF0dHJpYnV0ZSgndW5yZXNvbHZlZCcpO1xufVxuaWYgKHdpbmRvdy5XZWJDb21wb25lbnRzKSB7XG5hZGRFdmVudExpc3RlbmVyKCdXZWJDb21wb25lbnRzUmVhZHknLCByZXNvbHZlKTtcbn0gZWxzZSB7XG5pZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2ludGVyYWN0aXZlJyB8fCBkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG5yZXNvbHZlKCk7XG59IGVsc2Uge1xuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHJlc29sdmUpO1xufVxufVxufSgpKTtcblBvbHltZXIgPSB7XG5TZXR0aW5nczogZnVuY3Rpb24gKCkge1xudmFyIHVzZXIgPSB3aW5kb3cuUG9seW1lciB8fCB7fTtcbmxvY2F0aW9uLnNlYXJjaC5zbGljZSgxKS5zcGxpdCgnJicpLmZvckVhY2goZnVuY3Rpb24gKG8pIHtcbm8gPSBvLnNwbGl0KCc9Jyk7XG5vWzBdICYmICh1c2VyW29bMF1dID0gb1sxXSB8fCB0cnVlKTtcbn0pO1xudmFyIHdhbnRTaGFkb3cgPSB1c2VyLmRvbSA9PT0gJ3NoYWRvdyc7XG52YXIgaGFzU2hhZG93ID0gQm9vbGVhbihFbGVtZW50LnByb3RvdHlwZS5jcmVhdGVTaGFkb3dSb290KTtcbnZhciBuYXRpdmVTaGFkb3cgPSBoYXNTaGFkb3cgJiYgIXdpbmRvdy5TaGFkb3dET01Qb2x5ZmlsbDtcbnZhciB1c2VTaGFkb3cgPSB3YW50U2hhZG93ICYmIGhhc1NoYWRvdztcbnZhciBoYXNOYXRpdmVJbXBvcnRzID0gQm9vbGVhbignaW1wb3J0JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJykpO1xudmFyIHVzZU5hdGl2ZUltcG9ydHMgPSBoYXNOYXRpdmVJbXBvcnRzO1xudmFyIHVzZU5hdGl2ZUN1c3RvbUVsZW1lbnRzID0gIXdpbmRvdy5DdXN0b21FbGVtZW50cyB8fCB3aW5kb3cuQ3VzdG9tRWxlbWVudHMudXNlTmF0aXZlO1xucmV0dXJuIHtcbndhbnRTaGFkb3c6IHdhbnRTaGFkb3csXG5oYXNTaGFkb3c6IGhhc1NoYWRvdyxcbm5hdGl2ZVNoYWRvdzogbmF0aXZlU2hhZG93LFxudXNlU2hhZG93OiB1c2VTaGFkb3csXG51c2VOYXRpdmVTaGFkb3c6IHVzZVNoYWRvdyAmJiBuYXRpdmVTaGFkb3csXG51c2VOYXRpdmVJbXBvcnRzOiB1c2VOYXRpdmVJbXBvcnRzLFxudXNlTmF0aXZlQ3VzdG9tRWxlbWVudHM6IHVzZU5hdGl2ZUN1c3RvbUVsZW1lbnRzXG59O1xufSgpXG59O1xuKGZ1bmN0aW9uICgpIHtcbnZhciB1c2VyUG9seW1lciA9IHdpbmRvdy5Qb2x5bWVyO1xud2luZG93LlBvbHltZXIgPSBmdW5jdGlvbiAocHJvdG90eXBlKSB7XG52YXIgY3RvciA9IGRlc3VnYXIocHJvdG90eXBlKTtcbnByb3RvdHlwZSA9IGN0b3IucHJvdG90eXBlO1xudmFyIG9wdGlvbnMgPSB7IHByb3RvdHlwZTogcHJvdG90eXBlIH07XG5pZiAocHJvdG90eXBlLmV4dGVuZHMpIHtcbm9wdGlvbnMuZXh0ZW5kcyA9IHByb3RvdHlwZS5leHRlbmRzO1xufVxuUG9seW1lci50ZWxlbWV0cnkuX3JlZ2lzdHJhdGUocHJvdG90eXBlKTtcbmRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudChwcm90b3R5cGUuaXMsIG9wdGlvbnMpO1xucmV0dXJuIGN0b3I7XG59O1xudmFyIGRlc3VnYXIgPSBmdW5jdGlvbiAocHJvdG90eXBlKSB7XG5wcm90b3R5cGUgPSBQb2x5bWVyLkJhc2UuY2hhaW5PYmplY3QocHJvdG90eXBlLCBQb2x5bWVyLkJhc2UpO1xucHJvdG90eXBlLnJlZ2lzdGVyQ2FsbGJhY2soKTtcbnJldHVybiBwcm90b3R5cGUuY29uc3RydWN0b3I7XG59O1xud2luZG93LlBvbHltZXIgPSBQb2x5bWVyO1xuaWYgKHVzZXJQb2x5bWVyKSB7XG5mb3IgKHZhciBpIGluIHVzZXJQb2x5bWVyKSB7XG5Qb2x5bWVyW2ldID0gdXNlclBvbHltZXJbaV07XG59XG59XG5Qb2x5bWVyLkNsYXNzID0gZGVzdWdhcjtcbn0oKSk7XG5Qb2x5bWVyLnRlbGVtZXRyeSA9IHtcbnJlZ2lzdHJhdGlvbnM6IFtdLFxuX3JlZ0xvZzogZnVuY3Rpb24gKHByb3RvdHlwZSkge1xuY29uc29sZS5sb2coJ1snICsgcHJvdG90eXBlLmlzICsgJ106IHJlZ2lzdGVyZWQnKTtcbn0sXG5fcmVnaXN0cmF0ZTogZnVuY3Rpb24gKHByb3RvdHlwZSkge1xudGhpcy5yZWdpc3RyYXRpb25zLnB1c2gocHJvdG90eXBlKTtcblBvbHltZXIubG9nICYmIHRoaXMuX3JlZ0xvZyhwcm90b3R5cGUpO1xufSxcbmR1bXBSZWdpc3RyYXRpb25zOiBmdW5jdGlvbiAoKSB7XG50aGlzLnJlZ2lzdHJhdGlvbnMuZm9yRWFjaCh0aGlzLl9yZWdMb2cpO1xufVxufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3csICdjdXJyZW50SW1wb3J0Jywge1xuZW51bWVyYWJsZTogdHJ1ZSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZSxcbmdldDogZnVuY3Rpb24gKCkge1xucmV0dXJuIChkb2N1bWVudC5fY3VycmVudFNjcmlwdCB8fCBkb2N1bWVudC5jdXJyZW50U2NyaXB0KS5vd25lckRvY3VtZW50O1xufVxufSk7XG5Qb2x5bWVyLkJhc2UgPSB7XG5fYWRkRmVhdHVyZTogZnVuY3Rpb24gKGZlYXR1cmUpIHtcbnRoaXMuZXh0ZW5kKHRoaXMsIGZlYXR1cmUpO1xufSxcbnJlZ2lzdGVyQ2FsbGJhY2s6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3JlZ2lzdGVyRmVhdHVyZXMoKTtcbnRoaXMuX2RvQmVoYXZpb3IoJ3JlZ2lzdGVyZWQnKTtcbn0sXG5jcmVhdGVkQ2FsbGJhY2s6IGZ1bmN0aW9uICgpIHtcblBvbHltZXIudGVsZW1ldHJ5Lmluc3RhbmNlQ291bnQrKztcbnRoaXMucm9vdCA9IHRoaXM7XG50aGlzLl9kb0JlaGF2aW9yKCdjcmVhdGVkJyk7XG50aGlzLl9pbml0RmVhdHVyZXMoKTtcbn0sXG5hdHRhY2hlZENhbGxiYWNrOiBmdW5jdGlvbiAoKSB7XG50aGlzLmlzQXR0YWNoZWQgPSB0cnVlO1xudGhpcy5fZG9CZWhhdmlvcignYXR0YWNoZWQnKTtcbn0sXG5kZXRhY2hlZENhbGxiYWNrOiBmdW5jdGlvbiAoKSB7XG50aGlzLmlzQXR0YWNoZWQgPSBmYWxzZTtcbnRoaXMuX2RvQmVoYXZpb3IoJ2RldGFjaGVkJyk7XG59LFxuYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrOiBmdW5jdGlvbiAobmFtZSkge1xudGhpcy5fc2V0QXR0cmlidXRlVG9Qcm9wZXJ0eSh0aGlzLCBuYW1lKTtcbnRoaXMuX2RvQmVoYXZpb3IoJ2F0dHJpYnV0ZUNoYW5nZWQnLCBhcmd1bWVudHMpO1xufSxcbmV4dGVuZDogZnVuY3Rpb24gKHByb3RvdHlwZSwgYXBpKSB7XG5pZiAocHJvdG90eXBlICYmIGFwaSkge1xuT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYXBpKS5mb3JFYWNoKGZ1bmN0aW9uIChuKSB7XG50aGlzLmNvcHlPd25Qcm9wZXJ0eShuLCBhcGksIHByb3RvdHlwZSk7XG59LCB0aGlzKTtcbn1cbnJldHVybiBwcm90b3R5cGUgfHwgYXBpO1xufSxcbm1peGluOiBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcbmZvciAodmFyIGkgaW4gc291cmNlKSB7XG50YXJnZXRbaV0gPSBzb3VyY2VbaV07XG59XG5yZXR1cm4gdGFyZ2V0O1xufSxcbmNvcHlPd25Qcm9wZXJ0eTogZnVuY3Rpb24gKG5hbWUsIHNvdXJjZSwgdGFyZ2V0KSB7XG52YXIgcGQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwgbmFtZSk7XG5pZiAocGQpIHtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIG5hbWUsIHBkKTtcbn1cbn0sXG5fbG9nOiBjb25zb2xlLmxvZy5hcHBseS5iaW5kKGNvbnNvbGUubG9nLCBjb25zb2xlKSxcbl93YXJuOiBjb25zb2xlLndhcm4uYXBwbHkuYmluZChjb25zb2xlLndhcm4sIGNvbnNvbGUpLFxuX2Vycm9yOiBjb25zb2xlLmVycm9yLmFwcGx5LmJpbmQoY29uc29sZS5lcnJvciwgY29uc29sZSksXG5fbG9nZjogZnVuY3Rpb24gKCkge1xucmV0dXJuIHRoaXMuX2xvZ1ByZWZpeC5jb25jYXQoW3RoaXMuaXNdKS5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSk7XG59XG59O1xuUG9seW1lci5CYXNlLl9sb2dQcmVmaXggPSBmdW5jdGlvbiAoKSB7XG52YXIgY29sb3IgPSB3aW5kb3cuY2hyb21lIHx8IC9maXJlZm94L2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbnJldHVybiBjb2xvciA/IFtcbiclY1slczo6JXNdOicsXG4nZm9udC13ZWlnaHQ6IGJvbGQ7IGJhY2tncm91bmQtY29sb3I6I0VFRUUwMDsnXG5dIDogWydbJXM6OiVzXTonXTtcbn0oKTtcblBvbHltZXIuQmFzZS5jaGFpbk9iamVjdCA9IGZ1bmN0aW9uIChvYmplY3QsIGluaGVyaXRlZCkge1xuaWYgKG9iamVjdCAmJiBpbmhlcml0ZWQgJiYgb2JqZWN0ICE9PSBpbmhlcml0ZWQpIHtcbmlmICghT2JqZWN0Ll9fcHJvdG9fXykge1xub2JqZWN0ID0gUG9seW1lci5CYXNlLmV4dGVuZChPYmplY3QuY3JlYXRlKGluaGVyaXRlZCksIG9iamVjdCk7XG59XG5vYmplY3QuX19wcm90b19fID0gaW5oZXJpdGVkO1xufVxucmV0dXJuIG9iamVjdDtcbn07XG5Qb2x5bWVyLkJhc2UgPSBQb2x5bWVyLkJhc2UuY2hhaW5PYmplY3QoUG9seW1lci5CYXNlLCBIVE1MRWxlbWVudC5wcm90b3R5cGUpO1xuUG9seW1lci50ZWxlbWV0cnkuaW5zdGFuY2VDb3VudCA9IDA7XG4oZnVuY3Rpb24gKCkge1xudmFyIG1vZHVsZXMgPSB7fTtcbnZhciBEb21Nb2R1bGUgPSBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZG9tLW1vZHVsZScpO1xufTtcbkRvbU1vZHVsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEhUTUxFbGVtZW50LnByb3RvdHlwZSk7XG5Eb21Nb2R1bGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRG9tTW9kdWxlO1xuRG9tTW9kdWxlLnByb3RvdHlwZS5jcmVhdGVkQ2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7XG52YXIgaWQgPSB0aGlzLmlkIHx8IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJykgfHwgdGhpcy5nZXRBdHRyaWJ1dGUoJ2lzJyk7XG5pZiAoaWQpIHtcbnRoaXMuaWQgPSBpZDtcbm1vZHVsZXNbaWRdID0gdGhpcztcbn1cbn07XG5Eb21Nb2R1bGUucHJvdG90eXBlLmltcG9ydCA9IGZ1bmN0aW9uIChpZCwgc2xjdHIpIHtcbnZhciBtID0gbW9kdWxlc1tpZF07XG5pZiAoIW0pIHtcbmZvcmNlRG9jdW1lbnRVcGdyYWRlKCk7XG5tID0gbW9kdWxlc1tpZF07XG59XG5pZiAobSAmJiBzbGN0cikge1xubSA9IG0ucXVlcnlTZWxlY3RvcihzbGN0cik7XG59XG5yZXR1cm4gbTtcbn07XG52YXIgY2VQb2x5ZmlsbCA9IHdpbmRvdy5DdXN0b21FbGVtZW50cyAmJiAhQ3VzdG9tRWxlbWVudHMudXNlTmF0aXZlO1xuaWYgKGNlUG9seWZpbGwpIHtcbnZhciByZWFkeSA9IEN1c3RvbUVsZW1lbnRzLnJlYWR5O1xuQ3VzdG9tRWxlbWVudHMucmVhZHkgPSB0cnVlO1xufVxuZG9jdW1lbnQucmVnaXN0ZXJFbGVtZW50KCdkb20tbW9kdWxlJywgRG9tTW9kdWxlKTtcbmlmIChjZVBvbHlmaWxsKSB7XG5DdXN0b21FbGVtZW50cy5yZWFkeSA9IHJlYWR5O1xufVxuZnVuY3Rpb24gZm9yY2VEb2N1bWVudFVwZ3JhZGUoKSB7XG5pZiAoY2VQb2x5ZmlsbCkge1xudmFyIHNjcmlwdCA9IGRvY3VtZW50Ll9jdXJyZW50U2NyaXB0IHx8IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQ7XG5pZiAoc2NyaXB0KSB7XG5DdXN0b21FbGVtZW50cy51cGdyYWRlQWxsKHNjcmlwdC5vd25lckRvY3VtZW50KTtcbn1cbn1cbn1cbn0oKSk7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX3ByZXBJczogZnVuY3Rpb24gKCkge1xuaWYgKCF0aGlzLmlzKSB7XG52YXIgbW9kdWxlID0gKGRvY3VtZW50Ll9jdXJyZW50U2NyaXB0IHx8IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQpLnBhcmVudE5vZGU7XG5pZiAobW9kdWxlLmxvY2FsTmFtZSA9PT0gJ2RvbS1tb2R1bGUnKSB7XG52YXIgaWQgPSBtb2R1bGUuaWQgfHwgbW9kdWxlLmdldEF0dHJpYnV0ZSgnbmFtZScpIHx8IG1vZHVsZS5nZXRBdHRyaWJ1dGUoJ2lzJyk7XG50aGlzLmlzID0gaWQ7XG59XG59XG59XG59KTtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5iZWhhdmlvcnM6IFtdLFxuX3ByZXBCZWhhdmlvcnM6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLmJlaGF2aW9ycy5sZW5ndGgpIHtcbnRoaXMuYmVoYXZpb3JzID0gdGhpcy5fZmxhdHRlbkJlaGF2aW9yc0xpc3QodGhpcy5iZWhhdmlvcnMpO1xufVxudGhpcy5fcHJlcEFsbEJlaGF2aW9ycyh0aGlzLmJlaGF2aW9ycyk7XG59LFxuX2ZsYXR0ZW5CZWhhdmlvcnNMaXN0OiBmdW5jdGlvbiAoYmVoYXZpb3JzKSB7XG52YXIgZmxhdCA9IFtdO1xuYmVoYXZpb3JzLmZvckVhY2goZnVuY3Rpb24gKGIpIHtcbmlmIChiIGluc3RhbmNlb2YgQXJyYXkpIHtcbmZsYXQgPSBmbGF0LmNvbmNhdCh0aGlzLl9mbGF0dGVuQmVoYXZpb3JzTGlzdChiKSk7XG59IGVsc2UgaWYgKGIpIHtcbmZsYXQucHVzaChiKTtcbn0gZWxzZSB7XG50aGlzLl93YXJuKHRoaXMuX2xvZ2YoJ19mbGF0dGVuQmVoYXZpb3JzTGlzdCcsICdiZWhhdmlvciBpcyBudWxsLCBjaGVjayBmb3IgbWlzc2luZyBvciA0MDQgaW1wb3J0JykpO1xufVxufSwgdGhpcyk7XG5yZXR1cm4gZmxhdDtcbn0sXG5fcHJlcEFsbEJlaGF2aW9yczogZnVuY3Rpb24gKGJlaGF2aW9ycykge1xuZm9yICh2YXIgaSA9IGJlaGF2aW9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xudGhpcy5fbWl4aW5CZWhhdmlvcihiZWhhdmlvcnNbaV0pO1xufVxuZm9yICh2YXIgaSA9IDAsIGwgPSBiZWhhdmlvcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG50aGlzLl9wcmVwQmVoYXZpb3IoYmVoYXZpb3JzW2ldKTtcbn1cbnRoaXMuX3ByZXBCZWhhdmlvcih0aGlzKTtcbn0sXG5fbWl4aW5CZWhhdmlvcjogZnVuY3Rpb24gKGIpIHtcbk9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGIpLmZvckVhY2goZnVuY3Rpb24gKG4pIHtcbnN3aXRjaCAobikge1xuY2FzZSAnaG9zdEF0dHJpYnV0ZXMnOlxuY2FzZSAncmVnaXN0ZXJlZCc6XG5jYXNlICdwcm9wZXJ0aWVzJzpcbmNhc2UgJ29ic2VydmVycyc6XG5jYXNlICdsaXN0ZW5lcnMnOlxuY2FzZSAnY3JlYXRlZCc6XG5jYXNlICdhdHRhY2hlZCc6XG5jYXNlICdkZXRhY2hlZCc6XG5jYXNlICdhdHRyaWJ1dGVDaGFuZ2VkJzpcbmNhc2UgJ2NvbmZpZ3VyZSc6XG5jYXNlICdyZWFkeSc6XG5icmVhaztcbmRlZmF1bHQ6XG5pZiAoIXRoaXMuaGFzT3duUHJvcGVydHkobikpIHtcbnRoaXMuY29weU93blByb3BlcnR5KG4sIGIsIHRoaXMpO1xufVxuYnJlYWs7XG59XG59LCB0aGlzKTtcbn0sXG5fZG9CZWhhdmlvcjogZnVuY3Rpb24gKG5hbWUsIGFyZ3MpIHtcbnRoaXMuYmVoYXZpb3JzLmZvckVhY2goZnVuY3Rpb24gKGIpIHtcbnRoaXMuX2ludm9rZUJlaGF2aW9yKGIsIG5hbWUsIGFyZ3MpO1xufSwgdGhpcyk7XG50aGlzLl9pbnZva2VCZWhhdmlvcih0aGlzLCBuYW1lLCBhcmdzKTtcbn0sXG5faW52b2tlQmVoYXZpb3I6IGZ1bmN0aW9uIChiLCBuYW1lLCBhcmdzKSB7XG52YXIgZm4gPSBiW25hbWVdO1xuaWYgKGZuKSB7XG5mbi5hcHBseSh0aGlzLCBhcmdzIHx8IFBvbHltZXIubmFyKTtcbn1cbn0sXG5fbWFyc2hhbEJlaGF2aW9yczogZnVuY3Rpb24gKCkge1xudGhpcy5iZWhhdmlvcnMuZm9yRWFjaChmdW5jdGlvbiAoYikge1xudGhpcy5fbWFyc2hhbEJlaGF2aW9yKGIpO1xufSwgdGhpcyk7XG50aGlzLl9tYXJzaGFsQmVoYXZpb3IodGhpcyk7XG59XG59KTtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5fcHJlcEV4dGVuZHM6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLmV4dGVuZHMpIHtcbnRoaXMuX19wcm90b19fID0gdGhpcy5fZ2V0RXh0ZW5kZWRQcm90b3R5cGUodGhpcy5leHRlbmRzKTtcbn1cbn0sXG5fZ2V0RXh0ZW5kZWRQcm90b3R5cGU6IGZ1bmN0aW9uICh0YWcpIHtcbnJldHVybiB0aGlzLl9nZXRFeHRlbmRlZE5hdGl2ZVByb3RvdHlwZSh0YWcpO1xufSxcbl9uYXRpdmVQcm90b3R5cGVzOiB7fSxcbl9nZXRFeHRlbmRlZE5hdGl2ZVByb3RvdHlwZTogZnVuY3Rpb24gKHRhZykge1xudmFyIHAgPSB0aGlzLl9uYXRpdmVQcm90b3R5cGVzW3RhZ107XG5pZiAoIXApIHtcbnZhciBucCA9IHRoaXMuZ2V0TmF0aXZlUHJvdG90eXBlKHRhZyk7XG5wID0gdGhpcy5leHRlbmQoT2JqZWN0LmNyZWF0ZShucCksIFBvbHltZXIuQmFzZSk7XG50aGlzLl9uYXRpdmVQcm90b3R5cGVzW3RhZ10gPSBwO1xufVxucmV0dXJuIHA7XG59LFxuZ2V0TmF0aXZlUHJvdG90eXBlOiBmdW5jdGlvbiAodGFnKSB7XG5yZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKSk7XG59XG59KTtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5fcHJlcENvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9mYWN0b3J5QXJncyA9IHRoaXMuZXh0ZW5kcyA/IFtcbnRoaXMuZXh0ZW5kcyxcbnRoaXMuaXNcbl0gOiBbdGhpcy5pc107XG52YXIgY3RvciA9IGZ1bmN0aW9uICgpIHtcbnJldHVybiB0aGlzLl9mYWN0b3J5KGFyZ3VtZW50cyk7XG59O1xuaWYgKHRoaXMuaGFzT3duUHJvcGVydHkoJ2V4dGVuZHMnKSkge1xuY3Rvci5leHRlbmRzID0gdGhpcy5leHRlbmRzO1xufVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdjb25zdHJ1Y3RvcicsIHtcbnZhbHVlOiBjdG9yLFxud3JpdGFibGU6IHRydWUsXG5jb25maWd1cmFibGU6IHRydWVcbn0pO1xuY3Rvci5wcm90b3R5cGUgPSB0aGlzO1xufSxcbl9mYWN0b3J5OiBmdW5jdGlvbiAoYXJncykge1xudmFyIGVsdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQuYXBwbHkoZG9jdW1lbnQsIHRoaXMuX2ZhY3RvcnlBcmdzKTtcbmlmICh0aGlzLmZhY3RvcnlJbXBsKSB7XG50aGlzLmZhY3RvcnlJbXBsLmFwcGx5KGVsdCwgYXJncyk7XG59XG5yZXR1cm4gZWx0O1xufVxufSk7XG5Qb2x5bWVyLm5vYiA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xucHJvcGVydGllczoge30sXG5nZXRQcm9wZXJ0eUluZm86IGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xudmFyIGluZm8gPSB0aGlzLl9nZXRQcm9wZXJ0eUluZm8ocHJvcGVydHksIHRoaXMucHJvcGVydGllcyk7XG5pZiAoIWluZm8pIHtcbnRoaXMuYmVoYXZpb3JzLnNvbWUoZnVuY3Rpb24gKGIpIHtcbnJldHVybiBpbmZvID0gdGhpcy5fZ2V0UHJvcGVydHlJbmZvKHByb3BlcnR5LCBiLnByb3BlcnRpZXMpO1xufSwgdGhpcyk7XG59XG5yZXR1cm4gaW5mbyB8fCBQb2x5bWVyLm5vYjtcbn0sXG5fZ2V0UHJvcGVydHlJbmZvOiBmdW5jdGlvbiAocHJvcGVydHksIHByb3BlcnRpZXMpIHtcbnZhciBwID0gcHJvcGVydGllcyAmJiBwcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbmlmICh0eXBlb2YgcCA9PT0gJ2Z1bmN0aW9uJykge1xucCA9IHByb3BlcnRpZXNbcHJvcGVydHldID0geyB0eXBlOiBwIH07XG59XG5pZiAocCkge1xucC5kZWZpbmVkID0gdHJ1ZTtcbn1cbnJldHVybiBwO1xufVxufSk7XG5Qb2x5bWVyLkNhc2VNYXAgPSB7XG5fY2FzZU1hcDoge30sXG5kYXNoVG9DYW1lbENhc2U6IGZ1bmN0aW9uIChkYXNoKSB7XG52YXIgbWFwcGVkID0gUG9seW1lci5DYXNlTWFwLl9jYXNlTWFwW2Rhc2hdO1xuaWYgKG1hcHBlZCkge1xucmV0dXJuIG1hcHBlZDtcbn1cbmlmIChkYXNoLmluZGV4T2YoJy0nKSA8IDApIHtcbnJldHVybiBQb2x5bWVyLkNhc2VNYXAuX2Nhc2VNYXBbZGFzaF0gPSBkYXNoO1xufVxucmV0dXJuIFBvbHltZXIuQ2FzZU1hcC5fY2FzZU1hcFtkYXNoXSA9IGRhc2gucmVwbGFjZSgvLShbYS16XSkvZywgZnVuY3Rpb24gKG0pIHtcbnJldHVybiBtWzFdLnRvVXBwZXJDYXNlKCk7XG59KTtcbn0sXG5jYW1lbFRvRGFzaENhc2U6IGZ1bmN0aW9uIChjYW1lbCkge1xudmFyIG1hcHBlZCA9IFBvbHltZXIuQ2FzZU1hcC5fY2FzZU1hcFtjYW1lbF07XG5pZiAobWFwcGVkKSB7XG5yZXR1cm4gbWFwcGVkO1xufVxucmV0dXJuIFBvbHltZXIuQ2FzZU1hcC5fY2FzZU1hcFtjYW1lbF0gPSBjYW1lbC5yZXBsYWNlKC8oW2Etel1bQS1aXSkvZywgZnVuY3Rpb24gKGcpIHtcbnJldHVybiBnWzBdICsgJy0nICsgZ1sxXS50b0xvd2VyQ2FzZSgpO1xufSk7XG59XG59O1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9wcmVwQXR0cmlidXRlczogZnVuY3Rpb24gKCkge1xudGhpcy5fYWdncmVnYXRlZEF0dHJpYnV0ZXMgPSB7fTtcbn0sXG5fYWRkSG9zdEF0dHJpYnV0ZXM6IGZ1bmN0aW9uIChhdHRyaWJ1dGVzKSB7XG5pZiAoYXR0cmlidXRlcykge1xudGhpcy5taXhpbih0aGlzLl9hZ2dyZWdhdGVkQXR0cmlidXRlcywgYXR0cmlidXRlcyk7XG59XG59LFxuX21hcnNoYWxIb3N0QXR0cmlidXRlczogZnVuY3Rpb24gKCkge1xudGhpcy5fYXBwbHlBdHRyaWJ1dGVzKHRoaXMsIHRoaXMuX2FnZ3JlZ2F0ZWRBdHRyaWJ1dGVzKTtcbn0sXG5fYXBwbHlBdHRyaWJ1dGVzOiBmdW5jdGlvbiAobm9kZSwgYXR0ciQpIHtcbmZvciAodmFyIG4gaW4gYXR0ciQpIHtcbmlmICghdGhpcy5oYXNBdHRyaWJ1dGUobikgJiYgbiAhPT0gJ2NsYXNzJykge1xudGhpcy5zZXJpYWxpemVWYWx1ZVRvQXR0cmlidXRlKGF0dHIkW25dLCBuLCB0aGlzKTtcbn1cbn1cbn0sXG5fbWFyc2hhbEF0dHJpYnV0ZXM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3Rha2VBdHRyaWJ1dGVzVG9Nb2RlbCh0aGlzKTtcbn0sXG5fdGFrZUF0dHJpYnV0ZXNUb01vZGVsOiBmdW5jdGlvbiAobW9kZWwpIHtcbmZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5hdHRyaWJ1dGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xudGhpcy5fc2V0QXR0cmlidXRlVG9Qcm9wZXJ0eShtb2RlbCwgdGhpcy5hdHRyaWJ1dGVzW2ldLm5hbWUpO1xufVxufSxcbl9zZXRBdHRyaWJ1dGVUb1Byb3BlcnR5OiBmdW5jdGlvbiAobW9kZWwsIGF0dHJOYW1lKSB7XG5pZiAoIXRoaXMuX3NlcmlhbGl6aW5nKSB7XG52YXIgcHJvcE5hbWUgPSBQb2x5bWVyLkNhc2VNYXAuZGFzaFRvQ2FtZWxDYXNlKGF0dHJOYW1lKTtcbnZhciBpbmZvID0gdGhpcy5nZXRQcm9wZXJ0eUluZm8ocHJvcE5hbWUpO1xuaWYgKGluZm8uZGVmaW5lZCB8fCB0aGlzLl9wcm9wZXJ0eUVmZmVjdHMgJiYgdGhpcy5fcHJvcGVydHlFZmZlY3RzW3Byb3BOYW1lXSkge1xudmFyIHZhbCA9IHRoaXMuZ2V0QXR0cmlidXRlKGF0dHJOYW1lKTtcbm1vZGVsW3Byb3BOYW1lXSA9IHRoaXMuZGVzZXJpYWxpemUodmFsLCBpbmZvLnR5cGUpO1xufVxufVxufSxcbl9zZXJpYWxpemluZzogZmFsc2UsXG5yZWZsZWN0UHJvcGVydHlUb0F0dHJpYnV0ZTogZnVuY3Rpb24gKG5hbWUpIHtcbnRoaXMuX3NlcmlhbGl6aW5nID0gdHJ1ZTtcbnRoaXMuc2VyaWFsaXplVmFsdWVUb0F0dHJpYnV0ZSh0aGlzW25hbWVdLCBQb2x5bWVyLkNhc2VNYXAuY2FtZWxUb0Rhc2hDYXNlKG5hbWUpKTtcbnRoaXMuX3NlcmlhbGl6aW5nID0gZmFsc2U7XG59LFxuc2VyaWFsaXplVmFsdWVUb0F0dHJpYnV0ZTogZnVuY3Rpb24gKHZhbHVlLCBhdHRyaWJ1dGUsIG5vZGUpIHtcbnZhciBzdHIgPSB0aGlzLnNlcmlhbGl6ZSh2YWx1ZSk7XG4obm9kZSB8fCB0aGlzKVtzdHIgPT09IHVuZGVmaW5lZCA/ICdyZW1vdmVBdHRyaWJ1dGUnIDogJ3NldEF0dHJpYnV0ZSddKGF0dHJpYnV0ZSwgc3RyKTtcbn0sXG5kZXNlcmlhbGl6ZTogZnVuY3Rpb24gKHZhbHVlLCB0eXBlKSB7XG5zd2l0Y2ggKHR5cGUpIHtcbmNhc2UgTnVtYmVyOlxudmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuYnJlYWs7XG5jYXNlIEJvb2xlYW46XG52YWx1ZSA9IHZhbHVlICE9PSBudWxsO1xuYnJlYWs7XG5jYXNlIE9iamVjdDpcbnRyeSB7XG52YWx1ZSA9IEpTT04ucGFyc2UodmFsdWUpO1xufSBjYXRjaCAoeCkge1xufVxuYnJlYWs7XG5jYXNlIEFycmF5OlxudHJ5IHtcbnZhbHVlID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG59IGNhdGNoICh4KSB7XG52YWx1ZSA9IG51bGw7XG5jb25zb2xlLndhcm4oJ1BvbHltZXI6OkF0dHJpYnV0ZXM6IGNvdWxkbmB0IGRlY29kZSBBcnJheSBhcyBKU09OJyk7XG59XG5icmVhaztcbmNhc2UgRGF0ZTpcbnZhbHVlID0gbmV3IERhdGUodmFsdWUpO1xuYnJlYWs7XG5jYXNlIFN0cmluZzpcbmRlZmF1bHQ6XG5icmVhaztcbn1cbnJldHVybiB2YWx1ZTtcbn0sXG5zZXJpYWxpemU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbmNhc2UgJ2Jvb2xlYW4nOlxucmV0dXJuIHZhbHVlID8gJycgOiB1bmRlZmluZWQ7XG5jYXNlICdvYmplY3QnOlxuaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xucmV0dXJuIHZhbHVlO1xufSBlbHNlIGlmICh2YWx1ZSkge1xudHJ5IHtcbnJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG59IGNhdGNoICh4KSB7XG5yZXR1cm4gJyc7XG59XG59XG5kZWZhdWx0OlxucmV0dXJuIHZhbHVlICE9IG51bGwgPyB2YWx1ZSA6IHVuZGVmaW5lZDtcbn1cbn1cbn0pO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9zZXR1cERlYm91bmNlcnM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX2RlYm91bmNlcnMgPSB7fTtcbn0sXG5kZWJvdW5jZTogZnVuY3Rpb24gKGpvYk5hbWUsIGNhbGxiYWNrLCB3YWl0KSB7XG50aGlzLl9kZWJvdW5jZXJzW2pvYk5hbWVdID0gUG9seW1lci5EZWJvdW5jZS5jYWxsKHRoaXMsIHRoaXMuX2RlYm91bmNlcnNbam9iTmFtZV0sIGNhbGxiYWNrLCB3YWl0KTtcbn0sXG5pc0RlYm91bmNlckFjdGl2ZTogZnVuY3Rpb24gKGpvYk5hbWUpIHtcbnZhciBkZWJvdW5jZXIgPSB0aGlzLl9kZWJvdW5jZXJzW2pvYk5hbWVdO1xucmV0dXJuIGRlYm91bmNlciAmJiBkZWJvdW5jZXIuZmluaXNoO1xufSxcbmZsdXNoRGVib3VuY2VyOiBmdW5jdGlvbiAoam9iTmFtZSkge1xudmFyIGRlYm91bmNlciA9IHRoaXMuX2RlYm91bmNlcnNbam9iTmFtZV07XG5pZiAoZGVib3VuY2VyKSB7XG5kZWJvdW5jZXIuY29tcGxldGUoKTtcbn1cbn0sXG5jYW5jZWxEZWJvdW5jZXI6IGZ1bmN0aW9uIChqb2JOYW1lKSB7XG52YXIgZGVib3VuY2VyID0gdGhpcy5fZGVib3VuY2Vyc1tqb2JOYW1lXTtcbmlmIChkZWJvdW5jZXIpIHtcbmRlYm91bmNlci5zdG9wKCk7XG59XG59XG59KTtcblBvbHltZXIudmVyc2lvbiA9ICcxLjAuNic7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX3JlZ2lzdGVyRmVhdHVyZXM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3ByZXBJcygpO1xudGhpcy5fcHJlcEF0dHJpYnV0ZXMoKTtcbnRoaXMuX3ByZXBCZWhhdmlvcnMoKTtcbnRoaXMuX3ByZXBFeHRlbmRzKCk7XG50aGlzLl9wcmVwQ29uc3RydWN0b3IoKTtcbn0sXG5fcHJlcEJlaGF2aW9yOiBmdW5jdGlvbiAoYikge1xudGhpcy5fYWRkSG9zdEF0dHJpYnV0ZXMoYi5ob3N0QXR0cmlidXRlcyk7XG59LFxuX21hcnNoYWxCZWhhdmlvcjogZnVuY3Rpb24gKGIpIHtcbn0sXG5faW5pdEZlYXR1cmVzOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9tYXJzaGFsSG9zdEF0dHJpYnV0ZXMoKTtcbnRoaXMuX3NldHVwRGVib3VuY2VycygpO1xudGhpcy5fbWFyc2hhbEJlaGF2aW9ycygpO1xufVxufSk7XG59KSgpO1xuXG59KSIsInJlcXVpcmUoXCIuL3BvbHltZXItbWljcm8uaHRtbFwiKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZnVuY3Rpb24oKSB7XG47KGZ1bmN0aW9uKCkge1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9wcmVwVGVtcGxhdGU6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3RlbXBsYXRlID0gdGhpcy5fdGVtcGxhdGUgfHwgUG9seW1lci5Eb21Nb2R1bGUuaW1wb3J0KHRoaXMuaXMsICd0ZW1wbGF0ZScpO1xuaWYgKHRoaXMuX3RlbXBsYXRlICYmIHRoaXMuX3RlbXBsYXRlLmhhc0F0dHJpYnV0ZSgnaXMnKSkge1xudGhpcy5fd2Fybih0aGlzLl9sb2dmKCdfcHJlcFRlbXBsYXRlJywgJ3RvcC1sZXZlbCBQb2x5bWVyIHRlbXBsYXRlICcgKyAnbXVzdCBub3QgYmUgYSB0eXBlLWV4dGVuc2lvbiwgZm91bmQnLCB0aGlzLl90ZW1wbGF0ZSwgJ01vdmUgaW5zaWRlIHNpbXBsZSA8dGVtcGxhdGU+LicpKTtcbn1cbn0sXG5fc3RhbXBUZW1wbGF0ZTogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuX3RlbXBsYXRlKSB7XG50aGlzLnJvb3QgPSB0aGlzLmluc3RhbmNlVGVtcGxhdGUodGhpcy5fdGVtcGxhdGUpO1xufVxufSxcbmluc3RhbmNlVGVtcGxhdGU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSkge1xudmFyIGRvbSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuX2NvbnRlbnQgfHwgdGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG5yZXR1cm4gZG9tO1xufVxufSk7XG4oZnVuY3Rpb24gKCkge1xudmFyIGJhc2VBdHRhY2hlZENhbGxiYWNrID0gUG9seW1lci5CYXNlLmF0dGFjaGVkQ2FsbGJhY2s7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX2hvc3RTdGFjazogW10sXG5yZWFkeTogZnVuY3Rpb24gKCkge1xufSxcbl9wdXNoSG9zdDogZnVuY3Rpb24gKGhvc3QpIHtcbnRoaXMuZGF0YUhvc3QgPSBob3N0ID0gaG9zdCB8fCBQb2x5bWVyLkJhc2UuX2hvc3RTdGFja1tQb2x5bWVyLkJhc2UuX2hvc3RTdGFjay5sZW5ndGggLSAxXTtcbmlmIChob3N0ICYmIGhvc3QuX2NsaWVudHMpIHtcbmhvc3QuX2NsaWVudHMucHVzaCh0aGlzKTtcbn1cbnRoaXMuX2JlZ2luSG9zdCgpO1xufSxcbl9iZWdpbkhvc3Q6IGZ1bmN0aW9uICgpIHtcblBvbHltZXIuQmFzZS5faG9zdFN0YWNrLnB1c2godGhpcyk7XG5pZiAoIXRoaXMuX2NsaWVudHMpIHtcbnRoaXMuX2NsaWVudHMgPSBbXTtcbn1cbn0sXG5fcG9wSG9zdDogZnVuY3Rpb24gKCkge1xuUG9seW1lci5CYXNlLl9ob3N0U3RhY2sucG9wKCk7XG59LFxuX3RyeVJlYWR5OiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5fY2FuUmVhZHkoKSkge1xudGhpcy5fcmVhZHkoKTtcbn1cbn0sXG5fY2FuUmVhZHk6IGZ1bmN0aW9uICgpIHtcbnJldHVybiAhdGhpcy5kYXRhSG9zdCB8fCB0aGlzLmRhdGFIb3N0Ll9jbGllbnRzUmVhZGllZDtcbn0sXG5fcmVhZHk6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX2JlZm9yZUNsaWVudHNSZWFkeSgpO1xudGhpcy5fc2V0dXBSb290KCk7XG50aGlzLl9yZWFkeUNsaWVudHMoKTtcbnRoaXMuX2FmdGVyQ2xpZW50c1JlYWR5KCk7XG50aGlzLl9yZWFkeVNlbGYoKTtcbn0sXG5fcmVhZHlDbGllbnRzOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9iZWdpbkRpc3RyaWJ1dGUoKTtcbnZhciBjJCA9IHRoaXMuX2NsaWVudHM7XG5mb3IgKHZhciBpID0gMCwgbCA9IGMkLmxlbmd0aCwgYzsgaSA8IGwgJiYgKGMgPSBjJFtpXSk7IGkrKykge1xuYy5fcmVhZHkoKTtcbn1cbnRoaXMuX2ZpbmlzaERpc3RyaWJ1dGUoKTtcbnRoaXMuX2NsaWVudHNSZWFkaWVkID0gdHJ1ZTtcbnRoaXMuX2NsaWVudHMgPSBudWxsO1xufSxcbl9yZWFkeVNlbGY6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX2RvQmVoYXZpb3IoJ3JlYWR5Jyk7XG50aGlzLl9yZWFkaWVkID0gdHJ1ZTtcbmlmICh0aGlzLl9hdHRhY2hlZFBlbmRpbmcpIHtcbnRoaXMuX2F0dGFjaGVkUGVuZGluZyA9IGZhbHNlO1xudGhpcy5hdHRhY2hlZENhbGxiYWNrKCk7XG59XG59LFxuX2JlZm9yZUNsaWVudHNSZWFkeTogZnVuY3Rpb24gKCkge1xufSxcbl9hZnRlckNsaWVudHNSZWFkeTogZnVuY3Rpb24gKCkge1xufSxcbl9iZWZvcmVBdHRhY2hlZDogZnVuY3Rpb24gKCkge1xufSxcbmF0dGFjaGVkQ2FsbGJhY2s6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLl9yZWFkaWVkKSB7XG50aGlzLl9iZWZvcmVBdHRhY2hlZCgpO1xuYmFzZUF0dGFjaGVkQ2FsbGJhY2suY2FsbCh0aGlzKTtcbn0gZWxzZSB7XG50aGlzLl9hdHRhY2hlZFBlbmRpbmcgPSB0cnVlO1xufVxufVxufSk7XG59KCkpO1xuUG9seW1lci5BcnJheVNwbGljZSA9IGZ1bmN0aW9uICgpIHtcbmZ1bmN0aW9uIG5ld1NwbGljZShpbmRleCwgcmVtb3ZlZCwgYWRkZWRDb3VudCkge1xucmV0dXJuIHtcbmluZGV4OiBpbmRleCxcbnJlbW92ZWQ6IHJlbW92ZWQsXG5hZGRlZENvdW50OiBhZGRlZENvdW50XG59O1xufVxudmFyIEVESVRfTEVBVkUgPSAwO1xudmFyIEVESVRfVVBEQVRFID0gMTtcbnZhciBFRElUX0FERCA9IDI7XG52YXIgRURJVF9ERUxFVEUgPSAzO1xuZnVuY3Rpb24gQXJyYXlTcGxpY2UoKSB7XG59XG5BcnJheVNwbGljZS5wcm90b3R5cGUgPSB7XG5jYWxjRWRpdERpc3RhbmNlczogZnVuY3Rpb24gKGN1cnJlbnQsIGN1cnJlbnRTdGFydCwgY3VycmVudEVuZCwgb2xkLCBvbGRTdGFydCwgb2xkRW5kKSB7XG52YXIgcm93Q291bnQgPSBvbGRFbmQgLSBvbGRTdGFydCArIDE7XG52YXIgY29sdW1uQ291bnQgPSBjdXJyZW50RW5kIC0gY3VycmVudFN0YXJ0ICsgMTtcbnZhciBkaXN0YW5jZXMgPSBuZXcgQXJyYXkocm93Q291bnQpO1xuZm9yICh2YXIgaSA9IDA7IGkgPCByb3dDb3VudDsgaSsrKSB7XG5kaXN0YW5jZXNbaV0gPSBuZXcgQXJyYXkoY29sdW1uQ291bnQpO1xuZGlzdGFuY2VzW2ldWzBdID0gaTtcbn1cbmZvciAodmFyIGogPSAwOyBqIDwgY29sdW1uQ291bnQ7IGorKylcbmRpc3RhbmNlc1swXVtqXSA9IGo7XG5mb3IgKHZhciBpID0gMTsgaSA8IHJvd0NvdW50OyBpKyspIHtcbmZvciAodmFyIGogPSAxOyBqIDwgY29sdW1uQ291bnQ7IGorKykge1xuaWYgKHRoaXMuZXF1YWxzKGN1cnJlbnRbY3VycmVudFN0YXJ0ICsgaiAtIDFdLCBvbGRbb2xkU3RhcnQgKyBpIC0gMV0pKVxuZGlzdGFuY2VzW2ldW2pdID0gZGlzdGFuY2VzW2kgLSAxXVtqIC0gMV07XG5lbHNlIHtcbnZhciBub3J0aCA9IGRpc3RhbmNlc1tpIC0gMV1bal0gKyAxO1xudmFyIHdlc3QgPSBkaXN0YW5jZXNbaV1baiAtIDFdICsgMTtcbmRpc3RhbmNlc1tpXVtqXSA9IG5vcnRoIDwgd2VzdCA/IG5vcnRoIDogd2VzdDtcbn1cbn1cbn1cbnJldHVybiBkaXN0YW5jZXM7XG59LFxuc3BsaWNlT3BlcmF0aW9uc0Zyb21FZGl0RGlzdGFuY2VzOiBmdW5jdGlvbiAoZGlzdGFuY2VzKSB7XG52YXIgaSA9IGRpc3RhbmNlcy5sZW5ndGggLSAxO1xudmFyIGogPSBkaXN0YW5jZXNbMF0ubGVuZ3RoIC0gMTtcbnZhciBjdXJyZW50ID0gZGlzdGFuY2VzW2ldW2pdO1xudmFyIGVkaXRzID0gW107XG53aGlsZSAoaSA+IDAgfHwgaiA+IDApIHtcbmlmIChpID09IDApIHtcbmVkaXRzLnB1c2goRURJVF9BREQpO1xuai0tO1xuY29udGludWU7XG59XG5pZiAoaiA9PSAwKSB7XG5lZGl0cy5wdXNoKEVESVRfREVMRVRFKTtcbmktLTtcbmNvbnRpbnVlO1xufVxudmFyIG5vcnRoV2VzdCA9IGRpc3RhbmNlc1tpIC0gMV1baiAtIDFdO1xudmFyIHdlc3QgPSBkaXN0YW5jZXNbaSAtIDFdW2pdO1xudmFyIG5vcnRoID0gZGlzdGFuY2VzW2ldW2ogLSAxXTtcbnZhciBtaW47XG5pZiAod2VzdCA8IG5vcnRoKVxubWluID0gd2VzdCA8IG5vcnRoV2VzdCA/IHdlc3QgOiBub3J0aFdlc3Q7XG5lbHNlXG5taW4gPSBub3J0aCA8IG5vcnRoV2VzdCA/IG5vcnRoIDogbm9ydGhXZXN0O1xuaWYgKG1pbiA9PSBub3J0aFdlc3QpIHtcbmlmIChub3J0aFdlc3QgPT0gY3VycmVudCkge1xuZWRpdHMucHVzaChFRElUX0xFQVZFKTtcbn0gZWxzZSB7XG5lZGl0cy5wdXNoKEVESVRfVVBEQVRFKTtcbmN1cnJlbnQgPSBub3J0aFdlc3Q7XG59XG5pLS07XG5qLS07XG59IGVsc2UgaWYgKG1pbiA9PSB3ZXN0KSB7XG5lZGl0cy5wdXNoKEVESVRfREVMRVRFKTtcbmktLTtcbmN1cnJlbnQgPSB3ZXN0O1xufSBlbHNlIHtcbmVkaXRzLnB1c2goRURJVF9BREQpO1xuai0tO1xuY3VycmVudCA9IG5vcnRoO1xufVxufVxuZWRpdHMucmV2ZXJzZSgpO1xucmV0dXJuIGVkaXRzO1xufSxcbmNhbGNTcGxpY2VzOiBmdW5jdGlvbiAoY3VycmVudCwgY3VycmVudFN0YXJ0LCBjdXJyZW50RW5kLCBvbGQsIG9sZFN0YXJ0LCBvbGRFbmQpIHtcbnZhciBwcmVmaXhDb3VudCA9IDA7XG52YXIgc3VmZml4Q291bnQgPSAwO1xudmFyIG1pbkxlbmd0aCA9IE1hdGgubWluKGN1cnJlbnRFbmQgLSBjdXJyZW50U3RhcnQsIG9sZEVuZCAtIG9sZFN0YXJ0KTtcbmlmIChjdXJyZW50U3RhcnQgPT0gMCAmJiBvbGRTdGFydCA9PSAwKVxucHJlZml4Q291bnQgPSB0aGlzLnNoYXJlZFByZWZpeChjdXJyZW50LCBvbGQsIG1pbkxlbmd0aCk7XG5pZiAoY3VycmVudEVuZCA9PSBjdXJyZW50Lmxlbmd0aCAmJiBvbGRFbmQgPT0gb2xkLmxlbmd0aClcbnN1ZmZpeENvdW50ID0gdGhpcy5zaGFyZWRTdWZmaXgoY3VycmVudCwgb2xkLCBtaW5MZW5ndGggLSBwcmVmaXhDb3VudCk7XG5jdXJyZW50U3RhcnQgKz0gcHJlZml4Q291bnQ7XG5vbGRTdGFydCArPSBwcmVmaXhDb3VudDtcbmN1cnJlbnRFbmQgLT0gc3VmZml4Q291bnQ7XG5vbGRFbmQgLT0gc3VmZml4Q291bnQ7XG5pZiAoY3VycmVudEVuZCAtIGN1cnJlbnRTdGFydCA9PSAwICYmIG9sZEVuZCAtIG9sZFN0YXJ0ID09IDApXG5yZXR1cm4gW107XG5pZiAoY3VycmVudFN0YXJ0ID09IGN1cnJlbnRFbmQpIHtcbnZhciBzcGxpY2UgPSBuZXdTcGxpY2UoY3VycmVudFN0YXJ0LCBbXSwgMCk7XG53aGlsZSAob2xkU3RhcnQgPCBvbGRFbmQpXG5zcGxpY2UucmVtb3ZlZC5wdXNoKG9sZFtvbGRTdGFydCsrXSk7XG5yZXR1cm4gW3NwbGljZV07XG59IGVsc2UgaWYgKG9sZFN0YXJ0ID09IG9sZEVuZClcbnJldHVybiBbbmV3U3BsaWNlKGN1cnJlbnRTdGFydCwgW10sIGN1cnJlbnRFbmQgLSBjdXJyZW50U3RhcnQpXTtcbnZhciBvcHMgPSB0aGlzLnNwbGljZU9wZXJhdGlvbnNGcm9tRWRpdERpc3RhbmNlcyh0aGlzLmNhbGNFZGl0RGlzdGFuY2VzKGN1cnJlbnQsIGN1cnJlbnRTdGFydCwgY3VycmVudEVuZCwgb2xkLCBvbGRTdGFydCwgb2xkRW5kKSk7XG52YXIgc3BsaWNlID0gdW5kZWZpbmVkO1xudmFyIHNwbGljZXMgPSBbXTtcbnZhciBpbmRleCA9IGN1cnJlbnRTdGFydDtcbnZhciBvbGRJbmRleCA9IG9sZFN0YXJ0O1xuZm9yICh2YXIgaSA9IDA7IGkgPCBvcHMubGVuZ3RoOyBpKyspIHtcbnN3aXRjaCAob3BzW2ldKSB7XG5jYXNlIEVESVRfTEVBVkU6XG5pZiAoc3BsaWNlKSB7XG5zcGxpY2VzLnB1c2goc3BsaWNlKTtcbnNwbGljZSA9IHVuZGVmaW5lZDtcbn1cbmluZGV4Kys7XG5vbGRJbmRleCsrO1xuYnJlYWs7XG5jYXNlIEVESVRfVVBEQVRFOlxuaWYgKCFzcGxpY2UpXG5zcGxpY2UgPSBuZXdTcGxpY2UoaW5kZXgsIFtdLCAwKTtcbnNwbGljZS5hZGRlZENvdW50Kys7XG5pbmRleCsrO1xuc3BsaWNlLnJlbW92ZWQucHVzaChvbGRbb2xkSW5kZXhdKTtcbm9sZEluZGV4Kys7XG5icmVhaztcbmNhc2UgRURJVF9BREQ6XG5pZiAoIXNwbGljZSlcbnNwbGljZSA9IG5ld1NwbGljZShpbmRleCwgW10sIDApO1xuc3BsaWNlLmFkZGVkQ291bnQrKztcbmluZGV4Kys7XG5icmVhaztcbmNhc2UgRURJVF9ERUxFVEU6XG5pZiAoIXNwbGljZSlcbnNwbGljZSA9IG5ld1NwbGljZShpbmRleCwgW10sIDApO1xuc3BsaWNlLnJlbW92ZWQucHVzaChvbGRbb2xkSW5kZXhdKTtcbm9sZEluZGV4Kys7XG5icmVhaztcbn1cbn1cbmlmIChzcGxpY2UpIHtcbnNwbGljZXMucHVzaChzcGxpY2UpO1xufVxucmV0dXJuIHNwbGljZXM7XG59LFxuc2hhcmVkUHJlZml4OiBmdW5jdGlvbiAoY3VycmVudCwgb2xkLCBzZWFyY2hMZW5ndGgpIHtcbmZvciAodmFyIGkgPSAwOyBpIDwgc2VhcmNoTGVuZ3RoOyBpKyspXG5pZiAoIXRoaXMuZXF1YWxzKGN1cnJlbnRbaV0sIG9sZFtpXSkpXG5yZXR1cm4gaTtcbnJldHVybiBzZWFyY2hMZW5ndGg7XG59LFxuc2hhcmVkU3VmZml4OiBmdW5jdGlvbiAoY3VycmVudCwgb2xkLCBzZWFyY2hMZW5ndGgpIHtcbnZhciBpbmRleDEgPSBjdXJyZW50Lmxlbmd0aDtcbnZhciBpbmRleDIgPSBvbGQubGVuZ3RoO1xudmFyIGNvdW50ID0gMDtcbndoaWxlIChjb3VudCA8IHNlYXJjaExlbmd0aCAmJiB0aGlzLmVxdWFscyhjdXJyZW50Wy0taW5kZXgxXSwgb2xkWy0taW5kZXgyXSkpXG5jb3VudCsrO1xucmV0dXJuIGNvdW50O1xufSxcbmNhbGN1bGF0ZVNwbGljZXM6IGZ1bmN0aW9uIChjdXJyZW50LCBwcmV2aW91cykge1xucmV0dXJuIHRoaXMuY2FsY1NwbGljZXMoY3VycmVudCwgMCwgY3VycmVudC5sZW5ndGgsIHByZXZpb3VzLCAwLCBwcmV2aW91cy5sZW5ndGgpO1xufSxcbmVxdWFsczogZnVuY3Rpb24gKGN1cnJlbnRWYWx1ZSwgcHJldmlvdXNWYWx1ZSkge1xucmV0dXJuIGN1cnJlbnRWYWx1ZSA9PT0gcHJldmlvdXNWYWx1ZTtcbn1cbn07XG5yZXR1cm4gbmV3IEFycmF5U3BsaWNlKCk7XG59KCk7XG5Qb2x5bWVyLkV2ZW50QXBpID0gZnVuY3Rpb24gKCkge1xudmFyIFNldHRpbmdzID0gUG9seW1lci5TZXR0aW5ncztcbnZhciBFdmVudEFwaSA9IGZ1bmN0aW9uIChldmVudCkge1xudGhpcy5ldmVudCA9IGV2ZW50O1xufTtcbmlmIChTZXR0aW5ncy51c2VTaGFkb3cpIHtcbkV2ZW50QXBpLnByb3RvdHlwZSA9IHtcbmdldCByb290VGFyZ2V0KCkge1xucmV0dXJuIHRoaXMuZXZlbnQucGF0aFswXTtcbn0sXG5nZXQgbG9jYWxUYXJnZXQoKSB7XG5yZXR1cm4gdGhpcy5ldmVudC50YXJnZXQ7XG59LFxuZ2V0IHBhdGgoKSB7XG5yZXR1cm4gdGhpcy5ldmVudC5wYXRoO1xufVxufTtcbn0gZWxzZSB7XG5FdmVudEFwaS5wcm90b3R5cGUgPSB7XG5nZXQgcm9vdFRhcmdldCgpIHtcbnJldHVybiB0aGlzLmV2ZW50LnRhcmdldDtcbn0sXG5nZXQgbG9jYWxUYXJnZXQoKSB7XG52YXIgY3VycmVudCA9IHRoaXMuZXZlbnQuY3VycmVudFRhcmdldDtcbnZhciBjdXJyZW50Um9vdCA9IGN1cnJlbnQgJiYgUG9seW1lci5kb20oY3VycmVudCkuZ2V0T3duZXJSb290KCk7XG52YXIgcCQgPSB0aGlzLnBhdGg7XG5mb3IgKHZhciBpID0gMDsgaSA8IHAkLmxlbmd0aDsgaSsrKSB7XG5pZiAoUG9seW1lci5kb20ocCRbaV0pLmdldE93bmVyUm9vdCgpID09PSBjdXJyZW50Um9vdCkge1xucmV0dXJuIHAkW2ldO1xufVxufVxufSxcbmdldCBwYXRoKCkge1xuaWYgKCF0aGlzLmV2ZW50Ll9wYXRoKSB7XG52YXIgcGF0aCA9IFtdO1xudmFyIG8gPSB0aGlzLnJvb3RUYXJnZXQ7XG53aGlsZSAobykge1xucGF0aC5wdXNoKG8pO1xubyA9IFBvbHltZXIuZG9tKG8pLnBhcmVudE5vZGUgfHwgby5ob3N0O1xufVxucGF0aC5wdXNoKHdpbmRvdyk7XG50aGlzLmV2ZW50Ll9wYXRoID0gcGF0aDtcbn1cbnJldHVybiB0aGlzLmV2ZW50Ll9wYXRoO1xufVxufTtcbn1cbnZhciBmYWN0b3J5ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5pZiAoIWV2ZW50Ll9fZXZlbnRBcGkpIHtcbmV2ZW50Ll9fZXZlbnRBcGkgPSBuZXcgRXZlbnRBcGkoZXZlbnQpO1xufVxucmV0dXJuIGV2ZW50Ll9fZXZlbnRBcGk7XG59O1xucmV0dXJuIHsgZmFjdG9yeTogZmFjdG9yeSB9O1xufSgpO1xuUG9seW1lci5kb21Jbm5lckhUTUwgPSBmdW5jdGlvbiAoKSB7XG52YXIgZXNjYXBlQXR0clJlZ0V4cCA9IC9bJlxcdTAwQTBcIl0vZztcbnZhciBlc2NhcGVEYXRhUmVnRXhwID0gL1smXFx1MDBBMDw+XS9nO1xuZnVuY3Rpb24gZXNjYXBlUmVwbGFjZShjKSB7XG5zd2l0Y2ggKGMpIHtcbmNhc2UgJyYnOlxucmV0dXJuICcmYW1wOyc7XG5jYXNlICc8JzpcbnJldHVybiAnJmx0Oyc7XG5jYXNlICc+JzpcbnJldHVybiAnJmd0Oyc7XG5jYXNlICdcIic6XG5yZXR1cm4gJyZxdW90Oyc7XG5jYXNlICdcXHhBMCc6XG5yZXR1cm4gJyZuYnNwOyc7XG59XG59XG5mdW5jdGlvbiBlc2NhcGVBdHRyKHMpIHtcbnJldHVybiBzLnJlcGxhY2UoZXNjYXBlQXR0clJlZ0V4cCwgZXNjYXBlUmVwbGFjZSk7XG59XG5mdW5jdGlvbiBlc2NhcGVEYXRhKHMpIHtcbnJldHVybiBzLnJlcGxhY2UoZXNjYXBlRGF0YVJlZ0V4cCwgZXNjYXBlUmVwbGFjZSk7XG59XG5mdW5jdGlvbiBtYWtlU2V0KGFycikge1xudmFyIHNldCA9IHt9O1xuZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbnNldFthcnJbaV1dID0gdHJ1ZTtcbn1cbnJldHVybiBzZXQ7XG59XG52YXIgdm9pZEVsZW1lbnRzID0gbWFrZVNldChbXG4nYXJlYScsXG4nYmFzZScsXG4nYnInLFxuJ2NvbCcsXG4nY29tbWFuZCcsXG4nZW1iZWQnLFxuJ2hyJyxcbidpbWcnLFxuJ2lucHV0JyxcbidrZXlnZW4nLFxuJ2xpbmsnLFxuJ21ldGEnLFxuJ3BhcmFtJyxcbidzb3VyY2UnLFxuJ3RyYWNrJyxcbid3YnInXG5dKTtcbnZhciBwbGFpbnRleHRQYXJlbnRzID0gbWFrZVNldChbXG4nc3R5bGUnLFxuJ3NjcmlwdCcsXG4neG1wJyxcbidpZnJhbWUnLFxuJ25vZW1iZWQnLFxuJ25vZnJhbWVzJyxcbidwbGFpbnRleHQnLFxuJ25vc2NyaXB0J1xuXSk7XG5mdW5jdGlvbiBnZXRPdXRlckhUTUwobm9kZSwgcGFyZW50Tm9kZSwgY29tcG9zZWQpIHtcbnN3aXRjaCAobm9kZS5ub2RlVHlwZSkge1xuY2FzZSBOb2RlLkVMRU1FTlRfTk9ERTpcbnZhciB0YWdOYW1lID0gbm9kZS5sb2NhbE5hbWU7XG52YXIgcyA9ICc8JyArIHRhZ05hbWU7XG52YXIgYXR0cnMgPSBub2RlLmF0dHJpYnV0ZXM7XG5mb3IgKHZhciBpID0gMCwgYXR0cjsgYXR0ciA9IGF0dHJzW2ldOyBpKyspIHtcbnMgKz0gJyAnICsgYXR0ci5uYW1lICsgJz1cIicgKyBlc2NhcGVBdHRyKGF0dHIudmFsdWUpICsgJ1wiJztcbn1cbnMgKz0gJz4nO1xuaWYgKHZvaWRFbGVtZW50c1t0YWdOYW1lXSkge1xucmV0dXJuIHM7XG59XG5yZXR1cm4gcyArIGdldElubmVySFRNTChub2RlLCBjb21wb3NlZCkgKyAnPC8nICsgdGFnTmFtZSArICc+JztcbmNhc2UgTm9kZS5URVhUX05PREU6XG52YXIgZGF0YSA9IG5vZGUuZGF0YTtcbmlmIChwYXJlbnROb2RlICYmIHBsYWludGV4dFBhcmVudHNbcGFyZW50Tm9kZS5sb2NhbE5hbWVdKSB7XG5yZXR1cm4gZGF0YTtcbn1cbnJldHVybiBlc2NhcGVEYXRhKGRhdGEpO1xuY2FzZSBOb2RlLkNPTU1FTlRfTk9ERTpcbnJldHVybiAnPCEtLScgKyBub2RlLmRhdGEgKyAnLS0+JztcbmRlZmF1bHQ6XG5jb25zb2xlLmVycm9yKG5vZGUpO1xudGhyb3cgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKTtcbn1cbn1cbmZ1bmN0aW9uIGdldElubmVySFRNTChub2RlLCBjb21wb3NlZCkge1xuaWYgKG5vZGUgaW5zdGFuY2VvZiBIVE1MVGVtcGxhdGVFbGVtZW50KVxubm9kZSA9IG5vZGUuY29udGVudDtcbnZhciBzID0gJyc7XG52YXIgYyQgPSBQb2x5bWVyLmRvbShub2RlKS5jaGlsZE5vZGVzO1xuYyQgPSBjb21wb3NlZCA/IG5vZGUuX2NvbXBvc2VkQ2hpbGRyZW4gOiBjJDtcbmZvciAodmFyIGkgPSAwLCBsID0gYyQubGVuZ3RoLCBjaGlsZDsgaSA8IGwgJiYgKGNoaWxkID0gYyRbaV0pOyBpKyspIHtcbnMgKz0gZ2V0T3V0ZXJIVE1MKGNoaWxkLCBub2RlLCBjb21wb3NlZCk7XG59XG5yZXR1cm4gcztcbn1cbnJldHVybiB7IGdldElubmVySFRNTDogZ2V0SW5uZXJIVE1MIH07XG59KCk7XG5Qb2x5bWVyLkRvbUFwaSA9IGZ1bmN0aW9uICgpIHtcbid1c2Ugc3RyaWN0JztcbnZhciBTZXR0aW5ncyA9IFBvbHltZXIuU2V0dGluZ3M7XG52YXIgZ2V0SW5uZXJIVE1MID0gUG9seW1lci5kb21Jbm5lckhUTUwuZ2V0SW5uZXJIVE1MO1xudmFyIG5hdGl2ZUluc2VydEJlZm9yZSA9IEVsZW1lbnQucHJvdG90eXBlLmluc2VydEJlZm9yZTtcbnZhciBuYXRpdmVSZW1vdmVDaGlsZCA9IEVsZW1lbnQucHJvdG90eXBlLnJlbW92ZUNoaWxkO1xudmFyIG5hdGl2ZUFwcGVuZENoaWxkID0gRWxlbWVudC5wcm90b3R5cGUuYXBwZW5kQ2hpbGQ7XG52YXIgbmF0aXZlQ2xvbmVOb2RlID0gRWxlbWVudC5wcm90b3R5cGUuY2xvbmVOb2RlO1xudmFyIG5hdGl2ZUltcG9ydE5vZGUgPSBEb2N1bWVudC5wcm90b3R5cGUuaW1wb3J0Tm9kZTtcbnZhciBkaXJ0eVJvb3RzID0gW107XG52YXIgRG9tQXBpID0gZnVuY3Rpb24gKG5vZGUpIHtcbnRoaXMubm9kZSA9IG5vZGU7XG5pZiAodGhpcy5wYXRjaCkge1xudGhpcy5wYXRjaCgpO1xufVxufTtcbkRvbUFwaS5wcm90b3R5cGUgPSB7XG5mbHVzaDogZnVuY3Rpb24gKCkge1xuZm9yICh2YXIgaSA9IDAsIGhvc3Q7IGkgPCBkaXJ0eVJvb3RzLmxlbmd0aDsgaSsrKSB7XG5ob3N0ID0gZGlydHlSb290c1tpXTtcbmhvc3QuZmx1c2hEZWJvdW5jZXIoJ19kaXN0cmlidXRlJyk7XG59XG5kaXJ0eVJvb3RzID0gW107XG59LFxuX2xhenlEaXN0cmlidXRlOiBmdW5jdGlvbiAoaG9zdCkge1xuaWYgKGhvc3Quc2hhZHlSb290ICYmIGhvc3Quc2hhZHlSb290Ll9kaXN0cmlidXRpb25DbGVhbikge1xuaG9zdC5zaGFkeVJvb3QuX2Rpc3RyaWJ1dGlvbkNsZWFuID0gZmFsc2U7XG5ob3N0LmRlYm91bmNlKCdfZGlzdHJpYnV0ZScsIGhvc3QuX2Rpc3RyaWJ1dGVDb250ZW50KTtcbmRpcnR5Um9vdHMucHVzaChob3N0KTtcbn1cbn0sXG5hcHBlbmRDaGlsZDogZnVuY3Rpb24gKG5vZGUpIHtcbnZhciBoYW5kbGVkO1xudGhpcy5fcmVtb3ZlTm9kZUZyb21Ib3N0KG5vZGUsIHRydWUpO1xuaWYgKHRoaXMuX25vZGVJc0luTG9naWNhbFRyZWUodGhpcy5ub2RlKSkge1xudGhpcy5fYWRkTG9naWNhbEluZm8obm9kZSwgdGhpcy5ub2RlKTtcbnRoaXMuX2FkZE5vZGVUb0hvc3Qobm9kZSk7XG5oYW5kbGVkID0gdGhpcy5fbWF5YmVEaXN0cmlidXRlKG5vZGUsIHRoaXMubm9kZSk7XG59XG5pZiAoIWhhbmRsZWQgJiYgIXRoaXMuX3RyeVJlbW92ZVVuZGlzdHJpYnV0ZWROb2RlKG5vZGUpKSB7XG52YXIgY29udGFpbmVyID0gdGhpcy5ub2RlLl9pc1NoYWR5Um9vdCA/IHRoaXMubm9kZS5ob3N0IDogdGhpcy5ub2RlO1xuYWRkVG9Db21wb3NlZFBhcmVudChjb250YWluZXIsIG5vZGUpO1xubmF0aXZlQXBwZW5kQ2hpbGQuY2FsbChjb250YWluZXIsIG5vZGUpO1xufVxucmV0dXJuIG5vZGU7XG59LFxuaW5zZXJ0QmVmb3JlOiBmdW5jdGlvbiAobm9kZSwgcmVmX25vZGUpIHtcbmlmICghcmVmX25vZGUpIHtcbnJldHVybiB0aGlzLmFwcGVuZENoaWxkKG5vZGUpO1xufVxudmFyIGhhbmRsZWQ7XG50aGlzLl9yZW1vdmVOb2RlRnJvbUhvc3Qobm9kZSwgdHJ1ZSk7XG5pZiAodGhpcy5fbm9kZUlzSW5Mb2dpY2FsVHJlZSh0aGlzLm5vZGUpKSB7XG5zYXZlTGlnaHRDaGlsZHJlbklmTmVlZGVkKHRoaXMubm9kZSk7XG52YXIgY2hpbGRyZW4gPSB0aGlzLmNoaWxkTm9kZXM7XG52YXIgaW5kZXggPSBjaGlsZHJlbi5pbmRleE9mKHJlZl9ub2RlKTtcbmlmIChpbmRleCA8IDApIHtcbnRocm93IEVycm9yKCdUaGUgcmVmX25vZGUgdG8gYmUgaW5zZXJ0ZWQgYmVmb3JlIGlzIG5vdCBhIGNoaWxkICcgKyAnb2YgdGhpcyBub2RlJyk7XG59XG50aGlzLl9hZGRMb2dpY2FsSW5mbyhub2RlLCB0aGlzLm5vZGUsIGluZGV4KTtcbnRoaXMuX2FkZE5vZGVUb0hvc3Qobm9kZSk7XG5oYW5kbGVkID0gdGhpcy5fbWF5YmVEaXN0cmlidXRlKG5vZGUsIHRoaXMubm9kZSk7XG59XG5pZiAoIWhhbmRsZWQgJiYgIXRoaXMuX3RyeVJlbW92ZVVuZGlzdHJpYnV0ZWROb2RlKG5vZGUpKSB7XG5yZWZfbm9kZSA9IHJlZl9ub2RlLmxvY2FsTmFtZSA9PT0gQ09OVEVOVCA/IHRoaXMuX2ZpcnN0Q29tcG9zZWROb2RlKHJlZl9ub2RlKSA6IHJlZl9ub2RlO1xudmFyIGNvbnRhaW5lciA9IHRoaXMubm9kZS5faXNTaGFkeVJvb3QgPyB0aGlzLm5vZGUuaG9zdCA6IHRoaXMubm9kZTtcbmFkZFRvQ29tcG9zZWRQYXJlbnQoY29udGFpbmVyLCBub2RlLCByZWZfbm9kZSk7XG5uYXRpdmVJbnNlcnRCZWZvcmUuY2FsbChjb250YWluZXIsIG5vZGUsIHJlZl9ub2RlKTtcbn1cbnJldHVybiBub2RlO1xufSxcbnJlbW92ZUNoaWxkOiBmdW5jdGlvbiAobm9kZSkge1xuaWYgKGZhY3Rvcnkobm9kZSkucGFyZW50Tm9kZSAhPT0gdGhpcy5ub2RlKSB7XG5jb25zb2xlLndhcm4oJ1RoZSBub2RlIHRvIGJlIHJlbW92ZWQgaXMgbm90IGEgY2hpbGQgb2YgdGhpcyBub2RlJywgbm9kZSk7XG59XG52YXIgaGFuZGxlZDtcbmlmICh0aGlzLl9ub2RlSXNJbkxvZ2ljYWxUcmVlKHRoaXMubm9kZSkpIHtcbnRoaXMuX3JlbW92ZU5vZGVGcm9tSG9zdChub2RlKTtcbmhhbmRsZWQgPSB0aGlzLl9tYXliZURpc3RyaWJ1dGUobm9kZSwgdGhpcy5ub2RlKTtcbn1cbmlmICghaGFuZGxlZCkge1xudmFyIGNvbnRhaW5lciA9IHRoaXMubm9kZS5faXNTaGFkeVJvb3QgPyB0aGlzLm5vZGUuaG9zdCA6IHRoaXMubm9kZTtcbmlmIChjb250YWluZXIgPT09IG5vZGUucGFyZW50Tm9kZSkge1xucmVtb3ZlRnJvbUNvbXBvc2VkUGFyZW50KGNvbnRhaW5lciwgbm9kZSk7XG5uYXRpdmVSZW1vdmVDaGlsZC5jYWxsKGNvbnRhaW5lciwgbm9kZSk7XG59XG59XG5yZXR1cm4gbm9kZTtcbn0sXG5yZXBsYWNlQ2hpbGQ6IGZ1bmN0aW9uIChub2RlLCByZWZfbm9kZSkge1xudGhpcy5pbnNlcnRCZWZvcmUobm9kZSwgcmVmX25vZGUpO1xudGhpcy5yZW1vdmVDaGlsZChyZWZfbm9kZSk7XG5yZXR1cm4gbm9kZTtcbn0sXG5nZXRPd25lclJvb3Q6IGZ1bmN0aW9uICgpIHtcbnJldHVybiB0aGlzLl9vd25lclNoYWR5Um9vdEZvck5vZGUodGhpcy5ub2RlKTtcbn0sXG5fb3duZXJTaGFkeVJvb3RGb3JOb2RlOiBmdW5jdGlvbiAobm9kZSkge1xuaWYgKCFub2RlKSB7XG5yZXR1cm47XG59XG5pZiAobm9kZS5fb3duZXJTaGFkeVJvb3QgPT09IHVuZGVmaW5lZCkge1xudmFyIHJvb3Q7XG5pZiAobm9kZS5faXNTaGFkeVJvb3QpIHtcbnJvb3QgPSBub2RlO1xufSBlbHNlIHtcbnZhciBwYXJlbnQgPSBQb2x5bWVyLmRvbShub2RlKS5wYXJlbnROb2RlO1xuaWYgKHBhcmVudCkge1xucm9vdCA9IHBhcmVudC5faXNTaGFkeVJvb3QgPyBwYXJlbnQgOiB0aGlzLl9vd25lclNoYWR5Um9vdEZvck5vZGUocGFyZW50KTtcbn0gZWxzZSB7XG5yb290ID0gbnVsbDtcbn1cbn1cbm5vZGUuX293bmVyU2hhZHlSb290ID0gcm9vdDtcbn1cbnJldHVybiBub2RlLl9vd25lclNoYWR5Um9vdDtcbn0sXG5fbWF5YmVEaXN0cmlidXRlOiBmdW5jdGlvbiAobm9kZSwgcGFyZW50KSB7XG52YXIgZnJhZ0NvbnRlbnQgPSBub2RlLm5vZGVUeXBlID09PSBOb2RlLkRPQ1VNRU5UX0ZSQUdNRU5UX05PREUgJiYgIW5vZGUuX19ub0NvbnRlbnQgJiYgUG9seW1lci5kb20obm9kZSkucXVlcnlTZWxlY3RvcihDT05URU5UKTtcbnZhciB3cmFwcGVkQ29udGVudCA9IGZyYWdDb250ZW50ICYmIFBvbHltZXIuZG9tKGZyYWdDb250ZW50KS5wYXJlbnROb2RlLm5vZGVUeXBlICE9PSBOb2RlLkRPQ1VNRU5UX0ZSQUdNRU5UX05PREU7XG52YXIgaGFzQ29udGVudCA9IGZyYWdDb250ZW50IHx8IG5vZGUubG9jYWxOYW1lID09PSBDT05URU5UO1xuaWYgKGhhc0NvbnRlbnQpIHtcbnZhciByb290ID0gdGhpcy5fb3duZXJTaGFkeVJvb3RGb3JOb2RlKHBhcmVudCk7XG5pZiAocm9vdCkge1xudmFyIGhvc3QgPSByb290Lmhvc3Q7XG50aGlzLl91cGRhdGVJbnNlcnRpb25Qb2ludHMoaG9zdCk7XG50aGlzLl9sYXp5RGlzdHJpYnV0ZShob3N0KTtcbn1cbn1cbnZhciBwYXJlbnROZWVkc0Rpc3QgPSB0aGlzLl9wYXJlbnROZWVkc0Rpc3RyaWJ1dGlvbihwYXJlbnQpO1xuaWYgKHBhcmVudE5lZWRzRGlzdCkge1xudGhpcy5fbGF6eURpc3RyaWJ1dGUocGFyZW50KTtcbn1cbnJldHVybiBwYXJlbnROZWVkc0Rpc3QgfHwgaGFzQ29udGVudCAmJiAhd3JhcHBlZENvbnRlbnQ7XG59LFxuX3RyeVJlbW92ZVVuZGlzdHJpYnV0ZWROb2RlOiBmdW5jdGlvbiAobm9kZSkge1xuaWYgKHRoaXMubm9kZS5zaGFkeVJvb3QpIHtcbmlmIChub2RlLl9jb21wb3NlZFBhcmVudCkge1xubmF0aXZlUmVtb3ZlQ2hpbGQuY2FsbChub2RlLl9jb21wb3NlZFBhcmVudCwgbm9kZSk7XG59XG5yZXR1cm4gdHJ1ZTtcbn1cbn0sXG5fdXBkYXRlSW5zZXJ0aW9uUG9pbnRzOiBmdW5jdGlvbiAoaG9zdCkge1xuaG9zdC5zaGFkeVJvb3QuX2luc2VydGlvblBvaW50cyA9IGZhY3RvcnkoaG9zdC5zaGFkeVJvb3QpLnF1ZXJ5U2VsZWN0b3JBbGwoQ09OVEVOVCk7XG59LFxuX25vZGVJc0luTG9naWNhbFRyZWU6IGZ1bmN0aW9uIChub2RlKSB7XG5yZXR1cm4gQm9vbGVhbihub2RlLl9saWdodFBhcmVudCAhPT0gdW5kZWZpbmVkIHx8IG5vZGUuX2lzU2hhZHlSb290IHx8IHRoaXMuX293bmVyU2hhZHlSb290Rm9yTm9kZShub2RlKSB8fCBub2RlLnNoYWR5Um9vdCk7XG59LFxuX3BhcmVudE5lZWRzRGlzdHJpYnV0aW9uOiBmdW5jdGlvbiAocGFyZW50KSB7XG5yZXR1cm4gcGFyZW50ICYmIHBhcmVudC5zaGFkeVJvb3QgJiYgaGFzSW5zZXJ0aW9uUG9pbnQocGFyZW50LnNoYWR5Um9vdCk7XG59LFxuX3JlbW92ZU5vZGVGcm9tSG9zdDogZnVuY3Rpb24gKG5vZGUsIGVuc3VyZUNvbXBvc2VkUmVtb3ZhbCkge1xudmFyIGhvc3ROZWVkc0Rpc3Q7XG52YXIgcm9vdDtcbnZhciBwYXJlbnQgPSBub2RlLl9saWdodFBhcmVudDtcbmlmIChwYXJlbnQpIHtcbnJvb3QgPSB0aGlzLl9vd25lclNoYWR5Um9vdEZvck5vZGUobm9kZSk7XG5pZiAocm9vdCkge1xucm9vdC5ob3N0Ll9lbGVtZW50UmVtb3ZlKG5vZGUpO1xuaG9zdE5lZWRzRGlzdCA9IHRoaXMuX3JlbW92ZURpc3RyaWJ1dGVkQ2hpbGRyZW4ocm9vdCwgbm9kZSk7XG59XG50aGlzLl9yZW1vdmVMb2dpY2FsSW5mbyhub2RlLCBub2RlLl9saWdodFBhcmVudCk7XG59XG50aGlzLl9yZW1vdmVPd25lclNoYWR5Um9vdChub2RlKTtcbmlmIChyb290ICYmIGhvc3ROZWVkc0Rpc3QpIHtcbnRoaXMuX3VwZGF0ZUluc2VydGlvblBvaW50cyhyb290Lmhvc3QpO1xudGhpcy5fbGF6eURpc3RyaWJ1dGUocm9vdC5ob3N0KTtcbn0gZWxzZSBpZiAoZW5zdXJlQ29tcG9zZWRSZW1vdmFsKSB7XG5yZW1vdmVGcm9tQ29tcG9zZWRQYXJlbnQocGFyZW50IHx8IG5vZGUucGFyZW50Tm9kZSwgbm9kZSk7XG59XG59LFxuX3JlbW92ZURpc3RyaWJ1dGVkQ2hpbGRyZW46IGZ1bmN0aW9uIChyb290LCBjb250YWluZXIpIHtcbnZhciBob3N0TmVlZHNEaXN0O1xudmFyIGlwJCA9IHJvb3QuX2luc2VydGlvblBvaW50cztcbmZvciAodmFyIGkgPSAwOyBpIDwgaXAkLmxlbmd0aDsgaSsrKSB7XG52YXIgY29udGVudCA9IGlwJFtpXTtcbmlmICh0aGlzLl9jb250YWlucyhjb250YWluZXIsIGNvbnRlbnQpKSB7XG52YXIgZGMkID0gZmFjdG9yeShjb250ZW50KS5nZXREaXN0cmlidXRlZE5vZGVzKCk7XG5mb3IgKHZhciBqID0gMDsgaiA8IGRjJC5sZW5ndGg7IGorKykge1xuaG9zdE5lZWRzRGlzdCA9IHRydWU7XG52YXIgbm9kZSA9IGRjJFtqXTtcbnZhciBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG5pZiAocGFyZW50KSB7XG5yZW1vdmVGcm9tQ29tcG9zZWRQYXJlbnQocGFyZW50LCBub2RlKTtcbm5hdGl2ZVJlbW92ZUNoaWxkLmNhbGwocGFyZW50LCBub2RlKTtcbn1cbn1cbn1cbn1cbnJldHVybiBob3N0TmVlZHNEaXN0O1xufSxcbl9jb250YWluczogZnVuY3Rpb24gKGNvbnRhaW5lciwgbm9kZSkge1xud2hpbGUgKG5vZGUpIHtcbmlmIChub2RlID09IGNvbnRhaW5lcikge1xucmV0dXJuIHRydWU7XG59XG5ub2RlID0gZmFjdG9yeShub2RlKS5wYXJlbnROb2RlO1xufVxufSxcbl9hZGROb2RlVG9Ib3N0OiBmdW5jdGlvbiAobm9kZSkge1xudmFyIGNoZWNrTm9kZSA9IG5vZGUubm9kZVR5cGUgPT09IE5vZGUuRE9DVU1FTlRfRlJBR01FTlRfTk9ERSA/IG5vZGUuZmlyc3RDaGlsZCA6IG5vZGU7XG52YXIgcm9vdCA9IHRoaXMuX293bmVyU2hhZHlSb290Rm9yTm9kZShjaGVja05vZGUpO1xuaWYgKHJvb3QpIHtcbnJvb3QuaG9zdC5fZWxlbWVudEFkZChub2RlKTtcbn1cbn0sXG5fYWRkTG9naWNhbEluZm86IGZ1bmN0aW9uIChub2RlLCBjb250YWluZXIsIGluZGV4KSB7XG5zYXZlTGlnaHRDaGlsZHJlbklmTmVlZGVkKGNvbnRhaW5lcik7XG52YXIgY2hpbGRyZW4gPSBmYWN0b3J5KGNvbnRhaW5lcikuY2hpbGROb2RlcztcbmluZGV4ID0gaW5kZXggPT09IHVuZGVmaW5lZCA/IGNoaWxkcmVuLmxlbmd0aCA6IGluZGV4O1xuaWYgKG5vZGUubm9kZVR5cGUgPT09IE5vZGUuRE9DVU1FTlRfRlJBR01FTlRfTk9ERSkge1xudmFyIGMkID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobm9kZS5jaGlsZE5vZGVzKTtcbmZvciAodmFyIGkgPSAwLCBuOyBpIDwgYyQubGVuZ3RoICYmIChuID0gYyRbaV0pOyBpKyspIHtcbmNoaWxkcmVuLnNwbGljZShpbmRleCsrLCAwLCBuKTtcbm4uX2xpZ2h0UGFyZW50ID0gY29udGFpbmVyO1xufVxufSBlbHNlIHtcbmNoaWxkcmVuLnNwbGljZShpbmRleCwgMCwgbm9kZSk7XG5ub2RlLl9saWdodFBhcmVudCA9IGNvbnRhaW5lcjtcbn1cbn0sXG5fcmVtb3ZlTG9naWNhbEluZm86IGZ1bmN0aW9uIChub2RlLCBjb250YWluZXIpIHtcbnZhciBjaGlsZHJlbiA9IGZhY3RvcnkoY29udGFpbmVyKS5jaGlsZE5vZGVzO1xudmFyIGluZGV4ID0gY2hpbGRyZW4uaW5kZXhPZihub2RlKTtcbmlmIChpbmRleCA8IDAgfHwgY29udGFpbmVyICE9PSBub2RlLl9saWdodFBhcmVudCkge1xudGhyb3cgRXJyb3IoJ1RoZSBub2RlIHRvIGJlIHJlbW92ZWQgaXMgbm90IGEgY2hpbGQgb2YgdGhpcyBub2RlJyk7XG59XG5jaGlsZHJlbi5zcGxpY2UoaW5kZXgsIDEpO1xubm9kZS5fbGlnaHRQYXJlbnQgPSBudWxsO1xufSxcbl9yZW1vdmVPd25lclNoYWR5Um9vdDogZnVuY3Rpb24gKG5vZGUpIHtcbnZhciBoYXNDYWNoZWRSb290ID0gZmFjdG9yeShub2RlKS5nZXRPd25lclJvb3QoKSAhPT0gdW5kZWZpbmVkO1xuaWYgKGhhc0NhY2hlZFJvb3QpIHtcbnZhciBjJCA9IGZhY3Rvcnkobm9kZSkuY2hpbGROb2RlcztcbmZvciAodmFyIGkgPSAwLCBsID0gYyQubGVuZ3RoLCBuOyBpIDwgbCAmJiAobiA9IGMkW2ldKTsgaSsrKSB7XG50aGlzLl9yZW1vdmVPd25lclNoYWR5Um9vdChuKTtcbn1cbn1cbm5vZGUuX293bmVyU2hhZHlSb290ID0gdW5kZWZpbmVkO1xufSxcbl9maXJzdENvbXBvc2VkTm9kZTogZnVuY3Rpb24gKGNvbnRlbnQpIHtcbnZhciBuJCA9IGZhY3RvcnkoY29udGVudCkuZ2V0RGlzdHJpYnV0ZWROb2RlcygpO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBuJC5sZW5ndGgsIG4sIHAkOyBpIDwgbCAmJiAobiA9IG4kW2ldKTsgaSsrKSB7XG5wJCA9IGZhY3RvcnkobikuZ2V0RGVzdGluYXRpb25JbnNlcnRpb25Qb2ludHMoKTtcbmlmIChwJFtwJC5sZW5ndGggLSAxXSA9PT0gY29udGVudCkge1xucmV0dXJuIG47XG59XG59XG59LFxucXVlcnlTZWxlY3RvcjogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG5yZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVswXTtcbn0sXG5xdWVyeVNlbGVjdG9yQWxsOiBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbnJldHVybiB0aGlzLl9xdWVyeShmdW5jdGlvbiAobikge1xucmV0dXJuIG1hdGNoZXNTZWxlY3Rvci5jYWxsKG4sIHNlbGVjdG9yKTtcbn0sIHRoaXMubm9kZSk7XG59LFxuX3F1ZXJ5OiBmdW5jdGlvbiAobWF0Y2hlciwgbm9kZSkge1xubm9kZSA9IG5vZGUgfHwgdGhpcy5ub2RlO1xudmFyIGxpc3QgPSBbXTtcbnRoaXMuX3F1ZXJ5RWxlbWVudHMoZmFjdG9yeShub2RlKS5jaGlsZE5vZGVzLCBtYXRjaGVyLCBsaXN0KTtcbnJldHVybiBsaXN0O1xufSxcbl9xdWVyeUVsZW1lbnRzOiBmdW5jdGlvbiAoZWxlbWVudHMsIG1hdGNoZXIsIGxpc3QpIHtcbmZvciAodmFyIGkgPSAwLCBsID0gZWxlbWVudHMubGVuZ3RoLCBjOyBpIDwgbCAmJiAoYyA9IGVsZW1lbnRzW2ldKTsgaSsrKSB7XG5pZiAoYy5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUpIHtcbnRoaXMuX3F1ZXJ5RWxlbWVudChjLCBtYXRjaGVyLCBsaXN0KTtcbn1cbn1cbn0sXG5fcXVlcnlFbGVtZW50OiBmdW5jdGlvbiAobm9kZSwgbWF0Y2hlciwgbGlzdCkge1xuaWYgKG1hdGNoZXIobm9kZSkpIHtcbmxpc3QucHVzaChub2RlKTtcbn1cbnRoaXMuX3F1ZXJ5RWxlbWVudHMoZmFjdG9yeShub2RlKS5jaGlsZE5vZGVzLCBtYXRjaGVyLCBsaXN0KTtcbn0sXG5nZXREZXN0aW5hdGlvbkluc2VydGlvblBvaW50czogZnVuY3Rpb24gKCkge1xucmV0dXJuIHRoaXMubm9kZS5fZGVzdGluYXRpb25JbnNlcnRpb25Qb2ludHMgfHwgW107XG59LFxuZ2V0RGlzdHJpYnV0ZWROb2RlczogZnVuY3Rpb24gKCkge1xucmV0dXJuIHRoaXMubm9kZS5fZGlzdHJpYnV0ZWROb2RlcyB8fCBbXTtcbn0sXG5xdWVyeURpc3RyaWJ1dGVkRWxlbWVudHM6IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xudmFyIGMkID0gdGhpcy5jaGlsZE5vZGVzO1xudmFyIGxpc3QgPSBbXTtcbnRoaXMuX2Rpc3RyaWJ1dGVkRmlsdGVyKHNlbGVjdG9yLCBjJCwgbGlzdCk7XG5mb3IgKHZhciBpID0gMCwgbCA9IGMkLmxlbmd0aCwgYzsgaSA8IGwgJiYgKGMgPSBjJFtpXSk7IGkrKykge1xuaWYgKGMubG9jYWxOYW1lID09PSBDT05URU5UKSB7XG50aGlzLl9kaXN0cmlidXRlZEZpbHRlcihzZWxlY3RvciwgZmFjdG9yeShjKS5nZXREaXN0cmlidXRlZE5vZGVzKCksIGxpc3QpO1xufVxufVxucmV0dXJuIGxpc3Q7XG59LFxuX2Rpc3RyaWJ1dGVkRmlsdGVyOiBmdW5jdGlvbiAoc2VsZWN0b3IsIGxpc3QsIHJlc3VsdHMpIHtcbnJlc3VsdHMgPSByZXN1bHRzIHx8IFtdO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBsaXN0Lmxlbmd0aCwgZDsgaSA8IGwgJiYgKGQgPSBsaXN0W2ldKTsgaSsrKSB7XG5pZiAoZC5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUgJiYgZC5sb2NhbE5hbWUgIT09IENPTlRFTlQgJiYgbWF0Y2hlc1NlbGVjdG9yLmNhbGwoZCwgc2VsZWN0b3IpKSB7XG5yZXN1bHRzLnB1c2goZCk7XG59XG59XG5yZXR1cm4gcmVzdWx0cztcbn0sXG5fY2xlYXI6IGZ1bmN0aW9uICgpIHtcbndoaWxlICh0aGlzLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG50aGlzLnJlbW92ZUNoaWxkKHRoaXMuY2hpbGROb2Rlc1swXSk7XG59XG59LFxuc2V0QXR0cmlidXRlOiBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbnRoaXMubm9kZS5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xudGhpcy5fZGlzdHJpYnV0ZVBhcmVudCgpO1xufSxcbnJlbW92ZUF0dHJpYnV0ZTogZnVuY3Rpb24gKG5hbWUpIHtcbnRoaXMubm9kZS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG50aGlzLl9kaXN0cmlidXRlUGFyZW50KCk7XG59LFxuX2Rpc3RyaWJ1dGVQYXJlbnQ6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLl9wYXJlbnROZWVkc0Rpc3RyaWJ1dGlvbih0aGlzLnBhcmVudE5vZGUpKSB7XG50aGlzLl9sYXp5RGlzdHJpYnV0ZSh0aGlzLnBhcmVudE5vZGUpO1xufVxufSxcbmNsb25lTm9kZTogZnVuY3Rpb24gKGRlZXApIHtcbnZhciBuID0gbmF0aXZlQ2xvbmVOb2RlLmNhbGwodGhpcy5ub2RlLCBmYWxzZSk7XG5pZiAoZGVlcCkge1xudmFyIGMkID0gdGhpcy5jaGlsZE5vZGVzO1xudmFyIGQgPSBmYWN0b3J5KG4pO1xuZm9yICh2YXIgaSA9IDAsIG5jOyBpIDwgYyQubGVuZ3RoOyBpKyspIHtcbm5jID0gZmFjdG9yeShjJFtpXSkuY2xvbmVOb2RlKHRydWUpO1xuZC5hcHBlbmRDaGlsZChuYyk7XG59XG59XG5yZXR1cm4gbjtcbn0sXG5pbXBvcnROb2RlOiBmdW5jdGlvbiAoZXh0ZXJuYWxOb2RlLCBkZWVwKSB7XG52YXIgZG9jID0gdGhpcy5ub2RlIGluc3RhbmNlb2YgSFRNTERvY3VtZW50ID8gdGhpcy5ub2RlIDogdGhpcy5ub2RlLm93bmVyRG9jdW1lbnQ7XG52YXIgbiA9IG5hdGl2ZUltcG9ydE5vZGUuY2FsbChkb2MsIGV4dGVybmFsTm9kZSwgZmFsc2UpO1xuaWYgKGRlZXApIHtcbnZhciBjJCA9IGZhY3RvcnkoZXh0ZXJuYWxOb2RlKS5jaGlsZE5vZGVzO1xudmFyIGQgPSBmYWN0b3J5KG4pO1xuZm9yICh2YXIgaSA9IDAsIG5jOyBpIDwgYyQubGVuZ3RoOyBpKyspIHtcbm5jID0gZmFjdG9yeShkb2MpLmltcG9ydE5vZGUoYyRbaV0sIHRydWUpO1xuZC5hcHBlbmRDaGlsZChuYyk7XG59XG59XG5yZXR1cm4gbjtcbn1cbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoRG9tQXBpLnByb3RvdHlwZSwgJ2NsYXNzTGlzdCcsIHtcbmdldDogZnVuY3Rpb24gKCkge1xuaWYgKCF0aGlzLl9jbGFzc0xpc3QpIHtcbnRoaXMuX2NsYXNzTGlzdCA9IG5ldyBEb21BcGkuQ2xhc3NMaXN0KHRoaXMpO1xufVxucmV0dXJuIHRoaXMuX2NsYXNzTGlzdDtcbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn0pO1xuRG9tQXBpLkNsYXNzTGlzdCA9IGZ1bmN0aW9uIChob3N0KSB7XG50aGlzLmRvbUFwaSA9IGhvc3Q7XG50aGlzLm5vZGUgPSBob3N0Lm5vZGU7XG59O1xuRG9tQXBpLkNsYXNzTGlzdC5wcm90b3R5cGUgPSB7XG5hZGQ6IGZ1bmN0aW9uICgpIHtcbnRoaXMubm9kZS5jbGFzc0xpc3QuYWRkLmFwcGx5KHRoaXMubm9kZS5jbGFzc0xpc3QsIGFyZ3VtZW50cyk7XG50aGlzLmRvbUFwaS5fZGlzdHJpYnV0ZVBhcmVudCgpO1xufSxcbnJlbW92ZTogZnVuY3Rpb24gKCkge1xudGhpcy5ub2RlLmNsYXNzTGlzdC5yZW1vdmUuYXBwbHkodGhpcy5ub2RlLmNsYXNzTGlzdCwgYXJndW1lbnRzKTtcbnRoaXMuZG9tQXBpLl9kaXN0cmlidXRlUGFyZW50KCk7XG59LFxudG9nZ2xlOiBmdW5jdGlvbiAoKSB7XG50aGlzLm5vZGUuY2xhc3NMaXN0LnRvZ2dsZS5hcHBseSh0aGlzLm5vZGUuY2xhc3NMaXN0LCBhcmd1bWVudHMpO1xudGhpcy5kb21BcGkuX2Rpc3RyaWJ1dGVQYXJlbnQoKTtcbn0sXG5jb250YWluczogZnVuY3Rpb24gKCkge1xucmV0dXJuIHRoaXMubm9kZS5jbGFzc0xpc3QuY29udGFpbnMuYXBwbHkodGhpcy5ub2RlLmNsYXNzTGlzdCwgYXJndW1lbnRzKTtcbn1cbn07XG5pZiAoIVNldHRpbmdzLnVzZVNoYWRvdykge1xuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoRG9tQXBpLnByb3RvdHlwZSwge1xuY2hpbGROb2Rlczoge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG52YXIgYyQgPSBnZXRMaWdodENoaWxkcmVuKHRoaXMubm9kZSk7XG5yZXR1cm4gQXJyYXkuaXNBcnJheShjJCkgPyBjJCA6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGMkKTtcbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn0sXG5jaGlsZHJlbjoge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsKHRoaXMuY2hpbGROb2RlcywgZnVuY3Rpb24gKG4pIHtcbnJldHVybiBuLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERTtcbn0pO1xufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSxcbnBhcmVudE5vZGU6IHtcbmdldDogZnVuY3Rpb24gKCkge1xucmV0dXJuIHRoaXMubm9kZS5fbGlnaHRQYXJlbnQgfHwgKHRoaXMubm9kZS5fX3BhdGNoZWQgPyB0aGlzLm5vZGUuX2NvbXBvc2VkUGFyZW50IDogdGhpcy5ub2RlLnBhcmVudE5vZGUpO1xufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSxcbmZpcnN0Q2hpbGQ6IHtcbmdldDogZnVuY3Rpb24gKCkge1xucmV0dXJuIHRoaXMuY2hpbGROb2Rlc1swXTtcbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn0sXG5sYXN0Q2hpbGQ6IHtcbmdldDogZnVuY3Rpb24gKCkge1xudmFyIGMkID0gdGhpcy5jaGlsZE5vZGVzO1xucmV0dXJuIGMkW2MkLmxlbmd0aCAtIDFdO1xufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSxcbm5leHRTaWJsaW5nOiB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnZhciBjJCA9IHRoaXMucGFyZW50Tm9kZSAmJiBmYWN0b3J5KHRoaXMucGFyZW50Tm9kZSkuY2hpbGROb2RlcztcbmlmIChjJCkge1xucmV0dXJuIGMkW0FycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYyQsIHRoaXMubm9kZSkgKyAxXTtcbn1cbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn0sXG5wcmV2aW91c1NpYmxpbmc6IHtcbmdldDogZnVuY3Rpb24gKCkge1xudmFyIGMkID0gdGhpcy5wYXJlbnROb2RlICYmIGZhY3RvcnkodGhpcy5wYXJlbnROb2RlKS5jaGlsZE5vZGVzO1xuaWYgKGMkKSB7XG5yZXR1cm4gYyRbQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChjJCwgdGhpcy5ub2RlKSAtIDFdO1xufVxufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSxcbmZpcnN0RWxlbWVudENoaWxkOiB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnJldHVybiB0aGlzLmNoaWxkcmVuWzBdO1xufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSxcbmxhc3RFbGVtZW50Q2hpbGQ6IHtcbmdldDogZnVuY3Rpb24gKCkge1xudmFyIGMkID0gdGhpcy5jaGlsZHJlbjtcbnJldHVybiBjJFtjJC5sZW5ndGggLSAxXTtcbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn0sXG5uZXh0RWxlbWVudFNpYmxpbmc6IHtcbmdldDogZnVuY3Rpb24gKCkge1xudmFyIGMkID0gdGhpcy5wYXJlbnROb2RlICYmIGZhY3RvcnkodGhpcy5wYXJlbnROb2RlKS5jaGlsZHJlbjtcbmlmIChjJCkge1xucmV0dXJuIGMkW0FycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYyQsIHRoaXMubm9kZSkgKyAxXTtcbn1cbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn0sXG5wcmV2aW91c0VsZW1lbnRTaWJsaW5nOiB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnZhciBjJCA9IHRoaXMucGFyZW50Tm9kZSAmJiBmYWN0b3J5KHRoaXMucGFyZW50Tm9kZSkuY2hpbGRyZW47XG5pZiAoYyQpIHtcbnJldHVybiBjJFtBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGMkLCB0aGlzLm5vZGUpIC0gMV07XG59XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59LFxudGV4dENvbnRlbnQ6IHtcbmdldDogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMubm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5URVhUX05PREUpIHtcbnJldHVybiB0aGlzLm5vZGUudGV4dENvbnRlbnQ7XG59IGVsc2Uge1xucmV0dXJuIEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbCh0aGlzLmNoaWxkTm9kZXMsIGZ1bmN0aW9uIChjKSB7XG5yZXR1cm4gYy50ZXh0Q29udGVudDtcbn0pLmpvaW4oJycpO1xufVxufSxcbnNldDogZnVuY3Rpb24gKHRleHQpIHtcbnRoaXMuX2NsZWFyKCk7XG5pZiAodGV4dCkge1xudGhpcy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KSk7XG59XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59LFxuaW5uZXJIVE1MOiB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLm5vZGUubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFKSB7XG5yZXR1cm4gbnVsbDtcbn0gZWxzZSB7XG5yZXR1cm4gZ2V0SW5uZXJIVE1MKHRoaXMubm9kZSk7XG59XG59LFxuc2V0OiBmdW5jdGlvbiAodGV4dCkge1xuaWYgKHRoaXMubm9kZS5ub2RlVHlwZSAhPT0gTm9kZS5URVhUX05PREUpIHtcbnRoaXMuX2NsZWFyKCk7XG52YXIgZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuZC5pbm5lckhUTUwgPSB0ZXh0O1xudmFyIGMkID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZC5jaGlsZE5vZGVzKTtcbmZvciAodmFyIGkgPSAwOyBpIDwgYyQubGVuZ3RoOyBpKyspIHtcbnRoaXMuYXBwZW5kQ2hpbGQoYyRbaV0pO1xufVxufVxufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufVxufSk7XG5Eb21BcGkucHJvdG90eXBlLl9nZXRDb21wb3NlZElubmVySFRNTCA9IGZ1bmN0aW9uICgpIHtcbnJldHVybiBnZXRJbm5lckhUTUwodGhpcy5ub2RlLCB0cnVlKTtcbn07XG59IGVsc2Uge1xuRG9tQXBpLnByb3RvdHlwZS5xdWVyeVNlbGVjdG9yQWxsID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG5yZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5ub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKTtcbn07XG5Eb21BcGkucHJvdG90eXBlLmdldE93bmVyUm9vdCA9IGZ1bmN0aW9uICgpIHtcbnZhciBuID0gdGhpcy5ub2RlO1xud2hpbGUgKG4pIHtcbmlmIChuLm5vZGVUeXBlID09PSBOb2RlLkRPQ1VNRU5UX0ZSQUdNRU5UX05PREUgJiYgbi5ob3N0KSB7XG5yZXR1cm4gbjtcbn1cbm4gPSBuLnBhcmVudE5vZGU7XG59XG59O1xuRG9tQXBpLnByb3RvdHlwZS5jbG9uZU5vZGUgPSBmdW5jdGlvbiAoZGVlcCkge1xucmV0dXJuIHRoaXMubm9kZS5jbG9uZU5vZGUoZGVlcCk7XG59O1xuRG9tQXBpLnByb3RvdHlwZS5pbXBvcnROb2RlID0gZnVuY3Rpb24gKGV4dGVybmFsTm9kZSwgZGVlcCkge1xudmFyIGRvYyA9IHRoaXMubm9kZSBpbnN0YW5jZW9mIEhUTUxEb2N1bWVudCA/IHRoaXMubm9kZSA6IHRoaXMubm9kZS5vd25lckRvY3VtZW50O1xucmV0dXJuIGRvYy5pbXBvcnROb2RlKGV4dGVybmFsTm9kZSwgZGVlcCk7XG59O1xuRG9tQXBpLnByb3RvdHlwZS5nZXREZXN0aW5hdGlvbkluc2VydGlvblBvaW50cyA9IGZ1bmN0aW9uICgpIHtcbnZhciBuJCA9IHRoaXMubm9kZS5nZXREZXN0aW5hdGlvbkluc2VydGlvblBvaW50cygpO1xucmV0dXJuIG4kID8gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobiQpIDogW107XG59O1xuRG9tQXBpLnByb3RvdHlwZS5nZXREaXN0cmlidXRlZE5vZGVzID0gZnVuY3Rpb24gKCkge1xudmFyIG4kID0gdGhpcy5ub2RlLmdldERpc3RyaWJ1dGVkTm9kZXMoKTtcbnJldHVybiBuJCA/IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG4kKSA6IFtdO1xufTtcbkRvbUFwaS5wcm90b3R5cGUuX2Rpc3RyaWJ1dGVQYXJlbnQgPSBmdW5jdGlvbiAoKSB7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoRG9tQXBpLnByb3RvdHlwZSwge1xuY2hpbGROb2Rlczoge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5ub2RlLmNoaWxkTm9kZXMpO1xufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSxcbmNoaWxkcmVuOiB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLm5vZGUuY2hpbGRyZW4pO1xufSxcbmNvbmZpZ3VyYWJsZTogdHJ1ZVxufSxcbnRleHRDb250ZW50OiB7XG5nZXQ6IGZ1bmN0aW9uICgpIHtcbnJldHVybiB0aGlzLm5vZGUudGV4dENvbnRlbnQ7XG59LFxuc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbnJldHVybiB0aGlzLm5vZGUudGV4dENvbnRlbnQgPSB2YWx1ZTtcbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn0sXG5pbm5lckhUTUw6IHtcbmdldDogZnVuY3Rpb24gKCkge1xucmV0dXJuIHRoaXMubm9kZS5pbm5lckhUTUw7XG59LFxuc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbnJldHVybiB0aGlzLm5vZGUuaW5uZXJIVE1MID0gdmFsdWU7XG59LFxuY29uZmlndXJhYmxlOiB0cnVlXG59XG59KTtcbnZhciBmb3J3YXJkcyA9IFtcbidwYXJlbnROb2RlJyxcbidmaXJzdENoaWxkJyxcbidsYXN0Q2hpbGQnLFxuJ25leHRTaWJsaW5nJyxcbidwcmV2aW91c1NpYmxpbmcnLFxuJ2ZpcnN0RWxlbWVudENoaWxkJyxcbidsYXN0RWxlbWVudENoaWxkJyxcbiduZXh0RWxlbWVudFNpYmxpbmcnLFxuJ3ByZXZpb3VzRWxlbWVudFNpYmxpbmcnXG5dO1xuZm9yd2FyZHMuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KERvbUFwaS5wcm90b3R5cGUsIG5hbWUsIHtcbmdldDogZnVuY3Rpb24gKCkge1xucmV0dXJuIHRoaXMubm9kZVtuYW1lXTtcbn0sXG5jb25maWd1cmFibGU6IHRydWVcbn0pO1xufSk7XG59XG52YXIgQ09OVEVOVCA9ICdjb250ZW50JztcbnZhciBmYWN0b3J5ID0gZnVuY3Rpb24gKG5vZGUsIHBhdGNoKSB7XG5ub2RlID0gbm9kZSB8fCBkb2N1bWVudDtcbmlmICghbm9kZS5fX2RvbUFwaSkge1xubm9kZS5fX2RvbUFwaSA9IG5ldyBEb21BcGkobm9kZSwgcGF0Y2gpO1xufVxucmV0dXJuIG5vZGUuX19kb21BcGk7XG59O1xuUG9seW1lci5kb20gPSBmdW5jdGlvbiAob2JqLCBwYXRjaCkge1xuaWYgKG9iaiBpbnN0YW5jZW9mIEV2ZW50KSB7XG5yZXR1cm4gUG9seW1lci5FdmVudEFwaS5mYWN0b3J5KG9iaik7XG59IGVsc2Uge1xucmV0dXJuIGZhY3Rvcnkob2JqLCBwYXRjaCk7XG59XG59O1xuUG9seW1lci5kb20uZmx1c2ggPSBEb21BcGkucHJvdG90eXBlLmZsdXNoO1xuZnVuY3Rpb24gZ2V0TGlnaHRDaGlsZHJlbihub2RlKSB7XG52YXIgY2hpbGRyZW4gPSBub2RlLl9saWdodENoaWxkcmVuO1xucmV0dXJuIGNoaWxkcmVuID8gY2hpbGRyZW4gOiBub2RlLmNoaWxkTm9kZXM7XG59XG5mdW5jdGlvbiBnZXRDb21wb3NlZENoaWxkcmVuKG5vZGUpIHtcbmlmICghbm9kZS5fY29tcG9zZWRDaGlsZHJlbikge1xubm9kZS5fY29tcG9zZWRDaGlsZHJlbiA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG5vZGUuY2hpbGROb2Rlcyk7XG59XG5yZXR1cm4gbm9kZS5fY29tcG9zZWRDaGlsZHJlbjtcbn1cbmZ1bmN0aW9uIGFkZFRvQ29tcG9zZWRQYXJlbnQocGFyZW50LCBub2RlLCByZWZfbm9kZSkge1xudmFyIGNoaWxkcmVuID0gZ2V0Q29tcG9zZWRDaGlsZHJlbihwYXJlbnQpO1xudmFyIGkgPSByZWZfbm9kZSA/IGNoaWxkcmVuLmluZGV4T2YocmVmX25vZGUpIDogLTE7XG5pZiAobm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5ET0NVTUVOVF9GUkFHTUVOVF9OT0RFKSB7XG52YXIgZnJhZ0NoaWxkcmVuID0gZ2V0Q29tcG9zZWRDaGlsZHJlbihub2RlKTtcbmZvciAodmFyIGogPSAwOyBqIDwgZnJhZ0NoaWxkcmVuLmxlbmd0aDsgaisrKSB7XG5hZGROb2RlVG9Db21wb3NlZENoaWxkcmVuKGZyYWdDaGlsZHJlbltqXSwgcGFyZW50LCBjaGlsZHJlbiwgaSArIGopO1xufVxubm9kZS5fY29tcG9zZWRDaGlsZHJlbiA9IG51bGw7XG59IGVsc2Uge1xuYWRkTm9kZVRvQ29tcG9zZWRDaGlsZHJlbihub2RlLCBwYXJlbnQsIGNoaWxkcmVuLCBpKTtcbn1cbn1cbmZ1bmN0aW9uIGFkZE5vZGVUb0NvbXBvc2VkQ2hpbGRyZW4obm9kZSwgcGFyZW50LCBjaGlsZHJlbiwgaSkge1xubm9kZS5fY29tcG9zZWRQYXJlbnQgPSBwYXJlbnQ7XG5jaGlsZHJlbi5zcGxpY2UoaSA+PSAwID8gaSA6IGNoaWxkcmVuLmxlbmd0aCwgMCwgbm9kZSk7XG59XG5mdW5jdGlvbiByZW1vdmVGcm9tQ29tcG9zZWRQYXJlbnQocGFyZW50LCBub2RlKSB7XG5ub2RlLl9jb21wb3NlZFBhcmVudCA9IG51bGw7XG5pZiAocGFyZW50KSB7XG52YXIgY2hpbGRyZW4gPSBnZXRDb21wb3NlZENoaWxkcmVuKHBhcmVudCk7XG52YXIgaSA9IGNoaWxkcmVuLmluZGV4T2Yobm9kZSk7XG5pZiAoaSA+PSAwKSB7XG5jaGlsZHJlbi5zcGxpY2UoaSwgMSk7XG59XG59XG59XG5mdW5jdGlvbiBzYXZlTGlnaHRDaGlsZHJlbklmTmVlZGVkKG5vZGUpIHtcbmlmICghbm9kZS5fbGlnaHRDaGlsZHJlbikge1xudmFyIGMkID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobm9kZS5jaGlsZE5vZGVzKTtcbmZvciAodmFyIGkgPSAwLCBsID0gYyQubGVuZ3RoLCBjaGlsZDsgaSA8IGwgJiYgKGNoaWxkID0gYyRbaV0pOyBpKyspIHtcbmNoaWxkLl9saWdodFBhcmVudCA9IGNoaWxkLl9saWdodFBhcmVudCB8fCBub2RlO1xufVxubm9kZS5fbGlnaHRDaGlsZHJlbiA9IGMkO1xufVxufVxuZnVuY3Rpb24gaGFzSW5zZXJ0aW9uUG9pbnQocm9vdCkge1xucmV0dXJuIEJvb2xlYW4ocm9vdC5faW5zZXJ0aW9uUG9pbnRzLmxlbmd0aCk7XG59XG52YXIgcCA9IEVsZW1lbnQucHJvdG90eXBlO1xudmFyIG1hdGNoZXNTZWxlY3RvciA9IHAubWF0Y2hlcyB8fCBwLm1hdGNoZXNTZWxlY3RvciB8fCBwLm1vek1hdGNoZXNTZWxlY3RvciB8fCBwLm1zTWF0Y2hlc1NlbGVjdG9yIHx8IHAub01hdGNoZXNTZWxlY3RvciB8fCBwLndlYmtpdE1hdGNoZXNTZWxlY3RvcjtcbnJldHVybiB7XG5nZXRMaWdodENoaWxkcmVuOiBnZXRMaWdodENoaWxkcmVuLFxuZ2V0Q29tcG9zZWRDaGlsZHJlbjogZ2V0Q29tcG9zZWRDaGlsZHJlbixcbnJlbW92ZUZyb21Db21wb3NlZFBhcmVudDogcmVtb3ZlRnJvbUNvbXBvc2VkUGFyZW50LFxuc2F2ZUxpZ2h0Q2hpbGRyZW5JZk5lZWRlZDogc2F2ZUxpZ2h0Q2hpbGRyZW5JZk5lZWRlZCxcbm1hdGNoZXNTZWxlY3RvcjogbWF0Y2hlc1NlbGVjdG9yLFxuaGFzSW5zZXJ0aW9uUG9pbnQ6IGhhc0luc2VydGlvblBvaW50LFxuY3RvcjogRG9tQXBpLFxuZmFjdG9yeTogZmFjdG9yeVxufTtcbn0oKTtcbihmdW5jdGlvbiAoKSB7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX3ByZXBTaGFkeTogZnVuY3Rpb24gKCkge1xudGhpcy5fdXNlQ29udGVudCA9IHRoaXMuX3VzZUNvbnRlbnQgfHwgQm9vbGVhbih0aGlzLl90ZW1wbGF0ZSk7XG59LFxuX3Bvb2xDb250ZW50OiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5fdXNlQ29udGVudCkge1xuc2F2ZUxpZ2h0Q2hpbGRyZW5JZk5lZWRlZCh0aGlzKTtcbn1cbn0sXG5fc2V0dXBSb290OiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5fdXNlQ29udGVudCkge1xudGhpcy5fY3JlYXRlTG9jYWxSb290KCk7XG5pZiAoIXRoaXMuZGF0YUhvc3QpIHtcbnVwZ3JhZGVMaWdodENoaWxkcmVuKHRoaXMuX2xpZ2h0Q2hpbGRyZW4pO1xufVxufVxufSxcbl9jcmVhdGVMb2NhbFJvb3Q6IGZ1bmN0aW9uICgpIHtcbnRoaXMuc2hhZHlSb290ID0gdGhpcy5yb290O1xudGhpcy5zaGFkeVJvb3QuX2Rpc3RyaWJ1dGlvbkNsZWFuID0gZmFsc2U7XG50aGlzLnNoYWR5Um9vdC5faXNTaGFkeVJvb3QgPSB0cnVlO1xudGhpcy5zaGFkeVJvb3QuX2RpcnR5Um9vdHMgPSBbXTtcbnRoaXMuc2hhZHlSb290Ll9pbnNlcnRpb25Qb2ludHMgPSAhdGhpcy5fbm90ZXMgfHwgdGhpcy5fbm90ZXMuX2hhc0NvbnRlbnQgPyB0aGlzLnNoYWR5Um9vdC5xdWVyeVNlbGVjdG9yQWxsKCdjb250ZW50JykgOiBbXTtcbnNhdmVMaWdodENoaWxkcmVuSWZOZWVkZWQodGhpcy5zaGFkeVJvb3QpO1xudGhpcy5zaGFkeVJvb3QuaG9zdCA9IHRoaXM7XG59LFxuZ2V0IGRvbUhvc3QoKSB7XG52YXIgcm9vdCA9IFBvbHltZXIuZG9tKHRoaXMpLmdldE93bmVyUm9vdCgpO1xucmV0dXJuIHJvb3QgJiYgcm9vdC5ob3N0O1xufSxcbmRpc3RyaWJ1dGVDb250ZW50OiBmdW5jdGlvbiAodXBkYXRlSW5zZXJ0aW9uUG9pbnRzKSB7XG5pZiAodGhpcy5zaGFkeVJvb3QpIHtcbnZhciBkb20gPSBQb2x5bWVyLmRvbSh0aGlzKTtcbmlmICh1cGRhdGVJbnNlcnRpb25Qb2ludHMpIHtcbmRvbS5fdXBkYXRlSW5zZXJ0aW9uUG9pbnRzKHRoaXMpO1xufVxudmFyIGhvc3QgPSBnZXRUb3BEaXN0cmlidXRpbmdIb3N0KHRoaXMpO1xuZG9tLl9sYXp5RGlzdHJpYnV0ZShob3N0KTtcbn1cbn0sXG5fZGlzdHJpYnV0ZUNvbnRlbnQ6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLl91c2VDb250ZW50ICYmICF0aGlzLnNoYWR5Um9vdC5fZGlzdHJpYnV0aW9uQ2xlYW4pIHtcbnRoaXMuX2JlZ2luRGlzdHJpYnV0ZSgpO1xudGhpcy5fZGlzdHJpYnV0ZURpcnR5Um9vdHMoKTtcbnRoaXMuX2ZpbmlzaERpc3RyaWJ1dGUoKTtcbn1cbn0sXG5fYmVnaW5EaXN0cmlidXRlOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5fdXNlQ29udGVudCAmJiBoYXNJbnNlcnRpb25Qb2ludCh0aGlzLnNoYWR5Um9vdCkpIHtcbnRoaXMuX3Jlc2V0RGlzdHJpYnV0aW9uKCk7XG50aGlzLl9kaXN0cmlidXRlUG9vbCh0aGlzLnNoYWR5Um9vdCwgdGhpcy5fY29sbGVjdFBvb2woKSk7XG59XG59LFxuX2Rpc3RyaWJ1dGVEaXJ0eVJvb3RzOiBmdW5jdGlvbiAoKSB7XG52YXIgYyQgPSB0aGlzLnNoYWR5Um9vdC5fZGlydHlSb290cztcbmZvciAodmFyIGkgPSAwLCBsID0gYyQubGVuZ3RoLCBjOyBpIDwgbCAmJiAoYyA9IGMkW2ldKTsgaSsrKSB7XG5jLl9kaXN0cmlidXRlQ29udGVudCgpO1xufVxudGhpcy5zaGFkeVJvb3QuX2RpcnR5Um9vdHMgPSBbXTtcbn0sXG5fZmluaXNoRGlzdHJpYnV0ZTogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuX3VzZUNvbnRlbnQpIHtcbmlmIChoYXNJbnNlcnRpb25Qb2ludCh0aGlzLnNoYWR5Um9vdCkpIHtcbnRoaXMuX2NvbXBvc2VUcmVlKCk7XG59IGVsc2Uge1xuaWYgKCF0aGlzLnNoYWR5Um9vdC5faGFzRGlzdHJpYnV0ZWQpIHtcbnRoaXMudGV4dENvbnRlbnQgPSAnJztcbnRoaXMuX2NvbXBvc2VkQ2hpbGRyZW4gPSBudWxsO1xudGhpcy5hcHBlbmRDaGlsZCh0aGlzLnNoYWR5Um9vdCk7XG59IGVsc2Uge1xudmFyIGNoaWxkcmVuID0gdGhpcy5fY29tcG9zZU5vZGUodGhpcyk7XG50aGlzLl91cGRhdGVDaGlsZE5vZGVzKHRoaXMsIGNoaWxkcmVuKTtcbn1cbn1cbnRoaXMuc2hhZHlSb290Ll9oYXNEaXN0cmlidXRlZCA9IHRydWU7XG50aGlzLnNoYWR5Um9vdC5fZGlzdHJpYnV0aW9uQ2xlYW4gPSB0cnVlO1xufVxufSxcbmVsZW1lbnRNYXRjaGVzOiBmdW5jdGlvbiAoc2VsZWN0b3IsIG5vZGUpIHtcbm5vZGUgPSBub2RlIHx8IHRoaXM7XG5yZXR1cm4gbWF0Y2hlc1NlbGVjdG9yLmNhbGwobm9kZSwgc2VsZWN0b3IpO1xufSxcbl9yZXNldERpc3RyaWJ1dGlvbjogZnVuY3Rpb24gKCkge1xudmFyIGNoaWxkcmVuID0gZ2V0TGlnaHRDaGlsZHJlbih0aGlzKTtcbmZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbnZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuaWYgKGNoaWxkLl9kZXN0aW5hdGlvbkluc2VydGlvblBvaW50cykge1xuY2hpbGQuX2Rlc3RpbmF0aW9uSW5zZXJ0aW9uUG9pbnRzID0gdW5kZWZpbmVkO1xufVxuaWYgKGlzSW5zZXJ0aW9uUG9pbnQoY2hpbGQpKSB7XG5jbGVhckRpc3RyaWJ1dGVkRGVzdGluYXRpb25JbnNlcnRpb25Qb2ludHMoY2hpbGQpO1xufVxufVxudmFyIHJvb3QgPSB0aGlzLnNoYWR5Um9vdDtcbnZhciBwJCA9IHJvb3QuX2luc2VydGlvblBvaW50cztcbmZvciAodmFyIGogPSAwOyBqIDwgcCQubGVuZ3RoOyBqKyspIHtcbnAkW2pdLl9kaXN0cmlidXRlZE5vZGVzID0gW107XG59XG59LFxuX2NvbGxlY3RQb29sOiBmdW5jdGlvbiAoKSB7XG52YXIgcG9vbCA9IFtdO1xudmFyIGNoaWxkcmVuID0gZ2V0TGlnaHRDaGlsZHJlbih0aGlzKTtcbmZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbnZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuaWYgKGlzSW5zZXJ0aW9uUG9pbnQoY2hpbGQpKSB7XG5wb29sLnB1c2guYXBwbHkocG9vbCwgY2hpbGQuX2Rpc3RyaWJ1dGVkTm9kZXMpO1xufSBlbHNlIHtcbnBvb2wucHVzaChjaGlsZCk7XG59XG59XG5yZXR1cm4gcG9vbDtcbn0sXG5fZGlzdHJpYnV0ZVBvb2w6IGZ1bmN0aW9uIChub2RlLCBwb29sKSB7XG52YXIgcCQgPSBub2RlLl9pbnNlcnRpb25Qb2ludHM7XG5mb3IgKHZhciBpID0gMCwgbCA9IHAkLmxlbmd0aCwgcDsgaSA8IGwgJiYgKHAgPSBwJFtpXSk7IGkrKykge1xudGhpcy5fZGlzdHJpYnV0ZUluc2VydGlvblBvaW50KHAsIHBvb2wpO1xubWF5YmVSZWRpc3RyaWJ1dGVQYXJlbnQocCwgdGhpcyk7XG59XG59LFxuX2Rpc3RyaWJ1dGVJbnNlcnRpb25Qb2ludDogZnVuY3Rpb24gKGNvbnRlbnQsIHBvb2wpIHtcbnZhciBhbnlEaXN0cmlidXRlZCA9IGZhbHNlO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBwb29sLmxlbmd0aCwgbm9kZTsgaSA8IGw7IGkrKykge1xubm9kZSA9IHBvb2xbaV07XG5pZiAoIW5vZGUpIHtcbmNvbnRpbnVlO1xufVxuaWYgKHRoaXMuX21hdGNoZXNDb250ZW50U2VsZWN0KG5vZGUsIGNvbnRlbnQpKSB7XG5kaXN0cmlidXRlTm9kZUludG8obm9kZSwgY29udGVudCk7XG5wb29sW2ldID0gdW5kZWZpbmVkO1xuYW55RGlzdHJpYnV0ZWQgPSB0cnVlO1xufVxufVxuaWYgKCFhbnlEaXN0cmlidXRlZCkge1xudmFyIGNoaWxkcmVuID0gZ2V0TGlnaHRDaGlsZHJlbihjb250ZW50KTtcbmZvciAodmFyIGogPSAwOyBqIDwgY2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcbmRpc3RyaWJ1dGVOb2RlSW50byhjaGlsZHJlbltqXSwgY29udGVudCk7XG59XG59XG59LFxuX2NvbXBvc2VUcmVlOiBmdW5jdGlvbiAoKSB7XG50aGlzLl91cGRhdGVDaGlsZE5vZGVzKHRoaXMsIHRoaXMuX2NvbXBvc2VOb2RlKHRoaXMpKTtcbnZhciBwJCA9IHRoaXMuc2hhZHlSb290Ll9pbnNlcnRpb25Qb2ludHM7XG5mb3IgKHZhciBpID0gMCwgbCA9IHAkLmxlbmd0aCwgcCwgcGFyZW50OyBpIDwgbCAmJiAocCA9IHAkW2ldKTsgaSsrKSB7XG5wYXJlbnQgPSBwLl9saWdodFBhcmVudCB8fCBwLnBhcmVudE5vZGU7XG5pZiAoIXBhcmVudC5fdXNlQ29udGVudCAmJiBwYXJlbnQgIT09IHRoaXMgJiYgcGFyZW50ICE9PSB0aGlzLnNoYWR5Um9vdCkge1xudGhpcy5fdXBkYXRlQ2hpbGROb2RlcyhwYXJlbnQsIHRoaXMuX2NvbXBvc2VOb2RlKHBhcmVudCkpO1xufVxufVxufSxcbl9jb21wb3NlTm9kZTogZnVuY3Rpb24gKG5vZGUpIHtcbnZhciBjaGlsZHJlbiA9IFtdO1xudmFyIGMkID0gZ2V0TGlnaHRDaGlsZHJlbihub2RlLnNoYWR5Um9vdCB8fCBub2RlKTtcbmZvciAodmFyIGkgPSAwOyBpIDwgYyQubGVuZ3RoOyBpKyspIHtcbnZhciBjaGlsZCA9IGMkW2ldO1xuaWYgKGlzSW5zZXJ0aW9uUG9pbnQoY2hpbGQpKSB7XG52YXIgZGlzdHJpYnV0ZWROb2RlcyA9IGNoaWxkLl9kaXN0cmlidXRlZE5vZGVzO1xuZm9yICh2YXIgaiA9IDA7IGogPCBkaXN0cmlidXRlZE5vZGVzLmxlbmd0aDsgaisrKSB7XG52YXIgZGlzdHJpYnV0ZWROb2RlID0gZGlzdHJpYnV0ZWROb2Rlc1tqXTtcbmlmIChpc0ZpbmFsRGVzdGluYXRpb24oY2hpbGQsIGRpc3RyaWJ1dGVkTm9kZSkpIHtcbmNoaWxkcmVuLnB1c2goZGlzdHJpYnV0ZWROb2RlKTtcbn1cbn1cbn0gZWxzZSB7XG5jaGlsZHJlbi5wdXNoKGNoaWxkKTtcbn1cbn1cbnJldHVybiBjaGlsZHJlbjtcbn0sXG5fdXBkYXRlQ2hpbGROb2RlczogZnVuY3Rpb24gKGNvbnRhaW5lciwgY2hpbGRyZW4pIHtcbnZhciBjb21wb3NlZCA9IGdldENvbXBvc2VkQ2hpbGRyZW4oY29udGFpbmVyKTtcbnZhciBzcGxpY2VzID0gUG9seW1lci5BcnJheVNwbGljZS5jYWxjdWxhdGVTcGxpY2VzKGNoaWxkcmVuLCBjb21wb3NlZCk7XG5mb3IgKHZhciBpID0gMCwgZCA9IDAsIHM7IGkgPCBzcGxpY2VzLmxlbmd0aCAmJiAocyA9IHNwbGljZXNbaV0pOyBpKyspIHtcbmZvciAodmFyIGogPSAwLCBuOyBqIDwgcy5yZW1vdmVkLmxlbmd0aCAmJiAobiA9IHMucmVtb3ZlZFtqXSk7IGorKykge1xucmVtb3ZlKG4pO1xuY29tcG9zZWQuc3BsaWNlKHMuaW5kZXggKyBkLCAxKTtcbn1cbmQgLT0gcy5hZGRlZENvdW50O1xufVxuZm9yICh2YXIgaSA9IDAsIHMsIG5leHQ7IGkgPCBzcGxpY2VzLmxlbmd0aCAmJiAocyA9IHNwbGljZXNbaV0pOyBpKyspIHtcbm5leHQgPSBjb21wb3NlZFtzLmluZGV4XTtcbmZvciAodmFyIGogPSBzLmluZGV4LCBuOyBqIDwgcy5pbmRleCArIHMuYWRkZWRDb3VudDsgaisrKSB7XG5uID0gY2hpbGRyZW5bal07XG5pbnNlcnRCZWZvcmUoY29udGFpbmVyLCBuLCBuZXh0KTtcbmNvbXBvc2VkLnNwbGljZShqLCAwLCBuKTtcbn1cbn1cbn0sXG5fbWF0Y2hlc0NvbnRlbnRTZWxlY3Q6IGZ1bmN0aW9uIChub2RlLCBjb250ZW50RWxlbWVudCkge1xudmFyIHNlbGVjdCA9IGNvbnRlbnRFbGVtZW50LmdldEF0dHJpYnV0ZSgnc2VsZWN0Jyk7XG5pZiAoIXNlbGVjdCkge1xucmV0dXJuIHRydWU7XG59XG5zZWxlY3QgPSBzZWxlY3QudHJpbSgpO1xuaWYgKCFzZWxlY3QpIHtcbnJldHVybiB0cnVlO1xufVxuaWYgKCEobm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG5yZXR1cm4gZmFsc2U7XG59XG52YXIgdmFsaWRTZWxlY3RvcnMgPSAvXig6bm90XFwoKT9bKi4jW2EtekEtWl98XS87XG5pZiAoIXZhbGlkU2VsZWN0b3JzLnRlc3Qoc2VsZWN0KSkge1xucmV0dXJuIGZhbHNlO1xufVxucmV0dXJuIHRoaXMuZWxlbWVudE1hdGNoZXMoc2VsZWN0LCBub2RlKTtcbn0sXG5fZWxlbWVudEFkZDogZnVuY3Rpb24gKCkge1xufSxcbl9lbGVtZW50UmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG59XG59KTtcbnZhciBzYXZlTGlnaHRDaGlsZHJlbklmTmVlZGVkID0gUG9seW1lci5Eb21BcGkuc2F2ZUxpZ2h0Q2hpbGRyZW5JZk5lZWRlZDtcbnZhciBnZXRMaWdodENoaWxkcmVuID0gUG9seW1lci5Eb21BcGkuZ2V0TGlnaHRDaGlsZHJlbjtcbnZhciBtYXRjaGVzU2VsZWN0b3IgPSBQb2x5bWVyLkRvbUFwaS5tYXRjaGVzU2VsZWN0b3I7XG52YXIgaGFzSW5zZXJ0aW9uUG9pbnQgPSBQb2x5bWVyLkRvbUFwaS5oYXNJbnNlcnRpb25Qb2ludDtcbnZhciBnZXRDb21wb3NlZENoaWxkcmVuID0gUG9seW1lci5Eb21BcGkuZ2V0Q29tcG9zZWRDaGlsZHJlbjtcbnZhciByZW1vdmVGcm9tQ29tcG9zZWRQYXJlbnQgPSBQb2x5bWVyLkRvbUFwaS5yZW1vdmVGcm9tQ29tcG9zZWRQYXJlbnQ7XG5mdW5jdGlvbiBkaXN0cmlidXRlTm9kZUludG8oY2hpbGQsIGluc2VydGlvblBvaW50KSB7XG5pbnNlcnRpb25Qb2ludC5fZGlzdHJpYnV0ZWROb2Rlcy5wdXNoKGNoaWxkKTtcbnZhciBwb2ludHMgPSBjaGlsZC5fZGVzdGluYXRpb25JbnNlcnRpb25Qb2ludHM7XG5pZiAoIXBvaW50cykge1xuY2hpbGQuX2Rlc3RpbmF0aW9uSW5zZXJ0aW9uUG9pbnRzID0gW2luc2VydGlvblBvaW50XTtcbn0gZWxzZSB7XG5wb2ludHMucHVzaChpbnNlcnRpb25Qb2ludCk7XG59XG59XG5mdW5jdGlvbiBjbGVhckRpc3RyaWJ1dGVkRGVzdGluYXRpb25JbnNlcnRpb25Qb2ludHMoY29udGVudCkge1xudmFyIGUkID0gY29udGVudC5fZGlzdHJpYnV0ZWROb2RlcztcbmlmIChlJCkge1xuZm9yICh2YXIgaSA9IDA7IGkgPCBlJC5sZW5ndGg7IGkrKykge1xudmFyIGQgPSBlJFtpXS5fZGVzdGluYXRpb25JbnNlcnRpb25Qb2ludHM7XG5pZiAoZCkge1xuZC5zcGxpY2UoZC5pbmRleE9mKGNvbnRlbnQpICsgMSwgZC5sZW5ndGgpO1xufVxufVxufVxufVxuZnVuY3Rpb24gbWF5YmVSZWRpc3RyaWJ1dGVQYXJlbnQoY29udGVudCwgaG9zdCkge1xudmFyIHBhcmVudCA9IGNvbnRlbnQuX2xpZ2h0UGFyZW50O1xuaWYgKHBhcmVudCAmJiBwYXJlbnQuc2hhZHlSb290ICYmIGhhc0luc2VydGlvblBvaW50KHBhcmVudC5zaGFkeVJvb3QpICYmIHBhcmVudC5zaGFkeVJvb3QuX2Rpc3RyaWJ1dGlvbkNsZWFuKSB7XG5wYXJlbnQuc2hhZHlSb290Ll9kaXN0cmlidXRpb25DbGVhbiA9IGZhbHNlO1xuaG9zdC5zaGFkeVJvb3QuX2RpcnR5Um9vdHMucHVzaChwYXJlbnQpO1xufVxufVxuZnVuY3Rpb24gaXNGaW5hbERlc3RpbmF0aW9uKGluc2VydGlvblBvaW50LCBub2RlKSB7XG52YXIgcG9pbnRzID0gbm9kZS5fZGVzdGluYXRpb25JbnNlcnRpb25Qb2ludHM7XG5yZXR1cm4gcG9pbnRzICYmIHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV0gPT09IGluc2VydGlvblBvaW50O1xufVxuZnVuY3Rpb24gaXNJbnNlcnRpb25Qb2ludChub2RlKSB7XG5yZXR1cm4gbm9kZS5sb2NhbE5hbWUgPT0gJ2NvbnRlbnQnO1xufVxudmFyIG5hdGl2ZUluc2VydEJlZm9yZSA9IEVsZW1lbnQucHJvdG90eXBlLmluc2VydEJlZm9yZTtcbnZhciBuYXRpdmVSZW1vdmVDaGlsZCA9IEVsZW1lbnQucHJvdG90eXBlLnJlbW92ZUNoaWxkO1xuZnVuY3Rpb24gaW5zZXJ0QmVmb3JlKHBhcmVudE5vZGUsIG5ld0NoaWxkLCByZWZDaGlsZCkge1xudmFyIG5ld0NoaWxkUGFyZW50ID0gZ2V0Q29tcG9zZWRQYXJlbnQobmV3Q2hpbGQpO1xuaWYgKG5ld0NoaWxkUGFyZW50ICE9PSBwYXJlbnROb2RlKSB7XG5yZW1vdmVGcm9tQ29tcG9zZWRQYXJlbnQobmV3Q2hpbGRQYXJlbnQsIG5ld0NoaWxkKTtcbn1cbnJlbW92ZShuZXdDaGlsZCk7XG5zYXZlTGlnaHRDaGlsZHJlbklmTmVlZGVkKHBhcmVudE5vZGUpO1xubmF0aXZlSW5zZXJ0QmVmb3JlLmNhbGwocGFyZW50Tm9kZSwgbmV3Q2hpbGQsIHJlZkNoaWxkIHx8IG51bGwpO1xubmV3Q2hpbGQuX2NvbXBvc2VkUGFyZW50ID0gcGFyZW50Tm9kZTtcbn1cbmZ1bmN0aW9uIHJlbW92ZShub2RlKSB7XG52YXIgcGFyZW50Tm9kZSA9IGdldENvbXBvc2VkUGFyZW50KG5vZGUpO1xuaWYgKHBhcmVudE5vZGUpIHtcbnNhdmVMaWdodENoaWxkcmVuSWZOZWVkZWQocGFyZW50Tm9kZSk7XG5ub2RlLl9jb21wb3NlZFBhcmVudCA9IG51bGw7XG5uYXRpdmVSZW1vdmVDaGlsZC5jYWxsKHBhcmVudE5vZGUsIG5vZGUpO1xufVxufVxuZnVuY3Rpb24gZ2V0Q29tcG9zZWRQYXJlbnQobm9kZSkge1xucmV0dXJuIG5vZGUuX19wYXRjaGVkID8gbm9kZS5fY29tcG9zZWRQYXJlbnQgOiBub2RlLnBhcmVudE5vZGU7XG59XG5mdW5jdGlvbiBnZXRUb3BEaXN0cmlidXRpbmdIb3N0KGhvc3QpIHtcbndoaWxlIChob3N0ICYmIGhvc3ROZWVkc1JlZGlzdHJpYnV0aW9uKGhvc3QpKSB7XG5ob3N0ID0gaG9zdC5kb21Ib3N0O1xufVxucmV0dXJuIGhvc3Q7XG59XG5mdW5jdGlvbiBob3N0TmVlZHNSZWRpc3RyaWJ1dGlvbihob3N0KSB7XG52YXIgYyQgPSBQb2x5bWVyLmRvbShob3N0KS5jaGlsZHJlbjtcbmZvciAodmFyIGkgPSAwLCBjOyBpIDwgYyQubGVuZ3RoOyBpKyspIHtcbmMgPSBjJFtpXTtcbmlmIChjLmxvY2FsTmFtZSA9PT0gJ2NvbnRlbnQnKSB7XG5yZXR1cm4gaG9zdC5kb21Ib3N0O1xufVxufVxufVxudmFyIG5lZWRzVXBncmFkZSA9IHdpbmRvdy5DdXN0b21FbGVtZW50cyAmJiAhQ3VzdG9tRWxlbWVudHMudXNlTmF0aXZlO1xuZnVuY3Rpb24gdXBncmFkZUxpZ2h0Q2hpbGRyZW4oY2hpbGRyZW4pIHtcbmlmIChuZWVkc1VwZ3JhZGUgJiYgY2hpbGRyZW4pIHtcbmZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbkN1c3RvbUVsZW1lbnRzLnVwZ3JhZGUoY2hpbGRyZW5baV0pO1xufVxufVxufVxufSgpKTtcbmlmIChQb2x5bWVyLlNldHRpbmdzLnVzZVNoYWRvdykge1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9wb29sQ29udGVudDogZnVuY3Rpb24gKCkge1xufSxcbl9iZWdpbkRpc3RyaWJ1dGU6IGZ1bmN0aW9uICgpIHtcbn0sXG5kaXN0cmlidXRlQ29udGVudDogZnVuY3Rpb24gKCkge1xufSxcbl9kaXN0cmlidXRlQ29udGVudDogZnVuY3Rpb24gKCkge1xufSxcbl9maW5pc2hEaXN0cmlidXRlOiBmdW5jdGlvbiAoKSB7XG59LFxuX2NyZWF0ZUxvY2FsUm9vdDogZnVuY3Rpb24gKCkge1xudGhpcy5jcmVhdGVTaGFkb3dSb290KCk7XG50aGlzLnNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQodGhpcy5yb290KTtcbnRoaXMucm9vdCA9IHRoaXMuc2hhZG93Um9vdDtcbn1cbn0pO1xufVxuUG9seW1lci5Eb21Nb2R1bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkb20tbW9kdWxlJyk7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX3JlZ2lzdGVyRmVhdHVyZXM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3ByZXBJcygpO1xudGhpcy5fcHJlcEF0dHJpYnV0ZXMoKTtcbnRoaXMuX3ByZXBCZWhhdmlvcnMoKTtcbnRoaXMuX3ByZXBFeHRlbmRzKCk7XG50aGlzLl9wcmVwQ29uc3RydWN0b3IoKTtcbnRoaXMuX3ByZXBUZW1wbGF0ZSgpO1xudGhpcy5fcHJlcFNoYWR5KCk7XG59LFxuX3ByZXBCZWhhdmlvcjogZnVuY3Rpb24gKGIpIHtcbnRoaXMuX2FkZEhvc3RBdHRyaWJ1dGVzKGIuaG9zdEF0dHJpYnV0ZXMpO1xufSxcbl9pbml0RmVhdHVyZXM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3Bvb2xDb250ZW50KCk7XG50aGlzLl9wdXNoSG9zdCgpO1xudGhpcy5fc3RhbXBUZW1wbGF0ZSgpO1xudGhpcy5fcG9wSG9zdCgpO1xudGhpcy5fbWFyc2hhbEhvc3RBdHRyaWJ1dGVzKCk7XG50aGlzLl9zZXR1cERlYm91bmNlcnMoKTtcbnRoaXMuX21hcnNoYWxCZWhhdmlvcnMoKTtcbnRoaXMuX3RyeVJlYWR5KCk7XG59LFxuX21hcnNoYWxCZWhhdmlvcjogZnVuY3Rpb24gKGIpIHtcbn1cbn0pO1xufSkoKTtcblxufSkiLCJyZXF1aXJlKFwiLi9wb2x5bWVyLW1pbmkuaHRtbFwiKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZnVuY3Rpb24oKSB7XG47KGZ1bmN0aW9uKCkge1xuUG9seW1lci5uYXIgPSBbXTtcblBvbHltZXIuQW5ub3RhdGlvbnMgPSB7XG5wYXJzZUFubm90YXRpb25zOiBmdW5jdGlvbiAodGVtcGxhdGUpIHtcbnZhciBsaXN0ID0gW107XG52YXIgY29udGVudCA9IHRlbXBsYXRlLl9jb250ZW50IHx8IHRlbXBsYXRlLmNvbnRlbnQ7XG50aGlzLl9wYXJzZU5vZGVBbm5vdGF0aW9ucyhjb250ZW50LCBsaXN0KTtcbnJldHVybiBsaXN0O1xufSxcbl9wYXJzZU5vZGVBbm5vdGF0aW9uczogZnVuY3Rpb24gKG5vZGUsIGxpc3QpIHtcbnJldHVybiBub2RlLm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERSA/IHRoaXMuX3BhcnNlVGV4dE5vZGVBbm5vdGF0aW9uKG5vZGUsIGxpc3QpIDogdGhpcy5fcGFyc2VFbGVtZW50QW5ub3RhdGlvbnMobm9kZSwgbGlzdCk7XG59LFxuX3Rlc3RFc2NhcGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xudmFyIGVzY2FwZSA9IHZhbHVlLnNsaWNlKDAsIDIpO1xuaWYgKGVzY2FwZSA9PT0gJ3t7JyB8fCBlc2NhcGUgPT09ICdbWycpIHtcbnJldHVybiBlc2NhcGU7XG59XG59LFxuX3BhcnNlVGV4dE5vZGVBbm5vdGF0aW9uOiBmdW5jdGlvbiAobm9kZSwgbGlzdCkge1xudmFyIHYgPSBub2RlLnRleHRDb250ZW50O1xudmFyIGVzY2FwZSA9IHRoaXMuX3Rlc3RFc2NhcGUodik7XG5pZiAoZXNjYXBlKSB7XG5ub2RlLnRleHRDb250ZW50ID0gJyAnO1xudmFyIGFubm90ZSA9IHtcbmJpbmRpbmdzOiBbe1xua2luZDogJ3RleHQnLFxubW9kZTogZXNjYXBlWzBdLFxudmFsdWU6IHYuc2xpY2UoMiwgLTIpLnRyaW0oKVxufV1cbn07XG5saXN0LnB1c2goYW5ub3RlKTtcbnJldHVybiBhbm5vdGU7XG59XG59LFxuX3BhcnNlRWxlbWVudEFubm90YXRpb25zOiBmdW5jdGlvbiAoZWxlbWVudCwgbGlzdCkge1xudmFyIGFubm90ZSA9IHtcbmJpbmRpbmdzOiBbXSxcbmV2ZW50czogW11cbn07XG5pZiAoZWxlbWVudC5sb2NhbE5hbWUgPT09ICdjb250ZW50Jykge1xubGlzdC5faGFzQ29udGVudCA9IHRydWU7XG59XG50aGlzLl9wYXJzZUNoaWxkTm9kZXNBbm5vdGF0aW9ucyhlbGVtZW50LCBhbm5vdGUsIGxpc3QpO1xuaWYgKGVsZW1lbnQuYXR0cmlidXRlcykge1xudGhpcy5fcGFyc2VOb2RlQXR0cmlidXRlQW5ub3RhdGlvbnMoZWxlbWVudCwgYW5ub3RlLCBsaXN0KTtcbmlmICh0aGlzLnByZXBFbGVtZW50KSB7XG50aGlzLnByZXBFbGVtZW50KGVsZW1lbnQpO1xufVxufVxuaWYgKGFubm90ZS5iaW5kaW5ncy5sZW5ndGggfHwgYW5ub3RlLmV2ZW50cy5sZW5ndGggfHwgYW5ub3RlLmlkKSB7XG5saXN0LnB1c2goYW5ub3RlKTtcbn1cbnJldHVybiBhbm5vdGU7XG59LFxuX3BhcnNlQ2hpbGROb2Rlc0Fubm90YXRpb25zOiBmdW5jdGlvbiAocm9vdCwgYW5ub3RlLCBsaXN0LCBjYWxsYmFjaykge1xuaWYgKHJvb3QuZmlyc3RDaGlsZCkge1xuZm9yICh2YXIgaSA9IDAsIG5vZGUgPSByb290LmZpcnN0Q2hpbGQ7IG5vZGU7IG5vZGUgPSBub2RlLm5leHRTaWJsaW5nLCBpKyspIHtcbmlmIChub2RlLmxvY2FsTmFtZSA9PT0gJ3RlbXBsYXRlJyAmJiAhbm9kZS5oYXNBdHRyaWJ1dGUoJ3ByZXNlcnZlLWNvbnRlbnQnKSkge1xudGhpcy5fcGFyc2VUZW1wbGF0ZShub2RlLCBpLCBsaXN0LCBhbm5vdGUpO1xufVxudmFyIGNoaWxkQW5ub3RhdGlvbiA9IHRoaXMuX3BhcnNlTm9kZUFubm90YXRpb25zKG5vZGUsIGxpc3QsIGNhbGxiYWNrKTtcbmlmIChjaGlsZEFubm90YXRpb24pIHtcbmNoaWxkQW5ub3RhdGlvbi5wYXJlbnQgPSBhbm5vdGU7XG5jaGlsZEFubm90YXRpb24uaW5kZXggPSBpO1xufVxufVxufVxufSxcbl9wYXJzZVRlbXBsYXRlOiBmdW5jdGlvbiAobm9kZSwgaW5kZXgsIGxpc3QsIHBhcmVudCkge1xudmFyIGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG5jb250ZW50Ll9ub3RlcyA9IHRoaXMucGFyc2VBbm5vdGF0aW9ucyhub2RlKTtcbmNvbnRlbnQuYXBwZW5kQ2hpbGQobm9kZS5jb250ZW50KTtcbmxpc3QucHVzaCh7XG5iaW5kaW5nczogUG9seW1lci5uYXIsXG5ldmVudHM6IFBvbHltZXIubmFyLFxudGVtcGxhdGVDb250ZW50OiBjb250ZW50LFxucGFyZW50OiBwYXJlbnQsXG5pbmRleDogaW5kZXhcbn0pO1xufSxcbl9wYXJzZU5vZGVBdHRyaWJ1dGVBbm5vdGF0aW9uczogZnVuY3Rpb24gKG5vZGUsIGFubm90YXRpb24pIHtcbmZvciAodmFyIGkgPSBub2RlLmF0dHJpYnV0ZXMubGVuZ3RoIC0gMSwgYTsgYSA9IG5vZGUuYXR0cmlidXRlc1tpXTsgaS0tKSB7XG52YXIgbiA9IGEubmFtZSwgdiA9IGEudmFsdWU7XG5pZiAobiA9PT0gJ2lkJyAmJiAhdGhpcy5fdGVzdEVzY2FwZSh2KSkge1xuYW5ub3RhdGlvbi5pZCA9IHY7XG59IGVsc2UgaWYgKG4uc2xpY2UoMCwgMykgPT09ICdvbi0nKSB7XG5ub2RlLnJlbW92ZUF0dHJpYnV0ZShuKTtcbmFubm90YXRpb24uZXZlbnRzLnB1c2goe1xubmFtZTogbi5zbGljZSgzKSxcbnZhbHVlOiB2XG59KTtcbn0gZWxzZSB7XG52YXIgYiA9IHRoaXMuX3BhcnNlTm9kZUF0dHJpYnV0ZUFubm90YXRpb24obm9kZSwgbiwgdik7XG5pZiAoYikge1xuYW5ub3RhdGlvbi5iaW5kaW5ncy5wdXNoKGIpO1xufVxufVxufVxufSxcbl9wYXJzZU5vZGVBdHRyaWJ1dGVBbm5vdGF0aW9uOiBmdW5jdGlvbiAobm9kZSwgbiwgdikge1xudmFyIGVzY2FwZSA9IHRoaXMuX3Rlc3RFc2NhcGUodik7XG5pZiAoZXNjYXBlKSB7XG52YXIgY3VzdG9tRXZlbnQ7XG52YXIgbmFtZSA9IG47XG52YXIgbW9kZSA9IGVzY2FwZVswXTtcbnYgPSB2LnNsaWNlKDIsIC0yKS50cmltKCk7XG52YXIgbm90ID0gZmFsc2U7XG5pZiAodlswXSA9PSAnIScpIHtcbnYgPSB2LnN1YnN0cmluZygxKTtcbm5vdCA9IHRydWU7XG59XG52YXIga2luZCA9ICdwcm9wZXJ0eSc7XG5pZiAobltuLmxlbmd0aCAtIDFdID09ICckJykge1xubmFtZSA9IG4uc2xpY2UoMCwgLTEpO1xua2luZCA9ICdhdHRyaWJ1dGUnO1xufVxudmFyIG5vdGlmeUV2ZW50LCBjb2xvbjtcbmlmIChtb2RlID09ICd7JyAmJiAoY29sb24gPSB2LmluZGV4T2YoJzo6JykpID4gMCkge1xubm90aWZ5RXZlbnQgPSB2LnN1YnN0cmluZyhjb2xvbiArIDIpO1xudiA9IHYuc3Vic3RyaW5nKDAsIGNvbG9uKTtcbmN1c3RvbUV2ZW50ID0gdHJ1ZTtcbn1cbmlmIChub2RlLmxvY2FsTmFtZSA9PSAnaW5wdXQnICYmIG4gPT0gJ3ZhbHVlJykge1xubm9kZS5zZXRBdHRyaWJ1dGUobiwgJycpO1xufVxubm9kZS5yZW1vdmVBdHRyaWJ1dGUobik7XG5pZiAoa2luZCA9PT0gJ3Byb3BlcnR5Jykge1xubmFtZSA9IFBvbHltZXIuQ2FzZU1hcC5kYXNoVG9DYW1lbENhc2UobmFtZSk7XG59XG5yZXR1cm4ge1xua2luZDoga2luZCxcbm1vZGU6IG1vZGUsXG5uYW1lOiBuYW1lLFxudmFsdWU6IHYsXG5uZWdhdGU6IG5vdCxcbmV2ZW50OiBub3RpZnlFdmVudCxcbmN1c3RvbUV2ZW50OiBjdXN0b21FdmVudFxufTtcbn1cbn0sXG5fbG9jYWxTdWJUcmVlOiBmdW5jdGlvbiAobm9kZSwgaG9zdCkge1xucmV0dXJuIG5vZGUgPT09IGhvc3QgPyBub2RlLmNoaWxkTm9kZXMgOiBub2RlLl9saWdodENoaWxkcmVuIHx8IG5vZGUuY2hpbGROb2Rlcztcbn0sXG5maW5kQW5ub3RhdGVkTm9kZTogZnVuY3Rpb24gKHJvb3QsIGFubm90ZSkge1xudmFyIHBhcmVudCA9IGFubm90ZS5wYXJlbnQgJiYgUG9seW1lci5Bbm5vdGF0aW9ucy5maW5kQW5ub3RhdGVkTm9kZShyb290LCBhbm5vdGUucGFyZW50KTtcbnJldHVybiAhcGFyZW50ID8gcm9vdCA6IFBvbHltZXIuQW5ub3RhdGlvbnMuX2xvY2FsU3ViVHJlZShwYXJlbnQsIHJvb3QpW2Fubm90ZS5pbmRleF07XG59XG59O1xuKGZ1bmN0aW9uICgpIHtcbmZ1bmN0aW9uIHJlc29sdmVDc3MoY3NzVGV4dCwgb3duZXJEb2N1bWVudCkge1xucmV0dXJuIGNzc1RleHQucmVwbGFjZShDU1NfVVJMX1JYLCBmdW5jdGlvbiAobSwgcHJlLCB1cmwsIHBvc3QpIHtcbnJldHVybiBwcmUgKyAnXFwnJyArIHJlc29sdmUodXJsLnJlcGxhY2UoL1tcIiddL2csICcnKSwgb3duZXJEb2N1bWVudCkgKyAnXFwnJyArIHBvc3Q7XG59KTtcbn1cbmZ1bmN0aW9uIHJlc29sdmVBdHRycyhlbGVtZW50LCBvd25lckRvY3VtZW50KSB7XG5mb3IgKHZhciBuYW1lIGluIFVSTF9BVFRSUykge1xudmFyIGEkID0gVVJMX0FUVFJTW25hbWVdO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBhJC5sZW5ndGgsIGEsIGF0LCB2OyBpIDwgbCAmJiAoYSA9IGEkW2ldKTsgaSsrKSB7XG5pZiAobmFtZSA9PT0gJyonIHx8IGVsZW1lbnQubG9jYWxOYW1lID09PSBuYW1lKSB7XG5hdCA9IGVsZW1lbnQuYXR0cmlidXRlc1thXTtcbnYgPSBhdCAmJiBhdC52YWx1ZTtcbmlmICh2ICYmIHYuc2VhcmNoKEJJTkRJTkdfUlgpIDwgMCkge1xuYXQudmFsdWUgPSBhID09PSAnc3R5bGUnID8gcmVzb2x2ZUNzcyh2LCBvd25lckRvY3VtZW50KSA6IHJlc29sdmUodiwgb3duZXJEb2N1bWVudCk7XG59XG59XG59XG59XG59XG5mdW5jdGlvbiByZXNvbHZlKHVybCwgb3duZXJEb2N1bWVudCkge1xuaWYgKHVybCAmJiB1cmxbMF0gPT09ICcjJykge1xucmV0dXJuIHVybDtcbn1cbnZhciByZXNvbHZlciA9IGdldFVybFJlc29sdmVyKG93bmVyRG9jdW1lbnQpO1xucmVzb2x2ZXIuaHJlZiA9IHVybDtcbnJldHVybiByZXNvbHZlci5ocmVmIHx8IHVybDtcbn1cbnZhciB0ZW1wRG9jO1xudmFyIHRlbXBEb2NCYXNlO1xuZnVuY3Rpb24gcmVzb2x2ZVVybCh1cmwsIGJhc2VVcmkpIHtcbmlmICghdGVtcERvYykge1xudGVtcERvYyA9IGRvY3VtZW50LmltcGxlbWVudGF0aW9uLmNyZWF0ZUhUTUxEb2N1bWVudCgndGVtcCcpO1xudGVtcERvY0Jhc2UgPSB0ZW1wRG9jLmNyZWF0ZUVsZW1lbnQoJ2Jhc2UnKTtcbnRlbXBEb2MuaGVhZC5hcHBlbmRDaGlsZCh0ZW1wRG9jQmFzZSk7XG59XG50ZW1wRG9jQmFzZS5ocmVmID0gYmFzZVVyaTtcbnJldHVybiByZXNvbHZlKHVybCwgdGVtcERvYyk7XG59XG5mdW5jdGlvbiBnZXRVcmxSZXNvbHZlcihvd25lckRvY3VtZW50KSB7XG5yZXR1cm4gb3duZXJEb2N1bWVudC5fX3VybFJlc29sdmVyIHx8IChvd25lckRvY3VtZW50Ll9fdXJsUmVzb2x2ZXIgPSBvd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKSk7XG59XG52YXIgQ1NTX1VSTF9SWCA9IC8odXJsXFwoKShbXildKikoXFwpKS9nO1xudmFyIFVSTF9BVFRSUyA9IHtcbicqJzogW1xuJ2hyZWYnLFxuJ3NyYycsXG4nc3R5bGUnLFxuJ3VybCdcbl0sXG5mb3JtOiBbJ2FjdGlvbiddXG59O1xudmFyIEJJTkRJTkdfUlggPSAvXFx7XFx7fFxcW1xcWy87XG5Qb2x5bWVyLlJlc29sdmVVcmwgPSB7XG5yZXNvbHZlQ3NzOiByZXNvbHZlQ3NzLFxucmVzb2x2ZUF0dHJzOiByZXNvbHZlQXR0cnMsXG5yZXNvbHZlVXJsOiByZXNvbHZlVXJsXG59O1xufSgpKTtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5fcHJlcEFubm90YXRpb25zOiBmdW5jdGlvbiAoKSB7XG5pZiAoIXRoaXMuX3RlbXBsYXRlKSB7XG50aGlzLl9ub3RlcyA9IFtdO1xufSBlbHNlIHtcblBvbHltZXIuQW5ub3RhdGlvbnMucHJlcEVsZW1lbnQgPSB0aGlzLl9wcmVwRWxlbWVudC5iaW5kKHRoaXMpO1xudGhpcy5fbm90ZXMgPSBQb2x5bWVyLkFubm90YXRpb25zLnBhcnNlQW5ub3RhdGlvbnModGhpcy5fdGVtcGxhdGUpO1xudGhpcy5fcHJvY2Vzc0Fubm90YXRpb25zKHRoaXMuX25vdGVzKTtcblBvbHltZXIuQW5ub3RhdGlvbnMucHJlcEVsZW1lbnQgPSBudWxsO1xufVxufSxcbl9wcm9jZXNzQW5ub3RhdGlvbnM6IGZ1bmN0aW9uIChub3Rlcykge1xuZm9yICh2YXIgaSA9IDA7IGkgPCBub3Rlcy5sZW5ndGg7IGkrKykge1xudmFyIG5vdGUgPSBub3Rlc1tpXTtcbmZvciAodmFyIGogPSAwOyBqIDwgbm90ZS5iaW5kaW5ncy5sZW5ndGg7IGorKykge1xudmFyIGIgPSBub3RlLmJpbmRpbmdzW2pdO1xuYi5zaWduYXR1cmUgPSB0aGlzLl9wYXJzZU1ldGhvZChiLnZhbHVlKTtcbmlmICghYi5zaWduYXR1cmUpIHtcbmIubW9kZWwgPSB0aGlzLl9tb2RlbEZvclBhdGgoYi52YWx1ZSk7XG59XG59XG5pZiAobm90ZS50ZW1wbGF0ZUNvbnRlbnQpIHtcbnRoaXMuX3Byb2Nlc3NBbm5vdGF0aW9ucyhub3RlLnRlbXBsYXRlQ29udGVudC5fbm90ZXMpO1xudmFyIHBwID0gbm90ZS50ZW1wbGF0ZUNvbnRlbnQuX3BhcmVudFByb3BzID0gdGhpcy5fZGlzY292ZXJUZW1wbGF0ZVBhcmVudFByb3BzKG5vdGUudGVtcGxhdGVDb250ZW50Ll9ub3Rlcyk7XG52YXIgYmluZGluZ3MgPSBbXTtcbmZvciAodmFyIHByb3AgaW4gcHApIHtcbmJpbmRpbmdzLnB1c2goe1xuaW5kZXg6IG5vdGUuaW5kZXgsXG5raW5kOiAncHJvcGVydHknLFxubW9kZTogJ3snLFxubmFtZTogJ19wYXJlbnRfJyArIHByb3AsXG5tb2RlbDogcHJvcCxcbnZhbHVlOiBwcm9wXG59KTtcbn1cbm5vdGUuYmluZGluZ3MgPSBub3RlLmJpbmRpbmdzLmNvbmNhdChiaW5kaW5ncyk7XG59XG59XG59LFxuX2Rpc2NvdmVyVGVtcGxhdGVQYXJlbnRQcm9wczogZnVuY3Rpb24gKG5vdGVzKSB7XG52YXIgcHAgPSB7fTtcbm5vdGVzLmZvckVhY2goZnVuY3Rpb24gKG4pIHtcbm4uYmluZGluZ3MuZm9yRWFjaChmdW5jdGlvbiAoYikge1xuaWYgKGIuc2lnbmF0dXJlKSB7XG52YXIgYXJncyA9IGIuc2lnbmF0dXJlLmFyZ3M7XG5mb3IgKHZhciBrID0gMDsgayA8IGFyZ3MubGVuZ3RoOyBrKyspIHtcbnBwW2FyZ3Nba10ubW9kZWxdID0gdHJ1ZTtcbn1cbn0gZWxzZSB7XG5wcFtiLm1vZGVsXSA9IHRydWU7XG59XG59KTtcbmlmIChuLnRlbXBsYXRlQ29udGVudCkge1xudmFyIHRwcCA9IG4udGVtcGxhdGVDb250ZW50Ll9wYXJlbnRQcm9wcztcblBvbHltZXIuQmFzZS5taXhpbihwcCwgdHBwKTtcbn1cbn0pO1xucmV0dXJuIHBwO1xufSxcbl9wcmVwRWxlbWVudDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcblBvbHltZXIuUmVzb2x2ZVVybC5yZXNvbHZlQXR0cnMoZWxlbWVudCwgdGhpcy5fdGVtcGxhdGUub3duZXJEb2N1bWVudCk7XG59LFxuX2ZpbmRBbm5vdGF0ZWROb2RlOiBQb2x5bWVyLkFubm90YXRpb25zLmZpbmRBbm5vdGF0ZWROb2RlLFxuX21hcnNoYWxBbm5vdGF0aW9uUmVmZXJlbmNlczogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuX3RlbXBsYXRlKSB7XG50aGlzLl9tYXJzaGFsSWROb2RlcygpO1xudGhpcy5fbWFyc2hhbEFubm90YXRlZE5vZGVzKCk7XG50aGlzLl9tYXJzaGFsQW5ub3RhdGVkTGlzdGVuZXJzKCk7XG59XG59LFxuX2NvbmZpZ3VyZUFubm90YXRpb25SZWZlcmVuY2VzOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9jb25maWd1cmVUZW1wbGF0ZUNvbnRlbnQoKTtcbn0sXG5fY29uZmlndXJlVGVtcGxhdGVDb250ZW50OiBmdW5jdGlvbiAoKSB7XG50aGlzLl9ub3Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChub3RlLCBpKSB7XG5pZiAobm90ZS50ZW1wbGF0ZUNvbnRlbnQpIHtcbnRoaXMuX25vZGVzW2ldLl9jb250ZW50ID0gbm90ZS50ZW1wbGF0ZUNvbnRlbnQ7XG59XG59LCB0aGlzKTtcbn0sXG5fbWFyc2hhbElkTm9kZXM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuJCA9IHt9O1xudGhpcy5fbm90ZXMuZm9yRWFjaChmdW5jdGlvbiAoYSkge1xuaWYgKGEuaWQpIHtcbnRoaXMuJFthLmlkXSA9IHRoaXMuX2ZpbmRBbm5vdGF0ZWROb2RlKHRoaXMucm9vdCwgYSk7XG59XG59LCB0aGlzKTtcbn0sXG5fbWFyc2hhbEFubm90YXRlZE5vZGVzOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5fbm9kZXMpIHtcbnRoaXMuX25vZGVzID0gdGhpcy5fbm9kZXMubWFwKGZ1bmN0aW9uIChhKSB7XG5yZXR1cm4gdGhpcy5fZmluZEFubm90YXRlZE5vZGUodGhpcy5yb290LCBhKTtcbn0sIHRoaXMpO1xufVxufSxcbl9tYXJzaGFsQW5ub3RhdGVkTGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9ub3Rlcy5mb3JFYWNoKGZ1bmN0aW9uIChhKSB7XG5pZiAoYS5ldmVudHMgJiYgYS5ldmVudHMubGVuZ3RoKSB7XG52YXIgbm9kZSA9IHRoaXMuX2ZpbmRBbm5vdGF0ZWROb2RlKHRoaXMucm9vdCwgYSk7XG5hLmV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG50aGlzLmxpc3Rlbihub2RlLCBlLm5hbWUsIGUudmFsdWUpO1xufSwgdGhpcyk7XG59XG59LCB0aGlzKTtcbn1cbn0pO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbmxpc3RlbmVyczoge30sXG5fbGlzdGVuTGlzdGVuZXJzOiBmdW5jdGlvbiAobGlzdGVuZXJzKSB7XG52YXIgbm9kZSwgbmFtZSwga2V5O1xuZm9yIChrZXkgaW4gbGlzdGVuZXJzKSB7XG5pZiAoa2V5LmluZGV4T2YoJy4nKSA8IDApIHtcbm5vZGUgPSB0aGlzO1xubmFtZSA9IGtleTtcbn0gZWxzZSB7XG5uYW1lID0ga2V5LnNwbGl0KCcuJyk7XG5ub2RlID0gdGhpcy4kW25hbWVbMF1dO1xubmFtZSA9IG5hbWVbMV07XG59XG50aGlzLmxpc3Rlbihub2RlLCBuYW1lLCBsaXN0ZW5lcnNba2V5XSk7XG59XG59LFxubGlzdGVuOiBmdW5jdGlvbiAobm9kZSwgZXZlbnROYW1lLCBtZXRob2ROYW1lKSB7XG50aGlzLl9saXN0ZW4obm9kZSwgZXZlbnROYW1lLCB0aGlzLl9jcmVhdGVFdmVudEhhbmRsZXIobm9kZSwgZXZlbnROYW1lLCBtZXRob2ROYW1lKSk7XG59LFxuX2JvdW5kTGlzdGVuZXJLZXk6IGZ1bmN0aW9uIChldmVudE5hbWUsIG1ldGhvZE5hbWUpIHtcbnJldHVybiBldmVudE5hbWUgKyAnOicgKyBtZXRob2ROYW1lO1xufSxcbl9yZWNvcmRFdmVudEhhbmRsZXI6IGZ1bmN0aW9uIChob3N0LCBldmVudE5hbWUsIHRhcmdldCwgbWV0aG9kTmFtZSwgaGFuZGxlcikge1xudmFyIGhibCA9IGhvc3QuX19ib3VuZExpc3RlbmVycztcbmlmICghaGJsKSB7XG5oYmwgPSBob3N0Ll9fYm91bmRMaXN0ZW5lcnMgPSBuZXcgV2Vha01hcCgpO1xufVxudmFyIGJsID0gaGJsLmdldCh0YXJnZXQpO1xuaWYgKCFibCkge1xuYmwgPSB7fTtcbmhibC5zZXQodGFyZ2V0LCBibCk7XG59XG52YXIga2V5ID0gdGhpcy5fYm91bmRMaXN0ZW5lcktleShldmVudE5hbWUsIG1ldGhvZE5hbWUpO1xuYmxba2V5XSA9IGhhbmRsZXI7XG59LFxuX3JlY2FsbEV2ZW50SGFuZGxlcjogZnVuY3Rpb24gKGhvc3QsIGV2ZW50TmFtZSwgdGFyZ2V0LCBtZXRob2ROYW1lKSB7XG52YXIgaGJsID0gaG9zdC5fX2JvdW5kTGlzdGVuZXJzO1xuaWYgKCFoYmwpIHtcbnJldHVybjtcbn1cbnZhciBibCA9IGhibC5nZXQodGFyZ2V0KTtcbmlmICghYmwpIHtcbnJldHVybjtcbn1cbnZhciBrZXkgPSB0aGlzLl9ib3VuZExpc3RlbmVyS2V5KGV2ZW50TmFtZSwgbWV0aG9kTmFtZSk7XG5yZXR1cm4gYmxba2V5XTtcbn0sXG5fY3JlYXRlRXZlbnRIYW5kbGVyOiBmdW5jdGlvbiAobm9kZSwgZXZlbnROYW1lLCBtZXRob2ROYW1lKSB7XG52YXIgaG9zdCA9IHRoaXM7XG52YXIgaGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7XG5pZiAoaG9zdFttZXRob2ROYW1lXSkge1xuaG9zdFttZXRob2ROYW1lXShlLCBlLmRldGFpbCk7XG59IGVsc2Uge1xuaG9zdC5fd2Fybihob3N0Ll9sb2dmKCdfY3JlYXRlRXZlbnRIYW5kbGVyJywgJ2xpc3RlbmVyIG1ldGhvZCBgJyArIG1ldGhvZE5hbWUgKyAnYCBub3QgZGVmaW5lZCcpKTtcbn1cbn07XG50aGlzLl9yZWNvcmRFdmVudEhhbmRsZXIoaG9zdCwgZXZlbnROYW1lLCBub2RlLCBtZXRob2ROYW1lLCBoYW5kbGVyKTtcbnJldHVybiBoYW5kbGVyO1xufSxcbnVubGlzdGVuOiBmdW5jdGlvbiAobm9kZSwgZXZlbnROYW1lLCBtZXRob2ROYW1lKSB7XG52YXIgaGFuZGxlciA9IHRoaXMuX3JlY2FsbEV2ZW50SGFuZGxlcih0aGlzLCBldmVudE5hbWUsIG5vZGUsIG1ldGhvZE5hbWUpO1xuaWYgKGhhbmRsZXIpIHtcbnRoaXMuX3VubGlzdGVuKG5vZGUsIGV2ZW50TmFtZSwgaGFuZGxlcik7XG59XG59LFxuX2xpc3RlbjogZnVuY3Rpb24gKG5vZGUsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xubm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgaGFuZGxlcik7XG59LFxuX3VubGlzdGVuOiBmdW5jdGlvbiAobm9kZSwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG5ub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyKTtcbn1cbn0pO1xuKGZ1bmN0aW9uICgpIHtcbid1c2Ugc3RyaWN0JztcbnZhciBIQVNfTkFUSVZFX1RBID0gdHlwZW9mIGRvY3VtZW50LmhlYWQuc3R5bGUudG91Y2hBY3Rpb24gPT09ICdzdHJpbmcnO1xudmFyIEdFU1RVUkVfS0VZID0gJ19fcG9seW1lckdlc3R1cmVzJztcbnZhciBIQU5ETEVEX09CSiA9ICdfX3BvbHltZXJHZXN0dXJlc0hhbmRsZWQnO1xudmFyIFRPVUNIX0FDVElPTiA9ICdfX3BvbHltZXJHZXN0dXJlc1RvdWNoQWN0aW9uJztcbnZhciBUQVBfRElTVEFOQ0UgPSAyNTtcbnZhciBUUkFDS19ESVNUQU5DRSA9IDU7XG52YXIgVFJBQ0tfTEVOR1RIID0gMjtcbnZhciBNT1VTRV9USU1FT1VUID0gMjUwMDtcbnZhciBNT1VTRV9FVkVOVFMgPSBbXG4nbW91c2Vkb3duJyxcbidtb3VzZW1vdmUnLFxuJ21vdXNldXAnLFxuJ2NsaWNrJ1xuXTtcbnZhciBJU19UT1VDSF9PTkxZID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvaVAoPzpbb2FdZHxob25lKXxBbmRyb2lkLyk7XG52YXIgbW91c2VDYW5jZWxsZXIgPSBmdW5jdGlvbiAobW91c2VFdmVudCkge1xubW91c2VFdmVudFtIQU5ETEVEX09CSl0gPSB7IHNraXA6IHRydWUgfTtcbmlmIChtb3VzZUV2ZW50LnR5cGUgPT09ICdjbGljaycpIHtcbnZhciBwYXRoID0gUG9seW1lci5kb20obW91c2VFdmVudCkucGF0aDtcbmZvciAodmFyIGkgPSAwOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xuaWYgKHBhdGhbaV0gPT09IFBPSU5URVJTVEFURS5tb3VzZS50YXJnZXQpIHtcbnJldHVybjtcbn1cbn1cbm1vdXNlRXZlbnQucHJldmVudERlZmF1bHQoKTtcbm1vdXNlRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG59XG59O1xuZnVuY3Rpb24gc2V0dXBUZWFyZG93bk1vdXNlQ2FuY2VsbGVyKHNldHVwKSB7XG5mb3IgKHZhciBpID0gMCwgZW47IGkgPCBNT1VTRV9FVkVOVFMubGVuZ3RoOyBpKyspIHtcbmVuID0gTU9VU0VfRVZFTlRTW2ldO1xuaWYgKHNldHVwKSB7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGVuLCBtb3VzZUNhbmNlbGxlciwgdHJ1ZSk7XG59IGVsc2Uge1xuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihlbiwgbW91c2VDYW5jZWxsZXIsIHRydWUpO1xufVxufVxufVxuZnVuY3Rpb24gaWdub3JlTW91c2UoKSB7XG5pZiAoSVNfVE9VQ0hfT05MWSkge1xucmV0dXJuO1xufVxuaWYgKCFQT0lOVEVSU1RBVEUubW91c2UubW91c2VJZ25vcmVKb2IpIHtcbnNldHVwVGVhcmRvd25Nb3VzZUNhbmNlbGxlcih0cnVlKTtcbn1cbnZhciB1bnNldCA9IGZ1bmN0aW9uICgpIHtcbnNldHVwVGVhcmRvd25Nb3VzZUNhbmNlbGxlcigpO1xuUE9JTlRFUlNUQVRFLm1vdXNlLnRhcmdldCA9IG51bGw7XG5QT0lOVEVSU1RBVEUubW91c2UubW91c2VJZ25vcmVKb2IgPSBudWxsO1xufTtcblBPSU5URVJTVEFURS5tb3VzZS5tb3VzZUlnbm9yZUpvYiA9IFBvbHltZXIuRGVib3VuY2UoUE9JTlRFUlNUQVRFLm1vdXNlLm1vdXNlSWdub3JlSm9iLCB1bnNldCwgTU9VU0VfVElNRU9VVCk7XG59XG52YXIgUE9JTlRFUlNUQVRFID0ge1xubW91c2U6IHtcbnRhcmdldDogbnVsbCxcbm1vdXNlSWdub3JlSm9iOiBudWxsXG59LFxudG91Y2g6IHtcbng6IDAsXG55OiAwLFxuaWQ6IC0xLFxuc2Nyb2xsRGVjaWRlZDogZmFsc2Vcbn1cbn07XG5mdW5jdGlvbiBmaXJzdFRvdWNoQWN0aW9uKGV2KSB7XG52YXIgcGF0aCA9IFBvbHltZXIuZG9tKGV2KS5wYXRoO1xudmFyIHRhID0gJ2F1dG8nO1xuZm9yICh2YXIgaSA9IDAsIG47IGkgPCBwYXRoLmxlbmd0aDsgaSsrKSB7XG5uID0gcGF0aFtpXTtcbmlmIChuW1RPVUNIX0FDVElPTl0pIHtcbnRhID0gbltUT1VDSF9BQ1RJT05dO1xuYnJlYWs7XG59XG59XG5yZXR1cm4gdGE7XG59XG52YXIgR2VzdHVyZXMgPSB7XG5nZXN0dXJlczoge30sXG5yZWNvZ25pemVyczogW10sXG5kZWVwVGFyZ2V0RmluZDogZnVuY3Rpb24gKHgsIHkpIHtcbnZhciBub2RlID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbnZhciBuZXh0ID0gbm9kZTtcbndoaWxlIChuZXh0ICYmIG5leHQuc2hhZG93Um9vdCkge1xubmV4dCA9IG5leHQuc2hhZG93Um9vdC5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuaWYgKG5leHQpIHtcbm5vZGUgPSBuZXh0O1xufVxufVxucmV0dXJuIG5vZGU7XG59LFxuZmluZE9yaWdpbmFsVGFyZ2V0OiBmdW5jdGlvbiAoZXYpIHtcbmlmIChldi5wYXRoKSB7XG5yZXR1cm4gZXYucGF0aFswXTtcbn1cbnJldHVybiBldi50YXJnZXQ7XG59LFxuaGFuZGxlTmF0aXZlOiBmdW5jdGlvbiAoZXYpIHtcbnZhciBoYW5kbGVkO1xudmFyIHR5cGUgPSBldi50eXBlO1xudmFyIG5vZGUgPSBldi5jdXJyZW50VGFyZ2V0O1xudmFyIGdvYmogPSBub2RlW0dFU1RVUkVfS0VZXTtcbnZhciBncyA9IGdvYmpbdHlwZV07XG5pZiAoIWdzKSB7XG5yZXR1cm47XG59XG5pZiAoIWV2W0hBTkRMRURfT0JKXSkge1xuZXZbSEFORExFRF9PQkpdID0ge307XG5pZiAodHlwZS5zbGljZSgwLCA1KSA9PT0gJ3RvdWNoJykge1xudmFyIHQgPSBldi5jaGFuZ2VkVG91Y2hlc1swXTtcbmlmICh0eXBlID09PSAndG91Y2hzdGFydCcpIHtcbmlmIChldi50b3VjaGVzLmxlbmd0aCA9PT0gMSkge1xuUE9JTlRFUlNUQVRFLnRvdWNoLmlkID0gdC5pZGVudGlmaWVyO1xufVxufVxuaWYgKFBPSU5URVJTVEFURS50b3VjaC5pZCAhPT0gdC5pZGVudGlmaWVyKSB7XG5yZXR1cm47XG59XG5pZiAoIUhBU19OQVRJVkVfVEEpIHtcbmlmICh0eXBlID09PSAndG91Y2hzdGFydCcgfHwgdHlwZSA9PT0gJ3RvdWNobW92ZScpIHtcbkdlc3R1cmVzLmhhbmRsZVRvdWNoQWN0aW9uKGV2KTtcbn1cbn1cbmlmICh0eXBlID09PSAndG91Y2hlbmQnKSB7XG5QT0lOVEVSU1RBVEUubW91c2UudGFyZ2V0ID0gUG9seW1lci5kb20oZXYpLnJvb3RUYXJnZXQ7XG5pZ25vcmVNb3VzZSh0cnVlKTtcbn1cbn1cbn1cbmhhbmRsZWQgPSBldltIQU5ETEVEX09CSl07XG5pZiAoaGFuZGxlZC5za2lwKSB7XG5yZXR1cm47XG59XG52YXIgcmVjb2duaXplcnMgPSBHZXN0dXJlcy5yZWNvZ25pemVycztcbmZvciAodmFyIGkgPSAwLCByOyBpIDwgcmVjb2duaXplcnMubGVuZ3RoOyBpKyspIHtcbnIgPSByZWNvZ25pemVyc1tpXTtcbmlmIChnc1tyLm5hbWVdICYmICFoYW5kbGVkW3IubmFtZV0pIHtcbmhhbmRsZWRbci5uYW1lXSA9IHRydWU7XG5yW3R5cGVdKGV2KTtcbn1cbn1cbn0sXG5oYW5kbGVUb3VjaEFjdGlvbjogZnVuY3Rpb24gKGV2KSB7XG52YXIgdCA9IGV2LmNoYW5nZWRUb3VjaGVzWzBdO1xudmFyIHR5cGUgPSBldi50eXBlO1xuaWYgKHR5cGUgPT09ICd0b3VjaHN0YXJ0Jykge1xuUE9JTlRFUlNUQVRFLnRvdWNoLnggPSB0LmNsaWVudFg7XG5QT0lOVEVSU1RBVEUudG91Y2gueSA9IHQuY2xpZW50WTtcblBPSU5URVJTVEFURS50b3VjaC5zY3JvbGxEZWNpZGVkID0gZmFsc2U7XG59IGVsc2UgaWYgKHR5cGUgPT09ICd0b3VjaG1vdmUnKSB7XG5pZiAoUE9JTlRFUlNUQVRFLnRvdWNoLnNjcm9sbERlY2lkZWQpIHtcbnJldHVybjtcbn1cblBPSU5URVJTVEFURS50b3VjaC5zY3JvbGxEZWNpZGVkID0gdHJ1ZTtcbnZhciB0YSA9IGZpcnN0VG91Y2hBY3Rpb24oZXYpO1xudmFyIHByZXZlbnQgPSBmYWxzZTtcbnZhciBkeCA9IE1hdGguYWJzKFBPSU5URVJTVEFURS50b3VjaC54IC0gdC5jbGllbnRYKTtcbnZhciBkeSA9IE1hdGguYWJzKFBPSU5URVJTVEFURS50b3VjaC55IC0gdC5jbGllbnRZKTtcbmlmICghZXYuY2FuY2VsYWJsZSkge1xufSBlbHNlIGlmICh0YSA9PT0gJ25vbmUnKSB7XG5wcmV2ZW50ID0gdHJ1ZTtcbn0gZWxzZSBpZiAodGEgPT09ICdwYW4teCcpIHtcbnByZXZlbnQgPSBkeSA+IGR4O1xufSBlbHNlIGlmICh0YSA9PT0gJ3Bhbi15Jykge1xucHJldmVudCA9IGR4ID4gZHk7XG59XG5pZiAocHJldmVudCkge1xuZXYucHJldmVudERlZmF1bHQoKTtcbn1cbn1cbn0sXG5hZGQ6IGZ1bmN0aW9uIChub2RlLCBldlR5cGUsIGhhbmRsZXIpIHtcbnZhciByZWNvZ25pemVyID0gdGhpcy5nZXN0dXJlc1tldlR5cGVdO1xudmFyIGRlcHMgPSByZWNvZ25pemVyLmRlcHM7XG52YXIgbmFtZSA9IHJlY29nbml6ZXIubmFtZTtcbnZhciBnb2JqID0gbm9kZVtHRVNUVVJFX0tFWV07XG5pZiAoIWdvYmopIHtcbm5vZGVbR0VTVFVSRV9LRVldID0gZ29iaiA9IHt9O1xufVxuZm9yICh2YXIgaSA9IDAsIGRlcCwgZ2Q7IGkgPCBkZXBzLmxlbmd0aDsgaSsrKSB7XG5kZXAgPSBkZXBzW2ldO1xuaWYgKElTX1RPVUNIX09OTFkgJiYgTU9VU0VfRVZFTlRTLmluZGV4T2YoZGVwKSA+IC0xKSB7XG5jb250aW51ZTtcbn1cbmdkID0gZ29ialtkZXBdO1xuaWYgKCFnZCkge1xuZ29ialtkZXBdID0gZ2QgPSB7IF9jb3VudDogMCB9O1xufVxuaWYgKGdkLl9jb3VudCA9PT0gMCkge1xubm9kZS5hZGRFdmVudExpc3RlbmVyKGRlcCwgdGhpcy5oYW5kbGVOYXRpdmUpO1xufVxuZ2RbbmFtZV0gPSAoZ2RbbmFtZV0gfHwgMCkgKyAxO1xuZ2QuX2NvdW50ID0gKGdkLl9jb3VudCB8fCAwKSArIDE7XG59XG5ub2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZUeXBlLCBoYW5kbGVyKTtcbmlmIChyZWNvZ25pemVyLnRvdWNoQWN0aW9uKSB7XG50aGlzLnNldFRvdWNoQWN0aW9uKG5vZGUsIHJlY29nbml6ZXIudG91Y2hBY3Rpb24pO1xufVxufSxcbnJlbW92ZTogZnVuY3Rpb24gKG5vZGUsIGV2VHlwZSwgaGFuZGxlcikge1xudmFyIHJlY29nbml6ZXIgPSB0aGlzLmdlc3R1cmVzW2V2VHlwZV07XG52YXIgZGVwcyA9IHJlY29nbml6ZXIuZGVwcztcbnZhciBuYW1lID0gcmVjb2duaXplci5uYW1lO1xudmFyIGdvYmogPSBub2RlW0dFU1RVUkVfS0VZXTtcbmlmIChnb2JqKSB7XG5mb3IgKHZhciBpID0gMCwgZGVwLCBnZDsgaSA8IGRlcHMubGVuZ3RoOyBpKyspIHtcbmRlcCA9IGRlcHNbaV07XG5nZCA9IGdvYmpbZGVwXTtcbmlmIChnZCAmJiBnZFtuYW1lXSkge1xuZ2RbbmFtZV0gPSAoZ2RbbmFtZV0gfHwgMSkgLSAxO1xuZ2QuX2NvdW50ID0gKGdkLl9jb3VudCB8fCAxKSAtIDE7XG59XG5pZiAoZ2QuX2NvdW50ID09PSAwKSB7XG5ub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZGVwLCB0aGlzLmhhbmRsZU5hdGl2ZSk7XG59XG59XG59XG5ub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZUeXBlLCBoYW5kbGVyKTtcbn0sXG5yZWdpc3RlcjogZnVuY3Rpb24gKHJlY29nKSB7XG50aGlzLnJlY29nbml6ZXJzLnB1c2gocmVjb2cpO1xuZm9yICh2YXIgaSA9IDA7IGkgPCByZWNvZy5lbWl0cy5sZW5ndGg7IGkrKykge1xudGhpcy5nZXN0dXJlc1tyZWNvZy5lbWl0c1tpXV0gPSByZWNvZztcbn1cbn0sXG5maW5kUmVjb2duaXplckJ5RXZlbnQ6IGZ1bmN0aW9uIChldk5hbWUpIHtcbmZvciAodmFyIGkgPSAwLCByOyBpIDwgdGhpcy5yZWNvZ25pemVycy5sZW5ndGg7IGkrKykge1xuciA9IHRoaXMucmVjb2duaXplcnNbaV07XG5mb3IgKHZhciBqID0gMCwgbjsgaiA8IHIuZW1pdHMubGVuZ3RoOyBqKyspIHtcbm4gPSByLmVtaXRzW2pdO1xuaWYgKG4gPT09IGV2TmFtZSkge1xucmV0dXJuIHI7XG59XG59XG59XG5yZXR1cm4gbnVsbDtcbn0sXG5zZXRUb3VjaEFjdGlvbjogZnVuY3Rpb24gKG5vZGUsIHZhbHVlKSB7XG5pZiAoSEFTX05BVElWRV9UQSkge1xubm9kZS5zdHlsZS50b3VjaEFjdGlvbiA9IHZhbHVlO1xufVxubm9kZVtUT1VDSF9BQ1RJT05dID0gdmFsdWU7XG59LFxuZmlyZTogZnVuY3Rpb24gKHRhcmdldCwgdHlwZSwgZGV0YWlsKSB7XG52YXIgZXYgPSBQb2x5bWVyLkJhc2UuZmlyZSh0eXBlLCBkZXRhaWwsIHtcbm5vZGU6IHRhcmdldCxcbmJ1YmJsZXM6IHRydWUsXG5jYW5jZWxhYmxlOiB0cnVlXG59KTtcbmlmIChldi5kZWZhdWx0UHJldmVudGVkKSB7XG52YXIgc2UgPSBkZXRhaWwuc291cmNlRXZlbnQ7XG5pZiAoc2UgJiYgc2UucHJldmVudERlZmF1bHQpIHtcbnNlLnByZXZlbnREZWZhdWx0KCk7XG59XG59XG59LFxucHJldmVudDogZnVuY3Rpb24gKGV2TmFtZSkge1xudmFyIHJlY29nbml6ZXIgPSB0aGlzLmZpbmRSZWNvZ25pemVyQnlFdmVudChldk5hbWUpO1xuaWYgKHJlY29nbml6ZXIuaW5mbykge1xucmVjb2duaXplci5pbmZvLnByZXZlbnQgPSB0cnVlO1xufVxufVxufTtcbkdlc3R1cmVzLnJlZ2lzdGVyKHtcbm5hbWU6ICdkb3dudXAnLFxuZGVwczogW1xuJ21vdXNlZG93bicsXG4ndG91Y2hzdGFydCcsXG4ndG91Y2hlbmQnXG5dLFxuZW1pdHM6IFtcbidkb3duJyxcbid1cCdcbl0sXG5tb3VzZWRvd246IGZ1bmN0aW9uIChlKSB7XG52YXIgdCA9IEdlc3R1cmVzLmZpbmRPcmlnaW5hbFRhcmdldChlKTtcbnZhciBzZWxmID0gdGhpcztcbnZhciB1cGZuID0gZnVuY3Rpb24gdXBmbihlKSB7XG5zZWxmLmZpcmUoJ3VwJywgdCwgZSk7XG5kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdXBmbik7XG59O1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHVwZm4pO1xudGhpcy5maXJlKCdkb3duJywgdCwgZSk7XG59LFxudG91Y2hzdGFydDogZnVuY3Rpb24gKGUpIHtcbnRoaXMuZmlyZSgnZG93bicsIEdlc3R1cmVzLmZpbmRPcmlnaW5hbFRhcmdldChlKSwgZS5jaGFuZ2VkVG91Y2hlc1swXSk7XG59LFxudG91Y2hlbmQ6IGZ1bmN0aW9uIChlKSB7XG50aGlzLmZpcmUoJ3VwJywgR2VzdHVyZXMuZmluZE9yaWdpbmFsVGFyZ2V0KGUpLCBlLmNoYW5nZWRUb3VjaGVzWzBdKTtcbn0sXG5maXJlOiBmdW5jdGlvbiAodHlwZSwgdGFyZ2V0LCBldmVudCkge1xudmFyIHNlbGYgPSB0aGlzO1xuR2VzdHVyZXMuZmlyZSh0YXJnZXQsIHR5cGUsIHtcbng6IGV2ZW50LmNsaWVudFgsXG55OiBldmVudC5jbGllbnRZLFxuc291cmNlRXZlbnQ6IGV2ZW50LFxucHJldmVudDogR2VzdHVyZXMucHJldmVudC5iaW5kKEdlc3R1cmVzKVxufSk7XG59XG59KTtcbkdlc3R1cmVzLnJlZ2lzdGVyKHtcbm5hbWU6ICd0cmFjaycsXG50b3VjaEFjdGlvbjogJ25vbmUnLFxuZGVwczogW1xuJ21vdXNlZG93bicsXG4ndG91Y2hzdGFydCcsXG4ndG91Y2htb3ZlJyxcbid0b3VjaGVuZCdcbl0sXG5lbWl0czogWyd0cmFjayddLFxuaW5mbzoge1xueDogMCxcbnk6IDAsXG5zdGF0ZTogJ3N0YXJ0JyxcbnN0YXJ0ZWQ6IGZhbHNlLFxubW92ZXM6IFtdLFxuYWRkTW92ZTogZnVuY3Rpb24gKG1vdmUpIHtcbmlmICh0aGlzLm1vdmVzLmxlbmd0aCA+IFRSQUNLX0xFTkdUSCkge1xudGhpcy5tb3Zlcy5zaGlmdCgpO1xufVxudGhpcy5tb3Zlcy5wdXNoKG1vdmUpO1xufSxcbnByZXZlbnQ6IGZhbHNlXG59LFxuY2xlYXJJbmZvOiBmdW5jdGlvbiAoKSB7XG50aGlzLmluZm8uc3RhdGUgPSAnc3RhcnQnO1xudGhpcy5pbmZvLnN0YXJ0ZWQgPSBmYWxzZTtcbnRoaXMuaW5mby5tb3ZlcyA9IFtdO1xudGhpcy5pbmZvLnggPSAwO1xudGhpcy5pbmZvLnkgPSAwO1xudGhpcy5pbmZvLnByZXZlbnQgPSBmYWxzZTtcbn0sXG5oYXNNb3ZlZEVub3VnaDogZnVuY3Rpb24gKHgsIHkpIHtcbmlmICh0aGlzLmluZm8ucHJldmVudCkge1xucmV0dXJuIGZhbHNlO1xufVxuaWYgKHRoaXMuaW5mby5zdGFydGVkKSB7XG5yZXR1cm4gdHJ1ZTtcbn1cbnZhciBkeCA9IE1hdGguYWJzKHRoaXMuaW5mby54IC0geCk7XG52YXIgZHkgPSBNYXRoLmFicyh0aGlzLmluZm8ueSAtIHkpO1xucmV0dXJuIGR4ID49IFRSQUNLX0RJU1RBTkNFIHx8IGR5ID49IFRSQUNLX0RJU1RBTkNFO1xufSxcbm1vdXNlZG93bjogZnVuY3Rpb24gKGUpIHtcbnZhciB0ID0gR2VzdHVyZXMuZmluZE9yaWdpbmFsVGFyZ2V0KGUpO1xudmFyIHNlbGYgPSB0aGlzO1xudmFyIG1vdmVmbiA9IGZ1bmN0aW9uIG1vdmVmbihlKSB7XG52YXIgeCA9IGUuY2xpZW50WCwgeSA9IGUuY2xpZW50WTtcbmlmIChzZWxmLmhhc01vdmVkRW5vdWdoKHgsIHkpKSB7XG5zZWxmLmluZm8uc3RhdGUgPSBzZWxmLmluZm8uc3RhcnRlZCA/IGUudHlwZSA9PT0gJ21vdXNldXAnID8gJ2VuZCcgOiAndHJhY2snIDogJ3N0YXJ0JztcbnNlbGYuaW5mby5hZGRNb3ZlKHtcbng6IHgsXG55OiB5XG59KTtcbnNlbGYuZmlyZSh0LCBlKTtcbnNlbGYuaW5mby5zdGFydGVkID0gdHJ1ZTtcbn1cbn07XG52YXIgdXBmbiA9IGZ1bmN0aW9uIHVwZm4oZSkge1xuaWYgKHNlbGYuaW5mby5zdGFydGVkKSB7XG5HZXN0dXJlcy5wcmV2ZW50KCd0YXAnKTtcbm1vdmVmbihlKTtcbn1cbnNlbGYuY2xlYXJJbmZvKCk7XG5kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3ZlZm4pO1xuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHVwZm4pO1xufTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdmVmbik7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdXBmbik7XG50aGlzLmluZm8ueCA9IGUuY2xpZW50WDtcbnRoaXMuaW5mby55ID0gZS5jbGllbnRZO1xufSxcbnRvdWNoc3RhcnQ6IGZ1bmN0aW9uIChlKSB7XG52YXIgY3QgPSBlLmNoYW5nZWRUb3VjaGVzWzBdO1xudGhpcy5pbmZvLnggPSBjdC5jbGllbnRYO1xudGhpcy5pbmZvLnkgPSBjdC5jbGllbnRZO1xufSxcbnRvdWNobW92ZTogZnVuY3Rpb24gKGUpIHtcbnZhciB0ID0gR2VzdHVyZXMuZmluZE9yaWdpbmFsVGFyZ2V0KGUpO1xudmFyIGN0ID0gZS5jaGFuZ2VkVG91Y2hlc1swXTtcbnZhciB4ID0gY3QuY2xpZW50WCwgeSA9IGN0LmNsaWVudFk7XG5pZiAodGhpcy5oYXNNb3ZlZEVub3VnaCh4LCB5KSkge1xudGhpcy5pbmZvLmFkZE1vdmUoe1xueDogeCxcbnk6IHlcbn0pO1xudGhpcy5maXJlKHQsIGN0KTtcbnRoaXMuaW5mby5zdGF0ZSA9ICd0cmFjayc7XG50aGlzLmluZm8uc3RhcnRlZCA9IHRydWU7XG59XG59LFxudG91Y2hlbmQ6IGZ1bmN0aW9uIChlKSB7XG52YXIgdCA9IEdlc3R1cmVzLmZpbmRPcmlnaW5hbFRhcmdldChlKTtcbnZhciBjdCA9IGUuY2hhbmdlZFRvdWNoZXNbMF07XG5pZiAodGhpcy5pbmZvLnN0YXJ0ZWQpIHtcbkdlc3R1cmVzLnByZXZlbnQoJ3RhcCcpO1xudGhpcy5pbmZvLnN0YXRlID0gJ2VuZCc7XG50aGlzLmluZm8uYWRkTW92ZSh7XG54OiBjdC5jbGllbnRYLFxueTogY3QuY2xpZW50WVxufSk7XG50aGlzLmZpcmUodCwgY3QpO1xufVxudGhpcy5jbGVhckluZm8oKTtcbn0sXG5maXJlOiBmdW5jdGlvbiAodGFyZ2V0LCB0b3VjaCkge1xudmFyIHNlY29uZGxhc3QgPSB0aGlzLmluZm8ubW92ZXNbdGhpcy5pbmZvLm1vdmVzLmxlbmd0aCAtIDJdO1xudmFyIGxhc3Rtb3ZlID0gdGhpcy5pbmZvLm1vdmVzW3RoaXMuaW5mby5tb3Zlcy5sZW5ndGggLSAxXTtcbnZhciBkeCA9IGxhc3Rtb3ZlLnggLSB0aGlzLmluZm8ueDtcbnZhciBkeSA9IGxhc3Rtb3ZlLnkgLSB0aGlzLmluZm8ueTtcbnZhciBkZHgsIGRkeSA9IDA7XG5pZiAoc2Vjb25kbGFzdCkge1xuZGR4ID0gbGFzdG1vdmUueCAtIHNlY29uZGxhc3QueDtcbmRkeSA9IGxhc3Rtb3ZlLnkgLSBzZWNvbmRsYXN0Lnk7XG59XG5yZXR1cm4gR2VzdHVyZXMuZmlyZSh0YXJnZXQsICd0cmFjaycsIHtcbnN0YXRlOiB0aGlzLmluZm8uc3RhdGUsXG54OiB0b3VjaC5jbGllbnRYLFxueTogdG91Y2guY2xpZW50WSxcbmR4OiBkeCxcbmR5OiBkeSxcbmRkeDogZGR4LFxuZGR5OiBkZHksXG5zb3VyY2VFdmVudDogdG91Y2gsXG5ob3ZlcjogZnVuY3Rpb24gKCkge1xucmV0dXJuIEdlc3R1cmVzLmRlZXBUYXJnZXRGaW5kKHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpO1xufVxufSk7XG59XG59KTtcbkdlc3R1cmVzLnJlZ2lzdGVyKHtcbm5hbWU6ICd0YXAnLFxuZGVwczogW1xuJ21vdXNlZG93bicsXG4nY2xpY2snLFxuJ3RvdWNoc3RhcnQnLFxuJ3RvdWNoZW5kJ1xuXSxcbmVtaXRzOiBbJ3RhcCddLFxuaW5mbzoge1xueDogTmFOLFxueTogTmFOLFxucHJldmVudDogZmFsc2Vcbn0sXG5yZXNldDogZnVuY3Rpb24gKCkge1xudGhpcy5pbmZvLnggPSBOYU47XG50aGlzLmluZm8ueSA9IE5hTjtcbnRoaXMuaW5mby5wcmV2ZW50ID0gZmFsc2U7XG59LFxuc2F2ZTogZnVuY3Rpb24gKGUpIHtcbnRoaXMuaW5mby54ID0gZS5jbGllbnRYO1xudGhpcy5pbmZvLnkgPSBlLmNsaWVudFk7XG59LFxubW91c2Vkb3duOiBmdW5jdGlvbiAoZSkge1xudGhpcy5zYXZlKGUpO1xufSxcbmNsaWNrOiBmdW5jdGlvbiAoZSkge1xudGhpcy5mb3J3YXJkKGUpO1xufSxcbnRvdWNoc3RhcnQ6IGZ1bmN0aW9uIChlKSB7XG50aGlzLnNhdmUoZS5jaGFuZ2VkVG91Y2hlc1swXSk7XG59LFxudG91Y2hlbmQ6IGZ1bmN0aW9uIChlKSB7XG50aGlzLmZvcndhcmQoZS5jaGFuZ2VkVG91Y2hlc1swXSk7XG59LFxuZm9yd2FyZDogZnVuY3Rpb24gKGUpIHtcbnZhciBkeCA9IE1hdGguYWJzKGUuY2xpZW50WCAtIHRoaXMuaW5mby54KTtcbnZhciBkeSA9IE1hdGguYWJzKGUuY2xpZW50WSAtIHRoaXMuaW5mby55KTtcbnZhciB0ID0gR2VzdHVyZXMuZmluZE9yaWdpbmFsVGFyZ2V0KGUpO1xuaWYgKGlzTmFOKGR4KSB8fCBpc05hTihkeSkgfHwgZHggPD0gVEFQX0RJU1RBTkNFICYmIGR5IDw9IFRBUF9ESVNUQU5DRSkge1xuaWYgKCF0aGlzLmluZm8ucHJldmVudCkge1xuR2VzdHVyZXMuZmlyZSh0LCAndGFwJywge1xueDogZS5jbGllbnRYLFxueTogZS5jbGllbnRZLFxuc291cmNlRXZlbnQ6IGVcbn0pO1xufVxufVxudGhpcy5yZXNldCgpO1xufVxufSk7XG52YXIgRElSRUNUSU9OX01BUCA9IHtcbng6ICdwYW4teCcsXG55OiAncGFuLXknLFxubm9uZTogJ25vbmUnLFxuYWxsOiAnYXV0bydcbn07XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX2xpc3RlbjogZnVuY3Rpb24gKG5vZGUsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xuaWYgKEdlc3R1cmVzLmdlc3R1cmVzW2V2ZW50TmFtZV0pIHtcbkdlc3R1cmVzLmFkZChub2RlLCBldmVudE5hbWUsIGhhbmRsZXIpO1xufSBlbHNlIHtcbm5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIpO1xufVxufSxcbl91bmxpc3RlbjogZnVuY3Rpb24gKG5vZGUsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xuaWYgKEdlc3R1cmVzLmdlc3R1cmVzW2V2ZW50TmFtZV0pIHtcbkdlc3R1cmVzLnJlbW92ZShub2RlLCBldmVudE5hbWUsIGhhbmRsZXIpO1xufSBlbHNlIHtcbm5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIpO1xufVxufSxcbnNldFNjcm9sbERpcmVjdGlvbjogZnVuY3Rpb24gKGRpcmVjdGlvbiwgbm9kZSkge1xubm9kZSA9IG5vZGUgfHwgdGhpcztcbkdlc3R1cmVzLnNldFRvdWNoQWN0aW9uKG5vZGUsIERJUkVDVElPTl9NQVBbZGlyZWN0aW9uXSB8fCAnYXV0bycpO1xufVxufSk7XG5Qb2x5bWVyLkdlc3R1cmVzID0gR2VzdHVyZXM7XG59KCkpO1xuUG9seW1lci5Bc3luYyA9IHtcbl9jdXJyVmFsOiAwLFxuX2xhc3RWYWw6IDAsXG5fY2FsbGJhY2tzOiBbXSxcbl90d2lkZGxlQ29udGVudDogMCxcbl90d2lkZGxlOiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyksXG5ydW46IGZ1bmN0aW9uIChjYWxsYmFjaywgd2FpdFRpbWUpIHtcbmlmICh3YWl0VGltZSA+IDApIHtcbnJldHVybiB+c2V0VGltZW91dChjYWxsYmFjaywgd2FpdFRpbWUpO1xufSBlbHNlIHtcbnRoaXMuX3R3aWRkbGUudGV4dENvbnRlbnQgPSB0aGlzLl90d2lkZGxlQ29udGVudCsrO1xudGhpcy5fY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xucmV0dXJuIHRoaXMuX2N1cnJWYWwrKztcbn1cbn0sXG5jYW5jZWw6IGZ1bmN0aW9uIChoYW5kbGUpIHtcbmlmIChoYW5kbGUgPCAwKSB7XG5jbGVhclRpbWVvdXQofmhhbmRsZSk7XG59IGVsc2Uge1xudmFyIGlkeCA9IGhhbmRsZSAtIHRoaXMuX2xhc3RWYWw7XG5pZiAoaWR4ID49IDApIHtcbmlmICghdGhpcy5fY2FsbGJhY2tzW2lkeF0pIHtcbnRocm93ICdpbnZhbGlkIGFzeW5jIGhhbmRsZTogJyArIGhhbmRsZTtcbn1cbnRoaXMuX2NhbGxiYWNrc1tpZHhdID0gbnVsbDtcbn1cbn1cbn0sXG5fYXRFbmRPZk1pY3JvdGFzazogZnVuY3Rpb24gKCkge1xudmFyIGxlbiA9IHRoaXMuX2NhbGxiYWNrcy5sZW5ndGg7XG5mb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG52YXIgY2IgPSB0aGlzLl9jYWxsYmFja3NbaV07XG5pZiAoY2IpIHtcbnRyeSB7XG5jYigpO1xufSBjYXRjaCAoZSkge1xuaSsrO1xudGhpcy5fY2FsbGJhY2tzLnNwbGljZSgwLCBpKTtcbnRoaXMuX2xhc3RWYWwgKz0gaTtcbnRoaXMuX3R3aWRkbGUudGV4dENvbnRlbnQgPSB0aGlzLl90d2lkZGxlQ29udGVudCsrO1xudGhyb3cgZTtcbn1cbn1cbn1cbnRoaXMuX2NhbGxiYWNrcy5zcGxpY2UoMCwgbGVuKTtcbnRoaXMuX2xhc3RWYWwgKz0gbGVuO1xufVxufTtcbm5ldyAod2luZG93Lk11dGF0aW9uT2JzZXJ2ZXIgfHwgSnNNdXRhdGlvbk9ic2VydmVyKShQb2x5bWVyLkFzeW5jLl9hdEVuZE9mTWljcm90YXNrLmJpbmQoUG9seW1lci5Bc3luYykpLm9ic2VydmUoUG9seW1lci5Bc3luYy5fdHdpZGRsZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuUG9seW1lci5EZWJvdW5jZSA9IGZ1bmN0aW9uICgpIHtcbnZhciBBc3luYyA9IFBvbHltZXIuQXN5bmM7XG52YXIgRGVib3VuY2VyID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbnRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG50aGlzLmJvdW5kQ29tcGxldGUgPSB0aGlzLmNvbXBsZXRlLmJpbmQodGhpcyk7XG59O1xuRGVib3VuY2VyLnByb3RvdHlwZSA9IHtcbmdvOiBmdW5jdGlvbiAoY2FsbGJhY2ssIHdhaXQpIHtcbnZhciBoO1xudGhpcy5maW5pc2ggPSBmdW5jdGlvbiAoKSB7XG5Bc3luYy5jYW5jZWwoaCk7XG59O1xuaCA9IEFzeW5jLnJ1bih0aGlzLmJvdW5kQ29tcGxldGUsIHdhaXQpO1xudGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xufSxcbnN0b3A6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLmZpbmlzaCkge1xudGhpcy5maW5pc2goKTtcbnRoaXMuZmluaXNoID0gbnVsbDtcbn1cbn0sXG5jb21wbGV0ZTogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuZmluaXNoKSB7XG50aGlzLnN0b3AoKTtcbnRoaXMuY2FsbGJhY2suY2FsbCh0aGlzLmNvbnRleHQpO1xufVxufVxufTtcbmZ1bmN0aW9uIGRlYm91bmNlKGRlYm91bmNlciwgY2FsbGJhY2ssIHdhaXQpIHtcbmlmIChkZWJvdW5jZXIpIHtcbmRlYm91bmNlci5zdG9wKCk7XG59IGVsc2Uge1xuZGVib3VuY2VyID0gbmV3IERlYm91bmNlcih0aGlzKTtcbn1cbmRlYm91bmNlci5nbyhjYWxsYmFjaywgd2FpdCk7XG5yZXR1cm4gZGVib3VuY2VyO1xufVxucmV0dXJuIGRlYm91bmNlO1xufSgpO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbiQkOiBmdW5jdGlvbiAoc2xjdHIpIHtcbnJldHVybiBQb2x5bWVyLmRvbSh0aGlzLnJvb3QpLnF1ZXJ5U2VsZWN0b3Ioc2xjdHIpO1xufSxcbnRvZ2dsZUNsYXNzOiBmdW5jdGlvbiAobmFtZSwgYm9vbCwgbm9kZSkge1xubm9kZSA9IG5vZGUgfHwgdGhpcztcbmlmIChhcmd1bWVudHMubGVuZ3RoID09IDEpIHtcbmJvb2wgPSAhbm9kZS5jbGFzc0xpc3QuY29udGFpbnMobmFtZSk7XG59XG5pZiAoYm9vbCkge1xuUG9seW1lci5kb20obm9kZSkuY2xhc3NMaXN0LmFkZChuYW1lKTtcbn0gZWxzZSB7XG5Qb2x5bWVyLmRvbShub2RlKS5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xufVxufSxcbnRvZ2dsZUF0dHJpYnV0ZTogZnVuY3Rpb24gKG5hbWUsIGJvb2wsIG5vZGUpIHtcbm5vZGUgPSBub2RlIHx8IHRoaXM7XG5pZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxKSB7XG5ib29sID0gIW5vZGUuaGFzQXR0cmlidXRlKG5hbWUpO1xufVxuaWYgKGJvb2wpIHtcblBvbHltZXIuZG9tKG5vZGUpLnNldEF0dHJpYnV0ZShuYW1lLCAnJyk7XG59IGVsc2Uge1xuUG9seW1lci5kb20obm9kZSkucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xufVxufSxcbmNsYXNzRm9sbG93czogZnVuY3Rpb24gKG5hbWUsIHRvRWxlbWVudCwgZnJvbUVsZW1lbnQpIHtcbmlmIChmcm9tRWxlbWVudCkge1xuUG9seW1lci5kb20oZnJvbUVsZW1lbnQpLmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XG59XG5pZiAodG9FbGVtZW50KSB7XG5Qb2x5bWVyLmRvbSh0b0VsZW1lbnQpLmNsYXNzTGlzdC5hZGQobmFtZSk7XG59XG59LFxuYXR0cmlidXRlRm9sbG93czogZnVuY3Rpb24gKG5hbWUsIHRvRWxlbWVudCwgZnJvbUVsZW1lbnQpIHtcbmlmIChmcm9tRWxlbWVudCkge1xuUG9seW1lci5kb20oZnJvbUVsZW1lbnQpLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbn1cbmlmICh0b0VsZW1lbnQpIHtcblBvbHltZXIuZG9tKHRvRWxlbWVudCkuc2V0QXR0cmlidXRlKG5hbWUsICcnKTtcbn1cbn0sXG5nZXRDb250ZW50Q2hpbGROb2RlczogZnVuY3Rpb24gKHNsY3RyKSB7XG5yZXR1cm4gUG9seW1lci5kb20oUG9seW1lci5kb20odGhpcy5yb290KS5xdWVyeVNlbGVjdG9yKHNsY3RyIHx8ICdjb250ZW50JykpLmdldERpc3RyaWJ1dGVkTm9kZXMoKTtcbn0sXG5nZXRDb250ZW50Q2hpbGRyZW46IGZ1bmN0aW9uIChzbGN0cikge1xucmV0dXJuIHRoaXMuZ2V0Q29udGVudENoaWxkTm9kZXMoc2xjdHIpLmZpbHRlcihmdW5jdGlvbiAobikge1xucmV0dXJuIG4ubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFO1xufSk7XG59LFxuZmlyZTogZnVuY3Rpb24gKHR5cGUsIGRldGFpbCwgb3B0aW9ucykge1xub3B0aW9ucyA9IG9wdGlvbnMgfHwgUG9seW1lci5ub2I7XG52YXIgbm9kZSA9IG9wdGlvbnMubm9kZSB8fCB0aGlzO1xudmFyIGRldGFpbCA9IGRldGFpbCA9PT0gbnVsbCB8fCBkZXRhaWwgPT09IHVuZGVmaW5lZCA/IFBvbHltZXIubm9iIDogZGV0YWlsO1xudmFyIGJ1YmJsZXMgPSBvcHRpb25zLmJ1YmJsZXMgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBvcHRpb25zLmJ1YmJsZXM7XG52YXIgY2FuY2VsYWJsZSA9IEJvb2xlYW4ob3B0aW9ucy5jYW5jZWxhYmxlKTtcbnZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudCh0eXBlLCB7XG5idWJibGVzOiBCb29sZWFuKGJ1YmJsZXMpLFxuY2FuY2VsYWJsZTogY2FuY2VsYWJsZSxcbmRldGFpbDogZGV0YWlsXG59KTtcbm5vZGUuZGlzcGF0Y2hFdmVudChldmVudCk7XG5yZXR1cm4gZXZlbnQ7XG59LFxuYXN5bmM6IGZ1bmN0aW9uIChjYWxsYmFjaywgd2FpdFRpbWUpIHtcbnJldHVybiBQb2x5bWVyLkFzeW5jLnJ1bihjYWxsYmFjay5iaW5kKHRoaXMpLCB3YWl0VGltZSk7XG59LFxuY2FuY2VsQXN5bmM6IGZ1bmN0aW9uIChoYW5kbGUpIHtcblBvbHltZXIuQXN5bmMuY2FuY2VsKGhhbmRsZSk7XG59LFxuYXJyYXlEZWxldGU6IGZ1bmN0aW9uIChwYXRoLCBpdGVtKSB7XG52YXIgaW5kZXg7XG5pZiAoQXJyYXkuaXNBcnJheShwYXRoKSkge1xuaW5kZXggPSBwYXRoLmluZGV4T2YoaXRlbSk7XG5pZiAoaW5kZXggPj0gMCkge1xucmV0dXJuIHBhdGguc3BsaWNlKGluZGV4LCAxKTtcbn1cbn0gZWxzZSB7XG52YXIgYXJyID0gdGhpcy5nZXQocGF0aCk7XG5pbmRleCA9IGFyci5pbmRleE9mKGl0ZW0pO1xuaWYgKGluZGV4ID49IDApIHtcbnJldHVybiB0aGlzLnNwbGljZShwYXRoLCBpbmRleCwgMSk7XG59XG59XG59LFxudHJhbnNmb3JtOiBmdW5jdGlvbiAodHJhbnNmb3JtLCBub2RlKSB7XG5ub2RlID0gbm9kZSB8fCB0aGlzO1xubm9kZS5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG5ub2RlLnN0eWxlLnRyYW5zZm9ybSA9IHRyYW5zZm9ybTtcbn0sXG50cmFuc2xhdGUzZDogZnVuY3Rpb24gKHgsIHksIHosIG5vZGUpIHtcbm5vZGUgPSBub2RlIHx8IHRoaXM7XG50aGlzLnRyYW5zZm9ybSgndHJhbnNsYXRlM2QoJyArIHggKyAnLCcgKyB5ICsgJywnICsgeiArICcpJywgbm9kZSk7XG59LFxuaW1wb3J0SHJlZjogZnVuY3Rpb24gKGhyZWYsIG9ubG9hZCwgb25lcnJvcikge1xudmFyIGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG5sLnJlbCA9ICdpbXBvcnQnO1xubC5ocmVmID0gaHJlZjtcbmlmIChvbmxvYWQpIHtcbmwub25sb2FkID0gb25sb2FkLmJpbmQodGhpcyk7XG59XG5pZiAob25lcnJvcikge1xubC5vbmVycm9yID0gb25lcnJvci5iaW5kKHRoaXMpO1xufVxuZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsKTtcbnJldHVybiBsO1xufSxcbmNyZWF0ZTogZnVuY3Rpb24gKHRhZywgcHJvcHMpIHtcbnZhciBlbHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG5pZiAocHJvcHMpIHtcbmZvciAodmFyIG4gaW4gcHJvcHMpIHtcbmVsdFtuXSA9IHByb3BzW25dO1xufVxufVxucmV0dXJuIGVsdDtcbn1cbn0pO1xuUG9seW1lci5CaW5kID0ge1xucHJlcGFyZU1vZGVsOiBmdW5jdGlvbiAobW9kZWwpIHtcbm1vZGVsLl9wcm9wZXJ0eUVmZmVjdHMgPSB7fTtcbm1vZGVsLl9iaW5kTGlzdGVuZXJzID0gW107XG5Qb2x5bWVyLkJhc2UubWl4aW4obW9kZWwsIHRoaXMuX21vZGVsQXBpKTtcbn0sXG5fbW9kZWxBcGk6IHtcbl9ub3RpZnlDaGFuZ2U6IGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xudmFyIGV2ZW50TmFtZSA9IFBvbHltZXIuQ2FzZU1hcC5jYW1lbFRvRGFzaENhc2UocHJvcGVydHkpICsgJy1jaGFuZ2VkJztcblBvbHltZXIuQmFzZS5maXJlKGV2ZW50TmFtZSwgeyB2YWx1ZTogdGhpc1twcm9wZXJ0eV0gfSwge1xuYnViYmxlczogZmFsc2UsXG5ub2RlOiB0aGlzXG59KTtcbn0sXG5fcHJvcGVydHlTZXR0ZXI6IGZ1bmN0aW9uIChwcm9wZXJ0eSwgdmFsdWUsIGVmZmVjdHMsIGZyb21BYm92ZSkge1xudmFyIG9sZCA9IHRoaXMuX19kYXRhX19bcHJvcGVydHldO1xuaWYgKG9sZCAhPT0gdmFsdWUgJiYgKG9sZCA9PT0gb2xkIHx8IHZhbHVlID09PSB2YWx1ZSkpIHtcbnRoaXMuX19kYXRhX19bcHJvcGVydHldID0gdmFsdWU7XG5pZiAodHlwZW9mIHZhbHVlID09ICdvYmplY3QnKSB7XG50aGlzLl9jbGVhclBhdGgocHJvcGVydHkpO1xufVxuaWYgKHRoaXMuX3Byb3BlcnR5Q2hhbmdlZCkge1xudGhpcy5fcHJvcGVydHlDaGFuZ2VkKHByb3BlcnR5LCB2YWx1ZSwgb2xkKTtcbn1cbmlmIChlZmZlY3RzKSB7XG50aGlzLl9lZmZlY3RFZmZlY3RzKHByb3BlcnR5LCB2YWx1ZSwgZWZmZWN0cywgb2xkLCBmcm9tQWJvdmUpO1xufVxufVxucmV0dXJuIG9sZDtcbn0sXG5fX3NldFByb3BlcnR5OiBmdW5jdGlvbiAocHJvcGVydHksIHZhbHVlLCBxdWlldCwgbm9kZSkge1xubm9kZSA9IG5vZGUgfHwgdGhpcztcbnZhciBlZmZlY3RzID0gbm9kZS5fcHJvcGVydHlFZmZlY3RzICYmIG5vZGUuX3Byb3BlcnR5RWZmZWN0c1twcm9wZXJ0eV07XG5pZiAoZWZmZWN0cykge1xubm9kZS5fcHJvcGVydHlTZXR0ZXIocHJvcGVydHksIHZhbHVlLCBlZmZlY3RzLCBxdWlldCk7XG59IGVsc2Uge1xubm9kZVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbn1cbn0sXG5fZWZmZWN0RWZmZWN0czogZnVuY3Rpb24gKHByb3BlcnR5LCB2YWx1ZSwgZWZmZWN0cywgb2xkLCBmcm9tQWJvdmUpIHtcbmVmZmVjdHMuZm9yRWFjaChmdW5jdGlvbiAoZngpIHtcbnZhciBmbiA9IFBvbHltZXIuQmluZFsnXycgKyBmeC5raW5kICsgJ0VmZmVjdCddO1xuaWYgKGZuKSB7XG5mbi5jYWxsKHRoaXMsIHByb3BlcnR5LCB2YWx1ZSwgZnguZWZmZWN0LCBvbGQsIGZyb21BYm92ZSk7XG59XG59LCB0aGlzKTtcbn0sXG5fY2xlYXJQYXRoOiBmdW5jdGlvbiAocGF0aCkge1xuZm9yICh2YXIgcHJvcCBpbiB0aGlzLl9fZGF0YV9fKSB7XG5pZiAocHJvcC5pbmRleE9mKHBhdGggKyAnLicpID09PSAwKSB7XG50aGlzLl9fZGF0YV9fW3Byb3BdID0gdW5kZWZpbmVkO1xufVxufVxufVxufSxcbmVuc3VyZVByb3BlcnR5RWZmZWN0czogZnVuY3Rpb24gKG1vZGVsLCBwcm9wZXJ0eSkge1xudmFyIGZ4ID0gbW9kZWwuX3Byb3BlcnR5RWZmZWN0c1twcm9wZXJ0eV07XG5pZiAoIWZ4KSB7XG5meCA9IG1vZGVsLl9wcm9wZXJ0eUVmZmVjdHNbcHJvcGVydHldID0gW107XG59XG5yZXR1cm4gZng7XG59LFxuYWRkUHJvcGVydHlFZmZlY3Q6IGZ1bmN0aW9uIChtb2RlbCwgcHJvcGVydHksIGtpbmQsIGVmZmVjdCkge1xudmFyIGZ4ID0gdGhpcy5lbnN1cmVQcm9wZXJ0eUVmZmVjdHMobW9kZWwsIHByb3BlcnR5KTtcbmZ4LnB1c2goe1xua2luZDoga2luZCxcbmVmZmVjdDogZWZmZWN0XG59KTtcbn0sXG5jcmVhdGVCaW5kaW5nczogZnVuY3Rpb24gKG1vZGVsKSB7XG52YXIgZngkID0gbW9kZWwuX3Byb3BlcnR5RWZmZWN0cztcbmlmIChmeCQpIHtcbmZvciAodmFyIG4gaW4gZngkKSB7XG52YXIgZnggPSBmeCRbbl07XG5meC5zb3J0KHRoaXMuX3NvcnRQcm9wZXJ0eUVmZmVjdHMpO1xudGhpcy5fY3JlYXRlQWNjZXNzb3JzKG1vZGVsLCBuLCBmeCk7XG59XG59XG59LFxuX3NvcnRQcm9wZXJ0eUVmZmVjdHM6IGZ1bmN0aW9uICgpIHtcbnZhciBFRkZFQ1RfT1JERVIgPSB7XG4nY29tcHV0ZSc6IDAsXG4nYW5ub3RhdGlvbic6IDEsXG4nY29tcHV0ZWRBbm5vdGF0aW9uJzogMixcbidyZWZsZWN0JzogMyxcbidub3RpZnknOiA0LFxuJ29ic2VydmVyJzogNSxcbidjb21wbGV4T2JzZXJ2ZXInOiA2LFxuJ2Z1bmN0aW9uJzogN1xufTtcbnJldHVybiBmdW5jdGlvbiAoYSwgYikge1xucmV0dXJuIEVGRkVDVF9PUkRFUlthLmtpbmRdIC0gRUZGRUNUX09SREVSW2Iua2luZF07XG59O1xufSgpLFxuX2NyZWF0ZUFjY2Vzc29yczogZnVuY3Rpb24gKG1vZGVsLCBwcm9wZXJ0eSwgZWZmZWN0cykge1xudmFyIGRlZnVuID0ge1xuZ2V0OiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gdGhpcy5fX2RhdGFfX1twcm9wZXJ0eV07XG59XG59O1xudmFyIHNldHRlciA9IGZ1bmN0aW9uICh2YWx1ZSkge1xudGhpcy5fcHJvcGVydHlTZXR0ZXIocHJvcGVydHksIHZhbHVlLCBlZmZlY3RzKTtcbn07XG52YXIgaW5mbyA9IG1vZGVsLmdldFByb3BlcnR5SW5mbyAmJiBtb2RlbC5nZXRQcm9wZXJ0eUluZm8ocHJvcGVydHkpO1xuaWYgKGluZm8gJiYgaW5mby5yZWFkT25seSkge1xuaWYgKCFpbmZvLmNvbXB1dGVkKSB7XG5tb2RlbFsnX3NldCcgKyB0aGlzLnVwcGVyKHByb3BlcnR5KV0gPSBzZXR0ZXI7XG59XG59IGVsc2Uge1xuZGVmdW4uc2V0ID0gc2V0dGVyO1xufVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZGVsLCBwcm9wZXJ0eSwgZGVmdW4pO1xufSxcbnVwcGVyOiBmdW5jdGlvbiAobmFtZSkge1xucmV0dXJuIG5hbWVbMF0udG9VcHBlckNhc2UoKSArIG5hbWUuc3Vic3RyaW5nKDEpO1xufSxcbl9hZGRBbm5vdGF0ZWRMaXN0ZW5lcjogZnVuY3Rpb24gKG1vZGVsLCBpbmRleCwgcHJvcGVydHksIHBhdGgsIGV2ZW50KSB7XG52YXIgZm4gPSB0aGlzLl9ub3RlZExpc3RlbmVyRmFjdG9yeShwcm9wZXJ0eSwgcGF0aCwgdGhpcy5faXNTdHJ1Y3R1cmVkKHBhdGgpLCB0aGlzLl9pc0V2ZW50Qm9ndXMpO1xudmFyIGV2ZW50TmFtZSA9IGV2ZW50IHx8IFBvbHltZXIuQ2FzZU1hcC5jYW1lbFRvRGFzaENhc2UocHJvcGVydHkpICsgJy1jaGFuZ2VkJztcbm1vZGVsLl9iaW5kTGlzdGVuZXJzLnB1c2goe1xuaW5kZXg6IGluZGV4LFxucHJvcGVydHk6IHByb3BlcnR5LFxucGF0aDogcGF0aCxcbmNoYW5nZWRGbjogZm4sXG5ldmVudDogZXZlbnROYW1lXG59KTtcbn0sXG5faXNTdHJ1Y3R1cmVkOiBmdW5jdGlvbiAocGF0aCkge1xucmV0dXJuIHBhdGguaW5kZXhPZignLicpID4gMDtcbn0sXG5faXNFdmVudEJvZ3VzOiBmdW5jdGlvbiAoZSwgdGFyZ2V0KSB7XG5yZXR1cm4gZS5wYXRoICYmIGUucGF0aFswXSAhPT0gdGFyZ2V0O1xufSxcbl9ub3RlZExpc3RlbmVyRmFjdG9yeTogZnVuY3Rpb24gKHByb3BlcnR5LCBwYXRoLCBpc1N0cnVjdHVyZWQsIGJvZ3VzVGVzdCkge1xucmV0dXJuIGZ1bmN0aW9uIChlLCB0YXJnZXQpIHtcbmlmICghYm9ndXNUZXN0KGUsIHRhcmdldCkpIHtcbmlmIChlLmRldGFpbCAmJiBlLmRldGFpbC5wYXRoKSB7XG50aGlzLm5vdGlmeVBhdGgodGhpcy5fZml4UGF0aChwYXRoLCBwcm9wZXJ0eSwgZS5kZXRhaWwucGF0aCksIGUuZGV0YWlsLnZhbHVlKTtcbn0gZWxzZSB7XG52YXIgdmFsdWUgPSB0YXJnZXRbcHJvcGVydHldO1xuaWYgKCFpc1N0cnVjdHVyZWQpIHtcbnRoaXNbcGF0aF0gPSB0YXJnZXRbcHJvcGVydHldO1xufSBlbHNlIHtcbmlmICh0aGlzLl9fZGF0YV9fW3BhdGhdICE9IHZhbHVlKSB7XG50aGlzLnNldChwYXRoLCB2YWx1ZSk7XG59XG59XG59XG59XG59O1xufSxcbnByZXBhcmVJbnN0YW5jZTogZnVuY3Rpb24gKGluc3QpIHtcbmluc3QuX19kYXRhX18gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xufSxcbnNldHVwQmluZExpc3RlbmVyczogZnVuY3Rpb24gKGluc3QpIHtcbmluc3QuX2JpbmRMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAoaW5mbykge1xudmFyIG5vZGUgPSBpbnN0Ll9ub2Rlc1tpbmZvLmluZGV4XTtcbm5vZGUuYWRkRXZlbnRMaXN0ZW5lcihpbmZvLmV2ZW50LCBpbnN0Ll9ub3RpZnlMaXN0ZW5lci5iaW5kKGluc3QsIGluZm8uY2hhbmdlZEZuKSk7XG59KTtcbn1cbn07XG5Qb2x5bWVyLkJhc2UuZXh0ZW5kKFBvbHltZXIuQmluZCwge1xuX3Nob3VsZEFkZExpc3RlbmVyOiBmdW5jdGlvbiAoZWZmZWN0KSB7XG5yZXR1cm4gZWZmZWN0Lm5hbWUgJiYgZWZmZWN0Lm1vZGUgPT09ICd7JyAmJiAhZWZmZWN0Lm5lZ2F0ZSAmJiBlZmZlY3Qua2luZCAhPSAnYXR0cmlidXRlJztcbn0sXG5fYW5ub3RhdGlvbkVmZmVjdDogZnVuY3Rpb24gKHNvdXJjZSwgdmFsdWUsIGVmZmVjdCkge1xuaWYgKHNvdXJjZSAhPSBlZmZlY3QudmFsdWUpIHtcbnZhbHVlID0gdGhpcy5nZXQoZWZmZWN0LnZhbHVlKTtcbnRoaXMuX19kYXRhX19bZWZmZWN0LnZhbHVlXSA9IHZhbHVlO1xufVxudmFyIGNhbGMgPSBlZmZlY3QubmVnYXRlID8gIXZhbHVlIDogdmFsdWU7XG5pZiAoIWVmZmVjdC5jdXN0b21FdmVudCB8fCB0aGlzLl9ub2Rlc1tlZmZlY3QuaW5kZXhdW2VmZmVjdC5uYW1lXSAhPT0gY2FsYykge1xucmV0dXJuIHRoaXMuX2FwcGx5RWZmZWN0VmFsdWUoY2FsYywgZWZmZWN0KTtcbn1cbn0sXG5fcmVmbGVjdEVmZmVjdDogZnVuY3Rpb24gKHNvdXJjZSkge1xudGhpcy5yZWZsZWN0UHJvcGVydHlUb0F0dHJpYnV0ZShzb3VyY2UpO1xufSxcbl9ub3RpZnlFZmZlY3Q6IGZ1bmN0aW9uIChzb3VyY2UsIHZhbHVlLCBlZmZlY3QsIG9sZCwgZnJvbUFib3ZlKSB7XG5pZiAoIWZyb21BYm92ZSkge1xudGhpcy5fbm90aWZ5Q2hhbmdlKHNvdXJjZSk7XG59XG59LFxuX2Z1bmN0aW9uRWZmZWN0OiBmdW5jdGlvbiAoc291cmNlLCB2YWx1ZSwgZm4sIG9sZCwgZnJvbUFib3ZlKSB7XG5mbi5jYWxsKHRoaXMsIHNvdXJjZSwgdmFsdWUsIG9sZCwgZnJvbUFib3ZlKTtcbn0sXG5fb2JzZXJ2ZXJFZmZlY3Q6IGZ1bmN0aW9uIChzb3VyY2UsIHZhbHVlLCBlZmZlY3QsIG9sZCkge1xudmFyIGZuID0gdGhpc1tlZmZlY3QubWV0aG9kXTtcbmlmIChmbikge1xuZm4uY2FsbCh0aGlzLCB2YWx1ZSwgb2xkKTtcbn0gZWxzZSB7XG50aGlzLl93YXJuKHRoaXMuX2xvZ2YoJ19vYnNlcnZlckVmZmVjdCcsICdvYnNlcnZlciBtZXRob2QgYCcgKyBlZmZlY3QubWV0aG9kICsgJ2Agbm90IGRlZmluZWQnKSk7XG59XG59LFxuX2NvbXBsZXhPYnNlcnZlckVmZmVjdDogZnVuY3Rpb24gKHNvdXJjZSwgdmFsdWUsIGVmZmVjdCkge1xudmFyIGZuID0gdGhpc1tlZmZlY3QubWV0aG9kXTtcbmlmIChmbikge1xudmFyIGFyZ3MgPSBQb2x5bWVyLkJpbmQuX21hcnNoYWxBcmdzKHRoaXMuX19kYXRhX18sIGVmZmVjdCwgc291cmNlLCB2YWx1ZSk7XG5pZiAoYXJncykge1xuZm4uYXBwbHkodGhpcywgYXJncyk7XG59XG59IGVsc2Uge1xudGhpcy5fd2Fybih0aGlzLl9sb2dmKCdfY29tcGxleE9ic2VydmVyRWZmZWN0JywgJ29ic2VydmVyIG1ldGhvZCBgJyArIGVmZmVjdC5tZXRob2QgKyAnYCBub3QgZGVmaW5lZCcpKTtcbn1cbn0sXG5fY29tcHV0ZUVmZmVjdDogZnVuY3Rpb24gKHNvdXJjZSwgdmFsdWUsIGVmZmVjdCkge1xudmFyIGFyZ3MgPSBQb2x5bWVyLkJpbmQuX21hcnNoYWxBcmdzKHRoaXMuX19kYXRhX18sIGVmZmVjdCwgc291cmNlLCB2YWx1ZSk7XG5pZiAoYXJncykge1xudmFyIGZuID0gdGhpc1tlZmZlY3QubWV0aG9kXTtcbmlmIChmbikge1xudGhpcy5fX3NldFByb3BlcnR5KGVmZmVjdC5wcm9wZXJ0eSwgZm4uYXBwbHkodGhpcywgYXJncykpO1xufSBlbHNlIHtcbnRoaXMuX3dhcm4odGhpcy5fbG9nZignX2NvbXB1dGVFZmZlY3QnLCAnY29tcHV0ZSBtZXRob2QgYCcgKyBlZmZlY3QubWV0aG9kICsgJ2Agbm90IGRlZmluZWQnKSk7XG59XG59XG59LFxuX2Fubm90YXRlZENvbXB1dGF0aW9uRWZmZWN0OiBmdW5jdGlvbiAoc291cmNlLCB2YWx1ZSwgZWZmZWN0KSB7XG52YXIgY29tcHV0ZWRIb3N0ID0gdGhpcy5fcm9vdERhdGFIb3N0IHx8IHRoaXM7XG52YXIgZm4gPSBjb21wdXRlZEhvc3RbZWZmZWN0Lm1ldGhvZF07XG5pZiAoZm4pIHtcbnZhciBhcmdzID0gUG9seW1lci5CaW5kLl9tYXJzaGFsQXJncyh0aGlzLl9fZGF0YV9fLCBlZmZlY3QsIHNvdXJjZSwgdmFsdWUpO1xuaWYgKGFyZ3MpIHtcbnZhciBjb21wdXRlZHZhbHVlID0gZm4uYXBwbHkoY29tcHV0ZWRIb3N0LCBhcmdzKTtcbmlmIChlZmZlY3QubmVnYXRlKSB7XG5jb21wdXRlZHZhbHVlID0gIWNvbXB1dGVkdmFsdWU7XG59XG50aGlzLl9hcHBseUVmZmVjdFZhbHVlKGNvbXB1dGVkdmFsdWUsIGVmZmVjdCk7XG59XG59IGVsc2Uge1xuY29tcHV0ZWRIb3N0Ll93YXJuKGNvbXB1dGVkSG9zdC5fbG9nZignX2Fubm90YXRlZENvbXB1dGF0aW9uRWZmZWN0JywgJ2NvbXB1dGUgbWV0aG9kIGAnICsgZWZmZWN0Lm1ldGhvZCArICdgIG5vdCBkZWZpbmVkJykpO1xufVxufSxcbl9tYXJzaGFsQXJnczogZnVuY3Rpb24gKG1vZGVsLCBlZmZlY3QsIHBhdGgsIHZhbHVlKSB7XG52YXIgdmFsdWVzID0gW107XG52YXIgYXJncyA9IGVmZmVjdC5hcmdzO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBhcmdzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xudmFyIGFyZyA9IGFyZ3NbaV07XG52YXIgbmFtZSA9IGFyZy5uYW1lO1xudmFyIHY7XG5pZiAoYXJnLmxpdGVyYWwpIHtcbnYgPSBhcmcudmFsdWU7XG59IGVsc2UgaWYgKGFyZy5zdHJ1Y3R1cmVkKSB7XG52ID0gUG9seW1lci5CYXNlLmdldChuYW1lLCBtb2RlbCk7XG59IGVsc2Uge1xudiA9IG1vZGVsW25hbWVdO1xufVxuaWYgKGFyZ3MubGVuZ3RoID4gMSAmJiB2ID09PSB1bmRlZmluZWQpIHtcbnJldHVybjtcbn1cbmlmIChhcmcud2lsZGNhcmQpIHtcbnZhciBiYXNlQ2hhbmdlZCA9IG5hbWUuaW5kZXhPZihwYXRoICsgJy4nKSA9PT0gMDtcbnZhciBtYXRjaGVzID0gZWZmZWN0LnRyaWdnZXIubmFtZS5pbmRleE9mKG5hbWUpID09PSAwICYmICFiYXNlQ2hhbmdlZDtcbnZhbHVlc1tpXSA9IHtcbnBhdGg6IG1hdGNoZXMgPyBwYXRoIDogbmFtZSxcbnZhbHVlOiBtYXRjaGVzID8gdmFsdWUgOiB2LFxuYmFzZTogdlxufTtcbn0gZWxzZSB7XG52YWx1ZXNbaV0gPSB2O1xufVxufVxucmV0dXJuIHZhbHVlcztcbn1cbn0pO1xuUG9seW1lci5CYXNlLl9hZGRGZWF0dXJlKHtcbl9hZGRQcm9wZXJ0eUVmZmVjdDogZnVuY3Rpb24gKHByb3BlcnR5LCBraW5kLCBlZmZlY3QpIHtcblBvbHltZXIuQmluZC5hZGRQcm9wZXJ0eUVmZmVjdCh0aGlzLCBwcm9wZXJ0eSwga2luZCwgZWZmZWN0KTtcbn0sXG5fcHJlcEVmZmVjdHM6IGZ1bmN0aW9uICgpIHtcblBvbHltZXIuQmluZC5wcmVwYXJlTW9kZWwodGhpcyk7XG50aGlzLl9hZGRBbm5vdGF0aW9uRWZmZWN0cyh0aGlzLl9ub3Rlcyk7XG59LFxuX3ByZXBCaW5kaW5nczogZnVuY3Rpb24gKCkge1xuUG9seW1lci5CaW5kLmNyZWF0ZUJpbmRpbmdzKHRoaXMpO1xufSxcbl9hZGRQcm9wZXJ0eUVmZmVjdHM6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG5pZiAocHJvcGVydGllcykge1xuZm9yICh2YXIgcCBpbiBwcm9wZXJ0aWVzKSB7XG52YXIgcHJvcCA9IHByb3BlcnRpZXNbcF07XG5pZiAocHJvcC5vYnNlcnZlcikge1xudGhpcy5fYWRkT2JzZXJ2ZXJFZmZlY3QocCwgcHJvcC5vYnNlcnZlcik7XG59XG5pZiAocHJvcC5jb21wdXRlZCkge1xucHJvcC5yZWFkT25seSA9IHRydWU7XG50aGlzLl9hZGRDb21wdXRlZEVmZmVjdChwLCBwcm9wLmNvbXB1dGVkKTtcbn1cbmlmIChwcm9wLm5vdGlmeSkge1xudGhpcy5fYWRkUHJvcGVydHlFZmZlY3QocCwgJ25vdGlmeScpO1xufVxuaWYgKHByb3AucmVmbGVjdFRvQXR0cmlidXRlKSB7XG50aGlzLl9hZGRQcm9wZXJ0eUVmZmVjdChwLCAncmVmbGVjdCcpO1xufVxuaWYgKHByb3AucmVhZE9ubHkpIHtcblBvbHltZXIuQmluZC5lbnN1cmVQcm9wZXJ0eUVmZmVjdHModGhpcywgcCk7XG59XG59XG59XG59LFxuX2FkZENvbXB1dGVkRWZmZWN0OiBmdW5jdGlvbiAobmFtZSwgZXhwcmVzc2lvbikge1xudmFyIHNpZyA9IHRoaXMuX3BhcnNlTWV0aG9kKGV4cHJlc3Npb24pO1xuc2lnLmFyZ3MuZm9yRWFjaChmdW5jdGlvbiAoYXJnKSB7XG50aGlzLl9hZGRQcm9wZXJ0eUVmZmVjdChhcmcubW9kZWwsICdjb21wdXRlJywge1xubWV0aG9kOiBzaWcubWV0aG9kLFxuYXJnczogc2lnLmFyZ3MsXG50cmlnZ2VyOiBhcmcsXG5wcm9wZXJ0eTogbmFtZVxufSk7XG59LCB0aGlzKTtcbn0sXG5fYWRkT2JzZXJ2ZXJFZmZlY3Q6IGZ1bmN0aW9uIChwcm9wZXJ0eSwgb2JzZXJ2ZXIpIHtcbnRoaXMuX2FkZFByb3BlcnR5RWZmZWN0KHByb3BlcnR5LCAnb2JzZXJ2ZXInLCB7XG5tZXRob2Q6IG9ic2VydmVyLFxucHJvcGVydHk6IHByb3BlcnR5XG59KTtcbn0sXG5fYWRkQ29tcGxleE9ic2VydmVyRWZmZWN0czogZnVuY3Rpb24gKG9ic2VydmVycykge1xuaWYgKG9ic2VydmVycykge1xub2JzZXJ2ZXJzLmZvckVhY2goZnVuY3Rpb24gKG9ic2VydmVyKSB7XG50aGlzLl9hZGRDb21wbGV4T2JzZXJ2ZXJFZmZlY3Qob2JzZXJ2ZXIpO1xufSwgdGhpcyk7XG59XG59LFxuX2FkZENvbXBsZXhPYnNlcnZlckVmZmVjdDogZnVuY3Rpb24gKG9ic2VydmVyKSB7XG52YXIgc2lnID0gdGhpcy5fcGFyc2VNZXRob2Qob2JzZXJ2ZXIpO1xuc2lnLmFyZ3MuZm9yRWFjaChmdW5jdGlvbiAoYXJnKSB7XG50aGlzLl9hZGRQcm9wZXJ0eUVmZmVjdChhcmcubW9kZWwsICdjb21wbGV4T2JzZXJ2ZXInLCB7XG5tZXRob2Q6IHNpZy5tZXRob2QsXG5hcmdzOiBzaWcuYXJncyxcbnRyaWdnZXI6IGFyZ1xufSk7XG59LCB0aGlzKTtcbn0sXG5fYWRkQW5ub3RhdGlvbkVmZmVjdHM6IGZ1bmN0aW9uIChub3Rlcykge1xudGhpcy5fbm9kZXMgPSBbXTtcbm5vdGVzLmZvckVhY2goZnVuY3Rpb24gKG5vdGUpIHtcbnZhciBpbmRleCA9IHRoaXMuX25vZGVzLnB1c2gobm90ZSkgLSAxO1xubm90ZS5iaW5kaW5ncy5mb3JFYWNoKGZ1bmN0aW9uIChiaW5kaW5nKSB7XG50aGlzLl9hZGRBbm5vdGF0aW9uRWZmZWN0KGJpbmRpbmcsIGluZGV4KTtcbn0sIHRoaXMpO1xufSwgdGhpcyk7XG59LFxuX2FkZEFubm90YXRpb25FZmZlY3Q6IGZ1bmN0aW9uIChub3RlLCBpbmRleCkge1xuaWYgKFBvbHltZXIuQmluZC5fc2hvdWxkQWRkTGlzdGVuZXIobm90ZSkpIHtcblBvbHltZXIuQmluZC5fYWRkQW5ub3RhdGVkTGlzdGVuZXIodGhpcywgaW5kZXgsIG5vdGUubmFtZSwgbm90ZS52YWx1ZSwgbm90ZS5ldmVudCk7XG59XG5pZiAobm90ZS5zaWduYXR1cmUpIHtcbnRoaXMuX2FkZEFubm90YXRlZENvbXB1dGF0aW9uRWZmZWN0KG5vdGUsIGluZGV4KTtcbn0gZWxzZSB7XG5ub3RlLmluZGV4ID0gaW5kZXg7XG50aGlzLl9hZGRQcm9wZXJ0eUVmZmVjdChub3RlLm1vZGVsLCAnYW5ub3RhdGlvbicsIG5vdGUpO1xufVxufSxcbl9hZGRBbm5vdGF0ZWRDb21wdXRhdGlvbkVmZmVjdDogZnVuY3Rpb24gKG5vdGUsIGluZGV4KSB7XG52YXIgc2lnID0gbm90ZS5zaWduYXR1cmU7XG5pZiAoc2lnLnN0YXRpYykge1xudGhpcy5fX2FkZEFubm90YXRlZENvbXB1dGF0aW9uRWZmZWN0KCdfX3N0YXRpY19fJywgaW5kZXgsIG5vdGUsIHNpZywgbnVsbCk7XG59IGVsc2Uge1xuc2lnLmFyZ3MuZm9yRWFjaChmdW5jdGlvbiAoYXJnKSB7XG5pZiAoIWFyZy5saXRlcmFsKSB7XG50aGlzLl9fYWRkQW5ub3RhdGVkQ29tcHV0YXRpb25FZmZlY3QoYXJnLm1vZGVsLCBpbmRleCwgbm90ZSwgc2lnLCBhcmcpO1xufVxufSwgdGhpcyk7XG59XG59LFxuX19hZGRBbm5vdGF0ZWRDb21wdXRhdGlvbkVmZmVjdDogZnVuY3Rpb24gKHByb3BlcnR5LCBpbmRleCwgbm90ZSwgc2lnLCB0cmlnZ2VyKSB7XG50aGlzLl9hZGRQcm9wZXJ0eUVmZmVjdChwcm9wZXJ0eSwgJ2Fubm90YXRlZENvbXB1dGF0aW9uJywge1xuaW5kZXg6IGluZGV4LFxua2luZDogbm90ZS5raW5kLFxucHJvcGVydHk6IG5vdGUubmFtZSxcbm5lZ2F0ZTogbm90ZS5uZWdhdGUsXG5tZXRob2Q6IHNpZy5tZXRob2QsXG5hcmdzOiBzaWcuYXJncyxcbnRyaWdnZXI6IHRyaWdnZXJcbn0pO1xufSxcbl9wYXJzZU1ldGhvZDogZnVuY3Rpb24gKGV4cHJlc3Npb24pIHtcbnZhciBtID0gZXhwcmVzc2lvbi5tYXRjaCgvKFxcdyopXFwoKC4qKVxcKS8pO1xuaWYgKG0pIHtcbnZhciBzaWcgPSB7XG5tZXRob2Q6IG1bMV0sXG5zdGF0aWM6IHRydWVcbn07XG5pZiAobVsyXS50cmltKCkpIHtcbnZhciBhcmdzID0gbVsyXS5yZXBsYWNlKC9cXFxcLC9nLCAnJmNvbW1hOycpLnNwbGl0KCcsJyk7XG5yZXR1cm4gdGhpcy5fcGFyc2VBcmdzKGFyZ3MsIHNpZyk7XG59IGVsc2Uge1xuc2lnLmFyZ3MgPSBQb2x5bWVyLm5hcjtcbnJldHVybiBzaWc7XG59XG59XG59LFxuX3BhcnNlQXJnczogZnVuY3Rpb24gKGFyZ0xpc3QsIHNpZykge1xuc2lnLmFyZ3MgPSBhcmdMaXN0Lm1hcChmdW5jdGlvbiAocmF3QXJnKSB7XG52YXIgYXJnID0gdGhpcy5fcGFyc2VBcmcocmF3QXJnKTtcbmlmICghYXJnLmxpdGVyYWwpIHtcbnNpZy5zdGF0aWMgPSBmYWxzZTtcbn1cbnJldHVybiBhcmc7XG59LCB0aGlzKTtcbnJldHVybiBzaWc7XG59LFxuX3BhcnNlQXJnOiBmdW5jdGlvbiAocmF3QXJnKSB7XG52YXIgYXJnID0gcmF3QXJnLnRyaW0oKS5yZXBsYWNlKC8mY29tbWE7L2csICcsJykucmVwbGFjZSgvXFxcXCguKS9nLCAnJDEnKTtcbnZhciBhID0ge1xubmFtZTogYXJnLFxubW9kZWw6IHRoaXMuX21vZGVsRm9yUGF0aChhcmcpXG59O1xudmFyIGZjID0gYXJnWzBdO1xuaWYgKGZjID49ICcwJyAmJiBmYyA8PSAnOScpIHtcbmZjID0gJyMnO1xufVxuc3dpdGNoIChmYykge1xuY2FzZSAnXFwnJzpcbmNhc2UgJ1wiJzpcbmEudmFsdWUgPSBhcmcuc2xpY2UoMSwgLTEpO1xuYS5saXRlcmFsID0gdHJ1ZTtcbmJyZWFrO1xuY2FzZSAnIyc6XG5hLnZhbHVlID0gTnVtYmVyKGFyZyk7XG5hLmxpdGVyYWwgPSB0cnVlO1xuYnJlYWs7XG59XG5pZiAoIWEubGl0ZXJhbCkge1xuYS5zdHJ1Y3R1cmVkID0gYXJnLmluZGV4T2YoJy4nKSA+IDA7XG5pZiAoYS5zdHJ1Y3R1cmVkKSB7XG5hLndpbGRjYXJkID0gYXJnLnNsaWNlKC0yKSA9PSAnLionO1xuaWYgKGEud2lsZGNhcmQpIHtcbmEubmFtZSA9IGFyZy5zbGljZSgwLCAtMik7XG59XG59XG59XG5yZXR1cm4gYTtcbn0sXG5fbWFyc2hhbEluc3RhbmNlRWZmZWN0czogZnVuY3Rpb24gKCkge1xuUG9seW1lci5CaW5kLnByZXBhcmVJbnN0YW5jZSh0aGlzKTtcblBvbHltZXIuQmluZC5zZXR1cEJpbmRMaXN0ZW5lcnModGhpcyk7XG59LFxuX2FwcGx5RWZmZWN0VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgaW5mbykge1xudmFyIG5vZGUgPSB0aGlzLl9ub2Rlc1tpbmZvLmluZGV4XTtcbnZhciBwcm9wZXJ0eSA9IGluZm8ucHJvcGVydHkgfHwgaW5mby5uYW1lIHx8ICd0ZXh0Q29udGVudCc7XG5pZiAoaW5mby5raW5kID09ICdhdHRyaWJ1dGUnKSB7XG50aGlzLnNlcmlhbGl6ZVZhbHVlVG9BdHRyaWJ1dGUodmFsdWUsIHByb3BlcnR5LCBub2RlKTtcbn0gZWxzZSB7XG5pZiAocHJvcGVydHkgPT09ICdjbGFzc05hbWUnKSB7XG52YWx1ZSA9IHRoaXMuX3Njb3BlRWxlbWVudENsYXNzKG5vZGUsIHZhbHVlKTtcbn1cbmlmIChwcm9wZXJ0eSA9PT0gJ3RleHRDb250ZW50JyB8fCBub2RlLmxvY2FsTmFtZSA9PSAnaW5wdXQnICYmIHByb3BlcnR5ID09ICd2YWx1ZScpIHtcbnZhbHVlID0gdmFsdWUgPT0gdW5kZWZpbmVkID8gJycgOiB2YWx1ZTtcbn1cbnJldHVybiBub2RlW3Byb3BlcnR5XSA9IHZhbHVlO1xufVxufSxcbl9leGVjdXRlU3RhdGljRWZmZWN0czogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuX3Byb3BlcnR5RWZmZWN0cy5fX3N0YXRpY19fKSB7XG50aGlzLl9lZmZlY3RFZmZlY3RzKCdfX3N0YXRpY19fJywgbnVsbCwgdGhpcy5fcHJvcGVydHlFZmZlY3RzLl9fc3RhdGljX18pO1xufVxufVxufSk7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX3NldHVwQ29uZmlndXJlOiBmdW5jdGlvbiAoaW5pdGlhbENvbmZpZykge1xudGhpcy5fY29uZmlnID0gaW5pdGlhbENvbmZpZyB8fCB7fTtcbnRoaXMuX2hhbmRsZXJzID0gW107XG59LFxuX21hcnNoYWxBdHRyaWJ1dGVzOiBmdW5jdGlvbiAoKSB7XG50aGlzLl90YWtlQXR0cmlidXRlc1RvTW9kZWwodGhpcy5fY29uZmlnKTtcbn0sXG5fY29uZmlnVmFsdWU6IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xudGhpcy5fY29uZmlnW25hbWVdID0gdmFsdWU7XG59LFxuX2JlZm9yZUNsaWVudHNSZWFkeTogZnVuY3Rpb24gKCkge1xudGhpcy5fY29uZmlndXJlKCk7XG59LFxuX2NvbmZpZ3VyZTogZnVuY3Rpb24gKCkge1xudGhpcy5fY29uZmlndXJlQW5ub3RhdGlvblJlZmVyZW5jZXMoKTtcbnRoaXMuX2Fib3ZlQ29uZmlnID0gdGhpcy5taXhpbih7fSwgdGhpcy5fY29uZmlnKTtcbnZhciBjb25maWcgPSB7fTtcbnRoaXMuYmVoYXZpb3JzLmZvckVhY2goZnVuY3Rpb24gKGIpIHtcbnRoaXMuX2NvbmZpZ3VyZVByb3BlcnRpZXMoYi5wcm9wZXJ0aWVzLCBjb25maWcpO1xufSwgdGhpcyk7XG50aGlzLl9jb25maWd1cmVQcm9wZXJ0aWVzKHRoaXMucHJvcGVydGllcywgY29uZmlnKTtcbnRoaXMuX21peGluQ29uZmlndXJlKGNvbmZpZywgdGhpcy5fYWJvdmVDb25maWcpO1xudGhpcy5fY29uZmlnID0gY29uZmlnO1xudGhpcy5fZGlzdHJpYnV0ZUNvbmZpZyh0aGlzLl9jb25maWcpO1xufSxcbl9jb25maWd1cmVQcm9wZXJ0aWVzOiBmdW5jdGlvbiAocHJvcGVydGllcywgY29uZmlnKSB7XG5mb3IgKHZhciBpIGluIHByb3BlcnRpZXMpIHtcbnZhciBjID0gcHJvcGVydGllc1tpXTtcbmlmIChjLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcbnZhciB2YWx1ZSA9IGMudmFsdWU7XG5pZiAodHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbicpIHtcbnZhbHVlID0gdmFsdWUuY2FsbCh0aGlzLCB0aGlzLl9jb25maWcpO1xufVxuY29uZmlnW2ldID0gdmFsdWU7XG59XG59XG59LFxuX21peGluQ29uZmlndXJlOiBmdW5jdGlvbiAoYSwgYikge1xuZm9yICh2YXIgcHJvcCBpbiBiKSB7XG5pZiAoIXRoaXMuZ2V0UHJvcGVydHlJbmZvKHByb3ApLnJlYWRPbmx5KSB7XG5hW3Byb3BdID0gYltwcm9wXTtcbn1cbn1cbn0sXG5fZGlzdHJpYnV0ZUNvbmZpZzogZnVuY3Rpb24gKGNvbmZpZykge1xudmFyIGZ4JCA9IHRoaXMuX3Byb3BlcnR5RWZmZWN0cztcbmlmIChmeCQpIHtcbmZvciAodmFyIHAgaW4gY29uZmlnKSB7XG52YXIgZnggPSBmeCRbcF07XG5pZiAoZngpIHtcbmZvciAodmFyIGkgPSAwLCBsID0gZngubGVuZ3RoLCB4OyBpIDwgbCAmJiAoeCA9IGZ4W2ldKTsgaSsrKSB7XG5pZiAoeC5raW5kID09PSAnYW5ub3RhdGlvbicpIHtcbnZhciBub2RlID0gdGhpcy5fbm9kZXNbeC5lZmZlY3QuaW5kZXhdO1xuaWYgKG5vZGUuX2NvbmZpZ1ZhbHVlKSB7XG52YXIgdmFsdWUgPSBwID09PSB4LmVmZmVjdC52YWx1ZSA/IGNvbmZpZ1twXSA6IHRoaXMuZ2V0KHguZWZmZWN0LnZhbHVlLCBjb25maWcpO1xubm9kZS5fY29uZmlnVmFsdWUoeC5lZmZlY3QubmFtZSwgdmFsdWUpO1xufVxufVxufVxufVxufVxufVxufSxcbl9hZnRlckNsaWVudHNSZWFkeTogZnVuY3Rpb24gKCkge1xudGhpcy5fZXhlY3V0ZVN0YXRpY0VmZmVjdHMoKTtcbnRoaXMuX2FwcGx5Q29uZmlnKHRoaXMuX2NvbmZpZywgdGhpcy5fYWJvdmVDb25maWcpO1xudGhpcy5fZmx1c2hIYW5kbGVycygpO1xufSxcbl9hcHBseUNvbmZpZzogZnVuY3Rpb24gKGNvbmZpZywgYWJvdmVDb25maWcpIHtcbmZvciAodmFyIG4gaW4gY29uZmlnKSB7XG5pZiAodGhpc1tuXSA9PT0gdW5kZWZpbmVkKSB7XG50aGlzLl9fc2V0UHJvcGVydHkobiwgY29uZmlnW25dLCBuIGluIGFib3ZlQ29uZmlnKTtcbn1cbn1cbn0sXG5fbm90aWZ5TGlzdGVuZXI6IGZ1bmN0aW9uIChmbiwgZSkge1xuaWYgKCF0aGlzLl9jbGllbnRzUmVhZGllZCkge1xudGhpcy5fcXVldWVIYW5kbGVyKFtcbmZuLFxuZSxcbmUudGFyZ2V0XG5dKTtcbn0gZWxzZSB7XG5yZXR1cm4gZm4uY2FsbCh0aGlzLCBlLCBlLnRhcmdldCk7XG59XG59LFxuX3F1ZXVlSGFuZGxlcjogZnVuY3Rpb24gKGFyZ3MpIHtcbnRoaXMuX2hhbmRsZXJzLnB1c2goYXJncyk7XG59LFxuX2ZsdXNoSGFuZGxlcnM6IGZ1bmN0aW9uICgpIHtcbnZhciBoJCA9IHRoaXMuX2hhbmRsZXJzO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBoJC5sZW5ndGgsIGg7IGkgPCBsICYmIChoID0gaCRbaV0pOyBpKyspIHtcbmhbMF0uY2FsbCh0aGlzLCBoWzFdLCBoWzJdKTtcbn1cbn1cbn0pO1xuKGZ1bmN0aW9uICgpIHtcbid1c2Ugc3RyaWN0JztcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5ub3RpZnlQYXRoOiBmdW5jdGlvbiAocGF0aCwgdmFsdWUsIGZyb21BYm92ZSkge1xudmFyIG9sZCA9IHRoaXMuX3Byb3BlcnR5U2V0dGVyKHBhdGgsIHZhbHVlKTtcbmlmIChvbGQgIT09IHZhbHVlICYmIChvbGQgPT09IG9sZCB8fCB2YWx1ZSA9PT0gdmFsdWUpKSB7XG50aGlzLl9wYXRoRWZmZWN0b3IocGF0aCwgdmFsdWUpO1xuaWYgKCFmcm9tQWJvdmUpIHtcbnRoaXMuX25vdGlmeVBhdGgocGF0aCwgdmFsdWUpO1xufVxucmV0dXJuIHRydWU7XG59XG59LFxuX2dldFBhdGhQYXJ0czogZnVuY3Rpb24gKHBhdGgpIHtcbmlmIChBcnJheS5pc0FycmF5KHBhdGgpKSB7XG52YXIgcGFydHMgPSBbXTtcbmZvciAodmFyIGkgPSAwOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xudmFyIGFyZ3MgPSBwYXRoW2ldLnRvU3RyaW5nKCkuc3BsaXQoJy4nKTtcbmZvciAodmFyIGogPSAwOyBqIDwgYXJncy5sZW5ndGg7IGorKykge1xucGFydHMucHVzaChhcmdzW2pdKTtcbn1cbn1cbnJldHVybiBwYXJ0cztcbn0gZWxzZSB7XG5yZXR1cm4gcGF0aC50b1N0cmluZygpLnNwbGl0KCcuJyk7XG59XG59LFxuc2V0OiBmdW5jdGlvbiAocGF0aCwgdmFsdWUsIHJvb3QpIHtcbnZhciBwcm9wID0gcm9vdCB8fCB0aGlzO1xudmFyIHBhcnRzID0gdGhpcy5fZ2V0UGF0aFBhcnRzKHBhdGgpO1xudmFyIGFycmF5O1xudmFyIGxhc3QgPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXTtcbmlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG5mb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aCAtIDE7IGkrKykge1xucHJvcCA9IHByb3BbcGFydHNbaV1dO1xuaWYgKGFycmF5KSB7XG5wYXJ0c1tpXSA9IFBvbHltZXIuQ29sbGVjdGlvbi5nZXQoYXJyYXkpLmdldEtleShwcm9wKTtcbn1cbmlmICghcHJvcCkge1xucmV0dXJuO1xufVxuYXJyYXkgPSBBcnJheS5pc0FycmF5KHByb3ApID8gcHJvcCA6IG51bGw7XG59XG5pZiAoYXJyYXkpIHtcbnZhciBjb2xsID0gUG9seW1lci5Db2xsZWN0aW9uLmdldChhcnJheSk7XG52YXIgb2xkID0gcHJvcFtsYXN0XTtcbnZhciBrZXkgPSBjb2xsLmdldEtleShvbGQpO1xuaWYgKGtleSkge1xucGFydHNbaV0gPSBrZXk7XG5jb2xsLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XG59XG59XG5wcm9wW2xhc3RdID0gdmFsdWU7XG5pZiAoIXJvb3QpIHtcbnRoaXMubm90aWZ5UGF0aChwYXJ0cy5qb2luKCcuJyksIHZhbHVlKTtcbn1cbn0gZWxzZSB7XG5wcm9wW3BhdGhdID0gdmFsdWU7XG59XG59LFxuZ2V0OiBmdW5jdGlvbiAocGF0aCwgcm9vdCkge1xudmFyIHByb3AgPSByb290IHx8IHRoaXM7XG52YXIgcGFydHMgPSB0aGlzLl9nZXRQYXRoUGFydHMocGF0aCk7XG52YXIgbGFzdCA9IHBhcnRzLnBvcCgpO1xud2hpbGUgKHBhcnRzLmxlbmd0aCkge1xucHJvcCA9IHByb3BbcGFydHMuc2hpZnQoKV07XG5pZiAoIXByb3ApIHtcbnJldHVybjtcbn1cbn1cbnJldHVybiBwcm9wW2xhc3RdO1xufSxcbl9wYXRoRWZmZWN0b3I6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSkge1xudmFyIG1vZGVsID0gdGhpcy5fbW9kZWxGb3JQYXRoKHBhdGgpO1xudmFyIGZ4JCA9IHRoaXMuX3Byb3BlcnR5RWZmZWN0c1ttb2RlbF07XG5pZiAoZngkKSB7XG5meCQuZm9yRWFjaChmdW5jdGlvbiAoZngpIHtcbnZhciBmeEZuID0gdGhpc1snXycgKyBmeC5raW5kICsgJ1BhdGhFZmZlY3QnXTtcbmlmIChmeEZuKSB7XG5meEZuLmNhbGwodGhpcywgcGF0aCwgdmFsdWUsIGZ4LmVmZmVjdCk7XG59XG59LCB0aGlzKTtcbn1cbmlmICh0aGlzLl9ib3VuZFBhdGhzKSB7XG50aGlzLl9ub3RpZnlCb3VuZFBhdGhzKHBhdGgsIHZhbHVlKTtcbn1cbn0sXG5fYW5ub3RhdGlvblBhdGhFZmZlY3Q6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSwgZWZmZWN0KSB7XG5pZiAoZWZmZWN0LnZhbHVlID09PSBwYXRoIHx8IGVmZmVjdC52YWx1ZS5pbmRleE9mKHBhdGggKyAnLicpID09PSAwKSB7XG5Qb2x5bWVyLkJpbmQuX2Fubm90YXRpb25FZmZlY3QuY2FsbCh0aGlzLCBwYXRoLCB2YWx1ZSwgZWZmZWN0KTtcbn0gZWxzZSBpZiAocGF0aC5pbmRleE9mKGVmZmVjdC52YWx1ZSArICcuJykgPT09IDAgJiYgIWVmZmVjdC5uZWdhdGUpIHtcbnZhciBub2RlID0gdGhpcy5fbm9kZXNbZWZmZWN0LmluZGV4XTtcbmlmIChub2RlICYmIG5vZGUubm90aWZ5UGF0aCkge1xudmFyIHAgPSB0aGlzLl9maXhQYXRoKGVmZmVjdC5uYW1lLCBlZmZlY3QudmFsdWUsIHBhdGgpO1xubm9kZS5ub3RpZnlQYXRoKHAsIHZhbHVlLCB0cnVlKTtcbn1cbn1cbn0sXG5fY29tcGxleE9ic2VydmVyUGF0aEVmZmVjdDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlLCBlZmZlY3QpIHtcbmlmICh0aGlzLl9wYXRoTWF0Y2hlc0VmZmVjdChwYXRoLCBlZmZlY3QpKSB7XG5Qb2x5bWVyLkJpbmQuX2NvbXBsZXhPYnNlcnZlckVmZmVjdC5jYWxsKHRoaXMsIHBhdGgsIHZhbHVlLCBlZmZlY3QpO1xufVxufSxcbl9jb21wdXRlUGF0aEVmZmVjdDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlLCBlZmZlY3QpIHtcbmlmICh0aGlzLl9wYXRoTWF0Y2hlc0VmZmVjdChwYXRoLCBlZmZlY3QpKSB7XG5Qb2x5bWVyLkJpbmQuX2NvbXB1dGVFZmZlY3QuY2FsbCh0aGlzLCBwYXRoLCB2YWx1ZSwgZWZmZWN0KTtcbn1cbn0sXG5fYW5ub3RhdGVkQ29tcHV0YXRpb25QYXRoRWZmZWN0OiBmdW5jdGlvbiAocGF0aCwgdmFsdWUsIGVmZmVjdCkge1xuaWYgKHRoaXMuX3BhdGhNYXRjaGVzRWZmZWN0KHBhdGgsIGVmZmVjdCkpIHtcblBvbHltZXIuQmluZC5fYW5ub3RhdGVkQ29tcHV0YXRpb25FZmZlY3QuY2FsbCh0aGlzLCBwYXRoLCB2YWx1ZSwgZWZmZWN0KTtcbn1cbn0sXG5fcGF0aE1hdGNoZXNFZmZlY3Q6IGZ1bmN0aW9uIChwYXRoLCBlZmZlY3QpIHtcbnZhciBlZmZlY3RBcmcgPSBlZmZlY3QudHJpZ2dlci5uYW1lO1xucmV0dXJuIGVmZmVjdEFyZyA9PSBwYXRoIHx8IGVmZmVjdEFyZy5pbmRleE9mKHBhdGggKyAnLicpID09PSAwIHx8IGVmZmVjdC50cmlnZ2VyLndpbGRjYXJkICYmIHBhdGguaW5kZXhPZihlZmZlY3RBcmcpID09PSAwO1xufSxcbmxpbmtQYXRoczogZnVuY3Rpb24gKHRvLCBmcm9tKSB7XG50aGlzLl9ib3VuZFBhdGhzID0gdGhpcy5fYm91bmRQYXRocyB8fCB7fTtcbmlmIChmcm9tKSB7XG50aGlzLl9ib3VuZFBhdGhzW3RvXSA9IGZyb207XG59IGVsc2Uge1xudGhpcy51bmJpbmRQYXRoKHRvKTtcbn1cbn0sXG51bmxpbmtQYXRoczogZnVuY3Rpb24gKHBhdGgpIHtcbmlmICh0aGlzLl9ib3VuZFBhdGhzKSB7XG5kZWxldGUgdGhpcy5fYm91bmRQYXRoc1twYXRoXTtcbn1cbn0sXG5fbm90aWZ5Qm91bmRQYXRoczogZnVuY3Rpb24gKHBhdGgsIHZhbHVlKSB7XG52YXIgZnJvbSwgdG87XG5mb3IgKHZhciBhIGluIHRoaXMuX2JvdW5kUGF0aHMpIHtcbnZhciBiID0gdGhpcy5fYm91bmRQYXRoc1thXTtcbmlmIChwYXRoLmluZGV4T2YoYSArICcuJykgPT0gMCkge1xuZnJvbSA9IGE7XG50byA9IGI7XG5icmVhaztcbn1cbmlmIChwYXRoLmluZGV4T2YoYiArICcuJykgPT0gMCkge1xuZnJvbSA9IGI7XG50byA9IGE7XG5icmVhaztcbn1cbn1cbmlmIChmcm9tICYmIHRvKSB7XG52YXIgcCA9IHRoaXMuX2ZpeFBhdGgodG8sIGZyb20sIHBhdGgpO1xudGhpcy5ub3RpZnlQYXRoKHAsIHZhbHVlKTtcbn1cbn0sXG5fZml4UGF0aDogZnVuY3Rpb24gKHByb3BlcnR5LCByb290LCBwYXRoKSB7XG5yZXR1cm4gcHJvcGVydHkgKyBwYXRoLnNsaWNlKHJvb3QubGVuZ3RoKTtcbn0sXG5fbm90aWZ5UGF0aDogZnVuY3Rpb24gKHBhdGgsIHZhbHVlKSB7XG52YXIgcm9vdE5hbWUgPSB0aGlzLl9tb2RlbEZvclBhdGgocGF0aCk7XG52YXIgZGFzaENhc2VOYW1lID0gUG9seW1lci5DYXNlTWFwLmNhbWVsVG9EYXNoQ2FzZShyb290TmFtZSk7XG52YXIgZXZlbnROYW1lID0gZGFzaENhc2VOYW1lICsgdGhpcy5fRVZFTlRfQ0hBTkdFRDtcbnRoaXMuZmlyZShldmVudE5hbWUsIHtcbnBhdGg6IHBhdGgsXG52YWx1ZTogdmFsdWVcbn0sIHsgYnViYmxlczogZmFsc2UgfSk7XG59LFxuX21vZGVsRm9yUGF0aDogZnVuY3Rpb24gKHBhdGgpIHtcbnZhciBkb3QgPSBwYXRoLmluZGV4T2YoJy4nKTtcbnJldHVybiBkb3QgPCAwID8gcGF0aCA6IHBhdGguc2xpY2UoMCwgZG90KTtcbn0sXG5fRVZFTlRfQ0hBTkdFRDogJy1jaGFuZ2VkJyxcbl9ub3RpZnlTcGxpY2U6IGZ1bmN0aW9uIChhcnJheSwgcGF0aCwgaW5kZXgsIGFkZGVkLCByZW1vdmVkKSB7XG52YXIgc3BsaWNlcyA9IFt7XG5pbmRleDogaW5kZXgsXG5hZGRlZENvdW50OiBhZGRlZCxcbnJlbW92ZWQ6IHJlbW92ZWQsXG5vYmplY3Q6IGFycmF5LFxudHlwZTogJ3NwbGljZSdcbn1dO1xudmFyIGNoYW5nZSA9IHtcbmtleVNwbGljZXM6IFBvbHltZXIuQ29sbGVjdGlvbi5hcHBseVNwbGljZXMoYXJyYXksIHNwbGljZXMpLFxuaW5kZXhTcGxpY2VzOiBzcGxpY2VzXG59O1xudGhpcy5zZXQocGF0aCArICcuc3BsaWNlcycsIGNoYW5nZSk7XG5pZiAoYWRkZWQgIT0gcmVtb3ZlZC5sZW5ndGgpIHtcbnRoaXMubm90aWZ5UGF0aChwYXRoICsgJy5sZW5ndGgnLCBhcnJheS5sZW5ndGgpO1xufVxuY2hhbmdlLmtleVNwbGljZXMgPSBudWxsO1xuY2hhbmdlLmluZGV4U3BsaWNlcyA9IG51bGw7XG59LFxucHVzaDogZnVuY3Rpb24gKHBhdGgpIHtcbnZhciBhcnJheSA9IHRoaXMuZ2V0KHBhdGgpO1xudmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xudmFyIGxlbiA9IGFycmF5Lmxlbmd0aDtcbnZhciByZXQgPSBhcnJheS5wdXNoLmFwcGx5KGFycmF5LCBhcmdzKTtcbnRoaXMuX25vdGlmeVNwbGljZShhcnJheSwgcGF0aCwgbGVuLCBhcmdzLmxlbmd0aCwgW10pO1xucmV0dXJuIHJldDtcbn0sXG5wb3A6IGZ1bmN0aW9uIChwYXRoKSB7XG52YXIgYXJyYXkgPSB0aGlzLmdldChwYXRoKTtcbnZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbnZhciByZW0gPSBhcnJheS5zbGljZSgtMSk7XG52YXIgcmV0ID0gYXJyYXkucG9wLmFwcGx5KGFycmF5LCBhcmdzKTtcbnRoaXMuX25vdGlmeVNwbGljZShhcnJheSwgcGF0aCwgYXJyYXkubGVuZ3RoLCAwLCByZW0pO1xucmV0dXJuIHJldDtcbn0sXG5zcGxpY2U6IGZ1bmN0aW9uIChwYXRoLCBzdGFydCwgZGVsZXRlQ291bnQpIHtcbnZhciBhcnJheSA9IHRoaXMuZ2V0KHBhdGgpO1xudmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xudmFyIHJldCA9IGFycmF5LnNwbGljZS5hcHBseShhcnJheSwgYXJncyk7XG50aGlzLl9ub3RpZnlTcGxpY2UoYXJyYXksIHBhdGgsIHN0YXJ0LCBhcmdzLmxlbmd0aCAtIDIsIHJldCk7XG5yZXR1cm4gcmV0O1xufSxcbnNoaWZ0OiBmdW5jdGlvbiAocGF0aCkge1xudmFyIGFycmF5ID0gdGhpcy5nZXQocGF0aCk7XG52YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG52YXIgcmV0ID0gYXJyYXkuc2hpZnQuYXBwbHkoYXJyYXksIGFyZ3MpO1xudGhpcy5fbm90aWZ5U3BsaWNlKGFycmF5LCBwYXRoLCAwLCAwLCBbcmV0XSk7XG5yZXR1cm4gcmV0O1xufSxcbnVuc2hpZnQ6IGZ1bmN0aW9uIChwYXRoKSB7XG52YXIgYXJyYXkgPSB0aGlzLmdldChwYXRoKTtcbnZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbnZhciByZXQgPSBhcnJheS51bnNoaWZ0LmFwcGx5KGFycmF5LCBhcmdzKTtcbnRoaXMuX25vdGlmeVNwbGljZShhcnJheSwgcGF0aCwgMCwgYXJncy5sZW5ndGgsIFtdKTtcbnJldHVybiByZXQ7XG59XG59KTtcbn0oKSk7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xucmVzb2x2ZVVybDogZnVuY3Rpb24gKHVybCkge1xudmFyIG1vZHVsZSA9IFBvbHltZXIuRG9tTW9kdWxlLmltcG9ydCh0aGlzLmlzKTtcbnZhciByb290ID0gJyc7XG5pZiAobW9kdWxlKSB7XG52YXIgYXNzZXRQYXRoID0gbW9kdWxlLmdldEF0dHJpYnV0ZSgnYXNzZXRwYXRoJykgfHwgJyc7XG5yb290ID0gUG9seW1lci5SZXNvbHZlVXJsLnJlc29sdmVVcmwoYXNzZXRQYXRoLCBtb2R1bGUub3duZXJEb2N1bWVudC5iYXNlVVJJKTtcbn1cbnJldHVybiBQb2x5bWVyLlJlc29sdmVVcmwucmVzb2x2ZVVybCh1cmwsIHJvb3QpO1xufVxufSk7XG5Qb2x5bWVyLkNzc1BhcnNlID0gZnVuY3Rpb24gKCkge1xudmFyIGFwaSA9IHtcbnBhcnNlOiBmdW5jdGlvbiAodGV4dCkge1xudGV4dCA9IHRoaXMuX2NsZWFuKHRleHQpO1xucmV0dXJuIHRoaXMuX3BhcnNlQ3NzKHRoaXMuX2xleCh0ZXh0KSwgdGV4dCk7XG59LFxuX2NsZWFuOiBmdW5jdGlvbiAoY3NzVGV4dCkge1xucmV0dXJuIGNzc1RleHQucmVwbGFjZShyeC5jb21tZW50cywgJycpLnJlcGxhY2UocngucG9ydCwgJycpO1xufSxcbl9sZXg6IGZ1bmN0aW9uICh0ZXh0KSB7XG52YXIgcm9vdCA9IHtcbnN0YXJ0OiAwLFxuZW5kOiB0ZXh0Lmxlbmd0aFxufTtcbnZhciBuID0gcm9vdDtcbmZvciAodmFyIGkgPSAwLCBzID0gMCwgbCA9IHRleHQubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5zd2l0Y2ggKHRleHRbaV0pIHtcbmNhc2UgdGhpcy5PUEVOX0JSQUNFOlxuaWYgKCFuLnJ1bGVzKSB7XG5uLnJ1bGVzID0gW107XG59XG52YXIgcCA9IG47XG52YXIgcHJldmlvdXMgPSBwLnJ1bGVzW3AucnVsZXMubGVuZ3RoIC0gMV07XG5uID0ge1xuc3RhcnQ6IGkgKyAxLFxucGFyZW50OiBwLFxucHJldmlvdXM6IHByZXZpb3VzXG59O1xucC5ydWxlcy5wdXNoKG4pO1xuYnJlYWs7XG5jYXNlIHRoaXMuQ0xPU0VfQlJBQ0U6XG5uLmVuZCA9IGkgKyAxO1xubiA9IG4ucGFyZW50IHx8IHJvb3Q7XG5icmVhaztcbn1cbn1cbnJldHVybiByb290O1xufSxcbl9wYXJzZUNzczogZnVuY3Rpb24gKG5vZGUsIHRleHQpIHtcbnZhciB0ID0gdGV4dC5zdWJzdHJpbmcobm9kZS5zdGFydCwgbm9kZS5lbmQgLSAxKTtcbm5vZGUucGFyc2VkQ3NzVGV4dCA9IG5vZGUuY3NzVGV4dCA9IHQudHJpbSgpO1xuaWYgKG5vZGUucGFyZW50KSB7XG52YXIgc3MgPSBub2RlLnByZXZpb3VzID8gbm9kZS5wcmV2aW91cy5lbmQgOiBub2RlLnBhcmVudC5zdGFydDtcbnQgPSB0ZXh0LnN1YnN0cmluZyhzcywgbm9kZS5zdGFydCAtIDEpO1xudCA9IHQuc3Vic3RyaW5nKHQubGFzdEluZGV4T2YoJzsnKSArIDEpO1xudmFyIHMgPSBub2RlLnBhcnNlZFNlbGVjdG9yID0gbm9kZS5zZWxlY3RvciA9IHQudHJpbSgpO1xubm9kZS5hdFJ1bGUgPSBzLmluZGV4T2YoQVRfU1RBUlQpID09PSAwO1xuaWYgKG5vZGUuYXRSdWxlKSB7XG5pZiAocy5pbmRleE9mKE1FRElBX1NUQVJUKSA9PT0gMCkge1xubm9kZS50eXBlID0gdGhpcy50eXBlcy5NRURJQV9SVUxFO1xufSBlbHNlIGlmIChzLm1hdGNoKHJ4LmtleWZyYW1lc1J1bGUpKSB7XG5ub2RlLnR5cGUgPSB0aGlzLnR5cGVzLktFWUZSQU1FU19SVUxFO1xufVxufSBlbHNlIHtcbmlmIChzLmluZGV4T2YoVkFSX1NUQVJUKSA9PT0gMCkge1xubm9kZS50eXBlID0gdGhpcy50eXBlcy5NSVhJTl9SVUxFO1xufSBlbHNlIHtcbm5vZGUudHlwZSA9IHRoaXMudHlwZXMuU1RZTEVfUlVMRTtcbn1cbn1cbn1cbnZhciByJCA9IG5vZGUucnVsZXM7XG5pZiAociQpIHtcbmZvciAodmFyIGkgPSAwLCBsID0gciQubGVuZ3RoLCByOyBpIDwgbCAmJiAociA9IHIkW2ldKTsgaSsrKSB7XG50aGlzLl9wYXJzZUNzcyhyLCB0ZXh0KTtcbn1cbn1cbnJldHVybiBub2RlO1xufSxcbnN0cmluZ2lmeTogZnVuY3Rpb24gKG5vZGUsIHByZXNlcnZlUHJvcGVydGllcywgdGV4dCkge1xudGV4dCA9IHRleHQgfHwgJyc7XG52YXIgY3NzVGV4dCA9ICcnO1xuaWYgKG5vZGUuY3NzVGV4dCB8fCBub2RlLnJ1bGVzKSB7XG52YXIgciQgPSBub2RlLnJ1bGVzO1xuaWYgKHIkICYmIChwcmVzZXJ2ZVByb3BlcnRpZXMgfHwgIWhhc01peGluUnVsZXMociQpKSkge1xuZm9yICh2YXIgaSA9IDAsIGwgPSByJC5sZW5ndGgsIHI7IGkgPCBsICYmIChyID0gciRbaV0pOyBpKyspIHtcbmNzc1RleHQgPSB0aGlzLnN0cmluZ2lmeShyLCBwcmVzZXJ2ZVByb3BlcnRpZXMsIGNzc1RleHQpO1xufVxufSBlbHNlIHtcbmNzc1RleHQgPSBwcmVzZXJ2ZVByb3BlcnRpZXMgPyBub2RlLmNzc1RleHQgOiByZW1vdmVDdXN0b21Qcm9wcyhub2RlLmNzc1RleHQpO1xuY3NzVGV4dCA9IGNzc1RleHQudHJpbSgpO1xuaWYgKGNzc1RleHQpIHtcbmNzc1RleHQgPSAnICAnICsgY3NzVGV4dCArICdcXG4nO1xufVxufVxufVxuaWYgKGNzc1RleHQpIHtcbmlmIChub2RlLnNlbGVjdG9yKSB7XG50ZXh0ICs9IG5vZGUuc2VsZWN0b3IgKyAnICcgKyB0aGlzLk9QRU5fQlJBQ0UgKyAnXFxuJztcbn1cbnRleHQgKz0gY3NzVGV4dDtcbmlmIChub2RlLnNlbGVjdG9yKSB7XG50ZXh0ICs9IHRoaXMuQ0xPU0VfQlJBQ0UgKyAnXFxuXFxuJztcbn1cbn1cbnJldHVybiB0ZXh0O1xufSxcbnR5cGVzOiB7XG5TVFlMRV9SVUxFOiAxLFxuS0VZRlJBTUVTX1JVTEU6IDcsXG5NRURJQV9SVUxFOiA0LFxuTUlYSU5fUlVMRTogMTAwMFxufSxcbk9QRU5fQlJBQ0U6ICd7JyxcbkNMT1NFX0JSQUNFOiAnfSdcbn07XG5mdW5jdGlvbiBoYXNNaXhpblJ1bGVzKHJ1bGVzKSB7XG5yZXR1cm4gcnVsZXNbMF0uc2VsZWN0b3IuaW5kZXhPZihWQVJfU1RBUlQpID49IDA7XG59XG5mdW5jdGlvbiByZW1vdmVDdXN0b21Qcm9wcyhjc3NUZXh0KSB7XG5yZXR1cm4gY3NzVGV4dC5yZXBsYWNlKHJ4LmN1c3RvbVByb3AsICcnKS5yZXBsYWNlKHJ4Lm1peGluUHJvcCwgJycpLnJlcGxhY2UocngubWl4aW5BcHBseSwgJycpLnJlcGxhY2UocngudmFyQXBwbHksICcnKTtcbn1cbnZhciBWQVJfU1RBUlQgPSAnLS0nO1xudmFyIE1FRElBX1NUQVJUID0gJ0BtZWRpYSc7XG52YXIgQVRfU1RBUlQgPSAnQCc7XG52YXIgcnggPSB7XG5jb21tZW50czogL1xcL1xcKlteKl0qXFwqKyhbXlxcLypdW14qXSpcXCorKSpcXC8vZ2ltLFxucG9ydDogL0BpbXBvcnRbXjtdKjsvZ2ltLFxuY3VzdG9tUHJvcDogLyg/Ol58W1xccztdKS0tW147e10qPzpbXnt9O10qPyg/Ols7XFxuXXwkKS9naW0sXG5taXhpblByb3A6IC8oPzpefFtcXHM7XSktLVteO3tdKj86W157O10qP3tbXn1dKj99KD86WztcXG5dfCQpPy9naW0sXG5taXhpbkFwcGx5OiAvQGFwcGx5W1xcc10qXFwoW14pXSo/XFwpW1xcc10qKD86WztcXG5dfCQpPy9naW0sXG52YXJBcHBseTogL1teOzpdKj86W147XSp2YXJbXjtdKig/Ols7XFxuXXwkKT8vZ2ltLFxua2V5ZnJhbWVzUnVsZTogL15AW15cXHNdKmtleWZyYW1lcy9cbn07XG5yZXR1cm4gYXBpO1xufSgpO1xuUG9seW1lci5TdHlsZVV0aWwgPSBmdW5jdGlvbiAoKSB7XG5yZXR1cm4ge1xuTU9EVUxFX1NUWUxFU19TRUxFQ1RPUjogJ3N0eWxlLCBsaW5rW3JlbD1pbXBvcnRdW3R5cGV+PWNzc10nLFxudG9Dc3NUZXh0OiBmdW5jdGlvbiAocnVsZXMsIGNhbGxiYWNrLCBwcmVzZXJ2ZVByb3BlcnRpZXMpIHtcbmlmICh0eXBlb2YgcnVsZXMgPT09ICdzdHJpbmcnKSB7XG5ydWxlcyA9IHRoaXMucGFyc2VyLnBhcnNlKHJ1bGVzKTtcbn1cbmlmIChjYWxsYmFjaykge1xudGhpcy5mb3JFYWNoU3R5bGVSdWxlKHJ1bGVzLCBjYWxsYmFjayk7XG59XG5yZXR1cm4gdGhpcy5wYXJzZXIuc3RyaW5naWZ5KHJ1bGVzLCBwcmVzZXJ2ZVByb3BlcnRpZXMpO1xufSxcbmZvclJ1bGVzSW5TdHlsZXM6IGZ1bmN0aW9uIChzdHlsZXMsIGNhbGxiYWNrKSB7XG5mb3IgKHZhciBpID0gMCwgbCA9IHN0eWxlcy5sZW5ndGgsIHM7IGkgPCBsICYmIChzID0gc3R5bGVzW2ldKTsgaSsrKSB7XG50aGlzLmZvckVhY2hTdHlsZVJ1bGUodGhpcy5ydWxlc0ZvclN0eWxlKHMpLCBjYWxsYmFjayk7XG59XG59LFxucnVsZXNGb3JTdHlsZTogZnVuY3Rpb24gKHN0eWxlKSB7XG5pZiAoIXN0eWxlLl9fY3NzUnVsZXMgJiYgc3R5bGUudGV4dENvbnRlbnQpIHtcbnN0eWxlLl9fY3NzUnVsZXMgPSB0aGlzLnBhcnNlci5wYXJzZShzdHlsZS50ZXh0Q29udGVudCk7XG59XG5yZXR1cm4gc3R5bGUuX19jc3NSdWxlcztcbn0sXG5jbGVhclN0eWxlUnVsZXM6IGZ1bmN0aW9uIChzdHlsZSkge1xuc3R5bGUuX19jc3NSdWxlcyA9IG51bGw7XG59LFxuZm9yRWFjaFN0eWxlUnVsZTogZnVuY3Rpb24gKG5vZGUsIGNhbGxiYWNrKSB7XG52YXIgcyA9IG5vZGUuc2VsZWN0b3I7XG52YXIgc2tpcFJ1bGVzID0gZmFsc2U7XG5pZiAobm9kZS50eXBlID09PSB0aGlzLnJ1bGVUeXBlcy5TVFlMRV9SVUxFKSB7XG5jYWxsYmFjayhub2RlKTtcbn0gZWxzZSBpZiAobm9kZS50eXBlID09PSB0aGlzLnJ1bGVUeXBlcy5LRVlGUkFNRVNfUlVMRSB8fCBub2RlLnR5cGUgPT09IHRoaXMucnVsZVR5cGVzLk1JWElOX1JVTEUpIHtcbnNraXBSdWxlcyA9IHRydWU7XG59XG52YXIgciQgPSBub2RlLnJ1bGVzO1xuaWYgKHIkICYmICFza2lwUnVsZXMpIHtcbmZvciAodmFyIGkgPSAwLCBsID0gciQubGVuZ3RoLCByOyBpIDwgbCAmJiAociA9IHIkW2ldKTsgaSsrKSB7XG50aGlzLmZvckVhY2hTdHlsZVJ1bGUociwgY2FsbGJhY2spO1xufVxufVxufSxcbmFwcGx5Q3NzOiBmdW5jdGlvbiAoY3NzVGV4dCwgbW9uaWtlciwgdGFyZ2V0LCBhZnRlck5vZGUpIHtcbnZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5pZiAobW9uaWtlcikge1xuc3R5bGUuc2V0QXR0cmlidXRlKCdzY29wZScsIG1vbmlrZXIpO1xufVxuc3R5bGUudGV4dENvbnRlbnQgPSBjc3NUZXh0O1xudGFyZ2V0ID0gdGFyZ2V0IHx8IGRvY3VtZW50LmhlYWQ7XG5pZiAoIWFmdGVyTm9kZSkge1xudmFyIG4kID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoJ3N0eWxlW3Njb3BlXScpO1xuYWZ0ZXJOb2RlID0gbiRbbiQubGVuZ3RoIC0gMV07XG59XG50YXJnZXQuaW5zZXJ0QmVmb3JlKHN0eWxlLCBhZnRlck5vZGUgJiYgYWZ0ZXJOb2RlLm5leHRTaWJsaW5nIHx8IHRhcmdldC5maXJzdENoaWxkKTtcbnJldHVybiBzdHlsZTtcbn0sXG5jc3NGcm9tTW9kdWxlOiBmdW5jdGlvbiAobW9kdWxlSWQpIHtcbnZhciBtID0gUG9seW1lci5Eb21Nb2R1bGUuaW1wb3J0KG1vZHVsZUlkKTtcbmlmIChtICYmICFtLl9jc3NUZXh0KSB7XG52YXIgY3NzVGV4dCA9ICcnO1xudmFyIGUkID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuTU9EVUxFX1NUWUxFU19TRUxFQ1RPUikpO1xuZm9yICh2YXIgaSA9IDAsIGU7IGkgPCBlJC5sZW5ndGg7IGkrKykge1xuZSA9IGUkW2ldO1xuaWYgKGUubG9jYWxOYW1lID09PSAnc3R5bGUnKSB7XG5lID0gZS5fX2FwcGxpZWRFbGVtZW50IHx8IGU7XG5lLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZSk7XG59IGVsc2Uge1xuZSA9IGUuaW1wb3J0ICYmIGUuaW1wb3J0LmJvZHk7XG59XG5pZiAoZSkge1xuY3NzVGV4dCArPSBQb2x5bWVyLlJlc29sdmVVcmwucmVzb2x2ZUNzcyhlLnRleHRDb250ZW50LCBlLm93bmVyRG9jdW1lbnQpO1xufVxufVxubS5fY3NzVGV4dCA9IGNzc1RleHQ7XG59XG5yZXR1cm4gbSAmJiBtLl9jc3NUZXh0IHx8ICcnO1xufSxcbnBhcnNlcjogUG9seW1lci5Dc3NQYXJzZSxcbnJ1bGVUeXBlczogUG9seW1lci5Dc3NQYXJzZS50eXBlc1xufTtcbn0oKTtcblBvbHltZXIuU3R5bGVUcmFuc2Zvcm1lciA9IGZ1bmN0aW9uICgpIHtcbnZhciBuYXRpdmVTaGFkb3cgPSBQb2x5bWVyLlNldHRpbmdzLnVzZU5hdGl2ZVNoYWRvdztcbnZhciBzdHlsZVV0aWwgPSBQb2x5bWVyLlN0eWxlVXRpbDtcbnZhciBhcGkgPSB7XG5kb206IGZ1bmN0aW9uIChub2RlLCBzY29wZSwgdXNlQXR0ciwgc2hvdWxkUmVtb3ZlU2NvcGUpIHtcbnRoaXMuX3RyYW5zZm9ybURvbShub2RlLCBzY29wZSB8fCAnJywgdXNlQXR0ciwgc2hvdWxkUmVtb3ZlU2NvcGUpO1xufSxcbl90cmFuc2Zvcm1Eb206IGZ1bmN0aW9uIChub2RlLCBzZWxlY3RvciwgdXNlQXR0ciwgc2hvdWxkUmVtb3ZlU2NvcGUpIHtcbmlmIChub2RlLnNldEF0dHJpYnV0ZSkge1xudGhpcy5lbGVtZW50KG5vZGUsIHNlbGVjdG9yLCB1c2VBdHRyLCBzaG91bGRSZW1vdmVTY29wZSk7XG59XG52YXIgYyQgPSBQb2x5bWVyLmRvbShub2RlKS5jaGlsZE5vZGVzO1xuZm9yICh2YXIgaSA9IDA7IGkgPCBjJC5sZW5ndGg7IGkrKykge1xudGhpcy5fdHJhbnNmb3JtRG9tKGMkW2ldLCBzZWxlY3RvciwgdXNlQXR0ciwgc2hvdWxkUmVtb3ZlU2NvcGUpO1xufVxufSxcbmVsZW1lbnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBzY29wZSwgdXNlQXR0ciwgc2hvdWxkUmVtb3ZlU2NvcGUpIHtcbmlmICh1c2VBdHRyKSB7XG5pZiAoc2hvdWxkUmVtb3ZlU2NvcGUpIHtcbmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKFNDT1BFX05BTUUpO1xufSBlbHNlIHtcbmVsZW1lbnQuc2V0QXR0cmlidXRlKFNDT1BFX05BTUUsIHNjb3BlKTtcbn1cbn0gZWxzZSB7XG5pZiAoc2NvcGUpIHtcbmlmIChlbGVtZW50LmNsYXNzTGlzdCkge1xuaWYgKHNob3VsZFJlbW92ZVNjb3BlKSB7XG5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoU0NPUEVfTkFNRSk7XG5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoc2NvcGUpO1xufSBlbHNlIHtcbmVsZW1lbnQuY2xhc3NMaXN0LmFkZChTQ09QRV9OQU1FKTtcbmVsZW1lbnQuY2xhc3NMaXN0LmFkZChzY29wZSk7XG59XG59IGVsc2UgaWYgKGVsZW1lbnQuZ2V0QXR0cmlidXRlKSB7XG52YXIgYyA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKENMQVNTKTtcbmlmIChzaG91bGRSZW1vdmVTY29wZSkge1xuaWYgKGMpIHtcbmVsZW1lbnQuc2V0QXR0cmlidXRlKENMQVNTLCBjLnJlcGxhY2UoU0NPUEVfTkFNRSwgJycpLnJlcGxhY2Uoc2NvcGUsICcnKSk7XG59XG59IGVsc2Uge1xuZWxlbWVudC5zZXRBdHRyaWJ1dGUoQ0xBU1MsIGMgKyAoYyA/ICcgJyA6ICcnKSArIFNDT1BFX05BTUUgKyAnICcgKyBzY29wZSk7XG59XG59XG59XG59XG59LFxuZWxlbWVudFN0eWxlczogZnVuY3Rpb24gKGVsZW1lbnQsIGNhbGxiYWNrKSB7XG52YXIgc3R5bGVzID0gZWxlbWVudC5fc3R5bGVzO1xudmFyIGNzc1RleHQgPSAnJztcbmZvciAodmFyIGkgPSAwLCBsID0gc3R5bGVzLmxlbmd0aCwgcywgdGV4dDsgaSA8IGwgJiYgKHMgPSBzdHlsZXNbaV0pOyBpKyspIHtcbnZhciBydWxlcyA9IHN0eWxlVXRpbC5ydWxlc0ZvclN0eWxlKHMpO1xuY3NzVGV4dCArPSBuYXRpdmVTaGFkb3cgPyBzdHlsZVV0aWwudG9Dc3NUZXh0KHJ1bGVzLCBjYWxsYmFjaykgOiB0aGlzLmNzcyhydWxlcywgZWxlbWVudC5pcywgZWxlbWVudC5leHRlbmRzLCBjYWxsYmFjaywgZWxlbWVudC5fc2NvcGVDc3NWaWFBdHRyKSArICdcXG5cXG4nO1xufVxucmV0dXJuIGNzc1RleHQudHJpbSgpO1xufSxcbmNzczogZnVuY3Rpb24gKHJ1bGVzLCBzY29wZSwgZXh0LCBjYWxsYmFjaywgdXNlQXR0cikge1xudmFyIGhvc3RTY29wZSA9IHRoaXMuX2NhbGNIb3N0U2NvcGUoc2NvcGUsIGV4dCk7XG5zY29wZSA9IHRoaXMuX2NhbGNFbGVtZW50U2NvcGUoc2NvcGUsIHVzZUF0dHIpO1xudmFyIHNlbGYgPSB0aGlzO1xucmV0dXJuIHN0eWxlVXRpbC50b0Nzc1RleHQocnVsZXMsIGZ1bmN0aW9uIChydWxlKSB7XG5pZiAoIXJ1bGUuaXNTY29wZWQpIHtcbnNlbGYucnVsZShydWxlLCBzY29wZSwgaG9zdFNjb3BlKTtcbnJ1bGUuaXNTY29wZWQgPSB0cnVlO1xufVxuaWYgKGNhbGxiYWNrKSB7XG5jYWxsYmFjayhydWxlLCBzY29wZSwgaG9zdFNjb3BlKTtcbn1cbn0pO1xufSxcbl9jYWxjRWxlbWVudFNjb3BlOiBmdW5jdGlvbiAoc2NvcGUsIHVzZUF0dHIpIHtcbmlmIChzY29wZSkge1xucmV0dXJuIHVzZUF0dHIgPyBDU1NfQVRUUl9QUkVGSVggKyBzY29wZSArIENTU19BVFRSX1NVRkZJWCA6IENTU19DTEFTU19QUkVGSVggKyBzY29wZTtcbn0gZWxzZSB7XG5yZXR1cm4gJyc7XG59XG59LFxuX2NhbGNIb3N0U2NvcGU6IGZ1bmN0aW9uIChzY29wZSwgZXh0KSB7XG5yZXR1cm4gZXh0ID8gJ1tpcz0nICsgc2NvcGUgKyAnXScgOiBzY29wZTtcbn0sXG5ydWxlOiBmdW5jdGlvbiAocnVsZSwgc2NvcGUsIGhvc3RTY29wZSkge1xudGhpcy5fdHJhbnNmb3JtUnVsZShydWxlLCB0aGlzLl90cmFuc2Zvcm1Db21wbGV4U2VsZWN0b3IsIHNjb3BlLCBob3N0U2NvcGUpO1xufSxcbl90cmFuc2Zvcm1SdWxlOiBmdW5jdGlvbiAocnVsZSwgdHJhbnNmb3JtZXIsIHNjb3BlLCBob3N0U2NvcGUpIHtcbnZhciBwJCA9IHJ1bGUuc2VsZWN0b3Iuc3BsaXQoQ09NUExFWF9TRUxFQ1RPUl9TRVApO1xuZm9yICh2YXIgaSA9IDAsIGwgPSBwJC5sZW5ndGgsIHA7IGkgPCBsICYmIChwID0gcCRbaV0pOyBpKyspIHtcbnAkW2ldID0gdHJhbnNmb3JtZXIuY2FsbCh0aGlzLCBwLCBzY29wZSwgaG9zdFNjb3BlKTtcbn1cbnJ1bGUuc2VsZWN0b3IgPSBwJC5qb2luKENPTVBMRVhfU0VMRUNUT1JfU0VQKTtcbn0sXG5fdHJhbnNmb3JtQ29tcGxleFNlbGVjdG9yOiBmdW5jdGlvbiAoc2VsZWN0b3IsIHNjb3BlLCBob3N0U2NvcGUpIHtcbnZhciBzdG9wID0gZmFsc2U7XG52YXIgaG9zdENvbnRleHQgPSBmYWxzZTtcbnZhciBzZWxmID0gdGhpcztcbnNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShTSU1QTEVfU0VMRUNUT1JfU0VQLCBmdW5jdGlvbiAobSwgYywgcykge1xuaWYgKCFzdG9wKSB7XG52YXIgaW5mbyA9IHNlbGYuX3RyYW5zZm9ybUNvbXBvdW5kU2VsZWN0b3IocywgYywgc2NvcGUsIGhvc3RTY29wZSk7XG5zdG9wID0gc3RvcCB8fCBpbmZvLnN0b3A7XG5ob3N0Q29udGV4dCA9IGhvc3RDb250ZXh0IHx8IGluZm8uaG9zdENvbnRleHQ7XG5jID0gaW5mby5jb21iaW5hdG9yO1xucyA9IGluZm8udmFsdWU7XG59IGVsc2Uge1xucyA9IHMucmVwbGFjZShTQ09QRV9KVU1QLCAnICcpO1xufVxucmV0dXJuIGMgKyBzO1xufSk7XG5pZiAoaG9zdENvbnRleHQpIHtcbnNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShIT1NUX0NPTlRFWFRfUEFSRU4sIGZ1bmN0aW9uIChtLCBwcmUsIHBhcmVuLCBwb3N0KSB7XG5yZXR1cm4gcHJlICsgcGFyZW4gKyAnICcgKyBob3N0U2NvcGUgKyBwb3N0ICsgQ09NUExFWF9TRUxFQ1RPUl9TRVAgKyAnICcgKyBwcmUgKyBob3N0U2NvcGUgKyBwYXJlbiArIHBvc3Q7XG59KTtcbn1cbnJldHVybiBzZWxlY3Rvcjtcbn0sXG5fdHJhbnNmb3JtQ29tcG91bmRTZWxlY3RvcjogZnVuY3Rpb24gKHNlbGVjdG9yLCBjb21iaW5hdG9yLCBzY29wZSwgaG9zdFNjb3BlKSB7XG52YXIganVtcEluZGV4ID0gc2VsZWN0b3Iuc2VhcmNoKFNDT1BFX0pVTVApO1xudmFyIGhvc3RDb250ZXh0ID0gZmFsc2U7XG5pZiAoc2VsZWN0b3IuaW5kZXhPZihIT1NUX0NPTlRFWFQpID49IDApIHtcbmhvc3RDb250ZXh0ID0gdHJ1ZTtcbn0gZWxzZSBpZiAoc2VsZWN0b3IuaW5kZXhPZihIT1NUKSA+PSAwKSB7XG5zZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoSE9TVF9QQVJFTiwgZnVuY3Rpb24gKG0sIGhvc3QsIHBhcmVuKSB7XG5yZXR1cm4gaG9zdFNjb3BlICsgcGFyZW47XG59KTtcbnNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShIT1NULCBob3N0U2NvcGUpO1xufSBlbHNlIGlmIChqdW1wSW5kZXggIT09IDApIHtcbnNlbGVjdG9yID0gc2NvcGUgPyB0aGlzLl90cmFuc2Zvcm1TaW1wbGVTZWxlY3RvcihzZWxlY3Rvciwgc2NvcGUpIDogc2VsZWN0b3I7XG59XG5pZiAoc2VsZWN0b3IuaW5kZXhPZihDT05URU5UKSA+PSAwKSB7XG5jb21iaW5hdG9yID0gJyc7XG59XG52YXIgc3RvcDtcbmlmIChqdW1wSW5kZXggPj0gMCkge1xuc2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKFNDT1BFX0pVTVAsICcgJyk7XG5zdG9wID0gdHJ1ZTtcbn1cbnJldHVybiB7XG52YWx1ZTogc2VsZWN0b3IsXG5jb21iaW5hdG9yOiBjb21iaW5hdG9yLFxuc3RvcDogc3RvcCxcbmhvc3RDb250ZXh0OiBob3N0Q29udGV4dFxufTtcbn0sXG5fdHJhbnNmb3JtU2ltcGxlU2VsZWN0b3I6IGZ1bmN0aW9uIChzZWxlY3Rvciwgc2NvcGUpIHtcbnZhciBwJCA9IHNlbGVjdG9yLnNwbGl0KFBTRVVET19QUkVGSVgpO1xucCRbMF0gKz0gc2NvcGU7XG5yZXR1cm4gcCQuam9pbihQU0VVRE9fUFJFRklYKTtcbn0sXG5kb2N1bWVudFJ1bGU6IGZ1bmN0aW9uIChydWxlKSB7XG5ydWxlLnNlbGVjdG9yID0gcnVsZS5wYXJzZWRTZWxlY3RvcjtcbnRoaXMubm9ybWFsaXplUm9vdFNlbGVjdG9yKHJ1bGUpO1xuaWYgKCFuYXRpdmVTaGFkb3cpIHtcbnRoaXMuX3RyYW5zZm9ybVJ1bGUocnVsZSwgdGhpcy5fdHJhbnNmb3JtRG9jdW1lbnRTZWxlY3Rvcik7XG59XG59LFxubm9ybWFsaXplUm9vdFNlbGVjdG9yOiBmdW5jdGlvbiAocnVsZSkge1xuaWYgKHJ1bGUuc2VsZWN0b3IgPT09IFJPT1QpIHtcbnJ1bGUuc2VsZWN0b3IgPSAnYm9keSc7XG59XG59LFxuX3RyYW5zZm9ybURvY3VtZW50U2VsZWN0b3I6IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xucmV0dXJuIHNlbGVjdG9yLm1hdGNoKFNDT1BFX0pVTVApID8gdGhpcy5fdHJhbnNmb3JtQ29tcGxleFNlbGVjdG9yKHNlbGVjdG9yLCBTQ09QRV9ET0NfU0VMRUNUT1IpIDogdGhpcy5fdHJhbnNmb3JtU2ltcGxlU2VsZWN0b3Ioc2VsZWN0b3IudHJpbSgpLCBTQ09QRV9ET0NfU0VMRUNUT1IpO1xufSxcblNDT1BFX05BTUU6ICdzdHlsZS1zY29wZSdcbn07XG52YXIgU0NPUEVfTkFNRSA9IGFwaS5TQ09QRV9OQU1FO1xudmFyIFNDT1BFX0RPQ19TRUxFQ1RPUiA9ICc6bm90KFsnICsgU0NPUEVfTkFNRSArICddKScgKyAnOm5vdCguJyArIFNDT1BFX05BTUUgKyAnKSc7XG52YXIgQ09NUExFWF9TRUxFQ1RPUl9TRVAgPSAnLCc7XG52YXIgU0lNUExFX1NFTEVDVE9SX1NFUCA9IC8oXnxbXFxzPit+XSspKFteXFxzPit+XSspL2c7XG52YXIgSE9TVCA9ICc6aG9zdCc7XG52YXIgUk9PVCA9ICc6cm9vdCc7XG52YXIgSE9TVF9QQVJFTiA9IC8oXFw6aG9zdCkoPzpcXCgoKD86XFwoW14pKF0qXFwpfFteKShdKikrPylcXCkpL2c7XG52YXIgSE9TVF9DT05URVhUID0gJzpob3N0LWNvbnRleHQnO1xudmFyIEhPU1RfQ09OVEVYVF9QQVJFTiA9IC8oLiopKD86XFw6aG9zdC1jb250ZXh0KSg/OlxcKCgoPzpcXChbXikoXSpcXCl8W14pKF0qKSs/KVxcKSkoLiopLztcbnZhciBDT05URU5UID0gJzo6Y29udGVudCc7XG52YXIgU0NPUEVfSlVNUCA9IC9cXDpcXDpjb250ZW50fFxcOlxcOnNoYWRvd3xcXC9kZWVwXFwvLztcbnZhciBDU1NfQ0xBU1NfUFJFRklYID0gJy4nO1xudmFyIENTU19BVFRSX1BSRUZJWCA9ICdbJyArIFNDT1BFX05BTUUgKyAnfj0nO1xudmFyIENTU19BVFRSX1NVRkZJWCA9ICddJztcbnZhciBQU0VVRE9fUFJFRklYID0gJzonO1xudmFyIENMQVNTID0gJ2NsYXNzJztcbnJldHVybiBhcGk7XG59KCk7XG5Qb2x5bWVyLlN0eWxlRXh0ZW5kcyA9IGZ1bmN0aW9uICgpIHtcbnZhciBzdHlsZVV0aWwgPSBQb2x5bWVyLlN0eWxlVXRpbDtcbnJldHVybiB7XG5oYXNFeHRlbmRzOiBmdW5jdGlvbiAoY3NzVGV4dCkge1xucmV0dXJuIEJvb2xlYW4oY3NzVGV4dC5tYXRjaCh0aGlzLnJ4LkVYVEVORCkpO1xufSxcbnRyYW5zZm9ybTogZnVuY3Rpb24gKHN0eWxlKSB7XG52YXIgcnVsZXMgPSBzdHlsZVV0aWwucnVsZXNGb3JTdHlsZShzdHlsZSk7XG52YXIgc2VsZiA9IHRoaXM7XG5zdHlsZVV0aWwuZm9yRWFjaFN0eWxlUnVsZShydWxlcywgZnVuY3Rpb24gKHJ1bGUpIHtcbnZhciBtYXAgPSBzZWxmLl9tYXBSdWxlKHJ1bGUpO1xuaWYgKHJ1bGUucGFyZW50KSB7XG52YXIgbTtcbndoaWxlIChtID0gc2VsZi5yeC5FWFRFTkQuZXhlYyhydWxlLmNzc1RleHQpKSB7XG52YXIgZXh0ZW5kID0gbVsxXTtcbnZhciBleHRlbmRvciA9IHNlbGYuX2ZpbmRFeHRlbmRvcihleHRlbmQsIHJ1bGUpO1xuaWYgKGV4dGVuZG9yKSB7XG5zZWxmLl9leHRlbmRSdWxlKHJ1bGUsIGV4dGVuZG9yKTtcbn1cbn1cbn1cbnJ1bGUuY3NzVGV4dCA9IHJ1bGUuY3NzVGV4dC5yZXBsYWNlKHNlbGYucnguRVhURU5ELCAnJyk7XG59KTtcbnJldHVybiBzdHlsZVV0aWwudG9Dc3NUZXh0KHJ1bGVzLCBmdW5jdGlvbiAocnVsZSkge1xuaWYgKHJ1bGUuc2VsZWN0b3IubWF0Y2goc2VsZi5yeC5TVFJJUCkpIHtcbnJ1bGUuY3NzVGV4dCA9ICcnO1xufVxufSwgdHJ1ZSk7XG59LFxuX21hcFJ1bGU6IGZ1bmN0aW9uIChydWxlKSB7XG5pZiAocnVsZS5wYXJlbnQpIHtcbnZhciBtYXAgPSBydWxlLnBhcmVudC5tYXAgfHwgKHJ1bGUucGFyZW50Lm1hcCA9IHt9KTtcbnZhciBwYXJ0cyA9IHJ1bGUuc2VsZWN0b3Iuc3BsaXQoJywnKTtcbmZvciAodmFyIGkgPSAwLCBwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbnAgPSBwYXJ0c1tpXTtcbm1hcFtwLnRyaW0oKV0gPSBydWxlO1xufVxucmV0dXJuIG1hcDtcbn1cbn0sXG5fZmluZEV4dGVuZG9yOiBmdW5jdGlvbiAoZXh0ZW5kLCBydWxlKSB7XG5yZXR1cm4gcnVsZS5wYXJlbnQgJiYgcnVsZS5wYXJlbnQubWFwICYmIHJ1bGUucGFyZW50Lm1hcFtleHRlbmRdIHx8IHRoaXMuX2ZpbmRFeHRlbmRvcihleHRlbmQsIHJ1bGUucGFyZW50KTtcbn0sXG5fZXh0ZW5kUnVsZTogZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG5pZiAodGFyZ2V0LnBhcmVudCAhPT0gc291cmNlLnBhcmVudCkge1xudGhpcy5fY2xvbmVBbmRBZGRSdWxlVG9QYXJlbnQoc291cmNlLCB0YXJnZXQucGFyZW50KTtcbn1cbnRhcmdldC5leHRlbmRzID0gdGFyZ2V0LmV4dGVuZHMgfHwgKHRhcmdldC5leHRlbmRzID0gW10pO1xudGFyZ2V0LmV4dGVuZHMucHVzaChzb3VyY2UpO1xuc291cmNlLnNlbGVjdG9yID0gc291cmNlLnNlbGVjdG9yLnJlcGxhY2UodGhpcy5yeC5TVFJJUCwgJycpO1xuc291cmNlLnNlbGVjdG9yID0gKHNvdXJjZS5zZWxlY3RvciAmJiBzb3VyY2Uuc2VsZWN0b3IgKyAnLFxcbicpICsgdGFyZ2V0LnNlbGVjdG9yO1xuaWYgKHNvdXJjZS5leHRlbmRzKSB7XG5zb3VyY2UuZXh0ZW5kcy5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG50aGlzLl9leHRlbmRSdWxlKHRhcmdldCwgZSk7XG59LCB0aGlzKTtcbn1cbn0sXG5fY2xvbmVBbmRBZGRSdWxlVG9QYXJlbnQ6IGZ1bmN0aW9uIChydWxlLCBwYXJlbnQpIHtcbnJ1bGUgPSBPYmplY3QuY3JlYXRlKHJ1bGUpO1xucnVsZS5wYXJlbnQgPSBwYXJlbnQ7XG5pZiAocnVsZS5leHRlbmRzKSB7XG5ydWxlLmV4dGVuZHMgPSBydWxlLmV4dGVuZHMuc2xpY2UoKTtcbn1cbnBhcmVudC5ydWxlcy5wdXNoKHJ1bGUpO1xufSxcbnJ4OiB7XG5FWFRFTkQ6IC9AZXh0ZW5kc1xcKChbXildKilcXClcXHMqPzsvZ2ltLFxuU1RSSVA6IC8lW14sXSokL1xufVxufTtcbn0oKTtcbihmdW5jdGlvbiAoKSB7XG52YXIgcHJlcEVsZW1lbnQgPSBQb2x5bWVyLkJhc2UuX3ByZXBFbGVtZW50O1xudmFyIG5hdGl2ZVNoYWRvdyA9IFBvbHltZXIuU2V0dGluZ3MudXNlTmF0aXZlU2hhZG93O1xudmFyIHN0eWxlVXRpbCA9IFBvbHltZXIuU3R5bGVVdGlsO1xudmFyIHN0eWxlVHJhbnNmb3JtZXIgPSBQb2x5bWVyLlN0eWxlVHJhbnNmb3JtZXI7XG52YXIgc3R5bGVFeHRlbmRzID0gUG9seW1lci5TdHlsZUV4dGVuZHM7XG5Qb2x5bWVyLkJhc2UuX2FkZEZlYXR1cmUoe1xuX3ByZXBFbGVtZW50OiBmdW5jdGlvbiAoZWxlbWVudCkge1xuaWYgKHRoaXMuX2VuY2Fwc3VsYXRlU3R5bGUpIHtcbnN0eWxlVHJhbnNmb3JtZXIuZWxlbWVudChlbGVtZW50LCB0aGlzLmlzLCB0aGlzLl9zY29wZUNzc1ZpYUF0dHIpO1xufVxucHJlcEVsZW1lbnQuY2FsbCh0aGlzLCBlbGVtZW50KTtcbn0sXG5fcHJlcFN0eWxlczogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuX2VuY2Fwc3VsYXRlU3R5bGUgPT09IHVuZGVmaW5lZCkge1xudGhpcy5fZW5jYXBzdWxhdGVTdHlsZSA9ICFuYXRpdmVTaGFkb3cgJiYgQm9vbGVhbih0aGlzLl90ZW1wbGF0ZSk7XG59XG50aGlzLl9zdHlsZXMgPSB0aGlzLl9jb2xsZWN0U3R5bGVzKCk7XG52YXIgY3NzVGV4dCA9IHN0eWxlVHJhbnNmb3JtZXIuZWxlbWVudFN0eWxlcyh0aGlzKTtcbmlmIChjc3NUZXh0ICYmIHRoaXMuX3RlbXBsYXRlKSB7XG52YXIgc3R5bGUgPSBzdHlsZVV0aWwuYXBwbHlDc3MoY3NzVGV4dCwgdGhpcy5pcywgbmF0aXZlU2hhZG93ID8gdGhpcy5fdGVtcGxhdGUuY29udGVudCA6IG51bGwpO1xuaWYgKCFuYXRpdmVTaGFkb3cpIHtcbnRoaXMuX3Njb3BlU3R5bGUgPSBzdHlsZTtcbn1cbn1cbn0sXG5fY29sbGVjdFN0eWxlczogZnVuY3Rpb24gKCkge1xudmFyIHN0eWxlcyA9IFtdO1xudmFyIGNzc1RleHQgPSAnJywgbSQgPSB0aGlzLnN0eWxlTW9kdWxlcztcbmlmIChtJCkge1xuZm9yICh2YXIgaSA9IDAsIGwgPSBtJC5sZW5ndGgsIG07IGkgPCBsICYmIChtID0gbSRbaV0pOyBpKyspIHtcbmNzc1RleHQgKz0gc3R5bGVVdGlsLmNzc0Zyb21Nb2R1bGUobSk7XG59XG59XG5jc3NUZXh0ICs9IHN0eWxlVXRpbC5jc3NGcm9tTW9kdWxlKHRoaXMuaXMpO1xuaWYgKGNzc1RleHQpIHtcbnZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5zdHlsZS50ZXh0Q29udGVudCA9IGNzc1RleHQ7XG5pZiAoc3R5bGVFeHRlbmRzLmhhc0V4dGVuZHMoc3R5bGUudGV4dENvbnRlbnQpKSB7XG5jc3NUZXh0ID0gc3R5bGVFeHRlbmRzLnRyYW5zZm9ybShzdHlsZSk7XG59XG5zdHlsZXMucHVzaChzdHlsZSk7XG59XG5yZXR1cm4gc3R5bGVzO1xufSxcbl9lbGVtZW50QWRkOiBmdW5jdGlvbiAobm9kZSkge1xuaWYgKHRoaXMuX2VuY2Fwc3VsYXRlU3R5bGUpIHtcbmlmIChub2RlLl9fc3R5bGVTY29wZWQpIHtcbm5vZGUuX19zdHlsZVNjb3BlZCA9IGZhbHNlO1xufSBlbHNlIHtcbnN0eWxlVHJhbnNmb3JtZXIuZG9tKG5vZGUsIHRoaXMuaXMsIHRoaXMuX3Njb3BlQ3NzVmlhQXR0cik7XG59XG59XG59LFxuX2VsZW1lbnRSZW1vdmU6IGZ1bmN0aW9uIChub2RlKSB7XG5pZiAodGhpcy5fZW5jYXBzdWxhdGVTdHlsZSkge1xuc3R5bGVUcmFuc2Zvcm1lci5kb20obm9kZSwgdGhpcy5pcywgdGhpcy5fc2NvcGVDc3NWaWFBdHRyLCB0cnVlKTtcbn1cbn0sXG5zY29wZVN1YnRyZWU6IGZ1bmN0aW9uIChjb250YWluZXIsIHNob3VsZE9ic2VydmUpIHtcbmlmIChuYXRpdmVTaGFkb3cpIHtcbnJldHVybjtcbn1cbnZhciBzZWxmID0gdGhpcztcbnZhciBzY29waWZ5ID0gZnVuY3Rpb24gKG5vZGUpIHtcbmlmIChub2RlLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSkge1xubm9kZS5jbGFzc05hbWUgPSBzZWxmLl9zY29wZUVsZW1lbnRDbGFzcyhub2RlLCBub2RlLmNsYXNzTmFtZSk7XG52YXIgbiQgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJyonKTtcbkFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwobiQsIGZ1bmN0aW9uIChuKSB7XG5uLmNsYXNzTmFtZSA9IHNlbGYuX3Njb3BlRWxlbWVudENsYXNzKG4sIG4uY2xhc3NOYW1lKTtcbn0pO1xufVxufTtcbnNjb3BpZnkoY29udGFpbmVyKTtcbmlmIChzaG91bGRPYnNlcnZlKSB7XG52YXIgbW8gPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAobXhucykge1xubXhucy5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG5pZiAobS5hZGRlZE5vZGVzKSB7XG5mb3IgKHZhciBpID0gMDsgaSA8IG0uYWRkZWROb2Rlcy5sZW5ndGg7IGkrKykge1xuc2NvcGlmeShtLmFkZGVkTm9kZXNbaV0pO1xufVxufVxufSk7XG59KTtcbm1vLm9ic2VydmUoY29udGFpbmVyLCB7XG5jaGlsZExpc3Q6IHRydWUsXG5zdWJ0cmVlOiB0cnVlXG59KTtcbnJldHVybiBtbztcbn1cbn1cbn0pO1xufSgpKTtcblBvbHltZXIuU3R5bGVQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKCkge1xuJ3VzZSBzdHJpY3QnO1xudmFyIG5hdGl2ZVNoYWRvdyA9IFBvbHltZXIuU2V0dGluZ3MudXNlTmF0aXZlU2hhZG93O1xudmFyIG1hdGNoZXNTZWxlY3RvciA9IFBvbHltZXIuRG9tQXBpLm1hdGNoZXNTZWxlY3RvcjtcbnZhciBzdHlsZVV0aWwgPSBQb2x5bWVyLlN0eWxlVXRpbDtcbnZhciBzdHlsZVRyYW5zZm9ybWVyID0gUG9seW1lci5TdHlsZVRyYW5zZm9ybWVyO1xucmV0dXJuIHtcbmRlY29yYXRlU3R5bGVzOiBmdW5jdGlvbiAoc3R5bGVzKSB7XG52YXIgc2VsZiA9IHRoaXMsIHByb3BzID0ge307XG5zdHlsZVV0aWwuZm9yUnVsZXNJblN0eWxlcyhzdHlsZXMsIGZ1bmN0aW9uIChydWxlKSB7XG5zZWxmLmRlY29yYXRlUnVsZShydWxlKTtcbnNlbGYuY29sbGVjdFByb3BlcnRpZXNJbkNzc1RleHQocnVsZS5wcm9wZXJ0eUluZm8uY3NzVGV4dCwgcHJvcHMpO1xufSk7XG52YXIgbmFtZXMgPSBbXTtcbmZvciAodmFyIGkgaW4gcHJvcHMpIHtcbm5hbWVzLnB1c2goaSk7XG59XG5yZXR1cm4gbmFtZXM7XG59LFxuZGVjb3JhdGVSdWxlOiBmdW5jdGlvbiAocnVsZSkge1xuaWYgKHJ1bGUucHJvcGVydHlJbmZvKSB7XG5yZXR1cm4gcnVsZS5wcm9wZXJ0eUluZm87XG59XG52YXIgaW5mbyA9IHt9LCBwcm9wZXJ0aWVzID0ge307XG52YXIgaGFzUHJvcGVydGllcyA9IHRoaXMuY29sbGVjdFByb3BlcnRpZXMocnVsZSwgcHJvcGVydGllcyk7XG5pZiAoaGFzUHJvcGVydGllcykge1xuaW5mby5wcm9wZXJ0aWVzID0gcHJvcGVydGllcztcbnJ1bGUucnVsZXMgPSBudWxsO1xufVxuaW5mby5jc3NUZXh0ID0gdGhpcy5jb2xsZWN0Q3NzVGV4dChydWxlKTtcbnJ1bGUucHJvcGVydHlJbmZvID0gaW5mbztcbnJldHVybiBpbmZvO1xufSxcbmNvbGxlY3RQcm9wZXJ0aWVzOiBmdW5jdGlvbiAocnVsZSwgcHJvcGVydGllcykge1xudmFyIGluZm8gPSBydWxlLnByb3BlcnR5SW5mbztcbmlmIChpbmZvKSB7XG5pZiAoaW5mby5wcm9wZXJ0aWVzKSB7XG5Qb2x5bWVyLkJhc2UubWl4aW4ocHJvcGVydGllcywgaW5mby5wcm9wZXJ0aWVzKTtcbnJldHVybiB0cnVlO1xufVxufSBlbHNlIHtcbnZhciBtLCByeCA9IHRoaXMucnguVkFSX0FTU0lHTjtcbnZhciBjc3NUZXh0ID0gcnVsZS5wYXJzZWRDc3NUZXh0O1xudmFyIGFueTtcbndoaWxlIChtID0gcnguZXhlYyhjc3NUZXh0KSkge1xucHJvcGVydGllc1ttWzFdXSA9IChtWzJdIHx8IG1bM10pLnRyaW0oKTtcbmFueSA9IHRydWU7XG59XG5yZXR1cm4gYW55O1xufVxufSxcbmNvbGxlY3RDc3NUZXh0OiBmdW5jdGlvbiAocnVsZSkge1xudmFyIGN1c3RvbUNzc1RleHQgPSAnJztcbnZhciBjc3NUZXh0ID0gcnVsZS5wYXJzZWRDc3NUZXh0O1xuY3NzVGV4dCA9IGNzc1RleHQucmVwbGFjZSh0aGlzLnJ4LkJSQUNLRVRFRCwgJycpLnJlcGxhY2UodGhpcy5yeC5WQVJfQVNTSUdOLCAnJyk7XG52YXIgcGFydHMgPSBjc3NUZXh0LnNwbGl0KCc7Jyk7XG5mb3IgKHZhciBpID0gMCwgcDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG5wID0gcGFydHNbaV07XG5pZiAocC5tYXRjaCh0aGlzLnJ4Lk1JWElOX01BVENIKSB8fCBwLm1hdGNoKHRoaXMucnguVkFSX01BVENIKSkge1xuY3VzdG9tQ3NzVGV4dCArPSBwICsgJztcXG4nO1xufVxufVxucmV0dXJuIGN1c3RvbUNzc1RleHQ7XG59LFxuY29sbGVjdFByb3BlcnRpZXNJbkNzc1RleHQ6IGZ1bmN0aW9uIChjc3NUZXh0LCBwcm9wcykge1xudmFyIG07XG53aGlsZSAobSA9IHRoaXMucnguVkFSX0NBUFRVUkUuZXhlYyhjc3NUZXh0KSkge1xucHJvcHNbbVsxXV0gPSB0cnVlO1xudmFyIGRlZiA9IG1bMl07XG5pZiAoZGVmICYmIGRlZi5tYXRjaCh0aGlzLnJ4LklTX1ZBUikpIHtcbnByb3BzW2RlZl0gPSB0cnVlO1xufVxufVxufSxcbnJlaWZ5OiBmdW5jdGlvbiAocHJvcHMpIHtcbnZhciBuYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHByb3BzKTtcbmZvciAodmFyIGkgPSAwLCBuOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcbm4gPSBuYW1lc1tpXTtcbnByb3BzW25dID0gdGhpcy52YWx1ZUZvclByb3BlcnR5KHByb3BzW25dLCBwcm9wcyk7XG59XG59LFxudmFsdWVGb3JQcm9wZXJ0eTogZnVuY3Rpb24gKHByb3BlcnR5LCBwcm9wcykge1xuaWYgKHByb3BlcnR5KSB7XG5pZiAocHJvcGVydHkuaW5kZXhPZignOycpID49IDApIHtcbnByb3BlcnR5ID0gdGhpcy52YWx1ZUZvclByb3BlcnRpZXMocHJvcGVydHksIHByb3BzKTtcbn0gZWxzZSB7XG52YXIgc2VsZiA9IHRoaXM7XG52YXIgZm4gPSBmdW5jdGlvbiAoYWxsLCBwcmVmaXgsIHZhbHVlLCBmYWxsYmFjaykge1xudmFyIHByb3BlcnR5VmFsdWUgPSBzZWxmLnZhbHVlRm9yUHJvcGVydHkocHJvcHNbdmFsdWVdLCBwcm9wcykgfHwgKHByb3BzW2ZhbGxiYWNrXSA/IHNlbGYudmFsdWVGb3JQcm9wZXJ0eShwcm9wc1tmYWxsYmFja10sIHByb3BzKSA6IGZhbGxiYWNrKTtcbnJldHVybiBwcmVmaXggKyAocHJvcGVydHlWYWx1ZSB8fCAnJyk7XG59O1xucHJvcGVydHkgPSBwcm9wZXJ0eS5yZXBsYWNlKHRoaXMucnguVkFSX01BVENILCBmbik7XG59XG59XG5yZXR1cm4gcHJvcGVydHkgJiYgcHJvcGVydHkudHJpbSgpIHx8ICcnO1xufSxcbnZhbHVlRm9yUHJvcGVydGllczogZnVuY3Rpb24gKHByb3BlcnR5LCBwcm9wcykge1xudmFyIHBhcnRzID0gcHJvcGVydHkuc3BsaXQoJzsnKTtcbmZvciAodmFyIGkgPSAwLCBwLCBtOyBpIDwgcGFydHMubGVuZ3RoICYmIChwID0gcGFydHNbaV0pOyBpKyspIHtcbm0gPSBwLm1hdGNoKHRoaXMucnguTUlYSU5fTUFUQ0gpO1xuaWYgKG0pIHtcbnAgPSB0aGlzLnZhbHVlRm9yUHJvcGVydHkocHJvcHNbbVsxXV0sIHByb3BzKTtcbn0gZWxzZSB7XG52YXIgcHAgPSBwLnNwbGl0KCc6Jyk7XG5pZiAocHBbMV0pIHtcbnBwWzFdID0gcHBbMV0udHJpbSgpO1xucHBbMV0gPSB0aGlzLnZhbHVlRm9yUHJvcGVydHkocHBbMV0sIHByb3BzKSB8fCBwcFsxXTtcbn1cbnAgPSBwcC5qb2luKCc6Jyk7XG59XG5wYXJ0c1tpXSA9IHAgJiYgcC5sYXN0SW5kZXhPZignOycpID09PSBwLmxlbmd0aCAtIDEgPyBwLnNsaWNlKDAsIC0xKSA6IHAgfHwgJyc7XG59XG5yZXR1cm4gcGFydHMuam9pbignOycpO1xufSxcbmFwcGx5UHJvcGVydGllczogZnVuY3Rpb24gKHJ1bGUsIHByb3BzKSB7XG52YXIgb3V0cHV0ID0gJyc7XG5pZiAoIXJ1bGUucHJvcGVydHlJbmZvKSB7XG50aGlzLmRlY29yYXRlUnVsZShydWxlKTtcbn1cbmlmIChydWxlLnByb3BlcnR5SW5mby5jc3NUZXh0KSB7XG5vdXRwdXQgPSB0aGlzLnZhbHVlRm9yUHJvcGVydGllcyhydWxlLnByb3BlcnR5SW5mby5jc3NUZXh0LCBwcm9wcyk7XG59XG5ydWxlLmNzc1RleHQgPSBvdXRwdXQ7XG59LFxucHJvcGVydHlEYXRhRnJvbVN0eWxlczogZnVuY3Rpb24gKHN0eWxlcywgZWxlbWVudCkge1xudmFyIHByb3BzID0ge30sIHNlbGYgPSB0aGlzO1xudmFyIG8gPSBbXSwgaSA9IDA7XG5zdHlsZVV0aWwuZm9yUnVsZXNJblN0eWxlcyhzdHlsZXMsIGZ1bmN0aW9uIChydWxlKSB7XG5pZiAoIXJ1bGUucHJvcGVydHlJbmZvKSB7XG5zZWxmLmRlY29yYXRlUnVsZShydWxlKTtcbn1cbmlmIChlbGVtZW50ICYmIHJ1bGUucHJvcGVydHlJbmZvLnByb3BlcnRpZXMgJiYgbWF0Y2hlc1NlbGVjdG9yLmNhbGwoZWxlbWVudCwgcnVsZS5zZWxlY3RvcikpIHtcbnNlbGYuY29sbGVjdFByb3BlcnRpZXMocnVsZSwgcHJvcHMpO1xuYWRkVG9CaXRNYXNrKGksIG8pO1xufVxuaSsrO1xufSk7XG5yZXR1cm4ge1xucHJvcGVydGllczogcHJvcHMsXG5rZXk6IG9cbn07XG59LFxuc2NvcGVQcm9wZXJ0aWVzRnJvbVN0eWxlczogZnVuY3Rpb24gKHN0eWxlcykge1xuaWYgKCFzdHlsZXMuX3Njb3BlU3R5bGVQcm9wZXJ0aWVzKSB7XG5zdHlsZXMuX3Njb3BlU3R5bGVQcm9wZXJ0aWVzID0gdGhpcy5zZWxlY3RlZFByb3BlcnRpZXNGcm9tU3R5bGVzKHN0eWxlcywgdGhpcy5TQ09QRV9TRUxFQ1RPUlMpO1xufVxucmV0dXJuIHN0eWxlcy5fc2NvcGVTdHlsZVByb3BlcnRpZXM7XG59LFxuaG9zdFByb3BlcnRpZXNGcm9tU3R5bGVzOiBmdW5jdGlvbiAoc3R5bGVzKSB7XG5pZiAoIXN0eWxlcy5faG9zdFN0eWxlUHJvcGVydGllcykge1xuc3R5bGVzLl9ob3N0U3R5bGVQcm9wZXJ0aWVzID0gdGhpcy5zZWxlY3RlZFByb3BlcnRpZXNGcm9tU3R5bGVzKHN0eWxlcywgdGhpcy5IT1NUX1NFTEVDVE9SUyk7XG59XG5yZXR1cm4gc3R5bGVzLl9ob3N0U3R5bGVQcm9wZXJ0aWVzO1xufSxcbnNlbGVjdGVkUHJvcGVydGllc0Zyb21TdHlsZXM6IGZ1bmN0aW9uIChzdHlsZXMsIHNlbGVjdG9ycykge1xudmFyIHByb3BzID0ge30sIHNlbGYgPSB0aGlzO1xuc3R5bGVVdGlsLmZvclJ1bGVzSW5TdHlsZXMoc3R5bGVzLCBmdW5jdGlvbiAocnVsZSkge1xuaWYgKCFydWxlLnByb3BlcnR5SW5mbykge1xuc2VsZi5kZWNvcmF0ZVJ1bGUocnVsZSk7XG59XG5mb3IgKHZhciBpID0gMDsgaSA8IHNlbGVjdG9ycy5sZW5ndGg7IGkrKykge1xuaWYgKHJ1bGUucGFyc2VkU2VsZWN0b3IgPT09IHNlbGVjdG9yc1tpXSkge1xuc2VsZi5jb2xsZWN0UHJvcGVydGllcyhydWxlLCBwcm9wcyk7XG5yZXR1cm47XG59XG59XG59KTtcbnJldHVybiBwcm9wcztcbn0sXG50cmFuc2Zvcm1TdHlsZXM6IGZ1bmN0aW9uIChlbGVtZW50LCBwcm9wZXJ0aWVzLCBzY29wZVNlbGVjdG9yKSB7XG52YXIgc2VsZiA9IHRoaXM7XG52YXIgaG9zdFNlbGVjdG9yID0gc3R5bGVUcmFuc2Zvcm1lci5fY2FsY0hvc3RTY29wZShlbGVtZW50LmlzLCBlbGVtZW50LmV4dGVuZHMpO1xudmFyIHJ4SG9zdFNlbGVjdG9yID0gZWxlbWVudC5leHRlbmRzID8gJ1xcXFwnICsgaG9zdFNlbGVjdG9yLnNsaWNlKDAsIC0xKSArICdcXFxcXScgOiBob3N0U2VsZWN0b3I7XG52YXIgaG9zdFJ4ID0gbmV3IFJlZ0V4cCh0aGlzLnJ4LkhPU1RfUFJFRklYICsgcnhIb3N0U2VsZWN0b3IgKyB0aGlzLnJ4LkhPU1RfU1VGRklYKTtcbnJldHVybiBzdHlsZVRyYW5zZm9ybWVyLmVsZW1lbnRTdHlsZXMoZWxlbWVudCwgZnVuY3Rpb24gKHJ1bGUpIHtcbnNlbGYuYXBwbHlQcm9wZXJ0aWVzKHJ1bGUsIHByb3BlcnRpZXMpO1xuaWYgKHJ1bGUuY3NzVGV4dCAmJiAhbmF0aXZlU2hhZG93KSB7XG5zZWxmLl9zY29wZVNlbGVjdG9yKHJ1bGUsIGhvc3RSeCwgaG9zdFNlbGVjdG9yLCBlbGVtZW50Ll9zY29wZUNzc1ZpYUF0dHIsIHNjb3BlU2VsZWN0b3IpO1xufVxufSk7XG59LFxuX3Njb3BlU2VsZWN0b3I6IGZ1bmN0aW9uIChydWxlLCBob3N0UngsIGhvc3RTZWxlY3RvciwgdmlhQXR0ciwgc2NvcGVJZCkge1xucnVsZS50cmFuc2Zvcm1lZFNlbGVjdG9yID0gcnVsZS50cmFuc2Zvcm1lZFNlbGVjdG9yIHx8IHJ1bGUuc2VsZWN0b3I7XG52YXIgc2VsZWN0b3IgPSBydWxlLnRyYW5zZm9ybWVkU2VsZWN0b3I7XG52YXIgc2NvcGUgPSB2aWFBdHRyID8gJ1snICsgc3R5bGVUcmFuc2Zvcm1lci5TQ09QRV9OQU1FICsgJ349JyArIHNjb3BlSWQgKyAnXScgOiAnLicgKyBzY29wZUlkO1xudmFyIHBhcnRzID0gc2VsZWN0b3Iuc3BsaXQoJywnKTtcbmZvciAodmFyIGkgPSAwLCBsID0gcGFydHMubGVuZ3RoLCBwOyBpIDwgbCAmJiAocCA9IHBhcnRzW2ldKTsgaSsrKSB7XG5wYXJ0c1tpXSA9IHAubWF0Y2goaG9zdFJ4KSA/IHAucmVwbGFjZShob3N0U2VsZWN0b3IsIGhvc3RTZWxlY3RvciArIHNjb3BlKSA6IHNjb3BlICsgJyAnICsgcDtcbn1cbnJ1bGUuc2VsZWN0b3IgPSBwYXJ0cy5qb2luKCcsJyk7XG59LFxuYXBwbHlFbGVtZW50U2NvcGVTZWxlY3RvcjogZnVuY3Rpb24gKGVsZW1lbnQsIHNlbGVjdG9yLCBvbGQsIHZpYUF0dHIpIHtcbnZhciBjID0gdmlhQXR0ciA/IGVsZW1lbnQuZ2V0QXR0cmlidXRlKHN0eWxlVHJhbnNmb3JtZXIuU0NPUEVfTkFNRSkgOiBlbGVtZW50LmNsYXNzTmFtZTtcbnZhciB2ID0gb2xkID8gYy5yZXBsYWNlKG9sZCwgc2VsZWN0b3IpIDogKGMgPyBjICsgJyAnIDogJycpICsgdGhpcy5YU0NPUEVfTkFNRSArICcgJyArIHNlbGVjdG9yO1xuaWYgKGMgIT09IHYpIHtcbmlmICh2aWFBdHRyKSB7XG5lbGVtZW50LnNldEF0dHJpYnV0ZShzdHlsZVRyYW5zZm9ybWVyLlNDT1BFX05BTUUsIHYpO1xufSBlbHNlIHtcbmVsZW1lbnQuY2xhc3NOYW1lID0gdjtcbn1cbn1cbn0sXG5hcHBseUVsZW1lbnRTdHlsZTogZnVuY3Rpb24gKGVsZW1lbnQsIHByb3BlcnRpZXMsIHNlbGVjdG9yLCBzdHlsZSkge1xudmFyIGNzc1RleHQgPSBzdHlsZSA/IHN0eWxlLnRleHRDb250ZW50IHx8ICcnIDogdGhpcy50cmFuc2Zvcm1TdHlsZXMoZWxlbWVudCwgcHJvcGVydGllcywgc2VsZWN0b3IpO1xudmFyIHMgPSBlbGVtZW50Ll9jdXN0b21TdHlsZTtcbmlmIChzICYmICFuYXRpdmVTaGFkb3cgJiYgcyAhPT0gc3R5bGUpIHtcbnMuX3VzZUNvdW50LS07XG5pZiAocy5fdXNlQ291bnQgPD0gMCAmJiBzLnBhcmVudE5vZGUpIHtcbnMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzKTtcbn1cbn1cbmlmIChuYXRpdmVTaGFkb3cgfHwgKCFzdHlsZSB8fCAhc3R5bGUucGFyZW50Tm9kZSkpIHtcbmlmIChuYXRpdmVTaGFkb3cgJiYgZWxlbWVudC5fY3VzdG9tU3R5bGUpIHtcbmVsZW1lbnQuX2N1c3RvbVN0eWxlLnRleHRDb250ZW50ID0gY3NzVGV4dDtcbnN0eWxlID0gZWxlbWVudC5fY3VzdG9tU3R5bGU7XG59IGVsc2UgaWYgKGNzc1RleHQpIHtcbnN0eWxlID0gc3R5bGVVdGlsLmFwcGx5Q3NzKGNzc1RleHQsIHNlbGVjdG9yLCBuYXRpdmVTaGFkb3cgPyBlbGVtZW50LnJvb3QgOiBudWxsLCBlbGVtZW50Ll9zY29wZVN0eWxlKTtcbn1cbn1cbmlmIChzdHlsZSkge1xuc3R5bGUuX3VzZUNvdW50ID0gc3R5bGUuX3VzZUNvdW50IHx8IDA7XG5pZiAoZWxlbWVudC5fY3VzdG9tU3R5bGUgIT0gc3R5bGUpIHtcbnN0eWxlLl91c2VDb3VudCsrO1xufVxuZWxlbWVudC5fY3VzdG9tU3R5bGUgPSBzdHlsZTtcbn1cbnJldHVybiBzdHlsZTtcbn0sXG5taXhpbkN1c3RvbVN0eWxlOiBmdW5jdGlvbiAocHJvcHMsIGN1c3RvbVN0eWxlKSB7XG52YXIgdjtcbmZvciAodmFyIGkgaW4gY3VzdG9tU3R5bGUpIHtcbnYgPSBjdXN0b21TdHlsZVtpXTtcbmlmICh2IHx8IHYgPT09IDApIHtcbnByb3BzW2ldID0gdjtcbn1cbn1cbn0sXG5yeDoge1xuVkFSX0FTU0lHTjogLyg/Ol58WztcXG5dXFxzKikoLS1bXFx3LV0qPyk6XFxzKig/OihbXjt7XSopfHsoW159XSopfSkoPzooPz1bO1xcbl0pfCQpL2dpLFxuTUlYSU5fTUFUQ0g6IC8oPzpefFxcVyspQGFwcGx5W1xcc10qXFwoKFteKV0qKVxcKS9pLFxuVkFSX01BVENIOiAvKF58XFxXKyl2YXJcXChbXFxzXSooW14sKV0qKVtcXHNdKiw/W1xcc10qKCg/OlteLCldKil8KD86W147XSpcXChbXjspXSpcXCkpKVtcXHNdKj9cXCkvZ2ksXG5WQVJfQ0FQVFVSRTogL1xcKFtcXHNdKigtLVteLFxccyldKikoPzosW1xcc10qKC0tW14sXFxzKV0qKSk/KD86XFwpfCwpL2dpLFxuSVNfVkFSOiAvXi0tLyxcbkJSQUNLRVRFRDogL1xce1tefV0qXFx9L2csXG5IT1NUX1BSRUZJWDogJyg/Ol58W14uI1s6XSknLFxuSE9TVF9TVUZGSVg6ICcoJHxbLjpbXFxcXHM+K35dKSdcbn0sXG5IT1NUX1NFTEVDVE9SUzogWyc6aG9zdCddLFxuU0NPUEVfU0VMRUNUT1JTOiBbJzpyb290J10sXG5YU0NPUEVfTkFNRTogJ3gtc2NvcGUnXG59O1xuZnVuY3Rpb24gYWRkVG9CaXRNYXNrKG4sIGJpdHMpIHtcbnZhciBvID0gcGFyc2VJbnQobiAvIDMyKTtcbnZhciB2ID0gMSA8PCBuICUgMzI7XG5iaXRzW29dID0gKGJpdHNbb10gfHwgMCkgfCB2O1xufVxufSgpO1xuKGZ1bmN0aW9uICgpIHtcblBvbHltZXIuU3R5bGVDYWNoZSA9IGZ1bmN0aW9uICgpIHtcbnRoaXMuY2FjaGUgPSB7fTtcbn07XG5Qb2x5bWVyLlN0eWxlQ2FjaGUucHJvdG90eXBlID0ge1xuTUFYOiAxMDAsXG5zdG9yZTogZnVuY3Rpb24gKGlzLCBkYXRhLCBrZXlWYWx1ZXMsIGtleVN0eWxlcykge1xuZGF0YS5rZXlWYWx1ZXMgPSBrZXlWYWx1ZXM7XG5kYXRhLnN0eWxlcyA9IGtleVN0eWxlcztcbnZhciBzJCA9IHRoaXMuY2FjaGVbaXNdID0gdGhpcy5jYWNoZVtpc10gfHwgW107XG5zJC5wdXNoKGRhdGEpO1xuaWYgKHMkLmxlbmd0aCA+IHRoaXMuTUFYKSB7XG5zJC5zaGlmdCgpO1xufVxufSxcbnJldHJpZXZlOiBmdW5jdGlvbiAoaXMsIGtleVZhbHVlcywga2V5U3R5bGVzKSB7XG52YXIgY2FjaGUgPSB0aGlzLmNhY2hlW2lzXTtcbmlmIChjYWNoZSkge1xuZm9yICh2YXIgaSA9IGNhY2hlLmxlbmd0aCAtIDEsIGRhdGE7IGkgPj0gMDsgaS0tKSB7XG5kYXRhID0gY2FjaGVbaV07XG5pZiAoa2V5U3R5bGVzID09PSBkYXRhLnN0eWxlcyAmJiB0aGlzLl9vYmplY3RzRXF1YWwoa2V5VmFsdWVzLCBkYXRhLmtleVZhbHVlcykpIHtcbnJldHVybiBkYXRhO1xufVxufVxufVxufSxcbmNsZWFyOiBmdW5jdGlvbiAoKSB7XG50aGlzLmNhY2hlID0ge307XG59LFxuX29iamVjdHNFcXVhbDogZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG52YXIgdCwgcztcbmZvciAodmFyIGkgaW4gdGFyZ2V0KSB7XG50ID0gdGFyZ2V0W2ldLCBzID0gc291cmNlW2ldO1xuaWYgKCEodHlwZW9mIHQgPT09ICdvYmplY3QnICYmIHQgPyB0aGlzLl9vYmplY3RzU3RyaWN0bHlFcXVhbCh0LCBzKSA6IHQgPT09IHMpKSB7XG5yZXR1cm4gZmFsc2U7XG59XG59XG5pZiAoQXJyYXkuaXNBcnJheSh0YXJnZXQpKSB7XG5yZXR1cm4gdGFyZ2V0Lmxlbmd0aCA9PT0gc291cmNlLmxlbmd0aDtcbn1cbnJldHVybiB0cnVlO1xufSxcbl9vYmplY3RzU3RyaWN0bHlFcXVhbDogZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG5yZXR1cm4gdGhpcy5fb2JqZWN0c0VxdWFsKHRhcmdldCwgc291cmNlKSAmJiB0aGlzLl9vYmplY3RzRXF1YWwoc291cmNlLCB0YXJnZXQpO1xufVxufTtcbn0oKSk7XG5Qb2x5bWVyLlN0eWxlRGVmYXVsdHMgPSBmdW5jdGlvbiAoKSB7XG52YXIgc3R5bGVQcm9wZXJ0aWVzID0gUG9seW1lci5TdHlsZVByb3BlcnRpZXM7XG52YXIgc3R5bGVVdGlsID0gUG9seW1lci5TdHlsZVV0aWw7XG52YXIgU3R5bGVDYWNoZSA9IFBvbHltZXIuU3R5bGVDYWNoZTtcbnZhciBhcGkgPSB7XG5fc3R5bGVzOiBbXSxcbl9wcm9wZXJ0aWVzOiBudWxsLFxuY3VzdG9tU3R5bGU6IHt9LFxuX3N0eWxlQ2FjaGU6IG5ldyBTdHlsZUNhY2hlKCksXG5hZGRTdHlsZTogZnVuY3Rpb24gKHN0eWxlKSB7XG50aGlzLl9zdHlsZXMucHVzaChzdHlsZSk7XG50aGlzLl9wcm9wZXJ0aWVzID0gbnVsbDtcbn0sXG5nZXQgX3N0eWxlUHJvcGVydGllcygpIHtcbmlmICghdGhpcy5fcHJvcGVydGllcykge1xuc3R5bGVQcm9wZXJ0aWVzLmRlY29yYXRlU3R5bGVzKHRoaXMuX3N0eWxlcyk7XG50aGlzLl9zdHlsZXMuX3Njb3BlU3R5bGVQcm9wZXJ0aWVzID0gbnVsbDtcbnRoaXMuX3Byb3BlcnRpZXMgPSBzdHlsZVByb3BlcnRpZXMuc2NvcGVQcm9wZXJ0aWVzRnJvbVN0eWxlcyh0aGlzLl9zdHlsZXMpO1xuc3R5bGVQcm9wZXJ0aWVzLm1peGluQ3VzdG9tU3R5bGUodGhpcy5fcHJvcGVydGllcywgdGhpcy5jdXN0b21TdHlsZSk7XG5zdHlsZVByb3BlcnRpZXMucmVpZnkodGhpcy5fcHJvcGVydGllcyk7XG59XG5yZXR1cm4gdGhpcy5fcHJvcGVydGllcztcbn0sXG5fbmVlZHNTdHlsZVByb3BlcnRpZXM6IGZ1bmN0aW9uICgpIHtcbn0sXG5fY29tcHV0ZVN0eWxlUHJvcGVydGllczogZnVuY3Rpb24gKCkge1xucmV0dXJuIHRoaXMuX3N0eWxlUHJvcGVydGllcztcbn0sXG51cGRhdGVTdHlsZXM6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG50aGlzLl9wcm9wZXJ0aWVzID0gbnVsbDtcbmlmIChwcm9wZXJ0aWVzKSB7XG5Qb2x5bWVyLkJhc2UubWl4aW4odGhpcy5jdXN0b21TdHlsZSwgcHJvcGVydGllcyk7XG59XG50aGlzLl9zdHlsZUNhY2hlLmNsZWFyKCk7XG5mb3IgKHZhciBpID0gMCwgczsgaSA8IHRoaXMuX3N0eWxlcy5sZW5ndGg7IGkrKykge1xucyA9IHRoaXMuX3N0eWxlc1tpXTtcbnMgPSBzLl9faW1wb3J0RWxlbWVudCB8fCBzO1xucy5fYXBwbHkoKTtcbn1cbn1cbn07XG5yZXR1cm4gYXBpO1xufSgpO1xuKGZ1bmN0aW9uICgpIHtcbid1c2Ugc3RyaWN0JztcbnZhciBzZXJpYWxpemVWYWx1ZVRvQXR0cmlidXRlID0gUG9seW1lci5CYXNlLnNlcmlhbGl6ZVZhbHVlVG9BdHRyaWJ1dGU7XG52YXIgcHJvcGVydHlVdGlscyA9IFBvbHltZXIuU3R5bGVQcm9wZXJ0aWVzO1xudmFyIHN0eWxlVHJhbnNmb3JtZXIgPSBQb2x5bWVyLlN0eWxlVHJhbnNmb3JtZXI7XG52YXIgc3R5bGVVdGlsID0gUG9seW1lci5TdHlsZVV0aWw7XG52YXIgc3R5bGVEZWZhdWx0cyA9IFBvbHltZXIuU3R5bGVEZWZhdWx0cztcbnZhciBuYXRpdmVTaGFkb3cgPSBQb2x5bWVyLlNldHRpbmdzLnVzZU5hdGl2ZVNoYWRvdztcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5fcHJlcFN0eWxlUHJvcGVydGllczogZnVuY3Rpb24gKCkge1xudGhpcy5fb3duU3R5bGVQcm9wZXJ0eU5hbWVzID0gdGhpcy5fc3R5bGVzID8gcHJvcGVydHlVdGlscy5kZWNvcmF0ZVN0eWxlcyh0aGlzLl9zdHlsZXMpIDogW107XG59LFxuX3NldHVwU3R5bGVQcm9wZXJ0aWVzOiBmdW5jdGlvbiAoKSB7XG50aGlzLmN1c3RvbVN0eWxlID0ge307XG59LFxuX25lZWRzU3R5bGVQcm9wZXJ0aWVzOiBmdW5jdGlvbiAoKSB7XG5yZXR1cm4gQm9vbGVhbih0aGlzLl9vd25TdHlsZVByb3BlcnR5TmFtZXMgJiYgdGhpcy5fb3duU3R5bGVQcm9wZXJ0eU5hbWVzLmxlbmd0aCk7XG59LFxuX2JlZm9yZUF0dGFjaGVkOiBmdW5jdGlvbiAoKSB7XG5pZiAoIXRoaXMuX3Njb3BlU2VsZWN0b3IgJiYgdGhpcy5fbmVlZHNTdHlsZVByb3BlcnRpZXMoKSkge1xudGhpcy5fdXBkYXRlU3R5bGVQcm9wZXJ0aWVzKCk7XG59XG59LFxuX3VwZGF0ZVN0eWxlUHJvcGVydGllczogZnVuY3Rpb24gKCkge1xudmFyIGluZm8sIHNjb3BlID0gdGhpcy5kb21Ib3N0IHx8IHN0eWxlRGVmYXVsdHM7XG5pZiAoIXNjb3BlLl9zdHlsZUNhY2hlKSB7XG5zY29wZS5fc3R5bGVDYWNoZSA9IG5ldyBQb2x5bWVyLlN0eWxlQ2FjaGUoKTtcbn1cbnZhciBzY29wZURhdGEgPSBwcm9wZXJ0eVV0aWxzLnByb3BlcnR5RGF0YUZyb21TdHlsZXMoc2NvcGUuX3N0eWxlcywgdGhpcyk7XG5zY29wZURhdGEua2V5LmN1c3RvbVN0eWxlID0gdGhpcy5jdXN0b21TdHlsZTtcbmluZm8gPSBzY29wZS5fc3R5bGVDYWNoZS5yZXRyaWV2ZSh0aGlzLmlzLCBzY29wZURhdGEua2V5LCB0aGlzLl9zdHlsZXMpO1xudmFyIHNjb3BlQ2FjaGVkID0gQm9vbGVhbihpbmZvKTtcbmlmIChzY29wZUNhY2hlZCkge1xudGhpcy5fc3R5bGVQcm9wZXJ0aWVzID0gaW5mby5fc3R5bGVQcm9wZXJ0aWVzO1xufSBlbHNlIHtcbnRoaXMuX2NvbXB1dGVTdHlsZVByb3BlcnRpZXMoc2NvcGVEYXRhLnByb3BlcnRpZXMpO1xufVxudGhpcy5fY29tcHV0ZU93blN0eWxlUHJvcGVydGllcygpO1xuaWYgKCFzY29wZUNhY2hlZCkge1xuaW5mbyA9IHN0eWxlQ2FjaGUucmV0cmlldmUodGhpcy5pcywgdGhpcy5fb3duU3R5bGVQcm9wZXJ0aWVzLCB0aGlzLl9zdHlsZXMpO1xufVxudmFyIGdsb2JhbENhY2hlZCA9IEJvb2xlYW4oaW5mbykgJiYgIXNjb3BlQ2FjaGVkO1xudmFyIHN0eWxlID0gdGhpcy5fYXBwbHlTdHlsZVByb3BlcnRpZXMoaW5mbyk7XG5pZiAoIXNjb3BlQ2FjaGVkKSB7XG5zdHlsZSA9IHN0eWxlICYmIG5hdGl2ZVNoYWRvdyA/IHN0eWxlLmNsb25lTm9kZSh0cnVlKSA6IHN0eWxlO1xuaW5mbyA9IHtcbnN0eWxlOiBzdHlsZSxcbl9zY29wZVNlbGVjdG9yOiB0aGlzLl9zY29wZVNlbGVjdG9yLFxuX3N0eWxlUHJvcGVydGllczogdGhpcy5fc3R5bGVQcm9wZXJ0aWVzXG59O1xuc2NvcGVEYXRhLmtleS5jdXN0b21TdHlsZSA9IHt9O1xudGhpcy5taXhpbihzY29wZURhdGEua2V5LmN1c3RvbVN0eWxlLCB0aGlzLmN1c3RvbVN0eWxlKTtcbnNjb3BlLl9zdHlsZUNhY2hlLnN0b3JlKHRoaXMuaXMsIGluZm8sIHNjb3BlRGF0YS5rZXksIHRoaXMuX3N0eWxlcyk7XG5pZiAoIWdsb2JhbENhY2hlZCkge1xuc3R5bGVDYWNoZS5zdG9yZSh0aGlzLmlzLCBPYmplY3QuY3JlYXRlKGluZm8pLCB0aGlzLl9vd25TdHlsZVByb3BlcnRpZXMsIHRoaXMuX3N0eWxlcyk7XG59XG59XG59LFxuX2NvbXB1dGVTdHlsZVByb3BlcnRpZXM6IGZ1bmN0aW9uIChzY29wZVByb3BzKSB7XG52YXIgc2NvcGUgPSB0aGlzLmRvbUhvc3QgfHwgc3R5bGVEZWZhdWx0cztcbmlmICghc2NvcGUuX3N0eWxlUHJvcGVydGllcykge1xuc2NvcGUuX2NvbXB1dGVTdHlsZVByb3BlcnRpZXMoKTtcbn1cbnZhciBwcm9wcyA9IE9iamVjdC5jcmVhdGUoc2NvcGUuX3N0eWxlUHJvcGVydGllcyk7XG50aGlzLm1peGluKHByb3BzLCBwcm9wZXJ0eVV0aWxzLmhvc3RQcm9wZXJ0aWVzRnJvbVN0eWxlcyh0aGlzLl9zdHlsZXMpKTtcbnNjb3BlUHJvcHMgPSBzY29wZVByb3BzIHx8IHByb3BlcnR5VXRpbHMucHJvcGVydHlEYXRhRnJvbVN0eWxlcyhzY29wZS5fc3R5bGVzLCB0aGlzKS5wcm9wZXJ0aWVzO1xudGhpcy5taXhpbihwcm9wcywgc2NvcGVQcm9wcyk7XG50aGlzLm1peGluKHByb3BzLCBwcm9wZXJ0eVV0aWxzLnNjb3BlUHJvcGVydGllc0Zyb21TdHlsZXModGhpcy5fc3R5bGVzKSk7XG5wcm9wZXJ0eVV0aWxzLm1peGluQ3VzdG9tU3R5bGUocHJvcHMsIHRoaXMuY3VzdG9tU3R5bGUpO1xucHJvcGVydHlVdGlscy5yZWlmeShwcm9wcyk7XG50aGlzLl9zdHlsZVByb3BlcnRpZXMgPSBwcm9wcztcbn0sXG5fY29tcHV0ZU93blN0eWxlUHJvcGVydGllczogZnVuY3Rpb24gKCkge1xudmFyIHByb3BzID0ge307XG5mb3IgKHZhciBpID0gMCwgbjsgaSA8IHRoaXMuX293blN0eWxlUHJvcGVydHlOYW1lcy5sZW5ndGg7IGkrKykge1xubiA9IHRoaXMuX293blN0eWxlUHJvcGVydHlOYW1lc1tpXTtcbnByb3BzW25dID0gdGhpcy5fc3R5bGVQcm9wZXJ0aWVzW25dO1xufVxudGhpcy5fb3duU3R5bGVQcm9wZXJ0aWVzID0gcHJvcHM7XG59LFxuX3Njb3BlQ291bnQ6IDAsXG5fYXBwbHlTdHlsZVByb3BlcnRpZXM6IGZ1bmN0aW9uIChpbmZvKSB7XG52YXIgb2xkU2NvcGVTZWxlY3RvciA9IHRoaXMuX3Njb3BlU2VsZWN0b3I7XG50aGlzLl9zY29wZVNlbGVjdG9yID0gaW5mbyA/IGluZm8uX3Njb3BlU2VsZWN0b3IgOiB0aGlzLmlzICsgJy0nICsgdGhpcy5fX3Byb3RvX18uX3Njb3BlQ291bnQrKztcbnZhciBzdHlsZSA9IHByb3BlcnR5VXRpbHMuYXBwbHlFbGVtZW50U3R5bGUodGhpcywgdGhpcy5fc3R5bGVQcm9wZXJ0aWVzLCB0aGlzLl9zY29wZVNlbGVjdG9yLCBpbmZvICYmIGluZm8uc3R5bGUpO1xuaWYgKCFuYXRpdmVTaGFkb3cpIHtcbnByb3BlcnR5VXRpbHMuYXBwbHlFbGVtZW50U2NvcGVTZWxlY3Rvcih0aGlzLCB0aGlzLl9zY29wZVNlbGVjdG9yLCBvbGRTY29wZVNlbGVjdG9yLCB0aGlzLl9zY29wZUNzc1ZpYUF0dHIpO1xufVxucmV0dXJuIHN0eWxlO1xufSxcbnNlcmlhbGl6ZVZhbHVlVG9BdHRyaWJ1dGU6IGZ1bmN0aW9uICh2YWx1ZSwgYXR0cmlidXRlLCBub2RlKSB7XG5ub2RlID0gbm9kZSB8fCB0aGlzO1xuaWYgKGF0dHJpYnV0ZSA9PT0gJ2NsYXNzJykge1xudmFyIGhvc3QgPSBub2RlID09PSB0aGlzID8gdGhpcy5kb21Ib3N0IHx8IHRoaXMuZGF0YUhvc3QgOiB0aGlzO1xuaWYgKGhvc3QpIHtcbnZhbHVlID0gaG9zdC5fc2NvcGVFbGVtZW50Q2xhc3Mobm9kZSwgdmFsdWUpO1xufVxufVxubm9kZSA9IFBvbHltZXIuZG9tKG5vZGUpO1xuc2VyaWFsaXplVmFsdWVUb0F0dHJpYnV0ZS5jYWxsKHRoaXMsIHZhbHVlLCBhdHRyaWJ1dGUsIG5vZGUpO1xufSxcbl9zY29wZUVsZW1lbnRDbGFzczogZnVuY3Rpb24gKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG5pZiAoIW5hdGl2ZVNoYWRvdyAmJiAhdGhpcy5fc2NvcGVDc3NWaWFBdHRyKSB7XG5zZWxlY3RvciArPSAoc2VsZWN0b3IgPyAnICcgOiAnJykgKyBTQ09QRV9OQU1FICsgJyAnICsgdGhpcy5pcyArIChlbGVtZW50Ll9zY29wZVNlbGVjdG9yID8gJyAnICsgWFNDT1BFX05BTUUgKyAnICcgKyBlbGVtZW50Ll9zY29wZVNlbGVjdG9yIDogJycpO1xufVxucmV0dXJuIHNlbGVjdG9yO1xufSxcbnVwZGF0ZVN0eWxlczogZnVuY3Rpb24gKHByb3BlcnRpZXMpIHtcbmlmICh0aGlzLmlzQXR0YWNoZWQpIHtcbmlmIChwcm9wZXJ0aWVzKSB7XG50aGlzLm1peGluKHRoaXMuY3VzdG9tU3R5bGUsIHByb3BlcnRpZXMpO1xufVxuaWYgKHRoaXMuX25lZWRzU3R5bGVQcm9wZXJ0aWVzKCkpIHtcbnRoaXMuX3VwZGF0ZVN0eWxlUHJvcGVydGllcygpO1xufSBlbHNlIHtcbnRoaXMuX3N0eWxlUHJvcGVydGllcyA9IG51bGw7XG59XG5pZiAodGhpcy5fc3R5bGVDYWNoZSkge1xudGhpcy5fc3R5bGVDYWNoZS5jbGVhcigpO1xufVxudGhpcy5fdXBkYXRlUm9vdFN0eWxlcygpO1xufVxufSxcbl91cGRhdGVSb290U3R5bGVzOiBmdW5jdGlvbiAocm9vdCkge1xucm9vdCA9IHJvb3QgfHwgdGhpcy5yb290O1xudmFyIGMkID0gUG9seW1lci5kb20ocm9vdCkuX3F1ZXJ5KGZ1bmN0aW9uIChlKSB7XG5yZXR1cm4gZS5zaGFkeVJvb3QgfHwgZS5zaGFkb3dSb290O1xufSk7XG5mb3IgKHZhciBpID0gMCwgbCA9IGMkLmxlbmd0aCwgYzsgaSA8IGwgJiYgKGMgPSBjJFtpXSk7IGkrKykge1xuaWYgKGMudXBkYXRlU3R5bGVzKSB7XG5jLnVwZGF0ZVN0eWxlcygpO1xufVxufVxufVxufSk7XG5Qb2x5bWVyLnVwZGF0ZVN0eWxlcyA9IGZ1bmN0aW9uIChwcm9wZXJ0aWVzKSB7XG5zdHlsZURlZmF1bHRzLnVwZGF0ZVN0eWxlcyhwcm9wZXJ0aWVzKTtcblBvbHltZXIuQmFzZS5fdXBkYXRlUm9vdFN0eWxlcyhkb2N1bWVudCk7XG59O1xudmFyIHN0eWxlQ2FjaGUgPSBuZXcgUG9seW1lci5TdHlsZUNhY2hlKCk7XG5Qb2x5bWVyLmN1c3RvbVN0eWxlQ2FjaGUgPSBzdHlsZUNhY2hlO1xudmFyIFNDT1BFX05BTUUgPSBzdHlsZVRyYW5zZm9ybWVyLlNDT1BFX05BTUU7XG52YXIgWFNDT1BFX05BTUUgPSBwcm9wZXJ0eVV0aWxzLlhTQ09QRV9OQU1FO1xufSgpKTtcblBvbHltZXIuQmFzZS5fYWRkRmVhdHVyZSh7XG5fcmVnaXN0ZXJGZWF0dXJlczogZnVuY3Rpb24gKCkge1xudGhpcy5fcHJlcElzKCk7XG50aGlzLl9wcmVwQXR0cmlidXRlcygpO1xudGhpcy5fcHJlcEV4dGVuZHMoKTtcbnRoaXMuX3ByZXBDb25zdHJ1Y3RvcigpO1xudGhpcy5fcHJlcFRlbXBsYXRlKCk7XG50aGlzLl9wcmVwU3R5bGVzKCk7XG50aGlzLl9wcmVwU3R5bGVQcm9wZXJ0aWVzKCk7XG50aGlzLl9wcmVwQW5ub3RhdGlvbnMoKTtcbnRoaXMuX3ByZXBFZmZlY3RzKCk7XG50aGlzLl9wcmVwQmVoYXZpb3JzKCk7XG50aGlzLl9wcmVwQmluZGluZ3MoKTtcbnRoaXMuX3ByZXBTaGFkeSgpO1xufSxcbl9wcmVwQmVoYXZpb3I6IGZ1bmN0aW9uIChiKSB7XG50aGlzLl9hZGRQcm9wZXJ0eUVmZmVjdHMoYi5wcm9wZXJ0aWVzKTtcbnRoaXMuX2FkZENvbXBsZXhPYnNlcnZlckVmZmVjdHMoYi5vYnNlcnZlcnMpO1xudGhpcy5fYWRkSG9zdEF0dHJpYnV0ZXMoYi5ob3N0QXR0cmlidXRlcyk7XG59LFxuX2luaXRGZWF0dXJlczogZnVuY3Rpb24gKCkge1xudGhpcy5fcG9vbENvbnRlbnQoKTtcbnRoaXMuX3NldHVwQ29uZmlndXJlKCk7XG50aGlzLl9zZXR1cFN0eWxlUHJvcGVydGllcygpO1xudGhpcy5fcHVzaEhvc3QoKTtcbnRoaXMuX3N0YW1wVGVtcGxhdGUoKTtcbnRoaXMuX3BvcEhvc3QoKTtcbnRoaXMuX21hcnNoYWxBbm5vdGF0aW9uUmVmZXJlbmNlcygpO1xudGhpcy5fbWFyc2hhbEhvc3RBdHRyaWJ1dGVzKCk7XG50aGlzLl9zZXR1cERlYm91bmNlcnMoKTtcbnRoaXMuX21hcnNoYWxJbnN0YW5jZUVmZmVjdHMoKTtcbnRoaXMuX21hcnNoYWxCZWhhdmlvcnMoKTtcbnRoaXMuX21hcnNoYWxBdHRyaWJ1dGVzKCk7XG50aGlzLl90cnlSZWFkeSgpO1xufSxcbl9tYXJzaGFsQmVoYXZpb3I6IGZ1bmN0aW9uIChiKSB7XG50aGlzLl9saXN0ZW5MaXN0ZW5lcnMoYi5saXN0ZW5lcnMpO1xufVxufSk7XG4oZnVuY3Rpb24gKCkge1xudmFyIG5hdGl2ZVNoYWRvdyA9IFBvbHltZXIuU2V0dGluZ3MudXNlTmF0aXZlU2hhZG93O1xudmFyIHByb3BlcnR5VXRpbHMgPSBQb2x5bWVyLlN0eWxlUHJvcGVydGllcztcbnZhciBzdHlsZVV0aWwgPSBQb2x5bWVyLlN0eWxlVXRpbDtcbnZhciBzdHlsZURlZmF1bHRzID0gUG9seW1lci5TdHlsZURlZmF1bHRzO1xudmFyIHN0eWxlVHJhbnNmb3JtZXIgPSBQb2x5bWVyLlN0eWxlVHJhbnNmb3JtZXI7XG5Qb2x5bWVyKHtcbmlzOiAnY3VzdG9tLXN0eWxlJyxcbmV4dGVuZHM6ICdzdHlsZScsXG5jcmVhdGVkOiBmdW5jdGlvbiAoKSB7XG50aGlzLl90cnlBcHBseSgpO1xufSxcbmF0dGFjaGVkOiBmdW5jdGlvbiAoKSB7XG50aGlzLl90cnlBcHBseSgpO1xufSxcbl90cnlBcHBseTogZnVuY3Rpb24gKCkge1xuaWYgKCF0aGlzLl9hcHBsaWVzVG9Eb2N1bWVudCkge1xuaWYgKHRoaXMucGFyZW50Tm9kZSAmJiB0aGlzLnBhcmVudE5vZGUubG9jYWxOYW1lICE9PSAnZG9tLW1vZHVsZScpIHtcbnRoaXMuX2FwcGxpZXNUb0RvY3VtZW50ID0gdHJ1ZTtcbnZhciBlID0gdGhpcy5fX2FwcGxpZWRFbGVtZW50IHx8IHRoaXM7XG5zdHlsZURlZmF1bHRzLmFkZFN0eWxlKGUpO1xuaWYgKGUudGV4dENvbnRlbnQpIHtcbnRoaXMuX2FwcGx5KCk7XG59IGVsc2Uge1xudmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKCkge1xub2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xudGhpcy5fYXBwbHkoKTtcbn0uYmluZCh0aGlzKSk7XG5vYnNlcnZlci5vYnNlcnZlKGUsIHsgY2hpbGRMaXN0OiB0cnVlIH0pO1xufVxufVxufVxufSxcbl9hcHBseTogZnVuY3Rpb24gKCkge1xudmFyIGUgPSB0aGlzLl9fYXBwbGllZEVsZW1lbnQgfHwgdGhpcztcbnRoaXMuX2NvbXB1dGVTdHlsZVByb3BlcnRpZXMoKTtcbnZhciBwcm9wcyA9IHRoaXMuX3N0eWxlUHJvcGVydGllcztcbnZhciBzZWxmID0gdGhpcztcbmUudGV4dENvbnRlbnQgPSBzdHlsZVV0aWwudG9Dc3NUZXh0KHN0eWxlVXRpbC5ydWxlc0ZvclN0eWxlKGUpLCBmdW5jdGlvbiAocnVsZSkge1xudmFyIGNzcyA9IHJ1bGUuY3NzVGV4dCA9IHJ1bGUucGFyc2VkQ3NzVGV4dDtcbmlmIChydWxlLnByb3BlcnR5SW5mbyAmJiBydWxlLnByb3BlcnR5SW5mby5jc3NUZXh0KSB7XG5jc3MgPSBjc3MucmVwbGFjZShwcm9wZXJ0eVV0aWxzLnJ4LlZBUl9BU1NJR04sICcnKTtcbnJ1bGUuY3NzVGV4dCA9IHByb3BlcnR5VXRpbHMudmFsdWVGb3JQcm9wZXJ0aWVzKGNzcywgcHJvcHMpO1xufVxuc3R5bGVUcmFuc2Zvcm1lci5kb2N1bWVudFJ1bGUocnVsZSk7XG59KTtcbn1cbn0pO1xufSgpKTtcblBvbHltZXIuVGVtcGxhdGl6ZXIgPSB7XG5wcm9wZXJ0aWVzOiB7IF9faGlkZVRlbXBsYXRlQ2hpbGRyZW5fXzogeyBvYnNlcnZlcjogJ19zaG93SGlkZUNoaWxkcmVuJyB9IH0sXG5fdGVtcGxhdGl6ZXJTdGF0aWM6IHtcbmNvdW50OiAwLFxuY2FsbGJhY2tzOiB7fSxcbmRlYm91bmNlcjogbnVsbFxufSxcbl9pbnN0YW5jZVByb3BzOiBQb2x5bWVyLm5vYixcbmNyZWF0ZWQ6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3RlbXBsYXRpemVySWQgPSB0aGlzLl90ZW1wbGF0aXplclN0YXRpYy5jb3VudCsrO1xufSxcbnRlbXBsYXRpemU6IGZ1bmN0aW9uICh0ZW1wbGF0ZSkge1xuaWYgKCF0ZW1wbGF0ZS5fY29udGVudCkge1xudGVtcGxhdGUuX2NvbnRlbnQgPSB0ZW1wbGF0ZS5jb250ZW50O1xufVxuaWYgKHRlbXBsYXRlLl9jb250ZW50Ll9jdG9yKSB7XG50aGlzLmN0b3IgPSB0ZW1wbGF0ZS5fY29udGVudC5fY3RvcjtcbnRoaXMuX3ByZXBQYXJlbnRQcm9wZXJ0aWVzKHRoaXMuY3Rvci5wcm90b3R5cGUsIHRlbXBsYXRlKTtcbnJldHVybjtcbn1cbnZhciBhcmNoZXR5cGUgPSBPYmplY3QuY3JlYXRlKFBvbHltZXIuQmFzZSk7XG50aGlzLl9jdXN0b21QcmVwQW5ub3RhdGlvbnMoYXJjaGV0eXBlLCB0ZW1wbGF0ZSk7XG5hcmNoZXR5cGUuX3ByZXBFZmZlY3RzKCk7XG50aGlzLl9jdXN0b21QcmVwRWZmZWN0cyhhcmNoZXR5cGUpO1xuYXJjaGV0eXBlLl9wcmVwQmVoYXZpb3JzKCk7XG5hcmNoZXR5cGUuX3ByZXBCaW5kaW5ncygpO1xudGhpcy5fcHJlcFBhcmVudFByb3BlcnRpZXMoYXJjaGV0eXBlLCB0ZW1wbGF0ZSk7XG5hcmNoZXR5cGUuX25vdGlmeVBhdGggPSB0aGlzLl9ub3RpZnlQYXRoSW1wbDtcbmFyY2hldHlwZS5fc2NvcGVFbGVtZW50Q2xhc3MgPSB0aGlzLl9zY29wZUVsZW1lbnRDbGFzc0ltcGw7XG5hcmNoZXR5cGUubGlzdGVuID0gdGhpcy5fbGlzdGVuSW1wbDtcbmFyY2hldHlwZS5fc2hvd0hpZGVDaGlsZHJlbiA9IHRoaXMuX3Nob3dIaWRlQ2hpbGRyZW5JbXBsO1xudmFyIF9jb25zdHJ1Y3RvciA9IHRoaXMuX2NvbnN0cnVjdG9ySW1wbDtcbnZhciBjdG9yID0gZnVuY3Rpb24gVGVtcGxhdGVJbnN0YW5jZShtb2RlbCwgaG9zdCkge1xuX2NvbnN0cnVjdG9yLmNhbGwodGhpcywgbW9kZWwsIGhvc3QpO1xufTtcbmN0b3IucHJvdG90eXBlID0gYXJjaGV0eXBlO1xuYXJjaGV0eXBlLmNvbnN0cnVjdG9yID0gY3RvcjtcbnRlbXBsYXRlLl9jb250ZW50Ll9jdG9yID0gY3RvcjtcbnRoaXMuY3RvciA9IGN0b3I7XG59LFxuX2dldFJvb3REYXRhSG9zdDogZnVuY3Rpb24gKCkge1xucmV0dXJuIHRoaXMuZGF0YUhvc3QgJiYgdGhpcy5kYXRhSG9zdC5fcm9vdERhdGFIb3N0IHx8IHRoaXMuZGF0YUhvc3Q7XG59LFxuX3Nob3dIaWRlQ2hpbGRyZW5JbXBsOiBmdW5jdGlvbiAoaGlkZSkge1xudmFyIGMgPSB0aGlzLl9jaGlsZHJlbjtcbmZvciAodmFyIGkgPSAwOyBpIDwgYy5sZW5ndGg7IGkrKykge1xudmFyIG4gPSBjW2ldO1xuaWYgKG4uc3R5bGUpIHtcbm4uc3R5bGUuZGlzcGxheSA9IGhpZGUgPyAnbm9uZScgOiAnJztcbm4uX19oaWRlVGVtcGxhdGVDaGlsZHJlbl9fID0gaGlkZTtcbn1cbn1cbn0sXG5fZGVib3VuY2VUZW1wbGF0ZTogZnVuY3Rpb24gKGZuKSB7XG50aGlzLl90ZW1wbGF0aXplclN0YXRpYy5jYWxsYmFja3NbdGhpcy5fdGVtcGxhdGl6ZXJJZF0gPSBmbi5iaW5kKHRoaXMpO1xudGhpcy5fdGVtcGxhdGl6ZXJTdGF0aWMuZGVib3VuY2VyID0gUG9seW1lci5EZWJvdW5jZSh0aGlzLl90ZW1wbGF0aXplclN0YXRpYy5kZWJvdW5jZXIsIHRoaXMuX2ZsdXNoVGVtcGxhdGVzLmJpbmQodGhpcywgdHJ1ZSkpO1xufSxcbl9mbHVzaFRlbXBsYXRlczogZnVuY3Rpb24gKGRlYm91bmNlckV4cGlyZWQpIHtcbnZhciBkYiA9IHRoaXMuX3RlbXBsYXRpemVyU3RhdGljLmRlYm91bmNlcjtcbndoaWxlIChkZWJvdW5jZXJFeHBpcmVkIHx8IGRiICYmIGRiLmZpbmlzaCkge1xuZGIuc3RvcCgpO1xudmFyIGNicyA9IHRoaXMuX3RlbXBsYXRpemVyU3RhdGljLmNhbGxiYWNrcztcbnRoaXMuX3RlbXBsYXRpemVyU3RhdGljLmNhbGxiYWNrcyA9IHt9O1xuZm9yICh2YXIgaWQgaW4gY2JzKSB7XG5jYnNbaWRdKCk7XG59XG5kZWJvdW5jZXJFeHBpcmVkID0gZmFsc2U7XG59XG59LFxuX2N1c3RvbVByZXBFZmZlY3RzOiBmdW5jdGlvbiAoYXJjaGV0eXBlKSB7XG52YXIgcGFyZW50UHJvcHMgPSBhcmNoZXR5cGUuX3BhcmVudFByb3BzO1xuZm9yICh2YXIgcHJvcCBpbiBwYXJlbnRQcm9wcykge1xuYXJjaGV0eXBlLl9hZGRQcm9wZXJ0eUVmZmVjdChwcm9wLCAnZnVuY3Rpb24nLCB0aGlzLl9jcmVhdGVIb3N0UHJvcEVmZmVjdG9yKHByb3ApKTtcbn1cbmZvciAodmFyIHByb3AgaW4gdGhpcy5faW5zdGFuY2VQcm9wcykge1xuYXJjaGV0eXBlLl9hZGRQcm9wZXJ0eUVmZmVjdChwcm9wLCAnZnVuY3Rpb24nLCB0aGlzLl9jcmVhdGVJbnN0YW5jZVByb3BFZmZlY3Rvcihwcm9wKSk7XG59XG59LFxuX2N1c3RvbVByZXBBbm5vdGF0aW9uczogZnVuY3Rpb24gKGFyY2hldHlwZSwgdGVtcGxhdGUpIHtcbmFyY2hldHlwZS5fdGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbnZhciBjID0gdGVtcGxhdGUuX2NvbnRlbnQ7XG5pZiAoIWMuX25vdGVzKSB7XG52YXIgcm9vdERhdGFIb3N0ID0gYXJjaGV0eXBlLl9yb290RGF0YUhvc3Q7XG5pZiAocm9vdERhdGFIb3N0KSB7XG5Qb2x5bWVyLkFubm90YXRpb25zLnByZXBFbGVtZW50ID0gcm9vdERhdGFIb3N0Ll9wcmVwRWxlbWVudC5iaW5kKHJvb3REYXRhSG9zdCk7XG59XG5jLl9ub3RlcyA9IFBvbHltZXIuQW5ub3RhdGlvbnMucGFyc2VBbm5vdGF0aW9ucyh0ZW1wbGF0ZSk7XG5Qb2x5bWVyLkFubm90YXRpb25zLnByZXBFbGVtZW50ID0gbnVsbDtcbnRoaXMuX3Byb2Nlc3NBbm5vdGF0aW9ucyhjLl9ub3Rlcyk7XG59XG5hcmNoZXR5cGUuX25vdGVzID0gYy5fbm90ZXM7XG5hcmNoZXR5cGUuX3BhcmVudFByb3BzID0gYy5fcGFyZW50UHJvcHM7XG59LFxuX3ByZXBQYXJlbnRQcm9wZXJ0aWVzOiBmdW5jdGlvbiAoYXJjaGV0eXBlLCB0ZW1wbGF0ZSkge1xudmFyIHBhcmVudFByb3BzID0gdGhpcy5fcGFyZW50UHJvcHMgPSBhcmNoZXR5cGUuX3BhcmVudFByb3BzO1xuaWYgKHRoaXMuX2ZvcndhcmRQYXJlbnRQcm9wICYmIHBhcmVudFByb3BzKSB7XG52YXIgcHJvdG8gPSBhcmNoZXR5cGUuX3BhcmVudFByb3BQcm90bztcbnZhciBwcm9wO1xuaWYgKCFwcm90bykge1xuZm9yIChwcm9wIGluIHRoaXMuX2luc3RhbmNlUHJvcHMpIHtcbmRlbGV0ZSBwYXJlbnRQcm9wc1twcm9wXTtcbn1cbnByb3RvID0gYXJjaGV0eXBlLl9wYXJlbnRQcm9wUHJvdG8gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuaWYgKHRlbXBsYXRlICE9IHRoaXMpIHtcblBvbHltZXIuQmluZC5wcmVwYXJlTW9kZWwocHJvdG8pO1xufVxuZm9yIChwcm9wIGluIHBhcmVudFByb3BzKSB7XG52YXIgcGFyZW50UHJvcCA9ICdfcGFyZW50XycgKyBwcm9wO1xudmFyIGVmZmVjdHMgPSBbXG57XG5raW5kOiAnZnVuY3Rpb24nLFxuZWZmZWN0OiB0aGlzLl9jcmVhdGVGb3J3YXJkUHJvcEVmZmVjdG9yKHByb3ApXG59LFxueyBraW5kOiAnbm90aWZ5JyB9XG5dO1xuUG9seW1lci5CaW5kLl9jcmVhdGVBY2Nlc3NvcnMocHJvdG8sIHBhcmVudFByb3AsIGVmZmVjdHMpO1xufVxufVxuaWYgKHRlbXBsYXRlICE9IHRoaXMpIHtcblBvbHltZXIuQmluZC5wcmVwYXJlSW5zdGFuY2UodGVtcGxhdGUpO1xudGVtcGxhdGUuX2ZvcndhcmRQYXJlbnRQcm9wID0gdGhpcy5fZm9yd2FyZFBhcmVudFByb3AuYmluZCh0aGlzKTtcbn1cbnRoaXMuX2V4dGVuZFRlbXBsYXRlKHRlbXBsYXRlLCBwcm90byk7XG59XG59LFxuX2NyZWF0ZUZvcndhcmRQcm9wRWZmZWN0b3I6IGZ1bmN0aW9uIChwcm9wKSB7XG5yZXR1cm4gZnVuY3Rpb24gKHNvdXJjZSwgdmFsdWUpIHtcbnRoaXMuX2ZvcndhcmRQYXJlbnRQcm9wKHByb3AsIHZhbHVlKTtcbn07XG59LFxuX2NyZWF0ZUhvc3RQcm9wRWZmZWN0b3I6IGZ1bmN0aW9uIChwcm9wKSB7XG5yZXR1cm4gZnVuY3Rpb24gKHNvdXJjZSwgdmFsdWUpIHtcbnRoaXMuZGF0YUhvc3RbJ19wYXJlbnRfJyArIHByb3BdID0gdmFsdWU7XG59O1xufSxcbl9jcmVhdGVJbnN0YW5jZVByb3BFZmZlY3RvcjogZnVuY3Rpb24gKHByb3ApIHtcbnJldHVybiBmdW5jdGlvbiAoc291cmNlLCB2YWx1ZSwgb2xkLCBmcm9tQWJvdmUpIHtcbmlmICghZnJvbUFib3ZlKSB7XG50aGlzLmRhdGFIb3N0Ll9mb3J3YXJkSW5zdGFuY2VQcm9wKHRoaXMsIHByb3AsIHZhbHVlKTtcbn1cbn07XG59LFxuX2V4dGVuZFRlbXBsYXRlOiBmdW5jdGlvbiAodGVtcGxhdGUsIHByb3RvKSB7XG5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhwcm90bykuZm9yRWFjaChmdW5jdGlvbiAobikge1xudmFyIHZhbCA9IHRlbXBsYXRlW25dO1xudmFyIHBkID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihwcm90bywgbik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkodGVtcGxhdGUsIG4sIHBkKTtcbmlmICh2YWwgIT09IHVuZGVmaW5lZCkge1xudGVtcGxhdGUuX3Byb3BlcnR5U2V0dGVyKG4sIHZhbCk7XG59XG59KTtcbn0sXG5fc2hvd0hpZGVDaGlsZHJlbjogZnVuY3Rpb24gKGhpZGRlbikge1xufSxcbl9mb3J3YXJkSW5zdGFuY2VQYXRoOiBmdW5jdGlvbiAoaW5zdCwgcGF0aCwgdmFsdWUpIHtcbn0sXG5fZm9yd2FyZEluc3RhbmNlUHJvcDogZnVuY3Rpb24gKGluc3QsIHByb3AsIHZhbHVlKSB7XG59LFxuX25vdGlmeVBhdGhJbXBsOiBmdW5jdGlvbiAocGF0aCwgdmFsdWUpIHtcbnZhciBkYXRhSG9zdCA9IHRoaXMuZGF0YUhvc3Q7XG52YXIgZG90ID0gcGF0aC5pbmRleE9mKCcuJyk7XG52YXIgcm9vdCA9IGRvdCA8IDAgPyBwYXRoIDogcGF0aC5zbGljZSgwLCBkb3QpO1xuZGF0YUhvc3QuX2ZvcndhcmRJbnN0YW5jZVBhdGguY2FsbChkYXRhSG9zdCwgdGhpcywgcGF0aCwgdmFsdWUpO1xuaWYgKHJvb3QgaW4gZGF0YUhvc3QuX3BhcmVudFByb3BzKSB7XG5kYXRhSG9zdC5ub3RpZnlQYXRoKCdfcGFyZW50XycgKyBwYXRoLCB2YWx1ZSk7XG59XG59LFxuX3BhdGhFZmZlY3RvcjogZnVuY3Rpb24gKHBhdGgsIHZhbHVlLCBmcm9tQWJvdmUpIHtcbmlmICh0aGlzLl9mb3J3YXJkUGFyZW50UGF0aCkge1xuaWYgKHBhdGguaW5kZXhPZignX3BhcmVudF8nKSA9PT0gMCkge1xudGhpcy5fZm9yd2FyZFBhcmVudFBhdGgocGF0aC5zdWJzdHJpbmcoOCksIHZhbHVlKTtcbn1cbn1cblBvbHltZXIuQmFzZS5fcGF0aEVmZmVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59LFxuX2NvbnN0cnVjdG9ySW1wbDogZnVuY3Rpb24gKG1vZGVsLCBob3N0KSB7XG50aGlzLl9yb290RGF0YUhvc3QgPSBob3N0Ll9nZXRSb290RGF0YUhvc3QoKTtcbnRoaXMuX3NldHVwQ29uZmlndXJlKG1vZGVsKTtcbnRoaXMuX3B1c2hIb3N0KGhvc3QpO1xudGhpcy5yb290ID0gdGhpcy5pbnN0YW5jZVRlbXBsYXRlKHRoaXMuX3RlbXBsYXRlKTtcbnRoaXMucm9vdC5fX25vQ29udGVudCA9ICF0aGlzLl9ub3Rlcy5faGFzQ29udGVudDtcbnRoaXMucm9vdC5fX3N0eWxlU2NvcGVkID0gdHJ1ZTtcbnRoaXMuX3BvcEhvc3QoKTtcbnRoaXMuX21hcnNoYWxBbm5vdGF0ZWROb2RlcygpO1xudGhpcy5fbWFyc2hhbEluc3RhbmNlRWZmZWN0cygpO1xudGhpcy5fbWFyc2hhbEFubm90YXRlZExpc3RlbmVycygpO1xudmFyIGNoaWxkcmVuID0gW107XG5mb3IgKHZhciBuID0gdGhpcy5yb290LmZpcnN0Q2hpbGQ7IG47IG4gPSBuLm5leHRTaWJsaW5nKSB7XG5jaGlsZHJlbi5wdXNoKG4pO1xubi5fdGVtcGxhdGVJbnN0YW5jZSA9IHRoaXM7XG59XG50aGlzLl9jaGlsZHJlbiA9IGNoaWxkcmVuO1xuaWYgKGhvc3QuX19oaWRlVGVtcGxhdGVDaGlsZHJlbl9fKSB7XG50aGlzLl9zaG93SGlkZUNoaWxkcmVuKHRydWUpO1xufVxudGhpcy5fdHJ5UmVhZHkoKTtcbn0sXG5fbGlzdGVuSW1wbDogZnVuY3Rpb24gKG5vZGUsIGV2ZW50TmFtZSwgbWV0aG9kTmFtZSkge1xudmFyIG1vZGVsID0gdGhpcztcbnZhciBob3N0ID0gdGhpcy5fcm9vdERhdGFIb3N0O1xudmFyIGhhbmRsZXIgPSBob3N0Ll9jcmVhdGVFdmVudEhhbmRsZXIobm9kZSwgZXZlbnROYW1lLCBtZXRob2ROYW1lKTtcbnZhciBkZWNvcmF0ZWQgPSBmdW5jdGlvbiAoZSkge1xuZS5tb2RlbCA9IG1vZGVsO1xuaGFuZGxlcihlKTtcbn07XG5ob3N0Ll9saXN0ZW4obm9kZSwgZXZlbnROYW1lLCBkZWNvcmF0ZWQpO1xufSxcbl9zY29wZUVsZW1lbnRDbGFzc0ltcGw6IGZ1bmN0aW9uIChub2RlLCB2YWx1ZSkge1xudmFyIGhvc3QgPSB0aGlzLl9yb290RGF0YUhvc3Q7XG5pZiAoaG9zdCkge1xucmV0dXJuIGhvc3QuX3Njb3BlRWxlbWVudENsYXNzKG5vZGUsIHZhbHVlKTtcbn1cbn0sXG5zdGFtcDogZnVuY3Rpb24gKG1vZGVsKSB7XG5tb2RlbCA9IG1vZGVsIHx8IHt9O1xuaWYgKHRoaXMuX3BhcmVudFByb3BzKSB7XG5mb3IgKHZhciBwcm9wIGluIHRoaXMuX3BhcmVudFByb3BzKSB7XG5tb2RlbFtwcm9wXSA9IHRoaXNbJ19wYXJlbnRfJyArIHByb3BdO1xufVxufVxucmV0dXJuIG5ldyB0aGlzLmN0b3IobW9kZWwsIHRoaXMpO1xufSxcbm1vZGVsRm9yRWxlbWVudDogZnVuY3Rpb24gKGVsKSB7XG52YXIgbW9kZWw7XG53aGlsZSAoZWwpIHtcbmlmIChtb2RlbCA9IGVsLl90ZW1wbGF0ZUluc3RhbmNlKSB7XG5pZiAobW9kZWwuZGF0YUhvc3QgIT0gdGhpcykge1xuZWwgPSBtb2RlbC5kYXRhSG9zdDtcbn0gZWxzZSB7XG5yZXR1cm4gbW9kZWw7XG59XG59IGVsc2Uge1xuZWwgPSBlbC5wYXJlbnROb2RlO1xufVxufVxufVxufTtcblBvbHltZXIoe1xuaXM6ICdkb20tdGVtcGxhdGUnLFxuZXh0ZW5kczogJ3RlbXBsYXRlJyxcbmJlaGF2aW9yczogW1BvbHltZXIuVGVtcGxhdGl6ZXJdLFxucmVhZHk6IGZ1bmN0aW9uICgpIHtcbnRoaXMudGVtcGxhdGl6ZSh0aGlzKTtcbn1cbn0pO1xuUG9seW1lci5fY29sbGVjdGlvbnMgPSBuZXcgV2Vha01hcCgpO1xuUG9seW1lci5Db2xsZWN0aW9uID0gZnVuY3Rpb24gKHVzZXJBcnJheSkge1xuUG9seW1lci5fY29sbGVjdGlvbnMuc2V0KHVzZXJBcnJheSwgdGhpcyk7XG50aGlzLnVzZXJBcnJheSA9IHVzZXJBcnJheTtcbnRoaXMuc3RvcmUgPSB1c2VyQXJyYXkuc2xpY2UoKTtcbnRoaXMuaW5pdE1hcCgpO1xufTtcblBvbHltZXIuQ29sbGVjdGlvbi5wcm90b3R5cGUgPSB7XG5jb25zdHJ1Y3RvcjogUG9seW1lci5Db2xsZWN0aW9uLFxuaW5pdE1hcDogZnVuY3Rpb24gKCkge1xudmFyIG9tYXAgPSB0aGlzLm9tYXAgPSBuZXcgV2Vha01hcCgpO1xudmFyIHBtYXAgPSB0aGlzLnBtYXAgPSB7fTtcbnZhciBzID0gdGhpcy5zdG9yZTtcbmZvciAodmFyIGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkrKykge1xudmFyIGl0ZW0gPSBzW2ldO1xuaWYgKGl0ZW0gJiYgdHlwZW9mIGl0ZW0gPT0gJ29iamVjdCcpIHtcbm9tYXAuc2V0KGl0ZW0sIGkpO1xufSBlbHNlIHtcbnBtYXBbaXRlbV0gPSBpO1xufVxufVxufSxcbmFkZDogZnVuY3Rpb24gKGl0ZW0pIHtcbnZhciBrZXkgPSB0aGlzLnN0b3JlLnB1c2goaXRlbSkgLSAxO1xuaWYgKGl0ZW0gJiYgdHlwZW9mIGl0ZW0gPT0gJ29iamVjdCcpIHtcbnRoaXMub21hcC5zZXQoaXRlbSwga2V5KTtcbn0gZWxzZSB7XG50aGlzLnBtYXBbaXRlbV0gPSBrZXk7XG59XG5yZXR1cm4ga2V5O1xufSxcbnJlbW92ZUtleTogZnVuY3Rpb24gKGtleSkge1xudGhpcy5fcmVtb3ZlRnJvbU1hcCh0aGlzLnN0b3JlW2tleV0pO1xuZGVsZXRlIHRoaXMuc3RvcmVba2V5XTtcbn0sXG5fcmVtb3ZlRnJvbU1hcDogZnVuY3Rpb24gKGl0ZW0pIHtcbmlmIChpdGVtICYmIHR5cGVvZiBpdGVtID09ICdvYmplY3QnKSB7XG50aGlzLm9tYXAuZGVsZXRlKGl0ZW0pO1xufSBlbHNlIHtcbmRlbGV0ZSB0aGlzLnBtYXBbaXRlbV07XG59XG59LFxucmVtb3ZlOiBmdW5jdGlvbiAoaXRlbSkge1xudmFyIGtleSA9IHRoaXMuZ2V0S2V5KGl0ZW0pO1xudGhpcy5yZW1vdmVLZXkoa2V5KTtcbnJldHVybiBrZXk7XG59LFxuZ2V0S2V5OiBmdW5jdGlvbiAoaXRlbSkge1xuaWYgKGl0ZW0gJiYgdHlwZW9mIGl0ZW0gPT0gJ29iamVjdCcpIHtcbnJldHVybiB0aGlzLm9tYXAuZ2V0KGl0ZW0pO1xufSBlbHNlIHtcbnJldHVybiB0aGlzLnBtYXBbaXRlbV07XG59XG59LFxuZ2V0S2V5czogZnVuY3Rpb24gKCkge1xucmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuc3RvcmUpO1xufSxcbnNldEl0ZW06IGZ1bmN0aW9uIChrZXksIGl0ZW0pIHtcbnZhciBvbGQgPSB0aGlzLnN0b3JlW2tleV07XG5pZiAob2xkKSB7XG50aGlzLl9yZW1vdmVGcm9tTWFwKG9sZCk7XG59XG5pZiAoaXRlbSAmJiB0eXBlb2YgaXRlbSA9PSAnb2JqZWN0Jykge1xudGhpcy5vbWFwLnNldChpdGVtLCBrZXkpO1xufSBlbHNlIHtcbnRoaXMucG1hcFtpdGVtXSA9IGtleTtcbn1cbnRoaXMuc3RvcmVba2V5XSA9IGl0ZW07XG59LFxuZ2V0SXRlbTogZnVuY3Rpb24gKGtleSkge1xucmV0dXJuIHRoaXMuc3RvcmVba2V5XTtcbn0sXG5nZXRJdGVtczogZnVuY3Rpb24gKCkge1xudmFyIGl0ZW1zID0gW10sIHN0b3JlID0gdGhpcy5zdG9yZTtcbmZvciAodmFyIGtleSBpbiBzdG9yZSkge1xuaXRlbXMucHVzaChzdG9yZVtrZXldKTtcbn1cbnJldHVybiBpdGVtcztcbn0sXG5fYXBwbHlTcGxpY2VzOiBmdW5jdGlvbiAoc3BsaWNlcykge1xudmFyIGtleVNwbGljZXMgPSBbXTtcbmZvciAodmFyIGkgPSAwOyBpIDwgc3BsaWNlcy5sZW5ndGg7IGkrKykge1xudmFyIGosIG8sIGtleSwgcyA9IHNwbGljZXNbaV07XG52YXIgcmVtb3ZlZCA9IFtdO1xuZm9yIChqID0gMDsgaiA8IHMucmVtb3ZlZC5sZW5ndGg7IGorKykge1xubyA9IHMucmVtb3ZlZFtqXTtcbmtleSA9IHRoaXMucmVtb3ZlKG8pO1xucmVtb3ZlZC5wdXNoKGtleSk7XG59XG52YXIgYWRkZWQgPSBbXTtcbmZvciAoaiA9IDA7IGogPCBzLmFkZGVkQ291bnQ7IGorKykge1xubyA9IHRoaXMudXNlckFycmF5W3MuaW5kZXggKyBqXTtcbmtleSA9IHRoaXMuYWRkKG8pO1xuYWRkZWQucHVzaChrZXkpO1xufVxua2V5U3BsaWNlcy5wdXNoKHtcbmluZGV4OiBzLmluZGV4LFxucmVtb3ZlZDogcmVtb3ZlZCxcbnJlbW92ZWRJdGVtczogcy5yZW1vdmVkLFxuYWRkZWQ6IGFkZGVkXG59KTtcbn1cbnJldHVybiBrZXlTcGxpY2VzO1xufVxufTtcblBvbHltZXIuQ29sbGVjdGlvbi5nZXQgPSBmdW5jdGlvbiAodXNlckFycmF5KSB7XG5yZXR1cm4gUG9seW1lci5fY29sbGVjdGlvbnMuZ2V0KHVzZXJBcnJheSkgfHwgbmV3IFBvbHltZXIuQ29sbGVjdGlvbih1c2VyQXJyYXkpO1xufTtcblBvbHltZXIuQ29sbGVjdGlvbi5hcHBseVNwbGljZXMgPSBmdW5jdGlvbiAodXNlckFycmF5LCBzcGxpY2VzKSB7XG52YXIgY29sbCA9IFBvbHltZXIuX2NvbGxlY3Rpb25zLmdldCh1c2VyQXJyYXkpO1xucmV0dXJuIGNvbGwgPyBjb2xsLl9hcHBseVNwbGljZXMoc3BsaWNlcykgOiBudWxsO1xufTtcblBvbHltZXIoe1xuaXM6ICdkb20tcmVwZWF0JyxcbmV4dGVuZHM6ICd0ZW1wbGF0ZScsXG5wcm9wZXJ0aWVzOiB7XG5pdGVtczogeyB0eXBlOiBBcnJheSB9LFxuYXM6IHtcbnR5cGU6IFN0cmluZyxcbnZhbHVlOiAnaXRlbSdcbn0sXG5pbmRleEFzOiB7XG50eXBlOiBTdHJpbmcsXG52YWx1ZTogJ2luZGV4J1xufSxcbnNvcnQ6IHtcbnR5cGU6IEZ1bmN0aW9uLFxub2JzZXJ2ZXI6ICdfc29ydENoYW5nZWQnXG59LFxuZmlsdGVyOiB7XG50eXBlOiBGdW5jdGlvbixcbm9ic2VydmVyOiAnX2ZpbHRlckNoYW5nZWQnXG59LFxub2JzZXJ2ZToge1xudHlwZTogU3RyaW5nLFxub2JzZXJ2ZXI6ICdfb2JzZXJ2ZUNoYW5nZWQnXG59LFxuZGVsYXk6IE51bWJlclxufSxcbmJlaGF2aW9yczogW1BvbHltZXIuVGVtcGxhdGl6ZXJdLFxub2JzZXJ2ZXJzOiBbJ19pdGVtc0NoYW5nZWQoaXRlbXMuKiknXSxcbmRldGFjaGVkOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5yb3dzKSB7XG5mb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucm93cy5sZW5ndGg7IGkrKykge1xudGhpcy5fZGV0YWNoUm93KGkpO1xufVxufVxufSxcbmF0dGFjaGVkOiBmdW5jdGlvbiAoKSB7XG5pZiAodGhpcy5yb3dzKSB7XG52YXIgcGFyZW50Tm9kZSA9IFBvbHltZXIuZG9tKHRoaXMpLnBhcmVudE5vZGU7XG5mb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucm93cy5sZW5ndGg7IGkrKykge1xuUG9seW1lci5kb20ocGFyZW50Tm9kZSkuaW5zZXJ0QmVmb3JlKHRoaXMucm93c1tpXS5yb290LCB0aGlzKTtcbn1cbn1cbn0sXG5yZWFkeTogZnVuY3Rpb24gKCkge1xudGhpcy5faW5zdGFuY2VQcm9wcyA9IHsgX19rZXlfXzogdHJ1ZSB9O1xudGhpcy5faW5zdGFuY2VQcm9wc1t0aGlzLmFzXSA9IHRydWU7XG50aGlzLl9pbnN0YW5jZVByb3BzW3RoaXMuaW5kZXhBc10gPSB0cnVlO1xuaWYgKCF0aGlzLmN0b3IpIHtcbnRoaXMudGVtcGxhdGl6ZSh0aGlzKTtcbn1cbn0sXG5fc29ydENoYW5nZWQ6IGZ1bmN0aW9uICgpIHtcbnZhciBkYXRhSG9zdCA9IHRoaXMuX2dldFJvb3REYXRhSG9zdCgpO1xudmFyIHNvcnQgPSB0aGlzLnNvcnQ7XG50aGlzLl9zb3J0Rm4gPSBzb3J0ICYmICh0eXBlb2Ygc29ydCA9PSAnZnVuY3Rpb24nID8gc29ydCA6IGZ1bmN0aW9uICgpIHtcbnJldHVybiBkYXRhSG9zdFtzb3J0XS5hcHBseShkYXRhSG9zdCwgYXJndW1lbnRzKTtcbn0pO1xudGhpcy5fZnVsbFJlZnJlc2ggPSB0cnVlO1xuaWYgKHRoaXMuaXRlbXMpIHtcbnRoaXMuX2RlYm91bmNlVGVtcGxhdGUodGhpcy5fcmVuZGVyKTtcbn1cbn0sXG5fZmlsdGVyQ2hhbmdlZDogZnVuY3Rpb24gKCkge1xudmFyIGRhdGFIb3N0ID0gdGhpcy5fZ2V0Um9vdERhdGFIb3N0KCk7XG52YXIgZmlsdGVyID0gdGhpcy5maWx0ZXI7XG50aGlzLl9maWx0ZXJGbiA9IGZpbHRlciAmJiAodHlwZW9mIGZpbHRlciA9PSAnZnVuY3Rpb24nID8gZmlsdGVyIDogZnVuY3Rpb24gKCkge1xucmV0dXJuIGRhdGFIb3N0W2ZpbHRlcl0uYXBwbHkoZGF0YUhvc3QsIGFyZ3VtZW50cyk7XG59KTtcbnRoaXMuX2Z1bGxSZWZyZXNoID0gdHJ1ZTtcbmlmICh0aGlzLml0ZW1zKSB7XG50aGlzLl9kZWJvdW5jZVRlbXBsYXRlKHRoaXMuX3JlbmRlcik7XG59XG59LFxuX29ic2VydmVDaGFuZ2VkOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9vYnNlcnZlUGF0aHMgPSB0aGlzLm9ic2VydmUgJiYgdGhpcy5vYnNlcnZlLnJlcGxhY2UoJy4qJywgJy4nKS5zcGxpdCgnICcpO1xufSxcbl9pdGVtc0NoYW5nZWQ6IGZ1bmN0aW9uIChjaGFuZ2UpIHtcbmlmIChjaGFuZ2UucGF0aCA9PSAnaXRlbXMnKSB7XG5pZiAoQXJyYXkuaXNBcnJheSh0aGlzLml0ZW1zKSkge1xudGhpcy5jb2xsZWN0aW9uID0gUG9seW1lci5Db2xsZWN0aW9uLmdldCh0aGlzLml0ZW1zKTtcbn0gZWxzZSBpZiAoIXRoaXMuaXRlbXMpIHtcbnRoaXMuY29sbGVjdGlvbiA9IG51bGw7XG59IGVsc2Uge1xudGhpcy5fZXJyb3IodGhpcy5fbG9nZignZG9tLXJlcGVhdCcsICdleHBlY3RlZCBhcnJheSBmb3IgYGl0ZW1zYCwnICsgJyBmb3VuZCcsIHRoaXMuaXRlbXMpKTtcbn1cbnRoaXMuX3NwbGljZXMgPSBbXTtcbnRoaXMuX2Z1bGxSZWZyZXNoID0gdHJ1ZTtcbnRoaXMuX2RlYm91bmNlVGVtcGxhdGUodGhpcy5fcmVuZGVyKTtcbn0gZWxzZSBpZiAoY2hhbmdlLnBhdGggPT0gJ2l0ZW1zLnNwbGljZXMnKSB7XG50aGlzLl9zcGxpY2VzID0gdGhpcy5fc3BsaWNlcy5jb25jYXQoY2hhbmdlLnZhbHVlLmtleVNwbGljZXMpO1xudGhpcy5fZGVib3VuY2VUZW1wbGF0ZSh0aGlzLl9yZW5kZXIpO1xufSBlbHNlIHtcbnZhciBzdWJwYXRoID0gY2hhbmdlLnBhdGguc2xpY2UoNik7XG50aGlzLl9mb3J3YXJkSXRlbVBhdGgoc3VicGF0aCwgY2hhbmdlLnZhbHVlKTtcbnRoaXMuX2NoZWNrT2JzZXJ2ZWRQYXRocyhzdWJwYXRoKTtcbn1cbn0sXG5fY2hlY2tPYnNlcnZlZFBhdGhzOiBmdW5jdGlvbiAocGF0aCkge1xuaWYgKHRoaXMuX29ic2VydmVQYXRocykge1xucGF0aCA9IHBhdGguc3Vic3RyaW5nKHBhdGguaW5kZXhPZignLicpICsgMSk7XG52YXIgcGF0aHMgPSB0aGlzLl9vYnNlcnZlUGF0aHM7XG5mb3IgKHZhciBpID0gMDsgaSA8IHBhdGhzLmxlbmd0aDsgaSsrKSB7XG5pZiAocGF0aC5pbmRleE9mKHBhdGhzW2ldKSA9PT0gMCkge1xudGhpcy5fZnVsbFJlZnJlc2ggPSB0cnVlO1xuaWYgKHRoaXMuZGVsYXkpIHtcbnRoaXMuZGVib3VuY2UoJ3JlbmRlcicsIHRoaXMuX3JlbmRlciwgdGhpcy5kZWxheSk7XG59IGVsc2Uge1xudGhpcy5fZGVib3VuY2VUZW1wbGF0ZSh0aGlzLl9yZW5kZXIpO1xufVxucmV0dXJuO1xufVxufVxufVxufSxcbnJlbmRlcjogZnVuY3Rpb24gKCkge1xudGhpcy5fZnVsbFJlZnJlc2ggPSB0cnVlO1xudGhpcy5fZGVib3VuY2VUZW1wbGF0ZSh0aGlzLl9yZW5kZXIpO1xudGhpcy5fZmx1c2hUZW1wbGF0ZXMoKTtcbn0sXG5fcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG52YXIgYyA9IHRoaXMuY29sbGVjdGlvbjtcbmlmICghdGhpcy5fZnVsbFJlZnJlc2gpIHtcbmlmICh0aGlzLl9zb3J0Rm4pIHtcbnRoaXMuX2FwcGx5U3BsaWNlc1ZpZXdTb3J0KHRoaXMuX3NwbGljZXMpO1xufSBlbHNlIHtcbmlmICh0aGlzLl9maWx0ZXJGbikge1xudGhpcy5fZnVsbFJlZnJlc2ggPSB0cnVlO1xufSBlbHNlIHtcbnRoaXMuX2FwcGx5U3BsaWNlc0FycmF5U29ydCh0aGlzLl9zcGxpY2VzKTtcbn1cbn1cbn1cbmlmICh0aGlzLl9mdWxsUmVmcmVzaCkge1xudGhpcy5fc29ydEFuZEZpbHRlcigpO1xudGhpcy5fZnVsbFJlZnJlc2ggPSBmYWxzZTtcbn1cbnRoaXMuX3NwbGljZXMgPSBbXTtcbnZhciByb3dGb3JLZXkgPSB0aGlzLl9yb3dGb3JLZXkgPSB7fTtcbnZhciBrZXlzID0gdGhpcy5fb3JkZXJlZEtleXM7XG50aGlzLnJvd3MgPSB0aGlzLnJvd3MgfHwgW107XG5mb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbnZhciBrZXkgPSBrZXlzW2ldO1xudmFyIGl0ZW0gPSBjLmdldEl0ZW0oa2V5KTtcbnZhciByb3cgPSB0aGlzLnJvd3NbaV07XG5yb3dGb3JLZXlba2V5XSA9IGk7XG5pZiAoIXJvdykge1xudGhpcy5yb3dzLnB1c2gocm93ID0gdGhpcy5faW5zZXJ0Um93KGksIG51bGwsIGl0ZW0pKTtcbn1cbnJvdy5fX3NldFByb3BlcnR5KHRoaXMuYXMsIGl0ZW0sIHRydWUpO1xucm93Ll9fc2V0UHJvcGVydHkoJ19fa2V5X18nLCBrZXksIHRydWUpO1xucm93Ll9fc2V0UHJvcGVydHkodGhpcy5pbmRleEFzLCBpLCB0cnVlKTtcbn1cbmZvciAoOyBpIDwgdGhpcy5yb3dzLmxlbmd0aDsgaSsrKSB7XG50aGlzLl9kZXRhY2hSb3coaSk7XG59XG50aGlzLnJvd3Muc3BsaWNlKGtleXMubGVuZ3RoLCB0aGlzLnJvd3MubGVuZ3RoIC0ga2V5cy5sZW5ndGgpO1xudGhpcy5maXJlKCdkb20tY2hhbmdlJyk7XG59LFxuX3NvcnRBbmRGaWx0ZXI6IGZ1bmN0aW9uICgpIHtcbnZhciBjID0gdGhpcy5jb2xsZWN0aW9uO1xuaWYgKCF0aGlzLl9zb3J0Rm4pIHtcbnRoaXMuX29yZGVyZWRLZXlzID0gW107XG52YXIgaXRlbXMgPSB0aGlzLml0ZW1zO1xuaWYgKGl0ZW1zKSB7XG5mb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG50aGlzLl9vcmRlcmVkS2V5cy5wdXNoKGMuZ2V0S2V5KGl0ZW1zW2ldKSk7XG59XG59XG59IGVsc2Uge1xudGhpcy5fb3JkZXJlZEtleXMgPSBjID8gYy5nZXRLZXlzKCkgOiBbXTtcbn1cbmlmICh0aGlzLl9maWx0ZXJGbikge1xudGhpcy5fb3JkZXJlZEtleXMgPSB0aGlzLl9vcmRlcmVkS2V5cy5maWx0ZXIoZnVuY3Rpb24gKGEpIHtcbnJldHVybiB0aGlzLl9maWx0ZXJGbihjLmdldEl0ZW0oYSkpO1xufSwgdGhpcyk7XG59XG5pZiAodGhpcy5fc29ydEZuKSB7XG50aGlzLl9vcmRlcmVkS2V5cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG5yZXR1cm4gdGhpcy5fc29ydEZuKGMuZ2V0SXRlbShhKSwgYy5nZXRJdGVtKGIpKTtcbn0uYmluZCh0aGlzKSk7XG59XG59LFxuX2tleVNvcnQ6IGZ1bmN0aW9uIChhLCBiKSB7XG5yZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmdldEtleShhKSAtIHRoaXMuY29sbGVjdGlvbi5nZXRLZXkoYik7XG59LFxuX2FwcGx5U3BsaWNlc1ZpZXdTb3J0OiBmdW5jdGlvbiAoc3BsaWNlcykge1xudmFyIGMgPSB0aGlzLmNvbGxlY3Rpb247XG52YXIga2V5cyA9IHRoaXMuX29yZGVyZWRLZXlzO1xudmFyIHJvd3MgPSB0aGlzLnJvd3M7XG52YXIgcmVtb3ZlZFJvd3MgPSBbXTtcbnZhciBhZGRlZEtleXMgPSBbXTtcbnZhciBwb29sID0gW107XG52YXIgc29ydEZuID0gdGhpcy5fc29ydEZuIHx8IHRoaXMuX2tleVNvcnQuYmluZCh0aGlzKTtcbnNwbGljZXMuZm9yRWFjaChmdW5jdGlvbiAocykge1xuZm9yICh2YXIgaSA9IDA7IGkgPCBzLnJlbW92ZWQubGVuZ3RoOyBpKyspIHtcbnZhciBpZHggPSB0aGlzLl9yb3dGb3JLZXlbcy5yZW1vdmVkW2ldXTtcbmlmIChpZHggIT0gbnVsbCkge1xucmVtb3ZlZFJvd3MucHVzaChpZHgpO1xufVxufVxuZm9yICh2YXIgaSA9IDA7IGkgPCBzLmFkZGVkLmxlbmd0aDsgaSsrKSB7XG5hZGRlZEtleXMucHVzaChzLmFkZGVkW2ldKTtcbn1cbn0sIHRoaXMpO1xuaWYgKHJlbW92ZWRSb3dzLmxlbmd0aCkge1xucmVtb3ZlZFJvd3Muc29ydCgpO1xuZm9yICh2YXIgaSA9IHJlbW92ZWRSb3dzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG52YXIgaWR4ID0gcmVtb3ZlZFJvd3NbaV07XG5wb29sLnB1c2godGhpcy5fZGV0YWNoUm93KGlkeCkpO1xucm93cy5zcGxpY2UoaWR4LCAxKTtcbmtleXMuc3BsaWNlKGlkeCwgMSk7XG59XG59XG5pZiAoYWRkZWRLZXlzLmxlbmd0aCkge1xuaWYgKHRoaXMuX2ZpbHRlckZuKSB7XG5hZGRlZEtleXMgPSBhZGRlZEtleXMuZmlsdGVyKGZ1bmN0aW9uIChhKSB7XG5yZXR1cm4gdGhpcy5fZmlsdGVyRm4oYy5nZXRJdGVtKGEpKTtcbn0sIHRoaXMpO1xufVxuYWRkZWRLZXlzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbnJldHVybiB0aGlzLl9zb3J0Rm4oYy5nZXRJdGVtKGEpLCBjLmdldEl0ZW0oYikpO1xufS5iaW5kKHRoaXMpKTtcbnZhciBzdGFydCA9IDA7XG5mb3IgKHZhciBpID0gMDsgaSA8IGFkZGVkS2V5cy5sZW5ndGg7IGkrKykge1xuc3RhcnQgPSB0aGlzLl9pbnNlcnRSb3dJbnRvVmlld1NvcnQoc3RhcnQsIGFkZGVkS2V5c1tpXSwgcG9vbCk7XG59XG59XG59LFxuX2luc2VydFJvd0ludG9WaWV3U29ydDogZnVuY3Rpb24gKHN0YXJ0LCBrZXksIHBvb2wpIHtcbnZhciBjID0gdGhpcy5jb2xsZWN0aW9uO1xudmFyIGl0ZW0gPSBjLmdldEl0ZW0oa2V5KTtcbnZhciBlbmQgPSB0aGlzLnJvd3MubGVuZ3RoIC0gMTtcbnZhciBpZHggPSAtMTtcbnZhciBzb3J0Rm4gPSB0aGlzLl9zb3J0Rm4gfHwgdGhpcy5fa2V5U29ydC5iaW5kKHRoaXMpO1xud2hpbGUgKHN0YXJ0IDw9IGVuZCkge1xudmFyIG1pZCA9IHN0YXJ0ICsgZW5kID4+IDE7XG52YXIgbWlkS2V5ID0gdGhpcy5fb3JkZXJlZEtleXNbbWlkXTtcbnZhciBjbXAgPSBzb3J0Rm4oYy5nZXRJdGVtKG1pZEtleSksIGl0ZW0pO1xuaWYgKGNtcCA8IDApIHtcbnN0YXJ0ID0gbWlkICsgMTtcbn0gZWxzZSBpZiAoY21wID4gMCkge1xuZW5kID0gbWlkIC0gMTtcbn0gZWxzZSB7XG5pZHggPSBtaWQ7XG5icmVhaztcbn1cbn1cbmlmIChpZHggPCAwKSB7XG5pZHggPSBlbmQgKyAxO1xufVxudGhpcy5fb3JkZXJlZEtleXMuc3BsaWNlKGlkeCwgMCwga2V5KTtcbnRoaXMucm93cy5zcGxpY2UoaWR4LCAwLCB0aGlzLl9pbnNlcnRSb3coaWR4LCBwb29sLCBjLmdldEl0ZW0oa2V5KSkpO1xucmV0dXJuIGlkeDtcbn0sXG5fYXBwbHlTcGxpY2VzQXJyYXlTb3J0OiBmdW5jdGlvbiAoc3BsaWNlcykge1xudmFyIGtleXMgPSB0aGlzLl9vcmRlcmVkS2V5cztcbnZhciBwb29sID0gW107XG5zcGxpY2VzLmZvckVhY2goZnVuY3Rpb24gKHMpIHtcbmZvciAodmFyIGkgPSAwOyBpIDwgcy5yZW1vdmVkLmxlbmd0aDsgaSsrKSB7XG5wb29sLnB1c2godGhpcy5fZGV0YWNoUm93KHMuaW5kZXggKyBpKSk7XG59XG50aGlzLnJvd3Muc3BsaWNlKHMuaW5kZXgsIHMucmVtb3ZlZC5sZW5ndGgpO1xufSwgdGhpcyk7XG52YXIgYyA9IHRoaXMuY29sbGVjdGlvbjtcbnNwbGljZXMuZm9yRWFjaChmdW5jdGlvbiAocykge1xudmFyIGFyZ3MgPSBbXG5zLmluZGV4LFxucy5yZW1vdmVkLmxlbmd0aFxuXS5jb25jYXQocy5hZGRlZCk7XG5rZXlzLnNwbGljZS5hcHBseShrZXlzLCBhcmdzKTtcbmZvciAodmFyIGkgPSAwOyBpIDwgcy5hZGRlZC5sZW5ndGg7IGkrKykge1xudmFyIGl0ZW0gPSBjLmdldEl0ZW0ocy5hZGRlZFtpXSk7XG52YXIgcm93ID0gdGhpcy5faW5zZXJ0Um93KHMuaW5kZXggKyBpLCBwb29sLCBpdGVtKTtcbnRoaXMucm93cy5zcGxpY2Uocy5pbmRleCArIGksIDAsIHJvdyk7XG59XG59LCB0aGlzKTtcbn0sXG5fZGV0YWNoUm93OiBmdW5jdGlvbiAoaWR4KSB7XG52YXIgcm93ID0gdGhpcy5yb3dzW2lkeF07XG52YXIgcGFyZW50Tm9kZSA9IFBvbHltZXIuZG9tKHRoaXMpLnBhcmVudE5vZGU7XG5mb3IgKHZhciBpID0gMDsgaSA8IHJvdy5fY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbnZhciBlbCA9IHJvdy5fY2hpbGRyZW5baV07XG5Qb2x5bWVyLmRvbShyb3cucm9vdCkuYXBwZW5kQ2hpbGQoZWwpO1xufVxucmV0dXJuIHJvdztcbn0sXG5faW5zZXJ0Um93OiBmdW5jdGlvbiAoaWR4LCBwb29sLCBpdGVtKSB7XG52YXIgcm93ID0gcG9vbCAmJiBwb29sLnBvcCgpIHx8IHRoaXMuX2dlbmVyYXRlUm93KGlkeCwgaXRlbSk7XG52YXIgYmVmb3JlUm93ID0gdGhpcy5yb3dzW2lkeF07XG52YXIgYmVmb3JlTm9kZSA9IGJlZm9yZVJvdyA/IGJlZm9yZVJvdy5fY2hpbGRyZW5bMF0gOiB0aGlzO1xudmFyIHBhcmVudE5vZGUgPSBQb2x5bWVyLmRvbSh0aGlzKS5wYXJlbnROb2RlO1xuUG9seW1lci5kb20ocGFyZW50Tm9kZSkuaW5zZXJ0QmVmb3JlKHJvdy5yb290LCBiZWZvcmVOb2RlKTtcbnJldHVybiByb3c7XG59LFxuX2dlbmVyYXRlUm93OiBmdW5jdGlvbiAoaWR4LCBpdGVtKSB7XG52YXIgbW9kZWwgPSB7IF9fa2V5X186IHRoaXMuY29sbGVjdGlvbi5nZXRLZXkoaXRlbSkgfTtcbm1vZGVsW3RoaXMuYXNdID0gaXRlbTtcbm1vZGVsW3RoaXMuaW5kZXhBc10gPSBpZHg7XG52YXIgcm93ID0gdGhpcy5zdGFtcChtb2RlbCk7XG5yZXR1cm4gcm93O1xufSxcbl9zaG93SGlkZUNoaWxkcmVuOiBmdW5jdGlvbiAoaGlkZGVuKSB7XG5pZiAodGhpcy5yb3dzKSB7XG5mb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucm93cy5sZW5ndGg7IGkrKykge1xudGhpcy5yb3dzW2ldLl9zaG93SGlkZUNoaWxkcmVuKGhpZGRlbik7XG59XG59XG59LFxuX2ZvcndhcmRJbnN0YW5jZVByb3A6IGZ1bmN0aW9uIChyb3csIHByb3AsIHZhbHVlKSB7XG5pZiAocHJvcCA9PSB0aGlzLmFzKSB7XG52YXIgaWR4O1xuaWYgKHRoaXMuX3NvcnRGbiB8fCB0aGlzLl9maWx0ZXJGbikge1xuaWR4ID0gdGhpcy5pdGVtcy5pbmRleE9mKHRoaXMuY29sbGVjdGlvbi5nZXRJdGVtKHJvdy5fX2tleV9fKSk7XG59IGVsc2Uge1xuaWR4ID0gcm93W3RoaXMuaW5kZXhBc107XG59XG50aGlzLnNldCgnaXRlbXMuJyArIGlkeCwgdmFsdWUpO1xufVxufSxcbl9mb3J3YXJkSW5zdGFuY2VQYXRoOiBmdW5jdGlvbiAocm93LCBwYXRoLCB2YWx1ZSkge1xuaWYgKHBhdGguaW5kZXhPZih0aGlzLmFzICsgJy4nKSA9PT0gMCkge1xudGhpcy5ub3RpZnlQYXRoKCdpdGVtcy4nICsgcm93Ll9fa2V5X18gKyAnLicgKyBwYXRoLnNsaWNlKHRoaXMuYXMubGVuZ3RoICsgMSksIHZhbHVlKTtcbn1cbn0sXG5fZm9yd2FyZFBhcmVudFByb3A6IGZ1bmN0aW9uIChwcm9wLCB2YWx1ZSkge1xuaWYgKHRoaXMucm93cykge1xudGhpcy5yb3dzLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xucm93Ll9fc2V0UHJvcGVydHkocHJvcCwgdmFsdWUsIHRydWUpO1xufSwgdGhpcyk7XG59XG59LFxuX2ZvcndhcmRQYXJlbnRQYXRoOiBmdW5jdGlvbiAocGF0aCwgdmFsdWUpIHtcbmlmICh0aGlzLnJvd3MpIHtcbnRoaXMucm93cy5mb3JFYWNoKGZ1bmN0aW9uIChyb3cpIHtcbnJvdy5ub3RpZnlQYXRoKHBhdGgsIHZhbHVlLCB0cnVlKTtcbn0sIHRoaXMpO1xufVxufSxcbl9mb3J3YXJkSXRlbVBhdGg6IGZ1bmN0aW9uIChwYXRoLCB2YWx1ZSkge1xuaWYgKHRoaXMuX3Jvd0ZvcktleSkge1xudmFyIGRvdCA9IHBhdGguaW5kZXhPZignLicpO1xudmFyIGtleSA9IHBhdGguc3Vic3RyaW5nKDAsIGRvdCA8IDAgPyBwYXRoLmxlbmd0aCA6IGRvdCk7XG52YXIgaWR4ID0gdGhpcy5fcm93Rm9yS2V5W2tleV07XG52YXIgcm93ID0gdGhpcy5yb3dzW2lkeF07XG5pZiAocm93KSB7XG5pZiAoZG90ID49IDApIHtcbnBhdGggPSB0aGlzLmFzICsgJy4nICsgcGF0aC5zdWJzdHJpbmcoZG90ICsgMSk7XG5yb3cubm90aWZ5UGF0aChwYXRoLCB2YWx1ZSwgdHJ1ZSk7XG59IGVsc2Uge1xucm93Ll9fc2V0UHJvcGVydHkodGhpcy5hcywgdmFsdWUsIHRydWUpO1xufVxufVxufVxufSxcbml0ZW1Gb3JFbGVtZW50OiBmdW5jdGlvbiAoZWwpIHtcbnZhciBpbnN0YW5jZSA9IHRoaXMubW9kZWxGb3JFbGVtZW50KGVsKTtcbnJldHVybiBpbnN0YW5jZSAmJiBpbnN0YW5jZVt0aGlzLmFzXTtcbn0sXG5rZXlGb3JFbGVtZW50OiBmdW5jdGlvbiAoZWwpIHtcbnZhciBpbnN0YW5jZSA9IHRoaXMubW9kZWxGb3JFbGVtZW50KGVsKTtcbnJldHVybiBpbnN0YW5jZSAmJiBpbnN0YW5jZS5fX2tleV9fO1xufSxcbmluZGV4Rm9yRWxlbWVudDogZnVuY3Rpb24gKGVsKSB7XG52YXIgaW5zdGFuY2UgPSB0aGlzLm1vZGVsRm9yRWxlbWVudChlbCk7XG5yZXR1cm4gaW5zdGFuY2UgJiYgaW5zdGFuY2VbdGhpcy5pbmRleEFzXTtcbn1cbn0pO1xuUG9seW1lcih7XG5pczogJ2FycmF5LXNlbGVjdG9yJyxcbnByb3BlcnRpZXM6IHtcbml0ZW1zOiB7XG50eXBlOiBBcnJheSxcbm9ic2VydmVyOiAnX2l0ZW1zQ2hhbmdlZCdcbn0sXG5zZWxlY3RlZDoge1xudHlwZTogT2JqZWN0LFxubm90aWZ5OiB0cnVlXG59LFxudG9nZ2xlOiBCb29sZWFuLFxubXVsdGk6IEJvb2xlYW5cbn0sXG5faXRlbXNDaGFuZ2VkOiBmdW5jdGlvbiAoKSB7XG5pZiAoQXJyYXkuaXNBcnJheSh0aGlzLnNlbGVjdGVkKSkge1xuZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNlbGVjdGVkLmxlbmd0aDsgaSsrKSB7XG50aGlzLnVubGlua1BhdGhzKCdzZWxlY3RlZC4nICsgaSk7XG59XG59IGVsc2Uge1xudGhpcy51bmxpbmtQYXRocygnc2VsZWN0ZWQnKTtcbn1cbmlmICh0aGlzLm11bHRpKSB7XG50aGlzLnNlbGVjdGVkID0gW107XG59IGVsc2Uge1xudGhpcy5zZWxlY3RlZCA9IG51bGw7XG59XG59LFxuZGVzZWxlY3Q6IGZ1bmN0aW9uIChpdGVtKSB7XG5pZiAodGhpcy5tdWx0aSkge1xudmFyIHNjb2wgPSBQb2x5bWVyLkNvbGxlY3Rpb24uZ2V0KHRoaXMuc2VsZWN0ZWQpO1xudmFyIHNpZHggPSB0aGlzLnNlbGVjdGVkLmluZGV4T2YoaXRlbSk7XG5pZiAoc2lkeCA+PSAwKSB7XG52YXIgc2tleSA9IHNjb2wuZ2V0S2V5KGl0ZW0pO1xudGhpcy5zcGxpY2UoJ3NlbGVjdGVkJywgc2lkeCwgMSk7XG50aGlzLnVubGlua1BhdGhzKCdzZWxlY3RlZC4nICsgc2tleSk7XG5yZXR1cm4gdHJ1ZTtcbn1cbn0gZWxzZSB7XG50aGlzLnNlbGVjdGVkID0gbnVsbDtcbnRoaXMudW5saW5rUGF0aHMoJ3NlbGVjdGVkJyk7XG59XG59LFxuc2VsZWN0OiBmdW5jdGlvbiAoaXRlbSkge1xudmFyIGljb2wgPSBQb2x5bWVyLkNvbGxlY3Rpb24uZ2V0KHRoaXMuaXRlbXMpO1xudmFyIGtleSA9IGljb2wuZ2V0S2V5KGl0ZW0pO1xuaWYgKHRoaXMubXVsdGkpIHtcbnZhciBzY29sID0gUG9seW1lci5Db2xsZWN0aW9uLmdldCh0aGlzLnNlbGVjdGVkKTtcbnZhciBza2V5ID0gc2NvbC5nZXRLZXkoaXRlbSk7XG5pZiAoc2tleSA+PSAwKSB7XG5pZiAodGhpcy50b2dnbGUpIHtcbnRoaXMuZGVzZWxlY3QoaXRlbSk7XG59XG59IGVsc2Uge1xudGhpcy5wdXNoKCdzZWxlY3RlZCcsIGl0ZW0pO1xudGhpcy5hc3luYyhmdW5jdGlvbiAoKSB7XG5za2V5ID0gc2NvbC5nZXRLZXkoaXRlbSk7XG50aGlzLmxpbmtQYXRocygnc2VsZWN0ZWQuJyArIHNrZXksICdpdGVtcy4nICsga2V5KTtcbn0pO1xufVxufSBlbHNlIHtcbmlmICh0aGlzLnRvZ2dsZSAmJiBpdGVtID09IHRoaXMuc2VsZWN0ZWQpIHtcbnRoaXMuZGVzZWxlY3QoKTtcbn0gZWxzZSB7XG50aGlzLmxpbmtQYXRocygnc2VsZWN0ZWQnLCAnaXRlbXMuJyArIGtleSk7XG50aGlzLnNlbGVjdGVkID0gaXRlbTtcbn1cbn1cbn1cbn0pO1xuUG9seW1lcih7XG5pczogJ2RvbS1pZicsXG5leHRlbmRzOiAndGVtcGxhdGUnLFxucHJvcGVydGllczoge1xuJ2lmJzoge1xudHlwZTogQm9vbGVhbixcbnZhbHVlOiBmYWxzZSxcbm9ic2VydmVyOiAnX3F1ZXVlUmVuZGVyJ1xufSxcbnJlc3RhbXA6IHtcbnR5cGU6IEJvb2xlYW4sXG52YWx1ZTogZmFsc2UsXG5vYnNlcnZlcjogJ19xdWV1ZVJlbmRlcidcbn1cbn0sXG5iZWhhdmlvcnM6IFtQb2x5bWVyLlRlbXBsYXRpemVyXSxcbl9xdWV1ZVJlbmRlcjogZnVuY3Rpb24gKCkge1xudGhpcy5fZGVib3VuY2VUZW1wbGF0ZSh0aGlzLl9yZW5kZXIpO1xufSxcbmRldGFjaGVkOiBmdW5jdGlvbiAoKSB7XG50aGlzLl90ZWFyZG93bkluc3RhbmNlKCk7XG59LFxuYXR0YWNoZWQ6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLmlmICYmIHRoaXMuY3Rvcikge1xudGhpcy5hc3luYyh0aGlzLl9lbnN1cmVJbnN0YW5jZSk7XG59XG59LFxucmVuZGVyOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9mbHVzaFRlbXBsYXRlcygpO1xufSxcbl9yZW5kZXI6IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLmlmKSB7XG5pZiAoIXRoaXMuY3Rvcikge1xudGhpcy5fd3JhcFRleHROb2Rlcyh0aGlzLl9jb250ZW50IHx8IHRoaXMuY29udGVudCk7XG50aGlzLnRlbXBsYXRpemUodGhpcyk7XG59XG50aGlzLl9lbnN1cmVJbnN0YW5jZSgpO1xudGhpcy5fc2hvd0hpZGVDaGlsZHJlbigpO1xufSBlbHNlIGlmICh0aGlzLnJlc3RhbXApIHtcbnRoaXMuX3RlYXJkb3duSW5zdGFuY2UoKTtcbn1cbmlmICghdGhpcy5yZXN0YW1wICYmIHRoaXMuX2luc3RhbmNlKSB7XG50aGlzLl9zaG93SGlkZUNoaWxkcmVuKCk7XG59XG5pZiAodGhpcy5pZiAhPSB0aGlzLl9sYXN0SWYpIHtcbnRoaXMuZmlyZSgnZG9tLWNoYW5nZScpO1xudGhpcy5fbGFzdElmID0gdGhpcy5pZjtcbn1cbn0sXG5fZW5zdXJlSW5zdGFuY2U6IGZ1bmN0aW9uICgpIHtcbmlmICghdGhpcy5faW5zdGFuY2UpIHtcbnRoaXMuX2luc3RhbmNlID0gdGhpcy5zdGFtcCgpO1xudmFyIHJvb3QgPSB0aGlzLl9pbnN0YW5jZS5yb290O1xudmFyIHBhcmVudCA9IFBvbHltZXIuZG9tKFBvbHltZXIuZG9tKHRoaXMpLnBhcmVudE5vZGUpO1xucGFyZW50Lmluc2VydEJlZm9yZShyb290LCB0aGlzKTtcbn1cbn0sXG5fdGVhcmRvd25JbnN0YW5jZTogZnVuY3Rpb24gKCkge1xuaWYgKHRoaXMuX2luc3RhbmNlKSB7XG52YXIgYyA9IHRoaXMuX2luc3RhbmNlLl9jaGlsZHJlbjtcbmlmIChjKSB7XG52YXIgcGFyZW50ID0gUG9seW1lci5kb20oUG9seW1lci5kb20oY1swXSkucGFyZW50Tm9kZSk7XG5jLmZvckVhY2goZnVuY3Rpb24gKG4pIHtcbnBhcmVudC5yZW1vdmVDaGlsZChuKTtcbn0pO1xufVxudGhpcy5faW5zdGFuY2UgPSBudWxsO1xufVxufSxcbl93cmFwVGV4dE5vZGVzOiBmdW5jdGlvbiAocm9vdCkge1xuZm9yICh2YXIgbiA9IHJvb3QuZmlyc3RDaGlsZDsgbjsgbiA9IG4ubmV4dFNpYmxpbmcpIHtcbmlmIChuLm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERSAmJiBuLnRleHRDb250ZW50LnRyaW0oKSkge1xudmFyIHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG5yb290Lmluc2VydEJlZm9yZShzLCBuKTtcbnMuYXBwZW5kQ2hpbGQobik7XG5uID0gcztcbn1cbn1cbn0sXG5fc2hvd0hpZGVDaGlsZHJlbjogZnVuY3Rpb24gKCkge1xudmFyIGhpZGRlbiA9IHRoaXMuX19oaWRlVGVtcGxhdGVDaGlsZHJlbl9fIHx8ICF0aGlzLmlmO1xuaWYgKHRoaXMuX2luc3RhbmNlKSB7XG50aGlzLl9pbnN0YW5jZS5fc2hvd0hpZGVDaGlsZHJlbihoaWRkZW4pO1xufVxufSxcbl9mb3J3YXJkUGFyZW50UHJvcDogZnVuY3Rpb24gKHByb3AsIHZhbHVlKSB7XG5pZiAodGhpcy5faW5zdGFuY2UpIHtcbnRoaXMuX2luc3RhbmNlW3Byb3BdID0gdmFsdWU7XG59XG59LFxuX2ZvcndhcmRQYXJlbnRQYXRoOiBmdW5jdGlvbiAocGF0aCwgdmFsdWUpIHtcbmlmICh0aGlzLl9pbnN0YW5jZSkge1xudGhpcy5faW5zdGFuY2Uubm90aWZ5UGF0aChwYXRoLCB2YWx1ZSwgdHJ1ZSk7XG59XG59XG59KTtcblBvbHltZXIuSW1wb3J0U3RhdHVzID0ge1xuX3JlYWR5OiBmYWxzZSxcbl9jYWxsYmFja3M6IFtdLFxud2hlbkxvYWRlZDogZnVuY3Rpb24gKGNiKSB7XG5pZiAodGhpcy5fcmVhZHkpIHtcbmNiKCk7XG59IGVsc2Uge1xudGhpcy5fY2FsbGJhY2tzLnB1c2goY2IpO1xufVxufSxcbl9pbXBvcnRzTG9hZGVkOiBmdW5jdGlvbiAoKSB7XG50aGlzLl9yZWFkeSA9IHRydWU7XG50aGlzLl9jYWxsYmFja3MuZm9yRWFjaChmdW5jdGlvbiAoY2IpIHtcbmNiKCk7XG59KTtcbnRoaXMuX2NhbGxiYWNrcyA9IFtdO1xufVxufTtcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuUG9seW1lci5JbXBvcnRTdGF0dXMuX2ltcG9ydHNMb2FkZWQoKTtcbn0pO1xuaWYgKHdpbmRvdy5IVE1MSW1wb3J0cykge1xuSFRNTEltcG9ydHMud2hlblJlYWR5KGZ1bmN0aW9uICgpIHtcblBvbHltZXIuSW1wb3J0U3RhdHVzLl9pbXBvcnRzTG9hZGVkKCk7XG59KTtcbn1cblBvbHltZXIoe1xuaXM6ICdkb20tYmluZCcsXG5leHRlbmRzOiAndGVtcGxhdGUnLFxuY3JlYXRlZDogZnVuY3Rpb24gKCkge1xuUG9seW1lci5JbXBvcnRTdGF0dXMud2hlbkxvYWRlZCh0aGlzLl9yZWFkeVNlbGYuYmluZCh0aGlzKSk7XG59LFxuX3JlZ2lzdGVyRmVhdHVyZXM6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3ByZXBFeHRlbmRzKCk7XG50aGlzLl9wcmVwQ29uc3RydWN0b3IoKTtcbn0sXG5faW5zZXJ0Q2hpbGRyZW46IGZ1bmN0aW9uICgpIHtcbnZhciBwYXJlbnREb20gPSBQb2x5bWVyLmRvbShQb2x5bWVyLmRvbSh0aGlzKS5wYXJlbnROb2RlKTtcbnBhcmVudERvbS5pbnNlcnRCZWZvcmUodGhpcy5yb290LCB0aGlzKTtcbn0sXG5fcmVtb3ZlQ2hpbGRyZW46IGZ1bmN0aW9uICgpIHtcbmlmICh0aGlzLl9jaGlsZHJlbikge1xuZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xudGhpcy5yb290LmFwcGVuZENoaWxkKHRoaXMuX2NoaWxkcmVuW2ldKTtcbn1cbn1cbn0sXG5faW5pdEZlYXR1cmVzOiBmdW5jdGlvbiAoKSB7XG59LFxuX3Njb3BlRWxlbWVudENsYXNzOiBmdW5jdGlvbiAoZWxlbWVudCwgc2VsZWN0b3IpIHtcbmlmICh0aGlzLmRhdGFIb3N0KSB7XG5yZXR1cm4gdGhpcy5kYXRhSG9zdC5fc2NvcGVFbGVtZW50Q2xhc3MoZWxlbWVudCwgc2VsZWN0b3IpO1xufSBlbHNlIHtcbnJldHVybiBzZWxlY3Rvcjtcbn1cbn0sXG5fcHJlcENvbmZpZ3VyZTogZnVuY3Rpb24gKCkge1xudmFyIGNvbmZpZyA9IHt9O1xuZm9yICh2YXIgcHJvcCBpbiB0aGlzLl9wcm9wZXJ0eUVmZmVjdHMpIHtcbmNvbmZpZ1twcm9wXSA9IHRoaXNbcHJvcF07XG59XG50aGlzLl9zZXR1cENvbmZpZ3VyZSA9IHRoaXMuX3NldHVwQ29uZmlndXJlLmJpbmQodGhpcywgY29uZmlnKTtcbn0sXG5hdHRhY2hlZDogZnVuY3Rpb24gKCkge1xuaWYgKCF0aGlzLl9jaGlsZHJlbikge1xudGhpcy5fdGVtcGxhdGUgPSB0aGlzO1xudGhpcy5fcHJlcEFubm90YXRpb25zKCk7XG50aGlzLl9wcmVwRWZmZWN0cygpO1xudGhpcy5fcHJlcEJlaGF2aW9ycygpO1xudGhpcy5fcHJlcENvbmZpZ3VyZSgpO1xudGhpcy5fcHJlcEJpbmRpbmdzKCk7XG5Qb2x5bWVyLkJhc2UuX2luaXRGZWF0dXJlcy5jYWxsKHRoaXMpO1xudGhpcy5fY2hpbGRyZW4gPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLnJvb3QuY2hpbGROb2Rlcyk7XG59XG50aGlzLl9pbnNlcnRDaGlsZHJlbigpO1xudGhpcy5maXJlKCdkb20tY2hhbmdlJyk7XG59LFxuZGV0YWNoZWQ6IGZ1bmN0aW9uICgpIHtcbnRoaXMuX3JlbW92ZUNoaWxkcmVuKCk7XG59XG59KTtcbn0pKCk7XG5cbn0pIiwiZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixmdW5jdGlvbigpIHtcbnZhciBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdO1xudmFyIHJvb3QgPSBib2R5LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikpO1xucm9vdC5zZXRBdHRyaWJ1dGUoXCJoaWRkZW5cIixcIlwiKTtcbnJvb3QuaW5uZXJIVE1MPVwiPGRvbS1tb2R1bGUgaWQ9XFxcImxvZ2luLWZvcm1cXFwiPjx0ZW1wbGF0ZT48c3RhdHVzPjwvc3RhdHVzPjxpcm9uLWNvbGxhcHNlIGlkPVxcXCJsb2dpblxcXCI+PGxvZ2luLWFjdGlvbnM+PGEgaHJlZj1cXFwiL2F1dGgvdHdpdHRlclxcXCI+PHBhcGVyLWJ1dHRvbiBpZD1cXFwibG9naW4tYnV0dG9uXFxcIiBjbGFzcz1cXFwicHJpbWFyeVxcXCI+TG9naW4gd2l0aCBUd2l0dGVyPC9wYXBlci1idXR0b24+PC9hPjxhIGhyZWY9XFxcIi9hdXRoL2dpdGh1YlxcXCI+PHBhcGVyLWJ1dHRvbiBpZD1cXFwibG9naW4tYnV0dG9uXFxcIiBjbGFzcz1cXFwicHJpbWFyeVxcXCI+TG9naW4gd2l0aCBHaXRodWI8L3BhcGVyLWJ1dHRvbj48L2E+PC9sb2dpbi1hY3Rpb25zPjwvaXJvbi1jb2xsYXBzZT48aXJvbi1jb2xsYXBzZSBpZD1cXFwicmVnaXN0ZXJcXFwiPjxpbnB1dCBwbGFjZWhvbGRlcj1cXFwiTmFtZVxcXCI+PGlucHV0IHBsYWNlaG9sZGVyPVxcXCJFbWFpbFxcXCI+PGlucHV0IHBsYWNlaG9sZGVyPVxcXCJQYXNzd29yZFxcXCI+PGxvZ2luLWFjdGlvbnM+PHBhcGVyLWJ1dHRvbiBpZD1cXFwicmVnaXN0ZXItYnV0dG9uXFxcIiBjbGFzcz1cXFwicHJpbWFyeVxcXCI+UmVnaXN0ZXI8L3BhcGVyLWJ1dHRvbj48cGFwZXItYnV0dG9uIGlkPVxcXCJjYW5jZWwtcmVnaXN0ZXItYnV0dG9uXFxcIiBjbGFzcz1cXFwiYXNpZGVcXFwiPkNhbmNlbDwvcGFwZXItYnV0dG9uPjwvbG9naW4tYWN0aW9ucz48L2lyb24tY29sbGFwc2U+PC90ZW1wbGF0ZT48L2RvbS1tb2R1bGU+PHN0eWxlPmlucHV0e2Rpc3BsYXk6YmxvY2s7bWFyZ2luLWJvdHRvbToxMHB4O3dpZHRoOjEwMCV9aDF7bWFyZ2luLWJvdHRvbToxMHB4fWxvZ2luLWFjdGlvbnN7ZGlzcGxheTpibG9jazttYXJnaW4tdG9wOjIwcHh9PC9zdHlsZT5cIjtcbjsoZnVuY3Rpb24oKSB7XG5Qb2x5bWVyKHtcblxuICBpczogXCJsb2dpbi1mb3JtXCIsXG4gIFxuICBsaXN0ZW5lcnM6IHtcbiAgICAnbG9naW4tYnV0dG9uLnRhcCc6ICdsb2dpbicsXG4gICAgLy8tICdzaG93LXJlZ2lzdGVyLWJ1dHRvbi50YXAnOiAnc2hvd1JlZ2lzdGVyJyxcbiAgICAncmVnaXN0ZXItYnV0dG9uLnRhcCc6ICdyZWdpc3RlcicsXG4gICAgJ2NhbmNlbC1yZWdpc3Rlci1idXR0b24udGFwJzogJ2NhbmNlbFJlZ2lzdGVyJ1xuICB9LFxuICBcbiAgLy8tIExPQ0tFUiAmIExPQURFRFxuICByZWFkeSA6IGZ1bmN0aW9uKCkge1xuICBcbiAgICB2YXIgU29ja2V0ICA9IHdpbmRvdy5zb2NrZXQ7XG4gICAgLy8tIEdhYmJhLkxvZ2luLmluaXQoKTtcbiAgICB0aGlzLiQubG9naW4udG9nZ2xlKCk7IC8vIHNob3cgbG9naW4gZm9ybVxuICAgIFxuICAgIFNvY2tldC5vbigndXNlcjpjb25uZWN0ZWQnLCBmdW5jdGlvbiggZGF0YSApIHtcbiAgICAgIGNvbnNvbGUubG9nKCd1c2VyIGNvbm5lY3RlZDonKTtcbiAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgIH0pO1xuICAgIFxuICB9LFxuICBcbiAgLy8tIFBST0NFU1MgTE9HSU5cbiAgbG9naW4gOiBmdW5jdGlvbigpIHtcbiAgXG4gICAgLy8tIHZhciB1ID0gdGhpcy4kLnVzZXJuYW1lLnZhbHVlLFxuICAgICAgICAvLy0gZSA9IHRoaXMuJC5lbWFpbC52YWx1ZSxcbiAgICB2YXIgU29ja2V0ICA9IHdpbmRvdy5zb2NrZXQ7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZygndXNlci5sb2dpbigpJyk7XG4gICAgXG4gICAgLy8tIHRoaXMuc29ja2V0ID0gd2luZG93LnNvY2tldCA9IGlvLmNvbm5lY3QoIHNlcnZlciApO1xuICAgIFxuICAgIC8vLSBTRU5EIExPR0lOIFRPIFNPQ0tFVFxuICAgIFNvY2tldC5lbWl0KCd1c2VyOmxvZ2luJywge30pO1xuXG4gIH0sXG4gIFxuICAvLy0gUFJPQ0VTUyBSRUdJU1RSQVRJT05cbiAgcmVnaXN0ZXIgOiBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmluZm8oJ3JlZ2lzdGVyIHVzZXInKTtcbiAgfSxcbiAgXG4gIC8vLSBTSE9XIFJFR0lTVEVSIEZPUk1cbiAgc2hvd1JlZ2lzdGVyIDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kLnJlZ2lzdGVyLnRvZ2dsZSgpO1xuICAgIHRoaXMuJC5sb2dpbi50b2dnbGUoKTtcbiAgfSxcbiAgXG4gIC8vLSBISURFIFJFR0lTVEVSIEZPUk1cbiAgY2FuY2VsUmVnaXN0ZXIgOiBmdW5jdGlvbigpIHsgICAgICBcbiAgICB0aGlzLiQucmVnaXN0ZXIudG9nZ2xlKCk7XG4gICAgdGhpcy4kLmxvZ2luLnRvZ2dsZSgpO1xuICB9XG5cbn0pO1xufSkoKTtcblxufSkiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXG4gIGNvbnN0IHBvcnQgPSB3aW5kb3cubG9jYXRpb24ucG9ydCxcbiAgICAgICAgcHJvdG9jb2wgPSB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nLFxuICAgICAgICBob3N0ID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lO1xuXG4gIHJldHVybiB7XG5cbiAgICBpbml0IDogZnVuY3Rpb24gKCBzZXJ2ZXIgKSB7XG5cbiAgICAgIHRoaXMuc29ja2V0ID0gd2luZG93LnNvY2tldCA9IGlvLmNvbm5lY3QoIHNlcnZlciApO1xuXG4gICAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdGVkJywgZnVuY3Rpb24oIGRhdGEgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzb2NrZXQgY29ubmVjdGVkOiAnKTtcbiAgICAgICAgY29uc29sZS5sb2coZGF0YS5jb25uZWN0ZWQpO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvcicsIGZ1bmN0aW9uKCBkYXRhICkge1xuICAgICAgICBjb25zb2xlLmxvZygnc29ja2V0IGVycm9yOiAnKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihkYXRhLmVycik7XG4gICAgICB9KTtcblxuICAgIH0sXG5cbiAgICBjb25maWcgOiB7ICAvLyBHTE9CQUwgQ09ORklHIFNFVFRJTkdTXG5cbiAgICAgIC8vIFNFVCBUTyBGQUxTRSBUTyBESVNBQkxFIExPR0dJTkcgVE8gQ09OU09MRVxuICAgICAgZGVidWcgOiB0cnVlLFxuXG4gICAgICAvLyBCQVNFIFVSTCdTXG4gICAgICB1cmwgOiB7XG4gICAgICAgICAgYmFzZTogcHJvdG9jb2wgKyBob3N0ICsgKCBwb3J0ICE9PSAnJyA/ICc6JyArIHBvcnQgOiAnJykgKyAnLycsIC8vQkFTRSBVUkxcbiAgICAgIH1cblxuICAgIH0gLy8gRU5EIENPTkZJR1xuXG4gIH07XG5cbn07XG4iLCIvLyBQT0xZTUVSIENPTVBPTkVOVFNcblwidXNlIHN0cmljdFwiO1xuXG5yZXF1aXJlKFwiLi4vX2Jvd2VyL3BhcGVyLWJ1dHRvbi9wYXBlci1idXR0b24uaHRtbFwiKTtcbnJlcXVpcmUoXCIuLi9fYm93ZXIvaXJvbi1jb2xsYXBzZS9pcm9uLWNvbGxhcHNlLmh0bWxcIik7XG5cbnZhciBHYWJiYSA9IHdpbmRvdy5HYWJiYSA9IHJlcXVpcmUoXCIuL19tb2R1bGVzL2dhYmJhXCIpKCk7XG5cbi8vIEdBQkJBIFRFTVBMQVRFU1xucmVxdWlyZShcIi4uL19kaXN0L3RlbXBsYXRlcy9sb2dpbi1mb3JtLmh0bWxcIik7Il19
