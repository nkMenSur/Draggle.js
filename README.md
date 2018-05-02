# Draggle 0.3
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

var dNd = Draggle();
dNd.init(config)
```

## Binding Draggle features to dynamically added nodes:
```javascript
dNd.registerAdditionalDropItems(arrayOfNewlyCreatedNodes);
```
## Simple Example:
[Take a look!](https://nkmensur.github.io/Draggle.js/Simple-Example.html)

# Documentation:
## Events:
 EventName      | Emitted when:            | Event Parameters                                       |
| ------------- |:------------------------:| ------------------------------------------------------:|
| `ItemPickedUp`| User picks up a dropItem | detail => originalEvent - contextItem - cursorPosition |
| `ItemMoving`  | User drags a dropItem    | detail => originalEvent - contextItem - cursorPosition |
| `ItemDropped` | User Releases a dropItem | detail => originalEvent - targetDropContainer - success - contextItem - cursorPosition |

