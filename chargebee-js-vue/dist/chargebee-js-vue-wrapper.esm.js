function genUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}

var CardComponent = {
  name: 'CardComponent',
  props: {
    fonts: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    classes: {
      type: Object,
      "default": function _default() {
        return {};
      }
    },
    styles: {
      type: Object,
      "default": function _default() {
        return {};
      }
    },
    placeholder: {
      type: Object,
      "default": function _default() {
        return {};
      }
    },
    icon: {
      type: Boolean,
      "default": true
    },
    locale: {
      type: String,
      "default": 'en'
    },
    currency: {
      type: String,
      "default": 'USD'
    }
  },
  data: function data() {
    return {
      cbInstance: null,
      cbComponent: null,
      moduleLoaded: false,
      elementId: "card-component-".concat(genUUID())
    };
  },
  computed: {
    componentOptions: function componentOptions() {
      return {
        fonts: this.fonts,
        classes: this.classes,
        locale: this.locale,
        style: this.styles,
        placeholder: this.placeholder,
        icon: this.icon,
        currency: this.currency
      };
    }
  },
  provide: function provide() {
    var _this = this;

    var cardState = {};
    Object.defineProperty(cardState, 'cbComponent', {
      enumerable: true,
      get: function get() {
        return _this.cbComponent;
      }
    });
    return {
      cardState: cardState
    };
  },
  methods: {
    tokenize: function tokenize(additionalData) {
      return this.cbComponent.tokenize(additionalData);
    },
    authorizeWith3ds: function authorizeWith3ds(paymentIntent, additionalData, callbacks) {
      return this.cbComponent.authorizeWith3ds(paymentIntent, additionalData, callbacks);
    },
    focus: function focus() {
      this.cbComponent.focus();
    },
    blur: function blur() {
      this.cbComponent.blur();
    },
    clear: function clear() {
      this.cbComponent.clear();
    }
  },
  mounted: function mounted() {
    var _this2 = this;

    var cbInstance = Chargebee.getInstance();
    var options = this.componentOptions;
    cbInstance.load('components').then(function () {
      _this2.cbInstance = cbInstance;

      var cbComponent = _this2.cbInstance.createComponent('card', options);

      _this2.cbComponent = cbComponent;
      _this2.moduleLoaded = true; // Attach listeners (only applicable for combined field)

      Object.keys(_this2.$listeners).map(function (listener) {
        _this2.cbComponent.on(listener, function (data) {
          _this2.$emit(listener, data);
        });
      });
    });
  },
  updated: function updated() {
    var _this3 = this;

    if (this.cbComponent && this.moduleLoaded && this.cbComponent.status == 0) {
      this.$nextTick(function () {
        _this3.cbComponent.mount("#".concat(_this3.elementId));
      });
    }
  },
  watch: {
    componentOptions: function componentOptions() {
      if (this.cbComponent) {
        this.cbComponent.update(this.componentOptions);
      }
    }
  },
  render: function render(h) {
    var children = this.moduleLoaded && this.$slots["default"] || [];
    return h('div', {
      attrs: {
        id: this.elementId
      },
      "class": this["class"]
    }, children);
  }
};

var CardElementMixin = {
  name: 'CardElementMixin',
  props: {
    styles: {
      type: Object,
      "default": function _default() {
        return {};
      }
    },
    placeholder: {
      type: String,
      "default": function _default() {
        return '';
      }
    }
  },
  inject: {
    cardState: {
      "default": function _default() {
        return null;
      }
    }
  },
  data: function data() {
    return {
      field: null
    };
  },
  computed: {
    fieldOptions: function fieldOptions() {
      return {
        style: this.styles || {},
        placeholder: this.placeholder
      };
    },
    elementId: function elementId() {
      return "card-".concat(this.id, "-").concat(genUUID());
    }
  },
  methods: {
    getField: function getField() {
      return this.field;
    },
    attachListener: function attachListener(listener) {
      var _this = this;

      this.field.on(listener, function (data) {
        _this.$emit(listener, data);
      });
    },
    initializeField: function initializeField(cbComponent) {
      if (cbComponent) {
        var options = this.fieldOptions;
        this.field = cbComponent.createField(this.id, options).at("#".concat(this.elementId));
        if (this.$parent.onMount) this.$parent.onMount(); // Attach listeners if any

        this.attachListener('ready');
        this.attachListener('focus');
        this.attachListener('blur');
        this.attachListener('change');
      }
    },
    focus: function focus() {
      this.field.focus();
    },
    blur: function blur() {
      this.field.blur();
    },
    clear: function clear() {
      this.field.clear();
    }
  },
  watch: {
    'cardState.cbComponent': function cardStateCbComponent(cbComponent, _) {
      if (!this.field) {
        this.initializeField(cbComponent);
      }
    },
    fieldOptions: function fieldOptions() {
      if (this.field) {
        var options = this.fieldOptions;
        this.field.update(options);
      }
    }
  },
  mounted: function mounted() {
    this.cardState && this.initializeField(this.cardState.cbComponent);
  }
};

