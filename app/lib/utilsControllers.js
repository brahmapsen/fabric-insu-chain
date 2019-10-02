//ser
'use strict';
var log4js = require('log4js');
var util = require('util');
var express = require('express');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');

require('../../config.js');
var hfc = require('fabric-client');
var helper = require('../helper.js');
//var invoke = require('../invoke-transaction.js');
var createChannel = require('../create-channel.js');
var join = require('../join-channel.js');
var install = require('../install-chaincode.js');
var instantiate = require('../instantiate-chaincode.js');
var invoke = require('../invoke-transaction.js');
var registerUserConverters = require("../converters/registerUserConverters");
var updateAnchorPeers = require('../update-anchor-peers.js');
// var emailVerifications = require("../middlewares/emailVerifications");
// var verifyUserControllers = require('./')
var app = express();

// // logg details wrote in userauth_log file
log4js.loadAppender('file');
//log4js.addAppender(log4js.appenders.console());
log4js.addAppender(log4js.appenders.file('./cheese.log'), 'utilsControllers');
var logger = log4js.getLogger('utilsControllers');
logger.setLevel('DEBUG');
hfc.setLogger(logger);
//

// verify token
var verifysignature = async function(req, res, next) {
	logger.debug(' ------>>>>>> new request for %s',req.originalUrl);
	if (req.originalUrl.indexOf('/users') >= 0) {
		return next();
	}

	var token = req.headers.authorization;
	logger.info('---------->>> token 11<<<<<--------',token );
	await jwt.verify(token, 'thisismysecret', function(err, decoded) {
		if (err) {
			res.send({
				success: false,
				message: 'Failed to authenticate token. Make sure to include the ' +
					'token returned from /users call in the authorization header  as a Bearer token'
			});
			return;
		} else {
			// add the decoded user name and org name to the request object for the downstream code to use
			req.username = decoded.username;
			req.orgname = decoded.orgName;
			logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
			return req.orgname,req.username;
		}
	});
	logger.info('---------->>> orgname %s and username %s <<<<<--------',req.orgname , req.username );
}


// Create Channel
exports.create_Channel = async function(req, res , next) {
	logger.info('<<<<<<<<<<<<<<<<< C R E A T E  C H A N N E L >>>>>>>>>>>>>>>>>');
	logger.debug('End point : /channels');
	// var data;
	var channelName = req.body.channelName;
	var channelConfigPath = req.body.channelConfigPath;
	var token = req.headers.authorization;
	logger.debug('Channel name      : ' + channelName);
	logger.debug('channelConfigPath : ' + channelConfigPath); //../artifacts/channel/mychannel.tx
	// logger.debug('url               : ' + req.originalUrl);
	// logger.debug('token             : ' + req.headers.authorization);
	// app.use(bearerToken());
	// app.set('secret', 'thisismysecret');

	var userDetails = await verifysignature(req,res);

	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	logger.info('Reached this point 1: /channels');
	if (!channelConfigPath) {
		res.json(getErrorMessage('\'channelConfigPath\''));
		return;
	}
    logger.info('Reached this point 2: /channels');
	let message = await createChannel.createChannel(channelName, channelConfigPath, req.username, req.orgname);
	res.send(message);
};

// Join Channel
exports.join_Channels = async function(req, res) {
	logger.info('<<<<<<<<<<<<<<<<< J O I N  C H A N N E L >>>>>>>>>>>>>>>>>');
	logger.debug(' ------>>>>>> new request for %s',req.originalUrl);
	var channelName = req.params.channelName;
	var peers = req.body.peers;
	logger.debug('channelName : ' + channelName);
	logger.debug('peers : ' + peers);
	// logger.debug('username :' + req.username);
	// logger.debug('orgname:' + req.orgname);
	var userDetails = await verifysignature(req,res);

	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}

	let message =  await join.joinChannel(channelName, peers, req.username, req.orgname);
	res.send(message);
};

