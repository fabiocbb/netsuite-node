var request = require("request");
var crypto = require('crypto');
var randomstring = require('randomstring');

var credentials =  {
    "email": "your@email.com",
    "password": "yourpassword",
    "account": 'netsuite_account_id',
    "applicationId": 'netsuite_application_id',
    "role": 3,
    "consumerKey": 'app_consumer_key',
    "consumerSecret": 'app_consumer_secret',
    "token": 'app_consumer_token',
    "tokenSecret": 'app_token_secret'
};

var tokenAuthentication = true;

var header = netsuiteSetHeaderSoapRequest(tokenAuthentication);

//Get currencies
netsuiteGetCurrencies(header);



function netsuiteSetHeaderSoapRequest(tokenAuthentication){

    if (tokenAuthentication){
        var nonce = randomstring.generate({length: 16, charset: 'alphanumeric'});
        var key = credentials.consumerSecret+"&"+credentials.tokenSecret;
        var timeStamp = Math.round((new Date()).getTime() / 1000);
        var baseString = credentials.account+"&"+credentials.consumerKey+"&"+credentials.token+"&"+nonce+"&"+timeStamp;
        var base64hash = crypto.createHmac('sha256', Buffer.from(key, 'utf8')).update(baseString).digest().toString('base64');
        header = '<soapenv:Header>\
                    <tokenPassport>\
                        <account>'+credentials.account+'</account>\
                        <consumerKey>'+credentials.consumerKey+'</consumerKey>\
                        <token>'+credentials.token+'</token>\
                        <nonce>'+nonce+'</nonce>\
                        <timestamp>'+timeStamp+'</timestamp>\
                        <signature algorithm="HMAC_SHA256">'+base64hash+'</signature>\
                    </tokenPassport>\
                    <platformMsgs:preferences>\
                        <platformMsgs:bodyFieldsOnly>false</platformMsgs:bodyFieldsOnly>\
                    </platformMsgs:preferences>\
                </soapenv:Header>';
    } else {
        header = "<soapenv:Header>\
                    <passport xsi:type='platformCore:Passport'>\
                        <email xsi:type='xsd:string'>"+credentials.email+"</email>\
                        <password xsi:type='xsd:string'>"+credentials.password+"</password>\
                        <account xsi:type='xsd:string'>"+credentials.account+"</account>\
                    </passport>\
                    <applicationInfo xsi:type='platformMsgs:ApplicationInfo'>\
                        <applicationId xsi:type='xsd:string'>"+credentials.applicationId+"</applicationId>\
                    </applicationInfo>\
                </soapenv:Header>";
                //maybe add role inside passport element
                //<role internalId="+credentials.role+"></role>
    }
    return header;
}
function netsuiteSetoptions(type, body){
    return options = {
                        method: 'POST',
                        url: 'https://webservices.netsuite.com/services/NetSuitePort_2017_2',
                        headers: {
                            soapaction: type,
                            'content-type': 'text/xml'
                        },
                        body: body
                    };
}
function netsuiteGetCurrencies(header){
    var body = "<soapenv:Envelope\
                    xmlns:xsd='http://www.w3.org/2001/XMLSchema'\
                    xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'\
                    xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/'\
                    xmlns:platformCore='urn:core_2017_2.platform.webservices.netsuite.com'\
                    xmlns:platformCommon='urn:common_2017_2.platform.webservices.netsuite.com'\
                    xmlns:platformMsgs='urn:messages_2017_2.platform.webservices.netsuite.com'>\
                    "+header+"\
                    <soapenv:Body>\
                        <platformMsgs:getAll xmlns='urn:messages_2017_2.platform.webservices.netsuite.com'>\
                            <platformMsgs:record recordType='currency'/>\
                        </platformMsgs:getAll>\
                    </soapenv:Body>\
                </soapenv:Envelope>";
    var options = netsuiteSetoptions('getAll', body);
    request(options, function (error, response, body) {
        console.log(body)
    });
}
