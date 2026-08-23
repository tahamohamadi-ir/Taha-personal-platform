# P1 Dependency License Compliance Report

Scope: `apps/web` dependency tree (static P1 frontend artifact). Generated 2026-08-15.

## Method

`npm ls --all --json` does not emit `license` fields (known npm limitation), so the declared license for every installed package was read from its `package.json` inside `node_modules` (authoritative for the exact installed versions, no registry guessing). No `npm view` fallback was needed because no installed package lacked a license field. The npm tree reports 434 name@version entries; 133 of them are optional platform-specific binary packages (esbuild / `@img/sharp-*` / `@rolldown/binding-*` / `@tailwindcss/oxide-*` / lightningcss and satteri/compiler-binding native builds) or uninstalled optional integrations (react, sass, less, stylus, ioredis, `@azure/*`, `@vercel/*`, etc.) that are not installed on Windows and are not part of the P1 build artifact. They are excluded from the table; their licenses were not verified locally.

## Summary

- Installed packages enumerated: **301** (all have a declared license; **0 MISSING**).
- Packages in the P1 bundle (build/runtime chain): **212** (including both font packages); dev-only tooling: **74**; used by both build chain and dev tooling: **8**; locked but not imported: **7** (motion, framer-motion, motion-dom, motion-utils, gsap, three, and `tslib` — the latter reachable only from three).
- Flagged for review: **3 license kinds, 6 packages** (see Compliance verdict).

## License inventory (installed packages)

