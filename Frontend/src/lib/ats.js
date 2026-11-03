// Lightweight ATS scoring used by the dashboard and the builder preview.
// It mirrors the factor list used on the marketing homepage.

const ACTION_VERBS = [
  'led', 'built', 'designed', 'implemented', 'increased', 'reduced', 'achieved',
  'managed', 'developed', 'created', 'launched', 'optimized', 'delivered',
  'improved', 'automated', 'coordinated', 'mentored', 'analyzed', 'negotiated',
  'streamlined', 'spearheaded', 'grew', 'saved', 'cut', 'owned', 'shipped',
];

const textOf = (value) => (typeof value === 'string' ? value : '');

export function collectResumeText(resume = {}) {
  const parts = [
    textOf(resume.summary),
    ...(resume.experiences || []).flatMap((experience) => [
      textOf(experience.description),
      ...(experience.bullets || []).map(textOf),
    ]),
    ...(resume.projects || []).flatMap((project) => [
      textOf(project.description),
      ...(project.bullets || []).map(textOf),
    ]),
  ];
  return parts.join(' ').trim();
}

export function computeAtsChecks(resume = {}) {
  const experienceText = (resume.experiences || [])
    .flatMap((experience) => [textOf(experience.description), ...(experience.bullets || []).map(textOf)])
    .join(' ')
    .trim();

  const projectText = (resume.projects || [])
    .flatMap((project) => [textOf(project.description), ...(project.bullets || []).map(textOf)])
    .join(' ')
    .trim();

  const achievementText = `${experienceText} ${projectText}`.trim();
  const startsWithVerb = achievementText
    .split(/[.;\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .some((part) => ACTION_VERBS.some((verb) => part.toLowerCase().startsWith(verb)));

  return [
    {
      id: 'contact',
      label: 'Contact details are complete',
      weight: 18,
      passed: Boolean(textOf(resume.full_name).trim() && textOf(resume.email).trim() && textOf(resume.phone).trim()),
    },
    {
      id: 'summary',
      label: 'Has a role-specific summary',
      weight: 14,
      passed: textOf(resume.summary).trim().length > 60,
    },
    {
      id: 'verbs',
      label: 'Bullets start with action verbs',
      weight: 18,
      passed: startsWithVerb,
    },
    {
      id: 'numbers',
      label: 'Achievements include numbers',
      weight: 22,
      passed: /\d/.test(achievementText),
    },
    {
      id: 'skills',
      label: 'Skills match the job description',
      weight: 16,
      passed: (resume.skills || []).length >= 4,
    },
    {
      id: 'format',
      label: 'Parses cleanly through ATS',
      weight: 12,
      passed: (resume.experiences || []).length >= 1 && (resume.educations || []).length >= 1,
    },
  ];
}

export function computeAtsScore(resume = {}) {
  const checks = computeAtsChecks(resume);
  const score = checks.reduce((total, check) => total + (check.passed ? check.weight : 0), 0);
  const rating =
    score >= 90 ? 'Excellent' : score >= 75 ? 'Strong' : score >= 60 ? 'Fair' : 'Needs work';
  return { score, checks, rating };
}
