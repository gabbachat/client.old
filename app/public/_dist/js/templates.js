(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        if (typeof root["app"] === 'undefined' || root["app"] !== Object(root["app"])) {
            throw new Error('templatizer: window["app"] does not exist or is not an object');
        }
        root["app"].templatizer = factory();
    }
}(this, function () {
    var jade=function(){function n(n){return null!=n&&""!==n}function t(e){return(Array.isArray(e)?e.map(t):e&&"object"==typeof e?Object.keys(e).filter(function(n){return e[n]}):[e]).filter(n).join(" ")}function e(n){return i[n]||n}function r(n){var t=String(n).replace(o,e);return t===""+n?n:t}var a={};a.merge=function s(t,e){if(1===arguments.length){for(var r=t[0],a=1;a<t.length;a++)r=s(r,t[a]);return r}var i=t["class"],o=e["class"];(i||o)&&(i=i||[],o=o||[],Array.isArray(i)||(i=[i]),Array.isArray(o)||(o=[o]),t["class"]=i.concat(o).filter(n));for(var f in e)"class"!=f&&(t[f]=e[f]);return t},a.joinClasses=t,a.cls=function(n,e){for(var r=[],i=0;i<n.length;i++)e&&e[i]?r.push(a.escape(t([n[i]]))):r.push(t(n[i]));var o=t(r);return o.length?' class="'+o+'"':""},a.style=function(n){return n&&"object"==typeof n?Object.keys(n).map(function(t){return t+":"+n[t]}).join(";"):n},a.attr=function(n,t,e,r){return"style"===n&&(t=a.style(t)),"boolean"==typeof t||null==t?t?" "+(r?n:n+'="'+n+'"'):"":0==n.indexOf("data")&&"string"!=typeof t?(-1!==JSON.stringify(t).indexOf("&")&&console.warn("Since Jade 2.0.0, ampersands (`&`) in data attributes will be escaped to `&amp;`"),t&&"function"==typeof t.toISOString&&console.warn("Jade will eliminate the double quotes around dates in ISO form after 2.0.0")," "+n+"='"+JSON.stringify(t).replace(/'/g,"&apos;")+"'"):e?(t&&"function"==typeof t.toISOString&&console.warn("Jade will stringify dates in ISO form after 2.0.0")," "+n+'="'+a.escape(t)+'"'):(t&&"function"==typeof t.toISOString&&console.warn("Jade will stringify dates in ISO form after 2.0.0")," "+n+'="'+t+'"')},a.attrs=function(n,e){var r=[],i=Object.keys(n);if(i.length)for(var o=0;o<i.length;++o){var s=i[o],f=n[s];"class"==s?(f=t(f))&&r.push(" "+s+'="'+f+'"'):r.push(a.attr(s,f,!1,e))}return r.join("")};var i={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"},o=/[&<>"]/g;return a.escape=r,a.rethrow=function f(n,t,e,r){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&t||r))throw n.message+=" on line "+e,n;try{r=r||require("fs").readFileSync(t,"utf8")}catch(a){f(n,null,e)}var i=3,o=r.split("\n"),s=Math.max(e-i,0),l=Math.min(o.length,e+i),i=o.slice(s,l).map(function(n,t){var r=t+s+1;return(r==e?"  > ":"    ")+r+"| "+n}).join("\n");throw n.path=t,n.message=(t||"Jade")+":"+e+"\n"+i+"\n\n"+n.message,n},a.DebugItem=function(n,t){this.lineno=n,this.filename=t},a}(); 

    var templatizer = {};


    // chat.jade compiled template
    templatizer["chat"] = function tmpl_chat() {
        return '<section class="content"><h1>Gabba</h1><h4>Chat now...</h4></section>';
    };

    // index.jade compiled template
    templatizer["index"] = function tmpl_index() {
        return '<section class="content"><h1>Gabba</h1><h3>Welcome to the home page</h3><a href="/login">Login</a></section>';
    };

    // login.jade compiled template
    templatizer["login"] = function tmpl_login() {
        return '<section class="content"><h1>Gabba Gabba</h1><a href="/auth/github">Login with Github</a><br/><a href="/auth/twitter">Login with Twitter</a></section>';
    };

    // register-form.jade compiled template
    templatizer["register-form"] = function tmpl_register_form(locals) {
        var buf = [];
        var jade_mixins = {};
        var jade_interp;
        var locals_for_with = locals || {};
        (function(name) {
            buf.push('<section classname="register"><img id="register-avatar" src="{this.props.profile.avatar.src}" classname="avatar"/><h1 data-hook="name">Hi ' + jade.escape((jade_interp = name) == null ? "" : jade_interp) + '</h1><h3>We\'ve pulled in your information from {this.props.auth.provider}, just select a username and you\'re good to go!</h3><section classname="required"><label>username</label><span id="register-username-status" classname="form-status ok"></span><input id="register-username" name="register-username" defaultvalue="{this.props.profile.username}" onchange="{this.checkUsername}"/></section><section classname="optional"><h2>Edit Your Info</h2><input id="register-name" data-hook="name" name="register-name" placeholder="Name"' + jade.attr("value", "" + name + "", true, false) + '/><input id="register-email" name="register-email" placeholder="email@domain.com"/><label>Create a password (optional)</label><input id="register-password" type="password" name="register-password" placeholder="Password"/></section><input id="register-provider" type="hidden" name="register-provider" value="{this.props.auth.provider}" readonly=""/><input id="register-tkn" type="hidden" name="register-tkn" value="{this.props.auth.token}" readonly=""/><input id="register-scrt" type="hidden" name="register-scrt" value="{this.props.auth.secret}" readonly=""/><input id="register-location" type="hidden" name="register-location" value="{this.props.profile.location}" readonly=""/><input id="twitter-id" type="hidden" name="twitter-id" value="{this.props.social.twitter.id}" readonly=""/><input id="twitter-handle" type="hidden" name="twitter-handle" value="{this.props.social.twitter.handle}" readonly=""/><input id="twitter-info" type="hidden" name="twitter-info" value="{this.props.social.twitter.info}" readonly=""/><input id="twitter-avatar" type="hidden" name="twitter-avatar" value="{this.props.social.twitter.avatar}" readonly=""/><input id="twitter-url" type="hidden" name="twitter-url" value="{this.props.social.twitter.url}" readonly=""/><input id="twitter-name" type="hidden" name="twitter-name" value="{this.props.social.twitter.name}" readonly=""/><input id="twitter-location" type="hidden" name="twitter-location" value="{this.props.social.twitter.location}" readonly=""/><input id="github-id" type="hidden" name="github-id" value="{this.props.social.github.id}" readonly=""/><input id="github-handle" type="hidden" name="github-handle" value="{this.props.social.github.handle}" readonly=""/><input id="github-info" type="hidden" name="github-info" value="{this.props.social.github.info}" readonly=""/><input id="github-avatar" type="hidden" name="github-avatar" value="{this.props.social.github.avatar}" readonly=""/><input id="github-url" type="hidden" name="github-url" value="{this.props.social.github.url}" readonly=""/><input id="github-name" type="hidden" name="github-name" value="{this.props.social.github.name}" readonly=""/><input id="github-location" type="hidden" name="github-location" value="{this.props.social.github.location}" readonly=""/><button id="register-submit" classname="button primary" onclick="{this.registerUser}">Go</button></section>');
        }).call(this, "name" in locals_for_with ? locals_for_with.name : typeof name !== "undefined" ? name : undefined);
        return buf.join("");
    };

    // register.jade compiled template
    templatizer["register"] = function tmpl_register() {
        return '<section class="content"><h1>Register</h1></section>';
    };

    return templatizer;
}));
