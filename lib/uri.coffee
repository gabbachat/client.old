module.exports = (app, req) ->
  {
    segment: (i) ->
      uri = req.url.split('?')
      uri = uri[0].split('/')
      uri[i]
    full: ->
      req.url
    rest: ->
      ctrl = undefined
      id = undefined
      model = undefined
      action = undefined
      uri = req.url.split('?')
      uri = uri[0].split('/')
      ctrl = uri[1]
      model = ctrl
      action = uri[2]
      id = uri[3]
      {
        controller: ctrl
        action: action
        id: id
      }
    action: ->
      if @rest().action != undefined
        @rest().action
      else
        ''
    controller: ->
      if @rest().controller != undefined
        @rest().controller
      else
        'index'
    id: ->
      if @rest().id != undefined
        @rest().id
      else
        ''
    get: (which) ->
      req.query[which]

  }
