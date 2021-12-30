# React Virtual Datagrid

Yet another Virtual Data component (a.k.a. Virtual Scroll, Virtual Window, Virtual List, Virtual Workspace, etc.). Many names but one functionality – virtually load huge set of data, simulating that the whole data is there, while a small initial set of it is only loaded. On demand, a new portion of the data is loaded and injected into the view. 

## Key features

Why you should choose React Virtual Datagrid over the many more out there?

 - Free DOM structure & styling
 - Responsive (mobile-friendly)
 - Optimises # of fetch requests + the limit of items per request based on viewport resolution
 - Easy to use
 - Does not care about scrollable container
 - Modern (based on `IntersectionObserver`)

## How to use

### Installation

```bash
npm i --save react-virtual-datagrid
```

### Integration

The module exports one react component called `VirtualDatagrid`. It accepts [a couple of props](#props), the required ones are:
    - "requestsMore" `Function`; will be called on initial render to fetch the initial portion of items, + every time when new portion of items is required. Here you must place your business logic that calls your API and fetches the data + storing the response items in your store (Redux, etc.) or directly send the updated data to the component. Accepts two parameters: "offset" `Number` and "limit" `Number`
    - "data" `Array` containing your data entries; initially can be empty, the `VirtualDatagrid` will call the "requestsMore" function. **IMPORTANT: The data array must have the exact length of your total items.** The not-yet-requested items should be `undefined` or `null`
    - "columns" `Number` The component must know how many columns you have in the grid for proper calculations
    - You must provide a render function as a child of the `VirtualDatagrid` component. There you will receive array of items to be rendered, so you have a full freedom for the DOM structure.

```jsx
import React from 'react';
import { VirtualDatagrid } from 'react-virtual-datagrid';

import { fetchMoreItems } from './your-api';

export const App = ({ items }) => 
    <div className="grid">
        <VirtualDatagrid data={items} columns={3} requestMore={fetchMoreItems}>
            {items => items.map(item => (
                <div className="column" key={item?.id || Math.random()}>
                    {item ? item.text : 'Loading...'}
                </div>
            ))}
        </VirtualDatagrid>
    </div>
```

By default the component assumes that each item is a square and is responsive, or in other words each item's height is proportionally equal to it's width. If you need different aspect ratio, or your items have a fixed height in px, then you need to provide the [`itemHeight` property](#props).

The implementation of `fetchMoreItems` should look like this:

```js
export async function fetchMoreItems(offset, length) {
    const response = await fetch(`/api/path/to/resource?offset=${offset}&limit=${limit}`);
    const { items, total } = await response.json();
    // Append the new items to the existing data, maybe call a Redux action, etc.
    dispatch({ type: 'ADD_ITEMS', items, total });
}
```

**IMPORTANT: The data array must have the exact length of your total items.** The not-yet-requested items should be `undefined` or `null`. So you will have to ensure that your `data` array has the length of the `total` items and to replace the existing nullable entries with the freshly fetched ones:

```js
data = data.length
    ? [...data]
    : Array.from({ length: total });

data.splice(offset, items.length, ...items);
```

Checkout locally this repo and [start the example](#run-the-demo-locally) to get a clearer idea how to use the component.

## How it works

The component takes a couple of [required props](#props) in order to function. These are the "data" `Array`, "columns" `Number` and "children" `Function`. The component needs to know the grid size (# of columns). As a result, it calls back the render child function passing an "items" `Array` parameter which has limited # of items. An item is a data entry, but it can be also `undefined`. If `undefined`, this means that the current/initial set of items has been reached and additional portion of data needs to be loaded. In this case the component can show some loading indication, while the `VirtualDatagrid` component will call the "requestMore" `Function`. During scrolling the `VirtualDatagrid` component takes care to keep limited # of rendered items for best performance.

## Limitations

### Does not work with dynamic heights of items

Each item of your data must have equal height, either fixed in px or proportional to item's width.

## Props

| Name | Type | Required | Description | Default |
|---|---|---|---|---|
| data | `array` | yes | Array of items of type `Object`. Item structure can have any shape you need. **IMPORTANT: The data array must have the exact length of your total items.** The not-yet-requested items should be `undefined` or `null` | n/a |
| columns | `number` | yes | The size of the grid (# of columns) | n/a |
| requestMore | `func` | yes | Function that should be called back when another portion of items need to be loaded. Accepts 2 parameters: "offset" `Number` and "limit" `Number` | n/a |
| itemHeight | `number` | no | Fixed height of each item in px (`number`) or % of item's width (`string`). | `'100%'` |
| bucketSizeVh | `number` | no | The bucket size of items to be loaded in viewport height unit (e.g. `1` viewport height, `2` viewport heights, etc.) | `2` |
| bufferSizeVh | `number` | no | The buffer size of total rendered items in viewport height unit (e.g. `1` viewport height, `2` viewport heights, etc.) When scrolling down and showing N more items the component will destroy the first N items, and vice-versa, for memory efficience | `4` |
| intersectionMargin | `string` | no | Margin for the top and bottom `IntersectionObserver`s. Read more | `'40%'` |
| scrollableParent | `node` | no | If the scrollable container is a DOM element (e.g. `<div>`) and not the `window`, you must pass a reference to it in order for "intersectionMargin" to take effect | `null` |

## Run the demo locally

### Setup & run

Checkout this repo and run:

```bash
npm i
npm start
```

This will run a demo app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.

### Testing

TODO

### Building

To build the component for production to the `dist` folder:

```bash
npm run build
```

## TODO

    - Add tests
    - Make it work with dynamic item heights
