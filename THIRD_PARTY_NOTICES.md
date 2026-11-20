# Third-party and artwork notices

## Plugin code

The repository retains the MIT license declared for this plugin. Its code/license declaration does not establish permission for third-party trademarks or materials with an independent license.

## User-supplied visual reference

The visual layout and particle sphere were adapted from the `Hypers Work · AVA` HTML reference supplied by the repository owner during development. That reference is not included as a standalone demo and its simulated task runner is not used to claim real execution progress. The owner's supply of this material is not an independent verification of upstream ownership or licensing.

## Hypers mark

`src/client/brand-logo.js` inlines the HypersHub brand mark supplied by the repository owner from `https://hy.hypershub.com/agent-center/logo-dark.png` (dark-background variant, 139x160 PNG, embedded at 76x88 as a base64 data URI). Artwork is bundled rather than fetched at runtime: the plugin makes no request to the Hub origin. The owner's supply of this file is not an independent verification of upstream ownership or licensing. This does not grant third parties rights to the HypersHub/HYPERS names or marks, or authorize representing another product as HypersHub. Brand artwork is fixed and is not affected by the plugin's accent theme.

## Simplex noise shader

The GLSL simplex-noise functions in `src/client/20-orb.js` were inherited through the supplied HTML reference. They are recognizable as the commonly circulated Ashima Arts / Stefan Gustavson webgl-noise implementation. The shader function attribution is retained below; the exact original reference's revision was not recorded, so the source correspondence must be rechecked before independent redistribution decisions.

Reference: https://github.com/ashima/webgl-noise

```text
Copyright (C) 2011 Ashima Arts. All rights reserved.
Copyright (C) 2011 Stefan Gustavson. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## Marked

Marked 15.0.12 is bundled into the browser artifact for local Markdown tokenization. The tokenizer never supplies HTML to `dangerouslySetInnerHTML`; presentation renders tokens as React elements and filters link schemes. Its full distributed license, including Markdown attribution, is retained in `licenses/marked-LICENSE.md`.

esbuild is a development-only bundler; it is not included in the runtime artifact.

## React

React and React DOM 18.3.1 are MIT-licensed development dependencies used for tests. They are not bundled into `client.js`: the plugin uses the Harness runtime's React instance. Dependency license files are supplied in their installed npm packages.
