import { helper as buildHelper } from '@ember/component/helper';

export default buildHelper(function([leftSide, rightSide]) {
  return leftSide === rightSide;
});
