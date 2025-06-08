const {validateUsername} = require("../validators/username.validator.js");
const {isUsernameTaken, createUser} = require("../services/user.service.js");

const signUpUser = async (req, res) => {
    const uid = req.user.uid;
    const {username, profilePicUrl} = req.body;

    const validationError = validateUsername(username);
    if (validationError) {
        return res.status(400).json({message: validationError});
    }

    try {
        const nameTaken = await isUsernameTaken(username);
        if (nameTaken) {
            return res.status(400).json({message: "Username is taken"});
        }

        const user = await createUser(uid, username, profilePicUrl);
        return res.status(201).json(user);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

module.exports = {
    signUpUser
};