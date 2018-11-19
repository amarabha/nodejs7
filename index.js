
// START APP
'use strict';

const express = require('express');
const app = express ();
var firebase = require ('firebase-admin');
var admin = require("firebase-admin");
var request = require('request');

var API_KEY="AIzaSyBYsKexs-QuiM8gmqFcPktrBPsyfJaLO1o";

//fetch the service account key json file contents
var serviceAccount = require("./serviceAccountKey.json");



app.get('/', (req, res) => {
res.status(200).send('The script is working!');
});

//Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
console.log('APP listening on port ${PORT}');
console.log('Press Ctrl+C to quit.');
});

//Initialize the app with a service account, granting admin privilages (Very important)
firebase.initializeApp({
credential: admin.credential.cert(serviceAccount),
databaseURL: "https://ftproject-405ac.firebaseio.com/"

});

//From here you have unlimited access to all the dayabase stuff
//Access to our databaseURL
var ref = firebase.database().ref();

function listForNotificationRequests() {
//Referance to all the notifications
var requests = ref.child("notificationRequests");
//var userRef = db.ref(username); DO SOMETHING HERE
//NotificationRequests consist of user, which have a message field
requests.on('child_added', function(requestSnapshot) {

// All current items in queue are deleted once order is ready
var requestx = requestSnapshot.val();

//Calls the next function
sendNotificationToUser(
requestx.username,
requestx.message,
function() {
requestSnapshot.ref.remove();
}
);
}, function(error) {
console.error(error);
});
}


function sendNotificationToUser(username, message, onSuccess) {
//username is the unique User Id
request({
url: 'https://fcm.googleapis.com/fcm/send',
method: 'POST',
headers: {
'Content-Type' :'application/json',
'Authorization': 'key='+API_KEY
},
body: JSON.stringfy({
noification: {
title: message,
sound: 'default'
},
to : '/topics/user_'+username,
priority:'high'
})
}, function(error, response, body) {
if (error) {console.error(error);}
else if (response.statuscode >=400){
console.error('HTTP Error: '+response.statusCode+' - '+response.statusMessage);
}
else {
onSuccess();
}
});
}

//start listening
listForNotificationRequests();




