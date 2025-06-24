const admin = require("firebase-admin");
const {isCreator, hasAdminRights, isParticipant} = require("../services/trip.service")

const firebaseAuthMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; 
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized user", error })
    }
};

const requireCreator = async (req, res, next) => {
    // const uid = req.user.uid;
    // test without Firebase:
    const uid = req.body.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }

    const {id: tripId} = req.params;
    if (!tripId) {
        return res.status(400).json({message: "No tripId is provided"});
    }

    try{
        const checkIsCreator = await isCreator({uid, tripId});
        if (!checkIsCreator) {
            return res.status(403).json({message: "This action can only be carried out by trip creator"})
        }
        next()
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const requireCreatorOrAdmin = async (req, res, next) => {
    // const uid = req.user.uid;
    // test without Firebase:
    const uid = req.body.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }

    const {id: tripId} = req.params;
    if (!tripId) {
        return res.status(400).json({message: "No tripId is provided"});
    }

    try{
        const isCreatorOrAdmin = await hasAdminRights({uid, tripId});
        if (!isCreatorOrAdmin) {
            return res.status(403).json({message: "This action can only be carried out by trip creator or admins"})
        }
        next()
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

const requireParticipants = async (req, res, next) => {
    // const uid = req.user.uid;
    // test without Firebase:
    const uid = req.body.uid;
    if (!uid) {
        return res.status(400).json({message: "Missing uid"});
    }

    const {id: tripId} = req.params;
    if (!tripId) {
        return res.status(400).json({message: "No tripId is provided"});
    }

    try{
        const checkIsParticipant = await isParticipant({uid, tripId});
        if (!checkIsParticipant) {
            return res.status(403).json({message: "This action can only be carried out by trip participants"})
        }
        next()
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}

module.exports = {
    firebaseAuthMiddleware,
    requireCreator,
    requireCreatorOrAdmin,
    requireParticipants
};