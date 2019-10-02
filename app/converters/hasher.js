const crypto = require('crypto'),
    algo = "sha256",
    format = "hex";

exports.create = function (data) {
    // return String(data);
    return crypto.createHash(algo).update(String(data)).digest(format);
};