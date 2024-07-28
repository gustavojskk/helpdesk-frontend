const fs = require('fs');
const path = require('path');
const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api';

// Função para obter o token de autenticação
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Função para verificar o estado de autenticação
function checkAuth() {
  const token = getAuthToken();
  if (token) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainSection').style.display = 'block';
    loadSidebar();
  } else {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('mainSection').style.display = 'none';
    loadComponent('src/components/loginForm.html', 'loginSection', attachLoginEvent);
  }
}

// Função para carregar o HTML de um componente
function loadComponent(componentPath, targetElementId, callback) {
  const fullPath = path.join(__dirname, componentPath);
  fs.readFile(fullPath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error loading component:', componentPath, err);
      return;
    }
    const targetElement = document.getElementById(targetElementId);
    if (targetElement) {
      targetElement.innerHTML = data;
      console.log(`Loaded component: ${componentPath} into ${targetElementId}`); // Log message
      if (callback) callback();
    } else {
      console.error(`Target element ${targetElementId} not found`);
    }
  });
}

// Função para carregar a barra lateral
function loadSidebar() {
  loadComponent('src/components/sidebar.html', 'sidebar', attachSidebarEvents);
}

// Função para anexar eventos à barra lateral
function attachSidebarEvents() {
  const linkHome = document.getElementById('linkHome');
  const linkTickets = document.getElementById('linkTickets');
  const linkCreateTicket = document.getElementById('linkCreateTicket');

  if (linkHome) {
    linkHome.addEventListener('click', () => {
      console.log('Home link clicked'); // Log message
      loadHome();
    });
  } else {
    console.error('Home link not found');
  }

  if (linkTickets) {
    linkTickets.addEventListener('click', () => {
      console.log('Tickets link clicked'); // Log message
      loadTickets();
    });
  } else {
    console.error('Tickets link not found');
  }

  if (linkCreateTicket) {
    linkCreateTicket.addEventListener('click', () => {
      console.log('Create Ticket link clicked'); // Log message
      loadCreateTicket();
    });
  } else {
    console.error('Create Ticket link not found');
  }
}

// Função para carregar a seção Home
function loadHome() {
  const ticketComponents = document.getElementById('ticketComponents');
  if (ticketComponents) {
    ticketComponents.innerHTML = '<h2 class="text-primary">Welcome to the Helpdesk System</h2>';
  } else {
    console.error('Ticket components element not found');
  }
}

// Função para carregar a seção de tickets
function loadTickets() {
  loadComponent('src/components/ticketsList.html', 'ticketComponents');
}

// Função para carregar o formulário de criação de ticket
function loadCreateTicket() {
  loadComponent('src/components/createTicketForm.html', 'ticketComponents', attachCreateTicketEvent);
}

// Função para anexar evento ao formulário de criação de ticket
function attachCreateTicketEvent() {
  const createTicketForm = document.getElementById('createTicketForm');
  if (createTicketForm) {
    createTicketForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Create ticket form submitted'); // Log message
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const token = getAuthToken();

      try {
        await axios.post(`${BASE_URL}/tickets`, { title, description, status: 'open', priority: 'low', customer_id: 1 }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        alert('Ticket created successfully');
        createTicketForm.reset();
        loadTickets();
      } catch (error) {
        console.error('Error creating ticket:', error);
        alert('Failed to create ticket');
      }
    });
  } else {
    console.error('Create ticket form not found');
  }
}

// Função para adicionar evento de login após o componente de login ser carregado
function attachLoginEvent() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    console.log('Login form found, attaching submit event'); // Log message
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Login form submitted'); // Log message
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await axios.post(`${BASE_URL}/users/login`, { email, password });
        const token = response.data.token;
        localStorage.setItem('authToken', token);
        checkAuth();
      } catch (error) {
        console.error('Error logging in:', error);
        alert('Login failed');
      }
    });
  } else {
    console.log('Login form not found'); // Log message
  }
}

// Evento de logout
function attachLogoutEvent() {
  const logoutButton = document.getElementById('logout');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      checkAuth();
    });
  } else {
    console.error('Logout button not found');
  }
}

// Verifica o estado de autenticação ao carregar a página
window.onload = () => {
  console.log('Window loaded, checking authentication'); // Log message
  checkAuth();
  attachLogoutEvent();
};
