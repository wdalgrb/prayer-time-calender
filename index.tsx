
var providers = require('./provider')
var md5 = require("md5")
var fs = require('fs');

class CalenderClass {
    state = {
        eventData: "",
        calenderData: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Calendar Labs//Calendar 1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Pryers Times
TZID:Asia/Riyadh
TZURL:http://tzurl.org/zoneinfo/Asia/Riyadh
X-LIC-LOCATION:Asia/Riyadh`
    }
    componentDidMount() {
        this.getAllDates()
    }

    prayers = {
        "Fajr": "الفجر",
        "Sunrise": "الشروق",
        "Dhuhr": "الظهر",
        "Asr": "العصر",
        "Sunset": "الغروب",
        "Maghrib": "المغرب",
        "Isha": "العشاء",
        "Imsak": "الإمساك",
        "Midnight": "منتصف الليل",
    }
    monthes = ["12", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"]
    getAllDates = async () => {
        for (let index = 0; index < this.monthes.length; index++) {
            const month = this.monthes[index];
            await this.fetchData(month)
        }
        let calenderData = this.state.calenderData
        calenderData += this.state.eventData;
        calenderData += `
END:VCALENDAR`
        this.state.calenderData = calenderData
        this.createFile("calender-new.ics", calenderData);

    }
    fetchData = async (month) => {
        let request = await providers({
            type: "get",
            url: `https://api.aladhan.com/v1/calendar?latitude=24.822865&longitude=46.67116&method=4&month=${month}&year=2021&lang=ar`,
            // url: `https://api.aladhan.com/v1/calendar?latitude=16.691295&longitude=33.434940&method=4&month=12&year=2021&lang=ar`,
            fullUrl: true
        })
        if (!request.error) {
            let data = request.result.data
            this.createFile("calender-new.json", JSON.stringify(data));
            for (let itemIndex = 0; itemIndex < data.length; itemIndex++) {
                const element = data[itemIndex];
                let timings = element.timings
                let date = element.date
                let day = date.gregorian.day
                let month = date.gregorian.month?.number
                month = month < 10 ? `0${month}` : month
                let year = date.gregorian.year
                let DTSTART = `${year}${month}${day}`
                let DTEND = `${year}${month}${day}`
                let LOCATION = "Riyadh"
                let DESCRIPTION = `بقي ١٠ دقائق على الإقامة`
                let testDate = new Date();
                let DTSTAMP = testDate.toISOString()
                DTSTAMP = DTSTAMP.replace(/[-:\.]+/g, "")
                let eventData = this.state.eventData;
                for (let key in timings) {
                    if (key == "Sunset") {
                        continue
                    }
                    const time = timings[key].split(" ")[0];
                    // 20211130T184000
                    let timeArray = time.split(":")
                    let [hours, minutes] = timeArray
                    minutes = minutes * 1
                    minutes = minutes < 10 ? `0${minutes}` : minutes
                    let { newHour, newMinutes } = calender.calculateAddHours({ hour: hours, minutes });
               
                    let startingTime = `${DTSTART}T${hours}${minutes}00`
                    let endingTime = `${DTSTART}T${newHour}${newMinutes}00`
                    let SUMMARY = this.prayers[key] ? this.prayers[key] : ""
                    let uid = md5(Math.random())
                    let description = DESCRIPTION;
                    let zikrRes = await providers({
                        type: 'get',
                        fullUrl: true,
                        url: "https://azkar.ml/zekr?t=true"
                    })
                    if (!zikrRes.error) {
                        let zikrData = zikrRes.result
                        // zikrData  = zikrData.match(/(<h4)(.*)(?=\<\/h4\>)/)
                        zikrData = zikrData.replace(/[-:\.a-zA-z0-9<>\\=\/"'}{*.;,!}]+/g, "")
                        zikrData = zikrData.replace(/[ ]+/, " ")
                        zikrData = zikrData.replace(/[\n]+/g, "\\n")
                        zikrData = zikrData.replace(/(\\n \\n   \\n    \\n     \\n  \\n  \\n     \\n       \\n    \\n     \\n       \\n    \\n  \\n)+/g, "")
                        zikrData = zikrData.replace(/(\\n  \\n )+/g, "\\n")
                        zikrData = zikrData.trim()
                        description = zikrData;
                        console.log({zikrData} );
                    }

                    eventData += `
BEGIN:VEVENT
SUMMARY:${SUMMARY}
DTSTART;TZID=Asia/Riyadh;VALUE=DATE-TIME:${startingTime}
DTEND;TZID=Asia/Riyadh;VALUE=DATE-TIME:${endingTime}
LOCATION:${LOCATION}
DESCRIPTION:${description}
DTSTAMP:${DTSTAMP}
STATUS:CONFIRMED
RRULE:FREQ=YEARLY;WKST=SU;INTERVAL=1;
TRANSP:TRANSPARENT
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT0M
ACTION:DISPLAY
DESCRIPTION:Alarm
END:VALARM
END:VEVENT`
                }

                this.state.eventData = eventData
            }
        }
    }
    isComplete = () => {

    }
    createFile = (fileName, content) => {
        fs.writeFile('files/' + fileName, content, function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
    }
    calculateAddHours = ({ hour, minutes }) => {
        if (minutes > 55) {
            minutes = (minutes * 1) + 5
            minutes = minutes - 60
            minutes = minutes < 10 ? `0${minutes}` : minutes

            if (hour == 23) {
                hour = "00"
            } else if (hour == "00") {
                hour = "01"
            } else {
                hour = (hour * 1) + 1
                hour = hour < 10 ? `0${hour}` : hour
            }

        } else {
            minutes = (minutes * 1) + 5
            minutes = minutes < 10 ? `0${minutes}` : minutes
        }

        return { newHour: hour, newMinutes: minutes }
    }
}

const calender = new CalenderClass();
calender.getAllDates();


