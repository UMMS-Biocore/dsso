/* eslint-disable */
import '@babel/polyfill';
import { loadLoginDiv, logout } from './login';
import { updateSettings } from './updateSettings';
import { showAlert } from './alerts';
suimport { createFormObj } from './funcs';

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
  $('#loginOuterDiv').on('click', '#registerBackBtn', function(e) {
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
      'verifypassword'
    ];
    const [formObj, stop] = createFormObj(formValues, requiredFields, true);
    console.log(formObj);
    console.log(stop);
    if (stop === false) {
      formObj.p = 'saveUserManual';
    }
    // try {
    //   const res = await axios({
    //     method: 'POST',
    //     url: '/login',
    //     data: {
    //       username: email_or_username,
    //       password
    //     }
    //   });

    //   if (res.data.status === 'success') {
    //   }
    // } catch (err) {
    //   showAlert('error', err.response.data.message);
    // }

    // $.ajax({
    //   type: 'POST',
    //   url: 'ajax/ajaxquery.php',
    //   data: formObj,
    //   async: true,
    //   success: function(s) {
    //     console.log(s);
    //   },
    //   error: function(errorThrown) {
    //     alert('Error: ' + errorThrown);
    //   }
    // });
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

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
