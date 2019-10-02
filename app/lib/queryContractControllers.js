'use strict';
var log4js                 = require('log4js');
var util                   = require('util');
var expressJWT             = require('express-jwt');
var jwt                    = require('jsonwebtoken');
require('../../config.js');
var hfc                    = require('fabric-client');
var helper                 = require('../helper.js');
var invoke                 = require('../invoke-transaction.js');
var utilsControllers       = require('./utilsControllers.js');
var registerUserConverters = require("../converters/registerUserConverters");
var query                  = require('../query');

// logg details wrote in COONTRACT_log file
log4js.loadAppender('file');
//log4js.addAppender(log4js.appenders.console());
log4js.addAppender(log4js.appenders.file('./cheese.log'), 'queryContractControllers');

// var logger = log4js.getLogger('cheese');
var logger = log4js.getLogger('queryContractControllers');
logger.setLevel('DEBUG');
//logger.setLevel('ERROR');
hfc.setLogger(logger);
// logger setting end


var verifysignature = async function(req, res, next) {
	logger.debug(' 1.BPS------>>>>>> new request for %s',req.originalUrl);
	if (req.originalUrl.indexOf('/users') >= 0) {
		return next();
	}

	var token = req.headers.authorization;
	logger.info(' 2.BPS----> req.body in verify signature <<< ---',token);

	await jwt.verify(token, 'thisismysecret', function(err, decoded) {
		if (err) {
			res.send({
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
	logger.info('3.BPS---------->>> orgname %s and username %s <<<<<--------',req.orgname , req.username );
}

exports.query_Contract = async function (req, res) {

	logger.debug('4.BPS==================== QUERY ON CONTRACT CHAINCODE ==================');

    var fcn            = req.params.fcn;
    var args           = req.params.args;
	var chaincodeName = hfc.getConfigSetting('contract');
    var channelName = hfc.getConfigSetting('channelName');

    if (!args){
        var args = [""];
    } else {
        var args = req.params.args;
    }
// replace console.log with logger.debug
    logger.debug('5.BPS-channelName     : ' + channelName);
	logger.debug('chaincodeName   : ' + chaincodeName);
	logger.debug('fcn             : ' + fcn);
	logger.debug('args  : ' + args);

	var userDetails = await verifysignature(req,res);
	var peer = hfc.getConfigSetting(req.orgname);
	if (!chaincodeName) {
		logger.error('\'chaincodeName is missing in params\'');
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		logger.error('\'channelName is missing in params\'');
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!fcn) {
		logger.error('\'Fcn is missing in params\'');
		res.json(getErrorMessage('\'fcn\''));
		return;
	}

	let message = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, req.username, req.orgname,res);
	res.send(message);
};

exports.getBlockByNumber = async function (req, res) {

	logger.debug('7.BPS==================== QUERY ON CONTRACT CHAINCODE ==================');

    var args           = req.params.args;
    // var InvitationCode = req.body.InvitationCode;
	var chaincodeName = hfc.getConfigSetting('Contract');
    var channelName = hfc.getConfigSetting('channelName');

// replace console.log with logger.debug
    logger.debug('channelName     : ' + channelName);
	logger.debug('chaincodeName   : ' + chaincodeName);
	logger.debug('args  : ' + args);

	var userDetails = await verifysignature(req,res);
	var peer = hfc.getConfigSetting(req.orgname);
	if (!chaincodeName) {
		logger.error('\'chaincodeName is missing in params\'');
		res.status(500).json({message : 'Undefined Chaincode'})
		//res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		logger.error('\'channelName is missing in params\'');
		res.status(500).json({message : 'Undefined Channel Name'})
		//res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!args) {
		logger.error('\'args is missing in params\'');
		res.status(500).json({message : 'Undefined Arguments'})
		//res.json(getErrorMessage('\'args\''));
		return;
	}

	let message = await query.getBlockByNumber(peer, channelName, args, req.username, req.orgname,res);
	res.send(message);
};
