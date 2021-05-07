const jwt = require('jsonwebtoken');
const fs = require('fs');

class TokenController {

    constructor() {
        this.key = process.env.JWT_ENCRYPTION_KEY;
    }

    create(payload, options = { expiresIn: '1h' }) {
        return jwt.sign(payload, this.key, options);
    }

    validate(token) {
        return new Promise((resolve, reject) => {
            try {
                const decoded = jwt.verify(token, this.key);
                return resolve(decoded);
            } catch(err) {
                return reject(err);
            }
        });
    }

}

module.exports = TokenController;