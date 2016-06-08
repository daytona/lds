import controller from '../../../helpers/controller';
import object2query from '../../../helpers/object2query';
import fetcher from '../../../helpers/fetcher';
import {store, connectToStore} from '../../../helpers/store';

function initDemoHTML(el) {
  const {id, url} = el.dataset;
  const codeEl = el.querySelector('.js-code');
  const htmlFetcher = new fetcher(codeEl, {language: 'html'});
  const selectState = state => ({
    params: state.demo[id] && state.demo[id].params
  });

  connectToStore(selectState, ({params}={}) => {
    htmlFetcher.fetch(url + '?type=html&clean=true&' + object2query(params));
  });
}

controller.add('DemoHTML', initDemoHTML);
