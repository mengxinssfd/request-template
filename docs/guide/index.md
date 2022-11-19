
## 使用方法

`npm`引入

```shell
pnpm add @mxssfd/ts-utils -S
```

```javascript
import { debounce } from '@mxssfd/ts-utils';
debounce(() => {
  console.log('do something');
}, 1000);
```

`cdn`引入

```html
<script src="https://cdn.jsdelivr.net/npm/@mxssfd/ts-utils/dist/ts-utils.global.js"></script>
<script>
  tsUtils.debounce(() => {
    console.log('do something');
  }, 1000);
</script>
```