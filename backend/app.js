"use strict";
const axios = require("axios");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


const _ = require("lodash");
const bodyParser = require("body-parser");
const express = require("express");

const app = express();
const cors = require('cors');
const colors = require("colors/safe");

const whiteList = ['http://0.0.0.0:3002'];
const axiosConfig = {
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':'GET'
    }
};
function makeMessage(text) {
    return `${colors.blue("[store]")} ${text}`;
  }
  
  function log(text) {
    console.log(makeMessage(text));
  }

var corsOptions = {
    origin: function (origin, callback) {
        if (whiteList.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed Cors'));
        }
    },
    optionsSuccessStatus: 200
};

const port = process.env.port || 8888;
function serve() {
    app.use(cors(corsOptions));
    app.options('*', cors());
    app.use(express.json());


    app.post("/", (request, response) => {
        log("in get");
        log(request.headers.origin);

        //let url = `http://mvp.momenta.works/config/map/map_lists.json`;
        console.dir(request.body.target);
        let url = request.body.target;
        axios.get(url, axiosConfig)
            .then(res => {
                //response.json(res.data);
                response.send(res.data);
        }).catch(err=>{
            response.send(err);
        });

        // const xhr = new XMLHttpRequest();
        // xhr.open('GET', url, true);
        
        // xhr.onreadystatechange = function() {
        //     if (this.readyState == 4 && this.status == 200) {
        //         var myArr = JSON.parse(this.responseText);
        //         console.log(myArr);
        //     }
        //     console.log(this.readyState);
        //     console.log(this.status);
        // };

        // xhr.send();
        

    });

    

    app.listen(port, () => {
        log(`running at http://localhost:${port}`);
    });
}

serve();
