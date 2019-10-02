'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('InvoiceChainWebApp');
var util = require('util');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
require('../../config.js');
var hfc = require('fabric-client');
var helper = require('../helper.js');
var invoke = require('../invoke-transaction.js');
// var utilsControllers = require('./utilsControllers.js');
var registerUserConverters = require("../converters/registerUserConverters");

var verifysignature = async function(req, res, next) {
	logger.debug(' ------>>>>>> new request for %s',req.originalUrl);
	if (req.originalUrl.indexOf('/users') >= 0) {
		return next();
	}

	var token = req.headers.authorization;
	logger.info('---------->>> token 11<<<<<--------',token );
	await jwt.verify(token, 'thisismysecret', function(err, decoded) {
		if (err) {
			res.status(500).send({
				success: false,
				message: 'Failed to authenticate token. Make sure to include the ' +
					'token returned from /users call in the authorization header ' +
					' as a Bearer token'
			});
			return;
		} else {
			// add the decoded user name and org name to the request object
			// for the downstream code to use
			req.username = decoded.username;
			req.orgname = decoded.orgName;
			logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
			return req.orgname,req.username;
		}
	});
	logger.info('---------->>> orgname %s and username %s <<<<<--------',req.orgname , req.username );
}

exports.invoke_Method = async function (req, res) {

	logger.debug('==================== INVOKE ON USERAUTH CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.params.chaincodeName;
	var channelName = req.params.channelName;
	var fcn = req.body.fcn;
	// let args = [JSON.stringify(registerUserConverters.convertToChaincode(req.body))];
	var args = req.body.args;
	logger.debug('BPS - InvokeController - channelName   : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('fcn           : ' + fcn);
	logger.debug('args          : ' + args);

	var userDetails = await verifysignature(req,res);
	if (!chaincodeName) {
		res.status(500).json({message : 'Undefined Chaincode'})
		//res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		res.status(500).json({message : 'Undefined Channel Name'})
		//res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!fcn) {
		res.status(500).json({message : 'Undefined Function'})
		//res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if (!args) {
		res.status(500).json({message : 'Undefined Argument'})
		//res.json(getErrorMessage('\'args\''));
		return;
	}

	let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, req.username, req.orgname);

	if(message === 'Record already exist in Ledger.'){
		res.status(500).send({message: message})
	}
	else{
		res.status(200).send({message: message});
	}

};
