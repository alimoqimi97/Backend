const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const Ghost = require("./ghost");

const app = express();
app.use(cors());

let loggedInUsers = new Set();
let activeBots = new Map();


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ali@real@sharif@2223"
});

connection.connect((err) => {
    if(err){
        throw err;
    }
    console.log("connected to mysql");
});

connection.query("CREATE DATABASE IF NOT EXISTS ghost;",(er,results) => {
    if(er){
        throw er;
    }
    console.log("ghost database created.");
})

connection.query("USE ghost;",(err,results) => {
    if(err){
        throw err;
    }
    console.log("we are using 'ghost' database");

});

connection.query("CREATE TABLE IF NOT EXISTS Users ( Username varchar(20) , Password varchar(10) );",(err,results) => {
    if(err){
        consoel.log(err.message);
    }
    console.log("Table 'Users' created.");
});


app.get("/",(req,res) => {
    console.log("a new user is visiting website");
});


//              checks if user exists in out 'Users' database(is our user.).           //
app.get("/unique-username",(req,res) => {
    
    //          request: 'localhost:3000/unique-username?username=...&password=....'         //
    const {username , password} = req.query;
    // let registeredBefore = false;

        //              checking that user has been registered before or no ?           //
        connection.query("SELECT COUNT(Username) as founds FROM Users WHERE (Username = '" + username + ");", (err,results,fields) => {
            if(err){
                throw err;
            }
    
            debugger;
    
            let exists = results[0].founds;
        
            if(exists > 0){
                console.log("this user has been registered before.");
                res.send({exists: true});
            }
            else{
                console.log("this user didn't register before. ;)");
                res.send({exists: false});
            }
        });
});


app.get("/exists",(req,res) => {

    const {username , password} = req.query;

    connection.query("SELECT COUNT(*) as founds from Users where ( Username = '" + username + "' and Password = '" + password + "');",(err,results) => {

        let founds = results[0].founds;

    });

});


app.get("/signup", (req,res) => {

    //      request = 'localhost:3000/signup?username=...&password=...'     //
    const {username , password} = req.query;

    //              registration operation          //
    connection.query("INSERT INTO Users VALUES ('" + username + "' , '" + password + "' );",(err,results) => {
        if(err){
            throw err;
        }
    
        console.log("new User registered successfully.");
        res.send({registered: true});
    });

    //          creating insta Account table for new user           //
    connection.query("CREATE TABLE IF NOT EXISTS " + username + " (instaUser varchar(20) , instaPass varchar(20) , Id int );",(err,results) => {
        if(err){
            throw err;
        }
        console.log("instaUser Table created.");
    });

});



//          check that userInstagramAccount has been created before or no        //
app.get("/insta-exists",(req,res) => {

    //      request: 'localhost:3000/insta-exists?instau=...&username=...'       //
    const {instau , username} = req.query;

    connection.query("SELECT COUNT(instaUser) as founds FROM " + username + " WHERE instaUser = '" + instau + "';",(err,results) => {

        if(err){
            throw err;
        }

        let count = results[0].founds;

        if(count > 0){
            console.log("this insta account has been created before in your collection.");
            res.send({createdBefore: true});
        }
        else{
            console.log("this insta accound is new.");
            res.send({createdBefore: false});
        }
    });
});



//          adding insta account for a user         //
app.get("/add-insta-account",(req,res) => {

    //      requsest: 'localhost:3000/add-insta-account?instau=...&instap=...&username=...'     //
    const {instau , instap , username } = req.query;

    //          insert account in instaTable for user           //
    connection.query("select count(Id) as founds from " + username + ";",(err,results) => {
        
        if(err){
            throw err;
        }

        let id = results[0].founds;

        //          testing                 //
        console.log("testing -> id = " + id);
        //          ------                  //


        connection.query("INSERT INTO " + username + " VALUES ( '" + instau + "' , ' " + instap + "' , " + id + ");",(err) => {
            if(err){
                // console.error(err);
                throw err;
                res.send({added: false});
            }

            console.log("New instagram account added.");
            res.send({added: true});
        });

    });
});

//              user login(before this level; we must check user existence with /exists request.).            //
app.get("/login",(req,res) => {

    //          request: 'localhost:3000/login?username=...'            //
    const {username} = req.query;

    loggedInUsers.add(username);

    res.send({
            username: username,
            loggedIn: loggedInUsers.has(username)
    });
});

//          logout              //
app.get("/logout",(req,res) => {

    const {username} = req.query;

    loggedInUsers.delete(username);

    res.send({
        username: username,
        loggedOut: !loggedInUsers.has(username)
    });
});


//          starting bots of a user         //
app.get("/login/start-bots",(req,res) => {

    //          request: 'localhost:3000/login/start-bots?id=01234...&hashtag=...&pgcount=12&username=...'         //
    const {id , hashtag , pgcount , username} = req.query;
    let Ids = Array.from(id);
    let instaBots = [];

    // Ids = Ids.map((element) => {
    //     return parseInt(element);
    // });

    let condition = Ids.map((elem,index) => {

        if(index == Ids.length - 1){
            return "Id = " + elem;
        }
        return "Id = " + elem + " or";
    });


    connection.query("SELECT instaUser , instaPass FROM " + username + " WHERE " + condition.join(" ") + ";",(err,results) => {

        let tmpItr;

        //              testing             //
        res.json({data: results});
        //              -------             //

        let initialInfo;

        for(let i = 0 ; i < Ids.length ; i++)
        {
            initialInfo = {
                userName: results[i].instaUser,
                Password: results[i].instaPass,
                hashTag: "#" + hashtag,
                pageCount: pgcount,
                Comment: "@tourist_experience"
            }

            activeBots.set({
                userName: username,
                index: Ids[i]
            },new Ghost(initialInfo,true));
        }

        tmpItr = activeBots.values();

        for(let j = 0 ; j < activeBots.size ; j++){

            tmpItr.next().value.makeAliveMe();
        }

    });
});

app.listen(3000,() => {
    console.log("app listen on port 3000");
});


