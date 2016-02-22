import session from '../../session';

export default function* componentsPage (next) {
  const components = session.lds.components;

  yield this.render("styleguide:components", {components, layout: 'styleguide:default'});
}
