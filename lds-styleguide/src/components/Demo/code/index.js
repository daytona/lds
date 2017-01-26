import controller from '../../../helpers/controller';
import object2query from '../../../helpers/object2query';
import fetcher from '../../../helpers/fetcher';
import {store, connectToStore} from '../../../helpers/store';


export default function initDemoCode(el, options = {}) {
  const {id, url, querystring} = el.dataset;
  const dataEl = el.querySelector('.js-data');
  const dataFetcher = new fetcher(dataEl, {language: 'json'});

  const selectState = state => ({
    params: state.demo[id] && state.demo[id].params
  });

  connectToStore(selectState, ({params}={}) => {
    dataFetcher.fetch(url + '?' + (querystring ? querystring + '&' : '') + '_type=json&_clean=true&_session=' + id);
  });
};

controller.add('DemoCode', initDemoCode);
