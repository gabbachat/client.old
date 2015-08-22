
module.exports = {

  # INITIALIZE
  init: ->

    Router = require '../_dist/js/modules/router'
    # UserModel = require '../_dist/models/user'

    # @model.user = new UserModel()

    # DEFINE ROUTER
    @Router = new Router()

    # ADD TO WINDOW
    window.app = @

    console.log 'Gabba gabba hey'

  # MODELS
  model: {},

  # NAVIGATION OBJECT
  navigate: (url) ->
    app.history.navigate url, true
    return

  # auth: require '../_dist/js/modules/auth'

}

module.exports.init()
