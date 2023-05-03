const wordwrapString = str => {
  if (str.length > 50) {
    let start = Math.floor(str.length / 2)
    for (let i = start; i < str.length; i++) {
      if (str[i] == ' ') {
        let above = str.substr(0, i)
        let below = str.substr(i + 1)
        return above + '<br />' + below
      }
    }
  }
  return str
}

// Adjust top padding depending on number of line breaks in title.
const topPadding = str => {
  return 100 + (str.split('<br />').length - 3) * 20
}

export default {
  wordwrapString,
  topPadding,
}
