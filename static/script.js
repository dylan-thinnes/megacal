var scriptStartTime = Date.now();

var toYYYYMMDD = (year, month, day) => 
    `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

var toHHMMSS = (hour, minute, second) => 
    `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;

var dateToYYYYMMDD = (d) =>
    toYYYYMMDD(d.getFullYear(), d.getMonth() + 1, d.getDate());

var dateToHHMMSS = (d) =>
    toHHMMSS(d.getHours(), d.getMinutes(), d.getSeconds());

var getTime = () => {
    var d = new Date();
    var text = "";
    text += dateToYYYYMMDD(d);
    text += " ";
    text += dateToHHMMSS(d);
    return text;
}

var timer = () => {
    document.getElementById("timer").innerHTML = getTime();
    setTimeout(timer, 10);
}

var monthDayCount = (year, month) => {
    var ref = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
    var count = ref[month];
    count += isLeap(year, month) ? 1 : 0;
    return count;
}

var isLeap = (year, month) =>
    (month == 1 && year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));

var buildCalendar = () => {
    var time = Date.now();
    var str = `
    <div id="calendar">
        ${genRange(2000,2100).map(year => `
        <div class="year">
            <div class="year-label">
                ${year.toString().split("").map(x => `<div>${x}</div>`).join("")}
            </div>
            ${genRange(1,12).map(month => `
            <div class="month">
                ${genRange(1,5).map(week => {
                var count = monthDayCount(year, month - 1);
                return `
                <div class="week">
                    ${genRange(1,7).map(dayOfWeek => {
                        var dayOfMonth = (week - 1) * 7 + dayOfWeek;

                        var classes = ["day"]

                        if (! (dayOfMonth <= count)) {
                            return `<span class="${classes.join(" ")}"></span>`
                        } else {
                            var id = toYYYYMMDD(year, month, dayOfMonth);
                            classes.push("day-active");

                            var timediff = Date.parse(id) - Date.now();
                            if (timediff > 0) {
                                classes.push("day-future");
                            } else if (timediff > -86400000) {
                                classes.push("day-current");
                            } else {
                                classes.push("day-past");
                            }

                            return `
                            <div 
                                id="${id}"
                                class="${classes.join(" ")}"
                                data-year="${year}"
                                data-month="${month}"
                                data-day="${dayOfMonth}"
                                data-week="${week}"
                                >
                            </div>
                            `
                        }
                    }).join("")}
                </div>
                `
                }).join("")}
            </div>
            `).join("")}
        </div>
        `).join("")}
    </div>
    `
    console.log(Date.now() - time)

    var time = Date.now();
    document.getElementById("calendar-container").innerHTML = str;
    console.log(Date.now() - time);

    /*
    var calendar = document.createElement("div");
    calendar.id = "calendar";

    var time = Date.now();
    for (var year = 2000; year < 2100; year++) {
        var yearEl = document.createElement("div");
        yearEl.classList.add("year");
        calendar.appendChild(yearEl);

        var yearLabel = document.createElement("div");
        yearLabel.classList.add("year-label");
        yearEl.appendChild(yearLabel);

        for (var c of year.toString().split("")) {
            var span = document.createElement("div");
            span.innerHTML = c;
            yearLabel.appendChild(span);
        }

        for (var month = 0; month < 12; month++) {
            var monthEl = document.createElement("div");
            monthEl.classList.add("month");
            yearEl.appendChild(monthEl);

            var realMonth = month + 1;

            var count = monthDayCount(year, month);
            for (var week = 0; week < 4 + 1; week++) {
                var weekEl = document.createElement("div");
                weekEl.classList.add("week");
                monthEl.appendChild(weekEl);

                var realWeek = week + 1;

                for (var day = 0; day < 7; day++) {
                    if (day + week * 7 < count) {
                        var dayEl = document.createElement("div");
                    } else {
                        var dayEl = document.createElement("span");
                    }

                    dayEl.classList.add("day");

                    var realDay = week * 7 + day + 1;

                    if (day + week * 7 < count) {
                        var id = toYYYYMMDD(year, realMonth, realDay);
                        dayEl.id = id;

                        var timediff = Date.parse(id) - Date.now();
                        if (timediff > 0) {
                            dayEl.classList.add("day-future");
                        } else if (timediff > -86400000) {
                            dayEl.classList.add("day-current");
                        } else {
                            dayEl.classList.add("day-past");
                        }

                        dayEl.classList.add("day-active");
                        dayEl.setAttribute("data-year", year);
                        dayEl.setAttribute("data-month", realMonth);
                        dayEl.setAttribute("data-day", realDay);
                        dayEl.setAttribute("data-week", realWeek);
                    }

                    weekEl.appendChild(dayEl);
                }
            }
        }
    }
    console.log(Date.now() - time);

    var time = Date.now();
    document.getElementById("calendar-container").appendChild(calendar);
    console.log(Date.now() - time);
    */
}

var currDateid = () => dateToYYYYMMDD(new Date());
var scrollToDatesYear = (dateid) => {
    var element = document.getElementById(dateid);
    var yearNode = element.parentNode.parentNode.parentNode;
    if (yearNode.previousElementSibling != null) {
        yearNode = yearNode.previousElementSibling;
    }
    yearNode.scrollIntoView()
}

buildCalendar();
var calListeners = {};
function addCalListenerRange (type, listener, ranges) {
    var range = combineRanges(ranges || {});

    for (date of range) addCalListener(type, listener, date);
}

