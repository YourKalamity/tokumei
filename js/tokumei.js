/** 
* Generates a random ID prefixed with "TOKUMEI" to connect to the PeerJS network with, By default returns a random 5-character string
* @param {BigInt} length - Length of the ID to generate, defaults to 5  if not specified or if not a number
* @return {string} Returns generated ID prefixed with "TOKUMEI-"
*/
function makeid(length) {
    // Validate length
    if (isNaN(length) || length < 1 || length > 256) {
        length = 5;
    }
    var result           = '';
    // Characters to use in the ID
    var characters       = 'abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    // Loop that generates the ID
    for ( var i = 0; i < length; i++ ) {
        // Add random character to string
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return "TOKUMEI-" + result;
}

/** 
* Function that attempts to copy data to the clipboard
* @param {string} data - Data to copy to the clipboard
* @return {boolean} Returns true if the data was copied to the clipboard, false otherwise
*/
function copy_to_clipboard(data) {
    // Check if browser supports clipboard API
    if (navigator.clipboard) {
        navigator.clipboard.writeText(data);
        return true;
    } else {
        return false;
    }
}

/** 
* Function that attempts to connect to a specified Peer
* @return {boolean} Always Returns False to avoid reloading the page
*/
function connect_mode() {
    main_menu_modal.hide()
    let peer_id_input = document.getElementById("PeerID_inputbox");
    connection_id = peer_id_input.value
    mode = "TOKUMEI-" + connection_id;
    var conn = peer.connect(mode);
    // Message Handler function that is called when the connection is opened
    conn.on('open', function(){message_handler(conn)});
    return false;
} 

/** 
* Function that handles the awaiting connection mode
* @return {boolean} Always Returns False to avoid reloading the page
*/
function await_mode(){
    // Hide main menu modal and show await mode modal
    status_object.innerHTML = "Awaiting connection...";
    main_menu_modal.hide()
    await_mode_modal.show()

    // Display Peer ID
    let peer_id_display = document.getElementById("peer_id_display");
    current_id =  id.substr(id.length - 5)
    peer_id_display.innerHTML = current_id;

    // Attempt to copy the Peer ID to the clipboard
    if (copy_to_clipboard(current_id)){
        document.getElementById("clipboard_notification").removeAttribute("hidden");
    }

    // Hand off to the connection mode function
    peer.on('connection', function(conn){
        // Message Handler function that is called when the connection is opened
        conn.on('open', function(){message_handler(conn)});
    });

    return false;
}
/** 
* Function that adds a message to the chatbox
* @param {string} message - Message to add to the chatbox
*/
function receive_message(message) {
    // Create new message element
    messagebox = document.getElementById("chatbox");
    var new_message = document.createElement("div");
    // Add message to chatbox
    messagebox.appendChild(new_message)
    insertUntrustedText(new_message, "PEER: "+ message, 'p');
    // Scroll to the bottom of the chatbox
    messagebox.scrollTop = messagebox.scrollHeight;
}

/** 
* Function that brings up the main menu modal when connected to the PeerJS network
*/
function peer_open_handler(){
    console.log("Connected to PeerJS network!");
    main_menu_modal.show();
}

/** 
* Function that handles the messages sent and received from the PeerJS network
* @param {DataConnection} conn - PeerJS connection object to use to send and receive messages
*/
function message_handler (conn) {
    // Hide Peer ID display
    await_mode_modal.hide();
    // Enables all inputs and buttons
    let message_fieldset = document.getElementById("message_fieldset");
    message_fieldset.removeAttribute("disabled");
    status_object.innerHTML = "Connected!";

    // Attach message handler to connection
    conn.on('data', function(data){receive_message(data)});
    conn.on('close', function(){message_closer()});

    // Declare send function
    send_message = function() {
        message = document.getElementById("user_message").value
        messagebox = document.getElementById("chatbox");
        var new_message = document.createElement("div");
        messagebox.appendChild(new_message)
        insertUntrustedText(new_message, "YOU: "+ message, 'p');
        conn.send(message);
        document.getElementById("user_message").value = "";
        messagebox.scrollTop = messagebox.scrollHeight;
        return false;
    }
};

/** 
* Function that disables all inputs and buttons
*/
function message_closer() {
    let message_fieldset = document.getElementById("message_fieldset"); 
    message_fieldset.setAttribute("disabled", "disabled");
    // Display disconnection message
    status_object.innerHTML = "Disconnected!";
}

/** 
* Function that inserts untrusted unsanitized text into a DOM element
* @param {Element} domElement - DOM element to insert the text into
* @param {string} untrustedText - Text to insert into the DOM element
* @param {string} newlineStrategy - Tag to use to create the DOM element
*/
function insertUntrustedText(domElement, untrustedText, newlineStrategy) {
    domElement.innerHTML = '';
    var lines = untrustedText.replace(/\r/g, '').split('\n');
    var linesLength = lines.length;
    if(newlineStrategy === 'br') {
        for(var i = 0; i < linesLength; i++) {
            domElement.appendChild(document.createTextNode(lines[i]));
            domElement.appendChild(document.createElement('br'));
        }
    }
    else {
        for(var i = 0; i < linesLength; i++) {
            var lineElement = document.createElement(newlineStrategy);
            lineElement.textContent = lines[i];
            domElement.appendChild(lineElement);
        }
    }
}

// Generate a random ID
var id = makeid(5)
// Create a PeerJS object
var peer = new Peer(id);
// Grab DOM elements
let status_object = document.getElementById("status");
var main_menu_modal = new bootstrap.Modal(document.getElementById('main_menu_modal'));
var await_mode_modal = new bootstrap.Modal(document.getElementById('await_mode_modal'));
// Initalise variables to prevent errors in the console
var send_message;
var connect_mode;
var await_mode;


// Run Peer Open Handler when connected to the PeerJS network
peer.on('open' , function(id) {
    peer_open_handler(id);
});

// Update the status when errors occur
peer.on('error', function(err){
    status_object.innerHTML = "An error has occured";
});

// Notify the user that the connection has been closed
peer.on('close', function(){
    status_object.innerHTML = "Connection closed";
});

// Attempts to reconnect to PeerJS network if connection is lost
peer.on('disconnected', async function(){
    status_object.innerHTML = "Broker disconnected";
    await new Promise(resolve => setTimeout(resolve, 1000));
    peer.reconnect();
});

// Destroy the PeerJS connection when the page is closed
window.addEventListener("beforeunload", function(e){
    peer.destroy();
});

    