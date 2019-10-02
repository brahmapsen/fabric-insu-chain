const hasher = require('./hasher');

exports.convertInvoiceToHash = function (UserName) {
    console.log("====in hasher===", UserName);
    const hash = hasher.create(UserName);
    console.log("===Invoice No hash ====", hash);

    return hash;
};

exports.convertToChaincode = function (data, token) {
    // console.log("====in hasher===", data);
    
    var hash = hasher.create(data.ContractID + data.PatientID + data.CareCode + data.PhysicianID);
    var Date1 = new Date().toISOString();
    

    return {
        ContractHash     : hash,
        ContractID       : data.ContractID,
        PatientID        : data.PatientID,
        CareCode         : data.CareCode,
        PhysicianID      : data.PhysicianID,
        ContractDate     : Date1,
        ContractStatus   : data.ContractStatus,
        ChargeAmount     : data.ChargeAmount,
        ChargeUnit       : data.ChargeUnit,
        AuthorizeContract : data.AuthorizeContract,
        ActionStatus     : data.ActionStatus,
        Timestamp        : Date1
    };
};