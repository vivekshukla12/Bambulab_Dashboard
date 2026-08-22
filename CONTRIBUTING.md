# Contributing

Contributions are welcome as the project matures. This repository follows controlled milestone governance so useful ideas do not silently expand approved scope.

## Before making changes

1. Read `project-control/status/CURRENT_STATUS.md`.
2. Read `project-control/handoffs/CHATGPT_HANDOVER.md`.
3. Confirm the current milestone and authorized scope.
4. For Codex work, read `prompts/codex/RESUME.md` and `prompts/codex/NEXT_PROMPT.md`.
5. Check `TRADEMARKS.md`, `SECURITY.md`, and relevant specifications.
6. Do not start later-milestone work without explicit product-owner authorization.

## Branch / PR model

Unless explicitly approved otherwise:

```text
feature branch -> draft PR -> implementation -> tests -> independent review -> product-owner decision -> merge
```

Tests passing does not imply merge approval.

## License of contributions

The repository is licensed under the Mozilla Public License 2.0. Unless explicitly agreed otherwise before submission, contributions are submitted under MPL-2.0 and contributors retain copyright in their original contributions. Contributors must only submit material they have the right to contribute.

Do not add third-party code, media, logos, fonts, documentation, generated assets, or datasets unless their licensing/provenance is compatible and documented.

## Bambu Lab / third-party IP

This is an independent interoperability project. Do not submit Bambu Lab proprietary software, firmware, private API credentials, copyrighted media/assets, logos, or other protected content merely because it is technically obtainable. References to Bambu Lab products should be compatibility-oriented and must not imply official affiliation or endorsement. See `TRADEMARKS.md`.

## Data hygiene

Never commit production/customer-derived data, real credentials, tokens, live private device responses, screenshots containing sensitive information, or private camera/media content. Use deterministic synthetic fixtures under `test-fixtures/synthetic/`.

## Scope suggestions

Ideas outside the current milestone are welcome, but record them as future considerations/issues rather than implementing them opportunistically.
