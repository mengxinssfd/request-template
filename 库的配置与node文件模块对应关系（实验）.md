# 库的配置与node文件模块对应关系（实验）

## 库基础配置

`package.json`

```json
{
  "main": "dist/index.cjs.js",
  "module": "dist/index.js"
}
```

## 库基础配置+`exports`

`package.json`

```json
{
  "main": "dist/index.cjs.js",
  "module": "dist/index.js",
  "exports": {
    ".": {
      "import": {
        "node": "./dist/index.mjs",
        "default": "./dist/index.js"
      },
      "require": "./dist/index.cjs.js"
    }
  }
}
```

## 结果

| 模块                                                                     | `.js`                                         | `.mjs`                                                  |
| ------------------------------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------- |
| `cjs(require)`                                                           | ✓`index.cjs.js`                               | ✘                                                       |
| `esm(import)`                                                            | ✘                                             | ✓ (使用`import` 实际加载的是 `index.cjs.js`,pkg:`main`) |
| `esm(import)`（库基础配置+`exports`）                                    | ✘                                             | ✓`index.mjs` pkg:`exports.node`                         |
| `esm(import)`:`type:"module"`（当前项目）                                | ✓ `index.cjs.js`,可以使用 `import`,pkg:`main` | ✓ `index.cjs.js`,pkg:`main`                             |
| `esm(import)`:`type:"module"`（当前项目）+ `esm`（库基础配置+`exports`） | ✓`index.mjs` ,pkg: `exports.node`             | ✓`index.mjs`,pkg:`exports.node`                         |
