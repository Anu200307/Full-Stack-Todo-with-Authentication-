const cryptoJs = require("crypto-js");
require("dotenv").config();

exports.enCrypt = async (data) =>{
    const enCryptData = cryptoJs.AES.encrypt(data,process.env.DATA_SECRET_KEY).toString();
    return enCryptData;
}


exports.deCrypt = async (data) =>{
    const decryptByte = cryptoJs.AES.decrypt(data,process.env.DATA_SECRET_KEY);
    const decryptData = decryptByte.toString(cryptoJs.enc.Utf8);
    return decryptData;
}
