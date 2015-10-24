Angular REST api using Socket server(includes client side code and UI)
======================

Demo for rest api to work with an angular frontend.

web server routes are located in config/routes/routes_web.js

rest server routes are found in config/routes/routes_rest.js

app.js is the main entry-point for the app and calls main.js

main.js is the module that starts servers for Express, REST and Socket server

This example includes an express web server and a rest server along with a socket server sending events back and forth to the client.

### Starting the server ( run npm install first )
```javascript
> npm start
```

### Open one or more tabs in the browser and go to this url
```javascript
> http://localhost:4000/
```

One way to manually test you POST successfully is by downloading the Chrome app named [Advanced REST Client](https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo?hl=en-US) from the Chrome Web Store.
### Posting from Advance REST Client
```{engine='bash'}
> url: http://localhost:4001/id/someuser1
> Select POST radio button
> Select application/json from the content-type drop-down menu
> payload: {"somekey":"somevalue"}
> Click Send
```

After posting from Advanced REST Client, your logs should look something like this in your Chrome developer tools console. Values may be different depending on your payload value and the route id you are posting to.
```{engine='bash'}
Event messageReceived : {"data":{"id":"someuser1","body":{"somekey":"somevalue","sender":"yourname"},"query":{}}}
```

After a successful POST, in Advanced REST Client, you should see a response status code 200, the loading time and the request and response headers.