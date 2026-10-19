# Commercial Ship Runbook

This is an operator sequence, **not release evidence**. Do not commit completion checkboxes. The exact artifact manifests, hashed local gate reports, and local reference-host candidate report carry status.

GitHub Actions is intentionally disabled with `on: []` in both workflow stubs. Pushes, pull requests, tags, and manual actions therefore start no GitHub-hosted runner and cost zero Actions minutes. Run the release gates on the operator-controlled host. Real local RAG/chat acceptance can incur provider API charges; install smokes are keyless.

## Before approval

1. Confirm `heiner/agent-graph` at the constraint in `composer.json` is available through a customer-accessible Composer repository.
2. Confirm the Anystack PHP product points at this GitHub repository, Composer distribution is enabled, and GitHub Release publication is connected.
3. Enable [GitHub release immutability](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/establish-provenance-and-integrity/prevent-release-changes) for future releases.
4. Prepare private database settings, PostgreSQL service, Docker tooling, and public-docs checkout for the local assurance command.
5. Review `CHANGELOG.md`, `UPGRADING.md`, the versioned release notes, known limitations, compatibility, support, refund, and license terms against `scripts/release/release-contract.json`.
6. Review `docs/FILAMENT_PLUGIN_PAGE.md` and prepare its byte-for-byte public mirror source. Verify candidate rendering before release; publish the coordinated docs/listing only after the release is verified.
7. Never put a maintainer-owned provider key into source, fixtures, an evidence report, the commercial archive, or a buyer installation.

## Approval and local publication

1. Finish all source, version/date/EOL metadata, release notes and canonical docs changes, and resolve and retain one Composer graph. Change `release_status` in `scripts/release/release-contract.json` from `candidate` to `approved`. Change every release-contract marker from `**Release status:** Candidate` to `**Release status:** Approved` and remove the candidate-only warning from the versioned release notes. Approval authorizes the final exact commit to enter production assurance; it does not declare that the gates passed. The full `composer assurance:release-contract` check must wait until D is pinned in step 2; it rejects a missing pin or mixed state.
2. Only after step 1 is complete, synchronize the final canonical package files to the public docs checkout using the map in `scripts/release/docs-drift-check.php`, including images and the selected release notes. Commit the reviewed snapshot as docs commit D, keep that checkout clean at D, and write its full SHA to `public_docs_commit` in the release contract. The contract is not a mirrored file, so pinning D requires no further mirror commit. Now run `composer assurance:release-contract` and the required pinned-mirror docs check. Do not publish stable copy before the release.
3. Commit and push the final approved package candidate, including the D pin and retained lock, on the release branch. If any canonical file changes after D was prepared and before freeze, refresh and commit the mirror, repin D and repeat the contract/docs checks before committing final C. The recorder accepts a clean reviewed `road-to-v1` commit; the default branch is required later by the publisher. Do not create or push a version tag.
4. Select clean source commit C, retain Composer lock digest L, and build the exact candidate ZIP Z as described in `docs/RELEASE_ASSURANCE.md`. Use the selected approved contract version for every command below, without a `v` prefix:

```bash
set -euo pipefail
export RELEASE_VERSION="$(php -r '$c = json_decode(file_get_contents("scripts/release/release-contract.json"), true, 512, JSON_THROW_ON_ERROR); echo $c["target_version"] ?? "";')"
: "${RELEASE_VERSION:?Select the exact reviewed version in the release contract first}"
: "${EVIDENCE_DIR:?Set an absolute retained evidence directory outside tracked source}"
GEMINI_API_KEY= ANTHROPIC_API_KEY= OPENAI_API_KEY= php scripts/release/release-contract.php \
  --expect-version="$RELEASE_VERSION" --require-status=approved
```

Keep C/L/Z and the pinned D fixed through acceptance and publication. Any source or metadata change after freeze invalidates certification: refresh D for canonical changes, commit a new C and repeat the exact-identity gates on the new C/L/Z. Retain final evaluation, targeted-check, optional soak, gate and host reports outside tracked source; a result-docs commit after freeze creates a different candidate. Stable `1.0.0` requires real local core acceptance, zero safety violations, targeted recovery evidence and the fixed local gates under the 1.0 policy (package reference `docs/release/RELEASE_POLICY_1.0.md`). An alpha or RC never waives safety or core-path defects. See `docs/RELEASE_CHECKLIST.md` for the gate inventory and isolated database runs.

5. Install that ZIP from package HEAD into the local Docker/PostgreSQL reference host. Capture fresh screenshots and run the Golden Path, public widget smoke, real Agent chat, Agent/Playbook execution, queue processing, and trace inspection. Run `npm --prefix tests/e2e run test:playbook-editor` when the changed boundary requires it. Retain its machine-readable `reference_host_candidate` report.
6. Run the recorder once on clean C:

