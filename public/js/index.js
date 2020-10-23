/* eslint-disable */
import '@babel/polyfill';
import { loadLoginDiv, logout } from './login';
import { createFormObj, showFormError } from './funcs';
import axios from 'axios';

const $ = require('jquery');
// require('popper.js');
// require('pace');
// require('perfect-scrollbar');
// require('@coreui/coreui');
// require('chart.js');

// DOM ELEMENTS
const loginForm = document.querySelector('#loginOuterDiv');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

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
