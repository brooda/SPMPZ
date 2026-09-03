import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const copy = {
  pl: {
    skip: "Przejdź do treści",
    brand: "Przyjaciele miast partnerskich Zamościa",
    home: "Strona główna",
    news: "Aktualności",
    partners: "Partnerzy",
    projects: "Projekty",
    about: "O nas",
    contact: "Kontakt",
    menu: "Menu",
    look: "Wybierz wygląd strony",
    green: "Zielony",
    blue: "Niebieski",
    language: "EN",
    pages: "Podstrony",
    top: "Na górę",
    photos: "Zdjęcia: archiwum SPMPZ, Jacek Bełz",
  },
  en: {
    skip: "Skip to content",
    brand: "Friends of Zamość Twin Towns",
    home: "Home",
    news: "News",
    partners: "Partners",
    projects: "Projects",
    about: "About us",
    contact: "Contact",
    menu: "Menu",
    look: "Choose the site appearance",
    green: "Green",
    blue: "Blue",
    language: "PL",
    pages: "Pages",
    top: "Back to top",
    photos: "Photos: SPMPZ archive, Jacek Bełz",
  },
};

const routes = {
  pl: { home: "index.html", about: "about_pl.html", partners: "partners_pl.html", projects: "projects_pl.html", contact: "contact_pl.html" },
  en: { home: "english.html", about: "about_en.html", partners: "partners_en.html", projects: "projects_en.html", contact: "contact_en.html" },
};

function header(lang, counterpart, isHome = false) {
  const c = copy[lang];
  const r = routes[lang];
  const href = (key, section) => isHome ? `#${section}` : r[key];
  return `
    <div class="page-top" id="top" aria-hidden="true"></div>
    <a class="skip-link" href="#main-content">${c.skip}</a>
    <header class="site-header" id="site-header">
      <div class="site-header__inner shell">
        <a class="brand" href="${r.home}" aria-label="SPMPZ — ${c.home}">
          <span class="brand__mark" aria-hidden="true">SP</span>
          <span class="brand__name"><strong>SPMPZ</strong><span>${c.brand}</span></span>
        </a>
        <button class="nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation">
          <span class="nav-toggle__label">${c.menu}</span><span class="nav-toggle__icon" aria-hidden="true"></span>
        </button>
        <nav class="primary-nav" id="primary-navigation" aria-label="${c.pages}">
          <ul>
            <li><a href="${href("home", "aktualnosci")}">${c.news}</a></li>
            <li><a href="${href("partners", "partnerzy")}">${c.partners}</a></li>
            <li><a href="${href("projects", "projekty")}">${c.projects}</a></li>
            <li><a href="${href("about", "o-nas")}">${c.about}</a></li>
            <li><a href="${href("contact", "kontakt")}">${c.contact}</a></li>
          </ul>
        </nav>
        <div class="header-tools">
          <a class="language-link" href="${counterpart}" hreflang="${lang === "pl" ? "en" : "pl"}">${c.language}</a>
          <fieldset class="variant-picker" aria-label="${c.look}">
            <legend>${c.look}</legend>
            <button id="variant-a" type="button" data-variant-choice="a" aria-pressed="true">A <span>${c.green}</span></button>
            <button id="variant-b" type="button" data-variant-choice="b" aria-pressed="false">B <span>${c.blue}</span></button>
          </fieldset>
        </div>
      </div>
    </header>`;
}

function footer(lang) {
  const c = copy[lang];
  const r = routes[lang];
  return `
    <footer class="site-footer">
      <div class="site-footer__inner shell">
        <div class="brand brand--footer"><span class="brand__mark" aria-hidden="true">SP</span><span class="brand__name"><strong>SPMPZ</strong><span>${c.brand}</span></span></div>
        <nav aria-label="${c.pages}"><a href="${r.about}">${c.about}</a><a href="${r.projects}">${c.projects}</a><a href="${r.partners}">${c.partners}</a><a href="${r.contact}">${c.contact}</a></nav>
        <div class="site-footer__meta"><p>© 2026 SPMPZ</p><p>${c.photos}</p><a href="#top">${c.top} <span aria-hidden="true">↑</span></a></div>
      </div>
    </footer>`;
}

function documentPage({ lang, page, counterpart, title, description, main, home = false }) {
  return `<!doctype html>
<html lang="${lang}" data-variant="a">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#e7efe9">
    <meta name="description" content="${description}">
    <title>${title}</title>
    <link rel="stylesheet" href="css/modern.css">
    <script type="module" src="js/modern-site.mjs"></script>
  </head>
  <body data-page="${page}">${header(lang, counterpart, home)}
    <main id="main-content">${main}</main>${footer(lang)}
  </body>
</html>
`;
}

function pageHero(eyebrow, title, lead, index) {
  return `<section class="page-hero"><div class="page-hero__inner shell"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1></div><p class="page-hero__lead">${lead}</p><span class="page-hero__index" aria-hidden="true">${index}</span></div></section>`;
}

function cta(lang, heading, text) {
  const label = lang === "pl" ? "Napisz do nas" : "Write to us";
  return `<section class="page-cta"><div class="shell"><h2>${heading}</h2><div><p>${text}</p><a class="text-link" href="mailto:kontakt@spmpz.zamosc.pl">${label} <span aria-hidden="true">↗</span></a></div></div></section>`;
}

