module.exports = (app) ->

  console.log 'user controller loaded'

  User = app.models.user; # MAP USER MODEL TO USER VARIABLE

  return {

    # CHECK IF USER EXISTS
    check: (data) ->

      # HANDLE TWITTER
      if data.auth.provider == 'twitter'
        query = 'social.twitter.id': data.social.twitter.id

      # HANDLE GITHUB
      if data.auth.provider == 'github'
        query = 'social.github.id': data.social.github.id

      # RUN DB QUERY
      yield User.find().where(query)
            .limit(1)
            .then((data) ->

              # IF USER EXISTS
              if data.length > 0
                exists: true
                data: data

              # IF USER IS NEW
              else
                exists: false
                data: data

            # IF THERE'S AN ERROR
            ).catch (err) ->
              success: false
              data: err


    # REGISTER USER
    register: (data) ->

      user = yield @check(data) # MAKE SURE USER ISN'T ALREADY IN THE DB

      # USER IS NEW
      if user.exists == false

        # ATTEMPT TO ADD USER
        yield User.create(data)

          # IF WE SUCCEED
          .then((data) ->
            status: 'success'
            data: data

          # IF WE FAIL
          ).catch (err) ->
            status: 'error'
            data: err

      # USER EXISTS
      else if user.exists == true
        status: 'exists'
        data: user.data

      # ERROR
      else
        status: 'error'
        data: user.data

  }
