export const toMilliseconds = {
    seconds: (seconds = 0) => seconds * 1000,
    minutes: (minutes = 0) => minutes * 60 * 1000,
    hours: (hours = 0) => hours * 60 * 60 * 1000,
    days: (days = 0) => days * 24 * 60 * 60 * 1000,
};
