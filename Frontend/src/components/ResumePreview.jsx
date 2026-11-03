import { useMemo } from 'react';
import { getFont } from '../data/fonts';
import { getTemplate } from '../data/templates';

export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

const slate = {
  heading: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  line: '#e2e8f0',
};

function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'R';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function Monogram({ name, photo, accent, size = 78, font }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        className="rounded-full object-cover"
        style={{ width: size, height: size, border: `3px solid ${accent}` }}
      />
    );
  }
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-extrabold"
      style={{
        width: size,
        height: size,
        backgroundColor: accent,
        color: '#0f172a',
        fontSize: size * 0.36,
        fontFamily: font.stack,
        letterSpacing: '0.02em',
      }}
    >
      {initialsOf(name)}
    </span>
  );
}

function Summary({ text, style }) {
  if (!text?.trim()) {
    return <div className="mt-2 space-y-1.5"><div className="h-2 w-full rounded bg-slate-100" /><div className="h-2 w-11/12 rounded bg-slate-100" /><div className="h-2 w-8/12 rounded bg-slate-100" /></div>;
  }
  return (
    <p style={{ fontSize: 10.5, lineHeight: 1.6, color: style.body, margin: 0 }}>{text}</p>
  );
}

function ExperienceList({ experiences = [], accent, style, dense = false }) {
  if (!experiences.length) {
    return (
      <div className="mt-2 space-y-2">
        <div className="h-2.5 w-1/2 rounded bg-slate-100" />
        <div className="h-2 w-11/12 rounded bg-slate-100" />
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gap: dense ? 12 : 16 }}>
      {experiences.map((experience, index) => (
        <div key={experience.id || `${experience.company}-${index}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: style.heading }}>
              {experience.role || 'Role'}
            </span>
            <span style={{ fontSize: 10, color: style.muted, whiteSpace: 'nowrap' }}>
              {experience.years ? `${experience.years} yr${Number(experience.years) === 1 ? '' : 's'}` : ''}
            </span>
          </div>
          <p style={{ fontSize: 10.5, fontWeight: 600, color: accent, margin: '2px 0 0' }}>
            {experience.company || 'Company'}
          </p>
          {experience.description && (
            <p style={{ fontSize: 10.5, lineHeight: 1.55, color: style.body, margin: '5px 0 0' }}>
              {experience.description}
            </p>
          )}
          {Array.isArray(experience.bullets) && experience.bullets.length > 0 && (
            <ul style={{ margin: '5px 0 0', paddingLeft: 14, display: 'grid', gap: 3 }}>
              {experience.bullets.filter(Boolean).map((bullet, bulletIndex) => (
                <li key={bulletIndex} style={{ fontSize: 10.5, lineHeight: 1.5, color: style.body }}>
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function EducationList({ educations = [], accent, style }) {
  if (!educations.length) {
    return (
      <div className="mt-2 space-y-2">
        <div className="h-2.5 w-1/3 rounded bg-slate-100" />
        <div className="h-2 w-1/4 rounded bg-slate-100" />
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {educations.map((education, index) => (
        <div key={education.id || `${education.institution}-${index}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: style.heading }}>
              {education.degree || 'Degree'}
            </span>
            <span style={{ fontSize: 9.5, color: style.muted, whiteSpace: 'nowrap' }}>
              {[education.start_date, education.end_date].filter(Boolean).join(' – ')}
            </span>
          </div>
          <p style={{ fontSize: 10.5, fontWeight: 600, color: accent, margin: '2px 0 0' }}>
            {education.institution || 'Institution'}
          </p>
          {education.field_of_study && (
            <p style={{ fontSize: 10, color: style.muted, margin: '2px 0 0' }}>{education.field_of_study}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function groupSkills(skills = []) {
  return skills.reduce((groups, skill) => {
    const category = (skill.category || 'Skills').trim() || 'Skills';
    groups[category] = [...(groups[category] || []), skill.name];
    return groups;
  }, {});
}

function SkillsList({ skills = [], accent, style, chips = false }) {
  const groups = groupSkills(skills);
  const entries = Object.entries(groups);
  if (!entries.length) {
    return (
      <div className="mt-2 space-y-2">
        <div className="h-2 w-1/3 rounded bg-slate-100" />
        <div className="h-2 w-1/2 rounded bg-slate-100" />
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {entries.map(([category, names]) => (
        <div key={category}>
          <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent, margin: 0 }}>
            {category}
          </p>
          {chips ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 5 }}>
              {names.filter(Boolean).map((name, index) => (
                <span
                  key={`${name}-${index}`}
                  style={{
                    fontSize: 9.5,
                    padding: '3px 8px',
                    borderRadius: 999,
                    background: style.chipBg,
                    color: style.chipText,
                    fontWeight: 600,
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 10.5, lineHeight: 1.5, color: style.body, margin: '3px 0 0' }}>
              {names.filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ProjectList({ projects = [], accent, style }) {
  if (!projects.length) {
    return (
      <div className="mt-2 space-y-2">
        <div className="h-2.5 w-1/3 rounded bg-slate-100" />
        <div className="h-2 w-2/3 rounded bg-slate-100" />
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {projects.map((project, index) => (
        <div key={project.id || `${project.title}-${index}`}>
          <p style={{ fontSize: 12, fontWeight: 700, color: style.heading, margin: 0 }}>
            {project.title || 'Project'}
          </p>
          {project.description && (
            <p style={{ fontSize: 10.5, lineHeight: 1.55, color: style.body, margin: '4px 0 0' }}>
              {project.description}
            </p>
          )}
          {Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && (
            <p style={{ fontSize: 9.5, fontWeight: 700, color: accent, margin: '4px 0 0' }}>
              {project.tech_stack.filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ContactLine({ email, phone, location, color, size = 10.5 }) {
  const items = [email, phone, location].filter(Boolean);
  if (!items.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', fontSize: size, color }}>
      {items.map((item, index) => (
        <span key={index}>{item}</span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Layout renderers                                                    */
/* ------------------------------------------------------------------ */

function AccentedLayout({ data, template, style }) {
  const accent = template.accent;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 8, background: accent }} />
      <div style={{ padding: '28px 44px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Monogram name={data.full_name} photo={data.photo} accent={accent} font={style.font} />
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: style.heading, margin: 0, letterSpacing: '-0.01em' }}>
                {data.full_name || 'Your Name'}
              </h1>
              <p style={{ fontSize: 12, fontWeight: 600, color: accent, margin: '3px 0 0' }}>
                {data.role || 'Target role'}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right', paddingTop: 6 }}>
            <ContactLine email={data.email} phone={data.phone} location={data.location} color={style.muted} />
          </div>
        </div>
        <div style={{ height: 2, background: accent, marginTop: 18, opacity: 0.25 }} />
      </div>

      <div style={{ padding: '22px 44px 40px', display: 'grid', gap: 22 }}>
        <section>
          <SectionTitle accent={accent} title="Profile" />
          <Summary text={data.summary} style={style} />
        </section>
        <section>
          <SectionTitle accent={accent} title="Experience" />
          <ExperienceList experiences={data.experiences} accent={accent} style={style} />
        </section>
        <section>
          <SectionTitle accent={accent} title="Skills" />
          <SkillsList skills={data.skills} accent={accent} style={style} chips />
        </section>
        <section>
          <SectionTitle accent={accent} title="Education" />
          <EducationList educations={data.educations} accent={accent} style={style} />
        </section>
        {data.projects?.length > 0 && (
          <section>
            <SectionTitle accent={accent} title="Projects" />
            <ProjectList projects={data.projects} accent={accent} style={style} />
          </section>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ title, accent, centered = false, style }) {
  if (centered) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <span style={{ flex: 1, height: 1, background: style?.line || '#e2e8f0' }} />
        <h2 style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: accent, margin: 0 }}>
          {title}
        </h2>
        <span style={{ flex: 1, height: 1, background: style?.line || '#e2e8f0' }} />
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: accent, display: 'inline-block' }} />
      <h2 style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: slate.heading, margin: 0 }}>
        {title}
      </h2>
      <span style={{ flex: 1, height: 1, background: slate.line }} />
    </div>
  );
}

function SidebarLayout({ data, template, style }) {
  const accent = template.accent;
  return (
    <div style={{ height: '100%', display: 'flex' }}>
      <aside style={{ width: 236, flexShrink: 0, background: accent, color: '#ffffff', padding: '32px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Monogram
            name={data.full_name}
            photo={data.photo}
            accent="#ffffff"
            font={style.font}
            size={82}
          />
          <h1 style={{ fontSize: 19, fontWeight: 800, margin: '14px 0 0', letterSpacing: '-0.01em', color: '#ffffff' }}>
            {data.full_name || 'Your Name'}
          </h1>
          <p style={{ fontSize: 11, fontWeight: 600, margin: '4px 0 0', color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {data.role || 'Target role'}
          </p>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.25)', margin: '20px 0' }} />

        <div style={{ display: 'grid', gap: 7 }}>
          {[data.email, data.phone, data.location].filter(Boolean).map((item, index) => (
            <span key={index} style={{ fontSize: 10, color: 'rgba(255,255,255,0.88)', wordBreak: 'break-word' }}>
              {item}
            </span>
          ))}
          {!data.email && !data.phone && (
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>your@email.com</span>
          )}
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.25)', margin: '20px 0' }} />

        <h2 style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#ffffff', margin: 0 }}>
          Skills
        </h2>
        <div style={{ marginTop: 10 }}>
          <SkillsList
            skills={data.skills}
            accent="#ffffff"
            style={{ ...style, body: 'rgba(255,255,255,0.85)', chipBg: 'rgba(255,255,255,0.16)', chipText: '#ffffff' }}
            chips
          />
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.25)', margin: '20px 0' }} />

        <h2 style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#ffffff', margin: 0 }}>
          Education
        </h2>
        <div style={{ marginTop: 10 }}>
          <EducationList
            educations={data.educations}
            accent="#ffffff"
            style={{ ...style, heading: '#ffffff', body: 'rgba(255,255,255,0.82)', muted: 'rgba(255,255,255,0.6)' }}
          />
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: '34px 40px' }}>
        <section style={{ marginBottom: 22 }}>
          <SectionTitle accent={accent} title="Profile" />
          <Summary text={data.summary} style={style} />
        </section>
        <section style={{ marginBottom: 22 }}>
          <SectionTitle accent={accent} title="Experience" />
          <ExperienceList experiences={data.experiences} accent={accent} style={style} />
        </section>
        {data.projects?.length > 0 && (
          <section style={{ marginBottom: 22 }}>
            <SectionTitle accent={accent} title="Projects" />
            <ProjectList projects={data.projects} accent={accent} style={style} />
          </section>
        )}
      </main>
    </div>
  );
}

function CenteredLayout({ data, template, style }) {
  const accent = template.accent;
  return (
    <div style={{ height: '100%', padding: '40px 52px' }}>
      <header style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <Monogram name={data.full_name} photo={data.photo} accent={accent} font={style.font} size={70} />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: accent, margin: 0, letterSpacing: '-0.01em' }}>
          {data.full_name || 'Your Name'}
        </h1>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: style.muted, margin: '5px 0 0', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
          {data.role || 'Target role'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <ContactLine email={data.email} phone={data.phone} location={data.location} color={style.body} />
        </div>
        <div style={{ height: 1, background: accent, opacity: 0.3, marginTop: 20 }} />
      </header>

      <div style={{ marginTop: 22, display: 'grid', gap: 20 }}>
        <section>
          <SectionTitle accent={accent} title="Profile" centered style={style} />
          <Summary text={data.summary} style={style} />
        </section>
        <section>
          <SectionTitle accent={accent} title="Experience" centered style={style} />
          <ExperienceList experiences={data.experiences} accent={accent} style={style} />
        </section>
        <section>
          <SectionTitle accent={accent} title="Education" centered style={style} />
          <EducationList educations={data.educations} accent={accent} style={style} />
        </section>
        <section>
          <SectionTitle accent={accent} title="Skills" centered style={style} />
          <SkillsList skills={data.skills} accent={accent} style={style} />
        </section>
        {data.projects?.length > 0 && (
          <section>
            <SectionTitle accent={accent} title="Projects" centered style={style} />
            <ProjectList projects={data.projects} accent={accent} style={style} />
          </section>
        )}
      </div>
    </div>
  );
}

function TwoColLayout({ data, template, style }) {
  const accent = template.accent;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '30px 44px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Monogram name={data.full_name} photo={data.photo} accent={accent} font={style.font} size={68} />
        <div>
          <h1 style={{ fontSize: 27, fontWeight: 800, color: style.heading, margin: 0, letterSpacing: '-0.01em' }}>
            {data.full_name || 'Your Name'}
          </h1>
          <p style={{ fontSize: 12, fontWeight: 600, color: accent, margin: '3px 0 0' }}>{data.role || 'Target role'}</p>
          <div style={{ marginTop: 6 }}>
            <ContactLine email={data.email} phone={data.phone} location={data.location} color={style.muted} size={10} />
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <main style={{ flex: 1, minWidth: 0, padding: '0 34px 34px 44px' }}>
          <section style={{ marginBottom: 20 }}>
            <SectionTitle accent={accent} title="Profile" />
            <Summary text={data.summary} style={style} />
          </section>
          <section style={{ marginBottom: 20 }}>
            <SectionTitle accent={accent} title="Experience" />
            <ExperienceList experiences={data.experiences} accent={accent} style={style} />
          </section>
          {data.projects?.length > 0 && (
            <section style={{ marginBottom: 20 }}>
              <SectionTitle accent={accent} title="Projects" />
              <ProjectList projects={data.projects} accent={accent} style={style} />
            </section>
          )}
        </main>

        <aside style={{ width: 226, flexShrink: 0, background: template.accentSoft, padding: '24px 22px' }}>
          <h2 style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: accent, margin: '0 0 10px' }}>
            Skills
          </h2>
          <SkillsList skills={data.skills} accent={accent} style={style} chips />
          <h2 style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: accent, margin: '22px 0 10px' }}>
            Education
          </h2>
          <EducationList educations={data.educations} accent={accent} style={style} />
          <h2 style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: accent, margin: '22px 0 10px' }}>
            Languages
          </h2>
          <p style={{ fontSize: 10.5, color: style.body, margin: 0 }}>English, Spanish</p>
        </aside>
      </div>
    </div>
  );
}

function ClassicLayout({ data, template, style }) {
  const accent = template.accent;
  return (
    <div style={{ height: '100%', padding: '42px 54px' }}>
      <header style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '0.04em', color: style.heading, margin: 0, textTransform: 'uppercase' }}>
          {data.full_name || 'Your Name'}
        </h1>
        <p style={{ fontSize: 11, fontWeight: 600, color: accent, margin: '7px 0 0', textTransform: 'uppercase', letterSpacing: '0.22em' }}>
          {data.role || 'Target role'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <ContactLine email={data.email} phone={data.phone} location={data.location} color={style.muted} size={10} />
        </div>
        <div style={{ height: 2, background: style.heading, opacity: 0.8, marginTop: 18 }} />
      </header>

      <div style={{ display: 'grid', gap: 18 }}>
        <section>
          <h2 style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: style.heading, margin: 0, paddingBottom: 5, borderBottom: `1px solid ${style.line}` }}>
            Profile
          </h2>
          <Summary text={data.summary} style={style} />
        </section>
        <section>
          <h2 style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: style.heading, margin: 0, paddingBottom: 5, borderBottom: `1px solid ${style.line}` }}>
            Experience
          </h2>
          <ExperienceList experiences={data.experiences} accent={accent} style={style} />
        </section>
        <section>
          <h2 style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: style.heading, margin: 0, paddingBottom: 5, borderBottom: `1px solid ${style.line}` }}>
            Education
          </h2>
          <EducationList educations={data.educations} accent={accent} style={style} />
        </section>
        <section>
          <h2 style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: style.heading, margin: 0, paddingBottom: 5, borderBottom: `1px solid ${style.line}` }}>
            Skills
          </h2>
          <SkillsList skills={data.skills} accent={accent} style={style} />
        </section>
        {data.projects?.length > 0 && (
          <section>
            <h2 style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: style.heading, margin: 0, paddingBottom: 5, borderBottom: `1px solid ${style.line}` }}>
              Projects
            </h2>
            <ProjectList projects={data.projects} accent={accent} style={style} />
          </section>
        )}
      </div>
    </div>
  );
}

