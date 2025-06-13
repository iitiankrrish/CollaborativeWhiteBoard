const { getUser } = require('../services/auth');
async function UserLoggedInOrNot(req, res, next) {
    const userCookie = req.cookies; 
    if (!userCookie || !userCookie.loginToken) {
        return res.status(401).json({ "Error": "User not logged in" });
    }
    const userInfo = getUser(userCookie.loginToken); 
    if (!userInfo) {
        return res.status(403).json({ "Error": "No User With Such Token" });
    }
    req.user = userInfo;
    next(); 
}

module.exports = {UserLoggedInOrNot};
