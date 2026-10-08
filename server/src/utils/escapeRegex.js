// Escapes user input so it is matched literally inside a RegExp.
module.exports = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