| Package | Version | License | Used in P1 bundle? |
| --- | --- | --- | --- |
| @astrojs/check | 0.9.10 | MIT | No — dev tooling only |
| @astrojs/compiler | 2.13.1 | MIT | No — dev tooling only |
| @astrojs/compiler-binding | 0.3.2 | MIT | Yes — build/runtime chain |
| @astrojs/compiler-binding-win32-x64-msvc | 0.3.2 | MIT | Yes — build/runtime chain |
| @astrojs/compiler-rs | 0.3.2 | MIT | Yes — build/runtime chain |
| @astrojs/internal-helpers | 0.10.2 | MIT | Yes — build/runtime chain |
| @astrojs/language-server | 2.16.14 | MIT | No — dev tooling only |
| @astrojs/markdown-satteri | 0.3.5 | MIT | Yes — build/runtime chain |
| @astrojs/prism | 4.0.2 | MIT | Yes — build/runtime chain |
| @astrojs/telemetry | 3.3.3 | MIT | Yes — build/runtime chain |
| @astrojs/yaml2ts | 0.2.4 | MIT | No — dev tooling only |
| @babel/helper-string-parser | 7.29.7 | MIT | Yes — build/runtime chain |
| @babel/helper-validator-identifier | 7.29.7 | MIT | Yes — build/runtime chain |
| @babel/parser | 7.29.8 | MIT | Yes — build/runtime chain |
| @babel/types | 7.29.8 | MIT | Yes — build/runtime chain |
| @bruits/satteri-win32-x64-msvc | 0.9.5 | MIT | Yes — build/runtime chain |
| @capsizecss/unpack | 4.0.1 | MIT | Yes — build/runtime chain |
| @clack/core | 1.4.3 | MIT | Yes — build/runtime chain |
| @clack/prompts | 1.7.0 | MIT | Yes — build/runtime chain |
| @emmetio/abbreviation | 2.3.3 | MIT | No — dev tooling only |
| @emmetio/css-abbreviation | 2.1.8 | MIT | No — dev tooling only |
| @emmetio/css-parser | 0.4.1 | MIT | No — dev tooling only |
| @emmetio/html-matcher | 1.3.0 | ISC | No — dev tooling only |
| @emmetio/scanner | 1.0.4 | MIT | No — dev tooling only |
| @emmetio/stream-reader | 2.2.0 | MIT | No — dev tooling only |
| @emmetio/stream-reader-utils | 0.1.0 | MIT | No — dev tooling only |
| @esbuild/win32-x64 | 0.28.2 | MIT | Yes — build/runtime chain |
| @fontsource-variable/inter | 5.3.0 | OFL-1.1 | Yes — font files in bundle |
| @fontsource-variable/vazirmatn | 5.3.0 | OFL-1.1 | Yes — font files in bundle |
| @img/colour | 1.1.0 | MIT | Yes — build/runtime chain |
| @img/sharp-win32-x64 | 0.35.3 | Apache-2.0 AND LGPL-3.0-or-later | Yes — build/runtime chain |
| @jridgewell/gen-mapping | 0.3.13 | MIT | Yes — build/runtime chain |
| @jridgewell/remapping | 2.3.5 | MIT | Yes — build/runtime chain |
| @jridgewell/resolve-uri | 3.1.2 | MIT | Yes — build/runtime chain |
| @jridgewell/sourcemap-codec | 1.5.5 | MIT | Yes (build chain) + dev tooling |
| @jridgewell/trace-mapping | 0.3.31 | MIT | Yes — build/runtime chain |
| @oslojs/encoding | 1.1.0 | MIT | Yes — build/runtime chain |
| @oxc-project/types | 0.144.0 | MIT | Yes — build/runtime chain |
| @rolldown/binding-win32-x64-msvc | 1.2.4 | MIT | Yes — build/runtime chain |
| @rolldown/pluginutils | 1.0.1 | MIT | Yes — build/runtime chain |
| @shikijs/core | 4.4.3 | MIT | Yes — build/runtime chain |
| @shikijs/engine-javascript | 4.4.3 | MIT | Yes — build/runtime chain |
| @shikijs/engine-oniguruma | 4.4.3 | MIT | Yes — build/runtime chain |
| @shikijs/langs | 4.4.3 | MIT | Yes — build/runtime chain |
| @shikijs/primitive | 4.4.3 | MIT | Yes — build/runtime chain |
| @shikijs/themes | 4.4.3 | MIT | Yes — build/runtime chain |
| @shikijs/types | 4.4.3 | MIT | Yes — build/runtime chain |
| @shikijs/vscode-textmate | 10.0.2 | MIT | Yes — build/runtime chain |
| @tailwindcss/node | 4.3.3 | MIT | Yes — build/runtime chain |
| @tailwindcss/oxide | 4.3.3 | MIT | Yes — build/runtime chain |
| @tailwindcss/oxide-win32-x64-msvc | 4.3.3 | MIT | Yes — build/runtime chain |
| @tailwindcss/vite | 4.3.3 | MIT | Yes — build/runtime chain |
| @types/estree | 1.0.9 | MIT | Yes — build/runtime chain |
| @types/estree-jsx | 1.0.5 | MIT | Yes — build/runtime chain |
| @types/hast | 3.0.5 | MIT | Yes — build/runtime chain |
| @types/mdast | 4.0.4 | MIT | Yes — build/runtime chain |
| @types/nlcst | 2.0.3 | MIT | Yes — build/runtime chain |
| @types/unist | 3.0.3 | MIT | Yes — build/runtime chain |
| @ungap/structured-clone | 1.3.3 | ISC | Yes — build/runtime chain |
| @volar/kit | 2.4.28 | MIT | No — dev tooling only |
| @volar/language-core | 2.4.28 | MIT | No — dev tooling only |
| @volar/language-server | 2.4.28 | MIT | No — dev tooling only |
| @volar/language-service | 2.4.28 | MIT | No — dev tooling only |
| @volar/source-map | 2.4.28 | MIT | No — dev tooling only |
| @volar/typescript | 2.4.28 | MIT | No — dev tooling only |
| @vscode/emmet-helper | 2.11.0 | MIT | No — dev tooling only |
| @vscode/l10n | 0.0.18 | MIT | No — dev tooling only |
| ajv | 8.20.0 | MIT | No — dev tooling only |
| ajv-draft-04 | 1.0.0 | MIT | No — dev tooling only |
| ajv-i18n | 4.2.0 | MIT | No — dev tooling only |
| am-i-vibing | 0.4.0 | MIT | Yes — build/runtime chain |
| ansi-regex | 6.3.0 | MIT | No — dev tooling only |
| ansi-styles | 4.3.0 | MIT | Yes — build/runtime chain |
| ansi-styles | 6.2.3 | MIT | No — dev tooling only |
| anymatch | 3.1.3 | ISC | Yes — build/runtime chain |
| argparse | 2.0.1 | Python-2.0 | Yes — build/runtime chain |
| aria-query | 5.3.2 | Apache-2.0 | Yes — build/runtime chain |
| astro | 7.2.2 | MIT | Yes — build/runtime chain |
| axobject-query | 4.1.0 | Apache-2.0 | Yes — build/runtime chain |
| bail | 2.0.2 | MIT | Yes — build/runtime chain |
| boolbase | 1.0.0 | ISC | Yes — build/runtime chain |
| ccount | 2.0.1 | MIT | Yes — build/runtime chain |
| chalk | 4.1.2 | MIT | Yes — build/runtime chain |
| character-entities-html4 | 2.1.0 | MIT | Yes — build/runtime chain |
| character-entities-legacy | 3.0.0 | MIT | Yes — build/runtime chain |
| chokidar | 4.0.3 | MIT | No — dev tooling only |
| chokidar | 5.0.0 | MIT | Yes — build/runtime chain |
| ci-info | 4.4.0 | MIT | Yes — build/runtime chain |
| cliui | 9.0.1 | ISC | No — dev tooling only |
| clsx | 2.1.1 | MIT | Yes — build/runtime chain |
| color-convert | 2.0.1 | MIT | Yes — build/runtime chain |
| color-name | 1.1.4 | MIT | Yes — build/runtime chain |
| comma-separated-tokens | 2.0.3 | MIT | Yes — build/runtime chain |
| commander | 11.1.0 | MIT | Yes — build/runtime chain |
| commander | 14.0.3 | MIT | Yes — build/runtime chain |
| common-ancestor-path | 2.0.0 | BlueOak-1.0.0 | Yes — build/runtime chain |
| cookie | 2.0.1 | MIT | Yes — build/runtime chain |
| cookie-es | 1.2.3 | MIT | Yes — build/runtime chain |
| crossws | 0.3.5 | MIT | Yes — build/runtime chain |
| css-select | 5.2.2 | BSD-2-Clause | Yes — build/runtime chain |
| css-tree | 2.2.1 | MIT | Yes — build/runtime chain |
| css-tree | 3.2.1 | MIT | Yes — build/runtime chain |
| css-what | 6.2.2 | BSD-2-Clause | Yes — build/runtime chain |
| csso | 5.0.5 | MIT | Yes — build/runtime chain |
| defu | 6.1.7 | MIT | Yes — build/runtime chain |
| dequal | 2.0.3 | MIT | Yes — build/runtime chain |
| destr | 2.0.5 | MIT | Yes — build/runtime chain |
| detect-libc | 2.1.2 | Apache-2.0 | Yes — build/runtime chain |
| devalue | 5.9.0 | MIT | Yes — build/runtime chain |
| devlop | 1.1.0 | MIT | Yes — build/runtime chain |
| diff | 8.0.4 | BSD-3-Clause | Yes — build/runtime chain |
| dom-serializer | 2.0.0 | MIT | Yes — build/runtime chain |
| domelementtype | 2.3.0 | BSD-2-Clause | Yes — build/runtime chain |
| domhandler | 5.0.3 | BSD-2-Clause | Yes — build/runtime chain |
| domutils | 3.2.2 | BSD-2-Clause | Yes — build/runtime chain |
| dset | 3.1.4 | MIT | Yes — build/runtime chain |
| emmet | 2.4.11 | MIT | No — dev tooling only |
| emoji-regex | 10.6.0 | MIT | No — dev tooling only |
| enhanced-resolve | 5.24.5 | MIT | Yes — build/runtime chain |
| entities | 4.5.0 | BSD-2-Clause | Yes — build/runtime chain |
| entities | 6.0.1 | BSD-2-Clause | Yes — build/runtime chain |
| es-module-lexer | 2.3.1 | MIT | Yes — build/runtime chain |
| esbuild | 0.28.2 | MIT | Yes — build/runtime chain |
| escalade | 3.2.0 | MIT | No — dev tooling only |
| eventemitter3 | 5.0.4 | MIT | Yes — build/runtime chain |
| extend | 3.0.2 | MIT | Yes — build/runtime chain |
| fast-deep-equal | 3.1.3 | MIT | No — dev tooling only |
| fast-string-truncated-width | 3.0.3 | MIT | Yes — build/runtime chain |
| fast-string-width | 3.0.2 | MIT | Yes — build/runtime chain |
| fast-uri | 3.1.5 | BSD-3-Clause | No — dev tooling only |
| fast-wrap-ansi | 0.2.2 | MIT | Yes — build/runtime chain |
| fdir | 6.5.0 | MIT | Yes (build chain) + dev tooling |
| find-process | 2.1.1 | MIT | Yes — build/runtime chain |
| flattie | 1.1.1 | MIT | Yes — build/runtime chain |
| fontace | 0.4.1 | MIT | Yes — build/runtime chain |
| fontkitten | 1.0.3 | MIT | Yes — build/runtime chain |
| framer-motion | 13.1.0 | MIT | No — locked, not imported |
| get-caller-file | 2.0.5 | ISC | No — dev tooling only |
| get-east-asian-width | 1.6.0 | MIT | No — dev tooling only |
| get-tsconfig | 5.0.0-beta.4 | MIT | Yes — build/runtime chain |
| github-slugger | 2.0.0 | ISC | Yes — build/runtime chain |
| graceful-fs | 4.2.11 | ISC | Yes — build/runtime chain |
| gsap | 3.15.0 | Standard 'no charge' license: https://gsap.com/standard-license. | No — locked, not imported |
| h3 | 1.15.11 | MIT | Yes — build/runtime chain |
| has-flag | 4.0.0 | MIT | Yes — build/runtime chain |
| hast-util-from-html | 2.0.3 | MIT | Yes — build/runtime chain |
| hast-util-from-parse5 | 8.0.3 | MIT | Yes — build/runtime chain |
| hast-util-parse-selector | 4.0.0 | MIT | Yes — build/runtime chain |
| hast-util-to-html | 9.0.5 | MIT | Yes — build/runtime chain |
| hast-util-whitespace | 3.0.0 | MIT | Yes — build/runtime chain |
| hastscript | 9.0.1 | MIT | Yes — build/runtime chain |
| html-escaper | 3.0.3 | MIT | Yes — build/runtime chain |
| html-void-elements | 3.0.0 | MIT | Yes — build/runtime chain |
| http-cache-semantics | 4.2.0 | BSD-2-Clause | Yes — build/runtime chain |
| iron-webcrypto | 1.2.1 | MIT | Yes — build/runtime chain |
| is-docker | 4.0.0 | MIT | Yes — build/runtime chain |
| is-plain-obj | 4.1.0 | MIT | Yes — build/runtime chain |
| jiti | 2.7.0 | MIT | Yes — build/runtime chain |
| js-yaml | 4.3.1 | MIT | Yes — build/runtime chain |
| json-schema-traverse | 1.0.0 | MIT | No — dev tooling only |
| jsonc-parser | 2.3.1 | MIT | No — dev tooling only |
| jsonc-parser | 3.3.1 | MIT | Yes (build chain) + dev tooling |
| kleur | 4.1.5 | MIT | No — dev tooling only |
| lightningcss | 1.32.0 | MPL-2.0 | Yes — build/runtime chain |
| lightningcss | 1.33.0 | MPL-2.0 | Yes — build/runtime chain |
| lightningcss-win32-x64-msvc | 1.32.0 | MPL-2.0 | Yes — build/runtime chain |
| lightningcss-win32-x64-msvc | 1.33.0 | MPL-2.0 | Yes — build/runtime chain |
| loglevel | 1.9.2 | MIT | Yes — build/runtime chain |
| lru-cache | 11.5.2 | BlueOak-1.0.0 | Yes — build/runtime chain |
| magic-string | 0.30.21 | MIT | Yes — build/runtime chain |
| magic-string | 1.2.0 | MIT | Yes — build/runtime chain |
| magicast | 0.5.4 | MIT | Yes — build/runtime chain |
| mdast-util-to-hast | 13.2.1 | MIT | Yes — build/runtime chain |
| mdn-data | 2.0.28 | CC0-1.0 | Yes — build/runtime chain |
| mdn-data | 2.27.1 | CC0-1.0 | Yes — build/runtime chain |
| micromark-util-character | 2.1.1 | MIT | Yes — build/runtime chain |
| micromark-util-encode | 2.0.1 | MIT | Yes — build/runtime chain |
| micromark-util-sanitize-uri | 2.0.1 | MIT | Yes — build/runtime chain |
| micromark-util-symbol | 2.0.1 | MIT | Yes — build/runtime chain |
| micromark-util-types | 2.0.2 | MIT | Yes — build/runtime chain |
| motion | 13.1.0 | MIT | No — locked, not imported |
| motion-dom | 13.0.0 | MIT | No — locked, not imported |
| motion-utils | 13.0.0 | MIT | No — locked, not imported |
| mrmime | 2.0.1 | MIT | Yes — build/runtime chain |
| muggle-string | 0.4.1 | MIT | No — dev tooling only |
| nanoid | 3.3.18 | MIT | Yes — build/runtime chain |
| neotraverse | 1.0.1 | MIT | Yes — build/runtime chain |
| nlcst-to-string | 4.0.0 | MIT | Yes — build/runtime chain |
| node-fetch-native | 1.6.7 | MIT | Yes — build/runtime chain |
| node-mock-http | 1.0.5 | MIT | Yes — build/runtime chain |
| normalize-path | 3.0.0 | MIT | Yes — build/runtime chain |
| nth-check | 2.1.1 | BSD-2-Clause | Yes — build/runtime chain |
| obug | 2.1.4 | MIT | Yes — build/runtime chain |
| ofetch | 1.5.1 | MIT | Yes — build/runtime chain |
| ohash | 2.0.12 | MIT | Yes — build/runtime chain |
| oniguruma-parser | 0.12.2 | MIT | Yes — build/runtime chain |
| oniguruma-to-es | 4.3.6 | MIT | Yes — build/runtime chain |
| p-limit | 7.3.1 | MIT | Yes — build/runtime chain |
| p-queue | 9.3.3 | MIT | Yes — build/runtime chain |
| p-timeout | 7.0.1 | MIT | Yes — build/runtime chain |
| package-manager-detector | 1.8.0 | MIT | Yes — build/runtime chain |
| parse5 | 7.3.0 | MIT | Yes — build/runtime chain |
| path-browserify | 1.0.1 | MIT | No — dev tooling only |
| piccolore | 0.1.3 | ISC | Yes — build/runtime chain |
| picocolors | 1.1.1 | ISC | Yes — build/runtime chain |
| picomatch | 2.3.2 | MIT | Yes — build/runtime chain |
| picomatch | 4.0.5 | MIT | Yes (build chain) + dev tooling |
| postcss | 8.5.26 | MIT | Yes — build/runtime chain |
| prettier | 3.9.6 | MIT | No — dev tooling only |
| prismjs | 1.30.0 | MIT | Yes — build/runtime chain |
| process-ancestry | 0.1.0 | MIT | Yes — build/runtime chain |
| property-information | 7.2.0 | MIT | Yes — build/runtime chain |
| radix3 | 1.1.2 | MIT | Yes — build/runtime chain |
| readdirp | 4.1.2 | MIT | No — dev tooling only |
| readdirp | 5.1.1 | MIT | Yes — build/runtime chain |
| regex | 6.1.0 | MIT | Yes — build/runtime chain |
| regex-recursion | 6.0.2 | MIT | Yes — build/runtime chain |
| regex-utilities | 2.3.0 | MIT | Yes — build/runtime chain |
| request-light | 0.5.8 | MIT | No — dev tooling only |
| request-light | 0.7.0 | MIT | No — dev tooling only |
| require-from-string | 2.0.2 | MIT | No — dev tooling only |
| resolve-pkg-maps | 1.0.0 | MIT | Yes — build/runtime chain |
| retext-smartypants | 6.2.0 | MIT | Yes — build/runtime chain |
| rolldown | 1.2.4 | MIT | Yes — build/runtime chain |
| satteri | 0.9.5 | MIT | Yes — build/runtime chain |
| sax | 1.6.1 | BlueOak-1.0.0 | Yes — build/runtime chain |
| semver | 7.8.5 | ISC | Yes (build chain) + dev tooling |
| sharp | 0.35.3 | Apache-2.0 | Yes — build/runtime chain |
| shiki | 4.4.3 | MIT | Yes — build/runtime chain |
| sisteransi | 1.0.5 | MIT | Yes — build/runtime chain |
| smol-toml | 1.8.0 | BSD-3-Clause | Yes — build/runtime chain |
| source-map-js | 1.2.1 | BSD-3-Clause | Yes — build/runtime chain |
| space-separated-tokens | 2.0.2 | MIT | Yes — build/runtime chain |
| string-width | 7.2.0 | MIT | No — dev tooling only |
| string-width | 8.2.2 | MIT | No — dev tooling only |
| stringify-entities | 4.0.4 | MIT | Yes — build/runtime chain |
| strip-ansi | 7.2.0 | MIT | No — dev tooling only |
| supports-color | 7.2.0 | MIT | Yes — build/runtime chain |
| svgo | 4.0.2 | MIT | Yes — build/runtime chain |
| tailwindcss | 4.3.3 | MIT | Yes — build/runtime chain |
| tapable | 2.3.3 | MIT | Yes — build/runtime chain |
| three | 0.185.1 | MIT | No — locked, not imported |
| tiny-inflate | 1.0.3 | MIT | Yes — build/runtime chain |
| tinyclip | 0.1.15 | MIT | Yes — build/runtime chain |
| tinyexec | 1.3.0 | MIT | Yes — build/runtime chain |
| tinyglobby | 0.2.17 | MIT | Yes (build chain) + dev tooling |
| trim-lines | 3.0.1 | MIT | Yes — build/runtime chain |
| trough | 2.2.0 | MIT | Yes — build/runtime chain |
| tslib | 2.8.1 | 0BSD | No — locked, not imported |
| typesafe-path | 0.2.2 | MIT | No — dev tooling only |
| typescript | 5.9.3 | Apache-2.0 | No — dev tooling only |
| typescript-auto-import-cache | 0.3.6 | MIT | No — dev tooling only |
| ufo | 1.6.4 | MIT | Yes — build/runtime chain |
| ultrahtml | 1.7.0 | MIT | Yes — build/runtime chain |
| uncrypto | 0.1.3 | MIT | Yes — build/runtime chain |
| undici | 8.10.0 | MIT | Yes — build/runtime chain |
| unified | 11.0.5 | MIT | Yes — build/runtime chain |
| unifont | 0.7.5 | MIT | Yes — build/runtime chain |
| unist-util-is | 6.0.1 | MIT | Yes — build/runtime chain |
| unist-util-position | 5.0.0 | MIT | Yes — build/runtime chain |
| unist-util-stringify-position | 4.0.0 | MIT | Yes — build/runtime chain |
| unist-util-visit | 5.1.0 | MIT | Yes — build/runtime chain |
| unist-util-visit-parents | 6.0.2 | MIT | Yes — build/runtime chain |
| unstorage | 1.17.5 | MIT | Yes — build/runtime chain |
| vfile | 6.0.3 | MIT | Yes — build/runtime chain |
| vfile-location | 5.0.3 | MIT | Yes — build/runtime chain |
| vfile-message | 4.0.3 | MIT | Yes — build/runtime chain |
| vite | 8.2.1 | MIT | Yes — build/runtime chain |
| vitefu | 1.1.3 | MIT | Yes — build/runtime chain |
| volar-service-css | 0.0.71 | MIT | No — dev tooling only |
| volar-service-emmet | 0.0.71 | MIT | No — dev tooling only |
| volar-service-html | 0.0.71 | MIT | No — dev tooling only |
| volar-service-prettier | 0.0.71 | MIT | No — dev tooling only |
| volar-service-typescript | 0.0.71 | MIT | No — dev tooling only |
| volar-service-typescript-twoslash-queries | 0.0.71 | MIT | No — dev tooling only |
| volar-service-yaml | 0.0.71 | MIT | No — dev tooling only |
| vscode-css-languageservice | 6.3.10 | MIT | No — dev tooling only |
| vscode-html-languageservice | 5.6.2 | MIT | No — dev tooling only |
| vscode-json-languageservice | 4.1.8 | MIT | No — dev tooling only |
| vscode-jsonrpc | 8.2.0 | MIT | No — dev tooling only |
| vscode-jsonrpc | 9.0.1 | MIT | No — dev tooling only |
| vscode-languageserver | 9.0.1 | MIT | No — dev tooling only |
| vscode-languageserver-protocol | 3.17.5 | MIT | No — dev tooling only |
| vscode-languageserver-protocol | 3.18.2 | MIT | No — dev tooling only |
| vscode-languageserver-textdocument | 1.0.12 | MIT | No — dev tooling only |
| vscode-languageserver-types | 3.17.5 | MIT | No — dev tooling only |
| vscode-languageserver-types | 3.18.0 | MIT | No — dev tooling only |
| vscode-nls | 5.2.0 | MIT | No — dev tooling only |
| vscode-uri | 3.1.0 | MIT | No — dev tooling only |
| web-namespaces | 2.0.1 | MIT | Yes — build/runtime chain |
| wrap-ansi | 9.0.2 | MIT | No — dev tooling only |
| xxhash-wasm | 1.1.0 | MIT | Yes — build/runtime chain |
| y18n | 5.0.8 | ISC | No — dev tooling only |
| yaml | 2.8.3 | ISC | No — dev tooling only |
| yaml | 2.9.0 | ISC | Yes (build chain) + dev tooling |
| yaml-language-server | 1.23.0 | MIT | No — dev tooling only |
| yargs | 18.1.0 | MIT | No — dev tooling only |
| yargs-parser | 22.0.0 | ISC | Yes (build chain) + dev tooling |
| yocto-queue | 1.2.2 | MIT | Yes — build/runtime chain |
| zod | 4.4.3 | MIT | Yes — build/runtime chain |
| zwitch | 2.0.4 | MIT | Yes — build/runtime chain |

