# M2 Product Owner Feedback — 2026-08-30

## Classification

**Fix before M2 completion.** The Product Owner considers the current prototype not ready for detailed M2 validation. Real-device testing should pause until the onboarding/configuration gaps below are remediated and the X2D connection issue is investigated within the approved M2 constraints.

## Product Owner observations

1. **A1 Mini basic real telemetry previously worked.** The Product Owner successfully connected the A1 Mini during earlier hands-on testing and observed basic real telemetry. This remains valid limited feasibility evidence only; deeper A1 Mini testing is still pending.
2. **X2D connection failed while the printer was actively printing.** This is a Product Owner local test finding. No private identifiers, credentials, raw payloads, or unsanitized logs are recorded here. The exact cause is not yet verified.
3. **Discovery is not sufficiently automatic in the current UX.** The Product Owner expects the application/server to automatically search for compatible printers, show discovered candidates, and then ask the user only for required information such as the LAN Access Code. Manual connection data should remain a fallback rather than the normal onboarding path.
4. **Configured-printer settings cannot be corrected.** If connection information is entered incorrectly, the current prototype does not provide a clear edit/reconfigure flow for the configured printer.
5. **Configured printers cannot be removed.** The current prototype needs a safe delete/remove action for a configured printer so failed or obsolete onboarding entries can be cleared and re-added.
6. **Synthetic printers are no longer useful in the normal Product Owner workflow.** The Product Owner does not want synthetic printers mixed into the ordinary product experience now that real-printer connectivity exists. However, deterministic synthetic mode remains an approved internal regression/test requirement under the existing architecture and must not be deleted from automated/offline testing without a separate architecture decision. The expected remediation is to hide/disable synthetic devices in the normal real-printer product view by default while preserving the internal synthetic adapter/scenarios for tests, development, and explicit diagnostic/demo use.
7. **General UI/frontend modernization remains deferred.** This remediation is about functional onboarding/configuration readiness, not the previously deferred visual redesign.

## Required remediation before Product Owner resumes detailed M2 testing

- Automatically initiate bounded server-side printer discovery on the appropriate fleet/onboarding entry path, with a visible refresh/rescan option and clear states for searching, found, none found, and discovery failure.
- Keep browser-side LAN scanning prohibited; discovery remains server-owned.
- Preserve manual IP/hostname + required access metadata fallback when discovery is unavailable or unreliable.
- For a discovered candidate, ask only for the minimum additional required user input (for example the LAN Access Code and any unavoidable metadata that discovery cannot safely/reliably supply).
- Add a clear **Edit / Reconfigure** flow for an existing real-printer configuration. Sensitive credentials must not be displayed back to the user; replacing an Access Code should require entering a new value.
- Add a clear **Remove printer** action with an appropriate confirmation. Removal must clean process-memory configuration/credentials and any associated onboarding state without exposing secrets.
- Hide synthetic printer cards from the normal real-printer fleet experience by default while preserving deterministic synthetic regression infrastructure and an explicit development/test path.
- Investigate the X2D failure while printing using only the approved standard-mode local read-only path. Do not use Developer Mode, Fleet Hub, cloud-client impersonation, private partner credentials, write/control commands, weakened TLS/security, or proprietary implementation copying. If the standard approved path cannot connect reliably to X2D during printing, record the sanitized boundary as M2 feasibility evidence rather than bypassing it.
- Add/adjust automated tests for automatic discovery initiation, rescan behavior, edit/reconfigure, remove, synthetic-view suppression/defaults, credential redaction, and X2D-relevant connection lifecycle behavior using mocked/sanitized data only.
- Update runbook, contracts/module documentation, M2 evidence, CURRENT_STATUS, CHATGPT_HANDOVER, risks if warranted, and PR description/evidence after remediation.

## Acceptance for remediation

The remediation is ready for Product Owner retest only when:

- discovery happens automatically without requiring the user to know the printer IP in the normal path;
- required credentials/details can be supplied after candidate discovery;
- a configured real printer can be edited/reconfigured;
- a configured real printer can be removed and re-added;
- normal fleet UX is real-printer focused, with synthetic mode retained only as explicit internal/dev/test functionality;
- X2D connection behavior while printing is either fixed under the approved interface or documented as a sanitized feasibility limitation;
- automated validation and CI pass;
- PR #3 remains draft/unmerged until Product Owner retest and explicit acceptance/merge authorization.

## Security / privacy reminder

Do not commit or request LAN Access Codes, serial numbers, MAC addresses, local IPs/hostnames, account identifiers, raw MQTT/device payloads, packet captures, private printer media, or unsanitized live-device logs. Local debugging findings must be reduced to sanitized classifications/summaries before repository inclusion.
