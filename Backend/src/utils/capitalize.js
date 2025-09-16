export function capitalize(value = "") {
    if (typeof value !== "string") return;
    return value[0].toUpperCase() + value.slice(1).toLowerCase();
}
