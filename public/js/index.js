// Set variable to store transaction retrieved
let transaction;

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




// Function to toggle sidebar and overlay
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  sidebar.classList.toggle("show");
  overlay.classList.toggle("show");
}

function navMenu(heading) {
  if (heading=='dashboard') {
    document.getElementById('dashboard_section').classList.add('show');
    document.getElementById('add_transaction_section').classList.remove('show');
    document.getElementById('view_transaction_section').classList.remove('show');
    document.getElementById('budget_section').classList.remove('show');
    toggleSidebar()
  }
  if (heading=='add_transaction') {
    document.getElementById('add_transaction_section').classList.add('show');
    document.getElementById('dashboard_section').classList.remove('show');
    document.getElementById('view_transaction_section').classList.remove('show');
    document.getElementById('budget_section').classList.remove('show');
    toggleSidebar()
  }
  if (heading=='view_transaction'){
    document.getElementById('view_transaction_section').classList.add('show');
    document.getElementById('dashboard_section').classList.remove('show');
    document.getElementById('add_transaction_section').classList.remove('show');
    document.getElementById('budget_section').classList.remove('show');
    toggleSidebar()
  }
  if (heading=='budget'){
    document.getElementById('budget_section').classList.add('show');
    document.getElementById('view_transaction_section').classList.remove('show');
    document.getElementById('dashboard_section').classList.remove('show');
    document.getElementById('add_transaction_section').classList.remove('show');
    toggleSidebar()
  }
}

// Toggle sidebar on button click
document.getElementById("sidebar_toggle").addEventListener("click", toggleSidebar);

// Close sidebar when clicking outside on the overlay
overlay.addEventListener("click", toggleSidebar);


window.addEventListener('offline', () => {
  // alert('You are offline. Some features may be unavailable.');
  document.getElementById('offline').classList.add('show')

});

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
                try {
                  fetchEntries()
                  fetchBudget();
                } catch (error) {
                  console.log('errrrrrrrrrrrrrrrrrrrrrrrrrrr')
                }
            } else {
                // Handle login error
                window.location = "/loginpage";
            }
        })
        .catch(error => {
            window.location = "/loginpage";
        });
});

function S_Error(error) {
  console.log("beep  beep beep beep beep")
  return
}

