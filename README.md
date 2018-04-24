# dragNdrop 0.1
A lightweight drag and drop library.

min requirements: hammer.2.0.8.js && IE11+


# Usage
## HTML:
```HTML
<!-- this it the minimum requirement but you can have as many drop-item-containers and drop-items as you like -->
<div class="drop-item-container">
  <div class="drop-item"></div>
</div>

```
## JS:
```javascript
//if the config or a property is not provided, the internally defined class names will be used.
var config = {
  dropItemSelector: 'drop-item',
  dropItemContainerSelector: 'drop-item-container',
  dropItemPlaceholder: 'drop-item-placeholder',
}

var dNd = dragNdrop();
dNd.init(config)
```

## Binding dragNdrop features to dynamically added nodes:
```javascript
dNd.registerAdditionalDropItems(arrayOfnewlyCreatedNodes);
```
    
    
