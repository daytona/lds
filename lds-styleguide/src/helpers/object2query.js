export default function object2query(obj) {
  const queries = [];
  Object.keys(obj).forEach((key) => {
    queries.push(`${key}=${(typeof obj[key] === 'object' ?
                            JSON.stringify(obj[key], null, 0) :
                            obj[key])}`);
  });

  return encodeURI(queries.join('&').replace(/#/g, '%23'));
}
