// This file contains the main JavaScript code for the travel packing app.
// It initializes the application, handles adding items to the table, 
// manages local storage, and updates the UI based on user interactions.

document.addEventListener('DOMContentLoaded', () => {
    const itemInput = document.getElementById('item');
    const categoryInput = document.getElementById('category');
    const whoInput = document.getElementById('who');
    const addButton = document.getElementById('add-button');
    const itemList = document.getElementById('item-list');

    // Load items from local storage
    loadItems();

    // Add event listener for adding items
    addButton.addEventListener('click', () => {
        const item = itemInput.value;
        const category = categoryInput.value;
        const who = whoInput.value;

        if (item && category && who) {
            addItemToTable(false,item, category, who); // Default to unpacked
            saveItemToLocalStorage(false, item, category, who);
            clearInputs();
        }
    });

    function addItemToTable(packed,item, category, who) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" ${packed ? 'checked' : ''}></td>
            <td style="width:100%">${item}</td>
            <td class="hide-mobile">${category}</td>
            <td class="hide-mobile">${who}</td>
            
            <td>
                <button class="delete-button" aria-label="Delete item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                </button>
            </td>
        `;
        // Add event listener to the checkbox
        const checkbox = row.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
            const row = this.closest('tr');
            const item = row.cells[0].textContent;
            const category = row.cells[1].textContent;
            const who = row.cells[2].textContent;
            const packed = this.checked;
            
            // Update in localStorage
            const items = getItemsFromLocalStorage();
            const itemIndex = items.findIndex(i => 
                i.item === item && 
                i.category === category && 
                i.who === who
            );
            
            if (itemIndex !== -1) {
                items[itemIndex].packed = packed;
                localStorage.setItem('travelItems', JSON.stringify(items));
            }
        });

        // Add delete functionality
        const deleteButton = row.querySelector('.delete-button');
        deleteButton.addEventListener('click', () => {
            // Remove from local storage using correct key and properties
            let items = JSON.parse(localStorage.getItem('travelItems') || '[]');
            items = items.filter(i => 
                !(i.item === item && 
                  i.category === category && 
                  i.who === who)
            );
            localStorage.setItem('travelItems', JSON.stringify(items));
            
            // Remove from DOM
            row.remove();
            
            // Update filters and datalists
            updateFilterOptions();
            updateDatalistOptions();
        });

        itemList.appendChild(row);
    }

    function saveItemToLocalStorage(item, category, who, packed) {
        const items = getItemsFromLocalStorage();
        items.push({ item, category, who, packed });
        localStorage.setItem('travelItems', JSON.stringify(items));
        updateDatalistOptions(); // Update the datalists after saving new item
        updateFilterOptions(); // Update the filter options
    }

    function loadItems() {
        const items = getItemsFromLocalStorage();
        itemList.innerHTML = ''; // Clear existing items
        items.forEach(({ packed,item, category, who }) => {
            addItemToTable(packed,item, category, who);
        });
        updateDatalistOptions(); // Update the datalists when loading items
        updateFilterOptions(); // Update the filter options
    }

    function getItemsFromLocalStorage() {
        return JSON.parse(localStorage.getItem('travelItems')) || [];
    }

    function clearInputs() {
        itemInput.value = '';
        categoryInput.value = '';
        whoInput.value = '';
    }


    // Add these new functions
    function updateDatalistOptions() {
        const items = getItemsFromLocalStorage();
        
        // Update category datalist
        const categories = [...new Set(items.map(item => item.category))];
        const categoryList = document.getElementById('category-list');
        categoryList.innerHTML = categories
            .map(category => `<option value="${category}">`)
            .join('');
        
        // Update who datalist
        const whoValues = [...new Set(items.map(item => item.who))];
        const whoList = document.getElementById('who-list');
        whoList.innerHTML = whoValues
            .map(who => `<option value="${who}">`)
            .join('');
    }

    // Replace the existing updateFilterOptions and updateFilterDropdowns functions with this:
    function updateFilterOptions() {
        const items = getItemsFromLocalStorage();
        
        // Get unique values for each column using correct property names
        const uniqueItems = [...new Set(items.map(item => item.item))].sort();
        const uniqueCategories = [...new Set(items.map(item => item.category))].sort();
        const uniqueWho = [...new Set(items.map(item => item.who))].sort();

        // Populate item dropdown
        const itemSelect = document.getElementById('filter-item');
        itemSelect.innerHTML = '<option value="">All Items</option>';
        uniqueItems.forEach(item => {
            if (item) {
                itemSelect.innerHTML += `<option value="${item}">${item}</option>`;
            }
        });

        // Populate category dropdown
        const categorySelect = document.getElementById('filter-category');
        categorySelect.innerHTML = '<option value="">All Categories</option>';
        uniqueCategories.forEach(category => {
            if (category) {
                categorySelect.innerHTML += `<option value="${category}">${category}</option>`;
            }
        });

        // Populate who dropdown
        const whoSelect = document.getElementById('filter-who');
        whoSelect.innerHTML = '<option value="">All People</option>';
        uniqueWho.forEach(who => {
            if (who) {
                whoSelect.innerHTML += `<option value="${who}">${who}</option>`;
            }
        });
    }

    // Update the filterItems function
    function filterItems() {
        const items = getItemsFromLocalStorage();
        const filterItem = document.getElementById('filter-item').value;
        const filterCategory = document.getElementById('filter-category').value;
        const filterWho = document.getElementById('filter-who').value;
        const filterPacked = document.getElementById('filter-packed').value;

        const filteredItems = items.filter(item => {
            const matchItem = !filterItem || item.item === filterItem;
            const matchCategory = !filterCategory || item.category === filterCategory;
            const matchWho = !filterWho || item.who === filterWho;
            let matchPacked = true;
            
            if (filterPacked === 'packed') {
                matchPacked = item.packed === true;
            } else if (filterPacked === 'unpacked') {
                matchPacked = item.packed === false;
            }

            return matchItem && matchCategory && matchWho && matchPacked;
        });

        // Clear and repopulate the table with filtered items
        const itemList = document.getElementById('item-list');
        itemList.innerHTML = '';
        filteredItems.forEach(item => {
            addItemToTable(item.packed,item.item, item.category, item.who);
        });
    }

    // Add these event listeners in your DOMContentLoaded event
    document.getElementById('filter-item').addEventListener('change', filterItems);
    document.getElementById('filter-category').addEventListener('change', filterItems);
    document.getElementById('filter-who').addEventListener('change', filterItems);
    document.getElementById('filter-packed').addEventListener('change', filterItems);

    // Settings dropdown functionality
    const settingsButton = document.getElementById('settings-button');
    const settingsDropdown = document.getElementById('settings-dropdown');
    const exportMenuButton = document.getElementById('export-menu-button');
    const installMenuButton = document.getElementById('install-menu-button');

    settingsButton.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsDropdown.contains(e.target) && !settingsButton.contains(e.target)) {
            settingsDropdown.classList.remove('show');
        }
    });

    // Move the existing export button functionality to the menu button
    exportMenuButton.addEventListener('click', () => {
        const items = getItemsFromLocalStorage();
        
        // Create CSV header
        let csvContent = "Item,Category,Who,Packed\n";
        
        // Add each item to CSV content
        items.forEach(item => {
            const row = [
                `"${item.item}"`,
                `"${item.category}"`,
                `"${item.who}"`,
                item.packed ? "Yes" : "No"
            ].join(",");
            csvContent += row + "\n";
        });
        
        // Create blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        
        // Create the URL for the blob
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "travel-list.csv");
        
        // Append link, click it, and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    // Installation handling
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        // Show both install buttons
        const installButton = document.getElementById('install-button');
        const installMenuButton = document.getElementById('install-menu-button');
        //installButton.style.display = 'block';
        installMenuButton.style.display = 'block';
    });

    // Function to handle installation
    async function handleInstall() {
        if (!deferredPrompt) {
            // For iOS devices
            if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
                alert('To install this app on iOS: tap the Share button below and then "Add to Home Screen"');
                return;
            }
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        // We no longer need the prompt. Clear it up
        deferredPrompt = null;
        // Hide both install buttons
        document.getElementById('install-button').style.display = 'none';
        document.getElementById('install-menu-button').style.display = 'none';
    }

    // Add click handlers to both install buttons
    document.getElementById('install-button').addEventListener('click', handleInstall);
    document.getElementById('install-menu-button').addEventListener('click', handleInstall);

    // Handle installed PWA
    window.addEventListener('appinstalled', () => {
        // Hide both install buttons
        document.getElementById('install-button').style.display = 'none';
        document.getElementById('install-menu-button').style.display = 'none';
        deferredPrompt = null;
    });

    // Hide the original install button since it's now in the dropdown
    document.getElementById('install-button').style.display = 'none';

    document.getElementById('reset-packed-button').addEventListener('click', function() {
        // Get all items from localStorage using the correct key 'travelItems'
        const items = JSON.parse(localStorage.getItem('travelItems') || '[]');
        
        // Set all items to unpacked
        items.forEach(item => {
            item.packed = false;
        });
        
        // Save back to localStorage with correct key
        localStorage.setItem('travelItems', JSON.stringify(items));
        
        // Refresh the display using the existing loadItems function
        loadItems();
    });
});