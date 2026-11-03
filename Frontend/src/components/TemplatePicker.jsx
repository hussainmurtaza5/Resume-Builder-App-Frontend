import { Check, CheckCircle2 } from 'lucide-react';
import { templates } from '../data/templates';

/**
 * Grid of template cards — used on the dashboard and the "start from a
 * template" section.
 */
export function TemplateGrid({ selectedId, onSelect, columns = 'sm:grid-cols-2 xl:grid-cols-3' }) {
  return (
    <div className={`grid gap-5 ${columns}`}>
      {templates.map((template) => {
        const active = template.id === selectedId;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect?.(template)}
            aria-pressed={active}
            className={`group rounded-2xl border bg-white p-3 text-left transition hover:-translate-y-1 ${
              active
                ? 'border-amber-400 shadow-lg shadow-amber-100'
                : 'border-slate-200 shadow-sm hover:shadow-lg'
            }`}
          >
            <div
              className="relative h-44 overflow-hidden rounded-xl border border-slate-200"
              style={{ background: template.swatch }}
            >
              <div className="absolute inset-x-6 bottom-0 top-7 rounded-t-md bg-white/95 p-3 shadow-sm">
                <div className="h-2 w-16 rounded-full" style={{ backgroundColor: template.accent }} />
                <div className="mt-2 h-1.5 w-10 rounded-full bg-slate-200" />
                <div className="mt-3 space-y-1.5">
                  <div className="h-1.5 w-full rounded-full bg-slate-100" />
                  <div className="h-1.5 w-5/6 rounded-full bg-slate-100" />
                  <div className="h-1.5 w-full rounded-full bg-slate-100" />
                </div>
                <div className="mt-3 h-2 w-12 rounded-full" style={{ backgroundColor: template.accent }} />
                <div className="mt-2 space-y-1.5">
                  <div className="h-1.5 w-full rounded-full bg-slate-100" />
                  <div className="h-1.5 w-4/5 rounded-full bg-slate-100" />
                </div>
              </div>
              {active && (
                <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-amber-400 text-slate-900">
                  <Check size={16} />
                </span>
              )}
            </div>
            <div className="flex items-start justify-between gap-2 px-1.5 pb-1 pt-3.5">
              <span>
                <span className="block font-bold text-slate-900">{template.name}</span>
                <span className="mt-0.5 block text-sm text-slate-500">{template.tagline}</span>
              </span>
              {active && <CheckCircle2 size={18} className="mt-1 shrink-0 text-amber-500" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Compact horizontal rail of templates — used inside the live preview panel.
 */
export function TemplateRail({ selectedId, onSelect }) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
      {templates.map((template) => {
        const active = template.id === selectedId;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect?.(template)}
            aria-pressed={active}
            title={template.tagline}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-2.5 py-1.5 transition ${
              active
                ? 'border-amber-400 bg-amber-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <span
              className="h-6 w-4.5 shrink-0 rounded-[3px]"
              style={{ width: 18, height: 24, background: template.swatch }}
            />
            <span className="text-xs font-bold text-slate-700">{template.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export default TemplateGrid;
