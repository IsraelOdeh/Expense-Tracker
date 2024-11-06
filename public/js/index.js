const token = localStorage.getItem('token');


//Check if user is previously logged in after reload
window.addEventListener("load", (event) => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location = "http://localhost:3000/loginpage";
    }

    fetch('/checklogin', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                // Fetch expenses
                // getexpense();
            } else {
                // Handle login error
                window.location = "/loginpage";
            }
        })
        .catch(error => {
            window.location = "/loginpage";
        });
});

async function fetchEntries() {
    const token = localStorage.getItem('token');
    const response = await fetch('/expenses', {
        method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    const entries = await response.json();
    if(entries.message){
        document.getElementById('status').textContent = entries.message;
        document.getElementById('status').style.color = 'red';
        return;
     }
     else{
        document.getElementById('status').textContent = '';
     }
    displayEntries(entries);
  }
  
  function displayEntries(entries) {
    const tableBody = document.getElementById('entries-table').querySelector('tbody');
    tableBody.innerHTML = '';
    console.log(entries.results)
    entries.results.forEach(entry => {
        console.log(typeof entry.date)
        entry.date = new Date(Date.parse(entry.date))
        entry.date = entry.date.getUTCFullYear() +  "/" + (entry.date.getUTCMonth() + 1) + "/" + entry.date.getUTCDate();
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.description}</td>
        <td>$${entry.amount}</td>
        <td>${entry.date}</td>
        <td>${entry.type}</td>

        <td>
          <button onclick="editEntry(${entry.id})">Edit</button>
          <button onclick="deleteEntry(${entry.id})">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }
  
  async function addEntry(name, amount, date,type) {
    const token = localStorage.getItem('token');
    await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, amount, date, type })
    });
    fetchEntries();
  }
  
  document.getElementById('entry-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const description = event.target.description.value;
    const amount = event.target.amount.value;
    const date = event.target.date.value;
    const type = event.target.type.value;
    addEntry(description, amount, date,type);
  });
  

  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location = "/loginpage";
  });
fetchEntries();