document.addEventListener('DOMContentLoaded', async () => {
    
    // --- 1. GLOBAL STATE & DOM ELEMENTS ---
    let allDatasets = []; // Will hold the data from data.json
    let activeDatasetIndex = 0; // Index of the currently shown dataset

    const tableBody = document.querySelector("#data-table tbody");
    const copyBtn = document.getElementById("copy-btn");
    const tableElement = document.getElementById("data-table");
    const buttonContainer = document.getElementById("dataset-buttons");
    const tableTitle = document.getElementById("table-title");

    // --- 2. DATA FETCHING ---
    async function loadData() {
        try {
            const response = await fetch('vn_sedai.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allDatasets = await response.json();
        } catch (error) {
            console.error("Could not load data.json:", error);
            tableTitle.textContent = "Error: Could not load data.";
        }
    }

    // --- 3. DYNAMIC RENDERING FUNCTIONS ---
    
    // Renders the table for a specific dataset
    function renderTable(dataset) {
        // Clear any existing rows
        tableBody.innerHTML = '';
        tableTitle.textContent = dataset.title; // Set the H2 title

        const data = dataset.tableData;
        for (const [year, items] of Object.entries(data)) {
            const row = document.createElement('tr');
            const yearCell = document.createElement('td');
            yearCell.textContent = year;
            row.appendChild(yearCell);

            items.forEach(itemText => {
                const itemCell = document.createElement('td');
                itemCell.textContent = itemText;
                row.appendChild(itemCell);
            });
            tableBody.appendChild(row);
        }
    }

    // Creates the top buttons to switch between datasets
    function renderButtons() {
        buttonContainer.innerHTML = ''; // Clear existing buttons
        allDatasets.forEach((dataset, index) => {
            const button = document.createElement('button');
            button.textContent = dataset.title;
            button.dataset.index = index; // Store index to know which data to load
            if (index === activeDatasetIndex) {
                button.classList.add('active'); // Style the active button
            }
            buttonContainer.appendChild(button);
        });
    }

    // --- 4. EVENT LISTENERS ---

    // Handles clicks on the dataset buttons
    buttonContainer.addEventListener('click', (event) => {
        const clickedButton = event.target.closest('button');
        if (!clickedButton) return; // Ignore clicks that aren't on a button

        const index = parseInt(clickedButton.dataset.index, 10);
        if (index !== activeDatasetIndex) {
            activeDatasetIndex = index;
            renderTable(allDatasets[activeDatasetIndex]);
            // Update active class on buttons
            document.querySelector('#dataset-buttons .active').classList.remove('active');
            clickedButton.classList.add('active');
        }
    });

    // Handles highlighting cells
    tableBody.addEventListener('click', (event) => {
        const clickedCell = event.target;
        if (clickedCell.tagName === 'TD' && clickedCell.cellIndex > 0) {
            clickedCell.classList.toggle('highlighted');
        }
    });

    // Handles the copy image functionality (no changes needed here)
    copyBtn.addEventListener('click', async () => {
        // ... (This function remains exactly the same as before)
        const originalButtonText = copyBtn.textContent;
        copyBtn.textContent = 'Generating...';
        try {
            const canvas = await html2canvas(document.getElementById('table-container'), { scale: 2, useCORS: true });
            canvas.toBlob(async (blob) => {
                try {
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                    copyBtn.textContent = 'Copied!';
                } catch (err) {
                    console.error('Failed to copy image:', err);
                    copyBtn.textContent = 'Copy Failed!';
                } finally {
                    setTimeout(() => { copyBtn.textContent = originalButtonText; }, 2000);
                }
            });
        } catch (err) {
            console.error('html2canvas failed:', err);
            copyBtn.textContent = 'Error!';
            setTimeout(() => { copyBtn.textContent = originalButtonText; }, 2000);
        }
    });

    // --- 5. INITIALIZATION ---
    async function initialize() {
        await loadData();
        if (allDatasets.length > 0) {
            renderButtons();
            renderTable(allDatasets[activeDatasetIndex]);
        }
    }

    initialize();
});