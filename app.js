/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
'use strict';
var log4js        = require('log4js');
var logger        = log4js.getLogger('SampleWebApp');
var express       = require('express');
var session       = require('express-session');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var http          = require('http');
var util          = require('util');
var app           = express();
var expressJWT    = require('express-jwt');
var jwt           = require('jsonwebtoken');
var bearerToken   = require('express-bearer-token');
var path          = require('path');
var cors          = require('cors');
// var acl           = require('express-acl');
var router        = express.Router();

//server angular frontend files from root path
// router.use('/', express.static('client', {redirect:false}));

// //rewrite virtual urls to angular app to enable refreshing of internal pages
// router.get('*', function (req, res, next){
//     res.sendFile(path.resolve('client/index.html'));
// })

require('./config.js');
var hfc           = require('fabric-client');
var helper        = require('./app/helper.js');
var createChannel = require('./app/create-channel.js');
var join          = require('./app/join-channel.js');
var install       = require('./app/install-chaincode.js');
var instantiate   = require('./app/instantiate-chaincode.js');
var invoke        = require('./app/invoke-transaction.js');
var query         = require('./app/query.js');
var host = process.env.HOST || hfc.getConfigSetting('host');
var port = process.env.PORT || hfc.getConfigSetting('port');
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// SET CONFIGURATONS ////////////////////////////
///////////////////////////////////////////////////////////////////////////////
app.options('*', cors());
app.use(cors());
//support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
	extended: false
}));


// Auth Middleware - This will check if the token is valid
// Only the requests that start with /api/v1/* will be checked for the token.
// app.all('/api/v1/*', [require('./api/middlewares/validateRequest')]);
// acl.config({
//     filename: 'nacl.json',
//     path: __dirname,
//     status: 'Access Denied by Role',
//     message: 'Access Denied by Role',
// 	baseUrl: '/api/v1/',
// 	defaultRole: 'Admin'
// });
// app.use(acl.authorize.unless({path: ['/api/v1/get_all_users/']}));


//Enable Cross Origin Resource Sharing
app.all('/*', function (req, res, next) {
    // CORS headers
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key,Cache-Control,X-Requested-With,Access-Control-Allow-Origin,Access-Control-Allow-Credentials');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

// this line requires and runs the code from our routes.js file and passes it app
let routes = require('./routes');
routes(app);

// set up a static file server that points to the "client" directory
app.use(express.static(path.join(__dirname, './client')));
//

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// START SERVER /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var server = http.createServer(app).listen(port, function() {});
logger.info('****************** SERVER STARTED ************************');
logger.info('***************  http://%s:%s  ******************',host,port);
server.timeout = 240000;

function getErrorMessage(field) {
	var response = {
		success: false,
		message: field + ' field is missing or Invalid in the request'
	};
	return response;
}
/////////////////////////////////////////////////////////////////////////////
///////////////////////////// Server End ////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////