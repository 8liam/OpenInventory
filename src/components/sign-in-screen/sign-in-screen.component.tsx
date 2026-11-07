import { LoginCard } from "~/components/login-card/login-card.component";
import { Logo } from "~/components/logo/logo.component";
import { COPY } from "~/lib/copy/copy.config";
import type { SignInScreenProps } from "./sign-in-screen.types";

/** First run: no account is tracked yet, so the only thing to do is add one. */
export function SignInScreen({ login }: SignInScreenProps) {
  const copy = COPY.signIn;
  return (
    <div className="flex h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Logo className="mb-8 justify-center text-lg" />
        <LoginCard login={login} title={copy.title} body={copy.body} buttonLabel={copy.button} />
        <p className="mt-4 text-center text-xs text-muted-foreground">{copy.footnote}</p>
      </div>
    </div>
  );
}