## Compliance verdict

All 301 installed packages declare a license. 295 are permissive or permissive-equivalent (MIT 253, ISC 15, BSD-2-Clause 9, BSD-3-Clause 4, Apache-2.0 5, BlueOak-1.0.0 3, CC0-1.0 2, OFL-1.1 2, 0BSD 1, Python-2.0 1). BlueOak-1.0.0, CC0-1.0, 0BSD and Python-2.0 are OSI-approved permissive licenses outside the five pre-approved SPDX identifiers; they are treated as acceptable and noted here for the record.

**Flagged — needs review (3 license kinds, 6 packages):**

1. **gsap 3.15.0** — declared license: `Standard 'no charge' license: https://gsap.com/standard-license.` This is the proprietary GSAP Standard License (no-charge tier), not an SPDX identifier and not an OSI permissive license; its commercial terms are unclear from the metadata alone. Direct dependency, **locked but not imported** — it must not ship in a public bundle without explicit owner license acceptance (ADR-0028 keeps gsap deferred).
2. **@img/sharp-win32-x64 0.35.3** — declared license: `Apache-2.0 AND LGPL-3.0-or-later` (the bundled libvips binary carries LGPL-3.0-or-later). LGPL is copyleft; the main `sharp` package itself is Apache-2.0. In the build chain (Astro image optimization). Requires confirmation that LGPL source-availability obligations for the native binary are satisfiable for this deployment.
3. **lightningcss 1.32.0 / 1.33.0 and lightningcss-win32-x64-msvc** — MPL-2.0. File-level weak copyleft, not in the pre-approved acceptable list. Used by `@tailwindcss/node` and `vite` (both in the P1 build chain). MPL-2.0 requires source availability for MPL-covered files; generally satisfiable in a public repo but needs explicit confirmation.

**Motion adoption note (2026-08-22):** `motion` (MIT) is authorized for the research relationship graph island only (`ADR-0028`, route `/{locale}/research/`, `client:visible`). `three` remains MIT but deferred because it exceeds the 35KB gzip island budget.

**Verdict: PASS with conditions** — no MISSING/unverifiable licenses; the only items outside the acceptable list are (a) gsap (proprietary — keep locked out of imports until owner license acceptance), (b) the LGPL-3.0-or-later component of the sharp Windows binary, and (c) MPL-2.0 lightningcss. Items (b) and (c) are in the build toolchain of the static artifact and are common in practice, but are flagged because they fall outside the policy's pre-approved license list. Re-run this report after any dependency change; re-verify gsap's license terms before any future use.
