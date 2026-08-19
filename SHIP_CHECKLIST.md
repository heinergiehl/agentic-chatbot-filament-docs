# Commercial Ship Runbook

This is an operator sequence, **not release evidence**. Do not commit completion checkboxes. The protected workflow, exact artifact manifests, audit output, and reference-host report carry status.

## Before approval

1. Confirm `heiner/agent-graph` at the constraint in `composer.json` is available through a customer-accessible Composer repository.
2. Run `composer release:marketplace-check` on the exact candidate commit.
3. Confirm `composer audit --no-dev --locked` and the workflow-editor `npm audit` report no high or critical production advisory.
4. Run `composer assurance:docs-drift` with `AGENTIC_CHATBOT_REQUIRE_PUBLIC_DOCS=true` and the public docs checkout available.
5. Review `CHANGELOG.md`, `UPGRADING.md`, versioned release notes, known limitations, compatibility, support, refund, and license terms against the release contract.
6. Review the canonical `docs/FILAMENT_PLUGIN_PAGE.md`; synchronize it byte-for-byte to the public marketplace source.
7. Execute the Docker/PostgreSQL reference-host Golden Path and retain the redacted evidence report.

## Approval and protected workflow

1. Change `release_status` in `scripts/release/release-contract.json` from `candidate` to `approved` in a reviewed commit only after all candidate gates pass.
2. Run the protected release workflow for that exact commit and target version.
3. Require every protected job. A skipped provider, artifact, install, upgrade, rollback, soak, or contract job is blocking.
4. Download and independently verify the commercial ZIP and sidecar before uploading the package anywhere.
5. Publish the tag, marketplace listing, public docs snapshot, checksum, and support/EOL dates as one coordinated operation.

## Conditional integration evidence

Widget or chat-runtime changes require the public-widget browser smoke on the configured reference host. Workflow/runtime changes require `npm --prefix tests/e2e run test:workflow-release` against the Docker/PostgreSQL host described in `docs/LOCAL_HOST_APP.md`. If a change does not touch that boundary, record the gate as `not applicable`, never as passed.

## After publication

1. Install the published package into a new supported host without a local path repository.
2. Run Doctor, migrations, queue processing, tokenless widget bootstrap, one real chat, and run/trace inspection.
3. Verify support links, purchase terms, artifact checksum, release notes, and rollback instructions from the buyer-visible pages.
4. Keep the exact release evidence for the support lifetime of the release line.
