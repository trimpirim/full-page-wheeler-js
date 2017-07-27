# Full page wheeler

Allows to scroll between 100vh height sections

## Usage

```javascript
$(document).ready(() => {
    Wheeler.init('.section', {
        //leaving the current frame
        leaving(nextIndex, previousIndex, direction, activeElement) {
        },
        //entered the last frame
        enteredLast(activeElement) {
        },
        //leaved the last frame
        leavedLast(activeElement) {
        },
        //delay before leaving/entering
        delay: 2000,
        //sections that are scrollable
        scrollables: [
            '.scrollable-section'
        ],
        //navigation element
        navigation: '.js-wheeler-navigation-item'
    })
});
```

```html
<div class="section">
    <div class="section-content">
    </div>
</div>
<div class="section">
    <div class="section-content">
    </div>
</div>
```