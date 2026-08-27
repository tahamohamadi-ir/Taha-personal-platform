const PAGES = [
  "00 — Foundations & Library",
  "10 — Templates & Screens",
  "20 — Prototype & Handoff"
];
const OWNER = "TFL /";
const C = {
  light: { canvas: "#F7F8F5", surface: "#FFFFFF", muted: "#F1F4F2", ink: "#182328", secondary: "#616E74", border: "#DDE5E3", strong: "#748682", brand: "#087C73", gold: "#A77B28", purple: "#6047B8", emerald: "#137A62", coral: "#D45F45" },
  dark: { canvas: "#071225", surface: "#0B1630", muted: "#122343", ink: "#F7F3EA", secondary: "#B8C5CC", border: "#263955", strong: "#71839E", brand: "#16B8A6", gold: "#C89B3C", purple: "#8B75DC", emerald: "#42A98C", coral: "#E8785E" }
};
const COMPONENTS = ["Button", "IconButton", "Link", "Chip", "Badge", "ThemeToggle", "LanguageToggle", "Header", "Breadcrumbs", "LocalTabs", "FilterBar", "Pagination", "SectionLead", "Card", "FeaturedRecord", "ContentRow", "PublicationRow", "MetadataGroup", "TimelineNode", "MediaTile", "TOCItem", "ContactCTA", "Input", "Textarea"];
const TEMPLATES = ["Home", "Collection index", "Editorial index", "Long-form detail", "Evidence / visual detail", "About / contact utility"];

