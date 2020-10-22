/* eslint-disable */
import '@babel/polyfill';
import { loadLoginDiv, logout } from './login';
import { updateSettings } from './updateSettings';
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

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
