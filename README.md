# dragNdrop 0.1
A lightweight drag and drop library.

min requirements: hammer.2.0.8.js && IE11+


# Usage
## HTML:
    <div class="drop-item-container">
      <div class="drop-item"></div>
    </div>
    <div class="drop-item-container">
      
    </div>
    <div class="drop-item-container">
      
    </div>

## JS:
    //if the config or a property is not provided, the internally defined class names will be used.
    var config = {
      dropItemSelector: 'drop-item',
      dropItemContainerSelector: 'drop-item-container',
      dropItemPlaceholder: 'drop-item-placeholder',
    }

    var dNd = dragNdrop();
    dNd.init(config)
    

## Binding dragNdrop features to dynamically added nodes:
    dNd.registerAdditionalDropItems(arrayOfnewlyCreatedNodes);
        
    
    
