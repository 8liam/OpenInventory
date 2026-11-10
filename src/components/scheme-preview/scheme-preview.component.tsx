import type { CSSProperties } from "react";
import { SCHEME_PREVIEW } from "./scheme-preview.config";
import type { MiniUiProps, SchemePreviewProps } from "./scheme-preview.types";

const { classes } = SCHEME_PREVIEW;

function fade(color: string): string {
  return `color-mix(in srgb, ${color} ${SCHEME_PREVIEW.fadePercent}%, transparent)`;
}

/** A tiny app mock-up painted with one theme variant's own colours (not the live theme's). */
function MiniUi({ variant }: MiniUiProps) {
  const line: CSSProperties = { backgroundColor: fade(variant["muted-foreground"]) };
  return (
    <div
      className={classes.ui}
      style={{ backgroundColor: variant.background, borderColor: variant.border }}
    >
      <div
        className={classes.sidebar}
        style={{ backgroundColor: variant.card, borderColor: variant.border }}
      >
        <div
          className={classes.pill}
          style={{ borderColor: variant.border, backgroundColor: variant.background }}
        />
        <div className={classes.bar} style={line} />
        <div className={classes.bar} style={{ backgroundColor: fade(variant.accent) }} />
        <div className={classes.bar} style={line} />
      </div>
      <div className={classes.main}>
        <div className={classes.headerBar} style={line} />
        <div className={classes.lineLong} style={line} />
        <div className={classes.lineShort} style={line} />
        <div
          className={classes.popover}
          style={{ backgroundColor: variant.card, borderColor: variant.border }}
        >
          {[variant.success, variant.primary, variant.warning].map((dot) => (
            <div key={dot} className={classes.popoverRow}>
              <span className={classes.dot} style={{ backgroundColor: dot }} />
              <span className={classes.popoverLine} style={line} />
            </div>
          ))}
        </div>
        <div
          className={classes.input}
          style={{ backgroundColor: variant.card, borderColor: variant.border }}
        >
          <span className={classes.inputLine} style={line} />
          <span className={classes.inputDot} style={{ backgroundColor: variant.primary }} />
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
