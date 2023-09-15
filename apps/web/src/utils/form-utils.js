/** Return the `FormFields` for an instrument */
export function extractFields(instrument) {
  if (Array.isArray(instrument.content)) {
    return instrument.content.reduce(function (accumulator, current) {
      return Object.assign(accumulator, current.fields);
    }, {});
  }
  return instrument.content;
}
export function formatDataAsString(data) {
  var lines = [];
  for (var key in data) {
    var value = data[key];
    if (Array.isArray(value)) {
      for (var i = 0; i < value.length; i++) {
        var record = value[i];
        for (var prop in record) {
          lines.push(
            ''
              .concat(prop, ' (')
              .concat(i + 1, '): ')
              .concat(record[prop])
          );
        }
      }
    } else {
      lines.push(''.concat(key, ': ').concat(value));
    }
  }
  return lines.join('\n') + '\n';
}
