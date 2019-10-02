'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('InvoiceChainWebApp');
var util = require('util');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
require('../../config.js');
var hfc = require('fabric-client');
var helper = require('../helper.js');
var query = require('../query.js');


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

exports.get_User = async function (req, res) {
    logger.debug('==================== QUERY BY CHAINCODE ==================');

	// let args = req.body.args;  // let fcn = req.body.fcn;  // let peer = req.body.peer;
	var channelName = req.params.channelName;
	var chaincodeName = req.params.chaincodeName;
	let args = req.query.args;
	let fcn = req.query.fcn;
	let peer = req.query.peer;

	logger.debug('channelName   : ' + channelName);
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
	args = args.replace(/'/g, '"');
	args = JSON.parse(args);
	logger.debug(args);

	let message = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, req.username, req.orgname);
	res.send(message);
};
//  Query Get Block by BlockNumber
// app.get('/channels/:channelName/blocks/:blockId', async function(req, res) {
exports.get_Block_By_BlockNumber = async function (req, res) {
	logger.debug('==================== GET BLOCK BY NUMBER ==================');
	let blockId = req.body.blockId;
    let peer = req.body.peer;
    let channelName = req.params.channelName
	logger.debug('channelName : ' + req.params.channelName);
	logger.debug('BlockID     : ' + blockId);
	logger.debug('Peer        : ' + peer);
	if (!blockId) {
		res.status(500).json({message : 'Undefined Block_Id'})
		//res.json(getErrorMessage('\'blockId\''));
		return;
	}

	let message = await query.getBlockByNumber(peer, channelName, blockId, req.username, req.orgname);
	res.send(message);
};
// Query Get Transaction by Transaction ID
// app.get('/channels/:channelName/transactions/:trxnId', async function(req, res) {
exports.get_Txn_By_TxnId = async function (req, res) {
	logger.debug('================ GET TRANSACTION BY TRANSACTION_ID ======================');
	logger.debug('channelName : ' + req.params.channelName);
	let trxnId = req.body.trxnId;
    let peer = req.body.peer;
    let channelName = req.params.channelName
	if (!trxnId) {
		res.status(500).json({message : 'Undefined Transantion_ID'})
		//res.json(getErrorMessage('\'trxnId\''));
		return;
	}

	let message = await query.getTransactionByID(peer, channelName, trxnId, req.username, req.orgname);
	res.send(message);
};

// Query Get Block by Hash
// app.get('/channels/:channelName/blocks', async function(req, res) {
exports.get_Block_By_Hash = async function (req, res) {
	logger.debug('================ GET BLOCK BY HASH ======================');
	logger.debug('channelName : ' + req.params.channelName);
	let hash = req.body.hash;
    let peer = req.body.peer;
    let channelName = req.params.channelName
	if (!hash) {
		res.status(500).json({message : 'Undefined Hash'})
		//res.json(getErrorMessage('\'hash\''));
		return;
	}

	let message = await query.getBlockByHash(peer, channelName, hash, req.username, req.orgname);
	res.send(message);
};

//Query for Channel Information
// app.get('/channels/:channelName', async function(req, res) {
exports.get_Channel_Info = async function (req, res) {
	logger.debug('================ GET CHANNEL INFORMATION ======================');
	logger.debug('channelName : ' + req.params.channelName);
    let peer = req.query.peer;
    let channelName = req.params.channelName

	let message = await query.getChainInfo(peer, channelName, req.username, req.orgname);
	res.send(message);
};
//Query for Channel instantiated chaincodes
// app.get('/channels/:channelName/chaincodes', async function(req, res) {
exports.get_Channel_Chaincode = async function (req, res) {
	logger.debug('================ GET INSTANTIATED CHAINCODES ======================');
	logger.debug('channelName : ' + req.params.channelName);
    let peer = req.query.peer;
    let channelName = req.params.channelName

	let message = await query.getInstalledChaincodes(peer, channelName, 'instantiated', req.username, req.orgname);
	res.send(message);
};
// Query to fetch all Installed/instantiated chaincodes
// app.get('/chaincodes', async function(req, res) {
exports.get_All_Chaincode = async function (req, res) {
	var peer = req.body.peer;
	var installType = req.body.type;
	logger.debug('================ GET INSTALLED CHAINCODES ======================');

	let message = await query.getInstalledChaincodes(peer, null, 'installed', req.username, req.orgname)
	res.send(message);
};
// Query to fetch channels
// app.get('/channels', async function(req, res) {
exports.get_Channels = async function (req, res) {
	logger.debug('================ GET CHANNELS ======================');
	logger.debug('peer: ' + req.body.peer);
	var peer = req.body.peer;
	if (!peer) {
		res.status(500).json({message : 'Undefined Peer'})
		//res.json(getErrorMessage('\'peer\''));
		return;
	}

	let message = await query.getChannels(peer, req.username, req.orgname);
	res.send(message);
};
