function makeid(length) {
    if (isNaN(length) || length < 1 || length > 256) {
        length = 5;
    }
    var result           = '';
    var characters       = 'abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return "TOKUMEI-" + result;
}

function peer_open_handler(id){
    console.log('My peer ID is: ' + id);
    let mode = prompt("Your Peer ID: " + id.slice(id.length-5) + "\nEnter the Peer ID of the person you want to connect to\nOr press cancel to wait for a connection");
    if (mode) {
        mode = "TOKUMEI-" + mode;
        console.log("Connecting to " + mode + "...");
        var conn = peer.connect(mode);
        conn.on('open', function(){message_handler(conn)});
    } else {
        console.log("Hosting mode...");
        console.log("Awaiting connection....");
        status_object.innerHTML = "Awaiting connection...";
        peer.on('connection', function(conn){
            conn.on('open', function(){message_handler(conn)});
        });
    }}

function message_handler (conn) {
    status_object.innerHTML = "Connected!";
    console.log("Connection opened");
    conn.on('data', function(data){
        messagebox = document.getElementById("chatbox");
        messagebox.innerHTML += "<br>PEER: " + data;
        messagebox.scrollTop = messagebox.scrollHeight;
    })
    send_message = function() {
        message = document.getElementById("user_message").value
        messagebox = document.getElementById("chatbox");
        messagebox.innerHTML += "<br>YOU: " + message;
        conn.send(message);
        document.getElementById("user_message").value = "";
        messagebox.scrollTop = messagebox.scrollHeight;
        return false;
    }
};

var id = makeid(5)
var peer = new Peer(id);

var send_message;
let status_object = document.getElementById("status");


peer.on('open' , function(id) {
    peer_open_handler(id);
});