// update anchor peer
exports.update_anchor = async function(req, res) {
	logger.debug('==================== UPDATE ANCHOR PEERS ==================');
	var channelName = req.params.channelName;
	var configUpdatePath = req.body.configUpdatePath;
	logger.debug('Channel name : ' + channelName);
	logger.debug('configUpdatePath : ' + configUpdatePath);

	var userDetails = await verifysignature(req,res);
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!configUpdatePath) {
		res.json(getErrorMessage('\'configUpdatePath\''));
		return;
	}

	let message = await updateAnchorPeers.updateAnchorPeers(channelName, configUpdatePath, req.username, req.orgname);
	res.send(message);
};

// Install chaincode on target peers
exports.install_Chaincode = async function(req, res) {
	logger.debug('==================== INSTALL CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.body.chaincodeName;
	var chaincodePath = req.body.chaincodePath;
	var chaincodeVersion = req.body.chaincodeVersion;
	var chaincodeType = req.body.chaincodeType;
	// var chaincodeType = "golang";
	logger.debug('peers : ' + peers); // target peers list
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('chaincodePath  : ' + chaincodePath);
	logger.debug('chaincodeVersion  : ' + chaincodeVersion);
	logger.debug('chaincodeType  : ' + chaincodeType);

	var userDetails = await verifysignature(req,res);

	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!chaincodePath) {
		res.json(getErrorMessage('\'chaincodePath\''));
		return;
	}
	if (!chaincodeVersion) {
		res.json(getErrorMessage('\'chaincodeVersion\''));
		return;
	}
	if (!chaincodeType) {
		res.json(getErrorMessage('\'chaincodeType\''));
		return;
	}
	let message = await install.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, chaincodeType, req.username, req.orgname)
	res.send(message);
};

