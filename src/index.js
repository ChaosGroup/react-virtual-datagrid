import React from 'react';
import ReactDOM from 'react-dom';

import reportWebVitals from './reportWebVitals';
import { fetchItems } from './api-mock';
import { VirtualDatagrid } from './lib';

import './index.css';

const GRID_SIZE = 3;

let items = [];

const requestMoreAndRender = async (offset, limit) => {
  const { total, items: newItems } = await fetchItems(offset, limit);
  items = items.length
    ? [...items]
    : Array.from({ length: total });

  items.splice(offset, newItems.length, ...newItems);
  render(items, total);
}

function render(items, total) {
  ReactDOM.render(
    <React.StrictMode>
      <div className="grid">
        <VirtualDatagrid
          data={items}
          columns={GRID_SIZE}
          requestMore={requestMoreAndRender}
        >
          {items =>
            items.map(item => (
              <div className="column" key={item?.id || Math.random()}>
                <div className="column-inner">
                  {item ? item.text : <img src="https://media4.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" alt="" />}
                </div>
              </div>
            ))
          }
        </VirtualDatagrid>
        {total === undefined && 'Loading...'}
        {total === 0 && 'No items to show.'}
      </div>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

render(items);

reportWebVitals(console.log);
