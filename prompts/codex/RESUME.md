# Codex Resume Protocol — Bambu Printer Dashboard

Whenever instructed to resume this project:

1. Read repository instructions and `README.md`.
2. Read `project-control/status/CURRENT_STATUS.md`.
3. Read `project-control/handoffs/CHATGPT_HANDOVER.md`.
4. Read `prompts/codex/NEXT_PROMPT.md`.
5. Read all specifications referenced by `NEXT_PROMPT.md`, including the iterative delivery model when a product milestone is active.
6. Inspect current Git status, branch, and relevant pull request state.
7. Confirm the authorized milestone/task scope before changing code.
8. Continue **only** the task authorized by `NEXT_PROMPT.md`.
9. Stop and report any stop condition, scope conflict, architecture/security/privacy change, unexpected dependency, or need for later-milestone work.
10. Use only synthetic fixtures unless explicit product-owner approval states otherwise.
11. Keep the milestone prototype runnable where practical and preserve previously validated prototype behavior unless an approved change intentionally replaces it.
12. Run all required automated tests and prototype validation steps from the authorized prompt.
13. Update required project-control files, including milestone feedback evidence when instructed.
14. Report results, tests, prototype run path, changed files, risks, and unresolved decisions.
15. Do not merge a pull request unless explicitly authorized by the product owner.

If `NEXT_PROMPT.md` status is `HOLD`, `BLOCKED`, or otherwise not `QUEUED`, do not implement product features.
