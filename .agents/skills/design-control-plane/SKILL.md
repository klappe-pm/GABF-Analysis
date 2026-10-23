---
name: design-control-plane
description: "Build and run a project's design control plane: a clickable prototype where every screen is drawn, a panel that explains each screen's job to be done, journey step, options and components, and a version controlled feedback loop that turns a reviewer's note into a recorded change. Use when the user wants to see user flow mockups, walk a journey, review UI surfaces, give feedback on a design, ask what a change to a token or sketch would reach, or set up design review for a project. Triggers: 'show me the user flows', 'mockups for each screen', 'design control plane', 'review the prototype', 'give feedback on this screen', 'what does changing this token reach', 'blast radius of this design change', 'set up the design prototype'. Do NOT use for writing production UI code, for a one-off visual tweak to a real page, or for design work in a project that has no interaction spec to render."
license: MIT
---

# design-control-plane

A design that lives in a specification document is argued about in the abstract. A design that lives only in a Figma file cannot be diffed, cannot be gated, and cannot answer what a change reaches. This skill builds the third thing: a generated, version controlled control plane where every screen is drawn from the same manifest the gate checks, every screen explains itself, and feedback on it becomes a record in git rather than a message in a thread.

The implementation is `product-feedback` (`/Users/kevinlappe/projects/active/product-feedback`), a development tool any project can turn on. It is installed once per machine and puts the `product-feedback` command on the path; a project's build, continuous integration and deploy never import it.

## is-it-on-for-this-project

Two switches, both required. llm-root delivers this skill only to a project whose column has `x` on the `skill:design-control-plane` row of `control-plane.md`; that is the cross project toggle. The project itself opts in with `product-feedback.config.json` at its root holding `"enabled": true`; every command refuses to act on a project without it. Check both before acting:

```bash
cd /Users/kevinlappe/projects/active/<project> && product-feedback status
```

When the command is missing, install it:

```bash
cd /Users/kevinlappe/projects/active/product-feedback && npm ci && npm link
```

When the project has no config yet, bootstrapping it (below) starts with that file. The keys are in `docs/configuration.md` of the product-feedback repository; a project names only what differs from the defaults.

## what-the-control-plane-is

Five artifacts under the project's design folder (`docs/design/` by default), and nothing else is authoritative.

| File | Holds | Never |
| --- | --- | --- |
| `design-nodes.json` | every node: surface, screen, component, style, copy, error, journey, scenario, and what each consumes | token values |
| `tokens.json` | the token set, published from wherever it is owned upstream | a value invented here |
| `design-flags.json` | proposed token overrides, their scope, owner, reason and hypothesis | a base value |
| `design-change-log.jsonl` | every proposed change, append only, hash chained | an edit to an earlier line |
| `../feedback/<page>/<id>-<slug>.md` | one Markdown ticket per piece of feedback, with its captured images beside it | an edit to someone's words after the fact |

The interaction spec, `docs/design/interaction-spec.md`, is the behaviour: one `### s-NN-name` section per screen, a prose paragraph, an `Actions:` line and a `Goes to:` line. The manifest is the dependency graph. Everything rendered is generated from those two, so the prototype cannot disagree with the specification.

## the-central-idea-surfaces

Screens are states of surfaces, not separate designs. Thirty five screens over five surfaces means five things to draw and thirty five states to compose, and it means a change to one sketch has a knowable blast radius.

Declare the mapping once, and synthesize the edges rather than writing them on every screen:

```json
"surfaces": {
  "query-table": { "content": "...", "sketch": "query-table.html", "screens": ["S-01", "S-02"] }
}
```

The gate then enforces that every screen belongs to exactly one surface. Two means the mapping says it twice; none means no sketch owns what the screen is drawn from and nothing can be composed for it.

This is the edge that makes the control plane a control plane:

```bash
cd /Users/kevinlappe/projects/active/<project> && product-feedback design impact surface:query-table
```

## the-commands

Run from anywhere inside the project; the root is the nearest folder holding `product-feedback.config.json`.

```bash
cd /Users/kevinlappe/projects/active/<project> && product-feedback design generate
cd /Users/kevinlappe/projects/active/<project> && product-feedback design check
cd /Users/kevinlappe/projects/active/<project> && product-feedback review serve --port 4173 --pipeline off
cd /Users/kevinlappe/projects/active/<project> && product-feedback tickets list
cd /Users/kevinlappe/projects/active/<project> && product-feedback tickets resolve WI-001 --commit <sha> --note "what was done"
cd /Users/kevinlappe/projects/active/<project> && product-feedback decisions list
```

`design check` fails when what is on disk no longer matches the manifest and when a ticket is malformed. Wire it into the project's local design gate, so a manifest edit that was never regenerated is a gate failure rather than a surprise three sessions later. It stays out of continuous integration, which does not install the tool.

## composing-a-screen

Take the surface's shell and body, then apply the state the screen's own nodes declare. Draw only the regions the manifest lists.

