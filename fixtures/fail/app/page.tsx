import { currentSession } from "@/lib/session";

/*
 * Decoys on purpose:
 *   token.startsWith("demo_") mentioned in a comment is documentation.
 *   const mode = "demo_mode" lowercase is an unrelated string.
 *   fetch("https://example.com//double") keeps its slashes inside a string.
 */
const LABEL = "demo_mode banner";

export default async function Page() {
  const session = await currentSession();
  return (
    <main>
      <h1>{LABEL}</h1>
      <p>Signed in as tenant {session?.tenantId ?? "none"}.</p>
    </main>
  );
}