async function fetchEntries(retries = 3) {
    const token = localStorage.getItem('token');
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch('/expenses', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok){
          const entries = await response.json();
          transaction = entries;

          displayEntries(entries);
          document.getElementById('refresh_dialog').setAttribute('style','display:none;')

          return
        }
          else {
            throw new Error}
      } catch (error) {
        console.log(error);

        console.log('Retrieve attempt '+ (i + 1)+' failed. Retrying...');
        await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000)); // Exponential backoff
      }
    }
    console.error('Unable to fetch data after multiple attempts.');


        // const entries = await response.json();
        // console.log(entries)
    
    //  transaction = entries;
    // displayEntries(entries);
  }
  
  function displayEntries(entries) {

    transaction = entries;
    const tableBody = document.getElementById('entries_table').querySelector('tbody');
    tableBody.innerHTML = '';
    let total = 0;
    let total_income = 0;
    let total_expense = 0;

    if(entries.message){
      document.getElementById('status').textContent = entries.message;
      document.getElementById('status').style.color = 'red';

      document.getElementById('recent_transactions').textContent = 'No tranaction entered';
      
      document.getElementById('total').textContent = `$${total}`;
      document.getElementById('total_income').textContent = `$${total_income}`;
      document.getElementById('total_expense').textContent = `$${total_expense}`;
      return;
    }else{
      document.getElementById('status').textContent = '';
    }

    index = 0;
    recents = document.getElementById('recent_transactions');
    recents.innerHTML = '';
    entries.forEach(entry => {
      date = new Date(entry.date);
      month = getMonthinWords(date.getUTCMonth() + 1)
      date = (date.getUTCDate()+1) +  " " + (month) + ", " +date.getUTCFullYear();

      if(index < 3){
        recents.innerHTML +=`
          <li style="display: flex;justify-content: space-between;">
            <p> ${entry.description}</span> <p> ${(entry.type == 'expense'? '-':'+' )}${entry.amount}
          </li>
        `
        index++;
      }else if(index == 3){
        recents.innerHTML +=`
          <li>
    
            <button onclick="navMenu('view_transaction');toggleSidebar()" style="width: 100%;">
              More transactions...
            </button>
          </li>
        `
        index++;
      }

      if(entry.type === 'income'){
        total_income += Number(entry.amount);
        total += Number(entry.amount)
      }
      else{
        total_expense += Number(entry.amount);
        total -= Number(entry.amount);
      }

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.description}</td>
        <td>$${entry.amount}</td>
        <td>${entry.category}</td>
        <td>${date}</td>
        <td>${entry.type}</td>

        <td>
          <button onclick="editEntry(${entry.trans_id})">Edit</button>
          <button onclick="deleteEntry(${entry.trans_id})">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
    document.getElementById('total').textContent = `$${total}`;
    document.getElementById('total_income').textContent = `$${total_income}`;
    document.getElementById('total_expense').textContent = `$${total_expense}`;

  }

  async function editEntry(id){
    document.getElementById('entry_overlay').classList.add('show')
    document.getElementById('edit_entry').classList.add('show');
    let filteredValues = transaction.filter(item => item.trans_id === id)

    console.log(filteredValues);
      
    date = new Date(filteredValues[0].date);
    date = date.getUTCFullYear() +  "-" + `${( (date.getUTCMonth() + 1) <10 ? String(date.getUTCMonth() + 1).padStart(2, '0') : (date.getUTCMonth() + 1) )}` + "-" + `${( (date.getUTCDate()) <10 ? String(date.getUTCDate()).padStart(2, '0') : (date.getUTCDate() +1) )}`

    form = document.getElementById('edit_entry_form');
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

      <input type="date" name="date"  value="${date}" required />

      <button type="submit" name="submit" >Add</button>
    `
  }

  async function deleteEntry(id){
    document.getElementById("delete_overlay").classList.add('show');
    document.getElementById("delete_entry").classList.add('show');

    document.getElementById("delete_id").value = id;

    // console.log(filteredValues);
    const token = localStorage.getItem('token');

   
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

  function updateEntry(description, amount,category,date,type,id)  {
    console.log(date)
    const token = localStorage.getItem('token');
    fetch('/api/editexpenses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ description, amount, date, type, category,id })
    });

    document.getElementById('refresh_dialog').setAttribute('style','display:flex;flex-direction: column;')

  }

  function getMonthinWords(nummonth) {
    month_array = {'1':'Jan', '2':'Feb', '3':'Mar', '4':'Apr', '5':'May', '6':'Jun', '7':'Jul','8': 'Aug', '9':'Sep', '10':'Oct', '11': 'Nov', '12':'Dec'} 
    
    Wmonth = String(nummonth)
    Wmonth = month_array[Wmonth]
    return(Wmonth)
  }

  function budgetString2array(budget){
    array = {}
    console.log(budget)
    budget.split(',').forEach((pair) =>{
      const [key,value] = pair.split(':')
      array[key] = value;
    });
    return array;
  }

  function getCurrentBudget(row){
    this_year = new Date().getFullYear();
    this_month = getMonthinWords(new Date().getMonth() +1)

    let filteredValues = row.filter(item => item.month === this_month && item.year === this_year)
    budgetArray = budgetString2array(filteredValues[0].budget)
    totalBudget = 0;
    Object.keys(budgetArray).forEach(element =>{
        totalBudget += Number(budgetArray[element])
    })
    console.log(totalBudget)
    console.log(filteredValues)
    summary = document.getElementById('budget_summary');

    return ;
  }

  function displayBudget(entries) {
    console.log(entries)
    getCurrentBudget(entries.budgetrow);
    
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
        <div style="width: 90%;display: flex;align-items: center;justify-content: space-between; margin-left: auto;margin-right: auto; max-width: 300px">
          
          <span style="font-weight: 800;text-transform: capitalize;">${entry.name}</span>
          <div     style="display: flex;justify-content: space-between;width: 60%;align-items: center;">
            <span style="margin-right: 40px;">${budget_date}</span>
            <button onclick="document.getElementById(${entry.budget_id}).classList.toggle('show')">View</button>
          </div>
        </div>
        <div style="display: none; width: fit-content;margin-left: auto;margin-right: auto; border: solid;padding: 5px;border-width: thin;" id="${entry.budget_id}">
        </div>
      `;

      entry.budget = budgetString2array(entry.budget);
      Body = document.getElementById(entry.budget_id);
      Body.innerHTML = '';
      console.log(entry);
      Object.keys(entry.budget).forEach(key =>{

        totalSpent = 0;
        // entries.expenserow.forEach(expense =>{
        //   expense.date = new Date(expense.date);
        //   year = expense.date.getUTCFullYear() 
        //   month = getMonthinWords(expense.date.getUTCMonth() + 1)
        //   // entry.date = entry.date.getUTCFullYear() +  "/" + (entry.date.getUTCMonth() + 1) + "/" + entry.date.getUTCDate();
        //   if(expense.category == key && month == entry.month && year == entry.year){
        //     totalSpent += Number(expense.amount);
        //   }
        // })

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
        console.log('entrieeeeeeeeee')
        document.getElementById('budget_display').innerHTML = `
          <span style="margin-left: auto;margin-right: auto;display: block;width: fit-content;">
            You Have No Budget Planned Yet
          </span>
        ` ;
        return;
     }
     else{
        document.getElementById('status').textContent = '';
     }
    displayBudget(entries);
  }

  async function addBudget(name,budget,month,year){
    const token = localStorage.getItem('token');
    const response =  await fetch('/api/budget', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({name,budget,month,year })
    });
    const entries = await response.json();
    if (entries.message) {
      document.getElementById('budgetMessage').textContent = entries.message;
      return;
    }

    document.getElementById('budgetloader').classList.remove('show');
 
    document.getElementById('budget_form').classList.remove('show'); 
    document.getElementById('budget_label').classList.add('show'); 
    document.getElementById('budget_display').classList.add('show');

    document.getElementById('refresh_budget').classList.add('show');

    // fetchBudget();
  }

  document.getElementById('entry_form').addEventListener('submit', (event) => {
    event.preventDefault();
    const description = event.target.description.value;
    const amount = event.target.amount.value;
    const category = event.target.category.value;
    const date = event.target.date.value;
    const type = event.target.type.value;
    addEntry(description, amount, category, date,type);
  });
  
  document.getElementById('edit_entry_form').addEventListener('submit', (event) =>{
    event.preventDefault();
    const id = event.target.trans_id.value;
    const description = event.target.description.value;
    const amount = event.target.amount.value;
    const category = event.target.category.value;
    const date = event.target.date.value;
    const type = event.target.type.value;
    
    // document.getElementById('edit_entry_loader').classList.add('show');
    event.target.submit.disabled = true;
    updateEntry(description, amount, category, date,type,id);

    document.getElementById('edit_entry_form').innerHTML = '';
    document.getElementById('entry_overlay').classList.remove('show');
    document.getElementById('edit_entry').classList.remove('show')
    // document.getElementById('edit_entry_loader').classList.remove('show')
    event.target.submit.disabled = false;

  })

checkboxes = document.getElementById('budget_form').querySelectorAll('input[type=checkbox]');

document.getElementById('budgetForm').addEventListener('submit', (event) => {
  event.preventDefault();
  document.getElementById("budgetMessage").textContent = ""
  isChecked = 0;
  checkboxes.forEach(element => {
    if(element.checked){
      isChecked++;
      return;
    };
  })
  if(isChecked>0){
    const budget = `Housing:${event.target.Housing.value},Transportation:${event.target.Transportation.value},Food:${event.target.Food.value},Health & Medical:${event.target.Health.value},Entertainment & Leisure:${event.target.Entertainment.value},Personal Care:${event.target.Personal.value},Education:${event.target.Education.value},Savings & Investments:${event.target.Savings.value},Miscellaneous:${event.target.Miscellaneous.value}`;

    const month = event.target.Month.value;
    const year = event.target.Year.value;
    const name = event.target.Name.value

    inputboxes.forEach(input =>{
      input.classList.remove('show');
      child = input.children;
      i = 0;
      while(i < child.length) {
        child[i].value = 0
        i++;
      }
    })
    
    document.getElementById('budgetloader').classList.add('show');


    addBudget(name,budget,month,year);
  }
  else{
    document.getElementById("budgetMessage").textContent = "Select at least 1 category to budget"
  }


});

inputboxes = document.getElementById('budget_section').querySelectorAll('div[class=categoryAmount]');
checkboxes.forEach(element => {
  element.addEventListener('click',(event) =>{
    document.getElementById('checkbox' + event.target.value).classList.toggle('show');
    child = document.getElementById('checkbox' + event.target.value).children;
   
    if(event.target.checked){
       i = 0;
       while(i < child.length) {
        child[i].value= '';
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

  document.getElementById('delete_confirm').addEventListener('click',(event) =>{
    event.preventDefault()
    const token = localStorage.getItem('token');
    const id = document.getElementById('delete_id').value;
    console.log(id)

     fetch('/api/deleteexpense', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id})
    });

    document.getElementById('refresh_dialog').setAttribute('style','display:flex;flex-direction: column;')

    document.getElementById('delete_overlay').classList.remove('show');
    document.getElementById('delete_entry').classList.remove('show');
  })