/**
 *
 * @param {Date} lastExpenceAddedAt
 * @param {Number} repeats
 * @param {'day' | 'week' | 'month'} every
 * @returns {Date}
 */
function getNextExpenseDate(lastExpenceAddedAt, repeats, every) {
    const date = new Date(lastExpenceAddedAt);
    let returnDate;

    switch (every) {
        case 'day':
            returnDate = new Date(date.getTime() + repeats * 24 * 60 * 60 * 1000);
            break;
        case 'week':
            returnDate = new Date(date.getTime() + repeats * 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            let month = date.getMonth();

            let year = date.getFullYear();

            month += repeats;

            while (month > 11) {
                month -= 12;
                year++;
            }

            returnDate = new Date(year, month, 1);
            break;
        default:
            throw new Error('Invalid value for "every"');
    }

    return returnDate;
}

module.exports = { getNextExpenseDate };
