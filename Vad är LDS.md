LDS

## Prototypverktyg
- Quick & Pretty

## Komponentbibliotek
- Dokumentation av gränssnittet och grafiska profilen i en överskådlig styleguide

## Mindset
- Sluta tänk på gränssnittskod som någonting som skrivs i en prototyp för att SEN byggas på riktigt av en riktig utvecklare.
- Implementera designen i en prorotyp och använd gränssnittskomponenterna vid en (eventuell) backend implementation.

## Redaktörsverktyg
- Skapa och redigera sidor (och komponenter) utan att behöva en utvecklare.



# Hur fungerar det?
- Skapa komponenter enligt en konsekvent struktur och namnsättning.
  MinKomponent
    index.css   : Stilmall
    index.json  : Copy och innehållskonfigurationsexempel
    index.js    : Javascript
    index.hbs   : HTML-kod i enkelt mallstråk
    readme.md   : Dokumentation om hur komponenten ska användas

- Dessa komponenter kan sedan använda sig av varandra.
  {{> component:MinKomponent}}

- Skapa Sidkomponenter och de är automatiskt tillgänliga i webbläsaren
  http://prototyp.se/MinSida

- Alla komponenter och sidor är även direkt tillgängliga i en Stylegude, där man ser hur komponenter fungerar och ska användas.

# Vad vinner man på att använda LDS?
- Tid, uppsättningen av ett LDS-projekt är minimal och du har direkt en körbar prototyp
- Tydlighet, genom att bryta ner gränssnitt i komponenter, blir det tydligare hur de ska
  återanvändas och dokumenteras, för att kunna användas fler gånger.
- Förvaltningsbarhet, Total överblick över alla komponenter
- Teknisk frihet, Eftersom komponeter inte byggs för ett visst system, kan de återanvändas i alla möjliga system och former.
- Förändringsbarhet, Bankendsystem använder sig av gränssnittskomponeter snarare än bygger in dem, vilket gör uppdateringar av gränssnittet möjligt och enkelt.
- Enkelhet, det är skillnad på kod och kod. I ett separat versionshanteringssystem kan man följa alla ändringas som över tid gjorts på grafiska profilen.
- Agilitet, Backend-utveckling, innehållsproduktion och gränssittsutveckling kan drivas parallellt och förändras oberoende av varandra.

# Vad kostar det?
- Ingenting, det är så vi på Daytona levererar våra prototyper.
- Det kräver dock en förändring i hur man tänker på kod, vilket kan innebära ändrat ansvar för förvaltning av gränssnitt.
- För full förvaltningsbarhet, krävs även att komponter dokumenteras och konfigureras, så det framgår tydligt hur och när de ska/kan användas.

# Tekniska förutsättningar
- LivingDesignSystem är ett gratis paket på NPM (Node Package Manager), vilket kräver en miljö som har NodeJS installerat.
- Den gränssnittskod som förvaltas i ett designsystem bör hanteras i ett eget versionsharnteringssystem. (och kan därför både drivas och publiseras i molntjänster)
- Backend behöver stöd att använda samma mallspråk som används av komponenterna, och formulerar den data som komponeterna behöver, istället för att generera den HTML som komponeterna skapar.
