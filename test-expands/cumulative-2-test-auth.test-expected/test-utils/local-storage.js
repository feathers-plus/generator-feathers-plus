
let store = {};

module.exports = {
  clear() {
    store = {};
  },
  setItem (key, value) {
    store[key] = value;
  },
  getItem (key) {
    return store[key];
  },
  removeItem (key) {
    delete store[key];
  },
};
