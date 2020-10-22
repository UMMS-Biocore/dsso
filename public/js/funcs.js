const $ = require('jquery');

// creates object of the form fields and change color of requiredFields
// if warn set to true, 'Please provide a valid information.' information will be added to field
export const createFormObj = (formValues, requiredFields, warn) => {
  var formObj = {};
  var stop = false;
  for (var i = 0; i < formValues.length; i++) {
    var name = $(formValues[i]).attr('name');
    var type = $(formValues[i]).attr('type');
    var val = '';
    if (type == 'radio') {
      for (var k = 0; k < formValues.length; k++) {
        if ($(formValues[k]).attr('name')) {
          if ($(formValues[k]).attr('name') == name && $(formValues[k]).is(':checked')) {
            val = $(formValues[k]).val();
            break;
          }
        }
      }
    } else if (type == 'checkbox') {
      if ($(formValues[i]).is(':checked')) {
        val = 'on';
      }
    } else {
      val = $(formValues[i]).val();
    }
    if (requiredFields.includes(name)) {
      if (val != '') {
        $(formValues[i]).removeClass('is-invalid');
        if (warn && $(formValues[i]).next('div.invalid-feedback').length == 1) {
          $(formValues[i])
            .next('div.invalid-feedback')
            .remove();
        }
      } else {
        $(formValues[i]).addClass('is-invalid');
        if (warn && $(formValues[i]).next('div.invalid-feedback').length == 0) {
          $(formValues[i]).after(
            '<div class="invalid-feedback text-left">Please provide a valid information.</div>'
          );
        }
        stop = true;
      }
    }
    formObj[name] = val;
  }
  return [formObj, stop];
};

export const showFormError = (formValues, errorFields, warn) => {
  console.log(errorFields);
  if (errorFields) {
    for (var i = 0; i < formValues.length; i++) {
      var name = $(formValues[i]).attr('name');
      if (name in errorFields) {
        $(formValues[i]).addClass('is-invalid');
        if (errorFields[name]['message'] && warn) {
          const errorText = errorFields[name]['message'];
          if ($(formValues[i]).next('div.invalid-feedback').length == 0) {
            $(formValues[i]).after(`<div class="invalid-feedback text-left">${errorText}</div>`);
          } else {
            $(formValues[i])
              .next('div.invalid-feedback')
              .remove()
              .after(`<div class="invalid-feedback text-left">${errorText}</div>`);
          }
        }
      }
    }
  }
};
