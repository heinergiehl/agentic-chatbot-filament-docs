# Commercial Ship Runbook

This is an operator sequence, **not release evidence**. Do not commit completion checkboxes. The protected workflow, exact artifact manifests, audit output, and reference-host report carry status.

## Before approval

1. Confirm `heiner/agent-graph` at the constraint in `composer.json` is available through a customer-accessible Composer repository.
2. Confirm the Anystack PHP product points at this GitHub repository, its Composer distribution is enabled, and auto-publish is configured for GitHub Releases.
3. Enable [GitHub release immutability](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/establish-provenance-and-integrity/prevent-release-changes) for this repository. It applies only to future releases; the protected workflow deliberately fails if the published release is not immutable.
4. Run `composer release:marketplace-check` on the exact candidate commit.
5. Confirm `composer assurance:content-secret-scan` passes with no unreviewed finding, then require the protected workflow to repeat the scan over every text file in the exact commercial ZIP. Never put a maintainer-owned provider key into source, fixtures, CI, or the release environment to satisfy a buyer installation.
6. Confirm `composer audit --no-dev --locked` and the workflow-editor `npm audit` report no high or critical production advisory.
7. Synchronize the canonical package files named by `scripts/release/docs-drift-check.php` byte-for-byte into the public docs checkout, then run `composer assurance:docs-drift` with `AGENTIC_CHATBOT_REQUIRE_PUBLIC_DOCS=true`. Locally the default authoritative checkout is `../agentic-chatbot-filament-docs`; protected CI freshly checks out `heinergiehl/agentic-chatbot-filament-docs` into `${{ github.workspace }}/public-docs`.
8. Review `CHANGELOG.md`, `UPGRADING.md`, versioned release notes, known limitations, compatibility, support, refund, and license terms against the release contract.
9. Review the canonical `docs/FILAMENT_PLUGIN_PAGE.md`; synchronize it byte-for-byte to the public marketplace source.
10. Deploy the exact candidate to the public demo, capture fresh Agent-first screenshots from that release-matched host, and verify that every visible label and claim matches the candidate.
11. Execute the Docker/PostgreSQL reference-host Golden Path and retain the redacted evidence report.

## Approval and protected workflow

1. After all candidate gates pass, change `release_status` in `scripts/release/release-contract.json` from `candidate` to `approved` and change every release-contract status marker from `**Release status:** Candidate` to `**Release status:** Approved` in the same reviewed commit. Remove the candidate-only warning from the versioned release notes; `composer assurance:release-contract` rejects a mixed status.
2. Run the protected release workflow for that exact commit and target version.
3. Require every protected job. A skipped provider, artifact, install, upgrade, rollback, soak, or contract job is blocking.
4. Confirm the tag workflow created the GitHub Release only after `release-ready` and attached the same verified ZIP, sidecar, and checksum consumed by the exact-artifact jobs. A GitHub Actions artifact or source archive is not the Anystack distribution proof.
5. Confirm the workflow re-downloaded the draft ZIP byte-for-byte before publication and verified the immutable release attestation afterward. Independently download the published ZIP and sidecar before announcing the version to buyers.
6. Publish the marketplace listing, public docs snapshot, checksum, and support/EOL dates as one coordinated operation.

## Conditional integration evidence

Widget or chat-runtime changes require the public-widget browser smoke on the configured reference host. Playbook-editor changes require `npm --prefix tests/e2e run test:playbook-editor` against the Docker/PostgreSQL host described in `docs/LOCAL_HOST_APP.md`. If a change does not touch that boundary, record the gate as `not applicable`, never as passed.

## After publication

1. Install the published package into a new supported host through Anystack's private Composer repository with a test-buyer license, never a local path or GitHub VCS repository.
2. Run Doctor, migrations, queue processing, tokenless widget bootstrap, one real chat, and run/trace inspection.
3. Verify support links, purchase terms, artifact checksum, release notes, and rollback instructions from the buyer-visible pages.
4. Keep the exact release evidence for the support lifetime of the release line.
