//Package importing and config
const express = require("express");
const http = require("http")
const ejs = require("ejs")
const mysql = require("mysql")
const socket = require("socket.io")
const cookieParser = require("cookie-parser");
const path = require("path")
const cors = require("cors");
const { connect } = require("http2");
const fs = require("fs")
const crypto = require("crypto")
require("dotenv").config()

const port = 443
const rootdir = "https://maxcodeandgames.nl/"//"C:/Users/MBoes/OneDrive - K.S.G. De Breul/Informatica/website projecten/Website/"
const app = express()
const server = http.createServer(app)

const db = mysql.createPool({
    connectionLimit: 10,
    host: 'maxcodeandgames.nl',
    port: 3306,
    user: 'Maxcodeandgames',
    password: process.env.DBPASSWORD,
    database: 'Maxcodeandgames',
    charset: 'utf8mb4'
});

module.exports = db;

eval(fs.readFileSync("functions.js")+"")

//Express app config
app.use(cookieParser());
const corsOptions = {
    origin:'*', 
    credentials:true,
    optionSuccessStatus:200,
 }
 
app.use(cors(corsOptions))

app.use(express.static(__dirname));

app.use(express.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'htdocs'));
app.set('view engine', 'ejs');

//Server request handling
app.get("/", async (req, res) => {
    var user = await getUser(req.cookies)
    if(!user){
        // user = [{User: 19, Username: "Max100kaas", Password: "2ac46b4bf3564625ff490c4e3050da14", "Profile picture": 9}]
        res.redirect(rootdir + "accounts/login.php?redirect=" + process.env.SERVER_URL)
        return
    }
    const username = user[0].Username
    var topbar = await getTopbar(user)
    var gmessages = await getMessages()
    var rmessages = ""
    res.render('index', { gmessages, rmessages, rootdir, topbar, username });
})

app.post("/", async (req, res) => {
    if(req.body.password){
        req.body.password = crypto.createHash('md5').update(req.body.password).digest('hex')
    }
    var user = await getUser(req.body)
    if(!user){
        // user = [{User: 19, Username: "Max100kaas", Password: "2ac46b4bf3564625ff490c4e3050da14", "Profile picture": 9}]
        res.redirect(rootdir + "accounts/login.php?redirect=https://online.maxcodeandgames.nl")
        return
    }
    res.cookie("username", req.body.username, {maxAge: 86400 * 30 * 1000, sameSite: "none", secure: true})
    res.cookie("password", req.body.password, {maxAge: 86400 * 30 * 1000, sameSite: "none", secure: true})
    const username = user[0].Username
    var topbar = await getTopbar(user)
    var gmessages = await getMessages()
    var rmessages = ""
    res.render('index', { gmessages, rmessages, rootdir, topbar, username });
})

app.get("/racing", async (req, res) => {
    var user = await getUser(req.cookies)
    if(!user){
        user = [{User: 19, Username: "Max100kaas", Password: "2ac46b4bf3564625ff490c4e3050da14", "Profile picture": 9}]
    }
    const username = user[0].Username
    var topbar = await getTopbar(user)
    res.render('onlineracinggame', { rootdir, topbar, username });
})

server.listen(port, () => {
    console.log("Server running at port " + port)
})

// Code for message handling

{
    var messages = []

    const messageio = new socket.Server(server, {
        cors: {
          origin: "*",
          allowedHeaders: ["my-custom-header"],
          credentials: true
        }
    });

    messageio.on("connection", (socket) => {
        var messagesstr = ""
        for(var i = 0; i < messages.length; i++){
            messagesstr += messages[i]
        }
        socket.emit("NewMessage", messagesstr, "r")
        socket.on("NewMessage", async (username, message, chat) => {
            var connection = await dbconnect()
            var pfp = await query("SELECT `Profile picture` FROM inloggegevens WHERE username = '" + username + "'")
            var newmessage = "<p><img src='" + rootdir + "files/website-files/profiles/pfp" + pfp[0]["Profile picture"] + ".png' class='pfp'><span class='yellow'>" + username + ": </span>" + message + "</p>"
            if(chat == "r"){
                messages.push(newmessage)
                if (messages.length > 13){
                    messages.splice(0, 1)
                }
                setTimeout(() => {
                    if(messages.indexOf(newmessage) !== -1){
                        messages.splice(messages.indexOf(newmessage), 1)
                    }
                }, 600000)
                var messagesstr = ""
                for(var i = 0; i < messages.length; i++){
                    messagesstr += messages[i]
                }
                messageio.emit("NewMessage", messagesstr, chat)
            }
            if(chat == "g"){
                var user = await query("SELECT User FROM inloggegevens WHERE Username = '" + username + "'")
                if(user.length == 1){
                    await query("INSERT INTO chat VALUES (null, " + user[0].User + ", '" + message + "')")
                    messageio.emit("NewMessage", newmessage, chat)
                }
            }
            connection.release()
        })
    })
}

