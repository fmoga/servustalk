
/*=========================================================== 

  Configuration file

  Also contains definitions for emotes and sounds

===========================================================*/


// Time Constants
var ONE_SECOND = 1000;
var ONE_MINUTE = 60 * ONE_SECOND;
var ONE_HOUR = 60 * ONE_MINUTE;
var DAY_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
var MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Timeouts
var IDLE_TIMEOUT = 5 * ONE_MINUTE; // 5 min
var FLICKER_TITLE_INTERVAL = 2 * ONE_SECOND; // 2 sec
var MAX_TIMESTAMP_DIFF = 60 * 1000; // 1 min

// Sounds
var MENTION_SOUND = '/public/audio/touche.wav';

// Calendar
var GOOGLE_CALENDAR_ATOM_FEED = 'http://www.google.com/calendar/feeds/fv690mq7i7jk6l0mhu9hd5uvms%40group.calendar.google.com/public/full';
var GOOGLE_CALENDAR_DAYS_INTERVAL = 30;
var GOOGLE_CALENDAR_UPDATE_INTERVAL = 2 * ONE_MINUTE; // 2 mins

// History
var HISTORY_MESSAGES_PER_PAGE = 100;

// Avatars
var DEFAULT_PICTURE = "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg";

// Location
var ACCEPTABLE_ACCURACY = 400; // meters
var MOCK_LOCATIONS = [
  "20.000 leagues under the sea",
  "the underworld",
  "higher than the empire state",
  "moon"
];


