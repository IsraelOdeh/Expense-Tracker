document.getElementById('login-tab').addEventListener('click', () => {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-tab').classList.add('active');
    document.getElementById('register-tab').classList.remove('active');
  });
  
  document.getElementById('register-tab').addEventListener('click', () => {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('login-tab').classList.remove('active');
    document.getElementById('register-tab').classList.add('active');
  });
  

async  function login(username,password) {
    try {   
        const response = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        console.log("data")
        if (data.token) {
          console.log(data)
          localStorage.setItem('token', data.token);
          window.location.href = 'index.html';
        } else {
          document.getElementById('login-error').innerText = 'Invalid credentials';
        }
      } catch (error) {
          document.getElementById('login-error').innerText = 'Invalid credentials';
          console.error('Login failed', error);
      }
  }

  document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;
  
    login(username,password);
  });
  
  document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const firstname = event.target.firstname.value;
    const lastname = event.target.lastname.value;
    const email = event.target.email.value;
    const username = event.target.username.value;
    const password = event.target.password.value;
  
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, firstname, lastname, email })
      });
      const data = await response.json();
      // console.log(data)
      if (data.message) {
        document.getElementById('message').innerText = data.message;
        return
      }
    login(data.username,data.password)
    } catch (error) {
      console.error('Registration failed', error);
    }
  });
  