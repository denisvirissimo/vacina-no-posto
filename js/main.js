var listUF = [];
var listMunicipio = [];
var listUnidade = [];
var dicionarioVacinas = {};
var ddlEstado;
var ddlMunicipio;
var ddlUnidade;

const fetchData = async () => {
    // var url = 'http://localhost:9000/search';
    var url = '/.netlify/functions/search';
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({ 'codigoUBS': ddlUnidade.getValue(true) })
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

        fetch('/data/vacina.json')
            .then(response => response.json())
            .then(data => data.vacinas.forEach(v => dicionarioVacinas[v.chave] = v.valor))
    ]);
}

const agruparVacinas = (data) => {
    var vacinasAplicadas = data.hits.hits.reduce(function (r, row) {
        r[dicionarioVacinas[row.fields.vacina_fabricante_nome]] = ++r[dicionarioVacinas[row.fields.vacina_fabricante_nome]] || 1;
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
        divCardBodyImg.src = 'img/'.concat(vacina.key.concat('.png'));
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

const changeDropdown = (dropdown, choices, value, label) => {
    reinicializarDropdown(dropdown);

    dropdown.setChoices(choices, value, label, false);

    dropdown.enable();
    dropdown.showDropdown(false);
}

const reinicializarDropdown = (dropdown) => {
    var newOptions = [];
    newOptions.push(dropdown.config.choices.find(choice => choice.placeholder));
    dropdown.setChoices(newOptions, 'value', 'label', true)
        .setChoiceByValue('');
}

document.querySelector('#submit').addEventListener('click', function (event) {

    if (!event.target.matches('.btn')) return;
    event.preventDefault();

    if (ddlUnidade.getValue(true) === '') {
        document.getElementById('validation').classList.remove('d-none');
        return;
    }

    document.getElementById('error').classList.add('d-none');
    let botao = document.getElementById('submit');
    botao.disabled = true;
    botao.childNodes[0].className = 'spinner-border spinner-border-sm';
    botao.childNodes[1].textContent = ' Pesquisando...';

    fetchData()
        .then(data => {

            if (data.hits.total.value == 0) {
                document.getElementById('noResult').classList.remove('d-none');
                var vacinaList = document.querySelector('#vacinas');
                vacinaList.querySelectorAll('*').forEach(n => n.remove());
            }
            else {
                document.getElementById('noResult').classList.add('d-none');

                exibirAplicacoes(agruparVacinas(data));
            }

            document.querySelector('#vacinas').scrollIntoView();
        })
        .catch(function () {
            document.getElementById('error').classList.remove('d-none');
            document.querySelector('#vacinas').scrollIntoView();
        }).finally(function () {
            botao.disabled = false;
            botao.childNodes[0].className = '';
            botao.childNodes[1].textContent = 'Pesquisar';
        });

}, false);

document.addEventListener('DOMContentLoaded', function () {
    initJson();

    ddlEstado = new Choices('#estado', {
        placeholder: true,
        searchPlaceholderValue: "Pesquisar estado",
        searchResultLimit: 2,
        loadingText: 'Carregando...',
        noResultsText: 'Nenhum estado encontrado',
        noChoicesText: 'Nenhuma opção disponível',
        itemSelectText: 'Selecionar',
    });

    ddlMunicipio = new Choices('#municipio', {
        placeholder: true,
        searchPlaceholderValue: "Pesquisar município",
        searchResultLimit: 3,
        loadingText: 'Carregando...',
        noResultsText: 'Nenhum município encontrado',
        noChoicesText: 'Nenhuma opção disponível',
        itemSelectText: 'Selecionar',
    });

    ddlUnidade = new Choices('#unidade', {
        placeholder: true,
        searchPlaceholderValue: "Pesquisar unidade",
        searchResultLimit: 5,
        loadingText: 'Carregando...',
        noResultsText: 'Nenhuma unidade encontrado',
        noChoicesText: 'Nenhuma opção disponível',
        itemSelectText: 'Selecionar',
    });

    ddlMunicipio.disable();
    ddlUnidade.disable();

    ddlEstado.setChoices(function () {
        return fetch(
            '/data/uf.json'
        )
            .then(function (res) {
                return res.json();
            })
            .then(function (data) {
                return data.ufs
            });
    }, 'Codigo', 'Nome', false);

    ddlEstado.passedElement.element.addEventListener('change', function (e) {

        const municipiosFiltrados = listMunicipio.municipios.filter(function (a) {
            return a.CodigoUF === Number(e.detail.value);
        });

        changeDropdown(ddlMunicipio, municipiosFiltrados, 'Codigo', 'Nome');

        reinicializarDropdown(ddlUnidade);

        ddlUnidade.disable();
    });

    ddlMunicipio.passedElement.element.addEventListener('change', function (e) {

        const unidadesFiltradas = listUnidade.unidades.filter(function (a) {
            return a.CodigoMunicipio === Number(e.target.value);
        });

        changeDropdown(ddlUnidade, unidadesFiltradas, 'CodigoCNES', 'Nome');
    });

    ddlUnidade.passedElement.element.addEventListener('change', function () {
        document.getElementById('validation').classList.add('d-none');
    });

    ddlUnidade.passedElement.element.addEventListener('showDropdown', function () {
        var select = this;
        var id = this.value;

        var option = select.parentElement.parentElement.querySelector('.choices__list--dropdown [data-value="' + id + '"]');

        if (option) {
            option.classList.add('is-active');
            option.parentElement.scrollTop = option.offsetTop - option.parentElement.offsetTop;
        }
    }, false);
});