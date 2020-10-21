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
  <div class="text-center" style="margin-top:30%;">Don't have an account <button type="submit" name="signup" id="signupBtn" class="btn btn-light" style="margin-left:10px;">Sign Up</button>
  </div>
</div>`;

  loginDivs.registerDiv = `<div class="body bg-white" style=" border-radius:5px; padding:30px;"
  <form>
  <div class="body bg-white" style=" border-radius:5px;">
      <div style="margin:auto; height:80px; padding-top:20px;">
        <h2 class="text-center">Sign Up</h2>
      </div>
      <div class="text-center form-group">
        <div>
          <input type="text" name="firstname" class="form-control" placeholder="First name" maxlength="25" value="">
        </div>
      </div>
      <div class="text-center form-group">
        <div>
          <input type="text" name="lastname" class="form-control" placeholder="Last name" maxlength="20" value="">
        </div>
      </div>
      <div class="text-center form-group">
        <div>
          <input type="text" name="username" class="form-control" placeholder="Username" maxlength="45" value="">
        </div>
      </div>
      <div class="text-center form-group">
        <div>
          <input type="text" name="email" class="form-control" maxlength="45" placeholder="Email" value="">
        </div>                
      </div>                
      <div class="text-center form-group">
        <div>
          <input type="text" maxlength="45" name="institute" class="form-control" placeholder="Institute" value="">
        </div>
      </div>
      <div class="text-center form-group">
        <div>
          <input type="text" name="lab" class="form-control" placeholder="Lab/Department" maxlength="45" value="">
        </div>
      </div>
      <div class="text-center form-group">
        <div>
          <input type="password" name="password" class="form-control password" placeholder="Password" value="">
        </div>
      </div>
      <div class="text-center form-group">
        <div>
          <input type="password" name="verifypassword" class="form-control password" placeholder="Verify Password" value="">
        </div>
      </div>
      <div class="text-center form-group" style="margin-top:10%;">
          <button id="registerBtn" type="submit" name="request" class="btn btn-info btn-block">Submit Request</button>
          <button id="registerBackBtn" type="submit" name="ok" class="btn btn-light btn-block">Back</button>
      </div>
  </div>
</form>
</div>`;

  if (loginDivs[divID]) {
    $('#loginOuterDiv').html(loginDivs[divID]);
  }
};
