//SPDX-License-Identifier: Apache-2.0

// phase 2 dev
let  invokeControllers               = require('./app/lib/invokeControllers'),
     queryControllers                = require('./app/lib/queryControllers'),
     registerUserControllers         = require('./app/lib/registerUserControllers'),
     queryUsersControllers           = require('./app/lib/queryUsersControllers'),
     registerContractControllers     = require('./app/lib/registerContractControllers'),
     queryContractControllers        = require('./app/lib/queryContractControllers'),
     utilsControllers                = require('./app/lib/utilsControllers');

///////////////////////////////////////////////////////////////////////////////
///////////////////////// REST ENDPOINTS START HERE ///////////////////////////
///////////////////////////////////////////////////////////////////////////////

module.exports = function(app){

// Create Channel
app.route('/channels')
.post(utilsControllers.create_Channel);

// Join Channel
app.route('/channels/:channelName/peers')
.post(utilsControllers.join_Channels);

// Update anchor peer
app.route('/channels/:channelName/anchorpeers')
.post(utilsControllers.update_anchor);

// Install chaincode on target peers
app.route('/chaincodes')
.post(utilsControllers.install_Chaincode);

// Instantiate chaincode on target peers
app.route('/channels/:channelName/chaincodes')
.post(utilsControllers.instatiate_Chaincode);

////////////////////////////////////////////////////////////////////////////////
///////////////////////// USER REST ENDPOINTS START HERE ///////////////////////
////////////////////////////////////////////////////////////////////////////////

// User signup and assigning ROLE
app.route('/users')
.post(utilsControllers.users);

app.route('/enroll_Admin')
.post(utilsControllers.enroll_Admin);

// User signup and assigning ROLE
app.route('/api/v1/enroll_Users')
.post(utilsControllers.enroll_User);

// get all users from ledger
app.route('/api/v1/get_all_users/:fcn')     // fcn : 'queryAllUser'
.get(queryUsersControllers.query_userAuth);

// get all users count from userauth ledger
app.route('/api/v1/get_all_usersCount/:orgs/:fcn')  // fcn : 'queryUserCount'
.get(utilsControllers.get_usercount_withoutInvitationCode);

app.route('/api/v1/get_user_withoutInvitationCode/:emailid/:password/:enrolltype/:orgs/:fcn')  // emailid : email , password , Org1/Org2, fcn :queryUserpasswd
.get(utilsControllers.get_userpasswd_withoutInvitationCode);

// app.route('/api/v1/get_user_withoutInvitationCode/:args/:orgs/:fcn')
// .get(utilsControllers.get_user_withoutInvitationCode);

// app.route('/api/v1/get_emailid_withoutInvitationCode/:args/:orgs/:fcn')     //fcn : queryEmailid
// .get(utilsControllers.get_user_withoutInvitationCode);

app.route('/api/v1/get_reset_passwd/:args/:args1/:args2/:fcn')
.get(utilsControllers.get_user_reset_password);

app.route('/api/v1/update_user/:fcn')     //fcn:updateUser
.post(registerUserControllers.invoke_Method);

// get user details and update new password 
app.route('/api/v1/update_user_invitationcode/:fcn')   // change to '/update_user/fcn:updateUser
.post(utilsControllers.update_userAuth);

////////////////////////////////////////////////////////////////////////////////
///////////////////////// Contract REST ENDPOINTS START HERE ////////////////////
////////////////////////////////////////////////////////////////////////////////
// Invoke details
app.route('/channels/:channelName/chaincodes/:chaincodeName')
.post(invokeControllers.invoke_Method);

// Query Users details
app.route('/channels/:channelName/chaincodes/:chaincodeName')
.get(queryControllers.get_User);

// Save new Contract in ledger 
app.route('/api/v1/register_new_Contract/:fcn')  // args : 'req.body' , fcn : 'recordNewContract' , 
.post(registerContractControllers.invoke_Method);

app.route('/api/v1/update_Contract/:fcn')  // args : 'req.body' , fcn : 'updateContract' ,
.post(registerContractControllers.invoke_Method);

app.route('/api/v1/get_all_Contract/:fcn')   // args : '' , fcn : 'queryAllContract' ,
.get(queryContractControllers.query_Contract);

// get all contract count from contract ledger
app.route('/api/v1/get_all_contractCount/:fcn')  // fcn : 'queryContractCount'
.get(queryContractControllers.query_Contract);

app.route('/api/v1/get_contractonPatientID/:args/:fcn') // args : 'req.params' , fcn : 'queryOnPatientID' ,/get_all_Contract_company/:companyname/:fcn
.get(queryContractControllers.query_Contract);

app.route('/api/v1/get_contractonPhysicianID/:args/:fcn')  // args : 'req.params' , fcn : 'queryOnPhysicianID' , /get_Contract/:Contractno/:fcn
 .get(queryContractControllers.query_Contract);
  
  // count patientID on basis of Contract status   // args : 'req.params' , fcn : 'queryInvCountBasedOnStatus' , /get_invcount_OnStatus/:status/:fcn 
  // app.route('/api/v1/get_invcount_OnStatus/:args/:fcn')
  // .get(queryInvControllers.query_Contract);

  // count providerID on basis of Contract status
  // app.route('/api/v1/get_Contract_count1/:args/:fcn')   // need to check /get_Contract_count1/:status/:fcn
  // .get(queryInvControllers.query_Contract);

  // app.route('/api/v1/get_inv_company_status/:status/:companyname/:fcn')  // args : 'req.params' , fcn : 'queryContractDueDate' ,
  // .get(queryInvControllers.query_Contract);

};
