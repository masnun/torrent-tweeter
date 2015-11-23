# Torrent Tweeter

Checks Kick Ass Torrent for your favorite TV shows and tweets you when a new episode is out!

### Messy Code

The project was initially targeted for a Tessel device. So I tried to minimize dependencies and  avoided fancy stuff. But sadly, I could not run `cheerio` on Tessel and didn't have the enthusiasm to write another layer of regex. 

<del>I will clean this code up when I get some more free time. ES6 is in my wishlist. </del> I have started refactoring to ES6. Meanwhile, I would very much appreciate feedback/pull requests.  

### Installation

* Clone the repository. 
* `npm install` in the repository
* Create a new twitter app and generate access tokens. 
* Copy the `configs.sample.es6` file and name it `configs.es6`. Customize it as you need.
* I used babel to transpile ES6. I used file watchers for babel inside Webstorm. Feel free to use a gulpfile or whatever you like. `src/*.es6` => `dist/*.js` is the transformation done. 


### Running

Run: `node dist/main.js` or just `node .`. That should run the script.