// Emotes
var EMOTICONS = [
  { code: '\[..\]', url:'public/smileys/transformer.gif'},
  { code: ':BZ', url:'public/smileys/115.gif'},
  { code: ':bZ', url:'public/smileys/115.gif'},
  { code: ':Bz', url:'public/smileys/115.gif'},
  { code: ':bz', url:'public/smileys/115.gif'},
  { code: '\^#(^', url:'public/smileys/114.gif'},
  { code: ':-Bd', url:'public/smileys/113.gif'},
  { code: ':-bD', url:'public/smileys/113.gif'},
  { code: ':-bd', url:'public/smileys/113.gif'},
  { code: ':-BD', url:'public/smileys/113.gif'},
  { code: ':-q', url:'public/smileys/112.gif'},
  { code: ':-Q', url:'public/smileys/112.gif'},
  { code: '\\m\/', url:'public/smileys/111.gif'},
  { code: '\\M\/', url:'public/smileys/111.gif'},
  { code: ':!!', url:'public/smileys/110.gif'},
  { code: 'x_x', url:'public/smileys/109.gif'},
  { code: 'X_x', url:'public/smileys/109.gif'},
  { code: 'x_x', url:'public/smileys/109.gif'},
  { code: 'X_X', url:'public/smileys/109.gif'},
  { code: ':o3', url:'public/smileys/108.gif'},
  { code: ':O3', url:'public/smileys/108.gif'},
  { code: '%-(', url:'public/smileys/107.gif'},
  { code: ':-??', url:'public/smileys/106.gif'},
  { code: '8->', url:'public/smileys/105.gif'},
  { code: ':-t', url:'public/smileys/104.gif'},
  { code: ':-T', url:'public/smileys/104.gif'},
  { code: ':-h', url:'public/smileys/103.gif'},
  { code: ':-H', url:'public/smileys/103.gif'},
  { code: '~x(', url:'public/smileys/102.gif'},
  { code: '~X(', url:'public/smileys/102.gif'},
  { code: ':-c', url:'public/smileys/101.gif'},
  { code: ':-C', url:'public/smileys/101.gif'},
  { code: ':)\]', url:'public/smileys/100.gif'},
  { code: '(\*)', url:'public/smileys/79.gif'},
  { code: ':-j', url:'public/smileys/78.gif'},
  { code: ':-J', url:'public/smileys/78.gif'},
  { code: '\^:)^', url:'public/smileys/77.gif'},
  { code: ':-@', url:'public/smileys/76.gif'},
  { code: '(%)', url:'public/smileys/75.gif'},
  { code: ';))', url:'public/smileys/71.gif'},
  { code: '>:\/', url:'public/smileys/70.gif'},
  { code: '\\:d\/', url:'public/smileys/69.gif'},
  { code: '\\:D\/', url:'public/smileys/69.gif'},
  { code: '\[-x', url:'public/smileys/68.gif'},
  { code: '\[-X', url:'public/smileys/68.gif'},
  { code: ':)>-', url:'public/smileys/67.gif'},
  { code: 'b-(', url:'public/smileys/66.gif'},
  { code: 'B-(', url:'public/smileys/66.gif'},
  { code: ':-"', url:'public/smileys/65.gif'},
  { code: '$-)', url:'public/smileys/64.gif'},
  { code: '\[-o<', url:'public/smileys/63.gif'},
  { code: '\[-O<', url:'public/smileys/63.gif'},
  { code: ':-l', url:'public/smileys/62.gif'},
  { code: ':-L', url:'public/smileys/62.gif'},
  { code: '>-)', url:'public/smileys/61.gif'},
  { code: '=:)', url:'public/smileys/60.gif'},
  { code: '8-x', url:'public/smileys/59.gif'},
  { code: '8-X', url:'public/smileys/59.gif'},
  { code: '\*-:)', url:'public/smileys/58.gif'},
  { code: '~o)', url:'public/smileys/57.gif'},
  { code: '~O)', url:'public/smileys/57.gif'},
  { code: '(~~)', url:'public/smileys/56.gif'},
  { code: '\*\*==', url:'public/smileys/55.gif'},
  { code: '%%-', url:'public/smileys/54.gif'},
  { code: '@};', url:'public/smileys/53.gif'},
  { code: '~:>', url:'public/smileys/52.gif'},
  { code: ':(|)', url:'public/smileys/51.gif'},
  { code: '3:-o', url:'public/smileys/50.gif'},
  { code: '3:-O', url:'public/smileys/50.gif'},
  { code: ':@)', url:'public/smileys/49.gif'},
  { code: '<):)', url:'public/smileys/48.gif'},
  { code: '>:p', url:'public/smileys/47.gif'},
  { code: '>:P', url:'public/smileys/47.gif'},
  { code: ':-<', url:'public/smileys/46.gif'},
  { code: ':-w', url:'public/smileys/45.gif'},
  { code: ':-W', url:'public/smileys/45.gif'},
  { code: ':^o', url:'public/smileys/44.gif'},
  { code: ':^O', url:'public/smileys/44.gif'},
  { code: '@-)', url:'public/smileys/43.gif'},
  { code: '@_@', url:'public/smileys/43.gif'},
  { code: ':-sS', url:'public/smileys/42.gif'},
  { code: ':-Ss', url:'public/smileys/42.gif'},
  { code: ':-ss', url:'public/smileys/42.gif'},
  { code: ':-SS', url:'public/smileys/42.gif'},
  { code: '=d>', url:'public/smileys/41.gif'},
  { code: '=D>', url:'public/smileys/41.gif'},
  { code: '#-o', url:'public/smileys/40.gif'},
  { code: '#-O', url:'public/smileys/40.gif'},
  { code: ':-?', url:'public/smileys/39.gif'},
  { code: '=p~', url:'public/smileys/38.gif'},
  { code: '=P~', url:'public/smileys/38.gif'},
  { code: '(:|', url:'public/smileys/37.gif'},
  { code: '<:-p', url:'public/smileys/36.gif'},
  { code: '<:-P', url:'public/smileys/36.gif'},
  { code: '8-}', url:'public/smileys/35.gif'},
  { code: ':o)', url:'public/smileys/34.gif'},
  { code: ':O)', url:'public/smileys/34.gif'},
  { code: '\[-(', url:'public/smileys/33.gif'},
  { code: ':-\$', url:'public/smileys/32.gif'},
  { code: ':-&', url:'public/smileys/31.gif'},
  { code: 'l-)', url:'public/smileys/30.gif'},
  { code: 'L-)', url:'public/smileys/30.gif'},
  { code: '8-|', url:'public/smileys/29.gif'},
  { code: 'i-)', url:'public/smileys/28.gif'},
  { code: 'I-)', url:'public/smileys/28.gif'},
  { code: '=;', url:'public/smileys/27.gif'},
  { code: ':-b', url:'public/smileys/26.gif'},
  { code: ':-B', url:'public/smileys/26.gif'},
  { code: 'o:)', url:'public/smileys/25.gif'},
  { code: 'O:)', url:'public/smileys/25.gif'},
  { code: 'o:-)', url:'public/smileys/25.gif'},
  { code: 'O:-)', url:'public/smileys/25.gif'},
  { code: '=))', url:'public/smileys/24.gif'},
  { code: '\/:)', url:'public/smileys/23.gif'},
  { code: ':|', url:'public/smileys/22.gif'},
  { code: ':))', url:'public/smileys/21.gif'},
  { code: ':((', url:'public/smileys/20.gif'},
  { code: '>:)', url:'public/smileys/19.gif'},
  { code: '#:-s', url:'public/smileys/18.gif'},
  { code: '#:-S', url:'public/smileys/18.gif'},
  { code: ':-s', url:'public/smileys/17.gif'},
  { code: ':-S', url:'public/smileys/17.gif'},
  { code: 'b-)', url:'public/smileys/16.gif'},
  { code: 'B-)', url:'public/smileys/16.gif'},
  { code: ':>', url:'public/smileys/15.gif'},
  { code: ':->', url:'public/smileys/15.gif'},
  { code: 'x-(', url:'public/smileys/14.gif'},
  { code: 'X-(', url:'public/smileys/14.gif'},
  { code: 'x(', url:'public/smileys/14.gif'},
  { code: 'X(', url:'public/smileys/14.gif'},
  { code: ':o', url:'public/smileys/13.gif'},
  { code: ':O', url:'public/smileys/13.gif'},
  { code: ':-o', url:'public/smileys/13.gif'},
  { code: ':-O', url:'public/smileys/13.gif'},
  { code: '=((', url:'public/smileys/12.gif'},
  { code: ':\*', url:'public/smileys/11.gif'},
  { code: ':-\*', url:'public/smileys/11.gif'},
  { code: ':-p', url:'public/smileys/10.gif'},
  { code: ':-P', url:'public/smileys/10.gif'},
  { code: ':p', url:'public/smileys/10.gif'},
  { code: ':P', url:'public/smileys/10.gif'},
  { code: ':">', url:'public/smileys/9.gif'},
  { code: ':-x', url:'public/smileys/8.gif'},
  { code: ':-X', url:'public/smileys/8.gif'},
  { code: ':x', url:'public/smileys/8.gif'},
  { code: ':X', url:'public/smileys/8.gif'},
  { code: ':-\/', url:'public/smileys/7.gif'},
  { code: '>:d<', url:'public/smileys/6.gif'},
  { code: '>:D<', url:'public/smileys/6.gif'},
  { code: ';;)', url:'public/smileys/5.gif'},
  { code: ':-d', url:'public/smileys/4.gif'},
  { code: ':-D', url:'public/smileys/4.gif'},
  { code: ':d', url:'public/smileys/4.gif'},
  { code: ':D', url:'public/smileys/4.gif'},
  { code: ';-)', url:'public/smileys/3.gif'},
  { code: ';)', url:'public/smileys/3.gif'},
  { code: ':-(', url:'public/smileys/2.gif'},
  { code: ':(', url:'public/smileys/2.gif'},
  { code: ':-)', url:'public/smileys/1.gif'},
  { code: ':)', url:'public/smileys/1.gif'},
  { code: 'loop', url:'public/smileys/loop.gif'},
  { code: 'bro', url:'public/smileys/bro.gif'},
  { code: 'boian', url:''},
  { code: 'fail', url:''},
  { code: 'eroare', url:''},
  { code: 'spart', url:'public/smileys/casper.png'},
  { code: '\n', url:''}
];

// Memes
var MAX_MEME_TEXT_LENGTH = 2 * 8; // lines * characters
var ALLOWED_MEMES = {};
