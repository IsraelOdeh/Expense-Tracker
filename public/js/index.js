// var chrt = document.getElementById("chartId").getContext("2d");
//       var chartId = new Chart(chrt, {
//          type: 'pie',
//          data: {
//             labels: ["HTML", "CSS", "JAVASCRIPT", "CHART.JS", "JQUERY", "BOOTSTRP"],
//             datasets: [{
//                label: "online tutorial subjects",
//                data: [20, 40, 13, 35, 20, 38],
//                backgroundColor: ['yellow', 'aqua', 'pink', 'lightgreen', 'gold', 'lightblue'],
//                hoverOffset: 5
//             }],
//          },
//          options: {
//             responsive: false,
//          },
//       });


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
  
  let transaction ;
  function displayEntries(entries) {
    transaction = entries;
    const tableBody = document.getElementById('entries-table').querySelector('tbody');
    tableBody.innerHTML = '';
    let total = 0;
    let totincome = 0;
    let totexpense = 0;

    index = 0;
    recents = document.getElementById('recent-transactions');
    recents.innerHTML = '';
    entries.forEach(entry => {
      entry.date = new Date(Date.parse(entry.date))
      entry.date = entry.date.getUTCFullYear() +  "-" + (entry.date.getUTCMonth() + 1) + "-" + entry.date.getUTCDate();

      if(index < 3){
        console.log(index)
        recents.innerHTML +=`
          <li style="display: flex;justify-content: space-between;">
            <p> ${entry.description}</span> <p> ${(entry.type = 'expense'? '-':'+' )}${entry.amount}
          </li>
        `
        index++;
      }else if(index == 3){
        
        console.log(index)
        recents.innerHTML +=`
          <li>
            <button>
              More transactions...
            </button>
          </li>
        `
        index++;
      }


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
          <button onclick="editEntry(${entry.trans_id})">Edit</button>
          <button onclick="deleteEntry(${entry.trans_id})">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
    document.getElementById('total').textContent = `$${total}`;
    document.getElementById('totincome').textContent = `$${totincome}`;
    document.getElementById('totexpense').textContent = `$${totexpense}`;


  }
  
  
  async function editEntry(id,entry){
    let filteredValues = transaction.filter(item => item.trans_id === id)
    console.log(filteredValues);
    form = document.getElementById('edit-entry-form');
    form.innerHTML = ''
    form.innerHTML += `
      <input type = "hidden" value=${filteredValues[0].trans_id} name="trans_id">
      <input type="radio" name="type" class="type"  id="income" value="income" ${(filteredValues[0].type == "income" ? 'checked' : '')}  required />
      <input type="radio" name="type" id="expense" class="type" value="expense"  ${(filteredValues[0].type == "expense" ? 'checked' : '')} required />
      <div class="option">
        <label for="income">Income</label>
        <label for="expense">Expense</label>
      </div>
      <input type="text" name="description" placeholder="Description" value="${filteredValues[0].description}" required />
      <input type="number" name="amount" placeholder="Amount"  value="${filteredValues[0].amount}"  required />

      <select name="category" id="category">
        <option ${ (filteredValues[0].category == "Housing" ? 'selected' : '') } value="Housing">Housing</option>
        <option  ${ (filteredValues[0].category == "Transportation" ? 'selected' : '') } value="Transportation">Transportation</option>
        <option  ${ (filteredValues[0].category  == "Food" ? 'selected' : '') } value="Food">Food</option>
        <option  ${ (filteredValues[0].category == "Health & Medical" ? 'selected' : '') } value="Health & Medical">Health & Medical</option>
        <option  ${ (filteredValues[0].category == "Entertainment & Leisure" ? 'selected' : '') } value="Entertainment & Leisure">Entertainment & Leisure</option>
        <option  ${ (filteredValues[0].category == "Personal Care" ? 'selected' : '') } value="Personal Care">Personal Care</option>
        <option  ${ (filteredValues[0].category == "Education" ? 'selected' : '') } value="Education">Education</option>
        <option  ${ (filteredValues[0].category == "Savings & Investments" ? 'selected' : '') } value="Savings & Investments">Savings & Investments</option>
        <option   ${ (filteredValues[0].category == "Miscellaneous" ? 'selected' : '') }value="Miscellaneous">Miscellaneous</option>
      </select>

      <input type="date" name="date"  value="${filteredValues[0].date}" required />

      <button type="submit">Add</button>
    `
    // const token = localStorage.getItem('token');
    // await fetch('/api/editexpenses', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ description, amount, date, type, category })
    // });
    // fetchEntries();
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

  
  async function updateEntry(description, amount,category,date,type,id)  {
    const token = localStorage.getItem('token');
    await fetch('/api/editexpenses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ description, amount, date, type, category,id })
    });
    fetchEntries();
  }


  function displayBudget(entries) {
    this_year = new Date().getFullYear();
    this_month = new Date().getMonth() +1;
    console.log(this_year+':'+this_month)

    month_array = {'1':'Jan', '2':'Feb', '3':'Mar', '4':'Apr', '5':'May', '6':'Jun', '7':'Jul','8': 'Aug', '9':'Sep', '10':'Oct', '11': 'Nov', '12':'Dec'} 
    
    this_month = String(this_month)
    this_month = month_array[this_month]
    let filteredValues = entries.budgetrow.filter(item => item.month === this_month && item.year === this_year)
    array = {}
    filteredValues[0].budget.split(',').forEach((pair) =>{
      const [key,value] = pair.split(':')
      array[key] = value;
    });
    totalBudget = 0;
    Object.keys(array).forEach(element =>{
        totalBudget += Number(array[element])
    })
    console.log(totalBudget)
    console.log(entries)
    
    let Body = document.getElementById('budget_display');
        Body.innerHTML = ""
    entries.budgetrow.forEach(entry => {
      Body = document.getElementById('budget_display');
      budget_date =entry.month+', '+entry.year;
      //<div>
      //  <strong>${entry.name}</strong>: $$totalSpent.toFixed(2)} / $${entr.budget_amount.toFixed(2)}
      //    <div class="progress-bar">
      //       <div class="progress" style="width: ${usagePercent}%;"></div>
      //     </div>
      //</div>

      Body.innerHTML += `
        <div style="width: 60%;display: flex;align-items: center;justify-content: space-between; margin-left: auto;margin-right: auto;">
          
          <span style="font-weight: 800;text-transform: capitalize;">${entry.name}</span>
          <div>
            <span style="margin-right: 40px;">${budget_date}</span>
            <button onclick="document.getElementById(${entry.budget_id}).classList.toggle('show')">View</button>
          </div>
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
  
  document.getElementById('edit-entry-form').addEventListener('submit', (event) =>{
    event.preventDefault();
    const id = event.target.trans_id.value;
    const description = event.target.description.value;
    const amount = event.target.amount.value;
    const category = event.target.category.value;
    const date = event.target.date.value;
    const type = event.target.type.value;
    updateEntry(description, amount, category, date,type,id);
  })

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
    toggleSidebar()
    window.location = "/loginpage";
  });

  document.getElementById('dashboard').addEventListener('click', () => {
    document.getElementById('dashboard_section').classList.add('show');
    document.getElementById('add_transaction_section').classList.remove('show');
    document.getElementById('view_transaction_section').classList.remove('show');
    document.getElementById('budget_section').classList.remove('show');
    toggleSidebar()
  });
  document.getElementById('add_transaction').addEventListener('click', () => {
    document.getElementById('add_transaction_section').classList.add('show');
    document.getElementById('dashboard_section').classList.remove('show');
    document.getElementById('view_transaction_section').classList.remove('show');
    document.getElementById('budget_section').classList.remove('show');
    toggleSidebar()
  });
  document.getElementById('view_transaction').addEventListener('click', () => {
    document.getElementById('view_transaction_section').classList.add('show');
    document.getElementById('dashboard_section').classList.remove('show');
    document.getElementById('add_transaction_section').classList.remove('show');
    document.getElementById('budget_section').classList.remove('show');
    toggleSidebar()
  });

  document.getElementById('budget').addEventListener('click', () => {
    document.getElementById('budget_section').classList.add('show');
    document.getElementById('view_transaction_section').classList.remove('show');
    document.getElementById('dashboard_section').classList.remove('show');
    document.getElementById('add_transaction_section').classList.remove('show');
    toggleSidebar()
  });