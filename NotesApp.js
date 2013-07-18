var NotesApp = (function() {
    var pub = {};
    var db = window.openDatabase("NotesDB", "1.0", "Notes App", 2 * 1000 * 1000);
    var itemID = 0;

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
        db.transaction(createTable, errorCB);
    }

    // Populate the database 
    //
    function createTable(tx) {
        //tx.executeSql('DROP TABLE IF EXISTS Notes');
        tx.executeSql('CREATE TABLE IF NOT EXISTS Notes (ID INTEGER PRIMARY KEY AUTOINCREMENT, name UNIQUE, text, date_created, date_modified)');
    }

    function refreshHistory() {
        $("#history").empty();
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

        var date_modified_formatted = formatDate(row.date_modified);
        var date_created_formatted = formatDate(row.date_modified);

        name.innerHTML = row.name;
        date_modified.innerHTML = "Date Modified: " + date_modified_formatted;
        date_created.innerHTML = "Date Created: " + date_created_formatted;
    }

    function formatDate(date) {
        var datePart = date.substr(2,8).split("-").reverse().join("/");
        var timePart = date.substr(11,5);

        return datePart + " " + timePart;
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
        db.transaction(fetchNote(name), errorCB);
    }

    function fetchNote(name) {
        return function(tx) {
            tx.executeSql('SELECT * FROM Notes WHERE name = "' + name + '"', [], processNote, errorCB);
        };
    }

    function processNote(tx, results) {
        itemID = results.rows.item(0).ID;
        printNote(results);
    }

    function printNote(results) {
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
        $("#name").val("");
        $("#text").val("");
    }

    pub.submitNote = function(type) {
        
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
        tx.executeSql('UPDATE Notes SET name = "' + name + '", text="' + text + '", date_modified=(SELECT datetime("now")) WHERE ID="' + itemID + '"', [], updateSuccess, errorCB);
    }

    function addSuccess(tx, results) {
        pub.showHomepage();
    }

    function updateSuccess(tx, results) {
        pub.showHomepage();
    }

    function errorCB(err) {
        console.log("Error processing SQL: " + err.message);
    }
       
return pub;
}());