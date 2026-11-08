import { Button } from "~/components/button/button.component";
import { ROOT_ERROR } from "./root-error.config";
import type { RootErrorProps } from "./root-error.types";

const { classes } = ROOT_ERROR;

/**
 * The last resort when rendering throws: a landmarked page with a heading and a way back, instead
 * of a blank screen. It stands alone, so it relies on nothing the shell provides.
 */
export function RootError({ error }: RootErrorProps) {
  const detail = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return (
    <main className={classes.root} aria-labelledby={ROOT_ERROR.headingId}>
      <h1 id={ROOT_ERROR.headingId} className={classes.title}>
        {ROOT_ERROR.title}
      </h1>
      <p className={classes.body}>{ROOT_ERROR.body}</p>
      {detail !== "" && <p className={classes.detail}>{detail}</p>}
      <div className={classes.actions}>
        <Button variant="primary" onClick={() => window.location.reload()}>
          {ROOT_ERROR.reload}
        </Button>
      </div>
    </main>
  );
}
