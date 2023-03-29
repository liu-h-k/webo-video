import resolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import babel from "@rollup/plugin-babel";

import { createRequire } from 'node:module';
const require = createRequire(
    import.meta.url);
const pkg = require('./package.json');

export default {
    input: "src/index.js",
    output: [{
            file: pkg.main,
            format: 'cjs',
        },
        {
            file: pkg.module,
            format: 'esm',
        },
        {
            file: pkg.browser,
            name: "weboVideo",
            format: "umd",
            sourcemap: true,
            export: "default",
        },

    ],
    external: ["video.js", 'flv.js'],
    ignore: [pkg.main, pkg.module, pkg.browser],
    plugins: [
        commonjs({
            include: /node_modules/
        }),
        json(),
        resolve(),
        terser(),
        babel({
            exclude: 'node_modules/**',
        })
    ],
}