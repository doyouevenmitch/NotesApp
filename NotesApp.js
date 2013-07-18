var NotesApp = (function() {
    var pub = {};

    pub.start = function() {
    // Wait for PhoneGap to load
    //
    $("#notePage").hide()
    onDeviceReady();
    refreshHistory();
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
        //tx.executeSql('DROP TABLE IF EXISTS Notes');
        tx.executeSql('CREATE TABLE IF NOT EXISTS Notes (name PRIMARY KEY, text, date_created, date_modified)');
    }

    function refreshHistory() {
        $("#history").empty();
        var db = window.openDatabase("NotesDB", "1.0", "Notes App", 2 * 1000 * 1000);
        $("#history").innerHTML = "";
        db.transaction(fetchHistory, errorCB);
    }

    function fetchHistory(tx) {
        tx.executeSql('SELECT * FROM Notes', [], fetchHistorySuccess, errorCB);
    }

    // Query the success callback
    //
    function fetchHistorySuccess(tx, results) {
        var length = results.rows.length;

        for(var i = 0; i < length; i++) {
            var row = results.rows.item(i);
            printHistory(row, length)
        }
    }

    function printHistory(row, length) {
        var historyItem = createHistoryItem();
        setHistoryItemProperties(historyItem, row);
        document.getElementById("history").appendChild(historyItem);
    }

    function createHistoryItem() {
        var historyItem = document.createElement("div");
        var name = document.createElement("div");
        var date_modified = document.createElement("div");
        var date_created = document.createElement("div");

        name.className = "item_name";
        date_modified.className = "item_date_modified";
        date_created.className = "item_date_created";


        historyItem.appendChild(name);
        historyItem.appendChild(date_modified);
        historyItem.appendChild(date_created);
        
        return historyItem;
    }

    function setHistoryItemProperties(historyItem, row) {
        var name = historyItem.firstChild;
        var date_modified = historyItem.firstChild.nextSibling;
        var date_created = historyItem.firstChild.nextSibling.nextSibling;

        historyItem.onclick = function() {pub.openNote(row.name);};
        historyItem.className = "historyItem";
        historyItem.id = row.name;

        name.className = "item_name";
        date_modified.className = "item_date_modified";
        date_created.className = "item_date_created";

        name.innerHTML = row.name;
        date_modified.innerHTML = row.date_modified;
        date_created.innerHTML = row.date_created;
    }

    pub.newNote = function() {
        $("#homePage").hide();
        $("#notePage").show();
    }

    pub.openNote = function(name) {
        $("#homePage").hide();
        $("#notePage").show();
        populateNote(name);
    }

    function populateNote(name) {
        var db = window.openDatabase("NotesDB", "1.0", "Notes App", 2 * 1000 * 1000);
        db.transaction(fetchNote(name), errorCB);
    }

    function fetchNote(name) {
        return function(tx) {
            tx.executeSql('SELECT * FROM Notes WHERE name = "' + name + '"', [], printNote, errorCB);
        };
    }

    function printNote(tx, results) {
        var name = document.getElementById("name");
        var text = document.getElementById("text");

        name.value = results.rows.item(0).name;
        text.value = results.rows.item(0).text;
    }

    pub.showHomepage = function () {
        clearNote();
        refreshHistory();
        $("#homePage").show();
        $("#notePage").hide();
    }

    function clearNote() {
        $("#name").empty();
        $("#text").empty();
    }

    pub.submitNote = function(type) {
        var db = window.openDatabase("NotesDB", "1.0", "Notes App", 2 * 1000 * 1000);
        if (type == "add")
            db.transaction(insertNote, errorCB);
        else
            db.transaction(updateNote, errorCB);
    }

    function insertNote(tx) {
        var text = document.getElementById("text").value;
        var name = document.getElementById("name").value;
        tx.executeSql('INSERT INTO Notes (name, text, date_created, date_modified) VALUES ("' + name + '", "' + text + '", (SELECT datetime("now")), (SELECT datetime("now")))', [], addSuccess, errorCB);
    }

    function updateNote(tx) {
        var name = document.getElementById("name").value;
        var text = document.getElementById("text").value;
        console.log(text);
        tx.executeSql('UPDATE Notes SET text="' + text + '", date_modified=(SELECT datetime("now")) WHERE name="' + name + '"', [], updateSuccess, errorCB);
    }

    function addSuccess(tx, results) {
        pub.showHomepage();
        console.log("add success");
    }

    function updateSuccess(tx, results) {
        pub.showHomepage();
        console.log("update success");
    }

    function errorCB(err) {
        console.log("Error processing SQL: " + err.message);
    }
       
return pub;
}());