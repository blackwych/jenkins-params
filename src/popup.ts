type Formatter = (build: Build) => string;

const formatter: Record<string, Formatter> = {
  'slack': formatForSlack,
  'build-params': formatForBuildParams,
};

async function fetchBuild(tabId: number): Promise<Build | undefined> {
  try {
    const build = await chrome.tabs.sendMessage(tabId, 'GET_BUILD');
    return isBuild(build) ? build : undefined;
  } catch (e) {
    console.error(e);
    return undefined
  }
}

function isBuild(build: unknown): build is Build {
  return (
    typeof build === 'object' &&
    build !== null &&
    'jobName' in build &&
    'jobUrl' in build &&
    'params' in build
  );
}

function getBuildParamUrl({ jobUrl, params }: Build): URL {
  const url = new URL(`${jobUrl}/parambuild`);

  for (const [k, v] of Object.entries(params)) {
    url.searchParams.append(k, v);
  }

  return url;
}

function formatForSlack(build: Build): string {
  const { jobName, jobUrl, params } = build;

  const lines = [
    `*[${jobName}]* ([Job](${jobUrl})\\)`,
  ];

  if (Object.keys(params).length > 0) {
    lines.push(
      '',
      getBuildParamUrl(build).toString(),
      '```',
      ...Object.entries(params).map(([k, v]) => (
        v.includes('\n')
          ? `- ${k}:\n${v}\n`
          : `- ${k}: ${v}`
      )),
      '```',
    );
  }

  return lines.join('\n');
}

function formatForBuildParams(build: Build): string {
  const { jobUrl, params } = build;

  if (jobUrl === '(unknown)') {
    return '(unknown)';
  }

  return getBuildParamUrl(build).toString();
}

document.addEventListener('DOMContentLoaded', async (): Promise<void> => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) {
    return;
  }

  const build = await fetchBuild(tab.id);

  const tabs = document.querySelectorAll<HTMLButtonElement>('.tab');
  const tabContents = document.querySelectorAll<HTMLDivElement>('.tab-content');
  const spanCopied = document.querySelector<HTMLSpanElement>('#copied')!;
  const btnCopy = document.querySelector<HTMLButtonElement>('#btn-copy')!;

  function switchTab(targetId: string): void {
    tabs.forEach((tab) => {
      tab.classList.toggle('selected', tab.dataset.targetId === targetId);
    });

    tabContents.forEach((tabContent) => {
      tabContent.classList.toggle('selected', tabContent.id === targetId);
    });

    spanCopied.classList.remove('visible');
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.targetId!));
  });

  tabContents.forEach((tabContent) => {
    tabContent.textContent = isBuild(build) ? formatter[tabContent.id](build) : '(unknown)';
  });

  btnCopy.addEventListener('click', async () => {
    const summary = Array.from(tabContents)
      .find((tabContent) => tabContent.classList.contains('selected'))
      ?.textContent;

    if (summary) {
      await navigator.clipboard.writeText(summary);
      spanCopied.classList.add('visible');
    }
  });

  switchTab(tabContents[0].id);
});
