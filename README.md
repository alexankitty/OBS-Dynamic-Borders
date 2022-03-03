# OBS-Dynamic-Borders
Webpage that uses source name matching to dynamically draw borders

# Basics
Load it into OBS via a web browser source and make sure you have OBS-Websockets set up. Be sure to change the randomized password in Border-Resize.js to whatever you're authenticating to OBS with (or remove it to disable)
Add +Border to the stream source to draw a border around it, change the CSS to adjust the borders as needed.

# Important
Leaverages obs-websocket.js from the dist on obs-websocket-js. Without their work this project would not have been possible.
https://github.com/obs-websocket-community-projects/obs-websocket-js
