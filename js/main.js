const fetchData = async () => {
  var url = 'http://localhost:9000/search';
  // var url = '/.netlify/functions/search';
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({ 'codigoUBS': '2788330' })
  });

  return response.json();
}

fetchData().then(data => {
  var occurences = data.hits.hits.reduce(function (r, row) {
    r[row.fields.vacina_fabricante_nome] = ++r[row.fields.vacina_fabricante_nome] || 1;
    return r;
  }, {});

  var result = Object.keys(occurences).map(function (key) {
    return { key: key, value: occurences[key] };
  });

  var vacinaList = document.querySelector('#vacinas');
  vacinaList.className = 'row g-4 '.concat('row-cols-' + result.length).concat(' row-cols-md-' + result.length);

  result.forEach(vacina => {
    const divCol = document.createElement('div');
    divCol.className = 'col';

    const divCard = document.createElement('div');
    divCard.className = 'card text-center h-100';

    const divCardHeader = document.createElement('div');
    divCardHeader.className = 'card-header';
    divCardHeader.appendChild(document.createTextNode(vacina.key));
    divCard.appendChild(divCardHeader);

    const divCardBody = document.createElement('div');
    divCardBody.className = 'card-body';
    const divCardBodyImg = document.createElement('img');
    divCardBodyImg.src = 'img/'.concat(vacina.key.replace('/', '').toLowerCase().concat('.png'));
    divCardBodyImg.width = '80';
    divCardBody.appendChild(divCardBodyImg);
    divCard.appendChild(divCardBody);

    const divCardFooter = document.createElement('div');
    divCardFooter.className = 'card-footer';
    divCardFooter.appendChild(document.createTextNode(vacina.value + ' dose(s)'));
    divCard.appendChild(divCardFooter);

    divCol.appendChild(divCard);
    vacinaList.appendChild(divCol);
  });

  console.log(result);
});