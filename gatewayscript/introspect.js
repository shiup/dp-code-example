// use the urlopen module
let urlopen = require ('urlopen');
let hm = require('header-metadata');

let azheader = (hm.current.get('authorization') || '').split(" ");
if (azheader.length !== 2 || azheader[0] !== 'Bearer') {
    hm.response.statusCode = 401;
    session.output.write('');
    // session.reject("no authorization header provided");
}

let data = 'client_id=TestClient&client_secret=ug8vnUUqisGArfYuVqX9&token=' + azheader[1];

// define the urlopen options
var options = {
    target: 'https://spoon.io/oauth/oauth20/introspect',,
    sslClientProfile: 'trust-all-1',
    method: 'post',
    contentType: 'application/x-www-form-urlencoded',
    accept: 'application/json',
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
        if (response.statusCode == 200) {
            // DP readAsJSON does not deal with charset well
            if (response.headers['Content-Type'].startsWith('application/json')) {
                response.readAsBuffer(function(error, responseData) {
                    if (error) {
                        // error while reading response or transferring data to Buffer
                        console.error("readAsBuffer error: " + JSON.stringify(error));
                        hm.response.statusCode = 401;
                        session.output.write('');                  
                        // session.reject("non JSON payload return by introspect endpoint");
                    } else {
                        let respD = JSON.parse((responseData || '').toString());
                        if (respD.active !== true) {
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
                console.error('unknown contenttype');
                hm.response.statusCode = 401;
                session.output.write('');
            }
        } else {
            hm.response.statusCode = 401;
            session.output.write('');
            // session.reject("non 200 return");
        }
    }
}); 
