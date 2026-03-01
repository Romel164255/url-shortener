const { nanoid } = require("nanoid");

const generateShortId = () => nanoid(6);

module.exports = generateShortId;