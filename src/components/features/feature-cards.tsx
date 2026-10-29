import { useState } from 'react';

type Props = { title: string; body: string; points: readonly string[] };

/** The chapter's copy as small selectable cards, styled like the app's storage unit cards. */
export default function FeatureCards({ title, body, points }: Props) {
  const cards = [{ heading: title, text: body }, ...points.map((p) => ({ heading: p, text: '' }))];
  const [active, setActive] = useState(0);
  return (
    <div className="fcards" role="group" aria-label={title}>
      {cards.map((c, i) => (
        <button
          key={c.heading}
          type="button"
          className={`fcard${i === active ? ' is-on' : ''}${c.text ? ' fcard--lead' : ''}`}
          aria-pressed={i === active}
          onClick={() => setActive(i)}
        >
          <span className="fcard__heading">{c.heading}</span>
          {c.text && <span className="fcard__text">{c.text}</span>}
        </button>
      ))}
    </div>
  );
}
