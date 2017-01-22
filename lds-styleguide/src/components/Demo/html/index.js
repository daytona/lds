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
    htmlFetcher.fetch(url + '?_type=html&_clean=true');
  });
}

controller.add('DemoHTML', initDemoHTML);