```bash
FILAMENT_AGENTIC_CHATBOT_DISABLE_LOCAL_COPY=1 COMPOSER_PROCESS_TIMEOUT=0 \
  composer release:record-evidence -- \
  --version="$RELEASE_VERSION" \
  --candidate-host-evidence="$EVIDENCE_DIR/reference-host-candidate.json" \
  --output="$EVIDENCE_DIR/local-release-evidence-$RELEASE_VERSION.json"
```

The helper requires approved status, executes the local gates itself, including targeted runtime/security and release-contract tests, editor checks and `composer assurance:docs-drift`, and writes passing machine-readable envelopes only for commands that exit successfully. Do not repeat these suites separately without a changed candidate or failed check. It binds report hashes, source commit C, Composer lock L, and commercial ZIP Z without hand-edited pass state. It empties `GEMINI_API_KEY`, `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` for deterministic children; installs are keyless and never receive an ingestion probe. Load private database settings securely into the recorder environment without echoing them. Full package/matrix, broad pgvector, 105-dialogue evaluation, SMTP exhaustion and long soak are optional qualification and recorded as `not_run` when omitted. Use no outer process timeout.

7. After all required pre-tag gates in `docs/RELEASE_CHECKLIST.md` pass on C/L/Z, fast-forward the repository's default branch to the same C and push it. Stop if remote movement prevents preserving C; a new source commit requires new evidence. Confirm the working tree is clean, HEAD is the default branch's exact upstream commit, `gh auth status` passes, and no local tag, remote tag, draft release, or published release exists for the version. The publisher repeats these checks.
8. Prepare the tag and draft Release, without a `v` prefix in the version:

```bash
composer release:publish-local -- \
  --phase=prepare \
  --version="$RELEASE_VERSION" \
  --evidence="$EVIDENCE_DIR/local-release-evidence-$RELEASE_VERSION.json"
```

9. Confirm preparation reports `status: "prepared"`. The tag now exists and the three byte-verified assets remain in a draft Release. Nothing is buyer-visible through the Release yet.
10. Follow the owner's direct-to-Live policy (`docs/release/RELEASE_POLICY_1.0.md`, publication and direct Live deployment): finalize GitHub publication before the Live update. VPS staging is not a release prerequisite.
11. Finalize the draft with the same reviewed local evidence. The publisher revalidates all local gates, exact source/lock/artifact, remote tag and draft asset bytes before publishing:

```bash
composer release:publish-local -- \
  --phase=finalize \
  --version="$RELEASE_VERSION" \
  --evidence="$EVIDENCE_DIR/local-release-evidence-$RELEASE_VERSION.json"
```

12. Confirm final JSON reports `status: "published"`, the exact source commit and ZIP digest, three verified API asset digests when GitHub exposes them, and `github_immutable: true` when the API exposes immutability.
13. If preparation fails before remote tag creation, confirm the script removed its local tag. If remote state is uncertain, run the printed `git ls-remote` probe and preserve the local tag until resolved. Once the remote tag exists, never move, delete, or force-push it. Resume finalization or deliberately supersede the version.
14. After verified GitHub publication, deploy the exact published package version, source C and ZIP Z directly to Live. Retain the chosen host commit and lock, take a backup, run migrations and Doctor, verify queue processing, Widget and Agent/Playbook health, and retain rollback by backup restore under `UPGRADING.md`. Record deployment results separately.
15. Publish the marketplace listing, reviewed public docs commit D, checksum, and support/EOL dates as one coordinated operation. Verify the delivered GitHub and Filament pages, images and links; refresh marketplace documentation from the canonical public source and retain rendered evidence. Report any pending delivery explicitly.

## Conditional integration evidence

Widget or chat-runtime changes require public-widget browser smoke on the local reference-host candidate. Playbook-editor changes require its E2E test against the Docker/PostgreSQL host in `docs/LOCAL_HOST_APP.md`. Product App data tool write-test staging and permits remain required. Record an untouched boundary as `not applicable`, never as passed.

## After publication

1. Install the published package into a new supported host through Anystack's private Composer repository with a test-buyer license, never a local path or GitHub VCS repository.
2. Run Doctor, migrations, queue processing, tokenless widget bootstrap, one real chat, and run/trace inspection.
3. Verify support links, purchase terms, artifact checksum, release notes, and rollback instructions from buyer-visible pages.
4. Keep the exact release evidence for the support lifetime of the release line.
