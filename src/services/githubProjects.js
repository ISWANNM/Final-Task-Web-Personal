const repositories = [
  { name: "WebpersonalExpressJs", branch: "master" },
  { name: "appnote", branch: "main" },
  { name: "appbook", branch: "main" },
  { name: "Sistem_Keuangan", branch: "master" },
];

const cacheDuration = 5 * 60 * 1000;
let cachedProjects;
let cacheExpiresAt = 0;

export const getGithubProjects = async () => {
  if (cachedProjects && Date.now() < cacheExpiresAt) {
    return cachedProjects;
  }

  const projects = await Promise.all(
    repositories.map(async ({ name, branch }) => {
      const response = await fetch(`https://api.github.com/repos/ISWANNM/${name}`, {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`GitHub returned ${response.status} for repository ${name}`);
      }

      const repository = await response.json();

      return {
        title: repository.name.replaceAll("_", " "),
        description: repository.description || "Source code tersedia di GitHub.",
        project_link: `https://github.com/ISWANNM/${name}/tree/${branch}`,
        branch,
        tech_stack: repository.language ? [repository.language] : [],
      };
    })
  );

  cachedProjects = projects;
  cacheExpiresAt = Date.now() + cacheDuration;

  return projects;
};
