//
// Copyright (c) 2017 Blackwych. All rights reserved.
// Licensed under the MIT License. See LICENSE file for full license information.
//

// [Note]
//
// There are two patterns of parameter field structure:
//
// ```
// <div class="setting-name">...</div>
// <div class="setting-main">
//   ...
//   <input ...>
//   ...
// </div>
// ```
//
// and
//
// ```
// <div class="setting-main">
//  ...
//  <input type="checkbox" ...>
//  <label>...</label>
// </div>
// ```

function getFirstText(e) {
  return e && e.firstChild && e.firstChild.nodeName === '#text' ? e.firstChild.data : null;
}

function detectKey(e) {
  return (
    getFirstText(e.parentElement.querySelector('.jenkins-form-label')) ||
    getFirstText(e.parentElement.querySelector('.setting-name')) ||
    getFirstText(e.querySelector('label')) ||
    '(unknown)'
  );
}

function detectValue(e) {
  var input = e.querySelector('input:not([type="hidden"]),textarea,select');

  if (!input) {
    return '(unknown)'
  }

  switch (input.tagName.toLowerCase()) {
  case 'input':
    switch (input.type.toLowerCase()) {
    case 'checkbox':
      return input.checked ? 'true' : 'false';
    default:
      return input.value;
    }
    break;
  case 'textarea':
  case 'select':
    return input.value;
  default:
    return '(unknown)';
  }
}

function capture() {
  var elements = document.querySelectorAll('.setting-main');

  if (elements.length == 0) {
    browser.runtime.sendMessage(null);
    return;
  }

  var jobUrl = location.href.replace(/^(.*\/job\/[^\/]+).*$/, '$1');
  var jobName = jobUrl.split('/').slice(-1)[0];

  var params = {};
  elements.forEach(function (e) {
    var key = detectKey(e), value = detectValue(e);
    if (key !== null && value !== null) {
      params[key] = value;
    }
  });

  var data = {
    jobName: jobName,
    jobUrl: jobUrl,
    params: params,
  };

  browser.runtime.sendMessage(data);
}

browser.runtime.onMessage.addListener(capture);
