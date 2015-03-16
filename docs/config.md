# CONFIG

Pog is meant to both be useable out of the box and über-configurable. Most of the important bits can be customized in ```config/_settings.js```:


##### APP NAME
This isn't used in many places by default, but is available throughout the app should you ever need it.

```
app.name = 'Pog JS'; // the name of your app
```

##### DIRECTORY STRUCTURE
Pog uses these references to link to files throughout the application. If we want to change the location of anything, you are welcome to, just make sure you update it here:

```
app.dir = {
	controllers: app.base + '/app/controllers/',
	css: app.base + '/public/css/',
	img: app.base + '/public/img/',
	js: app.base + '/public/js/',
	models: app.base + '/app/models/',
	public: app.base + '/public/',
	root: app.base,
	views: app.base + '/app/views/'
};
```

##### AUTO ROUTER

Pog comes with an [auto-router](https://www.npmjs.com/package/pog-router) module that is enabled by default. But, if you prefer not to use it for any reason, you can disable it here.

```
autoRouter: true,
```

##### BROWSER SYNC
The Gulpfile that ships with Pog enables [Browser Sync](http://www.browsersync.io/) by default. If you want to disable it, or customize the port it runs on, you can do so here.

```
browserSync: {
	use: true,
	port: 3000,
},
```

##### DATABASE
Select the database driver you want to use with your models. Currently setup for RethinkDB and MongoDB (with more on the way). Set to false to disable Pog from connecting to any database. Database specific settings can be set in ```config/db```.

```
db: 'rethink', // rethink, mongo
```

##### CACHE
Whether to enable caching.

```
cache: false, // whether to use caching
```

##### CORS
Whether to enable [CORS](https://github.com/evert0n/koa-cors).

```
cors: false
```

##### DEBUG
Pog may show more detailed messages in the console with this set to true.

```
debug: true,
```

##### HTML & CSS ENGINES
Pog supports a small handful or html templating languages and css pre-processors (with more coming soon).

###### HTML
- Jade (default)
- Handlebars
- Nunjucks

###### CSS
- Stylus
- Sass & Less support is in the works, but they don't yet seem to be working right with iojs.


```
// set your html & css template engine
engines: {
	html: {
		template: 'jade', // options: (handlebars|jade|nunjucks)
		extension: '.jade' // options: (.hbs|.jade|.js)
	},
	css: {
		template: 'stylus', // options: (stylus|sass|less) - set false to just use vanilla css
		extension: '.styl' // options: (.styl|.sass|.less)
	},
	cssLibrary: false, // options: (axis|bourbon|nib) - set to false for none
},
```

##### ERROR REPORTING

###### browser
By default, if Pog encounters an error it will display an error page telling you exactly what happened. You may prefer not to display errors in the browser for security reasons, set ```browser: false``` and Pog will only display a generic error message in the browser. If you disable this, you will need to check the node/iojs console for more information about errors you may encounter.

###### file
When set to true, this will create error logs in the ```log``` folder. This is still a bit of a work in progress, so you may not see much showing up here yet.


```
errorReporting: {
	browser: true,
	file: true
},
```

##### GZIP
Whether to enable [gzip](https://www.npmjs.com/package/koa-gzip) compression or not.

```
gzip: true,
```

##### LOGGING
Setting this to false will disable Pog from logging anything to the console.

```
logging: {
	console: true
},
```

##### PORT
Pog runs on port 1981 be default, you can change that here.

```
port: 1981,
```

##### PRETTIFY
Use this to decide whether to send pretty or minified html, css & js to the browser.

```
prettify: {
	html: true, // whether to pretify html
	css: true, // whether to pretify css
	js: true // whether to pretify js
},
```

##### POLYFILLS
Whether to enable [Polyfills](https://github.com/polyfills/polyfills)

```
polyfills: false,
```

##### PROTOCOL
Whether to use ```http``` or ```https``` by default.

```
protocol: 'http://', // options: (http|https)
```

##### SECRET
This is mostly a placeholder for future use. It isn't used anywhere yet, but is available to the app should you need a secret for security settings anywhere.

```
secret: 'supercalifragilisticexpialidocious', // placeholder for now, will be implemented later
```

##### SOCKET
Pog is configured with socket.io out of the box, but is not enabled by default. Set this to true and you'll have a socket.io server up and and running.

```
socket: {
	use: false,
	port: 1982
},
```