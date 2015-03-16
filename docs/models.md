# MODELS

Pog includes a useful model helper that will bootstrap all of the routes & controllers needed to make your models work. You will still need to create the controller and model files, but this should still greatly simplify	 the process.


## DEFAULT

If you want to use the default settings, you can bootstrap a new model with one simple line of code (it's recommended to add this to app/routes.js):

```
pog.model.load('blog')
```

This will automatically load  ```app/controllers/blogController.js``` as well as make the following routes accessible:

- [http://localhost/blog/create](http://localhost/blog/create)  [ POST ]
- [http://localhost/blog/delete](http://localhost/blog/delete)  [ DELETE ]
- [http://localhost/blog/find](http://localhost/blog/find)      [ GET ]
- [http://localhost/blog/read](http://localhost/blog/read)      [ GET ]
- [http://localhost/blog/update](http://localhost/blog/update)  [ PUT ]


## CUSTOM

If you're not happy with the default routes, you can easily customize them like so:

```
pog.model.load('user', {
  base : 'api/v1/',
  methods : {
    register : 'post',
    login : 'post',
    info : 'get',
    find : 'get',
    remove : 'delete',
    update : 'put'
  }
});
```

Notice the use of the ```base``` property above. This allows you to append a "base" to the url you want your model to live under. The example above will create the following routes:

- [http://localhost/api/v1/user/create](http://localhost/api/v1/user/create)      [ POST ]
- [http://localhost/api/v1/user/info](http://localhost/api/v1/user/info)          [ POST ]
- [http://localhost/api/v1/user/login](http://localhost/api/v1/user/login)        [ GET ]
- [http://localhost/api/v1/user/register](http://localhost/api/v1/user/register)  [ GET ]
- [http://localhost/api/v1/user/remove](http://localhost/api/v1/user/remove)      [ DELETE ]
- [http://localhost/api/v1/user/update](http://localhost/api/v1/user/update)      [ PUT ]



### URL PARAMETERS

You can also specify url parameters to be passed if you wish. This makes the syntax slightly more verbose, but is still pretty easy

```
app.model.load('blog', {
  methods : {
    read : {
      type: 'get',
      params : ':title/:id'
    },
    search : {
      type: 'get',
      params : ':term/'
    },
    write : {
      type: 'post'
    },
  }
});
```


##### This will create the following url routes and methods:

- [http://localhost/blog/read/awesome-blog-post/12345](http://localhost/blog/read/awesome-blog-post/12345) [ GET ]
- [http://localhost/blog/search/cats](http://localhost/blog/search/cats) [ GET ]
- [http://localhost/blog/write](http://localhost/blog/write)                                               [ POST ]


The value of any url parameters will be passed to your controller in a "data" object. Here's an example of how you can access the data in your controller:

```
exports.read = function *(pog, data) {

  return yield pog.render('blog/read', {
    title : data.title,
    id: data.id
  });

};


search = function *(pog, data) {

  return yield pog.render('blog/search', {
    search_term : data.term,
    site: pog.app
  });

};
```