// Code for server side racing game

{
    const io = new socket.Server(server, {
        cors: {
          origin: "*",
          allowedHeaders: ["my-custom-header"],
          credentials: true
        },
        path: "//racing"
      });
    
    var users = []
    var gameStarted = false
    var usersInGame = []
    var stockedItems = []
    var finishedPlayers = []
    
    io.on("connection", (socket) => {
        if(users.indexOf("Anoniem#2604") !== -1){
            users.splice(users.indexOf("Anoniem#2604"), 1)
        }
        socket.on("SetUsername", (naam) => {
            users.push(naam)
            io.emit("UpdateUsers", users)
            if(gameStarted){
                socket.emit("GameAlreadyStarted")
            }
            socket.on("UpdatePlayers", (naam2, x, y, r, t, i, p) => {
                io.emit("UpdatePlayers", naam2, x, y, r, t, i, p)
            })
    
            socket.on("disconnect", () => {
                var index = users.indexOf(naam);
                if (index !== -1) {
                    users.splice(index, 1);
                }
                if(gameStarted){
                    index = usersInGame.indexOf(naam);
                    if (index !== -1) {
                        usersInGame.splice(index, 1);
                    }
                    if(usersInGame.length < 1){
                        io.emit("Restart")
                        restartRacingGame()
                    }
                }
                io.emit("UpdateUsers", users)
            })
    
            socket.on("BeginGame", (config) => {
                usersInGame = []
                gameStarted = true
                io.emit("BeginGame", config)
            })
    
            socket.on("RegisterPlayer", (user, color) => {
                io.emit("RegisterPlayer", user, color)
                usersInGame.push(user)
            })
    
            socket.on("NewProjectile", (proj) => {
                io.emit("NewProjectile", proj)
                if(proj.type == 4){
                    setTimeout(() => {
                        if(stockedItems.length == 0){
                            socket.emit("ReturnItem", 1)
                        }
                        else{
                            var returnedItem = 0
                            for(var i = 0; i < stockedItems.length; i++){
                                if(stockedItems[i] == 3){
                                    returnedItem = 3
                                    break
                                }
                            }
                            if(returnedItem == 3){
                                socket.emit("ReturnItem", 3)
                            }
                            else{
                                socket.emit("ReturnItem", stockedItems[Math.floor(Math.random() * stockedItems.length)])
                            }
                        }
                    }, 3000)
                }
            })
    
            socket.on("GiveItem", (item) => {
                stockedItems.push(item)
            })
    
            socket.on("Finish", (time, placement) => {
                finishedPlayers[placement] = {naam: naam, time: time}
                console.log("Finished players: " + (finishedPlayers.length-1))
                console.log("Users in game: " + usersInGame.length)
                if(finishedPlayers.length-1 == usersInGame.length){
                    var results = "Results"
                    for(var i = 1; i < finishedPlayers.length; i++){
                        results += "br;" + i + ". " + finishedPlayers[i].naam + "  " + finishedPlayers[i].time
                    }
                    io.emit("Results", results)
                    setTimeout(() => {
                        io.emit("Restart")
                        restartRacingGame()
                    }, 5000)
                }
            })
        })
    })
    
    function restartRacingGame(){
        gameStarted = false
        usersInGame = []
        stockedItems = []
        finishedPlayers = []
    }
}

// Functions