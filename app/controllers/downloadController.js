extends layouts/default

block content

  section.login

    br

    h1 gabba Chat

    br

    input(id="username", name="username", placeholder="Jiminy Cricket").name
    br
    input(id="email", name="email", placeholder="jiminy@cricket.com" type="email").email
    button.go Go

    br
    br

    a(href="download/mac.zip").download Download the Mac app
