import { ImageOff } from "lucide-react";
import { Chip } from "~/components/chip/chip.component";
import { FloatBar } from "~/components/float-bar/float-bar.component";
import { attachedCharmsValue } from "~/lib/items/charm-value";
import { wearBandFor } from "~/lib/items/float-bar";
import { formatDateTime, formatFloatExact, formatMoney } from "~/utils/format";
import { cn } from "~/utils/cn";
import { ITEM_INSPECT_CARD } from "./item-inspect-card.config";
import type { Fact, ItemInspectCardProps } from "./item-inspect-card.types";

const { classes, labels } = ITEM_INSPECT_CARD;

/** Everything the app knows about one skin: image, float bar, stickers, charms, price and location. */
export function ItemInspectCard({ item, currency, now }: ItemInspectCardProps) {
  const { imageSize, glowPercent, glowFalloff } = ITEM_INSPECT_CARD;
  const band = wearBandFor(item.wear);
  const wearName = item.wearName ?? band?.label ?? null;
  const charmsValue = attachedCharmsValue(item);
  const locked = item.tradableAfter !== null && item.tradableAfter > now;
  const hasRange =
    item.minWear !== null &&
    item.minWear !== undefined &&
    item.maxWear !== null &&
    item.maxWear !== undefined;
  const glow = item.rarityColor
    ? `radial-gradient(circle at 50% 55%, color-mix(in srgb, ${item.rarityColor} ${glowPercent}%, transparent), transparent ${glowFalloff}%)`
    : undefined;
  const hasSeed = item.paintSeed !== null && item.paintSeed !== undefined;
  const hasIndex = item.paintIndex !== null && item.paintIndex !== undefined;
  const facts: readonly Fact[] = [
    ...(item.price !== null && currency !== undefined
      ? [{ label: labels.price, value: formatMoney(item.price, currency), strong: true }]
      : []),
    ...(charmsValue !== null && currency !== undefined
      ? [{ label: labels.charmsValue, value: formatMoney(charmsValue, currency), strong: false }]
      : []),
    ...(item.collections.length > 0
      ? [
          {
            label: labels.collections,
            value: item.collections.join(labels.listSeparator),
            strong: false,
          },
        ]
      : []),
    { label: labels.location, value: item.locationName, strong: false },
    ...(locked && item.tradableAfter !== null
      ? [{ label: labels.tradeLock, value: formatDateTime(item.tradableAfter), strong: false }]
      : []),
    ...(item.note !== null ? [{ label: labels.note, value: item.note, strong: false }] : []),
  ];

  return (
    <div className={classes.root}>
      <div className={classes.hero} style={{ backgroundImage: glow }}>
        {item.imageUrl === null ? (
          <div className={classes.placeholder}>
            <ImageOff size={ITEM_INSPECT_CARD.placeholderIconSize} aria-hidden />
            <span>{labels.noImage}</span>
          </div>
        ) : (
          <img
            src={item.imageUrl}
            alt=""
            width={imageSize}
            height={imageSize}
            decoding="async"
            className={classes.heroImage}
          />
        )}
      </div>

      <div className={classes.identity}>
        {item.customName !== null && <p className={classes.customName}>“{item.customName}”</p>}
        <div className={classes.badges}>
          {item.isStatTrak && <Chip tone="warning">{labels.statTrak}</Chip>}
          {item.isSouvenir && <Chip tone="accent">{labels.souvenir}</Chip>}
          {wearName !== null && <Chip>{wearName}</Chip>}
          {item.rarityName !== null && (
            <Chip>
              {item.rarityColor !== null && (
                <span
                  aria-hidden
                  className={classes.rarityDot}
                  style={{ backgroundColor: item.rarityColor }}
                />
              )}
              {item.rarityName}
            </Chip>
          )}
        </div>
      </div>

      {item.wear !== null && (
        <section className={classes.section} aria-label={labels.float}>
          <div className={classes.floatHeader}>
            <span className={classes.floatValue}>{formatFloatExact(item.wear)}</span>
            <span className={classes.floatMeta}>
              {hasSeed && `${labels.paintSeed} ${item.paintSeed}`}
              {hasSeed && hasIndex && labels.metaSeparator}
              {hasIndex && `${labels.paintIndex} ${item.paintIndex}`}
            </span>
          </div>
          <FloatBar
            value={item.wear}
            minWear={item.minWear}
            maxWear={item.maxWear}
            valueText={`${formatFloatExact(item.wear)}${wearName === null ? "" : `, ${wearName}`}`}
          />
          {hasRange && (
            <p className={classes.floatMeta}>
              {labels.skinRange} {formatFloatExact(item.minWear ?? 0)}
              {labels.rangeSeparator}
              {formatFloatExact(item.maxWear ?? 0)}
            </p>
          )}
        </section>
      )}

      {item.wear === null && hasSeed && (
        <p className={classes.floatMeta}>
          {labels.paintSeed} {item.paintSeed}
        </p>
      )}

      {item.stickers.length > 0 && (
        <section className={classes.section}>
          <h3 className={classes.sectionTitle}>{labels.stickers}</h3>
          <ol className={classes.list}>
            {item.stickers.map((sticker, index) => (
              <li key={`${sticker.name}-${index}`} className={classes.attachment}>
                <span aria-hidden className={classes.slot}>
                  {index + 1}
                </span>
                {sticker.imageUrl === null ? (
                  <span aria-hidden className={classes.attachmentPlaceholder} />
                ) : (
                  <img
                    src={sticker.imageUrl}
                    alt=""
                    width={ITEM_INSPECT_CARD.attachmentSize}
                    height={ITEM_INSPECT_CARD.attachmentSize}
                    loading="lazy"
                    decoding="async"
                    className={classes.attachmentImage}
                  />
                )}
                <span className={classes.attachmentText}>
                  <span className={classes.attachmentName}>{sticker.name}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {item.charms.length > 0 && (
        <section className={classes.section}>
          <h3 className={classes.sectionTitle}>{labels.charms}</h3>
          <ul className={classes.list}>
            {item.charms.map((charm, index) => (
              <li key={`${charm.name}-${index}`} className={classes.attachment}>
                {charm.imageUrl === null ? (
                  <span aria-hidden className={classes.attachmentPlaceholder} />
                ) : (
                  <img
                    src={charm.imageUrl}
                    alt=""
                    width={ITEM_INSPECT_CARD.attachmentSize}
                    height={ITEM_INSPECT_CARD.attachmentSize}
                    loading="lazy"
                    decoding="async"
                    className={classes.attachmentImage}
                  />
                )}
                <span className={classes.attachmentText}>
                  <span className={classes.attachmentName}>{charm.name}</span>
                  {charm.pattern !== null && (
                    <span className={classes.attachmentMeta}>
                      {labels.pattern} #{charm.pattern}
                    </span>
                  )}
                </span>
                {charm.price !== null && currency !== undefined && (
                  <span className={classes.attachmentPrice}>
                    {formatMoney(charm.price, currency)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <dl className={classes.facts}>
        {facts.map((fact) => (
          <div key={fact.label} className={classes.fact}>
            <dt className={classes.factLabel}>{fact.label}</dt>
            <dd className={cn(classes.factValue, fact.strong && classes.price)}>{fact.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
