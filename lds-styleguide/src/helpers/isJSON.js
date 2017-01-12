export default function isJSON(string) {
  var json = false;
  try {
    json = JSON.parse(string);
  } catch (err) {
    return false;
  }
  return json;
};
