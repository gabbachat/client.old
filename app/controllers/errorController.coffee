# GENERIC ERROR
exports.throwGeneric = (gabba) ->
  gabba.render 'errors/default',
    title: gabba.errorTitle
    error: gabba.errorMessage
    site: gabba.app
    url: gabba.request.originalUrl
  yield;

# 404 ERROR
exports.throw404 = (gabba) ->
  gabba.render 'errors/404',
    title: gabba.errorTitle
    error: gabba.errorMessage
    site: gabba.app
    url: gabba.request.originalUrl
  yield;

# 500 ERROR
exports.throw500 = (gabba) ->
  gabba.render 'errors/500',
    title: gabba.errorTitle
    error: gabba.errorMessage
    site: gabba.app
    url: gabba.request.originalUrl
  yield;
