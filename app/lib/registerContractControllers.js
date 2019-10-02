'use strict';
var log4js = require('log4js');
var util = require('util');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
require('../../config.js');
var hfc = require('fabric-client');
var helper = require('../helper.js');
var invoke = require('../invoke-transaction.js');
var registerContractConverters = require("../converters/registerContractConverters");

// // logg details wrote in userauth_log file
log4js.loadAppender('file');
//log4js.addAppender(log4js.appenders.console());
log4js.addAppender(log4js.appenders.file('./cheese.log'), 'registerUserControllers');

// var logger = log4js.getLogger('cheese');
var logger = log4js.getLogger('registerUserControllers');
logger.setLevel('DEBUG');
hfc.setLogger(logger);


var verifysignature = async function(req, res, next) {
	logger.debug(' ------>>>>>> new request for %s',req.originalUrl);
	if (req.originalUrl.indexOf('/users') >= 0) {
		return next();
	}

	var token = req.headers.authorization;

	await jwt.verify(token, 'thisismysecret', function(err, decoded) {
		if (err) {
			res.status(500).json({
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
	
	logger.debug('==================== INVOKE ON CONTRACT CHAINCODE ==================');
	logger.info(' ----->>>> req.body <<<<-----',req.body);
	
	var chaincodeName = hfc.getConfigSetting('contract');
	var channelName = hfc.getConfigSetting('channelName');
	var fcn = req.params.fcn;

//superco_org1

// var org = [];
// var CompanyName = req.body.CompanyName;
// org = CompanyName.split('_');

	let args = [JSON.stringify(registerContractConverters.convertToChaincode(req.body))];
	// var args = req.body.args;
	logger.debug('channelName     : ' + channelName);
	logger.debug('chaincodeName   : ' + chaincodeName);
	logger.debug('fcn             : ' + fcn);   // this fcn will "updateUser"
    logger.debug('args            : ' + args);

	var userDetails = await verifysignature(req,res);
	var peers = hfc.getConfigSetting("orgname");
	if (!chaincodeName) {
		logger.error('\'chaincodeName is missing in params\'');
		res.status(500).json({message : 'Chaincode name is missing'})
		//res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		logger.error('\'channelName is missing in params\'');
		res.status(500).json({message : 'Channel name is missing'})
		//res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!fcn) {
		logger.error('\'Fcn is missing in params\'');
		res.status(500).json({message : 'Undefined Function'})
		//res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if (!args) {
		logger.error('\'Args are missing in params\'');
		res.status(500).json({message : 'Undefined Arguments'})
		//res.json(getErrorMessage('\'args\''));
		return;
	}

	let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, req.username, req.orgname);
	// uncomment below lines when email generate is required
	if (!message){
		logger.error('Unsuccessful : failed to invoke userauth chaincode'+message);
	}else{
		logger.debug('after invoke-message : ' + message);
		// var token = await emailVerifications.QRcodeEmailVerification(req.originalUrl, InvitationCode, req.body.UserName, req.body.FirstName, req.body.LastName, req.body.Email );
	}
	if(message === 'Record already exist in Ledger.'){
		res.status(500).send(message);
	}
	else{
		res.status(200).send(message);
	}
	
};
