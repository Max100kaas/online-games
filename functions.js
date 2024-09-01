async function getMessages(){
    var connection = await dbconnect()
    var messages = await query("SELECT * FROM chat")
    for(var i = 0; i < messages.length; i++){
        messages[i].Message = iconv.decode(iconv.encode(messages[i].Message, "latin1"), "utf-8")
    }
    var renderedmessages = ""
    for(var i = 0; i < messages.length; i++){
        if(messages[i].User != 0){
            var msguser = await query("SELECT * FROM inloggegevens WHERE User = " + messages[i].User)
        }
        else{
            var msguser = [{User: 0, Username: "Anoniem", "Profile picture": 0}]
        }
        renderedmessages += "<p><img src='" + rootdir + "files/website-files/profiles/pfp" + msguser[0]["Profile picture"] + ".png' class='pfp'><span class='yellow'>" + msguser[0].Username + ": </span>" + messages[i].Message + "</p>"
    }
    connection.release();
    return renderedmessages
}

async function getTopbar(user){
    var topbar = "<div id='topbar'>"//await getTopbar()
    topbar += "<a href='" + rootdir + "'>Home</a>"
    topbar += "<a href='" + rootdir + "games/'>Games</a>"
    topbar += "<a href='" + rootdir + "extensies/'>Extensies</a>"
    topbar += "<a href='/'>Online</a>"

    if(user == false){
        topbar += "<a style='margin-left: auto;' href='" + rootdir + "accounts/signup.php'>Account aanmaken</a>"
        topbar += "<a href='" + rootdir + "accounts/login.php'>Inloggen</a>"
    }
    else{
        topbar += "<img class='pfpmain' style='margin-left: auto;' src='" + rootdir + "files/website-files/profiles/pfp" + user[0]["Profile picture"] + ".png'>"
        topbar += "<a href='" + rootdir + "accounts/index.php'>" + user[0].Username + "</a>"
    }
    topbar += "</div>"
    return topbar
}

async function getUser(cookies){
    var connection = await dbconnect()
    var user
    if(cookies.username && cookies.password){
        user = await query("SELECT * FROM inloggegevens WHERE Username = '" + cookies.username + "' && Password = '" + cookies.password + "'")
    }
    else{
        user = false
    }
    if(user.length != 1){
        user = false
    }
    connection.release();
    return user
}

async function query(q){
    var result = await new Promise((resolve) => {
        db.query(q, (error, result) => {
            if (error) throw error
            resolve(result)
        })
    })

    return result
}

async function dbconnect(){
    return await new Promise((resolve) => {
        db.getConnection((error, connection) => {
            if (error) throw error
            resolve(connection)
        })
    })
}

function md5(str){
    const md5hasher = crypto.createHash("md5")
    return md5hasher.update(str).digest("hex")
}