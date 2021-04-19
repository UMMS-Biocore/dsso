/* eslint-disable */

//
export const getFormRow = (element, label, settings) => {
  let required = '';
  let description = '';
  let hide = '';
  if (settings && settings.required) {
    required = '<span style="color:red";>*</span>';
  }
  if (settings && settings.hidden) return '';
  if (settings && settings.hide) hide = `style="display:none;"`;
  let ret = `
      <div class="form-group row" ${hide}>
          <label class="col-md-3 col-form-label text-right">${label}${required}</label>
          <div class="col-md-9">
              ${element}
          </div>
      </div>`;
  return ret;
};
