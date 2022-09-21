// use the urlopen module
let urlopen = require ('urlopen');
let hm = require('header-metadata');

let azheader = (hm.current.get('authorization') || '').split(" ");
if (azheader.length !== 2) {
    hm.response.statusCode = 401;
    session.output.write('');
    // session.reject("no authorization header provided");
}

let data = 'token_type_hint=access_token&token=' + azheader[1];

// define the urlopen options
var options = {
    // update target to your oauth provider introspect endpoint
    target: 'https://<>/introspect',
    // defined a TLSClientProfile in DP to trust everyone for demo
    sslClientProfile: 'trust-all',
    method: 'post',
    contentType: 'application/x-www-form-urlencoded',
    timeout: 60,
    data: data,
};

// open connection to target and send data over
urlopen.open (options, function (error, response) {
    if (error) {
        // an error occurred during request sending or response header parsing
        console.error("urlopen connect error: " + JSON.stringify(error));
        hm.response.statusCode = 401;
        session.output.write('');
        // session.reject('error in reaching endpoint');
    } else {
        // read response data
        // get the response status code
        var responseStatusCode = response.statusCode;

        if (responseStatusCode == 200) {
            response.readAsJSON(function(error, responseData) {
                if (error) {
                    // error while reading response or transferring data to Buffer
                    console.error("readAsBuffer error: " + JSON.stringify(error));
                    hm.response.statusCode = 401;
                    session.output.write('');                  
                    // session.reject("non JSON payload return by introspect endpoint");
                } else {
                    if (responseData.active !== true) {
                        hm.response.statusCode = 401;
                        session.output.write('');
                        // session.reject("token is not valid");
                    } else {
                        hm.response.statusCode = 200;
                        session.accept();
                    }
                } 
            });
        } else {
            hm.response.statusCode = 401;
            session.output.write('');
            // session.reject("non 200 return");
        }
    }
}); // end of urlopen.open()
