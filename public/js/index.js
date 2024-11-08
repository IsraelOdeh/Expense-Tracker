
const token = localStorage.getItem('token');

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const sidebarToggle = document.getElementById("sidebarToggle");

// Function to toggle sidebar and overlay
function toggleSidebar() {
  sidebar.classList.toggle("show");
  overlay.classList.toggle("show");
}

// Toggle sidebar on button click
sidebarToggle.addEventListener("click", toggleSidebar);

// Close sidebar when clicking outside on the overlay
overlay.addEventListener("click", toggleSidebar);

//Check if user is previously logged in after reload
window.addEventListener("load", (event) => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location = "/loginpage";
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
          console.log(data)
            if (data.id) {
                // Fetch expenses
                fetchEntries();
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
    console.log(entries)
    let total = 0;
    let totincome = 0;
    let totexpense = 0;
    entries.forEach(entry => {
        console.log(typeof entry.amount)
        entry.date = new Date(Date.parse(entry.date))
        entry.date = entry.date.getUTCFullYear() +  "/" + (entry.date.getUTCMonth() + 1) + "/" + entry.date.getUTCDate();

      if(entry.type === 'income'){
        totincome += Number(entry.amount);
        total += Number(entry.amount)
      }
      else{
        totexpense += Number(entry.amount);
        total -= Number(entry.amount);
      }

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.description}</td>
        <td>$${entry.amount}</td>
        <td>${entry.category}</td>
        <td>${entry.date}</td>
        <td>${entry.type}</td>

        <td>
          <button onclick="editEntry(${entry.id})">Edit</button>
          <button onclick="deleteEntry(${entry.id})">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
    document.getElementById('total').textContent = `$${total}`;
    document.getElementById('totincome').textContent = `$${totincome}`;
    document.getElementById('totexpense').textContent = `$${totexpense}`;


  }
  
  async function addEntry(description, amount,category,date,type)  {
    const token = localStorage.getItem('token');
    await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ description, amount, date, type, category })
    });
    fetchEntries();
  }
  
  document.getElementById('entry-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const description = event.target.description.value;
    const amount = event.target.amount.value;
    const category = event.target.category.value;
    const date = event.target.date.value;
    const type = event.target.type.value;
    addEntry(description, amount, category, date,type);
  });
  
checkboxes = document.getElementById('budget_section').querySelectorAll('input[type=checkbox]');

document.getElementById('budgetForm').addEventListener('submit', (event) => {
  event.preventDefault();
  isChecked = 0;
  console.log(event.target)
  checkboxes.forEach(element => {
    if(element.checked){
      isChecked++;
      return;
    };
  })
  if(isChecked>0){
    category = `{ Housing: ${event.target.Housing.value}, Transportation: ${event.target.Transportation.value}, Food: ${event.target.Food.value}, Health & Medical: ${event.target.Health.value}, Entertainment & Leisure: ${event.target.Entertainment.value}, Personal Care: ${event.target.Personal.value}, Education: ${event.target.Education.value}, Savings & Investments: ${event.target.Savings.value}, Miscellaneous: ${event.target.Miscellaneous.value}}`;
    console.log(category);
  }
  else{
    document.getElementById("budgetMessage").textContent = "Select at least 1 category to budget"
  }
});

checkboxes.forEach(element => {
  element.addEventListener('click',(event) =>{
    console.log(event.target.value)
    document.getElementById('checkbox' + event.target.value).classList.toggle('show');
    child = document.getElementById('checkbox' + event.target.value).children;
    console.log(child)
    i = 0;
    while(i <= child.length) {
      child[i].setAttribute("value", 1);
    }
       
    })
});


  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location = "/loginpage";
  });

  document.getElementById('dashboard').addEventListener('click', () => {
    document.getElementById('dashboard_section').classList.add('show');
    document.getElementById('add_transaction_section').classList.remove('show');
    document.getElementById('view_transaction_section').classList.remove('show');
    document.getElementById('budget_section').classList.remove('show');
  });
  document.getElementById('add_transaction').addEventListener('click', () => {
    document.getElementById('add_transaction_section').classList.add('show');
    document.getElementById('dashboard_section').classList.remove('show');
    document.getElementById('view_transaction_section').classList.remove('show');
    document.getElementById('budget_section').classList.remove('show');
  });
  document.getElementById('view_transaction').addEventListener('click', () => {
    document.getElementById('view_transaction_section').classList.add('show');
    document.getElementById('dashboard_section').classList.remove('show');
    document.getElementById('add_transaction_section').classList.remove('show');
    document.getElementById('budget_section').classList.remove('show');
  });

  document.getElementById('budget').addEventListener('click', () => {
    document.getElementById('budget_section').classList.add('show');
    document.getElementById('view_transaction_section').classList.remove('show');
    document.getElementById('dashboard_section').classList.remove('show');
    document.getElementById('add_transaction_section').classList.remove('show');
  });