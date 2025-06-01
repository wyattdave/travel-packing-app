function filterTable() {
    const filterInput = document.getElementById('filterInput');
    const filterValue = filterInput.value.toLowerCase();
    const table = document.getElementById('packingTable');
    const rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let rowVisible = false;

        for (let j = 0; j < cells.length; j++) {
            const cellValue = cells[j].textContent || cells[j].innerText;
            if (cellValue.toLowerCase().indexOf(filterValue) > -1) {
                rowVisible = true;
                break;
            }
        }

        rows[i].style.display = rowVisible ? '' : 'none';
    }
}

document.getElementById('filterInput').addEventListener('keyup', filterTable);