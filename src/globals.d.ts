type Job = {
  jobName: string;
  jobUrl: string;
};

type Build = Job & {
  params: Record<string, string>;
};
