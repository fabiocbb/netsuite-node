var request = require("request");
var crypto = require('crypto');
var randomstring = require('randomstring');

var credentials =  {
    "email": "your@email.com",
    "password": "yourpassword",
    "account": 'netsuite_account_id',
    "applicationId": 'netsuite_application_id',
    "role": 'role_id',
    "consumerKey": 'app_consumer_key',
    "consumerSecret": 'app_consumer_secret',
    "token": 'app_consumer_token',
    "tokenSecret": 'app_token_secret'
};

var tokenAuthentication = true;

var header = netsuiteSetHeaderSoapRequest(tokenAuthentication);

//Get currencies
//netsuiteGetCurrencies(header);

//Get accounts
//netsuiteGetAccounts(header);

//Get contacts
//var getContactsCreatedFromDate = "2018-05-01T00:00:000.000-10:00";
//netsuiteGetContacts(header, getContactsCreatedFromDate);

//Get invoices
//var getInvoicesCreatedFromDate = "2018-05-01T00:00:000.000-10:00";
//netsuiteGetInvoices(header, getInvoicesCreatedFromDate);

//post payment
var payment = { contactId: "15", invoiceId: "9", bankAccountId: "145", paymentAmount: "50",
                accountReceivable: "7", currencyId: "5", externalId: "payment_id", exchangeRate: "1"};