//
var script = {
  name: 'CardNumber',
  props: {
    styles: {
      type: Object,
      "default": function _default() {
        return {};
      }
    },
    placeholder: {
      type: String,
      "default": function _default() {
        return '';
      }
    }
  },
  data: function data() {
    return {
      id: 'number',
      loaded: false,
      classname: this["class"]
    };
  },
  mixins: [CardElementMixin]
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;

/* script */
const __vue_script__ = script;
/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { class: _vm.classname, attrs: { id: _vm.elementId } },
    [_vm._t("default")],
    2
  )
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = undefined;
  /* scoped */
  const __vue_scope_id__ = undefined;
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__ = /*#__PURE__*/normalizeComponent_1(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    undefined,
    undefined,
    undefined
  );

//
var script$1 = {
  name: 'CardExpiry',
  props: {
    styles: {
      type: Object,
      "default": function _default() {
        return {};
      }
    },
    placeholder: {
      type: String,
      "default": function _default() {
        return '';
      }
    }
  },
  data: function data() {
    return {
      id: 'expiry',
      loaded: false,
      classname: this["class"]
    };
  },
  mixins: [CardElementMixin]
};

/* script */
const __vue_script__$1 = script$1;
/* template */
var __vue_render__$1 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { class: _vm.classname, attrs: { id: _vm.elementId } },
    [_vm._t("default")],
    2
  )
};
var __vue_staticRenderFns__$1 = [];
__vue_render__$1._withStripped = true;

  /* style */
  const __vue_inject_styles__$1 = undefined;
  /* scoped */
  const __vue_scope_id__$1 = undefined;
  /* module identifier */
  const __vue_module_identifier__$1 = undefined;
  /* functional template */
  const __vue_is_functional_template__$1 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$1 = /*#__PURE__*/normalizeComponent_1(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    false,
    undefined,
    undefined,
    undefined
  );

//
var script$2 = {
  name: 'CardCvv',
  props: {
    styles: {
      type: Object,
      "default": function _default() {
        return {};
      }
    },
    placeholder: {
      type: String,
      "default": function _default() {
        return '';
      }
    }
  },
  data: function data() {
    return {
      id: 'cvv',
      loaded: false,
      classname: this["class"]
    };
  },
  mixins: [CardElementMixin]
};

/* script */
const __vue_script__$2 = script$2;

/* template */
var __vue_render__$2 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { class: _vm.classname, attrs: { id: _vm.elementId } },
    [_vm._t("default")],
    2
  )
};
var __vue_staticRenderFns__$2 = [];
__vue_render__$2._withStripped = true;

  /* style */
  const __vue_inject_styles__$2 = undefined;
  /* scoped */
  const __vue_scope_id__$2 = undefined;
  /* module identifier */
  const __vue_module_identifier__$2 = undefined;
  /* functional template */
  const __vue_is_functional_template__$2 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$2 = /*#__PURE__*/normalizeComponent_1(
    { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
    __vue_inject_styles__$2,
    __vue_script__$2,
    __vue_scope_id__$2,
    __vue_is_functional_template__$2,
    __vue_module_identifier__$2,
    false,
    undefined,
    undefined,
    undefined
  );

var index = {
  install: function install(Vue) {
    Vue.component('card-component', CardComponent);
    Vue.component('card-number', __vue_component__);
    Vue.component('card-expiry', __vue_component__$1);
    Vue.component('card-cvv', __vue_component__$2);
  }
};

export default index;
export { CardComponent, __vue_component__$2 as CardCvv, __vue_component__$1 as CardExpiry, __vue_component__ as CardNumber };
