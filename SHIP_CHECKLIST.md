# Commercial Ship Runbook

This is an operator sequence, **not release evidence**. Do not commit completion checkboxes. The exact artifact manifests, hashed local gate reports, and reference-host staging report carry status.

GitHub Actions is intentionally disabled with `on: []` in both workflow stubs. Pushes, pull requests, tags, and manual actions therefore start no GitHub-hosted runner and cost zero Actions minutes. Run the release gates on the operator-controlled host. Live provider evals can still incur provider API charges.

## Before approval

1. Confirm `heiner/agent-graph` at the constraint in `composer.json` is available through a customer-accessible Composer repository.
2. Confirm the Anystack PHP product points at this GitHub repository, Composer distribution is enabled, and GitHub Release publication is connected.
3. Enable [GitHub release immutability](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/establish-provenance-and-integrity/prevent-release-changes) for future releases.
4. Prepare the required local credentials, PostgreSQL/pgvector service, Docker tooling, and public-docs checkout for the local assurance command.
5. Review `CHANGELOG.md`, `UPGRADING.md`, the versioned release notes, known limitations, compatibility, support, refund, and license terms against `scripts/release/release-contract.json`.
6. Review `docs/FILAMENT_PLUGIN_PAGE.md` and synchronize it byte for byte to the marketplace source.
7. Never put a maintainer-owned provider key into source, fixtures, an evidence report, the commercial archive, or a buyer installation.

## Approval and local publication

1. Change `release_status` in `scripts/release/release-contract.json` from `candidate` to `approved`. Change every release-contract marker from `**Release status:** Candidate` to `**Release status:** Approved` and remove the candidate-only warning from the versioned release notes. This authorizes the exact commit to enter production assurance; it does not declare that the gates passed. `composer assurance:release-contract` rejects mixed state.
2. Synchronize the approved package files to the public docs checkout again, commit and push that exact public snapshot, and write its full commit SHA to `public_docs_commit` in the release contract.
3. Commit and push the approved package candidate to the repository's default branch. Do not create or push a version tag.
4. On that exact approved clean commit, resolve one Composer graph and build the exact candidate ZIP as described in `docs/RELEASE_ASSURANCE.md`.
5. Install that ZIP from package HEAD into the local Docker/PostgreSQL reference host. Capture fresh screenshots and run the Golden Path, public widget smoke, real Agent chat, Agent/Playbook execution, queue processing, and trace inspection. Run `npm --prefix tests/e2e run test:playbook-editor` when the changed boundary requires it. Retain its machine-readable `reference_host_candidate` report.
6. Run `composer release:record-evidence -- --version=0.18.0 --candidate-host-evidence=/absolute/path/to/reference-host-candidate.json --output=build/release/local-release-evidence-0.18.0.json`. The helper requires approved status, executes the local gates itself, including `composer assurance:docs-drift`, and writes passing machine-readable envelopes only for commands that exit successfully. It binds report hashes, source commit, Composer lock, and commercial ZIP without hand-edited pass state.
7. Confirm the working tree is clean, HEAD is the default branch's exact upstream commit, `gh auth status` passes, and no local tag, remote tag, draft release, or published release exists for the version. The publisher repeats these checks.
8. Prepare the tag and draft Release, without a `v` prefix in the version:

```bash
composer release:publish-local -- \
  --phase=prepare \
  --version=0.18.0 \
  --evidence=/absolute/path/to/local-release-evidence.json
```

9. Confirm preparation reports `status: "prepared"`. The tag now exists and the three byte-verified assets remain in a draft Release. Nothing is buyer-visible through the Release yet.
10. Deploy exact tag `v0.18.0` to VPS staging. Require the exact package commit and ZIP digest plus passed migrations, Doctor, Widget, and Agent/Playbook checks. Retain the machine-readable staging report with exact host commit and lock digest.
11. Finalize the draft:

```bash
composer release:publish-local -- \
  --phase=finalize \
  --version=0.18.0 \
  --evidence=/absolute/path/to/local-release-evidence.json \
  --staging-evidence=/absolute/path/to/vps-staging-evidence.json
```

12. Confirm final JSON reports `status: "published"`, the exact source commit and ZIP digest, three verified API asset digests when GitHub exposes them, and `github_immutable: true` when the API exposes immutability.
13. If preparation fails before remote tag creation, confirm the script removed its local tag. If remote state is uncertain, run the printed `git ls-remote` probe and preserve the local tag until resolved. Once the remote tag exists, never move, delete, or force-push it. Resume finalization or deliberately supersede the version.
14. Deploy production only from the same host commit, host lock, package version, and package artifact proven by VPS staging.
15. Publish the marketplace listing, public docs snapshot, checksum, and support/EOL dates as one coordinated operation.

## Conditional integration evidence

Widget or chat-runtime changes require public-widget browser smoke on reference-host staging. Playbook-editor changes require its E2E test against the Docker/PostgreSQL host in `docs/LOCAL_HOST_APP.md`. Record an untouched boundary as `not applicable`, never as passed.

## After publication

1. Install the published package into a new supported host through Anystack's private Composer repository with a test-buyer license, never a local path or GitHub VCS repository.
2. Run Doctor, migrations, queue processing, tokenless widget bootstrap, one real chat, and run/trace inspection.
3. Verify support links, purchase terms, artifact checksum, release notes, and rollback instructions from buyer-visible pages.
4. Keep the exact release evidence for the support lifetime of the release line.
