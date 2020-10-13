/* REQUIRES */
require('rootpath')();
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');

const app = express();

/* USES */
app.use(bodyparser.json());
app.use(cors());

/* MODULES */
app.use('/items', require('./controladores/items'));

//Setting up server
const server = app.listen(process.env.PORT || 3600, function () {
	const port = server.address().port;
	console.log("Servidor Corriendo en Puerto: ", port);
});