React = require 'react'

ReactApp = React.createClass

  displayName: 'ReactApp',

  componentDidMount: ->
    console.info('loaded: shared/components/chat.jsx');
    return

  render: ->
      <section className="chat">
        <h3>Logged in</h3>
      </section>

module.exports = ReactApp