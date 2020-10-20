/* eslint-disable */
import axios from 'axios';
const $ = require('jquery');
import { showAlert } from './alerts';

// export const login = async (email_or_username, password) => {
//   try {
//     const res = await axios({
//       method: 'POST',
//       url: '/login',
//       data: {
//         username: email_or_username,
//         password
//       }
//     });

//     if (res.data.status === 'success') {
//       showAlert('success', 'Logged in successfully!');
//       window.setTimeout(() => {
//         location.assign('/');
//       }, 1500);
//     }
//   } catch (err) {
//     showAlert('error', err.response.data.message);
//   }
// };

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });
    if ((res.data.status = 'success')) location.assign('/');
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};

export const loadLoginDiv = divID => {
  let loginDivs = {};
  loginDivs.loginDiv = `<div class="body bg-white" style=" border-radius:5px; padding:30px;">
  <form action="/login" method="post">
   <div style="margin:auto; height:80px; padding-top:20px;">
       <h2 class="text-center">Log In</h2>
   </div>
   <div style="margin:auto; width:50%;  height:100px; padding-top:20px;">Signed in with Google</div>                    
   <div class="form-group" style="margin-top:20px;">
       <input id="username" name="username" class="form-control" placeholder="E-mail/Username">
   </div>
   <div class="form-group">
       <input type="password" id="password" name="password" class="form-control" placeholder="Password" minlength='6'>
   </div>
   <div class="footer">
       <button type="submit" name="login" class="btn btn-info" style="float:right;">Login</button>
   </div>
</form>
     <form action="http://localhost:8080/dolphinnext/" method="post">      
      <div class="text-center" style="margin-top:30%;">Don't have an account <button type="submit" name="signup" class="btn btn-light" style="margin-left:10px;">Sign Up</button></div>                </form>
</div>`;

  loginDivs.registerDiv = `
<div class="card-body p-4">
  <h1>Register</h1>
  <p class="text-muted">Create your account</p>
  <div class="input-group mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text">
        <svg class="c-icon"><use xlink:href="vendors/@coreui/icons/svg/free.svg#cil-user"></use></svg>
      </span>
    </div>
    <input class="form-control" type="text" placeholder="Username">
  </div>
  <div class="input-group mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text">
        <svg class="c-icon"><use xlink:href="vendors/@coreui/icons/svg/free.svg#cil-envelope-open"></use></svg>
      </span>
    </div>
    <input class="form-control" type="text" placeholder="Email">
  </div>
  <div class="input-group mb-3">
    <div class="input-group-prepend">
      <span class="input-group-text">
        <svg class="c-icon"><use xlink:href="vendors/@coreui/icons/svg/free.svg#cil-lock-locked"></use></svg>
      </span>
    </div>
    <input class="form-control" type="password" placeholder="Password">
  </div>
  <div class="input-group mb-4">
    <div class="input-group-prepend">
      <span class="input-group-text"><svg class="c-icon"><use xlink:href="vendors/@coreui/icons/svg/free.svg#cil-lock-locked"></use></svg></span>
    </div>
    <input class="form-control" type="password" placeholder="Repeat password">
  </div>
  <button class="btn btn-block btn-success" type="button">Create Account</button>
  </div>`;

  if (loginDivs[divID]) {
    $('#loginOuterDiv').html(loginDivs[divID]);
  }
};
