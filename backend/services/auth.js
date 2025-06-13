require('dotenv').config();
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWTSECRET;
function setUser(user){
    const plainUser = {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        createdAt: user.createdAt, 
        updatedAt: user.updatedAt
    };
    return jwt.sign(plainUser, secretKey);
}
function getUser(token){
    try {
        return jwt.verify(token, secretKey);
    } catch (error) {
        console.error("JWT Verification Failed:", error);
        return null;
    }
}
module.exports = {setUser , getUser}