import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  GraduationCap,
  Lightbulb,
  Loader2,
  Plus,
  Printer,
  Sparkles,
  Trash2,
  User,
  WandSparkles,
  Briefcase,
  Wrench,
  FolderGit2,
  Check,
} from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import {
  apiFetch,
  createResumeSection,
  deleteResumeSection,
  getResume,
  rewriteBullet,
  suggestSkills,
  updateResumeSection,
} from '../api';
import { fonts } from '../data/fonts';
import { getTemplate } from '../data/templates';
import { getResumePreferences, setDefaultPreferences, setResumePreferences } from '../lib/prefs';
import { computeAtsScore } from '../lib/ats';
import { printResume } from '../lib/printResume';
import ResumePreview, { PAGE_WIDTH } from './ResumePreview';
import { TemplateRail } from './TemplatePicker';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100';

const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500';

const emptyResume = {
  full_name: '',
  email: '',
  phone: '',
  summary: '',
  experiences: [],
  educations: [],
  skills: [],
  projects: [],
};

export default function ResumeForm({
  onResumeCreated,
  onCancel,
  initialData,
  initialTemplateId,
  initialFontId,
}) {
  const { token } = useAuth();

  const initialPrefs = useMemo(
    () => getResumePreferences(initialData?.id),
    [initialData?.id],
  );

  const [formData, setFormData] = useState(
    initialData
      ? {
          ...initialData,
          experiences: initialData.experiences || [],
          educations: initialData.educations || [],
          skills: initialData.skills || [],
          projects: initialData.projects || [],
        }
      : emptyResume,
  );

  // Design + profile details that the API does not own (kept client side).
  const [meta, setMeta] = useState({
    role: initialPrefs.role || '',
    location: initialPrefs.location || '',
    photo: initialPrefs.photo || '',
  });
  const [templateId, setTemplateId] = useState(
    initialTemplateId || initialPrefs.templateId || 'honeycomb',
  );
  const [fontId, setFontId] = useState(initialFontId || initialPrefs.fontId || 'inter');

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [skillPrompt, setSkillPrompt] = useState('');
  const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);
  const [rewritingIndex, setRewritingIndex] = useState(null);
  const [zoom, setZoom] = useState('fit');

  const template = getTemplate(templateId);
  const previewData = useMemo(() => ({ ...formData, ...meta }), [formData, meta]);
  const { score, checks, rating } = useMemo(() => computeAtsScore(previewData), [previewData]);

  // Persist design choices so they survive a refresh
  useEffect(() => {
    setDefaultPreferences({ templateId, fontId });
    if (initialData?.id) setResumePreferences(initialData.id, { templateId, fontId });
  }, [templateId, fontId, initialData?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleMetaChange = (e) => {
    const { name, value } = e.target;
    setMeta((current) => {
      const next = { ...current, [name]: value };
      if (initialData?.id) setResumePreferences(initialData.id, next);
      return next;
    });
  };

  const addExperience = () =>
    setFormData((current) => ({
      ...current,
      experiences: [...current.experiences, { company: '', role: '', years: 1, description: '', bullets: [] }],
    }));

  const updateExperience = (index, field, value) =>
    setFormData((current) => ({
      ...current,
      experiences: current.experiences.map((experience, experienceIndex) =>
        experienceIndex === index ? { ...experience, [field]: value } : experience,
      ),
    }));

  const removeExperience = (index) =>
    setFormData((current) => ({
      ...current,
      experiences: current.experiences.filter((_, experienceIndex) => experienceIndex !== index),
    }));

  const updateCollection = (collection, index, field, value) =>
    setFormData((current) => ({
      ...current,
      [collection]: current[collection].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));

  const addCollectionItem = (collection, item) =>
    setFormData((current) => ({ ...current, [collection]: [...current[collection], item] }));

  const removeCollectionItem = (collection, index) =>
    setFormData((current) => ({
      ...current,
      [collection]: current[collection].filter((_, itemIndex) => itemIndex !== index),
    }));

  const suggestSkillList = async () => {
    if (skillPrompt.trim().length < 2) {
      setError('Enter a job title first.');
      return;
    }
    setIsSuggestingSkills(true);
    setError('');
    try {
      const result = await suggestSkills({ job_title: skillPrompt }, token);
      const suggested = Object.entries(result.suggested_skills || {}).flatMap(([category, names]) =>
        names.map((name) => ({ category, name })),
      );
      setFormData((current) => ({
        ...current,
        skills: [
          ...current.skills,
          ...suggested.filter(
            (item) =>
              !current.skills.some(
                (skill) =>
                  skill.category?.toLowerCase() === item.category.toLowerCase() &&
                  skill.name?.toLowerCase() === item.name.toLowerCase(),
              ),
          ),
        ],
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSuggestingSkills(false);
    }
  };

  const rewriteExperienceBullet = async (index) => {
    const experience = formData.experiences[index];
    const bullet = experience.bullets?.[0] || experience.description;
    if (!bullet || bullet.length < 3) {
      setError('Add a bullet or description before rewriting it.');
      return;
    }
    setRewritingIndex(index);
    setError('');
    try {
      const result = await rewriteBullet(
        { bullet, role: experience.role, company: experience.company },
        token,
      );
      if (result.variants?.[0]) updateExperience(index, 'description', result.variants[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setRewritingIndex(null);
    }
  };

  const generateAISummary = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const data = await apiFetch(
        '/ai/generate-summary',
        {
          method: 'POST',
          body: JSON.stringify({
            full_name: formData.full_name || 'the user',
            experiences: formData.experiences,
            current_summary: formData.summary,
          }),
        },
        token,
      );
      if (typeof data?.summary !== 'string' || !data.summary.trim()) {
        throw new Error('The AI response did not include a summary.');
      }

      setFormData((current) => ({ ...current, summary: data.summary }));
    } catch (err) {
      setError('AI Generation failed: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      summary: formData.summary,
      experiences: formData.experiences.map((exp) => ({
        ...exp,
        years: parseInt(exp.years) || 0,
      })),
      educations: formData.educations,
      skills: formData.skills,
      projects: formData.projects,
    };

    try {
      let savedResume;
      if (initialData) {
        savedResume = await apiFetch(
          `/resumes/${initialData.id}`,
          { method: 'PATCH', body: JSON.stringify(payload) },
          token,
        );
        await syncSections(initialData, formData, token);
        savedResume = await getResume(initialData.id, token);
      } else {
        savedResume = await apiFetch(
          '/resumes',
          { method: 'POST', body: JSON.stringify(payload) },
          token,
        );
      }

      if (savedResume?.id) {
        setResumePreferences(savedResume.id, { templateId, fontId, ...meta });
      }

      onResumeCreated(savedResume);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const syncSections = async (original, current, authToken) => {
    const sections = ['experiences', 'educations', 'projects'];
    await Promise.all(
      sections.map(async (section) => {
        const originalItems = original[section] || [];
        const currentItems = current[section] || [];
        await Promise.all(
          currentItems.map((item, index) =>
            item.id
              ? updateResumeSection(original.id, section, item.id, { ...item, sort_order: index }, authToken)
              : createResumeSection(original.id, section, { ...item, sort_order: index }, authToken),
          ),
        );
        await Promise.all(
          originalItems
            .filter((item) => !currentItems.some((candidate) => candidate.id === item.id))
            .map((item) => deleteResumeSection(original.id, section, item.id, authToken)),
        );
      }),
    );

    const originalSkills = original.skills || [];
    const currentSkills = current.skills || [];
    await Promise.all(
      currentSkills.map((skill, index) =>
        skill.id
          ? updateResumeSection(
              original.id,
              'skills',
              skill.id,
              { category: skill.category, name: skill.name, sort_order: index },
              authToken,
            )
          : createResumeSection(
              original.id,
              'skills',
              { category: skill.category, name: skill.name, sort_order: index },
              authToken,
            ),
      ),
    );
    await Promise.all(
      originalSkills
        .filter((skill) => !currentSkills.some((candidate) => candidate.id === skill.id))
        .map((skill) => deleteResumeSection(original.id, 'skills', skill.id, authToken)),
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,33rem)]">
      {/* ---------------- Editor ---------------- */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <SectionCard icon={User} title="Contact details" subtitle="How recruiters reach you">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="full_name">Full name</label>
              <input
                id="full_name"
                name="full_name"
                placeholder="Sarah Jenkins"
                required
                className={inputClass}
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="role">Target role</label>
              <input
                id="role"
                name="role"
                placeholder="Product Designer"
                className={inputClass}
                value={meta.role}
                onChange={handleMetaChange}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className={inputClass}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                placeholder="+1 (555) 010-1234"
                className={inputClass}
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                placeholder="Austin, TX"
                className={inputClass}
                value={meta.location}
                onChange={handleMetaChange}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="photo">Photo URL (optional)</label>
              <input
                id="photo"
                name="photo"
                placeholder="https://…"
                className={inputClass}
                value={meta.photo}
                onChange={handleMetaChange}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={Sparkles}
          title="Professional summary"
          subtitle="2–3 sentences that sell the role"
          action={
            <button
              type="button"
              onClick={generateAISummary}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
            >
              {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <WandSparkles size={13} />}
              {isGenerating ? 'Generating…' : 'Generate with AI'}
            </button>
          }
        >
          <textarea
            name="summary"
            placeholder="Product designer with 6 years of experience turning messy workflows into products people love…"
            rows={4}
            className={`${inputClass} resize-y leading-relaxed`}
            value={formData.summary}
            onChange={handleChange}
          />
        </SectionCard>

        <SectionCard
          icon={Briefcase}
          title="Experience"
          subtitle="Your strongest work first"
          action={
            <button
              type="button"
              onClick={addExperience}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"
            >
              <Plus size={13} /> Add experience
            </button>
          }
        >
          {formData.experiences.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No roles yet — add your most recent position.
            </p>
          )}

          <div className="space-y-4">
            {formData.experiences.map((exp, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Role {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-red-600"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Company</label>
                    <input
                      placeholder="Acme Inc."
                      required
                      className={inputClass}
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Role</label>
                    <input
                      placeholder="Senior Product Designer"
                      required
                      className={inputClass}
                      value={exp.role}
                      onChange={(e) => updateExperience(index, 'role', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Years</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      required
                      className={inputClass}
                      value={exp.years}
                      onChange={(e) => updateExperience(index, 'years', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Achievement</label>
                    <div className="relative">
                      <input
                        placeholder="What did you ship?"
                        className={`${inputClass} pr-11`}
                        value={exp.description || ''}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => rewriteExperienceBullet(index)}
                        disabled={rewritingIndex === index}
                        title="Rewrite with AI"
                        className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-amber-600 transition hover:bg-amber-50 disabled:opacity-60"
                      >
                        {rewritingIndex === index ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <WandSparkles size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <label className={labelClass}>Bullets (one per line)</label>
                  <textarea
                    rows={3}
                    placeholder={'Led a squad of 4 designers…\nShipped onboarding redesign, +28% activation'}
                    className={`${inputClass} resize-y leading-relaxed`}
                    value={(exp.bullets || []).join('\n')}
                    onChange={(e) =>
                      updateExperience(
                        index,
                        'bullets',
                        e.target.value.split('\n').map((line) => line.trim()),
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          icon={GraduationCap}
          title="Education"
          subtitle="Degrees, courses and certifications"
          action={
            <button
              type="button"
              onClick={() =>
                addCollectionItem('educations', {
                  institution: '',
                  degree: '',
                  field_of_study: '',
                  start_date: '',
                  end_date: '',
                })
              }
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"
            >
              <Plus size={13} /> Add education
            </button>
          }
        >
          {formData.educations.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              Add at least one education entry to keep the ATS score high.
            </p>
          )}
          <div className="space-y-3">
            {formData.educations.map((education, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Institution</label>
                    <input
                      required
                      placeholder="University of Texas"
                      className={inputClass}
                      value={education.institution || ''}
                      onChange={(e) => updateCollection('educations', index, 'institution', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Degree</label>
                    <input
                      required
                      placeholder="B.A."
                      className={inputClass}
                      value={education.degree || ''}
                      onChange={(e) => updateCollection('educations', index, 'degree', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Field of study</label>
                    <input
                      placeholder="Graphic Design"
                      className={inputClass}
                      value={education.field_of_study || ''}
                      onChange={(e) => updateCollection('educations', index, 'field_of_study', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Start</label>
                      <input
                        placeholder="2018"
                        className={inputClass}
                        value={education.start_date || ''}
                        onChange={(e) => updateCollection('educations', index, 'start_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>End</label>
                      <input
                        placeholder="2022"
                        className={inputClass}
                        value={education.end_date || ''}
                        onChange={(e) => updateCollection('educations', index, 'end_date', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeCollectionItem('educations', index)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-red-600"
                >
                  <Trash2 size={13} /> Remove education
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          icon={Wrench}
          title="Skills"
          subtitle="Match the keywords in the job description"
          action={
            <button
              type="button"
              onClick={suggestSkillList}
              disabled={isSuggestingSkills}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
            >
              {isSuggestingSkills ? <Loader2 size={13} className="animate-spin" /> : <Lightbulb size={13} />}
              {isSuggestingSkills ? 'Suggesting…' : 'Suggest with AI'}
            </button>
          }
        >
          <div className="mb-4 flex gap-2">
            <input
              placeholder="Job title for AI suggestions"
              className={inputClass}
              value={skillPrompt}
              onChange={(e) => setSkillPrompt(e.target.value)}
            />
          </div>

          {formData.skills.length === 0 && (
            <p className="mb-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              Add skills manually or let AI suggest them.
            </p>
          )}

          <div className="space-y-2">
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center">
                <input
                  placeholder="Category"
                  className={`${inputClass} sm:w-44`}
                  value={skill.category || ''}
                  onChange={(e) => updateCollection('skills', index, 'category', e.target.value)}
                />
                <input
                  placeholder="Skill"
                  className={inputClass}
                  value={skill.name || ''}
                  onChange={(e) => updateCollection('skills', index, 'name', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeCollectionItem('skills', index)}
                  aria-label="Remove skill"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addCollectionItem('skills', { category: 'Technical', name: '' })}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Plus size={13} /> Add skill
          </button>
        </SectionCard>

        <SectionCard
          icon={FolderGit2}
          title="Projects"
          subtitle="Side projects, open source, case studies"
          action={
            <button
              type="button"
              onClick={() =>
                addCollectionItem('projects', {
                  title: '',
                  description: '',
                  tech_stack: [],
                  bullets: [],
                })
              }
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"
            >
              <Plus size={13} /> Add project
            </button>
          }
        >
          {formData.projects.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              Optional — but projects make great talking points.
            </p>
          )}
          <div className="space-y-3">
            {formData.projects.map((project, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    required
                    placeholder="Project title"
                    className={inputClass}
                    value={project.title || ''}
                    onChange={(e) => updateCollection('projects', index, 'title', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeCollectionItem('projects', index)}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
                <input
                  placeholder="Tech stack (comma separated)"
                  className={`${inputClass} mt-3`}
                  value={(project.tech_stack || []).join(', ')}
                  onChange={(e) =>
                    updateCollection(
                      'projects',
                      index,
                      'tech_stack',
                      e.target.value.split(',').map((item) => item.trim()).filter(Boolean),
                    )
                  }
                />
                <textarea
                  rows={3}
                  placeholder="What did you build and why does it matter?"
                  className={`${inputClass} mt-3 resize-y leading-relaxed`}
                  value={project.description || ''}
                  onChange={(e) => updateCollection('projects', index, 'description', e.target.value)}
                />
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <ScoreRing score={score} size="sm" />
            <div>
              <p className="text-sm font-extrabold text-slate-900">ATS score {score}</p>
              <p className="text-xs text-slate-500">{rating} — {checks.filter((check) => check.passed).length}/{checks.length} checks passing</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-extrabold text-slate-900 shadow-lg shadow-amber-200/70 transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {initialData ? 'Update resume' : 'Save resume'}
            </button>
          </div>
        </div>
      </form>

      {/* ---------------- Live preview ---------------- */}
      <aside className="xl:sticky xl:top-24 xl:h-fit">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-extrabold text-slate-900">Live preview</p>
              <p className="text-[11px] text-slate-500">Updates as you type</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="hidden rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-white sm:inline-block"
                style={{ backgroundColor: template.accent }}
                title={`${template.name} template`}
              >
                {template.name}
              </span>
              <button
                type="button"
                onClick={() =>
                  printResume({
                    data: previewData,
                    templateId,
                    fontId,
                    title: formData.full_name || 'Resume',
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <Printer size={13} /> Print / PDF
              </button>
            </div>
          </div>

          <div className="space-y-3 border-b border-slate-100 px-4 py-3">
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Template</p>
              <TemplateRail
                selectedId={templateId}
                onSelect={(next) => setTemplateId(next.id)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500" htmlFor="font-picker">
                Font
              </label>
              <div className="relative">
                <select
                  id="font-picker"
                  value={fontId}
                  onChange={(e) => setFontId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                >
                  {fonts.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.name} — {font.category}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                A4 · {zoom === 'fit' ? 'Fit to width' : `${Math.round(zoom * 100)}%`}
              </span>
              <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
                {[
                  { id: 'fit', label: 'Fit' },
                  { id: 0.75, label: '75%' },
                  { id: 1, label: '100%' },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setZoom(option.id)}
                    className={`rounded-md px-2 py-1 text-[11px] font-bold transition ${
                      zoom === option.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <PreviewCanvas zoom={zoom}>
              {(scale) => (
                <ResumePreview
                  data={previewData}
                  templateId={templateId}
                  fontId={fontId}
                  scale={scale}
                />
              )}
            </PreviewCanvas>
          </div>

          <div className="border-t border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ATS checks</p>
              <p className="text-[11px] font-bold text-slate-600">{score}/100 · {rating}</p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${score}%` }}
              />
            </div>
            <ul className="mt-3 grid gap-1.5">
              {checks.map((check) => (
                <li key={check.id} className="flex items-center gap-2 text-[11px]">
                  <span
                    className={`grid h-4 w-4 shrink-0 place-items-center rounded-md ${
                      check.passed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Check size={10} />
                  </span>
                  <span className={check.passed ? 'text-slate-700' : 'text-slate-400'}>{check.label}</span>
                  <span className="ml-auto text-[10px] font-semibold text-slate-400">+{check.weight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function SectionCard({ icon: Icon, title, subtitle, action, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <Icon size={18} />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function ScoreRing({ score, size = 'md' }) {
  const dimensions = size === 'sm' ? 'h-11 w-11' : 'h-24 w-24';
  const text = size === 'sm' ? 'text-xs' : 'text-2xl';
  return (
    <div
      className={`grid ${dimensions} shrink-0 place-items-center rounded-full p-[3px]`}
      style={{ background: `conic-gradient(#10B981 ${score}%, #E2E8F0 ${score}% 100%)` }}
    >
      <div className={`grid h-full w-full place-items-center rounded-full bg-white ${text} font-extrabold text-slate-900`}>
        {score}
      </div>
    </div>
  );
}

/**
 * Keeps the A4 preview scaled to the available width (or at a fixed zoom).
 */
function PreviewCanvas({ zoom = 'fit', children }) {
  const containerRef = useRef(null);
  const [fitScale, setFitScale] = useState(0.5);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const update = () => {
      const width = element.clientWidth;
      if (width) setFitScale(Math.min(1, width / PAGE_WIDTH));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const scale = zoom === 'fit' ? fitScale : zoom;

  return (
    <div
      ref={containerRef}
      className={scale > fitScale ? 'overflow-x-auto pb-2' : 'flex justify-center'}
    >
      {children(scale)}
    </div>
  );
}