const layoutRenderers = {
  accented: AccentedLayout,
  sidebar: SidebarLayout,
  centered: CenteredLayout,
  twocol: TwoColLayout,
  classic: ClassicLayout,
};

export default function ResumePreview({
  data = {},
  templateId = 'honeycomb',
  fontId = 'inter',
  scale = 1,
  mode = 'screen',
  className = '',
}) {
  const template = getTemplate(templateId);
  const font = getFont(fontId);
  const Layout = layoutRenderers[template.layout] || AccentedLayout;

  const style = useMemo(
    () => ({
      heading: slate.heading,
      body: slate.body,
      muted: slate.muted,
      line: slate.line,
      chipBg: template.accentSoft,
      chipText: slate.heading,
      font,
    }),
    [template, font],
  );

  const content = <Layout data={data} template={template} style={style} />;

  if (mode === 'print') {
    return (
      <div
        className={`bg-white text-slate-800 ${className}`}
        style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          fontFamily: font.stack,
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={`relative ${className}`}
      style={{ width: PAGE_WIDTH * scale, height: PAGE_HEIGHT * scale }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left overflow-hidden bg-white text-slate-800 shadow-sm ring-1 ring-slate-200"
        style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          transform: `scale(${scale})`,
          fontFamily: font.stack,
        }}
      >
        {content}
      </div>
    </div>
  );
}
