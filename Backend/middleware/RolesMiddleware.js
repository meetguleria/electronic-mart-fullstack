verifyAdmin = (req, res, next) => {
    const { role_id } = req.user_id;

    if (role_id === 1) {
        next();
    } else {
        return res.status(403).json({ message: 'Forbidden' });
    }
}

verifyMod = (req, res, next) => {
    const { role_id } = req.user_id;

    if (role_id === 3) {
        next();
    } else {
        return res.status(403).json({ message: 'Forbidden' });
    }
}

verifyAdminOrMod = (req, res, next) => {
    const { role_id } = req.user_id;

    if (role_id === 1 || role_id === 3) {
        next();
    } else {
        return res.status(403).json({ message: 'Forbidden' });
    }
}

const RolesMiddleware = {
    verifyAdmin: verifyAdmin,
    verifyMod: verifyMod,
    verifyAdminOrMod: verifyAdminOrMod
};

module.exports = RolesMiddleware;