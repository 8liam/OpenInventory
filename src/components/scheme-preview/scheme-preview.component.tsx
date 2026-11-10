import type { ThemeVariant } from "~/lib/theme/theme.types";
import { SCHEME_PREVIEW } from "./scheme-preview.config";
import type { MiniUiProps, SchemePreviewProps } from "./scheme-preview.types";

const { classes, fade } = SCHEME_PREVIEW;
const NAV_ROWS = [false, true, false, false] as const;
const CARDS = Array.from({ length: SCHEME_PREVIEW.cardCount }, (_, index) => index);

function mix(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

function shapes(variant: ThemeVariant) {
  return {
    text: { backgroundColor: mix(variant.foreground, fade.text) },
    muted: { backgroundColor: mix(variant["muted-foreground"], fade.muted) },
    hairline: { borderColor: variant.border },
    surface: { backgroundColor: variant.card, borderColor: variant.border },
  };
}

/** A tiny Items page painted with one theme variant's own colours (not the live theme's). */
function MiniUi({ variant }: MiniUiProps) {
  const s = shapes(variant);
  return (
    <div
      className={classes.ui}
      style={{ backgroundColor: variant.background, borderColor: variant.border }}
    >
      <div className={classes.sidebar} style={s.hairline}>
        <div className={classes.logo}>
          <span
            className={classes.logoMark}
            style={{ backgroundColor: variant["accent-strong"] }}
          />
          <span className={classes.logoName} style={s.text} />
        </div>
        {NAV_ROWS.map((active, index) => (
          <div
            key={index}
            className={classes.navItem}
            style={active ? { backgroundColor: variant.accent } : undefined}
          >
            <span
              className={classes.navIcon}
              style={{
                backgroundColor: active
                  ? variant["accent-foreground"]
                  : mix(variant["muted-foreground"], fade.navIcon),
              }}
            />
            <span
              className={classes.navLabel}
              style={{
                backgroundColor: active
                  ? mix(variant["accent-foreground"], fade.navLabelActive)
                  : mix(variant["muted-foreground"], fade.navLabel),
              }}
            />
          </div>
        ))}
        <div className={classes.account} style={s.hairline}>
          <span className={classes.accountDot} style={{ backgroundColor: variant.success }} />
          <span className={classes.accountName} style={s.text} />
        </div>
      </div>
      <div className={classes.main}>
        <div>
          <div className={classes.title} style={s.text} />
          <div className={classes.description} style={s.muted} />
        </div>
        <div className={classes.toolbar}>
          <div className={classes.search} style={s.surface}>
            <span className={classes.searchIcon} style={s.hairline} />
            <span className={classes.searchLine} style={s.muted} />
          </div>
          <span className={classes.filter} style={s.surface} />
          <span className={classes.filter} style={s.surface} />
        </div>
        <div className={classes.grid}>
          {CARDS.map((card) => (
            <div key={card} className={classes.card} style={s.surface}>
              <div
                className={classes.thumb}
                style={{
                  background: `linear-gradient(135deg, ${mix(variant.primary, fade.tint)}, ${mix(variant.primary, fade.tintEnd)})`,
                }}
              />
              <span className={classes.weaponLine} style={s.muted} />
              <span className={classes.nameLine} style={s.text} />
              <span className={classes.priceLine} style={s.text} />
              <span className={classes.chip} style={s.muted} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** The mini UI in a light, dark or half-and-half (system) frame. */
export function SchemePreview({ variants, mode }: SchemePreviewProps) {
  return (
    <div className={classes.root} aria-hidden>
      <div className={classes.layer}>
        <MiniUi variant={mode === "dark" ? variants.dark : variants.light} />
      </div>
      {mode === "split" && (
        <div className={classes.layer} style={{ clipPath: SCHEME_PREVIEW.splitClip }}>
          <MiniUi variant={variants.dark} />
        </div>
      )}
    </div>
  );
}
