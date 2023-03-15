const apiKey = '145469790f40f5981624f1df3f9449394f05765b';
const input = document.getElementById('company-input');
const select = document.getElementById('company-select');
const shortName = document.getElementById('short-name');
const fullName = document.getElementById('full-name');
const type = document.getElementById('type');
const innKpp = document.getElementById('inn-kpp');
const address = document.getElementById('address');
const warn = document.querySelector('.warn');
const inputWrapper = document.querySelector('.inputWrapper');

function typeDescription(type) {
  const TYPES = {
    'INDIVIDUAL': 'Индивидуальный предприниматель',
    'LEGAL': 'Организация'
  }
  return TYPES[type] || '';
}

function join(arr /*, separator */ ) {
  const separator = arguments.length > 1 ? arguments[1] : ", ";
  return arr.filter(Boolean).join(separator);
}

function showSuggestion(suggestion) {
  const data = suggestion.data;
  if (!data)
    return;
  console.log(data);
  type.textContent = typeDescription(data.type) + ' (' + data.type + ')';

  if (data.name) {
    shortName.value = data.name.short_with_opf || '';
    fullName.value = data.name.full_with_opf || '';
  }

  innKpp.value = join([data.inn, data.kpp], ' / ');

  if (data.address) {
    let addressValue = '';
    if (data.address.data.qc == "0") {
      addressValue = join([data.address.data.postal_code, data.address.value]);
    } else {
      addressValue = data.address.data.source;
    }
    address.value = addressValue;
  }
}

async function getSuggestions(query) {
  const url = `https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${apiKey}`
    },
    body: JSON.stringify({
      query: query,
      count: 5
    })
  };

  const response = await fetch(url, options);
  const suggestions = await response.json();

  return suggestions;
}

input.addEventListener('input', async (event) => {
  const query = event.target.value;

  if (!query) {
    select.style.display = 'none';
    return;
  }

  const suggestions = await getSuggestions(query);

  if (suggestions.suggestions.length) {
    select.innerHTML = '';
    suggestions.suggestions.forEach(suggestion => {
      const option = document.createElement('option');
      option.innerHTML = suggestion.data.name.full_with_opf
      option.value = suggestion.value;
      option.setAttribute('data-suggestion', JSON.stringify(suggestion));
      select.appendChild(option);
    });
    select.style.display = 'block';
    warn.style.display = 'none';
  } else {
    select.style.display = 'none';
    warn.style.display = 'block';
  }
});

inputWrapper.addEventListener('focusout', (event) => {
  const relatedTarget = event.relatedTarget;
  if (!relatedTarget || !select.contains(relatedTarget)) {
    select.style.display = 'none';
    warn.style.display = 'none';
  }
});

select.addEventListener('change', (event) => {
  const selectedOption = event.target.selectedOptions[0];
  const suggestion = JSON.parse(selectedOption.getAttribute('data-suggestion'));
  input.value = suggestion.data.name.full_with_opf
  select.style.display = 'none';
  showSuggestion(suggestion);
});
