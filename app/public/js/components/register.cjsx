Model = require '../../../models/user'
React = require 'react'

ReactApp = React.createClass

  displayName: "ReactApp",

  componentWillReceiveProps: console.log 'component updated'

  componentDidMount: ->
    console.info 'loaded: shared/components/register.cjsx'
    window.socket.emit 'user:check', username: @props.profile.username

  checkUsername: ->
    window.socket.emit 'user:check', username: event.target.value

  registerUser: ->
    console.log 'attempt to register user'
    data =
      auth:
        provider: @props.provider
        secret: @props.auth.secret
        token: @props.auth.token
      github: @props.social.github.id
      twitter: @props.social.twitter.id
      profile:
        avatar:
          provider: @props.provider
          src: @props.profile.avatar
        email: @props.profile.email
        info: @props.info
        location: @props.profile.location
        password: @props.profile.password
        name: @props.profile.name
        username: @props.profile.username
      social:
        github:
          avatar: @props.social.github.avatar
          handle: @props.social.github.handle
          id: @props.social.github.id
          info: @props.social.github.info
          location: @props.social.github.location
          name: @props.social.github.name
          url: @props.social.github.url
        twitter:
          avatar: @props.social.twitter.avatar
          handle: @props.social.twitter.handle
          id: @props.social.twitter.id
          info: @props.social.twitter.info
          location: @props.social.twitter.location
          name: @props.social.twitter.name
          url: @props.social.twitter.url
    window.socket.emit 'user:register', data
    return


  render: ->
    (<section className="register">
      <img id="register-avatar" src={this.props.profile.avatar.src} className="avatar" />
      <h1>Hi {this.props.profile.name}</h1>
      <h3>We&#x27;ve pulled in your information from {this.props.auth.provider}, just select a username and you&#x27;re good to go!</h3>

      <section className="required">
        <label>username</label>
        <span id="register-username-status" className="form-status ok"></span>
        <input
              id="register-username"
              name="register-username"
              defaultValue={this.props.profile.username}
              onChange={this.checkUsername}
        />
      </section>

      <section className="optional">
        <h2>Edit Your Info</h2>
        <input id="register-name" name="register-name" placeholder="Name" defaultValue={this.props.profile.name} />
        <input id="register-email" name="register-email" placeholder="email@domain.com" />
        <label>Create a password (optional)</label>
        <input type="password" id="register-password" name="register-password" placeholder="Password"/>
      </section>

      <input type="hidden" id="register-provider" name="register-provider" value={this.props.auth.provider} readOnly />
      <input type="hidden" id="register-tkn" name="register-tkn" value={this.props.auth.token} readOnly />
      <input type="hidden" id="register-scrt" name="register-scrt" value={this.props.auth.secret} readOnly />
      <input type="hidden" id="register-location" name="register-location" value={this.props.profile.location} readOnly />


      <input type="hidden" id="twitter-id" name="twitter-id" value={this.props.social.twitter.id} readOnly />
      <input type="hidden" id="twitter-handle" name="twitter-handle" value={this.props.social.twitter.handle} readOnly />
      <input type="hidden" id="twitter-info" name="twitter-info" value={this.props.social.twitter.info} readOnly />
      <input type="hidden" id="twitter-avatar" name="twitter-avatar" value={this.props.social.twitter.avatar} readOnly />
      <input type="hidden" id="twitter-url" name="twitter-url" value={this.props.social.twitter.url} readOnly />
      <input type="hidden" id="twitter-name" name="twitter-name" value={this.props.social.twitter.name} readOnly />
      <input type="hidden" id="twitter-location" name="twitter-location" value={this.props.social.twitter.location} readOnly />

      <input type="hidden" id="github-id" name="github-id" value={this.props.social.github.id} readOnly />
      <input type="hidden" id="github-handle" name="github-handle" value={this.props.social.github.handle} readOnly />
      <input type="hidden" id="github-info" name="github-info" value={this.props.social.github.info} readOnly />
      <input type="hidden" id="github-avatar" name="github-avatar" value={this.props.social.github.avatar} readOnly />
      <input type="hidden" id="github-url" name="github-url" value={this.props.social.github.url} readOnly />
      <input type="hidden" id="github-name" name="github-name" value={this.props.social.github.name} readOnly />
      <input type="hidden" id="github-location" name="github-location" value={this.props.social.github.location} readOnly />

      <button id="register-submit" className="button primary" onClick={this.registerUser}>Go</button>

    </section>)

module.exports = ReactApp
