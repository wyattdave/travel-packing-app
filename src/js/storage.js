function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function exportLocalStorage() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
    }
    return JSON.stringify(data);
}

function importLocalStorage(data) {
    const parsedData = JSON.parse(data);
    for (const key in parsedData) {
        localStorage.setItem(key, parsedData[key]);
    }
}