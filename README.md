# React Virtual Datagrid

Yet another Virtual Data component (a.k.a. Virtual Scroll, Virtual Window, Virtual List, Virtual Workspace, etc.). Many names but one functionality – virtually load huge set of data, simulating that the whole data is there, while a small initial set of it is only loaded. On demand, a new portion of the data is loaded and injected into the view. 

## Key features

Why you should choose React Virtual Datagrid over the many more out there?

 - Free DOM structure & styling
 - Does not care about scrollable container
 - Responsive
 - Easy to use
 - Modern (based on `IntersectionObserver`)

## How to use

### Installation

```bash
npm i --save react-virtual-datagrid
```

### Integration

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

## How it works

The component takes a couple of required props in order to function. These are the "data" `Array`, "columns" `Number` and "children" `Function`. The component needs to know the grid size (# of columns). As a result, it calls back the render child function passing an "items" `Array` parameter which has limited # of items. An item is a data entry, but it can be also `undefined`. If `undefined`, this means that the current/initial set of items has been reached and additional portion of data needs to be loaded. In this case the component can show some loading indication, while the `VirtualDatagrid` component will call the "requestMore" `Function`. During scrolling the `VirtualDatagrid` component takes care to keep limited # of rendered items for best performance.

## Props

| Prop name | Type | Required | Description | Default |
|---|---|---|---|---|
| data | `array` | yes | .. | .. |
| columns | `number` | yes | .. | .. |
| requestMore | `func` | yes | .. | .. |
| children | `func` | yes | .. | .. |
| bucketSizeVh | `number` | no | .. | .. |
| bufferSizeVh | `number` | no | .. | .. |
| intersectionMargin | `string` | no | .. | .. |
| scrollableParent | `node` | no | .. | .. |

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

Builds the component for production to the `dist` folder.
