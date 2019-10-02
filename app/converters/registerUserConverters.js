const hasher = require('./hasher');

exports.convertInvoiceToHash = function (UserName) {
    console.log("====in hasher===", UserName);
    const hash = hasher.create(UserName);
    console.log("===Invoice No hash ====", hash);

    return hash;
};

exports.convertToChaincode = function (data, token) {
     console.log("bps - converttochaincode");

    // console.log('-------------->>>> make hash <<<<<------------', CompanyName);
    if (!data.PhysicianID || data.EnrollType !== "provider"){
        var hash = hasher.create(data.EmailID + data.FirstName + data.Lastname + data.PatientID);
    } else {
        var hash = hasher.create(data.EmailID + data.FirstName + data.Lastname +data.ProviderName + data.PhysicianID);
    }

    if (!token){
        var InvitationCode = data.InvitationCode
    }else{
        var InvitationCode = token
    }
    var Date1 = new Date().toISOString();


    return {
        UserNameID     : hash,
        PhysicianID    : data.PhysicianID,
        PatientID      : data.PatientID,
        FirstName      : data.FirstName,
        LastName       : data.LastName,
        MiddleName     : data.MiddleName,
        ProviderName   : data.ProviderName,
        EnrollType     : data.EnrollType,
        Gender         : data.Gender,
        Ssn            : data.Ssn,
        ConsentTo      : data.ConsentTo,
        SharedUnit     : data.SharedUnit,
        DateOfBirth    : data.DateOfBirth,
        PlaceOfBirth   : data.PlaceOfBirth,
        EmailID        : data.EmailID,
        MobilePhone    : data.MobilePhone,
        HomePhone      : data.HomePhone,
        StreetAddress1 : data.StreetAddress1,
        StreetAddress2 : data.StreetAddress2,
        City           : data.City,
        State          : data.State,
        Country        : data.Country,
        Zipcode        : data.Zipcode,
        PrivateKey     : data.PrivateKey,
        Status         : data.Status,
        PatientCount   : data.PatientCount,
        InvitationCode : InvitationCode,
        Timestamp      : Date1
    };
};
