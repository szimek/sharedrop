import { helper as buildHelper } from '@ember/component/helper';

export default buildHelper(([leftSide, rightSide]) => leftSide === rightSide);
