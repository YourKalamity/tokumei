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
    main_menu_modal.show();
    let peer_id_input = document.getElementById("PeerID_inputbox");
    peer_id_input.focus();
    peer_id_input.select();
    connect_mode = function() {
        main_menu_modal.hide()
        connection_id = peer_id_input.value
        mode = "TOKUMEI-" + connection_id;
        console.log("Connecting to " + connection_id + "...");
        var conn = peer.connect(mode);
        conn.on('open', function(){message_handler(conn)});
        return false;
    } 
    await_mode = function() {
        console.log("Hosting mode...");
        console.log("Awaiting connection....");
        status_object.innerHTML = "Awaiting connection...";
        main_menu_modal.hide()
        await_mode_modal.show()
        let peer_id_display = document.getElementById("peer_id_display");
        peer_id_display.innerHTML = id.substr(id.length - 5);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(id.substr(id.length - 5));
            let clipboard_notification = document.getElementById("clipboard_notification");
            clipboard_notification.hidden = false;
        }
        peer.on('connection', function(conn){
            conn.on('open', function(){message_handler(conn)});
        });
        return false;
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
var main_menu_modal = new bootstrap.Modal(document.getElementById('main_menu_modal'));
var await_mode_modal = new bootstrap.Modal(document.getElementById('await_mode_modal'));
var connect_mode;
var await_mode;

peer.on('open' , function(id) {
    peer_open_handler(id);
});