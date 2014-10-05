# The hunt

A small 2D multiplayer game written in Javascript for moderne browsers which support the `canvas` and `requestAnimationFrame` APIs.

Use the arrow keys to move around and `space` to shoot (has no effect at the moment).

To start the game clone this repository and run the following in a terminal.

	npm install
	node ./server.js

The game is built around an authorative server. Big parts of the code are both run on the client and the server, accomplished using `browserify` on the client and `Node.js` on the server. The clients use interpolation to smooth the movement of other players, and local client prediction to make the game responsive, while keeping the local player state synchronized with the server. The server uses lag compensation to verify bullet hits.

The game is available on [heroku][heroku]. The server might not be able to keep up with all the traffic, so you can try the offline, single-player [demo][demo]. It doesn't need the server, runs locally in the browser.

[heroku]: http://the-hunt.herokuapp.com "The Hunt"
[demo]: http://kapetan.github.io/the-hunt/dist/offline.html "Offline demo"
