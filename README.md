# Torrent Tweeter

Checks Kick Ass Torrent for your favorite TV shows and tweets you when a new episode is out!

### Messy Code

The project was initially targeted for a Tessel device. So I tried to minimize dependencies and  avoided fancy stuff. But sadly, I could not run `cheerio` on Tessel and didn't have the enthusiasm to write another layer of regex. I will clean this code up when I get some more free time. ES6 is in my wishlist. 

Meanwhile, I would very much appreciate feedback/pull requests.  

### Installation

* Clone the repository. 
* `npm install` in the repository
* Create a new twitter app and generate access tokens. 
* Copy the `configs.sample.js` file and name it `configs.js`. Customize it as you need. 


### Running

Run: `node main.js` or just `node .`. That should run the script.