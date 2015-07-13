define(["jade"],function(jade){

return function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<dom-module id=\"gabba\"><template><div>{{greeting}}</div></template><script>Polymer({\n  is: \"gabba\",\n\n  properties: {\n    greeting: {\n      type: String,\n      value: \"Hello!\"\n    }\n  }\n});</script></dom-module>");;return buf.join("");
};

});
