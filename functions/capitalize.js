const symbols = ['!', '\'', '"', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '='];
const exceptions = ['the', 'a', 'an', 'and', 'but', 'for', 'or', 'nor', 'so', 'yet', 'at', 'by', 'from', 'in', 'into', 'near', 'of', 'on', 'to', 'with'];

String.prototype.capitalize = function() {
  let word_list = this.split(" ");
  let newstring = '';
  word_list.forEach(function(word){
    if (!exceptions.includes(word) || word_list[0] == word) {
      if (symbols.includes(word.charAt(0))) {
        word = word.charAt(0) + word.charAt(1).toUpperCase() + word.slice(2)
      } else {
        word = word.charAt(0).toUpperCase() + word.slice(1)
      }
    } else {
      word = word.toLowerCase();
    }
    newstring += word + ' '
  });
  return newstring.trim()
}
