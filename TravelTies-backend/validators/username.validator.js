const validateUsername = (username) => {
    if (typeof username !== "string") {
        return "Username must be a string";
    }

    if (/\s/.test(username)) {
        return "Username cannot contain space(s)";
    }

    if (username.length < 3) {
        return "Username is too short";
    }

    if (username.length > 20) {
        return "Username is too long";
    }

    if (!/^[a-zA-Z0-9_]*$/.test(username)) {
        return "Username contains invalid character(s)"
    }

    return null;
}

module.exports = validateUsername;