// Instantiate chaincode on target peers
exports.instatiate_Chaincode = async function(req, res) {
	logger.debug('==================== INSTANTIATE CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.body.chaincodeName;
	var chaincodeVersion = req.body.chaincodeVersion;
	var channelName = req.params.channelName;
	var chaincodeType = req.body.chaincodeType;
	var fcn = req.body.fcn;
	var args = req.body.args;
	logger.debug('peers  : ' + peers);
	logger.debug('channelName  : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('chaincodeVersion  : ' + chaincodeVersion);
	logger.debug('chaincodeType  : ' + chaincodeType);
	logger.debug('fcn  : ' + fcn);
	logger.debug('args  : ' + args);

	var userDetails = await verifysignature(req,res);
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!chaincodeVersion) {
		res.json(getErrorMessage('\'chaincodeVersion\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!chaincodeType) {
		res.json(getErrorMessage('\'chaincodeType\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}

	let message = await instantiate.instantiateChaincode(peers, channelName, chaincodeName, chaincodeVersion, chaincodeType, fcn, args, req.username, req.orgname);
	res.send(message);
};
//Enroll user in Fabric ca
exports.users = async function(req, res) {
	var username = req.body.username;
	var orgName = req.body.orgName;
	logger.debug('End point : /users');
	logger.debug('User name : ' + username);
	logger.debug('Org name  : ' + orgName);
	app.set('secret', 'thisismysecret');
	if (!username) {
		res.json(getErrorMessage('\'username\''));
		return;
	}
	if (!orgName) {
		res.json(getErrorMessage('\'orgName\''));
		return;
	}
	var token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
		username: username,
		orgName: orgName
	}, app.get('secret'));
	console.log(" === succesfully user registered === " +"," +"token:" +token);
	let response = await helper.getRegisteredUser(username, orgName, true);
	logger.debug('-- returned from registering the username %s for organization %s',username,orgName);
	if (response && typeof response !== 'string') {
		logger.debug('Successfully registered the username %s for organization %s',username,orgName);
		response.token = token;
		res.json(response)
	} else {
		logger.debug('Failed to register the username %s for organization %s with::%s',username,orgName,response);
		res.json({success: false, message: response});
	}

};
//Register and Enroll Admin
exports.enroll_Admin = async function(req, res) {
	var username = req.body.UserName;
	var CompanyName = req.body.CompanyName;
	var org = [];
    var CompanyName = req.body.CompanyName;
	var org = CompanyName.split('_');
	var orgName = org[1];
	var orgname = org[0];
	if (orgName === "Org1"){
		var orgType = "buyer"
	} else {
		var orgType = "seller"
	}
	logger.debug('End point : /enroll_Admin');
	logger.debug('User name : ' + username);
	logger.debug('Org name  : ' + orgName);
	app.set('secret', 'thisismysecret');
	if (!username) {
		res.status(500).json({message:'Username mis-match!'})
		//res.json(getErrorMessage('\'username\''));
		return;
	}
	if (!orgName) {
		res.status(500).json({message:'Organisation name mis-match!'})
		//res.json(getErrorMessage('\'orgName\''));
		return;
	}
	var token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
		username: username,
		orgName: orgName
	}, app.get('secret'));
	console.log(" === succesfully user registered === " +"," +"token:" +token);
	let response = await helper.getRegisteredUser(username, orgName, true);
	logger.debug('-- returned from registering the username %s for organization %s',username,orgName);
	if (response && typeof response !== 'string') {
		logger.debug('Successfully registered the username %s for organization %s',username,orgName);
		response.token = token;
		// start calling to registerUserControllers.js to record user details in userauth ledger
		//var peers = req.body.peers
		var peers = hfc.getConfigSetting(orgName);
		logger.info('--------->>>>>> Target peer   <<<<<<------- ',peers);
		var chaincodeName = hfc.getConfigSetting('userAuth');
		var channelName = hfc.getConfigSetting('channelName')
		// var chaincodeName = hfc.getConfigSetting('userAuth')
		if (!req.params.fcn){
			var fcn = 'recordNewUser';         // fcn is recordnewuser
		} else {
			var fcn = req.params.fcn;
		}

		logger.debug('channelName     : ' + channelName);
	    logger.debug('chaincodeName   : ' + chaincodeName);
	    logger.debug('fcn             : ' + fcn);           // this fcn will "updateUser"

		let args = [JSON.stringify(registerUserConverters.convertToChaincode(req.body,token, orgname, orgType))];
		logger.info(' args :' + args)

		let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, username, orgName);
		// res.send(message);
		res.status(200).json({success: true, message: message, tx_id: response })
	} else {
		logger.debug('Failed to register the username %s for organization %s with::%s',username,orgName,response);
		res.status(500).json({message:'Failed to register Admin!'})
		//res.json({success: false, message: response});
	}

};
// Register and enroll user
exports.enroll_User = async function(req, res) {
	logger.info(' ----->>>> enroll user req.body <<<<-----',req.body);
	// var username = req.body.UserName;
	// var CompanyName = req.body.CompanyName;
	var username = req.body.EmailID;
	var orgName = req.body.OrgType;

	logger.debug('End point : /enroll_User');
	logger.debug('User name : ' + username);
	logger.debug('Org name  : ' + orgName);
	app.set('secret', 'thisismysecret');
	if (!username) {
		res.status(500).json({message:'Username field is empty!'})
		//res.json(getErrorMessage('\'username\''));
		return;
	}
	if (!orgName) {
		res.status(500).json({message:'Organisation field is empty!'})
		//res.json(getErrorMessage('\'orgName\''));
		return;
	}

	var token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
		username: username,
		orgName: orgName
	}, app.get('secret'));
	logger.info(" === succesfully user registered === " +"," +"token:" +token);
	let response = await helper.getRegisteredUser(username, orgName, true);
	logger.debug('-- returned from registering the username %s for organization %s',username,orgName);
	if (response && typeof response !== 'string') {
		logger.debug('Successfully registered the username %s for organization %s',username,orgName);
		response.token = token;
		// start calling to registerUserControllers.js to record user details in userauth ledger
		//var peers = req.body.peers
		var peers = hfc.getConfigSetting("orgname");
		var chaincodeName = hfc.getConfigSetting('userAuth');
		var channelName = hfc.getConfigSetting('channelName')
		var chaincodeName = 'userauth';
		var fcn = 'recordNewUser';         // fcn is recordnewuser
		let args = [JSON.stringify(registerUserConverters.convertToChaincode(req.body, token))];
		logger.info(' args :' + args)

		let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, username, orgName);
		res.status(200).json({success: true, message: message, tx_id: response })
		// end - comment above & uncomment below if do not want to invoke userauth chaincode
		// res.json(response)
	} else {
		logger.debug('Failed to register the username %s for organization %s with::%s',username,orgName,response);
		res.status(500).json({success: false, message: 'Failed to enroll new user', resp: response});
	}
}
// update user's password in ledger after reccieving invitaion code
exports.update_userAuth = async function(req, res) {
	logger.debug('==================== UPDATE ON USERAUTH CHAINCODE ==================');
	logger.info(' ----->>>> req.body <<<<-----',req.body);

	var chaincodeName = hfc.getConfigSetting('userAuth');
	var channelName = hfc.getConfigSetting('channelName');
	var fcn = req.params.fcn;// updateUser
	var InvitationCode = req.body.InvitationCode;

    var token = req.headers.authorization;
	let args = [JSON.stringify(registerUserConverters.convertToChaincode(req.body,token))];
	// var args = req.body.args;
	logger.debug('channelName     : ' + channelName);
	logger.debug('chaincodeName   : ' + chaincodeName);
	logger.debug('fcn             : ' + fcn);           // this fcn will "updateUser"
	logger.debug('InvitationCode  : ' + InvitationCode);
    logger.debug('args            : ' + args);

	var userDetails = await verifysignature(req,res);
	// regenerate confidential jwt signature which will be stored in data base
	if (!req.username) {
		res.status(500).json({message:'Username mis-match!'})
		//res.json(getErrorMessage('\'username\''));
		return;
	}
	if (!req.orgname) {
		res.status(500).json({message:'Organisation name mis-match!'})
		//res.json(getErrorMessage('\'orgName\''));
		return;
	}
	var userName = req.username;
	var orgName = req.orgname;
	logger.debug('username1  : ' + userName);
	logger.debug('orgname1            : ' + orgName);

	app.set('secret', 'thisismysecret');
	var token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime1')),
		username: userName,
		orgName: orgName
	}, app.get('secret'));
	console.log(" === succesfully user registered === " +"," +"token:" +token);
	let response = await helper.getRegisteredUser(userName, orgName, true);
	logger.debug('-- returned from registering the username %s for organization %s',userName,orgName);
	if (response && typeof response !== 'string') {
		logger.debug('Successfully registered the username %s for organization %s',userName,orgName);
		response.token = token;

		// start calling to registerUserControllers.js to record user details in userauth ledger
		var peers = hfc.getConfigSetting(orgName);
		logger.info('--------->>>>>> Target peer   <<<<<<------- ',peers);
		var chaincodeName = hfc.getConfigSetting('userAuth');
		var channelName = hfc.getConfigSetting('channelName')

		if (!req.params.fcn){
			var fcn = 'recordNewUser';         // fcn is recordnewuser
		} else {
			var fcn = req.params.fcn;
		}

		logger.debug('channelName     : ' + channelName);
	    logger.debug('chaincodeName   : ' + chaincodeName);
	    logger.debug('fcn             : ' + fcn);           // this fcn will "updateUser"

		let args = [JSON.stringify(registerUserConverters.convertToChaincode(req.body,token))];
		logger.info(' args :' + args)

		if (!chaincodeName) {
			logger.error('\'chaincodeName is missing in params\'');
			res.status(500).json({message:'Failed to activate new user!'})
			//res.json(getErrorMessage('\'chaincodeName\''));
			return;
		}
		if (!channelName) {
			logger.error('\'channelName is missing in params\'');
			res.status(500).json({message:'Failed to activate new user!'})
			//res.json(getErrorMessage('\'channelName\''));
			return;
		}
		if (!fcn) {
			logger.error('\'Fcn is missing in params\'');
			res.status(500).json({message:'Failed to activate new user!'})
			//res.json(getErrorMessage('\'fcn\''));
			return;
		}
		if (!args) {
			logger.error('\'Args are missing in params\'');
			res.status(500).json({message:'Failed to activate new user!'})
			//res.json(getErrorMessage('\'args\''));
			return;
		}

		let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, userName, orgName);
		// res.send(message);
		if(message === "Record already exist in Ledger."){
			res.status(500).json({message:'Record already exist in Ledger!'})
		}
		else{
			res.status(200).json({success: true, message: message, tx_id: response })
		}
	}
	//

	// let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, req.username, req.orgname);
	// uncomment below lines when email generate is required
	// if (!message){
	// 	logger.error('Unsuccessful : failed to invoke userauth chaincode'+message);
	// }else{
	// 	logger.debug('after invoke-message : ' + message);
	// 	var token = await emailVerifications.QRcodeEmailVerification(InvitationCode, req.body.UserName, req.body.FirstName, req.body.LastName, req.body.Email );
	// }
	// res.send(message);
};
//Register and Enroll Admin
exports.get_userpasswd_withoutInvitationCode = async function(req, res) {
	var username = req.params.emailid;
	var password = req.params.password;
	var enrolltype = req.params.enrolltype;
	var orgs = req.params.orgs;
	logger.debug('UtilsController - BPS: End point : /api/v1/get_userpasswd_withoutInvitationCode/');
	logger.debug('User name : ' + username);
	if (!username) {
		res.status(500).json({message:'Username mis-match!'})
		//res.json(getErrorMessage('\'username\''));
		return;
	}

	var peer = hfc.getConfigSetting(orgs);
	logger.info('1.--------->>>>>> Target peer   <<<<<<------- ',peer);
	var chaincodeName = hfc.getConfigSetting('userAuth');
	var channelName = hfc.getConfigSetting('channelName')
	if (!req.params.fcn){
		var fcn = 'queryUser';         // fcn is queryUser
	} else {
		var fcn = req.params.fcn;
	}

		logger.debug('1.channelName     : ' + channelName);
	  logger.debug('1.chaincodeName   : ' + chaincodeName);
		logger.debug('1.fcn             : ' + fcn);           // this fcn will "updateUser"

	try {
		logger.debug('channelName     : ' + channelName);

		// temp solution
		// if (){
		// 	var enrolltype = 'Org2'
		// }else{
		// 	var enrolltype = 'Org1'
		// }
		logger.info('2.--------------->>>> orgs :',orgs);
		var client = await helper.getClientForOrg(orgs, username,res);

		logger.debug('Successfully got the fabric client for the organization "%s"', req.orgname);
		var channel = client.getChannel(channelName);
		if(!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			logger.error(message);
			throw new Error(message);
		}

		// send query
		var request = {
			targets : [peer], //queryByChaincode allows for multiple targets
			chaincodeId: chaincodeName,
			fcn: fcn,
			args: [username,password,enrolltype]
		};
		let response_payloads = await channel.queryByChaincode(request);
		if (response_payloads) {
			// for (let i = 0; i < response_payloads.length; i++) {
			// 	logger.info(args[0]+' now has ' + response_payloads[i].toString('utf8') +
			// 		' after the move');
			// }
			res.status(200).send(JSON.parse(response_payloads[0].toString()));
			// var filtered = _.where(companyonstatus, {Status: "PAID" });
			// res.send(filtered);
			// return args+' now has ' + response_payloads[0].toString('utf8') +
			// 	' after the move';
			// res.send(JSON.parse(response_payloads[0].toString()));
		} else {
			logger.error('response_payloads is null');
			return 'response_payloads is null';
		}
	} catch(error) {
		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		res.status(500).json({message:'Failed to update password'})
		//return error.toString();
	};
	// 	res.json({success: true, message: message, tx_id: response })
	// } else {
	// 	logger.debug('Failed to register the username %s for organization %s with::%s',username,orgName,response);
	// 	res.json({success: false, message: response});
 };

 exports.get_usercount_withoutInvitationCode = async function(req, res) {
	// var username = req.params.args;
	var orgs = req.params.orgs;
	logger.debug('End point : /get_usercount_withoutInvitationCode');

	var peer = hfc.getConfigSetting(orgs);
	logger.info('--------->>>>>> Target peer   <<<<<<------- ',peer);
	var chaincodeName = hfc.getConfigSetting('userAuth');
	var channelName = hfc.getConfigSetting('channelName')
	if (!req.params.fcn){
		var fcn = 'queryUser';         // fcn is queryUser
	} else {
		var fcn = req.params.fcn;
	}

		logger.debug('channelName     : ' + channelName);
	    logger.debug('chaincodeName   : ' + chaincodeName);
		logger.debug('fcn             : ' + fcn);           // this fcn will "updateUser"

	try {
		logger.debug('channelName     : ' + channelName);
		logger.info('--------------->>>> orgs :',orgs);
		var client = await helper.getClientForOrg(orgs, "admin",res);

		logger.debug('Successfully got the fabric client for the organization "%s"', req.orgname);
		var channel = client.getChannel(channelName);
		if(!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			logger.error(message);
			throw new Error(message);
		}

		// send query
		var request = {
			targets : [peer], //queryByChaincode allows for multiple targets
			chaincodeId: chaincodeName,
			fcn: fcn,
			args: [""]
		};
		let response_payloads = await channel.queryByChaincode(request);
		if (response_payloads) {
			// for (let i = 0; i < response_payloads.length; i++) {
			// 	logger.info(args[0]+' now has ' + response_payloads[i].toString('utf8') +
			// 		' after the move');
			// }
			res.status(200).send(response_payloads[0]);
		} else {
			logger.error('response_payloads is null');
			return 'response_payloads is null';
		}
	} catch(error) {
		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		res.status(500).json({message:'Failed to update user!'})
		//return error.toString();
	};
 };

 exports.get_user_reset_password = async function(req, res) {
	var username = req.params.args;
	var key = req.params.args1;
	var orgs = req.params.args2;
	logger.debug('End point : /api/v1/get_reset_passwd');
	logger.debug('User name : ' + username);
	if (!username) {
		res.status(500).json({message:'Username mis-match!'})
		//res.json(getErrorMessage('\'username\''));
		return;
	}

	var peer = hfc.getConfigSetting(orgs);
	logger.info('--------->>>>>> Target peer   <<<<<<------- ',peer);
	var chaincodeName = hfc.getConfigSetting('userAuth');
	var channelName = hfc.getConfigSetting('channelName')
	if (!req.params.fcn){
		var fcn = 'queryUser';         // fcn is queryUser
	} else {
		var fcn = req.params.fcn;
	}

		logger.debug('channelName     : ' + channelName);
	    logger.debug('chaincodeName   : ' + chaincodeName);
		logger.debug('fcn             : ' + fcn);           // this fcn will "updateUser"

	try {
		logger.debug('channelName     : ' + channelName);
		logger.info('--------------->>>> orgs :',orgs);
		var client = await helper.getClientForOrg(orgs, username);
		logger.debug('Successfully got the fabric client for the organization "%s"', req.orgname);
		var channel = client.getChannel(channelName);
		if(!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			logger.error(message);
			throw new Error(message);
		}

		// send query
		var request = {
			targets : [peer], //queryByChaincode allows for multiple targets
			chaincodeId: chaincodeName,
			fcn: fcn,
			args: [username]
		};
		let response_payloads = await channel.queryByChaincode(request);
		if (response_payloads) {
			if (!key){
				res.status(200).send(JSON.parse(response_payloads[0].toString()));
			} else {

				var message = JSON.parse(response_payloads[0].toString());
				logger.debug("response from the server for requested username:",message)

				var Email = message[0].Record.Email;
				var InvitationCode = message[0].Record.InvitationCode;
				var UserName = message[0].Record.UserName
				var FirstName = message[0].Record.FirstName
				var lastName = message[0].Record.LastName;
				// if(message[0].Record.Status=='true')
				// {
				// var story = await emailVerifications.ResetPasswordEmailVerification(InvitationCode, UserName, FirstName,lastName, Email)
				// }
				res.status(200).json({msg: message});
			}
		} else {
			logger.error('response_payloads is null');
			return 'response_payloads is null';
		}
	} catch(error) {
		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		res.status(500).json({message:'Failed to reset password!'})
		//return error.toString();
	};
 };
