# Risk med pdf.js 3.11.174 i Universal Viewer 4.4.4

## 0. Bekräftat på er sida
Jag öppnade `samlingar.shm.bazooka.dev/media/f92f4970-…` den 20 november 2026 och kontrollerade sidan i webbläsaren:
- PDF:en ritas ut på en canvas av pdf.js, inte av webbläsarens inbyggda visare (`PDFObject` är inte inläst).
- Det enda pdf.js-skriptet som laddas är `cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js`.
- Sidan kör alltså pdf.js 3.11.174, och lagget som utvecklarna ser kommer sannolikt från den versionen.
- Jag kunde inte läsa sidans UV-konfiguration, så jag vet inte om något är inställt utöver standard, till exempel `isEvalSupported`.

## 1. Säkerhet (CVE-2024-4367)
- Äldre pdf.js-versioner, bland dem 3.11.174, har en sårbarhet som gör att en särskilt konstruerad PDF kan köra godtycklig JavaScript i användarens webbläsare när filen öppnas.
- Bristen gäller bara i pdf.js-läget (`usePdfJs: true`), och det är det läge er sida kör.
- Pdf.js egen rekommendation är att skicka `isEvalSupported: false` till `getDocument`. UV 4.4.4 gör inte det: jag hittade ingen förekomst av `isEvalSupported` i den levererade koden. UV-projektets egen mildring (PR #1947) slogs ihop först i november 2026, efter att 4.4.4 släpptes (19 augusti 2026).
- Jag har inte provat att utnyttja sårbarheten. Slutsatsen bygger på versionsnumret, pdf.js egen CVE-information och att inställningen saknas i koden.

## 2. Prestanda
- Versionen avkodar hela bilden på varje sida varje gång, och UV sparar inget mellan sidbyten och zoom.
- Mätning med er testfil (7 sidor, 45 MB, sidorna 1–4 är JPEG på ca 4900×6150 px):

| | pdf.js 3.11.174 | pdf.js 6.5.438 |
|---|---|---|
| Rendera sida 1–4 | 1,4–2,8 s per gång | 0,14–0,3 s per gång |

- Chromes inbyggda PDF-visare (`usePdfJs: false`) är också snabb på samma fil.
- Varför den nya versionen är snabbare har jag inte verifierat. Det är sannolikt hur stora bilder avkodas, men det är en gissning.
- Mätningarna finns i `public/bench.html` (3.11) och `public/bench2.html` (nyare versioner).

## 3. Vad som är på gång
- UV-projektet har en öppen, godkänd pull request (#1696, "Pdfjs update") som uppgraderar pdf.js. Den ska vänta på RC4-utgåvan, så tidpunkten är oklar.
- Det finns också en äldre Dependabot-PR (#1528) med samma mål.

## 4. Alternativ för er
1. **Slå av pdf.js-läget** (`usePdfJs: false`) och använd webbläsarens egen visare. Snabbast och minst arbete, men utseendet skiljer sig mellan webbläsare och mobilstödet är sämre.
2. **Skicka `isEvalSupported: false`** till `getDocument` som tillfällig skyddsåtgärd. Det löser inte prestandaproblemet.
3. **Använda en nyare pdf.js** genom en patch av UV:s PDF-panel, eller vänta på PR #1696. Den här repot innehåller en fungerande patch som bevis på att det går (öppna `/?pdfjs=new`). Den är ett koncepttest, inte produktionskod.

## 5. Så kontrollerar ni själva
- Ser ni `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/` i nätverksfliken när en PDF öppnas, kör ni den gamla versionen.
- Sök efter `isEvalSupported` i era levererade UV-filer. Hittas den inte, är mildringen inte på plats.
