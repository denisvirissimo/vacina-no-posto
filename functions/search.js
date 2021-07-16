const axios = require('axios');
require('dotenv').config();

exports.handler = function(event, context, callback) {

    const { API_URL, API_USER, API_PASSWORD} = process.env;
    var diaAtual = new Date().setUTCHours(0,0,0,0);
    // var diaAtual = new Date(2021,6,15).setUTCHours(0,0,0,0);

    // Send
    const send = body => {
        callback(null, {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
                'Access-Control-Allow-Methods': 'GET, POST'
            },
            body: JSON.stringify(body)
        });
    }

    // Call API
    const search = () => {
        const { codigoUBS } = JSON.parse(event.body);

        axios.post(API_URL, {
            size: 50,
            sort : [
                { "@timestamp" : "desc" }
            ],
            query: {
                bool: {
                    must: [
                        {
                            term: {
                                estabelecimento_valor: codigoUBS
                            }
                        },
                        {
                            term: {
                                vacina_dataAplicacao: new Date(diaAtual).toISOString()
                            }
                        }
                    ]
                }
            },
            fields : [
                "@timestamp",
                "vacina_fabricante_nome" 
            ],
            _source: false,
        },
        {
            auth: {
                username: API_USER,
                password: API_PASSWORD
            }
        })
        .then(res => send(res.data))
        .catch(err => send(err));
    }

    if (event.httpMethod == 'POST'){
        search();
    } else {
        callback(null, {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
                'Access-Control-Allow-Methods': 'GET, POST'
            },
            body: JSON.stringify('Method not allowed')
        });
    }
}