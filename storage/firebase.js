const firebase = require('firebase');

var config = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId
};

// TODO: handle firebase Authentication
firebase.initializeApp(config);

module.exports = firebase;
