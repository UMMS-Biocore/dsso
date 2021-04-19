/* eslint-disable */
import '@babel/polyfill';
import { loadLoginDiv, logout } from './login';
import { createFormObj, showFormError } from './jsfuncs';
import { getProfileNavbar, loadProfileTabContent } from './profile.js';

import axios from 'axios';
import 'jquery';
import '@coreui/coreui';
require('datatables.net'); // Datatables Core
require('datatables.net-bs4/js/dataTables.bootstrap4.js'); // Datatables Bootstrap 4
require('datatables.net-bs4/css/dataTables.bootstrap4.css'); // Datatables Bootstrap 4
require('datatables.net-colreorder');
require('datatables.net-colreorder-bs4');
require('jquery-datatables-checkboxes');
require('selectize/dist/js/selectize.js');
require('selectize/dist/css/selectize.bootstrap3.css');

import './../vendors/@coreui/icons/css/free.min.css';
import './../vendors/@coreui/icons/css/flag.min.css';
import './../vendors/@coreui/icons/css/brand.min.css';

// GLOBAL ENV CONFIG
const envConf = document.querySelector('#session-env-config');
const userRole = envConf && envConf.getAttribute('role');

// DOM ELEMENTS
const loginForm = document.querySelector('#loginOuterDiv');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const allProfileNav = document.querySelector('#allProfileNav');

if (loginForm) {
  loadLoginDiv('loginDiv');
  $('#loginOuterDiv').on('click', '#signupBtn', function(e) {
    e.preventDefault();
    loadLoginDiv('registerDiv');
  });
  $('#loginOuterDiv').on('click', '.signInBackBtn', function(e) {
    e.preventDefault();
    loadLoginDiv('loginDiv');
  });
  $('#loginOuterDiv').on('click', '#registerBtn', async function(e) {
    e.preventDefault();
    var formValues = $('#loginOuterDiv').find('input');
    var requiredFields = [
      'firstname',
      'lastname',
      'username',
      'email',
      'institute',
      'lab',
      'password',
      'passwordConfirm'
    ];
    const [formObj, stop] = createFormObj(formValues, requiredFields, true);
    console.log(formObj);
    console.log(stop);
    if (stop === false) {
      try {
        const res = await axios({
          method: 'POST',
          url: '/api/v1/users/signup',
          data: formObj
        });

        if (res && res.data && res.data.status === 'success') {
          console.log('success');
          loadLoginDiv('successSignUpDiv');
        }
      } catch (e) {
        console.log(e.response);
        if (e.response && e.response.data && e.response.data.error) {
          const errors = e.response.data.error.errors;
          showFormError(formValues, errors, true);
        }
      }
    }
  });
}

// loginForm.addEventListener('submit', e => {
//   e.preventDefault();
//   const email_or_username = document.getElementById('username').value;
//   const password = document.getElementById('password').value;
//   login(email_or_username, password);
// });

// if (logOutBtn) logOutBtn.addEventListener('click', logout);

(async () => {
  if (allProfileNav) {
    const profileNavbar = await getProfileNavbar(userRole);
    $('#allProfileNav').append(profileNavbar);
    loadProfileTabContent(userRole);
  }
})();
