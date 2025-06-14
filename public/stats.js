document.getElementById('playerStatsForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const gameDate = document.getElementById('gameDateInput').value;
    const datePattern = /^\d{8}$/;

    if (!datePattern.test(gameDate)) {
        alert("Invalid date format! Please use MMDDYYYY.");
        return;
    }

    const month = parseInt(gameDate.slice(0, 2), 10);
    const day = parseInt(gameDate.slice(2, 4), 10);
    const year = parseInt(gameDate.slice(4, 8), 10);
    const dateObj = new Date(year, month - 1, day);

    if (
        dateObj.getFullYear() === year &&
        dateObj.getMonth() === month - 1 &&
        dateObj.getDate() === day
    ) {
        console.log("Valid date!");
        alert("Player stats submitted successfully!");
    } else {
        alert("Invalid date combination! Please check the day, month, and year.");
    }
});

async function fetchStats() {
    const date = document.getElementById('gameDateSearch').value;
    if (!date) return alert("Please select a date.");

    // ✅ Updated route name to match backend
    const response = await fetch(`/stats-data?date=${date}`);
    const stats = await response.json();

    const table = document.getElementById('statsTable');
    const tbody = document.getElementById('statsBody');
    tbody.innerHTML = '';

    if (stats.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9">No data found for this date.</td></tr>';
    } else {
        stats.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.player_name}</td>
                <td>${row.opponent}</td>
                <td>${row.home_game ? 'Yes' : 'No'}</td>
                <td>${row.minutes}</td>
                <td>${row.points}</td>
                <td>${row.rebounds}</td>
                <td>${row.assists}</td>
                <td>${row.steals}</td>
                <td>${row.blocks}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    table.style.display = 'table';
}