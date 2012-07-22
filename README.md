# ServusTalk

ServusTalk is a web-based group chat geared toward personal (private) use within groups of friends. It features many customizations missing from current web-based solutions which make a better experience out of informal group chatting. Biggest advantage would be that it is easy to set up a private instance.

It is written using [node.js][1], more precisely [Express][5] as a web framework, [Jade][6] as templating engine and [Socket.io][7] for the real-time communication. Mainly tested and used with Google Chrome due to desktop notifications support.

### Features

* Authentication using Google Account via OAuth 2
* HTML5 desktop notifications
* Inline display of image links
* Inline display of Youtube, Soundcloud, Mixcloud and mp3 links
* Displays upcoming events in a public Google Calendar
* Basic idle detection
* Mentions support with `@name` syntax and autocompletion using Tab key
* Archives
* Code syntax highlighting using the `[code]` tag
* Emoticons
* Chat title (topic)
* Announcements and alerts using `/#<hexcolor> text` syntax
* Input history using the up arrow
* Uptoke system similar to reddit.com
* Commands support (e.g. `/clear` will clear user's messagebox) 
* User moderation. Chat access is based on a whitelisting process. New users can't access the group chat until a whitelisted user accepts their request. First user to connect to the group chat is automatically accepted (he's probably the administrator) and then the whitelisting process continues normally. New requests, whitelisting/blacklisting trigger notifications in the chat area and they have realtime effects (e.g. blacklisting a user will instantly disconnect him from all active sessions).
* Using long-polling as Comet technique so server push works on the vast majority of browsers including on Kindle, iOS and Android-based devices
* HTML5 geolocation
* Ability to check in current location

### Installation

* Install [node.js][1] (0.6.9)
* Install [npm][2] (1.1.0-3)
* If on Windows, remove `forever` dependency from `package.json` as it is only used in production and fails to compile on Windows
* Run `npm install` in the root folder 
* Install [mongodb][3] and create database named after definition in `config.js`
* Register Google App via [Google APIs Console][4]. OAuth callback endpoint can be found at `/auth/google/callback`.
* Add `my_config.js` file as described below

        var my_config = {}
        my_config.server = {
            port: 8000
        }
        my_config.app = {
            google_client_id: "GOOGLE_CLIENT_ID_TOKEN",
            google_client_secret: "GOOGLE_CLIENT_SECRET_TOKEN",
            calendar: 'https://www.google.com/calendar/render?cid=<GOOGLE_CALENDAR_ID>'
        }
        module.exports = my_config

This will override default configs in `config.js`.

* Configure `GOOGLE_CLIENT_ID_TOKEN`, `GOOGLE_CLIENT_SECRET_TOKEN` and `GOOGLE_CALENDAR_ID` in `my_config.js`
* Configure Google Calendar atom feed link in `public/js/config.js` using the `GOOGLE_CALENDAR_ATOM_FEED` key
* Run `node app.js`
* Open browser at `http://<server host>:8000`

### Notes
* Everyauth fails to parse Google OAuth response once in a while and causes the server to crash. Workaround for this is to use the `forever` node.js module when starting the server which respawns the app once it crashes. However, this is not necessary during development.

[1]: http://nodejs.org
[2]: http://npmjs.org
[3]: http://mongodb.org
[4]: https://code.google.com/apis/console
[5]: http://expressjs.com
[6]: http://jade-lang.com
[7]: http://socket.io
