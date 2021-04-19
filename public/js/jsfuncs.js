/* eslint-disable */

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

export const showInfoModal = text => {
  const modalId = '#infoModal';
  const textID = '#infoModalText';
  //true if modal is open
  if ($(textID).html().length) {
    const oldText = $(textID).html();
    const newText = oldText + '<br/><br/>' + text;
    $(textID).html(newText);
  } else {
    $(modalId).off();
    $(modalId).on('show.coreui.modal', function(event) {
      $(textID).html(text);
    });
    $(modalId).on('hide.coreui.modal', function(event) {
      $(textID).html('');
    });
    $(modalId).modal('show');
  }
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

//use name attr to fill form
export const fillFormByName = (formId, find, data, reset) => {
  if (reset && $(formId)[0] && $(formId)[0].reset) $(formId)[0].reset();
  const formValues = $(formId).find(find);
  for (var k = 0; k < formValues.length; k++) {
    const nameAttr = $(formValues[k]).attr('name');
    const radioCheck = $(formValues[k]).is(':radio');
    const checkboxCheck = $(formValues[k]).is(':checkbox');
    // if select-text-opt class is found, select dropdown options based on text of the options
    const isSelectTextOpt = $(formValues[k]).hasClass('select-text-opt');
    // if selectized
    const isSelectized = $(formValues[k]).hasClass('selectized');
    if (data[nameAttr]) {
      if (radioCheck) {
        if (data[nameAttr] == $(formValues[k]).val()) {
          $(formValues[k]).attr('checked', true);
        }
      } else if (checkboxCheck) {
        if (
          data[nameAttr] == $(formValues[k]).val() ||
          data[nameAttr] === true ||
          data[nameAttr] === 'true'
        ) {
          $(formValues[k]).attr('checked', true);
        } else {
          $(formValues[k]).attr('checked', false);
        }
      } else {
        if (data[nameAttr] === 'on') {
          $(formValues[k]).attr('checked', true);
        } else {
          if (isSelectTextOpt) {
            const item = $(formValues[k])
              .find('option')
              .filter(function() {
                return $(this).html() == data[nameAttr];
              })
              .val();
            if (item) $(formValues[k]).val(item);
          } else if (isSelectized) {
            $(formValues[k])[0].selectize.setValue(data[nameAttr], false);
          } else {
            $(formValues[k]).val(data[nameAttr]);
          }
        }
      }
    }
  }
};
