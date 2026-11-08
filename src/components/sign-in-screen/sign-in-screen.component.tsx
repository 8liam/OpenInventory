import { LoginCard } from "~/components/login-card/login-card.component";
import { Logo } from "~/components/logo/logo.component";
import { COPY } from "~/lib/copy/copy.config";
import { SIGN_IN_SCREEN } from "./sign-in-screen.config";
import type { SignInScreenProps } from "./sign-in-screen.types";

/** First run: no account is tracked yet, so the only thing to do is add one. */
export function SignInScreen({ login }: SignInScreenProps) {
  const copy = COPY.signIn;
  return (
    <div className={SIGN_IN_SCREEN.rootClass}>
      <div className={SIGN_IN_SCREEN.contentClass}>
        <Logo className={SIGN_IN_SCREEN.logoClass} />
        <LoginCard
          login={login}
          title={copy.title}
          body={copy.body}
          buttonLabel={copy.button}
          headingLevel={1}
        />
        <p className={SIGN_IN_SCREEN.footnoteClass}>{copy.footnote}</p>
      </div>
    </div>
  );
}
