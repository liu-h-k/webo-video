import resolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import babel from "@rollup/plugin-babel";
import rollupTypescript from 'rollup-plugin-typescript2'

import { createRequire } from 'node:module';
const require = createRequire(
    import.meta.url);
const pkg = require('./package.json');

export default {
    input: "src/index.ts",
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
    external: ["video.js", "videojs-flvjs-es6"],
    ignore: [pkg.main, pkg.module, pkg.browser],
    plugins: [
        commonjs({
            include: /node_modules/
        }),
        json(),
        // rollup 编译 typescript 
        rollupTypescript(),
        resolve(),
        terser(),
        babel({
            exclude: 'node_modules/**',
        })
    ],
}