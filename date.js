
let today = new Date();
let options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
}
let day = today.toLocaleDateString("en-US",options)
// CJS
exports.Day = day;
