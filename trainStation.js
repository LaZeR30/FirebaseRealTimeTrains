$(document).ready(function() {

// MUST ADD KEY TO TABLE ON HIDDEN COLUMN

// Initialize Firebase 
var config = {
	apiKey: "AIzaSyCJ13w9Ojb6Yzlf7e0Ip_52KrCMSDRUHpQ",
	authDomain: "first-practice-fbb2e.firebaseapp.com",
	databaseURL: "https://first-practice-fbb2e.firebaseio.com",
	projectId: "first-practice-fbb2e",
	storageBucket: "first-practice-fbb2e.appspot.com",
	messagingSenderId: "429795246687"
  };
firebase.initializeApp(config);
var myDb = firebase.database();

var interval1 = setInterval(myClock, 1000);
 
function myClock(){
	var sTime = new Date();
	//console.log("sTime before=", sTime) ;
	sTime = moment(sTime).format("HH:mm:ss");
	//console.log("sTime after=", sTime) ;
	$("#currentTime").html("<b>" + sTime + "</b>");
}

var oObject = {

	processTime: function(newTrain) {
		//console.log("INSIDE processTime newTrain=", newTrain) ;
		var firstRun = newTrain.firstRun;  
		var frequency = newTrain.frequency;
		//console.log("firstRun=", firstRun, "frequency=", frequency) ;

		// 1) first calc minutesETA, then 2) add to current time 
		var firstTrainInMinutes = moment(firstRun, "HH:mm").diff(moment("00:00", "HH:mm"), "minutes");
		var currentTimeInMinutes = moment(moment().format("HH:mm"), "HH:mm").diff(moment("00:00", "HH:mm"), "minutes");
		var minutesETA = parseInt(frequency) - (parseInt(currentTimeInMinutes) - parseInt(firstTrainInMinutes)) % parseInt(frequency) ;
		
		// 2) add ETA to current Time
		var nextTrainTime = moment().add(parseInt(minutesETA), 'minutes').format('HH:mm');
		//console.log("firstTrainInMinutes=", firstTrainInMinutes, "currentTimeInMinutes=", currentTimeInMinutes, "minutesETA=", minutesETA, "nextTrainTime=", nextTrainTime);

 		newTrain.minutesAway = minutesETA; 
		newTrain.nextArrival = nextTrainTime;   
		return newTrain ;
		//console.log("EXIT processTime newTrain") ;
	} ,
	
	addNewRow: function(newTrain) {
		//console.log("INSIDE addNewRow") ;

		// call moment.js for both first
		newTrain = oObject.processTime(newTrain) ;

		var newRow = $("<tr>").append(
			$("<td>").text(newTrain.name),
			$("<td>").text(newTrain.destination),
			$("<td>").text(newTrain.firstRun),
			$("<td>").text(newTrain.frequency),
			$("<td>").text(newTrain.nextArrival),
			$("<td>").text(newTrain.minutesAway),
		);
		// Append new row to table
		$("#trainTable > tbody").append(newRow);
		//console.log("EXIT addNewRow") ;
	} , // end addNewRow

} ; // end oObject

// FireBase Listener
myDb.ref().on("child_added", function(childSnapshot) {
	//console.log("INSIDE INITIAL FireBase");
	// Create train object
	var newTrain = {
		name: childSnapshot.val().name,
		destination: childSnapshot.val().destination,
		firstRun: childSnapshot.val().firstRun,
		frequency: childSnapshot.val().frequency, 
		nextArrival: childSnapshot.val().nextArrival, 
		minutesAway: childSnapshot.val().minutesAway 
	}; 
		  
	// Append train to new row to table
	oObject.addNewRow(newTrain) ;
	
	// add KEY: childSnapshot.val().key to newTrain
	// return newTrain
	
	//console.log("EXIT INITIAL FireBase");
}); // end add child


$("#btnSubmit").on("click", function(event) {
	event.preventDefault();

	//console.log("BEFORE SUBMIT=") ;

	var name = $("#trainName").val().trim();
	var destination = $("#destination").val().trim();
	//var firstRun = moment($("#firstTime").val().trim(), "MM/DD/YYYY").format("X");
	var firstRun = $("#firstTime").val().trim(); 
	var frequency = $("#frequency").val().trim();
	var nextArrival = 0;	var minutesAway = 0;

	// error checkng
	// if (!moment(dateEntered,'MM-DD-YYYY').isValid()) {
	// if error OK then process
	
	// Create train object
	var newTrain = {
	  name: name,
	  destination: destination,
	  firstRun: firstRun,
	  frequency: frequency, 
	  nextArrival: nextArrival, 
	  minutesAway: minutesAway 
	}; 

	myDb.ref().push(newTrain);
	
	// 1) call above RETURNING newTrain 
	// 2) GET RETURNED KEY // add KEY to newTrain 

	$("#trainName").val("") ;
	$("#destination").val("") ;
	$("#firstTime").val("") ; 
	$("#frequency").val("") ;

	//console.log("EXIT SUBMIT") ;

}) // end btnSubmit

$("#btnFireBase").on("click", function(event) {
	event.preventDefault();
	//console.log("INSIDE btnFireBase") ;

	$("#trainBody").empty() ; 
	
	//firebase.database().ref().once("value", function(snapshot) {
	myDb.ref().once("value", function(snapshot) {
		//console.log("INSIDE FireBase ONCE snapshot=", snapshot) ;
		snapshot.forEach(function(childSnapshot) {
			//console.log("INSIDE FireBase forEACH childSnapshot=", childSnapshot);
			// Create train object
			var newTrain = {
				name: childSnapshot.val().name,
				destination: childSnapshot.val().destination,
				firstRun: childSnapshot.val().firstRun,
				frequency: childSnapshot.val().frequency, 
				nextArrival: childSnapshot.val().nextArrival, 
				minutesAway: childSnapshot.val().minutesAway 
				// add KEY ~ dont forget comma on line above
			}; 
			// Append the new row to the table
			oObject.addNewRow(newTrain) ;
			//console.log("EXIT FireBase forEACH");
		}); // end forEach	
	}); // end myDb.once("value", function(snapshot) {
	//console.log("EXIT FireBase ONCE") ;
}) // end btnFireBase

var interval2 = setInterval(refreshDb, 60000);
 
function refreshDb() {
	$("#btnFireBase").click();
}

$("#btnClear").on("click", function(event) {
	event.preventDefault();
	$("#trainBody").empty() ; 
	// delete FireBase Db 
}) // end btnClear


}); // end doc ready