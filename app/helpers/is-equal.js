import { helper } from '@ember/component/helper';

export default helper(function([leftSide, rightSide]) {
  return leftSide === rightSide;
});
