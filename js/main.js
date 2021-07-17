var listUF = [];
var listMunicipio = [];
var listUnidade = [];

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
    body: JSON.stringify({ 'codigoUBS': document.querySelector('#unidade').value })
  });

  return response.json();
}

fetch('/data/unidade.json')
  .then(response => response.json())
  .then(data => {
    // console.log(data)

    const teste = data.unidades.filter(function (a) {
      return a.CodigoMunicipio === 355030;
    });

    // console.log(teste);
  });

const initJson = async () => {
  let [] = await Promise.all([
    fetch('/data/unidade.json')
      .then(response => response.json())
      .then(data => listUnidade = data),

    fetch('/data/municipio.json')
      .then(response => response.json())
      .then(data => listMunicipio = data),

    fetch('/data/uf.json')
      .then(response => response.json())
      .then(data => {
        listUF = data

        let dropdown = document.getElementById('estado');
        dropdown.length = 0;

        let defaultOption = document.createElement('option');
        defaultOption.text = 'Escolha um estado...';

        dropdown.add(defaultOption);
        dropdown.selectedIndex = 0;
        let option;

        for (let i = 0; i < listUF.ufs.length; i++) {
          option = document.createElement('option');
          option.text = listUF.ufs[i].Nome;
          option.value = listUF.ufs[i].Codigo;
          dropdown.add(option);
        }
      }),
  ]);
}

const agruparVacinas = (data) => {
  var vacinasAplicadas = data.hits.hits.reduce(function (r, row) {
    r[row.fields.vacina_fabricante_nome] = ++r[row.fields.vacina_fabricante_nome] || 1;
    return r;
  }, {});

  var vacinasAgrupadas = Object.keys(vacinasAplicadas).map(function (key) {
    return { key: key, value: vacinasAplicadas[key] };
  });

  return vacinasAgrupadas;
}

const exibirAplicacoes = (listVacinas) => {
  var vacinaList = document.querySelector('#vacinas');
  vacinaList.querySelectorAll('*').forEach(n => n.remove());
  vacinaList.className = 'row g-4 '.concat('row-cols-' + listVacinas.length).concat(' row-cols-md-' + listVacinas.length);

  listVacinas.forEach(vacina => {
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
}

document.addEventListener('click', function (event) {

  if (!event.target.matches('.btn')) return;

  event.preventDefault();

  fetchData()
    .then(data => {

      var vacinasAgrupadas = agruparVacinas(data);
      exibirAplicacoes(vacinasAgrupadas);

      document.querySelector('#vacinas').scrollIntoView();
    })
    .catch(err => console.log(err));

}, false);

document.querySelector('#estado').addEventListener('change', (event) => {

  let dropdown = document.getElementById('unidade');
  dropdown.length = 0;

  let defaultOption = document.createElement('option');
  defaultOption.text = 'Escolha uma unidade...';
  defaultOption.value = 0;

  dropdown.add(defaultOption);
  dropdown.selectedIndex = 0;
  
  dropdown = document.getElementById('municipio');
  dropdown.length = 0;

  defaultOption = document.createElement('option');
  defaultOption.text = 'Escolha um município...';
  defaultOption.value = 0;

  dropdown.add(defaultOption);
  dropdown.selectedIndex = 0;

  let option;

  const municipiosFiltrados = listMunicipio.municipios.filter(function (a) {
    return a.CodigoUF === Number(event.target.value);
  });

  for (let i = 0; i < municipiosFiltrados.length; i++) {
    option = document.createElement('option');
    option.text = municipiosFiltrados[i].Nome;
    option.value = municipiosFiltrados[i].Codigo;
    dropdown.add(option);
  }
});

document.querySelector('#municipio').addEventListener('change', (event) => {

  let dropdown = document.getElementById('unidade');
  dropdown.length = 0;

  let defaultOption = document.createElement('option');
  defaultOption.text = 'Escolha uma unidade...';
  defaultOption.value = 0;

  dropdown.add(defaultOption);
  dropdown.selectedIndex = 0;
  let option;

  const unidadesFiltradas = listUnidade.unidades.filter(function (a) {
    return a.CodigoMunicipio === Number(event.target.value);
  });

  for (let i = 0; i < unidadesFiltradas.length; i++) {
    option = document.createElement('option');
    option.text = unidadesFiltradas[i].Nome;
    option.value = unidadesFiltradas[i].CodigoCNES;
    dropdown.add(option);
  }
});

initJson();
