function convertStringToObject(text) {
  let splitText = text.split(/\d+- /)
  splitText.shift()

  let pointsArray = splitText.map((pointText, index) => {
    let percentage
  
    if(index === 3 || index === 4){
      let match = pointText.match(/\d+%/)
      if(match){
        percentage = match[0]
      }
    }
    return {
      text: pointText.replace(/\n/g, ''),
      percentage: percentage
    }
  })

  return pointsArray
}


module.exports = {
  convertStringToObject,
}