function rgb(hex) {
  const v = hex.replace("#", "");
  return { r: parseInt(v.slice(0,2),16)/255, g: parseInt(v.slice(2,4),16)/255, b: parseInt(v.slice(4,6),16)/255 };
}
function solid(hex, opacity) { return { type: "SOLID", color: rgb(hex), opacity: opacity === undefined ? 1 : opacity }; }
function layout(node, direction, gap, padding) {
  node.layoutMode = direction || "VERTICAL";
  node.primaryAxisSizingMode = "AUTO";
  node.counterAxisSizingMode = "AUTO";
  node.itemSpacing = gap === undefined ? 16 : gap;
  const p = padding === undefined ? 24 : padding;
  node.paddingTop = p; node.paddingRight = p; node.paddingBottom = p; node.paddingLeft = p;
}
function frame(name, theme, direction, gap, padding) {
  const n = figma.createFrame(); n.name = name; layout(n, direction, gap, padding);
  n.fills = [solid(theme.surface)]; n.strokes = [solid(theme.border)]; n.strokeWeight = 1; n.cornerRadius = 16;
  return n;
}
function textNode(value, size, color, weight) {
  const n = figma.createText(); n.fontName = { family: "Inter", style: weight || "Regular" };
  n.characters = value; n.fontSize = size || 16; n.fills = [solid(color)]; n.lineHeight = { unit: "PERCENT", value: 150 };
  return n;
}
function label(value, theme) { return textNode(value.toUpperCase(), 11, theme.brand, "Medium"); }
function title(value, theme, size) { return textNode(value, size || 30, theme.ink, "Bold"); }
function body(value, theme, width) {
  const n = textNode(value, 14, theme.secondary, "Regular"); n.textAutoResize = "HEIGHT"; n.resize(width || 440, n.height); return n;
}
function rule(theme, width) { const n = figma.createRectangle(); n.name = "Signature rule"; n.resize(width || 56, 2); n.fills = [solid(theme.gold)]; return n; }
function pill(value, theme, accent) {
  const n = frame("Pill", theme, "HORIZONTAL", 8, 10); n.cornerRadius = 999; n.strokes = [solid(theme.border)]; n.fills = [solid(theme.muted)]; n.appendChild(textNode(value, 12, accent || theme.ink, "Medium")); return n;
}
function button(value, theme, primary) {
  const n = frame("Button", theme, "HORIZONTAL", 10, 14); n.cornerRadius = 10; n.minWidth = 132; n.minHeight = 44;
  n.primaryAxisAlignItems = "CENTER"; n.counterAxisAlignItems = "CENTER";
  n.fills = [solid(primary ? theme.brand : theme.surface)]; n.strokes = [solid(primary ? theme.brand : theme.strong)];
  n.appendChild(textNode(value, 14, primary ? (theme === C.dark ? C.dark.canvas : "#FFFFFF") : theme.ink, "Medium"));
  n.appendChild(textNode("→", 16, primary ? (theme === C.dark ? C.dark.canvas : "#FFFFFF") : theme.brand, "Medium")); return n;
}
function sectionHeader(parent, eyebrow, heading, note, theme) {
  parent.appendChild(label(eyebrow, theme)); parent.appendChild(title(heading, theme, 28)); parent.appendChild(rule(theme)); if (note) parent.appendChild(body(note, theme, 700));
}
function clean(page) {
  for (const n of [...page.children]) if (n.name.startsWith(OWNER)) n.remove();
}
function pageByName(name) {
  let p = figma.root.children.find(x => x.type === "PAGE" && x.name === name);
  if (!p) { p = figma.createPage(); p.name = name; }
  return p;
}
function variableCollection(name, collections) {
  const found = collections.find(x => x.name === name);
  if (found) return found;
  const created = figma.variables.createVariableCollection(name);
  collections.push(created);
  return created;
}
async function ensureVariables() {
  const packs = [
    ["Primitives", { "color/navy/950": C.dark.canvas, "color/navy/900": C.dark.surface, "color/turquoise/500": C.dark.brand, "color/turquoise/700": C.light.brand, "color/gold/500": C.dark.gold, "color/purple/500": C.light.purple, "color/emerald/500": C.light.emerald }],
    ["Semantic Light", { "color/canvas": C.light.canvas, "color/surface": C.light.surface, "color/ink": C.light.ink, "color/ink-secondary": C.light.secondary, "color/brand": C.light.brand, "color/signature": C.light.gold, "color/border": C.light.border, "color/focus": C.light.brand }],
    ["Semantic Dark", { "color/canvas": C.dark.canvas, "color/surface": C.dark.surface, "color/ink": C.dark.ink, "color/ink-secondary": C.dark.secondary, "color/brand": C.dark.brand, "color/signature": C.dark.gold, "color/border": C.dark.border, "color/focus": "#6BE6D9" }]
  ];
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const existing = await figma.variables.getLocalVariablesAsync("COLOR");
  for (const [collectionName, values] of packs) {
    const col = variableCollection(collectionName, collections); const mode = col.defaultModeId;
    for (const [name, value] of Object.entries(values)) {
      let v = existing.find(x => x.variableCollectionId === col.id && x.name === name);
      if (!v) v = figma.variables.createVariable(name, col, "COLOR");
      v.setValueForMode(mode, rgb(value));
    }
  }
  const numberPacks = [
    ["Primitives", { "space/1":4, "space/2":8, "space/3":12, "space/4":16, "space/6":24, "space/8":32, "space/12":48, "space/16":64, "space/24":96, "radius/xs":4, "radius/sm":8, "radius/md":12, "radius/lg":16, "radius/xl":24, "target/min":44 }],
    ["Motion Default", { "duration/fast":140, "duration/base":200, "duration/slow":280, "scale/max":1.02 }],
    ["Motion Reduced", { "duration/feedback":0.01, "scale/max":1, "continuous/enabled":0 }]
  ];
  const numbers = await figma.variables.getLocalVariablesAsync("FLOAT");
  for (const [collectionName, values] of numberPacks) {
    const col = variableCollection(collectionName, collections); const mode = col.defaultModeId;
    for (const [name, value] of Object.entries(values)) {
      let v = numbers.find(x => x.variableCollectionId === col.id && x.name === name);
      if (!v) v = figma.variables.createVariable(name, col, "FLOAT");
      v.setValueForMode(mode, value);
    }
  }
}
function swatch(name, value, theme) {
  const n = frame("Swatch / " + name, theme, "VERTICAL", 8, 12); n.resize(150, 108); n.primaryAxisSizingMode = "FIXED"; n.counterAxisSizingMode = "FIXED";
  const color = figma.createRectangle(); color.resize(126, 48); color.cornerRadius = 8; color.fills = [solid(value)]; color.strokes = [solid(theme.border)]; n.appendChild(color);
  n.appendChild(textNode(name, 12, theme.ink, "Medium")); n.appendChild(textNode(value, 11, theme.secondary)); return n;
}
function makeComponent(name, theme) {
  const c = figma.createComponent(); c.name = name + " / Base"; layout(c, "VERTICAL", 10, 16); c.resize(240, 130); c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "FIXED";
  c.fills = [solid(theme.surface)]; c.strokes = [solid(theme.border)]; c.cornerRadius = 12;
  c.appendChild(label("Component", theme)); c.appendChild(textNode(name, 16, theme.ink, "Medium")); c.appendChild(textNode("Rest · hover/focus parity · RTL-safe", 11, theme.secondary));
  c.description = "Implementation contract: agent-kit/components.json. Content is CMS-owned; anatomy and states are Design System-owned."; return c;
}
function buildFoundations(page) {
  clean(page); const root = frame(OWNER + "Foundations & Library", C.light, "VERTICAL", 32, 48); root.x = 0; root.y = 0; root.resize(1440, 100); root.counterAxisSizingMode = "FIXED";
  sectionHeader(root, "Agent-ready design kit", "One system, two themes, zero guesswork", "Runtime Light values come from global.css. Dark values are a design target until a separate implementation task updates the contract and CSS.", C.light);
  const themes = frame("Theme tokens", C.light, "HORIZONTAL", 16, 0); themes.fills = []; themes.strokes = [];
  for (const [name, value] of Object.entries({ canvas:C.light.canvas, surface:C.light.surface, ink:C.light.ink, brand:C.light.brand, signature:C.light.gold, research:C.light.purple, context:C.light.emerald, editorial:C.light.coral })) themes.appendChild(swatch("Light / "+name, value, C.light));
  root.appendChild(themes);
  const darkBand = frame("Dark design target", C.dark, "VERTICAL", 16, 24); darkBand.resize(1344, 100); darkBand.counterAxisSizingMode = "FIXED"; darkBand.appendChild(label("Dark scientific atlas — design target", C.dark));
  const darkSwatches = frame("Dark swatches", C.dark, "HORIZONTAL", 12, 0); darkSwatches.fills = []; darkSwatches.strokes = [];
  for (const [name, value] of Object.entries({ canvas:C.dark.canvas, surface:C.dark.surface, ink:C.dark.ink, brand:C.dark.brand, signature:C.dark.gold, research:C.dark.purple })) darkSwatches.appendChild(swatch("Dark / "+name, value, C.dark));
  darkBand.appendChild(darkSwatches); root.appendChild(darkBand);
  const type = frame("Typography & rhythm", C.light, "HORIZONTAL", 48, 24); type.resize(1344, 100); type.counterAxisSizingMode = "FIXED";
  const sample = frame("Type", C.light, "VERTICAL", 10, 0); sample.fills=[]; sample.strokes=[]; sample.appendChild(label("Typography", C.light)); sample.appendChild(title("Inter + Vazirmatn", C.light, 38)); sample.appendChild(body("Body 16px minimum · Latin 1.6 line-height · Persian 1.9 · prose 62ch", C.light, 520)); type.appendChild(sample);
  const rhythm = frame("Rhythm", C.light, "VERTICAL", 8, 0); rhythm.fills=[]; rhythm.strokes=[]; rhythm.appendChild(label("Spacing / radius / motion", C.light)); rhythm.appendChild(body("4px rhythm · radii 4 / 8 / 12 / 16 / 24 · target 44px · motion 140 / 200 / 280ms · reduced 0.01ms", C.light, 560)); type.appendChild(rhythm); root.appendChild(type);
  const library = frame("Component library", C.light, "VERTICAL", 16, 0); library.fills=[]; library.strokes=[]; library.appendChild(label("24 reusable components", C.light));
  for (let i=0;i<COMPONENTS.length;i+=4) { const row=frame("Component row",C.light,"HORIZONTAL",16,0); row.fills=[]; row.strokes=[]; for (const name of COMPONENTS.slice(i,i+4)) row.appendChild(makeComponent(name,C.light)); library.appendChild(row); }
  root.appendChild(library); page.appendChild(root); return root;
}
function templateCard(name, theme) {
  const n=frame("Template / "+name,theme,"VERTICAL",12,20); n.resize(400,280); n.primaryAxisSizingMode="FIXED"; n.counterAxisSizingMode="FIXED"; n.appendChild(label("Template",theme)); n.appendChild(title(name,theme,22)); n.appendChild(body("Header → lead → semantic content → next action → footer",theme,350));
  const wire=frame("Wireframe",theme,"VERTICAL",8,10); wire.resize(350,100); wire.primaryAxisSizingMode="FIXED"; wire.counterAxisSizingMode="FIXED"; wire.fills=[solid(theme.muted)]; wire.appendChild(rule(theme,64)); wire.appendChild(rule(theme,220)); wire.appendChild(rule(theme,160)); n.appendChild(wire); return n;
}
function buildTemplates(page) {
  clean(page); const root=frame(OWNER+"Templates & Screens",C.light,"VERTICAL",32,48); root.x=0;root.y=0;root.resize(1440,100);root.counterAxisSizingMode="FIXED";
  sectionHeader(root,"Six shared templates","Build families, not one-off pages","Every substantial CMS record may receive a canonical detail page only after publication, privacy, rights, and meaningful-body gates pass.",C.light);
  for(let i=0;i<TEMPLATES.length;i+=3){const row=frame("Template row",C.light,"HORIZONTAL",24,0);row.fills=[];row.strokes=[];for(const n of TEMPLATES.slice(i,i+3))row.appendChild(templateCard(n,C.light));root.appendChild(row);}
  const reps=frame("Representative screens",C.dark,"VERTICAL",20,24); reps.resize(1344,100);reps.counterAxisSizingMode="FIXED"; reps.appendChild(label("Representative frames",C.dark));
  const names=["1440 Light Home","1440 Dark Home","390 Persian RTL","768 Tablet reflow","State sheet"];
  const row=frame("Representative row",C.dark,"HORIZONTAL",16,0);row.fills=[];row.strokes=[];for(const n of names){const card=frame(n,C.dark,"VERTICAL",10,16);card.resize(236,180);card.primaryAxisSizingMode="FIXED";card.counterAxisSizingMode="FIXED";card.appendChild(textNode(n,14,C.dark.ink,"Medium"));card.appendChild(body(n.includes("RTL")?"Logical direction · semantic order":"Same anatomy · responsive recomposition",C.dark,200));row.appendChild(card);}reps.appendChild(row);root.appendChild(reps);
  const states=frame("State distinctions",C.light,"HORIZONTAL",16,24); for(const s of ["Empty","No results","Recoverable error","Unavailable translation"]){const card=frame("State / "+s,C.light,"VERTICAL",8,12);card.resize(290,120);card.primaryAxisSizingMode="FIXED";card.counterAxisSizingMode="FIXED";card.appendChild(textNode(s,14,C.light.ink,"Medium"));card.appendChild(textNode("Explain condition + one recovery action",11,C.light.secondary));states.appendChild(card);}root.appendChild(states);
  page.appendChild(root);return root;
}
function stepCard(index,name,theme){const n=frame("Prototype / "+name,theme,"VERTICAL",10,16);n.resize(190,150);n.primaryAxisSizingMode="FIXED";n.counterAxisSizingMode="FIXED";n.appendChild(label("Step "+index,theme));n.appendChild(textNode(name,16,theme.ink,"Medium"));n.appendChild(textNode("CMS-safe · semantic fallback",11,theme.secondary));return n;}
function buildHandoff(page){
  clean(page);const root=frame(OWNER+"Prototype & Handoff",C.dark,"VERTICAL",32,48);root.x=0;root.y=0;root.resize(1440,100);root.counterAxisSizingMode="FIXED";
  sectionHeader(root,"Prototype path","Gateway to academic contact","The path is a handoff map. Runtime links must resolve from canonical locale routes and published CMS records.",C.dark);
  const path=frame("Prototype path",C.dark,"HORIZONTAL",12,0);path.fills=[];path.strokes=[];let i=1;for(const s of ["Language gateway","Home","Graph node","Research","Publication detail","Contact"]){path.appendChild(stepCard(i++,s,C.dark));if(i<7)path.appendChild(textNode("→",20,C.dark.gold,"Medium"));}root.appendChild(path);
  const graph=frame("Graph contract",C.dark,"HORIZONTAL",32,24);graph.resize(1344,100);graph.counterAxisSizingMode="FIXED";const orbit=figma.createEllipse();orbit.resize(260,260);orbit.fills=[];orbit.strokes=[solid(C.dark.brand)];orbit.strokeWeight=1;graph.appendChild(orbit);const copy=frame("Graph copy",C.dark,"VERTICAL",12,0);copy.fills=[];copy.strokes=[];copy.appendChild(label("Graph phases",C.dark));copy.appendChild(title("2D authoring → 2D/list public → optional 3D",C.dark,24));copy.appendChild(body("Phase 1 is authoritative and keyboard-accessible. Phase 2 consumes the same nodes and edges, and falls back for reduced motion, unsupported WebGL, coarse pointers, or user choice.",C.dark,780));graph.appendChild(copy);root.appendChild(graph);
  const rules=frame("Agent authority",C.dark,"HORIZONTAL",24,24);const columns=[
    ["Authority order","AGENTS → IA contract → Design contract/global.css → agent-kit JSON → handoff docs → raster references"],
    ["CMS boundary","Editors manage content, ordering, featured selection, graph data and CTA destinations. Tokens and component anatomy stay locked."],
    ["Motion","Default 140/200/280ms. No scroll-jacking or forced orbit. Reduced motion keeps all content visible and uses 2D/list graph."],
    ["White label","Future Brand Profile selects versioned token packs and modules. No arbitrary CSS/JS or shared private data."]
  ];for(const [h,b] of columns){const c=frame(h,C.dark,"VERTICAL",10,12);c.resize(296,180);c.primaryAxisSizingMode="FIXED";c.counterAxisSizingMode="FIXED";c.appendChild(textNode(h,15,C.dark.ink,"Medium"));c.appendChild(body(b,C.dark,270));rules.appendChild(c);}root.appendChild(rules);page.appendChild(root);return root;
}
async function main(){
  await figma.loadFontAsync({family:"Inter",style:"Regular"}); await figma.loadFontAsync({family:"Inter",style:"Medium"}); await figma.loadFontAsync({family:"Inter",style:"Bold"});
  await figma.loadAllPagesAsync(); await ensureVariables(); const pages=PAGES.map(pageByName); const roots=[buildFoundations(pages[0]),buildTemplates(pages[1]),buildHandoff(pages[2])];
  figma.currentPage=pages[0]; figma.viewport.scrollAndZoomIntoView([roots[0]]); figma.notify("Taha Figma Lite generated: 3 pages, tokens, 24 components, 6 templates and handoff.",{timeout:6000}); figma.closePlugin();
}
main().catch(error=>{console.error(error);figma.notify("Builder stopped: "+error.message,{error:true,timeout:8000});figma.closePlugin();});