That last sentence is the rule that matters, and it is learned rather than obvious. A screen whose archive has failed declares a banner, a block and a terminal, and no table. Rendering a table anyway produced four rows of fresh data under a banner saying the archive could not be opened, which is a contradiction no static check catches and a screenshot catches instantly. Evidence panels are per screen for the same reason: one block of output pasted under every screen that happens to declare a terminal is worse than none.

- `error` and `blocked`: a banner carrying the error node's `problem` and `recovery` verbatim. Never invent the words; the error node is the contract.
- `empty`: the copy node, plus the command that widens the search.
- `loading`: what is already known, and cancel reachable for the whole run.
- `stale`: the answer served, with the staleness stated beside it rather than in front of it.

## actions-are-clickable-or-they-are-gaps

A spec that writes `Goes to: S-04 on a row, S-05 on an open link` names both the destination and the action that reaches it. Match them on shared words and the action becomes a link. An action with no destination stays clickable and says so, visibly, because an action that leads nowhere is a gap in the design and hiding it in a renderer is how it survives review.

## the-explain-panel

A right hand flyover, off canvas until asked for, carrying in this order: the job to be done as When, I want to, So that; the accepted scenarios; the journey steps with the current one marked; what the screen does; its options and where each lands; its error contract; its surface and the sketch it is drawn from; and every node it is made of.

Make the panel linkable, `#S-08/explain`. An explanation that can only be reached by clicking cannot be pointed at in a review or captured in a screenshot.

## the-feedback-loop

Feedback is a file, not a conversation.

1. The reviewer pins spots on the framed page and types a note, or edits page copy in place, through the review server. The server writes an ACCEPTED ticket under the feedback folder, `<page>/<id>-<slug>.md`, and captures screenshots beside it.
2. The agent reads open tickets with `product-feedback tickets list` and `show <id>`.
3. The agent makes the change, or decides not to.
4. The agent records the outcome with `tickets resolve <id> --commit <sha> --note "<what was done>"`, or `tickets decline <id> --note "<why>"`.

With the pipeline on (`review serve --pipeline on`, which needs `repo` and `owner` in the config), a saved ticket becomes a GitHub issue, a branch, a verified pull request, a merge and a handoff with no one at the keyboard; `tickets process --dry-run` prints every `gh` and `git` command it would run. A question only the owner can answer is filed with `product-feedback decisions open`, and the owner's reply becomes a ticket that runs the same way.

Tickets are never deleted. A resolution is recorded on the ticket, so feedback that was considered and rejected leaves the same trace as feedback that was acted on. That is the reason to keep it in git rather than in a comment thread: the argument is preserved next to the diff that settled it.

### three-things-that-are-easy-to-get-wrong

**Scan the text before persisting it.** Feedback is the one place where words from a person become a committed file, so someone will eventually paste a credential into a note about why a screen is wrong. product-feedback runs a token-shape detector at capture time and again before anything leaves for GitHub; store the redacted text and the labels of what was removed, never the value. Redacting after the commit is cleanup, not prevention.

**Bind the server to `127.0.0.1`.** It writes into the repository. Nothing off the machine has any business doing that. product-feedback's server binds there and refuses writes from another origin.

**Keep the ticket folder out of the prose checks.** Tickets are Markdown holding a reviewer's own words, so the project's prose checker and pre-commit prose hook skip the feedback folder, and `product-feedback design check` validates each ticket's structure instead. Nobody should have to rewrite what a person actually said in order to commit it.

## reviewing-what-you-built

The prototype is HTML, which means it can be looked at without a design tool. Use that; it is the whole reason the browser renderer exists beside any Figma output.

Capture a batch across surfaces and states, fix everything one round shows, confirm with one more round, then stop. Defect classes that are invisible in code and obvious in a screenshot, all seen in practice: inline spans running a title into its description, an off canvas panel extending the document and scrolling the page sideways, a region rendered that the data never declared, a first load that is a bare panel under a dropdown.

That last one is worth stating as a rule. If the design's own state rules say empty is never bare, the control plane obeys them too: the default view is the map of jobs, not an empty frame.

## bootstrapping-a-project

1. Add `product-feedback.config.json` with `"enabled": true`, the token stylesheet, and any folder that differs from the defaults; put `x` in the project's column on the `skill:design-control-plane` row of llm-root's `control-plane.md` and run llm-root's sync.
2. Write `docs/design/interaction-spec.md` with one section per screen, each carrying prose, `Actions:` and `Goes to:`.
3. Write `docs/design/design-nodes.json` with the nodes, the consumes edges, and the `surfaces` block.
4. Draw one sketch per surface under `docs/design/sketches/`, linking the token stylesheet rather than copying values.
5. Run `product-feedback design generate`, screenshot, fix, commit.
6. Add `product-feedback design check` to the project's local design gate.

The order matters. The spec and the manifest come first because everything else is generated from them; a prototype hand built before they exist becomes a second source of truth that drifts.

## relationship-to-other-rules

`captured-content-redaction` governs the feedback store's scanning. `no-em-dash` and `no-hardwrapped-writing` apply to the prose the agent writes into the spec and the manifest, and deliberately not to what a reviewer typed. `finish-or-record-scope-change` applies when a screen cannot be drawn: record why, with its blocker, rather than leaving it described in a closing message.
