# Publishing and benchmark recommendation for SPMPZ

Analysis date: 2026-09-03

## Recommendation in one sentence

Keep the new static design and add **Decap CMS + a Jekyll content layer for every page and post** as Option A; choose managed WordPress only if the association values the easiest familiar editor more than keeping the GitHub-based site.

## What Jekyll changes

Jekyll does not currently add value to the rebuilt homepage because `index.html` is complete static HTML and the legacy layouts/includes are not used by it. It becomes useful when posts are added through a CMS:

1. an editor fills in a form at `/admin`,
2. Decap CMS saves a Markdown file and image to the GitHub repository,
3. Jekyll combines that content with the existing Genesio-based templates,
4. GitHub Pages publishes the result automatically.

This lets content and layout remain separate. Editors work with named fields; they never edit HTML or CSS. GitHub documents Jekyll as the built-in customization path for GitHub Pages, and Decap supports both post collections and individually editable page files: [GitHub Pages with Jekyll](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll), [Decap CMS with Jekyll](https://decapcms.org/docs/jekyll/).

### Required editable scope

| CMS area | Editable content | Protected in the template |
| --- | --- | --- |
| Homepage | Hero text, lead story choice, introductory copy, calls to action | A/B layout, colors, typography and accessibility |
| News | Any number of posts, dates, authors, summaries, body, sources and photos | Article card and article-page design |
| About | Mission, history, values and membership copy | Section structure and heading hierarchy |
| Partners | Town name, country, description, link, status and display order | Partner-card component and responsive grid |
| Projects | Project name, dates, status, description, links, reports and gallery | Project-card and project-detail templates |
| Contact | Public email, address if used, registry data and office information | Spam-resistant markup and visual layout |
| Navigation and footer | Labels, order, social links and document links | Required accessibility labels and responsive behavior |
| Documents | PDF title, date, category, file and short description | Download-list component and file validation |

The Polish and English content should be separate fields or localized entries in the same model. Redactors may edit copy, order and media, but not raw CSS, scripts or page templates.

## Option A — Decap CMS + Jekyll (recommended)

### Why it fits SPMPZ

- keeps the current site, both visual variants and GitHub Pages,
- lets the team edit all first-level pages as well as add posts,
- has no CMS licence fee,
- stores every article and image in the repository, so backups and change history are automatic,
- provides a browser-based `/admin` panel with structured fields,
- supports drafts, review and publication rather than giving everyone immediate publishing rights,
- can generate a pull request for each unpublished entry in editorial workflow mode: [Decap editorial workflow](https://decapcms.org/docs/editorial-workflows/).

### Proposed roles

| Role | People | Permissions |
| --- | --- | --- |
| Contributor | Association members | Create and edit their own drafts, add photos and send for review |
| Editor | 1–2 board members | Correct, approve and publish posts |
| Technical administrator | 1 person | Manage accounts, repository and deployment; no daily content work |

Direct publishing should be limited to editors. The main branch should remain protected and all contributors should use two-factor authentication.

### One-time implementation

1. Extract the shared header, navigation, footer and A/B presentation into Jekyll layouts/includes.
2. Move homepage, About, Contact and other singleton content into structured YAML/Markdown files.
3. Move partner towns, projects and documents into repeatable Jekyll data/collection entries.
4. Move the Twin Green story into the first `_posts/YYYY-MM-DD-title.md` entry.
5. Add `/admin/index.html` and `/admin/config.yml` with both file collections (pages/settings) and folder collections (news/partners/projects/documents).
6. Configure GitHub authentication through an OAuth proxy and invite editors.
7. Enable `publish_mode: editorial_workflow` and branch protection.
8. Add required-field, link, image size/format and build tests for every page.
9. Run a short Polish-language onboarding session that edits a page, a partner and a draft article.

Decap's standard GitHub backend needs authentication and repository access. Its documentation describes a small serverless OAuth proxy as the lightweight GitHub setup. Open Authoring can accept contributions from people without repository write permission, but they still use GitHub and publication remains a maintainer decision: [backend and OAuth overview](https://decapcms.org/docs/backends-overview/), [Open Authoring](https://decapcms.org/docs/open-authoring/).

### Important limitation

The Decap panel edits files but does not render the public site itself; Jekyll performs that build step. Decap states this separation explicitly in its setup guide: [Decap basic steps](https://decapcms.org/docs/basic-steps/). Authentication is the most technical part and must be configured once by the administrator.

## Option B — managed WordPress

### When to choose it

Choose managed WordPress when several nontechnical people will publish frequently and the association wants the most familiar editing workflow, even at the cost of migrating away from the current static architecture.

WordPress has built-in Editor, Author and Contributor roles. A Contributor can write but cannot publish, while an Editor can manage and publish other users' posts: [WordPress roles and capabilities](https://wordpress.org/documentation/article/roles-and-capabilities/). WordPress.com currently advertises unlimited users on paid plans, with managed hosting, security and updates included; its Personal plan is listed at USD 4 per month when billed annually, subject to local tax and future price changes: [WordPress.com pricing](https://wordpress.com/pricing/).

### Trade-offs

- easiest day-to-day editor and media library,
- roles and password reset are ready-made,
- requires recreating the approved Genesio design as a WordPress theme,
- introduces a database, vendor account and recurring fee,
- makes GitHub no longer the complete source of website content,
- needs a migration plan and ongoing owner for accounts, plugins and privacy updates.

## Option C — Sanity or another hosted headless CMS

This is technically clean but not cost-effective for SPMPZ today. Sanity's Free plan includes up to 20 seats but only Administrator and Viewer roles. Editor and Contributor roles start on Growth, currently listed at USD 15 per seat per month: [Sanity pricing](https://www.sanity.io/pricing), [Sanity roles](https://www.sanity.io/docs/user-guides/roles). It would add a separate content database and a custom integration without solving moderation free of charge.

## Low-risk interim option

Before installing a full CMS, members can submit a title, text, date, source links, photo, photo credit and consent through a shared form. One editor then publishes the approved content. This interim route works for news submissions only; it does not meet the requirement to let the team edit all subpages.

## Publishing policy to adopt with either system

Every post form should require:

- title, date and short summary,
- author/contact person visible only to editors,
- image, photo credit and confirmation of publication rights,
- alternative text for every meaningful image,
- source links for factual claims,
- explicit decision whether people shown in a photo consent to online publication,
- status: draft, ready for review or published.

Automatic Facebook import is not recommended. Social posts change or disappear, embeds introduce tracking, and copied photos may not be licensed for the association's website. A short original article with a source link is safer and remains searchable.

## Strong benchmark sites

| Site | Strongest pattern | What SPMPZ should use |
| --- | --- | --- |
| [Buckingham Twinning Association](https://buckinghamtwinning.org.uk/) | Best overall content operation: fresh news, upcoming events, twin-town profiles, newsletter and a clear membership path | Add an events calendar and newsletter signup after the posting workflow is established |
| [Newbury Twin Town Association](https://www.newburytwintown.co.uk/) | Best structural comparison; it presents news, events, projects and many of the same partner towns as SPMPZ | Keep partner towns near current activity and make hosting/exchange participation concrete |
| [Darlington Town Twinning & International Association](https://www.darlingtontowntwinning.co.uk/) | Strong long-term gallery and dated news archive | Preserve older exchanges as a browsable archive rather than hiding them in PDFs |
| [Guildford Twinning Association](https://guildfordtwinning.uk/) | Strong organizational transparency: committee, newsletters, privacy and safeguarding material | Add privacy, photo/consent and safeguarding documents when member submissions launch |

The redesigned SPMPZ homepage already adopts the strongest shared ideas: a current lead story, visible partner cities, projects, source links, membership invitation and organizational documents. The next high-value additions are a calendar, regular short posts and a simple editorial policy.

## Decision

Recommended sequence:

1. publish and select Variant A or B,
2. inventory every editable Polish and English field and decide who owns it,
3. run the shared-form workflow for the first few posts to validate article fields,
4. implement Decap CMS + Jekyll for all pages, repeatable collections and posts,
5. give Contributor access to members and Editor access to two designated reviewers,
6. consider WordPress only if GitHub authentication proves too difficult for the actual editorial team.
