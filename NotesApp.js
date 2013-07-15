var NotesApp = (function() {
    var pub = {};

    pub.start = function() {
    // Wait for PhoneGap to load
    //
    onDeviceReady();
    //document.addEventListener("deviceready", onDeviceReady, false);
    }

    // PhoneGap is ready
    //
    function onDeviceReady() {
        var db = window.openDatabase("NotesDB", "1.0", "Notes App", 2 * 1000 * 1000);
        db.transaction(createTable, errorCB);
    }

    // Populate the database 
    //
    function createTable(tx) {
        tx.executeSql('DROP TABLE IF EXISTS Notes');
        tx.executeSql('CREATE TABLE IF NOT EXISTS Notes (id AUTO_INCREMENT PRIMARY KEY, text, date_created, date_modified)');
    }

    pub.submitNote = function() {
        var db = window.openDatabase("NotesDB", "1.0", "Notes App", 2 * 1000 * 1000);
        db.transaction(insertNote, errorCB, successCB);
    }

    function insertNote(tx) {
        var text = document.getElementById("text").value;
        console.log("textarea text: " + text);
        tx.executeSql('INSERT INTO Notes (text, date_created, date_modified) VALUES ("' + text + '", (SELECT datetime("now")), (SELECT datetime("now")))');
    }

    // Query the database
    //
    function queryDB(tx) {
        tx.executeSql('SELECT * FROM Notes', [], querySuccess, errorCB);
    }

    // Query the success callback
    //
    function querySuccess(tx, results) {
        // this will be empty since no rows were inserted.
        //console.log("Insert ID = " + results.insertId);
        // this will be 0 since it is a select statement
        console.log("Rows Affected = " + results.rowAffected);
        // the number of rows returned by the select statement
        console.log("Insert ID = " + results.rows.length);

        var len = results.rows.length;

        for (var i = 0; i < len; i++) {
            var row = results.rows.item(i);
            console.log("Row " + (i + 1) + ": " + row.text + " " + row.date_created + " " + row.date_modified);
        }

    }

    // Transaction error callback
    //
    function errorCB(err) {
        console.log("Error processing SQL: " + err.code);
    }

    // Transaction success callback
    //
    function successCB() {
        var db = window.openDatabase("NotesDB", "1.0", "Notes App", 2 * 1000 * 1000);
        db.transaction(queryDB, errorCB);
    }

    
        
return pub;
}());