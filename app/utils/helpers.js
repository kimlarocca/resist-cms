// format a date whose format is Sat Jan 20 2024 00:00:00 GMT-0500 (Eastern Standard Time) to mm/dd/yyyy
export const formatDate = (date) => {
    const dateObj = new Date(date)
    const month = dateObj.getMonth() + 1
    const day = dateObj.getDate()
    const year = dateObj.getFullYear()
    return month + '/' + day + '/' + year
}

// format a date whose format is 2024-06-21 to mm/dd/yyyy
export const formatDateFromSupabase = (date) => {
    const [year, month, day] = date.split('-')
    return `${ parseInt(month) }/${ parseInt(day) }/${ year }`
}

// function that formats a date to yyyy-mm-dd format
export const formatCalendarDate = (date) => {
    let formattedDate = new Date(date)
    formattedDate = formattedDate.toISOString().split('T')[0]
    return `${ formattedDate }T00:00:00`
}

// format a number to add commas if it's 1000 or more
export const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// function that checks if an object is empty
export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0
}