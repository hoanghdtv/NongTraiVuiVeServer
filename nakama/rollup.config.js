const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const babel = require('@rollup/plugin-babel');

module.exports = {
  input: 'src/main.ts',
  external: ['nakama-runtime'], // Nakama runtime as external
  plugins: [
    typescript({ 
      tsconfig: './tsconfig.json',
      target: 'es5'
    }),
    resolve({ 
      preferBuiltins: true,
      browser: false 
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.ts'],
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', {
          targets: { 
            node: '12' // Nakama compatible
          },
          modules: false // Let rollup handle modules
        }],
        '@babel/preset-typescript'
      ]
    })
  ],
  output: {
    file: 'build/index.js',
    format: 'cjs',
    sourcemap: false,
    exports: 'named'
  }
};
