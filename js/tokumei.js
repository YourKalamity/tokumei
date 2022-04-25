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
    main_menu_modal.show();
    let peer_id_input = document.getElementById("PeerID_inputbox");
    connect_mode = function() {
        main_menu_modal.hide()
        connection_id = peer_id_input.value
        mode = "TOKUMEI-" + connection_id;
        var conn = peer.connect(mode);
        conn.on('open', function(){message_handler(conn)});
        return false;
    } 
    await_mode = function() {
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
    let message_fieldset = document.getElementById("message_fieldset");
    message_fieldset.removeAttribute("disabled");
    status_object.innerHTML = "Connected!";
    console.log("Connection opened");
    conn.on('data', function(data){
        messagebox = document.getElementById("chatbox");
        messagebox.innerHTML += "<br>PEER: " + data;
        messagebox.scrollTop = messagebox.scrollHeight;
    })
    conn.on('close', function(){message_closer()});
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

function message_closer() {
    let message_fieldset = document.getElementById("message_fieldset");
    message_fieldset.setAttribute("disabled", "disabled");
    status_object.innerHTML = "Disconnected!";
}

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

peer.on('error', function(err){
    status_object.innerHTML = "An error has occured";
});

peer.on('close', function(){
    status_object.innerHTML = "Connection closed";
});

peer.on('disconnected', async function(){
    status_object.innerHTML = "Broker disconnected";
    await new Promise(resolve => setTimeout(resolve, 1000));
    peer.reconnect();
});

window.addEventListener("beforeunload", function(e){
    peer.destroy();
});

    