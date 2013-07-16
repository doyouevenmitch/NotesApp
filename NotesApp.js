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
        tx.executeSql('CREATE TABLE IF NOT EXISTS Notes (name PRIMARY KEY, text, date_created, date_modified)');
    }

    pub.submitNote = function(type) {
        var db = window.openDatabase("NotesDB", "1.0", "Notes App", 2 * 1000 * 1000);
        if (type == "add")
            db.transaction(insertNote, errorCB, successCB);
        else
            db.transaction(updateNote, errorCB, successCB);
    }

    pub.submitUpdate = function() {
        var db = window.openDatabase("NotesDB", "1.0", "Notes App", 2 * 1000 * 1000);
        db.transaction(updateNote, errorCB, successCB);
    }

    function insertNote(tx) {
        var text = document.getElementById("text").value;
        var name = document.getElementById("name").value;
        tx.executeSql('INSERT INTO Notes (name, text, date_created, date_modified) VALUES ("' + name + '", "' + text + '", (SELECT datetime("now")), (SELECT datetime("now")))', [], querySuccess, errorCB);
    }

    function updateNote(tx) {
        var name = document.getElementById("name").value;
        var text = document.getElementById("text").value;
        tx.executeSql('UPDATE Notes SET text="' + text + '", date_modified=(SELECT datetime("now")) WHERE name="' + name + '"', [], querySuccess, errorCB);
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
        console.log("\t\tname\t\ttext\t\t\tdate_created\t\t\tdate_modified");
        for (var i = 0; i < len; i++) {
            var row = results.rows.item(i);
            console.log("Row " + (i + 1) + ":\t" + row.name + "\t\t" + row.text + "\t\t" + row.date_created + "\t\t" + row.date_modified);
        }
        console.log("\n");

    }

    // Transaction error callback
    //
    function errorCB(err) {
        console.log("Error processing SQL: " + err.message);
    }

    // Transaction success callback
    //
    function successCB() {
        var db = window.openDatabase("NotesDB", "1.0", "Notes App", 2 * 1000 * 1000);
        db.transaction(queryDB, errorCB);
    }
       
return pub;
}());