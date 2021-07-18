var listUF = [];
var listMunicipio = [];
var listUnidade = [];
var singleXhrRemove;
var singleXhrRemove2;
var singleXhrRemove3;

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
    body: JSON.stringify({ 'codigoUBS': singleXhrRemove3.getValue(true) })
  });

  return response.json();
}

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
        defaultOption.value = 0;

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
    row.fields.vacina_fabricante_nome[0] = row.fields.vacina_fabricante_nome[0].split('/')[0];
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
    divCardBodyImg.src = 'img/'.concat(vacina.key.split('/')[0].toLowerCase().concat('.png'));
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

const limparDropDown = (dropdown, unidade) => {

  dropdown.length = 0;

  defaultOption = document.createElement('option');
  defaultOption.text = !unidade ? 'Escolha uma unidade...' : 'Escolha um município...';
  defaultOption.value = 0;

  dropdown.add(defaultOption);
  dropdown.selectedIndex = 0;


  if (unidade) {
    dropdown = document.getElementById('unidade');
    dropdown.length = 0;

    let defaultOption = document.createElement('option');
    defaultOption.text = 'Escolha uma unidade...';
    defaultOption.value = 0;

    dropdown.add(defaultOption);
    dropdown.selectedIndex = 0;

    dropdown.disabled = true;
  }
}

document.addEventListener('click', function (event) {

  if (!event.target.matches('.btn')) return;
  event.preventDefault();

  fetchData()
    .then(data => {

      if (data.hits.total.value == 0) {
        document.getElementById('noResult').classList.remove('d-none');
        var vacinaList = document.querySelector('#vacinas');
        vacinaList.querySelectorAll('*').forEach(n => n.remove());
      }
      else {
        document.getElementById('noResult').classList.add('d-none');

        var vacinasAgrupadas = agruparVacinas(data);
        exibirAplicacoes(vacinasAgrupadas);
      }

      document.querySelector('#vacinas').scrollIntoView();
    })
    .catch(err => console.log(err));

}, false);

document.querySelector('#estado').addEventListener('change', (event) => {

  let dropdown = document.getElementById('municipio');
  limparDropDown(dropdown, true);

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

  dropdown.disabled = Number(event.target.value) === 0 ? true : false;
});

document.querySelector('#municipio').addEventListener('change', (event) => {

  let dropdown = document.getElementById('unidade');
  limparDropDown(dropdown, false);

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

  dropdown.disabled = Number(event.target.value) === 0 ? true : false;
});

document.addEventListener('DOMContentLoaded', function () {
  initJson();

  singleXhrRemove = new Choices('#choices-single-remote-fetch', {
    placeholder: true,
    searchPlaceholderValue: "Pesquisar estado",
    searchResultLimit: 2,
    loadingText: 'Carregando...',
    noResultsText: 'Nenhum estado encontrado',
    noChoicesText: 'Nenhuma opção disponível',
    itemSelectText: 'Selecionar',
  });

  singleXhrRemove2 = new Choices('#choices-single-remote-fetch2', {
    placeholder: true,
    searchPlaceholderValue: "Pesquisar município",
    searchResultLimit: 3,
    loadingText: 'Carregando...',
    noResultsText: 'Nenhum município encontrado',
    noChoicesText: 'Nenhuma opção disponível',
    itemSelectText: 'Selecionar',
  });

  singleXhrRemove3 = new Choices('#choices-single-remote-fetch3', {
    placeholder: true,
    searchPlaceholderValue: "Pesquisar unidade",
    searchResultLimit: 5,
    loadingText: 'Carregando...',
    noResultsText: 'Nenhuma unidade encontrado',
    noChoicesText: 'Nenhuma opção disponível',
    itemSelectText: 'Selecionar',
  });

  singleXhrRemove2.disable();
  singleXhrRemove3.disable();

  singleXhrRemove.setChoices(function () {
    return fetch(
      '/data/uf.json'
    )
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        return data.ufs.map(function (uf) {
          return { label: uf.Nome, value: uf.Codigo };
        });
      });
  });

  singleXhrRemove.passedElement.element.addEventListener('change', function (e) {

    const municipiosFiltrados = listMunicipio.municipios.filter(function (a) {
      return a.CodigoUF === Number(e.detail.value);
    });

    var newOptions = [];
    newOptions.push(singleXhrRemove2.config.choices.find(choice => choice.placeholder));
    singleXhrRemove2.setChoices(newOptions, 'value', 'label', true)
      .setChoiceByValue('');

    singleXhrRemove2.setChoices(function () {
      return municipiosFiltrados.map(function (municipio) {
        return { label: municipio.Nome, value: municipio.Codigo };
      });
    }, 'value', 'label', false);

    singleXhrRemove2.enable();
    singleXhrRemove2.showDropdown(false);

    var newOptions = [];
    newOptions.push(singleXhrRemove3.config.choices.find(choice => choice.placeholder));
    singleXhrRemove3.setChoices(newOptions, 'value', 'label', true)
      .setChoiceByValue('');

    singleXhrRemove3.disable();
  });

  singleXhrRemove2.passedElement.element.addEventListener('change', function (e) {

    const unidadesFiltradas = listUnidade.unidades.filter(function (a) {
      return a.CodigoMunicipio === Number(e.target.value);
    });

    var newOptions = [];
    newOptions.push(singleXhrRemove3.config.choices.find(choice => choice.placeholder));
    singleXhrRemove3.setChoices(newOptions, 'value', 'label', true)
      .setChoiceByValue('');

    singleXhrRemove3.setChoices(function () {
      return unidadesFiltradas.map(function (municipio) {
        return { label: municipio.Nome, value: municipio.CodigoCNES };
      });
    }, 'value', 'label', false);

    singleXhrRemove3.enable();
    singleXhrRemove3.showDropdown(false);
  });
});