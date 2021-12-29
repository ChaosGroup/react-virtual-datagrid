const API_MIN_RESPONSE_TIME = 200 // the mock API will respond no earlier than ${API_MIN_RESPONSE_TIME}ms
const API_MAX_RESPONSE_TIME = 600 // the mock API will respond no later than ${API_MAX_RESPONSE_TIME}ms
const API_RESPONSE_TOTAL_ITEMS = 200 // total items. increase this in order to see the power of the Virtual Datagrid!

export function fetchItems(offset, length) {
    offset = Math.max(0, Math.min(offset, API_RESPONSE_TOTAL_ITEMS))
    length = Math.max(0, length)

    return new Promise(resolve => setTimeout(
        () => resolve({
            total: API_RESPONSE_TOTAL_ITEMS,
            items: Array.from({ length: Math.min(length, API_RESPONSE_TOTAL_ITEMS - offset) })
                .map((_, i) => ({
                    id: offset + i,
                    text: offset + i + 1,
                }))
        }),
        Math.random() * (API_MAX_RESPONSE_TIME - API_MIN_RESPONSE_TIME) + API_MIN_RESPONSE_TIME
    ))
}