const aboutPl = documentPage({
  lang: "pl", page: "about", counterpart: "about_en.html",
  title: "O nas — SPMPZ", description: "Misja i historia Stowarzyszenia Przyjaciół Miast Partnerskich Zamościa.",
  main: `${pageHero("O stowarzyszeniu · od 2003 roku", "Partnerstwo zaczyna się od spotkania", "Pomagamy mieszkańcom Zamościa nawiązywać bezpośrednie kontakty z ludźmi z miast partnerskich.", "01")}
    <section class="page-section"><div class="shell editorial-copy"><div class="pull-quote"><p>Nie łączymy punktów na mapie. Łączymy ludzi, domy i codzienne historie.</p></div><div class="prose"><h2>Po co jesteśmy</h2><p>Naszą misją jest utrzymywanie kontaktów z miastami partnerskimi, wspieranie nauki języków, wymiana mieszkańców, promowanie Zamościa poza granicami kraju oraz działania związane z kulturą i integracją europejską.</p><p>Stowarzyszenie powstało w 2003 roku, aby ułatwić mieszkańcom miasta i okolic nawiązywanie bezpośrednich kontaktów z mieszkańcami miast bliźniaczych. Szczególnie trwała okazała się współpraca z Friends of Zamość w Loughborough, oparta na corocznych spotkaniach i pobycie w domach gospodarzy.</p><p>Od początku organizowaliśmy wydarzenia z udziałem organizacji partnerskich z Unii Europejskiej i spoza niej. Jesteśmy otwarci również na osoby oraz instytucje, dla których interesujące są Zamość, jego historia i współczesność.</p></div></div></section>
    <section class="page-section values-section"><div class="shell"><p class="eyebrow">Nasze wartości</p><ol class="value-list"><li><span>01</span><strong>Bezpośredniość</strong><small>Relacje mieszkańców, nie tylko protokoły.</small></li><li><span>02</span><strong>Ciekawość</strong><small>Języki, kultury i codzienność innych miast.</small></li><li><span>03</span><strong>Wzajemność</strong><small>Każdy może być raz gościem, raz gospodarzem.</small></li></ol></div></section>${cta("pl", "Chcesz dołączyć?", "Możesz uczestniczyć w wymianie, przyjąć gości albo pomóc przy wydarzeniu.")}`,
});

const aboutEn = documentPage({
  lang: "en", page: "about", counterpart: "about_pl.html",
  title: "About us — SPMPZ", description: "The mission and history of the Friends of Zamość Twin Towns.",
  main: `${pageHero("About the association · since 2003", "Partnership begins with meeting", "We help people in Zamość build direct contact with people living in our twin towns.", "01")}
    <section class="page-section"><div class="shell editorial-copy"><div class="pull-quote"><p>We do not connect points on a map. We connect people, homes and everyday stories.</p></div><div class="prose"><h2>Why we are here</h2><p>Our mission is to maintain relationships with partner towns, support language learning and resident exchanges, promote Zamość abroad, and encourage cultural activity and European integration.</p><p>The association was founded in 2003 to make direct contact between residents of Zamość and its twin towns easier. Our long-running relationship with Friends of Zamość in Loughborough is built around annual meetings and guests staying in members’ homes.</p><p>Since the beginning, we have organised events with partner organisations from across Europe and beyond. We are also open to anyone interested in Zamość, its history and its life today.</p></div></div></section>
    <section class="page-section values-section"><div class="shell"><p class="eyebrow">Our values</p><ol class="value-list"><li><span>01</span><strong>Direct contact</strong><small>Relationships between residents, not only protocols.</small></li><li><span>02</span><strong>Curiosity</strong><small>Languages, cultures and everyday life.</small></li><li><span>03</span><strong>Reciprocity</strong><small>Everyone can be a guest and a host.</small></li></ol></div></section>${cta("en", "Would you like to join?", "Take part in an exchange, host visitors or help us organise an event.")}`,
});

const partnerRows = [
  ["FR", "Bagnols-sur-Cèze", "Francja", "France", "https://www.jumelages-bagnols.fr/"],
  ["DE", "Braunfels", "Niemcy", "Germany", "https://www.partnerschaftsring-braunfels.de/"],
  ["ES", "Carcaixent", "Hiszpania", "Spain", "https://www.facebook.com/Associaci%C3%B3-Municipal-dAgermanament-de-Carcaixent-115559442115602"],
  ["BE", "Eeklo", "Belgia", "Belgium", "https://www.facebook.com/CISEeklo/"],
  ["IT", "Feltre", "Włochy", "Italy", ""],
  ["HU", "Kiskunfélegyháza", "Węgry", "Hungary", "https://www.facebook.com/tekiskunfelegyhaza/"],
  ["GB", "Newbury", "Wielka Brytania", "United Kingdom", "https://www.newburytwintown.co.uk/"],
  ["GB", "Loughborough", "Wielka Brytania", "United Kingdom", ""],
];

