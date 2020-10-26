/* eslint-disable */
import axios from 'axios';
const $ = require('jquery');

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });
    if ((res.data.status = 'success')) location.assign('/');
  } catch (err) {
    console.log(err.response);
    console.log('error', 'Error logging out! Try again.');
  }
};

export const loadLoginDiv = divID => {
  let loginDivs = {};
  loginDivs.loginDiv = `<div class="body bg-white" style=" border-radius:5px; padding:30px;">
  <form action="/login" method="post">
   <div style="margin:auto; height:80px; padding-top:20px;">
       <h2 class="text-center">SSO Log In</h2>
   </div>
   <div style="margin:auto; width:50%;  height:100px; padding-top:20px; padding-left:30px;">
    <a href="/auth/google" class="btn btn-info"><i class="fa fa-pencil" aria-hidden="true"></i> Sign In with Google</a>
   </div>                    
   <div class="form-group" style="margin-top:20px;">
       <input name="username" class="form-control" placeholder="E-mail/Username" required>
   </div>
   <div class="form-group">
       <input type="password" name="password" class="form-control" placeholder="Password" minlength='6' required>
   </div>
   <div class="footer">
       <button type="submit" name="login" class="btn btn-info" style="float:right;">Login</button>
   </div>
  </form>
  
</div>`;

  /* <div class="text-center" style="margin-top:30%;">Don't have an account <button type="submit" name="signup" id="signupBtn" class="btn btn-light" style="margin-left:10px;">Sign Up</button>
  </div> */

  loginDivs.registerDiv = `<div class="body bg-white" style=" border-radius:5px; padding:30px;"
  <form>
  <div class="body bg-white" style=" border-radius:5px;">
      <div style="margin:auto; height:80px; padding-top:20px;">
        <h2 class="text-center">Sign Up</h2>
      </div>
      <div class="text-center form-group">
        <div>
          <input type="text" name="firstname" class="form-control" placeholder="First name" maxlength="25" value="" required>
        </div>
      </div>
      <div class="text-center form-group">
        <div>
          <input type="text" name="lastname" class="form-control" placeholder="Last name" maxlength="20" value="" required>
        </div>
      </div>
      <div class="text-center form-group">
        <div>
          <input type="text" name="username" class="form-control" placeholder="Username" maxlength="45" value="" required>
        </div>
      </div>
      <div class="text-center form-group">
        <div>
          <input type="email" name="email" class="form-control" maxlength="45" placeholder="Email" value="" required>
        </div>                
      </div>                
      <div class="text-center form-group">
        <div>
          <input type="text" maxlength="45" name="institute" class="form-control" placeholder="Institute" required>
        </div>
      </div>
      <div class="text-center form-group">
        <div>
          <input type="text" name="lab" class="form-control" placeholder="Lab/Department" maxlength="45" value="">
        </div>
      </div>
      <div class="text-center form-group">
        <div>
          <input type="password" name="password" class="form-control password" placeholder="Password" required>
        </div>
      </div>
      <div class="text-center form-group">
        <div>
          <input type="password" name="passwordConfirm" class="form-control password" placeholder="Verify Password"  required>
        </div>
      </div>
      <div class="text-center form-group" style="margin-top:10%;">
          <button id="registerBtn" type="submit" name="request" class="btn btn-info btn-block">Submit Request</button>
          <button type="submit" name="ok" class="signInBackBtn btn btn-light btn-block">Back</button>
      </div>
  </div>
</form>
</div>`;

  loginDivs.successSignUpDiv = `
  <div class="body bg-white" style=" border-radius:5px; padding:30px;">
    <div style="margin:auto; height:80px; padding-top:20px;">
        <h2 class="text-center">Confirm your email address</h2>
    </div>
    <div class="text-center form-group">
      <p> We have sent an email with a confirmation link to your email address. In order to complete the sign-up process, please click the confirmation link.</p>
    </div>
    <div class="text-center form-group">
      <p> If you do not receive a confirmation email, please check your spam folder.</p>
    </div>
    <div class="text-center form-group" style="margin-top:10%;">
      <button type="submit" name="ok" class="signInBackBtn btn btn-info btn-block">OK</button>
    </div>
  </div>`;

  if (loginDivs[divID]) {
    $('#loginOuterDiv').html(loginDivs[divID]);
  }
};
