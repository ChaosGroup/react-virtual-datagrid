export const reduceData = ({ items, total, newItems, offset }) => {
    items = items.length
        ? [...items]
        : Array.from({ length: total });

    items.splice(offset, newItems.length, ...newItems);
    return items;
};
