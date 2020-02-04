const symbols = ['!', '\'', '"', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=']

String.prototype.capitalize = function() {
  let word_list = this.split(" ")
  let newstring = ''
  word_list.forEach(function(word){
    if (symbols.includes(word.charAt(0))) {
      word = word.charAt(0) + word.charAt(1).toUpperCase() + word.slice(2)
    } else {
      word = word.charAt(0).toUpperCase() + word.slice(1)
    }
    newstring += word + ' '
  });
  return newstring.trim()
}
