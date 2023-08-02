const { ipcRenderer } = require('electron');

let timer
let names = []

const createTable = () => {
  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  table.appendChild(tbody)

  return table
}

const addRow = (data, position) => {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.textContent = `${position}: ${data}`;
  row.appendChild(cell);
  return row
}

const microbitDataDiv = document.getElementById('microbit-data');
microbitDataDiv.appendChild(createTable())

ipcRenderer.on('microbitData', (event, data) => {
  const index = names.indexOf(data);
  if (index < 0) {
    names.push(data)
    let tables = document.getElementsByTagName('table')
    let tbody = document.getElementsByTagName('tbody')[0]
    tbody.appendChild(addRow(data, tables[0].rows.length + 1));
    tables[0].appendChild(tbody);
    clearTimeout(timer)
    
    timer = setTimeout(function() {
      microbitDataDiv.removeChild(tables[0])
      microbitDataDiv.appendChild(createTable())
      names = []
    }, 10000);
  }
});
