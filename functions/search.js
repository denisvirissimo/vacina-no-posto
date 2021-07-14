const axios = require('axios');

exports.handler = function(event, context, callback) {
    /*const { name } = JSON.parse(event.body);
    
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({ message: 'Hello teste' })
    });*/

    // const API_URL = 'https://imunizacao-es.saude.gov.br/_search';
    // const API_USER = 'imunizacao_public';
    // const API_PASSWORD = 'qlto5t&7r_@+#Tlstigi';

    const { API_URL, API_USER, API_PASSWORD} = process.env;

    // Send
    const send = body => {
        callback(null, {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
            },
            body: JSON.stringify(body)
        });
    }

    // Call API
    const search = () => {
        axios.post(API_URL, {
            size: 1
        }, {
            auth: {
                username: API_USER,
                password: API_PASSWORD
            }
        })
        .then(res => send(res.data))
        .catch(err => send(err));
    }

    if (event.httpMethod == 'GET'){
        search();
    }
}