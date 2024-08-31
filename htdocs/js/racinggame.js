//var io = io()
const id = `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`
const inGameUsername = USERNAME + "#" + id

const chatHandler = io("/")

chatHandler.on("NewMessage", (c) => {
    var messages = c.split("<p")
    if(messages.length > 5){
        messages = messages.slice(messages.length-5)
    }
    document.getElementById("chat").innerHTML = ""
    for(var i = 0; i < messages.length; i++){
        document.getElementById("chat").innerHTML += "<p" + messages[i]
    }
})

var inputfocus = false
document.getElementById("messagecontent").onfocus = () => {inputfocus = true}
document.getElementById("messagecontent").onblur = () => {inputfocus = false}

document.getElementById("sendmessage").onclick = () => {
    if(document.getElementById("messagecontent").value != ""){
        chatHandler.emit("NewMessage", USERNAME, document.getElementById("messagecontent").value, "r")
        document.getElementById("messagecontent").value = ""
    }
}
addEventListener("keypress", (e) => {
    if(e.key == "Enter" && inputfocus && document.getElementById("messagecontent").value != ""){
        chatHandler.emit("NewMessage", USERNAME, document.getElementById("messagecontent").value, "r")
        document.getElementById("messagecontent").value = ""
    }
})

//const main = (function() {
    var players = {}
    const socket = io('http://192.168.20.148:3000', {
        path: "//racing"
    });
    // const socket = io();
    socket.on('connect', () => {
        socket.emit("SetUsername", inGameUsername)
    });
    socket.on("GameAlreadyStarted", () => {
        document.getElementById("startgame").style.display = "none"
        document.getElementById("gamealreadystarted").style.display = "block"
    })
    socket.on("UpdateUsers", (users) => {
        // if(!starting && !racing){
        //     players = users
        // }
        var elements = document.getElementsByClassName("menuplayer")
        var elementlength = elements.length
        for(var i = 0; i < elementlength; i++){
            elements[0].parentNode.removeChild(elements[0])
        }
        for(var i = 0; i < users.length; i++){
            var menuplayer = document.createElement("div")
            menuplayer.classList = "menuplayer"
            menuplayer.innerHTML = users[i]
            if(users[i] == inGameUsername){
                menuplayer.style.backgroundColor = "#33aaaa"
            }
            document.getElementById("menu").insertBefore(menuplayer, document.getElementById("startgame"))
        }
    })
    socket.on("BeginGame", (config) => {
        if(!starting){
            beginGame(false, config)
        }
    })
    socket.on("RegisterPlayer", (naam, color) => {
        players[naam] = {c: color}
        for(var i = 0; i < Object.keys(players).length; i++){
            if(Object.keys(players)[i] == inGameUsername){
                pos.x = 115 + 5 * (i%3)
                pos.y = Math.floor(i/3) * 5
            }
        }
    })
    socket.on("NewProjectile", (proj) => {
        if(proj.type == 3){
            players[proj.origin].dillaTime = 150
        }
        else if(proj.type == 4){
            if(item != 0){
                socket.emit("GiveItem", item)
                item = 0
                itemAmmoLeft = 0
                itemCycleAnimFrame = 0
                itemStealTime = 100
            }
            players[proj.origin].invisTime = 150
        }
        else{
            if(proj.origin != inGameUsername){
                projectiles.push(proj)
            }
        }
    })

    socket.on("ReturnItem", returnedItem => {
        item = returnedItem
        if(item == 2){
            itemAmmoLeft = 3
        }
        else{
            itemAmmoLeft = 1
        }
        itemCycleAnimFrame = 100
        itemStealTime = 100
    })

    socket.on("Results", (result) => {
        results = result
    })

    socket.on("Restart", () => {
        restart()
    })

    const canvas = document.createElement("canvas")
    canvas.width = 800
    canvas.height = 600
    canvas.style.border = "1px solid black"
    document.getElementById("canvascontainer").appendChild(canvas)
    const ctx = canvas.getContext("2d")
    var path = new Path2D()
    var negatepath = new Path2D()
    var key = []
    var pos = {x: 115, y: 0}
    var r = 0.5*Math.PI
    const s = 7
    const trackSize = 1
    var trackWidth = 50*trackSize-30
    var vel = {x: 0, y: 0, r: 0}
    var defaultSpeed = 0.2
    var speed = 0.2
    var defaultFriction = 0.8
    var friction = 0.9
    var help = 1
    //var car = document.createElement("img")
    var color = document.getElementById("colorselect").value
    //car.src = "assets/car1.png"

    var langetomaat = document.createElement("img")
    langetomaat.src = "/files/racing/langetomaat.png"
    var langetomaatw = document.createElement("img")
    langetomaatw.src = "/files/racing/langetomaatwarning.png"
    var bal = document.createElement("img")
    bal.src = "/files/racing/broodjeBal/bal.png"
    var dilla = document.createElement("img")
    dilla.src = "/files/racing/dilla.png"
    var boer = document.createElement("img")
    boer.src = "/files/racing/boer.png"

    var itembox = document.createElement("img")
    itembox.src = "/files/racing/itembox.png"

    const carSize = 0.6
    var lap = 0
    var dirLaps = 0
    
    var startTime = new Date().getTime()
    var time = new Date()
    var seconds
    var minutes
    var milliseconds
    
    var shownTime
    var stoppedShownTime = false
    
    var boost = 0
    var boosting = false
    
    var cardir = 0
    
    const trackmiddle = {x: -50, y: 50}
    
    var finished = false
    var finishAnimFrames = 0
    var racing = false
    var startAnimFrames = 0
    var starting = false
    
    var colors = [`AliceBlue`,`AntiqueWhite`,`Aqua`,`Aquamarine`,`Azure`,`Beige`,`Bisque`,`Black`,`BlanchedAlmond`,`Blue`,`BlueViolet`,`Brown`,`BurlyWood`,`CadetBlue`,`Chartreuse`,`Chocolate`,`Coral`,`CornflowerBlue`,`Cornsilk`,`Crimson`,`Cyan`,`DarkBlue`,`DarkCyan`,`DarkGoldenRod`,`DarkGray`,`DarkGrey`,`DarkGreen`,`DarkKhaki`,`DarkMagenta`,`DarkOliveGreen`,`Darkorange`,`DarkOrchid`,`DarkRed`,`DarkSalmon`,`DarkSeaGreen`,`DarkSlateBlue`,`DarkSlateGray`,`DarkSlateGrey`,`DarkTurquoise`,`DarkViolet`,`DeepPink`,`DeepSkyBlue`,`DimGray`,`DimGrey`,`DodgerBlue`,`FireBrick`,`FloralWhite`,`ForestGreen`,`Fuchsia`,`Gainsboro`,`GhostWhite`,`Gold`,`GoldenRod`,`Gray`,`Grey`,`Green`,`GreenYellow`,`HoneyDew`,`HotPink`,`IndianRed`,`Indigo`,`Ivory`,`Khaki`,`Lavender`,`LavenderBlush`,`LawnGreen`,`LemonChiffon`,`LightBlue`,`LightCoral`,`LightCyan`,`LightGoldenRodYellow`,`LightGray`,`LightGrey`,`LightGreen`,`LightPink`,`LightSalmon`,`LightSeaGreen`,`LightSkyBlue`,`LightSlateGray`,`LightSlateGrey`,`LightSteelBlue`,`LightYellow`,`Lime`,`LimeGreen`,`Linen`,`Magenta`,`Maroon`,`MediumAquaMarine`,`MediumBlue`,`MediumOrchid`,`MediumPurple`,`MediumSeaGreen`,`MediumSlateBlue`,`MediumSpringGreen`,`MediumTurquoise`,`MediumVioletRed`,`MidnightBlue`,`MintCream`,`MistyRose`,`Moccasin`,`NavajoWhite`,`Navy`,`OldLace`,`Olive`,`OliveDrab`,`Orange`,`OrangeRed`,`Orchid`,`PaleGoldenRod`,`PaleGreen`,`PaleTurquoise`,`PaleVioletRed`,`PapayaWhip`,`PeachPuff`,`Peru`,`Pink`,`Plum`,`PowderBlue`,`Purple`,`RosyBrown`,`RoyalBlue`,`SaddleBrown`,`Salmon`,`SandyBrown`,`SeaGreen`,`SeaShell`,`Sienna`,`Silver`,`SkyBlue`,`SlateBlue`,`SlateGray`,`SlateGrey`,`Snow`,`SpringGreen`,`SteelBlue`,`Tan`,`Teal`,`Thistle`,`Tomato`,`Turquoise`,`Violet`,`Wheat`,`White`,`WhiteSmoke`,`Yellow`,`YellowGreen`]
    
    var projectiles = []
    var trailing = false

    var flame = []
    var broodjebal = []

    const defaultIFrames = 100
    var iFrames = 100
    var spindir = 0

    var item = 0//Math.floor(Math.random() * 4 + 1)
    var itemAmmoLeft = 0
    var itemCycleAnimFrame = 0

    var posInRace = undefined
    var startDirInRace = undefined

    var dillaTime = 0
    var invisTime = 0

    var itemStealTime = 0

    var placement
    var maxPosInRace = 0

    var results = false

    for(var i = 0; i < 7; i++){
        flame[i] = new Image()
        flame[i].src = "/files/racing/flames/flame" + i + ".gif"
    }

    for(var i = 1; i < 4; i++){
        broodjebal[i] = new Image()
        broodjebal[i].src = "/files/racing/broodjeBal/broodjeBal" + i + ".png"
    }

    const itemIcons = [langetomaat, broodjebal[3], dilla, boer]
    
    addEventListener("load", () => {
        document.getElementById("startgame").addEventListener("click", () => {beginGame()}) 
    })
    
    for(var i = 0; i < colors.length; i++){
        var element = document.createElement("option")
        element.innerHTML = colors[i]
        element.id = colors[i]
        document.getElementById("colorselect").appendChild(element)
    }
    
    //var starting = true
     
    const arcs = {
        0: [-50, -80, 50*trackSize, 0, 0.5],
        1: [70, -80, 50*trackSize, 0.5, 1],
        2: [70, 50, 50*trackSize, 1, 1.5],
        3: [65, 50, 50*trackSize, 1.5, 2],
        4: [-35, 25, 50*trackSize, 1, 0.5, true],
        5: [-50, -75, 50*trackSize, 1.5, 2],
    }
    
    const roadmarks = {
        0: [-50, -80, (50*trackSize+30)/2, 0, 0.5],
        1: [70, -80, (50*trackSize+30)/2, 0.5, 1],
        2: [70, 50, (50*trackSize+30)/2, 1, 1.5],
        3: [65, 50, (50*trackSize+30)/2, 1.5, 2],
        4: [-35, 25, 60, 1, 0.5, true],
        5: [-50, -75, (50*trackSize+30)/2, 1.5, 2],
    }
    
    const negarcs = {
        0: [-50, -80, 30, 0, 0.5],
        1: [70, -80, 30, 0.5, 1],
        2: [70, 50, 30, 1, 1.5],
        3: [65, 50, 30, 1.5, 2],
        4: [-35, 25, 70, 1, 0.5, true],
        5: [-50, -75, 30, 1.5, 2],
    }
    
    const negarcs2 = {
        0: [-50, -80, 10, 0, 0.5],
        1: [70, -80, 10, 0.5, 1],
        2: [70, 50, 10, 1, 1.5],
        3: [65, 50, 10, 1.5, 2],
        4: [-35, 25, 90, 1, 0.5, true],
        5: [-50, -75, 10, 1.5, 2],
    }

    const negarcs3 = {
        0: [-50, -80, 70, 0, 0.5],
        1: [70, -80, 70, 0.5, 1],
        2: [70, 50, 70, 1, 1.5],
        3: [65, 50, 70, 1.5, 2],
        4: [-35, 25, 30, 1, 0.5, true],
        5: [-50, -75, 70, 1.5, 2],
    }
    
    const finishline = {
        0: [-110-trackWidth, 1, -110, 1],
        1: [-110, 0, -110-trackWidth, 0]
    }

    const car = {
        0: [-13, -17, -6, -17, -6, -7, -13, -7, "black"],
        1: [6, -17, 13, -17, 13, -7, 6, -7, "black"],
        2: [-13, 6, -6, 6, -6, 16, -13, 16, "black"],
        3: [6, 6, 13, 6, 13, 16, 6, 16, "black"],
        4: [-6, -12, 6, -12, 6, 11, -6, 11, "red"],
    }
    
    document.addEventListener("keydown", function(e){
        key[e.key] = true
    })
    document.addEventListener("keyup", function(e){
        key[e.key] = false
    })
    window.addEventListener("keydown", function(e) {
        if(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault();
        }
    });
    
    setInterval(() => {
        if(racing){
            if(key.e && boost>=10){
                boost-=10
                boosting = true
                speed = defaultSpeed*2
            }
            else if(dillaTime > 0){
                speed = defaultSpeed*1.2
            }
            else{
                boosting = false
                speed = defaultSpeed
            }
            if (ctx.isPointInPath(path, 400, 300) && !ctx.isPointInPath(negatepath, 400, 300)) {
                friction = 1-(1-defaultFriction)/2
            }
            else{
                if(boosting || dillaTime > 0){
                    friction = 1-(1-defaultFriction)/2
                }
                else{
                    friction = defaultFriction*0.8
                }
            }
            if(iFrames > 30 && !finished){
                if(key.ArrowDown){
                    vel.x+=speed*Math.cos(r)*(((maxPosInRace - posInRace)>360?360:(maxPosInRace - posInRace))/360 + 1)
                    vel.y+=speed*Math.sin(r)*(((maxPosInRace - posInRace)>360?360:(maxPosInRace - posInRace))/360 + 1)
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                }
                if(key.ArrowUp){
                    vel.x-=speed*Math.cos(r)*(((maxPosInRace - posInRace)>360?360:(maxPosInRace - posInRace))/360*(help/2) + 1)
                    vel.y-=speed*Math.sin(r)*(((maxPosInRace - posInRace)>360?360:(maxPosInRace - posInRace))/360*(help/2) + 1)
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                }
                if(key.ArrowLeft){
                    vel.r+=0.01
                    cardir = -1
                }
                else if(key.ArrowRight){
                    vel.r-=0.01
                    cardir = 1
                }
                else{
                    cardir = 0
                }
            }
            if(boost < 1000){
                boost+=1
            }
            if(dillaTime > 0){
                dillaTime--
            }

            if(key.q && !trailing && itemCycleAnimFrame >= 100 && item != 0){
                spawnProjectile(item)
            }
            if(!key.q && trailing){
                for(var i = 0; i < projectiles.length; i++){
                    var proj = projectiles[i]
                    if(proj.origin == inGameUsername && proj.type == 1){
                        proj.trailing = false
                    }
                }
                trailing = false
            }
            if(iFrames < defaultIFrames){
                iFrames++
                if(iFrames == 1){
                    spindir = Math.PI/2
                }
                if(iFrames < 31){
                    spindir += (Math.PI/12) * (2.43 * 1.05 ** -iFrames)
                }
            }
        
            time = new Date().getTime() - startTime
            milliseconds = time % 1000
            milliseconds<10 ? milliseconds = "00" + milliseconds : null;
            milliseconds<100 ? milliseconds = "0" + milliseconds : null;
            seconds = Math.floor(time/1000)
            minutes = Math.floor(seconds/60)
            seconds %= 60
            seconds<10 ? seconds = "0" + seconds : null;
            shownTime = minutes + ":" + seconds + ":" + milliseconds;

            checkCollision()

            socket.emit("UpdatePlayers", inGameUsername, pos.x, pos.y, r, trailing, iFrames, posInRace)

            if(key["'"]){
                socket.disconnect()
                racing = false
            }
        }
        else{
            shownTime = "0:00:000"
        }
    
        drawMap(pos.x, pos.y, r)
    
        vel.x *= friction
        vel.y *= friction
        vel.r *= friction
        pos.x += vel.x
        pos.y += vel.y
        r += vel.r
    
        if(key.Enter && !starting){
            beginGame()
        }
    }, 30)

    function checkCollision(){
        for(var i = 0; i < Object.keys(players).length; i++){
            if(Object.keys(players)[i] != inGameUsername){
                var opponent = players[Object.keys(players)[i]]
                if(Math.sqrt((pos.x - opponent.x)**2 + (pos.y - opponent.y)**2) < 3 && dillaTime == 0 && invisTime == 0 && !opponent.invisTime > 0){
                    var velx = pos.x - opponent.x
                    var vely = pos.y - opponent.y
                    var maxvel = Math.max(Math.abs(velx), Math.abs(vely))
                    velx /= maxvel
                    vely /= maxvel
                    vel.x += velx
                    vel.y += vely
                }
            }
        }
    }

    function spawnProjectile(type){
        if(type == 1 || type == 2){
            var newProjectile = {}
            newProjectile.r = r
            newProjectile.type = type
            newProjectile.timeToLive = 300
            newProjectile.origin = inGameUsername
            if(type == 1){
                newProjectile.trailing = true
                newProjectile.x = pos.x
                newProjectile.y = pos.y
            }
            else{
                newProjectile.trailing = false
                newProjectile.x = pos.x
                newProjectile.y = pos.y
                newProjectile.velx = Math.cos(r) * 5
                newProjectile.vely = Math.sin(r) * 5
            }
            projectiles.push(newProjectile)
            socket.emit("NewProjectile", newProjectile)
        }
        if(type == 3){
            dillaTime = 150
            socket.emit("NewProjectile", {type: 3, origin: inGameUsername})
        }
        if(type == 4){
            invisTime = 150
            socket.emit("NewProjectile", {type: 4, origin: inGameUsername, posInRace: posInRace})
        }
        itemAmmoLeft--
        if(itemAmmoLeft == 0){
            item = 0
            itemCycleAnimFrame = 0
        }
        trailing = true
    }
    
    function drawMap(x, y, r){
    
        //Drawn map parts
    
        path = new Path2D()
        negatepath = new Path2D()
        var negatepath2 = new Path2D()
        var negatepath3 = new Path2D()
        var rmpath = new Path2D()
        var finishpath = new Path2D()
        var finishpath2 = new Path2D()
    
        ctx.beginPath()
        ctx.fillStyle = "#004400"
        ctx.rect(0, 0, canvas.width, canvas.height)
        ctx.fill()
    
        setArcs(x, y, 400, 300, negatepath3, negarcs3)
        setArcs(x, y, 400, 300, path, arcs)
        setArcs(x, y, 400, 300, negatepath, negarcs)
        setArcs(x, y, 400, 300, negatepath2, negarcs2)
        setArcs(x, y, 400, 300, rmpath, roadmarks)
        setLine(x, y, 400, 300, finishpath, finishline[0])
        setLine(x, y, 400, 300, finishpath, finishline[1])
    
        ctx.fillStyle = "#007700"
        ctx.fill(negatepath3, "evenodd")
        ctx.fillStyle = "#333"
        ctx.setLineDash([30, 30])
        ctx.fill(path, "evenodd")
        ctx.fillStyle = "#007700"
        ctx.fill(negatepath, "evenodd")
        ctx.fillStyle = "#004400"
        ctx.fill(negatepath2, "evenodd")
    
        if(ctx.isPointInPath(negatepath2, 400, 300) || !ctx.isPointInPath(negatepath3, 400, 300)){
            vel.x = -vel.x
            vel.y = -vel.y
            pos.x += vel.x
            pos.y += vel.y
        }
    
        ctx.strokeStyle = "#FFF"
        ctx.lineWidth = 5
        ctx.stroke(rmpath)
    
        ctx.setLineDash([1*s, 1*s])
        ctx.lineWidth = 1*s
        ctx.stroke(finishpath)
        ctx.stroke(finishpath2)
    
        setCheckpoints()

        ctx.beginPath()

        if(!finished){
            var newPosInRace = Math.atan2(60 - pos.x, -50 - pos.y) * 180/Math.PI + dirLaps*360 - startDirInRace
            if(newPosInRace - posInRace < -300){
                dirLaps++
                newPosInRace+=360
            }
            if(newPosInRace - posInRace > 300){
                dirLaps--
                newPosInRace-=360
            }
            posInRace = newPosInRace
        }

        //ctx.translate(0, 0)
        var realPos = getPos(-38, -32)
        ctx.translate(realPos[0], realPos[1])
        ctx.rotate(r)
        ctx.drawImage(itembox, 0, 0, 100, 100)

        var collpath = new Path2D()
        collpath.moveTo(-5, -5)
        collpath.lineTo(105, -5)
        collpath.lineTo(105, 105)
        collpath.lineTo(-5, 105)
        collpath.closePath()
        //ctx.fill(collpath)
        var playerPos = getPos(pos.x, pos.y)
        if(ctx.isPointInPath(collpath, playerPos[0], playerPos[1]) && item == 0){
            obtainRandomItem()
        }
        ctx.rotate(-r)
        ctx.translate(-realPos[0], -realPos[1])


    
        //Sprites
    
        var tempcolor
        if(dillaTime > 0){
            tempcolor = "hsl(" + dillaTime*10 + ", 100%, 50%)"
        }
        else{
            tempcolor = color
        }
        if(iFrames == defaultIFrames || iFrames % 4 < 2 || iFrames < 30){
            if(invisTime > 0){
                invisTime--
                ctx.globalAlpha = 0.5
            }
            if(iFrames < 30){
                drawCar(400, 300, carSize, spindir, tempcolor, true)
            }
            else{
                drawCar(400, 300, carSize, Math.PI/2, tempcolor, true)
            }
            ctx.globalAlpha = 1
        }

        for(var i = 0; i < Object.keys(players).length; i++){
            if(Object.keys(players)[i] != inGameUsername){
                var opponent = players[Object.keys(players)[i]]
                var oppcolor = opponent.c
                if(opponent.dillaTime > 0){
                    opponent.dillaTime--
                    oppcolor = "hsl(" + opponent.dillaTime*10 + ", 100%, 50%)"
                }
                if(opponent.invisTime > 0){
                    opponent.invisTime--
                    ctx.globalAlpha = 0
                }
                if(opponent.iFrames < 30){
                    drawCar(opponent.x, opponent.y, carSize, opponent.r - (1.1 ** -opponent.iFrames * Math.PI * 3 - 0.54), oppcolor)
                }
                else if(opponent.iFrames % 4 < 2){
                    drawCar(opponent.x, opponent.y, carSize, opponent.r, oppcolor)
                }
                ctx.fillStyle = "white"
                ctx.textAlign = "center"
                ctx.font = "15px sans-serif"
                ctx.translate(getPos(opponent.x, opponent.y)[0], getPos(opponent.x, opponent.y)[1])
                //ctx.rotate(opponent.r)
                ctx.fillText(Object.keys(players)[i], 0, -25)
                //ctx.rotate(-opponent.r)
                ctx.translate(-getPos(opponent.x, opponent.y)[0], -getPos(opponent.x, opponent.y)[1])
                ctx.globalAlpha = 1
            }
        }

        for(var i = 0; i < projectiles.length; i++){
            var proj = projectiles[i]
            if(proj.trailing){
                if(proj.origin == inGameUsername){
                    proj.x = pos.x
                    proj.y = pos.y
                    proj.r = r
                }
                else{
                    proj.x = players[proj.origin].x
                    proj.y = players[proj.origin].y
                    proj.r = players[proj.origin].r

                    if(players[proj.origin].trailing == false){
                        proj.trailing = false
                    }
                }
            }
            else if(proj.timeToLive > 150){
                proj.timeToLive--
            }
            proj.timeToLive--
            var projpos = getPos(proj.x, proj.y)//[proj.x, proj.y]//
            ctx.translate(projpos[0], projpos[1])
            ctx.rotate(r - proj.r)
            if(proj.type == 1){
                drawProj1(proj, i)
            }
            if(proj.type == 2){
                proj.x -= proj.velx
                proj.y -= proj.vely
                var newPath = new Path2D()
                newPath.arc(8, 8, 20, 0, Math.PI*2)
                ctx.fillStyle = "black"
                ctx.globalAlpha = 0
                ctx.fill(newPath)
                ctx.globalAlpha = 1
                if(ctx.isPointInPath(newPath, 400, 300) && iFrames == defaultIFrames && proj.origin != inGameUsername && dillaTime == 0 && invisTime == 0){
                    iFrames = 0
                }
                ctx.drawImage(bal, 0, 0)
            }
            ctx.rotate(-r + proj.r)
            ctx.translate(-projpos[0], -projpos[1])
            if(proj.timeToLive <= 0){
                projectiles.splice(i, 1)
            }
        }


        //UI
    
        ctx.fillStyle = "#FFF"
        ctx.font = "36px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(lap=="Finish"?lap:lap + " / 7", 50, 50)
        ctx.textAlign = "end"
        ctx.fillText(stoppedShownTime != false?stoppedShownTime:shownTime, 750, 50)
        ctx.textAlign = "start"
        ctx.fillText("Boost: " + Math.floor(boost/10), 50, 550)

        if(itemCycleAnimFrame > 0){
            ctx.beginPath()
            ctx.arc(70, 130, 50, 0, 2*Math.PI)
            ctx.globalAlpha = 0.5
            ctx.fillStyle = "grey"
            ctx.fill()
            ctx.beginPath()
            ctx.arc(70, 130, 55, 0, 2*Math.PI)
            ctx.globalAlpha = 0.75
            ctx.lineWidth = 10
            ctx.strokeStyle = "grey"
            ctx.stroke()
            ctx.globalAlpha = 1
    
            if(itemCycleAnimFrame < 100){
                itemCycleAnimFrame++
                if(itemCycleAnimFrame%20 > 14){
                    ctx.drawImage(itemIcons[3], 35, 95, 70, 70)
                }
                else if(itemCycleAnimFrame%20 > 9){
                    ctx.drawImage(itemIcons[0], 30, 100)
                }
                else if(itemCycleAnimFrame%20 > 4){
                    ctx.drawImage(itemIcons[1], 30, 100, 80, 80)
                }
                else{
                    ctx.drawImage(itemIcons[2], 30, 90, 80, 80)
                }
            }
            else{
                if(item == 1){
                    ctx.drawImage(itemIcons[0], 30, 100)
                }
                if(item == 2){
                    ctx.drawImage(broodjebal[itemAmmoLeft], 30, 100, 80, 80)
                }
                if(item == 3){
                    ctx.drawImage(itemIcons[2], 30, 90, 80, 80)
                }
                if(item == 4){
                    ctx.drawImage(itemIcons[3], 35, 95, 70, 70)
                }
            }
        }
    
        if(finished){
            finishAnimFrames++
            if(finishAnimFrames <= 50){
                ctx.textAlign = "center"
                ctx.globalAlpha = -finishAnimFrames/50 + 1
                ctx.font = (finishAnimFrames + 36) + "px sans-serif"
                ctx.fillText("Finish", 400, 300+(finishAnimFrames+36)/2)
                ctx.globalAlpha = 1
            }
        }
    
        if(starting){
            startAnimFrames+=1
            if(startAnimFrames == 100){
                start()
            }
            if(startAnimFrames < 33){
                ctx.textAlign = "center"
                ctx.globalAlpha = -startAnimFrames/33 + 1
                ctx.font = (startAnimFrames + 100) + "px sans-serif"
                ctx.fillText("3", 400, 300+(startAnimFrames+36)/2)
                ctx.globalAlpha = 1
            }
            else if(startAnimFrames < 66){
                ctx.textAlign = "center"
                ctx.globalAlpha = -(startAnimFrames-33)/33 + 1
                ctx.font = (startAnimFrames + 100) + "px sans-serif"
                ctx.fillText("2", 400, 300+(startAnimFrames+36)/2)
                ctx.globalAlpha = 1
            }
            else if(startAnimFrames < 100){
                ctx.textAlign = "center"
                ctx.globalAlpha = -(startAnimFrames-66)/33 + 1
                ctx.font = (startAnimFrames + 100) + "px sans-serif"
                ctx.fillText("1", 400, 300+(startAnimFrames+36)/2)
                ctx.globalAlpha = 1
            }
            else if(startAnimFrames < 133){
                ctx.textAlign = "center"
                ctx.globalAlpha = -(startAnimFrames-100)/33 + 1
                ctx.font = (startAnimFrames + 100) + "px sans-serif"
                ctx.fillText("Go", 400, 300+(startAnimFrames+36)/2)
                ctx.globalAlpha = 1
            }
        }

        if(racing){
            if(!finished){
                placement = 1
                maxPosInRace = 0
                for(var i = 0; i < Object.keys(players).length; i++){
                    if(players[Object.keys(players)[i]].placement > posInRace && Object.keys(players)[i] != inGameUsername){
                        placement++
                    }
                    if(players[Object.keys(players)[i]].placement > maxPosInRace){
                        maxPosInRace = players[Object.keys(players)[i]].placement
                    }
                }
            }
            ctx.fillStyle = "black"
            ctx.font = "100px sans-serif"
            ctx.fillText(placement, 700, 540)
        }

        if(itemStealTime > 0){
            itemStealTime-=4
            ctx.globalAlpha = itemStealTime/100
            ctx.drawImage(boer, 400 - itemStealTime/2 - 50, 300 - itemStealTime/2 - 50, itemStealTime + 100, itemStealTime + 100)
            ctx.globalAlpha = 1
        }

        if(results){
            ctx.font = "20px sans-serif"
            ctx.textAlign = "end"
            ctx.fillStyle = "white"
            var textlines = results.split("br;")
            for(var i = 0; i < textlines.length; i++){
                ctx.fillText(textlines[i], 780, 100 + 30*i)
            }
        }
    }
    
    function drawCar(x, y, size, dir, color = "red", player = false){
        for(var i = 0; i < Object.keys(car).length; i++){
            if(i != 4){
                setRect(car[i], x, y, size, dir, "black", player)
            }
            else{
                setRect(car[i], x, y, size, dir, color, player)
            }
        }
    }

    function setRect(pos, x, y, size, dir, color, player = false){
        ctx.beginPath()
        if(player){
            var realPos = rotatePos(pos[0], pos[1], x, y, dir)
            realPos = [realPos[0] + x, realPos[1] + y]
        }
        else{
            var realPos = rotatePos(pos[0], pos[1], x, y, dir)
            realPos = getPos(realPos[0]/s + x, realPos[1]/s + y)
        }
        ctx.moveTo(realPos[0], realPos[1])
        for(var i = 1; i < 4; i++){
            if(player){
                var realPos = rotatePos(pos[i*2], pos[i*2+1], x, y, dir)
                realPos = [realPos[0] + x, realPos[1] + y]
            }
            else{
                var realPos = rotatePos(pos[i*2], pos[i*2+1], x, y, dir)
                realPos = getPos(realPos[0]/s + x, realPos[1]/s + y)
            }
            ctx.lineTo(realPos[0], realPos[1])
        }
        ctx.fillStyle = color
        ctx.fill()
    }
    
    function setCheckpoints(){
        // var checkpoints = {
        //     0: [-130, 0, -110, 0],
        //     1: [-20, 100, -20, 120],
        //     2: [40, 35, 40, 15],
        //     3: [-75, -80, -75, -100],
        // }
        var checkpoints = [-140, 0, -90, 0]

        ctx.setLineDash([])
        ctx.lineWidth = 5
        ctx.fillStyle = "red"
        ctx.strokeStyle = "red"
        var checkpointlineC = new Path2D()
        var splitcheckpoint = [checkpoints[0], checkpoints[1], checkpoints[2], checkpoints[3]]
        var length = Math.round(Math.sqrt((checkpoints[0] - checkpoints[2])**2 + (checkpoints[1] - checkpoints[3])**2))/5
        for(var j = 0; j < length+1; j++){
            if(j > 0){
                splitcheckpoint[0] += (checkpoints[2] - checkpoints[0])/length
                splitcheckpoint[1] += (checkpoints[3] - checkpoints[1])/length
            }
            splitcheckpoint[2] = splitcheckpoint[0] + (checkpoints[2] - checkpoints[0])/length
            splitcheckpoint[3] = splitcheckpoint[1] + (checkpoints[3] - checkpoints[1])/length
            
            setCollisionLine(pos.x, pos.y, 400, 300, checkpointlineC, splitcheckpoint)
        }
        //ctx.fill(checkpointlineC)
        if(ctx.isPointInPath(checkpointlineC, 400, 300)){
            if(lap == dirLaps){
                if(lap == 7){
                    finish()
                }
                else if(lap != "Finish"){
                    lap++
                    stoppedShownTime = minutes + ":" + seconds + ":" + milliseconds
                    setTimeout(()=>{stoppedShownTime=false}, 1000)
                }
            }
        }
    }

    function drawProj1(proj, projid){
        if(proj.timeToLive < 200){
            if(proj.timeToLive > 150){
                var newPath = new Path2D()
                newPath.moveTo(-20, 15)
                newPath.lineTo(-20, 90)
                newPath.lineTo(35, 90)
                newPath.lineTo(35, 15)
                newPath.closePath()
                // ctx.fillStyle = "red"
                // ctx.fill(newPath)
                for(var i = 0; i < Object.keys(players).length; i++){
                    var opponent = players[Object.keys(players)[i]]
                    var otherpos = getPos(opponent.x, opponent.y)
                    if(ctx.isPointInPath(newPath, otherpos[0], otherpos[1])){
                        proj.timeToLive = 150
                    }
                }

                for(var i = 0; i < projectiles.length; i++){
                    if(i != projid && projectiles[i].type == 2){
                        var otherpos = getPos(projectiles[i].x, projectiles[i].y)
                        if(ctx.isPointInPath(newPath, otherpos[0], otherpos[1])){
                            proj.timeToLive = 150
                            projectiles[i].timeToLive = 0
                        }
                    }
                }

                if(proj.timeToLive % 10 >= 5){
                    ctx.drawImage(langetomaatw, -33, 15)
                }
                else{
                    ctx.drawImage(langetomaat, -33, 15)
                }
            }
            else{
                if(proj.trailing){
                    proj.trailing = false
                }
                ctx.beginPath()
                var newPath = new Path2D()
                newPath.arc(2, 50, 60, 0, Math.PI*2)
                ctx.fillStyle = "red"
                ctx.globalAlpha = 0.5 * proj.timeToLive/150
                ctx.fill(newPath)
                if(ctx.isPointInPath(newPath, 400, 300) && iFrames == defaultIFrames && dillaTime == 0 && invisTime == 0){
                    iFrames = 0
                }
                ctx.globalAlpha = 1 * proj.timeToLive/150
                ctx.drawImage(flame[Math.floor(proj.timeToLive/2) % 7], -30, 5, 70, 70)
                ctx.globalAlpha = 1
                ctx.beginPath()
                ctx.strokeStyle = "red"
                ctx.arc(proj.x - Math.cos(r) * 6, proj.y - Math.sin(r) * 6, 7, 0, Math.PI*2)
                //ctx.stroke
            }
        }
        else{
            var newPath = new Path2D()
            newPath.moveTo(-20, 15)
            newPath.lineTo(-20, 90)
            newPath.lineTo(35, 90)
            newPath.lineTo(35, 15)
            newPath.closePath()
            // ctx.fillStyle = "red"
            // ctx.fill(newPath)
            for(var i = 0; i < Object.keys(players).length; i++){
                var opponent = players[Object.keys(players)[i]]
                var otherpos = getPos(opponent.x, opponent.y)
                if(ctx.isPointInPath(newPath, otherpos[0],  otherpos[1]) && !(Object.keys(players)[i] == inGameUsername && trailing)){
                    proj.timeToLive = 150
                }
            }

            for(var i = 0; i < projectiles.length; i++){
                if(i != projid && projectiles[i].type == 2){
                    var otherpos = getPos(projectiles[i].x, projectiles[i].y)
                    if(ctx.isPointInPath(newPath, otherpos[0], otherpos[1])){
                        proj.timeToLive = 150
                        projectiles[i].timeToLive = 0
                    }
                }
            }

            ctx.drawImage(langetomaat, -33, 15)
        }
    }

    function obtainRandomItem(){
        itemCycleAnimFrame = 1
        itemAmmoLeft = 1
        if(Math.random() > 0.95){
            item = 4
        }
        else if(placement == 1){
            if(Math.random() > 0.5){
                item = 1
            }
            else{
                item = 2
                itemAmmoLeft = 3
            }
        }
        else if(placement == 2){
            if(Object.keys(players).length < 4 && Math.random() > 0.75){
                item = 3
            }
            else if(Math.random() > 0.66){
                item = 1
            }
            else{
                item = 2
                itemAmmoLeft = 3
            }
        }
        else{
            if(Math.random() < (maxPosInRace - posInRace)/500){
                item = 3
            }
            else if(Math.random() > 0.66){
                item = 1
            }
            else{
                item = 2
                itemAmmoLeft = 3
            }
        }
    }
    
    function setArcs(x, y, mx, my, path, arcs){
        for(var i = 0; arcs[i] != undefined; i++){
            if(arcs[i][5] === undefined){
                path.arc(mx+(arcs[i][1]+x)*s*Math.sin(r) - (arcs[i][0]+y)*s*Math.cos(r),  my- (arcs[i][1]+x)*s*Math.cos(r) - (arcs[i][0]+y)*s*Math.sin(r), arcs[i][2]*s, arcs[i][3]*Math.PI+r, arcs[i][4]*Math.PI+r)
            }
            else{
                path.arc(mx+(arcs[i][1]+x)*s*Math.sin(r) - (arcs[i][0]+y)*s*Math.cos(r), my - (arcs[i][1]+x)*s*Math.cos(r) - (arcs[i][0]+y)*s*Math.sin(r), arcs[i][2]*s, arcs[i][3]*Math.PI+r, arcs[i][4]*Math.PI+r, "r")
            }
        }
    }
    
    function setLine(x, y, mx, my, path, lines){
        path.moveTo(mx + (x+lines[0])*s*Math.sin(r)-(y+lines[1])*s*Math.cos(r), my - (x+lines[0])*s*Math.cos(r)-(y+lines[1])*s*Math.sin(r))
        path.lineTo(mx + (x+lines[2])*s*Math.sin(r)-(y+lines[3])*s*Math.cos(r), my - (x+lines[2])*s*Math.cos(r)-(y+lines[3])*s*Math.sin(r))
    }
    
    function setCollisionLine(x, y, mx, my, path, lines){
        var point1 = [mx + (x+lines[0])*s*Math.sin(r)-(y+lines[1])*s*Math.cos(r), my - (x+lines[0])*s*Math.cos(r)-(y+lines[1])*s*Math.sin(r)]
        var point2 = [mx + (x+lines[2])*s*Math.sin(r)-(y+lines[3])*s*Math.cos(r), my - (x+lines[2])*s*Math.cos(r)-(y+lines[3])*s*Math.sin(r)]
        path.rect(point1[0] - 20/7*s, point1[1] - 20/7*s, 40/7*s, 40/7*s)//, point2[0] - point1[0] + 4, point2[1] - [point1[1] + 4])
    }

    function getPos(pointx, pointy, rot = r){
        return ([400 + (pos.x-pointx)*s*Math.sin(rot)-(pos.y-pointy)*s*Math.cos(rot), 300 - (pos.x-pointx)*s*Math.cos(rot)-(pos.y-pointy)*s*Math.sin(rot)])
    }

    function rotatePos(pointx, pointy, mx, my, rot = r){
        return ([pointx*Math.sin(rot)-pointy*Math.cos(rot), - pointx*Math.cos(rot)-pointy*Math.sin(rot)])
    }
        
    function beginGame(sendToOthers = true, config = {speed: "100cc", help: "Normaal"}){
        document.getElementById("menu").style.display = "none"
        color = document.getElementById("colorselect").value
        if(color == ""){
            color = "red"
        }
        starting = true

        if(sendToOthers){
            var ingameSpeed
            document.querySelectorAll("input[name=Difficulty]").forEach((input) => {
                if(input.checked){
                    ingameSpeed = input.id
                }
            })
            var ingameHelp
            document.querySelectorAll("input[name=Achterstandsboost]").forEach((input) => {
                if(input.checked){
                    ingameHelp = input.id
                }
            })
            gameConfig(ingameSpeed, ingameHelp)
            socket.emit("BeginGame", {speed: ingameSpeed, help: ingameHelp})
        }
        else{
            gameConfig(config.speed, config.help)
        }
        socket.emit("RegisterPlayer", inGameUsername, color)
    }

    function gameConfig(speed, helpP){
        switch(speed){
            case "50cc":
                defaultSpeed = 0.2
                defaultFriction = 0.7
            break
            case "100cc":
                defaultSpeed = 0.2
                defaultFriction = 0.8
            break
            case "150cc":
                defaultSpeed = 0.25
                defaultFriction = 0.85
            break
            case "200cc":
                defaultSpeed = 0.35
                defaultFriction = 0.85
            break
        }
        switch(helpP){
            case "Geen":
                help = 0
            break
            case "Weinig":
                help = 1
            break;
            case "Normaal":
                help = 2
            break
            case "Veel":
                help = 4
            break
        }
    }
    
    function start(){
        startTime = new Date().getTime()
        racing = true

        posInRace = 0
        startDirInRace = Math.atan2(60 - pos.x, -50 - pos.y) * 180/Math.PI

        socket.on("UpdatePlayers", (naam, x, y, r = 0, trailing = false, i = defaultIFrames, p = 0) => {
            if(racing){
                players[naam].x = x
                players[naam].y = y
                players[naam].r = r
                players[naam].trailing = trailing
                players[naam].iFrames = i
                players[naam].placement = p
            }
        })
    }
    
    function finish(){
        finished = true
        stoppedShownTime = minutes + ":" + seconds + ":" + milliseconds
        lap = "Finish"
        
        socket.emit("Finish", stoppedShownTime, placement)

        //posInRace = 999999
    }

    function restart(){
        players = {}
        lap = 0
        dirLaps = 0
        startTime = new Date().getTime()
        time = new Date()
        stoppedShownTime = false
        boost = 0
        cardir = 0
        finished = false
        finishAnimFrames = 0
        racing = false
        startAnimFrames = 0
        starting = false
        projectiles = []
        item = 0
        itemAmmoLeft = 0
        itemCycleAnimFrame = 0
        posInRace = undefined
        startDirInRace = undefined
        dillaTime = 0
        invisTime = 0
        itemStealTime = 0
        r = 0.5*Math.PI
        results = false
        document.getElementById("menu").style.display = "flex"
        document.getElementById("startgame").style.display = "block"
        document.getElementById("gamealreadystarted").style.display = "none"
    }
    
    //})();