function triggerCalListener (type, date) {
    var { year, month, day } = date;

    type  = def(calListeners, type, {});
    year  = def(type, year, {});
    month = def(year, month, {});
    day   = def(month, day, []);

    for (listener of day) listener(date); 
}

function addCalListener (type, listener, date) {
    var { year, month, day } = date;

    type  = def(calListeners, type, {});
    year  = def(type, year, {});
    month = def(year, month, {});
    day   = def(month, day, []);

    day.push(listener);
}

function def (obj, key, val) {
    if (obj[key] == null) {
        obj[key] = val;
    }

    return obj[key];
}

function combineRanges ({ year, month, day }) {
    ys = sanitizeInput(year, ranges["year"])
    ms = sanitizeInput(month, ranges["month"])
    ds = sanitizeInput(day, ranges["day"])

    var results = [];
    for (year of ys) {
        for (month of ms) {
            for (day of ds) {
                results.push({ year, month, day });
            }
        }
    }

    return results;
}

function genRange (low, upp) {
    var arr = new Array();
    while (low <= upp) {
        arr.push(low);
        low++;
    }
    return arr;
}

var ranges = {
    "year": genRange(2000, 2100),
    "month": genRange(1,12),
    "day": genRange(1,31),
    "week": genRange(1,7),
}

function sanitizeInput (value, range) {
    if (value instanceof Function) {
        return range.filter(value);
    } else if (value instanceof RegExp) {
        return range.filter(value.test);
    } else if (value instanceof Array) {
        return value;
    } else if (typeof value == "number") {
        return [value];
    } else if (value == null) {
        return range;
    } else {
        throw Error("Invalid sanitizable input.", value);
    }
}

var handleDayEvent = type => e => {
    var el = e.target;

    if (!el.classList.contains("day-active")) return;
    var year = parseInt(el.getAttribute("data-year"));
    var month = parseInt(el.getAttribute("data-month"));
    var day = parseInt(el.getAttribute("data-day"));

    triggerCalListener(type, { year, month, day });
}

document.getElementById("calendar").addEventListener("click", handleDayEvent("click"));
document.getElementById("calendar").addEventListener("mouseover", handleDayEvent("mouseover"));

addCalListenerRange("mouseover", ({ year, month, day }) => {
    var tooltip = document.getElementById("tooltip");
    var yyyymmdd = toYYYYMMDD(year, month, day);
    var date = new Date(yyyymmdd);
    var dayOfWeek = "Sun Mon Tue Wed Thu Fri Sat".split(" ")[date.getDay()];
    tooltip.innerHTML = `${yyyymmdd} (${dayOfWeek})`;
});

addCalListenerRange("click", ({ year, month, day }) => {
    var inspector = document.getElementById("inspector");
    inspector.innerHTML = "";

    {
        var title = document.createElement("div");
        title.classList.add("title")
        title.innerHTML = toYYYYMMDD(year, month, day);
        inspector.appendChild(title);
    }

    var notes = def(data,  "notes", {});
    var year  = def(notes, year,    {});
    var month = def(year,  month,   {});
    var day   = def(month, day,     {});
    var notes = def(day,   "notes", []);

    // Generate and append newNoteButton
    var newNoteButton = document.createElement("button");
    newNoteButton.classList.add("new-note")
    newNoteButton.innerHTML = "+ New Note";
    var addNote = () => {};
    newNoteButton.addEventListener("click", () => {
        var l = notes.push("");
        addNote(l);
    });
    inspector.appendChild(newNoteButton);

    addNote = (index) => {
        var note = notes[index];
        var noteEl = document.createElement("div");
        noteEl.classList.add("note");

        {
            var textarea = document.createElement("textarea");

            textarea.classList.add("notepad");
            textarea.value = note || "";
            textarea.style.resize = "none";
            textarea.addEventListener("change", e => {
                console.log("HELLO");
                notes[index] = textarea.value;
                saveData();
            });

            noteEl.appendChild(textarea);
        }

        {
            var deleteNote = document.createElement("button");

            deleteNote.classList.add("delete-note");
            deleteNote.innerHTML = "Delete";
            deleteNote.addEventListener("click", () => {
                notes.splice(index, 1);
                noteEl.parentNode.removeChild(noteEl);
                saveData();
            });

            noteEl.appendChild(deleteNote);
        }

        inspector.insertBefore(noteEl, newNoteButton);
    }

    notes.map((_, i) => addNote(i));

});

var data;

window.addEventListener("load", () => {
    console.log("Window loaded, initializing data.");
    console.log(Date.now() - scriptStartTime);
    setTimeout(() => scrollToDatesYear(currDateid()), 10);
    var handler = {
        set: (obj, prop, value) => {
            console.log("PROPERTY set", prop, value);
            obj[prop] = value;
        }
    }
    data = new Proxy(JSON.parse(localStorage.getItem("data") || "{}"), handler);
    runData();
});

function saveData () {
    localStorage.setItem("data", JSON.stringify(data));
}

var endofcentury = new Date(2100);

function runData () {
    if (data.birthday != null) {
        var { year, month, day } = data.birthday;
        while (year++ < 2100) {
            var id = toYYYYMMDD(year, month, day);
            var el = document.getElementById(id);
            if (el == null) continue;
            el.style.backgroundColor = "red";
        }
    }
}