function partnerList(lang) {
  return `<ol class="directory-list">${partnerRows.map(([code, city, pl, en, url], index) => `<li><span class="directory-list__index">${String(index + 1).padStart(2, "0")}</span><span class="country-code">${code}</span><strong>${city}</strong><small>${lang === "pl" ? pl : en}</small>${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${lang === "pl" ? "Odwiedź stronę" : "Visit website"} <span aria-hidden="true">↗</span></a>` : ""}</li>`).join("")}</ol>`;
}

const partnersPl = documentPage({
  lang: "pl", page: "partners", counterpart: "partners_en.html", title: "Partnerzy — SPMPZ", description: "Europejska sieć partnerska SPMPZ.",
  main: `${pageHero("Sieć przyjaźni", "Osiem miast, wiele osobistych historii", "Grupa organizacji partnerskich spotyka się podczas wymian rodzin, młodzieży i projektów tematycznych.", "02")}
    <section class="page-section"><div class="shell editorial-copy editorial-copy--intro"><div class="pull-quote"><p>„7 Cities” ma dziś ośmiu uczestników — bo Zamość dołączył do stołu.</p></div><div class="prose"><h2>Partnerstwo w praktyce</h2><p>Niektóre miasta łączą oficjalne umowy podpisane przez samorządy, inne opierają współpracę na dobrowolnym zaangażowaniu mieszkańców. Co roku odbywają się spotkania rodzin, młodzieży i grup projektowych, za każdym razem w innym miejscu.</p><p>Osobnym, szczególnie bliskim partnerem pozostaje Loughborough. Wzajemne wizyty i zakwaterowanie w domach członków nadają tej współpracy osobisty charakter.</p></div></div></section>
    <section class="directory-section"><div class="shell"><div class="section-heading"><div><p class="eyebrow">Europa mieszkańców</p><h2>Nasza sieć</h2></div><p>Miasta są punktem wyjścia. Najważniejsi są ludzie, którzy chcą się spotkać.</p></div>${partnerList("pl")}</div></section>${cta("pl", "Masz pomysł na wspólne działanie?", "Napisz, jeśli reprezentujesz szkołę, organizację albo nieformalną grupę mieszkańców.")}`,
});

const partnersEn = documentPage({
  lang: "en", page: "partners", counterpart: "partners_pl.html", title: "Partners — SPMPZ", description: "The European partner network of SPMPZ.",
  main: `${pageHero("A network of friendship", "Eight towns, many personal stories", "Our partner organisations meet through family exchanges, youth programmes and thematic projects.", "02")}
    <section class="page-section"><div class="shell editorial-copy editorial-copy--intro"><div class="pull-quote"><p>“7 Cities” now has eight participants — because Zamość joined the table.</p></div><div class="prose"><h2>Partnership in practice</h2><p>Some towns are connected by formal municipal agreements; others build cooperation through the voluntary commitment of residents. Family meetings, youth exchanges and project groups take place each year in a different town.</p><p>Loughborough remains a particularly close partner. Reciprocal visits and staying in members’ homes give this relationship its personal character.</p></div></div></section>
    <section class="directory-section"><div class="shell"><div class="section-heading"><div><p class="eyebrow">A Europe of residents</p><h2>Our network</h2></div><p>Towns are the starting point. The people willing to meet are what matters.</p></div>${partnerList("en")}</div></section>${cta("en", "Do you have an idea for working together?", "Write to us if you represent a school, an organisation or an informal community group.")}`,
});

const projectsPl = documentPage({
  lang: "pl", page: "projects", counterpart: "projects_en.html", title: "Projekty — SPMPZ", description: "Projekty i wymiany prowadzone przez SPMPZ.",
  main: `${pageHero("Wspólna praca", "Projekty, które skracają dystans", "Młodzież, rodziny i lokalne organizacje wspólnie poznają Europę poza oficjalnymi deklaracjami.", "03")}
    <section class="page-section project-index"><div class="shell"><article class="project-chapter"><span class="project-chapter__number">01</span><div><p class="eyebrow">Młodzież</p><h2>Youth for Europe</h2><p>Młodzi ludzie z Bagnols-sur-Cèze, Braunfels, Carcaixent, Eeklo, Feltre, Kiskunfélegyházy, Newbury i Zamościa spotykają się co roku w innym mieście. Każda edycja ma własny temat, a wspólnym językiem warsztatów, rozmów i zwiedzania jest angielski.</p></div></article><article class="project-chapter"><span class="project-chapter__number">02</span><div><p class="eyebrow">Integracja</p><h2>Migration and Integration</h2><p>Projekt podejmował współczesne i historyczne doświadczenia migracji w krajach partnerskich. Spotkanie ewaluacyjne odbyło się w Zamościu w 2018 roku.</p><a class="text-link" href="migration_project_pl.html">Przeczytaj podsumowanie <span aria-hidden="true">→</span></a></div></article><article class="project-chapter"><span class="project-chapter__number">03</span><div><p class="eyebrow">Wymiana mieszkańców</p><h2>Zamość × Loughborough</h2><p>Coroczne spotkania odbywają się naprzemiennie w obu miastach. Goście mieszkają w domach gospodarzy, a program obejmuje rozmowy, wspólne życie i poznawanie regionu.</p></div></article><article class="project-chapter"><span class="project-chapter__number">04</span><div><p class="eyebrow">Kultura i solidarność</p><h2>Weaving a Europe of Solidarity</h2><p>Projekt łączył młodych ludzi poprzez rzemiosło, wolontariat i rozmowę o solidarności między pokoleniami.</p><a class="text-link" href="weaving_pl.html">Poznaj projekt <span aria-hidden="true">→</span></a></div></article><a class="history-link" href="projects_history_pl.html"><span>Archiwum</span><strong>Wspomnienia z wcześniejszych projektów</strong><span aria-hidden="true">→</span></a></div></section>${cta("pl", "Chcesz uczestniczyć w następnym projekcie?", "Daj znać, czy interesuje Cię wymiana młodzieżowa, goszczenie uczestników czy współorganizacja wydarzenia.")}`,
});

const projectsEn = documentPage({
  lang: "en", page: "projects", counterpart: "projects_pl.html", title: "Projects — SPMPZ", description: "Projects and resident exchanges organised by SPMPZ.",
  main: `${pageHero("Working together", "Projects that bring people closer", "Young people, families and local organisations experience Europe beyond official declarations.", "03")}
    <section class="page-section project-index"><div class="shell"><article class="project-chapter"><span class="project-chapter__number">01</span><div><p class="eyebrow">Youth</p><h2>Youth for Europe</h2><p>Young people from Bagnols-sur-Cèze, Braunfels, Carcaixent, Eeklo, Feltre, Kiskunfélegyháza, Newbury and Zamość meet in a different town each year. Every edition has its own theme, with English used during workshops, discussions and visits.</p></div></article><article class="project-chapter"><span class="project-chapter__number">02</span><div><p class="eyebrow">Integration</p><h2>Migration and Integration</h2><p>The project explored contemporary and historical experiences of migration across the partner countries. Its evaluation meeting took place in Zamość in 2018.</p><a class="text-link" href="migration_project_en.html">Read the summary <span aria-hidden="true">→</span></a></div></article><article class="project-chapter"><span class="project-chapter__number">03</span><div><p class="eyebrow">Resident exchange</p><h2>Zamość × Loughborough</h2><p>Annual meetings alternate between the two towns. Visitors stay in members’ homes and share conversations, everyday life and journeys through the host region.</p></div></article><article class="project-chapter"><span class="project-chapter__number">04</span><div><p class="eyebrow">Culture and solidarity</p><h2>Weaving a Europe of Solidarity</h2><p>The project connected young Europeans through craft, volunteering and conversations about solidarity between generations.</p><a class="text-link" href="weaving.html">Explore the project <span aria-hidden="true">→</span></a></div></article><a class="history-link" href="projects_history_en.html"><span>Archive</span><strong>Stories from earlier projects</strong><span aria-hidden="true">→</span></a></div></section>${cta("en", "Would you like to join the next project?", "Tell us whether you are interested in a youth exchange, hosting visitors or helping organise an event.")}`,
});

function historyMain(lang) {
  const pl = lang === "pl";
  return `${pageHero(pl ? "Archiwum uczestników" : "Participants’ archive", pl ? "Historie przywiezione ze wspólnych podróży" : "Stories brought home from shared journeys", pl ? "Spotkania zostawiają zdjęcia i raporty, ale przede wszystkim zmieniają sposób patrzenia na inne miejsca." : "Meetings leave photographs and reports, but most importantly they change how we see other places.", "04")}
    <section class="timeline-section"><div class="shell"><ol class="timeline"><li><time datetime="2017-02">2017</time><div><p class="eyebrow">Eeklo · ${pl ? "Belgia" : "Belgium"}</p><h2>${pl ? "Jak żyją imigranci w Belgii?" : "How do immigrants live in Belgium?"}</h2><p>${pl ? "W lutym 2017 członkowie SPMPZ spotkali się w Eeklo, poznając lokalne doświadczenia migracji i integracji." : "In February 2017 SPMPZ members met in Eeklo to learn about local experiences of migration and integration."}</p></div></li><li><time datetime="2015-08">2015</time><div><p class="eyebrow">Kiskunfélegyháza · ${pl ? "Węgry" : "Hungary"}</p><h2>${pl ? "Spotkanie młodzieży europejskiej" : "A meeting of European youth"}</h2><p>${pl ? "Młodzież z miast partnerskich pracowała razem podczas kolejnej edycji Youth for Europe." : "Young people from the partner towns worked together during another Youth for Europe programme."}</p></div></li><li><time datetime="2015-08">2015</time><div><p class="eyebrow">${pl ? "Mangala · Turcja" : "Mangala · Turkey"}</p><h2>${pl ? "Zagrajmy w Mangalę" : "Let’s play Mangala"}</h2><p>${pl ? "Młodzieżowa sekcja stowarzyszenia poznawała tradycyjną grę, kulturę i codzienne życie gospodarzy." : "The association’s youth group explored a traditional game, local culture and the everyday life of their hosts."}</p></div></li></ol></div></section>${cta(lang, pl ? "Masz własne wspomnienie?" : "Do you have your own story?", pl ? "Pomóż nam uzupełniać archiwum zdjęć i relacji uczestników." : "Help us expand the archive of photographs and participants’ stories.")}`;
}

const historyPl = documentPage({ lang: "pl", page: "project-history", counterpart: "projects_history_en.html", title: "Historia projektów — SPMPZ", description: "Archiwum spotkań i projektów SPMPZ.", main: historyMain("pl") });
const historyEn = documentPage({ lang: "en", page: "project-history", counterpart: "projects_history_pl.html", title: "Project history — SPMPZ", description: "An archive of SPMPZ meetings and projects.", main: historyMain("en") });

function migrationMain(lang) {
  const pl = lang === "pl";
  return `${pageHero("2016–2018 · Europe for Citizens", pl ? "Czy nowi przybysze są obywatelami Europy?" : "Are newcomers citizens of Europe?", pl ? "Osiem miast rozmawiało o migracji poprzez historię, lokalne doświadczenia i bezpośrednie spotkania." : "Eight towns explored migration through history, local experience and direct encounters.", "05")}
    <section class="page-section"><div class="shell editorial-copy"><aside class="fact-column"><span>8</span><p>${pl ? "miast partnerskich" : "partner towns"}</p><span>2018</span><p>${pl ? "finał w Zamościu" : "final meeting in Zamość"}</p></aside><div class="prose"><h2>${pl ? "O projekcie" : "About the project"}</h2><p>${pl ? "Projekt rozpoczął się w 2016 roku. Jego celem było przedstawienie i przedyskutowanie sytuacji migracji w Europie — zarówno w perspektywie historycznej, jak i wobec współczesnych wyzwań. Rozmowy dotyczyły poziomu europejskiego, krajowego i lokalnego." : "The project began in 2016. Its aim was to present and discuss migration in Europe from historical and contemporary perspectives, connecting European, national and local experiences."}</p><p>${pl ? "Spotkania odbywały się kolejno w miastach uczestniczących w projekcie. Ostatnie, ewaluacyjne spotkanie zorganizowano w Zamościu w lipcu 2018 roku." : "Meetings took place across the participating towns. The final evaluation event was held in Zamość in July 2018."}</p><h2>${pl ? "Ewaluacja i lokalny kontekst" : "Evaluation and local context"}</h2><p>${pl ? "Uczestnicy omówili wyniki wspólnej ankiety, postawy wobec cudzoziemców i wpływ udziału w projekcie. Program obejmował wykłady lokalnych historyków, rozmowy z przedstawicielami samorządu oraz wizyty w miejscach związanych z wieloetniczną historią regionu." : "Participants discussed a shared survey, attitudes towards newcomers and the impact of taking part in the project. The programme included local historians, representatives of public institutions and visits to places connected with the region’s multi-ethnic history."}</p><p>${pl ? "Spotkania ze studentami, pracownikami i wolontariuszami z innych krajów pozwoliły zestawić debatę publiczną z osobistym doświadczeniem życia w nowym miejscu." : "Meetings with international students, workers and volunteers connected the public debate with personal experiences of living in a new place."}</p><div class="download-row"><a href="migration.pdf">${pl ? "Prezentacja ewaluacyjna" : "Evaluation presentation"} <span>PDF ↗</span></a><a href="Final report/index.html">${pl ? "Końcowy raport projektu" : "Final project report"} <span>HTML →</span></a></div></div></div></section>${cta(lang, pl ? "Rozmawiajmy dalej" : "Continue the conversation", pl ? "Jeśli wykorzystujesz materiały projektu w edukacji lub pracy lokalnej, napisz do nas." : "If you use the project materials in education or community work, write to us.")}`;
}

const migrationPl = documentPage({ lang: "pl", page: "migration", counterpart: "migration_project_en.html", title: "Migration and Integration — SPMPZ", description: "Podsumowanie europejskiego projektu o migracji i integracji.", main: migrationMain("pl") });
const migrationEn = documentPage({ lang: "en", page: "migration", counterpart: "migration_project_pl.html", title: "Migration and Integration — SPMPZ", description: "Summary of the European migration and integration project.", main: migrationMain("en") });

function weavingMain(lang) {
  const pl = lang === "pl";
  return `${pageHero("Europe for Citizens", pl ? "Tkamy Europę solidarności" : "Weaving a Europe of Solidarity", pl ? "Rzemiosło stało się pretekstem do rozmowy o współpracy, wolontariacie i więziach między pokoleniami." : "Craft became a way to discuss cooperation, volunteering and relationships between generations.", "06")}
    <section class="media-intro"><div class="shell"><img src="images/weaving.jpg" width="960" height="540" alt="${pl ? "Uczestnicy projektu podczas wspólnego tkania" : "Project participants weaving together"}" loading="lazy"><div><p class="eyebrow">${pl ? "Wspólna nić" : "A common thread"}</p><h2>${pl ? "Młodzi ludzie uczą się od siebie" : "Young people learning from one another"}</h2><p>${pl ? "Projekt wzmacniał relacje młodych Europejczyków i istniejące więzi między miastami należącymi do sieci partnerskiej." : "The project strengthened relationships between young Europeans and the existing ties between towns in the partner network."}</p></div></div></section>
    <section class="page-section"><div class="shell chapter-list"><article><span>01</span><div><h2>${pl ? "Cele" : "Goals"}</h2><p>${pl ? "Upowszechnianie idei solidarności, aktywności obywatelskiej i dialogu międzypokoleniowego oraz tworzenie miejsca dla osobistych doświadczeń uczestników." : "To promote solidarity, active citizenship and intergenerational dialogue, while giving participants space to share personal experience."}</p></div></article><article><span>02</span><div><h2>${pl ? "Działania" : "Activities"}</h2><p>${pl ? "Warsztaty rękodzieła, spotkania z lokalnymi organizacjami, wizyty edukacyjne i publiczne prezentacje projektu." : "Craft workshops, meetings with community organisations, educational visits and public presentations of the project."}</p></div></article><article><span>03</span><div><h2>${pl ? "Przygotowania w Zamościu" : "Preparations in Zamość"}</h2><p>${pl ? "Grupa młodzieżowa uczyła się tkania, zapraszała nowych uczestników, odwiedziła uczelnię oraz muzeum rolnictwa w Sitnie, poznając historyczne narzędzia i doświadczenia starszych mieszkańców." : "The youth group learned to weave, invited new participants, visited a university and explored historical tools and older residents’ experience at the agricultural museum in Sitno."}</p></div></article></div></section>
    <section class="social-strip"><div class="shell"><p>${pl ? "Projekt w mediach społecznościowych" : "Follow the project"}</p><nav><a href="https://www.instagram.com/weavingeurope/" target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href="https://www.facebook.com/weavingeu/" target="_blank" rel="noopener noreferrer">Facebook ↗</a></nav></div></section>${cta(lang, pl ? "Solidarność zaczyna się lokalnie" : "Solidarity starts locally", pl ? "Chcesz włączyć swoją grupę w podobny projekt? Porozmawiajmy." : "Would you like to involve your group in a similar project? Let’s talk.")}`;
}

const weavingPl = documentPage({ lang: "pl", page: "weaving", counterpart: "weaving.html", title: "Tkamy Europę solidarności — SPMPZ", description: "Projekt Weaving a Europe of Solidarity.", main: weavingMain("pl") });
const weavingEn = documentPage({ lang: "en", page: "weaving", counterpart: "weaving_pl.html", title: "Weaving a Europe of Solidarity — SPMPZ", description: "The Weaving a Europe of Solidarity project.", main: weavingMain("en") });

function contactMain(lang) {
  const pl = lang === "pl";
  return `${pageHero(pl ? "Kontakt i dokumenty" : "Contact and documents", pl ? "Porozmawiajmy" : "Let’s talk", pl ? "Najprościej napisać do nas mailowo. Odpowiemy w sprawie członkostwa, projektów i współpracy." : "Email is the simplest way to reach us. We can answer questions about membership, projects and cooperation.", "07")}
    <section class="contact-page"><div class="shell contact-flow"><div class="contact-lead"><p class="eyebrow">E-mail</p><a href="mailto:kontakt@spmpz.zamosc.pl">kontakt@spmpz.zamosc.pl</a><p>${pl ? "Stowarzyszenie Przyjaciół Miast Partnerskich Zamościa" : "Friends of Zamość Twin Towns Association"}</p></div><dl class="registry-list"><div><dt>${pl ? "Forma prawna" : "Legal form"}</dt><dd>${pl ? "Stowarzyszenie" : "Association"}</dd></div><div><dt>KRS</dt><dd>0000158936</dd></div><div><dt>NIP</dt><dd>922-26-16-692</dd></div><div><dt>REGON</dt><dd>951194700</dd></div><div><dt>${pl ? "Rok powstania" : "Founded"}</dt><dd>2003</dd></div></dl><div class="document-list"><a href="statute_pl.pdf">${pl ? "Statut" : "Statute (Polish)"} <span>PDF ↗</span></a><a href="report_22/report.pdf">ImagE50 report <span>PDF ↗</span></a><a href="Final report/index.html">Migration Project report <span>HTML →</span></a></div></div></section>
    <section class="page-section"><div class="shell"><div class="section-heading"><div><p class="eyebrow">${pl ? "Organizacja" : "Organisation"}</p><h2>${pl ? "Zarząd i nadzór" : "Board and oversight"}</h2></div><p>${pl ? "Dane zachowane z dotychczasowej strony stowarzyszenia." : "Information retained from the association’s previous website."}</p></div><ul class="people-list"><li><strong>Janusz Skowron</strong><span>${pl ? "Prezes zarządu" : "Chair of the board"}</span></li><li><strong>Andrzej Szuwara</strong><span>${pl ? "Wiceprezes zarządu, członek organu nadzoru" : "Deputy chair, oversight body member"}</span></li><li><strong>Marek Ciastoch</strong><span>${pl ? "Członek zarządu" : "Board member"}</span></li><li><strong>Joanna Śliwa</strong><span>${pl ? "Członek organu nadzoru" : "Oversight body member"}</span></li><li><strong>Irena Szymańska</strong><span>${pl ? "Członek organu nadzoru" : "Oversight body member"}</span></li></ul></div></section>`;
}

const contactPl = documentPage({ lang: "pl", page: "contact", counterpart: "contact_en.html", title: "Kontakt — SPMPZ", description: "Kontakt, dane rejestrowe i dokumenty SPMPZ.", main: contactMain("pl") });
const contactEn = documentPage({ lang: "en", page: "contact", counterpart: "contact_pl.html", title: "Contact — SPMPZ", description: "Contact, registration details and documents for SPMPZ.", main: contactMain("en") });

const englishHome = documentPage({
  lang: "en", page: "home", counterpart: "index.html", home: true,
  title: "SPMPZ — Bringing Zamość closer to Europe", description: "Friends of Zamość Twin Towns — meetings, resident exchanges and European projects.",
  main: `<section class="hero" aria-labelledby="hero-title"><div class="hero__inner shell"><div class="hero__copy"><p class="eyebrow">Zamość · Europe · since 2003</p><h1 id="hero-title">Zamość closer to Europe.<br>Europe closer to Zamość.</h1><p class="hero__lead">We connect residents across borders through meetings, exchanges and projects that turn partner towns into real neighbours.</p><div class="hero__actions"><a class="button button--primary" href="#aktualnosci">See what we do</a><a class="button button--quiet" href="#dolacz">Join us <span aria-hidden="true">↗</span></a></div></div><figure class="hero__media image-frame"><img src="images/site/hero-zamosc.jpg" width="1920" height="1280" alt="Town Hall and Great Market Square in Zamość"><figcaption><span>Zamość</span><span>a UNESCO World Heritage city</span></figcaption></figure><dl class="hero__facts" aria-label="Association in numbers"><div><dt>2003</dt><dd>founded</dd></div><div><dt>8</dt><dd>partner organisations</dd></div><div><dt>1</dt><dd>shared Europe of residents</dd></div></dl></div></section>
    <section class="news section" id="aktualnosci" aria-labelledby="news-title"><div class="shell"><header class="section-heading"><div><p class="eyebrow">Happening now</p><h2 id="news-title">News</h2></div><p>Recent meetings, conversations and results of cooperation between residents of partner towns.</p></header><article class="lead-story"><div class="lead-story__visual" aria-hidden="true"><span class="story-number">01</span><div class="orbit orbit--one"></div><div class="orbit orbit--two"></div><p>TWIN<br>GREEN</p></div><div class="lead-story__content"><div class="story-meta"><span class="tag">Lead story</span><time datetime="2026-08-24">24 August 2026</time><span>Zamość</span></div><h3>European towns met in Zamość to discuss a greener future</h3><p class="story-intro">The Zamość meeting of <strong>Twin Green</strong> focused on circular economy, sustainable energy and ways local communities can answer ecological challenges together.</p><p>Polish hosts welcomed representatives from Germany, Italy, the United Kingdom, Belgium, Spain and Hungary. Participants shared experience and explored local approaches to energy transition and responsible use of resources.</p><p>During the centenary celebrations of the City Park, SPMPZ members and international guests also met the Mayor of Zamość, Rafał Zwolak, to discuss future cooperation. Visitors stayed in members’ homes, keeping the exchange rooted in direct relationships between residents.</p><ul class="country-list" aria-label="Countries represented"><li><span>PL</span> Poland</li><li><span>DE</span> Germany</li><li><span>IT</span> Italy</li><li><span>GB</span> United Kingdom</li><li><span>BE</span> Belgium</li><li><span>ES</span> Spain</li><li><span>HU</span> Hungary</li></ul></div></article><div class="coverage"><div class="coverage__intro"><p class="eyebrow">Coverage</p><h3>See the event from several perspectives</h3></div><div class="coverage-list"><a class="coverage-link" href="https://www.facebook.com/share/p/198Uct8a7r/" target="_blank" rel="noopener noreferrer"><span class="coverage-link__type">Facebook · Rafał Zwolak</span><strong>A meeting about Zamość’s future cooperation</strong><span class="coverage-link__action">Open post ↗</span></a><a class="coverage-link" href="https://www.facebook.com/share/p/18qQkk54jS/" target="_blank" rel="noopener noreferrer"><span class="coverage-link__type">Facebook · Marta Pfeifer</span><strong>Report from the twin-town meeting</strong><span class="coverage-link__action">Open post ↗</span></a><a class="coverage-link" href="https://www.zamojska.pl/artykul/6268%2Czamosc-gospodarzem-miedzynarodowego-spotkania-o-transformacji-energetycznej" target="_blank" rel="noopener noreferrer"><span class="coverage-link__type">Zamojska.pl · press</span><strong>Zamość hosts talks on energy transition</strong><span class="coverage-link__action">Read article ↗</span></a><a class="coverage-link" href="https://www.kronikatygodnia.pl/artykul/55329%2Czamosc-gospodarzem-europejskiego-projektu-ekologicznego-twin-green" target="_blank" rel="noopener noreferrer"><span class="coverage-link__type">Kronika Tygodnia · press</span><strong>Twin Green ecological project in Zamość</strong><span class="coverage-link__action">Read article ↗</span></a></div></div><div class="archive-stream"><article><p class="eyebrow">Report · 2022</p><h3>ImagE50</h3><p>Documentation from a completed international project.</p><a href="report_22/report.pdf">Open PDF ↗</a></article><article><p class="eyebrow">Archive · 2018</p><h3>Migration and Integration</h3><p>A summary of discussions held across eight towns.</p><a href="migration_project_en.html">Explore project →</a></article><article><p class="eyebrow">Memories</p><h3>Stories from shared journeys</h3><p>Participants’ accounts from Belgium, Hungary, Turkey and beyond.</p><a href="projects_history_en.html">Open archive →</a></article></div></div></section>
    <section class="partners section" id="partnerzy"><div class="shell"><header class="section-heading section-heading--wide"><div><p class="eyebrow">A network of friendship</p><h2>More than towns on a map</h2></div><p>A partnership begins with an agreement, but lives through families, young people and local organisations.</p></header><div class="partner-flow"><div class="partner-flow__center"><span class="partner-flow__pin" aria-hidden="true"></span><strong>Zamość</strong><span>Poland</span></div>${partnerList("en")}</div><div class="partners__footer"><p>Together we organise family meetings, youth exchanges and thematic projects, hosted by a different town each year.</p><a class="text-link" href="partners_en.html">Explore the partner network →</a></div></div></section>
    <section class="projects section" id="projekty"><div class="shell"><header class="section-heading"><div><p class="eyebrow">Working together</p><h2>Projects that bring people closer</h2></div><p>From ecology to youth, culture and the everyday experience of living in Europe.</p></header><div class="project-stream"><article class="project-chapter project-chapter--featured"><span class="project-chapter__number">01</span><div><p class="eyebrow">Ecology · 2026</p><h3>Twin Green</h3><p>Seven countries, local solutions and a shared conversation about energy, resources and circular economy.</p><a href="#aktualnosci">Read the story ↑</a></div></article><article class="project-chapter"><span class="project-chapter__number">02</span><div><p class="eyebrow">Youth</p><h3>Youth for Europe</h3><p>Young people from eight towns learn cooperation and discover Europe through one another.</p><a href="projects_en.html">About the project →</a></div></article><article class="project-chapter"><span class="project-chapter__number">03</span><div><p class="eyebrow">Resident exchange</p><h3>Zamość × Loughborough</h3><p>Annual visits, home stays and friendships built over many years.</p><a href="projects_en.html">Read the story →</a></div></article><article class="project-chapter"><span class="project-chapter__number">04</span><div><p class="eyebrow">Integration</p><h3>Migration and Integration</h3><p>A European conversation about migration, citizenship and local experience.</p><a href="migration_project_en.html">Open the summary →</a></div></article><article class="project-chapter project-chapter--image"><img src="images/site/fortress-night.jpg" width="1440" height="960" loading="lazy" alt="Illuminated Szczebrzeska Gate in Zamość at night"><div><p class="eyebrow">Culture and solidarity</p><h3>Weaving a Europe of Solidarity</h3><a href="weaving.html">Explore the project →</a></div></article></div></div></section>
    <section class="about section" id="o-nas"><div class="about-flow shell"><div class="about__statement"><p class="eyebrow">Why we are here</p><h2>Town partnerships matter when people meet.</h2></div><div class="about__copy"><p class="about__lead">Since 2003 we have helped residents of Zamość build direct relationships with people in partner towns.</p><p>We promote Zamość, its culture and history, organise exchanges, support language learning and encourage European cooperation.</p><a class="text-link" href="about_en.html">Read our story →</a></div><ol class="value-list"><li><span>01</span><strong>Meeting</strong><small>directly, not only officially</small></li><li><span>02</span><strong>Curiosity</strong><small>about languages and everyday life</small></li><li><span>03</span><strong>Cooperation</strong><small>locally and across borders</small></li></ol></div></section>
    <section class="join section" id="dolacz"><div class="join__inner shell"><div><p class="eyebrow">There is a place for you</p><h2>The next European story can begin in Zamość.</h2></div><div class="join__action"><p>Join an exchange, host visitors, help organise an event or simply learn more.</p><a class="button button--primary" href="mailto:kontakt@spmpz.zamosc.pl">kontakt@spmpz.zamosc.pl</a></div></div></section>
    <section class="contact section" id="kontakt"><div class="contact__inner shell"><div><p class="eyebrow">Contact and documents</p><h2>Let’s talk</h2><p>Email is the simplest way to reach us about membership, projects or cooperation.</p><a class="contact__email" href="mailto:kontakt@spmpz.zamosc.pl">kontakt@spmpz.zamosc.pl</a></div><dl class="registry-data"><div><dt>Legal form</dt><dd>Association</dd></div><div><dt>KRS</dt><dd>0000158936</dd></div><div><dt>NIP</dt><dd>922-26-16-692</dd></div><div><dt>REGON</dt><dd>951194700</dd></div><div><dt>Founded</dt><dd>2003</dd></div></dl><nav class="document-links"><a href="statute_pl.pdf">Statute <span>PDF ↗</span></a><a href="report_22/report.pdf">ImagE50 report <span>PDF ↗</span></a><a href="Final report/index.html">Migration Project report <span>HTML →</span></a></nav></div></section>`,
});

const pages = new Map([
  ["english.html", englishHome], ["about_pl.html", aboutPl], ["about_en.html", aboutEn],
  ["partners_pl.html", partnersPl], ["partners_en.html", partnersEn],
  ["projects_pl.html", projectsPl], ["projects_en.html", projectsEn],
  ["projects_history_pl.html", historyPl], ["projects_history_en.html", historyEn],
  ["migration_project_pl.html", migrationPl], ["migration_project_en.html", migrationEn],
  ["weaving_pl.html", weavingPl], ["weaving.html", weavingEn],
  ["contact_pl.html", contactPl], ["contact_en.html", contactEn],
]);

for (const [path, html] of pages) writeFileSync(resolve(root, path), html);

function alias(target) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>SPMPZ — English</title><link rel="canonical" href="${target}"><meta http-equiv="refresh" content="0; url=${target}"><script>location.replace(${JSON.stringify(target)} + location.search + location.hash);</script></head><body><p><a href="${target}">Continue to the English SPMPZ website</a></p></body></html>\n`;
}

writeFileSync(resolve(root, "index_en.html"), alias("english.html"));
writeFileSync(resolve(root, "index_enn.html"), alias("english.html"));
mkdirSync(resolve(root, "en"), { recursive: true });
writeFileSync(resolve(root, "en/index.html"), alias("../english.html"));
