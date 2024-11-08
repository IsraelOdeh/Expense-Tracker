
// const token = localStorage.getItem('token');

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
            if (data.id) {
                // Fetch expenses
                fetchEntries();
                fetchBudget();
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
    let total = 0;
    let totincome = 0;
    let totexpense = 0;
    entries.forEach(entry => {
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

  function displayBudget(entries) {
    
    
    console.log(entries)
    entries.budgetrow.forEach(entry => {
        let Body = document.getElementById('budget_display');
        // entry.created_at = new Date(Date.parse(entry.date))
        // entry.created_at = entry.created_at.getUTCFullYear() +  "/" + (entry.created_at.getUTCMonth() + 1) + "/" + entry.date.getUTCDate();

      //<div>
      //  <strong>${entry.name}</strong>: $$totalSpent.toFixed(2)} / $${entr.budget_amount.toFixed(2)}
      //    <div class="progress-bar">
      //       <div class="progress" style="width: ${usagePercent}%;"></div>
      //     </div>
      //</div>

      Body.innerHTML += `
        <div style="width: 80%;display: flex;align-items: center;justify-content: space-evenly; margin-left: auto;margin-right: auto;">
          <span style="font-weight: 800;text-transform: capitalize;">${entry.name}</span>
          <span>${entry.created_at}</span>
          <button onclick="document.getElementById(${entry.budget_id}).classList.toggle('show')">View</button>
        </div>
        <div style="display: none; width: fit-content;margin-left: auto;margin-right: auto; border: solid;padding: 5px;border-width: thin;" id="${entry.budget_id}">
        </div>
      `;

      array = {}
      entry.budget.split(',').forEach((pair) =>{
        const [key,value] = pair.split(':')
        array[key] = value;
      });

      Body = document.getElementById(entry.budget_id);
      Body.innerHTML = ''
      entry.budget = array;
      console.log(entry.budget);
      Object.keys(entry.budget).forEach(key =>{

        totalSpent = 0;
        entries.expenserow.forEach(expense =>{

          month_array = {'1':'Jan', '2':'Feb', '3':'Mar', '4':'Apr', '5':'May', '6':'Jun', '7':'Jul','8': 'Aug', '9':'Sep', '10':'Oct', '11': 'Nov', '12':'Dec'}
          expense.date = new Date(Date.parse(expense.date));
          
          year = expense.date.getUTCFullYear() 
          
          month = String(expense.date.getUTCMonth() + 1 )
          month = month_array[month]
          // entry.date = entry.date.getUTCFullYear() +  "/" + (entry.date.getUTCMonth() + 1) + "/" + entry.date.getUTCDate();

          if(expense.category == key && month == entry.month && year == entry.year){
            totalSpent += Number(expense.amount);
          }
        })
        // console.log(key +''+ totalSpent)
        if(entry.budget[key] > 0){
          Body.innerHTML +=`
            <div> 
              <span>${key}</span>
              <span>You $${totalSpent} Out Of  $${entry.budget[key]} budgeted</span>
            </div>
          `
        }
      })
    });
  }

  async function fetchBudget() {
    const token = localStorage.getItem('token');
    const response = await fetch('/budget', {
        method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    const entries = await response.json();
    if(entries.message){
        // document.getElementById('status').textContent = entries.message;
        // document.getElementById('status').style.color = 'red';
        return;
     }
     else{
        document.getElementById('status').textContent = '';
     }
    displayBudget(entries);
  }

  async function addBudget(name,budget,month,year){
    const token = localStorage.getItem('token');
    await fetch('/api/budget', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({name,budget,month,year })
    });
    fetchBudget();
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
  checkboxes.forEach(element => {
    if(element.checked){
      isChecked++;
      return;
    };
  })
  if(isChecked>0){
    const budget = `Housing:${event.target.Housing.value},Transportation:${event.target.Transportation.value},Food:${event.target.Food.value},Health & Medical:${event.target.Health.value},Entertainment & Leisure:${event.target.Entertainment.value},Personal Care:${event.target.Personal.value},Education:${event.target.Education.value},Savings & Investments:${event.target.Savings.value},Miscellaneous:${event.target.Miscellaneous.value}`;

    console.log(budget)
    const month = event.target.Month.value;
    const year = event.target.Year.value;
    const name = event.target.Name.value
    addBudget(name,budget,month,year);
  }
  else{
    document.getElementById("budgetMessage").textContent = "Select at least 1 category to budget"
  }
});

checkboxes.forEach(element => {
  element.addEventListener('click',(event) =>{
    console.log(event.target)
    document.getElementById('checkbox' + event.target.value).classList.toggle('show');
    child = document.getElementById('checkbox' + event.target.value).children;
   
    if(event.target.checked){
       i = 0;
       while(i < child.length) {
        child[i].value= 1;
        i++;
      }
    }
    else{
      i = 0;
      while(i < child.length) {
       child[i].value = 0
       i++;

     }
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