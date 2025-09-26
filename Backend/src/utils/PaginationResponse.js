/**
 * Represents a standardized pagination response for APIs.
 *
 * @class PaginationResponse
 *
 * @param {number} totalDocuments - Total number of documents/items available.
 * @param {Array} currentData - The array of items for the current page.
 * @param {number} currentPage - The current page number (default: 1).
 * @param {number} limit - The number of items per page (default: 10).
 */
export class PaginationResponse {
    constructor(totalDocuments = 0, currentData = [], currentPage = 1, limit = 10) {
        const totalPages = Math.ceil(totalDocuments / limit);

        this.pagination = {
            page: currentPage,
            limit: limit,
            totalPages: totalPages,
            total: totalDocuments,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
            nextPage: currentPage < totalPages ? currentPage + 1 : null,
            prevPage: currentPage > 1 ? currentPage - 1 : null,
        };

        this.data = currentData;
    }
}

/**
 * current page = 5
 * total pages = 10
 * nextPage = 6
 * prevPage = 5
 */
