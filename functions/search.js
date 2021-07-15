const axios = require('axios');
require('dotenv').config();

exports.handler = function(event, context, callback) {
    /*const { name } = JSON.parse(event.body);
    
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({ message: 'Hello teste' })
    });*/

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
            size: 1,
            query: {
                bool: {
                    must: [
                        {
                            term: {
                                estabelecimento_valor: '2788330'
                            }
                        },
                        {
                            term: {
                                vacina_dataAplicacao: '2021-07-15T00:00:00.000Z'
                            }
                        }
                    ]
                }
            }
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