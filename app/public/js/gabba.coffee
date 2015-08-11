Router = require '../_dist/js/modules/router'
UserModel = require '../_dist/models/user'

module.exports = {

  # INITIALIZE
  init: ->

    @model.user = new UserModel()

    # DEFINE ROUTER
    @Router = new Router()

    # ADD TO WINDOW
    window.gabba = @

    console.log 'Gabba gabba hey'

  # MODELS
  model: {},

  # NAVIGATION OBJECT
  navigate: (url) ->
    gabba.history.navigate url, true
    return

  auth: require '../_dist/js/modules/auth'

}

module.exports.init()
