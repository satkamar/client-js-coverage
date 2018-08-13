const APP_LISTENING_PORT = 8087;
const JSON_MEDIA_TYPE = {'Content-Type':'application/json'};
//const CODECOVERAGE_SERVER = "127.0.0.1";
const CODECOVERAGE_SERVER = "18.191.138.177";
const CODECOVERAGE_PORT = 8083;
const HTTP_STATUS_CODE = {
    SUCCESS: {
        CODE: 200,
        MSG: {'msg': 'Success'}
    },
    CREATED: {
        CODE: 201,
        MSG: {'msg': 'Created'}
    },
    BAD_REQUEST: {
        CODE: 400,
        MSG: {'msg': 'Bad Request'}
    },
    METHOD_NOT_ALLOWED: {
        CODE: 405,
        MSG: {'msg': 'Request method not allowed'}
    },
    CONFLICT: {
        CODE: 409,
        MSG: {'msg': 'The request could not be completed due to a conflict with the current state of the target resource'}
    },
    UNSUPPORTED_MEDIA_TYPE: {
        CODE: 415,
        MSG: {'msg': 'Unsupported media type'}
    },
    EXPECTATION_FAILED: {
        CODE: 417,
        MSG: {'msg': 'Expectation failed'}
    },
    INTERALL_ERROR: {
        CODE: 500,
        MSG: {'msg': 'Internal server error'}
    }
};

const express = require('express');
const request = require('request');
const http = require('http');
const bodyparser = require('body-parser');
const CDP = require('chrome-remote-interface');
var browserClients = {};
var appUtils = new AppUtils();
const app = express();
app.use(bodyparser.json({limit: '500mb', extended: true}))
app.use(bodyparser.urlencoded({limit: '500mb', extended: true}))

function AppUtils(){
    this.sendResponse = function sendResponse(r, s, d){
        r.setHeader("Content-Type", "application/json");
        r.status(s);
        r.json(d);
        r.send();
    };
    
    this.senInternalErorResponse = function senInternalErorResponse(r){
        r.setHeader("Content-Type", "application/json");
        r.status(HTTP_STATUS_CODE.INTERALL_ERROR.CODE);
        r.json(HTTP_STATUS_CODE.INTERALL_ERROR.MSG);
        r.send();
    };
    
    this.convertJsonToString = function convertJsonToString(json){
        return JSON.stringify(json);
    };
    
    this.generateScretKey = function generateScretKey(){
        return Math.random().toString(36).substring(7);
    };
    
    this.GUID = function GUID() {
        return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
    };
};

// To start a profiler on remote system
app.post("/start", function(req, res){
    try {
        CDP((client) => {
            const {Network, Page, Profiler} = client;
            
            //Preserve client information for further operations
            var _id = appUtils.GUID();
            browserClients[_id] = {client: client, url: req.body.hostname} ;

            // enable events then start!
            Promise.all([
                Network.enable(),
                Page.enable(),
                Profiler.enable(),
                Profiler.start(),
                Profiler.startPreciseCoverage(),
                Profiler.takePreciseCoverage(),
            ]).then(() => {
                Page.navigate({url: req.body.hostname});
                appUtils.sendResponse(res, HTTP_STATUS_CODE.SUCCESS.CODE, {"_id": _id});
            }).catch((err) => {
                client.close(); // cannot connect to the remote endpoint -- close connection
                appUtils.sendResponse(res, HTTP_STATUS_CODE.INTERALL_ERROR.CODE, {"msg": "Cannot connect to the remote endpoint"});
            });
        }).on('error', (err) => {
            appUtils.sendResponse(res, HTTP_STATUS_CODE.INTERALL_ERROR.CODE, {"msg": "Cannot connect to the remote endpoint"});
        });    
    } catch(exc) {
        appUtils.sendResponse(res, HTTP_STATUS_CODE.INTERALL_ERROR.CODE,  HTTP_STATUS_CODE.INTERALL_ERROR.MSG);
    }
});

// To stop a profiler as well generate the code coverager report
app.post("/report", function(req, res){
    var reqData = req.body;
    var clientObj = browserClients[reqData._id];
    try {
        if (clientObj && clientObj.client && reqData.emailAddress) {   
            clientObj.client.Profiler.getBestEffortCoverage().then((data) => {
                var postData = JSON.stringify({
                    _id: reqData._id,
                    data: JSON.stringify(data),
                    emailAddress: reqData.emailAddress,
                    url: clientObj.url
                });
                var options = {
                    hostname: CODECOVERAGE_SERVER,
                    port: CODECOVERAGE_PORT,
                    path: '/report',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': postData.length
                    }
                };
              
                var httpReq = http.request(options, (data) => {
                    delete browserClients[reqData._id]; // Delete client object
                });
              
                httpReq.on('error', (e) => {
                    delete browserClients[reqData._id]; // Delete client object
                });
                httpReq.write(postData);
                httpReq.end();
                appUtils.sendResponse(res, HTTP_STATUS_CODE.SUCCESS.CODE, {"msg": "Report will be sent to your mail address"});
            }).catch((err) => {
                clientObj.client.close(); // close connection
                appUtils.senInternalErorResponse(res);
            });
        } else {
            clientObj.client.close(); // close connection
            appUtils.sendResponse(res, HTTP_STATUS_CODE.EXPECTATION_FAILED.CODE,  HTTP_STATUS_CODE.EXPECTATION_FAILED.MSG);
        }
    } catch(exc) {
        clientObj.client.close(); // close connection
        appUtils.senInternalErorResponse(res);
    }
});

// Start server goes here
var server = app.listen(APP_LISTENING_PORT, function(){
     console.log('Listening on port ' + this.address().port);
});