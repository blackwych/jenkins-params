//
// Copyright (c) 2017-2025 Blackwych. All rights reserved.
// Licensed under the MIT License. See LICENSE file for full license information.
//

// [Note]
//
// There are several patterns of parameter field structure:
//
// ```
// <div class="jenkins-form-item">...</div>
// <div class="setting-main">
//   ...
//   <input ...>
//   ...
// </div>
// ```
// ```
// <div class="setting-name">...</div>
// <div class="setting-main">
//   ...
//   <input ...>
//   ...
// </div>
// ```
// ```
// <div class="setting-main">
//  ...
//  <input type="checkbox" ...>
//  <label>...</label>
// </div>
// ```

const unknown = '(unknown)';

function getJob(url: string): Job {
  const match = url.match(new RegExp('^.*/job/([^/]+)'));
  if (!match) {
    return { jobName: unknown, jobUrl: unknown };
  }

  const [jobUrl, jobName] = match;
  return { jobName, jobUrl };
}

function getFieldName(field: Element): string {
  return (
    field.parentElement?.querySelector('.jenkins-form-label, .setting-name')?.textContent ||
    field.querySelector('label')?.textContent ||
    unknown
  );
}

function getFieldValue(field: Element): string {
  const input = field.querySelector('input:not([type="hidden"], textarea, select');

  if (input instanceof HTMLInputElement) {
    switch (input.type.toLowerCase()) {
      case'checkbox':
        return input.checked ? 'true' : 'false';
      default:
        return input.value;
    }
  }

  if (input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement) {
    return input.value;
  }

  return unknown;
}

function getBuild(): Build {
  const { jobName, jobUrl } = getJob(location.href);

  const fields = document.querySelectorAll('.setting-main');

  const params: Record<string, string> = {};
  fields.forEach((field) => {
    const name = getFieldName(field);
    const value = getFieldValue(field);

    params[name] = value;
  });

  return { jobName, jobUrl, params };
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  switch (String(message)) {
    case 'GET_BUILD':
      sendResponse(getBuild());
      break;
    default:
      console.error('Unexpected message: ', message);
      break;
  }
});