netsuitePostPayment(header, payment);


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
function netsuiteGetAccounts(header){
    var body = "<soapenv:Envelope\
                    xmlns:xsd='http://www.w3.org/2001/XMLSchema'\
                    xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'\
                    xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/'\
                    xmlns:platformCore='urn:core_2017_2.platform.webservices.netsuite.com'\
                    xmlns:platformCommon='urn:common_2017_2.platform.webservices.netsuite.com'\
                    xmlns:platformMsgs='urn:messages_2017_2.platform.webservices.netsuite.com'>\
                    "+header+"\
                    <soapenv:Body>\
                        <platformMsgs:search xmlns='urn:messages_2017_2.platform.webservices.netsuite.com'>\
                            <platformMsgs:searchRecord xsi:type='platformCommon:AccountSearchBasic'>\
                                <platformCommon:type operator='anyOf'>\
                                    <platformCore:searchValue>_bank</platformCore:searchValue>\
                                    <platformCore:searchValue>_costOfGoodsSold</platformCore:searchValue>\
                                    <platformCore:searchValue>_creditCard</platformCore:searchValue>\
                                    <platformCore:searchValue>_equity</platformCore:searchValue>\
                                    <platformCore:searchValue>_expense</platformCore:searchValue>\
                                    <platformCore:searchValue>_fixedAsset</platformCore:searchValue>\
                                    <platformCore:searchValue>_income</platformCore:searchValue>\
                                    <platformCore:searchValue>_longTermLiability</platformCore:searchValue>\
                                    <platformCore:searchValue>_otherAsset</platformCore:searchValue>\
                                    <platformCore:searchValue>_otherCurrentAsset</platformCore:searchValue>\
                                    <platformCore:searchValue>_otherCurrentLiability</platformCore:searchValue>\
                                    <platformCore:searchValue>_otherExpense</platformCore:searchValue>\
                                    <platformCore:searchValue>_otherIncome</platformCore:searchValue>\
                                </platformCommon:type>\
                            </platformMsgs:searchRecord>\
                        </platformMsgs:search>\
                    </soapenv:Body>\
                </soapenv:Envelope>";

    var options = netsuiteSetoptions('search', body);
    request(options, function (error, response, body) {
        console.log(body)
    });
}
function netsuiteGetContacts(header, dateFrom){
    var body = "<soapenv:Envelope\
                    xmlns:xsd='http://www.w3.org/2001/XMLSchema'\
                    xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'\
                    xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/'\
                    xmlns:platformCore='urn:core_2017_2.platform.webservices.netsuite.com'\
                    xmlns:platformCommon='urn:common_2017_2.platform.webservices.netsuite.com'\
                    xmlns:platformMsgs='urn:messages_2017_2.platform.webservices.netsuite.com'>\
                    "+header+"\
                    <soapenv:Body>\
                        <platformMsgs:search xmlns='urn:messages_2017_2.platform.webservices.netsuite.com'>\
                            <platformMsgs:searchRecord xsi:type='platformCommon:CustomerSearchBasic'>\
                                <platformCommon:lastModifiedDate operator='onOrAfter' xsi:type='platformCore:SearchDateField'>\
                                    <platformCore:searchValue>"+dateFrom+"</platformCore:searchValue>\
                                </platformCommon:lastModifiedDate>\
                            </platformMsgs:searchRecord>\
                        </platformMsgs:search>\
                    </soapenv:Body>\
                </soapenv:Envelope>";
    var options = netsuiteSetoptions('search', body);
    request(options, function (error, response, body) {
        console.log(body)
    });
}
function netsuiteGetInvoices(header, dateFrom){
    var body = "<soapenv:Envelope\
                    xmlns:xsd='http://www.w3.org/2001/XMLSchema'\
                    xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'\
                    xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/'\
                    xmlns:platformCore='urn:core_2017_2.platform.webservices.netsuite.com'\
                    xmlns:platformCommon='urn:common_2017_2.platform.webservices.netsuite.com'\
                    xmlns:platformMsgs='urn:messages_2017_2.platform.webservices.netsuite.com'>\
                    "+header+"\
                    <soapenv:Body>\
                        <platformMsgs:search xmlns='urn:messages_2017_2.platform.webservices.netsuite.com'>\
                            <platformMsgs:searchRecord xsi:type='platformCommon:TransactionSearchBasic'>\
                                <platformCommon:lastModifiedDate operator='onOrAfter' xsi:type='platformCore:SearchDateField'>\
                                    <platformCore:searchValue>"+dateFrom+"</platformCore:searchValue>\
                                </platformCommon:lastModifiedDate>\
                                <platformCommon:type operator='anyOf'>\
                                    <platformCore:searchValue>_invoice</platformCore:searchValue>\
                                    <platformCore:searchValue>_creditMemo</platformCore:searchValue>\
                                </platformCommon:type>\
                            </platformMsgs:searchRecord>\
                        </platformMsgs:search>\
                    </soapenv:Body>\
                </soapenv:Envelope>";

    var options = netsuiteSetoptions('search', body);
    request(options, function (error, response, body) {
        console.log(body)
    });
}
function netsuitePostPayment(header, payment){

    var body = "<soapenv:Envelope\
                    xmlns:xsd='http://www.w3.org/2001/XMLSchema'\
                    xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'\
                    xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/'\
                    xmlns:platformCore='urn:customers_2017_2.transactions.webservices.netsuite.com'\
                    xmlns:platformMsgs='urn:messages_2017_2.platform.webservices.netsuite.com'\
                    xmlns:listRel='urn:customers_2017_2.transactions.webservices.netsuite.com'>\
                    "+header+"\
                    <soapenv:Body>\
                        <upsert xsi:type='platformMsgs:upsertRequest'>\
                            <record xsi:type='listRel:CustomerPayment' externalId='"+payment.externalId+"'>\
                                <customer xsi:type='platformCore:RecordRef' internalId='"+payment.contactId+"'></customer>\
                                <account xsi:type='platformCore:RecordRef' internalId='"+payment.bankAccountId+"'></account>\
                                <arAcct xsi:type='platformCore:RecordRef'>"+payment.accountReceivable+"</arAcct>\
                                <applyList replaceAll='false'>\
                                    <apply apply='true' doc='"+payment.invoiceId+"'></apply>\
                                </applyList>\
                                <undepFunds xsi:type='xsd:boolean'>false</undepFunds>\
                                <currency xsi:type='platformCore:RecordRef'>"+payment.currencyId+"</currency>\
                                <exchangeRate xsi:type='xsd:double'>"+payment.exchangeRate+"</exchangeRate>\
                                <payment xsi:type='xsd:double'>"+payment.paymentAmount+"</payment>\
                            </record>\
                        </upsert>\
                    </soapenv:Body>\
                </soapenv:Envelope>";
    var options = netsuiteSetoptions('upsert', body);
    request(options, function (error, response, body) {
        console.log(body)
    });
}