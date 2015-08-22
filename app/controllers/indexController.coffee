module.exports = (gabba) ->

	console.log 'index loaded'

	gabba.render 'index',
    title: gabba.app.name
    site: gabba.app

	yield;
