import controller from '../../../helpers/controller';
import object2query from '../../../helpers/object2query';
import fetcher from '../../../helpers/fetcher';
import {store, connectToStore} from '../../../helpers/store';


export default function initDemoCode(el, options = {}) {
  const {id, url} = el.dataset;
  const dataEl = el.querySelector('.js-data');
  const dataFetcher = new fetcher(dataEl, {language: 'json'});

  const selectState = state => ({
    params: state.demo[id] && state.demo[id].params
  });

  connectToStore(selectState, ({params}={}) => {
    dataFetcher.fetch(url + '?type=json&clean=true&' + (params ? object2query(params) : ''));
  });
};

controller.add('DemoCode', initDemoCode);
